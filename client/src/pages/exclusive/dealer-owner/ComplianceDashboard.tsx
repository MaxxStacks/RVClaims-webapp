// client/src/pages/exclusive/dealer-owner/ComplianceDashboard.tsx
// Compliance Manager — Dealer Owner view
// Route: /:dealerId/owner/compliance

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";
import { useAuth } from "@/hooks/use-auth";
import { useLanguage } from "@/hooks/use-language";
import PrintButton from "@/components/PrintButton";

// ── Design tokens ─────────────────────────────────────────────────────────────
const NAVY = "#033280";
const GREEN = "#0cb22c";
const AMBER = "#f59e0b";
const RED = "#ef4444";

// ── Types ─────────────────────────────────────────────────────────────────────
interface CheckItem {
  id: string;
  templateId: string;
  status: string;
  details: Record<string, unknown> | null;
  checkedAt: string;
  requirementName: string;
  requirementDescription?: string;
  severity: string;
  category: string;
  verificationMethod: string;
  documentRequired: string | null;
  regulatorName: string;
  jurisdiction: string;
}

interface StatusData {
  checks: CheckItem[];
  score: number;
  compliant: number;
  total: number;
  lastChecked: string | null;
  jurisdictionLabel: string;
}

interface CheckResult {
  score: number;
  compliant: number;
  total: number;
  exceptions: CheckItem[];
}

interface ReportData {
  id: string;
  reportType: string;
  jurisdiction: string;
  dateFrom: string;
  dateTo: string;
  createdAt: string;
  reportData: {
    dealershipName: string;
    jurisdiction: string;
    complianceScore: number;
    compliant: number;
    total: number;
    exceptions: CheckItem[];
    unitsSold: number;
    unitDocSummaries: Array<{
      vin: string; unitDesc: string; soldDate: string | null;
      totalDocs: number; presentDocs: number; missingDocs: string[];
    }>;
    summary: { critical: number; high: number; medium: number; low: number };
  };
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
      letterSpacing: "0.05em",
    }}>
      {severity}
    </span>
  );
}

// ── Status badge ──────────────────────────────────────────────────────────────
function StatusBadge({ status }: { status: string }) {
  const styles: Record<string, { bg: string; color: string }> = {
    compliant:      { bg: "#dcfce7", color: GREEN },
    non_compliant:  { bg: "#fee2e2", color: RED },
    pending_review: { bg: "#fef3c7", color: AMBER },
    waived:         { bg: "#f3f4f6", color: "#6b7280" },
  };
  const s = styles[status] || styles.pending_review;
  const labels: Record<string, string> = {
    compliant: "Compliant",
    non_compliant: "Non-Compliant",
    pending_review: "Pending Review",
    waived: "Waived",
  };
  return (
    <span style={{
      display: "inline-block",
      padding: "2px 10px",
      borderRadius: 9999,
      fontSize: 11,
      fontWeight: 600,
      backgroundColor: s.bg,
      color: s.color,
    }}>
      {labels[status] || status}
    </span>
  );
}

// ── Score card ────────────────────────────────────────────────────────────────
function ScoreCard({ score, compliant, total }: { score: number; compliant: number; total: number }) {
  const color = score > 80 ? GREEN : score > 60 ? AMBER : RED;
  const bg = score > 80 ? "#dcfce7" : score > 60 ? "#fef3c7" : "#fee2e2";
  return (
    <div style={{
      background: bg,
      border: `2px solid ${color}`,
      borderRadius: 12,
      padding: "24px 32px",
      display: "flex",
      alignItems: "center",
      gap: 24,
      marginBottom: 24,
    }}>
      <div style={{ textAlign: "center" }}>
        <div style={{ fontSize: 52, fontWeight: 800, color, lineHeight: 1 }}>{score}%</div>
        <div style={{ fontSize: 14, color: "#374151", fontWeight: 600, marginTop: 4 }}>Compliance Score</div>
      </div>
      <div style={{ display: "flex", gap: 24, flexWrap: "wrap" }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: GREEN }}>{compliant}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Compliant</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: "#374151" }}>{total}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Total Checks</div>
        </div>
        <div style={{ textAlign: "center" }}>
          <div style={{ fontSize: 28, fontWeight: 700, color: total - compliant > 0 ? RED : GREEN }}>{total - compliant}</div>
          <div style={{ fontSize: 12, color: "#6b7280" }}>Exceptions</div>
        </div>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────────────────
