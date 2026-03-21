// PublicAuctionPages.tsx — Pages for public monthly auction feature
// Three sections: Operator (schedule/manage), Dealer (showcase membership + submit units), Public (browse/bid)

import { useState } from 'react';

// ==========================================
// OPERATOR — Public Auction Management
// ==========================================
// Add to OperatorMarketplace.tsx or render alongside it.
// Nav item: "Public Auctions" under Marketplace section
// Titles: 'mkt-public-events': ['Public Auction Events', 'Monthly public sales']
//         'mkt-public-event-detail': ['Event Detail', 'Manage showcase']
// Parents: 'mkt-public-event-detail': 'mkt-public-events'

interface OperatorProps { activePage: string; showPage: (id: string) => void; }

export function OperatorPublicAuctionPages({ activePage, showPage }: OperatorProps) {
  const [eventTab, setEventTab] = useState<'upcoming'|'past'>('upcoming');
  const [unitReviewTab, setUnitReviewTab] = useState<'pending'|'approved'|'all'>('pending');

  return (
    <>

{/* ============ PUBLIC AUCTION EVENTS ============ */}
<div className={`page ${activePage === 'mkt-public-events' ? 'active' : ''}`} id="page-mkt-public-events">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
    <div><div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Public Auction Events</div>
    <div style={{fontSize: 13, color: '#888'}}>Monthly 24-hour auctions open to the public. You pick the date, notify dealers, approve showcase units, and settle winners.</div></div>
    <button className="btn btn-p btn-sm" onClick={() => showPage('mkt-public-event-detail')}>+ Schedule Event</button>
  </div>

  <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Next Event</div><div className="sc-v" style={{fontSize: 18}}>Apr 12</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Showcase Members</div><div className="sc-v" style={{color: '#2563eb'}}>14</div><div style={{fontSize: 12, color: '#888'}}>$299/yr each</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Units Submitted</div><div className="sc-v" style={{color: '#d97706'}}>22</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Public Sales (YTD)</div><div className="sc-v" style={{color: '#22c55e'}}>18</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Public Commission (YTD)</div><div className="sc-v">$4,500</div></div>
  </div>

  <div className="tabs">
    <div className={`tab ${eventTab === 'upcoming' ? 'active' : ''}`} onClick={() => setEventTab('upcoming')}>Upcoming & Active (2)</div>
    <div className={`tab ${eventTab === 'past' ? 'active' : ''}`} onClick={() => setEventTab('past')}>Past Events (3)</div>
  </div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
    {/* Upcoming */}
    <div style={{display: eventTab === 'upcoming' ? 'block' : 'none'}}>
      <div className="tw"><table><thead><tr><th>Event</th><th>Date</th><th>Duration</th><th>Submission Deadline</th><th>Units</th><th>Showcase Dealers</th><th>Status</th><th>Action</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('mkt-public-event-detail')}>PE-2026-04</span></td><td style={{fontWeight: 600}}>Apr 12, 2026 10 AM</td><td>24 hours</td><td>Apr 8</td><td style={{fontWeight: 600}}>22</td><td>14</td><td><span className="bg pending">Accepting Units</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('mkt-public-event-detail')}>Manage</button></td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PE-2026-05</td><td>May 10, 2026 10 AM</td><td>24 hours</td><td>May 6</td><td>—</td><td>—</td><td><span className="bg draft">Scheduled</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
      </tbody></table></div>
    </div>
    {/* Past */}
    <div style={{display: eventTab === 'past' ? 'block' : 'none'}}>
      <div className="tw"><table><thead><tr><th>Event</th><th>Date</th><th>Units</th><th>Bidders</th><th>Total Bids</th><th>Sold</th><th>Revenue</th><th>Commission</th><th>Status</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PE-2026-03</td><td>Mar 8, 2026</td><td>18</td><td>42</td><td>156</td><td style={{fontWeight: 600, color: '#22c55e'}}>8</td><td>$312,000</td><td style={{color: '#22c55e', fontWeight: 600}}>$2,000</td><td><span className="bg pay-recv">Settled</span></td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PE-2026-02</td><td>Feb 8, 2026</td><td>15</td><td>38</td><td>124</td><td style={{fontWeight: 600, color: '#22c55e'}}>6</td><td>$248,000</td><td style={{color: '#22c55e', fontWeight: 600}}>$1,500</td><td><span className="bg pay-recv">Settled</span></td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PE-2026-01</td><td>Jan 11, 2026</td><td>12</td><td>29</td><td>87</td><td style={{fontWeight: 600, color: '#22c55e'}}>4</td><td>$168,000</td><td style={{color: '#22c55e', fontWeight: 600}}>$1,000</td><td><span className="bg pay-recv">Settled</span></td></tr>
      </tbody></table></div>
    </div>
  </div>
