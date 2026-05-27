// client/src/pages/exclusive/client/MyPaymentPlans.tsx
// Customer view of active and historical payment plans
// Route: /:dealerId/client/payment-plans

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { formatCurrency } from '@/lib/locale';

interface PaymentPlanRow {
  plan: {
    id: string;
    amount: string;
    currency: string;
    term: number;
    monthlyPayment: string | null;
    interestRate: string | null;
    status: string;
    serviceDescription: string | null;
    submittedAt: string | null;
    approvedAt: string | null;
    createdAt: string;
  };
  partner: {
    id: string;
    name: string;
  } | null;
}

const STATUS_COLORS: Record<string, string> = {
  draft:     '#6b7280',
  submitted: '#f59e0b',
  approved:  '#22c55e',
  declined:  '#ef4444',
  active:    '#3b82f6',
  completed: '#033280',
  cancelled: '#9ca3af',
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function MyPaymentPlans() {
  const { user } = useAuth();
  const { t, language: lang } = useLanguage();

  const [plans, setPlans] = useState<PaymentPlanRow[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user?.id) return;
    setLoading(true);
    apiFetch<{ plans: PaymentPlanRow[] }>(`/api/payment-plans/by-customer/${user.id}`)
      .then(d => setPlans(d.plans || []))
      .catch(() => setPlans([]))
      .finally(() => setLoading(false));
  }, [user?.id]);

  const currency = plans[0]?.plan.currency as 'CAD' | 'USD' | undefined || 'CAD';

  if (loading) {
    return (
      <div className="page active">
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>{t('common.loading')}</div>
      </div>
    );
  }

  if (plans.length === 0) {
    return (
      <div className="page active">
        <div style={{ padding: '60px 20px', textAlign: 'center' }}>
          <div style={{ width: 60, height: 60, borderRadius: '50%', background: '#f0f5ff', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
            <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#033280" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
          </div>
          <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text, #333)', marginBottom: 8 }}>
            {t('paymentPlan.noPlans')}
          </div>
          <div style={{ fontSize: 13, color: '#888', maxWidth: 360, margin: '0 auto', lineHeight: 1.6 }}>
            {lang === 'fr'
              ? 'Vous n\'avez aucun plan de paiement pour le moment. Si une réparation ou un service coûte plus de votre déductible, votre concessionnaire peut vous offrir des options de paiement flexibles.'
              : 'You have no payment plans yet. If a repair or service exceeds your budget, your dealership can offer flexible payment options.'}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text, #1a1a1a)', marginBottom: 4 }}>
          {t('paymentPlan.title')}
        </div>
        <div style={{ fontSize: 13, color: '#888' }}>
          {lang === 'fr'
            ? `${plans.length} plan${plans.length !== 1 ? 's' : ''} de paiement`
            : `${plans.length} payment plan${plans.length !== 1 ? 's' : ''}`}
        </div>
      </div>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
        {plans.map(row => (
          <div key={row.plan.id} className="pn" style={{ padding: '20px 24px' }}>
            {/* Header row */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>
                  {row.plan.serviceDescription || (lang === 'fr' ? 'Service de réparation' : 'Service Repair')}
                </div>
                <div style={{ fontSize: 20, fontWeight: 700, color: '#033280' }}>
                  {formatCurrency(row.plan.amount, (row.plan.currency as 'CAD' | 'USD') || 'CAD')}
                </div>
              </div>
              <span style={{
                display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                background: `${STATUS_COLORS[row.plan.status] ?? '#888'}20`,
                color: STATUS_COLORS[row.plan.status] ?? '#888',
              }}>
                {t(`paymentPlan.${row.plan.status}` as any) || row.plan.status}
              </span>
            </div>

            {/* Detail grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 16 }}>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{t('paymentPlan.monthlyPayment')}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #333)' }}>
                  {row.plan.monthlyPayment
                    ? formatCurrency(row.plan.monthlyPayment, (row.plan.currency as 'CAD' | 'USD') || 'CAD')
                    : '—'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{t('paymentPlan.term')}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #333)' }}>
                  {row.plan.term} {lang === 'fr' ? 'mois' : 'months'}
                </div>
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{t('paymentPlan.partner')}</div>
                <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #333)' }}>
                  {row.partner?.name || '—'}
                </div>
              </div>
            </div>

            {/* Interest rate if available */}
            {row.plan.interestRate && (
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 2 }}>{t('paymentPlan.interestRate')}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #333)' }}>{row.plan.interestRate}% APR</div>
              </div>
            )}

            {/* Timeline */}
            <div style={{ borderTop: '1px solid var(--border, #f0f0f0)', paddingTop: 12, display: 'flex', gap: 24, flexWrap: 'wrap' }}>
              <div>
                <div style={{ fontSize: 10, color: '#bbb', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                  {lang === 'fr' ? 'Soumis' : 'Submitted'}
                </div>
                <div style={{ fontSize: 12, color: '#888' }}>{fmtDate(row.plan.submittedAt || row.plan.createdAt)}</div>
              </div>
              {row.plan.approvedAt && (
                <div>
                  <div style={{ fontSize: 10, color: '#bbb', textTransform: 'uppercase', letterSpacing: 0.5 }}>
                    {lang === 'fr' ? 'Approuvé' : 'Approved'}
                  </div>
                  <div style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>{fmtDate(row.plan.approvedAt)}</div>
                </div>
              )}
            </div>

            {/* Pending notice */}
            {row.plan.status === 'submitted' && (
              <div style={{
                marginTop: 14, padding: '10px 14px', background: '#fffbeb',
                border: '1px solid #fde68a', borderRadius: 6, fontSize: 12, color: '#92400e',
              }}>
                <strong>{lang === 'fr' ? 'En cours d\'examen' : 'Under Review'}</strong>
                {' — '}
                {lang === 'fr'
                  ? 'Votre demande est en cours d\'examen par le partenaire financier. Vous recevrez une mise à jour sous 24 heures.'
                  : 'Your application is being reviewed by the financing partner. You will receive an update within 24 hours.'}
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
