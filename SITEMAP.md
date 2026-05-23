# Dealer Suite 360 — Full Site Map
> Generated 2026-04-29 | Platform: RVClaims.ca / dealersuite360.com

---

## PUBLIC MARKETING PAGES

| URL | Page |
|-----|------|
| `/` | Home |
| `/about` | About |
| `/services` | Services |
| `/claims-processing` | Claims Processing |
| `/technology` | Technology |
| `/revenue-services` | Revenue Services |
| `/rv-types` | RV Types & Coverage |
| `/rv-coverage` | → redirects to `/rv-types` |
| `/financing` | Financing Services |
| `/fi-services` | F&I Services |
| `/warranty-plans` | Warranty & Extended Service Plans |
| `/warranty-extended-service` | → redirects to `/warranty-plans` |
| `/network-marketplace` | Network Marketplace |
| `/live-auctions` | Live Auctions |
| `/marketplace` | Marketplace |
| `/on-site-repairs` | On-Site Repairs |
| `/roadside-assistance` | Roadside Assistance |
| `/revenue-optimization` | Revenue Optimization |
| `/parts-components` | Parts & Components |
| `/marketing-services` | Marketing Services |
| `/consignment-services` | Consignment Services |
| `/extended-warranty` | Extended Warranty |
| `/protection-plans` | Protection Plans |
| `/pricing` | Pricing |
| `/book-demo` | Book a Demo |
| `/contact` | Contact |
| `/expert-consultation` | Expert Consultation |
| `/dealer-integration` | Dealer Integration |

---

## DEALER DIRECTORY

| URL | Page |
|-----|------|
| `/dealers` | Dealer Directory |
| `/dealers/listing/:slug` | Dealer Listing Profile |
| `/dealers/claim/:slug` | Claim a Dealer Listing |
| `/dealer-dashboard` | Dealer Dashboard (legacy) |

---

## RESOURCES & CONTENT

| URL | Page |
|-----|------|
| `/blog` | Blog Index |
| `/blog/:slug` | Blog Post |
| `/news` | News (EN) |
| `/news/:id` | News Article (EN) |
| `/actualites` | News (FR) |
| `/actualites/:id` | News Article (FR) |
| `/claim-guides` | Claim Guides |
| `/industry-reports` | Industry Reports |
| `/webinars` | Webinars |
| `/knowledge-base` | Knowledge Base |
| `/dealer-training` | Dealer Training |
| `/help-center` | Help Center |
| `/documentation` | Documentation |
| `/api-access` | API Access |
| `/system-status` | System Status |

---

## LEGAL & COMPLIANCE

| URL | Page |
|-----|------|
| `/privacy-policy` | Privacy Policy |
| `/terms-of-service` | Terms of Service |
| `/cookie-policy` | Cookie Policy |
| `/pipeda-compliance` | PIPEDA Compliance |

---

## COMPANY

| URL | Page |
|-----|------|
| `/careers` | Careers |
| `/partnerships` | Partnerships |
| `/testimonials` | Testimonials |

---

## AUTH

| URL | Notes |
|-----|-------|
| `/login` | Unified login (Clerk) — Google OAuth, LinkedIn OAuth, Email/Password |
| `/login/:rest*` | Clerk factor/verify sub-steps |
| `/login/sso-callback` | Clerk OAuth callback |
| `/signup` | Clerk signup flow |
| `/signup/:rest*` | Clerk signup sub-steps |
| `/signup/sso-callback` | Clerk OAuth callback |
| `/sign-up` | Dealer sign-up request form |
| `/reset-password` | → redirects to `/login` |
| `/client-login` | → redirects to `/login` |
| `/portal-router` | Post-login role-based redirect |
| `/portal-select-v6` | Portal selector (V6) |
| `/dev-access` | Dev role switcher (development only) |

---

## OPERATOR PORTAL — `/operator-v6/`

