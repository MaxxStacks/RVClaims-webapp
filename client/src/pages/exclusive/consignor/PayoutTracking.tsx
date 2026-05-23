export default function PayoutTracking() {
  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Lifetime Earnings</div><div className="sc-v" style={{color: '#22c55e'}}>$42,750</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Pending Payout</div><div className="sc-v" style={{color: '#f59e0b'}}>$0</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Next Payout Date</div><div className="sc-v">May 15</div></div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Payout History</span></div>
        <div className="tw"><table><thead><tr><th>Date</th><th>Unit</th><th>Sale Price</th><th>Dealer Fee</th><th>Your Payout</th><th>Method</th><th>Status</th></tr></thead><tbody>
          <tr><td>Mar 2, 2026</td><td>2020 Keystone Cougar 29BHS</td><td>$45,000</td><td>$2,250 (5%)</td><td style={{color: '#22c55e', fontWeight: 600}}>$42,750</td><td>Interac e-Transfer</td><td><span className="bg active">Paid</span></td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
