# DS360 CC REFERENCE — Project Bible
## Drop this in project root as `DS360-CC-REFERENCE.md` before every CC session

**Last updated:** April 26, 2026
**Read this file first before modifying ANY V6 portal code.**

---

# SECTION 1: ARCHITECTURE

## Layout (3-layer)

```
┌──────────┬──────────────────────────────────────────────┐
│ MainNav  │ AppBar (56px, top of content area only)      │
│ (240px)  ├───────────────┬──────────────────────────────┤
│          │ Contextual    │ Page Content                  │
│ full     │ Sidebar       │ (list OR detail tabs)         │
│ height   │ (260px, when  │                               │
│          │  section uses │                               │
│          │  one)         │                               │
└──────────┴───────────────┴──────────────────────────────┘
```

- PortalShell.tsx wraps everything
- SectionLayout.tsx provides optional contextual sidebar
- tokens.ts has all dimensions/colors

## Design Tokens (client/src/components/layout/tokens.ts)

```
appBarHeight: 56
mainNavWidth: 240 (was 220, CC may have set 240)
contextualSidebarWidth: 260

navy: #033280
navyLight: #eaf1fb
green: #0cb22c
borderLight: #e5eaf2
borderLighter: #f0f2f5
bgPage: #f7f9fc

statusActive: #16a34a / bg #dcfce7 / text #166534
statusPending: #f48120 / bg #fef3c7 / text #92400e
statusExpired: #c0392b / bg #fee2e2 / text #991b1b
statusMuted: #888 / bg #f0f2f5 / text #666

sidebarItemPaddingY: 10
sidebarItemPaddingX: 16
sidebarSectionLabelSize: 11
sidebarItemFontSize: 13
sidebarItemMutedSize: 10
```

## Sidebar Visual Pattern (ALL sidebars must match this)

```tsx
// Section header
<div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>
  SECTION LABEL
</div>

// Sidebar item (highlighted when active)
<div style={{
  padding: "10px 16px", cursor: "pointer",
  background: isActive ? "#eaf1fb" : "transparent",
  borderLeft: isActive ? "3px solid #033280" : "3px solid transparent",
}}>
  <div style={{ fontSize: 13, fontWeight: 600, color: isActive ? "#033280" : "#222" }}>
    Item label
  </div>
  <div style={{ fontSize: 10, color: "#888", marginTop: 2 }}>
    Secondary text
  </div>
  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
    <span style={{ fontSize: 9, padding: "1px 5px", background: "#f0f2f5", color: "#666", borderRadius: 3 }}>badge</span>
  </div>
</div>
```

## Data Flow Rules

1. **Dealer creates unit** → visible to: operator (all units), dealer (own dealership), client (if customerId matches)
2. **Dealer creates claim** → visible to: operator ONLY while processing. Client sees status label only. Technician sees NOTHING until dealer manually schedules.
3. **Operator changes claim status** → notification to dealer. Client sees updated status label only.
4. **Dealer uploads photo** → visible to: operator + dealer. Client does NOT see claim photos.
5. **Unit sold to customer** → customer gets client portal access, sees: unit details, warranty status, claim status labels, documents (when implemented)

## RBAC Scoping Rules (enforced on every API endpoint)

| Role | Units | Claims | Dealership Settings | Other Dealers |
|------|-------|--------|--------------------|----|
| operator_admin | ALL | ALL (full detail) | ALL | ALL |
| operator_staff | ALL | ALL (full detail) | View only | ALL |
| dealer_owner | Own dealership | Own dealership (full) | Edit own | NONE |
| dealer_staff | Own dealership | Own dealership (full) | View own | NONE |
| technician | NONE | NONE | NONE | NONE |
| client | Own unit(s) | Status label ONLY | NONE | NONE |
| bidder | NONE | NONE | NONE | NONE |

---

# SECTION 2: SCHEMA OVERVIEW

## Core Tables

### users
id, email, firstName, lastName, phone, passwordHash (nullable, clerk_managed), role, roles (jsonb array), dealershipId (FK), clerkUserId (unique), isActive, createdAt, updatedAt

### dealerships
id, name, email, phone, status, plan, logoUrl, primaryColor, secondaryColor, fontFamily, emailFromName, customSubdomain, brandingTier (base/mid/enterprise), reviewStatus (active/pending_review/suspended/rejected), reviewedAt, reviewedById, reviewNotes, addressLine1, addressLine2, city, stateProvince, postalCode, country, clerkOrgId, createdAt, updatedAt

### units
id, vin, year, make (=manufacturer), model, stockNumber, status (on_lot/delivered/in_service/sold/in_inventory/consigned/sold_out_of_state), dealershipId, customerId (FK users), manufacturerWarrantyStart, manufacturerWarrantyEnd, extendedWarrantyPlan, extendedWarrantyStart, extendedWarrantyEnd, serviceContractActive, serviceContractEnd, intakeDate, soldDate, lotLocation, pdiCompleted, pdiDate, createdAt, updatedAt

### claims
id, claimNumber, dealershipId, unitId, manufacturer, type (daf/pdi/warranty/extended_warranty/insurance), status (draft/submitted/new_unassigned/assigned/in_review/info_requested/submitted_to_mfr/processing/authorized/approved/partial_approval/denied/appeal_pending/reopened/awaiting_parts/parts_ordered/ready_for_repair/repair/completed/payment_requested/awaiting_payment/paid/closed), dealerNotes, estimatedAmount, assignedTo (userId), approvedAt, approvedById, submittedAt, createdAt, updatedAt

### module_catalog
id, moduleKey (claims/techflow/marketplace/parts_store/ai_fi/marketing/consignment/financing), name, description, pricingType (subscription/per_use/hybrid/commission), defaultMonthlyCents, defaultSetupCents, defaultPerUseCents, defaultCommissionBps, requiresBrandingTier, isBaseRequired, sortOrder, active

### dealership_modules
id, dealershipId, moduleKey, status (enabled/disabled/trial/past_due), monthlyCents, setupCents, perUseCents, commissionBps, enabledAt, enabledById, disabledAt, trialEndsAt, notes

### v6_uploads
id, scope (claims/units), scopeId, filename, contentType, sizeBytes, r2Key, publicUrl, uploadStatus (pending/uploaded/failed), photoType, uploadedById, createdAt

### notification_deliveries
id, userId, eventType, title, body, readAt, deeplinkUrl, channel, claimId, createdAt

### events
id, eventType, actorId, actorRole, payload (jsonb), priority, createdAt

## External Systems

| System | Integration | Tables |
|--------|------------|--------|
| Clerk | Auth, user sync, org membership | users.clerkUserId, dealerships.clerkOrgId |
| Cloudflare R2 | Photo storage | v6_uploads |
| Resend | Email delivery | email-worker.ts polls notification_deliveries |
| Stripe | Billing (DEFERRED) | — |
| Neon PostgreSQL | Primary DB | all tables |
| Railway | Hosting, auto-deploy from main | — |

---

# SECTION 3: CLAIMS WORKFLOW (CORRECT business logic)

```
DEALER                          OPERATOR                        CLIENT
  │                               │                               │
  ├── Opens unit profile          │                               │
  ├── Clicks "+ New Claim"        │                               │
  ├── Creates DRAFT claim         │                               │
  ├── Uploads photos (≥1 req)     │                               │
  ├── Fills type, notes           │                               │
  ├── Clicks "Submit"             │                               │
  │   claim.status → new_unassig  │                               │
  │   event: claim.submitted ─────┤                               │
  │                               ├── Sees in Claim Queue         │
  │                               │   (New/Unassigned column)     │ Sees: "Claim in progress"
  │                               ├── Clicks claim card           │ (status label ONLY)
  │                               │   → Full unit file opens      │ NO details visible
  │                               │   (VIN, warranties, past      │
  │                               │    claims, customer, photos)  │
  │                               │                               │
  │                               ├── "Assign to me"              │
  │                               │   status → assigned           │
  │                               │                               │
  │                               ├── "Request more info"         │
  │   ← notification ─────────── │   status → info_requested     │
  │   Dealer responds with info   │                               │
  │   event: claim.dealer_responded ──┤                           │
  │                               │                               │
  │                               ├── "Approve"                   │
  │   ← notification ─────────── │   status → approved           │ Sees: "Claim approved"
  │                               │                               │
  │   OR                          │                               │
  │                               ├── "Deny"                      │
  │   ← notification ─────────── │   status → denied             │ Sees: "Claim denied"
  │                               │                               │
  │   After approval:             │                               │
  │   Dealer manually schedules   │                               │
  │   tech via TechFlow (future)  │                               │
  └───────────────────────────────┴───────────────────────────────┘
```

---

# SECTION 4: ALL PORTAL MENU ITEMS


## DS360_MASTER PORTAL (26 pages)

### Section: Management

**`master.mgmt.dashboard`** — Dashboard
  - `master.mgmt.dashboard.revenue_overview`: Revenue overview ← [master.mgmt.revenue_billing]
  - `master.mgmt.dashboard.active_dealers_growth`: Active dealers & growth ← [master.mgmt.dealer_accounts]
  - `master.mgmt.dashboard.subscription_mrr`: Subscription MRR ← ext:[stripe=subscription metrics]
  - `master.mgmt.dashboard.alerts_notifications`: Alerts & notifications ← [system.event_feed]

**`master.mgmt.dealer_accounts`** — Dealer Accounts
  - `master.mgmt.dealer_accounts.all_dealers`: All Dealers (list view, no external)
  - `master.mgmt.dealer_accounts.add_new_dealer`: Add New Dealer → [dealer.* (provisions tenant)] → ext:[stripe=create customer + subscription, email=welcome + invite]
  - `master.mgmt.dealer_accounts.df_account_overview`: Dealer File › Account overview
  - `master.mgmt.dealer_accounts.df_subscription_plan`: Dealer File › Subscription & plan ← ext:[stripe=subscription data] → ext:[stripe=modify subscription]
  - `master.mgmt.dealer_accounts.df_services_enrolled`: Dealer File › Services enrolled
  - `master.mgmt.dealer_accounts.df_custom_pricing`: Dealer File › Custom pricing & terms
  - `master.mgmt.dealer_accounts.df_billing_history`: Dealer File › Billing history ← ext:[stripe=invoice history]
  - `master.mgmt.dealer_accounts.df_documents_contracts`: Dealer File › Documents & contracts
  - `master.mgmt.dealer_accounts.df_activity_log`: Dealer File › Activity log

**`master.mgmt.catalog`** — Product & Service Catalog
  - `master.mgmt.catalog.all_services`: All Services
  - `master.mgmt.catalog.gap`: GAP Coverage
  - `master.mgmt.catalog.roadside`: Roadside Assistance
  - `master.mgmt.catalog.warranty_plans`: Warranty Plans
  - `master.mgmt.catalog.extended_warranty`: Extended Warranty
  - `master.mgmt.catalog.wheel_tire`: Wheel & Tire
  - `master.mgmt.catalog.appearance`: Appearance Protection
  - `master.mgmt.catalog.key_replacement`: Key Replacement
  - `master.mgmt.catalog.plans_pricing`: Plans & Pricing
  - `master.mgmt.catalog.push_updates`: Push Updates → Dealers → [dealer.ops.sales_services (all), dealer.ops.messages (all)] → ext:[email=broadcast catalog update]

**`master.mgmt.revenue_billing`** — Revenue & Billing
  - `master.mgmt.revenue_billing.revenue_dashboard`: Revenue dashboard ← ext:[stripe=aggregated revenue]
  - `master.mgmt.revenue_billing.subscription_billing`: Subscription billing ← ext:[stripe=subscription webhooks] → ext:[stripe=manage subscriptions]
  - `master.mgmt.revenue_billing.invoice_management`: Invoice management → [dealer.ops.documents] ← ext:[stripe=invoice events] → ext:[stripe=create/modify invoice, email=deliver invoice + receipt]
  - `master.mgmt.revenue_billing.commission_reports`: Commission reports ← [dealer.ops.sales_services, marketplace.main.my_bids]

**`master.mgmt.communications`** — Communications
  - `master.mgmt.communications.push_notifications`: Push notifications → Dealers → [dealer.ops.dashboard (all)] → ext:[email=deliver push]
  - `master.mgmt.communications.broadcast_messages`: Broadcast messages → [dealer.ops.messages (all)] → ext:[email=deliver broadcast]
  - `master.mgmt.communications.message_history`: Message history

**`master.mgmt.staff_permissions`** — Staff & Permissions
  - `master.mgmt.staff_permissions.staff_accounts`: Staff accounts → ext:[email=operator staff invite]
  - `master.mgmt.staff_permissions.roles_permissions`: Roles & permissions

**`master.mgmt.platform_settings`** — Platform Settings
  - `master.mgmt.platform_settings.general_settings`: General settings
  - `master.mgmt.platform_settings.email_templates`: Email templates → ext:[email=template config]
  - `master.mgmt.platform_settings.integrations`: Integrations → ext:[stripe=API key config, tavus=API key config, anthropic=API key config, cloudflare=API token config]
  - `master.mgmt.platform_settings.ds360_branding`: DS360 branding

**`master.mgmt.blog`** — Blog Management
  - `master.mgmt.blog.queue`: Queue (scheduled)
  - `master.mgmt.blog.drafts`: Drafts (AI-generated) ← ext:[anthropic=generated draft]
  - `master.mgmt.blog.published`: Published → [public_marketing_site.blog]
  - `master.mgmt.blog.cron_scheduler`: Cron scheduler config → ext:[anthropic=trigger generation (cron)]

**`master.mgmt.financing_partners`** — Financing Partners
  - `master.mgmt.financing_partners.all_lenders`: All Lenders
  - `master.mgmt.financing_partners.add_lender`: Add Lender → [dealer.ops.financing (lender becomes available)] → ext:[lender_apis=establish API connection]
  - `master.mgmt.financing_partners.lf_connection_api`: Lender File › Connection status & API ← ext:[lender_apis=connection health check]
  - `master.mgmt.financing_partners.lf_rate_sheets`: Lender File › Rate sheets ← ext:[lender_apis=pull current rate sheet]
  - `master.mgmt.financing_partners.lf_approval_rules`: Lender File › Approval rules engine
  - `master.mgmt.financing_partners.lf_commission_structure`: Lender File › Commission structure (Super Admin only)
  - `master.mgmt.financing_partners.integration_settings`: Integration settings → ext:[lender_apis=credential config]
  - `master.mgmt.financing_partners.push_lender_updates`: Push lender updates → Dealers → [dealer.ops.financing (all), dealer.ops.messages (all)] → ext:[email=lender update notification]

**`master.mgmt.parts_catalog`** — Parts Catalog
  - `master.mgmt.parts_catalog.master_parts_list`: Master Parts List
  - `master.mgmt.parts_catalog.add_part`: Add Part → [dealer.ops.parts_store (becomes available)]
  - `master.mgmt.parts_catalog.pd_sku_description`: Part Detail › SKU & description
  - `master.mgmt.parts_catalog.pd_category`: Part Detail › Category
  - `master.mgmt.parts_catalog.pd_supplier_mapping`: Part Detail › Supplier mapping → ext:[parts_suppliers=map to supplier SKU]
  - `master.mgmt.parts_catalog.pd_master_pricing`: Part Detail › Master pricing (Super Admin only)
  - `master.mgmt.parts_catalog.pd_markup_rules`: Part Detail › Markup rules
  - `master.mgmt.parts_catalog.supplier_relationships`: Supplier relationships → ext:[parts_suppliers=relationship config]
  - `master.mgmt.parts_catalog.push_catalog_to_dealers`: Push Updates → Dealers → [dealer.ops.parts_store (all)] → ext:[email=parts catalog update notification]

**`master.mgmt.campaign_templates`** — Campaign Templates
  - `master.mgmt.campaign_templates.email_template_library`: Email template library
  - `master.mgmt.campaign_templates.landing_page_templates`: Landing page templates
  - `master.mgmt.campaign_templates.lead_capture_templates`: Lead capture form templates
  - `master.mgmt.campaign_templates.seo_page_templates`: SEO page templates
  - `master.mgmt.campaign_templates.push_templates_to_dealers`: Push templates → Dealers → [dealer.ops.marketing (all)] → ext:[email=new template available notification]

**`master.mgmt.consignment_oversight`** — Consignment Oversight
  - `master.mgmt.consignment_oversight.all_agreements`: All consignment agreements (cross-dealer) ← [dealer.ops.consignment (all)]
  - `master.mgmt.consignment_oversight.active_consignments`: Active consignments
  - `master.mgmt.consignment_oversight.payout_tracking`: Payout tracking ← ext:[stripe=Stripe Connect payout state]
  - `master.mgmt.consignment_oversight.disputes`: Disputes & issues

### Section: Operations

**`master.ops.dashboard`** — Operations Dashboard
  - `master.ops.dashboard.claim_queue_overview`: Claim queue overview ← [master.ops.claim_queue]
  - `master.ops.dashboard.new_submissions`: New submissions ← [dealer.ops.claims (all)]
  - `master.ops.dashboard.notifications_feed`: Notifications feed
  - `master.ops.dashboard.parts_awaiting_receipt`: Parts awaiting receipt ← [master.ops.parts_management]

**`master.ops.claim_queue`** — Claim Queue
  - `master.ops.claim_queue.new_unassigned`: New / Unassigned
  - `master.ops.claim_queue.in_review`: In Review
  - `master.ops.claim_queue.submitted_to_mfr`: Submitted to Manufacturer → ext:[email=status notif → dealer + client]
  - `master.ops.claim_queue.awaiting_parts`: Awaiting Parts → ext:[email=status notif]
  - `master.ops.claim_queue.awaiting_payment`: Awaiting Payment → ext:[email=status notif]
  - `master.ops.claim_queue.completed`: Completed → ext:[email=completion notif]