Entry: `/operator-v6` | Roles: `operator_admin`, `operator_staff`

### Standalone V6 Pages (PortalShell)
| URL | Page |
|-----|------|
| `/operator-v6/dealerships` | Dealer Accounts List |
| `/operator-v6/dealerships/new` | New Dealership |
| `/operator-v6/dealerships/:id` | Dealership Detail (9 tabs) |
| `/operator-v6/units/:id` | Unit Profile |

### In-Portal Pages (page state, URL stays at `/operator-v6`)
| Page ID | Menu Item | Roles |
|---------|-----------|-------|
| `master.ops.dashboard` | Dashboard | all |
| `master.ops.processing_queue` | Processing Queue | all |
| `master.ops.batch_review` | Batch Review | all |
| `master.ops.all_claims` | All Claims | all |
| `master.ops.claim_detail` | Claim Detail | all |
| `master.ops.stale_claims` | Stale Claims | all |
| `master.mgmt.dealer_accounts` | Dealer Accounts | all |
| `master.mgmt.add_dealer` | Add Dealer | all |
| `master.mgmt.unit_inventory` | Unit Inventory | all |
| `master.mgmt.add_unit` | Add Unit | all |
| `master.mgmt.frc_codes` | FRC Codes | all |
| `master.mgmt.revenue_billing` | Revenue & Billing | `operator_admin` only |
| `master.mgmt.campaign_templates` | Campaign Templates | `operator_admin` only |
| `master.mgmt.communications` | Communications | `operator_admin` only |
| `master.mgmt.blog` | Blog | `operator_admin` only |
| `master.mgmt.staff_permissions` | Staff & Permissions | `operator_admin` only |
| `master.mgmt.platform_settings` | Platform Settings | `operator_admin` only |
| `master.marketplace.service_marketplace` | Service Marketplace | all |
| `master.marketplace.financing` | Financing | all |
| `master.marketplace.fi_services` | F&I Services | all |
| `master.marketplace.warranty_plans` | Warranty Plans | all |
| `master.marketplace.parts_accessories` | Parts & Accessories | all |
| `master.marketplace.transactions` | Transactions | `operator_admin` only |
| `master.marketplace.escrow_admin` | Escrow Admin | `operator_admin` only |
| `master.marketplace.members` | Members | `operator_admin` only |
| `master.reports.revenue` | Revenue Reports | all |
| `master.notifications` | Notifications | all |
| `master.users_roles` | Users & Roles | all |
| `master.settings` | Settings (7 sub-pages) | all |
| `master.changelog` | Changelog (4 tabs) | all |

---

## DEALER PORTAL — `/dealer-v6/`

Entry: `/dealer-v6` | Roles: `dealer_owner`, `dealer_staff`, `service_manager`, `shop_manager`, `parts_dept`, `technician`, `public_bidder`, `consignor`

### Standalone V6 Pages (PortalShell)
| URL | Page |
|-----|------|
| `/dealer-v6/units` | Units / Inventory List |
| `/dealer-v6/units/new` | New Unit |
| `/dealer-v6/units/:id` | Unit Profile (4 tabs) |
| `/dealer-v6/units/:unitId/claims/new` | New Claim |

