import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

const STATUS_LABEL: Record<string, string> = {
  initiated: "Initiated",
  submitted_to_supplier: "Submitted to Supplier",
  supplier_ack: "Supplier Acknowledged",
  shipped: "Shipped",
  received: "Received",
  cancelled: "Cancelled",
};

export default function DealerPartsOrdersPage() {
  const apiFetch = useApiFetch();
  const [orders, setOrders] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ supplier: "", items: "" });
  const [submitting, setSubmitting] = useState(false);

  async function refresh() {
    const list = await apiFetch<any[]>("/api/v6/parts-orders");
    setOrders(list);
  }
  useEffect(() => { refresh(); }, []);

  async function submit() {
    const lines = form.items.split("\n").filter(l => l.trim()).map(l => {
      const [partNumber, description, qtyStr] = l.split("|").map(s => s.trim());
      return { partNumber: partNumber || "MISC", description: description || null, quantity: parseInt(qtyStr, 10) || 1 };
    });
    if (lines.length === 0) { alert("Add at least one item (format: PART-NUM | description | qty)"); return; }
    setSubmitting(true);
    try {
      await apiFetch("/api/v6/parts-orders", {
        method: "POST",
        body: JSON.stringify({ supplier: form.supplier, items: lines }),
      });
      setShowNew(false);
      setForm({ supplier: "", items: "" });
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: "28px 32px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>Operations</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 20, fontWeight: 700 }}>Parts Orders</h1>
        </div>
        <button
          onClick={() => setShowNew(true)}
          style={{ padding: "8px 16px", background: "#033280", color: "white", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}
        >
          + New Order
        </button>
      </div>

      {showNew && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: 24, borderRadius: 8, minWidth: 520 }}>
            <h2 style={{ margin: "0 0 16px" }}>New Parts Order</h2>
            <div style={{ display: "grid", gap: 10 }}>
              <label style={{ fontSize: 12 }}>Supplier (optional)
                <input
                  value={form.supplier}
                  onChange={e => setForm({ ...form, supplier: e.target.value })}
                  style={{ width: "100%", padding: 8, marginTop: 4 }}
                  placeholder="e.g. Lippert Components"
                />
              </label>
              <label style={{ fontSize: 12 }}>Items — one per line: PART-NUM | description | qty
                <textarea
                  value={form.items}
                  onChange={e => setForm({ ...form, items: e.target.value })}
                  style={{ width: "100%", padding: 8, marginTop: 4, minHeight: 120, fontFamily: "monospace", fontSize: 11 }}
                  placeholder={"ABC-123 | Slide-out motor | 1\nXYZ-789 | Wiring harness | 2"}
                />
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowNew(false)} style={{ padding: "8px 14px", border: "1px solid #e0e0e0", background: "white", borderRadius: 8, cursor: "pointer" }}>Cancel</button>
                <button onClick={submit} disabled={submitting} style={{ padding: "8px 14px", background: "#033280", color: "white", border: 0, borderRadius: 8, cursor: "pointer" }}>
                  {submitting ? "Creating..." : "Create Order"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {orders.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fafafa", borderRadius: 8 }}>
          No parts orders yet. Click <strong>+ New Order</strong> to request parts.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "1px solid #f0f0f0", textAlign: "left", fontSize: 11, color: "#888", background: "#fafafa" }}>
              <th style={{ padding: 10 }}>Order #</th>
              <th>Supplier</th>
              <th>Qty</th>
              <th>Status</th>
              <th>Tracking</th>
              <th>Created</th>
            </tr>
          </thead>
          <tbody>
            {orders.map(o => (
              <tr key={o.id} style={{ borderBottom: "1px solid #f5f5f5", fontSize: 12 }}>
                <td style={{ padding: 10, fontWeight: 600 }}>{o.orderNumber}</td>
                <td>{o.supplier || "—"}</td>
                <td>{o.totalQuantity ?? "—"}</td>
                <td>{STATUS_LABEL[o.status] || o.status}</td>
                <td>{o.trackingNumber ? `${o.carrier || ""} ${o.trackingNumber}`.trim() : "—"}</td>
                <td>{o.createdAt ? new Date(o.createdAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
