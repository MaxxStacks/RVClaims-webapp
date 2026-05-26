// client/src/pages/exclusive/client/DealJacketView.tsx
// Read-only deal jacket view for the customer portal.
// NEVER shows financing terms, dealer cost data, or internal notes.

import { useState, useEffect } from 'react';
import { useLocation, useParams } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

// Document types visible to customers — financing_agreement and custom
// financing details are intentionally excluded
const VISIBLE_DOC_TYPES = new Set([
  'bill_of_sale',
  'fi_acceptance',
  'manufacturer_warranty',
  'extended_warranty',
  'pdi_signoff',
  'customer_consent',
  'insurance',
  'registration',
  'custom',
]);

const DOC_TYPE_LABELS: Record<string, string> = {
  bill_of_sale: 'Bill of Sale',
  fi_acceptance: 'F&I Product Acceptance',
  manufacturer_warranty: 'Manufacturer Warranty',
  extended_warranty: 'Extended Warranty',
  pdi_signoff: 'PDI Sign-Off',
  customer_consent: 'Customer Consent',
  insurance: 'Insurance',
  registration: 'Registration',
  custom: 'Document',
};

export default function DealJacketView() {
  const [location, navigate] = useLocation();
  const params = useParams<{ jacketId?: string }>();
  const { user } = useAuth();
  const { t } = useLanguage();

  // Extract jacketId — from params or URL segments
  const jacketId = params.jacketId || (() => {
    const segs = location.split('/').filter(Boolean);
    const idx = segs.indexOf('jacket');
    return idx >= 0 ? segs[idx + 1] : null;
  })();

  const [jacket, setJacket] = useState<any>(null);
  const [documents, setDocuments] = useState<any[]>([]);
  const [unit, setUnit] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [dataError, setDataError] = useState<string | null>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  useEffect(() => {
    if (!jacketId) {
      setDataError('Jacket ID not found in URL');
      setIsLoading(false);
      return;
    }
    setIsLoading(true);
    apiFetch<any>(`/api/deal-jackets/${jacketId}`)
      .then(d => {
        setJacket(d.jacket || null);
        // Filter documents: only show customer-visible types, never show financing_agreement
        const visibleDocs = (d.documents || []).filter(
          (doc: any) => VISIBLE_DOC_TYPES.has(doc.documentType)
        );
        setDocuments(visibleDocs);
        setUnit(d.unit || null);
        setIsLoading(false);
      })
      .catch(err => {
        setDataError(err?.message || 'Failed to load your deal jacket');
        setIsLoading(false);
      });
  }, [jacketId]);

  const handleBack = () => {
    const segs = location.split('/').filter(Boolean);
    const base = segs.length >= 2 ? `/${segs[0]}/${segs[1]}` : '';
    navigate(`${base}/documents`);
  };

  if (isLoading) {
    return (
      <div className="page active" style={{ padding: 40, textAlign: 'center', color: '#888' }}>
        {t('common.loading')}
      </div>
    );
  }

  if (dataError || !jacket) {
    return (
      <div className="page active" style={{ padding: 40, textAlign: 'center', color: '#e53e3e' }}>
        {dataError || 'Deal jacket not found.'}
      </div>
    );
  }

  const unitLabel = unit
    ? [unit.year, unit.manufacturer, unit.model].filter(Boolean).join(' ')
    : '—';

  const presentDocs = documents.filter(d => d.status === 'present');
  const missingDocs = documents.filter(d => d.status === 'missing' && d.isRequired);
  const completeness = documents.length > 0
    ? Math.round((presentDocs.length / documents.length) * 100)
    : 0;

  return (
    <div className="page active">
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1a1a1a', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)' }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div className="detail-header">
        <button className="detail-back" onClick={handleBack}>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <polyline points="15 18 9 12 15 6" />
          </svg>
        </button>
        <div className="detail-info">
          <div className="detail-title">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: 'middle' }}>
              <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z" />
            </svg>
            {t('dealJacket.dealJacket')}
          </div>
          <div className="detail-meta">
            {unitLabel}
            {unit?.vin ? <span style={{ fontFamily: 'monospace', marginLeft: 8, fontSize: 11, color: '#aaa' }}>{unit.vin}</span> : null}
          </div>
        </div>
        <span className={`bg ${jacket.status === 'complete' ? 'active' : 'pending'}`} style={{ fontSize: 12, padding: '5px 14px' }}>
          {jacket.status === 'complete' ? t('dealJacket.jacketComplete') : t('dealJacket.jacketIncomplete')}
        </span>
      </div>

      {/* Completeness bar */}
      <div className="cd-section" style={{ marginBottom: 20 }}>
        <div className="cd-section-h">{t('dealJacket.completeness')}</div>
        <div style={{ padding: '12px 20px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 8 }}>
            <div style={{ flex: 1, background: '#f0f0f0', borderRadius: 6, height: 8, overflow: 'hidden' }}>
              <div style={{
                width: `${completeness}%`,
                height: '100%',
                background: completeness === 100 ? '#16a34a' : completeness >= 70 ? '#d97706' : '#e53e3e',
                borderRadius: 6,
                transition: 'width 0.3s ease',
              }} />
            </div>
            <span style={{ fontSize: 14, fontWeight: 700, color: completeness === 100 ? '#16a34a' : '#374151', minWidth: 42 }}>
              {completeness}%
            </span>
          </div>
          <div style={{ display: 'flex', gap: 16, fontSize: 12, color: '#888' }}>
            <span>
              <strong style={{ color: '#374151' }}>{presentDocs.length}</strong> {t('dealJacket.requiredDocs')} present
            </span>
            {missingDocs.length > 0 && (
              <span style={{ color: '#d97706', fontWeight: 600 }}>
                {missingDocs.length} {t('dealJacket.missingDocs')}
              </span>
            )}
            {jacket.saleDate && (
              <span>
                {t('dealJacket.saleDate')}: {new Date(jacket.saleDate).toLocaleDateString('en-CA', { month: 'long', day: 'numeric', year: 'numeric' })}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Document list */}
      <div className="cd-section">
        <div className="cd-section-h">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: 6, verticalAlign: 'middle' }}>
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
            <polyline points="14 2 14 8 20 8" />
          </svg>
          {t('dealJacket.documents')}
        </div>

        {documents.length === 0 ? (
          <div style={{ padding: '20px', color: '#9ca3af', fontSize: 13 }}>
            No documents available yet. Your dealer will upload them shortly.
          </div>
        ) : (
          <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
            <thead>
              <tr style={{ background: '#f8f9fb', borderBottom: '1px solid #e8e8e8' }}>
                <th style={{ padding: '10px 20px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 11, textTransform: 'uppercase' as const }}>Document</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 11, textTransform: 'uppercase' as const }}>Status</th>
                <th style={{ padding: '10px 12px', textAlign: 'left', fontWeight: 600, color: '#555', fontSize: 11, textTransform: 'uppercase' as const }}>Date</th>
                <th style={{ padding: '10px 12px', textAlign: 'center', fontWeight: 600, color: '#555', fontSize: 11, textTransform: 'uppercase' as const }}>View</th>
              </tr>
            </thead>
            <tbody>
              {documents.map(doc => {
                const isMissing = doc.status === 'missing' && doc.isRequired;
                const isPending = doc.status === 'pending';
                const rowBg = isMissing ? '#fffbeb' : isPending ? '#eff6ff' : 'transparent';
                return (
                  <tr key={doc.id} style={{ borderBottom: '1px solid #f0f0f0', background: rowBg }}>
                    <td style={{ padding: '10px 20px' }}>
                      <div style={{ fontWeight: 600, color: '#111' }}>
                        {doc.documentName || DOC_TYPE_LABELS[doc.documentType] || doc.documentType}
                      </div>
                      {isMissing && (
                        <div style={{ fontSize: 11, color: '#d97706', marginTop: 2 }}>
                          Required — awaiting upload from your dealer
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '10px 12px' }}>
                      <span style={{
                        fontSize: 11, padding: '2px 8px', borderRadius: 10, fontWeight: 700,
                        background: doc.status === 'present' ? '#dcfce7' : isMissing ? '#fff7ed' : '#eff6ff',
                        color: doc.status === 'present' ? '#16a34a' : isMissing ? '#d97706' : '#1d4ed8',
                      }}>
                        {doc.status === 'present' ? 'Present' : isMissing ? 'Missing' : 'Pending'}
                      </span>
                    </td>
                    <td style={{ padding: '10px 12px', color: '#888', fontSize: 12 }}>
                      {doc.uploadedAt
                        ? new Date(doc.uploadedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })
                        : '—'}
                    </td>
                    <td style={{ padding: '10px 12px', textAlign: 'center' }}>
                      {doc.fileUrl ? (
                        <a
                          href={doc.fileUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ padding: '4px 10px', borderRadius: 6, border: '1px solid #033280', background: 'transparent', color: '#033280', fontSize: 11, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', textDecoration: 'none', display: 'inline-block' }}
                        >
                          {t('common.view')}
                        </a>
                      ) : (
                        <span style={{ color: '#ccc', fontSize: 11 }}>—</span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Unit info (no dealer cost data) */}
      {unit && (
        <div className="cd-section" style={{ marginTop: 20 }}>
          <div className="cd-section-h">Your Unit</div>
          <div className="cd-row"><span className="cd-label">Year</span><span className="cd-value">{unit.year || '—'}</span></div>
          <div className="cd-row"><span className="cd-label">Make</span><span className="cd-value">{unit.manufacturer || '—'}</span></div>
          <div className="cd-row"><span className="cd-label">Model</span><span className="cd-value">{unit.model || '—'}</span></div>
          {unit.vin && (
            <div className="cd-row">
              <span className="cd-label">VIN</span>
              <span className="cd-value" style={{ fontFamily: 'monospace', fontSize: 12 }}>{unit.vin}</span>
            </div>
          )}
        </div>
      )}

      {/* Notice */}
      <div style={{ padding: '12px 0', fontSize: 12, color: '#9ca3af', textAlign: 'center' as const }}>
        Questions about your deal documents? Contact your dealer directly.
      </div>
    </div>
  );
}