### In-Portal Pages — dealer_owner / dealer_staff
| Page ID | Menu Item | Restricted to |
|---------|-----------|---------------|
| `dealer.ops.dashboard` | Dashboard | all dealer roles |
| `dealer.ops.claims` | Claims | all dealer roles |
| `dealer.ops.inventory` | Units / Inventory | all dealer roles |
| `dealer.ops.clients` | Clients | all dealer roles |
| `dealer.ops.sales_services` | Sales & Services | all dealer roles |
| `dealer.ops.documents` | Documents | all dealer roles |
| `dealer.ops.messages` | Messages | all dealer roles |
| `dealer.ops.financing` | Financing | all dealer roles |
| `dealer.ops.parts_store` | Parts Store | all dealer roles |
| `dealer.ops.consignment` | Consignment | all dealer roles |
| `dealer.ops.techflow` | TechFlow | all dealer roles |
| `dealer.ops.marketing` | Marketing | all dealer roles |
| `dealer.account.my_subscription` | My Subscription | `dealer_owner` only |
| `dealer.account.portal_settings` | Portal Settings | `dealer_owner` only |
| `dealer.marketplace.browse` | Browse Listings | all dealer roles |
| `dealer.marketplace.my_bids` | My Bids | all dealer roles |
| `dealer.marketplace.my_listings` | My Listings (Sell) | all dealer roles |
| `dealer.marketplace.public_showcase` | Public Showcase | all dealer roles |
| `dealer.marketplace.escrow_payments` | Escrow & Payments | `dealer_owner` only |

### In-Portal Pages — service_manager
| Page ID | Menu Item |
|---------|-----------|
| `service.ops.dashboard` | Dashboard |
| `service.ops.work_orders` | Work Orders |
| `service.ops.scheduler` | Dispatch Scheduler |
| `service.ops.technicians` | Technicians |
| `service.ops.parts` | Parts |
| `service.ops.units` | Unit Lookup |
| `service.ops.messages` | Messages |
| `service.account.settings` | Settings |

### In-Portal Pages — shop_manager
| Page ID | Menu Item |
|---------|-----------|
| `shop.ops.dashboard` | Dashboard |
| `shop.ops.work_orders` | Work Orders |
| `shop.ops.scheduler` | Dispatch Scheduler |
| `shop.ops.parts` | Parts |
| `shop.account.settings` | Settings |

### In-Portal Pages — parts_dept
| Page ID | Menu Item |
|---------|-----------|
| `parts.ops.dashboard` | Dashboard |
| `parts.account.settings` | Settings |

### In-Portal Pages — technician
| Page ID | Menu Item |
|---------|-----------|
| `dealer.ops.dashboard` | Dashboard |
| `dealer.ops.claims` | Claims |
| `dealer.ops.techflow` | TechFlow |

### In-Portal Pages — consignor
| Page ID | Menu Item |
|---------|-----------|
| `dealer.ops.dashboard` | Dashboard |
| `dealer.consignor_guest.my_units` | My Consigned Unit(s) |
| `dealer.consignor_guest.offers_bids` | Offers & Bids on My Unit |
| `dealer.consignor_guest.payouts` | My Payouts |

### In-Portal Pages — public_bidder
| Page ID | Menu Item |
|---------|-----------|
| `dealer.ops.dashboard` | Dashboard |
| `dealer.marketplace.browse` | Browse Listings |
| `dealer.marketplace.public_showcase` | Public Showcase |
| `dealer.public_bidder_guest.my_bids` | My Bids (Public Bidder) |
| `dealer.public_bidder_guest.verification` | Verification & Payment |

---

## CLIENT / CUSTOMER PORTAL — `/client-v6/`

Entry: `/client-v6` | Role: `client`

### Standalone V6 Pages (PortalShell)
| URL | Page |
|-----|------|
| `/client-v6/units/:id` | Unit Profile |

### In-Portal Pages
| Page ID | Menu Item |
|---------|-----------|
| `client.main.dashboard` | Dashboard |
| `client.main.vehicle` | My Vehicle |
| `client.main.warranty` | Warranty & Coverage |
| `client.main.documents` | Documents |
| `client.main.claim_status` | Claim Status |
| `client.main.report_issue` | Report an Issue |
| `client.main.parts_orders` | Parts Orders |
| `client.main.protection_plans` | Protection Plans |
| `client.main.roadside` | Roadside Assist |
| `client.main.support` | Support Tickets |
| `client.main.quick_chat` | Quick Chat |
| `client.account.settings` | Settings |

---

## BIDDER PORTAL — `/bidder-v6/`

