# DATA ROUTING SPEC — DealerSuite360
_Generated from PORTAL-UI-INVENTORY.json — All 4 portals_

**Generated:** 2026-03-23
**Portals covered:** Operator Portal · Dealer Portal · Customer Portal · Bidder Portal
**Total actions documented:** 277 across 84 pages

> This document defines the complete behavior chain for every button, form, upload, link, and interactive element across all 4 portals. For each action: what it does, where the data goes, who sees it, what it triggers, and where it lands on the receiving end.

---

## HOW TO READ THIS DOCUMENT

- `FUNCTIONAL` — API call is wired and working
- `NOT FUNCTIONAL` — empty handler, `console.log`, or `alert()` stub only
- `HARDCODED` — static data, no API connection
- `UNVERIFIED ENDPOINT` — API path inferred from context, not confirmed in backend
- `[REVIEW]` — needs Jonathan's input
- `[REVIEW: SECURITY]` — role restriction gap or missing enforcement
- `[SECURITY: UI-only restriction — needs API enforcement]` — restriction is client-side only

---

# DATA ROUTING SPEC — OPERATOR PORTAL
_Generated from PORTAL-UI-INVENTORY.json_

**Accessible by:** Operator Admin, Operator Staff (restrictions noted per action)

---

## Architecture Notes

- All API calls use `apiFetch()` from `@/lib/api` — not raw fetch.
- All WebSocket subscriptions use `wsClient` from `@/lib/websocket`.
- All portal navigation is a single `useState(activePage)` toggling CSS `display:block/none`.
- File uploads use `FileReader` for client-side preview only — no server upload in current build.
- Hardcoded data arrays are flagged `HARDCODED`.
- Non-functional handlers are flagged `NOT FUNCTIONAL`.

### WebSocket Subscriptions (Operator Portal)

| Event | Effect |
|-------|--------|
| `claim:updated` | Refreshes `opClaims` array |
| `batch:uploaded` | Refreshes `opBatches` array |

---

## PAGE 1: Dashboard

### Dashboard → View All Claims
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'all-claims'` — navigates to the All Claims page
- **API call:** NONE (navigation only)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: All Claims
  - Section: Claims table
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both Operator Admin and Operator Staff can use this
- **Current state:** FUNCTIONAL (navigation)

---

### Dashboard → View All Dealers
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'dealers'` — navigates to the Dealer Management page
- **API call:** NONE (navigation only)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Dealer Management
  - Section: Dealers table
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both Operator Admin and Operator Staff can use this
- **Current state:** FUNCTIONAL (navigation)

---

### Dashboard → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'dashboard'`
- **What happens:** Fetches active claims, all dealers, and all invoices to populate stat cards and summary tables
- **API call:**
  - `GET /api/claims` → `opClaims`
  - `GET /api/dealerships` → `opDealers`
  - `GET /api/invoices` → `opInvoices`
- **Data created/modified:** None (read-only fetch)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Dashboard
  - Section: Stat cards (Active Claims, Pending Approval, Active Dealers, Revenue MTD); Recent Claims table (first 5 rows); Recent Dealers table (first 5 rows)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** Feeds: Active Claims count, Pending Approval count, Active Dealers count, Revenue MTD sum
- **Role restrictions:** Both roles see same data — all dealers, all claims. Multi-tenant: operator sees platform-wide
- **Current state:** FUNCTIONAL

---

## PAGE 2: Processing Queue

### Processing Queue → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'queue'`
- **What happens:** Fetches claims filtered to `status=pending_review` — populates queue table
- **API call:** `GET /api/claims?status=pending_review` → `opClaims`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Processing Queue
  - Section: Queue table (Claim #, Dealer, Unit/VIN, Type, Items, Photos, Submitted, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None directly; queue depth is an operational metric
- **Role restrictions:** Both roles can access this page
- **Current state:** FUNCTIONAL

---

### Processing Queue → Review (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `selectedClaimId` to the row's claim ID, then sets `activePage` to `'claim-detail'`
- **API call:** NONE at this step (fetch fires on claim-detail load)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Claim Detail
  - Section: Full claim detail view
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can review claims
- **Current state:** FUNCTIONAL (navigation + state set)

---

### Processing Queue → Assign to Me (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional for any role
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: BUSINESS LOGIC] When implemented, this should assign the claim to the logged-in operator user. Should update a `assigned_to` field on the `claims` table and notify other operators it is claimed. [REVIEW: ROUTING] Dealer should potentially see "Being reviewed" status indicator.

---

## PAGE 3: Batch Review

### Batch Review → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'batch-review'`
- **What happens:** Fetches all batches to populate the batch table
- **API call:** `GET /api/batches` → `opBatches`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Batch Review
  - Section: Batch table (Batch ID, Dealer, Units, Claims, Photos, Uploaded, Status, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL

---

### Batch Review → Review Batch (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `selectedBatchId` to the row's batch ID, then sets `activePage` to `'batch-detail'`
- **API call:** NONE at this step
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: batch-detail (page referenced but not documented as a separate page in inventory — inferred sub-page)
  - Section: Batch detail view
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation + state set)
- **[REVIEW]:** [REVIEW] `batch-detail` page is referenced in `selectedBatchId` state and navigation but does not appear as a defined page in the inventory. May be a missing page definition or handled inline.

---

## PAGE 4: All Claims

### All Claims → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'all-claims'`
- **What happens:** Fetches all claims across all dealers
- **API call:** `GET /api/claims` → `opClaims`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: All Claims
  - Section: Claims table (Claim #, Dealer, Unit/VIN, Type, Status, Submitted, Revenue, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** Feeds Revenue column — surfaces per-claim revenue data
- **Role restrictions:** Both roles; multi-tenant: all dealers' claims shown
- **Current state:** FUNCTIONAL

---

### All Claims → Filter (status dropdown)
- **Trigger:** Dropdown change
- **What happens:** Client-side filter applied to `opClaims` array by status value
- **API call:** NONE (client-side filter on already-fetched data)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal only
  - Role: Operator Admin, Operator Staff
  - Page: All Claims
  - Section: Claims table — filtered rows displayed
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (client-side filter)
- **[REVIEW]:** [REVIEW] Filter behavior (client-side vs server-side query param) is unverified. Inventory lists filters as UI elements but does not specify whether they trigger new API calls with query params.

---

### All Claims → Filter (claim type dropdown)
- **Trigger:** Dropdown change
- **What happens:** Client-side filter applied to `opClaims` array by claim type (DAF, PDI, Warranty, Extended Warranty, Insurance)
- **API call:** NONE (client-side filter)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal only
  - Role: Operator Admin, Operator Staff
  - Page: All Claims
  - Section: Claims table — filtered rows
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (client-side filter)
- **[REVIEW]:** [REVIEW] Same server vs client-side ambiguity as status filter.

---

### All Claims → Filter (dealer dropdown)
- **Trigger:** Dropdown change
- **What happens:** Client-side filter applied to `opClaims` by dealer
- **API call:** NONE (client-side filter)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal only
  - Role: Operator Admin, Operator Staff
  - Page: All Claims
  - Section: Claims table — filtered rows
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (client-side filter)

---

### All Claims → Filter (date range)
- **Trigger:** Date range input change
- **What happens:** Client-side filter applied to `opClaims` by submitted date range
- **API call:** NONE (client-side filter)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal only
  - Role: Operator Admin, Operator Staff
  - Page: All Claims
  - Section: Claims table — filtered rows
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (client-side filter)

---

### All Claims → View (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `selectedClaimId` to the row's claim ID, then sets `activePage` to `'claim-detail'`
- **API call:** NONE at this step (fetch fires on claim-detail load)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Claim Detail
  - Section: Full claim view
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation + state set)

---

## PAGE 5: Claim Detail

### Claim Detail → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'claim-detail'` and `selectedClaimId` change
- **What happens:** Fetches full claim record including lines, photos, parts, and timeline
- **API call:** `GET /api/claims/:selectedClaimId` → `selectedClaimDetail`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Claim Detail
  - Section: Header (Claim #, Dealer, Unit VIN, Type, Status, Submitted); Claim Info section; Claim Lines table (FRC Code, Description, Labor Hrs Req, Labor Hrs Appr, Status, Parts, Photos); Photos section; Parts section; Timeline section
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None (read)
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL

---

### Claim Detail → Back Button
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'all-claims'`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: All Claims
  - Section: Claims table
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)

---

### Claim Detail → Assign FRC Code
- **Trigger:** Button/inline action on a claim line
- **What happens:** Opens inline FRC lookup UI for the selected line — UI is present but no API call is wired to save the selection
- **API call:** NONE (UI present, no API call)
- **Data created/modified:** None (no persistence)
- **Where it lands:** N/A — not persisted
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional for any role
- **Current state:** NOT FUNCTIONAL (UI present, no API call wired)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: should `POST` or `PUT` to update `claim_lines.frc_code_id`. Cross-portal impact: FRC code assignment affects the Dealer Portal Claim Detail (line detail view) and drives invoice calculations. [REVIEW: SECURITY] Both roles should be able to assign FRC; Operator Staff is the primary operator.

---

### Claim Detail → Flag Photo
- **Trigger:** Button click on a photo in the photos section
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: should update `line_photos.ai_flags` or a manual flag field. Dealer Portal should surface the flag on their Claim Detail → Photos section so the dealer knows to re-upload. [REVIEW: NOTIFICATION] Dealer should receive notification: "Photo flagged on Claim #[X] — please re-upload."

---

### Claim Detail → Submit to Manufacturer
- **Trigger:** Button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: this is a critical workflow step. Should update `claims.status` to `submitted_to_manufacturer` and `claims.submitted_at`. Cross-portal: Dealer Portal → My Claims table status column updates; Dealer Portal → Claim Detail → Timeline section shows new step. [REVIEW: NOTIFICATION] Dealer → "Your claim #[X] has been submitted to [Manufacturer]." [REVIEW: BUSINESS LOGIC] Actual submission happens on the manufacturer's own portal — this button should log that the operator has completed the external submission, not automate it.

---

### Claim Detail → Log Manufacturer Response
- **Trigger:** Button click (opens a form to enter manufacturer claim # and preauth #)
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: should `PUT /api/claims/:id` with `{mfr_claim_number, mfr_preauth_number}`. Cross-portal: Dealer Portal → Claim Detail → Claim Info section shows the manufacturer claim # and preauth #. [REVIEW: NOTIFICATION] Dealer → "Manufacturer has issued Claim # and Preauth # for your claim #[X]."

---

### Claim Detail → Approve Line
- **Trigger:** Row action button on a claim line
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: should `PUT /api/claim_lines/:id` with `{line_status: 'approved', approved_labor_hrs: X}`. Cross-portal impact: Dealer Portal → Claim Detail → Claim Lines table `Status` column changes to `Approved`; Customer Portal → Claim Detail → visual progress timeline updates. [REVIEW: NOTIFICATION] Dealer → "Line [FRC code] approved on Claim #[X]." [REVIEW: BUSINESS LOGIC] Approval triggers billing engine — generates invoice line item. KPI: feeds Revenue MTD on Dashboard.

---

### Claim Detail → Deny Line
- **Trigger:** Row action button on a claim line
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: should `PUT /api/claim_lines/:id` with `{line_status: 'denied', denial_reason: '...'}`. Cross-portal: Dealer Portal → Claim Detail → Claim Lines table `Status` column changes to `Denied`; Customer Portal → Claim Detail → timeline updates. [REVIEW: NOTIFICATION] Dealer → "Line [FRC code] was denied on Claim #[X]. Reason: [reason]." [REVIEW: BUSINESS LOGIC] Denial does NOT trigger billing. Denial rate is a key platform metric.

---

## PAGE 6: Stale Claims

### Stale Claims → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'stale-claims'`
- **What happens:** Fetches claims filtered by stale criteria (no activity beyond threshold)
- **API call:** `GET /api/claims?stale=true` → `opClaims`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Stale Claims
  - Section: Stale table (Claim #, Dealer, Unit, Type, Last Activity, Days Idle, Status, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** Stale claim count is an operational health metric
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL
- **[REVIEW]:** [REVIEW] The `stale=true` query param implies server-side logic determining staleness based on `Settings → stab-s-general → Stale Claim Threshold (days)`. That settings save is NOT FUNCTIONAL, so the threshold may be hardcoded server-side.

---

### Stale Claims → Review (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `selectedClaimId` to the row's claim ID, then `activePage` to `'claim-detail'`
- **API call:** NONE at this step
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Claim Detail
  - Section: Full claim view
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation + state set)

---

## PAGE 7: Dealer Management

### Dealer Management → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'dealers'`
- **What happens:** Fetches all dealerships across the platform
- **API call:** `GET /api/dealerships` → `opDealers`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Dealer Management
  - Section: Dealers table (Dealer, Owner, Plan, Claims, Balance, Status, Joined, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** Active Dealers count feeds Dashboard stat card
- **Role restrictions:** Both roles see all dealers
- **Current state:** FUNCTIONAL

---

### Dealer Management → Add Dealer
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'add-dealer'`
- **API call:** NONE (navigation only)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Add Dealer form
  - Section: N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can navigate here
- **Current state:** FUNCTIONAL (navigation)
- **[REVIEW]:** [REVIEW: SECURITY] UI-only — both roles can navigate to Add Dealer. If only Operator Admin should create dealers, the API endpoint `POST /api/dealerships` must enforce the role restriction server-side. **[SECURITY: UI-only restriction — needs API enforcement]** if Operator Staff should not create dealers.

---

### Dealer Management → View (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `selectedDealerId` to the row's dealer ID, then sets `activePage` to `'dealer-detail'`
- **API call:** NONE at this step
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Dealer Detail (9-tab view)
  - Section: Overview tab (default)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation + state set)

---

### Dealer Management → Approve (per row, condition: status=pending)
- **Trigger:** Row action button click (only appears when dealer `status === 'pending'`)
- **What happens:** Calls `handleApproveDealership(id)` which sends a PUT request to update dealer status to `active`, then refreshes `opDealers`
- **API call:** `PUT /api/dealerships/:id` body: `{status: 'active'}` → then refresh `opDealers`
- **Data created/modified:** `dealers.status` changed from `pending` to `active`
- **Where it lands:**
  - Portal: Dealer Portal — dealer gains full access; dashboard becomes accessible
  - Role: Dealer Owner (the approved dealer's owner account) — they can now log in and use the platform
  - Page: Dealer Portal Dashboard
  - Section: All dealer portal pages become accessible post-approval
- **Notifications triggered:** [TODO: Notification not wired] Dealer Owner should receive email + in-app notification: "Your dealership account has been approved. You can now log in."
- **Status changes:** `dealers.status`: `pending` → `active`
- **KPI impact:** Active Dealers count on Operator Dashboard increments
- **Role restrictions:** Both Operator Admin and Operator Staff can approve dealers (no UI restriction noted)
- **Current state:** FUNCTIONAL
- **[REVIEW]:** [REVIEW: SECURITY] If only Operator Admin should approve dealers, the `PUT /api/dealerships/:id` endpoint must enforce this server-side. Current RBAC commit (a039d70) may cover this — unverified. [REVIEW: NOTIFICATION] Dealer approval notification is not wired. [REVIEW: BUSINESS LOGIC] Approval should also trigger onboarding wizard flow for the dealer on first login.

---

## PAGE 8: Add Dealer

### Add Dealer → Create Dealer (form submit)
- **Trigger:** Form submit / button click on "Create Dealer"
- **What happens:** Calls `handleCreateDealer()` which POSTs `addDealerForm` to create a new dealership record, then refreshes `opDealers` and navigates to `'dealers'`
- **API call:** `POST /api/dealerships` body: `{name, email, phone, province, plan}`
- **Data created/modified:** New `dealers` record created with: `name`, owner `email`, `phone`, `province`, `subscription_plan`, `status` (likely `pending` or `active` depending on server logic)
- **Where it lands:**
  - Portal: Dealer Portal — new dealer owner receives login access
  - Role: Dealer Owner (the created email address)
  - Page: Dealer Portal — first login → onboarding wizard (per CLAUDE.md flow)
  - Section: N/A — depends on onboarding flow
  - Operator Portal: `opDealers` table adds new row; Dealer Management page shows new dealer
- **Notifications triggered:** [TODO: Notification not wired] New dealer owner should receive email invitation with login credentials or a setup link
- **Status changes:** New `dealers` record; `status` field set by server (likely `pending` awaiting separate approval, or `active` if operator-created = pre-approved)
- **KPI impact:** Active Dealers count (if status=active); or Pending count (if status=pending)
- **Role restrictions:** Both Operator Admin and Operator Staff can reach this form. **[SECURITY: UI-only restriction — needs API enforcement]** if Add Dealer should be Admin-only.
- **Current state:** FUNCTIONAL
- **[REVIEW]:** [REVIEW: BUSINESS LOGIC] When operator creates a dealer directly (vs dealer self-signup), the initial status (pending vs active) is ambiguous. [REVIEW: NOTIFICATION] No email invite wired to new dealer owner. [REVIEW: ROUTING] Dealer Portal: the new dealer owner will have no portal access until login credentials are established. The flow for credential delivery is not wired.

---

### Add Dealer → Cancel
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'dealers'` — discards form, no API call
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: Dealer Management
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)

---

## PAGE 9: Dealer Detail

### Dealer Detail → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'dealer-detail'` and `selectedDealerId` change
- **What happens:** Fetches full dealer record
- **API call:** `GET /api/dealerships/:selectedDealerId` → `selectedDealerDetail`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Dealer Detail
  - Section: All 9 tabs populated from `selectedDealerDetail`
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL

---

### Dealer Detail → Tab Switch (9 tabs)
- **Trigger:** Tab click
- **What happens:** Updates `dealerTab` state, toggling CSS display for the selected tab content. Tabs: Overview, Claims, Units, Staff, Invoices, Wallet, Subscription, Branding, Activity Log
- **API call:** NONE (client-side state toggle; data already loaded on page load)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal only
  - Role: Operator Admin, Operator Staff
  - Page: Dealer Detail
  - Section: Selected tab content panel
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles see all 9 tabs
- **Current state:** FUNCTIONAL
- **[REVIEW]:** [REVIEW: SECURITY] The Invoices, Wallet, and Subscription tabs contain billing data. Per RBAC spec, Operator Staff should NOT access billing/invoicing data. Currently there is no restriction on which tabs Operator Staff can view in Dealer Detail. **[SECURITY: UI-only restriction — needs API enforcement]** These tabs should be hidden from or blocked for Operator Staff.

---

### Dealer Detail → Edit Dealer
- **Trigger:** Button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: SECURITY] When implemented, Edit Dealer (changing name, plan, contact info) should be Operator Admin only. [REVIEW: ROUTING] Plan changes affect Dealer Portal → Invoices & Billing page (billing model changes) and Dashboard stat display.

---

### Dealer Detail → Suspend Dealer
- **Trigger:** Button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: SECURITY] Suspension should be Operator Admin only — high-impact action. **[SECURITY: UI-only restriction — needs API enforcement]** [REVIEW: ROUTING] When implemented: `dealers.status` → `suspended`. Cross-portal: Dealer Portal login should be blocked; Dealer Owner should receive suspension notification. All active claims should be flagged. Active Dealers KPI decrements.

---

### Dealer Detail → Send Invoice
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'create-invoice'` — navigates to the invoice builder
- **API call:** NONE (navigation only)
- **Data created/modified:** None at this step
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Create Invoice
  - Section: Invoice builder (Dealer field pre-populated with current dealer context is NOT confirmed — see REVIEW)
- **Notifications triggered:** None at this step
- **Status changes:** None
- **KPI impact:** None at this step
- **Role restrictions:** Both roles can navigate here — **[SECURITY: UI-only restriction — needs API enforcement]** if only Operator Admin should create invoices (per RBAC spec: Operator Staff cannot access invoicing)
- **Current state:** FUNCTIONAL (navigation)
- **[REVIEW]:** [REVIEW: SECURITY] Per RBAC, Operator Staff cannot access billing/invoicing. This button is visible to Operator Staff on Dealer Detail. The Create Invoice page must enforce role restriction. [REVIEW: ROUTING] The dealer context from Dealer Detail may not be pre-populated in the Create Invoice form — the Dealer select field on Create Invoice likely defaults to empty.

---

## PAGE 10: Unit Inventory

### Unit Inventory → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'units'`
- **What happens:** Fetches all units across all dealers
- **API call:** `GET /api/units` → `opUnits`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Unit Inventory
  - Section: Units table (VIN, Year/Make/Model, Dealer, Type, DAF, PDI, Warranty Exp, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None directly
- **Role restrictions:** Both roles see all units across all dealers
- **Current state:** FUNCTIONAL

---

### Unit Inventory → Add Unit
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'add-unit'`
- **API call:** NONE (navigation)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: Add Unit form
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)

---

### Unit Inventory → View (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `selectedUnitId` to the row's unit ID, then sets `activePage` to `'unit-detail'`
- **API call:** NONE at this step
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Unit Detail (5-tab view)
  - Section: Info tab (default)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation + state set)

---

## PAGE 11: Add Unit

### Add Unit → Create Unit (form submit)
- **Trigger:** Form submit / button click on "Create Unit"
- **What happens:** Calls `handleCreateUnit()` which POSTs `addUnitForm` to create a new unit record, refreshes `opUnits`, and navigates to `'units'`
- **API call:** `POST /api/units` body: `{vin, make, model, year, dealerId}`
- **Data created/modified:** New `units` record with VIN, make, model, year, and `dealer_id`
- **Where it lands:**
  - Portal: Dealer Portal — unit appears in dealer's My Units table
  - Role: Dealer Owner, Dealer Staff (of the assigned dealer)
  - Page: Dealer Portal → My Units
  - Section: Units table — new row
  - Operator Portal: `opUnits` table adds new row; Unit Inventory page shows the new unit
  - Dealer Detail → Units tab: new unit appears in this dealer's unit list
- **Notifications triggered:** [TODO: Notification not wired] Dealer should potentially receive notification that a unit has been added to their account by the operator
- **Status changes:** New unit record; `daf_status` and `pdi_status` likely default to `pending`
- **KPI impact:** Units on File count on Dealer Dashboard increments
- **Role restrictions:** Both Operator Admin and Operator Staff can create units. **[SECURITY: UI-only restriction — needs API enforcement]** if unit creation should be restricted.
- **Current state:** FUNCTIONAL
- **[REVIEW]:** [REVIEW: ROUTING] Unit created by operator appears immediately in Dealer Portal (My Units). The dealer's `addUnitForm.dealerId` must correctly scope the unit to the right tenant. [REVIEW: BUSINESS LOGIC] VIN must be unique — duplicate VIN handling is not specified.

---

### Add Unit → Cancel
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'units'`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: Unit Inventory
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)

---

## PAGE 12: Unit Detail

### Unit Detail → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'unit-detail'` and `selectedUnitId` change
- **What happens:** Fetches full unit record
- **API call:** `GET /api/units/:selectedUnitId` → unit detail data (state variable not named in inventory — inferred)
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Unit Detail
  - Section: All 5 tabs populated
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL

---

### Unit Detail → Tab Switch (5 tabs)
- **Trigger:** Tab click
- **What happens:** Updates `unitTab` state. Tabs: Info, Photos, Claims, Documents, History
- **API call:** NONE (client-side toggle)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal only
  - Role: Operator Admin, Operator Staff
  - Page: Unit Detail
  - Section: Selected tab panel
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles see all 5 tabs
- **Current state:** FUNCTIONAL

---

### Unit Detail → Toggle Edit Mode (Info tab)
- **Trigger:** Edit toggle button click in the Info tab
- **What happens:** Calls `toggleUnitEdit()` — sets `unitEditMode` to `true`, converting display fields to editable inputs
- **API call:** NONE (client-side state toggle only)
- **Data created/modified:** None (UI state only)
- **Where it lands:**
  - Portal: Operator Portal only
  - Page: Unit Detail → Info tab
  - Section: Fields become editable (VIN, Make, Model, Year, Type, Dealer)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (toggle only — the subsequent Save is NOT FUNCTIONAL)

---

### Unit Detail → Save Changes (Info tab edit mode)
- **Trigger:** Button click while `unitEditMode === true`
- **What happens:** Empty handler — no operation performed, no data saved
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: `PUT /api/units/:id` with updated fields. Cross-portal: Dealer Portal → My Units table and Unit Detail reflect updated fields. [REVIEW: SECURITY] VIN changes should be Admin-only or heavily audited.

---

### Unit Detail → Photo Upload (Photos tab)
- **Trigger:** File input / drag-drop in Photos tab
- **What happens:** Calls `updateOpUnitPhoto()` — uses `FileReader` to generate a client-side preview. No server upload occurs.
- **API call:** NONE (FileReader only — client-side preview, NOT server upload)
- **Data created/modified:** None (no persistence)
- **Where it lands:** N/A — preview is local only
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional for storage
- **Current state:** NOT FUNCTIONAL (FileReader only — client-side preview, NOT server upload)
- **Accepted types:** All file types accepted by FileReader (no specific type restriction documented)
- **[REVIEW]:** [REVIEW] When implemented: should upload to Cloudflare R2 / S3, create `inspection_photos` record (per CLAUDE.md schema) with `file_path`, `thumbnail`, `photo_type`, `ai_quality_score`. Per-dealer storage isolation required.

