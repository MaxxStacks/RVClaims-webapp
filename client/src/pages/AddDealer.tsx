import { useState } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function AddDealer() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const isOperatorAdmin = user?.role === 'operator_admin';

  const [saving, setSaving] = useState(false);
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const [form, setForm] = useState({
    name: '',
    legalName: '',
    contactName: '',
    email: '',
    phone: '',
    website: '',
    businessNumber: '',
    addressLine1: '',
    city: '',
    stateProvince: '',
    postalCode: '',
    country: 'CA',
    plan: 'plan_a',
    monthlyFee: '349.00',
    claimFeePercent: '10',
    claimFeeMin: '50.00',
    claimFeeMax: '500.00',
    dafFee: '25.00',
    pdiFee: '15.00',
    notes: '',
  });

  if (!isOperatorAdmin) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 300, color: '#dc2626', fontWeight: 600, fontSize: 16 }}>
        Access Denied
      </div>
    );
  }

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  // Derive base path from current location
  const basePath = location.startsWith('/operator/admin') ? '/operator/admin' : '/operator/staff';

  const handleCreate = async () => {
    if (!form.name.trim() || !form.email.trim()) {
      showToast('Dealership name and email are required');
      return;
    }
    setSaving(true);
    try {
      const created = await apiFetch<any>('/api/dealerships', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          legalName: form.legalName || undefined,
          email: form.email,
          phone: form.phone || undefined,
          website: form.website || undefined,
          businessNumber: form.businessNumber || undefined,
          addressLine1: form.addressLine1 || undefined,
          city: form.city || undefined,
          stateProvince: form.stateProvince || undefined,
          postalCode: form.postalCode || undefined,
          country: form.country,
          contactName: form.contactName || undefined,
        }),
      });

      // Update pricing if customized
      if (created?.id) {
        try {
          await apiFetch(`/api/dealerships/${created.id}/pricing`, {
            method: 'PATCH',
            body: JSON.stringify({
              plan: form.plan,
              monthlyFee: form.monthlyFee,
              claimFeePercent: form.claimFeePercent,
              claimFeeMin: form.claimFeeMin,
              claimFeeMax: form.claimFeeMax,
              dafFee: form.dafFee,
              pdiFee: form.pdiFee,
            }),
          });
        } catch {}
        navigate(`${basePath}/dealers/${created.id}`);
      } else {
        navigate(`${basePath}/dealers`);
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create dealer');
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate(`${basePath}/dealers`)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">Add New Dealer</div>
          <div className="detail-meta">Create a new dealership account</div>
        </div>
      </div>

      <div className="pn">
        <div className="form-grid">
          {/* Business Info */}
          <div className="form-group full" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Business Information</label>
          </div>
          <div className="form-group"><label>Dealership Name *</label><input value={form.name} onChange={set('name')} placeholder="Smith's RV Centre" /></div>
          <div className="form-group"><label>Legal Name</label><input value={form.legalName} onChange={set('legalName')} placeholder="Smith's RV Centre Inc." /></div>
          <div className="form-group"><label>Business Email *</label><input type="email" value={form.email} onChange={set('email')} placeholder="dealer@example.com" /></div>
          <div className="form-group"><label>Business Phone</label><input value={form.phone} onChange={set('phone')} placeholder="(555) 000-0000" /></div>
          <div className="form-group"><label>Website</label><input value={form.website} onChange={set('website')} placeholder="https://smithsrv.ca" /></div>
          <div className="form-group"><label>Business Number</label><input value={form.businessNumber} onChange={set('businessNumber')} placeholder="12345 6789 RT0001" /></div>

          {/* Primary Contact */}
          <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Primary Contact</label>
          </div>
          <div className="form-group"><label>Contact Name</label><input value={form.contactName} onChange={set('contactName')} placeholder="Full name" /></div>

          {/* Address */}
          <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Address</label>
          </div>
          <div className="form-group"><label>Street Address</label><input value={form.addressLine1} onChange={set('addressLine1')} placeholder="123 Main Street" /></div>
          <div className="form-group"><label>City</label><input value={form.city} onChange={set('city')} placeholder="Toronto" /></div>
          <div className="form-group"><label>Province / State</label><input value={form.stateProvince} onChange={set('stateProvince')} placeholder="ON" /></div>
          <div className="form-group"><label>Postal Code</label><input value={form.postalCode} onChange={set('postalCode')} placeholder="M5V 3L9" /></div>
          <div className="form-group">
            <label>Country</label>
            <select value={form.country} onChange={set('country')}>
              <option value="CA">Canada</option>
              <option value="US">United States</option>
            </select>
          </div>

          {/* Subscription & Pricing */}
          <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16 }}>
            <label style={{ fontWeight: 600, fontSize: 13 }}>Subscription & Pricing</label>
          </div>
          <div className="form-group">
            <label>Plan</label>
            <select value={form.plan} onChange={set('plan')}>
              <option value="plan_a">Plan A — Monthly ($349/mo)</option>
              <option value="plan_b">Plan B — Pre-Funded Wallet</option>
              <option value="custom">Custom</option>
            </select>
          </div>
          <div className="form-group"><label>Monthly Fee ($)</label><input type="number" value={form.monthlyFee} onChange={set('monthlyFee')} /></div>
          <div className="form-group"><label>Claim Fee (%)</label><input type="number" value={form.claimFeePercent} onChange={set('claimFeePercent')} /></div>
          <div className="form-group"><label>Min Fee ($)</label><input type="number" value={form.claimFeeMin} onChange={set('claimFeeMin')} /></div>
          <div className="form-group"><label>Max Fee Cap ($)</label><input type="number" value={form.claimFeeMax} onChange={set('claimFeeMax')} /></div>
          <div className="form-group"><label>DAF Fee ($)</label><input type="number" value={form.dafFee} onChange={set('dafFee')} /></div>
          <div className="form-group"><label>PDI Fee ($)</label><input type="number" value={form.pdiFee} onChange={set('pdiFee')} /></div>

          {/* Notes */}
          <div className="form-group full" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16 }}>
            <label>Internal Notes</label>
            <textarea value={form.notes} onChange={set('notes')} placeholder="Internal notes about this dealership..." />
          </div>
        </div>

        <div className="btn-bar">
          <button className="btn btn-p" onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create Dealer'}</button>
          <button className="btn btn-o" onClick={() => navigate(`${basePath}/dealers`)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
