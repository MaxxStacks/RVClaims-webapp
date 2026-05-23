import { useState } from 'react';
import { useLocation } from 'wouter';

export default function MktPublicEvents() {
  const [, navigate] = useLocation();
  const [eventTab, setEventTab] = useState<'upcoming'|'past'>('upcoming');

  return (
    <div className="page active">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <div>
          <div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Public Auction Events</div>
          <div style={{fontSize: 13, color: '#888'}}>Monthly 24-hour auctions open to the public. You pick the date, notify dealers, approve showcase units, and settle winners.</div>
        </div>
        <button className="btn btn-p btn-sm" onClick={() => navigate('mkt-public-event-detail')}>+ Schedule Event</button>
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
        <div style={{display: eventTab === 'upcoming' ? 'block' : 'none'}}>
          <div className="tw"><table><thead><tr><th>Event</th><th>Date</th><th>Duration</th><th>Submission Deadline</th><th>Units</th><th>Showcase Dealers</th><th>Status</th><th>Action</th></tr></thead><tbody>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => navigate('mkt-public-event-detail')}>PE-2026-04</span></td><td style={{fontWeight: 600}}>Apr 12, 2026 10 AM</td><td>24 hours</td><td>Apr 8</td><td style={{fontWeight: 600}}>22</td><td>14</td><td><span className="bg pending">Accepting Units</span></td><td><button className="btn btn-o btn-sm" onClick={() => navigate('mkt-public-event-detail')}>Manage</button></td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PE-2026-05</td><td>May 10, 2026 10 AM</td><td>24 hours</td><td>May 6</td><td>—</td><td>—</td><td><span className="bg draft">Scheduled</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
          </tbody></table></div>
        </div>
        <div style={{display: eventTab === 'past' ? 'block' : 'none'}}>
          <div className="tw"><table><thead><tr><th>Event</th><th>Date</th><th>Units</th><th>Bidders</th><th>Total Bids</th><th>Sold</th><th>Revenue</th><th>Commission</th><th>Status</th></tr></thead><tbody>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PE-2026-03</td><td>Mar 8, 2026</td><td>18</td><td>42</td><td>156</td><td style={{fontWeight: 600, color: '#22c55e'}}>8</td><td>$312,000</td><td style={{color: '#22c55e', fontWeight: 600}}>$2,000</td><td><span className="bg pay-recv">Settled</span></td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PE-2026-02</td><td>Feb 8, 2026</td><td>15</td><td>38</td><td>124</td><td style={{fontWeight: 600, color: '#22c55e'}}>6</td><td>$248,000</td><td style={{color: '#22c55e', fontWeight: 600}}>$1,500</td><td><span className="bg pay-recv">Settled</span></td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PE-2026-01</td><td>Jan 11, 2026</td><td>12</td><td>29</td><td>87</td><td style={{fontWeight: 600, color: '#22c55e'}}>4</td><td>$168,000</td><td style={{color: '#22c55e', fontWeight: 600}}>$1,000</td><td><span className="bg pay-recv">Settled</span></td></tr>
          </tbody></table></div>
        </div>
      </div>
    </div>
  );
}
