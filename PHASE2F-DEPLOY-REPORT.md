# PHASE 2F DEPLOY REPORT
**Date:** 2026-04-26  
**Branch:** main  
**Commit:** 63aa675  
**Status:** COMPLETE ✅

---

## Objective

Fix critical business logic: enforce RBAC on claims visibility (operator-only on submission, client sees status only, technician/bidder see nothing), redesign the operator claim queue as a professional kanban flow, and implement a proper draft-then-submit flow requiring photos before a claim can be submitted.

---

## Changes Delivered

### 1. Claims API RBAC — `server/routes/claims-v6.ts` (full rewrite)

**GET / (list claims):**
- Operator admin/staff: all claims, enriched with `unitYear`, `unitModel`, `unitMake`, `dealershipName` for kanban cards. Drafts excluded.
- Dealer owner/staff: their dealership's claims only (multi-tenant isolation)
- Client: claims on their units only, **minimal fields only** (id, claimNumber, type, status, unitId, createdAt — no dealer notes, operator notes, estimated amounts, or any internal fields)
- Technician, bidder, all other roles: **empty array** — no claim access
- New query filters: `status`, `type`, `manufacturer`, `dealershipId`, `search` (fuzzy on claim# and manufacturer)

**GET /:id (single claim):**
- Dealer: own dealership's claims only, full detail
- Client: own unit's claims only, minimal payload (id/claimNumber/type/status/createdAt)
- Operator: full unit file — returns `claim`, `unit`, `unitClaims` (all past claims on this unit), `unitPhotos`, `claimPhotos` (photos submitted with this specific claim), `customer`, `dealership`
- Technician/bidder: 403 Forbidden

**New endpoints:**
| Endpoint | Who | What |
|---|---|---|
| `POST /:id/submit` | dealer | Transitions draft → new_unassigned; enforces ≥1 photo (server-side); emits `claim.submitted` to operator only |
| `DELETE /:id` | dealer | Deletes draft claim + associated uploads (cancel flow) |
| `POST /:id/assign` | operator | Assigns to self or specified userId; transitions to `assigned` |
| `POST /:id/request-info` | operator | Sets `info_requested`, `awaitingDealerResponse: true`; notifies dealer |
| `POST /:id/approve` | operator | Sets `approved`, records `approvedAt` + `approvedAmount`; notifies dealer |
| `POST /:id/deny` | operator | Sets `denied`, records `deniedAt` + `denialReason`; notifies dealer |
| `POST /:id/transition` | operator | Full state machine (in_review, submitted_to_mfr, partial_approval, completed, etc.) |

**Removed:** Old `POST /` that immediately created `new_unassigned` claims. Replaced with draft creation (also `POST /`, status `draft`) — claims only go to queue after explicit submit.

---

### 2. Event Bus RBAC — `server/lib/event-bus.ts`

**`claim.submitted` fan-out fixed:**
- **Before:** Notified `operator_admin`, `operator_staff`, `dealer_owner`, `dealer_staff`
- **After:** Notifies `operator_admin` and `operator_staff` ONLY
- Rationale: the dealer submitted the claim — they know. Sending them a "your claim was received" notification at the moment they clicked Submit is noise. They see status updates as the claim progresses.

**`claim.put_in_review` fan-out fixed:**
- Removed `client` role from recipients — client should not receive notifications about internal operator workflow steps
- Dealer still notified (informational, no email)

All other fan-out rules unchanged per spec constraint: "Do NOT alter the existing event-bus.ts structure — only update the fan-out targets for claim events."

---

### 3. New Claim Flow — `client/src/components/claims/NewClaimPage.tsx`

**Before:** Form → Submit → claim created as `new_unassigned` → then optionally upload photos.  
**After (Approach A: Draft-then-submit):**

1. Dealer lands on New Claim page, sees unit info + warranty status in left panel
2. Selects claim type → **draft claim created immediately** via `POST /api/v6/claims` (status: `draft`)
3. "Draft saved ●" indicator appears
4. `PhotoUploader` uses the draft claim ID (`scope="claims"`, `scopeId={draftClaimId}`)
5. Photo counter tracks uploads via `onUploadComplete` callback
6. Submit button **disabled** until `photoCount >= 1`
7. Clear status message: "⚠ At least 1 photo is required before submitting" → "✓ N photos uploaded — ready to submit"
8. Dealer clicks "Submit Claim" → `POST /api/v6/claims/:id/submit` → server validates photos exist → transitions draft → `new_unassigned` → emits `claim.submitted` event → navigates back to unit
9. Cancel → `DELETE /api/v6/claims/:id` (removes draft + orphaned uploads) → navigate back

---

### 4. Operator Claim Queue Redesign — `client/src/components/operator/ClaimQueuePage.tsx`

**Before:** Simple grid of colored columns with inline action dropdowns/buttons per card.  
**After:** Full kanban board with:

**7 columns:**
| Column | Color |
|---|---|
| New / Unassigned | Blue #1e88e5 |
| Assigned | Cyan #0891b2 |
| In Review | Orange #f48120 |
| Info Requested | Purple #9b59b6 |
| Submitted to Mfr | Indigo #6366f1 |
| Approved | Green #16a34a |
| Denied | Red #c0392b |

**Claim cards show:**
- Claim number (bold, navy)
- Type badge (color-coded, uppercase)
- Unit: Year Make Model (from enriched API response)
- Dealer name
- Time in current status (timeAgo)

**Filter bar:**
- Search input (claim# or model)
- Type dropdown (warranty/extended_warranty/pdi/daf/insurance)
- Manufacturer dropdown (populated from live claims data)
- "Clear filters" button

**Slide-in detail panel (700px, fixed right):**
- Claim info (number, status, type)
- Action buttons per status:
  - `new_unassigned`: "Assign to me"
  - `assigned`/`in_review`: "Request more info", "Approve", "Deny", "Move to In Review", "Submit to Mfr"
  - `submitted_to_mfr`: "Approve", "Deny"
- Dealer notes section
- Submitted photos grid (linked to full-size)
- Full unit file: 9 identity/warranty fields
- Customer info block
- Dealership info block
- Claim history on this unit (other claims)
- Unit photos grid

---

### 5. Dealer Accounts List Page — `client/src/App.tsx`

**Before:** Route wrapped page in `SectionLayout` with `DealersContextSidebar` — caused a duplicate sidebar showing dealers next to a table that already lists all dealers.  
**After:** Route uses `PortalShell` + plain `div` content area — no contextual sidebar. Contextual sidebar still appears correctly on `DealershipDetailPage` (specific dealer view).

---

### 6. Client Claims Page — `client/src/components/client/ClientClaimsPage.tsx`

Cleaned up to show only:
- Claim number
- Claim type (human-readable label)
- Submission date
- Status (consumer-friendly labels: "Submitted — pending review", "Under review", "Sent to manufacturer", "Approved", "Not approved — contact your dealer")
- Draft claims hidden (`filter(c => c.status !== "draft")`)
- Color-coded status badges (green for approved/completed, red for denied, amber for info_requested)
- No dealer notes, operator notes, manufacturer details, estimated amounts, FRC lines, or any internal fields

---

## Files Changed (6)

| File | Type |
|---|---|
| `server/routes/claims-v6.ts` | Full rewrite — RBAC + all new endpoints |
| `server/lib/event-bus.ts` | Fan-out fix — claim.submitted operator-only |
| `client/src/components/claims/NewClaimPage.tsx` | Rewrite — draft-then-submit flow |
| `client/src/components/operator/ClaimQueuePage.tsx` | Rewrite — kanban board |
| `client/src/components/client/ClientClaimsPage.tsx` | Rewrite — minimal client view |
| `client/src/App.tsx` | Route fix — remove sidebar from DealerAccountsListPage |

---

## Build

- `npm run check`: 0 new errors in Phase 2F files (pre-existing errors in locked portal files and server/stripe-escrow unchanged)
- `npm run build`: ✅ 1920 modules, built in 22.54s
- Commit `63aa675` pushed to `origin/main`
