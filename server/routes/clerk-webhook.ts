// server/routes/clerk-webhook.ts — Clerk identity sync webhook
//
// Receives identity events from Clerk and keeps the local `users` table
// in sync. Verified via Svix HMAC signature using CLERK_WEBHOOK_SECRET.
//
// Subscribed events (configured in Clerk dashboard):
//   user.created, user.updated, user.deleted
//   organization.created, organization.updated
//   organizationMembership.created, organizationMembership.updated, organizationMembership.deleted

import { Router, type Request, type Response } from "express";
import { Webhook } from "svix";
import { db } from "../db";
import { users, dealerships } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { UserRole } from "@shared/constants";

const router = Router();

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getWebhookSecret(): string {
  const secret = process.env.CLERK_WEBHOOK_SECRET;
  if (!secret) throw new Error("CLERK_WEBHOOK_SECRET env var is required");
  return secret;
}

/**
 * Verify the Svix headers on an incoming request.
 * Throws if the signature is invalid.
 */
function verifyWebhook(req: Request): unknown {
  const svixId = req.header("svix-id");
  const svixTimestamp = req.header("svix-timestamp");
  const svixSignature = req.header("svix-signature");

  if (!svixId || !svixTimestamp || !svixSignature) {
    throw new Error("Missing svix headers");
  }

  // The body MUST be the raw bytes (not the parsed JSON object).
  // Express must be configured to give us the raw body for this route.
  const body = (req as any).rawBody;
  if (!body) {
    throw new Error("rawBody missing — check express.json verify configuration");
  }

  const wh = new Webhook(getWebhookSecret());
  return wh.verify(body, {
    "svix-id": svixId,
    "svix-timestamp": svixTimestamp,
    "svix-signature": svixSignature,
  });
}

/**
 * Extract the user's "primary role" from Clerk metadata.
 * We store role(s) in user.publicMetadata.roles (array) or fallback to
 * user.publicMetadata.role (string). Default = "client".
 */
function extractRoles(clerkUser: any): { role: UserRole; roles: UserRole[] } {
  const metaRoles = clerkUser.public_metadata?.roles;
  const metaRole = clerkUser.public_metadata?.role;

  let rolesArr: UserRole[] = [];
  if (Array.isArray(metaRoles) && metaRoles.length > 0) {
    rolesArr = metaRoles as UserRole[];
  } else if (typeof metaRole === "string" && metaRole) {
    rolesArr = [metaRole as UserRole];
  } else {
    rolesArr = ["client"];
  }

  return { role: rolesArr[0], roles: rolesArr };
}

/**
 * Get the user's primary email from Clerk's email_addresses array.
 */
function primaryEmail(clerkUser: any): string {
  const emails = clerkUser.email_addresses || [];
  const primaryId = clerkUser.primary_email_address_id;
  const primary = emails.find((e: any) => e.id === primaryId);
  return primary?.email_address || emails[0]?.email_address || "";
}

// ─── Webhook handler ──────────────────────────────────────────────────────────

