// client/src/components/PaymentPlanModal.tsx
// Modal for offering a payment plan on a service invoice or work order
// Supports Canadian and US financing partners with country-appropriate consent text

import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { getDealerCurrency, getDealerCountry, getFinancingConsentText, formatCurrency } from '@/lib/locale';
import type { LocaleAwareDealership } from '@/lib/locale';

interface FinancingPartner {
  id: string;
  name: string;
  country: string;
  referralFeePercent: string;
  minAmount: string;
  maxAmount: string;
  availableTerms: number[];
}

interface PaymentPlanModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  // Pre-filled data
  dealership?: LocaleAwareDealership | null;
  customerName?: string;
  customerEmail?: string;
  customerId?: string;
  serviceAmount: number;
  currency?: 'CAD' | 'USD';
  serviceDescription?: string;
  invoiceId?: string;
  workOrderId?: string;
  unitId?: string;
}

const INCOME_RANGE_OPTIONS = [
  { value: 'under_30k',  label: 'Under $30,000' },
  { value: '30k_50k',   label: '$30,000 – $50,000' },
  { value: '50k_75k',   label: '$50,000 – $75,000' },
  { value: '75k_100k',  label: '$75,000 – $100,000' },
  { value: 'over_100k', label: 'Over $100,000' },
];

const INCOME_RANGE_OPTIONS_FR = [
  { value: 'under_30k',  label: 'Moins de 30 000 $' },
  { value: '30k_50k',   label: '30 000 $ – 50 000 $' },
  { value: '50k_75k',   label: '50 000 $ – 75 000 $' },
  { value: '75k_100k',  label: '75 000 $ – 100 000 $' },
  { value: 'over_100k', label: 'Plus de 100 000 $' },
];

