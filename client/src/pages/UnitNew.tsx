import { useState } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function UnitNew() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({ vin: '', year: '', manufacturer: '', model: '', stockNumber: '' });
  const [saving, setSaving] = useState(false);

  const handleAdd = async () => {
    setSaving(true);
    try {
      await apiFetch('/api/units', { method: 'POST', body: JSON.stringify(form) });
      navigate('units');
    } catch { setSaving(false); }
  };

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('units')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">Add New Unit</div><div className="detail-meta">Register a unit on the platform</div></div>
      </div>
      <div className="pn">
        <div className="form-grid c3">
          <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Vehicle Information</label></div>
          <div className="form-group"><label>VIN</label><input placeholder="17-character VIN" value={form.vin} onChange={e => setForm(f => ({...f, vin: e.target.value}))} /></div>
          <div className="form-group"><label>Year</label><input placeholder="2024" value={form.year} onChange={e => setForm(f => ({...f, year: e.target.value}))} /></div>
          <div className="form-group"><label>Manufacturer</label><select value={form.manufacturer} onChange={e => setForm(f => ({...f, manufacturer: e.target.value}))}><option value="">Select...</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select></div>
          <div className="form-group"><label>Model</label><input placeholder="Jay Flight 264BH" value={form.model} onChange={e => setForm(f => ({...f, model: e.target.value}))} /></div>
          <div className="form-group"><label>RV Type</label><select><option>Select...</option><option>Travel Trailer</option><option>Fifth Wheel</option><option>Class A</option><option>Class C</option><option>Toy Hauler</option><option>Pop Up</option></select></div>
          <div className="form-group"><label>Stock #</label><input placeholder="STK-0000" value={form.stockNumber} onChange={e => setForm(f => ({...f, stockNumber: e.target.value}))} /></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Customer</label></div>
          <div className="form-group"><label>Name</label><input placeholder="Full name" /></div>
          <div className="form-group"><label>Email</label><input placeholder="email@example.com" /></div>
          <div className="form-group"><label>Phone</label><input placeholder="(555) 000-0000" /></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Warranty</label></div>
          <div className="form-group"><label>Delivery Date</label><input type="date" /></div>
          <div className="form-group"><label>Warranty Expiry</label><input type="date" /></div>
          <div className="form-group"><label>Ext. Warranty</label><input placeholder="Provider name" /></div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-p" onClick={handleAdd} disabled={saving}>{saving ? 'Saving...' : 'Add Unit'}</button>
          <button className="btn btn-o" onClick={() => navigate('units')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
