// client/src/pages/exclusive/dealer-owner/DealJacketList.tsx
// Route: /:dealerId/owner/deal-jackets

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

interface DealJacketSummary {
  id: string;
  unitId: string;
  customerId: string;
  dealershipId: string;
  saleDate: string | null;
  status: 'incomplete' | 'complete';
  completenessScore: number;
  createdAt: string;
  customerName: string;
  unitVin: string | null;
  unitLabel: string;
}

export default function DealJacketList() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [jackets, setJackets] = useState<DealJacketSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState<'all' | 'complete' | 'incomplete'>('all');

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadJackets = async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const params = new URLSearchParams({ limit: '50', page: '1' });
      if (search) params.set('search', search);
      if (filterStatus !== 'all') params.set('status', filterStatus);
      const data = await apiFetch<any>(`/api/deal-jackets?${params}`);
      setJackets(Array.isArray(data.jackets) ? data.jackets : []);
      setTotal(data.total || 0);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load deal jackets');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => { loadJackets(); }, [search, filterStatus]);

  // Navigate to jacket detail
  const openJacket = (jacket: DealJacketSummary) => {
    const segs = location.split('/').filter(Boolean);
    const base = segs.length >= 2 ? `/${segs[0]}/${segs[1]}` : '';
    navigate(`${base}/customers/${jacket.customerId}/jacket/${jacket.id}`);
  };

  const fmtDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
  };

  return (
    <div className="page-container" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, gap: 12, flexWrap: 'wrap' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#033280" strokeWidth="2">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
          <h1 style={{ margin: 0, fontSize: 22, fontWeight: 700, color: 'var(--text, #111)' }}>
            {t('dealJacket.dealJackets')}
          </h1>
          {!isLoading && (
            <span style={{ background: '#033280', color: '#fff', borderRadius: 12, fontSize: 11, fontWeight: 700, padding: '2px 8px' }}>
              {total}
            </span>
          )}
        </div>
        <input
          type="text"
          placeholder="Search by customer name or VIN…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          style={{
            padding: '7px 12px', borderRadius: 7, border: '1px solid var(--border, #e0e0e0)',
            fontSize: 13, minWidth: 220, background: 'var(--bg-card, #fff)', color: 'var(--text, #222)',
          }}
        />
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 6, marginBottom: 16 }}>
        {(['all', 'complete', 'incomplete'] as const).map((f) => (
          <button
            key={f}
            onClick={() => setFilterStatus(f)}
            style={{
              padding: '5px 14px', borderRadius: 20, border: 'none', cursor: 'pointer', fontSize: 12, fontWeight: 600,
              background: filterStatus === f ? '#033280' : 'var(--bg-secondary, #f4f6fb)',
              color: filterStatus === f ? '#fff' : 'var(--text-muted, #666)',
              transition: 'all 0.15s',
            }}
          >
            {f === 'all' ? 'All' : f.charAt(0).toUpperCase() + f.slice(1)}
          </button>
        ))}
      </div>

      {/* Loading */}
      {isLoading && (
        <div style={{ textAlign: 'center', padding: '48px 0', color: '#888', fontSize: 14 }}>
          Loading deal jackets…
        </div>
      )}

      {/* Error */}
      {dataError && (
        <div style={{ background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, padding: '12px 16px', color: '#dc2626', fontSize: 13 }}>
          {dataError}
        </div>
      )}

      {/* Empty state */}
      {!isLoading && !dataError && jackets.length === 0 && (
        <div style={{ textAlign: 'center', padding: '60px 24px', color: '#999' }}>
          <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom: 16 }}>
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#6b7280', marginBottom: 6 }}>
            {t('dealJacket.dealJackets')}
          </div>
          <div style={{ fontSize: 13, color: '#9ca3af' }}>
            No deal jackets yet. Jackets are created automatically when a unit is marked as sold.
          </div>
        </div>
      )}

      {/* Jacket list */}
      {!isLoading && !dataError && jackets.length > 0 && (
        <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e8e8e8)', borderRadius: 10, overflow: 'hidden' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary, #f8f9fb)' }}>
                {['Customer', 'Unit', 'Sale Date', 'Status', 'Completeness', ''].map((h) => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #666)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border, #e8e8e8)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {jackets.map((jk, idx) => (
                <tr
                  key={jk.id}
                  style={{ borderBottom: '1px solid var(--border, #f0f0f0)', cursor: 'pointer', transition: 'background 0.1s' }}
                  onMouseEnter={(e) => (e.currentTarget.style.background = 'var(--bg-secondary, #f8f9fb)')}
                  onMouseLeave={(e) => (e.currentTarget.style.background = 'transparent')}
                  onClick={() => openJacket(jk)}
                >
                  <td style={{ padding: '12px 14px', fontSize: 13, fontWeight: 600, color: 'var(--text, #111)' }}>
                    {jk.customerName}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted, #555)' }}>
                    <div style={{ fontWeight: 600, color: 'var(--text, #222)' }}>{jk.unitLabel || '—'}</div>
                    {jk.unitVin && <div style={{ fontSize: 11, color: '#888', fontFamily: 'monospace' }}>{jk.unitVin}</div>}
                  </td>
                  <td style={{ padding: '12px 14px', fontSize: 12, color: 'var(--text-muted, #555)' }}>
                    {fmtDate(jk.saleDate)}
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <span style={{
                      display: 'inline-block', padding: '3px 10px', borderRadius: 12, fontSize: 11, fontWeight: 700,
                      background: jk.status === 'complete' ? '#dcfce7' : '#fff7ed',
                      color: jk.status === 'complete' ? '#16a34a' : '#d97706',
                    }}>
                      {jk.status === 'complete' ? t('dealJacket.jacketComplete') : t('dealJacket.jacketIncomplete')}
                    </span>
                  </td>
                  <td style={{ padding: '12px 14px', minWidth: 120 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                      <div style={{ flex: 1, height: 6, background: '#e5e7eb', borderRadius: 3, overflow: 'hidden' }}>
                        <div style={{
                          height: '100%', borderRadius: 3, transition: 'width 0.3s',
                          width: `${jk.completenessScore}%`,
                          background: jk.completenessScore === 100 ? '#22c55e' : jk.completenessScore >= 60 ? '#f59e0b' : '#ef4444',
                        }} />
                      </div>
                      <span style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #555)', whiteSpace: 'nowrap' }}>
                        {jk.completenessScore}%
                      </span>
                    </div>
                  </td>
                  <td style={{ padding: '12px 14px' }}>
                    <button
                      onClick={(e) => { e.stopPropagation(); openJacket(jk); }}
                      style={{
                        padding: '5px 14px', borderRadius: 6, border: '1px solid #033280', background: 'transparent',
                        color: '#033280', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                      }}
                    >
                      {t('dealJacket.openJacket')}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#fff',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999,
          boxShadow: '0 4px 16px rgba(0,0,0,.2)',
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
