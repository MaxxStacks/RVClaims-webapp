# PHASE2A-AUTONOMOUS.md
## DS360 Phase 2 Run 2A — Email Worker + Photo Upload + Parts Workflow

**Mode:** `claude --dangerously-skip-permissions`
**Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing `PHASE2A-DEPLOY-REPORT.md`.**

**This run delivers three coherent additions: email actually sends now, photos can be uploaded and viewed on claims, and Parts becomes the second working domain (after Claims).**

---

## What this run delivers

### A. Email Worker (Resend)
- Background interval (every 30s) reads `notification_deliveries` rows where `channel='email'` and `status='pending'`
- Sends each via Resend SDK
- Marks `status='sent'` (or `failed` with error message)
- Logs to `email_events` table for audit trail
- Email template: branded HTML with DS360 navy header + body content + CTA button
- `EMAIL_FROM` env var used as sender

### B. Photo Upload + R2 Storage
- Backend endpoint `POST /api/v6/uploads/presign` — returns presigned PUT URL + photo record ID
- Backend endpoint `POST /api/v6/uploads/confirm/:photoId` — marks photo as uploaded after client puts to R2
- Photos linked to claims via `photo_batches` and `photos` tables (already in schema)
- Frontend: PhotoGallery component on claim detail (lazy-loads thumbnails from R2 public URL)
- Frontend: PhotoUploader component (drag-drop OR file picker, multi-file, progress bars)
- Wired into DealerClaimsPage → claim detail view + ClaimQueuePage → claim detail view
- Each photo upload fires `claim.photo_added` event → operator gets notification

### C. Parts Workflow End-to-End
- 12 Parts events wired through event bus (full fan-out catalog inline)
- Backend API `/api/v6/parts-orders` (warranty parts, dealer-side) and `/api/v6/parts-store` (retail parts, client-side)
- Operator Portal: Parts Management page (active orders, supplier sync placeholder)
- Dealer Portal: Parts Orders page tied to approved claims, Parts Store fulfillment view
- Client Portal: Parts Store browse + cart + checkout (Stripe placeholder for now), order tracking
- Notifications fire on: order placed, submitted to supplier, shipped, received, store order placed, fulfilled, delivered

---

## Inputs

| Item | Where |
|---|---|
| `PHASE2A-AUTONOMOUS.md` | Project root (this file) |
| Railway env vars | Already configured: RESEND_API_KEY, EMAIL_FROM, R2_ACCOUNT_ID, R2_ACCESS_KEY_ID, R2_SECRET_ACCESS_KEY, R2_BUCKET_NAME, R2_PUBLIC_URL |
| Stripe keys | NOT required for this run — client checkout uses placeholder UI |
| Existing files | event-bus.ts, claims-v6.ts, all 4 V6 portals from Phase 1D |

---

## Step 1 — Backups

```bash
mkdir -p .pre-phase2a-bak
cp shared/schema.ts .pre-phase2a-bak/schema.ts
cp server/lib/event-bus.ts .pre-phase2a-bak/event-bus.ts 2>/dev/null || true
cp -r client/src/components .pre-phase2a-bak/components-bak 2>/dev/null || true
cp client/src/pages/OperatorPortalV6.tsx .pre-phase2a-bak/
cp client/src/pages/DealerPortalV6.tsx .pre-phase2a-bak/
cp client/src/pages/ClientPortalV6.tsx .pre-phase2a-bak/
echo "Backups complete"
```

---

## Step 2 — Install dependencies

```bash
npm install resend @aws-sdk/client-s3 @aws-sdk/s3-request-presigner
```

(R2 is S3-compatible so AWS SDK works. No Cloudflare-specific package needed.)

---

## Step 3 — Email worker

Create `server/lib/email-worker.ts`:

```ts
// server/lib/email-worker.ts — Sends pending email notification_deliveries via Resend
import { Resend } from "resend";
import { db } from "../db";
import { notificationDeliveries, emailEvents, users } from "@shared/schema";
import { eq, and, sql } from "drizzle-orm";

const resend = new Resend(process.env.RESEND_API_KEY!);
const FROM = process.env.EMAIL_FROM || "notifications@dealersuite360.com";
const APP_URL = process.env.APP_URL || "https://dealersuite360.com";
const POLL_INTERVAL_MS = 30_000; // 30s
const BATCH_SIZE = 25;

let started = false;

function renderEmailHTML(opts: {
  title: string; body: string; ctaLabel?: string | null; ctaRoute?: string | null;
  recipientName?: string;
}): string {
  const ctaButton = opts.ctaLabel && opts.ctaRoute ? `
    <table cellpadding="0" cellspacing="0" border="0" style="margin:24px 0;">
      <tr><td bgcolor="#033280" style="border-radius:6px;">
        <a href="${APP_URL}${opts.ctaRoute}" style="display:inline-block;padding:12px 24px;color:#ffffff;text-decoration:none;font-weight:600;font-family:Inter,system-ui,sans-serif;font-size:14px;">${opts.ctaLabel}</a>
      </td></tr>
    </table>` : "";

  const greeting = opts.recipientName ? `<p style="margin:0 0 12px;font-size:14px;color:#333;">Hi ${opts.recipientName},</p>` : "";

  return `<!DOCTYPE html>
<html><head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:Inter,-apple-system,BlinkMacSystemFont,sans-serif;">
  <table cellpadding="0" cellspacing="0" border="0" width="100%" style="max-width:600px;margin:24px auto;background:#ffffff;border-radius:8px;overflow:hidden;box-shadow:0 2px 8px rgba(3,50,128,0.08);">
    <tr><td bgcolor="#033280" style="padding:20px 28px;">
      <h1 style="margin:0;font-size:18px;color:#ffffff;font-weight:600;letter-spacing:-0.2px;">DealerSuite 360</h1>
    </td></tr>
    <tr><td style="padding:28px;">
      ${greeting}
      <h2 style="margin:0 0 12px;font-size:16px;color:#033280;font-weight:600;">${opts.title}</h2>
      <div style="font-size:14px;color:#333;line-height:1.5;">${opts.body}</div>
      ${ctaButton}
      <p style="margin:24px 0 0;font-size:11px;color:#999;">You're receiving this because of activity on your DealerSuite 360 account. <a href="${APP_URL}" style="color:#033280;">Sign in</a> to manage notifications.</p>
    </td></tr>
    <tr><td bgcolor="#f4f6f9" style="padding:14px 28px;text-align:center;">
      <p style="margin:0;font-size:11px;color:#888;">DealerSuite 360 — RV Dealership Operating System</p>
    </td></tr>
  </table>
