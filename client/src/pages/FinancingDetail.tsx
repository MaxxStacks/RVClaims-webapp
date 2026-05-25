// client/src/pages/FinancingDetail.tsx — Financing Application Detail
// Role-aware:
//   operator_admin  — full detail + lender submissions + approve/update status + add submissions
//   operator_staff  — full detail + lender submissions (read-only)
//   dealer_owner    — application details + approval info if approved (read-only)
//   dealer_staff    — same as dealer_owner (read-only)
//   financial_manager — same as dealer_owner (read-only)
//   client          — simplified status card (own applications only)

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface FinancingApp {
  id: string;
  applicationNumber: string;
  dealershipId: string;
  customerId: string;
  unitId: string | null;
  submittedByUserId: string | null;
  amountRequested: string;
  downPayment: string | null;
  preferredTermMonths: number | null;
  creditInfo: Record<string, unknown>;
  status: string;
  acceptedLenderId: string | null;
  acceptedTerms: Record<string, unknown> | null;
  withdrawnAt: string | null;
  withdrawalReason: string | null;
  createdAt: string;
  updatedAt: string;
}

interface LenderSubmission {
  id: string;
  applicationId: string;
  lenderId: string;
  status: string;
  submittedAt: string | null;
  respondedAt: string | null;
  approvedRate: string | null;
  approvedTermMonths: number | null;
  approvedAmount: string | null;
  approvedConditions: Record<string, unknown> | null;
  declineReason: string | null;
  lenderReferenceId: string | null;
  createdAt: string;
}

interface AcceptedLender {
  id: string;
  name: string;
  contactEmail: string | null;
}

interface Lender {
  id: string;
  name: string;
  active: boolean;
}

const STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft:     { label: 'Draft',           cls: 'bg'            },
  submitted: { label: 'Submitted',       cls: 'bg info'       },
  shopping:  { label: 'Shopping Lenders',cls: 'bg in-progress' },
  approved:  { label: 'Approved',        cls: 'bg ok'         },
  declined:  { label: 'Declined',        cls: 'bg denied'     },
  completed: { label: 'Funded',          cls: 'bg active'     },
};

const SUB_STATUS_LABELS: Record<string, { label: string; cls: string }> = {
  draft:          { label: 'Draft',          cls: 'bg'            },
  submitted:      { label: 'Submitted',      cls: 'bg info'       },
  pending_review: { label: 'Under Review',   cls: 'bg in-progress'},
  approved:       { label: 'Approved',       cls: 'bg ok'         },
  declined:       { label: 'Declined',       cls: 'bg denied'     },
  counter_offered:{ label: 'Counter',        cls: 'bg ow'         },
  withdrawn:      { label: 'Withdrawn',      cls: 'bg'            },
  accepted:       { label: 'Accepted',       cls: 'bg active'     },
  funded:         { label: 'Funded',         cls: 'bg active'     },
};

function appBadge(status: string) {
  const m = STATUS_LABELS[status] || { label: status, cls: 'bg' };
  return <span className={m.cls} style={{ fontSize: 13, padding: '6px 16px' }}>{m.label}</span>;
}

function subBadge(status: string) {
  const m = SUB_STATUS_LABELS[status] || { label: status, cls: 'bg' };
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
  return new Date(val).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' });
}