Entry: `/bidder-v6` | Role: `independent_bidder`

### In-Portal Pages
| Page ID | Menu Item |
|---------|-----------|
| `bidder.main.dashboard` | Dashboard |
| `bidder.main.live_auctions` | Live Monthly Auctions |
| `bidder.main.browse` | Browse Units |
| `bidder.main.my_bids` | My Bids |
| `bidder.main.escrow` | Escrow & Payments |
| `bidder.account.profile` | Profile |
| `bidder.account.verification` | Verification |
| `bidder.account.payment_methods` | Payment Methods |
| `bidder.account.settings` | Settings |

---

## LEGACY PORTAL PATHS (redirect to same portals)

| URL | Serves |
|-----|--------|
| `/operator/:rest*` | OperatorPortal |
| `/dealer/:rest*` | DealerPortal |
| `/client/:rest*` | CustomerPortal |
| `/bidder/:rest*` | BidderPortal |
| `/operator` | → redirects to `/login` |
| `/dealer` | → redirects to `/login` |
| `/client` | → redirects to `/login` |
| `/bidder` | → redirects to `/login` |
| `/bidder-login` | → redirects to `/login` |

---

## API ROUTES

### Health & Core
| Method | URL | Auth | Notes |
|--------|-----|------|-------|
| GET | `/api/health` | none | Server + DB health check |
| POST | `/api/contact` | none | Contact form |
| GET | `/api/contacts` | none | Contact list |
| POST | `/api/network-waitlist` | none | Network waitlist signup |
| GET | `/api/network-waitlist` | none | Waitlist list |
| POST | `/api/bookings` | none | Demo booking |
| GET | `/api/bookings` | none | Bookings list |
| POST | `/api/chat` | none | AI chatbot |

### Webhooks
| Method | URL | Auth | Notes |
|--------|-----|------|-------|
| POST | `/api/webhooks/clerk` | Svix signature | Clerk user sync |
| POST | `/api/payments/webhook` | Stripe signature | Stripe events |
| POST | `/api/membership/webhooks/stripe` | Stripe signature | Membership Stripe events |

### Users
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/users/me` | required |
| PUT | `/api/users/me` | required |
| GET | `/api/v6/users/me` | required |
| POST | `/api/v6/users/sync` | required |

### Dealerships
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/dealerships` | operator |
| POST | `/api/dealerships` | `operator_admin` |
| GET | `/api/dealerships/:id` | required |
| PUT | `/api/dealerships/:id` | required |
| PUT | `/api/dealerships/:id/branding` | required |
| GET | `/api/dealerships/:id/stats` | required |
| GET | `/api/v6/dealerships` | required |
| POST | `/api/v6/dealerships` | required |
| GET | `/api/v6/dealerships/:id` | required |
| PATCH | `/api/v6/dealerships/:id` | required |
| POST | `/api/v6/dealerships/:id/approve` | required |
| POST | `/api/v6/dealerships/:id/reject` | required |
| POST | `/api/v6/dealerships/:id/modules/:moduleKey` | required |
| DELETE | `/api/v6/dealerships/:id/modules/:moduleKey` | required |
| GET | `/api/v6/dealerships/catalog/modules` | none |
| GET | `/api/v6/dealerships/pending-count` | none |
| GET | `/api/v6/dealerships/branding/me` | none |
| PATCH | `/api/v6/dealerships/branding/me` | none |

