import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

interface FrcLine {
  id: string;
  frcCode: string | null;
  description: string;
  laborHours: string | null;
  laborRate: string | null;
  partsAmount: string | null;
  totalAmount: string | null;
  status: 'pending' | 'approved' | 'denied';
  denialReason: string | null;
  createdAt: string;
}

interface ClaimPhoto {
  id: string;
  publicUrl: string;
  filename: string | null;
  photoType: string;
  uploadStatus: string;
}

interface ClaimDetail {
  id: string;
  claimNumber: string;
  type: string;
  status: string;
  manufacturer: string;
  dealerNotes: string | null;
  operatorNotes: string | null;
  estimatedAmount: string | null;
  approvedAmount: string | null;
  denialReason: string | null;
  mfrClaimNumber?: string | null;
  manufacturerClaimNumber?: string | null;
  submittedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export default function ClaimDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ claimId: string; dealerId?: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Extract claimId from either wouter params or URL path
  const claimId = params.claimId || (() => {
    const segments = location.split('/');
    // URL is like /operator/admin/claims/UUID or /:dealerId/owner/claims/UUID
    const claimsIdx = segments.indexOf('claims');
    return claimsIdx >= 0 ? segments[claimsIdx + 1] : null;
  })();

  const isOperator = user?.role === 'operator_admin' || user?.role === 'operator_staff';
  const isOperatorAdmin = user?.role === 'operator_admin';
  const isDealerOwner = user?.role === 'dealer_owner';
  const isDealerStaff = user?.role === 'dealer_staff';
  const isDealer = isDealerOwner || isDealerStaff;
  const isServiceManager = user?.role === 'service_manager';
  const isPartsManager = user?.role === 'parts_dept';
  // Read-only roles: can view claim detail but cannot take actions
  const isReadOnly = isServiceManager || isPartsManager;

  const canCreateWorkOrder = isOperatorAdmin || isDealerOwner || isServiceManager;
  const getWorkOrderNewPath = () => {
    const parts = location.split('/');
    if (parts[1] === 'operator' && parts[2] === 'admin') return `/operator/admin/techflow/new?claimId=${claimId}`;
    if (parts[2] === 'owner') return `/${parts[1]}/owner/techflow/new?claimId=${claimId}`;
    if (parts[2] === 'service-manager') return `/${parts[1]}/service-manager/work-orders/new?claimId=${claimId}`;
    return null;
  };

  const [claim, setClaim] = useState<ClaimDetail | null>(null);
  const [unit, setUnit] = useState<any | null>(null);
  const [dealership, setDealership] = useState<any | null>(null);
  const [frcLines, setFrcLines] = useState<FrcLine[]>([]);
  const [claimPhotos, setClaimPhotos] = useState<ClaimPhoto[]>([]);
  const [customer, setCustomer] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Parts orders linked to this claim
  const [claimParts, setClaimParts] = useState<any[]>([]);

  // Notes compose state
  const [noteText, setNoteText] = useState('');
  const [noteVisibility, setNoteVisibility] = useState<'dealer' | 'internal'>('dealer');
  const [noteSending, setNoteSending] = useState(false);

