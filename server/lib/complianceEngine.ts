// server/lib/complianceEngine.ts
// Compliance check engine — jurisdiction detection, document checks, score calculation

import { db } from "../db";
import {
  dealerships, complianceTemplates, complianceChecks, dealJackets,
  dealJacketDocuments, units,
} from "@shared/schema";
import { eq, and, inArray, gte, lte, isNotNull } from "drizzle-orm";
import { getDealerCountry, type LocaleAwareDealership } from "./locale";

// ── Jurisdiction detection ───────────────────────────────────────────────────

export function getJurisdictions(dealership: LocaleAwareDealership): string[] {
  const country = getDealerCountry(dealership);
  const region = ((dealership as any).stateProvince || (dealership as any).province || "").trim().toUpperCase();

  if (country === "CA") {
    const provinceMap: Record<string, string[]> = {
      AB: ["AB", "FEDERAL"],
      ON: ["ON", "FEDERAL"],
      QC: ["QC", "FEDERAL"],
      BC: ["BC", "FEDERAL"],
    };
    return provinceMap[region] ?? ["FEDERAL"];
  } else {
    // US
    const stateMap: Record<string, string[]> = {
      FL: ["FL", "FEDERAL"],
      TX: ["TX", "FEDERAL"],
      CA: ["CA_STATE", "FEDERAL"],
    };
    return stateMap[region] ?? ["FEDERAL"];
  }
}

export function getJurisdictionLabel(dealership: LocaleAwareDealership): string {
  const country = getDealerCountry(dealership);
  const region = ((dealership as any).stateProvince || (dealership as any).province || "").trim().toUpperCase();

  const labels: Record<string, string> = {
    AB: "Alberta (AMVIC) + Federal Canada",
    ON: "Ontario (OMVIC) + Federal Canada",
    QC: "Quebec (SAAQ/OPC) + Federal Canada",
    BC: "British Columbia (VSA) + Federal Canada",
    FL: "Florida (FLHSMV) + Federal US",
    TX: "Texas (TxDMV) + Federal US",
    CA: "California (DMV/BAR) + Federal US",
  };

  if (labels[region]) return labels[region];
  return country === "CA" ? "Federal Canada" : "Federal US";
}

// ── Run compliance check ─────────────────────────────────────────────────────

