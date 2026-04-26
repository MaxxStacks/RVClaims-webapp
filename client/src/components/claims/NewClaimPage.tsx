import { useState, useEffect } from "react";
import { useParams, useLocation } from "wouter";
import { useApiFetch } from "@/lib/api";
import PhotoUploader from "@/components/PhotoUploader";

export default function NewClaimPage() {
  const params = useParams<{ unitId: string }>();
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [unit, setUnit] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [form, setForm] = useState({ type: "", dealerNotes: "", estimatedAmount: "", customManufacturer: "" });
  const [createdClaimId, setCreatedClaimId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<any>(`/api/v6/units/${params.unitId}`)
      .then(d => setUnit(d.unit))
      .catch(() => setUnit(null))
      .finally(() => setLoading(false));
  }, [params.unitId]);

  async function submit() {
    if (!form.type) { alert("Claim type required"); return; }
    setSubmitting(true);
    try {
      const created = await apiFetch<any>("/api/v6/claims", {
        method: "POST",
        body: JSON.stringify({
          unitId: params.unitId,
          type: form.type,
          dealerNotes: form.dealerNotes,
          estimatedAmount: form.estimatedAmount ? parseFloat(form.estimatedAmount) : undefined,
          customManufacturer: form.customManufacturer || undefined,
        }),
      });
      setCreatedClaimId(created.id);
    } catch (err: any) {
      alert("Failed: " + (err.message || err));
    } finally { setSubmitting(false); }
  }

  if (loading) return <div style={{padding: 40, textAlign: "center"}}>Loading...</div>;
  if (!unit) return <div style={{padding: 40, color: "#c0392b"}}>Unit not found</div>;

  const mfrStatus = unit.mfrWarrantyStatus;
  const extStatus = unit.extWarrantyStatus;

  return (
    <div style={{display: "flex", minHeight: "100vh", background: "#f7f9fc"}}>
      <div style={{width: 280, background: "white", borderRight: "1px solid #e5eaf2", padding: 20, overflowY: "auto"}}>
        <button onClick={() => navigate(`/dealer-v6/units/${params.unitId}`)} style={{background: "none", border: 0, color: "#033280", fontSize: 12, cursor: "pointer", marginBottom: 20}}>
          ← Back to Unit
        </button>

        <div style={{padding: 14, background: "#f7f9fc", borderRadius: 8, marginBottom: 16}}>
          <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 6}}>Unit</div>
          <div style={{fontWeight: 600, fontSize: 14}}>{unit.year} {unit.make}</div>
          <div style={{fontSize: 12, color: "#666", marginTop: 2}}>{unit.model}</div>
          <div style={{fontSize: 10, color: "#888", marginTop: 6, fontFamily: "monospace"}}>VIN {unit.vin}</div>
          {unit.stockNumber && <div style={{fontSize: 11, color: "#666", marginTop: 4}}>Stock #{unit.stockNumber}</div>}
        </div>

        <div style={{padding: 14, background: "#f7f9fc", borderRadius: 8, marginBottom: 16}}>
          <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 8}}>Warranty Status</div>
          <WarrantyStatus label="Manufacturer" status={mfrStatus} until={unit.manufacturerWarrantyEnd}/>
          <WarrantyStatus label="Extended" status={extStatus} until={unit.extendedWarrantyEnd}/>
          <WarrantyStatus label="Service contract" status={unit.serviceContractActive ? "active" : "none"} until={unit.serviceContractEnd}/>
        </div>

        <div style={{padding: 12, background: "#fff7ed", borderRadius: 6, fontSize: 11, color: "#92400e"}}>
          Manufacturer is auto-filled from the unit. Override only if filing under a different manufacturer's coverage.
        </div>
      </div>

      <div style={{flex: 1, padding: 32, maxWidth: 760}}>
        <h1 style={{fontSize: 24, fontWeight: 700, marginBottom: 6}}>New Claim</h1>
        <p style={{fontSize: 13, color: "#666", marginBottom: 24}}>For {unit.year} {unit.make} {unit.model}</p>

        <Section title="Claim Details">
          <Field label="Manufacturer (auto-filled)" value={form.customManufacturer || unit.make} onChange={(v: string) => setForm({...form, customManufacturer: v})} hint="Override only if needed"/>
          <Field label="Claim type *" value={form.type} onChange={(v: string) => setForm({...form, type: v})}
            options={[
              { v: "", label: "Select type" },
              { v: "warranty", label: "Warranty" },
              { v: "extended_warranty", label: "Extended Warranty" },
              { v: "pdi", label: "PDI" },
              { v: "daf", label: "DAF" },
            ]}/>
          <Field label="Estimated amount (optional)" value={form.estimatedAmount} onChange={(v: string) => setForm({...form, estimatedAmount: v})} type="number" placeholder="0.00"/>
          <Field label="Notes" value={form.dealerNotes} onChange={(v: string) => setForm({...form, dealerNotes: v})} multiline placeholder="Describe the issue, parts affected, customer report..."/>
        </Section>

        {createdClaimId && (
          <Section title="Add Photos">
            <p style={{fontSize: 12, color: "#666", marginBottom: 8}}>Claim was created. Upload photos as evidence.</p>
            <PhotoUploader scope="claims" scopeId={createdClaimId} photoType="claim_evidence"/>
            <button onClick={() => navigate(`/dealer-v6/units/${params.unitId}`)}
              style={{marginTop: 16, padding: "10px 18px", background: "#033280", color: "white", border: 0, borderRadius: 6, cursor: "pointer", fontWeight: 600}}>
              Done — Back to Unit
            </button>
          </Section>
        )}

        {!createdClaimId && (
          <div style={{display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 24}}>
            <button onClick={() => navigate(`/dealer-v6/units/${params.unitId}`)} style={{padding: "10px 18px", border: "1px solid #d5dbe5", background: "white", borderRadius: 6, cursor: "pointer"}}>
              Cancel
            </button>
            <button onClick={submit} disabled={submitting}
              style={{padding: "10px 24px", background: "#0cb22c", color: "white", border: 0, borderRadius: 6, cursor: submitting ? "wait" : "pointer", fontWeight: 600}}>
              {submitting ? "Creating..." : "Create Claim"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{padding: 20, background: "white", borderRadius: 8, border: "1px solid #e5eaf2", marginBottom: 16}}>
      <h3 style={{margin: "0 0 14px", fontSize: 14, color: "#033280"}}>{title}</h3>
      <div style={{display: "grid", gap: 12}}>{children}</div>
    </div>
  );
}

