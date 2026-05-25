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
  const isImage = mimeType?.includes('image');
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

export default function Documents() {
  const { user } = useAuth();
  const [docs, setDocs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState(0);
  const [toast, setToast] = useState('');
  const [downloading, setDownloading] = useState<string | null>(null);

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

  const tabFilter = TABS[activeTab];
  const displayed = tabFilter === 'All'
    ? docs
    : docs.filter(d => d.type?.toLowerCase() === tabFilter.toLowerCase());

  return (
    <div className="page active">
      <div style={{ marginBottom: 16, display: 'flex', gap: 8, flexWrap: 'wrap' }}>
        {TABS.map((t, i) => (
          <button
            key={t}
            onClick={() => setActiveTab(i)}
            className={`tab${i === activeTab ? ' active' : ''}`}
          >
            {t}
          </button>
        ))}
      </div>

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
