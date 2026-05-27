// client/src/pages/exclusive/operator-admin/OperatorCompliance.tsx
// Compliance Manager — Operator Admin view
// Route: /operator/admin/compliance

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/hooks/use-language";

// ── Design tokens ─────────────────────────────────────────────────────────────
const NAVY = "#033280";
const GREEN = "#0cb22c";
const AMBER = "#f59e0b";
const RED = "#ef4444";

// ── Types ─────────────────────────────────────────────────────────────────────
interface DealerScore {
  dealershipId: string;
  dealershipName: string;
  jurisdiction: string;
  score: number;
  compliant: number;
  total: number;
  exceptions: number;
  lastChecked: string | null;
}

interface AggregateData {
  dealers: DealerScore[];
  stats: { avgScore: number; criticalDealers: number; totalChecks: number };
}

interface ComplianceTemplate {
  id: string;
  country: string;
  jurisdiction: string;
  regulatorName: string;
  regulatorFullName: string;
  category: string;
  requirementName: string;
  requirementDescription: string;
  documentRequired: string | null;
  verificationMethod: string;
  severity: string;
  isActive: boolean;
}

interface TemplatesData {
  templates: ComplianceTemplate[];
}

// ── Severity badge ────────────────────────────────────────────────────────────
function SeverityBadge({ severity }: { severity: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    critical: { bg: "#fee2e2", color: RED },
    high:     { bg: "#fef3c7", color: AMBER },
    medium:   { bg: "#fefce8", color: "#ca8a04" },
    low:      { bg: "#f3f4f6", color: "#6b7280" },
  };
  const s = styles[severity] || styles.low;
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 8px",
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 600,
      textTransform: "uppercase",
      backgroundColor: s.bg,
      color: s.color,
    }}>
      {severity}
    </span>
  );
}

// ── Stat card ─────────────────────────────────────────────────────────────────
function StatCard({ label, value, color }: { label: string; value: string | number; color?: string }) {
  return (
    <div style={{
      background: "#fff",
      border: "1px solid #e5e7eb",
      borderRadius: 10,
      padding: "16px 20px",
    }}>
      <div style={{ fontSize: 28, fontWeight: 800, color: color || NAVY }}>{value}</div>
      <div style={{ fontSize: 13, color: "#6b7280", marginTop: 2 }}>{label}</div>
    </div>
  );
}

