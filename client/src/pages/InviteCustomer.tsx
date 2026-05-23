import { useLocation } from 'wouter';

export default function InviteCustomer() {
  const [, navigate] = useLocation();

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('customers')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
        <div className="detail-info"><div className="detail-title">Invite Customer</div><div className="detail-meta">Send a portal invitation to a customer</div></div>
      </div>
      <div className="pn">
        <div className="form-grid">
          <div className="form-group"><label>Customer Name</label><input placeholder="Full name" /></div>
          <div className="form-group"><label>Email</label><input placeholder="customer@email.com" /></div>
          <div className="form-group"><label>Phone</label><input placeholder="(555) 000-0000" /></div>
          <div className="form-group"><label>Unit (VIN)</label><select><option>Select unit...</option><option>1UJBJ0BN8M1TJ4K1 — 2024 Jayco Jay Flight</option><option>1UJCJ0BT4N1KQ8R2 — 2024 Jayco Eagle HT</option><option>4X4FCKB21NE021N4 — 2024 Forest River Rockwood</option></select></div>
          <div className="form-group full"><label>Delivery Method</label><div style={{display: 'flex', gap: 12, marginTop: 4}}><label style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer'}}><input type="checkbox" defaultChecked /> Email</label><label style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer'}}><input type="checkbox" /> SMS</label></div></div>
          <div className="form-group full"><label>Personal Message (optional)</label><textarea placeholder="Welcome to our customer portal! Here you can track your warranty, view service history..."></textarea></div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-p" onClick={() => navigate('customers')}>Send Invitation</button>
          <button className="btn btn-o" onClick={() => navigate('customers')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
