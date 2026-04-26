# Phase 2C Deploy Report
**Date:** 2026-04-25  
**Branch:** main

---

## Summary

- Dealer Management module built as full operator workflow (list → detail → modules → branding)
- Modular subscription system: `module_catalog` + `dealership_modules` tables with 8 seeded modules
- 3-tier branding gates: `base` / `mid` / `enterprise` controls white-label depth
- UX overhaul: all creation flows moved from modals to full-page routes with sidebar context navigation
- Claims page redesigned with KPI cards + inline inventory picker for new claims
- UnitProfilePage gets left sidebar (HubSpot-style) showing other units in the dealership

---

## Files Added

| File | Purpose |
|------|---------|
| `server/routes/dealerships-v6.ts` | Full CRUD + modules + branding API, 14 endpoints |
| `scripts/apply-phase2c-schema.ts` | Direct SQL schema migration (bypassed drizzle-kit TUI) |
| `scripts/seed-module-catalog.ts` | Seeds 8 modules to `module_catalog` |
| `client/src/components/operator/DealerAccountsListPage.tsx` | Operator dealer list with KPIs + filter |
| `client/src/components/operator/NewDealershipPage.tsx` | 4-step wizard: Business Info → Branding Tier → Modules → Review |
| `client/src/components/operator/DealershipDetailPage.tsx` | 6-tab detail: Overview, Owner & Staff, Modules & Pricing, Subscription, Branding, Activity |
| `client/src/components/units/NewUnitPage.tsx` | Full-page new unit form with sidebar showing recent units |
| `client/src/components/claims/NewClaimPage.tsx` | Full-page new claim with unit context sidebar + warranty status |

## Files Modified

| File | Changes |
|------|---------|
| `shared/schema.ts` | 5 new enums + 12 new fields on `dealerships` + 2 new tables |
| `server/routes/index.ts` | Mounted `/api/v6/dealerships` |
| `server/routes/clerk-webhook.ts` | Auto-create pending dealership on public dealer signup |
| `client/src/App.tsx` | 8 new routes (dealerships list/new/detail, units/new, claims/new, unit profiles) |
| `client/src/pages/OperatorPortalV6.tsx` | Wired `master.mgmt.dealer_accounts` → `<DealerAccountsListPage />` |
| `client/src/components/units/InventoryListPage.tsx` | `+ New Unit` → navigates to full-page route (modal removed) |
| `client/src/components/units/UnitProfilePage.tsx` | Left sidebar + `+ New Claim` → full-page route (modal removed) |
| `client/src/components/dealer/DealerClaimsPage.tsx` | KPI cards + inline inventory picker for new claims |

---

## Schema Changes Applied

All changes are **additive/non-destructive**.

### New enums
| Enum | Values |
|------|--------|
| `BRANDING_TIERS` | `base`, `mid`, `enterprise` |
| `MODULE_CATALOG_KEYS` | `claims`, `techflow`, `marketplace`, `parts_store`, `ai_fi`, `marketing`, `consignment`, `financing` |
| `MODULE_PRICING_TYPES` | `subscription`, `per_use`, `hybrid`, `commission` |
| `MODULE_STATUSES` | `enabled`, `disabled`, `trial`, `past_due` |
| `DEALERSHIP_REVIEW_STATUSES` | `active`, `pending_review`, `suspended`, `rejected` |

### New dealerships columns
`branding_tier`, `secondary_color`, `font_family`, `email_from_name`, `custom_subdomain` (unique index), `review_status`, `reviewed_at`, `reviewed_by_id`, `review_notes`, `address_line_1`, `address_line_2`, `state_province`

### New tables
- `module_catalog` — master list of 8 available modules with pricing defaults
- `dealership_modules` — per-dealer module enablement + pricing overrides

---

## Architecture Notes

### Modular Subscription System
```
module_catalog → defines all available modules + default pricing
dealership_modules → per-dealer: which modules enabled + price overrides
POST /api/v6/dealerships → auto-enables isBaseRequired modules (claims)
POST /api/v6/dealerships/:id/modules/:key → operator enables optional module
DELETE /api/v6/dealerships/:id/modules/:key → operator disables module
```

### Branding Tiers
```
base → DS360 branding locked. No customization.
mid → Dealer can set: logo, primaryColor, secondaryColor, fontFamily, emailFromName
enterprise → mid + customSubdomain + client portal inherits dealer branding
```