router.post("/", async (req: Request, res: Response) => {
  let event: any;
  try {
    event = verifyWebhook(req);
  } catch (err) {
    console.error("[clerk-webhook] signature verification failed:", err);
    return res.status(400).json({ ok: false, error: "invalid signature" });
  }

  const { type, data } = event;

  try {
    switch (type) {
      // ──────────── USER ────────────
      case "user.created": {
        const email = primaryEmail(data);
        if (!email) {
          console.warn("[clerk-webhook] user.created with no email", data.id);
          return res.json({ ok: true, skipped: "no email" });
        }

        const { role, roles } = extractRoles(data);

        // Determine dealershipId from public_metadata if set by inviter
        const dealershipId: string | null = data.public_metadata?.dealershipId || null;

        // Upsert by clerkUserId (column added in 1B step 5)
        const existing = await db
          .select()
          .from(users)
          .where(eq(users.clerkUserId, data.id))
          .limit(1);

        if (existing.length > 0) {
          await db
            .update(users)
            .set({
              email,
              firstName: data.first_name || existing[0].firstName,
              lastName: data.last_name || existing[0].lastName,
              phone: data.phone_numbers?.[0]?.phone_number || existing[0].phone,
              role,
              roles,
              dealershipId,
              isActive: true,
              updatedAt: new Date(),
            })
            .where(eq(users.clerkUserId, data.id));
          console.log(`[clerk-webhook] user.created → updated existing: ${email}`);
        } else {
          await db.insert(users).values({
            email,
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone_numbers?.[0]?.phone_number || null,
            // Clerk owns the password; we keep an empty string for non-null constraint.
            // Auth never reads this column post-migration.
            passwordHash: "clerk_managed",
            role,
            roles,
            dealershipId,
            clerkUserId: data.id,
            isActive: true,
          });
          console.log(`[clerk-webhook] user.created → inserted: ${email}`);
        }

        // Phase 2C: auto-create pending dealership for public dealer signups
        const meta = data.public_metadata || {};
        if (meta.dealerSignupName && meta.role === "dealer_owner_pending") {
          const { dealerships } = await import("@shared/schema");
          const [pendingDealership] = await db.insert(dealerships).values({
            name: meta.dealerSignupName,
            email: email,
            status: "pending",
            reviewStatus: "pending_review",
            brandingTier: "base",
          }).returning();
          await db.update(users)
            .set({ dealershipId: pendingDealership.id, role: "dealer_owner", roles: ["dealer_owner"] })
            .where(eq(users.clerkUserId, data.id));
          console.log(`[clerk-webhook] Created pending dealership: ${pendingDealership.name}`);
        }
        break;
      }

      case "user.updated": {
        const email = primaryEmail(data);
        const { role, roles } = extractRoles(data);

        await db
          .update(users)
          .set({
            email,
            firstName: data.first_name || "",
            lastName: data.last_name || "",
            phone: data.phone_numbers?.[0]?.phone_number || null,
            role,
            roles,
            updatedAt: new Date(),
          })
          .where(eq(users.clerkUserId, data.id));
        console.log(`[clerk-webhook] user.updated: ${email}`);
        break;
      }

      case "user.deleted": {
        // Soft-delete: set isActive=false, don't remove the row (preserves FK integrity)
        await db
          .update(users)
          .set({ isActive: false, updatedAt: new Date() })
          .where(eq(users.clerkUserId, data.id));
        console.log(`[clerk-webhook] user.deleted (soft): ${data.id}`);
        break;
      }

      // ──────────── ORGANIZATION ────────────
      case "organization.created": {
        // Mirror Clerk org → dealership row (or skip if pre-existing)
        // Match by clerkOrgId column (added in 1B step 5)
        const existing = await db
          .select()
          .from(dealerships)
          .where(eq(dealerships.clerkOrgId, data.id))
          .limit(1);
        if (existing.length === 0) {
          await db.insert(dealerships).values({
            name: data.name,
            email: data.public_metadata?.contactEmail || "",
            clerkOrgId: data.id,
            status: "pending",
          });
          console.log(`[clerk-webhook] organization.created: ${data.name}`);
        }
        break;
      }

      case "organization.updated": {
        await db
          .update(dealerships)
          .set({ name: data.name, updatedAt: new Date() })
          .where(eq(dealerships.clerkOrgId, data.id));
        console.log(`[clerk-webhook] organization.updated: ${data.name}`);
        break;
      }

      // ──────────── ORG MEMBERSHIP ────────────
      case "organizationMembership.created":
      case "organizationMembership.updated": {
        const userId = data.public_user_data?.user_id;
        const orgId = data.organization?.id;
        if (!userId || !orgId) break;

        // Find local dealership by clerkOrgId
        const [dealership] = await db
          .select({ id: dealerships.id })
          .from(dealerships)
          .where(eq(dealerships.clerkOrgId, orgId))
          .limit(1);
        if (!dealership) break;

        await db
          .update(users)
          .set({ dealershipId: dealership.id, updatedAt: new Date() })
          .where(eq(users.clerkUserId, userId));
        console.log(`[clerk-webhook] org membership: user ${userId} → dealership ${dealership.id}`);
        break;
      }

      case "organizationMembership.deleted": {
        const userId = data.public_user_data?.user_id;
        if (!userId) break;
        await db
          .update(users)
          .set({ dealershipId: null, updatedAt: new Date() })
          .where(eq(users.clerkUserId, userId));
        console.log(`[clerk-webhook] org membership removed: user ${userId}`);
        break;
      }

      default:
        console.log(`[clerk-webhook] unhandled event type: ${type}`);
    }

    return res.json({ ok: true });
  } catch (err) {
    console.error("[clerk-webhook] handler error:", err);
    // Return 200 so Clerk doesn't retry on logic errors
    // (re-trying won't fix DB constraint violations etc.)
    return res.json({ ok: false, error: String(err) });
  }
});

export default router;
