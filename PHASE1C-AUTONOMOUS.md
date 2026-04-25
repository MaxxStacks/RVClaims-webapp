# PHASE1C-AUTONOMOUS.md
## DS360 Phase 1 Run 1C — V6 Portal Shells Deployment

**Mode:** `claude --dangerously-skip-permissions`
**Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing `PHASE1C-DEPLOY-REPORT.md`.**

**This run deploys 4 fresh v6-schema-driven portal shells alongside existing portals.**

---

## What this run does

Drops 4 new portal files into `client/src/pages/`, registers 4 new routes (`/operator-v6`, `/dealer-v6`, `/client-v6`, `/bidder-v6`), adds a portal-select page at `/portal-select-v6` for testing each role without re-logging-in, and updates `/portal-router` so that production roles continue to land on the existing portals (we do NOT redirect operator_admin → /operator-v6 yet — Jonathan validates first).

**Critical:** Existing `/operator`, `/dealer`, `/client`, `/bidder` routes and their files remain UNTOUCHED. Side-by-side comparison is the whole point of this run.

---

## Inputs (in project root)

| File | Action |
|---|---|
| `OperatorPortalV6.tsx` | Copy to `client/src/pages/OperatorPortalV6.tsx` |
| `DealerPortalV6.tsx` | Copy to `client/src/pages/DealerPortalV6.tsx` |
| `ClientPortalV6.tsx` | Copy to `client/src/pages/ClientPortalV6.tsx` |
| `BidderPortalV6.tsx` | Copy to `client/src/pages/BidderPortalV6.tsx` |
| `PHASE1C-AUTONOMOUS.md` | This spec |

---

## Step 1 — Copy the 4 portal files

```bash
cp OperatorPortalV6.tsx client/src/pages/OperatorPortalV6.tsx
cp DealerPortalV6.tsx client/src/pages/DealerPortalV6.tsx
cp ClientPortalV6.tsx client/src/pages/ClientPortalV6.tsx
cp BidderPortalV6.tsx client/src/pages/BidderPortalV6.tsx
ls client/src/pages/*V6.tsx
```

All 4 files should print. Each is ~330-475 lines of TSX.

---

## Step 2 — Register 4 new routes in App.tsx

Open `client/src/App.tsx`. The file already has lazy imports and route definitions for the existing portals.

Add these lazy imports near the other lazy imports (alphabetically by name or grouped — match existing style):

```ts
const OperatorPortalV6 = lazy(() => import("@/pages/OperatorPortalV6"));
const DealerPortalV6 = lazy(() => import("@/pages/DealerPortalV6"));
const ClientPortalV6 = lazy(() => import("@/pages/ClientPortalV6"));
const BidderPortalV6 = lazy(() => import("@/pages/BidderPortalV6"));
```

Then add these route entries within the `<Switch>` block alongside the existing `/operator`, `/dealer` redirects (which currently redirect to `/login`):

```tsx
<Route path="/operator-v6" component={OperatorPortalV6} />
<Route path="/dealer-v6" component={DealerPortalV6} />
<Route path="/client-v6" component={ClientPortalV6} />
<Route path="/bidder-v6" component={BidderPortalV6} />
```

Place them right next to the existing `/operator`, `/dealer`, `/client`, `/bidder` route entries so they're easy to find later.

The router library is **wouter** (confirmed by existing `<Route path=... component=... />` syntax).

---

## Step 3 — Build a portal-select dev tool at `/portal-select-v6`

Create `client/src/pages/PortalSelectV6.tsx`:

