# PHASE1B-AUTONOMOUS.md
## DS360 Phase 1 Run 1B — Clerk Auth Migration

**Mode:** `claude --dangerously-skip-permissions`
**Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing `PHASE1B-DEPLOY-REPORT.md`.**

**This run replaces the project's dual custom auth system with Clerk.**

---

## What this run does (high-level)

1. Wipes all 10 existing test users from the `users` table (pre-launch, no production data)
2. Adds `clerk_user_id` column to `users` and `clerk_org_id` column to `dealerships`
3. Installs `@clerk/clerk-react` (frontend) + `@clerk/express` + `svix` (backend)
4. Wraps the React app in `<ClerkProvider>` and replaces login pages with Clerk components
5. Rewrites `server/middleware/auth.ts` to verify Clerk session tokens
6. Adds the Clerk webhook handler at `POST /api/webhooks/clerk` to sync identity → local users
7. Deletes the two old custom auth systems (5 files) and their old login pages
8. Updates frontend `apiFetch` to fetch Clerk session tokens instead of in-memory token
9. Verifies build, commits, pushes, deploys, writes report

---

## Inputs (in project root)

| File | Purpose |
|---|---|
| `PHASE1B-AUTONOMOUS.md` | This spec |
| `PHASE1B-CLERK-WEBHOOK.ts` | The webhook handler — copy to `server/routes/clerk-webhook.ts` |
| `.env` | Already contains the Clerk secret keys (CLERK_SECRET_KEY, CLERK_WEBHOOK_SECRET, VITE_CLERK_PUBLISHABLE_KEY) — do NOT regenerate |

---

## Pre-baked Clerk values (verified)

```
VITE_CLERK_PUBLISHABLE_KEY = pk_test_YXJ0aXN0aWMtZXdlLTY1LmNsZXJrLmFjY291bnRzLmRldiQ
Clerk frontend domain = artistic-ewe-65.clerk.accounts.dev
Webhook URL = https://dealersuite360.com/api/webhooks/clerk
Webhook events subscribed (8): user.created, user.updated, user.deleted,
  organization.created, organization.updated,
  organizationMembership.created, organizationMembership.updated, organizationMembership.deleted
Sign-in methods enabled: Email, Phone, Username, Google (dev creds), Microsoft (dev creds)
Organizations: enabled with "Membership required (Standard)"
```

---

## Step 1 — Backup files about to be modified or deleted

```bash
mkdir -p .pre-phase1b-bak
cp shared/schema.ts .pre-phase1b-bak/schema.ts
cp server/middleware/auth.ts .pre-phase1b-bak/middleware-auth.ts
cp server/lib/auth.ts .pre-phase1b-bak/lib-auth.ts
cp server/auth.ts .pre-phase1b-bak/auth.ts 2>/dev/null || true
cp server/auth-routes.ts .pre-phase1b-bak/auth-routes.ts 2>/dev/null || true
cp server/routes/auth.ts .pre-phase1b-bak/routes-auth.ts 2>/dev/null || true
cp server/middleware/requireAuth.ts .pre-phase1b-bak/middleware-requireAuth.ts 2>/dev/null || true
cp client/src/lib/api.ts .pre-phase1b-bak/api.ts 2>/dev/null || true
cp client/src/lib/auth-api.ts .pre-phase1b-bak/auth-api.ts 2>/dev/null || true
echo "Backups stored under .pre-phase1b-bak/"
```

---

## Step 2 — Verify .env has the Clerk keys

```bash
grep -c "VITE_CLERK_PUBLISHABLE_KEY" .env
grep -c "CLERK_SECRET_KEY" .env
grep -c "CLERK_WEBHOOK_SECRET" .env
```

All three must return `1`. If any returns `0`, STOP and report — Jonathan has not added them yet.

---

## Step 3 — Install Clerk + svix packages

```bash
npm install @clerk/clerk-react @clerk/express svix
```

Verify `package.json` now contains the three packages.

---

## Step 4 — Wipe existing users

Run this in a one-off TS script — `scripts/wipe-users-pre-clerk.ts`:

