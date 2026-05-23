import { useLocation } from 'wouter';

export default function WorkOrders() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="al-g" style={{marginBottom: 20}}>
        <div className="al"><div className="al-i in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></div><div className="al-c"><div className="al-t">4 open work orders</div><div className="al-d">2 awaiting technician assignment</div></div></div>
      </div>
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Open Orders</div><div className="sc-v" style={{color: '#2563eb'}}>4</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>In Progress</div><div className="sc-v" style={{color: '#f59e0b'}}>2</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Completed This Week</div><div className="sc-v" style={{color: '#22c55e'}}>7</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Avg. Completion</div><div className="sc-v">2.4d</div></div>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Work Orders</span><button className="btn btn-p" style={{fontSize: 12, padding: '6px 14px'}} onClick={() => navigate('wo-new')}>+ New Work Order</button></div>
        <div className="tw"><table><thead><tr><th>WO #</th><th>Unit</th><th>Description</th><th>Assigned To</th><th>Status</th><th>Due</th></tr></thead><tbody>
          <tr><td><span className="cid" onClick={() => navigate('wo-detail')}>WO-0041</span></td><td>2024 Jayco Jay Flight</td><td>Slide-out seal replacement</td><td>Mike T.</td><td><span className="bg in-progress">In Progress</span></td><td>Apr 28</td></tr>
          <tr><td><span className="cid" onClick={() => navigate('wo-detail')}>WO-0040</span></td><td>2024 Forest River Rockwood</td><td>AC unit not cooling — warranty</td><td>Unassigned</td><td><span className="bg pending">Open</span></td><td>Apr 29</td></tr>
          <tr><td><span className="cid" onClick={() => navigate('wo-detail')}>WO-0039</span></td><td>2023 Keystone Montana</td><td>PDI inspection — pre-delivery</td><td>Jason R.</td><td><span className="bg active">Complete</span></td><td>Apr 25</td></tr>
          <tr><td><span className="cid" onClick={() => navigate('wo-detail')}>WO-0038</span></td><td>2022 Heartland Bighorn</td><td>Awning motor replacement</td><td>Carlos P.</td><td><span className="bg in-progress">In Progress</span></td><td>Apr 30</td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
