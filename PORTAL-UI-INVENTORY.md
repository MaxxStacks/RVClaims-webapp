# Portal UI Inventory — RVClaims.ca / Dealer Suite 360
Generated: 2026-03-23

---

## How to Read This Document

- **FUNCTIONAL** = real API call is wired and fires
- **NOT FUNCTIONAL** = empty handler, client-side only, or DOM manipulation with no server call
- **HARDCODED** = data comes from a JS array in the component, not an API
- **ENDPOINT UNVERIFIED** = API call is present but the endpoint path is inferred and may differ from the actual route registered in the backend
- All API calls use `apiFetch()` from `@/lib/api`, not raw `fetch`.
- All file uploads use `FileReader` for client-side preview only — no server upload exists in the current build.
- All portal navigation is a single `useState(activePage)` that toggles CSS `display:block/none`.

---

## Architecture Notes

| Portal | File | Lines | Route | Roles |
|--------|------|-------|-------|-------|
| OperatorPortal | `client/src/portals/OperatorPortal.tsx` | 1,435 | `/operator` | operator_admin, operator_staff |
| DealerPortal | `client/src/portals/DealerPortal.tsx` | 874 | `/dealer` | dealer_owner, dealer_staff |
| CustomerPortal | `client/src/portals/CustomerPortal.tsx` | 522 | `/portal` | client |
| BidderPortal | `client/src/portals/BidderPortal.tsx` | ~836 | `/bidder` (inferred) | bidder |

**OperatorPortal** delegates marketplace and auction pages to `OperatorMarketplacePages` and `OperatorPublicAuctionPages` components.
**DealerPortal** delegates service/marketplace pages to `DealerMarketplacePages` and `DealerShowcasePages` components.
**BidderPortal** is standalone — no `MobileBottomNav`, no `OfflineBanner`.
OperatorPortal, DealerPortal, CustomerPortal all use `MobileBottomNav` and `OfflineBanner` shared components.

---

---

# OPERATOR PORTAL

**Route:** `/operator`
**Roles:** `operator_admin`, `operator_staff`

## State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `activePage` | string | Current page ID |
| `opClaims` | array | Claims list from API |
| `opDealers` | array | Dealers list from API |
| `opUnits` | array | Units list from API |
| `opBatches` | array | Batches list from API |
| `opInvoices` | array | Invoices list from API |
| `opUsers` | array | Operator users from API |
| `opNotifications` | array | Notifications from API |
| `opProducts` | array | Products from API |
| `selectedClaimId` | string\|null | Selected claim for detail view |
| `selectedDealerId` | string\|null | Selected dealer for detail view |
| `selectedUnitId` | string\|null | Selected unit for detail view |
| `selectedClaimDetail` | object\|null | Fetched claim detail |
| `selectedDealerDetail` | object\|null | Fetched dealer detail |
| `dealerTab` | string | Active tab in dealer-detail (9 tabs) |
| `unitTab` | string | Active tab in unit-detail (5 tabs) |
| `settingsTab` | string | Active sub-page in settings (7 sub-pages) |
| `clTab` | string | Active tab in changelog (4 tabs) |
| `unitEditMode` | boolean | View vs edit mode in unit-detail |
| `addDealerForm` | object | `{name, email, phone, province, plan}` |
| `addUnitForm` | object | `{vin, make, model, year, dealerId}` |

## WebSocket Subscriptions

| Event | Effect |
|-------|--------|
| `claim:updated` | Refresh `opClaims` |
| `batch:uploaded` | Refresh `opBatches` |

## Sidebar Navigation (26 items)

### Overview
- **Dashboard** → `dashboard`

### Claims
- **Processing Queue** → `queue`
- **Batch Review** → `batch-review`
- **All Claims** → `all-claims`
- **Stale Claims** → `stale-claims`

### Management
- **Dealer Management** → `dealers`
- **Unit Inventory** → `units`

### Services
- **FRC Codes** → `frc-codes`
- **Service Marketplace** → `service-marketplace`
- **Products & Services** → `products`

### Marketplace
- **Network Marketplace** → `marketplace` (delegated to `OperatorMarketplacePages`)
- **Live Auctions** → `public-auctions` (delegated to `OperatorPublicAuctionPages`)

### Finance
- **Financing** → `financing`
- **F&I** → `fi`
- **Warranty Plans** → `warranty-plans`
- **Parts & Accessories** → `parts`
- **Billing & Invoices** → `billing`
- **Revenue Reports** → `revenue`

### System
- **Notifications** → `notifications`
- **Users & Roles** → `users`
- **Settings** → `settings`
- **Changelog** → `changelog`

---

## Pages

### dashboard — Dashboard

**Data:**
- Stat cards: Active Claims, Pending Approval, Active Dealers, Revenue MTD
- Table: Recent Claims — columns: Claim #, Dealer, Unit, Type, Status, Submitted (source: `opClaims` first 5)
- Table: Recent Dealers — columns: Dealer, Plan, Claims, Status, Joined (source: `opDealers` first 5)

**Actions:**
- `View All Claims` → `showPage('all-claims')`
- `View All Dealers` → `showPage('dealers')`

**API Calls (on mount/activePage change):**
- `GET /api/claims` → `opClaims`
- `GET /api/dealerships` → `opDealers`
- `GET /api/invoices` → `opInvoices`

---

### queue — Processing Queue

**Data:**
- Table columns: Claim #, Dealer, Unit / VIN, Type, Items, Photos, Submitted, Actions
- Source: `opClaims` filtered by `status=pending_review`

**Actions:**
- `Review` (per row) → sets `selectedClaimId` then `showPage('claim-detail')`
- `Assign to Me` (per row) → NOT FUNCTIONAL — empty handler

**API Calls:**
- `GET /api/claims?status=pending_review` → `opClaims`

---

### batch-review — Batch Review

**Data:**
- Table columns: Batch ID, Dealer, Units, Claims, Photos, Uploaded, Status, Actions
- Source: `opBatches`

**Actions:**
- `Review Batch` (per row) → sets `selectedBatchId` then `showPage('batch-detail')`

**API Calls:**
- `GET /api/batches` → `opBatches`

---

### all-claims — All Claims

**Data:**
- Filters: status dropdown, claim type dropdown, dealer dropdown, date range
- Table columns: Claim #, Dealer, Unit / VIN, Type, Status, Submitted, Revenue, Actions
- Source: `opClaims`

**Actions:**
- `View` (per row) → sets `selectedClaimId` then `showPage('claim-detail')`

**API Calls:**
- `GET /api/claims` → `opClaims`

---

### claim-detail — Claim Detail

**Navigation:** back button → `showPage('all-claims')`

