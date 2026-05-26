// client/src/pages/exclusive/shared/PDIDetail.tsx
// Read-only view of a completed/in-progress PDI inspection.
// Loads via GET /api/pdi/:id and GET /api/signatures?parentType=pdi&parentId=:id

import { useEffect, useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { BarcodeDisplay } from '@/lib/barcode';
import PrintButton from '@/components/PrintButton';
import SignatureDisplay, { type StoredSignature } from '@/components/SignatureDisplay';

// ─── Types ─────────────────────────────────────────────────────────────────

interface PDIItem {
  id: string;
  section: string;
  itemName: string;
  status: 'pass' | 'fail' | 'na' | 'pending';
  note: string | null;
  photoUrl: string | null;
  sortOrder: number;
}

interface PDISection {
  name: string;
  items: PDIItem[];
}

interface PDIInspection {
  id: string;
  unitId: string;
  dealershipId: string;
  unitType: string;
  status: 'in_progress' | 'tech_signed' | 'completed' | 'failed';
  overallPassRate: string | null;
  failedItemCount: number | null;
  technicianName: string | null;
  techSignedAt: string | null;
  customerSignedAt: string | null;
  notes: string | null;
  createdAt: string | null;
  sections: PDISection[];
  unit: {
    id: string;
    vin: string;
    year: number | null;
    manufacturer: string | null;
    model: string | null;
    rvType: string | null;
  } | null;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

function sectionLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

function fmtDate(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleDateString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

function fmtDateTime(iso: string | null): string {
  if (!iso) return '—';
  return new Date(iso).toLocaleString('en-CA', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function statusColor(status: PDIInspection['status']): string {
  switch (status) {
    case 'completed': return '#16a34a';
    case 'tech_signed': return '#2563eb';
    case 'in_progress': return '#d97706';
    case 'failed': return '#dc2626';
    default: return '#6b7280';
  }
}

function statusLabel(status: PDIInspection['status'], t: (k: string) => string): string {
  switch (status) {
    case 'completed': return t('pdi.completed');
    case 'tech_signed': return t('pdi.techSigned');
    case 'in_progress': return t('pdi.inProgress');
    case 'failed': return t('pdi.failed');
    default: return status;
  }
}

function passRateColor(rate: number): string {
  if (rate >= 90) return '#16a34a';
  if (rate >= 75) return '#d97706';
  return '#dc2626';
}

// ─── Item status icon ───────────────────────────────────────────────────────

function StatusIcon({ status }: { status: PDIItem['status'] }): React.ReactElement {
  if (status === 'pass') {
    return (
      <span style={{ color: '#16a34a', fontSize: 18, lineHeight: 1 }} title="Pass">✓</span>
    );
  }
  if (status === 'fail') {
    return (
      <span style={{ color: '#dc2626', fontSize: 18, lineHeight: 1 }} title="Fail">✗</span>
    );
  }
  if (status === 'na') {
    return (
      <span style={{ color: '#9ca3af', fontSize: 14, fontWeight: 600, lineHeight: 1 }} title="N/A">N/A</span>
    );
  }
  return (
    <span style={{ color: '#d97706', fontSize: 14, fontWeight: 600, lineHeight: 1 }} title="Pending">–</span>
  );
}

// ─── Toast ─────────────────────────────────────────────────────────────────

interface ToastState { msg: string; type: 'error' | 'success' }

function Toast({ toast, onDismiss }: { toast: ToastState; onDismiss: () => void }): React.ReactElement {
  return (
    <div
      style={{
        position: 'fixed',
        bottom: 24,
        left: '50%',
        transform: 'translateX(-50%)',
        background: toast.type === 'error' ? '#dc2626' : '#16a34a',
        color: '#fff',
        padding: '10px 20px',
        borderRadius: 8,
        fontSize: 14,
        fontWeight: 500,
        zIndex: 9999,
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        cursor: 'pointer',
      }}
      onClick={onDismiss}
    >
      {toast.msg}
    </div>
  );
}

// ─── Main Component ─────────────────────────────────────────────────────────

export default function PDIDetail(): React.ReactElement {
  const [location, navigate] = useLocation();
  const params = useParams<{ dealerId: string; pdiId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Derive dealerId and role from URL
  const dealerId = params.dealerId || user?.dealershipId || (() => {
    const segs = location.split('/').filter(Boolean);
    return segs[0] || 'unknown';
  })();
  const roleSegment = (() => {
    const segs = location.split('/').filter(Boolean);
    return segs[1] || 'owner';
  })();
  const pdiId = params.pdiId || (() => {
    const segs = location.split('/').filter(Boolean);
    return segs[segs.length - 1] || '';
  })();

  // ── State ──────────────────────────────────────────────────────────────────
  const [inspection, setInspection] = useState<PDIInspection | null>(null);
  const [signatures, setSignatures] = useState<StoredSignature[]>([]);
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState<ToastState | null>(null);

  // ── Load data ──────────────────────────────────────────────────────────────
  useEffect(() => {
    if (!pdiId) return;

    let cancelled = false;

    async function load() {
      setLoading(true);
      try {
        const pdiData = await apiFetch<any>(`/api/pdi/${pdiId}`);
        if (!cancelled) {
          setInspection(pdiData.inspection ?? pdiData);
        }

        // Signatures load separately — non-fatal
        try {
          const sigData = await apiFetch<any>(`/api/signatures?parentType=pdi&parentId=${pdiId}`);
          if (!cancelled) {
            setSignatures(Array.isArray(sigData.signatures) ? sigData.signatures : []);
          }
        } catch {
          // Signatures are optional — ignore error
        }

        if (!cancelled) setLoading(false);
      } catch (err: any) {
        if (!cancelled) {
          setToast({ msg: err?.message || t('common.loadFailed'), type: 'error' });
          setLoading(false);
        }
      }
    }

    load();
    return () => { cancelled = true; };
  }, [pdiId, t]);

  // ── Back navigation ────────────────────────────────────────────────────────
  function goBack() {
    if (inspection?.unit?.id) {
      navigate(`/${dealerId}/${roleSegment}/units/${inspection.unit.id}`);
    } else {
      navigate(`/${dealerId}/${roleSegment}/units`);
    }
  }

  // ── Computed ───────────────────────────────────────────────────────────────
  const passRate = inspection?.overallPassRate ? parseFloat(inspection.overallPassRate) : null;
  const failedItems = inspection?.sections.flatMap(s =>
    s.items.filter(i => i.status === 'fail')
  ) ?? [];
  const totalItems = inspection?.sections.flatMap(s => s.items).length ?? 0;
  const passedItems = inspection?.sections.flatMap(s => s.items.filter(i => i.status === 'pass')).length ?? 0;
  const naItems = inspection?.sections.flatMap(s => s.items.filter(i => i.status === 'na')).length ?? 0;
  const unitLabel = inspection?.unit
    ? `${inspection.unit.year ?? ''} ${inspection.unit.manufacturer ?? ''} ${inspection.unit.model ?? ''}`.trim()
    : '—';
  const printTitle = `PDI-${inspection?.id?.slice(0, 8).toUpperCase() ?? 'REPORT'} — ${unitLabel}`;

  // ── Loading state ──────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div style={{ padding: 40, textAlign: 'center', color: '#6b7280', fontSize: 15 }}>
        <div style={{ marginBottom: 12 }}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="2"
            strokeLinecap="round" strokeLinejoin="round"
            style={{ display: 'inline-block', animation: 'spin 1s linear infinite' }}>
            <path d="M21 12a9 9 0 11-6.219-8.56" />
          </svg>
        </div>
        {t('common.loading')}
      </div>
    );
  }

  if (!inspection) {
    return (
      <div style={{ padding: 40, textAlign: 'center' }}>
        <div style={{ color: '#dc2626', marginBottom: 12, fontSize: 15 }}>{t('common.notFound')}</div>
        <button className="btn btn-o btn-sm" onClick={goBack}>{t('common.back')}</button>
      </div>
    );
  }

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div style={{ maxWidth: 860, margin: '0 auto', padding: '24px 16px 64px' }}>

      {/* Back + Print row */}
      <div className="no-print" style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 20 }}>
        <button
          className="btn btn-o btn-sm"
          onClick={goBack}
          style={{ display: 'flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor"
            strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M19 12H5M12 5l-7 7 7 7" />
          </svg>
          {t('common.back')}
        </button>
        <div style={{ flex: 1 }} />
        <PrintButton title={printTitle} />
      </div>

      {/* ── Header card ── */}
      <div
        className="card avoid-break"
        style={{
          padding: '20px 24px',
          marginBottom: 16,
          borderLeft: `4px solid ${statusColor(inspection.status)}`,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'flex-start', gap: 20, flexWrap: 'wrap' }}>
          {/* Left: unit info */}
          <div style={{ flex: 1, minWidth: 200 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>
              {t('pdi.pdiInspection')}
            </div>
            <div style={{ fontSize: 20, fontWeight: 700, color: '#111827', marginBottom: 6 }}>
              {unitLabel}
            </div>
            <div style={{ fontSize: 13, color: '#6b7280', display: 'flex', flexWrap: 'wrap', gap: '4px 16px' }}>
              <span>VIN: <strong style={{ color: '#374151', fontFamily: 'monospace' }}>{inspection.unit?.vin ?? '—'}</strong></span>
              <span>{t('units.type')}: <strong style={{ color: '#374151' }}>{sectionLabel(inspection.unitType)}</strong></span>
              <span>{t('common.date')}: <strong style={{ color: '#374151' }}>{fmtDate(inspection.createdAt)}</strong></span>
            </div>
            {inspection.technicianName && (
              <div style={{ fontSize: 13, color: '#6b7280', marginTop: 4 }}>
                {t('pdi.technician')}: <strong style={{ color: '#374151' }}>{inspection.technicianName}</strong>
              </div>
            )}
          </div>

          {/* Right: status badge + barcode */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 12 }}>
            <span
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                padding: '4px 12px',
                borderRadius: 20,
                fontSize: 12,
                fontWeight: 600,
                background: statusColor(inspection.status) + '20',
                color: statusColor(inspection.status),
                border: `1px solid ${statusColor(inspection.status)}40`,
              }}
            >
              {statusLabel(inspection.status, t)}
            </span>
            <div className="no-print">
              <BarcodeDisplay entityType="pdi" entityId={inspection.id} size="sm" />
            </div>
          </div>
        </div>
      </div>

      {/* ── Pass rate summary ── */}
      <div
        className="card avoid-break"
        style={{
          padding: '20px 24px',
          marginBottom: 16,
          display: 'flex',
          gap: 32,
          flexWrap: 'wrap',
          alignItems: 'center',
        }}
      >
        {/* Pass rate ring / number */}
        <div style={{ textAlign: 'center', minWidth: 100 }}>
          <div style={{
            fontSize: 40,
            fontWeight: 800,
            lineHeight: 1,
            color: passRate !== null ? passRateColor(passRate) : '#9ca3af',
          }}>
            {passRate !== null ? `${Math.round(passRate)}%` : '—'}
          </div>
          <div style={{ fontSize: 12, color: '#6b7280', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {t('pdi.passRate')}
          </div>
        </div>

        {/* Divider */}
        <div style={{ width: 1, background: '#e5e7eb', alignSelf: 'stretch', minHeight: 40 }} />

        {/* Stat grid */}
        <div style={{ display: 'flex', gap: 24, flexWrap: 'wrap', flex: 1 }}>
          <Stat label={t('pdi.totalItems')} value={totalItems} color="#6b7280" />
          <Stat label={t('pdi.passedItems')} value={passedItems} color="#16a34a" />
          <Stat label={t('pdi.failedItems')} value={inspection.failedItemCount ?? failedItems.length} color="#dc2626" />
          <Stat label={t('pdi.naItems')} value={naItems} color="#9ca3af" />
        </div>
      </div>

      {/* ── Failed items highlight ── */}
      {failedItems.length > 0 && (
        <div
          className="card avoid-break"
          style={{
            padding: '16px 20px',
            marginBottom: 16,
            border: '1px solid #fecaca',
            background: '#fef2f2',
          }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#dc2626', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 8 }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <line x1="12" y1="8" x2="12" y2="12" />
              <line x1="12" y1="16" x2="12.01" y2="16" />
            </svg>
            {t('pdi.failedItemsCustomer')} ({failedItems.length})
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {failedItems.map(item => (
              <div key={item.id} style={{ display: 'flex', gap: 12, alignItems: 'flex-start' }}>
                <span style={{ color: '#dc2626', fontWeight: 700, fontSize: 16, marginTop: 1, flexShrink: 0 }}>✗</span>
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#374151' }}>
                    <span style={{ color: '#9ca3af', fontWeight: 400 }}>{sectionLabel(item.section)} › </span>
                    {item.itemName}
                  </div>
                  {item.note && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 2, fontStyle: 'italic' }}>
                      {item.note}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ── Checklist sections ── */}
      {inspection.sections.map(section => (
        <div
          key={section.name}
          className="card avoid-break"
          style={{ padding: '16px 20px', marginBottom: 12 }}
        >
          <div style={{ fontSize: 13, fontWeight: 700, color: '#374151', marginBottom: 12, textTransform: 'uppercase', letterSpacing: '0.05em' }}>
            {sectionLabel(section.name)}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
            {section.items.map((item, idx) => (
              <div
                key={item.id}
                style={{
                  display: 'flex',
                  alignItems: 'flex-start',
                  gap: 12,
                  padding: '10px 0',
                  borderTop: idx > 0 ? '1px solid #f3f4f6' : 'none',
                }}
              >
                {/* Status icon */}
                <div style={{ width: 28, flexShrink: 0, paddingTop: 1, textAlign: 'center' }}>
                  <StatusIcon status={item.status} />
                </div>

                {/* Item name + note */}
                <div style={{ flex: 1 }}>
                  <div style={{ fontSize: 13, color: '#374151', fontWeight: item.status === 'fail' ? 600 : 400 }}>
                    {item.itemName}
                  </div>
                  {item.note && (
                    <div style={{ fontSize: 12, color: '#6b7280', marginTop: 3, fontStyle: 'italic' }}>
                      {item.note}
                    </div>
                  )}
                </div>

                {/* Photo thumbnail */}
                {item.photoUrl && (
                  <a
                    href={item.photoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{ flexShrink: 0 }}
                    title={t('common.viewPhoto')}
                  >
                    <img
                      src={item.photoUrl}
                      alt={item.itemName}
                      style={{
                        width: 52,
                        height: 40,
                        objectFit: 'cover',
                        borderRadius: 4,
                        border: '1px solid #e5e7eb',
                        display: 'block',
                      }}
                    />
                  </a>
                )}
              </div>
            ))}
          </div>
        </div>
      ))}

      {/* ── General notes ── */}
      {inspection.notes && (
        <div
          className="card avoid-break"
          style={{ padding: '16px 20px', marginBottom: 16 }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 8 }}>
            {t('pdi.generalNotes')}
          </div>
          <div style={{ fontSize: 13, color: '#374151', lineHeight: 1.6, whiteSpace: 'pre-wrap' }}>
            {inspection.notes}
          </div>
        </div>
      )}

      {/* ── Sign-off timeline ── */}
      {(inspection.techSignedAt || inspection.customerSignedAt) && (
        <div
          className="card avoid-break"
          style={{ padding: '16px 20px', marginBottom: 16 }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            {t('pdi.signOffTimeline')}
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {inspection.techSignedAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                <span style={{ color: '#2563eb', fontSize: 16 }}>✓</span>
                <span><strong>{t('pdi.techSignOff')}</strong> — {fmtDateTime(inspection.techSignedAt)}</span>
                {inspection.technicianName && <span style={{ color: '#6b7280' }}>({inspection.technicianName})</span>}
              </div>
            )}
            {inspection.customerSignedAt && (
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, fontSize: 13, color: '#374151' }}>
                <span style={{ color: '#16a34a', fontSize: 16 }}>✓</span>
                <span><strong>{t('pdi.customerSignOff')}</strong> — {fmtDateTime(inspection.customerSignedAt)}</span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ── Signatures ── */}
      {signatures.length > 0 && (
        <div
          className="card avoid-break"
          style={{ padding: '16px 20px', marginBottom: 16 }}
        >
          <div style={{ fontSize: 12, fontWeight: 700, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 12 }}>
            {t('pdi.signatures')}
          </div>
          <SignatureDisplay signatures={signatures} />
        </div>
      )}

      {/* ── Print footer (only visible in print) ── */}
      <div
        className="print-only"
        style={{
          display: 'none',
          marginTop: 40,
          paddingTop: 16,
          borderTop: '1px solid #e5e7eb',
          fontSize: 11,
          color: '#9ca3af',
          textAlign: 'center',
        }}
      >
        Dealer Suite 360 — PDI Report • {unitLabel} • VIN: {inspection.unit?.vin ?? '—'} • {fmtDate(inspection.createdAt)}
      </div>

      {/* Toast */}
      {toast && <Toast toast={toast} onDismiss={() => setToast(null)} />}
    </div>
  );
}

// ─── Stat sub-component ────────────────────────────────────────────────────

function Stat({ label, value, color }: { label: string; value: number; color: string }): React.ReactElement {
  return (
    <div style={{ textAlign: 'center' }}>
      <div style={{ fontSize: 26, fontWeight: 700, color, lineHeight: 1 }}>{value}</div>
      <div style={{ fontSize: 11, color: '#6b7280', marginTop: 4, textTransform: 'uppercase', letterSpacing: '0.04em' }}>{label}</div>
    </div>
  );
}