</div>

{/* ============ EVENT DETAIL ============ */}
<div className={`page ${activePage === 'mkt-public-event-detail' ? 'active' : ''}`} id="page-mkt-public-event-detail">
  <div className="detail-header">
    <button className="detail-back" onClick={() => showPage('mkt-public-events')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div className="detail-info"><div className="detail-title">PE-2026-04 — April Public Auction</div><div className="detail-meta">Apr 12, 2026 10:00 AM – Apr 13, 2026 10:00 AM · 24 hours · 22 units submitted</div></div>
    <span className="bg pending" style={{fontSize: 13, padding: '6px 16px'}}>Accepting Units</span>
  </div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      {/* Unit review */}
      <div className="tabs">
        <div className={`tab ${unitReviewTab === 'pending' ? 'active' : ''}`} onClick={() => setUnitReviewTab('pending')}>Pending Review (8)</div>
        <div className={`tab ${unitReviewTab === 'approved' ? 'active' : ''}`} onClick={() => setUnitReviewTab('approved')}>Approved (14)</div>
        <div className={`tab ${unitReviewTab === 'all' ? 'active' : ''}`} onClick={() => setUnitReviewTab('all')}>All (22)</div>
      </div>
      <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
        {/* Pending */}
        <div style={{display: unitReviewTab === 'pending' || unitReviewTab === 'all' ? 'block' : 'none'}}>
          {unitReviewTab === 'all' && <div style={{padding: '10px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: 12, fontWeight: 600, color: '#92400e'}}>Pending Review</div>}
          <div className="tw"><table><thead><tr><th>Unit</th><th>Dealer</th><th>Starting Bid</th><th>Reserve</th><th>Photos</th><th>Submitted</th><th>Action</th></tr></thead><tbody>
            <tr><td style={{fontWeight: 500}}>2024 Jayco Eagle HT 312BHOK</td><td style={{fontSize: 12, color: '#888'}}>Smith's RV</td><td>$48,000</td><td>$52,000</td><td>8</td><td>Mar 18</td><td><button className="btn btn-s btn-sm" onClick={() => alert('Unit approved for public auction!')}>Approve</button> <button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => { if (confirm('Reject this submission?')) {} }}>Reject</button></td></tr>
            <tr><td style={{fontWeight: 500}}>2023 Forest River Wildwood 31KQBTS</td><td style={{fontSize: 12, color: '#888'}}>Atlantic RV</td><td>$32,000</td><td>$35,000</td><td>6</td><td>Mar 18</td><td><button className="btn btn-s btn-sm">Approve</button> <button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}}>Reject</button></td></tr>
          </tbody></table></div>
        </div>
        {/* Approved */}
        <div style={{display: unitReviewTab === 'approved' || unitReviewTab === 'all' ? 'block' : 'none'}}>
          {unitReviewTab === 'all' && <div style={{padding: '10px 20px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontSize: 12, fontWeight: 600, color: '#166534'}}>Approved</div>}
          <div className="tw"><table><thead><tr><th>Unit</th><th>Dealer</th><th>Starting Bid</th><th>Reserve</th><th>Buy Now</th><th>Photos</th><th>Status</th></tr></thead><tbody>
            <tr><td style={{fontWeight: 500}}>2024 Grand Design Imagine 2800BH</td><td style={{fontSize: 12, color: '#888'}}>Smith's RV</td><td>$38,000</td><td>$42,000</td><td>$46,500</td><td>10</td><td><span className="bg active">Ready</span></td></tr>
            <tr><td style={{fontWeight: 500}}>2023 Keystone Cougar 29BHS</td><td style={{fontSize: 12, color: '#888'}}>Atlantic RV</td><td>$34,000</td><td>$37,500</td><td>—</td><td>8</td><td><span className="bg active">Ready</span></td></tr>
            <tr><td style={{fontWeight: 500}}>2024 Coachmen Catalina 263BHSCK</td><td style={{fontSize: 12, color: '#888'}}>Ontario RV</td><td>$25,000</td><td>$28,000</td><td>$31,000</td><td>7</td><td><span className="bg active">Ready</span></td></tr>
          </tbody></table></div>
        </div>
      </div>
    </div>
    <div>
      <div className="cd-section"><div className="cd-section-h">Event Settings</div>
        <div className="cd-row"><span className="cd-label">Event</span><span className="cd-value">PE-2026-04</span></div>
        <div className="cd-row"><span className="cd-label">Start</span><span className="cd-value">Apr 12, 10 AM</span></div>
        <div className="cd-row"><span className="cd-label">End</span><span className="cd-value">Apr 13, 10 AM</span></div>
        <div className="cd-row"><span className="cd-label">Submission Deadline</span><span className="cd-value">Apr 8</span></div>
        <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg pending">Accepting Units</span></span></div>
      </div>
      <div className="cd-section"><div className="cd-section-h">Stats</div>
        <div className="cd-row"><span className="cd-label">Units Submitted</span><span className="cd-value">22</span></div>
        <div className="cd-row"><span className="cd-label">Approved</span><span className="cd-value" style={{color: '#22c55e'}}>14</span></div>
        <div className="cd-row"><span className="cd-label">Pending Review</span><span className="cd-value" style={{color: '#d97706'}}>8</span></div>
        <div className="cd-row"><span className="cd-label">Showcase Dealers</span><span className="cd-value">14</span></div>
        <div className="cd-row"><span className="cd-label">Registered Bidders</span><span className="cd-value">—</span></div>
      </div>
      <div style={{padding: 12, display: 'flex', flexDirection: 'column' as const, gap: 8}}>
        <button className="btn btn-p btn-sm" style={{width: '100%', justifyContent: 'center'}} onClick={() => { if (confirm('Send notification to all showcase dealers about this event?')) alert('Notifications sent!'); }}>Notify Dealers</button>
        <button className="btn btn-s btn-sm" style={{width: '100%', justifyContent: 'center'}} onClick={() => { if (confirm('Go LIVE? This opens the 24-hour public auction window.')) alert('Event is now LIVE!'); }}>Go Live →</button>
        <button className="btn btn-o btn-sm" style={{width: '100%', justifyContent: 'center'}} onClick={() => { if (confirm('End the auction and begin settling winners?')) alert('Settling...'); }}>End & Settle</button>
      </div>
    </div>
  </div>
</div>

    </>
  );
}

// ==========================================
// DEALER — Showcase Membership Upsell + Unit Submission
// ==========================================
// Add alongside existing DealerMarketplace pages.
// Nav item: "Public Showcase" under Marketplace
// Titles: 'mkt-showcase': ['Public Showcase', '$299/year add-on']
//         'mkt-showcase-submit': ['Submit Unit', 'Public auction showcase']
// Parents: 'mkt-showcase-submit': 'mkt-showcase'

interface DealerProps { activePage: string; showPage: (id: string) => void; }

export function DealerShowcasePages({ activePage, showPage }: DealerProps) {
  const [showcaseAccess, setShowcaseAccess] = useState<'none'|'active'>('none');

  return (
    <>

{/* ============ SHOWCASE MEMBERSHIP / UPSELL ============ */}
<div className={`page ${activePage === 'mkt-showcase' ? 'active' : ''}`} id="page-mkt-showcase">
  {showcaseAccess === 'none' ? (
    <div style={{maxWidth: 640, margin: '20px auto'}}>
      <div style={{textAlign: 'center', marginBottom: 24}}>
        <svg width="56" height="56" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" style={{marginBottom: 12}}>
          <path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/>
        </svg>
        <div style={{fontSize: 22, fontWeight: 700, marginBottom: 6}}>Public Auction Showcase</div>
        <div style={{fontSize: 13, color: '#666', lineHeight: '1.6'}}>Once per month, your units go live in a 24-hour public auction. Real buyers. Real bids. Maximum exposure for your inventory.</div>
      </div>

      <div className="pn" style={{marginBottom: 20}}>
        <div className="pn-h"><span className="pn-t">Showcase Membership — $299/year</span><span style={{fontSize: 12, color: '#888'}}>Add-on to marketplace</span></div>
        <div style={{padding: 20, fontSize: 13, lineHeight: '2'}}>
          <div>✓ List units in the monthly public auction (24-hour event)</div>
          <div>✓ Your units shown to verified public buyers across Canada</div>
          <div>✓ Dealer Suite 360 handles all bidder verification + credit card holds</div>
          <div>✓ Set reserve prices + optional Buy Now pricing</div>
          <div>✓ Real-time bidding with auto-extend protection</div>
          <div>✓ $250 flat commission per completed sale (same as marketplace)</div>
          <div>✓ Professional listing with photos, specs, descriptions</div>
          <div>✓ Dealer Suite 360 promotes the event to registered bidders</div>
        </div>
        <div style={{padding: '12px 20px', background: '#eff6ff', borderTop: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af'}}>
          This is an add-on to your $499/year marketplace membership. Total: $798/year for marketplace + public showcase.
        </div>
      </div>

      <div style={{textAlign: 'center'}}>
        <button className="btn btn-s" style={{fontSize: 14, padding: '12px 32px'}} onClick={() => setShowcaseAccess('active')}>Subscribe — $299/year</button>
        <div style={{fontSize: 12, color: '#888', marginTop: 8}}>Billed annually. Cancel anytime.</div>
      </div>
    </div>
  ) : (
    <div>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <div><div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Public Showcase</div>
        <div style={{fontSize: 13, color: '#888'}}>Submit units for the monthly public auction. Next event: <strong>April 12, 2026</strong> (submission deadline: Apr 8)</div></div>
        <button className="btn btn-p btn-sm" onClick={() => showPage('mkt-showcase-submit')}>+ Submit Unit for April Auction</button>
      </div>

      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Membership</div><div className="sc-v" style={{fontSize: 16, color: '#22c55e'}}>Active</div><div style={{fontSize: 12, color: '#888'}}>Renews Mar 2027</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Units Showcased</div><div className="sc-v">6</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Sold via Public</div><div className="sc-v" style={{color: '#22c55e'}}>3</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Next Event</div><div className="sc-v" style={{fontSize: 16}}>Apr 12</div><div style={{fontSize: 12, color: '#d97706'}}>Deadline: Apr 8</div></div>
      </div>

      <div className="pn">
        <div className="pn-h"><span className="pn-t">My Showcase Submissions</span></div>
        <div className="tw"><table><thead><tr><th>Unit</th><th>Event</th><th>Starting Bid</th><th>Reserve</th><th>Current Bid</th><th>Bids</th><th>Status</th><th>Action</th></tr></thead><tbody>
          <tr><td style={{fontWeight: 500}}>2024 Grand Design Imagine 2800BH</td><td>April 2026</td><td>$38,000</td><td>$42,000</td><td>—</td><td>—</td><td><span className="bg active">Approved</span></td><td><button className="btn btn-o btn-sm">View</button></td></tr>
          <tr><td style={{fontWeight: 500}}>2024 Jayco Eagle HT 312BHOK</td><td>April 2026</td><td>$48,000</td><td>$52,000</td><td>—</td><td>—</td><td><span className="bg pending">Pending Review</span></td><td><button className="btn btn-o btn-sm">Edit</button></td></tr>
          <tr><td style={{fontWeight: 500}}>2023 Keystone Cougar 29BHS</td><td>March 2026</td><td>$34,000</td><td>$37,500</td><td style={{fontWeight: 600, color: '#22c55e'}}>$39,200</td><td>11</td><td><span className="bg pay-recv">Sold</span></td><td><button className="btn btn-o btn-sm">View</button></td></tr>
          <tr><td style={{fontWeight: 500}}>2024 Forest River Rockwood</td><td>February 2026</td><td>$40,000</td><td>$44,000</td><td>$41,500</td><td>7</td><td><span className="bg denied">Unsold</span></td><td><button className="btn btn-o btn-sm">Relist</button></td></tr>
        </tbody></table></div>
      </div>
    </div>
  )}
</div>

{/* ============ SUBMIT UNIT FOR SHOWCASE ============ */}
<div className={`page ${activePage === 'mkt-showcase-submit' ? 'active' : ''}`} id="page-mkt-showcase-submit">
  <div className="detail-header">
    <button className="detail-back" onClick={() => showPage('mkt-showcase')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div className="detail-info"><div className="detail-title">Submit Unit for April Public Auction</div><div className="detail-meta">Event: Apr 12, 2026 · Submission deadline: Apr 8 · 24-hour public bidding</div></div>
  </div>
  <div className="pn">
    <div style={{padding: '12px 20px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontSize: 12, color: '#166534', display: 'flex', alignItems: 'center', gap: 8}}>
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
      This unit will be shown to verified public buyers during the 24-hour auction window. Your dealership identity is hidden until a sale is confirmed.
    </div>
    <div className="form-grid c3">
      <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Select Unit</label></div>
      <div className="form-group full"><label>From your inventory or marketplace listings</label><select><option>Select unit...</option><option>MKT-0284 — 2024 Grand Design Imagine 2800BH ($42,900)</option><option>1UJCJ0BT4N1KQ8R2 — 2024 Jayco Eagle HT (not listed)</option><option>+ Enter new unit manually</option></select></div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Auction Pricing</label></div>
      <div className="form-group"><label>Starting Bid</label><input placeholder="$0.00" /><div style={{fontSize: 11, color: '#888', marginTop: 4}}>Bidding opens at this amount</div></div>
      <div className="form-group"><label>Reserve Price (hidden)</label><input placeholder="$0.00" /><div style={{fontSize: 11, color: '#888', marginTop: 4}}>Won't sell below this — not shown to bidders</div></div>
      <div className="form-group"><label>Buy Now Price (optional)</label><input placeholder="$0.00" /><div style={{fontSize: 11, color: '#888', marginTop: 4}}>Instant purchase — ends bidding immediately</div></div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Photos (min 5 required for public auction)</label></div>
      <div className="form-group full">
        <div className="upload-zone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 48, height: 48, color: '#ccc', marginBottom: 12}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><div style={{fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4}}>Upload showcase photos</div><div style={{fontSize: 13, color: '#888'}}>High quality exterior + interior. Min 5, max 20. First photo is the hero image.</div></div>
      </div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label>Public Description</label><textarea placeholder="This description is shown to public bidders. Highlight condition, features, options, warranty status..." style={{minHeight: 100}} /></div>
    </div>
    <div className="btn-bar">
      <button className="btn btn-s" onClick={() => { alert('Unit submitted for review! Dealer Suite 360 will approve within 24 hours.'); showPage('mkt-showcase'); }}>Submit for Review</button>
      <button className="btn btn-o" onClick={() => showPage('mkt-showcase')}>Save Draft</button>
      <button className="btn btn-o" onClick={() => showPage('mkt-showcase')}>Cancel</button>
    </div>
  </div>
</div>

    </>
  );
}

// ==========================================
// EXPORTS
// ==========================================

export const operatorPublicAuctionTitles: Record<string, [string, string]> = {
  'mkt-public-events': ['Public Auction Events', 'Monthly public sales'],
  'mkt-public-event-detail': ['Event Detail', 'Manage showcase'],
};
export const operatorPublicAuctionParents: Record<string, string> = {
  'mkt-public-event-detail': 'mkt-public-events',
};

export const dealerShowcaseTitles: Record<string, [string, string]> = {
  'mkt-showcase': ['Public Showcase', '$299/year add-on'],
  'mkt-showcase-submit': ['Submit Unit', 'Public auction showcase'],
};
export const dealerShowcaseParents: Record<string, string> = {
  'mkt-showcase-submit': 'mkt-showcase',
};
