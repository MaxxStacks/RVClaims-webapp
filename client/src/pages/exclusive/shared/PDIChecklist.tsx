// client/src/pages/exclusive/shared/PDIChecklist.tsx
// PDI Pre-Delivery Inspection — 5-step wizard
// Steps: 1=Unit Info, 2=Checklist, 3=Summary, 4=Tech Sign-Off, 5=Customer Sign-Off

import { useState, useEffect, useCallback, useRef } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import SignatureCapture, { type SignatureData } from '@/components/SignatureCapture';

// ─── Types ─────────────────────────────────────────────────────────────────

type ItemStatus = 'pass' | 'fail' | 'na' | 'pending';

interface PDIItem {
  id: string;
  inspectionId: string;
  section: string;
  itemName: string;
  status: ItemStatus;
  note: string | null;
  photoUrl: string | null;
  sortOrder: number;
}

interface PDISection {
  name: string;
  items: PDIItem[];
}

interface UnitInfo {
  id: string;
  vin: string;
  year: number | null;
  manufacturer: string | null;
  model: string | null;
  rvType: string | null;
  dealershipId: string;
}

type Step = 1 | 2 | 3 | 4 | 5;

// ─── Section label helper ──────────────────────────────────────────────────

function sectionLabel(s: string): string {
  return s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
}

// ─── Toast component ──────────────────────────────────────────────────────

