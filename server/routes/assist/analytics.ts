// server/routes/assist/analytics.ts — GET /api/assist/analytics (operator only)

import { Router, type Request, type Response } from "express";
import { db } from "../../db";
import {
  assistConversations,
  assistSupportTickets,
  assistKnowledgeGaps,
} from "@shared/schema-assist";
import { sql, gte, and } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import { requireOperator } from "../../middleware/rbac";

const router = Router();

router.get("/", requireAuth, requireOperator, async (_req: Request, res: Response) => {
  try {
    const since = new Date();
    since.setDate(since.getDate() - 30);

    const [convStats] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        avgMessages: sql<number>`ROUND(AVG(message_count), 1)`,
        escalated: sql<number>`COUNT(*) FILTER (WHERE status = 'escalated')::int`,
        resolved: sql<number>`COUNT(*) FILTER (WHERE status = 'resolved')::int`,
        thumbsUp: sql<number>`COALESCE(SUM(thumbs_up_count), 0)::int`,
        thumbsDown: sql<number>`COALESCE(SUM(thumbs_down_count), 0)::int`,
      })
      .from(assistConversations)
      .where(gte(assistConversations.createdAt, since));

    const [ticketStats] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        open: sql<number>`COUNT(*) FILTER (WHERE status = 'open')::int`,
      })
      .from(assistSupportTickets)
      .where(gte(assistSupportTickets.createdAt, since));

    const [gapStats] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        newCount: sql<number>`COUNT(*) FILTER (WHERE status = 'new')::int`,
      })
      .from(assistKnowledgeGaps)
      .where(gte(assistKnowledgeGaps.createdAt, since));

    const topGaps = await db
      .select({
        question: assistKnowledgeGaps.question,
        frequency: assistKnowledgeGaps.frequency,
        autoDetected: assistKnowledgeGaps.autoDetected,
      })
      .from(assistKnowledgeGaps)
      .orderBy(sql`frequency DESC NULLS LAST`)
      .limit(8);

    const escalationRows = await db
      .select({
        type: assistConversations.escalationType,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(assistConversations)
      .where(
        and(
          gte(assistConversations.createdAt, since),
          sql`escalation_type IS NOT NULL`
        )
      )
      .groupBy(assistConversations.escalationType);

    const total = convStats?.total ?? 0;
    const resolved = convStats?.resolved ?? 0;

    return res.json({
      success: true,
      period: "last_30_days",
      conversations: {
        total,
        avgMessagesPerConversation: convStats?.avgMessages ?? 0,
        escalated: convStats?.escalated ?? 0,
        resolved,
        resolutionRate: total > 0 ? ((resolved / total) * 100).toFixed(1) + "%" : "N/A",
        thumbsUp: convStats?.thumbsUp ?? 0,
        thumbsDown: convStats?.thumbsDown ?? 0,
      },
      tickets: {
        total: ticketStats?.total ?? 0,
        open: ticketStats?.open ?? 0,
      },
      knowledgeGaps: {
        total: gapStats?.total ?? 0,
        new: gapStats?.newCount ?? 0,
        topGaps: topGaps.map((g) => ({
          question: g.question,
          frequency: g.frequency ?? 1,
          autoDetected: g.autoDetected ?? false,
        })),
      },
      escalationBreakdown: escalationRows.map((e) => ({
        type: e.type ?? "unknown",
        count: e.count,
      })),
    });
  } catch (err) {
    console.error("[assist/analytics]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
