import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function DealerManagement() {
  const [, navigate] = useLocation();
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [dealersSearch, setDealersSearch] = useState('');
  const [dealersPlan, setDealersPlan] = useState('');

  useEffect(() => {
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(err => setDataError(err?.message || 'Failed to load'));
  }, []);

  const pendingDealerCount = opDealers.filter((d: any) => d.status === 'pending').length;

  const filteredDealers = opDealers.filter(d => {
    const s = dealersSearch.toLowerCase();
    if (s && !d.name?.toLowerCase().includes(s) && !d.contactName?.toLowerCase().includes(s)) return false;
    if (dealersPlan && d.plan !== dealersPlan) return false;
    return true;
  });

  const handleApproveDealership = async (id: string) => {
    try {
      await apiFetch(`/api/v6/dealerships/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'active' }) });
      const d = await apiFetch<any>('/api/v6/dealerships');
      setOpDealers(Array.isArray(d) ? d : []);
    } catch {}
  };

  return (
    <div className="page active">
      <div className="tabs"><div className="tab active">Active ({opDealers.filter((d:any)=>d.status==='active').length})</div><div className="tab">Pending ({pendingDealerCount})</div><div className="tab">Suspended ({opDealers.filter((d:any)=>d.status==='suspended').length})</div></div>
      <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}><div className="filter-bar"><input type="text" placeholder="Search dealers..." value={dealersSearch} onChange={e => setDealersSearch(e.target.value)} /><select value={dealersPlan} onChange={e => setDealersPlan(e.target.value)}><option value="">All Plans</option><option value="plan_a">Plan A</option><option value="plan_b">Plan B</option></select><div style={{marginLeft: 'auto'}}><button className="btn btn-p btn-sm" onClick={() => navigate('add-dealer')}>+ Add Dealer</button></div></div>
        <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Plan</th><th>Claims (MTD)</th><th>Revenue (MTD)</th><th>Services</th><th>Status</th><th>Action</th></tr></thead><tbody>
          {filteredDealers.length === 0 ? (
            <tr><td colSpan={8} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : opDealers.length === 0 ? 'No dealers found' : 'No results match your filters'}</td></tr>
          ) : filteredDealers.map((d: any) => (
            <tr key={d.id}><td style={{fontWeight:500}}><span className="cid" onClick={() => navigate('dealer-detail')}>{d.name}</span></td><td>{d.contactName || '—'}<br /><span style={{fontSize:11,color:'#888'}}>{d.contactEmail || d.email}</span></td><td>{d.plan === 'plan_b' ? 'Plan B · Wallet' : `Plan A · $${d.monthlyFee || 349}/mo`}</td><td>—</td><td>—</td><td>—</td><td><span className={`bg ${d.status}`}>{d.status}</span></td><td>{d.status === 'pending' ? <button className="btn btn-s btn-sm" onClick={() => handleApproveDealership(d.id)}>Approve</button> : <button className="btn btn-o btn-sm" onClick={() => navigate('dealer-detail')}>Manage</button>}</td></tr>
          ))}
        </tbody></table></div></div>
    </div>
  );
}
