// server/routes/work-orders.ts — TechFlow work order management
//
// Schema tables: workOrders, workOrderLabor, technicians, units, claims, dealerships
// Mount: app.use('/api/work-orders', workOrdersRouter)
//
// Endpoints:
//   GET    /api/work-orders                 — list (role-scoped)
//   GET    /api/work-orders/technicians     — list available technicians
//   GET    /api/work-orders/:id             — single WO + labor entries
//   POST   /api/work-orders                 — create
//   PATCH  /api/work-orders/:id             — update
//   PATCH  /api/work-orders/:id/status      — tech status update
//   POST   /api/work-orders/:id/time        — log time entry

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  workOrders,
  workOrderLabor,
  technicians,
  users,
} from "@shared/schema";
import { eq, desc, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { OPERATOR_ROLES } from "@shared/constants";
import { createNotification } from "../utils/notifications";

const router = Router();

function isOperator(role: string) {
  return OPERATOR_ROLES.includes(role as any);
}

function generateWONumber(): string {
  const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0");
  return `WO-${seq}`;
}

// ==================== LIST TECHNICIANS ====================

// GET /api/work-orders/technicians?dealershipId=...
// Must be before /:id to avoid route collision
router.get("/technicians", requireAuth, async (req: Request, res: Response) => {
  try {
    const { dealershipId } = req.query;
    const role = req.user!.role as string;

    let rows: (typeof technicians.$inferSelect)[];
    if (isOperator(role)) {
      rows = await db.select().from(technicians).orderBy(technicians.createdAt);
    } else if (dealershipId) {
      rows = await db.select().from(technicians)
        .where(eq(technicians.dealershipId, dealershipId as string))
        .orderBy(technicians.createdAt);
    } else {
      rows = [];
    }

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to load technicians" });
  }
});

// ==================== LIST WORK ORDERS ====================

// GET /api/work-orders?dealershipId=...&status=...&techId=...
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    const { dealershipId, status, techId } = req.query;

    let rows: (typeof workOrders.$inferSelect)[];

    if (isOperator(role)) {
      rows = await db.select().from(workOrders).orderBy(desc(workOrders.createdAt));
    } else if (role === "technician") {
      const techRecord = await db.select().from(technicians)
        .where(eq(technicians.userId, req.user!.id))
        .limit(1);
      if (!techRecord[0]) return res.json([]);
      rows = await db.select().from(workOrders)
        .where(eq(workOrders.assignedTechId, techRecord[0].id))
        .orderBy(desc(workOrders.scheduledFor));
    } else {
      const did = (dealershipId as string) || req.user!.dealershipId;
      if (!did) return res.json([]);
      rows = await db.select().from(workOrders)
        .where(eq(workOrders.dealershipId, did))
        .orderBy(desc(workOrders.createdAt));
    }

    if (status) rows = rows.filter((w) => w.status === status);
    if (techId) rows = rows.filter((w) => w.assignedTechId === techId);

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to load work orders" });
  }
});

// ==================== SINGLE WORK ORDER ====================

// GET /api/work-orders/:id
router.get("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const [wo] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
    if (!wo) return res.status(404).json({ message: "Work order not found" });

    const role = req.user!.role as string;
    if (!isOperator(role) && role !== "technician") {
      const did = req.user!.dealershipId;
      if (did && wo.dealershipId !== did) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const labor = await db.select().from(workOrderLabor)
      .where(eq(workOrderLabor.workOrderId, id))
      .orderBy(desc(workOrderLabor.createdAt));

    res.json({ ...wo, labor });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to load work order" });
  }
});

// ==================== CREATE WORK ORDER ====================

// POST /api/work-orders
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    const allowed = ["operator_admin", "operator_staff", "dealer_owner", "service_manager", "shop_manager"];
    if (!isOperator(role) && !allowed.includes(role)) {
      return res.status(403).json({ message: "Not authorized to create work orders" });
    }

    const {
      dealershipId,
      unitId,
      claimId,
      customerId,
      assignedTechId,
      notes,
      scheduledFor,
      laborEstimateHours,
      partsNeeded,
    } = req.body;

    if (!unitId) return res.status(400).json({ message: "unitId is required" });

    const did = dealershipId || req.user!.dealershipId;
    if (!did) return res.status(400).json({ message: "dealershipId is required" });

    const [created] = await db.insert(workOrders).values({
      workOrderNumber: generateWONumber(),
      dealershipId: did,
      unitId,
      claimId: claimId || null,
      customerId: customerId || null,
      assignedTechId: assignedTechId || null,
      status: assignedTechId ? "assigned" : "unassigned",
      notes: notes || null,
      scheduledFor: scheduledFor ? new Date(scheduledFor) : null,
      laborEstimateHours: laborEstimateHours || null,
      partsNeeded: partsNeeded || [],
    }).returning();

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to create work order" });
  }
});

// ==================== UPDATE WORK ORDER ====================

