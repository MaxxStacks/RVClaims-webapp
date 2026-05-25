import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  requested:             { bg: '#fef3c7', color: '#d97706' },
  sourcing:              { bg: '#e0e7ff', color: '#4338ca' },
  submitted_to_supplier: { bg: '#dbeafe', color: '#2563eb' },
  supplier_ack:          { bg: '#ede9fe', color: '#7c3aed' },
  shipped:               { bg: '#fef9c3', color: '#ca8a04' },
  received:              { bg: '#dcfce7', color: '#16a34a' },
  cancelled:             { bg: '#f3f4f6', color: '#6b7280' },
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

export default function Inventory() {
  const { user } = useAuth();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'active' | 'received' | 'all'>('active');

  const did = user?.dealershipId;

  const load = () => {
    if (!did) return;
    setLoading(true);
    setError('');
    apiFetch<any[]>(`/api/v6/parts-orders?dealershipId=${did}`)
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setError('Failed to load parts orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [did]);

  const active   = orders.filter(o => !['received', 'cancelled'].includes(o.status));
  const received = orders.filter(o => o.status === 'received');
  const display  = tab === 'all' ? orders : tab === 'received' ? received : active;

  const markReceived = async (id: string) => {
    try {
      await apiFetch(`/api/v6/parts-orders/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ toStatus: 'received' }),
      });
      load();
    } catch {
      // silently fail
    }
  };

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Active Orders</div><div className="sc-v" style={{ color: '#d97706' }}>{active.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Received</div><div className="sc-v" style={{ color: '#16a34a' }}>{received.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total</div><div className="sc-v">{orders.length}</div></div>
      </div>

      <div className="tabs" style={{ marginBottom: 0 }}>
        <div className={`tab ${tab === 'active' ? 'active' : ''}`} onClick={() => setTab('active')}>Active Orders ({active.length})</div>
        <div className={`tab ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>Received ({received.length})</div>
        <div className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All ({orders.length})</div>
      </div>

      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading…</div>}
        {error && (
          <div style={{ padding: 20, color: '#dc2626', fontSize: 13 }}>
            {error} <button className="btn btn-o btn-sm" onClick={load} style={{ marginLeft: 8 }}>Retry</button>
          </div>
        )}
        {!loading && !error && display.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>
            No parts orders in this category.
          </div>
        )}
        {!loading && !error && display.length > 0 && (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Order #</th>
                  <th>Claim</th>
                  <th>Supplier</th>
                  <th>Qty</th>
                  <th>Status</th>
                  <th>Tracking</th>
                  <th>Created</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {display.map((o: any) => {
                  const style = STATUS_STYLE[o.status] || { bg: '#f3f4f6', color: '#6b7280' };
                  return (
                    <tr key={o.id}>
                      <td style={{ fontWeight: 500, color: 'var(--brand)' }}>{o.orderNumber}</td>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{o.claimId ? o.claimId.slice(0, 8).toUpperCase() : '—'}</td>
                      <td>{o.supplier || '—'}</td>
                      <td>{o.totalQuantity || 1}</td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>
                          {o.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#555' }}>
                        {o.trackingNumber ? `${o.carrier ? o.carrier + ': ' : ''}${o.trackingNumber}` : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: '#9ca3af' }}>{fmtDate(o.createdAt)}</td>
                      <td>
                        {o.status === 'shipped' && (
                          <button className="btn btn-s btn-sm" onClick={() => markReceived(o.id)}>
                            Mark Received
                          </button>
                        )}
                      </td>
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
