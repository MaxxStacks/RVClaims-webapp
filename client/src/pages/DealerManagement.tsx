import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

export default function DealerManagement() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const isOperatorAdmin = user?.role === 'operator_admin';
  const isOperator = user?.role === 'operator_admin' || user?.role === 'operator_staff';

  const [dealers, setDealers] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [loading, setLoading] = useState(true);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const load = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (search) params.set('search', search);
      if (statusFilter) params.set('status', statusFilter);
      const data = await apiFetch<any>(`/api/v6/dealerships?${params}`);
      setDealers(Array.isArray(data) ? data : data?.dealerships || []);
      setDataError(null);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load dealers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOperator) load();
  }, [search, statusFilter, isOperator]);

  // Derive base route prefix for navigation
  const basePath = location.startsWith('/operator/admin') ? '/operator/admin' : '/operator/staff';

  if (!isOperator) {
    return <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#dc2626', fontWeight: 600, fontSize: 16 }}>Access Denied</div>;
  }

  const handleStatusChange = async (id: string, status: string) => {
    try {
      await apiFetch(`/api/v6/dealerships/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast(`Dealer ${status === 'active' ? 'activated' : 'suspended'}`);
      load();
    } catch {
      showToast('Failed to update status');
    }
  };

  const activeCount = dealers.filter(d => d.status === 'active').length;
  const pendingCount = dealers.filter(d => d.status === 'pending').length;
  const suspendedCount = dealers.filter(d => d.status === 'suspended').length;

  const filtered = dealers.filter(d => {
    const s = search.toLowerCase();
    if (s && !d.name?.toLowerCase().includes(s) && !d.contactName?.toLowerCase().includes(s) && !d.email?.toLowerCase().includes(s)) return false;
    if (statusFilter && d.status !== statusFilter) return false;
    return true;
  });

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
          {toastMsg}
        </div>
      )}

      <div className="tabs">
        <div className={`tab${!statusFilter ? ' active' : ''}`} onClick={() => setStatusFilter('')}>All ({dealers.length})</div>
        <div className={`tab${statusFilter === 'active' ? ' active' : ''}`} onClick={() => setStatusFilter('active')}>Active ({activeCount})</div>
        <div className={`tab${statusFilter === 'pending' ? ' active' : ''}`} onClick={() => setStatusFilter('pending')}>Pending ({pendingCount})</div>
        <div className={`tab${statusFilter === 'suspended' ? ' active' : ''}`} onClick={() => setStatusFilter('suspended')}>Suspended ({suspendedCount})</div>
      </div>

      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search dealers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          {isOperatorAdmin && (
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-p btn-sm" onClick={() => navigate(`${basePath}/dealers/new`)}>
                + {t('dealers.addDealer')}
              </button>
            </div>
          )}
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>{t('dealers.dealerName')}</th>
                <th>{t('dealers.contact')}</th>
                <th>{t('dealers.plan')}</th>
                <th>{t('nav.units')}</th>
                <th>{t('nav.claims')}</th>
                <th>{t('common.status')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>{t('common.loading')}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{ textAlign: 'center', padding: 24, color: '#888' }}>{dataError ? dataError : dealers.length === 0 ? 'No dealers found' : 'No results match your filters'}</td></tr>
              ) : filtered.map((d: any) => (
                <tr key={d.id}>
                  <td style={{ fontWeight: 500 }}>
                    <span className="cid" onClick={() => navigate(`${basePath}/dealers/${d.id}`)}>
                      {d.name}
                    </span>
                  </td>
                  <td>
                    {d.contactName || '—'}
                    <br />
                    <span style={{ fontSize: 11, color: '#888' }}>{d.contactEmail || d.email}</span>
                  </td>
                  <td>{d.plan === 'plan_b' ? 'Plan B · Wallet' : `Plan A · $${d.monthlyFee || '349'}/mo`}</td>
                  <td>{d.unitCount ?? '—'}</td>
                  <td>{d.claimCount ?? '—'}</td>
                  <td>
                    <span className={`bg ${d.status}`}>{d.status}</span>
                  </td>
                  <td>
                    {isOperatorAdmin && d.status === 'pending' && (
                      <button className="btn btn-s btn-sm" onClick={() => handleStatusChange(d.id, 'active')}>{t('common.approve')}</button>
                    )}
                    {isOperatorAdmin && d.status === 'active' && (
                      <>
                          <button className="btn btn-o btn-sm" onClick={() => navigate(`${basePath}/dealers/${d.id}`)}>{t('common.manage')}</button>{' '}
                        <button className="btn btn-d btn-sm" style={{ marginLeft: 4 }} onClick={() => handleStatusChange(d.id, 'suspended')}>{t('common.suspend')}</button>
                      </>
                    )}
                    {isOperatorAdmin && d.status === 'suspended' && (
                      <>
                          <button className="btn btn-s btn-sm" onClick={() => handleStatusChange(d.id, 'active')}>{t('common.reactivate')}</button>{' '}
                        <button className="btn btn-o btn-sm" style={{ marginLeft: 4 }} onClick={() => navigate(`${basePath}/dealers/${d.id}`)}>{t('common.view')}</button>
                      </>
                    )}
                    {!isOperatorAdmin && (
                      <button className="btn btn-o btn-sm" onClick={() => navigate(`${basePath}/dealers/${d.id}`)}>{t('common.view')}</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
