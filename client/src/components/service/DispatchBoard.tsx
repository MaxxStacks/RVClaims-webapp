// DispatchBoard — Technician dispatch scheduler
// Dispatch board: unassigned queue left, tech columns right, click-to-assign
import { useState } from "react";

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

const PRI: Record<Priority, { label: string; bg: string; border: string; dot: string; text: string }> = {
  urgent: { label: "URGENT", bg: "#fef2f2", border: "#fca5a5", dot: "#ef4444", text: "#7f1d1d" },
  normal: { label: "NORMAL", bg: "#fffbeb", border: "#fde68a", dot: "#f59e0b", text: "#78350f" },
  low:    { label: "LOW",    bg: "#f0fdf4", border: "#bbf7d0", dot: "#22c55e", text: "#14532d" },
};

interface WO {
  id: string;
  unit: string;
  desc: string;
  priority: Priority;
  techId: string | null;
  hour: number;   // index in HOURS (0 = 8:00 AM)
  span: number;   // how many hour slots
}

const SEED: WO[] = [
  { id:"WO-0041", unit:"2024 Jayco Jay Flight",     desc:"Slide-out seal replacement", priority:"urgent", techId:"mike",   hour:0, span:2 },
  { id:"WO-0039", unit:"2024 FR Rockwood",           desc:"PDI inspection",             priority:"normal", techId:"jason",  hour:0, span:1 },
  { id:"WO-0040", unit:"2023 Heartland Bighorn",     desc:"AC unit diagnosis",          priority:"normal", techId:"jason",  hour:2, span:1 },
  { id:"WO-0038", unit:"2022 Keystone Montana",      desc:"Window latch repair",        priority:"low",    techId:"carlos", hour:1, span:1 },
  { id:"WO-0045", unit:"2024 Jayco Eagle HT",        desc:"Roof vent leak",             priority:"urgent", techId:null,     hour:0, span:1 },
  { id:"WO-0046", unit:"2023 FR Wildwood",           desc:"Refrigerator not cooling",   priority:"normal", techId:null,     hour:0, span:1 },
  { id:"WO-0047", unit:"2022 Coachmen Apex",         desc:"Electrical short — slides",  priority:"urgent", techId:null,     hour:0, span:2 },
];

