// server/routes/invoices.ts — Invoice management endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { invoices, invoiceLineItems, insertInvoiceSchema, insertInvoiceLineItemSchema } from "@shared/schema";
import { eq, and, desc, sum, count } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { scopeToDealership, canAccessDealership, requireRole } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";
import { generateInvoiceNumber, OPERATOR_ROLES } from "@shared/constants";
import { notifyInvoiceIssued } from "../lib/notifications";
import { z } from "zod";

const router = Router();

// ==================== GET /api/invoices ====================
router.get("/", requireAuth, scopeToDealership, async (req: Request, res: Response) => {
  try {
    // Clients have no access to financial/invoice data
    if (req.user!.role === "client") {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    const conditions = [];
    if (req.scopedDealershipId) conditions.push(eq(invoices.dealershipId, req.scopedDealershipId));
    if (req.query.status) conditions.push(eq(invoices.status, req.query.status as any));

    const items = await db.select().from(invoices).where(conditions.length ? and(...conditions) : undefined).orderBy(desc(invoices.createdAt));
    res.json({ success: true, invoices: items });
  } catch (error) {
    console.error("List invoices error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/invoices ====================
const createInvoiceSchema = z.object({
  dealershipId: z.string().uuid(),
  claimId: z.string().uuid().optional(),
  subtotal: z.string(),
  taxRate: z.string().optional(),
  taxAmount: z.string().optional(),
  discount: z.string().optional(),
  total: z.string(),
  paymentMethod: z.string().optional(),
  paymentTerms: z.string().optional(),
  notes: z.string().optional(),
  recurring: z.string().optional(),
  dueDate: z.string().optional(),
  lineItems: z.array(z.object({
    productId: z.string().uuid().optional(),
    description: z.string(),
    quantity: z.string().optional(),
    unitPrice: z.string(),
    amount: z.string(),
    sortOrder: z.number().optional(),
  })),
});

router.post("/", requireAuth, requireRole("operator_admin"), validateBody(createInvoiceSchema), async (req: Request, res: Response) => {
  try {
    const { lineItems, ...invoiceData } = req.body;
    const invoiceNumber = generateInvoiceNumber();

    const [newInvoice] = await db
      .insert(invoices)
      .values({ ...invoiceData, invoiceNumber, status: "draft" })
      .returning();

    // Insert line items
    if (lineItems && lineItems.length > 0) {
      await db.insert(invoiceLineItems).values(
        lineItems.map((item: any, idx: number) => ({
          invoiceId: newInvoice.id,
          ...item,
          sortOrder: item.sortOrder ?? idx,
        }))
      );
    }

    res.status(201).json({ success: true, invoice: newInvoice });
  } catch (error) {
    console.error("Create invoice error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== GET /api/invoices/:id ====================
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    if (req.user!.role === "client") {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    const [invoice] = await db.select().from(invoices).where(eq(invoices.id, req.params.id)).limit(1);
    if (!invoice) return res.status(404).json({ success: false, message: "Invoice not found" });
    if (!canAccessDealership(invoice.dealershipId, req.user)) return res.status(403).json({ success: false, message: "Access denied" });

    const items = await db.select().from(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, invoice.id)).orderBy(invoiceLineItems.sortOrder);
    res.json({ success: true, invoice, lineItems: items });
  } catch (error) {
    console.error("Get invoice error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PUT /api/invoices/:id ====================
router.put("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(invoices).where(eq(invoices.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Invoice not found" });

    // Only operators can edit invoices
    if (!OPERATOR_ROLES.includes(req.user!.role as any)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    const [updated] = await db.update(invoices).set({ ...req.body, updatedAt: new Date() }).where(eq(invoices.id, req.params.id)).returning();
    res.json({ success: true, invoice: updated });
  } catch (error) {
    console.error("Update invoice error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PATCH /api/invoices/:id ====================
router.patch("/:id", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(invoices).where(eq(invoices.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Invoice not found" });

    const updates: Record<string, any> = { updatedAt: new Date() };
    const allowed = ["status", "notes", "paidAt", "dueDate", "paymentMethod", "paymentTerms"];
    for (const key of allowed) {
      if (key in req.body) updates[key] = req.body[key];
    }
    // When marking paid, set paidAt automatically if not provided
    if (req.body.status === "paid" && !req.body.paidAt) {
      updates.paidAt = new Date();
    }

    const [updated] = await db.update(invoices).set(updates).where(eq(invoices.id, req.params.id)).returning();
    res.json({ success: true, invoice: updated });
  } catch (error) {
    console.error("Patch invoice error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== DELETE /api/invoices/:id ====================
router.delete("/:id", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const [existing] = await db.select().from(invoices).where(eq(invoices.id, req.params.id)).limit(1);
    if (!existing) return res.status(404).json({ success: false, message: "Invoice not found" });
    if (existing.status !== "draft") {
      return res.status(400).json({ success: false, message: "Only draft invoices can be deleted" });
    }
    await db.delete(invoiceLineItems).where(eq(invoiceLineItems.invoiceId, req.params.id));
    await db.delete(invoices).where(eq(invoices.id, req.params.id));
    res.json({ success: true, message: "Invoice deleted" });
  } catch (error) {
    console.error("Delete invoice error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/invoices/:id/send ====================
router.post("/:id/send", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(invoices)
      .set({ status: "sent", issuedAt: new Date(), updatedAt: new Date() })
      .where(eq(invoices.id, req.params.id))
      .returning();

    if (!updated) return res.status(404).json({ success: false, message: "Invoice not found" });

    await notifyInvoiceIssued({
      invoiceNumber: updated.invoiceNumber,
      total: updated.total,
      currency: updated.currency || "CAD",
      dueDate: updated.dueDate || undefined,
      dealershipId: updated.dealershipId,
    });

    res.json({ success: true, invoice: updated });
  } catch (error) {
    console.error("Send invoice error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
