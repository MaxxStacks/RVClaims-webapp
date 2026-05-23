export default function FinancingApps() {
  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Pending Review</div><div className="sc-v" style={{ color: '#f59e0b' }}>7</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Submitted to Lender</div><div className="sc-v" style={{ color: '#2563eb' }}>4</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Approved (MTD)</div><div className="sc-v" style={{ color: '#22c55e' }}>12</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Value (MTD)</div><div className="sc-v">$847K</div></div>
      </div>
      <div className="filter-bar">
        <input type="text" placeholder="Search by name, dealer, or lender..." />
        <select><option>All Dealers</option><option>Smith&apos;s RV</option></select>
        <select><option>All Statuses</option><option>Received</option><option>Submitted</option><option>Approved</option><option>Declined</option></select>
        <select><option>All Lenders</option><option>RBC</option><option>TD Auto Finance</option><option>National Bank</option><option>iA Auto Finance</option></select>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Financing Applications</span><button className="btn btn-p" style={{ fontSize: 12, padding: '6px 14px' }}>+ New Application</button></div>
        <div className="tw">
          <table>
            <thead>
              <tr><th>App #</th><th>Customer</th><th>Dealer</th><th>Unit</th><th>Amount</th><th>Lender</th><th>Status</th><th>Submitted</th></tr>
            </thead>
            <tbody>
              <tr><td>FIN-0026</td><td>Marc Bouchard</td><td>Smith&apos;s RV</td><td>2024 Keystone Montana</td><td style={{ fontWeight: 600 }}>$68,000</td><td>RBC</td><td><span className="bg pending">Received</span></td><td>Apr 25</td></tr>
              <tr><td>FIN-0025</td><td>Stephanie Wong</td><td>Atlantic RV</td><td>2024 Jayco Eagle HT</td><td style={{ fontWeight: 600 }}>$89,000</td><td>TD Auto Finance</td><td><span className="bg in-progress">Submitted</span></td><td>Apr 22</td></tr>
              <tr><td>FIN-0023</td><td>Daniel Tremblay</td><td>Smith&apos;s RV</td><td>2024 Forest River Rockwood</td><td style={{ fontWeight: 600 }}>$42,500</td><td>RBC</td><td><span className="bg active">Approved 4.99%</span></td><td>Apr 18</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
