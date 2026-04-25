// server/middleware/auth.ts — Clerk session token verification middleware

import type { Request, Response, NextFunction } from "express";
import { getAuth } from "@clerk/express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { UserRole } from "@shared/constants";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        clerkUserId: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        roles: UserRole[];
        dealershipId: string | null;
        isActive: boolean;
      };
    }
  }
}

export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const { userId: clerkUserId } = getAuth(req);

  if (!clerkUserId) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  db.select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1)
    .then(([user]) => {
      if (!user) {
        return res.status(401).json({ success: false, message: "User record not synced. Try again in a moment." });
      }
      if (!user.isActive) {
        return res.status(401).json({ success: false, message: "Account deactivated" });
      }

      req.user = {
        id: user.id,
        clerkUserId: user.clerkUserId!,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        roles: (user.roles as UserRole[]) || [user.role as UserRole],
        dealershipId: user.dealershipId,
        isActive: user.isActive,
      };

      next();
    })
    .catch((err) => {
      console.error("[requireAuth] DB lookup failed:", err);
      return res.status(500).json({ success: false, message: "Authentication error" });
    });
}

export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const { userId: clerkUserId } = getAuth(req);
  if (!clerkUserId) return next();

  db.select()
    .from(users)
    .where(eq(users.clerkUserId, clerkUserId))
    .limit(1)
    .then(([user]) => {
      if (user && user.isActive) {
        req.user = {
          id: user.id,
          clerkUserId: user.clerkUserId!,
          email: user.email,
          firstName: user.firstName,
          lastName: user.lastName,
          role: user.role as UserRole,
          roles: (user.roles as UserRole[]) || [user.role as UserRole],
          dealershipId: user.dealershipId,
          isActive: user.isActive,
        };
      }
      next();
    })
    .catch(() => next());
}
