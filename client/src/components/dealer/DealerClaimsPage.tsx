import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";
import { useLocation } from "wouter";
import PhotoUploader from "@/components/PhotoUploader";
import PhotoGallery from "@/components/PhotoGallery";

const STATUS_COLOR: Record<string, string> = {
  new_unassigned: "#1e88e5",
  assigned: "#0891b2",
  in_review: "#f48120",
  submitted_to_mfr: "#9b59b6",
  approved: "#16a34a",
  denied: "#c0392b",
  partial_approval: "#b8860b",
  completed: "#666",
};

export default function DealerClaimsPage() {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [claims, setClaims] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [showNew, setShowNew] = useState(false);
  const [form, setForm] = useState({ unitId: "", type: "", manufacturer: "", dealerNotes: "" });
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [photoRefreshKey, setPhotoRefreshKey] = useState(0);

  async function refresh() {
    setLoading(true);
    try {
      const list = await apiFetch<any[]>("/api/v6/claims");
      setClaims(list);
      try {
        const resp = await apiFetch<{ units?: any[]; success?: boolean } | any[]>("/api/units");
        const list = Array.isArray(resp) ? resp : (resp as any).units ?? [];
        setUnits(list);
      } catch {}
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, []);

  async function submit() {
    if (!form.type || !form.manufacturer) {
      alert("Manufacturer and Type are required");
      return;
    }
    if (!form.unitId && units.length > 0) {
      alert("Please select a unit");
      return;
    }
    setSubmitting(true);
    try {
      await apiFetch("/api/v6/claims", { method: "POST", body: JSON.stringify(form) });
      setShowNew(false);
      setForm({ unitId: "", type: "", manufacturer: "", dealerNotes: "" });
      await refresh();
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div style={{ padding: 24 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>Operations</div>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 600 }}>Claims</h1>
        </div>
        <div style={{ fontSize: 11, color: "#888", alignSelf: "center" }}>
          To create a new claim, open a unit from{" "}
          <span onClick={() => navigate("/dealer-v6")} style={{ color: "#033280", cursor: "pointer", textDecoration: "underline" }}>Inventory</span>
        </div>
      </div>

      {showNew && (
        <div style={{ position: "fixed", top: 0, left: 0, right: 0, bottom: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
          <div style={{ background: "white", padding: 24, borderRadius: 8, minWidth: 480 }}>
            <h2 style={{ margin: "0 0 16px", fontSize: 18 }}>Submit New Claim</h2>
            <div style={{ display: "grid", gap: 10 }}>
              {units.length === 0 ? (
                <div style={{ padding: "10px 12px", background: "#fff8e1", border: "1px solid #ffe082", borderRadius: 6, fontSize: 12, color: "#795548", marginBottom: 4 }}>
                  No units on file for this dealership yet. Add a unit in the <strong>Units / Inventory</strong> section first.
                </div>
              ) : null}
              <label style={{ fontSize: 12 }}>
                Unit (VIN)
                <select value={form.unitId} onChange={e => setForm({ ...form, unitId: e.target.value })} style={{ width: "100%", padding: 8, marginTop: 4 }}>
                  <option value="">Select a unit</option>
                  {units.map((u: any) => (
                    <option key={u.id} value={u.id}>{u.vin} — {u.year} {u.manufacturer} {u.model}</option>
                  ))}
                </select>
              </label>
              <label style={{ fontSize: 12 }}>
                Manufacturer
                <input value={form.manufacturer} onChange={e => setForm({ ...form, manufacturer: e.target.value })} style={{ width: "100%", padding: 8, marginTop: 4 }} />
              </label>
              <label style={{ fontSize: 12 }}>
                Type
                <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} style={{ width: "100%", padding: 8, marginTop: 4 }}>
                  <option value="">Select type</option>
                  <option value="warranty">Warranty</option>
                  <option value="extended_warranty">Extended Warranty</option>
                  <option value="pdi">PDI</option>
                  <option value="daf">DAF</option>
                  <option value="insurance">Insurance</option>
                </select>
              </label>
              <label style={{ fontSize: 12 }}>
                Notes
                <textarea value={form.dealerNotes} onChange={e => setForm({ ...form, dealerNotes: e.target.value })} style={{ width: "100%", padding: 8, marginTop: 4, minHeight: 80 }} />
              </label>
              <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
                <button onClick={() => setShowNew(false)} style={{ padding: "8px 14px", border: "1px solid #ccc", background: "white", borderRadius: 6, cursor: "pointer" }}>
                  Cancel
                </button>
                <button onClick={submit} disabled={submitting} style={{ padding: "8px 14px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer" }}>
                  {submitting ? "Submitting..." : "Submit Claim"}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div>Loading...</div>
      ) : claims.length === 0 ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fafbfd", borderRadius: 8 }}>
          No claims yet. Click <strong>+ New Claim</strong> to submit your first claim.
        </div>
      ) : (
        <table style={{ width: "100%", borderCollapse: "collapse" }}>
          <thead>
            <tr style={{ borderBottom: "2px solid #eee", textAlign: "left", fontSize: 11, color: "#888" }}>
              <th style={{ padding: 10 }}>Claim #</th>
              <th>Type</th>
              <th>Manufacturer</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {claims.map(c => (
              <tr key={c.id} onClick={() => c.unitId ? navigate(`/dealer-v6/units/${c.unitId}`) : (setSelectedClaimId(c.id), setPhotoRefreshKey(k => k + 1))} style={{ borderBottom: "1px solid #f3f3f3", fontSize: 12, cursor: "pointer" }}>
                <td style={{ padding: 10, fontWeight: 600 }}>{c.claimNumber}</td>
                <td>{c.type}</td>
                <td>{c.manufacturer}</td>
                <td>
                  <span style={{ padding: "2px 8px", borderRadius: 10, background: STATUS_COLOR[c.status] || "#888", color: "white", fontSize: 10, fontWeight: 600 }}>
                    {c.status?.replace(/_/g, " ")}
                  </span>
                </td>
                <td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "—"}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedClaimId && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 520, background: "white",
          boxShadow: "-4px 0 20px rgba(0,0,0,0.1)", overflowY: "auto", zIndex: 900, padding: 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <h2 style={{ margin: 0, fontSize: 18 }}>Claim Photos</h2>
            <button onClick={() => setSelectedClaimId(null)} style={{ background: "none", border: 0, fontSize: 20, cursor: "pointer" }}>×</button>
          </div>
          <h3 style={{ fontSize: 13, margin: "0 0 8px", color: "#555" }}>Uploaded Photos</h3>
          <PhotoGallery claimId={selectedClaimId} refreshKey={photoRefreshKey} />
          <div style={{ marginTop: 16 }}>
            <h3 style={{ fontSize: 13, margin: "0 0 8px", color: "#555" }}>Add Photos</h3>
            <PhotoUploader
              scope="claims"
              scopeId={selectedClaimId}
              photoType="claim_evidence"
              onUploadComplete={() => setPhotoRefreshKey(k => k + 1)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
