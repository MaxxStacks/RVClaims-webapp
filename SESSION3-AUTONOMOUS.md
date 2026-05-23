## TASK: Register all routes and wire URLs — Session 3 of 4

Session 2 built 13 layouts and 157 page components. Now wire them together with wouter routes so every page has a unique URL.

## STEP 0: READ CURRENT ROUTING

Before writing ANY code, read:
1. client/src/App.tsx — understand the current routing setup
2. client/src/main.tsx — check for Router wrapper
3. Any existing route config files
4. How wouter is currently used (Router, Route, Switch, useLocation, useRoute, useParams)

Print:
- Current route definitions
- How the old monolithic portals are currently routed to
- Whether wouter's Router, Switch, or nested routing is used

STOP and print findings before proceeding.

## STEP 1: ROUTE ARCHITECTURE

After I confirm Step 0, implement this route structure. Since wouter uses flat routes with pattern matching (not nested Outlet), each portal layout wraps its child pages via {children}.

### HELPER PATTERN:

Create a route helper that wraps a layout around page content:

```tsx
// Example pattern for wouter
function PortalRoute({ layout: Layout, page: Page, ...rest }) {
  return (
    <Layout>
      <Page />
    </Layout>
  );
}
```

Or use wouter's nested route pattern if the project already has one established.

### ROUTE DEFINITIONS:

Register ALL of the following routes. Every route connects a Layout + Page component pair.

