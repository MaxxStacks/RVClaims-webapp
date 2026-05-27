// server/middleware/operatorScope.ts — Scopes operator-facing API calls by operatorId
// ds360_superadmin: no filter (null = sees all operators)
// operator_admin / operator_staff: scoped to their operatorId
// All other roles: not affected — use for operator-facing routes only

import type { Request, Response, NextFunction } from "express";

declare global {
  namespace Express {
    interface Request {
      operatorId?: string | null;
    }
  }
}

export function operatorScope(req: Request, res: Response, next: NextFunction) {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  if (user.role === "ds360_superadmin") {
    // Superadmin sees everything — no filter
    req.operatorId = null;
  } else if ((user as any).operatorId) {
    req.operatorId = (user as any).operatorId as string;
  } else {
    // Fallback to default operator slug — API will resolve this
    req.operatorId = "ds360";
  }

  next();
}
