// server/lib/ai-document-scanner.ts — AI Document Scanner
// Uses Anthropic Claude API to extract structured data from uploaded documents
// Supports: warranty certs, invoices, inspection reports, manufacturer correspondence
// Auto-detects VIN and files document to correct unit

import Anthropic from "@anthropic-ai/sdk";
import { db } from "../db";
import { units, documents } from "@shared/schema";
import { eq } from "drizzle-orm";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

let client: Anthropic | null = null;
if (ANTHROPIC_API_KEY) {
  client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
} else {
  console.warn("[AI] ANTHROPIC_API_KEY not set — AI document scanning disabled");
}

// ==================== DOCUMENT TYPES ====================

export interface ExtractedDocumentData {
  documentType: "warranty_cert" | "ext_warranty" | "inspection" | "contract" | "invoice" | "report" | "manufacturer_letter" | "other";
  confidence: number;  // 0-1

  // VIN detection
  vin?: string;
  vinConfidence?: number;

  // Common fields
  issueDate?: string;
  expiryDate?: string;
  provider?: string;
  policyNumber?: string;
  claimNumber?: string;

  // Warranty specific
  coverageType?: string;
  coverageItems?: string[];
  deductible?: string;

  // Invoice specific
  invoiceNumber?: string;
  totalAmount?: string;
  currency?: string;
  lineItems?: Array<{
    description: string;
    quantity?: string;
    unitPrice?: string;
    amount?: string;
  }>;

  // Manufacturer letter specific
  manufacturerName?: string;
  approvalStatus?: "approved" | "denied" | "partial" | "pending";
  approvedAmount?: string;
  deniedReason?: string;
  frcCodes?: string[];

  // Inspection specific
  inspectionType?: "daf" | "pdi" | "general";
  inspectorName?: string;
  findings?: string[];

  // Raw extracted text
  rawText?: string;
  summary?: string;
}

// ==================== SCAN DOCUMENT ====================

const SYSTEM_PROMPT = `You are a document analysis AI for Dealer Suite 360, a warranty claims processing platform for RV dealerships.

Your job: Extract structured data from uploaded documents (warranty certificates, invoices, inspection reports, manufacturer correspondence, etc.)

CRITICAL RULES:
1. ALWAYS look for a VIN (Vehicle Identification Number) — 17 characters, alphanumeric. Check headers, footers, reference lines, everywhere.
2. Identify the document type with high confidence.
3. Extract ALL relevant fields based on document type.
4. For manufacturer letters: look for claim numbers, FRC codes, approval/denial status, approved labor hours, parts amounts.
5. For invoices: extract every line item with descriptions, quantities, prices.
6. For warranty certs: extract coverage type, start/end dates, deductible, covered items.
7. Return dates in YYYY-MM-DD format.
8. Return amounts as plain numbers (no $ or commas).
9. If a field is not present or unreadable, omit it — do NOT guess.

Respond ONLY with valid JSON matching the ExtractedDocumentData schema. No markdown, no explanation, just JSON.`;

export async function scanDocument(
  fileBase64: string,
  mimeType: string,
  filename?: string
): Promise<ExtractedDocumentData | null> {
  if (!client) {
    console.warn("[AI] Scanner not available — no API key");
    return null;
  }

  try {
    const isImage = mimeType.startsWith("image/");
    const isPdf = mimeType === "application/pdf";

    // Build the message content
    const content: Anthropic.MessageCreateParams["messages"][0]["content"] = [];

    if (isImage) {
      content.push({
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: fileBase64,
        },
      });
    } else if (isPdf) {
      content.push({
        type: "document",
        source: {
          type: "base64",
          media_type: "application/pdf",
          data: fileBase64,
        },
      });
    } else {
      // For text-based documents, decode and send as text
      const text = Buffer.from(fileBase64, "base64").toString("utf-8");
      content.push({ type: "text", text: `Document content (${filename || "unknown"}):\n\n${text}` });
    }

    content.push({
      type: "text",
      text: `Analyze this document and extract all structured data. Filename: ${filename || "unknown"}. Respond with JSON only.`,
    });

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 4096,
      system: SYSTEM_PROMPT,
      messages: [{ role: "user", content }],
    });

    // Parse response
    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    // Clean potential markdown wrapping
    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);
    jsonStr = jsonStr.trim();

    const extracted: ExtractedDocumentData = JSON.parse(jsonStr);
    return extracted;
  } catch (error) {
    console.error("[AI] Document scan failed:", error);
    return null;
  }
}