**`master.ops.work_by_dealer`** — Work by Dealer
  - `master.ops.work_by_dealer.units_vins`: Units / VINs ← [dealer.ops.inventory]
  - `master.ops.work_by_dealer.active_claims`: Active Claims ← [dealer.ops.claims]
  - `master.ops.work_by_dealer.cd_submitted_photos`: Claim Detail › Submitted photos → ext:[anthropic=AI Doc Scanner on photos]
  - `master.ops.work_by_dealer.cd_3c_documentation`: Claim Detail › 3C documentation
  - `master.ops.work_by_dealer.cd_frc_lines`: Claim Detail › FRC lines
  - `master.ops.work_by_dealer.cd_parts_ordering`: Claim Detail › Parts ordering → [master.ops.parts_management] → ext:[parts_suppliers=create order]
  - `master.ops.work_by_dealer.cd_mfr_submission`: Claim Detail › Manufacturer submission → ext:[mfr_portals=submit (off-platform)]
  - `master.ops.work_by_dealer.cd_invoice_payment`: Claim Detail › Invoice & payment → ext:[stripe=create invoice (Super Admin only), email=invoice delivery] (Super Admin only)
  - `master.ops.work_by_dealer.cd_dealer_thread`: Claim Detail › Dealer message thread → [dealer.ops.messages] → ext:[email=message notif]
  - `master.ops.work_by_dealer.warranty_sales_verify`: Warranty sales (verify) ← [dealer.ops.sales_services]
  - `master.ops.work_by_dealer.service_contracts`: Service contracts ← [dealer.ops.documents]
  - `master.ops.work_by_dealer.dealer_documents`: Dealer documents ← [dealer.ops.documents]

**`master.ops.parts_management`** — Parts Management
  - `master.ops.parts_management.active_orders`: Active orders → ext:[parts_suppliers=place + track]
  - `master.ops.parts_management.received`: Received → [dealer.ops.claims (parts status)] ← ext:[parts_suppliers=receiving confirmation] → ext:[email=notify dealer]
  - `master.ops.parts_management.suppliers`: Suppliers

**`master.ops.manufacturer_portals`** — Manufacturer Portals
  - `master.ops.manufacturer_portals.jayco`: Jayco → ext:[mfr_portals=launch link]
  - `master.ops.manufacturer_portals.forest_river`: Forest River → ext:[mfr_portals=launch link]
  - `master.ops.manufacturer_portals.heartland`: Heartland → ext:[mfr_portals=launch link]
  - `master.ops.manufacturer_portals.keystone`: Keystone → ext:[mfr_portals=launch link]
  - `master.ops.manufacturer_portals.columbia_nw`: Columbia NW → ext:[mfr_portals=launch link]
  - `master.ops.manufacturer_portals.midwest_auto`: Midwest Auto → ext:[mfr_portals=launch link]

**`master.ops.reporting`** — Reporting
  - `master.ops.reporting.claims_by_dealer`: Claims by dealer ← [dealer.ops.claims (aggregate)]
  - `master.ops.reporting.revenue_per_dealer`: Revenue per dealer ← ext:[stripe=revenue data]
  - `master.ops.reporting.processing_times`: Processing times

**`master.ops.financing_applications`** — Financing Applications
  - `master.ops.financing_applications.new_submitted`: New / Submitted ← [dealer.ops.financing]
  - `master.ops.financing_applications.pending_lender_review`: Pending Lender Review ← ext:[lender_apis=application status polling]
  - `master.ops.financing_applications.approved`: Approved → [dealer.ops.financing, client.main.financing] ← ext:[lender_apis=approval decision + terms] → ext:[email=approval notification]
  - `master.ops.financing_applications.declined`: Declined → [dealer.ops.financing] ← ext:[lender_apis=decline reason] → ext:[email=decline notification]
  - `master.ops.financing_applications.funded`: Funded → [client.main.financing (loan active), master.mgmt.revenue_billing (commission)] ← ext:[lender_apis=funding confirmation]
  - `master.ops.financing_applications.stuck_followup`: Stuck / Follow-up

**`master.ops.techflow_oversight`** — TechFlow Oversight
  - `master.ops.techflow_oversight.all_technicians`: All technicians (cross-dealer) ← [dealer.ops.techflow (all)]
  - `master.ops.techflow_oversight.active_dispatches`: Active dispatches (live map) ← ext:[maps_routing=live tech positions]
  - `master.ops.techflow_oversight.completed_jobs`: Completed jobs
  - `master.ops.techflow_oversight.labor_hours_reports`: Labor hours reports ← [dealer.ops.techflow] → [master.ops.work_by_dealer (Claim Detail labor sync)]
  - `master.ops.techflow_oversight.claim_workorder_sync`: Claim → work order sync status ← [master.ops.claim_queue, dealer.ops.techflow]

**`master.ops.parts_orders`** — Parts Orders
  - `master.ops.parts_orders.new_client_orders`: New client orders ← [client.main.parts_store]
  - `master.ops.parts_orders.fulfillment_queue`: Fulfillment queue ← [dealer.ops.parts_store]
  - `master.ops.parts_orders.shipped`: Shipped → ext:[email=shipment notification to client]
  - `master.ops.parts_orders.delivered`: Delivered → ext:[email=delivery confirmation]
  - `master.ops.parts_orders.returns_issues`: Returns / issues

### Section: Marketplace

**`master.marketplace.listings_oversight`** — Listings Oversight
  - `master.marketplace.listings_oversight.all_listings`: All active listings (read-only) ← [marketplace.main.sell, dealer.ops.consignment]
  - `master.marketplace.listings_oversight.flagged_listings`: Flagged listings (review queue)
  - `master.marketplace.listings_oversight.takedown_action`: Takedown (admin action) → [marketplace.main.sell (force expire), dealer.ops.consignment] → ext:[email=takedown notice to seller] (Super Admin only)
  - `master.marketplace.listings_oversight.listing_history`: Listing history (sold / expired / removed)

**`master.marketplace.active_auctions`** — Active Auctions
  - `master.marketplace.active_auctions.dealer_to_dealer_live`: Dealer-to-dealer live auctions ← [marketplace.main.browse]
  - `master.marketplace.active_auctions.public_showcase_live`: Public Showcase live (24-hr windows) ← [marketplace.main.public_showcase]
  - `master.marketplace.active_auctions.live_monthly_auctions`: Live Monthly public auctions (Bidder Portal) ← [bidder.main.live_auctions]
  - `master.marketplace.active_auctions.bid_activity_feed`: Bid activity feed (all auctions)

**`master.marketplace.transactions`** — Transactions
  - `master.marketplace.transactions.completed_sales`: Completed sales ← [marketplace.main.my_bids, bidder.main.my_bids]
  - `master.marketplace.transactions.refunds_disputes`: Refunds & disputes → ext:[stripe=process refund / dispute resolution]
  - `master.marketplace.transactions.commission_ledger`: DS360 commission ledger ($250 flat) ← [marketplace.main.escrow, bidder.main.escrow] → [master.mgmt.revenue_billing] (Super Admin only)
  - `master.marketplace.transactions.tax_reporting`: Tax reporting (1099-K exports) → ext:[stripe=pull 1099 data] (Super Admin only)

**`master.marketplace.escrow_admin`** — Escrow Admin
  - `master.marketplace.escrow_admin.all_escrow_holds`: All active escrow holds ($500 × N bids) ← ext:[stripe=aggregate hold state]
  - `master.marketplace.escrow_admin.release_queue`: Release queue (pending winner confirmation) → ext:[stripe=release escrow to seller]
  - `master.marketplace.escrow_admin.manual_override`: Manual override / resolution → ext:[stripe=force release / refund] (Super Admin only)
  - `master.marketplace.escrow_admin.escrow_audit_log`: Escrow audit log

**`master.marketplace.members`** — Members
  - `master.marketplace.members.dealer_bidders`: Dealer bidders ($499/yr members) ← [dealer.account.my_subscription, marketplace.account.membership]
  - `master.marketplace.members.public_bidders_dealer_scoped`: Public bidders (dealer-scoped) ← [dealer.ops.portal_settings.partners]
  - `master.marketplace.members.public_bidders_independent`: Public bidders (independent via Bidder Portal) ← [bidder.account.verification]
  - `master.marketplace.members.verification_queue`: Verification queue (manual review) (Super Admin only)
  - `master.marketplace.members.banned_restricted`: Banned / restricted accounts (Super Admin only)


## DEALER PORTAL (24 pages)

### Section: Operations

**`dealer.ops.dashboard`** — Dashboard
  - `dealer.ops.dashboard.active_claims_summary`: Active claims summary ← [dealer.ops.claims]
  - `dealer.ops.dashboard.recent_warranty_sales`: Recent warranty sales ← [dealer.ops.sales_services]
  - `dealer.ops.dashboard.notifications_from_ds360`: Notifications from DS360 ← [master.mgmt.communications] ← ext:[email=notif surface]
  - `dealer.ops.dashboard.revenue_snapshot`: Revenue snapshot ← [dealer.ops.sales_services] (Hidden from Dealer Staff)

**`dealer.ops.claims`** — Claims
  - `dealer.ops.claims.all_claims`: All Claims
  - `dealer.ops.claims.snc_unit_lookup`: Submit New Claim › Unit lookup / VIN ← [dealer.ops.inventory]
  - `dealer.ops.claims.snc_claim_type`: Submit New Claim › Claim type
  - `dealer.ops.claims.snc_description`: Submit New Claim › Description & symptom
  - `dealer.ops.claims.snc_photo_upload`: Submit New Claim › Photo upload → ext:[anthropic=AI Doc Scanner extracts data]
  - `dealer.ops.claims.snc_submit`: Submit New Claim › Submit → [master.ops.claim_queue, client.main.claims (if linked)] → ext:[email=submission confirmation]
  - `dealer.ops.claims.csv_status_timeline`: Claim Status View › Status timeline ← [master.ops.claim_queue]
  - `dealer.ops.claims.csv_photos`: Claim Status View › Photos
  - `dealer.ops.claims.csv_add_note`: Claim Status View › Add note → [master.ops.work_by_dealer]
  - `dealer.ops.claims.csv_parts_status`: Claim Status View › Parts status ← [master.ops.parts_management]
  - `dealer.ops.claims.csv_thread`: Claim Status View › DS360 message thread → [master.ops.work_by_dealer] → ext:[email=message notif]

**`dealer.ops.inventory`** — Units / Inventory
  - `dealer.ops.inventory.all_units`: All Units
  - `dealer.ops.inventory.add_unit`: Add Unit → ext:[anthropic=Unit Tag Scanner (mobile PWA, optional)]
  - `dealer.ops.inventory.ud_specs`: Unit Detail › Specs (VIN, model, year)
  - `dealer.ops.inventory.ud_client_linked`: Unit Detail › Client linked ← [dealer.ops.clients] → [client.main.vehicle (when linked)]
  - `dealer.ops.inventory.ud_warranties_services`: Unit Detail › Active warranties & services ← [dealer.ops.sales_services]
  - `dealer.ops.inventory.ud_claims_history`: Unit Detail › Claims history ← [dealer.ops.claims]

**`dealer.ops.clients`** — Clients
  - `dealer.ops.clients.all_clients`: All Clients
  - `dealer.ops.clients.add_client`: Add Client → [client.* (provisions Client Portal)] → ext:[email=client invite]
  - `dealer.ops.clients.cf_profile`: Client File › Profile & contact info ← [client.main.account]
  - `dealer.ops.clients.cf_vehicles`: Client File › Vehicle(s) owned ← [dealer.ops.inventory]
  - `dealer.ops.clients.cf_warranties`: Client File › Active warranties ← [dealer.ops.sales_services]
  - `dealer.ops.clients.cf_services`: Client File › Active services ← [dealer.ops.sales_services]
  - `dealer.ops.clients.cf_claim_history`: Client File › Claim history ← [dealer.ops.claims]
  - `dealer.ops.clients.cf_fi_products`: Client File › F&I products sold ← [dealer.ops.sales_services]
  - `dealer.ops.clients.cf_fi_presenter_link`: Client File › AI F&I presenter link → [client.main.fi_offers] → ext:[tavus=initialize avatar session, anthropic=configure F&I AI brain context, email=F&I session invite]

**`dealer.ops.sales_services`** — Sales & Services
  - `dealer.ops.sales_services.ns_select_client_unit`: New Sale › Select client & unit ← [dealer.ops.clients, dealer.ops.inventory]
  - `dealer.ops.sales_services.ns_choose_product`: New Sale › Choose product ← [master.mgmt.catalog]
  - `dealer.ops.sales_services.ns_terms_pricing`: New Sale › Set terms & confirm pricing ← [master.mgmt.dealer_accounts (custom pricing)]
  - `dealer.ops.sales_services.ns_generate_contract`: New Sale › Generate contract → [client.main.warranties, client.main.services, client.main.documents, master.mgmt.revenue_billing (commission)] → ext:[email=deliver contract]
  - `dealer.ops.sales_services.warranty_plans`: Warranty Plans ← [master.mgmt.catalog]
  - `dealer.ops.sales_services.gap`: GAP Coverage ← [master.mgmt.catalog]
  - `dealer.ops.sales_services.roadside`: Roadside Assistance ← [master.mgmt.catalog]
  - `dealer.ops.sales_services.extended_warranty`: Extended Warranty ← [master.mgmt.catalog]
  - `dealer.ops.sales_services.wheel_tire`: Wheel & Tire ← [master.mgmt.catalog]
  - `dealer.ops.sales_services.other_services`: Other Services ← [master.mgmt.catalog]
  - `dealer.ops.sales_services.commission_tracker`: Commission Tracker (Hidden from Dealer Staff)

**`dealer.ops.documents`** — Documents
  - `dealer.ops.documents.contracts`: Contracts ← [dealer.ops.sales_services]
  - `dealer.ops.documents.invoices_from_ds360`: Invoices from DS360 ← [master.mgmt.revenue_billing] (Hidden from Dealer Staff)
  - `dealer.ops.documents.my_reports`: My Reports

**`dealer.ops.messages`** — Messages
  - `dealer.ops.messages.inbox_from_ds360`: Inbox (from DS360) ← [master.mgmt.communications] ← ext:[email=notif surface]
  - `dealer.ops.messages.claim_threads`: Claim threads ← [master.ops.work_by_dealer] → [master.ops.work_by_dealer (replies)] → ext:[email=message notif]
  - `dealer.ops.messages.product_notifications`: Product notifications ← [master.mgmt.catalog]

**`dealer.ops.financing`** — Financing
  - `dealer.ops.financing.na_select_client_unit`: New Application › Select client & unit ← [dealer.ops.clients, dealer.ops.inventory]
  - `dealer.ops.financing.na_credit_info`: New Application › Credit info capture
  - `dealer.ops.financing.na_select_lenders`: New Application › Select lenders to submit to ← [master.mgmt.financing_partners]
  - `dealer.ops.financing.na_submit`: New Application › Submit → [master.ops.financing_applications] → ext:[lender_apis=submit application to selected lenders, email=application submission confirmation]
  - `dealer.ops.financing.as_timeline`: Application Status › Timeline ← [master.ops.financing_applications]
  - `dealer.ops.financing.as_lender_responses`: Application Status › Lender responses ← ext:[lender_apis=approval/decline/counter responses]
  - `dealer.ops.financing.as_rate_comparison`: Application Status › Rate comparison
  - `dealer.ops.financing.as_select_finalize`: Application Status › Select lender & finalize → [client.main.financing (loan documents), client.main.documents] → ext:[lender_apis=commit acceptance]
  - `dealer.ops.financing.funded_deals`: Funded Deals → [master.mgmt.revenue_billing (financing commission)]
  - `dealer.ops.financing.payment_tracking`: Client payment tracking (view) ← ext:[lender_apis=payment status]

**`dealer.ops.parts_store`** — Parts Store
  - `dealer.ops.parts_store.store_settings`: Store Settings (name, visibility)
  - `dealer.ops.parts_store.my_inventory`: My Inventory (from DS360 catalog) ← [master.mgmt.parts_catalog]
  - `dealer.ops.parts_store.pricing_markup`: Pricing & Markup
  - `dealer.ops.parts_store.client_orders_incoming`: Client Orders (incoming) ← [client.main.parts_store]
  - `dealer.ops.parts_store.fulfillment_queue`: Fulfillment queue → [master.ops.parts_orders] → ext:[parts_suppliers=drop-ship order to supplier, email=fulfillment status to client]
  - `dealer.ops.parts_store.shipped_delivered`: Shipped / Delivered tracking ← ext:[parts_suppliers=tracking numbers]
  - `dealer.ops.parts_store.returns_exchanges`: Returns & exchanges → ext:[stripe=refund processing]
  - `dealer.ops.parts_store.parts_revenue_tracker`: Parts revenue tracker → [master.mgmt.revenue_billing] (Hidden from Dealer Staff)

**`dealer.ops.consignment`** — Consignment
  - `dealer.ops.consignment.all_consignors`: All Consignors
  - `dealer.ops.consignment.add_consignor`: Add Consignor → ext:[stripe=create Stripe Connect account for payout, email=consignor welcome + onboarding]
  - `dealer.ops.consignment.cf_contact_info`: Consignor File › Contact info
  - `dealer.ops.consignment.cf_agreement`: Consignor File › Agreement (% split, duration)
  - `dealer.ops.consignment.cf_payout_history`: Consignor File › Payout history ← ext:[stripe=Connect transfer history]
  - `dealer.ops.consignment.cf_banking_info`: Consignor File › Banking info ← ext:[stripe=Connect onboarding status] (Sensitive; access-controlled)
  - `dealer.ops.consignment.consigned_units`: Consigned Units (flagged inventory) ← [dealer.ops.inventory]
  - `dealer.ops.consignment.active_listings`: Active listings → [marketplace.main.sell (if listed to marketplace)]
  - `dealer.ops.consignment.sold_consignments`: Sold consignments → [master.mgmt.consignment_oversight]
  - `dealer.ops.consignment.payouts_pending`: Payouts pending → ext:[stripe=Stripe Connect transfer to consignor, email=payout sent notification]

