import { useState } from 'react';
import { useLocation } from 'wouter';

export default function Showcase() {
  const [, navigate] = useLocation();
  const [showcaseAccess, setShowcaseAccess] = useState<'none'|'active'>('none');

  return (
    <div className="page active">
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
              <div>✓ Your units shown to verified public buyers across North America</div>
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
            <div>
              <div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Public Showcase</div>
              <div style={{fontSize: 13, color: '#888'}}>Submit units for the monthly public auction. Next event: <strong>April 12, 2026</strong> (submission deadline: Apr 8)</div>
            </div>
            <button className="btn btn-p btn-sm" onClick={() => navigate('showcase-submit')}>+ Submit Unit for April Auction</button>
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
  );
}
