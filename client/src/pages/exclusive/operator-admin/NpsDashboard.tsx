// client/src/pages/exclusive/operator-admin/NpsDashboard.tsx
// Route: /operator/admin/reviews
// Platform-wide NPS and review adoption dashboard for operator admin

import { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';

interface ReviewStats {
  avgRating: number | null;
  nps: number | null;
  responseRate: number;
  totalSent: number;
  pending: number;
  thisMonth: number;
  byStar: Record<string, number>;
}

interface CustomerReview {
  id: string;
  dealershipId: string;
  rating: number | null;
  status: string;
  respondedAt: string | null;
  createdAt: string;
}

interface ReviewConfig {
  dealershipId: string;
  isActive: boolean;
}

// Per-dealer stats assembled client-side from the full reviews list
interface DealerRow {
  dealershipId: string;
  name: string;
  totalReviews: number;
  avgRating: number | null;
  nps: number | null;
  responseRate: number;
  hasModule: boolean;
}

function NpsColor(nps: number | null): string {
  if (nps === null) return '#94a3b8';
  if (nps < 0) return '#ef4444';
  if (nps <= 50) return '#f59e0b';
  return '#0cb22c';
}

function calcNps(reviews: { rating: number | null }[]): number | null {
  const rated = reviews.filter(r => r.rating !== null);
  if (rated.length === 0) return null;
  const total = rated.length;
  const promoters = rated.filter(r => r.rating === 5).length;
  const detractors = rated.filter(r => r.rating !== null && r.rating <= 3).length;
  return Math.round(((promoters / total) - (detractors / total)) * 100);
}

function StarDisplay({ rating }: { rating: number | null }) {
  if (rating === null) return <span style={{ color: '#94a3b8', fontSize: 12 }}>—</span>;
  return (
    <span>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#d1d5db', fontSize: 13 }}>★</span>
      ))}
    </span>
  );
}

