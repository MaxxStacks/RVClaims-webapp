import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';

const STATUS_STYLE: Record<string, { bg: string; color: string; label: string }> = {
  pending:    { bg: '#fef3c7', color: '#d97706', label: 'Escrow Active' },
  in_transit: { bg: '#dbeafe', color: '#2563eb', label: 'In Transit' },
  inspection: { bg: '#e0e7ff', color: '#4338ca', label: 'Inspection' },
  completed:  { bg: '#dcfce7', color: '#16a34a', label: 'Completed' },
  settled:    { bg: '#dcfce7', color: '#16a34a', label: 'Settled' },
  disputed:   { bg: '#fee2e2', color: '#dc2626', label: 'Disputed' },
  cancelled:  { bg: '#f3f4f6', color: '#6b7280', label: 'Cancelled' },
};

export default function MktTransactionDetail() {
  const [, navigate] = useLocation();
  const { txnId } = useParams<{ txnId: string }>();
  const [txn, setTxn] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [acting, setActing] = useState(false);
  const [actionMsg, setActionMsg] = useState('');

  useEffect(() => {
    if (!txnId) return;
    apiFetch<any[]>(`/api/marketplace/transactions?id=${txnId}`)
      .then(d => {
        const rows = Array.isArray(d) ? d : [];
        const match = rows.find((t: any) => t.id === txnId) || rows[0] || null;
        setTxn(match);
      })
      .catch(() => setError('Transaction not found.'))
      .finally(() => setLoading(false));
  }, [txnId]);

  const updateStatus = async (newStatus: string) => {
    if (!txnId) return;
    setActing(true);
    try {
      await apiFetch(`/api/marketplace/transactions/${txnId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      setTxn((prev: any) => prev ? { ...prev, status: newStatus } : prev);
      setActionMsg(newStatus === 'completed' ? 'Sale completed. Hold captured.' : 'Hold released. Transaction cancelled.');
    } catch (e: any) {
      setActionMsg(e?.message || 'Action failed.');
    } finally {
      setActing(false);
    }
  };

  if (loading) return <div className="page active"><div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Loading…</div></div>;
  if (error || !txn) {
    return (
      <div className="page active">
        <div style={{ padding: 48, textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          {error || 'Transaction not found.'}{' '}
          <button className="btn btn-o btn-sm" onClick={() => navigate('/operator/admin/marketplace/transactions')} style={{ marginLeft: 8 }}>Back to Transactions</button>
        </div>
      </div>
    );
  }

  const style = STATUS_STYLE[txn.status] || { bg: '#f3f4f6', color: '#6b7280', label: txn.status };
  const salePrice = parseFloat(txn.salePrice || '0');

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('/operator/admin/marketplace/transactions')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">{txn.transactionNumber || txn.id.slice(0, 8).toUpperCase()} — {style.label}</div>
          <div className="detail-meta">{salePrice ? `$${salePrice.toLocaleString()}` : 'Price not set'}</div>
        </div>
        <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, ...style }}>{style.label}</span>
      </div>

      {actionMsg && (
        <div style={{ padding: '10px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#166534' }}>
          {actionMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          <div className="pn" style={{ marginBottom: 16 }}>
            <div className="pn-h"><span className="pn-t">Transaction Details</span></div>
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>Transaction #</div>
                <div style={{ fontWeight: 600, fontFamily: 'monospace' }}>{txn.transactionNumber || txn.id.slice(0, 8).toUpperCase()}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>Status</div>
                <span style={{ padding: '3px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600, ...style }}>{style.label}</span>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>Listing ID</div>
                <div style={{ fontSize: 13, fontFamily: 'monospace' }}>{txn.listingId ? txn.listingId.slice(0, 8).toUpperCase() : '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#94a3b8', marginBottom: 3 }}>Created</div>
                <div style={{ fontSize: 13 }}>{txn.createdAt ? new Date(txn.createdAt).toLocaleDateString('en-CA') : '—'}</div>
              </div>
            </div>
          </div>
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Parties</span></div>
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', marginBottom: 8 }}>Buyer</div>
                <div style={{ fontSize: 13 }}>{txn.buyer?.businessName || txn.buyerName || 'Buyer ID: ' + (txn.buyerId?.slice(0, 8) || '—')}</div>
                {txn.buyer?.contactEmail && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{txn.buyer.contactEmail}</div>}
              </div>
              <div>
                <div style={{ fontSize: 12, fontWeight: 600, color: '#059669', marginBottom: 8 }}>Seller</div>
                <div style={{ fontSize: 13 }}>{txn.seller?.businessName || txn.sellerName || 'Seller ID: ' + (txn.sellerId?.slice(0, 8) || '—')}</div>
                {txn.seller?.contactEmail && <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{txn.seller.contactEmail}</div>}
              </div>
            </div>
          </div>
        </div>

        <div>
          <div className="cd-section">
            <div className="cd-section-h">Financials</div>
            <div className="cd-row"><span className="cd-label">Sale Price</span><span className="cd-value" style={{ fontWeight: 600 }}>{salePrice ? `$${salePrice.toLocaleString()}` : '—'}</span></div>
            <div className="cd-row"><span className="cd-label">Escrow Hold</span><span className="cd-value">$500</span></div>
            <div className="cd-row"><span className="cd-label">Commission</span><span className="cd-value" style={{ color: 'var(--brand)', fontWeight: 600 }}>$250</span></div>
          </div>

          {['pending', 'in_transit', 'inspection'].includes(txn.status) && (
            <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 8 }}>
              <button
                className="btn btn-s btn-sm"
                style={{ width: '100%', justifyContent: 'center' }}
                disabled={acting}
                onClick={() => { if (window.confirm('Complete sale: capture $500 hold and collect $250 commission?')) updateStatus('completed'); }}
              >
                Complete Sale & Capture Hold
              </button>
              <button
                className="btn btn-o btn-sm"
                style={{ width: '100%', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5' }}
                disabled={acting}
                onClick={() => { if (window.confirm('Release $500 hold to buyer and cancel this transaction?')) updateStatus('cancelled'); }}
              >
                Release Hold & Cancel
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
