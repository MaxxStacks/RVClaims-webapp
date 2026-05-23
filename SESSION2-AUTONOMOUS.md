## TASK: Build 13 portal layouts and populate all page components

This is Session 2 of 4. Session 1 created 136 placeholder files. Now you will:
A. Build each of the 13 layouts with sidebar navigation and AppBar
B. Extract page content from the old monolithic portals into the new page files

This is a large task. Work methodically. Do NOT rush.

## PART A: BUILD THE 13 LAYOUTS

Each layout must:
1. Clone the sidebar + AppBar visual style from the closest existing portal (see table below)
2. Use React Router's <Outlet /> for child route content
3. Include ONLY the nav items listed for that portal
4. Show the role name in the sidebar footer
5. Use <Link to="routePath"> or <NavLink> for navigation — NOT onClick/setActivePage
6. Preserve all existing CSS classes, inline styles, brand colors, and visual appearance

### CLONE SOURCE TABLE:

| # | Layout File | Clone Sidebar/AppBar From | Role Label in Footer |
|---|---|---|---|
| 1 | OperatorAdminLayout.tsx | OperatorPortal.tsx | Operator Admin |
| 2 | OperatorStaffLayout.tsx | OperatorPortal.tsx | Operator Staff |
| 3 | DealerOwnerLayout.tsx | DealerPortal.tsx | Dealer Owner |
| 4 | DealerStaffLayout.tsx | DealerPortal.tsx | Dealer Staff |
| 5 | ClientLayout.tsx | CustomerPortal.tsx | Client |
| 6 | ServiceManagerLayout.tsx | DealerPortal.tsx (adapted) | Service Manager |
| 7 | ShopManagerLayout.tsx | DealerPortal.tsx (adapted) | Shop Manager |
| 8 | PartsManagerLayout.tsx | DealerPortal.tsx (adapted) | Parts Manager |
| 9 | FinancialManagerLayout.tsx | DealerPortal.tsx (adapted) | Financial Manager |
| 10 | ShopTechLayout.tsx | DealerPortal.tsx (adapted) | Shop Technician |
| 11 | OnSiteTechLayout.tsx | DealerPortal.tsx (adapted) | On-Site Technician |
| 12 | PublicBidderLayout.tsx | BidderPortal.tsx | Public Bidder |
| 13 | ConsignorLayout.tsx | BidderPortal.tsx (adapted) | Consignor |

### SIDEBAR NAV ITEMS PER LAYOUT:

Each nav item maps to a route path. Use <NavLink to="routePath"> so the active page highlights automatically.

#### 1. OperatorAdminLayout.tsx
| Nav Label | Route Path | Icon (use existing icon pattern from OperatorPortal) |
|---|---|---|
| Dashboard | dashboard | LayoutDashboard or equivalent |
| Claims | claims | FileText |
| Stale Claims | stale | AlertTriangle |
| Processing Queue | queue | Inbox |
| Units | units | Truck |
| Dealers | dealers | Building |
| FRC Codes | frc | Database |
| Financing | financing | DollarSign |
| F&I | fi | Shield |
| Warranty Plans | warranty-plans | ShieldCheck |
| Parts | parts | Package |
| Invoices | invoices | Receipt |
| Reports | reports | BarChart |
| Marketplace | marketplace | Store |
| CRM | crm | Users |
| Users & Roles | users | UserCog |
| Products | products | Box |
| Communications | communications | MessageSquare |
| Blog | blog | PenTool |
| Notifications | notifications | Bell |
| Settings | settings | Settings |
| Platform Settings | platform-settings | Sliders |
| Changelog | changelog | BookOpen |

#### 2. OperatorStaffLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| Claims | claims |
| Stale Claims | stale |
| Processing Queue | queue |
| Units | units |
| Dealers | dealers |
| Parts | parts |
| Notifications | notifications |
| Changelog | changelog |

