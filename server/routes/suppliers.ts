// server/routes/suppliers.ts — Supplier Portal API routes

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  suppliers,
  supplierCatalogItems,
  supplierDealerConnections,
  supplierOrders,
  supplierOrderItems,
  notifications,
  users,
} from "@shared/schema";
import { eq, desc, and, ilike, or, gte, lte, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { OPERATOR_ROLES } from "@shared/constants";
import { generateSupplierOrderNumber } from "@shared/constants";
import { z } from "zod";

const router = Router();

const isOperator = (role: string) => OPERATOR_ROLES.includes(role as any);
const isDealer = (role: string) =>
  ["dealer_owner", "dealer_staff", "parts_dept"].includes(role);
const isSupplier = (role: string) => role === "supplier";

// ─────────────────────────────────────────────
// SUPPLIER SELF-MANAGEMENT
// ─────────────────────────────────────────────

// GET /api/suppliers/me
router.get("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSupplier(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, req.user!.id))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier profile not found" });

    res.json({ success: true, supplier });
  } catch (err) {
    console.error("GET /suppliers/me:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PATCH /api/suppliers/me
router.patch("/me", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSupplier(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [existing] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, req.user!.id))
      .limit(1);

    if (!existing)
      return res.status(404).json({ success: false, message: "Supplier profile not found" });

    const allowed = [
      "companyName", "contactName", "phone", "address", "city",
      "province", "country", "website", "description", "logoUrl",
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    updates.updatedAt = new Date();

    const [updated] = await db
      .update(suppliers)
      .set(updates)
      .where(eq(suppliers.id, existing.id))
      .returning();

    res.json({ success: true, supplier: updated });
  } catch (err) {
    console.error("PATCH /suppliers/me:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/suppliers/me/catalog
router.get("/me/catalog", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSupplier(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, req.user!.id))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    const items = await db
      .select()
      .from(supplierCatalogItems)
      .where(
        and(
          eq(supplierCatalogItems.supplierId, supplier.id),
          eq(supplierCatalogItems.isActive, true)
        )
      )
      .orderBy(desc(supplierCatalogItems.createdAt));

    res.json({ success: true, items });
  } catch (err) {
    console.error("GET /suppliers/me/catalog:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/suppliers/me/catalog
router.post("/me/catalog", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSupplier(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, req.user!.id))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    const schema = z.object({
      partNumber: z.string().min(1),
      name: z.string().min(1),
      description: z.string().optional(),
      category: z.string().optional(),
      manufacturer: z.string().optional(),
      price: z.string(),
      currency: z.string().optional(),
      inStock: z.boolean().optional(),
      stockQuantity: z.number().int().optional(),
      leadTimeDays: z.number().int().optional(),
      imageUrl: z.string().optional(),
    });

    const data = schema.parse(req.body);

    const [item] = await db
      .insert(supplierCatalogItems)
      .values({ ...data, supplierId: supplier.id, category: data.category as any })
      .returning();

    res.status(201).json({ success: true, item });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ success: false, errors: err.errors });
    console.error("POST /suppliers/me/catalog:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PATCH /api/suppliers/me/catalog/:id
router.patch("/me/catalog/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSupplier(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, req.user!.id))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    const [item] = await db
      .select()
      .from(supplierCatalogItems)
      .where(eq(supplierCatalogItems.id, req.params.id))
      .limit(1);

    if (!item || item.supplierId !== supplier.id)
      return res.status(404).json({ success: false, message: "Item not found" });

    const allowed = [
      "partNumber", "name", "description", "category", "manufacturer",
      "price", "currency", "inStock", "stockQuantity", "leadTimeDays", "imageUrl",
    ];
    const updates: Record<string, unknown> = {};
    for (const key of allowed) {
      if (req.body[key] !== undefined) updates[key] = req.body[key];
    }
    updates.updatedAt = new Date();

    const [updated] = await db
      .update(supplierCatalogItems)
      .set(updates)
      .where(eq(supplierCatalogItems.id, item.id))
      .returning();

    res.json({ success: true, item: updated });
  } catch (err) {
    console.error("PATCH /suppliers/me/catalog/:id:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// DELETE /api/suppliers/me/catalog/:id — soft delete (set isActive=false)
router.delete("/me/catalog/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSupplier(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, req.user!.id))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    const [item] = await db
      .select()
      .from(supplierCatalogItems)
      .where(eq(supplierCatalogItems.id, req.params.id))
      .limit(1);

    if (!item || item.supplierId !== supplier.id)
      return res.status(404).json({ success: false, message: "Item not found" });

    await db
      .update(supplierCatalogItems)
      .set({ isActive: false, updatedAt: new Date() })
      .where(eq(supplierCatalogItems.id, item.id));

    res.json({ success: true });
  } catch (err) {
    console.error("DELETE /suppliers/me/catalog/:id:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/suppliers/me/orders
router.get("/me/orders", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSupplier(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, req.user!.id))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    const orders = await db
      .select()
      .from(supplierOrders)
      .where(eq(supplierOrders.supplierId, supplier.id))
      .orderBy(desc(supplierOrders.createdAt));

    res.json({ success: true, orders });
  } catch (err) {
    console.error("GET /suppliers/me/orders:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/suppliers/me/orders/:id
router.get("/me/orders/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSupplier(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, req.user!.id))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    const [order] = await db
      .select()
      .from(supplierOrders)
      .where(and(eq(supplierOrders.id, req.params.id), eq(supplierOrders.supplierId, supplier.id)))
      .limit(1);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const items = await db
      .select()
      .from(supplierOrderItems)
      .where(eq(supplierOrderItems.orderId, order.id));

    res.json({ success: true, order, items });
  } catch (err) {
    console.error("GET /suppliers/me/orders/:id:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PATCH /api/suppliers/me/orders/:id/status
router.patch("/me/orders/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSupplier(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, req.user!.id))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    const [order] = await db
      .select()
      .from(supplierOrders)
      .where(and(eq(supplierOrders.id, req.params.id), eq(supplierOrders.supplierId, supplier.id)))
      .limit(1);

    if (!order)
      return res.status(404).json({ success: false, message: "Order not found" });

    const { status, trackingNumber, carrier, estimatedDelivery } = req.body;

    const validTransitions: Record<string, string[]> = {
      pending: ["confirmed", "cancelled"],
      confirmed: ["processing", "shipped", "cancelled"],
      processing: ["shipped", "cancelled"],
      shipped: ["delivered"],
    };

    if (!validTransitions[order.status ?? '']?.includes(status)) {
      return res.status(400).json({
        success: false,
        message: `Cannot transition from ${order.status} to ${status}`,
      });
    }

    if (status === "shipped" && (!trackingNumber || !carrier)) {
      return res.status(400).json({
        success: false,
        message: "trackingNumber and carrier are required when marking shipped",
      });
    }

    const updates: Record<string, unknown> = { status, updatedAt: new Date() };
    if (status === "confirmed") updates.confirmedAt = new Date();
    if (status === "shipped") {
      updates.shippedAt = new Date();
      updates.trackingNumber = trackingNumber;
      updates.carrier = carrier;
      if (estimatedDelivery) updates.estimatedDelivery = estimatedDelivery;
    }
    if (status === "delivered") updates.deliveredAt = new Date();

    const [updated] = await db
      .update(supplierOrders)
      .set(updates)
      .where(eq(supplierOrders.id, order.id))
      .returning();

    // Notify dealer users for this dealership
    const dealerUsers = await db
      .select({ id: users.id })
      .from(users)
      .where(
        and(
          eq(users.dealershipId, order.dealershipId),
          eq(users.role, "dealer_owner")
        )
      )
      .limit(5);

    for (const du of dealerUsers) {
      await db.insert(notifications).values({
        userId: du.id,
        type: "parts",
        title: `Order ${order.orderNumber} ${status}`,
        message: `Supplier order ${order.orderNumber} is now ${status}.`,
        linkTo: `/${order.dealershipId}/owner/parts`,
      });
    }

    res.json({ success: true, order: updated });
  } catch (err) {
    console.error("PATCH /suppliers/me/orders/:id/status:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/suppliers/me/dealers
router.get("/me/dealers", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isSupplier(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.userId, req.user!.id))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    const connections = await db
      .select()
      .from(supplierDealerConnections)
      .where(
        and(
          eq(supplierDealerConnections.supplierId, supplier.id),
          eq(supplierDealerConnections.status, "active")
        )
      );

    res.json({ success: true, connections });
  } catch (err) {
    console.error("GET /suppliers/me/dealers:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────
// SUPPLIER REGISTRATION (PUBLIC)
// ─────────────────────────────────────────────

// POST /api/suppliers/register
router.post("/register", async (req: Request, res: Response) => {
  try {
    const schema = z.object({
      companyName: z.string().min(2),
      contactName: z.string().optional(),
      email: z.string().email(),
      phone: z.string().optional(),
      address: z.string().optional(),
      city: z.string().optional(),
      province: z.string().optional(),
      country: z.string().optional(),
      website: z.string().optional(),
      description: z.string().optional(),
    });

    const data = schema.parse(req.body);

    // Check for existing supplier email
    const [existing] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.email, data.email))
      .limit(1);

    if (existing) {
      return res.status(409).json({ success: false, message: "A supplier with this email already exists" });
    }

    const [supplier] = await db
      .insert(suppliers)
      .values(data)
      .returning();

    res.status(201).json({ success: true, supplierId: supplier.id, message: "Registration submitted. Pending verification." });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ success: false, errors: err.errors });
    console.error("POST /suppliers/register:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────
// DEALER-FACING CATALOG BROWSING
// ─────────────────────────────────────────────

// GET /api/supplier-catalog — search verified suppliers
router.get("/catalog", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDealer(req.user!.role) && !isOperator(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const { q, category, supplierId, inStockOnly, currency } = req.query;

    // Get verified supplier IDs
    const verifiedSuppliers = await db
      .select({ id: suppliers.id, companyName: suppliers.companyName, logoUrl: suppliers.logoUrl })
      .from(suppliers)
      .where(eq(suppliers.verificationStatus, "verified"));

    const verifiedIds = verifiedSuppliers.map((s) => s.id);
    if (verifiedIds.length === 0) return res.json({ success: true, items: [], suppliers: [] });

    const conditions: any[] = [
      eq(supplierCatalogItems.isActive, true),
      inArray(supplierCatalogItems.supplierId, verifiedIds),
    ];

    if (q && typeof q === "string") {
      conditions.push(
        or(
          ilike(supplierCatalogItems.name, `%${q}%`),
          ilike(supplierCatalogItems.partNumber, `%${q}%`),
          ilike(supplierCatalogItems.description, `%${q}%`)
        )
      );
    }
    if (category && typeof category === "string") {
      conditions.push(eq(supplierCatalogItems.category, category as any));
    }
    if (supplierId && typeof supplierId === "string") {
      conditions.push(eq(supplierCatalogItems.supplierId, supplierId));
    }
    if (inStockOnly === "true") {
      conditions.push(eq(supplierCatalogItems.inStock, true));
    }
    if (currency && typeof currency === "string") {
      conditions.push(eq(supplierCatalogItems.currency, currency));
    }

    const items = await db
      .select()
      .from(supplierCatalogItems)
      .where(and(...conditions))
      .orderBy(supplierCatalogItems.name)
      .limit(200);

    // Attach supplier info
    const supplierMap = new Map(verifiedSuppliers.map((s) => [s.id, s]));
    const itemsWithSupplier = items.map((item) => ({
      ...item,
      supplier: supplierMap.get(item.supplierId) ?? null,
    }));

    res.json({ success: true, items: itemsWithSupplier, suppliers: verifiedSuppliers });
  } catch (err) {
    console.error("GET /supplier-catalog:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/supplier-catalog/:supplierId — single supplier catalog
router.get("/catalog/:supplierId", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDealer(req.user!.role) && !isOperator(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, req.params.supplierId))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    const items = await db
      .select()
      .from(supplierCatalogItems)
      .where(
        and(
          eq(supplierCatalogItems.supplierId, supplier.id),
          eq(supplierCatalogItems.isActive, true)
        )
      )
      .orderBy(supplierCatalogItems.name);

    res.json({ success: true, supplier, items });
  } catch (err) {
    console.error("GET /supplier-catalog/:supplierId:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// POST /api/supplier-orders — dealer places order
router.post("/orders/place", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDealer(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const schema = z.object({
      supplierId: z.string().uuid(),
      items: z.array(
        z.object({
          catalogItemId: z.string().uuid(),
          quantity: z.number().int().min(1),
        })
      ).min(1),
      shippingAddress: z.string().optional(),
    });

    const data = schema.parse(req.body);
    const dealershipId = req.user!.dealershipId;
    if (!dealershipId)
      return res.status(400).json({ success: false, message: "No dealership associated" });

    // Verify supplier is verified
    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(and(eq(suppliers.id, data.supplierId), eq(suppliers.verificationStatus, "verified")))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found or not verified" });

    // Fetch all catalog items
    const catalogItemIds = data.items.map((i) => i.catalogItemId);
    const catalogItems = await db
      .select()
      .from(supplierCatalogItems)
      .where(and(inArray(supplierCatalogItems.id, catalogItemIds), eq(supplierCatalogItems.isActive, true)));

    if (catalogItems.length !== data.items.length)
      return res.status(400).json({ success: false, message: "One or more catalog items not found" });

    // Count existing orders for SO number
    let orderCount = 0;
    try {
      const countResult = await db.execute<{ count: number }>(
        `SELECT COUNT(*) as count FROM supplier_orders` as any
      );
      const rows = Array.isArray(countResult) ? countResult : (countResult as any).rows ?? [];
      orderCount = Number(rows[0]?.count ?? 0);
    } catch { orderCount = 0; }

    const orderNumber = generateSupplierOrderNumber(orderCount + 1);

    // Calculate total
    let totalAmount = 0;
    const itemMap = new Map(catalogItems.map((ci) => [ci.id, ci]));
    const orderItemsData = data.items.map((di) => {
      const ci = itemMap.get(di.catalogItemId)!;
      const unitPrice = parseFloat(ci.price);
      const totalPrice = unitPrice * di.quantity;
      totalAmount += totalPrice;
      return {
        catalogItemId: di.catalogItemId,
        quantity: di.quantity,
        unitPrice: String(unitPrice),
        totalPrice: String(totalPrice),
      };
    });

    const currency = catalogItems[0]?.currency ?? "CAD";

    const [order] = await db
      .insert(supplierOrders)
      .values({
        supplierId: data.supplierId,
        dealershipId,
        orderNumber,
        totalAmount: String(totalAmount),
        currency,
        shippingAddress: data.shippingAddress,
      })
      .returning();

    await db.insert(supplierOrderItems).values(
      orderItemsData.map((oi) => ({ ...oi, orderId: order.id }))
    );

    // Notify supplier user (if linked)
    if (supplier.userId) {
      await db.insert(notifications).values({
        userId: supplier.userId,
        type: "parts",
        title: `New Order ${orderNumber}`,
        message: `A dealer has placed order ${orderNumber}.`,
        linkTo: `/supplier/orders/${order.id}`,
      });
    }

    // Create dealer-supplier connection if not exists
    const [conn] = await db
      .select()
      .from(supplierDealerConnections)
      .where(
        and(
          eq(supplierDealerConnections.supplierId, data.supplierId),
          eq(supplierDealerConnections.dealershipId, dealershipId)
        )
      )
      .limit(1);

    if (!conn) {
      await db.insert(supplierDealerConnections).values({
        supplierId: data.supplierId,
        dealershipId,
        status: "active",
      });
    }

    res.status(201).json({ success: true, orderId: order.id, orderNumber });
  } catch (err) {
    if (err instanceof z.ZodError)
      return res.status(400).json({ success: false, errors: err.errors });
    console.error("POST /supplier-orders/place:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/supplier-orders/mine — dealer's placed orders
router.get("/orders/mine", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isDealer(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const dealershipId = req.user!.dealershipId;
    if (!dealershipId)
      return res.status(400).json({ success: false, message: "No dealership associated" });

    const orders = await db
      .select()
      .from(supplierOrders)
      .where(eq(supplierOrders.dealershipId, dealershipId))
      .orderBy(desc(supplierOrders.createdAt));

    res.json({ success: true, orders });
  } catch (err) {
    console.error("GET /supplier-orders/mine:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ─────────────────────────────────────────────
// OPERATOR MANAGEMENT
// ─────────────────────────────────────────────

// GET /api/suppliers — list all (operator_admin)
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isOperator(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const rows = await db
      .select()
      .from(suppliers)
      .orderBy(desc(suppliers.createdAt));

    res.json({ success: true, suppliers: rows });
  } catch (err) {
    console.error("GET /suppliers:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/suppliers/stats
router.get("/stats", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isOperator(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const allSuppliers = await db.select().from(suppliers);
    const allOrders = await db.select().from(supplierOrders);

    const totalSuppliers = allSuppliers.length;
    const verifiedSuppliers = allSuppliers.filter((s) => s.verificationStatus === "verified").length;
    const totalOrders = allOrders.length;
    const pendingOrders = allOrders.filter((o) => o.status === "pending").length;

    res.json({ success: true, stats: { totalSuppliers, verifiedSuppliers, totalOrders, pendingOrders } });
  } catch (err) {
    console.error("GET /suppliers/stats:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// GET /api/suppliers/:id — single supplier (operator)
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    if (!isOperator(req.user!.role))
      return res.status(403).json({ success: false, message: "Forbidden" });

    const [supplier] = await db
      .select()
      .from(suppliers)
      .where(eq(suppliers.id, req.params.id))
      .limit(1);

    if (!supplier)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    const catalogItems = await db
      .select()
      .from(supplierCatalogItems)
      .where(eq(supplierCatalogItems.supplierId, supplier.id))
      .limit(50);

    const recentOrders = await db
      .select()
      .from(supplierOrders)
      .where(eq(supplierOrders.supplierId, supplier.id))
      .orderBy(desc(supplierOrders.createdAt))
      .limit(10);

    res.json({ success: true, supplier, catalogItems, recentOrders });
  } catch (err) {
    console.error("GET /suppliers/:id:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// PATCH /api/suppliers/:id/verify — operator sets verificationStatus
router.patch("/:id/verify", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user!.role !== "operator_admin")
      return res.status(403).json({ success: false, message: "Forbidden" });

    const { verificationStatus } = req.body;
    const allowed = ["verified", "rejected", "suspended", "pending"];
    if (!allowed.includes(verificationStatus))
      return res.status(400).json({ success: false, message: "Invalid status" });

    const [updated] = await db
      .update(suppliers)
      .set({ verificationStatus, updatedAt: new Date() })
      .where(eq(suppliers.id, req.params.id))
      .returning();

    if (!updated)
      return res.status(404).json({ success: false, message: "Supplier not found" });

    res.json({ success: true, supplier: updated });
  } catch (err) {
    console.error("PATCH /suppliers/:id/verify:", err);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
