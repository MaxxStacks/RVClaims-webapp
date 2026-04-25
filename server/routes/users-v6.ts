// server/routes/users-v6.ts — Minimal v6 users helper (/api/v6/users)
// Used by ClaimQueuePage assignment dropdown (operator staff list).

import { Router } from "express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";

const router = Router();
router.use(requireAuth);

// GET /api/v6/users?role=operator_staff
router.get("/", async (req, res) => {
  const u = req.user!;
  if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const role = req.query.role as string;
  if (!role) return res.json([]);

  try {
    const rows = await db.select({
      id: users.id,
      firstName: users.firstName,
      lastName: users.lastName,
      email: users.email,
    }).from(users).where(and(
      sql`${users.roles}::jsonb @> ${JSON.stringify([role])}::jsonb`,
      eq(users.isActive, true),
    ));
    res.json(rows);
  } catch (err) {
    console.error("[users-v6 GET /]", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

export default router;
