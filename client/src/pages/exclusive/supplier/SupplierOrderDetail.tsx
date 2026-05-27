// client/src/pages/exclusive/supplier/SupplierOrderDetail.tsx
// Route: /supplier/orders/:orderId

import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { formatCurrency } from '@/lib/locale';
import { useToast } from '@/hooks/use-toast';

const CARRIERS = ['FedEx', 'UPS', 'Purolator', 'Canada Post', 'DHL', 'Other'];

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

export default function SupplierOrderDetail() {
  const { orderId } = useParams<{ orderId: string }>();
  const [, setLocation] = useLocation();
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [showShipForm, setShowShipForm] = useState(false);
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier] = useState('Canada Post');
  const [estimatedDelivery, setEstimatedDelivery] = useState('');

  const { data, isLoading } = useQuery({
    queryKey: ['supplierOrder', orderId],
    queryFn: () => apiFetch<any>(`/api/suppliers/me/orders/${orderId}`),
    retry: false,
  });

  const statusMutation = useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      apiFetch(`/api/suppliers/me/orders/${orderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify(body),
      }),
    onSuccess: () => {
      toast({ title: 'Order status updated', description: 'The order has been updated.' });
      qc.invalidateQueries({ queryKey: ['supplierOrder', orderId] });
      qc.invalidateQueries({ queryKey: ['supplierMeOrders'] });
      setShowShipForm(false);
    },
    onError: () => {
      toast({ title: 'Error', description: 'Failed to update order status.', variant: 'destructive' });
    },
  });

  const updateStatus = (status: string, extra?: Record<string, unknown>) => {
    statusMutation.mutate({ status, ...extra });
  };

  const handleShip = () => {
    if (!trackingNumber || !carrier) return;
    updateStatus('shipped', { trackingNumber, carrier, estimatedDelivery: estimatedDelivery || undefined });
  };

  if (isLoading) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#64748b' }}>{t('common.loading') || 'Loading…'}</div>;
  }

  if (!data?.order) {
    return <div style={{ padding: 40, textAlign: 'center', color: '#dc2626' }}>Order not found</div>;
  }

  const { order, items = [] } = data;
  const sc = statusColor(order.status);
  const currency = (order.currency ?? 'CAD') as 'CAD' | 'USD';
  const showAddress = ['confirmed', 'processing', 'shipped', 'delivered'].includes(order.status);

  return (
    <div style={{ padding: '28px 32px', maxWidth: 900, fontFamily: 'Inter, system-ui, sans-serif' }}>
      {/* Back */}
      <button
        onClick={() => setLocation('/supplier/orders')}
        style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#64748b', fontSize: 13, marginBottom: 20, display: 'flex', alignItems: 'center', gap: 4 }}
      >
        ← {t('common.back') || 'Back'}
      </button>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: 6 }}>
            Order {order.orderNumber}
          </h1>
          <span style={{ fontSize: 12, fontWeight: 600, padding: '3px 10px', borderRadius: 12, background: sc.bg, color: sc.color }}>
            {order.status.charAt(0).toUpperCase() + order.status.slice(1)}
          </span>
        </div>
        <div style={{ fontSize: 12, color: '#64748b' }}>{new Date(order.createdAt).toLocaleDateString()}</div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 320px', gap: 20 }}>
        {/* Left: Items */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden', marginBottom: 16 }}>
            <div style={{ padding: '14px 18px', borderBottom: '1px solid #f1f5f9', fontWeight: 600, fontSize: 14, color: '#1e293b' }}>
              Order Items
            </div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  {['Part Name', 'Qty', 'Unit Price', 'Total'].map(h => (
                    <th key={h} style={{ padding: '9px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {items.length === 0 ? (
                  <tr>
                    <td colSpan={4} style={{ padding: '20px 14px', textAlign: 'center', color: '#94a3b8' }}>No items</td>
                  </tr>
                ) : items.map((item: any) => (
                  <tr key={item.id} style={{ borderBottom: '1px solid #f8fafc' }}>
                    <td style={{ padding: '10px 14px', color: '#1e293b' }}>{item.catalogItemId}</td>
                    <td style={{ padding: '10px 14px', color: '#475569' }}>{item.quantity}</td>
                    <td style={{ padding: '10px 14px' }}>{formatCurrency(item.unitPrice, currency)}</td>
                    <td style={{ padding: '10px 14px', fontWeight: 600 }}>{formatCurrency(item.totalPrice, currency)}</td>
                  </tr>
                ))}
                <tr style={{ background: '#f8fafc', borderTop: '2px solid #e2e8f0' }}>
                  <td colSpan={3} style={{ padding: '10px 14px', fontWeight: 700, textAlign: 'right', color: '#1e293b' }}>Total</td>
                  <td style={{ padding: '10px 14px', fontWeight: 700, color: '#0cb22c', fontSize: 15 }}>
                    {formatCurrency(order.totalAmount, currency)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Shipping Address — visible after confirmed */}
          {showAddress && order.shippingAddress && (
            <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '14px 18px', marginBottom: 16 }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#1e293b', marginBottom: 8 }}>Shipping Address</div>
              <div style={{ fontSize: 13, color: '#475569', lineHeight: 1.6 }}>{order.shippingAddress}</div>
            </div>
          )}

          {/* Tracking Info (after shipped) */}
          {order.status === 'shipped' && order.trackingNumber && (
            <div style={{ background: '#f0f9ff', border: '1px solid #bae6fd', borderRadius: 12, padding: '14px 18px' }}>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#0891b2', marginBottom: 8 }}>
                {t('supplier.tracking') || 'Tracking'}
              </div>
              <div style={{ fontSize: 13, color: '#0369a1' }}>
                <strong>{t('supplier.carrier') || 'Carrier'}:</strong> {order.carrier}<br />
                <strong>{t('supplier.tracking') || 'Tracking #'}:</strong> {order.trackingNumber}
                {order.estimatedDelivery && <><br /><strong>ETA:</strong> {new Date(order.estimatedDelivery).toLocaleDateString()}</>}
              </div>
            </div>
          )}
        </div>

        {/* Right: Actions */}
        <div>
          <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, padding: '18px 18px' }}>
            <div style={{ fontWeight: 600, fontSize: 14, color: '#1e293b', marginBottom: 16 }}>Actions</div>

            {order.status === 'pending' && (
              <button
                onClick={() => updateStatus('confirmed')}
                disabled={statusMutation.isPending}
                style={{
                  width: '100%', padding: '10px', background: '#0cb22c', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10,
                }}
              >
                {t('supplier.confirmOrder') || 'Confirm Order'}
              </button>
            )}

            {order.status === 'confirmed' && !showShipForm && (
              <button
                onClick={() => setShowShipForm(true)}
                style={{
                  width: '100%', padding: '10px', background: '#0891b2', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10,
                }}
              >
                {t('supplier.markShipped') || 'Mark as Shipped'}
              </button>
            )}

            {showShipForm && (
              <div style={{ background: '#f8fafc', borderRadius: 8, padding: 14, marginBottom: 10 }}>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#1e293b', marginBottom: 10 }}>Shipping Details</div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>{t('supplier.tracking') || 'Tracking Number'} *</label>
                  <input
                    value={trackingNumber}
                    onChange={e => setTrackingNumber(e.target.value)}
                    placeholder="1Z999..."
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <div style={{ marginBottom: 8 }}>
                  <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>{t('supplier.carrier') || 'Carrier'} *</label>
                  <select
                    value={carrier}
                    onChange={e => setCarrier(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                  >
                    {CARRIERS.map(c => <option key={c} value={c}>{c}</option>)}
                  </select>
                </div>
                <div style={{ marginBottom: 12 }}>
                  <label style={{ fontSize: 11, color: '#64748b', display: 'block', marginBottom: 4 }}>ETA</label>
                  <input
                    type="date"
                    value={estimatedDelivery}
                    onChange={e => setEstimatedDelivery(e.target.value)}
                    style={{ width: '100%', padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 6, fontSize: 13, boxSizing: 'border-box' }}
                  />
                </div>
                <button
                  onClick={handleShip}
                  disabled={statusMutation.isPending || !trackingNumber}
                  style={{
                    width: '100%', padding: '9px', background: '#0891b2', color: '#fff',
                    border: 'none', borderRadius: 7, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 6,
                  }}
                >
                  Confirm Shipment
                </button>
                <button
                  onClick={() => setShowShipForm(false)}
                  style={{ width: '100%', padding: '8px', background: '#fff', color: '#64748b', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 12, cursor: 'pointer' }}
                >
                  {t('common.cancel') || 'Cancel'}
                </button>
              </div>
            )}

            {order.status === 'shipped' && (
              <button
                onClick={() => updateStatus('delivered')}
                disabled={statusMutation.isPending}
                style={{
                  width: '100%', padding: '10px', background: '#0cb22c', color: '#fff',
                  border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: 'pointer', marginBottom: 10,
                }}
              >
                {t('supplier.markDelivered') || 'Mark as Delivered'}
              </button>
            )}

            {!['shipped', 'delivered', 'cancelled'].includes(order.status) && (
              <button
                onClick={() => updateStatus('cancelled')}
                disabled={statusMutation.isPending}
                style={{
                  width: '100%', padding: '9px', background: '#fff', color: '#dc2626',
                  border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, fontWeight: 500, cursor: 'pointer',
                }}
              >
                Cancel Order
              </button>
            )}

            {['delivered', 'cancelled'].includes(order.status) && (
              <div style={{ fontSize: 12, color: '#94a3b8', textAlign: 'center', padding: 8 }}>
                No further actions available
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
