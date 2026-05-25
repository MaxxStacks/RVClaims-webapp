import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function MktAuctions() {
  const [, navigate] = useLocation();
  const [auctions, setAuctions] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [auctionTab, setAuctionTab] = useState<'live' | 'completed' | 'cancelled'>('live');

  const load = () => {
    apiFetch<any[]>('/api/auctions')
      .then(d => setAuctions(Array.isArray(d) ? d : []))
      .catch(() => setAuctions([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const live = auctions.filter(a => a.status === 'live' || a.status === 'ending_soon');
  const scheduled = auctions.filter(a => a.status === 'scheduled');
  const liveAndUpcoming = [...live, ...scheduled];
  const completed = auctions.filter(a => a.status === 'completed' || a.status === 'ended');
  const cancelled = auctions.filter(a => a.status === 'cancelled');

  const commissionMtd = completed.filter(a => a.winningBid).length * 250;

  const fmtCountdown = (end: string) => {
    if (!end) return '—';
    const diff = new Date(end).getTime() - Date.now();
    if (diff <= 0) return 'Ended';
    const m = Math.floor(diff / 60000);
    if (m < 60) return `${m} min`;
    const h = Math.floor(m / 60);
    if (h < 24) return `${h}h ${m % 60}m`;
    return `${Math.floor(h / 24)}d`;
  };

  return (
    <div className="page active">
      <div style={{display:'grid',gridTemplateColumns:'repeat(4, 1fr)',gap:16,marginBottom:20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Live Now</div><div className="sc-v" style={{color:'#dc2626'}}>{live.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Upcoming</div><div className="sc-v" style={{color:'#d97706'}}>{scheduled.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Completed (MTD)</div><div className="sc-v" style={{color:'#22c55e'}}>{completed.length}</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Auction Revenue (MTD)</div><div className="sc-v">${commissionMtd.toLocaleString()}</div></div>
      </div>
      <div className="tabs">
        <div className={`tab ${auctionTab === 'live' ? 'active' : ''}`} onClick={() => setAuctionTab('live')}>Live & Upcoming ({liveAndUpcoming.length})</div>
        <div className={`tab ${auctionTab === 'completed' ? 'active' : ''}`} onClick={() => setAuctionTab('completed')}>Completed ({completed.length})</div>
        <div className={`tab ${auctionTab === 'cancelled' ? 'active' : ''}`} onClick={() => setAuctionTab('cancelled')}>Cancelled ({cancelled.length})</div>
      </div>
      <div className="pn" style={{borderTop:'none',borderRadius:'0 0 8px 8px'}}>
        {loading && <div style={{padding:32,textAlign:'center',color:'#888'}}>Loading...</div>}

        {!loading && auctionTab === 'live' && (
          <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Seller</th><th>Starting</th><th>Current Bid</th><th>Bids</th><th>Ends</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {liveAndUpcoming.length === 0
              ? <tr><td colSpan={9} style={{textAlign:'center',color:'#888',padding:20}}>No live or upcoming auctions</td></tr>
              : liveAndUpcoming.map(a => {
                  const isLive = a.status === 'live' || a.status === 'ending_soon';
                  const startPrice = parseFloat(a.startingBid || a.minimumBid || '0');
                  const currentBid = parseFloat(a.currentBid || '0');
                  return (
                    <tr key={a.id} style={isLive ? {background:'#fef2f2'} : {}}>
                      <td style={{fontWeight:500,color:isLive ? '#dc2626' : 'var(--brand)'}}>
                        <span className="cid" onClick={() => navigate(`/operator/admin/marketplace/auctions`)}>{a.id?.slice(0,8).toUpperCase() || '—'}</span>
                      </td>
                      <td>{a.title || a.listing?.title || '—'}</td>
                      <td style={{fontSize:12,color:'#888'}}>{a.seller?.businessName || a.sellerName || '—'}</td>
                      <td>{startPrice ? `$${startPrice.toLocaleString()}` : '—'}</td>
                      <td style={isLive ? {fontWeight:700,color:'#dc2626'} : {}}>{currentBid ? `$${currentBid.toLocaleString()}` : '—'}</td>
                      <td style={isLive ? {fontWeight:600} : {}}>{a.totalBids ?? a.bidCount ?? 0}</td>
                      <td style={isLive ? {fontWeight:600,color:'#dc2626'} : {}}>{a.scheduledEnd ? fmtCountdown(a.scheduledEnd) : '—'}</td>
                      <td>
                        {isLive
                          ? <span className="bg" style={{background:'#fef2f2',color:'#dc2626'}}>🔴 LIVE</span>
                          : <span className="bg pending">Scheduled</span>}
                      </td>
                      <td>
                        <button className="btn btn-p btn-sm" onClick={() => navigate(`/operator/admin/marketplace/auctions`)}>
                          {isLive ? 'Monitor' : 'Manage'}
                        </button>
                      </td>
                    </tr>
                  );
                })
            }
          </tbody></table></div>
        )}

        {!loading && auctionTab === 'completed' && (
          <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Seller</th><th>Winning Bid</th><th>Bids</th><th>Commission</th><th>Settled</th></tr></thead><tbody>
            {completed.length === 0
              ? <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:20}}>No completed auctions</td></tr>
              : completed.map(a => {
                  const winBid = parseFloat(a.winningBid || a.currentBid || '0');
                  const settledDate = a.endedAt || a.updatedAt;
                  return (
                    <tr key={a.id}>
                      <td style={{fontWeight:500,color:'var(--brand)'}}>{a.id?.slice(0,8).toUpperCase() || '—'}</td>
                      <td>{a.title || a.listing?.title || '—'}</td>
                      <td style={{fontSize:12,color:'#888'}}>{a.seller?.businessName || a.sellerName || '—'}</td>
                      <td style={{fontWeight:600}}>{winBid ? `$${winBid.toLocaleString()}` : '—'}</td>
                      <td>{a.totalBids ?? a.bidCount ?? 0}</td>
                      <td style={{color:'#22c55e',fontWeight:600}}>{winBid ? '$250' : '—'}</td>
                      <td>{settledDate ? new Date(settledDate).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
                    </tr>
                  );
                })
            }
          </tbody></table></div>
        )}

        {!loading && auctionTab === 'cancelled' && (
          <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Seller</th><th>Reason</th><th>Cancelled</th></tr></thead><tbody>
            {cancelled.length === 0
              ? <tr><td colSpan={5} style={{textAlign:'center',color:'#888',padding:20}}>No cancelled auctions</td></tr>
              : cancelled.map(a => {
                  const cancelDate = a.cancelledAt || a.updatedAt;
                  return (
                    <tr key={a.id}>
                      <td style={{fontWeight:500,color:'var(--brand)'}}>{a.id?.slice(0,8).toUpperCase() || '—'}</td>
                      <td>{a.title || a.listing?.title || '—'}</td>
                      <td style={{fontSize:12,color:'#888'}}>{a.seller?.businessName || a.sellerName || '—'}</td>
                      <td style={{fontSize:12,color:'#888'}}>{a.cancellationReason || '—'}</td>
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
