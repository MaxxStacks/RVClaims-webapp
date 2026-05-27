// client/src/pages/exclusive/operator-admin/LoyaltyStats.tsx
// Route: /operator/admin/loyalty-stats
// Operator view of loyalty program adoption across all dealers

import { useLanguage } from '@/hooks/use-language';
import { apiFetch } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface GlobalStats {
  totalPrograms: number;
  activePrograms: number;
  totalPointsIssued: number;
  totalPointsRedeemed: number;
  totalRewardsRedeemed: number;
}

interface ProgramRow {
  id: string;
  dealershipId: string;
  programName: string;
  isActive: boolean;
}

export default function LoyaltyStats() {
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['loyalty-stats-operator'],
    queryFn: () => apiFetch<{ success: boolean; stats: GlobalStats; programs: ProgramRow[] }>('/api/loyalty/stats'),
    retry: false,
  });

  const stats = data?.stats;
  const programs = data?.programs ?? [];

  if (isLoading) {
    return (
      <div className="page active" style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        {t('common.loading')}
      </div>
    );
  }

  return (
    <div className="page active">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #1e293b)' }}>{t('loyalty.loyaltyStats')}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted, #6b7280)', marginTop: 4 }}>
          Customer Loyalty module adoption across all active dealerships
        </div>
      </div>

      {/* Stats grid */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 24 }}>
          {[
            { label: 'Total Programs', value: stats.totalPrograms },
            { label: 'Active Programs', value: stats.activePrograms },
            { label: t('loyalty.totalIssued'), value: Number(stats.totalPointsIssued).toLocaleString() },
            { label: t('loyalty.totalRedeemed'), value: Number(stats.totalPointsRedeemed).toLocaleString() },
            { label: t('loyalty.totalRewardsRedeemed'), value: stats.totalRewardsRedeemed },
          ].map(({ label, value }) => (
            <div key={label} className="sc">
              <div className="sc-h">
                <span className="sc-l">{label}</span>
                <div className="sc-i bl">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
              </div>
              <div className="sc-v" style={{ fontSize: 22 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Programs table */}
      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">All Loyalty Programs</span>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Program Name</th>
                <th>Dealership ID</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {programs.length === 0 ? (
                <tr>
                  <td colSpan={3} style={{ textAlign: 'center', padding: 24, color: '#888', fontSize: 13 }}>
                    No loyalty programs found. Dealers can activate the Customer Loyalty module from their portal.
                  </td>
                </tr>
              ) : programs.map(p => (
                <tr key={p.id}>
                  <td style={{ fontWeight: 600 }}>{p.programName}</td>
                  <td style={{ fontFamily: 'monospace', fontSize: 12, color: '#888' }}>{p.dealershipId.slice(0, 8)}…</td>
                  <td>
                    <span className={`bg ${p.isActive ? 'active' : 'closed'}`} style={{ fontSize: 11 }}>
                      {p.isActive ? t('loyalty.active') : t('loyalty.inactive')}
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
