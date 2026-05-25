# DS360 V7 AUDIT REPORT

Generated: 2026-05-24T00:00:00Z
Audited by: Claude Code (autonomous read-only analysis)
Codebase: D:\Maxx-Projects\RVClaims-webapp\DealerSuite360

---

## EXECUTIVE SUMMARY

The V7 codebase represents a **substantial architectural leap** from the V6 monolithic portal system. The migration from 3 giant portal TSX files to a 13-portal, multi-layout system with 372 TSX components is largely complete at the routing and structure layer. However, the page content layer is a mixed picture: roughly 60% of pages are functional stubs with real API calls and real data, while 40% are UI-only mockups with hardcoded data and `alert()` handlers. The server infrastructure (schema, routes, middleware, RBAC, auth) is production-grade. The frontend portal architecture is structurally correct. The primary gaps are: page-level API wiring, the `dealer-staff` exclusive pages directory is empty, several "coming soon" stub pages exist, and the V6 portal files remain as live fallbacks creating route ambiguity.

**Overall Completeness: ~62% toward production**

---

## SCORE CARD

| Category | Score | Notes |
|---|---|---|
| Portal Architecture (routing) | 9/10 | 13 portals properly routed; dealer-marketplace portals not in PortalRoutes |
| DB Schema | 10/10 | 60+ tables across 4 schema files, fully typed |
| API Routes | 8/10 | ~40 route files, comprehensive coverage, some missing RBAC guards |
| RBAC & Auth | 7/10 | Clerk-based auth real; server RBAC middleware exists; frontend has no guards |
| Claims Module | 6/10 | Core lifecycle present; ClaimDetail uses hardcoded mock; no real claim create flow |
| Page Content (all portals) | 5/10 | ~60% have API calls; 40% are styled mocks with alert() handlers |
| Mobile / Capacitor | 3/10 | Config present, packages installed, no ios/ or android/ build dirs |
| Bilingual i18n | 4/10 | Portal pages use hardcoded strings; i18n only covers marketing site |
| Dark Mode | 7/10 | Implemented in all 13 layouts via localStorage ds360-theme |
| DS360 Assist | 8/10 | Full server + client implementation; 11 component files |
| Screen Share / Remote Support | 8/10 | LiveKit integration, 8 component files, DB schema, server routes |
| Import System | 8/10 | Full CSV import with field mapping UI; server route wired |
| Marketplace / Auctions | 7/10 | Full schema, routes, pages; bidder + consignor portals complete |
| Design Consistency | 8/10 | portal.css class naming consistent; minor deviations in exclusive pages |

---

## SECTION 1: V6 BASELINE vs V7 STATUS

### OPERATOR PORTAL

| # | Nav Item | V7 Status |
|---|---|---|
| 1 | Dashboard | REAL — apiFetch to /api/v6/claims, /api/v6/dealerships, /api/batches |
| 2 | Processing Queue | REAL — apiFetch to /api/batches?status=uploaded; filter UI functional |
| 3 | Batch Review | EXISTS — BatchReview.tsx present in shared pages + operator-admin exclusive; needs API wiring |
| 4 | All Claims | REAL — apiFetch to /api/v6/claims with filter/search; links to claim-detail broken (hardcoded navigate) |
| 5 | Stale Claims | EXISTS — StaleClaims.tsx present; operator-staff exclusive re-exports it |
| 6 | Claim Detail | STUB — uses hardcoded mock `selectedClaimDetail = null`; all values show "—" |
| 7 | Unit Inventory | EXISTS — Units.tsx with table, likely needs API wiring |
| 8 | Unit Detail | REAL — UnitProfilePage.tsx with multi-context support (operator/dealer/client) |
| 9 | Dealer Management | EXISTS — DealerManagement.tsx; real in v6 routes |
| 10 | Dealer Detail | REAL (v6 path) — DealershipDetailPage.tsx with PortalShell embedded; 9 tabs |
| 11 | Service Marketplace | EXISTS — ServiceMarketplace.tsx present |
| 12 | FRC Codes | REAL — apiFetch to /api/v6/frc-codes; add + filter functional |
| 13 | Financing Services | EXISTS — Financing.tsx + FinancingNew + FinancingDetail |
| 14 | F&I Services | EXISTS — FAndI.tsx + FAndINew + FAndIDetail |
| 15 | F&I Products | EXISTS (FAndI maps to Products in some views) |
| 16 | Warranty Plans | EXISTS — WarrantyPlans.tsx + WarrantyPlansNew + WarrantyDetail |
| 17 | Parts & Accessories | EXISTS — Parts.tsx + PartsNew + PartsDetail |
| 18 | Parts Orders | EXISTS — PartsOrders.tsx (exclusive/operator-admin) |
| 19 | Billing & Invoices | EXISTS — Invoices.tsx; CreateInvoice is a styled UI mock (Quick Add buttons are no-ops) |
| 20 | Products & Services | EXISTS — Products.tsx + AddProduct + EditProduct |
| 21 | Revenue Reports | EXISTS — Reports.tsx |
| 22 | Notifications | EXISTS — Notifications.tsx (both shared + exclusive/operator-admin) |
| 23 | Users & Roles | EXISTS — UsersRoles.tsx + InviteUser; likely partially wired |
| 24 | Changelog | EXISTS — Changelog.tsx (4 tabs) + AddFeatureReq |
| 25 | Settings | EXISTS — Settings.tsx + OA_Settings + OA_PlatformSettings |

**V7 Additions (not in V6 list):** WorkByDealer (STUB — Coming Soon), AssistLiveChat, AssistAnalytics, RemoteDashboard, CRM (3 pages), Blog (2 pages), CampaignTemplates, ConsignmentOversight, EscrowAdmin, MktMembers/Listings/Transactions/Auctions/Events (8 pages), FinancingApps/Partners, PartsCatalog/PartsMgmt, Roadmap, TechFlowOversight, DealerClaims/Units/StaffView/Billing (drill-down from dealer detail)

---

### DEALER PORTAL

| # | Nav Item | V7 Status |
|---|---|---|
| 1 | Dashboard | REAL — apiFetch to /api/v6/claims, /api/v6/dealerships |
| 2 | Upload Photos / Push to Claim | EXISTS — PhotoUpload.tsx; upload zone renders; "Push to Claim" button fires navigate(); no real upload to server |
| 3 | My Claims | REAL — Claims.tsx with apiFetch to /api/v6/claims |
| 4 | Claim Detail | STUB — ClaimDetail.tsx uses selectedClaimDetail = null; all values "—" |
| 5 | My Units | EXISTS — Units.tsx |
| 6 | Add Unit | EXISTS — UnitNew.tsx + AddUnit.tsx (dual impl) |
| 7 | Unit Detail | REAL — UnitProfilePage.tsx context="dealer" |
| 8 | Financing | EXISTS — Financing.tsx + FinancingNew + FinancingDetail |
| 9 | F&I Products | EXISTS — FAndI.tsx + FAndINew + FAndIDetail |
| 10 | Warranty Plans | EXISTS — WarrantyPlans.tsx + WarrantyDetail |
| 11 | Parts Orders | EXISTS — Parts.tsx + PartsNew + PartsDetail |
| 12 | Invoices & Billing | EXISTS — Invoices.tsx + BillingSettings.tsx |
| 13 | Customer Portal Management | EXISTS — PortalSettings.tsx (exclusive/dealer-owner) |
| 14 | Customer Tickets | EXISTS — CustomerTickets.tsx + TicketDetail.tsx |
| 15 | Staff | EXISTS — StaffManagement.tsx + AddStaff.tsx |
| 16 | Branding & Domain | EXISTS — BrandingSettings.tsx (functional color pickers; Save/Verify fire alert()) |
| 17 | What's New | EXISTS — DealerChangelog.tsx + Changelog.tsx |
| 18 | Settings | EXISTS — DealerSettings.tsx + Settings.tsx |

**V7 Additions (Dealer Owner):** Customers, InviteCustomer, CustomerDetail, Documents, Messages, Marketplace, Consignment, Marketing, SalesServices, Techflow (WorkOrders), Notifications, Import, MktMyBids, MktEscrowPayments, Transactions

---

### CUSTOMER (CLIENT) PORTAL

| # | Nav Item | V7 Status |
|---|---|---|
| 1 | Dashboard | EXISTS — Dashboard.tsx (same component, ClientLayout wrapper) |
| 2 | My Unit | EXISTS — UnitDetail.tsx context="client" |
| 3 | Warranty & Coverage | EXISTS — Warranty.tsx |
| 4 | Documents | EXISTS — Documents.tsx |
| 5 | Claim Status | EXISTS — Claims.tsx (filtered to client view) |
| 6 | Claim Detail | STUB — ClaimDetail.tsx (same shared stub) |
| 7 | Report an Issue | EXISTS — ReportIssue.tsx (exclusive/client) |
| 8 | Parts Orders | EXISTS — Parts.tsx |
| 9 | Protection Plans | EXISTS via FAndI.tsx / MyServices.tsx |
| 10 | Roadside Assist | EXISTS — Roadside.tsx (exclusive/client); marked "coming soon" internally |
| 11 | Support Tickets | EXISTS — CustomerTickets.tsx + TicketDetail.tsx + NewTicket.tsx |
| 12 | Quick Chat | EXISTS — QuickChat.tsx (exclusive/client) |
| 13 | Settings | EXISTS — Settings.tsx |

---

### BIDDER / MARKETPLACE PORTAL

| # | Nav Item | V7 Status |
|---|---|---|
| 1 | Dashboard | EXISTS — Dashboard.tsx (PublicBidderLayout wrapper) |
| 2 | Profile | EXISTS — PB_Profile.tsx (exclusive/public-bidder) |
| 3 | Verification | EXISTS — PB_Verification.tsx |
| 4 | Payment | EXISTS — PB_Payment.tsx |
| 5 | Upcoming Auctions | EXISTS — Auctions.tsx |
| 6 | My Bids | EXISTS — PB_MyBids.tsx |
| 7 | Won Units | EXISTS — PB_WonUnits.tsx |
| 8 | Settings | EXISTS — Settings.tsx |

---

## SECTION 2: V7 PORTAL ARCHITECTURE — 13 PORTALS

All 13 portals are routed in `PortalRoutes.tsx` and `App.tsx`. Status per portal:

