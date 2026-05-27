// client/src/pages/PartsDetail.tsx — Parts Order Detail (Module 9)
// Operators: full status + tracking update
// parts_dept / dealer_owner: view + mark received
// dealer_staff / service_manager / shop_manager / client: read-only

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { generateBarcodeString } from '@/lib/barcode';
import PrintButton from '@/components/PrintButton';
import PrintHeader from '@/components/PrintHeader';

interface PartsOrderItem {
  id: string;
  orderId: string;
  partNumber: string;
  description: string | null;
  quantity: number;
  unitCost: string | null;
}

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
  supplierOrderRef: string | null;
  operatorNotes: string | null;
  dealerNotes: string | null;
  initiatedAt: string | null;
  shippedAt: string | null;
  receivedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

const STATUS_SEQUENCE = [
  'initiated',
  'requested',
  'sourcing',
  'quoted',
  'submitted_to_supplier',
  'supplier_ack',
  'ordered',
  'shipped',
  'delivered',
  'received',
];

const STATUS_COLORS: Record<string, string> = {
  requested:             'bg info',
  sourcing:              'bg ow',
  quoted:                'bg in-progress',
  ordered:               'bg in-progress',
  shipped:               'bg quoted',
  delivered:             'bg ok',
  initiated:             'bg info',
  submitted_to_supplier: 'bg in-progress',
  supplier_ack:          'bg in-progress',
  received:              'bg ok',
  cancelled:             'bg denied',
};

function statusBadge(status: string) {
  const cls = STATUS_COLORS[status] || 'bg';
  return (
    <span className={cls} style={{ fontSize: 12, padding: '4px 12px' }}>
      {status.replace(/_/g, ' ')}
    </span>
  );
}