---

## PAGE 13: FRC Codes

### FRC Codes → Page Load (data display)
- **Trigger:** `activePage === 'frc-codes'` becoming active
- **What happens:** Displays hardcoded `frcData` array — no API call
- **API call:** NONE — data is HARDCODED (`frcData` array in component)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal only
  - Role: Operator Admin, Operator Staff
  - Page: FRC Codes
  - Section: FRC table (Code, Manufacturer, Category, Description, Default Labor Hrs, Status, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** HARDCODED

---

### FRC Codes → Filter (manufacturer dropdown)
- **Trigger:** Dropdown change
- **What happens:** Client-side filter on `frcData` by manufacturer
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Operator Portal, FRC Codes table — filtered rows
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** HARDCODED (filter operates on hardcoded data)

---

### FRC Codes → Filter (category dropdown)
- **Trigger:** Dropdown change
- **What happens:** Client-side filter on `frcData` by category
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Operator Portal, FRC Codes table — filtered rows
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** HARDCODED

---

### FRC Codes → Filter (search text)
- **Trigger:** Text input change
- **What happens:** Client-side text search on `frcData`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Operator Portal, FRC Codes table — filtered rows
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** HARDCODED

---

### FRC Codes → Add FRC Code
- **Trigger:** Button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. **[SECURITY: UI-only restriction — needs API enforcement]** when implemented — FRC code management should likely be Operator Admin only
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: `POST /api/frc_codes`. New codes immediately available in the FRC lookup on Claim Detail for both operators.

---

### FRC Codes → Edit (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: SECURITY] Should be Operator Admin only when implemented.

---

### FRC Codes → Deactivate (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] Deactivating an FRC code used on active claim lines could create data integrity issues. [REVIEW: SECURITY] Should be Operator Admin only.

---

## PAGE 14: Service Marketplace

### Service Marketplace → Page Load (data display)
- **Trigger:** `activePage === 'service-marketplace'` becoming active
- **What happens:** Displays hardcoded service module cards with status badges (Live, Q2 2026, Q3 2026, Q4 2026)
- **API call:** NONE — data is HARDCODED
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal only
  - Role: Operator Admin, Operator Staff
  - Page: Service Marketplace
  - Section: Module overview cards
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** HARDCODED

---

### Service Marketplace → Manage (per module)
- **Trigger:** Button click per module card
- **What happens:** Navigates to the respective module page (e.g., financing, fi, warranty-plans, parts)
- **API call:** NONE (navigation)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: The respective module's list page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)

---

## PAGE 15: Financing

### Financing → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'financing'`
- **What happens:** Fetches financing applications
- **API call:** `GET /api/financing` → local state (inferred)
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Financing
  - Section: Financing table (Application #, Dealer, Customer, Amount, Lender, Status, Date, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** UNVERIFIED ENDPOINT (`/api/financing` endpoint path is inferred)

---

### Financing → New Application
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'financing-new'`
- **API call:** NONE (navigation)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: financing-new (sub-page)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)
- **[REVIEW]:** [REVIEW] `financing-new` sub-page is not documented in the inventory as a separate page entry.

---

### Financing → View (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `activePage` to `'financing-detail'`
- **API call:** NONE at this step
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: financing-detail (sub-page)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)
- **[REVIEW]:** [REVIEW] `financing-detail` sub-page is not documented in the inventory as a separate page entry.

---

## PAGE 16: F&I

### F&I → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'fi'`
- **What happens:** Fetches F&I deals
- **API call:** `GET /api/fi` → local state (inferred)
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: F&I
  - Section: F&I table (Deal #, Dealer, Customer, Product, Amount, Status, Date, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** UNVERIFIED ENDPOINT (`/api/fi` is inferred)

---

### F&I → New Deal
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'fi-new'`
- **API call:** NONE (navigation)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: fi-new (sub-page)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)
- **[REVIEW]:** [REVIEW] `fi-new` sub-page not documented as a separate entry.

---

### F&I → View (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `activePage` to `'fi-detail'`
- **API call:** NONE at this step
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: fi-detail (sub-page)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)
- **[REVIEW]:** [REVIEW] `fi-detail` sub-page not documented.

---

## PAGE 17: Warranty Plans

### Warranty Plans → Page Load (data display)
- **Trigger:** `activePage === 'warranty-plans'` becoming active
- **What happens:** Displays warranty plans — source is listed as "hardcoded or API" (ambiguous)
- **API call:** UNVERIFIED — may be hardcoded, may be an API call
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Warranty Plans
  - Section: Warranty table (Plan Name, Provider, Duration, Coverage, Price, Status, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** UNVERIFIED ENDPOINT / possibly HARDCODED

---

### Warranty Plans → Add Plan
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'warranty-new'`
- **API call:** NONE (navigation)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: warranty-new (sub-page)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)
- **[REVIEW]:** [REVIEW] `warranty-new` sub-page not documented.

---

### Warranty Plans → View (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)

---

## PAGE 18: Parts & Accessories

### Parts & Accessories → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'parts'`
- **What happens:** Fetches parts orders across all dealers
- **API call:** `GET /api/parts` → local state (inferred)
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Parts & Accessories
  - Section: Parts table (Part #, Name, Dealer, Claim, Source, Cost, Status, Ordered, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** UNVERIFIED ENDPOINT (`/api/parts` is inferred)

---

### Parts & Accessories → New Parts Order
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'parts-new'`
- **API call:** NONE (navigation)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: parts-new (sub-page)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)
- **[REVIEW]:** [REVIEW] `parts-new` sub-page not documented.

---

### Parts & Accessories → View (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `activePage` to `'parts-detail'`
- **API call:** NONE at this step
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: parts-detail (sub-page)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)
- **[REVIEW]:** [REVIEW] `parts-detail` sub-page not documented. [REVIEW: ROUTING] Parts orders are linked to `claim_lines` (per schema). When a parts order status changes, the Dealer Portal → Claim Detail → Parts section should reflect the update.

---

## PAGE 19: Billing & Invoices

### Billing & Invoices → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'billing'`
- **What happens:** Fetches all invoices across all dealers
- **API call:** `GET /api/invoices` → `opInvoices`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin ONLY (per RBAC — Operator Staff cannot access billing)
  - Page: Billing & Invoices
  - Section: Stat cards (Total Invoiced MTD, Collected, Outstanding, Overdue); Invoices table (Invoice #, Dealer, Claim, Amount, Tax, Total, Status, Date, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** Feeds billing KPIs: Total Invoiced MTD, Collected, Outstanding, Overdue
- **Role restrictions:** Operator Admin only per RBAC spec. **[SECURITY: UI-only restriction — needs API enforcement]** The sidebar item and the `GET /api/invoices` endpoint must both enforce Operator Admin restriction.
- **Current state:** FUNCTIONAL (API call fires, but role restriction is not enforced in UI)

---

### Billing & Invoices → Create Invoice
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'create-invoice'`
- **API call:** NONE (navigation)
- **Data created/modified:** None at this step
- **Where it lands:**
  - Portal: Operator Portal
  - Page: Create Invoice
- **Notifications triggered:** None at this step
- **Status changes:** None
- **KPI impact:** None at this step
- **Role restrictions:** Operator Admin only per RBAC. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** FUNCTIONAL (navigation)

---

### Billing & Invoices → View (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Should be Operator Admin only when implemented.
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### Billing & Invoices → Mark Paid (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Should be Operator Admin only when implemented.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: `PUT /api/invoices/:id` with `{status: 'paid', paid_at: now}`. Cross-portal: Dealer Portal → Invoices & Billing page (owner only) → invoice row status updates to Paid. [REVIEW: NOTIFICATION] Dealer Owner → "Invoice #[X] has been marked paid." [REVIEW: BUSINESS LOGIC] For Plan B (Pre-Funded Wallet), payment should trigger `wallet_transactions` record (deduction). Collected KPI increments; Outstanding decrements.

---

## PAGE 20: Create Invoice

### Create Invoice → Dealer Select (header field)
- **Trigger:** Dropdown change
- **What happens:** Updates dealer selection in the invoice form header
- **API call:** NONE (client-side state)
- **Data created/modified:** None (form state only)
- **Where it lands:** Create Invoice form only
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only (page-level restriction applies)
- **Current state:** FUNCTIONAL (client-side form field from `opDealers`)

---

### Create Invoice → Add Service/Subscription (line item)
- **Trigger:** Button click
- **What happens:** Calls `addServiceRow()` — uses direct `innerHTML` DOM manipulation to inject a dropdown row into the line items container
- **API call:** NONE (DOM manipulation only)
- **Data created/modified:** None (DOM only — not persisted)
- **Where it lands:** Create Invoice page — line items section gains a new service row
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only (page-level)
- **Current state:** FUNCTIONAL (DOM manipulation works as intended per CLAUDE.md Known Behaviors #1)

---

### Create Invoice → Search & Add Part (line item)
- **Trigger:** Button click
- **What happens:** Calls `addPartRow()` — uses direct `innerHTML` DOM manipulation to inject a part search row
- **API call:** NONE (DOM manipulation only)
- **Data created/modified:** None (DOM only)
- **Where it lands:** Create Invoice page — line items section gains a new part search row
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only (page-level)
- **Current state:** FUNCTIONAL (DOM manipulation, per Known Behaviors #1)

---

### Create Invoice → Remove Row (× button, per row)
- **Trigger:** Button click on × button of a line item row
- **What happens:** `row.remove()` via DOM traversal — removes the row from the DOM
- **API call:** NONE (DOM manipulation)
- **Data created/modified:** None (DOM only)
- **Where it lands:** Create Invoice page — row removed from line items
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only (page-level)
- **Current state:** FUNCTIONAL (DOM manipulation, per Known Behaviors #1)

---

### Create Invoice → Send Invoice
- **Trigger:** Button click
- **What happens:** Empty handler — no operation performed, invoice not created
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: `POST /api/invoices` with full invoice data. Cross-portal impact: Dealer Portal → Invoices & Billing page (owner only) → new invoice row appears with status `sent`/`outstanding`; Dealer Dashboard → Outstanding balance updates. [REVIEW: NOTIFICATION] Dealer Owner → "You have a new invoice #[X] for $[amount] due [date]." [REVIEW: SECURITY] Must be Operator Admin only at the API level. [REVIEW: BUSINESS LOGIC] For Plan A (Subscription), invoice is sent monthly or per-claim. For Plan B (Wallet), fee is auto-deducted — invoice may still be sent as a receipt. Currency (CAD/USD) selection must be preserved.

---

### Create Invoice → Save Draft
- **Trigger:** Button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### Create Invoice → Preview
- **Trigger:** Button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### Create Invoice → Cancel
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'billing'`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: Billing & Invoices
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only (page-level)
- **Current state:** FUNCTIONAL (navigation)

---

## PAGE 21: Revenue Reports

### Revenue Reports → Page Load (data display)
- **Trigger:** `activePage === 'revenue'` becoming active
- **What happens:** Displays hardcoded stat cards and chart placeholder elements
- **API call:** NONE — data is HARDCODED
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin ONLY (per RBAC — Operator Staff cannot access billing/revenue)
  - Page: Revenue Reports
  - Section: Stat cards (Total Revenue, Avg per Claim, Claims Processed, Active Dealers); charts (placeholder)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None (display only)
- **Role restrictions:** Operator Admin only per RBAC. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** HARDCODED

---

### Revenue Reports → Filter (date range)
- **Trigger:** Date range picker change
- **What happens:** Client-side filter on hardcoded data
- **API call:** NONE (filter on hardcoded data)
- **Data created/modified:** None
- **Where it lands:** Revenue Reports page — filtered display
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only
- **Current state:** HARDCODED

---

### Revenue Reports → Filter (dealer dropdown)
- **Trigger:** Dropdown change
- **What happens:** Client-side filter on hardcoded data
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Revenue Reports page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only
- **Current state:** HARDCODED

---

### Revenue Reports → Filter (claim type)
- **Trigger:** Dropdown change
- **What happens:** Client-side filter on hardcoded data
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Revenue Reports page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only
- **Current state:** HARDCODED

---

### Revenue Reports → Export CSV
- **Trigger:** Button click
- **What happens:** Empty handler — no file generated
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Should be Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### Revenue Reports → Export PDF
- **Trigger:** Button click
- **What happens:** Empty handler — no file generated
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Should be Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)

---

## PAGE 22: Notifications

### Notifications → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'notifications'`
- **What happens:** Fetches all notifications for the logged-in operator user
- **API call:** `GET /api/notifications` → `opNotifications`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Notifications
  - Section: Notifications table (Type, Message, Linked Entity, Date, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL

---

### Notifications → Mark Read (per row)
- **Trigger:** Row action button click
- **What happens:** Calls `handleMarkNotificationRead(id)` — sends PUT request to mark the notification as read, then refreshes `opNotifications`
- **API call:** `PUT /api/notifications/:id/read` → then refresh `opNotifications`
- **Data created/modified:** `notifications.read` (or equivalent read status field) set to `true` for the notification record
- **Where it lands:**
  - Portal: Operator Portal only
  - Role: Operator Admin, Operator Staff (the user who marked it)
  - Page: Notifications
  - Section: Notification row — unread indicator removed/updated
- **Notifications triggered:** None (this action dismisses a notification)
- **Status changes:** `notifications` record: `read_status` → `true`
- **KPI impact:** Unread notification badge count in sidebar decrements
- **Role restrictions:** Both roles can mark their own notifications read. **[REVIEW: SECURITY]** API should enforce that a user can only mark their own notifications read, not another operator's.
- **Current state:** FUNCTIONAL

---

### Notifications → Mark All Read
- **Trigger:** Button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW] When implemented: `PUT /api/notifications/read-all` or batch update. Should only mark notifications belonging to the current user.

---

## PAGE 23: Users & Roles

> **Note:** Duplicate `page-users` div exists in source at lines 1031-1053 and 1056-1078. Likely a copy-paste artifact. One div is likely dead code.

### Users & Roles → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'users'`
- **What happens:** Fetches all operator users
- **API call:** `GET /api/users` → `opUsers`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin ONLY (per RBAC — Operator Staff cannot access user management)
  - Page: Users & Roles
  - Section: Users table (Name, Email, Role, Status, Last Login, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only per RBAC. **[SECURITY: UI-only restriction — needs API enforcement]** The sidebar item, the page itself, and `GET /api/users` must all enforce Admin restriction.
- **Current state:** FUNCTIONAL (API call fires; role restriction not enforced in UI)

---

### Users & Roles → Invite User
- **Trigger:** Button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Should be Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: `POST /api/users` or `POST /api/invite`. New operator user receives email invitation. New user appears in the Users & Roles table after accepting invite. [REVIEW: NOTIFICATION] Invited user → email with invite link. [REVIEW: BUSINESS LOGIC] Invited user role (admin vs staff) must be set during invite. Only Operator Admin can create other Operator Admin accounts (per RBAC intent).

---

### Users & Roles → Edit Role (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Should be Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: SECURITY] Changing a user from Staff to Admin is a privilege escalation. Must be Operator Admin only and should be audited in `audit_log`.

---

### Users & Roles → Deactivate (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Should be Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: SECURITY] Deactivating a user should immediately invalidate their active sessions/tokens. Must be Operator Admin only.

---

## PAGE 24: Products & Services

### Products & Services → Page Load (data fetch)
- **Trigger:** `useEffect` on `activePage === 'products'`
- **What happens:** Fetches all products/services
- **API call:** `GET /api/products` → `opProducts`
- **Data created/modified:** None (read-only)
- **Where it lands:**
  - Portal: Operator Portal
  - Role: Operator Admin, Operator Staff
  - Page: Products & Services
  - Section: Products table (Name, Category, Price, Billing, Status, Dealers Using, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can view. Modification actions should be Admin-only.
- **Current state:** FUNCTIONAL

---

### Products & Services → Add Product/Service
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'add-product'`
- **API call:** NONE (navigation)
- **Data created/modified:** None at this step
- **Where it lands:**
  - Portal: Operator Portal
  - Page: add-product (sub-page with form)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can navigate. **[SECURITY: UI-only restriction — needs API enforcement]** if only Admin should create products.
- **Current state:** FUNCTIONAL (navigation)

---

### Products & Services → Add Product Form → Save
- **Trigger:** Form submit on add-product sub-page
- **What happens:** Empty handler — no product saved
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: `POST /api/products` with `{name, category, price, pricing_type, billing_frequency, tax, description, status}`. New product becomes available in the Create Invoice service dropdown. [REVIEW: ROUTING] Dealer Portal → if products are surfaced in any dealer-facing page, they update automatically.

---

### Products & Services → Edit (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `activePage` to `'edit-product'` with pre-filled form (the existing product data populates the form fields)
- **API call:** NONE at this step (navigation + state pre-fill)
- **Data created/modified:** None at this step
- **Where it lands:**
  - Portal: Operator Portal
  - Page: edit-product (sub-page)
  - Section: Pre-filled form (Name, Category, Price, Pricing Type, Billing Frequency, Tax, Description, Status, Dealers Currently Using [readonly])
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can navigate. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** FUNCTIONAL (navigation + pre-fill)

---

### Products & Services → Edit Product Form → Save
- **Trigger:** Form submit on edit-product sub-page
- **What happens:** Empty handler — no product updated
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: `PUT /api/products/:id`. Price changes affect active subscriptions and future invoices. [REVIEW: BUSINESS LOGIC] Changing price for a product with active dealer subscriptions requires a migration/grandfathering strategy.

---

### Products & Services → Deactivate (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — no operation performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Should be Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)

---

## PAGE 25: Settings

> Settings has 7 sub-pages managed by `settingsTab` state. All save actions are NOT FUNCTIONAL. All are Operator Admin only per RBAC (platform configuration access).

### Settings → Sub-page Switch (7 sub-pages)
- **Trigger:** Sub-page navigation click
- **What happens:** Updates `settingsTab` state — toggles CSS display for selected sub-page content
- **API call:** NONE (client-side state toggle)
- **Data created/modified:** None
- **Where it lands:** Operator Portal → Settings → selected sub-page panel
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only. **[SECURITY: UI-only restriction — needs API enforcement]** for all Settings saves.
- **Current state:** FUNCTIONAL (navigation)

---

### Settings → My Profile → Profile Photo Upload
- **Trigger:** File input change
- **What happens:** Uses `FileReader` to generate a client-side preview of the selected image. No server upload.
- **API call:** NONE (FileReader only — NOT server upload)
- **Data created/modified:** None (no persistence)
- **Where it lands:** Settings → My Profile → avatar preview only (local)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Operator Admin only (page-level)
- **Accepted types:** Image files (FileReader; no specific type restriction documented)
- **Current state:** NOT FUNCTIONAL (FileReader only — client-side preview, NOT server upload)
- **[REVIEW]:** [REVIEW] When implemented: should upload to storage, update `operator_users.profile_photo_url`. Should also update sidebar avatar per CLAUDE.md verification checklist.

---

### Settings → My Profile → Save Changes
- **Trigger:** Button click
- **What happens:** Empty handler — no profile data saved
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Operator Admin only when implemented.
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### Settings → My Profile → Change Password
- **Trigger:** Button click
- **What happens:** Empty handler — no password change initiated
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: SECURITY] When implemented: must require current password verification before allowing change. Should invalidate all other active sessions on password change.

---

### Settings → General → Save
- **Trigger:** Button click
- **What happens:** Empty handler — platform settings not saved (Platform Name, Support Email, Support Phone, Default Language, Currency, Timezone, Stale Claim Threshold, Platform URL)
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: Stale Claim Threshold setting directly affects `GET /api/claims?stale=true` — the server-side staleness calculation depends on this value. Default Language setting should propagate to new dealer and customer portal sessions.

---

### Settings → Claim Fee Defaults → Save
- **Trigger:** Button click
- **What happens:** Empty handler — fee defaults not saved (Default Fee Type, Rate %, Min Fee, Max Fee Cap, DAF Fee, PDI Fee, Bill trigger)
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: BUSINESS LOGIC] Fee defaults directly feed the billing engine. Bill-on-approval vs bill-on-close determines when invoices are generated. This is a critical missing piece for the billing flow.

---

### Settings → Billing Configuration → Save
- **Trigger:** Button click
- **What happens:** Empty handler — billing config not saved (Tax Name, Tax Rate %, Stripe keys, Invoice Due Days, etc.)
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: SECURITY] Stripe Secret Key stored in a form field is a significant security risk. Must never be stored client-side or transmitted in plaintext. Should use environment variables only, not database storage via this form.

---

### Settings → Notifications → Save
- **Trigger:** Button click
- **What happens:** Empty handler — notification preferences not saved (operator toggles, dealer defaults, email config)
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: ROUTING] When implemented: Dealer Default Notification toggles determine what notifications dealers receive platform-wide (claim status update, invoice sent, parts order update, ticket reply). These settings should be overridable per-dealer.

---

### Settings → Integrations → Configure (per integration)
- **Trigger:** Button click per integration card
- **What happens:** Empty handler — no configuration modal/page opens
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### Settings → Security → Save
- **Trigger:** Button click
- **What happens:** Empty handler — security settings not saved (2FA requirements, session timeout, password policy, IP allowlist, audit logging)
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional. Operator Admin only.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** [REVIEW: SECURITY] These settings govern the entire platform's security posture. When implemented, changes must be audited in `audit_log` and applied server-side immediately — not just stored as preferences.

---

### Settings → Security → Reset
- **Trigger:** Button click
- **What happens:** Empty handler — no reset performed
- **API call:** NONE (empty handler)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional
- **Current state:** NOT FUNCTIONAL (empty handler)

---

## PAGE 26: Changelog

### Changelog → Tab Switch (4 tabs)
- **Trigger:** Tab click
- **What happens:** Updates `clTab` state — toggles display between Current Release, Past Updates, Upcoming, Feature Requests tabs
- **API call:** NONE (client-side toggle; all data is hardcoded)
- **Data created/modified:** None
- **Where it lands:** Operator Portal → Changelog → selected tab content
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL

---

### Changelog → Feature Requests Tab → + Add Request
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'add-feature-req'`
- **API call:** NONE (navigation)
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: Add Feature Request form
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)

---

## PAGE 27: Add Feature Request

### Add Feature Request → Submit Request
- **Trigger:** Button click / form submit
- **What happens:** Navigates back to `'changelog'` — NO API call, no data saved. Form data is discarded.
- **API call:** NONE — NOT FUNCTIONAL, no API call wired
- **Data created/modified:** None (not persisted)
- **Where it lands:** Operator Portal → Changelog → Feature Requests tab (data does NOT update since it is hardcoded)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A — not functional for any role
- **Current state:** NOT FUNCTIONAL (navigates to changelog, no data saved)
- **[REVIEW]:** [REVIEW] The "Requested By" dropdown is hardcoded with 3 dealer names (Smith's RV Centre, Atlantic RV, Prairie Wind RV) + "Internal". When implemented, this should pull from `opDealers`.

---

### Add Feature Request → Cancel
- **Trigger:** Button click
- **What happens:** Sets `activePage` to `'changelog'`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Operator Portal
  - Page: Changelog
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles
- **Current state:** FUNCTIONAL (navigation)

---

## PAGE 28: Network Marketplace (delegated)

### Network Marketplace → Page Load
- **Trigger:** `activePage === 'marketplace'` becoming active
- **What happens:** Delegated to `OperatorMarketplacePages` component
- **API call:** Unspecified — delegated component
- **Data created/modified:** Unspecified — delegated
- **Where it lands:** Operator Portal → Marketplace section
- **Notifications triggered:** Unspecified
- **Status changes:** Unspecified
- **KPI impact:** Unspecified
- **Role restrictions:** Both roles
- **Current state:** UNVERIFIED — delegated to separate component not covered in inventory
- **[REVIEW]:** [REVIEW] `OperatorMarketplacePages` component is not inventoried. All actions within it are outside scope of this spec.

---

## PAGE 29: Live Auctions (delegated)

### Live Auctions → Page Load
- **Trigger:** `activePage === 'public-auctions'` becoming active
- **What happens:** Delegated to `OperatorPublicAuctionPages` component
- **API call:** Unspecified — delegated component
- **Data created/modified:** Unspecified — delegated
- **Where it lands:** Operator Portal → Auctions section
- **Notifications triggered:** Unspecified
- **Status changes:** Unspecified
- **KPI impact:** Unspecified
- **Role restrictions:** Both roles
- **Current state:** UNVERIFIED — delegated to separate component not covered in inventory
- **[REVIEW]:** [REVIEW] `OperatorPublicAuctionPages` component is not inventoried. All actions within it are outside scope of this spec.

---

## CROSS-PORTAL FLOW REFERENCE

This section summarises the cross-portal data flows that will apply once currently NOT FUNCTIONAL actions are implemented.

| Operator Action | Dealer Portal Impact | Customer Portal Impact |
|---|---|---|
| Approve dealership | Dealer Owner gains full portal access | N/A |
| Create unit | Appears in Dealer → My Units table | N/A |
| Approve claim line | Claim Detail → Lines table: status → Approved; Dashboard pending count decrements | Claim Detail → progress timeline updates |
| Deny claim line | Claim Detail → Lines table: status → Denied | Claim Detail → progress timeline updates |
| Submit to Manufacturer | Claim Detail → Timeline: new step logged; claim status updates | Claim Detail → status indicator updates |
| Log Manufacturer Response | Claim Detail → Claim Info: Mfr Claim #, Preauth # fields populated | Claim Detail → status indicator |
| Flag Photo | Claim Detail → Photos section: flag shown; dealer prompted to re-upload | N/A (operator-side flag) |
| Send Invoice | Dealer Owner: Invoices & Billing → new invoice row (status: outstanding); Dashboard balance changes | N/A |
| Mark Invoice Paid | Dealer Owner: Invoices & Billing → row status → Paid; wallet balance updates (Plan B) | N/A |
| Suspend Dealer | Dealer Portal: login blocked; all pages inaccessible | Customer Portal: access blocked if scoped to that dealer |
| Invite Operator User | New user appears in Users & Roles table | N/A |
| Approve claim line → billing engine | Dealer Owner: invoice auto-generated (billing engine) | N/A |
| Parts order status change | Dealer: Claim Detail → Parts section status updates | N/A |

---

## SUMMARY TABLE — OPERATOR PORTAL

| Category | Count |
|---|---|
| Total actions documented | 91 |
| FUNCTIONAL | 24 |
| NOT FUNCTIONAL (empty handler / no API) | 41 |
| HARDCODED (static data, no API) | 8 |
| UNVERIFIED ENDPOINT (call present, path inferred) | 5 |
| FileReader-only uploads (NOT server uploads) | 3 |
| Navigation-only actions (showPage) | 10 |
| [REVIEW] items | 42 |
| Cross-portal flows identified | 13 |
| Pages with Admin-only restrictions (RBAC gap) | 6 |
| Delegated pages (outside inventory scope) | 2 |
---

# DATA ROUTING SPEC — DEALER PORTAL
_Generated from PORTAL-UI-INVENTORY.json_

**Accessible by:** Dealer Owner (full), Dealer Staff (restricted — noted per action)

---

## Architecture Notes

- **File:** `client/src/portals/DealerPortal.tsx` (874 lines)
- **Route:** `/dealer`
- **Navigation model:** Single `useState(activePage)` toggling CSS `display:block/none` — NOT React Router
- **Role check:** `isDealerOwner = !user || user.role === 'dealer_owner'` — defaults to `true` in prototype (no auth = owner access)
- **Owner-only enforcement:** `showPage()` redirects staff to `dashboard` if target is `invoices`, `staff`, `add-staff`, or `branding`
- **Multi-tenant isolation:** All API calls should be scoped to the authenticated dealer's `dealer_id`. Endpoints marked `?dealerId=me` are unverified — actual server-side scoping depends on JWT/session context.
- **Delegated components:** `DealerMarketplacePages` (Financing, F&I, Warranty Plans, Parts Orders), `DealerShowcasePages` (Showcase/Marketplace) — these components are not fully inventoried here; actions within them are not documented below.
- **WebSocket subscriptions:** `claim:updated` → refresh `dlrClaims`; `ticket:message` → refresh `dlrTickets`
- **All file uploads:** Use `FileReader` for client-side preview only — NO server upload exists in current build.
- **All API calls:** Use `apiFetch()` wrapper from `@/lib/api` — not raw `fetch`.

---

## Owner-Only Pages

| Page ID | Page Title | Staff Behavior |
|---------|-----------|----------------|
| `invoices` | Invoices & Billing | Redirected to dashboard |
| `staff` | Staff Management | Redirected to dashboard |
| `add-staff` | Add Staff | Redirected to dashboard |
| `branding` | Branding & Domain | Redirected to dashboard |

**[REVIEW: SECURITY]** Owner-only restriction is enforced inside `showPage()` on the client. The sidebar items are also conditionally hidden with `{isDealerOwner && ...}`. However, if the API endpoints for these pages are not separately protected server-side, a dealer_staff user with a manipulated token could call them directly. **[SECURITY: UI-only restriction — needs API enforcement]** for all owner-only pages.

---

## State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `activePage` | string | Current page ID |
| `isDealerOwner` | boolean | Role check — true = dealer_owner (defaults true in prototype) |
| `dlrClaims` | array | Claims for this dealer |
| `dlrUnits` | array | Units for this dealer |
| `dlrInvoices` | array | Invoices for this dealer |
| `dlrStaff` | array | Staff for this dealer |
| `dlrTickets` | array | Tickets for this dealer |
| `dlrNotifications` | array | Notifications |
| `dlrPartsOrders` | array | Parts orders |
| `addUnitForm` | object | `{vin, make, model, year, type}` |
| `inviteCustomerForm` | object | `{email, firstName, lastName}` |
| `unitTab` | string | Active tab in unit-detail (4 tabs) |
| `dSettingsTab` | string | Active sub-page in settings (5 sub-pages) |
| `dclTab` | string | Active tab in What's New (4 tabs) |
| `brandColor` | string | Hex color for primary brand |
| `accentColor` | string | Hex color for accent |
| `selectedUnitId` | string\|null | Selected unit for detail view |
| `selectedClaimId` | string\|null | Selected claim for detail view |
| `selectedTicketId` | string\|null | Selected ticket for detail view |

---

## Sidebar Navigation

### Overview
- **Dashboard** → `dashboard`

### Claims
- **Upload Photos / Push to Claim** → `upload`
- **My Claims** → `my-claims`
- **My Units** → `my-units`

### Services (delegated to DealerMarketplacePages)
- **Financing** → `d-financing`
- **F&I Products** → `d-fi`
- **Warranty Plans** → `d-warranty`
- **Parts Orders** → `d-parts`

### Customers
- **Customer Portal Management** → `customer-mgmt`
- **Customer Tickets** → `customer-tickets`
- **Invite Customer** → `invite-customer`

### Administration (owner only — hidden from staff)
- **Invoices & Billing** → `invoices`
- **Staff** → `staff`
- **Branding & Domain** → `branding`

### Other
- **What's New** → `whats-new`
- **Settings** → `d-settings`
- **Notifications** → `notifications` (in sidebar, confirmed in source)

---

## Pages — Complete Action Inventory

---

### PAGE: dashboard — Dashboard

#### Dashboard → Page load (API fetch)
- **Trigger:** `useEffect` on `activePage === 'dashboard'`
- **What happens:** Fetches dealer's claims and units to populate stat cards and recent claims table
- **API call:** GET `/api/claims?dealerId=me` — ENDPOINT UNVERIFIED; GET `/api/units?dealerId=me` — ENDPOINT UNVERIFIED
- **Data created/modified:** Populates `dlrClaims`, `dlrUnits` in component state
- **Where it lands:**
  - Portal: Dealer Portal only (read operation)
  - Role: dealer_owner, dealer_staff
  - Page: dashboard
  - Section: Stat cards (Active Claims, Pending Approval, Units on File, Open Tickets), Recent Claims table (Claim #, Unit/VIN, Type, Status, Submitted — first 5 rows)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** Feeds dashboard stat cards: Active Claims count, Pending Approval count, Units on File count, Open Tickets count
- **Role restrictions:** Both dealer_owner and dealer_staff can view. No restriction.
- **Current state:** UNVERIFIED ENDPOINT (endpoint path `?dealerId=me` is inferred — actual scoping depends on server JWT context)
- **[REVIEW: ROUTING]** The `?dealerId=me` pattern is unverified. Server must resolve `me` to the authenticated dealer's ID from the JWT. If the server simply uses the query param without JWT validation, any dealer could query another dealer's data.

---

#### Dashboard → New Claim button
- **Trigger:** Button click
- **What happens:** Navigates to `upload` page (Upload Photos / Push to Claim)
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:**
  - Portal: N/A — client-side navigation
  - Role: dealer_owner, dealer_staff
  - Page: upload
  - Section: N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can navigate.
- **Current state:** FUNCTIONAL (navigation only)

---

#### Dashboard → Add Unit button
- **Trigger:** Button click
- **What happens:** Navigates to `add-unit` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:**
  - Portal: N/A — client-side navigation
  - Role: dealer_owner, dealer_staff
  - Page: add-unit
  - Section: N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can navigate.
- **Current state:** FUNCTIONAL (navigation only)

---

#### Dashboard → View All Claims button
- **Trigger:** Button click
- **What happens:** Navigates to `my-claims` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:**
  - Portal: N/A — client-side navigation
  - Role: dealer_owner, dealer_staff
  - Page: my-claims
  - Section: N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can navigate.
- **Current state:** FUNCTIONAL (navigation only)

---

### PAGE: upload — Upload Photos / Push to Claim

#### Upload → Page load
- **Trigger:** `activePage === 'upload'`
- **What happens:** Renders upload form. Unit selector populates from `dlrUnits` (already in state). No API call on page load for this page specifically.
- **API call:** NONE on page load (relies on `dlrUnits` already fetched)
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can view and use this page.
- **Current state:** FUNCTIONAL (page renders; actions within are NOT FUNCTIONAL)
- **[REVIEW]** If `dlrUnits` is empty (e.g., user navigated directly without hitting dashboard first), the unit selector will be empty. No fallback fetch on this page.

---

#### Upload → Select Unit (dropdown)
- **Trigger:** User selects a unit from the dropdown
- **What happens:** Sets selected unit in form state. Populates from `dlrUnits` array.
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (dropdown population from `dlrUnits` state)

---

#### Upload → Select Claim Type (dropdown)
- **Trigger:** User selects claim type
- **What happens:** Sets claim type in form state. Options: DAF, PDI, Warranty, Extended Warranty, Insurance.
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (form field only)

---

#### Upload → File upload zone (drag-and-drop / file picker)
- **Trigger:** File drag-and-drop or file picker selection
- **What happens:** `FileReader` reads selected files and renders client-side previews in the upload zone. Accepts multi-file. No server upload occurs.
- **API call:** NONE — FileReader client-side only
- **Data created/modified:** Nothing persisted. Client-side preview only.
- **Where it lands:**
  - Portal: NOWHERE — not persisted
  - Role: N/A
  - Page: N/A
  - Section: N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** NOT FUNCTIONAL for storage. FileReader preview works visually but no data reaches any server or database.
- **[REVIEW: ROUTING]** Accepted file types not explicitly documented in inventory — assumed standard image types (JPEG, PNG, HEIC) based on platform context. When implemented, photos must attach per claim line (`line_photos` table), not per claim. Each photo needs `claim_id`, `line_id`, `photo_type` (damage/context/repair/invoice), `ai_quality_score`.

---

#### Upload → Description / Notes (textarea)
- **Trigger:** User types in textarea
- **What happens:** Updates local form state with description/notes text.
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (form field only — not submitted anywhere)

---

#### Upload → Push to Claim button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs. Intended to create a claim record and attach photos.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing — no records created or modified.
- **Where it lands:**
  - Portal: INTENDED — Operator Portal, Processing Queue (`queue` page), filtered by `status=pending_review`
  - Role: operator_admin, operator_staff
  - Page: queue
  - Section: Queue table — columns: Claim #, Dealer, Unit/VIN, Type, Items, Photos, Submitted, Actions
- **Notifications triggered:** [TODO: Notification not wired] — Intended: Operator Admin/Staff → "New claim submitted by [Dealer Name]" → Operator Notifications page + Processing Queue badge
- **Status changes:** Intended: new `claims` record created with `status=pending_review`; `claim_lines` records created per uploaded item; `line_photos` records created per photo
- **KPI impact:** Intended: increments Active Claims stat card on both Dealer and Operator dashboards; increments Pending Approval count on Operator dashboard
- **Role restrictions:** Both roles can use this page. No restriction on submitting.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW: BUSINESS LOGIC]** When implemented: this action should create `claims` record, `claim_lines` records, and `line_photos` records. The claim enters the Operator Processing Queue at `status=submitted` or `status=pending_review`. The Operator then reviews and may re-submit to the manufacturer portal. The dealer does NOT submit directly to the manufacturer.
- **[REVIEW: ROUTING]** On implementation, the WebSocket event `claim:updated` should fire → refreshes `dlrClaims` on Dealer Portal and `opClaims` on Operator Portal.

---

#### Upload → Save Draft button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs. Intended to save a partial upload as a draft.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:** N/A — not wired
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW: BUSINESS LOGIC]** Draft claims would need a `status=draft` value in the `claims` table and should not appear in the Operator Processing Queue until explicitly pushed.

---

### PAGE: my-claims — My Claims

#### My Claims → Page load (API fetch)
- **Trigger:** `useEffect` on `activePage === 'my-claims'`
- **What happens:** Fetches all claims for this dealer
- **API call:** GET `/api/claims` → `dlrClaims`
- **Data created/modified:** Populates `dlrClaims` state
- **Where it lands:**
  - Portal: Dealer Portal only (read operation)
  - Role: dealer_owner, dealer_staff
  - Page: my-claims
  - Section: Claims table — columns: Claim #, Unit/VIN, Type, Status, Items, Submitted, Actions
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles. Multi-tenant isolation must be enforced server-side — this endpoint must return only claims where `claims.dealer_id = authenticated_dealer_id`.
- **Current state:** FUNCTIONAL
- **[REVIEW: SECURITY]** The endpoint `GET /api/claims` with no query param relies entirely on server-side JWT scoping to restrict results to the authenticated dealer. If the backend returns all claims without filtering by dealer, this is a critical data leak across tenants. **[SECURITY: Multi-tenant isolation must be enforced server-side]**

---

#### My Claims → Status filter (dropdown)
- **Trigger:** User selects a status filter
- **What happens:** Filters the `dlrClaims` array client-side (or re-fetches with param — not confirmed)
- **API call:** NONE confirmed (client-side filter on existing `dlrClaims` array assumed)
- **Data created/modified:** None — display filter only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** UNVERIFIED ENDPOINT (filtering behavior — client-side vs server-side — not confirmed in inventory)
- **[REVIEW]** If filters re-fetch from the server with query params, endpoints are unverified. If client-side only, performance degrades with large datasets.

---

#### My Claims → Claim Type filter (dropdown)
- **Trigger:** User selects a claim type filter
- **What happens:** Filters displayed claims by type (DAF, PDI, Warranty, Extended Warranty, Insurance)
- **API call:** NONE confirmed
- **Data created/modified:** None — display filter only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** UNVERIFIED ENDPOINT

---

#### My Claims → Date Range filter
- **Trigger:** User selects date range
- **What happens:** Filters displayed claims by submitted date range
- **API call:** NONE confirmed
- **Data created/modified:** None — display filter only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** UNVERIFIED ENDPOINT

---

#### My Claims → New Claim button
- **Trigger:** Button click
- **What happens:** Navigates to `upload` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only)

---

#### My Claims → View (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `selectedClaimId` to the row's claim ID, then navigates to `claim-detail` page
- **API call:** NONE at click — fetch happens on `claim-detail` page load
- **Data created/modified:** Sets `selectedClaimId` in component state
- **Where it lands:**
  - Portal: Dealer Portal
  - Role: dealer_owner, dealer_staff
  - Page: claim-detail
  - Section: Full claim detail view
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation + state set)

---

### PAGE: claim-detail — Claim Detail

#### Claim Detail → Page load (API fetch)
- **Trigger:** `useEffect` on `activePage === 'claim-detail'` + `selectedClaimId` change
- **What happens:** Fetches full detail for the selected claim
- **API call:** GET `/api/claims/:selectedClaimId` — ENDPOINT UNVERIFIED
- **Data created/modified:** Populates `selectedClaimDetail` (inferred state variable) in component
- **Where it lands:**
  - Portal: Dealer Portal only (read operation)
  - Role: dealer_owner, dealer_staff
  - Page: claim-detail
  - Section: Claim Info (Claim #, Manufacturer Claim #, Preauth #, Type, Status, Submitted date), Claim Lines table (FRC Code, Description, Status, Labor Hrs, Notes), Photos (per-line display), Timeline (visual progress steps)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles. Server must verify the claim belongs to the authenticated dealer.
- **Current state:** UNVERIFIED ENDPOINT
- **[REVIEW: SECURITY]** Server must confirm `claims.dealer_id = authenticated_dealer_id` before returning claim detail. Without this, any dealer could view any claim by guessing an ID. **[SECURITY: Multi-tenant isolation must be enforced server-side]**

---

#### Claim Detail → Back button
- **Trigger:** Button click
- **What happens:** Navigates to `my-claims` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only)

---

#### Claim Detail → Add Photos button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs. Intended to attach additional photos to claim lines.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — would add records to `line_photos` table, visible in Operator Portal → Claim Detail → Photos section
  - Role: N/A (not wired)
  - Page: N/A
  - Section: N/A
- **Notifications triggered:** [TODO: Notification not wired]
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles could use this when implemented.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW: BUSINESS LOGIC]** When implemented, adding photos to an existing claim that has already been submitted to the operator should trigger a notification to operator staff. Photos must be associated with specific `claim_line` records, not just the claim.

---

#### Claim Detail → Contact Operator button
- **Trigger:** Button click
- **What happens:** Navigates to `customer-tickets` page, or triggers a new ticket flow. Navigation behavior — no ticket pre-created.
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Dealer Portal
  - Role: dealer_owner, dealer_staff
  - Page: customer-tickets
  - Section: Ticket list
- **Notifications triggered:** None at button click — a ticket would be created once the user submits the new ticket form
- **Status changes:** None at button click
- **KPI impact:** None at button click
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only — no ticket creation at this step)
- **[REVIEW: BUSINESS LOGIC]** The destination is ambiguous — the inventory says "showPage('customer-tickets') or new ticket flow". When implemented, this should ideally pre-populate a new ticket form with the `claim_id` context so the ticket is linked to the specific claim.

