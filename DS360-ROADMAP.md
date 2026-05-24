# DS360-ROADMAP.md — Master Development Plan

**Last Updated:** 2026-05-24
**Visible To:** operator_admin only (portal page at /operator/admin/roadmap)
**Purpose:** Single source of truth for all development. CC reads this at session start.

---

## CATEGORY 1: TERMINOLOGY & NAMING CLEANUP (TERM)

### TERM-001 | Audit all code for old portal references
- **Priority:** CRITICAL
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Code still references "DealerPortal", "CustomerPortal", "BidderPortal", "activePage", old nav labels. All references must align to the 13-portal architecture:
  - Operator Admin, Operator Staff
  - Dealer Owner, Dealer Staff, Client
  - Service Manager, Shop Manager, Parts Manager, Financial Manager, Shop Technician, On-Site Technician
  - Public Bidder, Consignor
- **Dependencies:** None

### TERM-002 | Standardize nav labels across all 13 portals
- **Priority:** CRITICAL
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Define the official nav label for every sidebar item per portal. Not copied from old portals — defined from scratch based on what each role needs.
- **Dependencies:** TERM-001

---

## CATEGORY 2: NAVIGATION & LINKS (NAV)

### NAV-001 | Fix all broken/missing sidebar nav links
- **Priority:** CRITICAL
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Audit found 25+ missing nav items across portals. Dealer marketplace section entirely missing from DealerOwner. Public Bidder missing core browse/auction links. Client missing "Report an Issue". All nav items must link to real routes that render real pages.
- **Dependencies:** TERM-002

### NAV-002 | Verify every sidebar link resolves to correct page
- **Priority:** CRITICAL
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Click every nav item in every portal. Confirm URL changes correctly and correct page renders. No dead links, no wrong redirects, no fallback to dashboard.
- **Dependencies:** NAV-001

### NAV-003 | Add System Status external link to all portals
- **Priority:** LOW
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** External link to /system-status opening in new tab. Was in all old portals, missing from all new layouts.
- **Dependencies:** NAV-001

---

## CATEGORY 3: DESIGN & UI CONSISTENCY (DES)

