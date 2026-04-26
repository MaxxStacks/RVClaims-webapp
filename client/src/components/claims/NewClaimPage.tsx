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
  const [form, setForm] = useState({ type: "", dealerNotes: "", estimatedAmount: "", customManufacturer: "" });

  // Approach A: create draft immediately, upload photos against it, then submit
  const [draftClaimId, setDraftClaimId] = useState<string | null>(null);
  const [draftCreating, setDraftCreating] = useState(false);
  const [photoCount, setPhotoCount] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [cancelling, setCancelling] = useState(false);

  useEffect(() => {
    apiFetch<any>(`/api/v6/units/${params.unitId}`)
      .then(d => setUnit(d.unit))
      .catch(() => setUnit(null))
      .finally(() => setLoading(false));
  }, [params.unitId]);

  // Create draft claim as soon as type is selected
  async function createDraft(type: string) {
    if (!type || draftCreating || draftClaimId) return;
    setDraftCreating(true);
    try {
      const created = await apiFetch<any>("/api/v6/claims", {
        method: "POST",
        body: JSON.stringify({
          unitId: params.unitId,
          type,
          dealerNotes: form.dealerNotes,
          estimatedAmount: form.estimatedAmount ? parseFloat(form.estimatedAmount) : undefined,
          customManufacturer: form.customManufacturer || undefined,
        }),
      });
      setDraftClaimId(created.id);
    } catch (err: any) {
      console.error("Draft creation failed:", err);
    } finally {
      setDraftCreating(false);
    }
  }

  async function handleTypeChange(type: string) {
    setForm(f => ({ ...f, type }));
    if (type && !draftClaimId) {
      await createDraft(type);
    }
  }

  async function submit() {
    if (!draftClaimId) { alert("Please select a claim type first"); return; }
    if (photoCount === 0) { alert("At least 1 photo is required before submitting"); return; }
    setSubmitting(true);
    try {
      await apiFetch(`/api/v6/claims/${draftClaimId}/submit`, {
        method: "POST",
        body: JSON.stringify({}),
      });
      navigate(`/dealer-v6/units/${params.unitId}`);
    } catch (err: any) {
      alert("Submit failed: " + (err.message || err));
    } finally {
      setSubmitting(false);
    }
  }

  async function cancel() {
    if (draftClaimId) {
      setCancelling(true);
      try {
        await apiFetch(`/api/v6/claims/${draftClaimId}`, { method: "DELETE" });
      } catch {}
      setCancelling(false);
    }
    navigate(`/dealer-v6/units/${params.unitId}`);
  }

  if (loading) return <div style={{padding: 40, textAlign: "center"}}>Loading...</div>;
  if (!unit) return <div style={{padding: 40, color: "#c0392b"}}>Unit not found</div>;

  const mfrStatus = unit.mfrWarrantyStatus;
  const extStatus = unit.extWarrantyStatus;
  const canSubmit = draftClaimId && photoCount >= 1 && !submitting;

  return (
    <div style={{display: "flex", minHeight: "100vh", background: "#f5f6f8"}}>
      {/* Left info panel */}
      <div style={{width: 280, background: "white", borderRight: "1px solid #e5e7eb", padding: 20, overflowY: "auto", flexShrink: 0}}>
        <button onClick={cancel} style={{background: "none", border: 0, color: "#033280", fontSize: 12, cursor: "pointer", marginBottom: 20}}>
          ← Back to Unit
        </button>

        <div style={{padding: 14, background: "#fafafa", borderRadius: 8, marginBottom: 16}}>
          <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 6}}>Unit</div>
          <div style={{fontWeight: 600, fontSize: 14}}>{unit.year} {unit.manufacturer}</div>
          <div style={{fontSize: 12, color: "#666", marginTop: 2}}>{unit.model}</div>
          <div style={{fontSize: 10, color: "#888", marginTop: 6, fontFamily: "monospace"}}>VIN {unit.vin}</div>
          {unit.stockNumber && <div style={{fontSize: 11, color: "#666", marginTop: 4}}>Stock #{unit.stockNumber}</div>}
        </div>

        <div style={{padding: 14, background: "#fafafa", borderRadius: 8, marginBottom: 16}}>
          <div style={{fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600, marginBottom: 8}}>Warranty Status</div>
          <WarrantyStatus label="Manufacturer" status={mfrStatus} until={unit.manufacturerWarrantyEnd}/>
          <WarrantyStatus label="Extended" status={extStatus} until={unit.extendedWarrantyEnd}/>
          <WarrantyStatus label="Service contract" status={unit.serviceContractActive ? "active" : "none"} until={unit.serviceContractEnd}/>
        </div>

        <div style={{padding: 12, background: "#fff7ed", borderRadius: 6, fontSize: 11, color: "#92400e"}}>
          Manufacturer is auto-filled from the unit. Override only if filing under a different manufacturer's coverage.
        </div>
      </div>

      {/* Main form */}
      <div style={{flex: 1, padding: 32, maxWidth: 760, overflowY: "auto"}}>
        <h1 style={{fontSize: 24, fontWeight: 700, marginBottom: 6}}>New Claim</h1>
        <p style={{fontSize: 13, color: "#666", marginBottom: 24}}>
          For {unit.year} {unit.manufacturer} {unit.model}
          {draftCreating && <span style={{marginLeft: 8, fontSize: 11, color: "#888"}}>(saving draft...)</span>}
          {draftClaimId && !draftCreating && <span style={{marginLeft: 8, fontSize: 11, color: "#16a34a"}}>● Draft saved</span>}
        </p>

        <Section title="Claim Details">
          <Field label="Manufacturer (auto-filled)" value={form.customManufacturer || unit.manufacturer || unit.make || ""} onChange={(v: string) => setForm({...form, customManufacturer: v})} hint="Override only if needed"/>
          <Field label="Claim type *" value={form.type} onChange={handleTypeChange}
            options={[
              { v: "", label: "Select type" },
              { v: "warranty", label: "Warranty" },
              { v: "extended_warranty", label: "Extended Warranty" },
              { v: "pdi", label: "PDI" },
              { v: "daf", label: "DAF" },
            ]}/>
          <Field label="Estimated amount (optional)" value={form.estimatedAmount} onChange={(v: string) => setForm({...form, estimatedAmount: v})} type="number" placeholder="0.00"/>
          <Field label="Notes / Description *" value={form.dealerNotes} onChange={(v: string) => setForm({...form, dealerNotes: v})} multiline placeholder="Describe the issue, parts affected, customer report..."/>
        </Section>

        {/* Photo upload — required before submit */}
        <Section title="Photos (Required)">
          {!draftClaimId ? (
            <div style={{padding: 20, textAlign: "center", color: "#888", fontSize: 12, background: "#fafafa", borderRadius: 8}}>
              Select a claim type above to enable photo upload.
            </div>
          ) : (
            <>
              <div style={{
                padding: "10px 14px", borderRadius: 6, fontSize: 12, fontWeight: 600, marginBottom: 12,
                background: photoCount >= 1 ? "#dcfce7" : "#fff7ed",
                color: photoCount >= 1 ? "#166534" : "#92400e",
              }}>
                {photoCount >= 1
                  ? `✓ ${photoCount} photo${photoCount > 1 ? "s" : ""} uploaded — ready to submit`
                  : "⚠ At least 1 photo is required before submitting"}
              </div>
              <PhotoUploader
                scope="claims"
                scopeId={draftClaimId}
                photoType="claim_evidence"
                onUploadComplete={() => setPhotoCount(n => n + 1)}
              />
            </>
          )}
        </Section>

        <div style={{display: "flex", justifyContent: "flex-end", gap: 8, marginTop: 8}}>
          <button onClick={cancel} disabled={cancelling}
            style={{padding: "10px 18px", border: "1px solid #e0e0e0", background: "white", borderRadius: 8, cursor: cancelling ? "wait" : "pointer"}}>
            {cancelling ? "Cancelling..." : "Cancel"}
          </button>
          <button
            onClick={submit}
            disabled={!canSubmit}
            title={!draftClaimId ? "Select a claim type first" : photoCount === 0 ? "Upload at least 1 photo first" : ""}
            style={{
              padding: "10px 24px", background: canSubmit ? "#22c55e" : "#ccc",
              color: "white", border: 0, borderRadius: 8,
              cursor: canSubmit ? "pointer" : "not-allowed", fontWeight: 600,
            }}>
            {submitting ? "Submitting..." : "Submit Claim"}
          </button>
        </div>

        {!canSubmit && draftClaimId && photoCount === 0 && (
          <div style={{textAlign: "right", fontSize: 11, color: "#92400e", marginTop: 6}}>
            Upload at least 1 photo to enable submit
          </div>
        )}
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
          style={{width: "100%", padding: 10, border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13}}>
          {options.map(o => <option key={o.v} value={o.v}>{o.label}</option>)}
        </select>
      ) : multiline ? (
        <textarea value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{width: "100%", padding: 10, border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13, minHeight: 100, fontFamily: "inherit"}}/>
      ) : (
        <input type={type || "text"} value={value} onChange={e => onChange(e.target.value)} placeholder={placeholder}
          style={{width: "100%", padding: 10, border: "1px solid #e0e0e0", borderRadius: 8, fontSize: 13}}/>
      )}
      {hint && <div style={{fontSize: 10, color: "#888", marginTop: 4}}>{hint}</div>}
    </div>
  );
}
