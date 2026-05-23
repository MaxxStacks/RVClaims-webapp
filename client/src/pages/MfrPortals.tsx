import { useLocation } from 'wouter';

const manufacturers = [
  {name: 'Jayco', url: 'https://www.jayco.com/dealer', claims: 32, color: '#d32f2f'},
  {name: 'Forest River', url: 'https://www.forestriverinc.com/dealer', claims: 18, color: '#1565c0'},
  {name: 'Heartland RV', url: 'https://www.heartlandrvs.com/dealer', claims: 11, color: '#2e7d32'},
  {name: 'Keystone RV', url: 'https://www.keystonerv.com/dealer', claims: 9, color: '#6a1b9a'},
  {name: 'Columbia NW', url: 'https://www.columbianw.com', claims: 4, color: '#ef6c00'},
  {name: 'Midwest Automotive', url: 'https://www.midwestauto.com', claims: 2, color: '#00838f'},
];

export default function MfrPortals() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{fontSize:13,color:'#666',marginBottom:20}}>Quick-launch manufacturer claim portals. Open in a new tab to submit or check claim status directly with the manufacturer.</div>
      <div style={{display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16,marginBottom:24}}>
        {manufacturers.map(m => (
          <div key={m.name} className="pn" style={{padding:20}}>
            <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:12}}>
              <div style={{fontWeight:700,fontSize:16,color:m.color}}>{m.name}</div>
              <span className="bg in-progress" style={{fontSize:11}}>{m.claims} claims</span>
            </div>
            <div style={{display:'flex',gap:8}}>
              <button className="btn btn-p" style={{fontSize:12}} onClick={() => window.open(m.url, '_blank')}>Open Portal</button>
              <button className="btn" style={{fontSize:12}} onClick={() => navigate('claims')}>View Claims</button>
            </div>
          </div>
        ))}
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Recent Manufacturer Submissions</span></div>
        <div className="tw"><table><thead><tr><th>Claim #</th><th>Manufacturer</th><th>Submitted Via Portal</th><th>Mfr Ref #</th><th>Status</th></tr></thead><tbody>
          <tr><td><span className="cid" onClick={() => navigate('claim-detail')}>CLM-0248</span></td><td>Jayco</td><td>Apr 24, 2026</td><td>JAY-2026-18831</td><td><span className="bg in-progress">Under Review</span></td></tr>
          <tr><td><span className="cid" onClick={() => navigate('claim-detail')}>CLM-0246</span></td><td>Forest River</td><td>Apr 22, 2026</td><td>FR-26-004412</td><td><span className="bg active">Approved</span></td></tr>
          <tr><td><span className="cid" onClick={() => navigate('claim-detail')}>CLM-0244</span></td><td>Heartland</td><td>Apr 20, 2026</td><td>HTL-20260419</td><td><span className="bg denied">Denied — Missing Photos</span></td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
