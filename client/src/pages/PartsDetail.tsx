import { useLocation } from 'wouter';

export default function PartsDetail() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('svc-parts')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">PO-0038 — Parts Order</div><div className="detail-meta">Smith's RV Centre · Related to CLM-0248 · 3 items requested</div></div><span className="bg new-req" style={{fontSize: 13, padding: '6px 16px'}}>New Request</span></div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div>
          <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Requested Items</span><span className="pn-a">+ Add Item</span></div>
            <div className="tw"><table><thead><tr><th>Item</th><th>Part #</th><th>Qty</th><th>Source</th><th>Our Cost</th><th>Dealer Price</th><th>Status</th></tr></thead><tbody>
              <tr><td style={{fontWeight: 500}}>Sidewall Panel (2x3 section)</td><td style={{color: '#888'}}>—</td><td>1</td><td><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}}><option>Finding source...</option><option>Jayco Direct</option><option>RV Wholesale</option></select></td><td><input style={{width: 70, padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}} placeholder="$0" /></td><td><input style={{width: 70, padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}} placeholder="$0" /></td><td><span className="bg new-req">Sourcing</span></td></tr>
              <tr><td style={{fontWeight: 500}}>Panel Adhesive (1 gal)</td><td style={{color: '#888'}}>ADH-5500</td><td>1</td><td>RV Wholesale</td><td>$42</td><td>$65</td><td><span className="bg quoted">In Stock</span></td></tr>
              <tr><td style={{fontWeight: 500}}>Lap Sealant</td><td style={{color: '#888'}}>SEAL-120</td><td>2</td><td>RV Wholesale</td><td>$18/ea</td><td>$28/ea</td><td><span className="bg quoted">In Stock</span></td></tr>
            </tbody></table></div>
            <div style={{padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 8}}><button className="btn btn-o btn-sm">Save Quotes</button><button className="btn btn-p btn-sm">Send Quote to Dealer</button></div>
          </div>
          <div className="pn"><div className="pn-h"><span className="pn-t">Communication</span></div>
            <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">MS</div><div className="comm-content"><div className="comm-name">Mike Smith <span style={{fontWeight: 400, color: '#888'}}>(Smith's RV)</span></div><div className="comm-text">Need parts for the delamination repair on CLM-0248. Sidewall panel, adhesive, and sealant. Please quote ASAP.</div><div className="comm-time">Mar 16, 8:45 AM</div></div></div></div>
            <div style={{padding: '16px 20px'}}><textarea placeholder="Update the dealer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{textAlign: 'right', marginTop: 8}}><button className="btn btn-p btn-sm">Send</button></div></div>
          </div>
        </div>
        <div>
          <div className="cd-section"><div className="cd-section-h">Order Info</div><div className="cd-row"><span className="cd-label">Order #</span><span className="cd-value">PO-0038</span></div><div className="cd-row"><span className="cd-label">Related Claim</span><span className="cd-value cid" onClick={() => navigate('claim-detail')}>CLM-0248</span></div><div className="cd-row"><span className="cd-label">Items</span><span className="cd-value">3</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg new-req">Sourcing</span></span></div></div>
          <div className="cd-section"><div className="cd-section-h">Dealer</div><div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value cid" onClick={() => navigate('dealer-detail')}>Smith's RV</span></div><div className="cd-row"><span className="cd-label">Requested By</span><span className="cd-value">Mike Smith</span></div></div>
          <div className="cd-section"><div className="cd-section-h">Shipping</div><div className="cd-row"><span className="cd-label">Method</span><span className="cd-value" style={{color: '#aaa'}}>Not yet ordered</span></div><div className="cd-row"><span className="cd-label">Tracking</span><span className="cd-value" style={{color: '#aaa'}}>—</span></div><div className="cd-row"><span className="cd-label">ETA</span><span className="cd-value" style={{color: '#aaa'}}>—</span></div></div>
        </div>
      </div>
    </div>
  );
}
