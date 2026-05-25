import { useState } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function AddStaff() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const isDealerOwner = user?.role === 'dealer_owner';

  const dealerId = user?.dealershipId || (() => {
    const segs = location.split('/').filter(Boolean);
    return segs[0] || null;
  })();

  const [email, setEmail] = useState('');
  const [role, setRole] = useState('dealer_staff');
  const [sending, setSending] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Navigate back to staff page
  const goBack = () => {
    const segs = location.split('/').filter(Boolean);
    // segs[0] = dealerId, segs[1] = 'owner'
    navigate(`/${segs[0]}/owner/staff`);
  };

  if (!isDealerOwner) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#dc2626', fontWeight: 600, fontSize: 16 }}>
        Access Denied
      </div>
    );
  }

  const handleSend = async () => {
    if (!email.trim() || !dealerId) {
      showToast('Email address is required');
      return;
    }
    setSending(true);
    try {
      await apiFetch(`/api/v6/dealerships/${dealerId}/staff`, {
        method: 'POST',
        body: JSON.stringify({ email: email.trim(), role }),
      });
      showToast(`Invitation sent to ${email}`);
      setTimeout(() => goBack(), 1200);
    } catch (err: any) {
      showToast(err?.message || 'Failed to send invitation');
      setSending(false);
    }
  };

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={goBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">Add Staff Member</div>
          <div className="detail-meta">Invite a team member to the portal</div>
        </div>
      </div>

      <div className="pn">
        <div className="form-grid">
          <div className="form-group">
            <label>Email Address *</label>
            <input
              type="email"
              value={email}
              onChange={e => setEmail(e.target.value)}
              placeholder="staff@dealership.com"
            />
          </div>
          <div className="form-group">
            <label>Role</label>
            <select value={role} onChange={e => setRole(e.target.value)}>
              <option value="dealer_staff">Dealer Staff — operational access</option>
              <option value="dealer_owner">Dealer Owner — full access</option>
            </select>
          </div>
          <div className="form-group full">
            <label>Permissions</label>
            <div style={{ fontSize: 12, color: '#888', background: '#f5f6f8', padding: 12, borderRadius: 8, lineHeight: '1.6' }}>
              {role === 'dealer_staff' ? (
                <>
                  <strong>Staff can:</strong> upload photos, view and create claims, view units, submit service requests, communicate with operator.<br />
                  <strong>Staff cannot:</strong> manage billing, change settings, manage other staff, access customer portal settings.
                </>
              ) : (
                <>
                  <strong>Owner can:</strong> everything Staff can do, plus manage billing, settings, staff management, customer portal configuration, and all administrative functions.
                </>
              )}
            </div>
          </div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-p" onClick={handleSend} disabled={sending || !email.trim()}>
            {sending ? 'Sending…' : 'Send Invitation'}
          </button>
          <button className="btn btn-o" onClick={goBack}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