---

#### Claim Detail → Claim Lines table (read)
- **Trigger:** Page load (data display)
- **What happens:** Displays claim lines: FRC Code, Description, Status, Labor Hrs, Notes. Status per line reflects operator-assigned approval/denial.
- **API call:** Part of the claim detail fetch — GET `/api/claims/:selectedClaimId`
- **Data created/modified:** None (read only)
- **Where it lands:** N/A (display only)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can see claim lines.
- **Current state:** UNVERIFIED ENDPOINT (data display depends on claim detail fetch)
- **[REVIEW: BUSINESS LOGIC]** Dealer can only VIEW claim lines, not edit FRC codes or statuses. FRC code assignment and line approval/denial are Operator-side actions only.

---

#### Claim Detail → Timeline (read)
- **Trigger:** Page load (data display)
- **What happens:** Displays visual progress steps for the claim lifecycle
- **API call:** Part of the claim detail fetch
- **Data created/modified:** None (read only)
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** UNVERIFIED ENDPOINT (depends on claim detail fetch)

---

### PAGE: my-units — My Units

#### My Units → Page load (API fetch)
- **Trigger:** `useEffect` on `activePage === 'my-units'`
- **What happens:** Fetches all units for this dealer
- **API call:** GET `/api/units` → `dlrUnits`
- **Data created/modified:** Populates `dlrUnits` state
- **Where it lands:**
  - Portal: Dealer Portal only (read operation)
  - Role: dealer_owner, dealer_staff
  - Page: my-units
  - Section: Units table — columns: VIN, Year/Make/Model, Type, DAF, PDI, Warranty Exp, Actions
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles. Server must scope to authenticated dealer.
- **Current state:** FUNCTIONAL
- **[REVIEW: SECURITY]** Same multi-tenant concern as claims — `GET /api/units` must be scoped server-side to `units.dealer_id = authenticated_dealer_id`.

---

#### My Units → Add Unit button
- **Trigger:** Button click
- **What happens:** Navigates to `add-unit` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only)

---

#### My Units → View (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `selectedUnitId` to the row's unit ID, then navigates to `unit-detail` page
- **API call:** NONE at click — fetch happens on unit-detail page load
- **Data created/modified:** Sets `selectedUnitId` in component state
- **Where it lands:**
  - Portal: Dealer Portal
  - Role: dealer_owner, dealer_staff
  - Page: unit-detail
  - Section: Full unit detail view (4 tabs)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation + state set)

---

### PAGE: add-unit — Add Unit

#### Add Unit → Page load
- **Trigger:** `activePage === 'add-unit'`
- **What happens:** Renders the add unit form with empty `addUnitForm` state
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can access.
- **Current state:** FUNCTIONAL (form renders)

---

#### Add Unit → Back button
- **Trigger:** Button click
- **What happens:** Navigates to `my-units` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only)

---

#### Add Unit → Form field input (VIN, Make, Model, Year, Unit Type)
- **Trigger:** User types or selects
- **What happens:** Updates `addUnitForm` object in component state: `{vin, make, model, year, type}`. Unit Type options: Travel Trailer, Fifth Wheel, Class A, Class C, Van Camper, Small Trailer, Pop Up, Toy Hauler, Truck Camper, Destination Trailer.
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (controlled form fields)

---

#### Add Unit → Add Unit button (submit)
- **Trigger:** Button click — calls `handleAddUnit()`
- **What happens:** POSTs `addUnitForm` to create a new unit record, then refreshes `dlrUnits` and navigates to `my-units`
- **API call:** POST `/api/units` — body: `{vin, make, model, year, type}` — FUNCTIONAL
- **Data created/modified:** Creates new record in `units` table with `dealer_id` set to authenticated dealer. Fields: VIN, make, model, year, unit type.
- **Where it lands:**
  - Portal: Operator Portal — unit appears in Unit Inventory (`units` page), table columns: VIN, Year/Make/Model, Dealer, Type, DAF, PDI, Claims, Actions. Also visible in Operator's Dealer Detail page under the Units tab.
  - Portal: Dealer Portal — unit appears in `dlrUnits` after refresh; visible in My Units table and in the Upload Photos unit selector dropdown.
  - Role: operator_admin, operator_staff can see unit in Unit Inventory; dealer_owner, dealer_staff can see it in My Units
  - Page: Operator → `units` (Unit Inventory); Dealer → `my-units`
  - Section: Operator → units-table; Dealer → units-table
- **Notifications triggered:** [TODO: Notification not wired] — Intended: Operator → "New unit added by [Dealer Name]: [VIN]" → Operator Notifications page
- **Status changes:** New unit record created with default `daf_status=null`, `pdi_status=null`
- **KPI impact:** Increments Units on File stat card on Dealer dashboard; increments unit count in Operator's Dealer Detail
- **Role restrictions:** Both dealer_owner and dealer_staff can add units. No restriction.
- **Current state:** FUNCTIONAL
- **[REVIEW: SECURITY]** The POST request must associate the new unit with the authenticated dealer's `dealer_id` server-side. If the body can include an arbitrary `dealer_id`, a staff user could create units under a different dealership. **[SECURITY: dealer_id must be set from JWT server-side, not from request body]**
- **[REVIEW: BUSINESS LOGIC]** VIN should be validated (17-character format) and checked for duplicates within the dealer's inventory. No validation is documented in the inventory.

---

#### Add Unit → Cancel button
- **Trigger:** Button click
- **What happens:** Navigates to `my-units` page without saving
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only)

---

### PAGE: unit-detail — Unit Detail

#### Unit Detail → Page load (API fetch)
- **Trigger:** `useEffect` on `activePage === 'unit-detail'` + `selectedUnitId` change
- **What happens:** Fetches full detail for the selected unit
- **API call:** GET `/api/units/:selectedUnitId` — ENDPOINT UNVERIFIED
- **Data created/modified:** Populates unit detail in component state
- **Where it lands:**
  - Portal: Dealer Portal only (read operation)
  - Role: dealer_owner, dealer_staff
  - Page: unit-detail
  - Section: All 4 tabs populated with unit data
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles. Server must confirm unit belongs to authenticated dealer.
- **Current state:** UNVERIFIED ENDPOINT
- **[REVIEW: SECURITY]** Server must verify `units.dealer_id = authenticated_dealer_id`. **[SECURITY: Multi-tenant isolation must be enforced server-side]**

---

#### Unit Detail → Back button
- **Trigger:** Button click
- **What happens:** Navigates to `my-units` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only)

---

#### Unit Detail → Tab switch (Info / Documents / Pictures / Claims)
- **Trigger:** Tab click — sets `unitTab` state
- **What happens:** Switches active tab display using CSS `display` toggling. Tab IDs: `ut-info`, `ut-documents`, `ut-pictures`, `ut-claims`
- **API call:** NONE — tabs switch via state, data already loaded on page load
- **Data created/modified:** Sets `unitTab` state variable
- **Where it lands:** N/A — client-side display only
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (tab switching)

---

