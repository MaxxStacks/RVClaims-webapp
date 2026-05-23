import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function Dashboard() {
  const [, navigate] = useLocation();
  const [opClaims, setOpClaims] = useState<any[]>([]);
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [opBatches, setOpBatches] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiFetch<any>('/api/v6/claims'), apiFetch<any>('/api/v6/dealerships')])
      .then(([cd, dd]) => { setOpClaims(Array.isArray(cd) ? cd : []); setOpDealers(Array.isArray(dd) ? dd : []); })
      .catch(err => setDataError(err?.message || 'Failed to load'));
    apiFetch<any>('/api/batches?status=uploaded').then(d => setOpBatches(d.batches || [])).catch(() => {});
  }, []);

  const pendingDealerCount = opDealers.filter((d: any) => d.status === 'pending').length;
  const activeDealerCount = opDealers.filter((d: any) => d.status === 'active').length;
  const staleClaimCount = opClaims.filter((c: any) => c.updatedAt && (Date.now() - new Date(c.updatedAt).getTime()) > 36 * 3600 * 1000).length;

  return (
    <div className="page active">
      <div className="al-g">
        <div className="al"><div className="al-i ur"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div className="al-c"><div className="al-t">{pendingDealerCount} dealer{pendingDealerCount !== 1 ? "s" : ""} pending approval</div><div className="al-d">New signups awaiting verification</div></div><span className="al-a" onClick={() => navigate('dealers')}>Review</span></div>
        <div className="al"><div className="al-i wa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div className="al-c"><div className="al-t">{staleClaimCount} stale claim{staleClaimCount !== 1 ? "s" : ""}</div><div className="al-d">No update in 36+ hours</div></div><span className="al-a" onClick={() => navigate('stale')}>View</span></div>
        <div className="al"><div className="al-i in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div className="al-c"><div className="al-t">{opBatches.length} photo batch{opBatches.length !== 1 ? "es" : ""} in queue</div><div className="al-d">Awaiting review & FRC sorting</div></div><span className="al-a" onClick={() => navigate('queue')}>Process</span></div>
      </div>
      <div className="stats-grid">
        <div className="sc"><div className="sc-h"><span className="sc-l">Active Claims</span><div className="sc-i bl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg></div></div><div className="sc-v">{opClaims.length}</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">Approval Rate</span><div className="sc-i gr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div></div><div className="sc-v">—</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">Revenue (MTD)</span><div className="sc-i pu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div></div><div className="sc-v">—</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">Active Dealers</span><div className="sc-i am"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div></div><div className="sc-v">{activeDealerCount}</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">Service Requests</span><div className="sc-i re"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg></div></div><div className="sc-v">—</div><div className="sc-c up">Financing, F&I, Parts</div></div>
      </div>
      <div className="qg">
        <div className="qb" onClick={() => navigate('queue')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span className="qb-t">Process Batch</span></div>
        <div className="qb" onClick={() => navigate('add-dealer')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg><span className="qb-t">Add Dealer</span></div>
        <div className="qb" onClick={() => navigate('notifications')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg><span className="qb-t">Send Notification</span></div>
        <div className="qb" onClick={() => navigate('create-invoice')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg><span className="qb-t">Create Invoice</span></div>
      </div>
      <div className="pg pg-2">
        <div className="pn"><div className="pn-h"><span className="pn-t">Recent Claims</span><span className="pn-a" onClick={() => navigate('claims')}>View all</span></div><div className="tw"><table><thead><tr><th>Claim #</th><th>Dealer</th><th>Mfr</th><th>Type</th><th>Status</th><th>Submitted</th></tr></thead><tbody>
          {opClaims.length === 0 ? (
            <tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : 'No claims yet'}</td></tr>
          ) : opClaims.slice(0,4).map((c: any) => (
            <tr key={c.id}><td><span className="cid" onClick={() => navigate(`claim-detail`)}>{c.claimNumber}</span></td><td>{c.dealershipId?.slice(0,8)}…</td><td><span className="mfr">{c.manufacturer}</span></td><td>{c.type}</td><td><span className={`bg ${c.status?.replace('_','-')}`}>{c.status}</span></td><td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : new Date(c.createdAt).toLocaleDateString()}</td></tr>
          ))}
        </tbody></table></div></div>
        <div className="pn"><div className="pn-h"><span className="pn-t">Activity</span></div><div className="act">
          <div style={{textAlign:'center',padding:'32px 0',color:'#888',fontSize:13}}>No recent activity</div>
        </div></div>
      </div>
    </div>
  );
}
