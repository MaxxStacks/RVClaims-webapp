# Portal Assessment: Dealer Suite 360
**Date:** 2026-04-26

---

## What Actually Exists

### Architecture (Phase 2E) — Solid Foundation
The shell architecture built in this codebase is well-designed:
- **PortalShell** (240px mainNav + AppBar + content area) is clean
- **SectionLayout** (optional 260px contextual sidebar) layered on top where needed
- **MainNav components** extracted to `pages/nav/` to avoid circular imports
- **DualContext nav pattern** (in-SPA via `onShowPage`, standalone URL via `navigate`) is the right call

This part is stable and should not change.

---

## What Has Real, Working Pages

### Operator Portal (V6)
| Page | Status |
|------|--------|
| Dealer Accounts list | Real component (`DealerAccountsListPage`) |
| Dealership detail | Real component with tabs, KPIs, edits |
| Claim Queue | Real component — kanban, filters, slide-in panel (Phase 2F) |
| Parts Management | Real component |
| Work by Dealer (unit list) | `InventoryListPage context="operator"` |
| Unit profile | `UnitProfilePage context="operator"` |
| All other 20+ pages | **PageScaffold only** — yellow warning box with sub-item wiring |

### Dealer Portal (V6)
| Page | Status |
|------|--------|
| Claims | `DealerClaimsPage` — real |
| Inventory | `InventoryListPage context="dealer"` — real |
| Parts Store | `DealerPartsOrdersPage` — real |
| New claim flow | `NewClaimPage` — real, draft-then-submit (Phase 2F) |
| New unit | `NewUnitPage` — real |
| Unit profile | `UnitProfilePage context="dealer"` — real |
| All other 15+ pages | **PageScaffold only** |

### Client Portal (V6)
| Page | Status |
|------|--------|
| Claims | `ClientClaimsPage` — real, minimal view (Phase 2F) |
| Vehicle | `InventoryListPage context="client"` — real |
| All other 10 pages | **PageScaffold only** |

---

## Core Problems

### 1. Two Portal Systems Running in Parallel (Critical)
The codebase has **two complete portal systems** living side by side:
- **Old locked portals** at `/operator`, `/dealer`, `/client` (OperatorPortal.tsx 1227 lines, DealerPortal.tsx 874 lines, CustomerPortal.tsx 522 lines)
- **New V6 portals** at `/operator-v6`, `/dealer-v6`, `/client-v6`

The old portals are 100% hardcoded UI with no real API calls. The new V6 portals are the live system but are 70-80% scaffolding. There is no defined moment when the old portals get retired. This dual-system situation creates confusion about what is "the real portal," adds maintenance surface, and means the actual production user experience is unclear.

### 2. The Schema and Navigation Are Ahead of the Content
The V6 portals have a brilliantly designed schema system — page IDs, RBAC rules, sub-item data flow wiring — but **most pages behind the nav are yellow scaffolding cards**. The navigation promises 25-30 pages per portal. Maybe 4-6 per portal have real content. A user clicking through the operator portal hits "Development scaffold" banners 80% of the time. This is the primary quality problem.

### 3. PageScaffold Duplication Across All Three Portal Files
The `PageScaffold` component, `EXT_SYS_COLORS`, the `SubItem` interface, and `PageScaffoldProps` interface are **copy-pasted identically** into all three portal files (OperatorPortalV6, DealerPortalV6, ClientPortalV6). Same for the full `ROLES` constant. 300+ lines of dead weight tripled. When you add a real page to one portal, you have to manually maintain parity on the scaffold in the others.

### 4. Unused State in Portal Components
All three V6 portal components declare `sidebarCollapsed`, `apiFetch`, `isNavActive`, `showPage`, and `anyVisible` — none of which are wired to anything. `sidebarCollapsed` is never toggled. `apiFetch` is imported but unused. `anyVisible` is only called in the nav, but the portal component has its own copy doing nothing.

### 5. No Routing Consistency
Some portal pages are standalone routes (`/operator-v6/dealerships/:id`, `/dealer-v6/units/:unitId/claims/new`), some are SPA-internal (`currentPage` state). The split is ad-hoc. When a dealer is on their "Claims" page and refreshes the browser, they land on the SPA root, not the claims page. Deep linking doesn't work for the 70% of pages that are SPA-only.

### 6. CLAUDE.md Rule 4 (Bilingual/i18n) Is Being Ignored
Every hardcoded English string in the V6 components bypasses the i18n system. The old portals used a DOM-walking i18n engine; the new V6 components have zero i18n hookup. If this is going to be the production system, bilingual compliance needs to be built in from the start, not bolted on later.

---

## The Real Issue with Claude Web

