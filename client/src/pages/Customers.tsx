import { useLocation } from 'wouter';

export default function Customers() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <div>
          <div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Customer Portal</div>
          <div style={{fontSize: 13, color: '#888'}}>Invite customers to their own portal. They can track claims, view warranty info, and submit issues.</div>
        </div>
        <button className="btn btn-p btn-sm" onClick={() => navigate('invite-customer')}>+ Invite Customer</button>
      </div>
      <div className="pn">
        <div className="filter-bar">
          <input type="text" placeholder="Search customers..." />
          <select><option>All Statuses</option><option>Active</option><option>Invited</option><option>Inactive</option></select>
        </div>
        <div className="tw"><table><thead><tr><th>Customer</th><th>Email</th><th>Unit</th><th>Claims</th><th>Portal Status</th><th>Last Login</th><th>Action</th></tr></thead><tbody>
          <tr><td style={{fontWeight: 500}}>Robert Martin</td><td>robert.martin@gmail.com</td><td>2024 Jayco Jay Flight</td><td>3</td><td><span className="bg active">Active</span></td><td>Yesterday</td><td><button className="btn btn-o btn-sm" onClick={() => alert('Customer management coming soon')}>Manage</button></td></tr>
          <tr><td style={{fontWeight: 500}}>Daniel Tremblay</td><td>daniel.t@outlook.com</td><td>2024 Jayco Eagle HT</td><td>1</td><td><span className="bg active">Active</span></td><td>3 days ago</td><td><button className="btn btn-o btn-sm" onClick={() => alert('Customer management coming soon')}>Manage</button></td></tr>
          <tr><td style={{fontWeight: 500}}>Marie Bouchard</td><td>m.bouchard@gmail.com</td><td>2024 FR Rockwood</td><td>1</td><td><span className="bg active">Active</span></td><td>1 week ago</td><td><button className="btn btn-o btn-sm" onClick={() => alert('Customer management coming soon')}>Manage</button></td></tr>
          <tr><td style={{fontWeight: 500}}>Lisa Wong</td><td>lisa.w@hotmail.com</td><td>2024 Jayco Jay Feather</td><td>2</td><td><span className="bg pending">Invited</span></td><td>—</td><td><button className="btn btn-o btn-sm" onClick={() => alert('Invitation resent')}>Resend</button></td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