function WarrantyStatus({ label, status, until }: { label: string; status: string; until?: string }) {
  const colors: Record<string, string> = { active: "#16a34a", expiring: "#f48120", expired: "#c0392b", none: "#999" };
  const labels: Record<string, string> = { active: "Active", expiring: "Expiring", expired: "Expired", none: "Not set" };
  return (
    <div style={{display: "flex", justifyContent: "space-between", padding: "4px 0", fontSize: 12}}>
      <span style={{color: "#666"}}>{label}</span>
      <span style={{color: colors[status] || "#999", fontWeight: 600}}>● {labels[status] || "Not set"}{until && status !== "none" ? ` (${until})` : ""}</span>
    </div>
  );
}

function Field({ label, value, onChange, type, options, multiline, placeholder, hint }: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; options?: { v: string; label: string }[]; multiline?: boolean; placeholder?: string; hint?: string;
}) {
  return (
    <div>
      <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 4}}>{label}</div>
      {options ? (
        <select value={value} onChange={e => onChange(e.target.value)}
          style={{width: "100%", padding: 10, border: "1px solid #d5dbe5", borderRadius: 6, fontSize: 13}}>
          {options.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
        </select>
      ) : multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{width: "100%", padding: 10, border: "1px solid #d5dbe5", borderRadius: 6, fontSize: 13, minHeight: 100, fontFamily: "inherit"}}/>
      ) : (
        <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{width: "100%", padding: 10, border: "1px solid #d5dbe5", borderRadius: 6, fontSize: 13}}/>
      )}
      {hint && <div style={{fontSize: 10, color: "#888", marginTop: 4}}>{hint}</div>}
    </div>
  );
}