#### OPERATOR ADMIN — /operator/admin/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /operator/admin | redirect → /operator/admin/dashboard | | |
| /operator/admin/dashboard | OperatorAdminLayout | Dashboard | pages/Dashboard |
| /operator/admin/claims | OperatorAdminLayout | Claims | pages/Claims |
| /operator/admin/claims/:claimId | OperatorAdminLayout | ClaimDetail | pages/ClaimDetail |
| /operator/admin/stale | OperatorAdminLayout | StaleClaims | pages/StaleClaims |
| /operator/admin/queue | OperatorAdminLayout | ProcessingQueue | pages/ProcessingQueue |
| /operator/admin/queue/:batchId | OperatorAdminLayout | BatchReview | pages/BatchReview |
| /operator/admin/units | OperatorAdminLayout | Units | pages/Units |
| /operator/admin/units/new | OperatorAdminLayout | AddUnit | pages/AddUnit |
| /operator/admin/units/:unitId | OperatorAdminLayout | UnitDetail | pages/UnitDetail |
| /operator/admin/dealers | OperatorAdminLayout | DealerManagement | pages/DealerManagement |
| /operator/admin/dealers/new | OperatorAdminLayout | AddDealer | pages/AddDealer |
| /operator/admin/dealers/:dealerId | OperatorAdminLayout | DealerDetail | pages/DealerDetail |
| /operator/admin/dealers/:dealerId/claims | OperatorAdminLayout | DealerClaims | exclusive/operator-admin/DealerClaims |
| /operator/admin/dealers/:dealerId/units | OperatorAdminLayout | DealerUnits | exclusive/operator-admin/DealerUnits |
| /operator/admin/dealers/:dealerId/staff | OperatorAdminLayout | DealerStaffView | exclusive/operator-admin/DealerStaffView |
| /operator/admin/dealers/:dealerId/billing | OperatorAdminLayout | DealerBilling | exclusive/operator-admin/DealerBilling |
| /operator/admin/frc | OperatorAdminLayout | FRCCodes | pages/FRCCodes |
| /operator/admin/financing | OperatorAdminLayout | Financing | pages/Financing |
| /operator/admin/financing/new | OperatorAdminLayout | FinancingNew | pages/FinancingNew |
| /operator/admin/financing/:finId | OperatorAdminLayout | FinancingDetail | pages/FinancingDetail |
| /operator/admin/fi | OperatorAdminLayout | FAndI | pages/FAndI |
| /operator/admin/fi/new | OperatorAdminLayout | FAndINew | pages/FAndINew |
| /operator/admin/fi/:fiId | OperatorAdminLayout | FAndIDetail | pages/FAndIDetail |
| /operator/admin/warranty-plans | OperatorAdminLayout | WarrantyPlans | pages/WarrantyPlans |
| /operator/admin/warranty-plans/new | OperatorAdminLayout | WarrantyPlansNew | pages/WarrantyPlansNew |
| /operator/admin/parts | OperatorAdminLayout | Parts | pages/Parts |
| /operator/admin/parts/new | OperatorAdminLayout | PartsNew | pages/PartsNew |
| /operator/admin/parts/:orderId | OperatorAdminLayout | PartsDetail | pages/PartsDetail |
| /operator/admin/invoices | OperatorAdminLayout | Invoices | pages/Invoices |
| /operator/admin/invoices/new | OperatorAdminLayout | CreateInvoice | pages/CreateInvoice |
| /operator/admin/reports | OperatorAdminLayout | Reports | pages/Reports |
| /operator/admin/marketplace | OperatorAdminLayout | Marketplace | exclusive/operator-admin/Marketplace |
| /operator/admin/marketplace/members | OperatorAdminLayout | MktMembers | exclusive/operator-admin/MktMembers |
| /operator/admin/marketplace/members/:memberId | OperatorAdminLayout | MktMemberDetail | exclusive/operator-admin/MktMemberDetail |
| /operator/admin/marketplace/listings | OperatorAdminLayout | MktListings | exclusive/operator-admin/MktListings |
| /operator/admin/marketplace/transactions | OperatorAdminLayout | MktTransactions | exclusive/operator-admin/MktTransactions |
| /operator/admin/marketplace/transactions/:txnId | OperatorAdminLayout | MktTransactionDetail | exclusive/operator-admin/MktTransactionDetail |
| /operator/admin/marketplace/auctions | OperatorAdminLayout | MktAuctions | exclusive/operator-admin/MktAuctions |
| /operator/admin/marketplace/public-events | OperatorAdminLayout | MktPublicEvents | exclusive/operator-admin/MktPublicEvents |
| /operator/admin/marketplace/public-events/:eventId | OperatorAdminLayout | MktPublicEventDetail | exclusive/operator-admin/MktPublicEventDetail |
| /operator/admin/crm | OperatorAdminLayout | CRM | exclusive/operator-admin/CRM |
| /operator/admin/crm/kanban | OperatorAdminLayout | CRMKanban | exclusive/operator-admin/CRMKanban |
| /operator/admin/crm/:dealerId | OperatorAdminLayout | CRMDealerDetail | exclusive/operator-admin/CRMDealerDetail |
| /operator/admin/users | OperatorAdminLayout | UsersRoles | pages/UsersRoles |
| /operator/admin/products | OperatorAdminLayout | Products | pages/Products |
| /operator/admin/products/new | OperatorAdminLayout | AddProduct | pages/AddProduct |
| /operator/admin/products/:productId/edit | OperatorAdminLayout | EditProduct | pages/EditProduct |
| /operator/admin/communications | OperatorAdminLayout | Communications | exclusive/operator-admin/Communications |
| /operator/admin/blog | OperatorAdminLayout | Blog | exclusive/operator-admin/Blog |
| /operator/admin/notifications | OperatorAdminLayout | Notifications | pages/Notifications |
| /operator/admin/settings | OperatorAdminLayout | Settings | pages/Settings |
| /operator/admin/platform-settings | OperatorAdminLayout | PlatformSettings | pages/Settings |
| /operator/admin/changelog | OperatorAdminLayout | Changelog | pages/Changelog |
| /operator/admin/changelog/feature-request | OperatorAdminLayout | AddFeatureReq | pages/AddFeatureReq |
| /operator/admin/mfr-portals | OperatorAdminLayout | MfrPortals | pages/MfrPortals |
| /operator/admin/techflow | OperatorAdminLayout | TechFlowOversight | exclusive/operator-admin/TechFlowOversight |
| /operator/admin/financing-apps | OperatorAdminLayout | FinancingApps | exclusive/operator-admin/FinancingApps |
| /operator/admin/financing-partners | OperatorAdminLayout | FinancingPartners | exclusive/operator-admin/FinancingPartners |
| /operator/admin/parts-catalog | OperatorAdminLayout | PartsCatalog | exclusive/operator-admin/PartsCatalog |
| /operator/admin/work-by-dealer | OperatorAdminLayout | WorkByDealer | exclusive/operator-admin/WorkByDealer |
| /operator/admin/campaign-templates | OperatorAdminLayout | CampaignTemplates | exclusive/operator-admin/CampaignTemplates |
| /operator/admin/consignment | OperatorAdminLayout | ConsignmentOversight | exclusive/operator-admin/ConsignmentOversight |
| /operator/admin/parts-mgmt | OperatorAdminLayout | PartsMgmt | exclusive/operator-admin/PartsMgmt |
| /operator/admin/parts-orders | OperatorAdminLayout | PartsOrders | exclusive/operator-admin/PartsOrders |
| /operator/admin/escrow | OperatorAdminLayout | EscrowAdmin | exclusive/operator-admin/EscrowAdmin |