**`dealer.ops.techflow`** — TechFlow
  - `dealer.ops.techflow.technicians`: Technicians (manage tech staff) → ext:[email=tech invite email]
  - `dealer.ops.techflow.wo_incoming_from_claims`: Work Orders › Incoming from Claims ← [master.ops.claim_queue (approved warranty)] (Auto-generated from approved warranty claim)
  - `dealer.ops.techflow.wo_scheduled`: Work Orders › Scheduled
  - `dealer.ops.techflow.wo_in_progress`: Work Orders › In Progress
  - `dealer.ops.techflow.wo_completed`: Work Orders › Completed → [master.ops.work_by_dealer (labor hours → Claim Invoice)]
  - `dealer.ops.techflow.wo_invoiced`: Work Orders › Invoiced → ext:[stripe=labor invoice (if billable)]
  - `dealer.ops.techflow.dispatch_board`: Dispatch board (map + route) ← ext:[maps_routing=tech locations + traffic] → ext:[maps_routing=calculate route to service location]
  - `dealer.ops.techflow.labor_hours_tracking`: Labor Hours (syncs to claim invoice) → [master.ops.work_by_dealer (labor sync)]
  - `dealer.ops.techflow.mobile_service_scheduling`: Mobile Service Scheduling → ext:[maps_routing=route optimization + ETA, email=appointment confirmation to client]
  - `dealer.ops.techflow.client_service_requests`: Client service requests (inbox) ← [client.main.service_appointments]

**`dealer.ops.marketing`** — Marketing
  - `dealer.ops.marketing.c_email_campaigns`: Campaigns › Email campaigns ← [master.mgmt.campaign_templates, dealer.ops.clients (customer list)] → ext:[email=send marketing email to client list]
  - `dealer.ops.marketing.c_campaign_library`: Campaigns › Library (saved)
  - `dealer.ops.marketing.c_analytics`: Campaigns › Analytics (opens, clicks, conversions) ← ext:[email=delivery + engagement events]
  - `dealer.ops.marketing.lc_forms`: Lead Capture › Forms (create/manage) ← [master.mgmt.campaign_templates]
  - `dealer.ops.marketing.lc_leads_inbox`: Lead Capture › Leads inbox → [dealer.ops.clients (convert lead → client)] ← ext:[email=form submission via email webhook]
  - `dealer.ops.marketing.landing_pages`: Landing Pages ← [master.mgmt.campaign_templates]
  - `dealer.ops.marketing.seo_pages`: SEO pages (dealer directory) ← [master.mgmt.campaign_templates]
  - `dealer.ops.marketing.customer_segmentation`: Customer segmentation ← [dealer.ops.clients]

### Section: Account

**`dealer.account.my_subscription`** — My Subscription
  - `dealer.account.my_subscription.current_plan_billing`: Current plan & billing → [master.mgmt.revenue_billing] ← ext:[stripe=Customer Portal billing data] → ext:[stripe=update payment method / change subscription, email=billing + renewal reminders]
  - `dealer.account.my_subscription.invoices_from_ds360`: Invoices from DS360 ← ext:[stripe=invoice list]

**`dealer.account.portal_settings`** — Portal Settings
  - `dealer.account.portal_settings.tab_branding`: Branding tab (logo, colors, white-label) → [client.* (branding)]
  - `dealer.account.portal_settings.tab_domain`: Domain tab (CNAME) → ext:[cloudflare=create CNAME + auto SSL]
  - `dealer.account.portal_settings.tab_staff`: Staff tab (manage dealer_staff accounts) → [dealer.* (provisions Dealer Staff)] → ext:[email=Dealer Staff invite]
  - `dealer.account.portal_settings.tab_technicians`: Technicians tab (manage technician accounts) → [dealer.ops.techflow (tech roster)] → ext:[email=Technician invite]
  - `dealer.account.portal_settings.tab_partners`: Partners tab (public_bidders + consignors scoped access) → [dealer.ops.consignment (consignor link), dealer.marketplace.* (public_bidder scope)] → ext:[email=partner access invite, stripe=Stripe Connect init (consignors)]
  - `dealer.account.portal_settings.tab_notifications`: Notifications tab → ext:[email=preference confirmation]

### Section: Marketplace

**`dealer.marketplace.browse`** — Browse Listings
  - `dealer.marketplace.browse.all_active`: All Active Auctions ← [marketplace.main.sell (all listings)]
  - `dealer.marketplace.browse.search_filter`: Search & Filter (manufacturer, year, price)
  - `dealer.marketplace.browse.listing_detail`: Listing Detail (specs, photos, current bid, history)
  - `dealer.marketplace.browse.place_bid`: Place bid → [dealer.marketplace.my_bids, marketplace.main.my_bids] → ext:[stripe=$500 escrow hold, email=bid confirmation]
  - `dealer.marketplace.browse.watch_listing`: Watch listing

**`dealer.marketplace.my_bids`** — My Bids
  - `dealer.marketplace.my_bids.active_bids`: Active Bids
  - `dealer.marketplace.my_bids.won_units`: Won Units → [master.mgmt.revenue_billing ($250 commission), dealer.ops.inventory (acquire into inventory)] → ext:[stripe=escrow release to seller + commission capture, email=Won notification]
  - `dealer.marketplace.my_bids.lost_bids`: Lost Bids
  - `dealer.marketplace.my_bids.watchlist`: Watchlist

**`dealer.marketplace.my_listings`** — My Listings (Sell)
  - `dealer.marketplace.my_listings.create_listing`: Create New Listing ← [dealer.ops.inventory, dealer.ops.consignment (consigned units)] → [marketplace.main.browse, dealer.marketplace.browse] → ext:[email=listing-created confirmation]
  - `dealer.marketplace.my_listings.active_listings`: Active listings
  - `dealer.marketplace.my_listings.sold`: Sold → [dealer.ops.consignment (payout trigger if consigned)] → ext:[email=sold notification]
  - `dealer.marketplace.my_listings.expired`: Expired

**`dealer.marketplace.public_showcase`** — Public Showcase
  - `dealer.marketplace.public_showcase.monthly_auctions`: Monthly 24-hr public auctions
  - `dealer.marketplace.public_showcase.my_showcase_listings`: My Showcase listings
  - `dealer.marketplace.public_showcase.buyer_inquiries`: Buyer inquiries → ext:[email=inquiry response]

**`dealer.marketplace.escrow_payments`** — Escrow & My Payments
  - `dealer.marketplace.escrow_payments.my_escrow_holds`: My active escrow holds ← ext:[stripe=hold state for this dealer]
  - `dealer.marketplace.escrow_payments.payment_history`: Payment history ← ext:[stripe=payment history]
  - `dealer.marketplace.escrow_payments.pending_releases`: Pending releases
  - `dealer.marketplace.escrow_payments.commission_paid`: DS360 commission paid ($250 per win)

### Section: Consignor Guest

**`dealer.consignor_guest.my_units`** — My Consigned Unit(s)
  - `dealer.consignor_guest.my_units.listing_status`: Listing status (own units only) ← [dealer.ops.consignment, dealer.marketplace.my_listings]
  - `dealer.consignor_guest.my_units.photos_specs`: Unit photos & specs (read-only)
  - `dealer.consignor_guest.my_units.price_negotiation_log`: Price negotiation log
  - `dealer.consignor_guest.my_units.notes_from_dealer`: Notes from dealer

**`dealer.consignor_guest.offers_bids`** — Offers & Bids on My Unit
  - `dealer.consignor_guest.offers_bids.current_offers`: Current offers ← [dealer.marketplace.my_bids]
  - `dealer.consignor_guest.offers_bids.bid_history`: Bid history
  - `dealer.consignor_guest.offers_bids.accept_decline_override`: Accept / decline (dealer-mediated) (Consignor provides input; dealer executes)

**`dealer.consignor_guest.payouts`** — My Payouts
  - `dealer.consignor_guest.payouts.pending_payouts`: Pending payouts ← [dealer.ops.consignment]
  - `dealer.consignor_guest.payouts.completed_payouts`: Completed payouts ← ext:[stripe=Stripe Connect transfer history]
  - `dealer.consignor_guest.payouts.banking_verification`: Banking verification status ← ext:[stripe=Connect account status]
  - `dealer.consignor_guest.payouts.tax_documents`: Tax documents (1099 if applicable) ← ext:[stripe=1099 form retrieval]

### Section: Public Bidder Guest

**`dealer.public_bidder_guest.my_bids`** — My Bids (Public Bidder)
  - `dealer.public_bidder_guest.my_bids.active_bids`: Active bids (own)
  - `dealer.public_bidder_guest.my_bids.won_units`: Won units (own) → ext:[stripe=escrow release on won]
  - `dealer.public_bidder_guest.my_bids.lost_bids`: Lost bids (own)
  - `dealer.public_bidder_guest.my_bids.escrow_status`: Escrow status ← ext:[stripe=own escrow state]

**`dealer.public_bidder_guest.verification`** — Verification & Payment
  - `dealer.public_bidder_guest.verification.id_verification`: Identity verification → ext:[stripe=identity verification]
  - `dealer.public_bidder_guest.verification.payment_methods`: Payment methods (for escrow) ← ext:[stripe=payment method list] → ext:[stripe=add/remove payment method]
  - `dealer.public_bidder_guest.verification.buyer_agreement`: Buyer agreement (terms acceptance)


## CLIENT PORTAL (12 pages)

### Section: Main

**`client.main.dashboard`** — Dashboard
  - `client.main.dashboard.coverage_overview`: Coverage overview ← [dealer.ops.sales_services]
  - `client.main.dashboard.open_claims`: Open claims ← [dealer.ops.claims]
  - `client.main.dashboard.quick_actions`: Quick actions

**`client.main.vehicle`** — My Vehicle
  - `client.main.vehicle.unit_details`: Unit details (VIN, model, year) ← [dealer.ops.inventory]
  - `client.main.vehicle.dealer_info`: Dealer info ← [master.mgmt.dealer_accounts]
  - `client.main.vehicle.documents`: Documents ← [dealer.ops.documents]

**`client.main.warranties`** — My Warranties
  - `client.main.warranties.ac_coverage_details`: Active Coverage › Coverage details & terms ← [dealer.ops.sales_services]
  - `client.main.warranties.ac_expiry_date`: Active Coverage › Expiry date → ext:[email=expiry reminders (scheduled)]
  - `client.main.warranties.expired_plans`: Expired Plans

**`client.main.services`** — My Services
  - `client.main.services.roadside`: Roadside Assistance ← [dealer.ops.sales_services]
  - `client.main.services.gap`: GAP Coverage ← [dealer.ops.sales_services]
  - `client.main.services.extended_warranty`: Extended Warranty ← [dealer.ops.sales_services]
  - `client.main.services.other_active`: Other active plans ← [dealer.ops.sales_services]

**`client.main.claims`** — Claims
  - `client.main.claims.active_claims`: Active Claims (read-only) ← [dealer.ops.claims]
  - `client.main.claims.claim_history`: Claim History ← [dealer.ops.claims]
  - `client.main.claims.sni_describe`: Submit New Issue › Describe problem
  - `client.main.claims.sni_add_photos`: Submit New Issue › Add photos → ext:[anthropic=AI Doc Scanner]
  - `client.main.claims.sni_submit`: Submit New Issue › Submit → Dealer / DS360 → [dealer.ops.claims] → ext:[email=submission confirmation]

**`client.main.documents`** — Documents
  - `client.main.documents.warranty_certificates`: Warranty certificates ← [dealer.ops.sales_services]
  - `client.main.documents.service_contracts`: Service contracts ← [dealer.ops.sales_services]
  - `client.main.documents.receipts_invoices`: Receipts & invoices ← [dealer.ops.sales_services]

**`client.main.fi_offers`** — F&I Offers
  - `client.main.fi_offers.ai_video_presenter`: AI F&I video presenter ← ext:[tavus=stream avatar video, anthropic=real-time AI responses] → ext:[tavus=customer interactions, anthropic=session turns, email=session invite]
  - `client.main.fi_offers.review_accept_products`: Review & accept products → [dealer.ops.sales_services (new sale), master.mgmt.revenue_billing (commission)] → ext:[email=sale confirmation]

**`client.main.messages`** — Messages
  - `client.main.messages.from_dealer`: From Dealer ← [dealer.ops.clients] ← ext:[email=notif surface]

**`client.main.account`** — Account
  - `client.main.account.profile`: Profile → [dealer.ops.clients (self-edits)] → ext:[email=change confirmation]
  - `client.main.account.notifications`: Notifications
  - `client.main.account.settings`: Settings

**`client.main.financing`** — My Financing
  - `client.main.financing.loan_details`: Loan Details ← [dealer.ops.financing] ← ext:[lender_apis=current loan state]
  - `client.main.financing.payment_schedule`: Payment Schedule ← ext:[lender_apis=amortization schedule]
  - `client.main.financing.current_balance_payoff`: Current Balance & Payoff ← ext:[lender_apis=payoff quote]
  - `client.main.financing.financing_documents`: Financing documents ← [dealer.ops.financing]
  - `client.main.financing.make_payment`: Make a Payment → ext:[lender_apis=post payment (if supported) OR redirect, email=payment confirmation]
  - `client.main.financing.early_payoff_calc`: Early payoff calculator

**`client.main.parts_store`** — Parts Store
  - `client.main.parts_store.browse_parts`: Browse Parts (from my dealer) ← [dealer.ops.parts_store]
  - `client.main.parts_store.search_by_vin`: Search by my VIN (fitting parts) ← [dealer.ops.inventory]
  - `client.main.parts_store.shopping_cart`: Shopping Cart
  - `client.main.parts_store.checkout`: Checkout → [dealer.ops.parts_store (new order), master.ops.parts_orders] → ext:[stripe=one-time payment for parts, email=order confirmation]
  - `client.main.parts_store.order_history`: Order History ← [master.ops.parts_orders]
  - `client.main.parts_store.track_shipment`: Track shipment ← ext:[parts_suppliers=tracking status]
  - `client.main.parts_store.returns`: Returns → ext:[stripe=refund, email=return confirmation]

**`client.main.service_appointments`** — Service Appointments
  - `client.main.service_appointments.schedule_service`: Schedule Service (on-site request) → [dealer.ops.techflow (client request)] → ext:[email=request acknowledgment]
  - `client.main.service_appointments.upcoming_appointments`: Upcoming appointments ← [dealer.ops.techflow]
  - `client.main.service_appointments.service_history`: Service History ← [dealer.ops.techflow]
  - `client.main.service_appointments.tech_assigned`: Tech assigned ← [dealer.ops.techflow]
  - `client.main.service_appointments.eta_map_tracking`: ETA / map tracking ← ext:[maps_routing=tech position + ETA]
  - `client.main.service_appointments.rate_service`: Rate service


## BIDDER PORTAL (9 pages)

### Section: Main

**`bidder.main.dashboard`** — Dashboard
  - `bidder.main.dashboard.active_bids_summary`: My active bids summary
  - `bidder.main.dashboard.won_units_summary`: My won units
  - `bidder.main.dashboard.upcoming_auctions_summary`: Upcoming monthly auctions
  - `bidder.main.dashboard.verification_status`: Verification status

**`bidder.main.live_auctions`** — Live Monthly Auctions
  - `bidder.main.live_auctions.upcoming_calendar`: Upcoming auction calendar ← [master.marketplace.active_auctions]
  - `bidder.main.live_auctions.active_live_auction`: Active live auction (real-time bidding) ← ext:[stripe=real-time escrow hold capability]
  - `bidder.main.live_auctions.place_bid_live`: Place bid (live, real-time) → [bidder.main.my_bids] → ext:[stripe=$500 escrow hold per bid, email=bid confirmation]
  - `bidder.main.live_auctions.auction_catalog`: Pre-auction catalog (units going up)
  - `bidder.main.live_auctions.auction_history`: Past auction results (public)

**`bidder.main.browse`** — Browse Units
  - `bidder.main.browse.all_upcoming`: All upcoming auction units
  - `bidder.main.browse.search_filter`: Search & filter
  - `bidder.main.browse.watch_listing`: Watch listing (notify me) → ext:[email=watch alert when auction begins]
  - `bidder.main.browse.unit_detail`: Unit detail (specs, photos, condition report)

