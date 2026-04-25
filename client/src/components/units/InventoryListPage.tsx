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
  const [showNewUnit, setShowNewUnit] = useState(false);
  const [newUnit, setNewUnit] = useState({
    vin: "", year: new Date().getFullYear(), make: "", model: "",
    stockNumber: "", status: "in_inventory",
  });
  const [creating, setCreating] = useState(false);

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

  async function createUnit() {
    if (!newUnit.vin || !newUnit.make) {
      alert("VIN and make are required");
      return;
    }
    setCreating(true);
    try {
      const created = await apiFetch<any>("/api/v6/units", {
        method: "POST",
        body: JSON.stringify({ ...newUnit, manufacturer: newUnit.make }),
      });
      setShowNewUnit(false);
      setNewUnit({ vin: "", year: new Date().getFullYear(), make: "", model: "", stockNumber: "", status: "in_inventory" });
      navigate(`/${context}-v6/units/${created.id}`);
    } finally {
      setCreating(false);
    }
  }

  const kpis = {
    total: units.length,
    inStock: units.filter(u => u.status === "in_inventory" || u.status === "on_lot").length,
    sold: units.filter(u => u.status === "sold" || u.status === "delivered").length,
    inService: units.filter(u => u.status === "in_service").length,
  };

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>Inventory</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 600 }}>Units</h1>
        </div>
        {context !== "client" && (
          <button onClick={() => setShowNewUnit(true)}
            style={{ padding: "8px 16px", background: "#033280", color: "white", border: 0, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
            + New Unit
          </button>
        )}
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(160px, 1fr))", gap: 12, marginBottom: 20 }}>
        {[
          { label: "TOTAL UNITS", value: kpis.total, color: "#033280" },
          { label: "IN STOCK", value: kpis.inStock, color: "#16a34a" },
          { label: "SOLD", value: kpis.sold, color: "#1e88e5" },
          { label: "IN SERVICE", value: kpis.inService, color: "#f48120" },
        ].map(k => (
          <div key={k.label} style={{ padding: 16, background: "white", border: "1px solid #e5eaf2", borderRadius: 8 }}>
            <div style={{ fontSize: 11, color: "#888", marginBottom: 4 }}>{k.label}</div>
            <div style={{ fontSize: 24, fontWeight: 700, color: k.color }}>{k.value}</div>
          </div>
        ))}
      </div>

      <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
        <select value={filter.status} onChange={e => setFilter({ ...filter, status: e.target.value })}
          style={{ padding: "6px 10px", fontSize: 12, border: "1px solid #d5dbe5", borderRadius: 6 }}>
          <option value="">All statuses</option>
          {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
        </select>
        <input
          placeholder="Search VIN, stock #, make, model..."
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
          onKeyDown={e => e.key === "Enter" && refresh()}
          style={{ flex: 1, padding: "6px 10px", fontSize: 12, border: "1px solid #d5dbe5", borderRadius: 6 }}
        />
        <button onClick={refresh}
          style={{ padding: "6px 14px", border: "1px solid #d5dbe5", borderRadius: 6, background: "white", fontSize: 12, cursor: "pointer" }}>
          Search
        </button>
      </div>

      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>
      ) : units.length === 0 ? (
        <div style={{ padding: 60, textAlign: "center", background: "#fafbfd", borderRadius: 8, color: "#888" }}>
          No units found. {context !== "client" && "Click '+ New Unit' to add one."}
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee", textAlign: "left", fontSize: 11, color: "#888", textTransform: "uppercase" }}>
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
                style={{ borderBottom: "1px solid #f3f3f3", fontSize: 13, cursor: "pointer" }}
                onMouseEnter={e => (e.currentTarget.style.background = "#f7f9fc")}
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

      {showNewUnit && (
        <div onClick={() => setShowNewUnit(false)}
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div onClick={e => e.stopPropagation()}
            style={{ background: "white", padding: 24, borderRadius: 8, minWidth: 480, maxWidth: 560 }}>
            <h2 style={{ margin: "0 0 16px" }}>New Unit</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontSize: 12 }}>VIN *
                <input value={newUnit.vin}
                  onChange={e => setNewUnit({ ...newUnit, vin: e.target.value.toUpperCase() })}
                  style={{ width: "100%", padding: 8, marginTop: 4, fontFamily: "monospace" }} maxLength={17} />
              </label>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 2fr 2fr", gap: 8 }}>
                <label style={{ fontSize: 12 }}>Year *
                  <input type="number" value={newUnit.year}
                    onChange={e => setNewUnit({ ...newUnit, year: parseInt(e.target.value, 10) })}
                    style={{ width: "100%", padding: 8, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 12 }}>Make *
                  <input value={newUnit.make}
                    onChange={e => setNewUnit({ ...newUnit, make: e.target.value })}
                    style={{ width: "100%", padding: 8, marginTop: 4 }} placeholder="Jayco, Forest River..." />
                </label>
                <label style={{ fontSize: 12 }}>Model
                  <input value={newUnit.model}
                    onChange={e => setNewUnit({ ...newUnit, model: e.target.value })}
                    style={{ width: "100%", padding: 8, marginTop: 4 }} />
                </label>
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8 }}>
                <label style={{ fontSize: 12 }}>Stock #
                  <input value={newUnit.stockNumber}
                    onChange={e => setNewUnit({ ...newUnit, stockNumber: e.target.value })}
                    style={{ width: "100%", padding: 8, marginTop: 4 }} />
                </label>
                <label style={{ fontSize: 12 }}>Status
                  <select value={newUnit.status}
                    onChange={e => setNewUnit({ ...newUnit, status: e.target.value })}
                    style={{ width: "100%", padding: 8, marginTop: 4 }}>
                    {Object.entries(STATUS_LABEL).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                  </select>
                </label>
              </div>
              <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowNewUnit(false)}
                  style={{ padding: "8px 14px", border: "1px solid #ccc", background: "white", borderRadius: 6, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={createUnit} disabled={creating}
                  style={{ padding: "8px 14px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                  {creating ? "Creating..." : "Create Unit"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
