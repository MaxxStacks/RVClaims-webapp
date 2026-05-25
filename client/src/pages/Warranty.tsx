// client/src/pages/Warranty.tsx — Client Warranty & Coverage page
// This is the customer-facing warranty view. Polished, with progress bar and coverage grid.
// Role: client (their own warranty), dealer_owner/staff (unit warranty overview), operator (all)

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

interface WarrantyPlan {
  id: string;
  planNumber: string;
  unitId: string;
  dealershipId: string;
  provider: string;
  coverage: string | null;
  startDate: string | null;
  endDate: string | null;
  soldByPlatform: boolean;
  status: 'active' | 'expiring' | 'expired' | 'cancelled';
  customData: Record<string, any>;
  createdAt: string;
}

const COVERAGE_CATEGORIES = [
  { key: 'coversStructural', label: 'Structural', icon: '🏗️', desc: 'Frame, roof structure, walls, floor' },
  { key: 'coversPlumbing', label: 'Plumbing', icon: '🚿', desc: 'Water systems, tanks, pumps, fixtures' },
  { key: 'coversElectrical', label: 'Electrical', icon: '⚡', desc: 'Wiring, panels, outlets, lighting' },
  { key: 'coversHvac', label: 'HVAC', icon: '❄️', desc: 'Air conditioning, furnace, heat pump' },
  { key: 'coversAppliances', label: 'Appliances', icon: '🍳', desc: 'Refrigerator, oven, microwave, washer' },
  { key: 'coversSlideOuts', label: 'Slide-Outs', icon: '📐', desc: 'Slide mechanisms, seals, motors' },
];

