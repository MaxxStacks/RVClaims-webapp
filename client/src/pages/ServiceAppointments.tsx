import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const APPT_STATUS_STYLES: Record<string, { bg: string; color: string }> = {
  requested:   { bg: '#fef3c7', color: '#d97706' },
  scheduled:   { bg: '#dbeafe', color: '#2563eb' },
  confirmed:   { bg: '#d1fae5', color: '#059669' },
  in_progress: { bg: '#fef3c7', color: '#f97316' },
  completed:   { bg: '#dcfce7', color: '#16a34a' },
  cancelled:   { bg: '#f3f4f6', color: '#6b7280' },
  no_show:     { bg: '#fee2e2', color: '#dc2626' },
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function ServiceAppointments() {
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tabFilter, setTabFilter] = useState<'upcoming' | 'completed' | 'all'>('upcoming');
  const [cancellingId, setCancellingId] = useState<string | null>(null);

  const role = user?.role || '';
  const isOperator = role === 'operator_admin' || role === 'operator_staff';
  const canManage = isOperator || role === 'service_manager';

  useEffect(() => {
    if (!user?.id) return;
    const did = user?.dealershipId;
    const params = new URLSearchParams();
    if (did && !isOperator) params.set('dealershipId', did);
    if (role === 'client') params.set('customerId', user.id);
    apiFetch<any[]>(`/api/service-appointments?${params}`)
      .then(d => setAppts(Array.isArray(d) ? d : []))
      .catch(() => setAppts([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const UPCOMING_STATUSES = ['requested', 'scheduled', 'confirmed', 'in_progress'];

  const displayed = appts.filter(a => {
    if (tabFilter === 'upcoming') return UPCOMING_STATUSES.includes(a.status);
    if (tabFilter === 'completed') return a.status === 'completed' || a.status === 'no_show';
    return true;
  });

  const handleCancel = async (id: string) => {
    setCancellingId(id);
    try {
      await apiFetch(`/api/service-appointments/${id}`, { method: 'DELETE' });
      setAppts(prev => prev.map(a => a.id === id ? { ...a, status: 'cancelled' } : a));
    } catch {
      // silently fail
    } finally {
      setCancellingId(null);
    }
  };

  const handleConfirm = async (id: string) => {
    try {
      const updated = await apiFetch<any>(`/api/service-appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'confirmed' }),
      });
      setAppts(prev => prev.map(a => a.id === id ? updated : a));
    } catch {
      // silently fail
    }
  };

  return (
    <div className="page active">
      <div className="tabs" style={{ marginBottom: 0 }}>
        <div className={`tab ${tabFilter === 'upcoming' ? 'active' : ''}`} onClick={() => setTabFilter('upcoming')}>
          Upcoming ({appts.filter(a => UPCOMING_STATUSES.includes(a.status)).length})
        </div>
        <div className={`tab ${tabFilter === 'completed' ? 'active' : ''}`} onClick={() => setTabFilter('completed')}>
          Completed ({appts.filter(a => a.status === 'completed' || a.status === 'no_show').length})
        </div>
        <div className={`tab ${tabFilter === 'all' ? 'active' : ''}`} onClick={() => setTabFilter('all')}>
          All ({appts.length})
        </div>
      </div>
      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>}
        {!loading && displayed.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>
            No appointments found.
          </div>
        )}
        {!loading && displayed.length > 0 && (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Appt #</th>
                  <th>Unit</th>
                  <th>Issue</th>
                  <th>Status</th>
                  <th>Preferred Date</th>
                  <th>Confirmed Date</th>
                  {canManage && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {displayed.map((a: any) => {
                  const style = APPT_STATUS_STYLES[a.status] || { bg: '#f3f4f6', color: '#6b7280' };
                  const preferredDate = a.preferredDates?.[0] ? fmtDate(a.preferredDates[0]) : '—';
                  return (
                    <tr key={a.id}>
                      <td style={{ fontWeight: 500, color: 'var(--brand)' }}>{a.appointmentNumber || a.id.slice(0, 8).toUpperCase()}</td>
                      <td>{a.unitId?.slice(0, 8).toUpperCase() || '—'}</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                        {a.issueDescription || '—'}
                      </td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>
                          {a.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </td>
                      <td>{preferredDate}</td>
                      <td>{fmtDate(a.confirmedDate)}</td>
                      {canManage && (
                        <td>
                          <div style={{ display: 'flex', gap: 6 }}>
                            {a.status === 'requested' && (
                              <button className="btn btn-s btn-sm" onClick={() => handleConfirm(a.id)}>Confirm</button>
                            )}
                            {(a.status === 'requested' || a.status === 'scheduled') && (
                              <button
                                className="btn btn-o btn-sm"
                                style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                                disabled={cancellingId === a.id}
                                onClick={() => handleCancel(a.id)}
                              >
                                Cancel
                              </button>
                            )}
                          </div>
                        </td>
                      )}
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
