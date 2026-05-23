import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

export default function StaffManagement() {
  const [, navigate] = useLocation();
  const [staff, setStaff] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    apiFetch('/api/dealer/staff').then(setStaff).catch(() => setDataError('Unable to load staff'));
  }, []);

  return (
    <div className="page active">
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
        <div style={{fontSize: 13, color: '#666'}}>Manage your dealership staff access. Staff can upload photos and track claims but cannot manage billing or settings.</div>
        <button className="btn btn-p btn-sm" onClick={() => navigate('add-staff')}>+ Add Staff</button>
      </div>
      <div className="pn">
        <div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Action</th></tr></thead><tbody>
          {staff.length === 0 ? (
            <tr><td colSpan={6} style={{textAlign: 'center', color: '#888', padding: 20}}>{dataError ? dataError : 'No staff found'}</td></tr>
          ) : staff.map((s: any) => {
            const isOwner = s.role === 'dealer_owner';
            return (
              <tr key={s.id}>
                <td style={{fontWeight: 500}}>{s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || '—'}</td>
                <td>{s.email}</td>
                <td><span className="bg" style={{background: isOwner ? '#eff6ff' : '#f0fdf4', color: isOwner ? 'var(--brand)' : '#16a34a'}}>{isOwner ? 'Owner' : 'Staff'}</span></td>
                <td><span className={`bg ${s.status === 'active' ? 'active' : 'pending'}`}>{s.status || 'active'}</span></td>
                <td>{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString('en-CA', {month: 'short', day: 'numeric'}) : '—'}</td>
                <td><button className="btn btn-o btn-sm" onClick={() => alert('Staff editing coming soon')}>Edit</button> <button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => alert('Staff management coming soon')}>Remove</button></td>
              </tr>
            );
          })}
        </tbody></table></div>
      </div>
    </div>
  );
}
