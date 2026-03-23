# DATA ACCESS AUDIT REPORT — DealerSuite360
**Date:** 2026-03-23
**Scope:** All backend API routes, RBAC middleware, and cross-portal data flow
**Method:** Static code analysis — read-only, no application code modified

---

## PHASE 1: BACKEND ROUTE INVENTORY

### Auth Routes (`/api/auth`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| POST | /api/auth/login | No | Any | No | accessToken, user object, redirectTo | — |
| POST | /api/auth/register | No | Any (invitation token) | By invitation | accessToken, refreshToken, user object | MEDIUM: refreshToken returned in JSON body (should be httpOnly cookie only) |
| POST | /api/auth/refresh | No | Any | No | accessToken, user object | — |
| POST | /api/auth/forgot-password | No | Any | No | Generic success message | — |
| POST | /api/auth/reset-password | No | Any (reset token) | No | Success message | — |
| POST | /api/auth/logout | requireAuth | Any authenticated | No | Success message | — |
| GET | /api/auth/me | requireAuth | Any authenticated | No | Own user profile | — |

### Claims Routes (`/api/claims`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| GET | /api/claims | requireAuth + scopeToDealership | All roles | Yes — dealers locked to own dealershipId | All claims within scope | — |
| POST | /api/claims | requireAuth + scopeToDealership | All roles | Yes | New claim | — |
| GET | /api/claims/:id | requireAuth | All roles | Via canAccessDealership() | Claim + FRC lines + photo batches | — |
| PUT | /api/claims/:id | requireAuth | All roles | Via canAccessDealership() | Updated claim | HIGH: No role restriction — clients/bidders could call this |
| POST | /api/claims/:id/frc-lines | requireAuth | All roles | Via canAccessDealership() | New FRC line | HIGH: No role restriction — clients could add FRC lines |
| PUT | /api/claims/:id/frc-lines/:lineId | requireAuth | All roles | Via canAccessDealership() | Updated FRC line | HIGH: No role restriction |

### Units Routes (`/api/units`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| GET | /api/units | requireAuth + scopeToDealership | All roles | Yes — dealers locked | All units within scope | — |
| POST | /api/units | requireAuth + scopeToDealership | All roles | Yes | New unit | MEDIUM: Clients can create units |
| GET | /api/units/:id | requireAuth | All roles | Via canAccessDealership() | Unit record | — |
| PUT | /api/units/:id | requireAuth | All roles | Via canAccessDealership() | Updated unit | HIGH: No role restriction — clients/bidders can edit units |
| GET | /api/units/:id/claims | requireAuth | All roles | Via canAccessDealership() | All claims for unit | — |
| GET | /api/units/:id/photos | requireAuth | All roles | NONE — no dealership check | All photos for unit | CRITICAL: No tenant check — any authenticated user can read any unit's photos by ID |
| GET | /api/units/:id/documents | requireAuth | All roles | NONE — no dealership check | All documents for unit | CRITICAL: No tenant check — any authenticated user can read any unit's documents by ID |

### Dealerships Routes (`/api/dealerships`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| GET | /api/dealerships | requireAuth + requireOperator | operator_admin, operator_staff | No — all dealerships | Full dealership list including stripeCustomerId, walletBalance, subscriptionPlan | — |
| POST | /api/dealerships | requireAuth + requireRole("operator_admin") | operator_admin only | No | New dealership | — |
| GET | /api/dealerships/:id | requireAuth | Any authenticated | Via canAccessDealership() | Full dealership record incl. financial fields | MEDIUM: Returns Stripe customer ID, wallet balance, subscription plan to dealer owners — acceptable but sensitive |
| PUT | /api/dealerships/:id | requireAuth | Any authenticated | Via canAccessDealership() | Updated dealership | MEDIUM: Role check is inline (not middleware) — operator_admin gets full update, dealer gets filtered fields. Dealer staff have no check blocking them. |
| PUT | /api/dealerships/:id/branding | requireAuth | Any authenticated | Via canAccessDealership() | Updated dealership | MEDIUM: Dealer staff (not just owner) can update branding |
| GET | /api/dealerships/:id/stats | requireAuth | Any authenticated | Via canAccessDealership() | Unit/claim/staff counts | — |

