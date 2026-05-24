// server/routes/import.ts — CSV/Excel import system
import { Router } from "express";
import multer from "multer";
import * as XLSX from "xlsx";
import { db } from "../db";
import { requireAuth } from "../middleware/auth";
import {
  units, claims, users, warrantyPlans, fiDeals,
  importTemplates, importHistory,
} from "@shared/schema";
import { eq, and, desc } from "drizzle-orm";

const router = Router();
router.use(requireAuth);

const upload = multer({ storage: multer.memoryStorage(), limits: { fileSize: 10 * 1024 * 1024 } });

// ==================== FIELD MAPS ====================

const ENTITY_FIELDS: Record<string, Record<string, string>> = {
  units: {
    vin: "vin", stock_number: "stockNumber", year: "year",
    manufacturer: "manufacturer", model: "model", rv_type: "rvType",
    status: "status", lot_location: "lotLocation", customer_name: "customerName",
    customer_email: "customerEmail", customer_phone: "customerPhone",
    delivery_date: "deliveryDate", warranty_start: "warrantyStart", warranty_end: "warrantyEnd",
  },
  customers: {
    email: "email", first_name: "firstName", last_name: "lastName",
    phone: "phone", role: "role",
  },
  claims: {
    claim_number: "claimNumber", manufacturer: "manufacturer", type: "type",
    status: "status", dealer_notes: "dealerNotes", estimated_amount: "estimatedAmount",
  },
  warranty_plans: {
    plan_number: "planNumber", provider: "provider", coverage: "coverage",
    start_date: "startDate", end_date: "endDate", status: "status",
  },
  fi_deals: {
    deal_number: "dealNumber", customer_name: "customerName", sale_price: "salePrice",
    financing: "financing", status: "status", dealer_notes: "dealerNotes",
  },
};

// Fuzzy-match a CSV header to a known field key
function detectField(header: string, entityType: string): string | null {
  const h = header.toLowerCase().replace(/[\s_\-]/g, "");
  const fields = ENTITY_FIELDS[entityType] || {};
  for (const key of Object.keys(fields)) {
    const k = key.replace(/_/g, "");
    if (h === k || h.includes(k) || k.includes(h)) return key;
  }
  return null;
}

// Parse a file buffer (CSV or XLSX) into rows
function parseFile(buffer: Buffer, mimetype: string): Record<string, string>[] {
  const wb = XLSX.read(buffer, { type: "buffer", raw: false, dateNF: "YYYY-MM-DD" });
  const ws = wb.Sheets[wb.SheetNames[0]];
  return XLSX.utils.sheet_to_json<Record<string, string>>(ws, { defval: "" });
}

