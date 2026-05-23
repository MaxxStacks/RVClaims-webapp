import { useLocation } from 'wouter';

export default function Consignment() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Consignments</div><div className="sc-v" style={{color: '#2563eb'}}>3</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Pending Photos</div><div className="sc-v" style={{color: '#f59e0b'}}>1</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Units Sold (YTD)</div><div className="sc-v" style={{color: '#22c55e'}}>8</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Pending Payouts</div><div className="sc-v">$12,400</div></div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Consigned Units</span><button className="btn btn-p" style={{fontSize: 12, padding: '6px 14px'}} onClick={() => navigate('mkt-post-unit')}>+ Add Consignment</button></div>
        <div className="tw"><table><thead><tr><th>Unit</th><th>Consignor</th><th>List Price</th><th>Days Listed</th><th>Offers</th><th>Status</th><th></th></tr></thead><tbody>
          <tr><td>2022 Jayco Eagle HT 284BHOK</td><td>Paul Gagnon</td><td>$68,500</td><td>14</td><td>2</td><td><span className="bg active">Listed</span></td><td><span className="cid" onClick={() => alert('Consignment detail coming soon')}>Manage</span></td></tr>
          <tr><td>2021 Forest River Salem 27DBK</td><td>Marie-Claude B.</td><td>$34,900</td><td>32</td><td>0</td><td><span className="bg active">Listed</span></td><td><span className="cid" onClick={() => alert('Consignment detail coming soon')}>Manage</span></td></tr>
          <tr><td>2023 Heartland Bighorn 3995FL</td><td>Tom Wilson</td><td>$89,000</td><td>5</td><td>1</td><td><span className="bg pending">Pending Photos</span></td><td><span className="cid" onClick={() => alert('Consignment detail coming soon')}>Manage</span></td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
