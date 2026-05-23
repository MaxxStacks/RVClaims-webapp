import { useState } from 'react';
import { useLocation } from 'wouter';

const activeMembersData = [
  { name: "Smith's RV Centre", contact: 'Mike Smith', email: 'mike@smithsrv.ca', province: 'Ontario', verified: 'Jan 12', listings: 8, purchases: 3, renewal: 'Jan 10, 2027', plan: 'Network Marketplace + Live Auctions' },
  { name: 'Atlantic RV', contact: 'Sarah Chen', email: 'sarah@atlanticrv.ca', province: 'Nova Scotia', verified: 'Jan 18', listings: 12, purchases: 5, renewal: 'Jan 15, 2027', plan: 'Network Marketplace' },
  { name: 'Prairie Wind RV', contact: 'James Flett', email: 'james@prairiewind.ca', province: 'Manitoba', verified: 'Feb 3', listings: 6, purchases: 2, renewal: 'Feb 1, 2027', plan: 'Network Marketplace + Live Auctions' },
  { name: 'Ontario RV Depot', contact: 'Marc Leblanc', email: 'marc@onrvdepot.ca', province: 'Ontario', verified: 'Feb 20', listings: 10, purchases: 4, renewal: 'Feb 18, 2027', plan: 'Network Marketplace' },
  { name: 'West Coast Campers', contact: 'Dan Rivera', email: 'dan@westcoast.ca', province: 'BC', verified: 'Feb 15', listings: 4, purchases: 1, renewal: 'Feb 12, 2027', plan: 'Live Auctions' },
];

const pendingMembersData = [
  { name: 'Lakeside RV Sales', contact: 'Tom Nguyen', email: 'tom@lakesiderv.ca', province: 'Ontario', applied: 'Mar 14', license: 'OMVIC-2024-88431' },
  { name: 'Northern Trails', contact: 'Lisa Park', email: 'lisa@northerntrails.ca', province: 'Alberta', applied: 'Mar 15', license: 'AMVIC-2023-44210' },
  { name: 'Maritime RV', contact: 'Paul Doucet', email: 'paul@maritimerv.ca', province: 'New Brunswick', applied: 'Mar 16', license: 'NB-DLR-2024-771' },
  { name: 'Quebec Plein Air', contact: 'J-F Roy', email: 'jf@qcpleinair.ca', province: 'Quebec', applied: 'Mar 17', license: 'OPC-2024-55892' },
];

