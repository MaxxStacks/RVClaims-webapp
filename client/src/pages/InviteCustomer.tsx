import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function InviteCustomer() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUnitId, setInviteUnitId] = useState('');
  const [personalMessage, setPersonalMessage] = useState('');
  const [units, setUnits] = useState<any[]>([]);
  const [sending, setSending] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  useEffect(() => {
    if (user?.dealershipId) {
      apiFetch<any>(`/api/v6/units?dealershipId=${user.dealershipId}`)
        .then(d => setUnits(Array.isArray(d) ? d : d.units || []))
        .catch(() => {});
    }
  }, [user]);

  const handleSubmit = async () => {
    if (!inviteEmail.trim()) { showToast('Email is required'); return; }
    if (!inviteUnitId) { showToast('Please select a unit'); return; }
    setSending(true);
    try {
      await apiFetch('/api/customers/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail.trim(),
          unitId: inviteUnitId,
          dealershipId: user?.dealershipId,
          personalMessage: personalMessage || undefined,
        }),
      });
      showToast('Invitation sent!');
      setTimeout(() => navigate('customers'), 1000);
    } catch (err: any) {
      showToast(err?.message || 'Failed to send invitation');
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)'}}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('customers')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">Invite Customer</div>
          <div className="detail-meta">Send a portal invitation to a customer linked to a unit</div>
        </div>
      </div>

      <div className="pn">
        <div className="form-grid">
          <div className="form-group">
            <label>Customer Email</label>
            <input
              type="email"
              placeholder="customer@email.com"
              value={inviteEmail}
              onChange={e => setInviteEmail(e.target.value)}
            />
          </div>
          <div className="form-group">
            <label>Linked Unit (required)</label>
            <select
              value={inviteUnitId}
              onChange={e => setInviteUnitId(e.target.value)}
              style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}
            >
              <option value="">Select unit...</option>
              {units.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.vin} — {u.year} {u.manufacturer} {u.model}
                </option>
              ))}
            </select>
          </div>
          <div className="form-group full">
            <label>Delivery Method</label>
            <div style={{display: 'flex', gap: 12, marginTop: 4}}>
              <label style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer'}}>
                <input type="checkbox" defaultChecked readOnly /> Email
              </label>
            </div>
          </div>
          <div className="form-group full">
            <label>Personal Message (optional)</label>
            <textarea
              placeholder="Welcome to our customer portal! Here you can track your warranty, view service history..."
              value={personalMessage}
              onChange={e => setPersonalMessage(e.target.value)}
            />
          </div>
        </div>
        <div className="btn-bar">
          <button className="btn btn-p" onClick={handleSubmit} disabled={sending}>
            {sending ? 'Sending...' : 'Send Invitation'}
          </button>
          <button className="btn btn-o" onClick={() => navigate('customers')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
