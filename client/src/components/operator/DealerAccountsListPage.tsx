import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";
import { useLocation } from "wouter";

const TIER_LABEL: Record<string, string> = { base: "Base", mid: "Mid", enterprise: "Enterprise" };
const TIER_COLOR: Record<string, string> = { base: "#888", mid: "#033280", enterprise: "#9b59b6" };
const REVIEW_COLOR: Record<string, string> = {
  active: "#16a34a", pending_review: "#f48120", suspended: "#c0392b", rejected: "#888",
};

export default function DealerAccountsListPage() {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [dealerships, setDealerships] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ search: "", reviewStatus: "" });

  async function refresh() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.search) params.set("search", filter.search);
      if (filter.reviewStatus) params.set("reviewStatus", filter.reviewStatus);
      const list = await apiFetch<any[]>(`/api/v6/dealerships?${params.toString()}`);
      setDealerships(list);
    } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, [filter.reviewStatus]);

  const kpis = {
    total: dealerships.length,
    active: dealerships.filter(d => d.reviewStatus === "active").length,
    pending: dealerships.filter(d => d.reviewStatus === "pending_review").length,
    suspended: dealerships.filter(d => d.reviewStatus === "suspended").length,
  };

  return (
    <div style={{padding: "28px 32px"}}>
      <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16}}>
        <div>
          <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600}}>Management</div>
          <h1 style={{margin: "4px 0 0", fontSize: 20, fontWeight: 700}}>Dealer Accounts</h1>
        </div>
        <button onClick={() => navigate("/operator-v6/dealerships/new")}
          style={{padding: "10px 18px", background: "#22c55e", color: "white", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer"}}>
          + New Dealership
        </button>
      </div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28}}>
        <Kpi label="Total Dealerships" value={kpis.total} color="#033280" />
        <Kpi label="Active" value={kpis.active} color="#16a34a" />
        <Kpi label="Pending Review" value={kpis.pending} color="#f48120"
          onClick={() => setFilter({...filter, reviewStatus: "pending_review"})}/>
        <Kpi label="Suspended" value={kpis.suspended} color="#c0392b" />
      </div>

      <div style={{display: "flex", gap: 8, marginBottom: 12}}>
        <select value={filter.reviewStatus} onChange={e => setFilter({...filter, reviewStatus: e.target.value})}
          style={{padding: "8px 12px", fontSize: 12, border: "1px solid #e0e0e0", borderRadius: 8}}>
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending_review">Pending Review</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
        <input placeholder="Search by dealer name..." value={filter.search}
          onChange={e => setFilter({...filter, search: e.target.value})}
          onKeyDown={e => e.key === "Enter" && refresh()}
          style={{flex: 1, padding: "8px 12px", fontSize: 12, border: "1px solid #e0e0e0", borderRadius: 8}}/>
      </div>

      {loading ? <div style={{padding: 40, textAlign: "center"}}>Loading...</div> : dealerships.length === 0 ? (
        <div style={{padding: 60, textAlign: "center", background: "#fafafa", borderRadius: 8, color: "#888"}}>
          No dealerships found. Click "+ New Dealership" to add one.
        </div>
      ) : (
        <table style={{width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden"}}>
          <thead>
            <tr style={{borderBottom: "1px solid #f0f0f0", textAlign: "left", fontSize: 11, color: "#888", textTransform: "uppercase", background: "#fafafa"}}>
              <th style={{padding: 12}}>Dealership</th>
              <th>Tier</th>
              <th>Status</th>
              <th>Units</th>
              <th>Claims</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {dealerships.map(d => (
              <tr key={d.id} onClick={() => navigate(`/operator-v6/dealerships/${d.id}`)}
                style={{borderBottom: "1px solid #f5f5f5", fontSize: 13, cursor: "pointer"}}
                onMouseEnter={e => e.currentTarget.style.background = "#f7f7f7"}
                onMouseLeave={e => e.currentTarget.style.background = "white"}>
                <td style={{padding: 12, fontWeight: 600}}>
                  {d.name}
                  <div style={{fontSize: 11, color: "#888", fontWeight: 400}}>{d.email}</div>
                </td>
                <td><span style={{padding: "2px 8px", borderRadius: 10, background: TIER_COLOR[d.brandingTier || "base"], color: "white", fontSize: 10, fontWeight: 600}}>{TIER_LABEL[d.brandingTier || "base"]}</span></td>
                <td><span style={{padding: "2px 8px", borderRadius: 10, background: REVIEW_COLOR[d.reviewStatus] || "#888", color: "white", fontSize: 10, fontWeight: 600}}>{d.reviewStatus ? d.reviewStatus.replace("_", " ") : "unknown"}</span></td>
                <td>{d.unitCount}</td>
                <td>{d.claimCount}</td>
                <td style={{fontSize: 11, color: "#888"}}>{d.createdAt ? new Date(d.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}

function Kpi({ label, value, color, onClick }: any) {
  return (
    <div onClick={onClick}
      style={{padding: 20, background: "white", border: "1px solid #e5e7eb", borderRadius: 8, cursor: onClick ? "pointer" : "default"}}>
      <div style={{fontSize: 11, color: "#888", marginBottom: 4, textTransform: "uppercase", fontWeight: 600}}>{label}</div>
      <div style={{fontSize: 28, fontWeight: 700, color}}>{value}</div>
    </div>
  );
}
