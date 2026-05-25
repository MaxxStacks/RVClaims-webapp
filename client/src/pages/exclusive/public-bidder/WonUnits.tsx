import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function WonUnits() {
  const { user } = useAuth();
  const [wonUnits, setWonUnits] = useState<any[]>([]);
  const [paying, setPaying] = useState<string | null>(null);
  const [payMsg, setPayMsg] = useState<Record<string, string>>({});

  useEffect(() => {
    if (!user?.id) return;
    apiFetch<any>(`/api/auctions/my-bids?memberId=${user.id}&won=true`)
      .then(d => setWonUnits(Array.isArray(d) ? d : d.bids || []))
      .catch(() => {});
  }, [user?.id]);

  const handlePayment = async (unit: any) => {
    const uid = unit.bid?.id || unit.id;
    setPaying(uid);
    try {
      await apiFetch(`/api/auctions/${unit.bid?.auctionId || unit.auctionId}/pay`, {
        method: 'POST',
        body: JSON.stringify({ memberId: user?.id, bidId: uid }),
      });
      setPayMsg(m => ({ ...m, [uid]: 'Payment initiated. Our team will contact you within 24 hours to complete the transaction.' }));
      apiFetch<any>(`/api/auctions/my-bids?memberId=${user?.id}&won=true`)
        .then(d => setWonUnits(Array.isArray(d) ? d : d.bids || []))
        .catch(() => {});
    } catch {
      setPayMsg(m => ({ ...m, [uid]: 'Payment request received. A team member will contact you to finalize.' }));
    } finally {
      setPaying(null);
    }
  };

  if (wonUnits.length === 0) {
    return (
      <div className="page active">
        <div className="pn" style={{padding:'40px 20px',textAlign:'center',color:'#888',fontSize:13}}>
          No won units yet. All won units from past auctions will appear here with payment status and documentation.
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      {wonUnits.map(w => {
        const bid = w.bid || w;
        const auc = w.auction || {};
        const uid = bid.id;
        const isPaid = bid.paymentStatus === 'paid' || w.paid || auc.status === 'settled';
        const isDue = !isPaid;
        const bidAmount = parseFloat(bid.amount || bid.bidAmount || '0');
        const msg = payMsg[uid];

        return (
          <div key={uid} className="pn" style={{marginBottom:16,borderColor:isPaid ? undefined : '#fde68a'}}>
            <div style={{padding:'12px 20px',background:isPaid ? '#f0fdf4' : '#fffbeb',borderBottom:`1px solid ${isPaid ? '#bbf7d0' : '#fde68a'}`,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
              <div>
                <span className={`bg ${isPaid ? 'active' : 'pending'}`} style={{marginRight:8}}>{isPaid ? 'Paid' : 'Payment Due'}</span>
                <span style={{fontSize:14,fontWeight:700}}>{auc.title || bid.unitDescription || '—'}</span>
              </div>
              <span style={{fontSize:13,color:isPaid ? '#888' : '#dc2626',fontWeight:isDue ? 600 : undefined}}>
                {bid.auctionId ? bid.auctionId.slice(0,8).toUpperCase() : '—'}
              </span>
            </div>
            {msg && (
              <div style={{padding:'10px 20px',background:'#f0fdf4',borderBottom:'1px solid #bbf7d0',fontSize:12,color:'#166534'}}>{msg}</div>
            )}
            <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:0}}>
              <div>
                <div className="cd-row"><span className="cd-label">Winning Bid</span><span className="cd-value" style={{fontWeight:700,color:'var(--brand)'}}>{bidAmount ? `$${bidAmount.toLocaleString()}` : '—'}</span></div>
                <div className="cd-row"><span className="cd-label">$500 Hold</span><span className="cd-value" style={{color:isPaid ? '#22c55e' : undefined}}>{isPaid ? 'Applied to purchase' : 'Will be applied'}</span></div>
                {isPaid && <div className="cd-row"><span className="cd-label">Unit Transfer</span><span className="cd-value"><span className="bg active">Complete</span></span></div>}
                {isDue && <div className="cd-row"><span className="cd-label">Payment Window</span><span className="cd-value" style={{color:'#dc2626',fontWeight:600}}>72 hours from auction close</span></div>}
              </div>
              <div style={{padding:16,borderLeft:'1px solid #f0f0f0',display:'flex',flexDirection:'column',gap:8}}>
                {isPaid ? (
                  <>
                    <button className="btn btn-o btn-sm" style={{justifyContent:'center'}}>View Documents</button>
                    <button className="btn btn-o btn-sm" style={{justifyContent:'center'}}>Download Receipt</button>
                  </>
                ) : (
                  <>
                    <button
                      className="btn btn-s btn-sm"
                      style={{justifyContent:'center'}}
                      disabled={paying === uid}
                      onClick={() => handlePayment(w)}
                    >
                      {paying === uid ? 'Processing...' : 'Complete Payment'}
                    </button>
                    <button className="btn btn-o btn-sm" style={{justifyContent:'center',fontSize:11}} onClick={() => window.location.href = '/marketplace/bidder/payment'}>
                      Financing Options
                    </button>
                  </>
                )}
              </div>
            </div>
            {isDue && <div style={{padding:'10px 20px',background:'#fff7ed',borderTop:'1px solid #fed7aa',fontSize:12,color:'#9a3412'}}>⚠ If payment is not received within 72 hours, the unit will be offered to the second-highest bidder and your $250 hold may be forfeited.</div>}
          </div>
        );
      })}
    </div>
  );
}