```ts
import { db } from "../server/db";
import { users, sessions } from "../shared/schema";

async function main() {
  // Delete sessions first to avoid FK violations
  await db.delete(sessions);
  const deleted = await db.delete(users);
  console.log("All users wiped. Ready for Clerk-driven creation.");
}

main().then(() => process.exit(0)).catch(err => { console.error(err); process.exit(1); });
```

```bash
npx tsx scripts/wipe-users-pre-clerk.ts
```

---

## Step 5 — Add Clerk linkage columns to schema

Edit `shared/schema.ts`:

**A.** In the `users` pgTable, after the `roles` field, add:

```ts
  clerkUserId: text("clerk_user_id").unique(),
```

Make `passwordHash` nullable (Clerk owns passwords now):

Find:
```ts
  passwordHash: text("password_hash").notNull(),
```

Replace with:
```ts
  passwordHash: text("password_hash"),
```

**B.** In the `dealerships` pgTable, before the closing `});`, add:

```ts
  clerkOrgId: text("clerk_org_id").unique(),
```

**C.** Generate + apply migration:

```bash
npx drizzle-kit generate
```

Inspect the generated SQL. Should contain:
- `ALTER TABLE users ADD COLUMN clerk_user_id text UNIQUE;`
- `ALTER TABLE users ALTER COLUMN password_hash DROP NOT NULL;`
- `ALTER TABLE dealerships ADD COLUMN clerk_org_id text UNIQUE;`

**No DROP TABLE statements should appear.** If any exist, STOP and report.

```bash
npx drizzle-kit push
```

---

## Step 6 — Drop in the Clerk webhook handler

```bash
mkdir -p server/routes
cp PHASE1B-CLERK-WEBHOOK.ts server/routes/clerk-webhook.ts
```

---

## Step 7 — Wire the webhook into Express + capture rawBody

Find the main Express app file. Likely:
- `server/index.ts`
- `server/app.ts`
- `server/main.ts`

```bash
find . -name "index.ts" -path "*/server/*" -not -path "*/node_modules/*" | head -3
```

In that file, BEFORE the `express.json()` middleware is registered, add a rawBody capture for the webhook route. Find the `express.json()` line and replace it (or add before it):

```ts
import clerkWebhookRouter from "./routes/clerk-webhook";

// IMPORTANT: rawBody capture must be set before express.json() OR
// the webhook route must be mounted BEFORE express.json() processes the body.
// Use express.json with verify to keep raw bytes accessible.
app.use(express.json({
  verify: (req: any, _res, buf) => { req.rawBody = buf; }
}));

// Mount the Clerk webhook router
app.use("/api/webhooks/clerk", clerkWebhookRouter);
```

If the project uses a router-mounting pattern instead of `app.use` directly, follow that pattern but ensure `/api/webhooks/clerk` resolves to the new router.

---

## Step 8 — Rewrite the auth middleware to verify Clerk tokens

Replace the entire contents of `server/middleware/auth.ts` with:

```ts
// server/middleware/auth.ts — Clerk session token verification middleware

import type { Request, Response, NextFunction } from "express";
import { clerkMiddleware, getAuth, requireAuth as clerkRequireAuth } from "@clerk/express";
import { db } from "../db";
import { users } from "@shared/schema";
import { eq } from "drizzle-orm";
import type { UserRole } from "@shared/constants";

// Extend Express Request with our shape of authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;                  // local users.id (UUID)
        clerkUserId: string;         // Clerk user ID
        email: string;
        firstName: string;
        lastName: string;
        role: UserRole;              // primary role
        roles: UserRole[];           // multi-role array
        dealershipId: string | null;
        isActive: boolean;
      };
    }
  }
}

/**
 * Required Express setup once (in main app file):
 *   app.use(clerkMiddleware());
 * That populates req.auth with Clerk session info on every request.
 *
 * Then `requireAuth` middleware below ensures the session is present and
 * loads the local user record.
 */

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
        // Clerk-known user not in our DB yet (race vs. webhook). Reject.
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

/**
 * Optional auth — attach user if Clerk session present, continue either way.
 */
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
```

---

## Step 9 — Add clerkMiddleware to main app

In the same file as Step 7 (the main Express app file), add at the top with other imports:

```ts
import { clerkMiddleware } from "@clerk/express";
```

Then BEFORE any route registration but AFTER the rawBody/express.json setup:

```ts
app.use(clerkMiddleware());
```

