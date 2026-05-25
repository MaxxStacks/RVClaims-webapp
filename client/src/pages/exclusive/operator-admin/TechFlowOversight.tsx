import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  unassigned:    { bg: '#f3f4f6', color: '#6b7280' },
  assigned:      { bg: '#dbeafe', color: '#1d4ed8' },
  en_route:      { bg: '#e0e7ff', color: '#4338ca' },
  in_progress:   { bg: '#fef3c7', color: '#d97706' },
  blocked_parts: { bg: '#fee2e2', color: '#dc2626' },
  completed:     { bg: '#dcfce7', color: '#16a34a' },
  paused:        { bg: '#f3f4f6', color: '#9ca3af' },
  invoiced:      { bg: '#d1fae5', color: '#059669' },
  cancelled:     { bg: '#f3f4f6', color: '#6b7280' },
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

export default function TechFlowOversight() {
  const [, navigate] = useLocation();
  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('open');

  useEffect(() => {
    apiFetch<any[]>('/api/work-orders')
      .then(d => setWorkOrders(Array.isArray(d) ? d : []))
      .catch(() => setWorkOrders([]))
      .finally(() => setLoading(false));
  }, []);

  const OPEN_STATUSES = ['unassigned', 'assigned', 'en_route', 'arrived', 'in_progress', 'blocked_parts', 'paused'];

  const filtered = workOrders.filter(w => {
    if (statusFilter === 'open' && !OPEN_STATUSES.includes(w.status)) return false;
    if (statusFilter === 'completed' && w.status !== 'completed' && w.status !== 'invoiced') return false;
    if (search) {
      const q = search.toLowerCase();
      if (!w.workOrderNumber?.toLowerCase().includes(q) && !w.notes?.toLowerCase().includes(q)) return false;
    }
    return true;
  });

  const completedThisWeek = workOrders.filter(w => {
    if (w.status !== 'completed' && w.status !== 'invoiced') return false;
    const d = w.completedAt ? new Date(w.completedAt) : null;
    if (!d) return false;
    const week = new Date(); week.setDate(week.getDate() - 7);
    return d >= week;
  }).length;

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Open Work Orders</div><div className="sc-v" style={{ color: '#2563eb' }}>{workOrders.filter(w => OPEN_STATUSES.includes(w.status)).length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>In Progress</div><div className="sc-v" style={{ color: '#f59e0b' }}>{workOrders.filter(w => w.status === 'in_progress').length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Completed (Week)</div><div className="sc-v" style={{ color: '#22c55e' }}>{completedThisWeek}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Blocked – Parts</div><div className="sc-v" style={{ color: '#ef4444' }}>{workOrders.filter(w => w.status === 'blocked_parts').length}</div></div>
      </div>
      <div className="filter-bar">
        <input
          type="text"
          placeholder="Search work orders..."
          value={search}
          onChange={e => setSearch(e.target.value)}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="all">All Statuses</option>
          <option value="open">Open</option>
          <option value="completed">Completed</option>
        </select>
        <button className="btn btn-p btn-sm" onClick={() => navigate('/operator/admin/techflow/new')}>+ New Work Order</button>
      </div>
      <div className="pn">
        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>}
        {!loading && filtered.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>No work orders found.</div>
        )}
        {!loading && filtered.length > 0 && (
          <div className="tw">
            <table>
              <thead>
                <tr><th>WO #</th><th>Dealership</th><th>Unit</th><th>Notes</th><th>Technician</th><th>Status</th><th>Scheduled</th></tr>
              </thead>
              <tbody>
                {filtered.map((w: any) => {
                  const style = STATUS_STYLE[w.status] || { bg: '#f3f4f6', color: '#6b7280' };
                  return (
                    <tr key={w.id}>
                      <td>
                        <span className="cid" onClick={() => navigate(`/operator/admin/techflow/${w.id}`)}>
                          {w.workOrderNumber || w.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td>{w.dealershipId?.slice(0, 8).toUpperCase() || '—'}</td>
                      <td>{w.unitId?.slice(0, 8).toUpperCase() || '—'}</td>
                      <td style={{ maxWidth: 180, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{w.notes || '—'}</td>
                      <td>{w.assignedTechId ? w.assignedTechId.slice(0, 6).toUpperCase() : <span style={{ color: '#9ca3af' }}>Unassigned</span>}</td>
                      <td>
                        <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>
                          {w.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </td>
                      <td>{fmtDate(w.scheduledFor)}</td>
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