### DES-001 | Button style audit and standardization
- **Priority:** HIGH
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Inconsistent button styles across portals. Primary buttons (CTA green #0cb22c), secondary/outline buttons, cancel buttons, icon buttons — all need a single consistent pattern. Define the button system and apply universally.
- **Dependencies:** None

### DES-002 | Card and block component consistency
- **Priority:** HIGH
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Dashboard cards, detail cards, stat blocks, list items have inconsistent padding, borders, shadows, and spacing across portals. Standardize the card system.
- **Dependencies:** None

### DES-003 | Link styling consistency
- **Priority:** HIGH
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Some links styled as buttons, some inline text, some have hover states and some don't. Define link patterns: nav links, inline links, action links, breadcrumb links.
- **Dependencies:** None

### DES-004 | Full design audit — old V6 vs new V7 comparison
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Pre-V6 portal had better visual presentation. ds360-design-audit.md exists but hasn't been executed. Compare old design language with new, identify what was lost, create a design token system.
- **Dependencies:** DES-001, DES-002, DES-003

---

## CATEGORY 4: FUNCTIONALITY & BROKEN ACTIONS (FUN)

### FUN-001 | Audit all buttons/actions for real functionality
- **Priority:** CRITICAL
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Many buttons have empty onClick handlers or just redirect to dashboard. Every interactive element must do what it says — create, edit, delete, submit, save, cancel. If backend endpoint doesn't exist yet, show "Coming Soon" toast, don't silently redirect.
- **Dependencies:** None

### FUN-002 | Claims RBAC fix — claims broadcasting to all roles
- **Priority:** CRITICAL
- **Status:** PLANNED
- **Portals:** Operator Admin, Operator Staff, Dealer Owner, Dealer Staff, Service Manager
- **Notes:** From Phase 2F spec. Claims currently visible to all roles instead of scoped. Operator sees all, dealer sees own, client sees own (customer-facing fields only). #1 data integrity issue.
- **Dependencies:** DATA-001

### FUN-003 | Draft-then-submit claim flow
- **Priority:** HIGH
- **Status:** PLANNED
- **Portals:** Dealer Owner, Dealer Staff
- **Notes:** From Phase 2F spec. Claims created as drafts, require photos before submission, then enter operator processing queue. No draft state currently exists.
- **Dependencies:** FUN-002

### FUN-004 | Unit creation — full working flow
- **Priority:** HIGH
- **Status:** PLANNED
- **Portals:** Dealer Owner, Dealer Staff
- **Notes:** Add Unit form must create real unit record in database with VIN validation. New unit must appear in units list immediately after creation.
- **Dependencies:** DATA-001

### FUN-005 | Dealer creation — full working flow
- **Priority:** HIGH
- **Status:** PLANNED
- **Portals:** Operator Admin
- **Notes:** Add Dealer form must create real dealer record, set up workspace. New dealer must appear in dealer directory.
- **Dependencies:** DATA-001

---

## CATEGORY 5: DATA FLOW & COMMUNICATION (DATA)

### DATA-001 | Remove all mock data — wire to real API
- **Priority:** CRITICAL
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Full mock data audit completed. 34 HYBRID items and 6 fully static items. Dashboard stats must compute from API arrays. Activity feeds need real endpoint or empty state. Detail pages must read from fetched arrays, not hardcoded data.
- **Dependencies:** None

### DATA-002 | Inter-portal data communication
- **Priority:** CRITICAL
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** When dealer creates claim, operator must see it. When operator approves, dealer and client must see status change. Data flows through database — all portals query same tables with role-based scoping.
- **Dependencies:** DATA-001, FUN-002

### DATA-003 | Visibility matrix implementation
- **Priority:** HIGH
- **Status:** PLANNED
- **Portals:** All 13
- **Notes:** Field-level visibility matrix defines what each of 14 roles can read/write on every entity. Implemented as API middleware that strips fields based on role before sending response.
- **Dependencies:** DATA-002

### DATA-004 | Import system refinements
- **Priority:** MEDIUM
- **Status:** IN PROGRESS
- **Portals:** Operator Admin, Dealer Owner, Dealer Staff
- **Notes:** CSV/Excel import built and deployed. Template downloads added. Still needs: import order guidance in UI, VIN-as-key explanation, dynamic template labels.
- **Dependencies:** None

---

## CATEGORY 6: MISSING FEATURES — FROM OLD PORTAL (FEAT)

### FEAT-001 | Marketplace section — Dealer Owner
- **Priority:** HIGH
- **Status:** PLANNED
- **Notes:** Browse Units, My Listings, My Transactions, Live Auctions, Public Showcase, My Bids, Escrow & Payments. Nav links missing, pages exist but may need wiring.

### FEAT-002 | Marketplace section — Public Bidder
- **Priority:** HIGH
- **Status:** PLANNED
- **Notes:** Live Monthly Auctions, Browse Units. Core bidder functionality missing from sidebar.

### FEAT-003 | Portal Settings — Dealer Owner
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Notes:** Route exists, page exists, nav link missing. Customer portal configuration (white-label domain, logo, colors).

### FEAT-004 | My Subscription — Dealer Owner
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Notes:** Separate from billing or tab within billing? Shows current plan, upgrade options, payment history.

### FEAT-005 | Report an Issue — Client
- **Priority:** HIGH
- **Status:** PLANNED
- **Notes:** Page component exists, nav link missing. Core client workflow for submitting problems.

### FEAT-006 | Account page — Client
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Notes:** Page exists (merged into Settings). May need separate nav entry or is Settings sufficient?

---

## CATEGORY 7: MOBILE APP (MOB)

### MOB-001 | Sync new portal structure to mobile build
- **Priority:** HIGH
- **Status:** PLANNED
- **Notes:** Capacitor config exists (com.dealersuite360.app). New 13-portal route structure must work within mobile WebView. Verify all routes render correctly in Capacitor.
- **Dependencies:** NAV-002

### MOB-002 | Mobile-specific feature audit
- **Priority:** HIGH
- **Status:** PLANNED
- **Notes:** Define what dealers need on mobile for launch: Camera for claim photos, VIN/tag scanner, push notifications, offline unit lookup, quick claim submission ("Push to Claim"), parts photo capture. Create feature matrix: mobile vs desktop.

### MOB-003 | Mobile UI optimization
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Notes:** Sidebar behavior on mobile (hamburger menu), touch targets, responsive tables, bottom nav bar. Current portal CSS may not be mobile-ready.
- **Dependencies:** MOB-001

### MOB-004 | iOS build and TestFlight
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Notes:** Build via Capacitor, submit to TestFlight for beta testing. Requires Apple Developer account, signing, provisioning profiles.
- **Dependencies:** MOB-001, MOB-003

### MOB-005 | Android build and Play Store
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Notes:** Build via Capacitor, submit to Play Store internal testing. Requires Google Play Developer account.
- **Dependencies:** MOB-001, MOB-003

---

## CATEGORY 8: INFRASTRUCTURE (INFRA)

### INFRA-001 | Railway deployment — app.dealersuite360.com
- **Priority:** HIGH
- **Status:** IN PROGRESS
- **Notes:** Railway connected to GitHub, auto-deploys from main. Custom domain app.dealersuite360.com needs CNAME at registrar.
- **Dependencies:** None

### INFRA-002 | Separate staging environment
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Notes:** Production and staging should NOT share Neon DB, Clerk, or Stripe keys. Separate credentials required to avoid data corruption.
- **Dependencies:** INFRA-001

### INFRA-003 | Stripe billing integration
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Notes:** Deferred. Jonathan handling separately. Test mode keys recommended for staging.
- **Dependencies:** INFRA-002

---

## CATEGORY 9: CHANGELOG (LOG)

### LOG-001 | Desktop changelog — Operator Admin portal
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Notes:** Visible only to operator_admin. Tracks all platform changes. Changelog page exists — needs real content instead of mock data.

### LOG-002 | Desktop changelog — Dealer-facing ("What's New")
- **Priority:** MEDIUM
- **Status:** PLANNED
- **Notes:** Dealer-facing changelog visible to dealer_owner and dealer_staff. Shows features relevant to dealers only, not internal operator changes.

### LOG-003 | Mobile changelog — iOS
- **Priority:** LOW
- **Status:** PLANNED
- **Notes:** Separate from desktop. Tracks mobile-specific changes, app store version history, mobile feature releases.

### LOG-004 | Mobile changelog — Android
- **Priority:** LOW
- **Status:** PLANNED
- **Notes:** Same as iOS changelog but for Play Store releases. May share content if features are identical.

---

## EXECUTION PRIORITY ORDER

### PHASE A — Foundation (must be done first):
- TERM-001, TERM-002 → Clean terminology
- NAV-001, NAV-002 → Working navigation
- FUN-001 → No broken buttons
- DATA-001 → Remove mock data

### PHASE B — Core functionality:
- FUN-002 → Claims RBAC
- FUN-003, FUN-004, FUN-005 → Working create flows
- DATA-002 → Inter-portal communication
- FEAT-001, FEAT-002, FEAT-005 → Missing critical features

### PHASE C — Polish:
- DES-001, DES-002, DES-003, DES-004 → Design consistency
- DATA-003 → Visibility matrix
- FEAT-003, FEAT-004, FEAT-006 → Remaining features

### PHASE D — Mobile:
- MOB-001, MOB-002, MOB-003 → Mobile prep
- MOB-004, MOB-005 → App store builds

### PHASE E — Launch prep:
- LOG-001, LOG-002, LOG-003, LOG-004 → Changelogs
- INFRA-001, INFRA-002, INFRA-003 → Infrastructure

---

## COMPLETED ITEMS

### SESSION HISTORY (2026-05-24):
- ✅ Renamed RVClaims → DealerSuite360 (codebase, GitHub, Railway, bundle ID)
- ✅ Session 1: File structure — 136 placeholder files (13 layouts + 37 shared + 86 exclusive)
- ✅ Session 2: Layouts built + 157 page components populated
- ✅ Session 3: Route registration — 215 routes live across 13 portals
- ✅ Import system — CSV/Excel upload with field mapping, validation, custom_data JSONB
- ✅ DevAccessV7 portal selector page created
- ✅ SPA fallback confirmed for both dev and production
- ✅ Temp file audit completed (47 files identified for deletion)
