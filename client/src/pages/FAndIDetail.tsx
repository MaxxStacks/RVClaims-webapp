// client/src/pages/FAndIDetail.tsx — F&I Deal Detail
// Role-aware: operator_admin (full actions), operator_staff (view + update notes),
//             dealer_owner (view + status transitions), dealer_staff (view only),
//             financial_manager (view only)

import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

interface FiDeal {
  id: string;
  dealNumber: string;
  dealershipId: string;
  unitId: string | null;
  customerName: string;
  salePrice: string | null;
  financing: string | null;
  productsOffered: number;
  productsSold: number;
  revenue: string | null;
  dealerNotes: string | null;
  status: 'flagged' | 'recommending' | 'presented' | 'completed';
  createdAt: string;
  updatedAt: string;
}

function statusBadge(status: string) {
  const map: Record<string, { label: string; cls: string }> = {
    flagged:      { label: 'Flagged',      cls: 'bg ow'          },
    recommending: { label: 'Recommending', cls: 'bg in-progress'  },
    presented:    { label: 'Presented',    cls: 'bg info'         },
    completed:    { label: 'Completed',    cls: 'bg ok'           },
  };
  const m = map[status] || { label: status, cls: 'bg' };
  return <span className={m.cls} style={{ fontSize: 13, padding: '6px 16px' }}>{m.label}</span>;
}