export default function PartsDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ orderId?: string; partsId?: string }>();
  const { user } = useAuth();

  // Extract orderId from URL
  const orderId = params.orderId || params.partsId || (() => {
    const segs = location.split('/');
    const idx = segs.findIndex(s => s === 'parts' || s === 'orders');
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  const role = user?.role as string | undefined;
  const isOperatorAdmin  = role === 'operator_admin';
  const isOperator       = role === 'operator_admin' || role === 'operator_staff';
  const isDealerOwner    = role === 'dealer_owner';
  const isPartsManager   = role === 'parts_dept';

  // Who can update status / tracking
  const canUpdateStatus  = isOperatorAdmin;
  const canMarkReceived  = isPartsManager || isDealerOwner;

  // Data
  const [order, setOrder]   = useState<PartsOrder | null>(null);
  const [items, setItems]   = useState<PartsOrderItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Status / tracking edit state
  const [toStatus, setToStatus]         = useState('');
  const [trackingNumber, setTrackingNumber] = useState('');
  const [carrier, setCarrier]             = useState('');
  const [supplierRef, setSupplierRef]     = useState('');
  const [isSaving, setIsSaving]           = useState(false);

  // Toast
  const [toastMsg, setToastMsg]       = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadOrder = useCallback(async () => {
    if (!orderId) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const d = await apiFetch<any>(`/api/parts-orders/${orderId}`);
      const ord: PartsOrder = d.order || d;
      setOrder(ord);
      setItems(d.items || []);
      // Pre-fill tracking fields
      setTrackingNumber(ord.trackingNumber || '');
      setCarrier(ord.carrier || '');
      setSupplierRef(ord.supplierOrderRef || '');
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load order');
    } finally {
      setIsLoading(false);
    }
  }, [orderId]);

  useEffect(() => { loadOrder(); }, [loadOrder]);

  const handleBack = () => {
    const segs = location.split('/');
    const idx = segs.findIndex(s => s === 'parts' || s === 'orders');
    if (idx > 0) navigate(segs.slice(0, idx + 1).join('/'));
    else navigate(-1 as any);
  };

  const handleTransition = async (overrideStatus?: string) => {
    const status = overrideStatus || toStatus;
    if (!status) { showToast('Select a status to transition to.'); return; }
    setIsSaving(true);
    try {
      await apiFetch(`/api/parts-orders/${orderId}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          toStatus: status,
          trackingNumber: trackingNumber || undefined,
          carrier: carrier || undefined,
          supplierOrderRef: supplierRef || undefined,
        }),
      });
      showToast('Order updated');
      setToStatus('');
      await loadOrder();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update order');
    } finally {
      setIsSaving(false);
    }
  };

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ fontSize: 14, color: '#888' }}>Loading order…</div>
      </div>
    );
  }

  if (dataError || !order) {
    return (
      <div className="page active">
        <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>
          {dataError || 'Order not found.'}
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-o btn-sm" onClick={handleBack}>← Back to Orders</button>
          </div>
        </div>
      </div>
    );
  }

  // Compute subtotal from items
  const subtotal = items.reduce((s, it) => {
    return s + (it.quantity * parseFloat(it.unitCost || '0'));
  }, 0);

  // Status timeline position
  const statusIdx = STATUS_SEQUENCE.indexOf(order.status);

  return (
    <div className="page active">
      {/* Print header — visible only in print output */}
      <PrintHeader
        title="Parts Order"
        subtitle={order.orderNumber}
        barcodeString={order.id ? generateBarcodeString('partsOrder', order.id) : undefined}
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

      {/* Detail header */}
      <div className="detail-header">
        <button className="detail-back" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">{order.orderNumber}</div>
          <div className="detail-meta">
            {order.supplier ? `Supplier: ${order.supplier}` : 'No supplier specified'} ·{' '}
            {items.length} item{items.length !== 1 ? 's' : ''} ·{' '}
            {order.claimId ? `Claim: ${order.claimId.slice(0, 8)}…` : 'No linked claim'}
          </div>
        </div>
        {statusBadge(order.status)}
        <PrintButton title={`Parts Order — ${order.orderNumber || order.id?.slice(0, 8)}`} />
      </div>

      {/* Status timeline */}
      <div style={{ marginBottom: 20, padding: '16px 0', overflowX: 'auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 0, minWidth: 'max-content' }}>
          {['requested', 'sourcing', 'submitted_to_supplier', 'shipped', 'received'].map((s, i, arr) => {
            const sIdx = STATUS_SEQUENCE.indexOf(s);
            const isDone    = statusIdx >= sIdx;
            const isCurrent = order.status === s;
            return (
              <div key={s} style={{ display: 'flex', alignItems: 'center' }}>
                <div style={{
                  display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4,
                }}>
                  <div style={{
                    width: 28, height: 28, borderRadius: '50%', border: `2px solid ${isDone ? '#22c55e' : '#e0e0e0'}`,
                    background: isDone ? '#22c55e' : '#fff',
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 12, color: isDone ? '#fff' : '#ccc', fontWeight: 700,
                    boxShadow: isCurrent ? '0 0 0 3px #dcfce7' : 'none',
                  }}>
                    {isDone ? '✓' : i + 1}
                  </div>
                  <div style={{ fontSize: 10, color: isDone ? '#16a34a' : '#aaa', whiteSpace: 'nowrap' }}>
                    {s.replace(/_/g, ' ')}
                  </div>
                </div>
                {i < arr.length - 1 && (
                  <div style={{
                    width: 48, height: 2, background: statusIdx > sIdx ? '#22c55e' : '#e0e0e0',
                    margin: '0 4px', marginBottom: 20,
                  }} />
                )}
              </div>
            );
          })}
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div>
          {/* Line items */}
          <div className="pn" style={{ marginBottom: 16 }}>
            <div className="pn-h">
              <span className="pn-t">Order Items ({items.length})</span>
            </div>
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Part #</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'center' }}>Qty</th>
                    <th style={{ textAlign: 'right' }}>Unit Cost</th>
                    <th style={{ textAlign: 'right' }}>Total</th>
                  </tr>
                </thead>
                <tbody>
                  {items.length === 0 ? (
                    <tr>
                      <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#888', fontSize: 12 }}>
                        No items on this order.
                      </td>
                    </tr>
                  ) : items.map(it => (
                    <tr key={it.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#666' }}>
                        {it.partNumber || '—'}
                      </td>
                      <td style={{ fontWeight: 500, fontSize: 13 }}>{it.description || '—'}</td>
                      <td style={{ textAlign: 'center' }}>{it.quantity}</td>
                      <td style={{ textAlign: 'right', fontSize: 12 }}>
                        {it.unitCost ? `$${parseFloat(it.unitCost).toFixed(2)}` : '—'}
                      </td>
                      <td style={{ textAlign: 'right', fontWeight: 500 }}>
                        {it.unitCost
                          ? `$${(it.quantity * parseFloat(it.unitCost)).toFixed(2)}`
                          : '—'}
                      </td>
                    </tr>
                  ))}
                </tbody>
                {subtotal > 0 && (
                  <tfoot>
                    <tr>
                      <td colSpan={4} style={{ textAlign: 'right', fontWeight: 600, padding: '10px 16px', fontSize: 13 }}>Subtotal</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, padding: '10px 16px', fontSize: 14, color: '#033280' }}>
                        ${subtotal.toFixed(2)}
                      </td>
                    </tr>
                  </tfoot>
                )}
              </table>
            </div>
          </div>

          {/* Notes */}
          {(order.dealerNotes || order.operatorNotes) && (
            <div className="cd-section">
              <div className="cd-section-h">Notes</div>
              {order.dealerNotes && (
                <div className="comm-msg" style={{ padding: '12px 20px' }}>
                  <div className="comm-avatar dl">DL</div>
                  <div className="comm-content">
                    <div className="comm-name">Dealer Note</div>
                    <div className="comm-text">{order.dealerNotes}</div>
                  </div>
                </div>
              )}
              {order.operatorNotes && (
                <div className="comm-msg" style={{ padding: '12px 20px' }}>
                  <div className="comm-avatar op">OP</div>
                  <div className="comm-content">
                    <div className="comm-name">Operator Note</div>
                    <div className="comm-text">{order.operatorNotes}</div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column */}
        <div>
          {/* Order Info */}
          <div className="cd-section">
            <div className="cd-section-h">Order Info</div>
            <div className="cd-row"><span className="cd-label">Order #</span><span className="cd-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{order.orderNumber}</span></div>
            <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value">{statusBadge(order.status)}</span></div>
            <div className="cd-row"><span className="cd-label">Priority</span>
              <span className="cd-value">
                <span className={order.priority === 'urgent' ? 'bg ow' : 'bg'} style={{ fontSize: 11, padding: '2px 8px' }}>
                  {order.priority}
                </span>
              </span>
            </div>
            <div className="cd-row"><span className="cd-label">Items</span><span className="cd-value">{items.length}</span></div>
            <div className="cd-row"><span className="cd-label">Total Qty</span><span className="cd-value">{order.totalQuantity}</span></div>
            <div className="cd-row">
              <span className="cd-label">Est. Cost</span>
              <span className="cd-value" style={{ fontWeight: 600 }}>
                {order.estimatedCost ? `$${parseFloat(order.estimatedCost).toLocaleString('en-CA')}` : '—'}
              </span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Created</span>
              <span className="cd-value" style={{ fontSize: 12 }}>
                {new Date(order.createdAt).toLocaleDateString('en-CA')}
              </span>
            </div>
          </div>

          {/* Linked claim */}
          {order.claimId && (
            <div className="cd-section">
              <div className="cd-section-h">Linked Claim</div>
              <div className="cd-row">
                <span className="cd-label">Claim ID</span>
                <span
                  className="cd-value cid"
                  style={{ fontSize: 12, fontFamily: 'monospace', cursor: 'pointer', color: '#2563eb' }}
                  onClick={() => {
                    if (isOperator) navigate(`/operator/admin/claims/${order.claimId}`);
                    else if (user?.dealershipId && isDealerOwner)
                      navigate(`/${user.dealershipId}/owner/claims/${order.claimId}`);
                  }}
                >
                  {order.claimId.slice(0, 8)}…
                </span>
              </div>
            </div>
          )}

          {/* Shipping / tracking */}
          <div className="cd-section">
            <div className="cd-section-h">Shipping & Tracking</div>
            <div className="cd-row">
              <span className="cd-label">Supplier Ref</span>
              <span className="cd-value" style={{ color: order.supplierOrderRef ? 'inherit' : '#aaa' }}>
                {order.supplierOrderRef || '—'}
              </span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Carrier</span>
              <span className="cd-value" style={{ color: order.carrier ? 'inherit' : '#aaa' }}>
                {order.carrier || '—'}
              </span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Tracking #</span>
              <span className="cd-value" style={{ color: order.trackingNumber ? '#2563eb' : '#aaa', fontFamily: 'monospace', fontSize: 12 }}>
                {order.trackingNumber || '—'}
              </span>
            </div>
            <div className="cd-row">
              <span className="cd-label">ETA</span>
              <span className="cd-value" style={{ color: order.eta ? 'inherit' : '#aaa' }}>
                {order.eta ? new Date(order.eta).toLocaleDateString('en-CA') : '—'}
              </span>
            </div>
            {order.shippedAt && (
              <div className="cd-row">
                <span className="cd-label">Shipped</span>
                <span className="cd-value" style={{ fontSize: 12 }}>
                  {new Date(order.shippedAt).toLocaleDateString('en-CA')}
                </span>
              </div>
            )}
            {order.receivedAt && (
              <div className="cd-row">
                <span className="cd-label">Received</span>
                <span className="cd-value" style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>
                  {new Date(order.receivedAt).toLocaleDateString('en-CA')}
                </span>
              </div>
            )}
          </div>

          {/* Operator: update status + tracking */}
          {canUpdateStatus && order.status !== 'received' && order.status !== 'cancelled' && (
            <div className="cd-section">
              <div className="cd-section-h">Update Order</div>
              <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select
                  value={toStatus}
                  onChange={e => setToStatus(e.target.value)}
                  style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa' }}
                >
                  <option value="">Select new status…</option>
                  <option value="sourcing">Sourcing</option>
                  <option value="submitted_to_supplier">Submitted to Supplier</option>
                  <option value="supplier_ack">Supplier Acknowledged</option>
                  <option value="shipped">Shipped</option>
                  <option value="received">Received</option>
                  <option value="cancelled">Cancelled</option>
                </select>

                {(toStatus === 'submitted_to_supplier' || toStatus === 'supplier_ack') && (
                  <input
                    value={supplierRef}
                    onChange={e => setSupplierRef(e.target.value)}
                    placeholder="Supplier order reference"
                    style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                  />
                )}

                {toStatus === 'shipped' && (
                  <>
                    <input
                      value={carrier}
                      onChange={e => setCarrier(e.target.value)}
                      placeholder="Carrier (e.g. FedEx, UPS, Purolator)"
                      style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                    />
                    <input
                      value={trackingNumber}
                      onChange={e => setTrackingNumber(e.target.value)}
                      placeholder="Tracking number"
                      style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                    />
                  </>
                )}

                <button
                  className="btn btn-p btn-sm"
                  onClick={() => handleTransition()}
                  disabled={isSaving || !toStatus}
                >
                  {isSaving ? 'Saving…' : 'Update Status'}
                </button>
              </div>
            </div>
          )}

          {/* Parts manager / dealer owner: mark received */}
          {canMarkReceived && !['received', 'cancelled'].includes(order.status) && (
            <div className="cd-section">
              <div className="cd-section-h">Actions</div>
              <div style={{ padding: '14px 20px' }}>
                <button
                  className="btn btn-p btn-sm"
                  style={{ width: '100%' }}
                  onClick={() => handleTransition('received')}
                  disabled={isSaving}
                >
                  {isSaving ? 'Saving…' : 'Mark as Received'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