export async function runComplianceCheck(dealershipId: string): Promise<{
  score: number;
  compliant: number;
  total: number;
  exceptions: Array<{
    checkId: string;
    templateId: string;
    requirementName: string;
    severity: string;
    category: string;
    verificationMethod: string;
    documentRequired: string | null;
    status: string;
    details: Record<string, unknown> | null;
  }>;
}> {
  // Load dealership
  const [dealership] = await db
    .select()
    .from(dealerships)
    .where(eq(dealerships.id, dealershipId))
    .limit(1);

  if (!dealership) throw new Error("Dealership not found");

  const country = getDealerCountry(dealership);
  const jurisdictions = getJurisdictions(dealership);

  // Load applicable templates
  const templates = await db
    .select()
    .from(complianceTemplates)
    .where(
      and(
        eq(complianceTemplates.country, country),
        eq(complianceTemplates.isActive, true),
        inArray(complianceTemplates.jurisdiction, jurisdictions)
      )
    );

  // For document checks: load recently sold units' deal jacket documents (last 90 days)
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - 90);

  // Get sold units in last 90 days
  const recentSoldUnits = await db
    .select({ id: units.id, vin: units.vin })
    .from(units)
    .where(
      and(
        eq(units.dealershipId, dealershipId),
        eq(units.status, "sold"),
        gte(units.soldDate, cutoff.toISOString().slice(0, 10))
      )
    );

  // Load deal jackets for those units
  let docsByType: Map<string, string[]> = new Map(); // docType → [vins with that doc]
  let allVinsWithJacket: Set<string> = new Set();

  if (recentSoldUnits.length > 0) {
    const unitIds = recentSoldUnits.map(u => u.id);
    const vinByUnitId = new Map(recentSoldUnits.map(u => [u.id, u.vin]));

    const jackets = await db
      .select({ id: dealJackets.id, unitId: dealJackets.unitId })
      .from(dealJackets)
      .where(
        and(
          eq(dealJackets.dealershipId, dealershipId),
          inArray(dealJackets.unitId, unitIds)
        )
      );

    for (const jacket of jackets) {
      allVinsWithJacket.add(vinByUnitId.get(jacket.unitId) || jacket.unitId);
    }

    if (jackets.length > 0) {
      const jacketIds = jackets.map(j => j.id);
      const jacketUnitMap = new Map(jackets.map(j => [j.id, j.unitId]));

      const docs = await db
        .select({
          jacketId: dealJacketDocuments.jacketId,
          documentType: dealJacketDocuments.documentType,
          status: dealJacketDocuments.status,
        })
        .from(dealJacketDocuments)
        .where(
          and(
            inArray(dealJacketDocuments.jacketId, jacketIds),
            eq(dealJacketDocuments.status, "present")
          )
        );

      for (const doc of docs) {
        const unitId = jacketUnitMap.get(doc.jacketId);
        const vin = unitId ? (vinByUnitId.get(unitId) || unitId) : doc.jacketId;
        const existing = docsByType.get(doc.documentType) || [];
        existing.push(vin);
        docsByType.set(doc.documentType, existing);
      }
    }
  }

  // Build a map of document name → VINs that have it (using fuzzy matching)
  // Required document names from templates may be display names, not DB enum values
  // Map common display names to deal_jacket_document_types enum values
  const docNameToEnum: Record<string, string[]> = {
    "Bill of Sale": ["bill_of_sale"],
    "Privacy Policy": ["custom"],
    "Customer Consent Form": ["customer_consent"],
    "Material Disclosure Form": ["custom"],
    "MVDA Disclosure": ["custom"],
    "Cooling-Off Period Notice": ["customer_consent"],
    "Inspection Certificate": ["inspection"],
    "OPC Warranty Disclosure": ["manufacturer_warranty", "extended_warranty"],
    "Defect Disclosure": ["custom"],
    "FTC Buyers Guide": ["custom"],
    "Warranty Terms Document": ["manufacturer_warranty", "extended_warranty"],
    "TILA Disclosure": ["financing_agreement"],
    "Privacy Notice": ["custom"],
    "TTL Disclosure": ["custom"],
    "Lemon Law Disclosure": ["custom"],
  };

  const checkResults: Array<{
    checkId: string;
    templateId: string;
    requirementName: string;
    severity: string;
    category: string;
    verificationMethod: string;
    documentRequired: string | null;
    status: string;
    details: Record<string, unknown> | null;
  }> = [];

  for (const template of templates) {
    let newStatus: "compliant" | "non_compliant" | "pending_review" = "pending_review";
    let details: Record<string, unknown> | null = null;

    if (template.verificationMethod === "document_check" && template.documentRequired) {
      // Check if any recent sold units are missing this document
      if (recentSoldUnits.length === 0) {
        // No recent sold units — treat as compliant (nothing to check)
        newStatus = "compliant";
        details = { note: "No units sold in last 90 days to verify against." };
      } else {
        const enumTypes = docNameToEnum[template.documentRequired] || [];
        const missingVins: string[] = [];

        for (const unit of recentSoldUnits) {
          let hasDoc = false;
          for (const enumType of enumTypes) {
            const vinsWithDoc = docsByType.get(enumType) || [];
            if (vinsWithDoc.includes(unit.vin)) { hasDoc = true; break; }
          }
          if (!hasDoc) missingVins.push(unit.vin);
        }

        if (missingVins.length === 0) {
          newStatus = "compliant";
          details = { checkedUnits: recentSoldUnits.length, allPresent: true };
        } else {
          newStatus = "non_compliant";
          details = {
            missingVins,
            totalChecked: recentSoldUnits.length,
            missingCount: missingVins.length,
          };
        }
      }
    } else if (template.verificationMethod === "field_check" && template.verificationField) {
      const fieldVal = (dealership as Record<string, unknown>)[template.verificationField];
      if (fieldVal !== null && fieldVal !== undefined && fieldVal !== "") {
        newStatus = "compliant";
      } else {
        newStatus = "non_compliant";
        details = { missingField: template.verificationField };
      }
    } else if (template.verificationMethod === "manual_review") {
      // Check if an existing check is already compliant or waived
      const [existingCheck] = await db
        .select()
        .from(complianceChecks)
        .where(
          and(
            eq(complianceChecks.dealershipId, dealershipId),
            eq(complianceChecks.templateId, template.id)
          )
        )
        .limit(1);

      if (existingCheck && (existingCheck.status === "compliant" || existingCheck.status === "waived")) {
        newStatus = existingCheck.status === "waived" ? "pending_review" : "compliant";
        // Keep existing compliant/waived status — don't downgrade
        checkResults.push({
          checkId: existingCheck.id,
          templateId: template.id,
          requirementName: template.requirementName,
          severity: template.severity,
          category: template.category,
          verificationMethod: template.verificationMethod,
          documentRequired: template.documentRequired,
          status: existingCheck.status,
          details: existingCheck.details as Record<string, unknown> | null,
        });
        continue; // skip upsert for manual_review that's already resolved
      } else {
        newStatus = "pending_review";
      }
    }

    // Upsert compliance_check record
    const [existingCheck] = await db
      .select()
      .from(complianceChecks)
      .where(
        and(
          eq(complianceChecks.dealershipId, dealershipId),
          eq(complianceChecks.templateId, template.id)
        )
      )
      .limit(1);

    let checkId: string;
    if (existingCheck) {
      await db
        .update(complianceChecks)
        .set({
          status: newStatus,
          details: details as any,
          checkedAt: new Date(),
        })
        .where(eq(complianceChecks.id, existingCheck.id));
      checkId = existingCheck.id;
    } else {
      const [inserted] = await db
        .insert(complianceChecks)
        .values({
          dealershipId,
          templateId: template.id,
          status: newStatus,
          details: details as any,
          checkedAt: new Date(),
        })
        .returning({ id: complianceChecks.id });
      checkId = inserted.id;
    }

    checkResults.push({
      checkId,
      templateId: template.id,
      requirementName: template.requirementName,
      severity: template.severity,
      category: template.category,
      verificationMethod: template.verificationMethod,
      documentRequired: template.documentRequired,
      status: newStatus,
      details,
    });
  }

  const compliant = checkResults.filter(c => c.status === "compliant" || c.status === "waived").length;
  const total = checkResults.length;
  const score = total > 0 ? Math.round((compliant / total) * 100) : 100;

  const exceptions = checkResults
    .filter(c => c.status === "non_compliant" || c.status === "pending_review")
    .sort((a, b) => {
      const sev = { critical: 0, high: 1, medium: 2, low: 3 };
      return (sev[a.severity as keyof typeof sev] ?? 3) - (sev[b.severity as keyof typeof sev] ?? 3);
    });

  return { score, compliant, total, exceptions };
}

