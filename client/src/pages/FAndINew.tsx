import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function FAndINew() {
  const [, navigate] = useLocation();
  const [opDealers, setOpDealers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="page active">
      <div className="detail-header"><button className="detail-back" onClick={() => navigate('svc-fi')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">New F&I Deal</div><div className="detail-meta">Flag a deal for F&I product recommendations</div></div></div>
      <div className="pn"><div className="form-grid">
        <div className="form-group"><label>Dealer</label><select><option value=''>Select...</option>{opDealers.map((d:any)=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="form-group"><label>Customer</label><input placeholder="Customer name" /></div>
        <div className="form-group"><label>Unit</label><input placeholder="VIN or Year Make Model" /></div>
        <div className="form-group"><label>Sale Price</label><input placeholder="$0.00" /></div>
        <div className="form-group"><label>Financing Source</label><input placeholder="e.g. RBC 4.99%" /></div>
        <div className="form-group"><label>Delivery Date</label><input type="date" /></div>
        <div className="form-group full"><label>Notes / Customer Preferences</label><textarea placeholder="What is the customer open to? Budget constraints?"></textarea></div>
      </div><div className="btn-bar"><button className="btn btn-p" onClick={() => navigate('svc-fi')}>Create Deal</button><button className="btn btn-o" onClick={() => navigate('svc-fi')}>Cancel</button></div></div>
    </div>
  );
}
