// client/src/pages/exclusive/supplier/SupplierDashboard.tsx
// Route: /supplier/dashboard

import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { formatCurrency } from '@/lib/locale';

export default function SupplierDashboard() {
  const { t } = useLanguage();

  const { data: supplierData, isLoading: loadingSupplier } = useQuery({
    queryKey: ['supplierMe'],
    queryFn: () => apiFetch<any>('/api/suppliers/me'),
    retry: false,
  });

  const { data: catalogData } = useQuery({
    queryKey: ['supplierMeCatalog'],
    queryFn: () => apiFetch<any>('/api/suppliers/me/catalog'),
    retry: false,
  });

  const { data: ordersData } = useQuery({
    queryKey: ['supplierMeOrders'],
    queryFn: () => apiFetch<any>('/api/suppliers/me/orders'),
    retry: false,
  });

  const supplier = supplierData?.supplier;
  const catalogItems: any[] = catalogData?.items ?? [];
  const orders: any[] = ordersData?.orders ?? [];

  const activeProducts = catalogItems.filter(i => i.isActive).length;
  const pendingOrders = orders.filter(o => o.status === 'pending').length;
  const totalOrders = orders.length;

  const thisMonth = new Date();
  const monthStart = new Date(thisMonth.getFullYear(), thisMonth.getMonth(), 1);
  const revenueThisMonth = orders
    .filter(o => o.status === 'delivered' && new Date(o.updatedAt) >= monthStart)
    .reduce((sum: number, o: any) => sum + parseFloat(o.totalAmount || '0'), 0);

  const currency = supplier?.country === 'US' ? 'USD' : 'CAD';

  const verificationBadge = !supplier
    ? null
    : supplier.verificationStatus === 'verified'
      ? { label: t('supplier.verified') || 'Verified', color: '#16a34a', bg: '#dcfce7' }
      : supplier.verificationStatus === 'rejected'
        ? { label: t('supplier.rejected') || 'Rejected', color: '#dc2626', bg: '#fee2e2' }
        : supplier.verificationStatus === 'suspended'
          ? { label: t('supplier.suspended') || 'Suspended', color: '#d97706', bg: '#fef3c7' }
          : { label: t('supplier.pending') || 'Pending Review', color: '#d97706', bg: '#fef3c7' };

  const statCards = [
    { label: 'Active Products', value: activeProducts, icon: '◫', color: '#3b82f6' },
    { label: t('supplier.pending') || 'Pending Orders', value: pendingOrders, icon: '📦', color: '#f59e0b' },
    { label: 'Revenue This Month', value: formatCurrency(revenueThisMonth, currency as any), icon: '💰', color: '#0cb22c', isText: true },
    { label: 'Total Orders', value: totalOrders, icon: '◎', color: '#8b5cf6' },
  ];

  const recentOrders = orders.slice(0, 10);

  const statusColor = (status: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      pending:   { color: '#d97706', bg: '#fef3c7' },
      confirmed: { color: '#2563eb', bg: '#dbeafe' },
      processing:{ color: '#7c3aed', bg: '#ede9fe' },
      shipped:   { color: '#0891b2', bg: '#e0f2fe' },
      delivered: { color: '#16a34a', bg: '#dcfce7' },
      cancelled: { color: '#dc2626', bg: '#fee2e2' },
    };
    return map[status] ?? { color: '#64748b', bg: '#f1f5f9' };
  };

  if (loadingSupplier) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#64748b', fontSize: 14 }}>
        {t('common.loading') || 'Loading…'}
      </div>
    );
  }

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, fontFamily: 'Inter, system-ui, sans-serif' }}>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: 4 }}>
            {t('nav.dashboard') || 'Dashboard'} — {supplier?.companyName ?? ''}
          </h1>
          {verificationBadge && (
            <span style={{
              display: 'inline-block', fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 12,
              background: verificationBadge.bg, color: verificationBadge.color,
            }}>
              {verificationBadge.label}
            </span>
          )}
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
          <Link href="/supplier/catalog">
            <a style={{
              padding: '9px 18px', background: '#033280', color: '#fff', borderRadius: 7,
              fontSize: 13, fontWeight: 600, textDecoration: 'none', border: 'none',
            }}>{t('supplier.addProduct') || '+ Add Product'}</a>
          </Link>
          <Link href="/supplier/orders">
            <a style={{
              padding: '9px 18px', background: '#fff', color: '#033280', borderRadius: 7,
              fontSize: 13, fontWeight: 600, textDecoration: 'none', border: '1px solid #e2e8f0',
            }}>{t('supplier.orders') || 'View Orders'}</a>
          </Link>
        </div>
      </div>

      {/* Stat Cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 16, marginBottom: 32 }}>
        {statCards.map((card) => (
          <div key={card.label} style={{
            background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '20px 22px',
            boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
              <span style={{ fontSize: 20 }}>{card.icon}</span>
              <span style={{ fontSize: 12, color: '#64748b', fontWeight: 500 }}>{card.label}</span>
            </div>
            <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>
              {card.isText ? card.value : card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Recent Orders */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f1f5f9', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <h2 style={{ fontSize: 15, fontWeight: 600, color: '#1e293b', margin: 0 }}>Recent Orders</h2>
          <Link href="/supplier/orders">
            <a style={{ fontSize: 12, color: '#033280', textDecoration: 'none', fontWeight: 500 }}>View all →</a>
          </Link>
        </div>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Order #', 'Items', 'Total', 'Status', 'Date'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {recentOrders.length === 0 ? (
                <tr>
                  <td colSpan={5} style={{ padding: '28px 14px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    No orders yet
                  </td>
                </tr>
              ) : recentOrders.map((order: any) => {
                const sc = statusColor(order.status);
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '10px 14px', fontWeight: 600, color: '#1e293b' }}>
                      <Link href={`/supplier/orders/${order.id}`}>
                        <a style={{ color: '#033280', textDecoration: 'none' }}>{order.orderNumber}</a>
                      </Link>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>—</td>
                    <td style={{ padding: '10px 14px', fontWeight: 500, color: '#1e293b' }}>
                      {formatCurrency(order.totalAmount, (order.currency ?? 'CAD') as any)}
                    </td>
                    <td style={{ padding: '10px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10, background: sc.bg, color: sc.color }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '10px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
