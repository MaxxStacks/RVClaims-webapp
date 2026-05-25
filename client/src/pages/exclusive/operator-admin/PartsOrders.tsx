import { useState, useEffect } from 'react';
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
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PartsOrders() {
  const [orders, setOrders] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [filterDealer, setFilterDealer] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [transitioning, setTransitioning] = useState<string | null>(null);
  const [trackingInputs, setTrackingInputs] = useState<Record<string, { carrier: string; tracking: string }>>({});

  const load = () => {
    setLoading(true);
    setError('');
    const params = new URLSearchParams();
    if (filterDealer) params.set('dealershipId', filterDealer);
    apiFetch<any[]>(`/api/v6/parts-orders${params.toString() ? '?' + params : ''}`)
      .then(d => setOrders(Array.isArray(d) ? d : []))
      .catch(() => setError('Failed to load parts orders.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [filterDealer]);

  const transition = async (id: string, toStatus: string, extra?: Record<string, string>) => {
    setTransitioning(id);
    try {
      await apiFetch(`/api/v6/parts-orders/${id}/transition`, {
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

  const displayed = filterStatus ? orders.filter(o => o.status === filterStatus) : orders;

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Orders</div><div className="sc-v">{orders.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Pending</div><div className="sc-v" style={{ color: '#d97706' }}>{orders.filter(o => ['requested','sourcing'].includes(o.status)).length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>In Transit</div><div className="sc-v" style={{ color: '#ca8a04' }}>{orders.filter(o => ['shipped','supplier_ack','submitted_to_supplier'].includes(o.status)).length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Received</div><div className="sc-v" style={{ color: '#16a34a' }}>{orders.filter(o => o.status === 'received').length}</div></div>
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 14 }}>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit' }}
        >
          <option value="">All statuses</option>
          <option value="requested">Requested</option>
          <option value="sourcing">Sourcing</option>
          <option value="submitted_to_supplier">Submitted to Supplier</option>
          <option value="supplier_ack">Supplier Ack'd</option>
          <option value="shipped">Shipped</option>
          <option value="received">Received</option>
          <option value="cancelled">Cancelled</option>
        </select>
        <button className="btn btn-o btn-sm" onClick={load} style={{ alignSelf: 'center' }}>Refresh</button>
      </div>

      <div className="pn">
        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading…</div>}
        {error && (
          <div style={{ padding: 20, color: '#dc2626', fontSize: 13 }}>
            {error} <button className="btn btn-o btn-sm" onClick={load} style={{ marginLeft: 8 }}>Retry</button>
          </div>
        )}
        {!loading && !error && displayed.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>No parts orders found.</div>
        )}
        {!loading && !error && displayed.length > 0 && displayed.map((o: any) => {
          const style = STATUS_STYLE[o.status] || { bg: '#f3f4f6', color: '#6b7280' };
          const tin = trackingInputs[o.id] || { carrier: '', tracking: '' };
          return (
            <div key={o.id} style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16 }}>
                <div style={{ flex: 1 }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 6 }}>
                    <span style={{ fontWeight: 700, fontSize: 13, color: 'var(--brand)' }}>{o.orderNumber}</span>
                    <span style={{ padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>
                      {o.status?.replace(/_/g, ' ').replace(/\b\w/g, (l: string) => l.toUpperCase())}
                    </span>
                    {o.priority === 'urgent' && <span className="bg denied" style={{ fontSize: 10 }}>Urgent</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#6b7280' }}>
                    Claim: {o.claimId ? o.claimId.slice(0, 8).toUpperCase() : '—'} &nbsp;·&nbsp;
                    Supplier: {o.supplier || 'TBD'} &nbsp;·&nbsp;
                    Qty: {o.totalQuantity || 1} &nbsp;·&nbsp;
                    Created: {fmtDate(o.createdAt)}
                  </div>
                  {o.dealerNotes && (
                    <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 4, fontStyle: 'italic' }}>{o.dealerNotes}</div>
                  )}
                  {o.trackingNumber && (
                    <div style={{ fontSize: 12, color: '#555', marginTop: 4 }}>
                      Tracking: {o.carrier ? `${o.carrier} — ` : ''}{o.trackingNumber}
                    </div>
                  )}
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                  {o.status === 'requested' && (
                    <button className="btn btn-p btn-sm" disabled={transitioning === o.id} onClick={() => transition(o.id, 'sourcing')}>
                      Start Sourcing
                    </button>
                  )}
                  {o.status === 'sourcing' && (
                    <button className="btn btn-p btn-sm" disabled={transitioning === o.id} onClick={() => transition(o.id, 'submitted_to_supplier')}>
                      Submit to Supplier
                    </button>
                  )}
                  {o.status === 'submitted_to_supplier' && (
                    <button className="btn btn-s btn-sm" disabled={transitioning === o.id} onClick={() => transition(o.id, 'supplier_ack')}>
                      Mark Acknowledged
                    </button>
                  )}
                  {o.status === 'supplier_ack' && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 6, alignItems: 'flex-end' }}>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <input
                          placeholder="Carrier (e.g. FedEx)"
                          value={tin.carrier}
                          onChange={e => setTrackingInputs(prev => ({ ...prev, [o.id]: { ...tin, carrier: e.target.value } }))}
                          style={{ width: 100, padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontFamily: 'inherit' }}
                        />
                        <input
                          placeholder="Tracking #"
                          value={tin.tracking}
                          onChange={e => setTrackingInputs(prev => ({ ...prev, [o.id]: { ...tin, tracking: e.target.value } }))}
                          style={{ width: 120, padding: '5px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontFamily: 'inherit' }}
                        />
                      </div>
                      <button
                        className="btn btn-s btn-sm"
                        disabled={transitioning === o.id}
                        onClick={() => transition(o.id, 'shipped', { carrier: tin.carrier, trackingNumber: tin.tracking })}
                      >
                        Mark Shipped
                      </button>
                    </div>
                  )}
                  {o.status === 'shipped' && (
                    <button className="btn btn-s btn-sm" disabled={transitioning === o.id} onClick={() => transition(o.id, 'received')}>
                      Confirm Received
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