#### OPERATOR STAFF — /operator/staff/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /operator/staff | redirect → /operator/staff/dashboard | | |
| /operator/staff/dashboard | OperatorStaffLayout | Dashboard | pages/Dashboard |
| /operator/staff/claims | OperatorStaffLayout | Claims | pages/Claims |
| /operator/staff/claims/:claimId | OperatorStaffLayout | ClaimDetail | pages/ClaimDetail |
| /operator/staff/stale | OperatorStaffLayout | StaleClaims | pages/StaleClaims |
| /operator/staff/queue | OperatorStaffLayout | ProcessingQueue | pages/ProcessingQueue |
| /operator/staff/queue/:batchId | OperatorStaffLayout | BatchReview | pages/BatchReview |
| /operator/staff/units | OperatorStaffLayout | Units | pages/Units |
| /operator/staff/units/:unitId | OperatorStaffLayout | UnitDetail | pages/UnitDetail |
| /operator/staff/dealers | OperatorStaffLayout | DealerManagement | pages/DealerManagement |
| /operator/staff/dealers/:dealerId | OperatorStaffLayout | DealerDetail | pages/DealerDetail |
| /operator/staff/parts | OperatorStaffLayout | Parts | pages/Parts |
| /operator/staff/notifications | OperatorStaffLayout | Notifications | pages/Notifications |
| /operator/staff/changelog | OperatorStaffLayout | Changelog | pages/Changelog |

