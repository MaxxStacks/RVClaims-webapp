# DS360 V7 — FULL A-Z PLATFORM AUDIT (V6 BASELINE COMPARISON)

## PURPOSE

This is a **read-only, non-destructive** audit of the entire DealerSuite360 V7 codebase. It produces a comprehensive graded report comparing V7 against the V6 baseline — every portal, every page, every feature, every service module, every mobile app component, every data field.

**DO NOT modify any code.** Read only. Analyze. Report.

---

## AUTONOMOUS EXECUTION

Run this entire audit without pausing for approval. Do NOT restructure any files. Do NOT modify CSS. Do NOT change any application code. Your **sole output** is `V7-AUDIT-REPORT.md` written to the project root.

---

## PLATFORM CONTEXT

- **Platform:** DealerSuite360 (DS360) — multi-tenant SaaS for North American RV dealerships
- **Architecture:** 3-layer hierarchy → Operator (DS360) → Dealer → Customer/Client
- **Stack:** React 18 + TypeScript + Vite frontend, Express.js backend, Drizzle ORM + Neon PostgreSQL, Clerk auth
- **Brand:** Navy #033280 (primary), Green #0cb22c (CTA), Inter typeface
- **V7 state:** 13 portals, 215 routes, 157+ page components built across 3 CC sessions
- **V6 state:** 80 pages, 391 sub-items, 9 external systems, 9 roles, 147 events, 17 domains
- **Known issue:** V6 had more complete data, content, and functionality than V7 currently has. This audit identifies EVERY gap.

---

## SECTION 1: V6 BASELINE — THE COMPLETE FEATURE SET

This is what V6 had. V7 must match or exceed every item below. Grade each as: ✅ IN V7 | ⚠️ PARTIAL | ❌ MISSING | 🔲 PLACEHOLDER

### 1A. V6 OPERATOR PORTAL (operator_admin + operator_staff)

**V6 had 22 sidebar nav items across these sections:**

| # | Nav Section | Nav Item | Sub-Items / Features | V7 Status |
|---|------------|----------|---------------------|-----------|
| 1 | Overview | Dashboard | KPI cards (total claims, active dealers, revenue, pending), recent activity feed, quick-action shortcuts, claim status distribution chart | |
| 2 | Claims | Processing Queue | Kanban view OR list view, filter by status/dealer/date, click-through to claim detail, "Assign to Me" action | |
| 3 | Claims | Batch Review | Review multiple claims at once, batch approve/deny per FRC line | |
| 4 | Claims | All Claims | Full claims table with search, filter by status/dealer/manufacturer/date, pagination, export | |
| 5 | Claims | Stale Claims | Auto-detected claims past SLA threshold, escalation indicators | |
| 6 | Claims | Claim Detail | Full claim view: unit info, dealer info, FRC lines (each with complaint/cause/correct), photos per item, status timeline, approve/deny per line, notes, manufacturer submission tracking, preauth#, claim# | |
| 7 | Units | Unit Inventory | Global view across ALL dealers, search by VIN/stock#/dealer, filter by manufacturer/year/type | |
| 8 | Units | Unit Detail | VIN, year, make, model, stock#, specs from tag scan, 2 separated sections: Documents (warranty certs, contracts, reports) and Pictures (DAF, PDI, warranty, general), linked claims history | |
| 9 | Dealers | Dealer Management | All dealers list with search, status (active/pending/suspended), subscription tier, add new dealer, click to dealer detail | |
| 10 | Dealers | Dealer Detail | Company info, contact, subscription plan, per-claim fee schedule, billing cycle, payment method, staff list, enabled service modules, branding settings, domain config | |
| 11 | Services | Service Marketplace | Toggle services on/off per dealer, set pricing per module, view adoption rates | |
| 12 | Services | FRC Codes | CRUD per manufacturer (Jayco, Forest River, Heartland, Columbia NW, Keystone, Midwest Auto), complaint/cause/correct code management | |
| 13 | Finance | Financing Services | Lender partner management, dealer financing apps, approval tracking | |
| 14 | Finance | F&I Services | F&I product catalog, deal tracking, commission reporting | |
| 15 | Finance | F&I Products | Product definitions (GAP, Roadside, Warranty, Extended, Protection Plans), pricing, terms | |
| 16 | Finance | Warranty Plans | Plan definitions, coverage terms, renewal tracking | |
| 17 | Parts | Parts & Accessories | Parts catalog management, supplier integrations | |
| 18 | Parts | Parts Orders | Cross-dealer parts order tracking, status updates | |
| 19 | Billing | Billing & Invoices | Invoice list, create invoice (line items, service + part rows, subtotal/discount/total), payment tracking, per-dealer billing history | |
| 20 | Billing | Products & Services | Master catalog of all sellable products/services with pricing | |
| 21 | Billing | Revenue Reports | Revenue by dealer, by service module, by time period, commission tracking | |
| 22 | System | Notifications | Notification center, compose & send push notifications to dealers | |
| 23 | System | Users & Roles | All platform users, role assignment (operator_admin, operator_staff), invite, revoke | |
| 24 | System | Changelog | 4 tabs: Current Release, Past Updates, Upcoming, Feature Requests | |
| 25 | System | Settings | Platform-wide settings, email templates, default values |

**OPERATOR STAFF restrictions (V6 enforced):**
- Same claims access as admin
- NO access to: Billing & Invoices, Products & Services, Revenue Reports, Settings (platform), Users & Roles, Dealer subscription management
- NO ability to: create invoices, modify pricing, add/remove dealers, change roles