</body></html>`;
}

async function processBatch(): Promise<{ sent: number; failed: number }> {
  const pending = await db.select({
    id: notificationDeliveries.id,
    recipientUserId: notificationDeliveries.recipientUserId,
    title: notificationDeliveries.title,
    body: notificationDeliveries.body,
    ctaLabel: notificationDeliveries.ctaLabel,
    ctaRoute: notificationDeliveries.ctaRoute,
    surface: notificationDeliveries.surface,
  }).from(notificationDeliveries).where(and(
    eq(notificationDeliveries.channel, "email"),
    eq(notificationDeliveries.status, "pending"),
  )).limit(BATCH_SIZE);

  if (pending.length === 0) return { sent: 0, failed: 0 };

  let sent = 0, failed = 0;
  for (const d of pending) {
    try {
      // Look up recipient
      const [user] = await db.select({
        email: users.email,
        firstName: users.firstName,
      }).from(users).where(eq(users.id, d.recipientUserId)).limit(1);

      if (!user || !user.email) {
        await db.update(notificationDeliveries).set({
          status: "failed",
          failureReason: "recipient not found or no email",
          updatedAt: new Date(),
        }).where(eq(notificationDeliveries.id, d.id));
        failed++;
        continue;
      }

      const html = renderEmailHTML({
        title: d.title || "Update from DealerSuite 360",
        body: d.body || "",
        ctaLabel: d.ctaLabel,
        ctaRoute: d.ctaRoute,
        recipientName: user.firstName || undefined,
      });

      const result = await resend.emails.send({
        from: FROM,
        to: user.email,
        subject: d.title || "Update from DealerSuite 360",
        html,
      });

      if (result.error) {
        await db.update(notificationDeliveries).set({
          status: "failed",
          failureReason: String(result.error),
          updatedAt: new Date(),
        }).where(eq(notificationDeliveries.id, d.id));
        await db.insert(emailEvents).values({
          deliveryId: d.id,
          eventType: "send_failed",
          payload: { error: String(result.error) },
        });
        failed++;
      } else {
        await db.update(notificationDeliveries).set({
          status: "sent",
          sentAt: new Date(),
          providerMessageId: (result.data as any)?.id || null,
          updatedAt: new Date(),
        }).where(eq(notificationDeliveries.id, d.id));
        await db.insert(emailEvents).values({
          deliveryId: d.id,
          eventType: "sent",
          providerMessageId: (result.data as any)?.id || null,
        });
        sent++;
      }
    } catch (err: any) {
      await db.update(notificationDeliveries).set({
        status: "failed",
        failureReason: err.message || String(err),
        updatedAt: new Date(),
      }).where(eq(notificationDeliveries.id, d.id));
      failed++;
    }
  }
  return { sent, failed };
}

export function startEmailWorker() {
  if (started) return;
  if (!process.env.RESEND_API_KEY) {
    console.warn("[email-worker] RESEND_API_KEY not set — worker disabled");
    return;
  }
  started = true;
  console.log("[email-worker] Started, polling every 30s");

  const tick = async () => {
    try {
      const { sent, failed } = await processBatch();
      if (sent + failed > 0) {
        console.log(`[email-worker] sent=${sent} failed=${failed}`);
      }
    } catch (err) {
      console.error("[email-worker] tick error:", err);
    }
  };

  // First tick immediately, then on interval
  tick();
  setInterval(tick, POLL_INTERVAL_MS);
}
```

**Schema check:** `notification_deliveries` may not have `failureReason`, `sentAt`, `providerMessageId`, `updatedAt` columns. Verify in `shared/schema.ts`. If missing, add them now to the table definition:

```ts
  failureReason: text("failure_reason"),
  sentAt: timestamp("sent_at"),
  providerMessageId: text("provider_message_id"),
  updatedAt: timestamp("updated_at"),
```

Verify `email_events` table has `deliveryId`, `eventType`, `payload`, `providerMessageId`. If missing, add and run drizzle-kit generate + push.

**Wire into server startup.** Find the main server entry (likely `server/index.ts`). After all routes mount and the server starts listening, add:

```ts
import { startEmailWorker } from "./lib/email-worker";
// ...after app.listen():
startEmailWorker();
```

---

## Step 4 — R2 Photo Upload Backend

Create `server/lib/r2.ts`:

```ts
// server/lib/r2.ts — Cloudflare R2 client + presigned URL helpers
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID!;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const BUCKET = process.env.R2_BUCKET_NAME || "ds360-uploads";
const PUBLIC_URL = process.env.R2_PUBLIC_URL!.replace(/\/$/, "");

export const r2 = new S3Client({
  region: "auto",
  endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: { accessKeyId: ACCESS_KEY, secretAccessKey: SECRET_KEY },
});

export interface PresignResult {
  uploadUrl: string;
  publicUrl: string;
  storageKey: string;
}

/**
 * Generate a presigned PUT URL for client-side uploads.
 * Path pattern: claims/<claimId>/<uuid>.<ext>  OR  units/<unitId>/<uuid>.<ext>
 */
export async function presignUpload(opts: {
  scope: "claims" | "units" | "general";
  scopeId?: string;
  contentType: string;
  filename?: string;
}): Promise<PresignResult> {
  const ext = opts.filename?.split(".").pop()?.toLowerCase() || "jpg";
  const safeExt = /^[a-z0-9]{1,5}$/.test(ext) ? ext : "bin";
  const id = randomUUID();
  const storageKey = opts.scope === "general"
    ? `general/${id}.${safeExt}`
    : `${opts.scope}/${opts.scopeId}/${id}.${safeExt}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
    ContentType: opts.contentType,
  });
  const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 3600 });
  const publicUrl = `${PUBLIC_URL}/${storageKey}`;
  return { uploadUrl, publicUrl, storageKey };
}
```

Create `server/routes/uploads-v6.ts`:

```ts
import { Router, type Request, type Response } from "express";
import { db } from "../db";
import { photoBatches, photos, claims } from "@shared/schema";
import { eq, and } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { presignUpload } from "../lib/r2";
import { emitEvent } from "../lib/event-bus";