---

## Step 10 — Update frontend: wrap app in ClerkProvider

Find the React entry file:

```bash
find client/src -name "main.tsx" -o -name "App.tsx" -o -name "index.tsx" | head -5
```

In `client/src/main.tsx` (or wherever `ReactDOM.createRoot` lives), wrap the root component:

```tsx
import { ClerkProvider } from "@clerk/clerk-react";

const PUBLISHABLE_KEY = import.meta.env.VITE_CLERK_PUBLISHABLE_KEY;
if (!PUBLISHABLE_KEY) throw new Error("Missing VITE_CLERK_PUBLISHABLE_KEY");

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <ClerkProvider
      publishableKey={PUBLISHABLE_KEY}
      appearance={{
        variables: {
          colorPrimary: "#033280",
        },
      }}
    >
      <App />
    </ClerkProvider>
  </React.StrictMode>
);
```

---

## Step 11 — Replace existing login pages with Clerk components

Find existing login pages:

```bash
find client/src -path "*login*" -o -path "*signin*" -o -path "*signup*" | head -10
```

For each login page (likely `client/src/pages/login.tsx`, `client/src/pages/dealer-login.tsx`, etc.), replace contents with:

```tsx
// client/src/pages/login.tsx
import { SignIn } from "@clerk/clerk-react";

export default function LoginPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f7f9fc",
      padding: 20,
    }}>
      <SignIn
        appearance={{
          variables: { colorPrimary: "#033280" },
          elements: {
            card: { boxShadow: "0 4px 20px rgba(3,50,128,0.08)" },
          },
        }}
        routing="path"
        path="/login"
        signUpUrl="/signup"
        afterSignInUrl="/portal-router"
      />
    </div>
  );
}
```

And a parallel `signup.tsx`:

```tsx
import { SignUp } from "@clerk/clerk-react";

export default function SignupPage() {
  return (
    <div style={{
      minHeight: "100vh",
      display: "flex",
      alignItems: "center",
      justifyContent: "center",
      background: "#f7f9fc",
      padding: 20,
    }}>
      <SignUp
        appearance={{ variables: { colorPrimary: "#033280" } }}
        routing="path"
        path="/signup"
        signInUrl="/login"
        afterSignUpUrl="/portal-router"
      />
    </div>
  );
}
```

If multiple login routes exist (`/dealer/login`, `/operator/login`), unify them all to point at `/login` for now. Routing to the right portal happens in Step 12.

---

## Step 12 — Add a portal-router page

Create `client/src/pages/portal-router.tsx`:

```tsx
import { useUser } from "@clerk/clerk-react";
import { useEffect } from "react";

export default function PortalRouter() {
  const { user, isLoaded } = useUser();

  useEffect(() => {
    if (!isLoaded || !user) return;

    const role = (user.publicMetadata?.role as string) || "client";

    let target = "/client";
    if (role === "operator_admin" || role === "operator_staff") target = "/operator";
    else if (role === "dealer_owner" || role === "dealer_staff" || role === "technician" || role === "public_bidder" || role === "consignor") target = "/dealer";
    else if (role === "bidder") target = "/bidder";
    else if (role === "client") target = "/client";

    window.location.href = target;
  }, [isLoaded, user]);

  return (
    <div style={{ padding: 40, textAlign: "center" }}>
      <p>Redirecting to your portal...</p>
    </div>
  );
}
```

Register `/portal-router` in the router config alongside other routes.

---

## Step 13 — Update apiFetch to use Clerk session tokens

Replace the contents of `client/src/lib/api.ts` with:

```ts
// client/src/lib/api.ts — Central API client; uses Clerk session token.

import { useAuth } from "@clerk/clerk-react";

/**
 * Hook-based fetch wrapper. Use inside React components.
 * For non-component code (e.g. TanStack queryFn), see useAuthFetch below.
 */
export function useApiFetch() {
  const { getToken } = useAuth();

  return async function apiFetch<T = unknown>(
    path: string,
    options: RequestInit = {}
  ): Promise<T> {
    const token = await getToken();
    const headers = new Headers(options.headers);
    if (options.body !== undefined && !headers.has("Content-Type")) {
      headers.set("Content-Type", "application/json");
    }
    if (token) headers.set("Authorization", `Bearer ${token}`);

    const res = await fetch(path, { ...options, headers, credentials: "include" });
    if (!res.ok) throw new Error(`${res.status}: ${res.statusText}`);
    return res.json() as Promise<T>;
  };
}

/**
 * For TanStack Query — pass into queryFn.
 * Usage:
 *   const apiFetch = useApiFetch();
 *   useQuery({ queryKey: ['/api/claims'], queryFn: () => apiFetch('/api/claims') })
 */
```