### 1B. V6 DEALER PORTAL (dealer_owner + dealer_staff)

**V6 had 18+ sidebar nav items:**

| # | Nav Section | Nav Item | Sub-Items / Features | V7 Status |
|---|------------|----------|---------------------|-----------|
| 1 | Overview | Dashboard | Claim count stats, unit count, recent claims, pending items, quick-upload shortcut | |
| 2 | Claims | Upload Photos / Push to Claim | Camera/file upload, batch photo capture, "Push to Claim" button → enters operator Processing Queue with notification | |
| 3 | Claims | My Claims | Dealer's claims only (not other dealers'), filter/search, status badges | |
| 4 | Claims | Claim Detail | Read-only view of claim progress, FRC lines, photos, status updates from operator | |
| 5 | Units | My Units | Dealer's unit inventory, search by VIN, filter by year/make | |
| 6 | Units | Add Unit | Multi-step form: VIN, year, make, model, stock#, specs, photo upload | |
| 7 | Units | Unit Detail | 4 tabs: Info, Claims (linked), Documents, Photos. Documents and Photos are SEPARATE sections | |
| 8 | Finance | Financing | Dealer's financing applications, status tracking | |
| 9 | Finance | F&I Products | Products available to this dealer based on subscription | |
| 10 | Finance | Warranty Plans | Plans available and sold | |
| 11 | Parts | Parts Orders | Dealer's parts orders, new order form | |
| 12 | Billing | Invoices & Billing | Dealer's invoices from DS360, payment history, outstanding balance | |
| 13 | Customers | Customer Portal Management | Invite customers (tied to VIN/unit), manage customer access, view customer list | |
| 14 | Customers | Customer Tickets | Tickets submitted by dealer's customers | |
| 15 | Staff | Staff | Add/remove dealer staff, role assignment (dealer_owner, dealer_staff) | |
| 16 | Branding | Branding & Domain | White-label customization: logo upload, color picker (synced color↔hex), custom domain via CNAME, preview | |
| 17 | System | What's New | Dealer-facing changelog, 4 tabs | |
| 18 | System | Settings | 5 sub-pages: Profile, Security, Notifications, Preferences, Account |

**DEALER STAFF restrictions (V6 enforced):**
- Full claims access (upload, view, push to claim)
- Full units access (add, view, edit)
- NO access to: Invoices & Billing, Staff management, Branding & Domain, Account settings
- NO ability to: invite customers, change subscription, manage payments

### 1C. V6 CUSTOMER/CLIENT PORTAL

**V6 had 14 sidebar nav items:**

| # | Nav Section | Nav Item | Sub-Items / Features | V7 Status |
|---|------------|----------|---------------------|-----------|
| 1 | Overview | Dashboard | Unit summary card, warranty status, active claims count, recent activity | |
| 2 | My RV | My Unit | Unit details (VIN, year, make, model), specs, photos | |
| 3 | My RV | Warranty & Coverage | Active warranty display, coverage breakdown (Structural, Plumbing, Electrical, HVAC, Appliances, Slide-Outs), days remaining, expiry date | |
| 4 | My RV | Documents | Warranty certs, contracts, reports — SEPARATE from photos | |
| 5 | Claims | Claim Status | Customer's claims only, simplified tracking view | |
| 6 | Claims | Claim Detail | Read-only: status, photos, progress timeline | |
| 7 | Claims | Report an Issue | Simplified issue submission with photo upload, auto-creates support ticket or claim draft | |
| 8 | Service | Parts Orders | Parts ordered for this customer's unit | |
| 9 | Service | Protection Plans | F&I upsell: GAP Insurance, Paint & Fabric Protection, Appearance, Wheel & Tire, Key Replacement | |
| 10 | Service | Roadside Assist | Roadside assistance info/enrollment (Coming Soon in V6) | |
| 11 | Support | Support Tickets | Create/track tickets (Claim/Warranty, Billing, Parts, General, Warranty Renewal, F&I, Feedback) | |
| 12 | Support | Quick Chat | Simple messaging with dealer (not full ticketing) | |
| 13 | System | Settings | 3 sub-pages: Profile, Security, Notifications |

### 1D. V6 BIDDER/MARKETPLACE PORTAL

**V6 had 8 sidebar nav items:**

| # | Nav Section | Nav Item | Sub-Items / Features | V7 Status |
|---|------------|----------|---------------------|-----------|
| 1 | Main | Dashboard | Live auction countdown timer, readiness checklist (profile complete, verified, payment on file) | |
| 2 | Main | Profile | Name, contact, company info, Save button → must call real API | |
| 3 | Main | Verification | Document upload for identity verification, status indicator | |
| 4 | Main | Payment | Add credit card via Stripe, $500 escrow hold per transaction | |
| 5 | Auctions | Upcoming Auctions | Browse listings, Register Interest button (must be functional) | |
| 6 | Auctions | My Bids | Active bids, Increase Bid / Withdraw Bid buttons (must be functional) | |
| 7 | Auctions | Won Units | Units won, Pay Now button, View Details | |
| 8 | System | Settings | 3 tabs: all Save buttons must persist changes |

---

## SECTION 2: V7 PORTAL ARCHITECTURE — 13 PORTALS

V7 expanded from 4 portals to 13. Audit EACH:

