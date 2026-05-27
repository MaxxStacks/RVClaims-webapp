import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function UnitNew() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  // ─── Role guard ───────────────────────────────────────────────────────────
  const isDealerOwner = user?.role === 'dealer_owner';
  const isOperatorAdmin = user?.role === 'operator_admin';
  const isOperatorStaff = user?.role === 'operator_staff';
  const canAdd = isDealerOwner || isOperatorAdmin || isOperatorStaff;

  // Operator needs to pick a dealer — dealer_owner uses their own dealershipId
  const [dealers, setDealers] = useState<any[]>([]);
  const showDealerPicker = isOperatorAdmin || isOperatorStaff;

  useEffect(() => {
    if (showDealerPicker) {
      apiFetch<any>('/api/dealerships')
        .then(d => setDealers(Array.isArray(d) ? d : d.dealerships || []))
        .catch(() => {});
    }
  }, [showDealerPicker]);

  const [form, setForm] = useState({
    vin: '',
    year: '',
    manufacturer: '',
    model: '',
    rvType: '',
    stockNumber: '',
    status: 'in_inventory',
    lotLocation: '',
    dealershipId: '',
    // Customer
    customerName: '',
    customerEmail: '',
    customerPhone: '',
    // Warranty
    deliveryDate: '',
    warrantyStart: '',
    warrantyEnd: '',
    extendedWarrantyPlan: '',
    extWarrantyEnd: '',
  });

  const [saving, setSaving] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const set = (key: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) =>
    setForm(f => ({ ...f, [key]: e.target.value }));

  // ─── Navigate back to units list ──────────────────────────────────────────
  const goToUnits = () => {
    const segments = location.split('/').filter(Boolean);
    const newIdx = segments.indexOf('new');
    if (newIdx >= 0) {
      navigate('/' + segments.slice(0, newIdx).join('/'));
    } else {
      navigate(-1 as any);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    // Validation
    if (!form.vin.trim()) { setErrorMsg('VIN is required.'); return; }
    if (form.vin.trim().length !== 17) { setErrorMsg('VIN must be exactly 17 characters.'); return; }
    if (!form.year) { setErrorMsg('Year is required.'); return; }
    if (!form.manufacturer) { setErrorMsg('Manufacturer is required.'); return; }
    if (showDealerPicker && !form.dealershipId) { setErrorMsg('Please select a dealership.'); return; }

    setSaving(true);
    try {
      const payload: Record<string, any> = {
        vin: form.vin.trim().toUpperCase(),
        year: form.year,
        manufacturer: form.manufacturer,
        model: form.model || undefined,
        rvType: form.rvType || undefined,
        stockNumber: form.stockNumber || undefined,
        status: form.status || 'in_inventory',
        lotLocation: form.lotLocation || undefined,
        warrantyStart: form.warrantyStart || undefined,
        warrantyEnd: form.warrantyEnd || undefined,
        extendedWarrantyPlan: form.extendedWarrantyPlan || undefined,
        extWarrantyEnd: form.extWarrantyEnd || undefined,
        intakeDate: form.deliveryDate || undefined,
      };

      // Dealer: scope to their own dealership
      if (isDealerOwner && user?.dealershipId) {
        payload.dealershipId = user.dealershipId;
      } else if (showDealerPicker) {
        payload.dealershipId = form.dealershipId;
      }

      const res = await apiFetch<any>('/api/units', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      const newUnitId = res.id;
      showToast('Unit added successfully');

      // Navigate to unit detail
      const segments = location.split('/').filter(Boolean);
      const newIdx = segments.indexOf('new');
      if (newIdx >= 0 && newUnitId) {
        const base = '/' + segments.slice(0, newIdx - 1).join('/'); // go up past 'units'
        navigate(`${base}/units/${newUnitId}`);
      } else {
        goToUnits();
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to add unit. Please try again.');
      setSaving(false);
    }
  };

  // ─── Access denied ────────────────────────────────────────────────────────
  if (!canAdd) {
    return (
      <div className="page active">
        <div style={{ padding: 48, textAlign: 'center' }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: '#dc2626', marginBottom: 8 }}>Access Denied</div>
          <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>Only Dealer Owners and Operators can add units.</div>
          <button className="btn btn-o btn-sm" onClick={goToUnits}>← Back to Units</button>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={goToUnits}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">Add New Unit</div>
          <div className="detail-meta">Register a unit on the platform</div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        {errorMsg && (
          <div style={{ margin: '0 0 16px 0', padding: '12px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
            {errorMsg}
          </div>
        )}

        <div className="pn">
          {/* Vehicle section */}
          <div className="form-grid c3">
            <div className="form-group full" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>Vehicle Information</label>
            </div>

            <div className="form-group">
              <label>VIN <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                placeholder="17-character VIN"
                value={form.vin}
                onChange={set('vin')}
                maxLength={17}
                style={{ fontFamily: 'monospace' }}
              />
              {form.vin.length > 0 && form.vin.length !== 17 && (
                <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4 }}>{form.vin.length}/17 characters</div>
              )}
            </div>

            <div className="form-group">
              <label>Year <span style={{ color: '#dc2626' }}>*</span></label>
              <input placeholder="2024" value={form.year} onChange={set('year')} />
            </div>

            <div className="form-group">
              <label>Manufacturer <span style={{ color: '#dc2626' }}>*</span></label>
              <select value={form.manufacturer} onChange={set('manufacturer')}>
                <option value="">Select...</option>
                <option>Jayco</option>
                <option>Forest River</option>
                <option>Heartland</option>
                <option>Keystone</option>
                <option>Columbia NW</option>
                <option>Midwest Auto</option>
              </select>
            </div>

            <div className="form-group">
              <label>Model</label>
              <input placeholder="Jay Flight 264BH" value={form.model} onChange={set('model')} />
            </div>

            <div className="form-group">
              <label>RV Type</label>
              <select value={form.rvType} onChange={set('rvType')}>
                <option value="">Select...</option>
                <option>Travel Trailer</option>
                <option>Fifth Wheel</option>
                <option>Class A</option>
                <option>Class C</option>
                <option>Van Camper</option>
                <option>Small Trailer</option>
                <option>Pop Up</option>
                <option>Toy Hauler</option>
                <option>Truck Camper</option>
                <option>Destination Trailer</option>
              </select>
            </div>

            <div className="form-group">
              <label>Stock #</label>
              <input placeholder="STK-0000" value={form.stockNumber} onChange={set('stockNumber')} />
            </div>

            <div className="form-group">
              <label>Lot Location</label>
              <input placeholder="Lot B, Row 3" value={form.lotLocation} onChange={set('lotLocation')} />
            </div>

            <div className="form-group">
              <label>Status</label>
              <select value={form.status} onChange={set('status')}>
                <option value="in_inventory">In Inventory</option>
                <option value="sold">Sold</option>
                <option value="in_service">In Service</option>
                <option value="consigned">Consigned</option>
              </select>
            </div>

            {showDealerPicker && (
              <div className="form-group">
                <label>Dealership <span style={{ color: '#dc2626' }}>*</span></label>
                <select value={form.dealershipId} onChange={set('dealershipId')}>
                  <option value="">Select dealership...</option>
                  {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                </select>
              </div>
            )}
          </div>

          {/* Warranty section */}
          <div className="form-grid c3" style={{ borderTop: '1px solid #f0f0f0', paddingTop: 16, marginTop: 8 }}>
            <div className="form-group full" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12 }}>
              <label style={{ fontWeight: 600, fontSize: 13 }}>Warranty & Dates</label>
            </div>

            <div className="form-group">
              <label>Delivery / Intake Date</label>
              <input type="date" value={form.deliveryDate} onChange={set('deliveryDate')} />
            </div>

            <div className="form-group">
              <label>Mfr Warranty Start</label>
              <input type="date" value={form.warrantyStart} onChange={set('warrantyStart')} />
            </div>

            <div className="form-group">
              <label>Mfr Warranty Expiry</label>
              <input type="date" value={form.warrantyEnd} onChange={set('warrantyEnd')} />
            </div>

            <div className="form-group">
              <label>Ext. Warranty Provider</label>
              <input placeholder="Provider name" value={form.extendedWarrantyPlan} onChange={set('extendedWarrantyPlan')} />
            </div>

            <div className="form-group">
              <label>Ext. Warranty Expiry</label>
              <input type="date" value={form.extWarrantyEnd} onChange={set('extWarrantyEnd')} />
            </div>
          </div>

          <div className="btn-bar">
            <button type="submit" className="btn btn-p" disabled={saving}>
              {saving ? 'Adding Unit...' : 'Add Unit'}
            </button>
            <button type="button" className="btn btn-o" onClick={goToUnits}>Cancel</button>
            <div style={{ marginLeft: 'auto', fontSize: 12, color: '#888' }}>
              After adding, you can upload documents and photos from the Unit Detail page.
            </div>
          </div>
        </div>
      </form>
    </div>
  );
}
