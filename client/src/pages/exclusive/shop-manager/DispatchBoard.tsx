import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const COLUMNS = [
  { status: 'unassigned',  label: 'Unassigned',    color: '#6b7280', bg: '#f9fafb' },
  { status: 'assigned',    label: 'Assigned',       color: '#2563eb', bg: '#eff6ff' },
  { status: 'in_progress', label: 'In Progress',    color: '#d97706', bg: '#fffbeb' },
  { status: 'blocked_parts', label: 'Blocked',      color: '#dc2626', bg: '#fef2f2' },
  { status: 'completed',   label: 'Completed',      color: '#16a34a', bg: '#f0fdf4' },
];

export default function DispatchBoard() {
  const { user } = useAuth();
  const [location, navigate] = useLocation();
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const did = user?.dealershipId;

  // Derive base path for navigation
  const basePath = (() => {
    const parts = location.split('/');
    const idx = parts.indexOf('work-orders');
    if (idx >= 0) return parts.slice(0, idx + 1).join('/');
    // On dispatch path — derive work-orders sibling
    const dispIdx = parts.indexOf('dispatch');
    return dispIdx >= 0 ? [...parts.slice(0, dispIdx), 'work-orders'].join('/') : '/';
  })();

  useEffect(() => {
    if (!did) return;
    apiFetch<any[]>(`/api/work-orders?dealershipId=${did}`)
      .then(d => setWorkOrders(Array.isArray(d) ? d : []))
      .catch(() => setWorkOrders([]))
      .finally(() => setLoading(false));
  }, [did]);

  if (loading) return <div className="page active"><div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Loading...</div></div>;

  const active = workOrders.filter(w => !['invoiced', 'cancelled'].includes(w.status));

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Active</div><div className="sc-v" style={{ color: '#2563eb' }}>{active.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Unassigned</div><div className="sc-v" style={{ color: '#f59e0b' }}>{workOrders.filter(w => w.status === 'unassigned').length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Blocked</div><div className="sc-v" style={{ color: '#ef4444' }}>{workOrders.filter(w => w.status === 'blocked_parts').length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Completed Today</div><div className="sc-v" style={{ color: '#22c55e' }}>{workOrders.filter(w => { if (w.status !== 'completed') return false; const d = w.completedAt ? new Date(w.completedAt) : null; return d && d.toDateString() === new Date().toDateString(); }).length}</div></div>
      </div>

      {/* Kanban columns */}
      <div style={{ display: 'grid', gridTemplateColumns: `repeat(${COLUMNS.length}, 1fr)`, gap: 12, alignItems: 'start' }}>
        {COLUMNS.map(col => {
          const items = workOrders.filter(w => w.status === col.status);
          return (
            <div key={col.status}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <div style={{ width: 8, height: 8, borderRadius: '50%', background: col.color }} />
                <span style={{ fontSize: 12, fontWeight: 600, color: col.color }}>{col.label}</span>
                <span style={{ fontSize: 11, color: '#9ca3af', marginLeft: 'auto' }}>{items.length}</span>
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                {items.length === 0 && (
                  <div style={{ padding: '20px 12px', textAlign: 'center', color: '#d1d5db', fontSize: 11, border: '1px dashed #e5e7eb', borderRadius: 8 }}>
                    Empty
                  </div>
                )}
                {items.map(w => (
                  <div
                    key={w.id}
                    onClick={() => navigate(`${basePath}/${w.id}`)}
                    style={{
                      padding: '12px 14px', background: col.bg, border: `1px solid ${col.color}22`,
                      borderRadius: 8, cursor: 'pointer', transition: 'box-shadow 0.15s',
                    }}
                    onMouseEnter={e => (e.currentTarget.style.boxShadow = '0 2px 8px rgba(0,0,0,0.1)')}
                    onMouseLeave={e => (e.currentTarget.style.boxShadow = '')}
                  >
                    <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--brand)', marginBottom: 4 }}>
                      {w.workOrderNumber || w.id.slice(0, 8).toUpperCase()}
                    </div>
                    <div style={{ fontSize: 11, color: '#555', lineHeight: 1.5, overflow: 'hidden', textOverflow: 'ellipsis', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' as any }}>
                      {w.notes || 'No description'}
                    </div>
                    {w.assignedTechId && (
                      <div style={{ marginTop: 8, fontSize: 10, color: '#9ca3af' }}>
                        Tech: {w.assignedTechId.slice(0, 6).toUpperCase()}
                      </div>
                    )}
                    {w.scheduledFor && (
                      <div style={{ marginTop: 4, fontSize: 10, color: '#9ca3af' }}>
                        {new Date(w.scheduledFor).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' })}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
