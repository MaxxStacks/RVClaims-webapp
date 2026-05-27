// client/src/pages/exclusive/supplier/SupplierOrders.tsx
// Route: /supplier/orders

import { useState } from 'react';
import { Link } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { formatCurrency } from '@/lib/locale';

const STATUS_TABS = ['all', 'pending', 'confirmed', 'shipped', 'delivered'] as const;

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

export default function SupplierOrders() {
  const { t } = useLanguage();
  const [activeTab, setActiveTab] = useState<string>('all');

  const { data: ordersData, isLoading } = useQuery({
    queryKey: ['supplierMeOrders'],
    queryFn: () => apiFetch<any>('/api/suppliers/me/orders'),
    retry: false,
  });

  const orders: any[] = ordersData?.orders ?? [];
  const filtered = activeTab === 'all' ? orders : orders.filter(o => o.status === activeTab);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1100, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: 4 }}>
          {t('supplier.orders') || 'Orders'}
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>Incoming orders from dealers</p>
      </div>

      {/* Status Filter Tabs */}
      <div style={{ display: 'flex', gap: 4, marginBottom: 24, borderBottom: '1px solid #e2e8f0', paddingBottom: 0 }}>
        {STATUS_TABS.map(tab => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            style={{
              padding: '8px 16px', background: 'transparent', border: 'none', cursor: 'pointer',
              fontSize: 13, fontWeight: activeTab === tab ? 600 : 400,
              color: activeTab === tab ? '#033280' : '#64748b',
              borderBottom: activeTab === tab ? '2px solid #033280' : '2px solid transparent',
              marginBottom: -1,
            }}
          >
            {tab.charAt(0).toUpperCase() + tab.slice(1)}
            {tab !== 'all' && (
              <span style={{
                marginLeft: 6, fontSize: 10, fontWeight: 700, padding: '1px 5px', borderRadius: 8,
                background: activeTab === tab ? '#033280' : '#e2e8f0',
                color: activeTab === tab ? '#fff' : '#64748b',
              }}>
                {orders.filter(o => o.status === tab).length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Orders Table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Order #', 'Total', 'Currency', 'Status', 'Date', 'Action'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={6} style={{ padding: '28px 14px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    {t('common.loading') || 'Loading…'}
                  </td>
                </tr>
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan={6} style={{ padding: '28px 14px', textAlign: 'center', color: '#94a3b8', fontSize: 13 }}>
                    {t('common.noResults') || 'No orders found'}
                  </td>
                </tr>
              ) : filtered.map((order: any) => {
                const sc = statusColor(order.status);
                return (
                  <tr key={order.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '11px 14px', fontWeight: 600, color: '#1e293b' }}>{order.orderNumber}</td>
                    <td style={{ padding: '11px 14px', fontWeight: 500 }}>
                      {formatCurrency(order.totalAmount, (order.currency ?? 'CAD') as any)}
                    </td>
                    <td style={{ padding: '11px 14px', color: '#64748b' }}>{order.currency ?? 'CAD'}</td>
                    <td style={{ padding: '11px 14px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10, background: sc.bg, color: sc.color }}>
                        {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
                      </span>
                    </td>
                    <td style={{ padding: '11px 14px', color: '#64748b', whiteSpace: 'nowrap' }}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td style={{ padding: '11px 14px' }}>
                      <Link href={`/supplier/orders/${order.id}`}>
                        <a style={{ fontSize: 12, color: '#033280', textDecoration: 'none', fontWeight: 500 }}>
                          {t('common.view') || 'View'} →
                        </a>
                      </Link>
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
