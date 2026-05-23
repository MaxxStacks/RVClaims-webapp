import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function DealerClaims() {
  const [claims, setClaims] = useState<any[]>([]);

  useEffect(() => {
    const dealerId = sessionStorage.getItem('selectedDealerId');
    if (!dealerId) return;
    apiFetch<any>(`/api/claims?dealerId=${dealerId}`)
      .then(d => setClaims(Array.isArray(d) ? d : d?.claims || []))
      .catch(() => {});
  }, []);

  const rows = claims.length > 0 ? claims : [
    { id: 'CLM-0248', vin: '...4K1', type: 'Warranty', status: 'submitted', amount: '$1,240', updated: '2h ago' },
    { id: 'CLM-0243', vin: '...7P3', type: 'DAF', status: 'pay-recv', amount: '$4,200', updated: '3 days' },
    { id: 'CLM-0237', vin: '...8R2', type: 'Warranty', status: 'completed', amount: '$920', updated: '1 week' },
  ];

  return (
    <div className="page active">
      <div className="tw">
        <table>
          <thead>
            <tr><th>Claim #</th><th>VIN</th><th>Type</th><th>Status</th><th>Amount</th><th>Updated</th></tr>
          </thead>
          <tbody>
            {rows.map((c: any) => (
              <tr key={c.id}>
                <td><span className="cid">{c.id}</span></td>
                <td><span className="vin">{c.vin || c.unitVin || '—'}</span></td>
                <td>{c.type || c.claimType || '—'}</td>
                <td><span className={`bg ${c.status}`}>{c.status}</span></td>
                <td>{c.amount || c.totalAmount || '—'}</td>
                <td>{c.updated || c.updatedAt || '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
