// client/src/pages/Financing.tsx — Financing Services list page
// Role-aware:
//   operator_admin  — full lender management + all applications + reports
//   operator_staff  — read-only lenders + all applications
//   dealer_owner    — module gate, active lenders (card list), own applications, New Application
//   dealer_staff    — module gate, active lenders (card list), own applications (read-only)
//   financial_manager — summary cards + all applications (read-only)
//   client          — redirect to my-financing (handled in router)

import { useState, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

interface Lender {
  id: string;
  name: string;
  legalName: string | null;
  contactEmail: string | null;
  contactPhone: string | null;
  country: string;
  minLoanAmount: string | null;
  maxLoanAmount: string | null;
  minTermMonths: number | null;
  maxTermMonths: number | null;
  minCreditScore: number | null;
  active: boolean;
  createdAt: string;
}

interface FinancingApp {
  id: string;
  applicationNumber: string;
  dealershipId: string;
  customerId: string;
  unitId: string | null;
  amountRequested: string;
  downPayment: string | null;
  preferredTermMonths: number | null;
  status: string;
  createdAt: string;
  updatedAt: string;
}

interface ReportSummary {
  totalApplications: number;
  mtdApplications: number;
  approvedCount: number;
  approvalRate: string;
  totalVolume: string;
  avgLoan: string;
}

// Status badge
function appStatusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    draft:     { label: 'Draft',        cls: 'bg'           },
    submitted: { label: 'Submitted',    cls: 'bg info'      },
    shopping:  { label: 'Shopping',     cls: 'bg in-progress'},
    approved:  { label: 'Approved',     cls: 'bg ok'        },
    declined:  { label: 'Declined',     cls: 'bg denied'    },
    completed: { label: 'Funded',       cls: 'bg active'    },
  };
  const m = map[status] || { label: status, cls: 'bg' };
  return <span className={m.cls} style={{ fontSize: 11, padding: '2px 8px' }}>{m.label}</span>;
}

