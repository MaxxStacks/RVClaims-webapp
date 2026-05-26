import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { units, claims, v6Uploads, documents, dealerships, users } from "@shared/schema";
import { eq, and, or, desc, ilike } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { createDealJacket } from "../lib/dealJacket";

const router = Router();
router.use(requireAuth);

function computeWarrantyStatus(endDate: string | null | undefined): "active" | "expiring" | "expired" | "none" {
  if (!endDate) return "none";
  const end = new Date(endDate);
  const now = new Date();
  const daysUntil = Math.ceil((end.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
  if (daysUntil < 0) return "expired";
  if (daysUntil < 60) return "expiring";
  return "active";
}

// GET /api/v6/units
router.get("/", async (req: Request, res: Response) => {
  const u = req.user!;
  const { status, manufacturer, customerId, search } = req.query as Record<string, string>;

  const conditions: ReturnType<typeof eq>[] = [];

  if (["dealer_owner", "dealer_staff", "technician"].includes(u.role)) {
    if (!u.dealershipId) return res.json([]);
    conditions.push(eq(units.dealershipId, u.dealershipId));
  } else if (u.role === "client") {
    conditions.push(eq(units.customerId, u.id));
  } else if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  if (status) conditions.push(eq(units.status, status as any));
  if (manufacturer) conditions.push(ilike(units.manufacturer, `%${manufacturer}%`));
  if (customerId) conditions.push(eq(units.customerId, customerId));
  if (search) {
    conditions.push(or(
      ilike(units.vin, `%${search}%`),
      ilike(units.stockNumber, `%${search}%`),
      ilike(units.manufacturer, `%${search}%`),
      ilike(units.model, `%${search}%`),
    )! as any);
  }

  const where = conditions.length > 0 ? and(...(conditions as any[])) : undefined;
  const rows = await db.select().from(units).where(where).orderBy(desc(units.createdAt)).limit(500);

  const enriched = rows.map(row => ({
    ...row,
    make: row.manufacturer,
    mfrWarrantyStatus: computeWarrantyStatus(row.warrantyEnd),
    extWarrantyStatus: computeWarrantyStatus(row.extWarrantyEnd),
  }));

  res.json(enriched);
});

// GET /api/v6/units/:id
router.get("/:id", async (req: Request, res: Response) => {
  const u = req.user!;
  const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
  if (!unit) return res.status(404).json({ error: "Not found" });

  if (["dealer_owner", "dealer_staff", "technician"].includes(u.role)) {
    if (unit.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
  } else if (u.role === "client") {
    if (unit.customerId !== u.id) return res.status(403).json({ error: "Forbidden" });
  }

  const [unitClaims, unitPhotos, dealershipRows, customerRows] = await Promise.all([
    db.select().from(claims).where(eq(claims.unitId, unit.id)).orderBy(desc(claims.createdAt)),
    db.select().from(v6Uploads).where(and(
      eq(v6Uploads.scope, "units"),
      eq(v6Uploads.scopeId, unit.id),
      eq(v6Uploads.uploadStatus, "uploaded"),
    )),
    db.select().from(dealerships).where(eq(dealerships.id, unit.dealershipId)).limit(1),
    unit.customerId
      ? db.select({
          id: users.id, firstName: users.firstName, lastName: users.lastName,
          email: users.email, phone: users.phone,
        }).from(users).where(eq(users.id, unit.customerId)).limit(1)
      : Promise.resolve([]),
  ]);

  res.json({
    unit: {
      ...unit,
      make: unit.manufacturer,
      mfrWarrantyStatus: computeWarrantyStatus(unit.warrantyEnd),
      extWarrantyStatus: computeWarrantyStatus(unit.extWarrantyEnd),
    },
    claims: unitClaims,
    photos: unitPhotos,
    dealership: dealershipRows[0] || null,
    customer: (customerRows as any[])[0] || null,
  });
});

// POST /api/v6/units
router.post("/", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "operator_staff", "dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const {
    vin, year, make, manufacturer: mfrBody, model, stockNumber, status,
    intakeDate, lotLocation,
    warrantyStart, warrantyEnd,
    extendedWarrantyPlan, extendedWarrantyStart, extWarrantyEnd,
    serviceContractActive, serviceContractEnd,
    customerId, soldDate,
    dealershipId: dsIdInput,
    rvType,
  } = req.body;

  const resolvedMfr = mfrBody || make;
  if (!vin) return res.status(400).json({ error: "VIN required" });
  if (!year || !resolvedMfr) return res.status(400).json({ error: "Year and manufacturer required" });

  const dealershipId = u.dealershipId || dsIdInput;
  if (!dealershipId) return res.status(400).json({ error: "No dealership context" });

  const [created] = await db.insert(units).values({
    vin: (vin as string).toUpperCase(),
    year,
    manufacturer: resolvedMfr,
    model: model || "",
    stockNumber: stockNumber || null,
    status: status || "in_inventory",
    intakeDate: intakeDate || null,
    lotLocation: lotLocation || null,
    warrantyStart: warrantyStart || null,
    warrantyEnd: warrantyEnd || null,
    extendedWarrantyPlan: extendedWarrantyPlan || null,
    extendedWarrantyStart: extendedWarrantyStart || null,
    extWarrantyEnd: extWarrantyEnd || null,
    serviceContractActive: serviceContractActive || false,
    serviceContractEnd: serviceContractEnd || null,
    customerId: customerId || null,
    soldDate: soldDate || null,
    dealershipId,
    rvType: rvType || null,
  }).returning();

  res.status(201).json({ ...created, make: created.manufacturer });
});

// PATCH /api/v6/units/:id
router.patch("/:id", async (req: Request, res: Response) => {
  const u = req.user!;
  const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
  if (!unit) return res.status(404).json({ error: "Not found" });

  if (["dealer_owner", "dealer_staff"].includes(u.role)) {
    if (unit.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
  } else if (!["operator_admin", "operator_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const allowed = [
    "year", "manufacturer", "make", "model", "stockNumber", "status",
    "intakeDate", "lotLocation",
    "warrantyStart", "warrantyEnd",
    "extendedWarrantyPlan", "extendedWarrantyStart", "extWarrantyEnd",
    "serviceContractActive", "serviceContractEnd",
    "customerId", "soldDate",
  ];
  const updates: Record<string, any> = {};
  for (const k of allowed) {
    if (req.body[k] !== undefined) {
      const schemaKey = k === "make" ? "manufacturer" : k;
      updates[schemaKey] = req.body[k];
    }
  }
  updates.updatedAt = new Date();

  await db.update(units).set(updates).where(eq(units.id, unit.id));
  const [updated] = await db.select().from(units).where(eq(units.id, unit.id)).limit(1);

  // Auto-create deal jacket when unit is marked as sold with a customer
  if (updates.status === "sold" && updated.customerId && updated.dealershipId) {
    try {
      await createDealJacket(
        updated.id,
        updated.customerId,
        updated.dealershipId,
        u.id,
        updated.soldDate || new Date().toISOString().split("T")[0]
      );
    } catch (err) {
      // Non-blocking — log but don't fail the update
      console.error("Auto-create deal jacket on PATCH failed (non-blocking):", err);
    }
  }

  res.json({ ...updated, make: updated.manufacturer });
});

// DELETE /api/v6/units/:id
router.delete("/:id", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "dealer_owner"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden — operator_admin or dealer_owner only" });
  }
  const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
  if (!unit) return res.status(404).json({ error: "Not found" });
  if (u.role === "dealer_owner" && unit.dealershipId !== u.dealershipId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  await db.delete(units).where(eq(units.id, unit.id));
  res.json({ ok: true });
});

// POST /api/v6/units/:id/assign-customer
router.post("/:id/assign-customer", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { customerId } = req.body;
  const unitId = req.params.id;

  const [existingUnit] = await db.select().from(units).where(eq(units.id, unitId)).limit(1);

  await db.update(units).set({
    customerId,
    soldDate: new Date().toISOString().split("T")[0],
    status: "sold",
    updatedAt: new Date(),
  }).where(eq(units.id, unitId));

  // Auto-create deal jacket when unit is assigned to customer (sold)
  if (customerId && existingUnit?.dealershipId) {
    try {
      await createDealJacket(
        unitId,
        customerId,
        existingUnit.dealershipId,
        u.id,
        new Date().toISOString().split("T")[0]
      );
    } catch (err) {
      // Non-blocking — log but don't fail the status update
      console.error("Auto-create deal jacket failed (non-blocking):", err);
    }
  }

  res.json({ ok: true });
});

// GET /api/v6/units/:id/claims
router.get("/:id/claims", async (req: Request, res: Response) => {
  const u = req.user!;
  const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
  if (!unit) return res.status(404).json({ error: "Not found" });

  if (["dealer_owner", "dealer_staff", "technician"].includes(u.role)) {
    if (unit.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
  } else if (u.role === "client") {
    if (unit.customerId !== u.id) return res.status(403).json({ error: "Forbidden" });
  }

  const rows = await db.select().from(claims)
    .where(eq(claims.unitId, unit.id))
    .orderBy(desc(claims.createdAt));
  res.json(rows);
});

// GET /api/v6/units/:id/documents
router.get("/:id/documents", async (req: Request, res: Response) => {
  const u = req.user!;
  const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
  if (!unit) return res.status(404).json({ error: "Not found" });

  if (["dealer_owner", "dealer_staff", "technician"].includes(u.role)) {
    if (unit.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
  } else if (u.role === "client") {
    if (unit.customerId !== u.id) return res.status(403).json({ error: "Forbidden" });
  }

  const rows = await db.select().from(documents)
    .where(eq(documents.unitId, unit.id))
    .orderBy(desc(documents.createdAt));
  res.json(rows);
});

// POST /api/v6/units/:id/documents
router.post("/:id/documents", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
  if (!unit) return res.status(404).json({ error: "Not found" });

  if (["dealer_owner", "dealer_staff"].includes(u.role) && unit.dealershipId !== u.dealershipId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { name, url, type, sizeBytes, mimeType } = req.body;
  if (!name || !url || !type) return res.status(400).json({ error: "name, url, and type are required" });

  const [doc] = await db.insert(documents).values({
    unitId: unit.id,
    dealershipId: unit.dealershipId,
    name,
    url,
    type,
    sizeBytes: sizeBytes || null,
    mimeType: mimeType || null,
    uploadedBy: u.id,
  }).returning();
  res.status(201).json(doc);
});

// DELETE /api/v6/units/:id/documents/:docId
router.delete("/:id/documents/:docId", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "dealer_owner"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden — operator_admin or dealer_owner only" });
  }
  const [doc] = await db.select().from(documents).where(eq(documents.id, req.params.docId)).limit(1);
  if (!doc) return res.status(404).json({ error: "Not found" });
  if (u.role === "dealer_owner") {
    const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
    if (!unit || unit.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
  }
  await db.delete(documents).where(eq(documents.id, doc.id));
  res.json({ ok: true });
});

// GET /api/v6/units/:id/photos
router.get("/:id/photos", async (req: Request, res: Response) => {
  const u = req.user!;
  const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
  if (!unit) return res.status(404).json({ error: "Not found" });

  if (["dealer_owner", "dealer_staff", "technician"].includes(u.role)) {
    if (unit.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
  } else if (u.role === "client") {
    return res.status(403).json({ error: "Forbidden — clients cannot view unit photos" });
  }

  const conditions = [
    eq(v6Uploads.scope, "units"),
    eq(v6Uploads.scopeId, unit.id),
    eq(v6Uploads.uploadStatus, "uploaded"),
  ] as any[];

  const { category } = req.query as Record<string, string>;
  if (category) conditions.push(eq(v6Uploads.photoType, category));

  const rows = await db.select().from(v6Uploads)
    .where(and(...conditions))
    .orderBy(desc(v6Uploads.createdAt));
  res.json(rows);
});

// POST /api/v6/units/:id/photos — presign-based: client POSTs metadata after R2 upload
router.post("/:id/photos", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
  if (!unit) return res.status(404).json({ error: "Not found" });

  if (["dealer_owner", "dealer_staff"].includes(u.role) && unit.dealershipId !== u.dealershipId) {
    return res.status(403).json({ error: "Forbidden" });
  }

  const { storageKey, publicUrl, contentType, filename, photoType, sizeBytes } = req.body;
  if (!storageKey || !publicUrl || !contentType) {
    return res.status(400).json({ error: "storageKey, publicUrl, and contentType are required" });
  }

  const [photo] = await db.insert(v6Uploads).values({
    storageKey,
    publicUrl,
    contentType,
    uploadStatus: "uploaded",
    uploadedById: u.id,
    uploadedAt: new Date(),
    photoType: photoType || "general",
    scope: "units",
    scopeId: unit.id,
    filename: filename || null,
    sizeBytes: sizeBytes || null,
  }).returning();
  res.status(201).json(photo);
});

// DELETE /api/v6/units/:id/photos/:photoId
router.delete("/:id/photos/:photoId", async (req: Request, res: Response) => {
  const u = req.user!;
  if (!["operator_admin", "dealer_owner"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden — operator_admin or dealer_owner only" });
  }
  const [photo] = await db.select().from(v6Uploads).where(eq(v6Uploads.id, req.params.photoId)).limit(1);
  if (!photo) return res.status(404).json({ error: "Not found" });
  if (u.role === "dealer_owner") {
    const [unit] = await db.select().from(units).where(eq(units.id, req.params.id)).limit(1);
    if (!unit || unit.dealershipId !== u.dealershipId) return res.status(403).json({ error: "Forbidden" });
  }
  await db.delete(v6Uploads).where(eq(v6Uploads.id, photo.id));
  res.json({ ok: true });
});

export default router;
