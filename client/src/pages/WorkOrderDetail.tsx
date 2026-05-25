import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { BarcodeDisplay, QRCodeDisplay, generateBarcodeString } from '@/lib/barcode';
import PrintButton from '@/components/PrintButton';
import PrintHeader from '@/components/PrintHeader';

const STATUS_LABELS: Record<string, string> = {
  unassigned: 'Unassigned', assigned: 'Assigned', en_route: 'En Route',
  arrived: 'Arrived', in_progress: 'In Progress', blocked_parts: 'Blocked – Parts',
  paused: 'Paused', completed: 'Completed', invoiced: 'Invoiced', cancelled: 'Cancelled',
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}
function fmtTime(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

// Status transitions allowed per role
const TECH_STATUS_FLOW = [
  { status: 'en_route',    label: 'Mark En Route',    color: '#6366f1' },
  { status: 'arrived',     label: 'Mark Arrived',     color: '#f59e0b' },
  { status: 'in_progress', label: 'Start Work',       color: '#f97316' },
  { status: 'paused',      label: 'Pause Work',       color: '#6b7280' },
  { status: 'blocked_parts', label: 'Blocked – Parts', color: '#ef4444' },
  { status: 'completed',   label: 'Mark Complete',    color: '#22c55e' },
];

const MANAGER_STATUSES = [
  'unassigned', 'assigned', 'en_route', 'arrived',
  'in_progress', 'blocked_parts', 'paused', 'completed', 'invoiced', 'cancelled',
];

export default function WorkOrderDetail() {
  const [location, navigate] = useLocation();
  const params = useParams<{ workOrderId?: string; dealerId?: string }>();
  const { user } = useAuth();

  const workOrderId = params.workOrderId || (() => {
    const segs = location.split('/');
    const woIdx = segs.indexOf('work-orders');
    return woIdx >= 0 ? segs[woIdx + 1] : null;
  })();

  // Derive list path (go up one from current segment)
  const listPath = (() => {
    const parts = location.split('/');
    const idx = parts.indexOf('work-orders');
    return idx >= 0 ? parts.slice(0, idx + 1).join('/') : '/';
  })();

  const role = user?.role || '';
  const isTech = role === 'technician';
  const isOperator = role === 'operator_admin' || role === 'operator_staff';
  const canManage = isOperator || role === 'service_manager' || role === 'shop_manager' || role === 'dealer_owner';

  const [wo, setWo] = useState<any>(null);
  const [labor, setLabor] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [noteText, setNoteText] = useState('');
  const [noteSaving, setNoteSaving] = useState(false);
  const [statusSaving, setStatusSaving] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState('');
  const [timeDesc, setTimeDesc] = useState('');
  const [timeHours, setTimeHours] = useState('');
  const [timeLogging, setTimeLogging] = useState(false);
  const [msg, setMsg] = useState('');

  const loadData = async () => {
    if (!workOrderId) return;
    setLoading(true);
    try {
      const d = await apiFetch<any>(`/api/work-orders/${workOrderId}`);
      setWo(d);
      setLabor(Array.isArray(d.labor) ? d.labor : []);
      setSelectedStatus(d.status || '');
    } catch {
      setMsg('Failed to load work order.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadData(); }, [workOrderId]);

  const showMsg = (m: string) => {
    setMsg(m);
    setTimeout(() => setMsg(''), 3000);
  };

  const handleTechStatusTap = async (status: string) => {
    if (statusSaving) return;
    setStatusSaving(true);
    try {
      const updated = await apiFetch<any>(`/api/work-orders/${workOrderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status }),
      });
      setWo(updated);
      setSelectedStatus(updated.status);
      showMsg(`Status updated to ${STATUS_LABELS[status] || status}.`);
    } catch {
      showMsg('Failed to update status.');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleManagerStatus = async () => {
    if (!selectedStatus || selectedStatus === wo?.status) return;
    setStatusSaving(true);
    try {
      const updated = await apiFetch<any>(`/api/work-orders/${workOrderId}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status: selectedStatus }),
      });
      setWo(updated);
      showMsg('Status updated.');
    } catch {
      showMsg('Failed to update status.');
    } finally {
      setStatusSaving(false);
    }
  };

  const handleAddNote = async () => {
    if (!noteText.trim()) return;
    setNoteSaving(true);
    try {
      const updated = await apiFetch<any>(`/api/work-orders/${workOrderId}`, {
        method: 'PATCH',
        body: JSON.stringify(isTech ? { techNotes: (wo?.techNotes ? wo.techNotes + '\n\n' : '') + noteText.trim() } : { notes: (wo?.notes ? wo.notes + '\n\n' : '') + noteText.trim() }),
      });
      setWo(updated);
      setNoteText('');
      showMsg('Note added.');
    } catch {
      showMsg('Failed to add note.');
    } finally {
      setNoteSaving(false);
    }
  };

  const handleLogTime = async () => {
    const hrs = parseFloat(timeHours);
    if (!timeDesc.trim() || !hrs || hrs <= 0) { showMsg('Enter description and valid hours.'); return; }
    setTimeLogging(true);
    try {
      const entry = await apiFetch<any>(`/api/work-orders/${workOrderId}/time`, {
        method: 'POST',
        body: JSON.stringify({ description: timeDesc.trim(), hours: hrs }),
      });
      setLabor(prev => [entry, ...prev]);
      setTimeDesc('');
      setTimeHours('');
      showMsg(`${hrs}h logged.`);
    } catch {
      showMsg('Failed to log time.');
    } finally {
      setTimeLogging(false);
    }
  };

  if (loading) return <div className="page active"><div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Loading...</div></div>;
  if (!wo) return <div className="page active"><div style={{ padding: 48, textAlign: 'center', color: '#888' }}>Work order not found.</div></div>;

  const statusInfo = STATUS_LABELS[wo.status] || wo.status || '—';
  const totalLabor = labor.reduce((sum, l) => sum + parseFloat(l.hours || '0'), 0);

  return (
    <div className="page active">
      {/* Print header — visible only in print output */}
      <PrintHeader
        title="Work Order"
        subtitle={wo.workOrderNumber || wo.id?.slice(0, 8).toUpperCase()}
        barcodeString={wo.id ? generateBarcodeString('workOrder', wo.id) : undefined}
      />

      {msg && (
        <div style={{ padding: '10px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 16, fontSize: 13, color: '#166534' }}>
          {msg}
        </div>
      )}

      {/* Header */}
      <div className="detail-header">
        <button className="detail-back" onClick={() => navigate(listPath)}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6" /></svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">{wo.workOrderNumber || wo.id?.slice(0, 8).toUpperCase()}</div>
          <div className="detail-meta">{wo.notes?.split('\n')[0] || 'Work Order'}</div>
        </div>
        <span style={{ padding: '6px 16px', borderRadius: 20, fontSize: 13, fontWeight: 600, background: '#f0fdf4', color: '#16a34a' }}>
          {statusInfo}
        </span>
        <PrintButton title={`Work Order — ${wo.workOrderNumber || wo.id?.slice(0, 8)}`} />
        {/* Barcode widget */}
        {wo?.id && (
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4, marginLeft: 8, flexShrink: 0 }}>
            <BarcodeDisplay entityType="workOrder" entityId={wo.id} size="sm" />
            <QRCodeDisplay entityType="workOrder" entityId={wo.id} size={56} />
          </div>
        )}
      </div>

      {/* Technician — BIG status buttons */}
      {isTech && (
        <div className="pn" style={{ marginBottom: 16 }}>
          <div className="pn-h"><span className="pn-t">Update Status</span></div>
          <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 10 }}>
            {TECH_STATUS_FLOW.map(btn => (
              <button
                key={btn.status}
                onClick={() => handleTechStatusTap(btn.status)}
                disabled={statusSaving || wo.status === btn.status}
                style={{
                  padding: '18px 8px', borderRadius: 10, border: 'none', cursor: statusSaving || wo.status === btn.status ? 'default' : 'pointer',
                  background: wo.status === btn.status ? '#f0fdf4' : btn.color, color: wo.status === btn.status ? '#16a34a' : '#fff',
                  fontWeight: 700, fontSize: 13, fontFamily: 'inherit', opacity: statusSaving ? 0.6 : 1,
                  boxShadow: wo.status === btn.status ? 'inset 0 0 0 2px #16a34a' : '0 2px 4px rgba(0,0,0,0.12)',
                  transition: 'all 0.15s',
                }}
              >
                {wo.status === btn.status ? '✓ ' : ''}{btn.label}
              </button>
            ))}
          </div>
        </div>
      )}

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20 }}>
        <div>
          {/* Work Details */}
          <div className="pn" style={{ marginBottom: 16 }}>
            <div className="pn-h"><span className="pn-t">Work Details</span></div>
            <div className="cd-row"><span className="cd-label">WO #</span><span className="cd-value">{wo.workOrderNumber}</span></div>
            <div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">{wo.unitId?.slice(0, 8).toUpperCase() || '—'}</span></div>
            <div className="cd-row"><span className="cd-label">Related Claim</span><span className="cd-value">{wo.claimId ? <span className="cid">{wo.claimId.slice(0, 8).toUpperCase()}</span> : '—'}</span></div>
            <div className="cd-row"><span className="cd-label">Scheduled</span><span className="cd-value">{fmtDate(wo.scheduledFor)}</span></div>
            <div className="cd-row"><span className="cd-label">Started</span><span className="cd-value">{fmtTime(wo.startedAt)}</span></div>
            <div className="cd-row"><span className="cd-label">Completed</span><span className="cd-value">{fmtTime(wo.completedAt)}</span></div>
            <div className="cd-row"><span className="cd-label">Est. Hours</span><span className="cd-value">{wo.laborEstimateHours || '—'}</span></div>
            <div className="cd-row"><span className="cd-label">Actual Hours</span><span className="cd-value">{wo.laborActualHours || totalLabor.toFixed(2) || '—'}</span></div>
          </div>

          {/* Notes */}
          <div className="pn" style={{ marginBottom: 16 }}>
            <div className="pn-h"><span className="pn-t">{isTech ? 'Tech Notes' : 'Notes'}</span></div>
            {(isTech ? wo.techNotes : wo.notes) ? (
              <div style={{ padding: '12px 20px', fontSize: 13, color: '#555', lineHeight: 1.7, whiteSpace: 'pre-wrap', borderBottom: '1px solid #f0f0f0' }}>
                {isTech ? wo.techNotes : wo.notes}
              </div>
            ) : null}
            <div style={{ padding: '12px 20px' }}>
              <textarea
                value={noteText}
                onChange={e => setNoteText(e.target.value)}
                placeholder="Add a note..."
                style={{ width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 60, resize: 'vertical', outline: 'none' }}
              />
              <div style={{ textAlign: 'right', marginTop: 8 }}>
                <button className="btn btn-p btn-sm" onClick={handleAddNote} disabled={noteSaving || !noteText.trim()}>
                  {noteSaving ? 'Saving...' : 'Add Note'}
                </button>
              </div>
            </div>
          </div>

          {/* Time Entries */}
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Time Entries</span><span style={{ fontSize: 12, color: '#888' }}>{totalLabor.toFixed(2)}h logged</span></div>
            <div style={{ padding: '12px 20px', display: 'grid', gridTemplateColumns: '2fr 1fr auto', gap: 8, alignItems: 'end', borderBottom: '1px solid #f0f0f0' }}>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Description</div>
                <input
                  value={timeDesc}
                  onChange={e => setTimeDesc(e.target.value)}
                  placeholder="What was done..."
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                />
              </div>
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4 }}>Hours</div>
                <input
                  value={timeHours}
                  onChange={e => setTimeHours(e.target.value)}
                  placeholder="1.5"
                  type="number"
                  step="0.25"
                  min="0.25"
                  style={{ width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit' }}
                />
              </div>
              <button className="btn btn-p btn-sm" onClick={handleLogTime} disabled={timeLogging}>
                {timeLogging ? '...' : 'Log'}
              </button>
            </div>
            {labor.length === 0 && (
              <div style={{ padding: '20px', textAlign: 'center', color: '#9ca3af', fontSize: 12 }}>No time entries yet.</div>
            )}
            {labor.map(l => (
              <div key={l.id} style={{ padding: '10px 20px', borderBottom: '1px solid #f8f8f8', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ fontSize: 13 }}>{l.description}</div>
                <span style={{ fontSize: 12, fontWeight: 600, color: '#2563eb', flexShrink: 0, marginLeft: 12 }}>{parseFloat(l.hours).toFixed(2)}h</span>
              </div>
            ))}
          </div>
        </div>

        {/* Sidebar */}
        <div>
          <div className="cd-section">
            <div className="cd-section-h">Work Order Info</div>
            <div className="cd-row"><span className="cd-label">Created</span><span className="cd-value">{fmtDate(wo.createdAt)}</span></div>
            <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value">{statusInfo}</span></div>
            <div className="cd-row"><span className="cd-label">Technician</span><span className="cd-value">{wo.assignedTechId ? wo.assignedTechId.slice(0, 8).toUpperCase() : <span style={{ color: '#9ca3af' }}>Unassigned</span>}</span></div>
          </div>

          {/* Manager status update */}
          {canManage && (
            <div className="cd-section" style={{ marginTop: 12 }}>
              <div className="cd-section-h">Update Status</div>
              <div style={{ padding: '12px 16px', display: 'flex', flexDirection: 'column', gap: 8 }}>
                <select
                  value={selectedStatus}
                  onChange={e => setSelectedStatus(e.target.value)}
                  style={{ padding: '8px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}
                >
                  {MANAGER_STATUSES.map(s => (
                    <option key={s} value={s}>{STATUS_LABELS[s] || s}</option>
                  ))}
                </select>
                <button
                  className="btn btn-p btn-sm"
                  onClick={handleManagerStatus}
                  disabled={statusSaving || selectedStatus === wo.status}
                >
                  {statusSaving ? 'Saving...' : 'Update Status'}
                </button>
              </div>
            </div>
          )}

          {/* Parts Needed */}
          {wo.partsNeeded?.length > 0 && (
            <div className="cd-section" style={{ marginTop: 12 }}>
              <div className="cd-section-h">Parts Needed</div>
              <div style={{ padding: '8px 16px' }}>
                {wo.partsNeeded.map((p: string, i: number) => (
                  <div key={i} style={{ fontSize: 12, padding: '4px 0', borderBottom: '1px solid #f0f0f0', color: '#555' }}>
                    <span className="wo-checkbox print-only" />
                    {p}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Signature section — visible only in print */}
      <div className="print-only" style={{ marginTop: 32, display: 'flex', gap: 64 }}>
        <div>
          <div style={{ fontSize: '10pt', fontWeight: 600, marginBottom: 4 }}>Technician Signature</div>
          <span className="signature-line" />
          <div style={{ fontSize: '9pt', color: '#555', marginTop: 6 }}>Name / Date</div>
        </div>
        <div>
          <div style={{ fontSize: '10pt', fontWeight: 600, marginBottom: 4 }}>Customer Signature</div>
          <span className="signature-line" />
          <div style={{ fontSize: '9pt', color: '#555', marginTop: 6 }}>Name / Date</div>
        </div>
      </div>
    </div>
  );
}
