import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function PayoutTracking() {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    apiFetch<any[]>(`/api/marketplace/transactions?sellerId=${user.id}`)
      .then(d => setTransactions(Array.isArray(d) ? d : []))
      .catch(() => setTransactions([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const completed = transactions.filter(t => t.status === 'completed' || t.status === 'paid');
  const pending = transactions.filter(t => t.status === 'pending' || t.status === 'escrow_active');

  const lifetimeEarnings = completed.reduce((sum: number, t: any) => {
    const sale = parseFloat(t.salePrice || t.amount || '0');
    const commission = parseFloat(t.commission || '250');
    return sum + Math.max(0, sale - commission);
  }, 0);

  const pendingPayout = pending.reduce((sum: number, t: any) => {
    const sale = parseFloat(t.salePrice || t.amount || '0');
    return sum + Math.max(0, sale - 250);
  }, 0);

  return (
    <div className="page active">
      <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Lifetime Earnings</div><div className="sc-v" style={{color:'#22c55e'}}>{lifetimeEarnings ? `$${lifetimeEarnings.toLocaleString()}` : '$0'}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Pending Payout</div><div className="sc-v" style={{color:'#f59e0b'}}>{pendingPayout ? `$${pendingPayout.toLocaleString()}` : '$0'}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Completed Sales</div><div className="sc-v">{completed.length}</div></div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Payout History</span></div>
        {loading && <div style={{padding:32,textAlign:'center',color:'#888'}}>Loading...</div>}
        {!loading && completed.length === 0 && (
          <div style={{padding:'40px 20px',textAlign:'center',color:'#888',fontSize:13}}>
            No completed payouts yet. Payouts appear here after a sale is settled.
          </div>
        )}
        {!loading && completed.length > 0 && (
          <div className="tw"><table><thead><tr><th>Date</th><th>Unit</th><th>Sale Price</th><th>Commission</th><th>Your Payout</th><th>Method</th><th>Status</th></tr></thead><tbody>
            {completed.map((t: any) => {
              const salePrice = parseFloat(t.salePrice || t.amount || '0');
              const commission = parseFloat(t.commission || '250');
              const payout = Math.max(0, salePrice - commission);
              const settledDate = t.settledAt || t.completedAt || t.updatedAt;
              return (
                <tr key={t.id}>
                  <td>{settledDate ? new Date(settledDate).toLocaleDateString('en-CA', {year:'numeric',month:'short',day:'numeric'}) : '—'}</td>
                  <td>{t.listing?.title || t.unitDescription || '—'}</td>
                  <td>{salePrice ? `$${salePrice.toLocaleString()}` : '—'}</td>
                  <td>${commission.toLocaleString()} ({salePrice ? ((commission / salePrice) * 100).toFixed(1) : 0}%)</td>
                  <td style={{color:'#22c55e',fontWeight:600}}>{payout ? `$${payout.toLocaleString()}` : '—'}</td>
                  <td>{t.payoutMethod || 'Interac e-Transfer'}</td>
                  <td><span className="bg active">Paid</span></td>
                </tr>
              );
            })}
          </tbody></table></div>
        )}
      </div>
    </div>
  );
}
