import { useState, useEffect, useCallback } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import AiCccPanel from '@/components/AiCccPanel';
import { useAuth } from '@/hooks/use-auth';

interface IssueGroup {
  id: string;
  label: string;
  frcCode: string;
  frcDescription: string;
  description: string;
  photoIds: string[];
  color: string;
}

const GROUP_COLORS = ['#ef4444', '#3b82f6', '#22c55e', '#a855f7', '#f59e0b', '#06b6d4'];

// Common FRC codes fallback by manufacturer
const FRC_FALLBACK: Record<string, Array<{ code: string; description: string; hours: number }>> = {
  Jayco: [
    { code: 'JC-WAR-1042', description: 'Delamination, Sidewall', hours: 2.5 },
    { code: 'JC-WAR-2018', description: 'Water Leak, Roof Vent', hours: 1.5 },
    { code: 'JC-WAR-3055', description: 'Slide-Out Seal, Replace', hours: 1.0 },
    { code: 'JC-WAR-4012', description: 'Cabinet Door, Hinge', hours: 0.5 },
    { code: 'JC-WAR-5001', description: 'Furnace, No Ignition', hours: 2.0 },
  ],
  'Forest River': [
    { code: 'FR-WAR-1001', description: 'Roof Seam, Re-seal', hours: 2.0 },
    { code: 'FR-WAR-2005', description: 'Shower Drain Leak', hours: 1.0 },
    { code: 'FR-WAR-3012', description: 'Awning, Retract Failure', hours: 1.5 },
    { code: 'FR-WAR-4008', description: 'Slide-Out Motor Replace', hours: 3.0 },
  ],
  Heartland: [
    { code: 'HL-WAR-1010', description: 'Floor Delamination', hours: 3.0 },
    { code: 'HL-WAR-2002', description: 'City Water Inlet Leak', hours: 0.5 },
    { code: 'HL-WAR-3001', description: 'Slide-Out Topper Tear', hours: 1.0 },
  ],
  Keystone: [
    { code: 'KS-WAR-1005', description: 'Sidewall Puncture Repair', hours: 2.0 },
    { code: 'KS-WAR-2010', description: 'Toilet Valve Replace', hours: 0.5 },
    { code: 'KS-WAR-3008', description: 'Entry Door Latch', hours: 0.5 },
  ],
};

