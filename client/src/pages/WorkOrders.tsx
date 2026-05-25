import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

const STATUS_COLORS: Record<string, { bg: string; color: string; label: string }> = {
  unassigned:    { bg: '#f3f4f6', color: '#6b7280', label: 'Unassigned' },
  assigned:      { bg: '#dbeafe', color: '#1d4ed8', label: 'Assigned' },
  en_route:      { bg: '#e0e7ff', color: '#4338ca', label: 'En Route' },
  arrived:       { bg: '#fef3c7', color: '#b45309', label: 'Arrived' },
  in_progress:   { bg: '#fef3c7', color: '#d97706', label: 'In Progress' },
  blocked_parts: { bg: '#fee2e2', color: '#dc2626', label: 'Blocked – Parts' },
  paused:        { bg: '#f3f4f6', color: '#9ca3af', label: 'Paused' },
  completed:     { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
  invoiced:      { bg: '#d1fae5', color: '#059669', label: 'Invoiced' },
  cancelled:     { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
};

function StatusBadge({ status }: { status: string }) {
  const s = STATUS_COLORS[status] || { bg: '#f3f4f6', color: '#6b7280', label: status };
  return (
    <span style={{ padding: '3px 10px', borderRadius: 20, fontSize: 11, fontWeight: 600, background: s.bg, color: s.color }}>
      {s.label}
    </span>
  );
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

export default function WorkOrders() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [workOrders, setWorkOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState<string>('open');

  const role = user?.role || '';
  const isTech = role === 'technician';
  const isOperator = role === 'operator_admin' || role === 'operator_staff';
  const canCreate = isOperator || role === 'dealer_owner' || role === 'service_manager' || role === 'shop_manager';

  // Derive base path for navigation (up to and including 'work-orders')
  const basePath = (() => {
    const parts = location.split('/');
    const idx = parts.indexOf('work-orders');
    return idx >= 0 ? parts.slice(0, idx + 1).join('/') : location;
  })();

  const loadData = () => {
    const did = user?.dealershipId;
    const params = new URLSearchParams();
    if (did && !isOperator) params.set('dealershipId', did);
    setLoading(true);
    apiFetch<any[]>(`/api/work-orders?${params}`)
      .then(d => setWorkOrders(Array.isArray(d) ? d : []))
      .catch(() => setWorkOrders([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadData(); }, [user?.id]);

  const OPEN_STATUSES = ['unassigned', 'assigned', 'en_route', 'arrived', 'in_progress', 'blocked_parts', 'paused'];

  const displayed = workOrders.filter(wo => {
    if (statusFilter === 'open') return OPEN_STATUSES.includes(wo.status);
    if (statusFilter === 'completed') return wo.status === 'completed' || wo.status === 'invoiced';
    if (statusFilter === 'cancelled') return wo.status === 'cancelled';
    return true;
  });

  const openCount = workOrders.filter(w => OPEN_STATUSES.includes(w.status)).length;
  const inProgressCount = workOrders.filter(w => w.status === 'in_progress').length;
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
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>{t('workOrders.openOrders')}</div><div className="sc-v" style={{ color: '#2563eb' }}>{openCount}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>{t('common.inProgress')}</div><div className="sc-v" style={{ color: '#f59e0b' }}>{inProgressCount}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>{t('workOrders.completedThisWeek')}</div><div className="sc-v" style={{ color: '#22c55e' }}>{completedThisWeek}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>{t('workOrders.totalOrders')}</div><div className="sc-v">{workOrders.length}</div></div>
      </div>
      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">{t('nav.workOrders')}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
            >
              <option value="all">{t('common.allStatuses')}</option>
              <option value="open">Open</option>
              <option value="completed">Completed</option>
              <option value="cancelled">Cancelled</option>
            </select>
            {canCreate && (
              <button className="btn btn-p" style={{ fontSize: 12, padding: '6px 14px' }} onClick={() => navigate(`${basePath}/new`)}>
                + {t('workOrders.newWorkOrder')}
              </button>
            )}
          </div>
        </div>
        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading...</div>}
        {!loading && displayed.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>
            No work orders found.
          </div>
        )}
        {!loading && displayed.length > 0 && (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>{t('workOrders.workOrderNumber')}</th>
                  <th>{t('workOrders.unit')}</th>
                  <th>{t('common.notes')}</th>
                  {!isTech && <th>{t('common.assignedTo')}</th>}
                  <th>{t('common.status')}</th>
                  <th>{t('workOrders.scheduledDate')}</th>
                </tr>
              </thead>
              <tbody>
                {displayed.map((wo: any) => (
                  <tr key={wo.id}>
                    <td>
                      <span className="cid" onClick={() => navigate(`${basePath}/${wo.id}`)}>
                        {wo.workOrderNumber || wo.id?.slice(0, 8).toUpperCase()}
                      </span>
                    </td>
                    <td>{wo.unitId ? wo.unitId.slice(0, 8).toUpperCase() : '—'}</td>
                    <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {wo.notes || '—'}
                    </td>
                    {!isTech && <td>{wo.assignedTechId ? wo.assignedTechId.slice(0, 6).toUpperCase() : <span style={{ color: '#9ca3af' }}>Unassigned</span>}</td>}
                    <td><StatusBadge status={wo.status || 'unassigned'} /></td>
                    <td>{fmtDate(wo.scheduledFor)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