#### 3. DealerOwnerLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| Upload Photos | upload |
| Claims | claims |
| Units | units |
| Financing | financing |
| F&I | fi |
| Warranty Plans | warranty |
| Parts | parts |
| Invoices | invoices |
| Customers | customers |
| Customer Tickets | customer-tickets |
| Documents | documents |
| TechFlow | techflow |
| Messages | messages |
| Marketplace | marketplace |
| Consignment | consignment |
| Marketing | marketing |
| Sales & Services | sales-services |
| Notifications | notifications |
| Staff | staff |
| Branding | branding |
| Billing | billing |
| Settings | settings |
| What's New | whats-new |

#### 4. DealerStaffLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| Upload Photos | upload |
| Claims | claims |
| Units | units |
| Parts | parts |
| Customers | customers |
| Customer Tickets | customer-tickets |
| Documents | documents |
| Messages | messages |
| Notifications | notifications |
| What's New | whats-new |

#### 5. ClientLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| My Unit | my-unit |
| Claims | claims |
| Warranty | warranty |
| Documents | documents |
| F&I Products | fi-products |
| F&I Offers | fi-offers |
| My Financing | my-financing |
| Parts | parts |
| Service Appointments | service-appointments |
| My Services | my-services |
| Support Tickets | tickets |
| Quick Chat | quick-chat |
| Roadside | roadside |
| Messages | messages |
| Settings | settings |

#### 6. ServiceManagerLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| Claims | claims |
| Units | units |
| Work Orders | work-orders |
| Scheduling | scheduling |
| Technicians | technicians |
| Parts | parts |
| Service Appointments | service-appointments |
| Settings | settings |

#### 7. ShopManagerLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| Work Orders | work-orders |
| Dispatch Board | dispatch |
| Units | units |
| Parts Status | parts |

#### 8. PartsManagerLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| Parts Orders | orders |
| Inventory | inventory |
| Claims | claims |

#### 9. FinancialManagerLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| Revenue | revenue |
| F&I | fi |
| Warranty Plans | warranty |
| Financing | financing |
| Invoices | invoices |

#### 10. ShopTechLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| My Work Orders | work-orders |

#### 11. OnSiteTechLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| My Work Orders | work-orders |

#### 12. PublicBidderLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| Profile | profile |
| Verification | verification |
| Payment | payment |
| Auctions | auctions |
| My Bids | my-bids |
| Won Units | won-units |
| Payment Methods | payment-methods |
| Settings | settings |

#### 13. ConsignorLayout.tsx
| Nav Label | Route Path |
|---|---|
| Dashboard | dashboard |
| My Listings | my-listings |
| Offers | offers |
| Auctions | auctions |
| Showcase | showcase |
| Payout Tracking | payout |
| Settings | settings |

### LAYOUT STRUCTURE TEMPLATE:

Every layout follows this pattern. Copy the actual sidebar HTML/CSS from the source portal — do NOT create new styling:

```tsx
import { Outlet, NavLink } from 'react-router-dom';
// Copy the same icon imports the source portal uses

export default function [PortalName]Layout() {
  return (
    <div className="[copy exact portal shell classNames from source]">
      {/* Sidebar — copy the exact HTML structure and CSS classes from the source portal */}
      <aside className="[exact sidebar classes from source]">
        {/* Logo area — copy from source */}
        
        <nav>
          {/* Each nav item uses NavLink instead of onClick */}
          <NavLink to="dashboard" className={({isActive}) => `[nav-item classes] ${isActive ? 'active' : ''}`}>
            <IconComponent /> Dashboard
          </NavLink>
          <NavLink to="claims" className={({isActive}) => `[nav-item classes] ${isActive ? 'active' : ''}`}>
            <IconComponent /> Claims
          </NavLink>
          {/* ... all nav items for this portal */}
        </nav>

        {/* Sidebar footer — copy from source, update role label */}
        <div className="[footer classes]">
          <div className="[role label]">[Role Name]</div>
        </div>
      </aside>

      {/* AppBar — copy the exact HTML structure from the source portal */}
      <header className="[exact appbar classes from source]">
        {/* Copy AppBar content — notification bell, user menu, etc. */}
      </header>

      {/* Content area — Outlet replaces the conditional page rendering */}
      <main className="[exact content area classes from source]">
        <Outlet />
      </main>
    </div>
  );
}
```

