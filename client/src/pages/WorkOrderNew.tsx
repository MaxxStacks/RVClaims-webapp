import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

export default function WorkOrderNew() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();

  // Derive list path — go up to work-orders segment
  const listPath = (() => {
    const parts = location.split('/');
    const idx = parts.indexOf('work-orders');
    return idx >= 0 ? parts.slice(0, idx + 1).join('/') : '/';
  })();

  const [units, setUnits] = useState<any[]>([]);
  const [claims, setClaims] = useState<any[]>([]);
  const [techs, setTechs] = useState<any[]>([]);
  const [saving, setSaving] = useState(false);
  const [msg, setMsg] = useState('');

  // Pre-fill claimId from query string (e.g., navigated from ClaimDetail)
  const prefillClaimId = (() => {
    if (typeof window === 'undefined') return '';
    return new URLSearchParams(window.location.search).get('claimId') || '';
  })();

  const [form, setForm] = useState({
    unitId: '', claimId: prefillClaimId, assignedTechId: '',
    notes: '', scheduledFor: '', laborEstimateHours: '',
  });

  const did = user?.dealershipId;

  useEffect(() => {
    if (!did) return;
    const qd = `?dealershipId=${did}&limit=100`;
    Promise.all([
      apiFetch<any[]>(`/api/units${qd}`).catch(() => []),
      apiFetch<any[]>(`/api/claims${qd}`).catch(() => []),
      apiFetch<any[]>(`/api/work-orders/technicians?dealershipId=${did}`).catch(() => []),
    ]).then(([u, c, t]) => {
      setUnits(Array.isArray(u) ? u : (u as any)?.units || []);
      setClaims(Array.isArray(c) ? c : (c as any)?.claims || []);
      setTechs(Array.isArray(t) ? t : []);
    });
  }, [did]);

  const set = (k: string, v: string) => setForm(f => ({ ...f, [k]: v }));

  const handleCreate = async () => {
    if (!form.unitId) { setMsg('Select a unit.'); return; }
    setSaving(true);
    setMsg('');
    try {
      const payload: Record<string, any> = {
        dealershipId: did,
        unitId: form.unitId,
        notes: form.notes.trim() || null,
        assignedTechId: form.assignedTechId || null,
        claimId: form.claimId || null,
        laborEstimateHours: form.laborEstimateHours ? parseFloat(form.laborEstimateHours) : null,
        scheduledFor: form.scheduledFor || null,
      };
      await apiFetch('/api/work-orders', {
        method: 'POST',
        body: JSON.stringify(payload),
      });
      navigate(listPath);
    } catch (err: any) {
      setMsg(err?.message || 'Failed to create work order.');
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate(listPath)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">New Work Order</div>
          <div className="detail-meta">Create a work order for your service department</div>
        </div>
      </div>

      {msg && (
        <div style={{ padding: '10px 16px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#92400e' }}>
          {msg}
        </div>
      )}

      <div className="pn">
        <div className="form-grid">
          <div className="form-group">
            <label>Unit <span style={{ color: '#ef4444' }}>*</span></label>
            <select value={form.unitId} onChange={e => set('unitId', e.target.value)}>
              <option value="">Select unit...</option>
              {units.map((u: any) => (
                <option key={u.id} value={u.id}>
                  {u.year ? `${u.year} ` : ''}{u.manufacturer || ''} {u.model || ''} {u.vin ? `(${u.vin})` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Assign Technician</label>
            <select value={form.assignedTechId} onChange={e => set('assignedTechId', e.target.value)}>
              <option value="">Unassigned</option>
              {techs.map((t: any) => (
                <option key={t.id} value={t.id}>
                  {t.userId?.slice(0, 8).toUpperCase() || t.id.slice(0, 8).toUpperCase()}
                  {t.specializations?.length ? ` — ${t.specializations[0]}` : ''}
                </option>
              ))}
            </select>
          </div>

          <div className="form-group">
            <label>Scheduled Date</label>
            <input type="date" value={form.scheduledFor} onChange={e => set('scheduledFor', e.target.value)} />
          </div>

          <div className="form-group">
            <label>Est. Labor Hours</label>
            <input
              type="number"
              step="0.5"
              min="0.5"
              placeholder="2.0"
              value={form.laborEstimateHours}
              onChange={e => set('laborEstimateHours', e.target.value)}
            />
          </div>

          <div className="form-group full">
            <label>Job Description / Notes</label>
            <textarea
              placeholder="Describe the work to be done..."
              value={form.notes}
              onChange={e => set('notes', e.target.value)}
            />
          </div>

          <div className="form-group full">
            <label>Related Claim (optional)</label>
            <select value={form.claimId} onChange={e => set('claimId', e.target.value)}>
              <option value="">None</option>
              {claims.map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.claimNumber || c.id.slice(0, 8).toUpperCase()} — {c.type || c.claimType || 'Claim'}
                </option>
              ))}
            </select>
          </div>
        </div>

        <div className="btn-bar">
          <button className="btn btn-p" onClick={handleCreate} disabled={saving}>
            {saving ? 'Creating...' : 'Create Work Order'}
          </button>
          <button className="btn btn-o" onClick={() => navigate(listPath)}>Cancel</button>
        </div>
      </div>
    </div>
  );
}
