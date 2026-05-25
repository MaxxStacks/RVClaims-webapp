import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function MyBids() {
  const { user } = useAuth();
  const [bidsTab, setBidsTab] = useState<'active' | 'history'>('active');
  const [myBids, setMyBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [increaseBidId, setIncreaseBidId] = useState<string | null>(null);
  const [newAmount, setNewAmount] = useState('');
  const [actionMsg, setActionMsg] = useState('');

  const loadBids = () => {
    if (!user?.id) return;
    apiFetch<any>(`/api/auctions/my-bids?memberId=${user.id}`)
      .then(d => setMyBids(Array.isArray(d) ? d : d.bids || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(() => { loadBids(); }, [user?.id]);

  const activeBids = myBids.filter(b => b.bid?.status === 'winning' || b.bid?.status === 'outbid');
  const historicBids = myBids.filter(b => ['won', 'lost', 'cancelled'].includes(b.bid?.status));

  const handleIncreaseBid = async (auctionId: string) => {
    const amt = parseFloat(newAmount.replace(/[^0-9.]/g, ''));
    if (!amt) { setActionMsg('Enter a valid bid amount.'); return; }
    try {
      await apiFetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        body: JSON.stringify({ amount: amt, memberId: user?.id }),
      });
      setIncreaseBidId(null);
      setNewAmount('');
      setActionMsg(`Bid of $${amt.toLocaleString()} placed.`);
      loadBids();
    } catch (err: any) {
      setActionMsg(err?.message || 'Bid failed.');
    }
  };

  const handleWithdraw = async (auctionId: string) => {
    try {
      await apiFetch(`/api/auctions/${auctionId}/bid/withdraw`, {
        method: 'PATCH',
        body: JSON.stringify({ memberId: user?.id }),
      });
      setActionMsg('Bid withdrawn.');
      loadBids();
    } catch (err: any) {
      setActionMsg(err?.message || 'Cannot withdraw — you may be the current leading bidder.');
    }
  };

  const displayList = bidsTab === 'active' ? activeBids : historicBids;

  return (
    <div className="page active">
      {actionMsg && (
        <div style={{padding:'10px 16px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,marginBottom:16,fontSize:13,color:'#166534'}}>
          {actionMsg} <button style={{marginLeft:8,color:'#888',cursor:'pointer',background:'none',border:'none',fontSize:12}} onClick={() => setActionMsg('')}>×</button>
        </div>
      )}
      <div className="tabs" style={{marginBottom:0}}>
        <div className={`tab ${bidsTab === 'active' ? 'active' : ''}`} onClick={() => setBidsTab('active')}>
          Active Bids ({activeBids.length})
        </div>
        <div className={`tab ${bidsTab === 'history' ? 'active' : ''}`} onClick={() => setBidsTab('history')}>
          Bid History ({historicBids.length})
        </div>
      </div>
      <div className="pn" style={{borderTop:'none',borderRadius:'0 0 8px 8px'}}>
        {loading && <div style={{padding:32,textAlign:'center',color:'#888'}}>Loading...</div>}
        {!loading && displayList.length === 0 && (
          <div style={{padding:'40px 20px',textAlign:'center',color:'#888'}}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{marginBottom:8,opacity:0.3}}><path d="M14 2l-2 2-7 7 3 3 7-7 2-2-3-3z"/></svg>
            <div style={{fontSize:14}}>{bidsTab === 'active' ? 'No active bids.' : 'No bid history.'}</div>
          </div>
        )}
        {!loading && displayList.length > 0 && (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Auction</th>
                  <th>Unit</th>
                  <th>My Bid</th>
                  <th>Current Bid</th>
                  <th>Status</th>
                  {bidsTab === 'active' && <th>Actions</th>}
                </tr>
              </thead>
              <tbody>
                {displayList.map((row: any) => {
                  const bid = row.bid || row;
                  const auc = row.auction || {};
                  const myBidAmt = parseFloat(bid.amount || '0');
                  const currentBidAmt = parseFloat(auc.currentBid || '0');
                  const isWinning = bid.status === 'winning';
                  const isOutbid = bid.status === 'outbid';
                  const auctionId = bid.auctionId || auc.id;

                  return (
                    <tr key={bid.id}>
                      <td style={{fontWeight:500,color:'var(--brand)'}}>{auctionId?.slice(0,8).toUpperCase() || '—'}</td>
                      <td>{auc.title || '—'}</td>
                      <td style={{fontWeight:600}}>${myBidAmt.toLocaleString()}</td>
                      <td>${currentBidAmt.toLocaleString()}</td>
                      <td>
                        {isWinning && <span className="bg active">Winning</span>}
                        {isOutbid && <span className="bg" style={{background:'#fef3c7',color:'#d97706'}}>Outbid</span>}
                        {bid.status === 'won' && <span className="bg active">Won</span>}
                        {bid.status === 'cancelled' && <span className="bg" style={{background:'#f3f4f6',color:'#6b7280'}}>Withdrawn</span>}
                        {!['winning','outbid','won','cancelled'].includes(bid.status) && <span className="bg pending">{bid.status || '—'}</span>}
                      </td>
                      {bidsTab === 'active' && (
                        <td>
                          {increaseBidId === auctionId ? (
                            <div style={{display:'flex',gap:6,alignItems:'center'}}>
                              <input
                                placeholder={`Min $${(currentBidAmt + 500).toLocaleString()}`}
                                value={newAmount}
                                onChange={e => setNewAmount(e.target.value)}
                                style={{width:120,padding:'5px 8px',border:'1px solid #e0e0e0',borderRadius:6,fontSize:12,fontFamily:'inherit'}}
                              />
                              <button className="btn btn-s btn-sm" onClick={() => handleIncreaseBid(auctionId)}>Bid</button>
                              <button className="btn btn-o btn-sm" onClick={() => setIncreaseBidId(null)}>Cancel</button>
                            </div>
                          ) : (
                            <div style={{display:'flex',gap:6}}>
                              <button className="btn btn-p btn-sm" onClick={() => { setIncreaseBidId(auctionId); setNewAmount(''); }}>Increase Bid</button>
                              {!isWinning && (
                                <button className="btn btn-o btn-sm" style={{color:'#dc2626',borderColor:'#fca5a5'}} onClick={() => handleWithdraw(auctionId)}>Withdraw</button>
                              )}
                            </div>
                          )}
                        </td>
                      )}
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
