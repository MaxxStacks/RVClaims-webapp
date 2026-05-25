# V6 → V7 FUNCTIONALITY TRANSFER — MODULE 1: CLAIMS

## PURPOSE

Transfer ALL working claims functionality from the V6 monolithic portal files into the V7 modular page components. V6 uses DOM manipulation (innerHTML, getElementById, event listeners). V7 uses React state, hooks, and API calls. This is a TRANSLATION job — extract the V6 logic, convert it to React patterns, wire it into V7 pages.

**OUTCOME:** A dealer can create a claim, upload photos, push to operator, and the operator can review, assign FRC codes, approve/deny per line, and close the claim — fully end-to-end in V7.

---

## AUTONOMOUS EXECUTION

Run without pausing. Follow the exact sequence below. After EACH step, verify the change works before moving to the next. If a step fails, fix it before continuing.

---

## STEP 1: READ V6 CLAIMS FUNCTIONALITY

Read these V6 files and extract EVERY claims-related function, handler, API call, and data flow:

### File 1: client/src/portals/OperatorPortal.tsx
Find and document:
- Processing Queue rendering (how claims are listed, filtered, sorted)
- Batch Review flow (how batches are reviewed, FRC codes assigned)
- Claim Detail rendering (how claim data is displayed — FRC lines, photos, status, notes)
- Approve/Deny per FRC line (the actual handler that calls the API)
- Status updates (how claim status changes are submitted)
- Invoice creation from claim (how the invoice builder links to a claim)
- Any `apiFetch`, `fetch`, or API call related to claims
- Any `getElementById`, `querySelector`, `innerHTML` for claims UI
- Any event listeners, click handlers, form submissions for claims

