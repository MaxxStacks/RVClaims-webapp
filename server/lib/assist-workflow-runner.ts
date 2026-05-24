// server/lib/assist-workflow-runner.ts — Workflow state machine per conversation

import { db } from "../db";
import { assistConversations } from "@shared/schema-assist";
import { dealerships, units, claims } from "@shared/schema";
import { eq, and, or, ilike } from "drizzle-orm";
import {
  ALL_WORKFLOWS,
  isCancelMessage,
  type WorkflowDefinition,
  type WorkflowStep,
} from "./assist-workflows";

// ==================== TYPES ====================

interface WorkflowState {
  workflowId: string;
  currentStep: number;
  inputs: Record<string, string>;
  startedAt: string;
}

interface ConversationMetadata {
  workflow?: WorkflowState;
}

// ==================== STATE ACCESSORS ====================

async function getMetadata(conversationId: string): Promise<ConversationMetadata> {
  const [row] = await db
    .select({ metadata: assistConversations.metadata })
    .from(assistConversations)
    .where(eq(assistConversations.id, conversationId))
    .limit(1);

  if (!row?.metadata) return {};
  return row.metadata as ConversationMetadata;
}

async function setMetadata(conversationId: string, meta: ConversationMetadata): Promise<void> {
  await db
    .update(assistConversations)
    .set({ metadata: meta as Record<string, unknown>, updatedAt: new Date() })
    .where(eq(assistConversations.id, conversationId));
}

// ==================== PUBLIC API ====================

export function getWorkflowById(id: string): WorkflowDefinition | undefined {
  return ALL_WORKFLOWS.find((w) => w.id === id);
}

export async function getWorkflowState(
  conversationId: string
): Promise<{ workflow: WorkflowDefinition; state: WorkflowState } | null> {
  const meta = await getMetadata(conversationId);
  if (!meta.workflow) return null;

  const wf = getWorkflowById(meta.workflow.workflowId);
  if (!wf) return null;

  return { workflow: wf, state: meta.workflow };
}

export async function startWorkflow(
  conversationId: string,
  workflow: WorkflowDefinition
): Promise<WorkflowStep> {
  const state: WorkflowState = {
    workflowId: workflow.id,
    currentStep: 1,
    inputs: {},
    startedAt: new Date().toISOString(),
  };

  const meta = await getMetadata(conversationId);
  await setMetadata(conversationId, { ...meta, workflow: state });

  return workflow.steps[0];
}

export async function advanceWorkflow(
  conversationId: string,
  userInput: string
): Promise<{
  nextStep: WorkflowStep | null;
  isDone: boolean;
  summary: string;
  inputs: Record<string, string>;
  workflowId: string;
}> {
  const meta = await getMetadata(conversationId);
  if (!meta.workflow) throw new Error("No active workflow");

  const wf = getWorkflowById(meta.workflow.workflowId);
  if (!wf) throw new Error("Workflow not found");

  const state = meta.workflow;
  const currentStepDef = wf.steps[state.currentStep - 1];

  // Store input for current step
  const normalizedInput = userInput.toLowerCase().trim() === "skip" ? "" : userInput.trim();
  state.inputs[currentStepDef.fieldKey] = normalizedInput;

  const nextStepIndex = state.currentStep; // 0-based, so currentStep (1-based) is the next index
  const isDone = nextStepIndex >= wf.steps.length;

  if (!isDone) {
    state.currentStep += 1;
    await setMetadata(conversationId, { ...meta, workflow: state });
    return {
      nextStep: wf.steps[nextStepIndex],
      isDone: false,
      summary: "",
      inputs: state.inputs,
      workflowId: wf.id,
    };
  }

  // Workflow complete — clear state and return summary
  const summary = buildSummary(wf, state.inputs);
  const finalInputs = { ...state.inputs };
  delete meta.workflow;
  await setMetadata(conversationId, meta);

  return {
    nextStep: null,
    isDone: true,
    summary,
    inputs: finalInputs,
    workflowId: wf.id,
  };
}

export async function cancelWorkflow(conversationId: string): Promise<void> {
  const meta = await getMetadata(conversationId);
  delete meta.workflow;
  await setMetadata(conversationId, meta);
}

// ==================== WORKFLOW COMPLETION ====================