// ── Generate audit report ─────────────────────────────────────────────────────

export async function generateAuditReport(
  dealershipId: string,
  jurisdiction: string,
  dateFrom: Date,
  dateTo: Date
): Promise<Record<string, unknown>> {
  const [dealership] = await db
    .select()
    .from(dealerships)
    .where(eq(dealerships.id, dealershipId))
    .limit(1);

  if (!dealership) throw new Error("Dealership not found");

  const jurisdictionLabel = getJurisdictionLabel(dealership);
  const checkResult = await runComplianceCheck(dealershipId);

  // Load units sold in date range
  const soldUnits = await db
    .select({ id: units.id, vin: units.vin, year: units.year, manufacturer: units.manufacturer, model: units.model, soldDate: units.soldDate })
    .from(units)
    .where(
      and(
        eq(units.dealershipId, dealershipId),
        eq(units.status, "sold"),
        gte(units.soldDate, dateFrom.toISOString().slice(0, 10)),
        lte(units.soldDate, dateTo.toISOString().slice(0, 10))
      )
    );

  // For each sold unit: load deal jacket document checklist
  const unitDocSummaries: Array<{
    vin: string;
    unitDesc: string;
    soldDate: string | null;
    totalDocs: number;
    presentDocs: number;
    missingDocs: string[];
  }> = [];

  for (const unit of soldUnits) {
    const [jacket] = await db
      .select({ id: dealJackets.id, completenessScore: dealJackets.completenessScore })
      .from(dealJackets)
      .where(
        and(
          eq(dealJackets.dealershipId, dealershipId),
          eq(dealJackets.unitId, unit.id)
        )
      )
      .limit(1);

    let presentDocs = 0;
    let totalDocs = 0;
    const missingDocs: string[] = [];

    if (jacket) {
      const docs = await db
        .select({ documentName: dealJacketDocuments.documentName, status: dealJacketDocuments.status })
        .from(dealJacketDocuments)
        .where(eq(dealJacketDocuments.jacketId, jacket.id));

      totalDocs = docs.length;
      presentDocs = docs.filter(d => d.status === "present").length;
      missingDocs.push(...docs.filter(d => d.status === "missing").map(d => d.documentName));
    }

    unitDocSummaries.push({
      vin: unit.vin,
      unitDesc: [unit.year, unit.manufacturer, unit.model].filter(Boolean).join(" "),
      soldDate: unit.soldDate,
      totalDocs,
      presentDocs,
      missingDocs,
    });
  }

  return {
    dealershipName: dealership.name,
    jurisdiction: jurisdictionLabel,
    dateFrom: dateFrom.toISOString().slice(0, 10),
    dateTo: dateTo.toISOString().slice(0, 10),
    generatedAt: new Date().toISOString(),
    complianceScore: checkResult.score,
    compliant: checkResult.compliant,
    total: checkResult.total,
    exceptions: checkResult.exceptions,
    unitsSold: soldUnits.length,
    unitDocSummaries,
    summary: {
      critical: checkResult.exceptions.filter(e => e.severity === "critical").length,
      high: checkResult.exceptions.filter(e => e.severity === "high").length,
      medium: checkResult.exceptions.filter(e => e.severity === "medium").length,
      low: checkResult.exceptions.filter(e => e.severity === "low").length,
    },
  };
}