| # | Portal | Role(s) | Expected Route Prefix | Layout File Exists? | Sidebar Built? | Pages Populated? |
|---|--------|---------|----------------------|--------------------|----|---|
| 1 | Operator Admin | operator_admin | /operator/admin/ | | | |
| 2 | Operator Staff | operator_staff | /operator/staff/ | | | |
| 3 | Dealer Owner | dealer_owner | /{dealerId}/owner/ | | | |
| 4 | Dealer Staff | dealer_staff | /{dealerId}/staff/ | | | |
| 5 | Technician | technician | /{dealerId}/tech/ | | | |
| 6 | Client | client | /{dealerId}/client/ | | | |
| 7 | Public Bidder | public_bidder | /marketplace/bidder/ | | | |
| 8 | Consignor | consignor | /marketplace/consignor/ | | | |
| 9 | Independent Bidder | independent_bidder | /marketplace/independent/ | | | |
| 10 | Marketplace Admin | operator_admin | /marketplace/admin/ | | | |
| 11 | Marketplace Staff | operator_staff | /marketplace/staff/ | | | |
| 12 | Dealer Marketplace | dealer_owner | /{dealerId}/marketplace/ | | | |
| 13 | Dealer Marketplace Staff | dealer_staff | /{dealerId}/marketplace-staff/ | | | |

