import { useLocation } from 'wouter';

export default function FinancingDetail() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('svc-financing')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">FIN-0023 — Daniel Tremblay</div><div className="detail-meta">Smith's RV Centre · 2024 Jayco Eagle HT · $42,500 requested</div></div><span className="bg in-progress" style={{fontSize: 13, padding: '6px 16px'}}>Shopping Lenders</span></div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div>
          <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Lender Applications</span><span className="pn-a">+ Add Lender</span></div>
            <div className="tw"><table><thead><tr><th>Lender</th><th>Submitted</th><th>Rate</th><th>Term</th><th>Monthly</th><th>Status</th><th>Action</th></tr></thead><tbody>
              <tr><td style={{fontWeight: 500}}>RBC</td><td>Mar 16, 9am</td><td>5.49%</td><td>180 mo</td><td>$347</td><td><span className="bg authorized">Approved</span></td><td><button className="btn btn-s btn-sm">Select</button></td></tr>
              <tr><td style={{fontWeight: 500}}>Desjardins</td><td>Mar 16, 9am</td><td>—</td><td>—</td><td>—</td><td><span className="bg pending">Pending</span></td><td><button className="btn btn-o btn-sm">Follow Up</button></td></tr>
              <tr><td style={{fontWeight: 500}}>TD Auto</td><td>Mar 16, 10am</td><td>6.29%</td><td>180 mo</td><td>$368</td><td><span className="bg authorized">Approved</span></td><td><button className="btn btn-o btn-sm">Select</button></td></tr>
            </tbody></table></div>
          </div>
          <div className="pn"><div className="pn-h"><span className="pn-t">Communication</span></div>
            <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">MS</div><div className="comm-content"><div className="comm-name">Mike Smith <span style={{fontWeight: 400, color: '#888'}}>(Smith's RV)</span></div><div className="comm-text">Customer wants lowest rate possible, flexible on term.</div><div className="comm-time">Mar 16, 8:30 AM</div></div></div></div>
            <div style={{padding: '16px 20px'}}><textarea placeholder="Update the dealer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end'}}><button className="btn btn-p btn-sm">Send</button></div></div>
          </div>
        </div>
        <div>
          <div className="cd-section"><div className="cd-section-h">Request Details</div><div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Daniel Tremblay</span></div><div className="cd-row"><span className="cd-label">Credit Score</span><span className="cd-value">742 (Good)</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">2024 Jayco Eagle HT</span></div><div className="cd-row"><span className="cd-label">Requested</span><span className="cd-value" style={{fontWeight: 600}}>$42,500</span></div><div className="cd-row"><span className="cd-label">Down Payment</span><span className="cd-value">$5,000</span></div><div className="cd-row"><span className="cd-label">Preferred Term</span><span className="cd-value">15 years</span></div></div>
          <div className="cd-section"><div className="cd-section-h">Dealer</div><div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value cid" onClick={() => navigate('dealer-detail')}>Smith's RV Centre</span></div><div className="cd-row"><span className="cd-label">Submitted By</span><span className="cd-value">Mike Smith</span></div></div>
          <div className="cd-section"><div className="cd-section-h">Best Offer</div><div className="cd-row" style={{background: '#f0fdf4'}}><span className="cd-label" style={{color: '#16a34a'}}>RBC — 5.49%</span><span className="cd-value" style={{color: '#16a34a', fontWeight: 600}}>$347/mo x 180</span></div></div>
        </div>
      </div>
    </div>
  );
}