function Toast({ msg, visible }: { msg: string; visible: boolean }) {
  if (!visible) return null;
  return (
    <div style={{
      position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)',
      background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8,
      fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
    }}>
      {msg}
    </div>
  );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function PDIChecklist() {
  const [location, navigate] = useLocation();
  const params = useParams<{ unitId: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  const unitId = params.unitId || (() => {
    const segs = location.split('/');
    const idx = segs.indexOf('units');
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  // ─── Wizard state ──────────────────────────────────────────────────────
  const [step, setStep] = useState<Step>(1);
  const [unit, setUnit] = useState<UnitInfo | null>(null);
  const [unitLoading, setUnitLoading] = useState(true);
  const [unitType, setUnitType] = useState('travel_trailer');
  const [inspectionId, setInspectionId] = useState<string | null>(null);
  const [sections, setSections] = useState<PDISection[]>([]);
  const [generalNotes, setGeneralNotes] = useState('');
  const [creating, setCreating] = useState(false);
  const [savingItems, setSavingItems] = useState(false);
  const [openSection, setOpenSection] = useState<string | null>(null);

  // Resume draft prompt
  const [draftPrompt, setDraftPrompt] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  // Debounce timer
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ─── Load unit info ────────────────────────────────────────────────────
  useEffect(() => {
    if (!unitId) return;
    setUnitLoading(true);
    apiFetch<any>(`/api/units/${unitId}`)
      .then((data) => {
        const u = data.unit || data;
        setUnit(u);
        if (u.rvType) setUnitType(u.rvType);
      })
      .catch(() => setUnit(null))
      .finally(() => setUnitLoading(false));
  }, [unitId]);

  // ─── Check for saved draft on mount ────────────────────────────────────
  useEffect(() => {
    if (!unitId) return;
    const key = `pdi-draft-${unitId}`;
    const raw = localStorage.getItem(key);
    if (raw) {
      try {
        const draft = JSON.parse(raw);
        if (draft.inspectionId && draft.sections?.length > 0) {
          setDraftPrompt(true);
        }
      } catch {
        // ignore corrupt draft
      }
    }
  }, [unitId]);

  // ─── Resume draft ──────────────────────────────────────────────────────
  const resumeDraft = () => {
    const key = `pdi-draft-${unitId}`;
    const raw = localStorage.getItem(key);
    if (!raw) { setDraftPrompt(false); return; }
    try {
      const draft = JSON.parse(raw);
      setInspectionId(draft.inspectionId);
      setSections(draft.sections);
      setGeneralNotes(draft.generalNotes || '');
      setStep(2);
    } catch {
      localStorage.removeItem(key);
    }
    setDraftPrompt(false);
  };

  const discardDraft = () => {
    if (unitId) localStorage.removeItem(`pdi-draft-${unitId}`);
    setDraftPrompt(false);
  };

  // ─── Save draft to localStorage ────────────────────────────────────────
  const saveDraft = useCallback((id: string, secs: PDISection[], notes: string) => {
    if (!unitId) return;
    localStorage.setItem(`pdi-draft-${unitId}`, JSON.stringify({
      inspectionId: id,
      sections: secs,
      generalNotes: notes,
    }));
  }, [unitId]);

  // ─── Debounced API save ────────────────────────────────────────────────
  const debouncedSave = useCallback((id: string, secs: PDISection[]) => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(async () => {
      const allItems = secs.flatMap((s) => s.items);
      const toUpdate = allItems.filter((item) => item.status !== 'pending');
      if (toUpdate.length === 0) return;
      try {
        setSavingItems(true);
        await apiFetch(`/api/pdi/${id}/items`, {
          method: 'POST',
          body: JSON.stringify({
            items: toUpdate.map((item) => ({
              id: item.id,
              status: item.status,
              note: item.note || '',
              photoUrl: item.photoUrl || '',
            })),
          }),
        });
      } catch {
        // silent fail on auto-save
      } finally {
        setSavingItems(false);
      }
    }, 2000);
  }, []);

  // ─── Start inspection ──────────────────────────────────────────────────
  const handleStart = async () => {
    if (!unitId || !unit?.dealershipId) {
      showToast('Unit or dealership info missing.');
      return;
    }
    setCreating(true);
    try {
      const data = await apiFetch<any>('/api/pdi', {
        method: 'POST',
        body: JSON.stringify({
          unitId,
          unitType,
          dealershipId: unit.dealershipId,
        }),
      });
      const id = data.inspection.id;
      const secs: PDISection[] = data.sections || [];
      setInspectionId(id);
      setSections(secs);
      if (secs.length > 0) setOpenSection(secs[0].name);
      saveDraft(id, secs, '');
      setStep(2);
    } catch (err: any) {
      showToast(err?.message || 'Failed to start inspection.');
    } finally {
      setCreating(false);
    }
  };

  // ─── Update item status ────────────────────────────────────────────────
  const updateItem = (itemId: string, field: Partial<PDIItem>) => {
    setSections((prev) => {
      const next = prev.map((sec) => ({
        ...sec,
        items: sec.items.map((item) =>
          item.id === itemId ? { ...item, ...field } : item
        ),
      }));
      if (inspectionId) {
        saveDraft(inspectionId, next, generalNotes);
        debouncedSave(inspectionId, next);
      }
      return next;
    });
  };

  // ─── Photo upload for item ─────────────────────────────────────────────
  const handleItemPhoto = async (itemId: string, file: File) => {
    if (!inspectionId || !unitId) return;
    try {
      const presign = await apiFetch<any>('/api/uploads/presign', {
        method: 'POST',
        body: JSON.stringify({
          scope: 'units', scopeId: unitId,
          filename: file.name,
          contentType: file.type || 'image/jpeg',
          photoType: 'pdi',
        }),
      });
      await fetch(presign.uploadUrl, {
        method: 'PUT', body: file,
        headers: { 'Content-Type': file.type || 'image/jpeg' },
      });
      await apiFetch(`/api/uploads/confirm/${presign.photoId}`, { method: 'POST' });
      const url: string = presign.publicUrl;

      // Update item in DB
      await apiFetch(`/api/pdi/${inspectionId}/items/${itemId}/photo`, {
        method: 'POST',
        body: JSON.stringify({ photoUrl: url }),
      });

      updateItem(itemId, { photoUrl: url });
    } catch {
      showToast('Photo upload failed.');
    }
  };

  // ─── Computed stats ────────────────────────────────────────────────────
  const allItems = sections.flatMap((s) => s.items);
  const total = allItems.length;
  const evaluated = allItems.filter((i) => i.status !== 'pending');
  const passed = allItems.filter((i) => i.status === 'pass' || i.status === 'na');
  const failed = allItems.filter((i) => i.status === 'fail');
  const naItems = allItems.filter((i) => i.status === 'na');
  const passedOnly = allItems.filter((i) => i.status === 'pass');
  const passRate = evaluated.length > 0 ? Math.round((passed.length / evaluated.length) * 100) : 0;
  const failedWithoutNote = failed.filter((i) => !i.note?.trim());
  const canProceedToSummary = failedWithoutNote.length === 0;

  // ─── Save general notes ────────────────────────────────────────────────
  const handleNotesChange = (val: string) => {
    setGeneralNotes(val);
    if (inspectionId) saveDraft(inspectionId, sections, val);
  };

  // ─── Tech signature complete ───────────────────────────────────────────
  const handleTechSigned = async (sig: SignatureData) => {
    if (!inspectionId) return;
    try {
      // Save notes first
      await apiFetch(`/api/pdi/${inspectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({ notes: generalNotes }),
      });
      // Post signature
      await apiFetch('/api/signatures', {
        method: 'POST',
        body: JSON.stringify({
          parentType: 'pdi',
          parentId: inspectionId,
          signerName: sig.signerName,
          signerRole: sig.signerRole,
          signatureImage: sig.signatureImageUrl,
          userAgent: sig.userAgent,
        }),
      });
      // Update inspection status
      await apiFetch(`/api/pdi/${inspectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'tech_signed',
          techSignedAt: sig.timestamp,
          technicianName: sig.signerName,
          overallPassRate: passRate,
          failedItemCount: failed.length,
        }),
      });
      setStep(5);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save tech signature.');
    }
  };

  // ─── Customer signature complete ───────────────────────────────────────
  const handleCustomerSigned = async (sig: SignatureData) => {
    if (!inspectionId) return;
    try {
      await apiFetch('/api/signatures', {
        method: 'POST',
        body: JSON.stringify({
          parentType: 'pdi',
          parentId: inspectionId,
          signerName: sig.signerName,
          signerRole: sig.signerRole,
          signatureImage: sig.signatureImageUrl,
          userAgent: sig.userAgent,
        }),
      });
      await apiFetch(`/api/pdi/${inspectionId}`, {
        method: 'PATCH',
        body: JSON.stringify({
          status: 'completed',
          customerSignedAt: sig.timestamp,
        }),
      });
      // Clear draft
      if (unitId) localStorage.removeItem(`pdi-draft-${unitId}`);
      setStep(5 as Step);
      // Show success by setting step to a special "done" state
      setStep(99 as unknown as Step);
    } catch (err: any) {
      showToast(err?.message || 'Failed to save customer signature.');
    }
  };

  // ─── Navigation back to unit ───────────────────────────────────────────
  const goBack = () => {
    const segs = location.split('/').filter(Boolean);
    const idx = segs.indexOf('units');
    if (idx >= 0) navigate('/' + segs.slice(0, idx + 2).join('/'));
    else navigate(-1 as any);
  };

  const goToPDIDetail = () => {
    if (!inspectionId) return;
    const segs = location.split('/').filter(Boolean);
    const idx = segs.indexOf('units');
    if (idx >= 0) {
      const base = '/' + segs.slice(0, idx).join('/');
      navigate(`${base}/pdi/${inspectionId}`);
    }
  };

  // ─── STEP 1: Unit Info ─────────────────────────────────────────────────
  if (step === 1) {
    return (
      <div className="page active">
        <Toast msg={toastMsg} visible={toastVisible} />

        {/* Draft resume prompt */}
        {draftPrompt && (
          <div style={{
            position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 10000,
          }}>
            <div style={{
              background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)',
              borderRadius: 12, padding: 24, maxWidth: 380, width: '90%', textAlign: 'center',
              boxShadow: '0 8px 32px rgba(0,0,0,0.2)',
            }}>
              <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 8 }}>
                {t('pdi.resumeDraft')}
              </div>
              <div style={{ fontSize: 13, color: '#666', marginBottom: 20 }}>
                A draft inspection was found for this unit. Would you like to continue where you left off?
              </div>
              <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
                <button
                  className="btn btn-p"
                  onClick={resumeDraft}
                  style={{ minWidth: 120, minHeight: 48, fontSize: 14 }}
                >
                  {t('pdi.resumeYes')}
                </button>
                <button
                  className="btn btn-o"
                  onClick={discardDraft}
                  style={{ minWidth: 120, minHeight: 48, fontSize: 14 }}
                >
                  {t('pdi.resumeNo')}
                </button>
              </div>
            </div>
          </div>
        )}

        <div className="detail-header">
          <button className="detail-back" onClick={goBack}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="detail-info">
            <div className="detail-title">{t('pdi.preDelivery')}</div>
            <div className="detail-meta">{t('pdi.unitInfo')}</div>
          </div>
          <span className="bg submitted" style={{ fontSize: 12, padding: '4px 12px' }}>Step 1 of 5</span>
        </div>

        {/* Step indicator */}
        <StepBar current={1} />

        <div className="pn" style={{ maxWidth: 640, margin: '24px auto' }}>
          {unitLoading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#888' }}>{t('common.loading')}</div>
          ) : !unit ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>Unit not found.</div>
          ) : (
            <>
              {/* Unit summary card */}
              <div style={{
                padding: '16px 20px', background: 'var(--bg-secondary, #f9fafb)',
                border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, marginBottom: 24,
              }}>
                <div style={{ fontSize: 12, color: '#888', marginBottom: 4, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Unit Being Inspected</div>
                <div style={{ fontSize: 16, fontWeight: 700, fontFamily: 'monospace' }}>{unit.vin}</div>
                <div style={{ fontSize: 13, color: '#555', marginTop: 4 }}>
                  {[unit.year, unit.manufacturer, unit.model].filter(Boolean).join(' ')}
                </div>
              </div>

              {/* Unit type selector */}
              <div className="form-group" style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
                  {t('pdi.unitType')}
                </label>
                <select
                  value={unitType}
                  onChange={(e) => setUnitType(e.target.value)}
                  style={{
                    width: '100%', padding: '10px 12px',
                    border: '1px solid var(--border, #e0e0e0)', borderRadius: 8,
                    fontSize: 13, fontFamily: 'inherit',
                    minHeight: 48,
                  }}
                >
                  <option value="travel_trailer">Travel Trailer</option>
                  <option value="fifth_wheel">Fifth Wheel</option>
                  <option value="class_a">Class A Motorhome</option>
                  <option value="class_c">Class C Motorhome</option>
                  <option value="toy_hauler">Toy Hauler</option>
                  <option value="pop_up">Pop-Up Camper</option>
                  <option value="van_camper">Van Camper</option>
                  <option value="truck_camper">Truck Camper</option>
                </select>
              </div>

              <button
                className="btn btn-p"
                onClick={handleStart}
                disabled={creating}
                style={{ width: '100%', minHeight: 52, fontSize: 15, fontWeight: 600 }}
              >
                {creating ? t('common.loading') : t('pdi.startInspection')}
              </button>
            </>
          )}
        </div>
      </div>
    );
  }

  // ─── SUCCESS SCREEN ────────────────────────────────────────────────────
  if ((step as number) === 99) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '60vh' }}>
        <Toast msg={toastMsg} visible={toastVisible} />
        <div style={{ textAlign: 'center', maxWidth: 480, padding: 24 }}>
          <div style={{
            width: 80, height: 80, borderRadius: '50%', background: '#22c55e',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            margin: '0 auto 20px',
          }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <div style={{ fontSize: 24, fontWeight: 700, marginBottom: 8 }}>PDI Complete!</div>
          <div style={{ fontSize: 14, color: '#666', marginBottom: 24 }}>
            {t('pdi.filedToUnit')}
          </div>
          <div style={{ display: 'flex', gap: 12, justifyContent: 'center', flexWrap: 'wrap' }}>
            <button className="btn btn-p" onClick={goToPDIDetail} style={{ minHeight: 48, minWidth: 140, fontSize: 14 }}>
              {t('pdi.viewPDI')}
            </button>
            <button className="btn btn-o" onClick={goBack} style={{ minHeight: 48, minWidth: 140, fontSize: 14 }}>
              {t('pdi.backToUnit')}
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 2: Checklist ─────────────────────────────────────────────────
  if (step === 2) {
    return (
      <div className="page active">
        <Toast msg={toastMsg} visible={toastVisible} />

        <div className="detail-header">
          <button className="detail-back" onClick={() => setStep(1)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="detail-info">
            <div className="detail-title">{t('pdi.preDelivery')}</div>
            <div className="detail-meta">
              {unit ? [unit.year, unit.manufacturer, unit.model].filter(Boolean).join(' ') : '—'} · VIN: {unit?.vin || '—'}
            </div>
          </div>
          {savingItems && (
            <span style={{ fontSize: 11, color: '#22c55e', display: 'flex', alignItems: 'center', gap: 4 }}>
              <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 6L9 17l-5-5" />
              </svg>
              Saving…
            </span>
          )}
          <span className="bg in-progress" style={{ fontSize: 12, padding: '4px 12px' }}>Step 2 of 5</span>
        </div>

        <StepBar current={2} />

        {/* Progress bar */}
        <div style={{ padding: '12px 20px', borderBottom: '1px solid var(--border, #f0f0f0)' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 6 }}>
            <span style={{ fontWeight: 500 }}>
              {evaluated.length} {t('pdi.of')} {total} {t('pdi.itemsInspected')}
            </span>
            <span style={{ color: passRate >= 90 ? '#22c55e' : passRate >= 70 ? '#f59e0b' : '#ef4444', fontWeight: 600 }}>
              {passRate}%
            </span>
          </div>
          <div style={{ height: 8, background: 'var(--border, #e5e7eb)', borderRadius: 4, overflow: 'hidden' }}>
            <div style={{
              height: '100%', borderRadius: 4, transition: 'width 0.3s ease',
              width: `${total > 0 ? (evaluated.length / total) * 100 : 0}%`,
              background: passRate >= 90 ? '#22c55e' : passRate >= 70 ? '#f59e0b' : '#ef4444',
            }} />
          </div>
        </div>

        {/* Sections accordion */}
        <div style={{ padding: '12px 20px' }}>
          {sections.map((sec) => {
            const secEvaluated = sec.items.filter((i) => i.status !== 'pending').length;
            const isOpen = openSection === sec.name;
            const allChecked = secEvaluated === sec.items.length;

            return (
              <div key={sec.name} style={{
                border: '1px solid var(--border, #e5e7eb)', borderRadius: 10,
                marginBottom: 10, overflow: 'hidden',
              }}>
                {/* Section header */}
                <button
                  onClick={() => setOpenSection(isOpen ? null : sec.name)}
                  style={{
                    width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                    padding: '14px 16px', background: 'transparent', border: 'none',
                    cursor: 'pointer', minHeight: 56, fontFamily: 'inherit',
                  }}
                >
                  <span style={{ fontSize: 14, fontWeight: 600, textAlign: 'left' }}>
                    {sectionLabel(sec.name)}
                  </span>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                    <span style={{
                      background: allChecked ? '#dcfce7' : 'var(--bg-secondary, #f3f4f6)',
                      color: allChecked ? '#166534' : '#666',
                      fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 500,
                    }}>
                      {secEvaluated}/{sec.items.length}
                    </span>
                    {allChecked && (
                      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5">
                        <polyline points="20 6 9 17 4 12" />
                      </svg>
                    )}
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
                      style={{ transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }}>
                      <polyline points="6 9 12 15 18 9" />
                    </svg>
                  </div>
                </button>

                {/* Items */}
                {isOpen && (
                  <div style={{ borderTop: '1px solid var(--border, #e5e7eb)' }}>
                    {sec.items.map((item) => (
                      <ChecklistItemRow
                        key={item.id}
                        item={item}
                        onStatusChange={(status) => updateItem(item.id, { status })}
                        onNoteChange={(note) => updateItem(item.id, { note })}
                        onPhotoCapture={(file) => handleItemPhoto(item.id, file)}
                        t={t}
                      />
                    ))}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Sticky footer */}
        <div style={{
          position: 'sticky', bottom: 0, background: 'var(--bg-card, #fff)',
          borderTop: '1px solid var(--border, #e5e7eb)',
          padding: '12px 20px', display: 'flex', justifyContent: 'flex-end', gap: 12,
        }}>
          {!canProceedToSummary && (
            <span style={{ fontSize: 12, color: '#dc2626', alignSelf: 'center' }}>
              {t('pdi.noteRequired')}
            </span>
          )}
          <button
            className="btn btn-p"
            onClick={() => setStep(3)}
            disabled={!canProceedToSummary || evaluated.length === 0}
            style={{ minHeight: 48, minWidth: 180, fontSize: 14, fontWeight: 600 }}
          >
            Next: {t('pdi.summary')} →
          </button>
        </div>
      </div>
    );
  }

  // ─── STEP 3: Summary ───────────────────────────────────────────────────
  if (step === 3) {
    const passColor = passRate >= 90 ? '#22c55e' : passRate >= 70 ? '#f59e0b' : '#ef4444';
    return (
      <div className="page active">
        <Toast msg={toastMsg} visible={toastVisible} />

        <div className="detail-header">
          <button className="detail-back" onClick={() => setStep(2)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="detail-info">
            <div className="detail-title">{t('pdi.summary')}</div>
            <div className="detail-meta">{unit ? `${unit.vin}` : '—'}</div>
          </div>
          <span className="bg in-progress" style={{ fontSize: 12, padding: '4px 12px' }}>Step 3 of 5</span>
        </div>

        <StepBar current={3} />

        <div style={{ padding: '20px' }}>
          {/* Pass rate card */}
          <div style={{
            textAlign: 'center', padding: '24px 20px',
            background: 'var(--bg-secondary, #f9fafb)',
            border: '1px solid var(--border, #e5e7eb)',
            borderRadius: 12, marginBottom: 20,
          }}>
            <div style={{ fontSize: 56, fontWeight: 800, color: passColor, lineHeight: 1 }}>
              {passRate}%
            </div>
            <div style={{ fontSize: 14, color: '#666', marginTop: 4 }}>{t('pdi.passRate')}</div>
            <div style={{ display: 'flex', gap: 24, justifyContent: 'center', marginTop: 16, flexWrap: 'wrap' }}>
              <Stat label={t('pdi.passedItems')} value={passedOnly.length} color="#22c55e" />
              <Stat label={t('pdi.failedItems')} value={failed.length} color="#ef4444" />
              <Stat label={t('pdi.naItems')} value={naItems.length} color="#9ca3af" />
            </div>
          </div>

          {/* Failed items list */}
          {failed.length > 0 && (
            <div style={{ marginBottom: 20 }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#dc2626', marginBottom: 10 }}>
                {t('pdi.failedItems')} ({failed.length})
              </div>
              {failed.map((item) => (
                <div key={item.id} style={{
                  padding: '10px 14px', border: '1px solid #fee2e2',
                  background: '#fef2f2', borderRadius: 8, marginBottom: 6,
                }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: '#991b1b' }}>{item.itemName}</div>
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{sectionLabel(item.section)}</div>
                  {item.note && (
                    <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>{item.note}</div>
                  )}
                  {item.photoUrl && (
                    <img src={item.photoUrl} alt="defect" style={{
                      width: 60, height: 60, objectFit: 'cover', borderRadius: 6,
                      marginTop: 8, border: '1px solid #fca5a5',
                    }} />
                  )}
                </div>
              ))}
            </div>
          )}

          {/* General notes */}
          <div style={{ marginBottom: 20 }}>
            <label style={{ display: 'block', fontSize: 13, fontWeight: 500, marginBottom: 6 }}>
              {t('pdi.generalNotes')}
            </label>
            <textarea
              value={generalNotes}
              onChange={(e) => handleNotesChange(e.target.value)}
              rows={3}
              placeholder="Additional observations..."
              style={{
                width: '100%', padding: '10px 12px',
                border: '1px solid var(--border, #e0e0e0)', borderRadius: 8,
                fontSize: 13, fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box',
              }}
            />
          </div>

          {!canProceedToSummary && (
            <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#dc2626' }}>
              {t('pdi.noteRequired')}
            </div>
          )}

          <div style={{ display: 'flex', gap: 12, justifyContent: 'space-between' }}>
            <button className="btn btn-o" onClick={() => setStep(2)} style={{ minHeight: 48, flex: 1, fontSize: 14 }}>
              ← {t('pdi.backToChecklist')}
            </button>
            <button
              className="btn btn-p"
              onClick={() => setStep(4)}
              disabled={!canProceedToSummary}
              style={{ minHeight: 48, flex: 1, fontSize: 14, fontWeight: 600 }}
            >
              {t('pdi.proceedToSignOff')} →
            </button>
          </div>
        </div>
      </div>
    );
  }

  // ─── STEP 4: Tech Sign-Off ─────────────────────────────────────────────
  if (step === 4) {
    return (
      <div className="page active">
        <Toast msg={toastMsg} visible={toastVisible} />

        <div className="detail-header">
          <button className="detail-back" onClick={() => setStep(3)}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polyline points="15 18 9 12 15 6" />
            </svg>
          </button>
          <div className="detail-info">
            <div className="detail-title">{t('pdi.techSignOff')}</div>
            <div className="detail-meta">{unit?.vin || '—'}</div>
          </div>
          <span className="bg assigned" style={{ fontSize: 12, padding: '4px 12px' }}>Step 4 of 5</span>
        </div>

        <StepBar current={4} />

        <div style={{ padding: '20px', maxWidth: 640, margin: '0 auto' }}>
          <div style={{ fontSize: 13, color: '#666', marginBottom: 20, lineHeight: 1.6 }}>
            Review the inspection summary above, then sign below to certify this inspection.
          </div>

          <SignatureCapture
            signerRole="technician"
            defaultSignerName={user ? `${user.firstName} ${user.lastName}`.trim() : ''}
            legalText="I confirm that I have completed this pre-delivery inspection thoroughly and accurately. All items have been inspected and findings are documented above."
            onSignatureComplete={handleTechSigned}
            required={true}
          />
        </div>
      </div>
    );
  }

  // ─── STEP 5: Customer Sign-Off ─────────────────────────────────────────
  if (step === 5) {
    return (
      <div className="page active">
        <Toast msg={toastMsg} visible={toastVisible} />

        <div className="detail-header">
          <div className="detail-info">
            <div className="detail-title">{t('pdi.customerSignOff')}</div>
            <div className="detail-meta">{unit?.vin || '—'}</div>
          </div>
          <span className="bg in-progress" style={{ fontSize: 12, padding: '4px 12px' }}>Step 5 of 5</span>
        </div>

        <StepBar current={5} />

        <div style={{ padding: '20px', maxWidth: 640, margin: '0 auto' }}>
          {/* Instruction card */}
          <div style={{
            padding: '14px 16px', background: '#eff6ff', border: '1px solid #bfdbfe',
            borderRadius: 10, marginBottom: 20,
          }}>
            <div style={{ fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 4 }}>
              Hand the Device to the Customer
            </div>
            <div style={{ fontSize: 12, color: '#1d4ed8', lineHeight: 1.5 }}>
              They will review the inspection and sign below to acknowledge the condition of their unit.
            </div>
          </div>

          {/* Failed items summary for customer */}
          {failed.length > 0 && (
            <details style={{ marginBottom: 20 }}>
              <summary style={{ fontSize: 13, fontWeight: 600, cursor: 'pointer', color: '#dc2626', padding: '8px 0' }}>
                {t('pdi.failedItemsCustomer')} ({failed.length})
              </summary>
              <div style={{ marginTop: 8 }}>
                {failed.map((item) => (
                  <div key={item.id} style={{
                    padding: '8px 12px', background: '#fef2f2', border: '1px solid #fee2e2',
                    borderRadius: 8, marginBottom: 6, fontSize: 13,
                  }}>
                    <strong>{item.itemName}</strong>
                    {item.note && <div style={{ color: '#666', fontSize: 12, marginTop: 2 }}>{item.note}</div>}
                  </div>
                ))}
              </div>
            </details>
          )}

          <SignatureCapture
            signerRole="customer"
            defaultSignerName=""
            legalText="I acknowledge that I have reviewed this pre-delivery inspection and accept the condition of my unit as documented. I understand that any pre-existing conditions noted above are excluded from future warranty claims."
            onSignatureComplete={handleCustomerSigned}
            required={true}
          />
        </div>
      </div>
    );
  }

  return null;
}

// ─── Sub-components ────────────────────────────────────────────────────────

function StepBar({ current }: { current: number }) {
  const steps = [
    'Unit Info',
    'Checklist',
    'Summary',
    'Tech Sign',
    'Customer Sign',
  ];
  return (
    <div style={{
      display: 'flex', padding: '10px 20px',
      borderBottom: '1px solid var(--border, #f0f0f0)',
      gap: 0,
    }}>
      {steps.map((label, i) => {
        const n = i + 1;
        const done = n < current;
        const active = n === current;
        return (
          <div key={n} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
            <div style={{
              width: 28, height: 28, borderRadius: '50%', fontSize: 12, fontWeight: 700,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: done ? '#22c55e' : active ? '#033280' : 'var(--border, #e5e7eb)',
              color: done || active ? '#fff' : '#999',
              transition: 'all 0.2s',
            }}>
              {done ? (
                <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3">
                  <polyline points="20 6 9 17 4 12" />
                </svg>
              ) : n}
            </div>
            <div style={{ fontSize: 9, color: active ? '#033280' : done ? '#22c55e' : '#999', textAlign: 'center', lineHeight: 1.2, fontWeight: active ? 600 : 400 }}>
              {label}
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface ChecklistItemRowProps {
  item: {
    id: string;
    itemName: string;
    status: ItemStatus;
    note: string | null;
    photoUrl: string | null;
  };
  onStatusChange: (status: ItemStatus) => void;
  onNoteChange: (note: string) => void;
  onPhotoCapture: (file: File) => void;
  t: (key: string) => string;
}

function ChecklistItemRow({ item, onStatusChange, onNoteChange, onPhotoCapture, t }: ChecklistItemRowProps) {
  const photoInputRef = useRef<HTMLInputElement>(null);

  const btnBase: React.CSSProperties = {
    minWidth: 60, minHeight: 44, fontSize: 12, fontWeight: 600,
    border: '1.5px solid', borderRadius: 7, cursor: 'pointer',
    fontFamily: 'inherit', transition: 'all 0.15s',
  };

  return (
    <div style={{ padding: '12px 16px', borderBottom: '1px solid var(--border, #f0f0f0)' }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, minHeight: 48 }}>
        <span style={{ flex: 1, fontSize: 13, fontWeight: 500, color: 'var(--text, #1e293b)' }}>
          {item.itemName}
        </span>

        {/* Status buttons */}
        <button
          onClick={() => onStatusChange('pass')}
          style={{
            ...btnBase,
            background: item.status === 'pass' ? '#22c55e' : 'transparent',
            borderColor: item.status === 'pass' ? '#22c55e' : '#d1d5db',
            color: item.status === 'pass' ? '#fff' : '#6b7280',
          }}
        >
          {t('pdi.pass')}
        </button>
        <button
          onClick={() => onStatusChange('fail')}
          style={{
            ...btnBase,
            background: item.status === 'fail' ? '#ef4444' : 'transparent',
            borderColor: item.status === 'fail' ? '#ef4444' : '#d1d5db',
            color: item.status === 'fail' ? '#fff' : '#6b7280',
          }}
        >
          {t('pdi.fail')}
        </button>
        <button
          onClick={() => onStatusChange('na')}
          style={{
            ...btnBase,
            background: item.status === 'na' ? '#9ca3af' : 'transparent',
            borderColor: item.status === 'na' ? '#9ca3af' : '#d1d5db',
            color: item.status === 'na' ? '#fff' : '#6b7280',
          }}
        >
          {t('pdi.na')}
        </button>

        {/* Camera button */}
        <button
          onClick={() => photoInputRef.current?.click()}
          style={{
            minWidth: 44, minHeight: 44, border: '1.5px solid #d1d5db',
            borderRadius: 7, background: item.photoUrl ? '#f0fdf4' : 'transparent',
            cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center',
            borderColor: item.photoUrl ? '#86efac' : '#d1d5db',
          }}
          title="Take photo"
        >
          {item.photoUrl ? (
            <img src={item.photoUrl} alt="item" style={{ width: 28, height: 28, objectFit: 'cover', borderRadius: 4 }} />
          ) : (
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2">
              <path d="M23 19a2 2 0 01-2 2H3a2 2 0 01-2-2V8a2 2 0 012-2h4l2-3h6l2 3h4a2 2 0 012 2z" />
              <circle cx="12" cy="13" r="4" />
            </svg>
          )}
        </button>

        <input
          ref={photoInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          style={{ display: 'none' }}
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) onPhotoCapture(file);
            e.target.value = '';
          }}
        />
      </div>

      {/* Note for failed items */}
      {item.status === 'fail' && (
        <div style={{ marginTop: 8 }}>
          <textarea
            value={item.note || ''}
            onChange={(e) => onNoteChange(e.target.value)}
            placeholder={t('pdi.noteDescribe')}
            rows={2}
            style={{
              width: '100%', padding: '8px 10px',
              border: `1.5px solid ${!item.note?.trim() ? '#ef4444' : '#d1d5db'}`,
              borderRadius: 7, fontSize: 12, fontFamily: 'inherit',
              resize: 'vertical', boxSizing: 'border-box',
              minHeight: 48,
            }}
          />
          {!item.note?.trim() && (
            <div style={{ fontSize: 11, color: '#dc2626', marginTop: 2 }}>{t('pdi.noteRequired')}</div>
          )}
        </div>
      )}
    </div>
  );
}

function Stat({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div style={{ textAlign: 'center', minWidth: 70 }}>
      <div style={{ fontSize: 24, fontWeight: 700, color }}>{value}</div>
      <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{label}</div>
    </div>
  );
}