**Data:**
- Header: Claim #, Dealer, Unit VIN, Type, Status, Submitted date
- Section: Claim Info (Manufacturer Claim #, Preauth #, Claim Type, Unit VIN, Dealer)
- Table: Claim Lines — columns: FRC Code, Description, Labor Hrs Req, Labor Hrs Appr, Status, Parts, Photos
- Section: Photos (per-line photo gallery)
- Section: Parts (linked parts orders)
- Section: Timeline (status history log)

**Actions:**
- `Assign FRC Code` → NOT FUNCTIONAL (UI present, no API call)
- `Flag Photo` → NOT FUNCTIONAL — empty handler
- `Submit to Manufacturer` → NOT FUNCTIONAL — empty handler
- `Log Manufacturer Response` → NOT FUNCTIONAL — empty handler
- `Approve Line` → NOT FUNCTIONAL — empty handler
- `Deny Line` → NOT FUNCTIONAL — empty handler

**API Calls:**
- `GET /api/claims/:selectedClaimId` → `selectedClaimDetail` (on activePage=claim-detail + selectedClaimId change)

---

### stale-claims — Stale Claims

**Data:**
- Table columns: Claim #, Dealer, Unit, Type, Last Activity, Days Idle, Status, Actions
- Source: `opClaims` filtered stale

**Actions:**
- `Review` (per row) → sets `selectedClaimId` then `showPage('claim-detail')`

**API Calls:**
- `GET /api/claims?stale=true` → `opClaims`

---

### dealers — Dealer Management

**Data:**
- Table columns: Dealer, Owner, Plan, Claims, Balance, Status, Joined, Actions
- Source: `opDealers`

**Actions:**
- `Add Dealer` → `showPage('add-dealer')`
- `View` (per row) → sets `selectedDealerId` then `showPage('dealer-detail')`
- `Approve` (per row, condition: `status=pending`) → `handleApproveDealership(id)` — FUNCTIONAL

**API Calls:**
- `GET /api/dealerships` → `opDealers`
- `PUT /api/dealerships/:id` body: `{status: 'active'}` → then refresh `opDealers`

---

### add-dealer — Add Dealer

**Navigation:** back button → `showPage('dealers')`

**Form Fields:**
| Label | Type | State |
|-------|------|-------|
| Dealership Name | text | `addDealerForm.name` |
| Owner Email | email | `addDealerForm.email` |
| Phone | tel | `addDealerForm.phone` |
| Province | select (AB BC MB NB NL NS ON PE QC SK YT NT NU) | `addDealerForm.province` |
| Subscription Plan | select (Plan A / Plan B) | `addDealerForm.plan` |

**Actions:**
- `Create Dealer` → `handleCreateDealer()` — FUNCTIONAL
- `Cancel` → `showPage('dealers')`

**API Calls:**
- `POST /api/dealerships` body: `addDealerForm` → then refresh `opDealers` + `showPage('dealers')`

---

### dealer-detail — Dealer Detail

**Navigation:** back button → `showPage('dealers')`

**Tabs (9) — state: `dealerTab`:**
| Tab ID | Label | Content |
|--------|-------|---------|
| `dd-overview` | Overview | Status, plan, claims count, wallet balance, joined date |
| `dd-claims` | Claims | Claims table for this dealer |
| `dd-units` | Units | Units table for this dealer |
| `dd-staff` | Staff | Dealer staff list with roles |
| `dd-invoices` | Invoices | Invoices table for this dealer |
| `dd-wallet` | Wallet | Balance + transaction history |
| `dd-subscription` | Subscription | Plan, billing period, Stripe subscription ID |
| `dd-branding` | Branding | Logo preview, color swatches, domain/CNAME |
| `dd-activity` | Activity Log | Audit log entries for this dealer |

**Actions:**
- `Edit Dealer` → NOT FUNCTIONAL — empty handler
- `Suspend Dealer` → NOT FUNCTIONAL — empty handler
- `Send Invoice` → `showPage('create-invoice')`

**API Calls:**
- `GET /api/dealerships/:selectedDealerId` → `selectedDealerDetail`

---

### units — Unit Inventory

**Data:**
- Table columns: VIN, Year/Make/Model, Dealer, Type, DAF, PDI, Warranty Exp, Actions
- Source: `opUnits`

**Actions:**
- `Add Unit` → `showPage('add-unit')`
- `View` (per row) → sets `selectedUnitId` then `showPage('unit-detail')`

**API Calls:**
- `GET /api/units` → `opUnits`

---

### add-unit — Add Unit

**Navigation:** back button → `showPage('units')`

**Form Fields:**
| Label | Type | State |
|-------|------|-------|
| VIN | text | `addUnitForm.vin` |
| Make | text | `addUnitForm.make` |
| Model | text | `addUnitForm.model` |
| Year | number | `addUnitForm.year` |
| Dealer | select (from `opDealers`) | `addUnitForm.dealerId` |

**Actions:**
- `Create Unit` → `handleCreateUnit()` — FUNCTIONAL
- `Cancel` → `showPage('units')`

**API Calls:**
- `POST /api/units` body: `addUnitForm` → then refresh `opUnits` + `showPage('units')`

---

### unit-detail — Unit Detail

**Navigation:** back button → `showPage('units')`

**Tabs (5) — state: `unitTab`:**
| Tab ID | Label | Content |
|--------|-------|---------|
| `ut-info` | Info | VIN, make, model, year, type, dealer; inline edit via `toggleUnitEdit()` |
| `ut-photos` | Photos | Display photo + inspection photos (DAF/PDI). `updateOpUnitPhoto()` = FileReader, NOT server upload |
| `ut-claims` | Claims | Claims table for this unit |
| `ut-documents` | Documents | Uploaded documents list |
| `ut-history` | History | Status change log |

**Edit Mode:** `toggleUnitEdit()` sets `unitEditMode` true/false. Save Changes button → NOT FUNCTIONAL — empty handler.

**API Calls:**
- `GET /api/units/:selectedUnitId` → unit detail data

---

### frc-codes — FRC Codes

**Data:** HARDCODED — variable `frcData`
- Filters: manufacturer dropdown, category dropdown, search text
- Table columns: Code, Manufacturer, Category, Description, Default Labor Hrs, Status, Actions

**Actions:**
- `Add FRC Code` → NOT FUNCTIONAL — empty handler
- `Edit` (per row) → NOT FUNCTIONAL — empty handler
- `Deactivate` (per row) → NOT FUNCTIONAL — empty handler

---

### service-marketplace — Service Marketplace

**Data:** HARDCODED
- Overview cards for all service modules with status badges: Live, Q2 2026, Q3 2026, Q4 2026

**Actions:**
- `Manage` (per module) → navigates to respective module page

---

### billing — Billing & Invoices

**Data:**
- Stat cards: Total Invoiced MTD, Collected, Outstanding, Overdue
- Table columns: Invoice #, Dealer, Claim, Amount, Tax, Total, Status, Date, Actions
- Source: `opInvoices`

**Actions:**
- `Create Invoice` → `showPage('create-invoice')`
- `View` (per row) → NOT FUNCTIONAL
- `Mark Paid` (per row) → NOT FUNCTIONAL

**API Calls:**
- `GET /api/invoices` → `opInvoices`

---

### create-invoice — Create Invoice

**Navigation:** back button → `showPage('billing')`

**Description:** Wave-style invoice builder with dynamic row add/remove via direct DOM `innerHTML` manipulation.

**Header Form Fields:**
- Dealer (select from `opDealers`)
- Claim # (text)
- Invoice Date (date)
- Due Date (date)
- Currency (select: CAD, USD)

**Line Items (dynamic DOM):**
- `Add Service/Subscription` → `addServiceRow()` — direct `innerHTML` DOM manipulation, adds dropdown row
- `Search & Add Part` → `addPartRow()` — direct `innerHTML` DOM manipulation, adds search row
- `×` per row → `row.remove()` via DOM traversal

**Footer Fields:** Notes (textarea), Tax Rate %, Subtotal (display), Tax (display), Total (display)

**Actions:**
- `Send Invoice` → NOT FUNCTIONAL — empty handler
- `Save Draft` → NOT FUNCTIONAL — empty handler
- `Preview` → NOT FUNCTIONAL — empty handler
- `Cancel` → `showPage('billing')`

---

### revenue — Revenue Reports

**Data:** HARDCODED
- Filters: date range picker, dealer dropdown, claim type
- Stat cards: Total Revenue, Avg per Claim, Claims Processed, Active Dealers
- Charts: Revenue over time (bar chart placeholder), Revenue by dealer (pie chart placeholder)

**Actions:**
- `Export CSV` → NOT FUNCTIONAL — empty handler
- `Export PDF` → NOT FUNCTIONAL — empty handler

---

### notifications — Notifications

**Data:**
- Table columns: Type, Message, Linked Entity, Date, Actions
- Source: `opNotifications`

**Actions:**
- `Mark Read` (per row) → `handleMarkNotificationRead(id)` — FUNCTIONAL
- `Mark All Read` → NOT FUNCTIONAL — empty handler

**API Calls:**
- `GET /api/notifications` → `opNotifications`
- `PUT /api/notifications/:id/read` → then refresh `opNotifications`

---

### users — Users & Roles

**NOTE:** Duplicate `page-users` div exists in source at lines 1031-1053 and 1056-1078. Likely a copy-paste artifact.

**Data:**
- Table columns: Name, Email, Role, Status, Last Login, Actions
- Source: `opUsers`

**Actions:**
- `Invite User` → NOT FUNCTIONAL — empty handler
- `Edit Role` (per row) → NOT FUNCTIONAL — empty handler
- `Deactivate` (per row) → NOT FUNCTIONAL — empty handler

**API Calls:**
- `GET /api/users` → `opUsers`

---

### products — Products & Services

**Data:**
- Table columns: Name, Category, Price, Billing, Status, Dealers Using, Actions
- Source: `opProducts`

**Actions:**
- `Add Product/Service` → `showPage('add-product')`
- `Edit` (per row) → `showPage('edit-product')` with pre-filled form
- `Deactivate` (per row) → NOT FUNCTIONAL — empty handler

**Sub-pages:** `add-product`, `edit-product`

**Add/Edit Form Fields:** Name, Category, Price, Pricing Type, Billing Frequency, Tax, Description, Status. Edit also shows `Dealers Currently Using` (readonly).

**API Calls:**
- `GET /api/products` → `opProducts`
- Add/Edit save → NOT FUNCTIONAL — empty handler

---

### settings — Settings

**Sub-pages (7) — state: `settingsTab`:**

#### stab-s-profile — My Profile
- Profile Photo upload (FileReader, NOT server upload)
- Fields: Full Name, Email, Phone, Role (readonly), Timezone
- Actions: `Save Changes` → NOT FUNCTIONAL | `Change Password` → NOT FUNCTIONAL

#### stab-s-general — General
- Fields: Platform Name, Support Email, Support Phone, Default Language, Currency, Timezone, Stale Claim Threshold (days), Platform URL
- Actions: `Save` → NOT FUNCTIONAL

#### stab-s-fees — Claim Fee Defaults
- Fields: Default Fee Type (% of approved / flat rate), Default Rate %, Minimum Fee, Maximum Fee Cap, DAF Inspection Fee, PDI Inspection Fee, Bill on approval or on close (select)
- Actions: `Save` → NOT FUNCTIONAL

#### stab-s-billing — Billing Configuration
- Fields: Tax Name, Tax Rate %, Apply Tax To (select), Tax Registration Number, Stripe Publishable Key, Stripe Secret Key, Stripe Webhook Secret, Invoice Due Days, Auto-remind (days before due), Late Fee %
- Actions: `Save` → NOT FUNCTIONAL

#### stab-s-notif — Notifications
- Operator notification toggles: New claim submitted, Batch uploaded, Claim status change, New dealer signup, Invoice paid, Low wallet balance
- Dealer default toggles: Claim status update, Invoice sent, Parts order update, New ticket reply
- Email config: From Name, From Email, Reply-To Email, SMTP Host / SendGrid API Key
- Actions: `Save` → NOT FUNCTIONAL

#### stab-s-integrations — Integrations
| Integration | Status | Badge |
|-------------|--------|-------|
| Stripe | Connected | active |
| Gmail / SMTP | Connected | active |
| Anthropic API | Connected | active |
| Tavus / D-ID | Coming Soon | pending (opacity 0.5) |
| QuickBooks / Wave | Coming Soon | pending (opacity 0.5) |
| Twilio | Coming Soon | pending (opacity 0.5) |

- Actions: `Configure` (per integration) → NOT FUNCTIONAL

#### stab-s-security — Security Settings
- Authentication section: Require 2FA for Operators (Yes/No), Require 2FA for Dealers (Yes/No—optional), Session Timeout (30min/2hr/8hr/24hr), Password Min Length
- Access Control section: Max Failed Login Attempts, Lockout Duration (15min/30min/1hr), IP Allowlist for Operators (Disabled/Enabled)
- Audit section: Activity Logging (Full/Admin only/Off), Log Retention (30d/90d/1yr/Indefinite)
- Actions: `Save` → NOT FUNCTIONAL | `Reset` → NOT FUNCTIONAL

---

### changelog — Changelog

**Tabs (4) — state: `clTab`:**

#### cltab-cl-current — Current Release
- Version: v2.0.0, Released March 17, 2026, Badge: Latest
- New Features: 13 bullet points
- Architecture: 5 bullet points

#### cltab-cl-past — Past Updates
- v1.0.0 (November 2025) — Original single-portal
- v0.1.0 (October 2025) — Marketing website only

#### cltab-cl-upcoming — Upcoming
- v2.1.0 — April 2026 — "In Development" (7 items)
- v2.2.0 — May 2026 — "Planned" (6 items)
- v2.3.0 — June 2026 — "Planned" (5 items)
- v3.0.0 — Q3 2026 — "Planned" (6 items)

#### cltab-cl-requests — Feature Requests
**Data:** HARDCODED — 6 rows
- Table columns: Request, Requested By, Priority, Status, Target
- Actions: `+ Add Request` → `showPage('add-feature-req')`

---

### add-feature-req — Add Feature Request

**Navigation:** back button → `showPage('changelog')`

**Form Fields:**
- Feature Title (text)
- Requested By (select: Internal, Smith's RV Centre, Atlantic RV, Prairie Wind RV) — HARDCODED
- Priority (select: High, Medium, Low — default: Medium)
- Target Version (select: v2.1, v2.2, v2.3, v3.0, Backlog — default: v2.2)
- Description (textarea)

**Actions:**
- `Submit Request` → `showPage('changelog')` — NOT FUNCTIONAL, no API call
- `Cancel` → `showPage('changelog')`

---

---

# DEALER PORTAL

**Route:** `/dealer`
**Roles:** `dealer_owner`, `dealer_staff`

## Role Control

`isDealerOwner = !user || user.role === 'dealer_owner'`
— Defaults to `true` when not authenticated (prototype mode).

**Owner-only pages** (enforced in `showPage()`, redirects staff to dashboard):
- `invoices`, `staff`, `add-staff`, `branding`

**Owner-only sidebar items** (conditionally rendered with `{isDealerOwner && ...}`):
- Invoices & Billing, Staff, Branding & Domain

## State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `activePage` | string | Current page ID |
| `isDealerOwner` | boolean | Role check — true = dealer_owner |
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
| `dSettingsTab` | string | Active sub-page in settings |
| `dclTab` | string | Active tab in What's New |
| `brandColor` | string | Hex color for primary brand |
| `accentColor` | string | Hex color for accent |
| `selectedUnitId` | string\|null | Selected unit |
| `selectedClaimId` | string\|null | Selected claim |
| `selectedTicketId` | string\|null | Selected ticket |

## WebSocket Subscriptions

| Event | Effect |
|-------|--------|
| `claim:updated` | Refresh `dlrClaims` |
| `ticket:message` | Refresh `dlrTickets` |

## Sidebar Navigation (25 items)

### Overview
- **Dashboard** → `dashboard`

### Claims
- **Upload Photos / Push to Claim** → `upload`
- **My Claims** → `my-claims`
- **My Units** → `my-units`

### Services
- **Financing** → `d-financing` (delegated)
- **F&I Products** → `d-fi` (delegated)
- **Warranty Plans** → `d-warranty` (delegated)
- **Parts Orders** → `d-parts` (delegated)

### Customers
- **Customer Portal Management** → `customer-mgmt`
- **Customer Tickets** → `customer-tickets`
- **Invite Customer** → `invite-customer`

### Administration (owner only)
- **Invoices & Billing** → `invoices`
- **Staff** → `staff`
- **Branding & Domain** → `branding`

### Other
- **What's New** → `whats-new`
- **Settings** → `d-settings`

---

## Pages

### dashboard — Dashboard

**Data:**
- Stat cards: Active Claims, Pending Approval, Units on File, Open Tickets
- Table: Recent Claims — columns: Claim #, Unit/VIN, Type, Status, Submitted (source: `dlrClaims` recent 5)

**Actions:**
- `New Claim` → `showPage('upload')`
- `Add Unit` → `showPage('add-unit')`
- `View All Claims` → `showPage('my-claims')`

**API Calls:** (ENDPOINT UNVERIFIED)
- `GET /api/claims?dealerId=me` → `dlrClaims`
- `GET /api/units?dealerId=me` → `dlrUnits`

---

### upload — Upload Photos / Push to Claim

**Form Fields:**
- Select Unit (select from `dlrUnits`)
- Claim Type (select: DAF, PDI, Warranty, Extended Warranty, Insurance)
- Photos (drag-and-drop upload zone, FileReader preview, multi-file)
- Description / Notes (textarea)

**Actions:**
- `Push to Claim` → NOT FUNCTIONAL — empty handler
- `Save Draft` → NOT FUNCTIONAL — empty handler

---

### my-claims — My Claims

**Data:**
- Filters: status dropdown, claim type dropdown, date range
- Table columns: Claim #, Unit/VIN, Type, Status, Items, Submitted, Actions
- Source: `dlrClaims`

**Actions:**
- `New Claim` → `showPage('upload')`
- `View` (per row) → sets `selectedClaimId` then `showPage('claim-detail')`

**API Calls:**
- `GET /api/claims` → `dlrClaims`

---

### claim-detail — Claim Detail

**Navigation:** back button → `showPage('my-claims')`

**Data:**
- Claim Info: Claim #, Manufacturer Claim #, Preauth #, Type, Status, Submitted date
- Claim Lines table: FRC Code, Description, Status, Labor Hrs, Notes
- Photos: per-line display
- Timeline: visual progress steps

**Actions:**
- `Add Photos` → NOT FUNCTIONAL — empty handler
- `Contact Operator` → `showPage('customer-tickets')` or new ticket flow

**API Calls:** (ENDPOINT UNVERIFIED)
- `GET /api/claims/:selectedClaimId`

---

### my-units — My Units

**Data:**
- Table columns: VIN, Year/Make/Model, Type, DAF, PDI, Warranty Exp, Actions
- Source: `dlrUnits`

**Actions:**
- `Add Unit` → `showPage('add-unit')`
- `View` (per row) → sets `selectedUnitId` then `showPage('unit-detail')`

**API Calls:**
- `GET /api/units` → `dlrUnits`

---

### add-unit — Add Unit

**Navigation:** back button → `showPage('my-units')`

**Form Fields:**
| Label | Type | State |
|-------|------|-------|
| VIN | text | `addUnitForm.vin` |
| Make | text | `addUnitForm.make` |
| Model | text | `addUnitForm.model` |
| Year | number | `addUnitForm.year` |
| Unit Type | select (10 RV types) | `addUnitForm.type` |

Unit Types: Travel Trailer, Fifth Wheel, Class A, Class C, Van Camper, Small Trailer, Pop Up, Toy Hauler, Truck Camper, Destination Trailer

**Actions:**
- `Add Unit` → `handleAddUnit()` — FUNCTIONAL
- `Cancel` → `showPage('my-units')`

**API Calls:**
- `POST /api/units` body: `addUnitForm` → then refresh `dlrUnits` + `showPage('my-units')`

---

### unit-detail — Unit Detail

**Navigation:** back button → `showPage('my-units')`

**Tabs (4) — state: `unitTab`:**
| Tab ID | Label | Content |
|--------|-------|---------|
| `ut-info` | Info | VIN, make, model, year, type, warranty dates |
| `ut-documents` | Documents | Uploaded documents list with download |
| `ut-pictures` | Pictures | Unit display photo — `updateUnitPhoto()` = FileReader, NOT server upload |
| `ut-claims` | Claims | Claims for this unit |

**API Calls:** (ENDPOINT UNVERIFIED)
- `GET /api/units/:selectedUnitId`

---

### customer-mgmt — Customer Portal Management

**Data:**
- Table columns: Customer, Email, Unit VIN, Portal Active, Last Login, Actions

**Actions:**
- `Invite Customer` → `showPage('invite-customer')`
- `View Portal` (per row) → NOT FUNCTIONAL
- `Revoke Access` (per row) → NOT FUNCTIONAL

---

### customer-tickets — Customer Tickets

**Data:**
- Tabs: All, Open, Pending, Closed
- Table columns: Ticket #, Customer, Category, Subject, Status, Last Reply, Actions
- Source: `dlrTickets`

**Actions:**
- `View` (per row) → sets `selectedTicketId` then `showPage('ticket-detail')`

**API Calls:**
- `GET /api/tickets` → `dlrTickets`

---

### ticket-detail — Ticket Detail

**Navigation:** back button → `showPage('customer-tickets')`

**Data:** Ticket #, Category, Status, Customer, Created date; conversation thread

**Form Fields:**
- Reply (textarea)
- Visibility toggle: Customer visible / Internal note

**Actions:**
- `Send Reply` → NOT FUNCTIONAL
- `Close Ticket` → NOT FUNCTIONAL
- `Reopen Ticket` → NOT FUNCTIONAL

---

### invite-customer — Invite Customer

**Navigation:** back button → `showPage('customer-mgmt')`

**Form Fields:**
| Label | Type | State |
|-------|------|-------|
| Email | email | `inviteCustomerForm.email` |
| First Name | text | `inviteCustomerForm.firstName` |
| Last Name | text | `inviteCustomerForm.lastName` |

**Actions:**
- `Send Invitation` → `handleInviteCustomer()` — FUNCTIONAL
- `Cancel` → `showPage('customer-mgmt')`

**API Calls:**
- `POST /api/users/invite` body: `{email, role: 'client'}` → then `showPage('customer-mgmt')`

---

### invoices — Invoices & Billing (OWNER ONLY)

**Data:**
- Stat cards: Total Billed, Paid, Outstanding, Overdue
- Table columns: Invoice #, Claim, Amount, Tax, Total, Status, Date, Actions
- Source: `dlrInvoices`

**Actions:**
- `Pay Now` (per row) → NOT FUNCTIONAL
- `View Invoice` (per row) → NOT FUNCTIONAL
- `Top Up Wallet` → NOT FUNCTIONAL

**API Calls:**
- `GET /api/invoices` → `dlrInvoices`

---

### staff — Staff (OWNER ONLY)

**Data:**
- Table columns: Name, Email, Role, Status, Last Login, Actions
- Source: `dlrStaff`

**Actions:**
- `Add Staff` → `showPage('add-staff')`
- `Edit Role` (per row) → NOT FUNCTIONAL
- `Deactivate` (per row) → NOT FUNCTIONAL

**API Calls:** (ENDPOINT UNVERIFIED)
- `GET /api/users?dealerId=me` → `dlrStaff`

---

### add-staff — Add Staff (OWNER ONLY)

**Navigation:** back button → `showPage('staff')`

**Form Fields:** Full Name (text), Email (email), Role (select: Dealer Staff, Dealer Owner)

**Actions:**
- `Send Invitation` → NOT FUNCTIONAL
- `Cancel` → `showPage('staff')`

---

### branding — Branding & Domain (OWNER ONLY)

**Form Fields:**
- Logo Upload → `previewLogo()` — FileReader DOM manipulation, NOT server upload
- Primary Color (color picker) → state: `brandColor`
- Accent Color (color picker) → state: `accentColor`
- Dealership Name (Portal Header) (text)
- Welcome Message (textarea)
- Custom Domain / CNAME (text)
- Subdomain (text)

**Actions:**
- `Save & Apply` → `applyBranding()` — client-side CSS variable manipulation ONLY, no API call
- `Preview` → `previewBranding()` — navigates to dashboard to show effect, no API call
- `Restore Defaults` → `restoreBranding()` — resets CSS variables, no API call

---

### whats-new — What's New

**Tabs (4) — state: `dclTab`:**
| Tab ID | Label | Content |
|--------|-------|---------|
| `dctab-dc-current` | What's New | v2.0.0 release notes |
| `dctab-dc-past` | Past Updates | v1.0.0, v0.1.0 |
| `dctab-dc-upcoming` | Coming Soon | v2.1.0–v3.0.0 roadmap |
| `dctab-dc-request` | Request a Feature | Form: Feature Title, Description, Priority — NOT FUNCTIONAL, no API call |

---

### d-settings — Settings

**Sub-pages (5) — state: `dSettingsTab`:**

#### ds-profile — My Profile
- Profile Photo (FileReader — NOT server upload)
- Fields: Full Name, Email, Phone, Role (readonly), Language Preference
- Actions: `Save Changes` → NOT FUNCTIONAL (photo FileReader only)

#### ds-security — Security
- Fields: Current Password, New Password, Confirm Password, Enable 2FA toggle, Active Sessions list
- Actions: `Update Password` → NOT FUNCTIONAL | `Enable 2FA` → NOT FUNCTIONAL | `Revoke Session` → NOT FUNCTIONAL

#### ds-dealership — Dealership Account
- Fields: Dealership Name, Phone, Address, City, Province, Postal Code, Website, GST/HST Number
- Actions: `Save` → NOT FUNCTIONAL

#### ds-subscription — Subscription & Billing
- Displays: Current Plan, Next billing date, Wallet balance
- Actions: `Top Up` → NOT FUNCTIONAL | `Change Plan` → NOT FUNCTIONAL | `Cancel Subscription` → NOT FUNCTIONAL

#### ds-notif — Notification Preferences
- Toggles: Claim status updates, Invoice sent, Parts order updates, New ticket reply, Promotional / platform news
- Actions: `Save` → NOT FUNCTIONAL

---

---

# CUSTOMER PORTAL

**Route:** `/portal`
**Roles:** `client`
**Role restrictions:** None — all pages accessible to all authenticated clients.

## State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `activePage` | string | Current page ID |
| `custClaims` | array | Customer claims from API |
| `custUnit` | object\|null | First unit from API: `(d.units || [])[0] || null` |
| `custTickets` | array | Customer tickets from API |
| `custPartsOrders` | array | Parts orders from API |
| `ticketForm` | object | `{subject: '', category: 'general', description: ''}` |
| `chatMessage` | string | Current chat input |
| `chatMessages` | array | Chat message history |
| `selectedTicketId` | string\|null | For chat message posts |
| `custSettingsTab` | string | Active settings sub-page |
| `selectedClaimId` | string\|null | Selected claim |

## WebSocket Subscriptions

| Event | Effect |
|-------|--------|
| `ticket:message` | Push new message to `chatMessages` |

## Known Bug

**Settings tab prefix mismatch:** `setCustSettingsTab` sets values like `'cs-profile'` but display conditions check `custSettingsTab === 'cstab-cs-profile'`. The `cstab-` prefix is never set — settings sub-pages never render correctly.

## Sidebar Navigation (12 items)

- **Dashboard** → `dashboard`
- **My Unit** → `my-unit`
- **Warranty & Coverage** → `warranty`
- **Documents** → `documents`
- **Claim Status** → `claim-status`
- **Report an Issue** → `report-issue`
- **Parts Orders** → `parts-orders`
- **Protection Plans** → `protection-plans`
- **Roadside Assist** → `roadside`
- **Support Tickets** → `tickets`
- **Quick Chat** → `quick-chat`
- **Settings** → `c-settings`

---

## Pages

### dashboard — Dashboard

**Data:**
- Unit Card: display photo, year/make/model, VIN, dealer name/phone (source: `custUnit`)
- Alerts: warranty expiry warning, open claims/tickets
- Active Claims (source: `custClaims` filtered)
- Dealer Info: name, address, phone, hours

**Actions:**
- `View My Unit` → `showPage('my-unit')`
- `Report an Issue` → `showPage('report-issue')`
- `View Claims` → `showPage('claim-status')`
- `Support` → `showPage('tickets')`

**API Calls:** (ENDPOINT UNVERIFIED)
- `GET /api/customers/me/dashboard` → `custClaims` + `custUnit`

---

### my-unit — My Unit

**Data:** Unit photo, Year/Make/Model, VIN, Unit Type, Purchase Date, Dealer, Manufacturer Warranty Expiry, Extended Warranty provider (source: `custUnit`)

**Actions:**
- `View Warranty` → `showPage('warranty')`
- `View Claims` → `showPage('claim-status')`

---

### warranty — Warranty & Coverage

**Data:** HARDCODED countdown bar values
- Manufacturer Warranty: countdown bar + days remaining + expiry date
- Extended Warranty: provider name + coverage period + countdown bar
- DAF Status: completed/pending badge
- PDI Status: completed/pending badge

**Actions:**
- `View Coverage Details` → NOT FUNCTIONAL
- `Renew Extended Warranty` → NOT FUNCTIONAL

---

### documents — Documents

**Data:** HARDCODED document list
- Table columns: Document Name, Type, Date Added, Actions

**Actions:**
- `Download` (per row) → NOT FUNCTIONAL

---

### claim-status — Claim Status

**Data:**
- Table columns: Claim #, Type, Status, Submitted, Last Update, Actions
- Source: `custClaims`

**Actions:**
- `View Details` (per row) → sets `selectedClaimId` then `showPage('claim-detail-c')`

**API Calls:**
- `GET /api/claims` → `custClaims`

---

### claim-detail-c — Claim Detail

**Navigation:** back button → `showPage('claim-status')`

**Data:**
- Claim Info: Claim #, Type, Status, Submitted date
- Visual Timeline: Submitted → Under Review → Parts Ordered → Ready for Repair → Complete
- Claim Lines: Description, Status, Notes

**Actions:**
- `Contact Support` → `showPage('tickets')`

---

### report-issue — Report an Issue

**Form Fields:**
| Label | Type | State |
|-------|------|-------|
| Subject | text | `ticketForm.subject` |
| Category | select (general, warranty, parts, billing, claim, service, other) | `ticketForm.category` |
| Description | textarea | `ticketForm.description` |
| Attach Photos | file | no handler wired |

**Actions:**
- `Submit` → `handleSubmitTicket()` — FUNCTIONAL
- `Cancel` → `showPage('dashboard')`

**API Calls:**
- `POST /api/tickets` body: `ticketForm`
- then `GET /api/tickets` → refresh `custTickets`
- then `showPage('tickets')`

---

### parts-orders — Parts Orders

**Data:**
- Table columns: Part #, Name, Claim, Status, Ordered, ETA, Actions
- Source: `custPartsOrders`

**Actions:**
- `View` (per row) → NOT FUNCTIONAL

**API Calls:** (ENDPOINT UNVERIFIED)
- `GET /api/parts-orders` → `custPartsOrders`

---

### protection-plans — Protection Plans

**Data:** HARDCODED product cards
| Product | Price | Note |
|---------|-------|------|
| Paint Protection | $799 | "OWNED" ribbon if purchased |
| Fabric Protection | $399 | "OWNED" ribbon if purchased |
| Interior Protection Package | $599 | "Popular" badge |
| Exterior Protection Bundle | $1,199 | |

**Actions:**
- `Learn More` (per card) → NOT FUNCTIONAL
- `Purchase` (per card) → NOT FUNCTIONAL

---

### roadside — Roadside Assistance

**Description:** Coming Soon placeholder.

**Content:** Launch date badge, feature preview list (24/7 towing, battery jump, tire change, fuel delivery, lockout service)

**Actions:**
- `Notify Me When Available` → NOT FUNCTIONAL

---

### tickets — Support Tickets

**Data:**
- Table columns: Ticket #, Subject, Category, Status, Last Reply, Actions
- Source: `custTickets`

**Actions:**
- `New Ticket` → `showPage('new-ticket')`
- `View` (per row) → sets `selectedTicketId` then `showPage('ticket-detail-c')`

**API Calls:**
- `GET /api/tickets` → `custTickets`

---

### ticket-detail-c — Ticket Detail

**Navigation:** back button → `showPage('tickets')`

**Data:** Ticket #, Category, Status; conversation thread

**Form:** Reply (textarea)

**Actions:**
- `Send Reply` → NOT FUNCTIONAL
- `Close Ticket` → NOT FUNCTIONAL

---

### new-ticket — New Ticket

**Navigation:** back button → `showPage('tickets')`

**Form Fields:**
- Subject (text) → `ticketForm.subject`
- Category (select: general, warranty, parts, billing, claim, service, other) → `ticketForm.category`
- Description (textarea) → `ticketForm.description`

**Actions:**
- `Submit Ticket` → `handleSubmitTicket()` — FUNCTIONAL
- `Cancel` → `showPage('tickets')`

**API Calls:**
- Same as `report-issue`: `POST /api/tickets` → `GET /api/tickets` → `showPage('tickets')`

---

### quick-chat — Quick Chat

**Description:** Casual messaging, separate from formal tickets. WebSocket-driven.

**Data:** `chatMessages` array, updated via WebSocket `ticket:message` event.

**Form:** Message (text) → `chatMessage`

**Actions:**
- `Send` → `handleSendChat()` — FUNCTIONAL (requires `selectedTicketId`)
- `Create a Ticket` (callout banner) → `showPage('new-ticket')`

**API Calls:**
- `POST /api/tickets/:selectedTicketId/messages` body: `{message: chatMessage}`
- NOTE: requires `selectedTicketId` to be set; unclear how this is set in the customer portal

---

### c-settings — Settings

**Bug:** Tab prefix mismatch — sub-pages likely never render. See Known Bugs section.

**Sub-pages (3) — state: `custSettingsTab`:**

#### cs-profile — My Profile
- Profile Photo (FileReader DOM manipulation — NOT server upload)
- Fields: Full Name, Email, Phone
- Actions: `Save` → photo FileReader only, rest NOT FUNCTIONAL

#### cs-security — Security
- Fields: Current Password, New Password, Confirm Password
- Actions: `Update Password` → NOT FUNCTIONAL

#### cs-notif — Notifications
- Toggles: Claim updates, Ticket replies, Parts order updates, Promotional messages
- Actions: `Save` → NOT FUNCTIONAL

---

---

# BIDDER PORTAL

**Route:** `/bidder` (inferred — not explicitly defined in this file)
**Roles:** `bidder` (auction participants)

**NOTE:** Standalone portal. No `MobileBottomNav`, no `OfflineBanner`. Simpler architecture.

## Constants

| Constant | Value |
|----------|-------|
| `AUCTION_START` | `2026-05-08T16:00:00Z` |
| `AUCTION_END` | `2026-05-09T16:00:00Z` |

## Timers

- `setInterval` every 1000ms calling `calcCountdown(AUCTION_END)` — live HH:MM:SS countdown display

## State Variables

| Variable | Type | Purpose |
|----------|------|---------|
| `activePage` | string | Current page ID |
| `myBids` | array | From API |
| `wonUnits` | array | From API |
| `upcomingAuctions` | array | From API |
| `paymentMethods` | array | From API |
| `cardAdded` | boolean | Card added status |
| `showCardForm` | boolean | Show add card form |
| `cardName/cardNum/cardExp/cardCvv` | strings | Card form state |
| `idUploaded` | boolean | ID verification status |
| `addrUploaded` | boolean | Address doc status |
| `isReadyToBid` | boolean | `cardAdded && (idUploaded \|\| true)` — ID optional for bids under $25k |
| `firstName/lastName/email/phone/address/city/province/postal` | strings | Profile form state |
| `profileSaved` | boolean | True for 3 seconds after save, then resets |
| `countdown` | string | Formatted HH:MM:SS |
| `bSettingsTab` | string | Active settings tab |

## WebSocket Subscriptions

| Event | Effect |
|-------|--------|
| `auction:bid` | Push new bid to `myBids` array |

## Sidebar Navigation (8 items)

- **Dashboard** → `dashboard`
- **Profile** → `profile`
- **Verification** → `verification`
- **Payment** → `payment`
- **Upcoming Auctions** → `upcoming`
- **My Bids** → `my-bids`
- **Won Units** → `won-units`
- **Settings** → `settings`

---

## Pages

### dashboard — Dashboard

**Data:**
- Next Auction Countdown: live HH:MM:SS to `AUCTION_END`
- Auction Date: May 8-9, 2026 (hardcoded from constants)
- My Active Bids: count from `myBids`
- Units Won: count from `wonUnits`
- Readiness Status: `isReadyToBid` check — green/yellow badge

**Actions:**
- `View Live Auction` → `window.location.href = '/live-auctions'` (external navigation)
- `Complete Verification` (conditional: `!isReadyToBid`) → `showPage('verification')`
- `Add Payment Method` (conditional: `!cardAdded`) → `showPage('payment')`

**API Calls:**
- `GET /api/public-auctions/upcoming` → `upcomingAuctions`
- `GET /api/auctions/my-bids` → `myBids`

---

### profile — Profile

**Form Fields:**
| Label | Type | State |
|-------|------|-------|
| Profile Photo | file | `updateAvatar()` — FileReader DOM manipulation, NOT server upload |
| First Name | text | `firstName` |
| Last Name | text | `lastName` |
| Email | email | `email` |
| Phone | tel | `phone` |
| Address | text | `address` |
| City | text | `city` |
| Province | select | `province` |
| Postal Code | text | `postal` |

**Actions:**
- `Save Profile` → `handleSaveProfile()` — client-side only, sets `profileSaved=true` for 3 seconds then resets, NO API call — NOT FUNCTIONAL

---

### verification — Verification

**Description:** Identity and address verification for auction bidding.

**Note:** `isReadyToBid = cardAdded && (idUploaded || true)` — ID is optional for bids under $25k per code comment.

**Sections:**
1. **Government ID** — file upload → `handleFileUpload('id')` — sets `idUploaded=true`, NO server upload — NOT FUNCTIONAL
2. **Proof of Address** — file upload → `handleFileUpload('addr')` — sets `addrUploaded=true`, NO server upload — NOT FUNCTIONAL

Status badges: "Verified" if uploaded, "Not Uploaded" otherwise (client-side state only).

---

### payment — Payment

**Sections:**

**Saved Payment Methods:**
- Source: `paymentMethods` from API
- Actions: `Remove` (per row) → NOT FUNCTIONAL

**Add Card form** (shown when `showCardForm=true`):
| Label | Type | State |
|-------|------|-------|
| Cardholder Name | text | `cardName` |
| Card Number | text | `cardNum` |
| Expiry | text | `cardExp` |
| CVV | text | `cardCvv` |

**Actions:**
- `Add Card` → `handleAddCard()` — sets `cardAdded=true` + `alert()`, NO API call — NOT FUNCTIONAL
- `Cancel` → `setShowCardForm(false)`

**API Calls:**
- `GET /api/payments/methods` → `paymentMethods`

---

### upcoming — Upcoming Auctions

**Data:**
- Auction cards mapped from `upcomingAuctions`
- Card fields: Auction Name, Date, Location/Online, Units Count, Starting Bids, Countdown to start

**Actions:**
- `View Auction Page` (per card) → `window.location.href = '/live-auctions'` (external)
- `Register Interest` → NOT FUNCTIONAL

**API Calls:**
- `GET /api/public-auctions/upcoming` → `upcomingAuctions`

---

### my-bids — My Bids

**Data:**
- Table columns: Unit, VIN, My Bid, Current High, Status, Auction Date, Actions
- Source: `myBids`

**Actions:**
- `Increase Bid` (per row) → NOT FUNCTIONAL
- `Withdraw Bid` (per row) → NOT FUNCTIONAL

**API Calls:**
- `GET /api/auctions/my-bids` → `myBids`

---

### won-units — Won Units

**Data:**
- Table columns: Unit, VIN, Winning Bid, Auction Date, Payment Status, Actions
- Source: `wonUnits`

**Actions:**
- `Pay Now` (per row) → `POST /api/payments/pay-invoice` — FUNCTIONAL
- `View Details` (per row) → NOT FUNCTIONAL

**API Calls:**
- `GET /api/auctions/my-bids?won=true` → `wonUnits`
- `POST /api/payments/pay-invoice` body: `{unitId: row.id, amount: row.winningBid}` (on Pay Now click)

---

### settings — Settings

**Tabs (3) — state: `bSettingsTab`:**

#### bs-security — Security
- Fields: Current Password, New Password, Confirm Password, Two-Factor Authentication toggle
- Actions: `Update Password` → NOT FUNCTIONAL

#### bs-notif — Notifications
- Toggles: Outbid alerts, Auction starting soon, Auction won/lost, Payment due, Platform announcements
- Actions: `Save` → NOT FUNCTIONAL

#### bs-account — Account
- Actions: `Delete Account` → `alert('Please contact support@dealersuite360.com')` — NOT FUNCTIONAL

---

---

# FUNCTIONAL API CALLS — COMPLETE LIST

| Portal | Method | Endpoint | Handler | Notes |
|--------|--------|----------|---------|-------|
| Operator | GET | /api/claims | useEffect | |
| Operator | GET | /api/claims?status=pending_review | useEffect | |
| Operator | GET | /api/claims?stale=true | useEffect | |
| Operator | GET | /api/claims/:id | useEffect on claim-detail | |
| Operator | GET | /api/dealerships | useEffect | |
| Operator | GET | /api/dealerships/:id | useEffect on dealer-detail | |
| Operator | POST | /api/dealerships | handleCreateDealer() | |
| Operator | PUT | /api/dealerships/:id | handleApproveDealership(id) | body: {status:'active'} |
| Operator | GET | /api/units | useEffect | |
| Operator | GET | /api/units/:id | useEffect on unit-detail | |
| Operator | POST | /api/units | handleCreateUnit() | |
| Operator | GET | /api/batches | useEffect | |
| Operator | GET | /api/invoices | useEffect | |
| Operator | GET | /api/notifications | useEffect | |
| Operator | PUT | /api/notifications/:id/read | handleMarkNotificationRead(id) | |
| Operator | GET | /api/users | useEffect | |
| Operator | GET | /api/products | useEffect | |
| Dealer | GET | /api/claims | useEffect | |
| Dealer | GET | /api/claims/:id | useEffect on claim-detail | ENDPOINT UNVERIFIED |
| Dealer | GET | /api/units | useEffect | |
| Dealer | GET | /api/units/:id | useEffect on unit-detail | ENDPOINT UNVERIFIED |
| Dealer | POST | /api/units | handleAddUnit() | |
| Dealer | GET | /api/invoices | useEffect | |
| Dealer | GET | /api/tickets | useEffect | |
| Dealer | PUT | /api/notifications/:id/read | handleMarkNotificationRead(id) | |
| Dealer | POST | /api/users/invite | handleInviteCustomer() | body: {email, role:'client'} |
| Customer | GET | /api/customers/me/dashboard | useEffect | ENDPOINT UNVERIFIED |
| Customer | GET | /api/claims | useEffect | |
| Customer | GET | /api/tickets | useEffect + post-submit | |
| Customer | POST | /api/tickets | handleSubmitTicket() | |
| Customer | POST | /api/tickets/:id/messages | handleSendChat() | requires selectedTicketId |
| Customer | GET | /api/parts-orders | useEffect | ENDPOINT UNVERIFIED |
| Bidder | GET | /api/public-auctions/upcoming | useEffect | |
| Bidder | GET | /api/auctions/my-bids | useEffect | |
| Bidder | GET | /api/auctions/my-bids?won=true | useEffect | |
| Bidder | GET | /api/payments/methods | useEffect | |
| Bidder | POST | /api/payments/pay-invoice | Pay Now click (won-units) | body: {unitId, amount} |

---

# NON-FUNCTIONAL SUMMARY

## File Uploads (FileReader DOM Manipulation — NOT Server Uploads)
- OperatorPortal: profile photo (`updateOpProfile()`), unit display photo (`updateOpUnitPhoto()`)
- DealerPortal: profile photo (`updateProfileImage()`), unit photo (`updateUnitPhoto()`), logo (`previewLogo()`)
- CustomerPortal: avatar (`updateCustProfile()`)
- BidderPortal: avatar (`updateAvatar()`)

## DOM innerHTML Manipulation (No React State)
- OperatorPortal: `addServiceRow()`, `addPartRow()` — invoice builder line items

## Client-Side Only (No API Call)
- DealerPortal branding: `applyBranding()`, `previewBranding()`, `restoreBranding()` — CSS variable manipulation only
- BidderPortal: `handleSaveProfile()` — sets UI success state for 3s, no API
- BidderPortal: `handleAddCard()` — sets `cardAdded=true` + shows `alert()`, no API
- BidderPortal: `handleFileUpload('id'|'addr')` — sets boolean flags only, no server upload

## Empty Handlers (onClick with no behavior)
- OperatorPortal: Assign to Me, Flag Photo, Submit to Manufacturer, Log Manufacturer Response, Approve/Deny Line, most Settings save buttons
- DealerPortal: Push to Claim, Save Draft, Reply/Close Ticket, Add Staff Invite, Top Up, Change Plan, Cancel Subscription, Feature Request Submit
- CustomerPortal: View Coverage Details, Renew Warranty, Download Documents, Notify Me (Roadside), Learn More/Purchase (Protection Plans), Send Reply, Close Ticket, Update Password
- BidderPortal: Register Interest, Increase/Withdraw Bid, View Details (won), Delete Account (alert only), all Settings save buttons

## Hardcoded Data Arrays
| Portal | Page | Variable/Content |
|--------|------|-----------------|
| Operator | frc-codes | `frcData` — FRC codes table |
| Operator | changelog (requests) | 6 hardcoded feature request rows |
| Operator | add-feature-req | Dealer names in "Requested By" dropdown |
| Operator | revenue | All revenue stats and charts |
| Customer | documents | Document list |
| Customer | warranty | Countdown bar values |
| Customer | protection-plans | All 4 product cards with prices |
| Bidder | dashboard/upcoming | `AUCTION_START`, `AUCTION_END` constants |

---

# KNOWN BUGS

## Bug 1: CustomerPortal Settings Tab Prefix Mismatch (FUNCTIONAL BUG)
**File:** `client/src/portals/CustomerPortal.tsx`
**Page:** `c-settings`
**Description:** `setCustSettingsTab` sets values like `'cs-profile'` but display conditions check `custSettingsTab === 'cstab-cs-profile'`. The `cstab-` prefix is never set in state. All three settings sub-pages (cs-profile, cs-security, cs-notif) likely never render correctly.

## Bug 2: OperatorPortal Duplicate page-users div (COSMETIC)
**File:** `client/src/portals/OperatorPortal.tsx`
**Lines:** 1031-1053 and 1056-1078
**Description:** Two identical `page-users` divs exist back to back. Copy-paste artifact. Renders the same users content twice within the same page container.

## Bug 3: DealerPortal Settings Tab Potential Prefix Mismatch (POTENTIAL BUG)
**File:** `client/src/portals/DealerPortal.tsx`
**Page:** `d-settings`
**Description:** Same pattern as CustomerPortal — `dSettingsTab` may be set without the display condition prefix. Needs verification against actual component code.
