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
  const [photoRefreshKey, setPhotoRefreshKey] = useState(0);
  const [saving, setSaving] = useState(false);
  const [siblingUnits, setSiblingUnits] = useState<any[]>([]);
  const [siblingFilter, setSiblingFilter] = useState({ search: "", status: "" });

  const tabs = context === "client" ? TABS_CLIENT : TABS_ALL;
  const canEdit = context !== "client";
  const showSidebar = context !== "client";

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

  useEffect(() => {
    if (!showSidebar) return;
    const p = new URLSearchParams();
    if (siblingFilter.status) p.set("status", siblingFilter.status);
    if (siblingFilter.search) p.set("search", siblingFilter.search);
    apiFetch<any[]>(`/api/v6/units?${p.toString()}`).then(setSiblingUnits).catch(() => {});
  }, [siblingFilter.status, siblingFilter.search, showSidebar]);

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

  if (loading) return <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>;
  if (!data) return <div style={{ padding: 40, textAlign: "center", color: "#c0392b" }}>Unit not found</div>;

  const { unit, claims, photos, customer, dealership } = data;

  return (
    <div style={{ display: "flex", minHeight: "100vh", background: "#f7f9fc" }}>
      {showSidebar && (
        <div style={{ width: 260, background: "white", borderRight: "1px solid #e5eaf2", display: "flex", flexDirection: "column", overflow: "hidden", flexShrink: 0 }}>
          <div style={{ padding: 16, borderBottom: "1px solid #f0f2f5" }}>
            <button onClick={() => navigate(`/${context}-v6`)} style={{ background: "none", border: 0, color: "#033280", fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 12 }}>
              ← All Inventory
            </button>
            <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>Other Units</div>
            <input
              placeholder="Search VIN, make..."
              value={siblingFilter.search}
              onChange={e => setSiblingFilter({ ...siblingFilter, search: e.target.value })}
              style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #d5dbe5", borderRadius: 4, marginBottom: 6, boxSizing: "border-box" }}
            />
            <select
              value={siblingFilter.status}
              onChange={e => setSiblingFilter({ ...siblingFilter, status: e.target.value })}
              style={{ width: "100%", padding: "6px 8px", fontSize: 11, border: "1px solid #d5dbe5", borderRadius: 4 }}
            >
              <option value="">All statuses</option>
              <option value="in_inventory">In Stock</option>
              <option value="sold">Sold</option>
              <option value="in_service">In Service</option>
              <option value="consigned">Consigned</option>
            </select>
          </div>
          <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
            {siblingUnits.length === 0 ? (
              <div style={{ padding: 16, fontSize: 11, color: "#888", textAlign: "center" }}>No units</div>
            ) : siblingUnits.map(u => {
              const isActive = u.id === params.id;
              return (
                <div
                  key={u.id}
                  onClick={() => navigate(`/${context}-v6/units/${u.id}`)}
                  style={{
                    padding: "10px 16px", cursor: "pointer",
                    background: isActive ? "#eaf1fb" : "transparent",
                    borderLeft: isActive ? "3px solid #033280" : "3px solid transparent",
                  }}
                  onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = "#f7f9fc"; }}
                  onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
                >
                  <div style={{ fontSize: 12, fontWeight: 600, color: isActive ? "#033280" : "#222" }}>
                    {u.year} {u.make}
                  </div>
                  <div style={{ fontSize: 10, color: "#888", fontFamily: "monospace", marginTop: 2 }}>
                    {u.vin?.slice(-8)}
                  </div>
                  <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                    <span style={{ fontSize: 9, padding: "1px 5px", background: "#f0f2f5", color: "#666", borderRadius: 3 }}>{u.status?.replace(/_/g, " ")}</span>
                    {u.mfrWarrantyStatus === "active" && <span style={{ fontSize: 9, padding: "1px 5px", background: "#dcfce7", color: "#166534", borderRadius: 3 }}>● W</span>}
                    {u.mfrWarrantyStatus === "expiring" && <span style={{ fontSize: 9, padding: "1px 5px", background: "#fef3c7", color: "#92400e", borderRadius: 3 }}>● W</span>}
                    {u.mfrWarrantyStatus === "expired" && <span style={{ fontSize: 9, padding: "1px 5px", background: "#fee2e2", color: "#991b1b", borderRadius: 3 }}>● W</span>}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      <div style={{ flex: 1, padding: 24, overflowY: "auto" }}>
      <div style={{ marginBottom: 16 }}>
        {!showSidebar && (
          <button onClick={() => navigate(`/${context}-v6`)}
            style={{ background: "none", border: 0, color: "#033280", fontSize: 12, cursor: "pointer", marginBottom: 8, padding: 0 }}>
            ← Back to inventory
          </button>
        )}
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
            <button onClick={() => navigate(`/dealer-v6/units/${params.id}/claims/new`)}
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

      </div>
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