const router = Router();
router.use(requireAuth);

// POST /api/v6/uploads/presign
// body: { scope: "claims"|"units", scopeId, filename, contentType }
router.post("/presign", async (req: Request, res: Response) => {
  const { scope, scopeId, filename, contentType, photoType } = req.body;
  if (!scope || !contentType) return res.status(400).json({ error: "scope and contentType required" });
  if (!["image/jpeg", "image/png", "image/webp", "image/heic"].includes(contentType)) {
    return res.status(400).json({ error: "Unsupported content type" });
  }

  const presigned = await presignUpload({ scope, scopeId, contentType, filename });

  // Create a photo row in pending state
  const [photo] = await db.insert(photos).values({
    storageKey: presigned.storageKey,
    publicUrl: presigned.publicUrl,
    contentType,
    uploadStatus: "pending",
    uploadedById: req.user!.id,
    photoType: photoType || "general",
    scope: scope,
    scopeId: scopeId || null,
  }).returning();

  res.json({
    photoId: photo.id,
    uploadUrl: presigned.uploadUrl,
    publicUrl: presigned.publicUrl,
  });
});

// POST /api/v6/uploads/confirm/:photoId
// Called by client after R2 PUT succeeds. Marks photo as uploaded and fires event.
router.post("/confirm/:photoId", async (req: Request, res: Response) => {
  const [photo] = await db.select().from(photos).where(eq(photos.id, req.params.photoId)).limit(1);
  if (!photo) return res.status(404).json({ error: "Photo not found" });
  if (photo.uploadedById !== req.user!.id) return res.status(403).json({ error: "Forbidden" });

  await db.update(photos).set({
    uploadStatus: "uploaded",
    uploadedAt: new Date(),
  }).where(eq(photos.id, photo.id));

  // If linked to a claim, fire claim.photo_added
  if (photo.scope === "claims" && photo.scopeId) {
    const [claim] = await db.select().from(claims).where(eq(claims.id, photo.scopeId)).limit(1);
    if (claim) {
      await emitEvent({
        eventId: "claim.photo_added",
        domain: "Claims",
        actorUserId: req.user!.id,
        actorRole: req.user!.role,
        dealershipId: claim.dealershipId,
        targetEntityType: "claim",
        targetEntityId: claim.id,
        payload: {
          claimNumber: claim.claimNumber,
          dealerName: req.user!.firstName + " " + req.user!.lastName,
          photoUrl: photo.publicUrl,
        },
      });
    }
  }

  res.json({ ok: true, publicUrl: photo.publicUrl });
});

// GET /api/v6/uploads/by-claim/:claimId
router.get("/by-claim/:claimId", async (req: Request, res: Response) => {
  // RBAC: caller must have access to this claim
  const [claim] = await db.select().from(claims).where(eq(claims.id, req.params.claimId)).limit(1);
  if (!claim) return res.status(404).json({ error: "Not found" });

  const u = req.user!;
  if ((u.role === "dealer_owner" || u.role === "dealer_staff") && claim.dealershipId !== u.dealershipId) {
    return res.status(403).json({ error: "Forbidden" });
  }
  // Operators see all; clients are checked in claim get; here we trust the claim get already filtered

  const rows = await db.select().from(photos).where(and(
    eq(photos.scope, "claims"),
    eq(photos.scopeId, req.params.claimId),
    eq(photos.uploadStatus, "uploaded"),
  ));
  res.json(rows);
});

export default router;
```

**Schema check for `photos` table** in `shared/schema.ts`. Required columns: `id, storageKey, publicUrl, contentType, uploadStatus, uploadedById, uploadedAt, photoType, scope, scopeId`. If any missing, add them and run drizzle-kit generate + push.

Mount in main routes file:
```ts
import uploadsRouter from "./routes/uploads-v6";
app.use("/api/v6/uploads", uploadsRouter);
```

**Update CSP** to allow uploads to R2. In the server CSP config, add to `connect-src`:
```
https://*.r2.cloudflarestorage.com
https://*.r2.dev
```

And to `img-src`:
```
https://*.r2.dev
https://*.r2.cloudflarestorage.com
[your R2_PUBLIC_URL host]
```

---

## Step 5 — Frontend: PhotoUploader + PhotoGallery

Create `client/src/components/PhotoUploader.tsx`:

```tsx
import { useState, useRef } from "react";
import { useApiFetch } from "@/lib/api";

interface Props {
  scope: "claims" | "units";
  scopeId: string;
  photoType?: string;
  onUploadComplete?: (publicUrl: string) => void;
}

interface UploadingFile {
  name: string;
  progress: number;
  status: "uploading" | "done" | "error";
  publicUrl?: string;
  error?: string;
}

