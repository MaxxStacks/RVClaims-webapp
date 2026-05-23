export default function MktEscrowPayments() {
  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>In Escrow</div><div className="sc-v" style={{color: '#f59e0b'}}>$67,000</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Released (YTD)</div><div className="sc-v" style={{color: '#22c55e'}}>$241,500</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Transactions (YTD)</div><div className="sc-v">6</div></div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Escrow Transactions</span></div>
        <div className="tw"><table><thead><tr><th>ESC #</th><th>Unit</th><th>Amount</th><th>Counterparty</th><th>Status</th><th>Date</th></tr></thead><tbody>
          <tr><td>ESC-0008</td><td>2022 Keystone Montana 3855BR</td><td style={{fontWeight: 600}}>$67,000</td><td>Smith's RV (Buyer)</td><td><span className="bg pending">Held</span></td><td>Apr 28, 2026</td></tr>
          <tr><td>ESC-0007</td><td>2023 Forest River Rockwood</td><td style={{fontWeight: 600}}>$43,000</td><td>Coast RV (Seller)</td><td><span className="bg active">Released</span></td><td>Apr 20, 2026</td></tr>
          <tr><td>ESC-0006</td><td>2021 Jayco Eagle HT</td><td style={{fontWeight: 600}}>$59,500</td><td>Maple RV (Seller)</td><td><span className="bg active">Released</span></td><td>Mar 15, 2026</td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
