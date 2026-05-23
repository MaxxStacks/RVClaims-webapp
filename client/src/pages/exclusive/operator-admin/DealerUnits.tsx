import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function DealerUnits() {
  const [units, setUnits] = useState<any[]>([]);

  useEffect(() => {
    const dealerId = sessionStorage.getItem('selectedDealerId');
    if (!dealerId) return;
    apiFetch<any>(`/api/units?dealerId=${dealerId}`)
      .then(d => setUnits(Array.isArray(d) ? d : d?.units || []))
      .catch(() => {});
  }, []);

  const rows = units.length > 0 ? units : [
    { vin: '1UJBJ0BN8M1TJ4K1', stockNumber: 'STK-0891', model: '2024 Jayco Jay Flight', claims: 3, dafCompleted: true, pdiCompleted: true, status: 'delivered' },
  ];

  return (
    <div className="page active">
      <div className="tw">
        <table>
          <thead>
            <tr><th>VIN</th><th>Stock #</th><th>Model</th><th>Claims</th><th>DAF</th><th>PDI</th><th>Status</th></tr>
          </thead>
          <tbody>
            {rows.map((u: any) => (
              <tr key={u.vin || u.id}>
                <td><span className="cid">{u.vin}</span></td>
                <td>{u.stockNumber || '—'}</td>
                <td>{u.model || [u.year, u.manufacturer, u.modelName].filter(Boolean).join(' ') || '—'}</td>
                <td>{u.claims ?? '—'}</td>
                <td><span className={`bg ${u.dafCompleted ? 'authorized' : 'pending'}`}>{u.dafCompleted ? 'Done' : 'Pending'}</span></td>
                <td><span className={`bg ${u.pdiCompleted ? 'authorized' : 'pending'}`}>{u.pdiCompleted ? 'Done' : 'Pending'}</span></td>
                <td><span className="bg active">{u.status || 'On Lot'}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