**`bidder.main.my_bids`** — My Bids
  - `bidder.main.my_bids.active_bids`: Active bids
  - `bidder.main.my_bids.won_units`: Won units → [dealer.ops.clients (buyer becomes client of selling dealer), master.mgmt.revenue_billing ($250 commission)] → ext:[stripe=escrow release + commission capture, email=won notification + dealer intro] (On win: buyer auto-linked to winning unit's selling dealer)
  - `bidder.main.my_bids.lost_bids`: Lost bids → ext:[stripe=escrow refund]
  - `bidder.main.my_bids.watchlist`: Watchlist

**`bidder.main.escrow`** — Escrow & Payments
  - `bidder.main.escrow.my_active_holds`: My active escrow holds ← ext:[stripe=hold state]
  - `bidder.main.escrow.payment_history`: Payment history ← ext:[stripe=payment history]
  - `bidder.main.escrow.pending_releases`: Pending releases
  - `bidder.main.escrow.refunds`: Refunds (lost bids / cancellations)

### Section: Account

**`bidder.account.profile`** — Profile
  - `bidder.account.profile.personal_info`: Personal info (name, email, phone, address)
  - `bidder.account.profile.communication_prefs`: Communication preferences → ext:[email=preference confirmation]

**`bidder.account.verification`** — Verification
  - `bidder.account.verification.id_verification`: Identity verification (required before bidding) → ext:[stripe=Stripe Identity verification]
  - `bidder.account.verification.address_verification`: Address verification
  - `bidder.account.verification.verification_status`: Verification status

**`bidder.account.payment_methods`** — Payment Methods
  - `bidder.account.payment_methods.cards_on_file`: Cards on file (for escrow) ← ext:[stripe=saved payment methods]
  - `bidder.account.payment_methods.add_card`: Add card → ext:[stripe=attach payment method]
  - `bidder.account.payment_methods.default_payment`: Default payment method

**`bidder.account.settings`** — Settings
  - `bidder.account.settings.notification_prefs`: Notification preferences
  - `bidder.account.settings.close_account`: Close account


## MARKETPLACE PORTAL (9 pages)

### Section: Main

**`marketplace.main.dashboard`** — Dashboard
  - `marketplace.main.dashboard.active_auctions`: Active auctions ← [marketplace.main.sell]
  - `marketplace.main.dashboard.my_active_bids`: My active bids ← [marketplace.main.my_bids]
  - `marketplace.main.dashboard.won_units`: Won units ← [marketplace.main.my_bids]
  - `marketplace.main.dashboard.membership_status`: Membership status ← [marketplace.account.membership] ← ext:[stripe=subscription status]

**`marketplace.main.browse`** — Browse Listings
  - `marketplace.main.browse.all_active_auctions`: All Active Auctions ← [marketplace.main.sell]
  - `marketplace.main.browse.search_filter`: Search & Filter
  - `marketplace.main.browse.ld_specs_photos`: Listing Detail › Unit specs & photos
  - `marketplace.main.browse.ld_current_bid`: Listing Detail › Current bid
  - `marketplace.main.browse.ld_bid_history`: Listing Detail › Bid history
  - `marketplace.main.browse.ld_place_bid`: Listing Detail › Place bid → [marketplace.main.my_bids] → ext:[stripe=$500 escrow hold, email=bid confirmation]
  - `marketplace.main.browse.ld_watch_listing`: Listing Detail › Watch listing

**`marketplace.main.public_showcase`** — Public Showcase
  - `marketplace.main.public_showcase.monthly_auctions`: Monthly 24-hr public auctions → ext:[email=auction reminders]
  - `marketplace.main.public_showcase.public_listing_view`: Public listing view
  - `marketplace.main.public_showcase.buyer_inquiries`: Buyer inquiries → ext:[email=inquiry routing]

**`marketplace.main.my_bids`** — My Bids
  - `marketplace.main.my_bids.active_bids`: Active Bids
  - `marketplace.main.my_bids.won_units`: Won Units → [master.mgmt.revenue_billing ($250 commission)] → ext:[stripe=escrow release + commission capture, email=Won notification]
  - `marketplace.main.my_bids.lost_bids`: Lost Bids → ext:[email=Lost / outbid notif]
  - `marketplace.main.my_bids.watchlist`: Watchlist

**`marketplace.main.sell`** — Sell a Unit
  - `marketplace.main.sell.cnl_unit_vin`: Create New Listing › Unit details & VIN
  - `marketplace.main.sell.cnl_photos`: Create New Listing › Photos
  - `marketplace.main.sell.cnl_starting_price`: Create New Listing › Starting price
  - `marketplace.main.sell.cnl_auction_duration`: Create New Listing › Auction duration
  - `marketplace.main.sell.cnl_publish`: Create New Listing › Publish → [marketplace.main.browse] → ext:[email=listing-created confirmation]
  - `marketplace.main.sell.ml_active`: My Listings › Active
  - `marketplace.main.sell.ml_sold`: My Listings › Sold → ext:[email=sold notification]
  - `marketplace.main.sell.ml_expired`: My Listings › Expired

**`marketplace.main.escrow`** — Escrow & Payments
  - `marketplace.main.escrow.active_escrow_holds`: Active escrow holds ($500) ← ext:[stripe=active hold state]
  - `marketplace.main.escrow.payment_history`: Payment history ← ext:[stripe=payment history]
  - `marketplace.main.escrow.pending_releases`: Pending releases ← ext:[stripe=release queue]
  - `marketplace.main.escrow.ds360_commission`: DS360 commission ($250 flat) → [master.mgmt.revenue_billing] ← ext:[stripe=commission captured]

### Section: Account

**`marketplace.account.membership`** — Membership ($499/yr)
  - `marketplace.account.membership.verification_status`: Verification status ← [master.mgmt.dealer_accounts]
  - `marketplace.account.membership.staff_verification`: Staff verification
  - `marketplace.account.membership.renew_manage`: Renew / manage subscription → [master.mgmt.revenue_billing] ← ext:[stripe=subscription state webhooks] → ext:[stripe=$499/yr annual subscription, email=billing + renewal]

**`marketplace.account.public_showcase_addon`** — Public Showcase ($299/yr)
  - `marketplace.account.public_showcase_addon.addon_status`: Add-on subscription status
  - `marketplace.account.public_showcase_addon.enable_disable`: Enable / disable → [master.mgmt.revenue_billing] → ext:[stripe=$299/yr addon subscription, email=billing]
  - `marketplace.account.public_showcase_addon.billing`: Billing

**`marketplace.account.settings`** — Settings
  - `marketplace.account.settings.notification_preferences`: Notification preferences → ext:[email=preference confirmation]
  - `marketplace.account.settings.account_settings`: Account settings


---

# SECTION 5: FULL EVENT CATALOG (147 events, 17 domains)

Each event includes: trigger action, actor roles, preconditions, state changes, payload, fan-out targets (who gets notified, on which portal, via which surfaces), and escalation rules.

### Bidder (4 events)

#### `bidder.auction_announced`
- **Trigger:** Operator publishes monthly auction schedule + catalog
- **Actor:** operator_admin
- **Page:** `master.marketplace.active_auctions.live_monthly_auctions`
- **State changes:** live_auction.created (status=announced)
- **Payload:** auction_id, scheduled_at, catalog[]
- **→ Notify independent_bidder** [bidder] email=opt_in sms=opt_in priority=informational
  - Surface: `bidder.main.live_auctions.upcoming_calendar`
- **Next:** bidder.auction_started

#### `bidder.auction_started`
- **Trigger:** Scheduled start time reached; auction goes live
- **Actor:** system
- **Page:** `(scheduled)`
- **State changes:** live_auction.status: → live
- **Payload:** auction_id
- **→ Notify independent_bidder** [bidder] email=True sms=default_on priority=action_required
  - Surface: `bidder.main.live_auctions.active_live_auction (LIVE banner)`
  - Surface: `bidder.main.dashboard`
  - CTA: "Join live auction" → `/bidder-v6#bidder.main.live_auctions`
- **Next:** bidder.bid_placed_live

#### `bidder.bid_placed_live`
- **Trigger:** Independent bidder places bid during live auction (real-time)
- **Actor:** independent_bidder
- **Page:** `bidder.main.live_auctions.place_bid_live`
- **Preconditions:** bidder.verification_status == verified; payment_method_on_file
- **State changes:** bid.created; stripe_escrow_hold: $500 placed
- **Payload:** bid_id, auction_id, unit_id, amount, bidder_id
- **→ Notify (other current bidders)** [bidder] email=False sms=default_on priority=action_required
  - Surface: `bidder.main.live_auctions (outbid)`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.marketplace.escrow_admin`
- **Next:** bidder.outbid, bidder.auction_won

#### `bidder.auction_won`
- **Trigger:** Independent bidder wins a unit — auto-link to selling dealer as client
- **Actor:** system
- **Page:** `(auction end)`
- **State changes:** bid.status: → won; independent_bidder.role transitions to (independent_bidder + client) OR new client record created; client.dealer_id = winning_unit.selling_dealer_id; stripe: escrow → payment capture; $250 commission captured
- **Payload:** bid_id, bidder_id, unit_id, selling_dealer_id, new_client_id
- **→ Notify (winner)** [bidder] email=True sms=default_on priority=action_required
  - Surface: `bidder.main.my_bids.won_units (+1)`
  - CTA: "View dealer intro" → `/client-v6`
- **→ Notify (new client account)** [client] email=True sms=opt_in priority=action_required
  - Surface: `client.main.dashboard (welcome banner from dealer)`
  - Surface: `client.main.vehicle (won unit added)`
  - CTA: "Meet your dealer" → `/client-v6#client.main.vehicle`
- **→ Notify (selling dealer) dealer_owner** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.clients (+new client)`
  - Surface: `dealer.ops.inventory (unit marked sold)`
  - Surface: `dealer.ops.dashboard`
  - CTA: "Contact new buyer" → `/dealer-v6#dealer.ops.clients`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.marketplace.transactions.completed_sales`
  - Surface: `master.mgmt.revenue_billing (+commission)`
- **Next:** bidder.payment_captured, marketplace.escrow_released

### Billing (10 events)

#### `subscription.created`
- **Trigger:** Operator admin creates new dealer (auto-creates Stripe subscription)
- **Actor:** operator_admin
- **Page:** `master.mgmt.dealer_accounts.add_new_dealer`
- **State changes:** dealership.created; stripe_customer.created; stripe_subscription.created
- **Payload:** dealer_id, stripe_customer_id, stripe_subscription_id, plan
- **→ Notify (new dealer_owner)** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.dashboard (welcome)`
  - CTA: "Complete onboarding" → `/dealer-v6`
- **Next:** subscription.payment_succeeded, subscription.payment_failed

#### `subscription.payment_failed`
- **Trigger:** Dealer subscription renewal fails
- **Actor:** system
- **Page:** `(Stripe webhook: invoice.payment_failed)`
- **State changes:** subscription.status: → past_due; retry scheduled by Stripe
- **Payload:** subscription_id, dealer_id, failure_reason
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=urgent
  - Surface: `dealer.account.my_subscription (alert banner)`
  - Surface: `dealer.ops.dashboard`
  - CTA: "Update payment method" → `/dealer-v6#dealer.account.my_subscription`
- **→ Notify operator_admin** [ds360_master] email=True sms=opt_in priority=informational
  - Surface: `master.mgmt.revenue_billing.subscription_billing (past_due +1)`
- **Next:** subscription.payment_succeeded, subscription.cancelled
- **Escalation:** ?h → Suspend dealer portal access; notify operator

#### `subscription.renewal_upcoming`
- **Trigger:** Reminder sent before annual renewal
- **Actor:** system
- **Page:** `(scheduled cron, 7 days before renewal)`
- **Payload:** subscription_id, renewal_date
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.account.my_subscription`
- **Next:** subscription.renewed, subscription.cancelled

#### `subscription.payment_succeeded`
- **Trigger:** Monthly/annual subscription renewal successful
- **Actor:** system
- **Page:** `(Stripe webhook: invoice.payment_succeeded)`
- **State changes:** subscription.status: → active; next_billing_date updated
- **Payload:** subscription_id, amount
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.account.my_subscription (payment logged)`

#### `subscription.cancelled`
- **Trigger:** Dealer cancels subscription
- **Actor:** dealer_owner, system
- **Page:** `dealer.account.my_subscription (or Stripe portal)`
- **State changes:** subscription.status: → cancelled; access_until_end_of_period
- **Payload:** subscription_id, cancellation_reason?
- **→ Notify operator_admin** [ds360_master] email=True sms=opt_in priority=action_required
  - Surface: `master.mgmt.dealer_accounts (status: cancelled)`
  - Surface: `master.mgmt.revenue_billing (churn alert)`
  - CTA: "Retention outreach" → `/operator-v6#master.mgmt.dealer_accounts`
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.account.my_subscription (ended banner)`
- **Next:** subscription.reactivated

#### `subscription.plan_upgraded`
- **Trigger:** Dealer upgrades to higher tier plan
- **Actor:** dealer_owner
- **Page:** `dealer.account.my_subscription`
- **State changes:** subscription.plan updated; proration calculated
- **Payload:** subscription_id, old_plan, new_plan
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.mgmt.revenue_billing (upgrade logged)`

#### `stripe.chargeback_received`
- **Trigger:** Customer initiates chargeback/dispute
- **Actor:** system
- **Page:** `(Stripe webhook: charge.dispute.created)`
- **State changes:** dispute.created; funds frozen
- **Payload:** dispute_id, charge_id, amount
- **→ Notify operator_admin** [ds360_master] email=True sms=opt_in priority=urgent
  - Surface: `master.mgmt.revenue_billing (dispute alert)`
  - Surface: `master.system.notifications`
  - CTA: "Respond to dispute" → `/operator-v6#master.mgmt.revenue_billing`
- **Next:** stripe.dispute_won, stripe.dispute_lost
- **Escalation:** ?h → Stripe auto-response deadline approaching

#### `stripe.payout_sent`
- **Trigger:** Stripe Connect payout sent to consignor or dealer
- **Actor:** system
- **Page:** `(Stripe webhook: payout.paid)`
- **State changes:** payout.status: → paid
- **Payload:** payout_id, recipient_id, amount
- **→ Notify (recipient)** [(their portal)] email=True sms=opt_in priority=informational
  - Surface: `payout history (+paid)`

#### `stripe.refund_issued`
- **Trigger:** Stripe processes any refund (claim, parts, sale, subscription)
- **Actor:** system
- **Page:** `(Stripe webhook: charge.refunded)`
- **State changes:** refund logged against original charge
- **Payload:** refund_id, charge_id, amount
- **→ Notify (payer)** [(their portal)] email=True sms=opt_in priority=informational
  - Surface: `payment history (refunded)`

#### `billing.commission_captured`
- **Trigger:** DS360 captures commission from a sale/bid/financing deal
- **Actor:** system
- **Page:** `(automatic on sale events)`
- **State changes:** commission_entry.created; ledger updated
- **Payload:** entry_id, source_type, source_id, amount

### Claims (20 events)

#### `claim.submitted`
- **Trigger:** Click 'Submit New Claim' button after filling form
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.claims.snc_submit`
- **Preconditions:** Unit selected (VIN verified); Claim type chosen; Description entered; ≥1 photo uploaded
- **State changes:** claim.status: null → new_unassigned; claim.submitted_at: now(); claim.submitted_by: user.id; claim.dealer_id: user.dealership_id
- **Payload:** claim_id, dealer_id, unit_vin, claim_type, manufacturer, description, symptom, photo_ids[], ai_scanner_extracted_data?
- **→ Notify operator_admin, operator_staff** [ds360_master] email=True sms=opt_in priority=action_required
  - Surface: `master.ops.dashboard.new_submissions (feed +1)`
  - Surface: `master.ops.claim_queue.new_unassigned (badge +1)`
  - Surface: `master.system.notifications (inbox entry, category=Claims)`
  - CTA: "Assign or Work Claim" → `/operator-v6#master.ops.claim_queue`
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.claims (new claim row, status=submitted)`
  - Surface: `dealer.ops.dashboard.claims_summary (+1)`
  - CTA: "View submission" → `/dealer-v6#dealer.ops.claims`
- **Next:** claim.assigned_to_staff, claim.put_in_review, claim.info_requested, claim.denied
- **Escalation:** 24h → Escalate to all operator_admins; priority → urgent

#### `claim.assigned_to_staff`
- **Trigger:** Operator admin clicks 'Assign' and selects a staff member from dropdown
- **Actor:** operator_admin
- **Page:** `master.ops.claim_queue.new_unassigned`
- **Preconditions:** claim.status == new_unassigned
- **State changes:** claim.status: new_unassigned → assigned; claim.assigned_to_user_id: selected_staff.id; claim.assigned_at: now()
- **Payload:** claim_id, assigned_to_user_id, assigned_by
- **→ Notify operator_staff** [ds360_master] email=True sms=opt_in priority=action_required
  - Surface: `master.ops.claim_queue.in_review (+1 for this staff)`
  - Surface: `master.ops.dashboard.my_active_claims (+1, this staff only)`
  - Surface: `master.system.notifications (personal assignment)`
  - CTA: "Work this claim" → `/operator-v6#master.ops.work_by_dealer`
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.claims.csv_status_timeline (+event)`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.claim_queue.new_unassigned (-1)`
- **Next:** claim.in_review, claim.info_requested, claim.submitted_to_mfr

#### `claim.put_in_review`
- **Trigger:** Assigned operator drags/moves claim from New to 'In Review'
- **Actor:** operator_admin, operator_staff
- **Page:** `master.ops.claim_queue`
- **Preconditions:** claim.assigned_to_user_id == current_user OR role=admin
- **State changes:** claim.status: assigned → in_review; claim.review_started_at: now()
- **Payload:** claim_id, reviewer_id
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.claims.csv_status_timeline`
  - Surface: `dealer.ops.dashboard`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.claims.active_claims (status update)`
  - Surface: `client.main.dashboard.open_claims`
- **Next:** claim.info_requested, claim.submitted_to_mfr, claim.approved, claim.denied

#### `claim.info_requested`
- **Trigger:** Operator posts a message in claim thread requesting more info
- **Actor:** operator_admin, operator_staff
- **Page:** `master.ops.work_by_dealer.cd_dealer_thread`
- **Preconditions:** claim.status IN (assigned, in_review, submitted_to_mfr)
- **State changes:** claim.awaiting_dealer_response: true; claim_message.created (type=info_request)
- **Payload:** claim_id, message_body, attachments[]
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.messages.claim_threads (+unread)`
  - Surface: `dealer.ops.claims.csv_thread (+message)`
  - Surface: `dealer.ops.dashboard (alert: info requested)`
  - CTA: "Respond to operator" → `/dealer-v6#dealer.ops.messages`
- **Next:** claim.dealer_responded, claim.stuck
- **Escalation:** 72h → Reminder email to dealer_owner; flag claim as stuck

#### `claim.dealer_responded`
- **Trigger:** Dealer replies to operator's info request
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.messages.claim_threads`
- **Preconditions:** claim.awaiting_dealer_response == true
- **State changes:** claim.awaiting_dealer_response: false; claim_message.created (type=dealer_reply)
- **Payload:** claim_id, message_body, attachments[]
- **→ Notify operator_staff** [ds360_master] email=True sms=opt_in priority=action_required
  - Surface: `master.ops.work_by_dealer.cd_dealer_thread (+reply badge)`
  - Surface: `master.ops.dashboard.my_active_claims`
  - Surface: `master.system.notifications`
  - CTA: "Review reply" → `/operator-v6#master.ops.work_by_dealer`
- **Next:** claim.submitted_to_mfr, claim.approved, claim.denied, claim.info_requested

#### `claim.submitted_to_mfr`
- **Trigger:** Operator clicks 'Mark as submitted to manufacturer' after filing on manufacturer portal
- **Actor:** operator_admin, operator_staff
- **Page:** `master.ops.work_by_dealer.cd_mfr_submission`
- **Preconditions:** All FRC lines entered; All required photos present; 3C documentation complete
- **State changes:** claim.status: in_review → submitted_to_mfr; claim.mfr_claim_number: <entered>; claim.mfr_preauth_number: <entered>; claim.submitted_to_mfr_at: now()
- **Payload:** claim_id, mfr_claim_number, mfr_preauth_number, submitted_to_mfr_portal
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.claims.csv_status_timeline`
  - Surface: `dealer.ops.dashboard`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.claims.active_claims`
  - Surface: `client.main.dashboard`
- **Next:** claim.approved, claim.denied, claim.partial_approval

#### `claim.approved`
- **Trigger:** Operator marks FRC lines approved after manufacturer decision posted
- **Actor:** operator_admin, operator_staff
- **Page:** `master.ops.work_by_dealer.cd_frc_lines`
- **Preconditions:** claim.status == submitted_to_mfr
- **State changes:** claim.status: submitted_to_mfr → approved; claim.approved_amount: $X; claim.approved_at: now(); claim.next_action: order_parts | schedule_repair
- **Payload:** claim_id, approved_amount, approved_frc_lines[], next_action_hint
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.claims.csv_status_timeline (APPROVED banner)`
  - Surface: `dealer.ops.dashboard (alert)`
  - Surface: `dealer.ops.techflow.wo_incoming_from_claims (auto-work-order if TechFlow enabled)`
  - CTA: "Order Parts" → `/dealer-v6#dealer.ops.claims`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.claims (APPROVED)`
  - Surface: `client.main.dashboard.open_claims (status=approved)`
- **Next:** parts.order_initiated, techflow.work_order_created, claim.awaiting_parts

#### `claim.denied`
- **Trigger:** Operator marks claim denied with reason
- **Actor:** operator_admin, operator_staff
- **Page:** `master.ops.work_by_dealer.cd_frc_lines`
- **Preconditions:** claim.status IN (submitted_to_mfr, in_review)
- **State changes:** claim.status: → denied; claim.denial_reason: <text>; claim.denied_at: now()
- **Payload:** claim_id, denial_reason, denial_details
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=urgent
  - Surface: `dealer.ops.claims.csv_status_timeline (DENIED)`
  - Surface: `dealer.ops.dashboard (alert)`
  - Surface: `dealer.ops.messages (denial details thread)`
  - CTA: "Discuss with operator" → `/dealer-v6#dealer.ops.messages`
- **→ Notify client** [client] email=True sms=opt_in priority=action_required
  - Surface: `client.main.claims (denied status)`
  - Surface: `client.main.dashboard`
  - CTA: "Contact your dealer" → `/client-v6#client.main.messages`
- **Next:** claim.appeal_opened, claim.reopened, claim.closed

#### `claim.partial_approval`
- **Trigger:** Operator approves some FRC lines, denies others
- **Actor:** operator_admin, operator_staff
- **Page:** `master.ops.work_by_dealer.cd_frc_lines`
- **Preconditions:** claim.status == submitted_to_mfr
- **State changes:** claim.status: → partial_approval; Per FRC line: frc_line.status: approved | denied
- **Payload:** claim_id, approved_lines[], denied_lines[], notes
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.claims.csv_status_timeline`
  - CTA: "Review approval breakdown" → `/dealer-v6#dealer.ops.claims`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.claims`
- **Next:** parts.order_initiated, claim.awaiting_parts, claim.closed

#### `claim.photo_added`
- **Trigger:** Dealer uploads additional photo to existing claim (AI Doc Scanner may trigger)
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.claims.snc_photo_upload`
- **Preconditions:** claim.status NOT IN (closed, denied)
- **State changes:** claim_photo.created; If AI Doc Scanner extracts data: claim fields auto-populate
- **Payload:** claim_id, photo_id, uploaded_by, ai_extracted_data?
- **→ Notify operator_admin, operator_staff** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.work_by_dealer.cd_submitted_photos (+1 thumbnail, unread)`

#### `claim.message_added`
- **Trigger:** Either party posts message in claim thread
- **Actor:** operator_admin, operator_staff, dealer_owner, dealer_staff
- **Page:** `dealer.ops.messages.claim_threads OR master.ops.work_by_dealer.cd_dealer_thread`
- **Preconditions:** claim exists; user has access to claim
- **State changes:** claim_message.created
- **Payload:** claim_id, sender_id, body, attachments[]
- **→ Notify operator_staff, operator_admin, dealer_owner, dealer_staff** [(counterparty)] email=True sms=opt_in priority=informational
  - Surface: `messages inbox (+unread)`
  - Surface: `claim thread (+message)`

#### `claim.awaiting_parts`
- **Trigger:** Set when parts order is initiated from approved claim
- **Actor:** system
- **Page:** `(automatic)`
- **State changes:** claim.status: approved → awaiting_parts
- **Payload:** claim_id, parts_order_id
- **→ Notify dealer_owner, dealer_staff** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.claims.csv_status_timeline`
- **Next:** parts.received, claim.stuck

#### `claim.awaiting_payment`
- **Trigger:** Operator invoices the claim after repair complete
- **Actor:** operator_admin
- **Page:** `master.ops.work_by_dealer.cd_invoice_payment`
- **Preconditions:** All parts received; Repair complete; Role == operator_admin
- **State changes:** claim.status: → awaiting_payment; invoice.created (linked to claim)
- **Payload:** claim_id, invoice_id, amount, payee_dealer_id
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.documents.invoices_from_ds360 (+new invoice)`
  - Surface: `dealer.account.my_subscription (if payment method needs update)`
  - CTA: "View invoice" → `/dealer-v6#dealer.ops.documents`
- **Next:** claim.paid, claim.payment_failed
- **Escalation:** ?h → Late payment notice + admin flag

#### `claim.paid`
- **Trigger:** Stripe fires invoice.paid webhook
- **Actor:** system
- **Page:** `(Stripe webhook: invoice.paid)`
- **State changes:** claim.status: awaiting_payment → paid; claim.paid_at: now(); invoice.paid: true
- **Payload:** claim_id, invoice_id, amount_paid, stripe_payment_id
- **→ Notify operator_admin, operator_staff** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.claim_queue (+paid, -awaiting_payment)`
  - Surface: `master.mgmt.revenue_billing.invoice_management`
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.account.my_subscription`
  - Surface: `dealer.ops.documents`
- **Next:** claim.completed

#### `claim.completed`
- **Trigger:** Operator marks claim fully closed (repair done + paid + documents complete)
- **Actor:** operator_admin, operator_staff
- **Page:** `master.ops.claim_queue.completed`
- **Preconditions:** claim.status == paid; Work order completed (if TechFlow)
- **State changes:** claim.status: → completed; claim.completed_at: now()
- **Payload:** claim_id
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.claims (closed)`
  - Surface: `dealer.ops.dashboard`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.claims`
  - Surface: `client.main.dashboard`
- **Next:** claim.reopened (rare)

#### `claim.reopened`
- **Trigger:** Operator reopens a closed/denied claim
- **Actor:** operator_admin
- **Page:** `master.ops.claim_queue`
- **Preconditions:** claim.status IN (completed, denied, closed)
- **State changes:** claim.status: → reopened; claim.reopened_reason
- **Payload:** claim_id, reopen_reason
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.claims`
  - CTA: "Review reopened claim" → `/dealer-v6#dealer.ops.claims`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.claims`
- **Next:** claim.in_review, claim.submitted_to_mfr

#### `claim.appeal_opened`
- **Trigger:** Dealer contests a denied claim by posting appeal with new evidence
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.messages.claim_threads`
- **State changes:** claim.status: denied → appeal_pending; claim.appeal_opened_at: now()
- **Payload:** claim_id, appeal_reason, new_evidence_photo_ids[]
- **→ Notify operator_admin** [ds360_master] email=True sms=opt_in priority=action_required
  - Surface: `master.ops.claim_queue.appeals (+1)`
  - Surface: `master.ops.dashboard (alert)`
  - Surface: `master.system.notifications`
  - CTA: "Review appeal" → `/operator-v6#master.ops.claim_queue`
- **Next:** claim.appeal_approved, claim.appeal_upheld
- **Escalation:** ?h → Escalate to senior operator admin

#### `claim.appeal_approved`
- **Trigger:** Operator admin reverses denial after reviewing appeal
- **Actor:** operator_admin
- **Page:** `master.ops.work_by_dealer`
- **State changes:** claim.status: appeal_pending → reopened → in_review
- **Payload:** claim_id, reversal_notes
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.claims (reopened)`
  - Surface: `dealer.ops.dashboard`
  - CTA: "Continue claim" → `/dealer-v6#dealer.ops.claims`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.claims (status updated)`
- **Next:** claim.submitted_to_mfr, claim.approved

#### `claim.stuck_flagged`
- **Trigger:** System flags a claim with no activity for 5+ days as stuck
- **Actor:** system
- **Page:** `(scheduled cron)`
- **State changes:** claim.stuck: true; claim.stuck_since: now()
- **Payload:** claim_id, days_inactive
- **→ Notify operator_admin** [ds360_master] email=True sms=opt_in priority=action_required
  - Surface: `master.ops.dashboard.stuck_claims (+1)`
  - Surface: `master.ops.claim_queue (stuck indicator)`
  - CTA: "Review stuck claims" → `/operator-v6#master.ops.claim_queue`

#### `claim.manufacturer_response_received`
- **Trigger:** Operator records manufacturer decision received off-platform
- **Actor:** operator_admin, operator_staff
- **Page:** `(manual or email parsing)`
- **State changes:** claim.mfr_response_received_at: now(); claim.mfr_response_text stored
- **Payload:** claim_id, mfr_response, response_doc_id?
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.claims.csv_status_timeline`
- **Next:** claim.approved, claim.denied, claim.partial_approval

### ClientActions (10 events)

#### `client.account_provisioned`
- **Trigger:** Dealer adds a client
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.clients.add_client`
- **State changes:** client.created; client_portal.activated
- **Payload:** client_id, dealer_id, contact_info
- **→ Notify client** [client] email=True sms=opt_in priority=action_required
  - Surface: `client.main.dashboard (first-time welcome)`
  - CTA: "Activate your portal" → `/client-v6`
- **Next:** client.portal_activated

#### `client.issue_submitted`
- **Trigger:** Client submits a new issue from their portal
- **Actor:** client
- **Page:** `client.main.claims.sni_submit`
- **State changes:** claim.created (status=submitted_by_client); dealer receives for triage
- **Payload:** claim_id, client_id, unit_id, description, photo_ids[]
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.claims (new client-submitted issue)`
  - Surface: `dealer.ops.dashboard`
  - CTA: "Triage issue" → `/dealer-v6#dealer.ops.claims`
- **Next:** claim.promoted_to_formal_claim, claim.denied

#### `client.service_requested`
- **Trigger:** Client requests on-site service
- **Actor:** client
- **Page:** `client.main.service_appointments.schedule_service`
- **State changes:** service_request.created
- **Payload:** request_id, client_id, unit_id, preferred_dates, issue_description
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.techflow.client_service_requests (+1)`
  - Surface: `dealer.ops.dashboard`
  - CTA: "Schedule service" → `/dealer-v6#dealer.ops.techflow`
- **Next:** techflow.work_order_created

#### `client.portal_activated`
- **Trigger:** Client activates their portal account for the first time
- **Actor:** client
- **Page:** `(client clicks invite link + sets password)`
- **State changes:** client.status: invited → active; client.portal_activated_at: now()
- **Payload:** client_id
- **→ Notify dealer_owner, dealer_staff** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.clients (status: active)`

#### `client.document_viewed`
- **Trigger:** Client opens a document (contract, warranty cert, invoice)
- **Actor:** client
- **Page:** `client.main.documents.* or client.main.vehicle.documents`
- **State changes:** document_view.logged
- **Payload:** document_id, client_id, viewed_at

#### `client.profile_updated`
- **Trigger:** Client edits profile info (phone, email, address)
- **Actor:** client
- **Page:** `client.main.account.profile`
- **State changes:** client.profile_updated_at; changed fields logged
- **Payload:** client_id, changed_fields[]
- **→ Notify dealer_owner, dealer_staff** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.clients.cf_profile (sync banner)`

#### `client.notification_prefs_updated`
- **Trigger:** Client changes notification preferences (channels per category)
- **Actor:** client
- **Page:** `client.main.account.settings`
- **State changes:** user_notification_preferences updated
- **Payload:** client_id, category, channel_settings

#### `client.fi_session_opened`
- **Trigger:** Client starts the AI F&I avatar session
- **Actor:** client
- **Page:** `client.main.fi_offers.ai_video_presenter`
- **State changes:** fi_session.status: invited → active; Tavus stream started
- **Payload:** session_id, client_id
- **→ Notify dealer_owner, dealer_staff** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.clients.cf_fi_presenter_link (session active)`
- **Next:** sale.fi_session_accepted, client.fi_session_declined, client.fi_session_abandoned

#### `client.fi_session_declined`
- **Trigger:** Client declines all F&I product offers
- **Actor:** client
- **Page:** `client.main.fi_offers.review_accept_products`
- **State changes:** fi_session.status: active → declined_all
- **Payload:** session_id, client_id, reason?
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.clients.cf_fi_products (no sale)`

#### `client.service_rated`
- **Trigger:** Client submits rating + review after service appointment
- **Actor:** client
- **Page:** `client.main.service_appointments.rate_service`
- **State changes:** service_rating.created; dealer_rating_aggregate updated
- **Payload:** rating_id, work_order_id, stars, review_text?
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.techflow (ratings summary)`

### Consignment (3 events)

#### `consignment.consignor_added`
- **Trigger:** Dealer adds a new consignor
- **Actor:** dealer_owner
- **Page:** `dealer.ops.consignment.add_consignor`
- **State changes:** consignor.created; stripe_connect_account.created (onboarding pending)
- **Payload:** consignor_id, dealer_id, contact_info
- **→ Notify (new consignor)** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.consignor_guest.* (portal access)`
  - CTA: "Complete onboarding" → `/dealer-v6#dealer.public_bidder_guest.verification`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.mgmt.consignment_oversight.active_consignments (+1)`
- **Next:** consignment.agreement_signed, consignment.unit_listed

#### `consignment.unit_sold`
- **Trigger:** Consigned unit sells through marketplace
- **Actor:** system
- **Page:** `dealer.marketplace.my_listings.sold`
- **State changes:** consignment_agreement.status: → sold; consignor_payout.pending (amount = sale - dealer_commission - DS360_fee)
- **Payload:** consignment_id, sale_amount, payout_amount
- **→ Notify consignor** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.consignor_guest.my_units (sold)`
  - Surface: `dealer.consignor_guest.payouts.pending_payouts (+1)`
- **→ Notify dealer_owner** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.consignment.sold_consignments`
- **Next:** consignment.payout_initiated

#### `consignment.payout_initiated`
- **Trigger:** Dealer initiates Stripe Connect transfer to consignor
- **Actor:** dealer_owner
- **Page:** `dealer.ops.consignment.payouts_pending`
- **State changes:** consignor_payout.status: → processing; stripe_transfer.created
- **Payload:** payout_id, consignor_id, amount
- **→ Notify consignor** [dealer] email=True sms=default_on priority=informational
  - Surface: `dealer.consignor_guest.payouts.completed_payouts`
- **Next:** consignment.payout_completed

### Errors (5 events)

#### `error.external_api_failed`
- **Trigger:** External API call failed (Stripe, Anthropic, Tavus, Cloudflare, Lender, Parts, Mfr, Maps)
- **Actor:** system
- **Page:** `(any external integration call)`
- **State changes:** error_log.created; retry queued
- **Payload:** service, endpoint, error_message, retry_count
- **→ Notify operator_admin** [ds360_master] email=opt_in sms=opt_in priority=action_required
  - Surface: `master.mgmt.platform_settings.integrations (error badge)`
  - CTA: "Check integration" → `/operator-v6#master.mgmt.platform_settings`
- **Next:** error.retry_succeeded, error.retry_exhausted
- **Escalation:** 1h → Page on-call if retries exhausted

#### `error.email_delivery_failed`
- **Trigger:** Transactional email bounced or rejected
- **Actor:** system
- **Page:** `(email webhook: bounced)`
- **State changes:** email_delivery.status: → failed
- **Payload:** email_id, recipient, bounce_reason
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.mgmt.communications (deliverability alert)`
- **Next:** error.email_retry

#### `error.sms_delivery_failed`
- **Trigger:** Transactional SMS failed (invalid number, carrier reject)
- **Actor:** system
- **Page:** `(SMS webhook)`
- **State changes:** sms_delivery.status: → failed
- **Payload:** sms_id, recipient_phone, failure_reason
- **→ Notify (intended recipient)** [(their portal)] email=True sms=opt_in priority=informational
  - Surface: `(fallback: in-app notification)`

#### `error.webhook_signature_invalid`
- **Trigger:** Incoming webhook has invalid signature (potential attack or misconfig)
- **Actor:** system
- **Page:** `(any webhook endpoint)`
- **State changes:** error_log.created (severity=high)
- **Payload:** source_ip, endpoint, payload_sample
- **→ Notify operator_admin** [ds360_master] email=True sms=default_on priority=urgent
  - Surface: `master.mgmt.platform_settings (security alert)`

#### `error.ai_service_timeout`
- **Trigger:** AI service call exceeded timeout (F&I session lag, doc scanner timeout)
- **Actor:** system
- **Page:** `(Anthropic / Tavus call)`
- **State changes:** error_log.created; session degraded if applicable
- **Payload:** service, session_id?, timeout_ms
- **Next:** error.external_api_failed

### Financing (9 events)

#### `financing.application_submitted`
- **Trigger:** Dealer submits financing application to selected lenders
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.financing.na_submit`
- **State changes:** financing_application.created (status=submitted); For each lender: lender_submission.created
- **Payload:** application_id, client_id, unit_id, amount_requested, lender_ids[]
- **→ Notify operator_admin, operator_staff** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.financing_applications.new_submitted (+1)`
  - Surface: `master.ops.dashboard (financing queue)`
- **Next:** financing.lender_approved, financing.lender_declined, financing.lender_counter
- **Escalation:** 48h → Nudge to lenders; alert operator

#### `financing.lender_approved`
- **Trigger:** Lender sends approval via webhook
- **Actor:** system
- **Page:** `(lender_apis webhook)`
- **State changes:** lender_submission.status: → approved; approved_terms stored
- **Payload:** submission_id, application_id, rate, term, amount, conditions
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.financing.as_lender_responses (+approval)`
  - Surface: `dealer.ops.dashboard`
  - CTA: "Review offer" → `/dealer-v6#dealer.ops.financing`
- **→ Notify operator_admin, operator_staff** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.financing_applications.approved (+1)`
- **Next:** financing.terms_accepted, financing.lender_selected

#### `financing.lender_declined`
- **Trigger:** Lender sends decline via webhook
- **Actor:** system
- **Page:** `(lender_apis webhook)`
- **State changes:** lender_submission.status: → declined
- **Payload:** submission_id, application_id, decline_reason
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.financing.as_lender_responses`

#### `financing.terms_accepted`
- **Trigger:** Dealer accepts an approved lender's terms (commits the loan)
- **Actor:** dealer_owner
- **Page:** `dealer.ops.financing.as_select_finalize`
- **State changes:** financing_application.status: → accepted; loan_deal.created; commission_entry.created (DS360 financing commission)
- **Payload:** application_id, selected_lender_id, loan_terms
- **→ Notify client** [client] email=True sms=opt_in priority=action_required
  - Surface: `client.main.financing.loan_details (new loan)`
  - Surface: `client.main.financing.financing_documents (+docs)`
  - CTA: "Review loan" → `/client-v6#client.main.financing`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.mgmt.revenue_billing (+commission)`
  - Surface: `master.ops.financing_applications.funded`
- **Next:** financing.funded

#### `financing.funded`
- **Trigger:** Lender confirms funds disbursed
- **Actor:** system
- **Page:** `(lender_apis webhook)`
- **State changes:** loan_deal.status: → funded; dealer payout trigger
- **Payload:** loan_id, funded_amount, payout_destination
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.financing.funded_deals (+1)`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.financing.loan_details (active)`
- **Next:** financing.payment_posted

#### `financing.lender_counter_offer`
- **Trigger:** Lender responds with counter-offer (different rate/term)
- **Actor:** system
- **Page:** `(lender_apis webhook)`
- **State changes:** lender_submission.status: → counter_offered; counter_terms stored
- **Payload:** submission_id, application_id, counter_terms
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.financing.as_lender_responses (counter)`
  - CTA: "Review counter-offer" → `/dealer-v6#dealer.ops.financing`
- **Next:** financing.terms_accepted, financing.application_withdrawn

#### `financing.application_withdrawn`
- **Trigger:** Dealer withdraws application from all lenders
- **Actor:** dealer_owner
- **Page:** `dealer.ops.financing`
- **State changes:** financing_application.status: → withdrawn
- **Payload:** application_id, withdrawal_reason
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.financing_applications (status: withdrawn)`

#### `financing.payment_posted`
- **Trigger:** Borrower's monthly payment posted to loan
- **Actor:** system
- **Page:** `(lender_apis webhook)`
- **State changes:** loan.balance updated; loan.last_payment_at
- **Payload:** loan_id, payment_amount, payment_date
- **→ Notify client** [client] email=False sms=opt_in priority=informational
  - Surface: `client.main.financing.payment_schedule (payment logged)`

#### `financing.payment_late`
- **Trigger:** Loan payment missed / late
- **Actor:** system
- **Page:** `(lender_apis webhook or scheduled check)`
- **State changes:** loan.status: → past_due
- **Payload:** loan_id, days_late, amount_due
- **→ Notify client** [client] email=True sms=opt_in priority=urgent
  - Surface: `client.main.financing (alert banner)`
  - CTA: "Make payment" → `/client-v6#client.main.financing`
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.financing.payment_tracking (alert)`
- **Next:** financing.payment_posted, financing.default

### Inventory (5 events)

#### `unit.added`
- **Trigger:** Dealer adds a new unit manually or via Unit Tag Scanner
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.inventory.add_unit`
- **State changes:** unit.created; if tag-scanned: specs auto-populated via Anthropic
- **Payload:** unit_id, dealer_id, vin, year, manufacturer, model, added_via
- **→ Notify operator_admin, operator_staff** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.work_by_dealer.units_vins (if dealer open, +1)`
- **Next:** unit.linked_to_client, unit.listed_for_sale, unit.service_scheduled

#### `unit.linked_to_client`
- **Trigger:** Dealer links a unit to an existing client (or creates new client)
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.inventory.ud_client_linked`
- **State changes:** unit.customer_id set; if new client: client.created + invite sent
- **Payload:** unit_id, client_id, new_client?
- **→ Notify client** [client] email=True sms=opt_in priority=action_required
  - Surface: `client.main.vehicle (new unit appears)`
  - Surface: `client.main.dashboard (welcome banner)`
  - CTA: "View your unit" → `/client-v6#client.main.vehicle`
- **Next:** client.portal_activated, sale.contract_generated

#### `unit.sold`
- **Trigger:** Dealer records a unit sale (inventory → delivered)
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.sales_services`
- **State changes:** unit.status: on_lot → sold; unit.sold_at: now(); unit.sold_to_client_id
- **Payload:** unit_id, client_id, sale_amount
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.reporting.claims_by_dealer (+1 unit delivered)`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.vehicle (ownership confirmed)`
- **Next:** sale.contract_generated, sale.fi_session_sent

#### `unit.daf_completed`
- **Trigger:** DAF (Dealer Acceptance Form) completed for a new unit
- **Actor:** operator_admin, operator_staff, dealer_owner, dealer_staff
- **Page:** `master.ops.work_by_dealer OR dealer.ops.inventory`
- **State changes:** unit.daf_completed: true; unit.daf_completed_at: now()
- **Payload:** unit_id, daf_doc_id
- **→ Notify dealer_owner, dealer_staff** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.inventory.ud_specs (DAF badge)`
- **Next:** unit.pdi_completed, claim.submitted

#### `unit.pdi_completed`
- **Trigger:** PDI (Pre-Delivery Inspection) completed for a unit
- **Actor:** operator_admin, operator_staff, dealer_owner, dealer_staff
- **Page:** `master.ops.work_by_dealer OR dealer.ops.inventory`
- **State changes:** unit.pdi_completed: true; unit.pdi_completed_at: now()
- **Payload:** unit_id, pdi_doc_id, issues_found[]
- **→ Notify dealer_owner, dealer_staff** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.inventory (PDI badge)`
- **Next:** claim.submitted (for PDI issues), unit.delivered

### Marketing (8 events)

#### `marketing.campaign_sent`
- **Trigger:** Dealer sends email campaign to their client list
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.marketing.c_email_campaigns`
- **State changes:** campaign.status: → sent; per-recipient email_events created
- **Payload:** campaign_id, recipient_count
- **→ Notify (client list)** [client] email=True sms=opt_in priority=informational
  - Surface: `(email only — external delivery)`
- **Next:** marketing.email_opened, marketing.email_clicked

#### `marketing.lead_captured`
- **Trigger:** Website visitor submits a lead form
- **Actor:** (anonymous)
- **Page:** `(public landing page form submission)`
- **State changes:** lead.created (status=new)
- **Payload:** lead_id, dealer_id (form owner), contact_info, source_page
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.marketing.lc_leads_inbox (+1)`
  - Surface: `dealer.ops.dashboard`
  - CTA: "Contact lead" → `/dealer-v6#dealer.ops.marketing`
- **Next:** marketing.lead_converted
- **Escalation:** 4h → Escalate hot lead (configurable)

#### `marketing.campaign_scheduled`
- **Trigger:** Dealer schedules a campaign for future send
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.marketing.c_email_campaigns`
- **State changes:** campaign.scheduled_at set; campaign.status: draft → scheduled
- **Payload:** campaign_id, scheduled_at
- **Next:** marketing.campaign_sent

#### `marketing.email_opened`
- **Trigger:** Campaign recipient opens the email
- **Actor:** (recipient)
- **Page:** `(email pixel)`
- **State changes:** email_event.created (type=open)
- **Payload:** campaign_id, recipient_email, opened_at
- **Next:** marketing.email_clicked

#### `marketing.email_clicked`
- **Trigger:** Recipient clicks a link in the campaign email
- **Actor:** (recipient)
- **Page:** `(trackable link click)`
- **State changes:** email_event.created (type=click)
- **Payload:** campaign_id, recipient_email, link_url
- **Next:** marketing.lead_captured

#### `marketing.lead_assigned`
- **Trigger:** Dealer assigns a lead to a staff member for follow-up
- **Actor:** dealer_owner
- **Page:** `dealer.ops.marketing.lc_leads_inbox`
- **State changes:** lead.assigned_to_user_id
- **Payload:** lead_id, assigned_to_user_id
- **→ Notify (assigned staff)** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.marketing.lc_leads_inbox (my leads)`
  - CTA: "Contact lead" → `/dealer-v6#dealer.ops.marketing`
- **Next:** marketing.lead_converted, marketing.lead_disqualified

#### `marketing.lead_converted`
- **Trigger:** Lead converted to a client
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.marketing.lc_leads_inbox (convert action)`
- **State changes:** lead.status: → converted; client.created from lead
- **Payload:** lead_id, new_client_id
- **→ Notify (assigned staff)** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.marketing (conversion logged)`
- **Next:** client.account_provisioned

#### `marketing.landing_page_published`
- **Trigger:** Dealer publishes a landing page
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.marketing.landing_pages`
- **State changes:** landing_page.status: → published
- **Payload:** page_id, slug, url
- **Next:** marketing.lead_captured

### Marketplace (10 events)

#### `marketplace.listing_created`
- **Trigger:** Dealer publishes a new marketplace listing
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.marketplace.my_listings.create_listing`
- **State changes:** marketplace_listing.created (status=active); dealer_identity masked
- **Payload:** listing_id, dealer_id, unit_id, starting_price, duration, is_public_showcase
- **→ Notify dealer_bidder** [dealer] email=opt_in sms=opt_in priority=informational
  - Surface: `dealer.marketplace.browse (new listing visible)`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.marketplace.listings_oversight.all_listings (+1)`
- **Next:** marketplace.bid_placed, marketplace.listing_expired

#### `marketplace.bid_placed`
- **Trigger:** Bidder places bid (triggers $500 escrow hold)
- **Actor:** dealer_owner, dealer_staff, public_bidder
- **Page:** `dealer.marketplace.browse.place_bid OR dealer.public_bidder_guest.my_bids`
- **State changes:** bid.created; stripe_escrow_hold: $500 placed; listing.current_bid updated
- **Payload:** bid_id, listing_id, bidder_id, bid_amount, escrow_hold_id
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.marketplace.my_listings (seller sees +bid)`
  - Surface: `dealer.ops.dashboard`
- **→ Notify (outbid parties)** [dealer] email=True sms=default_on priority=action_required
  - Surface: `dealer.marketplace.my_bids (outbid alert)`
  - CTA: "Place higher bid" → `/dealer-v6#dealer.marketplace.browse`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.marketplace.escrow_admin.all_escrow_holds (+1)`
- **Next:** marketplace.outbid, marketplace.auction_won, marketplace.auction_ended

#### `marketplace.auction_ending_soon`
- **Trigger:** System fires reminder to watchers and current bidders
- **Actor:** system
- **Page:** `(scheduled, ~1hr before end)`
- **Payload:** listing_id, minutes_remaining
- **→ Notify (watchers + current_bidders)** [dealer] email=opt_in sms=opt_in priority=informational
  - Surface: `dealer.marketplace.browse (countdown banner)`
- **Next:** marketplace.auction_won

#### `marketplace.auction_won`
- **Trigger:** Auction timer expires; highest bidder wins
- **Actor:** system
- **Page:** `(auction end cron)`
- **State changes:** listing.status: → sold; winning_bid marked; stripe_escrow: winner hold converted to payment; losers refunded; $250 DS360 commission captured
- **Payload:** listing_id, winning_bid_id, winner_id, sale_amount
- **→ Notify (winner)** [dealer] email=True sms=default_on priority=action_required
  - Surface: `dealer.marketplace.my_bids.won_units (+1)`
  - Surface: `dealer.ops.inventory (unit auto-added)`
  - Surface: `dealer.ops.dashboard`
  - CTA: "Arrange pickup/transport" → `/dealer-v6#dealer.marketplace.my_bids`
- **→ Notify (seller)** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.marketplace.my_listings.sold (+1)`
  - Surface: `dealer.marketplace.escrow_payments (payout pending)`
- **→ Notify (losers)** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.marketplace.my_bids.lost_bids (+1, escrow refunded)`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.marketplace.transactions.completed_sales (+1)`
  - Surface: `master.marketplace.transactions.commission_ledger (+$250)`
- **Next:** marketplace.escrow_released, marketplace.dispute_opened

#### `marketplace.escrow_released`
- **Trigger:** Platform releases escrow to seller after cooling-off period or winner confirmation
- **Actor:** system, operator_admin
- **Page:** `(Stripe escrow release)`
- **State changes:** escrow_hold.status: → released; seller_payout_intent created
- **Payload:** escrow_id, listing_id, seller_id, amount
- **→ Notify (seller)** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.marketplace.escrow_payments.pending_releases (-1, +paid)`

#### `marketplace.dispute_opened`
- **Trigger:** Either party opens a dispute post-sale
- **Actor:** dealer_owner, public_bidder, operator_admin
- **Page:** `(external channel or admin form)`
- **State changes:** dispute.created; escrow_hold.frozen = true
- **Payload:** dispute_id, listing_id, raised_by, reason
- **→ Notify operator_admin** [ds360_master] email=True sms=opt_in priority=urgent
  - Surface: `master.marketplace.transactions.refunds_disputes (+1)`
  - CTA: "Review dispute" → `/operator-v6#master.marketplace.transactions`
- **→ Notify (both parties)** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.marketplace.escrow_payments (dispute notice)`
- **Next:** marketplace.dispute_resolved

#### `marketplace.listing_flagged`
- **Trigger:** Listing flagged for review (duplicate, pricing anomaly, bad photos)
- **Actor:** operator_admin, operator_staff, (automated)
- **Page:** `master.marketplace.listings_oversight.flagged_listings`
- **State changes:** listing.flagged: true; listing.flag_reason
- **Payload:** listing_id, flag_reason, flagged_by
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.marketplace.my_listings (flagged banner)`
  - CTA: "Review flag" → `/dealer-v6#dealer.marketplace.my_listings`
- **Next:** marketplace.listing_takedown, marketplace.flag_cleared

#### `marketplace.listing_takedown`
- **Trigger:** Operator forcibly removes a listing
- **Actor:** operator_admin
- **Page:** `master.marketplace.listings_oversight.takedown_action`
- **State changes:** listing.status: → removed; active bids: refunded escrow
- **Payload:** listing_id, reason
- **→ Notify (seller) dealer_owner** [dealer] email=True sms=opt_in priority=urgent
  - Surface: `dealer.marketplace.my_listings (removed)`
  - CTA: "Contact support" → `/dealer-v6#dealer.ops.messages`
- **→ Notify (active bidders)** [(their portal)] email=True sms=opt_in priority=informational
  - Surface: `(escrow refunded notice)`

#### `marketplace.auction_extended`
- **Trigger:** Auction end-time extended due to late-bidding anti-snipe rule
- **Actor:** system
- **Page:** `(automatic if last-minute bidding)`
- **State changes:** listing.ends_at extended by X minutes
- **Payload:** listing_id, new_end_time
- **→ Notify (current bidders + watchers)** [(their portal)] email=False sms=opt_in priority=informational
  - Surface: `dealer.marketplace.browse (extended banner)`
- **Next:** marketplace.auction_won

#### `marketplace.watchlist_added`
- **Trigger:** Bidder adds a listing to watchlist
- **Actor:** dealer_owner, dealer_staff, public_bidder, independent_bidder
- **Page:** `dealer.marketplace.browse OR bidder.main.browse.watch_listing`
- **State changes:** watchlist_entry.created
- **Payload:** user_id, listing_id
- **Next:** marketplace.auction_ending_soon

### Messages (7 events)

#### `message.sent`
- **Trigger:** User sends a message in any thread
- **Actor:** operator_admin, operator_staff, dealer_owner, dealer_staff, client
- **Page:** `(any messages page)`
- **State changes:** message.created; thread.last_message_at updated
- **Payload:** message_id, thread_id, sender_id, body, attachments[]
- **→ Notify (thread participants)** [(their portal)] email=opt_in sms=opt_in priority=informational
  - Surface: `(thread +unread, messages inbox +1)`
- **Next:** message.read

#### `message.thread_opened`
- **Trigger:** User opens a specific message thread (claim, dispute, support)
- **Actor:** operator_admin, operator_staff, dealer_owner, dealer_staff, client, consignor
- **Page:** `(any messages page)`
- **State changes:** message_read.created for unread messages in thread
- **Payload:** thread_id, reader_id, messages_marked_read_count
- **→ Notify (counterparty)** [(their portal)] email=False sms=False priority=informational
  - Surface: `thread indicator: read receipts`
- **Next:** message.sent, message.thread_closed

#### `message.attachment_uploaded`
- **Trigger:** User attaches file to a message (photo, doc, invoice)
- **Actor:** operator_admin, operator_staff, dealer_owner, dealer_staff, client
- **Page:** `(any messages page)`
- **State changes:** message_attachment.created; if photo: AI Doc Scanner may fire
- **Payload:** message_id, attachment_id, file_type, ai_extracted?
- **→ Notify (thread participants)** [(their portal)] email=False sms=opt_in priority=informational
  - Surface: `thread (new attachment badge)`

#### `message.broadcast_to_dealers`
- **Trigger:** Operator sends announcement to all dealers
- **Actor:** operator_admin
- **Page:** `master.mgmt.communications.broadcast_messages`
- **State changes:** broadcast.created; broadcast.delivery_status tracked per dealer
- **Payload:** broadcast_id, subject, body, target_dealer_ids[]
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.messages.inbox_from_ds360 (+1)`
  - Surface: `dealer.ops.dashboard.notifications_from_ds360 (banner)`
- **Next:** message.read

#### `message.dealer_to_client`
- **Trigger:** Dealer sends direct message to a client
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.clients (client file → message)`
- **State changes:** message.created (thread_type=dealer_client)
- **Payload:** client_id, message_id, body
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.messages.from_dealer (+unread)`
  - Surface: `client.main.dashboard (badge)`
  - CTA: "Read message" → `/client-v6#client.main.messages`
- **Next:** message.read

#### `message.client_to_dealer`
- **Trigger:** Client replies to dealer message
- **Actor:** client
- **Page:** `client.main.messages.from_dealer (reply)`
- **State changes:** message.created
- **Payload:** client_id, dealer_id, message_id, body
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.clients.cf_profile (message badge)`
  - Surface: `dealer.ops.messages (+unread)`
  - CTA: "Reply" → `/dealer-v6#dealer.ops.messages`
- **Next:** message.read

#### `message.read`
- **Trigger:** Recipient reads a previously unread message
- **Actor:** operator_admin, operator_staff, dealer_owner, dealer_staff, client
- **Page:** `(any thread view)`
- **State changes:** message_read.created; unread counter -1
- **Payload:** message_id, reader_id, read_at

### Parts (12 events)

#### `parts.order_initiated`
- **Trigger:** Operator or dealer clicks 'Order Parts' on approved claim
- **Actor:** operator_admin, operator_staff, dealer_owner, dealer_staff
- **Page:** `master.ops.work_by_dealer.cd_parts_ordering`
- **Preconditions:** claim.status == approved; FRC lines have parts
- **State changes:** parts_order.created (status=draft); parts_order.claim_id linked
- **Payload:** parts_order_id, claim_id, line_items[], supplier_id
- **→ Notify operator_admin, operator_staff** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.parts_management.active_orders (+1)`
  - Surface: `master.ops.dashboard.parts_awaiting_receipt (+1)`
- **→ Notify dealer_owner, dealer_staff** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.claims.csv_parts_status`
- **Next:** parts.order_submitted_supplier

#### `parts.order_submitted_supplier`
- **Trigger:** Operator confirms order; platform POSTs to supplier API
- **Actor:** operator_admin, operator_staff
- **Page:** `master.ops.parts_management.active_orders`
- **State changes:** parts_order.status: draft → submitted; supplier_order_id assigned
- **Payload:** parts_order_id, supplier_order_id
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.claims.csv_parts_status (submitted)`
- **Next:** parts.supplier_ack, parts.shipped

#### `parts.supplier_ack`
- **Trigger:** Supplier confirms order received
- **Actor:** system
- **Page:** `(parts_suppliers webhook)`
- **State changes:** parts_order.status: submitted → confirmed; estimated_ship_date set
- **Payload:** parts_order_id, estimated_ship_date
- **Next:** parts.shipped

#### `parts.shipped`
- **Trigger:** Supplier marks order shipped with tracking
- **Actor:** system
- **Page:** `(parts_suppliers webhook)`
- **State changes:** parts_order.status: confirmed → shipped; tracking_number assigned
- **Payload:** parts_order_id, carrier, tracking_number, expected_delivery
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.claims.csv_parts_status (shipped + tracking)`
- **Next:** parts.received

#### `parts.received`
- **Trigger:** Operator staff or dealer marks parts received (can auto-fire from supplier webhook)
- **Actor:** operator_admin, operator_staff, dealer_owner, dealer_staff, system
- **Page:** `master.ops.parts_management.received`
- **State changes:** parts_order.status: shipped → received; received_at: now(); claim.status: awaiting_parts → ready_for_repair (if all parts received)
- **Payload:** parts_order_id, claim_id, received_items[]
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=default_on priority=action_required
  - Surface: `dealer.ops.claims.csv_parts_status (received)`
  - Surface: `dealer.ops.dashboard (alert: ready for repair)`
  - Surface: `dealer.ops.techflow.wo_scheduled (if work order exists)`
  - CTA: "Schedule repair" → `/dealer-v6#dealer.ops.techflow`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.claims (parts ready)`
  - Surface: `client.main.service_appointments (schedule available)`
- **Next:** techflow.work_order_created, techflow.work_order_scheduled

#### `parts_store.order_placed`
- **Trigger:** Client completes checkout for retail parts order
- **Actor:** client
- **Page:** `client.main.parts_store.checkout`
- **State changes:** parts_store_order.created; stripe_payment_intent created + captured
- **Payload:** order_id, client_id, dealer_id, line_items[], amount, shipping_address
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.parts_store.client_orders_incoming (+1)`
  - Surface: `dealer.ops.dashboard (+1 parts order)`
  - CTA: "Fulfill order" → `/dealer-v6#dealer.ops.parts_store`
- **→ Notify operator_admin, operator_staff** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.parts_orders.new_client_orders (+1)`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.parts_store.order_history`
  - CTA: "Track order" → `/client-v6#client.main.parts_store`
- **Next:** parts_store.fulfilled, parts_store.cancelled

#### `parts_store.fulfilled`
- **Trigger:** Dealer marks order fulfilled (drop-ship or direct ship)
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.parts_store.fulfillment_queue`
- **State changes:** parts_store_order.status: → shipped
- **Payload:** order_id, tracking_number
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.parts_store.track_shipment`
- **Next:** parts_store.delivered, parts_store.returned

#### `parts_store.delivered`
- **Trigger:** Carrier marks package delivered
- **Actor:** system
- **Page:** `(parts_suppliers webhook)`
- **State changes:** parts_store_order.status: → delivered
- **Payload:** order_id
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.parts_store.order_history`
- **Next:** parts_store.returned

#### `parts_store.cart_updated`
- **Trigger:** Client adds/removes item from cart
- **Actor:** client
- **Page:** `client.main.parts_store.shopping_cart`
- **State changes:** cart.items updated
- **Payload:** client_id, cart_delta
- **Next:** parts_store.order_placed, parts_store.cart_abandoned

#### `parts_store.cart_abandoned`
- **Trigger:** Client left cart unfilled for 24h
- **Actor:** system
- **Page:** `(scheduled cron, 24h after last update)`
- **State changes:** cart.abandoned_at
- **Payload:** cart_id, client_id
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.parts_store (cart reminder)`
- **Next:** parts_store.order_placed

#### `parts_store.return_requested`
- **Trigger:** Client initiates return of a parts order
- **Actor:** client
- **Page:** `client.main.parts_store.returns`
- **State changes:** return_request.created
- **Payload:** return_id, order_id, reason
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.parts_store.returns_exchanges (+1)`
  - CTA: "Process return" → `/dealer-v6#dealer.ops.parts_store`
- **Next:** parts_store.refund_issued

#### `parts_store.refund_issued`
- **Trigger:** Dealer approves return; Stripe refund issued
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.parts_store.returns_exchanges`
- **State changes:** return_request.status: → refunded; stripe_refund.created
- **Payload:** return_id, refund_amount
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.parts_store.order_history (refunded)`

### Platform (10 events)

#### `platform.catalog_pushed`
- **Trigger:** Operator publishes catalog updates to all dealers
- **Actor:** operator_admin
- **Page:** `master.mgmt.catalog.push_updates`
- **State changes:** catalog.version incremented; dealer_catalog_cache invalidated
- **Payload:** catalog_version, changed_items[]
- **→ Notify dealer_owner, dealer_staff** [dealer] email=opt_in sms=opt_in priority=informational
  - Surface: `dealer.ops.messages.product_notifications (+1)`
  - Surface: `dealer.ops.sales_services (catalog updated banner)`

#### `platform.broadcast_sent`
- **Trigger:** Operator sends broadcast to all dealers
- **Actor:** operator_admin
- **Page:** `master.mgmt.communications.broadcast_messages`
- **State changes:** broadcast.created
- **Payload:** broadcast_id, subject, body, target_roles
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.messages.inbox_from_ds360 (+1)`
  - Surface: `dealer.ops.dashboard.notifications_from_ds360`

#### `platform.blog_published`
- **Trigger:** Operator publishes AI-generated blog post
- **Actor:** operator_admin
- **Page:** `master.mgmt.blog.published`
- **State changes:** blog_post.status: → published
- **Payload:** post_id, title, slug

#### `platform.lender_added`
- **Trigger:** Operator adds a new financing lender
- **Actor:** operator_admin
- **Page:** `master.mgmt.financing_partners.add_lender`
- **State changes:** lender.created; lender_integration.test_connection
- **Payload:** lender_id
- **→ Notify dealer_owner, dealer_staff** [dealer] email=opt_in sms=opt_in priority=informational
  - Surface: `dealer.ops.financing (lender becomes available)`

#### `platform.template_pushed_to_dealers`
- **Trigger:** Operator publishes new marketing templates to all dealers
- **Actor:** operator_admin
- **Page:** `master.mgmt.campaign_templates.push_templates_to_dealers`
- **State changes:** templates published; dealer cache invalidated
- **Payload:** template_ids[]
- **→ Notify dealer_owner** [dealer] email=opt_in sms=opt_in priority=informational
  - Surface: `dealer.ops.marketing.lc_forms (new templates)`
  - Surface: `dealer.ops.messages.product_notifications`

#### `platform.lender_update_pushed`
- **Trigger:** Operator pushes lender rate or approval rule updates
- **Actor:** operator_admin
- **Page:** `master.mgmt.financing_partners.push_lender_updates`
- **State changes:** lender.rate_sheet updated
- **Payload:** lender_id
- **→ Notify dealer_owner, dealer_staff** [dealer] email=opt_in sms=opt_in priority=informational
  - Surface: `dealer.ops.financing (rates updated)`

#### `platform.changelog_published`
- **Trigger:** Operator publishes new release notes
- **Actor:** operator_admin
- **Page:** `master.system.changelog`
- **State changes:** changelog_entry.created
- **Payload:** version, summary
- **→ Notify dealer_owner, dealer_staff** [dealer] email=opt_in sms=opt_in priority=informational
  - Surface: `dealer.account.portal_settings.tab_notifications (What's New)`

#### `platform.dealer_suspended`
- **Trigger:** Operator suspends a dealer (billing issue, violation)
- **Actor:** operator_admin
- **Page:** `master.mgmt.dealer_accounts`
- **State changes:** dealership.status: → suspended; dealer_owner + dealer_staff sessions revoked
- **Payload:** dealer_id, suspension_reason
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=urgent
  - Surface: `(login blocked, email only)`
- **Next:** platform.dealer_reinstated

#### `platform.api_key_rotated`
- **Trigger:** Operator rotates an external API key (Stripe, Anthropic, etc.)
- **Actor:** operator_admin
- **Page:** `master.mgmt.platform_settings.integrations`
- **State changes:** api_key.updated
- **Payload:** service, rotated_at

#### `platform.blog_drafted`
- **Trigger:** Anthropic generates a blog draft via scheduled cron
- **Actor:** system
- **Page:** `master.mgmt.blog.drafts`
- **State changes:** blog_post.created (status=draft)
- **Payload:** post_id, topic
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=action_required
  - Surface: `master.mgmt.blog.drafts (+1 pending review)`
  - CTA: "Review draft" → `/operator-v6#master.mgmt.blog`
- **Next:** platform.blog_published, platform.blog_discarded

### Sales (7 events)

#### `sale.contract_generated`
- **Trigger:** Dealer clicks 'Generate Contract' after filling sale form
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.sales_services.ns_generate_contract`
- **State changes:** sale_record.created; contract PDF generated; commission_entry.created
- **Payload:** sale_id, client_id, unit_id, product_id, amount, commission_amount
- **→ Notify client** [client] email=True sms=opt_in priority=action_required
  - Surface: `client.main.warranties / client.main.services (new entry)`
  - Surface: `client.main.documents.service_contracts (+contract PDF)`
  - CTA: "Review contract" → `/client-v6#client.main.documents`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.mgmt.revenue_billing.commission_reports (+entry)`
- **Next:** sale.contract_accepted, sale.refund_requested

#### `sale.fi_session_sent`
- **Trigger:** Dealer clicks 'Send AI F&I Presenter Link' to client
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.clients.cf_fi_presenter_link`
- **State changes:** fi_session.created (status=invited); Tavus avatar session initialized; Anthropic brain context loaded
- **Payload:** session_id, client_id, dealer_id, unit_id, products_to_offer[]
- **→ Notify client** [client] email=True sms=default_on priority=action_required
  - Surface: `client.main.fi_offers (session available)`
  - Surface: `client.main.dashboard (F&I invite banner)`
  - CTA: "Start F&I session" → `/client-v6#client.main.fi_offers`
- **Next:** sale.fi_session_started, sale.fi_session_expired
- **Escalation:** ?h → Reminder to client; nudge to dealer

#### `sale.fi_session_accepted`
- **Trigger:** Client accepts one or more products in the AI F&I session
- **Actor:** client
- **Page:** `client.main.fi_offers.review_accept_products`
- **State changes:** fi_session.status: → completed; For each product: sale_record.created
- **Payload:** session_id, accepted_product_ids[], total_amount
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.sales_services (new sales)`
  - Surface: `dealer.ops.clients.cf_fi_products (+products)`
  - Surface: `dealer.ops.dashboard`
  - CTA: "Review F&I sale" → `/dealer-v6#dealer.ops.sales_services`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.mgmt.revenue_billing (+commission)`
- **Next:** sale.contract_generated, sale.payment_processed

#### `sale.contract_delivered_to_client`
- **Trigger:** Contract PDF emailed to client for signature
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.sales_services.ns_generate_contract`
- **State changes:** contract_delivery.logged
- **Payload:** contract_id, client_id, delivery_method
- **→ Notify client** [client] email=True sms=opt_in priority=action_required
  - Surface: `client.main.documents.service_contracts (+1)`
  - Surface: `client.main.dashboard (action required badge)`
  - CTA: "Review & sign" → `/client-v6#client.main.documents`
- **Next:** sale.contract_signed
- **Escalation:** ?h → Reminder to client; nudge to dealer

#### `sale.contract_signed`
- **Trigger:** Client signs warranty/service contract
- **Actor:** client
- **Page:** `client.main.documents (electronic signature)`
- **State changes:** contract.signed_at; contract.status: pending_signature → active
- **Payload:** contract_id, client_id, signature_data
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.sales_services (+commission row)`
  - Surface: `dealer.ops.dashboard (+1 active contract)`
- **→ Notify operator_admin** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.mgmt.revenue_billing.commission_reports (+entry)`
- **Next:** sale.commission_captured

#### `sale.refund_requested`
- **Trigger:** Dealer or client requests cancel/refund of a warranty product
- **Actor:** dealer_owner, client
- **Page:** `dealer.ops.sales_services (contract detail)`
- **State changes:** refund_request.created; contract.status: active → refund_pending
- **Payload:** contract_id, requested_by, reason
- **→ Notify operator_admin** [ds360_master] email=True sms=opt_in priority=action_required
  - Surface: `master.mgmt.revenue_billing (pending refund)`
  - Surface: `master.system.notifications`
  - CTA: "Approve refund" → `/operator-v6#master.mgmt.revenue_billing`
- **Next:** sale.refund_approved, sale.refund_declined

#### `sale.refund_processed`
- **Trigger:** Operator approves refund; Stripe refund issued
- **Actor:** operator_admin
- **Page:** `master.mgmt.revenue_billing (refund action)`
- **State changes:** contract.status: refund_pending → refunded; stripe_refund.issued; commission_clawback logged
- **Payload:** contract_id, refund_amount
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.documents (contract refunded)`
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.sales_services (contract refunded)`

### Settings (4 events)

#### `settings.branding_updated`
- **Trigger:** Dealer updates white-label branding (logo, colors)
- **Actor:** dealer_owner
- **Page:** `dealer.account.portal_settings.tab_branding`
- **State changes:** dealership.branding updated; client portal cache invalidated
- **Payload:** dealer_id, changed_fields
- **→ Notify client** [client] email=False sms=opt_in priority=informational
  - Surface: `(next page load picks up new branding)`

#### `settings.custom_domain_set`
- **Trigger:** Dealer saves a custom domain for white-labeled client portal
- **Actor:** dealer_owner
- **Page:** `dealer.account.portal_settings.tab_domain`
- **State changes:** dealership.custom_domain set; Cloudflare CNAME provisioned; SSL cert initiated
- **Payload:** dealer_id, domain
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.account.portal_settings (provisioning status)`
- **Next:** settings.custom_domain_verified
- **Escalation:** 24h → Flag DNS issue; alert operator

#### `settings.custom_domain_verified`
- **Trigger:** Cloudflare confirms CNAME + SSL live
- **Actor:** system
- **Page:** `(Cloudflare webhook)`
- **State changes:** dealership.custom_domain_status: → active
- **Payload:** dealer_id, domain
- **→ Notify dealer_owner** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.account.portal_settings (live badge)`
  - CTA: "Share with clients" → `/dealer-v6#dealer.ops.clients`

#### `settings.notification_prefs_updated`
- **Trigger:** User updates their notification preferences
- **Actor:** operator_admin, operator_staff, dealer_owner, dealer_staff, technician, public_bidder, consignor, client, independent_bidder
- **Page:** `(any settings page: operator/dealer/client/bidder)`
- **State changes:** user_notification_preferences updated
- **Payload:** user_id, category, channel_settings

### TechFlow (9 events)

#### `techflow.work_order_created`
- **Trigger:** Auto-generated from approved warranty claim OR manually created
- **Actor:** dealer_owner, dealer_staff, system
- **Page:** `dealer.ops.techflow.wo_incoming_from_claims`
- **State changes:** work_order.created (status=unassigned); linked to claim_id if applicable
- **Payload:** work_order_id, claim_id?, unit_id, client_id, labor_estimate
- **→ Notify dealer_owner, dealer_staff** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.techflow.wo_incoming_from_claims (+1)`
- **Next:** techflow.work_order_assigned

#### `techflow.work_order_assigned`
- **Trigger:** Dealer assigns work order to a technician
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.techflow.dispatch_board`
- **State changes:** work_order.assigned_to_tech_id; work_order.scheduled_for
- **Payload:** work_order_id, tech_id, scheduled_for
- **→ Notify technician** [dealer] email=True sms=default_on priority=action_required
  - Surface: `dealer.ops.techflow (My Schedule +1)`
  - Surface: `dealer.ops.dashboard (tech view)`
  - CTA: "View job" → `/dealer-v6#dealer.ops.techflow`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.service_appointments.upcoming_appointments (+tech assigned)`
- **Next:** techflow.en_route, techflow.work_order_started

#### `techflow.en_route`
- **Trigger:** Technician taps 'On my way'
- **Actor:** technician
- **Page:** `dealer.ops.techflow (mobile, tech initiates)`
- **State changes:** work_order.status: → en_route; tech_location_tracking_started
- **Payload:** work_order_id, tech_id, eta_minutes
- **→ Notify client** [client] email=False sms=default_on priority=informational
  - Surface: `client.main.service_appointments.eta_map_tracking (live)`
- **Next:** techflow.arrived

#### `techflow.work_order_completed`
- **Trigger:** Technician marks work order complete with labor hours + notes
- **Actor:** technician
- **Page:** `dealer.ops.techflow.wo_completed`
- **State changes:** work_order.status: → completed; work_order_labor.created; If linked to claim: claim labor hours updated
- **Payload:** work_order_id, labor_hours, parts_installed[], notes
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `dealer.ops.techflow.wo_completed (+1)`
  - CTA: "Invoice work order" → `/dealer-v6#dealer.ops.techflow`
- **→ Notify client** [client] email=True sms=opt_in priority=action_required
  - Surface: `client.main.service_appointments.service_history`
  - CTA: "Rate service" → `/client-v6#client.main.service_appointments`
- **→ Notify operator_admin, operator_staff** [ds360_master] email=False sms=opt_in priority=informational
  - Surface: `master.ops.techflow_oversight.labor_hours_reports`
  - Surface: `master.ops.work_by_dealer (if claim-linked, labor synced)`
- **Next:** techflow.invoiced, claim.awaiting_payment (if claim-linked)

#### `techflow.arrived`
- **Trigger:** Technician marks arrived at service location
- **Actor:** technician
- **Page:** `dealer.ops.techflow (mobile)`
- **State changes:** work_order.status: en_route → arrived; arrived_at logged
- **Payload:** work_order_id, arrived_at, gps_location
- **→ Notify client** [client] email=False sms=default_on priority=informational
  - Surface: `client.main.service_appointments (tech on-site)`
- **→ Notify dealer_owner, dealer_staff** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.techflow.dispatch_board`
- **Next:** techflow.work_order_started

#### `techflow.work_order_started`
- **Trigger:** Technician starts the job
- **Actor:** technician
- **Page:** `dealer.ops.techflow (mobile)`
- **State changes:** work_order.status: arrived → in_progress; started_at logged
- **Payload:** work_order_id
- **→ Notify dealer_owner, dealer_staff** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.techflow.wo_in_progress (+1)`
- **Next:** techflow.work_order_paused, techflow.work_order_completed

#### `techflow.parts_needed_onsite`
- **Trigger:** Technician flags that additional parts are needed to complete repair
- **Actor:** technician
- **Page:** `dealer.ops.techflow (mobile)`
- **State changes:** work_order.status: in_progress → blocked_parts; parts_needed[]
- **Payload:** work_order_id, parts_needed[]
- **→ Notify dealer_owner, dealer_staff** [dealer] email=True sms=default_on priority=urgent
  - Surface: `dealer.ops.techflow (alert)`
  - Surface: `dealer.ops.dashboard`
  - CTA: "Order parts" → `/dealer-v6#dealer.ops.claims`
- **→ Notify client** [client] email=True sms=opt_in priority=informational
  - Surface: `client.main.service_appointments (service paused)`
- **Next:** parts.order_initiated, techflow.work_order_resumed

#### `techflow.appointment_rescheduled`
- **Trigger:** Service appointment moved to different time/date
- **Actor:** dealer_owner, dealer_staff
- **Page:** `dealer.ops.techflow.dispatch_board`
- **State changes:** work_order.scheduled_for updated
- **Payload:** work_order_id, old_time, new_time
- **→ Notify client** [client] email=True sms=default_on priority=informational
  - Surface: `client.main.service_appointments (updated)`
- **→ Notify technician** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.techflow (schedule updated)`

#### `techflow.invoice_issued`
- **Trigger:** Work order invoiced (labor + parts)
- **Actor:** dealer_owner
- **Page:** `dealer.ops.techflow.wo_invoiced`
- **State changes:** invoice.created (non-warranty, dealer → client)
- **Payload:** invoice_id, work_order_id, amount
- **→ Notify client** [client] email=True sms=opt_in priority=action_required
  - Surface: `client.main.documents.receipts_invoices (+1)`
  - CTA: "View invoice" → `/client-v6#client.main.documents`
- **Next:** techflow.invoice_paid

### Users (14 events)

#### `user.invited`
- **Trigger:** Admin invites a new user (operator_staff, dealer_staff, technician, public_bidder, consignor, client)
- **Actor:** operator_admin, dealer_owner
- **Page:** `(any staff mgmt page)`
- **State changes:** user_invitation.created; invite_token.generated
- **Payload:** invitation_id, email, role, invited_by
- **→ Notify (invitee)** [(role-specific portal)] email=True sms=opt_in priority=action_required
  - Surface: `(email-only, no in-app until accepted)`
  - CTA: "Accept invitation" → `(tokenized onboarding URL)`
- **Next:** user.invite_accepted, user.invite_expired
- **Escalation:** ?h → Resend reminder

#### `user.invite_accepted`
- **Trigger:** Invitee completes registration
- **Actor:** (invitee, any new role)
- **Page:** `(tokenized onboarding page)`
- **State changes:** user.created; user.role assigned; invitation.status: → accepted
- **Payload:** user_id, role, invited_by_user_id
- **→ Notify (inviter)** [(inviter's portal)] email=True sms=opt_in priority=informational
  - Surface: `(inviter's staff page, '+1 active')`

#### `user.deactivated`
- **Trigger:** Admin deactivates a user
- **Actor:** operator_admin, dealer_owner
- **Page:** `(staff mgmt page)`
- **State changes:** user.status: → deactivated; user.sessions revoked
- **Payload:** user_id, deactivated_by, reason
- **→ Notify (deactivated user)** [(their portal)] email=True sms=opt_in priority=informational
  - Surface: `(session terminated; login disabled)`

#### `public_bidder.added_by_dealer`
- **Trigger:** Dealer invites a public bidder (dealer-sponsored)
- **Actor:** dealer_owner
- **Page:** `dealer.account.portal_settings.tab_partners`
- **State changes:** user.created (role=public_bidder); sponsored_by_dealer_id set
- **Payload:** user_id, email, dealer_id
- **→ Notify (invitee)** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `(email-only until onboarding completed)`
  - CTA: "Complete verification" → `(tokenized onboarding URL)`
- **Next:** public_bidder.identity_verified

#### `public_bidder.identity_verified`
- **Trigger:** Stripe Identity confirms bidder ID check passed
- **Actor:** public_bidder, system
- **Page:** `dealer.public_bidder_guest.verification.id_verification`
- **State changes:** user.verification_status: → verified
- **Payload:** user_id, stripe_identity_session_id
- **→ Notify public_bidder** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.ops.dashboard (verified banner)`
  - Surface: `dealer.marketplace.browse (bidding enabled)`
  - CTA: "Start bidding" → `/dealer-v6#dealer.marketplace.browse`
- **→ Notify dealer_owner** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.account.portal_settings.tab_partners (+1 verified)`
- **Next:** public_bidder.payment_method_added

#### `public_bidder.payment_method_added`
- **Trigger:** Bidder adds credit card for escrow holds
- **Actor:** public_bidder
- **Page:** `dealer.public_bidder_guest.verification.payment_methods`
- **State changes:** payment_method.created; stripe_customer.payment_methods updated
- **Payload:** user_id, stripe_payment_method_id, last4
- **Next:** marketplace.bid_placed

#### `consignor.added_by_dealer`
- **Trigger:** Dealer onboards a new consignor
- **Actor:** dealer_owner
- **Page:** `dealer.ops.consignment.add_consignor`
- **State changes:** user.created (role=consignor); consignor.created; stripe_connect_account.init
- **Payload:** user_id, consignor_id, dealer_id
- **→ Notify (new consignor)** [dealer] email=True sms=opt_in priority=action_required
  - Surface: `(email-only until onboarding completed)`
  - CTA: "Complete banking setup" → `(tokenized onboarding)`
- **Next:** consignor.banking_verified, consignor.agreement_signed

#### `consignor.banking_verified`
- **Trigger:** Stripe Connect confirms consignor's banking onboarding complete
- **Actor:** consignor, system
- **Page:** `dealer.consignor_guest.payouts.banking_verification`
- **State changes:** stripe_connect_account.status: → verified
- **Payload:** user_id, connect_account_id
- **→ Notify consignor** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.consignor_guest.payouts (banking verified banner)`
- **→ Notify dealer_owner** [dealer] email=False sms=opt_in priority=informational
  - Surface: `dealer.ops.consignment.cf_banking_info (verified badge)`
- **Next:** consignor.agreement_signed

#### `consignor.agreement_signed`
- **Trigger:** Consignment agreement (%split, duration) signed
- **Actor:** dealer_owner, consignor
- **Page:** `dealer.ops.consignment.cf_agreement`
- **State changes:** consignment_agreement.signed_at; consignment_agreement.status: → active
- **Payload:** agreement_id, consignor_id, split_pct, duration_days
- **→ Notify consignor** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.consignor_guest.my_units (ready to list)`
- **Next:** consignment.unit_listed

#### `consignor.tax_doc_generated`
- **Trigger:** 1099 tax form generated for consignor
- **Actor:** system
- **Page:** `(end of year cron + on-demand)`
- **State changes:** tax_document.created; stripe 1099 pulled
- **Payload:** doc_id, consignor_id, year, gross_payouts
- **→ Notify consignor** [dealer] email=True sms=opt_in priority=informational
  - Surface: `dealer.consignor_guest.payouts.tax_documents (+1)`

#### `staff.invited`
- **Trigger:** Admin invites a new staff member
- **Actor:** operator_admin, dealer_owner
- **Page:** `master.mgmt.staff_permissions OR dealer.account.portal_settings.tab_staff`
- **State changes:** user_invitation.created
- **Payload:** invitation_id, email, role, invited_by
- **→ Notify (invitee)** [(role-specific portal)] email=True sms=opt_in priority=action_required
  - Surface: `(email-only until accepted)`
  - CTA: "Accept invitation" → `(tokenized URL)`
- **Next:** staff.invite_accepted, staff.invite_expired
- **Escalation:** ?h → Resend reminder + notify inviter

#### `technician.invited`
- **Trigger:** Dealer invites a new technician
- **Actor:** dealer_owner
- **Page:** `dealer.account.portal_settings.tab_technicians`
- **State changes:** user_invitation.created (role=technician)
- **Payload:** invitation_id, email, dealer_id
- **→ Notify (invitee)** [dealer] email=True sms=default_on priority=action_required
  - Surface: `(email + SMS onboarding link)`
  - CTA: "Activate account" → `(tokenized URL)`
- **Next:** technician.activated

#### `user.role_changed`
- **Trigger:** Admin changes a user's role (promote/demote)
- **Actor:** operator_admin, dealer_owner
- **Page:** `(staff mgmt page)`
- **State changes:** user.role updated; session invalidated (user re-logs); audit_log entry
- **Payload:** user_id, old_role, new_role, changed_by
- **→ Notify (affected user)** [(their portal)] email=True sms=opt_in priority=action_required
  - Surface: `(forced logout + re-login prompt)`

#### `user.password_reset_requested`
- **Trigger:** User requests password reset
- **Actor:** (any authenticated user), (anonymous)
- **Page:** `(login page forgot password link)`
- **State changes:** password_reset_token.created (expires in 1h)
- **Payload:** email, reset_token
- **→ Notify (user)** [(their portal)] email=True sms=opt_in priority=action_required
  - Surface: `(email-only)`
  - CTA: "Reset password" → `(tokenized URL)`
- **Next:** user.password_reset_completed

---

# SECTION 6: FILE MAP (current state)

## Backend
```
server/routes/
  claims-v6.ts         — Claims CRUD (RBAC needs Phase 2F fix)
  units-v6.ts          — Units CRUD with RBAC
  dealerships-v6.ts    — Dealerships CRUD + modules + branding
  notifications-v6.ts  — Notification list + mark-read
  users-v6.ts          — User management
  uploads-v6.ts        — R2 presign/confirm
  parts-v6.ts          — Parts orders
  clerk-webhook.ts     — Clerk user/org sync + pending dealer signup
  index.ts             — Route mounting

server/lib/
  event-bus.ts         — Event emission + fan-out catalog
  email-worker.ts      — Resend email polling worker (30s interval)
  r2.ts                — Cloudflare R2 presigned URLs
  websocket.ts         — WebSocket with Clerk JWT verification

server/middleware/
  auth.ts              — Clerk session verification (requireAuth, optionalAuth)
```

## Frontend Layout
```
client/src/components/layout/
  PortalShell.tsx      — outer shell (mainNav 240px + AppBar + content)
  SectionLayout.tsx    — optional contextual sidebar 260px wrapper
  tokens.ts            — layout constants, colors, typography

client/src/components/
  AppBar.tsx            — top bar with bell + user menu
  PhotoUploader.tsx     — drag-drop upload to R2
  PhotoGallery.tsx      — grid display of uploaded photos
```

## Frontend Pages
```
client/src/components/operator/
  ClaimQueuePage.tsx          — kanban 7 columns + slide-in detail (Phase 2F)
  DealerAccountsListPage.tsx  — KPI cards + dealer table
  DealershipDetailPage.tsx    — 6 tabs
  DealersContextSidebar.tsx   — reusable sidebar
  NewDealershipPage.tsx       — 4-step wizard
  PartsManagementPage.tsx     — parts order management

client/src/components/dealer/
  DealerClaimsPage.tsx        — KPIs + inline inventory picker
  DealerPartsOrdersPage.tsx   — parts orders

client/src/components/client/
  ClientClaimsPage.tsx        — minimal RBAC view

client/src/components/claims/
  NewClaimPage.tsx            — draft-then-submit flow (Phase 2F)

client/src/components/units/
  InventoryListPage.tsx       — operator/dealer/client context-aware
  UnitProfilePage.tsx         — 7-tab profile
  NewUnitPage.tsx             — full-page unit creation form
  UnitsContextSidebar.tsx     — reusable sidebar

client/src/pages/
  OperatorPortalV6.tsx        — SPA shell, renderPage()
  DealerPortalV6.tsx          — SPA shell, renderPage()
  ClientPortalV6.tsx          — SPA shell, renderPage()
  BidderPortalV6.tsx          — SPA shell
  PortalSelectV6.tsx          — dev tool for role switching
  nav/
    OperatorMainNav.tsx       — dual-context (onShowPage or navigate)
    DealerMainNav.tsx
    ClientMainNav.tsx
    BidderMainNav.tsx
```

## Scripts
```
scripts/
  seed-units-2b.ts            — 3 test units
  seed-module-catalog.ts      — 8 modules
  apply-phase2c-schema.ts     — direct SQL migration
  verify-data-flow.ts         — end-to-end verification
  wipe-users-pre-clerk.ts     — pre-clerk cleanup
```

---

# SECTION 7: BRANDING TIER SYSTEM

| Feature | Base | Mid | Enterprise |
|---------|------|-----|-----------|
| DS360 branding on dealer portal | ✓ | ✗ (dealer's own) | ✗ (dealer's own) |
| DS360 branding on client portal | ✓ | ✓ | ✗ (dealer's brand) |
| Custom logo | ✗ | ✓ | ✓ |
| 2 brand colors | ✗ | ✓ | ✓ |
| Font selection | ✗ | ✓ | ✓ |
| Custom email "from" name | ✗ | ✓ | ✓ |
| Custom subdomain | ✗ | ✗ | ✓ |
| Client portal inherits dealer brand | ✗ | ✗ | ✓ |

Backend enforcement: `PATCH /api/v6/branding/me` rejects with 403 if tier=base. customSubdomain only editable if tier=enterprise.

---

# SECTION 8: MODULE CATALOG (seeded)

| Module Key | Name | Pricing | Default Price | Required Tier | Base Required |
|-----------|------|---------|---------------|---------------|--------------|
| claims | Claims Management | hybrid | $199/mo + $499 setup + $15/claim | base | YES |
| techflow | TechFlow | subscription | $99/mo | base | no |
| marketplace | Dealer Marketplace | subscription | ~$42/mo ($499/yr) | base | no |
| parts_store | Parts Store | commission | 5% | mid | no |
| ai_fi | AI F&I Presenter | per_use | $25/use | mid | no |
| marketing | Marketing Suite | subscription | $149/mo | mid | no |
| consignment | Consignment Management | commission | 10% | base | no |
| financing | Financing Hub | per_use | $49/use | mid | no |

---

# SECTION 9: RULES FOR CC

1. Read this file FIRST before modifying any V6 portal code
2. ALL sidebars must use the visual pattern from Section 1
3. Claims RBAC: operator-only visibility during processing (Section 3)
4. Fan-out rules are defined in Section 5 — follow them exactly
5. Every new page component wraps in PortalShell + SectionLayout
6. Full-page forms for creation, modals ONLY for confirmations
7. URL-based routing for deep linking — no SPA-internal-only pages
8. Do NOT modify locked legacy portal files (OperatorPortal.tsx, DealerPortal.tsx, CustomerPortal.tsx)
9. Pre-existing TS errors in marketplace.ts, membership.ts, auctions.ts, stripe-escrow.ts, crm.ts are NOT your problem
10. Every API endpoint must enforce RBAC per the table in Section 1
