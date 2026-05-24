import { useState } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function InviteUser() {
  const [, navigate] = useLocation();
  const [form, setForm] = useState({
    email: '',
    role: 'operator_staff',
    firstName: '',
    lastName: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleSubmit = async () => {
    if (!form.email) {
      setError('Email address is required.');
      return;
    }
    setSaving(true);
    setError('');
    setSuccess('');
    try {
      await apiFetch('/api/v6/users/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: form.email,
          role: form.role,
          ...(form.firstName && { firstName: form.firstName }),
          ...(form.lastName && { lastName: form.lastName }),
        }),
      });
      setSuccess('Invitation sent successfully.');
      setTimeout(() => navigate('/operator/admin/users'), 1200);
    } catch (e: any) {
      setError(e?.message || 'Failed to send invitation. Please try again.');
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <button className="detail-back" onClick={() => navigate('/operator/admin/users')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg>
        </button>
        <div>
          <div style={{ fontWeight: 700, fontSize: 18 }}>Invite User</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>Send an invitation to a new operator or dealer user</div>
        </div>
      </div>

      <div className="pn" style={{ maxWidth: 540 }}>
        <div className="pn-h"><span className="pn-t">User Details</span></div>
        <div className="form-grid">
          <div className="form-group full">
            <label>Email Address <span style={{ color: '#dc2626' }}>*</span></label>
            <input type="email" placeholder="user@example.com" value={form.email} onChange={e => setForm(f => ({ ...f, email: e.target.value }))} />
          </div>
          <div className="form-group full">
            <label>Role</label>
            <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
              <option value="operator_staff">Operator Staff</option>
              <option value="operator_admin">Operator Admin</option>
              <option value="dealer_owner">Dealer Owner</option>
              <option value="dealer_staff">Dealer Staff</option>
            </select>
          </div>
          <div className="form-group">
            <label>First Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input placeholder="First name" value={form.firstName} onChange={e => setForm(f => ({ ...f, firstName: e.target.value }))} />
          </div>
          <div className="form-group">
            <label>Last Name <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(optional)</span></label>
            <input placeholder="Last name" value={form.lastName} onChange={e => setForm(f => ({ ...f, lastName: e.target.value }))} />
          </div>
        </div>
        {error && <div style={{ padding: '0 20px 12px', color: '#dc2626', fontSize: 13 }}>{error}</div>}
        {success && <div style={{ padding: '0 20px 12px', color: '#0cb22c', fontSize: 13 }}>{success}</div>}
        <div className="btn-bar">
          <button className="btn btn-p" onClick={handleSubmit} disabled={saving}>{saving ? 'Sending…' : 'Send Invitation'}</button>
          <button className="btn btn-o" style={{ marginLeft: 8 }} onClick={() => navigate('/operator/admin/users')}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
