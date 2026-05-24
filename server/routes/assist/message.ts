// server/routes/assist/message.ts — DS360 Assist chat message endpoint
// POST /api/assist/message

import { Router, type Request, type Response } from "express";
import { db } from "../../db";
import { assistConversations, assistMessages, assistKnowledgeGaps } from "@shared/schema-assist";
import { eq, and, desc, sql } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import { requireDealer } from "../../middleware/rbac";
import { getAssistResponse, containsHedging } from "../../lib/assist-engine";
import { searchSimilar, formatKbContext } from "../../lib/vector-store";
import { buildAssistContext } from "../../lib/assist-context";
import {
  detectWorkflow,
  isCancelMessage,
} from "../../lib/assist-workflows";
import {
  getWorkflowState,
  startWorkflow,
  advanceWorkflow,
  cancelWorkflow,
  executeWorkflowComplete,
  formatWorkflowStep,
} from "../../lib/assist-workflow-runner";

const router = Router();

// POST /api/assist/message
router.post("/", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const { message, conversationId, currentPage } = req.body as {
      message: string;
      conversationId?: string;
      currentPage?: string;
    };

    if (!message || typeof message !== "string" || message.trim().length === 0) {
      return res.status(400).json({ success: false, message: "message is required" });
    }

    const user = req.user!;
    if (!user.dealershipId) {
      return res.status(403).json({ success: false, message: "No dealership assigned" });
    }

    // ── 1. Resolve or create conversation ──────────────────────────────────
    let convoId = conversationId;

    if (convoId) {
      const [existing] = await db
        .select()
        .from(assistConversations)
        .where(
          and(
            eq(assistConversations.id, convoId),
            eq(assistConversations.dealerId, user.dealershipId)
          )
        )
        .limit(1);

      if (!existing) {
        return res.status(404).json({ success: false, message: "Conversation not found" });
      }
    } else {
      const [newConvo] = await db
        .insert(assistConversations)
        .values({
          dealerId: user.dealershipId,
          userId: user.clerkUserId,
          userRole: user.role,
          status: "active",
        })
        .returning();
      convoId = newConvo.id;
    }

    // ── 2. Save user message ───────────────────────────────────────────────
    const [savedUserMsg] = await db
      .insert(assistMessages)
      .values({
        conversationId: convoId,
        role: "user",
        content: message,
        metadata: { currentPage: currentPage ?? null },
      })
      .returning();

    // ── 3. Check for active workflow ───────────────────────────────────────
    const activeWorkflow = await getWorkflowState(convoId);

    if (activeWorkflow) {
      // Handle cancellation mid-workflow
      if (isCancelMessage(message)) {
        await cancelWorkflow(convoId);
        const cancelMsg =
          "No problem, I've cancelled that workflow. Is there anything else I can help you with?";
        const [savedAssist] = await db
          .insert(assistMessages)
          .values({ conversationId: convoId, role: "assistant", content: cancelMsg })
          .returning();
        await db
          .update(assistConversations)
          .set({
            messageCount: sql`${assistConversations.messageCount} + 2`,
            updatedAt: new Date(),
          })
          .where(eq(assistConversations.id, convoId));
        return res.json({
          success: true,
          conversationId: convoId,
          response: cancelMsg,
          quickReplies: ["How do I file a claim?", "Add a new unit", "View my claims"],
          messageId: savedAssist.id,
        });
      }

      // Advance the workflow with the user's input
      const result = await advanceWorkflow(convoId, message);

      if (!result.isDone) {
        // Return next step prompt
        const nextStepText = formatWorkflowStep(result.nextStep!, activeWorkflow.workflow.name);
        const [savedAssist] = await db
          .insert(assistMessages)
          .values({
            conversationId: convoId,
            role: "assistant",
            content: nextStepText,
            metadata: {
              workflowId: result.workflowId,
              workflowStep: result.nextStep!.stepNumber,
              workflowStepDef: result.nextStep,
            },
          })
          .returning();
        await db
          .update(assistConversations)
          .set({
            messageCount: sql`${assistConversations.messageCount} + 2`,
            updatedAt: new Date(),
          })
          .where(eq(assistConversations.id, convoId));
        return res.json({
          success: true,
          conversationId: convoId,
          response: nextStepText,
          quickReplies: ["Cancel"],
          messageId: savedAssist.id,
          workflowStep: result.nextStep,
        });
      }

      // Workflow done — execute it
      const execResult = await executeWorkflowComplete(
        user.dealershipId,
        user.clerkUserId,
        result.workflowId,
        result.inputs
      );

      const finalMsg = execResult.success
        ? `${result.summary}\n\n✅ ${execResult.message}\n\nIs there anything else I can help you with?`
        : `I couldn't complete that action: ${execResult.message}\n\nPlease try again or use the portal directly. Can I help with something else?`;

      const [savedAssist] = await db
        .insert(assistMessages)
        .values({ conversationId: convoId, role: "assistant", content: finalMsg, metadata: { workflowComplete: true, entityId: execResult.entityId } })
        .returning();
      await db
        .update(assistConversations)
        .set({
          messageCount: sql`${assistConversations.messageCount} + 2`,
          updatedAt: new Date(),
        })
        .where(eq(assistConversations.id, convoId));
      return res.json({
        success: true,
        conversationId: convoId,
        response: finalMsg,
        quickReplies: ["File a claim", "Add another unit", "View my claims"],
        messageId: savedAssist.id,
      });
    }

    // ── 4. Check if message triggers a NEW workflow ─────────────────────────
    if (!isCancelMessage(message)) {
      const newWorkflow = detectWorkflow(message);
      if (newWorkflow) {
        const firstStep = await startWorkflow(convoId, newWorkflow);
        const introText = `Sure! Let me walk you through it.\n\n${formatWorkflowStep(firstStep, newWorkflow.name)}`;
        const [savedAssist] = await db
          .insert(assistMessages)
          .values({
            conversationId: convoId,
            role: "assistant",
            content: introText,
            metadata: { workflowId: newWorkflow.id, workflowStep: 1, workflowStepDef: firstStep },
          })
          .returning();
        await db
          .update(assistConversations)
          .set({
            messageCount: sql`${assistConversations.messageCount} + 2`,
            updatedAt: new Date(),
          })
          .where(eq(assistConversations.id, convoId));
        return res.json({
          success: true,
          conversationId: convoId,
          response: introText,
          quickReplies: ["Cancel"],
          messageId: savedAssist.id,
          workflowStep: firstStep,
        });
      }
    }

    // ── 5. Get conversation history (last 20 messages) ─────────────────────
    const recentMessages = await db
      .select()
      .from(assistMessages)
      .where(eq(assistMessages.conversationId, convoId))
      .orderBy(desc(assistMessages.createdAt))
      .limit(21);

    const history = recentMessages
      .reverse()
      .filter((m) => (m.role === "user" || m.role === "assistant") && m.id !== savedUserMsg.id)
      .map((m) => ({ role: m.role as "user" | "assistant", content: m.content }));

    // ── 6. Build dynamic context ───────────────────────────────────────────
    const ctx = await buildAssistContext(
      user.dealershipId,
      user.clerkUserId,
      user.role,
      currentPage ?? ""
    );

    // ── 7. Vector search for KB articles ──────────────────────────────────
    let kbContext = "";
    try {
      const relevant = await searchSimilar(message, 5);
      kbContext = formatKbContext(relevant);
    } catch {
      // non-critical
    }

    // ── 8. Call Claude ────────────────────────────────────────────────────
    const { response: assistResponse, quickReplies } = await getAssistResponse(
      message,
      history,
      kbContext,
      ctx
    );

    // ── 9. Save assistant message ─────────────────────────────────────────
    const [savedAssist] = await db
      .insert(assistMessages)
      .values({
        conversationId: convoId,
        role: "assistant",
        content: assistResponse,
        metadata: { kb_sources: [], quickReplies },
      })
      .returning();

    await db
      .update(assistConversations)
      .set({
        messageCount: sql`${assistConversations.messageCount} + 2`,
        updatedAt: new Date(),
      })
      .where(eq(assistConversations.id, convoId));

    // ── 10. Auto-detect knowledge gaps ───────────────────────────────────
    if (containsHedging(assistResponse)) {
      db.insert(assistKnowledgeGaps)
        .values({
          conversationId: convoId,
          messageId: savedAssist.id,
          question: message.slice(0, 500),
          frequency: 1,
          status: "new",
          autoDetected: true,
        })
        .catch((e) => console.error("[assist] knowledge gap insert failed:", e));
    }

    return res.json({
      success: true,
      conversationId: convoId,
      response: assistResponse,
      quickReplies,
      messageId: savedAssist.id,
    });
  } catch (err) {
    console.error("Assist message error:", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