export default function FAndIDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ dealId?: string }>();
  const { user } = useAuth();

  // Resolve dealId from route params or URL path
  const dealId = params.dealId || (() => {
    const segments = location.split('/');
    const idx = segments.findIndex(s => s === 'fi-detail');
    return idx >= 0 ? segments[idx + 1] : null;
  })();

  const role            = user?.role as string | undefined;
  const isOperatorAdmin = role === 'operator_admin';
  const isOperator      = role === 'operator_admin' || role === 'operator_staff';
  const isDealerOwner   = role === 'dealer_owner';
  const isDealerStaff   = role === 'dealer_staff';
  const isFinancialMgr  = role === 'financial_manager';
  const canEdit         = isOperatorAdmin || isDealerOwner;
  const hasAccess       = isOperator || isDealerOwner || isDealerStaff || isFinancialMgr;

  const [deal, setDeal]               = useState<FiDeal | null>(null);
  const [isLoading, setIsLoading]     = useState(true);
  const [dataError, setDataError]     = useState<string | null>(null);
  const [statusSaving, setStatusSaving] = useState(false);
  const [notesSaving, setNotesSaving]   = useState(false);
  const [notesText, setNotesText]       = useState('');
  const [editingNotes, setEditingNotes] = useState(false);

  // AI Presenter
  const [showPresenterModal, setShowPresenterModal] = useState(false);
  const [presenterEmail, setPresenterEmail] = useState('');
  const [presenterProducts, setPresenterProducts] = useState<any[]>([]);
  const [presenterSelectedIds, setPresenterSelectedIds] = useState<Set<string>>(new Set());
  const [presenterLaunching, setPresenterLaunching] = useState(false);
  const [presenterSession, setPresenterSession] = useState<{ sessionUrl: string } | null>(null);
  const [presenterLinkCopied, setPresenterLinkCopied] = useState(false);

  // Products sold / revenue edit (operator_admin + dealer_owner)
  const [editingMetrics, setEditingMetrics]   = useState(false);
  const [editProductsSold, setEditProductsSold] = useState('');
  const [editRevenue, setEditRevenue]           = useState('');

  // Toast
  const [toastMsg, setToastMsg]         = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadDeal = useCallback(async () => {
    if (!dealId) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const d = await apiFetch<any>(`/api/fi-deals/${dealId}`);
      const fd: FiDeal = d.fiDeal;
      setDeal(fd);
      setNotesText(fd.dealerNotes || '');
      setEditProductsSold(String(fd.productsSold));
      setEditRevenue(fd.revenue || '');
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load deal');
    } finally {
      setIsLoading(false);
    }
  }, [dealId]);

  useEffect(() => { loadDeal(); }, [loadDeal]);

  // Load products when presenter modal opens
  useEffect(() => {
    if (!showPresenterModal) return;
    apiFetch<any>('/api/fi/products')
      .then(d => {
        const prods = Array.isArray(d.products) ? d.products.filter((p: any) => p.isActive) : [];
        setPresenterProducts(prods);
        setPresenterSelectedIds(new Set(prods.map((p: any) => p.id)));
      })
      .catch(() => setPresenterProducts([]));
  }, [showPresenterModal]);

  // ── Handlers ─────────────────────────────────────────────────────────────────
  const handleStatusUpdate = async (status: string) => {
    if (!deal) return;
    setStatusSaving(true);
    try {
      await apiFetch(`/api/fi/deals/${deal.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      showToast(`Status updated to ${status}`);
      loadDeal();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update status');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSaveNotes = async () => {
    if (!deal) return;
    setNotesSaving(true);
    try {
      await apiFetch(`/api/fi/deals/${deal.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ dealerNotes: notesText }),
      });
      showToast('Notes saved');
      setEditingNotes(false);
      loadDeal();
    } catch (err: any) {
      showToast(err?.message || 'Failed to save notes');
    } finally {
      setNotesSaving(false);
    }
  };

  const handleSaveMetrics = async () => {
    if (!deal) return;
    setStatusSaving(true);
    try {
      await apiFetch(`/api/fi/deals/${deal.id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({
          productsSold: parseInt(editProductsSold) || 0,
          revenue: editRevenue || null,
        }),
      });
      showToast('Deal metrics updated');
      setEditingMetrics(false);
      loadDeal();
    } catch (err: any) {
      showToast(err?.message || 'Failed to update metrics');
    } finally {
      setStatusSaving(false);
    }
  };

  // ── Guard: access ─────────────────────────────────────────────────────────────
  if (!hasAccess) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          You do not have permission to view this deal.
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ color: '#888', fontSize: 14 }}>Loading deal…</div>
      </div>
    );
  }

  if (dataError || !deal) {
    return (
      <div className="page active">
        <div style={{ padding: '16px', background: '#fef2f2', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
          {dataError || 'Deal not found'}
        </div>
      </div>
    );
  }

  // ── AI Presenter launch ───────────────────────────────────────────────────────
  const handleLaunchPresenter = async () => {
    if (!deal) return;
    if (!presenterEmail.trim()) { showToast('Customer email is required'); return; }
    if (presenterSelectedIds.size === 0) { showToast('Select at least one product'); return; }
    setPresenterLaunching(true);
    try {
      const selectedProducts = presenterProducts
        .filter(p => presenterSelectedIds.has(p.id))
        .map(p => ({
          id: p.id, name: p.name,
          description: p.description || '',
          price: p.price || '0',
          category: 'other', features: [], objectionHandlers: {},
        }));
      const body: Record<string, unknown> = {
        customerName: deal.customerName,
        customerEmail: presenterEmail.trim(),
        products: selectedProducts,
        dealershipId: deal.dealershipId,
      };
      if (deal.unitId) body.unitId = deal.unitId;
      const data = await apiFetch<any>('/api/ai/fi-session', {
        method: 'POST',
        body: JSON.stringify(body),
      });
      if (data.success && data.session) {
        setPresenterSession({ sessionUrl: data.session.sessionUrl });
      } else {
        showToast('Failed to create presenter session');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to launch presenter');
    } finally {
      setPresenterLaunching(false);
    }
  };

  // ── Status workflow buttons ───────────────────────────────────────────────────
  const nextStatusBtn = () => {
    if (!canEdit) return null;
    const transitions: Record<string, { next: string; label: string }> = {
      flagged:      { next: 'recommending', label: 'Start Recommending' },
      recommending: { next: 'presented',    label: 'Mark Presented'     },
      presented:    { next: 'completed',    label: 'Mark Completed'     },
    };
    const t = transitions[deal.status];
    if (!t) return null;
    return (
      <button
        className="btn btn-p btn-sm"
        onClick={() => handleStatusUpdate(t.next)}
        disabled={statusSaving}
        style={{ marginRight: 8 }}
      >
        {statusSaving ? 'Saving…' : t.label}
      </button>
    );
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

      {/* Header */}
      <div className="detail-header">
        <button
          className="detail-back"
          onClick={() => navigate(isOperator ? '../svc-fi' : '../fi')}
        >
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">{deal.dealNumber} — {deal.customerName}</div>
          <div className="detail-meta">
            {deal.financing ? `Financing: ${deal.financing} · ` : ''}
            {deal.productsOffered} products offered, {deal.productsSold} sold
          </div>
        </div>
        {statusBadge(deal.status)}
      </div>

      {/* Action buttons */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
        {nextStatusBtn()}
        {isOperatorAdmin && deal.status !== 'flagged' && (
          <button
            className="btn btn-o btn-sm"
            onClick={() => handleStatusUpdate('flagged')}
            disabled={statusSaving}
          >
            Reset to Flagged
          </button>
        )}
        {canEdit && (
          <button
            className="btn btn-o btn-sm"
            style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}
            onClick={() => setShowPresenterModal(true)}
          >
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
            </svg>
            Send F&amp;I Presentation
          </button>
        )}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        {/* Left: Products & Notes */}
        <div>
          {/* Products / metrics panel */}
          <div className="pn" style={{ marginBottom: 16 }}>
            <div className="pn-h">
              <span className="pn-t">Deal Metrics</span>
              {canEdit && !editingMetrics && (
                <span className="pn-a" onClick={() => setEditingMetrics(true)}>Edit</span>
              )}
            </div>
            {editingMetrics ? (
              <div style={{ padding: '16px 20px' }}>
                <div className="form-grid">
                  <div className="form-group">
                    <label>Products Sold</label>
                    <input type="number" min="0" value={editProductsSold} onChange={e => setEditProductsSold(e.target.value)} />
                  </div>
                  <div className="form-group">
                    <label>Total Revenue ($)</label>
                    <input type="number" min="0" step="0.01" value={editRevenue} onChange={e => setEditRevenue(e.target.value)} placeholder="0.00" />
                  </div>
                </div>
                <div className="btn-bar">
                  <button className="btn btn-p btn-sm" onClick={handleSaveMetrics} disabled={statusSaving}>
                    {statusSaving ? 'Saving…' : 'Save Metrics'}
                  </button>
                  <button className="btn btn-o btn-sm" onClick={() => setEditingMetrics(false)}>Cancel</button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px 20px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16 }}>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#033280' }}>{deal.productsOffered}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Products Offered</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#22c55e' }}>{deal.productsSold}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Products Sold</div>
                  </div>
                  <div style={{ textAlign: 'center' }}>
                    <div style={{ fontSize: 28, fontWeight: 700 }}>
                      {deal.revenue ? `$${parseFloat(deal.revenue).toLocaleString('en-CA')}` : '—'}
                    </div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 4 }}>Revenue</div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Notes panel */}
          <div className="pn">
            <div className="pn-h">
              <span className="pn-t">Notes</span>
              {canEdit && !editingNotes && (
                <span className="pn-a" onClick={() => setEditingNotes(true)}>Edit</span>
              )}
            </div>
            {editingNotes ? (
              <div style={{ padding: '16px 20px' }}>
                <textarea
                  value={notesText}
                  onChange={e => setNotesText(e.target.value)}
                  placeholder="Deal notes, customer preferences, follow-up details…"
                  rows={4}
                  style={{
                    width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0',
                    borderRadius: 8, fontSize: 13, fontFamily: 'inherit', resize: 'vertical', outline: 'none',
                  }}
                />
                <div style={{ textAlign: 'right', marginTop: 8, display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
                  <button className="btn btn-p btn-sm" onClick={handleSaveNotes} disabled={notesSaving}>
                    {notesSaving ? 'Saving…' : 'Save Notes'}
                  </button>
                  <button className="btn btn-o btn-sm" onClick={() => { setEditingNotes(false); setNotesText(deal.dealerNotes || ''); }}>
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div style={{ padding: '16px 20px', fontSize: 13, color: deal.dealerNotes ? '#444' : '#aaa', lineHeight: 1.6 }}>
                {deal.dealerNotes || 'No notes yet.'}
              </div>
            )}
          </div>
        </div>

        {/* Right: Deal Info */}
        <div>
          <div className="cd-section">
            <div className="cd-section-h">Customer</div>
            <div className="cd-row">
              <span className="cd-label">Name</span>
              <span className="cd-value">{deal.customerName}</span>
            </div>
          </div>

          <div className="cd-section">
            <div className="cd-section-h">Deal Info</div>
            <div className="cd-row">
              <span className="cd-label">Deal #</span>
              <span className="cd-value">{deal.dealNumber}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Sale Price</span>
              <span className="cd-value">
                {deal.salePrice ? `$${parseFloat(deal.salePrice).toLocaleString('en-CA')}` : '—'}
              </span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Financing</span>
              <span className="cd-value">{deal.financing || '—'}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Unit</span>
              <span className="cd-value">{deal.unitId ? deal.unitId.slice(0, 8) + '…' : '—'}</span>
            </div>
          </div>

          <div className="cd-section">
            <div className="cd-section-h">Timeline</div>
            <div className="cd-row">
              <span className="cd-label">Created</span>
              <span className="cd-value">{new Date(deal.createdAt).toLocaleDateString('en-CA')}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Updated</span>
              <span className="cd-value">{new Date(deal.updatedAt).toLocaleDateString('en-CA')}</span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Status</span>
              <span className="cd-value">{statusBadge(deal.status)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* ── AI Presenter Modal ── */}
      {showPresenterModal && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 10000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20 }}
          onClick={e => { if (e.target === e.currentTarget) { setShowPresenterModal(false); setPresenterSession(null); } }}
        >
          <div style={{ background: '#fff', borderRadius: 16, width: '100%', maxWidth: 500, boxShadow: '0 20px 60px rgba(0,0,0,0.2)', overflow: 'hidden' }}>
            <div style={{ padding: '18px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#033280' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="2">
                  <polygon points="23 7 16 12 23 17 23 7"/><rect x="1" y="5" width="15" height="14" rx="2" ry="2"/>
                </svg>
                <span style={{ fontWeight: 700, fontSize: 15, color: '#fff' }}>Send F&I Presentation to {deal.customerName}</span>
              </div>
              <button onClick={() => { setShowPresenterModal(false); setPresenterSession(null); }} style={{ background: 'none', border: 'none', color: 'rgba(255,255,255,0.7)', fontSize: 22, cursor: 'pointer', lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: 24 }}>
              {!presenterSession ? (
                <>
                  <div className="form-grid">
                    <div className="form-group full">
                      <label>Customer Email *</label>
                      <input type="email" value={presenterEmail} onChange={e => setPresenterEmail(e.target.value)} placeholder="customer@email.com" />
                    </div>
                    <div className="form-group full">
                      <label>Products to Present * <span style={{ fontWeight: 400, color: '#888', fontSize: 11 }}>(all selected by default)</span></label>
                      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxHeight: 180, overflowY: 'auto', padding: '4px 0' }}>
                        {presenterProducts.map(p => (
                          <label key={p.id} style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', padding: '6px 10px', borderRadius: 8, background: presenterSelectedIds.has(p.id) ? '#f0f4ff' : '#f9f9f9', transition: 'all 0.15s' }}>
                            <input
                              type="checkbox"
                              checked={presenterSelectedIds.has(p.id)}
                              onChange={e => {
                                setPresenterSelectedIds(prev => {
                                  const next = new Set(prev);
                                  if (e.target.checked) next.add(p.id); else next.delete(p.id);
                                  return next;
                                });
                              }}
                              style={{ width: 15, height: 15, accentColor: '#033280' }}
                            />
                            <span style={{ flex: 1, fontSize: 13 }}>{p.name}</span>
                            {p.price && <span style={{ fontSize: 12, fontWeight: 600, color: '#033280' }}>${parseFloat(p.price).toLocaleString('en-CA')}</span>}
                          </label>
                        ))}
                        {presenterProducts.length === 0 && (
                          <div style={{ fontSize: 13, color: '#888', padding: '8px 0' }}>Loading products…</div>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="btn-bar" style={{ marginTop: 16 }}>
                    <button className="btn btn-p" onClick={handleLaunchPresenter} disabled={presenterLaunching}>
                      {presenterLaunching ? 'Generating…' : 'Generate Presenter Link'}
                    </button>
                    <button className="btn btn-o" onClick={() => setShowPresenterModal(false)}>Cancel</button>
                  </div>
                </>
              ) : (
                <div style={{ textAlign: 'center' }}>
                  <div style={{ width: 56, height: 56, borderRadius: '50%', background: '#dcfce7', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 14px', fontSize: 26 }}>✓</div>
                  <div style={{ fontSize: 15, fontWeight: 700, marginBottom: 6 }}>Link Ready!</div>
                  <div style={{ fontSize: 13, color: '#666', marginBottom: 16 }}>Share this link with {deal.customerName}.</div>
                  <div style={{ background: '#f8fafc', borderRadius: 8, padding: '10px 14px', marginBottom: 14, wordBreak: 'break-all', fontSize: 12, color: '#444', textAlign: 'left', border: '1px solid #e2e8f0' }}>
                    {presenterSession.sessionUrl}
                  </div>
                  <div style={{ display: 'flex', gap: 8 }}>
                    <button
                      className="btn btn-p btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => {
                        navigator.clipboard.writeText(presenterSession.sessionUrl).then(() => {
                          setPresenterLinkCopied(true);
                          setTimeout(() => setPresenterLinkCopied(false), 2000);
                        });
                      }}
                    >
                      {presenterLinkCopied ? '✓ Copied!' : 'Copy Link'}
                    </button>
                    <button className="btn btn-o btn-sm" style={{ flex: 1 }} onClick={() => { setShowPresenterModal(false); setPresenterSession(null); }}>Done</button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
