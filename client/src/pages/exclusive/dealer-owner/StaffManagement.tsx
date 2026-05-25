import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function StaffManagement() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const isDealerOwner = user?.role === 'dealer_owner';
  const isDealerStaff = user?.role === 'dealer_staff';
  const canManage = isDealerOwner;

  // Derive dealerId from URL path: /:dealerId/owner/staff or /:dealerId/staff/staff
  const dealerId = user?.dealershipId || (() => {
    const segs = location.split('/').filter(Boolean);
    return segs[0] || null;
  })();

  const [staff, setStaff] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  // Invite state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('dealer_staff');
  const [inviteSending, setInviteSending] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadStaff = async () => {
    if (!dealerId) return;
    setLoading(true);
    try {
      const d = await apiFetch<any>(`/api/v6/dealerships/${dealerId}/staff`);
      setStaff(Array.isArray(d) ? d : d?.staff || []);
      setDataError(null);
    } catch (err: any) {
      setDataError(err?.message || 'Unable to load staff');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, [dealerId]);

  const handleInvite = async () => {
    if (!inviteEmail || !dealerId) return;
    setInviteSending(true);
    try {
      await apiFetch(`/api/v6/dealerships/${dealerId}/staff`, {
        method: 'POST',
        body: JSON.stringify({ email: inviteEmail, role: inviteRole }),
      });
      showToast(`Invitation sent to ${inviteEmail}`);
      setInviteEmail('');
      setShowInvite(false);
      loadStaff();
    } catch (err: any) {
      showToast(err?.message || 'Failed to send invitation');
    } finally {
      setInviteSending(false);
    }
  };

  const handleRemove = async (userId: string) => {
    if (!dealerId) return;
    try {
      await apiFetch(`/api/v6/dealerships/${dealerId}/staff/${userId}`, { method: 'DELETE' });
      setStaff(s => s.filter(x => x.id !== userId));
      showToast('Staff member removed');
    } catch {
      showToast('Failed to remove staff member');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    if (!dealerId) return;
    try {
      await apiFetch(`/api/v6/dealerships/${dealerId}/staff/${userId}/role`, {
        method: 'PATCH',
        body: JSON.stringify({ role }),
      });
      setStaff(s => s.map(x => x.id === userId ? { ...x, role } : x));
      showToast('Role updated');
    } catch {
      showToast('Failed to update role');
    }
  };

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
          {toastMsg}
        </div>
      )}

      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
        <div style={{ fontSize: 13, color: '#666' }}>
          Manage your dealership staff access. Staff can upload photos and track claims but cannot manage billing or settings.
        </div>
        {canManage && (
          <button className="btn btn-p btn-sm" onClick={() => setShowInvite(v => !v)}>
            + Invite Staff
          </button>
        )}
      </div>

      {/* Invite form */}
      {showInvite && canManage && (
        <div className="pn" style={{ marginBottom: 16, padding: '16px 20px' }}>
          <div style={{ display: 'flex', gap: 12, alignItems: 'flex-end', flexWrap: 'wrap' }}>
            <div className="form-group" style={{ margin: 0, minWidth: 220 }}>
              <label style={{ fontSize: 12 }}>Email Address</label>
              <input
                value={inviteEmail}
                onChange={e => setInviteEmail(e.target.value)}
                placeholder="staff@dealership.com"
                type="email"
              />
            </div>
            <div className="form-group" style={{ margin: 0 }}>
              <label style={{ fontSize: 12 }}>Role</label>
              <select value={inviteRole} onChange={e => setInviteRole(e.target.value)}>
                <option value="dealer_staff">Dealer Staff — operational access</option>
                <option value="dealer_owner">Dealer Owner — full access</option>
              </select>
            </div>
            <button className="btn btn-p btn-sm" onClick={handleInvite} disabled={inviteSending || !inviteEmail}>
              {inviteSending ? 'Sending…' : 'Send Invitation'}
            </button>
            <button className="btn btn-o btn-sm" onClick={() => setShowInvite(false)}>Cancel</button>
          </div>
          <div style={{ fontSize: 12, color: '#888', background: '#f5f6f8', padding: 12, borderRadius: 8, lineHeight: '1.5', marginTop: 12 }}>
            Staff can: upload photos, view claims, view units, submit service requests, communicate with operator.<br />
            Staff cannot: manage billing, change settings, manage other staff, access customer portal settings.
          </div>
        </div>
      )}

      <div className="pn">
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Last Login</th>
                {canManage && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 20 }}>Loading…</td></tr>
              ) : dataError ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#dc2626', padding: 20 }}>{dataError}</td></tr>
              ) : staff.length === 0 ? (
                <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No staff members yet. Invite your first team member.</td></tr>
              ) : staff.map((s: any) => {
                const isOwner = s.role === 'dealer_owner';
                return (
                  <tr key={s.id}>
                    <td style={{ fontWeight: 500 }}>
                      {[s.firstName, s.lastName].filter(Boolean).join(' ') || s.name || '—'}
                    </td>
                    <td>{s.email}</td>
                    <td>
                      {canManage && s.id !== user?.id ? (
                        <select
                          value={s.role}
                          onChange={e => handleRoleChange(s.id, e.target.value)}
                          style={{ fontSize: 12, padding: '4px 8px', borderRadius: 4, border: '1px solid #e0e0e0' }}
                        >
                          <option value="dealer_staff">Staff</option>
                          <option value="dealer_owner">Owner</option>
                        </select>
                      ) : (
                        <span className="bg" style={{ background: isOwner ? '#eff6ff' : '#f0fdf4', color: isOwner ? 'var(--brand)' : '#16a34a' }}>
                          {isOwner ? 'Owner' : 'Staff'}
                        </span>
                      )}
                    </td>
                    <td><span className={`bg ${s.isActive !== false ? 'active' : 'pending'}`}>{s.isActive !== false ? 'Active' : 'Inactive'}</span></td>
                    <td>{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—'}</td>
                    {canManage && (
                      <td>
                        {s.id !== user?.id ? (
                          <button
                            className="btn btn-o btn-sm"
                            style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                            onClick={() => handleRemove(s.id)}
                          >
                            Remove
                          </button>
                        ) : (
                          <span style={{ fontSize: 12, color: '#888' }}>You</span>
                        )}
                      </td>
                    )}
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
