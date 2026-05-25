// client/src/pages/FAndINew.tsx — Create new F&I Deal
// Access: dealer_owner + operator_admin only.
// dealer_staff / operator_staff / financial_manager → Access Denied.

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface FiProduct {
  id: string;
  name: string;
  description: string | null;
  price: string | null;
  billingFrequency: string;
}

interface DealerUnit {
  id: string;
  vin: string;
  year: number | null;
  manufacturer: string | null;
  model: string | null;
  customerName: string | null;
}

export default function FAndINew() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const role            = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isDealerOwner   = role === 'dealer_owner';
  const canCreate       = isOperatorAdmin || isDealerOwner;

  // Form state
  const [customerName, setCustomerName]   = useState('');
  const [selectedUnit, setSelectedUnit]   = useState('');
  const [salePrice, setSalePrice]         = useState('');
  const [financing, setFinancing]         = useState('');
  const [productsOffered, setProductsOffered] = useState('');
  const [notes, setNotes]                 = useState('');

  // Operator-only: dealer selector
  const [dealers, setDealers]             = useState<any[]>([]);
  const [selectedDealer, setSelectedDealer] = useState('');

  // Data
  const [products, setProducts]   = useState<FiProduct[]>([]);
  const [units, setUnits]         = useState<DealerUnit[]>([]);
  const [isSaving, setIsSaving]   = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Toast
  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  useEffect(() => {
    if (!canCreate) { setIsLoading(false); return; }
    const load = async () => {
      try {
        const [pData, uData] = await Promise.all([
          apiFetch<any>('/api/fi/products').catch(() => ({ products: [] })),
          apiFetch<any>(
            user?.dealershipId
              ? `/api/v6/units?dealershipId=${user.dealershipId}&limit=50`
              : '/api/v6/units?limit=50'
          ).catch(() => ({ units: [] })),
        ]);
        setProducts(Array.isArray(pData.products) ? pData.products : []);
        setUnits(Array.isArray(uData.units) ? uData.units : []);

        if (isOperatorAdmin) {
          const dData = await apiFetch<any>('/api/v6/dealerships').catch(() => ({ dealerships: [] }));
          setDealers(Array.isArray(dData.dealerships) ? dData.dealerships : []);
        }
      } catch (err) {
        console.error('FAndINew load error:', err);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [canCreate, isOperatorAdmin, user?.dealershipId]);

  // ── Guard ─────────────────────────────────────────────────────────────────────
  if (!canCreate) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          Only Dealer Owners and Operator Admins can create F&amp;I deals.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ color: '#888', fontSize: 14 }}>Loading…</div>
      </div>
    );
  }

  // ── Submit ────────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    if (!customerName.trim()) { showToast('Customer name is required'); return; }

    const dealershipId = isOperatorAdmin
      ? (selectedDealer || undefined)
      : user?.dealershipId;

    if (!dealershipId) {
      showToast(isOperatorAdmin ? 'Please select a dealer' : 'No dealership assigned to your account');
      return;
    }

    setIsSaving(true);
    try {
      const body: Record<string, unknown> = {
        customerName: customerName.trim(),
        dealershipId,
        status: 'flagged',
        productsOffered: parseInt(productsOffered) || 0,
        productsSold: 0,
      };
      if (selectedUnit) body.unitId = selectedUnit;
      if (salePrice.trim()) body.salePrice = salePrice.trim();
      if (financing.trim()) body.financing = financing.trim();
      if (notes.trim()) body.dealerNotes = notes.trim();

      const d = await apiFetch<any>('/api/fi-deals', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const newId = d.fiDeal?.id;
      showToast('F&I deal created');
      setTimeout(() => {
        if (newId) navigate(`../fi-detail/${newId}`);
        else navigate(isOperatorAdmin ? '../svc-fi' : '../fi');
      }, 800);
    } catch (err: any) {
      showToast(err?.message || 'Failed to create deal');
      setIsSaving(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────────
  return (
    <div className="page active">
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#08235d', color: '#fff',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate(isOperatorAdmin ? '../svc-fi' : '../fi')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">New F&amp;I Deal</div>
          <div className="detail-meta">Flag a deal for F&amp;I product recommendations</div>
        </div>
      </div>

      <div className="pn">
        <div className="form-grid">
          {/* Dealer selector (operator_admin only) */}
          {isOperatorAdmin && (
            <div className="form-group">
              <label>Dealer *</label>
              <select value={selectedDealer} onChange={e => setSelectedDealer(e.target.value)}>
                <option value="">Select dealership…</option>
                {dealers.map((d: any) => (
                  <option key={d.id} value={d.id}>{d.name}</option>
                ))}
              </select>
            </div>
          )}

          <div className="form-group">
            <label>Customer Name *</label>
            <input
              value={customerName}
              onChange={e => setCustomerName(e.target.value)}
              placeholder="Customer full name"
            />
          </div>

          <div className="form-group">
            <label>Unit (optional)</label>
            <select value={selectedUnit} onChange={e => setSelectedUnit(e.target.value)}>
              <option value="">Select unit…</option>
              {units.map(u => (
                <option key={u.id} value={u.id}>
                  {[u.year, u.manufacturer, u.model].filter(Boolean).join(' ')} — {u.vin}
                  {u.customerName ? ` (${u.customerName})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Sale Price</label>
            <input
              value={salePrice}
              onChange={e => setSalePrice(e.target.value)}
              placeholder="e.g. 38900.00"
            />
          </div>

          <div className="form-group">
            <label>Financing Source</label>
            <input
              value={financing}
              onChange={e => setFinancing(e.target.value)}
              placeholder="e.g. RBC 4.99%"
            />
          </div>

          <div className="form-group">
            <label>Products Offered (estimate)</label>
            <input
              type="number"
              min="0"
              value={productsOffered}
              onChange={e => setProductsOffered(e.target.value)}
              placeholder="0"
            />
          </div>

          {/* Products catalog reference */}
          {products.length > 0 && (
            <div className="form-group full">
              <label>Available F&amp;I Products (catalog reference)</label>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                {products.map(p => (
                  <div
                    key={p.id}
                    style={{
                      border: '1px solid #e0e0e0', borderRadius: 6,
                      padding: '6px 12px', fontSize: 12, color: '#444',
                      background: '#f9f9f9',
                    }}
                  >
                    {p.name}
                    {p.price && (
                      <span style={{ color: '#08235d', fontWeight: 600, marginLeft: 6 }}>
                        ${parseFloat(p.price).toLocaleString('en-CA')}
                      </span>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="form-group full">
            <label>Notes / Customer Preferences</label>
            <textarea
              value={notes}
              onChange={e => setNotes(e.target.value)}
              placeholder="What is the customer open to? Budget constraints? Any specific products they asked about?"
              rows={3}
            />
          </div>
        </div>

        <div className="btn-bar">
          <button
            className="btn btn-p"
            onClick={handleSubmit}
            disabled={isSaving}
          >
            {isSaving ? 'Creating Deal…' : 'Create Deal'}
          </button>
          <button
            className="btn btn-o"
            onClick={() => navigate(isOperatorAdmin ? '../svc-fi' : '../fi')}
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
