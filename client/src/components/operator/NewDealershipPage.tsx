import { useState, useEffect } from "react";
import { useApiFetch } from "@/lib/api";
import { useLocation } from "wouter";

const STEPS = ["Business Info", "Branding Tier", "Modules", "Review & Create"] as const;

const TIERS = [
  { key: "base", name: "Base", desc: "DealerSuite 360 branding throughout. Required claims module included." },
  { key: "mid", name: "Mid", desc: "Dealer can customize their portal: logo, 2 colors, font, email-from name. Client portal still DS360-branded." },
  { key: "enterprise", name: "Enterprise", desc: "Full white-label. Custom subdomain. Client portal inherits dealer branding." },
];

export default function NewDealershipPage() {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [step, setStep] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [biz, setBiz] = useState({
    name: "", email: "", phone: "",
    addressLine1: "", addressLine2: "", city: "", stateProvince: "", postalCode: "", country: "CA",
  });
  const [tier, setTier] = useState("base");
  const [catalog, setCatalog] = useState<any[]>([]);
  const [enabledKeys, setEnabledKeys] = useState<string[]>(["claims"]);

  useEffect(() => {
    apiFetch<any[]>("/api/v6/dealerships/catalog/modules").then(setCatalog).catch(() => setCatalog([]));
  }, []);

  function next() {
    if (step === 0) {
      if (!biz.name || !biz.email) { alert("Name and email required"); return; }
    }
    setStep(s => Math.min(s + 1, STEPS.length - 1));
  }
  function back() { setStep(s => Math.max(s - 1, 0)); }

  async function submit() {
    setSubmitting(true);
    try {
      const created = await apiFetch<any>("/api/v6/dealerships", {
        method: "POST",
        body: JSON.stringify({ ...biz, brandingTier: tier }),
      });
      for (const key of enabledKeys) {
        if (key === "claims") continue;
        await apiFetch(`/api/v6/dealerships/${created.id}/modules/${key}`, { method: "POST", body: JSON.stringify({}) });
      }
      navigate(`/operator-v6/dealerships/${created.id}`);
    } catch (err: any) {
      alert("Failed: " + (err.message || err));
    } finally { setSubmitting(false); }
  }

  return (
    <div style={{display: "flex", minHeight: "100vh", background: "#f5f6f8"}}>
      <div style={{width: 240, background: "white", borderRight: "1px solid #e5e7eb", padding: 24}}>
        <button onClick={() => navigate("/operator-v6/dealerships")} style={{background: "none", border: 0, color: "#033280", fontSize: 12, cursor: "pointer", marginBottom: 24}}>
          ← Cancel
        </button>
        <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 12}}>New Dealership</div>
        {STEPS.map((s, i) => (
          <div key={s} style={{
            padding: "10px 12px", marginBottom: 4, borderRadius: 6,
            background: step === i ? "#eff6ff" : "transparent",
            color: step === i ? "#033280" : i < step ? "#16a34a" : "#888",
            fontSize: 13, fontWeight: step === i ? 600 : 400,
            display: "flex", alignItems: "center", gap: 8,
          }}>
            <span style={{width: 20, height: 20, borderRadius: 10,
              background: i < step ? "#16a34a" : step === i ? "#033280" : "#e0e0e0",
              color: "white", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 11, fontWeight: 600,
              flexShrink: 0,
            }}>
              {i < step ? "✓" : i + 1}
            </span>
            {s}
          </div>
        ))}
      </div>

      <div style={{flex: 1, padding: 32, maxWidth: 800}}>
        <h1 style={{fontSize: 24, fontWeight: 700, marginBottom: 24}}>{STEPS[step]}</h1>

        {step === 0 && (
          <div style={{display: "grid", gap: 14}}>
            <Field label="Dealership name *" value={biz.name} onChange={v => setBiz({...biz, name: v})}/>
            <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
              <Field label="Contact email *" value={biz.email} onChange={v => setBiz({...biz, email: v})} type="email"/>
              <Field label="Phone" value={biz.phone} onChange={v => setBiz({...biz, phone: v})}/>
            </div>
            <Field label="Address line 1" value={biz.addressLine1} onChange={v => setBiz({...biz, addressLine1: v})}/>
            <Field label="Address line 2" value={biz.addressLine2} onChange={v => setBiz({...biz, addressLine2: v})}/>
            <div style={{display: "grid", gridTemplateColumns: "2fr 1fr 1fr", gap: 12}}>
              <Field label="City" value={biz.city} onChange={v => setBiz({...biz, city: v})}/>
              <Field label="Province/State" value={biz.stateProvince} onChange={v => setBiz({...biz, stateProvince: v})}/>
              <Field label="Postal/ZIP" value={biz.postalCode} onChange={v => setBiz({...biz, postalCode: v})}/>
            </div>
            <Field label="Country" value={biz.country} onChange={v => setBiz({...biz, country: v})}/>
          </div>
        )}

        {step === 1 && (
          <div style={{display: "grid", gap: 12}}>
            {TIERS.map(t => (
              <div key={t.key} onClick={() => setTier(t.key)}
                style={{
                  padding: 20, border: tier === t.key ? "2px solid #033280" : "1px solid #e5e7eb",
                  borderRadius: 8, cursor: "pointer", background: tier === t.key ? "#eff6ff" : "white",
                }}>
                <div style={{display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 6}}>
                  <h3 style={{margin: 0, fontSize: 16, color: tier === t.key ? "#033280" : "#222"}}>{t.name}</h3>
                  {tier === t.key && <span style={{color: "#033280", fontSize: 18}}>●</span>}
                </div>
                <div style={{fontSize: 12, color: "#666", lineHeight: 1.5}}>{t.desc}</div>
              </div>
            ))}
          </div>
        )}

        {step === 2 && (
          <div>
            <p style={{fontSize: 13, color: "#666", marginBottom: 16}}>
              Claims is enabled by default. Select additional modules to enable for this dealer.
            </p>
            {catalog.length === 0 ? (
              <div style={{padding: 24, background: "#fafafa", borderRadius: 8, fontSize: 12, color: "#888"}}>
                Module catalog couldn't load. Enable modules from the dealership detail page after creation.
              </div>
            ) : (
              <div style={{display: "grid", gap: 8}}>
                {catalog.map((mod: any) => {
                  const isEnabled = enabledKeys.includes(mod.moduleKey);
                  const isRequired = mod.isBaseRequired;
                  return (
                    <div key={mod.moduleKey}
                      onClick={() => {
                        if (isRequired) return;
                        setEnabledKeys(keys => isEnabled ? keys.filter(k => k !== mod.moduleKey) : [...keys, mod.moduleKey]);
                      }}
                      style={{
                        padding: 14, border: "1px solid #e5e7eb", borderRadius: 8,
                        background: isEnabled ? "#eff6ff" : "white",
                        cursor: isRequired ? "default" : "pointer", opacity: isRequired ? 0.7 : 1,
                      }}>
                      <div style={{display: "flex", alignItems: "center", justifyContent: "space-between"}}>
                        <div>
                          <div style={{fontSize: 13, fontWeight: 600}}>{mod.name} {isRequired && <span style={{fontSize: 10, color: "#888", fontWeight: 400}}>(required)</span>}</div>
                          <div style={{fontSize: 11, color: "#666", marginTop: 4}}>{mod.description}</div>
                        </div>
                        <input type="checkbox" checked={isEnabled || isRequired} disabled={isRequired} readOnly style={{transform: "scale(1.3)"}}/>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {step === 3 && (
          <div style={{padding: 20, background: "white", borderRadius: 8, border: "1px solid #e5e7eb"}}>
            <div style={{marginBottom: 14}}>
              <strong style={{display: "block", marginBottom: 4}}>{biz.name}</strong>
              <span style={{fontSize: 12, color: "#666"}}>{biz.email}</span>
              {biz.phone && <span style={{fontSize: 12, color: "#666"}}> · {biz.phone}</span>}
            </div>
            {biz.addressLine1 && (
              <div style={{fontSize: 12, color: "#666", marginBottom: 14}}>
                {biz.addressLine1}{biz.addressLine2 ? `, ${biz.addressLine2}` : ""}<br/>
                {biz.city}{biz.stateProvince ? `, ${biz.stateProvince}` : ""} {biz.postalCode}<br/>
                {biz.country}
              </div>
            )}
            <div style={{padding: 12, background: "#fafafa", borderRadius: 6, fontSize: 12}}>
              <strong>Branding tier:</strong> {TIERS.find(t => t.key === tier)?.name}<br/>
              <strong>Modules to enable:</strong> {enabledKeys.join(", ") || "Claims (only)"}
            </div>
            <div style={{marginTop: 16, padding: 12, background: "#fff7ed", borderRadius: 6, fontSize: 12, color: "#92400e"}}>
              After creation, you can invite the dealer owner from the dealership detail page.
              Stripe billing is not yet connected — pricing will be set up later.
            </div>
          </div>
        )}

        <div style={{display: "flex", justifyContent: "space-between", marginTop: 32}}>
          <button onClick={back} disabled={step === 0}
            style={{padding: "10px 18px", border: "1px solid #e0e0e0", background: "white", borderRadius: 8, cursor: step === 0 ? "default" : "pointer", opacity: step === 0 ? 0.5 : 1}}>
            ← Back
          </button>
          {step < STEPS.length - 1 ? (
            <button onClick={next} style={{padding: "10px 24px", background: "#033280", color: "white", border: 0, borderRadius: 8, cursor: "pointer", fontWeight: 600}}>
              Next →
            </button>
          ) : (
            <button onClick={submit} disabled={submitting}
              style={{padding: "10px 24px", background: "#22c55e", color: "white", border: 0, borderRadius: 8, cursor: submitting ? "wait" : "pointer", fontWeight: 600}}>
              {submitting ? "Creating..." : "Create Dealership"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function Field({ label, value, onChange, type }: { label: string; value: string; onChange: (v: string) => void; type?: string }) {
  return (
    <div>
      <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 4}}>{label}</div>
      <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)}
        style={{width: "100%", padding: "10px 12px", fontSize: 13, border: "1px solid #e0e0e0", borderRadius: 8}}/>
    </div>
  );
}
