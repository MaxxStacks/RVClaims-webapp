// client/src/components/AiCccPanel.tsx
// AI Claim Drafting — CCC from Photos (OPERATOR ONLY)
// Analyzes claim photos via Claude Vision, groups photos by issue, suggests C/C/C text

import { useState, useCallback } from "react";
import { apiFetch } from "@/lib/api";
import { useLanguage } from "@/hooks/use-language";

// ==================== TYPES ====================

interface PhotoInput {
  url: string;
  id: string;
  category?: string;
  thumbnail?: string;
}

interface UnitInfo {
  vin?: string;
  year?: string | number;
  manufacturer?: string;
  model?: string;
}

export interface AiCccPanelProps {
  claimId: string | null;
  photos: PhotoInput[];
  unitInfo?: UnitInfo;
  onFrcLineCreated?: (lineId: string) => void;
}

type IssueAction = "accepted_as_is" | "accepted_with_edits" | "dismissed" | null;
type AnalysisState = "idle" | "loading" | "done" | "error";

interface AiIssueRaw {
  issueNumber: number;
  photoIndices: number[];
  complaint: string;
  cause: string;
  correction: string;
  severity: "minor" | "moderate" | "major";
  category: string;
  confidence: number;
}

interface AiIssue extends AiIssueRaw {
  editedComplaint: string;
  editedCause: string;
  editedCorrection: string;
  action: IssueAction;
  persistedLineId: string | null;
}

// ==================== CONSTANTS ====================

const ISSUE_COLORS = ["#3b82f6", "#22c55e", "#f97316", "#a855f7", "#06b6d4", "#ef4444", "#eab308", "#ec4899"];

function issueColor(idx: number): string {
  return ISSUE_COLORS[idx % ISSUE_COLORS.length];
}

const LOADING_MESSAGES = ["Analyzing photos...", "Grouping issues...", "Generating CCC descriptions..."];

// ==================== HELPERS ====================

function confidenceBadge(confidence: number): { label: string; color: string } {
  if (confidence >= 0.8) return { label: "HIGH CONFIDENCE", color: "#22c55e" };
  if (confidence >= 0.5) return { label: "REVIEW CAREFULLY", color: "#f59e0b" };
  return { label: "LOW CONFIDENCE — Verify", color: "#ef4444" };
}

function severityBadge(severity: string): string {
  if (severity === "major") return "#dc2626";
  if (severity === "moderate") return "#f59e0b";
  return "#6b7280";
}

// ==================== COMPONENT ====================

