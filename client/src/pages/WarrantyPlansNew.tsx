// client/src/pages/WarrantyPlansNew.tsx — Add / Sell Warranty Plan (operator_admin only)

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function WarrantyPlansNew() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const isOperatorAdmin = user?.role === 'operator_admin';

  const [planType, setPlanType]         = useState<'sell' | 'register'>('sell');
  const [unitId, setUnitId]             = useState('');
  const [provider, setProvider]         = useState('Guardsman RV');
  const [coverage, setCoverage]         = useState('Comprehensive');
  const [tier, setTier]                 = useState('Comprehensive');
  const [startDate, setStartDate]       = useState('');
  const [endDate, setEndDate]           = useState('');
  const [ourCost, setOurCost]           = useState('');
  const [retailPrice, setRetailPrice]   = useState('');
  const [notes, setNotes]               = useState('');
  const [coversStructural, setCoversStructural] = useState(true);
  const [coversPlumbing, setCoversPlumbing]     = useState(true);
  const [coversElectrical, setCoversElectrical] = useState(true);
  const [coversHvac, setCoversHvac]             = useState(true);
  const [coversAppliances, setCoversAppliances] = useState(true);
  const [coversSlideOuts, setCoversSlideOuts]   = useState(true);
  const [saving, setSaving]             = useState(false);

  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const handleBack = () => {
    const segs = location.split('/');
    const idx = segs.indexOf('svc-warranty-new');
    if (idx >= 0) navigate(segs.slice(0, idx).join('/') + '/svc-warranty');
    else navigate(-1 as any);
  };

  if (!isOperatorAdmin) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>Operator Admin access required.</div>
      </div>
    );
  }

  const handleSave = async () => {
    if (!unitId.trim()) { showToast('Unit ID is required'); return; }
    if (!startDate || !endDate) { showToast('Start and end dates are required'); return; }
    if (new Date(endDate) <= new Date(startDate)) { showToast('End date must be after start date'); return; }
    setSaving(true);
    try {
      const res = await apiFetch<any>('/api/warranty-plans', {
        method: 'POST',
        body: JSON.stringify({
          unitId: unitId.trim(),
          provider,
          coverage,
          startDate,
          endDate,
          soldByPlatform: planType === 'sell',
          status: 'active',
          customData: {
            tier,
            ourCost: ourCost || null,
            retailPrice: retailPrice || null,
            notes: notes || null,
            planType,
            coversStructural,
            coversPlumbing,
            coversElectrical,
            coversHvac,
            coversAppliances,
            coversSlideOuts,
          },
        }),
      });
      showToast('Warranty plan saved');
      setTimeout(() => {
        if (res?.warrantyPlan?.id) {
          const segs = location.split('/');
          const idx = segs.indexOf('svc-warranty-new');
          const base = idx >= 0 ? segs.slice(0, idx).join('/') : '';
          navigate(`${base}/warranty-detail/${res.warrantyPlan.id}`);
        } else {
          handleBack();
        }
      }, 800);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save warranty plan');
    } finally {
      setSaving(false);
    }
  };

  const coverageCategories = [
    { key: 'structural', label: 'Structural', val: coversStructural, set: setCoversStructural },
    { key: 'plumbing', label: 'Plumbing', val: coversPlumbing, set: setCoversPlumbing },
    { key: 'electrical', label: 'Electrical', val: coversElectrical, set: setCoversElectrical },
    { key: 'hvac', label: 'HVAC', val: coversHvac, set: setCoversHvac },
    { key: 'appliances', label: 'Appliances', val: coversAppliances, set: setCoversAppliances },
    { key: 'slideOuts', label: 'Slide-Outs', val: coversSlideOuts, set: setCoversSlideOuts },
  ];

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#08235d', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">Add / Sell Warranty Plan</div>
          <div className="detail-meta">Register an existing plan or sell a new one through the platform</div>
        </div>
      </div>

      <div className="pn">
        <div className="form-grid">
          {/* Plan type */}
          <div className="form-group full" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Plan Type</label>
            <select
              style={{ marginTop: 6, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa' }}
              value={planType}
              onChange={e => setPlanType(e.target.value as 'sell' | 'register')}
            >
              <option value="sell">Sell New Plan (we earn commission)</option>
              <option value="register">Register Existing Plan (track only)</option>
            </select>
          </div>

          {/* Unit */}
          <div className="form-group">
            <label>Unit ID *</label>
            <input value={unitId} onChange={e => setUnitId(e.target.value)} placeholder="Unit UUID from platform" />
          </div>

          {/* Provider */}
          <div className="form-group">
            <label>Provider</label>
            <select value={provider} onChange={e => setProvider(e.target.value)}>
              <option>Guardsman RV</option>
              <option>XtraRide</option>
              <option>Wholesale Warranties</option>
              <option>Jayco OEM</option>
              <option>Forest River OEM</option>
              <option>Heartland OEM</option>
              <option>Keystone OEM</option>
              <option>Other…</option>
            </select>
          </div>

          {/* Coverage */}
          <div className="form-group">
            <label>Coverage Level</label>
            <select value={coverage} onChange={e => setCoverage(e.target.value)}>
              <option>Comprehensive</option>
              <option>Powertrain+</option>
              <option>Gold</option>
              <option>Platinum</option>
              <option>OEM Standard</option>
              <option>Basic</option>
            </select>
          </div>

          {/* Tier */}
          <div className="form-group">
            <label>Tier</label>
            <select value={tier} onChange={e => setTier(e.target.value)}>
              <option>Basic</option>
              <option>Standard</option>
              <option>Comprehensive</option>
              <option>Premium</option>
            </select>
          </div>

          {/* Dates */}
          <div className="form-group">
            <label>Start Date *</label>
            <input type="date" value={startDate} onChange={e => setStartDate(e.target.value)} />
          </div>
          <div className="form-group">
            <label>Expiry Date *</label>
            <input type="date" value={endDate} onChange={e => setEndDate(e.target.value)} />
          </div>

          {/* Pricing (only relevant for sell) */}
          {planType === 'sell' && (
            <>
              <div className="form-group">
                <label>Our Cost</label>
                <input value={ourCost} onChange={e => setOurCost(e.target.value)} placeholder="$0.00" />
              </div>
              <div className="form-group">
                <label>Retail Price (to customer)</label>
                <input value={retailPrice} onChange={e => setRetailPrice(e.target.value)} placeholder="$0.00" />
              </div>
            </>
          )}

          {/* Notes */}
          <div className="form-group full">
            <label>Notes</label>
            <textarea value={notes} onChange={e => setNotes(e.target.value)} placeholder="Plan details, special terms, renewal instructions…" />
          </div>
        </div>

        {/* Coverage categories */}
        <div style={{ padding: '16px 20px 0', borderTop: '1px solid #f0f0f0', marginTop: 8 }}>
          <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#333' }}>Coverage Categories</div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10, marginBottom: 16 }}>
            {coverageCategories.map(cat => (
              <label key={cat.key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer', padding: '8px 12px', border: `1px solid ${cat.val ? '#d1fae5' : '#e5e7eb'}`, borderRadius: 6, background: cat.val ? '#f0fdf4' : '#fafafa' }}>
                <input type="checkbox" checked={cat.val} onChange={e => cat.set(e.target.checked)} />
                <span style={{ color: cat.val ? '#065f46' : '#6b7280' }}>{cat.label}</span>
              </label>
            ))}
          </div>
        </div>

        <div className="btn-bar">
          <button className="btn btn-p" onClick={handleSave} disabled={saving}>
            {saving ? 'Saving…' : 'Save Plan'}
          </button>
          <button className="btn btn-o" onClick={handleBack}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
