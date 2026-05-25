# V6 Claims Extraction — Functions, Handlers, API Calls

## OperatorPortal.tsx — Claims-Related Functions

### State
- `opClaims: any[]` — list of all claims
- `opBatches: any[]` — photo batches in queue
- `selectedClaimId: string | null`
- `selectedClaimDetail: any | null`
- `queueSearch, queueMfr, queueType` — queue filter state
- `claimsSearch, claimsStatus, claimsMfr, claimsDealer` — claims list filter state

### Data Fetching (useEffect keyed on activePage)
| Page | API Call | Sets State |
|------|----------|------------|
| dashboard | GET /api/v6/claims | setOpClaims |
| claims | GET /api/v6/claims | setOpClaims |
| stale | GET /api/v6/claims | setOpClaims |
| claim-detail | GET /api/v6/claims/:selectedClaimId | setSelectedClaimDetail (d.claim) |
| queue | GET /api/batches?status=uploaded | setOpBatches (d.batches) |

### WebSocket
- `wsClient.on('claim:updated', ...)` — refetches /api/v6/claims on claims/dashboard pages
- `wsClient.on('batch:uploaded', ...)` — refetches /api/batches?status=uploaded on queue page

### Navigation
- `setActivePage('claim-detail')` with `setSelectedClaimId(claim.id)` — navigate to claim detail
- `setActivePage('batch-review')` with `setSelectedBatchId(batch.id)` — navigate to batch review

---

## DealerPortal.tsx — Claims-Related Functions

### State
- `dlrClaims: any[]` — dealer's own claims
- `dlrUnits: any[]` — dealer's units (used for upload unit selector)
- `selectedClaimId: string | null`
- `uploadUnitId: string` — selected unit for photo upload
- `uploadFiles: File[]` — staged upload files
- `uploadSaving: boolean`

### Data Fetching
| Page | API Call | Sets State |
|------|----------|------------|
| dashboard | GET /api/v6/claims | setDlrClaims |
| claims | GET /api/v6/claims | setDlrClaims |
| upload | GET /api/v6/units | setDlrUnits |

### Handlers
- **handleAddUnit** — POST /api/v6/units → refreshes unit list → navigates to units
- **handleMarkNotificationRead** — POST /api/v6/notifications/:id/read
- Photo upload uses `uploadFiles: File[]` state — no real server upload implemented (V6 TODO)
- Push to Claim button navigates to 'claims' (V6 — no API call)

### Navigation
- `setActivePage('claim-detail')` with `setSelectedClaimId(id)` — claim detail
- `setActivePage('claims')` after push

---

## CustomerPortal.tsx — Claims-Related Functions

### State
- Claim list and detail via `activePage` state machine
- No direct API calls for claims in V6 CustomerPortal (hardcoded mock data)

---

## V7 Target API Endpoints (ALL PRESENT in server/routes/)

| Method | Path | File | Status |
|--------|------|------|--------|
| GET | /api/v6/claims | claims-v6.ts | LIVE |
| GET | /api/v6/claims/:id | claims-v6.ts | LIVE |
| POST | /api/v6/claims | claims-v6.ts | LIVE |
| POST | /api/v6/claims/:id/submit | claims-v6.ts | LIVE |
| POST | /api/v6/claims/:id/assign | claims-v6.ts | LIVE |
| POST | /api/v6/claims/:id/transition | claims-v6.ts | LIVE |
| POST | /api/v6/claims/:id/approve | claims-v6.ts | LIVE |
| POST | /api/v6/claims/:id/deny | claims-v6.ts | LIVE |
| DELETE | /api/v6/claims/:id | claims-v6.ts | LIVE |
| GET | /api/batches | batches.ts | LIVE |
| GET | /api/batches/:id | batches.ts | LIVE |
| POST | /api/batches | batches.ts | LIVE |
| PUT | /api/batches/:id/process | batches.ts | LIVE |
| POST | /api/v6/uploads/presign | uploads-v6.ts | LIVE |
| POST | /api/v6/uploads/confirm/:id | uploads-v6.ts | LIVE |
| GET | /api/v6/uploads/by-claim/:id | uploads-v6.ts | LIVE |
| GET | /api/invoices | invoices.ts | LIVE |
| POST | /api/invoices | invoices.ts | LIVE |
| GET | /api/frc-codes | platform.ts / ai.ts | LIVE (via /api/ai/suggest-frc) |

## Missing Endpoints
- PATCH /api/v6/claims/:id — status update (use POST /api/v6/claims/:id/transition instead)
- PATCH /api/v6/claims/:id/lines/:lineId — use PUT /api/claims/:id/frc-lines/:lineId
- GET /api/v6/frc-codes — not mounted; fallback mock data used in portals

## Route Structure (from PortalRoutes.tsx)
- Operator Admin: /operator/admin/claims/:claimId → ClaimDetail
- Operator Admin: /operator/admin/queue/:batchId → BatchReview
- Dealer Owner: /:dealerId/owner/claims/:claimId → ClaimDetail
- Dealer Staff: /:dealerId/staff/claims/:claimId → ClaimDetail

## URL Pattern for Navigation
- From Claims list → ClaimDetail: navigate(`../claims/${claim.id}`) from current layout segment
- From Queue → BatchReview: navigate(`../queue/${batch.id}`)
- useParams() via wouter extracts :claimId / :batchId from route params
