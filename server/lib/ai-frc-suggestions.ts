// server/lib/ai-frc-suggestions.ts — AI FRC Code Matching
// Dealer describes a problem → AI suggests manufacturer-specific FRC codes
// Learns from operator corrections over time

import Anthropic from "@anthropic-ai/sdk";

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY;

let client: Anthropic | null = null;
if (ANTHROPIC_API_KEY) {
  client = new Anthropic({ apiKey: ANTHROPIC_API_KEY });
}

// ==================== FRC SUGGESTION ====================

export interface FrcSuggestion {
  code: string;
  description: string;
  confidence: number;        // 0-1
  defaultLaborHours: number;
  commonParts: string[];
  reasoning: string;         // why this code was suggested
}

export interface FrcSuggestionResult {
  suggestions: FrcSuggestion[];
  manufacturerNotes?: string;
}

const FRC_SYSTEM_PROMPT = `You are an expert RV warranty claims processor with 15+ years of experience. You know every manufacturer's FRC (Flat Rate Code) system inside and out.

Given a problem description from a dealer and the manufacturer name, suggest the most likely FRC codes that should be used for this warranty claim.

MANUFACTURERS AND THEIR SYSTEMS:
- Jayco: Uses Jayco-specific FRC codes. Common prefixes: body (B-), plumbing (P-), electrical (E-), HVAC (H-), appliance (A-), structural (S-), slide-out (SO-)
- Forest River: Uses Forest River repair codes. Similar category system with different numbering.
- Heartland: Uses Heartland warranty codes.
- Columbia Northwest: Uses CNW repair codes.
- Keystone: Uses Keystone FRC system.
- Midwest Automotive: Uses Midwest auto repair codes.

For EACH suggestion provide:
1. The FRC code (use realistic manufacturer-specific format)
2. Full description of what the code covers
3. Confidence score (0.0 to 1.0)
4. Default labor hours for this repair
5. Common parts needed
6. Brief reasoning for why this code matches

Return 1-5 suggestions ranked by confidence. If the description is vague, ask clarifying questions in the manufacturerNotes field.

Respond ONLY with valid JSON:
{
  "suggestions": [
    {
      "code": "B-1042",
      "description": "Entry door handle replacement",
      "confidence": 0.92,
      "defaultLaborHours": 0.5,
      "commonParts": ["Entry door handle assembly", "Mounting screws"],
      "reasoning": "Dealer described broken entry door handle — direct match"
    }
  ],
  "manufacturerNotes": "Optional notes about this type of claim for this manufacturer"
}`;

export async function suggestFrcCodes(
  problemDescription: string,
  manufacturer: string,
  rvType?: string,
  claimType?: string,
  previousCorrections?: Array<{ original: string; corrected: string; description: string }>
): Promise<FrcSuggestionResult | null> {
  if (!client) {
    console.warn("[AI] FRC suggestions not available — no API key");
    return null;
  }

  try {
    let userMessage = `Manufacturer: ${manufacturer}\n`;
    if (rvType) userMessage += `RV Type: ${rvType}\n`;
    if (claimType) userMessage += `Claim Type: ${claimType}\n`;
    userMessage += `\nProblem Description:\n${problemDescription}`;

    // Include correction history for learning
    if (previousCorrections && previousCorrections.length > 0) {
      userMessage += `\n\nPrevious corrections for this manufacturer (learn from these):`;
      for (const c of previousCorrections.slice(-10)) {
        userMessage += `\n- Description: "${c.description}" → AI suggested: ${c.original} → Operator corrected to: ${c.corrected}`;
      }
    }

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: FRC_SYSTEM_PROMPT,
      messages: [{ role: "user", content: userMessage }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("[AI] FRC suggestion failed:", error);
    return null;
  }
}

// ==================== PHOTO-BASED FRC SUGGESTION ====================

const PHOTO_FRC_PROMPT = `You are an expert RV warranty claims analyst. You're looking at a photo of damage or an issue on an RV.

Your job:
1. Identify what the issue is from the photo
2. Describe the damage/problem in technical terms
3. Suggest the appropriate FRC codes for the specified manufacturer
4. Estimate labor hours and parts needed

Be specific. "Water damage under slide-out seal" is better than "water damage".

Respond ONLY with valid JSON:
{
  "issueDescription": "Detailed description of what you see",
  "severity": "minor|moderate|major",
  "affectedArea": "entry door|slide-out|roof|plumbing|electrical|etc",
  "suggestions": [
    {
      "code": "string",
      "description": "string",
      "confidence": 0.0-1.0,
      "defaultLaborHours": 0.0,
      "commonParts": ["string"],
      "reasoning": "string"
    }
  ],
  "additionalNotes": "Any recommendations for the claims processor"
}`;

export interface PhotoFrcResult {
  issueDescription: string;
  severity: "minor" | "moderate" | "major";
  affectedArea: string;
  suggestions: FrcSuggestion[];
  additionalNotes?: string;
}

export async function suggestFrcFromPhoto(
  imageBase64: string,
  mimeType: string,
  manufacturer: string,
  dealerNotes?: string
): Promise<PhotoFrcResult | null> {
  if (!client) {
    console.warn("[AI] Photo FRC not available — no API key");
    return null;
  }

  try {
    const content: any[] = [
      {
        type: "image",
        source: {
          type: "base64",
          media_type: mimeType as "image/jpeg" | "image/png" | "image/gif" | "image/webp",
          data: imageBase64,
        },
      },
      {
        type: "text",
        text: `Manufacturer: ${manufacturer}\n${dealerNotes ? `Dealer notes: ${dealerNotes}\n` : ""}Analyze this photo and suggest FRC codes. JSON only.`,
      },
    ];

    const response = await client.messages.create({
      model: "claude-sonnet-4-20250514",
      max_tokens: 2048,
      system: PHOTO_FRC_PROMPT,
      messages: [{ role: "user", content }],
    });

    const textBlock = response.content.find((block) => block.type === "text");
    if (!textBlock || textBlock.type !== "text") return null;

    let jsonStr = textBlock.text.trim();
    if (jsonStr.startsWith("```json")) jsonStr = jsonStr.slice(7);
    if (jsonStr.startsWith("```")) jsonStr = jsonStr.slice(3);
    if (jsonStr.endsWith("```")) jsonStr = jsonStr.slice(0, -3);

    return JSON.parse(jsonStr.trim());
  } catch (error) {
    console.error("[AI] Photo FRC suggestion failed:", error);
    return null;
  }
}
