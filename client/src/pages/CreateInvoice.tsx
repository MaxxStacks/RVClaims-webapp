import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';

interface ServiceRow {
  id: string;
  type: 'service';
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

interface PartRow {
  id: string;
  type: 'part';
  partSearch: string;
  description: string;
  quantity: number;
  unitPrice: number;
  amount: number;
}

type LineRow = ServiceRow | PartRow;

const TAX_RATES: Record<string, number> = {
  'HST 13%': 0.13,
  'GST 5%': 0.05,
  'GST+QST': 0.14975,
  'No Tax': 0,
};

export default function CreateInvoice() {
  const [location, navigate] = useLocation();

  const [dealers, setDealers] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [selectedDealerId, setSelectedDealerId] = useState('');
  const [invoiceNumber, setInvoiceNumber] = useState(() => 'INV-' + new Date().getFullYear() + '-' + String(Math.floor(Math.random() * 9000) + 1000));
  const [invoiceDate, setInvoiceDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [paymentTerms, setPaymentTerms] = useState('On Receipt');
  const [paymentMethod, setPaymentMethod] = useState('stripe_card');
  const [selectedClaimId, setSelectedClaimId] = useState('');
  const [recurring, setRecurring] = useState('one_time');
  const [taxLabel, setTaxLabel] = useState('HST 13%');
  const [discount, setDiscount] = useState(0);
  const [notes, setNotes] = useState('');
  const [serviceRows, setServiceRows] = useState<ServiceRow[]>([]);
  const [partRows, setPartRows] = useState<PartRow[]>([]);
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

  useEffect(() => {
    apiFetch<any>('/api/dealerships')
      .then(d => setDealers(Array.isArray(d) ? d : []))
      .catch(() => setDealers([]));
    apiFetch<any>('/api/claims')
      .then(d => setClaims(Array.isArray(d) ? d : []))
      .catch(() => setClaims([]));
  }, []);

  const addServiceRow = () => {
    setServiceRows(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'service',
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    }]);
  };