### Units
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/units` | required |
| POST | `/api/units` | required |
| GET | `/api/units/:id` | required |
| PUT | `/api/units/:id` | required |
| GET | `/api/v6/units` | required |
| POST | `/api/v6/units` | required |
| GET | `/api/v6/units/:id` | required |
| PATCH | `/api/v6/units/:id` | required |

### Claims
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/claims` | required |
| POST | `/api/claims` | required |
| GET | `/api/claims/:id` | required |
| PUT | `/api/claims/:id` | required |
| POST | `/api/claims/:id/frc-lines` | required |
| PUT | `/api/claims/:id/frc-lines/:lineId` | required |
| GET | `/api/v6/claims` | required |
| POST | `/api/v6/claims` | required |
| GET | `/api/v6/claims/:id` | required |
| POST | `/api/v6/claims/:id/submit` | required |
| DELETE | `/api/v6/claims/:id` | required |
| POST | `/api/v6/claims/:id/assign` | required |
| POST | `/api/v6/claims/:id/request-info` | required |
| POST | `/api/v6/claims/:id/approve` | required |
| POST | `/api/v6/claims/:id/deny` | required |
| POST | `/api/v6/claims/:id/transition` | required |

### Payments & Billing
| Method | URL | Auth |
|--------|-----|------|
| POST | `/api/payments/subscribe` | `dealer_owner` |
| POST | `/api/payments/cancel-subscription` | `dealer_owner` |
| GET | `/api/payments/subscription-status` | required |
| POST | `/api/payments/pay-invoice` | `dealer_owner` |
| POST | `/api/payments/setup-intent` | `dealer_owner` |
| GET | `/api/payments/methods` | `dealer_owner` |
| DELETE | `/api/payments/methods/:id` | `dealer_owner` |
| GET | `/api/invoices` | required |
| POST | `/api/invoices` | `operator_admin` |
| GET | `/api/invoices/:id` | required |
| PUT | `/api/invoices/:id` | required |
| POST | `/api/invoices/:id/send` | `operator_admin` |

### Services (Financing / F&I / Warranty / Parts)
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/financing` | required |
| POST | `/api/financing` | required |
| GET | `/api/financing/:id` | required |
| PUT | `/api/financing/:id` | required |
| GET | `/api/fi-deals` | required |
| POST | `/api/fi-deals` | required |
| GET | `/api/fi-deals/:id` | required |
| PUT | `/api/fi-deals/:id` | required |
| GET | `/api/warranty-plans` | required |
| POST | `/api/warranty-plans` | required |
| GET | `/api/parts-orders` | required |
| POST | `/api/parts-orders` | required |
| GET | `/api/v6/parts-orders` | required |
| POST | `/api/v6/parts-orders` | required |
| GET | `/api/v6/parts-orders/:id` | required |
| POST | `/api/v6/parts-orders/:id/transition` | required |

### Notifications
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/notifications` | required |
| PUT | `/api/notifications/:id/read` | required |
| POST | `/api/notifications/broadcast` | operator |
| GET | `/api/v6/notifications` | required |
| GET | `/api/v6/notifications/unread-count` | required |
| POST | `/api/v6/notifications/mark-all-read` | required |
| POST | `/api/v6/notifications/:id/read` | required |

