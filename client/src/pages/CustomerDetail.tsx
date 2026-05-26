import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

export default function CustomerDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ customerId?: string }>();
  const { user } = useAuth();

  const customerId = params.customerId || (() => {
    const segs = location.split('/').filter(Boolean);
    const idx = segs.indexOf('customers');
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  const [customer, setCustomer] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  useEffect(() => {
    if (!customerId) return;
    setIsLoading(true);
    apiFetch<any>(`/api/customers/${customerId}`)
      .then(d => { setCustomer(d.customer || d); setIsLoading(false); })
      .catch(err => { setDataError(err?.message || 'Failed to load customer'); setIsLoading(false); });
  }, [customerId]);

  const handleRevoke = async () => {
    if (!customer) return;
    if (!window.confirm(`Revoke portal access for ${customer.name}? They will no longer be able to log in.`)) return;
    try {
      await apiFetch(`/api/customers/${customer.id}`, { method: 'DELETE' });
      showToast('Access revoked');
      setTimeout(() => navigate('../customers'), 1200);
    } catch (err: any) {
      showToast(err?.message || 'Failed to revoke access');
    }
  };

  const handleResendInvite = async () => {
    if (!customer) return;
    try {
      await apiFetch('/api/customers/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: customer.email,
          unitId: customer.unit?.id,
          dealershipId: user?.dealershipId,
        }),
      });
      showToast('Invitation resent!');
    } catch (err: any) {
      showToast(err?.message || 'Failed to resend invitation');
    }
  };

  const { t } = useLanguage();
  const isDealerOwner = user?.role === 'dealer_owner';
  const isOperatorAdmin = user?.role === 'operator_admin';
  const canManage = isDealerOwner || isOperatorAdmin;

  // Deal jackets for this customer
  const [dealJackets, setDealJackets] = useState<any[]>([]);
  const [jacketsLoading, setJacketsLoading] = useState(false);
  useEffect(() => {
    if (!customerId || (!isDealerOwner && !isOperatorAdmin)) return;
    setJacketsLoading(true);
    apiFetch<any>(`/api/deal-jackets/by-customer/${customerId}`)
      .then(d => { setDealJackets(Array.isArray(d.jackets) ? d.jackets : []); })
      .catch(() => {})
      .finally(() => setJacketsLoading(false));
  }, [customerId, isDealerOwner, isOperatorAdmin]);

  const openJacket = (jk: any) => {
    const segs = location.split('/').filter(Boolean);
    const base = segs.length >= 2 ? `/${segs[0]}/${segs[1]}` : '';
    navigate(`${base}/customers/${jk.customerId}/jacket/${jk.id}`);
  };

  if (isLoading) return <div className="page active" style={{padding: 40, textAlign: 'center', color: '#888'}}>Loading...</div>;
  if (dataError) return <div className="page active" style={{padding: 40, textAlign: 'center', color: '#e53e3e'}}>{dataError}</div>;

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)'}}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('../customers')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">{customer?.name || 'Customer'}</div>
          <div className="detail-meta">{customer?.email}</div>
        </div>
        <span className={`bg ${customer?.isActive ? 'active' : 'inactive'}`} style={{fontSize: 13, padding: '6px 16px'}}>
          {customer?.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
        <div className="cd-section">
          <div className="cd-section-h">Customer Info</div>
          <div className="cd-row"><span className="cd-label">Name</span><span className="cd-value">{customer?.name}</span></div>
          <div className="cd-row"><span className="cd-label">Email</span><span className="cd-value">{customer?.email}</span></div>
          {customer?.phone && <div className="cd-row"><span className="cd-label">Phone</span><span className="cd-value">{customer.phone}</span></div>}
          <div className="cd-row"><span className="cd-label">Joined</span><span className="cd-value">{customer?.createdAt ? new Date(customer.createdAt).toLocaleDateString('en-CA', {month: 'long', day: 'numeric', year: 'numeric'}) : '—'}</span></div>
          <div className="cd-row"><span className="cd-label">Last Login</span><span className="cd-value">{customer?.lastLoginAt ? new Date(customer.lastLoginAt).toLocaleDateString('en-CA', {month: 'short', day: 'numeric', year: 'numeric'}) : 'Never'}</span></div>
        </div>

        {customer?.unit && (
          <div className="cd-section">
            <div className="cd-section-h">Linked Unit</div>
            <div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily: 'monospace', fontSize: 12}}>{customer.unit.vin}</span></div>
            <div className="cd-row"><span className="cd-label">Year</span><span className="cd-value">{customer.unit.year}</span></div>
            <div className="cd-row"><span className="cd-label">Make</span><span className="cd-value">{customer.unit.manufacturer}</span></div>
            <div className="cd-row"><span className="cd-label">Model</span><span className="cd-value">{customer.unit.model}</span></div>
          </div>
        )}
      </div>

      {canManage && (
        <div className="btn-bar" style={{marginTop: 20}}>
          <button className="btn btn-o btn-sm" onClick={handleResendInvite}>Resend Invite</button>
          {customer?.isActive && (
            <button className="btn btn-o btn-sm" style={{color: '#e53e3e', borderColor: '#e53e3e'}} onClick={handleRevoke}>
              Revoke Access
            </button>
          )}
        </div>
      )}

      {/* Deal Jackets section */}
      {(isDealerOwner || isOperatorAdmin) && (
        <div className="cd-section" style={{marginTop: 24}}>
          <div className="cd-section-h" style={{display: 'flex', alignItems: 'center', gap: 8}}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
            {t('dealJacket.dealJackets')}
            {dealJackets.length > 0 && (
              <span style={{background: '#033280', color: '#fff', borderRadius: 10, fontSize: 10, fontWeight: 700, padding: '1px 6px'}}>{dealJackets.length}</span>
            )}
          </div>
          {jacketsLoading ? (
            <div style={{padding: '16px 20px', color: '#888', fontSize: 13}}>Loading…</div>
          ) : dealJackets.length === 0 ? (
            <div style={{padding: '16px 20px', color: '#9ca3af', fontSize: 13}}>
              No deal jackets. Jackets are created automatically when a unit is marked as sold.
            </div>
          ) : (
            dealJackets.map((jk) => (
              <div key={jk.id} className="cd-row" style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 8}}>
                <div>
                  <div style={{fontSize: 13, fontWeight: 600, color: 'var(--text, #111)'}}>{jk.unitLabel || '—'}</div>
                  <div style={{fontSize: 11, color: '#888'}}>
                    {jk.unitVin && <span style={{fontFamily: 'monospace'}}>{jk.unitVin} · </span>}
                    {jk.saleDate ? new Date(jk.saleDate).toLocaleDateString('en-CA', {month: 'short', day: 'numeric', year: 'numeric'}) : 'No sale date'}
                  </div>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: 8}}>
                  <span style={{fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 700, background: jk.status === 'complete' ? '#dcfce7' : '#fff7ed', color: jk.status === 'complete' ? '#16a34a' : '#d97706'}}>
                    {jk.completenessScore}%
                  </span>
                  <button
                    onClick={() => openJacket(jk)}
                    style={{padding: '4px 12px', borderRadius: 6, border: '1px solid #033280', background: 'transparent', color: '#033280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit'}}
                  >
                    {t('dealJacket.openJacket')}
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
}
