import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function WarrantyPlans() {
  const [, navigate] = useLocation();
  const [opDealers, setOpDealers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="page active">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Manage OEM and aftermarket warranty plans. Track coverage, renewals, and link to claims. <strong>We will sell plans directly.</strong></div><button className="btn btn-p btn-sm" onClick={() => navigate('svc-warranty-new')}>+ Add Warranty Plan</button></div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Plans</div><div className="sc-v" style={{color: "#2563eb"}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Expiring (30d)</div><div className="sc-v" style={{color: "#d97706"}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Plans Sold (MTD)</div><div className="sc-v" style={{color: "#22c55e"}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Sales Revenue (MTD)</div><div className="sc-v">—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Claims Linked</div><div className="sc-v">—</div></div>
      </div>
      <div className="tabs"><div className="tab active">All Plans (14)</div><div className="tab">Expiring Soon (3)</div><div className="tab">Plans for Sale</div><div className="tab">Providers</div></div>
      <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
        <div className="filter-bar"><input type="text" placeholder="Search by customer, VIN, or plan..." /><select><option>All Providers</option><option>Guardsman RV</option><option>XtraRide</option><option>Wholesale Warranties</option><option>Jayco OEM</option></select><select><option>All Dealers</option>{opDealers.map((d:any)=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="tw"><table><thead><tr><th>Plan #</th><th>Dealer</th><th>Customer</th><th>VIN</th><th>Provider</th><th>Coverage</th><th>Expiry</th><th>Claims</th><th>Sold By Us</th><th>Status</th></tr></thead><tbody>
          <tr><td colSpan={10} style={{textAlign:'center',padding:24,color:'#888'}}>No warranty plans yet</td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
