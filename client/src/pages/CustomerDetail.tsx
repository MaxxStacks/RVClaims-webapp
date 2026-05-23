import { useLocation } from 'wouter';

export default function CustomerDetail() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{marginBottom: 20, display: 'flex', gap: 12, alignItems: 'center'}}>
        <input placeholder="Search clients by name, email or unit..." style={{flex: 1, padding: '10px 14px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit'}} />
        <button className="btn btn-p" style={{whiteSpace: 'nowrap'}} onClick={() => navigate('invite-customer')}>+ Invite Client</button>
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Client Accounts</span><span style={{fontSize: 12, color: '#888'}}>8 total</span></div>
        <div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Unit</th><th>Portal Status</th><th>Joined</th><th></th></tr></thead><tbody>
          <tr><td><strong>Robert Martin</strong></td><td>robert.martin@email.com</td><td>2024 Jayco Jay Flight</td><td><span className="bg active">Active</span></td><td>Mar 2, 2026</td><td><span className="cid" onClick={() => navigate('customers')}>View Portal</span></td></tr>
          <tr><td><strong>Sarah Johnson</strong></td><td>sarah.j@email.com</td><td>2023 Forest River Rockwood</td><td><span className="bg active">Active</span></td><td>Feb 14, 2026</td><td><span className="cid" onClick={() => navigate('customers')}>View Portal</span></td></tr>
          <tr><td><strong>Daniel Tremblay</strong></td><td>d.tremblay@gmail.com</td><td>2024 Keystone Montana</td><td><span className="bg pending">Pending</span></td><td>Mar 10, 2026</td><td><span className="cid" onClick={() => alert('Invitation resent')}>Resend Invite</span></td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