#### DEALER OWNER — /:dealerId/owner/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /:dealerId/owner | redirect → /:dealerId/owner/dashboard | | |
| /:dealerId/owner/dashboard | DealerOwnerLayout | Dashboard | pages/Dashboard |
| /:dealerId/owner/upload | DealerOwnerLayout | PhotoUpload | exclusive/dealer-owner/PhotoUpload |
| /:dealerId/owner/claims | DealerOwnerLayout | Claims | pages/Claims |
| /:dealerId/owner/claims/new | DealerOwnerLayout | ClaimNew | pages/ClaimNew |
| /:dealerId/owner/claims/:claimId | DealerOwnerLayout | ClaimDetail | pages/ClaimDetail |
| /:dealerId/owner/units | DealerOwnerLayout | Units | pages/Units |
| /:dealerId/owner/units/new | DealerOwnerLayout | UnitNew | pages/UnitNew |
| /:dealerId/owner/units/:unitId | DealerOwnerLayout | UnitDetail | pages/UnitDetail |
| /:dealerId/owner/financing | DealerOwnerLayout | Financing | pages/Financing |
| /:dealerId/owner/financing/new | DealerOwnerLayout | FinancingNew | pages/FinancingNew |
| /:dealerId/owner/financing/:finId | DealerOwnerLayout | FinancingDetail | pages/FinancingDetail |
| /:dealerId/owner/fi | DealerOwnerLayout | FAndI | pages/FAndI |
| /:dealerId/owner/fi/new | DealerOwnerLayout | FAndINew | pages/FAndINew |
| /:dealerId/owner/fi/:fiId | DealerOwnerLayout | FAndIDetail | pages/FAndIDetail |
| /:dealerId/owner/warranty | DealerOwnerLayout | WarrantyPlans | pages/WarrantyPlans |
| /:dealerId/owner/warranty/:planId | DealerOwnerLayout | WarrantyDetail | pages/WarrantyDetail |
| /:dealerId/owner/parts | DealerOwnerLayout | Parts | pages/Parts |
| /:dealerId/owner/parts/new | DealerOwnerLayout | PartsNew | pages/PartsNew |
| /:dealerId/owner/parts/:orderId | DealerOwnerLayout | PartsDetail | pages/PartsDetail |
| /:dealerId/owner/invoices | DealerOwnerLayout | Invoices | pages/Invoices |
| /:dealerId/owner/customers | DealerOwnerLayout | Customers | pages/Customers |
| /:dealerId/owner/customers/:customerId | DealerOwnerLayout | CustomerDetail | pages/CustomerDetail |
| /:dealerId/owner/customers/invite | DealerOwnerLayout | InviteCustomer | pages/InviteCustomer |
| /:dealerId/owner/customer-tickets | DealerOwnerLayout | CustomerTickets | pages/CustomerTickets |
| /:dealerId/owner/customer-tickets/:ticketId | DealerOwnerLayout | TicketDetail | pages/TicketDetail |
| /:dealerId/owner/documents | DealerOwnerLayout | Documents | pages/Documents |
| /:dealerId/owner/techflow | DealerOwnerLayout | WorkOrders | pages/WorkOrders |
| /:dealerId/owner/techflow/new | DealerOwnerLayout | WorkOrderNew | pages/WorkOrderNew |
| /:dealerId/owner/techflow/:workOrderId | DealerOwnerLayout | WorkOrderDetail | pages/WorkOrderDetail |
| /:dealerId/owner/messages | DealerOwnerLayout | Messages | pages/Messages |
| /:dealerId/owner/marketplace | DealerOwnerLayout | Marketplace | exclusive/dealer-owner/Marketplace |
| /:dealerId/owner/consignment | DealerOwnerLayout | Consignment | exclusive/dealer-owner/Consignment |
| /:dealerId/owner/marketing | DealerOwnerLayout | Marketing | exclusive/dealer-owner/Marketing |
| /:dealerId/owner/sales-services | DealerOwnerLayout | SalesServices | exclusive/dealer-owner/SalesServices |
| /:dealerId/owner/notifications | DealerOwnerLayout | Notifications | pages/Notifications |
| /:dealerId/owner/staff | DealerOwnerLayout | StaffManagement | exclusive/dealer-owner/StaffManagement |
| /:dealerId/owner/staff/new | DealerOwnerLayout | AddStaff | exclusive/dealer-owner/AddStaff |
| /:dealerId/owner/branding | DealerOwnerLayout | BrandingSettings | exclusive/dealer-owner/BrandingSettings |
| /:dealerId/owner/billing | DealerOwnerLayout | BillingSettings | exclusive/dealer-owner/BillingSettings |
| /:dealerId/owner/portal-settings | DealerOwnerLayout | PortalSettings | exclusive/dealer-owner/PortalSettings |
| /:dealerId/owner/settings | DealerOwnerLayout | Settings | pages/Settings |
| /:dealerId/owner/whats-new | DealerOwnerLayout | Changelog | pages/Changelog |

#### DEALER STAFF — /:dealerId/staff/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /:dealerId/staff | redirect → /:dealerId/staff/dashboard | | |
| /:dealerId/staff/dashboard | DealerStaffLayout | Dashboard | pages/Dashboard |
| /:dealerId/staff/upload | DealerStaffLayout | PhotoUpload | exclusive/dealer-owner/PhotoUpload |
| /:dealerId/staff/claims | DealerStaffLayout | Claims | pages/Claims |
| /:dealerId/staff/claims/:claimId | DealerStaffLayout | ClaimDetail | pages/ClaimDetail |
| /:dealerId/staff/units | DealerStaffLayout | Units | pages/Units |
| /:dealerId/staff/units/:unitId | DealerStaffLayout | UnitDetail | pages/UnitDetail |
| /:dealerId/staff/parts | DealerStaffLayout | Parts | pages/Parts |
| /:dealerId/staff/customers | DealerStaffLayout | Customers | pages/Customers |
| /:dealerId/staff/customer-tickets | DealerStaffLayout | CustomerTickets | pages/CustomerTickets |
| /:dealerId/staff/customer-tickets/:ticketId | DealerStaffLayout | TicketDetail | pages/TicketDetail |
| /:dealerId/staff/documents | DealerStaffLayout | Documents | pages/Documents |
| /:dealerId/staff/messages | DealerStaffLayout | Messages | pages/Messages |
| /:dealerId/staff/notifications | DealerStaffLayout | Notifications | pages/Notifications |
| /:dealerId/staff/whats-new | DealerStaffLayout | Changelog | pages/Changelog |