| # | Portal | Route Pattern | Layout File | Sidebar | Pages |
|---|---|---|---|---|---|
| 1 | Operator Admin | /operator/admin/* | OperatorAdminLayout.tsx | YES (full) | 60+ routes |
| 2 | Operator Staff | /operator/staff/* | OperatorStaffLayout.tsx | YES | 14 routes |
| 3 | Dealer Owner | /:dealerId/owner/* | DealerOwnerLayout.tsx | YES (full) | 35+ routes |
| 4 | Dealer Staff | /:dealerId/staff/* | DealerStaffLayout.tsx | YES | 15 routes |
| 5 | Technician (On-Site) | /:dealerId/on-site-tech/* | OnSiteTechLayout.tsx | YES | 3 routes |
| 6 | Client | /:dealerId/client/* | ClientLayout.tsx | YES | 20 routes |
| 7 | Public Bidder | /marketplace/bidder/* | PublicBidderLayout.tsx | YES | 10 routes |
| 8 | Consignor | /marketplace/consignor/* | ConsignorLayout.tsx | YES | 10 routes |
| 9 | Independent Bidder | NOT IMPLEMENTED | — | — | — |
| 10 | Marketplace Admin | NOT IMPLEMENTED | — | — | — |
| 11 | Marketplace Staff | NOT IMPLEMENTED | — | — | — |
| 12 | Dealer Marketplace | NOT IMPLEMENTED | — | — | — |
| 13 | Dealer Marketplace Staff | NOT IMPLEMENTED | — | — | — |

**Other layouts present but not in 13-portal spec:**
- ServiceManagerLayout.tsx → /:dealerId/service-manager/* (6 routes in PortalRoutes)
- ShopManagerLayout.tsx → /:dealerId/shop-manager/* (7 routes)
- PartsManagerLayout.tsx → /:dealerId/parts-manager/* (6 routes)
- FinancialManagerLayout.tsx → /:dealerId/financial-manager/* (9 routes)
- ShopTechLayout.tsx → /:dealerId/shop-tech/* (3 routes)

**FINDINGS:**
- 8 of 13 listed portals are routed and rendered
- 5 marketplace portals (Independent Bidder, Marketplace Admin/Staff, Dealer Marketplace, Dealer Marketplace Staff) have NO layout, NO routes, NO pages
- The V6 monolithic portals (OperatorPortal.tsx, DealerPortal.tsx, CustomerPortal.tsx, BidderPortal.tsx) still exist and serve as fallbacks at /operator-v6, /dealer-v6, /client-v6, /bidder-v6
- `dealer-staff` exclusive pages directory exists but contains ZERO TSX files — the role's pages rely entirely on shared components

---

## SECTION 3: PAGE-BY-PAGE AUDIT

### Methodology
- Content Status: REAL = live API calls; PARTIAL = some API + some mock; STUB = UI only, hardcoded or alert(); EMPTY = placeholder only
- Empty onClick: 49 instances across 22 page files
- TODO/PLACEHOLDER/MOCK occurrences: 211 across 87 files

### Shared Pages (used across multiple portals)

| File | Content Status | Real Handlers | Data Source | Notes |
|---|---|---|---|---|
| Dashboard.tsx | REAL | yes — navigate() handlers | API: /api/v6/claims, /api/v6/dealerships, /api/batches | Some stat fields show "—" (approval rate, revenue, service requests) |
| Claims.tsx | REAL | yes — filter/search handlers | API: /api/v6/claims | navigate to claim-detail is hardcoded path |
| ClaimDetail.tsx | STUB | navigate back | NONE — selectedClaimDetail always null | CRITICAL — all values show "—"; FRC lines are hardcoded HTML |
| ClaimNew.tsx | PARTIAL | form inputs | MOCK | Form renders; no submit handler wired |
| StaleClaims.tsx | PARTIAL | filter UI | API: /api/v6/claims | Filters by stale criteria client-side |
| ProcessingQueue.tsx | REAL | Review button → navigate | API: /api/batches | Navigate to batch-review hardcoded |
| BatchReview.tsx | PARTIAL | review UI | MOCK | Review/sort interface rendered |
| Units.tsx | PARTIAL | filter UI | Likely API | Table present |
| AddUnit.tsx / UnitNew.tsx | STUB | form inputs | NONE | Dual implementation exists |
| UnitDetail.tsx | REAL | tab switching, inline edit | API: /api/v6/units/:id | Full 4-tab profile |
| DealerManagement.tsx | PARTIAL | navigate to new/detail | API: /api/v6/dealerships | |
| DealerDetail.tsx | REAL | 9 tabs, inline edit | API via v6 routes | Full dealer profile |
| FRCCodes.tsx | REAL | add, filter, csv upload | API: /api/v6/frc-codes | CSV upload handler is empty `_e => {}` |
| Financing.tsx | PARTIAL | filter, navigate | MOCK/API | |
| FinancingNew.tsx | STUB | form | NONE | 6 TODO instances |
| FinancingDetail.tsx | STUB | status updates | MOCK | |
| FAndI.tsx | PARTIAL | filter, navigate | MOCK | |
| FAndINew.tsx | STUB | form | NONE | 5 TODO |
| FAndIDetail.tsx | STUB | — | MOCK | |
| WarrantyPlans.tsx | PARTIAL | filter | MOCK | |
| WarrantyPlansNew.tsx | STUB | form | NONE | 5 TODO |
| WarrantyDetail.tsx | STUB | — | MOCK | |
| Warranty.tsx | STUB | — | MOCK | Client-side warranty view |
| Parts.tsx | PARTIAL | filter | MOCK/API | |
| PartsNew.tsx | STUB | form | NONE | 3 TODO |
| PartsDetail.tsx | STUB | status | MOCK | 2 TODO |
| Invoices.tsx | PARTIAL | filter, navigate | MOCK | 1 TODO |
| CreateInvoice.tsx | STUB | Quick Add buttons (no-ops), line items | MOCK | Hardcoded to navigate back to 'billing' |
| Reports.tsx | PARTIAL | date filter | MOCK | Charts rendered |
| UsersRoles.tsx | PARTIAL | invite link | MOCK | 1 TODO |
| Products.tsx | PARTIAL | filter | MOCK | |
| AddProduct.tsx | STUB | form | NONE | 3 TODO |
| EditProduct.tsx | STUB | form | MOCK | |
| Notifications.tsx | PARTIAL | mark read | API: /api/notifications | 2 TODO |
| Settings.tsx | PARTIAL | sub-tabs | MOCK/local | 1 TODO |
| Changelog.tsx | REAL | tab switching | MOCK data + ds360-theme awareness | |
| AddFeatureReq.tsx | STUB | form | NONE | |
| Documents.tsx | STUB | upload | NONE | 3 onClick empty |
| WorkOrders.tsx | PARTIAL | filter | MOCK | |
| WorkOrderNew.tsx | STUB | form | NONE | |
| WorkOrderDetail.tsx | PARTIAL | status | MOCK | 2 onClick empty |
| Messages.tsx | STUB | send | NONE | 1 onClick empty |
| Auctions.tsx | PARTIAL | filter, bid | MOCK | 1 onClick empty |
| AuctionDetail.tsx | STUB | bid form | MOCK | 4 TODO |
| ServiceAppointments.tsx | STUB | calendar | MOCK | |
| ImportData.tsx | REAL | upload, map, preview, import | API: /api/import | Full multi-step import UI with real API integration |
| Customers.tsx | STUB | filter | MOCK | 4 onClick empty |
| CustomerDetail.tsx | STUB | — | MOCK | 1 onClick empty |
| InviteCustomer.tsx | PARTIAL | email invite | API | 4 TODO |
| CustomerTickets.tsx | PARTIAL | filter, tabs | MOCK | 1 TODO |
| TicketDetail.tsx | PARTIAL | reply | MOCK | 1 TODO |

### Exclusive: Operator Admin

| File | Content Status | Notes |
|---|---|---|
| DealerClaims.tsx | PARTIAL | Drilldown from dealer detail |
| DealerUnits.tsx | PARTIAL | Drilldown |
| DealerStaffView.tsx | PARTIAL | Staff list |
| DealerBilling.tsx | PARTIAL | 3 onClick empty |
| Marketplace.tsx | STUB | OA marketplace overview |
| MktMembers.tsx | STUB | 1 TODO |
| MktMemberDetail.tsx | STUB | 1 TODO |
| MktListings.tsx | STUB | 1 TODO |
| MktTransactions.tsx | STUB | |
| MktTransactionDetail.tsx | STUB | 1 onClick empty |
| MktAuctions.tsx | PARTIAL | |
| MktPublicEvents.tsx | STUB | |
| MktPublicEventDetail.tsx | STUB | 1 onClick empty |
| CRM.tsx | STUB | 1 TODO |
| CRMKanban.tsx | PARTIAL | Kanban board UI |
| CRMDealerDetail.tsx | PARTIAL | 2 TODO |
| Communications.tsx | STUB | 1 onClick empty, 2 TODO |
| Blog.tsx | PARTIAL | 3 TODO |
| BlogCreate.tsx | PARTIAL | AI generation UI, 2 TODO |
| InviteUser.tsx | STUB | form, 3 TODO |
| Notifications.tsx | PARTIAL | 2 TODO |
| UsersRoles.tsx | PARTIAL | 1 TODO |
| Settings.tsx | PARTIAL | 1 TODO |
| PlatformSettings.tsx | PARTIAL | Module toggles, 1 TODO |
| TechFlowOversight.tsx | STUB | 1 TODO |
| FinancingApps.tsx | STUB | 1 TODO |
| FinancingPartners.tsx | PARTIAL | |
| PartsCatalog.tsx | STUB | 1 TODO |
| PartsMgmt.tsx | PARTIAL | |
| PartsOrders.tsx | PARTIAL | |
| WorkByDealer.tsx | EMPTY | "Coming Soon — V6 Feature" placeholder |
| CampaignTemplates.tsx | STUB | |
| ConsignmentOversight.tsx | PARTIAL | |
| EscrowAdmin.tsx | PARTIAL | |
| Roadmap.tsx | STUB | 2 TODO |
| AssistLiveChat.tsx | PARTIAL | 1 TODO |
| AssistAnalytics.tsx | PARTIAL | charts/stats |
| AddDealer.tsx | PARTIAL | form, 7 TODO |
| AddFeatureReq.tsx | STUB | 2 TODO |
| AddProduct.tsx | STUB | 3 TODO |
| EditProduct.tsx | STUB | |
| CreateInvoice.tsx | RE-EXPORT | → shared CreateInvoice |
| FRCCodes.tsx | RE-EXPORT | → shared FRCCodes |
| MfrPortals.tsx | RE-EXPORT | → shared MfrPortals |
| DealerManagement.tsx | RE-EXPORT | → shared DealerManagement |

### Exclusive: Dealer Owner

| File | Content Status | Notes |
|---|---|---|
| PhotoUpload.tsx | STUB | Upload zone renders; "Push to Claim" fires navigate('claims'); no real upload |
| BrandingSettings.tsx | PARTIAL | Color pickers are REAL (React state); Save/Verify fire alert(); 4 onClick empty |
| BillingSettings.tsx | STUB | Plan cards UI; 4 onClick empty |
| PortalSettings.tsx | PARTIAL | 2 onClick empty |
| StaffManagement.tsx | STUB | List renders; 1 onClick empty |
| AddStaff.tsx | PARTIAL | Form, 2 TODO |
| Marketplace.tsx | STUB | 8 TODO |
| Consignment.tsx | STUB | 3 onClick empty |
| Marketing.tsx | PARTIAL | campaign UI |
| SalesServices.tsx | PARTIAL | services list |
| DealerChangelog.tsx | PARTIAL | 1 onClick empty, 2 TODO |
| DealerSettings.tsx | PARTIAL | 8 onClick empty, 5 TODO — includes DS360 Assist toggle, screen share toggle |
| MktMyBids.tsx | PARTIAL | bids list |
| MktEscrowPayments.tsx | PARTIAL | payments list |
| Transactions.tsx | PARTIAL | |

### Exclusive: Client

| File | Content Status | Notes |
|---|---|---|
| FIOffers.tsx | STUB | |
| Messages.tsx | STUB | 1 onClick empty |
| MyServices.tsx | STUB | |
| NewTicket.tsx | PARTIAL | form, 2 TODO |
| QuickChat.tsx | PARTIAL | 1 TODO |
| ReportIssue.tsx | STUB | 1 onClick empty, 1 TODO |
| Roadside.tsx | STUB | "Coming Soon" internally, 1 onClick empty |

### Exclusive: Operator Staff

| File | Content Status | Notes |
|---|---|---|
| BatchReview.tsx | RE-EXPORT → shared BatchReview | |
| ProcessingQueue.tsx | RE-EXPORT → shared ProcessingQueue | |
| StaleClaims.tsx | RE-EXPORT → shared StaleClaims | |

### Exclusive: Parts Manager, Service Manager, Shop Manager, Financial Manager, Consignor, Public Bidder

- All exist with 2-6 pages each
- All are PARTIAL or STUB status
- Consignor portal has full listing/offer/payout flow (partially wired)
- Public Bidder has full bid/won/verification flow (partially wired)

### Empty Exclusive Directories (ZERO files)
- `client/src/pages/exclusive/dealer-staff/` — EMPTY
- `client/src/pages/exclusive/on-site-technician/` — EMPTY
- `client/src/pages/exclusive/shop-technician/` — EMPTY

---

## SECTION 4: SERVICE MODULES

| # | Domain | Pages Exist | API Routes Exist | DB Tables Exist | Notes |
|---|---|---|---|---|---|
| 1 | Claims Processing | YES — full lifecycle | YES — /api/v6/claims, /api/claims, /api/batches | YES — claims, claim_frc_lines, photo_batches, photos | ClaimDetail page is stub; batch review needs wiring |
| 2 | Dealer Management | YES | YES — /api/v6/dealerships, /api/dealerships | YES — dealerships, users, invitations | |
| 3 | Unit/Inventory Management | YES | YES — /api/v6/units, /api/units | YES — units, documents, v6_uploads | Import system fully wired |
| 4 | Billing & Invoicing | PARTIAL | YES — /api/invoices, /api/payments | YES — invoices, invoice_line_items, products | CreateInvoice UI is mock-only |
| 5 | F&I Services | PARTIAL | YES — /api/fi-deals (via services.ts) | YES — fi_deals | AI F&I Presenter server lib exists |
| 6 | Warranty Plans | PARTIAL | YES — /api/warranty-plans | YES — warranty_plans | |
| 7 | Financing Services | PARTIAL | YES — /api/financing (via services.ts) | YES — financing_requests, lenders, lender_integrations, financing_applications, lender_submissions, loan_deals | Full schema; UI stubs only |
| 8 | Parts & Accessories | PARTIAL | YES — /api/parts-orders (via services.ts), /api/v6/parts-orders | YES — parts_orders, parts_order_items | |
| 9 | Customer Portal | PARTIAL | YES — /api/tickets, /api/quick-chat | YES — tickets, ticket_messages, quick_chat_messages | Client portal 20 routes |
| 10 | Marketplace/Auctions (D2D) | PARTIAL | YES — /api/marketplace, /api/auctions | YES — marketplace_members, marketplace_listings, auctions, auction_bids, marketplace_transactions, marketplace_holds + 6 more | WebSocket auction engine in server/websocket/auctions.ts |
| 11 | Consignment Services | PARTIAL | PARTIAL | YES — consignors, consignment_agreements | Consignor portal 10 routes; server consignment routes not clearly separated |
| 12 | TechFlow/On-Site Repairs | PARTIAL | PARTIAL | YES — technicians, work_orders, work_order_labor, service_appointments | WorkOrders pages exist; no dedicated TechFlow routes |
| 13 | Marketing Services | PARTIAL | PARTIAL | YES — campaign_templates, campaigns, email_events, leads, landing_pages | CampaignTemplates page exists; Marketing page exists |
| 14 | Roadside Assistance | STUB | NO | NO | Roadside.tsx is a "coming soon" stub |
| 15 | Notification System | PARTIAL | YES — /api/v6/notifications, /api platform | YES — notifications, notification_deliveries, events, user_notification_preferences | Event bus schema complete |
| 16 | Support Ticketing | PARTIAL | YES — /api/tickets | YES — tickets, ticket_messages, assist_support_tickets | DS360 Assist tickets separate from dealer customer tickets |
| 17 | Changelog/Versioning | EXISTS | YES — /api platform (feature-requests) | YES — feature_requests | Changelog.tsx 4-tab UI; FeatureReq form wired |

---

## SECTION 5: CLAIMS WORKFLOW AUDIT

| Stage | Implementation Status |
|---|---|
| 1. Draft | DB enum exists (CLAIM_STATUSES includes "draft"); ClaimNew.tsx form exists but not wired |
| 2. Photo Upload | PhotoUpload.tsx renders upload zone; no real multipart upload to /api/v6/uploads; V6 upload route (uploads-v6.ts) exists |
| 3. FRC Lines | FRCCodes.tsx fetches real FRC codes; ClaimDetail shows hardcoded FRC lines |
| 4. Submit to Operator | Button exists in PhotoUpload ("Push to Claim"); navigates to claims page; no API call |
| 5. Processing Queue | ProcessingQueue.tsx fetches /api/batches; functional |
| 6. Review (Batch Review) | BatchReview.tsx exists; needs full wiring |
| 7. Approve/Deny | Status update in ClaimDetail fires toast; no API patch |
| 8. Parts Order | Parts/PartsNew pages exist; linked to claimId in schema |
| 9. Repair | WorkOrders schema + pages exist; link back to claim exists in schema |
| 10. Invoice | Invoices.tsx + CreateInvoice exists; invoice linked to claim in schema; UI is styled mock |
| 11. Payment | /api/payments routes exist; Stripe fully configured; BillingSettings UI is mock |
| 12. Close | CLAIM_STATUSES includes "closed"; no close button UI found |

**CRITICAL GAP:** The claim creation flow (step 1-4) is broken end-to-end. ClaimNew form does not submit to API. PhotoUpload does not upload files. ClaimDetail reads no data. The core workflow the platform sells is the most incomplete part of the frontend.

---

## SECTION 6: MOBILE APP AUDIT

| Item | Status |
|---|---|
| capacitor.config.ts | EXISTS — D:\Maxx-Projects\RVClaims-webapp\DealerSuite360\capacitor.config.ts |
| @capacitor/core | INSTALLED — v8.2.0 in package.json |
| @capacitor/camera | INSTALLED — v8.0.2 |
| @capacitor/push-notifications | INSTALLED — v8.0.2 |
| Multiple other Capacitor plugins | INSTALLED (app, browser, filesystem, haptics, keyboard, local-notifications, network, share, splash-screen, status-bar) |
| ios/ directory | NOT PRESENT — `npx cap add ios` not yet run |
| android/ directory | NOT PRESENT — `npx cap add android` not yet run |
| MobileBottomNav.tsx | EXISTS — client/src/components/MobileBottomNav.tsx |
| portal-mobile.css | EXISTS — client/src/styles/portal-mobile.css |
| portal-responsive.css | EXISTS — client/src/styles/portal-responsive.css |
| mobile.ts | EXISTS — client/src/lib/mobile.ts |
| mobile-init.ts | EXISTS — client/src/lib/mobile-init.ts |
| use-native.ts | EXISTS — client/src/hooks/use-native.ts |
| manifest.json | NOT PRESENT in public/ |
| sw.js | NOT PRESENT in public/ |

**SUMMARY:** Capacitor scaffolding is complete (config + packages + supporting files), but `cap add ios` and `cap add android` have not been run. No native builds exist. PWA manifest and service worker are absent.

---

## SECTION 7: DATABASE & API AUDIT

### ALL TABLES (from shared/schema.ts, schema-marketplace.ts, schema-assist.ts, schema-remote-support.ts)

**From shared/schema.ts (35 tables + enums):**
1. users
2. sessions
3. invitations
4. dealerships
5. moduleCatalog
6. dealershipModules
7. units
8. claims
9. claimFrcLines
10. photoBatches
11. photos
12. documents
13. invoices
14. invoiceLineItems
15. products
16. financingRequests
17. fiDeals
18. warrantyPlans
19. partsOrders
20. partsOrderItems
21. v6Uploads
22. tickets
23. ticketMessages
24. quickChatMessages
25. notifications
26. platformSettings
27. featureRequests
28. auditLog
29. contacts
30. networkWaitlist
31. bookings
32. blogPosts
33. blogCategories
34. contentQueue
35. dealerListings
36. crmPipeline
37. crmActivities
38. crmTags
39. crmDealerTags
40. crmAttachments
41. dealerReviews
42. dealerMessages
43. quoteRequests
44. importTemplates
45. importHistory
46. events (event bus)
47. notificationDeliveries
48. userNotificationPreferences
49. technicians
50. workOrders
51. workOrderLabor
52. serviceAppointments
53. consignors
54. consignmentAgreements
55. clientPartsOrders
56. lenders
57. lenderIntegrations
58. financingApplications
59. lenderSubmissions
60. loanDeals
61. campaignTemplates
62. campaigns
63. emailEvents
64. leads
65. landingPages

**From shared/schema-marketplace.ts (12 tables):**
66. marketplace_members
67. marketplace_listings
68. listing_photos
69. marketplace_watchlist
70. marketplace_inquiries
71. marketplace_holds
72. marketplace_transactions
73. auctions
74. auction_photos
75. auction_bids
76. auction_watchers
77. saved_searches

**From shared/schema-assist.ts (5 tables):**
78. kb_articles (with pgvector embedding)
79. assist_conversations
80. assist_messages
81. assist_support_tickets
82. assist_knowledge_gaps
83. dealer_account_managers

**From shared/schema-remote-support.ts (3 tables):**
84. remote_sessions
85. remote_session_events
86. document_transfers

**TOTAL: 86 tables defined in Drizzle schema**

Also referenced in server/db/schema-public-auction.ts (separate public auction schema — not part of shared/schema.ts)

---

### ALL API ROUTES (from server/routes/index.ts and route files)

**Core routes from index.ts:**
- GET /api/health
- POST /api/contact
- GET /api/contacts
- POST /api/network-waitlist
- GET /api/network-waitlist
- POST /api/bookings
- GET /api/bookings
- POST /api/chat

**From route modules:**
- /api/users — CRUD for users, invitations, auth
- /api/dealerships — CRUD, subscription management, module activation
- /api/units — CRUD units
- /api/claims — CRUD claims, FRC lines
- /api/products — CRUD products/services catalog
- /api/batches — Photo batch management
- /api/financing — Financing requests
- /api/fi-deals — F&I deals
- /api/warranty-plans — Warranty plan CRUD
- /api/parts-orders — Parts order lifecycle
- /api/documents — Document upload/retrieve
- /api/invoices — Invoice CRUD + line items
- /api/settings — Platform settings
- /api/feature-requests — Feature request CRUD
- /api/notifications — In-app notifications
- /api/payments — Stripe payment intents, webhooks, subscriptions
- /api/quick-chat — Client quick chat messages
- /api/ai — AI suggestions (FRC, photo quality, readiness score)
- /api/marketplace — D2D marketplace listings, inquiries, transactions, holds, escrow
- /api/auctions — Live auction CRUD, bidding
- /api/membership — Marketplace membership applications
- /api/public-auctions — Public auction API
- /api/blog — Blog post CRUD, publish, AI generate
- /api/dealers — Dealer directory listings, CRM
- /api/crm — CRM pipeline, activities, tags
- /api/v6/claims — V6 claims CRUD (legacy)
- /api/v6/notifications — V6 notifications
- /api/v6/users — V6 user management
- /api/v6/uploads — File upload to R2/S3
- /api/v6/parts-orders — V6 parts orders
- /api/v6/units — V6 units CRUD
- /api/v6/dealerships — V6 dealerships
- /api/import — CSV/Excel import with field mapping
- /api/search — Global search across entities
- /api/assist/kb/articles — Knowledge base CRUD
- /api/assist/message — AI message processing
- /api/assist/conversations — Conversation CRUD
- /api/assist/conversations (feedback) — Thumbs up/down
- /api/assist/escalate — Escalate to human
- /api/assist/analytics — Assist usage analytics
- /api/assist/proactive — Proactive notification triggers
- /api/remote — Remote support session management
- /api/transfers — Document transfers

**Clerk-specific:**
- POST /api/clerk-webhook — Clerk user sync webhook

**Notable gaps:**
- No dedicated /api/work-orders route file
- No dedicated /api/service-appointments route file
- No dedicated /api/campaigns route file (marketing)
- No dedicated /api/consignment route file
- Clerk webhook at server/routes/clerk-webhook.ts is imported but not mounted in index.ts

---

## SECTION 8: DESIGN & BRAND CONSISTENCY

**Color palette:**
- Primary navy: `#033280` — Used in capacitor.config.ts, portal.css, index.css
- Primary navy variant: `#08235d` — Used in dealerships schema default, BrandingSettings default
- Green accent: `#0cb22c` — Used in dealerships schema secondaryColor default
- Note: `#033280` vs `#08235d` inconsistency detected (two different navy values in use)

**Typography:**
- Inter font loaded via Google Fonts in index.html (confirmed in CLAUDE.md instructions)
- portal.css applies Inter globally to portal sections

**Component patterns:**
- All portal pages use `portal.css` class names: `.page.active`, `.pn`, `.pn-h`, `.pn-t`, `.btn.btn-p`, `.btn.btn-o`, `.btn.btn-sm`, `.bg` status badges, `.tw table`, `.filter-bar`, `.stats-grid`, `.sc` cards
- Pattern is consistent across shared pages
- Exclusive pages follow the same pattern
- Layouts all use the same sidebar structure with `.sidebar`, `.sidebar-nav`, `.nav-item`, `.nav-section`, `.nav-label`

**Verdict:** Design is consistent with the locked design system. The two navy color values (#033280 vs #08235d) should be unified.

---

## SECTION 9: BILINGUAL AUDIT

**i18n system:**
- `client/src/lib/i18n.ts` — EXISTS, covers EN/FR
- `client/src/hooks/use-language.tsx` — EXISTS
- `client/src/components/language-toggle.tsx` — EXISTS
- localStorage key `ds360-lang` — implemented in all 13 layout files via local state
- FR auto-detection on browser language — implemented in all layouts

**Coverage:**
- Marketing site (home.tsx, all public pages): FULL i18n via i18n.ts translations object
- Portal pages (all 372 TSX in portals/): ZERO i18n — all strings hardcoded in English
- Layout sidebars: ZERO i18n — all nav labels hardcoded in English
- V6 portals (OperatorPortal.tsx, DealerPortal.tsx, CustomerPortal.tsx): PARTIAL — use the DOM-walking i18n.ts engine

**CRITICAL ISSUE:** The V7 portal architecture (all layouts + all pages) has NO French translation coverage. 284+ translation pairs exist in i18n.ts but none are wired to portal components. The CLAUDE.md mandates "All UI text goes through the i18n system. English and French. No hardcoded strings in components. No exceptions." — this rule is violated across all 372 portal TSX files.

---

## SECTION 10: INFRASTRUCTURE

**package.json scripts:**
```
dev: cross-env NODE_ENV=development tsx server/index.ts
build: vite build && esbuild server/index.ts ...
prerender: npx tsx scripts/prerender.ts
start: cross-env NODE_ENV=production node dist/index.js
check: tsc
db:push: drizzle-kit push
```

**vite.config.ts:** Standard Vite + React config with Tailwind and path aliases

**Environment variables required:**
- DATABASE_URL — Neon PostgreSQL (lazy singleton in db.ts)
- JWT_SECRET
- ANTHROPIC_API_KEY — for DS360 Assist + AI document scanner
- TAVUS_API_KEY / DID_API_KEY — AI F&I Presenter (optional)
- Stripe keys (STRIPE_SECRET_KEY, STRIPE_PUBLISHABLE_KEY, STRIPE_WEBHOOK_SECRET)
- CLERK_SECRET_KEY + CLERK_PUBLISHABLE_KEY — Auth provider
- LIVEKIT_URL, LIVEKIT_API_KEY, LIVEKIT_API_SECRET — Remote support
- R2/S3 keys — File storage
- SENDGRID_API_KEY / RESEND_API_KEY — Email

**Auth system:** Clerk (switched from JWT to Clerk). Frontend: `@clerk/clerk-react` + `useAuth`. Backend: `@clerk/express` getAuth() middleware in `server/middleware/auth.ts`. Clerk webhook syncs users to local DB at `server/routes/clerk-webhook.ts` (NOT MOUNTED in index.ts — critical bug).

**DB connection:** Neon serverless PostgreSQL via drizzle-orm with lazy initialization.

**Blog automation:** `server/blog/cron.ts` — node-cron scheduled blog generation with Anthropic Claude API.

---

## SECTION 11: RBAC ENFORCEMENT

**Server-side:**
- `server/middleware/auth.ts` — Clerk-based requireAuth + optionalAuth (FUNCTIONAL)
- `server/middleware/rbac.ts` — requireRole(), requirePermission(), requireOperator(), requireDealer(), scopeToDealership(), canAccessDealership() (FUNCTIONAL)
- `shared/constants.ts` — UserRole types, PERMISSIONS matrix, OPERATOR_ROLES, DEALER_ROLES

**RBAC applied to routes:** Review of route files shows RBAC middleware (`requireAuth`, `requireRole`, `requireOperator`) IS applied to sensitive routes in dealerships.ts, users.ts, etc. but NOT consistently applied across all routes (some v6 routes may lack guards).

**Frontend-side:** ZERO frontend route guards. All portal routes are accessible without authentication. No redirect to login if unauthenticated. The Clerk `useAuth` hook is imported in layouts and `App.tsx` for the `DealerWSConnector`, but no `<SignedIn>` / `<SignedOut>` guards are applied at the route level.

**Multi-tenant isolation:** `scopeToDealership` middleware exists and is designed to scope DB queries. Whether it's applied to all dealer-sensitive routes requires per-route verification.

---

## SECTION 12: SUBSCRIPTION & PRICING MODEL

**Schema:**
- `moduleCatalog` table — 8 module keys: claims, techflow, marketplace, parts_store, ai_fi, marketing, consignment, financing
- `dealershipModules` table — per-dealer module activation with status (enabled/disabled/trial/past_due)
- `dealerships.plan` field — plan_a / plan_b / custom
- `dealerships.monthlyFee` — default $349.00
- `dealerships.brandingTier` — base / mid / enterprise
- Stripe: stripeCustomerId, stripeSubscriptionId, stripeConnectAccountId in dealerships table

**Server implementation:**
- `/api/payments` — Stripe payment intents, subscriptions, webhooks
- `/api/dealerships` — plan management, module activation endpoints (in dealerships.ts)
- `server/lib/stripe.ts` + `server/lib/stripe-escrow.ts` — Stripe SDK configured

**Frontend:**
- `client/src/lib/stripe-client.ts` — Stripe.js client configured
- `client/src/pages/exclusive/dealer-owner/BillingSettings.tsx` — STUB (UI only, no API calls)
- `client/src/pages/exclusive/operator-admin/PlatformSettings.tsx` — Module toggle UI exists
- `scripts/seed-module-catalog.ts` — Referenced in grep results for "module"

**VERDICT:** The pricing/subscription model is fully designed in schema and partially implemented on the server. Frontend billing management is a stub. Module system schema is complete but module-gating of portal sections is not implemented in the frontend.

---

## SECTION 13: LOST FEATURES — FOUND / NOT FOUND (exact file paths)

### 1. DS360 Assist (chatbot/AI agent)
**STATUS: FOUND — SUBSTANTIALLY IMPLEMENTED**

Client files (11):
- `client/src/components/assist/AssistFAB.tsx`
- `client/src/components/assist/AssistPanel.tsx`
- `client/src/components/assist/AssistInput.tsx`
- `client/src/components/assist/AssistMessageList.tsx`
- `client/src/components/assist/AssistQuickReplies.tsx`
- `client/src/components/assist/AssistPastChats.tsx`
- `client/src/components/assist/AssistEscalation.tsx`
- `client/src/components/assist/AssistLiveChat.tsx`
- `client/src/components/assist/AssistWorkflow.tsx`
- `client/src/components/assist/TicketForm.tsx`
- `client/src/components/assist/AccountManagerCard.tsx`

Server files (7):
- `server/lib/assist-engine.ts`
- `server/lib/assist-context.ts`
- `server/lib/assist-workflows.ts`
- `server/lib/assist-workflow-runner.ts`
- `server/lib/assist-proactive.ts`
- `server/routes/assist/message.ts`
- `server/routes/assist/conversations.ts`
- `server/routes/assist/escalate.ts`
- `server/routes/assist/feedback.ts`
- `server/routes/assist/kb.ts`
- `server/routes/assist/analytics.ts`
- `server/routes/assist/proactive.ts`
- `server/middleware/assist-rate-limit.ts`
- `server/scripts/seed-kb.ts`
- `server/lib/vector-store.ts`

DB schema: `shared/schema-assist.ts` (6 tables: kb_articles with pgvector, assist_conversations, assist_messages, assist_support_tickets, assist_knowledge_gaps, dealer_account_managers)

**Functional assessment:** AssistFAB is mounted in App.tsx for dealer portal paths (owner/staff). Full conversation, escalation, and KB system implemented. Appears functional pending ANTHROPIC_API_KEY environment var.

---

### 2. Screen Share / Remote Support
**STATUS: FOUND — SUBSTANTIALLY IMPLEMENTED**

Client files (8):
- `client/src/components/remote-support/ScreenShareGenerator.tsx`
- `client/src/components/remote-support/ScreenShareBanner.tsx`
- `client/src/components/remote-support/ScreenShareRequestToast.tsx`
- `client/src/components/remote-support/ScreenShareActive.tsx`
- `client/src/components/remote-support/ScreenShareViewer.tsx`
- `client/src/components/remote-support/RemoteDashboard.tsx`
- `client/src/components/remote-support/DocumentTransfer.tsx`
- `client/src/components/remote-support/TakeoverModal.tsx`
- `client/src/hooks/useScreenShare.ts`
- `client/src/contexts/RemoteSupportContext.tsx`
- `client/src/components/AppBar.tsx` (contains screen share request button)

Server files:
- `server/lib/livekit-server.ts`
- `server/lib/access-code.ts`
- `server/routes/remote/sessions.ts`
- `server/routes/remote/takeover.ts`
- `server/routes/remote/transfers.ts`

DB schema: `shared/schema-remote-support.ts` (3 tables: remote_sessions, remote_session_events, document_transfers)

**Functional assessment:** LiveKit integration is implemented. Access code generation exists. Screen share banner mounted globally. ScreenShareRequestToast mounted in dealer portal section. RemoteDashboard accessible from both Operator Admin and Operator Staff layouts. **Appears functional pending LIVEKIT env vars.**

---

### 3. Work by Dealer (Agent Mode)
**STATUS: FOUND — STUB ONLY**

Files found:
- `client/src/pages/exclusive/operator-admin/WorkByDealer.tsx` — "Coming Soon — V6 Feature" placeholder
- `client/src/portals/OperatorPortal.tsx` — references "work by dealer" in V6 portal
- `client/src/pages/nav/OperatorMainNav.tsx` — nav item exists
- `client/src/lib/i18n.ts` — translation key present
- `client/src/pages/BidderPortalV6.tsx` — contextual reference
- `client/src/components/units/UnitProfilePage.tsx` — context-aware view

**Functional assessment:** Nav item routes correctly to WorkByDealer page. The page itself is a "Coming Soon" stub with zero functionality.

---

### 4. AI F&I Presenter
**STATUS: FOUND — SERVER ONLY (no frontend UI)**

Files found:
- `server/lib/ai-fi-presenter.ts` — Full implementation with Tavus/D-ID session creation, Anthropic Claude integration, customer context building
- `server/routes/ai.ts` — may contain F&I presenter endpoints
- `client/src/pages/exclusive/operator-admin/PlatformSettings.tsx` — AI F&I Presenter toggle/config (UI)
- `client/src/pages/Changelog.tsx` — mentioned as feature
- `client/src/portals/OperatorPortal.tsx` — referenced in V6 portal

**Functional assessment:** Server library is fully written with Tavus API + D-ID fallback + Anthropic Claude integration. No dedicated frontend component for launching an F&I Presenter session exists. The feature exists as a server capability only.

---

### 5. AI Document Scanner
**STATUS: FOUND — SERVER ONLY (no dedicated frontend UI)**

Files found:
- `server/lib/ai-document-scanner.ts` — Full implementation with Anthropic Claude multimodal OCR
- `server/routes/ai.ts` — may contain document scan endpoints
- `client/src/portals/DealerPortal.tsx` — referenced in V6 portal
- `client/src/portals/OperatorPortal.tsx` — referenced in V6 portal
- `client/src/pages/Changelog.tsx` — mentioned as feature

**Functional assessment:** Server library complete with VIN detection, field extraction, document type classification using Claude API. No V7 frontend upload UI connects to it. Documents.tsx exists but appears to be a simple document list.

---

### 6. Unit Tag Scanner
**STATUS: NOT FOUND as standalone feature**

No files found with tagScan, TagScanner, VIN scan, vinScan, spec tag, or camera scan patterns. The `@capacitor/camera` package is installed, and `client/src/hooks/use-native.ts` exists, suggesting the foundation for camera-based scanning is in place, but no scanner component is built.

---

### 7. Push to Claim
**STATUS: FOUND — UI ONLY (no API wiring)**

Files found:
- `client/src/portals/DealerPortal.tsx` — V6 implementation
- `client/src/portals/OperatorPortal.tsx` — V6 reference
- `client/src/pages/exclusive/dealer-owner/PhotoUpload.tsx` — V7: "Push to Claim →" button navigates to claims page only
- `client/src/pages/exclusive/dealer-owner/DealerChangelog.tsx` — changelog mention
- `client/src/pages/system-status.tsx` — status reference

**Functional assessment:** The "Push to Claim" button in PhotoUpload.tsx calls `navigate('claims')` — it does NOT create a claim or attach a batch to a claim. The upload zone renders but has no `onChange` handler connected to a real upload endpoint.

---

### 8. White-Label Customer Portal
**STATUS: FOUND — SCHEMA COMPLETE, FRONTEND PARTIAL**

Files found:
- `shared/schema.ts` — customDomain, domainVerified, cloudflareZoneId, cloudflareVerificationToken, customDomainStatus, customSubdomain, brandingTier, emailFromName fields in dealerships table
- `client/src/pages/exclusive/dealer-owner/BrandingSettings.tsx` — Custom domain UI with CNAME instructions, DNS verify button (fires alert())
- `server/routes/dealerships.ts` — likely contains domain verification endpoints
- `client/src/pages/fi-services.tsx`, `claims-processing.tsx`, etc. — marketing references
- `client/src/portals/DealerPortal.tsx`, `OperatorPortal.tsx` — V6 references

**Functional assessment:** Full schema support for custom domains. Branding UI exists with color pickers (functional) and domain setup (UI only). Server-side Cloudflare zone management referenced in schema but unclear if implemented in routes. The white-label mechanism (serving portal at custom domain) is not implemented at the DNS/routing layer.

---

### 9. Modular Subscription System
**STATUS: FOUND — SCHEMA + SERVER COMPLETE, FRONTEND PARTIAL**

Files found:
- `shared/schema.ts` — moduleCatalog, dealershipModules tables with 8 module keys
- `client/src/pages/exclusive/operator-admin/PlatformSettings.tsx` — Module toggle UI
- `server/routes/platform.ts` — platform settings routes
- `client/src/pages/Changelog.tsx` — module references
- `scripts/seed-module-catalog.ts` — referenced in grep
- `client/src/pages/services.tsx`, `marketing-services.tsx`, `warranty-extended-service.tsx`, `fi-services.tsx`, `revenue-services.tsx` — marketing pages list modules
- `server/routes/ai.ts` — module-related AI config

**Functional assessment:** Schema is complete and well-designed. Module catalog seed script exists. PlatformSettings UI has module toggles. No frontend enforcement of module gates (e.g., hiding Marketplace nav if marketplace module disabled).

---

### 10. News/Blog Section
**STATUS: FOUND — FULLY IMPLEMENTED**

Files found:
- `client/src/pages/news.tsx` — News listing page
- `client/src/pages/news-article.tsx` — Article detail
- `client/src/pages/blog.tsx` — Blog listing (AI-generated)
- `client/src/pages/blog-post.tsx` — Blog post detail
- `client/src/data/newsData.ts` — Static news data
- `client/src/components/latest-news-section.tsx` — Homepage news section
- `server/blog/` — 7 files: cron.ts, generate-post.ts, prerender-trigger.ts, publish.ts, seed-content-queue.ts, sitemap-updater.ts, prompt-templates/index.ts
- `server/routes/blog.ts` — Blog API routes
- `shared/schema.ts` — blogPosts, blogCategories, contentQueue tables
- `client/src/pages/exclusive/operator-admin/Blog.tsx` — Operator blog management
- `client/src/pages/exclusive/operator-admin/BlogCreate.tsx` — Create/generate blog posts
- `/actualites` and `/actualites/:id` — French news routes in App.tsx

**Functional assessment:** Fully implemented. Auto-generation via Anthropic Claude on cron schedule. French URL path exists. Operator can manage blog from portal.

---

### 11. Public Auction
**STATUS: FOUND — SUBSTANTIALLY IMPLEMENTED**

Files found:
- `client/src/components/PublicAuctionPages.tsx` — Public auction browsing UI
- `client/src/components/live-auctions-section.tsx` — Homepage section
- `client/src/pages/live-auctions.tsx` — Public marketing page
- `client/src/pages/Auctions.tsx` — Portal auction list
- `client/src/pages/AuctionDetail.tsx` — Auction detail + bidding UI
- `client/src/components/OperatorMarketplace.tsx` — Operator marketplace overview
- `client/src/components/DealerMarketplace.tsx` — Dealer marketplace
- `server/routes/auctions.ts` — Live auction API
- `server/routes/public-auctions.ts` — Public auction API
- `server/routes/marketplace.ts` — D2D marketplace API
- `server/routes/membership.ts` — Marketplace membership
- `server/websocket/auctions.ts` — Real-time WebSocket auction engine
- `shared/schema-marketplace.ts` — 12 marketplace/auction tables
- `server/db/schema-public-auction.ts` — Public auction schema
- `client/src/pages/exclusive/operator-admin/MktAuctions.tsx` — Operator auction management
- `client/src/pages/exclusive/public-bidder/` — Full 6-page bidder portal

**Functional assessment:** Full D2D marketplace + live auction system implemented. WebSocket engine exists. Public Bidder portal has 10 routed pages. Escrow/hold system with Stripe integration. The 5 missing marketplace portal roles (independent bidder, marketplace admin/staff, dealer marketplace) have no pages.

---

### 12. Import System
**STATUS: FOUND — FULLY IMPLEMENTED**

Files found:
- `client/src/pages/ImportData.tsx` — Full multi-step import UI (upload → map → preview → result)
- `server/routes/import.ts` — CSV/Excel import API with field mapping
- `shared/schema.ts` — importTemplates, importHistory tables
- `server/directory/import-dealers.ts` — Dealer directory importer

**Functional assessment:** Complete implementation. Supports units, customers, claims, warranty_plans, fi_deals. Download templates, drag-and-drop upload, field mapping with auto-detection, preview before import, import history. Appears fully functional.

---

### 13. Dark Mode
**STATUS: FOUND — FULLY IMPLEMENTED**

Files found (24 files):
- All 13 layout files (OperatorAdminLayout, OperatorStaffLayout, DealerOwnerLayout, DealerStaffLayout, ClientLayout, ServiceManagerLayout, ShopManagerLayout, PartsManagerLayout, FinancialManagerLayout, ShopTechLayout, OnSiteTechLayout, PublicBidderLayout, ConsignorLayout)
- `client/src/styles/portal.css`
- `client/src/styles/portal-mobile.css`
- `client/src/styles/portal-responsive.css`
- `client/src/lib/mobile-init.ts`
- V6 portals (OperatorPortal.tsx, DealerPortal.tsx, CustomerPortal.tsx, BidderPortal.tsx)

**Functional assessment:** `ds360-theme` localStorage key implemented in all 13 layouts. `data-theme='dark'` applied to `document.documentElement`. `portal.css` has `:root[data-theme='dark']` CSS variable overrides. Toggle button in sidebar header. FR toggle also persists. **Fully functional.**

---

### 14. Profile Photo Upload
**STATUS: FOUND — PARTIALLY IMPLEMENTED**

Files found:
- All 13 layout files contain profile photo display logic in sidebar
- `server/routes/users.ts` — User profile update including avatarUrl
- `server/lib/file-storage.ts` — R2/S3 upload abstraction
- `server/routes/uploads-v6.ts` — File upload route (v6)

**Functional assessment:** Sidebar avatar displays `user?.avatarUrl` with fallback initials in all layouts. Upload mechanism in Settings.tsx likely exists but is a stub in most layouts. The actual upload-and-update flow is not clearly wired in V7 settings pages.

---

### 15. Invoice Builder
**STATUS: FOUND — UI ONLY (V6 had DOM manipulation; V7 is static React)**

Files found:
- `client/src/portals/OperatorPortal.tsx` — V6 implementation with `addServiceRow()` and `addPartRow()` DOM manipulation
- `client/src/pages/CreateInvoice.tsx` — V7 implementation: static table with hardcoded items

**Functional assessment:** V6 had dynamic row add/remove via `innerHTML`. V7 CreateInvoice.tsx renders a static table with `<select>` items and hardcoded rows. The "Quick Add" buttons are no-ops. The dynamic row add/remove feature is **LOST in V7** — not migrated from V6 DOM manipulation.

---

## SECTION 14: DEAD CODE & ORPHAN FILE AUDIT

### V6 Legacy Portal Files (still active, not dead):
- `client/src/portals/OperatorPortal.tsx` — ACTIVE, served at /operator-v6 and /operator/:rest* (fallback)
- `client/src/portals/DealerPortal.tsx` — ACTIVE, served at /dealer-v6 and /dealer/:rest* (fallback)
- `client/src/portals/CustomerPortal.tsx` — ACTIVE, served at /client-v6 and /client/:rest* (fallback)
- `client/src/portals/BidderPortal.tsx` — ACTIVE, served at /bidder/:rest*
- `client/src/pages/BidderPortalV6.tsx` — ACTIVE, served at /bidder-v6
- `client/src/pages/PortalSelectV6.tsx` — ACTIVE, served at /portal-select-v6

**These are NOT dead code — they are live V6 portal fallbacks. However they conflict with the V7 architecture and should be migrated out.**

### Legacy/Duplicate Pages in client/src/pages/ (top-level, not in portals/exclusive/):
The following top-level pages duplicate V7 portal pages:
- `client/src/pages/AddDealer.tsx` — duplicated by exclusive/operator-admin/AddDealer.tsx
- `client/src/pages/AddFeatureReq.tsx` — duplicated
- `client/src/pages/AddProduct.tsx` — duplicated
- `client/src/pages/AddUnit.tsx` — UnitNew.tsx also exists (two Add Unit implementations)
- `client/src/pages/BatchReview.tsx` — re-exported from exclusive/operator-admin/
- `client/src/pages/Changelog.tsx` — shared, dual use
- `client/src/pages/ClaimDetail.tsx` — shared
- `client/src/pages/ClaimNew.tsx` — shared
- `client/src/pages/Claims.tsx` — shared
- `client/src/pages/CreateInvoice.tsx` — re-exported from exclusive/operator-admin/
- `client/src/pages/Dashboard.tsx` — shared across all portals
- `client/src/pages/DealerDetail.tsx` — V7 equivalent of DealershipDetailPage component
- `client/src/pages/DealerManagement.tsx` — duplicated
- `client/src/pages/dealer-claim.tsx` — public-facing dealer claim page (not portal)
- `client/src/pages/dealer-dashboard.tsx` — public-facing dealer dashboard (not portal)
- `client/src/pages/dealer-login.tsx` — exists but /dealer redirects to /login
- `client/src/pages/customer-login.tsx` — exists (similar redirect situation)
- `client/src/pages/dev-access.tsx` — V6 dev access
- `client/src/pages/DevAccessV7.tsx` — V7 dev access
- `client/src/pages/Documents.tsx` — shared
- `client/src/pages/EditProduct.tsx` — duplicated
- `client/src/pages/FAndI.tsx` — shared
- `client/src/pages/FRCCodes.tsx` — shared
- `client/src/pages/ImportData.tsx` — shared
- `client/src/pages/Invoices.tsx` — shared
- `client/src/pages/login.tsx` — used; replaces /client-login and /operator routes
- `client/src/pages/MfrPortals.tsx` — shared
- `client/src/pages/Notifications.tsx` — shared
- `client/src/pages/operator-login.tsx` — exists (route: /operator → Redirect to /login)
- `client/src/pages/portal-router.tsx` — legacy portal selector
- `client/src/pages/ProcessingQueue.tsx` — shared
- `client/src/pages/Products.tsx` — shared
- `client/src/pages/Reports.tsx` — shared
- `client/src/pages/ServiceAppointments.tsx` — shared
- `client/src/pages/ServiceMarketplace.tsx` — operator service marketplace
- `client/src/pages/Settings.tsx` — shared (used across 10+ portals)
- `client/src/pages/signup.tsx` — DUPLICATE of sign-up.tsx
- `client/src/pages/StaleClaims.tsx` — shared
- `client/src/pages/Support.tsx` — unclear if still used
- `client/src/pages/UnitDetail.tsx` — separate from UnitProfilePage component
- `client/src/pages/UnitNew.tsx` — DUPLICATE of AddUnit.tsx
- `client/src/pages/Units.tsx` — shared
- `client/src/pages/UsersRoles.tsx` — shared
- `client/src/pages/Warranty.tsx` — shared (client warranty view)
- `client/src/pages/WarrantyDetail.tsx` — shared
- `client/src/pages/WarrantyPlans.tsx` — shared
- `client/src/pages/WarrantyPlansNew.tsx` — shared
- `client/src/pages/WorkOrderDetail.tsx` — shared
- `client/src/pages/WorkOrderNew.tsx` — shared
- `client/src/pages/WorkOrders.tsx` — shared

### Server Orphan/Legacy Files:
- `server/routes/claims-v6.ts` — V6 claims routes (still mounted, still used by V7 pages)
- `server/routes/notifications-v6.ts` — V6 notifications (still mounted)
- `server/routes/users-v6.ts` — V6 users (still mounted)
- `server/routes/uploads-v6.ts` — V6 uploads (still mounted)
- `server/routes/parts-v6.ts` — V6 parts orders (still mounted)
- `server/routes/units-v6.ts` — V6 units (still mounted)
- `server/routes/dealerships-v6.ts` — V6 dealerships (still mounted)
- `server/chatbot-ai.ts`, `server/chatbot-knowledge.ts`, `server/chatbot-responses.ts` — V6 chatbot (replaced by DS360 Assist but still mounted for /api/chat)
- `server/storage.ts` — in-memory Map storage from V1 (still used for contacts, bookings, waitlist via insertContactSchema)
- `server/email.ts` — basic SMTP email (replaced by email-service.ts but still used in routes/index.ts)
- `server/seed.ts` — seed script (standalone)
- `shared/schema.ts.pre-phase1a.bak` — ORPHAN backup file, should not be in codebase

---

## SECTION 15: COMPLETE FILE → MODULE MAP

### client/src/App.tsx
`CORE` | Portal routing, providers, App entry | All portals

### client/src/main.tsx (not listed but exists)
`CORE` | React DOM mount

### client/src/index.css
`CORE` | Global CSS

### client/src/styles/portal.css
`CORE` | Portal design system CSS (locked design)

### client/src/styles/portal-mobile.css
`MOBILE` | Mobile portal styles

### client/src/styles/portal-responsive.css
`MOBILE` | Responsive portal overrides

### client/src/styles/pages.css
`CORE` | Additional page styles

### client/src/lib/

| File | Lines est. | Domain | Notes |
|---|---|---|---|
| api.ts | ~50 | CORE | apiFetch helper |
| i18n.ts | 356 | I18N | EN/FR translations (marketing only) |
| mobile.ts | ~80 | MOBILE | Capacitor detection |
| mobile-init.ts | ~40 | MOBILE | Capacitor lifecycle |
| queryClient.ts | ~30 | CORE | TanStack Query setup |
| stripe-client.ts | ~20 | BILLING | Stripe.js init |
| utils.ts | ~30 | CORE | cn() utility |
| websocket.ts | ~80 | CORE | WebSocket client for real-time |

### client/src/hooks/

| File | Domain | Notes |
|---|---|---|
| use-auth.tsx | CORE | Clerk auth wrapper |
| use-language.tsx | I18N | Language context |
| use-mobile.tsx | MOBILE | Mobile detection |
| use-native.ts | MOBILE | Capacitor native detection |
| useCurrentUser.ts | CORE | Current user hook |
| useScreenShare.ts | SUPPORT | Screen share hook |
| use-toast.ts | CORE | Toast notifications |

### client/src/contexts/

| File | Domain |
|---|---|
| RemoteSupportContext.tsx | SUPPORT |

### client/src/data/

| File | Domain |
|---|---|
| newsData.ts | NOTIFICATIONS (news) |

### client/src/layouts/ (13 portal layout files)

| File | Domain | Portal |
|---|---|---|
| OperatorAdminLayout.tsx | CORE | Operator Admin |
| OperatorStaffLayout.tsx | CORE | Operator Staff |
| DealerOwnerLayout.tsx | CORE | Dealer Owner |
| DealerStaffLayout.tsx | CORE | Dealer Staff |
| ClientLayout.tsx | CUSTOMER | Client/Customer |
| ServiceManagerLayout.tsx | TECHFLOW | Service Manager |
| ShopManagerLayout.tsx | TECHFLOW | Shop Manager |
| PartsManagerLayout.tsx | PARTS | Parts Manager |
| FinancialManagerLayout.tsx | BILLING | Financial Manager |
| ShopTechLayout.tsx | TECHFLOW | Shop Tech |
| OnSiteTechLayout.tsx | TECHFLOW | On-Site Tech |
| PublicBidderLayout.tsx | MARKETPLACE | Public Bidder |
| ConsignorLayout.tsx | CONSIGNMENT | Consignor |

### client/src/portals/

| File | Domain | Notes |
|---|---|---|
| PortalRoutes.tsx | CORE | 13-portal routing (Session 3) |
| OperatorPortal.tsx | LEGACY | V6 monolithic operator portal |
| DealerPortal.tsx | LEGACY | V6 monolithic dealer portal |
| CustomerPortal.tsx | LEGACY | V6 monolithic customer portal |
| BidderPortal.tsx | LEGACY | V6 monolithic bidder portal |

### client/src/pages/nav/ (4 files)

| File | Domain |
|---|---|
| OperatorMainNav.tsx | CORE |
| DealerMainNav.tsx | CORE |
| ClientMainNav.tsx | CUSTOMER |
| BidderMainNav.tsx | MARKETPLACE |

### client/src/pages/ (shared portal pages)

| File | Domain |
|---|---|
| Dashboard.tsx | CORE |
| Claims.tsx | CLAIMS |
| ClaimDetail.tsx | CLAIMS |
| ClaimNew.tsx | CLAIMS |
| StaleClaims.tsx | CLAIMS |
| ProcessingQueue.tsx | CLAIMS |
| BatchReview.tsx | CLAIMS |
| Units.tsx | UNITS |
| AddUnit.tsx | UNITS |
| UnitNew.tsx | UNITS |
| UnitDetail.tsx | UNITS |
| DealerManagement.tsx | DEALERS |
| AddDealer.tsx | DEALERS |
| DealerDetail.tsx | DEALERS |
| FRCCodes.tsx | CLAIMS |
| Financing.tsx | FINANCING |
| FinancingNew.tsx | FINANCING |
| FinancingDetail.tsx | FINANCING |
| FAndI.tsx | FI |
| FAndINew.tsx | FI |
| FAndIDetail.tsx | FI |
| WarrantyPlans.tsx | WARRANTY |
| WarrantyPlansNew.tsx | WARRANTY |
| WarrantyDetail.tsx | WARRANTY |
| Warranty.tsx | WARRANTY |
| Parts.tsx | PARTS |
| PartsNew.tsx | PARTS |
| PartsDetail.tsx | PARTS |
| Invoices.tsx | BILLING |
| CreateInvoice.tsx | BILLING |
| Reports.tsx | BILLING |
| UsersRoles.tsx | DEALERS |
| Products.tsx | BILLING |
| AddProduct.tsx | BILLING |
| EditProduct.tsx | BILLING |
| Notifications.tsx | NOTIFICATIONS |
| Settings.tsx | CORE |
| Changelog.tsx | CHANGELOG |
| AddFeatureReq.tsx | CHANGELOG |
| MfrPortals.tsx | CLAIMS |
| Documents.tsx | UNITS |
| WorkOrders.tsx | TECHFLOW |
| WorkOrderNew.tsx | TECHFLOW |
| WorkOrderDetail.tsx | TECHFLOW |
| Messages.tsx | SUPPORT |
| Auctions.tsx | MARKETPLACE |
| AuctionDetail.tsx | MARKETPLACE |
| ServiceAppointments.tsx | TECHFLOW |
| ImportData.tsx | UNITS |
| Customers.tsx | CUSTOMER |
| CustomerDetail.tsx | CUSTOMER |
| InviteCustomer.tsx | CUSTOMER |
| CustomerTickets.tsx | SUPPORT |
| TicketDetail.tsx | SUPPORT |
| ServiceMarketplace.tsx | MARKETPLACE |
| Support.tsx | SUPPORT |
| MfrPortals.tsx | CLAIMS |
| portal-router.tsx | LEGACY |
| PortalSelectV6.tsx | LEGACY |
| BidderPortalV6.tsx | LEGACY |
| DevAccessV7.tsx | CORE |
| dev-access.tsx | LEGACY |
| dealer-claim.tsx | CLAIMS |
| dealer-dashboard.tsx | DEALERS |
| dealer-login.tsx | LEGACY |
| customer-login.tsx | LEGACY |
| operator-login.tsx | LEGACY |
| client-login.tsx | CORE |
| login.tsx | CORE |
| signup.tsx | CORE |
| sign-up.tsx | CORE |

### client/src/pages/ (marketing/public pages)

| File | Domain |
|---|---|
| home.tsx | CORE |
| about.tsx | CORE |
| services.tsx | CORE |
| claims-processing.tsx | CLAIMS |
| technology.tsx | CORE |
| revenue-services.tsx | CORE |
| rv-coverage.tsx | UNITS |
| contact.tsx | CORE |
| privacy-policy.tsx | CORE |
| financing-services.tsx | FINANCING |
| warranty-extended-service.tsx | WARRANTY |
| fi-services.tsx | FI |
| network-marketplace.tsx | MARKETPLACE |
| live-auctions.tsx | MARKETPLACE |
| pricing.tsx | BILLING |
| book-demo.tsx | CORE |
| on-site-repairs.tsx | TECHFLOW |
| roadside-assistance.tsx | ROADSIDE |
| news.tsx | NOTIFICATIONS |
| news-article.tsx | NOTIFICATIONS |
| blog.tsx | NOTIFICATIONS |
| blog-post.tsx | NOTIFICATIONS |
| dealers.tsx | DEALERS |
| dealer-listing.tsx | DEALERS |
| marketplace.tsx | MARKETPLACE |
| terms-of-service.tsx | CORE |
| cookie-policy.tsx | CORE |
| pipeda-compliance.tsx | CORE |
| careers.tsx | CORE |
| partnerships.tsx | CORE |
| testimonials.tsx | CORE |
| revenue-optimization.tsx | CLAIMS |
| parts-components.tsx | PARTS |
| marketing-services.tsx | MARKETING |
| consignment-services.tsx | CONSIGNMENT |
| extended-warranty.tsx | WARRANTY |
| protection-plans.tsx | WARRANTY |
| claim-guides.tsx | CLAIMS |
| industry-reports.tsx | CORE |
| webinars.tsx | CORE |
| knowledge-base.tsx | SUPPORT |
| dealer-training.tsx | CORE |
| help-center.tsx | SUPPORT |
| documentation.tsx | CORE |
| api-access.tsx | CORE |
| system-status.tsx | CORE |
| dealer-integration.tsx | DEALERS |
| expert-consultation.tsx | CORE |
| not-found.tsx | CORE |
| reset-password.tsx | CORE |

### client/src/pages/exclusive/ (role-specific pages)

| File | Domain | Role |
|---|---|---|
| operator-admin/AddDealer.tsx | DEALERS | OA |
| operator-admin/AddFeatureReq.tsx | CHANGELOG | OA |
| operator-admin/AddProduct.tsx | BILLING | OA |
| operator-admin/AssistAnalytics.tsx | SUPPORT | OA |
| operator-admin/AssistLiveChat.tsx | SUPPORT | OA |
| operator-admin/BatchReview.tsx | CLAIMS | OA re-export |
| operator-admin/Blog.tsx | NOTIFICATIONS | OA |
| operator-admin/BlogCreate.tsx | NOTIFICATIONS | OA |
| operator-admin/CampaignTemplates.tsx | MARKETING | OA |
| operator-admin/Communications.tsx | NOTIFICATIONS | OA |
| operator-admin/ConsignmentOversight.tsx | CONSIGNMENT | OA |
| operator-admin/CreateInvoice.tsx | BILLING | OA re-export |
| operator-admin/CRM.tsx | DEALERS | OA |
| operator-admin/CRMDealerDetail.tsx | DEALERS | OA |
| operator-admin/CRMKanban.tsx | DEALERS | OA |
| operator-admin/DealerBilling.tsx | BILLING | OA |
| operator-admin/DealerClaims.tsx | CLAIMS | OA |
| operator-admin/DealerDetail.tsx | DEALERS | OA re-export |
| operator-admin/DealerManagement.tsx | DEALERS | OA re-export |
| operator-admin/DealerStaffView.tsx | DEALERS | OA |
| operator-admin/DealerUnits.tsx | UNITS | OA |
| operator-admin/EditProduct.tsx | BILLING | OA re-export |
| operator-admin/EscrowAdmin.tsx | MARKETPLACE | OA |
| operator-admin/FinancingApps.tsx | FINANCING | OA |
| operator-admin/FinancingPartners.tsx | FINANCING | OA |
| operator-admin/FRCCodes.tsx | CLAIMS | OA re-export |
| operator-admin/InviteUser.tsx | DEALERS | OA |
| operator-admin/Marketplace.tsx | MARKETPLACE | OA |
| operator-admin/MfrPortals.tsx | CLAIMS | OA re-export |
| operator-admin/MktAuctions.tsx | MARKETPLACE | OA |
| operator-admin/MktListings.tsx | MARKETPLACE | OA |
| operator-admin/MktMemberDetail.tsx | MARKETPLACE | OA |
| operator-admin/MktMembers.tsx | MARKETPLACE | OA |
| operator-admin/MktPublicEventDetail.tsx | MARKETPLACE | OA |
| operator-admin/MktPublicEvents.tsx | MARKETPLACE | OA |
| operator-admin/MktTransactionDetail.tsx | MARKETPLACE | OA |
| operator-admin/MktTransactions.tsx | MARKETPLACE | OA |
| operator-admin/Notifications.tsx | NOTIFICATIONS | OA |
| operator-admin/PartsCatalog.tsx | PARTS | OA |
| operator-admin/PartsMgmt.tsx | PARTS | OA |
| operator-admin/PartsOrders.tsx | PARTS | OA |
| operator-admin/PlatformSettings.tsx | CORE | OA |
| operator-admin/ProcessingQueue.tsx | CLAIMS | OA re-export |
| operator-admin/Products.tsx | BILLING | OA re-export |
| operator-admin/Reports.tsx | BILLING | OA re-export |
| operator-admin/Roadmap.tsx | CHANGELOG | OA |
| operator-admin/Settings.tsx | CORE | OA |
| operator-admin/StaleClaims.tsx | CLAIMS | OA re-export |
| operator-admin/TechFlowOversight.tsx | TECHFLOW | OA |
| operator-admin/UsersRoles.tsx | DEALERS | OA |
| operator-admin/WorkByDealer.tsx | CLAIMS | OA STUB |
| operator-staff/BatchReview.tsx | CLAIMS | OS re-export |
| operator-staff/ProcessingQueue.tsx | CLAIMS | OS re-export |
| operator-staff/StaleClaims.tsx | CLAIMS | OS re-export |
| dealer-owner/AddStaff.tsx | DEALERS | DO |
| dealer-owner/BillingSettings.tsx | BILLING | DO |
| dealer-owner/BrandingSettings.tsx | CUSTOMER | DO |
| dealer-owner/Consignment.tsx | CONSIGNMENT | DO |
| dealer-owner/DealerChangelog.tsx | CHANGELOG | DO |
| dealer-owner/DealerSettings.tsx | CORE | DO |
| dealer-owner/Marketing.tsx | MARKETING | DO |
| dealer-owner/Marketplace.tsx | MARKETPLACE | DO |
| dealer-owner/MktEscrowPayments.tsx | MARKETPLACE | DO |
| dealer-owner/MktMyBids.tsx | MARKETPLACE | DO |
| dealer-owner/PhotoUpload.tsx | CLAIMS | DO |
| dealer-owner/PortalSettings.tsx | CUSTOMER | DO |
| dealer-owner/SalesServices.tsx | FI | DO |
| dealer-owner/StaffManagement.tsx | DEALERS | DO |
| dealer-owner/Transactions.tsx | MARKETPLACE | DO |
| client/FIOffers.tsx | FI | Client |
| client/Messages.tsx | SUPPORT | Client |
| client/MyServices.tsx | WARRANTY | Client |
| client/NewTicket.tsx | SUPPORT | Client |
| client/QuickChat.tsx | SUPPORT | Client |
| client/ReportIssue.tsx | SUPPORT | Client |
| client/Roadside.tsx | ROADSIDE | Client |
| financial-manager/RevenueDashboard.tsx | BILLING | FM |
| parts-manager/Inventory.tsx | PARTS | PM |
| service-manager/Scheduling.tsx | TECHFLOW | SM |
| service-manager/ServiceSettings.tsx | TECHFLOW | SM |
| service-manager/TechAssignments.tsx | TECHFLOW | SM |
| shop-manager/DispatchBoard.tsx | TECHFLOW | ShopM |
| public-bidder/MyBids.tsx | MARKETPLACE | PB |
| public-bidder/Payment.tsx | MARKETPLACE | PB |
| public-bidder/PaymentMethods.tsx | MARKETPLACE | PB |
| public-bidder/Profile.tsx | MARKETPLACE | PB |
| public-bidder/Verification.tsx | MARKETPLACE | PB |
| public-bidder/WonUnits.tsx | MARKETPLACE | PB |
| consignor/MyListings.tsx | CONSIGNMENT | CO |
| consignor/NewListing.tsx | CONSIGNMENT | CO |
| consignor/Offers.tsx | CONSIGNMENT | CO |
| consignor/PayoutTracking.tsx | CONSIGNMENT | CO |
| consignor/Showcase.tsx | CONSIGNMENT | CO |
| consignor/ShowcaseSubmit.tsx | CONSIGNMENT | CO |

### client/src/components/ (non-UI components)

| File | Domain |
|---|---|
| assist/* (11 files) | SUPPORT |
| remote-support/* (8 files) | SUPPORT |
| claims/NewClaimPage.tsx | CLAIMS |
| client/ClientClaimsPage.tsx | CLAIMS/CUSTOMER |
| client/ClientDashboard.tsx | CUSTOMER |
| dealer/DealerClaimsPage.tsx | CLAIMS |
| dealer/DealerDashboard.tsx | DEALERS |
| dealer/DealerPartsOrdersPage.tsx | PARTS |
| operator/ClaimQueuePage.tsx | CLAIMS |
| operator/DealerAccountsListPage.tsx | DEALERS |
| operator/DealersContextSidebar.tsx | DEALERS |
| operator/DealershipDetailPage.tsx | DEALERS |
| operator/NewDealershipPage.tsx | DEALERS |
| operator/OperatorMgmtDashboard.tsx | CORE |
| operator/OperatorOpsDashboard.tsx | CORE |
| operator/PartsManagementPage.tsx | PARTS |
| units/InventoryListPage.tsx | UNITS |
| units/NewUnitPage.tsx | UNITS |
| units/UnitProfilePage.tsx | UNITS |
| units/UnitsContextSidebar.tsx | UNITS |
| service/DispatchBoard.tsx | TECHFLOW |
| layout/PortalShell.tsx | CORE |
| layout/SectionLayout.tsx | CORE |
| layout/tokens.ts | CORE |
| AppBar.tsx | CORE |
| MobileBottomNav.tsx | MOBILE |
| mobile-menu.tsx | CORE |
| NotificationBell.tsx | NOTIFICATIONS |
| PhotoGallery.tsx | UNITS |
| PhotoUploader.tsx | UNITS |
| DealerMarketplace.tsx | MARKETPLACE |
| OperatorMarketplace.tsx | MARKETPLACE |
| PublicAuctionPages.tsx | MARKETPLACE |
| service-badge.tsx | CORE |
| seo-meta.tsx | CORE |
| chatbot-widget.tsx | SUPPORT/LEGACY |

### server/ files

| File | Domain |
|---|---|
| index.ts | CORE |
| db.ts | CORE |
| storage.ts | LEGACY |
| email.ts | LEGACY |
| seed.ts | CORE |
| vite.ts | CORE |
| chatbot-ai.ts | LEGACY |
| chatbot-knowledge.ts | LEGACY |
| chatbot-responses.ts | LEGACY |
| db/schema-marketplace.ts | MARKETPLACE |
| db/schema-public-auction.ts | MARKETPLACE |
| middleware/auth.ts | CORE |
| middleware/rbac.ts | CORE |
| middleware/validate.ts | CORE |
| middleware/assist-rate-limit.ts | SUPPORT |
| middleware/crawler-middleware.ts | CORE |
| lib/auth.ts | CORE |
| lib/ai-document-scanner.ts | CLAIMS |
| lib/ai-fi-presenter.ts | FI |
| lib/ai-frc-suggestions.ts | CLAIMS |
| lib/assist-context.ts | SUPPORT |
| lib/assist-engine.ts | SUPPORT |
| lib/assist-proactive.ts | SUPPORT |
| lib/assist-workflow-runner.ts | SUPPORT |
| lib/assist-workflows.ts | SUPPORT |
| lib/email-service.ts | NOTIFICATIONS |
| lib/email-worker.ts | NOTIFICATIONS |
| lib/event-bus.ts | NOTIFICATIONS |
| lib/file-storage.ts | UNITS |
| lib/livekit-server.ts | SUPPORT |
| lib/notifications.ts | NOTIFICATIONS |
| lib/r2.ts | UNITS |
| lib/search.ts | CORE |
| lib/stripe.ts | BILLING |
| lib/stripe-escrow.ts | MARKETPLACE |
| lib/vector-store.ts | SUPPORT |
| lib/websocket.ts | CORE |
| lib/access-code.ts | SUPPORT |
| routes/index.ts | CORE |
| routes/ai.ts | CLAIMS |
| routes/assist/* (7 files) | SUPPORT |
| routes/auctions.ts | MARKETPLACE |
| routes/batches.ts | CLAIMS |
| routes/blog.ts | NOTIFICATIONS |
| routes/claims.ts | CLAIMS |
| routes/claims-v6.ts | LEGACY |
| routes/clerk-webhook.ts | CORE |
| routes/crm.ts | DEALERS |
| routes/dealerships.ts | DEALERS |
| routes/dealerships-v6.ts | LEGACY |
| routes/directory.ts | DEALERS |
| routes/documents.ts | UNITS |
| routes/import.ts | UNITS |
| routes/invoices.ts | BILLING |
| routes/marketplace.ts | MARKETPLACE |
| routes/membership.ts | MARKETPLACE |
| routes/notifications-v6.ts | LEGACY |
| routes/parts-v6.ts | LEGACY |
| routes/payments.ts | BILLING |
| routes/platform.ts | CORE |
| routes/products.ts | BILLING |
| routes/public-auctions.ts | MARKETPLACE |
| routes/quick-chat.ts | CUSTOMER |
| routes/remote/* (3 files) | SUPPORT |
| routes/search.ts | CORE |
| routes/services.ts | FI/FINANCING/WARRANTY/PARTS |
| routes/tickets.ts | SUPPORT |
| routes/units.ts | UNITS |
| routes/units-v6.ts | LEGACY |
| routes/uploads-v6.ts | LEGACY |
| routes/users.ts | CORE |
| routes/users-v6.ts | LEGACY |
| blog/* (7 files) | NOTIFICATIONS |
| directory/* (2 files) | DEALERS |
| scripts/seed-kb.ts | SUPPORT |
| websocket/auctions.ts | MARKETPLACE |

### shared/ files

| File | Domain |
|---|---|
| schema.ts | CORE |
| schema-marketplace.ts | MARKETPLACE |
| schema-assist.ts | SUPPORT |
| schema-remote-support.ts | SUPPORT |
| constants.ts | CORE |
| schema.ts.pre-phase1a.bak | UNKNOWN (orphan) |

---

## SECTION 16: DATABASE CLEANUP READINESS

**Tables with API routes and active usage:**
- users, sessions, invitations — auth routes
- dealerships, dealershipModules, moduleCatalog — dealership management
- units, photos, photoBatches, documents, v6Uploads — unit management
- claims, claimFrcLines — claims processing
- invoices, invoiceLineItems, products — billing
- financingRequests, fiDeals, warrantyPlans, partsOrders, partsOrderItems — service modules
- tickets, ticketMessages, quickChatMessages — support
- notifications, notificationDeliveries, events, userNotificationPreferences — notification system
- blogPosts, blogCategories, contentQueue — blog
- dealerListings, crmPipeline, crmActivities, crmTags, crmDealerTags, crmAttachments, dealerReviews, dealerMessages, quoteRequests — dealer directory/CRM
- importTemplates, importHistory — import system
- marketplace_members, marketplace_listings, listing_photos, marketplace_watchlist, marketplace_inquiries, marketplace_holds, marketplace_transactions, auctions, auction_bids, auction_photos, auction_watchers, saved_searches — marketplace
- kb_articles, assist_conversations, assist_messages, assist_support_tickets, assist_knowledge_gaps, dealer_account_managers — DS360 Assist
- remote_sessions, remote_session_events, document_transfers — remote support
- featureRequests, platformSettings, auditLog — platform admin

**Tables defined but NO apparent API routes:**
- technicians — No dedicated /api/technicians route
- workOrders, workOrderLabor — No dedicated /api/work-orders route
- serviceAppointments — No dedicated /api/service-appointments route
- consignors, consignmentAgreements — No dedicated consignment API routes
- clientPartsOrders — No dedicated route (separate from parts_orders)
- lenders, lenderIntegrations, financingApplications, lenderSubmissions, loanDeals — Full schema, unclear if wired (may be in services.ts)
- campaignTemplates, campaigns, emailEvents, leads, landingPages — Marketing schema complete; no dedicated campaign routes found
- contacts, networkWaitlist, bookings — Handled inline in routes/index.ts; old V1 patterns

**Schema not registered in Drizzle migrations (separate files, may need db:push):**
- `server/db/schema-marketplace.ts` — separate from shared/schema.ts; may not be in drizzle.config
- `shared/schema-assist.ts` — needs pgvector extension
- `shared/schema-remote-support.ts` — separate file

---

## CRITICAL ISSUES

### 1. ClaimDetail.tsx renders ZERO data
`client/src/pages/ClaimDetail.tsx` — `selectedClaimDetail` is always `null` (initialized with `useState<any | null>(null)`, never populated). Every claim-related page that navigates to ClaimDetail shows all "—" values. This is the single most visible bug in the platform's core module.

### 2. ClaimNew form is not wired to any API
`client/src/pages/ClaimNew.tsx` — The form exists but has no `onSubmit` connected to `/api/claims` or `/api/v6/claims`. Users cannot create claims from the V7 portal.

### 3. PhotoUpload has no file upload
`client/src/pages/exclusive/dealer-owner/PhotoUpload.tsx` — Upload zone renders but `onChange` is not wired to `/api/v6/uploads`. "Push to Claim" navigates to claims list only; no batch is created.

### 4. Clerk webhook NOT MOUNTED in index.ts
`server/routes/clerk-webhook.ts` exists but is NOT imported in `server/routes/index.ts`. Clerk user sync will fail silently — new users who sign up via Clerk will have no DB record, causing `requireAuth` to return 401 for all API calls.

### 5. dealer-staff exclusive pages directory is EMPTY
`client/src/pages/exclusive/dealer-staff/` — Zero TSX files. The Dealer Staff portal (a primary RBAC role) has no exclusive pages and relies entirely on shared components with no role-specific view customization.

### 6. i18n is ABSENT from all V7 portal pages
372 TSX portal files have hardcoded English strings. CLAUDE.md Rule 4 mandates bilingual. The i18n system in i18n.ts only covers the marketing site. EN/FR toggle in portal sidebars changes localStorage but translates nothing in V7 portals.

### 7. No frontend auth guards on portal routes
All portal routes (/:dealerId/owner/*, /operator/admin/*, etc.) are accessible without authentication. `requireAuth` on the server prevents unauthorized API calls, but the UI renders fully for unauthenticated users.

---

## HIGH PRIORITY ISSUES

### 8. WorkByDealer is a "Coming Soon" placeholder
Prominent Operator Admin nav item goes to a stub with "Coming Soon — V6 Feature" text. This was a V6 feature that was not migrated.

### 9. Invoice Builder lost dynamic row functionality
V6 OperatorPortal.tsx had `addServiceRow()` and `addPartRow()` with DOM manipulation. V7 CreateInvoice.tsx has a static table. The dynamic invoice builder is partially regressed.

### 10. Branding/Custom Domain UI has no backend connection
BrandingSettings.tsx Save and Verify buttons fire `alert()`. Custom domain setup does not call any API. White-label feature is UI-only.

### 11. 5 marketplace portal roles have zero implementation
Independent Bidder, Marketplace Admin, Marketplace Staff, Dealer Marketplace, and Dealer Marketplace Staff portals are listed in the V7 spec but have no layout files, no routes, and no pages.

### 12. navigate() calls in claims use relative paths
`navigate('claim-detail')` instead of an absolute path with a claim ID parameter. Clicking any claim row navigates to a blank ClaimDetail. The routing pattern for detail pages needs to pass IDs.

### 13. BatchReview not connected to claim builder
ProcessingQueue links to BatchReview. BatchReview exists but the flow of: review photos → assign FRC codes → create claim is not implemented end-to-end.

### 14. server/routes/clerk-webhook.ts not imported
File exists and is valid but is never mounted. Without this, Clerk user creation events don't sync to the local users table.

---

## MEDIUM PRIORITY ISSUES

### 15. signup.tsx and sign-up.tsx are duplicate pages
Both exist at `/signup/:rest*` and `/sign-up`. The dealer sign-up flow needs consolidation.

### 16. UnitNew.tsx and AddUnit.tsx duplicate implementations
Two different "add unit" form components exist. Should be unified.

### 17. DealerDetail.tsx vs DealershipDetailPage.tsx
Top-level DealerDetail.tsx and component-level DealershipDetailPage.tsx serve similar purposes. The V6 route system uses the component version (PortalShell injected). Duplication risk.

### 18. V6 portal fallback routes create route ambiguity
`/operator/:rest*` still serves the V6 OperatorPortal.tsx because the Switch processes V7 paths first but falls through for unmatched paths. Need to audit what paths fall through.

### 19. shared/schema.ts.pre-phase1a.bak should be removed
Backup file in the shared directory. Should not be in version control.

### 20. server/storage.ts (in-memory Map) still active
contacts, bookings, waitlist still use in-memory storage from V1. These will be wiped on every server restart. Should be migrated to PostgreSQL tables (tables already exist in schema).

### 21. FRC code CSV upload handler is empty
`handleFrcCsvUpload = (_e: React.ChangeEvent<HTMLInputElement>) => {}` — The CSV upload for bulk FRC code import does nothing.

### 22. navigate calls don't pass entity IDs
Multiple pages navigate to detail views without the ID: `navigate('claim-detail')`, `navigate('dealer-detail')`. Detail pages receive no context about which entity to load.

### 23. Missing API routes for Phase 1A tables
No server routes for: work_orders, technicians, service_appointments, consignment_agreements, campaigns, leads. Schema is complete; routes need to be created.

---

## RECOMMENDED FIX ORDER

**Phase 1: Core Claims Flow (highest business priority)**
1. Wire ClaimNew.tsx form to POST /api/v6/claims or /api/claims
2. Wire PhotoUpload.tsx upload zone to POST /api/v6/uploads; create photoBatch on submit
3. Fix ClaimDetail.tsx to load claim by ID from URL params via GET /api/v6/claims/:id or /api/claims/:id
4. Fix all `navigate('claim-detail')` calls to `navigate('claims/' + claim.id)`
5. Wire BatchReview to build claim from batch (FRC assignment flow)
6. Wire "Push to Claim" to create a batch and link to claim

**Phase 2: Auth & Route Guards**
7. Mount clerk-webhook.ts in routes/index.ts
8. Add `<SignedIn>` / redirect guards to portal layout components
9. Apply RBAC checks consistently to all v6 API routes

**Phase 3: i18n Portal Coverage**
10. Create portal i18n translation hook that uses the existing translations object
11. Apply to all 13 layout files (sidebar nav labels, UI chrome)
12. Apply to highest-traffic shared pages (Dashboard, Claims, Units, ClaimDetail)

**Phase 4: Complete the Invoice Builder**
13. Replace static CreateInvoice table with dynamic row add/remove (migrate from V6 DOM manipulation to React state)
14. Wire Save & Send to POST /api/invoices

**Phase 5: Dealer Staff Exclusive Pages**
15. Create minimal exclusive pages for dealer-staff role (currently using only shared pages with no role customization)

**Phase 6: Missing Marketplace Portals**
16. Create layouts + routes for 5 missing marketplace portal roles

**Phase 7: Wire Remaining Service Module Pages**
17. Wire all Financing, F&I, Warranty, Parts form pages to their APIs
18. Create API routes for workOrders, serviceAppointments, campaigns, consignment

**Phase 8: Mobile Buildout**
19. Run `npx cap add ios` and `npx cap add android`
20. Create manifest.json and sw.js for PWA
21. Implement Unit Tag Scanner using @capacitor/camera

**Phase 9: Cleanup**
22. Remove shared/schema.ts.pre-phase1a.bak
23. Migrate storage.ts (contacts/bookings/waitlist) to PostgreSQL
24. Consolidate signup.tsx + sign-up.tsx
25. Consolidate UnitNew.tsx + AddUnit.tsx
26. Plan V6 portal retirement path (redirect old /operator-v6, /dealer-v6 to new V7 paths)