#### Unit Detail → Info tab (read)
- **Trigger:** Tab: `ut-info` active
- **What happens:** Displays VIN, make, model, year, unit type, warranty dates
- **API call:** Part of unit detail fetch
- **Data created/modified:** None (read only)
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** UNVERIFIED ENDPOINT (display depends on unit detail fetch)

---

#### Unit Detail → Documents tab (read)
- **Trigger:** Tab: `ut-documents` active
- **What happens:** Displays list of uploaded documents with download links
- **API call:** Part of unit detail fetch (or separate — not confirmed)
- **Data created/modified:** None (read only)
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** UNVERIFIED ENDPOINT
- **[REVIEW]** No document upload action is documented for the dealer-side unit-detail. Documents may be uploaded by the Operator. Download links would require signed URLs from Cloudflare R2 / S3.

---

#### Unit Detail → Pictures tab → Upload unit photo
- **Trigger:** File input on `ut-pictures` tab — calls `updateUnitPhoto()`
- **What happens:** `FileReader` reads the selected image file and updates the unit photo display in the DOM. No server upload occurs. Client-side preview only.
- **API call:** NONE — FileReader DOM manipulation only
- **Data created/modified:** Nothing persisted. Client-side DOM update only.
- **Where it lands:**
  - Portal: NOWHERE — not persisted to server
  - Role: N/A
  - Page: N/A
  - Section: N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles (no restriction documented, but owner-only would be reasonable for branding purposes)
- **Current state:** NOT FUNCTIONAL for storage (FileReader preview works visually)
- **[REVIEW: ROUTING]** When implemented, the unit display photo should be uploaded to Cloudflare R2/S3 under the dealer's scoped folder, and the `units.display_photo_url` field updated via a PATCH or PUT API call. The updated photo should also appear in: Operator Portal → Unit Detail → Pictures tab; Customer Portal → My Unit page (unit photo).

---

#### Unit Detail → Claims tab (read)
- **Trigger:** Tab: `ut-claims` active
- **What happens:** Displays claims associated with this unit
- **API call:** Part of unit detail fetch (or filtered from `dlrClaims` — not confirmed)
- **Data created/modified:** None (read only)
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** UNVERIFIED ENDPOINT

---

### PAGE: customer-mgmt — Customer Portal Management

#### Customer Portal Management → Page load
- **Trigger:** `activePage === 'customer-mgmt'`
- **What happens:** Renders customer list table. Data source noted as "hardcoded or API" — unclear.
- **API call:** NONE confirmed (inventory says "hardcoded or API")
- **Data created/modified:** None
- **Where it lands:**
  - Portal: Dealer Portal only (read operation)
  - Role: dealer_owner, dealer_staff
  - Page: customer-mgmt
  - Section: Customers table — columns: Customer, Email, Unit VIN, Portal Active, Last Login, Actions
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can view.
- **Current state:** HARDCODED (data source uncertain)
- **[REVIEW]** No API call is documented for fetching the customer list. This page's data may be hardcoded in the prototype. When implemented, should call `GET /api/users?dealerId=me&role=client` or equivalent.

---

#### Customer Portal Management → Invite Customer button
- **Trigger:** Button click
- **What happens:** Navigates to `invite-customer` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only)

---

#### Customer Portal Management → View Portal (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — nothing occurs. Intended to open/preview the customer's portal view.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles (when implemented).
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW: ROUTING]** When implemented, this should navigate to the Customer Portal (`/portal`) scoped to the specific customer, likely with an impersonation token or a read-only preview mode.

---

#### Customer Portal Management → Revoke Access (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — nothing occurs. Intended to deactivate a customer's portal access.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — Customer Portal access revoked; customer can no longer log in
  - Role: N/A (not wired)
  - Page: N/A
  - Section: N/A
- **Notifications triggered:** [TODO: Notification not wired] — Intended: Customer → "Your portal access has been revoked. Contact your dealer." (email or in-app)
- **Status changes:** Intended: `dealer_users.status = 'inactive'` or equivalent for the customer record
- **KPI impact:** None
- **Role restrictions:** Intended: dealer_owner only (access management). **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW: BUSINESS LOGIC]** Revoking access should disable login for the customer but preserve their data (claims, tickets, documents). Hard-deleting the account would destroy audit history.

---

### PAGE: customer-tickets — Customer Tickets

#### Customer Tickets → Page load (API fetch)
- **Trigger:** `useEffect` on `activePage === 'customer-tickets'`
- **What happens:** Fetches all tickets for this dealer
- **API call:** GET `/api/tickets` → `dlrTickets`
- **Data created/modified:** Populates `dlrTickets` state
- **Where it lands:**
  - Portal: Dealer Portal only (read operation)
  - Role: dealer_owner, dealer_staff
  - Page: customer-tickets
  - Section: Tickets table — columns: Ticket #, Customer, Category, Subject, Status, Last Reply, Actions
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles. Server must scope to dealer's tickets only.
- **Current state:** FUNCTIONAL
- **[REVIEW: SECURITY]** `GET /api/tickets` must be scoped to `tickets.dealer_id = authenticated_dealer_id`. **[SECURITY: Multi-tenant isolation must be enforced server-side]**

---

#### Customer Tickets → Tab switch (All / Open / Pending / Closed)
- **Trigger:** Tab click
- **What happens:** Filters `dlrTickets` array by status for display. Client-side filtering on existing data.
- **API call:** NONE confirmed (client-side filter assumed)
- **Data created/modified:** None — display filter only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (client-side tab filtering)

---

#### Customer Tickets → View (per row)
- **Trigger:** Row action button click
- **What happens:** Sets `selectedTicketId` to the row's ticket ID, then navigates to `ticket-detail` page
- **API call:** NONE at click
- **Data created/modified:** Sets `selectedTicketId` in component state
- **Where it lands:**
  - Portal: Dealer Portal
  - Role: dealer_owner, dealer_staff
  - Page: ticket-detail
  - Section: Full ticket detail with conversation thread
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation + state set)

---

### PAGE: ticket-detail — Ticket Detail

#### Ticket Detail → Page load (read)
- **Trigger:** `activePage === 'ticket-detail'` (no explicit API call documented — data sourced from `dlrTickets` selected by `selectedTicketId`)
- **What happens:** Displays ticket fields and conversation thread for selected ticket
- **API call:** NONE confirmed for ticket-detail page load (data from `dlrTickets` state). Separate fetch not documented.
- **Data created/modified:** None (read only)
- **Where it lands:**
  - Portal: Dealer Portal only
  - Role: dealer_owner, dealer_staff
  - Page: ticket-detail
  - Section: Header (Ticket #, Category, Status, Customer, Created date), Conversation thread, Reply form
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** UNVERIFIED ENDPOINT (no explicit fetch documented for ticket detail — may use data already in `dlrTickets`)
- **[REVIEW]** No `GET /api/tickets/:id` call is documented for the dealer-side ticket detail page. The conversation thread may be included in the tickets list response, or may require a separate fetch.

---

#### Ticket Detail → Back button
- **Trigger:** Button click
- **What happens:** Navigates to `customer-tickets` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only)

---

#### Ticket Detail → Visibility toggle (Customer visible / Internal note)
- **Trigger:** Toggle switch
- **What happens:** Sets reply visibility mode in local form state. Customer visible = customer can see the reply in their portal. Internal note = dealer/operator only.
- **API call:** NONE (local state toggle)
- **Data created/modified:** Local form state — sets visibility flag on pending reply
- **Where it lands:** N/A — affects the Send Reply action when implemented
- **Notifications triggered:** None at toggle
- **Status changes:** None at toggle
- **KPI impact:** None
- **Role restrictions:** Both roles can toggle (no restriction documented).
- **Current state:** FUNCTIONAL (toggle renders — no persistence without Send Reply working)
- **[REVIEW: BUSINESS LOGIC]** Internal notes should be stored with a `visibility=internal` flag in the `messages` table. Customer-visible replies must appear in Customer Portal → Support Tickets → Ticket Detail and should trigger a notification to the customer.

---

#### Ticket Detail → Reply (textarea)
- **Trigger:** User types in textarea
- **What happens:** Updates local reply form state
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (form field — not submitted anywhere)

---

#### Ticket Detail → Send Reply button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs. Intended to post the reply message to the ticket thread.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — Customer Portal → Support Tickets → Ticket Detail page → conversation thread (if `visibility=customer`)
  - Portal: INTENDED — Operator Portal → (no dedicated ticket page documented, but tickets linked to dealer management)
  - Role: client (customer) would see customer-visible replies; operator_admin/staff may see all replies
  - Page: Customer Portal → `ticket-detail-c`
  - Section: conversation thread
- **Notifications triggered:** [TODO: Notification not wired] — Intended: Customer → "Your dealer replied to ticket #[X]" → Customer Portal Notifications + WebSocket `ticket:message` event → refreshes `dlrTickets` (dealer) and `custTickets` (customer)
- **Status changes:** Intended: ticket `status` may update to `pending_customer` if reply sent to customer; `updated_at` timestamp updated
- **KPI impact:** Intended: decrements Open Tickets count on dealer dashboard if ticket status changes
- **Role restrictions:** Both dealer_owner and dealer_staff can reply. Internal note visibility should be restricted at display level.
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW: ROUTING]** When implemented: POST `/api/tickets/:selectedTicketId/messages` body: `{message, visibility}`. WebSocket event `ticket:message` should fire → refreshes Customer Portal `custTickets` + `chatMessages`. Customer sees reply in `/portal` → `ticket-detail-c` → conversation thread.

---

#### Ticket Detail → Close Ticket button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs. Intended to set ticket status to `closed`.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — removes from Open/Pending tabs in dealer's `customer-tickets` page; moves to Closed tab
  - Portal: INTENDED — Customer Portal → Support Tickets → ticket shows as Closed
  - Role: dealer_owner, dealer_staff (when implemented)
  - Page: Dealer → `customer-tickets` (Closed tab); Customer → `tickets` (Closed status)
  - Section: Tab filter
- **Notifications triggered:** [TODO: Notification not wired] — Intended: Customer → "Your ticket #[X] has been closed."
- **Status changes:** Intended: `tickets.status = 'closed'`; `tickets.closed_at = now()`
- **KPI impact:** Intended: decrements Open Tickets count on dealer dashboard
- **Role restrictions:** Both roles (no restriction documented).
- **Current state:** NOT FUNCTIONAL (empty handler)

---

#### Ticket Detail → Reopen Ticket button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs. Intended to reopen a closed ticket.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — ticket moves back to Open tab
  - Role: dealer_owner, dealer_staff
  - Page: Dealer → `customer-tickets` (Open tab)
  - Section: Tab filter
- **Notifications triggered:** [TODO: Notification not wired]
- **Status changes:** Intended: `tickets.status = 'open'`
- **KPI impact:** None
- **Role restrictions:** Both roles (no restriction documented).
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### PAGE: invite-customer — Invite Customer

#### Invite Customer → Page load
- **Trigger:** `activePage === 'invite-customer'`
- **What happens:** Renders invite form with empty `inviteCustomerForm` state
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can access.
- **Current state:** FUNCTIONAL (form renders)

---

#### Invite Customer → Back button
- **Trigger:** Button click
- **What happens:** Navigates to `customer-mgmt` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only)

---

#### Invite Customer → Form field input (Email, First Name, Last Name)
- **Trigger:** User types in form fields
- **What happens:** Updates `inviteCustomerForm` object: `{email, firstName, lastName}`
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (controlled form fields)

---

#### Invite Customer → Send Invitation button
- **Trigger:** Button click — calls `handleInviteCustomer()`
- **What happens:** POSTs invite data to create a new `client` user and send an invitation email. Navigates to `customer-mgmt` on success.
- **API call:** POST `/api/users/invite` — body: `{email: inviteCustomerForm.email, role: 'client'}` — FUNCTIONAL
- **Data created/modified:** Creates new user record in `dealer_users` table (or a pending invite record) with `role=client`, linked to authenticated dealer's `dealer_id`. Triggers invitation email to the provided email address.
- **Where it lands:**
  - Portal: Customer Portal — invited customer gains access to `/portal`. On first login, customer sees their unit data, claim statuses, and dealer info scoped to this dealership.
  - Portal: Dealer Portal → `customer-mgmt` table — new customer row appears with `Portal Active = true` (or pending) after invite accepted
  - Role: client (new customer user)
  - Page: Customer Portal — full portal accessible (Dashboard, My Unit, Warranty, Claim Status, Support Tickets, etc.)
  - Section: Customer Portal dashboard — unit card, dealer info, active claims
- **Notifications triggered:** External email → Customer inbox: "You've been invited to access your RV Claims portal by [Dealer Name]. Click to create your account." — [REVIEW: NOTIFICATION] Email sending depends on SendGrid/SES integration, which is not confirmed as implemented.
- **Status changes:** New user record created with `status=pending_invite` (or `active` if no email confirmation required)
- **KPI impact:** None (no dashboard KPI tracks customer portal users in current spec)
- **Role restrictions:** Both dealer_owner and dealer_staff can send invites. **[REVIEW: BUSINESS LOGIC]** Consider whether staff should be able to invite customers — this is an access-grant action.
- **Current state:** FUNCTIONAL
- **[REVIEW: ROUTING]** The POST body only includes `{email, role: 'client'}` — First Name and Last Name from `inviteCustomerForm` are captured in state but the documented body only includes email. The server must associate the invite with the authenticated dealer's `dealer_id`. **[REVIEW: SECURITY]** If `dealer_id` is not set from JWT server-side, a dealer could create customer users under a different dealership.
- **[REVIEW: BUSINESS LOGIC]** When the customer accepts the invite and logs in for the first time, their portal shows: unit linked to this dealer's inventory, claim statuses, warranty info, tickets. The `custUnit` in CustomerPortal is set as `(d.units || [])[0]` — only one unit per customer is shown. Multi-unit customers need consideration.

---

#### Invite Customer → Cancel button
- **Trigger:** Button click
- **What happens:** Navigates to `customer-mgmt` page without sending invitation
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (navigation only)

---

### PAGE: invoices — Invoices & Billing (OWNER ONLY)

#### Invoices → Page load (API fetch)
- **Trigger:** `useEffect` on `activePage === 'invoices'`
- **What happens:** Fetches all invoices for this dealer. Owner-only — staff are redirected to dashboard by `showPage()`.
- **API call:** GET `/api/invoices` → `dlrInvoices`
- **Data created/modified:** Populates `dlrInvoices` state
- **Where it lands:**
  - Portal: Dealer Portal only (read operation)
  - Role: dealer_owner ONLY
  - Page: invoices
  - Section: Stat cards (Total Billed, Paid, Outstanding, Overdue), Invoices table (Invoice #, Claim, Amount, Tax, Total, Status, Date, Actions)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** Feeds billing stat cards
- **Role restrictions:** dealer_owner only. dealer_staff redirected to dashboard by `showPage()`. **[SECURITY: UI-only restriction — needs API enforcement]** Server must verify `dealer_users.role = 'dealer_owner'` before returning invoice data.
- **Current state:** FUNCTIONAL (fetch) — actions on this page are NOT FUNCTIONAL

---

#### Invoices → Pay Now (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — nothing occurs. Intended to initiate Stripe payment for the selected invoice.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — Operator Portal → Billing & Invoices page → invoice updates to `status=paid`; Revenue Reports page metrics update
  - Role: operator_admin (sees payment received)
  - Page: Operator → `billing`; Operator → `revenue`
  - Section: Invoices table status column; Revenue MTD stat card
- **Notifications triggered:** [TODO: Notification not wired] — Intended: Operator Admin → "Payment received from [Dealer Name]: $[amount]"; Dealer Owner → "Payment confirmed for Invoice #[X]"
- **Status changes:** Intended: `invoices.status = 'paid'`; `invoices.paid_at = now()`; for wallet plan: `wallet_transactions` deduction record created
- **KPI impact:** Intended: updates Revenue MTD on Operator dashboard; updates Outstanding/Paid amounts on Dealer invoices page
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW: BUSINESS LOGIC]** Payment flow depends on plan type: Plan A (subscription) — Stripe auto-billing; Plan B (wallet) — deduction from wallet balance. Both flows are unimplemented. Interac e-Transfer is the secondary payment method for Canadian dealers — requires manual reconciliation by operator.

---

#### Invoices → View Invoice (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — nothing occurs. Intended to open or download the invoice PDF.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (empty handler)

---

#### Invoices → Top Up Wallet button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs. Intended to initiate a Stripe payment to load the dealer's pre-funded wallet (Plan B).
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — Dealer Portal → `invoices` page → Wallet balance updates; `d-settings` → `ds-subscription` → Wallet balance display updates
  - Portal: INTENDED — Operator Portal → Dealer Detail → Billing tab → wallet balance updates
  - Role: dealer_owner only
  - Page: Dealer → `invoices`; Dealer → `d-settings/ds-subscription`
  - Section: Wallet balance display
- **Notifications triggered:** [TODO: Notification not wired]
- **Status changes:** Intended: `wallet_transactions` record created (type=top-up, amount, balance_after); `dealers.wallet_balance` updated
- **KPI impact:** None (wallet balance is not a dashboard KPI in current spec)
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### PAGE: staff — Staff Management (OWNER ONLY)

#### Staff → Page load (API fetch)
- **Trigger:** `useEffect` on `activePage === 'staff'`
- **What happens:** Fetches staff members for this dealer. Owner-only — staff are redirected to dashboard.
- **API call:** GET `/api/users?dealerId=me` → `dlrStaff` — ENDPOINT UNVERIFIED
- **Data created/modified:** Populates `dlrStaff` state
- **Where it lands:**
  - Portal: Dealer Portal only (read operation)
  - Role: dealer_owner ONLY
  - Page: staff
  - Section: Staff table — columns: Name, Email, Role, Status, Last Login, Actions
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** UNVERIFIED ENDPOINT

---

#### Staff → Add Staff button
- **Trigger:** Button click
- **What happens:** Navigates to `add-staff` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only (page is owner-only).
- **Current state:** FUNCTIONAL (navigation only)

---

#### Staff → Edit Role (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — nothing occurs. Intended to change a staff member's role between `dealer_staff` and `dealer_owner`.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — Dealer Portal → role change affects `isDealerOwner` check for that user on next login; owner-only sidebar items appear/disappear accordingly
  - Role: dealer_owner, dealer_staff (affected user's next session)
  - Page: Dealer Portal sidebar (conditionally rendered items)
  - Section: Administration section visibility
- **Notifications triggered:** [TODO: Notification not wired] — Intended: affected staff member notified of role change
- **Status changes:** Intended: `dealer_users.role` updated
- **KPI impact:** None
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (empty handler)

---

#### Staff → Deactivate (per row)
- **Trigger:** Row action button click
- **What happens:** Empty handler — nothing occurs. Intended to deactivate a staff member's account.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — deactivated user can no longer log in; removed from active staff list
  - Role: dealer_owner (audit trail)
  - Page: Dealer Portal → `staff` table → row status changes to Inactive
  - Section: Staff table Status column
- **Notifications triggered:** [TODO: Notification not wired]
- **Status changes:** Intended: `dealer_users.status = 'inactive'`
- **KPI impact:** None
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### PAGE: add-staff — Add Staff (OWNER ONLY)

#### Add Staff → Page load
- **Trigger:** `activePage === 'add-staff'`
- **What happens:** Renders add staff form. Owner-only — staff are redirected to dashboard.
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** FUNCTIONAL (form renders)

---

#### Add Staff → Back button
- **Trigger:** Button click
- **What happens:** Navigates to `staff` page
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only (page is owner-only).
- **Current state:** FUNCTIONAL (navigation only)

---

#### Add Staff → Form field input (Full Name, Email, Role)
- **Trigger:** User types or selects
- **What happens:** Updates local form state. Role options: Dealer Staff, Dealer Owner.
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only (page is owner-only).
- **Current state:** FUNCTIONAL (controlled form fields — not submitted anywhere)

---

#### Add Staff → Send Invitation button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs. Intended to create a `dealer_staff` or `dealer_owner` user and send an invitation email.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — Dealer Portal → `staff` table → new row appears with `Status=pending_invite`
  - Portal: INTENDED — new staff member receives email invite; on first login, accesses Dealer Portal with assigned role
  - Role: dealer_owner (sees new staff in list); new staff member (gains portal access)
  - Page: Dealer Portal → `staff` table
  - Section: Staff table
- **Notifications triggered:** [TODO: Notification not wired] — Intended: new staff member → invitation email with portal access link; Operator Admin → (optional) new staff member added at dealer
- **Status changes:** Intended: new `dealer_users` record created with `status=pending_invite`, `role=dealer_staff|dealer_owner`, `dealer_id=authenticated_dealer_id`
- **KPI impact:** None
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW: SECURITY]** When implemented, the `dealer_id` must be set from JWT server-side. The invited user's role must be validated — a dealer_owner should not be able to create a user with `role=operator_admin`. **[SECURITY: Role escalation prevention required]**

---

#### Add Staff → Cancel button
- **Trigger:** Button click
- **What happens:** Navigates to `staff` page without sending invitation
- **API call:** NONE — navigation only
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only (page is owner-only).
- **Current state:** FUNCTIONAL (navigation only)

---

### PAGE: branding — Branding & Domain (OWNER ONLY)

#### Branding → Page load
- **Trigger:** `activePage === 'branding'`
- **What happens:** Renders branding form. Owner-only — staff are redirected to dashboard. Current brand settings (color pickers, text fields) populated from `brandColor`, `accentColor` state.
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** FUNCTIONAL (form renders)

---

#### Branding → Logo Upload (file input)
- **Trigger:** File input selection — calls `previewLogo()`
- **What happens:** `FileReader` reads the selected image file and updates the logo preview in the DOM via direct DOM manipulation. No server upload occurs.
- **API call:** NONE — FileReader DOM manipulation only
- **Data created/modified:** Nothing persisted. DOM preview only.
- **Where it lands:**
  - Portal: NOWHERE — not persisted
  - Role: N/A
  - Page: N/A
  - Section: N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only (page is owner-only).
- **Current state:** NOT FUNCTIONAL for storage (DOM preview works visually)
- **[REVIEW: ROUTING]** When implemented: logo should upload to Cloudflare R2/S3 under `dealers/{dealer_id}/logo.{ext}`, and `dealers.logo_url` updated. The logo should then appear in: Customer Portal sidebar header, Customer Portal dashboard dealer info card. If white-labeling is fully implemented, it would also brand the Customer Portal header/favicon.

---

#### Branding → Primary Color picker
- **Trigger:** Color picker interaction
- **What happens:** Updates `brandColor` state with selected hex value. `applyBranding()` uses this to set a CSS custom property on the portal.
- **API call:** NONE
- **Data created/modified:** `brandColor` state (in-memory only)
- **Where it lands:** N/A — client-side CSS variable only
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only.
- **Current state:** FUNCTIONAL (color picker + state update). NOT FUNCTIONAL for persistence.

---

#### Branding → Accent Color picker
- **Trigger:** Color picker interaction
- **What happens:** Updates `accentColor` state with selected hex value.
- **API call:** NONE
- **Data created/modified:** `accentColor` state (in-memory only)
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only.
- **Current state:** FUNCTIONAL (color picker + state update). NOT FUNCTIONAL for persistence.

---

#### Branding → Dealership Name, Welcome Message, Custom Domain, Subdomain (text inputs)
- **Trigger:** User types in text fields
- **What happens:** Updates local form state. These fields are not persisted anywhere in current build.
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only.
- **Current state:** FUNCTIONAL (form fields only — not submitted anywhere)
- **[REVIEW: ROUTING]** Dealership Name when implemented should update `dealers.name`. Welcome Message → stored in `dealers.portal_welcome_message` (new field needed). Custom Domain/CNAME and Subdomain → require DNS provisioning and are outside current infrastructure scope.

---

#### Branding → Save & Apply button
- **Trigger:** Button click — calls `applyBranding()`
- **What happens:** Reads `brandColor` and `accentColor` from state and sets CSS custom properties on the document root (e.g., `document.documentElement.style.setProperty('--primary-color', brandColor)`). Client-side CSS variable manipulation only. No API call, no persistence.
- **API call:** NONE — CSS variable manipulation only
- **Data created/modified:** Nothing persisted. CSS variables reset on page refresh.
- **Where it lands:**
  - Portal: NOWHERE — not persisted
  - Role: N/A
  - Page: N/A
  - Section: N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (client-side CSS only, no persistence)
- **[REVIEW: ROUTING]** When implemented: should PATCH `dealers/{id}` with `{brand_color, accent_color, logo_url, portal_name, welcome_message}`. Customer Portal should read these values and apply them on load.

---

#### Branding → Preview button
- **Trigger:** Button click — calls `previewBranding()`
- **What happens:** Navigates to the `dashboard` page so the dealer can see the CSS variable changes applied. No API call.
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Dealer Portal → `dashboard` page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only.
- **Current state:** NOT FUNCTIONAL for persistence (navigation works; color preview is client-side only)

---

