import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function Claims() {
  const [, navigate] = useLocation();
  const [opClaims, setOpClaims] = useState<any[]>([]);
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [claimsSearch, setClaimsSearch] = useState('');
  const [claimsStatus, setClaimsStatus] = useState('');
  const [claimsMfr, setClaimsMfr] = useState('');
  const [claimsDealer, setClaimsDealer] = useState('');

  useEffect(() => {
    apiFetch<any>('/api/v6/claims').then(d => setOpClaims(Array.isArray(d) ? d : [])).catch(err => setDataError(err?.message || 'Failed to load'));
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const filteredClaims = opClaims.filter(c => {
    const s = claimsSearch.toLowerCase();
    if (s && !c.claimNumber?.toLowerCase().includes(s) && !c.unitId?.toLowerCase().includes(s)) return false;
    if (claimsStatus && c.status !== claimsStatus) return false;
    if (claimsMfr && c.manufacturer !== claimsMfr) return false;
    if (claimsDealer && c.dealershipId !== claimsDealer) return false;
    return true;
  });

  return (
    <div className="page active">
      <div className="pn"><div className="filter-bar"><input type="text" placeholder="Search claims..." value={claimsSearch} onChange={e => setClaimsSearch(e.target.value)} /><select value={claimsStatus} onChange={e => setClaimsStatus(e.target.value)}><option value="">All Statuses</option><option value="submitted">Submitted</option><option value="authorized">Authorized</option><option value="denied">Denied</option><option value="parts_ordered">Parts Ordered</option><option value="completed">Completed</option><option value="payment_received">Payment Received</option></select><select value={claimsMfr} onChange={e => setClaimsMfr(e.target.value)}><option value="">All Manufacturers</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select><select value={claimsDealer} onChange={e => setClaimsDealer(e.target.value)}><option value="">All Dealers</option>{opDealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
        <div className="tw"><table><thead><tr><th><input type="checkbox" /></th><th>Claim #</th><th>Dealer</th><th>VIN</th><th>Mfr</th><th>Type</th><th>Lines</th><th>Status</th><th>Amount</th><th>Updated</th></tr></thead><tbody>
          {filteredClaims.length === 0 ? (
            <tr><td colSpan={10} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : opClaims.length === 0 ? 'No claims found' : 'No results match your filters'}</td></tr>
          ) : filteredClaims.map((c: any) => (
            <tr key={c.id}><td><input type="checkbox" /></td><td><span className="cid" onClick={() => navigate('claim-detail')}>{c.claimNumber}</span></td><td>{c.dealershipId?.slice(0,8)}…</td><td><span className="vin">…{c.unitId?.slice(-4)}</span></td><td><span className="mfr">{c.manufacturer}</span></td><td>{c.type}</td><td>—</td><td><span className={`bg ${c.status?.replace(/_/g,'-')}`}>{c.status}</span></td><td>{c.estimatedAmount ? `$${parseFloat(c.estimatedAmount).toLocaleString()}` : '—'}</td><td>{new Date(c.updatedAt).toLocaleDateString()}</td></tr>
          ))}
        </tbody></table></div></div>
    </div>
  );
}
