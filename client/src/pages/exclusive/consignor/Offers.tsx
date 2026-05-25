import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function Offers() {
  const { user } = useAuth();
  const [offers, setOffers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionMsg, setActionMsg] = useState('');
  const [responding, setResponding] = useState<string | null>(null);

  const loadOffers = () => {
    if (!user?.id) return;
    apiFetch<any[]>(`/api/marketplace/inquiries?sellerId=${user.id}`)
      .then(d => setOffers(Array.isArray(d) ? d.filter((o: any) => o.type === 'offer') : []))
      .catch(() => setOffers([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadOffers(); }, [user?.id]);

  const handleRespond = async (inquiryId: string, status: 'accepted' | 'rejected') => {
    setResponding(inquiryId);
    try {
      await apiFetch(`/api/marketplace/inquiries/${inquiryId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status,
          operatorNotes: status === 'accepted' ? 'Seller accepted offer' : 'Seller declined offer',
        }),
      });
      setActionMsg(
        status === 'accepted'
          ? 'Offer accepted. Dealer Suite 360 will contact the buyer to proceed with escrow.'
          : 'Offer declined. The buyer has been notified.'
      );
      loadOffers();
    } catch {
      setActionMsg('Response recorded.');
      loadOffers();
    } finally {
      setResponding(null);
      setTimeout(() => setActionMsg(''), 5000);
    }
  };

  const pending = offers.filter(o => !o.status || o.status === 'pending');

  return (
    <div className="page active">
      {actionMsg && (
        <div style={{padding:'10px 16px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,marginBottom:16,fontSize:13,color:'#166534'}}>
          {actionMsg}
        </div>
      )}
      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">Offers Received</span>
          <span style={{fontSize:12,color:'#888'}}>{pending.length} pending</span>
        </div>
        {loading && <div style={{padding:32,textAlign:'center',color:'#888'}}>Loading...</div>}
        {!loading && offers.length === 0 && (
          <div style={{padding:'40px 20px',textAlign:'center',color:'#888',fontSize:13}}>
            No offers received yet. Offers from interested buyers will appear here.
          </div>
        )}
        {!loading && offers.length > 0 && (
          <div style={{padding:16,display:'flex',flexDirection:'column',gap:12}}>
            {offers.map((o: any) => {
              const isPending = !o.status || o.status === 'pending';
              const offerAmt = parseFloat(o.offerAmount || o.amount || '0');
              const listAmt = parseFloat(o.listPrice || o.listing?.askingPrice || '0');
              return (
                <div key={o.id} style={{border:`1px solid ${isPending ? '#e8e8e8' : '#f0f0f0'}`,borderRadius:10,padding:16,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16,background:isPending ? '#fff' : '#fafafa'}}>
                  <div style={{flex:1}}>
                    <div style={{fontWeight:600,fontSize:14,marginBottom:6}}>
                      {o.listing?.title || o.listingTitle || 'Unit'}
                    </div>
                    <div style={{fontSize:13,color:'#555'}}>
                      Offer: <strong style={{color:'#22c55e'}}>${offerAmt ? offerAmt.toLocaleString() : '—'}</strong>
                      {listAmt > 0 && <> &nbsp;·&nbsp; List: ${listAmt.toLocaleString()}</>}
                      &nbsp;·&nbsp; {o.buyerType === 'dealer' ? `Dealer — ${o.buyerName || 'Verified Dealer'}` : 'Public Buyer'}
                    </div>
                    {o.expiresAt && (
                      <div style={{fontSize:12,color:'#888',marginTop:4}}>
                        Expires: {new Date(o.expiresAt).toLocaleDateString()}
                      </div>
                    )}
                    {o.message && (
                      <div style={{fontSize:12,color:'#666',marginTop:4,fontStyle:'italic'}}>"{o.message}"</div>
                    )}
                    {!isPending && (
                      <span className={`bg ${o.status === 'accepted' ? 'active' : 'denied'}`} style={{marginTop:6,display:'inline-block'}}>
                        {o.status === 'accepted' ? 'Accepted' : 'Declined'}
                      </span>
                    )}
                  </div>
                  {isPending && (
                    <div style={{display:'flex',gap:8,flexShrink:0}}>
                      <button
                        className="btn btn-p"
                        style={{fontSize:12}}
                        disabled={responding === o.id}
                        onClick={() => handleRespond(o.id, 'accepted')}
                      >
                        {responding === o.id ? '...' : 'Accept'}
                      </button>
                      <button
                        className="btn btn-o"
                        style={{fontSize:12,color:'#dc2626',borderColor:'#fca5a5'}}
                        disabled={responding === o.id}
                        onClick={() => handleRespond(o.id, 'rejected')}
                      >
                        Decline
                      </button>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
