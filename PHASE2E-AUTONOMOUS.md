# PHASE2E-AUTONOMOUS.md
## DS360 Phase 2 Run 2E — Layout Architecture Fix

**Mode:** `claude --dangerously-skip-permissions`
**Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing `PHASE2E-DEPLOY-REPORT.md`.**

**This run fixes the foundational layout architecture so the AppBar and main nav are always present, contextual sidebars persist across list↔detail navigation, and all sidebars share consistent styling. Every future module will plug into this pattern.**

---

## The problem this run solves

Currently, sub-routes like `/operator-v6/dealerships/:id`, `/dealer-v6/units/:id`, `/dealer-v6/units/new`, `/dealer-v6/units/:unitId/claims/new` render as **standalone components outside the portal shell**. This means:

- AppBar disappears on detail pages
- Main nav sidebar disappears on detail pages
- Contextual "Other Dealers" / "Other Units" sidebars vanish when going back to list view
- Contextual sidebars use different styling than the main nav (inconsistent UX)
- Every back button = full layout rebuild + lost context

## The architecture this run delivers

3-layer layout, always present:

```
┌──────────┬──────────────────────────────────────────────┐
│          │ AppBar (top of content area only, NOT full)  │
│ Main Nav ├───────────────┬──────────────────────────────┤
│ Sidebar  │ Contextual    │ Page Content                 │
│ (full    │ Sidebar       │ (list table OR detail tabs)  │
│ height)  │ (when in a    │                              │
│          │  section that │                              │
│          │  uses one)    │                              │
└──────────┴───────────────┴──────────────────────────────┘
```

- Layer 1 (Portal Shell): main nav + AppBar — always visible across all V6 routes
- Layer 2 (Section Shell): contextual sidebar — persists while inside a section like Dealer Accounts, Inventory, Claims
- Layer 3 (Page Content): the actual list table OR detail tabs in the right column

URL routing stays the same — sub-routes still use `/operator-v6/dealerships/:id` etc. Just rendered inside the shell instead of replacing it.

---

## Inputs

| File | Where |
|---|---|
| `PHASE2E-AUTONOMOUS.md` | Project root |

---

## Step 1 — Backups

```bash
mkdir -p .pre-phase2e-bak
cp client/src/App.tsx .pre-phase2e-bak/
cp client/src/pages/OperatorPortalV6.tsx .pre-phase2e-bak/
cp client/src/pages/DealerPortalV6.tsx .pre-phase2e-bak/
cp client/src/pages/ClientPortalV6.tsx .pre-phase2e-bak/
cp client/src/pages/BidderPortalV6.tsx .pre-phase2e-bak/
cp client/src/components/AppBar.tsx .pre-phase2e-bak/ 2>/dev/null || true
cp client/src/components/operator/DealerAccountsListPage.tsx .pre-phase2e-bak/
cp client/src/components/operator/DealershipDetailPage.tsx .pre-phase2e-bak/
cp client/src/components/operator/NewDealershipPage.tsx .pre-phase2e-bak/
cp client/src/components/units/InventoryListPage.tsx .pre-phase2e-bak/
cp client/src/components/units/UnitProfilePage.tsx .pre-phase2e-bak/
cp client/src/components/units/NewUnitPage.tsx .pre-phase2e-bak/
cp client/src/components/claims/NewClaimPage.tsx .pre-phase2e-bak/
echo "Backups complete"
```

---

## Step 2 — Create the design tokens file (single source of truth for sidebar styling)

Create `client/src/components/layout/tokens.ts`:

