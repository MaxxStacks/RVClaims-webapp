// client/src/components/SignatureDisplay.tsx — Read-only view of stored signatures
// Print-compatible: each signature card uses .avoid-break to prevent mid-print splits

import React from "react";

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoredSignature {
  id: string;
  signerName: string;
  signerRole: string;
  signatureImageUrl: string;
  timestamp: string | null;
}

interface SignatureDisplayProps {
  signatures: StoredSignature[];
  title?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtTimestamp(iso: string | null): string {
  if (!iso) return "—";
  return new Date(iso).toLocaleString("en-CA", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function SignatureDisplay({ signatures, title }: SignatureDisplayProps): React.ReactElement | null {
  if (!signatures || signatures.length === 0) return null;

  return (
    <div className="signature-display" style={{ display: "flex", flexDirection: "column", gap: 12 }}>
      {title && (
        <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{title}</div>
      )}
      {signatures.map((sig, idx) => (
        <React.Fragment key={sig.id}>
          <div
            className="avoid-break"
            style={{
              display: "flex",
              alignItems: "flex-start",
              gap: 16,
              padding: "12px 16px",
              background: "#f9fafb",
              border: "1px solid #e5e7eb",
              borderRadius: 8,
            }}
          >
            {/* Signature image */}
            <div
              style={{
                flexShrink: 0,
                width: 140,
                height: 60,
                border: "1px solid #e5e7eb",
                borderRadius: 4,
                background: "#fff",
                overflow: "hidden",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <img
                src={sig.signatureImageUrl}
                alt={`Signature of ${sig.signerName}`}
                style={{ maxHeight: 56, maxWidth: 136, objectFit: "contain" }}
              />
            </div>

            {/* Meta */}
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: "#111827" }}>
                {sig.signerName}
              </div>
              <div className="sig-meta" style={{ fontSize: 11, color: "#6b7280", marginTop: 2 }}>
                Role: {sig.signerRole}
              </div>
              <div className="sig-meta" style={{ fontSize: 11, color: "#6b7280", marginTop: 1 }}>
                Date: {fmtTimestamp(sig.timestamp)}
              </div>
            </div>
          </div>

          {/* Divider between multiple signatures */}
          {idx < signatures.length - 1 && (
            <div style={{ borderTop: "1px solid #f3f4f6" }} />
          )}
        </React.Fragment>
      ))}
    </div>
  );
}