export default function PhotoUploader({ scope, scopeId, photoType = "general", onUploadComplete }: Props) {
  const apiFetch = useApiFetch();
  const inputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<UploadingFile[]>([]);
  const [dragOver, setDragOver] = useState(false);

  async function uploadOne(file: File): Promise<void> {
    const idx = uploads.length;
    const upload: UploadingFile = { name: file.name, progress: 0, status: "uploading" };
    setUploads(prev => [...prev, upload]);

    try {
      // 1. presign
      const { photoId, uploadUrl, publicUrl } = await apiFetch<{
        photoId: string; uploadUrl: string; publicUrl: string;
      }>("/api/v6/uploads/presign", {
        method: "POST",
        body: JSON.stringify({
          scope, scopeId, filename: file.name, contentType: file.type, photoType,
        }),
      });

      // 2. PUT to R2
      const xhr = new XMLHttpRequest();
      xhr.open("PUT", uploadUrl);
      xhr.setRequestHeader("Content-Type", file.type);
      await new Promise<void>((resolve, reject) => {
        xhr.upload.onprogress = (ev) => {
          if (ev.lengthComputable) {
            const pct = Math.round((ev.loaded / ev.total) * 100);
            setUploads(prev => prev.map((u, i) => i === idx ? { ...u, progress: pct } : u));
          }
        };
        xhr.onload = () => xhr.status >= 200 && xhr.status < 300 ? resolve() : reject(new Error(`R2 PUT failed: ${xhr.status}`));
        xhr.onerror = () => reject(new Error("R2 PUT network error"));
        xhr.send(file);
      });

      // 3. confirm
      await apiFetch(`/api/v6/uploads/confirm/${photoId}`, { method: "POST" });

      setUploads(prev => prev.map((u, i) => i === idx ? { ...u, status: "done", progress: 100, publicUrl } : u));
      onUploadComplete?.(publicUrl);
    } catch (err: any) {
      setUploads(prev => prev.map((u, i) => i === idx ? { ...u, status: "error", error: err.message } : u));
    }
  }

  function handleFiles(files: FileList | null) {
    if (!files) return;
    Array.from(files).forEach(uploadOne);
  }

  return (
    <div>
      <div
        onClick={() => inputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        style={{
          border: `2px dashed ${dragOver ? "#033280" : "#d5dbe5"}`,
          borderRadius: 8,
          padding: 24,
          textAlign: "center",
          cursor: "pointer",
          background: dragOver ? "#f0f5ff" : "#fafbfd",
          transition: "all 150ms",
        }}
      >
        <div style={{fontSize: 13, color: "#666"}}>
          📷 Drag photos here or <span style={{color: "#033280", fontWeight: 600}}>click to browse</span>
        </div>
        <div style={{fontSize: 11, color: "#999", marginTop: 4}}>JPG, PNG, WebP, HEIC up to 10MB each</div>
        <input
          ref={inputRef}
          type="file"
          multiple
          accept="image/jpeg,image/png,image/webp,image/heic"
          onChange={(e) => handleFiles(e.target.files)}
          style={{display: "none"}}
        />
      </div>

      {uploads.length > 0 && (
        <div style={{marginTop: 12, display: "grid", gap: 6}}>
          {uploads.map((u, i) => (
            <div key={i} style={{
              padding: "8px 12px",
              background: u.status === "error" ? "#fee" : u.status === "done" ? "#efe" : "#f7f9fc",
              borderRadius: 6,
              fontSize: 12,
              display: "flex",
              alignItems: "center",
              gap: 10,
            }}>
              <div style={{flex: 1}}>
                <div>{u.name}</div>
                {u.status === "uploading" && (
                  <div style={{height: 4, background: "#e5eaf2", borderRadius: 2, marginTop: 4, overflow: "hidden"}}>
                    <div style={{width: `${u.progress}%`, height: "100%", background: "#033280"}}/>
                  </div>
                )}
              </div>
              <div style={{fontSize: 11, color: u.status === "error" ? "#c0392b" : "#666"}}>
                {u.status === "uploading" ? `${u.progress}%` : u.status === "done" ? "✓" : `Error: ${u.error}`}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
```

Create `client/src/components/PhotoGallery.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

interface Props {
  claimId: string;
  refreshKey?: number; // bump this to refetch
}

export default function PhotoGallery({ claimId, refreshKey = 0 }: Props) {
  const apiFetch = useApiFetch();
  const [photos, setPhotos] = useState<any[]>([]);
  const [lightbox, setLightbox] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<any[]>(`/api/v6/uploads/by-claim/${claimId}`).then(setPhotos).catch(() => setPhotos([]));
  }, [claimId, refreshKey]);

  if (photos.length === 0) {
    return <div style={{padding: 16, color: "#888", fontSize: 12, textAlign: "center"}}>No photos uploaded yet.</div>;
  }

  return (
    <>
      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(120px, 1fr))", gap: 8}}>
        {photos.map(p => (
          <div
            key={p.id}
            onClick={() => setLightbox(p.publicUrl)}
            style={{
              aspectRatio: "1 / 1",
              borderRadius: 6,
              backgroundImage: `url(${p.publicUrl})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
              cursor: "pointer",
              border: "1px solid #e5eaf2",
            }}
          />
        ))}
      </div>

      {lightbox && (
        <div
          onClick={() => setLightbox(null)}
          style={{
            position: "fixed", inset: 0, background: "rgba(0,0,0,0.85)",
            zIndex: 2000, display: "flex", alignItems: "center", justifyContent: "center",
            cursor: "pointer", padding: 20,
          }}
        >
          <img src={lightbox} style={{maxWidth: "100%", maxHeight: "100%", borderRadius: 8}} />
        </div>
      )}
    </>
  );
}
```

---

## Step 6 — Wire photo components into existing claim pages

In `client/src/components/dealer/DealerClaimsPage.tsx`, add a claim detail view that opens when a row is clicked. The claim detail panel should include:
- Status timeline
- PhotoGallery
- PhotoUploader

For simplicity in this run, add a click handler on each row that opens a side-panel (or modal) showing the claim detail with photo upload + gallery. Pseudocode for the addition:

```tsx
import PhotoUploader from "@/components/PhotoUploader";
import PhotoGallery from "@/components/PhotoGallery";

// add state:
const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
const [refreshKey, setRefreshKey] = useState(0);

// in the row's onClick:
<tr onClick={() => setSelectedClaimId(c.id)} style={{cursor:"pointer", ...}}>

// after the table:
{selectedClaimId && (
  <div style={{
    position:"fixed", top:0, right:0, bottom:0, width:520, background:"white",
    boxShadow:"-4px 0 20px rgba(0,0,0,0.1)", overflowY:"auto", zIndex:900, padding:24,
  }}>
    <div style={{display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:16}}>
      <h2 style={{margin:0, fontSize:18}}>Claim Details</h2>
      <button onClick={() => setSelectedClaimId(null)} style={{background:"none",border:0,fontSize:20,cursor:"pointer"}}>×</button>
    </div>
    <h3 style={{fontSize:13, marginTop:24}}>Photos</h3>
    <PhotoGallery claimId={selectedClaimId} refreshKey={refreshKey} />
    <div style={{marginTop:16}}>
      <PhotoUploader
        scope="claims"
        scopeId={selectedClaimId}
        photoType="claim_evidence"
        onUploadComplete={() => setRefreshKey(k => k + 1)}
      />
    </div>
  </div>
)}
```

Also add the same pattern to `client/src/components/operator/ClaimQueuePage.tsx` so operators can see/add photos when reviewing.

---

## Step 7 — Parts API backend

Create `server/routes/parts-v6.ts`:

```ts
import { Router, type Request, type Response } from "express";
import { db } from "../db";
import {
  partsOrders, partsOrderItems, claims, dealerships, units, users
} from "@shared/schema";
import { eq, and, or, desc, inArray } from "drizzle-orm";
import { requireAuth } from "../middleware/auth";
import { emitEvent } from "../lib/event-bus";

const router = Router();
router.use(requireAuth);

async function nextOrderNumber(): Promise<string> {
  const rows = await db.select({ n: partsOrders.orderNumber }).from(partsOrders);
  const max = rows.reduce((m, r) => {
    const n = parseInt((r.n || "").replace(/\D/g, ""), 10);
    return !isNaN(n) && n > m ? n : m;
  }, 0);
  return `PO-${String(max + 1).padStart(5, "0")}`;
}

// LIST parts orders (RBAC scoped)
router.get("/", async (req, res) => {
  const u = req.user!;
  let rows;
  if (["operator_admin", "operator_staff"].includes(u.role)) {
    rows = await db.select().from(partsOrders).orderBy(desc(partsOrders.createdAt)).limit(200);
  } else if (["dealer_owner", "dealer_staff"].includes(u.role)) {
    rows = await db.select().from(partsOrders)
      .where(eq(partsOrders.dealershipId, u.dealershipId!))
      .orderBy(desc(partsOrders.createdAt));
  } else {
    return res.status(403).json({ error: "Forbidden" });
  }
  res.json(rows);
});

// CREATE parts order (initiated by dealer or operator from approved claim)
router.post("/", async (req, res) => {
  const u = req.user!;
  if (!["operator_admin", "operator_staff", "dealer_owner", "dealer_staff"].includes(u.role)) {
    return res.status(403).json({ error: "Forbidden" });
  }
  const { claimId, items, supplier, dealershipId: dsIdInput } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ error: "items required (array)" });
  }

  // Resolve dealership
  let dealershipId = u.dealershipId;
  if (!dealershipId && dsIdInput) dealershipId = dsIdInput;
  if (claimId) {
    const [c] = await db.select().from(claims).where(eq(claims.id, claimId)).limit(1);
    if (c) dealershipId = c.dealershipId;
  }
  if (!dealershipId) return res.status(400).json({ error: "dealershipId required" });

  const orderNumber = await nextOrderNumber();
  const totalQty = items.reduce((s: number, i: any) => s + (i.quantity || 1), 0);

  const [order] = await db.insert(partsOrders).values({
    orderNumber,
    dealershipId,
    claimId: claimId || null,
    supplier: supplier || null,
    status: "initiated",
    totalQuantity: totalQty,
    initiatedById: u.id,
    initiatedAt: new Date(),
  }).returning();

  for (const it of items) {
    await db.insert(partsOrderItems).values({
      orderId: order.id,
      partNumber: it.partNumber,
      description: it.description || null,
      quantity: it.quantity || 1,
      unitCost: it.unitCost || null,
    });
  }

  const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, dealershipId)).limit(1);

  await emitEvent({
    eventId: "parts.order_initiated",
    domain: "Parts",
    actorUserId: u.id,
    actorRole: u.role,
    dealershipId,
    targetEntityType: "parts_order",
    targetEntityId: order.id,
    payload: {
      orderNumber: order.orderNumber,
      itemCount: items.length,
      totalQuantity: totalQty,
      dealerName: dealership?.name || "Dealer",
      claimId,
    },
  });

  res.status(201).json(order);
});

// TRANSITION parts order status (submit_supplier, ack, ship, receive)
router.post("/:id/transition", async (req, res) => {
  const u = req.user!;
  const { toStatus, supplierOrderRef, trackingNumber, carrier } = req.body;

  const [order] = await db.select().from(partsOrders).where(eq(partsOrders.id, req.params.id)).limit(1);
  if (!order) return res.status(404).json({ error: "Not found" });

  // Permission gates per status
  const updates: Record<string, any> = { status: toStatus };
  let eventId: string | null = null;

  if (toStatus === "submitted_to_supplier") {
    if (!["operator_admin", "operator_staff"].includes(u.role)) return res.status(403).json({ error: "Forbidden" });
    updates.submittedToSupplierAt = new Date();
    updates.supplierOrderRef = supplierOrderRef;
    eventId = "parts.order_submitted_supplier";
  } else if (toStatus === "supplier_ack") {
    updates.supplierAckAt = new Date();
    eventId = "parts.supplier_ack";
  } else if (toStatus === "shipped") {
    updates.shippedAt = new Date();
    updates.trackingNumber = trackingNumber || null;
    updates.carrier = carrier || null;
    eventId = "parts.shipped";
  } else if (toStatus === "received") {
    updates.receivedAt = new Date();
    eventId = "parts.received";
  } else {
    return res.status(400).json({ error: "Invalid status transition" });
  }

  await db.update(partsOrders).set(updates).where(eq(partsOrders.id, order.id));

  const [dealership] = await db.select().from(dealerships).where(eq(dealerships.id, order.dealershipId)).limit(1);

  if (eventId) {
    await emitEvent({
      eventId,
      domain: "Parts",
      actorUserId: u.id,
      actorRole: u.role,
      dealershipId: order.dealershipId,
      targetEntityType: "parts_order",
      targetEntityId: order.id,
      payload: {
        orderNumber: order.orderNumber,
        dealerName: dealership?.name || "Dealer",
        trackingNumber,
        carrier,
        supplierOrderRef,
      },
    });
  }

  res.json({ ok: true });
});

// GET single order with items
router.get("/:id", async (req, res) => {
  const [order] = await db.select().from(partsOrders).where(eq(partsOrders.id, req.params.id)).limit(1);
  if (!order) return res.status(404).json({ error: "Not found" });
  const items = await db.select().from(partsOrderItems).where(eq(partsOrderItems.orderId, order.id));
  res.json({ order, items });
});

export default router;
```

**Schema check:** verify `parts_orders` and `parts_order_items` tables exist in `shared/schema.ts`. If not (Phase 1A used `client_parts_orders` for the retail side but may not have warranty parts), add minimal tables:

```ts
export const PARTS_ORDER_STATUSES = ["initiated","submitted_to_supplier","supplier_ack","shipped","received","cancelled"] as const;

export const partsOrders = pgTable("parts_orders", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderNumber: text("order_number").notNull().unique(),
  dealershipId: uuid("dealership_id").notNull().references(() => dealerships.id),
  claimId: uuid("claim_id").references(() => claims.id),
  supplier: text("supplier"),
  status: text("status").notNull().default("initiated"),
  totalQuantity: integer("total_quantity").default(0),
  initiatedById: uuid("initiated_by_id").references(() => users.id),
  initiatedAt: timestamp("initiated_at"),
  submittedToSupplierAt: timestamp("submitted_to_supplier_at"),
  supplierOrderRef: text("supplier_order_ref"),
  supplierAckAt: timestamp("supplier_ack_at"),
  shippedAt: timestamp("shipped_at"),
  trackingNumber: text("tracking_number"),
  carrier: text("carrier"),
  receivedAt: timestamp("received_at"),
  createdAt: timestamp("created_at").defaultNow(),
});

export const partsOrderItems = pgTable("parts_order_items", {
  id: uuid("id").primaryKey().defaultRandom(),
  orderId: uuid("order_id").notNull().references(() => partsOrders.id, { onDelete: "cascade" }),
  partNumber: text("part_number").notNull(),
  description: text("description"),
  quantity: integer("quantity").default(1).notNull(),
  unitCost: numeric("unit_cost", { precision: 10, scale: 2 }),
});
```

Generate + apply migration after schema changes:
```bash
npx drizzle-kit generate
# inspect for DROP statements, then:
npx drizzle-kit push
```

Mount the route:
```ts
import partsRouter from "./routes/parts-v6";
app.use("/api/v6/parts-orders", partsRouter);
```

---

## Step 8 — Parts event fan-out catalog

Add to `server/lib/event-bus.ts` `CATALOG`:

```ts
"parts.order_initiated": [
  {
    to_roles: ["operator_admin", "operator_staff"],
    in_app: true, email: false, sms: "opt_in",
    priority: "informational",
    cta: { label: "Review parts order", route: "/operator-v6" },
    body_template: (p) => ({
      title: "New parts order initiated",
      body: `Order ${p.orderNumber} from ${p.dealerName} (${p.itemCount} items, ${p.totalQuantity} units)`,
    }),
  },
  {
    to_roles: ["dealer_owner", "dealer_staff"],
    in_app: true, email: false, sms: "opt_in",
    priority: "informational",
    body_template: (p) => ({
      title: "Parts order created",
      body: `Order ${p.orderNumber} created with ${p.itemCount} items`,
    }),
  },
],
"parts.order_submitted_supplier": [
  {
    to_roles: ["dealer_owner", "dealer_staff"],
    in_app: true, email: true, sms: "opt_in",
    priority: "informational",
    body_template: (p) => ({
      title: "Parts ordered from supplier",
      body: `Order ${p.orderNumber} sent to supplier. Ref: ${p.supplierOrderRef || "pending"}`,
    }),
  },
],
"parts.shipped": [
  {
    to_roles: ["dealer_owner", "dealer_staff"],
    in_app: true, email: true, sms: "opt_in",
    priority: "informational",
    body_template: (p) => ({
      title: "Parts shipped",
      body: `Order ${p.orderNumber} shipped via ${p.carrier || "courier"}. Tracking: ${p.trackingNumber || "—"}`,
    }),
  },
],
"parts.received": [
  {
    to_roles: ["dealer_owner", "dealer_staff"],
    in_app: true, email: true, sms: "opt_in",
    priority: "action_required",
    cta: { label: "Begin repair", route: "/dealer-v6" },
    body_template: (p) => ({
      title: "Parts received — repair can begin",
      body: `Order ${p.orderNumber} received. Repair work can now start on the associated claim.`,
    }),
  },
  {
    to_roles: ["operator_admin", "operator_staff"],
    in_app: true, email: false, sms: "opt_in",
    priority: "informational",
    body_template: (p) => ({
      title: "Dealer received parts",
      body: `${p.dealerName} confirmed receipt of order ${p.orderNumber}`,
    }),
  },
],
// Parts Store events follow similar pattern — abbreviated:
"parts_store.order_placed": [
  {
    to_roles: ["dealer_owner", "dealer_staff"],
    in_app: true, email: true, sms: "opt_in",
    priority: "action_required",
    cta: { label: "Fulfill order", route: "/dealer-v6" },
    body_template: (p) => ({
      title: "New retail parts order",
      body: `Customer ${p.customerName || ""} placed order ${p.orderNumber} for ${p.itemCount} items.`,
    }),
  },
],
"parts_store.fulfilled": [
  {
    to_roles: ["client"],
    in_app: true, email: true, sms: "opt_in",
    priority: "informational",
    body_template: (p) => ({
      title: "Your order is being shipped",
      body: `Your order ${p.orderNumber} has been fulfilled and is on its way.`,
    }),
  },
],
"parts_store.delivered": [
  {
    to_roles: ["client"],
    in_app: true, email: true, sms: "opt_in",
    priority: "informational",
    body_template: (p) => ({
      title: "Order delivered",
      body: `Your order ${p.orderNumber} was delivered.`,
    }),
  },
],
```

---

## Step 9 — Parts UI: Operator + Dealer pages

Create `client/src/components/operator/PartsManagementPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

const STATUS_COLOR: Record<string, string> = {
  initiated: "#1e88e5",
  submitted_to_supplier: "#9b59b6",
  supplier_ack: "#0891b2",
  shipped: "#f48120",
  received: "#16a34a",
  cancelled: "#888",
};

export default function PartsManagementPage() {
  const apiFetch = useApiFetch();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const list = await apiFetch<any[]>("/api/v6/parts-orders");
      setOrders(list);
    } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  async function transition(id: string, toStatus: string, extras: any = {}) {
    await apiFetch(`/api/v6/parts-orders/${id}/transition`, {
      method: "POST", body: JSON.stringify({ toStatus, ...extras }),
    });
    await refresh();
  }

  return (
    <div style={{padding: 24}}>
      <h1 style={{fontSize: 22, fontWeight: 600, marginBottom: 16}}>Parts Management</h1>
      {loading ? <div>Loading...</div> : (
        <table style={{width: "100%", borderCollapse: "collapse"}}>
          <thead>
            <tr style={{borderBottom: "2px solid #eee", textAlign: "left", fontSize: 11, color: "#888"}}>
              <th style={{padding: 10}}>Order #</th>
              <th>Dealer</th>
              <th>Supplier</th>
              <th>Items</th>
              <th>Status</th>
              <th>Initiated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{borderBottom: "1px solid #f3f3f3", fontSize: 12}}>
                <td style={{padding: 10, fontWeight: 600}}>{o.orderNumber}</td>
                <td>{o.dealershipId?.slice(0,8)}...</td>
                <td>{o.supplier || "—"}</td>
                <td>{o.totalQuantity}</td>
                <td>
                  <span style={{padding: "2px 8px", borderRadius: 10, background: STATUS_COLOR[o.status] || "#888", color: "white", fontSize: 10, fontWeight: 600}}>
                    {o.status}
                  </span>
                </td>
                <td>{o.initiatedAt ? new Date(o.initiatedAt).toLocaleDateString() : "—"}</td>
                <td>
                  {o.status === "initiated" && (
                    <button onClick={() => transition(o.id, "submitted_to_supplier", { supplierOrderRef: prompt("Supplier ref?") })} style={{fontSize: 10, padding: "4px 8px", background: "#9b59b6", color: "white", border: 0, borderRadius: 4, cursor: "pointer"}}>
                      Submit to supplier
                    </button>
                  )}
                  {o.status === "submitted_to_supplier" && (
                    <button onClick={() => transition(o.id, "shipped", { trackingNumber: prompt("Tracking #?"), carrier: prompt("Carrier?") })} style={{fontSize: 10, padding: "4px 8px", background: "#f48120", color: "white", border: 0, borderRadius: 4, cursor: "pointer"}}>
                      Mark shipped
                    </button>
                  )}
                  {o.status === "shipped" && (
                    <button onClick={() => transition(o.id, "received")} style={{fontSize: 10, padding: "4px 8px", background: "#16a34a", color: "white", border: 0, borderRadius: 4, cursor: "pointer"}}>
                      Mark received
                    </button>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
```

Find the Operator V6 portal `master.ops.parts` page case (or similar — the v6 schema likely has a Parts page under operator ops) and replace with `<PartsManagementPage />`.

Create `client/src/components/dealer/DealerPartsOrdersPage.tsx`:

```tsx
import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

export default function DealerPartsOrdersPage() {
  const apiFetch = useApiFetch();
  const [orders, setOrders] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ supplier: "", items: "" });

  async function refresh() {
    const list = await apiFetch<any[]>("/api/v6/parts-orders");
    setOrders(list);
  }
  useEffect(() => { refresh(); }, []);

  async function submit() {
    // Items input: one per line, format "PART-NUM | description | qty"
    const items = form.items.split("\n").filter(l => l.trim()).map(l => {
      const [partNumber, description, qtyStr] = l.split("|").map(s => s.trim());
      return { partNumber, description, quantity: parseInt(qtyStr, 10) || 1 };
    });
    if (items.length === 0) { alert("Add at least one item"); return; }

    await apiFetch("/api/v6/parts-orders", {
      method: "POST",
      body: JSON.stringify({ supplier: form.supplier, items }),
    });
    setShowNew(false);
    setForm({ supplier: "", items: "" });
    await refresh();
  }

  return (
    <div style={{padding: 24}}>
      <div style={{display: "flex", justifyContent: "space-between", marginBottom: 16}}>
        <h1 style={{fontSize: 22, fontWeight: 600}}>Parts Orders</h1>
        <button onClick={() => setShowNew(true)} style={{padding: "8px 16px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer"}}>+ New Order</button>
      </div>

      {showNew && (
        <div style={{position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000}}>
          <div style={{background: "white", padding: 24, borderRadius: 8, minWidth: 520}}>
            <h2 style={{margin: "0 0 16px"}}>New Parts Order</h2>
            <div style={{display: "grid", gap: 10}}>
              <label style={{fontSize: 12}}>Supplier
                <input value={form.supplier} onChange={e => setForm({...form, supplier: e.target.value})} style={{width: "100%", padding: 8, marginTop: 4}} />
              </label>
              <label style={{fontSize: 12}}>Items (one per line: PART-NUM | description | qty)
                <textarea value={form.items} onChange={e => setForm({...form, items: e.target.value})} style={{width: "100%", padding: 8, marginTop: 4, minHeight: 120, fontFamily: "monospace", fontSize: 11}} placeholder="ABC-123 | Slide-out motor | 1&#10;XYZ-789 | Wiring harness | 2"/>
              </label>
              <div style={{display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end"}}>
                <button onClick={() => setShowNew(false)} style={{padding: "8px 14px", border: "1px solid #ccc", background: "white", borderRadius: 6, cursor: "pointer"}}>Cancel</button>
                <button onClick={submit} style={{padding: "8px 14px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer"}}>Create Order</button>
              </div>
            </div>
          </div>
        </div>
      )}

      <table style={{width: "100%", borderCollapse: "collapse"}}>
        <thead><tr style={{borderBottom: "2px solid #eee", textAlign: "left", fontSize: 11, color: "#888"}}>
          <th style={{padding: 10}}>Order #</th><th>Supplier</th><th>Qty</th><th>Status</th><th>Created</th>
        </tr></thead>
        <tbody>
          {orders.map(o => (
            <tr key={o.id} style={{borderBottom: "1px solid #f3f3f3", fontSize: 12}}>
              <td style={{padding: 10, fontWeight: 600}}>{o.orderNumber}</td>
              <td>{o.supplier || "—"}</td>
              <td>{o.totalQuantity}</td>
              <td>{o.status}</td>
              <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
```

Find the Dealer V6 portal page case for parts (likely `dealer.ops.parts_orders` or `dealer.ops.parts`) and wire it to render `<DealerPartsOrdersPage />`.

---

## Step 10 — Verify build

```bash
npm run check 2>&1 | tee phase2a-typecheck.log | tail -40
```

Filter for new files only:
```bash
npm run check 2>&1 | grep -E "email-worker|r2|uploads-v6|parts-v6|PhotoUploader|PhotoGallery|PartsManagement|DealerPartsOrders" | head -30
```

Fix new-file errors. Pre-existing errors in marketplace.ts/membership.ts/auctions.ts can be ignored.

```bash
npm run build 2>&1 | tee phase2a-build.log | tail -20
```

Build must succeed.

---

## Step 11 — Commit and push

```bash
git add -A
git commit -m "Phase 2A: email worker (Resend) + photo uploads (R2) + Parts workflow end-to-end"
git push origin main
```

Wait ~3 min for Railway to deploy.

---

## Step 12 — Smoke tests

```bash
# Webhook should be 401 without auth — that's success
curl -I https://dealersuite360.com/api/v6/parts-orders
curl -I https://dealersuite360.com/api/v6/uploads/by-claim/test

# Email worker should be visible in Railway logs:
# "[email-worker] Started, polling every 30s"

# Test the upload flow as logged-in user (manual via browser)
```

---

## Step 13 — Write deploy report

Create `PHASE2A-DEPLOY-REPORT.md` in project root:

```markdown
# Phase 2A Deploy Report

## Summary
- Email worker live — sends pending notification_deliveries via Resend every 30s
- R2 photo uploads working: presign → PUT → confirm → fires claim.photo_added
- PhotoUploader + PhotoGallery components on dealer claim detail + operator claim detail
- Parts workflow end-to-end: backend API + 12 events + operator + dealer pages
- 7 Parts events wired into event bus catalog with full fan-out

## Files added
- server/lib/email-worker.ts
- server/lib/r2.ts
- server/routes/uploads-v6.ts
- server/routes/parts-v6.ts
- client/src/components/PhotoUploader.tsx
- client/src/components/PhotoGallery.tsx
- client/src/components/operator/PartsManagementPage.tsx
- client/src/components/dealer/DealerPartsOrdersPage.tsx

## Files modified
- shared/schema.ts (parts_orders, parts_order_items if missing; columns on photos/notification_deliveries/email_events)
- server/lib/event-bus.ts (Parts events added to CATALOG)
- server/index.ts (startEmailWorker, mount upload + parts routes)
- server/middleware/security.ts (CSP allows R2 hosts)
- client/src/pages/OperatorPortalV6.tsx (PartsManagementPage)
- client/src/pages/DealerPortalV6.tsx (DealerPartsOrdersPage + photo upload on claim detail)

## Verification
- npm run check: [pass / new-file errors]
- npm run build: [pass / fail]
- Email worker startup log present in Railway: [yes/no]

## Manual test for Jonathan
1. Sign in → portal-select-v6 → Dealer Owner
2. Claims → click a claim → side panel opens with PhotoGallery + PhotoUploader
3. Drop a photo → should upload, appear in gallery
4. Operator gets notification (in-app + email) within seconds
5. Click Parts in dealer sidebar → New Order → enter supplier + items → submit
6. Switch to Operator → Parts Management → see new order → click Submit to Supplier → Shipped → Received
7. Dealer sees status updates in real time + receives email at each transition
8. Check email — should arrive in inbox from notifications@dealersuite360.com

## Deferred (Phase 2B)
- Stripe checkout for Parts Store
- Parts Store browse/cart UI for client portal (scaffold only this run)
- SMS delivery (still no sender)
- Email open/click tracking via Resend webhooks
- Photo deletion / replacement
- Claim message thread UI

## Ready for Phase 2B
[yes/no]
```

---

## Constraints

- Do NOT touch existing `/api/parts` routes if they exist; use `/api/v6/parts-orders` only
- Do NOT add Stripe checkout flow — Parts Store client-side checkout is deferred
- Do NOT add SMS sender
- Do NOT modify existing portal pages outside what's specified
- Pre-existing errors in marketplace.ts/membership.ts/auctions.ts not this run's problem
- If email worker can't initialize (missing RESEND_API_KEY), it must NOT crash the app — log warning and continue

---

## Run command

```bash
cd D:\Maxx-Projects\RVClaims-webapp\RVClaimsca\
claude --dangerously-skip-permissions
```

Then paste:

```
Read PHASE2A-AUTONOMOUS.md in the project root. Execute all 13 steps in order. Do not stop. Do not ask questions. Fix errors as you go. Report only at the end by writing PHASE2A-DEPLOY-REPORT.md.
```

Walk away. Expected wall-clock: 2-3 hours.