### IMPORTANT FOR LAYOUTS:
- Copy the ACTUAL sidebar HTML, CSS classes, and inline styles from each source portal
- Do NOT create new or generic styling — match the existing visual exactly
- The sidebar toggle (collapse/expand) functionality should be preserved if it exists
- The AppBar notification bell, user avatar/menu, and any dropdowns should be preserved
- Remove ALL page-rendering logic (the switch/conditional blocks) — Outlet handles that now
- Remove ALL activePage/setActivePage state — NavLink handles active state
- Keep any shared state that pages will need (user data, dealer data, API fetched arrays) and pass via context
- Import Outlet and NavLink from react-router-dom

STOP after building all 13 layouts. Run `npm run build`. Print status and any errors.

## PART B: POPULATE PAGE COMPONENTS

After all 13 layouts compile, extract page content from the old portals into the new page files.

### EXTRACTION PROCESS:

For each page file (shared and exclusive):

| Step | Action |
|---|---|
| 1 | Open the source portal file listed in the page's comment header |
| 2 | Find the JSX block at the line range listed in the comment |
| 3 | Copy that ENTIRE JSX block — including all inline styles, handlers, state, hooks |
| 4 | Paste it as the return value of the page component |
| 5 | Move any state variables, useEffect hooks, or handler functions that ONLY serve this page into the page component |
| 6 | Add `import { useParams } from 'react-router-dom'` for any detail page that needs an ID |
| 7 | Replace any `setActivePage('xxx')` calls with `navigate('xxx')` or `navigate(-1)` for back buttons |
| 8 | Replace any `setSelectedClaimId(id); setActivePage('claim-detail')` patterns with `navigate(\`claims/${id}\`)` |
| 9 | Keep ALL mock data, hardcoded values, and existing API calls AS-IS |

### SOURCE PRIORITY TABLE:

When multiple portals have the same page, use the BEST (most complete) version:

| Shared Page | Copy From (best version) | Why |
|---|---|---|
| Dashboard.tsx | OperatorPortal.tsx (673-706) | Most complete KPI view |
| Claims.tsx | OperatorPortal.tsx (752-763) | Has all-dealer columns |
| ClaimDetail.tsx | OperatorPortal.tsx (764-788) | Most complete with FRC lines |
| Units.tsx | OperatorPortal.tsx (915-926) | Has all-dealer columns |
| UnitDetail.tsx | OperatorPortal.tsx (943-967) | Most complete with 5 tabs |
| UnitNew.tsx | DealerPortal.tsx (580-593) | Only dealer creates units |
| Financing.tsx | OperatorPortal.tsx (1025-1041) | Most complete list |
| FinancingDetail.tsx | OperatorPortal.tsx (1042-1070) | Most complete detail |
| FinancingNew.tsx | OperatorPortal.tsx (1071-1084) | Most complete form |
| FAndI.tsx | OperatorPortal.tsx (1085-1101) | Most complete list |
| FAndIDetail.tsx | OperatorPortal.tsx (1102-1129) | Most complete detail |
| FAndINew.tsx | OperatorPortal.tsx (1130-1134) | Most complete form |
| WarrantyPlans.tsx | OperatorPortal.tsx (1135-1153) | Most complete list |
| WarrantyPlansNew.tsx | OperatorPortal.tsx (1154-1172) | Most complete form |
| WarrantyDetail.tsx | DealerPortal.tsx (1494-1509) | Only dealer version exists |
| Parts.tsx | OperatorPortal.tsx (1173-1189) | Most complete list |
| PartsDetail.tsx | OperatorPortal.tsx (1190-1215) | Most complete detail |
| PartsNew.tsx | OperatorPortal.tsx (1216-1222) | Most complete form |
| Invoices.tsx | OperatorPortal.tsx (1240-1273) | Most complete list |
| Customers.tsx | DealerPortal.tsx (749-760) | Only dealer has customer list |
| CustomerDetail.tsx | DealerPortal.tsx (1140-1154) | Only dealer version |
| InviteCustomer.tsx | DealerPortal.tsx (761-773) | Only dealer version |
| CustomerTickets.tsx | DealerPortal.tsx (774-808) | Most complete ticket list |
| TicketDetail.tsx | DealerPortal.tsx (809-840) | Most complete with reply |
| Documents.tsx | DealerPortal.tsx (1180-1194) | More complete than customer version |
| Warranty.tsx | CustomerPortal.tsx (285-306) | Only customer version exists |
| Support.tsx | NEW placeholder | No old equivalent |
| WorkOrders.tsx | DealerPortal.tsx (1195-1215) | TechFlow work orders |
| WorkOrderDetail.tsx | DealerPortal.tsx (1452-1473) | Work order detail |
| WorkOrderNew.tsx | DealerPortal.tsx (1440-1451) | New work order form |
| Auctions.tsx | DealerMarketplace.tsx (124-185) | Browse listings view |
| AuctionDetail.tsx | DealerMarketplace.tsx (186-280) | Listing detail |
| Messages.tsx | DealerPortal.tsx (1155-1179) | Messaging thread |
| Notifications.tsx | OperatorPortal.tsx (1389-1410) | Notification center |
| Settings.tsx | OperatorPortal.tsx (1494-1625) | Most complete settings |
| Changelog.tsx | OperatorPortal.tsx (1626-1777) | Most complete changelog |
| ServiceAppointments.tsx | CustomerPortal.tsx (664-690) | Service booking |
| ClaimNew.tsx | NEW placeholder | No old equivalent |

