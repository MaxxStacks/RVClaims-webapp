// client/src/pages/exclusive/client/PDIView.tsx
// Read-only PDI record view for the customer portal.
// Customers see the completed PDI checklist for their unit.
// NEVER shows internal operator notes or dealer cost data.

import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';

export default function ClientPDIView() {
  const [location, navigate] = useLocation();
  const params = useParams<{ pdiId?: string }>();
  const { t } = useLanguage();

  const pdiId = params.pdiId || (() => {
    const segs = location.split('/').filter(Boolean);
    const idx = segs.indexOf('pdi');
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  const [pdi, setPdi] = useState<any>(null);
  const [items, setItems] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    if (!pdiId) {
      setDataError('PDI record not found.');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiFetch<any>(`/api/pdi/${pdiId}`)
      .then(d => {
        setPdi(d.pdi || d || null);
        setItems(Array.isArray(d.items) ? d.items : Array.isArray(d.pdi?.items) ? d.pdi.items : []);
        setIsLoading(false);
      })
      .catch(err => {
        setDataError(err?.message || 'Failed to load PDI record');
        setIsLoading(false);
      });
  }, [pdiId]);

  const handleBack = () => {
    const segs = location.split('/').filter(Boolean);
    const base = segs.length >= 2 ? `/${segs[0]}/${segs[1]}` : '';
    navigate(`${base}/my-unit`);
  };

  if (isLoading) {
    return (
      <div className="page active" style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        {t('common.loading')}
      </div>
    );
  }

  if (dataError || !pdi) {
    return (
      <div className="page active" style={{ padding: 40, textAlign: 'center', color: '#e53e3e' }}>
        {dataError || 'PDI record not found.'}
      </div>
    );
  }

  const passedItems = items.filter(i => i.result === 'pass');
  const failedItems = items.filter(i => i.result === 'fail');
  const naItems = items.filter(i => i.result === 'na');

  return (
    <div className="page active">
      {/* Header */}
      <div className="detail-header">
        <button className="detail-back" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">PDI Record</div>
          <div className="detail-meta">
            Pre-Delivery Inspection
            {pdi.completedAt && ` · ${new Date(pdi.completedAt).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}`}
          </div>
        </div>
        <span className={`bg ${pdi.status === 'complete' ? 'active' : 'pending'}`} style={{ fontSize: 12 }}>
          {pdi.status === 'complete' ? 'Complete' : 'In Progress'}
        </span>
      </div>

      {/* Summary stats */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginBottom: 20 }}>
        <div style={{ background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#16a34a' }}>{passedItems.length}</div>
          <div style={{ fontSize: 11, color: '#15803d', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Passed</div>
        </div>
        <div style={{ background: failedItems.length > 0 ? '#fef2f2' : '#f9fafb', border: `1px solid ${failedItems.length > 0 ? '#fecaca' : '#e5e7eb'}`, borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: failedItems.length > 0 ? '#dc2626' : '#9ca3af' }}>{failedItems.length}</div>
          <div style={{ fontSize: 11, color: failedItems.length > 0 ? '#b91c1c' : '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>Failed</div>
        </div>
        <div style={{ background: '#f9fafb', border: '1px solid #e5e7eb', borderRadius: 8, padding: '14px 16px', textAlign: 'center' }}>
          <div style={{ fontSize: 24, fontWeight: 700, color: '#9ca3af' }}>{naItems.length}</div>
          <div style={{ fontSize: 11, color: '#9ca3af', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.05em' }}>N/A</div>
        </div>
      </div>

      {/* PDI info */}
      <div className="cd-section" style={{ marginBottom: 16 }}>
        <div className="cd-section-h">Inspection Details</div>
        {pdi.technicianName && (
          <div className="cd-row"><span className="cd-label">Technician</span><span className="cd-value">{pdi.technicianName}</span></div>
        )}
        {pdi.completedAt && (
          <div className="cd-row">
            <span className="cd-label">Completed</span>
            <span className="cd-value">{new Date(pdi.completedAt).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}</span>
          </div>
        )}
        {pdi.notes && (
          <div className="cd-row" style={{ flexDirection: 'column', gap: 4, alignItems: 'flex-start' }}>
            <span className="cd-label">Notes</span>
            <span className="cd-value" style={{ textAlign: 'left' }}>{pdi.notes}</span>
          </div>
        )}
      </div>

      {/* Checklist items */}
      {items.length > 0 && (
        <div className="cd-section">
          <div className="cd-section-h">Inspection Checklist ({items.length} items)</div>
          {items.map((item: any, idx: number) => (
            <div key={item.id || idx} style={{
              display: 'flex', alignItems: 'center', gap: 12, padding: '10px 20px',
              borderBottom: idx < items.length - 1 ? '1px solid #f5f5f5' : 'none',
            }}>
              {/* Result icon */}
              <div style={{
                width: 24, height: 24, borderRadius: '50%', flexShrink: 0,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                background: item.result === 'pass' ? '#dcfce7' : item.result === 'fail' ? '#fee2e2' : '#f3f4f6',
              }}>
                {item.result === 'pass' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>
                )}
                {item.result === 'fail' && (
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="3"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
                )}
                {item.result === 'na' && (
                  <span style={{ fontSize: 9, fontWeight: 700, color: '#9ca3af' }}>N/A</span>
                )}
              </div>
              <div style={{ flex: 1, minWidth: 0 }}>
                <div style={{ fontSize: 13, fontWeight: 500, color: '#111' }}>{item.itemName || item.description || `Item ${idx + 1}`}</div>
                {item.notes && (
                  <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>{item.notes}</div>
                )}
              </div>
              {item.category && (
                <span style={{ fontSize: 10, color: '#6b7280', background: '#f3f4f6', padding: '2px 8px', borderRadius: 10, whiteSpace: 'nowrap' }}>
                  {item.category}
                </span>
              )}
            </div>
          ))}
        </div>
      )}

      {items.length === 0 && (
        <div className="pn" style={{ padding: 32, textAlign: 'center', color: '#888', fontSize: 13 }}>
          Checklist details are not available yet.
        </div>
      )}

      <div style={{ padding: '16px 0', fontSize: 12, color: '#9ca3af', textAlign: 'center' }}>
        This PDI record was completed by your dealer before delivery. Contact your dealer for questions.
      </div>
    </div>
  );
}
