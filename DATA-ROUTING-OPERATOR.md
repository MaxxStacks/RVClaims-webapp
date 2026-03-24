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