#### Branding → Restore Defaults button
- **Trigger:** Button click — calls `restoreBranding()`
- **What happens:** Resets `brandColor` and `accentColor` state to default values and removes CSS custom properties set by `applyBranding()`. Client-side only.
- **API call:** NONE
- **Data created/modified:** Resets local state + CSS variables only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only.
- **Current state:** NOT FUNCTIONAL for persistence (CSS reset works client-side)

---

### PAGE: notifications — Notifications

#### Notifications → Page load (API fetch)
- **Trigger:** `useEffect` on `activePage === 'notifications'`
- **What happens:** Fetches notifications for this dealer user
- **API call:** GET `/api/notifications` → `dlrNotifications`
- **Data created/modified:** Populates `dlrNotifications` state
- **Where it lands:**
  - Portal: Dealer Portal only (read operation)
  - Role: dealer_owner, dealer_staff
  - Page: notifications
  - Section: Notifications list
- **Notifications triggered:** None (read operation)
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can view notifications.
- **Current state:** FUNCTIONAL (fetch confirmed in source)

---

#### Notifications → Mark as Read (per notification)
- **Trigger:** Click on notification or explicit Mark Read button — calls `handleMarkNotificationRead(id)`
- **What happens:** Marks a specific notification as read
- **API call:** PUT `/api/notifications/:id/read` — FUNCTIONAL
- **Data created/modified:** Updates `notifications.read = true` for the specified notification record
- **Where it lands:**
  - Portal: Dealer Portal — notification read badge count (red "3" badge on sidebar bell icon) decrements
  - Role: dealer_owner, dealer_staff (own notifications only)
  - Page: notifications page + sidebar bell badge
  - Section: Sidebar nav bell badge; notifications list read state
- **Notifications triggered:** None (this IS the notification action)
- **Status changes:** `notifications.read = true`
- **KPI impact:** None
- **Role restrictions:** Both roles. User should only be able to mark their own notifications as read. **[SECURITY: Server must verify notification.recipient_id = authenticated_user_id]**
- **Current state:** FUNCTIONAL

---

### PAGE: whats-new — What's New

#### What's New → Tab switch (What's New / Past Updates / Coming Soon / Request a Feature)
- **Trigger:** Tab click — sets `dclTab` state. Tab IDs: `dctab-dc-current`, `dctab-dc-past`, `dctab-dc-upcoming`, `dctab-dc-request`
- **What happens:** Switches active tab content via CSS display toggling
- **API call:** NONE
- **Data created/modified:** Sets `dclTab` state
- **Where it lands:** N/A — client-side display only
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (tab switching)

---

#### What's New → What's New tab (read)
- **Trigger:** Tab active: `dctab-dc-current`
- **What happens:** Displays v2.0.0 release notes. Static content.
- **API call:** NONE — static content
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** HARDCODED (static release notes)

---

#### What's New → Past Updates tab (read)
- **Trigger:** Tab active: `dctab-dc-past`
- **What happens:** Displays v1.0.0 and v0.1.0 release history. Static content.
- **API call:** NONE — static content
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** HARDCODED (static release history)

---

#### What's New → Coming Soon tab (read)
- **Trigger:** Tab active: `dctab-dc-upcoming`
- **What happens:** Displays v2.1.0 through v3.0.0 roadmap. Static content.
- **API call:** NONE — static content
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** HARDCODED (static roadmap)

---

#### What's New → Request a Feature tab → Form fields (Feature Title, Description, Priority)
- **Trigger:** Tab active: `dctab-dc-request`; user types in form fields
- **What happens:** Renders a feature request form. Updates local form state on input.
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (form fields render — submission is NOT FUNCTIONAL)

---

#### What's New → Request a Feature → Submit button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs. No API call. Intended to submit a feature request.
- **API call:** NONE (empty handler — no API call)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — Operator Portal → `changelog` page → Feature Requests tab → new request row in requests table
  - Role: operator_admin, operator_staff would see the submitted request
  - Page: Operator Portal → `changelog` → Requests tab
  - Section: Feature requests table
- **Notifications triggered:** [TODO: Notification not wired]
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can submit (no restriction documented).
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### PAGE: d-settings — Settings

#### Settings → Sub-page switch (My Profile / Security / Dealership Account / Subscription & Billing / Notification Preferences)
- **Trigger:** Sub-page navigation click — sets `dSettingsTab` state
- **What happens:** Switches active settings sub-page via CSS display toggling. Sub-page IDs: `ds-profile`, `ds-security`, `ds-dealership`, `ds-subscription`, `ds-notif`
- **API call:** NONE
- **Data created/modified:** Sets `dSettingsTab` state
- **Where it lands:** N/A — client-side display only
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can access settings. Sub-pages `ds-subscription` may be owner-only (not explicitly restricted in inventory).
- **Current state:** FUNCTIONAL (tab switching) — **[REVIEW]** Possible prefix mismatch bug: `dSettingsTab` may be set to `'ds-profile'` but display conditions may check for `'dstab-ds-profile'` (same pattern as CustomerPortal settings bug). Needs verification in source. If present, all settings sub-pages would never render.

---

#### Settings → My Profile sub-page → Profile Photo upload
- **Trigger:** File input selection — calls `updateProfileImage()`
- **What happens:** `FileReader` reads the selected image and updates the profile photo display in the DOM. No server upload. Also intended to update the sidebar avatar.
- **API call:** NONE — FileReader DOM manipulation only
- **Data created/modified:** Nothing persisted. DOM update only.
- **Where it lands:**
  - Portal: NOWHERE — not persisted
  - Role: N/A
  - Page: N/A
  - Section: N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles (personal profile).
- **Current state:** NOT FUNCTIONAL for storage (DOM preview works)
- **[REVIEW: ROUTING]** When implemented: upload to R2/S3, PATCH `/api/users/:id` with `{avatar_url}`. Should update both the settings page photo and the sidebar avatar display.

---

#### Settings → My Profile sub-page → Full Name, Email, Phone, Language Preference fields
- **Trigger:** User types or selects
- **What happens:** Updates local form state. Role field is readonly.
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (form fields — not submitted anywhere)

---

#### Settings → My Profile sub-page → Save Changes button
- **Trigger:** Button click
- **What happens:** `updateProfileImage()` handles photo (FileReader only). Rest of form fields — empty handler — nothing saved.
- **API call:** NONE (empty handler for form data; FileReader only for photo)
- **Data created/modified:** Nothing persisted
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** NOT FUNCTIONAL (empty handler for form data)

---

#### Settings → Security sub-page → Current Password, New Password, Confirm Password fields
- **Trigger:** User types in fields
- **What happens:** Updates local form state
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** FUNCTIONAL (form fields — not submitted anywhere)

---

#### Settings → Security sub-page → Update Password button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** NOT FUNCTIONAL (empty handler)

---

#### Settings → Security sub-page → Enable 2FA toggle
- **Trigger:** Toggle switch
- **What happens:** Empty handler — nothing occurs
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** NOT FUNCTIONAL (empty handler)

---

#### Settings → Security sub-page → Revoke Session (per session)
- **Trigger:** Button click per active session row
- **What happens:** Empty handler — nothing occurs. Intended to invalidate a specific active session.
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles (own sessions only).
- **Current state:** NOT FUNCTIONAL (empty handler)

---

#### Settings → Dealership Account sub-page → Form fields (Name, Phone, Address, City, Province, Postal, Website, GST/HST)
- **Trigger:** User types or selects
- **What happens:** Updates local form state
- **API call:** NONE
- **Data created/modified:** Local form state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can view — **[REVIEW: BUSINESS LOGIC]** Dealership account editing should likely be owner-only when implemented.
- **Current state:** FUNCTIONAL (form fields — not submitted anywhere)

---

#### Settings → Dealership Account sub-page → Save button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — updates `dealers` table record; changes visible in Operator Portal → Dealer Detail → Info tab (dealership name, contact info)
  - Role: operator_admin (sees updated dealer info)
  - Page: Operator Portal → `dealer-detail` → Info tab
  - Section: Dealer info fields
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles (no restriction documented). Should be owner-only. **[REVIEW: BUSINESS LOGIC]**
- **Current state:** NOT FUNCTIONAL (empty handler)

---

#### Settings → Subscription & Billing sub-page (read)
- **Trigger:** Sub-page navigation
- **What happens:** Displays Current Plan, Next billing date, Wallet balance (read-only display). No API call documented.
- **API call:** NONE confirmed
- **Data created/modified:** None (display only)
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles can view — **[REVIEW: BUSINESS LOGIC]** Billing info should be owner-only when implemented.
- **Current state:** HARDCODED (static display — no live data fetch documented)
- **[REVIEW]** No API call is documented for this sub-page. Wallet balance and plan info would need a fetch from `dealers` and `subscriptions` tables when implemented.

---

#### Settings → Subscription & Billing → Top Up button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** dealer_owner only (billing action). **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (empty handler)

---

#### Settings → Subscription & Billing → Change Plan button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — Operator Portal → Dealer Detail → Subscription tab → plan type updated; Billing engine adjusts
  - Role: operator_admin (sees plan change)
  - Page: Operator Portal → `dealer-detail` → Subscription tab
  - Section: Subscription plan display
- **Notifications triggered:** [TODO: Notification not wired]
- **Status changes:** Intended: `subscriptions.plan_type` updated; Stripe subscription modified
- **KPI impact:** None
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (empty handler)

---

#### Settings → Subscription & Billing → Cancel Subscription button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:**
  - Portal: INTENDED — Operator Portal → Dealer Detail → status changes to `cancelled`; dealer no longer appears in active dealer count
  - Role: operator_admin (notified)
  - Page: Operator Portal → `dealer-detail`; Operator Portal → `dealers` list
  - Section: Dealer status column
- **Notifications triggered:** [TODO: Notification not wired] — Intended: Operator Admin → "Dealer [Name] has cancelled their subscription"
- **Status changes:** Intended: `subscriptions.status = 'cancelled'`; `dealers.status = 'inactive'` (after period end); Stripe subscription cancelled
- **KPI impact:** Intended: decrements Active Dealers count on Operator dashboard
- **Role restrictions:** dealer_owner only. **[SECURITY: UI-only restriction — needs API enforcement]**
- **Current state:** NOT FUNCTIONAL (empty handler)

---

#### Settings → Notification Preferences sub-page → Toggles
- **Trigger:** Toggle switches for: Claim status updates, Invoice sent, Parts order updates, New ticket reply, Promotional / platform news
- **What happens:** Updates local toggle state
- **API call:** NONE
- **Data created/modified:** Local state only
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles (own notification preferences).
- **Current state:** FUNCTIONAL (toggles render — not saved)

---

#### Settings → Notification Preferences sub-page → Save button
- **Trigger:** Button click
- **What happens:** Empty handler — nothing occurs
- **API call:** NONE (empty handler)
- **Data created/modified:** Nothing
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Both roles.
- **Current state:** NOT FUNCTIONAL (empty handler)

---

### PAGE: d-financing — Financing (DELEGATED)

This page is delegated to the `DealerMarketplacePages` component. Actions within this component are not fully inventoried in `PORTAL-UI-INVENTORY.json`.

- **Current state:** DELEGATED — not fully inventoried
- **[REVIEW]** The `DealerMarketplacePages` component handles Financing, F&I Products, Warranty Plans, and Parts Orders pages. Full action inventory for these pages requires separate analysis of that component file.

---

### PAGE: d-fi — F&I Products (DELEGATED)

Delegated to `DealerMarketplacePages` component. See note above.

---

### PAGE: d-warranty — Warranty Plans (DELEGATED)

Delegated to `DealerMarketplacePages` component. See note above.

---

### PAGE: d-parts — Parts Orders (DELEGATED)

Delegated to `DealerMarketplacePages` component. See note above.

---

### PAGE: showcase — Showcase / Marketplace (DELEGATED)

Delegated to `DealerShowcasePages` component. Not in sidebar navigation — accessible programmatically. Full action inventory requires separate analysis.

---

## WebSocket Events — Dealer Portal

| Event | Trigger Source | Effect on Dealer Portal |
|-------|---------------|------------------------|
| `claim:updated` | Operator updates a claim (status change, FRC assigned, line approved/denied) | Refreshes `dlrClaims` array → My Claims table and dashboard Recent Claims table update automatically |
| `ticket:message` | Customer sends a message (Customer Portal) OR operator replies (Operator Portal) | Refreshes `dlrTickets` array → Customer Tickets table and ticket detail conversation thread update |

**[REVIEW: NOTIFICATION]** WebSocket events refresh data arrays but do not trigger UI notification toasts or badge updates in the documented inventory. The sidebar bell icon shows a hardcoded "3" badge — this is not dynamically driven by `dlrNotifications` in current build.

---

## Cross-Portal Data Flow — Complete Trace

### Flow 1: Dealer adds a unit

| Step | Actor | Action | API | Result visible in |
|------|-------|--------|-----|-------------------|
| 1 | Dealer (owner or staff) | Completes Add Unit form and clicks Add Unit | POST `/api/units` | Dealer Portal → My Units table |
| 2 | Server | Creates `units` record with `dealer_id` | — | Operator Portal → Unit Inventory (`units` page) → units-table |
| 3 | Server | Creates `units` record | — | Operator Portal → Dealer Detail → Units tab (9-tab dealer detail) |
| 4 | (not wired) | Notification to operator | — | [TODO: not wired] |

**Customer Portal impact:** Unit does not automatically appear in Customer Portal until a customer is invited and linked to the unit.

---

### Flow 2: Dealer uploads photos and pushes to claim (INTENDED — not wired)

| Step | Actor | Action | API | Result visible in |
|------|-------|--------|-----|-------------------|
| 1 | Dealer | Fills Upload Photos form (unit, type, photos, notes) | — | — |
| 2 | Dealer | Clicks Push to Claim | POST `/api/claims` (not wired) | Dealer Portal → My Claims (new row, status=pending_review) |
| 3 | Server | Creates `claims`, `claim_lines`, `line_photos` records | — | Operator Portal → Processing Queue (`queue` page) → queue-table (status=pending_review) |
| 4 | Server | Creates `claims` record | — | Operator Portal → All Claims → all-claims-table |
| 5 | WebSocket | `claim:updated` fires | — | Dealer Portal → `dlrClaims` refreshed; dashboard stat cards update |
| 6 | (not wired) | Notification to operator | — | [TODO: not wired] → Intended: Operator bell badge + Notifications page |

---

### Flow 3: Dealer invites a customer

| Step | Actor | Action | API | Result visible in |
|------|-------|--------|-----|-------------------|
| 1 | Dealer (owner or staff) | Fills Invite Customer form and clicks Send Invitation | POST `/api/users/invite` body: `{email, role:'client'}` | Dealer Portal → Customer Portal Management table (new row, Portal Active=pending) |
| 2 | Server | Creates `dealer_users` record with `role=client`, `dealer_id` | — | (internal) |
| 3 | Server | Sends invitation email | — | Customer inbox (external) |
| 4 | Customer | Accepts invite, sets password | — | Customer Portal — full access granted |
| 5 | Customer | Logs in to Customer Portal | GET `/api/customers/me/dashboard` | Customer Portal → Dashboard: unit card, dealer info, active claims, alerts |

**Customer Portal pages unlocked after invite acceptance:** Dashboard (My Unit card, dealer info), My Unit, Warranty & Coverage, Claim Status (dealer's claims for this customer's unit), Support Tickets, Quick Chat, Report an Issue, Parts Orders, Documents.

---

### Flow 4: Customer submits a ticket (Customer Portal → Dealer Portal)

| Step | Actor | Action | API | Result visible in |
|------|-------|--------|-----|-------------------|
| 1 | Customer | Submits Report an Issue or New Ticket form | POST `/api/tickets` body: `ticketForm` | Customer Portal → Support Tickets list |
| 2 | Server | Creates `tickets` record linked to `dealer_id` and `customer_id` | — | Dealer Portal → Customer Tickets page → tickets-table (new row, status=open) |
| 3 | WebSocket | `ticket:message` fires | — | Dealer Portal → `dlrTickets` refreshed |
| 4 | (not wired) | Notification to dealer | — | [TODO: not wired] → Intended: Dealer bell badge + Notifications page |

---

### Flow 5: Dealer replies to customer ticket (INTENDED — not wired)

| Step | Actor | Action | API | Result visible in |
|------|-------|--------|-----|-------------------|
| 1 | Dealer | Types reply in Ticket Detail, sets visibility, clicks Send Reply | POST `/api/tickets/:id/messages` (not wired) | — |
| 2 | Server | Creates `messages` record with `visibility=customer\|internal` | — | Dealer Portal → Ticket Detail conversation thread |
| 3 | WebSocket | `ticket:message` fires | — | Customer Portal → `custTickets` refreshed → ticket-detail-c conversation thread (if visibility=customer) |
| 4 | (not wired) | Notification to customer | — | [TODO: not wired] → Intended: Customer bell badge + email |

**Internal notes** (visibility=internal): visible to dealer and operator only. Customer Portal does NOT show internal notes.

---

### Flow 6: Operator updates a claim status (Operator → Dealer)

| Step | Actor | Action | API | Result visible in |
|------|-------|--------|-----|-------------------|
| 1 | Operator (admin or staff) | Updates claim status, approves/denies lines in Claim Detail | (not wired in Operator Portal either) | — |
| 2 | Server | Updates `claims.status`, `claim_lines.line_status` | — | Dealer Portal → My Claims table → Status column updates |
| 3 | WebSocket | `claim:updated` fires | — | Dealer Portal → `dlrClaims` refreshed → My Claims table, dashboard Recent Claims |
| 4 | (not wired) | Notification to dealer | — | [TODO: not wired] → Intended: Dealer bell badge: "Claim #[X] status updated: [new_status]" |
| 5 | Customer Portal (read) | Claim status visible in Customer Portal | GET `/api/claims` | Customer Portal → Claim Status page → Status column; Claim Detail visual timeline |

---

## Known Issues and Bugs — Dealer Portal

### Bug 1: Settings Tab Prefix Mismatch (POTENTIAL FUNCTIONAL BUG)
- **Page:** `d-settings`
- **Description:** `dSettingsTab` state may be set to values like `'ds-profile'` but display conditions in the JSX may check `dSettingsTab === 'dstab-ds-profile'`. If so, the `'dstab-'` prefix is never set by the setter, meaning all 5 Settings sub-pages never render. Needs verification against source.
- **Severity:** Potential functional bug (confirmed as the same pattern in CustomerPortal — flagged as definite bug there)
- **Source:** `PORTAL-UI-INVENTORY.json` known_bugs entry for DealerPortal d-settings

### Bug 2: Hardcoded Notification Badge
- **Page:** Sidebar
- **Description:** The bell icon in the sidebar shows a hardcoded red "3" badge regardless of actual `dlrNotifications` count.
- **Severity:** Cosmetic — misleading to users

### Bug 3: dlrUnits not refreshed after Push to Claim
- **Page:** upload
- **Description:** `Push to Claim` is an empty handler. When implemented, after claim submission `dlrUnits` should be refetched if DAF/PDI status changes.

### Bug 4: isDealerOwner defaults to true
- **All pages:** `isDealerOwner = !user || user.role === 'dealer_owner'` evaluates to `true` when `user` is null (unauthenticated). In prototype mode, all users have owner access regardless of role. This must be fixed before production.
- **Severity:** Critical security bug in production context

---

## Summary Table — Dealer Portal Only

| Category | Count |
|---|---|
| Total actions documented | 79 |
| FUNCTIONAL | 17 |
| NOT FUNCTIONAL (empty handler) | 33 |
| NOT FUNCTIONAL (FileReader only — no server storage) | 5 |
| HARDCODED (static data — no API) | 6 |
| UNVERIFIED ENDPOINT (API call present but path unconfirmed) | 8 |
| DELEGATED (DealerMarketplacePages / DealerShowcasePages) | 5 |
| Navigation-only actions (always functional) | 18 |
| [REVIEW] items total | 38 |
| [REVIEW: SECURITY] items | 11 |
| [REVIEW: ROUTING] items | 9 |
| [REVIEW: NOTIFICATION] items | 8 |
| [REVIEW: BUSINESS LOGIC] items | 10 |
| Cross-portal flows documented | 6 |
| Owner-only pages | 4 |
| Pages with multi-tenant isolation risk | 5 |
| WebSocket events subscribed | 2 |

---

_End of DATA ROUTING SPEC — DEALER PORTAL_
---

# DATA ROUTING SPEC — CUSTOMER PORTAL

**File:** `client/src/portals/CustomerPortal.tsx`
**Route:** `/portal`
**Role:** `client`
**Lines:** 522 (source) — 581+ (actual, source file extends beyond inventory count)

## Source vs Inventory Discrepancies (Confirmed from Source)

| Inventory ID | Actual activePage ID | Notes |
|---|---|---|
| `claim-status` | `claims` | Sidebar nav uses `showPage('claims')`, page renders as `activePage === 'claims'` |
| `claim-detail-c` | `claim-detail` | Inventory calls it `claim-detail-c`; source uses `claim-detail` |
| `parts-orders` | `parts` | Sidebar and fetch use `'parts'` |
| `protection-plans` | `fi-products` | Sidebar uses `showPage('fi-products')`, page ID is `page-fi-products` |
| `ticket-detail-c` | `ticket-detail` | Source uses `ticket-detail`, not `ticket-detail-c` |
| `c-settings` | `settings` | Source page is `activePage === 'settings'`, not `c-settings` |

## Known Bugs

**BUG 1 — Settings tab prefix mismatch (CONFIRMED IN SOURCE):**
`setCustSettingsTab('cs-profile')` is called on click, but the display condition reads `custSettingsTab === "cstab-cs-profile"`. The value set (`'cs-profile'`) never equals the check value (`'cstab-cs-profile'`). All three settings sub-pages are permanently hidden. This is a confirmed functional bug — the Settings page renders the left-nav link list but no content panel ever appears.

**BUG 2 — report-issue page does NOT call handleSubmitTicket:**
The "Submit Issue" button on the `report-issue` page calls `showPage('claims')` directly with no API call. The issue description form (issue type select, description textarea, photo upload zone) has no state bindings and no submit handler. This page is completely non-functional for data submission.

**BUG 3 — new-ticket form fields are not bound to ticketForm state:**
On the `new-ticket` page, the Category `<select>`, Subject `<input>`, and Message `<textarea>` have no `value` or `onChange` bindings to `ticketForm`. Only the "Submit Ticket" button fires `showPage('tickets')` with no API call. `handleSubmitTicket()` is defined but NOT wired to any button in this page's actual source.

**BUG 4 — Quick Chat Send button has no handler:**
The Send button in `quick-chat` is `<button className="btn btn-p btn-sm">Send</button>` with no `onClick`. `handleSendChat()` exists in state but is not attached.

**BUG 5 — ticket-detail Send Reply has no handler:**
The "Send Reply" button is `<button className="btn btn-p btn-sm">Send Reply</button>` with no `onClick`.

**BUG 6 — selectedTicketId is never set in new-ticket flow:**
`handleSendChat()` requires `selectedTicketId` to be non-null. When navigating to quick-chat directly (not via tickets list), `selectedTicketId` remains `null` and the chat silently no-ops.

---

## Global Header Actions

#### Header → Toggle Sidebar
- **Trigger:** Button click (hamburger icon)
- **What happens:** Toggles `sidebarCollapsed` boolean; sidebar gains/loses `.collapsed` class; main content gains/loses `.collapsed-main` class
- **API call:** NONE
- **Data created/modified:** localStorage not written; state only
- **Where it lands:** Local UI only
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all authenticated clients
- **Current state:** FUNCTIONAL

#### Header → EN Language Toggle
- **Trigger:** Button click ("EN" pill)
- **What happens:** Sets `lang = 'en'`; writes `ds360-lang = 'en'` to localStorage
- **API call:** NONE
- **Data created/modified:** localStorage `ds360-lang`
- **Where it lands:** Local UI; persists on refresh
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all
- **Current state:** FUNCTIONAL

#### Header → FR Language Toggle
- **Trigger:** Button click ("FR" pill)
- **What happens:** Sets `lang = 'fr'`; writes `ds360-lang = 'fr'` to localStorage
- **API call:** NONE
- **Data created/modified:** localStorage `ds360-lang`
- **Where it lands:** Local UI; persists on refresh
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all
- **Current state:** FUNCTIONAL
- **[REVIEW]:** i18n.ts DOM-walker translation is used in portal-css-based portals. CustomerPortal uses React state for lang but does not call the i18n translation engine — actual text translation may be no-op. [REVIEW: BUSINESS LOGIC]

#### Header → Dark Mode Toggle
- **Trigger:** Button click (sun/moon icon)
- **What happens:** Toggles `theme` between `''` and `'dark'`; sets `data-theme` attribute on `document.documentElement`; writes `ds360-theme` to localStorage
- **API call:** NONE
- **Data created/modified:** localStorage `ds360-theme`
- **Where it lands:** Local UI; persists on refresh
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all
- **Current state:** FUNCTIONAL

