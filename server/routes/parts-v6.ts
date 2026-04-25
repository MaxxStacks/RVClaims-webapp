import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { partsOrders, partsOrderItems, claims, dealerships } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
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

// LIST parts orders (RBAC scoped)
router.get("/", async (req: Request, res: Response) => {
  const u = req.user!;
  let rows;
  if (["operator_admin", "operator_staff"].includes(u.role)) {
    rows = await db.select().from(partsOrders).orderBy(desc(partsOrders.createdAt)).limit(200);
  } else if (["dealer_owner", "dealer_staff"].includes(u.role) && u.dealershipId) {
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
  if (!["operator_admin", "operator_staff", "dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { claimId, items, supplier, dealershipId: dsIdInput } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items required (array)" });
  }

  let dealershipId = u.dealershipId;
  if (!dealershipId && dsIdInput) dealershipId = dsIdInput;
  if (claimId) {
    const [c] = await db.select().from(claims).where(eq(claims.id, claimId)).limit(1);
    if (c) dealershipId = c.dealershipId;
  }
  if (!dealershipId) return res.status(400).json({ error: "dealershipId required" });

  const orderNumber = await nextOrderNumber();
  const totalQty = items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);

  const [order] = await db.insert(partsOrders).values({
    orderNumber,
    dealershipId,
    claimId: claimId || null,
    supplier: supplier || null,
    status: "initiated",
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
      quantity: it.quantity || 1,
      unitCost: it.unitCost || null,
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

  if (toStatus === "submitted_to_supplier") {
    if (!["operator_admin", "operator_staff"].includes(u.role)) return res.status(403).json({ error: "Forbidden" });
    updates.submittedToSupplierAt = new Date();
    updates.supplierOrderRef = supplierOrderRef || null;
    eventId = "parts.order_submitted_supplier";
  } else if (toStatus === "supplier_ack") {
    updates.supplierAckAt = new Date();
    eventId = "parts.supplier_ack";
  } else if (toStatus === "shipped") {
    updates.shippedAt = new Date();
    updates.trackingNumber = trackingNumber || null;
    updates.carrier = carrier || null;
    eventId = "parts.shipped";
  } else if (toStatus === "received") {
    updates.receivedAt = new Date();
    eventId = "parts.received";
  } else if (toStatus === "cancelled") {
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
