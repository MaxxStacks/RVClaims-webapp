import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import PrintButton from '@/components/PrintButton';
import PrintHeader from '@/components/PrintHeader';

export default function Claims() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [opClaims, setOpClaims] = useState<any[]>([]);
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [claimsSearch, setClaimsSearch] = useState('');
  const [claimsStatus, setClaimsStatus] = useState('');
  const [claimsMfr, setClaimsMfr] = useState('');
  const [claimsDealer, setClaimsDealer] = useState('');

  const isOperator = user?.role === 'operator_admin' || user?.role === 'operator_staff';
  const isPartsManager = user?.role === 'parts_dept';

  useEffect(() => {
    apiFetch<any>('/api/claims').then(d => setOpClaims(Array.isArray(d) ? d : [])).catch(err => setDataError(err?.message || 'Failed to load'));
    // Only fetch dealerships list for operators (used by the dealer filter dropdown)
    if (isOperator) {
      apiFetch<any>('/api/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
    }
  }, [isOperator]);

  const filteredClaims = opClaims.filter(c => {
    const s = claimsSearch.toLowerCase();
    if (s && !c.claimNumber?.toLowerCase().includes(s) && !c.unitId?.toLowerCase().includes(s)) return false;
    if (claimsStatus && c.status !== claimsStatus) return false;
    if (claimsMfr && c.manufacturer !== claimsMfr) return false;
    if (claimsDealer && c.dealershipId !== claimsDealer) return false;
    return true;
  });

  const printDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page active">
      {/* Print header — visible only in print output */}
      <PrintHeader
        title="Claims Report"
        subtitle={`${filteredClaims.length} claim${filteredClaims.length !== 1 ? 's' : ''} · ${printDate}`}
      />

      {isPartsManager && (
        <div style={{ fontSize: 13, color: '#666', marginBottom: 12 }}>
          Showing claims with parts requirements for your dealership.
        </div>
      )}
      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">{t('nav.claims')}</span>
          <PrintButton title={`Claims Report — ${printDate}`} />
        </div>
        <div className="filter-bar"><input type="text" placeholder="Search claims..." value={claimsSearch} onChange={e => setClaimsSearch(e.target.value)} /><select value={claimsStatus} onChange={e => setClaimsStatus(e.target.value)}><option value="">All Statuses</option><option value="submitted">Submitted</option><option value="authorized">Authorized</option><option value="denied">Denied</option><option value="parts_ordered">Parts Ordered</option><option value="completed">Completed</option><option value="payment_received">Payment Received</option></select><select value={claimsMfr} onChange={e => setClaimsMfr(e.target.value)}><option value="">All Manufacturers</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select>{isOperator && (<select value={claimsDealer} onChange={e => setClaimsDealer(e.target.value)}><option value="">All Dealers</option>{opDealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select>)}</div>
        <div className="tw"><table><thead><tr><th><input type="checkbox" /></th><th>{t('claims.claimNumber')}</th><th>{t('claims.dealer')}</th><th>{t('claims.vin')}</th><th>{t('claims.manufacturer')}</th><th>{t('common.type')}</th><th>{t('claims.lines')}</th><th>{t('common.status')}</th><th>{t('common.amount')}</th><th>{t('claims.updated')}</th></tr></thead><tbody>
          {filteredClaims.length === 0 ? (
            <tr><td colSpan={10} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : opClaims.length === 0 ? 'No claims found' : 'No results match your filters'}</td></tr>
          ) : filteredClaims.map((c: any) => (
            <tr key={c.id}><td><input type="checkbox" /></td><td><span className="cid" onClick={() => navigate(`${c.id}`)}>{c.claimNumber}</span></td><td>{c.dealershipName || c.dealershipId?.slice(0,8) + '…'}</td><td><span className="vin">{c.unitId ? '…' + c.unitId.slice(-4) : '—'}</span></td><td><span className="mfr">{c.manufacturer}</span></td><td>{c.type}</td><td>—</td><td><span className={`bg ${c.status?.replace(/_/g,'-')}`}>{c.status?.replace(/_/g,' ')}</span></td><td>{c.estimatedAmount ? `$${parseFloat(c.estimatedAmount).toLocaleString()}` : '—'}</td><td>{new Date(c.updatedAt).toLocaleDateString()}</td></tr>
          ))}
        </tbody></table></div></div>
    </div>
  );
}