#### Header → Notifications Bell (chat icon)
- **Trigger:** Button click
- **What happens:** `showPage('tickets')` — navigates to Support Tickets page
- **API call:** NONE (navigation only; tickets data loads via useEffect on activePage change)
- **Data created/modified:** None
- **Where it lands:** Customer Portal → tickets page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all
- **Current state:** FUNCTIONAL

#### Sidebar Footer → Sign Out
- **Trigger:** Button click
- **What happens:** Calls `logout()` from `useAuth()` hook; then `window.location.href = '/'`
- **API call:** Handled by `useAuth` hook — likely `POST /api/auth/logout` or token invalidation (not visible in this file)
- **Data created/modified:** Auth session/tokens cleared
- **Where it lands:** Redirects to public homepage
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all
- **Current state:** FUNCTIONAL (depends on useAuth implementation)

---

## Page: dashboard — Dashboard

#### Dashboard → Alert: Track Claim (CLM-0248)
- **Trigger:** Button click ("Track" on claim-in-progress alert card)
- **What happens:** `showPage('claim-detail')` — navigates to hardcoded claim detail
- **API call:** NONE (navigation only)
- **Data created/modified:** None
- **Where it lands:** Customer Portal → claim-detail page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation); claim detail data is HARDCODED

#### Dashboard → Alert: View Protection Plans
- **Trigger:** Button click ("View" on protection plans alert card)
- **What happens:** `showPage('fi-products')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → fi-products page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Alert: Warranty Details
- **Trigger:** Button click ("Details" on warranty active alert card)
- **What happens:** `showPage('warranty')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → warranty page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Unit Card: View Details
- **Trigger:** Button click ("View Details" on unit card)
- **What happens:** `showPage('my-unit')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → my-unit page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Quick Action: Report an Issue
- **Trigger:** Button click
- **What happens:** `showPage('report-issue')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → report-issue page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Quick Action: Message Dealer
- **Trigger:** Button click
- **What happens:** `showPage('quick-chat')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → quick-chat page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Quick Action: View Documents
- **Trigger:** Button click
- **What happens:** `showPage('documents')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → documents page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Data Load (useEffect)
- **Trigger:** Page mount / `activePage` changes to `'dashboard'`
- **What happens:** Fetches claims list and unit data simultaneously
- **API call:** `GET /api/claims` → sets `custClaims`; `GET /api/units` → sets `custUnit` as `(d.units || [])[0] || null`
- **Data created/modified:** `custClaims`, `custUnit` in component state
- **Where it lands:** Dashboard alert cards and unit card display
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Tenant-scoped by auth — should only return claims for this customer's dealer
- **Current state:** FUNCTIONAL (API calls wired) — unit card display is HARDCODED HTML despite state being set; actual `custUnit` object not rendered in the unit card JSX (card shows static "2024 Jayco Jay Flight 264BH")
- **[REVIEW]:** `GET /api/claims` endpoint — it is unclear whether this returns only this customer's claims or all dealer claims. No customer_id filter visible in the URL. [REVIEW: SECURITY] — wrong scoping would expose other customers' claims.

---

## Page: my-unit — My Unit

#### My Unit → Page Load (useEffect)
- **Trigger:** `activePage` changes to `'my-unit'`
- **What happens:** Fetches units from API
- **API call:** `GET /api/units` → sets `custUnit` as first element
- **Data created/modified:** `custUnit` in state
- **Where it lands:** my-unit page data display
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Same scoping concern as dashboard
- **Current state:** FUNCTIONAL (API wired) — page renders HARDCODED HTML, not from `custUnit` state
- **[REVIEW]:** All visible data (VIN, make, model, inspections) is hardcoded in JSX. `custUnit` is fetched but not rendered. [REVIEW: BUSINESS LOGIC]

#### My Unit → View Warranty
- **Trigger:** Navigation only (sidebar link or back-navigation)
- **What happens:** `showPage('warranty')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → warranty page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

#### My Unit → View Claims
- **Trigger:** Navigation only
- **What happens:** `showPage('claims')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → claims page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

---

## Page: warranty — Warranty & Coverage

#### Warranty → Page Load (useEffect)
- **Trigger:** `activePage` changes to `'warranty'`
- **What happens:** Fetches units
- **API call:** `GET /api/units` → sets `custUnit`
- **Data created/modified:** `custUnit` in state
- **Where it lands:** Warranty page — but all displayed data is HARDCODED in JSX, not from `custUnit`
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** HARDCODED display; API fetch wired but data not rendered
- **[REVIEW]:** Countdown bars (699 days, 1795 days) and all coverage details are static HTML. [REVIEW: BUSINESS LOGIC]

#### Warranty → View Coverage Details
- **Trigger:** Button click (no button visible in actual source — inventory listed this but the source only shows static "What's Covered" grid with no action button)
- **What happens:** No button present in source for this action
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL — button does not exist in current source
- **[REVIEW]:** Inventory doc lists "View Coverage Details" as NOT FUNCTIONAL empty handler; source inspection shows no such button at all. [REVIEW]

#### Warranty → Renew Extended Warranty
- **Trigger:** Button click (not present in source)
- **What happens:** Not implemented
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL — button does not exist in current source
- **[REVIEW]:** Same as above — not present in source. [REVIEW]

---

## Page: documents — Documents

#### Documents → Page Load
- **Trigger:** `activePage` changes to `'documents'`
- **What happens:** No API call triggered for this page; data is entirely hardcoded
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Documents table displays 5 hardcoded rows: Warranty Certificate, Extended Warranty — Guardsman RV, DAF Inspection Report, PDI Inspection Report, Purchase Agreement
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** HARDCODED

#### Documents → Download (per row)
- **Trigger:** Button click ("Download") on each document row
- **What happens:** No handler attached — plain `<button>` with no `onClick`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (empty handler)
- **[REVIEW]:** No signed URL fetch, no file storage call, no download trigger of any kind. [REVIEW: BUSINESS LOGIC]

---

## Page: claims — Claim Status

#### Claims → Page Load (useEffect)
- **Trigger:** `activePage` changes to `'claims'` (NOTE: inventory documents this as `'claim-status'` but actual page ID is `'claims'`)
- **What happens:** Fetches claims list
- **API call:** `GET /api/claims` → sets `custClaims`
- **Data created/modified:** `custClaims` in state
- **Where it lands:** Claims table — columns: Claim #, Type, Issues, Status, Est. Value, Submitted, Action
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Must be tenant-scoped; same security concern as dashboard
- **Current state:** FUNCTIONAL
- **[REVIEW]:** Endpoint `/api/claims` is shared with dealer/operator — client-specific scoping must be enforced server-side. [REVIEW: SECURITY]

#### Claims → View Claim Detail (per row — claim number link)
- **Trigger:** Click on claim number (`<span className="cid">`)
- **What happens:** Sets `selectedClaimId = c.id`; calls `showPage('claim-detail')`
- **API call:** NONE (navigation only; claim-detail page renders HARDCODED content, not from selectedClaimId)
- **Data created/modified:** `selectedClaimId` in state
- **Where it lands:** Customer Portal → claim-detail page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL navigation; claim-detail display is HARDCODED
- **[REVIEW]:** `selectedClaimId` is set but claim-detail page does not fetch `/api/claims/:id` — it renders static hardcoded HTML for CLM-0248. [REVIEW: BUSINESS LOGIC]

#### Claims → Track Button (per row)
- **Trigger:** Button click ("Track")
- **What happens:** Sets `selectedClaimId = c.id`; calls `showPage('claim-detail')`
- **API call:** NONE
- **Data created/modified:** `selectedClaimId` in state
- **Where it lands:** Same as above
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL navigation; display is HARDCODED

---

## Page: claim-detail — Claim Detail

#### Claim Detail → Page Data (no useEffect)
- **Trigger:** Page becomes active via `selectedClaimId` being set
- **What happens:** No API fetch triggered; page renders entirely hardcoded HTML for CLM-0248
- **API call:** NONE — no `useEffect` on `claim-detail` activePage in source
- **Data created/modified:** None
- **Where it lands:** Hardcoded claim detail: CLM-0248, 4 issues (Sidewall Delamination, Roof Vent Leak, Slide-Out Seal, Cabinet Hinge), visual 5-step timeline
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** HARDCODED — `selectedClaimId` is ignored
- **[REVIEW]:** No `GET /api/claims/:id` call exists in CustomerPortal. Claim detail is purely static prototype HTML. [REVIEW: BUSINESS LOGIC]

#### Claim Detail → Back Button
- **Trigger:** Button click (back arrow)
- **What happens:** `showPage('claims')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → claims page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL

#### Claim Detail → View Full Ticket Link
- **Trigger:** Click on "View full ticket →" in the Messages panel
- **What happens:** `showPage('ticket-detail')`
- **API call:** NONE (navigation only)
- **Data created/modified:** None — notably `selectedTicketId` is NOT set here, so ticket-detail renders hardcoded TKT-0042
- **Where it lands:** Customer Portal → ticket-detail page (hardcoded)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation); display is HARDCODED

#### Claim Detail → Inline Message Send
- **Trigger:** Button click ("Send" in the Messages panel textarea area)
- **What happens:** No `onClick` attached — plain button
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

#### Claim Detail → Mark as Resolved (ticket side panel)
- **Trigger:** Button click ("Mark as Resolved")
- **What happens:** No `onClick` attached — plain button
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

#### Claim Detail → Attach Photo Button
- **Trigger:** Button click ("Attach Photo")
- **What happens:** No `onClick` attached — plain button
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

#### Claim Detail → Linked Claim Number (ticket side panel)
- **Trigger:** Click on "CLM-0248" in Linked Items
- **What happens:** `showPage('claim-detail')` — stays on same page (no-op navigation)
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Same page (claim-detail)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation — effectively a no-op)

---

## Page: report-issue — Report an Issue

**[CRITICAL BUG]:** This page does NOT call `handleSubmitTicket()`. The form fields (issue type select, description textarea, photo upload zone) have no React state bindings and no `onChange` handlers. The "Submit Issue" button calls `showPage('claims')` directly. This page cannot create any data.

#### Report an Issue → Issue Type Select
- **Trigger:** Select change
- **What happens:** No state binding — value not captured
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no state binding)

#### Report an Issue → Describe Issue Textarea
- **Trigger:** Text input
- **What happens:** No state binding — value not captured
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no state binding)

#### Report an Issue → Upload Photos (drop zone)
- **Trigger:** File selection via upload zone
- **What happens:** No `onChange` handler — `<input type="file">` is not present in this section; the zone is a styled `<div>` with no file input
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no file input, no handler)
- **[REVIEW: BUSINESS LOGIC]:** Photo upload is a core requirement for issue reporting. Completely absent.

#### Report an Issue → Submit Issue Button
- **Trigger:** Button click ("Submit Issue")
- **What happens:** `showPage('claims')` only — no form data read, no API call
- **API call:** NONE
- **Data created/modified:** Nothing — redirects to claims list
- **Where it lands:** Customer Portal → claims page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** NOT FUNCTIONAL — navigates away without submitting data
- **[REVIEW: BUSINESS LOGIC]:** This is a critical gap. The inventory doc says Submit calls `handleSubmitTicket()` but source proves otherwise.

#### Report an Issue → Save Draft Button
- **Trigger:** Button click ("Save Draft")
- **What happens:** No `onClick` — plain `<button className="btn btn-o">` with no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

#### Report an Issue → Cancel Button
- **Trigger:** Not present in source — inventory listed Cancel → showPage('dashboard') but source only has Submit Issue and Save Draft
- **What happens:** N/A
- **API call:** NONE
- **Data created/modified:** None
- **Current state:** NOT FUNCTIONAL — button not present in source
- **[REVIEW]:** Inventory doc discrepancy. [REVIEW]

---

## Page: parts — Parts Orders

#### Parts Orders → Page Load (useEffect)
- **Trigger:** `activePage` changes to `'parts'`
- **What happens:** Fetches parts orders
- **API call:** `GET /api/parts-orders` → sets `custPartsOrders`
- **Data created/modified:** `custPartsOrders` in state
- **Where it lands:** Parts table — columns: Order, Items, Related Claim, Status, ETA
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Must be scoped to this customer's orders
- **Current state:** FUNCTIONAL (API wired) — ENDPOINT UNVERIFIED (`/api/parts-orders` path may differ)
- **[REVIEW: ROUTING]:** No `View` button exists in source — table rows show order data with no per-row action button. Inventory listed a NOT FUNCTIONAL "View" per row, but source has no such button.

---

## Page: fi-products — Protection Plans

**Note:** Inventory calls this `protection-plans` but actual activePage ID is `fi-products`. Products shown differ from inventory (4 different products: GAP Insurance $995, Paint & Fabric Protection $695, Roadside Assistance 3yr $395, Extended Warranty — OWNED). Inventory listed Paint Protection $799, Fabric Protection $399, Interior Protection $599, Exterior Bundle $1199.

#### Protection Plans → Page Load
- **Trigger:** `activePage` changes to `'fi-products'`
- **What happens:** No API call; renders HARDCODED product cards
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** 4 hardcoded product cards
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** HARDCODED

#### Protection Plans → Talk to an Expert Button
- **Trigger:** Button click ("Talk to an Expert →")
- **What happens:** No `onClick` — plain `<button>` with no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

#### Protection Plans → Learn More (per card: GAP, Paint & Fabric, Roadside)
- **Trigger:** Button click ("Learn More")
- **What happens:** No `onClick` — plain `<button className="btn btn-p btn-sm">` with no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

#### Protection Plans → View Coverage (Extended Warranty — OWNED card)
- **Trigger:** Button click ("View Coverage")
- **What happens:** `showPage('warranty')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → warranty page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

---

## Page: roadside — Roadside Assistance

#### Roadside → Notify Me When Available
- **Trigger:** Button click
- **What happens:** No `onClick` — plain `<button className="btn btn-o">` with no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

---

## Page: tickets — Support Tickets

#### Support Tickets → Page Load (useEffect)
- **Trigger:** `activePage` changes to `'tickets'`
- **What happens:** Fetches support tickets for this customer
- **API call:** `GET /api/tickets` → sets `custTickets`
- **Data created/modified:** `custTickets` in state
- **Where it lands:** Tickets table — columns: Ticket #, Subject, Category, Related (claim number), Status, Last Update, Action
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Must be scoped to this customer's tickets server-side
- **Current state:** FUNCTIONAL
- **[REVIEW]:** Cross-portal routing: tickets created here should appear in Dealer Portal under Customer Tickets page. The Dealer Portal fetches `GET /api/tickets` — if scoped by dealer_id the same endpoint could power both views. Operator visibility is not confirmed. [REVIEW: ROUTING]

#### Support Tickets → Filters (search, status, category)
- **Trigger:** Text input / select change
- **What happens:** No state bindings — filter inputs have no `value` or `onChange` handlers; they are uncontrolled inputs that do not filter the `custTickets` array
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no state bindings, no filtering logic)

#### Support Tickets → New Ticket Button
- **Trigger:** Button click ("+ New Ticket")
- **What happens:** `showPage('new-ticket')`
- **API call:** NONE (navigation only)
- **Data created/modified:** None
- **Where it lands:** Customer Portal → new-ticket page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

#### Support Tickets → View Ticket (ticket number link, per row)
- **Trigger:** Click on ticket number `<span className="cid">`
- **What happens:** Sets `selectedTicketId = t.id`; calls `showPage('ticket-detail')`
- **API call:** NONE (navigation only)
- **Data created/modified:** `selectedTicketId` in state
- **Where it lands:** Customer Portal → ticket-detail page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL navigation; ticket-detail renders HARDCODED content (TKT-0042), ignoring `selectedTicketId`

#### Support Tickets → View Button (per row)
- **Trigger:** Button click ("View")
- **What happens:** Sets `selectedTicketId = t.id`; calls `showPage('ticket-detail')`
- **API call:** NONE
- **Data created/modified:** `selectedTicketId` in state
- **Where it lands:** Customer Portal → ticket-detail page (hardcoded)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL navigation; display is HARDCODED

---

## Page: ticket-detail — Ticket Detail

**Note:** Source page is hardcoded to TKT-0042. `selectedTicketId` is set but never used for a fetch. All conversation messages are hardcoded JSX. Ticket info panel is hardcoded.

