// server/lib/r2.ts — Cloudflare R2 client + presigned URL helpers
import { S3Client, PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "crypto";

const ACCOUNT_ID = process.env.R2_ACCOUNT_ID!;
const ACCESS_KEY = process.env.R2_ACCESS_KEY_ID!;
const SECRET_KEY = process.env.R2_SECRET_ACCESS_KEY!;
const BUCKET = process.env.R2_BUCKET_NAME || "ds360-uploads";
const PUBLIC_URL = (process.env.R2_PUBLIC_URL || "").replace(/\/$/, "");

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
    : `${opts.scope}/${opts.scopeId || "misc"}/${id}.${safeExt}`;

  const cmd = new PutObjectCommand({
    Bucket: BUCKET,
    Key: storageKey,
    ContentType: opts.contentType,
  });
  const uploadUrl = await getSignedUrl(r2, cmd, { expiresIn: 3600 });
  const publicUrl = `${PUBLIC_URL}/${storageKey}`;
  return { uploadUrl, publicUrl, storageKey };
}