For exclusive pages, copy from the source listed in each file's comment header.

### EXECUTION ORDER:

Work in this order to minimize context switching between source files:

| Batch | Source File | Pages to Extract |
|---|---|---|
| 1 | OperatorPortal.tsx | All 52 pages (shared + exclusive) sourced from this file |
| 2 | OperatorMarketplace.tsx | 6 exclusive operator-admin pages |
| 3 | PublicAuctionPages.tsx | 4 pages (2 operator, 2 consignor) |
| 4 | DealerPortal.tsx | All remaining pages sourced from this file |
| 5 | DealerMarketplace.tsx | 8 pages (shared + exclusive) |
| 6 | CustomerPortal.tsx | All remaining pages sourced from this file |
| 7 | BidderPortal.tsx | All remaining pages sourced from this file |

After each batch, run `npm run build` to catch errors before moving to the next.

### HANDLING SHARED STATE:

Some pages rely on state that was defined at the portal level (fetched claims array, dealers array, user data, etc.). For now:

1. If a page needs data that was fetched at the portal level, add the fetch directly in the page component (duplicate the useEffect/apiFetch call into the page)
2. Do NOT create context providers yet — that's for Session 3 when routes are wired
3. If a page references `selectedClaimId` or similar selection state, replace with `useParams()` to read from the URL
4. If a page calls `setActivePage('back-page')`, replace with `navigate(-1)` or `navigate('../')`

## CRITICAL RULES
- Do NOT modify old portal files — they stay untouched
- Do NOT change any CSS, styling, class names, or visual appearance
- Do NOT remove mock data or hardcoded values
- Do NOT create new API endpoints
- Do NOT refactor or restructure any JSX — move it AS-IS
- Every page must render the same visual output as it does in the current monolithic portal
- Run `npm run build` after each batch of extractions
- If a page's JSX references a component or hook defined elsewhere in the portal file, copy that component/hook into the page file (duplication is fine for now)
- If extraction breaks a build, fix the immediate error (missing import, undefined variable) but do NOT refactor
- STOP after all pages are populated and all batches build clean

## OUTPUT — When complete, print:

1. Build status (pass/fail)
2. Count of pages populated vs still placeholder
3. Any pages that could NOT be extracted (with reason)
4. Any shared state that was duplicated into multiple pages (for future context provider cleanup)
5. Any `setActivePage` calls that were replaced with `navigate`