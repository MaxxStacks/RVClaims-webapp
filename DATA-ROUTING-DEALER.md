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
