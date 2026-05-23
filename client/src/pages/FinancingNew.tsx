import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function FinancingNew() {
  const [, navigate] = useLocation();
  const [opDealers, setOpDealers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('svc-financing')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">New Financing Request</div><div className="detail-meta">Submit on behalf of a dealer</div></div></div>
      <div className="pn"><div className="form-grid">
        <div className="form-group"><label>Dealer</label><select><option value=''>Select dealer...</option>{opDealers.map((d:any)=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="form-group"><label>Customer Name</label><input placeholder="Full name" /></div>
        <div className="form-group"><label>Credit Score (if known)</label><input placeholder="e.g. 742" /></div>
        <div className="form-group"><label>Unit (VIN or description)</label><input placeholder="VIN or Year Make Model" /></div>
        <div className="form-group"><label>Requested Amount</label><input placeholder="$0.00" /></div>
        <div className="form-group"><label>Down Payment</label><input placeholder="$0.00" /></div>
        <div className="form-group"><label>Preferred Term</label><select><option>10 years</option><option>15 years</option><option>20 years</option></select></div>
        <div className="form-group full"><label>Notes</label><textarea placeholder="Any additional details from the dealer..."></textarea></div>
      </div><div className="btn-bar"><button className="btn btn-p" onClick={() => navigate('svc-financing')}>Create Request</button><button className="btn btn-o" onClick={() => navigate('svc-financing')}>Cancel</button></div></div>
    </div>
  );
}