function fmtCurrency(val: string | null | undefined): string {
  if (!val) return '—';
  const n = parseFloat(val);
  if (isNaN(n)) return '—';
  return `$${n.toLocaleString('en-CA', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
}

function fmtDate(val: string | null | undefined): string {
  if (!val) return '—';
  return new Date(val).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

export default function Financing() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const role = user?.role as string | undefined;
  const isOperatorAdmin  = role === 'operator_admin';
  const isOperator       = role === 'operator_admin' || role === 'operator_staff';
  const isDealerOwner    = role === 'dealer_owner';
  const isDealerStaff    = role === 'dealer_staff';
  const isDealer         = isDealerOwner || isDealerStaff;
  const isFinancialMgr   = role === 'financial_manager';
  const isClient         = role === 'client';
  const hasAccess        = isOperator || isDealer || isFinancialMgr || isClient;

  // ── State ──────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState<'applications' | 'lenders' | 'report'>('applications');
  const [lenders, setLenders]     = useState<Lender[]>([]);
  const [apps, setApps]           = useState<FinancingApp[]>([]);
  const [report, setReport]       = useState<ReportSummary | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [searchQ, setSearchQ]     = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [moduleEnabled, setModuleEnabled] = useState<boolean | null>(null);

  // Toast
  const [toastMsg, setToastMsg]       = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Inline add-lender form (operator_admin)
  const [showLenderForm, setShowLenderForm]   = useState(false);
  const [lFormName, setLFormName]             = useState('');
  const [lFormEmail, setLFormEmail]           = useState('');
  const [lFormPhone, setLFormPhone]           = useState('');
  const [lFormMinTerm, setLFormMinTerm]       = useState('');
  const [lFormMaxTerm, setLFormMaxTerm]       = useState('');
  const [lFormMinLoan, setLFormMinLoan]       = useState('');
  const [lFormMaxLoan, setLFormMaxLoan]       = useState('');
  const [lFormSaving, setLFormSaving]         = useState(false);

  // ── Data loaders ───────────────────────────────────────────────────────────
  const loadLenders = useCallback(async () => {
    try {
      const d = await apiFetch<any>('/api/financing/lenders');
      setLenders(Array.isArray(d.lenders) ? d.lenders : []);
    } catch (err: any) {
      console.error('Lenders load error:', err?.message);
    }
  }, []);

  const loadApps = useCallback(async () => {
    try {
      const d = await apiFetch<any>('/api/financing/applications');
      setApps(Array.isArray(d.applications) ? d.applications : []);
    } catch (err: any) {
      console.error('Applications load error:', err?.message);
    }
  }, []);

  const loadReport = useCallback(async () => {
    if (!isOperator && !isFinancialMgr && !isDealerOwner) return;
    try {
      const d = await apiFetch<any>('/api/financing/reports');
      setReport(d.summary || null);
    } catch (err: any) {
      console.error('Financing report load error:', err?.message);
    }
  }, [isOperator, isFinancialMgr, isDealerOwner]);

  const loadModuleStatus = useCallback(async () => {
    if (!user?.dealershipId || isOperator) {
      setModuleEnabled(true);
      return;
    }
    try {
      const d = await apiFetch<any>(`/api/dealerships/${user.dealershipId}/modules`);
      const modules: any[] = d.modules || [];
      const mod = modules.find((m: any) => m.moduleKey === 'financing');
      setModuleEnabled(!mod || mod.status === 'enabled' || mod.status === 'trial');
    } catch {
      setModuleEnabled(true);
    }
  }, [user?.dealershipId, isOperator]);

  useEffect(() => {
    if (!hasAccess) { setIsLoading(false); return; }
    setIsLoading(true);
    setDataError(null);
    Promise.all([loadLenders(), loadApps(), loadModuleStatus()])
      .catch((err: any) => setDataError(err?.message || 'Failed to load financing data'))
      .finally(() => setIsLoading(false));
  }, [hasAccess, loadLenders, loadApps, loadModuleStatus]);

  useEffect(() => {
    if (activeTab === 'report' && report === null) loadReport();
  }, [activeTab, report, loadReport]);

  // ── Access guards ──────────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          You do not have permission to view Financing Services.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ color: '#888', fontSize: 14 }}>Loading financing data…</div>
      </div>
    );
  }

  if (moduleEnabled === false) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ fontSize: 32, marginBottom: 12 }}>🔒</div>
          <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 8 }}>Financing Services Not Enabled</div>
          <div style={{ color: '#888', fontSize: 13 }}>
            Contact your operator to activate the Financing Services module for your dealership.
          </div>
        </div>
      </div>
    );
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleCreateLender = async () => {
    if (!lFormName.trim()) { showToast('Lender name is required'); return; }
    setLFormSaving(true);
    try {
      await apiFetch('/api/financing/lenders', {
        method: 'POST',
        body: JSON.stringify({
          name: lFormName.trim(),
          contactEmail: lFormEmail.trim() || null,
          contactPhone: lFormPhone.trim() || null,
          minTermMonths: lFormMinTerm || null,
          maxTermMonths: lFormMaxTerm || null,
          minLoanAmount: lFormMinLoan || null,
          maxLoanAmount: lFormMaxLoan || null,
          active: true,
        }),
      });
      showToast('Lender added');
      setLFormName(''); setLFormEmail(''); setLFormPhone('');
      setLFormMinTerm(''); setLFormMaxTerm('');
      setLFormMinLoan(''); setLFormMaxLoan('');
      setShowLenderForm(false);
      loadLenders();
    } catch (err: any) {
      showToast(err?.message || 'Failed to add lender');
    } finally {
      setLFormSaving(false);
    }
  };

  const handleDeactivateLender = async (id: string) => {
    try {
      await apiFetch(`/api/financing/lenders/${id}`, { method: 'DELETE' });
      showToast('Lender deactivated');
      loadLenders();
    } catch (err: any) {
      showToast(err?.message || 'Failed to deactivate lender');
    }
  };

  // ── Filtered data ──────────────────────────────────────────────────────────
  const filteredApps = apps.filter(a => {
    const matchQ = !searchQ ||
      a.applicationNumber.toLowerCase().includes(searchQ.toLowerCase()) ||
      a.customerId.toLowerCase().includes(searchQ.toLowerCase());
    const matchStatus = !statusFilter || a.status === statusFilter;
    return matchQ && matchStatus;
  });

  const activeLenders = lenders.filter(l => l.active);

  // ── Summary stats from local data ──────────────────────────────────────────
  const activeCount    = apps.filter(a => a.status === 'submitted' || a.status === 'shopping').length;
  const approvedMTD    = apps.filter(a => {
    if (a.status !== 'approved' && a.status !== 'completed') return false;
    const c = new Date(a.createdAt); const now = new Date();
    return c.getMonth() === now.getMonth() && c.getFullYear() === now.getFullYear();
  }).length;
  const totalVolMTD    = apps
    .filter(a => {
      if (a.status !== 'approved' && a.status !== 'completed') return false;
      const c = new Date(a.createdAt); const now = new Date();
      return c.getMonth() === now.getMonth() && c.getFullYear() === now.getFullYear();
    })
    .reduce((s, a) => s + parseFloat(a.amountRequested || '0'), 0);
  const submittedCount = apps.filter(a => a.status !== 'draft').length;
  const approvedCount  = apps.filter(a => a.status === 'approved' || a.status === 'completed').length;
  const approvalRate   = submittedCount > 0 ? `${((approvedCount / submittedCount) * 100).toFixed(0)}%` : '—';

  // ── Tabs available by role ─────────────────────────────────────────────────
  const tabs = [
    { id: 'applications', label: t('financing.applications') },
    ...(isOperator ? [{ id: 'lenders', label: t('financing.lenderPartners') }] : []),
    ...(isDealer ? [{ id: 'lenders', label: t('financing.availableLenders') }] : []),
    ...(isOperatorAdmin || isFinancialMgr || isDealerOwner
      ? [{ id: 'report', label: t('financing.volumeReport') }]
      : []),
  ];

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

      {/* Page header */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 18, fontWeight: 700 }}>{t('financing.financingServices')}</div>
          <div style={{ fontSize: 13, color: '#666', marginTop: 2 }}>
            {isOperator
              ? 'Manage lender partners, financing applications, and approval pipeline.'
              : 'Submit financing requests and track approval status for your customers.'}
          </div>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          {isOperatorAdmin && activeTab === 'lenders' && (
            <button className="btn btn-o btn-sm" onClick={() => setShowLenderForm(v => !v)}>
              {showLenderForm ? 'Cancel' : '+ Add Lender'}
            </button>
          )}
          {(isDealerOwner || isOperatorAdmin) && activeTab === 'applications' && (
            <button className="btn btn-p btn-sm" onClick={() => navigate('financing/new')}>
              + New Application
            </button>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('financing.activeRequests')}</div>
          <div className="sc-v" style={{ color: '#2563eb' }}>{activeCount}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('financing.approvedMTD')}</div>
          <div className="sc-v" style={{ color: '#22c55e' }}>{approvedMTD}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('financing.totalFinancedMTD')}</div>
          <div className="sc-v">{fmtCurrency(totalVolMTD.toFixed(2))}</div>
        </div>
        <div className="sc">
          <div className="sc-l" style={{ marginBottom: 8 }}>{t('financing.approvalRate')}</div>
          <div className="sc-v">{approvalRate}</div>
        </div>
      </div>

      {/* Inline add-lender form (operator_admin) */}
      {isOperatorAdmin && showLenderForm && (
        <div className="pn" style={{ marginBottom: 16, borderLeft: '3px solid #08235d' }}>
          <div className="pn-h" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 16 }}>
            <span className="pn-t">New Lender Partner</span>
          </div>
          <div className="form-grid">
            <div className="form-group">
              <label>Lender Name *</label>
              <input value={lFormName} onChange={e => setLFormName(e.target.value)} placeholder="e.g. RBC Royal Bank" />
            </div>
            <div className="form-group">
              <label>Contact Email</label>
              <input value={lFormEmail} onChange={e => setLFormEmail(e.target.value)} placeholder="dealer@bank.ca" />
            </div>
            <div className="form-group">
              <label>Contact Phone</label>
              <input value={lFormPhone} onChange={e => setLFormPhone(e.target.value)} placeholder="1-800-xxx-xxxx" />
            </div>
            <div className="form-group">
              <label>Min Term (months)</label>
              <input type="number" value={lFormMinTerm} onChange={e => setLFormMinTerm(e.target.value)} placeholder="e.g. 24" />
            </div>
            <div className="form-group">
              <label>Max Term (months)</label>
              <input type="number" value={lFormMaxTerm} onChange={e => setLFormMaxTerm(e.target.value)} placeholder="e.g. 240" />
            </div>
            <div className="form-group">
              <label>Min Loan ($)</label>
              <input type="number" value={lFormMinLoan} onChange={e => setLFormMinLoan(e.target.value)} placeholder="10000" />
            </div>
            <div className="form-group">
              <label>Max Loan ($)</label>
              <input type="number" value={lFormMaxLoan} onChange={e => setLFormMaxLoan(e.target.value)} placeholder="500000" />
            </div>
          </div>
          <div className="btn-bar">
            <button className="btn btn-p btn-sm" onClick={handleCreateLender} disabled={lFormSaving}>
              {lFormSaving ? 'Saving…' : 'Add Lender'}
            </button>
            <button className="btn btn-o btn-sm" onClick={() => setShowLenderForm(false)}>Cancel</button>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div style={{ display: 'flex', gap: 0, marginBottom: 16, borderBottom: '2px solid #e8e8e8' }}>
        {tabs.map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            style={{
              padding: '10px 20px', border: 'none', background: 'none',
              fontFamily: 'inherit', fontSize: 13, fontWeight: activeTab === tab.id ? 600 : 400,
              color: activeTab === tab.id ? '#08235d' : '#888',
              borderBottom: activeTab === tab.id ? '2px solid #08235d' : '2px solid transparent',
              marginBottom: -2, cursor: 'pointer',
            }}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* ── Tab: Applications ── */}
      {activeTab === 'applications' && (
        <div>
          <div className="filter-bar" style={{ marginBottom: 16 }}>
            <input
              type="text"
              placeholder="Search by application # or customer…"
              value={searchQ}
              onChange={e => setSearchQ(e.target.value)}
            />
            <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
              <option value="">{t('common.allStatuses')}</option>
              <option value="draft">Draft</option>
              <option value="submitted">Submitted</option>
              <option value="shopping">Shopping Lenders</option>
              <option value="approved">Approved</option>
              <option value="declined">Declined</option>
              <option value="completed">Funded</option>
            </select>
          </div>

          <div className="pn">
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>{t('financing.appNumber')}</th>
                    {isOperator && <th>{t('common.dealer')}</th>}
                    <th>{t('financing.customer')}</th>
                    <th>{t('workOrders.unit')}</th>
                    <th>{t('common.amount')}</th>
                    <th>{t('financing.term')}</th>
                    <th>{t('common.status')}</th>
                    <th>{t('financing.submitted')}</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {filteredApps.length === 0 ? (
                    <tr>
                      <td colSpan={isOperator ? 9 : 8} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                        {searchQ || statusFilter ? 'No applications match your filters.' : 'No financing applications yet.'}
                        {(isDealerOwner || isOperatorAdmin) && !searchQ && !statusFilter && (
                          <div style={{ marginTop: 10 }}>
                            <button className="btn btn-p btn-sm" onClick={() => navigate('financing/new')}>
                              + New Application
                            </button>
                          </div>
                        )}
                      </td>
                    </tr>
                  ) : filteredApps.map(app => (
                    <tr
                      key={app.id}
                      style={{ cursor: 'pointer' }}
                      onClick={() => navigate(`financing/${app.id}`)}
                    >
                      <td style={{ fontWeight: 500 }}>{app.applicationNumber}</td>
                      {isOperator && (
                        <td style={{ fontSize: 12, color: '#666' }}>
                          {app.dealershipId.slice(0, 8)}…
                        </td>
                      )}
                      <td style={{ fontSize: 12, color: '#444' }}>
                        {app.customerId.slice(0, 8)}…
                      </td>
                      <td style={{ fontSize: 12, color: '#666' }}>
                        {app.unitId ? app.unitId.slice(0, 8) + '…' : '—'}
                      </td>
                      <td style={{ fontWeight: 600 }}>{fmtCurrency(app.amountRequested)}</td>
                      <td style={{ fontSize: 12 }}>
                        {app.preferredTermMonths ? `${app.preferredTermMonths} mo` : '—'}
                      </td>
                      <td onClick={e => e.stopPropagation()}>{appStatusBadge(app.status)}</td>
                      <td style={{ fontSize: 12, color: '#888' }}>{fmtDate(app.createdAt)}</td>
                      <td onClick={e => e.stopPropagation()}>
                        <button
                          className="btn btn-o btn-sm"
                          style={{ fontSize: 11 }}
                          onClick={() => navigate(`financing/${app.id}`)}
                        >
                          {t('common.view')}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ── Tab: Lenders (operator: full table / dealer: card list) ── */}
      {activeTab === 'lenders' && (
        <div>
          {isOperator ? (
            // Operator: full table with edit/deactivate
            <div className="pn">
              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Lender</th>
                      <th>Contact Email</th>
                      <th>Contact Phone</th>
                      <th>Term Range</th>
                      <th>Loan Range</th>
                      <th>Status</th>
                      {isOperatorAdmin && <th></th>}
                    </tr>
                  </thead>
                  <tbody>
                    {lenders.length === 0 ? (
                      <tr>
                        <td colSpan={isOperatorAdmin ? 7 : 6} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                          No lenders configured yet.
                          {isOperatorAdmin && (
                            <div style={{ marginTop: 10 }}>
                              <button className="btn btn-p btn-sm" onClick={() => setShowLenderForm(true)}>
                                + Add First Lender
                              </button>
                            </div>
                          )}
                        </td>
                      </tr>
                    ) : lenders.map(l => (
                      <tr key={l.id}>
                        <td style={{ fontWeight: 600 }}>{l.name}</td>
                        <td style={{ fontSize: 12 }}>{l.contactEmail || '—'}</td>
                        <td style={{ fontSize: 12 }}>{l.contactPhone || '—'}</td>
                        <td style={{ fontSize: 12 }}>
                          {l.minTermMonths && l.maxTermMonths
                            ? `${l.minTermMonths}–${l.maxTermMonths} mo`
                            : l.maxTermMonths ? `Up to ${l.maxTermMonths} mo` : '—'}
                        </td>
                        <td style={{ fontSize: 12 }}>
                          {l.minLoanAmount && l.maxLoanAmount
                            ? `${fmtCurrency(l.minLoanAmount)} – ${fmtCurrency(l.maxLoanAmount)}`
                            : l.maxLoanAmount ? `Up to ${fmtCurrency(l.maxLoanAmount)}` : '—'}
                        </td>
                        <td>
                          <span className={l.active ? 'bg ok' : 'bg'} style={{ fontSize: 11, padding: '2px 8px' }}>
                            {l.active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        {isOperatorAdmin && (
                          <td>
                            {l.active && (
                              <button
                                className="btn btn-o btn-sm"
                                style={{ fontSize: 11 }}
                                onClick={() => handleDeactivateLender(l.id)}
                              >
                                Deactivate
                              </button>
                            )}
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ) : (
            // Dealer: active lender card list
            <div>
              {activeLenders.length === 0 ? (
                <div className="pn" style={{ textAlign: 'center', padding: 32, color: '#888' }}>
                  No lenders are currently available. Contact your operator.
                </div>
              ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
                  {activeLenders.map(l => (
                    <div key={l.id} className="pn" style={{ padding: 20 }}>
                      <div style={{ fontWeight: 700, fontSize: 14, marginBottom: 8 }}>{l.name}</div>
                      {l.contactEmail && (
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{l.contactEmail}</div>
                      )}
                      {l.contactPhone && (
                        <div style={{ fontSize: 12, color: '#666', marginBottom: 4 }}>{l.contactPhone}</div>
                      )}
                      {(l.minTermMonths || l.maxTermMonths) && (
                        <div style={{ fontSize: 12, marginTop: 8 }}>
                          <span style={{ color: '#888' }}>Term: </span>
                          {l.minTermMonths && l.maxTermMonths
                            ? `${l.minTermMonths}–${l.maxTermMonths} months`
                            : `Up to ${l.maxTermMonths} months`}
                        </div>
                      )}
                      {(l.minLoanAmount || l.maxLoanAmount) && (
                        <div style={{ fontSize: 12, marginTop: 4 }}>
                          <span style={{ color: '#888' }}>Loan: </span>
                          {l.maxLoanAmount ? `Up to ${fmtCurrency(l.maxLoanAmount)}` : '—'}
                        </div>
                      )}
                      {isDealerOwner && (
                        <button
                          className="btn btn-p btn-sm"
                          style={{ width: '100%', marginTop: 14, fontSize: 12 }}
                          onClick={() => navigate('financing/new')}
                        >
                          Start Application
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* ── Tab: Volume Report ── */}
      {activeTab === 'report' && (
        <div>
          {report === null ? (
            <div style={{ textAlign: 'center', padding: 32, color: '#888' }}>Loading report…</div>
          ) : (
            <>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12, marginBottom: 20 }}>
                {[
                  { label: 'Total Applications',  value: String(report.totalApplications) },
                  { label: 'Applications (MTD)',  value: String(report.mtdApplications) },
                  { label: 'Approved',            value: String(report.approvedCount) },
                  { label: 'Approval Rate',       value: `${report.approvalRate}%` },
                  { label: 'Total Volume (Approved)', value: fmtCurrency(report.totalVolume) },
                  { label: 'Avg Loan Amount',     value: fmtCurrency(report.avgLoan) },
                ].map(s => (
                  <div key={s.label} className="sc">
                    <div className="sc-l" style={{ marginBottom: 8 }}>{s.label}</div>
                    <div className="sc-v">{s.value}</div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}

      {dataError && (
        <div style={{ marginTop: 16, padding: '10px 16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
          {dataError}
        </div>
      )}
    </div>
  );
}