```tsx
import { useUser } from "@clerk/clerk-react";
import { useState } from "react";

const PORTAL_TARGETS: Record<string, string> = {
  operator_admin: "/operator-v6",
  operator_staff: "/operator-v6",
  dealer_owner: "/dealer-v6",
  dealer_staff: "/dealer-v6",
  technician: "/dealer-v6",
  public_bidder: "/dealer-v6",
  consignor: "/dealer-v6",
  client: "/client-v6",
  bidder: "/bidder-v6",
};

const ROLE_LABELS: Record<string, string> = {
  operator_admin: "Operator Admin",
  operator_staff: "Operator Staff",
  dealer_owner: "Dealer Owner",
  dealer_staff: "Dealer Staff",
  technician: "Technician",
  public_bidder: "Public Bidder (Dealer-sponsored)",
  consignor: "Consignor (Dealer-sponsored)",
  client: "Client",
  bidder: "Independent Bidder",
};

export default function PortalSelectV6() {
  const { user, isLoaded } = useUser();
  const [busy, setBusy] = useState(false);

  if (!isLoaded) {
    return <div style={{padding:40, textAlign:"center"}}>Loading...</div>;
  }
  if (!user) {
    return (
      <div style={{padding:40, textAlign:"center"}}>
        <p>You must be signed in to use the portal selector.</p>
        <a href="/login" style={{color:"#033280"}}>Sign in</a>
      </div>
    );
  }

  const currentRole = (user.publicMetadata?.role as string) || "(not set)";
  const currentRoles = ((user.publicMetadata?.roles as string[]) || []);

  async function setRole(role: string) {
    setBusy(true);
    try {
      // Note: in production we'd call a backend endpoint that uses Clerk's
      // backend SDK to set publicMetadata. For dev testing we use Clerk's
      // user.update which only allows unsafeMetadata client-side.
      // Workaround: use unsafeMetadata for test override; portal code
      // reads role from publicMetadata first, then falls back to unsafeMetadata.
      await user!.update({
        unsafeMetadata: { ...user!.unsafeMetadata, devRoleOverride: role }
      });
      window.location.href = PORTAL_TARGETS[role];
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{maxWidth: 600, margin: "60px auto", fontFamily: "-apple-system, BlinkMacSystemFont, 'Inter', sans-serif", padding: 20}}>
      <h1 style={{fontSize: 22, color: "#033280", marginBottom: 6}}>DS360 v6 — Portal Test Selector</h1>
      <p style={{fontSize: 13, color: "#666", marginBottom: 8}}>Pick a role to preview that portal. RBAC filters apply automatically.</p>
      <p style={{fontSize: 12, color: "#999", marginBottom: 24}}>
        Current Clerk role: <code style={{background:"#f0f2f5",padding:"1px 6px",borderRadius:4}}>{currentRole}</code>
        {currentRoles.length > 0 && <> — also has: {currentRoles.map(r => <code key={r} style={{background:"#f0f2f5",padding:"1px 6px",borderRadius:4,marginLeft:4}}>{r}</code>)}</>}
      </p>

      <div style={{display: "grid", gap: 8, marginBottom: 24}}>
        {Object.entries(ROLE_LABELS).map(([role, label]) => (
          <button
            key={role}
            onClick={() => setRole(role)}
            disabled={busy}
            style={{
              padding: "12px 16px",
              border: "1px solid #d5dbe5",
              borderRadius: 8,
              background: "white",
              fontSize: 13,
              fontFamily: "inherit",
              cursor: busy ? "wait" : "pointer",
              textAlign: "left",
              display: "flex",
              justifyContent: "space-between",
              alignItems: "center",
            }}
          >
            <div>
              <div style={{fontWeight: 600}}>{label}</div>
              <div style={{fontSize: 11, color: "#888", marginTop: 2}}>{role} → {PORTAL_TARGETS[role]}</div>
            </div>
            <div style={{color: "#033280", fontSize: 18}}>›</div>
          </button>
        ))}
      </div>

      <p style={{fontSize: 11, color: "#aaa", marginTop: 16}}>
        <strong>Dev only.</strong> Clicking a button stores a role override in Clerk's unsafeMetadata.
        The v6 portals read this override before falling back to publicMetadata.role.
        In production, role changes happen through invitations or admin actions — not this page.
      </p>
    </div>
  );
}
```

Register it in `App.tsx`:

```tsx
const PortalSelectV6 = lazy(() => import("@/pages/PortalSelectV6"));

// ...inside <Switch>:
<Route path="/portal-select-v6" component={PortalSelectV6} />
```

---

## Step 4 — Update v6 portal files to read dev role override

Each portal currently reads role from `clerkUser.publicMetadata.role`. Update each of the 4 portal files (`OperatorPortalV6.tsx`, `DealerPortalV6.tsx`, `ClientPortalV6.tsx`, `BidderPortalV6.tsx`) to also check `unsafeMetadata.devRoleOverride` first, allowing the dev portal selector to switch roles without re-logging in.

For each portal file, find this block:

```tsx
  const user = clerkUser ? {
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User",
    role: (clerkUser.publicMetadata as any)?.role,
    roles: ((clerkUser.publicMetadata as any)?.roles || []) as string[],
  } : null;
```

Replace with:

```tsx
  const user = clerkUser ? {
    name: [clerkUser.firstName, clerkUser.lastName].filter(Boolean).join(" ") || clerkUser.username || "User",
    role: ((clerkUser.unsafeMetadata as any)?.devRoleOverride as string) || (clerkUser.publicMetadata as any)?.role,
    roles: ((clerkUser.publicMetadata as any)?.roles || []) as string[],
  } : null;
```