Delete `client/src/lib/auth-api.ts` since it managed the in-memory token that Clerk now manages:

```bash
rm client/src/lib/auth-api.ts
```

For each page that imports `apiFetch` from `./api` directly (without the hook), they need to be updated to use `useApiFetch()` from a component. Find them:

```bash
grep -rln "from \"@/lib/api\"\|from \"./api\"" client/src --include="*.tsx" --include="*.ts" | head -20
```

For each file, replace:
```ts
import { apiFetch } from "@/lib/api";
```
with:
```ts
import { useApiFetch } from "@/lib/api";
// then inside the component:
const apiFetch = useApiFetch();
```

For TanStack Query callers, change:
```ts
useQuery({ queryKey: ['/api/foo'], queryFn: authQueryFn })
```
to:
```ts
const apiFetch = useApiFetch();
useQuery({ queryKey: ['/api/foo'], queryFn: () => apiFetch('/api/foo') })
```

This is the most invasive frontend change. Take it slow. Verify each updated file compiles with `npm run check` after each batch.

---

## Step 14 — Delete the old custom auth files

After verifying nothing imports from them:

```bash
# Search for any remaining imports
grep -rn "from \"./auth\"\|from \"./lib/auth\"\|from \"./auth-routes\"\|from \"./middleware/requireAuth\"" server --include="*.ts" | head -20
grep -rn "import.*auth-api" client --include="*.ts" --include="*.tsx" | head -20
```

If grep returns results, fix those imports first to remove dependencies.

Then delete the files:

```bash
rm server/auth.ts
rm server/auth-routes.ts
rm server/lib/auth.ts
rm server/middleware/requireAuth.ts
rm server/routes/auth.ts
```

If any of these don't exist, ignore the error.

---

## Step 15 — Remove old auth route registrations

In the main app file (Step 7), find any line that registers the old auth router. E.g.:

```ts
import authRouter from "./routes/auth";
app.use("/api/auth", authRouter);
```

OR

```ts
import { registerAuthRoutes } from "./auth-routes";
registerAuthRoutes(app);
```

Delete these lines. Clerk handles login/logout/signup/refresh on its own — no `/api/auth/*` routes needed.

---

## Step 16 — Verify TypeScript compiles

```bash
npm run check 2>&1 | tee phase1b-typecheck.log | tail -50
```

If errors:
- Common: a file still imports from a deleted auth helper. Find with `grep -rn "<symbol>" server client --include="*.ts" --include="*.tsx"` and fix.
- Common: `req.user` shape changed; tighten types on routes that read fields.
- Common: `loginSchema`, `registerSchema`, `forgotPasswordSchema`, `resetPasswordSchema` exports in `shared/schema.ts` are now orphaned — leave them, harmless.

If after **two** rounds of fix attempts there are still TypeScript errors, STOP and report exact errors in `PHASE1B-DEPLOY-REPORT.md`. Do not proceed.

---

## Step 17 — Verify build

```bash
npm run build 2>&1 | tee phase1b-build.log | tail -30
```

Must succeed. If frontend build fails on Clerk imports, verify `@clerk/clerk-react` is in `dependencies` not `devDependencies`.

---

## Step 18 — Commit and push

```bash
git add -A
git commit -m "Phase 1B: migrate auth to Clerk — wipe old users, replace dual JWT system, add ClerkProvider + webhook sync"
git push origin main
```

Railway will auto-deploy. Wait ~3 min.

---

## Step 19 — Post-deploy smoke test

Once Railway shows healthy:

```bash
curl -I https://dealersuite360.com/api/webhooks/clerk
# Should return 405 Method Not Allowed (it's a POST-only endpoint) — that's success.
# 404 = endpoint not registered. STOP and debug.

curl -I https://dealersuite360.com/login
# Should return 200 OK with Clerk-styled login page
```

