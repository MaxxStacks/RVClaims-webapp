// client/src/pages/exclusive/superadmin/OnboardOperator.tsx
// 4-section scrollable form to onboard a new operator

import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import { useLocation } from "wouter";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";

const NAVY = "#033280";
const GREEN = "#0cb22c";
const PURPLE = "#7c3aed";

const TIER_OPTIONS = [
  { value: "starter",      label: "Starter",      price: "$999/mo",  dealers: "25 dealers" },
  { value: "professional", label: "Professional", price: "$1,499/mo", dealers: "50 dealers" },
  { value: "enterprise",   label: "Enterprise",   price: "$2,499/mo", dealers: "Unlimited" },
];

function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .replace(/\s+/g, "-")
    .slice(0, 50);
}

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "24px 28px", marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>{title}</h2>
      {children}
    </div>
  );
}

function Field({
  label, value, onChange, type = "text", placeholder, required,
}: {
  label: string; value: string; onChange: (v: string) => void;
  type?: string; placeholder?: string; required?: boolean;
}) {
  return (
    <div style={{ marginBottom: 16 }}>
      <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
        {label}{required && <span style={{ color: "#ef4444", marginLeft: 2 }}>*</span>}
      </label>
      <input
        type={type}
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        style={{
          width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid #d1d5db",
          fontSize: 14, color: "#0f172a", outline: "none", boxSizing: "border-box",
          background: "#fff",
        }}
      />
    </div>
  );
}

