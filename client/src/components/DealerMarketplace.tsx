// DealerMarketplace.tsx — Standalone component for marketplace pages in dealer portal
// Includes membership gate that locks all marketplace features behind $499/year payment.
//
// Usage in DealerPortal.tsx:
//   import { DealerMarketplacePages } from '../components/DealerMarketplace';
//   // Inside return, after existing pages:
//   <DealerMarketplacePages activePage={activePage} showPage={showPage} />
//
// For nav items, use showMarketplacePage instead of showPage (exported below).

import { useState } from 'react';

interface Props {
  activePage: string;
  showPage: (id: string) => void;
}

export function DealerMarketplacePages({ activePage, showPage }: Props) {
  // Membership state: 'none' | 'pending' | 'active'
  const [mktAccess, setMktAccess] = useState<'none' | 'pending' | 'active'>('none');

  // Tab states
  const [txnTab, setTxnTab] = useState<'purchases' | 'sales' | 'all'>('purchases');
  const [auctionTab, setAuctionTab] = useState<'live' | 'upcoming' | 'won'>('live');

  // Browse filters
  const [browseSearch, setBrowseSearch] = useState('');
  const [browseType, setBrowseType] = useState('');
  const [browseSlides, setBrowseSlides] = useState('');
  const [browseBunks, setBrowseBunks] = useState('');
  const [browsePrice, setBrowsePrice] = useState('');
  const [browseLength, setBrowseLength] = useState('');

  // Listing detail states
  const [holdConfirm, setHoldConfirm] = useState(false);
  const [showOfferForm, setShowOfferForm] = useState(false);
  const [showQuestionForm, setShowQuestionForm] = useState(false);

  // Auction bidding
  const [bidAmount, setBidAmount] = useState('');

  // Gate check — redirect to gate if not active member
  const gatedPage = (id: string) => {
    if (mktAccess !== 'active') {
      showPage('mkt-gate');
    } else {
      showPage(id);
    }
  };

  return (
    <>

{/* ============ MEMBERSHIP GATE ============ */}
<div className={`page ${activePage === 'mkt-gate' ? 'active' : ''}`} id="page-mkt-gate">
  {mktAccess === 'none' && (
    <div style={{maxWidth: 640, margin: '20px auto'}}>
      <div style={{textAlign: 'center', marginBottom: 24}}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" style={{marginBottom: 12}}>
          <rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/>
        </svg>
        <div style={{fontSize: 22, fontWeight: 700, marginBottom: 6}}>Dealer Marketplace</div>
        <div style={{fontSize: 13, color: '#666', lineHeight: '1.6'}}>
          Access our dealer-to-dealer marketplace to browse inventory, list units for sale, and participate in live auctions. Never lose a sale because you don't have the right unit in stock.
        </div>
      </div>
      <div className="pn" style={{marginBottom: 20}}>
        <div className="pn-h"><span className="pn-t">Marketplace Membership — $499/year</span></div>
        <div style={{padding: 20, fontSize: 13, lineHeight: '2'}}>
          <div>✓ Browse all listed units from verified Canadian dealers</div>
          <div>✓ List your own units for sale (seller identity hidden)</div>
          <div>✓ Participate in scheduled live auctions</div>
          <div>✓ Place $500 refundable holds to secure units</div>
          <div>✓ RV Claims mediates all transactions</div>
          <div>✓ $250 flat commission per completed sale</div>
          <div>✓ Search by specs: slides, bunks, length, weight, price, type</div>
        </div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Apply for Membership</span></div>
        <div className="form-grid">
          <div className="form-group"><label>Dealership Name</label><input placeholder="Your dealership name" /></div>
          <div className="form-group"><label>Contact Name</label><input placeholder="Full name" /></div>
          <div className="form-group"><label>Email</label><input placeholder="dealer@example.com" /></div>
          <div className="form-group"><label>Phone</label><input placeholder="(555) 000-0000" /></div>
          <div className="form-group"><label>Dealer License #</label><input placeholder="OMVIC / provincial license" /></div>
          <div className="form-group"><label>Province</label><select><option>Select...</option><option>Ontario</option><option>Quebec</option><option>British Columbia</option><option>Alberta</option><option>Manitoba</option><option>Saskatchewan</option><option>Nova Scotia</option><option>New Brunswick</option><option>PEI</option><option>Newfoundland</option></select></div>
          <div className="form-group full"><label>Address</label><input placeholder="Dealership street address" /></div>
          <div className="form-group full"><label>Website</label><input placeholder="https://yourdealership.com" /></div>
          <div className="form-group full"><label>Why do you want to join?</label><textarea placeholder="Tell us about your dealership and how the marketplace would help..." /></div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-s" onClick={() => setMktAccess('pending')}>Submit Application & Pay $499</button>
        </div>
      </div>
    </div>
  )}

  {mktAccess === 'pending' && (
    <div style={{maxWidth: 480, margin: '60px auto', textAlign: 'center'}}>
      <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="1.5" style={{marginBottom: 12}}>
        <circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/>
      </svg>
      <div style={{fontSize: 22, fontWeight: 700, marginBottom: 8}}>Application Under Review</div>
      <div style={{fontSize: 13, color: '#666', lineHeight: '1.6', marginBottom: 20}}>
        Our team is verifying your dealership information. This typically takes 1-2 business days. You'll receive an email once approved.
      </div>
      <div className="cd-section" style={{textAlign: 'left'}}>
        <div className="cd-section-h">Application Status</div>
        <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg pending">Under Review</span></span></div>
        <div className="cd-row"><span className="cd-label">Submitted</span><span className="cd-value">Today</span></div>
        <div className="cd-row"><span className="cd-label">Payment</span><span className="cd-value" style={{color: '#22c55e'}}>$499 collected</span></div>
        <div className="cd-row"><span className="cd-label">Est. Review</span><span className="cd-value">1-2 business days</span></div>
      </div>
      {/* Dev shortcut — remove in production */}
      <button className="btn btn-o btn-sm" style={{marginTop: 16}} onClick={() => setMktAccess('active')}>
        [Dev] Simulate Approval
      </button>
    </div>
  )}
</div>

{/* ============ BROWSE MARKETPLACE ============ */}
<div className={`page ${activePage === 'mkt-browse' ? 'active' : ''}`} id="page-mkt-browse">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
    <div><div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Dealer Marketplace</div><div style={{fontSize: 13, color: '#888'}}>Browse units from verified dealers across Canada. All transactions go through RV Claims.</div></div>
    <button className="btn btn-p btn-sm" onClick={() => showPage('mkt-post-unit')}>+ List a Unit for Sale</button>
  </div>

  {/* Search + Filters */}
  <div className="pn" style={{marginBottom: 20}}>
    <div style={{padding: '16px 20px', display: 'grid', gridTemplateColumns: '2fr 1fr 1fr 1fr 1fr 1fr auto', gap: 12, alignItems: 'end'}}>
      <div style={{display: 'flex', flexDirection: 'column' as const, gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Search</span><input placeholder="Year, make, model..." value={browseSearch} onChange={(e) => setBrowseSearch(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}} /></div>
      <div style={{display: 'flex', flexDirection: 'column' as const, gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Type</span><select value={browseType} onChange={(e) => setBrowseType(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option value="">All Types</option><option value="tt">Travel Trailer</option><option value="fw">Fifth Wheel</option><option value="a">Class A</option><option value="c">Class C</option><option value="th">Toy Hauler</option></select></div>
      <div style={{display: 'flex', flexDirection: 'column' as const, gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Slides</span><select value={browseSlides} onChange={(e) => setBrowseSlides(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option value="">Any</option><option value="0">0</option><option value="1">1</option><option value="2">2</option><option value="3">3+</option></select></div>
      <div style={{display: 'flex', flexDirection: 'column' as const, gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Bunks</span><select value={browseBunks} onChange={(e) => setBrowseBunks(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option value="">Any</option><option value="1">1</option><option value="2">2</option><option value="3">3+</option></select></div>
      <div style={{display: 'flex', flexDirection: 'column' as const, gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Price</span><select value={browsePrice} onChange={(e) => setBrowsePrice(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option value="">Any</option><option value="u25">Under $25K</option><option value="25-40">$25K-$40K</option><option value="40-60">$40K-$60K</option><option value="60-80">$60K-$80K</option><option value="80">$80K+</option></select></div>
      <div style={{display: 'flex', flexDirection: 'column' as const, gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Length</span><select value={browseLength} onChange={(e) => setBrowseLength(e.target.value)} style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option value="">Any</option><option value="u25">Under 25'</option><option value="25-30">25'-30'</option><option value="30-35">30'-35'</option><option value="35">35'+</option></select></div>
      <button className="btn btn-p btn-sm" style={{height: 34}}>Search</button>
    </div>
    <div style={{padding: '0 20px 12px', display: 'flex', gap: 8, flexWrap: 'wrap' as const}}>
      <span style={{fontSize: 12, color: '#888'}}>Quick:</span>
      <button className="btn btn-o btn-sm" style={{fontSize: 11, padding: '4px 10px'}} onClick={() => setBrowseBunks('2')}>Bunk Models</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11, padding: '4px 10px'}} onClick={() => setBrowseType('fw')}>Fifth Wheels</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11, padding: '4px 10px'}} onClick={() => setBrowsePrice('u25')}>Under $25K</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11, padding: '4px 10px'}} onClick={() => setBrowseSlides('3')}>3+ Slides</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11, padding: '4px 10px'}} onClick={() => { setBrowseSearch(''); setBrowseType(''); setBrowseSlides(''); setBrowseBunks(''); setBrowsePrice(''); setBrowseLength(''); }}>Clear All</button>
    </div>
  </div>

  {/* Listing cards */}
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
    <span style={{fontSize: 13, color: '#888'}}>142 units found</span>
    <select style={{padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit'}}><option>Newest First</option><option>Price: Low to High</option><option>Price: High to Low</option><option>Year: Newest</option></select>
  </div>
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: 16}}>
    {[
      { id: 'MKT-0284', unit: '2024 Grand Design Imagine 2800BH', type: 'Travel Trailer', len: "28'", weight: '6,200 lbs', slides: 3, bunks: 2, sleeps: 8, price: '$42,900', date: 'Mar 10', status: '' },
      { id: 'MKT-0281', unit: '2023 Keystone Cougar 29BHS', type: 'Fifth Wheel', len: "33'", weight: '7,800 lbs', slides: 2, bunks: 2, sleeps: 10, price: '$38,500', date: 'Mar 8', status: 'On Hold' },
      { id: 'MKT-0276', unit: '2024 Forest River Rockwood 2891BH', type: 'Travel Trailer', len: "32'", weight: '8,100 lbs', slides: 3, bunks: 1, sleeps: 6, price: '$45,200', date: 'Mar 5', status: '' },
      { id: 'MKT-0283', unit: '2024 Jayco Jay Flight 264BH', type: 'Travel Trailer', len: "28'", weight: '5,900 lbs', slides: 1, bunks: 2, sleeps: 8, price: '$34,900', date: 'Mar 12', status: '' },
    ].map((item) => (
      <div className="pn" key={item.id} style={{cursor: 'pointer'}} onClick={() => { setHoldConfirm(false); setShowOfferForm(false); setShowQuestionForm(false); showPage('mkt-listing-view'); }}>
        <div style={{display: 'flex', gap: 16, padding: 16}}>
          <div style={{width: 180, height: 120, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#888', flexShrink: 0}}>Photo</div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4}}>{item.unit}</div>
            <div style={{fontSize: 12, color: '#888', marginBottom: 8}}>{item.type} · {item.len} · {item.weight}</div>
            <div style={{display: 'flex', gap: 8, marginBottom: 8, flexWrap: 'wrap' as const}}>
              <span style={{fontSize: 12, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4}}>{item.slides} Slides</span>
              <span style={{fontSize: 12, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4}}>{item.bunks} Bunks</span>
              <span style={{fontSize: 12, background: '#f3f4f6', padding: '2px 8px', borderRadius: 4}}>Sleeps {item.sleeps}</span>
            </div>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <div style={{fontSize: 20, fontWeight: 700, color: 'var(--brand)'}}>{item.price}</div>
              {item.status ? <span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>{item.status}</span> : <span style={{fontSize: 11, color: '#888'}}>Listed {item.date} · {item.id}</span>}
            </div>
          </div>
        </div>
      </div>
    ))}
  </div>
</div>

{/* ============ LISTING DETAIL ============ */}
<div className={`page ${activePage === 'mkt-listing-view' ? 'active' : ''}`} id="page-mkt-listing-view">
  <div className="detail-header">
    <button className="detail-back" onClick={() => showPage('mkt-browse')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
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
      {/* Action panel */}
      <div className="cd-section" style={{background: '#f0fdf4', borderColor: '#bbf7d0'}}>
        <div style={{padding: 20, textAlign: 'center'}}>
          <div style={{fontSize: 32, fontWeight: 700, color: '#111', marginBottom: 4}}>$42,900</div>
          <div style={{fontSize: 13, color: '#888', marginBottom: 16}}>Asking price · Negotiable through RV Claims</div>

          {/* Hold button / confirm */}
          {!holdConfirm ? (
            <button className="btn btn-s" style={{width: '100%', justifyContent: 'center', fontSize: 14, padding: '12px 24px', marginBottom: 8}} onClick={() => setHoldConfirm(true)}>Place $500 Hold</button>
          ) : (
            <div style={{background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: 14, marginBottom: 8, textAlign: 'left'}}>
              <div style={{fontSize: 13, fontWeight: 600, color: '#92400e', marginBottom: 6}}>Confirm $500 Hold</div>
              <div style={{fontSize: 12, color: '#666', lineHeight: '1.5', marginBottom: 10}}>A $500 refundable deposit will be charged to your card. This reserves the unit. Seller identity revealed after hold.</div>
              <div style={{display: 'flex', gap: 8}}>
                <button className="btn btn-s btn-sm" onClick={() => { alert('Hold placed! RV Claims will contact both parties.'); setHoldConfirm(false); }}>Confirm — Charge $500</button>
                <button className="btn btn-o btn-sm" onClick={() => setHoldConfirm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Offer button / form */}
          <button className="btn btn-o" style={{width: '100%', justifyContent: 'center', marginBottom: 8}} onClick={() => { setShowOfferForm(!showOfferForm); setShowQuestionForm(false); }}>Make an Offer</button>
          {showOfferForm && (
            <div style={{textAlign: 'left', padding: 12, background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb', marginBottom: 8}}>
              <input placeholder="Offer amount ($)" style={{width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, marginBottom: 8, fontFamily: 'inherit'}} />
              <textarea placeholder="Message to seller (optional)..." style={{width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, minHeight: 50, marginBottom: 8, fontFamily: 'inherit', resize: 'vertical' as const}} />
              <div style={{display: 'flex', gap: 8}}>
                <button className="btn btn-p btn-sm" onClick={() => { alert('Offer submitted! RV Claims will forward to the seller anonymously.'); setShowOfferForm(false); }}>Submit Offer</button>
                <button className="btn btn-o btn-sm" onClick={() => setShowOfferForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          {/* Question button / form */}
          <button className="btn btn-o" style={{width: '100%', justifyContent: 'center'}} onClick={() => { setShowQuestionForm(!showQuestionForm); setShowOfferForm(false); }}>Ask a Question</button>
          {showQuestionForm && (
            <div style={{textAlign: 'left', padding: 12, background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb', marginTop: 8}}>
              <textarea placeholder="Your question (sent anonymously through RV Claims)..." style={{width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, minHeight: 60, marginBottom: 8, fontFamily: 'inherit', resize: 'vertical' as const}} />
              <div style={{display: 'flex', gap: 8}}>
                <button className="btn btn-p btn-sm" onClick={() => { alert('Question sent! You will be notified when the seller responds.'); setShowQuestionForm(false); }}>Send Question</button>
                <button className="btn btn-o btn-sm" onClick={() => setShowQuestionForm(false)}>Cancel</button>
              </div>
            </div>
          )}

          <div style={{fontSize: 11, color: '#888', marginTop: 12, lineHeight: '1.4'}}>$500 refundable deposit secures the unit. RV Claims facilitates all transactions. Seller identity revealed after hold.</div>
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

{/* ============ POST A UNIT ============ */}
<div className={`page ${activePage === 'mkt-post-unit' ? 'active' : ''}`} id="page-mkt-post-unit">
  <div className="detail-header">
    <button className="detail-back" onClick={() => showPage('mkt-my-listings')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div className="detail-info"><div className="detail-title">List a Unit on Marketplace</div><div className="detail-meta">Your identity will be hidden until a hold is placed</div></div>
  </div>
  <div className="pn">
    <div style={{padding: '12px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      Your dealership name and contact info will NOT be shown. RV Claims mediates all inquiries. $250 commission on completed sales.
    </div>
    <div className="form-grid c3">
      <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Select from Inventory or Enter Manually</label></div>
      <div className="form-group full"><label>Unit</label><select><option>Select from your units...</option><option>1UJBJ0BN8M1TJ4K1 — 2024 Jayco Jay Flight 264BH</option><option>1UJCJ0BT4N1KQ8R2 — 2024 Jayco Eagle HT</option><option>+ Enter manually</option></select></div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Unit Details</label></div>
      <div className="form-group"><label>VIN</label><input placeholder="17-character VIN" /></div>
      <div className="form-group"><label>Year</label><input placeholder="2024" /></div>
      <div className="form-group"><label>Manufacturer</label><select><option>Select...</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Grand Design</option><option>Coachmen</option></select></div>
      <div className="form-group"><label>Model</label><input placeholder="Imagine 2800BH" /></div>
      <div className="form-group"><label>RV Type</label><select><option>Travel Trailer</option><option>Fifth Wheel</option><option>Class A</option><option>Class C</option><option>Toy Hauler</option></select></div>
      <div className="form-group"><label>Condition</label><select><option>Excellent</option><option>Good</option><option>Fair</option></select></div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Specifications</label></div>
      <div className="form-group"><label>Length (feet)</label><input placeholder="28" type="number" /></div>
      <div className="form-group"><label>Slides</label><select><option>0</option><option>1</option><option>2</option><option>3</option><option>4+</option></select></div>
      <div className="form-group"><label>Bunks</label><select><option>0</option><option>1</option><option>2</option><option>3+</option></select></div>
      <div className="form-group"><label>Sleeps</label><input placeholder="8" type="number" /></div>
      <div className="form-group"><label>Weight (GVWR)</label><input placeholder="6200" type="number" /></div>
      <div className="form-group"><label>Usage</label><input placeholder="e.g. Demo unit, 500 km" /></div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Pricing</label></div>

      {/* ── Dealer Marketplace Price ── */}
      <div className="form-group full" style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '14px 16px', marginBottom: 4}}>
        <div style={{fontSize: 13, fontWeight: 700, color: '#1e40af', marginBottom: 2}}>Dealer Marketplace Price</div>
        <div style={{fontSize: 11, color: '#3b82f6', marginBottom: 10}}>Visible to verified dealers only · Available 365 days/year · Anonymous listing</div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12}}>
          <div className="form-group" style={{margin: 0}}><label>Asking Price</label><input placeholder="$0.00" /></div>
          <div className="form-group" style={{margin: 0}}><label>Negotiable?</label><select><option>Yes — open to offers</option><option>Firm price</option></select></div>
          <div className="form-group" style={{margin: 0}}><label>Floor Price (hidden)</label><input placeholder="$0.00" /></div>
        </div>
      </div>

      {/* ── Public Auction Pricing ── */}
      <div className="form-group full" style={{background: '#fef9ec', border: '1px solid #fde68a', borderRadius: 8, padding: '14px 16px', marginTop: 8}}>
        <div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 2}}>
          <div style={{fontSize: 13, fontWeight: 700, color: '#92400e'}}>Public Auction Pricing</div>
          <span style={{background: '#d97706', color: '#fff', fontSize: 10, fontWeight: 600, padding: '2px 8px', borderRadius: 9999}}>Once/Month · 24hr Window</span>
        </div>
        <div style={{fontSize: 11, color: '#b45309', marginBottom: 10}}>Shown to the public during monthly auction events · Requires Public Showcase add-on ($299/year)</div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
          <div className="form-group" style={{margin: 0}}>
            <label>Minimum Starting Bid</label>
            <input placeholder="$0.00" />
            <div style={{fontSize: 10, color: '#888', marginTop: 2}}>Visible to public bidders</div>
          </div>
          <div className="form-group" style={{margin: 0}}>
            <label>Reserve Price (hidden)</label>
            <input placeholder="$0.00" />
            <div style={{fontSize: 10, color: '#888', marginTop: 2}}>Unit won't sell below this — not shown to bidders</div>
          </div>
        </div>
        <div style={{marginTop: 10, display: 'flex', alignItems: 'center', gap: 8}}>
          <input type="checkbox" id="include-auction" style={{width: 14, height: 14}} />
          <label htmlFor="include-auction" style={{fontSize: 12, color: '#78350f', fontWeight: 500, margin: 0}}>Include this unit in the next public auction event</label>
        </div>
      </div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Photos</label></div>
      <div className="form-group full">
        <div className="upload-zone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 48, height: 48, color: '#ccc', marginBottom: 12}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><div style={{fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4}}>Upload unit photos</div><div style={{fontSize: 13, color: '#888'}}>Exterior, interior, kitchen, bunks. Min 3 photos.</div></div>
      </div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label>Description</label><textarea placeholder="Condition, features, options, why you're selling..." style={{minHeight: 100}} /></div>
    </div>
    <div className="btn-bar">
      <button className="btn btn-s" onClick={() => { alert('Listing published!'); showPage('mkt-my-listings'); }}>Publish Listing</button>
      <button className="btn btn-o" onClick={() => showPage('mkt-my-listings')}>Save Draft</button>
      <button className="btn btn-o" onClick={() => showPage('mkt-my-listings')}>Cancel</button>
    </div>
  </div>
</div>

{/* ============ MY LISTINGS ============ */}
<div className={`page ${activePage === 'mkt-my-listings' ? 'active' : ''}`} id="page-mkt-my-listings">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
    <div style={{fontSize: 13, color: '#666'}}>Units you've listed on the marketplace. Your identity is hidden to buyers.</div>
    <button className="btn btn-p btn-sm" onClick={() => showPage('mkt-post-unit')}>+ List a Unit</button>
  </div>
  <div className="pn">
    <div className="tw"><table><thead><tr><th>Listing</th><th>Unit</th><th>Dealer Price</th><th>Auction Min / Reserve</th><th>Views</th><th>Status</th><th>Listed</th><th>Action</th></tr></thead><tbody>
      <tr>
        <td style={{fontWeight: 500, color: 'var(--brand)'}}>MKT-0284</td>
        <td>2024 Grand Design Imagine 2800BH</td>
        <td style={{fontWeight: 600}}>$42,900</td>
        <td>
          <div style={{fontSize: 12}}><span style={{color: '#d97706', fontWeight: 600}}>$34,000</span> / <span style={{color: '#888'}}>$38,000</span></div>
          <div style={{fontSize: 10, color: '#888', marginTop: 1}}>Min bid / Reserve (hidden)</div>
        </td>
        <td>48</td>
        <td><span className="bg active">Active</span></td>
        <td>Mar 10</td>
        <td><button className="btn btn-o btn-sm" onClick={() => showPage('mkt-post-unit')}>Edit</button> <button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => { if (confirm('Withdraw this listing from the marketplace?')) {} }}>Withdraw</button></td>
      </tr>
      <tr>
        <td style={{fontWeight: 500, color: 'var(--brand)'}}>MKT-0270</td>
        <td>2023 Jayco Eagle HT 28.5RSTS</td>
        <td style={{fontWeight: 600}}>$51,800</td>
        <td><span style={{fontSize: 12, color: '#888'}}>—</span></td>
        <td>92</td>
        <td><span className="bg pay-recv">Sold</span></td>
        <td>Feb 28</td>
        <td><button className="btn btn-o btn-sm">View</button></td>
      </tr>
      <tr>
        <td style={{fontWeight: 500, color: 'var(--brand)'}}>MKT-0255</td>
        <td>2023 Coachmen Catalina 263BHSCK</td>
        <td style={{fontWeight: 600}}>$29,500</td>
        <td>
          <div style={{fontSize: 12}}><span style={{color: '#d97706', fontWeight: 600}}>$24,000</span> / <span style={{color: '#888'}}>$26,500</span></div>
          <div style={{fontSize: 10, color: '#888', marginTop: 1}}>Min bid / Reserve (hidden)</div>
        </td>
        <td>35</td>
        <td><span className="bg draft">Draft</span></td>
        <td>—</td>
        <td><button className="btn btn-o btn-sm" onClick={() => showPage('mkt-post-unit')}>Edit</button> <button className="btn btn-p btn-sm" onClick={() => alert('Listing published!')}>Publish</button></td>
      </tr>
    </tbody></table></div>
  </div>
</div>

{/* ============ MY TRANSACTIONS ============ */}
<div className={`page ${activePage === 'mkt-my-transactions' ? 'active' : ''}`} id="page-mkt-my-transactions">
  <div style={{fontSize: 13, color: '#666', marginBottom: 20}}>Your purchases and sales through the marketplace.</div>
  <div className="tabs">
    <div className={`tab ${txnTab === 'purchases' ? 'active' : ''}`} onClick={() => setTxnTab('purchases')}>Purchases (3)</div>
    <div className={`tab ${txnTab === 'sales' ? 'active' : ''}`} onClick={() => setTxnTab('sales')}>Sales (2)</div>
    <div className={`tab ${txnTab === 'all' ? 'active' : ''}`} onClick={() => setTxnTab('all')}>All</div>
  </div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
    {/* Purchases */}
    <div style={{display: txnTab === 'purchases' || txnTab === 'all' ? 'block' : 'none'}}>
      {txnTab === 'all' && <div style={{padding: '10px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: 12, fontWeight: 600, color: '#1e40af'}}>Purchases</div>}
      <div className="tw"><table><thead><tr><th>Transaction</th><th>Unit</th><th>Price</th><th>Hold</th><th>Status</th><th>Date</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0089</td><td>2023 Keystone Cougar 29BHS</td><td>$38,500</td><td style={{color: '#d97706', fontWeight: 600}}>$500 held</td><td><span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>In Progress</span></td><td>Mar 15</td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0072</td><td>2024 Forest River Salem</td><td>$33,200</td><td style={{color: '#22c55e'}}>Captured</td><td><span className="bg pay-recv">Completed</span></td><td>Feb 20</td></tr>
      </tbody></table></div>
    </div>
    {/* Sales */}
    <div style={{display: txnTab === 'sales' || txnTab === 'all' ? 'block' : 'none'}}>
      {txnTab === 'all' && <div style={{padding: '10px 20px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontSize: 12, fontWeight: 600, color: '#166534'}}>Sales</div>}
      <div className="tw"><table><thead><tr><th>Transaction</th><th>Unit</th><th>Price</th><th>Commission</th><th>Status</th><th>Date</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0085</td><td>2023 Jayco Eagle HT</td><td>$51,800</td><td>$250</td><td><span className="bg pay-recv">Completed</span></td><td>Mar 10</td></tr>
      </tbody></table></div>
    </div>
  </div>
</div>

{/* ============ LIVE AUCTIONS ============ */}
<div className={`page ${activePage === 'mkt-live-auctions' ? 'active' : ''}`} id="page-mkt-live-auctions">
  <div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Live Auctions</div>
  <div style={{fontSize: 13, color: '#888', marginBottom: 20}}>Bid on units in real-time. $500 deposit from winner. RV Claims facilitates all transactions.</div>
  <div className="tabs">
    <div className={`tab ${auctionTab === 'live' ? 'active' : ''}`} onClick={() => setAuctionTab('live')}>Live Now (1)</div>
    <div className={`tab ${auctionTab === 'upcoming' ? 'active' : ''}`} onClick={() => setAuctionTab('upcoming')}>Upcoming (2)</div>
    <div className={`tab ${auctionTab === 'won' ? 'active' : ''}`} onClick={() => setAuctionTab('won')}>Won / Completed</div>
  </div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px', padding: 16}}>
    {/* Live */}
    <div style={{display: auctionTab === 'live' ? 'block' : 'none'}}>
      <div style={{border: '2px solid #dc2626', borderRadius: 8, padding: 16, background: '#fef2f2', cursor: 'pointer'}} onClick={() => { setBidAmount(''); showPage('mkt-auction-room'); }}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12}}>
          <div style={{display: 'flex', alignItems: 'center', gap: 8}}><span style={{background: '#dc2626', color: '#fff', fontSize: 11, fontWeight: 600, padding: '3px 10px', borderRadius: 9999}}>🔴 LIVE</span><span style={{fontSize: 15, fontWeight: 700}}>2023 Heartland Bighorn 3960LS</span></div>
          <span style={{fontSize: 12, color: '#dc2626', fontWeight: 600}}>Ends in 23 min</span>
        </div>
        <div style={{display: 'flex', gap: 24, fontSize: 13, color: '#555', flexWrap: 'wrap' as const}}>
          <span>Fifth Wheel · 39' · 4 slides</span>
          <span>Starting: $55,000</span>
          <span style={{fontWeight: 700, color: '#dc2626'}}>Current: $62,500</span>
          <span>14 bids · 8 watchers</span>
        </div>
        <div style={{marginTop: 12}}><button className="btn btn-p btn-sm">Enter Auction Room →</button></div>
      </div>
    </div>
    {/* Upcoming */}
    <div style={{display: auctionTab === 'upcoming' ? 'block' : 'none'}}>
      {[
        { id: 'AUC-0035', unit: '2024 Forest River Salem 30KQBSS', specs: 'Travel Trailer · 30\' · 2 slides', start: '$32,000', date: 'Mar 20, 2 PM', watchers: 12 },
        { id: 'AUC-0036', unit: '2023 Jayco Eagle 321RSTS', specs: 'Fifth Wheel · 36\' · 3 slides', start: '$48,000', date: 'Mar 22, 10 AM', watchers: 6 },
      ].map((auc) => (
        <div key={auc.id} style={{border: '1px solid #e5e7eb', borderRadius: 8, padding: 16, marginBottom: 12}}>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}>
            <div style={{display: 'flex', alignItems: 'center', gap: 8}}><span className="bg pending">Starts {auc.date}</span><span style={{fontSize: 15, fontWeight: 700}}>{auc.unit}</span></div>
          </div>
          <div style={{display: 'flex', gap: 24, fontSize: 13, color: '#555'}}>
            <span>{auc.specs}</span><span>Starting: {auc.start}</span><span>{auc.watchers} watchers</span>
          </div>
          <div style={{marginTop: 12}}><button className="btn btn-o btn-sm" onClick={() => alert('You will be notified when this auction starts.')}>Watch This Auction</button></div>
        </div>
      ))}
    </div>
    {/* Won */}
    <div style={{display: auctionTab === 'won' ? 'block' : 'none'}}>
      <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Your Bid</th><th>Result</th><th>Commission</th><th>Date</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0029</td><td>2023 Forest River Cherokee 264DBH</td><td style={{fontWeight: 600}}>$31,500</td><td><span className="bg active">Won</span></td><td>$250</td><td>Mar 6</td></tr>
      </tbody></table></div>
    </div>
  </div>
</div>

{/* ============ AUCTION ROOM ============ */}
<div className={`page ${activePage === 'mkt-auction-room' ? 'active' : ''}`} id="page-mkt-auction-room">
  <div className="detail-header">
    <button className="detail-back" onClick={() => showPage('mkt-live-auctions')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
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
      {/* Bid panel */}
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

    </>
  );
}

// Gate function — use this for nav items instead of showPage
export function createMarketplaceGate(mktAccess: string, showPage: (id: string) => void) {
  return (id: string) => {
    if (mktAccess !== 'active') {
      showPage('mkt-gate');
    } else {
      showPage(id);
    }
  };
}

// Titles & Parents exports
export const dealerMarketplaceTitles: Record<string, [string, string]> = {
  'mkt-gate': ['Dealer Marketplace', 'Membership required'],
  'mkt-browse': ['Browse Marketplace', '142 units available'],
  'mkt-listing-view': ['Unit Details', 'Marketplace listing'],
  'mkt-post-unit': ['Post a Unit', 'List on marketplace'],
  'mkt-my-listings': ['My Listings', 'Units you listed'],
  'mkt-my-transactions': ['My Transactions', 'Purchases & sales'],
  'mkt-live-auctions': ['Live Auctions', 'Bid on units'],
  'mkt-auction-room': ['Auction Room', 'Live bidding'],
};

export const dealerMarketplaceParents: Record<string, string> = {
  'mkt-listing-view': 'mkt-browse',
  'mkt-post-unit': 'mkt-my-listings',
  'mkt-auction-room': 'mkt-live-auctions',
};
