// DispatchBoard — Technician dispatch scheduler
// Drag-to-assign: canDrag prop (dealer_owner, shop_manager only).
// Notes: canEditNotes prop controls write access; all roles can read notes.
import React, { useState } from "react";

const TECHS = [
  { id: "mike",   name: "Mike T.",   specialty: "Electrical / Slides" },
  { id: "jason",  name: "Jason R.",  specialty: "Warranty Repair" },
  { id: "carlos", name: "Carlos P.", specialty: "PDI / Inspections" },
];

const HOURS = [
  "8:00 AM","9:00 AM","10:00 AM","11:00 AM",
  "12:00 PM","1:00 PM","2:00 PM","3:00 PM","4:00 PM","5:00 PM",
];

type Priority = "urgent" | "normal" | "low";

const PRI: Record<Priority, { label: string; bg: string; border: string; dot: string }> = {
  urgent: { label: "URGENT", bg: "#fef2f2", border: "#fca5a5", dot: "#ef4444" },
  normal: { label: "NORMAL", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b" },
  low:    { label: "LOW",    bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e" },
};

interface WO {
  id: string;
  unit: string;
  desc: string;
  priority: Priority;
  techId: string | null;
  hour: number;
  span: number;
  allocatedHours: number;
  notes: string;
}

const SEED: WO[] = [
  { id:"WO-0041", unit:"2024 Jayco Jay Flight",   desc:"Slide-out seal replacement", priority:"urgent", techId:"mike",   hour:0, span:2, allocatedHours:2,   notes:"" },
  { id:"WO-0039", unit:"2024 FR Rockwood",         desc:"PDI inspection",             priority:"normal", techId:"jason",  hour:0, span:1, allocatedHours:1,   notes:"" },
  { id:"WO-0040", unit:"2023 Heartland Bighorn",   desc:"AC unit diagnosis",          priority:"normal", techId:"jason",  hour:2, span:1, allocatedHours:1.5, notes:"Check refrigerant first. Recharge kit in parts bin B-12 if needed." },
  { id:"WO-0038", unit:"2022 Keystone Montana",    desc:"Window latch repair",        priority:"low",    techId:"carlos", hour:1, span:1, allocatedHours:0.5, notes:"" },
  { id:"WO-0045", unit:"2024 Jayco Eagle HT",      desc:"Roof vent leak",             priority:"urgent", techId:null,     hour:0, span:1, allocatedHours:1,   notes:"Dicor sealant in cabinet B. Take before/after photos for warranty claim." },
  { id:"WO-0046", unit:"2023 FR Wildwood",         desc:"Refrigerator not cooling",   priority:"normal", techId:null,     hour:0, span:1, allocatedHours:2,   notes:"" },
  { id:"WO-0047", unit:"2022 Coachmen Apex",       desc:"Electrical short — slides",  priority:"urgent", techId:null,     hour:0, span:2, allocatedHours:2.5, notes:"Parts on order — ETA tomorrow. Do NOT start without parts in hand." },
];

interface DispatchBoardProps {
  canDrag?: boolean;
  canEditNotes?: boolean;
}

function fmtHrs(h: number): string {
  if (h === 0.5) return "30 min";
  if (h === 1) return "1 hr";
  return `${h} hrs`;
}

export default function DispatchBoard({ canDrag = false, canEditNotes = false }: DispatchBoardProps) {
  const [wos, setWos] = useState<WO[]>(SEED);
  const [selected, setSelected] = useState<string | null>(null);
  const [dragWoId, setDragWoId] = useState<string | null>(null);
  const [dragOver, setDragOver] = useState<{ techId: string; hour: number } | null>(null);
  const [editingNote, setEditingNote] = useState<string | null>(null);

  const unassigned = wos.filter(w => !w.techId);
  const assigned   = wos.filter(w =>  w.techId);

  function getWoAt(techId: string, hour: number): WO | null {
    return assigned.find(w => w.techId === techId && hour >= w.hour && hour < w.hour + w.span) || null;
  }

  function isBlockStart(w: WO, hour: number) { return w.hour === hour; }

  function moveWo(woId: string, techId: string, hour: number) {
    const wo = wos.find(w => w.id === woId);
    if (!wo) return;
    if (hour + wo.span > HOURS.length) return;
    const blocked = wos.find(w => w.id !== woId && w.techId === techId && hour >= w.hour && hour < w.hour + w.span);
    if (blocked) return;
    setWos(prev => prev.map(w => w.id === woId ? { ...w, techId, hour } : w));
  }

  function assignWo(techId: string, hour: number) {
    if (!selected) return;
    const wo = wos.find(w => w.id === selected);
    if (!wo) return;
    if (hour + wo.span > HOURS.length) return;
    const blocked = wos.find(w => w.id !== selected && w.techId === techId && hour >= w.hour && hour < w.hour + w.span);
    if (blocked) return;
    setWos(prev => prev.map(w => w.id === selected ? { ...w, techId, hour } : w));
    setSelected(null);
  }

  function unassignWo(woId: string) {
    setWos(prev => prev.map(w => w.id === woId ? { ...w, techId: null } : w));
  }

  function updateNote(woId: string, note: string) {
    setWos(prev => prev.map(w => w.id === woId ? { ...w, notes: note } : w));
  }

  function handleDragStart(e: React.DragEvent<HTMLDivElement>, woId: string) {
    setDragWoId(woId);
    e.dataTransfer.effectAllowed = "move";
  }

  function handleDragEnd() {
    setDragWoId(null);
    setDragOver(null);
  }

  function handleCellDragOver(e: React.DragEvent<HTMLDivElement>, techId: string, hour: number) {
    e.preventDefault();
    e.dataTransfer.dropEffect = "move";
    if (!dragOver || dragOver.techId !== techId || dragOver.hour !== hour) {
      setDragOver({ techId, hour });
    }
  }

  function handleCellDrop(e: React.DragEvent<HTMLDivElement>, techId: string, hour: number) {
    e.preventDefault();
    if (dragWoId) moveWo(dragWoId, techId, hour);
    setDragWoId(null);
    setDragOver(null);
  }

  function handleQueueDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    if (dragWoId) unassignWo(dragWoId);
    setDragWoId(null);
    setDragOver(null);
  }

  const isDropTarget = (techId: string, hour: number) =>
    dragOver?.techId === techId && dragOver?.hour === hour;

  // ── Note widget (reused in queue and grid) ─────────────────────────────────
  function NoteWidget({ wo, compact }: { wo: WO; compact?: boolean }) {
    const hasNote = !!wo.notes;
    if (!hasNote && !canEditNotes) return null;

    const fontSize = compact ? 10 : 11;
    const minH = compact ? 40 : 52;

    return (
      <div onClick={(e) => e.stopPropagation()}>
        {editingNote === wo.id ? (
          <div style={{ marginTop: 5 }}>
            <textarea
              value={wo.notes}
              onChange={(e) => updateNote(wo.id, e.target.value)}
              placeholder="Parts required, storage location, special instructions…"
              autoFocus
              style={{
                width: "100%", fontSize, borderRadius: 4,
                border: "1px solid #d1d5db", padding: "5px 7px",
                resize: "vertical", minHeight: minH, fontFamily: "inherit",
                background: "white", color: "#333", boxSizing: "border-box" as const,
              }}
            />
            <button
              onClick={() => setEditingNote(null)}
              style={{ marginTop: 3, fontSize: 10, color: "#6366f1", background: "none", border: "none", cursor: "pointer", padding: 0, fontWeight: 600 }}
            >Done</button>
          </div>
        ) : (
          <div style={{ display: "flex", alignItems: "flex-start", gap: 4, marginTop: 5 }}>
            {hasNote && (
              <div style={{
                flex: 1, fontSize: fontSize - 1, color: "#444", lineHeight: 1.4,
                background: "#f1f5f9", borderRadius: 4, padding: "4px 6px",
                borderLeft: "2px solid #94a3b8",
              }}>{wo.notes}</div>
            )}
            {canEditNotes && (
              <button
                onClick={() => setEditingNote(wo.id)}
                title={hasNote ? "Edit note" : "Add note"}
                style={{
                  fontSize: 10, color: "#94a3b8", background: "none", border: "none",
                  cursor: "pointer", padding: 0, flexShrink: 0, marginTop: 1,
                  display: "flex", alignItems: "center", gap: 3,
                }}
              >
                <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 00-2 2v14a2 2 0 002 2h14a2 2 0 002-2v-7"/>
                  <path d="M18.5 2.5a2.121 2.121 0 013 3L12 15l-4 1 1-4 9.5-9.5z"/>
                </svg>
                {!hasNote && <span style={{ fontSize: 9 }}>Note</span>}
              </button>
            )}
          </div>
        )}
      </div>
    );
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header */}
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
        <div style={{ display: "flex", gap: 8 }}>
          <button className="btn btn-o btn-sm">← Prev Week</button>
          <button className="btn btn-p btn-sm">Today</button>
          <button className="btn btn-o btn-sm">Next Week →</button>
        </div>
        <div style={{ fontSize: 13, color: "#555", fontWeight: 500 }}>
          Week of Apr 28, 2026 &nbsp;·&nbsp; {TECHS.length} technicians &nbsp;·&nbsp; {wos.length} work orders
        </div>
      </div>

      {selected && (
        <div style={{ marginBottom: 12, padding: "10px 16px", background: "#eff6ff", border: "1px solid #93c5fd", borderRadius: 8, fontSize: 13, color: "#1e40af", display: "flex", alignItems: "center", justifyContent: "space-between" }}>
          <span><strong>{selected}</strong> selected — click an open slot to assign</span>
          <button className="btn btn-o btn-sm" onClick={() => setSelected(null)}>Cancel</button>
        </div>
      )}

      <div style={{ display: "flex", gap: 16, alignItems: "flex-start" }}>

        {/* ── Queue panel ── */}
        <div
          style={{ width: 236, flexShrink: 0 }}
          onDragOver={canDrag ? (e) => { e.preventDefault(); e.dataTransfer.dropEffect = "move"; } : undefined}
          onDrop={canDrag ? handleQueueDrop : undefined}
        >
          <div className="pn">
            <div className="pn-h" style={{ background: "#f8fafc" }}>
              <span className="pn-t">Unassigned</span>
              <span style={{ fontSize: 11, background: "#ef4444", color: "#fff", borderRadius: 10, padding: "1px 7px", fontWeight: 600 }}>{unassigned.length}</span>
            </div>
            {unassigned.length === 0 && (
              <div style={{ padding: "24px 16px", textAlign: "center", color: "#aaa", fontSize: 13 }}>All caught up!</div>
            )}
            {unassigned.map(w => {
              const p = PRI[w.priority];
              const isActive = selected === w.id;
              const isDragging = dragWoId === w.id;
              return (
                <div
                  key={w.id}
                  draggable={canDrag}
                  onDragStart={canDrag ? (e) => handleDragStart(e, w.id) : undefined}
                  onDragEnd={canDrag ? handleDragEnd : undefined}
                  onClick={() => setSelected(isActive ? null : w.id)}
                  style={{
                    margin: "8px 12px", padding: "10px 12px",
                    background: isActive ? "#eff6ff" : p.bg,
                    border: `1.5px solid ${isActive ? "#2563eb" : p.border}`,
                    borderRadius: 8,
                    cursor: canDrag ? "grab" : "pointer",
                    boxShadow: isActive ? "0 0 0 2px #93c5fd" : "none",
                    opacity: isDragging ? 0.4 : 1,
                    transition: "all 0.15s",
                  }}
                >
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 4 }}>
                    <span style={{ fontSize: 12, fontWeight: 700, color: "#08235d" }}>{w.id}</span>
                    <span style={{ fontSize: 10, fontWeight: 700, color: p.dot, background: p.bg, border: `1px solid ${p.border}`, borderRadius: 4, padding: "1px 5px" }}>{p.label}</span>
                  </div>
                  <div style={{ fontSize: 12, color: "#333", marginBottom: 2 }}>{w.unit}</div>
                  <div style={{ fontSize: 11, color: "#888", marginBottom: 5 }}>{w.desc}</div>
                  <div style={{ display: "flex", alignItems: "center", gap: 4, fontSize: 11, color: "#6366f1", fontWeight: 600 }}>
                    <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                      <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                    </svg>
                    {fmtHrs(w.allocatedHours)}
                  </div>
                  <NoteWidget wo={w} />
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Dispatch grid ── */}
        <div style={{ flex: 1, overflowX: "auto" }}>
          <div className="pn" style={{ padding: 0, overflow: "hidden" }}>
            {/* Tech header */}
            <div style={{
              display: "grid",
              gridTemplateColumns: `64px repeat(${TECHS.length}, 1fr)`,
              background: "#f8fafc",
              borderBottom: "1px solid #e8e8e8",
            }}>
              <div style={{ padding: "10px 8px", fontSize: 11, color: "#888", fontWeight: 600, borderRight: "1px solid #e8e8e8" }}>TIME</div>
              {TECHS.map(t => (
                <div key={t.id} style={{ padding: "8px 12px", borderRight: "1px solid #e8e8e8" }}>
                  <div style={{ fontSize: 13, fontWeight: 700, color: "#08235d" }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: "#888" }}>{t.specialty}</div>
                </div>
              ))}
            </div>

            {/* Hour rows */}
            {HOURS.map((hour, hi) => (
              <div
                key={hour}
                style={{
                  display: "grid",
                  gridTemplateColumns: `64px repeat(${TECHS.length}, 1fr)`,
                  borderBottom: hi < HOURS.length - 1 ? "1px solid #f0f0f0" : "none",
                  minHeight: 56,
                }}
              >
                <div style={{ padding: "8px", fontSize: 11, color: "#aaa", fontWeight: 500, borderRight: "1px solid #e8e8e8", display: "flex", alignItems: "flex-start" }}>
                  {hour}
                </div>

                {TECHS.map(t => {
                  const wo = getWoAt(t.id, hi);
                  const isStart = wo ? isBlockStart(wo, hi) : false;
                  const p = wo ? PRI[wo.priority] : null;
                  const clickable = !wo && !!selected;
                  const dropTarget = canDrag && isDropTarget(t.id, hi);

                  return (
                    <div
                      key={t.id}
                      onClick={() => clickable ? assignWo(t.id, hi) : undefined}
                      onDragOver={canDrag ? (e) => handleCellDragOver(e, t.id, hi) : undefined}
                      onDragLeave={canDrag ? () => setDragOver(null) : undefined}
                      onDrop={canDrag ? (e) => handleCellDrop(e, t.id, hi) : undefined}
                      style={{
                        padding: "4px 6px",
                        borderRight: "1px solid #f0f0f0",
                        background: dropTarget && !wo ? "#f0fdf4" : dropTarget && wo ? "#fef9c3" : clickable ? "#f0fdf4" : wo ? p!.bg : "white",
                        cursor: clickable ? "pointer" : "default",
                        transition: "background 0.1s",
                        position: "relative" as const,
                        outline: dropTarget && !wo ? "2px dashed #22c55e" : dropTarget && wo ? "2px dashed #f59e0b" : "none",
                        outlineOffset: -2,
                      }}
                    >
                      {isStart && wo && (
                        <div
                          draggable={canDrag}
                          onDragStart={canDrag ? (e) => { e.stopPropagation(); handleDragStart(e, wo.id); } : undefined}
                          onDragEnd={canDrag ? handleDragEnd : undefined}
                          style={{
                            background: p!.bg,
                            border: `1.5px solid ${p!.border}`,
                            borderRadius: 6, padding: "4px 8px",
                            cursor: canDrag ? "grab" : "default",
                            opacity: dragWoId === wo.id ? 0.45 : 1,
                          }}
                        >
                          <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 2 }}>
                            <span style={{ fontSize: 11, fontWeight: 700, color: "#08235d" }}>{wo.id}</span>
                            <span style={{ fontSize: 9, fontWeight: 700, color: p!.dot, background: "white", border: `1px solid ${p!.border}`, borderRadius: 3, padding: "0 4px" }}>{p!.label}</span>
                          </div>
                          <div style={{ fontSize: 11, color: "#555", lineHeight: 1.3, marginBottom: 3 }}>{wo.desc}</div>
                          <div style={{ display: "flex", alignItems: "center", gap: 3, fontSize: 10, color: "#6366f1", fontWeight: 600, marginBottom: 2 }}>
                            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                              <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
                            </svg>
                            {fmtHrs(wo.allocatedHours)}
                          </div>
                          <NoteWidget wo={wo} compact />
                          <button
                            onClick={e => { e.stopPropagation(); unassignWo(wo.id); }}
                            style={{ marginTop: 5, fontSize: 9, color: "#888", background: "none", border: "none", cursor: "pointer", padding: 0 }}
                          >↩ unassign</button>
                        </div>
                      )}
                      {!wo && (clickable || dropTarget) && (
                        <div style={{ height: "100%", minHeight: 44, display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <span style={{ fontSize: 11, color: "#22c55e", fontWeight: 500 }}>
                            {dropTarget ? "Drop here" : "+ Assign here"}
                          </span>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Legend */}
      <div style={{ marginTop: 12, display: "flex", gap: 12, alignItems: "center", fontSize: 12, color: "#888", flexWrap: "wrap" as const }}>
        <span style={{ fontWeight: 600 }}>Priority:</span>
        {(Object.entries(PRI) as [Priority, typeof PRI[Priority]][]).map(([k, v]) => (
          <span key={k} style={{ display: "flex", alignItems: "center", gap: 4 }}>
            <span style={{ width: 8, height: 8, borderRadius: "50%", background: v.dot, display: "inline-block" }} />
            {v.label}
          </span>
        ))}
        {canDrag
          ? <span style={{ marginLeft: 8 }}>Drag jobs to assign or reschedule. Click a queue item then click a slot to assign by keyboard.</span>
          : <span style={{ marginLeft: 8 }}>Click a WO in the queue, then click an open slot to assign.</span>
        }
      </div>
    </div>
  );
}