export default function NpsDashboard() {
  const { t } = useLanguage();
  const [sortBy, setSortBy] = useState<'nps' | 'avgRating' | 'total'>('nps');

  const { data: platformStats } = useQuery<ReviewStats>({
    queryKey: ['review-stats-platform'],
    queryFn: () => apiFetch('/api/reviews/stats'),
  });

  const { data: allReviews = [] } = useQuery<CustomerReview[]>({
    queryKey: ['reviews-all'],
    queryFn: () => apiFetch('/api/reviews'),
  });

  const { data: dealershipsData } = useQuery<{ dealerships: { id: string; name: string }[] }>({
    queryKey: ['dealerships-list'],
    queryFn: () => apiFetch('/api/dealerships?limit=500'),
  });

  // Build per-dealer rows
  const dealerMap = new Map<string, { id: string; name: string }>();
  (dealershipsData?.dealerships ?? []).forEach(d => dealerMap.set(d.id, d));

  // Group reviews by dealership
  const byDealer = new Map<string, CustomerReview[]>();
  for (const r of allReviews) {
    if (!byDealer.has(r.dealershipId)) byDealer.set(r.dealershipId, []);
    byDealer.get(r.dealershipId)!.push(r);
  }

  const rows: DealerRow[] = [];
  byDealer.forEach((dReviews, did) => {
    const dealerInfo = dealerMap.get(did);
    const rated = dReviews.filter(r => r.rating !== null);
    const avgRating = rated.length > 0
      ? Math.round((rated.reduce((s, r) => s + (r.rating ?? 0), 0) / rated.length) * 10) / 10
      : null;
    const responded = dReviews.filter(r => r.respondedAt !== null).length;
    rows.push({
      dealershipId: did,
      name: dealerInfo?.name ?? did.slice(0, 8) + '…',
      totalReviews: dReviews.length,
      avgRating,
      nps: calcNps(dReviews),
      responseRate: dReviews.length > 0 ? Math.round((responded / dReviews.length) * 100) : 0,
      hasModule: true, // All rows in byDealer have at least 1 review
    });
  });

  // Sort
  rows.sort((a, b) => {
    if (sortBy === 'nps') return (b.nps ?? -999) - (a.nps ?? -999);
    if (sortBy === 'avgRating') return (b.avgRating ?? 0) - (a.avgRating ?? 0);
    return b.totalReviews - a.totalReviews;
  });

  const moduleAdoption = rows.length;

  const card = (label: string, value: React.ReactNode, color?: string, sub?: string) => (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)', flex: 1, minWidth: 140,
    }}>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || '#033280' }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
    </div>
  );

  return (
    <div style={{ padding: '32px 28px', fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 1100 }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 24, fontWeight: 700, color: '#033280', margin: 0 }}>
          {t('review.npsReviews')}
        </h1>
        <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
          Platform-wide review performance and NPS tracking
        </p>
      </div>

      {/* Platform summary */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' as const, marginBottom: 32 }}>
        {card(
          'Platform Avg Rating',
          platformStats?.avgRating !== null && platformStats?.avgRating !== undefined
            ? `${platformStats.avgRating.toFixed(1)} / 5.0`
            : '—',
          '#033280',
          'All dealers combined'
        )}
        {card(
          'Platform NPS',
          platformStats?.nps !== null && platformStats?.nps !== undefined ? platformStats.nps : '—',
          NpsColor(platformStats?.nps ?? null),
          'Net Promoter Score'
        )}
        {card(
          'Total Reviews',
          platformStats?.totalSent ?? 0,
          undefined,
          `${platformStats?.thisMonth ?? 0} this month`
        )}
        {card(
          'Avg Response Rate',
          platformStats?.responseRate !== undefined ? `${platformStats.responseRate}%` : '—',
          undefined,
          'Customers who responded'
        )}
        {card(
          'Module Adoption',
          moduleAdoption,
          '#0cb22c',
          'Dealers with reviews'
        )}
      </div>

      {/* Per-dealer table */}
      <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)', overflow: 'hidden' }}>
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '16px 20px', borderBottom: '1px solid #f1f5f9',
        }}>
          <span style={{ fontWeight: 700, fontSize: 15, color: '#033280' }}>Per-Dealer Breakdown</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 12, color: '#64748b' }}>Sort by</span>
            {(['nps', 'avgRating', 'total'] as const).map(s => (
              <button
                key={s}
                onClick={() => setSortBy(s)}
                style={{
                  padding: '4px 12px', borderRadius: 6, fontSize: 12, fontWeight: 600,
                  cursor: 'pointer', fontFamily: 'inherit',
                  background: sortBy === s ? '#033280' : 'none',
                  color: sortBy === s ? '#fff' : '#64748b',
                  border: sortBy === s ? 'none' : '1px solid #e2e8f0',
                }}
              >
                {s === 'nps' ? 'NPS' : s === 'avgRating' ? 'Rating' : 'Volume'}
              </button>
            ))}
          </div>
        </div>

        {rows.length === 0 ? (
          <div style={{ padding: 40, textAlign: 'center' as const, color: '#94a3b8', fontSize: 14 }}>
            No review data yet across the platform.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse' as const }}>
            <thead>
              <tr style={{ background: '#f8fafc' }}>
                {['Dealer', 'Avg Rating', 'NPS', 'Total Reviews', 'Response Rate'].map(h => (
                  <th key={h} style={{ padding: '10px 16px', textAlign: 'left' as const, fontSize: 12, fontWeight: 600, color: '#64748b', borderBottom: '1px solid #f1f5f9' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row, i) => (
                <tr key={row.dealershipId} style={{ borderBottom: i < rows.length - 1 ? '1px solid #f8fafc' : 'none' }}>
                  <td style={{ padding: '12px 16px', fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                    {row.name}
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                      <StarDisplay rating={row.avgRating ? Math.round(row.avgRating) : null} />
                      {row.avgRating !== null && (
                        <span style={{ fontSize: 12, color: '#64748b' }}>{row.avgRating.toFixed(1)}</span>
                      )}
                    </div>
                  </td>
                  <td style={{ padding: '12px 16px' }}>
                    <span style={{ fontSize: 16, fontWeight: 700, color: NpsColor(row.nps) }}>
                      {row.nps !== null ? row.nps : '—'}
                    </span>
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#475569' }}>
                    {row.totalReviews}
                  </td>
                  <td style={{ padding: '12px 16px', fontSize: 14, color: '#475569' }}>
                    {row.responseRate}%
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  );
}
