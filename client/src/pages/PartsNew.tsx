// client/src/pages/PartsNew.tsx — Create Parts Order (Module 9)
// Access: operator_admin, dealer_owner, parts_dept

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface PartsItem {
  partNumber: string;
  description: string;
  quantity: number;
  unitCost: string;
}

export default function PartsNew() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const role = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isOperator      = role === 'operator_admin' || role === 'operator_staff';
  const isDealerOwner   = role === 'dealer_owner';
  const isPartsManager  = role === 'parts_dept';
  const canCreate       = isOperatorAdmin || isDealerOwner || isPartsManager;

  // Pre-populate from query string (e.g. ?claimId=xxx)
  const searchParams = new URLSearchParams(
    typeof window !== 'undefined' ? window.location.search : ''
  );
  const preClaimId = searchParams.get('claimId') || '';

  // Form state
  const [claimId, setClaimId]       = useState(preClaimId);
  const [supplier, setSupplier]     = useState('');
  const [priority, setPriority]     = useState<'normal' | 'urgent'>('normal');
  const [dealerNotes, setDealerNotes] = useState('');
  const [estimatedCost, setEstimatedCost] = useState('');
  const [items, setItems]           = useState<PartsItem[]>([
    { partNumber: '', description: '', quantity: 1, unitCost: '' },
  ]);

  // Operator: pick dealer
  const [dealers, setDealers]     = useState<any[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState('');

  // Claims for the selected dealer
  const [claims, setClaims]       = useState<any[]>([]);

  // Submission state
  const [isSaving, setIsSaving]   = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg]       = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Access guard
  if (!canCreate) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          You do not have permission to create parts orders.
        </div>
      </div>
    );
  }

  // Back navigation
  const handleBack = () => {
    const segs = location.split('/');
    const partsIdx = segs.findIndex(s => s === 'parts' || s === 'orders');
    if (partsIdx > 0) navigate(segs.slice(0, partsIdx + 1).join('/'));
    else navigate(-1 as any);
  };

  // Load dealers (operator only)
  useEffect(() => {
    if (!isOperator) return;
    apiFetch<any>('/api/dealerships')
      .then(d => setDealers(Array.isArray(d) ? d : d.dealerships || []))
      .catch(() => {});
  }, [isOperator]);

  // Load claims when dealership changes
  const dealershipId = isOperator ? selectedDealerId : user?.dealershipId;
  useEffect(() => {
    if (!dealershipId) return;
    apiFetch<any>(`/api/claims?dealershipId=${dealershipId}&limit=100`)
      .then(d => setClaims(Array.isArray(d) ? d : d.claims || []))
      .catch(() => {});
  }, [dealershipId]);

  // Item line management
  const addItem = () =>
    setItems(prev => [...prev, { partNumber: '', description: '', quantity: 1, unitCost: '' }]);
  const removeItem = (idx: number) =>
    setItems(prev => prev.filter((_, i) => i !== idx));
  const updateItem = (idx: number, field: keyof PartsItem, value: string | number) =>
    setItems(prev => prev.map((it, i) => i === idx ? { ...it, [field]: value } : it));

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveError(null);

    const validItems = items.filter(it => it.description.trim() || it.partNumber.trim());
    if (validItems.length === 0) {
      showToast('Add at least one item with a description or part number.');
      return;
    }

    const resolvedDealershipId = isOperator ? selectedDealerId : user?.dealershipId;
    if (!resolvedDealershipId) {
      showToast('Select a dealer first.');
      return;
    }

    setIsSaving(true);
    try {
      const payload: any = {
        dealershipId: resolvedDealershipId,
        claimId: claimId || null,
        supplier: supplier.trim() || null,
        priority,
        dealerNotes: dealerNotes.trim() || null,
        estimatedCost: estimatedCost ? parseFloat(estimatedCost) : null,
        items: validItems.map(it => ({
          partNumber: it.partNumber.trim() || 'MISC',
          description: it.description.trim() || null,
          quantity: it.quantity || 1,
          unitCost: it.unitCost ? parseFloat(it.unitCost) : null,
        })),
      };

      const order = await apiFetch<any>('/api/parts-orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });

      showToast('Parts order created.');

      // Navigate to the detail page
      const orderId = order?.id || order?.order?.id;
      if (orderId) {
        setTimeout(() => {
          const segs = location.split('/');
          const partsIdx = segs.findIndex(s => s === 'parts' || s === 'orders');
          if (partsIdx > 0) {
            navigate(`${segs.slice(0, partsIdx + 1).join('/')}/${orderId}`);
          } else {
            navigate(`/operator/admin/parts/${orderId}`);
          }
        }, 400);
      } else {
        handleBack();
      }
    } catch (err: any) {
      setSaveError(err?.message || 'Failed to create order.');
      showToast(err?.message || 'Failed to create order.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#033280', color: '#fff',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Detail header */}
      <div className="detail-header">
        <button className="detail-back" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">New Parts Order</div>
          <div className="detail-meta">
            {isOperator ? 'Create an order for a dealer' : 'Request or order parts for your dealership'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="pn">
          <div className="form-grid">
            {/* Operator: select dealer */}
            {isOperator && (
              <div className="form-group">
                <label>Dealer *</label>
                <select
                  value={selectedDealerId}
                  onChange={e => { setSelectedDealerId(e.target.value); setClaimId(''); }}
                  required
                >
                  <option value="">Select dealer…</option>
                  {dealers.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Related claim */}
            <div className="form-group">
              <label>Related Claim</label>
              {claims.length > 0 ? (
                <select value={claimId} onChange={e => setClaimId(e.target.value)}>
                  <option value="">None</option>
                  {claims.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.claimNumber} — {c.type?.toUpperCase()}
                    </option>
                  ))}
                </select>
              ) : (
                <input
                  value={claimId}
                  onChange={e => setClaimId(e.target.value)}
                  placeholder="Claim ID (optional)"
                />
              )}
            </div>

            {/* Supplier */}
            <div className="form-group">
              <label>Preferred Supplier</label>
              <input
                value={supplier}
                onChange={e => setSupplier(e.target.value)}
                placeholder="e.g. Jayco Direct, RV Wholesale, Local"
              />
            </div>

            {/* Priority */}
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value as 'normal' | 'urgent')}>
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>

            {/* Estimated cost */}
            <div className="form-group">
              <label>Estimated Cost ($)</label>
              <input
                type="number"
                step="0.01"
                min="0"
                value={estimatedCost}
                onChange={e => setEstimatedCost(e.target.value)}
                placeholder="0.00"
              />
            </div>

            {/* Notes */}
            <div className="form-group full">
              <label>Notes / Instructions</label>
              <textarea
                value={dealerNotes}
                onChange={e => setDealerNotes(e.target.value)}
                placeholder="Shipping instructions, preferences, urgency details…"
                rows={2}
              />
            </div>
          </div>

          {/* Line items */}
          <div style={{ padding: '0 0 16px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
              <div style={{ fontWeight: 600, fontSize: 14 }}>Parts to Order</div>
              <button type="button" className="btn btn-o btn-sm" onClick={addItem}>+ Add Line</button>
            </div>

            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Part #</th>
                    <th style={{ width: '40%' }}>Description *</th>
                    <th>Qty</th>
                    <th>Unit Cost ($)</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {items.map((item, idx) => (
                    <tr key={idx}>
                      <td>
                        <input
                          value={item.partNumber}
                          onChange={e => updateItem(idx, 'partNumber', e.target.value)}
                          placeholder="Optional"
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12, fontFamily: 'inherit' }}
                        />
                      </td>
                      <td>
                        <input
                          value={item.description}
                          onChange={e => updateItem(idx, 'description', e.target.value)}
                          placeholder="Part name or description"
                          style={{ width: '100%', padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12, fontFamily: 'inherit' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          min="1"
                          value={item.quantity}
                          onChange={e => updateItem(idx, 'quantity', parseInt(e.target.value, 10) || 1)}
                          style={{ width: 60, padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12, fontFamily: 'inherit' }}
                        />
                      </td>
                      <td>
                        <input
                          type="number"
                          step="0.01"
                          min="0"
                          value={item.unitCost}
                          onChange={e => updateItem(idx, 'unitCost', e.target.value)}
                          placeholder="0.00"
                          style={{ width: 80, padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12, fontFamily: 'inherit' }}
                        />
                      </td>
                      <td>
                        {items.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeItem(idx)}
                            style={{ background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer', fontSize: 16, padding: '0 4px' }}
                          >
                            ×
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {saveError && (
            <div style={{ padding: '10px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13, marginBottom: 12 }}>
              {saveError}
            </div>
          )}

          <div className="btn-bar">
            <button className="btn btn-p" type="submit" disabled={isSaving}>
              {isSaving ? 'Creating…' : 'Create Parts Order'}
            </button>
            <button className="btn btn-o" type="button" onClick={handleBack} disabled={isSaving}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