### Users Routes (`/api/users`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| GET | /api/users | requireAuth + scopeToDealership | operator_admin, operator_staff, dealer_owner | Scoped for dealers; operators optionally | User list (no passwordHash) | — |
| GET | /api/users/:id | requireAuth | Self, operators, dealer_owner of same dealership | Via inline check | User profile (no passwordHash) | — |
| PUT | /api/users/:id | requireAuth | Self, operators | Via inline check | Updated user | HIGH: Dealer staff can update their own profile including password — acceptable. But dealer_owner cannot update their own staff's passwords via this route (blocked by isSelf check) |
| DELETE | /api/users/:id | requireAuth | operator roles, dealer_owner | None — no scope check | Deactivates user | HIGH: dealer_owner can deactivate ANY user ID, not just their own staff |
| POST | /api/users/invite | requireAuth | operator roles, dealer_owner | Dealer forced to own dealership | Invitation (no token in response) | MEDIUM: inviteSchema still references "customer" not "client" (stale enum value) |

### Invoices Routes (`/api/invoices`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| GET | /api/invoices | requireAuth + scopeToDealership | All roles | Yes — dealers scoped | Invoice list | MEDIUM: Client and bidder roles can call this. Clients are scoped to their dealership invoices — they'd see all dealer invoices, not just their own |
| POST | /api/invoices | requireAuth + requireRole("operator_admin") | operator_admin only | No | New invoice | — |
| GET | /api/invoices/:id | requireAuth | All roles | Via canAccessDealership() | Invoice + line items | MEDIUM: No role restriction beyond dealership scoping — clients can read invoices |
| PUT | /api/invoices/:id | requireAuth | operator roles only (inline check) | No | Updated invoice | — |
| POST | /api/invoices/:id/send | requireAuth + requireRole("operator_admin") | operator_admin only | No | Sent invoice | — |

### Batches Routes (`/api/batches`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| GET | /api/batches | requireAuth + scopeToDealership | All roles | Yes | Photo batches within scope | — |
| POST | /api/batches | requireAuth + scopeToDealership | All roles | Yes | New batch | MEDIUM: Clients can upload photo batches |
| GET | /api/batches/:id | requireAuth | All roles | Via canAccessDealership() | Batch + photos | — |
| PUT | /api/batches/:id/process | requireAuth + requireOperator | operator_admin, operator_staff | No | Processed batch | — |

### Tickets Routes (`/api/tickets`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| GET | /api/tickets | requireAuth + scopeToDealership | All roles | Yes; clients further scoped to own customerId | Ticket list | — |
| POST | /api/tickets | requireAuth + scopeToDealership | All roles | Yes | New ticket | — |
| GET | /api/tickets/:id | requireAuth | All roles | Via canAccessDealership() + client check | Ticket + messages (internal notes filtered for clients) | — |
| POST | /api/tickets/:id/messages | requireAuth | All roles | None — only checks ticket exists | New message | HIGH: No dealership/ownership check. Any authenticated user who knows a ticket ID can post a message to it |
| PUT | /api/tickets/:id/status | requireAuth | All roles | None | Updated ticket | HIGH: No role or ownership check — any authenticated user can change any ticket's status by ID |

### Platform Routes (`/api/settings`, `/api/notifications`, `/api/feature-requests`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| GET | /api/settings | requireAuth + requireOperator | operator_admin, operator_staff | No | All platform settings | — |
| PUT | /api/settings/:key | requireAuth + requireRole("operator_admin") | operator_admin only | No | Updated setting | — |
| GET | /api/feature-requests | requireAuth | All roles | No | All feature requests from all dealers | MEDIUM: All roles can read all feature requests — dealer A can see dealer B's requests |
| POST | /api/feature-requests | requireAuth | All roles | By submitting user | New feature request | — |
| PUT | /api/feature-requests/:id | requireAuth + requireOperator | operator roles | No | Updated feature request | — |
| GET | /api/notifications | requireAuth | All roles | Scoped to own userId | Own notifications only | — |
| PUT | /api/notifications/:id/read | requireAuth | All roles | Scoped to own userId + notif ID | Updated notification | — |
| POST | /api/notifications/broadcast | requireAuth + requireOperator | operator roles | No | Placeholder | — |

### Payments Routes (`/api/payments`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| POST | /api/payments/subscribe | requireAuth + requireRole("dealer_owner") | dealer_owner only | Via JWT dealershipId | Stripe subscription | — |
| POST | /api/payments/cancel-subscription | requireAuth + requireRole("dealer_owner") | dealer_owner only | Via JWT dealershipId | Cancellation status | — |
| GET | /api/payments/subscription-status | requireAuth | All roles | Via JWT dealershipId | Subscription status | MEDIUM: Bidders/clients with no dealershipId get null — acceptable |
| POST | /api/payments/pay-invoice | requireAuth | All roles | Via JWT dealershipId | Stripe payment intent | MEDIUM: Dealer staff can pay invoices — may or may not be intended |
| POST | /api/payments/setup-intent | requireAuth + requireRole("dealer_owner") | dealer_owner only | Via JWT dealershipId | Stripe setup intent | — |
| GET | /api/payments/methods | requireAuth | All roles | Via JWT dealershipId | Saved payment methods | MEDIUM: Dealer staff can list payment methods |
| DELETE | /api/payments/methods/:id | requireAuth + requireRole("dealer_owner") | dealer_owner only | None — no ownership verify | Deleted method | HIGH: No verification that the payment method ID belongs to this dealer's Stripe customer |
| POST | /api/payments/webhook | None | Public (Stripe-signed) | No | Webhook ack | — Correct: Stripe signature verified in handler |

