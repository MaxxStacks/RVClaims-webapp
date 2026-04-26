import { useEffect, useState } from "react";
import { useParams, useLocation } from "wouter";
import { useApiFetch } from "@/lib/api";

const TABS = ["Overview", "Owner & Staff", "Modules & Pricing", "Subscription", "Branding", "Activity"] as const;

export default function DealershipDetailPage() {
  const params = useParams<{ id: string }>();
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [data, setData] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState<string>("Overview");
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

  async function save() {
    const allowed = ["name", "email", "phone", "addressLine1", "addressLine2", "city", "stateProvince", "postalCode", "country", "brandingTier", "status", "logoUrl", "primaryColor", "secondaryColor", "fontFamily", "emailFromName", "customSubdomain"];
    const body: any = {};
    for (const k of allowed) if (edit[k] !== undefined) body[k] = edit[k];
    await apiFetch(`/api/v6/dealerships/${params.id}`, { method: "PATCH", body: JSON.stringify(body) });
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

  if (loading) return <div style={{padding: 40, textAlign: "center"}}>Loading...</div>;
  if (!data) return <div style={{padding: 40, color: "#c0392b"}}>Not found</div>;

  const { dealership, users, modules, catalog, kpis } = data;
  const enabledModuleKeys = new Set(modules.filter((m: any) => m.status === "enabled").map((m: any) => m.moduleKey));

  return (
    <div style={{padding: 24}}>
      <button onClick={() => navigate("/operator-v6/dealerships")} style={{background: "none", border: 0, color: "#033280", fontSize: 12, cursor: "pointer", marginBottom: 12}}>
        ← Back to Dealer Accounts
      </button>

      <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 16}}>
        <div>
          <h1 style={{margin: 0, fontSize: 24, fontWeight: 700}}>{dealership.name}</h1>
          <div style={{fontSize: 12, color: "#666", marginTop: 4}}>
            {dealership.email} · Tier: {dealership.brandingTier || "base"} · Status: {dealership.reviewStatus || "active"}
          </div>
        </div>
        {dealership.reviewStatus === "pending_review" && (
          <div style={{display: "flex", gap: 8}}>
            <button onClick={reject} style={{padding: "8px 16px", border: "1px solid #c0392b", color: "#c0392b", background: "white", borderRadius: 6, cursor: "pointer"}}>Reject</button>
            <button onClick={approve} style={{padding: "8px 16px", background: "#16a34a", color: "white", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600}}>Approve</button>
          </div>
        )}
      </div>

      <div style={{display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 12, marginBottom: 20}}>
        <Stat label="Units" value={kpis.unitCount}/>
        <Stat label="Claims" value={kpis.claimCount}/>
        <Stat label="Active Modules" value={modules.filter((m: any) => m.status === "enabled").length}/>
      </div>

      <div style={{display: "flex", borderBottom: "1px solid #e5eaf2", marginBottom: 20}}>
        {TABS.map(t => (
          <button key={t} onClick={() => setTab(t)}
            style={{
              padding: "10px 18px", background: "transparent", border: 0,
              borderBottom: tab === t ? "2px solid #033280" : "2px solid transparent",
              color: tab === t ? "#033280" : "#666", fontWeight: tab === t ? 600 : 400,
              fontSize: 13, cursor: "pointer", marginBottom: -1,
            }}>
            {t}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <div style={{display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: 14}}>
          <DField label="Name" value={edit.name} onChange={(v: string) => setEdit({...edit, name: v})}/>
          <DField label="Email" value={edit.email} onChange={(v: string) => setEdit({...edit, email: v})}/>
          <DField label="Phone" value={edit.phone} onChange={(v: string) => setEdit({...edit, phone: v})}/>
          <DField label="Status" value={edit.status} onChange={(v: string) => setEdit({...edit, status: v})} options={["active","suspended","pending"]}/>
          <DField label="Branding tier" value={edit.brandingTier} onChange={(v: string) => setEdit({...edit, brandingTier: v})} options={["base","mid","enterprise"]}/>
          <DField label="Address" value={edit.addressLine1} onChange={(v: string) => setEdit({...edit, addressLine1: v})}/>
          <DField label="City" value={edit.city} onChange={(v: string) => setEdit({...edit, city: v})}/>
          <DField label="Province/State" value={edit.stateProvince} onChange={(v: string) => setEdit({...edit, stateProvince: v})}/>
          <DField label="Postal code" value={edit.postalCode} onChange={(v: string) => setEdit({...edit, postalCode: v})}/>
          <div style={{gridColumn: "1 / -1", marginTop: 8}}>
            <button onClick={save} style={{padding: "8px 16px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600}}>
              Save changes
            </button>
          </div>
        </div>
      )}

      {tab === "Owner & Staff" && (
        <div>
          {users.length === 0 ? (
            <div style={{padding: 40, textAlign: "center", color: "#888", background: "#fafbfd", borderRadius: 8}}>
              No users linked to this dealership yet. (Invite functionality coming soon — for now, link users via Clerk dashboard public_metadata.dealershipId)
            </div>
          ) : (
            <table style={{width: "100%", borderCollapse: "collapse", background: "white", borderRadius: 8, overflow: "hidden"}}>
              <thead><tr style={{borderBottom: "2px solid #eee", textAlign: "left", fontSize: 11, color: "#888"}}>
                <th style={{padding: 12}}>Name</th><th>Email</th><th>Role</th><th>Active</th>
              </tr></thead>
              <tbody>{users.map((u: any) => (
                <tr key={u.id} style={{borderBottom: "1px solid #f3f3f3", fontSize: 13}}>
                  <td style={{padding: 12, fontWeight: 600}}>{u.firstName} {u.lastName}</td>
                  <td>{u.email}</td>
                  <td>{u.role}</td>
                  <td>{u.isActive ? "✓" : "✗"}</td>
                </tr>
              ))}</tbody>
            </table>
          )}
        </div>
      )}

      {tab === "Modules & Pricing" && (
        <div style={{display: "grid", gap: 10}}>
          {catalog.map((mod: any) => {
            const isEnabled = enabledModuleKeys.has(mod.moduleKey);
            const isRequired = mod.isBaseRequired;
            return (
              <div key={mod.moduleKey} style={{padding: 16, border: "1px solid #e5eaf2", borderRadius: 8, background: isEnabled ? "#f0f5ff" : "white"}}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "flex-start"}}>
                  <div style={{flex: 1}}>
                    <div style={{fontSize: 14, fontWeight: 600}}>{mod.name}{isRequired && <span style={{marginLeft: 6, padding: "1px 6px", background: "#888", color: "white", fontSize: 9, borderRadius: 4}}>REQUIRED</span>}</div>
                    <div style={{fontSize: 11, color: "#666", marginTop: 4, lineHeight: 1.4}}>{mod.description}</div>
                    <div style={{fontSize: 11, color: "#888", marginTop: 6}}>
                      Pricing: {mod.pricingType}
                      {mod.defaultMonthlyCents ? <> · ${(mod.defaultMonthlyCents / 100).toFixed(2)}/mo</> : null}
                      {mod.defaultPerUseCents ? <> · ${(mod.defaultPerUseCents / 100).toFixed(2)}/use</> : null}
                      {mod.defaultCommissionBps ? <> · {(mod.defaultCommissionBps / 100).toFixed(2)}% commission</> : null}
                    </div>
                  </div>
                  {!isRequired && (
                    <button onClick={() => toggleModule(mod.moduleKey, !isEnabled)}
                      style={{padding: "6px 14px", background: isEnabled ? "white" : "#0cb22c", color: isEnabled ? "#c0392b" : "white",
                        border: isEnabled ? "1px solid #c0392b" : "0", borderRadius: 6, cursor: "pointer", fontSize: 12, fontWeight: 600}}>
                      {isEnabled ? "Disable" : "Enable"}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}

      {tab === "Subscription" && (
        <div style={{padding: 40, textAlign: "center", color: "#888", background: "#fafbfd", borderRadius: 8}}>
          Stripe billing integration coming in Phase 2D. Module pricing is configured per-dealer in Modules tab.
        </div>
      )}

      {tab === "Branding" && (
        <div style={{display: "grid", gap: 14}}>
          <div style={{padding: 16, background: dealership.brandingTier === "base" ? "#fff7ed" : "#f0fdf4", borderRadius: 8, fontSize: 12, color: dealership.brandingTier === "base" ? "#92400e" : "#166534"}}>
            {dealership.brandingTier === "base" && "This dealership is on Base tier — branding is fixed to DealerSuite 360. Upgrade to Mid or Enterprise to enable custom branding."}
            {dealership.brandingTier === "mid" && "Mid tier: dealer can customize their portal (logo, 2 colors, font, email-from). Client portal still shows DS360 branding."}
            {dealership.brandingTier === "enterprise" && "Enterprise tier: full white-label including client portal + custom subdomain support."}
          </div>
          <DField label="Logo URL" value={edit.logoUrl} onChange={(v: string) => setEdit({...edit, logoUrl: v})}/>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
            <DField label="Primary color" value={edit.primaryColor} onChange={(v: string) => setEdit({...edit, primaryColor: v})}/>
            <DField label="Secondary color" value={edit.secondaryColor} onChange={(v: string) => setEdit({...edit, secondaryColor: v})}/>
          </div>
          <DField label="Email from name" value={edit.emailFromName} onChange={(v: string) => setEdit({...edit, emailFromName: v})}/>
          {dealership.brandingTier === "enterprise" && (
            <DField label="Custom subdomain" value={edit.customSubdomain} onChange={(v: string) => setEdit({...edit, customSubdomain: v})}/>
          )}
          <button onClick={save} style={{padding: "8px 16px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600, justifySelf: "start"}}>
            Save branding
          </button>
        </div>
      )}

      {tab === "Activity" && (
        <div style={{padding: 40, textAlign: "center", color: "#888", background: "#fafbfd", borderRadius: 8}}>
          Activity log coming in Phase 2D.
        </div>
      )}
    </div>
  );
}

function Stat({ label, value }: any) {
  return (
    <div style={{padding: 16, background: "white", border: "1px solid #e5eaf2", borderRadius: 8}}>
      <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600}}>{label}</div>
      <div style={{fontSize: 20, fontWeight: 700, color: "#033280", marginTop: 4}}>{value}</div>
    </div>
  );
}
function DField({ label, value, onChange, options }: any) {
  return (
    <div>
      <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 4}}>{label}</div>
      {options ? (
        <select value={value || ""} onChange={e => onChange(e.target.value)}
          style={{width: "100%", padding: 8, border: "1px solid #d5dbe5", borderRadius: 4, fontSize: 13}}>
          {options.map((o: string) => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
        </select>
      ) : (
        <input value={value || ""} onChange={e => onChange(e.target.value)}
          style={{width: "100%", padding: 8, border: "1px solid #d5dbe5", borderRadius: 4, fontSize: 13}}/>
      )}
    </div>
  );
}
