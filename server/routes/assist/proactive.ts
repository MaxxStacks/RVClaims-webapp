// server/routes/assist/proactive.ts — GET /api/assist/proactive
// Returns a context-aware proactive suggestion when the dealer opens the Assist panel

import { Router, type Request, type Response } from "express";
import { requireAuth } from "../../middleware/auth";
import { requireDealer } from "../../middleware/rbac";
import { getProactiveSuggestion } from "../../lib/assist-proactive";

const router = Router();

router.get("/", requireAuth, requireDealer, async (req: Request, res: Response) => {
  try {
    const user = req.user!;
    if (!user.dealershipId) {
      return res.json({ success: true, suggestion: null });
    }

    const ctx = {
      userId: user.clerkUserId,
      dealerId: user.dealershipId,
      userRole: user.role,
      currentPage: (req.query.page as string) ?? "",
      unitId: (req.query.unitId as string) ?? undefined,
      claimId: (req.query.claimId as string) ?? undefined,
      unitCreatedDaysAgo: req.query.unitCreatedDaysAgo ? parseInt(req.query.unitCreatedDaysAgo as string) : undefined,
      unitClaimCount: req.query.unitClaimCount !== undefined ? parseInt(req.query.unitClaimCount as string) : undefined,
      unitPhotoCount: req.query.unitPhotoCount !== undefined ? parseInt(req.query.unitPhotoCount as string) : undefined,
      claimStatus: (req.query.claimStatus as string) ?? undefined,
      dealerUnitCount: req.query.dealerUnitCount !== undefined ? parseInt(req.query.dealerUnitCount as string) : undefined,
      dealerClaimCount: req.query.dealerClaimCount !== undefined ? parseInt(req.query.dealerClaimCount as string) : undefined,
      staffCount: req.query.staffCount !== undefined ? parseInt(req.query.staffCount as string) : undefined,
    };

    const suggestion = await getProactiveSuggestion(ctx);
    return res.json({ success: true, suggestion });
  } catch (err) {
    console.error("[assist/proactive]", err);
    return res.json({ success: true, suggestion: null }); // fail silently — don't break the panel
  }
});

export default router;
