import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

const CLAIM_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  draft:     { bg: '#f3f4f6', color: '#6b7280' },
  submitted: { bg: '#dbeafe', color: '#2563eb' },
  in_review: { bg: '#e0e7ff', color: '#4338ca' },
  approved:  { bg: '#dcfce7', color: '#16a34a' },
  denied:    { bg: '#fee2e2', color: '#dc2626' },
  partial:   { bg: '#fef3c7', color: '#d97706' },
  closed:    { bg: '#f1f5f9', color: '#94a3b8' },
};

const WO_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  unassigned:    { bg: '#f3f4f6', color: '#6b7280' },
  assigned:      { bg: '#dbeafe', color: '#1d4ed8' },
  in_progress:   { bg: '#fef3c7', color: '#d97706' },
  blocked_parts: { bg: '#fee2e2', color: '#dc2626' },
  completed:     { bg: '#dcfce7', color: '#16a34a' },
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

export default function WorkByDealer() {
  const [, navigate] = useLocation();
  const [dealers, setDealers] = useState<any[]>([]);
  const [selectedId, setSelectedId] = useState('');
  const [dealer, setDealer] = useState<any>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loadingDealers, setLoadingDealers] = useState(true);
  const [loadingData, setLoadingData] = useState(false);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'claims' | 'workorders'>('claims');

  // Load dealer list
  useEffect(() => {
    apiFetch<any>('/api/dealerships')
      .then(d => {
        const rows = Array.isArray(d) ? d : d.dealerships || [];
        setDealers(rows);
      })
      .catch(() => setDealers([]))
      .finally(() => setLoadingDealers(false));
  }, []);

  // Load data for selected dealer
  useEffect(() => {
    if (!selectedId) { setClaims([]); setWorkOrders([]); setDealer(null); return; }
    setLoadingData(true);
    setError('');
    Promise.all([
      apiFetch<any>(`/api/dealerships/${selectedId}`).catch(() => null),
      apiFetch<any[]>(`/api/claims?dealershipId=${selectedId}&limit=50`).catch(() => []),
      apiFetch<any[]>(`/api/work-orders?dealershipId=${selectedId}`).catch(() => []),
    ]).then(([dl, cl, wo]) => {
      setDealer((dl as any)?.dealership || dl || null);
      const clAny = cl as any;
      setClaims(Array.isArray(clAny) ? clAny : clAny?.claims || []);
      setWorkOrders(Array.isArray(wo) ? wo : []);
    }).catch(() => setError('Failed to load dealer data.')).finally(() => setLoadingData(false));
  }, [selectedId]);

  const openClaims  = claims.filter(c => !['closed', 'denied'].includes(c.status));
  const openWOs     = workOrders.filter(w => !['completed', 'cancelled', 'invoiced'].includes(w.status));
  const unassignedWOs = workOrders.filter(w => w.status === 'unassigned');

  return (
    <div className="page active">
      {/* Dealer Selector */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div className="pn-h"><span className="pn-t">Select Dealer</span></div>
        <div style={{ padding: '16px 20px' }}>
          {loadingDealers ? (
            <div style={{ color: '#888', fontSize: 13 }}>Loading dealers…</div>
          ) : (
            <select
              value={selectedId}
              onChange={e => setSelectedId(e.target.value)}
              style={{ width: '100%', maxWidth: 480, padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
            >
              <option value="">— Select a dealer —</option>
              {dealers.map((d: any) => (
                <option key={d.id} value={d.id}>{d.name} {d.city ? `(${d.city})` : ''}</option>
              ))}
            </select>
          )}
        </div>
      </div>

      {!selectedId && (
        <div className="pn" style={{ padding: '40px 20px', textAlign: 'center' }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom: 12 }}>
            <path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>
          </svg>
          <div style={{ fontSize: 14, color: '#888' }}>Select a dealer above to view their open claims and work orders.</div>
        </div>
      )}

      {selectedId && loadingData && (
        <div className="pn" style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading dealer data…</div>
      )}

      {selectedId && error && (
        <div className="pn" style={{ padding: 20, color: '#dc2626', fontSize: 13 }}>{error}</div>
      )}

      {selectedId && !loadingData && !error && (
        <>
          {/* Stats row */}
          {dealer && (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
              <div className="sc">
                <div className="sc-l" style={{ marginBottom: 8 }}>Open Claims</div>
                <div className="sc-v" style={{ color: '#2563eb' }}>{openClaims.length}</div>
              </div>
              <div className="sc">
                <div className="sc-l" style={{ marginBottom: 8 }}>Total Claims</div>
                <div className="sc-v">{claims.length}</div>
              </div>
              <div className="sc">
                <div className="sc-l" style={{ marginBottom: 8 }}>Open Work Orders</div>
                <div className="sc-v" style={{ color: '#d97706' }}>{openWOs.length}</div>
              </div>
              <div className="sc">
                <div className="sc-l" style={{ marginBottom: 8 }}>Unassigned WOs</div>
                <div className="sc-v" style={{ color: '#dc2626' }}>{unassignedWOs.length}</div>
              </div>
            </div>
          )}

          <div className="tabs" style={{ marginBottom: 0 }}>
            <div className={`tab ${tab === 'claims' ? 'active' : ''}`} onClick={() => setTab('claims')}>
              Claims ({openClaims.length} open)
            </div>
            <div className={`tab ${tab === 'workorders' ? 'active' : ''}`} onClick={() => setTab('workorders')}>
              Work Orders ({openWOs.length} open)
            </div>
          </div>

          <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
            {tab === 'claims' && (
              <>
                {claims.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>
                    No claims for this dealer.
                  </div>
                ) : (
                  <div className="tw">
                    <table>
                      <thead>
                        <tr><th>Claim #</th><th>Type</th><th>Status</th><th>Submitted</th><th>Updated</th><th></th></tr>
                      </thead>
                      <tbody>
                        {claims.map((c: any) => {
                          const style = CLAIM_STATUS_STYLE[c.status] || { bg: '#f3f4f6', color: '#6b7280' };
                          return (
                            <tr key={c.id}>
                              <td style={{ fontWeight: 500, color: 'var(--brand)', fontFamily: 'monospace', fontSize: 12 }}>
                                {c.claimNumber || c.id.slice(0, 8).toUpperCase()}
                              </td>
                              <td style={{ textTransform: 'capitalize', fontSize: 12 }}>{c.claimType || c.type || '—'}</td>
                              <td>
                                <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>
                                  {c.status ? c.status.charAt(0).toUpperCase() + c.status.slice(1) : '—'}
                                </span>
                              </td>
                              <td style={{ fontSize: 12, color: '#9ca3af' }}>{fmtDate(c.submittedAt || c.createdAt)}</td>
                              <td style={{ fontSize: 12, color: '#9ca3af' }}>{fmtDate(c.updatedAt)}</td>
                              <td>
                                <span
                                  className="cid"
                                  onClick={() => navigate(`/operator/admin/claims/${c.id}`)}
                                >
                                  View
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}

            {tab === 'workorders' && (
              <>
                {workOrders.length === 0 ? (
                  <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>
                    No work orders for this dealer.
                  </div>
                ) : (
                  <div className="tw">
                    <table>
                      <thead>
                        <tr><th>WO #</th><th>Notes</th><th>Status</th><th>Tech Assigned</th><th>Scheduled</th></tr>
                      </thead>
                      <tbody>
                        {workOrders.map((w: any) => {
                          const style = WO_STATUS_STYLE[w.status] || { bg: '#f3f4f6', color: '#6b7280' };
                          return (
                            <tr key={w.id}>
                              <td style={{ fontWeight: 500, color: 'var(--brand)', fontFamily: 'monospace', fontSize: 12 }}>
                                {w.workOrderNumber || w.id.slice(0, 8).toUpperCase()}
                              </td>
                              <td style={{ maxWidth: 240, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', fontSize: 12 }}>
                                {w.notes || '—'}
                              </td>
                              <td>
                                <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>
                                  {w.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                                </span>
                              </td>
                              <td style={{ fontSize: 12, color: '#555' }}>
                                {w.assignedTechId ? w.assignedTechId.slice(0, 6).toUpperCase() : <span style={{ color: '#f59e0b', fontWeight: 600 }}>Unassigned</span>}
                              </td>
                              <td style={{ fontSize: 12, color: '#9ca3af' }}>{fmtDate(w.scheduledFor)}</td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </>
            )}
          </div>
        </>
      )}
    </div>
  );
}
