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
