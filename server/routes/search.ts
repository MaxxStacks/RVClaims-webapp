import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { dealerships, units, claims } from "@shared/schema";
import { ilike, or } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { requireOperator } from "../middleware/rbac";

const router = Router();

router.get("/", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const q = (req.query.q as string || "").trim();
    if (!q || q.length < 2) return res.json({ success: true, results: {} });

    const pattern = `%${q}%`;

    const [dealerResults, unitResults, claimResults] = await Promise.all([
      db
        .select({ id: dealerships.id, name: dealerships.name, city: dealerships.city, province: dealerships.province })
        .from(dealerships)
        .where(ilike(dealerships.name, pattern))
        .limit(5),

      db
        .select({ id: units.id, vin: units.vin, year: units.year, manufacturer: units.manufacturer, model: units.model })
        .from(units)
        .where(or(ilike(units.vin, pattern), ilike(units.manufacturer, pattern), ilike(units.model, pattern)))
        .limit(5),

      db
        .select({ id: claims.id, claimNumber: claims.claimNumber, type: claims.type, status: claims.status, manufacturer: claims.manufacturer })
        .from(claims)
        .where(or(ilike(claims.claimNumber, pattern), ilike(claims.manufacturer, pattern)))
        .limit(5),
    ]);

    res.json({
      success: true,
      results: {
        dealers: dealerResults,
        units: unitResults,
        claims: claimResults,
      },
    });
  } catch (error) {
    console.error("Search error:", error);
    res.status(500).json({ success: false, message: "Search failed" });
  }
});

export default router;
