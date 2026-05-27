// client/src/pages/exclusive/dealer-owner/PaymentPlans.tsx
// Payment Plans management page for dealer owners and financial managers
// Route: /:dealerId/owner/payment-plans

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
    customerName: string | null;
    serviceDescription: string | null;
    incomeRange: string | null;
    consentGiven: boolean;
    referralFee: string | null;
    submittedAt: string | null;
    approvedAt: string | null;
    approvalData: Record<string, unknown> | null;
    createdAt: string;
  };
  partner: {
    id: string;
    name: string;
    country: string;
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

export default function PaymentPlans() {
  const { user } = useAuth();
  const { t, language: lang } = useLanguage();

  const [plans, setPlans] = useState<PaymentPlanRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanRow | null>(null);
  const [threshold, setThreshold] = useState<number>(500);
  const [thresholdDraft, setThresholdDraft] = useState<string>('500');
  const [toast, setToast] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const showToast = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(''), 2800);
  };

  const loadPlans = async () => {
    setLoading(true);
    try {
      const data = await apiFetch<{ plans: PaymentPlanRow[] }>('/api/payment-plans');
      setPlans(data.plans || []);
    } catch {
      setPlans([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadPlans(); }, []);

  const filtered = statusFilter ? plans.filter(r => r.plan.status === statusFilter) : plans;

  // Summary stats
  const total = plans.length;
  const approved = plans.filter(r => r.plan.status === 'approved' || r.plan.status === 'active').length;
  const active = plans.filter(r => r.plan.status === 'active').length;
  const completed = plans.filter(r => r.plan.status === 'completed').length;
  const totalFinanced = plans
    .filter(r => ['approved','active','completed'].includes(r.plan.status))
    .reduce((acc, r) => acc + parseFloat(r.plan.amount || '0'), 0);

  const currency = plans[0]?.plan.currency as 'CAD' | 'USD' | undefined || 'CAD';

  const saveThreshold = () => {
    const val = parseFloat(thresholdDraft);
    if (isNaN(val) || val < 0) { showToast(t('common.required')); return; }
    setThreshold(val);
    // Persist to localStorage for this dealer
    try { localStorage.setItem(`ds360-payment-plan-threshold-${user?.dealershipId}`, String(val)); } catch {}
    showToast(t('paymentPlan.thresholdSaved'));
  };

  // Load saved threshold
  useEffect(() => {
    try {
      const saved = localStorage.getItem(`ds360-payment-plan-threshold-${user?.dealershipId}`);
      if (saved) { const v = parseFloat(saved); if (!isNaN(v)) { setThreshold(v); setThresholdDraft(String(v)); } }
    } catch {}
  }, [user?.dealershipId]);

  return (
    <div className="page active">
      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: t('paymentPlan.totalApplications'), value: total, color: '#033280' },
          { label: t('paymentPlan.approved'), value: approved, color: '#22c55e' },
          { label: t('paymentPlan.active'), value: active, color: '#3b82f6' },
          { label: t('paymentPlan.completed'), value: completed, color: '#033280' },
          { label: t('paymentPlan.totalFinanced'), value: formatCurrency(totalFinanced, currency), color: '#0cb22c' },
        ].map((card, i) => (
          <div key={i} className="pn" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>
              {card.label}
            </div>
            <div style={{ fontSize: typeof card.value === 'string' ? 15 : 22, fontWeight: 700, color: card.color }}>
              {card.value}
            </div>
          </div>
        ))}
      </div>

      {/* Applications table */}
      <div className="pn" style={{ marginBottom: 24 }}>
        <div className="pn-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
          <span className="pn-t">{t('paymentPlan.applications')}</span>
          <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              style={{ fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }}
            >
              <option value="">{t('common.allStatuses')}</option>
              <option value="submitted">{t('paymentPlan.submitted')}</option>
              <option value="approved">{t('paymentPlan.approved')}</option>
              <option value="declined">{t('paymentPlan.declined')}</option>
              <option value="active">{t('paymentPlan.active')}</option>
              <option value="completed">{t('paymentPlan.completed')}</option>
            </select>
            <button onClick={loadPlans} className="btn" style={{ fontSize: 12 }}>{t('common.filter')}</button>
          </div>
        </div>

        {loading ? (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>{t('common.loading')}</div>
        ) : filtered.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 8 }}>{t('paymentPlan.noPlans')}</div>
            <div style={{ fontSize: 11, color: '#bbb' }}>
              {lang === 'fr'
                ? 'Les plans de paiement apparaîtront ici une fois que des clients auront postulé.'
                : 'Payment plans will appear here once customers have applied.'}
            </div>
          </div>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary, #f8f9fa)' }}>
                  {[t('paymentPlan.customerName'), t('paymentPlan.amount'), t('paymentPlan.term'), t('paymentPlan.partner'), t('common.status'), t('common.date')].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid var(--border, #e8e8e8)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {filtered.map(row => (
                  <tr
                    key={row.plan.id}
                    onClick={() => setSelectedPlan(row)}
                    style={{ cursor: 'pointer', borderBottom: '1px solid var(--border, #f0f0f0)', transition: 'background 0.15s' }}
                    onMouseEnter={e => (e.currentTarget.style.background = 'var(--bg-secondary, #f8f9fa)')}
                    onMouseLeave={e => (e.currentTarget.style.background = '')}
                  >
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.plan.customerName || '—'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13, fontWeight: 600 }}>
                      {formatCurrency(row.plan.amount, (row.plan.currency as 'CAD' | 'USD') || 'CAD')}
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.plan.term} {lang === 'fr' ? 'mois' : 'mo'}</td>
                    <td style={{ padding: '12px 16px', fontSize: 13 }}>{row.partner?.name || '—'}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <span style={{
                        display: 'inline-block', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                        background: `${STATUS_COLORS[row.plan.status] ?? '#888'}20`,
                        color: STATUS_COLORS[row.plan.status] ?? '#888',
                      }}>
                        {t(`paymentPlan.${row.plan.status}` as any) || row.plan.status}
                      </span>
                    </td>
                    <td style={{ padding: '12px 16px', fontSize: 12, color: '#888' }}>{fmtDate(row.plan.submittedAt || row.plan.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Settings section */}
      <div className="pn">
        <div className="pn-h"><span className="pn-t">{t('paymentPlan.settings')}</span></div>
        <div style={{ padding: '20px' }}>
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #333)', marginBottom: 4 }}>
              {t('paymentPlan.threshold')}
            </div>
            <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>
              {lang === 'fr'
                ? 'Afficher le bouton "Offrir un plan de paiement" sur les factures et ordres de travail qui dépassent ce montant.'
                : 'Show the "Offer Payment Plan" button on invoices and work orders that exceed this amount.'}
            </div>
            <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
              <span style={{ fontSize: 13, color: '#888' }}>$</span>
              <input
                type="number"
                value={thresholdDraft}
                onChange={e => setThresholdDraft(e.target.value)}
                min="0"
                step="50"
                style={{
                  width: 120, padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)',
                  fontSize: 13, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)',
                }}
              />
              <button onClick={saveThreshold} className="btn" style={{ background: '#0cb22c', color: '#fff', border: 'none', fontSize: 12, padding: '7px 14px' }}>
                {t('common.save')}
              </button>
              <span style={{ fontSize: 11, color: '#888' }}>
                {lang === 'fr' ? `Seuil actuel: $${threshold}` : `Current threshold: $${threshold}`}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Detail drawer/panel */}
      {selectedPlan && (
        <div style={{
          position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,.4)',
          display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end',
        }} onClick={e => { if (e.target === e.currentTarget) setSelectedPlan(null); }}>
          <div style={{
            width: 400, maxWidth: '100vw', height: '100%', overflowY: 'auto',
            background: 'var(--bg-card, #fff)', boxShadow: '-8px 0 40px rgba(0,0,0,.15)',
            padding: 0,
          }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border, #e8e8e8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #333)' }}>{t('paymentPlan.applicationDetail')}</div>
              <button onClick={() => setSelectedPlan(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              <div style={{
                display: 'inline-block', padding: '4px 10px', borderRadius: 12, fontSize: 11, fontWeight: 600, marginBottom: 18,
                background: `${STATUS_COLORS[selectedPlan.plan.status] ?? '#888'}20`,
                color: STATUS_COLORS[selectedPlan.plan.status] ?? '#888',
              }}>
                {t(`paymentPlan.${selectedPlan.plan.status}` as any) || selectedPlan.plan.status}
              </div>

              {[
                [t('paymentPlan.customerName'), selectedPlan.plan.customerName],
                [t('paymentPlan.amount'), formatCurrency(selectedPlan.plan.amount, (selectedPlan.plan.currency as 'CAD' | 'USD') || 'CAD')],
                [t('paymentPlan.currency'), selectedPlan.plan.currency],
                [t('paymentPlan.term'), `${selectedPlan.plan.term} ${lang === 'fr' ? 'mois' : 'months'}`],
                [t('paymentPlan.partner'), selectedPlan.partner?.name || '—'],
                [t('paymentPlan.monthlyPayment'), selectedPlan.plan.monthlyPayment ? formatCurrency(selectedPlan.plan.monthlyPayment, (selectedPlan.plan.currency as 'CAD' | 'USD') || 'CAD') : '—'],
                [t('paymentPlan.interestRate'), selectedPlan.plan.interestRate ? `${selectedPlan.plan.interestRate}%` : '—'],
                [lang === 'fr' ? 'Service' : 'Service', selectedPlan.plan.serviceDescription || '—'],
                [lang === 'fr' ? 'Soumis le' : 'Submitted', fmtDate(selectedPlan.plan.submittedAt)],
                [lang === 'fr' ? 'Approuvé le' : 'Approved', fmtDate(selectedPlan.plan.approvedAt)],
              ].map(([label, value]) => value && (
                <div key={String(label)} style={{ marginBottom: 12 }}>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 2 }}>{label}</div>
                  <div style={{ fontSize: 13, color: 'var(--text, #333)', fontWeight: 600 }}>{value}</div>
                </div>
              ))}

              {selectedPlan.plan.approvalData && Object.keys(selectedPlan.plan.approvalData as object).length > 0 && (
                <div style={{ marginTop: 16, padding: '12px', background: 'var(--bg-secondary, #f4f6fb)', borderRadius: 8 }}>
                  <div style={{ fontSize: 11, color: '#888', fontWeight: 600, marginBottom: 8 }}>
                    {lang === 'fr' ? 'Données d\'approbation' : 'Approval Data'}
                  </div>
                  <pre style={{ fontSize: 11, color: '#555', margin: 0, overflow: 'auto' }}>
                    {JSON.stringify(selectedPlan.plan.approvalData, null, 2)}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
