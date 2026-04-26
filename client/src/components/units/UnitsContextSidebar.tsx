import { useEffect, useState } from "react";
import { useApiFetch } from "@/lib/api";
import { useLocation } from "wouter";
import { LAYOUT } from "@/components/layout/tokens";

interface Props {
  context: "operator" | "dealer";
  activeId?: string;
}

export default function UnitsContextSidebar({ context, activeId }: Props) {
  const apiFetch = useApiFetch();
  const [, navigate] = useLocation();
  const [units, setUnits] = useState<any[]>([]);
  const [filter, setFilter] = useState({ search: "", status: "" });

  useEffect(() => {
    const p = new URLSearchParams();
    if (filter.status) p.set("status", filter.status);
    if (filter.search) p.set("search", filter.search);
    apiFetch<any[]>(`/api/v6/units?${p.toString()}`).then(setUnits).catch(() => {});
  }, [filter.status, filter.search]);

  return (
    <>
      <div style={{ padding: 16, borderBottom: `1px solid ${LAYOUT.borderLighter}` }}>
        <button
          onClick={() => navigate(`/${context}-v6/units/new`)}
          style={{ background: "none", border: 0, color: LAYOUT.navy, fontSize: 12, cursor: "pointer", padding: 0, marginBottom: 12, fontWeight: 600 }}
        >
          + New Unit
        </button>
        <div style={{ fontSize: LAYOUT.sidebarSectionLabelSize, color: LAYOUT.textLabel, textTransform: "uppercase", fontWeight: 600, marginBottom: 8 }}>
          Units
        </div>
        <input
          placeholder="Search VIN, make..."
          value={filter.search}
          onChange={e => setFilter({ ...filter, search: e.target.value })}
          style={{ width: "100%", padding: "6px 8px", fontSize: 12, border: "1px solid #e0e0e0", borderRadius: 6, marginBottom: 6, boxSizing: "border-box" }}
        />
        <select
          value={filter.status}
          onChange={e => setFilter({ ...filter, status: e.target.value })}
          style={{ width: "100%", padding: "6px 8px", fontSize: 11, border: "1px solid #e0e0e0", borderRadius: 6 }}
        >
          <option value="">All statuses</option>
          <option value="in_inventory">In Stock</option>
          <option value="sold">Sold</option>
          <option value="in_service">In Service</option>
          <option value="consigned">Consigned</option>
        </select>
      </div>
      <div style={{ flex: 1, overflowY: "auto", padding: "8px 0" }}>
        {units.length === 0 ? (
          <div style={{ padding: 16, fontSize: 11, color: LAYOUT.textMuted, textAlign: "center" }}>No units</div>
        ) : units.map((u: any) => {
          const isActive = u.id === activeId;
          return (
            <div
              key={u.id}
              onClick={() => navigate(`/${context}-v6/units/${u.id}`)}
              style={{
                padding: `${LAYOUT.sidebarItemPaddingY}px ${LAYOUT.sidebarItemPaddingX}px`,
                cursor: "pointer",
                background: isActive ? LAYOUT.navyLight : "transparent",
              }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = LAYOUT.bgPage; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}
            >
              <div style={{ fontSize: LAYOUT.sidebarItemFontSize, fontWeight: 600, color: isActive ? LAYOUT.navy : LAYOUT.textPrimary }}>
                {u.year} {u.make || u.manufacturer}
              </div>
              <div style={{ fontSize: LAYOUT.sidebarItemMutedSize, color: LAYOUT.textMuted, fontFamily: "monospace", marginTop: 2 }}>
                {u.vin?.slice(-8)}
              </div>
              <div style={{ display: "flex", gap: 4, marginTop: 4 }}>
                <span style={{ fontSize: 9, padding: "1px 5px", background: LAYOUT.statusMutedBg, color: LAYOUT.statusMutedText, borderRadius: 3 }}>
                  {u.status?.replace(/_/g, " ")}
                </span>
                {u.mfrWarrantyStatus === "active" && <span style={{ fontSize: 9, padding: "1px 5px", background: LAYOUT.statusActiveBg, color: LAYOUT.statusActiveText, borderRadius: 3 }}>● W</span>}
                {u.mfrWarrantyStatus === "expiring" && <span style={{ fontSize: 9, padding: "1px 5px", background: LAYOUT.statusPendingBg, color: LAYOUT.statusPendingText, borderRadius: 3 }}>● W</span>}
                {u.mfrWarrantyStatus === "expired" && <span style={{ fontSize: 9, padding: "1px 5px", background: LAYOUT.statusExpiredBg, color: LAYOUT.statusExpiredText, borderRadius: 3 }}>● W</span>}
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