export default function ComplianceDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const qc = useQueryClient();
  const dealershipId = user?.dealershipId as string | undefined;

  const [resolveId, setResolveId] = useState<string | null>(null);
  const [resolveNote, setResolveNote] = useState("");
  const [reportDateFrom, setReportDateFrom] = useState(() => {
    const d = new Date();
    d.setMonth(d.getMonth() - 3);
    return d.toISOString().slice(0, 10);
  });
  const [reportDateTo, setReportDateTo] = useState(() => new Date().toISOString().slice(0, 10));
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(null);
  const [activeTab, setActiveTab] = useState<"dashboard" | "reports">("dashboard");

  // ── Queries ──
  const { data: statusData, isLoading: statusLoading } = useQuery<StatusData>({
    queryKey: ["compliance-status", dealershipId],
    queryFn: () => apiFetch<StatusData>("/api/compliance/status"),
    enabled: !!dealershipId,
    staleTime: 30_000,
  });

  const { data: savedReports, isLoading: reportsLoading } = useQuery<{ reports: ReportData[] }>({
    queryKey: ["compliance-reports", dealershipId],
    queryFn: () => apiFetch<{ reports: ReportData[] }>("/api/compliance/reports"),
    enabled: !!dealershipId && activeTab === "reports",
    staleTime: 30_000,
  });

  // ── Mutations ──
  const runCheckMutation = useMutation({
    mutationFn: () => apiFetch<CheckResult>("/api/compliance/check", { method: "POST" }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compliance-status", dealershipId] });
    },
  });

  const resolveMutation = useMutation({
    mutationFn: ({ id, note }: { id: string; note: string }) =>
      apiFetch(`/api/compliance/exceptions/${id}`, {
        method: "PATCH",
        body: JSON.stringify({ resolutionNote: note }),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["compliance-status", dealershipId] });
      setResolveId(null);
      setResolveNote("");
    },
  });

  const reportMutation = useMutation({
    mutationFn: () =>
      apiFetch<{ report: ReportData }>("/api/compliance/report", {
        method: "POST",
        body: JSON.stringify({ reportType: "full_audit", dateFrom: reportDateFrom, dateTo: reportDateTo }),
      }),
    onSuccess: (data) => {
      setGeneratedReport(data.report);
      qc.invalidateQueries({ queryKey: ["compliance-reports", dealershipId] });
    },
  });

  const score = statusData?.score ?? 0;
  const compliant = statusData?.compliant ?? 0;
  const total = statusData?.total ?? 0;
  const exceptions = (statusData?.checks ?? []).filter(
    c => c.status === "non_compliant" || c.status === "pending_review"
  );
  const jurisdictionLabel = statusData?.jurisdictionLabel ?? "—";

  // Cross-jurisdiction check: customers in different provinces/states
  // (currently signalled via details from non-compliant checks referencing customer addresses)
  // Simplified: just count missingVins across document checks
  const hasDocIssues = exceptions.some(e => e.verificationMethod === "document_check" && e.details);

  return (
    <div style={{ padding: "24px", fontFamily: "Inter, sans-serif", maxWidth: 1200 }}>
      {/* ── Header ── */}
      <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 24, flexWrap: "wrap", gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: NAVY, margin: 0 }}>{t("compliance.title")}</h1>
          <div style={{ display: "flex", alignItems: "center", gap: 8, marginTop: 6 }}>
            <span style={{
              background: "#eff6ff",
              color: NAVY,
              padding: "3px 10px",
              borderRadius: 9999,
              fontSize: 12,
              fontWeight: 600,
              border: `1px solid #bfdbfe`,
            }}>
              {jurisdictionLabel}
            </span>
            {statusData?.lastChecked && (
              <span style={{ fontSize: 12, color: "#6b7280" }}>
                Last checked: {new Date(statusData.lastChecked).toLocaleDateString()}
              </span>
            )}
          </div>
        </div>
        <button
          onClick={() => runCheckMutation.mutate()}
          disabled={runCheckMutation.isPending}
          style={{
            background: NAVY, color: "#fff", border: "none",
            padding: "10px 20px", borderRadius: 8, cursor: "pointer",
            fontWeight: 600, fontSize: 14,
            opacity: runCheckMutation.isPending ? 0.7 : 1,
          }}
        >
          {runCheckMutation.isPending ? t("compliance.runningCheck") : t("compliance.runCheck")}
        </button>
      </div>

      {/* ── Tabs ── */}
      <div style={{ display: "flex", gap: 4, borderBottom: "2px solid #e5e7eb", marginBottom: 24 }}>
        {(["dashboard", "reports"] as const).map(tab => (
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
          }}>
            {tab === "dashboard" ? "Dashboard" : t("compliance.savedReports")}
          </button>
        ))}
      </div>

      {activeTab === "dashboard" && (
        <>
          {/* ── Score card ── */}
          {statusLoading ? (
            <div style={{ color: "#6b7280", padding: 24 }}>{t("common.loading")}</div>
          ) : (
            <ScoreCard score={score} compliant={compliant} total={total} />
          )}

          {/* ── Exceptions section ── */}
          <div style={{ marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 12 }}>{t("compliance.exceptions")}</h2>

            {exceptions.length === 0 && !statusLoading ? (
              <div style={{
                background: "#dcfce7",
                border: `1px solid #86efac`,
                borderRadius: 10,
                padding: "16px 20px",
                color: "#166534",
                fontWeight: 600,
                display: "flex",
                alignItems: "center",
                gap: 10,
              }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M22 11.08V12a10 10 0 11-5.93-9.14"/>
                  <polyline points="22 4 12 14.01 9 11.01"/>
                </svg>
                {t("compliance.noExceptions")}
              </div>
            ) : (
              <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
                <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                  <thead>
                    <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151", width: 100 }}>{t("compliance.severity")}</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>{t("compliance.requirement")}</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Status</th>
                      <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Details</th>
                      <th style={{ padding: "10px 16px", textAlign: "right", fontWeight: 600, color: "#374151" }}>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {exceptions.map((exc, i) => (
                      <>
                        <tr key={exc.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                          <td style={{ padding: "12px 16px" }}><SeverityBadge severity={exc.severity} /></td>
                          <td style={{ padding: "12px 16px" }}>
                            <div style={{ fontWeight: 600, color: "#111827" }}>{exc.requirementName}</div>
                            <div style={{ fontSize: 12, color: "#6b7280", marginTop: 2 }}>{exc.regulatorName} · {exc.jurisdiction}</div>
                          </td>
                          <td style={{ padding: "12px 16px" }}><StatusBadge status={exc.status} /></td>
                          <td style={{ padding: "12px 16px", fontSize: 12, color: "#374151" }}>
                            {exc.details && (exc.details as any).missingVins ? (
                              <span style={{ color: RED }}>
                                Missing on {(exc.details as any).missingVins.length} unit(s)
                              </span>
                            ) : exc.verificationMethod === "manual_review" ? (
                              <span style={{ color: AMBER }}>Requires manual confirmation</span>
                            ) : (
                              "Review required"
                            )}
                          </td>
                          <td style={{ padding: "12px 16px", textAlign: "right" }}>
                            <div style={{ display: "flex", gap: 8, justifyContent: "flex-end" }}>
                              {exc.documentRequired && (
                                <span style={{ fontSize: 11, color: "#6b7280", padding: "4px 8px", background: "#f3f4f6", borderRadius: 6 }}>
                                  Doc: {exc.documentRequired}
                                </span>
                              )}
                              <button
                                onClick={() => { setResolveId(exc.id); setResolveNote(""); }}
                                style={{
                                  background: GREEN, color: "#fff", border: "none",
                                  padding: "5px 12px", borderRadius: 6,
                                  cursor: "pointer", fontSize: 12, fontWeight: 600,
                                }}
                              >
                                {t("compliance.resolve")}
                              </button>
                            </div>
                          </td>
                        </tr>

                        {resolveId === exc.id && (
                          <tr key={`resolve-${exc.id}`} style={{ background: "#f0fdf4", borderBottom: "1px solid #e5e7eb" }}>
                            <td colSpan={5} style={{ padding: "16px 20px" }}>
                              <div style={{ display: "flex", gap: 12, alignItems: "flex-start" }}>
                                <textarea
                                  placeholder={t("compliance.resolutionNotePlaceholder")}
                                  value={resolveNote}
                                  onChange={e => setResolveNote(e.target.value)}
                                  rows={2}
                                  style={{
                                    flex: 1, padding: "8px 12px", borderRadius: 6,
                                    border: "1px solid #d1d5db", fontSize: 13,
                                    fontFamily: "Inter, sans-serif",
                                    resize: "vertical",
                                  }}
                                />
                                <div style={{ display: "flex", gap: 8 }}>
                                  <button
                                    onClick={() => resolveMutation.mutate({ id: exc.id, note: resolveNote })}
                                    disabled={!resolveNote.trim() || resolveMutation.isPending}
                                    style={{
                                      background: NAVY, color: "#fff", border: "none",
                                      padding: "8px 16px", borderRadius: 6,
                                      cursor: "pointer", fontWeight: 600, fontSize: 13,
                                      opacity: (!resolveNote.trim() || resolveMutation.isPending) ? 0.6 : 1,
                                    }}
                                  >
                                    {t("compliance.markResolved")}
                                  </button>
                                  <button
                                    onClick={() => setResolveId(null)}
                                    style={{
                                      background: "#f3f4f6", color: "#374151", border: "1px solid #d1d5db",
                                      padding: "8px 12px", borderRadius: 6,
                                      cursor: "pointer", fontSize: 13,
                                    }}
                                  >
                                    {t("common.cancel")}
                                  </button>
                                </div>
                              </div>
                            </td>
                          </tr>
                        )}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          {/* ── Generate Report section ── */}
          <div style={{ background: "#f9fafb", border: "1px solid #e5e7eb", borderRadius: 10, padding: 20, marginBottom: 32 }}>
            <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t("compliance.generateReport")}</h2>
            <div style={{ display: "flex", gap: 12, alignItems: "flex-end", flexWrap: "wrap" }}>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>From</label>
                <input
                  type="date"
                  value={reportDateFrom}
                  onChange={e => setReportDateFrom(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                />
              </div>
              <div>
                <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "#374151", marginBottom: 4 }}>To</label>
                <input
                  type="date"
                  value={reportDateTo}
                  onChange={e => setReportDateTo(e.target.value)}
                  style={{ padding: "8px 12px", borderRadius: 6, border: "1px solid #d1d5db", fontSize: 13 }}
                />
              </div>
              <button
                onClick={() => reportMutation.mutate()}
                disabled={reportMutation.isPending}
                style={{
                  background: NAVY, color: "#fff", border: "none",
                  padding: "9px 20px", borderRadius: 6, cursor: "pointer",
                  fontWeight: 600, fontSize: 14,
                  opacity: reportMutation.isPending ? 0.7 : 1,
                }}
              >
                {reportMutation.isPending ? t("compliance.generating") : t("compliance.generateReport")}
              </button>
            </div>

            {reportMutation.isError && (
              <div style={{ marginTop: 12, color: RED, fontSize: 13 }}>
                Failed to generate report. Please try again.
              </div>
            )}
          </div>

          {/* ── Inline generated report ── */}
          {generatedReport && (
            <div style={{ border: `2px solid ${NAVY}`, borderRadius: 12, padding: 24, marginBottom: 32 }} id="compliance-report-print">
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 20 }}>
                <div>
                  <h2 style={{ fontSize: 20, fontWeight: 800, color: NAVY, margin: 0 }}>
                    {generatedReport.reportData.jurisdiction} — {t("compliance.report")}
                  </h2>
                  <div style={{ fontSize: 13, color: "#6b7280", marginTop: 4 }}>
                    Period: {generatedReport.dateFrom} to {generatedReport.dateTo}
                  </div>
                  <div style={{ fontSize: 13, color: "#6b7280" }}>
                    Generated: {new Date(generatedReport.createdAt).toLocaleString()}
                  </div>
                </div>
                <PrintButton title={t("compliance.report")} />
              </div>

              {/* Score */}
              <ScoreCard
                score={generatedReport.reportData.complianceScore}
                compliant={generatedReport.reportData.compliant}
                total={generatedReport.reportData.total}
              />

              {/* Severity summary */}
              <div style={{ display: "flex", gap: 12, marginBottom: 20, flexWrap: "wrap" }}>
                {Object.entries(generatedReport.reportData.summary).map(([sev, count]) => (
                  count > 0 && (
                    <div key={sev} style={{ display: "flex", alignItems: "center", gap: 6 }}>
                      <SeverityBadge severity={sev} />
                      <span style={{ fontSize: 14, fontWeight: 600 }}>{count}</span>
                    </div>
                  )
                ))}
              </div>

              {/* Exception list */}
              {generatedReport.reportData.exceptions.length > 0 && (
                <div style={{ marginBottom: 24 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 10 }}>{t("compliance.exceptions")}</h3>
                  {generatedReport.reportData.exceptions.map(exc => (
                    <div key={exc.id || exc.requirementName} style={{
                      display: "flex", gap: 12, alignItems: "flex-start",
                      padding: "10px 14px", borderBottom: "1px solid #f3f4f6",
                    }}>
                      <SeverityBadge severity={exc.severity} />
                      <div>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{exc.requirementName}</div>
                        <div style={{ fontSize: 12, color: "#6b7280" }}>{exc.regulatorName}</div>
                      </div>
                      <StatusBadge status={exc.status} />
                    </div>
                  ))}
                </div>
              )}

              {/* Document completeness per unit */}
              {generatedReport.reportData.unitDocSummaries.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <h3 style={{ fontSize: 16, fontWeight: 700, color: NAVY, marginBottom: 10 }}>{t("compliance.documentCompleteness")}</h3>
                  <div style={{ border: "1px solid #e5e7eb", borderRadius: 8, overflow: "hidden" }}>
                    {generatedReport.reportData.unitDocSummaries.map((u, i) => (
                      <div key={u.vin} style={{
                        padding: "12px 16px",
                        borderBottom: i < generatedReport.reportData.unitDocSummaries.length - 1 ? "1px solid #f3f4f6" : "none",
                        background: i % 2 === 0 ? "#fff" : "#fafafa",
                      }}>
                        <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between" }}>
                          <div>
                            <span style={{ fontWeight: 600, fontSize: 13 }}>{u.vin}</span>
                            <span style={{ fontSize: 12, color: "#6b7280", marginLeft: 8 }}>{u.unitDesc}</span>
                          </div>
                          <div style={{ fontSize: 13, fontWeight: 600, color: u.missingDocs.length > 0 ? RED : GREEN }}>
                            {u.presentDocs}/{u.totalDocs} docs
                          </div>
                        </div>
                        {u.missingDocs.length > 0 && (
                          <div style={{ marginTop: 4, fontSize: 11, color: RED }}>
                            Missing: {u.missingDocs.join(", ")}
                          </div>
                        )}
                        {u.totalDocs > 0 && (
                          <div style={{
                            marginTop: 6,
                            height: 6,
                            background: "#e5e7eb",
                            borderRadius: 3,
                            overflow: "hidden",
                          }}>
                            <div style={{
                              height: "100%",
                              width: `${Math.round((u.presentDocs / u.totalDocs) * 100)}%`,
                              background: u.missingDocs.length > 0 ? AMBER : GREEN,
                              borderRadius: 3,
                            }} />
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div style={{ fontSize: 13, color: "#6b7280" }}>
                Total units sold in period: {generatedReport.reportData.unitsSold}
              </div>
            </div>
          )}
        </>
      )}

      {activeTab === "reports" && (
        <div>
          <h2 style={{ fontSize: 18, fontWeight: 700, color: NAVY, marginBottom: 16 }}>{t("compliance.savedReports")}</h2>
          {reportsLoading ? (
            <div style={{ color: "#6b7280" }}>{t("common.loading")}</div>
          ) : (savedReports?.reports ?? []).length === 0 ? (
            <div style={{ color: "#6b7280", padding: 20, textAlign: "center" }}>
              No reports generated yet. Use the Dashboard tab to generate your first report.
            </div>
          ) : (
            <div style={{ border: "1px solid #e5e7eb", borderRadius: 10, overflow: "hidden" }}>
              <table style={{ width: "100%", borderCollapse: "collapse", fontSize: 14 }}>
                <thead>
                  <tr style={{ background: "#f9fafb", borderBottom: "1px solid #e5e7eb" }}>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Type</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Jurisdiction</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Period</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Score</th>
                    <th style={{ padding: "10px 16px", textAlign: "left", fontWeight: 600, color: "#374151" }}>Generated</th>
                  </tr>
                </thead>
                <tbody>
                  {(savedReports?.reports ?? []).map((r, i) => {
                    const rd = r.reportData;
                    return (
                      <tr key={r.id} style={{ borderBottom: "1px solid #f3f4f6", background: i % 2 === 0 ? "#fff" : "#fafafa" }}>
                        <td style={{ padding: "12px 16px", textTransform: "capitalize" }}>{r.reportType.replace("_", " ")}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>{r.jurisdiction}</td>
                        <td style={{ padding: "12px 16px", fontSize: 12 }}>{r.dateFrom} → {r.dateTo}</td>
                        <td style={{ padding: "12px 16px" }}>
                          <span style={{
                            fontWeight: 700,
                            color: rd.complianceScore > 80 ? GREEN : rd.complianceScore > 60 ? AMBER : RED,
                          }}>
                            {rd.complianceScore}%
                          </span>
                        </td>
                        <td style={{ padding: "12px 16px", fontSize: 12, color: "#6b7280" }}>
                          {new Date(r.createdAt).toLocaleDateString()}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
