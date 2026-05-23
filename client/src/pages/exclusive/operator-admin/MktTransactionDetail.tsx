import { useLocation } from 'wouter';

export default function MktTransactionDetail() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('mkt-transactions')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">TXN-0089 — Escrow Active</div><div className="detail-meta">MKT-0281 · 2023 Keystone Cougar 29BHS · $38,500</div></div>
        <span className="bg" style={{background: '#fef3c7', color: '#d97706', fontSize: 13, padding: '6px 16px'}}>Escrow Active</span>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div>
          <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Escrow Timeline</span></div>
            <div className="act">
              <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t"><strong>Ontario RV Depot</strong> placed $500 hold</div><div className="act-tm">Mar 15, 2:30 PM · Stripe PI: pi_3NxR...</div></div></div>
              <div className="act-i"><span className="act-dot new"></span><div><div className="act-t">Dealer Suite 360 notified <strong>Atlantic RV</strong> (seller)</div><div className="act-tm">Mar 15, 2:31 PM</div></div></div>
              <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t">Atlantic RV <strong>accepted</strong> — unit reserved</div><div className="act-tm">Mar 15, 4:15 PM</div></div></div>
              <div className="act-i"><span className="act-dot pt"></span><div><div className="act-t">Awaiting <strong>transport / pickup</strong></div><div className="act-tm">In progress</div></div></div>
            </div>
          </div>
          <div className="pn"><div className="pn-h"><span className="pn-t">Communication</span></div>
            <div className="comm-box">
              <div className="comm-msg"><div className="comm-avatar dl">OR</div><div className="comm-content"><div className="comm-name">Ontario RV Depot (Buyer)</div><div className="comm-text">We'd like pickup Friday. Can seller have it prepped?</div><div className="comm-time">Mar 16, 9:00 AM</div></div></div>
              <div className="comm-msg"><div className="comm-avatar op">RC</div><div className="comm-content"><div className="comm-name">Dealer Suite 360 (You)</div><div className="comm-text">Confirmed — unit prepped Friday 10 AM. Address sent privately.</div><div className="comm-time">Mar 16, 10:30 AM</div></div></div>
            </div>
            <div style={{padding: '16px 20px'}}>
              <textarea placeholder="Message both parties..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical'}} />
              <div style={{display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end'}}>
                <select style={{padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit'}}><option>Send to buyer</option><option>Send to seller</option><option>Send to both</option></select>
                <button className="btn btn-p btn-sm">Send</button>
              </div>
            </div>
          </div>
        </div>
        <div>
          <div className="cd-section"><div className="cd-section-h">Transaction</div>
            <div className="cd-row"><span className="cd-label">Transaction #</span><span className="cd-value">TXN-0089</span></div>
            <div className="cd-row"><span className="cd-label">Listing</span><span className="cd-value cid" onClick={() => navigate('mkt-listing-detail')}>MKT-0281</span></div>
            <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>Escrow Active</span></span></div>
            <div className="cd-row"><span className="cd-label">Hold</span><span className="cd-value" style={{fontWeight: 600}}>$500.00</span></div>
          </div>
          <div className="cd-section"><div className="cd-section-h">Buyer</div>
            <div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value">Ontario RV Depot</span></div>
            <div className="cd-row"><span className="cd-label">Contact</span><span className="cd-value">Marc Leblanc</span></div>
          </div>
          <div className="cd-section"><div className="cd-section-h">Seller</div>
            <div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value">Atlantic RV</span></div>
            <div className="cd-row"><span className="cd-label">Contact</span><span className="cd-value">Sarah Chen</span></div>
          </div>
          <div className="cd-section"><div className="cd-section-h">Financials</div>
            <div className="cd-row"><span className="cd-label">Sale Price</span><span className="cd-value" style={{fontWeight: 600}}>$38,500</span></div>
            <div className="cd-row"><span className="cd-label">Escrow Hold</span><span className="cd-value">$500</span></div>
            <div className="cd-row"><span className="cd-label">Commission</span><span className="cd-value" style={{color: 'var(--brand)', fontWeight: 600}}>$250</span></div>
          </div>
          <div style={{padding: 12, display: 'flex', flexDirection: 'column', gap: 8}}>
            <button className="btn btn-s btn-sm" style={{width: '100%', justifyContent: 'center'}} onClick={() => { if (confirm('Complete sale: capture $500 hold and collect $250 commission?')) navigate('mkt-transactions'); }}>Complete Sale & Capture Hold</button>
            <button className="btn btn-o btn-sm" style={{width: '100%', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => { if (confirm('Release $500 hold to buyer and cancel?')) navigate('mkt-transactions'); }}>Release Hold & Cancel</button>
          </div>
        </div>
      </div>
    </div>
  );
}
