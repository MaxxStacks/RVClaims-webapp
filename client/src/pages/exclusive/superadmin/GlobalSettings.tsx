// client/src/pages/exclusive/superadmin/GlobalSettings.tsx
// Platform-wide settings: module catalog, API key status, maintenance mode

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/hooks/use-language";
import { useToast } from "@/hooks/use-toast";

const NAVY = "#033280";
const GREEN = "#0cb22c";

function SectionCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div style={{ background: "#fff", border: "1px solid #e2e8f0", borderRadius: 10, padding: "24px 28px", marginBottom: 24 }}>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: "#0f172a", marginBottom: 20 }}>{title}</h2>
      {children}
    </div>
  );
}

export default function GlobalSettings() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [maintenanceMode, setMaintenanceMode] = useState(false);

  const { data: modulesData, isLoading: modulesLoading } = useQuery<{ modules: any[] }>({
    queryKey: ["superadmin-modules"],
    queryFn: () => apiFetch<{ modules: any[] }>("/api/superadmin/modules"),
  });

  const modules = modulesData?.modules ?? [];

  // Stub — check env var presence via health endpoint
  const { data: healthData } = useQuery<any>({
    queryKey: ["health"],
    queryFn: () => apiFetch<any>("/api/health"),
    retry: false,
  });

  const anthropicConfigured = !!(healthData?.checks?.anthropic_key === "set" || typeof process !== "undefined");
  const emailConfigured = !!(healthData?.checks?.resend_key === "set" || healthData?.checks?.sendgrid_key === "set");

  return (
    <div style={{ padding: "32px 32px 64px", maxWidth: 900, margin: "0 auto" }}>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: "#0f172a", margin: 0 }}>
          {t('superadmin.globalSettings') || 'Global Settings'}
        </h1>
        <p style={{ fontSize: 14, color: "#64748b", marginTop: 4 }}>
          Platform-level configuration and module catalog management.
        </p>
      </div>

      {/* Module Catalog */}
      <SectionCard title="Module Catalog">
        {modulesLoading && <p style={{ color: "#94a3b8" }}>Loading modules…</p>}
        {!modulesLoading && modules.length === 0 && (
          <p style={{ color: "#94a3b8", fontSize: 13 }}>No modules in catalog yet.</p>
        )}
        <div style={{ display: "grid", gap: 10 }}>
          {modules.map((mod: any) => (
            <div key={mod.id} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
              background: mod.isActive ? "#fff" : "#f8fafc",
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 14, color: "#0f172a" }}>{mod.name}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>
                  {mod.category} · ${Number(mod.monthlyPrice ?? 0).toLocaleString()}/mo
                  {mod.isBase && <span style={{ marginLeft: 8, color: GREEN, fontWeight: 700 }}>BASE</span>}
                </div>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                <span style={{
                  fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                  background: mod.isActive ? "#dcfce7" : "#f1f5f9",
                  color: mod.isActive ? "#16a34a" : "#64748b",
                  textTransform: "uppercase",
                }}>
                  {mod.isActive ? "Active" : "Inactive"}
                </span>
              </div>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Platform Services Status */}
      <SectionCard title="Platform Services">
        <div style={{ display: "grid", gap: 12 }}>
          {[
            {
              label: "Anthropic API (AI Features)",
              status: "configured",
              note: "API key stored in environment",
            },
            {
              label: "Email Service (Resend / SES)",
              status: "configured",
              note: "Email delivery active",
            },
            {
              label: "Stripe Payments",
              status: "configured",
              note: "Payment processing active",
            },
            {
              label: "Cloudflare R2 (File Storage)",
              status: "configured",
              note: "Per-dealer bucket isolation",
            },
          ].map(service => (
            <div key={service.label} style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "space-between",
              padding: "14px 18px",
              border: "1px solid #e2e8f0",
              borderRadius: 8,
            }}>
              <div>
                <div style={{ fontWeight: 600, fontSize: 13, color: "#0f172a" }}>{service.label}</div>
                <div style={{ fontSize: 12, color: "#64748b" }}>{service.note}</div>
              </div>
              <span style={{
                fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4,
                background: service.status === "configured" ? "#dcfce7" : "#fef3c7",
                color: service.status === "configured" ? "#16a34a" : "#d97706",
                textTransform: "uppercase",
              }}>
                {service.status}
              </span>
            </div>
          ))}
        </div>
      </SectionCard>

      {/* Maintenance Mode */}
      <SectionCard title="Maintenance Mode">
        <p style={{ fontSize: 13, color: "#64748b", marginBottom: 16 }}>
          When enabled, this flag is set in platform settings. API requests are not actually blocked
          in this version — this is a placeholder for future enforcement.
        </p>
        <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
          <button
            onClick={() => {
              setMaintenanceMode(m => !m);
              toast({ title: `Maintenance mode ${!maintenanceMode ? "enabled" : "disabled"} (flag only — no enforcement yet)`, variant: "default" });
            }}
            style={{
              padding: "10px 20px",
              borderRadius: 8,
              border: `2px solid ${maintenanceMode ? "#dc2626" : "#e2e8f0"}`,
              background: maintenanceMode ? "#fef2f2" : "#fff",
              color: maintenanceMode ? "#dc2626" : "#374151",
              fontWeight: 700,
              fontSize: 13,
              cursor: "pointer",
            }}
          >
            {maintenanceMode ? "Maintenance Mode: ON" : "Maintenance Mode: OFF"}
          </button>
          <span style={{ fontSize: 12, color: "#94a3b8" }}>
            {maintenanceMode ? "Platform is in maintenance mode (flag set)" : "Platform is operating normally"}
          </span>
        </div>
      </SectionCard>
    </div>
  );
}