// ── Template form ─────────────────────────────────────────────────────────────
function TemplateForm({ onSaved, onCancel }: { onSaved: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    country: "CA",
    jurisdiction: "",
    regulatorName: "",
    regulatorFullName: "",
    category: "disclosure",
    requirementName: "",
    requirementDescription: "",
    documentRequired: "",
    verificationMethod: "manual_review",
    severity: "high",
    isActive: true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async () => {
    if (!form.jurisdiction || !form.requirementName || !form.requirementDescription) {
      setError("Jurisdiction, requirement name, and description are required.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await apiFetch("/api/compliance/templates", {
        method: "POST",
        body: JSON.stringify({
          ...form,
          documentRequired: form.documentRequired || null,
        }),
      });
      onSaved();
    } catch (e: any) {
      setError(e.message || "Failed to save template");
    } finally {
      setSaving(false);
    }
  };

  const field = (key: string, label: string, type: "text" | "select" = "text", options?: string[]) => (
    <div key={key}>
      <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>{label}</label>
      {type === "select" ? (
        <select
          value={(form as any)[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
        >
          {options?.map(o => <option key={o} value={o}>{o}</option>)}
        </select>
      ) : (
        <input
          type="text"
          value={(form as any)[key]}
          onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))}
          style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
        />
      )}
    </div>
  );

  return (
    <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 20 }}>
      <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, margin: "0 0 16px 0" }}>Add Compliance Template</h3>
      <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
        {field("country", "Country", "select", ["CA", "US"])}
        {field("jurisdiction", "Jurisdiction Code (e.g. AB, ON, FEDERAL)")}
        {field("regulatorName", "Regulator Name (e.g. AMVIC)")}
        {field("regulatorFullName", "Regulator Full Name")}
        {field("category", "Category", "select", ["dealer_licensing", "disclosure", "advertising", "consumer_protection", "warranty", "financial", "privacy", "safety"])}
        {field("severity", "Severity", "select", ["critical", "high", "medium", "low"])}
        {field("verificationMethod", "Verification Method", "select", ["document_check", "field_check", "manual_review"])}
        {field("documentRequired", "Required Document (optional)")}
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Requirement Name</label>
        <input
          type="text"
          value={form.requirementName}
          onChange={e => setForm(f => ({ ...f, requirementName: e.target.value }))}
          style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
        />
      </div>
      <div style={{ marginTop: 12 }}>
        <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>Requirement Description</label>
        <textarea
          value={form.requirementDescription}
          onChange={e => setForm(f => ({ ...f, requirementDescription: e.target.value }))}
          rows={3}
          style={{ width: "100%", padding: "7px 10px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13, fontFamily: "Inter, sans-serif", resize: "vertical" }}
        />
      </div>
      {error && <div style={{ marginTop: 8, color: RED, fontSize: 13 }}>{error}</div>}
      <div style={{ display: "flex", gap: 8, marginTop: 16 }}>
        <button
          onClick={handleSubmit}
          disabled={saving}
          style={{ background: NAVY, color: "#fff", border: "none", padding: "8px 18px", borderRadius: 6, cursor: "pointer", fontWeight: 600, fontSize: 13 }}
        >
          {saving ? "Saving..." : "Save Template"}
        </button>
        <button
          onClick={onCancel}
          style={{ background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db", padding: "8px 14px", borderRadius: 6, cursor: "pointer", fontSize: 13 }}
        >
          Cancel
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function OperatorCompliance() {
  const { t } = useLanguage();
  const qc = useQueryClient();

  const [expandedDealer, setExpandedDealer] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<"dealers" | "templates">("dealers");
  const [jurisdictionFilter, setJurisdictionFilter] = useState("");
  const [showAddTemplate, setShowAddTemplate] = useState(false);

  const { data: aggregateData, isLoading: aggLoading } = useQuery<AggregateData>({
    queryKey: ["compliance-aggregate"],
    queryFn: () => apiFetch<AggregateData>("/api/compliance/aggregate"),
    staleTime: 60_000,
  });

  const { data: templatesData, isLoading: tplLoading } = useQuery<TemplatesData>({
    queryKey: ["compliance-templates"],
    queryFn: () => apiFetch<TemplatesData>("/api/compliance/templates"),
    staleTime: 60_000,
    enabled: activeTab === "templates",
  });

  const deactivateTemplate = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/compliance/templates/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ isActive: false }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ["compliance-templates"] }),
  });

  const dealers = aggregateData?.dealers ?? [];
  const stats = aggregateData?.stats ?? { avgScore: 0, criticalDealers: 0, totalChecks: 0 };

  const templates = (templatesData?.templates ?? []).filter(t =>
    !jurisdictionFilter || t.jurisdiction === jurisdictionFilter
  );

  const uniqueJurisdictions = Array.from(
    new Set((templatesData?.templates ?? []).map(t => t.jurisdiction))
  ).sort();

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", maxWidth: 1200 }}>
      {/* ── Header ── */}
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: 0 }}>
          {t("compliance.title")} — Platform View
        </h1>
        <p style={{ fontSize: 14, color: "#6b7280", margin: "6px 0 0" }}>
          Compliance scores across all active dealerships
        </p>
      </div>

      {/* ── Stats row ── */}
      {aggLoading ? (
        <div style={{ color: "#6b7280", marginBottom: 24 }}>{t("common.loading")}</div>
      ) : (
        <div style={{ display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: 16, marginBottom: 28 }}>
          <StatCard label="Platform Avg Compliance" value={`${stats.avgScore}%`} color={stats.avgScore > 80 ? GREEN : stats.avgScore > 60 ? AMBER : RED} />
          <StatCard label="Dealers with Critical Exceptions" value={stats.criticalDealers} color={stats.criticalDealers > 0 ? RED : GREEN} />
          <StatCard label="Total Checks Run" value={stats.totalChecks} />
        </div>
      )}

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e5e7eb", marginBottom: 24 }}>
        {(["dealers", "templates"] as const).map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)} style={{
            padding: "8px 18px",
            border: "none",
            background: "none",
            cursor: "pointer",
            fontSize: 14,
            fontWeight: 600,
            color: activeTab === tab ? NAVY : "#6b7280",
            borderBottom: activeTab === tab ? `3px solid ${NAVY}` : "3px solid transparent",
            marginBottom: -2,
            textTransform: "capitalize",
          }}>
            {tab === "dealers" ? "Dealer Compliance" : t("compliance.templates")}
          </button>
        ))}
      </div>

      {/* ── Dealer compliance table ── */}
      {activeTab === "dealers" && (
        <>
          {aggLoading ? (
            <div style={{ color: "#6b7280" }}>{t("common.loading")}</div>
          ) : dealers.length === 0 ? (
            <div style={{ color: "#6b7280", padding: 20 }}>No compliance data yet. Dealers must run a check first.</div>
          ) : (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Dealer</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>{t("compliance.jurisdiction")}</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151" }}>Score</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151" }}>Exceptions</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151" }}>Last Checked</th>
                  </tr>
                </thead>
                <tbody>
                  {dealers.map((dealer, i) => (
                    <>
                      <tr
                        key={dealer.dealershipId}
                        onClick={() => setExpandedDealer(expandedDealer === dealer.dealershipId ? null : dealer.dealershipId)}
                        style={{
                          borderBottom: "1px solid #f3f4f6",
                          background: dealer.score < 60 ? "#fff5f5" : i % 2 === 0 ? "#fff" : "#fafafa",
                          cursor: "pointer",
                        }}
                      >
                        <td style={{ padding: "12px 16px", fontWeight: 600 }}>{dealer.dealershipName}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{dealer.jurisdiction}</td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          <span style={{
                            fontWeight: 700, fontSize: 16,
                            color: dealer.score > 80 ? GREEN : dealer.score > 60 ? AMBER : RED,
                          }}>
                            {dealer.total > 0 ? `${dealer.score}%` : "—"}
                          </span>
                          {dealer.total > 0 && (
                            <span style={{ fontSize: 11, color: "#9ca3af", marginLeft: 6 }}>
                              {dealer.compliant}/{dealer.total}
                            </span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right" }}>
                          {dealer.exceptions > 0 ? (
                            <span style={{ fontWeight: 600, color: RED }}>{dealer.exceptions}</span>
                          ) : (
                            <span style={{ color: GREEN, fontWeight: 600 }}>0</span>
                          )}
                        </td>
                        <td style={{ padding: "12px 16px", textAlign: "right", fontSize: 12, color: "#6b7280" }}>
                          {dealer.lastChecked ? new Date(dealer.lastChecked).toLocaleDateString() : "Never"}
                        </td>
                      </tr>

                      {expandedDealer === dealer.dealershipId && (
                        <tr key={`exp-${dealer.dealershipId}`}>
                          <td colSpan={5} style={{ padding: "12px 24px", background: "#f0f4ff", borderBottom: "1px solid #e5e7eb" }}>
                            <DealerExceptionSummary dealershipId={dealer.dealershipId} />
                          </td>
                        </tr>
                      )}
                    </>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {/* ── Templates section ── */}
      {activeTab === "templates" && (
        <>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div style={{ display: "flex", gap: 12, alignItems: "center" }}>
              <select
                value={jurisdictionFilter}
                onChange={e => setJurisdictionFilter(e.target.value)}
                style={{ padding: "7px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
              >
                <option value="">All Jurisdictions</option>
                {uniqueJurisdictions.map(j => <option key={j} value={j}>{j}</option>)}
              </select>
              <span style={{ fontSize: 13, color: "#6b7280" }}>{templates.length} templates</span>
            </div>
            <button
              onClick={() => setShowAddTemplate(v => !v)}
              style={{
                background: NAVY, color: "#fff", border: "none",
                padding: "8px 18px", borderRadius: 6, cursor: "pointer",
                fontWeight: 600, fontSize: 13,
              }}
            >
              {showAddTemplate ? "Cancel" : "+ Add Template"}
            </button>
          </div>

          {showAddTemplate && (
            <TemplateForm
              onSaved={() => {
                setShowAddTemplate(false);
                qc.invalidateQueries({ queryKey: ["compliance-templates"] });
              }}
              onCancel={() => setShowAddTemplate(false)}
            />
          )}

          {tplLoading ? (
            <div style={{ color: "#6b7280" }}>{t("common.loading")}</div>
          ) : (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Jurisdiction</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Regulator</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Requirement</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Category</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Severity</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Status</th>
                    <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151" }}>Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {templates.map((tpl, i) => (
                    <tr key={tpl.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ fontWeight: 600, fontSize: 12 }}>{tpl.jurisdiction}</div>
                        <div style={{ fontSize: 11, color: "#9ca3af" }}>{tpl.country}</div>
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 12, color: "#374151" }}>{tpl.regulatorName}</td>
                      <td style={{ padding: "10px 16px" }}>
                        <div style={{ fontWeight: 500 }}>{tpl.requirementName}</div>
                        {tpl.documentRequired && (
                          <div style={{ fontSize: 11, color: "#6b7280" }}>Doc: {tpl.documentRequired}</div>
                        )}
                      </td>
                      <td style={{ padding: "10px 16px", fontSize: 12, textTransform: "capitalize", color: "#374151" }}>
                        {tpl.category.replace("_", " ")}
                      </td>
                      <td style={{ padding: "10px 16px" }}><SeverityBadge severity={tpl.severity} /></td>
                      <td style={{ padding: "10px 16px" }}>
                        <span style={{
                          display: "inline-block",
                          padding: "2px 8px",
                          borderRadius: 9999,
                          fontSize: 11,
                          fontWeight: 600,
                          background: tpl.isActive ? "#dcfce7" : "#f3f4f6",
                          color: tpl.isActive ? GREEN : "#9ca3af",
                        }}>
                          {tpl.isActive ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td style={{ padding: "10px 16px", textAlign: "right" }}>
                        {tpl.isActive && (
                          <button
                            onClick={() => deactivateTemplate.mutate(tpl.id)}
                            disabled={deactivateTemplate.isPending}
                            style={{
                              background: "#fff",
                              color: "#6b7280",
                              border: "1px solid #d1d5db",
                              padding: "4px 10px",
                              borderRadius: 5,
                              cursor: "pointer",
                              fontSize: 12,
                            }}
                          >
                            Deactivate
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}
    </div>
  );
}

// ── Inline dealer exception summary ──────────────────────────────────────────
function DealerExceptionSummary({ dealershipId }: { dealershipId: string }) {
  const { data, isLoading } = useQuery<{ exceptions: Array<{ requirementName: string; severity: string; status: string }> }>({
    queryKey: ["compliance-dealer-exceptions", dealershipId],
    queryFn: () => apiFetch(`/api/compliance/exceptions?dealershipId=${dealershipId}`),
    staleTime: 60_000,
  });

  if (isLoading) return <div style={{ fontSize: 13, color: "#6b7280" }}>Loading...</div>;
  const excs = data?.exceptions ?? [];
  if (excs.length === 0) return <div style={{ fontSize: 13, color: GREEN, fontWeight: 600 }}>No exceptions — fully compliant.</div>;

  return (
    <div>
      <div style={{ fontSize: 13, fontWeight: 600, color: "#374151", marginBottom: 8 }}>
        Exceptions ({excs.length}):
      </div>
      <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
        {excs.slice(0, 6).map((e, i) => (
          <span key={i} style={{
            background: "#fff",
            border: "1px solid #e5e7eb",
            borderRadius: 6,
            padding: "4px 10px",
            fontSize: 12,
            display: "flex",
            alignItems: "center",
            gap: 6,
          }}>
            <span style={{
              width: 8, height: 8, borderRadius: "50%",
              background: e.severity === "critical" ? "#ef4444" : e.severity === "high" ? "#f59e0b" : "#9ca3af",
              display: "inline-block",
              flexShrink: 0,
            }} />
            {e.requirementName}
          </span>
        ))}
        {excs.length > 6 && (
          <span style={{ fontSize: 12, color: "#9ca3af", padding: "4px 6px" }}>+{excs.length - 6} more</span>
        )}
      </div>
    </div>
  );
}