Apply this change to all 4 portal files.

---

## Step 5 — Verify TypeScript compiles

```bash
npm run check 2>&1 | tee phase1c-typecheck.log | tail -30
```

Common issues:
- `useApiFetch` not exported from `@/lib/api`: check `client/src/lib/api.ts` after Phase 1B — it should export both `useApiFetch` (the new hook) and possibly a backward-compat shim. If only `apiFetch` exists, update the import in each v6 portal to `import { apiFetch as useApiFetch } from "@/lib/api"` OR fix `lib/api.ts` to export the hook.
- Missing `@assets/ds360_favicon.png`: verify the asset path resolves — if not, fall back to `/icons/icon-144.png` or wherever the DS360 favicon lives in `client/public/`.
- Type errors on unsafeMetadata: cast as needed. The file already uses `(clerkUser.publicMetadata as any)?.role` pattern; do the same for unsafeMetadata.

If errors persist after two fix passes, STOP and report exact errors.

---

## Step 6 — Verify build

```bash
npm run build 2>&1 | tee phase1c-build.log | tail -30
```

Must succeed.

---

## Step 7 — Commit and push

```bash
git add -A
git commit -m "Phase 1C: deploy v6 portal shells side-by-side with existing portals (4 new routes + dev selector)"
git push origin main
```

Railway auto-deploys. Wait ~3 min.

---

## Step 8 — Post-deploy smoke test

```bash
curl -I https://dealersuite360.com/operator-v6
curl -I https://dealersuite360.com/dealer-v6
curl -I https://dealersuite360.com/client-v6
curl -I https://dealersuite360.com/bidder-v6
curl -I https://dealersuite360.com/portal-select-v6
```

All five should return HTTP 200 (the React app shell loads).

---

## Step 9 — Write the deploy report

Create `PHASE1C-DEPLOY-REPORT.md` in project root:

```markdown
# Phase 1C Deploy Report

## Summary
- 4 v6 portal shell files copied to client/src/pages/
- 4 new routes registered in App.tsx: /operator-v6, /dealer-v6, /client-v6, /bidder-v6
- 1 dev tool added: /portal-select-v6
- Existing portal routes UNTOUCHED
- All v6 portals updated to honor unsafeMetadata.devRoleOverride for testing

## Files added
- client/src/pages/OperatorPortalV6.tsx (475 lines)
- client/src/pages/DealerPortalV6.tsx (465 lines)
- client/src/pages/ClientPortalV6.tsx (357 lines)
- client/src/pages/BidderPortalV6.tsx (336 lines)
- client/src/pages/PortalSelectV6.tsx (~120 lines)

## Files modified
- client/src/App.tsx (5 new lazy imports + 5 new routes)

## Verification
- npm run check: [pass/fail with details]
- npm run build: [pass/fail with details]
- /operator-v6: [200/error]
- /dealer-v6: [200/error]
- /client-v6: [200/error]
- /bidder-v6: [200/error]
- /portal-select-v6: [200/error]

## Manual next steps for Jonathan
1. Sign in at https://dealersuite360.com
2. Navigate to https://dealersuite360.com/portal-select-v6
3. Click each role in turn to preview the corresponding v6 portal with RBAC applied
4. Compare side-by-side with the existing portals at /operator, /dealer, /client, /bidder
5. The existing portals will be removed in Phase 1D after validation

## Known issues
[list or "none"]

## Ready for Phase 1D
[yes/no]
```

---

## Constraints

- Do NOT modify `/operator`, `/dealer`, `/client`, `/bidder` routes or their underlying files
- Do NOT delete any existing portal files
- Do NOT change `/portal-router` logic — it still routes to existing portals
- Do NOT add backend routes — this is frontend-only
- Do NOT touch the schema, auth, or API code

---

## Rollback plan

```bash
rm client/src/pages/OperatorPortalV6.tsx
rm client/src/pages/DealerPortalV6.tsx
rm client/src/pages/ClientPortalV6.tsx
rm client/src/pages/BidderPortalV6.tsx
rm client/src/pages/PortalSelectV6.tsx
# Revert the route additions in App.tsx (5 imports + 5 routes)
git checkout -- client/src/App.tsx
```

---

## Run command

```bash
cd D:\Maxx-Projects\RVClaims-webapp\RVClaimsca\
claude --dangerously-skip-permissions
```

Then paste:

```
Read PHASE1C-AUTONOMOUS.md in the project root. Execute all 9 steps in order. Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing PHASE1C-DEPLOY-REPORT.md.
```

Walk away. Expected wall-clock: 15-25 minutes.
