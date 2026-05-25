import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending_signature: 'pending',
  active: 'pay-recv',
  expired: 'draft',
  terminated: 'denied',
  sold: 'submitted',
};

export default function ConsignmentOversight() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  useEffect(() => {
    apiFetch<any>('/api/consignment/agreements')
      .then(d => setAgreements(d.agreements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const updateStatus = async (id: string, status: string) => {
    setUpdatingId(id);
    try {
      await apiFetch(`/api/consignment/agreements/${id}`, { method: 'PATCH', body: JSON.stringify({ status }) });
      setAgreements(prev => prev.map(a => a.id === id ? { ...a, status } : a));
    } catch {} finally { setUpdatingId(null); }
  };

  const sl = search.toLowerCase();
  const filtered = agreements.filter(a => {
    if (sl && !a.agreementNumber?.toLowerCase().includes(sl) && !a.dealershipId?.toLowerCase().includes(sl)) return false;
    if (statusFilter && a.status !== statusFilter) return false;
    return true;
  });

  const counts = {
    total: agreements.length,
    active: agreements.filter(a => a.status === 'active').length,
    pending: agreements.filter(a => a.status === 'pending_signature').length,
    sold: agreements.filter(a => a.status === 'sold').length,
  };

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Agreements</div><div className="sc-v">{counts.total}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Active</div><div className="sc-v" style={{ color: '#22c55e' }}>{counts.active}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Pending Signature</div><div className="sc-v" style={{ color: '#f59e0b' }}>{counts.pending}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Sold</div><div className="sc-v" style={{ color: '#3b82f6' }}>{counts.sold}</div></div>
      </div>

      <div className="pn">
        <div className="pn-h"><span className="pn-t">Consignment Agreements</span></div>
        <div className="filter-bar">
          <input type="text" placeholder="Search agreement #…" value={search} onChange={e => setSearch(e.target.value)} />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="pending_signature">Pending Signature</option>
            <option value="active">Active</option>
            <option value="expired">Expired</option>
            <option value="terminated">Terminated</option>
            <option value="sold">Sold</option>
          </select>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr><th>Agreement #</th><th>Unit ID</th><th>Split %</th><th>Duration</th><th>Status</th><th>Created</th><th>Action</th></tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 20 }}>Loading…</td></tr>
                : filtered.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No agreements found</td></tr>
                  : filtered.map((a: any) => (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.agreementNumber}</td>
                      <td style={{ fontSize: 12, color: '#666' }}>{a.unitId?.slice(0, 8)}…</td>
                      <td>{a.splitPct ? `${a.splitPct}%` : '—'}</td>
                      <td>{a.durationDays ? `${a.durationDays} days` : '—'}</td>
                      <td>
                        <span className={`bg ${STATUS_COLORS[a.status] || 'draft'}`} style={{ textTransform: 'capitalize' }}>
                          {(a.status || '—').replace(/_/g, ' ')}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#999' }}>{a.createdAt ? new Date(a.createdAt).toLocaleDateString() : '—'}</td>
                      <td>
                        <select
                          value={a.status}
                          disabled={updatingId === a.id}
                          onChange={e => updateStatus(a.id, e.target.value)}
                          style={{ fontSize: 12, padding: '3px 6px', border: '1px solid #e0e0e0', borderRadius: 5, fontFamily: 'inherit', cursor: 'pointer' }}
                        >
                          <option value="pending_signature">Pending Signature</option>
                          <option value="active">Active</option>
                          <option value="expired">Expired</option>
                          <option value="terminated">Terminated</option>
                          <option value="sold">Sold</option>
                        </select>
                      </td>
                    </tr>
                  ))
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
