import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

const STATUS_COLUMNS = [
  { key: "new_unassigned", label: "New / Unassigned", color: "#1e88e5" },
  { key: "assigned", label: "Assigned", color: "#0891b2" },
  { key: "in_review", label: "In Review", color: "#f48120" },
  { key: "submitted_to_mfr", label: "Submitted to Mfr", color: "#9b59b6" },
  { key: "approved", label: "Approved", color: "#16a34a" },
  { key: "denied", label: "Denied", color: "#c0392b" },
  { key: "completed", label: "Completed", color: "#666" },
];

export default function ClaimQueuePage() {
  const apiFetch = useApiFetch();
  const [claims, setClaims] = useState<any[]>([]);
  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  async function refresh() {
    setLoading(true);
    try {
      const list = await apiFetch<any[]>("/api/v6/claims");
      setClaims(list);
      try {
        const staffList = await apiFetch<any[]>("/api/v6/users?role=operator_staff");
        setStaff(staffList);
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function assignClaim(claimId: string, userId: string) {
    await apiFetch(`/api/v6/claims/${claimId}/assign`, {
      method: "POST",
      body: JSON.stringify({ assignedToUserId: userId }),
    });
    await refresh();
  }

  async function transition(claimId: string, toStatus: string, extras: any = {}) {
    await apiFetch(`/api/v6/claims/${claimId}/transition`, {
      method: "POST",
      body: JSON.stringify({ toStatus, ...extras }),
    });
    await refresh();
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>Operations</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 600 }}>Claim Queue</h1>
        </div>
        <button
          onClick={refresh}
          style={{ padding: "6px 14px", border: "1px solid #d5dbe5", borderRadius: 6, background: "white", fontSize: 12, cursor: "pointer" }}
        >
          Refresh
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(240px, 1fr))", gap: 12 }}>
          {STATUS_COLUMNS.map(col => {
            const colClaims = claims.filter(c => c.status === col.key);
            return (
              <div key={col.key} style={{ background: "#fafbfd", borderRadius: 8, padding: 10, minHeight: 200 }}>
                <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 8 }}>
                  <strong style={{ fontSize: 12, color: col.color }}>{col.label}</strong>
                  <span style={{ fontSize: 11, color: "#888" }}>{colClaims.length}</span>
                </div>
                {colClaims.map(c => (
                  <div key={c.id} style={{ background: "white", padding: 10, marginBottom: 6, borderRadius: 6, borderLeft: `3px solid ${col.color}` }}>
                    <div style={{ fontSize: 11, fontWeight: 600 }}>{c.claimNumber}</div>
                    <div style={{ fontSize: 10, color: "#888" }}>{c.manufacturer} · {c.type}</div>
                    {c.status === "new_unassigned" && staff.length > 0 && (
                      <select
                        onChange={e => e.target.value && assignClaim(c.id, e.target.value)}
                        defaultValue=""
                        style={{ marginTop: 6, fontSize: 10, padding: 4, width: "100%" }}
                      >
                        <option value="">Assign to...</option>
                        {staff.map(s => (
                          <option key={s.id} value={s.id}>{s.firstName} {s.lastName}</option>
                        ))}
                      </select>
                    )}
                    {c.status === "assigned" && (
                      <button
                        onClick={() => transition(c.id, "in_review")}
                        style={{ marginTop: 6, fontSize: 10, padding: 4, width: "100%", background: "#033280", color: "white", border: 0, borderRadius: 4, cursor: "pointer" }}
                      >
                        Start review
                      </button>
                    )}
                    {c.status === "in_review" && (
                      <button
                        onClick={() => transition(c.id, "submitted_to_mfr", { mfrClaimNumber: prompt("Mfr claim #?") })}
                        style={{ marginTop: 6, flex: 1, fontSize: 9, padding: 4, width: "100%", background: "#9b59b6", color: "white", border: 0, borderRadius: 4, cursor: "pointer" }}
                      >
                        Submit to Mfr
                      </button>
                    )}
                    {c.status === "submitted_to_mfr" && (
                      <div style={{ display: "flex", gap: 4, marginTop: 6 }}>
                        <button
                          onClick={() => transition(c.id, "approved", { approvedAmount: prompt("Approved $?") })}
                          style={{ flex: 1, fontSize: 9, padding: 4, background: "#16a34a", color: "white", border: 0, borderRadius: 4, cursor: "pointer" }}
                        >
                          Approve
                        </button>
                        <button
                          onClick={() => transition(c.id, "denied", { denialReason: prompt("Reason?") })}
                          style={{ flex: 1, fontSize: 9, padding: 4, background: "#c0392b", color: "white", border: 0, borderRadius: 4, cursor: "pointer" }}
                        >
                          Deny
                        </button>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
