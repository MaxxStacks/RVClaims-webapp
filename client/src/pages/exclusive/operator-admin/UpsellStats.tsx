// client/src/pages/exclusive/operator-admin/UpsellStats.tsx
// Smart Upsell aggregate stats for operator admin
// Route: /operator/admin/upsell-stats

import { useState } from 'react';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { formatCurrency } from '@/lib/locale';
import { useToast } from '@/hooks/use-toast';

interface AggregateStats {
  totalOpportunities: number;
  overallConversionRate: number;
  totalAcceptedValue: number;
  moduleAdoption: number;
  topDealers: {
    dealershipId: string;
    sent: number;
    accepted: number;
    conversionRate: number;
  }[];
  triggerStats: {
    trigger: string;
    accepted: number;
    sent: number;
    conversionRate: number;
  }[];
}

function triggerLabel(type: string) {
  const labels: Record<string, string> = {
    warranty_expiry: 'Warranty Expiry',
    unit_age:        'Unit Age',
    service_gap:     'Service Gap',
    seasonal:        'Seasonal',
    fi_gap:          'F&I Gap',
    high_mileage:    'High Mileage',
    custom:          'Custom',
  };
  return labels[type] ?? type;
}

function StatCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '18px 22px' }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted, #888)', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text, #111)', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted, #888)', marginTop: 5 }}>{sub}</div>}
    </div>
  );
}

export default function UpsellStats() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const [scanning, setScanning] = useState(false);

  const { data, isLoading, refetch } = useQuery({
    queryKey: ['upsell-aggregate-stats'],
    queryFn: () => apiFetch<{ success: boolean; stats: AggregateStats }>('/api/upsell/aggregate-stats'),
    staleTime: 60 * 1000,
  });
  const stats = data?.stats;

  const handleScanAll = async () => {
    setScanning(true);
    try {
      const result = await apiFetch<any>('/api/upsell/scan', { method: 'POST' });
      toast({ title: t('upsell.scanComplete'), description: `${result.opportunitiesCreated} ${t('upsell.opportunitiesCreated')} across ${result.dealersScanned} dealers` });
      refetch();
    } catch {
      toast({ title: 'Scan failed', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  return (
    <div style={{ maxWidth: 1000, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 26, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #111)', margin: 0 }}>{t('upsell.title')} — Platform Stats</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted, #888)', marginTop: 3 }}>{t('upsell.subtitle')}</div>
        </div>
        <button
          onClick={handleScanAll}
          disabled={scanning}
          style={{ background: '#0cb22c', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: scanning ? 'not-allowed' : 'pointer', opacity: scanning ? 0.7 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          {scanning ? t('upsell.scanningAll') : t('upsell.scan')}
        </button>
      </div>

      {isLoading && (
        <div style={{ textAlign: 'center', padding: 40, color: 'var(--text-muted, #888)' }}>{t('common.loading')}</div>
      )}

      {!isLoading && stats && (
        <>
          {/* Summary cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 32 }}>
            <StatCard label={t('upsell.totalOpportunities')} value={stats.totalOpportunities} />
            <StatCard
              label={t('upsell.conversionRate')}
              value={`${stats.overallConversionRate}%`}
              sub="Accepted / Sent"
            />
            <StatCard
              label="Total Revenue (Accepted)"
              value={formatCurrency(stats.totalAcceptedValue, 'CAD')}
            />
            <StatCard
              label={t('upsell.moduleAdoption')}
              value={stats.moduleAdoption}
              sub="Dealers with Smart Upsell active"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
            {/* Top dealers */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 600, color: 'var(--text, #111)' }}>
                {t('upsell.topDealers')}
              </div>
              {stats.topDealers.length === 0 ? (
                <div style={{ padding: '24px 18px', color: 'var(--text-muted, #888)', fontSize: 13 }}>No data yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary, #f9fafb)' }}>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)' }}>Dealer ID</th>
                      <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)' }}>Sent</th>
                      <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)' }}>Accepted</th>
                      <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)' }}>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.topDealers.map((d, i) => (
                      <tr key={d.dealershipId} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '9px 14px', fontFamily: 'monospace', fontSize: 11, color: 'var(--text, #111)' }}>
                          {d.dealershipId.slice(0, 8)}…
                        </td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', color: 'var(--text, #111)' }}>{d.sent}</td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>{d.accepted}</td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: d.conversionRate >= 50 ? '#16a34a' : d.conversionRate >= 25 ? '#d97706' : '#6b7280' }}>
                          {d.conversionRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>

            {/* Trigger stats */}
            <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
              <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border)', fontSize: 14, fontWeight: 600, color: 'var(--text, #111)' }}>
                {t('upsell.topTriggers')}
              </div>
              {stats.triggerStats.length === 0 ? (
                <div style={{ padding: '24px 18px', color: 'var(--text-muted, #888)', fontSize: 13 }}>No data yet</div>
              ) : (
                <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
                  <thead>
                    <tr style={{ background: 'var(--bg-secondary, #f9fafb)' }}>
                      <th style={{ padding: '8px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)' }}>Trigger</th>
                      <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)' }}>Sent</th>
                      <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)' }}>Accepted</th>
                      <th style={{ padding: '8px 14px', textAlign: 'right', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)' }}>Rate</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stats.triggerStats.map(trig => (
                      <tr key={trig.trigger} style={{ borderTop: '1px solid var(--border)' }}>
                        <td style={{ padding: '9px 14px', color: 'var(--text, #111)' }}>{triggerLabel(trig.trigger)}</td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', color: 'var(--text, #111)' }}>{trig.sent}</td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', color: '#16a34a', fontWeight: 600 }}>{trig.accepted}</td>
                        <td style={{ padding: '9px 14px', textAlign: 'right', fontWeight: 700, color: trig.conversionRate >= 50 ? '#16a34a' : trig.conversionRate >= 25 ? '#d97706' : '#6b7280' }}>
                          {trig.conversionRate}%
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