#### CLIENT — /:dealerId/client/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /:dealerId/client | redirect → /:dealerId/client/dashboard | | |
| /:dealerId/client/dashboard | ClientLayout | Dashboard | pages/Dashboard |
| /:dealerId/client/my-unit | ClientLayout | UnitDetail | pages/UnitDetail |
| /:dealerId/client/claims | ClientLayout | Claims | pages/Claims |
| /:dealerId/client/claims/:claimId | ClientLayout | ClaimDetail | pages/ClaimDetail |
| /:dealerId/client/warranty | ClientLayout | Warranty | pages/Warranty |
| /:dealerId/client/documents | ClientLayout | Documents | pages/Documents |
| /:dealerId/client/fi-products | ClientLayout | FAndI | pages/FAndI |
| /:dealerId/client/fi-offers | ClientLayout | FIOffers | exclusive/client/FIOffers |
| /:dealerId/client/my-financing | ClientLayout | Financing | pages/Financing |
| /:dealerId/client/parts | ClientLayout | Parts | pages/Parts |
| /:dealerId/client/service-appointments | ClientLayout | ServiceAppointments | pages/ServiceAppointments |
| /:dealerId/client/my-services | ClientLayout | MyServices | exclusive/client/MyServices |
| /:dealerId/client/tickets | ClientLayout | CustomerTickets | pages/CustomerTickets |
| /:dealerId/client/tickets/:ticketId | ClientLayout | TicketDetail | pages/TicketDetail |
| /:dealerId/client/tickets/new | ClientLayout | NewTicket | exclusive/client/NewTicket |
| /:dealerId/client/report-issue | ClientLayout | ReportIssue | exclusive/client/ReportIssue |
| /:dealerId/client/quick-chat | ClientLayout | QuickChat | exclusive/client/QuickChat |
| /:dealerId/client/roadside | ClientLayout | Roadside | exclusive/client/Roadside |
| /:dealerId/client/messages | ClientLayout | Messages | exclusive/client/Messages |
| /:dealerId/client/settings | ClientLayout | Settings | pages/Settings |

#### SERVICE MANAGER — /:dealerId/service-manager/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /:dealerId/service-manager | redirect → dashboard | | |
| /:dealerId/service-manager/dashboard | ServiceManagerLayout | Dashboard | pages/Dashboard |
| /:dealerId/service-manager/claims | ServiceManagerLayout | Claims | pages/Claims |
| /:dealerId/service-manager/claims/:claimId | ServiceManagerLayout | ClaimDetail | pages/ClaimDetail |
| /:dealerId/service-manager/units | ServiceManagerLayout | Units | pages/Units |
| /:dealerId/service-manager/units/:unitId | ServiceManagerLayout | UnitDetail | pages/UnitDetail |
| /:dealerId/service-manager/work-orders | ServiceManagerLayout | WorkOrders | pages/WorkOrders |
| /:dealerId/service-manager/work-orders/new | ServiceManagerLayout | WorkOrderNew | pages/WorkOrderNew |
| /:dealerId/service-manager/work-orders/:workOrderId | ServiceManagerLayout | WorkOrderDetail | pages/WorkOrderDetail |
| /:dealerId/service-manager/scheduling | ServiceManagerLayout | Scheduling | exclusive/service-manager/Scheduling |
| /:dealerId/service-manager/technicians | ServiceManagerLayout | TechAssignments | exclusive/service-manager/TechAssignments |
| /:dealerId/service-manager/parts | ServiceManagerLayout | Parts | pages/Parts |
| /:dealerId/service-manager/service-appointments | ServiceManagerLayout | ServiceAppointments | pages/ServiceAppointments |
| /:dealerId/service-manager/settings | ServiceManagerLayout | ServiceSettings | exclusive/service-manager/ServiceSettings |

