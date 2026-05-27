// client/src/pages/exclusive/dealer-owner/DealJacket.tsx
// Route: /:dealerId/owner/customers/:customerId/jacket/:jacketId

import { useState, useEffect, useRef, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { BarcodeDisplay, QRCodeDisplay } from '@/lib/barcode';
import PrintButton from '@/components/PrintButton';
import SignatureDisplay, { type StoredSignature } from '@/components/SignatureDisplay';

// ─── Types ────────────────────────────────────────────────────────────────────

interface DealJacket {
  id: string;
  unitId: string;
  customerId: string;
  dealershipId: string;
  saleDate: string | null;
  status: 'incomplete' | 'complete';
  completenessScore: number;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

interface JacketDocument {
  id: string;
  jacketId: string;
  documentType: string;
  documentName: string;
  sourceType: string;
  sourceId: string | null;
  fileUrl: string | null;
  isRequired: boolean;
  status: 'present' | 'missing' | 'pending';
  uploadedBy: string | null;
  uploadedAt: string | null;
}

interface UnitInfo {
  id: string;
  vin: string;
  year: number | null;
  manufacturer: string | null;
  model: string | null;
  status: string | null;
  displayPhotoUrl: string | null;
}

interface CustomerInfo {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
}

interface Photo {
  id: string;
  publicUrl: string;
  photoType: string;
  filename: string | null;
  createdAt: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const DOC_TYPE_LABELS: Record<string, string> = {
  bill_of_sale: 'Bill of Sale',
  financing_agreement: 'Financing Agreement',
  fi_acceptance: 'F&I Acceptance',
  manufacturer_warranty: 'Manufacturer Warranty',
  extended_warranty: 'Extended Warranty',
  trade_in_appraisal: 'Trade-In Appraisal',
  pdi_signoff: 'PDI Sign-Off',
  customer_consent: 'Customer Consent',
  insurance: 'Insurance',
  registration: 'Registration',
  custom: 'Document',
};

function fmtDate(d: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { year: 'numeric', month: 'short', day: 'numeric' });
}

function sourceNavPath(location: string, doc: JacketDocument): string | null {
  const segs = location.split('/').filter(Boolean);
  const base = segs.length >= 2 ? `/${segs[0]}/${segs[1]}` : '';
  if (!doc.sourceId) return doc.fileUrl || null;
  if (doc.sourceType === 'linked_pdi') return `${base}/pdi/${doc.sourceId}`;
  if (doc.sourceType === 'linked_warranty') return `${base}/warranty/${doc.sourceId}`;
  if (doc.sourceType === 'linked_fi_deal') return `${base}/fi/${doc.sourceId}`;
  if (doc.sourceType === 'linked_financing') return `${base}/financing/${doc.sourceId}`;
  if (doc.sourceType === 'linked_document' && doc.fileUrl) return doc.fileUrl;
  return null;
}

// ─── Component ────────────────────────────────────────────────────────────────

export default function DealJacket() {
  const [location, navigate] = useLocation();
  const params = useParams<{ jacketId?: string; customerId?: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Extract IDs from params or URL
  const jacketId = params.jacketId || (() => {
    const segs = location.split('/');
    const idx = segs.indexOf('jacket');
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  // ─── State ────────────────────────────────────────────────────────────────
  const [jacket, setJacket] = useState<DealJacket | null>(null);
  const [documents, setDocuments] = useState<JacketDocument[]>([]);
  const [signatures, setSignatures] = useState<StoredSignature[]>([]);
  const [unit, setUnit] = useState<UnitInfo | null>(null);
  const [customer, setCustomer] = useState<CustomerInfo | null>(null);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [photosOpen, setPhotosOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Notes editing
  const [notes, setNotes] = useState('');
  const [notesSaving, setNotesSaving] = useState(false);
  const notesTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // Add document dialog
  const [addDocOpen, setAddDocOpen] = useState(false);
  const [addDocType, setAddDocType] = useState('custom');
  const [addDocName, setAddDocName] = useState('');
  const [addDocFile, setAddDocFile] = useState<File | null>(null);
  const [addDocSaving, setAddDocSaving] = useState(false);
  const [uploadingForDocId, setUploadingForDocId] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg); setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const isDealerOwner = user?.role === 'dealer_owner';
  const isOperator = user?.role === 'operator_admin' || user?.role === 'operator_staff';
  const canEdit = isDealerOwner || isOperator;

  // ─── Load jacket ──────────────────────────────────────────────────────────
  const loadJacket = useCallback(async () => {
    if (!jacketId) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const data = await apiFetch<any>(`/api/deal-jackets/${jacketId}`);
      setJacket(data.jacket);
      setDocuments(data.documents || []);
      setSignatures(data.signatures || []);
      setUnit(data.unit || null);
      setCustomer(data.customer || null);
      setNotes(data.jacket?.notes || '');
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load deal jacket');
    } finally {
      setIsLoading(false);
    }
  }, [jacketId]);

  const loadPhotos = useCallback(async () => {
    if (!unit?.id) return;
    try {
      const data = await apiFetch<any[]>(`/api/units/${unit.id}/photos`);
      setPhotos(Array.isArray(data) ? data : []);
    } catch { setPhotos([]); }
  }, [unit?.id]);

  useEffect(() => { loadJacket(); }, [loadJacket]);
  useEffect(() => { if (photosOpen) loadPhotos(); }, [photosOpen, loadPhotos]);

  // ─── Auto-save notes ──────────────────────────────────────────────────────
  const handleNotesChange = (val: string) => {
    setNotes(val);
    if (notesTimer.current) clearTimeout(notesTimer.current);
    notesTimer.current = setTimeout(async () => {
      if (!jacketId) return;
      setNotesSaving(true);
      try {
        await apiFetch(`/api/deal-jackets/${jacketId}`, {
          method: 'PATCH',
          body: JSON.stringify({ notes: val }),
        });
      } catch { /* silent */ }
      setNotesSaving(false);
    }, 1200);
  };

  // ─── Upload document for a missing row ───────────────────────────────────
  const handleUploadForDoc = async (doc: JacketDocument, file: File) => {
    if (!jacketId) return;
    setUploadingForDocId(doc.id);
    try {
      // Presign upload
      const presignRes = await apiFetch<any>('/api/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({
          scope: 'general',
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          photoType: 'deal_jacket_doc',
        }),
      });
      await fetch(presignRes.uploadUrl, {
        method: 'PUT', body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      // Delete old missing doc and re-add as present
      await apiFetch(`/api/deal-jackets/${jacketId}/documents/${doc.id}`, { method: 'DELETE' });
      await apiFetch(`/api/deal-jackets/${jacketId}/documents`, {
        method: 'POST',
        body: JSON.stringify({
          documentType: doc.documentType,
          documentName: doc.documentName,
          sourceType: 'uploaded',
          fileUrl: presignRes.publicUrl,
          isRequired: doc.isRequired,
        }),
      });

      showToast('Document uploaded successfully');
      await loadJacket();
    } catch (err: any) {
      showToast(err?.message || 'Upload failed');
    } finally {
      setUploadingForDocId(null);
    }
  };

  // ─── Add new document ─────────────────────────────────────────────────────
  const handleAddDoc = async () => {
    if (!jacketId || !addDocName) return;
    setAddDocSaving(true);
    try {
      let fileUrl: string | undefined;
      if (addDocFile) {
        const presignRes = await apiFetch<any>('/api/uploads/presign', {
          method: 'POST',
          body: JSON.stringify({
            scope: 'general',
            filename: addDocFile.name,
            contentType: addDocFile.type || 'application/octet-stream',
            photoType: 'deal_jacket_doc',
          }),
        });
        await fetch(presignRes.uploadUrl, {
          method: 'PUT', body: addDocFile,
          headers: { 'Content-Type': addDocFile.type || 'application/octet-stream' },
        });
        fileUrl = presignRes.publicUrl;
      }

      await apiFetch(`/api/deal-jackets/${jacketId}/documents`, {
        method: 'POST',
        body: JSON.stringify({
          documentType: addDocType,
          documentName: addDocName,
          sourceType: 'uploaded',
          fileUrl,
          isRequired: false,
        }),
      });

      showToast('Document added');
      setAddDocOpen(false);
      setAddDocName('');
      setAddDocFile(null);
      setAddDocType('custom');
      await loadJacket();
    } catch (err: any) {
      showToast(err?.message || 'Failed to add document');
    } finally {
      setAddDocSaving(false);
    }
  };

  // ─── Delete document ──────────────────────────────────────────────────────
  const handleDeleteDoc = async (docId: string) => {
    if (!jacketId) return;
    try {
      await apiFetch(`/api/deal-jackets/${jacketId}/documents/${docId}`, { method: 'DELETE' });
      showToast('Document removed');
      await loadJacket();
    } catch (err: any) {
      showToast(err?.message || 'Failed to remove document');
    }
  };

  // ─── Navigate to source ───────────────────────────────────────────────────
  const handleViewSource = (doc: JacketDocument) => {
    const path = sourceNavPath(location, doc);
    if (!path) return;
    if (path.startsWith('http')) {
      window.open(path, '_blank');
    } else {
      navigate(path);
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  if (isLoading) {
    return (
      <div style={{ textAlign: 'center', padding: '60px 0', color: '#888', fontSize: 14 }}>
        Loading deal jacket…
      </div>
    );
  }

  if (dataError) {
    return (
      <div style={{ maxWidth: 600, margin: '40px auto', padding: '16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, color: '#dc2626', fontSize: 13 }}>
        {dataError}
      </div>
    );
  }

  if (!jacket) return null;

  const unitLabel = unit
    ? [unit.year, unit.manufacturer, unit.model].filter(Boolean).join(' ')
    : '—';
  const customerName = customer
    ? `${customer.firstName} ${customer.lastName}`.trim()
    : '—';

  const requiredDocs = documents.filter((d) => d.isRequired);
  const presentRequired = requiredDocs.filter((d) => d.status === 'present');
  const missingDocs = documents.filter((d) => d.isRequired && d.status === 'missing');

  // Navigate back to list
  const handleBack = () => {
    const segs = location.split('/').filter(Boolean);
    const base = segs.length >= 2 ? `/${segs[0]}/${segs[1]}` : '';
    navigate(`${base}/deal-jackets`);
  };

  const navigateToUnitPhotos = () => {
    if (!unit) return;
    const segs = location.split('/').filter(Boolean);
    const base = segs.length >= 2 ? `/${segs[0]}/${segs[1]}` : '';
    navigate(`${base}/units/${unit.id}`);
  };

  return (
    <div className="page-container" style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>

      {/* Print header (hidden on screen) */}
      <div className="print-header">
        <div className="print-header-brand">Dealer Suite 360 — Deal Jacket</div>
        <div className="print-header-meta">
          <div>{customerName}</div>
          <div>{unitLabel}</div>
          <div>Sale Date: {fmtDate(jacket.saleDate)}</div>
          <div>Printed: {new Date().toLocaleDateString('en-CA')}</div>
        </div>
      </div>

      {/* Back button */}
      <button
        className="print-hide"
        onClick={handleBack}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#033280', fontSize: 13, fontWeight: 600, cursor: 'pointer', padding: '0 0 16px', fontFamily: 'inherit' }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M19 12H5m0 0l7 7m-7-7l7-7"/></svg>
        Back to Deal Jackets
      </button>

      {/* Header card */}
      <div style={{
        background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e8e8e8)',
        borderRadius: 10, padding: '20px 24px', marginBottom: 20,
        display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16,
      }}>
        <div style={{ flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8, flexWrap: 'wrap' }}>
            <h1 style={{ margin: 0, fontSize: 20, fontWeight: 700, color: 'var(--text, #111)' }}>
              {t('dealJacket.dealJacket')}
            </h1>
            <span style={{
              padding: '3px 12px', borderRadius: 12, fontSize: 11, fontWeight: 700,
              background: jacket.status === 'complete' ? '#dcfce7' : '#fff7ed',
              color: jacket.status === 'complete' ? '#16a34a' : '#d97706',
            }}>
              {jacket.status === 'complete' ? t('dealJacket.jacketComplete') : t('dealJacket.jacketIncomplete')}
            </span>
          </div>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text, #222)', marginBottom: 2 }}>{customerName}</div>
          <div style={{ fontSize: 13, color: 'var(--text-muted, #555)', marginBottom: 2 }}>{unitLabel}</div>
          {unit?.vin && (
            <div style={{ fontSize: 11, color: '#888', fontFamily: 'monospace', marginBottom: 6 }}>VIN: {unit.vin}</div>
          )}
          <div style={{ fontSize: 12, color: 'var(--text-muted, #666)' }}>
            {t('dealJacket.saleDate')}: {fmtDate(jacket.saleDate)}
          </div>

          {/* Completeness bar */}
          <div style={{ marginTop: 14 }}>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <span style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #666)' }}>
                {presentRequired.length} of {requiredDocs.length} required documents ({jacket.completenessScore}%)
              </span>
              {missingDocs.length > 0 && (
                <span style={{ fontSize: 11, color: '#d97706', fontWeight: 600 }}>
                  ⚠ {missingDocs.length} missing
                </span>
              )}
            </div>
            <div className="dj-completeness-bar" style={{ height: 8, background: '#e5e7eb', borderRadius: 4, overflow: 'hidden' }}>
              <div style={{
                height: '100%', borderRadius: 4,
                width: `${jacket.completenessScore}%`,
                background: jacket.completenessScore === 100 ? '#22c55e' : jacket.completenessScore >= 60 ? '#f59e0b' : '#ef4444',
                transition: 'width 0.4s',
              }} />
            </div>
          </div>
        </div>

        {/* Barcode + actions */}
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 10 }}>
          <div className="print-hide" style={{ display: 'flex', gap: 8 }}>
            <BarcodeDisplay entityType="deal_jacket" entityId={jacket.id} size="sm" />
            <QRCodeDisplay entityType="deal_jacket" entityId={jacket.id} size={64} />
          </div>
          <PrintButton className="print-hide" title={jacket ? `Deal Jacket — ${jacket.id}` : 'Deal Jacket'} />
        </div>
      </div>

      {/* Document Checklist */}
      <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e8e8e8)', borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text, #111)' }}>
            Document Checklist
          </h2>
          {canEdit && (
            <button
              className="print-hide"
              onClick={() => setAddDocOpen(true)}
              style={{
                padding: '6px 14px', borderRadius: 7, border: '1px solid #033280', background: '#033280',
                color: '#fff', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              + {t('dealJacket.addDocument')}
            </button>
          )}
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse' }}>
            <thead>
              <tr style={{ background: 'var(--bg-secondary, #f8f9fb)' }}>
                {['Document', 'Status', 'Date Added', 'Actions'].map((h) => (
                  <th key={h} style={{ padding: '8px 12px', textAlign: 'left', fontSize: 11, fontWeight: 700, color: 'var(--text-muted, #666)', textTransform: 'uppercase', letterSpacing: '0.04em', borderBottom: '1px solid var(--border, #e8e8e8)' }}>
                    {h}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {documents.map((doc) => {
                const isMissingRequired = doc.isRequired && doc.status === 'missing';
                const isPending = doc.status === 'pending';
                const isPresent = doc.status === 'present';
                const rowBg = isMissingRequired
                  ? 'var(--dj-missing-bg, #fff7ed)'
                  : isPending ? 'var(--dj-pending-bg, #eff6ff)'
                  : 'transparent';
                const isLinked = doc.sourceType.startsWith('linked_');

                return (
                  <tr key={doc.id} className={isMissingRequired ? 'dj-doc-row-missing' : ''} style={{ borderBottom: '1px solid var(--border, #f0f0f0)', background: rowBg }}>
                    <td style={{ padding: '10px 12px' }}>
                      <div style={{ fontWeight: 600, fontSize: 13, color: 'var(--text, #111)' }}>
                        {doc.documentName || DOC_TYPE_LABELS[doc.documentType] || doc.documentType}
                        {doc.isRequired && (
                          <span style={{ marginLeft: 6, fontSize: 10, color: '#888', fontWeight: 500 }}>(required)</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, color: '#9ca3af', marginTop: 2 }}>
                        {DOC_TYPE_LABELS[doc.documentType] || doc.documentType}
                      </div>
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      {isPresent && <span style={{ color: '#16a34a', fontWeight: 700, fontSize: 13 }}>✓ Present</span>}
                      {isMissingRequired && <span style={{ color: '#d97706', fontWeight: 700, fontSize: 13 }}>⚠ Missing</span>}
                      {!doc.isRequired && doc.status === 'missing' && <span style={{ color: '#9ca3af', fontSize: 12 }}>— Not added</span>}
                      {isPending && <span style={{ color: '#3b82f6', fontWeight: 700, fontSize: 13 }}>⏳ Pending</span>}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: 'var(--text-muted, #666)' }}>
                      {fmtDate(doc.uploadedAt)}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <div className="print-hide" style={{ display: 'flex', gap: 6, flexWrap: 'wrap' }}>
                        {isPresent && (
                          <>
                            {(isLinked || doc.fileUrl) && (
                              <button
                                onClick={() => handleViewSource(doc)}
                                style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #033280', background: 'transparent', color: '#033280', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                {isLinked ? 'View' : 'View'}
                              </button>
                            )}
                            {doc.fileUrl && !isLinked && (
                              <a href={doc.fileUrl} download target="_blank" rel="noreferrer" style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #6b7280', background: 'transparent', color: '#374151', fontSize: 11, fontWeight: 600, cursor: 'pointer', textDecoration: 'none' }}>
                                Download
                              </a>
                            )}
                            {canEdit && !doc.isRequired && (
                              <button
                                onClick={() => handleDeleteDoc(doc.id)}
                                style={{ padding: '4px 8px', borderRadius: 5, border: '1px solid #fca5a5', background: 'transparent', color: '#dc2626', fontSize: 11, cursor: 'pointer', fontFamily: 'inherit' }}
                              >
                                ×
                              </button>
                            )}
                          </>
                        )}
                        {doc.status === 'missing' && canEdit && (
                          <label style={{ padding: '4px 10px', borderRadius: 5, border: '1px solid #16a34a', background: 'transparent', color: '#16a34a', fontSize: 11, fontWeight: 600, cursor: 'pointer', whiteSpace: 'nowrap' }}>
                            {uploadingForDocId === doc.id ? 'Uploading…' : doc.isRequired ? t('dealJacket.uploadDocument') : 'Upload (optional)'}
                            <input
                              type="file"
                              style={{ display: 'none' }}
                              disabled={uploadingForDocId === doc.id}
                              onChange={(e) => {
                                const f = e.target.files?.[0];
                                if (f) handleUploadForDoc(doc, f);
                                e.target.value = '';
                              }}
                            />
                          </label>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {documents.length === 0 && (
                <tr>
                  <td colSpan={4} style={{ padding: '24px', textAlign: 'center', color: '#9ca3af', fontSize: 13 }}>
                    No documents yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Photos section */}
      <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e8e8e8)', borderRadius: 10, padding: '16px 24px', marginBottom: 20 }}>
        <button
          className="print-hide"
          onClick={() => setPhotosOpen(!photosOpen)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit', width: '100%' }}
        >
          <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text, #111)' }}>
            Unit Photos
          </h2>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" style={{ transform: photosOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', color: '#888' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>
        {photosOpen && (
          <div style={{ marginTop: 14 }}>
            {photos.length === 0 ? (
              <div style={{ color: '#9ca3af', fontSize: 13 }}>No photos uploaded for this unit.</div>
            ) : (
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, marginBottom: 12 }} className="dj-photo-section">
                {photos.map((p) => (
                  <img
                    key={p.id}
                    src={p.publicUrl}
                    alt={p.filename || 'unit photo'}
                    style={{ width: 80, height: 64, objectFit: 'cover', borderRadius: 6, border: '1px solid #e5e7eb', cursor: 'pointer' }}
                    onClick={() => window.open(p.publicUrl, '_blank')}
                    title={p.photoType}
                  />
                ))}
              </div>
            )}
            {unit && (
              <button
                onClick={navigateToUnitPhotos}
                className="print-hide"
                style={{ fontSize: 12, color: '#033280', fontWeight: 600, background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}
              >
                View in Unit File →
              </button>
            )}
          </div>
        )}
      </div>

      {/* Signatures */}
      {signatures.length > 0 && (
        <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e8e8e8)', borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
          <h2 style={{ margin: '0 0 14px', fontSize: 15, fontWeight: 700, color: 'var(--text, #111)' }}>
            Signatures
          </h2>
          <SignatureDisplay signatures={signatures} />
        </div>
      )}

      {/* Notes */}
      {canEdit && (
        <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e8e8e8)', borderRadius: 10, padding: '20px 24px', marginBottom: 20 }}>
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <h2 style={{ margin: 0, fontSize: 15, fontWeight: 700, color: 'var(--text, #111)' }}>
              Internal Notes
            </h2>
            {notesSaving && (
              <span style={{ fontSize: 11, color: '#9ca3af' }}>Saving…</span>
            )}
          </div>
          <textarea
            value={notes}
            onChange={(e) => handleNotesChange(e.target.value)}
            placeholder="Add internal notes about this deal jacket…"
            rows={4}
            style={{
              width: '100%', padding: '10px 12px', borderRadius: 7, border: '1px solid var(--border, #e0e0e0)',
              fontSize: 13, fontFamily: 'inherit', resize: 'vertical', background: 'var(--bg-card, #fff)',
              color: 'var(--text, #222)', boxSizing: 'border-box',
            }}
          />
        </div>
      )}

      {/* Add Document Dialog */}
      {addDocOpen && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000,
          display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
        }}>
          <div style={{
            background: 'var(--bg-card, #fff)', borderRadius: 12, padding: 28, width: '100%', maxWidth: 460,
            boxShadow: '0 16px 48px rgba(0,0,0,.18)',
          }}>
            <h3 style={{ margin: '0 0 18px', fontSize: 16, fontWeight: 700, color: 'var(--text, #111)' }}>
              {t('dealJacket.addDocument')}
            </h3>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #555)', marginBottom: 4 }}>
              Document Type
            </label>
            <select
              value={addDocType}
              onChange={(e) => setAddDocType(e.target.value)}
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, marginBottom: 12, background: 'var(--bg-card, #fff)', color: 'var(--text, #222)' }}
            >
              {Object.entries(DOC_TYPE_LABELS).map(([k, v]) => (
                <option key={k} value={k}>{v}</option>
              ))}
            </select>

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #555)', marginBottom: 4 }}>
              Document Name *
            </label>
            <input
              type="text"
              value={addDocName}
              onChange={(e) => setAddDocName(e.target.value)}
              placeholder="e.g. Signed Bill of Sale"
              style={{ width: '100%', padding: '8px 10px', borderRadius: 7, border: '1px solid var(--border, #e0e0e0)', fontSize: 13, marginBottom: 12, background: 'var(--bg-card, #fff)', color: 'var(--text, #222)', boxSizing: 'border-box' }}
            />

            <label style={{ display: 'block', fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #555)', marginBottom: 4 }}>
              File (optional)
            </label>
            <input
              type="file"
              onChange={(e) => setAddDocFile(e.target.files?.[0] || null)}
              style={{ width: '100%', fontSize: 13, marginBottom: 20 }}
            />

            <div style={{ display: 'flex', justifyContent: 'flex-end', gap: 10 }}>
              <button
                onClick={() => { setAddDocOpen(false); setAddDocName(''); setAddDocFile(null); setAddDocType('custom'); }}
                style={{ padding: '8px 16px', borderRadius: 7, border: '1px solid #e0e0e0', background: 'transparent', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text-muted, #666)' }}
              >
                Cancel
              </button>
              <button
                onClick={handleAddDoc}
                disabled={addDocSaving || !addDocName}
                style={{
                  padding: '8px 18px', borderRadius: 7, border: 'none', background: addDocSaving || !addDocName ? '#93c5fd' : '#033280',
                  color: '#fff', fontSize: 13, fontWeight: 600, cursor: addDocSaving || !addDocName ? 'not-allowed' : 'pointer', fontFamily: 'inherit',
                }}
              >
                {addDocSaving ? 'Saving…' : 'Add Document'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#fff',
          padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999,
          boxShadow: '0 4px 16px rgba(0,0,0,.2)',
        }}>
          {toastMsg}
        </div>
      )}
    </div>
  );
}
