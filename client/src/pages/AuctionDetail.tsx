import { useState } from 'react';
import { useLocation } from 'wouter';

export default function AuctionDetail() {
  const [, navigate] = useLocation();
  const [mode, setMode] = useState<'listing'|'room'>('listing');

  // Listing detail states
  const [holdConfirm, setHoldConfirm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Auction room state
  const [bidAmount, setBidAmount] = useState('');

  if (mode === 'room') {
    return (
      <div className="page active">
        <div className="detail-header">
          <button className="detail-back" onClick={() => setMode('listing')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
          <div className="detail-info"><div className="detail-title">AUC-0034 — 2023 Heartland Bighorn 3960LS</div><div className="detail-meta">Fifth Wheel · 39' · 4 Slides · 11,200 lbs</div></div>
          <span style={{background: '#dc2626', color: '#fff', fontSize: 13, padding: '6px 16px', borderRadius: 9999, fontWeight: 600}}>🔴 LIVE — 23 min left</span>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
          <div>
            <div className="pn" style={{marginBottom: 16}}>
              <div style={{padding: 16, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8}}>
                <div style={{background: '#e8e8e8', borderRadius: 8, height: 220, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>Main Photo</div>
                <div style={{display: 'grid', gridTemplateRows: '1fr 1fr', gap: 8}}>
                  <div style={{background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 11}}>Interior</div>
                  <div style={{background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 11}}>+4 more</div>
                </div>
              </div>
              <div style={{padding: '12px 16px', borderTop: '1px solid #f0f0f0', fontSize: 13, color: '#555', lineHeight: '1.5'}}>Excellent condition. 4 slides, residential fridge, king bed, 2 AC units, washer/dryer prep. Used 3 seasons. Selling to make room.</div>
            </div>
            <div className="pn"><div className="pn-h"><span className="pn-t">Bid History</span><span style={{fontSize: 12, color: '#888'}}>14 bids</span></div>
              <div className="act">
                <div className="act-i" style={{background: '#f0fdf4'}}><span className="act-dot ok"></span><div><div className="act-t" style={{fontWeight: 600}}>$62,500 — <strong>Dealer ●●●7</strong> (leading)</div><div className="act-tm">2 min ago</div></div></div>
                <div className="act-i"><span className="act-dot new"></span><div><div className="act-t">$61,000 — Dealer ●●●3</div><div className="act-tm">5 min ago</div></div></div>
                <div className="act-i"><span className="act-dot new"></span><div><div className="act-t">$60,000 — Dealer ●●●7</div><div className="act-tm">8 min ago</div></div></div>
                <div className="act-i"><span className="act-dot new"></span><div><div className="act-t">$59,500 — Dealer ●●●1</div><div className="act-tm">12 min ago</div></div></div>
                <div className="act-i"><span className="act-dot new"></span><div><div className="act-t">$58,000 — Dealer ●●●3</div><div className="act-tm">15 min ago</div></div></div>
                <div className="act-i"><span className="act-dot pt"></span><div><div className="act-t">$55,000 — Opening bid</div><div className="act-tm">30 min ago</div></div></div>
              </div>
            </div>
          </div>
          <div>
            <div style={{background: 'var(--brand)', borderRadius: 8, padding: 20, color: '#fff', marginBottom: 16, textAlign: 'center'}}>
              <div style={{fontSize: 12, opacity: 0.7, marginBottom: 4}}>Current Highest Bid</div>
              <div style={{fontSize: 36, fontWeight: 700, marginBottom: 4}}>$62,500</div>
              <div style={{fontSize: 12, opacity: 0.7, marginBottom: 16}}>14 bids · 8 watchers</div>
              <div style={{display: 'flex', gap: 8, marginBottom: 12}}>
                <input placeholder="Your bid..." value={bidAmount} onChange={(e) => setBidAmount(e.target.value)} style={{flex: 1, padding: '10px 12px', borderRadius: 8, border: 'none', fontSize: 14, fontFamily: 'inherit', color: '#111'}} />
              </div>
              <button className="btn" style={{width: '100%', background: '#22c55e', color: '#fff', justifyContent: 'center', fontSize: 14, padding: '12px 24px'}} onClick={() => {
                const amt = parseInt(bidAmount.replace(/[^0-9]/g, ''));
                if (!amt || amt < 63000) { alert('Minimum bid is $63,000 ($500 increment above current bid)'); return; }
                if (confirm(`Place bid of $${amt.toLocaleString()}?`)) {
                  alert(`Bid of $${amt.toLocaleString()} placed!`);
                  setBidAmount('');
                }
              }}>Place Bid</button>
              <div style={{fontSize: 11, opacity: 0.6, marginTop: 8}}>Minimum increment: $500 · Next bid: $63,000+</div>
            </div>
            <div className="cd-section"><div className="cd-section-h">Auction Info</div>
              <div className="cd-row"><span className="cd-label">Auction</span><span className="cd-value">AUC-0034</span></div>
              <div className="cd-row"><span className="cd-label">Started</span><span className="cd-value">Mar 17, 2:00 PM</span></div>
              <div className="cd-row"><span className="cd-label">Ends</span><span className="cd-value" style={{color: '#dc2626', fontWeight: 600}}>Mar 17, 3:00 PM</span></div>
              <div className="cd-row"><span className="cd-label">Auto-extend</span><span className="cd-value">Yes (5 min if bid in last 2 min)</span></div>
              <div className="cd-row"><span className="cd-label">Reserve Met?</span><span className="cd-value"><span className="bg active">Yes</span></span></div>
            </div>
            <div className="cd-section"><div className="cd-section-h">Unit Specs</div>
              {[['Year','2023'],['Make','Heartland'],['Model','Bighorn 3960LS'],['Type','Fifth Wheel'],['Length',"39'"],['Slides','4'],['Weight','11,200 lbs']].map(([k,v]) => (
                <div className="cd-row" key={k}><span className="cd-label">{k}</span><span className="cd-value">{v}</span></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('auctions')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">2024 Grand Design Imagine 2800BH</div><div className="detail-meta">Travel Trailer · 28' · 3 Slides · 2 Bunks · Sleeps 8 · MKT-0284</div></div>
        <span className="bg active" style={{fontSize: 13, padding: '6px 16px'}}>Available</span>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div>
          <div className="pn" style={{marginBottom: 16}}>
            <div style={{padding: 16, display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 8}}>
              <div style={{background: '#e8e8e8', borderRadius: 8, height: 280, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 13}}>Main Photo</div>
              <div style={{display: 'grid', gridTemplateRows: '1fr 1fr 1fr', gap: 8}}>
                <div style={{background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 11}}>Interior</div>
                <div style={{background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 11}}>Kitchen</div>
                <div style={{background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', fontSize: 11}}>+6 photos</div>
              </div>
            </div>
          </div>
          <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Specifications</span></div>
            <div style={{display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)'}}>
              {[['Year','2024'],['Make','Grand Design'],['Model','Imagine 2800BH'],['Type','Travel Trailer'],['Length',"28'"],['Weight','6,200 lbs'],['Slides','3'],['Bunks','2'],['Sleeps','8'],['Condition','Excellent'],['Usage','Demo, <500 km'],['Province','Ontario']].map(([k,v]) => (
                <div className="cd-row" key={k}><span className="cd-label">{k}</span><span className="cd-value">{v}</span></div>
              ))}
            </div>
          </div>
          <div className="pn"><div className="pn-h"><span className="pn-t">Description</span></div>
            <div style={{padding: '16px 20px', fontSize: 13, color: '#555', lineHeight: '1.6'}}>Like-new demo unit with all options. Power awning, outdoor kitchen, 3 slides for a wide-open interior. Bunk room with 2 full-size bunks. Master bedroom with queen bed. Full warranty remaining. Never been camped in.</div>
          </div>
        </div>
        <div>
          <div className="cd-section" style={{background: '#f0fdf4', borderColor: '#bbf7d0'}}>
            <div style={{padding: 20, textAlign: 'center'}}>
              <div style={{fontSize: 32, fontWeight: 700, color: '#111', marginBottom: 4}}>$42,900</div>
              <div style={{fontSize: 13, color: '#888', marginBottom: 16}}>Asking price · Negotiable through Dealer Suite 360</div>

              {!holdConfirm ? (
                <button className="btn btn-s" style={{width: '100%', justifyContent: 'center', fontSize: 14, padding: '12px 24px', marginBottom: 8}} onClick={() => setHoldConfirm(true)}>Place $500 Hold</button>
              ) : (
                <div style={{background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: 14, marginBottom: 8, textAlign: 'left'}}>
                  <div style={{fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 6}}>Confirm $500 Hold</div>
                  <div style={{fontSize: 12, color: '#666', lineHeight: '1.5', marginBottom: 10}}>A $500 refundable deposit will be charged to your card. This reserves the unit. Seller identity revealed after hold.</div>
                  <div style={{display: 'flex', gap: 8}}>
                    <button className="btn btn-s btn-sm" onClick={() => { alert('Hold placed! Dealer Suite 360 will contact both parties.'); setHoldConfirm(false); }}>Confirm — Charge $500</button>
                    <button className="btn btn-o btn-sm" onClick={() => setHoldConfirm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <button className="btn btn-o" style={{width: '100%', justifyContent: 'center', marginBottom: 8}} onClick={() => { setShowOfferForm(!showOfferForm); setShowQuestionForm(false); }}>Make an Offer</button>
              {showOfferForm && (
                <div style={{textAlign: 'left', padding: 12, background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 8}}>
                  <input placeholder="Offer amount ($)" style={{width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, marginBottom: 8, fontFamily: 'inherit'}} />
                  <textarea placeholder="Message to seller (optional)..." style={{width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, minHeight: 50, marginBottom: 8, fontFamily: 'inherit', resize: 'vertical'}} />
                  <div style={{display: 'flex', gap: 8}}>
                    <button className="btn btn-p btn-sm" onClick={() => { alert('Offer submitted! Dealer Suite 360 will forward to the seller anonymously.'); setShowOfferForm(false); }}>Submit Offer</button>
                    <button className="btn btn-o btn-sm" onClick={() => setShowOfferForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <button className="btn btn-o" style={{width: '100%', justifyContent: 'center'}} onClick={() => { setShowQuestionForm(!showQuestionForm); setShowOfferForm(false); }}>Ask a Question</button>
              {showQuestionForm && (
                <div style={{textAlign: 'left', padding: 12, background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb', marginTop: 8}}>
                  <textarea placeholder="Your question (sent anonymously through Dealer Suite 360)..." style={{width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, minHeight: 60, marginBottom: 8, fontFamily: 'inherit', resize: 'vertical'}} />
                  <div style={{display: 'flex', gap: 8}}>
                    <button className="btn btn-p btn-sm" onClick={() => { alert('Question sent! You will be notified when the seller responds.'); setShowQuestionForm(false); }}>Send Question</button>
                    <button className="btn btn-o btn-sm" onClick={() => setShowQuestionForm(false)}>Cancel</button>
                  </div>
                </div>
              )}

              <div style={{fontSize: 11, color: '#888', marginTop: 12, lineHeight: '1.4'}}>$500 refundable deposit secures the unit. Dealer Suite 360 facilitates all transactions. Seller identity revealed after hold.</div>

              <div style={{marginTop: 16, paddingTop: 16, borderTop: '1px solid #bbf7d0'}}>
                <button className="btn btn-o btn-sm" style={{width: '100%', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => setMode('room')}>🔴 This unit has a live auction — Enter Room</button>
              </div>
            </div>
          </div>
          <div className="cd-section"><div className="cd-section-h">Listing Info</div>
            <div className="cd-row"><span className="cd-label">Listing #</span><span className="cd-value">MKT-0284</span></div>
            <div className="cd-row"><span className="cd-label">Listed</span><span className="cd-value">Mar 10, 2026</span></div>
            <div className="cd-row"><span className="cd-label">Views</span><span className="cd-value">48</span></div>
            <div className="cd-row"><span className="cd-label">Inquiries</span><span className="cd-value">3</span></div>
            <div className="cd-row"><span className="cd-label">Seller</span><span className="cd-value" style={{color: '#888'}}>Verified Dealer</span></div>
            <div className="cd-row"><span className="cd-label">Province</span><span className="cd-value">Ontario</span></div>
          </div>
          <div className="cd-section"><div className="cd-section-h">Warranty</div>
            <div className="cd-row"><span className="cd-label">Manufacturer</span><span className="cd-value"><span className="bg active">Active</span></span></div>
            <div className="cd-row"><span className="cd-label">Expires</span><span className="cd-value">Feb 2026</span></div>
          </div>
        </div>
      </div>
    </div>
  );
}