export default function OnboardOperator() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [, navigate] = useLocation();

  const [name, setName] = useState("");
  const [slug, setSlug] = useState("");
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [address, setAddress] = useState("");
  const [country, setCountry] = useState("CA");
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState(NAVY);
  const [secondaryColor, setSecondaryColor] = useState(GREEN);
  const [customDomain, setCustomDomain] = useState("");
  const [licenseTier, setLicenseTier] = useState("starter");
  const [adminFirst, setAdminFirst] = useState("");
  const [adminLast, setAdminLast] = useState("");
  const [adminEmail, setAdminEmail] = useState("");

  const handleNameChange = (v: string) => {
    setName(v);
    if (!slug || slug === slugify(name)) {
      setSlug(slugify(v));
    }
  };

  const mutation = useMutation({
    mutationFn: (payload: any) =>
      apiFetch<{ success: boolean; operator: any; message: string }>("/api/superadmin/operators", {
        method: "POST",
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      toast({ title: data.message || "Operator onboarded successfully", variant: "default" });
      navigate(`/superadmin/operators/${data.operator.id}`);
    },
    onError: () => toast({ title: "Failed to create operator", variant: "destructive" }),
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !slug || !adminFirst || !adminLast || !adminEmail) {
      toast({ title: "Please fill in all required fields", variant: "destructive" });
      return;
    }
    mutation.mutate({
      name, slug, contactName, contactEmail, contactPhone,
      address, country, logoUrl, primaryColor, secondaryColor,
      customDomain, licenseTier,
      adminFirstName: adminFirst,
      adminLastName: adminLast,
      adminEmail,
    });
  };

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 800, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          {t('superadmin.onboard') || 'Onboard New Operator'}
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 6 }}>
          Create a new licensed white-label operator. An admin user account will be created automatically.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Section 1: Company Info */}
        <SectionCard title="Company Info">
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <Field label="Operator Name" value={name} onChange={handleNameChange} placeholder="RV Claims Ontario" required />
            <Field label="Slug (URL-safe ID)" value={slug} onChange={setSlug} placeholder="rv-claims-ontario" required />
            <Field label="Contact Name" value={contactName} onChange={setContactName} placeholder="Jane Smith" />
            <Field label="Contact Email" value={contactEmail} onChange={setContactEmail} type="email" placeholder="jane@example.com" />
            <Field label="Contact Phone" value={contactPhone} onChange={setContactPhone} placeholder="+1 (555) 000-0000" />
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>Country</label>
              <select
                value={country}
                onChange={e => setCountry(e.target.value)}
                style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 14, color: "#0f172a", background: "#fff" }}
              >
                <option value="CA">Canada</option>
                <option value="US">United States</option>
              </select>
            </div>
          </div>
          <Field label="Address" value={address} onChange={setAddress} placeholder="123 Main St, Toronto, ON" />
        </SectionCard>

        {/* Section 2: Branding */}
        <SectionCard title="Branding">
          <Field label="Logo URL" value={logoUrl} onChange={setLogoUrl} placeholder="https://example.com/logo.png" />
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: "0 20px" }}>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {t('operator.primaryColor') || 'Primary Color'}
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  style={{ width: 44, height: 36, border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }} />
                <input type="text" value={primaryColor} onChange={e => setPrimaryColor(e.target.value)}
                  style={{ flex: 1, padding: "9px 12px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 13, color: "#0f172a" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {t('operator.secondaryColor') || 'Secondary Color'}
              </label>
              <div style={{ display: "flex", gap: 8, alignItems: "center" }}>
                <input type="color" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)}
                  style={{ width: 44, height: 36, border: "1px solid #d1d5db", borderRadius: 6, cursor: "pointer" }} />
                <input type="text" value={secondaryColor} onChange={e => setSecondaryColor(e.target.value)}
                  style={{ flex: 1, padding: "9px 12px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 13, color: "#0f172a" }} />
              </div>
            </div>
            <div style={{ marginBottom: 16 }}>
              <label style={{ display: "block", fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 6 }}>
                {t('operator.customDomain') || 'Custom Domain'}
              </label>
              <input type="text" value={customDomain} onChange={e => setCustomDomain(e.target.value)}
                placeholder="app.rvclaimsontario.com"
                style={{ width: "100%", padding: "9px 12px", borderRadius: 7, border: "1px solid #d1d5db", fontSize: 13, color: "#0f172a", boxSizing: "border-box" }} />
            </div>
          </div>
        </SectionCard>

        {/* Section 3: Licensing */}
        <SectionCard title={t('superadmin.licensingTier') || 'Licensing Tier'}>
          <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16 }}>
            {TIER_OPTIONS.map(tier => (
              <div
                key={tier.value}
                onClick={() => setLicenseTier(tier.value)}
                style={{
                  border: `2px solid ${licenseTier === tier.value ? PURPLE : "#e2e8f0"}`,
                  borderRadius: 10,
                  padding: "18px 20px",
                  cursor: "pointer",
                  background: licenseTier === tier.value ? "#ede9fe" : "#fff",
                  transition: "border-color 0.15s, background 0.15s",
                }}
              >
                <div style={{ fontWeight: 700, fontSize: 15, color: "#0f172a", marginBottom: 6 }}>{tier.label}</div>
                <div style={{ fontWeight: 800, fontSize: 18, color: PURPLE, marginBottom: 4 }}>{tier.price}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{tier.dealers}</div>
                <div style={{ fontSize: 12, color: "#94a3b8", marginTop: 4 }}>15% revenue share</div>
              </div>
            ))}
          </div>
        </SectionCard>

        {/* Section 4: Initial Admin */}
        <SectionCard title="Initial Admin Account">
          <p style={{ fontSize: 13, color: "#64748b", marginBottom: 20 }}>
            This creates the first operator_admin user for this operator. They will receive login instructions separately.
          </p>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: "0 20px" }}>
            <Field label="First Name" value={adminFirst} onChange={setAdminFirst} required />
            <Field label="Last Name" value={adminLast} onChange={setAdminLast} required />
          </div>
          <Field label="Email Address" value={adminEmail} onChange={setAdminEmail} type="email" required />
        </SectionCard>

        {/* Submit */}
        <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}>
          <button
            type="button"
            onClick={() => window.history.back()}
            style={{ padding: "11px 24px", borderRadius: 8, border: "1px solid #e2e8f0", background: "#fff", color: "#374151", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={mutation.isPending}
            style={{ padding: "11px 28px", borderRadius: 8, border: "none", background: GREEN, color: "#fff", fontWeight: 700, fontSize: 14, cursor: "pointer" }}
          >
            {mutation.isPending ? "Creating Operator…" : "Activate Operator →"}
          </button>
        </div>
      </form>
    </div>
  );
}
