import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function DealerStaffView() {
  const [location] = useLocation();
  const params = useParams<{ dealerId: string }>();
  const { user } = useAuth();

  const isOperator = user?.role === 'operator_admin' || user?.role === 'operator_staff';
  const isOperatorAdmin = user?.role === 'operator_admin';

  // Derive dealerId
  const dealerId = params.dealerId || (() => {
    const segs = location.split('/');
    const idx = segs.indexOf('dealers');
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  const [staff, setStaff] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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
      const d = await apiFetch<any>(`/api/dealerships/${dealerId}/staff`);
      setStaff(Array.isArray(d) ? d : d?.staff || []);
    } catch {
      setStaff([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadStaff(); }, [dealerId]);

  const handleRemove = async (userId: string) => {
    if (!dealerId || !isOperatorAdmin) return;
    try {
      await apiFetch(`/api/dealerships/${dealerId}/staff/${userId}`, { method: 'DELETE' });
      setStaff(s => s.filter(x => x.id !== userId));
      showToast('Staff member removed');
    } catch {
      showToast('Failed to remove staff');
    }
  };

  const handleRoleChange = async (userId: string, role: string) => {
    if (!dealerId || !isOperatorAdmin) return;
    try {
      await apiFetch(`/api/dealerships/${dealerId}/staff/${userId}/role`, {
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

      <div className="tw">
        <table>
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Role</th>
              <th>Status</th>
              <th>Last Login</th>
              {isOperatorAdmin && <th>Actions</th>}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 20 }}>Loading…</td></tr>
            ) : staff.length === 0 ? (
              <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No staff found</td></tr>
            ) : staff.map((s: any) => {
              const isOwner = s.role === 'dealer_owner';
              return (
                <tr key={s.id}>
                  <td style={{ fontWeight: 500 }}>{[s.firstName, s.lastName].filter(Boolean).join(' ') || s.name || '—'}</td>
                  <td>{s.email}</td>
                  <td>
                    {isOperatorAdmin ? (
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
                  {isOperatorAdmin && (
                    <td>
                      <button
                        className="btn btn-o btn-sm"
                        style={{ color: '#dc2626', borderColor: '#fca5a5' }}
                        onClick={() => handleRemove(s.id)}
                      >
                        Remove
                      </button>
                    </td>
                  )}
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
