import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const STATUS_STYLE: Record<string, { bg: string; color: string }> = {
  pending:    { bg: '#fef3c7', color: '#d97706' },
  in_transit: { bg: '#dbeafe', color: '#2563eb' },
  inspection: { bg: '#e0e7ff', color: '#4338ca' },
  completed:  { bg: '#dcfce7', color: '#16a34a' },
  settled:    { bg: '#dcfce7', color: '#16a34a' },
  disputed:   { bg: '#fee2e2', color: '#dc2626' },
  cancelled:  { bg: '#f3f4f6', color: '#6b7280' },
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

export default function Transactions() {
  const { user } = useAuth();
  const [txnTab, setTxnTab] = useState<'purchases' | 'sales' | 'all'>('purchases');
  const [purchases, setPurchases] = useState<any[]>([]);
  const [sales, setSales] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const memberId = user?.id;

  const load = () => {
    if (!memberId) return;
    setLoading(true);
    setError('');
    Promise.all([
      apiFetch<any[]>(`/api/marketplace/transactions?buyerId=${memberId}`).catch(() => []),
      apiFetch<any[]>(`/api/marketplace/transactions?sellerId=${memberId}`).catch(() => []),
    ]).then(([buys, sells]) => {
      setPurchases(Array.isArray(buys) ? buys : []);
      setSales(Array.isArray(sells) ? sells : []);
    }).catch(() => setError('Failed to load transactions.')).finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, [memberId]);

  const display = txnTab === 'purchases' ? purchases : txnTab === 'sales' ? sales : [...purchases, ...sales];

  return (
    <div className="page active">
      <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>
        Your purchases and sales through the Dealer Suite 360 Marketplace.
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Purchases</div><div className="sc-v" style={{ color: '#2563eb' }}>{purchases.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Sales</div><div className="sc-v" style={{ color: '#059669' }}>{sales.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total</div><div className="sc-v">{purchases.length + sales.length}</div></div>
      </div>

      <div className="tabs" style={{ marginBottom: 0 }}>
        <div className={`tab ${txnTab === 'purchases' ? 'active' : ''}`} onClick={() => setTxnTab('purchases')}>
          Purchases ({purchases.length})
        </div>
        <div className={`tab ${txnTab === 'sales' ? 'active' : ''}`} onClick={() => setTxnTab('sales')}>
          Sales ({sales.length})
        </div>
        <div className={`tab ${txnTab === 'all' ? 'active' : ''}`} onClick={() => setTxnTab('all')}>
          All ({purchases.length + sales.length})
        </div>
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
            No {txnTab === 'all' ? '' : txnTab} transactions yet.
          </div>
        )}
        {!loading && !error && display.length > 0 && (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Transaction</th>
                  <th>Type</th>
                  <th>{txnTab === 'all' ? 'Counterparty' : txnTab === 'purchases' ? 'Seller' : 'Buyer'}</th>
                  <th>Sale Price</th>
                  <th>Escrow Hold</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {display.map((t: any) => {
                  const isPurchase = purchases.find(p => p.id === t.id);
                  const salePrice = parseFloat(t.salePrice || '0');
                  const style = STATUS_STYLE[t.status] || { bg: '#f3f4f6', color: '#6b7280' };
                  return (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500, color: 'var(--brand)', fontFamily: 'monospace', fontSize: 12 }}>
                        {t.transactionNumber || t.id.slice(0, 8).toUpperCase()}
                      </td>
                      <td>
                        {txnTab === 'all'
                          ? <span className={`bg ${isPurchase ? 'submitted' : 'pay-recv'}`} style={{ fontSize: 11 }}>{isPurchase ? 'Purchase' : 'Sale'}</span>
                          : '—'
                        }
                      </td>
                      <td style={{ fontSize: 13 }}>
                        {isPurchase
                          ? (t.seller?.businessName || t.sellerName || '—')
                          : (t.buyer?.businessName || t.buyerName || '—')
                        }
                      </td>
                      <td style={{ fontWeight: 600 }}>{salePrice ? `$${salePrice.toLocaleString()}` : '—'}</td>
                      <td style={{ color: '#d97706' }}>$500</td>
                      <td>
                        <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>
                          {t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1).replace(/_/g, ' ') : '—'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#9ca3af' }}>{fmtDate(t.createdAt)}</td>
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
