import { useLocation } from 'wouter';

export default function NewListing() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('consignor-my-listings')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">List a Unit on Marketplace</div><div className="detail-meta">Your identity will be hidden until a hold is placed</div></div>
      </div>
      <div className="pn">
        <div style={{padding: '12px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Your dealership name and contact info will NOT be shown. Dealer Suite 360 mediates all inquiries. $250 commission on completed sales.
        </div>
        <div className="form-grid c3">
          <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Select from Inventory or Enter Manually</label></div>
          <div className="form-group full"><label>Unit</label><select><option>Select from your units...</option><option>1UJBJ0BN8M1TJ4K1 — 2024 Jayco Jay Flight 264BH</option><option>1UJCJ0BT4N1KQ8R2 — 2024 Jayco Eagle HT</option><option>+ Enter manually</option></select></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Unit Details</label></div>
          <div className="form-group"><label>VIN</label><input placeholder="17-character VIN" /></div>
          <div className="form-group"><label>Year</label><input placeholder="2024" /></div>
          <div className="form-group"><label>Manufacturer</label><select><option>Select...</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Grand Design</option><option>Coachmen</option></select></div>
          <div className="form-group"><label>Model</label><input placeholder="Imagine 2800BH" /></div>
          <div className="form-group"><label>RV Type</label><select><option>Travel Trailer</option><option>Fifth Wheel</option><option>Class A</option><option>Class C</option><option>Toy Hauler</option></select></div>
          <div className="form-group"><label>Condition</label><select><option>Excellent</option><option>Good</option><option>Fair</option></select></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Specifications</label></div>
          <div className="form-group"><label>Length (feet)</label><input placeholder="28" type="number" /></div>
          <div className="form-group"><label>Slides</label><select><option>0</option><option>1</option><option>2</option><option>3</option><option>4+</option></select></div>
          <div className="form-group"><label>Bunks</label><select><option>0</option><option>1</option><option>2</option><option>3+</option></select></div>
          <div className="form-group"><label>Sleeps</label><input placeholder="8" type="number" /></div>
          <div className="form-group"><label>Weight (GVWR)</label><input placeholder="6200" type="number" /></div>
          <div className="form-group"><label>Usage</label><input placeholder="e.g. Demo unit, 500 km" /></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Pricing</label></div>

          <div className="form-group full" style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '14px 16px', marginBottom: 4}}>
            <div style={{fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 2}}>Dealer Marketplace Price</div>
            <div style={{fontSize: 11, color: '#3b82f6', marginBottom: 10}}>Visible to verified dealers only · Available 365 days/year · Anonymous listing</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
              <div className="form-group" style={{margin: 0}}><label>Asking Price</label><input placeholder="$0.00" /></div>
              <div className="form-group" style={{margin: 0}}><label>Negotiable?</label><select><option>Yes — open to offers</option><option>Firm price</option></select></div>
              <div className="form-group" style={{margin: 0}}><label>Floor Price (hidden)</label><input placeholder="$0.00" /></div>
            </div>
          </div>

          <div className="form-group full" style={{background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 8, padding: '14px 16px', marginTop: 8}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2}}>
              <div style={{fontSize: 13, fontWeight: 700, color: '#92400e'}}>Public Auction Pricing</div>
              <span style={{background: '#d97706', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999}}>Once/Month · 24hr Window</span>
            </div>
            <div style={{fontSize: 11, color: '#b45309', marginBottom: 10}}>Shown to the public during monthly auction events · Requires Public Showcase add-on ($299/year)</div>
            <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
              <div className="form-group" style={{margin: 0}}>
                <label>Minimum Starting Bid</label>
                <input placeholder="$0.00" />
                <div style={{fontSize: 10, color: '#888', marginTop: 2}}>Visible to public bidders</div>
              </div>
              <div className="form-group" style={{margin: 0}}>
                <label>Reserve Price (hidden)</label>
                <input placeholder="$0.00" />
                <div style={{fontSize: 10, color: '#888', marginTop: 2}}>Unit won't sell below this — not shown to bidders</div>
              </div>
            </div>
            <div style={{marginTop: 10, display: 'flex', alignItems: 'center', gap: 8}}>
              <input type="checkbox" id="include-auction" style={{width: 14, height: 14}} />
              <label htmlFor="include-auction" style={{fontSize: 12, color: '#78350f', fontWeight: 500, margin: 0}}>Include this unit in the next public auction event</label>
            </div>
          </div>

          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Photos</label></div>
          <div className="form-group full">
            <div className="upload-zone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 48, height: 48, color: '#ccc', marginBottom: 12}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><div style={{fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4}}>Upload unit photos</div><div style={{fontSize: 13, color: '#888'}}>Exterior, interior, kitchen, bunks. Min 3 photos.</div></div>
          </div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label>Description</label><textarea placeholder="Condition, features, options, why you're selling..." style={{minHeight: 100}} /></div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-s" onClick={() => { alert('Listing published!'); navigate('consignor-my-listings'); }}>Publish Listing</button>
          <button className="btn btn-o" onClick={() => navigate('consignor-my-listings')}>Save Draft</button>
          <button className="btn btn-o" onClick={() => navigate('consignor-my-listings')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
