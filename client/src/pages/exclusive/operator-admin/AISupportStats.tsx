// client/src/pages/exclusive/operator-admin/AISupportStats.tsx
// Route: /operator/admin/ai-support-stats

import { useLanguage } from '@/hooks/use-language';
import { apiFetch } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';

interface AiStats {
  conversationsToday: number;
  conversationsThisWeek: number;
  conversationsThisMonth: number;
  escalations: number;
}

export default function AISupportStats() {
  const { t } = useLanguage();

  const { data, isLoading } = useQuery({
    queryKey: ['operator-ai-support-stats'],
    queryFn: () => apiFetch<{ success: boolean; stats: AiStats }>('/api/ai/customer-chat/stats'),
    staleTime: 30000,
  });

  const stats = data?.stats;

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card, #fff)',
    border: '1px solid var(--border, #e8e8e8)',
    borderRadius: 12,
    padding: '20px 24px',
    marginBottom: 20,
  };

  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 24 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #111)', margin: 0 }}>
          {t('aiSupport.aiSupportStats')}
        </h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #666)', marginTop: 4 }}>
          Aggregate AI Support Bot usage across all dealerships.
        </p>
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 16px', color: 'var(--text, #111)' }}>
          Platform-Wide Stats
        </h2>
        {isLoading ? (
          <div style={{ color: '#aaa', fontSize: 13 }}>Loading…</div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: 12 }}>
            {[
              { label: 'Conversations Today', value: stats?.conversationsToday ?? 0 },
              { label: 'This Week', value: stats?.conversationsThisWeek ?? 0 },
              { label: 'This Month', value: stats?.conversationsThisMonth ?? 0 },
              { label: 'Total Escalations', value: stats?.escalations ?? 0, warn: true },
            ].map(s => (
              <div key={s.label} style={{
                background: 'var(--bg-secondary, #f4f6fb)',
                borderRadius: 10,
                padding: '16px 18px',
                border: '1px solid var(--border, #e8e8e8)',
              }}>
                <div style={{ fontSize: 28, fontWeight: 800, color: s.warn && s.value > 0 ? '#dc2626' : '#033280' }}>
                  {s.value.toLocaleString()}
                </div>
                <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>{s.label}</div>
              </div>
            ))}
          </div>
        )}
      </div>

      <div style={cardStyle}>
        <h2 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 10px', color: 'var(--text, #111)' }}>
          Module Overview
        </h2>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #666)', lineHeight: 1.6 }}>
          AI Support ($59/month per dealership) — Customer-facing chatbot powered by Claude Haiku,
          personalized to each customer's unit, warranty, and claims data. FAQ overrides reduce AI
          costs. All conversations are logged and reviewable from each dealer's portal.
        </p>
        <div style={{ marginTop: 14, display: 'flex', gap: 10, flexWrap: 'wrap' }}>
          {[
            'Personalized answers from real data',
            'FAQ override system (no AI cost)',
            'Ticket escalation integration',
            'Rate limited: 50 messages/customer/day',
            'Full conversation logs',
          ].map(f => (
            <span key={f} style={{
              background: '#f0f5ff',
              border: '1px solid #c7d4f0',
              borderRadius: 20,
              padding: '4px 12px',
              fontSize: 11,
              color: '#033280',
              fontWeight: 500,
            }}>
              {f}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
}
