// client/src/pages/exclusive/shared/BatchScan.tsx
// Rapid multi-VIN batch scanning — each VIN creates an individual unit record.

import { useState, useRef, useEffect, useCallback } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

// ── Types ─────────────────────────────────────────────────────────────────────

interface ScannedUnit {
  id: string; // local temp ID
  vin: string;
  manufacturer?: string;
  model?: string;
  year?: string;
  rawScanData?: string;
  validationStatus: 'ready' | 'duplicate' | 'invalid_vin' | 'checking' | 'scanning';
  existingUnitId?: string;
}

interface SubmitResult {
  created: number;
  duplicates: number;
  invalid: number;
}

// ── VIN validation ─────────────────────────────────────────────────────────────
function vinIsValid(vin: string): boolean {
  return vin.length === 17 && /^[A-HJ-NPR-Z0-9]+$/i.test(vin);
}

// ── Toast helper ──────────────────────────────────────────────────────────────
function useSimpleToast() {
  const [msg, setMsg] = useState('');
  const [visible, setVisible] = useState(false);
  const show = (m: string) => {
    setMsg(m);
    setVisible(true);
    setTimeout(() => setVisible(false), 2800);
  };
  return { msg, visible, show };
}

// ── Draft persistence ─────────────────────────────────────────────────────────
function getDraftKey(dealerId: string) {
  return `batch-scan-draft-${dealerId}`;
}