### Platform & Settings
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/settings` | operator |
| PUT | `/api/settings/:key` | `operator_admin` |
| GET | `/api/feature-requests` | required |
| POST | `/api/feature-requests` | required |
| PUT | `/api/feature-requests/:id` | operator |

### AI
| Method | URL | Auth |
|--------|-----|------|
| POST | `/api/ai/scan-document` | required |
| POST | `/api/ai/scan-unit-tag` | required |
| POST | `/api/ai/suggest-frc` | required |
| POST | `/api/ai/suggest-frc-photo` | required |
| POST | `/api/ai/fi-session` | required |
| GET | `/api/ai/fi-session/:id` | none |
| POST | `/api/ai/fi-session/:id/chat` | none |
| POST | `/api/ai/fi-session/:id/accept` | none |
| POST | `/api/ai/fi-session/:id/complete` | none |
| GET | `/api/ai/fi-sessions` | required |

### Marketplace
| Method | URL | Auth |
|--------|-----|------|
| POST | `/api/marketplace/signup` | none |
| POST | `/api/marketplace/membership/pay` | required |
| GET | `/api/marketplace/members` | operator |
| PATCH | `/api/marketplace/members/:id/verify` | operator |
| GET | `/api/marketplace/members/:id` | required |
| POST | `/api/marketplace/listings` | required |
| PATCH | `/api/marketplace/listings/:id` | required |
| PATCH | `/api/marketplace/listings/:id/publish` | required |
| GET | `/api/marketplace/listings` | required |
| GET | `/api/marketplace/listings/:id` | required |
| GET | `/api/marketplace/my-listings` | required |
| DELETE | `/api/marketplace/listings/:id` | required |
| POST | `/api/marketplace/listings/:id/photos` | required |
| POST | `/api/marketplace/watchlist` | required |
| DELETE | `/api/marketplace/watchlist/:listingId` | required |
| GET | `/api/marketplace/watchlist` | required |
| POST | `/api/marketplace/inquiries` | required |
| GET | `/api/marketplace/inquiries` | required |
| PATCH | `/api/marketplace/inquiries/:id` | operator |
| POST | `/api/marketplace/holds` | required |
| POST | `/api/marketplace/holds/:id/release` | operator |
| POST | `/api/marketplace/holds/:id/capture` | operator |
| POST | `/api/marketplace/transactions` | operator |
| PATCH | `/api/marketplace/transactions/:id` | operator |
| POST | `/api/marketplace/transactions/:id/commission` | operator |
| GET | `/api/marketplace/transactions` | required |

### Auctions (Private/Dealer)
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/auctions` | none |
| POST | `/api/auctions` | none |
| GET | `/api/auctions/:id` | none |
| POST | `/api/auctions/:id/bid` | none |
| POST | `/api/auctions/:id/start` | none |
| POST | `/api/auctions/:id/end` | none |
| POST | `/api/auctions/:id/cancel` | none |
| POST | `/api/auctions/:id/watch` | none |
| DELETE | `/api/auctions/:id/watch` | none |
| GET | `/api/auctions/:id/bids` | none |
| GET | `/api/auctions/my-bids` | none |

### Public Auctions (Bidder-facing)
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/public-auctions/events` | optional |
| POST | `/api/public-auctions/events` | operator |
| PATCH | `/api/public-auctions/events/:id/status` | operator |
| POST | `/api/public-auctions/events/:id/notify` | operator |
| GET | `/api/public-auctions/showcase/status` | optional |
| POST | `/api/public-auctions/showcase/subscribe` | optional |
| GET | `/api/public-auctions/events/:eventId/units` | none |
| POST | `/api/public-auctions/events/:eventId/units` | optional |
| PATCH | `/api/public-auctions/units/:id/approve` | operator |
| PATCH | `/api/public-auctions/units/:id/reject` | operator |
| POST | `/api/public-auctions/register` | none |
| POST | `/api/public-auctions/add-card` | none |
| GET | `/api/public-auctions/live` | none |
| GET | `/api/public-auctions/upcoming` | none |
| POST | `/api/public-auctions/bid` | none |
| POST | `/api/public-auctions/watch` | none |
| POST | `/api/public-auctions/events/:id/settle` | operator |

### Membership
| Method | URL | Auth |
|--------|-----|------|
| POST | `/api/membership/signup` | none |
| GET | `/api/membership/members` | none |
| GET | `/api/membership/members/:id` | none |
| PUT | `/api/membership/members/:id/verify` | none |
| PUT | `/api/membership/members/:id/suspend` | none |
| POST | `/api/membership/members/:id/subscribe` | none |
| GET | `/api/membership/stats` | none |

### Blog
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/blog` | none |
| GET | `/api/blog/:slug` | none |
| GET | `/api/blog/admin/drafts` | `operator_admin`, `operator_staff` |
| GET | `/api/blog/admin/queue` | `operator_admin`, `operator_staff` |
| POST | `/api/blog/admin/queue` | `operator_admin`, `operator_staff` |
| POST | `/api/blog/admin/generate-now/:id` | `operator_admin`, `operator_staff` |
| PUT | `/api/blog/admin/:id` | `operator_admin`, `operator_staff` |
| POST | `/api/blog/admin/:id/approve` | `operator_admin` |
| POST | `/api/blog/admin/:id/archive` | `operator_admin` |

