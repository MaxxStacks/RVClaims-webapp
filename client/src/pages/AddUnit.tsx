import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function AddUnit() {
  const [, navigate] = useLocation();
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [addUnitSaving, setAddUnitSaving] = useState(false);
  const [addUnitForm, setAddUnitForm] = useState({
    vin: '', year: '', manufacturer: '', model: '', stockNumber: '', dealershipId: ''
  });

  useEffect(() => {
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const handleCreateUnit = async () => {
    if (!addUnitForm.vin) return;
    setAddUnitSaving(true);
    try {
      await apiFetch('/api/v6/units', { method: 'POST', body: JSON.stringify(addUnitForm) });
      navigate('units');
    } catch {
      setAddUnitSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('units')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Add New Unit</div><div className="detail-meta">Register a unit on the platform</div></div></div>
      <div className="pn"><div className="form-grid c3">
        <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Vehicle</label></div>
        <div className="form-group"><label>VIN</label><input placeholder="17-character VIN" value={addUnitForm.vin} onChange={e => setAddUnitForm(f => ({...f, vin: e.target.value}))} /></div>
        <div className="form-group"><label>Year</label><input placeholder="2024" value={addUnitForm.year} onChange={e => setAddUnitForm(f => ({...f, year: e.target.value}))} /></div>
        <div className="form-group"><label>Manufacturer</label><select value={addUnitForm.manufacturer} onChange={e => setAddUnitForm(f => ({...f, manufacturer: e.target.value}))}><option value="">Select...</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select></div>
        <div className="form-group"><label>Model</label><input placeholder="Jay Flight 264BH" value={addUnitForm.model} onChange={e => setAddUnitForm(f => ({...f, model: e.target.value}))} /></div>
        <div className="form-group"><label>RV Type</label><select><option>Select...</option><option>Travel Trailer</option><option>Fifth Wheel</option><option>Class A</option><option>Class C</option><option>Toy Hauler</option><option>Pop Up</option></select></div>
        <div className="form-group"><label>Stock #</label><input placeholder="STK-0000" value={addUnitForm.stockNumber} onChange={e => setAddUnitForm(f => ({...f, stockNumber: e.target.value}))} /></div>
        <div className="form-group"><label>Lot Location</label><input placeholder="Lot B, Row 3" /></div>
        <div className="form-group"><label>Status</label><select><option>On Lot</option><option>Delivered</option><option>In Service</option></select></div>
        <div className="form-group"><label>Dealer</label><select value={addUnitForm.dealershipId} onChange={e => setAddUnitForm(f => ({...f, dealershipId: e.target.value}))}><option value="">Select...</option>{opDealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Customer</label></div>
        <div className="form-group"><label>Name</label><input placeholder="Customer name" /></div>
        <div className="form-group"><label>Email</label><input placeholder="email@example.com" /></div>
        <div className="form-group"><label>Phone</label><input placeholder="(555) 000-0000" /></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Inspection & Warranty</label></div>
        <div className="form-group"><label>DAF Required</label><select><option>Yes</option><option>No</option></select></div>
        <div className="form-group"><label>DAF Fee</label><input defaultValue="$25.00" /></div>
        <div className="form-group"><label>Delivery Date</label><input type="date" /></div>
        <div className="form-group"><label>Warranty Expiry</label><input type="date" /></div>
        <div className="form-group"><label>Ext. Warranty Provider</label><input placeholder="Provider name" /></div>
        <div className="form-group"><label>Ext. Warranty Expiry</label><input type="date" /></div>
      </div><div className="btn-bar"><button className="btn btn-p" onClick={handleCreateUnit} disabled={addUnitSaving}>{addUnitSaving ? 'Saving...' : 'Add Unit'}</button><button className="btn btn-o" onClick={() => navigate('units')}>Cancel</button></div></div>
    </div>
  );
}
