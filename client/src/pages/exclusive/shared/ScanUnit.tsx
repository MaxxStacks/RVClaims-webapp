// client/src/pages/exclusive/shared/ScanUnit.tsx
// Full-screen unit tag scanner — uses rear camera, AI extraction, DS360 barcode recognition
// Fallback to manual VIN entry when API key is not configured.

import { useState, useRef, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { parseDS360Barcode } from '@/lib/barcode';

type ScanState =
  | 'idle'
  | 'scanning'
  | 'result_found'
  | 'unit_not_found'
  | 'scan_failed'
  | 'barcode_found';

interface ExtractedTag {
  vin: string | null;
  manufacturer: string | null;
  model: string | null;
  year: string | null;
  weight: string | null;
  serialNumber: string | null;
  rawText?: string;
  confidence?: number;
  parseError?: boolean;
  fallback?: boolean;
}

interface FoundUnit {
  id: string;
  vin: string;
  manufacturer?: string;
  make?: string;
  model?: string;
  year?: string | number;
  status?: string;
}

interface BarcodeResult {
  type: string;
  shortId: string;
  raw: string;
}

export default function ScanUnit() {
  const [location, navigate] = useLocation();
  const params = useParams<{ dealerId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Derive dealerId from URL segments (Wouter may not expose it depending on route nesting)
  const dealerId = params.dealerId || user?.dealershipId || (() => {
    const segments = location.split('/').filter(Boolean);
    return segments[0] || 'unknown';
  })();

  // Derive role segment from URL
  const roleSegment = (() => {
    const segments = location.split('/').filter(Boolean);
    return segments[1] || 'owner';
  })();

  // ── State ──────────────────────────────────────────────────────────────────
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [extractedTag, setExtractedTag] = useState<ExtractedTag | null>(null);
  const [foundUnit, setFoundUnit] = useState<FoundUnit | null>(null);
  const [scannedVin, setScannedVin] = useState<string>('');
  const [barcodeResult, setBarcodeResult] = useState<BarcodeResult | null>(null);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [isFallback, setIsFallback] = useState(false);

  // Manual VIN form
  const [manualVin, setManualVin] = useState('');
  const [manualSearching, setManualSearching] = useState(false);
  const [manualError, setManualError] = useState('');

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Toast ─────────────────────────────────────────────────────────────────
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // ── Navigation helpers ───────────────────────────────────────────────────
  const basePath = `/${dealerId}/${roleSegment}`;

  const goToUnit = (unitId: string) => navigate(`${basePath}/units/${unitId}`);
  const goToNewClaim = (unitId: string) => navigate(`${basePath}/claims/new?unitId=${unitId}`);
  const goToUpload = (unitId: string) => navigate(`${basePath}/units/${unitId}?tab=photos`);
  const goToNewWorkOrder = (unitId: string) => navigate(`${basePath}/techflow/new?unitId=${unitId}`);
  const goToScanDoc = (unitId: string) => navigate(`${basePath}/units/${unitId}?tab=documents&scan=true`);

  const goToCreateUnit = (tag: ExtractedTag | null) => {
    const params = new URLSearchParams();
    if (tag?.vin) params.set('vin', tag.vin);
    if (tag?.manufacturer) params.set('manufacturer', tag.manufacturer);
    if (tag?.model) params.set('model', tag.model);
    if (tag?.year) params.set('year', tag.year);
    if (tag?.weight) params.set('weight', tag.weight);
    navigate(`${basePath}/units/new?${params.toString()}`);
  };

  // Navigate to entity by barcode type
  const goToBarcodeEntity = (result: BarcodeResult) => {
    switch (result.type) {
      case 'unit':
        // Search for unit by short ID prefix
        searchUnitByShortId(result.shortId);
        break;
      case 'claim':
        navigate(`${basePath}/claims/${result.shortId}`);
        break;
      case 'workOrder':
        navigate(`${basePath}/techflow/${result.shortId}`);
        break;
      case 'invoice':
        navigate(`${basePath}/invoices/${result.shortId}`);
        break;
      default:
        showToast(`Found ${result.type} barcode: ${result.raw}`);
    }
  };

  // ── Search unit by short ID (for barcode lookup) ─────────────────────────
  const searchUnitByShortId = async (shortId: string) => {
    try {
      const data = await apiFetch<any>(`/api/units?search=${shortId}`);
      const units: FoundUnit[] = Array.isArray(data) ? data : data.units || [];
      const match = units.find((u: any) =>
        u.id?.replace(/-/g, '').toUpperCase().startsWith(shortId)
      );
      if (match) {
        goToUnit(match.id);
      } else {
        showToast(`No unit found for barcode ID: ${shortId}`);
      }
    } catch {
      showToast('Could not look up barcode entity');
    }
  };

  // ── Search unit by VIN ────────────────────────────────────────────────────
  const searchUnitByVin = useCallback(async (vin: string): Promise<FoundUnit | null> => {
    try {
      const data = await apiFetch<any>(`/api/units?search=${encodeURIComponent(vin)}`);
      const units: FoundUnit[] = Array.isArray(data) ? data : data.units || [];
      return units.find((u: any) =>
        u.vin?.toUpperCase() === vin.toUpperCase()
      ) || units[0] || null;
    } catch {
      return null;
    }
  }, []);

  // ── Capture handler ────────────────────────────────────────────────────────
  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    // Show image preview
    const reader = new FileReader();
    reader.onload = (ev) => {
      setImagePreview(ev.target?.result as string);
    };
    reader.readAsDataURL(file);

    setScanState('scanning');
    setExtractedTag(null);
    setFoundUnit(null);
    setBarcodeResult(null);
    setErrorMsg('');

    try {
      // Convert to base64
      const base64DataUrl = await new Promise<string>((resolve, reject) => {
        const fr = new FileReader();
        fr.onload = () => resolve(fr.result as string);
        fr.onerror = reject;
        fr.readAsDataURL(file);
      });
      const base64 = base64DataUrl.split(',')[1];

      const result = await apiFetch<any>('/api/ai/scan-unit-tag', {
        method: 'POST',
        body: JSON.stringify({
          imageBase64: base64,
          mimeType: file.type || 'image/jpeg',
        }),
      });

      if (!result.success) {
        if (result.fallback) {
          setIsFallback(true);
          setScanState('scan_failed');
          setErrorMsg(t('scanner.noApiKey'));
          return;
        }
        setScanState('scan_failed');
        setErrorMsg(result.message || 'Scan failed');
        return;
      }

      const tagData: ExtractedTag = result.tagData || {};

      // Check for DS360 barcode FIRST
      if (tagData.rawText) {
        const barcodeMatch = parseDS360Barcode(tagData.rawText);
        if (barcodeMatch) {
          setBarcodeResult(barcodeMatch);
          setScanState('barcode_found');
          return;
        }
      }

      setExtractedTag(tagData);

      if (tagData.parseError || (!tagData.vin && !tagData.rawText)) {
        setScanState('scan_failed');
        setErrorMsg('Could not extract text from image');
        return;
      }

      if (tagData.vin) {
        setScannedVin(tagData.vin);
        const unit = await searchUnitByVin(tagData.vin);
        if (unit) {
          setFoundUnit(unit);
          setScanState('result_found');
        } else {
          setScanState('unit_not_found');
        }
      } else {
        setScanState('unit_not_found');
      }
    } catch (err: any) {
      if (err?.status === 503 || err?.message?.includes('503')) {
        setIsFallback(true);
        setScanState('scan_failed');
        setErrorMsg(t('scanner.noApiKey'));
      } else {
        setScanState('scan_failed');
        setErrorMsg(err?.message || 'Scan failed. Please try again.');
      }
    }
  };

  // ── Manual VIN search ─────────────────────────────────────────────────────
  const handleManualSearch = async () => {
    const vin = manualVin.trim().toUpperCase();
    if (!vin) {
      setManualError('Please enter a VIN');
      return;
    }
    setManualSearching(true);
    setManualError('');
    try {
      const unit = await searchUnitByVin(vin);
      if (unit) {
        setFoundUnit(unit);
        setScannedVin(vin);
        setExtractedTag(null);
        setScanState('result_found');
      } else {
        setFoundUnit(null);
        setScannedVin(vin);
        setExtractedTag({ vin, manufacturer: null, model: null, year: null, weight: null, serialNumber: null });
        setScanState('unit_not_found');
      }
    } catch {
      setManualError('Search failed. Please try again.');
    } finally {
      setManualSearching(false);
    }
  };

  // ── Reset ─────────────────────────────────────────────────────────────────
  const reset = () => {
    setScanState('idle');
    setImagePreview(null);
    setExtractedTag(null);
    setFoundUnit(null);
    setBarcodeResult(null);
    setErrorMsg('');
    setIsFallback(false);
    setManualVin('');
    setManualError('');
  };

  // ── Manual VIN form (shared across idle + not_found + failed) ─────────────
  const ManualForm = () => (
    <div style={{
      marginTop: 20,
      padding: '16px 20px',
      background: 'var(--bg-secondary, #f8fafc)',
      borderRadius: 10,
      border: '1px solid var(--border, #e8e8e8)',
    }}>
      <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #333)', marginBottom: 10 }}>
        {t('scanner.orEnterVin')}
      </div>
      <div style={{ display: 'flex', gap: 8 }}>
        <input
          type="text"
          value={manualVin}
          onChange={e => setManualVin(e.target.value.toUpperCase())}
          placeholder={t('scanner.vinPlaceholder')}
          style={{
            flex: 1, padding: '10px 12px', border: '1px solid var(--border, #e0e0e0)',
            borderRadius: 8, fontSize: 13, fontFamily: 'inherit',
            background: 'var(--bg-card, white)', color: 'var(--text, #333)',
          }}
          onKeyDown={e => { if (e.key === 'Enter') handleManualSearch(); }}
        />
        <button
          className="btn btn-p btn-sm"
          onClick={handleManualSearch}
          disabled={manualSearching}
          style={{ minWidth: 80, flexShrink: 0 }}
        >
          {manualSearching ? '...' : t('scanner.searchVin')}
        </button>
      </div>
      {manualError && (
        <div style={{ marginTop: 6, fontSize: 12, color: '#dc2626' }}>{manualError}</div>
      )}
    </div>
  );

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="page active" style={{ minHeight: '100vh', position: 'relative' }}>
      {/* Toast */}
      {toastVisible && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8,
          fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}>
          {toastMsg}
        </div>
      )}

      {/* Back button */}
      <button
        className="detail-back"
        onClick={() => navigate(`${basePath}/dashboard`)}
        style={{ marginBottom: 8 }}
      >
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
      </button>

      {/* ── IDLE ─────────────────────────────────────────────────────────── */}
      {scanState === 'idle' && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px', textAlign: 'center' }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%',
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '2px solid #86efac',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h7v7h-7z" />
            </svg>
          </div>

          <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: 8 }}>
            {t('scanner.scanUnit')}
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-muted, #64748b)', marginBottom: 32, lineHeight: 1.5 }}>
            {t('scanner.scanSubtitle')}
          </div>

          {/* Hidden file input — triggers camera */}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            capture="environment"
            onChange={handleCapture}
            style={{ display: 'none' }}
          />

          <button
            className="btn btn-p"
            onClick={() => fileInputRef.current?.click()}
            style={{
              width: '100%', maxWidth: 320, height: 56, fontSize: 16, fontWeight: 700,
              borderRadius: 12, display: 'flex', alignItems: 'center', justifyContent: 'center',
              gap: 10, margin: '0 auto',
            }}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
            {t('scanner.scanTag')}
          </button>

          <ManualForm />
        </div>
      )}

      {/* ── SCANNING ──────────────────────────────────────────────────────── */}
      {scanState === 'scanning' && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '32px 16px' }}>
          {imagePreview && (
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <img
                src={imagePreview}
                alt="Captured tag"
                style={{ maxWidth: 240, maxHeight: 160, borderRadius: 8, objectFit: 'cover', border: '1px solid var(--border, #e0e0e0)' }}
              />
            </div>
          )}
          <div style={{ textAlign: 'center', padding: '32px 16px' }}>
            <div style={{
              width: 48, height: 48, border: '3px solid #16a34a', borderTopColor: 'transparent',
              borderRadius: '50%', margin: '0 auto 16px', animation: 'spin 0.8s linear infinite',
            }} />
            <div style={{ fontSize: 16, fontWeight: 600, color: 'var(--text, #333)' }}>
              {t('scanner.readingTag')}
            </div>
          </div>
        </div>
      )}

      {/* ── RESULT FOUND ──────────────────────────────────────────────────── */}
      {scanState === 'result_found' && foundUnit && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
          {/* Green header */}
          <div style={{
            background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
            border: '1px solid #86efac', borderRadius: 12, padding: '20px 24px',
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#16a34a',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <polyline points="20 6 9 17 4 12" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#166534', fontWeight: 600, marginBottom: 2 }}>
                {t('scanner.unitFound')}
              </div>
              <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b' }}>
                {foundUnit.year} {foundUnit.manufacturer || foundUnit.make} {foundUnit.model}
              </div>
              <div style={{ fontSize: 12, color: '#64748b', marginTop: 2 }}>
                VIN: {foundUnit.vin}
              </div>
            </div>
          </div>

          {/* Primary action */}
          <button
            className="btn btn-p"
            onClick={() => goToUnit(foundUnit.id)}
            style={{ width: '100%', height: 52, fontSize: 15, fontWeight: 700, borderRadius: 10, marginBottom: 16 }}
          >
            {t('scanner.openUnit')}
          </button>

          {/* Quick actions grid */}
          <div style={{ marginBottom: 16 }}>
            <div style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted, #94a3b8)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 10 }}>
              {t('scanner.quickActions')}
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
              <QuickActionButton
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>}
                label={t('scanner.fileAClaim')}
                onClick={() => goToNewClaim(foundUnit.id)}
              />
              <QuickActionButton
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z"/><circle cx="12" cy="13" r="4"/></svg>}
                label={t('scanner.uploadPhotos')}
                onClick={() => goToUpload(foundUnit.id)}
              />
              <QuickActionButton
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>}
                label={t('scanner.createWorkOrder')}
                onClick={() => goToNewWorkOrder(foundUnit.id)}
              />
              <QuickActionButton
                icon={<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>}
                label={t('scanner.scanDocument')}
                onClick={() => goToScanDoc(foundUnit.id)}
              />
            </div>
          </div>

          <button className="btn btn-o" onClick={reset} style={{ width: '100%', height: 44, borderRadius: 10 }}>
            {t('scanner.scanAnother')}
          </button>
        </div>
      )}

      {/* ── UNIT NOT FOUND ────────────────────────────────────────────────── */}
      {scanState === 'unit_not_found' && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
          {/* Orange header */}
          <div style={{
            background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 12, padding: '20px 24px',
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#f97316',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="12" y1="8" x2="12" y2="12" />
                <line x1="12" y1="16" x2="12.01" y2="16" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#c2410c', fontWeight: 600, marginBottom: 2 }}>
                {t('scanner.unitNotFound')}
              </div>
              <div style={{ fontSize: 14, color: '#1e293b' }}>
                {scannedVin ? `VIN: ${scannedVin}` : 'No VIN could be read'}
              </div>
            </div>
          </div>

          <button
            className="btn btn-p"
            onClick={() => goToCreateUnit(extractedTag)}
            style={{ width: '100%', height: 52, fontSize: 15, fontWeight: 700, borderRadius: 10, marginBottom: 10 }}
          >
            {t('scanner.createUnit')}
          </button>
          <button className="btn btn-o" onClick={reset} style={{ width: '100%', height: 44, borderRadius: 10, marginBottom: 16 }}>
            {t('scanner.tryAgain')}
          </button>

          <ManualForm />
        </div>
      )}

      {/* ── SCAN FAILED ───────────────────────────────────────────────────── */}
      {scanState === 'scan_failed' && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
          {/* Red/gray header */}
          <div style={{
            background: isFallback ? '#f8fafc' : '#fef2f2',
            border: `1px solid ${isFallback ? '#cbd5e1' : '#fecaca'}`,
            borderRadius: 12, padding: '20px 24px', marginBottom: 20,
            display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%',
              background: isFallback ? '#94a3b8' : '#ef4444',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <circle cx="12" cy="12" r="10" />
                <line x1="15" y1="9" x2="9" y2="15" />
                <line x1="9" y1="9" x2="15" y2="15" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: isFallback ? '#475569' : '#dc2626', marginBottom: 2 }}>
                {t('scanner.scanFailed')}
              </div>
              <div style={{ fontSize: 12, color: '#64748b' }}>
                {errorMsg || 'Could not read tag. Please try again.'}
              </div>
            </div>
          </div>

          <button className="btn btn-p" onClick={reset} style={{ width: '100%', height: 52, fontSize: 15, fontWeight: 700, borderRadius: 10, marginBottom: 16 }}>
            {t('scanner.tryAgain')}
          </button>

          <ManualForm />
        </div>
      )}

      {/* ── BARCODE FOUND ─────────────────────────────────────────────────── */}
      {scanState === 'barcode_found' && barcodeResult && (
        <div style={{ maxWidth: 480, margin: '0 auto', padding: '24px 16px' }}>
          <div style={{
            background: 'linear-gradient(135deg, #eff6ff, #dbeafe)',
            border: '1px solid #93c5fd', borderRadius: 12, padding: '20px 24px',
            marginBottom: 20, display: 'flex', alignItems: 'center', gap: 14,
          }}>
            <div style={{
              width: 44, height: 44, borderRadius: '50%', background: '#3b82f6',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <rect x="3" y="3" width="7" height="7" rx="1" />
                <rect x="14" y="3" width="7" height="7" rx="1" />
                <rect x="3" y="14" width="7" height="7" rx="1" />
                <path d="M14 14h7v7h-7z" />
              </svg>
            </div>
            <div>
              <div style={{ fontSize: 13, color: '#1d4ed8', fontWeight: 600, marginBottom: 2 }}>
                {t('scanner.barcodeFound')}
              </div>
              <div style={{ fontSize: 14, fontWeight: 600, color: '#1e293b' }}>
                DS360 {barcodeResult.type.toUpperCase()} · {barcodeResult.shortId}
              </div>
              <div style={{ fontSize: 11, fontFamily: 'monospace', color: '#64748b', marginTop: 2 }}>
                {barcodeResult.raw}
              </div>
            </div>
          </div>

          <button
            className="btn btn-p"
            onClick={() => goToBarcodeEntity(barcodeResult)}
            style={{ width: '100%', height: 52, fontSize: 15, fontWeight: 700, borderRadius: 10, marginBottom: 10 }}
          >
            Open {barcodeResult.type.charAt(0).toUpperCase() + barcodeResult.type.slice(1)}
          </button>
          <button className="btn btn-o" onClick={reset} style={{ width: '100%', height: 44, borderRadius: 10 }}>
            {t('scanner.scanAnother')}
          </button>
        </div>
      )}

      {/* CSS for spinner */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }
      `}</style>
    </div>
  );
}

// ── Quick action button ────────────────────────────────────────────────────────
function QuickActionButton({
  icon, label, onClick,
}: {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
}) {
  return (
    <button
      onClick={onClick}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center',
        gap: 8, padding: '16px 12px', background: 'var(--bg-card, white)',
        border: '1px solid var(--border, #e8e8e8)', borderRadius: 10, cursor: 'pointer',
        color: 'var(--text, #333)', fontFamily: 'inherit', fontSize: 12, fontWeight: 600,
        transition: 'all 0.15s', minHeight: 80,
      }}
      onMouseEnter={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = '#3b82f6'; (e.currentTarget as HTMLButtonElement).style.background = '#eff6ff'; }}
      onMouseLeave={e => { (e.currentTarget as HTMLButtonElement).style.borderColor = 'var(--border, #e8e8e8)'; (e.currentTarget as HTMLButtonElement).style.background = 'var(--bg-card, white)'; }}
    >
      <div style={{ color: '#3b82f6' }}>{icon}</div>
      <div style={{ textAlign: 'center' as const, lineHeight: 1.3 }}>{label}</div>
    </button>
  );
}