  const addPartRow = () => {
    setPartRows(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'part',
      partSearch: '',
      description: '',
      quantity: 1,
      unitPrice: 0,
      amount: 0,
    }]);
  };

  const removeServiceRow = (id: string) => setServiceRows(prev => prev.filter(r => r.id !== id));
  const removePartRow = (id: string) => setPartRows(prev => prev.filter(r => r.id !== id));

  const updateServiceRow = (id: string, field: keyof ServiceRow, value: string | number) => {
    setServiceRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
      return updated;
    }));
  };

  const updatePartRow = (id: string, field: keyof PartRow, value: string | number) => {
    setPartRows(prev => prev.map(r => {
      if (r.id !== id) return r;
      const updated = { ...r, [field]: value };
      updated.amount = Number(updated.quantity) * Number(updated.unitPrice);
      return updated;
    }));
  };

  // Quick add preset items
  const quickAdd = (description: string, price: number) => {
    setServiceRows(prev => [...prev, {
      id: crypto.randomUUID(),
      type: 'service',
      description,
      quantity: 1,
      unitPrice: price,
      amount: price,
    }]);
  };

  const taxRate = TAX_RATES[taxLabel] ?? 0.13;
  const subtotal = [...serviceRows, ...partRows].reduce((sum, r) => sum + Number(r.amount), 0);
  const taxAmount = subtotal * taxRate;
  const total = subtotal + taxAmount - discount;

  const handleSave = async (sendNow = false) => {
    if (!selectedDealerId) {
      setErrorMsg('Please select a dealer.');
      return;
    }
    setErrorMsg(null);
    setSaving(true);
    try {
      const lineItems: any[] = [
        ...serviceRows.map(r => ({
          description: r.description,
          quantity: String(r.quantity),
          unitPrice: String(r.unitPrice),
          amount: String(r.amount),
          sortOrder: serviceRows.indexOf(r),
        })),
        ...partRows.map(r => ({
          description: r.partSearch ? `${r.partSearch} — ${r.description}` : r.description,
          quantity: String(r.quantity),
          unitPrice: String(r.unitPrice),
          amount: String(r.amount),
          sortOrder: serviceRows.length + partRows.indexOf(r),
        })),
      ];

      const res = await apiFetch<any>('/api/invoices', {
        method: 'POST',
        body: JSON.stringify({
          dealershipId: selectedDealerId,
          claimId: selectedClaimId || undefined,
          subtotal: String(subtotal.toFixed(2)),
          taxRate: String((taxRate * 100).toFixed(2)),
          taxAmount: String(taxAmount.toFixed(2)),
          discount: discount > 0 ? String(discount.toFixed(2)) : undefined,
          total: String(total.toFixed(2)),
          paymentMethod,
          paymentTerms,
          notes: notes || undefined,
          recurring,
          lineItems,
        }),
      });

      if (res.success && res.invoice) {
        showToast(sendNow ? 'Invoice sent to dealer!' : 'Invoice saved as draft');
        setTimeout(() => {
          // Navigate back to invoices list — go up from current location
          const segments = location.split('/');
          const invoicesIdx = segments.indexOf('invoices');
          if (invoicesIdx >= 0) {
            navigate(segments.slice(0, invoicesIdx + 1).join('/'));
          } else {
            navigate('../invoices');
          }
        }, 900);
      } else {
        setErrorMsg('Failed to save invoice. Please try again.');
      }
    } catch (err: any) {
      setErrorMsg(err?.message || 'Failed to save invoice.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate('../invoices')}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">New Invoice</div>
          <div className="detail-meta">Create and send an invoice to a dealer</div>
        </div>
        <button className="btn btn-o btn-sm" onClick={() => showToast('Preview not available in this view')}>Preview</button>
        <button className="btn btn-p btn-sm" onClick={() => handleSave(true)} disabled={saving}>
          {saving ? 'Saving...' : 'Save & Send'}
        </button>
      </div>

      {errorMsg && (
        <div style={{ padding: '12px 20px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>
          {errorMsg}
        </div>
      )}

      {/* Header section */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 16, padding: '16px 20px', alignItems: 'end', borderBottom: '1px solid #f0f0f0' }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>Bill To</span>
            <select
              value={selectedDealerId}
              onChange={e => setSelectedDealerId(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa' }}
            >
              <option value="">Select dealer...</option>
              {dealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>Invoice #</span>
            <input
              value={invoiceNumber}
              onChange={e => setInvoiceNumber(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>Invoice Date</span>
            <input
              type="date"
              value={invoiceDate}
              onChange={e => setInvoiceDate(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa' }}
            />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>Payment Due</span>
            <select
              value={paymentTerms}
              onChange={e => setPaymentTerms(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa' }}
            >
              <option>On Receipt</option>
              <option>Net 15</option>
              <option>Net 30</option>
            </select>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
            <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>Payment Method</span>
            <select
              value={paymentMethod}
              onChange={e => setPaymentMethod(e.target.value)}
              style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa' }}
            >
              <option value="stripe_card">Charge card (Stripe)</option>
              <option value="email_invoice">Send via email</option>
              <option value="wallet">Deduct from wallet</option>
              <option value="etransfer">Interac e-Transfer</option>
            </select>
          </div>
        </div>

        {/* Quick add + related */}
        <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
          <span style={{ fontSize: 12, color: '#888', fontWeight: 500, marginRight: 4 }}>Quick Add:</span>
          <button className="btn btn-o btn-sm" style={{ fontSize: 11 }} onClick={() => quickAdd('Plan A Monthly Subscription', 349)}>Plan A ($349)</button>
          <button className="btn btn-o btn-sm" style={{ fontSize: 11 }} onClick={() => quickAdd('Claim Processing Fee (10%)', 0)}>Claim Fee 10%</button>
          <button className="btn btn-o btn-sm" style={{ fontSize: 11 }} onClick={() => quickAdd('DAF Inspection Fee', 25)}>DAF ($25)</button>
          <button className="btn btn-o btn-sm" style={{ fontSize: 11 }} onClick={() => quickAdd('PDI Processing Fee', 15)}>PDI ($15)</button>
          <button className="btn btn-o btn-sm" style={{ fontSize: 11 }} onClick={() => quickAdd('Financing Services', 199)}>Financing ($199)</button>
          <button className="btn btn-o btn-sm" style={{ fontSize: 11 }} onClick={() => quickAdd('F&I Services', 299)}>F&I ($299)</button>
          <button className="btn btn-o btn-sm" style={{ fontSize: 11 }} onClick={() => quickAdd('Parts & Accessories', 149)}>Parts ($149)</button>
          <button className="btn btn-o btn-sm" style={{ fontSize: 11 }} onClick={addServiceRow}>Custom Item</button>
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center' }}>
            <span style={{ fontSize: 11, color: '#888' }}>Related:</span>
            <select
              value={selectedClaimId}
              onChange={e => setSelectedClaimId(e.target.value)}
              style={{ padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontFamily: 'inherit', background: '#fafafa' }}
            >
              <option value="">No claim</option>
              {claims.map(c => <option key={c.id} value={c.id}>{c.claimNumber}</option>)}
            </select>
            <select
              value={recurring}
              onChange={e => setRecurring(e.target.value)}
              style={{ padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontFamily: 'inherit', background: '#fafafa' }}
            >
              <option value="one_time">One-time</option>
              <option value="monthly">Monthly</option>
              <option value="quarterly">Quarterly</option>
              <option value="annual">Annual</option>
            </select>
          </div>
        </div>
      </div>

      {/* Line items table */}
      <div className="pn">
        <table style={{ width: '100%' }}>
          <thead>
            <tr>
              <th style={{ width: '45%' }}>Item</th>
              <th style={{ width: '10%', textAlign: 'center' }}>Qty</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Price</th>
              <th style={{ width: '18%', textAlign: 'right' }}>Amount</th>
              <th style={{ width: '9%' }}></th>
            </tr>
          </thead>
          <tbody>
            {/* Service rows */}
            {serviceRows.map(row => (
              <tr key={row.id}>
                <td style={{ padding: '14px 16px' }}>
                  <input
                    value={row.description}
                    onChange={e => updateServiceRow(row.id, 'description', e.target.value)}
                    placeholder="Service description..."
                    style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa' }}
                  />
                </td>
                <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={e => updateServiceRow(row.id, 'quantity', parseFloat(e.target.value) || 1)}
                    style={{ width: 50, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'center', fontFamily: 'inherit' }}
                  />
                </td>
                <td style={{ textAlign: 'right', padding: '14px 8px' }}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.unitPrice}
                    onChange={e => updateServiceRow(row.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    style={{ width: 90, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'right', fontFamily: 'inherit' }}
                  />
                </td>
                <td style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 600, fontSize: 13 }}>
                  ${Number(row.amount).toFixed(2)}
                </td>
                <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                  <button
                    onClick={() => removeServiceRow(row.id)}
                    style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18 }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}

            {/* Part rows */}
            {partRows.map(row => (
              <tr key={row.id}>
                <td style={{ padding: '14px 16px' }}>
                  <div style={{ position: 'relative' }}>
                    <input
                      value={row.partSearch}
                      onChange={e => updatePartRow(row.id, 'partSearch', e.target.value)}
                      placeholder="Search parts..."
                      style={{ width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', marginBottom: 6 }}
                    />
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{ position: 'absolute', left: 10, top: 10 }}>
                      <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
                    </svg>
                  </div>
                  <input
                    value={row.description}
                    onChange={e => updatePartRow(row.id, 'description', e.target.value)}
                    placeholder="Part description / notes..."
                    style={{ width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', color: '#555' }}
                  />
                </td>
                <td style={{ textAlign: 'center', padding: '14px 8px' }}>
                  <input
                    type="number"
                    min="1"
                    value={row.quantity}
                    onChange={e => updatePartRow(row.id, 'quantity', parseFloat(e.target.value) || 1)}
                    style={{ width: 50, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'center', fontFamily: 'inherit' }}
                  />
                </td>
                <td style={{ textAlign: 'right', padding: '14px 8px' }}>
                  <input
                    type="number"
                    min="0"
                    step="0.01"
                    value={row.unitPrice}
                    onChange={e => updatePartRow(row.id, 'unitPrice', parseFloat(e.target.value) || 0)}
                    style={{ width: 90, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'right', fontFamily: 'inherit' }}
                  />
                </td>
                <td style={{ textAlign: 'right', padding: '14px 16px', fontWeight: 600, fontSize: 13 }}>
                  ${Number(row.amount).toFixed(2)}
                </td>
                <td style={{ padding: '14px 8px', textAlign: 'center' }}>
                  <button
                    onClick={() => removePartRow(row.id)}
                    style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18 }}
                  >
                    ×
                  </button>
                </td>
              </tr>
            ))}

            {serviceRows.length === 0 && partRows.length === 0 && (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#888', fontSize: 13 }}>
                  No line items yet. Use Quick Add above or the buttons below to add items.
                </td>
              </tr>
            )}
          </tbody>
        </table>

        <div style={{ padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12 }}>
          <button
            style={{ background: 'none', border: 'none', color: 'var(--brand)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={addServiceRow}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="16" /><line x1="8" y1="12" x2="16" y2="12" />
            </svg>
            Add service / subscription
          </button>
          <button
            style={{ background: 'none', border: 'none', color: '#a855f7', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6 }}
            onClick={addPartRow}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" /><line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
            Search &amp; add part
          </button>
        </div>

        {/* Totals */}
        <div style={{ borderTop: '2px solid #f0f0f0', padding: 20 }}>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 40, marginBottom: 8, fontSize: 13 }}>
            <span style={{ color: '#888', width: 120, textAlign: 'right' }}>Subtotal</span>
            <span style={{ fontWeight: 500, width: 100, textAlign: 'right' }}>${subtotal.toFixed(2)}</span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 40, marginBottom: 8, fontSize: 13, alignItems: 'center' }}>
            <span style={{ color: '#888', width: 120, textAlign: 'right' }}>
              Tax
              <select
                value={taxLabel}
                onChange={e => setTaxLabel(e.target.value)}
                style={{ padding: '2px 6px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 11, fontFamily: 'inherit', marginLeft: 4 }}
              >
                <option>HST 13%</option>
                <option>GST 5%</option>
                <option>GST+QST</option>
                <option>No Tax</option>
              </select>
            </span>
            <span style={{ fontWeight: 500, width: 100, textAlign: 'right' }}>${taxAmount.toFixed(2)}</span>
          </div>
          {discount > 0 && (
            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 40, marginBottom: 8, fontSize: 13 }}>
              <span style={{ color: '#22c55e', width: 120, textAlign: 'right' }}>Discount</span>
              <span style={{ fontWeight: 500, width: 100, textAlign: 'right', color: '#22c55e' }}>-${discount.toFixed(2)}</span>
            </div>
          )}
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 40, marginBottom: 8, fontSize: 12 }}>
            <button
              style={{ color: 'var(--brand)', cursor: 'pointer', width: 120, textAlign: 'right', background: 'none', border: 'none', fontFamily: 'inherit', fontSize: 12 }}
              onClick={() => {
                const amt = parseFloat(prompt('Enter discount amount ($):') || '0') || 0;
                setDiscount(amt);
              }}
            >
              + Add discount
            </button>
            <span style={{ width: 100 }}></span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 40, paddingTop: 12, borderTop: '1px solid #f0f0f0', fontSize: 16, fontWeight: 700 }}>
            <span>Total <span style={{ fontWeight: 400, fontSize: 12, color: '#888' }}>CAD</span></span>
            <span style={{ width: 100, textAlign: 'right' }}>${total.toFixed(2)}</span>
          </div>
        </div>

        {/* Notes */}
        <div style={{ borderTop: '1px solid #f0f0f0', padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6 }}>Notes / Terms</div>
          <textarea
            value={notes}
            onChange={e => setNotes(e.target.value)}
            placeholder="Enter notes or terms visible to the dealer..."
            style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none', background: '#fafafa' }}
          />
        </div>

        <div className="btn-bar">
          <button className="btn btn-p" onClick={() => handleSave(true)} disabled={saving}>
            {saving ? 'Saving...' : 'Save & Send'}
          </button>
          <button className="btn btn-o" onClick={() => handleSave(false)} disabled={saving}>
            Save Draft
          </button>
          <button className="btn btn-o" onClick={() => navigate('../invoices')}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
