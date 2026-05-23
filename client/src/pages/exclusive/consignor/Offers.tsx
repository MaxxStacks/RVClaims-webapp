export default function Offers() {
  const offers = [
    {unit: '2022 Jayco Eagle HT 284BHOK', list: 68500, offer: 65000, buyer: 'Dealer — Maple RV Centre', exp: 'Apr 30'},
    {unit: '2022 Jayco Eagle HT 284BHOK', list: 68500, offer: 66500, buyer: 'Public Buyer', exp: 'May 1'},
    {unit: '2021 Forest River Salem 27DBK', list: 34900, offer: 33000, buyer: 'Dealer — Coast RV', exp: 'Apr 28'},
  ];

  return (
    <div className="page active">
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Offers Received</span><span style={{fontSize: 12, color: '#888'}}>3 active offers</span></div>
        <div style={{padding: 16, display: 'flex', flexDirection: 'column', gap: 12}}>
          {offers.map((o, i) => (
            <div key={i} style={{border: '1px solid #e8e8e8', borderRadius: 10, padding: 16, display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 16}}>
              <div style={{flex: 1}}>
                <div style={{fontWeight: 600, fontSize: 14, marginBottom: 6}}>{o.unit}</div>
                <div style={{fontSize: 13, color: '#555'}}>Offer: <strong style={{color: '#22c55e'}}>${o.offer.toLocaleString()}</strong> &nbsp;·&nbsp; List: ${o.list.toLocaleString()} &nbsp;·&nbsp; {o.buyer}</div>
                <div style={{fontSize: 12, color: '#888', marginTop: 4}}>Expires: {o.exp}</div>
              </div>
              <div style={{display: 'flex', gap: 8, flexShrink: 0}}>
                <button className="btn btn-p" style={{fontSize: 12}} onClick={() => alert('Offer accepted — escrow process initiated')}>Accept</button>
                <button className="btn" style={{fontSize: 12}} onClick={() => alert('Counter offer sent')}>Counter</button>
                <button className="btn" style={{fontSize: 12}} onClick={() => alert('Offer declined')}>Decline</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
