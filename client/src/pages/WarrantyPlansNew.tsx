import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function WarrantyPlansNew() {
  const [, navigate] = useLocation();
  const [opDealers, setOpDealers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('svc-warranty')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Add / Sell Warranty Plan</div><div className="detail-meta">Register an existing plan or sell a new one through the platform</div></div></div>
      <div className="pn"><div className="form-grid">
        <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Plan Type</label><select style={{marginTop: 6, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}><option>Sell New Plan (we earn commission)</option><option>Register Existing Plan (track only)</option></select></div>
        <div className="form-group"><label>Dealer</label><select><option value=''>Select...</option>{opDealers.map((d:any)=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="form-group"><label>Customer</label><input placeholder="Customer name" /></div>
        <div className="form-group"><label>VIN</label><input placeholder="Unit VIN" /></div>
        <div className="form-group"><label>Provider</label><select><option>Guardsman RV</option><option>XtraRide</option><option>Wholesale Warranties</option><option>Jayco OEM</option><option>Other...</option></select></div>
        <div className="form-group"><label>Coverage Level</label><select><option>Comprehensive</option><option>Powertrain+</option><option>Gold</option><option>Platinum</option><option>OEM Standard</option></select></div>
        <div className="form-group"><label>Term (years)</label><select><option>2</option><option>3</option><option>5</option><option>7</option></select></div>
        <div className="form-group"><label>Our Cost</label><input placeholder="$0.00" /></div>
        <div className="form-group"><label>Retail Price (to customer)</label><input placeholder="$0.00" /></div>
        <div className="form-group"><label>Start Date</label><input type="date" /></div>
        <div className="form-group"><label>Expiry Date</label><input type="date" /></div>
        <div className="form-group full"><label>Notes</label><textarea placeholder="Plan details, special terms, renewal instructions..."></textarea></div>
      </div><div className="btn-bar"><button className="btn btn-p" onClick={() => navigate('svc-warranty')}>Save Plan</button><button className="btn btn-o" onClick={() => navigate('svc-warranty')}>Cancel</button></div></div>
    </div>
  );
}