// ==================== AUTO-FILE BY VIN ====================

export async function autoFileDocument(
  extracted: ExtractedDocumentData,
  documentUrl: string,
  documentName: string,
  uploadedBy: string,
  dealershipId: string
): Promise<{ unitId?: string; documentId?: string; autoFiled: boolean }> {
  const result: { unitId?: string; documentId?: string; autoFiled: boolean } = { autoFiled: false };

  // If VIN detected, find the unit
  if (extracted.vin && extracted.vinConfidence && extracted.vinConfidence > 0.7) {
    const [unit] = await db
      .select()
      .from(units)
      .where(eq(units.vin, extracted.vin.toUpperCase()))
      .limit(1);

    if (unit) {
      result.unitId = unit.id;

      // Auto-create document record linked to unit
      const docType = mapDocumentType(extracted.documentType);
      const [doc] = await db
        .insert(documents)
        .values({
          unitId: unit.id,
          dealershipId,
          type: docType,
          name: documentName,
          url: documentUrl,
          uploadedBy,
        })
        .returning();

      result.documentId = doc.id;
      result.autoFiled = true;

      // Auto-populate unit fields if warranty cert
      if (extracted.documentType === "warranty_cert" || extracted.documentType === "ext_warranty") {
        const updates: any = {};
        if (extracted.expiryDate) {
          if (extracted.documentType === "warranty_cert") {
            updates.warrantyEnd = extracted.expiryDate;
          } else {
            updates.extWarrantyEnd = extracted.expiryDate;
            if (extracted.provider) updates.extWarrantyProvider = extracted.provider;
            if (extracted.coverageType) updates.extWarrantyCoverage = extracted.coverageType;
          }
        }
        if (extracted.issueDate) {
          if (extracted.documentType === "warranty_cert") {
            updates.warrantyStart = extracted.issueDate;
          }
        }
        if (Object.keys(updates).length > 0) {
          await db.update(units).set({ ...updates, updatedAt: new Date() }).where(eq(units.id, unit.id));
        }
      }
    }
  }

  return result;
}

function mapDocumentType(aiType: string): "warranty_cert" | "ext_warranty" | "inspection" | "contract" | "invoice" | "report" | "other" {
  const mapping: Record<string, any> = {
    warranty_cert: "warranty_cert",
    ext_warranty: "ext_warranty",
    inspection: "inspection",
    contract: "contract",
    invoice: "invoice",
    report: "report",
    manufacturer_letter: "report",
    other: "other",
  };
  return mapping[aiType] || "other";
}

// ==================== UNIT TAG SCANNER ====================

const TAG_SCANNER_PROMPT = `You are analyzing a photo of a physical tag/sticker on an RV (recreational vehicle). 
These tags are typically found on the exterior and contain vehicle specifications.

Extract ALL readable information from the tag:
- VIN (Vehicle Identification Number) — 17 characters
- GVWR (Gross Vehicle Weight Rating)
- UVW (Unloaded Vehicle Weight) 
- CCC (Cargo Carrying Capacity)
- Hitch weight
- Manufacturer name
- Model name/number
- Year of manufacture
- Serial number
- Any other specs visible

Respond ONLY with valid JSON:
{
  "vin": "string or null",
  "manufacturer": "string or null", 
  "model": "string or null",
  "year": "number or null",
  "gvwr": "string or null",
  "uvw": "string or null",
  "ccc": "string or null",
  "hitchWeight": "string or null",
  "serialNumber": "string or null",
  "otherSpecs": {},
  "confidence": 0.0-1.0,
  "rawText": "all readable text from the tag"
}`;

export interface UnitTagData {
  vin: string | null;
  manufacturer: string | null;
  model: string | null;
  year: number | null;
  gvwr: string | null;
  uvw: string | null;
  ccc: string | null;
  hitchWeight: string | null;
  serialNumber: string | null;
  otherSpecs: Record<string, string>;
  confidence: number;
  rawText: string;
}

export async function scanUnitTag(imageBase64: string, mimeType: string): Promise<UnitTagData | null> {
  if (!client) {
    console.warn("[AI] Tag scanner not available — no API key");
    return null;
  }

  try {
    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: TAG_SCANNER_PROMPT,
      messages: [{
        role: "user",
        content: [{
          type: "image",
          source: {
            type: "base64",
            media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
            data: imageBase64,
          },
        }, {
          type: "text",
          text: "Read this RV tag/sticker and extract all specifications. JSON only.",
        }],
      }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("[AI] Tag scan failed:", error);
    return null;
  }
}