// PATCH /api/work-orders/:id
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.user!.role as string;

    const [existing] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
    if (!existing) return res.status(404).json({ message: "Work order not found" });

    if (!isOperator(role)) {
      const did = req.user!.dealershipId;
      if (did && existing.dealershipId !== did) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const allowed = ["operator_admin", "operator_staff", "dealer_owner", "service_manager", "shop_manager"];
    if (!isOperator(role) && !allowed.includes(role)) {
      return res.status(403).json({ message: "Not authorized to update work orders" });
    }

    const {
      assignedTechId, notes, scheduledFor, laborEstimateHours,
      partsNeeded, status, techNotes,
    } = req.body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (assignedTechId !== undefined) updateData.assignedTechId = assignedTechId;
    if (notes !== undefined) updateData.notes = notes;
    if (techNotes !== undefined) updateData.techNotes = techNotes;
    if (scheduledFor !== undefined) updateData.scheduledFor = scheduledFor ? new Date(scheduledFor) : null;
    if (laborEstimateHours !== undefined) updateData.laborEstimateHours = laborEstimateHours;
    if (partsNeeded !== undefined) updateData.partsNeeded = partsNeeded;
    if (status !== undefined) updateData.status = status;

    const [updated] = await db.update(workOrders).set(updateData).where(eq(workOrders.id, id)).returning();

    // Notify technician when WO is newly assigned
    if (assignedTechId && assignedTechId !== existing.assignedTechId) {
      const [tech] = await db.select().from(technicians).where(eq(technicians.id, assignedTechId)).limit(1);
      if (tech?.userId) {
        await createNotification(
          tech.userId, "system",
          "Work Order Assigned",
          `Work order ${updated.workOrderNumber} has been assigned to you.`,
          `/dealer/techflow/${id}`
        );
      }
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update work order" });
  }
});

// ==================== TECH STATUS UPDATE ====================

// PATCH /api/work-orders/:id/status
// Simple status transition for technicians — big button taps
router.patch("/:id/status", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status, techNotes } = req.body;
    const role = req.user!.role as string;

    if (!status) return res.status(400).json({ message: "status is required" });

    const [existing] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
    if (!existing) return res.status(404).json({ message: "Work order not found" });

    // Technicians can only update their own WOs
    if (role === "technician") {
      const techRecord = await db.select().from(technicians)
        .where(eq(technicians.userId, req.user!.id))
        .limit(1);
      if (!techRecord[0] || existing.assignedTechId !== techRecord[0].id) {
        return res.status(403).json({ message: "Not assigned to this work order" });
      }
    }

    const updateData: Record<string, any> = { status, updatedAt: new Date() };
    if (techNotes !== undefined) updateData.techNotes = techNotes;

    if (status === "arrived") updateData.arrivedAt = new Date();
    if (status === "in_progress" && !existing.startedAt) updateData.startedAt = new Date();
    if (status === "completed") updateData.completedAt = new Date();

    const [updated] = await db.update(workOrders).set(updateData).where(eq(workOrders.id, id)).returning();

    // Notify dealership managers when WO is completed
    if (status === "completed" && existing.dealershipId) {
      const dealerUsers = await db
        .select({ id: users.id, role: users.role })
        .from(users)
        .where(and(eq(users.dealershipId, existing.dealershipId), eq(users.isActive, true)));
      const notifyRoles = ["dealer_owner", "service_manager", "shop_manager"];
      for (const u of dealerUsers.filter(u => notifyRoles.includes(u.role))) {
        await createNotification(
          u.id, "system",
          "Work Order Completed",
          `Work order ${existing.workOrderNumber} has been marked complete.`,
          `/dealer/owner/techflow/${id}`
        );
      }
    }

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update status" });
  }
});

// ==================== LOG TIME ENTRY ====================

// POST /api/work-orders/:id/time
router.post("/:id/time", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.user!.role as string;

    const [existing] = await db.select().from(workOrders).where(eq(workOrders.id, id)).limit(1);
    if (!existing) return res.status(404).json({ message: "Work order not found" });

    const { description, hours, hourlyRate, performedAt } = req.body;
    if (!description || !hours) {
      return res.status(400).json({ message: "description and hours are required" });
    }

    // Find tech ID — either passed directly or looked up from current user
    let techId = req.body.techId;
    if (!techId && role === "technician") {
      const techRecord = await db.select().from(technicians)
        .where(eq(technicians.userId, req.user!.id))
        .limit(1);
      if (techRecord[0]) techId = techRecord[0].id;
    }
    if (!techId) return res.status(400).json({ message: "techId is required" });

    const [entry] = await db.insert(workOrderLabor).values({
      workOrderId: id,
      techId,
      description,
      hours: String(hours),
      hourlyRate: hourlyRate ? String(hourlyRate) : null,
      performedAt: performedAt ? new Date(performedAt) : new Date(),
    }).returning();

    // Update actual hours total
    const allLabor = await db.select().from(workOrderLabor).where(eq(workOrderLabor.workOrderId, id));
    const totalHours = allLabor.reduce((sum, l) => sum + parseFloat(l.hours || "0"), 0);
    await db.update(workOrders)
      .set({ laborActualHours: String(totalHours), updatedAt: new Date() })
      .where(eq(workOrders.id, id));

    res.status(201).json(entry);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to log time entry" });
  }
});

export default router;