export default function MktMembers() {
  const [, navigate] = useLocation();
  const [memberTab, setMemberTab] = useState<'active'|'pending'|'expired'|'all'>('active');
  const [memberSearch, setMemberSearch] = useState('');

  const ms = memberSearch.toLowerCase();
  const filteredActiveMembers = activeMembersData.filter(m => !ms || m.name.toLowerCase().includes(ms) || m.contact.toLowerCase().includes(ms) || m.province.toLowerCase().includes(ms) || m.plan.toLowerCase().includes(ms));
  const filteredPendingMembers = pendingMembersData.filter(m => !ms || m.name.toLowerCase().includes(ms) || m.contact.toLowerCase().includes(ms) || m.province.toLowerCase().includes(ms));

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16, marginBottom: 20}}>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Total Members</div><div className="sc-v">28</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Pending</div><div className="sc-v" style={{color: '#d97706'}}>4</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active</div><div className="sc-v" style={{color: '#22c55e'}}>22</div></div>
        <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Annual Revenue</div><div className="sc-v">$13,972</div></div>
      </div>

      <div className="tabs">
        <div className={`tab ${memberTab === 'active' ? 'active' : ''}`} onClick={() => setMemberTab('active')}>Active (22)</div>
        <div className={`tab ${memberTab === 'pending' ? 'active' : ''}`} onClick={() => setMemberTab('pending')}>Pending (4)</div>
        <div className={`tab ${memberTab === 'expired' ? 'active' : ''}`} onClick={() => setMemberTab('expired')}>Expired (2)</div>
        <div className={`tab ${memberTab === 'all' ? 'active' : ''}`} onClick={() => setMemberTab('all')}>All (28)</div>
      </div>

      <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
        <div className="filter-bar">
          <input type="text" placeholder="Search dealers..." value={memberSearch} onChange={(e) => setMemberSearch(e.target.value)} />
        </div>

        <div style={{display: memberTab === 'active' || memberTab === 'all' ? 'block' : 'none'}}>
          {memberTab === 'all' && <div style={{padding: '10px 20px', background: '#f0fdf4', borderBottom: '1px solid #bbf7d0', fontSize: 12, fontWeight: 600, color: '#166534'}}>Active Members</div>}
          <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Province</th><th>Plan</th><th>Verified</th><th>Listings</th><th>Purchases</th><th>Renewal</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {filteredActiveMembers.length === 0 ? (
              <tr><td colSpan={10} style={{textAlign:'center',color:'#888',padding:16}}>No results</td></tr>
            ) : filteredActiveMembers.map(m => (
              <tr key={m.name}>
                <td style={{fontWeight: 500}}><span className="cid" onClick={() => navigate('mkt-member-detail')}>{m.name}</span></td>
                <td>{m.contact}<br /><span style={{fontSize: 11, color: '#888'}}>{m.email}</span></td>
                <td>{m.province}</td>
                <td style={{fontSize: 11, color: '#555'}}>{m.plan}</td>
                <td>{m.verified}</td><td>{m.listings}</td><td>{m.purchases}</td><td>{m.renewal}</td>
                <td><span className="bg active">Active</span></td>
                <td><button className="btn btn-o btn-sm" onClick={() => navigate('mkt-member-detail')}>Manage</button></td>
              </tr>
            ))}
          </tbody></table></div>
        </div>

        <div style={{display: memberTab === 'pending' || memberTab === 'all' ? 'block' : 'none'}}>
          {memberTab === 'all' && <div style={{padding: '10px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: 12, fontWeight: 600, color: '#92400e'}}>Pending Verification</div>}
          <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Province</th><th>Applied</th><th>License #</th><th>Status</th><th>Action</th></tr></thead><tbody>
            {filteredPendingMembers.length === 0 ? (
              <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:16}}>No results</td></tr>
            ) : filteredPendingMembers.map(m => (
              <tr key={m.name}>
                <td style={{fontWeight: 500, color: '#d97706'}}>{m.name} ★</td>
                <td>{m.contact}<br /><span style={{fontSize: 11, color: '#888'}}>{m.email}</span></td>
                <td>{m.province}</td><td>{m.applied}</td><td>{m.license}</td>
                <td><span className="bg pending">Pending</span></td>
                <td><button className="btn btn-s btn-sm" onClick={() => navigate('mkt-member-detail')}>Verify</button></td>
              </tr>
            ))}
          </tbody></table></div>
        </div>

        <div style={{display: memberTab === 'expired' || memberTab === 'all' ? 'block' : 'none'}}>
          {memberTab === 'all' && <div style={{padding: '10px 20px', background: '#fef2f2', borderBottom: '1px solid #fecaca', fontSize: 12, fontWeight: 600, color: '#991b1b'}}>Expired</div>}
          <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Province</th><th>Expired</th><th>Was Active Since</th><th>Status</th><th>Action</th></tr></thead><tbody>
            <tr><td style={{fontWeight: 500}}>BC Camper World</td><td>Kim Lee<br /><span style={{fontSize: 11, color: '#888'}}>kim@bccamper.ca</span></td><td>BC</td><td>Feb 28, 2026</td><td>Mar 2025</td><td><span className="bg denied">Expired</span></td><td><button className="btn btn-o btn-sm">Send Renewal</button></td></tr>
            <tr><td style={{fontWeight: 500}}>Valley RV</td><td>Steve Morris<br /><span style={{fontSize: 11, color: '#888'}}>steve@valleyrv.ca</span></td><td>Ontario</td><td>Mar 5, 2026</td><td>Mar 2025</td><td><span className="bg denied">Expired</span></td><td><button className="btn btn-o btn-sm">Send Renewal</button></td></tr>
          </tbody></table></div>
        </div>
      </div>
    </div>
  );
}