#### SHOP MANAGER — /:dealerId/shop-manager/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /:dealerId/shop-manager | redirect → dashboard | | |
| /:dealerId/shop-manager/dashboard | ShopManagerLayout | Dashboard | pages/Dashboard |
| /:dealerId/shop-manager/work-orders | ShopManagerLayout | WorkOrders | pages/WorkOrders |
| /:dealerId/shop-manager/work-orders/:workOrderId | ShopManagerLayout | WorkOrderDetail | pages/WorkOrderDetail |
| /:dealerId/shop-manager/dispatch | ShopManagerLayout | DispatchBoard | exclusive/shop-manager/DispatchBoard |
| /:dealerId/shop-manager/units | ShopManagerLayout | Units | pages/Units |
| /:dealerId/shop-manager/units/:unitId | ShopManagerLayout | UnitDetail | pages/UnitDetail |
| /:dealerId/shop-manager/parts | ShopManagerLayout | Parts | pages/Parts |

#### PARTS MANAGER — /:dealerId/parts-manager/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /:dealerId/parts-manager | redirect → dashboard | | |
| /:dealerId/parts-manager/dashboard | PartsManagerLayout | Dashboard | pages/Dashboard |
| /:dealerId/parts-manager/orders | PartsManagerLayout | Parts | pages/Parts |
| /:dealerId/parts-manager/orders/new | PartsManagerLayout | PartsNew | pages/PartsNew |
| /:dealerId/parts-manager/orders/:orderId | PartsManagerLayout | PartsDetail | pages/PartsDetail |
| /:dealerId/parts-manager/inventory | PartsManagerLayout | Inventory | exclusive/parts-manager/Inventory |
| /:dealerId/parts-manager/claims | PartsManagerLayout | Claims | pages/Claims |

#### FINANCIAL MANAGER — /:dealerId/financial-manager/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /:dealerId/financial-manager | redirect → dashboard | | |
| /:dealerId/financial-manager/dashboard | FinancialManagerLayout | Dashboard | pages/Dashboard |
| /:dealerId/financial-manager/revenue | FinancialManagerLayout | RevenueDashboard | exclusive/financial-manager/RevenueDashboard |
| /:dealerId/financial-manager/fi | FinancialManagerLayout | FAndI | pages/FAndI |
| /:dealerId/financial-manager/fi/:fiId | FinancialManagerLayout | FAndIDetail | pages/FAndIDetail |
| /:dealerId/financial-manager/warranty | FinancialManagerLayout | WarrantyPlans | pages/WarrantyPlans |
| /:dealerId/financial-manager/warranty/:planId | FinancialManagerLayout | WarrantyDetail | pages/WarrantyDetail |
| /:dealerId/financial-manager/financing | FinancialManagerLayout | Financing | pages/Financing |
| /:dealerId/financial-manager/financing/:finId | FinancialManagerLayout | FinancingDetail | pages/FinancingDetail |
| /:dealerId/financial-manager/invoices | FinancialManagerLayout | Invoices | pages/Invoices |

#### SHOP TECHNICIAN — /:dealerId/shop-tech/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /:dealerId/shop-tech | redirect → dashboard | | |
| /:dealerId/shop-tech/dashboard | ShopTechLayout | Dashboard | pages/Dashboard |
| /:dealerId/shop-tech/work-orders | ShopTechLayout | WorkOrders | pages/WorkOrders |
| /:dealerId/shop-tech/work-orders/:workOrderId | ShopTechLayout | WorkOrderDetail | pages/WorkOrderDetail |

#### ON-SITE TECHNICIAN — /:dealerId/on-site-tech/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /:dealerId/on-site-tech | redirect → dashboard | | |
| /:dealerId/on-site-tech/dashboard | OnSiteTechLayout | Dashboard | pages/Dashboard |
| /:dealerId/on-site-tech/work-orders | OnSiteTechLayout | WorkOrders | pages/WorkOrders |
| /:dealerId/on-site-tech/work-orders/:workOrderId | OnSiteTechLayout | WorkOrderDetail | pages/WorkOrderDetail |

