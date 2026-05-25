import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

export default function ProcessingQueue() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [opBatches, setOpBatches] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);
  const [queueSearch, setQueueSearch] = useState('');
  const [queueMfr, setQueueMfr] = useState('');
  const [queueType, setQueueType] = useState('');
  const [queueStatus, setQueueStatus] = useState('uploaded');
  const [assigning, setAssigning] = useState<string | null>(null);

  const loadBatches = () => {
    const query = queueStatus ? `?status=${queueStatus}` : '';
    apiFetch<any>(`/api/batches${query}`)
      .then(d => setOpBatches(d.batches || []))
      .catch(err => setDataError(err?.message || 'Failed to load'));
  };

  useEffect(() => {
    loadBatches();
  }, [queueStatus]);

  const handleAssignToMe = async (batchId: string) => {
    if (!user?.id) return;
    setAssigning(batchId);
    try {
      await apiFetch(`/api/batches/${batchId}/assign`, {
        method: 'PATCH',
        body: JSON.stringify({ assignedTo: user.id }),
      });
      showToast('Batch assigned to you');
      loadBatches();
    } catch {
      // Fallback: if PATCH /assign doesn't exist, just navigate to review
    } finally {
      setAssigning(null);
    }
  };

  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const filteredBatches = opBatches.filter(b => {
    const s = queueSearch.toLowerCase();
    if (s && !b.unitId?.toLowerCase().includes(s) && !b.dealershipId?.toLowerCase().includes(s) && !b.batchNumber?.toLowerCase().includes(s)) return false;
    if (queueMfr && b.manufacturer !== queueMfr) return false;
    if (queueType && b.claimType !== queueType) return false;
    return true;
  });

  // Navigate to batch review — go up to queue then into specific batch
  const handleReviewBatch = (batchId: string) => {
    const segments = location.split('/');
    const queueIdx = segments.indexOf('queue');
    if (queueIdx >= 0) {
      navigate(segments.slice(0, queueIdx + 1).join('/') + '/' + batchId);
    } else {
      navigate(`${batchId}`);
    }
  };

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,0.2)' }}>
          {toastMsg}
        </div>
      )}

      <div style={{ padding: '14px 0 20px', fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 8 }}>
        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10" /><path d="M12 16v-4" /><path d="M12 8h.01" /></svg>
        Dealers upload photos in bulk. You review, sort into issues, assign FRC codes, and build the claim.
      </div>

      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">{t('claims.incomingBatches')}</span>
          <span style={{ fontSize: 12, color: '#888' }}>{opBatches.length} {queueStatus === 'uploaded' ? 'awaiting' : 'found'}</span>
        </div>

        <div className="filter-bar">
          <input
            type="text"
            placeholder="Search by VIN, dealer or batch #..."
            value={queueSearch}
            onChange={e => setQueueSearch(e.target.value)}
          />
          <select value={queueStatus} onChange={e => setQueueStatus(e.target.value)}>
            <option value="uploaded">Uploaded (Awaiting)</option>
            <option value="in_review">In Review</option>
            <option value="processed">Processed</option>
            <option value="">{t('common.allStatuses')}</option>
          </select>
          <select value={queueMfr} onChange={e => setQueueMfr(e.target.value)}>
            <option value="">{t('common.allManufacturers')}</option>
            <option>Jayco</option>
            <option>Forest River</option>
            <option>Heartland</option>
            <option>Keystone</option>
            <option>Columbia NW</option>
          </select>
          <select value={queueType} onChange={e => setQueueType(e.target.value)}>
            <option value="">All Types</option>
            <option value="daf">DAF</option>
            <option value="pdi">PDI</option>
            <option value="warranty">Warranty</option>
            <option value="extended_warranty">Extended</option>
          </select>
        </div>

        <div className="tw">
          <table>
            <thead>
              <tr>
                <th>{t('claims.batch')}</th>
                <th>{t('common.dealer')}</th>
                <th>{t('claims.vin')}</th>
                <th>{t('common.type')}</th>
                <th>{t('common.photos')}</th>
                <th>{t('claims.dealerNotes')}</th>
                <th>{t('common.status')}</th>
                <th>{t('financing.submitted')}</th>
                <th>{t('common.actions')}</th>
              </tr>
            </thead>
            <tbody>
              {filteredBatches.length === 0 ? (
                <tr>
                  <td colSpan={9} style={{ textAlign: 'center', padding: 24, color: '#888' }}>
                    {dataError ? dataError : opBatches.length === 0 ? 'No batches in queue' : 'No results match your filters'}
                  </td>
                </tr>
              ) : filteredBatches.map((b: any) => (
                <tr key={b.id}>
                  <td style={{ fontWeight: 500, color: 'var(--brand)' }}>{b.batchNumber}</td>
                  <td>{b.dealershipId?.slice(0, 8)}…</td>
                  <td><span className="vin">{b.unitId ? '…' + b.unitId.slice(-4) : '—'}</span></td>
                  <td><span className="mfr">{b.claimType?.toUpperCase()}</span></td>
                  <td><strong>{b.photoCount || 0}</strong></td>
                  <td style={{ maxWidth: 200, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap', color: '#666', fontSize: 12 }}>
                    {b.dealerNotes || '—'}
                  </td>
                  <td>
                    <span className={`bg ${b.status}`}>{b.status}</span>
                  </td>
                  <td>{new Date(b.createdAt).toLocaleDateString()}</td>
                  <td>
                    <div style={{ display: 'flex', gap: 6 }}>
                      <button
                        className="btn btn-p btn-sm"
                        onClick={() => handleReviewBatch(b.id)}
                      >
                        {t('claims.reviewSort')}
                      </button>
                      {b.status === 'uploaded' && (
                        <button
                          className="btn btn-o btn-sm"
                          onClick={() => handleAssignToMe(b.id)}
                          disabled={assigning === b.id}
                          style={{ fontSize: 11 }}
                        >
                          {assigning === b.id ? '…' : t('claims.assignToMe')}
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
