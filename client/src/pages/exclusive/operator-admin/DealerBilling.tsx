import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function DealerBilling() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const isOperatorAdmin = user?.role === 'operator_admin';

  // Derive dealerId from URL: /operator/admin/dealers/:dealerId/billing
  const dealerId = (() => {
    const segs = location.split('/');
    const idx = segs.indexOf('dealers');
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  const [dealer, setDealer] = useState<any | null>(null);
  const [pricing, setPricing] = useState<any | null>(null);
  const [pricingForm, setPricingForm] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  useEffect(() => {
    if (!dealerId) return;
    Promise.all([
      apiFetch<any>(`/api/dealerships/${dealerId}`),
      apiFetch<any>(`/api/dealerships/${dealerId}/pricing`),
    ]).then(([dData, pData]) => {
      const d = dData.dealership || dData;
      setDealer(d);
      setPricing(pData);
      setPricingForm({
        plan: pData.plan || d.plan || 'plan_a',
        monthlyFee: pData.monthlyFee || d.monthlyFee || '349.00',
        claimFeePercent: pData.claimFeePercent || '10',
        claimFeeMin: pData.claimFeeMin || '50',
        claimFeeMax: pData.claimFeeMax || '500',
        dafFee: pData.dafFee || '25',
        pdiFee: pData.pdiFee || '15',
      });
    }).catch(() => {});
  }, [dealerId]);

  const handleSavePricing = async () => {
    if (!dealerId) return;
    setSaving(true);
    try {
      await apiFetch(`/api/dealerships/${dealerId}/pricing`, {
        method: 'PATCH',
        body: JSON.stringify(pricingForm),
      });
      showToast('Fee schedule saved');
    } catch {
      showToast('Failed to save fees');
    } finally {
      setSaving(false);
    }
  };

  if (!isOperatorAdmin) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#dc2626', fontWeight: 600, fontSize: 16 }}>
        Access Denied
      </div>
    );
  }

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
          {toastMsg}
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
        {/* Subscription */}
        <div style={{ borderRight: '1px solid #f0f0f0' }}>
          <div className="cd-section-h" style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600 }}>Subscription</div>
          <div className="cd-row"><span className="cd-label">Plan</span><span className="cd-value" style={{ color: 'var(--brand)', fontWeight: 600 }}>{pricingForm.plan === 'plan_b' ? 'Plan B — Pre-Funded Wallet' : 'Plan A — Monthly'}</span></div>
          <div className="cd-row"><span className="cd-label">Monthly Fee</span><span className="cd-value">${parseFloat(pricingForm.monthlyFee || '349').toFixed(2)}/mo</span></div>
          <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className={`bg ${dealer?.status || 'active'}`}>{dealer?.status || '—'}</span></span></div>
          <div className="cd-row"><span className="cd-label">Stripe Customer</span><span className="cd-value" style={{ fontSize: 12, color: '#888' }}>{dealer?.stripeCustomerId || 'Not connected'}</span></div>
          <div style={{ padding: '14px 20px' }}>
            <div className="form-grid" style={{ padding: 0, maxWidth: 320 }}>
              <div className="form-group">
                <label style={{ fontSize: 12 }}>Plan</label>
                <select value={pricingForm.plan || 'plan_a'} onChange={e => setPricingForm(f => ({ ...f, plan: e.target.value }))}>
                  <option value="plan_a">Plan A — Monthly</option>
                  <option value="plan_b">Plan B — Pre-Funded Wallet</option>
                  <option value="custom">Custom</option>
                </select>
              </div>
              <div className="form-group">
                <label style={{ fontSize: 12 }}>Monthly Fee ($)</label>
                <input type="number" value={pricingForm.monthlyFee || ''} onChange={e => setPricingForm(f => ({ ...f, monthlyFee: e.target.value }))} />
              </div>
            </div>
          </div>
        </div>

        {/* Claim Fee Schedule */}
        <div>
          <div className="cd-section-h" style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600 }}>Claim Fee Schedule</div>
          <div className="form-grid" style={{ padding: '14px 20px' }}>
            <div className="form-group">
              <label style={{ fontSize: 12 }}>Per-Claim Fee (%)</label>
              <input type="number" value={pricingForm.claimFeePercent || ''} onChange={e => setPricingForm(f => ({ ...f, claimFeePercent: e.target.value }))} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: 12 }}>Min Fee ($)</label>
              <input type="number" value={pricingForm.claimFeeMin || ''} onChange={e => setPricingForm(f => ({ ...f, claimFeeMin: e.target.value }))} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: 12 }}>Max Fee Cap ($)</label>
              <input type="number" value={pricingForm.claimFeeMax || ''} onChange={e => setPricingForm(f => ({ ...f, claimFeeMax: e.target.value }))} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: 12 }}>DAF Fee ($)</label>
              <input type="number" value={pricingForm.dafFee || ''} onChange={e => setPricingForm(f => ({ ...f, dafFee: e.target.value }))} />
            </div>
            <div className="form-group">
              <label style={{ fontSize: 12 }}>PDI Fee ($)</label>
              <input type="number" value={pricingForm.pdiFee || ''} onChange={e => setPricingForm(f => ({ ...f, pdiFee: e.target.value }))} />
            </div>
          </div>
        </div>
      </div>

      <div className="btn-bar">
        <button className="btn btn-p" onClick={handleSavePricing} disabled={saving}>{saving ? 'Saving…' : 'Save Fee Schedule'}</button>
      </div>
    </div>
  );
}