// ═══════════════════════════════════════════════════════════════════════════════
export default function BatchScan() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const toast = useSimpleToast();

  // Derive dealerId / role from URL
  const segments = location.split('/').filter(Boolean);
  const dealerId = segments[0] || user?.dealershipId || 'unknown';
  const roleSegment = segments[1] || 'owner';
  const basePath = `/${dealerId}/${roleSegment}`;

  // ── State ──────────────────────────────────────────────────────────────────
  const [scannedUnits, setScannedUnits] = useState<ScannedUnit[]>([]);
  const [manualVin, setManualVin] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [submitResult, setSubmitResult] = useState<SubmitResult | null>(null);
  const [showConfirm, setShowConfirm] = useState(false);
  const [draftOffered, setDraftOffered] = useState(false);
  const [draftChecked, setDraftChecked] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Draft restore ──────────────────────────────────────────────────────────
  useEffect(() => {
    if (draftChecked) return;
    setDraftChecked(true);
    try {
      const saved = localStorage.getItem(getDraftKey(dealerId));
      if (saved) {
        const parsed: ScannedUnit[] = JSON.parse(saved);
        if (parsed.length > 0) {
          setDraftOffered(true);
          // Offer resume — auto-restore after 5s if not dismissed
        }
      }
    } catch {
      // ignore
    }
  }, [dealerId, draftChecked]);

  const resumeDraft = () => {
    try {
      const saved = localStorage.getItem(getDraftKey(dealerId));
      if (saved) {
        const parsed: ScannedUnit[] = JSON.parse(saved);
        // Reset any "checking" states to "ready" so they aren't stuck
        const restored = parsed.map(u => ({
          ...u,
          validationStatus: (u.validationStatus === 'checking' || u.validationStatus === 'scanning')
            ? 'ready' as const
            : u.validationStatus,
        }));
        setScannedUnits(restored);
      }
    } catch {
      // ignore
    }
    setDraftOffered(false);
  };

  const discardDraft = () => {
    localStorage.removeItem(getDraftKey(dealerId));
    setDraftOffered(false);
  };

  // ── Persist draft on change ────────────────────────────────────────────────
  useEffect(() => {
    if (!draftChecked || submitted) return;
    try {
      if (scannedUnits.length > 0) {
        localStorage.setItem(getDraftKey(dealerId), JSON.stringify(scannedUnits));
      } else {
        localStorage.removeItem(getDraftKey(dealerId));
      }
    } catch {
      // ignore
    }
  }, [scannedUnits, dealerId, draftChecked, submitted]);

  // ── Derived counts ─────────────────────────────────────────────────────────
  const readyCount = scannedUnits.filter(u => u.validationStatus === 'ready').length;
  const dupCount = scannedUnits.filter(u => u.validationStatus === 'duplicate').length;
  const invalidCount = scannedUnits.filter(u => u.validationStatus === 'invalid_vin').length;
  const checkingCount = scannedUnits.filter(u =>
    u.validationStatus === 'checking' || u.validationStatus === 'scanning',
  ).length;

  // ── Duplicate check against server ────────────────────────────────────────
  const checkDuplicate = useCallback(async (vin: string, localId: string) => {
    try {
      const data = await apiFetch<any>(`/api/units?search=${encodeURIComponent(vin)}`);
      const existing: any[] = Array.isArray(data) ? data : data.units || [];
      const match = existing.find((u: any) => u.vin?.toUpperCase() === vin.toUpperCase());
      setScannedUnits(prev =>
        prev.map(u =>
          u.id === localId
            ? {
                ...u,
                validationStatus: match ? 'duplicate' : 'ready',
                existingUnitId: match?.id,
              }
            : u,
        ),
      );
    } catch {
      // On network error, assume ready so user can still submit
      setScannedUnits(prev =>
        prev.map(u => (u.id === localId ? { ...u, validationStatus: 'ready' } : u)),
      );
    }
  }, []);

  // ── Add VIN to list ────────────────────────────────────────────────────────
  const addVin = useCallback(
    (rawVin: string, extraData?: Partial<ScannedUnit>) => {
      const vin = rawVin.trim().toUpperCase();
      if (!vin) return;

      // Dedup within current batch
      const alreadyInBatch = scannedUnits.some(u => u.vin === vin);
      if (alreadyInBatch) {
        toast.show(`${vin} is already in this batch`);
        return;
      }

      const localId = crypto.randomUUID();
      const isValid = vinIsValid(vin);

      const newUnit: ScannedUnit = {
        id: localId,
        vin,
        manufacturer: extraData?.manufacturer,
        model: extraData?.model,
        year: extraData?.year,
        rawScanData: extraData?.rawScanData,
        validationStatus: isValid ? 'checking' : 'invalid_vin',
      };

      setScannedUnits(prev => [...prev, newUnit]);

      if (isValid) {
        // Async duplicate check — don't block UI
        checkDuplicate(vin, localId);
      }
    },
    [scannedUnits, checkDuplicate, toast],
  );

  // ── Remove unit ────────────────────────────────────────────────────────────
  const removeUnit = (localId: string) => {
    setScannedUnits(prev => prev.filter(u => u.id !== localId));
  };

  // ── Manual add ────────────────────────────────────────────────────────────
  const handleManualAdd = () => {
    const vin = manualVin.trim();
    if (!vin) return;
    addVin(vin);
    setManualVin('');
  };

  // ── Camera capture ────────────────────────────────────────────────────────
  const handleCapture = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';

    const localId = crypto.randomUUID();
    const placeholder: ScannedUnit = {
      id: localId,
      vin: 'Scanning...',
      validationStatus: 'scanning',
    };
    setScannedUnits(prev => [...prev, placeholder]);

    try {
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

      if (result.success && result.tagData?.vin) {
        const tag = result.tagData;
        const vin = tag.vin.trim().toUpperCase();
        // Remove placeholder and add real unit
        setScannedUnits(prev => prev.filter(u => u.id !== localId));
        addVin(vin, {
          manufacturer: tag.manufacturer || undefined,
          model: tag.model || undefined,
          year: tag.year || undefined,
          rawScanData: tag.rawText || undefined,
        });
      } else {
        // AI failed — mark placeholder as invalid so user sees it
        setScannedUnits(prev =>
          prev.map(u =>
            u.id === localId
              ? { ...u, vin: 'Scan failed — enter manually', validationStatus: 'invalid_vin' }
              : u,
          ),
        );
        toast.show('Could not extract VIN — enter manually');
      }
    } catch {
      setScannedUnits(prev =>
        prev.map(u =>
          u.id === localId
            ? { ...u, vin: 'Scan failed — enter manually', validationStatus: 'invalid_vin' }
            : u,
        ),
      );
      toast.show('Camera scan failed — enter VIN manually');
    }
  };

  // ── Submit ─────────────────────────────────────────────────────────────────
  const handleSubmit = async () => {
    const readyUnits = scannedUnits.filter(u => u.validationStatus === 'ready');
    if (readyUnits.length === 0) return;

    setSubmitting(true);
    setShowConfirm(false);
    try {
      const result = await apiFetch<SubmitResult>('/api/units/batch-import', {
        method: 'POST',
        body: JSON.stringify({
          units: readyUnits.map(u => ({
            vin: u.vin,
            manufacturer: u.manufacturer,
            model: u.model,
            year: u.year,
            rawScanData: u.rawScanData,
          })),
        }),
      });
      setSubmitResult(result);
      setSubmitted(true);
      localStorage.removeItem(getDraftKey(dealerId));
    } catch (err: any) {
      toast.show(err?.message || 'Submission failed. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  // ── Reset for more scanning ────────────────────────────────────────────────
  const handleScanMore = () => {
    setScannedUnits([]);
    setSubmitted(false);
    setSubmitResult(null);
    setManualVin('');
    setShowConfirm(false);
  };

  // ── Status badge ──────────────────────────────────────────────────────────
  const StatusBadge = ({ status }: { status: ScannedUnit['validationStatus'] }) => {
    const map: Record<ScannedUnit['validationStatus'], { bg: string; color: string; label: string }> = {
      ready: { bg: '#f0fdf4', color: '#16a34a', label: '✓ Ready' },
      duplicate: { bg: '#fffbeb', color: '#d97706', label: 'Already in inventory' },
      invalid_vin: { bg: '#fef2f2', color: '#dc2626', label: 'Invalid VIN' },
      checking: { bg: '#eff6ff', color: '#2563eb', label: 'Checking...' },
      scanning: { bg: '#eff6ff', color: '#2563eb', label: 'Scanning...' },
    };
    const s = map[status];
    return (
      <span style={{
        background: s.bg, color: s.color, fontSize: 11, fontWeight: 700,
        padding: '3px 8px', borderRadius: 6, whiteSpace: 'nowrap',
      }}>
        {s.label}
      </span>
    );
  };

  // ── SUCCESS SCREEN ─────────────────────────────────────────────────────────
  if (submitted && submitResult) {
    return (
      <div className="page active" style={{ maxWidth: 480, margin: '0 auto', padding: '40px 16px', textAlign: 'center' }}>
        <div style={{
          width: 80, height: 80, borderRadius: '50%',
          background: 'linear-gradient(135deg, #f0fdf4, #dcfce7)',
          border: '2px solid #86efac',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 20px',
        }}>
          <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2.5">
            <polyline points="20 6 9 17 4 12" />
          </svg>
        </div>
        <div style={{ fontSize: 22, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
          {submitResult.created} {submitResult.created === 1 ? 'unit' : 'units'} submitted!
        </div>
        <div style={{ fontSize: 14, color: '#64748b', lineHeight: 1.6, marginBottom: 28 }}>
          The DS360 team has been notified. You will receive a reminder if DAF photos are needed within 24 hours.
        </div>
        {(submitResult.duplicates > 0 || submitResult.invalid > 0) && (
          <div style={{
            background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 10,
            padding: '12px 16px', marginBottom: 20, fontSize: 13, color: '#92400e', textAlign: 'left',
          }}>
            {submitResult.duplicates > 0 && <div>{submitResult.duplicates} duplicate{submitResult.duplicates > 1 ? 's' : ''} skipped</div>}
            {submitResult.invalid > 0 && <div>{submitResult.invalid} invalid VIN{submitResult.invalid > 1 ? 's' : ''} skipped</div>}
          </div>
        )}
        <button
          className="btn btn-p"
          onClick={handleScanMore}
          style={{ width: '100%', height: 52, fontSize: 15, fontWeight: 700, borderRadius: 10, marginBottom: 10 }}
        >
          Scan More Units
        </button>
        <button
          className="btn btn-o"
          onClick={() => navigate(`${basePath}/units?status=pending_arrival`)}
          style={{ width: '100%', height: 44, borderRadius: 10 }}
        >
          View Arrivals
        </button>
      </div>
    );
  }

  // ── MAIN UI ───────────────────────────────────────────────────────────────
  return (
    <div className="page active" style={{ position: 'relative' }}>
      {/* Toast */}
      {toast.visible && (
        <div style={{
          position: 'fixed', bottom: 80, left: '50%', transform: 'translateX(-50%)',
          background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8,
          fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
          whiteSpace: 'nowrap',
        }}>
          {toast.msg}
        </div>
      )}

      {/* Confirm modal */}
      {showConfirm && (
        <div style={{
          position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
          display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9998, padding: 16,
        }}>
          <div style={{
            background: 'var(--bg-card, white)', borderRadius: 14, padding: '28px 24px',
            maxWidth: 400, width: '100%', boxShadow: '0 20px 60px rgba(0,0,0,0.2)',
          }}>
            <div style={{ fontSize: 18, fontWeight: 700, color: '#1e293b', marginBottom: 8 }}>
              Submit {readyCount} arrival{readyCount !== 1 ? 's' : ''}?
            </div>
            <div style={{ fontSize: 13, color: '#64748b', lineHeight: 1.6, marginBottom: 20 }}>
              <div>Ready to submit: <strong>{readyCount}</strong></div>
              {dupCount > 0 && <div>Duplicates (skipped): <strong>{dupCount}</strong></div>}
              {invalidCount > 0 && <div>Invalid (skipped): <strong>{invalidCount}</strong></div>}
              <div style={{ marginTop: 10 }}>The DS360 team will be notified for DAF inspection.</div>
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button
                className="btn btn-o"
                onClick={() => setShowConfirm(false)}
                style={{ flex: 1, height: 44 }}
              >
                Cancel
              </button>
              <button
                className="btn btn-p"
                onClick={handleSubmit}
                disabled={submitting}
                style={{ flex: 1, height: 44, fontWeight: 700 }}
              >
                {submitting ? 'Submitting...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Draft resume banner */}
      {draftOffered && (
        <div style={{
          background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 10,
          padding: '12px 16px', marginBottom: 16,
          display: 'flex', alignItems: 'center', gap: 12,
        }}>
          <div style={{ flex: 1, fontSize: 13, color: '#1d4ed8', fontWeight: 500 }}>
            You have an unsaved batch draft. Resume it?
          </div>
          <button
            className="btn btn-p btn-sm"
            onClick={resumeDraft}
            style={{ flexShrink: 0 }}
          >
            Resume
          </button>
          <button
            className="btn btn-o btn-sm"
            onClick={discardDraft}
            style={{ flexShrink: 0 }}
          >
            Discard
          </button>
        </div>
      )}

      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: 4 }}>
          Batch Unit Import
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted, #64748b)' }}>
          Scan multiple VINs in succession. Each VIN creates a separate unit record as a pending arrival.
        </div>
      </div>

      {/* Camera + manual input */}
      <div style={{
        background: 'var(--bg-card, white)', border: '1px solid var(--border, #e8e8e8)',
        borderRadius: 12, padding: '20px 20px', marginBottom: 20,
      }}>
        {/* Hidden camera input */}
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
          disabled={submitting}
          style={{
            width: '100%', height: 56, fontSize: 16, fontWeight: 700, borderRadius: 12,
            display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10,
            marginBottom: 16,
          }}
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
            <circle cx="12" cy="13" r="4" />
          </svg>
          Scan VIN Tag
        </button>

        <div style={{ textAlign: 'center', fontSize: 12, color: '#94a3b8', marginBottom: 14 }}>— or —</div>

        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={manualVin}
            onChange={e => setManualVin(e.target.value.toUpperCase())}
            placeholder="Enter VIN manually (e.g. 1HGBH41JXMN109186)"
            style={{
              flex: 1, padding: '12px 14px', border: '1px solid var(--border, #e0e0e0)',
              borderRadius: 10, fontSize: 14, fontFamily: 'inherit',
              background: 'var(--bg-card, white)', color: 'var(--text, #333)',
            }}
            onKeyDown={e => { if (e.key === 'Enter') handleManualAdd(); }}
            disabled={submitting}
          />
          <button
            className="btn btn-o"
            onClick={handleManualAdd}
            disabled={!manualVin.trim() || submitting}
            style={{ flexShrink: 0, height: 48, padding: '0 20px', fontWeight: 600, borderRadius: 10 }}
          >
            Add
          </button>
        </div>
      </div>

      {/* Scanned list */}
      {scannedUnits.length > 0 && (
        <div style={{ marginBottom: 20 }}>
          {/* Summary */}
          <div style={{
            display: 'flex', gap: 12, flexWrap: 'wrap', marginBottom: 12, fontSize: 13,
          }}>
            <span style={{ color: '#16a34a', fontWeight: 600 }}>{readyCount} ready</span>
            {dupCount > 0 && <span style={{ color: '#d97706', fontWeight: 600 }}>{dupCount} duplicate{dupCount > 1 ? 's' : ''}</span>}
            {invalidCount > 0 && <span style={{ color: '#dc2626', fontWeight: 600 }}>{invalidCount} invalid</span>}
            {checkingCount > 0 && <span style={{ color: '#2563eb', fontWeight: 600 }}>{checkingCount} checking...</span>}
          </div>

          <div style={{
            background: 'var(--bg-card, white)', border: '1px solid var(--border, #e8e8e8)',
            borderRadius: 12, overflow: 'hidden',
          }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary, #f8fafc)', borderBottom: '1px solid var(--border, #e8e8e8)' }}>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#94a3b8', textAlign: 'left', width: 32 }}>#</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#94a3b8', textAlign: 'left' }}>VIN</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#94a3b8', textAlign: 'left' }}>Make / Model</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#94a3b8', textAlign: 'left' }}>Status</th>
                  <th style={{ padding: '10px 12px', fontSize: 12, fontWeight: 600, color: '#94a3b8', textAlign: 'center', width: 40 }}></th>
                </tr>
              </thead>
              <tbody>
                {scannedUnits.map((unit, idx) => (
                  <tr
                    key={unit.id}
                    style={{
                      borderBottom: '1px solid var(--border, #f0f0f0)',
                      background: unit.validationStatus === 'duplicate'
                        ? 'rgba(251,191,36,0.05)'
                        : unit.validationStatus === 'invalid_vin'
                        ? 'rgba(239,68,68,0.04)'
                        : 'transparent',
                    }}
                  >
                    <td style={{ padding: '10px 12px', fontSize: 12, color: '#94a3b8', fontWeight: 500 }}>{idx + 1}</td>
                    <td style={{ padding: '10px 12px', fontSize: 13, fontFamily: 'monospace', color: 'var(--text, #1e293b)', fontWeight: 600 }}>
                      {unit.vin}
                    </td>
                    <td style={{ padding: '10px 12px', fontSize: 12, color: '#64748b' }}>
                      {[unit.year, unit.manufacturer, unit.model].filter(Boolean).join(' ') || '—'}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <StatusBadge status={unit.validationStatus} />
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      <button
                        onClick={() => removeUnit(unit.id)}
                        disabled={submitting}
                        style={{
                          background: 'none', border: 'none', cursor: 'pointer', padding: '2px 4px',
                          color: '#94a3b8', fontSize: 16, lineHeight: 1,
                        }}
                        title="Remove"
                      >
                        ×
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Empty state */}
      {scannedUnits.length === 0 && (
        <div style={{
          textAlign: 'center', padding: '40px 20px',
          color: '#94a3b8', fontSize: 14,
          background: 'var(--bg-card, white)', borderRadius: 12,
          border: '1px dashed var(--border, #e8e8e8)', marginBottom: 20,
        }}>
          <div style={{ marginBottom: 8 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{ display: 'inline-block' }}>
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h7v7h-7z" />
            </svg>
          </div>
          No VINs added yet. Scan a tag or enter a VIN above.
        </div>
      )}

      {/* Submit section */}
      <button
        className="btn btn-p"
        onClick={() => setShowConfirm(true)}
        disabled={readyCount === 0 || submitting || checkingCount > 0}
        style={{
          width: '100%', height: 52, fontSize: 15, fontWeight: 700, borderRadius: 10,
          opacity: readyCount === 0 ? 0.5 : 1,
        }}
      >
        {submitting ? 'Submitting...' : `Submit ${readyCount} Arrival${readyCount !== 1 ? 's' : ''}`}
      </button>
      {checkingCount > 0 && (
        <div style={{ textAlign: 'center', fontSize: 12, color: '#64748b', marginTop: 8 }}>
          Checking {checkingCount} VIN{checkingCount > 1 ? 's' : ''} for duplicates...
        </div>
      )}
    </div>
  );
}
