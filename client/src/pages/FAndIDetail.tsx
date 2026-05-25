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
          position: 'fixed', bottom: 24, right: 24, background: '#08235d', color: '#fff',
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
      <div style={{ display: 'flex', gap: 8, marginBottom: 20 }}>
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
                    <div style={{ fontSize: 28, fontWeight: 700, color: '#08235d' }}>{deal.productsOffered}</div>
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
    </div>
  );
}