### Dealer Directory (Public)
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/dealers` | none |
| GET | `/api/dealers/provinces` | none |
| GET | `/api/dealers/brands` | none |
| GET | `/api/dealers/:slug` | none |
| POST | `/api/dealers/:slug/review` | none |
| POST | `/api/dealers/:slug/message` | none |
| POST | `/api/dealers/:slug/quote` | none |
| POST | `/api/dealers/:slug/claim` | none |
| POST | `/api/dealers/:slug/click` | none |

### CRM (Operator)
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/crm/dashboard` | operator |
| GET | `/api/crm/dealers` | operator |
| POST | `/api/crm/dealers` | operator |
| GET | `/api/crm/dealers/:id` | operator |
| PUT | `/api/crm/dealers/:id` | operator |
| DELETE | `/api/crm/dealers/:id` | `operator_admin` |
| GET | `/api/crm/pipeline` | operator |
| PUT | `/api/crm/pipeline/:id/stage` | operator |
| PUT | `/api/crm/pipeline/:id/followup` | operator |
| PUT | `/api/crm/pipeline/:id/assign` | operator |
| GET | `/api/crm/activities/:dealerId` | operator |
| POST | `/api/crm/activities` | operator |
| GET | `/api/crm/tags` | operator |
| POST | `/api/crm/tags` | operator |
| DELETE | `/api/crm/tags/:id` | `operator_admin` |
| POST | `/api/crm/dealers/:id/tags` | operator |
| DELETE | `/api/crm/dealers/:id/tags/:tagId` | operator |
| POST | `/api/crm/reviews/:id/moderate` | `operator_admin` |
| GET | `/api/crm/follow-ups` | operator |
| POST | `/api/crm/export` | operator |
| POST | `/api/crm/import` | `operator_admin` |
| PUT | `/api/crm/bulk/stage` | operator |

### Uploads
| Method | URL | Auth |
|--------|-----|------|
| POST | `/api/v6/uploads` | required |
| POST | `/api/v6/uploads/profile-photo` | required |

### Quick Chat
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/quick-chat/:dealershipId/:customerId` | required |
| POST | `/api/quick-chat` | required |
| GET | `/api/quick-chat/conversations` | required |

### Batches
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/batches` | required |
| POST | `/api/batches` | required |
| GET | `/api/batches/:id` | required |
| PUT | `/api/batches/:id/process` | operator |

### Documents
| Method | URL | Auth |
|--------|-----|------|
| POST | `/api/documents` | required |
| GET | `/api/documents/:id/download` | required |
| DELETE | `/api/documents/:id` | required |

### Products
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/products` | required |
| POST | `/api/products` | `operator_admin` |
| PUT | `/api/products/:id` | `operator_admin` |
| DELETE | `/api/products/:id` | `operator_admin` |

### Tickets
| Method | URL | Auth |
|--------|-----|------|
| GET | `/api/tickets` | required |
| POST | `/api/tickets` | required |
| GET | `/api/tickets/:id` | required |
| PUT | `/api/tickets/:id` | required |

---

## TOTALS

| Category | Count |
|----------|-------|
| Public marketing pages | 28 |
| Dealer directory pages | 4 |
| Resource / content pages | 12 |
| Legal pages | 4 |
| Company pages | 3 |
| Auth pages | 10 |
| Operator portal pages | 30 |
| Dealer portal pages | 36 |
| Client portal pages | 12 |
| Bidder portal pages | 9 |
| API endpoints | ~175 |
| **Total frontend routes** | **148** |
