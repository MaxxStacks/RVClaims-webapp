import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

const STATUS_COLOR: Record<string, string> = {
  initiated: "#1e88e5",
  submitted_to_supplier: "#9b59b6",
  supplier_ack: "#0891b2",
  shipped: "#f48120",
  received: "#16a34a",
  cancelled: "#888",
  requested: "#888",
  sourcing: "#888",
  quoted: "#888",
  ordered: "#888",
  delivered: "#16a34a",
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
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>Operations</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700 }}>Parts Management</h1>
        </div>
        <button onClick={refresh} style={{ padding: "6px 14px", border: "1px solid #e0e0e0", borderRadius: 8, background: "white", fontSize: 12, cursor: "pointer" }}>
          Refresh
        </button>
      </div>

      {loading ? (
        <div>Loading...</div>
      ) : orders.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fafafa", borderRadius: 8 }}>
          No parts orders yet.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0f0f0", textAlign: "left", fontSize: 11, color: "#888", background: "#fafafa" }}>
              <th style={{ padding: 10 }}>Order #</th>
              <th>Supplier</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Initiated</th>
              <th>Action</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: "1px solid #f5f5f5", fontSize: 12 }}>
                <td style={{ padding: 10, fontWeight: 600 }}>{o.orderNumber}</td>
                <td>{o.supplier || "—"}</td>
                <td>{o.totalQuantity ?? "—"}</td>
                <td>
                  <span style={{ padding: "2px 8px", borderRadius: 10, background: STATUS_COLOR[o.status] || "#888", color: "white", fontSize: 10, fontWeight: 600 }}>
                    {o.status}
                  </span>
                </td>
                <td>{o.initiatedAt ? new Date(o.initiatedAt).toLocaleDateString() : "—"}</td>
                <td>
                  {o.status === "initiated" && (
                    <button
                      onClick={() => {
                        const ref = window.prompt("Supplier order ref?") || "";
                        transition(o.id, "submitted_to_supplier", { supplierOrderRef: ref });
                      }}
                      style={{ fontSize: 10, padding: "4px 8px", background: "#9b59b6", color: "white", border: 0, borderRadius: 4, cursor: "pointer" }}
                    >
                      Submit to supplier
                    </button>
                  )}
                  {o.status === "submitted_to_supplier" && (
                    <button
                      onClick={() => {
                        const tn = window.prompt("Tracking #?") || "";
                        const cr = window.prompt("Carrier?") || "";
                        transition(o.id, "shipped", { trackingNumber: tn, carrier: cr });
                      }}
                      style={{ fontSize: 10, padding: "4px 8px", background: "#f48120", color: "white", border: 0, borderRadius: 4, cursor: "pointer" }}
                    >
                      Mark shipped
                    </button>
                  )}
                  {o.status === "shipped" && (
                    <button
                      onClick={() => transition(o.id, "received")}
                      style={{ fontSize: 10, padding: "4px 8px", background: "#16a34a", color: "white", border: 0, borderRadius: 4, cursor: "pointer" }}
                    >
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
