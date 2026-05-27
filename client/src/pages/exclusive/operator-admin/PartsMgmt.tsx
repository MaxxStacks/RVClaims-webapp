import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

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

export default function PartsMgmt() {
  const [, navigate] = useLocation();
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [tab, setTab] = useState<'pending' | 'shipped' | 'received' | 'all'>('pending');
  const [transitioning, setTransitioning] = useState<string | null>(null);

  const load = () => {
    setLoading(true);
    setError('');
    apiFetch<any[]>('/api/parts-orders')
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setError('Failed to load parts orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const transition = async (id: string, toStatus: string, extra?: Record<string, string>) => {
    setTransitioning(id);
    try {
      await apiFetch(`/api/parts-orders/${id}/transition`, {
        method: 'POST',
        body: JSON.stringify({ toStatus, ...extra }),
      });
      load();
    } catch {
      // silently fail
    } finally {
      setTransitioning(null);
    }
  };

  const pending  = orders.filter(o => ['requested', 'sourcing', 'submitted_to_supplier', 'supplier_ack'].includes(o.status));
  const shipped  = orders.filter(o => o.status === 'shipped');
  const received = orders.filter(o => o.status === 'received');

  const display = tab === 'all' ? orders : tab === 'pending' ? pending : tab === 'shipped' ? shipped : received;

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Pending</div><div className="sc-v" style={{ color: '#d97706' }}>{pending.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Shipped</div><div className="sc-v" style={{ color: '#ca8a04' }}>{shipped.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Received</div><div className="sc-v" style={{ color: '#16a34a' }}>{received.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Orders</div><div className="sc-v">{orders.length}</div></div>
      </div>

      <div className="tabs" style={{ marginBottom: 0 }}>
        <div className={`tab ${tab === 'pending' ? 'active' : ''}`} onClick={() => setTab('pending')}>Pending ({pending.length})</div>
        <div className={`tab ${tab === 'shipped' ? 'active' : ''}`} onClick={() => setTab('shipped')}>Shipped ({shipped.length})</div>
        <div className={`tab ${tab === 'received' ? 'active' : ''}`} onClick={() => setTab('received')}>Received ({received.length})</div>
        <div className={`tab ${tab === 'all' ? 'active' : ''}`} onClick={() => setTab('all')}>All ({orders.length})</div>
      </div>

      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading parts orders…</div>}
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
                  <th>Priority</th>
                  <th>Status</th>
                  <th>Tracking</th>
                  <th>Date</th>
                  <th>Actions</th>
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
                      <td>
                        {o.priority === 'urgent'
                          ? <span className="bg denied" style={{ fontSize: 11 }}>Urgent</span>
                          : <span style={{ fontSize: 12, color: '#888' }}>Normal</span>
                        }
                      </td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>
                          {o.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#555' }}>
                        {o.trackingNumber ? (
                          <span>{o.carrier ? `${o.carrier}: ` : ''}{o.trackingNumber}</span>
                        ) : '—'}
                      </td>
                      <td style={{ fontSize: 12, color: '#9ca3af' }}>{fmtDate(o.createdAt)}</td>
                      <td>
                        {o.status === 'requested' && (
                          <button
                            className="btn btn-p btn-sm"
                            disabled={transitioning === o.id}
                            onClick={() => transition(o.id, 'sourcing')}
                          >
                            Start Sourcing
                          </button>
                        )}
                        {o.status === 'sourcing' && (
                          <button
                            className="btn btn-p btn-sm"
                            disabled={transitioning === o.id}
                            onClick={() => transition(o.id, 'submitted_to_supplier')}
                          >
                            Mark Submitted
                          </button>
                        )}
                        {o.status === 'submitted_to_supplier' && (
                          <button
                            className="btn btn-s btn-sm"
                            disabled={transitioning === o.id}
                            onClick={() => transition(o.id, 'supplier_ack')}
                          >
                            Supplier Ack'd
                          </button>
                        )}
                        {o.status === 'supplier_ack' && (
                          <button
                            className="btn btn-s btn-sm"
                            disabled={transitioning === o.id}
                            onClick={() => transition(o.id, 'shipped')}
                          >
                            Mark Shipped
                          </button>
                        )}
                        {o.status === 'shipped' && (
                          <button
                            className="btn btn-s btn-sm"
                            disabled={transitioning === o.id}
                            onClick={() => transition(o.id, 'received')}
                          >
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
