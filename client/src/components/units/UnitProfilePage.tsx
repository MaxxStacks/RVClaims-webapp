import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useApiFetch } from "@/lib/api";
import PhotoUploader from "@/components/PhotoUploader";
import PhotoGallery from "@/components/PhotoGallery";

interface Props {
  context: "operator" | "dealer" | "client";
}

const TABS_ALL = ["Identity", "Warranty", "Customer", "Photos", "Documents", "Claims", "Service"] as const;
const TABS_CLIENT = ["Identity", "Warranty", "Photos", "Documents", "Claims"] as const;

export default function UnitProfilePage({ context }: Props) {
  const params = useParams<{ id: string }>();
  const [, navigate] = useLocation();
  const apiFetch = useApiFetch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState("Identity");
  const [editing, setEditing] = useState<Record<string, any>>({});
  const [showNewClaim, setShowNewClaim] = useState(false);
  const [photoRefreshKey, setPhotoRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);

  const tabs = context === "client" ? TABS_CLIENT : TABS_ALL;
  const canEdit = context !== "client";

  async function refresh() {
    setLoading(true);
    try {
      const result = await apiFetch<any>(`/api/v6/units/${params.id}`);
      setData(result);
      setEditing(result.unit);
    } catch (e) {
      console.error("[UnitProfilePage] fetch error", e);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { refresh(); }, [params.id]);

  async function save() {
    setSaving(true);
    try {
      const fields = [
        "year", "manufacturer", "model", "stockNumber", "status",
        "intakeDate", "lotLocation",
        "warrantyStart", "warrantyEnd",
        "extendedWarrantyPlan", "extendedWarrantyStart", "extWarrantyEnd",
        "serviceContractActive", "serviceContractEnd",
      ];
      const body: any = {};
      for (const f of fields) {
        if (editing[f] !== undefined) body[f] = editing[f];
      }
      await apiFetch(`/api/v6/units/${params.id}`, { method: "PATCH", body: JSON.stringify(body) });
      await refresh();
    } finally {
      setSaving(false);
    }
  }

  async function submitNewClaim(form: { type: string; dealerNotes: string }) {
    await apiFetch("/api/v6/claims", {
      method: "POST",
      body: JSON.stringify({ unitId: params.id, type: form.type, dealerNotes: form.dealerNotes }),
    });
    setShowNewClaim(false);
    await refresh();
  }

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "#c0392b" }}>Unit not found</div>;

  const { unit, claims, photos, customer, dealership } = data;

  return (
    <div style={{ padding: 24 }}>
      <div style={{ marginBottom: 16 }}>
        <button onClick={() => navigate(`/${context}-v6`)}
          style={{ background: "none", border: 0, color: "#033280", fontSize: 12, cursor: "pointer", marginBottom: 8, padding: 0 }}>
          ← Back to inventory
        </button>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
          <div>
            <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>
              {unit.status?.replace(/_/g, " ").toUpperCase()}
            </div>
            <h1 style={{ margin: "4px 0 0", fontSize: 24, fontWeight: 700 }}>
              {unit.year} {unit.manufacturer} {unit.model}
            </h1>
            <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
              VIN <span style={{ fontFamily: "monospace" }}>{unit.vin}</span>
              {unit.stockNumber && <> · Stock #{unit.stockNumber}</>}
              {unit.lotLocation && <> · {unit.lotLocation}</>}
            </div>
          </div>
          {context === "dealer" && (
            <button onClick={() => setShowNewClaim(true)}
              style={{ padding: "10px 18px", background: "#0cb22c", color: "white", border: 0, borderRadius: 6, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
              + New Claim
            </button>
          )}
        </div>
      </div>

      <div style={{ display: "flex", gap: 0, borderBottom: "1px solid #e5eaf2", marginBottom: 20 }}>
        {tabs.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "10px 18px", background: "transparent", border: 0,
              borderBottom: tab === t ? "2px solid #033280" : "2px solid transparent",
              color: tab === t ? "#033280" : "#666",
              fontWeight: tab === t ? 600 : 400,
              fontSize: 13, cursor: "pointer", marginBottom: -1,
            }}>
            {t}
            {t === "Claims" && claims?.length > 0 && (
              <span style={{ marginLeft: 6, padding: "1px 7px", background: "#f0f5ff", color: "#033280", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                {claims.length}
              </span>
            )}
            {t === "Photos" && photos?.length > 0 && (
              <span style={{ marginLeft: 6, padding: "1px 7px", background: "#f0f5ff", color: "#033280", borderRadius: 10, fontSize: 10, fontWeight: 600 }}>
                {photos.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {tab === "Identity" && (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
          <UField label="VIN" value={unit.vin} mono readOnly />
          <UField label="Year" value={editing.year} onChange={v => setEditing({ ...editing, year: parseInt(v, 10) })} canEdit={canEdit} type="number" />
          <UField label="Make / Manufacturer" value={editing.manufacturer} onChange={v => setEditing({ ...editing, manufacturer: v })} canEdit={canEdit} />
          <UField label="Model" value={editing.model} onChange={v => setEditing({ ...editing, model: v })} canEdit={canEdit} />
          <UField label="Stock #" value={editing.stockNumber} onChange={v => setEditing({ ...editing, stockNumber: v })} canEdit={canEdit} />
          <UField label="Status" value={editing.status} onChange={v => setEditing({ ...editing, status: v })} canEdit={canEdit}
            options={["in_inventory", "on_lot", "sold", "delivered", "consigned", "in_service", "sold_out_of_state"]} />
          <UField label="Lot location" value={editing.lotLocation} onChange={v => setEditing({ ...editing, lotLocation: v })} canEdit={canEdit} />
          <UField label="Intake date" value={editing.intakeDate} onChange={v => setEditing({ ...editing, intakeDate: v })} canEdit={canEdit} type="date" />
          <UField label="Sold date" value={unit.soldDate} readOnly />
          <UField label="Dealership" value={dealership?.name || "—"} readOnly />
          {canEdit && (
            <div style={{ gridColumn: "1 / -1", marginTop: 8 }}>
              <button onClick={save} disabled={saving}
                style={{ padding: "8px 16px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
                {saving ? "Saving..." : "Save changes"}
              </button>
            </div>
          )}
        </div>
      )}

      {tab === "Warranty" && (
        <div>
          <USection title="Manufacturer Warranty" status={unit.mfrWarrantyStatus}>
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <UField label="Start date" value={editing.warrantyStart} onChange={v => setEditing({ ...editing, warrantyStart: v })} canEdit={canEdit} type="date" />
              <UField label="End date" value={editing.warrantyEnd} onChange={v => setEditing({ ...editing, warrantyEnd: v })} canEdit={canEdit} type="date" />
            </div>
          </USection>
          <USection title="Extended Warranty" status={unit.extWarrantyStatus}>
            <div style={{ display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 16 }}>
              <UField label="Plan name" value={editing.extendedWarrantyPlan || editing.extWarrantyProvider} onChange={v => setEditing({ ...editing, extendedWarrantyPlan: v })} canEdit={canEdit} />
              <UField label="Start date" value={editing.extendedWarrantyStart} onChange={v => setEditing({ ...editing, extendedWarrantyStart: v })} canEdit={canEdit} type="date" />
              <UField label="End date" value={editing.extWarrantyEnd} onChange={v => setEditing({ ...editing, extWarrantyEnd: v })} canEdit={canEdit} type="date" />
            </div>
          </USection>
          <USection title="Service Contract">
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
              <UField label="Active?" value={editing.serviceContractActive ? "yes" : "no"}
                onChange={v => setEditing({ ...editing, serviceContractActive: v === "yes" })}
                canEdit={canEdit} options={["yes", "no"]} />
              <UField label="End date" value={editing.serviceContractEnd} onChange={v => setEditing({ ...editing, serviceContractEnd: v })} canEdit={canEdit} type="date" />
            </div>
          </USection>
          {canEdit && (
            <button onClick={save} disabled={saving}
              style={{ padding: "8px 16px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600, marginTop: 8 }}>
              {saving ? "Saving..." : "Save warranty changes"}
            </button>
          )}
        </div>
      )}

      {tab === "Customer" && context !== "client" && (
        <div>
          {customer ? (
            <div style={{ padding: 20, background: "white", border: "1px solid #e5eaf2", borderRadius: 8 }}>
              <h3 style={{ margin: "0 0 12px" }}>{customer.firstName} {customer.lastName}</h3>
              <div style={{ fontSize: 13, color: "#666" }}>{customer.email}</div>
              {customer.phone && <div style={{ fontSize: 13, color: "#666" }}>{customer.phone}</div>}
            </div>
          ) : (
            <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fafbfd", borderRadius: 8 }}>
              No customer assigned to this unit yet.
              <div style={{ fontSize: 11, marginTop: 8 }}>Customer is assigned when unit is sold via the Sales workflow.</div>
            </div>
          )}
        </div>
      )}

      {tab === "Photos" && (
        <div>
          <h3 style={{ fontSize: 13, margin: "0 0 12px", color: "#666" }}>Unit Photos</h3>
          <PhotoGallery claimId={unit.id} refreshKey={photoRefreshKey} />
          {canEdit && (
            <div style={{ marginTop: 20 }}>
              <PhotoUploader
                scope="units"
                scopeId={unit.id}
                photoType="unit"
                onUploadComplete={() => setPhotoRefreshKey(k => k + 1)}
              />
            </div>
          )}
        </div>
      )}

      {tab === "Documents" && (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fafbfd", borderRadius: 8 }}>
          Document management coming in Phase 2C.
        </div>
      )}

      {tab === "Claims" && (
        <div>
          {!claims || claims.length === 0 ? (
            <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fafbfd", borderRadius: 8 }}>
              No claims on this unit yet.
              {context === "dealer" && (
                <div style={{ fontSize: 12, marginTop: 8 }}>Click "+ New Claim" above to create one.</div>
              )}
            </div>
          ) : (
            <table style={{ width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden" }}>
              <thead>
                <tr style={{ borderBottom: "2px solid #eee", textAlign: "left", fontSize: 11, color: "#888" }}>
                  <th style={{ padding: 12 }}>Claim #</th>
                  <th>Type</th>
                  <th>Status</th>
                  <th>Submitted</th>
                </tr>
              </thead>
              <tbody>
                {claims.map((c: any) => (
                  <tr key={c.id} style={{ borderBottom: "1px solid #f3f3f3", fontSize: 13 }}>
                    <td style={{ padding: 12, fontWeight: 600 }}>{c.claimNumber}</td>
                    <td>{c.type}</td>
                    <td>
                      <span style={{ padding: "2px 8px", borderRadius: 10, background: "#eaf1fb", color: "#033280", fontSize: 10, fontWeight: 600 }}>
                        {c.status?.replace(/_/g, " ")}
                      </span>
                    </td>
                    <td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : "—"}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      )}

      {tab === "Service" && (
        <div style={{ padding: 40, textAlign: "center", color: "#888", background: "#fafbfd", borderRadius: 8 }}>
          Service history (TechFlow integration) coming in Phase 2D.
        </div>
      )}

      {showNewClaim && (
        <NewClaimModal
          unit={unit}
          onSubmit={submitNewClaim}
          onClose={() => setShowNewClaim(false)}
        />
      )}
    </div>
  );
}

interface UFieldProps {
  label: string;
  value?: string | number | null;
  onChange?: (v: string) => void;
  canEdit?: boolean;
  type?: string;
  options?: string[];
  mono?: boolean;
  readOnly?: boolean;
}

function UField({ label, value, onChange, canEdit, type, options, mono, readOnly }: UFieldProps) {
  const isReadOnly = readOnly || !canEdit;
  return (
    <div>
      <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {isReadOnly ? (
        <div style={{ padding: "8px 0", fontSize: 14, fontFamily: mono ? "monospace" : "inherit" }}>{value ?? "—"}</div>
      ) : options ? (
        <select value={value ?? ""} onChange={e => onChange?.(e.target.value)}
          style={{ width: "100%", padding: 8, border: "1px solid #d5dbe5", borderRadius: 4, fontSize: 13 }}>
          {options.map((o: string) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
        </select>
      ) : (
        <input type={type || "text"} value={value ?? ""} onChange={e => onChange?.(e.target.value)}
          style={{ width: "100%", padding: 8, border: "1px solid #d5dbe5", borderRadius: 4, fontSize: 13, fontFamily: mono ? "monospace" : "inherit" }} />
      )}
    </div>
  );
}

function USection({ title, status, children }: any) {
  const colors: Record<string, string> = { active: "#16a34a", expiring: "#f48120", expired: "#c0392b", none: "#999" };
  const labels: Record<string, string> = { active: "● Active", expiring: "● Expiring soon", expired: "● Expired", none: "Not set" };
  return (
    <div style={{ padding: 20, background: "white", border: "1px solid #e5eaf2", borderRadius: 8, marginBottom: 16 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 12, alignItems: "center" }}>
        <h3 style={{ margin: 0, fontSize: 14 }}>{title}</h3>
        {status && <span style={{ color: colors[status], fontSize: 12, fontWeight: 600 }}>{labels[status]}</span>}
      </div>
      {children}
    </div>
  );
}

function NewClaimModal({ unit, onSubmit, onClose }: any) {
  const [form, setForm] = useState({ type: "", dealerNotes: "" });
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit() {
    if (!form.type) { alert("Claim type required"); return; }
    setSubmitting(true);
    try { await onSubmit(form); }
    finally { setSubmitting(false); }
  }

  return (
    <div onClick={onClose}
      style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000 }}>
      <div onClick={e => e.stopPropagation()}
        style={{ background: "white", padding: 24, borderRadius: 8, minWidth: 480 }}>
        <h2 style={{ margin: "0 0 8px" }}>New Claim</h2>
        <div style={{ fontSize: 12, color: "#666", marginBottom: 16 }}>
          For {unit.year} {unit.manufacturer} {unit.model} · VIN <span style={{ fontFamily: "monospace" }}>{unit.vin}</span>
        </div>
        <div style={{ padding: 12, background: "#f7f9fc", borderRadius: 6, marginBottom: 16, fontSize: 12 }}>
          <strong>Manufacturer:</strong> {unit.manufacturer} (auto-filled from unit)<br />
          <strong>Mfr warranty:</strong>{" "}
          {unit.mfrWarrantyStatus === "active" ? "✓ Active"
            : unit.mfrWarrantyStatus === "expired" ? "Expired"
            : unit.mfrWarrantyStatus === "expiring" ? "Expiring soon"
            : "Not set"}
        </div>
        <div style={{ display: "grid", gap: 10 }}>
          <label style={{ fontSize: 12 }}>Claim type *
            <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}
              style={{ width: "100%", padding: 8, marginTop: 4 }}>
              <option value="">Select type</option>
              <option value="warranty">Warranty</option>
              <option value="extended_warranty">Extended Warranty</option>
              <option value="pdi">PDI</option>
              <option value="daf">DAF</option>
              <option value="insurance">Insurance</option>
            </select>
          </label>
          <label style={{ fontSize: 12 }}>Notes
            <textarea value={form.dealerNotes} onChange={e => setForm({ ...form, dealerNotes: e.target.value })}
              style={{ width: "100%", padding: 8, marginTop: 4, minHeight: 100 }} />
          </label>
          <div style={{ display: "flex", gap: 8, marginTop: 12, justifyContent: "flex-end" }}>
            <button onClick={onClose}
              style={{ padding: "8px 14px", border: "1px solid #ccc", background: "white", borderRadius: 6, cursor: "pointer" }}>
              Cancel
            </button>
            <button onClick={handleSubmit} disabled={submitting}
              style={{ padding: "8px 14px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600 }}>
              {submitting ? "Creating..." : "Create Claim"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