### Marketplace Routes (`/api/marketplace`) — CRITICAL SECTION

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| POST | /api/marketplace/signup | None | Public | No | New member record | CRITICAL: No auth — anyone can sign up as a marketplace member |
| POST | /api/marketplace/membership/pay | None | Public | No | Stripe subscription result | CRITICAL: No auth — memberId taken from body, no ownership verification |
| GET | /api/marketplace/members | None | Public | No | ALL marketplace members | CRITICAL: No auth — full member list publicly readable including business details |
| PATCH | /api/marketplace/members/:id/verify | None | Public | No | Updated member status | CRITICAL: No auth — anyone can approve/reject/suspend marketplace members |
| GET | /api/marketplace/members/:id | None | Public | No | Member details | CRITICAL: No auth |
| POST | /api/marketplace/listings | None | Public | No | New listing | CRITICAL: No auth |
| PATCH | /api/marketplace/listings/:id | None | Public | No | Updated listing | CRITICAL: No auth — anyone can edit any listing |
| PATCH | /api/marketplace/listings/:id/publish | None | Public | No | Published listing | CRITICAL: No auth |
| GET | /api/marketplace/listings | None | Public | No (active only) | Anonymized listing list (sellerId excluded) | LOW: Intentionally public, sellerId stripped |
| GET | /api/marketplace/listings/:id | None | Public | No | Listing detail (sellerId stripped) | MEDIUM: No auth, but sellerId correctly stripped |
| GET | /api/marketplace/my-listings | None | Public | Via memberId query param | Seller's listings | CRITICAL: No auth — memberId supplied in query param, no ownership verification |
| DELETE | /api/marketplace/listings/:id | None | Public | No | Withdrawn listing | CRITICAL: No auth — anyone can withdraw any listing |
| POST | /api/marketplace/listings/:id/photos | None | Public | No | Added photos | CRITICAL: No auth |
| POST | /api/marketplace/watchlist | None | Public | Via memberId body | Watchlist entry | CRITICAL: No auth |
| DELETE | /api/marketplace/watchlist/:listingId | None | Public | Via memberId query | Deleted entry | CRITICAL: No auth |
| GET | /api/marketplace/watchlist | None | Public | Via memberId query | Watchlist items | CRITICAL: No auth |
| POST | /api/marketplace/inquiries | None | Public | No | New inquiry | CRITICAL: No auth |
| GET | /api/marketplace/inquiries | None | Public | Via query params | Inquiry list | CRITICAL: No auth |
| PATCH | /api/marketplace/inquiries/:id | None | Public | No | Updated inquiry | CRITICAL: No auth |
| POST | /api/marketplace/holds | None | Public | No | Stripe hold/charge | CRITICAL: No auth — Stripe charges can be triggered unauthenticated |
| POST | /api/marketplace/holds/:id/release | None | Public | No | Released hold | CRITICAL: No auth |
| POST | /api/marketplace/holds/:id/capture | None | Public | No | Captured hold | CRITICAL: No auth |
| POST | /api/marketplace/transactions | None | Public | No | New transaction | CRITICAL: No auth |
| PATCH | /api/marketplace/transactions/:id | None | Public | No | Updated transaction | CRITICAL: No auth |
| POST | /api/marketplace/transactions/:id/commission | None | Public | No | Stripe commission charge | CRITICAL: No auth — Stripe charges unauthenticated |
| GET | /api/marketplace/transactions | None | Public | Via query params | Transaction list | CRITICAL: No auth |

### Quick Chat Routes (`/api/quick-chat`)

| Method | Route | Auth? | Roles Allowed | Tenant Scoped? | Data Returned | RISK FLAG |
|--------|-------|-------|---------------|----------------|---------------|-----------|
| GET | /api/quick-chat/:dealershipId/:customerId | requireAuth | client (own), dealer roles (own dealership), operators | Yes | Message history | — |
| POST | /api/quick-chat/:dealershipId/:customerId | requireAuth | client (own), dealer roles, operators | Yes | New message | — |

---

## PHASE 2: FRONTEND FETCH AUDIT

