// server/routes/service-appointments.ts — TechFlow service appointment management
//
// Schema tables: serviceAppointments, workOrders, dealerships
// Mount: app.use('/api/service-appointments', serviceApptRouter)
//
// Endpoints:
//   GET    /api/service-appointments             — list (role-scoped)
//   POST   /api/service-appointments             — create
//   PATCH  /api/service-appointments/:id         — update status / confirm date
//   DELETE /api/service-appointments/:id         — cancel

import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { serviceAppointments, workOrders } from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { OPERATOR_ROLES } from "@shared/constants";

const router = Router();

function isOperator(role: string) {
  return OPERATOR_ROLES.includes(role as any);
}

function generateApptNumber(): string {
  const seq = String(Math.floor(Math.random() * 99999) + 1).padStart(5, "0");
  return `SA-${seq}`;
}

// ==================== LIST ====================

// GET /api/service-appointments?dealershipId=...&status=...&customerId=...
router.get("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const role = req.user!.role as string;
    const { dealershipId, status, customerId } = req.query;

    let rows: any[];

    if (isOperator(role)) {
      rows = await db.select().from(serviceAppointments).orderBy(desc(serviceAppointments.createdAt));
    } else if (role === "client") {
      if (!req.user!.id) return res.json([]);
      rows = await db.select().from(serviceAppointments)
        .where(eq(serviceAppointments.customerId, req.user!.id))
        .orderBy(desc(serviceAppointments.createdAt));
    } else {
      const did = dealershipId as string || req.user!.dealershipId;
      if (!did) return res.json([]);
      rows = await db.select().from(serviceAppointments)
        .where(eq(serviceAppointments.dealershipId, did))
        .orderBy(desc(serviceAppointments.createdAt));
    }

    if (status) rows = rows.filter((a) => a.status === status);
    if (customerId) rows = rows.filter((a) => a.customerId === customerId);

    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to load appointments" });
  }
});

// ==================== CREATE ====================

// POST /api/service-appointments
router.post("/", requireAuth, async (req: Request, res: Response) => {
  try {
    const {
      dealershipId, customerId, unitId, issueDescription,
      preferredDates, locationAddress, locationLat, locationLng,
    } = req.body;

    if (!unitId || !customerId) {
      return res.status(400).json({ message: "unitId and customerId are required" });
    }

    const did = dealershipId || req.user!.dealershipId;
    if (!did) return res.status(400).json({ message: "dealershipId is required" });

    const [created] = await db.insert(serviceAppointments).values({
      appointmentNumber: generateApptNumber(),
      dealershipId: did,
      customerId,
      unitId,
      status: "requested",
      issueDescription: issueDescription || null,
      preferredDates: preferredDates || [],
      locationAddress: locationAddress || null,
      locationLat: locationLat ? String(locationLat) : null,
      locationLng: locationLng ? String(locationLng) : null,
    }).returning();

    res.status(201).json(created);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to create appointment" });
  }
});

// ==================== UPDATE ====================

// PATCH /api/service-appointments/:id
router.patch("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.user!.role as string;

    const [existing] = await db.select().from(serviceAppointments)
      .where(eq(serviceAppointments.id, id)).limit(1);
    if (!existing) return res.status(404).json({ message: "Appointment not found" });

    if (!isOperator(role) && role !== "service_manager" && role !== "shop_manager") {
      const did = req.user!.dealershipId;
      if (did && existing.dealershipId !== did) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    const {
      status, confirmedDate, workOrderId,
      clientRating, clientReview, issueDescription,
    } = req.body;

    const updateData: Record<string, any> = { updatedAt: new Date() };
    if (status !== undefined) updateData.status = status;
    if (confirmedDate !== undefined) updateData.confirmedDate = confirmedDate ? new Date(confirmedDate) : null;
    if (workOrderId !== undefined) updateData.workOrderId = workOrderId;
    if (clientRating !== undefined) updateData.clientRating = clientRating;
    if (clientReview !== undefined) updateData.clientReview = clientReview;
    if (issueDescription !== undefined) updateData.issueDescription = issueDescription;

    const [updated] = await db.update(serviceAppointments)
      .set(updateData)
      .where(eq(serviceAppointments.id, id))
      .returning();

    res.json(updated);
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to update appointment" });
  }
});

// ==================== DELETE / CANCEL ====================

// DELETE /api/service-appointments/:id
router.delete("/:id", requireAuth, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const role = req.user!.role as string;

    const [existing] = await db.select().from(serviceAppointments)
      .where(eq(serviceAppointments.id, id)).limit(1);
    if (!existing) return res.status(404).json({ message: "Appointment not found" });

    if (!isOperator(role)) {
      const did = req.user!.dealershipId;
      if (did && existing.dealershipId !== did) {
        return res.status(403).json({ message: "Access denied" });
      }
    }

    // Soft-cancel instead of hard delete
    await db.update(serviceAppointments)
      .set({ status: "cancelled", updatedAt: new Date() })
      .where(eq(serviceAppointments.id, id));

    res.json({ success: true });
  } catch (err: any) {
    res.status(500).json({ message: err.message || "Failed to cancel appointment" });
  }
});

export default router;
