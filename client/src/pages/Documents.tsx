import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const TABS = ['All', 'Invoice', 'Contract', 'Report', 'Correspondence', 'Other'];

const TYPE_COLOR: Record<string, string> = {
  invoice:       '#2563eb',
  contract:      '#7c3aed',
  report:        '#059669',
  correspondence:'#d97706',
  other:         '#6b7280',
};

const FILE_ICON = (mimeType?: string) => {
  const isExcel = mimeType?.includes('spreadsheet') || mimeType?.includes('excel');
  const isWord  = mimeType?.includes('word') || mimeType?.includes('document');
  const isPdf   = mimeType?.includes('pdf');
  const color   = isPdf ? '#dc2626' : isExcel ? '#059669' : isWord ? '#2563eb' : '#6b7280';
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="2">
      <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
      <polyline points="14 2 14 8 20 8"/>
    </svg>
  );
};

function fmtSize(bytes?: number | null) {
  if (!bytes) return '—';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

const DOC_TYPE_LABELS: Record<string, string> = {
  warranty_cert:       'Warranty Certificate',
  ext_warranty:        'Extended Warranty',
  inspection:          'Inspection Report',
  contract:            'Contract',
  invoice:             'Invoice',
  report:              'Report',
  manufacturer_letter: 'Manufacturer Letter',
  other:               'Other',
};

export default function Documents() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

  // ── AI Scanner state ─────────────────────────────────────────────────────────
  const [scanning, setScanning] = useState(false);
  const [scanResult, setScanResult] = useState<any | null>(null);
  const [scanFilename, setScanFilename] = useState('');
  const [scanBase64, setScanBase64] = useState('');
  const [scanMimeType, setScanMimeType] = useState('');
  const [unitMatches, setUnitMatches] = useState<any[]>([]);
  const [selectedUnitId, setSelectedUnitId] = useState('');
  const [scanFiling, setScanFiling] = useState(false);

  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const load = () => {
    setLoading(true);
    setError('');
    apiFetch<any>('/api/documents')
      .then(d => setDocs(d.documents || []))
      .catch(() => setError('Failed to load documents.'))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleDownload = async (id: string, name: string) => {
    setDownloading(id);
    try {
      const data = await apiFetch<any>(`/api/documents/${id}/download`);
      if (data.url) {
        window.open(data.url, '_blank');
      } else {
        showToast('Download URL unavailable.');
      }
    } catch {
      showToast('Failed to download document.');
    } finally {
      setDownloading(null);
    }
  };

  // ── AI Scan handler ──────────────────────────────────────────────────────────
  const handleScanFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    e.target.value = '';
    setScanning(true);
    setScanResult(null);
    setUnitMatches([]);
    setSelectedUnitId('');

    const reader = new FileReader();
    reader.onload = async (ev) => {
      const dataUrl = ev.target?.result as string;
      const base64 = dataUrl.split(',')[1];
      setScanFilename(file.name);
      setScanBase64(base64);
      setScanMimeType(file.type || 'application/octet-stream');

      try {
        const result = await apiFetch<any>('/api/ai/scan-document', {
          method: 'POST',
          body: JSON.stringify({
            fileBase64: base64,
            mimeType: file.type || 'application/octet-stream',
            filename: file.name,
          }),
        });

        setScanResult(result.extracted || null);

        if (result.filing?.autoFiled && result.filing.unitId) {
          showToast(`Auto-filed to unit (VIN: ${result.extracted?.vin})`);
          setScanResult(null);
          load();
        } else if (result.extracted?.vin) {
          try {
            const units = await apiFetch<any>(`/api/v6/units?vin=${result.extracted.vin}&limit=5`);
            setUnitMatches(Array.isArray(units.units) ? units.units : []);
          } catch {
            setUnitMatches([]);
          }
        }
      } catch (err: any) {
        showToast(err?.message || 'Scan failed — check file format');
        setScanResult(null);
      } finally {
        setScanning(false);
      }
    };
    reader.readAsDataURL(file);
  };

  const handleFileDocument = async () => {
    if (!selectedUnitId || !scanFilename) return;
    setScanFiling(true);
    try {
      await apiFetch(`/api/v6/units/${selectedUnitId}/documents`, {
        method: 'POST',
        body: JSON.stringify({
          name: scanFilename,
          url: '',
          type: scanResult?.documentType || 'other',
          sizeBytes: null,
          mimeType: scanMimeType,
        }),
      });
      showToast('Document filed to unit');
      setScanResult(null);
      setScanFilename('');
      setScanBase64('');
      setUnitMatches([]);
      setSelectedUnitId('');
      load();
    } catch (err: any) {
      showToast(err?.message || 'Failed to file document');
    } finally {
      setScanFiling(false);
    }
  };

  const dismissScan = () => {
    setScanResult(null);
    setScanFilename('');
    setScanBase64('');
    setUnitMatches([]);
    setSelectedUnitId('');
  };

  const tabFilter = TABS[activeTab];
  const displayed = tabFilter === 'All'
    ? docs
    : docs.filter(d => d.type?.toLowerCase() === tabFilter.toLowerCase());

  return (
    <div className="page active">
      {/* Tab bar + Scan button */}
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap', alignItems: 'center' }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setActiveTab(i)}
            className={`tab${i === activeTab ? ' active' : ''}`}
          >
            {t}
          </button>
        ))}
        <div style={{ flex: 1 }} />
        <label
          className="btn btn-p btn-sm"
          style={{ cursor: scanning ? 'wait' : 'pointer', display: 'inline-flex', alignItems: 'center', gap: 6 }}
        >
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <rect x="3" y="3" width="18" height="18" rx="2"/>
            <path d="M8 7h8M8 12h8M8 17h5"/>
          </svg>
          {scanning ? 'Scanning…' : 'Scan Document'}
          <input
            type="file"
            accept="image/*,.pdf,.doc,.docx"
            style={{ display: 'none' }}
            disabled={scanning}
            onChange={handleScanFile}
          />
        </label>
      </div>

      {/* AI Scan results panel */}
      {scanResult && (
        <div className="pn" style={{ marginBottom: 16, borderLeft: '3px solid #2563eb' }}>
          <div className="pn-h" style={{ borderBottom: '1px solid #f0f0f0', paddingBottom: 12, marginBottom: 16 }}>
            <span className="pn-t" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
                <circle cx="12" cy="12" r="10"/><path d="M12 8v4M12 16h.01"/>
              </svg>
              AI Scan Results — {scanFilename}
            </span>
            <span className="pn-a" onClick={dismissScan}>Dismiss</span>
          </div>

          <div style={{ padding: '0 20px 16px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Document Type</div>
              <div style={{ fontSize: 13, fontWeight: 600 }}>
                {DOC_TYPE_LABELS[scanResult.documentType] || scanResult.documentType || '—'}
                <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 11, color: scanResult.confidence > 0.7 ? '#059669' : '#d97706' }}>
                  {Math.round((scanResult.confidence || 0) * 100)}% confidence
                </span>
              </div>
            </div>

            {scanResult.vin && (
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>VIN Detected</div>
                <div style={{ fontSize: 13, fontWeight: 600, fontFamily: 'monospace' }}>
                  {scanResult.vin}
                  <span style={{ marginLeft: 8, fontWeight: 400, fontSize: 11, color: '#2563eb' }}>
                    {Math.round((scanResult.vinConfidence || 0) * 100)}% conf.
                  </span>
                </div>
              </div>
            )}

            {scanResult.issueDate && (
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Issue Date</div>
                <div style={{ fontSize: 13 }}>{scanResult.issueDate}</div>
              </div>
            )}
            {scanResult.expiryDate && (
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Expiry Date</div>
                <div style={{ fontSize: 13 }}>{scanResult.expiryDate}</div>
              </div>
            )}
            {scanResult.provider && (
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Provider</div>
                <div style={{ fontSize: 13 }}>{scanResult.provider}</div>
              </div>
            )}
            {scanResult.totalAmount && (
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Total Amount</div>
                <div style={{ fontSize: 13, fontWeight: 600 }}>{scanResult.currency ? `${scanResult.currency} ` : ''}{scanResult.totalAmount}</div>
              </div>
            )}
            {scanResult.approvalStatus && (
              <div>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Approval Status</div>
                <span className={`bg ${scanResult.approvalStatus === 'approved' ? 'ok' : scanResult.approvalStatus === 'denied' ? 'denied' : 'ow'}`} style={{ fontSize: 11 }}>
                  {scanResult.approvalStatus}
                </span>
              </div>
            )}
            {scanResult.summary && (
              <div style={{ gridColumn: '1 / -1' }}>
                <div style={{ fontSize: 11, color: '#888', marginBottom: 4, fontWeight: 600, textTransform: 'uppercase' as const, letterSpacing: '0.04em' }}>Summary</div>
                <div style={{ fontSize: 12, color: '#444', lineHeight: 1.5 }}>{scanResult.summary}</div>
              </div>
            )}
          </div>

          {/* VIN match: file to unit */}
          {scanResult.vin && (
            <div style={{ padding: '12px 20px', borderTop: '1px solid #f0f0f0', background: '#f8faff', borderRadius: '0 0 8px 8px' }}>
              <div style={{ fontSize: 13, fontWeight: 600, marginBottom: 10 }}>
                File to Unit (VIN: <span style={{ fontFamily: 'monospace' }}>{scanResult.vin}</span>)
              </div>
              {unitMatches.length > 0 ? (
                <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
                  <select
                    value={selectedUnitId}
                    onChange={e => setSelectedUnitId(e.target.value)}
                    style={{ padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', flex: 1, minWidth: 200 }}
                  >
                    <option value="">Select unit to file to…</option>
                    {unitMatches.map((u: any) => (
                      <option key={u.id} value={u.id}>
                        {[u.year, u.manufacturer || u.make, u.model].filter(Boolean).join(' ')} — {u.vin}
                      </option>
                    ))}
                  </select>
                  <button
                    className="btn btn-p btn-sm"
                    onClick={handleFileDocument}
                    disabled={!selectedUnitId || scanFiling}
                  >
                    {scanFiling ? 'Filing…' : 'File to Unit'}
                  </button>
                  <button className="btn btn-o btn-sm" onClick={dismissScan}>Dismiss</button>
                </div>
              ) : (
                <div style={{ fontSize: 12, color: '#888' }}>
                  No matching unit found for this VIN. Add the unit first, then scan again.
                </div>
              )}
            </div>
          )}
        </div>
      )}

      <div className="pn">
        {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading documents…</div>}
        {error && (
          <div style={{ padding: 20, color: '#dc2626', fontSize: 13 }}>
            {error} <button className="btn btn-o btn-sm" onClick={load} style={{ marginLeft: 8 }}>Retry</button>
          </div>
        )}
        {!loading && !error && displayed.length === 0 && (
          <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>
            <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom: 12 }}>
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
              <polyline points="14 2 14 8 20 8"/>
            </svg>
            <div>No {tabFilter === 'All' ? '' : tabFilter.toLowerCase() + ' '}documents found.</div>
          </div>
        )}
        {!loading && !error && displayed.length > 0 && (
          <div className="tw">
            <table>
              <thead>
                <tr><th>Document</th><th>Type</th><th>Date</th><th>Size</th><th></th></tr>
              </thead>
              <tbody>
                {displayed.map((doc: any) => (
                  <tr key={doc.id}>
                    <td>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        {FILE_ICON(doc.mimeType)}
                        <strong style={{ fontSize: 13 }}>{doc.name}</strong>
                      </div>
                    </td>
                    <td>
                      <span style={{
                        padding: '2px 8px', borderRadius: 20, fontSize: 11, fontWeight: 600,
                        background: `${TYPE_COLOR[doc.type?.toLowerCase()] || '#6b7280'}18`,
                        color: TYPE_COLOR[doc.type?.toLowerCase()] || '#6b7280',
                        textTransform: 'capitalize',
                      }}>
                        {doc.type || 'Other'}
                      </span>
                    </td>
                    <td style={{ fontSize: 12, color: '#666' }}>{fmtDate(doc.createdAt)}</td>
                    <td style={{ fontSize: 12, color: '#888' }}>{fmtSize(doc.sizeBytes)}</td>
                    <td>
                      <span
                        className="cid"
                        onClick={() => handleDownload(doc.id, doc.name)}
                        style={{ opacity: downloading === doc.id ? 0.5 : 1 }}
                      >
                        {downloading === doc.id ? 'Opening…' : 'Download'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {toast && (
        <div style={{ position: 'fixed', bottom: 24, left: '50%', transform: 'translateX(-50%)', background: '#1e293b', color: '#fff', padding: '10px 20px', borderRadius: 8, fontSize: 13, zIndex: 9999, boxShadow: '0 4px 12px rgba(0,0,0,.2)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
