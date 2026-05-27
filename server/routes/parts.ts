import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { partsOrders, partsOrderItems, claims, dealerships } from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { emitEvent } from "../lib/event-bus";

const router = Router();
router.use(requireAuth);

async function nextOrderNumber(): Promise<string> {
  const rows = await db.select({ n: partsOrders.orderNumber }).from(partsOrders);
  const max = rows.reduce((m, r) => {
    const n = parseInt((r.n || "").replace(/\D/g, ""), 10);
    return !isNaN(n) && n > m ? n : m;
  }, 0);
  return `PO-${String(max + 1).padStart(5, "0")}`;
}

// LIST parts orders (RBAC scoped, with optional claimId filter)
router.get("/", async (req: Request, res: Response) => {
  const u = req.user!;
  const { claimId: filterClaimId, dealershipId: filterDealershipId } = req.query as Record<string, string>;

  const DEALER_ROLES = ["dealer_owner", "dealer_staff", "parts_dept", "shop_manager", "service_manager"];

  let rows: any[];

  if (["operator_admin", "operator_staff"].includes(u.role)) {
    // Operators: all orders, optional claimId filter
    if (filterClaimId) {
      rows = await db.select().from(partsOrders)
        .where(eq(partsOrders.claimId, filterClaimId))
        .orderBy(desc(partsOrders.createdAt)).limit(200);
    } else if (filterDealershipId) {
      rows = await db.select().from(partsOrders)
        .where(eq(partsOrders.dealershipId, filterDealershipId))
        .orderBy(desc(partsOrders.createdAt)).limit(200);
    } else {
      rows = await db.select().from(partsOrders).orderBy(desc(partsOrders.createdAt)).limit(200);
    }
  } else if (DEALER_ROLES.includes(u.role) && u.dealershipId) {
    // Dealer-side roles: scoped to own dealership
    if (filterClaimId) {
      rows = await db.select().from(partsOrders)
        .where(and(
          eq(partsOrders.dealershipId, u.dealershipId),
          eq(partsOrders.claimId, filterClaimId),
        ))
        .orderBy(desc(partsOrders.createdAt));
    } else {
      rows = await db.select().from(partsOrders)
        .where(eq(partsOrders.dealershipId, u.dealershipId))
        .orderBy(desc(partsOrders.createdAt));
    }
  } else if (u.role === "client" && u.dealershipId) {
    // Clients: orders for their dealership (read-only — no create access)
    rows = await db.select().from(partsOrders)
      .where(eq(partsOrders.dealershipId, u.dealershipId))
      .orderBy(desc(partsOrders.createdAt));
  } else {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json(rows);
});

// GET single order with items
router.get("/:id", async (req: Request, res: Response) => {
  const [order] = await db.select().from(partsOrders).where(eq(partsOrders.id, req.params.id)).limit(1);
  if (!order) return res.status(404).json({ error: "Not found" });
  const items = await db.select().from(partsOrderItems).where(eq(partsOrderItems.orderId, order.id));
  res.json({ order, items });
});

// CREATE parts order
router.post("/", async (req: Request, res: Response) => {
  const u = req.user!;
  const CREATE_ROLES = ["operator_admin", "operator_staff", "dealer_owner", "dealer_staff", "parts_dept", "shop_manager", "service_manager"];
  if (!CREATE_ROLES.includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { claimId, items, supplier, dealershipId: dsIdInput, priority, dealerNotes, estimatedCost } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items required (array)" });
  }

  let dealershipId: string | null | undefined = u.dealershipId;

  // Operator can specify dealershipId explicitly
  if (["operator_admin", "operator_staff"].includes(u.role)) {
    if (dsIdInput) dealershipId = dsIdInput;
  }

  // Resolve from claim if provided
  if (claimId) {
    const [c] = await db.select().from(claims).where(eq(claims.id, claimId)).limit(1);
    if (c) {
      // Verify dealer-side user only accesses own dealership claims
      if (!["operator_admin", "operator_staff"].includes(u.role) && u.dealershipId && c.dealershipId !== u.dealershipId) {
        return res.status(403).json({ error: "Forbidden: claim belongs to a different dealership" });
      }
      dealershipId = c.dealershipId;
    }
  }

  if (!dealershipId) return res.status(400).json({ error: "dealershipId required" });

  const orderNumber = await nextOrderNumber();
  const totalQty = items.reduce((s: number, i: any) => s + (Number(i.quantity) || 1), 0);

  const [order] = await db.insert(partsOrders).values({
    orderNumber,
    dealershipId,
    claimId: claimId || null,
    supplier: supplier || null,
    priority: priority === "urgent" ? "urgent" : "normal",
    dealerNotes: dealerNotes || null,
    estimatedCost: estimatedCost ? String(estimatedCost) : null,
    status: "requested",
    totalQuantity: totalQty,
    initiatedById: u.id,
    initiatedAt: new Date(),
    items: "",
  }).returning();

  for (const it of items) {
    await db.insert(partsOrderItems).values({
      orderId: order.id,
      partNumber: it.partNumber || "MISC",
      description: it.description || null,
      quantity: Number(it.quantity) || 1,
      unitCost: it.unitCost ? String(it.unitCost) : null,
    });
  }

  const [dealership] = await db.select({ name: dealerships.name }).from(dealerships).where(eq(dealerships.id, dealershipId)).limit(1);

  await emitEvent({
    eventId: "parts.order_initiated",
    domain: "Parts",
    actorUserId: u.id,
    actorRole: u.role,
    dealershipId,
    targetEntityType: "parts_order",
    targetEntityId: order.id,
    payload: {
      orderNumber: order.orderNumber,
      itemCount: items.length,
      totalQuantity: totalQty,
      dealerName: dealership?.name || "Dealer",
      claimId,
    },
  });

  res.status(201).json(order);
});

// TRANSITION parts order status
router.post("/:id/transition", async (req: Request, res: Response) => {
  const u = req.user!;
  const { toStatus, supplierOrderRef, trackingNumber, carrier } = req.body;

  const [order] = await db.select().from(partsOrders).where(eq(partsOrders.id, req.params.id)).limit(1);
  if (!order) return res.status(404).json({ error: "Not found" });

  const updates: Record<string, any> = { status: toStatus, updatedAt: new Date() };
  let eventId: string | null = null;

  const isOperator = ["operator_admin", "operator_staff"].includes(u.role);
  const isDealerOwner = u.role === "dealer_owner";
  const isPartsManager = u.role === "parts_dept";

  if (toStatus === "sourcing") {
    if (!isOperator) return res.status(403).json({ error: "Forbidden" });
    eventId = null;
  } else if (toStatus === "submitted_to_supplier") {
    if (!isOperator) return res.status(403).json({ error: "Forbidden" });
    updates.submittedToSupplierAt = new Date();
    updates.supplierOrderRef = supplierOrderRef || null;
    eventId = "parts.order_submitted_supplier";
  } else if (toStatus === "supplier_ack") {
    if (!isOperator) return res.status(403).json({ error: "Forbidden" });
    updates.supplierAckAt = new Date();
    updates.supplierOrderRef = supplierOrderRef || null;
    eventId = "parts.supplier_ack";
  } else if (toStatus === "shipped") {
    if (!isOperator) return res.status(403).json({ error: "Forbidden" });
    updates.shippedAt = new Date();
    updates.trackingNumber = trackingNumber || null;
    updates.carrier = carrier || null;
    eventId = "parts.shipped";
  } else if (toStatus === "received") {
    // Operator, dealer_owner, or parts_dept can mark received
    if (!isOperator && !isDealerOwner && !isPartsManager) {
      return res.status(403).json({ error: "Forbidden" });
    }
    // Dealer-side: verify own dealership
    if (!isOperator && u.dealershipId && order.dealershipId !== u.dealershipId) {
      return res.status(403).json({ error: "Forbidden" });
    }
    updates.receivedAt = new Date();
    eventId = "parts.received";
  } else if (toStatus === "cancelled") {
    if (!isOperator && !isDealerOwner) return res.status(403).json({ error: "Forbidden" });
    eventId = null;
  } else {
    return res.status(400).json({ error: "Invalid status transition" });
  }

  await db.update(partsOrders).set(updates).where(eq(partsOrders.id, order.id));

  if (eventId) {
    const [dealership] = await db.select({ name: dealerships.name }).from(dealerships).where(eq(dealerships.id, order.dealershipId)).limit(1);
    await emitEvent({
      eventId,
      domain: "Parts",
      actorUserId: u.id,
      actorRole: u.role,
      dealershipId: order.dealershipId,
      targetEntityType: "parts_order",
      targetEntityId: order.id,
      payload: {
        orderNumber: order.orderNumber,
        dealerName: dealership?.name || "Dealer",
        trackingNumber,
        carrier,
        supplierOrderRef,
      },
    });
  }

  res.json({ ok: true });
});

export default router;
