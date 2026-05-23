import { useLocation } from 'wouter';

export default function AddStaff() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('staff')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">Add Staff Member</div><div className="detail-meta">Invite a team member to the portal</div></div>
      </div>
      <div className="pn">
        <div className="form-grid">
          <div className="form-group"><label>Full Name</label><input placeholder="Full name" /></div>
          <div className="form-group"><label>Email</label><input placeholder="staff@dealership.com" /></div>
          <div className="form-group"><label>Role</label><select><option>Dealer Staff (operational access)</option><option>Dealer Owner (full access)</option></select></div>
          <div className="form-group full"><label>Permissions Note</label><div style={{fontSize: 12, color: '#888', background: '#f5f6f8', padding: 12, borderRadius: 8, lineHeight: '1.5'}}>Staff can: upload photos, view claims, view units, submit service requests, communicate with operator. Staff cannot: manage billing, change settings, manage other staff, access customer portal settings.</div></div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-p" onClick={() => navigate('staff')}>Send Invitation</button>
          <button className="btn btn-o" onClick={() => navigate('staff')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