export default function BatchReview() {
  const [location, navigate] = useLocation();
  const params = useParams<{ batchId: string }>();
  const { user } = useAuth();
  const isOperator = user?.role === 'operator_admin' || user?.role === 'operator_staff';

  // Extract batchId from either params or URL path
  const batchId = params.batchId || (() => {
    const segments = location.split('/');
    const queueIdx = segments.indexOf('queue');
    return queueIdx >= 0 ? segments[queueIdx + 1] : null;
  })();

  const [batch, setBatch] = useState<any | null>(null);
  const [batchPhotos, setBatchPhotos] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);
  const [frcCodes, setFrcCodes] = useState<Array<{ code: string; description: string; hours: number }>>([]);
  const [issueGroups, setIssueGroups] = useState<IssueGroup[]>([]);
  const [creatingClaim, setCreatingClaim] = useState(false);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const loadBatch = useCallback(async () => {
    if (!batchId) return;
    setIsLoading(true);
    setDataError(null);
    try {
      const d = await apiFetch<any>(`/api/batches/${batchId}`);
      setBatch(d.batch || null);
      setBatchPhotos(d.photos || []);

      // Load FRC codes for manufacturer
      const mfr = d.batch?.manufacturer || 'Jayco';
      const frcData = await apiFetch<any>(`/api/frc-codes?manufacturer=${encodeURIComponent(mfr)}`).catch(() => null);
      if (frcData?.frcCodes?.length > 0) {
        setFrcCodes(frcData.frcCodes.map((c: any) => ({ code: c.code, description: c.description, hours: c.laborHours || 1.0 })));
      } else {
        // Fallback to built-in codes
        setFrcCodes(FRC_FALLBACK[mfr] || FRC_FALLBACK['Jayco']);
      }

      // Initialize with one empty issue group
      setIssueGroups([{
        id: crypto.randomUUID(),
        label: 'Issue 1',
        frcCode: '',
        frcDescription: '',
        description: '',
        photoIds: [],
        color: GROUP_COLORS[0],
      }]);
    } catch (err: any) {
      setDataError(err?.message || 'Failed to load batch');
    } finally {
      setIsLoading(false);
    }
  }, [batchId]);

  useEffect(() => {
    loadBatch();
  }, [loadBatch]);

  const addIssueGroup = () => {
    const idx = issueGroups.length;
    setIssueGroups(prev => [...prev, {
      id: crypto.randomUUID(),
      label: `Issue ${idx + 1}`,
      frcCode: '',
      frcDescription: '',
      description: '',
      photoIds: [],
      color: GROUP_COLORS[idx % GROUP_COLORS.length],
    }]);
  };

  const removeIssueGroup = (id: string) => {
    setIssueGroups(prev => prev.filter(g => g.id !== id));
  };

  const updateGroup = (id: string, field: keyof IssueGroup, value: string) => {
    setIssueGroups(prev => prev.map(g => {
      if (g.id !== id) return g;
      if (field === 'frcCode') {
        // Auto-fill description from selected code
        const selected = frcCodes.find(c => c.code === value);
        return { ...g, frcCode: value, frcDescription: selected?.description || g.frcDescription };
      }
      return { ...g, [field]: value };
    }));
  };

  const handleCreateClaim = async () => {
    if (!batch) return;
    const validGroups = issueGroups.filter(g => g.frcCode && g.description);
    if (validGroups.length === 0) {
      showToast('Add at least one issue group with FRC code and description before creating the claim.');
      return;
    }

    setCreatingClaim(true);
    try {
      // Process batch → creates claim and links it
      const res = await apiFetch<any>(`/api/batches/${batchId}/process`, {
        method: 'PUT',
        body: JSON.stringify({
          createClaim: true,
          manufacturer: batch.manufacturer || 'Unknown',
          status: 'processed',
          frcLines: validGroups.map(g => ({
            frcCode: g.frcCode,
            description: g.description,
          })),
        }),
      });

      if (res.success && res.claimId) {
        showToast('Claim created from batch!');
        // Navigate to claim detail — go up to operator/admin/claims/:claimId
        const segments = location.split('/');
        const queueIdx = segments.indexOf('queue');
        if (queueIdx >= 0) {
          const base = segments.slice(0, queueIdx).join('/');
          setTimeout(() => navigate(`${base}/claims/${res.claimId}`), 800);
        } else {
          setTimeout(() => navigate('../claims/' + res.claimId), 800);
        }
      } else {
        showToast('Failed to create claim. Please try again.');
      }
    } catch (err: any) {
      showToast(err?.message || 'Failed to create claim from batch.');
    } finally {
      setCreatingClaim(false);
    }
  };

  // Navigate back to queue
  const handleBack = () => {
    const segments = location.split('/');
    const queueIdx = segments.indexOf('queue');
    if (queueIdx >= 0) {
      navigate(segments.slice(0, queueIdx + 1).join('/'));
    } else {
      navigate(-1 as any);
    }
  };

  // Total estimated hours from groups
  const totalHours = issueGroups.reduce((sum, g) => {
    const code = frcCodes.find(c => c.code === g.frcCode);
    return sum + (code?.hours || 0);
  }, 0);
  const estValue = totalHours * 140; // $140/hr estimate

  if (isLoading) {
    return (
      <div className="page active" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: 200 }}>
        <div style={{ fontSize: 14, color: '#888' }}>Loading batch...</div>
      </div>
    );
  }

  if (dataError || !batch) {
    return (
      <div className="page active">
        <div style={{ padding: 32, textAlign: 'center', color: '#dc2626' }}>
          {dataError || 'Batch not found.'}
          <div style={{ marginTop: 12 }}>
            <button className="btn btn-o btn-sm" onClick={handleBack}>← Back to Queue</button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}

      <div className="detail-header">
        <button className="detail-back" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">{batch.batchNumber} — Photo Review</div>
          <div className="detail-meta">
            {batch.claimType?.toUpperCase()} · {batchPhotos.length} photos · Batch ID: {batchId?.slice(0, 8)}
          </div>
        </div>
        <button
          className="btn btn-s btn-sm"
          onClick={handleCreateClaim}
          disabled={creatingClaim}
        >
          {creatingClaim ? 'Creating...' : 'Create Claim from Groups'}
        </button>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20 }}>
        {/* Left: photos */}
        <div>
          {batch.dealerNotes && (
            <div className="pn" style={{ marginBottom: 16 }}>
              <div style={{ padding: '16px 20px', display: 'flex', gap: 12 }}>
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{ flexShrink: 0, marginTop: 2 }}>
                  <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
                </svg>
                <div>
                  <div style={{ fontSize: 12, fontWeight: 600, marginBottom: 4 }}>Dealer's Note</div>
                  <div style={{ fontSize: 13, color: '#555', lineHeight: '1.5' }}>{batch.dealerNotes}</div>
                </div>
              </div>
            </div>
          )}

          <div className="pn">
            <div className="pn-h">
              <span className="pn-t">All Photos ({batchPhotos.length})</span>
              <span style={{ fontSize: 12, color: '#888' }}>Click to assign to group</span>
            </div>
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 6 }}>
              {batchPhotos.length === 0 ? (
                <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: 24, color: '#888', fontSize: 13 }}>
                  No photos attached to this batch.
                </div>
              ) : batchPhotos.map((photo: any, i: number) => (
                <div
                  key={photo.id}
                  style={{ aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, overflow: 'hidden', cursor: 'pointer', position: 'relative' }}
                  title={photo.filename || `Photo ${i + 1}`}
                >
                  <img
                    src={photo.url || photo.publicUrl}
                    alt={`Photo ${i + 1}`}
                    style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                    onError={e => {
                      (e.target as HTMLImageElement).style.display = 'none';
                      (e.target as HTMLImageElement).parentElement!.style.background = '#e8e8e8';
                    }}
                  />
                  <span style={{ position: 'absolute', bottom: 2, right: 3, background: 'rgba(0,0,0,0.5)', color: 'white', fontSize: 8, padding: '1px 3px', borderRadius: 2 }}>
                    {String(i + 1).padStart(3, '0')}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* AI Claim Drafting — operator only */}
          {isOperator && (
            <AiCccPanel
              claimId={batch?.claimId || null}
              photos={batchPhotos.map((p: any) => ({
                url: p.url || p.publicUrl || '',
                id: p.id,
                category: p.photoType || p.category,
              }))}
              unitInfo={batch?.unit ? {
                vin: batch.unit.vin,
                year: batch.unit.year,
                manufacturer: batch.manufacturer || batch.unit.manufacturer,
                model: batch.unit.model,
              } : {
                manufacturer: batch?.manufacturer,
              }}
              onFrcLineCreated={() => loadBatch()}
            />
          )}
        </div>

        {/* Right: issue groups */}
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 12 }}>Issue Groups → FRC Lines</div>

          {issueGroups.map((group, idx) => (
            <div
              key={group.id}
              style={{ background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 12, borderLeft: `3px solid ${group.color}`, padding: '14px 16px' }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                <span style={{ background: group.color, color: 'white', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4 }}>
                  {idx + 1}
                </span>
                <span style={{ fontSize: 13, fontWeight: 600, flex: 1 }}>
                  {group.frcDescription || group.description || `Issue ${idx + 1}`}
                </span>
                <button
                  onClick={() => removeIssueGroup(group.id)}
                  style={{ background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18, lineHeight: 1 }}
                  title="Remove group"
                >
                  ×
                </button>
              </div>

              <select
                value={group.frcCode}
                onChange={e => updateGroup(group.id, 'frcCode', e.target.value)}
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', marginBottom: 6 }}
              >
                <option value="">Select FRC code...</option>
                {frcCodes.map(c => (
                  <option key={c.code} value={c.code}>
                    {c.code} — {c.description} ({c.hours} hrs)
                  </option>
                ))}
              </select>

              <textarea
                value={group.description}
                onChange={e => updateGroup(group.id, 'description', e.target.value)}
                placeholder="Describe this specific issue..."
                style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', minHeight: 36, resize: 'vertical' }}
              />
            </div>
          ))}

          <button
            style={{ width: '100%', padding: 12, border: '2px dashed #d0d0d0', borderRadius: 8, background: 'none', color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16 }}
            onClick={addIssueGroup}
          >
            + Add Issue Group
          </button>

          {/* Summary */}
          <div style={{ background: 'var(--brand)', borderRadius: 8, padding: 16, color: 'white' }}>
            <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 8 }}>Claim Summary</div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: '0.7', marginBottom: 4 }}>
              <span>FRC Lines</span>
              <span>{issueGroups.filter(g => g.frcCode).length}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: '0.7', marginBottom: 4 }}>
              <span>Total Hours</span>
              <span>{totalHours.toFixed(1)}</span>
            </div>
            <div style={{ borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600 }}>
              <span>Est. Value</span>
              <span>${estValue.toLocaleString()}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