// ==================== GET /api/import/templates ====================
router.get("/templates", async (req, res) => {
  const u = req.user!;
  try {
    const rows = await db
      .select()
      .from(importTemplates)
      .where(
        u.role === "operator_admin" || u.role === "operator_staff"
          ? undefined
          : eq(importTemplates.dealerId, u.dealershipId!)
      )
      .orderBy(desc(importTemplates.createdAt));
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== POST /api/import/templates ====================
router.post("/templates", async (req, res) => {
  const u = req.user!;
  const { name, entityType, columnMappings } = req.body;
  if (!name || !entityType || !columnMappings) {
    return res.status(400).json({ error: "name, entityType, and columnMappings are required" });
  }
  try {
    const [tpl] = await db.insert(importTemplates).values({
      dealerId: u.dealershipId ?? null,
      name,
      entityType,
      columnMappings,
      createdBy: u.email,
    }).returning();
    res.json(tpl);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== DELETE /api/import/templates/:id ====================
router.delete("/templates/:id", async (req, res) => {
  const u = req.user!;
  try {
    await db.delete(importTemplates).where(
      and(
        eq(importTemplates.id, req.params.id),
        u.role === "operator_admin" ? undefined : eq(importTemplates.dealerId, u.dealershipId!)
      )
    );
    res.json({ ok: true });
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== GET /api/import/history ====================
router.get("/history", async (req, res) => {
  const u = req.user!;
  try {
    const rows = await db
      .select()
      .from(importHistory)
      .where(
        u.role === "operator_admin" || u.role === "operator_staff"
          ? undefined
          : eq(importHistory.dealerId, u.dealershipId!)
      )
      .orderBy(desc(importHistory.importedAt))
      .limit(100);
    res.json(rows);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

// ==================== POST /api/import/preview ====================
router.post("/preview", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const { entityType } = req.body;
  if (!entityType) return res.status(400).json({ error: "entityType required" });

  try {
    const rows = parseFile(req.file.buffer, req.file.mimetype);
    if (rows.length === 0) return res.status(400).json({ error: "File is empty" });

    const headers = Object.keys(rows[0]);
    const autoMapping: Record<string, string> = {};
    for (const h of headers) {
      const detected = detectField(h, entityType);
      if (detected) autoMapping[h] = detected;
    }

    res.json({
      totalRows: rows.length,
      headers,
      autoMapping,
      preview: rows.slice(0, 5),
      availableFields: ENTITY_FIELDS[entityType] || {},
    });
  } catch (err: any) {
    res.status(400).json({ error: `Parse error: ${err.message}` });
  }
});

// ==================== POST /api/import/run ====================
router.post("/run", upload.single("file"), async (req, res) => {
  if (!req.file) return res.status(400).json({ error: "No file uploaded" });
  const u = req.user!;
  const { entityType, columnMappings: mappingsRaw, templateId } = req.body;

  if (!entityType) return res.status(400).json({ error: "entityType required" });
  if (!u.dealershipId && !["operator_admin"].includes(u.role)) {
    return res.status(403).json({ error: "No dealership context" });
  }

  const dealershipId = u.dealershipId!;
  let columnMappings: Record<string, string> = {};
  try {
    columnMappings = typeof mappingsRaw === "string" ? JSON.parse(mappingsRaw) : mappingsRaw;
  } catch {
    return res.status(400).json({ error: "Invalid columnMappings JSON" });
  }

  let rows: Record<string, string>[];
  try {
    rows = parseFile(req.file.buffer, req.file.mimetype);
  } catch (err: any) {
    return res.status(400).json({ error: `Parse error: ${err.message}` });
  }

  const totalRows = rows.length;
  let importedRows = 0;
  let skippedRows = 0;
  let errorRows = 0;
  const errors: { row: number; error: string }[] = [];

  const fieldMap = ENTITY_FIELDS[entityType] || {};

  await db.transaction(async (tx) => {
    for (let i = 0; i < rows.length; i++) {
      const raw = rows[i];
      const mapped: Record<string, any> = {};

      for (const [csvCol, fieldKey] of Object.entries(columnMappings)) {
        const dbField = fieldMap[fieldKey];
        if (dbField && raw[csvCol] !== undefined && raw[csvCol] !== "") {
          mapped[dbField] = raw[csvCol];
        }
      }

      // Capture remaining unmapped columns as customData
      const mappedCsvCols = new Set(Object.keys(columnMappings));
      const customData: Record<string, string> = {};
      for (const [col, val] of Object.entries(raw)) {
        if (!mappedCsvCols.has(col) && val !== "") {
          customData[col] = val;
        }
      }
      if (Object.keys(customData).length > 0) {
        mapped.customData = customData;
      }

      try {
        if (entityType === "units") {
          if (!mapped.vin) { skippedRows++; errors.push({ row: i + 2, error: "Missing VIN" }); continue; }
          await tx.insert(units).values({ dealershipId, ...mapped }).onConflictDoUpdate({
            target: units.vin,
            set: { ...mapped, updatedAt: new Date() },
          });
        } else if (entityType === "customers") {
          if (!mapped.email) { skippedRows++; errors.push({ row: i + 2, error: "Missing email" }); continue; }
          mapped.role = mapped.role || "client";
          mapped.firstName = mapped.firstName || "";
          mapped.lastName = mapped.lastName || "";
          await tx.insert(users).values({ dealershipId, ...mapped }).onConflictDoUpdate({
            target: users.email,
            set: { ...mapped, updatedAt: new Date() },
          });
        } else if (entityType === "warranty_plans") {
          if (!mapped.planNumber) { skippedRows++; errors.push({ row: i + 2, error: "Missing planNumber" }); continue; }
          if (!mapped.unitId && !mapped.provider) { skippedRows++; errors.push({ row: i + 2, error: "Missing provider" }); continue; }
          await tx.insert(warrantyPlans).values({ dealershipId, unitId: mapped.unitId || "00000000-0000-0000-0000-000000000000", ...mapped }).onConflictDoUpdate({
            target: warrantyPlans.planNumber,
            set: { ...mapped, customData: mapped.customData },
          });
        } else if (entityType === "fi_deals") {
          if (!mapped.dealNumber) { skippedRows++; errors.push({ row: i + 2, error: "Missing dealNumber" }); continue; }
          if (!mapped.customerName) { skippedRows++; errors.push({ row: i + 2, error: "Missing customerName" }); continue; }
          await tx.insert(fiDeals).values({ dealershipId, ...mapped }).onConflictDoUpdate({
            target: fiDeals.dealNumber,
            set: { ...mapped, updatedAt: new Date() },
          });
        } else {
          skippedRows++;
          errors.push({ row: i + 2, error: `Unsupported entityType: ${entityType}` });
          continue;
        }
        importedRows++;
      } catch (err: any) {
        errorRows++;
        errors.push({ row: i + 2, error: err.message });
      }
    }
  });

  // Log to import_history
  const [historyRow] = await db.insert(importHistory).values({
    dealerId: dealershipId,
    entityType,
    templateId: templateId || null,
    filename: req.file.originalname,
    totalRows,
    importedRows,
    skippedRows,
    errorRows,
    errors,
    importedBy: u.email,
    status: errorRows === totalRows ? "failed" : importedRows > 0 ? "completed" : "partial",
  }).returning();

  res.json({
    importId: historyRow.id,
    totalRows,
    importedRows,
    skippedRows,
    errorRows,
    errors: errors.slice(0, 50),
    status: historyRow.status,
  });
});

export default router;
