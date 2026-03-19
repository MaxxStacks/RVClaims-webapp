// server/routes/products.ts — Products & Services catalog endpoints

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { products, insertProductSchema } from "@shared/schema";
import { eq, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireOperator, requireRole } from "../middleware/rbac";
import { validateBody } from "../middleware/validate";

const router = Router();

// ==================== GET /api/products ====================
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const category = req.query.category as string | undefined;
    const allProducts = await db
      .select()
      .from(products)
      .where(category ? eq(products.category, category as any) : undefined)
      .orderBy(products.name);

    res.json({ success: true, products: allProducts });
  } catch (error) {
    console.error("List products error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== POST /api/products ====================
router.post("/", requireAuth, requireRole("operator_admin"), validateBody(insertProductSchema), async (req: Request, res: Response) => {
  try {
    const [newProduct] = await db.insert(products).values(req.body).returning();
    res.status(201).json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Create product error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== PUT /api/products/:id ====================
router.put("/:id", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const [updated] = await db
      .update(products)
      .set(req.body)
      .where(eq(products.id, req.params.id))
      .returning();

    if (!updated) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, product: updated });
  } catch (error) {
    console.error("Update product error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ==================== DELETE /api/products/:id ====================
router.delete("/:id", requireAuth, requireRole("operator_admin"), async (req: Request, res: Response) => {
  try {
    const [deactivated] = await db
      .update(products)
      .set({ isActive: false })
      .where(eq(products.id, req.params.id))
      .returning();

    if (!deactivated) return res.status(404).json({ success: false, message: "Product not found" });
    res.json({ success: true, message: "Product deactivated" });
  } catch (error) {
    console.error("Delete product error:", error);
    res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