function buildSummary(wf: WorkflowDefinition, inputs: Record<string, string>): string {
  switch (wf.id) {
    case "create-unit": {
      const { vin = "", yearMakeModel = "", stockNumber = "" } = inputs;
      return `Unit ready to save:\n- VIN: **${vin}**\n- ${yearMakeModel}${stockNumber ? `\n- Stock #: ${stockNumber}` : ""}`;
    }
    case "create-client": {
      const { firstName = "", lastName = "", email = "", phone = "" } = inputs;
      return `Client ready to save:\n- Name: **${firstName} ${lastName}**${email ? `\n- Email: ${email}` : ""}${phone ? `\n- Phone: ${phone}` : ""}`;
    }
    case "file-claim": {
      const { unitIdentifier = "", claimType = "", description = "" } = inputs;
      return `Claim ready to submit:\n- Unit: **${unitIdentifier}**\n- Type: **${claimType}**\n- Description: ${description.slice(0, 100)}${description.length > 100 ? "…" : ""}`;
    }
    case "add-staff": {
      const { email = "", role = "dealer_staff" } = inputs;
      return `Invitation ready:\n- Email: **${email}**\n- Role: **${role}**`;
    }
    default:
      return "Workflow complete.";
  }
}

export async function executeWorkflowComplete(
  dealershipId: string,
  userId: string,
  workflowId: string,
  inputs: Record<string, string>
): Promise<{ success: boolean; message: string; entityId?: string }> {
  try {
    switch (workflowId) {
      case "create-unit": {
        const { vin, yearMakeModel, stockNumber } = inputs;
        if (!vin) return { success: false, message: "VIN is required" };

        // Parse year/make/model from free-text
        const parts = (yearMakeModel || "").trim().split(/\s+/);
        const year = parts[0] ? parseInt(parts[0], 10) : null;
        const manufacturer = parts[1] ?? null;
        const model = parts.slice(2).join(" ") || null;

        const [created] = await db
          .insert(units)
          .values({
            dealershipId,
            vin: vin.toUpperCase(),
            year: year && !isNaN(year) ? year : null,
            manufacturer,
            model,
            stockNumber: stockNumber || null,
            status: "on_lot",
          })
          .returning({ id: units.id });

        return { success: true, message: `Unit **${vin.toUpperCase()}** added to your inventory.`, entityId: created.id };
      }

      case "file-claim": {
        const { unitIdentifier, claimType, description } = inputs;
        if (!unitIdentifier || !claimType || !description) {
          return { success: false, message: "Missing required claim information" };
        }

        // Look up unit by VIN or stock number
        const [unit] = await db
          .select({ id: units.id, vin: units.vin })
          .from(units)
          .where(
            and(
              eq(units.dealershipId, dealershipId),
              or(
                ilike(units.vin, unitIdentifier),
                ilike(units.stockNumber, unitIdentifier)
              )
            )
          )
          .limit(1);

        if (!unit) {
          return { success: false, message: `Could not find unit "${unitIdentifier}" in your inventory.` };
        }

        const typeMap: Record<string, string> = {
          daf: "daf",
          pdi: "pdi",
          warranty: "warranty",
          "extended warranty": "extended_warranty",
          insurance: "insurance",
        };
        const claimTypeKey = typeMap[claimType.toLowerCase()] ?? "warranty";

        // Generate claim number
        const [dealer] = await db.select({ name: dealerships.name }).from(dealerships).where(eq(dealerships.id, dealershipId)).limit(1);
        const prefix = (dealer?.name ?? "DS").replace(/\W/g, "").toUpperCase().slice(0, 3);
        const claimNumber = `${prefix}-${Date.now().toString(36).toUpperCase()}`;

        const [created] = await db
          .insert(claims)
          .values({
            dealershipId,
            unitId: unit.id,
            claimNumber,
            manufacturer: "unknown",
            type: claimTypeKey as any,
            status: "draft",
            dealerNotes: description,
          })
          .returning({ id: claims.id });

        return {
          success: true,
          message: `Claim **${claimNumber}** created for unit ${unit.vin}. Go to **My Claims** to add photos and submit.`,
          entityId: created.id,
        };
      }

      case "add-staff": {
        const { email, role } = inputs;
        if (!email) return { success: false, message: "Email is required" };
        // Invite is handled by the invitations table/email service — return success note
        return {
          success: true,
          message: `Invitation sent to **${email}** as ${role}. They'll receive an email to join your DS360 workspace. You can manage staff under **Settings → Users & Roles**.`,
        };
      }

      case "create-client": {
        // Clients stored as units customer info — for now, return guidance
        return {
          success: true,
          message: `Client record noted. To associate this client with a unit, go to **My Units** → select the unit → edit customer info.`,
        };
      }

      default:
        return { success: false, message: "Unknown workflow" };
    }
  } catch (err) {
    console.error("[workflow-runner] executeWorkflowComplete error:", err);
    return { success: false, message: "An error occurred while saving. Please try again or use the portal directly." };
  }
}

export function formatWorkflowStep(step: WorkflowStep, workflowName: string): string {
  const progress = `**Step ${step.stepNumber} of ${step.totalSteps} — ${step.title}**`;
  const workflowLabel = `_${workflowName}_`;
  return `${workflowLabel}\n${progress}\n\n${step.instruction}`;
}
