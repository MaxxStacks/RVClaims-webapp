import { useLocation } from 'wouter';

export default function MktMemberDetail() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('mkt-members')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">Lakeside RV Sales</div><div className="detail-meta">Applied Mar 14, 2026 · Marketplace Membership · Pending Verification</div></div>
        <span className="bg pending" style={{fontSize: 13, padding: '6px 16px'}}>Pending</span>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div>
          <div className="pn" style={{marginBottom: 16}}>
            <div className="pn-h"><span className="pn-t">Verification Checklist</span><span style={{fontSize: 12, color: '#888'}}>Complete all before approving</span></div>
            <div style={{padding: 20}}>
              {[
                ['Business registration verified', 'Check provincial business registry for active status'],
                ['Dealer license confirmed', 'OMVIC / provincial license — OMVIC-2024-88431'],
                ['Physical location verified', 'Google Maps confirmed: 455 Lake Shore Blvd, Orillia, ON'],
                ['Contact phone verified', 'Call placed to (705) 555-0188, spoke with owner'],
                ['Annual fee collected ($499)', 'Stripe payment processed and confirmed'],
              ].map(([title, desc], i) => (
                <label key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid #f5f5f5' : 'none', cursor: 'pointer'}}>
                  <input type="checkbox" style={{width: 18, height: 18, flexShrink: 0}} />
                  <div><div style={{fontSize: 13, fontWeight: 500}}>{title}</div><div style={{fontSize: 12, color: '#888'}}>{desc}</div></div>
                </label>
              ))}
            </div>
          </div>
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Application Details</span></div>
            <div className="form-grid">
              {[
                ['Dealership Name', 'Lakeside RV Sales'],
                ['Legal Name', 'Lakeside RV Sales Inc.'],
                ['Owner / Contact', 'Tom Nguyen'],
                ['Email', 'tom@lakesiderv.ca'],
                ['Phone', '(705) 555-0188'],
                ['Dealer License #', 'OMVIC-2024-88431'],
                ['Address', '455 Lake Shore Blvd, Orillia, ON L3V 6H2'],
                ['Website', 'https://lakesiderv.ca'],
              ].map(([label, val]) => (
                <div className="form-group" key={label}><label>{label}</label><input defaultValue={val} readOnly style={{background: '#f3f4f6'}} /></div>
              ))}
              <div className="form-group full"><label>Reason for Joining</label><textarea readOnly style={{background: '#f3f4f6'}} defaultValue="Looking to expand inventory options. We specialize in travel trailers and fifth wheels but often lose sales on toy haulers and class C units we don't carry." /></div>
              <div className="form-group full"><label>Internal Notes (staff only)</label><textarea placeholder="Add verification notes, call log, observations..." /></div>
            </div>
            <div className="btn-bar">
              <button className="btn btn-s" onClick={() => { if (confirm('Approve Lakeside RV Sales and collect $499 annual fee?')) navigate('mkt-members'); }}>Approve & Collect Payment</button>
              <button className="btn btn-d" onClick={() => { if (confirm('Reject this application? The dealer will be notified.')) navigate('mkt-members'); }}>Reject Application</button>
              <button className="btn btn-o">Request More Info</button>
            </div>
          </div>
        </div>
        <div>
          <div className="cd-section"><div className="cd-section-h">Application Summary</div>
            <div className="cd-row"><span className="cd-label">Applied</span><span className="cd-value">Mar 14, 2026</span></div>
            <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg pending">Pending</span></span></div>
            <div className="cd-row"><span className="cd-label">Annual Fee</span><span className="cd-value" style={{fontWeight: 600}}>$499/year</span></div>
            <div className="cd-row"><span className="cd-label">Payment</span><span className="cd-value" style={{color: '#aaa'}}>Not collected</span></div>
          </div>
          <div className="cd-section"><div className="cd-section-h">Existing Customer?</div>
            <div className="cd-row"><span className="cd-label">Claims Portal</span><span className="cd-value" style={{color: '#aaa'}}>Not registered</span></div>
            <div className="cd-row"><span className="cd-label">Match</span><span className="cd-value" style={{color: '#aaa'}}>No existing dealer</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
