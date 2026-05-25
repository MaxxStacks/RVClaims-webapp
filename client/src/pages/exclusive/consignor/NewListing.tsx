import { useState } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function NewListing() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [form, setForm] = useState({
    vin: '', year: '', manufacturer: '', model: '', rvType: 'Travel Trailer',
    condition: 'Excellent', length: '', slides: '0', bunks: '0', sleeps: '',
    weight: '', usage: '', askingPrice: '', negotiable: 'yes', floorPrice: '',
    startingBid: '', reservePrice: '', includeAuction: false, description: '',
  });
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  const set = (k: string, v: any) => setForm(f => ({ ...f, [k]: v }));

  const handlePublish = async () => {
    if (!form.vin || !form.year || !form.manufacturer || !form.model) {
      setMsg('VIN, year, manufacturer, and model are required.');
      return;
    }
    if (!form.askingPrice) {
      setMsg('Asking price is required.');
      return;
    }
    setSaving(true);
    setMsg('');
    try {
      await apiFetch('/api/marketplace/listings', {
        method: 'POST',
        body: JSON.stringify({
          sellerId: user?.id,
          vin: form.vin,
          year: parseInt(form.year),
          manufacturer: form.manufacturer,
          model: form.model,
          rvType: form.rvType,
          condition: form.condition,
          length: form.length ? parseInt(form.length) : undefined,
          slides: parseInt(form.slides),
          bunks: parseInt(form.bunks),
          sleeps: form.sleeps ? parseInt(form.sleeps) : undefined,
          gvwr: form.weight ? parseInt(form.weight) : undefined,
          usage: form.usage,
          askingPrice: parseFloat(form.askingPrice.replace(/[^0-9.]/g, '')),
          negotiable: form.negotiable === 'yes',
          floorPrice: form.floorPrice ? parseFloat(form.floorPrice.replace(/[^0-9.]/g, '')) : undefined,
          startingBid: form.startingBid ? parseFloat(form.startingBid.replace(/[^0-9.]/g, '')) : undefined,
          reservePrice: form.reservePrice ? parseFloat(form.reservePrice.replace(/[^0-9.]/g, '')) : undefined,
          includeInAuction: form.includeAuction,
          description: form.description,
          title: `${form.year} ${form.manufacturer} ${form.model}`.trim(),
        }),
      });
      navigate('/marketplace/consignor/my-listings');
    } catch (err: any) {
      setMsg(err?.message || 'Listing saved. Check My Listings for status.');
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('/marketplace/consignor/my-listings')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">List a Unit on Marketplace</div><div className="detail-meta">Your identity will be hidden until a hold is placed</div></div>
      </div>
      {msg && <div style={{padding:'10px 16px',background:'#fef3c7',border:'1px solid #fde68a',borderRadius:8,marginBottom:16,fontSize:13,color:'#92400e'}}>{msg}</div>}
      <div className="pn">
        <div style={{padding:'12px 20px',background:'#eff6ff',borderBottom:'1px solid #bfdbfe',fontSize:12,color:'#1e40af',display:'flex',alignItems:'center',gap:8}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Your dealership name and contact info will NOT be shown. Dealer Suite 360 mediates all inquiries. $250 commission on completed sales.
        </div>
        <div className="form-grid c3">
          <div className="form-group full" style={{borderBottom:'1px solid #f0f0f0',paddingBottom:16}}><label style={{fontWeight:600,fontSize:13}}>Unit Details</label></div>
          <div className="form-group"><label>VIN</label><input value={form.vin} onChange={e => set('vin', e.target.value)} placeholder="17-character VIN" /></div>
          <div className="form-group"><label>Year</label><input value={form.year} onChange={e => set('year', e.target.value)} placeholder="2024" /></div>
          <div className="form-group"><label>Manufacturer</label>
            <select value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)}>
              <option value="">Select...</option>
              <option>Jayco</option><option>Forest River</option><option>Heartland</option>
              <option>Keystone</option><option>Grand Design</option><option>Coachmen</option>
            </select>
          </div>
          <div className="form-group"><label>Model</label><input value={form.model} onChange={e => set('model', e.target.value)} placeholder="Imagine 2800BH" /></div>
          <div className="form-group"><label>RV Type</label>
            <select value={form.rvType} onChange={e => set('rvType', e.target.value)}>
              <option>Travel Trailer</option><option>Fifth Wheel</option><option>Class A</option>
              <option>Class C</option><option>Toy Hauler</option>
            </select>
          </div>
          <div className="form-group"><label>Condition</label>
            <select value={form.condition} onChange={e => set('condition', e.target.value)}>
              <option>Excellent</option><option>Good</option><option>Fair</option>
            </select>
          </div>
          <div className="form-group full" style={{borderTop:'1px solid #f0f0f0',paddingTop:16,borderBottom:'1px solid #f0f0f0',paddingBottom:16}}><label style={{fontWeight:600,fontSize:13}}>Specifications</label></div>
          <div className="form-group"><label>Length (feet)</label><input value={form.length} onChange={e => set('length', e.target.value)} placeholder="28" type="number" /></div>
          <div className="form-group"><label>Slides</label>
            <select value={form.slides} onChange={e => set('slides', e.target.value)}>
              <option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3</option><option value="4">4+</option>
            </select>
          </div>
          <div className="form-group"><label>Bunks</label>
            <select value={form.bunks} onChange={e => set('bunks', e.target.value)}>
              <option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3+</option>
            </select>
          </div>
          <div className="form-group"><label>Sleeps</label><input value={form.sleeps} onChange={e => set('sleeps', e.target.value)} placeholder="8" type="number" /></div>
          <div className="form-group"><label>Weight (GVWR)</label><input value={form.weight} onChange={e => set('weight', e.target.value)} placeholder="6200" type="number" /></div>
          <div className="form-group"><label>Usage</label><input value={form.usage} onChange={e => set('usage', e.target.value)} placeholder="e.g. Demo unit, 500 km" /></div>
          <div className="form-group full" style={{borderTop:'1px solid #f0f0f0',paddingTop:16,borderBottom:'1px solid #f0f0f0',paddingBottom:16}}><label style={{fontWeight:600,fontSize:13}}>Pricing</label></div>

          <div className="form-group full" style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:8,padding:'14px 16px',marginBottom:4}}>
            <div style={{fontSize:13,fontWeight:700,color:'#1e40af',marginBottom:2}}>Dealer Marketplace Price</div>
            <div style={{fontSize:11,color:'#3b82f6',marginBottom:10}}>Visible to verified dealers only · Available 365 days/year · Anonymous listing</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:12}}>
              <div className="form-group" style={{margin:0}}><label>Asking Price</label><input value={form.askingPrice} onChange={e => set('askingPrice', e.target.value)} placeholder="$0.00" /></div>
              <div className="form-group" style={{margin:0}}><label>Negotiable?</label>
                <select value={form.negotiable} onChange={e => set('negotiable', e.target.value)}>
                  <option value="yes">Yes — open to offers</option><option value="no">Firm price</option>
                </select>
              </div>
              <div className="form-group" style={{margin:0}}><label>Floor Price (hidden)</label><input value={form.floorPrice} onChange={e => set('floorPrice', e.target.value)} placeholder="$0.00" /></div>
            </div>
          </div>

          <div className="form-group full" style={{background:'#fef9ec',border:'1px solid #fde68a',borderRadius:8,padding:'14px 16px',marginTop:8}}>
            <div style={{display:'flex',alignItems:'center',gap:8,marginBottom:2}}>
              <div style={{fontSize:13,fontWeight:700,color:'#92400e'}}>Public Auction Pricing</div>
              <span style={{background:'#d97706',color:'#fff',fontSize:10,fontWeight:600,padding:'2px 8px',borderRadius:9999}}>Once/Month · 24hr Window</span>
            </div>
            <div style={{fontSize:11,color:'#b45309',marginBottom:10}}>Shown to the public during monthly auction events · Requires Public Showcase add-on ($299/year)</div>
            <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
              <div className="form-group" style={{margin:0}}>
                <label>Minimum Starting Bid</label>
                <input value={form.startingBid} onChange={e => set('startingBid', e.target.value)} placeholder="$0.00" />
                <div style={{fontSize:10,color:'#888',marginTop:2}}>Visible to public bidders</div>
              </div>
              <div className="form-group" style={{margin:0}}>
                <label>Reserve Price (hidden)</label>
                <input value={form.reservePrice} onChange={e => set('reservePrice', e.target.value)} placeholder="$0.00" />
                <div style={{fontSize:10,color:'#888',marginTop:2}}>Unit won't sell below this — not shown to bidders</div>
              </div>
            </div>
            <div style={{marginTop:10,display:'flex',alignItems:'center',gap:8}}>
              <input type="checkbox" id="include-auction" checked={form.includeAuction} onChange={e => set('includeAuction', e.target.checked)} style={{width:14,height:14}} />
              <label htmlFor="include-auction" style={{fontSize:12,color:'#78350f',fontWeight:500,margin:0}}>Include this unit in the next public auction event</label>
            </div>
          </div>

          <div className="form-group full" style={{borderTop:'1px solid #f0f0f0',paddingTop:16,borderBottom:'1px solid #f0f0f0',paddingBottom:16}}><label style={{fontWeight:600,fontSize:13}}>Photos</label></div>
          <div className="form-group full">
            <div className="upload-zone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width:48,height:48,color:'#ccc',marginBottom:12}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><div style={{fontSize:15,fontWeight:600,color:'#333',marginBottom:4}}>Upload unit photos</div><div style={{fontSize:13,color:'#888'}}>Exterior, interior, kitchen, bunks. Min 3 photos.</div></div>
          </div>
          <div className="form-group full" style={{borderTop:'1px solid #f0f0f0',paddingTop:16}}><label>Description</label><textarea value={form.description} onChange={e => set('description', e.target.value)} placeholder="Condition, features, options, why you're selling..." style={{minHeight:100}} /></div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-s" onClick={handlePublish} disabled={saving}>{saving ? 'Publishing...' : 'Publish Listing'}</button>
          <button className="btn btn-o" disabled={saving} onClick={() => navigate('/marketplace/consignor/my-listings')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
