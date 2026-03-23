// server/middleware/rbac.ts — Role-based access control + multi-tenant scoping

import type { Request, Response, NextFunction } from "express";
import { PERMISSIONS, OPERATOR_ROLES, DEALER_ROLES, type UserRole } from "@shared/constants";

/**
 * Require user to have one of the specified roles.
 * Must be used AFTER requireAuth middleware.
 */
export function requireRole(...allowedRoles: UserRole[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    next();
  };
}

/**
 * Require user to have a specific permission from the PERMISSIONS matrix.
 */
export function requirePermission(permission: keyof typeof PERMISSIONS["operator_admin"]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({ success: false, message: "Authentication required" });
    }

    const perms = PERMISSIONS[req.user.role];
    if (!perms || !perms[permission]) {
      return res.status(403).json({ success: false, message: "Insufficient permissions" });
    }

    next();
  };
}

/**
 * Require operator-level access (operator_admin or operator_staff).
 */
export function requireOperator(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  if (!OPERATOR_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Operator access required" });
  }

  next();
}

/**
 * Require dealer-level access (dealer_owner or dealer_staff).
 */
export function requireDealer(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  if (!DEALER_ROLES.includes(req.user.role)) {
    return res.status(403).json({ success: false, message: "Dealer access required" });
  }

  next();
}

/**
 * Scope query to dealership for dealer roles.
 * Operators see everything. Dealers see only their own.
 * Attaches `req.scopedDealershipId` — use in queries.
 */
declare global {
  namespace Express {
    interface Request {
      scopedDealershipId?: string | null;
    }
  }
}

export function scopeToDealership(req: Request, res: Response, next: NextFunction) {
  if (!req.user) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  if (OPERATOR_ROLES.includes(req.user.role)) {
    // Operators can optionally filter by dealership via query param
    req.scopedDealershipId = (req.query.dealershipId as string) || null;
  } else if (DEALER_ROLES.includes(req.user.role) || req.user.role === "client") {
    // Dealers and clients ALWAYS scoped to their dealership
    if (!req.user.dealershipId) {
      return res.status(403).json({ success: false, message: "No dealership assigned" });
    }
    req.scopedDealershipId = req.user.dealershipId;
  }

  next();
}

/**
 * Verify the user can access a specific dealership's data.
 * Operators can access any. Dealers can only access their own.
 */
export function canAccessDealership(dealershipId: string, user: Express.Request["user"]): boolean {
  if (!user) return false;
  if (OPERATOR_ROLES.includes(user.role)) return true;
  return user.dealershipId === dealershipId;
}
