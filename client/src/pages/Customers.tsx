import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function Customers() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const isOperator = user?.role === 'operator_admin' || user?.role === 'operator_staff';
  const isOperatorAdmin = user?.role === 'operator_admin';
  const isDealerOwner = user?.role === 'dealer_owner';
  const canInvite = isDealerOwner || isOperatorAdmin;
  const canRevoke = isDealerOwner || isOperatorAdmin;

  const [customers, setCustomers] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [dataError, setDataError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Invite modal state
  const [showInvite, setShowInvite] = useState(false);
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteUnitId, setInviteUnitId] = useState('');
  const [inviteMessage, setInviteMessage] = useState('');
  const [units, setUnits] = useState<any[]>([]);
  const [inviteSending, setInviteSending] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadCustomers = async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const params = new URLSearchParams();
      if (!isOperator && user?.dealershipId) params.set('dealershipId', user.dealershipId);
      const data = await apiFetch<any>(`/api/customers?${params}`);
      setCustomers(Array.isArray(data) ? data : data.customers || []);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load customers');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadCustomers();
  }, [user]);

  // Load units for invite dropdown (dealer only)
  useEffect(() => {
    if (canInvite && user?.dealershipId) {
      apiFetch<any>(`/api/units?dealershipId=${user.dealershipId}`)
        .then(d => setUnits(Array.isArray(d) ? d : d.units || []))
        .catch(() => {});
    }
  }, [user, canInvite]);

  const handleInvite = async () => {
    if (!inviteEmail.trim()) { showToast('Email is required'); return; }
    if (!inviteUnitId) { showToast('Please select a unit'); return; }
    setInviteSending(true);
    try {
      await apiFetch('/api/customers/invite', {
        method: 'POST',
        body: JSON.stringify({
          email: inviteEmail.trim(),
          unitId: inviteUnitId,
          dealershipId: user?.dealershipId,
          personalMessage: inviteMessage,
        }),
      });
      showToast('Invitation sent!');
      setShowInvite(false);
      setInviteEmail('');
      setInviteUnitId('');
      setInviteMessage('');
      loadCustomers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to send invitation');
    } finally {
      setInviteSending(false);
    }
  };

  const handleRevoke = async (customerId: string, name: string) => {
    if (!window.confirm(`Revoke portal access for ${name}? They will no longer be able to log in.`)) return;
    try {
      await apiFetch(`/api/customers/${customerId}`, { method: 'DELETE' });
      showToast('Access revoked');
      loadCustomers();
    } catch (err: any) {
      showToast(err?.message || 'Failed to revoke access');
    }
  };

  const handleResendInvite = async (email: string) => {
    setInviteEmail(email);
    setShowInvite(true);
  };

  const filtered = customers.filter(c => {
    const matchSearch = !search || `${c.name} ${c.email}`.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !statusFilter || (statusFilter === 'active' ? c.isActive : !c.isActive);
    return matchSearch && matchStatus;
  });

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)'}}>
          {toastMsg}
        </div>
      )}

      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <div>
          <div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Customer Portal</div>
          <div style={{fontSize: 13, color: '#888'}}>Invite customers to their own portal. They can track claims, view warranty info, and submit issues.</div>
        </div>
        {canInvite && (
          <button className="btn btn-p btn-sm" onClick={() => setShowInvite(true)}>+ Invite Customer</button>
        )}
      </div>

      {/* Inline invite panel */}
      {showInvite && (
        <div className="pn" style={{marginBottom: 20, padding: 20}}>
          <div style={{fontWeight: 600, fontSize: 14, marginBottom: 16}}>Invite a Customer</div>
          <div className="form-grid" style={{padding: 0}}>
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
              <label>Personal Message (optional)</label>
              <textarea
                placeholder="Welcome to our customer portal! Here you can track your warranty, view service history..."
                value={inviteMessage}
                onChange={e => setInviteMessage(e.target.value)}
                style={{minHeight: 72}}
              />
            </div>
          </div>
          <div className="btn-bar" style={{marginTop: 12}}>
            <button className="btn btn-p btn-sm" onClick={handleInvite} disabled={inviteSending}>
              {inviteSending ? 'Sending...' : 'Send Invitation'}
            </button>
            <button className="btn btn-o btn-sm" onClick={() => { setShowInvite(false); setInviteEmail(''); setInviteUnitId(''); }}>
              Cancel
            </button>
          </div>
        </div>
      )}

      <div className="pn">
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search customers..."
            value={search}
            onChange={e => setSearch(e.target.value)}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="inactive">Inactive</option>
          </select>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Customer</th>
                <th>Email</th>
                <th>Linked Unit</th>
                <th>Invite Date</th>
                <th>Last Active</th>
                <th>Status</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr><td colSpan={7} style={{textAlign: 'center', padding: 24, color: '#888'}}>Loading...</td></tr>
              ) : dataError ? (
                <tr><td colSpan={7} style={{textAlign: 'center', padding: 24, color: '#e53e3e'}}>{dataError}</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan={7} style={{textAlign: 'center', padding: 24, color: '#888'}}>No customers found</td></tr>
              ) : filtered.map((c: any) => (
                <tr key={c.id}>
                  <td style={{fontWeight: 500}}>{c.name || `${c.firstName} ${c.lastName}`}</td>
                  <td>{c.email}</td>
                  <td style={{fontSize: 12, color: '#666'}}>
                    {c.unit ? `${c.unit.year} ${c.unit.manufacturer} ${c.unit.model}` : '—'}
                    {c.unit && <div style={{fontSize: 11, color: '#aaa'}}>{c.unit.vin}</div>}
                  </td>
                  <td style={{fontSize: 12}}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString('en-CA', {month: 'short', day: 'numeric', year: 'numeric'}) : '—'}</td>
                  <td style={{fontSize: 12}}>{c.lastLoginAt ? new Date(c.lastLoginAt).toLocaleDateString('en-CA', {month: 'short', day: 'numeric'}) : 'Never'}</td>
                  <td><span className={`bg ${c.isActive ? 'active' : 'inactive'}`}>{c.isActive ? 'Active' : 'Inactive'}</span></td>
                  <td style={{display: 'flex', gap: 6}}>
                    <button className="btn btn-o btn-sm" onClick={() => navigate(`${c.id}`)}>View</button>
                    {canRevoke && c.isActive && (
                      <button className="btn btn-o btn-sm" style={{color: '#e53e3e', borderColor: '#e53e3e'}} onClick={() => handleRevoke(c.id, c.name)}>Revoke</button>
                    )}
                    {!c.isActive && canInvite && (
                      <button className="btn btn-o btn-sm" onClick={() => handleResendInvite(c.email)}>Re-invite</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
