import { useLocation } from 'wouter';

export default function MktMyBids() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Bids</div><div className="sc-v" style={{color: '#2563eb'}}>4</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Winning</div><div className="sc-v" style={{color: '#22c55e'}}>2</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Outbid</div><div className="sc-v" style={{color: '#ef4444'}}>2</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Won (YTD)</div><div className="sc-v">6</div></div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">All Bids</span><span className="pn-a" onClick={() => navigate('mkt-live-auctions')}>Browse Auctions</span></div>
        <div className="tw"><table><thead><tr><th>Unit</th><th>Bid Type</th><th>My Bid</th><th>High Bid</th><th>Status</th><th>Deadline</th></tr></thead><tbody>
          <tr><td>2023 Forest River Rockwood 2882WS</td><td>Auction</td><td>$41,000</td><td>$43,000</td><td><span className="bg denied">Outbid</span></td><td>Apr 27</td></tr>
          <tr><td>2022 Keystone Montana 3855BR</td><td>Auction</td><td>$67,000</td><td>$67,000</td><td><span className="bg active">Winning</span></td><td>Apr 28</td></tr>
          <tr><td>2024 Heartland Bighorn 3995FL</td><td>Offer</td><td>$88,000</td><td>—</td><td><span className="bg pending">Pending</span></td><td>Apr 30</td></tr>
          <tr><td>2023 Jayco Eagle HT 284BHOK</td><td>Auction</td><td>$72,000</td><td>$74,500</td><td><span className="bg denied">Outbid</span></td><td>Apr 26</td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
