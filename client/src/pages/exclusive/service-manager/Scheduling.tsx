import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
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
  return new Date(d).toLocaleDateString('en-CA', { weekday: 'short', month: 'short', day: 'numeric' });
}

export default function Scheduling() {
  const { user } = useAuth();
  const [appts, setAppts] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'appointments' | 'work-orders'>('appointments');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const did = user?.dealershipId;

  useEffect(() => {
    if (!did) return;
    setLoading(true);
    Promise.all([
      apiFetch<any[]>(`/api/service-appointments?dealershipId=${did}`).catch(() => []),
      apiFetch<any[]>(`/api/work-orders?dealershipId=${did}`).catch(() => []),
    ]).then(([a, w]) => {
      setAppts(Array.isArray(a) ? a : []);
      setWorkOrders(Array.isArray(w) ? w : []);
    }).finally(() => setLoading(false));
  }, [did]);

  const handleApptStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      const updated = await apiFetch<any>(`/api/service-appointments/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setAppts(prev => prev.map(a => a.id === id ? updated : a));
    } catch {
      // silently fail
    } finally {
      setUpdatingId(null);
    }
  };

  const upcoming = appts.filter(a => ['requested', 'scheduled', 'confirmed'].includes(a.status));
  const scheduledWOs = workOrders.filter(w => w.scheduledFor && ['unassigned', 'assigned'].includes(w.status));

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Pending Appts</div><div className="sc-v" style={{ color: '#d97706' }}>{appts.filter(a => a.status === 'requested').length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Confirmed</div><div className="sc-v" style={{ color: '#059669' }}>{appts.filter(a => a.status === 'confirmed').length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Scheduled WOs</div><div className="sc-v" style={{ color: '#2563eb' }}>{scheduledWOs.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Completed Today</div><div className="sc-v" style={{ color: '#22c55e' }}>{appts.filter(a => { if (a.status !== 'completed') return false; const d = new Date(a.updatedAt); const t = new Date(); return d.toDateString() === t.toDateString(); }).length}</div></div>
      </div>

      <div className="tabs" style={{ marginBottom: 0 }}>
        <div className={`tab ${view === 'appointments' ? 'active' : ''}`} onClick={() => setView('appointments')}>
          Service Appointments ({upcoming.length})
        </div>
        <div className={`tab ${view === 'work-orders' ? 'active' : ''}`} onClick={() => setView('work-orders')}>
          Scheduled Work Orders ({scheduledWOs.length})
        </div>
      </div>

      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>}

        {!loading && view === 'appointments' && (
          <>
            {upcoming.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>No upcoming appointments.</div>
            )}
            {upcoming.map((a: any) => {
              const style = STATUS_STYLE[a.status] || { bg: '#f3f4f6', color: '#6b7280' };
              const preferredDate = a.preferredDates?.[0] ? fmtDate(a.preferredDates[0]) : '—';
              return (
                <div key={a.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'start' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                      <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--brand)' }}>{a.appointmentNumber}</span>
                      <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>
                        {a.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                      </span>
                    </div>
                    <div style={{ fontSize: 12, color: '#555', marginBottom: 4 }}>{a.issueDescription || 'No description provided'}</div>
                    <div style={{ fontSize: 11, color: '#9ca3af' }}>Preferred: {preferredDate} · Confirmed: {fmtDate(a.confirmedDate)}</div>
                  </div>
                  <div style={{ display: 'flex', gap: 6 }}>
                    {a.status === 'requested' && (
                      <button
                        className="btn btn-s btn-sm"
                        disabled={updatingId === a.id}
                        onClick={() => handleApptStatus(a.id, 'confirmed')}
                      >
                        Confirm
                      </button>
                    )}
                    {a.status === 'confirmed' && (
                      <button
                        className="btn btn-p btn-sm"
                        disabled={updatingId === a.id}
                        onClick={() => handleApptStatus(a.id, 'in_progress')}
                      >
                        Start
                      </button>
                    )}
                  </div>
                </div>
              );
            })}
          </>
        )}

        {!loading && view === 'work-orders' && (
          <>
            {scheduledWOs.length === 0 && (
              <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>No scheduled work orders.</div>
            )}
            <div className="tw">
              {scheduledWOs.length > 0 && (
                <table>
                  <thead>
                    <tr><th>WO #</th><th>Notes</th><th>Status</th><th>Scheduled</th></tr>
                  </thead>
                  <tbody>
                    {scheduledWOs.map((w: any) => (
                      <tr key={w.id}>
                        <td style={{ fontWeight: 500, color: 'var(--brand)' }}>{w.workOrderNumber}</td>
                        <td style={{ maxWidth: 220, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.notes || '—'}</td>
                        <td><span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: '#dbeafe', color: '#1d4ed8' }}>{w.status}</span></td>
                        <td>{fmtDate(w.scheduledFor)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
