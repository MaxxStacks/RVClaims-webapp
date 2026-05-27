// client/src/pages/exclusive/operator-admin/OperatorSuppliers.tsx
// Route: /operator/admin/suppliers

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';
import { formatCurrency } from '@/lib/locale';

type VerificationStatus = 'pending' | 'verified' | 'rejected' | 'suspended';

const STATUS_COLORS: Record<VerificationStatus, { color: string; bg: string }> = {
  pending:   { color: '#d97706', bg: '#fef3c7' },
  verified:  { color: '#16a34a', bg: '#dcfce7' },
  rejected:  { color: '#dc2626', bg: '#fee2e2' },
  suspended: { color: '#64748b', bg: '#f1f5f9' },
};

export default function OperatorSuppliers() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const { data: statsData } = useQuery({
    queryKey: ['supplierStats'],
    queryFn: () => apiFetch<any>('/api/suppliers/stats'),
    retry: false,
  });

  const { data, isLoading } = useQuery({
    queryKey: ['operatorSuppliers'],
    queryFn: () => apiFetch<any>('/api/suppliers'),
    retry: false,
  });

  const verifyMutation = useMutation({
    mutationFn: ({ id, status }: { id: string; status: VerificationStatus }) =>
      apiFetch(`/api/suppliers/${id}/verify`, { method: 'PATCH', body: JSON.stringify({ status }) }),
    onSuccess: () => {
      toast({ title: t('common.savedOk') || 'Status updated' });
      qc.invalidateQueries({ queryKey: ['operatorSuppliers'] });
      qc.invalidateQueries({ queryKey: ['supplierStats'] });
    },
    onError: () => toast({ title: t('common.errorSaving') || 'Failed to update', variant: 'destructive' }),
  });

  const suppliers: any[] = data?.suppliers ?? [];
  const stats = statsData ?? {};

  const statCards = [
    { label: t('supplier.title') || 'Total Suppliers', value: stats.total ?? 0, color: '#033280', bg: '#eff6ff' },
    { label: t('supplier.verified') || 'Verified', value: stats.verified ?? 0, color: '#16a34a', bg: '#dcfce7' },
    { label: t('supplier.pending') || 'Pending Verification', value: stats.pending ?? 0, color: '#d97706', bg: '#fef3c7' },
    { label: 'Total Orders', value: stats.totalOrders ?? 0, color: '#7c3aed', bg: '#f5f3ff' },
  ];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1200, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: 4 }}>
          {t('supplier.title') || 'Suppliers'}
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Manage supplier accounts, verify listings, and monitor orders
        </p>
      </div>

      {/* Stat cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {statCards.map(card => (
          <div key={card.label} style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 28, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Supplier table */}
      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Company', 'Contact', 'Country', 'Products', 'Orders', 'Status', 'Actions'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px 14px', textAlign: 'center', color: '#94a3b8' }}>
                    {t('common.loading') || 'Loading…'}
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={7} style={{ padding: '32px 14px', textAlign: 'center', color: '#94a3b8' }}>
                    No suppliers registered yet.
                  </td>
                </tr>
              ) : suppliers.map((s: any) => {
                const status: VerificationStatus = s.verificationStatus ?? 'pending';
                const badge = STATUS_COLORS[status] ?? STATUS_COLORS.pending;
                const isExpanded = expandedId === s.id;

                return (
                  <>
                    <tr
                      key={s.id}
                      style={{ borderBottom: '1px solid #f1f5f9', cursor: 'pointer', background: isExpanded ? '#f8fafc' : 'transparent' }}
                      onClick={() => setExpandedId(isExpanded ? null : s.id)}
                    >
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          {s.logoUrl ? (
                            <img src={s.logoUrl} alt="" style={{ width: 28, height: 28, borderRadius: 6, objectFit: 'cover', flexShrink: 0 }} />
                          ) : (
                            <div style={{ width: 28, height: 28, borderRadius: 6, background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, fontSize: 11, fontWeight: 700, color: '#64748b' }}>
                              {(s.companyName ?? '?').charAt(0).toUpperCase()}
                            </div>
                          )}
                          <span style={{ fontWeight: 600, color: '#1e293b' }}>{s.companyName}</span>
                        </div>
                      </td>
                      <td style={{ padding: '11px 14px', color: '#475569' }}>{s.contactName || '—'}</td>
                      <td style={{ padding: '11px 14px', color: '#64748b' }}>{s.country || '—'}</td>
                      <td style={{ padding: '11px 14px', color: '#475569' }}>{s.catalogItemCount ?? 0}</td>
                      <td style={{ padding: '11px 14px', color: '#475569' }}>{s.orderCount ?? 0}</td>
                      <td style={{ padding: '11px 14px' }}>
                        <span style={{
                          fontSize: 11, fontWeight: 600, padding: '2px 9px', borderRadius: 8,
                          background: badge.bg, color: badge.color,
                        }}>
                          {status.charAt(0).toUpperCase() + status.slice(1)}
                        </span>
                      </td>
                      <td style={{ padding: '11px 14px' }}>
                        <div style={{ display: 'flex', gap: 6 }} onClick={e => e.stopPropagation()}>
                          {status !== 'verified' && (
                            <button
                              onClick={() => verifyMutation.mutate({ id: s.id, status: 'verified' })}
                              disabled={verifyMutation.isPending}
                              style={{ padding: '4px 10px', background: '#dcfce7', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Verify
                            </button>
                          )}
                          {status !== 'rejected' && (
                            <button
                              onClick={() => verifyMutation.mutate({ id: s.id, status: 'rejected' })}
                              disabled={verifyMutation.isPending}
                              style={{ padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Reject
                            </button>
                          )}
                          {status !== 'suspended' && status === 'verified' && (
                            <button
                              onClick={() => verifyMutation.mutate({ id: s.id, status: 'suspended' })}
                              disabled={verifyMutation.isPending}
                              style={{ padding: '4px 10px', background: '#fef3c7', color: '#d97706', border: '1px solid #fde68a', borderRadius: 6, fontSize: 11, fontWeight: 600, cursor: 'pointer' }}
                            >
                              Suspend
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>

                    {/* Expansion panel */}
                    {isExpanded && (
                      <tr key={`${s.id}-expanded`}>
                        <td colSpan={7} style={{ padding: 0, background: '#f8fafc', borderBottom: '2px solid #e2e8f0' }}>
                          <SupplierExpansion supplierId={s.id} supplier={s} />
                        </td>
                      </tr>
                    )}
                  </>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─── Expansion panel sub-component ──────────────────────────────────────────
function SupplierExpansion({ supplierId, supplier }: { supplierId: string; supplier: any }) {
  const { t } = useLanguage();

  const { data: orderData, isLoading: ordersLoading } = useQuery({
    queryKey: ['operatorSupplierOrders', supplierId],
    queryFn: () => apiFetch<any>(`/api/suppliers/${supplierId}/orders`),
    retry: false,
  });

  const orders: any[] = orderData?.orders ?? [];

  const statusColor = (st: string) => {
    const map: Record<string, { color: string; bg: string }> = {
      pending:    { color: '#d97706', bg: '#fef3c7' },
      confirmed:  { color: '#2563eb', bg: '#eff6ff' },
      processing: { color: '#7c3aed', bg: '#f5f3ff' },
      shipped:    { color: '#0891b2', bg: '#e0f2fe' },
      delivered:  { color: '#16a34a', bg: '#dcfce7' },
      cancelled:  { color: '#64748b', bg: '#f1f5f9' },
    };
    return map[st] ?? { color: '#64748b', bg: '#f1f5f9' };
  };

  return (
    <div style={{ padding: '16px 20px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
      {/* Profile column */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', marginBottom: 12 }}>Company Profile</div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
          {[
            ['Phone', supplier.phone],
            ['Website', supplier.website],
            ['Address', supplier.address],
            ['City', supplier.city],
            ['Province / State', supplier.province],
            ['Country', supplier.country],
            ['Subscription', supplier.subscriptionStatus],
            ['Description', supplier.description],
          ].map(([label, value]) => value ? (
            <div key={label as string}>
              <div style={{ fontSize: 10, fontWeight: 700, color: '#94a3b8', textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: 2 }}>{label}</div>
              <div style={{ fontSize: 12, color: '#334155', wordBreak: 'break-word' }}>{value}</div>
            </div>
          ) : null)}
        </div>
      </div>

      {/* Recent orders column */}
      <div>
        <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', marginBottom: 12 }}>Recent Orders</div>
        {ordersLoading ? (
          <div style={{ fontSize: 13, color: '#94a3b8' }}>{t('common.loading') || 'Loading…'}</div>
        ) : orders.length === 0 ? (
          <div style={{ fontSize: 12, color: '#94a3b8' }}>No orders yet.</div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
            <thead>
              <tr style={{ borderBottom: '1px solid #e2e8f0' }}>
                {['Order #', 'Date', 'Total', 'Status'].map(h => (
                  <th key={h} style={{ padding: '5px 8px', textAlign: 'left', fontWeight: 600, color: '#94a3b8', fontSize: 10 }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {orders.slice(0, 8).map((o: any) => {
                const sc = statusColor(o.status ?? 'pending');
                return (
                  <tr key={o.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '6px 8px', fontFamily: 'monospace', color: '#1e293b', fontWeight: 600 }}>{o.orderNumber}</td>
                    <td style={{ padding: '6px 8px', color: '#64748b' }}>{new Date(o.createdAt).toLocaleDateString()}</td>
                    <td style={{ padding: '6px 8px', color: '#334155', fontWeight: 500 }}>
                      {formatCurrency(o.totalAmount ?? 0, (o.currency ?? 'CAD') as any)}
                    </td>
                    <td style={{ padding: '6px 8px' }}>
                      <span style={{ fontSize: 10, fontWeight: 600, padding: '2px 7px', borderRadius: 7, background: sc.bg, color: sc.color }}>
                        {(o.status ?? 'pending').charAt(0).toUpperCase() + (o.status ?? 'pending').slice(1)}
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