export default function AiCccPanel({ claimId, photos, unitInfo, onFrcLineCreated }: AiCccPanelProps) {
  const { t } = useLanguage();

  const [analysisState, setAnalysisState] = useState<AnalysisState>("idle");
  const [issues, setIssues] = useState<AiIssue[]>([]);
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [loadingMsgIdx, setLoadingMsgIdx] = useState(0);
  const [acceptingIssueNum, setAcceptingIssueNum] = useState<number | null>(null);
  const [expandedPhoto, setExpandedPhoto] = useState<string | null>(null);

  // Cycle loading messages
  const startLoadingCycle = useCallback(() => {
    let idx = 0;
    const iv = setInterval(() => {
      idx = (idx + 1) % LOADING_MESSAGES.length;
      setLoadingMsgIdx(idx);
    }, 1400);
    return iv;
  }, []);

  const runAnalysis = useCallback(async () => {
    if (photos.length === 0) return;
    setAnalysisState("loading");
    setIssues([]);
    setErrorMessage("");
    setLoadingMsgIdx(0);

    const iv = startLoadingCycle();

    try {
      const body = {
        photos: photos.map((p) => ({ url: p.url, id: p.id, category: p.category })),
        unitInfo: unitInfo || undefined,
        claimId: claimId || undefined,
      };

      const data = await apiFetch<{
        success: boolean;
        issues: AiIssueRaw[];
        photosAnalyzed: number;
        issuesFound: number;
        message?: string;
        fallback?: boolean;
      }>("/api/ai/analyze-claim-photos", {
        method: "POST",
        body: JSON.stringify(body),
      });

      clearInterval(iv);

      if (!data.success) {
        setErrorMessage(data.message || "AI analysis failed.");
        setAnalysisState("error");
        return;
      }

      const mapped: AiIssue[] = (data.issues || []).map((raw) => ({
        ...raw,
        editedComplaint: raw.complaint,
        editedCause: raw.cause,
        editedCorrection: raw.correction,
        action: null,
        persistedLineId: null,
      }));

      setIssues(mapped);
      setAnalysisState("done");
    } catch (err: any) {
      clearInterval(iv);
      setErrorMessage(err?.message || "AI analysis failed. Please try again.");
      setAnalysisState("error");
    }
  }, [photos, unitInfo, claimId, startLoadingCycle]);

  const handleAccept = useCallback(async (issueNum: number) => {
    const issue = issues.find((i) => i.issueNumber === issueNum);
    if (!issue) return;

    setAcceptingIssueNum(issueNum);

    const isEdited =
      issue.editedComplaint !== issue.complaint ||
      issue.editedCause !== issue.cause ||
      issue.editedCorrection !== issue.correction;
    const action: IssueAction = isEdited ? "accepted_with_edits" : "accepted_as_is";

    const description = [
      `C: ${issue.editedComplaint}`,
      `C: ${issue.editedCause}`,
      `C: ${issue.editedCorrection}`,
    ].join(" | ");

    let createdLineId: string | null = null;

    // If claimId present, create FRC line
    if (claimId) {
      try {
        const lineRes = await apiFetch<{ success: boolean; frcLine?: { id: string } }>(`/api/claims/${claimId}/frc-lines`, {
          method: "POST",
          body: JSON.stringify({
            claimId,
            description,
            status: "pending",
          }),
        });
        if (lineRes.success && lineRes.frcLine?.id) {
          createdLineId = lineRes.frcLine.id;
          onFrcLineCreated?.(createdLineId);
        }
      } catch (err: any) {
        console.error("[AiCccPanel] FRC line creation failed:", err?.message);
      }
    }

    // Log feedback (best-effort — don't block UI)
    try {
      await apiFetch("/api/ai/claim-feedback", {
        method: "POST",
        body: JSON.stringify({
          claimId: claimId || "no-claim",
          issueNumber: issue.issueNumber,
          photoIndices: issue.photoIndices,
          aiOriginal: {
            complaint: issue.complaint,
            cause: issue.cause,
            correction: issue.correction,
            category: issue.category,
            severity: issue.severity,
            confidence: issue.confidence,
          },
          operatorFinal: {
            complaint: issue.editedComplaint,
            cause: issue.editedCause,
            correction: issue.editedCorrection,
          },
          action,
          claimLineId: createdLineId || undefined,
        }),
      });
    } catch (_e) {
      // non-fatal
    }

    setIssues((prev) =>
      prev.map((i) =>
        i.issueNumber === issueNum
          ? { ...i, action, persistedLineId: createdLineId }
          : i
      )
    );
    setAcceptingIssueNum(null);
  }, [issues, claimId, onFrcLineCreated]);

  const handleDismiss = useCallback(async (issueNum: number) => {
    const issue = issues.find((i) => i.issueNumber === issueNum);
    if (!issue) return;

    // Log feedback
    try {
      await apiFetch("/api/ai/claim-feedback", {
        method: "POST",
        body: JSON.stringify({
          claimId: claimId || "no-claim",
          issueNumber: issue.issueNumber,
          photoIndices: issue.photoIndices,
          aiOriginal: {
            complaint: issue.complaint,
            cause: issue.cause,
            correction: issue.correction,
            category: issue.category,
            severity: issue.severity,
            confidence: issue.confidence,
          },
          operatorFinal: null,
          action: "dismissed",
        }),
      });
    } catch (_e) {
      // non-fatal
    }

    setIssues((prev) =>
      prev.map((i) => (i.issueNumber === issueNum ? { ...i, action: "dismissed" } : i))
    );
  }, [issues, claimId]);

  const handleUndo = useCallback((issueNum: number) => {
    setIssues((prev) =>
      prev.map((i) =>
        i.issueNumber === issueNum
          ? { ...i, action: null, persistedLineId: null }
          : i
      )
    );
  }, []);

  const updateEdit = useCallback(
    (issueNum: number, field: "editedComplaint" | "editedCause" | "editedCorrection", value: string) => {
      setIssues((prev) =>
        prev.map((i) => (i.issueNumber === issueNum ? { ...i, [field]: value } : i))
      );
    },
    []
  );

  // ==================== RENDER ====================

  const allActioned = issues.length > 0 && issues.every((i) => i.action !== null);
  const acceptedCount = issues.filter((i) => i.action === "accepted_as_is" || i.action === "accepted_with_edits").length;
  const dismissedCount = issues.filter((i) => i.action === "dismissed").length;

  const panelStyle: React.CSSProperties = {
    background: "#fff",
    border: "1px solid #e5e7eb",
    borderRadius: 10,
    marginBottom: 20,
    overflow: "hidden",
  };

  const sectionH: React.CSSProperties = {
    display: "flex",
    alignItems: "center",
    gap: 8,
    padding: "14px 20px",
    borderBottom: "1px solid #f0f0f0",
    fontWeight: 600,
    fontSize: 14,
  };

  // ---- IDLE ----
  if (analysisState === "idle") {
    return (
      <div style={panelStyle}>
        <div style={sectionH}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span>AI Claim Drafting</span>
          <span style={{ marginLeft: "auto", fontSize: 11, color: "#888", fontWeight: 400, background: "#f0f4ff", padding: "2px 8px", borderRadius: 10 }}>
            Operator tool
          </span>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <p style={{ fontSize: 13, color: "#555", marginBottom: 16, lineHeight: 1.6 }}>
            Analyze the claim photos to automatically generate Complaint, Cause, and Correction descriptions. Photos of the same issue will be grouped together.
          </p>
          <div style={{ fontSize: 12, color: "#888", marginBottom: 16 }}>
            {photos.length} {photos.length === 1 ? "photo" : "photos"} available for analysis
          </div>
          <button
            className="btn btn-p btn-sm"
            onClick={runAnalysis}
            disabled={photos.length === 0}
            style={{ display: "flex", alignItems: "center", gap: 6, opacity: photos.length === 0 ? 0.5 : 1 }}
          >
            <span style={{ fontSize: 15 }}>✨</span>
            Analyze Photos with AI
          </button>
          {photos.length === 0 && (
            <div style={{ marginTop: 10, fontSize: 12, color: "#dc2626" }}>
              No photos uploaded yet — upload photos first
            </div>
          )}
        </div>
      </div>
    );
  }

  // ---- LOADING ----
  if (analysisState === "loading") {
    return (
      <div style={panelStyle}>
        <div style={sectionH}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span>AI Claim Drafting</span>
        </div>
        <div style={{ padding: "32px 24px", textAlign: "center" }}>
          <div style={{
            width: 36, height: 36, border: "3px solid #e5e7eb",
            borderTopColor: "var(--brand, #08235d)", borderRadius: "50%",
            margin: "0 auto 16px",
            animation: "spin 0.8s linear infinite",
          }} />
          <div style={{ fontSize: 14, fontWeight: 500, color: "#333" }}>
            {LOADING_MESSAGES[loadingMsgIdx]}
          </div>
          <div style={{ fontSize: 12, color: "#888", marginTop: 6 }}>
            Analyzing {photos.length} photos...
          </div>
          <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
        </div>
      </div>
    );
  }

  // ---- ERROR ----
  if (analysisState === "error") {
    return (
      <div style={panelStyle}>
        <div style={sectionH}>
          <span style={{ fontSize: 16 }}>✨</span>
          <span>AI Claim Drafting</span>
        </div>
        <div style={{ padding: "20px 24px" }}>
          <div style={{ background: "#fff5f5", border: "1px solid #fecaca", borderRadius: 8, padding: "14px 16px", marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: "#dc2626", marginBottom: 4 }}>Analysis Failed</div>
            <div style={{ fontSize: 12, color: "#555" }}>{errorMessage}</div>
          </div>
          <div style={{ display: "flex", gap: 10 }}>
            <button className="btn btn-p btn-sm" onClick={runAnalysis}>
              Try Again
            </button>
            <button
              className="btn btn-o btn-sm"
              onClick={() => setAnalysisState("idle")}
              style={{ background: "none", border: "none", color: "#888", cursor: "pointer", fontSize: 13 }}
            >
              Continue Manually
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ---- DONE ----

  // Build photoIndex → issueNumber map for the "all photos" strip
  const photoIssueMap: Record<number, number> = {};
  for (const issue of issues) {
    for (const idx of issue.photoIndices) {
      photoIssueMap[idx] = issue.issueNumber;
    }
  }

  return (
    <div style={panelStyle}>
      <div style={sectionH}>
        <span style={{ fontSize: 16 }}>✨</span>
        <span>AI Claim Drafting</span>
        <span style={{ marginLeft: "auto", fontSize: 11, color: "#888", fontWeight: 400, background: "#f0f4ff", padding: "2px 8px", borderRadius: 10 }}>
          Operator tool
        </span>
      </div>

      {/* Analysis summary bar */}
      <div style={{ padding: "12px 20px", background: "#f8fafc", borderBottom: "1px solid #f0f0f0", display: "flex", alignItems: "center", gap: 12, flexWrap: "wrap" }}>
        <div style={{ fontSize: 13, fontWeight: 600 }}>
          AI Analysis Complete — {issues.length} {issues.length === 1 ? "issue" : "issues"} found from {photos.length} photos
        </div>
        {!claimId && (
          <div style={{ fontSize: 11, color: "#f59e0b", background: "#fffbeb", border: "1px solid #fde68a", borderRadius: 6, padding: "2px 8px" }}>
            No claim linked — decisions logged only
          </div>
        )}
        <button
          className="btn btn-o btn-sm"
          onClick={() => { setAnalysisState("idle"); setIssues([]); }}
          style={{ marginLeft: "auto", fontSize: 11 }}
        >
          Re-analyze
        </button>
      </div>

      {/* All photos strip with issue color dots */}
      {photos.length > 0 && (
        <div style={{ padding: "12px 20px", borderBottom: "1px solid #f0f0f0" }}>
          <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 8, textTransform: "uppercase", letterSpacing: "0.05em" }}>
            All Photos — Color shows issue grouping
          </div>
          <div style={{ display: "flex", flexWrap: "wrap", gap: 6 }}>
            {photos.map((photo, idx) => {
              const issueNum = photoIssueMap[idx];
              const color = issueNum != null ? issueColor(issueNum - 1) : "#d1d5db";
              return (
                <div
                  key={photo.id}
                  style={{ position: "relative", width: 48, height: 48, borderRadius: 6, overflow: "hidden", border: `2px solid ${color}`, cursor: "pointer", flexShrink: 0 }}
                  onClick={() => setExpandedPhoto(expandedPhoto === photo.url ? null : photo.url)}
                  title={issueNum != null ? `Issue ${issueNum}` : "Unassigned"}
                >
                  <img
                    src={photo.thumbnail || photo.url}
                    alt={`Photo ${idx + 1}`}
                    style={{ width: "100%", height: "100%", objectFit: "cover" }}
                    onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                  />
                  {issueNum != null && (
                    <span style={{
                      position: "absolute", top: 2, right: 2,
                      background: color, color: "#fff",
                      width: 14, height: 14, borderRadius: "50%",
                      fontSize: 8, fontWeight: 700,
                      display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                      {issueNum}
                    </span>
                  )}
                </div>
              );
            })}
          </div>
          {/* Legend */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 8 }}>
            {issues.map((issue) => (
              <div key={issue.issueNumber} style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#555" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: issueColor(issue.issueNumber - 1), flexShrink: 0 }} />
                Issue {issue.issueNumber}
              </div>
            ))}
            {Object.values(photoIssueMap).length < photos.length && (
              <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#555" }}>
                <div style={{ width: 10, height: 10, borderRadius: "50%", background: "#d1d5db", flexShrink: 0 }} />
                Unassigned
              </div>
            )}
          </div>
        </div>
      )}

      {/* Expanded photo lightbox */}
      {expandedPhoto && (
        <div
          style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.8)", zIndex: 9999, display: "flex", alignItems: "center", justifyContent: "center" }}
          onClick={() => setExpandedPhoto(null)}
        >
          <img src={expandedPhoto} alt="Expanded" style={{ maxWidth: "90vw", maxHeight: "90vh", borderRadius: 8, objectFit: "contain" }} />
        </div>
      )}

      {/* Instructions */}
      <div style={{ padding: "10px 20px", background: "#f8fafc", borderBottom: "1px solid #f0f0f0", fontSize: 12, color: "#555" }}>
        Review each issue below. Edit the descriptions if needed, then click Accept to add as an FRC line.
      </div>

      {/* Issue cards */}
      <div style={{ padding: "12px 20px" }}>
        {issues.map((issue) => {
          const cb = confidenceBadge(issue.confidence);
          const isAccepted = issue.action === "accepted_as_is" || issue.action === "accepted_with_edits";
          const isDismissed = issue.action === "dismissed";
          const isActioning = acceptingIssueNum === issue.issueNumber;
          const lowConf = issue.confidence < 0.5;
          const color = issueColor(issue.issueNumber - 1);

          return (
            <div
              key={issue.issueNumber}
              style={{
                border: `1px solid ${isAccepted ? "#bbf7d0" : isDismissed ? "#e5e7eb" : "#e5e7eb"}`,
                borderLeft: `4px solid ${isAccepted ? "#22c55e" : isDismissed ? "#d1d5db" : color}`,
                borderRadius: 8,
                marginBottom: 14,
                overflow: "hidden",
                opacity: isDismissed ? 0.6 : 1,
                background: isAccepted ? "#f0fdf4" : isDismissed ? "#fafafa" : lowConf ? "#fffbf0" : "#fff",
              }}
            >
              {/* Issue header */}
              <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap", borderBottom: isDismissed || isAccepted ? "none" : "1px solid #f0f0f0" }}>
                <span style={{ background: color, color: "#fff", fontSize: 11, fontWeight: 700, padding: "2px 8px", borderRadius: 4 }}>
                  Issue {issue.issueNumber} of {issues.length}
                </span>
                <span style={{ fontSize: 11, background: "#f1f5f9", color: "#475569", padding: "2px 8px", borderRadius: 4, textTransform: "capitalize" }}>
                  {issue.category.replace(/_/g, " ")}
                </span>
                <span style={{ fontSize: 11, background: "#f1f5f9", color: severityBadge(issue.severity), padding: "2px 8px", borderRadius: 4, textTransform: "capitalize", fontWeight: 600 }}>
                  {issue.severity}
                </span>
                <span style={{ marginLeft: "auto", fontSize: 11, fontWeight: 600, color: cb.color, background: cb.color + "18", padding: "2px 8px", borderRadius: 4 }}>
                  {Math.round(issue.confidence * 100)}% {cb.label}
                </span>
              </div>

              {/* Dismissed state */}
              {isDismissed && (
                <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#9ca3af", textDecoration: "line-through", flex: 1 }}>
                    {issue.editedComplaint}
                  </span>
                  <span style={{ fontSize: 12, color: "#9ca3af" }}>Issue Dismissed</span>
                  <button
                    className="btn btn-o btn-sm"
                    style={{ fontSize: 11, padding: "3px 10px" }}
                    onClick={() => handleUndo(issue.issueNumber)}
                  >
                    Undo
                  </button>
                </div>
              )}

              {/* Accepted state */}
              {isAccepted && (
                <div style={{ padding: "10px 14px", display: "flex", alignItems: "center", gap: 10 }}>
                  <span style={{ fontSize: 12, color: "#16a34a", flex: 1 }}>
                    Accepted as FRC Line {issue.action === "accepted_with_edits" ? "(with edits)" : ""}
                  </span>
                  {!issue.persistedLineId && (
                    <button
                      className="btn btn-o btn-sm"
                      style={{ fontSize: 11, padding: "3px 10px" }}
                      onClick={() => handleUndo(issue.issueNumber)}
                    >
                      Undo
                    </button>
                  )}
                </div>
              )}

              {/* Active state — show photo thumbnails + textareas */}
              {!isDismissed && !isAccepted && (
                <div style={{ padding: "12px 14px" }}>
                  {/* Photo thumbnails */}
                  {issue.photoIndices.length > 0 && (
                    <div style={{ marginBottom: 12 }}>
                      <div style={{ fontSize: 11, fontWeight: 600, color: "#888", marginBottom: 6 }}>
                        Photos grouped here ({issue.photoIndices.length} photo{issue.photoIndices.length !== 1 ? "s" : ""})
                      </div>
                      <div style={{ display: "flex", flexWrap: "wrap", gap: 5 }}>
                        {issue.photoIndices.map((photoIdx) => {
                          const photo = photos[photoIdx];
                          if (!photo) return null;
                          return (
                            <div
                              key={photoIdx}
                              style={{
                                width: 64, height: 64, borderRadius: 6, overflow: "hidden",
                                border: `2px solid ${color}`, cursor: "pointer", flexShrink: 0,
                              }}
                              onClick={() => setExpandedPhoto(expandedPhoto === photo.url ? null : photo.url)}
                              title={`Photo ${photoIdx + 1}`}
                            >
                              <img
                                src={photo.thumbnail || photo.url}
                                alt={`Photo ${photoIdx + 1}`}
                                style={{ width: "100%", height: "100%", objectFit: "cover" }}
                                onError={(e) => { (e.target as HTMLImageElement).style.display = "none"; }}
                              />
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  )}

                  {/* CCC textareas */}
                  <div style={{ display: "flex", flexDirection: "column", gap: 10 }}>
                    {(["editedComplaint", "editedCause", "editedCorrection"] as const).map((field) => {
                      const label = field === "editedComplaint" ? "Complaint" : field === "editedCause" ? "Cause" : "Correction";
                      return (
                        <div key={field}>
                          <div style={{ fontSize: 11, fontWeight: 600, color: "#555", marginBottom: 3, textTransform: "uppercase", letterSpacing: "0.04em" }}>
                            {label}
                          </div>
                          <textarea
                            value={issue[field]}
                            onChange={(e) => updateEdit(issue.issueNumber, field, e.target.value)}
                            style={{
                              width: "100%",
                              padding: "8px 10px",
                              border: "1px solid #e0e0e0",
                              borderRadius: 6,
                              fontSize: 13,
                              fontFamily: "inherit",
                              lineHeight: 1.5,
                              minHeight: 50,
                              resize: "vertical",
                              outline: "none",
                              background: lowConf ? "#fffbf0" : "#fafafa",
                              fontStyle: lowConf ? "italic" : "normal",
                              color: lowConf ? "#78716c" : "#1e293b",
                              boxSizing: "border-box",
                            }}
                          />
                        </div>
                      );
                    })}
                  </div>

                  {/* Actions */}
                  <div style={{ display: "flex", gap: 8, marginTop: 12 }}>
                    <button
                      className="btn btn-p btn-sm"
                      onClick={() => handleAccept(issue.issueNumber)}
                      disabled={isActioning}
                      style={{ display: "flex", alignItems: "center", gap: 5 }}
                    >
                      {isActioning ? (
                        <>
                          <span style={{ width: 12, height: 12, border: "2px solid rgba(255,255,255,0.4)", borderTopColor: "#fff", borderRadius: "50%", display: "inline-block", animation: "spin 0.6s linear infinite" }} />
                          Accepting...
                        </>
                      ) : (
                        <>
                          <span>✓</span>
                          {claimId ? "Accept as FRC Line" : "Accept (log only)"}
                        </>
                      )}
                    </button>
                    <button
                      className="btn btn-o btn-sm"
                      onClick={() => handleDismiss(issue.issueNumber)}
                      disabled={isActioning}
                      style={{ color: "#dc2626", borderColor: "#fecaca" }}
                    >
                      Dismiss
                    </button>
                  </div>
                  {!claimId && (
                    <div style={{ fontSize: 11, color: "#9ca3af", marginTop: 6 }}>
                      No claim linked — accepting will log feedback only, no FRC line created.
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* All issues actioned summary */}
      {allActioned && (
        <div style={{ padding: "14px 20px", background: "#f0fdf4", borderTop: "1px solid #bbf7d0", display: "flex", alignItems: "center", gap: 10, flexWrap: "wrap" }}>
          <span style={{ fontSize: 13, fontWeight: 600, color: "#15803d" }}>
            All {issues.length} issues reviewed — {acceptedCount} accepted, {dismissedCount} dismissed
          </span>
          <button
            className="btn btn-o btn-sm"
            onClick={() => { setAnalysisState("idle"); setIssues([]); }}
            style={{ marginLeft: "auto", fontSize: 11 }}
          >
            Re-analyze
          </button>
        </div>
      )}
    </div>
  );
}