### UX Upgrade: Full-Page Workflows
```
Before: modal-based creation (New Unit, New Claim)
After: full-page routes with left sidebar for context navigation

/dealer-v6/units/new → NewUnitPage (sidebar: recent units)
/dealer-v6/units/:unitId/claims/new → NewClaimPage (sidebar: unit info + warranty status)
/operator-v6/dealerships/new → NewDealershipPage (4-step wizard)
/operator-v6/dealerships/:id → DealershipDetailPage (6 tabs)
```

### UnitProfilePage — HubSpot-style Sidebar
```
Left 260px: other units in dealership (search + filter by status)
  - Active unit highlighted with blue left border
  - Warranty status badges (W = warranty active/expiring/expired)
  - Click any unit → navigate to that unit's profile
Right flex: existing 7 tabs (Identity, Warranty, Customer, Photos, Documents, Claims, Service)
Client context: sidebar hidden (clients have one unit)
```

---

## Verification

| Check | Result |
|-------|--------|
| `npm run check` (new files) | ✅ 0 new errors |
| `npm run check` (pre-existing) | stripe-escrow.ts, crm.ts, CustomerPortal.tsx — same as before |
| `npm run build` | ✅ built in 7.88s |
| `npx tsx scripts/apply-phase2c-schema.ts` | ✅ 12 new columns + 2 new tables |
| `npx tsx scripts/seed-module-catalog.ts` | ✅ 8 modules seeded |

---

## Manual Test for Jonathan

**Operator → Dealer Accounts:**
1. Sign in → `/portal-select-v6` → Operator Admin
2. Click **Dealer Accounts** in sidebar → see KPI cards (Total, Active, Pending Review, Suspended)
3. See your seeded dealerships in the table with Tier and Status badges
4. Click **Pending Review** KPI card → filters table to pending

**New Dealership Wizard:**
5. Click **+ New Dealership** → full-page 4-step wizard opens
6. Step 1: Enter business info (name, email, address)
7. Step 2: Pick branding tier (Base / Mid / Enterprise)
8. Step 3: Enable optional modules (catalog loads from DB)
9. Step 4: Review summary → **Create Dealership** → redirects to detail page

**Dealership Detail:**
10. Click any dealership row → 6-tab detail page opens
11. **Overview** tab → edit fields → Save changes
12. **Owner & Staff** tab → see linked users (or empty state)
13. **Modules & Pricing** tab → enable/disable optional modules (Claims = required, can't disable)
14. **Subscription** tab → placeholder (Phase 2D)
15. **Branding** tab → tier-aware: base shows lockout message; mid/enterprise shows editable fields
16. **Activity** tab → placeholder (Phase 2D)
17. Pending dealerships show Approve/Reject buttons in header

**New Unit (full-page):**
18. Switch to Dealer portal → **Units / Inventory**
19. Click **+ New Unit** → full-page form opens with "Recent Units" sidebar
20. Fill VIN, Year, Make → **Create Unit** → redirects to unit profile

**Unit Profile Sidebar:**
21. Unit profile opens with left sidebar listing all other units
22. Search field + status filter work in sidebar
23. Active unit has blue left border highlight
24. Click any sibling unit → navigates to that unit's profile
25. Client portal: sidebar is hidden

**New Claim (full-page):**
26. In a unit profile → click **+ New Claim** → full-page claim form
27. Left sidebar shows: unit summary, warranty status (Mfr, Extended, Service Contract)
28. Manufacturer auto-filled from unit (override field available)
29. Select type → fill notes → **Create Claim** → photo upload section appears inline
30. Upload photos → **Done — Back to Unit**

**Claims Page redesign:**
31. Dealer portal → **Claims** in sidebar
32. KPI cards at top: Active Claims, Pending, This Month, Approved YTD
33. Click **+ New Claim** → inline inventory picker expands
34. Pick a unit → navigates to full-page `/dealer-v6/units/:id/claims/new`
35. Status filter dropdown works

---

## Known Gaps (Deferred)

- **Stripe billing** — not connected; subscription tab is placeholder
- **Owner invite system** — manual via Clerk dashboard for now; webhook handler is ready for `dealer_owner_pending` flow
- **Public dealer signup page** — `/signup/dealer` page not built yet (backend webhook + Clerk metadata ready)
- **`/operator-v6/dealerships` route** — accessible as full-page route; sidebar nav links to it via `showPage("master.mgmt.dealer_accounts")` within the portal shell

---

*Report generated by autonomous Phase 2C execution — 2026-04-25*
