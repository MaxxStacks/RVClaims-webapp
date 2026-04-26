import { useEffect, useState } from "react";
import { useParams } from "wouter";
import { useApiFetch } from "@/lib/api";
import PortalShell from "@/components/layout/PortalShell";
import OperatorMainNav from "@/pages/nav/OperatorMainNav";

const TABS = ["Overview", "Owner & Staff", "Modules & Pricing", "Subscription", "Branding", "Activity"] as const;

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  active:    { bg: "#dcfce7", color: "#166534" },
  pending:   { bg: "#fef3c7", color: "#92400e" },
  suspended: { bg: "#fee2e2", color: "#991b1b" },
};
const REVIEW_STYLE: Record<string, { bg: string; color: string }> = {
  active:        { bg: "#dcfce7", color: "#166534" },
  pending_review:{ bg: "#fef3c7", color: "#92400e" },
  suspended:     { bg: "#fee2e2", color: "#991b1b" },
  rejected:      { bg: "#f3f4f6", color: "#6b7280" },
};

export default function DealershipDetailPage() {
  const params = useParams<{ id: string }>();
  const apiFetch = useApiFetch();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("Overview");
  const [editing, setEditing] = useState(false);
  const [edit, setEdit] = useState<Record<string, any>>({});

  async function refresh() {
    setLoading(true);
    try {
      const result = await apiFetch<any>(`/api/v6/dealerships/${params.id}`);
      setData(result);
      setEdit(result.dealership);
    } finally { setLoading(false); }
  }
  useEffect(() => { refresh(); }, [params.id]);

  function cancelEdit() {
    setEdit(data.dealership);
    setEditing(false);
  }

  async function save() {
    const allowed = ["name", "email", "phone", "addressLine1", "addressLine2", "city", "stateProvince", "postalCode", "country", "brandingTier", "status", "logoUrl", "primaryColor", "secondaryColor", "fontFamily", "emailFromName", "customSubdomain"];
    const body: any = {};
    for (const k of allowed) if (edit[k] !== undefined) body[k] = edit[k];
    await apiFetch(`/api/v6/dealerships/${params.id}`, { method: "PATCH", body: JSON.stringify(body) });
    setEditing(false);
    await refresh();
  }

  async function approve() {
    if (!confirm("Approve this dealership?")) return;
    await apiFetch(`/api/v6/dealerships/${params.id}/approve`, { method: "POST", body: JSON.stringify({}) });
    await refresh();
  }
  async function reject() {
    const notes = prompt("Reason for rejection:");
    if (notes === null) return;
    await apiFetch(`/api/v6/dealerships/${params.id}/reject`, { method: "POST", body: JSON.stringify({ notes }) });
    await refresh();
  }

  async function toggleModule(moduleKey: string, enable: boolean) {
    if (enable) {
      await apiFetch(`/api/v6/dealerships/${params.id}/modules/${moduleKey}`, { method: "POST", body: JSON.stringify({}) });
    } else {
      await apiFetch(`/api/v6/dealerships/${params.id}/modules/${moduleKey}`, { method: "DELETE" });
    }
    await refresh();
  }

  if (loading) return (
    <PortalShell context="operator" mainNav={
      <nav className="sidebar" style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <OperatorMainNav currentPage="master.mgmt.dealer_accounts" />
      </nav>
    }>
      <main className="main" style={{ marginLeft: 0, flex: 1, overflowY: "auto" }}>
        <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading...</div>
      </main>
    </PortalShell>
  );

  if (!data) return (
    <PortalShell context="operator" mainNav={
      <nav className="sidebar" style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <OperatorMainNav currentPage="master.mgmt.dealer_accounts" />
      </nav>
    }>
      <main className="main" style={{ marginLeft: 0, flex: 1, overflowY: "auto" }}>
        <div style={{ padding: 40, color: "#c0392b" }}>Dealership not found.</div>
      </main>
    </PortalShell>
  );

  const { dealership, users, modules, catalog, kpis } = data;
  const enabledModuleKeys = new Set(modules.filter((m: any) => m.status === "enabled").map((m: any) => m.moduleKey));
  const statusSty = STATUS_STYLE[dealership.status] || { bg: "#f3f4f6", color: "#6b7280" };
  const reviewSty = REVIEW_STYLE[dealership.reviewStatus] || { bg: "#f3f4f6", color: "#6b7280" };
  const needsApproval = dealership.status === "pending" || dealership.reviewStatus === "pending_review";

  return (
    <PortalShell context="operator" mainNav={
      <nav className="sidebar" style={{ position: "relative", width: "100%", height: "100%", display: "flex", flexDirection: "column" }}>
        <OperatorMainNav currentPage="master.mgmt.dealer_accounts" />
      </nav>
    }>
      <main className="main" style={{ marginLeft: 0, flex: 1, overflowY: "auto" }}>
        <div className="content">

          {/* Page header */}
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>Management · Dealer Accounts</div>
              <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: "#111" }}>{dealership.name}</h1>
              <div style={{ display: "flex", gap: 8, marginTop: 8, flexWrap: "wrap", alignItems: "center" }}>
                <span style={{ padding: "2px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: statusSty.bg, color: statusSty.color }}>
                  {dealership.status || "unknown"}
                </span>
                {dealership.reviewStatus && dealership.reviewStatus !== dealership.status && (
                  <span style={{ padding: "2px 10px", borderRadius: 9999, fontSize: 11, fontWeight: 600, background: reviewSty.bg, color: reviewSty.color }}>
                    review: {dealership.reviewStatus.replace("_", " ")}
                  </span>
                )}
                <span style={{ fontSize: 12, color: "#888" }}>{dealership.email}</span>
              </div>
            </div>
            {needsApproval && (
              <div style={{ display: "flex", gap: 8 }}>
                <button onClick={reject} style={{ padding: "9px 18px", border: "1px solid #c0392b", color: "#c0392b", background: "white", borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Reject
                </button>
                <button onClick={approve} style={{ padding: "9px 18px", background: "#16a34a", color: "white", border: 0, borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                  Approve Dealer
                </button>
              </div>
            )}
          </div>

          {/* KPI strip */}
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 24 }}>
            <StatCard label="Units on File" value={kpis.unitCount} />
            <StatCard label="Total Claims" value={kpis.claimCount} />
            <StatCard label="Active Modules" value={modules.filter((m: any) => m.status === "enabled").length} />
          </div>

          {/* Tabs */}
          <div style={{ display: "flex", borderBottom: "1px solid #e5e7eb", marginBottom: 24 }}>
            {TABS.map(t => (
              <button key={t} onClick={() => { setTab(t); setEditing(false); }}
                style={{
                  padding: "10px 18px", background: "transparent", border: 0,
                  borderBottom: tab === t ? "2px solid #033280" : "2px solid transparent",
                  color: tab === t ? "#033280" : "#666",
                  fontWeight: tab === t ? 600 : 400,
                  fontSize: 13, cursor: "pointer", marginBottom: -1,
                }}>
                {t}
              </button>
            ))}
          </div>

          {/* ── Overview tab ── */}
          {tab === "Overview" && (
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Dealership Information</span>
                {!editing ? (
                  <button onClick={() => setEditing(true)}
                    style={{ padding: "6px 14px", border: "1px solid #e0e0e0", borderRadius: 8, background: "white", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                    Edit
                  </button>
                ) : (
                  <div style={{ display: "flex", gap: 8 }}>
                    <button onClick={cancelEdit}
                      style={{ padding: "6px 14px", border: "1px solid #e0e0e0", borderRadius: 8, background: "white", fontSize: 12, fontWeight: 500, cursor: "pointer" }}>
                      Cancel
                    </button>
                    <button onClick={save}
                      style={{ padding: "6px 14px", background: "#033280", color: "white", border: 0, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                      Save changes
                    </button>
                  </div>
                )}
              </div>

              {!editing ? (
                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr" }}>
                  <InfoRow label="Name" value={dealership.name} />
                  <InfoRow label="Email" value={dealership.email} />
                  <InfoRow label="Phone" value={dealership.phone} />
                  <InfoRow label="Status" value={dealership.status} badge={statusSty} />
                  <InfoRow label="Review Status" value={dealership.reviewStatus?.replace("_", " ")} badge={reviewSty} />
                  <InfoRow label="Branding Tier" value={dealership.brandingTier || "base"} />
                  <InfoRow label="Address" value={dealership.addressLine1} />
                  <InfoRow label="City" value={dealership.city} />
                  <InfoRow label="Province / State" value={dealership.stateProvince} />
                  <InfoRow label="Postal Code" value={dealership.postalCode} />
                  <InfoRow label="Country" value={dealership.country} />
                  <InfoRow label="Created" value={dealership.createdAt ? new Date(dealership.createdAt).toLocaleDateString() : undefined} />
                </div>
              ) : (
                <div style={{ padding: 20, display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <EditField label="Name" value={edit.name} onChange={v => setEdit({ ...edit, name: v })} />
                  <EditField label="Email" value={edit.email} onChange={v => setEdit({ ...edit, email: v })} />
                  <EditField label="Phone" value={edit.phone} onChange={v => setEdit({ ...edit, phone: v })} />
                  <EditField label="Status" value={edit.status} onChange={v => setEdit({ ...edit, status: v })} options={["active", "suspended", "pending"]} />
                  <EditField label="Branding Tier" value={edit.brandingTier} onChange={v => setEdit({ ...edit, brandingTier: v })} options={["base", "mid", "enterprise"]} />
                  <EditField label="Address" value={edit.addressLine1} onChange={v => setEdit({ ...edit, addressLine1: v })} />
                  <EditField label="City" value={edit.city} onChange={v => setEdit({ ...edit, city: v })} />
                  <EditField label="Province / State" value={edit.stateProvince} onChange={v => setEdit({ ...edit, stateProvince: v })} />
                  <EditField label="Postal Code" value={edit.postalCode} onChange={v => setEdit({ ...edit, postalCode: v })} />
                  <EditField label="Country" value={edit.country} onChange={v => setEdit({ ...edit, country: v })} />
                </div>
              )}
            </div>
          )}

          {/* ── Owner & Staff tab ── */}
          {tab === "Owner & Staff" && (
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
              <div style={{ padding: "14px 20px", borderBottom: "1px solid #f0f0f0", fontSize: 13, fontWeight: 600, color: "#111" }}>
                Users ({users.length})
              </div>
              {users.length === 0 ? (
                <div style={{ padding: 48, textAlign: "center", color: "#888", fontSize: 13 }}>
                  No users linked to this dealership yet.
                </div>
              ) : (
                <table style={{ width: "100%", borderCollapse: "collapse" }}>
                  <thead>
                    <tr style={{ borderBottom: "1px solid #f0f0f0", background: "#fafafa" }}>
                      {["Name", "Email", "Role", "Active"].map(h => (
                        <th key={h} style={{ padding: "10px 16px", fontSize: 11, fontWeight: 600, color: "#888", textTransform: "uppercase", textAlign: "left" }}>{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {users.map((u: any) => (
                      <tr key={u.id} style={{ borderBottom: "1px solid #f5f5f5", fontSize: 13 }}>
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{u.firstName} {u.lastName}</td>
                        <td style={{ padding: "12px 16px", color: "#555" }}>{u.email}</td>
                        <td style={{ padding: "12px 16px", color: "#555" }}>{u.role}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{ color: u.isActive ? "#16a34a" : "#c0392b", fontWeight: 600, fontSize: 12 }}>
                            {u.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          )}

          {/* ── Modules & Pricing tab ── */}
          {tab === "Modules & Pricing" && (
            <div style={{ display: "grid", gap: 10 }}>
              {catalog.map((mod: any) => {
                const isEnabled = enabledModuleKeys.has(mod.moduleKey);
                const isRequired = mod.isBaseRequired;
                return (
                  <div key={mod.moduleKey} style={{ padding: 16, border: "1px solid #e5e7eb", borderRadius: 8, background: isEnabled ? "#eff6ff" : "white" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
                      <div style={{ flex: 1 }}>
                        <div style={{ fontSize: 14, fontWeight: 600, color: "#111" }}>
                          {mod.name}
                          {isRequired && <span style={{ marginLeft: 8, padding: "1px 6px", background: "#888", color: "white", fontSize: 9, borderRadius: 4, fontWeight: 600 }}>REQUIRED</span>}
                        </div>
                        <div style={{ fontSize: 12, color: "#666", marginTop: 4, lineHeight: 1.5 }}>{mod.description}</div>
                        <div style={{ fontSize: 11, color: "#888", marginTop: 6 }}>
                          {mod.pricingType}
                          {mod.defaultMonthlyCents ? <> · ${(mod.defaultMonthlyCents / 100).toFixed(2)}/mo</> : null}
                          {mod.defaultPerUseCents ? <> · ${(mod.defaultPerUseCents / 100).toFixed(2)}/use</> : null}
                          {mod.defaultCommissionBps ? <> · {(mod.defaultCommissionBps / 100).toFixed(2)}% commission</> : null}
                        </div>
                      </div>
                      {!isRequired && (
                        <button onClick={() => toggleModule(mod.moduleKey, !isEnabled)}
                          style={{
                            padding: "7px 14px", borderRadius: 8, cursor: "pointer", fontSize: 12, fontWeight: 600,
                            background: isEnabled ? "white" : "#22c55e",
                            color: isEnabled ? "#c0392b" : "white",
                            border: isEnabled ? "1px solid #c0392b" : "0",
                          }}>
                          {isEnabled ? "Disable" : "Enable"}
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}

          {/* ── Subscription tab ── */}
          {tab === "Subscription" && (
            <div style={{ padding: 48, textAlign: "center", color: "#888", background: "white", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13 }}>
              Stripe billing integration coming in Phase 3. Module pricing is configured per-dealer in the Modules tab.
            </div>
          )}

          {/* ── Branding tab ── */}
          {tab === "Branding" && (
            <div style={{ background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", padding: "14px 20px", borderBottom: "1px solid #f0f0f0" }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: "#111" }}>Branding Settings</span>
                <button onClick={save}
                  style={{ padding: "6px 14px", background: "#033280", color: "white", border: 0, borderRadius: 8, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                  Save branding
                </button>
              </div>
              <div style={{ padding: 20 }}>
                <div style={{ padding: 12, borderRadius: 8, marginBottom: 16, fontSize: 12,
                  background: dealership.brandingTier === "base" ? "#fff7ed" : "#f0fdf4",
                  color: dealership.brandingTier === "base" ? "#92400e" : "#166534" }}>
                  {dealership.brandingTier === "base" && "Base tier — portal uses DS360 branding. Upgrade to Mid or Enterprise to enable custom branding."}
                  {dealership.brandingTier === "mid" && "Mid tier — dealer can customize logo, 2 colors, font, and email sender name."}
                  {dealership.brandingTier === "enterprise" && "Enterprise tier — full white-label including client portal and custom subdomain."}
                  {!dealership.brandingTier && "Base tier — portal uses DS360 branding."}
                </div>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 16 }}>
                  <EditField label="Logo URL" value={edit.logoUrl} onChange={v => setEdit({ ...edit, logoUrl: v })} />
                  <EditField label="Primary color" value={edit.primaryColor} onChange={v => setEdit({ ...edit, primaryColor: v })} />
                  <EditField label="Secondary color" value={edit.secondaryColor} onChange={v => setEdit({ ...edit, secondaryColor: v })} />
                  <EditField label="Email from name" value={edit.emailFromName} onChange={v => setEdit({ ...edit, emailFromName: v })} />
                  {dealership.brandingTier === "enterprise" && (
                    <EditField label="Custom subdomain" value={edit.customSubdomain} onChange={v => setEdit({ ...edit, customSubdomain: v })} />
                  )}
                </div>
              </div>
            </div>
          )}

          {/* ── Activity tab ── */}
          {tab === "Activity" && (
            <div style={{ padding: 48, textAlign: "center", color: "#888", background: "white", border: "1px solid #e5e7eb", borderRadius: 8, fontSize: 13 }}>
              Activity log coming in Phase 3.
            </div>
          )}

        </div>
      </main>
    </PortalShell>
  );
}

function StatCard({ label, value }: { label: string; value: number }) {
  return (
    <div style={{ padding: 20, background: "white", border: "1px solid #e5e7eb", borderRadius: 8 }}>
      <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 28, fontWeight: 700, color: "#033280" }}>{value}</div>
    </div>
  );
}

function InfoRow({ label, value, badge }: { label: string; value?: string | null; badge?: { bg: string; color: string } }) {
  return (
    <div style={{ padding: "14px 20px", borderBottom: "1px solid #f5f5f5", borderRight: "1px solid #f5f5f5" }}>
      <div style={{ fontSize: 10, color: "#aaa", textTransform: "uppercase", fontWeight: 600, marginBottom: 4 }}>{label}</div>
      {badge && value ? (
        <span style={{ padding: "2px 10px", borderRadius: 9999, fontSize: 12, fontWeight: 600, background: badge.bg, color: badge.color }}>
          {value}
        </span>
      ) : (
        <div style={{ fontSize: 13, color: value ? "#111" : "#ccc", fontWeight: value ? 500 : 400 }}>
          {value || "—"}
        </div>
      )}
    </div>
  );
}

function EditField({ label, value, onChange, options }: { label: string; value?: string; onChange: (v: string) => void; options?: string[] }) {
  return (
    <div>
      <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 6 }}>{label}</div>
      {options ? (
        <select value={value || ""} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, background: "white" }}>
          {options.map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
        </select>
      ) : (
        <input value={value || ""} onChange={e => onChange(e.target.value)}
          style={{ width: "100%", padding: "8px 10px", border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, boxSizing: "border-box" }} />
      )}
    </div>
  );
}
