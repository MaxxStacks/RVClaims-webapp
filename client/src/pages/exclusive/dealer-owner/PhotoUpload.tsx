import { useLocation } from 'wouter';

export default function PhotoUpload() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{fontSize: 13, color: '#666', marginBottom: 20}}>Select a unit, choose the claim type, upload your photos, and push to the operator for processing.</div>
      <div className="pn">
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: 20, borderBottom: '1px solid #f0f0f0'}}>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><label style={{fontSize: 12, fontWeight: 500, color: '#555'}}>Select Unit</label><select style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}><option>Select unit by VIN...</option><option>1UJBJ0BN8M1TJ4K1 — 2024 Jayco Jay Flight</option><option>1UJCJ0BT4N1KQ8R2 — 2024 Jayco Eagle HT</option><option>4X4FCKB21NE021N4 — 2024 Forest River Rockwood</option></select></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><label style={{fontSize: 12, fontWeight: 500, color: '#555'}}>Claim Type</label><select style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}><option>Select type...</option><option>DAF (Dealer Arrival Form)</option><option>PDI (Pre-Delivery Inspection)</option><option>Warranty</option><option>Extended Warranty</option><option>Insurance</option></select></div>
          <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><label style={{fontSize: 12, fontWeight: 500, color: '#555'}}>Manufacturer</label><input value="Jayco" readOnly style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, background: '#f3f4f6', color: '#888'}} /></div>
        </div>
        <div style={{padding: '24px 20px'}}>
          <div className="upload-zone">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style={{fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4}}>Drag photos here or click to browse</div>
            <div style={{fontSize: 13, color: '#888'}}>Upload all photos for this unit. JPG, PNG, HEIC accepted. Max 50 photos per batch.</div>
          </div>
          <div style={{marginTop: 20}}>
            <div style={{fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 12}}>Uploaded Photos (24)</div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 8}}>
              {['IMG_01','IMG_02','IMG_03','IMG_04','IMG_05','...','IMG_23','IMG_24'].map((label, i) => (
                <div key={i} style={{aspectRatio: '1', background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888'}}>{label}</div>
              ))}
            </div>
          </div>
        </div>
        <div style={{padding: '0 20px 20px'}}>
          <div style={{fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 6}}>Describe what you see (optional but helpful)</div>
          <textarea placeholder="e.g. Sidewall damage on passenger side, roof leak near front vent, slide-out seal torn..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 70, resize: 'vertical', outline: 'none', background: '#fafafa'}}></textarea>
        </div>
        <div className="btn-bar" style={{borderTop: '2px solid #f0f0f0', background: '#fafbfe'}}>
          <button className="btn btn-s" style={{fontSize: 14, padding: '12px 32px'}} onClick={() => navigate('claims')}>Push to Claim →</button>
          <button className="btn btn-o" onClick={() => alert('Draft saved')}>Save as Draft</button>
          <div style={{marginLeft: 'auto', fontSize: 12, color: '#888'}}>24 photos · Jayco Warranty · VIN ...4K1</div>
        </div>
      </div>
    </div>
  );
}
