import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function MktTransactions() {
  const [, navigate] = useLocation();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [txnTab, setTxnTab] = useState<'holds' | 'completed' | 'cancelled'>('holds');

  useEffect(() => {
    apiFetch<any[]>('/api/marketplace/transactions')
      .then(d => setTransactions(Array.isArray(d) ? d : []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, []);

  const holds = transactions.filter(t => t.status === 'escrow_active' || t.status === 'hold' || t.status === 'pending');
  const completed = transactions.filter(t => t.status === 'completed' || t.status === 'settled' || t.status === 'paid');
  const cancelled = transactions.filter(t => t.status === 'cancelled' || t.status === 'refunded' || t.status === 'released');

  const escrowTotal = holds.reduce((s: number, t: any) => s + parseFloat(t.holdAmount || t.escrowAmount || '500'), 0);
  const commissionMtd = completed.length * 250;
  const commissionYtd = commissionMtd;

  return (
    <div className="page active">
      <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:16,marginBottom:20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Active Holds</div><div className="sc-v" style={{color:'#d97706'}}>{holds.length}</div><div style={{fontSize:12,color:'#888'}}>${escrowTotal.toLocaleString()} in escrow</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Completed (MTD)</div><div className="sc-v" style={{color:'#22c55e'}}>{completed.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Commission (MTD)</div><div className="sc-v">${commissionMtd.toLocaleString()}</div><div style={{fontSize:12,color:'#888'}}>{completed.length} × $250</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Commission (YTD)</div><div className="sc-v">${commissionYtd.toLocaleString()}</div></div>
      </div>
      <div className="tabs">
        <div className={`tab ${txnTab === 'holds' ? 'active' : ''}`} onClick={() => setTxnTab('holds')}>Active Holds ({holds.length})</div>
        <div className={`tab ${txnTab === 'completed' ? 'active' : ''}`} onClick={() => setTxnTab('completed')}>Completed ({completed.length})</div>
        <div className={`tab ${txnTab === 'cancelled' ? 'active' : ''}`} onClick={() => setTxnTab('cancelled')}>Released / Cancelled ({cancelled.length})</div>
      </div>
      <div className="pn" style={{borderTop:'none',borderRadius:'0 0 8px 8px'}}>
        {loading && <div style={{padding:32,textAlign:'center',color:'#888'}}>Loading...</div>}

        {!loading && txnTab === 'holds' && (
          <div className="tw"><table><thead><tr><th>Transaction</th><th>Listing</th><th>Unit</th><th>Buyer</th><th>Seller</th><th>Hold</th><th>Sale Price</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {holds.length === 0
              ? <tr><td colSpan={9} style={{textAlign:'center',color:'#888',padding:20}}>No active holds</td></tr>
              : holds.map(t => {
                  const salePrice = parseFloat(t.salePrice || t.amount || '0');
                  const holdAmt = parseFloat(t.holdAmount || t.escrowAmount || '500');
                  return (
                    <tr key={t.id}>
                      <td style={{fontWeight:500,color:'var(--brand)'}}><span className="cid" onClick={() => navigate(`/operator/admin/marketplace/transactions/${t.id}`)}>{t.id?.slice(0,8).toUpperCase() || '—'}</span></td>
                      <td>{t.listingId?.slice(0,8).toUpperCase() || '—'}</td>
                      <td>{t.listing?.title || t.unitDescription || '—'}</td>
                      <td>{t.buyer?.businessName || t.buyerName || '—'}</td>
                      <td>{t.seller?.businessName || t.sellerName || '—'}</td>
                      <td style={{color:'#d97706',fontWeight:600}}>${holdAmt.toLocaleString()}</td>
                      <td>{salePrice ? `$${salePrice.toLocaleString()}` : '—'}</td>
                      <td><span className="bg" style={{background:'#fef3c7',color:'#d97706'}}>Escrow Active</span></td>
                      <td><button className="btn btn-o btn-sm" onClick={() => navigate(`/operator/admin/marketplace/transactions/${t.id}`)}>Manage</button></td>
                    </tr>
                  );
                })
            }
          </tbody></table></div>
        )}

        {!loading && txnTab === 'completed' && (
          <div className="tw"><table><thead><tr><th>Transaction</th><th>Unit</th><th>Buyer</th><th>Seller</th><th>Sale Price</th><th>Commission</th><th>Completed</th></tr></thead><tbody>
            {completed.length === 0
              ? <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:20}}>No completed transactions</td></tr>
              : completed.map(t => {
                  const salePrice = parseFloat(t.salePrice || t.amount || '0');
                  const doneDate = t.settledAt || t.completedAt || t.updatedAt;
                  return (
                    <tr key={t.id}>
                      <td style={{fontWeight:500,color:'var(--brand)'}}>{t.id?.slice(0,8).toUpperCase() || '—'}</td>
                      <td>{t.listing?.title || t.unitDescription || '—'}</td>
                      <td>{t.buyer?.businessName || t.buyerName || '—'}</td>
                      <td>{t.seller?.businessName || t.sellerName || '—'}</td>
                      <td>{salePrice ? `$${salePrice.toLocaleString()}` : '—'}</td>
                      <td style={{color:'#22c55e',fontWeight:600}}>$250</td>
                      <td>{doneDate ? new Date(doneDate).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
                    </tr>
                  );
                })
            }
          </tbody></table></div>
        )}

        {!loading && txnTab === 'cancelled' && (
          <div className="tw"><table><thead><tr><th>Transaction</th><th>Unit</th><th>Buyer</th><th>Reason</th><th>Hold</th><th>Date</th></tr></thead><tbody>
            {cancelled.length === 0
              ? <tr><td colSpan={6} style={{textAlign:'center',color:'#888',padding:20}}>No cancelled transactions</td></tr>
              : cancelled.map(t => {
                  const cancelDate = t.cancelledAt || t.updatedAt;
                  return (
                    <tr key={t.id}>
                      <td style={{fontWeight:500,color:'var(--brand)'}}>{t.id?.slice(0,8).toUpperCase() || '—'}</td>
                      <td>{t.listing?.title || t.unitDescription || '—'}</td>
                      <td>{t.buyer?.businessName || t.buyerName || '—'}</td>
                      <td style={{fontSize:12,color:'#888'}}>{t.cancellationReason || '—'}</td>
                      <td style={{color:'#22c55e'}}>$500 refunded</td>
                      <td>{cancelDate ? new Date(cancelDate).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
                    </tr>
                  );
                })
            }
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}
