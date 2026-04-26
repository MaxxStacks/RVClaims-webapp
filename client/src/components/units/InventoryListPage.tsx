import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";
import { useLocation } from "wouter";

interface Props {
  context: "operator" | "dealer" | "client";
}

const STATUS_LABEL: Record<string, string> = {
  in_inventory: "In Stock",
  on_lot: "On Lot",
  sold: "Sold",
  delivered: "Delivered",
  consigned: "Consigned",
  in_service: "In Service",
  sold_out_of_state: "Sold OOS",
};

const STATUS_COLOR: Record<string, string> = {
  in_inventory: "#16a34a",
  on_lot: "#16a34a",
  sold: "#1e88e5",
  delivered: "#1e88e5",
  consigned: "#9b59b6",
  in_service: "#f48120",
  sold_out_of_state: "#888",
};

export default function InventoryListPage({ context }: Props) {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [units, setUnits] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState({ status: "", search: "" });
  async function refresh() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filter.status) params.set("status", filter.status);
      if (filter.search) params.set("search", filter.search);
      const list = await apiFetch<any[]>(`/api/v6/units?${params.toString()}`);
      setUnits(Array.isArray(list) ? list : []);
    } catch (e) {
      console.error("[InventoryListPage] fetch error", e);
      setUnits([]);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, [filter.status]);

  const kpis = {
    total: units.length,
    inStock: units.filter(u => u.status === "in_inventory" || u.status === "on_lot").length,
    sold: units.filter(u => u.status === "sold" || u.status === "delivered").length,
    inService: units.filter(u => u.status === "in_service").length,
  };

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>Inventory</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700 }}>Units</h1>
        </div>
        {context !== "client" && (
          <button onClick={() => navigate(`/${context}-v6/units/new`)}
            style={{ padding: "8px 16px", background: "#033280", color: "white", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + New Unit
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 16, marginBottom: 28 }}>
        {[
          { label: "TOTAL UNITS", value: kpis.total, color: "#033280" },
          { label: "IN STOCK", value: kpis.inStock, color: "#16a34a" },
          { label: "SOLD", value: kpis.sold, color: "#1e88e5" },
          { label: "IN SERVICE", value: kpis.inService, color: "#f48120" },
        ].map(k => (
          <div key={k.label} style={{ padding: 20, background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
          style={{ padding: "8px 12px", fontSize: 12, border: "1px solid #e0e0e0", borderRadius: 8 }}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input
          placeholder="Search VIN, stock #, make, model..."
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
          onKeyDown={e => e.key === "Enter" && refresh()}
          style={{ flex: 1, padding: "8px 12px", fontSize: 12, border: "1px solid #e0e0e0", borderRadius: 8 }}
        />
        <button onClick={refresh}
          style={{ padding: "6px 14px", border: "1px solid #e0e0e0", borderRadius: 8, background: "white", fontSize: 12, cursor: "pointer" }}>
          Search
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>
      ) : units.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", background: "#fafafa", borderRadius: 8, color: "#888" }}>
          No units found. {context !== "client" && "Click '+ New Unit' to add one."}
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0f0f0", textAlign: "left", fontSize: 11, color: "#888", textTransform: "uppercase", background: "#fafafa" }}>
              <th style={{ padding: 12 }}>Stock #</th>
              <th>VIN</th>
              <th>Year</th>
              <th>Make / Model</th>
              <th>Status</th>
              <th>Mfr Warranty</th>
              <th>Customer</th>
            </tr>
          </thead>
          <tbody>
            {units.map(u => (
              <tr key={u.id}
                onClick={() => navigate(`/${context}-v6/units/${u.id}`)}
                style={{ borderBottom: "1px solid #f5f5f5", fontSize: 13, cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f7f7f7")}
                onMouseLeave={e => (e.currentTarget.style.background = "white")}>
                <td style={{ padding: 12, fontWeight: 600 }}>{u.stockNumber || "—"}</td>
                <td style={{ fontFamily: "monospace", fontSize: 11 }}>{u.vin}</td>
                <td>{u.year}</td>
                <td>{u.manufacturer || u.make} {u.model}</td>
                <td>
                  <span style={{ padding: "3px 10px", borderRadius: 12, background: STATUS_COLOR[u.status] || "#888", color: "white", fontSize: 10, fontWeight: 600 }}>
                    {STATUS_LABEL[u.status] || u.status}
                  </span>
                </td>
                <td>
                  {u.mfrWarrantyStatus === "active" && <span style={{ color: "#16a34a", fontSize: 11, fontWeight: 600 }}>● Active</span>}
                  {u.mfrWarrantyStatus === "expiring" && <span style={{ color: "#f48120", fontSize: 11, fontWeight: 600 }}>● Expiring</span>}
                  {u.mfrWarrantyStatus === "expired" && <span style={{ color: "#c0392b", fontSize: 11, fontWeight: 600 }}>● Expired</span>}
                  {u.mfrWarrantyStatus === "none" && <span style={{ color: "#999", fontSize: 11 }}>—</span>}
                </td>
                <td style={{ fontSize: 11, color: "#666" }}>{u.customerId ? "Assigned" : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

    </div>
  );
}
