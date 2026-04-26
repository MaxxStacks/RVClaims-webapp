import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";

const KANBAN_COLUMNS = [
  { key: "new_unassigned", label: "New / Unassigned", color: "#1e88e5" },
  { key: "assigned", label: "Assigned", color: "#0891b2" },
  { key: "in_review", label: "In Review", color: "#f48120" },
  { key: "info_requested", label: "Info Requested", color: "#9b59b6" },
  { key: "submitted_to_mfr", label: "Submitted to Mfr", color: "#6366f1" },
  { key: "approved", label: "Approved", color: "#16a34a" },
  { key: "denied", label: "Denied", color: "#c0392b" },
];

const TYPE_BADGE: Record<string, string> = {
  warranty: "#1e88e5", extended_warranty: "#6366f1", pdi: "#0891b2",
  daf: "#f48120", insurance: "#9b59b6",
};

function timeAgo(date: Date): string {
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
  if (seconds < 60) return "just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m ago`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h ago`;
  return `${Math.floor(hours / 24)}d ago`;
}

export default function ClaimQueuePage() {
  const apiFetch = useApiFetch();
  const [claimsList, setClaimsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [claimDetail, setClaimDetail] = useState<any>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [filters, setFilters] = useState({ dealershipId: "", type: "", manufacturer: "", search: "" });

  async function refresh() {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (filters.dealershipId) params.set("dealershipId", filters.dealershipId);
      if (filters.type) params.set("type", filters.type);
      if (filters.manufacturer) params.set("manufacturer", filters.manufacturer);
      if (filters.search) params.set("search", filters.search);
      const list = await apiFetch<any[]>(`/api/v6/claims?${params.toString()}`);
      setClaimsList((list || []).filter(c => c.status !== "draft"));
    } finally { setLoading(false); }
  }

  useEffect(() => { refresh(); }, [filters.dealershipId, filters.type, filters.manufacturer]);

  async function openClaim(claimId: string) {
    setSelectedClaimId(claimId);
    setDetailLoading(true);
    try {
      const detail = await apiFetch<any>(`/api/v6/claims/${claimId}`);
      setClaimDetail(detail);
    } finally { setDetailLoading(false); }
  }

  async function performAction(action: string, body?: any) {
    if (!selectedClaimId) return;
    await apiFetch(`/api/v6/claims/${selectedClaimId}/${action}`, {
      method: "POST", body: JSON.stringify(body || {}),
    });
    await refresh();
    await openClaim(selectedClaimId);
  }

  const searched = filters.search
    ? claimsList.filter(c =>
        c.claimNumber?.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.unit?.vin?.toLowerCase().includes(filters.search.toLowerCase()) ||
        c.unitModel?.toLowerCase().includes(filters.search.toLowerCase())
      )
    : claimsList;

  const columns = KANBAN_COLUMNS.map(col => ({
    ...col,
    claims: searched.filter(c => c.status === col.key),
  }));

  const uniqueManufacturers = Array.from(new Set(claimsList.map(c => c.manufacturer).filter(Boolean)));

  return (
    <div style={{ padding: 24, display: "flex", flexDirection: "column", height: "100%", overflow: "hidden" }}>
      {/* Header */}
      <div style={{ marginBottom: 16, flexShrink: 0 }}>
        <div style={{ fontSize: 11, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>Operations</div>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <h1 style={{ margin: "4px 0 0", fontSize: 22, fontWeight: 600 }}>Claim Queue</h1>
          <button onClick={refresh}
            style={{ padding: "6px 14px", border: "1px solid #d5dbe5", borderRadius: 6, background: "white", fontSize: 12, cursor: "pointer" }}>
            Refresh
          </button>
        </div>

        {/* Filter bar */}
        <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
          <input
            placeholder="Search claim # or model..."
            value={filters.search}
            onChange={e => setFilters(f => ({ ...f, search: e.target.value }))}
            style={{ padding: "6px 10px", fontSize: 12, border: "1px solid #d5dbe5", borderRadius: 6, minWidth: 200 }}
          />
          <select value={filters.type} onChange={e => setFilters(f => ({ ...f, type: e.target.value }))}
            style={{ padding: "6px 10px", fontSize: 12, border: "1px solid #d5dbe5", borderRadius: 6 }}>
            <option value="">All types</option>
            <option value="warranty">Warranty</option>
            <option value="extended_warranty">Extended Warranty</option>
            <option value="pdi">PDI</option>
            <option value="daf">DAF</option>
            <option value="insurance">Insurance</option>
          </select>
          <select value={filters.manufacturer} onChange={e => setFilters(f => ({ ...f, manufacturer: e.target.value }))}
            style={{ padding: "6px 10px", fontSize: 12, border: "1px solid #d5dbe5", borderRadius: 6 }}>
            <option value="">All manufacturers</option>
            {uniqueManufacturers.map(m => <option key={m} value={m}>{m}</option>)}
          </select>
          {(filters.type || filters.manufacturer || filters.search) && (
            <button onClick={() => setFilters({ dealershipId: "", type: "", manufacturer: "", search: "" })}
              style={{ padding: "6px 10px", fontSize: 11, border: "1px solid #d5dbe5", borderRadius: 6, background: "white", cursor: "pointer", color: "#888" }}>
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Kanban board */}
      {loading ? (
        <div style={{ padding: 40, textAlign: "center", color: "#888" }}>Loading claims...</div>
      ) : (
        <div style={{ flex: 1, display: "flex", gap: 12, overflowX: "auto", overflowY: "hidden", paddingBottom: 8 }}>
          {columns.map(col => (
            <div key={col.key} style={{ minWidth: 260, width: 280, flexShrink: 0, display: "flex", flexDirection: "column", maxHeight: "100%" }}>
              {/* Column header */}
              <div style={{ padding: "8px 12px", display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 8, flexShrink: 0 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
                  <span style={{ width: 8, height: 8, borderRadius: 4, background: col.color, display: "inline-block" }} />
                  <span style={{ fontSize: 12, fontWeight: 600, color: "#222" }}>{col.label}</span>
                </div>
                <span style={{ fontSize: 11, color: "#888", background: "#f0f2f5", padding: "2px 8px", borderRadius: 10 }}>
                  {col.claims.length}
                </span>
              </div>

              {/* Cards */}
              <div style={{ flex: 1, overflowY: "auto", display: "flex", flexDirection: "column", gap: 8 }}>
                {col.claims.length === 0 ? (
                  <div style={{ padding: 20, textAlign: "center", color: "#ccc", fontSize: 11, background: "#fafbfd", borderRadius: 6, border: "1px dashed #e5eaf2" }}>
                    No claims
                  </div>
                ) : col.claims.map(c => (
                  <div key={c.id} onClick={() => openClaim(c.id)}
                    style={{
                      padding: 12, background: "white", borderRadius: 8,
                      border: selectedClaimId === c.id ? "2px solid #033280" : "1px solid #e5eaf2",
                      cursor: "pointer", boxShadow: "0 1px 3px rgba(0,0,0,0.05)",
                    }}
                    onMouseEnter={e => { if (selectedClaimId !== c.id) e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.1)"; }}
                    onMouseLeave={e => { if (selectedClaimId !== c.id) e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.05)"; }}>
                    <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 6 }}>
                      <span style={{ fontWeight: 700, fontSize: 12, color: "#033280" }}>{c.claimNumber}</span>
                      <span style={{
                        fontSize: 9, padding: "2px 6px",
                        background: TYPE_BADGE[c.type] || "#888",
                        color: "white", borderRadius: 4, fontWeight: 600, textTransform: "uppercase",
                      }}>{c.type?.replace(/_/g, " ")}</span>
                    </div>
                    {(c.unitYear || c.unitMake || c.unitModel) && (
                      <div style={{ fontSize: 11, color: "#444", marginBottom: 3 }}>
                        {[c.unitYear, c.unitMake, c.unitModel].filter(Boolean).join(" ")}
                      </div>
                    )}
                    <div style={{ fontSize: 10, color: "#888" }}>{c.dealershipName || c.manufacturer || "—"}</div>
                    {c.submittedAt && (
                      <div style={{ fontSize: 9, color: "#aaa", marginTop: 6 }}>
                        {timeAgo(new Date(c.submittedAt))}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Claim detail slide-in panel */}
      {selectedClaimId && (
        <div style={{
          position: "fixed", top: 0, right: 0, bottom: 0, width: 700,
          background: "white", boxShadow: "-4px 0 24px rgba(0,0,0,0.12)",
          overflowY: "auto", zIndex: 500, padding: 24,
        }}>
          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 16 }}>
            <div>
              {detailLoading ? (
                <div style={{ color: "#888", fontSize: 14 }}>Loading...</div>
              ) : claimDetail ? (
                <>
                  <h2 style={{ margin: 0, fontSize: 18 }}>Claim {claimDetail.claim?.claimNumber}</h2>
                  <div style={{ fontSize: 12, color: "#666", marginTop: 4 }}>
                    Status: <strong>{claimDetail.claim?.status?.replace(/_/g, " ")}</strong> · Type: {claimDetail.claim?.type}
                  </div>
                </>
              ) : null}
            </div>
            <button onClick={() => { setSelectedClaimId(null); setClaimDetail(null); }}
              style={{ background: "none", border: 0, fontSize: 24, cursor: "pointer", color: "#666", lineHeight: 1 }}>×</button>
          </div>

          {claimDetail && !detailLoading && (
            <>
              {/* Action buttons */}
              <div style={{ display: "flex", gap: 8, marginBottom: 20, flexWrap: "wrap" }}>
                {claimDetail.claim?.status === "new_unassigned" && (
                  <ActionBtn label="Assign to me" color="#033280" onClick={() => performAction("assign")} />
                )}
                {["assigned", "in_review"].includes(claimDetail.claim?.status) && (
                  <>
                    <ActionBtn label="Request more info" color="#9b59b6"
                      onClick={() => {
                        const msg = prompt("Message to dealer:");
                        if (msg !== null) performAction("request-info", { message: msg });
                      }} />
                    <ActionBtn label="Approve" color="#16a34a" onClick={() => {
                      const amount = prompt("Approved amount ($):");
                      performAction("approve", { approvedAmount: amount || undefined });
                    }} />
                    <ActionBtn label="Deny" color="#c0392b" onClick={() => {
                      const reason = prompt("Reason for denial:");
                      if (reason !== null) performAction("deny", { reason });
                    }} />
                    <ActionBtn label="Move to In Review" color="#f48120"
                      onClick={() => performAction("transition", { toStatus: "in_review" })} />
                    <ActionBtn label="Submit to Mfr" color="#6366f1"
                      onClick={() => {
                        const mfrNum = prompt("Manufacturer claim #:");
                        performAction("transition", { toStatus: "submitted_to_mfr", mfrClaimNumber: mfrNum || undefined });
                      }} />
                  </>
                )}
                {claimDetail.claim?.status === "submitted_to_mfr" && (
                  <>
                    <ActionBtn label="Approve" color="#16a34a" onClick={() => {
                      const amount = prompt("Approved amount ($):");
                      performAction("approve", { approvedAmount: amount || undefined });
                    }} />
                    <ActionBtn label="Deny" color="#c0392b" onClick={() => {
                      const reason = prompt("Reason for denial:");
                      if (reason !== null) performAction("deny", { reason });
                    }} />
                  </>
                )}
              </div>

              {/* Dealer notes */}
              {claimDetail.claim?.dealerNotes && (
                <div style={{ padding: 14, background: "#f7f9fc", borderRadius: 8, marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 6 }}>DEALER NOTES</div>
                  <div style={{ fontSize: 13, color: "#222", lineHeight: 1.5 }}>{claimDetail.claim.dealerNotes}</div>
                </div>
              )}

              {/* Claim photos */}
              {claimDetail.claimPhotos && claimDetail.claimPhotos.length > 0 && (
                <div style={{ marginBottom: 16 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 8 }}>
                    SUBMITTED PHOTOS ({claimDetail.claimPhotos.length})
                  </div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(100px, 1fr))", gap: 8 }}>
                    {claimDetail.claimPhotos.map((p: any) => (
                      <a key={p.id} href={p.url || p.publicUrl} target="_blank" rel="noreferrer">
                        <img src={p.url || p.publicUrl} alt=""
                          style={{ width: "100%", height: 90, objectFit: "cover", borderRadius: 6, border: "1px solid #e5eaf2" }} />
                      </a>
                    ))}
                  </div>
                </div>
              )}

              {/* Full unit file */}
              {claimDetail.unit && (
                <div style={{ borderTop: "1px solid #e5eaf2", paddingTop: 16 }}>
                  <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 12 }}>UNIT FILE</div>

                  <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12, marginBottom: 16 }}>
                    <InfoRow label="VIN" value={claimDetail.unit.vin} mono />
                    <InfoRow label="Year" value={claimDetail.unit.year} />
                    <InfoRow label="Make / Manufacturer" value={claimDetail.unit.manufacturer || claimDetail.unit.make} />
                    <InfoRow label="Model" value={claimDetail.unit.model} />
                    <InfoRow label="Stock #" value={claimDetail.unit.stockNumber} />
                    <InfoRow label="Status" value={claimDetail.unit.status?.replace(/_/g, " ")} />
                    <InfoRow label="Mfr Warranty End" value={claimDetail.unit.warrantyEnd || claimDetail.unit.manufacturerWarrantyEnd} />
                    <InfoRow label="Extended Warranty Plan" value={claimDetail.unit.extendedWarrantyPlan} />
                    <InfoRow label="Ext. Warranty End" value={claimDetail.unit.extWarrantyEnd || claimDetail.unit.extendedWarrantyEnd} />
                  </div>

                  {/* Customer */}
                  {claimDetail.customer && (
                    <div style={{ padding: 12, background: "#f7f9fc", borderRadius: 6, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 6 }}>CUSTOMER</div>
                      <div style={{ fontSize: 13 }}>{claimDetail.customer.firstName} {claimDetail.customer.lastName}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>
                        {claimDetail.customer.email}
                        {claimDetail.customer.phone && ` · ${claimDetail.customer.phone}`}
                      </div>
                    </div>
                  )}

                  {/* Dealership */}
                  {claimDetail.dealership && (
                    <div style={{ padding: 12, background: "#f7f9fc", borderRadius: 6, marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 6 }}>DEALERSHIP</div>
                      <div style={{ fontSize: 13 }}>{claimDetail.dealership.name}</div>
                      <div style={{ fontSize: 11, color: "#666" }}>{claimDetail.dealership.email}</div>
                    </div>
                  )}

                  {/* Claim history on this unit */}
                  {claimDetail.unitClaims && claimDetail.unitClaims.length > 1 && (
                    <div style={{ marginBottom: 16 }}>
                      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 8 }}>
                        CLAIM HISTORY ON THIS UNIT ({claimDetail.unitClaims.length} total)
                      </div>
                      {claimDetail.unitClaims
                        .filter((c: any) => c.id !== claimDetail.claim.id)
                        .map((c: any) => (
                          <div key={c.id} style={{ padding: "8px 0", borderBottom: "1px solid #f0f2f5", fontSize: 12 }}>
                            <span style={{ fontWeight: 600 }}>{c.claimNumber}</span>
                            <span style={{ marginLeft: 8, color: "#666" }}>{c.type} · {c.status?.replace(/_/g, " ")}</span>
                            <span style={{ marginLeft: 8, color: "#888", fontSize: 10 }}>
                              {c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : ""}
                            </span>
                          </div>
                        ))}
                    </div>
                  )}

                  {/* Unit photos */}
                  {claimDetail.unitPhotos && claimDetail.unitPhotos.length > 0 && (
                    <div>
                      <div style={{ fontSize: 11, color: "#888", fontWeight: 600, marginBottom: 8 }}>
                        UNIT PHOTOS ({claimDetail.unitPhotos.length})
                      </div>
                      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(80px, 1fr))", gap: 6 }}>
                        {claimDetail.unitPhotos.slice(0, 8).map((p: any) => (
                          <img key={p.id} src={p.url || p.publicUrl} alt=""
                            style={{ width: "100%", height: 70, objectFit: "cover", borderRadius: 4, border: "1px solid #e5eaf2" }} />
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </div>
      )}
    </div>
  );
}

function ActionBtn({ label, color, onClick }: { label: string; color: string; onClick: () => void }) {
  return (
    <button onClick={onClick}
      style={{ padding: "7px 14px", background: color, color: "white", border: 0, borderRadius: 6, fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
      {label}
    </button>
  );
}

function InfoRow({ label, value, mono }: { label: string; value?: string | number | null; mono?: boolean }) {
  return (
    <div>
      <div style={{ fontSize: 10, color: "#888", textTransform: "uppercase", fontWeight: 600 }}>{label}</div>
      <div style={{ fontSize: 13, fontFamily: mono ? "monospace" : "inherit", marginTop: 2 }}>{value ?? "—"}</div>
    </div>
  );
}
