// client/src/pages/exclusive/operator-admin/PaymentPlanManagement.tsx
// Operator admin view: all applications across all dealers, partner management, manual approvals
// Route: /operator/admin/payment-plans

import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { formatCurrency } from '@/lib/locale';

interface PaymentPlanRow {
  plan: {
    id: string;
    amount: string;
    currency: string;
    term: number;
    monthlyPayment: string | null;
    interestRate: string | null;
    status: string;
    customerName: string | null;
    customerEmail: string | null;
    serviceDescription: string | null;
    incomeRange: string | null;
    consentGiven: boolean;
    referralFee: string | null;
    submittedAt: string | null;
    approvedAt: string | null;
    createdAt: string;
  };
  partner: { id: string; name: string; country: string } | null;
  dealership: { id: string; name: string } | null;
}

interface FinancingPartner {
  id: string;
  name: string;
  country: string;
  isActive: boolean;
  referralFeePercent: string;
  minAmount: string;
  maxAmount: string;
  availableTerms: number[];
}

interface Stats {
  totalApplications: number;
  approvedCount: number;
  totalFinanced: string;
  totalReferralFee: string;
  byStatus: { status: string; count: number }[];
}

const STATUS_COLORS: Record<string, string> = {
  draft:     '#6b7280',
  submitted: '#f59e0b',
  approved:  '#22c55e',
  declined:  '#ef4444',
  active:    '#3b82f6',
  completed: '#033280',
  cancelled: '#9ca3af',
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function PaymentPlanManagement() {
  const { t, language: lang } = useLanguage();

  const [tab, setTab] = useState<'applications' | 'partners'>('applications');
  const [plans, setPlans] = useState<PaymentPlanRow[]>([]);
  const [partners, setPartners] = useState<FinancingPartner[]>([]);
  const [stats, setStats] = useState<Stats | null>(null);
  const [loading, setLoading] = useState(true);
  const [statusFilter, setStatusFilter] = useState('');
  const [countryFilter, setCountryFilter] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PaymentPlanRow | null>(null);
  const [toast, setToast] = useState('');

  // Approval form state
  const [approveForm, setApproveForm] = useState({ monthlyPayment: '', interestRate: '', term: '', note: '' });
  const [approving, setApproving] = useState(false);

  // New partner form
  const [showPartnerForm, setShowPartnerForm] = useState(false);
  const [partnerForm, setPartnerForm] = useState({ name: '', country: 'CA', referralFeePercent: '', minAmount: '500', maxAmount: '25000' });
  const [savingPartner, setSavingPartner] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const loadData = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (statusFilter) params.set('status', statusFilter);
      if (countryFilter) params.set('country', countryFilter);

      const [plansData, partnersData, statsData] = await Promise.all([
        apiFetch<{ plans: PaymentPlanRow[] }>(`/api/payment-plans?${params}`),
        apiFetch<{ partners: FinancingPartner[] }>('/api/financing-partners'),
        apiFetch<{ stats: Stats }>('/api/payment-plans/stats'),
      ]);
      setPlans(plansData.plans || []);
      setPartners(partnersData.partners || []);
      setStats(statsData.stats || null);
    } catch {
      setPlans([]); setPartners([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [statusFilter, countryFilter]);

  const handleApprove = async (planId: string, newStatus: 'approved' | 'declined') => {
    setApproving(true);
    try {
      await apiFetch(`/api/payment-plans/${planId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: newStatus,
          monthlyPayment: approveForm.monthlyPayment || undefined,
          interestRate: approveForm.interestRate || undefined,
          term: approveForm.term ? parseInt(approveForm.term) : undefined,
          approvalData: { note: approveForm.note, processedAt: new Date().toISOString() },
        }),
      });
      showToast(newStatus === 'approved' ? 'Application approved' : 'Application declined');
      setSelectedPlan(null);
      setApproveForm({ monthlyPayment: '', interestRate: '', term: '', note: '' });
      await loadData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to update'}`);
    } finally {
      setApproving(false);
    }
  };

  const handleCreatePartner = async () => {
    if (!partnerForm.name || !partnerForm.country) { showToast('Name and country required'); return; }
    setSavingPartner(true);
    try {
      await apiFetch('/api/financing-partners', {
        method: 'POST',
        body: JSON.stringify({
          name: partnerForm.name,
          country: partnerForm.country,
          referralFeePercent: partnerForm.referralFeePercent || '0',
          minAmount: partnerForm.minAmount || '500',
          maxAmount: partnerForm.maxAmount || '25000',
          availableTerms: [3, 6, 12, 24],
        }),
      });
      showToast('Partner created');
      setShowPartnerForm(false);
      setPartnerForm({ name: '', country: 'CA', referralFeePercent: '', minAmount: '500', maxAmount: '25000' });
      await loadData();
    } catch (err: any) {
      showToast(`Error: ${err?.message || 'Failed to create partner'}`);
    } finally {
      setSavingPartner(false);
    }
  };

  const handleTogglePartner = async (partner: FinancingPartner) => {
    try {
      await apiFetch(`/api/financing-partners/${partner.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ isActive: !partner.isActive }),
      });
      showToast(partner.isActive ? 'Partner deactivated' : 'Partner activated');
      await loadData();
    } catch {
      showToast('Failed to update partner');
    }
  };

  return (
    <div className="page active">
      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 24 }}>
        {[
          { label: 'Total Applications', value: stats?.totalApplications ?? '—', color: '#033280' },
          { label: 'Approved / Active', value: stats?.approvedCount ?? '—', color: '#22c55e' },
          { label: 'Total Financed', value: stats ? formatCurrency(stats.totalFinanced, 'CAD') : '—', color: '#3b82f6' },
          { label: 'Referral Commission', value: stats ? formatCurrency(stats.totalReferralFee, 'CAD') : '—', color: '#0cb22c' },
        ].map((card, i) => (
          <div key={i} className="pn" style={{ padding: '16px 20px' }}>
            <div style={{ fontSize: 11, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: 0.8 }}>{card.label}</div>
            <div style={{ fontSize: typeof card.value === 'string' && card.value.includes('$') ? 14 : 22, fontWeight: 700, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 20, borderBottom: '2px solid var(--border, #e8e8e8)' }}>
        {['applications', 'partners'].map(t2 => (
          <button
            key={t2}
            onClick={() => setTab(t2 as any)}
            style={{
              padding: '10px 20px', fontSize: 13, fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer',
              borderBottom: tab === t2 ? '2px solid #033280' : '2px solid transparent',
              color: tab === t2 ? '#033280' : '#888',
              marginBottom: -2,
            }}
          >
            {t2 === 'applications' ? 'Applications' : 'Financing Partners'}
          </button>
        ))}
      </div>

      {/* Applications tab */}
      {tab === 'applications' && (
        <div className="pn">
          <div className="pn-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <span className="pn-t">All Payment Plan Applications</span>
            <div style={{ display: 'flex', gap: 8 }}>
              <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }}>
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="approved">Approved</option>
                <option value="declined">Declined</option>
                <option value="active">Active</option>
                <option value="completed">Completed</option>
              </select>
              <select value={countryFilter} onChange={e => setCountryFilter(e.target.value)} style={{ fontSize: 12, padding: '5px 8px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }}>
                <option value="">All Countries</option>
                <option value="CA">Canada (CAD)</option>
                <option value="US">United States (USD)</option>
              </select>
            </div>
          </div>

          {loading ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>Loading…</div>
          ) : plans.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>No applications found.</div>
          ) : (
            <div style={{ overflowX: 'auto' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ background: 'var(--bg-secondary, #f8f9fa)' }}>
                    {['Dealer', 'Customer', 'Amount', 'Term', 'Partner', 'Status', 'Referral Fee', 'Submitted', ''].map(h => (
                      <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid var(--border, #e8e8e8)' }}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {plans.map(row => (
                    <tr key={row.plan.id} style={{ borderBottom: '1px solid var(--border, #f0f0f0)' }}>
                      <td style={{ padding: '11px 16px', fontSize: 12 }}>{row.dealership?.name || '—'}</td>
                      <td style={{ padding: '11px 16px', fontSize: 12 }}>{row.plan.customerName || '—'}</td>
                      <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: '#033280' }}>
                        {formatCurrency(row.plan.amount, (row.plan.currency as 'CAD' | 'USD') || 'CAD')}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 12 }}>{row.plan.term} mo</td>
                      <td style={{ padding: '11px 16px', fontSize: 12 }}>{row.partner?.name || '—'}</td>
                      <td style={{ padding: '11px 16px' }}>
                        <span style={{
                          display: 'inline-block', padding: '3px 8px', borderRadius: 12, fontSize: 11, fontWeight: 600,
                          background: `${STATUS_COLORS[row.plan.status] ?? '#888'}20`,
                          color: STATUS_COLORS[row.plan.status] ?? '#888',
                        }}>
                          {row.plan.status}
                        </span>
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 12, color: '#0cb22c', fontWeight: 600 }}>
                        {row.plan.referralFee ? formatCurrency(row.plan.referralFee, (row.plan.currency as 'CAD' | 'USD') || 'CAD') : '—'}
                      </td>
                      <td style={{ padding: '11px 16px', fontSize: 11, color: '#888' }}>{fmtDate(row.plan.submittedAt || row.plan.createdAt)}</td>
                      <td style={{ padding: '11px 16px' }}>
                        {row.plan.status === 'submitted' && (
                          <button onClick={() => { setSelectedPlan(row); setApproveForm({ monthlyPayment: '', interestRate: '', term: String(row.plan.term), note: '' }); }} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, border: '1px solid #033280', background: 'none', color: '#033280', cursor: 'pointer', fontWeight: 600 }}>
                            Review
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Partners tab */}
      {tab === 'partners' && (
        <div className="pn">
          <div className="pn-h" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px' }}>
            <span className="pn-t">Financing Partners</span>
            <button onClick={() => setShowPartnerForm(!showPartnerForm)} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 6, background: '#033280', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
              + Add Partner
            </button>
          </div>

          {showPartnerForm && (
            <div style={{ padding: '20px', borderBottom: '1px solid var(--border, #e8e8e8)', background: 'var(--bg-secondary, #f8f9fa)' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #333)', marginBottom: 16 }}>New Financing Partner</div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 12 }}>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>Partner Name *</label>
                  <input type="text" value={partnerForm.name} onChange={e => setPartnerForm(f => ({ ...f, name: e.target.value }))} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, boxSizing: 'border-box' as const, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>Country *</label>
                  <select value={partnerForm.country} onChange={e => setPartnerForm(f => ({ ...f, country: e.target.value }))} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, boxSizing: 'border-box' as const, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }}>
                    <option value="CA">Canada (CA)</option>
                    <option value="US">United States (US)</option>
                    <option value="BOTH">Both</option>
                  </select>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>Referral Fee %</label>
                  <input type="number" value={partnerForm.referralFeePercent} onChange={e => setPartnerForm(f => ({ ...f, referralFeePercent: e.target.value }))} step="0.1" min="0" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, boxSizing: 'border-box' as const, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>Min Amount ($)</label>
                  <input type="number" value={partnerForm.minAmount} onChange={e => setPartnerForm(f => ({ ...f, minAmount: e.target.value }))} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, boxSizing: 'border-box' as const, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }} />
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>Max Amount ($)</label>
                  <input type="number" value={partnerForm.maxAmount} onChange={e => setPartnerForm(f => ({ ...f, maxAmount: e.target.value }))} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, boxSizing: 'border-box' as const, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button onClick={handleCreatePartner} disabled={savingPartner} style={{ fontSize: 12, padding: '7px 16px', borderRadius: 6, background: '#0cb22c', color: '#fff', border: 'none', cursor: 'pointer', fontWeight: 600 }}>
                  {savingPartner ? 'Saving…' : 'Create Partner'}
                </button>
                <button onClick={() => setShowPartnerForm(false)} style={{ fontSize: 12, padding: '7px 14px', borderRadius: 6, background: 'none', border: '1px solid var(--border, #e0e0e0)', cursor: 'pointer', color: 'var(--text, #333)' }}>
                  Cancel
                </button>
              </div>
            </div>
          )}

          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary, #f8f9fa)' }}>
                  {['Partner', 'Country', 'Referral %', 'Min Amount', 'Max Amount', 'Terms', 'Status', ''].map(h => (
                    <th key={h} style={{ padding: '10px 16px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: '#888', textTransform: 'uppercase', letterSpacing: 0.5, borderBottom: '1px solid var(--border, #e8e8e8)' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {partners.map(p => (
                  <tr key={p.id} style={{ borderBottom: '1px solid var(--border, #f0f0f0)' }}>
                    <td style={{ padding: '11px 16px', fontSize: 13, fontWeight: 600, color: 'var(--text, #333)' }}>{p.name}</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 10, background: p.country === 'CA' ? '#e0f2fe' : p.country === 'US' ? '#fef3c7' : '#f3f4f6', color: p.country === 'CA' ? '#0369a1' : p.country === 'US' ? '#92400e' : '#6b7280' }}>
                        {p.country}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px', fontSize: 13 }}>{p.referralFeePercent}%</td>
                    <td style={{ padding: '11px 16px', fontSize: 12 }}>${parseFloat(p.minAmount).toLocaleString()}</td>
                    <td style={{ padding: '11px 16px', fontSize: 12 }}>${parseFloat(p.maxAmount).toLocaleString()}</td>
                    <td style={{ padding: '11px 16px', fontSize: 11, color: '#888' }}>{(p.availableTerms || []).join(', ')} mo</td>
                    <td style={{ padding: '11px 16px' }}>
                      <span style={{ fontSize: 11, fontWeight: 600, padding: '3px 8px', borderRadius: 10, background: p.isActive ? '#dcfce7' : '#f3f4f6', color: p.isActive ? '#16a34a' : '#6b7280' }}>
                        {p.isActive ? 'Active' : 'Inactive'}
                      </span>
                    </td>
                    <td style={{ padding: '11px 16px' }}>
                      <button onClick={() => handleTogglePartner(p)} style={{ fontSize: 11, padding: '4px 8px', borderRadius: 4, border: `1px solid ${p.isActive ? '#ef4444' : '#22c55e'}`, background: 'none', color: p.isActive ? '#ef4444' : '#22c55e', cursor: 'pointer', fontWeight: 600 }}>
                        {p.isActive ? 'Deactivate' : 'Activate'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Review/Approve drawer */}
      {selectedPlan && (
        <div style={{ position: 'fixed', inset: 0, zIndex: 1100, background: 'rgba(0,0,0,.4)', display: 'flex', alignItems: 'flex-start', justifyContent: 'flex-end' }}
          onClick={e => { if (e.target === e.currentTarget) setSelectedPlan(null); }}>
          <div style={{ width: 440, maxWidth: '100vw', height: '100%', overflowY: 'auto', background: 'var(--bg-card, #fff)', boxShadow: '-8px 0 40px rgba(0,0,0,.15)', padding: 0 }}>
            <div style={{ padding: '20px 24px 16px', borderBottom: '1px solid var(--border, #e8e8e8)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #333)' }}>Review Application</div>
              <button onClick={() => setSelectedPlan(null)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888' }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
              </button>
            </div>
            <div style={{ padding: '20px 24px' }}>
              {/* Application info */}
              <div style={{ background: 'var(--bg-secondary, #f4f6fb)', borderRadius: 8, padding: '14px 16px', marginBottom: 20 }}>
                {[
                  ['Dealer', selectedPlan.dealership?.name],
                  ['Customer', selectedPlan.plan.customerName],
                  ['Amount', formatCurrency(selectedPlan.plan.amount, (selectedPlan.plan.currency as 'CAD' | 'USD') || 'CAD')],
                  ['Partner', selectedPlan.partner?.name],
                  ['Requested Term', `${selectedPlan.plan.term} months`],
                  ['Income Range', selectedPlan.plan.incomeRange?.replace(/_/g, ' ')],
                  ['Consent Given', selectedPlan.plan.consentGiven ? 'Yes' : 'No'],
                  ['Service', selectedPlan.plan.serviceDescription],
                ].map(([label, value]) => value && (
                  <div key={String(label)} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                    <span style={{ fontSize: 11, color: '#888', fontWeight: 500 }}>{label}</span>
                    <span style={{ fontSize: 12, color: 'var(--text, #333)', fontWeight: 600, textAlign: 'right', maxWidth: '60%' }}>{value}</span>
                  </div>
                ))}
              </div>

              {/* Approval form */}
              <div style={{ marginBottom: 20 }}>
                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #333)', marginBottom: 12 }}>Approval Details</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10, marginBottom: 10 }}>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>Monthly Payment ($)</label>
                    <input type="number" value={approveForm.monthlyPayment} onChange={e => setApproveForm(f => ({ ...f, monthlyPayment: e.target.value }))} step="0.01" min="0" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, boxSizing: 'border-box' as const, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>Interest Rate (%)</label>
                    <input type="number" value={approveForm.interestRate} onChange={e => setApproveForm(f => ({ ...f, interestRate: e.target.value }))} step="0.01" min="0" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, boxSizing: 'border-box' as const, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }} />
                  </div>
                  <div>
                    <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>Approved Term (months)</label>
                    <input type="number" value={approveForm.term} onChange={e => setApproveForm(f => ({ ...f, term: e.target.value }))} min="1" style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, boxSizing: 'border-box' as const, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }} />
                  </div>
                </div>
                <div>
                  <label style={{ fontSize: 11, fontWeight: 600, color: '#888', display: 'block', marginBottom: 4 }}>Approval Note</label>
                  <textarea value={approveForm.note} onChange={e => setApproveForm(f => ({ ...f, note: e.target.value }))} rows={2} style={{ width: '100%', padding: '7px 10px', borderRadius: 6, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, resize: 'vertical', boxSizing: 'border-box' as const, background: 'var(--bg-card, #fff)', color: 'var(--text, #333)', fontFamily: 'inherit' }} />
                </div>
              </div>

              {/* Action buttons */}
              <div style={{ display: 'flex', gap: 8 }}>
                <button
                  onClick={() => handleApprove(selectedPlan.plan.id, 'approved')}
                  disabled={approving}
                  style={{ flex: 1, padding: '10px', borderRadius: 6, border: 'none', background: '#0cb22c', color: '#fff', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  {approving ? 'Processing…' : 'Approve'}
                </button>
                <button
                  onClick={() => handleApprove(selectedPlan.plan.id, 'declined')}
                  disabled={approving}
                  style={{ flex: 1, padding: '10px', borderRadius: 6, border: '1px solid #ef4444', background: 'none', color: '#ef4444', fontSize: 13, fontWeight: 600, cursor: 'pointer' }}
                >
                  Decline
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