export default function DispatchBoard() {
  const [wos, setWos] = useState<WO[]>(SEED);
  const [selected, setSelected] = useState<string | null>(null); // selected WO id from queue

  const unassigned = wos.filter(w => !w.techId);
  const assigned   = wos.filter(w =>  w.techId);

  // Returns the WO assigned to a tech at a given hour slot (or null)
  function getWoAt(techId: string, hour: number): WO | null {
    return assigned.find(w => w.techId === techId && hour >= w.hour && hour < w.hour + w.span) || null;
  }

  // True if this is the "first" slot of a multi-hour WO (i.e. we should render the block)
  function isBlockStart(w: WO, hour: number) { return w.hour === hour; }

  function assignWo(techId: string, hour: number) {
    if (!selected) return;
    const already = getWoAt(techId, hour);
    if (already) return; // slot occupied
    setWos(prev => prev.map(w => w.id === selected ? { ...w, techId, hour } : w));
    setSelected(null);
  }

  function unassignWo(woId: string) {
    setWos(prev => prev.map(w => w.id === woId ? { ...w, techId: null } : w));
  }

  return (
    <div style={{ fontFamily: "Inter, system-ui, sans-serif" }}>

      {/* Header bar */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:16 }}>
        <div style={{ display:"flex", gap:8 }}>
          <button className="btn btn-o btn-sm">← Prev Week</button>
          <button className="btn btn-p btn-sm">Today</button>
          <button className="btn btn-o btn-sm">Next Week →</button>
        </div>
        <div style={{ fontSize:13, color:"#555", fontWeight:500 }}>
          Week of Apr 28, 2026 &nbsp;·&nbsp; {TECHS.length} technicians &nbsp;·&nbsp; {wos.length} work orders
        </div>
      </div>

      {selected && (
        <div style={{ marginBottom:12, padding:"10px 16px", background:"#eff6ff", border:"1px solid #93c5fd", borderRadius:8, fontSize:13, color:"#1e40af", display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <span><strong>{selected}</strong> selected — click an open slot to assign</span>
          <button className="btn btn-o btn-sm" onClick={() => setSelected(null)}>Cancel</button>
        </div>
      )}

      <div style={{ display:"flex", gap:16, alignItems:"flex-start" }}>

        {/* ── Queue panel ── */}
        <div style={{ width:220, flexShrink:0 }}>
          <div className="pn">
            <div className="pn-h" style={{ background:"#f8fafc" }}>
              <span className="pn-t">Unassigned</span>
              <span style={{ fontSize:11, background:"#ef4444", color:"#fff", borderRadius:10, padding:"1px 7px", fontWeight:600 }}>{unassigned.length}</span>
            </div>
            {unassigned.length === 0 && (
              <div style={{ padding:"24px 16px", textAlign:"center", color:"#aaa", fontSize:13 }}>All caught up!</div>
            )}
            {unassigned.map(w => {
              const p = PRI[w.priority];
              const isActive = selected === w.id;
              return (
                <div
                  key={w.id}
                  onClick={() => setSelected(isActive ? null : w.id)}
                  style={{
                    margin:"8px 12px", padding:"10px 12px",
                    background: isActive ? "#eff6ff" : p.bg,
                    border: `1.5px solid ${isActive ? "#2563eb" : p.border}`,
                    borderRadius:8, cursor:"pointer",
                    boxShadow: isActive ? "0 0 0 2px #93c5fd" : "none",
                    transition:"all 0.15s",
                  }}
                >
                  <div style={{ display:"flex", justifyContent:"space-between", marginBottom:4 }}>
                    <span style={{ fontSize:12, fontWeight:700, color:"#08235d" }}>{w.id}</span>
                    <span style={{ fontSize:10, fontWeight:700, color:p.dot, background:p.bg, border:`1px solid ${p.border}`, borderRadius:4, padding:"1px 5px" }}>{p.label}</span>
                  </div>
                  <div style={{ fontSize:12, color:"#333", marginBottom:2 }}>{w.unit}</div>
                  <div style={{ fontSize:11, color:"#888" }}>{w.desc}</div>
                </div>
              );
            })}
          </div>
        </div>

        {/* ── Dispatch grid ── */}
        <div style={{ flex:1, overflowX:"auto" }}>
          <div className="pn" style={{ padding:0, overflow:"hidden" }}>
            {/* Tech header row */}
            <div style={{
              display:"grid",
              gridTemplateColumns:`64px repeat(${TECHS.length}, 1fr)`,
              background:"#f8fafc",
              borderBottom:"1px solid #e8e8e8",
            }}>
              <div style={{ padding:"10px 8px", fontSize:11, color:"#888", fontWeight:600, borderRight:"1px solid #e8e8e8" }}>TIME</div>
              {TECHS.map(t => (
                <div key={t.id} style={{ padding:"8px 12px", borderRight:"1px solid #e8e8e8" }}>
                  <div style={{ fontSize:13, fontWeight:700, color:"#08235d" }}>{t.name}</div>
                  <div style={{ fontSize:11, color:"#888" }}>{t.specialty}</div>
                </div>
              ))}
            </div>

            {/* Hour rows */}
            {HOURS.map((hour, hi) => (
              <div
                key={hour}
                style={{
                  display:"grid",
                  gridTemplateColumns:`64px repeat(${TECHS.length}, 1fr)`,
                  borderBottom: hi < HOURS.length - 1 ? "1px solid #f0f0f0" : "none",
                  minHeight:52,
                }}
              >
                {/* Time label */}
                <div style={{ padding:"8px", fontSize:11, color:"#aaa", fontWeight:500, borderRight:"1px solid #e8e8e8", display:"flex", alignItems:"flex-start" }}>
                  {hour}
                </div>

                {/* Tech cells */}
                {TECHS.map(t => {
                  const wo = getWoAt(t.id, hi);
                  const isStart = wo ? isBlockStart(wo, hi) : false;
                  const p = wo ? PRI[wo.priority] : null;
                  const clickable = !wo && !!selected;

                  return (
                    <div
                      key={t.id}
                      onClick={() => clickable ? assignWo(t.id, hi) : undefined}
                      style={{
                        padding:"4px 6px",
                        borderRight:"1px solid #f0f0f0",
                        background: clickable ? "#f0fdf4" : wo ? p!.bg : "white",
                        cursor: clickable ? "pointer" : wo ? "default" : "default",
                        transition:"background 0.1s",
                        position:"relative",
                      }}
                    >
                      {isStart && wo && (
                        <div
                          style={{
                            background: p!.bg,
                            border:`1.5px solid ${p!.border}`,
                            borderRadius:6, padding:"4px 8px",
                          }}
                        >
                          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:2 }}>
                            <span style={{ fontSize:11, fontWeight:700, color:"#08235d" }}>{wo.id}</span>
                            <span style={{ fontSize:9, fontWeight:700, color:p!.dot, background:"white", border:`1px solid ${p!.border}`, borderRadius:3, padding:"0 4px" }}>{p!.label}</span>
                          </div>
                          <div style={{ fontSize:11, color:"#555", lineHeight:1.3 }}>{wo.desc}</div>
                          <button
                            onClick={e => { e.stopPropagation(); unassignWo(wo.id); }}
                            style={{ marginTop:4, fontSize:9, color:"#888", background:"none", border:"none", cursor:"pointer", padding:0 }}
                          >↩ unassign</button>
                        </div>
                      )}
                      {!wo && clickable && (
                        <div style={{ height:"100%", minHeight:44, display:"flex", alignItems:"center", justifyContent:"center" }}>
                          <span style={{ fontSize:11, color:"#22c55e", fontWeight:500 }}>+ Assign here</span>
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
      <div style={{ marginTop:12, display:"flex", gap:12, alignItems:"center", fontSize:12, color:"#888" }}>
        <span style={{ fontWeight:600 }}>Priority:</span>
        {(Object.entries(PRI) as [Priority, typeof PRI[Priority]][]).map(([k, v]) => (
          <span key={k} style={{ display:"flex", alignItems:"center", gap:4 }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:v.dot, display:"inline-block" }} />
            {v.label}
          </span>
        ))}
        <span style={{ marginLeft:8 }}>Click a WO in the queue, then click an open slot to assign.</span>
      </div>
    </div>
  );
}
