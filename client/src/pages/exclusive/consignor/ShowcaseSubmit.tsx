import { useState } from 'react';
import { useLocation } from 'wouter';

export default function ShowcaseSubmit() {
  const [, navigate] = useLocation();
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('showcase')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">Submit Unit for April Public Auction</div><div className="detail-meta">Event: Apr 12, 2026 · Submission deadline: Apr 8 · 24-hour public bidding</div></div>
      </div>
      <div className="pn">
        <div style={{padding: '12px 20px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 8}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          This unit will be shown to verified public buyers during the 24-hour auction window. Your dealership identity is hidden until a sale is confirmed.
        </div>
        <div className="form-grid c3">
          <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Select Unit</label></div>
          <div className="form-group full"><label>From your inventory or marketplace listings</label><select><option>Select unit...</option><option>MKT-0284 — 2024 Grand Design Imagine 2800BH ($42,900)</option><option>1UJCJ0BT4N1KQ8R2 — 2024 Jayco Eagle HT (not listed)</option><option>+ Enter new unit manually</option></select></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Auction Pricing</label></div>
          <div className="form-group"><label>Starting Bid</label><input placeholder="$0.00" /><div style={{fontSize: 11, color: '#888', marginTop: 4}}>Bidding opens at this amount</div></div>
          <div className="form-group"><label>Reserve Price (hidden)</label><input placeholder="$0.00" /><div style={{fontSize: 11, color: '#888', marginTop: 4}}>Won't sell below this — not shown to bidders</div></div>
          <div className="form-group"><label>Buy Now Price (optional)</label><input placeholder="$0.00" /><div style={{fontSize: 11, color: '#888', marginTop: 4}}>Instant purchase — ends bidding immediately</div></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Photos (min 5 required for public auction)</label></div>
          <div className="form-group full">
            <div className="upload-zone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 48, height: 48, color: '#ccc', marginBottom: 12}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><div style={{fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4}}>Upload showcase photos</div><div style={{fontSize: 13, color: '#888'}}>High quality exterior + interior. Min 5, max 20. First photo is the hero image.</div></div>
          </div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label>Public Description</label><textarea placeholder="This description is shown to public bidders. Highlight condition, features, options, warranty status..." style={{minHeight: 100}} /></div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-s" onClick={() => { showToast('Unit submitted for review! Dealer Suite 360 will approve within 24 hours.'); setTimeout(() => navigate('showcase'), 1200); }}>Submit for Review</button>
          <button className="btn btn-o" onClick={() => navigate('showcase')}>Save Draft</button>
          <button className="btn btn-o" onClick={() => navigate('showcase')}>Cancel</button>
        </div>
      {toast && <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1e293b',color:'#fff',padding:'10px 20px',borderRadius:8,fontSize:13,zIndex:9999,boxShadow:'0 4px 12px rgba(0,0,0,.2)'}}>{toast}</div>}
      </div>
    </div>
  );
}
