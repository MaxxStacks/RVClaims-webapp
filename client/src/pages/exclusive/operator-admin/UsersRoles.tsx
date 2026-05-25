import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch } from '@/lib/api';

const ROLE_LABELS: Record<string, string> = {
  operator_admin: 'Operator Admin',
  operator_staff: 'Operator Staff',
  dealer_owner: 'Dealer Owner',
  dealer_staff: 'Dealer Staff',
  technician: 'Technician',
  service_manager: 'Service Manager',
  shop_manager: 'Shop Manager',
  parts_dept: 'Parts Dept',
  client: 'Client',
};

export default function UsersRoles() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const isOpAdmin = user?.role === 'operator_admin';

  const [allUsers, setAllUsers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'operator' | 'dealer'>('operator');
  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState('');

  useEffect(() => {
    apiFetch<any>('/api/users')
      .then(d => setAllUsers(Array.isArray(d.users) ? d.users : []))
      .catch(err => setDataError(err?.message || 'Failed to load users'))
      .finally(() => setLoading(false));
  }, []);

  const opUsers = allUsers.filter(u => ['operator_admin', 'operator_staff'].includes(u.role));
  const dealerUsers = allUsers.filter(u => !['operator_admin', 'operator_staff'].includes(u.role));

  const sourceList = activeTab === 'operator' ? opUsers : dealerUsers;
  const filtered = sourceList.filter(u => {
    const name = `${u.firstName || ''} ${u.lastName || ''}`.trim().toLowerCase();
    const matchSearch = !search || name.includes(search.toLowerCase()) || u.email?.toLowerCase().includes(search.toLowerCase());
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  const handleDeactivate = async (id: string) => {
    try {
      await apiFetch(`/api/users/${id}`, { method: 'DELETE' });
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: false } : u));
    } catch {}
  };

  const handleReactivate = async (id: string) => {
    try {
      await apiFetch(`/api/users/${id}`, { method: 'PUT', body: JSON.stringify({ isActive: true }) });
      setAllUsers(prev => prev.map(u => u.id === id ? { ...u, isActive: true } : u));
    } catch {}
  };

  const getRoleBadge = (role: string) => {
    const isOp = role.startsWith('operator');
    return (
      <span className="bg" style={{ background: isOp ? '#eff6ff' : '#f0fdf4', color: isOp ? 'var(--brand)' : '#16a34a' }}>
        {ROLE_LABELS[role] || role}
      </span>
    );
  };

  const colCount = isOpAdmin ? (activeTab === 'dealer' ? 7 : 6) : (activeTab === 'dealer' ? 6 : 5);

  return (
    <div className="page active">
      <div className="tabs">
        <div className={`tab ${activeTab === 'operator' ? 'active' : ''}`} onClick={() => { setActiveTab('operator'); setRoleFilter(''); }}>
          Operator Staff ({opUsers.length})
        </div>
        <div className={`tab ${activeTab === 'dealer' ? 'active' : ''}`} onClick={() => { setActiveTab('dealer'); setRoleFilter(''); }}>
          Dealer Users ({dealerUsers.length})
        </div>
      </div>
      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <div className="filter-bar">
          <input type="text" placeholder="Search users…" value={search} onChange={e => setSearch(e.target.value)} />
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)}>
            <option value="">All Roles</option>
            {activeTab === 'operator' ? (
              <>
                <option value="operator_admin">Operator Admin</option>
                <option value="operator_staff">Operator Staff</option>
              </>
            ) : (
              <>
                <option value="dealer_owner">Dealer Owner</option>
                <option value="dealer_staff">Dealer Staff</option>
                <option value="technician">Technician</option>
                <option value="service_manager">Service Manager</option>
                <option value="shop_manager">Shop Manager</option>
                <option value="parts_dept">Parts Dept</option>
                <option value="client">Client</option>
              </>
            )}
          </select>
          {isOpAdmin && (
            <div style={{ marginLeft: 'auto' }}>
              <button className="btn btn-p" style={{ padding: '8px 16px' }} onClick={() => navigate('/operator/admin/users/invite')}>
                + Invite User
              </button>
            </div>
          )}
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Role</th>
                {activeTab === 'dealer' && <th>Dealership ID</th>}
                <th>Status</th>
                <th>Last Login</th>
                {isOpAdmin && <th>Actions</th>}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={colCount} style={{ textAlign: 'center', color: '#888', padding: 20 }}>Loading…</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={colCount} style={{ textAlign: 'center', color: '#888', padding: 20 }}>
                  {dataError || (allUsers.length === 0 ? 'No users found' : 'No results match your filters')}
                </td></tr>
              ) : filtered.map((u: any) => (
                <tr key={u.id}>
                  <td style={{ fontWeight: 500 }}>{`${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</td>
                  <td>{u.email}</td>
                  <td>{getRoleBadge(u.role)}</td>
                  {activeTab === 'dealer' && <td style={{ color: '#888', fontSize: 12 }}>{u.dealershipId ? u.dealershipId.slice(0, 8) + '…' : '—'}</td>}
                  <td>
                    <span className={`bg ${u.isActive !== false ? 'active' : 'pending'}`}>
                      {u.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—'}</td>
                  {isOpAdmin && (
                    <td style={{ whiteSpace: 'nowrap' }}>
                      {u.isActive !== false ? (
                        <button className="btn btn-d btn-sm" onClick={() => handleDeactivate(u.id)}>Deactivate</button>
                      ) : (
                        <button className="btn btn-o btn-sm" onClick={() => handleReactivate(u.id)}>Reactivate</button>
                      )}
                    </td>
                  )}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
