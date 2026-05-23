import { useState } from 'react';
import { useLocation } from 'wouter';

export default function PortalSettings() {
  const [, navigate] = useLocation();
  const [activeTab, setActiveTab] = useState(0);
  const tabs = ['Staff', 'Technicians', 'Partners', 'Branding', 'Domain', 'Notifications'];

  return (
    <div className="page active">
      <div style={{marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap'}}>
        {tabs.map((t, i) => (
          <button key={t} onClick={() => setActiveTab(i)} className={`tab${i === activeTab ? ' active' : ''}`}>{t}</button>
        ))}
      </div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Staff Members</span><button className="btn btn-p" style={{fontSize: 12, padding: '6px 14px'}} onClick={() => navigate('add-staff')}>+ Invite Staff</button></div>
        <div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Active</th><th></th></tr></thead><tbody>
          <tr><td><strong>Mike Smith</strong></td><td>mike@smithsrv.com</td><td><span className="bg active">Owner</span></td><td><span className="bg active">Active</span></td><td>Today</td><td></td></tr>
          <tr><td><strong>Janet Lee</strong></td><td>janet@smithsrv.com</td><td><span className="bg pending">Staff</span></td><td><span className="bg active">Active</span></td><td>2h ago</td><td><span className="cid" onClick={() => alert('Staff editing coming soon')}>Edit</span></td></tr>
          <tr><td><strong>Carlos Perez</strong></td><td>carlos@smithsrv.com</td><td><span className="bg pending">Technician</span></td><td><span className="bg active">Active</span></td><td>Yesterday</td><td><span className="cid" onClick={() => alert('Staff editing coming soon')}>Edit</span></td></tr>
        </tbody></table></div>
      </div>
    </div>
  );
}
