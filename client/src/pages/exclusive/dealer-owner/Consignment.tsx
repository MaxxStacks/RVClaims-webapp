import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const STATUS_COLORS: Record<string, string> = {
  pending_signature: 'pending',
  active: 'pay-recv',
  expired: 'draft',
  terminated: 'denied',
  sold: 'submitted',
};

export default function Consignment() {
  const [agreements, setAgreements] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>('/api/consignment/agreements')
      .then(d => setAgreements(d.agreements || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const active = agreements.filter(a => a.status === 'active').length;
  const pending = agreements.filter(a => a.status === 'pending_signature').length;
  const sold = agreements.filter(a => a.status === 'sold').length;

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Active Consignments</div><div className="sc-v" style={{ color: '#2563eb' }}>{active}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Pending Signature</div><div className="sc-v" style={{ color: '#f59e0b' }}>{pending}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Units Sold</div><div className="sc-v" style={{ color: '#22c55e' }}>{sold}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Agreements</div><div className="sc-v">{agreements.length}</div></div>
      </div>

      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">Consigned Units</span>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr><th>Agreement #</th><th>Unit</th><th>Split %</th><th>Duration</th><th>Min List Price</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading
                ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 20 }}>Loading…</td></tr>
                : agreements.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No consignment agreements yet. Contact DS360 to get started.</td></tr>
                  : agreements.map((a: any) => (
                    <tr key={a.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{a.agreementNumber}</td>
                      <td style={{ fontSize: 12, color: '#666' }}>{a.unitId?.slice(0, 8)}…</td>
                      <td>{a.splitPct ? `${a.splitPct}%` : '—'}</td>
                      <td>{a.durationDays ? `${a.durationDays} days` : '—'}</td>
                      <td>{a.minListPrice ? `$${Number(a.minListPrice).toLocaleString()}` : '—'}</td>
                      <td>
                        <span className={`bg ${STATUS_COLORS[a.status] || 'draft'}`} style={{ textTransform: 'capitalize' }}>
                          {(a.status || '—').replace(/_/g, ' ')}
                        </span>
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
