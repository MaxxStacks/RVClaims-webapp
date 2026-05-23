import { useState } from 'react';
import { useLocation } from 'wouter';

export default function MktPublicEventDetail() {
  const [, navigate] = useLocation();
  const [unitReviewTab, setUnitReviewTab] = useState<'pending'|'approved'|'all'>('pending');

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('mkt-public-events')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">PE-2026-04 — April Public Auction</div><div className="detail-meta">Apr 12, 2026 10:00 AM – Apr 13, 2026 10:00 AM · 24 hours · 22 units submitted</div></div>
        <span className="bg pending" style={{fontSize: 13, padding: '6px 16px'}}>Accepting Units</span>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
        <div>
          <div className="tabs">
            <div className={`tab ${unitReviewTab === 'pending' ? 'active' : ''}`} onClick={() => setUnitReviewTab('pending')}>Pending Review (8)</div>
            <div className={`tab ${unitReviewTab === 'approved' ? 'active' : ''}`} onClick={() => setUnitReviewTab('approved')}>Approved (14)</div>
            <div className={`tab ${unitReviewTab === 'all' ? 'active' : ''}`} onClick={() => setUnitReviewTab('all')}>All (22)</div>
          </div>
          <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
            <div style={{display: unitReviewTab === 'pending' || unitReviewTab === 'all' ? 'block' : 'none'}}>
              {unitReviewTab === 'all' && <div style={{padding: '10px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: 12, fontWeight: 600, color: '#92400e'}}>Pending Review</div>}
              <div className="tw"><table><thead><tr><th>Unit</th><th>Dealer</th><th>Starting Bid</th><th>Reserve</th><th>Photos</th><th>Submitted</th><th>Action</th></tr></thead><tbody>
                <tr><td style={{fontWeight: 500}}>2024 Jayco Eagle HT 312BHOK</td><td style={{fontSize: 12, color: '#888'}}>Smith's RV</td><td>$48,000</td><td>$52,000</td><td>8</td><td>Mar 18</td><td><button className="btn btn-s btn-sm" onClick={() => alert('Unit approved for public auction!')}>Approve</button> <button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => { if (confirm('Reject this submission?')) {} }}>Reject</button></td></tr>
                <tr><td style={{fontWeight: 500}}>2023 Forest River Wildwood 31KQBTS</td><td style={{fontSize: 12, color: '#888'}}>Atlantic RV</td><td>$32,000</td><td>$35,000</td><td>6</td><td>Mar 18</td><td><button className="btn btn-s btn-sm">Approve</button> <button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}}>Reject</button></td></tr>
              </tbody></table></div>
            </div>
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
          <div style={{padding: 12, display: 'flex', flexDirection: 'column', gap: 8}}>
            <button className="btn btn-p btn-sm" style={{width: '100%', justifyContent: 'center'}} onClick={() => { if (confirm('Send notification to all showcase dealers about this event?')) alert('Notifications sent!'); }}>Notify Dealers</button>
            <button className="btn btn-s btn-sm" style={{width: '100%', justifyContent: 'center'}} onClick={() => { if (confirm('Go LIVE? This opens the 24-hour public auction window.')) alert('Event is now LIVE!'); }}>Go Live →</button>
            <button className="btn btn-o btn-sm" style={{width: '100%', justifyContent: 'center'}} onClick={() => { if (confirm('End the auction and begin settling winners?')) alert('Settling...'); }}>End & Settle</button>
          </div>
        </div>
      </div>
    </div>
  );
}
