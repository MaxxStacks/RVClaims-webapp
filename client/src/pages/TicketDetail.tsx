import { useLocation } from 'wouter';

export default function TicketDetail() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('cust-tickets')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">TKT-0042 — Warranty claim</div><div className="detail-meta">Robert Martin · Claim / Warranty · CLM-0248</div></div>
        <span className="bg submitted" style={{fontSize: 13, padding: '6px 16px'}}>Open</span>
        <select style={{padding: '6px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit'}}><option>Open</option><option>Waiting on Customer</option><option>Resolved</option><option>Closed</option></select>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Conversation</span></div>
          <div className="comm-box" style={{margin: 0, border: 'none', borderRadius: 0}}>
            <div className="comm-msg" style={{background: '#f0fdf4'}}><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">You (auto) <span style={{fontWeight: 400, color: '#888', fontSize: 11}}>· System</span></div><div className="comm-text">A warranty claim has been created for Robert's 2024 Jayco Jay Flight. 4 issues identified, processing with manufacturer.</div><div className="comm-time">Mar 16, 10:30 AM</div></div></div>
            <div className="comm-msg"><div className="comm-avatar cu">RM</div><div className="comm-content"><div className="comm-name">Robert Martin</div><div className="comm-text">Thanks! The roof leak is my main concern — stain getting bigger.</div><div className="comm-time">Mar 16, 11:45 AM</div></div></div>
            <div className="comm-msg"><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">You</div><div className="comm-text">Understood. Roof vent flagged as priority. Jayco usually responds within 48h.</div><div className="comm-time">Mar 16, 12:10 PM</div></div></div>
            <div className="comm-msg"><div className="comm-avatar cu">RM</div><div className="comm-content"><div className="comm-name">Robert Martin</div><div className="comm-text">Should I put a tarp over the vent?</div><div className="comm-time">Mar 16, 12:30 PM</div></div></div>
          </div>
          <div style={{padding: '16px 20px', borderTop: '1px solid #f0f0f0'}}>
            <textarea placeholder="Reply to customer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
              <div style={{display: 'flex', gap: 8}}><button className="btn btn-o btn-sm" style={{fontSize: 11}}>Attach</button><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 11, fontFamily: 'inherit'}}><option>Visible to customer</option><option>Internal note (hidden)</option></select></div>
              <button className="btn btn-p btn-sm">Send Reply</button>
            </div>
          </div>
        </div>
        <div>
          <div className="cd-section"><div className="cd-section-h">Ticket Info</div><div className="cd-row"><span className="cd-label">Ticket</span><span className="cd-value">TKT-0042</span></div><div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Robert Martin</span></div><div className="cd-row"><span className="cd-label">Category</span><span className="cd-value">Claim / Warranty</span></div><div className="cd-row"><span className="cd-label">Opened</span><span className="cd-value">Mar 16</span></div></div>
          <div className="cd-section"><div className="cd-section-h">Linked</div><div className="cd-row"><span className="cd-label">Claim</span><span className="cd-value cid" onClick={() => navigate('claim-detail')}>CLM-0248</span></div><div className="cd-row"><span className="cd-label">Parts</span><span className="cd-value">PO-0038</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value" style={{fontSize: 12}}>2024 Jayco Jay Flight</span></div></div>
        </div>
      </div>
    </div>
  );
}