### File 2: client/src/portals/DealerPortal.tsx
Find and document:
- Photo upload flow (how photos are captured, previewed, uploaded to server)
- "Push to Claim" (how a batch is created and pushed to operator queue)
- Claim list rendering (how dealer's claims are displayed)
- Claim detail view (what the dealer sees — read-only status, photos, timeline)
- Unit selection for claims (how a unit/VIN is linked to a claim)
- Any file upload handlers (multipart form data, FormData, file input onChange)

### File 3: client/src/portals/CustomerPortal.tsx
Find and document:
- Claim Status display (simplified customer view)
- Report an Issue flow (how customer submits an issue)
- Photo upload for issues

**OUTPUT OF STEP 1:** Create a temporary file `V6-CLAIMS-EXTRACTION.md` in the project root listing every function name, what it does, what API endpoint it calls, and what data it sends/receives.

---

## STEP 2: MAP V6 FUNCTIONS → V7 FILES

Using the extraction from Step 1, create this mapping:

| V6 Function/Handler | V6 File | V7 Target File | V7 Target Component | Translation Needed |
|---|---|---|---|---|
| renderProcessingQueue() | OperatorPortal.tsx | pages/ProcessingQueue.tsx | ProcessingQueue | DOM → React state + useQuery |
| handleClaimApprove() | OperatorPortal.tsx | pages/ClaimDetail.tsx | ClaimDetail | getElementById → useState + apiFetch |
| handlePhotoUpload() | DealerPortal.tsx | pages/exclusive/dealer-owner/PhotoUpload.tsx | PhotoUpload | FormData → React file input + apiFetch |
| handlePushToClaim() | DealerPortal.tsx | pages/exclusive/dealer-owner/PhotoUpload.tsx | PhotoUpload | DOM → apiFetch POST /api/batches |
| ... | | | | |

---

## STEP 3: VERIFY V7 API ROUTES EXIST

Before wiring frontend, confirm these API routes exist and work:

```bash
# Check each route file exists and has the right handlers
grep -n "router\.\(get\|post\|put\|patch\|delete\)" server/routes/claims.ts
grep -n "router\.\(get\|post\|put\|patch\|delete\)" server/routes/claims-v6.ts
grep -n "router\.\(get\|post\|put\|patch\|delete\)" server/routes/batches.ts
grep -n "router\.\(get\|post\|put\|patch\|delete\)" server/routes/uploads-v6.ts
grep -n "router\.\(get\|post\|put\|patch\|delete\)" server/routes/ai.ts
```

**Required endpoints (create any that are missing):**

| Method | Path | Purpose | Exists? |
|---|---|---|---|
| GET | /api/v6/claims | List claims (filterable by dealer, status, date) | |
| GET | /api/v6/claims/:id | Get single claim with FRC lines, photos, unit info | |
| POST | /api/v6/claims | Create new claim (draft status) | |
| PATCH | /api/v6/claims/:id | Update claim (status, notes, assignment) | |
| PATCH | /api/v6/claims/:id/lines/:lineId | Approve/deny individual FRC line | |
| POST | /api/batches | Create photo batch | |
| GET | /api/batches | List batches (filterable by status, dealer) | |
| GET | /api/batches/:id | Get single batch with photos | |
| PATCH | /api/batches/:id | Update batch status | |
| POST | /api/v6/uploads | Upload file (multipart) | |
| GET | /api/v6/frc-codes | List FRC codes by manufacturer | |

If any endpoint is missing, CREATE it now using the existing schema tables (claims, claimFrcLines, photoBatches, photos).

---

## STEP 4: WIRE ClaimNew.tsx (Dealer Creates Claim)

**Current state:** Form renders but has no onSubmit connected to API.

**V6 had:** A form that collected unit VIN, claim type (DAF/PDI/Warranty/Extended), description, and submitted to the API.

**TRANSLATION:**

```tsx
// REPLACE the empty/stub form handler with:
const handleSubmit = async (e: React.FormEvent) => {
  e.preventDefault();
  try {
    const res = await apiFetch('/api/v6/claims', {
      method: 'POST',
      body: JSON.stringify({
        unitId: selectedUnit.id,
        dealershipId: currentUser.dealershipId,
        claimType: claimType,       // DAF | PDI | Warranty | Extended
        description: description,
        status: 'draft',            // Always starts as draft
        // Include any other fields from the form
      }),
    });
    if (res.ok) {
      const claim = await res.json();
      navigate(`claims/${claim.id}`);  // Navigate to the new claim WITH ID
    }
  } catch (err) {
    toast({ title: 'Error creating claim', variant: 'destructive' });
  }
};
```

**ALSO FIX:**
- Add a unit/VIN selector (dropdown or search) that queries /api/v6/units
- Add claim type selector (DAF, PDI, Warranty, Extended Warranty)
- Add manufacturer auto-populate from selected unit
- Ensure the form uses React state for all fields (no DOM manipulation)

---

## STEP 5: WIRE PhotoUpload.tsx (Dealer Uploads Photos)

**Current state:** Upload zone renders. onChange not wired. "Push to Claim" only navigates.

**V6 had:** File input that created FormData, sent to server, displayed thumbnails, then "Push to Claim" created a batch and notified operator.

**TRANSLATION:**

```tsx
// File upload handler
const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
  const files = Array.from(e.target.files || []);
  setUploadingFiles(files);
  
  for (const file of files) {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('unitId', selectedUnit.id);
    formData.append('category', photoCategory); // DAF | PDI | Warranty | General
    
    const res = await fetch('/api/v6/uploads', {
      method: 'POST',
      body: formData,
      // DO NOT set Content-Type header — browser sets multipart boundary
    });
    
    if (res.ok) {
      const photo = await res.json();
      setUploadedPhotos(prev => [...prev, photo]);
    }
  }
};

// Push to Claim handler
const handlePushToClaim = async () => {
  if (uploadedPhotos.length === 0) {
    toast({ title: 'Upload at least one photo first', variant: 'destructive' });
    return;
  }
  
  const res = await apiFetch('/api/batches', {
    method: 'POST',
    body: JSON.stringify({
      unitId: selectedUnit.id,
      dealershipId: currentUser.dealershipId,
      photoIds: uploadedPhotos.map(p => p.id),
      status: 'uploaded',
    }),
  });
  
  if (res.ok) {
    toast({ title: 'Photos pushed to claims queue!' });
    navigate('claims');
    // Operator receives notification via event bus
  }
};
```

**ALSO FIX:**
- Add photo preview thumbnails (show uploaded photos)
- Add photo category selector per photo or per batch
- Add unit/VIN selector if not already selected
- Add drag-and-drop support (if V6 had it)
- Show upload progress indicator

---

## STEP 6: WIRE ClaimDetail.tsx (THE CRITICAL FIX)

**Current state:** `useState<any | null>(null)` — never populated. All values show "—".

**V6 had:** Full claim detail view with unit info, dealer info, FRC lines (each with complaint/cause/correct), photos per item, status timeline, approve/deny per line, notes.

**TRANSLATION:**

```tsx
// Get claim ID from URL params
const { claimId } = useParams();

// Fetch claim data
const { data: claim, isLoading, refetch } = useQuery({
  queryKey: ['claim', claimId],
  queryFn: async () => {
    const res = await apiFetch(`/api/v6/claims/${claimId}`);
    if (!res.ok) throw new Error('Failed to load claim');
    return res.json();
  },
  enabled: !!claimId,
});
```

**REPLACE** the entire hardcoded mock display with real data rendering:
- Unit info section: VIN, Year, Make, Model, Stock# (from claim.unit)
- Dealer info section: Dealership name, contact (from claim.dealership)
- Status badge: claim.status with color coding
- FRC Lines: Map over claim.frcLines, each showing:
  - Complaint code + description
  - Cause code + description  
  - Correct code + description
  - Status per line (pending/approved/denied)
  - Approve/Deny buttons PER LINE (operator only)
- Photos: Grid of photos linked to this claim
- Notes/timeline: Claim history entries
- Status update dropdown (operator only): change claim status

**APPROVE/DENY PER FRC LINE (operator only):**

```tsx
const handleLineDecision = async (lineId: string, decision: 'approved' | 'denied') => {
  const res = await apiFetch(`/api/v6/claims/${claimId}/lines/${lineId}`, {
    method: 'PATCH',
    body: JSON.stringify({ status: decision }),
  });
  if (res.ok) {
    refetch(); // Reload claim data
    toast({ title: `Line ${decision}` });
  }
};
```

**ALSO FIX:**
- Add notes/comment input with submit
- Add status change dropdown with submit
- Add "Create Invoice" button that navigates to CreateInvoice with claimId
- Show manufacturer preauth# and claim# fields (editable by operator)

---

## STEP 7: FIX ALL navigate() CALLS

**Current state:** `navigate('claim-detail')` without passing claim ID.

**FIX:** Search entire codebase for navigate calls to claim-related pages and fix:

```bash
grep -rn "navigate.*claim" client/src/pages/ --include="*.tsx"
grep -rn "navigate.*detail" client/src/pages/ --include="*.tsx"
grep -rn "navigate.*batch" client/src/pages/ --include="*.tsx"
```

**REPLACE** every broken navigate:
- `navigate('claim-detail')` → `navigate(\`claims/${claim.id}\`)`
- `navigate('claims')` → keep (list view is fine without ID)
- `navigate('batch-review')` → `navigate(\`batch-review/${batch.id}\`)`

**ALSO FIX:** Ensure the V7 router has parameterized routes:
- `/operator/admin/claims/:claimId` → ClaimDetail
- `/operator/admin/batch-review/:batchId` → BatchReview
- `/:dealerId/owner/claims/:claimId` → ClaimDetail
- `/:dealerId/staff/claims/:claimId` → ClaimDetail
- `/:dealerId/client/claims/:claimId` → ClaimDetail

---

## STEP 8: WIRE ProcessingQueue.tsx (Operator Reviews Incoming)

**Current state:** Fetches /api/batches — functional but needs enhancement.

**V6 had:** Queue with filter by status/dealer/date, click-through to batch review, "Assign to Me" action.

**ADD:**
- "Assign to Me" button per batch → PATCH /api/batches/:id { assignedTo: currentUser.id }
- Click row → navigate to BatchReview with batch ID
- Filter by: status (uploaded/in-review/processed), dealer, date range
- Show: dealer name, unit VIN, photo count, date submitted, assigned operator

---

## STEP 9: WIRE BatchReview.tsx (Operator Builds Claim from Batch)

**Current state:** Review UI exists but not connected to claim creation.

**V6 had:** Review photos → assign FRC codes per item → create claim from batch.

**WIRE:**
- Load batch by ID from URL params
- Display photos in grid
- For each photo/item, allow operator to:
  - Select manufacturer (auto from unit)
  - Select FRC complaint code
  - Select FRC cause code
  - Select FRC correct code
  - Add notes
- "Create Claim" button:
  - POST /api/v6/claims with unitId, dealershipId, status: 'submitted'
  - POST FRC lines for each item
  - Link batch photos to claim
  - PATCH batch status to 'processed'
  - Navigate to ClaimDetail with new claim ID

---

## STEP 10: WIRE CreateInvoice.tsx (Dynamic Row Builder)

**Current state:** Static table with hardcoded rows. Quick Add buttons are no-ops.

**V6 had:** `addServiceRow()` and `addPartRow()` with DOM manipulation. Dynamic add/remove rows.

**TRANSLATION TO REACT STATE:**

```tsx
const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);
const [partRows, setPartRows] = useState<PartRow[]>([]);

const addServiceRow = () => {
  setServiceRows(prev => [...prev, { 
    id: crypto.randomUUID(),
    description: '', 
    hours: 0, 
    rate: 0, 
    total: 0 
  }]);
};

const addPartRow = () => {
  setPartRows(prev => [...prev, { 
    id: crypto.randomUUID(),
    partNumber: '', 
    description: '', 
    quantity: 1, 
    unitPrice: 0, 
    total: 0 
  }]);
};

const removeRow = (id: string, type: 'service' | 'part') => {
  if (type === 'service') setServiceRows(prev => prev.filter(r => r.id !== id));
  else setPartRows(prev => prev.filter(r => r.id !== id));
};

const subtotal = [...serviceRows, ...partRows].reduce((sum, r) => sum + r.total, 0);
const discount = discountAmount; // from state
const total = subtotal - discount;

// Submit
const handleSave = async () => {
  const res = await apiFetch('/api/invoices', {
    method: 'POST',
    body: JSON.stringify({
      dealershipId,
      claimId, // if linked to a claim
      lineItems: [
        ...serviceRows.map(r => ({ type: 'service', ...r })),
        ...partRows.map(r => ({ type: 'part', ...r })),
      ],
      subtotal,
      discount,
      total,
      status: 'draft',
    }),
  });
  if (res.ok) {
    const invoice = await res.json();
    toast({ title: 'Invoice created' });
    navigate(`invoices/${invoice.id}`);
  }
};
```

---

## STEP 11: MOUNT CLERK WEBHOOK

**Current state:** server/routes/clerk-webhook.ts exists but is NOT imported in server/routes/index.ts.

**FIX:**
1. Open server/routes/index.ts
2. Add import: `import clerkWebhookRouter from './clerk-webhook';`
3. Mount it: `app.use('/api/clerk-webhook', clerkWebhookRouter);`
4. Verify the webhook handles user.created, user.updated, user.deleted events
5. Verify it syncs to the local users table

---

## STEP 12: VERIFY END-TO-END

After all wiring is complete, trace the full claims lifecycle:

1. **Dealer Owner** logs in → navigates to Upload Photos
2. Selects a unit → uploads 3+ photos → photos appear as thumbnails
3. Clicks "Push to Claim" → batch created in DB → operator notified
4. **Operator Admin** logs in → sees batch in Processing Queue
5. Clicks batch → BatchReview loads with photos
6. Assigns FRC codes per photo → clicks "Create Claim"
7. Claim created → navigates to ClaimDetail → ALL data renders (no "—" values)
8. Operator approves 2 FRC lines, denies 1 → status updates per line
9. Operator clicks "Create Invoice" → CreateInvoice opens with claim linked
10. Adds 2 service rows + 1 part row → saves → invoice created
11. **Dealer Owner** navigates to My Claims → sees claim with updated status
12. Clicks claim → ClaimDetail shows approved/denied lines + photos
13. **Customer** navigates to Claim Status → sees simplified claim tracking

**For each step, verify:**
- [ ] Page loads without console errors
- [ ] Data comes from API (not hardcoded)
- [ ] Buttons trigger real API calls (not alert() or empty handlers)
- [ ] Navigation passes entity IDs
- [ ] RBAC enforced (dealer can't see other dealer's claims, client can't see operator views)

---

## CRITICAL RULES

1. **DO NOT** create new stub pages. Every button you touch must call a real API endpoint.
2. **DO NOT** use alert() or console.log() as handlers. Real API calls only.
3. **DO NOT** hardcode mock data. Use useQuery/apiFetch to fetch from the server.
4. **DO NOT** use innerHTML or getElementById. Use React state and JSX.
5. **DO NOT** break the existing portal.css design system. Keep all class names intact.
6. **DO NOT** modify layout files or sidebar navigation. Only modify page content components.
7. **DO** preserve all existing V7 styling and component structure.
8. **DO** use the existing apiFetch helper from client/src/lib/api.ts.
9. **DO** use existing useQuery patterns from other LIVE pages (Dashboard, FRCCodes).
10. **DO** add proper TypeScript types for all API responses.

---

## EXECUTION COMMAND

```
claude --dangerously-skip-permissions -p "Read V6-V7-CLAIMS-MIGRATION.md in the project root. Execute all 12 steps in order. For Step 1, read the V6 portal files and extract every claims-related function. For Steps 4-10, translate V6 DOM logic into React state/hooks/API patterns and wire into V7 page components. For Step 11, mount the Clerk webhook. For Step 12, trace the full lifecycle and fix any gaps. Do NOT create stubs — every handler must call a real API. When complete, print CLAIMS MODULE MIGRATION COMPLETE and list every file modified."
```
