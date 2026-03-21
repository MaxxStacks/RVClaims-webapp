// OperatorMarketplace.tsx — Standalone component for marketplace pages in operator portal
// Import this and render inside the operator portal's <div className="content">
// 
// Usage in OperatorPortal.tsx:
//   import { OperatorMarketplacePages } from '../components/OperatorMarketplace';
//   // Inside return, after existing pages in <div className="content">:
//   <OperatorMarketplacePages activePage={activePage} showPage={showPage} />
//
// Also add nav items, titles, parents per comments at bottom of this file.

import { useState } from 'react';

interface Props {
  activePage: string;
  showPage: (id: string) => void;
}

export function OperatorMarketplacePages({ activePage, showPage }: Props) {
  // Tab states — each section has its own
  const [memberTab, setMemberTab] = useState<'active'|'pending'|'expired'|'all'>('active');
  const [txnTab, setTxnTab] = useState<'holds'|'completed'|'cancelled'>('holds');
  const [auctionTab, setAuctionTab] = useState<'live'|'completed'|'cancelled'>('live');
  const [memberSearch, setMemberSearch] = useState('');
  const [listingSearch, setListingSearch] = useState('');

  return (
    <>

{/* ============ MARKETPLACE MEMBERS ============ */}
<div className={`page ${activePage === 'mkt-members' ? 'active' : ''}`} id="page-mkt-members">
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Total Members</div><div className="sc-v">28</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Pending</div><div className="sc-v" style={{color: '#d97706'}}>4</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active</div><div className="sc-v" style={{color: '#22c55e'}}>22</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Annual Revenue</div><div className="sc-v">$13,972</div></div>
  </div>

  <div className="tabs">
    <div className={`tab ${memberTab === 'active' ? 'active' : ''}`} onClick={() => setMemberTab('active')}>Active (22)</div>
    <div className={`tab ${memberTab === 'pending' ? 'active' : ''}`} onClick={() => setMemberTab('pending')}>Pending (4)</div>
    <div className={`tab ${memberTab === 'expired' ? 'active' : ''}`} onClick={() => setMemberTab('expired')}>Expired (2)</div>
    <div className={`tab ${memberTab === 'all' ? 'active' : ''}`} onClick={() => setMemberTab('all')}>All (28)</div>
  </div>

  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
    <div className="filter-bar">
      <input type="text" placeholder="Search dealers..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} />
    </div>

    {/* === ACTIVE PANEL === */}
    <div style={{display: memberTab === 'active' || memberTab === 'all' ? 'block' : 'none'}}>
      {memberTab === 'all' && <div style={{padding: '10px 20px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontSize: 12, fontWeight: 600, color: '#166534'}}>Active Members</div>}
      <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Province</th><th>Verified</th><th>Listings</th><th>Purchases</th><th>Renewal</th><th>Status</th><th>Action</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500}}><span className="cid" onClick={() => showPage('mkt-member-detail')}>Smith's RV Centre</span></td><td>Mike Smith<br /><span style={{fontSize: 11, color: '#888'}}>mike@smithsrv.ca</span></td><td>Ontario</td><td>Jan 12</td><td>8</td><td>3</td><td>Jan 10, 2027</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('mkt-member-detail')}>Manage</button></td></tr>
        <tr><td style={{fontWeight: 500}}>Atlantic RV</td><td>Sarah Chen<br /><span style={{fontSize: 11, color: '#888'}}>sarah@atlanticrv.ca</span></td><td>Nova Scotia</td><td>Jan 18</td><td>12</td><td>5</td><td>Jan 15, 2027</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
        <tr><td style={{fontWeight: 500}}>Prairie Wind RV</td><td>James Flett<br /><span style={{fontSize: 11, color: '#888'}}>james@prairiewind.ca</span></td><td>Manitoba</td><td>Feb 3</td><td>6</td><td>2</td><td>Feb 1, 2027</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
        <tr><td style={{fontWeight: 500}}>Ontario RV Depot</td><td>Marc Leblanc<br /><span style={{fontSize: 11, color: '#888'}}>marc@onrvdepot.ca</span></td><td>Ontario</td><td>Feb 20</td><td>10</td><td>4</td><td>Feb 18, 2027</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
        <tr><td style={{fontWeight: 500}}>West Coast Campers</td><td>Dan Rivera<br /><span style={{fontSize: 11, color: '#888'}}>dan@westcoast.ca</span></td><td>BC</td><td>Feb 15</td><td>4</td><td>1</td><td>Feb 12, 2027</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
      </tbody></table></div>
    </div>

    {/* === PENDING PANEL === */}
    <div style={{display: memberTab === 'pending' || memberTab === 'all' ? 'block' : 'none'}}>
      {memberTab === 'all' && <div style={{padding: '10px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: 12, fontWeight: 600, color: '#92400e'}}>Pending Verification</div>}
      <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Province</th><th>Applied</th><th>License #</th><th>Status</th><th>Action</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: '#d97706'}}>Lakeside RV Sales ★</td><td>Tom Nguyen<br /><span style={{fontSize: 11, color: '#888'}}>tom@lakesiderv.ca</span></td><td>Ontario</td><td>Mar 14</td><td>OMVIC-2024-88431</td><td><span className="bg pending">Pending</span></td><td><button className="btn btn-s btn-sm" onClick={() => showPage('mkt-member-detail')}>Verify</button></td></tr>
        <tr><td style={{fontWeight: 500, color: '#d97706'}}>Northern Trails ★</td><td>Lisa Park<br /><span style={{fontSize: 11, color: '#888'}}>lisa@northerntrails.ca</span></td><td>Alberta</td><td>Mar 15</td><td>AMVIC-2023-44210</td><td><span className="bg pending">Pending</span></td><td><button className="btn btn-s btn-sm">Verify</button></td></tr>
        <tr><td style={{fontWeight: 500, color: '#d97706'}}>Maritime RV ★</td><td>Paul Doucet<br /><span style={{fontSize: 11, color: '#888'}}>paul@maritimerv.ca</span></td><td>New Brunswick</td><td>Mar 16</td><td>NB-DLR-2024-771</td><td><span className="bg pending">Pending</span></td><td><button className="btn btn-s btn-sm">Verify</button></td></tr>
        <tr><td style={{fontWeight: 500, color: '#d97706'}}>Quebec Plein Air ★</td><td>J-F Roy<br /><span style={{fontSize: 11, color: '#888'}}>jf@qcpleinair.ca</span></td><td>Quebec</td><td>Mar 17</td><td>OPC-2024-55892</td><td><span className="bg pending">Pending</span></td><td><button className="btn btn-s btn-sm">Verify</button></td></tr>
      </tbody></table></div>
    </div>

    {/* === EXPIRED PANEL === */}
    <div style={{display: memberTab === 'expired' || memberTab === 'all' ? 'block' : 'none'}}>
      {memberTab === 'all' && <div style={{padding: '10px 20px', background: '#fef2f2', borderBottom: '1px solid #fecaca', fontSize: 12, fontWeight: 600, color: '#991b1b'}}>Expired</div>}
      <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Province</th><th>Expired</th><th>Was Active Since</th><th>Status</th><th>Action</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500}}>BC Camper World</td><td>Kim Lee<br /><span style={{fontSize: 11, color: '#888'}}>kim@bccamper.ca</span></td><td>BC</td><td>Feb 28, 2026</td><td>Mar 2025</td><td><span className="bg denied">Expired</span></td><td><button className="btn btn-o btn-sm">Send Renewal</button></td></tr>
        <tr><td style={{fontWeight: 500}}>Valley RV</td><td>Steve Morris<br /><span style={{fontSize: 11, color: '#888'}}>steve@valleyrv.ca</span></td><td>Ontario</td><td>Mar 5, 2026</td><td>Mar 2025</td><td><span className="bg denied">Expired</span></td><td><button className="btn btn-o btn-sm">Send Renewal</button></td></tr>
      </tbody></table></div>
    </div>
  </div>
</div>

{/* ============ MEMBER DETAIL / VERIFICATION ============ */}
<div className={`page ${activePage === 'mkt-member-detail' ? 'active' : ''}`} id="page-mkt-member-detail">
  <div className="detail-header">
    <button className="detail-back" onClick={() => showPage('mkt-members')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div className="detail-info"><div className="detail-title">Lakeside RV Sales</div><div className="detail-meta">Applied Mar 14, 2026 · Marketplace Membership · Pending Verification</div></div>
    <span className="bg pending" style={{fontSize: 13, padding: '6px 16px'}}>Pending</span>
  </div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      <div className="pn" style={{marginBottom: 16}}>
        <div className="pn-h"><span className="pn-t">Verification Checklist</span><span style={{fontSize: 12, color: '#888'}}>Complete all before approving</span></div>
        <div style={{padding: 20}}>
          {[
            ['Business registration verified', 'Check provincial business registry for active status'],
            ['Dealer license confirmed', 'OMVIC / provincial license — OMVIC-2024-88431'],
            ['Physical location verified', 'Google Maps confirmed: 455 Lake Shore Blvd, Orillia, ON'],
            ['Contact phone verified', 'Call placed to (705) 555-0188, spoke with owner'],
            ['Annual fee collected ($499)', 'Stripe payment processed and confirmed'],
          ].map(([title, desc], i) => (
            <label key={i} style={{display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: i < 4 ? '1px solid #f5f5f5' : 'none', cursor: 'pointer'}}>
              <input type="checkbox" style={{width: 18, height: 18, flexShrink: 0}} />
              <div><div style={{fontSize: 13, fontWeight: 500}}>{title}</div><div style={{fontSize: 12, color: '#888'}}>{desc}</div></div>
            </label>
          ))}
        </div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Application Details</span></div>
        <div className="form-grid">
          {[
            ['Dealership Name', 'Lakeside RV Sales'],
            ['Legal Name', 'Lakeside RV Sales Inc.'],
            ['Owner / Contact', 'Tom Nguyen'],
            ['Email', 'tom@lakesiderv.ca'],
            ['Phone', '(705) 555-0188'],
            ['Dealer License #', 'OMVIC-2024-88431'],
            ['Address', '455 Lake Shore Blvd, Orillia, ON L3V 6H2'],
            ['Website', 'https://lakesiderv.ca'],
          ].map(([label, val]) => (
            <div className="form-group" key={label}><label>{label}</label><input defaultValue={val} readOnly style={{background: '#f3f4f6'}} /></div>
          ))}
          <div className="form-group full"><label>Reason for Joining</label><textarea readOnly style={{background: '#f3f4f6'}} defaultValue="Looking to expand inventory options. We specialize in travel trailers and fifth wheels but often lose sales on toy haulers and class C units we don't carry." /></div>
          <div className="form-group full"><label>Internal Notes (staff only)</label><textarea placeholder="Add verification notes, call log, observations..." /></div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-s" onClick={() => { if (confirm('Approve Lakeside RV Sales and collect $499 annual fee?')) showPage('mkt-members'); }}>Approve & Collect Payment</button>
          <button className="btn btn-d" onClick={() => { if (confirm('Reject this application? The dealer will be notified.')) showPage('mkt-members'); }}>Reject Application</button>
          <button className="btn btn-o">Request More Info</button>
        </div>
      </div>
    </div>
    <div>
      <div className="cd-section"><div className="cd-section-h">Application Summary</div>
        <div className="cd-row"><span className="cd-label">Applied</span><span className="cd-value">Mar 14, 2026</span></div>
        <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg pending">Pending</span></span></div>
        <div className="cd-row"><span className="cd-label">Annual Fee</span><span className="cd-value" style={{fontWeight: 600}}>$499/year</span></div>
        <div className="cd-row"><span className="cd-label">Payment</span><span className="cd-value" style={{color: '#aaa'}}>Not collected</span></div>
      </div>
      <div className="cd-section"><div className="cd-section-h">Existing Customer?</div>
        <div className="cd-row"><span className="cd-label">Claims Portal</span><span className="cd-value" style={{color: '#aaa'}}>Not registered</span></div>
        <div className="cd-row"><span className="cd-label">Match</span><span className="cd-value" style={{color: '#aaa'}}>No existing dealer</span></div>
      </div>
    </div>
  </div>
</div>

{/* ============ ALL LISTINGS ============ */}
<div className={`page ${activePage === 'mkt-listings' ? 'active' : ''}`} id="page-mkt-listings">
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active</div><div className="sc-v" style={{color: '#2563eb'}}>142</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>On Hold</div><div className="sc-v" style={{color: '#d97706'}}>8</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Sold (MTD)</div><div className="sc-v" style={{color: '#22c55e'}}>14</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Commission (MTD)</div><div className="sc-v">$3,500</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Avg Days to Sell</div><div className="sc-v">12</div></div>
  </div>
  <div className="pn">
    <div className="filter-bar">
      <input type="text" placeholder="Search VIN, model, specs..." value={listingSearch} onChange={(e) => setListingSearch(e.target.value)} />
      <select><option>All Manufacturers</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Grand Design</option><option>Coachmen</option></select>
      <select><option>All Types</option><option>Travel Trailer</option><option>Fifth Wheel</option><option>Class A</option><option>Class C</option><option>Toy Hauler</option></select>
      <select><option>All Statuses</option><option>Active</option><option>On Hold</option><option>Pending Review</option><option>Sold</option><option>Withdrawn</option></select>
    </div>
    <div className="tw"><table><thead><tr><th>Listing</th><th>Unit</th><th>Specs</th><th>Seller</th><th>Price</th><th>Inquiries</th><th>Views</th><th>Status</th><th>Listed</th><th>Action</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('mkt-listing-detail')}>MKT-0284</span></td><td>2024 Grand Design Imagine 2800BH</td><td style={{fontSize: 12, color: '#666'}}>28' · 3 slides · 2 bunks</td><td style={{fontSize: 12, color: '#888'}}>Smith's RV</td><td style={{fontWeight: 600}}>$42,900</td><td>3</td><td>48</td><td><span className="bg active">Active</span></td><td>Mar 10</td><td><button className="btn btn-o btn-sm" onClick={() => showPage('mkt-listing-detail')}>View</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>MKT-0281</td><td>2023 Keystone Cougar 29BHS</td><td style={{fontSize: 12, color: '#666'}}>33' · 2 slides · 2 bunks</td><td style={{fontSize: 12, color: '#888'}}>Atlantic RV</td><td style={{fontWeight: 600}}>$38,500</td><td>5</td><td>73</td><td><span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>On Hold</span></td><td>Mar 8</td><td><button className="btn btn-o btn-sm">View</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>MKT-0276</td><td>2024 Forest River Rockwood 2891BH</td><td style={{fontSize: 12, color: '#666'}}>32' · 3 slides · 1 bunk</td><td style={{fontSize: 12, color: '#888'}}>Prairie Wind</td><td style={{fontWeight: 600}}>$45,200</td><td>2</td><td>51</td><td><span className="bg active">Active</span></td><td>Mar 5</td><td><button className="btn btn-o btn-sm">View</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>MKT-0270</td><td>2023 Jayco Eagle HT 28.5RSTS</td><td style={{fontSize: 12, color: '#666'}}>34' · 3 slides · 0 bunks</td><td style={{fontSize: 12, color: '#888'}}>West Coast</td><td style={{fontWeight: 600}}>$51,800</td><td>1</td><td>92</td><td><span className="bg pay-recv">Sold</span></td><td>Feb 28</td><td><button className="btn btn-o btn-sm">View</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>MKT-0265</td><td>2024 Coachmen Catalina 263BHSCK</td><td style={{fontSize: 12, color: '#666'}}>28' · 1 slide · 2 bunks</td><td style={{fontSize: 12, color: '#888'}}>Smith's RV</td><td style={{fontWeight: 600}}>$35,900</td><td>4</td><td>68</td><td><span className="bg pay-recv">Sold</span></td><td>Feb 22</td><td><button className="btn btn-o btn-sm">View</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>MKT-0260</td><td>2025 Heartland Bighorn 3375SS</td><td style={{fontSize: 12, color: '#666'}}>38' · 4 slides · 0 bunks</td><td style={{fontSize: 12, color: '#888'}}>Ontario RV</td><td style={{fontWeight: 600}}>$72,500</td><td>2</td><td>41</td><td><span className="bg active">Active</span></td><td>Feb 18</td><td><button className="btn btn-o btn-sm">View</button></td></tr>
    </tbody></table></div>
  </div>
</div>

{/* ============ TRANSACTIONS ============ */}
<div className={`page ${activePage === 'mkt-transactions' ? 'active' : ''}`} id="page-mkt-transactions">
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Holds</div><div className="sc-v" style={{color: '#d97706'}}>8</div><div style={{fontSize: 12, color: '#888'}}>$4,000 in escrow</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Completed (MTD)</div><div className="sc-v" style={{color: '#22c55e'}}>14</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Commission (MTD)</div><div className="sc-v">$3,500</div><div style={{fontSize: 12, color: '#888'}}>14 × $250</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Commission (YTD)</div><div className="sc-v">$18,750</div></div>
  </div>
  <div className="tabs">
    <div className={`tab ${txnTab === 'holds' ? 'active' : ''}`} onClick={() => setTxnTab('holds')}>Active Holds (8)</div>
    <div className={`tab ${txnTab === 'completed' ? 'active' : ''}`} onClick={() => setTxnTab('completed')}>Completed (14)</div>
    <div className={`tab ${txnTab === 'cancelled' ? 'active' : ''}`} onClick={() => setTxnTab('cancelled')}>Released / Cancelled (3)</div>
  </div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
    {/* Active Holds */}
    <div style={{display: txnTab === 'holds' ? 'block' : 'none'}}>
      <div className="tw"><table><thead><tr><th>Transaction</th><th>Listing</th><th>Unit</th><th>Buyer</th><th>Seller</th><th>Hold</th><th>Sale Price</th><th>Status</th><th>Action</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('mkt-transaction-detail')}>TXN-0089</span></td><td>MKT-0281</td><td>2023 Keystone Cougar 29BHS</td><td>Ontario RV Depot</td><td>Atlantic RV</td><td style={{color: '#d97706', fontWeight: 600}}>$500</td><td>$38,500</td><td><span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>Escrow Active</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('mkt-transaction-detail')}>Manage</button></td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0091</td><td>MKT-0260</td><td>2025 Heartland Bighorn</td><td>Maritime RV</td><td>Ontario RV</td><td style={{color: '#d97706', fontWeight: 600}}>$500</td><td>$72,500</td><td><span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>Escrow Active</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
      </tbody></table></div>
    </div>
    {/* Completed */}
    <div style={{display: txnTab === 'completed' ? 'block' : 'none'}}>
      <div className="tw"><table><thead><tr><th>Transaction</th><th>Listing</th><th>Unit</th><th>Buyer</th><th>Seller</th><th>Sale Price</th><th>Commission</th><th>Completed</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0085</td><td>MKT-0270</td><td>2023 Jayco Eagle HT</td><td>Maritime RV</td><td>West Coast</td><td>$51,800</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 12</td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0082</td><td>MKT-0265</td><td>2024 Coachmen Catalina</td><td>BC Camper</td><td>Smith's RV</td><td>$35,900</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 8</td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0078</td><td>MKT-0252</td><td>2023 Forest River Wildwood</td><td>Valley RV</td><td>Prairie Wind</td><td>$29,800</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 2</td></tr>
      </tbody></table></div>
    </div>
    {/* Cancelled */}
    <div style={{display: txnTab === 'cancelled' ? 'block' : 'none'}}>
      <div className="tw"><table><thead><tr><th>Transaction</th><th>Listing</th><th>Unit</th><th>Buyer</th><th>Reason</th><th>Hold</th><th>Date</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0079</td><td>MKT-0258</td><td>2023 Forest River Wildwood</td><td>Northern Trails</td><td style={{fontSize: 12, color: '#888'}}>Buyer withdrew — found unit locally</td><td style={{color: '#22c55e'}}>$500 refunded</td><td>Mar 5</td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>TXN-0071</td><td>MKT-0248</td><td>2023 Keystone Montana</td><td>Ontario RV</td><td style={{fontSize: 12, color: '#888'}}>Undisclosed damage found on inspection</td><td style={{color: '#22c55e'}}>$500 refunded</td><td>Feb 22</td></tr>
      </tbody></table></div>
    </div>
  </div>
</div>

{/* ============ TRANSACTION DETAIL ============ */}
<div className={`page ${activePage === 'mkt-transaction-detail' ? 'active' : ''}`} id="page-mkt-transaction-detail">
  <div className="detail-header">
    <button className="detail-back" onClick={() => showPage('mkt-transactions')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div className="detail-info"><div className="detail-title">TXN-0089 — Escrow Active</div><div className="detail-meta">MKT-0281 · 2023 Keystone Cougar 29BHS · $38,500</div></div>
    <span className="bg" style={{background: '#fef3c7', color: '#d97706', fontSize: 13, padding: '6px 16px'}}>Escrow Active</span>
  </div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Escrow Timeline</span></div>
        <div className="act">
          <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t"><strong>Ontario RV Depot</strong> placed $500 hold</div><div className="act-tm">Mar 15, 2:30 PM · Stripe PI: pi_3NxR...</div></div></div>
          <div className="act-i"><span className="act-dot new"></span><div><div className="act-t">Dealer Suite 360 notified <strong>Atlantic RV</strong> (seller)</div><div className="act-tm">Mar 15, 2:31 PM</div></div></div>
          <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t">Atlantic RV <strong>accepted</strong> — unit reserved</div><div className="act-tm">Mar 15, 4:15 PM</div></div></div>
          <div className="act-i"><span className="act-dot pt"></span><div><div className="act-t">Awaiting <strong>transport / pickup</strong></div><div className="act-tm">In progress</div></div></div>
        </div>
      </div>
      <div className="pn"><div className="pn-h"><span className="pn-t">Communication</span></div>
        <div className="comm-box">
          <div className="comm-msg"><div className="comm-avatar dl">OR</div><div className="comm-content"><div className="comm-name">Ontario RV Depot (Buyer)</div><div className="comm-text">We'd like pickup Friday. Can seller have it prepped?</div><div className="comm-time">Mar 16, 9:00 AM</div></div></div>
          <div className="comm-msg"><div className="comm-avatar op">RC</div><div className="comm-content"><div className="comm-name">Dealer Suite 360 (You)</div><div className="comm-text">Confirmed — unit prepped Friday 10 AM. Address sent privately.</div><div className="comm-time">Mar 16, 10:30 AM</div></div></div>
        </div>
        <div style={{padding: '16px 20px'}}>
          <textarea placeholder="Message both parties..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical' as const}} />
          <div style={{display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end'}}>
            <select style={{padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit'}}><option>Send to buyer</option><option>Send to seller</option><option>Send to both</option></select>
            <button className="btn btn-p btn-sm">Send</button>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div className="cd-section"><div className="cd-section-h">Transaction</div>
        <div className="cd-row"><span className="cd-label">Transaction #</span><span className="cd-value">TXN-0089</span></div>
        <div className="cd-row"><span className="cd-label">Listing</span><span className="cd-value cid" onClick={() => showPage('mkt-listing-detail')}>MKT-0281</span></div>
        <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>Escrow Active</span></span></div>
        <div className="cd-row"><span className="cd-label">Hold</span><span className="cd-value" style={{fontWeight: 600}}>$500.00</span></div>
      </div>
      <div className="cd-section"><div className="cd-section-h">Buyer</div>
        <div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value">Ontario RV Depot</span></div>
        <div className="cd-row"><span className="cd-label">Contact</span><span className="cd-value">Marc Leblanc</span></div>
      </div>
      <div className="cd-section"><div className="cd-section-h">Seller</div>
        <div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value">Atlantic RV</span></div>
        <div className="cd-row"><span className="cd-label">Contact</span><span className="cd-value">Sarah Chen</span></div>
      </div>
      <div className="cd-section"><div className="cd-section-h">Financials</div>
        <div className="cd-row"><span className="cd-label">Sale Price</span><span className="cd-value" style={{fontWeight: 600}}>$38,500</span></div>
        <div className="cd-row"><span className="cd-label">Escrow Hold</span><span className="cd-value">$500</span></div>
        <div className="cd-row"><span className="cd-label">Commission</span><span className="cd-value" style={{color: 'var(--brand)', fontWeight: 600}}>$250</span></div>
      </div>
      <div style={{padding: 12, display: 'flex', flexDirection: 'column' as const, gap: 8}}>
        <button className="btn btn-s btn-sm" style={{width: '100%', justifyContent: 'center'}} onClick={() => { if (confirm('Complete sale: capture $500 hold and collect $250 commission?')) showPage('mkt-transactions'); }}>Complete Sale & Capture Hold</button>
        <button className="btn btn-o btn-sm" style={{width: '100%', justifyContent: 'center', color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => { if (confirm('Release $500 hold to buyer and cancel?')) showPage('mkt-transactions'); }}>Release Hold & Cancel</button>
      </div>
    </div>
  </div>
</div>

{/* ============ LIVE AUCTIONS ============ */}
<div className={`page ${activePage === 'mkt-auctions' ? 'active' : ''}`} id="page-mkt-auctions">
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Live Now</div><div className="sc-v" style={{color: '#dc2626'}}>1</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Upcoming</div><div className="sc-v" style={{color: '#d97706'}}>2</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Completed (MTD)</div><div className="sc-v" style={{color: '#22c55e'}}>6</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Auction Revenue (MTD)</div><div className="sc-v">$1,500</div></div>
  </div>
  <div className="tabs">
    <div className={`tab ${auctionTab === 'live' ? 'active' : ''}`} onClick={() => setAuctionTab('live')}>Live & Upcoming (3)</div>
    <div className={`tab ${auctionTab === 'completed' ? 'active' : ''}`} onClick={() => setAuctionTab('completed')}>Completed (6)</div>
    <div className={`tab ${auctionTab === 'cancelled' ? 'active' : ''}`} onClick={() => setAuctionTab('cancelled')}>Cancelled (1)</div>
  </div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
    {/* Live & Upcoming */}
    <div style={{display: auctionTab === 'live' ? 'block' : 'none'}}>
      <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Seller</th><th>Starting</th><th>Current Bid</th><th>Bids</th><th>Watchers</th><th>Ends</th><th>Status</th><th>Action</th></tr></thead><tbody>
        <tr style={{background: '#fef2f2'}}><td style={{fontWeight: 500, color: '#dc2626'}}><span className="cid" onClick={() => showPage('mkt-auction-detail')}>AUC-0034</span></td><td>2023 Heartland Bighorn 3960LS</td><td style={{fontSize: 12, color: '#888'}}>Prairie Wind</td><td>$55,000</td><td style={{fontWeight: 700, color: '#dc2626'}}>$62,500</td><td style={{fontWeight: 600}}>14</td><td>8</td><td style={{fontWeight: 600, color: '#dc2626'}}>23 min</td><td><span className="bg" style={{background: '#fef2f2', color: '#dc2626'}}>🔴 LIVE</span></td><td><button className="btn btn-p btn-sm" onClick={() => showPage('mkt-auction-detail')}>Monitor</button></td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0035</td><td>2024 Forest River Salem 30KQBSS</td><td style={{fontSize: 12, color: '#888'}}>Atlantic RV</td><td>$32,000</td><td>—</td><td>—</td><td>12</td><td>Mar 20, 2 PM</td><td><span className="bg pending">Scheduled</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0036</td><td>2023 Jayco Eagle 321RSTS</td><td style={{fontSize: 12, color: '#888'}}>Smith's RV</td><td>$48,000</td><td>—</td><td>—</td><td>6</td><td>Mar 22, 10 AM</td><td><span className="bg pending">Scheduled</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
      </tbody></table></div>
    </div>
    {/* Completed */}
    <div style={{display: auctionTab === 'completed' ? 'block' : 'none'}}>
      <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Seller</th><th>Winning Bid</th><th>Winner</th><th>Bids</th><th>Commission</th><th>Settled</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0033</td><td>2023 Coachmen Catalina 263BHSCK</td><td style={{fontSize: 12, color: '#888'}}>Ontario RV</td><td style={{fontWeight: 600}}>$34,200</td><td>Maritime RV</td><td>9</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 14</td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0031</td><td>2024 Keystone Passport 229RK</td><td style={{fontSize: 12, color: '#888'}}>West Coast</td><td style={{fontWeight: 600}}>$28,800</td><td>Prairie Wind</td><td>7</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 10</td></tr>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0029</td><td>2023 Forest River Cherokee 264DBH</td><td style={{fontSize: 12, color: '#888'}}>Atlantic RV</td><td style={{fontWeight: 600}}>$31,500</td><td>Smith's RV</td><td>11</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 6</td></tr>
      </tbody></table></div>
    </div>
    {/* Cancelled */}
    <div style={{display: auctionTab === 'cancelled' ? 'block' : 'none'}}>
      <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Seller</th><th>Reason</th><th>Cancelled</th></tr></thead><tbody>
        <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0030</td><td>2023 Grand Design Reflection 315RLTS</td><td style={{fontSize: 12, color: '#888'}}>Northern Trails</td><td style={{fontSize: 12, color: '#888'}}>Seller withdrew — sold privately</td><td>Mar 7</td></tr>
      </tbody></table></div>
    </div>
  </div>
</div>

    </>
  );
}

// ===== EXPORTS FOR TITLES & PARENTS =====
export const operatorMarketplaceTitles: Record<string, [string, string]> = {
  'mkt-members': ['Marketplace Members', '28 dealers'],
  'mkt-member-detail': ['Member Detail', 'Verification'],
  'mkt-listings': ['All Listings', '142 active'],
  'mkt-listing-detail': ['Listing Detail', 'Unit details'],
  'mkt-transactions': ['Transactions', 'Escrow & commissions'],
  'mkt-transaction-detail': ['Transaction Detail', 'Escrow tracking'],
  'mkt-auctions': ['Live Auctions', 'Manage auctions'],
  'mkt-auction-detail': ['Auction Detail', 'Settlement'],
};

export const operatorMarketplaceParents: Record<string, string> = {
  'mkt-member-detail': 'mkt-members',
  'mkt-listing-detail': 'mkt-listings',
  'mkt-transaction-detail': 'mkt-transactions',
  'mkt-auction-detail': 'mkt-auctions',
};
