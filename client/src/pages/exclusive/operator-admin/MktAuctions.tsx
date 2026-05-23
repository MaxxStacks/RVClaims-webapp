import { useState } from 'react';
import { useLocation } from 'wouter';

export default function MktAuctions() {
  const [, navigate] = useLocation();
  const [auctionTab, setAuctionTab] = useState<'live'|'completed'|'cancelled'>('live');

  return (
    <div className="page active">
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
        <div style={{display: auctionTab === 'live' ? 'block' : 'none'}}>
          <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Seller</th><th>Starting</th><th>Current Bid</th><th>Bids</th><th>Watchers</th><th>Ends</th><th>Status</th><th>Action</th></tr></thead><tbody>
            <tr style={{background: '#fef2f2'}}><td style={{fontWeight: 500, color: '#dc2626'}}><span className="cid" onClick={() => navigate('mkt-auction-detail')}>AUC-0034</span></td><td>2023 Heartland Bighorn 3960LS</td><td style={{fontSize: 12, color: '#888'}}>Prairie Wind</td><td>$55,000</td><td style={{fontWeight: 700, color: '#dc2626'}}>$62,500</td><td style={{fontWeight: 600}}>14</td><td>8</td><td style={{fontWeight: 600, color: '#dc2626'}}>23 min</td><td><span className="bg" style={{background: '#fef2f2', color: '#dc2626'}}>🔴 LIVE</span></td><td><button className="btn btn-p btn-sm" onClick={() => navigate('mkt-auction-detail')}>Monitor</button></td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0035</td><td>2024 Forest River Salem 30KQBSS</td><td style={{fontSize: 12, color: '#888'}}>Atlantic RV</td><td>$32,000</td><td>—</td><td>—</td><td>12</td><td>Mar 20, 2 PM</td><td><span className="bg pending">Scheduled</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0036</td><td>2023 Jayco Eagle 321RSTS</td><td style={{fontSize: 12, color: '#888'}}>Smith's RV</td><td>$48,000</td><td>—</td><td>—</td><td>6</td><td>Mar 22, 10 AM</td><td><span className="bg pending">Scheduled</span></td><td><button className="btn btn-o btn-sm">Manage</button></td></tr>
          </tbody></table></div>
        </div>
        <div style={{display: auctionTab === 'completed' ? 'block' : 'none'}}>
          <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Seller</th><th>Winning Bid</th><th>Winner</th><th>Bids</th><th>Commission</th><th>Settled</th></tr></thead><tbody>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0033</td><td>2023 Coachmen Catalina 263BHSCK</td><td style={{fontSize: 12, color: '#888'}}>Ontario RV</td><td style={{fontWeight: 600}}>$34,200</td><td>Maritime RV</td><td>9</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 14</td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0031</td><td>2024 Keystone Passport 229RK</td><td style={{fontSize: 12, color: '#888'}}>West Coast</td><td style={{fontWeight: 600}}>$28,800</td><td>Prairie Wind</td><td>7</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 10</td></tr>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0029</td><td>2023 Forest River Cherokee 264DBH</td><td style={{fontSize: 12, color: '#888'}}>Atlantic RV</td><td style={{fontWeight: 600}}>$31,500</td><td>Smith's RV</td><td>11</td><td style={{color: '#22c55e', fontWeight: 600}}>$250</td><td>Mar 6</td></tr>
          </tbody></table></div>
        </div>
        <div style={{display: auctionTab === 'cancelled' ? 'block' : 'none'}}>
          <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Seller</th><th>Reason</th><th>Cancelled</th></tr></thead><tbody>
            <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>AUC-0030</td><td>2023 Grand Design Reflection 315RLTS</td><td style={{fontSize: 12, color: '#888'}}>Northern Trails</td><td style={{fontSize: 12, color: '#888'}}>Seller withdrew — sold privately</td><td>Mar 7</td></tr>
          </tbody></table></div>
        </div>
      </div>
    </div>
  );
}
