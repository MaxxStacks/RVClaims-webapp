import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";
import { useLocation } from "wouter";
import { LAYOUT } from "@/components/layout/tokens";

interface Props {
  activeId?: string;
}

export default function DealersContextSidebar({ activeId }: Props) {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [dealers, setDealers] = useState<any[]>([]);
  const [filter, setFilter] = useState({ search: "", reviewStatus: "" });

  useEffect(() => {
    const p = new URLSearchParams();
    if (filter.reviewStatus) p.set("reviewStatus", filter.reviewStatus);
    if (filter.search) p.set("search", filter.search);
    apiFetch<any[]>(`/api/v6/dealerships?${p.toString()}`).then(setDealers).catch(() => {});
  }, [filter.reviewStatus, filter.search]);

  return (
    <>
      <div style={{ padding: 16, borderBottom: `1px solid ${LAYOUT.borderLighter}` }}>
        <button
          onClick={() => navigate("/operator-v6/dealerships/new")}
          style={{ background: "none", border: 0, color: LAYOUT.navy, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 12, fontWeight: 600 }}
        >
          + New Dealership
        </button>
        <div style={{ fontSize: LAYOUT.sidebarSectionLabelSize, color: LAYOUT.textLabel, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>
          Dealerships
        </div>
        <input
          placeholder="Search by name..."
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
          style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #d5dbe5", borderRadius: 4, marginBottom: 6, boxSizing: "border-box" }}
        />
        <select
          value={filter.reviewStatus}
          onChange={e => setFilter({ ...filter, reviewStatus: e.target.value })}
          style={{ width: "100%", padding: "6px 8px", fontSize: 11, border: "1px solid #d5dbe5", borderRadius: 4 }}
        >
          <option value="">All statuses</option>
          <option value="active">Active</option>
          <option value="pending_review">Pending Review</option>
          <option value="suspended">Suspended</option>
          <option value="rejected">Rejected</option>
        </select>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {dealers.length === 0 ? (
          <div style={{ padding: 16, fontSize: 11, color: LAYOUT.textMuted, textAlign: "center" }}>No dealers</div>
        ) : dealers.map((d: any) => {
          const isActive = d.id === activeId;
          return (
            <div
              key={d.id}
              onClick={() => navigate(`/operator-v6/dealerships/${d.id}`)}
              style={{
                padding: `${LAYOUT.sidebarItemPaddingY}px ${LAYOUT.sidebarItemPaddingX}px`,
                cursor: "pointer",
                background: isActive ? LAYOUT.navyLight : "transparent",
                borderLeft: isActive ? `3px solid ${LAYOUT.navy}` : "3px solid transparent",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = LAYOUT.bgPage; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ fontSize: LAYOUT.sidebarItemFontSize, fontWeight: 600, color: isActive ? LAYOUT.navy : LAYOUT.textPrimary }}>
                {d.name}
              </div>
              <div style={{ fontSize: LAYOUT.sidebarItemMutedSize, color: LAYOUT.textMuted, marginTop: 2 }}>{d.email}</div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 9, padding: "1px 5px", background: LAYOUT.statusMutedBg, color: LAYOUT.statusMutedText, borderRadius: 3 }}>
                  {d.brandingTier || "base"}
                </span>
                <span style={{
                  fontSize: 9, padding: "1px 5px", borderRadius: 3,
                  background: d.reviewStatus === "active" ? LAYOUT.statusActiveBg
                    : d.reviewStatus === "pending_review" ? LAYOUT.statusPendingBg
                    : d.reviewStatus === "suspended" ? LAYOUT.statusExpiredBg
                    : LAYOUT.statusMutedBg,
                  color: d.reviewStatus === "active" ? LAYOUT.statusActiveText
                    : d.reviewStatus === "pending_review" ? LAYOUT.statusPendingText
                    : d.reviewStatus === "suspended" ? LAYOUT.statusExpiredText
                    : LAYOUT.statusMutedText,
                }}>
                  {(d.reviewStatus || "active").replace("_", " ")}
                </span>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
