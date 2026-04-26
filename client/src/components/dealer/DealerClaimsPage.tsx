import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";
import { useLocation } from "wouter";

const STATUS_COLOR: Record<string, string> = {
  new_unassigned: "#1e88e5", assigned: "#0891b2", in_review: "#f48120",
  submitted_to_mfr: "#9b59b6", approved: "#16a34a", denied: "#c0392b",
  partial_approval: "#b8860b", completed: "#666",
};

export default function DealerClaimsPage() {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [claims, setClaims] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "" });
  const [showInventoryPicker, setShowInventoryPicker] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const [c, u] = await Promise.all([
        apiFetch<any[]>("/api/v6/claims"),
        apiFetch<any[]>("/api/v6/units"),
      ]);
      setClaims(c);
      setUnits(u);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, []);

  const filtered = filter.status ? claims.filter(c => c.status === filter.status) : claims;

  const kpis = {
    active: claims.filter(c => !["completed", "denied"].includes(c.status)).length,
    pending: claims.filter(c => ["new_unassigned", "assigned", "in_review"].includes(c.status)).length,
    thisMonth: claims.filter(c => c.submittedAt && new Date(c.submittedAt).getMonth() === new Date().getMonth()).length,
    approvedYTD: claims.filter(c => c.status === "approved" && c.approvedAt && new Date(c.approvedAt).getFullYear() === new Date().getFullYear()).length,
  };

  return (
    <div style={{padding: "28px 32px"}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
        <div>
          <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600}}>Operations</div>
          <h1 style={{margin: "4px 0 0", fontSize: 20, fontWeight: 700}}>Claims</h1>
        </div>
        <button onClick={() => setShowInventoryPicker(!showInventoryPicker)}
          style={{padding: "10px 18px", background: "#22c55e", color: "white", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"}}>
          + New Claim
        </button>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(140px, 1fr))", gap: 12, marginBottom: 16}}>
        <Kpi label="Active Claims" value={kpis.active} color="#033280"/>
        <Kpi label="Pending" value={kpis.pending} color="#f48120"/>
        <Kpi label="This Month" value={kpis.thisMonth} color="#1e88e5"/>
        <Kpi label="Approved YTD" value={kpis.approvedYTD} color="#16a34a"/>
      </div>

      {showInventoryPicker && (
        <div style={{marginBottom: 16, padding: 16, background: "white", borderRadius: 8, border: "1px solid #e5e7eb"}}>
          <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12}}>
            <strong style={{fontSize: 13}}>Select a unit to file a claim against:</strong>
            <button onClick={() => setShowInventoryPicker(false)} style={{background: "none", border: 0, fontSize: 18, cursor: "pointer"}}>×</button>
          </div>
          <div style={{maxHeight: 240, overflowY: "auto", display: "grid", gap: 6}}>
            {units.length === 0 ? (
              <div style={{padding: 20, textAlign: "center", color: "#888", fontSize: 12}}>
                No units in inventory. <a href="/dealer-v6/units/new" style={{color: "#033280"}}>Add one</a>
              </div>
            ) : units.map(u => (
              <div key={u.id} onClick={() => navigate(`/dealer-v6/units/${u.id}/claims/new`)}
                style={{padding: 10, border: "1px solid #e5e7eb", borderRadius: 8, cursor: "pointer", display: "flex", justifyContent: "space-between", alignItems: "center", background: "white"}}
                onMouseEnter={e => e.currentTarget.style.background = "#f7f7f7"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <div>
                  <div style={{fontSize: 13, fontWeight: 600}}>{u.year} {u.make} {u.model}</div>
                  <div style={{fontSize: 11, color: "#888", fontFamily: "monospace"}}>{u.vin} · {u.stockNumber}</div>
                </div>
                <div style={{fontSize: 11, color: "#033280"}}>Pick →</div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div style={{marginBottom: 12}}>
        <select value={filter.status} onChange={e => setFilter({status: e.target.value})}
          style={{padding: "8px 12px", fontSize: 12, border: "1px solid #e0e0e0", borderRadius: 8}}>
          <option value="">All statuses</option>
          {Object.keys(STATUS_COLOR).map(s => <option key={s} value={s}>{s.replace(/_/g, " ")}</option>)}
        </select>
      </div>

      {loading ? <div style={{padding: 40, textAlign: "center"}}>Loading...</div> : filtered.length === 0 ? (
        <div style={{padding: 60, textAlign: "center", background: "#fafafa", borderRadius: 8, color: "#888"}}>
          No claims found.
        </div>
      ) : (
        <table style={{width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden"}}>
          <thead>
            <tr style={{borderBottom: "1px solid #f0f0f0", textAlign: "left", fontSize: 11, color: "#888", textTransform: "uppercase", background: "#fafafa"}}>
              <th style={{padding: 12}}>Claim #</th>
              <th>Type</th>
              <th>Manufacturer</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(c => (
              <tr key={c.id} onClick={() => c.unitId && navigate(`/dealer-v6/units/${c.unitId}`)}
                style={{borderBottom: "1px solid #f5f5f5", fontSize: 13, cursor: c.unitId ? "pointer" : "default"}}
                onMouseEnter={e => { if (c.unitId) e.currentTarget.style.background = "#f7f7f7"; }}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <td style={{padding: 12, fontWeight: 600}}>{c.claimNumber}</td>
                <td>{c.type}</td>
                <td>{c.manufacturer}</td>
                <td><span style={{padding: "2px 8px", borderRadius: 10, background: STATUS_COLOR[c.status] || "#888", color: "white", fontSize: 10, fontWeight: 600}}>{c.status?.replace(/_/g, " ")}</span></td>
                <td style={{fontSize: 11, color: "#888"}}>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Kpi({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{padding: 20, background: "white", border: "1px solid #e5e7eb", borderRadius: 8}}>
      <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600}}>{label}</div>
      <div style={{fontSize: 28, fontWeight: 700, color, marginTop: 4}}>{value}</div>
    </div>
  );
}
