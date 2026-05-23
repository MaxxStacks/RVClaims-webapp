import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function PartsNew() {
  const [, navigate] = useLocation();
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [opClaims, setOpClaims] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
    apiFetch<any>('/api/v6/claims').then(d => setOpClaims(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('svc-parts')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">New Parts Order</div><div className="detail-meta">Request or order parts for a dealer</div></div></div>
      <div className="pn"><div className="form-grid">
        <div className="form-group"><label>Dealer</label><select><option value=''>Select...</option>{opDealers.map((d:any)=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="form-group"><label>Related Claim</label><select><option value=''>None</option>{opClaims.map((cl:any)=><option key={cl.id} value={cl.id}>{cl.claimNumber}</option>)}</select></div>
        <div className="form-group full"><label>Items Needed</label><textarea placeholder="List parts needed, part numbers if known, quantities..."></textarea></div>
        <div className="form-group"><label>Priority</label><select><option>Normal</option><option>Urgent</option></select></div>
        <div className="form-group"><label>Preferred Source</label><input placeholder="e.g. Jayco Direct, RV Wholesale" /></div>
        <div className="form-group full"><label>Notes</label><textarea placeholder="Shipping instructions, dealer preferences..."></textarea></div>
      </div><div className="btn-bar"><button className="btn btn-p" onClick={() => navigate('svc-parts')}>Create Order</button><button className="btn btn-o" onClick={() => navigate('svc-parts')}>Cancel</button></div></div>
    </div>
  );
}