The portal TSX files (OperatorPortal, DealerPortal, CustomerPortal, BidderPortal) currently contain **no API fetch calls**. All data displayed is hardcoded prototype data. The portals are in UI-complete prototype state — Phase 2 API integration has not begun.

**Finding:** The frontend makes zero real API calls today. All RBAC risk is entirely on the backend, not through frontend fetch patterns.

**Risk implication:** Any attacker with a valid JWT (or in the marketplace's case, no JWT at all) can directly call the API. UI-level restrictions mean nothing.

---

## PHASE 3: ROLE-BY-ROLE DATA ACCESS MATRIX

### OPERATOR ADMIN
| Category | Read | Write | Admin | Notes |
|----------|------|-------|-------|-------|
| Claims | ALL across all dealers | Yes | Yes | Full access |
| Units | ALL across all dealers | Yes | Yes | Full access |
| Dealer Info | ALL dealers | Create, edit all fields | Full | Includes financial/Stripe fields |
| Customer Info | ALL users | Edit role, active status | Full | Can deactivate any user |
| Financial | ALL invoices, all billing | Create invoices, send | Full | Only role that can create invoices |
| Marketplace | ALL — but marketplace routes have NO auth | All | All | Moot — marketplace unprotected |
| Platform | Full settings access | Yes | Yes | — |
| Users | Create any role via invitation | Full | Full | — |

### OPERATOR STAFF
| Category | Read | Write | Admin | Notes |
|----------|------|-------|-------|-------|
| Claims | ALL | Yes (no role block on PUT) | Process batches | Same write access as operator_admin on claims |
| Units | ALL | Yes | No | — |
| Dealer Info | ALL (requireOperator on GET /dealerships) | Edit all fields via PUT (same as admin) | No create | MEDIUM: Operator staff can update dealership fields including subscription plan |
| Customer Info | ALL users (via GET /users) | No (PUT restricted to self or operator_admin) | No | — |
| Financial | ALL invoices (read) | Cannot create/send invoices | No | Correctly restricted on POST/send |
| Marketplace | Same as public — no auth | — | — | — |
| Platform | Read settings (requireOperator) | Cannot change settings (requireRole admin) | No | — |
| Users | ALL users | Cannot change roles/status | No | — |

### DEALER OWNER
| Category | Read | Write | Admin | Notes |
|----------|------|-------|-------|-------|
| Claims | Own dealership only | Yes | No | Correctly scoped |
| Units | Own dealership only | Yes | No | Correctly scoped |
| Dealer Info | Own dealership | Own profile + branding | Billing fields | Returns sensitive fields (stripeCustomerId, walletBalance) |
| Customer Info | Own dealership's users | Invite staff/customers | Manage staff | Can deactivate any user by ID — no scope check |
| Financial | Own dealership invoices | Pay invoices | Subscribe/cancel plan | — |
| Marketplace | Open — no auth required | — | — | — |
| Platform | Read feature requests (all dealers') | Submit feature requests | No | Sees competitor requests |
| Users | Own dealership staff | Invite | Deactivate (broken — no scope) | HIGH: Can deactivate users outside own dealership |

### DEALER STAFF
| Category | Read | Write | Admin | Notes |
|----------|------|-------|-------|-------|
| Claims | Own dealership | Yes (no role block) | No | Should be read-only for staff in some orgs |
| Units | Own dealership | Yes (no role block) | No | — |
| Dealer Info | Own dealership | Update branding (no role block on branding endpoint) | No | MEDIUM: Should be owner-only |
| Customer Info | Blocked (403 on GET /users for non-owner dealer roles) | No | No | Correctly blocked |
| Financial | Own invoices (read) — scopeToDealership | Pay invoices, list payment methods | No | MEDIUM: Staff can pay invoices and list cards |
| Marketplace | Open — no auth | — | — | — |
| Platform | Read feature requests | Submit | No | Sees all dealers' requests |
| Users | Cannot list users | Cannot invite | No | Correctly blocked |

### CLIENT
| Category | Read | Write | Admin | Notes |
|----------|------|-------|-------|-------|
| Claims | All claims at own dealership (scoped) — NOT filtered to own VIN | Yes — can update claims (no role block on PUT) | No | CRITICAL: Client sees ALL of the dealer's claims, not just their own VIN's claims |
| Units | All units at own dealership | Yes — can create/edit units | No | CRITICAL: Client can read, create, and edit any unit at their dealership |
| Dealer Info | Own dealership record including Stripe/billing fields | No write | No | MEDIUM: Exposes stripeCustomerId, walletBalance to client |
| Customer Info | Own profile only | Own profile | No | Correctly scoped |
| Financial | Own dealership's invoices (all of them, not just theirs) | No create | No | HIGH: Client sees all dealer invoices, not just their own |
| Marketplace | Open — no auth | — | — | — |
| Platform | Read all feature requests | Submit | No | — |
| Users | Cannot list (scopeToDealership returns 403 for dealer_staff, but client is not dealer_staff — check needed) | No | No | — |
| Tickets | Own tickets only | Create tickets, reply | No | Correctly scoped — internal notes filtered |

### BIDDER
| Category | Read | Write | Admin | Notes |
|----------|------|-------|-------|-------|
| Claims | All claims at... wait — bidder has no dealershipId. scopeToDealership returns 403. | Blocked | No | scopeToDealership blocks bidder on claims (no dealershipId = 403) |
| Units | Blocked by scopeToDealership on list; can attempt GET by ID | Can attempt PUT by ID if they guess one | No | MEDIUM: GET by ID only checks canAccessDealership — bidder with no dealershipId fails this check |
| Dealer Info | Blocked (canAccessDealership returns false for bidder) | No | No | — |
| Customer Info | Blocked | No | No | — |
| Financial | No dealershipId — subscription-status returns null | Cannot pay invoices (no dealershipId) | No | — |
| Marketplace | Full public access — no auth on any marketplace endpoint | Full — no auth | — | Marketplace routes have no auth |
| Platform | Read feature requests | Submit | No | — |
| Users | Cannot list | No | No | — |

---

## PHASE 4: CRITICAL ISOLATION CHECKS

### 4A — Dealer-to-Dealer Isolation

**Result: PARTIALLY ENFORCED**

- `scopeToDealership` correctly locks dealer roles to their JWT `dealershipId`. A dealer cannot pass `?dealershipId=other_id` — the middleware ignores query params for dealer roles and uses the JWT value.
- `canAccessDealership()` on individual record fetches is correct.
- **GAP:** The `DELETE /api/users/:id` endpoint does not verify the target user belongs to the calling dealer_owner's dealership. A dealer_owner can deactivate users from any dealership by guessing UUIDs.
- **GAP:** Feature requests are not scoped — Dealer A can read Dealer B's feature requests.

### 4B — Customer Isolation

**Result: BROKEN**

- Clients are scoped to their dealership via `scopeToDealership`, but this means they see **all claims and units within that dealership**, not just their own.
- `GET /api/claims` returns all of Smith's RV Centre's claims to Robert Martin (client), exposing other customers' claim data.
- `GET /api/units` returns all units at the dealership to the client.
- `GET /api/invoices` returns all of the dealership's invoices to the client.
- The client can also `PUT /api/claims/:id` and `PUT /api/units/:id` with no role block.
- `GET /api/units/:id/photos` and `GET /api/units/:id/documents` have **no access check at all** — any authenticated user including clients can fetch photos/documents for any unit ID.

### 4C — Operator Invisibility to Customers

**Result: INTACT (UI layer)**

- The customer portal TSX shows dealer branding. No operator identifiers are in the UI.
- At the API level, `GET /api/dealerships/:id` returns the dealership record but not operator user records.
- The white-label separation is maintained in the data model.

### 4D — Marketplace Dealer Anonymity

**Result: CORRECTLY IMPLEMENTED (where it matters) but endpoint is public**

- `GET /api/marketplace/listings` explicitly excludes `sellerId` in the SELECT column list with comment "sellerId intentionally EXCLUDED".
- `GET /api/marketplace/listings/:id` destructures `{ sellerId, ...publicListing }` and returns only `publicListing`.
- **However:** `GET /api/marketplace/my-listings` takes `memberId` as a query parameter with no auth. If someone knows a memberId UUID, they get that seller's full listing history. This indirectly reveals seller identity.
- The `marketplaceTransactions` table includes both `sellerId` and `buyerId`. `GET /api/marketplace/transactions` is unauthenticated and returns full transaction records including seller and buyer IDs.

### 4E — Bidder Containment

**Result: PARTIALLY ENFORCED**

- Bidder JWTs have no `dealershipId`, so `scopeToDealership` blocks them from claims, units, and invoices.
- `canAccessDealership()` returns false for bidders, blocking individual record access.
- **GAP:** Bidders can still call `GET /api/feature-requests`, `POST /api/feature-requests`, and `GET /api/notifications`.
- **GAP:** The entire `/api/marketplace` namespace has no auth — bidders don't even need a JWT to use it.

### 4F — Staff Role Restrictions

**Result: INCONSISTENTLY ENFORCED**

- **Operator Staff / Billing:** `POST /api/invoices` and `POST /api/invoices/:id/send` correctly require `operator_admin`. `PUT /api/invoices/:id` correctly blocks non-operators. **CLEAN.**
- **Operator Staff / Settings:** `PUT /api/settings/:key` correctly requires `operator_admin`. `GET /api/settings` correctly requires operator. **CLEAN.**
- **Operator Staff / Dealership admin:** `PUT /api/dealerships/:id` — operator_admin gets all fields, but operator_staff can still call it (canAccessDealership returns true for all operators). Operator staff can update dealership subscription plan, fees, and status. **HIGH.**
- **Dealer Staff / Billing:** `POST /api/payments/pay-invoice` and `GET /api/payments/methods` have no dealer_owner restriction. Dealer staff can pay invoices and list saved cards. **MEDIUM.**
- **Dealer Staff / Staff management:** `DELETE /api/users/:id` allows dealer_owner OR any user where `isDealerOwner = true`. Dealer staff cannot invite (correctly blocked) but the deactivation endpoint has no scope check.

---

## PHASE 5: DATA FLOW DIAGRAM

```
[Operator Portal]
  → GET /api/claims          requireAuth → scopeToDealership(no scope for operators) → ALL claims
  → GET /api/dealerships     requireAuth → requireOperator → ALL dealerships
  → GET /api/settings        requireAuth → requireOperator → ALL platform settings
  → PUT /api/settings/:key   requireAuth → requireRole(operator_admin) → write setting
  → POST /api/invoices       requireAuth → requireRole(operator_admin) → create invoice
  → POST /api/invoices/:id/send → requireAuth → requireRole(operator_admin) → notify dealer

[Dealer Portal]
  → GET /api/claims          requireAuth → scopeToDealership(locked to JWT.dealershipId) → own claims only
  → GET /api/units           requireAuth → scopeToDealership(locked) → own units only
  → GET /api/invoices        requireAuth → scopeToDealership(locked) → own invoices only
  → POST /api/payments/subscribe → requireAuth → requireRole(dealer_owner) → Stripe subscription

[Client Portal]
  → GET /api/claims          requireAuth → scopeToDealership(locked to dealer) → ALL dealer claims [BUG]
  → GET /api/units           requireAuth → scopeToDealership(locked to dealer) → ALL dealer units [BUG]
  → GET /api/tickets         requireAuth → scopeToDealership + filter by customerId → own tickets [CLEAN]
  → GET /api/tickets/:id     requireAuth → canAccessDealership + customerId check → own ticket [CLEAN]

[Bidder Portal]
  → GET /api/marketplace/listings   NO AUTH → public listing browse
  → POST /api/marketplace/holds     NO AUTH → Stripe hold initiated unauthenticated [CRITICAL]
  → GET /api/marketplace/transactions → NO AUTH → full transaction records [CRITICAL]

[Marketplace Routes — ALL]
  → NO auth middleware on any endpoint
  → memberId/buyerId/sellerId all taken from request body or query params
  → No ownership verification on any mutation
```

**Middleware chain summary:**

```
Standard protected route:
  Request → cookieParser → express.json → requireAuth(JWT verify + DB user fetch) → [RBAC middleware] → handler

Marketplace routes (BROKEN):
  Request → cookieParser → express.json → handler (NO requireAuth)
```

---

## PHASE 6: VULNERABILITY REPORT

---

### CRITICAL

**C1 — Entire marketplace API is unauthenticated**
- Files: `server/routes/marketplace.ts` — all 26 endpoints
- Any person on the internet (no account needed) can: approve/reject marketplace members, withdraw listings, trigger Stripe charges (hold/capture/commission), read all transaction records with buyer and seller IDs, and manipulate any inquiry.
- Affected: All marketplace participants, Stripe account
- Fix: Add `requireAuth` middleware to all marketplace routes. Add operator-only guards on admin actions (verify, approve, reject). Add ownership verification on mutations.

**C2 — Stripe financial operations unauthenticated**
- Files: `server/routes/marketplace.ts` lines 476–588
- `POST /holds`, `POST /holds/:id/capture`, `POST /holds/:id/release`, `POST /transactions/:id/commission` all call real Stripe API with no authentication.
- Affected: Stripe account, all marketplace participants
- Fix: Require auth + verify caller is operator or the buyer who placed the hold.

**C3 — Client role sees all dealership claims and units**
- Files: `server/routes/claims.ts:17`, `server/routes/units.ts:14`
- `scopeToDealership` for client role locks to `req.user.dealershipId` but returns ALL claims/units for that dealership — not filtered to the client's own VINs.
- Affected: All clients — Robert Martin can see every claim Smith's RV Centre has ever submitted
- Fix: Add `eq(claims.customerId, req.user.id)` condition when `req.user.role === "client"` (same pattern used correctly in tickets).

**C4 — Client role can write to claims and units**
- Files: `server/routes/claims.ts:104`, `server/routes/units.ts:79`, `server/routes/claims.ts:149`
- `PUT /api/claims/:id`, `PUT /api/units/:id`, `POST /api/claims/:id/frc-lines` have no role restriction beyond `canAccessDealership`. A client within the dealership can modify claims, update unit records, and add FRC lines.
- Affected: Claim integrity
- Fix: Add `requireRole("operator_admin", "operator_staff", "dealer_owner", "dealer_staff")` before these handlers.

---

### HIGH

**H1 — Unit photos and documents have no access check**
- Files: `server/routes/units.ts:117–141`
- `GET /api/units/:id/photos` and `GET /api/units/:id/documents` call the DB without any `canAccessDealership()` check. Any authenticated user who knows or guesses a unit UUID can download all its photos and documents.
- Affected: All dealers — cross-tenant photo/document exposure
- Fix: Add `canAccessDealership(unit.dealershipId, req.user)` check after fetching the unit (same pattern as `GET /api/units/:id`).

**H2 — DELETE /api/users/:id has no scope check for dealer_owner**
- File: `server/routes/users.ts:152–178`
- `isDealerOwner = req.user.role === "dealer_owner"` but there is no check that the target user belongs to the calling dealer's dealership. A dealer_owner can deactivate users at any other dealership.
- Affected: Any user in the system
- Fix: Add `if (isDealerOwner && targetUser.dealershipId !== req.user.dealershipId)` guard.

**H3 — Ticket status and messages have no ownership check**
- Files: `server/routes/tickets.ts:123`, `server/routes/tickets.ts:86`
- `PUT /api/tickets/:id/status` fetches no ticket and checks no ownership. `POST /api/tickets/:id/messages` checks only that the ticket exists.
- Any authenticated user who knows a ticket UUID can change its status or inject messages.
- Fix: Fetch ticket and verify `canAccessDealership` (and for clients, `customerId`) before allowing write.

**H4 — Operator staff can update dealership subscription plan and fees**
- File: `server/routes/dealerships.ts:68`
- `PUT /api/dealerships/:id` distinguishes `operator_admin` (full update) vs others (filtered fields). But `canAccessDealership` returns true for all operator roles, so operator_staff can call this with any body, and the role check `req.user.role === "operator_admin"` means staff get the filtered path — but operator_staff is not in the `else` branch restriction. Actually re-reading: the `else` block restricts to business info fields only, so staff get filtered fields. **Reclassify to MEDIUM.**

**H5 — Payment method deletion has no ownership verification**
- File: `server/routes/payments.ts:141`
- `DELETE /api/payments/methods/:id` calls `deletePaymentMethod(req.params.id)` with no check that the Stripe payment method ID belongs to the calling dealer's Stripe customer. A dealer_owner could delete another dealer's saved card if they obtain the Stripe PM ID.
- Fix: Verify the payment method belongs to the dealership's Stripe customer before deletion.

---

### MEDIUM

**M1 — Client can read all dealership invoices**
- File: `server/routes/invoices.ts:17`
- `GET /api/invoices` is scoped to dealership but not to the client's own invoices. A client can view invoices for all of the dealer's other customers.
- Fix: Add `eq(invoices.customerId, req.user.id)` condition for client role, or block clients entirely.

**M2 — Client can create photo batches**
- File: `server/routes/batches.ts:40`
- No role restriction on `POST /api/batches`. Clients can upload photo batches into the dealer's queue.
- Fix: Restrict to dealer and operator roles.

**M3 — Dealer staff can update dealership branding**
- File: `server/routes/dealerships.ts:111`
- `PUT /api/dealerships/:id/branding` only checks `canAccessDealership` — any user at the dealership including staff can change the logo/colors. Should be dealer_owner only.
- Fix: Add `requireRole("dealer_owner", "operator_admin", "operator_staff")`.

**M4 — Dealer staff can pay invoices and list saved cards**
- File: `server/routes/payments.ts:83,118`
- `POST /api/payments/pay-invoice` and `GET /api/payments/methods` have no dealer_owner restriction.
- Fix: Add `requireRole("dealer_owner")` to both.

**M5 — GET /api/dealerships/:id returns sensitive financial fields to dealer users**
- File: `server/routes/dealerships.ts:44`
- Returns full dealership record including `stripeCustomerId`, `walletBalance`, `subscriptionPlan`, `claimFeePercent` to dealer_owner.
- stripeCustomerId should be stripped from dealer-facing responses.
- Fix: Return a projected object excluding sensitive Stripe/internal fields.

**M6 — Feature requests expose all dealer submissions to all dealers**
- File: `server/routes/platform.ts:51`
- `GET /api/feature-requests` returns all requests with no scope. Dealer A can read Dealer B's feature requests.
- Fix: Scope to `req.user.dealershipId` for dealer roles; operators see all.

**M7 — Marketplace my-listings has no auth and uses query-param memberId**
- File: `server/routes/marketplace.ts:298`
- `GET /api/marketplace/my-listings?memberId=X` returns all listings for any member without authentication or ownership verification.
- Fix: Require auth; verify caller's member identity.

**M8 — register endpoint returns refreshToken in JSON body**
- File: `server/routes/auth.ts:195–208`
- `POST /api/auth/register` returns `refreshToken` in the response JSON. All other token flows use httpOnly cookie. This inconsistency exposes the refresh token to JavaScript.
- Fix: Set `ds360_refresh` cookie (same as login) and remove refreshToken from response body.

**M9 — Invite schema references stale "customer" role**
- File: `server/routes/users.ts:183`
- `z.enum(["dealer_owner", "dealer_staff", "customer"])` — "customer" was renamed to "client". This means client invitations cannot be sent via the API.
- Fix: Update to `"client"`.

---

### LOW

**L1 — Ticket message isInternal flag accepted from any role**
- File: `server/routes/tickets.ts:97`
- `isInternal: req.body.isInternal` — a dealer staff member or even client could set `isInternal: true` on their own message, hiding it from other clients. Non-harmful but unintended.
- Fix: Only allow `isInternal: true` for operator and dealer roles.

**L2 — Notifications broadcast endpoint is a placeholder**
- File: `server/routes/platform.ts:134`
- Responds with `"Broadcast queued"` without doing anything. TODO comment present.
- Fix: Implement or remove the endpoint.

**L3 — auctions.ts TypeScript errors indicate schema mismatch**
- File: `server/routes/auctions.ts`
- TypeScript reports `listingId` and `sellerId` don't exist on the insert type, suggesting the auctions schema is out of sync with the marketplace schema. Auction routes likely silently fail.
- Fix: Align auction schema with actual DB columns.

---

### CLEAN

The following areas are correctly implemented:

- **JWT auth middleware** (`server/middleware/auth.ts`): Verifies token type, fetches live user from DB on every request, checks `isActive`. Refresh token is stored in httpOnly cookie on login. No credentials in localStorage.
- **Portal-type gating on login**: Each portal type (`operator`, `dealer`, `client`, `bidder`) only accepts the correct roles. Wrong role at wrong door returns generic "Invalid credentials" — no enumeration.
- **Dealer-to-dealer isolation on list endpoints**: `scopeToDealership` correctly uses JWT `dealershipId`, ignoring any `dealershipId` query param from dealer roles.
- **Operator staff billing restriction**: Cannot create or send invoices (correctly requires `operator_admin`).
- **Operator settings write restriction**: `PUT /api/settings/:key` correctly requires `operator_admin`.
- **Ticket internal note filtering**: `GET /api/tickets/:id` correctly strips `isInternal` messages for client role.
- **Client ticket scoping**: `GET /api/tickets` correctly adds `customerId` filter for client role.
- **Marketplace dealer anonymity on browse**: `sellerId` is explicitly excluded from listing query projections with clear comment.
- **Password hashing**: bcrypt used throughout, never logged or returned in responses.
- **Rate limiting**: Login (20/15min) and forgot-password (5/hr) are rate limited at the Express layer.
- **CSRF protection via SameSite=lax**: Refresh token cookie uses `sameSite: "lax"`.
- **Stripe webhook verification**: Signature verified before processing; route uses raw body correctly.
- **Notifications self-scoped**: `GET /api/notifications` filters by `userId` — users only see their own.

---

## SUMMARY PRIORITY TABLE

| Severity | Count | Biggest Risk |
|----------|-------|-------------|
| CRITICAL | 4 | Entire marketplace API unauthenticated; Stripe charges callable with no auth |
| HIGH | 4 | Cross-tenant unit photos/docs; client writes to claims; broken ticket ownership |
| MEDIUM | 9 | Client reads all dealer invoices/claims; stale "customer" invite role; register leaks refresh token |
| LOW | 3 | Cosmetic/placeholder issues |
| CLEAN | 12 | Core auth, JWT, billing admin, ticket filtering, rate limiting |

**Recommended immediate action (before any real user data enters the system):**
1. Add `requireAuth` to all `/api/marketplace/*` routes
2. Add `canAccessDealership` check to `GET /api/units/:id/photos` and `/documents`
3. Add client-role filter to `GET /api/claims` and `GET /api/units`
4. Add role restriction to `PUT /api/claims/:id` and `PUT /api/units/:id`
5. Add scope check to `DELETE /api/users/:id`
6. Fix invite schema role enum ("customer" → "client")
