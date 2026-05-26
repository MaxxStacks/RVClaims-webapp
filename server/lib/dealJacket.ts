// server/lib/dealJacket.ts — Deal Jacket creation and management utilities

import { db } from "../db";
import {
  dealJackets,
  dealJacketDocuments,
  pdiInspections,
  warrantyPlans,
  fiDeals,
  financingApplications,
  units,
  type DealJacket,
} from "@shared/schema";
import { and, eq, desc, inArray } from "drizzle-orm";

// ─── createDealJacket ─────────────────────────────────────────────────────────
// Idempotent: returns existing jacket if one already exists for unitId+customerId

export async function createDealJacket(
  unitId: string,
  customerId: string,
  dealershipId: string,
  createdBy: string,
  saleDate?: string
): Promise<DealJacket> {
  // 1. Check for existing jacket
  const existing = await db
    .select()
    .from(dealJackets)
    .where(and(eq(dealJackets.unitId, unitId), eq(dealJackets.customerId, customerId)))
    .limit(1);

  if (existing.length > 0) {
    return existing[0];
  }

  // 2. Create the jacket record
  const [jacket] = await db
    .insert(dealJackets)
    .values({
      unitId,
      customerId,
      dealershipId,
      saleDate: saleDate || null,
      status: "incomplete",
      completenessScore: 0,
      createdBy,
    })
    .returning();

  // 3. Auto-link existing records and build required docs list
  const docsToInsert: typeof dealJacketDocuments.$inferInsert[] = [];

  // 3a. PDI sign-off — look for most recent tech_signed or completed PDI
  try {
    const [pdi] = await db
      .select()
      .from(pdiInspections)
      .where(
        and(
          eq(pdiInspections.unitId, unitId),
          inArray(pdiInspections.status, ["tech_signed", "completed"])
        )
      )
      .orderBy(desc(pdiInspections.createdAt))
      .limit(1);

    if (pdi) {
      docsToInsert.push({
        jacketId: jacket.id,
        documentType: "pdi_signoff",
        documentName: "PDI Sign-Off",
        sourceType: "linked_pdi",
        sourceId: pdi.id,
        isRequired: true,
        status: "present",
        uploadedAt: new Date(),
      });
    } else {
      docsToInsert.push({
        jacketId: jacket.id,
        documentType: "pdi_signoff",
        documentName: "PDI Sign-Off",
        sourceType: "uploaded",
        isRequired: true,
        status: "missing",
      });
    }
  } catch {
    docsToInsert.push({
      jacketId: jacket.id,
      documentType: "pdi_signoff",
      documentName: "PDI Sign-Off",
      sourceType: "uploaded",
      isRequired: true,
      status: "missing",
    });
  }

  // 3b. Manufacturer warranty — check unit fields + warranty_plans table
  try {
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.id, unitId))
      .limit(1);

    const [warrantyPlan] = await db
      .select()
      .from(warrantyPlans)
      .where(and(eq(warrantyPlans.unitId, unitId), eq(warrantyPlans.status, "active")))
      .orderBy(desc(warrantyPlans.createdAt))
      .limit(1);

    if (warrantyPlan) {
      docsToInsert.push({
        jacketId: jacket.id,
        documentType: "manufacturer_warranty",
        documentName: "Manufacturer Warranty",
        sourceType: "linked_warranty",
        sourceId: warrantyPlan.id,
        isRequired: true,
        status: "present",
        uploadedAt: new Date(),
      });
    } else if (unit?.warrantyStart || unit?.warrantyEnd) {
      docsToInsert.push({
        jacketId: jacket.id,
        documentType: "manufacturer_warranty",
        documentName: "Manufacturer Warranty",
        sourceType: "uploaded",
        isRequired: true,
        status: "pending",
      });
    } else {
      docsToInsert.push({
        jacketId: jacket.id,
        documentType: "manufacturer_warranty",
        documentName: "Manufacturer Warranty",
        sourceType: "uploaded",
        isRequired: true,
        status: "missing",
      });
    }

    // 3c. Extended warranty if present on unit or warranty_plans table
    const [extWarrantyPlan] = await db
      .select()
      .from(warrantyPlans)
      .where(
        and(
          eq(warrantyPlans.unitId, unitId),
          eq(warrantyPlans.soldByPlatform, true)
        )
      )
      .orderBy(desc(warrantyPlans.createdAt))
      .limit(1);

    if (extWarrantyPlan) {
      docsToInsert.push({
        jacketId: jacket.id,
        documentType: "extended_warranty",
        documentName: "Extended Warranty",
        sourceType: "linked_warranty",
        sourceId: extWarrantyPlan.id,
        isRequired: false,
        status: "present",
        uploadedAt: new Date(),
      });
    } else if (unit?.extWarrantyProvider) {
      docsToInsert.push({
        jacketId: jacket.id,
        documentType: "extended_warranty",
        documentName: "Extended Warranty",
        sourceType: "uploaded",
        isRequired: false,
        status: "missing",
      });
    }
  } catch {
    // non-blocking — continue
  }

  // 3d. F&I deal — check fiDeals by unitId
  try {
    const [fiDeal] = await db
      .select()
      .from(fiDeals)
      .where(eq(fiDeals.unitId, unitId))
      .orderBy(desc(fiDeals.createdAt))
      .limit(1);

    if (fiDeal) {
      docsToInsert.push({
        jacketId: jacket.id,
        documentType: "fi_acceptance",
        documentName: "F&I Acceptance",
        sourceType: "linked_fi_deal",
        sourceId: fiDeal.id,
        isRequired: false,
        status: "present",
        uploadedAt: new Date(),
      });
    }
  } catch {
    // non-blocking
  }

  // 3e. Financing — check financingApplications by unitId
  try {
    const [finApp] = await db
      .select()
      .from(financingApplications)
      .where(eq(financingApplications.unitId, unitId))
      .orderBy(desc(financingApplications.createdAt))
      .limit(1);

    if (finApp) {
      docsToInsert.push({
        jacketId: jacket.id,
        documentType: "financing_agreement",
        documentName: "Financing Agreement",
        sourceType: "linked_financing",
        sourceId: finApp.id,
        isRequired: false,
        status: "present",
        uploadedAt: new Date(),
      });
    }
  } catch {
    // non-blocking
  }

  // 4. Always add required placeholders for bill_of_sale and customer_consent
  docsToInsert.push({
    jacketId: jacket.id,
    documentType: "bill_of_sale",
    documentName: "Bill of Sale",
    sourceType: "uploaded",
    isRequired: true,
    status: "missing",
  });

  docsToInsert.push({
    jacketId: jacket.id,
    documentType: "customer_consent",
    documentName: "Customer Consent",
    sourceType: "uploaded",
    isRequired: true,
    status: "missing",
  });

  // Insert all documents
  if (docsToInsert.length > 0) {
    await db.insert(dealJacketDocuments).values(docsToInsert);
  }

  // 5. Calculate completeness and update jacket
  const score = await recalculateCompleteness(jacket.id);

  const [updated] = await db
    .select()
    .from(dealJackets)
    .where(eq(dealJackets.id, jacket.id))
    .limit(1);

  return updated || jacket;
}

// ─── recalculateCompleteness ──────────────────────────────────────────────────

export async function recalculateCompleteness(jacketId: string): Promise<number> {
  const docs = await db
    .select()
    .from(dealJacketDocuments)
    .where(eq(dealJacketDocuments.jacketId, jacketId));

  const required = docs.filter((d) => d.isRequired);
  const present = required.filter((d) => d.status === "present");

  const score =
    required.length > 0 ? Math.round((present.length / required.length) * 100) : 0;

  const newStatus = score === 100 ? "complete" : "incomplete";

  await db
    .update(dealJackets)
    .set({ completenessScore: score, status: newStatus, updatedAt: new Date() })
    .where(eq(dealJackets.id, jacketId));

  return score;
}