---

## Step 20 — Write the deploy report

Create `PHASE1B-DEPLOY-REPORT.md` in project root:

```markdown
# Phase 1B Deploy Report — [timestamp]

## Summary
- Old auth files deleted: [list]
- Clerk packages installed: @clerk/clerk-react, @clerk/express, svix
- Schema columns added: users.clerk_user_id, dealerships.clerk_org_id
- users.password_hash made nullable
- All test users wiped: 10 → 0
- Webhook endpoint live at /api/webhooks/clerk
- Frontend wrapped in <ClerkProvider>
- Login pages replaced with Clerk components
- apiFetch refactored to use Clerk session tokens

## Files deleted
- [list]

## Files created
- server/routes/clerk-webhook.ts
- client/src/pages/login.tsx (replaced)
- client/src/pages/signup.tsx (new)
- client/src/pages/portal-router.tsx (new)
- scripts/wipe-users-pre-clerk.ts

## Files modified
- shared/schema.ts (clerk columns added)
- server/middleware/auth.ts (Clerk verification)
- server/index.ts (clerkMiddleware + webhook mount)
- client/src/main.tsx (ClerkProvider wrap)
- client/src/lib/api.ts (useApiFetch hook)

## Verification
- npm run check: [pass/fail with details]
- npm run build: [pass/fail with details]
- Post-deploy: webhook 405 ✓ / login page 200 ✓

## Manual next step for Jonathan
1. Sign up at https://dealersuite360.com/signup using your email or Google
2. In Clerk dashboard → Users → click your new user → "Public metadata" → add:
   {
     "role": "operator_admin",
     "roles": ["operator_admin"]
   }
3. Sign out, sign back in. You should land on /operator portal.
4. Repeat for any additional test users with different roles.

## Known issues
[list or "none"]

## Ready for Phase 1C
[yes/no — if no, what's blocking]
```

---

## Rollback plan (if needed)

```bash
# 1. Restore files from backup
cp .pre-phase1b-bak/schema.ts shared/schema.ts
cp .pre-phase1b-bak/middleware-auth.ts server/middleware/auth.ts
cp .pre-phase1b-bak/lib-auth.ts server/lib/auth.ts
cp .pre-phase1b-bak/auth.ts server/auth.ts 2>/dev/null
cp .pre-phase1b-bak/auth-routes.ts server/auth-routes.ts 2>/dev/null
cp .pre-phase1b-bak/routes-auth.ts server/routes/auth.ts 2>/dev/null
cp .pre-phase1b-bak/middleware-requireAuth.ts server/middleware/requireAuth.ts 2>/dev/null
cp .pre-phase1b-bak/api.ts client/src/lib/api.ts
cp .pre-phase1b-bak/auth-api.ts client/src/lib/auth-api.ts

# 2. Drop new columns
psql "$DATABASE_URL" <<SQL
BEGIN;
ALTER TABLE users DROP COLUMN IF EXISTS clerk_user_id;
ALTER TABLE users ALTER COLUMN password_hash SET NOT NULL;
ALTER TABLE dealerships DROP COLUMN IF EXISTS clerk_org_id;
COMMIT;
SQL

# 3. Uninstall packages
npm uninstall @clerk/clerk-react @clerk/express svix

# 4. Revert commit
git revert HEAD
git push
```

---

## Constraints

- **Do not** keep both old and new auth systems alive in parallel — they conflict
- **Do not** modify the Clerk dashboard from CC — Jonathan owns dashboard config
- **Do not** add OAuth providers from CC — that's Jonathan's manual setup
- **Do not** touch existing `claims`, `units`, `dealerships` business logic
- **Do not** preserve or migrate old user passwords — they're not portable to Clerk
- **Do not** remove `dealerships`, `units`, `claims`, or any Phase 1A new tables — only auth files

---

## Run command

```bash
cd D:\Maxx-Projects\RVClaims-webapp\RVClaimsca\
claude --dangerously-skip-permissions
```

Then paste:

```
Read PHASE1B-AUTONOMOUS.md in the project root. Execute all 20 steps in order. Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing PHASE1B-DEPLOY-REPORT.md.
```

Walk away. Expected wall-clock: 30-45 minutes.