export default function FinancingDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ finId: string }>();
  const { user } = useAuth();

  // Extract financingId from either wouter params or URL path
  const financingId = params.finId || (() => {
    const segs = location.split('/');
    const idx = segs.indexOf('financing');
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  const role = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isOperator      = role === 'operator_admin' || role === 'operator_staff';
  const isDealerOwner   = role === 'dealer_owner';
  const isDealerStaff   = role === 'dealer_staff';
  const isFinancialMgr  = role === 'financial_manager';
  const isClient        = role === 'client';
  const hasAccess       = isOperator || isDealerOwner || isDealerStaff || isFinancialMgr || isClient;

  // ── State ──────────────────────────────────────────────────────────────────
  const [app, setApp]               = useState<FinancingApp | null>(null);
  const [submissions, setSubmissions] = useState<LenderSubmission[]>([]);
  const [acceptedLender, setAcceptedLender] = useState<AcceptedLender | null>(null);
  const [allLenders, setAllLenders] = useState<Lender[]>([]);
  const [isLoading, setIsLoading]   = useState(true);
  const [dataError, setDataError]   = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Operator status update form
  const [newStatus, setNewStatus]           = useState('');
  const [statusSaving, setStatusSaving]     = useState(false);

  // Operator approval form (set accepted terms)
  const [showApprovalForm, setShowApprovalForm] = useState(false);
  const [apvLenderId, setApvLenderId]           = useState('');
  const [apvRate, setApvRate]                   = useState('');
  const [apvTerm, setApvTerm]                   = useState('');
  const [apvAmount, setApvAmount]               = useState('');
  const [apvConditions, setApvConditions]       = useState('');
  const [apvSaving, setApvSaving]               = useState(false);

  // Add lender submission form
  const [showSubForm, setShowSubForm]   = useState(false);
  const [subLenderId, setSubLenderId]   = useState('');
  const [subSaving, setSubSaving]       = useState(false);

  // Submission result update
  const [editSubId, setEditSubId]       = useState<string | null>(null);
  const [editSubStatus, setEditSubStatus] = useState('');
  const [editSubRate, setEditSubRate]   = useState('');
  const [editSubTerm, setEditSubTerm]   = useState('');
  const [editSubAmount, setEditSubAmount] = useState('');
  const [editSubDecline, setEditSubDecline] = useState('');
  const [editSubRef, setEditSubRef]     = useState('');
  const [editSubSaving, setEditSubSaving] = useState(false);

  // ── Load application ───────────────────────────────────────────────────────
  const loadApp = useCallback(async () => {
    if (!financingId) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const d = await apiFetch<any>(`/api/financing/applications/${financingId}`);
      setApp(d.application || d);
      setSubmissions(Array.isArray(d.submissions) ? d.submissions : []);
      setAcceptedLender(d.acceptedLender || null);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load application');
    } finally {
      setIsLoading(false);
    }
  }, [financingId]);

  // Load all lenders for submission form
  useEffect(() => {
    if (!isOperatorAdmin) return;
    apiFetch<any>('/api/financing/lenders')
      .then(d => setAllLenders(Array.isArray(d.lenders) ? d.lenders : []))
      .catch(() => {});
  }, [isOperatorAdmin]);

  useEffect(() => { loadApp(); }, [loadApp]);

  // Determine back path
  function goBack() {
    const segs = location.split('/').filter(Boolean);
    const idx = segs.lastIndexOf(financingId || '');
    if (idx > 0) {
      navigate('/' + segs.slice(0, idx).join('/'));
    } else {
      navigate(-1 as any);
    }
  }

  // ── Handlers ───────────────────────────────────────────────────────────────
  const handleStatusUpdate = async () => {
    if (!newStatus || !app) return;
    setStatusSaving(true);
    try {
      await apiFetch(`/api/financing/applications/${app.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: newStatus }),
      });
      showToast(`Status updated to ${newStatus}`);
      setNewStatus('');
      loadApp();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleApprovalSave = async () => {
    if (!app) return;
    if (!apvLenderId) { showToast('Select the accepted lender'); return; }
    if (!apvRate || !apvTerm || !apvAmount) {
      showToast('Rate, term, and approved amount are required');
      return;
    }
    setApvSaving(true);
    try {
      await apiFetch(`/api/financing/applications/${app.id}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'approved',
          acceptedLenderId: apvLenderId,
          acceptedTerms: {
            approvedRate: apvRate,
            approvedTermMonths: parseInt(apvTerm),
            approvedAmount: apvAmount,
            conditions: apvConditions.trim() || null,
          },
        }),
      });
      showToast('Application approved and terms saved');
      setShowApprovalForm(false);
      loadApp();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save approval');
    } finally {
      setApvSaving(false);
    }
  };

  const handleAddSubmission = async () => {
    if (!subLenderId || !app) { showToast('Select a lender'); return; }
    setSubSaving(true);
    try {
      await apiFetch(`/api/financing/applications/${app.id}/submissions`, {
        method: 'POST',
        body: JSON.stringify({ lenderId: subLenderId, status: 'submitted' }),
      });
      showToast('Submission added');
      setSubLenderId('');
      setShowSubForm(false);
      loadApp();
    } catch (err: any) {
      showToast(err?.message || 'Failed to add submission');
    } finally {
      setSubSaving(false);
    }
  };

  const startEditSub = (sub: LenderSubmission) => {
    setEditSubId(sub.id);
    setEditSubStatus(sub.status);
    setEditSubRate(sub.approvedRate || '');
    setEditSubTerm(sub.approvedTermMonths ? String(sub.approvedTermMonths) : '');
    setEditSubAmount(sub.approvedAmount || '');
    setEditSubDecline(sub.declineReason || '');
    setEditSubRef(sub.lenderReferenceId || '');
  };

  const handleUpdateSubmission = async () => {
    if (!editSubId) return;
    setEditSubSaving(true);
    try {
      await apiFetch(`/api/financing/submissions/${editSubId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: editSubStatus || undefined,
          approvedRate: editSubRate || undefined,
          approvedTermMonths: editSubTerm || undefined,
          approvedAmount: editSubAmount || undefined,
          declineReason: editSubDecline || undefined,
          lenderReferenceId: editSubRef || undefined,
        }),
      });
      showToast('Submission updated');
      setEditSubId(null);
      loadApp();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update submission');
    } finally {
      setEditSubSaving(false);
    }
  };

  // ── Guards ─────────────────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          You do not have permission to view this application.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ color: '#888', fontSize: 14 }}>Loading application…</div>
      </div>
    );
  }

  if (dataError || !app) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center' }}>
          <div style={{ color: '#dc2626', fontSize: 14, marginBottom: 12 }}>{dataError || 'Application not found.'}</div>
          <button className="btn btn-o btn-sm" onClick={goBack}>Go Back</button>
        </div>
      </div>
    );
  }

  // Accepted terms helper
  const terms = app.acceptedTerms as Record<string, any> | null;
  const isApproved = app.status === 'approved' || app.status === 'completed';

  // ── Client simplified view ─────────────────────────────────────────────────
  if (isClient) {
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
          <button className="detail-back" onClick={goBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6"/>
            </svg>
          </button>
          <div className="detail-info">
            <div className="detail-title">{app.applicationNumber}</div>
            <div className="detail-meta">Financing Application · Submitted {fmtDate(app.createdAt)}</div>
          </div>
          {appBadge(app.status)}
        </div>

        <div className="pn" style={{ padding: 24, maxWidth: 560 }}>
          {app.status === 'submitted' || app.status === 'shopping' ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>⏳</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6 }}>Your application is under review</div>
              <div style={{ color: '#888', fontSize: 13 }}>
                Submitted {fmtDate(app.createdAt)} · We will notify you when lenders respond.
              </div>
            </div>
          ) : isApproved ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>✅</div>
              <div style={{ fontWeight: 700, fontSize: 16, color: '#16a34a', marginBottom: 10 }}>
                Your financing has been approved!
              </div>
              {acceptedLender && (
                <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>{acceptedLender.name}</div>
              )}
              {terms && (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                  {terms.approvedAmount && (
                    <div className="sc">
                      <div className="sc-l" style={{ marginBottom: 4 }}>Approved Amount</div>
                      <div style={{ fontWeight: 700, fontSize: 20, color: '#08235d' }}>{fmtCurrency(terms.approvedAmount)}</div>
                    </div>
                  )}
                  {terms.approvedRate && (
                    <div className="sc">
                      <div className="sc-l" style={{ marginBottom: 4 }}>Interest Rate</div>
                      <div style={{ fontWeight: 700, fontSize: 20, color: '#08235d' }}>{terms.approvedRate}%</div>
                    </div>
                  )}
                  {terms.approvedTermMonths && (
                    <div className="sc">
                      <div className="sc-l" style={{ marginBottom: 4 }}>Term</div>
                      <div style={{ fontWeight: 700, fontSize: 20, color: '#08235d' }}>{terms.approvedTermMonths} months</div>
                    </div>
                  )}
                </div>
              )}
              {terms?.conditions && (
                <div style={{ marginTop: 16, fontSize: 13, color: '#666' }}>{terms.conditions}</div>
              )}
            </div>
          ) : app.status === 'declined' ? (
            <div style={{ textAlign: 'center', padding: 20 }}>
              <div style={{ fontSize: 28, marginBottom: 10 }}>❌</div>
              <div style={{ fontWeight: 600, fontSize: 15, marginBottom: 6, color: '#dc2626' }}>Application not approved</div>
              <div style={{ color: '#888', fontSize: 13 }}>
                Please contact your dealer for alternative financing options.
              </div>
            </div>
          ) : (
            <div style={{ textAlign: 'center', padding: 20, color: '#888', fontSize: 13 }}>
              Application status: {app.status}
            </div>
          )}
        </div>
      </div>
    );
  }

  // ── Full detail view (operator + dealer) ──────────────────────────────────
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
          <div className="detail-title">{app.applicationNumber}</div>
          <div className="detail-meta">
            Requested {fmtCurrency(app.amountRequested)}
            {app.preferredTermMonths ? ` · ${app.preferredTermMonths} months preferred` : ''}
            {' · '}Submitted {fmtDate(app.createdAt)}
          </div>
        </div>
        {appBadge(app.status)}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left column */}
        <div>
          {/* Operator: Lender Submissions */}
          {isOperator && (
            <div className="pn" style={{ marginBottom: 16 }}>
              <div className="pn-h">
                <span className="pn-t">Lender Submissions</span>
                {isOperatorAdmin && (
                  <span className="pn-a" style={{ cursor: 'pointer' }} onClick={() => setShowSubForm(v => !v)}>
                    {showSubForm ? 'Cancel' : '+ Add Lender'}
                  </span>
                )}
              </div>

              {/* Add submission form */}
              {isOperatorAdmin && showSubForm && (
                <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0' }}>
                  <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                    <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                      <label>Lender</label>
                      <select value={subLenderId} onChange={e => setSubLenderId(e.target.value)}>
                        <option value="">Select lender…</option>
                        {allLenders.filter(l => l.active).map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                    <button className="btn btn-p btn-sm" onClick={handleAddSubmission} disabled={subSaving}>
                      {subSaving ? 'Adding…' : 'Add'}
                    </button>
                  </div>
                </div>
              )}

              <div className="tw">
                <table>
                  <thead>
                    <tr>
                      <th>Lender</th>
                      <th>Reference #</th>
                      <th>Submitted</th>
                      <th>Rate</th>
                      <th>Term</th>
                      <th>Amount</th>
                      <th>Status</th>
                      {isOperatorAdmin && <th>Action</th>}
                    </tr>
                  </thead>
                  <tbody>
                    {submissions.length === 0 ? (
                      <tr>
                        <td colSpan={isOperatorAdmin ? 8 : 7} style={{ textAlign: 'center', padding: 20, color: '#888' }}>
                          No lender submissions yet.
                          {isOperatorAdmin && (
                            <span
                              style={{ marginLeft: 8, color: '#08235d', cursor: 'pointer', textDecoration: 'underline' }}
                              onClick={() => setShowSubForm(true)}
                            >
                              Add first lender
                            </span>
                          )}
                        </td>
                      </tr>
                    ) : submissions.map(sub => (
                      <tr key={sub.id}>
                        <td style={{ fontWeight: 500 }}>
                          {allLenders.find(l => l.id === sub.lenderId)?.name || sub.lenderId.slice(0, 8) + '…'}
                          {sub.lenderId === app.acceptedLenderId && (
                            <span className="bg ok" style={{ fontSize: 10, padding: '1px 5px', marginLeft: 6 }}>Selected</span>
                          )}
                        </td>
                        <td style={{ fontSize: 12 }}>{sub.lenderReferenceId || '—'}</td>
                        <td style={{ fontSize: 12 }}>{sub.submittedAt ? fmtDate(sub.submittedAt) : '—'}</td>
                        <td style={{ fontSize: 12 }}>{sub.approvedRate ? `${sub.approvedRate}%` : '—'}</td>
                        <td style={{ fontSize: 12 }}>
                          {sub.approvedTermMonths ? `${sub.approvedTermMonths} mo` : '—'}
                        </td>
                        <td style={{ fontSize: 12 }}>{fmtCurrency(sub.approvedAmount)}</td>
                        <td>{subBadge(sub.status)}</td>
                        {isOperatorAdmin && (
                          <td>
                            <button
                              className="btn btn-o btn-sm"
                              style={{ fontSize: 11 }}
                              onClick={() => startEditSub(sub)}
                            >
                              Update
                            </button>
                          </td>
                        )}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Inline submission update form */}
              {isOperatorAdmin && editSubId && (
                <div style={{ padding: '16px 20px', background: '#f9f9f9', borderTop: '1px solid #e8e8e8' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>
                    Update Submission Result
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Status</label>
                      <select value={editSubStatus} onChange={e => setEditSubStatus(e.target.value)}>
                        <option value="submitted">Submitted</option>
                        <option value="pending_review">Under Review</option>
                        <option value="approved">Approved</option>
                        <option value="declined">Declined</option>
                        <option value="counter_offered">Counter Offered</option>
                        <option value="accepted">Accepted</option>
                        <option value="funded">Funded</option>
                        <option value="withdrawn">Withdrawn</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Lender Reference #</label>
                      <input value={editSubRef} onChange={e => setEditSubRef(e.target.value)} placeholder="Lender's ref ID" />
                    </div>
                    <div className="form-group">
                      <label>Approved Rate (%)</label>
                      <input type="number" step="0.001" value={editSubRate} onChange={e => setEditSubRate(e.target.value)} placeholder="e.g. 5.49" />
                    </div>
                    <div className="form-group">
                      <label>Approved Term (months)</label>
                      <input type="number" value={editSubTerm} onChange={e => setEditSubTerm(e.target.value)} placeholder="e.g. 120" />
                    </div>
                    <div className="form-group">
                      <label>Approved Amount ($)</label>
                      <input type="number" step="0.01" value={editSubAmount} onChange={e => setEditSubAmount(e.target.value)} placeholder="e.g. 42500" />
                    </div>
                    <div className="form-group">
                      <label>Decline Reason</label>
                      <input value={editSubDecline} onChange={e => setEditSubDecline(e.target.value)} placeholder="Reason if declined…" />
                    </div>
                  </div>
                  <div className="btn-bar">
                    <button className="btn btn-p btn-sm" onClick={handleUpdateSubmission} disabled={editSubSaving}>
                      {editSubSaving ? 'Saving…' : 'Save Update'}
                    </button>
                    <button className="btn btn-o btn-sm" onClick={() => setEditSubId(null)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Approval details panel (visible to all if approved) */}
          {isApproved && terms && (
            <div className="pn" style={{ marginBottom: 16, borderLeft: '3px solid #22c55e' }}>
              <div className="pn-h"><span className="pn-t">Approval Terms</span></div>
              <div style={{ padding: '4px 20px 16px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 12 }}>
                  {[
                    { label: 'Lender',          value: acceptedLender?.name || '—' },
                    { label: 'Approved Amount', value: fmtCurrency(terms.approvedAmount) },
                    { label: 'Interest Rate',   value: terms.approvedRate ? `${terms.approvedRate}%` : '—' },
                    { label: 'Term',            value: terms.approvedTermMonths ? `${terms.approvedTermMonths} months` : '—' },
                  ].map(item => (
                    <div key={item.label} className="sc">
                      <div className="sc-l" style={{ marginBottom: 4 }}>{item.label}</div>
                      <div style={{ fontWeight: 700, fontSize: 16, color: '#08235d' }}>{item.value}</div>
                    </div>
                  ))}
                </div>
                {terms.conditions && (
                  <div style={{ marginTop: 12, fontSize: 13, color: '#666' }}>
                    <strong>Conditions:</strong> {terms.conditions}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Operator Admin: Status update */}
          {isOperatorAdmin && (
            <div className="pn" style={{ marginBottom: 16 }}>
              <div className="pn-h"><span className="pn-t">Update Status</span></div>
              <div style={{ padding: '12px 20px 16px' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'flex-end' }}>
                  <div className="form-group" style={{ flex: 1, marginBottom: 0 }}>
                    <label>New Status</label>
                    <select value={newStatus} onChange={e => setNewStatus(e.target.value)}>
                      <option value="">Select status…</option>
                      <option value="submitted">Submitted</option>
                      <option value="shopping">Shopping Lenders</option>
                      <option value="approved">Approved</option>
                      <option value="declined">Declined</option>
                      <option value="completed">Funded</option>
                    </select>
                  </div>
                  <button
                    className="btn btn-p btn-sm"
                    onClick={handleStatusUpdate}
                    disabled={!newStatus || statusSaving}
                  >
                    {statusSaving ? 'Saving…' : 'Update'}
                  </button>
                </div>
              </div>

              {/* Approval form toggle */}
              <div style={{ padding: '0 20px 16px' }}>
                <button
                  className="btn btn-o btn-sm"
                  onClick={() => setShowApprovalForm(v => !v)}
                >
                  {showApprovalForm ? 'Cancel Approval Form' : '✓ Record Approval Terms'}
                </button>
              </div>

              {/* Approval form */}
              {showApprovalForm && (
                <div style={{ padding: '12px 20px 16px', borderTop: '1px solid #f0f0f0', background: '#f9fafb' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 12 }}>Record Accepted Terms</div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Accepted Lender *</label>
                      <select value={apvLenderId} onChange={e => setApvLenderId(e.target.value)}>
                        <option value="">Select lender…</option>
                        {allLenders.map(l => (
                          <option key={l.id} value={l.id}>{l.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Approved Rate (%) *</label>
                      <input type="number" step="0.001" value={apvRate} onChange={e => setApvRate(e.target.value)} placeholder="e.g. 5.49" />
                    </div>
                    <div className="form-group">
                      <label>Approved Term (months) *</label>
                      <input type="number" value={apvTerm} onChange={e => setApvTerm(e.target.value)} placeholder="e.g. 120" />
                    </div>
                    <div className="form-group">
                      <label>Approved Amount ($) *</label>
                      <input type="number" step="0.01" value={apvAmount} onChange={e => setApvAmount(e.target.value)} placeholder="e.g. 42500" />
                    </div>
                    <div className="form-group full">
                      <label>Conditions / Notes</label>
                      <textarea
                        value={apvConditions}
                        onChange={e => setApvConditions(e.target.value)}
                        placeholder="Any lender conditions or notes…"
                        rows={2}
                      />
                    </div>
                  </div>
                  <div className="btn-bar">
                    <button className="btn btn-p btn-sm" onClick={handleApprovalSave} disabled={apvSaving}>
                      {apvSaving ? 'Saving…' : 'Save Approval'}
                    </button>
                    <button className="btn btn-o btn-sm" onClick={() => setShowApprovalForm(false)}>Cancel</button>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Right column — application details */}
        <div>
          <div className="cd-section">
            <div className="cd-section-h">Application Details</div>
            <div className="cd-row">
              <span className="cd-label">App #</span>
              <span className="cd-value" style={{ fontWeight: 600 }}>{app.applicationNumber}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Status</span>
              <span className="cd-value">{appBadge(app.status)}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Requested</span>
              <span className="cd-value" style={{ fontWeight: 600 }}>{fmtCurrency(app.amountRequested)}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Down Payment</span>
              <span className="cd-value">{fmtCurrency(app.downPayment)}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Preferred Term</span>
              <span className="cd-value">
                {app.preferredTermMonths ? `${app.preferredTermMonths} months` : '—'}
              </span>
            </div>
            {app.creditInfo && (app.creditInfo as any).creditScore && (
              <div className="cd-row">
                <span className="cd-label">Credit Score</span>
                <span className="cd-value">{(app.creditInfo as any).creditScore}</span>
              </div>
            )}
            <div className="cd-row">
              <span className="cd-label">Submitted</span>
              <span className="cd-value">{fmtDate(app.createdAt)}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Last Updated</span>
              <span className="cd-value">{fmtDate(app.updatedAt)}</span>
            </div>
          </div>

          {/* Customer / Unit section */}
          <div className="cd-section">
            <div className="cd-section-h">References</div>
            <div className="cd-row">
              <span className="cd-label">Customer ID</span>
              <span className="cd-value" style={{ fontSize: 12 }}>{app.customerId}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Unit ID</span>
              <span className="cd-value" style={{ fontSize: 12 }}>{app.unitId || '—'}</span>
            </div>
            {isOperator && (
              <div className="cd-row">
                <span className="cd-label">Dealership ID</span>
                <span className="cd-value" style={{ fontSize: 12 }}>{app.dealershipId.slice(0, 8)}…</span>
              </div>
            )}
          </div>

          {/* Notes from acceptedTerms */}
          {app.acceptedTerms && (app.acceptedTerms as any).notes && (
            <div className="cd-section">
              <div className="cd-section-h">Notes</div>
              <div style={{ padding: '8px 0', fontSize: 13, color: '#444', lineHeight: 1.6 }}>
                {(app.acceptedTerms as any).notes}
              </div>
            </div>
          )}

          {/* Withdrawn info */}
          {app.status === 'declined' && app.withdrawalReason && (
            <div className="cd-section">
              <div className="cd-section-h">Decline Reason</div>
              <div style={{ padding: '8px 0', fontSize: 13, color: '#dc2626' }}>
                {app.withdrawalReason}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
