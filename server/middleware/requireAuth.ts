import type { Request, Response, NextFunction } from "express";
import { verifyAccessToken, type JwtPayload } from "../auth.js";
import type { UserRole } from "@shared/constants";

/**
 * Verifies the Bearer access token in Authorization header.
 * Attaches decoded payload to req.user on success.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader?.startsWith("Bearer ")) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  const token = authHeader.slice(7);

  try {
    req.user = verifyAccessToken(token);
    next();
  } catch {
    return res
      .status(401)
      .json({ success: false, message: "Invalid or expired token" });
  }
}

/**
 * Checks that req.user.role is one of the allowed roles.
 * Must be used after requireAuth.
 *
 * Usage:
 *   router.get('/admin', requireAuth, requireRole('operator', 'operator_staff'), handler)
 */
export function requireRole(...roles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res
        .status(401)
        .json({ success: false, message: "Authentication required" });
    }

    if (!roles.includes(req.user.role)) {
      return res
        .status(403)
        .json({ success: false, message: "Insufficient permissions" });
    }

    next();
  };
}

/**
 * Ensures that dealer-role users can only access data scoped to their own
 * dealerId. Operators bypass this check entirely.
 *
 * Attach req.params.dealerId (or similar) before using this guard.
 */
export function requireDealerScope(
  req: Request,
  res: Response,
  next: NextFunction
) {
  const user = req.user;
  if (!user) {
    return res
      .status(401)
      .json({ success: false, message: "Authentication required" });
  }

  // Operators see everything — no scope restriction
  if (user.role === "operator" || user.role === "operator_staff") {
    return next();
  }

  // Dealer roles must match their own dealerId
  const requestedDealerId =
    req.params.dealerId ?? (req.body as Record<string, unknown>)?.dealerId;

  if (!requestedDealerId || requestedDealerId !== user.dealerId) {
    return res
      .status(403)
      .json({ success: false, message: "Access denied: wrong dealership scope" });
  }

  next();
}
