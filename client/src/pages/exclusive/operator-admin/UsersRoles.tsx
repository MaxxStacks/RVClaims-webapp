import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function UsersRoles() {
  const [, navigate] = useLocation();
  const [opUsers, setOpUsers] = useState<any[]>([]);
  const [usersSearch, setUsersSearch] = useState('');
  const [usersRole, setUsersRole] = useState('');
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<any>('/api/v6/users').then(d => setOpUsers(Array.isArray(d) ? d : [])).catch(err => setDataError(err?.message || 'Failed to load'));
  }, []);

  const filteredUsers = opUsers.filter(u => {
    const name = (u.name || `${u.firstName || ''} ${u.lastName || ''}`).toLowerCase();
    const matchSearch = !usersSearch || name.includes(usersSearch.toLowerCase()) || u.email?.toLowerCase().includes(usersSearch.toLowerCase());
    const matchRole = !usersRole || u.role === usersRole;
    return matchSearch && matchRole;
  });

  const handleDeactivateUser = async (id: string) => {
    try {
      await apiFetch(`/api/v6/users/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'inactive' }) });
      setOpUsers(prev => prev.map(u => u.id === id ? { ...u, status: 'inactive' } : u));
    } catch {}
  };

  return (
    <div className="page active">
      <div className="tabs">
        <div className="tab active">Operator Staff (4)</div>
        <div className="tab">Dealer Users (38)</div>
      </div>
      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <div className="filter-bar">
          <input type="text" placeholder="Search users..." value={usersSearch} onChange={e => setUsersSearch(e.target.value)} />
          <select value={usersRole} onChange={e => setUsersRole(e.target.value)}>
            <option value="">All Roles</option>
            <option value="operator_admin">Operator Admin</option>
            <option value="operator_staff">Operator Staff</option>
            <option value="dealer_owner">Dealer Owner</option>
            <option value="dealer_staff">Dealer Staff</option>
          </select>
          <div style={{ marginLeft: 'auto' }}>
            <button className="btn btn-p" style={{ padding: '8px 16px' }} onClick={() => navigate('/operator/admin/users/invite')}>+ Invite User</button>
          </div>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr><th>Name</th><th>Email</th><th>Role</th><th>Assigned Dealers</th><th>Status</th><th>Last Login</th><th>Action</th></tr>
            </thead>
            <tbody>
              {filteredUsers.length === 0
                ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 20 }}>{dataError || (opUsers.length === 0 ? 'No users found' : 'No results match your filters')}</td></tr>
                : filteredUsers.map((u: any) => {
                  const isAdmin = u.role === 'operator_admin';
                  return (
                    <tr key={u.id}>
                      <td style={{ fontWeight: 500 }}>{u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</td>
                      <td>{u.email}</td>
                      <td>
                        <span className="bg" style={{ background: isAdmin ? '#eff6ff' : '#f0fdf4', color: isAdmin ? 'var(--brand)' : '#16a34a' }}>
                          {u.role === 'operator_admin' ? 'Operator Admin' : u.role === 'operator_staff' ? 'Operator Staff' : u.role === 'dealer_owner' ? 'Dealer Owner' : 'Dealer Staff'}
                        </span>
                      </td>
                      <td>{u.dealershipName || (u.role?.startsWith('operator') ? 'All' : '—')}</td>
                      <td><span className={`bg ${u.status === 'active' ? 'active' : 'pending'}`}>{u.status || 'active'}</span></td>
                      <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-o btn-sm" style={{ marginRight: 4 }}>Edit</button>
                        {u.status !== 'inactive' && <button className="btn btn-d btn-sm" onClick={() => handleDeactivateUser(u.id)}>Deactivate</button>}
                      </td>
                    </tr>
                  );
                })
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