export default function PaymentPlanModal({
  isOpen,
  onClose,
  onSuccess,
  dealership,
  customerName = '',
  customerEmail = '',
  customerId,
  serviceAmount,
  currency,
  serviceDescription,
  invoiceId,
  workOrderId,
  unitId,
}: PaymentPlanModalProps) {
  const { t, language: lang } = useLanguage();

  const country = getDealerCountry(dealership);
  const resolvedCurrency = currency || getDealerCurrency(dealership);
  const langKey = lang === 'fr' ? 'fr' : 'en';

  const [partners, setPartners] = useState<FinancingPartner[]>([]);
  const [partnersLoading, setPartnersLoading] = useState(false);

  const [selectedPartnerId, setSelectedPartnerId] = useState('');
  const [selectedTerm, setSelectedTerm] = useState<number>(12);
  const [incomeRange, setIncomeRange] = useState('');
  const [consentGiven, setConsentGiven] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState('');

  const availableTerms = selectedPartnerId
    ? (partners.find(p => p.id === selectedPartnerId)?.availableTerms ?? [3, 6, 12, 24])
    : [3, 6, 12, 24];

  // Reset form when opened
  useEffect(() => {
    if (isOpen) {
      setSelectedPartnerId('');
      setSelectedTerm(12);
      setIncomeRange('');
      setConsentGiven(false);
      setError('');
    }
  }, [isOpen]);

  // Load financing partners filtered by dealer country
  useEffect(() => {
    if (!isOpen) return;
    setPartnersLoading(true);
    apiFetch<{ partners: FinancingPartner[] }>(`/api/financing-partners?country=${country}`)
      .then(d => setPartners(d.partners || []))
      .catch(() => setPartners([]))
      .finally(() => setPartnersLoading(false));
  }, [isOpen, country]);

  // Reset term if newly selected partner doesn't have the current term
  useEffect(() => {
    if (!availableTerms.includes(selectedTerm)) {
      setSelectedTerm(availableTerms[0] ?? 12);
    }
  }, [selectedPartnerId]);

  if (!isOpen) return null;

  const consentText = getFinancingConsentText(country, langKey);
  const incomeOptions = langKey === 'fr' ? INCOME_RANGE_OPTIONS_FR : INCOME_RANGE_OPTIONS;
  const formattedAmount = formatCurrency(serviceAmount, resolvedCurrency);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedPartnerId) { setError(t('paymentPlan.partnerRequired')); return; }
    if (!incomeRange) { setError(t('paymentPlan.incomeRequired')); return; }
    if (!consentGiven) { setError(t('paymentPlan.consentRequired')); return; }

    setSubmitting(true);
    setError('');
    try {
      await apiFetch('/api/payment-plans', {
        method: 'POST',
        body: JSON.stringify({
          customerId: customerId || null,
          invoiceId: invoiceId || null,
          workOrderId: workOrderId || null,
          unitId: unitId || null,
          financingPartnerId: selectedPartnerId,
          amount: serviceAmount.toFixed(2),
          currency: resolvedCurrency,
          term: selectedTerm,
          customerName,
          customerEmail,
          incomeRange,
          consentGiven: true,
          serviceDescription: serviceDescription || '',
        }),
      });
      onSuccess();
      onClose();
    } catch (err: any) {
      setError(err?.message || t('paymentPlan.submitError'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div style={{
      position: 'fixed', inset: 0, zIndex: 1200,
      background: 'rgba(0,0,0,0.45)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      padding: '16px',
    }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{
        background: 'var(--bg-card, #fff)',
        borderRadius: 12,
        boxShadow: '0 20px 60px rgba(0,0,0,.2)',
        width: '100%',
        maxWidth: 520,
        maxHeight: '90vh',
        overflowY: 'auto',
        padding: 0,
      }}>
        {/* Header */}
        <div style={{
          padding: '20px 24px 16px',
          borderBottom: '1px solid var(--border, #e8e8e8)',
          display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        }}>
          <div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text, #1a1a1a)' }}>
              {t('paymentPlan.title')}
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted, #888)', marginTop: 2 }}>
              {resolvedCurrency === 'CAD'
                ? (langKey === 'fr' ? 'Partenaires de financement canadiens' : 'Canadian financing partners')
                : 'US financing partners'}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 4, color: '#888' }}>
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} style={{ padding: '20px 24px' }}>
          {/* Service Amount display */}
          <div style={{ marginBottom: 18 }}>
            <div style={{
              background: 'var(--bg-secondary, #f4f6fb)',
              borderRadius: 8,
              padding: '12px 16px',
              display: 'flex', justifyContent: 'space-between', alignItems: 'center',
            }}>
              <div>
                <div style={{ fontSize: 11, color: 'var(--text-muted, #888)', fontWeight: 500 }}>
                  {t('paymentPlan.amount')}
                </div>
                <div style={{ fontSize: 22, fontWeight: 700, color: '#033280', marginTop: 2 }}>
                  {formattedAmount}
                </div>
              </div>
              <div style={{ textAlign: 'right' }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted, #888)', fontWeight: 500 }}>
                  {t('paymentPlan.currency')}
                </div>
                <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text, #333)' }}>
                  {resolvedCurrency}
                </div>
              </div>
            </div>
          </div>

          {/* Customer name */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text, #333)', display: 'block', marginBottom: 4 }}>
              {langKey === 'fr' ? 'Nom du client' : 'Customer Name'}
            </label>
            <input
              type="text"
              value={customerName}
              readOnly
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)',
                fontSize: 13, background: 'var(--bg-secondary, #f9f9f9)', color: 'var(--text, #333)',
                boxSizing: 'border-box',
              }}
            />
          </div>

          {/* Financing partner */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text, #333)', display: 'block', marginBottom: 4 }}>
              {t('paymentPlan.partner')} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            {partnersLoading ? (
              <div style={{ fontSize: 12, color: '#888', padding: '8px 0' }}>{t('common.loading')}</div>
            ) : (
              <select
                value={selectedPartnerId}
                onChange={e => setSelectedPartnerId(e.target.value)}
                required
                style={{
                  width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)',
                  fontSize: 13, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)',
                  boxSizing: 'border-box',
                }}
              >
                <option value="">{langKey === 'fr' ? '-- Sélectionner un partenaire --' : '-- Select a partner --'}</option>
                {partners.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name} ({langKey === 'fr' ? 'jusqu\'à' : 'up to'} {formatCurrency(p.maxAmount, resolvedCurrency)})
                  </option>
                ))}
              </select>
            )}
          </div>

          {/* Term selection */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text, #333)', display: 'block', marginBottom: 6 }}>
              {t('paymentPlan.term')} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
              {[3, 6, 12, 24].map(term => {
                const isAvail = availableTerms.includes(term);
                return (
                  <label key={term} style={{
                    display: 'flex', alignItems: 'center', gap: 6,
                    padding: '7px 12px', borderRadius: 6,
                    border: `1px solid ${selectedTerm === term ? '#033280' : 'var(--border, #e0e0e0)'}`,
                    background: selectedTerm === term ? '#e8f0ff' : 'var(--bg-card, #fff)',
                    cursor: isAvail ? 'pointer' : 'not-allowed',
                    opacity: isAvail ? 1 : 0.4,
                    fontSize: 13, fontWeight: selectedTerm === term ? 600 : 400,
                    color: selectedTerm === term ? '#033280' : 'var(--text, #333)',
                  }}>
                    <input
                      type="radio"
                      name="term"
                      value={term}
                      checked={selectedTerm === term}
                      onChange={() => isAvail && setSelectedTerm(term)}
                      disabled={!isAvail}
                      style={{ display: 'none' }}
                    />
                    {term} {langKey === 'fr' ? 'mois' : 'mo'}
                  </label>
                );
              })}
            </div>
          </div>

          {/* Income range */}
          <div style={{ marginBottom: 14 }}>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text, #333)', display: 'block', marginBottom: 4 }}>
              {t('paymentPlan.incomeRange')} <span style={{ color: '#ef4444' }}>*</span>
            </label>
            <select
              value={incomeRange}
              onChange={e => setIncomeRange(e.target.value)}
              required
              style={{
                width: '100%', padding: '8px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)',
                fontSize: 13, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)',
                boxSizing: 'border-box',
              }}
            >
              <option value="">{langKey === 'fr' ? '-- Sélectionner --' : '-- Select income range --'}</option>
              {incomeOptions.map(opt => (
                <option key={opt.value} value={opt.value}>{opt.label}</option>
              ))}
            </select>
          </div>

          {/* Consent checkbox */}
          <div style={{ marginBottom: 18 }}>
            <label style={{
              display: 'flex', alignItems: 'flex-start', gap: 10, cursor: 'pointer',
              padding: '12px 14px',
              background: consentGiven ? '#f0fdf4' : 'var(--bg-secondary, #f9f9f9)',
              borderRadius: 8,
              border: `1px solid ${consentGiven ? '#86efac' : 'var(--border, #e0e0e0)'}`,
            }}>
              <input
                type="checkbox"
                checked={consentGiven}
                onChange={e => setConsentGiven(e.target.checked)}
                style={{ marginTop: 2, flexShrink: 0, accentColor: '#0cb22c', width: 16, height: 16 }}
              />
              <span style={{ fontSize: 12, color: 'var(--text, #444)', lineHeight: 1.5 }}>
                {consentText}
              </span>
            </label>
          </div>

          {error && (
            <div style={{
              background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 6,
              padding: '10px 12px', fontSize: 12, color: '#dc2626', marginBottom: 14,
            }}>
              {error}
            </div>
          )}

          {/* Footer buttons */}
          <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              style={{
                padding: '9px 18px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)',
                background: 'none', fontSize: 13, cursor: 'pointer', color: 'var(--text, #333)',
              }}
            >
              {t('common.cancel')}
            </button>
            <button
              type="submit"
              disabled={submitting}
              style={{
                padding: '9px 20px', borderRadius: 6, border: 'none',
                background: submitting ? '#86efac' : '#0cb22c',
                color: '#fff', fontSize: 13, fontWeight: 600, cursor: submitting ? 'default' : 'pointer',
                display: 'flex', alignItems: 'center', gap: 6,
              }}
            >
              {submitting ? (
                <>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ animation: 'spin 1s linear infinite' }}><path d="M21 12a9 9 0 11-18 0 9 9 0 0118 0"/></svg>
                  {t('common.saving')}
                </>
              ) : t('paymentPlan.submit')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
