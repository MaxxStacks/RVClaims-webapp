// client/src/pages/WarrantyDetail.tsx — Warranty Plan detail view
// Role-aware: operator_admin (cancel + edit), operator_staff (view),
//             dealer_owner/dealer_staff (view + renewal request), client (view own warranty)

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

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
  { key: 'coversStructural', label: 'Structural', icon: '🏗️' },
  { key: 'coversPlumbing', label: 'Plumbing', icon: '🚿' },
  { key: 'coversElectrical', label: 'Electrical', icon: '⚡' },
  { key: 'coversHvac', label: 'HVAC', icon: '❄️' },
  { key: 'coversAppliances', label: 'Appliances', icon: '🍳' },
  { key: 'coversSlideOuts', label: 'Slide-Outs', icon: '📐' },
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

export default function WarrantyDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ id: string }>();
  const { user } = useAuth();

  const planId = params.id || (() => {
    const segs = location.split('/');
    const idx = segs.indexOf('warranty-detail');
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  const role            = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isOperator      = role === 'operator_admin' || role === 'operator_staff';
  const isDealerOwner   = role === 'dealer_owner';
  const isDealerStaff   = role === 'dealer_staff';
  const isClient        = role === 'client';

  const [plan, setPlan]           = useState<WarrantyPlan | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadPlan = useCallback(async () => {
    if (!planId) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const d = await apiFetch<any>(`/api/warranty-plans/${planId}`);
      setPlan(d.warrantyPlan || null);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load warranty plan');
    } finally {
      setIsLoading(false);
    }
  }, [planId]);

  useEffect(() => { loadPlan(); }, [loadPlan]);

  const handleBack = () => {
    const segs = location.split('/');
    const idx = segs.indexOf('warranty-detail');
    if (idx >= 0) navigate(segs.slice(0, idx).join('/') || '/');
    else navigate(-1 as any);
  };

  const handleCancel = async () => {
    if (!plan) return;
    if (!window.confirm('Cancel this warranty plan? This action cannot be undone.')) return;
    try {
      await apiFetch(`/api/warranty-plans/${plan.id}`, { method: 'DELETE' });
      showToast('Warranty plan cancelled');
      setTimeout(() => handleBack(), 1200);
    } catch (err: any) {
      showToast(err?.message || 'Failed to cancel plan');
    }
  };

  const handleRenewalRequest = async () => {
    if (!plan) return;
    try {
      await apiFetch(`/api/warranty-plans/${plan.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          customData: {
            ...plan.customData,
            renewalRequested: true,
            renewalRequestedAt: new Date().toISOString(),
          },
        }),
      });
      showToast('Renewal request sent to operator');
      loadPlan();
    } catch (err: any) {
      showToast(err?.message || 'Failed to request renewal');
    }
  };

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ color: '#888', fontSize: 14 }}>Loading warranty plan…</div>
      </div>
    );
  }

  if (dataError || !plan) {
    return (
      <div className="page active">
        <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>
          {dataError || 'Warranty plan not found.'}
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-o btn-sm" onClick={handleBack}>← Back</button>
          </div>
        </div>
      </div>
    );
  }

  const daysRemaining = calcDaysRemaining(plan.endDate);
  const progressPct   = calcProgressPercent(plan.startDate, plan.endDate);
  const isExpiringSoon = daysRemaining > 0 && daysRemaining <= 90;
  const isExpired      = !plan.endDate || daysRemaining === 0;
  const statusLabel    = plan.status === 'cancelled' ? 'Cancelled' : isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active';
  const statusCls      = plan.status === 'cancelled' ? 'bg cancelled' : isExpired ? 'bg denied' : isExpiringSoon ? 'bg ow' : 'bg active';
  const barColor       = isExpired ? '#dc2626' : isExpiringSoon ? '#d97706' : '#2563eb';

  const cd = plan.customData || {};

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#08235d', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="detail-header">
        <button className="detail-back" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">{plan.planNumber} — {plan.provider}</div>
          <div className="detail-meta">
            {plan.coverage || cd.tier || '—'} · Unit: {plan.unitId.slice(0, 8)}…
            {plan.soldByPlatform && <span style={{ marginLeft: 8, color: '#22c55e', fontWeight: 600 }}>• Sold by Platform</span>}
          </div>
        </div>
        <span className={statusCls} style={{ fontSize: 13, padding: '6px 16px' }}>{statusLabel}</span>
        {isOperatorAdmin && plan.status !== 'cancelled' && (
          <button
            className="btn btn-o btn-sm"
            style={{ color: '#dc2626', borderColor: '#dc2626' }}
            onClick={handleCancel}
          >
            Cancel Plan
          </button>
        )}
      </div>

      {/* Renewal alert */}
      {isExpiringSoon && plan.status === 'active' && (
        <div style={{ background: '#fffbeb', border: '1px solid #fef3c7', borderRadius: 8, padding: '12px 16px', marginBottom: 16, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
            <span style={{ fontSize: 16 }}>⚠️</span>
            <span style={{ fontSize: 13, color: '#92400e', fontWeight: 500 }}>
              Warranty expires in <strong>{daysRemaining} days</strong> — {plan.endDate ? new Date(plan.endDate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' }) : ''}
            </span>
          </div>
          {(isDealerOwner || isDealerStaff || isClient) && !cd.renewalRequested && (
            <button className="btn btn-p btn-sm" onClick={handleRenewalRequest}>
              Request Renewal
            </button>
          )}
          {cd.renewalRequested && (
            <span style={{ fontSize: 12, color: '#22c55e', fontWeight: 600 }}>Renewal Requested ✓</span>
          )}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left: Coverage details */}
        <div>
          {/* Days remaining + progress */}
          <div className="pn" style={{ marginBottom: 16, textAlign: 'center', padding: 24 }}>
            <div style={{ fontSize: 48, fontWeight: 700, color: barColor, marginBottom: 4, lineHeight: 1 }}>
              {plan.endDate ? daysRemaining : '—'}
            </div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>days remaining</div>
            <div style={{ height: 10, background: '#f0f0f0', borderRadius: 5, marginBottom: 8, overflow: 'hidden' }}>
              <div style={{ height: '100%', width: `${progressPct}%`, background: barColor, borderRadius: 5, transition: 'width 0.5s ease' }} />
            </div>
            <div style={{ fontSize: 12, color: '#888' }}>
              {plan.startDate ? new Date(plan.startDate).toLocaleDateString('en-CA') : '—'}
              {' → '}
              {plan.endDate ? new Date(plan.endDate).toLocaleDateString('en-CA') : '—'}
            </div>
          </div>

          {/* Coverage categories grid */}
          <div className="pn" style={{ marginBottom: 16 }}>
            <div className="pn-h"><span className="pn-t">Coverage Categories</span></div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, padding: 16 }}>
              {COVERAGE_CATEGORIES.map(cat => {
                const covered = cd[cat.key] !== false; // default true if not set
                return (
                  <div
                    key={cat.key}
                    style={{
                      border: `1px solid ${covered ? '#d1fae5' : '#f3f4f6'}`,
                      borderRadius: 8,
                      padding: '12px 14px',
                      background: covered ? '#f0fdf4' : '#fafafa',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 8,
                    }}
                  >
                    <span style={{ fontSize: 18 }}>{cat.icon}</span>
                    <div>
                      <div style={{ fontSize: 12, fontWeight: 600, color: covered ? '#065f46' : '#6b7280' }}>{cat.label}</div>
                      <div style={{ fontSize: 11, color: covered ? '#22c55e' : '#9ca3af', marginTop: 2 }}>
                        {covered ? '✓ Covered' : '✗ Not Covered'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Coverage detail text */}
          {plan.coverage && (
            <div className="pn">
              <div className="pn-h"><span className="pn-t">Coverage Details</span></div>
              <div style={{ padding: '16px 20px', fontSize: 13, color: '#555', lineHeight: 1.6 }}>
                <strong>Coverage Level:</strong> {plan.coverage}
                {cd.tier && cd.tier !== plan.coverage && (
                  <><br /><strong>Tier:</strong> {cd.tier}</>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Right: Plan info */}
        <div>
          <div className="cd-section" style={{ marginBottom: 16 }}>
            <div className="cd-section-h">Plan Info</div>
            <div className="cd-row"><span className="cd-label">Plan #</span><span className="cd-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{plan.planNumber}</span></div>
            <div className="cd-row"><span className="cd-label">Provider</span><span className="cd-value">{plan.provider}</span></div>
            <div className="cd-row"><span className="cd-label">Coverage</span><span className="cd-value">{plan.coverage || cd.tier || '—'}</span></div>
            <div className="cd-row"><span className="cd-label">Start Date</span><span className="cd-value">{plan.startDate ? new Date(plan.startDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span></div>
            <div className="cd-row"><span className="cd-label">Expiry</span><span className="cd-value">{plan.endDate ? new Date(plan.endDate).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</span></div>
            <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className={statusCls} style={{ fontSize: 11 }}>{statusLabel}</span></span></div>
            {cd.retailPrice && (
              <div className="cd-row"><span className="cd-label">Plan Price</span><span className="cd-value" style={{ fontWeight: 700, color: '#08235d' }}>${parseFloat(cd.retailPrice).toLocaleString('en-CA')}</span></div>
            )}
            <div className="cd-row">
              <span className="cd-label">Sold by Platform</span>
              <span className="cd-value" style={{ color: plan.soldByPlatform ? '#22c55e' : '#888', fontWeight: plan.soldByPlatform ? 600 : 400 }}>
                {plan.soldByPlatform ? 'Yes' : 'No'}
              </span>
            </div>
          </div>

          <div className="cd-section" style={{ marginBottom: 16 }}>
            <div className="cd-section-h">Unit Reference</div>
            <div className="cd-row"><span className="cd-label">Unit ID</span><span className="cd-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>{plan.unitId}</span></div>
            <div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value" style={{ fontFamily: 'monospace', fontSize: 11 }}>{plan.dealershipId.slice(0, 12)}…</span></div>
          </div>

          {cd.renewalRequested && (
            <div className="cd-section">
              <div className="cd-section-h">Renewal</div>
              <div className="cd-row">
                <span className="cd-label">Requested</span>
                <span className="cd-value" style={{ color: '#22c55e', fontWeight: 600 }}>Yes</span>
              </div>
              {cd.renewalRequestedAt && (
                <div className="cd-row">
                  <span className="cd-label">Requested On</span>
                  <span className="cd-value">{new Date(cd.renewalRequestedAt).toLocaleDateString('en-CA')}</span>
                </div>
              )}
            </div>
          )}

          {/* Actions */}
          <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
            {(isDealerOwner || isDealerStaff || isClient) && isExpiringSoon && plan.status === 'active' && !cd.renewalRequested && (
              <button className="btn btn-p btn-sm" style={{ width: '100%' }} onClick={handleRenewalRequest}>
                Request Renewal
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
