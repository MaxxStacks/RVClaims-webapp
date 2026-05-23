export default function TechFlowOversight() {
  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Open Work Orders</div><div className="sc-v" style={{ color: '#2563eb' }}>28</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>In Progress</div><div className="sc-v" style={{ color: '#f59e0b' }}>11</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Completed (Week)</div><div className="sc-v" style={{ color: '#22c55e' }}>43</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Active Dealers Using</div><div className="sc-v">8</div></div>
      </div>
      <div className="filter-bar">
        <input type="text" placeholder="Search work orders..." />
        <select><option>All Dealers</option><option>Smith&apos;s RV</option><option>Atlantic RV</option></select>
        <select><option>All Statuses</option><option>Open</option><option>In Progress</option><option>Complete</option></select>
      </div>
      <div className="pn">
        <div className="tw">
          <table>
            <thead>
              <tr><th>WO #</th><th>Dealer</th><th>Unit</th><th>Description</th><th>Technician</th><th>Status</th><th>Due</th></tr>
            </thead>
            <tbody>
              <tr><td>WO-0041</td><td>Smith&apos;s RV</td><td>2024 Jayco Jay Flight</td><td>Slide-out seal replacement</td><td>Mike T.</td><td><span className="bg in-progress">In Progress</span></td><td>Apr 28</td></tr>
              <tr><td>WO-0040</td><td>Smith&apos;s RV</td><td>2024 Forest River Rockwood</td><td>AC unit not cooling</td><td>Unassigned</td><td><span className="bg pending">Open</span></td><td>Apr 29</td></tr>
              <tr><td>WO-0039</td><td>Atlantic RV</td><td>2023 Keystone Montana</td><td>PDI inspection</td><td>Jason R.</td><td><span className="bg active">Complete</span></td><td>Apr 25</td></tr>
              <tr><td>WO-0038</td><td>Prairie Wind RV</td><td>2022 Heartland Bighorn</td><td>Awning motor replacement</td><td>Carlos P.</td><td><span className="bg in-progress">In Progress</span></td><td>Apr 30</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