```ts
// Single source of truth for layout dimensions, colors, typography
// All sidebars + AppBar pull from here so styling is consistent

export const LAYOUT = {
  appBarHeight: 56,
  mainNavWidth: 220,
  contextualSidebarWidth: 260,

  // Colors
  navy: "#033280",
  navyLight: "#eaf1fb",
  navyBg: "#f0f5ff",
  green: "#0cb22c",
  borderLight: "#e5eaf2",
  borderLighter: "#f0f2f5",
  bgPage: "#f7f9fc",
  bgWhite: "white",

  // Text
  textPrimary: "#222",
  textSecondary: "#666",
  textMuted: "#888",
  textLabel: "#888",  // for uppercase labels

  // Sidebar item
  sidebarItemPaddingY: 10,
  sidebarItemPaddingX: 16,
  sidebarSectionLabelSize: 11,
  sidebarItemFontSize: 13,
  sidebarItemMutedSize: 10,

  // Status badge colors
  statusActive: "#16a34a",
  statusActiveBg: "#dcfce7",
  statusActiveText: "#166534",
  statusPending: "#f48120",
  statusPendingBg: "#fef3c7",
  statusPendingText: "#92400e",
  statusExpired: "#c0392b",
  statusExpiredBg: "#fee2e2",
  statusExpiredText: "#991b1b",
  statusMuted: "#888",
  statusMutedBg: "#f0f2f5",
  statusMutedText: "#666",
} as const;
```

---

## Step 3 — Create the PortalShell component

Create `client/src/components/layout/PortalShell.tsx`:

```tsx
import { ReactNode } from "react";
import AppBar from "@/components/AppBar";
import { LAYOUT } from "./tokens";

interface PortalShellProps {
  /** Portal context — passed to AppBar */
  context: "operator" | "dealer" | "client" | "bidder";
  /** The main nav sidebar (the existing nav menu). Should be a self-contained component returning JSX. */
  mainNav: ReactNode;
  /** Page content — can be a SectionLayout or any component */
  children: ReactNode;
  /** Optional contextLabel override for AppBar (e.g., dealership name) */
  contextLabel?: string;
}

export default function PortalShell({ context, mainNav, children, contextLabel }: PortalShellProps) {
  return (
    <div style={{ display: "flex", height: "100vh", overflow: "hidden", background: LAYOUT.bgPage }}>
      {/* Layer 1a — Main nav sidebar (full height, fixed width) */}
      <div style={{ width: LAYOUT.mainNavWidth, background: LAYOUT.bgWhite, borderRight: `1px solid ${LAYOUT.borderLight}`, display: "flex", flexDirection: "column", flexShrink: 0, overflow: "hidden" }}>
        {mainNav}
      </div>

      {/* Right side: AppBar on top, content below */}
      <div style={{ display: "flex", flexDirection: "column", flex: 1, overflow: "hidden" }}>
        {/* Layer 1b — AppBar (sits ONLY above content area) */}
        <AppBar context={context} contextLabel={contextLabel} />
        {/* Content area — children go here, can include SectionLayout */}
        <div style={{ flex: 1, overflow: "hidden", display: "flex" }}>
          {children}
        </div>
      </div>
    </div>
  );
}
```

---

## Step 4 — Create the SectionLayout component (for sections with contextual sidebars)

Create `client/src/components/layout/SectionLayout.tsx`:

```tsx
import { ReactNode } from "react";
import { LAYOUT } from "./tokens";

interface SectionLayoutProps {
  /** Optional contextual sidebar (e.g., "Other Dealers", "Other Units"). If omitted, content takes full width. */
  contextualSidebar?: ReactNode;
  /** Main content for this section (list table OR detail tabs) */
  children: ReactNode;
}

export default function SectionLayout({ contextualSidebar, children }: SectionLayoutProps) {
  return (
    <>
      {contextualSidebar && (
        <div style={{
          width: LAYOUT.contextualSidebarWidth,
          background: LAYOUT.bgWhite,
          borderRight: `1px solid ${LAYOUT.borderLight}`,
          display: "flex",
          flexDirection: "column",
          flexShrink: 0,
          overflow: "hidden",
        }}>
          {contextualSidebar}
        </div>
      )}
      <div style={{ flex: 1, overflowY: "auto" }}>
        {children}
      </div>
    </>
  );
}
```

