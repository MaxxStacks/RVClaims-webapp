import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  draft: "Draft",
  new_unassigned: "Submitted — pending review",
  assigned: "Under review",
  in_review: "Under review",
  info_requested: "Under review",
  submitted_to_mfr: "Sent to manufacturer",
  approved: "Approved",
  denied: "Not approved — contact your dealer",
  partial_approval: "Partially approved",
  completed: "Completed",
};

const STATUS_COLOR: Record<string, { bg: string; text: string }> = {
  approved: { bg: "#dcfce7", text: "#166534" },
  completed: { bg: "#dcfce7", text: "#166534" },
  denied: { bg: "#fee2e2", text: "#991b1b" },
  info_requested: { bg: "#fef3c7", text: "#92400e" },
};

const TYPE_LABEL: Record<string, string> = {
  warranty: "Warranty", extended_warranty: "Extended Warranty",
  pdi: "PDI", daf: "DAF", insurance: "Insurance",
};

export default function ClientClaimsPage() {
  const apiFetch = useApiFetch();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any[]>("/api/v6/claims")
      .then(rows => setClaims((rows || []).filter(c => c.status !== "draft")))
      .catch(() => setClaims([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: "28px 32px" }}>
      <h1 style={{ fontSize: 20, fontWeight: 700, marginBottom: 4 }}>My Claims</h1>
      <p style={{ fontSize: 13, color: "#666", marginBottom: 20 }}>
        Track the status of your service and warranty claims.
      </p>
      {claims.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fafafa", borderRadius: 8 }}>
          You have no active claims at this time.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {claims.map(c => {
            const colors = STATUS_COLOR[c.status] || { bg: "#eff6ff", text: "#033280" };
            return (
              <div key={c.id} style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, background: "white" }}>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                  <div>
                    <div style={{ fontSize: 14, fontWeight: 600 }}>Claim {c.claimNumber}</div>
                    <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>
                      {TYPE_LABEL[c.type] || c.type}
                      {c.createdAt && <> · Submitted {new Date(c.createdAt).toLocaleDateString()}</>}
                    </div>
                  </div>
                  <div style={{ padding: "4px 12px", background: colors.bg, color: colors.text, borderRadius: 12, fontSize: 11, fontWeight: 600, textAlign: "right", maxWidth: 200 }}>
                    {STATUS_LABEL[c.status] || c.status?.replace(/_/g, " ")}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