  // Status transition state (operator)
  const [statusTo, setStatusTo] = useState('');
  const [mfrClaimNumber, setMfrClaimNumber] = useState('');
  const [denialReason, setDenialReason] = useState('');
  const [statusSaving, setStatusSaving] = useState(false);
  const [closingClaim, setClosingClaim] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadClaim = useCallback(async () => {
    if (!claimId) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const d = await apiFetch<any>(`/api/v6/claims/${claimId}`);
      setClaim(d.claim || null);
      setUnit(d.unit || null);
      setDealership(d.dealership || null);
      setCustomer(d.customer || null);
      setFrcLines([]); // FRC lines not returned by v6 endpoint — use claims endpoint

      // Load photos separately
      const photosData = await apiFetch<any[]>(`/api/v6/uploads/by-claim/${claimId}`).catch(() => []);
      setClaimPhotos(Array.isArray(photosData) ? photosData : []);

      // Load FRC lines from the older claims endpoint
      const claimFull = await apiFetch<any>(`/api/claims/${claimId}`).catch(() => null);
      if (claimFull?.frcLines) {
        setFrcLines(claimFull.frcLines);
      }

      // Load parts orders linked to this claim
      const partsData = await apiFetch<any>(`/api/v6/parts-orders?claimId=${claimId}`).catch(() => []);
      setClaimParts(Array.isArray(partsData) ? partsData : partsData?.orders || []);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load claim');
    } finally {
      setIsLoading(false);
    }
  }, [claimId]);

  useEffect(() => {
    loadClaim();
  }, [loadClaim]);

  const handleLineDecision = async (lineId: string, decision: 'approved' | 'denied') => {
    try {
      await apiFetch(`/api/claims/${claimId}/frc-lines/${lineId}`, {
        method: 'PUT',
        body: JSON.stringify({ status: decision }),
      });
      await loadClaim();
      showToast(`FRC line ${decision}`);
    } catch (err: any) {
      showToast(`Failed to ${decision} line: ${err?.message || 'Unknown error'}`);
    }
  };

  const handleStatusTransition = async () => {
    if (!statusTo) { showToast('Select a status to transition to.'); return; }
    setStatusSaving(true);
    try {
      await apiFetch(`/api/v6/claims/${claimId}/transition`, {
        method: 'POST',
        body: JSON.stringify({
          toStatus: statusTo,
          mfrClaimNumber: mfrClaimNumber || undefined,
          denialReason: denialReason || undefined,
        }),
      });
      await loadClaim();
      setStatusTo('');
      setMfrClaimNumber('');
      setDenialReason('');
      showToast('Status updated');
    } catch (err: any) {
      showToast(`Failed to update status: ${err?.message || 'Unknown error'}`);
    } finally {
      setStatusSaving(false);
    }
  };

  const handleSendNote = async () => {
    if (isReadOnly) { showToast('You do not have permission to add notes.'); return; }
    if (!noteText.trim()) { showToast('Enter a note first.'); return; }
    setNoteSending(true);
    try {
      await apiFetch(`/api/claims/${claimId}/notes`, {
        method: 'POST',
        body: JSON.stringify({
          content: noteText.trim(),
          visibility: noteVisibility,
        }),
      });
      setNoteText('');
      showToast('Note sent');
    } catch (err: any) {
      showToast(`Failed to send note: ${err?.message || 'Unknown error'}`);
    } finally {
      setNoteSending(false);
    }
  };

  const handleCloseClaim = async () => {
    setClosingClaim(true);
    try {
      await apiFetch(`/api/v6/claims/${claimId}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'closed' }),
      });
      await loadClaim();
      showToast('Claim closed');
    } catch (err: any) {
      showToast(`Failed to close claim: ${err?.message || 'Unknown error'}`);
    } finally {
      setClosingClaim(false);
    }
  };

  const handleAssignToMe = async () => {
    try {
      await apiFetch(`/api/v6/claims/${claimId}/assign`, {
        method: 'POST',
        body: JSON.stringify({}),
      });
      await loadClaim();
      showToast('Claim assigned to you');
    } catch (err: any) {
      showToast(`Failed to assign: ${err?.message || 'Unknown error'}`);
    }
  };

  // Back navigation — go up to claims list
  const handleBack = () => {
    // Navigate up — from claims/:id to claims
    const segments = location.split('/');
    const claimsIdx = segments.indexOf('claims');
    if (claimsIdx >= 0) {
      navigate(segments.slice(0, claimsIdx + 1).join('/'));
    } else {
      navigate(-1 as any);
    }
  };

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ fontSize: 14, color: '#888' }}>Loading claim...</div>
      </div>
    );
  }

  if (dataError || !claim) {
    return (
      <div className="page active">
        <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>
          {dataError || 'Claim not found.'}
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-o btn-sm" onClick={handleBack}>← Back to Claims</button>
          </div>
        </div>
      </div>
    );
  }

  const mfrClaimNum = claim.manufacturerClaimNumber || claim.mfrClaimNumber || null;

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
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
          <div className="detail-title">{claim.claimNumber}</div>
          <div className="detail-meta">
            {dealership?.name || '—'} · {claim.manufacturer} {claim.type?.toUpperCase()} · VIN: {unit?.vin || '—'}
          </div>
        </div>
        <span className={`bg ${claim.status?.replace(/_/g, '-')}`} style={{ fontSize: 13, padding: '6px 16px' }}>
          {claim.status?.replace(/_/g, ' ')}
        </span>
        {isOperator && (
          <button className="btn btn-o btn-sm" onClick={handleAssignToMe}>
            {t('claims.assignToMe')}
          </button>
        )}
      </div>

      <div className="cd-grid">
        {/* Left column */}
        <div>
          {/* FRC Lines */}
          <div className="cd-section">
            <div className="cd-section-h">{t('claims.frcLines')} ({frcLines.length})</div>
            {frcLines.length === 0 ? (
              <div style={{ padding: '16px 20px', fontSize: 13, color: '#888' }}>
                No FRC lines yet. Operator will add lines when processing this claim.
              </div>
            ) : (
              frcLines.map((line, idx) => (
                <div key={line.id} className="frc-line">
                  <div className="frc-num">{idx + 1}</div>
                  <div className="frc-info">
                    <div className="frc-code">{line.frcCode ? `${line.frcCode} — ` : ''}{line.description}</div>
                    {line.laborHours && (
                      <div className="frc-desc">{line.laborHours} hrs requested{line.partsAmount ? ` · Parts: $${parseFloat(line.partsAmount).toFixed(2)}` : ''}</div>
                    )}
                  </div>
                  <div className="frc-hrs">
                    {line.laborHours && `${line.laborHours} hrs · `}
                    <span className={`bg ${line.status}`}>{line.status}</span>
                  </div>
                  {isOperator && line.status === 'pending' && (
                    <div style={{ display: 'flex', gap: 6, marginLeft: 8 }}>
                      <button
                        className="btn btn-p btn-sm"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => handleLineDecision(line.id, 'approved')}
                      >
                        {t('common.approve')}
                      </button>
                      <button
                        className="btn btn-sm"
                        style={{ fontSize: 11, padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                        onClick={() => handleLineDecision(line.id, 'denied')}
                      >
                        {t('claims.deny')}
                      </button>
                    </div>
                  )}
                  {isOperator && line.status === 'approved' && (
                    <div style={{ marginLeft: 8 }}>
                      <button
                        className="btn btn-o btn-sm"
                        style={{ fontSize: 11, padding: '4px 10px' }}
                        onClick={() => navigate(`/operator/admin/parts/new?claimId=${claimId}`)}
                      >
                        {t('claims.orderParts')}
                      </button>
                    </div>
                  )}
                  {line.status === 'denied' && line.denialReason && (
                    <div style={{ fontSize: 11, color: '#dc2626', marginLeft: 8 }}>
                      Reason: {line.denialReason}
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Photos */}
          {claimPhotos.length > 0 && (
            <div className="cd-section">
              <div className="cd-section-h">Photos ({claimPhotos.length})</div>
              <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 8 }}>
                {claimPhotos.map(photo => (
                  <a key={photo.id} href={photo.publicUrl} target="_blank" rel="noopener noreferrer">
                    <div style={{ aspectRatio: '1', background: '#e8e8e8', borderRadius: 8, overflow: 'hidden' }}>
                      <img
                        src={photo.publicUrl}
                        alt={photo.filename || 'Claim photo'}
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                      />
                    </div>
                  </a>
                ))}
              </div>
            </div>
          )}

          {/* Parts Orders linked to this claim */}
          {(isOperator || isDealerOwner || isPartsManager) && (
            <div className="cd-section">
              <div className="cd-section-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>Parts Orders ({claimParts.length})</span>
                {isOperator && (
                  <button
                    className="btn btn-o btn-sm"
                    style={{ fontSize: 11, padding: '3px 10px' }}
                    onClick={() => navigate(`/operator/admin/parts/new?claimId=${claimId}`)}
                  >
                    + New Parts Order
                  </button>
                )}
              </div>
              {claimParts.length === 0 ? (
                <div style={{ padding: '12px 20px', fontSize: 12, color: '#888' }}>
                  No parts orders linked to this claim yet.
                </div>
              ) : (
                <div className="tw">
                  <table>
                    <thead>
                      <tr>
                        <th>Order #</th>
                        <th>Status</th>
                        <th style={{ textAlign: 'center' }}>Items</th>
                        <th>Date</th>
                        <th></th>
                      </tr>
                    </thead>
                    <tbody>
                      {claimParts.map((po: any) => (
                        <tr key={po.id}>
                          <td style={{ fontFamily: 'monospace', fontSize: 12, fontWeight: 500 }}>{po.orderNumber}</td>
                          <td>
                            <span className={`bg ${po.status?.replace(/_/g, '-')}`} style={{ fontSize: 10, padding: '2px 6px' }}>
                              {po.status?.replace(/_/g, ' ')}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center', fontSize: 12 }}>{po.totalQuantity || '—'}</td>
                          <td style={{ fontSize: 11, color: '#888' }}>
                            {new Date(po.createdAt).toLocaleDateString('en-CA')}
                          </td>
                          <td>
                            <button
                              className="btn btn-o btn-sm"
                              style={{ fontSize: 11 }}
                              onClick={() => navigate(`/operator/admin/parts/${po.id}`)}
                            >
                              View
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {/* Create Work Order */}
          {canCreateWorkOrder && getWorkOrderNewPath() && (
            <div className="cd-section">
              <div className="cd-section-h" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span>TechFlow</span>
                <button
                  className="btn btn-o btn-sm"
                  style={{ fontSize: 11, padding: '3px 10px' }}
                  onClick={() => navigate(getWorkOrderNewPath()!)}
                >
                  + Create Work Order
                </button>
              </div>
              <div style={{ padding: '10px 20px', fontSize: 12, color: '#888' }}>
                Link this claim to a service work order for technician dispatch and time tracking.
              </div>
            </div>
          )}

          {/* Notes & Communication */}
          <div className="cd-section">
            <div className="cd-section-h">{t('claims.notesComm')}</div>
            <div className="comm-box">
              {claim.dealerNotes && (
                <div className="comm-msg">
                  <div className="comm-avatar dl">DL</div>
                  <div className="comm-content">
                    <div className="comm-name">Dealer Note</div>
                    <div className="comm-text">{claim.dealerNotes}</div>
                    <div className="comm-time">{new Date(claim.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              )}
              {claim.operatorNotes && (
                <div className="comm-msg">
                  <div className="comm-avatar op">OP</div>
                  <div className="comm-content">
                    <div className="comm-name">Operator Note</div>
                    <div className="comm-text">{claim.operatorNotes}</div>
                  </div>
                </div>
              )}
              {!claim.dealerNotes && !claim.operatorNotes && (
                <div style={{ padding: '16px 20px', fontSize: 13, color: '#888' }}>No notes yet.</div>
              )}
            </div>
            {!isReadOnly && (
              <div style={{ padding: '16px 20px' }}>
                <textarea
                  value={noteText}
                  onChange={e => setNoteText(e.target.value)}
                  placeholder="Add a note..."
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none' }}
                />
                <div style={{ display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end' }}>
                  {isOperator && (
                    <select
                      value={noteVisibility}
                      onChange={e => setNoteVisibility(e.target.value as 'dealer' | 'internal')}
                      style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                    >
                      <option value="dealer">Visible to dealer</option>
                      <option value="internal">Internal only</option>
                    </select>
                  )}
                  <button className="btn btn-p btn-sm" onClick={handleSendNote} disabled={noteSending}>
                    {noteSending ? t('common.saving') : t('common.send')}
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Right column */}
        <div>
          {/* Claim Info */}
          <div className="cd-section">
            <div className="cd-section-h">{t('claims.claimInfo')}</div>
            <div className="cd-row"><span className="cd-label">Claim #</span><span className="cd-value">{claim.claimNumber}</span></div>
            <div className="cd-row"><span className="cd-label">Type</span><span className="cd-value">{claim.type?.toUpperCase()}</span></div>
            <div className="cd-row">
              <span className="cd-label">Mfr Claim #</span>
              <span className="cd-value" style={{ color: mfrClaimNum ? 'inherit' : '#aaa' }}>
                {mfrClaimNum || 'Not assigned'}
              </span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Status</span>
              <span className="cd-value">
                <span className={`bg ${claim.status?.replace(/_/g, '-')}`}>{claim.status?.replace(/_/g, ' ')}</span>
              </span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Submitted</span>
              <span className="cd-value">
                {claim.submittedAt ? new Date(claim.submittedAt).toLocaleDateString() : 'Not submitted'}
              </span>
            </div>
          </div>

          {/* Unit */}
          <div className="cd-section">
            <div className="cd-section-h">Unit</div>
            {unit ? (
              <>
                <div className="cd-row">
                  <span className="cd-label">VIN</span>
                  <span className="cd-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{unit.vin}</span>
                </div>
                <div className="cd-row">
                  <span className="cd-label">Unit</span>
                  <span className="cd-value">{[unit.year, unit.manufacturer, unit.model].filter(Boolean).join(' ')}</span>
                </div>
                {unit.stockNumber && (
                  <div className="cd-row">
                    <span className="cd-label">Stock #</span>
                    <span className="cd-value">{unit.stockNumber}</span>
                  </div>
                )}
              </>
            ) : (
              <div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{ color: '#aaa' }}>—</span></div>
            )}
          </div>

          {/* Dealer */}
          <div className="cd-section">
            <div className="cd-section-h">Dealer</div>
            <div className="cd-row">
              <span className="cd-label">Name</span>
              <span className="cd-value">{dealership?.name || '—'}</span>
            </div>
            {dealership?.plan && (
              <div className="cd-row">
                <span className="cd-label">Plan</span>
                <span className="cd-value">{dealership.plan}</span>
              </div>
            )}
          </div>

          {/* Financials */}
          <div className="cd-section">
            <div className="cd-section-h">Financials</div>
            <div className="cd-row">
              <span className="cd-label">Estimated</span>
              <span className="cd-value">
                {claim.estimatedAmount ? `$${parseFloat(claim.estimatedAmount).toLocaleString()}` : '—'}
              </span>
            </div>
            <div className="cd-row">
              <span className="cd-label">Approved</span>
              <span className="cd-value" style={{ color: claim.approvedAmount ? '#22c55e' : '#aaa' }}>
                {claim.approvedAmount ? `$${parseFloat(claim.approvedAmount).toLocaleString()}` : '—'}
              </span>
            </div>
          </div>

          {/* Operator status transition */}
          {isOperator && (
            <div className="cd-section">
              <div className="cd-section-h">{t('claims.updateStatus')}</div>
              <div style={{ padding: '14px 20px', display: 'flex', flexDirection: 'column', gap: 10 }}>
                <select
                  value={statusTo}
                  onChange={e => setStatusTo(e.target.value)}
                  style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa' }}
                >
                  <option value="">Select new status...</option>
                  <option value="in_review">In Review</option>
                  <option value="info_requested">Info Requested</option>
                  <option value="submitted_to_mfr">Submitted to Manufacturer</option>
                  <option value="approved">Approved</option>
                  <option value="denied">Denied</option>
                  <option value="partial_approval">Partial Approval</option>
                  <option value="completed">Completed</option>
                </select>
                {(statusTo === 'submitted_to_mfr' || statusTo === 'approved') && (
                  <input
                    value={mfrClaimNumber}
                    onChange={e => setMfrClaimNumber(e.target.value)}
                    placeholder="Manufacturer claim # (optional)"
                    style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                  />
                )}
                {statusTo === 'denied' && (
                  <input
                    value={denialReason}
                    onChange={e => setDenialReason(e.target.value)}
                    placeholder="Denial reason..."
                    style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                  />
                )}
                <button
                  className="btn btn-p btn-sm"
                  onClick={handleStatusTransition}
                  disabled={statusSaving || !statusTo}
                >
                  {statusSaving ? t('common.saving') : t('claims.updateStatus')}
                </button>
              </div>
            </div>
          )}

          {/* Close Claim — operator only */}
          {isOperator && claim.status !== 'closed' && (
            <div className="cd-section">
              <div style={{ padding: '14px 20px' }}>
                <button
                  className="btn btn-o btn-sm"
                  onClick={handleCloseClaim}
                  disabled={closingClaim}
                  style={{ width: '100%', justifyContent: 'center' }}
                >
                  {closingClaim ? 'Closing...' : 'Close Claim'}
                </button>
              </div>
            </div>
          )}

          {/* Denial reason if denied */}
          {claim.status === 'denied' && claim.denialReason && (
            <div className="cd-section" style={{ borderLeft: '3px solid #dc2626' }}>
              <div className="cd-section-h">{t('claims.denialReason')}</div>
              <div style={{ padding: '12px 20px', fontSize: 13, color: '#dc2626' }}>
                {claim.denialReason}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
