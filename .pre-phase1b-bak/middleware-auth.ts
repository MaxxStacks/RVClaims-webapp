// server/middleware/auth.ts — JWT authentication middleware

import type { Request, Response, NextFunction } from "express";
import { verifyToken } from "../lib/auth";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { UserRole } from "@shared/constants";
import { TOKEN_TYPES } from "@shared/constants";

// Extend Express Request with authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;
        dealershipId: string | null;
        isActive: boolean;
      };
    }
  }
}

/**
 * Require valid JWT access token.
 * Attaches user object to req.user.
 * Returns 401 if missing/invalid/expired.
 */
export function requireAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return res.status(401).json({ success: false, message: "Authentication required" });
  }

  const token = authHeader.slice(7);

  verifyToken(token)
    .then(async (payload) => {
      if (!payload || payload.type !== TOKEN_TYPES.ACCESS) {
        return res.status(401).json({ success: false, message: "Invalid or expired token" });
      }

      // Fetch user from DB to ensure they still exist and are active
      const [user] = await db
        .select({
          id: users.id,
          email: users.email,
          firstName: users.firstName,
          lastName: users.lastName,
          role: users.role,
          dealershipId: users.dealershipId,
          isActive: users.isActive,
        })
        .from(users)
        .where(eq(users.id, payload.userId))
        .limit(1);

      if (!user || !user.isActive) {
        return res.status(401).json({ success: false, message: "Account not found or deactivated" });
      }

      req.user = {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role: user.role as UserRole,
        dealershipId: user.dealershipId,
        isActive: user.isActive,
      };

      next();
    })
    .catch(() => {
      return res.status(401).json({ success: false, message: "Authentication failed" });
    });
}

/**
 * Optional auth — attaches user if token present, continues either way.
 */
export function optionalAuth(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    return next();
  }

  const token = authHeader.slice(7);

  verifyToken(token)
    .then(async (payload) => {
      if (payload && payload.type === TOKEN_TYPES.ACCESS) {
        const [user] = await db
          .select({
            id: users.id,
            email: users.email,
            firstName: users.firstName,
            lastName: users.lastName,
            role: users.role,
            dealershipId: users.dealershipId,
            isActive: users.isActive,
          })
          .from(users)
          .where(eq(users.id, payload.userId))
          .limit(1);

        if (user && user.isActive) {
          req.user = {
            id: user.id,
            email: user.email,
            firstName: user.firstName,
            lastName: user.lastName,
            role: user.role as UserRole,
            dealershipId: user.dealershipId,
            isActive: user.isActive,
          };
        }
      }
      next();
    })
    .catch(() => next());
}