**For EACH portal, verify:**
- [ ] Layout file exists and renders correctly
- [ ] Sidebar has ALL expected nav items (cross-reference against V6 Section 1 above)
- [ ] Every sidebar link resolves to a real page (not 404, not blank, not "Coming Soon" placeholder)
- [ ] Content area fills the viewport width properly
- [ ] RBAC restrictions enforced (staff can't see admin pages)

---

## SECTION 3: PAGE-BY-PAGE AUDIT

For EVERY page in EVERY portal, fill in this table:

| Portal | Page Name | File Path | File Exists? | Content Status | Interactive Elements | Data Source | V6 Equivalent |
|--------|-----------|-----------|-------------|---------------|---------------------|------------|---------------|
| | | | YES/NO | REAL / PLACEHOLDER / STUB / EMPTY | Count of buttons/forms + how many are functional vs empty handlers | API / MOCK / HARDCODED / NONE | Which V6 page this maps to |

### 3A. CONTENT GRADING CRITERIA

Grade each page:

- **REAL** = Has actual content (cards, tables, forms, data), looks like a functional page
- **PLACEHOLDER** = File exists, component exports, but content is "Coming Soon" / "Under Construction" / single heading with empty div
- **STUB** = File exists but only contains `export default function PageName() { return <div>PageName</div>; }`
- **EMPTY** = File exists but is blank or has only imports

### 3B. INTERACTIVE ELEMENT AUDIT

For EVERY button, form submit, link, dropdown, toggle, modal trigger on every page:

```
FIND EVERY INSTANCE OF:
- onClick={() => {}}           → EMPTY HANDLER
- onClick={() => alert(        → ALERT-ONLY
- onClick={() => console.log(  → CONSOLE-ONLY
- onClick={() => navigate(     → REDIRECT-ONLY (verify destination exists)
- onSubmit that doesn't call fetch/axios/API → FAKE FORM
- onChange that only sets local state with no persistence → VISUAL-ONLY
```

**Report format:**
| Portal | Page | Element Label | Handler Type | Verdict |
|--------|------|--------------|-------------|---------|
| Operator Admin | Dashboard | "View All Claims" btn | navigate('/operator/admin/claims') | ✅ if route exists |
| Dealer Owner | Branding | "Save Branding" btn | onClick={() => {}} | ❌ EMPTY |

---

## SECTION 4: SERVICE MODULES — V6 vs V7 COMPARISON

V6 designed 17 service domains. For each, verify the V7 implementation:

| # | Service Domain | V6 Status | V7 Pages Exist? | V7 Has Working UI? | V7 Has API Routes? | V7 Has DB Tables? |
|---|---------------|-----------|-----------------|--------------------|--------------------|-------------------|
| 1 | **Claims Processing** (core) | Full workflow: inspect → FRC → submit → approve/deny → parts → repair → invoice → payment → close | | | | |
| 2 | **Dealer Management** | Full CRUD, subscription tiers, per-dealer pricing overrides, modular service toggle | | | | |
| 3 | **Unit/Inventory Management** | Unit-centric architecture, VIN as primary key, Documents vs Photos separation, linked claims | | | | |
| 4 | **Billing & Invoicing** | Create invoices (line items with service + part rows), payment tracking, per-dealer history | | | | |
| 5 | **F&I Services** | Product catalog (GAP, Roadside, Warranty, Extended, Protection Plans), deal tracking, commission | | | | |
| 6 | **Warranty Plans** | Plan definitions, coverage terms, renewal tracking, customer-facing display | | | | |
| 7 | **Financing Services** | Lender partner management, dealer apps, approval tracking | | | | |
| 8 | **Parts & Accessories** | Catalog management, supplier integration, ordering, tracking | | | | |
| 9 | **Customer Portal** | White-label per dealer (custom domain, logo, colors), VIN-tied access, simplified claim view | | | | |
| 10 | **Marketplace / Auctions** | Browse listings, bidding, escrow ($500), commission ($250), dealer identity hidden from bidders | | | | |
| 11 | **Consignment Services** | Consignor management, payouts via Stripe Connect | | | | |
| 12 | **TechFlow / On-Site Repairs** | Work orders, technician dispatch, service appointments, Maps/Routing API | | | | |
| 13 | **Marketing Services** | Campaign templates, dealer campaigns, leads, landing pages | | | | |
| 14 | **Roadside Assistance** | Basic (under Services) + Titanium tier (under Products) | | | | |
| 15 | **Notification System** | 147 events across 17 domains, push notifications, notification center, per-user preferences | | | | |
| 16 | **Support Ticketing** | Create/track tickets, categories, dealer-customer communication | | | | |
| 17 | **Changelog/Versioning** | Operator: 4 tabs (Current, Past, Upcoming, Feature Requests). Dealer: "What's New" 4 tabs | | | | |

---

## SECTION 5: CLAIMS WORKFLOW — STAGE-BY-STAGE AUDIT

The core business. Verify each stage has UI + API + DB support:

| # | Stage | Description | V6 Had It? | V7 UI Exists? | V7 API Route? | V7 DB Table/Column? | V7 Status |
|---|-------|------------|-----------|--------------|--------------|--------------------|----|
| 1 | Draft | Claim starts as draft, not yet submitted | YES (Phase 2F spec) | | | | |
| 2 | Photo Upload | Dealer uploads photos per item, required before submit | YES | | | | |
| 3 | FRC Lines | Add multiple FRC lines per claim (Complaint/Cause/Correct per manufacturer codes) | YES | | | | |
| 4 | Submit | Dealer pushes claim to operator queue ("Push to Claim" button) | YES | | | | |
| 5 | Processing Queue | Operator sees incoming claims, assigns to self | YES | | | | |
| 6 | Review | Operator reviews claim detail, photos, FRC lines, unit info | YES | | | | |
| 7 | Approve/Deny | Per FRC line approval (not whole claim) | YES | | | | |
| 8 | Parts Order | Parts ordering for approved items | YES | | | | |
| 9 | Repair | Work order creation, tech assignment | YES | | | | |
| 10 | Invoice | Billing for completed work | YES | | | | |
| 11 | Payment | Receipt of manufacturer payment | YES | | | | |
| 12 | Close | Final status update, claim archived | YES | | | | |

**RBAC for claims (V6 spec — Phase 2F):**
- Claims should be OPERATOR-ONLY in processing queue (currently broken — broadcasting to all roles)
- Dealer sees only THEIR claims
- Client sees only THEIR claims (simplified view)
- Staff sees same claims as owner but can't access billing

---

## SECTION 6: MOBILE APP SETUP AUDIT

### 6A. Capacitor Configuration

| Item | Expected | V7 Status |
|------|---------|-----------|
| `@capacitor/core` installed | YES | |
| `@capacitor/cli` installed | YES | |
| `capacitor.config.ts` exists | YES — appId: `com.dealersuite360.app`, appName: `DealerSuite360` | |
| `@capacitor/ios` platform added | YES | |
| `@capacitor/android` platform added | YES | |
| `ios/` directory exists with Xcode project | YES | |
| `android/` directory exists with Android Studio project | YES | |
| `npx cap sync` runs without errors | YES | |
| Bundle ID: `com.dealersuite360.app` (previously `ca.rvclaims.app`) | Verify updated post-rebrand | |

### 6B. Mobile-Specific Components

| Component | File Path | V6/Phase3 Had It? | V7 Status |
|----------|-----------|-------------------|-----------|
| MobileBottomNav.tsx | 5 tabs per portal type (op: Home/Queue/Claims/Dealers/More; dealer: Home/Upload/Claims/Units/More; customer: Home/Claims/Support/Warranty/More) | YES (181 lines) | |
| mobile.css | Safe area padding, keyboard-open class, offline banner, print styles | YES | |
| mobile.ts | initMobileSidebar, closeMobileSidebar, resize handler, PWA service worker registration, camera access (openCamera, capturePhoto, stopCamera) | YES | |
| OfflineBanner component | Shows when device is offline | YES (inside MobileBottomNav) | |
| mobile-build.sh | Build scripts: setup/dev/ios/android/both/sync | YES (123 lines) | |
| generate-app-icons.js | 1024x1024 PNG → 35 icon sizes (iOS 15 + Android 8 + PWA 8) | YES (78 lines) | |
| app-store-metadata.ts | Title, descriptions, keywords, categories, screenshot captions, permission strings, FR localization | YES (147 lines) | |
| android-manifest-additions.xml | Camera, storage, notification, location, biometric permissions | YES (36 lines) | |

### 6C. PWA Configuration

| Item | Expected | V7 Status |
|------|---------|-----------|
| `manifest.json` exists in public/ | YES — name, icons, theme_color (#033280), display: standalone | |
| Service worker (`sw.js`) registered | YES | |
| Camera API access (`navigator.mediaDevices.getUserMedia`) | YES — rear camera, 1920x1080 | |
| Offline capability | YES — service worker caching | |
| "Add to Home Screen" prompt | YES | |

### 6D. Mobile Workflows (must work end-to-end)

| # | Workflow | Description | V7 Status |
|---|---------|------------|-----------|
| 1 | Unit Tag Scan | Scan physical VIN/spec tag on RV exterior → AI reads text → auto-populates unit dashboard fields (VIN, weight, brand, model) | |
| 2 | Document Scan | Camera captures document → AI extracts data → detects VIN → auto-files to unit's Documents section | |
| 3 | Photo Capture for Claims | Take photos on lot → batch capture → photos tagged to unit | |
| 4 | Push to Claim | After photos captured, dealer taps "Push to Claim" → batch enters operator Processing Queue → operator receives push notification | |
| 5 | Mobile Responsive Layout | All portal pages render correctly at 375px width | |
| 6 | Bottom Nav | MobileBottomNav appears on mobile viewports, replaces sidebar | |

---

## SECTION 7: DATABASE & API AUDIT

### 7A. Schema Tables — V6 Required vs V7 Actual

V6 spec called for 23+ tables (Phase 1 schema). Verify each:

| # | Table Name | Purpose | V7 EXISTS? | V7 Has All Columns? |
|---|-----------|---------|-----------|---------------------|
| 1 | users | All platform users across all roles | | |
| 2 | dealerships | Dealer companies | | |
| 3 | units | RV inventory (VIN-centric) | | |
| 4 | claims | Claims header | | |
| 5 | claim_lines | FRC lines per claim (complaint/cause/correct) | | |
| 6 | claim_photos | Photos linked to claims/claim_lines | | |
| 7 | invoices | Billing documents | | |
| 8 | invoice_items | Line items on invoices | | |
| 9 | frc_codes | Manufacturer FRC code library | | |
| 10 | parts_orders | Parts ordering | | |
| 11 | support_tickets | Customer/dealer tickets | | |
| 12 | notifications | Notification records | | |
| 13 | notification_preferences | Per-user notification settings | | |
| 14 | subscription_plans | SaaS plan definitions | | |
| 15 | dealer_subscriptions | Which plan each dealer is on | | |
| 16 | dealer_services | Which service modules enabled per dealer | | |
| 17 | fi_products | F&I product catalog | | |
| 18 | warranty_plans | Warranty plan definitions | | |
| 19 | customer_units | Links customers to units (VIN-based) | | |
| 20 | documents | Files (warranty certs, contracts, reports) | | |
| 21 | audit_log | Action tracking | | |
| 22 | sessions | Auth sessions / refresh tokens | | |
| 23 | events | Event bus records | | |

### 7B. API Route Coverage

List EVERY Express route defined in the backend. For each:

| Method | Path | Middleware | Handler | Called by Frontend? | Frontend Page |
|--------|------|-----------|---------|--------------------|----|
| GET | /api/claims | | | | |
| POST | /api/claims | | | | |
| ... | | | | | |

Flag:
- Routes with no RBAC middleware
- Routes never called by any frontend component
- Frontend pages that need data but have no corresponding route

---

## SECTION 8: DESIGN & BRAND CONSISTENCY

### 8A. Color Audit

| Element | Expected | Consistent Across All 13 Portals? |
|---------|---------|----------------------------------|
| Sidebar background | White (light mode) / Dark navy (dark mode) | |
| Primary action buttons | Green #0cb22c | |
| Secondary buttons | Navy #033280 outline or gray | |
| Danger/delete buttons | Red | |
| Header/top bar | Navy #033280 | |
| Active nav item highlight | Green or navy indicator | |
| Status badges | Consistent color scheme per status | |

### 8B. Typography

| Element | Expected | Consistent? |
|---------|---------|-------------|
| Font family | Inter (all weights 400-900) | |
| Heading sizes | Consistent hierarchy across pages | |
| Body text | 14-16px consistent | |
| Monospace (code/IDs) | Used for VINs, claim#s, IDs | |

### 8C. Component Consistency

For each component type, check consistency across ALL 13 portals:

| Component | Same Padding? | Same Border-Radius? | Same Shadow? | Same Hover? |
|-----------|--------------|---------------------|-------------|------------|
| Dashboard stat cards | | | | |
| Data tables | | | | |
| Form inputs | | | | |
| Buttons (primary) | | | | |
| Buttons (secondary) | | | | |
| Buttons (danger) | | | | |
| Modal dialogs | | | | |
| Toast/notification popups | | | | |
| Badges/pills | | | | |
| Card containers | | | | |
| Tab navigation | | | | |
| Sidebar nav items | | | | |

### 8D. V6 vs V7 Visual Regression

V6 had better visual presentation in some areas. Identify:
- [ ] Which pages looked BETTER in V6 than V7
- [ ] What specific design elements were lost (shadows, gradients, spacing, card styles)
- [ ] Dashboard card design quality comparison
- [ ] Sidebar visual treatment comparison
- [ ] Page header design comparison

---

## SECTION 9: BILINGUAL (EN/FR) AUDIT

V6 had 284+ translations with full EN/FR toggle.

| Item | V6 Status | V7 Status |
|------|----------|-----------|
| Language toggle (EN \| FR pill) | ✅ Working | |
| Nav labels translated | ✅ 284 entries | |
| Button labels translated | ✅ All buttons | |
| Form labels translated | ✅ All forms | |
| Dashboard content translated | ✅ | |
| Error messages translated | ✅ | |
| Date formatting (locale-aware) | ✅ | |
| Currency formatting (CAD) | ✅ | |
| FR routes (/actualites, etc.) | ✅ | |
| localStorage persistence (ds360-lang) | ✅ | |

---

## SECTION 10: INFRASTRUCTURE

| Item | Expected | V7 Status |
|------|---------|-----------|
| `npm run build` passes | No errors | |
| `npm run check` (TypeScript) passes | No errors | |
| Console errors on page load | None | |
| React key warnings in lists | None | |
| Railway auto-deploy from main | Working | |
| Custom domain (dealersuite360.com) | Resolving | |
| HTTPS | Working | |
| SPA fallback (all routes → index.html) | Configured | |
| DevAccessV7 portal selector | Working, links to all 13 portals | |
| Environment variables | All required vars set in Railway | |

**Required env vars:**
- DATABASE_URL
- CLERK_PUBLISHABLE_KEY
- CLERK_SECRET_KEY
- VITE_CLERK_PUBLISHABLE_KEY
- RESEND_API_KEY
- STRIPE_SECRET_KEY
- STRIPE_PUBLISHABLE_KEY
- VITE_STRIPE_PUBLISHABLE_KEY

---

## SECTION 11: RBAC ENFORCEMENT MATRIX

For each data domain, verify who can access what:

| Data Domain | Op Admin | Op Staff | Dealer Owner | Dealer Staff | Technician | Client | Bidder |
|------------|---------|---------|-------------|-------------|-----------|--------|--------|
| All dealers' claims | FULL | FULL | ❌ | ❌ | ❌ | ❌ | ❌ |
| Own dealer's claims | FULL | FULL | FULL | FULL (no billing) | READ (assigned) | READ (own) | ❌ |
| Create claims | ❌ | ❌ | CREATE | CREATE | ❌ | REPORT ISSUE | ❌ |
| Process claims | FULL | FULL | ❌ | ❌ | ❌ | ❌ | ❌ |
| All dealers' units | FULL | READ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Own dealer's units | FULL | READ | FULL | FULL | READ | READ (own unit) | ❌ |
| Dealer management | FULL | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Billing/Invoices | FULL | ❌ | FULL (own) | ❌ | ❌ | ❌ | ❌ |
| Staff management | FULL | ❌ | FULL (own) | ❌ | ❌ | ❌ | ❌ |
| Branding/Domain | FULL | ❌ | FULL (own) | ❌ | ❌ | ❌ | ❌ |
| Auction listings | FULL | READ | CREATE | READ | ❌ | ❌ | BROWSE |
| Bidding | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ | BID |
| Marketplace admin | FULL | READ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Platform settings | FULL | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| Notification send | FULL | ❌ | ❌ | ❌ | ❌ | ❌ | ❌ |
| User/role management | FULL | ❌ | OWN STAFF | ❌ | ❌ | ❌ | ❌ |

Verify V7 enforces each cell. Flag any cell where enforcement is MISSING or WRONG.

---

## SECTION 12: SUBSCRIPTION & PRICING MODEL

V6 designed a modular subscription system. Verify V7 has:

| Item | V6 Spec | V7 Status |
|------|--------|-----------|
| Base module: Claims (required) | YES | |
| Add-on: Financing Services | YES — toggleable per dealer | |
| Add-on: F&I Services | YES | |
| Add-on: Warranty Plans | YES | |
| Add-on: Parts & Accessories | YES | |
| Add-on: Marketing Services | YES | |
| Add-on: Consignment | YES | |
| Add-on: TechFlow (On-Site Repairs) | YES | |
| Add-on: Marketplace/Auctions | YES | |
| Per-dealer pricing overrides | YES — operator can set custom pricing per dealer | |
| 3-tier branding (Base/Mid/Enterprise) | YES | |
| Per-claim fee schedule | YES — configurable per dealer | |

---

## SECTION 13: LOST FEATURES HUNT

Features that were spec'd, possibly built, but are now buried or missing in the V7 codebase. For EACH feature below, search the ENTIRE codebase (grep -r) and report:

| # | Feature | Spec Exists? | Code Exists? | Where? (file paths) | Functional? | Lines of Code |
|---|---------|-------------|-------------|---------------------|-------------|---------------|
| 1 | **DS360 Assist (AI Agent)** — AI chatbot for dealer_owner and dealer_staff. Helps create units, file claims, purchase services. 5 escalation paths: create ticket, email account manager, request callback, live chat, request screen share. Anthropic API-powered with RAG knowledge base. Analytics dashboard on operator side. | | | | | |
| 2 | **Screen Share / Remote Support** — WebRTC browser-based screen sharing. Dealer generates 6-digit access code (expires 10 min). Operator enters code to view dealer's screen. View-only mode + screen takeover mode. Yellow banner shows "DS360 Support is viewing your screen." LiveKit SDK. | | | | | |
| 3 | **Work by Dealer (Agent Mode)** — Operator selects a dealer and enters their context as their agent. Sees units, clients, claims from that dealer's perspective. | | | | | |
| 4 | **AI F&I Presenter** — Live video avatar (Tavus/D-ID) for remote F&I product upsells. Customer receives link post-purchase. AI avatar greets by name, knows unit and financing, walks through F&I products, handles objections. Accepted products auto-sync to operator portal. | | | | | |
| 5 | **AI Document Scanner** — Scan/upload documents, AI extracts data, auto-populates fields. Detects VIN from scanned docs, auto-files into unit's record. | | | | | |
| 6 | **Unit Tag Scanner** — Mobile camera scans physical VIN/spec tag on RV exterior. AI reads text, auto-populates unit dashboard (VIN, weight, brand, model). | | | | | |
| 7 | **Push to Claim** — Batch photo capture → dealer taps "Push to Claim" → enters operator Processing Queue with push notification. | | | | | |
| 8 | **White-Label Customer Portal** — Custom domain via CNAME, logo, colors managed in dealer dashboard. Customer access via dealer invite link tied to VIN. | | | | | |
| 9 | **Modular Subscription System** — Base Claims + 8 add-on modules, per-dealer pricing overrides, 3-tier branding. | | | | | |
| 10 | **News/Blog Section** — 6 articles (EN/FR), category filters, featured article, bilingual routes (/news, /actualites). | | | | | |
| 11 | **Public Auction / Marketplace** — Public Showcase browsing, monthly 24hr auctions, public account registration. | | | | | |
| 12 | **Import System** — CSV/Excel upload with field mapping, validation, custom_data JSONB. | | | | | |
| 13 | **Dark Mode** — Toggle persisted to localStorage (ds360-theme), dark mode compatible sidebar. | | | | | |
| 14 | **Profile Photo Upload** — Upload profile photo, updates both settings and sidebar avatar. | | | | | |
| 15 | **Invoice Builder** — Inline invoice creation with add service row + add part row, subtotal/discount/total calculation. | | | | | |

**SEARCH METHOD:** For each feature, run:
```bash
grep -rl "keyword" client/src/ server/ --include="*.tsx" --include="*.ts" --include="*.css"
```
Use keywords: "assist", "agent", "screen share", "screenshare", "remote", "webrtc", "livekit", "f&i presenter", "tavus", "d-id", "scanner", "push to claim", "white-label", "whitelabel", "subscription", "module", "news", "blog", "auction", "import", "dark-mode", "darkMode", "dark_mode", "profile photo", "avatar upload", "invoice builder"

---

## SECTION 14: DEAD CODE & ORPHAN FILE AUDIT

### 14A. Orphan Components
Files that exist but are NOT imported anywhere:
```bash
# For every .tsx/.ts file in client/src/, check if it's imported by any other file
find client/src -name "*.tsx" -o -name "*.ts" | while read f; do
  basename=$(basename "$f" | sed 's/\.[^.]*$//')
  count=$(grep -rl "$basename" client/src/ --include="*.tsx" --include="*.ts" | grep -v "$f" | wc -l)
  if [ "$count" -eq 0 ]; then echo "ORPHAN: $f"; fi
done
```

### 14B. Orphan Routes
Routes defined in the router that point to components that don't exist or are never rendered.

### 14C. Orphan API Routes
Express routes defined in server/ that are never called by any frontend fetch/axios call.

### 14D. Orphan Database Tables
Tables in the Drizzle schema that are never referenced by any API route handler.

### 14E. Orphan CSS
CSS classes/selectors defined but never used in any component.

### 14F. Old V6 Files Still Present
List every file that belongs to the OLD monolithic portal structure (OperatorPortal.tsx, DealerPortal.tsx, CustomerPortal.tsx, BidderPortal.tsx, PortalSelectV6.tsx, etc.) that should eventually be deleted once V7 is confirmed working.

**Report format:**
| Category | File Path | Lines | Last Modified | Safe to Delete? | Reason |
|----------|-----------|-------|--------------|----------------|--------|

---

## SECTION 15: MODULE MAPPING — EVERY FILE TAGGED TO A SERVICE DOMAIN

Tag EVERY file in client/src/ and server/ to one of these service domains:

| Domain ID | Domain Name | Description |
|----------|------------|-------------|
| CORE | Platform Core | Layouts, shell, routing, auth, shared components, design system |
| CLAIMS | Claims Processing | Everything related to claims workflow |
| UNITS | Unit/Inventory Management | Unit CRUD, VIN tracking, documents, photos |
| DEALERS | Dealer Management | Dealer CRUD, subscription management |
| BILLING | Billing & Invoicing | Invoices, payments, revenue reports |
| FI | F&I Services | F&I products, deals, commissions |
| WARRANTY | Warranty Plans | Plan management, coverage, renewals |
| FINANCING | Financing Services | Lender management, applications, approvals |
| PARTS | Parts & Accessories | Catalog, ordering, tracking |
| MARKETPLACE | Marketplace/Auctions | Listings, bidding, escrow, commissions |
| CONSIGNMENT | Consignment | Consignor management, payouts |
| TECHFLOW | TechFlow/On-Site Repairs | Work orders, dispatch, appointments |
| MARKETING | Marketing Services | Campaigns, leads, landing pages |
| ROADSIDE | Roadside Assistance | Enrollment, service requests |
| SUPPORT | Support & Ticketing | Tickets, quick chat, agent, screen share |
| MOBILE | Mobile App | Capacitor, PWA, bottom nav, camera |
| NOTIFICATIONS | Notification System | Events, push notifications, preferences |
| CHANGELOG | Changelog/Versioning | Operator changelog, dealer "What's New" |
| I18N | Bilingual/i18n | Translations, language toggle |
| CUSTOMER | Customer Portal | Customer-facing features |
| LEGACY | Old/Deprecated | V6 files pending deletion |
| UNKNOWN | Untagged | Files that don't clearly belong to any domain |

**Report format — EVERY file gets tagged:**
| File Path | Lines | Domain | Portal(s) | Notes |
|-----------|-------|--------|-----------|-------|
| client/src/layouts/OperatorAdminLayout.tsx | 245 | CORE | Operator Admin | Layout shell |
| client/src/pages/shared/Claims.tsx | 89 | CLAIMS | Op Admin, Op Staff, Dealer Owner, Dealer Staff | Claims list |
| client/src/pages/exclusive/operator-admin/ProcessingQueue.tsx | 156 | CLAIMS | Op Admin only | Queue view |
| server/routes/claims.ts | 340 | CLAIMS | — | API routes |
| client/src/components/MobileBottomNav.tsx | 181 | MOBILE | All | Bottom nav |

This mapping becomes the reorganization blueprint. When we build the module architecture, every file tagged to CLAIMS goes into `/modules/claims/`, every file tagged to BILLING goes into `/modules/billing/`, etc.

---

## SECTION 16: DATABASE CLEANUP READINESS

### 16A. Tables in Schema vs Tables Actually Used

| Table Name | In Drizzle Schema? | Referenced by API Routes? | Referenced by Frontend? | Has Data? | Verdict |
|-----------|-------------------|--------------------------|------------------------|----------|---------|
| | | | | | KEEP / REVIEW / DELETE |

### 16B. Columns That Exist But Are Never Read or Written

For each table, list columns that no API route reads or writes.

### 16C. Orphan Relationships

Foreign keys pointing to tables that don't exist or are empty.

### 16D. Seed Data vs Real Data

Flag tables that only contain seed/test data with no real user data.

---

## OUTPUT FORMAT

Write `V7-AUDIT-REPORT.md` to the project root:

```
# DS360 V7 AUDIT REPORT
Generated: [timestamp]
Audited by: Claude Code (autonomous read-only analysis)

## EXECUTIVE SUMMARY
- Total files audited: X
- Total routes audited: X
- Total pages graded: X
- V6 features present in V7: X / Y (Z%)
- Mobile app readiness: X%
- Overall platform health: X/100

## SCORE CARD
| Category | Score | Critical Issues |
|----------|-------|-----------------|
| Portal Structure (13 portals) | /100 | |
| Navigation (all nav items resolve) | /100 | |
| Page Content (real vs placeholder) | /100 | |
| Interactive Elements (functional vs empty) | /100 | |
| Service Modules (17 domains) | /100 | |
| Claims Workflow (12 stages) | /100 | |
| Mobile App Setup | /100 | |
| Database Schema | /100 | |
| API Routes | /100 | |
| RBAC Enforcement | /100 | |
| Design Consistency | /100 | |
| Bilingual Support | /100 | |
| Infrastructure | /100 | |
| V6 Feature Parity | /100 | |
| Lost Features Recovery | /100 | |
| Dead Code / Orphans | /100 | |
| Module Readiness | /100 | |
| Database Cleanup Readiness | /100 | |

## SECTION-BY-SECTION FINDINGS
[Fill in every table from Sections 1-16 above with actual findings]

## CRITICAL ISSUES — FIX IMMEDIATELY
[Numbered list with portal, page, and specific element]

## HIGH PRIORITY ISSUES
[Numbered list]

## MEDIUM PRIORITY ISSUES
[Numbered list]

## LOW PRIORITY ISSUES
[Numbered list]

## V6 → V7 COMPLETE GAP LIST
[Every single thing in V6 that is not in V7]

## LOST FEATURES — FOUND / NOT FOUND
[For each of the 15 features in Section 13: where the code is, whether it works, what's missing]

## EMPTY/BROKEN HANDLER FULL LIST
[Every button/form with empty onClick or fake onSubmit]

## COMPLETE FILE → MODULE MAP
[Every file in the codebase tagged to a service domain per Section 15]

## DEAD CODE — SAFE TO DELETE
[Every orphan file, orphan route, orphan table, orphan CSS with line counts and deletion recommendation]

## DATABASE CLEANUP PLAN
[Tables to keep, tables to review, tables to delete, orphan columns, orphan relationships]

## RECOMMENDED FIX ORDER
Phase A: Foundation (nav, empty handlers, placeholder pages)
Phase B: Core functionality (claims workflow, CRUD operations)
Phase C: Module reorganization (restructure files into /modules/ architecture)
Phase D: Service module integration (bring V6 features into V7 modules)
Phase E: Lost feature recovery (agent, screen share, scanner)
Phase F: Mobile app
Phase G: Polish (design, bilingual, changelog)
Phase H: Database cleanup (drop orphan tables, remove dead columns)
```

---

## EXECUTION COMMAND

```
claude --dangerously-skip-permissions -p "Read DS360-V7-FULL-AUDIT.md in the project root. This is a READ-ONLY audit — do NOT modify any application code. Execute ALL 16 sections:

SECTION 1-2: Compare every V6 feature against V7 — fill in every V7 Status cell.
SECTION 3: Grade every page in every portal — content quality, interactive elements, data source.
SECTION 4-5: Verify all 17 service modules and 12 claims workflow stages.
SECTION 6: Audit full mobile/Capacitor/PWA setup.
SECTION 7: Check every DB table and API route.
SECTION 8-9: Design consistency and bilingual support.
SECTION 10-11: Infrastructure and RBAC enforcement.
SECTION 12: Subscription/pricing model verification.
SECTION 13: LOST FEATURES HUNT — grep the entire codebase for all 15 features listed. Report exact file paths and whether the code is functional.
SECTION 14: DEAD CODE — find every orphan file, orphan route, orphan table, orphan CSS class. Report line counts and deletion safety.
SECTION 15: MODULE MAPPING — tag EVERY file in client/src/ and server/ to a service domain. This is the most important section — it becomes the reorganization blueprint.
SECTION 16: DATABASE CLEANUP — cross-reference schema tables against actual API usage.

Write V7-AUDIT-REPORT.md to the project root with complete findings. Be exhaustive — do not summarize, do not skip, do not estimate. When complete, print AUDIT COMPLETE and the overall health score."
```
