// server/routes/assist/analytics.ts — GET /api/assist/analytics (operator only)
// Comprehensive analytics: overview, escalations, gaps, dealer activity, heatmap, remote

import { Router, type Request, type Response } from "express";
import { db } from "../../db";
import {
  assistConversations,
  assistMessages,
  assistSupportTickets,
  assistKnowledgeGaps,
} from "@shared/schema-assist";
import { remoteSessions } from "@shared/schema-remote-support";
import { dealerships } from "@shared/schema";
import { sql, gte, and, lt, desc } from "drizzle-orm";
import { requireAuth } from "../../middleware/auth";
import { requireOperator } from "../../middleware/rbac";

const router = Router();

function sinceDate(days: number): Date {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d;
}

router.get("/", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const days = parseInt((req.query.days as string) ?? "30", 10) || 30;
    const since = sinceDate(days);
    const prevSince = sinceDate(days * 2);

    // ── Section A: Overview Stats ────────────────────────────────────────────

    const [convCur] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        uniqueDealers: sql<number>`COUNT(DISTINCT dealer_id)::int`,
        escalated: sql<number>`COUNT(*) FILTER (WHERE status = 'escalated')::int`,
        resolved: sql<number>`COUNT(*) FILTER (WHERE status = 'resolved')::int`,
        avgSatisfaction: sql<number>`ROUND(AVG(satisfaction_rating) FILTER (WHERE satisfaction_rating IS NOT NULL), 2)`,
      })
      .from(assistConversations)
      .where(gte(assistConversations.createdAt, since));

    const [convPrev] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        escalated: sql<number>`COUNT(*) FILTER (WHERE status = 'escalated')::int`,
        resolved: sql<number>`COUNT(*) FILTER (WHERE status = 'resolved')::int`,
      })
      .from(assistConversations)
      .where(and(gte(assistConversations.createdAt, prevSince), lt(assistConversations.createdAt, since)));

    const [msgCur] = await db
      .select({ total: sql<number>`COUNT(*)::int` })
      .from(assistMessages)
      .where(gte(assistMessages.createdAt, since));

    const [msgPrev] = await db
      .select({ total: sql<number>`COUNT(*)::int` })
      .from(assistMessages)
      .where(and(gte(assistMessages.createdAt, prevSince), lt(assistMessages.createdAt, since)));

    const [ticketStats] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        open: sql<number>`COUNT(*) FILTER (WHERE status = 'open')::int`,
      })
      .from(assistSupportTickets)
      .where(gte(assistSupportTickets.createdAt, since));

    const pct = (cur: number, prev: number): number | null => {
      if (prev === 0) return null;
      return Math.round(((cur - prev) / prev) * 100);
    };

    const totalCur = convCur?.total ?? 0;
    const totalPrev = convPrev?.total ?? 0;
    const escalatedCur = convCur?.escalated ?? 0;
    const resolvedCur = convCur?.resolved ?? 0;

    // ── Section B: Escalation Breakdown ─────────────────────────────────────

    const escalationByType = await db
      .select({
        type: assistConversations.escalationType,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(assistConversations)
      .where(and(gte(assistConversations.createdAt, since), sql`escalation_type IS NOT NULL`))
      .groupBy(assistConversations.escalationType);

    const ticketCategories = await db
      .select({
        category: assistSupportTickets.category,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(assistSupportTickets)
      .where(gte(assistSupportTickets.createdAt, since))
      .groupBy(assistSupportTickets.category);

    // ── Section C: Conversations over time (daily) ───────────────────────────

    const dailyConvRows = await db
      .select({
        day: sql<string>`DATE_TRUNC('day', created_at)::text`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(assistConversations)
      .where(gte(assistConversations.createdAt, since))
      .groupBy(sql`DATE_TRUNC('day', created_at)`)
      .orderBy(sql`DATE_TRUNC('day', created_at) ASC`);

    // ── Section D: Knowledge Gaps ────────────────────────────────────────────

    const topGaps = await db
      .select({
        id: assistKnowledgeGaps.id,
        question: assistKnowledgeGaps.question,
        frequency: assistKnowledgeGaps.frequency,
        status: assistKnowledgeGaps.status,
        kbArticleId: assistKnowledgeGaps.kbArticleId,
        autoDetected: assistKnowledgeGaps.autoDetected,
      })
      .from(assistKnowledgeGaps)
      .orderBy(sql`frequency DESC NULLS LAST`)
      .limit(20);

    // ── Section E: Dealer Activity ────────────────────────────────────────────

    const dealerActivity = await db
      .select({
        dealerId: assistConversations.dealerId,
        conversations: sql<number>`COUNT(*)::int`,
        escalations: sql<number>`COUNT(*) FILTER (WHERE status = 'escalated')::int`,
        avgSatisfaction: sql<number>`ROUND(AVG(satisfaction_rating) FILTER (WHERE satisfaction_rating IS NOT NULL), 1)`,
      })
      .from(assistConversations)
      .where(gte(assistConversations.createdAt, since))
      .groupBy(assistConversations.dealerId)
      .orderBy(sql`COUNT(*) DESC`)
      .limit(10);

    // Lookup dealership names
    const dealerNames: Record<string, string> = {};
    if (dealerActivity.length > 0) {
      const ids = dealerActivity.map((d) => d.dealerId);
      const nameRows = await db
        .select({ id: dealerships.id, name: dealerships.name })
        .from(dealerships)
        .where(sql`id = ANY(ARRAY[${sql.join(ids.map((id) => sql`${id}::uuid`), sql`, `)}])`);
      for (const row of nameRows) dealerNames[row.id] = row.name;
    }

    // ── Section F: Hourly Heatmap ─────────────────────────────────────────────

    const heatmapRows = await db
      .select({
        hour: sql<number>`EXTRACT(HOUR FROM created_at)::int`,
        dow: sql<number>`EXTRACT(DOW FROM created_at)::int`,
        count: sql<number>`COUNT(*)::int`,
      })
      .from(assistMessages)
      .where(gte(assistMessages.createdAt, since))
      .groupBy(sql`EXTRACT(HOUR FROM created_at)`, sql`EXTRACT(DOW FROM created_at)`);

    // Build 7×24 matrix (dow 0-6, hour 0-23)
    const heatmap: number[][] = Array.from({ length: 7 }, () => new Array(24).fill(0));
    for (const row of heatmapRows) {
      if (row.dow >= 0 && row.dow < 7 && row.hour >= 0 && row.hour < 24) {
        heatmap[row.dow][row.hour] = row.count;
      }
    }

    // ── Section G: Remote Support Stats ─────────────────────────────────────

    const [remoteStats] = await db
      .select({
        total: sql<number>`COUNT(*)::int`,
        withTakeover: sql<number>`COUNT(*) FILTER (WHERE takeover_granted = true)::int`,
      })
      .from(remoteSessions)
      .where(gte(remoteSessions.createdAt, since));

    // Average duration: from connectedAt to endedAt for ended sessions
    const [remoteDuration] = await db
      .select({
        avgMs: sql<number>`ROUND(AVG(EXTRACT(EPOCH FROM (ended_at - connected_at)) * 1000)) FILTER (WHERE ended_at IS NOT NULL AND connected_at IS NOT NULL)`,
      })
      .from(remoteSessions)
      .where(and(gte(remoteSessions.createdAt, since), sql`status = 'ended'`));

    return res.json({
      success: true,
      period: `last_${days}_days`,
      days,

      overview: {
        totalConversations: { value: totalCur, change: pct(totalCur, totalPrev) },
        totalMessages: { value: msgCur?.total ?? 0, change: pct(msgCur?.total ?? 0, msgPrev?.total ?? 0) },
        uniqueDealers: { value: convCur?.uniqueDealers ?? 0 },
        resolutionRate: {
          value: totalCur > 0 ? +((resolvedCur / totalCur) * 100).toFixed(1) : 0,
          change: pct(
            totalCur > 0 ? resolvedCur / totalCur : 0,
            totalPrev > 0 ? (convPrev?.resolved ?? 0) / totalPrev : 0
          ),
        },
        escalationRate: {
          value: totalCur > 0 ? +((escalatedCur / totalCur) * 100).toFixed(1) : 0,
          change: pct(
            totalCur > 0 ? escalatedCur / totalCur : 0,
            totalPrev > 0 ? (convPrev?.escalated ?? 0) / totalPrev : 0
          ),
        },
        avgSatisfaction: { value: convCur?.avgSatisfaction ?? null },
        openTickets: { value: ticketStats?.open ?? 0 },
      },

      escalationBreakdown: {
        byType: escalationByType.reduce<Record<string, number>>((acc, e) => {
          acc[e.type ?? "unknown"] = e.count;
          return acc;
        }, {}),
        byCategory: ticketCategories.reduce<Record<string, number>>((acc, t) => {
          acc[t.category ?? "General"] = t.count;
          return acc;
        }, {}),
      },

      dailyConversations: dailyConvRows.map((r) => ({
        date: r.day.slice(0, 10),
        count: r.count,
      })),

      knowledgeGaps: topGaps.map((g) => ({
        id: g.id,
        question: g.question,
        frequency: g.frequency ?? 1,
        status: g.status ?? "new",
        kbArticleId: g.kbArticleId,
        autoDetected: g.autoDetected ?? false,
      })),

      dealerActivity: dealerActivity.map((d) => ({
        dealerId: d.dealerId,
        dealerName: dealerNames[d.dealerId] ?? "Unknown Dealer",
        conversations: d.conversations,
        escalations: d.escalations,
        avgSatisfaction: d.avgSatisfaction,
      })),

      heatmap,

      remoteSupport: {
        totalSessions: remoteStats?.total ?? 0,
        avgDurationMs: remoteDuration?.avgMs ?? null,
        takeoverRate: remoteStats?.total
          ? +((((remoteStats.withTakeover ?? 0) / remoteStats.total) * 100).toFixed(1))
          : 0,
      },
    });
  } catch (err) {
    console.error("[assist/analytics]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

// ── PATCH /api/assist/analytics/gaps/:id — dismiss a knowledge gap ──────────
router.patch("/gaps/:id", requireAuth, requireOperator, async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { status } = req.body as { status?: string };
    if (!["dismissed", "resolved", "new"].includes(status ?? "")) {
      return res.status(400).json({ success: false, message: "Invalid status" });
    }
    await db
      .update(assistKnowledgeGaps)
      .set({ status: status ?? "dismissed", updatedAt: new Date() })
      .where(sql`id = ${id}::uuid`);
    return res.json({ success: true });
  } catch (err) {
    console.error("[assist/analytics PATCH gap]", err);
    return res.status(500).json({ success: false, message: "Internal server error" });
  }
});

export default router;
