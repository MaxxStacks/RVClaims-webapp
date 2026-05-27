// client/src/pages/Parts.tsx — Parts & Accessories (Module 9)
// Role-aware: operator_admin + operator_staff (all orders, full control)
//             dealer_owner + dealer_staff (own dealership orders, create)
//             parts_dept / shop_manager / service_manager (own dealership, scoped)
//             client (own unit orders, read-only)

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import PrintButton from '@/components/PrintButton';
import PrintHeader from '@/components/PrintHeader';

interface PartsOrder {
  id: string;
  orderNumber: string;
  dealershipId: string;
  claimId: string | null;
  status: string;
  priority: string;
  supplier: string | null;
  totalQuantity: number;
  estimatedCost: string | null;
  trackingNumber: string | null;
  carrier: string | null;
  eta: string | null;
  dealerNotes: string | null;
  operatorNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_COLORS: Record<string, string> = {
  requested:            'bg info',
  sourcing:             'bg ow',
  quoted:               'bg in-progress',
  ordered:              'bg in-progress',
  shipped:              'bg quoted',
  delivered:            'bg ok',
  initiated:            'bg info',
  submitted_to_supplier:'bg in-progress',
  supplier_ack:         'bg in-progress',
  received:             'bg ok',
  cancelled:            'bg denied',
};

function statusBadge(status: string) {
  const cls = STATUS_COLORS[status] || 'bg';
  return (
    <span className={cls} style={{ fontSize: 11, padding: '2px 8px' }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function Parts() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = user?.role as string | undefined;
  const isOperatorAdmin  = role === 'operator_admin';
  const isOperator       = role === 'operator_admin' || role === 'operator_staff';
  const isDealerOwner    = role === 'dealer_owner';
  const isDealerStaff    = role === 'dealer_staff';
  const isPartsManager   = role === 'parts_dept';
  const isShopManager    = role === 'shop_manager';
  const isServiceManager = role === 'service_manager';
  const isClient         = role === 'client';

  const hasAccess = isOperator || isDealerOwner || isDealerStaff || isPartsManager ||
                    isShopManager || isServiceManager || isClient;

  const canCreate = isOperatorAdmin || isDealerOwner || isPartsManager;

  // Module gate — parts_store key
  const [moduleEnabled, setModuleEnabled] = useState(true);

  // Data
  const [orders, setOrders]       = useState<PartsOrder[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Filters
  const [searchQ, setSearchQ]       = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  // Toast
  const [toastMsg, setToastMsg]       = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Module gate check
  useEffect(() => {
    const isDealerRole = isDealerOwner || isDealerStaff || isPartsManager || isShopManager || isServiceManager;
    if (isDealerRole && user?.dealershipId) {
      apiFetch<any>(`/api/dealerships/${user.dealershipId}/modules`)
        .then(d => {
          const modules: any[] = d.modules || [];
          const m = modules.find((mod: any) => mod.moduleKey === 'parts_store');
          setModuleEnabled(!m || m.status === 'enabled' || m.status === 'trial');
        })
        .catch(() => setModuleEnabled(true));
    }
  }, [user, isDealerOwner, isDealerStaff, isPartsManager, isShopManager, isServiceManager]);

  const loadOrders = useCallback(async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const d = await apiFetch<any>('/api/parts-orders');
      setOrders(Array.isArray(d) ? d : d.orders || []);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load parts orders');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (!hasAccess) { setIsLoading(false); return; }
    loadOrders();
  }, [hasAccess, loadOrders]);

  // Access guard
  if (!hasAccess) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          You do not have permission to view Parts & Accessories.
        </div>
      </div>
    );
  }

  if (!isOperator && !moduleEnabled) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Parts & Accessories Module Not Enabled</div>
          <div style={{ color: '#888', fontSize: 13 }}>
            Contact DS360 to enable the Parts & Accessories module for your dealership.
          </div>
        </div>
      </div>
    );
  }

  // Stats
  const openCount     = orders.filter(o => !['delivered','received','cancelled'].includes(o.status)).length;
  const shippedCount  = orders.filter(o => o.status === 'shipped').length;
  const receivedCount = orders.filter(o => o.status === 'received' || o.status === 'delivered').length;
  const totalCost     = orders.reduce((s, o) => s + parseFloat(o.estimatedCost || '0'), 0);

  // Filter
  const filtered = orders.filter(o => {
    const matchSearch = !searchQ ||
      o.orderNumber.toLowerCase().includes(searchQ.toLowerCase()) ||
      (o.supplier || '').toLowerCase().includes(searchQ.toLowerCase()) ||
      (o.claimId || '').toLowerCase().includes(searchQ.toLowerCase());
    const matchStatus = !statusFilter || o.status === statusFilter;
    return matchSearch && matchStatus;
  });

  // Navigate to detail — pick the right base path from current URL
  const getDetailPath = (id: string) => {
    if (isOperatorAdmin) return `/operator/admin/parts/${id}`;
    if (role === 'operator_staff') return `/operator/staff/parts/${id}`;
    if (user?.dealershipId) {
      const d = user.dealershipId;
      if (isDealerOwner)    return `/${d}/owner/parts/${id}`;
      if (isDealerStaff)    return `/${d}/staff/parts/${id}`;
      if (isPartsManager)   return `/${d}/parts-manager/orders/${id}`;
      if (isShopManager)    return `/${d}/shop-manager/parts/${id}`;
      if (isServiceManager) return `/${d}/service-manager/parts/${id}`;
      if (isClient)         return `/${d}/client/parts/${id}`;
    }
    return `/operator/admin/parts/${id}`;
  };

  const getNewPath = () => {
    if (isOperatorAdmin) return '/operator/admin/parts/new';
    if (user?.dealershipId) {
      const d = user.dealershipId;
      if (isDealerOwner)  return `/${d}/owner/parts/new`;
      if (isPartsManager) return `/${d}/parts-manager/orders/new`;
    }
    return '/operator/admin/parts/new';
  };

  const printDate = new Date().toLocaleDateString('en-CA', { year: 'numeric', month: 'long', day: 'numeric' });

  return (
    <div className="page active">
      {/* Print header — visible only in print output */}
      <PrintHeader
        title="Parts Orders Report"
        subtitle={`${filtered.length} order${filtered.length !== 1 ? 's' : ''} · ${printDate}`}
      />

      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#033280', color: '#fff',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{t('parts.partsAccessories')}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
            {isOperator
              ? 'Manage parts orders across all dealers. Source, price, and track delivery.'
              : isClient
              ? 'View parts ordered for your unit.'
              : 'Track parts requests, orders, and delivery status for your dealership.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
          <PrintButton title={`Parts Orders Report — ${printDate}`} />
          {canCreate && (
            <button className="btn btn-p btn-sm" onClick={() => navigate(getNewPath())}>
              + {t('parts.newPartsOrder')}
            </button>
          )}
        </div>
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('parts.openOrders')}</div>
          <div className="sc-v" style={{ color: '#2563eb' }}>{openCount}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('common.shipped')}</div>
          <div className="sc-v" style={{ color: '#a855f7' }}>{shippedCount}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('parts.receivedDelivered')}</div>
          <div className="sc-v" style={{ color: '#22c55e' }}>{receivedCount}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('parts.estOrderValue')}</div>
          <div className="sc-v">
            {totalCost > 0 ? `$${totalCost.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}` : '—'}
          </div>
        </div>
      </div>

      {/* Filter bar */}
      <div className="filter-bar" style={{ marginBottom: 16 }}>
        <input
          type="text"
          placeholder="Search orders by number, supplier, claim…"
          value={searchQ}
          onChange={e => setSearchQ(e.target.value)}
        />
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
          <option value="">{t('common.allStatuses')}</option>
          <option value="requested">Requested</option>
          <option value="sourcing">Sourcing</option>
          <option value="quoted">Quoted</option>
          <option value="ordered">Ordered</option>
          <option value="initiated">Initiated</option>
          <option value="submitted_to_supplier">Submitted to Supplier</option>
          <option value="supplier_ack">Supplier Acknowledged</option>
          <option value="shipped">Shipped</option>
          <option value="delivered">Delivered</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {/* Orders table */}
      <div className="pn">
        {isLoading ? (
          <div style={{ textAlign: 'center', padding: 32, color: '#888', fontSize: 13 }}>{t('common.loading')}</div>
        ) : dataError ? (
          <div style={{ padding: '12px 20px', color: '#dc2626', fontSize: 13 }}>{dataError}</div>
        ) : (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>{t('parts.orderNumber')}</th>
                  {isOperator && <th>{t('common.dealer')}</th>}
                  <th>{t('parts.claim')}</th>
                  <th>{t('parts.supplier')}</th>
                  <th>{t('parts.qty')}</th>
                  <th>{t('parts.estCost')}</th>
                  <th>{t('workOrders.priority')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('parts.eta')}</th>
                  <th>{t('common.updated')}</th>
                  <th>{t('parts.action')}</th>
                </tr>
              </thead>
              <tbody>
                {filtered.length === 0 ? (
                  <tr>
                    <td colSpan={isOperator ? 11 : 10} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                      {searchQ || statusFilter ? t('common.noResults') : t('parts.noOrders')}
                    </td>
                  </tr>
                ) : filtered.map(o => (
                  <tr
                    key={o.id}
                    style={{ cursor: 'pointer' }}
                    onClick={() => navigate(getDetailPath(o.id))}
                  >
                    <td style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 12 }}>{o.orderNumber}</td>
                    {isOperator && (
                      <td style={{ fontSize: 12, color: '#666' }}>
                        {o.dealershipId.slice(0, 8)}…
                      </td>
                    )}
                    <td style={{ fontSize: 12, color: '#666' }}>
                      {o.claimId ? o.claimId.slice(0, 8) + '…' : '—'}
                    </td>
                    <td style={{ fontSize: 12 }}>{o.supplier || '—'}</td>
                    <td style={{ textAlign: 'center' }}>{o.totalQuantity || '—'}</td>
                    <td style={{ fontWeight: 500 }}>
                      {o.estimatedCost ? `$${parseFloat(o.estimatedCost).toLocaleString('en-CA')}` : '—'}
                    </td>
                    <td>
                      <span className={o.priority === 'urgent' ? 'bg ow' : 'bg'} style={{ fontSize: 10, padding: '2px 6px' }}>
                        {o.priority}
                      </span>
                    </td>
                    <td onClick={e => e.stopPropagation()}>{statusBadge(o.status)}</td>
                    <td style={{ fontSize: 12, color: '#666' }}>
                      {o.eta ? new Date(o.eta).toLocaleDateString('en-CA') : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: '#666' }}>
                      {new Date(o.updatedAt).toLocaleDateString('en-CA')}
                    </td>
                    <td onClick={e => e.stopPropagation()}>
                      <button
                        className="btn btn-o btn-sm"
                        style={{ fontSize: 11 }}
                        onClick={() => navigate(getDetailPath(o.id))}
                      >
                        {t('common.view')}
                      </button>
                    </td>
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
