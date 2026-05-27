// client/src/pages/exclusive/operator-admin/RemindersOverview.tsx
// Operator admin view of all dealer reminder configurations and stats

import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';

interface ServiceReminder {
  id: string;
  dealershipId: string;
  name: string;
  templateType: string;
  isActive: boolean;
  lastSentAt?: string;
  sendCount: number;
  createdAt: string;
}

interface ReminderStats {
  activeReminders: number;
  sendsThisMonth: number;
  deliveryRate: number;
  optOutRate: number;
}

const TEMPLATE_LABELS: Record<string, string> = {
  winterization: 'Winterization',
  de_winterization: 'De-Winterization',
  spring_prep: 'Spring Prep',
  warranty_expiry: 'Warranty Expiry',
  annual_service: 'Annual Service',
  custom: 'Custom',
};

export default function RemindersOverview() {
  const { t } = useLanguage();

  const { data: remindersData, isLoading } = useQuery({
    queryKey: ['allReminders'],
    queryFn: () => apiFetch<{ success: boolean; reminders: ServiceReminder[] }>('/api/reminders'),
    staleTime: 60_000,
  });

  const { data: statsData } = useQuery({
    queryKey: ['allReminderStats'],
    queryFn: () => apiFetch<{ success: boolean; stats: ReminderStats }>('/api/reminders/stats'),
    staleTime: 60_000,
  });

  const reminders = remindersData?.reminders ?? [];
  const stats = statsData?.stats;

  // Group by dealership
  const byDealer: Record<string, { reminders: ServiceReminder[]; active: number; totalSends: number }> = {};
  reminders.forEach(r => {
    if (!byDealer[r.dealershipId]) byDealer[r.dealershipId] = { reminders: [], active: 0, totalSends: 0 };
    byDealer[r.dealershipId].reminders.push(r);
    if (r.isActive) byDealer[r.dealershipId].active++;
    byDealer[r.dealershipId].totalSends += r.sendCount;
  });

  return (
    <div style={{ padding: '24px', maxWidth: 1100, margin: '0 auto' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #111)', margin: 0 }}>
          {t('reminder.title')} — Platform Overview
        </h1>
        <p style={{ fontSize: 13, color: '#888', marginTop: 4 }}>
          All dealer reminder configurations and delivery performance.
        </p>
      </div>

      {/* Platform stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 14, marginBottom: 28 }}>
        {[
          { label: 'Total Reminders', value: reminders.length, color: '#033280' },
          { label: 'Total Sends This Month', value: stats?.sendsThisMonth ?? '—', color: '#0cb22c' },
          { label: 'Platform Delivery Rate', value: stats ? `${stats.deliveryRate}%` : '—', color: '#7c3aed' },
          { label: 'Platform Opt-Out Rate', value: stats ? `${stats.optOutRate}%` : '—', color: '#f59e0b' },
        ].map(card => (
          <div key={card.label} style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>{card.label}</div>
            <div style={{ fontSize: 26, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* All reminders table */}
      <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, marginBottom: 28, overflow: 'hidden' }}>
        <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border, #e5e7eb)', fontWeight: 700, fontSize: 14, color: 'var(--text, #111)' }}>
          All Configured Reminders
        </div>
        {isLoading ? (
          <div style={{ padding: '32px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading…</div>
        ) : reminders.length === 0 ? (
          <div style={{ padding: '40px 32px', textAlign: 'center', color: '#aaa', fontSize: 13 }}>
            {t('reminder.noReminders')}
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary, #f9fafb)' }}>
                {['Name', 'Dealer ID', 'Type', 'Status', 'Last Sent', 'Total Sends'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em', whiteSpace: 'nowrap' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {reminders.map(r => (
                <tr key={r.id} style={{ borderTop: '1px solid var(--border, #f0f0f0)' }}>
                  <td style={{ padding: '11px 14px', fontWeight: 500, color: 'var(--text, #111)' }}>{r.name}</td>
                  <td style={{ padding: '11px 14px', color: '#888', fontSize: 11, fontFamily: 'monospace' }}>{r.dealershipId.slice(0, 8)}…</td>
                  <td style={{ padding: '11px 14px', color: '#555' }}>{TEMPLATE_LABELS[r.templateType] ?? r.templateType}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, padding: '2px 8px', borderRadius: 20, background: r.isActive ? '#f0fdf4' : '#f9fafb', color: r.isActive ? '#16a34a' : '#888' }}>
                      {r.isActive ? t('reminder.active') : t('reminder.disabled')}
                    </span>
                  </td>
                  <td style={{ padding: '11px 14px', color: '#888', fontSize: 12 }}>
                    {r.lastSentAt ? new Date(r.lastSentAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: '2-digit' }) : '—'}
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: '#555' }}>{r.sendCount}</td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      {/* Per-dealer summary */}
      {Object.keys(byDealer).length > 0 && (
        <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, overflow: 'hidden' }}>
          <div style={{ padding: '14px 18px', borderBottom: '1px solid var(--border, #e5e7eb)', fontWeight: 700, fontSize: 14, color: 'var(--text, #111)' }}>
            Per-Dealer Summary
          </div>
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary, #f9fafb)' }}>
                {['Dealer ID', 'Total Reminders', 'Active', 'Total Sends'].map(h => (
                  <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: '#888', textTransform: 'uppercase', letterSpacing: '0.04em' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {Object.entries(byDealer).map(([dealerId, data]) => (
                <tr key={dealerId} style={{ borderTop: '1px solid var(--border, #f0f0f0)' }}>
                  <td style={{ padding: '11px 14px', color: '#888', fontSize: 11, fontFamily: 'monospace' }}>{dealerId.slice(0, 8)}…</td>
                  <td style={{ padding: '11px 14px', color: '#555' }}>{data.reminders.length}</td>
                  <td style={{ padding: '11px 14px' }}>
                    <span style={{ fontSize: 11, fontWeight: 700, color: '#16a34a' }}>{data.active}</span>
                  </td>
                  <td style={{ padding: '11px 14px', fontWeight: 600, color: '#555' }}>{data.totalSends}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
