// client/src/pages/FinancingNew.tsx — New Financing Application form
// Access: dealer_owner and operator_admin only.
// Both fields customerId and unitId are required per business rules.

import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface Lender {
  id: string;
  name: string;
  active: boolean;
  minTermMonths: number | null;
  maxTermMonths: number | null;
}

interface Customer {
  id: string;
  name?: string;
  firstName?: string;
  lastName?: string;
  email?: string;
}

interface UnitOption {
  id: string;
  vin: string;
  year?: number | null;
  make?: string | null;
  model?: string | null;
}

function customerLabel(c: Customer): string {
  if (c.name) return c.name;
  const parts = [c.firstName, c.lastName].filter(Boolean);
  if (parts.length) return parts.join(' ');
  return c.email || c.id;
}

function unitLabel(u: UnitOption): string {
  const parts = [u.year ? String(u.year) : null, u.make, u.model].filter(Boolean);
  return parts.length ? `${parts.join(' ')} — ${u.vin}` : u.vin;
}

export default function FinancingNew() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  const role = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isDealerOwner   = role === 'dealer_owner';
  const canCreate       = isOperatorAdmin || isDealerOwner;

  // ── Form state ─────────────────────────────────────────────────────────────
  const [customerId, setCustomerId]         = useState('');
  const [unitId, setUnitId]                 = useState('');
  const [lenderId, setLenderId]             = useState('');
  const [amountRequested, setAmountReq]     = useState('');
  const [downPayment, setDownPayment]       = useState('');
  const [preferredTermMonths, setPrefTerm]  = useState('60');
  const [creditScore, setCreditScore]       = useState('');
  const [notes, setNotes]                   = useState('');
  const [saving, setSaving]                 = useState(false);

  // ── Selector data ──────────────────────────────────────────────────────────
  const [lenders, setLenders]       = useState<Lender[]>([]);
  const [customers, setCustomers]   = useState<Customer[]>([]);
  const [units, setUnits]           = useState<UnitOption[]>([]);
  const [dealers, setDealers]       = useState<any[]>([]);
  const [dealershipId, setDealershipId] = useState(user?.dealershipId || '');

  // Toast
  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Load active lenders
  useEffect(() => {
    apiFetch<any>('/api/financing/lenders')
      .then(d => setLenders((Array.isArray(d.lenders) ? d.lenders : []).filter((l: Lender) => l.active)))
      .catch(() => {});
  }, []);

  // Load dealerships list (operator_admin only)
  useEffect(() => {
    if (!isOperatorAdmin) return;
    apiFetch<any>('/api/v6/dealerships')
      .then(d => setDealers(Array.isArray(d) ? d : d.dealerships || []))
      .catch(() => {});
  }, [isOperatorAdmin]);

  // Resolve dealershipId when operator selects a dealer
  useEffect(() => {
    if (!isOperatorAdmin && user?.dealershipId) {
      setDealershipId(user.dealershipId);
    }
  }, [isOperatorAdmin, user?.dealershipId]);

  // Load customers when dealershipId is set
  useEffect(() => {
    if (!dealershipId) return;
    apiFetch<any>(`/api/v6/users?dealershipId=${dealershipId}&role=client`)
      .then(d => setCustomers(Array.isArray(d) ? d : d.users || d.customers || []))
      .catch(() => {});
  }, [dealershipId]);

  // Load units when dealershipId is set
  useEffect(() => {
    if (!dealershipId) return;
    apiFetch<any>(`/api/v6/units?dealershipId=${dealershipId}`)
      .then(d => setUnits(Array.isArray(d) ? d : d.units || []))
      .catch(() => {});
  }, [dealershipId]);

  // Determine back path
  function goBack() {
    // Navigate up from financing/new → financing
    const segs = location.split('/').filter(Boolean);
    const newIdx = segs.lastIndexOf('new');
    if (newIdx > 0) {
      navigate('/' + segs.slice(0, newIdx).join('/'));
    } else {
      navigate(-1 as any);
    }
  }

  // ── Submit handler ─────────────────────────────────────────────────────────
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customerId) { showToast('Please select a customer'); return; }
    if (!unitId) { showToast('Please select a unit — both customer and unit are required'); return; }
    if (!amountRequested || parseFloat(amountRequested) <= 0) {
      showToast('Please enter a valid requested amount');
      return;
    }

    setSaving(true);
    try {
      const body: Record<string, any> = {
        dealershipId: dealershipId || user?.dealershipId,
        customerId,
        unitId,
        lenderId: lenderId || undefined,
        amountRequested,
        downPayment: downPayment || undefined,
        preferredTermMonths: parseInt(preferredTermMonths) || 60,
        creditInfo: creditScore ? { creditScore: parseInt(creditScore) } : {},
        notes: notes.trim() || undefined,
      };

      const data = await apiFetch<any>('/api/financing/applications', {
        method: 'POST',
        body: JSON.stringify(body),
      });

      const appId = data?.application?.id;
      if (appId) {
        showToast('Application submitted');
        const segs = location.split('/').filter(Boolean);
        const newIdx = segs.lastIndexOf('new');
        if (newIdx > 0) {
          navigate('/' + segs.slice(0, newIdx).join('/') + '/' + appId);
        }
      } else {
        showToast('Application created');
        goBack();
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to submit application');
    } finally {
      setSaving(false);
    }
  };

  // ── Access guard ───────────────────────────────────────────────────────────
  if (!canCreate) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          Only Dealer Owners and Operator Admins can submit financing applications.
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#08235d', color: '#fff',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500,
          zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="detail-header">
        <button className="detail-back" onClick={goBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">New Financing Application</div>
          <div className="detail-meta">
            {isDealerOwner ? 'Submit a financing request for your customer' : 'Submit on behalf of a dealer'}
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="pn">
          <div className="form-grid">
            {/* Operator Admin: dealer selector */}
            {isOperatorAdmin && (
              <div className="form-group">
                <label>Dealership *</label>
                <select
                  value={dealershipId}
                  onChange={e => {
                    setDealershipId(e.target.value);
                    setCustomerId('');
                    setUnitId('');
                  }}
                  required
                >
                  <option value="">Select dealership…</option>
                  {dealers.map((d: any) => (
                    <option key={d.id} value={d.id}>{d.name}</option>
                  ))}
                </select>
              </div>
            )}

            {/* Customer selector */}
            <div className="form-group">
              <label>Customer *</label>
              <select
                value={customerId}
                onChange={e => setCustomerId(e.target.value)}
                required
                disabled={!dealershipId}
              >
                <option value="">
                  {!dealershipId ? 'Select a dealership first…' : 'Select customer…'}
                </option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{customerLabel(c)}</option>
                ))}
              </select>
            </div>

            {/* Unit selector */}
            <div className="form-group">
              <label>Unit (VIN) *</label>
              <select
                value={unitId}
                onChange={e => setUnitId(e.target.value)}
                required
                disabled={!dealershipId}
              >
                <option value="">
                  {!dealershipId ? 'Select a dealership first…' : 'Select unit…'}
                </option>
                {units.map(u => (
                  <option key={u.id} value={u.id}>{unitLabel(u)}</option>
                ))}
              </select>
            </div>

            {/* Lender preference */}
            <div className="form-group">
              <label>Preferred Lender</label>
              <select value={lenderId} onChange={e => setLenderId(e.target.value)}>
                <option value="">No preference / Shop all lenders</option>
                {lenders.map(l => (
                  <option key={l.id} value={l.id}>{l.name}</option>
                ))}
              </select>
            </div>

            {/* Requested Amount */}
            <div className="form-group">
              <label>Requested Amount *</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 45000"
                value={amountRequested}
                onChange={e => setAmountReq(e.target.value)}
                required
              />
            </div>

            {/* Down Payment */}
            <div className="form-group">
              <label>Down Payment</label>
              <input
                type="number"
                min="0"
                step="0.01"
                placeholder="e.g. 5000"
                value={downPayment}
                onChange={e => setDownPayment(e.target.value)}
              />
            </div>

            {/* Preferred Term */}
            <div className="form-group">
              <label>Preferred Term</label>
              <select value={preferredTermMonths} onChange={e => setPrefTerm(e.target.value)}>
                <option value="24">24 months (2 years)</option>
                <option value="36">36 months (3 years)</option>
                <option value="48">48 months (4 years)</option>
                <option value="60">60 months (5 years)</option>
                <option value="72">72 months (6 years)</option>
                <option value="84">84 months (7 years)</option>
                <option value="120">120 months (10 years)</option>
                <option value="144">144 months (12 years)</option>
                <option value="180">180 months (15 years)</option>
                <option value="240">240 months (20 years)</option>
              </select>
            </div>

            {/* Credit Score (optional) */}
            <div className="form-group">
              <label>Credit Score (if known)</label>
              <input
                type="number"
                min="300"
                max="900"
                placeholder="e.g. 742"
                value={creditScore}
                onChange={e => setCreditScore(e.target.value)}
              />
            </div>

            {/* Notes */}
            <div className="form-group full">
              <label>Notes</label>
              <textarea
                placeholder="Any additional details — customer preferences, special circumstances…"
                value={notes}
                onChange={e => setNotes(e.target.value)}
                rows={3}
              />
            </div>
          </div>

          <div className="btn-bar">
            <button type="submit" className="btn btn-p" disabled={saving}>
              {saving ? 'Submitting…' : 'Submit Application'}
            </button>
            <button type="button" className="btn btn-o" onClick={goBack}>
              Cancel
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
