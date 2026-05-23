import { useLocation } from 'wouter';

export default function FAndIDetail() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('svc-fi')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">FI-0014 — Julie Fournier</div><div className="detail-meta">Atlantic RV · 2024 Forest River Wildwood · 4 products recommended</div></div><span className="bg in-progress" style={{fontSize: 13, padding: '6px 16px'}}>Recommending</span></div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div>
          <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Recommended Products</span><span className="pn-a">+ Add Product</span></div>
            <div className="tw"><table><thead><tr><th>Product</th><th>Provider</th><th>Term</th><th>Cost</th><th>Retail</th><th>Margin</th><th>Decision</th></tr></thead><tbody>
              <tr><td style={{fontWeight: 500}}>Extended Warranty (5yr)</td><td>Guardsman RV</td><td>60 mo</td><td>$1,200</td><td>$2,495</td><td style={{color: '#22c55e', fontWeight: 600}}>$1,295</td><td><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}}><option>Pending</option><option>Accepted</option><option>Declined</option></select></td></tr>
              <tr><td style={{fontWeight: 500}}>GAP Insurance</td><td>IBC Financial</td><td>Loan term</td><td>$450</td><td>$995</td><td style={{color: '#22c55e', fontWeight: 600}}>$545</td><td><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}}><option>Pending</option><option>Accepted</option><option>Declined</option></select></td></tr>
              <tr><td style={{fontWeight: 500}}>Paint & Fabric Protection</td><td>ProGuard</td><td>5 yr</td><td>$280</td><td>$695</td><td style={{color: '#22c55e', fontWeight: 600}}>$415</td><td><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}}><option>Pending</option><option>Accepted</option><option>Declined</option></select></td></tr>
              <tr><td style={{fontWeight: 500}}>Roadside Assistance (3yr)</td><td>RV Assist Co</td><td>36 mo</td><td>$150</td><td>$395</td><td style={{color: '#22c55e', fontWeight: 600}}>$245</td><td><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}}><option>Pending</option><option>Accepted</option><option>Declined</option></select></td></tr>
            </tbody></table></div>
            <div style={{padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600}}><span>Total Potential Margin</span><span style={{color: '#22c55e'}}>$2,500</span></div>
          </div>
          <div className="pn"><div className="pn-h"><span className="pn-t">Communication</span></div>
            <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">SC</div><div className="comm-content"><div className="comm-name">Sarah Chen <span style={{fontWeight: 400, color: '#888'}}>(Atlantic RV)</span></div><div className="comm-text">Customer is financing through RBC at 4.99%. She's open to extended warranty and GAP but price-sensitive. Please send options.</div><div className="comm-time">Mar 15, 4:30 PM</div></div></div></div>
            <div style={{padding: '16px 20px'}}><textarea placeholder="Update the dealer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{textAlign: 'right', marginTop: 8}}><button className="btn btn-p btn-sm">Send</button></div></div>
          </div>
        </div>
        <div>
          <div className="cd-section"><div className="cd-section-h">Deal Info</div><div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Julie Fournier</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">2024 FR Wildwood</span></div><div className="cd-row"><span className="cd-label">Sale Price</span><span className="cd-value">$38,900</span></div><div className="cd-row"><span className="cd-label">Financing</span><span className="cd-value">RBC 4.99%</span></div></div>
          <div className="cd-section"><div className="cd-section-h">Dealer</div><div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value cid" onClick={() => navigate('dealer-detail')}>Atlantic RV</span></div><div className="cd-row"><span className="cd-label">Contact</span><span className="cd-value">Sarah Chen</span></div></div>
          <div className="cd-section"><div className="cd-section-h">Summary</div><div className="cd-row"><span className="cd-label">Products Offered</span><span className="cd-value">4</span></div><div className="cd-row"><span className="cd-label">Potential Revenue</span><span className="cd-value" style={{color: '#22c55e', fontWeight: 600}}>$2,500</span></div></div>
        </div>
      </div>
    </div>
  );
}
