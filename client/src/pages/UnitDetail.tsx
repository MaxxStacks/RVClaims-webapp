import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { BarcodeDisplay, QRCodeDisplay, generateBarcodeString } from '@/lib/barcode';
import PrintButton from '@/components/PrintButton';
import PrintHeader from '@/components/PrintHeader';

export default function UnitDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ unitId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  // ─── Extract unitId from params or URL ────────────────────────────────────
  const unitId = params.unitId || (() => {
    const segments = location.split('/');
    const unitsIdx = segments.indexOf('units');
    return unitsIdx >= 0 ? segments[unitsIdx + 1] : null;
  })();

  // ─── Role flags ───────────────────────────────────────────────────────────
  const isOperatorAdmin = user?.role === 'operator_admin';
  const isOperatorStaff = user?.role === 'operator_staff';
  const isOperator = isOperatorAdmin || isOperatorStaff;
  const isDealerOwner = user?.role === 'dealer_owner';
  const isDealerStaff = user?.role === 'dealer_staff';
  const isDealer = isDealerOwner || isDealerStaff;
  const isClient = user?.role === 'client';
  const isServiceManager = user?.role === 'service_manager';
  const isShopManager = user?.role === 'shop_manager';
  const isPartsManager = user?.role === 'parts_dept';

  const canEdit = isOperatorAdmin || isDealerOwner;
  const canUploadDocs = isOperatorAdmin || isDealerOwner || isDealerStaff;
  const canDeleteDocs = isOperatorAdmin || isDealerOwner;
  const canUploadPhotos = isOperatorAdmin || isDealerOwner || isDealerStaff;
  const canDeletePhotos = isOperatorAdmin || isDealerOwner;
  const canCreateClaim = isDealerOwner || isDealerStaff;
  // Client cannot see Claims or Photos tabs
  const visibleTabs = ['Info', 'Claims', 'Documents', 'Photos'].filter(tabKey => {
    if (tabKey === 'Claims' && isClient) return false;
    if (tabKey === 'Photos' && isClient) return false;
    return true;
  });
  const tabLabel: Record<string, string> = {
    Info: t('units.info'),
    Claims: t('nav.claims'),
    Documents: t('units.documents'),
    Photos: t('common.photos'),
  };

  // ─── State ────────────────────────────────────────────────────────────────
  const [activeTab, setActiveTab] = useState('Info');
  const [unit, setUnit] = useState<any | null>(null);
  const [dealership, setDealership] = useState<any | null>(null);
  const [customer, setCustomer] = useState<any | null>(null);
  const [claims, setClaims] = useState<any[]>([]);
  const [documents, setDocuments] = useState<any[]>([]);
  const [photos, setPhotos] = useState<any[]>([]);
  const [warranty, setWarranty] = useState<any | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Edit mode
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState<Record<string, string>>({});
  const [editSaving, setEditSaving] = useState(false);

  // Document upload
  const [docUploading, setDocUploading] = useState(false);
  const [docCategory, setDocCategory] = useState('other');

  // AI Document Scanner (Documents tab)
  const [scanningDoc, setScanningDoc] = useState(false);
  const [scanDocResult, setScanDocResult] = useState<any | null>(null);
  const [scanDocFile, setScanDocFile] = useState<File | null>(null);

  // Photo upload
  const [photoUploading, setPhotoUploading] = useState(false);
  const [photoCategory, setPhotoCategory] = useState('general');
  const [photoFilter, setPhotoFilter] = useState('');

  // Photo lightbox
  const [lightboxUrl, setLightboxUrl] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // ─── Load unit data ───────────────────────────────────────────────────────
  const loadUnit = useCallback(async () => {
    if (!unitId) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const data = await apiFetch<any>(`/api/v6/units/${unitId}`);
      setUnit(data.unit || null);
      setDealership(data.dealership || null);
      setCustomer(data.customer || null);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load unit');
    } finally {
      setIsLoading(false);
    }
  }, [unitId]);

  const loadClaims = useCallback(async () => {
    if (!unitId || isClient) return;
    try {
      const data = await apiFetch<any[]>(`/api/v6/units/${unitId}/claims`);
      setClaims(Array.isArray(data) ? data : []);
    } catch { setClaims([]); }
  }, [unitId, isClient]);

  const loadDocuments = useCallback(async () => {
    if (!unitId) return;
    try {
      const data = await apiFetch<any[]>(`/api/v6/units/${unitId}/documents`);
      setDocuments(Array.isArray(data) ? data : []);
    } catch { setDocuments([]); }
  }, [unitId]);

  const loadPhotos = useCallback(async () => {
    if (!unitId || isClient) return;
    try {
      const params = new URLSearchParams();
      if (photoFilter) params.set('category', photoFilter);
      const data = await apiFetch<any[]>(`/api/v6/units/${unitId}/photos?${params}`);
      setPhotos(Array.isArray(data) ? data : []);
    } catch { setPhotos([]); }
  }, [unitId, isClient, photoFilter]);

  const loadWarranty = useCallback(async () => {
    if (!unitId) return;
    try {
      const data = await apiFetch<any>(`/api/warranty-plans?unitId=${unitId}`);
      const ws: any[] = Array.isArray(data.warrantyPlans) ? data.warrantyPlans : [];
      const active = ws.find((w: any) => w.status === 'active') ||
                     ws.find((w: any) => w.status === 'expiring') ||
                     ws[0] || null;
      setWarranty(active);
    } catch { setWarranty(null); }
  }, [unitId]);

  useEffect(() => { loadUnit(); }, [loadUnit]);
  useEffect(() => { loadClaims(); }, [loadClaims]);
  useEffect(() => { loadDocuments(); }, [loadDocuments]);
  useEffect(() => { loadPhotos(); }, [loadPhotos]);
  useEffect(() => { loadWarranty(); }, [loadWarranty]);

  // ─── Back navigation ──────────────────────────────────────────────────────
  const handleBack = () => {
    const segments = location.split('/');
    const unitsIdx = segments.indexOf('units');
    if (unitsIdx >= 0) {
      navigate(segments.slice(0, unitsIdx + 1).join('/'));
    } else {
      navigate(-1 as any);
    }
  };

  // ─── Navigate to claim detail ─────────────────────────────────────────────
  const goToClaim = (claimId: string) => {
    const segments = location.split('/').filter(Boolean);
    const unitsIdx = segments.indexOf('units');
    if (unitsIdx >= 0) {
      const base = '/' + segments.slice(0, unitsIdx).join('/');
      navigate(`${base}/claims/${claimId}`);
    }
  };

  // ─── Navigate to new claim ────────────────────────────────────────────────
  const goToNewClaim = () => {
    const segments = location.split('/').filter(Boolean);
    const unitsIdx = segments.indexOf('units');
    if (unitsIdx >= 0) {
      const base = '/' + segments.slice(0, unitsIdx).join('/');
      navigate(`${base}/claims/new`);
    }
  };

  // ─── Edit save ────────────────────────────────────────────────────────────
  const handleEditSave = async () => {
    if (!unitId) return;
    setEditSaving(true);
    try {
      const updated = await apiFetch<any>(`/api/v6/units/${unitId}`, {
        method: 'PATCH',
        body: JSON.stringify(editForm),
      });
      setUnit(updated.unit || updated);
      setEditMode(false);
      showToast('Unit updated');
    } catch (err: any) {
      showToast(`Failed to save: ${err?.message || 'Unknown error'}`);
    } finally {
      setEditSaving(false);
    }
  };

  // ─── AI Scan for unit documents ───────────────────────────────────────────────
  const handleScanDocForUnit = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !unitId) return;
    e.target.value = '';
    setScanningDoc(true);
    setScanDocResult(null);
    setScanDocFile(file);

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      try {
        const result = await apiFetch<any>('/api/ai/scan-document', {
          method: 'POST',
          body: JSON.stringify({
            fileBase64: base64,
            mimeType: file.type || 'application/octet-stream',
            filename: file.name,
          }),
        });
        setScanDocResult(result.extracted || null);
        const typeMap: Record<string, string> = {
          warranty_cert: 'warranty_cert', ext_warranty: 'ext_warranty',
          inspection: 'inspection', contract: 'contract',
          invoice: 'invoice', report: 'report', manufacturer_letter: 'report', other: 'other',
        };
        if (result.extracted?.documentType) {
          setDocCategory(typeMap[result.extracted.documentType] || 'other');
        }
      } catch (err: any) {
        showToast(err?.message || 'Scan failed');
        setScanDocFile(null);
      } finally {
        setScanningDoc(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleUploadScannedDoc = async () => {
    if (!scanDocFile || !unitId) return;
    setDocUploading(true);
    try {
      const presignRes = await apiFetch<any>('/api/v6/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({
          scope: 'units', scopeId: unitId,
          filename: scanDocFile.name,
          contentType: scanDocFile.type || 'application/octet-stream',
          photoType: docCategory,
        }),
      });
      await fetch(presignRes.uploadUrl, {
        method: 'PUT', body: scanDocFile,
        headers: { 'Content-Type': scanDocFile.type || 'application/octet-stream' },
      });
      await apiFetch(`/api/v6/uploads/confirm/${presignRes.photoId}`, { method: 'POST' });
      await apiFetch(`/api/v6/units/${unitId}/documents`, {
        method: 'POST',
        body: JSON.stringify({
          name: scanDocFile.name, url: presignRes.publicUrl,
          type: docCategory, sizeBytes: scanDocFile.size, mimeType: scanDocFile.type,
        }),
      });
      showToast('Document scanned and uploaded');
      setScanDocResult(null);
      setScanDocFile(null);
      loadDocuments();
    } catch (err: any) {
      showToast(`Upload failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setDocUploading(false);
    }
  };

  // ─── Document upload ──────────────────────────────────────────────────────
  const handleDocUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !unitId) return;
    e.target.value = '';
    setDocUploading(true);
    try {
      // Use v6 presign flow for R2, then confirm
      const presignRes = await apiFetch<any>('/api/v6/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({
          scope: 'units',
          scopeId: unitId,
          filename: file.name,
          contentType: file.type || 'application/octet-stream',
          photoType: docCategory,
        }),
      });

      // Upload to R2
      await fetch(presignRes.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type || 'application/octet-stream' },
      });

      // Confirm upload
      await apiFetch(`/api/v6/uploads/confirm/${presignRes.photoId}`, { method: 'POST' });

      // Register as document record
      await apiFetch(`/api/v6/units/${unitId}/documents`, {
        method: 'POST',
        body: JSON.stringify({
          name: file.name,
          url: presignRes.publicUrl,
          type: docCategory,
          sizeBytes: file.size,
          mimeType: file.type,
        }),
      });

      showToast('Document uploaded');
      loadDocuments();
    } catch (err: any) {
      showToast(`Upload failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setDocUploading(false);
    }
  };

  const handleDeleteDoc = async (docId: string) => {
    if (!window.confirm('Delete this document?')) return;
    try {
      await apiFetch(`/api/v6/units/${unitId}/documents/${docId}`, { method: 'DELETE' });
      showToast('Document deleted');
      loadDocuments();
    } catch (err: any) {
      showToast(`Failed to delete: ${err?.message || 'Unknown error'}`);
    }
  };

  // ─── Photo upload ─────────────────────────────────────────────────────────
  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !unitId) return;
    e.target.value = '';
    setPhotoUploading(true);
    try {
      const presignRes = await apiFetch<any>('/api/v6/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({
          scope: 'units',
          scopeId: unitId,
          filename: file.name,
          contentType: file.type,
          photoType: photoCategory,
        }),
      });

      await fetch(presignRes.uploadUrl, {
        method: 'PUT',
        body: file,
        headers: { 'Content-Type': file.type },
      });

      await apiFetch(`/api/v6/uploads/confirm/${presignRes.photoId}`, { method: 'POST' });

      showToast('Photo uploaded');
      loadPhotos();
    } catch (err: any) {
      showToast(`Upload failed: ${err?.message || 'Unknown error'}`);
    } finally {
      setPhotoUploading(false);
    }
  };

  const handleDeletePhoto = async (photoId: string) => {
    if (!window.confirm('Delete this photo?')) return;
    try {
      await apiFetch(`/api/v6/units/${unitId}/photos/${photoId}`, { method: 'DELETE' });
      showToast('Photo deleted');
      loadPhotos();
    } catch (err: any) {
      showToast(`Failed to delete: ${err?.message || 'Unknown error'}`);
    }
  };

  // ─── Loading / Error states ───────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ fontSize: 14, color: '#888' }}>{t('common.loading')}</div>
      </div>
    );
  }

  if (dataError || !unit) {
    return (
      <div className="page active">
        <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>
          {dataError || 'Unit not found.'}
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-o btn-sm" onClick={handleBack}>← {t('common.back')}</button>
          </div>
        </div>
      </div>
    );
  }

  const unitTitle = [unit.year, unit.manufacturer || unit.make, unit.model].filter(Boolean).join(' ') || '—';

  return (
    <div className="page active">
      {/* Print header — visible only in print output */}
      <PrintHeader
        title="Unit Profile"
        subtitle={unitTitle}
        barcodeString={unit.id ? generateBarcodeString('unit', unit.id) : undefined}
        dealerName={dealership?.name}
      />

      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}

      {/* Photo lightbox */}
      {lightboxUrl && (
        <div
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.85)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000, cursor: 'pointer' }}
          onClick={() => setLightboxUrl(null)}
        >
          <img src={lightboxUrl} alt="Unit photo" style={{ maxWidth: '90vw', maxHeight: '90vh', borderRadius: 8, objectFit: 'contain' }} />
          <div style={{ position: 'absolute', top: 16, right: 24, color: '#fff', fontSize: 28, cursor: 'pointer' }} onClick={() => setLightboxUrl(null)}>×</div>
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
          <div className="detail-title">{unitTitle}</div>
          <div className="detail-meta">
            VIN: {unit.vin || '—'} · {unit.stockNumber || 'No Stock #'} · {dealership?.name || '—'}
          </div>
        </div>
        <span className={`bg ${unit.status?.replace(/_/g, '-') || 'active'}`} style={{ fontSize: 13, padding: '6px 16px' }}>
          {unit.status?.replace(/_/g, ' ') || '—'}
        </span>
        {canEdit && !editMode && (
          <button className="btn btn-o btn-sm" onClick={() => {
            setEditForm({
              year: unit.year || '',
              manufacturer: unit.manufacturer || unit.make || '',
              model: unit.model || '',
              stockNumber: unit.stockNumber || '',
              rvType: unit.rvType || '',
              status: unit.status || '',
              lotLocation: unit.lotLocation || '',
              warrantyStart: unit.warrantyStart || '',
              warrantyEnd: unit.warrantyEnd || '',
              extendedWarrantyPlan: unit.extendedWarrantyPlan || '',
              extWarrantyEnd: unit.extWarrantyEnd || '',
            });
            setEditMode(true);
          }}>
            {t('units.editUnit')}
          </button>
        )}
        {editMode && (
          <>
            <button className="btn btn-p btn-sm" onClick={handleEditSave} disabled={editSaving}>
              {editSaving ? t('common.saving') : t('common.save')}
            </button>
            <button className="btn btn-o btn-sm" onClick={() => setEditMode(false)}>{t('common.cancel')}</button>
          </>
        )}
        <PrintButton title={`Unit — ${unit.vin || unit.id?.slice(0, 8)}`} />
        {/* Barcode widget */}
        {unit.id && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginLeft: 8, flexShrink: 0 }}>
            <BarcodeDisplay entityType="unit" entityId={unit.id} size="sm" />
            <QRCodeDisplay entityType="unit" entityId={unit.id} size={56} />
          </div>
        )}
      </div>

      {/* Tabs */}
      <div className="tabs">
        {visibleTabs.map(tab => (
          <div
            key={tab}
            className={`tab${activeTab === tab ? ' active' : ''}`}
            onClick={() => setActiveTab(tab)}
          >
            {tabLabel[tab] || tab}
            {tab === 'Claims' && claims.length > 0 && (
              <span style={{ marginLeft: 6, background: '#e5e7eb', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>{claims.length}</span>
            )}
            {tab === 'Documents' && documents.length > 0 && (
              <span style={{ marginLeft: 6, background: '#e5e7eb', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>{documents.length}</span>
            )}
            {tab === 'Photos' && photos.length > 0 && (
              <span style={{ marginLeft: 6, background: '#e5e7eb', borderRadius: 10, padding: '1px 6px', fontSize: 11 }}>{photos.length}</span>
            )}
          </div>
        ))}
      </div>

      {/* ── TAB: INFO ─────────────────────────────────────────────────────── */}
      {activeTab === 'Info' && (
        <div className="pn">
          {editMode ? (
            /* Edit mode form */
            <div>
              <div style={{ padding: '14px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: 13, color: '#92400e' }}>
                Editing unit. Click <strong>Save</strong> when done.
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
                <div style={{ borderRight: '1px solid #f0f0f0', padding: '16px 20px' }}>
                  <div className="cd-section-h" style={{ marginBottom: 12, fontWeight: 600, fontSize: 13 }}>{t('units.vehicle')}</div>
                  <div className="form-grid c2">
                    {[
                      { key: 'year', label: t('units.year') },
                      { key: 'manufacturer', label: t('units.make') },
                      { key: 'model', label: t('units.model') },
                      { key: 'stockNumber', label: t('units.stockNumber') },
                      { key: 'rvType', label: t('units.type') },
                      { key: 'status', label: t('common.status') },
                      { key: 'lotLocation', label: t('units.lotLocation') },
                    ].map(({ key, label }) => (
                      <div key={key} className="form-group">
                        <label>{label}</label>
                        <input
                          value={editForm[key] || ''}
                          onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
                <div style={{ padding: '16px 20px' }}>
                  <div className="cd-section-h" style={{ marginBottom: 12, fontWeight: 600, fontSize: 13 }}>{t('units.warranty')}</div>
                  <div className="form-grid c2">
                    {[
                      { key: 'warrantyStart', label: t('units.warrantyStart'), type: 'date' },
                      { key: 'warrantyEnd', label: t('units.warrantyEnd'), type: 'date' },
                      { key: 'extendedWarrantyPlan', label: t('units.extWarrantyPlan') },
                      { key: 'extWarrantyEnd', label: t('units.extWarrantyEnd'), type: 'date' },
                    ].map(({ key, label, type }) => (
                      <div key={key} className="form-group">
                        <label>{label}</label>
                        <input
                          type={type || 'text'}
                          value={editForm[key] || ''}
                          onChange={e => setEditForm(f => ({ ...f, [key]: e.target.value }))}
                        />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          ) : (
            /* Read mode */
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0 }}>
              {/* Left: Vehicle */}
              <div style={{ borderRight: '1px solid #f0f0f0' }}>
                <div className="cd-section-h" style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600 }}>{t('units.vehicle')}</div>
                <div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{unit.vin || '—'}</span></div>
                <div className="cd-row"><span className="cd-label">Stock #</span><span className="cd-value">{unit.stockNumber || '—'}</span></div>
                <div className="cd-row"><span className="cd-label">Year</span><span className="cd-value">{unit.year || '—'}</span></div>
                <div className="cd-row"><span className="cd-label">Manufacturer</span><span className="cd-value">{unit.manufacturer || unit.make || '—'}</span></div>
                <div className="cd-row"><span className="cd-label">Model</span><span className="cd-value">{unit.model || '—'}</span></div>
                <div className="cd-row"><span className="cd-label">RV Type</span><span className="cd-value">{unit.rvType || '—'}</span></div>
                <div className="cd-row"><span className="cd-label">Lot Location</span><span className="cd-value">{unit.lotLocation || '—'}</span></div>
                <div className="cd-row"><span className="cd-label">Intake Date</span><span className="cd-value">{unit.intakeDate ? new Date(unit.intakeDate).toLocaleDateString() : '—'}</span></div>
                <div className="cd-row"><span className="cd-label">Sold Date</span><span className="cd-value">{unit.soldDate ? new Date(unit.soldDate).toLocaleDateString() : '—'}</span></div>
                <div className="cd-row">
                  <span className="cd-label">Status</span>
                  <span className="cd-value">
                    <span className={`bg ${unit.status?.replace(/_/g, '-') || 'active'}`}>{unit.status?.replace(/_/g, ' ') || '—'}</span>
                  </span>
                </div>
              </div>

              {/* Right: Warranty + Customer + Dealer */}
              <div>
                <div className="cd-section-h" style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600 }}>{t('units.warranty')}</div>
                <div className="cd-row">
                  <span className="cd-label">Mfr Warranty</span>
                  <span className="cd-value">
                    {unit.warrantyEnd ? (
                      <>
                        Expires {new Date(unit.warrantyEnd).toLocaleDateString()}{' '}
                        <span className={`bg ${unit.mfrWarrantyStatus || 'none'}`} style={{ fontSize: 11 }}>{unit.mfrWarrantyStatus || '—'}</span>
                      </>
                    ) : '—'}
                  </span>
                </div>
                <div className="cd-row"><span className="cd-label">Ext. Warranty Plan</span><span className="cd-value">{unit.extendedWarrantyPlan || '—'}</span></div>
                <div className="cd-row">
                  <span className="cd-label">Ext. Warranty</span>
                  <span className="cd-value">
                    {unit.extWarrantyEnd ? (
                      <>
                        Expires {new Date(unit.extWarrantyEnd).toLocaleDateString()}{' '}
                        <span className={`bg ${unit.extWarrantyStatus || 'none'}`} style={{ fontSize: 11 }}>{unit.extWarrantyStatus || '—'}</span>
                      </>
                    ) : '—'}
                  </span>
                </div>

                {/* Live warranty plan badge from /api/warranty-plans */}
                {warranty && (() => {
                  const daysRem = Math.max(0, Math.floor((new Date(warranty.endDate).getTime() - Date.now()) / (1000 * 60 * 60 * 24)));
                  const wBadgeCls = daysRem === 0 || warranty.status === 'expired' ? 'bg denied' : daysRem <= 90 ? 'bg ow' : 'bg active';
                  const wBadgeLbl = daysRem === 0 || warranty.status === 'expired' ? 'Expired' : daysRem <= 90 ? `${daysRem}d left` : `${daysRem}d left`;
                  return (
                    <div className="cd-row">
                      <span className="cd-label">Platform Plan</span>
                      <span className="cd-value" style={{ display: 'flex', alignItems: 'center', gap: 6, flexWrap: 'wrap' as const }}>
                        <span style={{ fontWeight: 500 }}>{warranty.planNumber} — {warranty.provider}</span>
                        <span className={wBadgeCls} style={{ fontSize: 11 }}>{wBadgeLbl}</span>
                      </span>
                    </div>
                  );
                })()}

                {customer && (
                  <>
                    <div className="cd-section-h" style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600 }}>{t('units.customer')}</div>
                    <div className="cd-row">
                      <span className="cd-label">Name</span>
                      <span className="cd-value">{[customer.firstName, customer.lastName].filter(Boolean).join(' ') || '—'}</span>
                    </div>
                    <div className="cd-row">
                      <span className="cd-label">Email</span>
                      <span className="cd-value" style={{ color: 'var(--brand)' }}>{customer.email || '—'}</span>
                    </div>
                    <div className="cd-row">
                      <span className="cd-label">Phone</span>
                      <span className="cd-value">{customer.phone || '—'}</span>
                    </div>
                  </>
                )}

                {dealership && (
                  <>
                    <div className="cd-section-h" style={{ padding: '14px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600 }}>{t('units.dealershipLabel')}</div>
                    <div className="cd-row"><span className="cd-label">Name</span><span className="cd-value">{dealership.name || '—'}</span></div>
                    {dealership.city && <div className="cd-row"><span className="cd-label">Location</span><span className="cd-value">{[dealership.city, dealership.province].filter(Boolean).join(', ')}</span></div>}
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ── TAB: CLAIMS ───────────────────────────────────────────────────── */}
      {activeTab === 'Claims' && !isClient && (
        <div className="pn">
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
            <div style={{ fontSize: 13, fontWeight: 600 }}>Claims for this Unit ({claims.length})</div>
            {canCreateClaim && (
              <button className="btn btn-p btn-sm" onClick={goToNewClaim}>+ {t('claims.createClaim')}</button>
            )}
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>{t('claims.claimNumber')}</th>
                  <th>{t('common.type')}</th>
                  <th>{t('common.status')}</th>
                  <th>{t('financing.submitted')}</th>
                  <th>{t('common.created')}</th>
                </tr>
              </thead>
              <tbody>
                {claims.length === 0 ? (
                  <tr>
                    <td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#888' }}>{t('common.noItemsFound')}</td>
                  </tr>
                ) : claims.map((c: any) => (
                  <tr key={c.id} style={{ cursor: 'pointer' }} onClick={() => goToClaim(c.id)}>
                    <td><span className="cid">{c.claimNumber || c.id?.slice(0, 8) || '—'}</span></td>
                    <td style={{ textTransform: 'uppercase', fontSize: 12 }}>{c.type || '—'}</td>
                    <td><span className={`bg ${c.status?.replace(/_/g, '-') || 'draft'}`}>{c.status?.replace(/_/g, ' ') || '—'}</span></td>
                    <td style={{ fontSize: 12 }}>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}</td>
                    <td style={{ fontSize: 12 }}>{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ── TAB: DOCUMENTS ────────────────────────────────────────────────── */}
      {activeTab === 'Documents' && (
        <div className="pn">
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Unit Documents ({documents.length})</div>
            {canUploadDocs && (
              <>
                <select
                  value={docCategory}
                  onChange={e => setDocCategory(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                >
                  <option value="warranty_cert">Warranty Certificate</option>
                  <option value="contract">Contract</option>
                  <option value="inspection">Inspection Report</option>
                  <option value="ext_warranty">Ext. Warranty</option>
                  <option value="invoice">Invoice</option>
                  <option value="report">Report</option>
                  <option value="other">Other</option>
                </select>
                <label className="btn btn-o btn-sm" style={{ cursor: 'pointer' }}>
                  {docUploading ? t('common.uploading') : `+ ${t('units.uploadDocument')}`}
                  <input
                    type="file"
                    style={{ display: 'none' }}
                    disabled={docUploading}
                    onChange={handleDocUpload}
                  />
                </label>
                <label className="btn btn-p btn-sm" style={{ cursor: scanningDoc ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 5 }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="2"/><path d="M8 7h8M8 12h8M8 17h5"/>
                  </svg>
                  {scanningDoc ? 'Scanning…' : 'Scan & Upload'}
                  <input
                    type="file"
                    accept="image/*,.pdf,.doc,.docx"
                    style={{ display: 'none' }}
                    disabled={scanningDoc || docUploading}
                    onChange={handleScanDocForUnit}
                  />
                </label>
              </>
            )}
          </div>

          {/* AI scan result preview */}
          {scanDocResult && scanDocFile && (
            <div style={{ padding: '12px 20px', background: '#f0f7ff', borderBottom: '1px solid #dde8f5' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 6, color: '#1e40af' }}>
                AI Scan: {scanDocFile.name}
              </div>
              <div style={{ display: 'flex', gap: 16, flexWrap: 'wrap', fontSize: 12, color: '#444', marginBottom: 12 }}>
                <span><strong>Type:</strong> {scanDocResult.documentType?.replace(/_/g, ' ') || '—'}</span>
                {scanDocResult.issueDate && <span><strong>Date:</strong> {scanDocResult.issueDate}</span>}
                {scanDocResult.expiryDate && <span><strong>Expiry:</strong> {scanDocResult.expiryDate}</span>}
                {scanDocResult.provider && <span><strong>Provider:</strong> {scanDocResult.provider}</span>}
                {scanDocResult.totalAmount && <span><strong>Amount:</strong> {scanDocResult.totalAmount}</span>}
                <span style={{ color: scanDocResult.confidence > 0.7 ? '#059669' : '#d97706' }}>
                  {Math.round((scanDocResult.confidence || 0) * 100)}% confidence
                </span>
              </div>
              <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                <span style={{ fontSize: 12, color: '#666' }}>Tag as:</span>
                <select
                  value={docCategory}
                  onChange={e => setDocCategory(e.target.value)}
                  style={{ padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                >
                  <option value="warranty_cert">Warranty Certificate</option>
                  <option value="contract">Contract</option>
                  <option value="inspection">Inspection Report</option>
                  <option value="ext_warranty">Ext. Warranty</option>
                  <option value="invoice">Invoice</option>
                  <option value="report">Report</option>
                  <option value="other">Other</option>
                </select>
                <button
                  className="btn btn-p btn-sm"
                  onClick={handleUploadScannedDoc}
                  disabled={docUploading}
                >
                  {docUploading ? 'Uploading…' : 'Upload & Tag'}
                </button>
                <button
                  className="btn btn-o btn-sm"
                  onClick={() => { setScanDocResult(null); setScanDocFile(null); }}
                >
                  Discard
                </button>
              </div>
            </div>
          )}

          {documents.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#888', fontSize: 13 }}>{t('units.noDocuments')}</div>
          ) : (
            <div style={{ padding: '12px 20px' }}>
              {documents.map((doc: any) => (
                <div
                  key={doc.id}
                  style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '10px 0', borderBottom: '1px solid #f0f0f0' }}
                >
                  <div style={{ width: 36, height: 36, background: '#f0f4ff', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5">
                      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                    </svg>
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 500, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{doc.name}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                      {doc.type?.replace(/_/g, ' ')} · {doc.sizeBytes ? `${Math.round(doc.sizeBytes / 1024)} KB` : '—'} · {doc.createdAt ? new Date(doc.createdAt).toLocaleDateString() : ''}
                    </div>
                  </div>
                  <a
                    href={doc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn btn-o btn-sm"
                    style={{ fontSize: 11 }}
                    onClick={e => e.stopPropagation()}
                  >
                    {t('common.download')}
                  </a>
                  {canDeleteDocs && (
                    <button
                      className="btn btn-sm"
                      style={{ fontSize: 11, padding: '4px 10px', background: '#fee2e2', color: '#dc2626', border: 'none', borderRadius: 6, cursor: 'pointer' }}
                      onClick={() => handleDeleteDoc(doc.id)}
                    >
                      {t('common.delete')}
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* ── TAB: PHOTOS ───────────────────────────────────────────────────── */}
      {activeTab === 'Photos' && !isClient && (
        <div className="pn">
          <div style={{ padding: '12px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap' }}>
            <div style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>Unit Photos ({photos.length})</div>
            {/* Category filter */}
            <select
              value={photoFilter}
              onChange={e => setPhotoFilter(e.target.value)}
              style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
            >
              <option value="">{t('common.allCategories')}</option>
              <option value="daf">DAF</option>
              <option value="pdi">PDI</option>
              <option value="warranty">Warranty</option>
              <option value="general">General</option>
              <option value="unit_display">Display Photo</option>
            </select>
            {canUploadPhotos && (
              <>
                <select
                  value={photoCategory}
                  onChange={e => setPhotoCategory(e.target.value)}
                  style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                >
                  <option value="daf">DAF</option>
                  <option value="pdi">PDI</option>
                  <option value="warranty">Warranty</option>
                  <option value="general">General</option>
                  <option value="unit_display">Display Photo</option>
                </select>
                <label className="btn btn-o btn-sm" style={{ cursor: 'pointer' }}>
                  {photoUploading ? t('common.uploading') : `+ ${t('units.uploadPhoto')}`}
                  <input
                    type="file"
                    accept="image/*"
                    style={{ display: 'none' }}
                    disabled={photoUploading}
                    onChange={handlePhotoUpload}
                  />
                </label>
              </>
            )}
          </div>

          {photos.length === 0 ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#888', fontSize: 13 }}>{t('units.noPhotos')}</div>
          ) : (
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(140px, 1fr))', gap: 12 }}>
              {photos.map((photo: any) => (
                <div key={photo.id} style={{ position: 'relative', borderRadius: 8, overflow: 'hidden', background: '#f0f0f0', aspectRatio: '1' }}>
                  <img
                    src={photo.publicUrl}
                    alt={photo.filename || 'Unit photo'}
                    style={{ width: '100%', height: '100%', objectFit: 'cover', cursor: 'pointer' }}
                    onClick={() => setLightboxUrl(photo.publicUrl)}
                    onError={e => { (e.target as HTMLImageElement).style.opacity = '0.3'; }}
                  />
                  <div style={{ position: 'absolute', bottom: 0, left: 0, right: 0, background: 'rgba(0,0,0,0.5)', padding: '4px 6px', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontSize: 10, color: '#fff', textTransform: 'uppercase' }}>{photo.photoType || 'general'}</span>
                    {canDeletePhotos && (
                      <button
                        style={{ background: 'none', border: 'none', color: '#fca5a5', fontSize: 14, cursor: 'pointer', padding: 0, lineHeight: 1 }}
                        onClick={() => handleDeletePhoto(photo.id)}
                        title="Delete photo"
                      >
                        ×
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
