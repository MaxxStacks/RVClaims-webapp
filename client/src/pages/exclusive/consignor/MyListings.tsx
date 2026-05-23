import { useLocation } from 'wouter';

export default function MyListings() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Listed Units</div><div className="sc-v" style={{color: '#2563eb'}}>2</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Offers</div><div className="sc-v" style={{color: '#f59e0b'}}>3</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Sold (YTD)</div><div className="sc-v" style={{color: '#22c55e'}}>1</div></div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">My Consigned Units</span><button className="btn btn-p" style={{fontSize: 12, padding: '6px 14px'}} onClick={() => navigate('mkt-post-unit')}>+ List a Unit</button></div>
        <div className="tw"><table><thead><tr><th>Unit</th><th>VIN</th><th>List Price</th><th>Days Listed</th><th>Offers</th><th>Status</th></tr></thead><tbody>
          <tr><td>2022 Jayco Eagle HT 284BHOK</td><td>1UJBJ0BN1N2TJ8801</td><td>$68,500</td><td>14</td><td><span className="cid" onClick={() => navigate('consignor-offers')}>2</span></td><td><span className="bg active">Listed</span></td></tr>
          <tr><td>2021 Forest River Salem 27DBK</td><td>4X4FCKB21ME029912</td><td>$34,900</td><td>32</td><td><span className="cid" onClick={() => navigate('consignor-offers')}>1</span></td><td><span className="bg active">Listed</span></td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