Claude web has a **fixed context window** and no ability to read your actual files between sessions. Every session starts cold. The result is:
- Each session generates reasonable-looking code that doesn't integrate correctly with existing patterns
- The scaffold components get built correctly but the real page implementations diverge in styling, naming conventions, and API integration
- There's no memory of architectural decisions made in prior sessions, so patterns get reinvented
- Large components (ClaimQueuePage, DealershipDetailPage, the portal files themselves) exceed what Claude web can hold in context while also reading related files

Claude Code runs with file access, persistent memory, and session continuity. That's why the Phase 2E/2F work produced architecturally coherent results — the shell architecture, dual-context nav, and RBAC were all designed with full file context.

---

## Recommended Forward Strategy

### Phase 3A: Consolidate (Before building more pages)
**Retire the old portals.** Redirect `/operator`, `/dealer`, `/client`, `/bidder` to their V6 equivalents. Delete OperatorPortal.tsx, DealerPortal.tsx, CustomerPortal.tsx. The V6 system is already more capable — there's no reason to keep the old ones running. This removes ~2,600 lines of dead weight and eliminates the dual-system confusion.

**Extract shared portal utilities** into a single file (`client/src/lib/portal-utils.ts`): `PageScaffold`, `EXT_SYS_COLORS`, `SubItem` interface, `ROLES` constant. Import from there in all three portal files. Reduces maintenance burden significantly.

### Phase 3B: Build Pages in Priority Order
Stop building scaffolding and commit to a page build priority list. Suggested order based on dealer daily workflow:

**Tier 1 — Dealers need these to operate (build next):**
1. Dealer Dashboard (active claims summary, notifications)
2. Dealer Clients list + Client detail
3. Dealer Documents (invoice view from DS360, contracts)
4. Dealer Portal Settings (staff management, branding)

**Tier 2 — Operator daily ops:**
1. Operator Operations Dashboard (claim queue overview)
2. Operator Reporting (claims by dealer, processing times)
3. Operator Staff & Permissions

**Tier 3 — Revenue modules (Q2/Q3 roadmap):**
- Financing, F&I, Sales & Services, Marketplace

### Phase 3C: URL Routing for SPA Pages
Each meaningful page should have a URL. Use wouter's URL params as the initial `currentPage` state so refreshes land in the right place. This makes the portal feel like a real web app instead of a single-page mashup.

---

## What to Bring Into Each Claude Code Session

For consistent, high-quality results, each session should start by reading:
1. The specific page being built (existing component if updating, scaffold output if new)
2. 1-2 adjacent components to match styling patterns
3. The relevant server route file to understand the API shape
4. `PortalShell.tsx` and the relevant `MainNav` file for layout context

Don't try to build more than 2-3 pages per session. Quality drops when context is split across too many files.

---

## Summary

The architecture is good. The schema/RBAC design is sophisticated and production-ready. The problem is execution depth — the nav promises 80 pages and about 15 have real content. The path forward is to stop adding scaffolding and start filling in real pages, in priority order, one module at a time.

---

## File Map (Pages with Real Content)

```
client/src/components/
  layout/
    PortalShell.tsx          — outer shell (mainNav + AppBar + content)
    SectionLayout.tsx        — optional contextual sidebar wrapper
    tokens.ts                — layout constants (widths, colors)
  operator/
    ClaimQueuePage.tsx       — kanban board, 7 columns, slide-in detail
    DealerAccountsListPage.tsx
    DealershipDetailPage.tsx — tabs, KPIs, full detail
    DealersContextSidebar.tsx
    NewDealershipPage.tsx
    PartsManagementPage.tsx
  dealer/
    DealerClaimsPage.tsx
    DealerPartsOrdersPage.tsx
  client/
    ClientClaimsPage.tsx     — minimal RBAC view
  claims/
    NewClaimPage.tsx         — draft-then-submit flow
  units/
    InventoryListPage.tsx    — operator/dealer/client context-aware
    UnitProfilePage.tsx      — operator/dealer/client context-aware
    NewUnitPage.tsx
    UnitsContextSidebar.tsx

client/src/pages/
  OperatorPortalV6.tsx       — SPA shell, RBAC, renderPage()
  DealerPortalV6.tsx         — SPA shell, RBAC, renderPage()
  ClientPortalV6.tsx         — SPA shell, RBAC, renderPage()
  BidderPortalV6.tsx         — SPA shell
  nav/
    OperatorMainNav.tsx      — dual-context (onShowPage or navigate)
    DealerMainNav.tsx
    ClientMainNav.tsx
    BidderMainNav.tsx

server/routes/
  claims-v6.ts               — RBAC-enforced, draft→submit flow, kanban API
  units-v6.ts
  dealerships-v6.ts
  uploads-v6.ts

server/lib/
  event-bus.ts               — claim events, operator-only fan-out
```
