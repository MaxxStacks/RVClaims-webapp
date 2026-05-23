export default function FinancingPartners() {
  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Active Lenders</div><div className="sc-v" style={{ color: '#22c55e' }}>6</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Avg. Approval Rate</div><div className="sc-v" style={{ color: '#2563eb' }}>84%</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Funded (YTD)</div><div className="sc-v">$4.2M</div></div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Financing Lenders</span><button className="btn btn-p" style={{ fontSize: 12, padding: '6px 14px' }}>+ Add Lender</button></div>
        <div className="tw">
          <table>
            <thead>
              <tr><th>Lender</th><th>Type</th><th>Rate Range</th><th>Max Term</th><th>Approval Rate</th><th>Status</th><th></th></tr>
            </thead>
            <tbody>
              <tr><td><strong>RBC Royal Bank</strong></td><td>Bank</td><td>4.99% – 8.99%</td><td>144 months</td><td>88%</td><td><span className="bg active">Active</span></td><td><span className="cid">Edit</span></td></tr>
              <tr><td><strong>TD Auto Finance</strong></td><td>Captive</td><td>5.49% – 9.49%</td><td>120 months</td><td>82%</td><td><span className="bg active">Active</span></td><td><span className="cid">Edit</span></td></tr>
              <tr><td><strong>National Bank</strong></td><td>Bank</td><td>5.99% – 10.99%</td><td>120 months</td><td>79%</td><td><span className="bg active">Active</span></td><td><span className="cid">Edit</span></td></tr>
              <tr><td><strong>iA Auto Finance</strong></td><td>Specialty</td><td>6.49% – 14.99%</td><td>84 months</td><td>76%</td><td><span className="bg active">Active</span></td><td><span className="cid">Edit</span></td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
