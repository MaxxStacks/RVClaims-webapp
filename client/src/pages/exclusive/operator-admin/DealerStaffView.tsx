import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function DealerStaffView() {
  const [staff, setStaff] = useState<any[]>([]);

  useEffect(() => {
    const dealerId = sessionStorage.getItem('selectedDealerId');
    if (!dealerId) return;
    apiFetch<any>(`/api/dealers/${dealerId}/staff`)
      .then(d => setStaff(Array.isArray(d) ? d : d?.staff || []))
      .catch(() => {});
  }, []);

  const rows = staff.length > 0 ? staff : [
    { name: 'Mike Smith', email: 'mike@smithsrv.ca', role: 'Owner', status: 'active', lastLogin: '4h ago' },
    { name: 'Lisa Patel', email: 'lisa@smithsrv.ca', role: 'Staff', status: 'active', lastLogin: 'Yesterday' },
  ];

  return (
    <div className="page active">
      <div className="tw">
        <table>
          <thead>
            <tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th></tr>
          </thead>
          <tbody>
            {rows.map((s: any, i: number) => (
              <tr key={s.id || i}>
                <td style={{ fontWeight: 500 }}>{s.name}</td>
                <td>{s.email}</td>
                <td>
                  <span className="bg" style={{ background: s.role === 'Owner' ? '#eff6ff' : '#f0fdf4', color: s.role === 'Owner' ? 'var(--brand)' : '#16a34a' }}>
                    {s.role}
                  </span>
                </td>
                <td><span className={`bg ${s.status}`}>{s.status}</span></td>
                <td>{s.lastLogin || s.lastLoginAt || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
