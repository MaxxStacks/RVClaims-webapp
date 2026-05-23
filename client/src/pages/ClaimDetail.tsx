import { useState } from 'react';
import { useLocation } from 'wouter';

export default function ClaimDetail() {
  const [, navigate] = useLocation();
  const [selectedClaimDetail] = useState<any | null>(null);
  const handleToast = (_msg: string) => {};

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('claims')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">{selectedClaimDetail?.claimNumber ?? "—"}</div><div className="detail-meta">{selectedClaimDetail?.dealerName ?? "—"} · {selectedClaimDetail?.manufacturer ?? ""} {selectedClaimDetail?.type ?? ""} · VIN: {selectedClaimDetail?.vin ?? "—"}</div></div><span className={`bg ${selectedClaimDetail?.status?.replace(/_/g,"-") ?? "submitted"}`} style={{fontSize: 13, padding: "6px 16px"}}>{selectedClaimDetail?.status ?? "—"}</span><button className="btn btn-p btn-sm" onClick={() => handleToast('Status updated')}>Update Status</button></div>
      <div className="cd-grid">
        <div>
          <div className="cd-section"><div className="cd-section-h">FRC Lines (4)</div>
            <div className="frc-line"><div className="frc-num">1</div><div className="frc-info"><div className="frc-code">JC-WAR-1042 — Delamination, Sidewall</div><div className="frc-desc">Passenger side, 2x3 ft</div></div><div className="frc-hrs">2.5 hrs · <span className="bg submitted">Pending</span></div></div>
            <div className="frc-line"><div className="frc-num">2</div><div className="frc-info"><div className="frc-code">JC-WAR-2018 — Water Leak, Roof Vent</div><div className="frc-desc">Front roof vent intrusion</div></div><div className="frc-hrs">1.5 hrs · <span className="bg submitted">Pending</span></div></div>
            <div className="frc-line"><div className="frc-num">3</div><div className="frc-info"><div className="frc-code">JC-WAR-3055 — Slide-Out Seal</div><div className="frc-desc">Driver side, 18 inches</div></div><div className="frc-hrs">1.0 hrs · <span className="bg submitted">Pending</span></div></div>
            <div className="frc-line"><div className="frc-num">4</div><div className="frc-info"><div className="frc-code">JC-WAR-4012 — Cabinet Hinge</div><div className="frc-desc">Kitchen cabinet</div></div><div className="frc-hrs">0.5 hrs · <span className="bg submitted">Pending</span></div></div>
          </div>
          <div className="cd-section"><div className="cd-section-h">Notes & Communication</div>
            <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">MS</div><div className="comm-content"><div className="comm-name">Mike Smith <span style={{fontWeight: 400, color: '#888'}}>(Smith's RV)</span></div><div className="comm-text">Photos uploaded. Customer is anxious about the roof leak — please prioritize.</div><div className="comm-time">Mar 16, 8:15 AM</div></div></div><div className="comm-msg"><div className="comm-avatar op">JD</div><div className="comm-content"><div className="comm-name">Jonathan D. <span style={{fontWeight: 400, color: '#888'}}>(Operator)</span></div><div className="comm-text">Got it. Strong documentation — recommending all 4 lines. Will submit to Jayco today.</div><div className="comm-time">Mar 16, 10:30 AM</div></div></div></div>
            <div style={{padding: '16px 20px'}}><textarea placeholder="Add a note..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end'}}><select style={{padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit'}}><option>Visible to dealer</option><option>Internal only</option></select><button className="btn btn-p btn-sm">Send</button></div></div>
          </div>
        </div>
        <div>
          <div className="cd-section"><div className="cd-section-h">Claim Info</div><div className="cd-row"><span className="cd-label">Claim #</span><span className="cd-value">{selectedClaimDetail?.claimNumber ?? "—"}</span></div><div className="cd-row"><span className="cd-label">Type</span><span className="cd-value">{selectedClaimDetail?.type ?? "—"}</span></div><div className="cd-row"><span className="cd-label">Mfr Claim #</span><span className="cd-value" style={{color: selectedClaimDetail?.mfrClaimNumber ? "inherit" : "#aaa"}}>{selectedClaimDetail?.mfrClaimNumber ?? "Not assigned"}</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className={`bg ${selectedClaimDetail?.status?.replace(/_/g,"-") ?? "submitted"}`}>{selectedClaimDetail?.status ?? "—"}</span></span></div></div>
          <div className="cd-section"><div className="cd-section-h">Unit</div><div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily: "monospace", fontSize: 12}}>{selectedClaimDetail?.vin ?? "—"}</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">{selectedClaimDetail?.unitDescription ?? "—"}</span></div></div>
          <div className="cd-section"><div className="cd-section-h">Dealer</div><div className="cd-row"><span className="cd-label">Name</span><span className="cd-value cid" onClick={() => navigate("dealer-detail")}>{selectedClaimDetail?.dealerName ?? "—"}</span></div><div className="cd-row"><span className="cd-label">Plan</span><span className="cd-value">{selectedClaimDetail?.dealerPlan ?? "—"}</span></div></div>
          <div className="cd-section"><div className="cd-section-h">Financials</div><div className="cd-row"><span className="cd-label">Labor (5.5 hrs)</span><span className="cd-value">$770</span></div><div className="cd-row"><span className="cd-label">Parts</span><span className="cd-value">$385</span></div><div className="cd-row"><span className="cd-label">Transport</span><span className="cd-value">$85</span></div><div className="cd-row" style={{fontWeight: 600}}><span className="cd-label" style={{color: '#111'}}>Total</span><span className="cd-value" style={{fontSize: 15}}>$1,240</span></div><div className="cd-row"><span className="cd-label">Claim Fee (10%)</span><span className="cd-value" style={{color: 'var(--brand)'}}>$124</span></div></div>
        </div>
      </div>
    </div>
  );
}
