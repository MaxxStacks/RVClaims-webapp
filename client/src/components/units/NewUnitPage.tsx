import { useState, useEffect } from "react";
import { useApiFetch } from "@/lib/api";
import { useLocation } from "wouter";

export default function NewUnitPage() {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [recentUnits, setRecentUnits] = useState<any[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({
    vin: "", year: new Date().getFullYear(), make: "", model: "", stockNumber: "", status: "in_inventory",
    intakeDate: "", lotLocation: "",
    manufacturerWarrantyStart: "", manufacturerWarrantyEnd: "",
    extendedWarrantyPlan: "", extendedWarrantyStart: "", extendedWarrantyEnd: "",
  });

  useEffect(() => {
    apiFetch<any[]>("/api/v6/units").then(rows => setRecentUnits(rows.slice(0, 10))).catch(() => {});
  }, []);

  async function submit() {
    if (!form.vin || !form.make) { alert("VIN and make required"); return; }
    setSubmitting(true);
    try {
      const created = await apiFetch<any>("/api/v6/units", { method: "POST", body: JSON.stringify(form) });
      navigate(`/dealer-v6/units/${created.id}`);
    } catch (err: any) {
      alert("Failed: " + (err.message || err));
    } finally { setSubmitting(false); }
  }

  return (
    <div style={{display: "flex", minHeight: "100vh", background: "#f5f6f8"}}>
      <div style={{width: 240, background: "white", borderRight: "1px solid #e5e7eb", padding: 20, overflowY: "auto"}}>
        <button onClick={() => navigate("/dealer-v6")} style={{background: "none", border: 0, color: "#033280", fontSize: 12, cursor: "pointer", marginBottom: 20}}>
          ← Back to Inventory
        </button>
        <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 12}}>Recent Units</div>
        {recentUnits.map(u => (
          <div key={u.id} onClick={() => navigate(`/dealer-v6/units/${u.id}`)}
            style={{padding: "8px 10px", marginBottom: 4, borderRadius: 4, cursor: "pointer", fontSize: 12}}
            onMouseEnter={e => e.currentTarget.style.background = "#f5f5f5"}
            onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
            <div style={{fontWeight: 600}}>{u.year} {u.make}</div>
            <div style={{fontSize: 10, color: "#888"}}>{u.vin}</div>
          </div>
        ))}
      </div>

      <div style={{flex: 1, padding: 32, maxWidth: 900}}>
        <h1 style={{fontSize: 24, fontWeight: 700, marginBottom: 6}}>New Unit</h1>
        <p style={{fontSize: 13, color: "#666", marginBottom: 24}}>Add a new RV/trailer to your inventory.</p>

        <Section title="Identity">
          <Field label="VIN *" value={form.vin} onChange={(v: string) => setForm({...form, vin: v.toUpperCase()})} mono maxLen={17}/>
          <div style={{display: "grid", gridTemplateColumns: "1fr 2fr 2fr", gap: 12}}>
            <Field label="Year *" value={form.year} onChange={(v: string) => setForm({...form, year: parseInt(v, 10) || form.year})} type="number"/>
            <Field label="Make *" value={form.make} onChange={(v: string) => setForm({...form, make: v})} placeholder="Jayco, Forest River..."/>
            <Field label="Model" value={form.model} onChange={(v: string) => setForm({...form, model: v})}/>
          </div>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr 2fr", gap: 12}}>
            <Field label="Stock #" value={form.stockNumber} onChange={(v: string) => setForm({...form, stockNumber: v})}/>
            <Field label="Status" value={form.status} onChange={(v: string) => setForm({...form, status: v})} options={["in_inventory","sold","consigned","in_service"]}/>
            <Field label="Lot location" value={form.lotLocation} onChange={(v: string) => setForm({...form, lotLocation: v})} placeholder="Front row, Bay 2..."/>
          </div>
          <Field label="Intake date" value={form.intakeDate} onChange={(v: string) => setForm({...form, intakeDate: v})} type="date"/>
        </Section>

        <Section title="Manufacturer Warranty">
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
            <Field label="Start date" value={form.manufacturerWarrantyStart} onChange={(v: string) => setForm({...form, manufacturerWarrantyStart: v})} type="date"/>
            <Field label="End date" value={form.manufacturerWarrantyEnd} onChange={(v: string) => setForm({...form, manufacturerWarrantyEnd: v})} type="date"/>
          </div>
        </Section>

        <Section title="Extended Warranty (optional)">
          <Field label="Plan name" value={form.extendedWarrantyPlan} onChange={(v: string) => setForm({...form, extendedWarrantyPlan: v})} placeholder="Premium Plus 5yr..."/>
          <div style={{display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12}}>
            <Field label="Start date" value={form.extendedWarrantyStart} onChange={(v: string) => setForm({...form, extendedWarrantyStart: v})} type="date"/>
            <Field label="End date" value={form.extendedWarrantyEnd} onChange={(v: string) => setForm({...form, extendedWarrantyEnd: v})} type="date"/>
          </div>
        </Section>

        <div style={{display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24}}>
          <button onClick={() => navigate("/dealer-v6")} style={{padding: "10px 18px", border: "1px solid #e0e0e0", background: "white", borderRadius: 8, cursor: "pointer"}}>
            Cancel
          </button>
          <button onClick={submit} disabled={submitting}
            style={{padding: "10px 24px", background: "#22c55e", color: "white", border: 0, borderRadius: 8, cursor: submitting ? "wait" : "pointer", fontWeight: 600}}>
            {submitting ? "Creating..." : "Create Unit"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{padding: 20, background: "white", borderRadius: 8, border: "1px solid #e5e7eb", marginBottom: 16}}>
      <h3 style={{margin: "0 0 14px", fontSize: 14, color: "#033280"}}>{title}</h3>
      <div style={{display: "grid", gap: 12}}>{children}</div>
    </div>
  );
}

function Field({ label, value, onChange, type, options, mono, placeholder, maxLen }: {
  label: string; value: string | number; onChange: (v: string) => void;
  type?: string; options?: string[]; mono?: boolean; placeholder?: string; maxLen?: number;
}) {
  return (
    <div>
      <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 4}}>{label}</div>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{width: "100%", padding: 10, border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13}}>
          {options.map(o => <option key={o} value={o}>{o.replace(/_/g, " ")}</option>)}
        </select>
      ) : (
        <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder} maxLength={maxLen}
          style={{width: "100%", padding: 10, border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, fontFamily: mono ? "monospace" : "inherit"}}/>
      )}
    </div>
  );
}