#### Ticket Detail → Page Load
- **Trigger:** `activePage` changes to `'ticket-detail'`
- **What happens:** `GET /api/tickets` is fetched (because useEffect condition includes `activePage === 'ticket-detail'`), refreshing `custTickets`, but the detail display is hardcoded HTML not from this fetch
- **API call:** `GET /api/tickets` → refreshes `custTickets` (not used in this page's display)
- **Data created/modified:** `custTickets` in state
- **Where it lands:** Hardcoded detail panel (TKT-0042)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** HARDCODED display
- **[REVIEW: BUSINESS LOGIC]:** No `GET /api/tickets/:id` fetch exists. `selectedTicketId` is ignored in rendering.

#### Ticket Detail → WebSocket subscription
- **Trigger:** `activePage === 'ticket-detail'`
- **What happens:** `wsClient.on('ticket:message', callback)` — pushes new messages to `chatMessages` array
- **API call:** NONE (WebSocket subscription, not HTTP)
- **Data created/modified:** `chatMessages` appended
- **Where it lands:** Would update chat display IF ticket-detail used `chatMessages` — but the conversation display is hardcoded JSX, not mapped from `chatMessages`
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL — WebSocket messages land in `chatMessages` but are not rendered on this page

#### Ticket Detail → Back Button
- **Trigger:** Button click (back arrow)
- **What happens:** `showPage('tickets')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → tickets page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL

#### Ticket Detail → Send Reply Button
- **Trigger:** Button click ("Send Reply")
- **What happens:** No `onClick` — plain `<button className="btn btn-p btn-sm">Send Reply</button>` with no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)
- **[REVIEW: ROUTING]:** Intended to call `POST /api/tickets/:id/messages`. Would land in Dealer Portal → Customer Tickets → ticket detail conversation thread.

#### Ticket Detail → Attach Photo Button
- **Trigger:** Button click ("Attach Photo")
- **What happens:** No `onClick` — plain button with no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

#### Ticket Detail → Mark as Resolved Button
- **Trigger:** Button click
- **What happens:** No `onClick` — plain `<button>` with no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

#### Ticket Detail → Linked Claim Number (CLM-0248)
- **Trigger:** Click on claim number in Linked Items panel
- **What happens:** `showPage('claim-detail')`
- **API call:** NONE
- **Data created/modified:** None; `selectedClaimId` is NOT updated here
- **Where it lands:** Customer Portal → claim-detail (hardcoded)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

---

## Page: new-ticket — New Ticket

**[CRITICAL BUG]:** Form fields are not bound to `ticketForm` state. "Submit Ticket" button calls `showPage('tickets')` with no API call. `handleSubmitTicket()` is not wired anywhere on this page.

#### New Ticket → Category Select
- **Trigger:** Select change
- **What happens:** No `value` or `onChange` binding — uncontrolled, value not captured
- **API call:** NONE
- **Data created/modified:** None
- **Current state:** NOT FUNCTIONAL (no state binding)

#### New Ticket → Related Item Select
- **Trigger:** Select change
- **What happens:** No `value` or `onChange` binding — uncontrolled
- **API call:** NONE
- **Data created/modified:** None
- **Current state:** NOT FUNCTIONAL (no state binding)

#### New Ticket → Subject Input
- **Trigger:** Text input
- **What happens:** No `value` or `onChange` binding — uncontrolled
- **API call:** NONE
- **Data created/modified:** None
- **Current state:** NOT FUNCTIONAL (no state binding)

#### New Ticket → Message Textarea
- **Trigger:** Text input
- **What happens:** No binding
- **API call:** NONE
- **Data created/modified:** None
- **Current state:** NOT FUNCTIONAL (no state binding)

#### New Ticket → Attachments Upload Zone
- **Trigger:** File selection (click on upload zone)
- **What happens:** No `<input type="file">` present inside the zone — it is a styled `<div>` with no file input element and no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no file input, no handler)

#### New Ticket → Submit Ticket Button
- **Trigger:** Button click
- **What happens:** `showPage('tickets')` only — no API call, no form data read
- **API call:** NONE
- **Data created/modified:** Nothing
- **Where it lands:** Customer Portal → tickets page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** NOT FUNCTIONAL — navigates without submitting
- **[REVIEW: ROUTING]:** Intended flow: `POST /api/tickets` → ticket appears in Dealer Portal: Customer Tickets page, All tab, columns Ticket #/Subject/Category/Status/Last Update. Operator Portal may also receive notification. Neither is wired.
- **[REVIEW: NOTIFICATION]:** No notification triggered to dealer when client creates ticket.

#### New Ticket → Cancel Button
- **Trigger:** Button click ("Cancel")
- **What happens:** `showPage('tickets')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → tickets page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

#### New Ticket → Back Arrow
- **Trigger:** Button click
- **What happens:** `showPage('tickets')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → tickets page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

---

## Page: quick-chat — Quick Chat

**[CRITICAL BUG]:** The Send button has no `onClick`. `handleSendChat()` is not attached to any element on this page.

#### Quick Chat → Page Load / WebSocket
- **Trigger:** `activePage` changes to `'quick-chat'`
- **What happens:** `wsClient.on('ticket:message', callback)` is active — new messages pushed to `chatMessages`
- **API call:** NONE (WebSocket subscription)
- **Data created/modified:** `chatMessages` array appended on inbound WS events
- **Where it lands:** Would display in chat thread IF chat used `chatMessages` — but conversation is hardcoded JSX, not mapped from `chatMessages`
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL — WebSocket subscription is wired but chat display is hardcoded
- **[REVIEW]:** `selectedTicketId` must be set for `handleSendChat()` to work, but there is no way to set it from the quick-chat page UI. [REVIEW: BUSINESS LOGIC]

#### Quick Chat → Message Textarea
- **Trigger:** Text input
- **What happens:** No `value` or `onChange` binding — uncontrolled textarea (state `chatMessage` exists but is not bound here)
- **API call:** NONE
- **Data created/modified:** `chatMessage` state NOT updated
- **Current state:** NOT FUNCTIONAL (no binding)

#### Quick Chat → Send Button
- **Trigger:** Button click
- **What happens:** No `onClick` — plain `<button className="btn btn-p btn-sm">Send</button>` with no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)
- **[REVIEW: ROUTING]:** Intended: `POST /api/tickets/:selectedTicketId/messages` body `{content: msg}`. Would appear in Dealer Portal → Customer Tickets → ticket detail conversation. `selectedTicketId` must be set first (it isn't).
- **[REVIEW: NOTIFICATION]:** No dealer notification triggered.

#### Quick Chat → Create Support Ticket Button (callout banner)
- **Trigger:** Button click
- **What happens:** `showPage('new-ticket')`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → new-ticket page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all clients
- **Current state:** FUNCTIONAL (navigation)

---

## Page: settings — Settings

**[CONFIRMED BUG]:** Settings page renders a left-nav with three links ("My Profile", "Security", "Notifications"). Each link calls `setCustSettingsTab('cs-profile')`, `setCustSettingsTab('cs-security')`, `setCustSettingsTab('cs-notif')` respectively. The content panels check `custSettingsTab === "cstab-cs-profile"` etc. Since the set values never include the `cstab-` prefix, ALL content panels have `display: none` permanently. The settings page shows only the left-nav links with no content.

#### Settings → My Profile Tab Click
- **Trigger:** Click on "My Profile" link
- **What happens:** `setCustSettingsTab('cs-profile')` — sets state to `'cs-profile'`; display condition checks `'cstab-cs-profile'` — panel does NOT render
- **API call:** NONE
- **Data created/modified:** `custSettingsTab = 'cs-profile'` (non-matching value)
- **Where it lands:** Content panel remains hidden
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (prefix mismatch bug)

#### Settings → Security Tab Click
- **Trigger:** Click on "Security" link
- **What happens:** `setCustSettingsTab('cs-security')` — display checks `'cstab-cs-security'` — panel hidden
- **API call:** NONE
- **Current state:** NOT FUNCTIONAL (prefix mismatch bug)

#### Settings → Notifications Tab Click
- **Trigger:** Click on "Notifications" link
- **What happens:** `setCustSettingsTab('cs-notif')` — display checks `'cstab-cs-notif'` — panel hidden
- **API call:** NONE
- **Current state:** NOT FUNCTIONAL (prefix mismatch bug)

#### Settings → My Profile → Change Photo (file upload)
- **Trigger:** File selection via `<input type="file" id="cust-profile-input">`
- **What happens:** `updateCustProfile()` reads file via FileReader; updates `innerHTML` of DOM element `cust-profile-avatar` with `<img>` tag; also updates sidebar avatar `cust-avatar` DOM element
- **API call:** NONE — FileReader only, no server upload
- **Accepted types:** `image/*`
- **What record it attaches to:** None — DOM manipulation only, not persisted
- **Who can see it:** Only this browser session; lost on refresh
- **Where it lands:** DOM only — `#cust-profile-avatar` and `#cust-avatar`
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (FileReader DOM manipulation, not server upload) — also unreachable due to settings tab bug
- **[REVIEW: SECURITY]:** No server upload means no persistent profile photo. UI-only.

#### Settings → My Profile → Save (form fields)
- **Trigger:** Button click (not reachable due to tab bug, but defined in source)
- **What happens:** No API call; only photo upload handler exists (`updateCustProfile`); text fields (Full Name, Email, Phone) have no `onChange` handlers and are not bound to state
- **API call:** NONE
- **Data created/modified:** None
- **Current state:** NOT FUNCTIONAL (empty handler + tab bug)

#### Settings → Security → Update Password
- **Trigger:** Button click (not reachable due to tab bug)
- **What happens:** No `onClick` — plain button
- **API call:** NONE
- **Data created/modified:** None
- **Current state:** NOT FUNCTIONAL (no handler + tab bug)

#### Settings → Notifications → Save
- **Trigger:** Button click (not reachable due to tab bug)
- **What happens:** No `onClick` — plain button
- **API call:** NONE
- **Data created/modified:** None
- **Current state:** NOT FUNCTIONAL (no handler + tab bug)

---

## Cross-Portal Data Routing — Customer Portal

### Ticket Submission → Dealer Portal
- **Action:** Customer submits ticket via `handleSubmitTicket()` (only reachable in current code from `report-issue` page — but that page's Submit button is broken; `new-ticket` Submit also broken — see bugs above)
- **Intended flow:** `POST /api/tickets` → ticket record created with `dealer_id` foreign key → appears in Dealer Portal: Customer Tickets page
- **Dealer Portal location:** `customer-tickets` page, table columns: Ticket #, Subject, Category, Status, Last Update; visible to `dealer_owner` and `dealer_staff`
- **Operator Portal:** No confirmed routing. Tickets may be visible in a future operator support queue but no operator portal page currently shows customer tickets.
- **Current state:** Broken — no ticket can be successfully created from the Customer Portal UI
- **[REVIEW: NOTIFICATION]:** No WebSocket or email notification to dealer when ticket created.
- **[REVIEW: ROUTING]:** Operator visibility of customer tickets is undefined.

### Quick Chat Message → Dealer Portal
- **Action:** `handleSendChat()` posts `POST /api/tickets/:selectedTicketId/messages`
- **Intended flow:** Message attached to ticket → appears in Dealer Portal → Customer Tickets → ticket detail conversation thread
- **Dealer Portal location:** Customer Tickets → specific ticket detail → conversation messages (exact tab structure depends on DealerPortal implementation)
- **Current state:** Broken — Send button has no `onClick`; `selectedTicketId` may be null
- **[REVIEW: ROUTING]:** Whether chat messages and ticket messages use the same `messages` table/endpoint is unconfirmed.

### Claim Status View → Operator/Dealer Actions
- **Action:** Customer views `GET /api/claims` on claim-status page
- **Data source:** Claims created/processed by Dealer Portal (dealer creates claim) + status updated by Operator Portal (operator assigns FRC codes, logs manufacturer response, approves/denies lines)
- **Customer sees:** Claim #, Type, Status, Submitted date, Est. Value
- **Visual timeline (claim-detail):** 5 hardcoded steps — Submitted/Processing/Authorized/Repair/Complete; step highlighting is HARDCODED HTML, not driven by actual claim status field
- **Current state:** API fetch FUNCTIONAL; display HARDCODED
- **[REVIEW: ROUTING]:** Customer claim detail status should reflect `claims.status` field updated by operator actions (Submit to Manufacturer, Approve Line, Deny Line). None of those operator actions are functional yet.

---

## Customer Portal Summary Table

| Category | Count |
|---|---|
| Total actions documented | 52 |
| FUNCTIONAL | 16 |
| NOT FUNCTIONAL (no handler / empty handler) | 21 |
| HARDCODED display | 8 |
| FUNCTIONAL navigation, HARDCODED display | 7 |
| [REVIEW] items | 18 |
| Cross-portal flows identified | 3 |
| Confirmed bugs (source-verified) | 6 |

---
---

# DATA ROUTING SPEC — BIDDER PORTAL

**File:** `client/src/portals/BidderPortal.tsx`
**Route:** `/bidder` (inferred — not explicitly registered in routing config per inventory)
**Role:** `bidder` (auction participants only)
**Lines:** 836
**Architecture:** Standalone portal — no `MobileBottomNav`, no `OfflineBanner`. No `MobileBottomNav` import.

## Key Security Issue

**`isReadyToBid = cardAdded && (idUploaded || true)`**

The expression `(idUploaded || true)` always evaluates to `true` regardless of `idUploaded`. This means ID verification is permanently bypassed in the bidding readiness check. A bidder with only a card added (client-side only, no real Stripe call) is considered "ready to bid" with no actual verification of any kind. This is a UI-only gate with no server enforcement.

**[SECURITY: UI-only restriction — needs API enforcement]** — the backend must independently verify card-on-file status and ID verification status before allowing bid placement.

## Additional Architecture Notes

- Settings uses `settingsTab` (not `bSettingsTab` as listed in inventory) — tab IDs: `'st-profile'` (Security), `'st-notif'` (Notifications), `'st-account'` (Account). The inventory listed `bSettingsTab` and `bs-security/bs-notif/bs-account` — source uses `settingsTab` and `st-profile/st-notif/st-account`.
- My Bids page has an inner tab (`bidsTab`: `'active'` | `'history'`) not mentioned in inventory.
- Upcoming Auctions shows a HARDCODED unit preview table (6 units: PA-0201 through PA-0206) inline in JSX alongside the API-sourced `upcomingAuctions` mapped cards — both present simultaneously.
- Won Units uses `POST /api/payments/pay-invoice` with body `{bidId: w.id}` — inventory listed body as `{unitId, amount}` but source uses `{bidId}`.
- Payment page has additional actions not in inventory: "Replace Card" (sets `cardAdded=false`, `showCardForm=true`) and "Remove" (confirm dialog, then `setCardAdded(false)`).
- Settings → Security tab's "Update Password" actually has `onClick={() => alert('Password updated.')}` — it shows an alert but does no API call (still NOT FUNCTIONAL for actual password change).
- Settings → Notifications "Save Preferences" has `onClick={() => alert('Notification preferences saved.')}` — alert only, no API call.
- Settings → Account "Delete Account" has `onClick={() => alert('Please contact support@dealersuite360.com to delete your account.')}` — alert only.
- Countdown uses `calcCountdown(AUCTION_START)` on dashboard/upcoming (inventory said `AUCTION_END`) — source confirms it counts to `AUCTION_START` on the timer display.

---

## Global Header Actions

#### Header → Toggle Sidebar
- **Trigger:** Button click (hamburger icon)
- **What happens:** Toggles `sidebarCollapsed`; sidebar/main CSS classes update
- **API call:** NONE
- **Data created/modified:** Component state only
- **Where it lands:** Local UI
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all bidders
- **Current state:** FUNCTIONAL

#### Header → EN Language Toggle
- **Trigger:** Button click
- **What happens:** `handleSetLang('en')` → writes `ds360-lang = 'en'` to localStorage
- **API call:** NONE
- **Data created/modified:** localStorage
- **Current state:** FUNCTIONAL

#### Header → FR Language Toggle
- **Trigger:** Button click
- **What happens:** `handleSetLang('fr')` → writes `ds360-lang = 'fr'` to localStorage
- **API call:** NONE
- **Data created/modified:** localStorage
- **Current state:** FUNCTIONAL

#### Header → Dark Mode Toggle
- **Trigger:** Button click
- **What happens:** Toggles `theme`; sets `data-theme` on `document.documentElement`; writes `ds360-theme` to localStorage
- **API call:** NONE
- **Data created/modified:** localStorage `ds360-theme`
- **Current state:** FUNCTIONAL

#### Header → Live Auction Link (persistent header button)
- **Trigger:** Click on "Live Auction" `<a>` element in header
- **What happens:** `href="/live-auctions"` — browser navigation to live auctions page
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** `/live-auctions` route (external to BidderPortal)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Available to all bidders
- **Current state:** FUNCTIONAL (standard anchor navigation)

#### Sidebar Footer → Sign Out
- **Trigger:** Button click
- **What happens:** Calls `logout()` from `useAuth()`; then `window.location.href = '/'`
- **API call:** Via `useAuth` hook
- **Data created/modified:** Auth tokens cleared
- **Where it lands:** Redirects to homepage
- **Current state:** FUNCTIONAL (depends on useAuth)

#### Sidebar Footer → Avatar click
- **Trigger:** Click on user info area in sidebar footer
- **What happens:** `showPage('profile')`
- **API call:** NONE
- **Data created/modified:** None
- **Current state:** FUNCTIONAL (navigation)

---

## Page: dashboard — Dashboard

#### Dashboard → Countdown Timer (auto)
- **Trigger:** `setInterval` every 1000ms (mounted once on component load)
- **What happens:** `calcCountdown(AUCTION_START)` recalculates days/hours/minutes/seconds; updates `countdown` state
- **API call:** NONE
- **Data created/modified:** `countdown` object in state
- **Where it lands:** Countdown display cards on dashboard and upcoming pages
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Always active regardless of page
- **Current state:** FUNCTIONAL

#### Dashboard → Page Load (useEffect)
- **Trigger:** `activePage` changes to `'dashboard'`
- **What happens:** Fetches upcoming auctions and bid history
- **API call:** `GET /api/public-auctions/upcoming` → sets `upcomingAuctions`; `GET /api/auctions/my-bids` → sets `myBids`
- **Data created/modified:** `upcomingAuctions`, `myBids` in state
- **Where it lands:** Stat cards (Active Bids count from `myBids`, Units Won count from `wonUnits` — but `wonUnits` is not fetched on dashboard, only on `won-units` page, so Units Won stat card shows `0` always)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Scoped to this bidder's bids server-side
- **Current state:** FUNCTIONAL
- **[REVIEW]:** `wonUnits` not fetched on dashboard — "Units Won" stat card uses hardcoded `0` value. [REVIEW: BUSINESS LOGIC]

#### Dashboard → Account Readiness Banner → Complete button
- **Trigger:** Button click ("Complete") on warning banner (shown when `!isReadyToBid`)
- **What happens:** `showPage(!cardAdded ? 'payment' : 'verification')` — routes to whichever step is incomplete
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Customer Portal → payment page or verification page
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Conditional on `!isReadyToBid`
- **Current state:** FUNCTIONAL (navigation) — but `isReadyToBid` is always `true` once `cardAdded=true` due to the `|| true` bypass **[SECURITY: UI-only restriction — needs API enforcement]**

#### Dashboard → Ready Banner → View Auction
- **Trigger:** Button click ("View Auction") on green ready banner
- **What happens:** `window.location.href = '/live-auctions'`
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** `/live-auctions` route
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Shown when `isReadyToBid && cardAdded`
- **Current state:** FUNCTIONAL

#### Dashboard → Account Status: Add Card (inline link)
- **Trigger:** Click on "Add Card" badge in Account Status panel
- **What happens:** `showPage('payment')`
- **API call:** NONE
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Account Status: Upload ID (inline link)
- **Trigger:** Click on "Upload ID" badge in Account Status panel
- **What happens:** `showPage('verification')`
- **API call:** NONE
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Next Auction: View Auction Page
- **Trigger:** Button click
- **What happens:** `window.location.href = '/live-auctions'`
- **API call:** NONE
- **Current state:** FUNCTIONAL

#### Dashboard → Next Auction: Full Schedule
- **Trigger:** Button click
- **What happens:** `showPage('upcoming')`
- **API call:** NONE
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Quick Actions: View Live Auction
- **Trigger:** Button click
- **What happens:** `window.location.href = '/live-auctions'`
- **API call:** NONE
- **Current state:** FUNCTIONAL

#### Dashboard → Quick Actions: Add Credit Card (conditional)
- **Trigger:** Button click (shown when `!cardAdded`)
- **What happens:** `showPage('payment')`
- **API call:** NONE
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Quick Actions: Upload ID (conditional)
- **Trigger:** Button click (shown when `!idUploaded`)
- **What happens:** `showPage('verification')`
- **API call:** NONE
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → Quick Actions: Upcoming Auctions
- **Trigger:** Button click
- **What happens:** `showPage('upcoming')`
- **API call:** NONE
- **Current state:** FUNCTIONAL (navigation)

#### Dashboard → WebSocket subscription
- **Trigger:** `activePage === 'my-bids'` (only fires when on my-bids page, not dashboard)
- **What happens:** `wsClient.on('auction:bid', callback)` — prepends new bid to `myBids`
- **API call:** NONE (WebSocket)
- **Data created/modified:** `myBids` array prepended with new payload
- **Where it lands:** My Bids table (real-time update when on that page)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Scoped to this bidder's session
- **Current state:** FUNCTIONAL (WebSocket wired) — only active when `activePage === 'my-bids'`

---

## Page: profile — My Profile

#### Profile → Profile Photo Upload
- **Trigger:** File selection via `<input type="file" accept="image/*">`
- **What happens:** `updateAvatar()` — reads file via FileReader; updates `innerHTML` of `#bidder-avatar` (profile page) and `#bidder-avatar-sidebar` (sidebar) with `<img>` tag
- **API call:** NONE — FileReader only, no server upload
- **Accepted types:** `image/*`
- **What record it attaches to:** None — DOM only, lost on refresh
- **Who can see it:** This browser session only
- **Where it lands:** DOM elements `#bidder-avatar` and `#bidder-avatar-sidebar`
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** NOT FUNCTIONAL for storage (FileReader DOM manipulation only)
- **[REVIEW: SECURITY]:** No server upload — photo cannot be reviewed by operator for verification purposes.

#### Profile → First Name Input
- **Trigger:** Text input
- **What happens:** `setFirstName(e.target.value)` — controlled input
- **API call:** NONE
- **Data created/modified:** `firstName` state — also reactively updates sidebar display name `${firstName} ${lastName}`
- **Current state:** FUNCTIONAL (state update)

#### Profile → Last Name Input
- **Trigger:** Text input
- **What happens:** `setLastName(e.target.value)` — controlled input; updates sidebar name display
- **API call:** NONE
- **Data created/modified:** `lastName` state
- **Current state:** FUNCTIONAL (state update)

#### Profile → Email Input
- **Trigger:** Text input
- **What happens:** `setEmail(e.target.value)`
- **API call:** NONE
- **Data created/modified:** `email` state — also used in Settings Account tab display
- **Current state:** FUNCTIONAL (state update)

#### Profile → Phone Input
- **Trigger:** Text input
- **What happens:** `setPhone(e.target.value)`
- **API call:** NONE
- **Data created/modified:** `phone` state
- **Current state:** FUNCTIONAL (state update)

#### Profile → Address Input
- **Trigger:** Text input
- **What happens:** `setAddress(e.target.value)`
- **API call:** NONE
- **Data created/modified:** `address` state
- **Current state:** FUNCTIONAL (state update)

#### Profile → City Input
- **Trigger:** Text input
- **What happens:** `setCity(e.target.value)`
- **API call:** NONE
- **Data created/modified:** `city` state
- **Current state:** FUNCTIONAL (state update)

#### Profile → Province Select
- **Trigger:** Select change
- **What happens:** `setProvince(e.target.value)` — options: AB BC MB NB NL NS NT NU ON PE QC SK YT
- **API call:** NONE
- **Data created/modified:** `province` state
- **Current state:** FUNCTIONAL (state update)

#### Profile → Postal Code Input
- **Trigger:** Text input
- **What happens:** `setPostal(e.target.value)`
- **API call:** NONE
- **Data created/modified:** `postal` state
- **Current state:** FUNCTIONAL (state update)

#### Profile → Save Changes Button
- **Trigger:** Button click
- **What happens:** `handleSaveProfile()` — sets `profileSaved = true`; `setTimeout(() => setProfileSaved(false), 3000)`; button text changes to "✓ Saved" for 3 seconds then reverts; NO API call
- **API call:** NONE
- **Data created/modified:** `profileSaved` boolean (resets after 3s); form values NOT persisted to any server
- **Where it lands:** UI only — profile data is lost on page refresh or navigation away
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** NOT FUNCTIONAL (client-side state only, no persistence)
- **[REVIEW: ROUTING]:** No operator sees this profile data. Profile name/address not submitted anywhere. Required for KYC/verification.

#### Profile → Clear Button
- **Trigger:** Button click ("Clear")
- **What happens:** Resets all form state: `setFirstName('')`, `setLastName('')`, `setEmail('')`, `setPhone('')`, `setAddress('')`, `setCity('')`, `setProvince('')`, `setPostal('')`
- **API call:** NONE
- **Data created/modified:** All profile state fields cleared
- **Where it lands:** Sidebar name display reverts to "Jane Doe"
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** FUNCTIONAL (state clear)

---

## Page: verification — Verification

**Security context:** `isReadyToBid = cardAdded && (idUploaded || true)` — the `|| true` makes ID verification permanently bypassed in the readiness check. Even if `idUploaded = false`, a bidder with a card (client-side only) is considered ready. **[SECURITY: UI-only restriction — needs API enforcement]**

#### Verification → Page Load
- **Trigger:** `activePage` changes to `'verification'`
- **What happens:** No API fetch for this page; renders status based on `idUploaded` and `addrUploaded` boolean state
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** Status banner shows "Verification Required" or "Documents Under Review" based on `idUploaded`
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** HARDCODED/state-only display

#### Verification → Government ID Upload
- **Trigger:** File selection via `<input type="file" accept="image/*,.pdf">`
- **What happens:** `handleFileUpload('id')` — sets `idUploaded = true`; NO FileReader, NO server upload; just a boolean flag change
- **API call:** NONE
- **Accepted types:** `image/*`, `.pdf`; max size displayed as "10 MB" (not enforced)
- **What record it attaches to:** Nothing — boolean flag only, lost on refresh
- **Who can see it:** Nobody — no server upload occurs
- **Where it lands:** `idUploaded` state → updates status banner, sidebar nav badge, dashboard Account Status panel
- **Notifications triggered:** None
- **Status changes:** `idUploaded = true` — shown as "Under Review" in dashboard Account Status
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** NOT FUNCTIONAL for actual verification (boolean flag only, no server upload)
- **[REVIEW: SECURITY]:** File is never sent to server. Operator cannot review ID. The "Under Review" status is false — no actual review is happening. **[SECURITY: UI-only restriction — needs API enforcement]**
- **[REVIEW: ROUTING]:** Intended: file uploaded to secure storage → operator sees new verification request in Operator Portal → Users & Roles or a dedicated Verification queue. No such routing exists.

#### Verification → Government ID Remove Button (after upload)
- **Trigger:** Button click ("Remove") — shown when `idUploaded = true`
- **What happens:** `setIdUploaded(false)` — resets boolean flag
- **API call:** NONE
- **Data created/modified:** `idUploaded = false`
- **Where it lands:** Status banner reverts to "Verification Required"; sidebar badge reappears; dashboard status resets
- **Notifications triggered:** None
- **Status changes:** `idUploaded = false`
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** FUNCTIONAL (state reset — but no real document was uploaded to remove)

#### Verification → Proof of Address Upload
- **Trigger:** File selection via `<input type="file" accept="image/*,.pdf">`
- **What happens:** `handleFileUpload('addr')` — sets `addrUploaded = true`; boolean only
- **API call:** NONE
- **Accepted types:** `image/*`, `.pdf`; max 10MB (not enforced)
- **What record it attaches to:** Nothing
- **Who can see it:** Nobody
- **Where it lands:** `addrUploaded` state → updates "Proof of Address" status badge on verification page
- **Notifications triggered:** None
- **Status changes:** `addrUploaded = true`
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** NOT FUNCTIONAL for verification (boolean flag only)
- **[REVIEW: SECURITY]:** Same issue as government ID — no server upload. **[SECURITY: UI-only restriction — needs API enforcement]**

#### Verification → Proof of Address Remove Button
- **Trigger:** Button click ("Remove") — shown when `addrUploaded = true`
- **What happens:** `setAddrUploaded(false)`
- **API call:** NONE
- **Data created/modified:** `addrUploaded = false`
- **Current state:** FUNCTIONAL (state reset)

---

## Page: payment — Payment & Card

#### Payment → Page Load (useEffect)
- **Trigger:** `activePage` changes to `'payment'`
- **What happens:** Fetches saved payment methods
- **API call:** `GET /api/payments/methods` → sets `paymentMethods`
- **Data created/modified:** `paymentMethods` in state
- **Where it lands:** "Saved Payment Methods" section — but this section is not rendered in current source; source shows either the "card added" success state or the add-card form based on `cardAdded` boolean, NOT from `paymentMethods` array
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** FUNCTIONAL API call — but `paymentMethods` array is not rendered anywhere in the source
- **[REVIEW: BUSINESS LOGIC]:** `paymentMethods` fetched but never displayed. The payment page is driven entirely by the client-side `cardAdded` boolean. [REVIEW]

#### Payment → Add Credit Card Button (no card state)
- **Trigger:** Button click ("+ Add Credit Card") — shown when `!cardAdded && !showCardForm`
- **What happens:** `setShowCardForm(true)` — reveals card form
- **API call:** NONE
- **Data created/modified:** `showCardForm = true`
- **Where it lands:** Card form renders in place
- **Current state:** FUNCTIONAL (state toggle)

#### Payment → Cardholder Name Input
- **Trigger:** Text input
- **What happens:** `setCardName(e.target.value)`
- **API call:** NONE
- **Data created/modified:** `cardName` state
- **Current state:** FUNCTIONAL (state update)

#### Payment → Card Number Input
- **Trigger:** Text input (maxLength 19)
- **What happens:** `setCardNum(e.target.value)`
- **API call:** NONE
- **Data created/modified:** `cardNum` state — last 4 digits displayed in saved card view
- **Current state:** FUNCTIONAL (state update)

#### Payment → Expiry Input
- **Trigger:** Text input (maxLength 7, format MM / YY)
- **What happens:** `setCardExp(e.target.value)`
- **API call:** NONE
- **Data created/modified:** `cardExp` state
- **Current state:** FUNCTIONAL (state update)

#### Payment → CVV Input
- **Trigger:** Text input (maxLength 4)
- **What happens:** `setCardCvv(e.target.value)`
- **API call:** NONE
- **Data created/modified:** `cardCvv` state
- **Current state:** FUNCTIONAL (state update)

#### Payment → Save Card Button
- **Trigger:** Button click ("Save Card")
- **What happens:** `handleAddCard()` — validates all 4 fields non-empty; if invalid: `alert('Please fill in all card fields.')` and returns; if valid: sets `cardAdded = true`, `setShowCardForm(false)`, `alert('Card added successfully. You are ready to bid!')` — NO API call, NO Stripe tokenization
- **API call:** NONE — card data is stored in component state only (plaintext in memory)
- **Data created/modified:** `cardAdded = true`, `showCardForm = false`, `cardName/Num/Exp/Cvv` in state
- **Where it lands:** "Saved card" view renders with last 4 digits of `cardNum`; dashboard Account Status shows "Card on File: Yes"; `isReadyToBid` becomes `true` (due to `|| true` bypass)
- **Notifications triggered:** `alert()` dialog only; no server event
- **Status changes:** `cardAdded = true`
- **KPI impact:** None server-side
- **Role restrictions:** Bidder only
- **Current state:** NOT FUNCTIONAL — no Stripe API call, no server storage, card data in memory only
- **[REVIEW: SECURITY]:** Raw card number entered into React state with no PCI compliance, no Stripe Elements, no tokenization. This is a critical security gap if ever connected to real card processing. **[SECURITY: UI-only restriction — needs API enforcement]**
- **[REVIEW: ROUTING]:** Intended: Stripe tokenize → `POST /api/payments/methods` → Operator can see card-on-file status in Dealer Detail → Wallet tab or Bidder management page (neither exists yet).

#### Payment → Cancel Button (card form)
- **Trigger:** Button click ("Cancel")
- **What happens:** `setShowCardForm(false)` — hides card form
- **API call:** NONE
- **Data created/modified:** `showCardForm = false`
- **Current state:** FUNCTIONAL (state toggle)

#### Payment → Replace Card Button (card on file state)
- **Trigger:** Button click ("Replace Card") — shown when `cardAdded = true`
- **What happens:** `setCardAdded(false)`, `setShowCardForm(true)` — removes card state and shows new card form
- **API call:** NONE
- **Data created/modified:** `cardAdded = false`, `showCardForm = true`
- **Current state:** FUNCTIONAL (state change)

#### Payment → Remove Card Button (card on file state)
- **Trigger:** Button click ("Remove") — shown when `cardAdded = true`
- **What happens:** `confirm('Remove card? You will not be able to bid without a card on file.')` dialog; if confirmed: `setCardAdded(false)`
- **API call:** NONE
- **Data created/modified:** `cardAdded = false` on confirm; dashboard status reverts to "Add Card"
- **Where it lands:** `isReadyToBid` becomes `false` if `cardAdded = false` (note: `idUploaded || true` is still true, so `false && true = false`)
- **Notifications triggered:** Browser `confirm()` dialog
- **Status changes:** `cardAdded = false`
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** FUNCTIONAL (state change — but no server removal since no card was stored)

---

## Page: upcoming — Upcoming Auctions

#### Upcoming Auctions → Page Load (useEffect)
- **Trigger:** `activePage` changes to `'upcoming'`
- **What happens:** Fetches upcoming auctions
- **API call:** `GET /api/public-auctions/upcoming` → sets `upcomingAuctions`
- **Data created/modified:** `upcomingAuctions` in state
- **Where it lands:** The "Unit Preview" section below the hero — BUT the unit preview table is HARDCODED (6 units PA-0201 to PA-0206), not from `upcomingAuctions`. `upcomingAuctions` would only render in a `map()` call if the array has items, but the source shows a hardcoded table plus the API-sourced map (which would render after the hardcoded section if items exist).
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** FUNCTIONAL API call; unit preview display is HARDCODED

#### Upcoming Auctions → Countdown (auto)
- **Trigger:** setInterval (always running)
- **What happens:** Updates countdown to `AUCTION_START`
- **API call:** NONE
- **Current state:** FUNCTIONAL

#### Upcoming Auctions → View Auction Page Button (hero)
- **Trigger:** Button click
- **What happens:** `window.location.href = '/live-auctions'`
- **API call:** NONE
- **Current state:** FUNCTIONAL

#### Upcoming Auctions → Add Card to Bid Button (conditional, shown when `!cardAdded`)
- **Trigger:** Button click
- **What happens:** `showPage('payment')`
- **API call:** NONE
- **Current state:** FUNCTIONAL (navigation)

#### Upcoming Auctions → Register Interest (per auction card from API)
- **Trigger:** Button click ("Register Interest") — rendered on mapped `upcomingAuctions` cards
- **What happens:** No `onClick` — inventory listed this as NOT FUNCTIONAL; source confirms no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)
- **[REVIEW: ROUTING]:** Intended: register bidder interest for a specific auction → Operator sees interested bidders count. Not implemented.

#### Upcoming Auctions → Past Auctions Table
- **Trigger:** Page renders
- **What happens:** Renders HARDCODED rows (Apr 2026: 8 listed/6 sold, Mar 2026: 5/4, Feb 2026: 7/5)
- **API call:** NONE
- **Current state:** HARDCODED

---

## Page: my-bids — My Bids

#### My Bids → Page Load (useEffect)
- **Trigger:** `activePage` changes to `'my-bids'`
- **What happens:** Fetches bid history
- **API call:** `GET /api/auctions/my-bids` → sets `myBids`
- **Data created/modified:** `myBids` in state
- **Where it lands:** "Bid History" tab table — columns: Auction, Unit, Your Bid, Final Price, Result, Date
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Scoped to this bidder server-side
- **Current state:** FUNCTIONAL

#### My Bids → WebSocket (live bid updates)
- **Trigger:** `activePage === 'my-bids'` — subscription active on this page
- **What happens:** `wsClient.on('auction:bid', callback)` — prepends new bid payload to `myBids`
- **API call:** NONE (WebSocket)
- **Data created/modified:** `myBids` prepended
- **Where it lands:** Bid History table updates in real-time
- **Notifications triggered:** None (inbound push, not outbound notification)
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** FUNCTIONAL (WebSocket wired)
- **[REVIEW]:** WebSocket event `auction:bid` pushes to `myBids` — it is unclear whether this contains only this bidder's bids or all auction bids. Server must scope to bidder_id. [REVIEW: SECURITY]

#### My Bids → Active Tab
- **Trigger:** Tab click ("Active (0)")
- **What happens:** `setBidsTab('active')` — shows empty state panel: "No active bids — the auction is not currently live."
- **API call:** NONE
- **Data created/modified:** `bidsTab = 'active'`
- **Where it lands:** Empty state display
- **Current state:** FUNCTIONAL (tab switch)

#### My Bids → Bid History Tab
- **Trigger:** Tab click ("Bid History (2)")
- **What happens:** `setBidsTab('history')` — shows `myBids` mapped table
- **API call:** NONE
- **Data created/modified:** `bidsTab = 'history'`
- **Current state:** FUNCTIONAL (tab switch)

#### My Bids → Increase Bid (per row)
- **Trigger:** Button click — NOT PRESENT in source; inventory listed "Increase Bid → NOT FUNCTIONAL" but source only shows Active/History tabs and the history table has no per-row action buttons
- **What happens:** N/A
- **API call:** NONE
- **Current state:** NOT FUNCTIONAL — button not present in current source
- **[REVIEW]:** Inventory discrepancy — action listed but not in source. [REVIEW]

#### My Bids → Withdraw Bid (per row)
- **Trigger:** Button click — NOT PRESENT in source
- **What happens:** N/A
- **API call:** NONE
- **Current state:** NOT FUNCTIONAL — button not present in current source
- **[REVIEW]:** Same as above. [REVIEW]

---

## Page: won-units — Won Units

#### Won Units → Page Load (useEffect)
- **Trigger:** `activePage` changes to `'won-units'`
- **What happens:** Fetches won units
- **API call:** `GET /api/auctions/my-bids?won=true` → sets `wonUnits`
- **Data created/modified:** `wonUnits` in state
- **Where it lands:** Won units card list — each card shows: unit description, auction code, winning bid, $250 hold status, payment status, payment window (72hr for unpaid)
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Scoped to this bidder
- **Current state:** FUNCTIONAL

#### Won Units → Complete Payment (per unit — unpaid)
- **Trigger:** Button click ("Complete Payment") — shown when `!isPaid`
- **What happens:** `apiFetch('/api/payments/pay-invoice', { method: 'POST', body: JSON.stringify({ bidId: w.id }) })` — triggers payment; on failure: `alert('Payment failed. Please try again.')` with no error detail
- **API call:** `POST /api/payments/pay-invoice` body: `{bidId: w.id}` (NOTE: inventory listed body as `{unitId, amount}` — actual source uses `{bidId: w.id}`)
- **Data created/modified:** Payment record created; unit payment status updated on server
- **Where it lands:**
  - Operator Portal: Billing & Invoices page — invoice status should update to paid; Revenue Reports MTD figure increases
  - Dealer Portal: The winning dealer should receive notification that their unit has been paid for (routing not confirmed)
  - Bidder Portal: `wonUnits` is not automatically refreshed after payment — bidder must navigate away and back to see updated status
- **Notifications triggered:** [TODO: Notification not wired] — No WebSocket or notification event triggered client-side; Operator notification expected but not implemented
- **Status changes:** Unit payment status: unpaid → paid (server-side, if endpoint handles it); no client-side state refresh after successful call
- **KPI impact:** Revenue MTD in Operator Dashboard; won-units count; $250 hold applied to purchase
- **Role restrictions:** Bidder only; must be owner of the bid
- **Current state:** FUNCTIONAL (API call is wired)
- **[REVIEW: ROUTING]:** After `POST /api/payments/pay-invoice` succeeds, no `GET /api/auctions/my-bids?won=true` re-fetch occurs. UI does not update. [REVIEW: BUSINESS LOGIC]
- **[REVIEW: NOTIFICATION]:** Operator and dealer should be notified of payment. Not wired. [REVIEW: NOTIFICATION]
- **[REVIEW: SECURITY]:** No card validation on server side before payment — `cardAdded` is client-side only. Server must verify actual Stripe payment method exists. **[SECURITY: UI-only restriction — needs API enforcement]**

#### Won Units → Apply for Financing (per unit — unpaid)
- **Trigger:** Button click ("Apply for Financing") — shown when `!isPaid`
- **What happens:** `alert('Financing application will be available when connected to lender API.')` — no navigation, no API call
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** Browser `alert()` only
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** NOT FUNCTIONAL (alert placeholder only)

#### Won Units → View Documents (per unit — paid)
- **Trigger:** Button click ("View Documents") — shown when `isPaid`
- **What happens:** No `onClick` — plain button with no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

#### Won Units → Download Receipt (per unit — paid)
- **Trigger:** Button click ("Download Receipt") — shown when `isPaid`
- **What happens:** No `onClick` — plain button with no handler
- **API call:** NONE
- **Data created/modified:** None
- **Where it lands:** N/A
- **Notifications triggered:** None
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** N/A
- **Current state:** NOT FUNCTIONAL (no handler)

---

## Page: settings — Settings

**Note:** Source uses `settingsTab` state (not `bSettingsTab` as documented in inventory). Tab IDs used in source: `'st-profile'` (renders Security content), `'st-notif'` (Notifications), `'st-account'` (Account). Initial tab is `'st-profile'`. Tab switching works correctly — NO prefix mismatch bug (unlike CustomerPortal). Settings sub-pages DO render.

#### Settings → Security Tab Click
- **Trigger:** Tab click ("Security")
- **What happens:** `setSettingsTab('st-profile')` — Security content panel renders
- **API call:** NONE
- **Data created/modified:** `settingsTab = 'st-profile'`
- **Current state:** FUNCTIONAL (tab switch works correctly)

#### Settings → Notifications Tab Click
- **Trigger:** Tab click ("Notifications")
- **What happens:** `setSettingsTab('st-notif')` — Notifications content panel renders
- **API call:** NONE
- **Data created/modified:** `settingsTab = 'st-notif'`
- **Current state:** FUNCTIONAL (tab switch works correctly)

#### Settings → Account Tab Click
- **Trigger:** Tab click ("Account")
- **What happens:** `setSettingsTab('st-account')` — Account content panel renders
- **API call:** NONE
- **Data created/modified:** `settingsTab = 'st-account'`
- **Current state:** FUNCTIONAL (tab switch works correctly)

#### Settings → Security: Current Password Input
- **Trigger:** Text input (type="password")
- **What happens:** Uncontrolled input — no state binding
- **API call:** NONE
- **Current state:** NOT FUNCTIONAL (no state binding)

#### Settings → Security: New Password Input
- **Trigger:** Text input (type="password")
- **What happens:** Uncontrolled input
- **API call:** NONE
- **Current state:** NOT FUNCTIONAL (no state binding)

#### Settings → Security: Confirm New Password Input
- **Trigger:** Text input (type="password")
- **What happens:** Uncontrolled input
- **API call:** NONE
- **Current state:** NOT FUNCTIONAL (no state binding)

#### Settings → Security: Update Password Button
- **Trigger:** Button click
- **What happens:** `alert('Password updated.')` — browser alert only; NO API call; no validation of current password
- **API call:** NONE
- **Data created/modified:** Nothing
- **Where it lands:** N/A
- **Notifications triggered:** Browser `alert()` only
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** NOT FUNCTIONAL (alert stub, no API call)

#### Settings → Notifications: Toggle checkboxes (5 toggles)
- **Trigger:** Checkbox click (Auction reminders, Outbid alerts, Auction results, Payment reminders, New unit previews)
- **What happens:** `defaultChecked` set — uncontrolled checkboxes, state not captured
- **API call:** NONE
- **Data created/modified:** None
- **Current state:** NOT FUNCTIONAL (uncontrolled inputs)

#### Settings → Notifications: Save Preferences Button
- **Trigger:** Button click
- **What happens:** `alert('Notification preferences saved.')` — browser alert only; NO API call
- **API call:** NONE
- **Data created/modified:** Nothing
- **Notifications triggered:** Browser `alert()` only
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** NOT FUNCTIONAL (alert stub)

#### Settings → Account: Email display
- **Trigger:** Page renders
- **What happens:** Displays `{email || 'jane@example.com'}` — reads from `email` state set on Profile page
- **API call:** NONE
- **Data created/modified:** None (display only)
- **Current state:** FUNCTIONAL (state display)

#### Settings → Account: Log Out Button
- **Trigger:** Button click
- **What happens:** `confirm('Log out?')` — if confirmed: `window.location.href = '/live-auctions'` — redirects to live auctions (NOT to homepage or login). Does NOT call `logout()` from `useAuth()`
- **API call:** NONE — no token invalidation
- **Data created/modified:** Nothing server-side; tokens remain valid
- **Where it lands:** Redirects to `/live-auctions`
- **Notifications triggered:** Browser `confirm()` only
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** NOT FUNCTIONAL — redirects to wrong URL, does not invalidate session
- **[REVIEW: SECURITY]:** Does not call `logout()` from `useAuth()`. Auth tokens remain active. This is different from the sidebar Sign Out button which properly calls `logout()`. **[SECURITY: UI-only restriction — needs API enforcement]**

#### Settings → Account: Delete Account Button
- **Trigger:** Button click
- **What happens:** `alert('Please contact support@dealersuite360.com to delete your account.')` — browser alert only
- **API call:** NONE
- **Data created/modified:** Nothing
- **Notifications triggered:** Browser `alert()` only
- **Status changes:** None
- **KPI impact:** None
- **Role restrictions:** Bidder only
- **Current state:** NOT FUNCTIONAL (alert stub)

---

## Cross-Portal Data Routing — Bidder Portal

### Bidder Registration → Operator Portal
- **Action:** Bidder creates account and accesses portal (registration flow not within BidderPortal.tsx — assumed to be a separate signup page)
- **Intended flow:** New bidder record → Operator Portal: Users & Roles page or a dedicated Bidder Management page
- **Operator Portal location:** Currently no dedicated bidder management page confirmed in OperatorPortal inventory. Bidder users would need a new section.
- **Current state:** Not implemented in this portal
- **[REVIEW: ROUTING]:** Where does the operator see new bidder registrations? No page exists for this. [REVIEW: ROUTING]

### Bidder ID Upload → Operator Verification
- **Action:** Bidder uploads government ID via `handleFileUpload('id')`
- **Intended flow:** File uploads to secure storage → Operator receives notification → Operator reviews and approves/denies in verification queue
- **Operator Portal location:** No confirmed destination — OperatorPortal does not have a "Verification" or "Bidder KYC" page in current inventory
- **Current state:** NOT FUNCTIONAL — no upload occurs; boolean flag only
- **[REVIEW: ROUTING]:** Critical gap for KYC compliance. [REVIEW: ROUTING] [REVIEW: SECURITY]

### Bidder Pays for Won Unit → Operator Invoices
- **Action:** `POST /api/payments/pay-invoice` with `{bidId: w.id}`
- **Intended flow:** Payment processed via Stripe → Invoice status updated → Operator Portal: Billing & Invoices shows paid status; Revenue Reports MTD increases; Dealer is notified unit is paid for
- **Operator Portal location:** Billing & Invoices page — invoice table for this unit's transaction
- **Dealer Portal location:** The selling dealer should see payment confirmation. No confirmed routing exists in DealerPortal for auction sale notifications.
- **Current state:** API call FUNCTIONAL — downstream effects (invoice update, operator notification, dealer notification, page refresh) NOT FUNCTIONAL
- **[REVIEW: NOTIFICATION]:** No notification chain implemented. [REVIEW: NOTIFICATION]
- **[REVIEW: ROUTING]:** Dealer identity is hidden in auction listings (per role context spec). After payment, how does dealer receive transfer documents? Not specified. [REVIEW: ROUTING]

### Bidder Places Bid → Operator/Dealer Visibility
- **Action:** Bid placement (no bid placement UI exists in BidderPortal — only bid history viewing and payment for won units)
- **Intended flow:** Bid placed on `/live-auctions` page → Operator sees bids in real-time; Dealer sees their unit has bids (dealer identity hidden from bidder)
- **Current state:** Bid placement is entirely outside BidderPortal. BidderPortal only shows bid history via `GET /api/auctions/my-bids`.
- **[REVIEW: ROUTING]:** BidderPortal has no bid-placement UI. The actual bid action happens on `/live-auctions`. [REVIEW: ROUTING]

---

## Bidder Portal Summary Table

| Category | Count |
|---|---|
| Total actions documented | 55 |
| FUNCTIONAL | 22 |
| NOT FUNCTIONAL (no handler / alert stub / client-side only) | 24 |
| HARDCODED display | 4 |
| FUNCTIONAL navigation | 5 |
| [REVIEW] items | 19 |
| [SECURITY] flags | 5 |
| Cross-portal flows identified | 4 |
| Confirmed bugs (source-verified) | 4 |

---

## Source vs Inventory Discrepancies — Bidder Portal

| Item | Inventory Says | Source Confirms |
|---|---|---|
| Settings state var | `bSettingsTab` | `settingsTab` |
| Settings tab IDs | `bs-security`, `bs-notif`, `bs-account` | `st-profile`, `st-notif`, `st-account` |
| Settings tab bug | Listed as NOT FUNCTIONAL | FUNCTIONAL — no prefix mismatch; tabs work |
| Pay Now body | `{unitId, amount}` | `{bidId: w.id}` |
| Countdown target | `AUCTION_END` | `AUCTION_START` (dashboard/upcoming countdown counts to auction START) |
| Won Units columns | "Unit, VIN, Winning Bid, Auction Date, Payment Status, Actions" | Cards, not table rows; shows unit description, auction code, bid amount, $250 hold, payment window |
| My Bids per-row actions | "Increase Bid, Withdraw Bid" (both NOT FUNCTIONAL) | No per-row buttons exist in source — Active tab empty state only |
| Update Password | "NOT FUNCTIONAL — empty handler" | `alert('Password updated.')` — alert stub |
| Save Notifications | "NOT FUNCTIONAL — empty handler" | `alert('Notification preferences saved.')` — alert stub |
| Delete Account | "alert() — NOT FUNCTIONAL" | `alert('Please contact support@dealersuite360.com...')` — correct |
| Settings Log Out | Not mentioned | `confirm()` + redirect to `/live-auctions` — does NOT call `logout()` |
| Upcoming: unit preview | "auction cards from API" | HARDCODED 6-unit table always present plus API-mapped cards |
| Profile: Phone field | listed | Present in source but listed AFTER address section, not in same row as email |

---

# COMBINED SUMMARY — ALL 4 PORTALS

## 1. Total Actions Documented

| Portal | Total Actions |
|---|---|
| Operator Portal | 91 |
| Dealer Portal | 79 |
| Customer Portal | 52 |
| Bidder Portal | 55 |
| **TOTAL** | **277** |

## 2. Functional vs Non-Functional

| State | Count | % of Total |
|---|---|---|
| FUNCTIONAL (real API call, working) | 79 | 29% |
| NOT FUNCTIONAL (empty handler / no API) | 119 | 43% |
| HARDCODED (static data, needs API) | 26 | 9% |
| UNVERIFIED ENDPOINT | 13 | 5% |
| Navigation-only (always functional) | 40 | 14% |

**Platform functional completion: ~29% of interactive actions are wired to real data.**

## 3. [REVIEW] Items Needing Jonathan's Input

| Portal | [REVIEW] Count |
|---|---|
| Operator Portal | 42 |
| Dealer Portal | 38 |
| Customer Portal | 18 |
| Bidder Portal | 19 |
| **TOTAL** | **117** |

## 4. Cross-Portal Data Flows Identified

| Flow | Source Portal | Destination Portal(s) |
|---|---|---|
| Claim status update | Operator | Dealer → Claim Detail; Customer → Claim Status |
| Claim line approve/deny | Operator | Dealer → Claim Detail lines; Customer → status timeline |
| Submit to Manufacturer | Operator | Dealer → timeline step; Customer → simplified status |
| Log Manufacturer Response | Operator | Dealer → Claim # / Preauth # fields |
| Flag Photo | Operator | Dealer → re-upload prompt |
| Send Invoice | Operator | Dealer Owner → Invoices & Billing |
| Mark Invoice Paid | Operator | Dealer Owner → Invoices (status); wallet balance |
| Suspend Dealer | Operator | Dealer Portal blocked; Customer Portal blocked |
| Push to Claim (batch upload) | Dealer | Operator → Processing Queue |
| Add Unit | Dealer | Operator → Unit Inventory |
| Invite Customer | Dealer | Customer → portal access granted |
| Submit Ticket | Customer | Dealer → Customer Tickets list |
| Dealer Reply on Ticket | Dealer | Customer → Ticket Detail messages |
| Bid Placed | Bidder (via `/live-auctions`) | Operator → auction moderation; Dealer → listing bid count |
| Payment for Won Unit | Bidder | Operator → transaction record |

**Total unique cross-portal flows: 15**

## 5. Notifications That Need Wiring

| Trigger | Who Gets Notified | Status |
|---|---|---|
| Operator assigns claim | Dealer Owner/Staff | NOT FUNCTIONAL |
| Operator submits to manufacturer | Dealer Owner/Staff + Customer | NOT FUNCTIONAL |
| Operator approves claim line | Dealer Owner/Staff | NOT FUNCTIONAL |
| Operator denies claim line | Dealer Owner/Staff | NOT FUNCTIONAL |
| Operator flags photo | Dealer Owner/Staff | NOT FUNCTIONAL |
| Operator sends invoice | Dealer Owner | NOT FUNCTIONAL |
| Dealer uploads batch | Operator Admin/Staff | WebSocket `batch:uploaded` — FUNCTIONAL |
| Claim status update | Dealer Owner/Staff | WebSocket `claim:updated` — partial |
| Dealer invites customer | Customer (email) | NOT FUNCTIONAL |
| Customer submits ticket | Dealer Owner/Staff | NOT FUNCTIONAL |
| Dealer replies to ticket | Customer | NOT FUNCTIONAL |
| Bid placed on unit | Dealer (their listing) | NOT FUNCTIONAL |
| Operator sends notification (compose) | Target role | NOT FUNCTIONAL |
| Mark All Notifications Read | Own portal | FUNCTIONAL |

**Notifications needing wiring: 12 of 14**

## 6. Hardcoded Items Needing API Connection

| Portal | Hardcoded Elements |
|---|---|
| Operator | FRC code table (now partial — mock data fallback added), dashboard stats, revenue reports charts, service marketplace cards, stale claims filter |
| Dealer | Upload Photos unit selector (VIN dropdown), What's New changelog content, Showcase cards, financing/parts list tables |
| Customer | Warranty countdown dates, claim timeline statuses, documents list, My Unit details |
| Bidder | Upcoming auction preview table (6-unit hardcoded table always shown beneath API-mapped cards), "Powered by" footer |

**Total distinct hardcoded data sources: 26**

## 7. Security Issues Requiring Immediate Attention

### Critical (must fix before production)
1. **`isDealerOwner = !user || user.role === 'dealer_owner'`** — evaluates `true` when unauthenticated. Every visitor gets Dealer Owner access in prototype mode. (Dealer Portal)
2. **`isReadyToBid = cardAdded && (idUploaded || true)`** — ID verification permanently bypassed. `(idUploaded || true)` always `true`. (Bidder Portal)
3. **Operator Staff can access billing pages** — `billing`, `reports`, `invoices` pages visible to Operator Staff in UI; no API-level enforcement. `[SECURITY: UI-only restriction]`
4. **`POST /api/payments/pay-invoice` trusts client-side `cardAdded` flag** — server must verify real Stripe payment method exists before processing.

### High (fix before beta)
5. **Dealer Staff role restrictions are UI-only** — `isDealerOwner` gates `showPage()` client-side; API endpoints `/api/invoices`, `/api/users`, `/api/dealerships/:id/branding` are not separately protected.
6. **Bidder Settings Log Out** — calls `confirm()` + redirects to `/live-auctions` but does NOT call `logout()`. Auth tokens remain valid after "logout".
7. **Bidder card data in React state** — raw card number stored in `useState`. No Stripe tokenization. PCI non-compliant.
8. **ID upload is a boolean flag** — no file reaches the server. Operator cannot review ID documents. Bypass possible.
9. **Multi-tenant isolation relies 100% on JWT scoping** — if backend query filters are missing on any endpoint, any dealer sees all dealers' data. Needs audit of every `/api/claims`, `/api/units`, `/api/invoices` query.

## 8. Confirmed Source-Level Bugs (Beyond Empty Handlers)

| Bug | Portal | Severity |
|---|---|---|
| Customer Settings tab prefix mismatch (`setCustSettingsTab('cs-profile')` vs check `=== 'cstab-cs-profile'`) — all settings sub-pages hidden | Customer | High |
| Report an Issue: Submit calls `showPage('claims')`, no state bindings, no `handleSubmitTicket` wired | Customer | Critical |
| New Ticket: all fields uncontrolled, Submit calls `showPage('tickets')` not handler | Customer | Critical |
| Quick Chat: Send button has no `onClick`, textarea uncontrolled | Customer | High |
| Ticket Detail: Send Reply has no `onClick` | Customer | High |
| Bidder `isReadyToBid` always true (see Security above) | Bidder | Critical |
| Bidder Settings Log Out does not call `logout()` | Bidder | High |
| Inventory page IDs differ from source (6 mismatches) | Customer | Medium |
| Bidder countdown targets `AUCTION_START` not `AUCTION_END` | Bidder | Low |
| Operator `isDealerOwner` defaults true when unauthenticated | Dealer | Critical |

---

_End of DATA-ROUTING-SPEC.md_
