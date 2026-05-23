import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function Financing() {
  const [, navigate] = useLocation();
  const [opDealers, setOpDealers] = useState<any[]>([]);

  useEffect(() => {
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  return (
    <div className="page active">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Dealers submit financing requests. You shop to lenders, track approvals, and update the dealer.</div><button className="btn btn-p btn-sm" onClick={() => navigate('svc-financing-new')}>+ New Financing Request</button></div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Requests</div><div className="sc-v" style={{color: "#2563eb"}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Approved (MTD)</div><div className="sc-v" style={{color: "#22c55e"}}>—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Total Financed (MTD)</div><div className="sc-v">—</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Avg Approval Time</div><div className="sc-v">—</div></div>
      </div>
      <div className="pn">
        <div className="filter-bar"><input type="text" placeholder="Search by customer or dealer..." /><select><option>All Statuses</option><option>New Request</option><option>Shopping Lenders</option><option>Approved</option><option>Declined</option><option>Funded</option></select><select><option>All Dealers</option>{opDealers.map((d:any)=><option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="tw"><table><thead><tr><th>Request #</th><th>Dealer</th><th>Customer</th><th>Unit</th><th>Amount</th><th>Lenders</th><th>Best Rate</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead><tbody>
          <tr><td colSpan={10} style={{textAlign:'center',padding:24,color:'#888'}}>No financing requests yet</td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