---

## Step 5 — Create reusable contextual sidebar components

These are the actual contextual sidebars (Other Dealers, Other Units) extracted into reusable components so both list view and detail view share them.

### 5a — DealersContextSidebar

Create `client/src/components/operator/DealersContextSidebar.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";
import { useLocation } from "wouter";
import { LAYOUT } from "@/components/layout/tokens";

interface Props {
  /** ID of the currently-active dealership, if any (for highlighting) */
  activeId?: string;
}

export default function DealersContextSidebar({ activeId }: Props) {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [dealers, setDealers] = useState<any[]>([]);
  const [filter, setFilter] = useState({ search: "", reviewStatus: "" });

  useEffect(() => {
    const p = new URLSearchParams();
    if (filter.reviewStatus) p.set("reviewStatus", filter.reviewStatus);
    if (filter.search) p.set("search", filter.search);
    apiFetch<any[]>(`/api/v6/dealerships?${p.toString()}`).then(setDealers).catch(() => {});
  }, [filter.reviewStatus, filter.search]);

  return (
    <>
      <div style={{ padding: 16, borderBottom: `1px solid ${LAYOUT.borderLighter}` }}>
        <button
          onClick={() => navigate("/operator-v6/dealerships")}
          style={{ background: "none", border: 0, color: LAYOUT.navy, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 12, fontWeight: 600 }}
        >
          + New Dealership
        </button>
        <div style={{ fontSize: LAYOUT.sidebarSectionLabelSize, color: LAYOUT.textLabel, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>
          Dealerships
        </div>
        <input
          placeholder="Search by name..."
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
          style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: `1px solid #d5dbe5`, borderRadius: 4, marginBottom: 6, boxSizing: "border-box" }}
        />
        <select
          value={filter.reviewStatus}
          onChange={e => setFilter({ ...filter, reviewStatus: e.target.value })}
          style={{ width: "100%", padding: "6px 8px", fontSize: 11, border: `1px solid #d5dbe5`, borderRadius: 4 }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending_review">Pending Review</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {dealers.length === 0 ? (
          <div style={{ padding: 16, fontSize: 11, color: LAYOUT.textMuted, textAlign: "center" }}>No dealers</div>
        ) : dealers.map((d: any) => {
          const isActive = d.id === activeId;
          return (
            <div
              key={d.id}
              onClick={() => navigate(`/operator-v6/dealerships/${d.id}`)}
              style={{
                padding: `${LAYOUT.sidebarItemPaddingY}px ${LAYOUT.sidebarItemPaddingX}px`,
                cursor: "pointer",
                background: isActive ? LAYOUT.navyLight : "transparent",
                borderLeft: isActive ? `3px solid ${LAYOUT.navy}` : "3px solid transparent",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = LAYOUT.bgPage; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ fontSize: LAYOUT.sidebarItemFontSize, fontWeight: 600, color: isActive ? LAYOUT.navy : LAYOUT.textPrimary }}>
                {d.name}
              </div>
              <div style={{ fontSize: LAYOUT.sidebarItemMutedSize, color: LAYOUT.textMuted, marginTop: 2 }}>
                {d.email}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 9, padding: "1px 5px", background: LAYOUT.statusMutedBg, color: LAYOUT.statusMutedText, borderRadius: 3 }}>
                  {d.brandingTier || "base"}
                </span>
                <span style={{
                  fontSize: 9, padding: "1px 5px", borderRadius: 3,
                  background: d.reviewStatus === "active" ? LAYOUT.statusActiveBg
                    : d.reviewStatus === "pending_review" ? LAYOUT.statusPendingBg
                    : d.reviewStatus === "suspended" ? LAYOUT.statusExpiredBg
                    : LAYOUT.statusMutedBg,
                  color: d.reviewStatus === "active" ? LAYOUT.statusActiveText
                    : d.reviewStatus === "pending_review" ? LAYOUT.statusPendingText
                    : d.reviewStatus === "suspended" ? LAYOUT.statusExpiredText
                    : LAYOUT.statusMutedText,
                }}>
                  {(d.reviewStatus || "active").replace("_", " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
```

### 5b — UnitsContextSidebar

Create `client/src/components/units/UnitsContextSidebar.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";
import { useLocation } from "wouter";
import { LAYOUT } from "@/components/layout/tokens";

interface Props {
  context: "operator" | "dealer";
  /** ID of currently-active unit, if any */
  activeId?: string;
}

export default function UnitsContextSidebar({ context, activeId }: Props) {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [units, setUnits] = useState<any[]>([]);
  const [filter, setFilter] = useState({ search: "", status: "" });

  useEffect(() => {
    const p = new URLSearchParams();
    if (filter.status) p.set("status", filter.status);
    if (filter.search) p.set("search", filter.search);
    apiFetch<any[]>(`/api/v6/units?${p.toString()}`).then(setUnits).catch(() => {});
  }, [filter.status, filter.search]);

  return (
    <>
      <div style={{ padding: 16, borderBottom: `1px solid ${LAYOUT.borderLighter}` }}>
        <button
          onClick={() => navigate(`/${context}-v6/units/new`)}
          style={{ background: "none", border: 0, color: LAYOUT.navy, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 12, fontWeight: 600 }}
        >
          + New Unit
        </button>
        <div style={{ fontSize: LAYOUT.sidebarSectionLabelSize, color: LAYOUT.textLabel, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>
          Units
        </div>
        <input
          placeholder="Search VIN, make..."
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
          style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: `1px solid #d5dbe5`, borderRadius: 4, marginBottom: 6, boxSizing: "border-box" }}
        />
        <select
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
          style={{ width: "100%", padding: "6px 8px", fontSize: 11, border: `1px solid #d5dbe5`, borderRadius: 4 }}
        >
          <option value="">All statuses</option>
          <option value="in_inventory">In Stock</option>
          <option value="sold">Sold</option>
          <option value="in_service">In Service</option>
          <option value="consigned">Consigned</option>
        </select>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {units.length === 0 ? (
          <div style={{ padding: 16, fontSize: 11, color: LAYOUT.textMuted, textAlign: "center" }}>No units</div>
        ) : units.map((u: any) => {
          const isActive = u.id === activeId;
          return (
            <div
              key={u.id}
              onClick={() => navigate(`/${context}-v6/units/${u.id}`)}
              style={{
                padding: `${LAYOUT.sidebarItemPaddingY}px ${LAYOUT.sidebarItemPaddingX}px`,
                cursor: "pointer",
                background: isActive ? LAYOUT.navyLight : "transparent",
                borderLeft: isActive ? `3px solid ${LAYOUT.navy}` : "3px solid transparent",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = LAYOUT.bgPage; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ fontSize: LAYOUT.sidebarItemFontSize, fontWeight: 600, color: isActive ? LAYOUT.navy : LAYOUT.textPrimary }}>
                {u.year} {u.make}
              </div>
              <div style={{ fontSize: LAYOUT.sidebarItemMutedSize, color: LAYOUT.textMuted, fontFamily: "monospace", marginTop: 2 }}>
                {u.vin?.slice(-8)}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 9, padding: "1px 5px", background: LAYOUT.statusMutedBg, color: LAYOUT.statusMutedText, borderRadius: 3 }}>
                  {u.status?.replace(/_/g, " ")}
                </span>
                {u.mfrWarrantyStatus === "active" && <span style={{ fontSize: 9, padding: "1px 5px", background: LAYOUT.statusActiveBg, color: LAYOUT.statusActiveText, borderRadius: 3 }}>● W</span>}
                {u.mfrWarrantyStatus === "expiring" && <span style={{ fontSize: 9, padding: "1px 5px", background: LAYOUT.statusPendingBg, color: LAYOUT.statusPendingText, borderRadius: 3 }}>● W</span>}
                {u.mfrWarrantyStatus === "expired" && <span style={{ fontSize: 9, padding: "1px 5px", background: LAYOUT.statusExpiredBg, color: LAYOUT.statusExpiredText, borderRadius: 3 }}>● W</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
```

---

## Step 6 — Refactor portal pages to expose their main nav as a separate export

Currently `OperatorPortalV6.tsx` is a single monolithic component. We need to split out the main nav so it can be rendered inside PortalShell.

### 6a — OperatorPortalV6.tsx

Open the file. Currently the structure is roughly:
```tsx
export default function OperatorPortalV6() {
  // ... state, hooks, etc
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      <aside>... main nav menu ...</aside>
      <main>... content with renderPage() switch ...</main>
    </div>
  );
}
```

Refactor to expose the nav as a named export:

```tsx
// At top of file:
import PortalShell from "@/components/layout/PortalShell";

// New named export — returns just the nav menu JSX (everything inside the existing <aside>)
export function OperatorMainNav() {
  // ... state for current page, navigation handlers ...
  return (
    <>
      {/* The contents that were inside the existing <aside> tag */}
      {/* Section labels, menu items, etc. */}
      {/* DO NOT include the broken NotificationBell — that's been moved to AppBar */}
    </>
  );
}

// Default export — the full portal page (used for /operator-v6 root only)
export default function OperatorPortalV6() {
  return (
    <PortalShell context="operator" mainNav={<OperatorMainNav />}>
      <div style={{ flex: 1, overflowY: "auto", padding: 24 }}>
        {/* The existing renderPage() output */}
        {renderPage()}
      </div>
    </PortalShell>
  );
}
```

**The key change:** `renderPage()` runs inside `PortalShell`, which means AppBar + main nav are always visible. The `<div>` wrapper around it gives padding for default pages.

### 6b — DealerPortalV6.tsx, ClientPortalV6.tsx, BidderPortalV6.tsx

Same pattern. Each gets:
- `export function DealerMainNav() { ... }` (named export)
- Default export wraps existing content in `<PortalShell context="dealer" mainNav={<DealerMainNav />}>`

---

## Step 7 — Refactor sub-route pages to use PortalShell + SectionLayout

This is the heart of the fix. Every sub-route page must wrap itself in PortalShell so the AppBar + main nav stay present.

### 7a — DealerAccountsListPage.tsx (operator)

Currently renders its own full-page layout. Refactor to use PortalShell + SectionLayout:

```tsx
import PortalShell from "@/components/layout/PortalShell";
import SectionLayout from "@/components/layout/SectionLayout";
import { OperatorMainNav } from "@/pages/OperatorPortalV6";
import DealersContextSidebar from "@/components/operator/DealersContextSidebar";
import { LAYOUT } from "@/components/layout/tokens";

export default function DealerAccountsListPage() {
  // ... existing state, hooks ...

  return (
    <PortalShell context="operator" mainNav={<OperatorMainNav />}>
      <SectionLayout contextualSidebar={<DealersContextSidebar />}>
        <div style={{ padding: 24 }}>
          {/* The existing list page content (KPIs + filters + table) */}
          {/* Existing JSX moves inside this div */}
        </div>
      </SectionLayout>
    </PortalShell>
  );
}
```

The KPI cards + table go INSIDE the right column (the SectionLayout's children). The contextual sidebar is the same component used on the detail page — clicking a dealer there navigates to the detail page, sidebar persists.

### 7b — DealershipDetailPage.tsx (operator)

Same pattern — wrap in PortalShell + SectionLayout, pass `activeId={params.id}` to highlight current dealer in sidebar:

```tsx
import PortalShell from "@/components/layout/PortalShell";
import SectionLayout from "@/components/layout/SectionLayout";
import { OperatorMainNav } from "@/pages/OperatorPortalV6";
import DealersContextSidebar from "@/components/operator/DealersContextSidebar";

export default function DealershipDetailPage() {
  // ... existing state ...
  return (
    <PortalShell context="operator" mainNav={<OperatorMainNav />} contextLabel={data?.dealership?.name}>
      <SectionLayout contextualSidebar={<DealersContextSidebar activeId={params.id} />}>
        <div style={{ padding: 24 }}>
          {/* Existing header + KPI strip + tabs + tab content */}
          {/* REMOVE the old "← Back to Dealer Accounts" button and old left sidebar — both are now provided by PortalShell + SectionLayout */}
        </div>
      </SectionLayout>
    </PortalShell>
  );
}
```

**Critical:** Remove the old left sidebar JSX from DealershipDetailPage (the one Phase 2D added). It's now provided by SectionLayout. Also remove the old "← Back to Dealer Accounts" button from inside the detail content (the contextual sidebar's "+ New Dealership" + dealer list serve that purpose now — to go back, just click the parent menu item or another dealer in the sidebar).

### 7c — NewDealershipPage.tsx (operator)

Wrap in PortalShell, but NO contextual sidebar (creation flows don't need one — the wizard's own left sidebar with steps is enough):

```tsx
import PortalShell from "@/components/layout/PortalShell";
import { OperatorMainNav } from "@/pages/OperatorPortalV6";

export default function NewDealershipPage() {
  return (
    <PortalShell context="operator" mainNav={<OperatorMainNav />}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* The existing wizard JSX with its own sidebar+main panel */}
      </div>
    </PortalShell>
  );
}
```

### 7d — InventoryListPage.tsx (operator + dealer + client)

Same pattern. Both operator and dealer contexts use UnitsContextSidebar. Client context skips it (client only has 1 unit usually).

```tsx
import PortalShell from "@/components/layout/PortalShell";
import SectionLayout from "@/components/layout/SectionLayout";
import { OperatorMainNav } from "@/pages/OperatorPortalV6";
import { DealerMainNav } from "@/pages/DealerPortalV6";
import { ClientMainNav } from "@/pages/ClientPortalV6";
import UnitsContextSidebar from "@/components/units/UnitsContextSidebar";

export default function InventoryListPage({ context }: { context: "operator" | "dealer" | "client" }) {
  const MainNav = context === "operator" ? OperatorMainNav : context === "dealer" ? DealerMainNav : ClientMainNav;
  const showContextSidebar = context !== "client";

  return (
    <PortalShell context={context} mainNav={<MainNav />}>
      <SectionLayout contextualSidebar={showContextSidebar ? <UnitsContextSidebar context={context as "operator" | "dealer"} /> : undefined}>
        <div style={{ padding: 24 }}>
          {/* Existing inventory list JSX */}
        </div>
      </SectionLayout>
    </PortalShell>
  );
}
```

### 7e — UnitProfilePage.tsx

Same pattern. Pass `activeId={params.id}` to UnitsContextSidebar:

```tsx
import PortalShell from "@/components/layout/PortalShell";
import SectionLayout from "@/components/layout/SectionLayout";
import { OperatorMainNav } from "@/pages/OperatorPortalV6";
import { DealerMainNav } from "@/pages/DealerPortalV6";
import { ClientMainNav } from "@/pages/ClientPortalV6";
import UnitsContextSidebar from "@/components/units/UnitsContextSidebar";

export default function UnitProfilePage({ context }: { context: "operator" | "dealer" | "client" }) {
  const MainNav = context === "operator" ? OperatorMainNav : context === "dealer" ? DealerMainNav : ClientMainNav;
  const showContextSidebar = context !== "client";

  return (
    <PortalShell context={context} mainNav={<MainNav />}>
      <SectionLayout contextualSidebar={showContextSidebar ? <UnitsContextSidebar context={context as "operator" | "dealer"} activeId={params.id} /> : undefined}>
        <div style={{ padding: 24 }}>
          {/* Existing 7-tab unit profile content */}
          {/* REMOVE the old left sidebar JSX added in Phase 2B/2C — SectionLayout provides it now */}
          {/* REMOVE the old "← Back to inventory" button — sidebar handles navigation */}
        </div>
      </SectionLayout>
    </PortalShell>
  );
}
```

### 7f — NewUnitPage.tsx

Wrap in PortalShell, no contextual sidebar (creation flow):

```tsx
import PortalShell from "@/components/layout/PortalShell";
import { DealerMainNav } from "@/pages/DealerPortalV6";

export default function NewUnitPage() {
  return (
    <PortalShell context="dealer" mainNav={<DealerMainNav />}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Existing form with its own "Recent Units" sidebar + main form columns */}
      </div>
    </PortalShell>
  );
}
```

### 7g — NewClaimPage.tsx

Same:
```tsx
import PortalShell from "@/components/layout/PortalShell";
import { DealerMainNav } from "@/pages/DealerPortalV6";

export default function NewClaimPage() {
  return (
    <PortalShell context="dealer" mainNav={<DealerMainNav />}>
      <div style={{ flex: 1, overflowY: "auto" }}>
        {/* Existing claim creation form with unit context sidebar + main form */}
      </div>
    </PortalShell>
  );
}
```

---

## Step 8 — Verify AppBar positioning

In `client/src/components/AppBar.tsx`, verify the AppBar root div does NOT use `position: sticky` with `top: 0` that would make it span beyond its parent flex column. The AppBar should be a normal flex item inside PortalShell's right-column flex container — it'll naturally sit above the content area without extending across the main nav.

Open AppBar.tsx and find the outer div. Confirm the styling is:
```tsx
<div style={{
  height: 56, background: "white", borderBottom: "1px solid #e5eaf2",
  display: "flex", alignItems: "center", justifyContent: "space-between",
  padding: "0 24px",
  // REMOVE: position: "sticky", top: 0, zIndex: 100,
  // The flex parent in PortalShell handles positioning
  flexShrink: 0,
}}>
```

If `position: sticky` is present, remove it. AppBar is now a flex item inside the right-column container, not a fixed header.

---

## Step 9 — Verify build

```bash
npm run check 2>&1 | grep -v "marketplace\|membership\|auctions\|stripe-escrow\|crm" | grep "error TS" | head -30
```

Common issues to watch for:
- Circular imports between portal page files and component files (NewUnitPage importing DealerMainNav from DealerPortalV6 which might import other components) — if circular, extract MainNav components to separate files like `client/src/pages/nav/DealerMainNav.tsx`
- Missing `useApiFetch` imports in new context sidebar components
- The `useLocation` hook from wouter being imported as a default vs named export

Fix new-file errors. Pre-existing errors in marketplace/membership/auctions/stripe-escrow/crm are not this run's concern.

```bash
npm run build 2>&1 | tail -20
```

---

## Step 10 — Commit + push

```bash
git add -A
git commit -m "Phase 2E: Layout architecture fix — PortalShell + SectionLayout + persistent contextual sidebars across list/detail navigation"
git push origin main
```

Wait ~3 min for Railway to deploy.

---

## Step 11 — Smoke tests

```bash
curl -I https://dealersuite360.com/operator-v6/dealerships
curl -I https://dealersuite360.com/operator-v6/dealerships/new
curl -I https://dealersuite360.com/dealer-v6/units/new
```

---

## Step 12 — Write deploy report

Create `PHASE2E-DEPLOY-REPORT.md`:

```markdown
# Phase 2E Deploy Report

**Date:** [today]
**Branch:** main
**Commit:** [hash]

## Summary

Layout architecture restructured. AppBar + main nav now persist across ALL V6 routes including detail pages and creation flows. Contextual sidebars (Other Dealers / Other Units) persist across list↔detail navigation. All sidebar styling pulled from a single design tokens file for consistency.

## Files added
- client/src/components/layout/tokens.ts
- client/src/components/layout/PortalShell.tsx
- client/src/components/layout/SectionLayout.tsx
- client/src/components/operator/DealersContextSidebar.tsx
- client/src/components/units/UnitsContextSidebar.tsx

## Files modified
- client/src/components/AppBar.tsx (removed sticky positioning)
- client/src/pages/OperatorPortalV6.tsx (added OperatorMainNav export, wrapped in PortalShell)
- client/src/pages/DealerPortalV6.tsx (added DealerMainNav export, wrapped in PortalShell)
- client/src/pages/ClientPortalV6.tsx (added ClientMainNav export, wrapped in PortalShell)
- client/src/pages/BidderPortalV6.tsx (added BidderMainNav export, wrapped in PortalShell)
- client/src/components/operator/DealerAccountsListPage.tsx (PortalShell + SectionLayout)
- client/src/components/operator/DealershipDetailPage.tsx (PortalShell + SectionLayout, removed old custom sidebar)
- client/src/components/operator/NewDealershipPage.tsx (PortalShell wrap)
- client/src/components/units/InventoryListPage.tsx (PortalShell + SectionLayout)
- client/src/components/units/UnitProfilePage.tsx (PortalShell + SectionLayout, removed old custom sidebar)
- client/src/components/units/NewUnitPage.tsx (PortalShell wrap)
- client/src/components/claims/NewClaimPage.tsx (PortalShell wrap)

## Verification
- npm run check: [pass / new-file errors]
- npm run build: [pass / fail]

## Manual test for Jonathan
1. Operator portal → Dealer Accounts → main nav + AppBar visible, contextual "Dealerships" sidebar visible with all dealers listed
2. Click any dealer → detail loads in right column, sidebar PERSISTS, dealer is highlighted in sidebar
3. Click another dealer in sidebar → detail swaps, sidebar still there, no navigation flash
4. Click "+ New Dealership" in sidebar → routes to wizard, AppBar + main nav still visible
5. Dealer portal → Inventory → contextual "Units" sidebar visible
6. Click any unit → detail loads, sidebar persists, unit highlighted
7. Click another unit in sidebar → detail swaps cleanly
8. AppBar should sit on top of the content area only (not extending across main nav)
9. All sidebars should look visually consistent — same fonts, same hover states, same colors

## Known gaps / deferred to next phase
- Dealer detail page UI itself needs cosmetic redesign (you mentioned this earlier — separate run)
- Per-tier branding on AppBar (light up logo + colors when dealership has mid/enterprise tier)
- Mobile responsive breakpoints (sidebars don't collapse to icons yet)
- Other detail/list combos (Claims, Parts, etc.) will need to adopt this same pattern when they get their detail pages
```

---

## Constraints

- Do NOT change the existing main nav menu items, sections, or onClick handlers — only extract them into a named export
- Do NOT modify the AppBar's notification logic or user menu — only remove its `position: sticky` styling
- Do NOT change the existing renderPage() switch in any portal — it stays exactly as-is
- Pre-existing TS errors in stripe-escrow.ts, crm.ts, marketplace, membership, auctions are NOT this run's problem
- If circular imports happen (portal files importing from component files that import portal files), extract the MainNav exports to standalone files in `client/src/pages/nav/`

---

## Run command

```bash
cd D:\Maxx-Projects\RVClaims-webapp\RVClaimsca\
claude --dangerously-skip-permissions
```

Then paste:

```
Read PHASE2E-AUTONOMOUS.md in the project root. Execute all 12 steps in order. Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing PHASE2E-DEPLOY-REPORT.md.
```

Walk away. Expected wall-clock: 60-90 minutes.
