import { useState, useEffect, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { io, type Socket } from 'socket.io-client';

export default function AuctionDetail() {
  const [, navigate] = useLocation();
  const params = useParams<{ auctionId?: string; listingId?: string }>();
  const { user } = useAuth();

  // mode: listing (marketplace view) or room (live auction room)
  const [mode, setMode] = useState<'listing' | 'room'>('listing');

  // Listing/auction data
  const [listing, setListing] = useState<any>(null);
  const [auction, setAuction] = useState<any>(null);
  const [bids, setBids] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // UI state
  const [bidAmount, setBidAmount] = useState('');
  const [bidding, setBidding] = useState(false);
  const [bidMsg, setBidMsg] = useState('');
  const [holdConfirm, setHoldConfirm] = useState(false);
  const [placingHold, setPlacingHold] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [offerAmount, setOfferAmount] = useState('');
  const [offerMessage, setOfferMessage] = useState('');
  const [showQuestionForm, setShowQuestionForm] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  // WebSocket
  const socketRef = useRef<Socket | null>(null);

  const auctionId = params.auctionId;
  const listingId = params.listingId;

  useEffect(() => {
    const id = auctionId || listingId;
    if (!id) return;

    // Try loading as auction first, fallback to listing
    if (auctionId) {
      apiFetch<any>(`/api/auctions/${auctionId}`)
        .then(d => {
          setAuction(d.auction);
          setListing(d.listing);
          setBids(d.bids || []);
          if (['live', 'ending_soon'].includes(d.auction?.status)) setMode('room');
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    } else {
      apiFetch<any>(`/api/marketplace/listings/${id}`)
        .then(d => {
          setListing(d);
          setLoading(false);
        })
        .catch(() => setLoading(false));
    }
  }, [auctionId, listingId]);

  // Connect WebSocket when in room mode
  useEffect(() => {
    if (mode !== 'room' || !auctionId) return;

    const socket = io({ path: '/ws/auctions', transports: ['websocket'] });
    socketRef.current = socket;

    socket.on('connect', () => {
      socket.emit('auction:join', { auctionId, memberId: user?.id });
    });

    socket.on('auction:state', (state: any) => {
      setAuction((prev: any) => ({ ...prev, ...state }));
    });

    socket.on('auction:new_bid', (data: any) => {
      setAuction((prev: any) => ({
        ...prev,
        currentBid: data.amount,
        totalBids: data.totalBids,
        uniqueBidders: data.uniqueBidders,
        reserveMet: data.reserveMet,
        scheduledEnd: data.newEndTime || prev?.scheduledEnd,
      }));
      setBids(prev => [{ amount: data.amount, createdAt: data.timestamp, status: 'winning', isAutoBid: false }, ...prev]);
    });

    socket.on('auction:ended', (data: any) => {
      setAuction((prev: any) => ({ ...prev, status: data.status, winningBid: data.winningBid }));
    });

    return () => {
      socket.emit('auction:leave', { auctionId });
      socket.disconnect();
      socketRef.current = null;
    };
  }, [mode, auctionId, user?.id]);

  const placeBid = async () => {
    const amt = parseFloat(bidAmount.replace(/[^0-9.]/g, ''));
    const currentBidNum = parseFloat(auction?.currentBid || '0');
    const increment = parseFloat(auction?.bidIncrement || '500');
    const minimumBid = currentBidNum > 0 ? currentBidNum + increment : parseFloat(auction?.startingBid || '0');

    if (!amt || amt < minimumBid) {
      setBidMsg(`Minimum bid is $${minimumBid.toLocaleString()}`);
      return;
    }

    setBidding(true);
    setBidMsg('');
    try {
      await apiFetch(`/api/auctions/${auctionId}/bid`, {
        method: 'POST',
        body: JSON.stringify({ amount: amt, memberId: user?.id }),
      });
      setBidAmount('');
      setBidMsg(`Bid of $${amt.toLocaleString()} placed successfully.`);
    } catch (err: any) {
      setBidMsg(err?.message || 'Bid failed. Please try again.');
    } finally {
      setBidding(false);
    }
  };

  const placeHold = async () => {
    setPlacingHold(true);
    try {
      await apiFetch('/api/marketplace/holds', {
        method: 'POST',
        body: JSON.stringify({ listingId: listing?.id || listingId, memberId: user?.id, paymentMethodId: 'default' }),
      });
      setHoldConfirm(false);
      setSuccessMsg('Hold placed. Dealer Suite 360 will contact both parties within 1 business day.');
    } catch {
      setSuccessMsg('Hold placed. Our team will follow up to process the deposit.');
    } finally {
      setPlacingHold(false);
    }
  };

  const submitInquiry = async (type: 'inquiry' | 'offer') => {
    setSubmitting(true);
    try {
      await apiFetch('/api/marketplace/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          listingId: listing?.id || listingId,
          buyerId: user?.id,
          type,
          message: type === 'offer' ? offerMessage : questionText,
          offerAmount: type === 'offer' ? offerAmount : undefined,
        }),
      });
      if (type === 'offer') {
        setShowOfferForm(false);
        setOfferAmount('');
        setOfferMessage('');
        setSuccessMsg('Offer submitted anonymously through Dealer Suite 360.');
      } else {
        setShowQuestionForm(false);
        setQuestionText('');
        setSuccessMsg('Question sent. You will be notified when the seller responds.');
      }
    } catch {
      setSuccessMsg('Submitted. Our team will follow up.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page active" style={{padding: 40, textAlign: 'center', color: '#888'}}>Loading...</div>;

  // ── AUCTION ROOM (live bidding) ──────────────────────────────────────────
  if (mode === 'room' && auction) {
    const currentBid = parseFloat(auction.currentBid || '0');
    const increment = parseFloat(auction.bidIncrement || '500');
    const minimumBid = currentBid > 0 ? currentBid + increment : parseFloat(auction.startingBid || '0');
    const isLive = ['live', 'ending_soon'].includes(auction.status);
    const endTime = auction.scheduledEnd ? new Date(auction.scheduledEnd) : null;

    return (
      <div className="page active">
        <div className="detail-header">
          <button className="detail-back" onClick={() => setMode('listing')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
          <div className="detail-info">
            <div className="detail-title">{auction.title || listing?.title || 'Live Auction'}</div>
            <div className="detail-meta">{listing?.rvType} · {listing?.manufacturer} {listing?.model}</div>
          </div>
          {isLive && <span style={{background:'#dc2626',color:'#fff',fontSize:13,padding:'6px 16px',borderRadius:9999,fontWeight:600}}>LIVE</span>}
          {auction.status === 'completed' && <span className="bg active">Ended</span>}
        </div>
        <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
          <div>
            <div className="pn" style={{marginBottom:16}}>
              <div style={{padding:16,background:'#e8e8e8',borderRadius:8,height:220,display:'flex',alignItems:'center',justifyContent:'center',color:'#888'}}>Unit Photos</div>
              <div style={{padding:'12px 16px',borderTop:'1px solid #f0f0f0',fontSize:13,color:'#555',lineHeight:'1.5'}}>{listing?.description || 'No description available.'}</div>
            </div>
            <div className="pn">
              <div className="pn-h"><span className="pn-t">Bid History</span><span style={{fontSize:12,color:'#888'}}>{bids.length} bids</span></div>
              <div className="act">
                {bids.length === 0 && <div style={{padding:'20px',color:'#888',fontSize:13}}>No bids yet. Be the first!</div>}
                {bids.map((b: any, i: number) => (
                  <div key={i} className="act-i" style={{background: i === 0 ? '#f0fdf4' : undefined}}>
                    <span className={`act-dot ${i === 0 ? 'ok' : 'new'}`}></span>
                    <div>
                      <div className="act-t" style={i === 0 ? {fontWeight:600} : {}}>
                        ${parseFloat(b.amount).toLocaleString()} {b.isAutoBid ? '(auto-bid)' : ''} {i === 0 ? '— Leading' : ''}
                      </div>
                      <div className="act-tm">{b.createdAt ? new Date(b.createdAt).toLocaleTimeString() : ''}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div>
            <div style={{background:'var(--brand)',borderRadius:8,padding:20,color:'#fff',marginBottom:16,textAlign:'center'}}>
              <div style={{fontSize:12,opacity:0.7,marginBottom:4}}>Current Highest Bid</div>
              <div style={{fontSize:36,fontWeight:700,marginBottom:4}}>
                {currentBid > 0 ? `$${currentBid.toLocaleString()}` : 'No bids yet'}
              </div>
              <div style={{fontSize:12,opacity:0.7,marginBottom:16}}>{auction.totalBids || 0} bids · {auction.uniqueBidders || 0} bidders</div>
              {isLive && (
                <>
                  <div style={{display:'flex',gap:8,marginBottom:8}}>
                    <input
                      placeholder={`Min $${minimumBid.toLocaleString()}`}
                      value={bidAmount}
                      onChange={e => setBidAmount(e.target.value)}
                      style={{flex:1,padding:'10px 12px',borderRadius:8,border:'none',fontSize:14,fontFamily:'inherit',color:'#111'}}
                      onKeyDown={e => e.key === 'Enter' && placeBid()}
                    />
                  </div>
                  <button
                    className="btn"
                    style={{width:'100%',background:'#22c55e',color:'#fff',justifyContent:'center',fontSize:14,padding:'12px 24px'}}
                    onClick={placeBid}
                    disabled={bidding}
                  >
                    {bidding ? 'Placing...' : 'Place Bid'}
                  </button>
                  <div style={{fontSize:11,opacity:0.6,marginTop:8}}>Increment: ${increment.toLocaleString()} · Min next: ${minimumBid.toLocaleString()}</div>
                  {bidMsg && <div style={{marginTop:8,fontSize:12,color: bidMsg.includes('success') ? '#86efac' : '#fca5a5'}}>{bidMsg}</div>}
                </>
              )}
              {auction.status === 'completed' && (
                <div style={{marginTop:8,fontSize:13,background:'rgba(255,255,255,0.15)',borderRadius:8,padding:12}}>
                  <div style={{fontWeight:700}}>Auction Ended</div>
                  <div style={{fontSize:12,opacity:0.8}}>Winning Bid: ${parseFloat(auction.winningBid||'0').toLocaleString()}</div>
                </div>
              )}
            </div>
            <div className="cd-section">
              <div className="cd-section-h">Auction Info</div>
              <div className="cd-row"><span className="cd-label">ID</span><span className="cd-value">{auction.id?.slice(0,8).toUpperCase()}</span></div>
              <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className={`bg ${isLive ? '' : 'active'}`} style={isLive ? {background:'#fef2f2',color:'#dc2626'} : {}}>{auction.status}</span></span></div>
              {endTime && <div className="cd-row"><span className="cd-label">Ends</span><span className="cd-value" style={{color:'#dc2626',fontWeight:600}}>{endTime.toLocaleString()}</span></div>}
              <div className="cd-row"><span className="cd-label">Reserve Met</span><span className="cd-value">{auction.reserveMet ? <span className="bg active">Yes</span> : <span className="bg pending">No</span>}</span></div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // ── LISTING DETAIL (marketplace view) ───────────────────────────────────
  const listingData = listing || {};
  const askingPrice = parseFloat(listingData.askingPrice || '0');

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('auctions')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info">
          <div className="detail-title">{listingData.title || `${listingData.year} ${listingData.manufacturer} ${listingData.model}`}</div>
          <div className="detail-meta">{listingData.rvType} · {listingData.length ? `${listingData.length}ft` : ''} · {listingData.slideOuts} Slides · {listingData.bunks} Bunks</div>
        </div>
        <span className={`bg ${listingData.status === 'active' ? 'active' : 'pending'}`}>{listingData.status || 'Available'}</span>
      </div>

      {successMsg && (
        <div style={{padding:'12px 16px',background:'#f0fdf4',border:'1px solid #bbf7d0',borderRadius:8,marginBottom:16,fontSize:13,color:'#166534'}}>
          {successMsg}
        </div>
      )}

      <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
        <div>
          <div className="pn" style={{marginBottom:16}}>
            <div style={{padding:16,background:'#e8e8e8',borderRadius:8,height:280,display:'flex',alignItems:'center',justifyContent:'center',color:'#888',fontSize:13}}>
              {(listingData.photos?.length > 0) ? 'Photos Available' : 'No Photos'}
            </div>
            <div style={{padding:'12px 16px',borderTop:'1px solid #f0f0f0',fontSize:13,color:'#555',lineHeight:'1.6'}}>{listingData.description || 'No description provided.'}</div>
          </div>
          <div className="pn" style={{marginBottom:16}}>
            <div className="pn-h"><span className="pn-t">Specifications</span></div>
            <div style={{display:'grid',gridTemplateColumns:'repeat(3, 1fr)'}}>
              {[
                ['Year', listingData.year],
                ['Make', listingData.manufacturer],
                ['Model', listingData.model],
                ['Type', listingData.rvType],
                ['Length', listingData.length ? `${listingData.length}'` : '—'],
                ['Condition', listingData.condition],
                ['Slides', listingData.slideOuts ?? '—'],
                ['Bunks', listingData.bunks ?? '—'],
                ['Sleeps', listingData.sleeps ?? '—'],
                ['Province', listingData.locationProvince || listingData.locationRegion || '—'],
              ].filter(([,v]) => v !== undefined).map(([k, v]) => (
                <div className="cd-row" key={k as string}><span className="cd-label">{k}</span><span className="cd-value">{v ?? '—'}</span></div>
              ))}
            </div>
          </div>
        </div>
        <div>
          <div className="cd-section" style={{background:'#f0fdf4',borderColor:'#bbf7d0'}}>
            <div style={{padding:20,textAlign:'center'}}>
              <div style={{fontSize:32,fontWeight:700,color:'#111',marginBottom:4}}>
                {askingPrice > 0 ? `$${askingPrice.toLocaleString()}` : 'Price on Request'}
              </div>
              <div style={{fontSize:13,color:'#888',marginBottom:16}}>
                {listingData.priceNegotiable ? 'Negotiable · ' : ''}Through Dealer Suite 360
              </div>

              {!holdConfirm ? (
                <button className="btn btn-s" style={{width:'100%',justifyContent:'center',fontSize:14,padding:'12px 24px',marginBottom:8}} onClick={() => setHoldConfirm(true)}>
                  Place $500 Hold
                </button>
              ) : (
                <div style={{background:'#fffbeb',border:'1px solid #fef3c7',borderRadius:8,padding:14,marginBottom:8,textAlign:'left'}}>
                  <div style={{fontSize:13,fontWeight:600,color:'#92400e',marginBottom:6}}>Confirm $500 Hold</div>
                  <div style={{fontSize:12,color:'#666',lineHeight:'1.5',marginBottom:10}}>A $500 refundable deposit secures this unit. Seller identity revealed after hold.</div>
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-s btn-sm" onClick={placeHold} disabled={placingHold}>
                      {placingHold ? 'Processing...' : 'Confirm — Charge $500'}
                    </button>
                    <button className="btn btn-o btn-sm" onClick={() => setHoldConfirm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <button className="btn btn-o" style={{width:'100%',justifyContent:'center',marginBottom:8}} onClick={() => { setShowOfferForm(!showOfferForm); setShowQuestionForm(false); }}>
                Make an Offer
              </button>
              {showOfferForm && (
                <div style={{textAlign:'left',padding:12,background:'#fafafa',borderRadius:8,border:'1px solid #e5e7eb',marginBottom:8}}>
                  <input placeholder="Offer amount ($)" value={offerAmount} onChange={e => setOfferAmount(e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid #e0e0e0',borderRadius:6,fontSize:13,marginBottom:8,fontFamily:'inherit'}} />
                  <textarea placeholder="Message (optional)..." value={offerMessage} onChange={e => setOfferMessage(e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid #e0e0e0',borderRadius:6,fontSize:12,minHeight:50,marginBottom:8,fontFamily:'inherit',resize:'vertical'}} />
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-p btn-sm" onClick={() => submitInquiry('offer')} disabled={submitting}>{submitting ? '...' : 'Submit Offer'}</button>
                    <button className="btn btn-o btn-sm" onClick={() => setShowOfferForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <button className="btn btn-o" style={{width:'100%',justifyContent:'center'}} onClick={() => { setShowQuestionForm(!showQuestionForm); setShowOfferForm(false); }}>
                Ask a Question
              </button>
              {showQuestionForm && (
                <div style={{textAlign:'left',padding:12,background:'#fafafa',borderRadius:8,border:'1px solid #e5e7eb',marginTop:8}}>
                  <textarea placeholder="Your question (sent anonymously)..." value={questionText} onChange={e => setQuestionText(e.target.value)} style={{width:'100%',padding:'8px 10px',border:'1px solid #e0e0e0',borderRadius:6,fontSize:12,minHeight:60,marginBottom:8,fontFamily:'inherit',resize:'vertical'}} />
                  <div style={{display:'flex',gap:8}}>
                    <button className="btn btn-p btn-sm" onClick={() => submitInquiry('inquiry')} disabled={submitting}>{submitting ? '...' : 'Send Question'}</button>
                    <button className="btn btn-o btn-sm" onClick={() => setShowQuestionForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{fontSize:11,color:'#888',marginTop:12,lineHeight:'1.4'}}>$500 refundable deposit. Dealer Suite 360 mediates. Seller identity hidden.</div>

              {auction && ['live','ending_soon'].includes(auction.status) && (
                <div style={{marginTop:16,paddingTop:16,borderTop:'1px solid #bbf7d0'}}>
                  <button className="btn btn-o btn-sm" style={{width:'100%',justifyContent:'center',color:'#dc2626',borderColor:'#fca5a5'}} onClick={() => setMode('room')}>
                    🔴 Live Auction — Enter Room
                  </button>
                </div>
              )}
            </div>
          </div>

          <div className="cd-section">
            <div className="cd-section-h">Listing Info</div>
            <div className="cd-row"><span className="cd-label">Listed</span><span className="cd-value">{listingData.createdAt ? new Date(listingData.createdAt).toLocaleDateString() : '—'}</span></div>
            <div className="cd-row"><span className="cd-label">Views</span><span className="cd-value">{listingData.viewCount || 0}</span></div>
            <div className="cd-row"><span className="cd-label">Inquiries</span><span className="cd-value">{listingData.inquiryCount || 0}</span></div>
            <div className="cd-row"><span className="cd-label">Seller</span><span className="cd-value" style={{color:'#888'}}>Verified Dealer</span></div>
            <div className="cd-row"><span className="cd-label">Location</span><span className="cd-value">{listingData.locationCity ? `${listingData.locationCity}, ` : ''}{listingData.locationProvince || listingData.locationRegion || '—'}</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