#### PUBLIC BIDDER — /marketplace/bidder/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /marketplace/bidder | redirect → dashboard | | |
| /marketplace/bidder/dashboard | PublicBidderLayout | Dashboard | pages/Dashboard |
| /marketplace/bidder/profile | PublicBidderLayout | Profile | exclusive/public-bidder/Profile |
| /marketplace/bidder/verification | PublicBidderLayout | Verification | exclusive/public-bidder/Verification |
| /marketplace/bidder/payment | PublicBidderLayout | Payment | exclusive/public-bidder/Payment |
| /marketplace/bidder/auctions | PublicBidderLayout | Auctions | pages/Auctions |
| /marketplace/bidder/auctions/:auctionId | PublicBidderLayout | AuctionDetail | pages/AuctionDetail |
| /marketplace/bidder/my-bids | PublicBidderLayout | MyBids | exclusive/public-bidder/MyBids |
| /marketplace/bidder/won-units | PublicBidderLayout | WonUnits | exclusive/public-bidder/WonUnits |
| /marketplace/bidder/payment-methods | PublicBidderLayout | PaymentMethods | exclusive/public-bidder/PaymentMethods |
| /marketplace/bidder/settings | PublicBidderLayout | Settings | pages/Settings |

#### CONSIGNOR — /marketplace/consignor/*

| Route Path | Layout | Page Component | Import From |
|---|---|---|---|
| /marketplace/consignor | redirect → dashboard | | |
| /marketplace/consignor/dashboard | ConsignorLayout | Dashboard | pages/Dashboard |
| /marketplace/consignor/my-listings | ConsignorLayout | MyListings | exclusive/consignor/MyListings |
| /marketplace/consignor/my-listings/new | ConsignorLayout | NewListing | exclusive/consignor/NewListing |
| /marketplace/consignor/offers | ConsignorLayout | Offers | exclusive/consignor/Offers |
| /marketplace/consignor/auctions | ConsignorLayout | Auctions | pages/Auctions |
| /marketplace/consignor/auctions/:auctionId | ConsignorLayout | AuctionDetail | pages/AuctionDetail |
| /marketplace/consignor/showcase | ConsignorLayout | Showcase | exclusive/consignor/Showcase |
| /marketplace/consignor/showcase/submit | ConsignorLayout | ShowcaseSubmit | exclusive/consignor/ShowcaseSubmit |
| /marketplace/consignor/payout | ConsignorLayout | PayoutTracking | exclusive/consignor/PayoutTracking |
| /marketplace/consignor/settings | ConsignorLayout | Settings | pages/Settings |

## STEP 2: UPDATE SIDEBAR LINKS

After routes are registered, update every Layout sidebar to use correct relative or absolute paths that match the registered routes.

Verify each layout's nav <Link to="..."> values match the route paths above. If a Link says `to="claims"` but the route expects `/operator/admin/claims`, update accordingly. Use relative paths where wouter supports them, or absolute paths if needed.

## STEP 3: PRESERVE EXISTING ROUTES

Do NOT remove existing routes for:
- Public marketing pages (/, /about, /pricing, /technology, etc.)
- Authentication pages (/login, /signup, /portal-select)
- The old monolithic portal routes (keep them working alongside new routes until Session 4 deletes them)

The new routes must COEXIST with existing routes. No breakage.

## STEP 4: BUILD AND VERIFY

After all routes are registered:

1. Run `npm run build` — must pass with zero errors
2. Print the total number of routes registered
3. Print a verification table:

| Portal | Base Path | Routes | Build? |
|---|---|---|---|
| Operator Admin | /operator/admin | ?? | ✓/✗ |
| Operator Staff | /operator/staff | ?? | ✓/✗ |
| [each portal] | | | |

## CRITICAL RULES
- Do NOT modify any page component files — only routing config and layout link paths
- Do NOT remove or modify existing routes — new routes are ADDITIVE
- Do NOT touch old portal files
- Do NOT change any styling or visual output
- Keep the existing portal-select page functional — it's the entry point users currently use
- Route params (dealerId, claimId, unitId, etc.) must be readable via wouter's useRoute or useParams
- More specific routes must be registered BEFORE wildcard/param routes (e.g., /units/new before /units/:unitId)
- Run npm run build after registering each portal's routes to catch errors incrementally
- If wouter has limitations with this many routes, note them and propose a solution

## OUTPUT — When complete, print:
1. Build status
2. Total routes registered
3. Route verification table (all 13 portals)
4. Any wouter limitations encountered
5. Any sidebar links that needed updating