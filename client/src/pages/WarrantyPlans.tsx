// client/src/pages/WarrantyPlans.tsx — Warranty Plans management
// Role-aware: operator_admin (full CRUD + cancel), operator_staff (view),
//             dealer_owner (view active plans + create assignment), dealer_staff (view),
//             financial_manager (view + revenue summary)

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
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

function calcDaysRemaining(endDate: string | null): number {
  if (!endDate) return 0;
  return Math.max(0, Math.floor((new Date(endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
}

function statusBadge(plan: WarrantyPlan) {
  const days = calcDaysRemaining(plan.endDate);
  const cls =
    plan.status === 'cancelled' ? 'bg cancelled' :
    plan.status === 'expired' || days === 0 ? 'bg denied' :
    days <= 90 ? 'bg ow' :
    'bg active';
  const label =
    plan.status === 'cancelled' ? 'Cancelled' :
    (plan.status === 'expired' || days === 0) ? 'Expired' :
    days <= 90 ? 'Expiring Soon' :
    'Active';
  return <span className={cls} style={{ fontSize: 11, padding: '2px 8px' }}>{label}</span>;
}

export default function WarrantyPlans() {
  const [, navigate] = useLocation();
  const { user } = useAuth();

  const role = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isOperator      = role === 'operator_admin' || role === 'operator_staff';
  const isDealerOwner   = role === 'dealer_owner';
  const isDealerStaff   = role === 'dealer_staff';
  const isFinancialMgr  = role === 'financial_manager';
  const hasAccess       = isOperator || isDealerOwner || isDealerStaff || isFinancialMgr;

  const [plans, setPlans]                 = useState<WarrantyPlan[]>([]);
  const [searchQ, setSearchQ]             = useState('');
  const [statusFilter, setStatusFilter]   = useState('');
  const [activeTab, setActiveTab]         = useState<'all' | 'expiring' | 'sold'>('all');
  const [isLoading, setIsLoading]         = useState(true);
  const [dataError, setDataError]         = useState<string | null>(null);
  const [moduleEnabled, setModuleEnabled] = useState<boolean | null>(null);

  // Toast
  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Inline create form (operator_admin)
  const [showForm, setShowForm]         = useState(false);
  const [fUnitId, setFUnitId]           = useState('');
  const [fProvider, setFProvider]       = useState('Guardsman RV');
  const [fCoverage, setFCoverage]       = useState('Comprehensive');
  const [fStartDate, setFStartDate]     = useState('');
  const [fEndDate, setFEndDate]         = useState('');
  const [fSoldByUs, setFSoldByUs]       = useState(false);
  const [fStructural, setFStructural]   = useState(true);
  const [fPlumbing, setFPlumbing]       = useState(true);
  const [fElectrical, setFElectrical]   = useState(true);
  const [fHvac, setFHvac]               = useState(true);
  const [fAppliances, setFAppliances]   = useState(true);
  const [fSlideOuts, setFSlideOuts]     = useState(true);
  const [fTier, setFTier]               = useState('Comprehensive');
  const [fRetailPrice, setFRetailPrice] = useState('');
  const [fSaving, setFSaving]           = useState(false);

  const loadPlans = useCallback(async () => {
    try {
      const d = await apiFetch<any>('/api/warranty-plans');
      setPlans(Array.isArray(d.warrantyPlans) ? d.warrantyPlans : []);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load warranty plans');
    }
  }, []);

  const loadModuleStatus = useCallback(async () => {
    if (!user?.dealershipId || isOperator) { setModuleEnabled(true); return; }
    try {
      const d = await apiFetch<any>(`/api/dealerships/${user.dealershipId}/modules`);
      const modules: any[] = d.modules || [];
      const wm = modules.find((m: any) => m.moduleKey === 'warranty_plans');
      setModuleEnabled(!wm || wm.status === 'enabled' || wm.status === 'trial');
    } catch { setModuleEnabled(true); }
  }, [user?.dealershipId, isOperator]);

  useEffect(() => {
    if (!hasAccess) { setIsLoading(false); return; }
    setIsLoading(true);
    Promise.all([loadPlans(), loadModuleStatus()])
      .catch((err: any) => setDataError(err?.message || 'Failed to load'))
      .finally(() => setIsLoading(false));
  }, [hasAccess, loadPlans, loadModuleStatus]);

  if (!hasAccess) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>You do not have permission to view Warranty Plans.</div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ color: '#888', fontSize: 14 }}>Loading warranty plans…</div>
      </div>
    );
  }

  if (moduleEnabled === false) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Warranty Plans Module Not Enabled</div>
          <div style={{ color: '#888', fontSize: 13 }}>Contact your operator to activate Warranty Plans for your dealership.</div>
        </div>
      </div>
    );
  }

  const handleCreate = async () => {
    if (!fUnitId.trim()) { showToast('Unit ID is required'); return; }
    if (!fStartDate || !fEndDate) { showToast('Start and end dates are required'); return; }
    setFSaving(true);
    try {
      await apiFetch('/api/warranty-plans', {
        method: 'POST',
        body: JSON.stringify({
          unitId: fUnitId.trim(),
          provider: fProvider,
          coverage: fCoverage,
          startDate: fStartDate,
          endDate: fEndDate,
          soldByPlatform: fSoldByUs,
          status: 'active',
          customData: {
            tier: fTier,
            retailPrice: fRetailPrice || null,
            coversStructural: fStructural,
            coversPlumbing: fPlumbing,
            coversElectrical: fElectrical,
            coversHvac: fHvac,
            coversAppliances: fAppliances,
            coversSlideOuts: fSlideOuts,
          },
        }),
      });
      showToast('Warranty plan created');
      setShowForm(false);
      setFUnitId(''); setFRetailPrice('');
      loadPlans();
    } catch (err: any) {
      showToast(err?.message || 'Failed to create warranty plan');
    } finally {
      setFSaving(false);
    }
  };

  const handleCancel = async (id: string) => {
    if (!window.confirm('Cancel this warranty plan?')) return;
    try {
      await apiFetch(`/api/warranty-plans/${id}`, { method: 'DELETE' });
      showToast('Warranty plan cancelled');
      loadPlans();
    } catch (err: any) {
      showToast(err?.message || 'Failed to cancel plan');
    }
  };

  const handleRenewalRequest = async (id: string) => {
    try {
      await apiFetch(`/api/warranty-plans/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ customData: { renewalRequested: true, renewalRequestedAt: new Date().toISOString() } }),
      });
      showToast('Renewal request sent to operator');
      loadPlans();
    } catch (err: any) {
      showToast(err?.message || 'Failed to request renewal');
    }
  };

  // Stats
  const activePlans   = plans.filter(p => p.status === 'active');
  const expiringPlans = plans.filter(p => {
    const d = calcDaysRemaining(p.endDate);
    return p.status === 'active' && d > 0 && d <= 30;
  });
  const soldByUs      = plans.filter(p => p.soldByPlatform);
  const revMTD        = soldByUs
    .filter(p => { const c = new Date(p.createdAt); const n = new Date(); return c.getMonth() === n.getMonth() && c.getFullYear() === n.getFullYear(); })
    .reduce((s, p) => s + parseFloat(p.customData?.retailPrice || '0'), 0);

  // Filter
  const tabFiltered = activeTab === 'expiring'
    ? expiringPlans
    : activeTab === 'sold'
    ? soldByUs
    : plans;

  const filtered = tabFiltered.filter(p => {
    const matchQ = !searchQ ||
      p.planNumber.toLowerCase().includes(searchQ.toLowerCase()) ||
      (p.provider || '').toLowerCase().includes(searchQ.toLowerCase()) ||
      (p.coverage || '').toLowerCase().includes(searchQ.toLowerCase());
    const matchS = !statusFilter || p.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#08235d', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }}>
          {toastMsg}
        </div>
      )}

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>Warranty Plans</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
            {isOperator
              ? 'Manage OEM and aftermarket warranty plans. Track coverage, renewals, and link to claims.'
              : 'View active warranty plans for your dealership\'s units.'}
          </div>
        </div>
        {isOperatorAdmin && (
          <button className="btn btn-p btn-sm" onClick={() => setShowForm(v => !v)}>
            {showForm ? 'Cancel' : '+ Add Warranty Plan'}
          </button>
        )}
      </div>

      {/* Stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Active Plans</div><div className="sc-v" style={{ color: '#2563eb' }}>{activePlans.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Expiring (30d)</div><div className="sc-v" style={{ color: '#d97706' }}>{expiringPlans.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Plans Sold (MTD)</div><div className="sc-v" style={{ color: '#22c55e' }}>{soldByUs.filter(p => { const c = new Date(p.createdAt); const n = new Date(); return c.getMonth() === n.getMonth() && c.getFullYear() === n.getFullYear(); }).length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Sales Revenue (MTD)</div><div className="sc-v">${revMTD.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Plans</div><div className="sc-v">{plans.length}</div></div>
      </div>

      {/* Inline create form (operator_admin) */}
      {isOperatorAdmin && showForm && (
        <div className="pn" style={{ marginBottom: 16, borderLeft: '3px solid #08235d' }}>
          <div className="pn-h" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 16 }}>
            <span className="pn-t">New Warranty Plan</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Unit ID *</label>
              <input value={fUnitId} onChange={e => setFUnitId(e.target.value)} placeholder="Unit UUID" />
            </div>
            <div className="form-group">
              <label>Provider</label>
              <select value={fProvider} onChange={e => setFProvider(e.target.value)}>
                <option>Guardsman RV</option>
                <option>XtraRide</option>
                <option>Wholesale Warranties</option>
                <option>Jayco OEM</option>
                <option>Forest River OEM</option>
                <option>Heartland OEM</option>
                <option>Other</option>
              </select>
            </div>
            <div className="form-group">
              <label>Coverage Level</label>
              <select value={fCoverage} onChange={e => setFCoverage(e.target.value)}>
                <option>Comprehensive</option>
                <option>Powertrain+</option>
                <option>Gold</option>
                <option>Platinum</option>
                <option>OEM Standard</option>
                <option>Basic</option>
              </select>
            </div>
            <div className="form-group">
              <label>Tier</label>
              <select value={fTier} onChange={e => setFTier(e.target.value)}>
                <option>Basic</option>
                <option>Standard</option>
                <option>Comprehensive</option>
                <option>Premium</option>
              </select>
            </div>
            <div className="form-group">
              <label>Start Date *</label>
              <input type="date" value={fStartDate} onChange={e => setFStartDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>End Date *</label>
              <input type="date" value={fEndDate} onChange={e => setFEndDate(e.target.value)} />
            </div>
            <div className="form-group">
              <label>Retail Price to Customer</label>
              <input value={fRetailPrice} onChange={e => setFRetailPrice(e.target.value)} placeholder="e.g. 2495.00" />
            </div>
            <div className="form-group" style={{ display: 'flex', alignItems: 'center', gap: 8, paddingTop: 20 }}>
              <input type="checkbox" id="sold-by-us" checked={fSoldByUs} onChange={e => setFSoldByUs(e.target.checked)} />
              <label htmlFor="sold-by-us" style={{ margin: 0, cursor: 'pointer' }}>Sold by Platform (we earn commission)</label>
            </div>
          </div>

          {/* Coverage categories */}
          <div style={{ padding: '12px 0 4px', borderTop: '1px solid #f0f0f0', marginTop: 8 }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10, color: '#333' }}>Coverage Categories</div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 8 }}>
              {[
                { key: 'fStructural', label: 'Structural', val: fStructural, set: setFStructural },
                { key: 'fPlumbing', label: 'Plumbing', val: fPlumbing, set: setFPlumbing },
                { key: 'fElectrical', label: 'Electrical', val: fElectrical, set: setFElectrical },
                { key: 'fHvac', label: 'HVAC', val: fHvac, set: setFHvac },
                { key: 'fAppliances', label: 'Appliances', val: fAppliances, set: setFAppliances },
                { key: 'fSlideOuts', label: 'Slide-Outs', val: fSlideOuts, set: setFSlideOuts },
              ].map(({ key, label, val, set }) => (
                <label key={key} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                  <input type="checkbox" checked={val} onChange={e => set(e.target.checked)} />
                  {label}
                </label>
              ))}
            </div>
          </div>

          <div className="btn-bar" style={{ marginTop: 16 }}>
            <button className="btn btn-p btn-sm" onClick={handleCreate} disabled={fSaving}>
              {fSaving ? 'Saving…' : 'Create Plan'}
            </button>
            <button className="btn btn-o btn-sm" onClick={() => setShowForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="tabs">
        <div className={`tab${activeTab === 'all' ? ' active' : ''}`} onClick={() => setActiveTab('all')}>
          All Plans ({plans.length})
        </div>
        <div className={`tab${activeTab === 'expiring' ? ' active' : ''}`} onClick={() => setActiveTab('expiring')}>
          Expiring Soon ({expiringPlans.length})
        </div>
        {(isOperator || isFinancialMgr) && (
          <div className={`tab${activeTab === 'sold' ? ' active' : ''}`} onClick={() => setActiveTab('sold')}>
            Sold by Platform ({soldByUs.length})
          </div>
        )}
      </div>

      {/* Table */}
      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by plan #, provider, or coverage…"
            value={searchQ}
            onChange={e => setSearchQ(e.target.value)}
          />
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="active">Active</option>
            <option value="expiring">Expiring</option>
            <option value="expired">Expired</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>Plan #</th>
                {isOperator && <th>Dealership</th>}
                <th>Provider</th>
                <th>Coverage</th>
                <th>Start</th>
                <th>Expiry</th>
                <th>Days Left</th>
                {(isOperator || isFinancialMgr) && <th>Sold by Us</th>}
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={10} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                    {searchQ || statusFilter ? 'No plans match your filters.' : 'No warranty plans yet.'}
                  </td>
                </tr>
              ) : filtered.map(plan => {
                const days = calcDaysRemaining(plan.endDate);
                return (
                  <tr key={plan.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`warranty-detail/${plan.id}`)}>
                    <td style={{ fontWeight: 500, fontFamily: 'monospace', fontSize: 12 }}>{plan.planNumber}</td>
                    {isOperator && <td style={{ fontSize: 12, color: '#666' }}>{plan.dealershipId.slice(0, 8)}…</td>}
                    <td>{plan.provider}</td>
                    <td>{plan.coverage || plan.customData?.tier || '—'}</td>
                    <td style={{ fontSize: 12, color: '#666' }}>
                      {plan.startDate ? new Date(plan.startDate).toLocaleDateString('en-CA') : '—'}
                    </td>
                    <td style={{ fontSize: 12, color: '#666' }}>
                      {plan.endDate ? new Date(plan.endDate).toLocaleDateString('en-CA') : '—'}
                    </td>
                    <td style={{ fontWeight: 600, color: days <= 30 ? '#d97706' : days === 0 ? '#dc2626' : '#22c55e' }}>
                      {plan.endDate ? days : '—'}
                    </td>
                    {(isOperator || isFinancialMgr) && (
                      <td style={{ textAlign: 'center' }}>
                        {plan.soldByPlatform ? <span style={{ color: '#22c55e', fontWeight: 600 }}>Yes</span> : <span style={{ color: '#aaa' }}>No</span>}
                      </td>
                    )}
                    <td onClick={e => e.stopPropagation()}>{statusBadge(plan)}</td>
                    <td onClick={e => e.stopPropagation()}>
                      <div style={{ display: 'flex', gap: 4 }}>
                        <button className="btn btn-o btn-sm" style={{ fontSize: 11 }} onClick={() => navigate(`warranty-detail/${plan.id}`)}>
                          View
                        </button>
                        {isOperatorAdmin && plan.status !== 'cancelled' && (
                          <button className="btn btn-o btn-sm" style={{ fontSize: 11, color: '#dc2626', borderColor: '#dc2626' }} onClick={() => handleCancel(plan.id)}>
                            Cancel
                          </button>
                        )}
                        {(isDealerOwner || isDealerStaff) && calcDaysRemaining(plan.endDate) <= 90 && plan.status === 'active' && (
                          <button className="btn btn-p btn-sm" style={{ fontSize: 11 }} onClick={() => handleRenewalRequest(plan.id)}>
                            Request Renewal
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {dataError && (
        <div style={{ marginTop: 16, padding: '10px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
          {dataError}
        </div>
      )}
    </div>
  );
}
