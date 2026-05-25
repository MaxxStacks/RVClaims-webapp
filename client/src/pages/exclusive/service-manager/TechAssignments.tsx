import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const WO_STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  unassigned:    { bg: '#f3f4f6', color: '#6b7280' },
  assigned:      { bg: '#dbeafe', color: '#1d4ed8' },
  en_route:      { bg: '#e0e7ff', color: '#4338ca' },
  in_progress:   { bg: '#fef3c7', color: '#d97706' },
  blocked_parts: { bg: '#fee2e2', color: '#dc2626' },
  completed:     { bg: '#dcfce7', color: '#16a34a' },
  paused:        { bg: '#f3f4f6', color: '#9ca3af' },
};

export default function TechAssignments() {
  const { user } = useAuth();
  const [techs, setTechs] = useState<any[]>([]);
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [assigningWO, setAssigningWO] = useState<string | null>(null);
  const [assignTarget, setAssignTarget] = useState<Record<string, string>>({});

  const did = user?.dealershipId;

  useEffect(() => {
    if (!did) return;
    setLoading(true);
    Promise.all([
      apiFetch<any[]>(`/api/work-orders/technicians?dealershipId=${did}`).catch(() => []),
      apiFetch<any[]>(`/api/work-orders?dealershipId=${did}`).catch(() => []),
    ]).then(([t, w]) => {
      setTechs(Array.isArray(t) ? t : []);
      setWorkOrders(Array.isArray(w) ? w : []);
    }).finally(() => setLoading(false));
  }, [did]);

  const handleAssign = async (woId: string, techId: string) => {
    if (!techId) return;
    setAssigningWO(woId);
    try {
      const updated = await apiFetch<any>(`/api/work-orders/${woId}`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedTechId: techId, status: 'assigned' }),
      });
      setWorkOrders(prev => prev.map(w => w.id === woId ? updated : w));
    } catch {
      // silently fail
    } finally {
      setAssigningWO(null);
      setAssignTarget(prev => { const next = { ...prev }; delete next[woId]; return next; });
    }
  };

  const unassigned = workOrders.filter(w => !w.assignedTechId && !['completed', 'cancelled', 'invoiced'].includes(w.status));
  const ACTIVE_STATUSES = ['assigned', 'en_route', 'arrived', 'in_progress', 'blocked_parts', 'paused'];

  if (loading) return <div className="page active"><div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Loading...</div></div>;

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Technicians</div><div className="sc-v" style={{ color: '#2563eb' }}>{techs.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Available</div><div className="sc-v" style={{ color: '#22c55e' }}>{techs.filter(t => t.isAvailable).length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Unassigned WOs</div><div className="sc-v" style={{ color: '#f59e0b' }}>{unassigned.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Active WOs</div><div className="sc-v" style={{ color: '#6366f1' }}>{workOrders.filter(w => ACTIVE_STATUSES.includes(w.status)).length}</div></div>
      </div>

      {/* Unassigned work orders */}
      {unassigned.length > 0 && (
        <div className="pn" style={{ marginBottom: 20 }}>
          <div className="pn-h"><span className="pn-t">Unassigned Work Orders</span></div>
          <div className="tw">
            <table>
              <thead>
                <tr><th>WO #</th><th>Notes</th><th>Assign To</th><th></th></tr>
              </thead>
              <tbody>
                {unassigned.map((w: any) => (
                  <tr key={w.id}>
                    <td style={{ fontWeight: 500, color: 'var(--brand)' }}>{w.workOrderNumber}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.notes || '—'}</td>
                    <td>
                      <select
                        value={assignTarget[w.id] || ''}
                        onChange={e => setAssignTarget(prev => ({ ...prev, [w.id]: e.target.value }))}
                        style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                      >
                        <option value="">Select technician...</option>
                        {techs.map((t: any) => (
                          <option key={t.id} value={t.id}>
                            {t.userId?.slice(0, 8).toUpperCase() || t.id.slice(0, 8).toUpperCase()}
                            {t.isAvailable ? ' ✓' : ' (unavailable)'}
                          </option>
                        ))}
                      </select>
                    </td>
                    <td>
                      <button
                        className="btn btn-p btn-sm"
                        disabled={!assignTarget[w.id] || assigningWO === w.id}
                        onClick={() => handleAssign(w.id, assignTarget[w.id])}
                      >
                        {assigningWO === w.id ? 'Assigning...' : 'Assign'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Technician cards */}
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Technician Status</span></div>
        {techs.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>
            No technicians configured. Add technicians via the Users & Roles section.
          </div>
        )}
        {techs.map(tech => {
          const assigned = workOrders.filter(w => w.assignedTechId === tech.id && ACTIVE_STATUSES.includes(w.status));
          return (
            <div key={tech.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: assigned.length > 0 ? 12 : 0 }}>
                <div style={{ width: 36, height: 36, borderRadius: '50%', background: '#033280', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13, fontWeight: 600, flexShrink: 0 }}>
                  {tech.userId?.slice(0, 2).toUpperCase() || 'T'}
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 600, fontSize: 13 }}>{tech.userId?.slice(0, 8).toUpperCase() || tech.id.slice(0, 8).toUpperCase()}</div>
                  {tech.specializations?.length > 0 && (
                    <div style={{ fontSize: 11, color: '#888' }}>{tech.specializations.slice(0, 2).join(' · ')}</div>
                  )}
                </div>
                <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: tech.isAvailable ? '#dcfce7' : '#f3f4f6', color: tech.isAvailable ? '#16a34a' : '#9ca3af' }}>
                  {tech.isAvailable ? 'Available' : 'Unavailable'}
                </span>
                <span style={{ fontSize: 12, color: '#6b7280' }}>{assigned.length} active WO{assigned.length !== 1 ? 's' : ''}</span>
              </div>
              {assigned.length > 0 && (
                <div style={{ marginLeft: 48, display: 'flex', flexDirection: 'column', gap: 6 }}>
                  {assigned.map(w => {
                    const style = WO_STATUS_STYLE[w.status] || { bg: '#f3f4f6', color: '#6b7280' };
                    return (
                      <div key={w.id} style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 12 }}>
                        <span style={{ fontWeight: 500, color: 'var(--brand)' }}>{w.workOrderNumber}</span>
                        <span style={{ flex: 1, color: '#555', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.notes || '—'}</span>
                        <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 10, fontWeight: 600, ...style }}>
                          {w.status?.replace(/_/g, ' ')}
                        </span>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
}
