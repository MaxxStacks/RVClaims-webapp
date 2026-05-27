// client/src/pages/exclusive/supplier/SupplierDealers.tsx
// Route: /supplier/dealers

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';

export default function SupplierDealers() {
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['supplierMeDealers'],
    queryFn: () => apiFetch<any>('/api/suppliers/me/dealers'),
    retry: false,
  });

  const connections: any[] = data?.connections ?? [];

  return (
    <div style={{ padding: '28px 32px', maxWidth: 1000, fontFamily: 'Inter, system-ui, sans-serif' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: '#0f172a', margin: 0, marginBottom: 4 }}>
          {t('supplier.dealers') || 'Connected Dealers'}
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: 0 }}>
          Dealers who have placed orders with you
        </p>
      </div>

      <div style={{ background: '#fff', border: '1px solid #e2e8f0', borderRadius: 12, overflow: 'hidden' }}>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                {['Dealership ID', 'Connected Date', 'Status'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontWeight: 600, color: '#64748b' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {isLoading ? (
                <tr>
                  <td colSpan={3} style={{ padding: '28px 14px', textAlign: 'center', color: '#94a3b8' }}>
                    {t('common.loading') || 'Loading…'}
                  </td>
                </tr>
              ) : connections.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ padding: '28px 14px', textAlign: 'center', color: '#94a3b8' }}>
                    No connected dealers yet. Once dealers place orders, they will appear here.
                  </td>
                </tr>
              ) : connections.map((conn: any) => (
                <tr key={conn.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                  <td style={{ padding: '11px 14px', color: '#1e293b', fontFamily: 'monospace', fontSize: 12 }}>{conn.dealershipId}</td>
                  <td style={{ padding: '11px 14px', color: '#64748b' }}>
                    {new Date(conn.connectedAt).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{
                      fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 8,
                      background: conn.status === 'active' ? '#dcfce7' : '#fee2e2',
                      color: conn.status === 'active' ? '#16a34a' : '#dc2626',
                    }}>
                      {conn.status.charAt(0).toUpperCase() + conn.status.slice(1)}
                    </span>
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
