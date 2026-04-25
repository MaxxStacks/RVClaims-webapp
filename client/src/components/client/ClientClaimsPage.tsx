import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  new_unassigned: "Submitted",
  assigned: "Being assigned",
  in_review: "Under review",
  submitted_to_mfr: "Sent to manufacturer",
  approved: "Approved",
  denied: "Not approved",
  partial_approval: "Partially approved",
  completed: "Completed",
};

export default function ClientClaimsPage() {
  const apiFetch = useApiFetch();
  const [claims, setClaims] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any[]>("/api/v6/claims")
      .then(setClaims)
      .catch(() => setClaims([]))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return <div style={{ padding: 24 }}>Loading...</div>;

  return (
    <div style={{ padding: 24 }}>
      <h1 style={{ fontSize: 22, fontWeight: 600, marginBottom: 16 }}>My Claims</h1>
      {claims.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fafbfd", borderRadius: 8 }}>
          You have no active claims.
        </div>
      ) : (
        <div style={{ display: "grid", gap: 10 }}>
          {claims.map(c => (
            <div key={c.id} style={{ padding: 16, border: "1px solid #e5eaf2", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <div>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>Claim {c.claimNumber}</div>
                  <div style={{ fontSize: 12, color: "#888", marginTop: 2 }}>{c.manufacturer}</div>
                </div>
                <div style={{ padding: "4px 10px", background: "#eaf1fb", color: "#033280", borderRadius: 12, fontSize: 11, fontWeight: 600 }}>
                  {STATUS_LABEL[c.status] || c.status}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