function calcDaysRemaining(endDate: string | null): number {
  if (!endDate) return 0;
  return Math.max(0, Math.floor((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function calcProgressPercent(startDate: string | null, endDate: string | null): number {
  if (!startDate || !endDate) return 0;
  const total = Math.max(1, Math.floor((new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24)));
  const remaining = calcDaysRemaining(endDate);
  const elapsed = total - remaining;
  return Math.min(100, Math.round((elapsed / total) * 100));
}

export default function Warranty() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const role          = user?.role as string | undefined;
  const isClient      = role === 'client';
  const isDealerOwner = role === 'dealer_owner';
  const isDealerStaff = role === 'dealer_staff';
  const isOperator    = role === 'operator_admin' || role === 'operator_staff';

  const [warranties, setWarranties]   = useState<WarrantyPlan[]>([]);
  const [activeWarranty, setActiveWarranty] = useState<WarrantyPlan | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [dataError, setDataError]     = useState<string | null>(null);

  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadWarranties = useCallback(async () => {
    setIsLoading(true);
    setDataError(null);
    try {
      const d = await apiFetch<any>('/api/warranty-plans');
      const all: WarrantyPlan[] = Array.isArray(d.warrantyPlans) ? d.warrantyPlans : [];
      setWarranties(all);
      // Pick the most relevant active plan
      const active = all.find(w => w.status === 'active') ||
                     all.find(w => w.status === 'expiring') ||
                     all[0] || null;
      setActiveWarranty(active);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load warranty data');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => { loadWarranties(); }, [loadWarranties]);

  const handleRenewalRequest = async () => {
    if (!activeWarranty) return;
    try {
      await apiFetch(`/api/warranty-plans/${activeWarranty.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          customData: {
            ...activeWarranty.customData,
            renewalRequested: true,
            renewalRequestedAt: new Date().toISOString(),
          },
        }),
      });
      showToast('Renewal request sent to your dealer');
      loadWarranties();
    } catch (err: any) {
      showToast(err?.message || 'Failed to send renewal request');
    }
  };

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300 }}>
        <div style={{ color: '#888', fontSize: 14 }}>Loading warranty information…</div>
      </div>
    );
  }

  // No warranty state
  if (!activeWarranty && !isLoading) {
    return (
      <div className="page active">
        {toastVisible && (
          <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#08235d', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
            {toastMsg}
          </div>
        )}

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 700 }}>{t('warranty.warrantyCoverage')}</div>
            <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Your protection plans and coverage details</div>
          </div>
        </div>

        <div className="pn" style={{ textAlign: 'center', padding: '48px 32px' }}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>🛡️</div>
          <div style={{ fontSize: 17, fontWeight: 600, color: '#1e293b', marginBottom: 8 }}>{t('warranty.noActivePlan')}</div>
          <div style={{ fontSize: 14, color: '#666', lineHeight: 1.6, maxWidth: 400, margin: '0 auto 24px' }}>
            No warranty plans are currently linked to your account. Contact your dealer to register an existing plan or enquire about extended coverage options.
          </div>
          <a href="mailto:support@dealersuite360.com" style={{ display: 'inline-block', padding: '10px 24px', background: '#08235d', color: '#fff', borderRadius: 8, textDecoration: 'none', fontSize: 13, fontWeight: 500 }}>
            Contact Your Dealer
          </a>
        </div>

        {dataError && (
          <div style={{ marginTop: 16, padding: '10px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
            {dataError}
          </div>
        )}
      </div>
    );
  }

  const w = activeWarranty!;
  const cd = w.customData || {};
  const daysRemaining = calcDaysRemaining(w.endDate);
  const progressPct   = calcProgressPercent(w.startDate, w.endDate);
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 90;
  const isExpired      = w.status === 'expired' || (!!w.endDate && daysRemaining === 0);
  const isCancelled    = w.status === 'cancelled';

  const warrantyStatusLabel =
    isCancelled    ? 'Cancelled' :
    isExpired      ? 'Expired'   :
    isExpiringSoon ? 'Expiring Soon' :
    'Active';

  const barColor =
    isCancelled    ? '#9ca3af' :
    isExpired      ? '#dc2626' :
    isExpiringSoon ? '#d97706' :
    '#2563eb';

  const statusCls =
    isCancelled    ? 'bg cancelled' :
    isExpired      ? 'bg denied'    :
    isExpiringSoon ? 'bg ow'        :
    'bg active';

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#08235d', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toastMsg}
        </div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{t('warranty.warrantyCoverage')}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>Your protection plans and coverage details</div>
        </div>
        {warranties.length > 1 && (
          <select
            style={{ padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa' }}
            value={w.id}
            onChange={e => {
              const sel = warranties.find(wr => wr.id === e.target.value);
              if (sel) setActiveWarranty(sel);
            }}
          >
            {warranties.map(wr => (
              <option key={wr.id} value={wr.id}>{wr.planNumber} — {wr.provider} ({wr.coverage || cd.tier || ''})</option>
            ))}
          </select>
        )}
      </div>

      {/* Expiry alert */}
      {isExpiringSoon && !cd.renewalRequested && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: '14px 18px', marginBottom: 20, display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 10 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <span style={{ fontSize: 18 }}>⚠️</span>
            <div>
              <div style={{ fontWeight: 600, fontSize: 13, color: '#92400e' }}>Warranty Expiring Soon</div>
              <div style={{ fontSize: 12, color: '#78350f', marginTop: 2 }}>
                Your warranty expires in <strong>{daysRemaining} days</strong>{w.endDate ? ` — ${new Date(w.endDate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}` : ''}.
              </div>
            </div>
          </div>
          <button className="btn btn-p btn-sm" onClick={handleRenewalRequest}>
            {t('warranty.requestRenewal')}
          </button>
        </div>
      )}

      {cd.renewalRequested && (
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#065f46', display: 'flex', alignItems: 'center', gap: 8 }}>
          <span>✓</span>
          <span>Renewal request submitted{cd.renewalRequestedAt ? ` on ${new Date(cd.renewalRequestedAt).toLocaleDateString('en-CA')}` : ''}. Your dealer will be in touch.</span>
        </div>
      )}

      {/* Status card with progress bar */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div style={{ padding: '20px 24px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 20 }}>
            <div>
              <div style={{ fontSize: 15, fontWeight: 700, color: '#1e293b', marginBottom: 4 }}>
                {w.provider} — {w.coverage || cd.tier || 'Coverage Plan'}
              </div>
              <div style={{ fontSize: 13, color: '#666' }}>Plan # {w.planNumber}</div>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column' as const, alignItems: 'flex-end', gap: 6 }}>
              <span className={statusCls} style={{ fontSize: 12, padding: '4px 12px' }}>{warrantyStatusLabel}</span>
              {cd.tier && (
                <span style={{ fontSize: 11, background: '#eff6ff', color: '#1d4ed8', padding: '2px 8px', borderRadius: 12, fontWeight: 500 }}>{cd.tier} Tier</span>
              )}
            </div>
          </div>

          {/* Days remaining + progress */}
          <div style={{ textAlign: 'center', marginBottom: 20 }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: barColor, lineHeight: 1, marginBottom: 4 }}>
              {w.endDate ? daysRemaining.toLocaleString() : '—'}
            </div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>{t('warranty.daysRemaining')}</div>

            {/* Progress bar */}
            <div style={{ position: 'relative' as const, height: 12, background: '#f0f0f0', borderRadius: 6, overflow: 'hidden', marginBottom: 8 }}>
              <div style={{
                height: '100%',
                width: `${progressPct}%`,
                background: `linear-gradient(90deg, ${barColor}cc, ${barColor})`,
                borderRadius: 6,
                transition: 'width 0.6s ease',
              }} />
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {progressPct}% elapsed
              {w.startDate && w.endDate && (
                <> · {new Date(w.startDate).toLocaleDateString('en-CA')} → {new Date(w.endDate).toLocaleDateString('en-CA')}</>
              )}
            </div>
          </div>

          {/* Key dates row */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12 }}>
            {[
              { label: t('warranty.startDate'), value: w.startDate ? new Date(w.startDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
              { label: 'Expiry Date', value: w.endDate ? new Date(w.endDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—' },
              { label: 'Provider', value: w.provider },
            ].map(item => (
              <div key={item.label} style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px' }}>
                <div style={{ fontSize: 11, color: '#94a3b8', fontWeight: 500, marginBottom: 4, textTransform: 'uppercase' as const, letterSpacing: 0.5 }}>{item.label}</div>
                <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b' }}>{item.value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Coverage breakdown grid */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div className="pn-h"><span className="pn-t">{t('warranty.coverageBreakdown')}</span></div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 1, background: '#f0f0f0' }}>
          {COVERAGE_CATEGORIES.map(cat => {
            const covered = cd[cat.key] !== false; // default covered unless explicitly false
            return (
              <div
                key={cat.key}
                style={{
                  background: covered ? '#fff' : '#fafafa',
                  padding: '16px 18px',
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                }}
              >
                <div style={{
                  width: 40,
                  height: 40,
                  borderRadius: 10,
                  background: covered ? '#f0fdf4' : '#f3f4f6',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontSize: 18,
                  flexShrink: 0,
                }}>
                  {cat.icon}
                </div>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginBottom: 2 }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: covered ? '#1e293b' : '#9ca3af' }}>{cat.label}</span>
                    {covered
                      ? <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#22c55e', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M2 6l3 3 5-5" stroke="#fff" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/></svg>
                        </span>
                      : <span style={{ width: 16, height: 16, borderRadius: '50%', background: '#e5e7eb', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                          <svg width="9" height="9" viewBox="0 0 12 12" fill="none"><path d="M3 3l6 6M9 3l-6 6" stroke="#9ca3af" strokeWidth="2" strokeLinecap="round"/></svg>
                        </span>
                    }
                  </div>
                  <div style={{ fontSize: 11, color: '#94a3b8', lineHeight: 1.4 }}>{cat.desc}</div>
                  <div style={{ fontSize: 11, fontWeight: 600, marginTop: 4, color: covered ? '#22c55e' : '#9ca3af' }}>
                    {covered ? 'Covered' : 'Not Covered'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Additional plans (if multiple) */}
      {warranties.length > 1 && (
        <div className="pn">
          <div className="pn-h"><span className="pn-t">All Warranty Plans ({warranties.length})</span></div>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Plan #</th>
                  <th>Provider</th>
                  <th>Coverage</th>
                  <th>Expires</th>
                  <th>Days Left</th>
                  <th>Status</th>
                </tr>
              </thead>
              <tbody>
                {warranties.map(wr => {
                  const days = calcDaysRemaining(wr.endDate);
                  const statusCl =
                    wr.status === 'cancelled' ? 'bg cancelled' :
                    (wr.status === 'expired' || days === 0) ? 'bg denied' :
                    days <= 90 ? 'bg ow' : 'bg active';
                  const statusLbl =
                    wr.status === 'cancelled' ? 'Cancelled' :
                    (wr.status === 'expired' || days === 0) ? 'Expired' :
                    days <= 90 ? 'Expiring' : 'Active';
                  return (
                    <tr
                      key={wr.id}
                      style={{ cursor: 'pointer', background: wr.id === w.id ? '#f0f7ff' : undefined }}
                      onClick={() => setActiveWarranty(wr)}
                    >
                      <td style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 12 }}>{wr.planNumber}</td>
                      <td>{wr.provider}</td>
                      <td>{wr.coverage || wr.customData?.tier || '—'}</td>
                      <td style={{ fontSize: 12, color: '#666' }}>{wr.endDate ? new Date(wr.endDate).toLocaleDateString('en-CA') : '—'}</td>
                      <td style={{ fontWeight: 600, color: days <= 30 ? '#d97706' : days === 0 ? '#dc2626' : '#22c55e' }}>
                        {wr.endDate ? days : '—'}
                      </td>
                      <td><span className={statusCl} style={{ fontSize: 11, padding: '2px 8px' }}>{statusLbl}</span></td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {dataError && (
        <div style={{ marginTop: 16, padding: '10px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
          {dataError}
        </div>
      )}
    </div>
  );
}
