import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';

interface KBEntry {
  id: string;
  title: string;
  description: string | null;
  contentType: string;
  manufacturer: string;
  modelFamily: string | null;
  modelNumber: string | null;
  yearStart: number | null;
  yearEnd: number | null;
  fileUrl: string | null;
  videoUrl: string | null;
  articleContent: string | null;
  tags: string[];
  viewCount: number;
}

const CONTENT_TYPES = [
  { value: '', label: 'All' },
  { value: 'owners_manual', label: "Owner's Manuals" },
  { value: 'maintenance_schedule', label: 'Maintenance' },
  { value: 'troubleshooting_guide', label: 'Troubleshooting' },
  { value: 'video', label: 'Videos' },
  { value: 'bulletin', label: 'Bulletins' },
  { value: 'how_to_article', label: 'How-To' },
  { value: 'spec_sheet', label: 'Spec Sheets' },
];

const CONTENT_TYPE_ICONS: Record<string, JSX.Element> = {
  owners_manual: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
  maintenance_schedule: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
  troubleshooting_guide: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#d97706" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M9.09 9a3 3 0 015.83 1c0 2-3 3-3 3"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  how_to_article: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
  video: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
  spec_sheet: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#6b7280" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
  wiring_diagram: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>,
  parts_catalog: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#374151" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>,
  bulletin: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#b45309" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
  recall_notice: <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>,
};

function extractYoutubeId(url: string): string | null {
  const match = url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/))([a-zA-Z0-9_-]{11})/);
  return match ? match[1] : null;
}

function extractVimeoId(url: string): string | null {
  const match = url.match(/vimeo\.com\/(\d+)/);
  return match ? match[1] : null;
}

function ContentViewer({ entry, onClose }: { entry: KBEntry; onClose: () => void }) {
  const youtubeId = entry.videoUrl ? extractYoutubeId(entry.videoUrl) : null;
  const vimeoId = entry.videoUrl ? extractVimeoId(entry.videoUrl) : null;

  return (
    <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) onClose(); }}>
      <div style={{ background: 'var(--surface,#fff)', borderRadius: 12, width: '100%', maxWidth: 900, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 12 }}>
          <div>
            <div style={{ fontSize: 15, fontWeight: 700 }}>{entry.title}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 3 }}>
              {entry.manufacturer}
              {entry.modelFamily && ` · ${entry.modelFamily}`}
              {entry.yearStart && ` · ${entry.yearStart}–${entry.yearEnd ?? 'present'}`}
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 22, lineHeight: 1, flexShrink: 0 }}>×</button>
        </div>
        <div style={{ padding: 20 }}>
          {entry.fileUrl && (
            <div>
              <object data={entry.fileUrl} type="application/pdf" width="100%" style={{ height: 600, borderRadius: 6, border: '1px solid #e5e7eb' }}>
                <p style={{ fontSize: 13, color: '#6b7280', padding: 20 }}>PDF preview unavailable in this browser.</p>
              </object>
              <div style={{ marginTop: 10 }}>
                <a href={entry.fileUrl} target="_blank" rel="noreferrer" className="btn btn-o btn-sm">{'↓'} Download PDF</a>
              </div>
            </div>
          )}
          {youtubeId && (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 6 }}>
              <iframe
                src={`https://www.youtube.com/embed/${youtubeId}`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                allowFullScreen
                title={entry.title}
              />
            </div>
          )}
          {vimeoId && !youtubeId && (
            <div style={{ position: 'relative', paddingBottom: '56.25%', height: 0, overflow: 'hidden', borderRadius: 6 }}>
              <iframe
                src={`https://player.vimeo.com/video/${vimeoId}`}
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', border: 'none' }}
                allow="autoplay; fullscreen"
                allowFullScreen
                title={entry.title}
              />
            </div>
          )}
          {entry.videoUrl && !youtubeId && !vimeoId && (
            <div>
              <a href={entry.videoUrl} target="_blank" rel="noreferrer" className="btn btn-o btn-sm">Open Video</a>
            </div>
          )}
          {entry.articleContent && (
            <div style={{ fontSize: 14, lineHeight: 1.7, color: 'var(--text,#1f2937)' }}>
              {entry.articleContent.split('\n').map((para, i) => (
                <p key={i} style={{ marginBottom: 10 }}>{para}</p>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default function KnowledgeBaseBrowse() {
  const { t } = useLanguage();

  const [manufacturers, setManufacturers] = useState<{ manufacturer: string; count: number }[]>([]);
  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [loading, setLoading] = useState(false);
  const [mfrLoading, setMfrLoading] = useState(true);

  const [search, setSearch] = useState('');
  const [activeType, setActiveType] = useState('');
  const [activeMfr, setActiveMfr] = useState('');
  const [viewing, setViewing] = useState<KBEntry | null>(null);
  const [searched, setSearched] = useState(false);

  useEffect(() => {
    apiFetch<any>('/api/knowledge-base/manufacturers')
      .then(d => setManufacturers(Array.isArray(d) ? d : []))
      .catch(() => {})
      .finally(() => setMfrLoading(false));
  }, []);

  const doSearch = async (mfr?: string, type?: string, q?: string) => {
    const m = mfr !== undefined ? mfr : activeMfr;
    const ct = type !== undefined ? type : activeType;
    const sq = q !== undefined ? q : search;

    setLoading(true);
    setSearched(true);
    try {
      const params = new URLSearchParams();
      if (m) params.set('manufacturer', m);
      if (ct) params.set('contentType', ct);
      if (sq) params.set('search', sq);
      params.set('limit', '40');
      const data = await apiFetch<any>(`/api/knowledge-base?${params}`);
      setEntries(Array.isArray(data.entries) ? data.entries : []);
    } catch {
      setEntries([]);
    } finally {
      setLoading(false);
    }
  };

  const handleMfrClick = (mfr: string) => {
    const next = activeMfr === mfr ? '' : mfr;
    setActiveMfr(next);
    doSearch(next, activeType, search);
  };

  const handleTypeTab = (ct: string) => {
    setActiveType(ct);
    doSearch(activeMfr, ct, search);
  };

  const handleSearchKey = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') doSearch(activeMfr, activeType, search);
  };

  const viewEntry = (entry: KBEntry) => {
    setViewing(entry);
    // Increment view count silently
    apiFetch(`/api/knowledge-base/${entry.id}`).catch(() => {});
  };

  return (
    <div className="page active">
      {viewing && <ContentViewer entry={viewing} onClose={() => setViewing(null)} />}

      {/* Header */}
      <div style={{ padding: '16px 20px', borderBottom: '1px solid #f0f0f0' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 12 }}>{t('kb.knowledgeBase')}</div>
        {/* Search bar */}
        <div style={{ display: 'flex', gap: 8 }}>
          <input
            type="text"
            value={search}
            onChange={e => setSearch(e.target.value)}
            onKeyDown={handleSearchKey}
            placeholder={t('kb.searchManuals')}
            style={{ flex: 1, padding: '9px 14px', borderRadius: 8, border: '1px solid #d1d5db', fontSize: 14, fontFamily: 'inherit', outline: 'none' }}
          />
          <button className="btn btn-p" onClick={() => doSearch()}>Search</button>
        </div>
      </div>

      {/* Manufacturer cards */}
      {!searched && (
        <div style={{ padding: '16px 20px' }}>
          <div style={{ fontSize: 12, fontWeight: 600, color: '#6b7280', textTransform: 'uppercase', letterSpacing: '0.05em', marginBottom: 10 }}>Browse by Manufacturer</div>
          {mfrLoading ? (
            <div style={{ fontSize: 13, color: '#888' }}>{t('common.loading')}</div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))', gap: 10 }}>
              {manufacturers.map(m => (
                <div
                  key={m.manufacturer}
                  onClick={() => handleMfrClick(m.manufacturer)}
                  style={{
                    padding: '14px 16px', borderRadius: 10, border: `2px solid ${activeMfr === m.manufacturer ? 'var(--brand,#2563eb)' : '#e5e7eb'}`,
                    background: activeMfr === m.manufacturer ? '#eff6ff' : 'var(--surface,#fff)',
                    cursor: 'pointer', transition: 'all 0.15s',
                  }}
                >
                  <div style={{ fontSize: 13, fontWeight: 700, color: activeMfr === m.manufacturer ? 'var(--brand,#2563eb)' : 'var(--text,#1f2937)', marginBottom: 3 }}>{m.manufacturer}</div>
                  <div style={{ fontSize: 11, color: '#888' }}>{m.count} document{m.count !== 1 ? 's' : ''}</div>
                </div>
              ))}
              {manufacturers.length === 0 && (
                <div style={{ fontSize: 13, color: '#888', gridColumn: '1 / -1' }}>No content published yet.</div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Content type tabs */}
      {(searched || activeMfr) && (
        <div style={{ borderBottom: '1px solid #f0f0f0', padding: '0 20px' }}>
          <div className="tabs" style={{ borderBottom: 'none', flexWrap: 'wrap' as const }}>
            {CONTENT_TYPES.map(ct => (
              <div
                key={ct.value}
                className={`tab${activeType === ct.value ? ' active' : ''}`}
                onClick={() => handleTypeTab(ct.value)}
              >
                {ct.label}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Results */}
      {(searched || activeMfr) && (
        <div className="pn" style={{ borderTop: 'none' }}>
          {loading ? (
            <div style={{ padding: 32, textAlign: 'center', color: '#888', fontSize: 13 }}>{t('common.loading')}</div>
          ) : entries.length === 0 ? (
            <div style={{ padding: '40px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>{t('common.noResults')}</div>
          ) : (
            <div style={{ padding: '8px 0' }}>
              {entries.map(entry => (
                <div key={entry.id} style={{ display: 'flex', alignItems: 'center', gap: 12, padding: '12px 20px', borderBottom: '1px solid #f5f5f5', transition: 'background 0.1s' }} className="tr-hover">
                  <div style={{ width: 32, height: 32, background: '#f8fafc', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {CONTENT_TYPE_ICONS[entry.contentType] || CONTENT_TYPE_ICONS['spec_sheet']}
                  </div>
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ fontSize: 13, fontWeight: 600 }}>{entry.title}</div>
                    <div style={{ fontSize: 11, color: '#888', marginTop: 2 }}>
                      {entry.manufacturer}
                      {entry.modelFamily && ` · ${entry.modelFamily}`}
                      {entry.yearStart && ` · ${entry.yearStart}–${entry.yearEnd ?? 'present'}`}
                    </div>
                    {Array.isArray(entry.tags) && entry.tags.length > 0 && (
                      <div style={{ display: 'flex', gap: 4, marginTop: 4, flexWrap: 'wrap' as const }}>
                        {entry.tags.slice(0, 4).map((tag: string) => (
                          <span key={tag} style={{ fontSize: 10, padding: '1px 6px', borderRadius: 6, background: '#f3f4f6', color: '#6b7280' }}>{tag}</span>
                        ))}
                      </div>
                    )}
                  </div>
                  <div style={{ fontSize: 11, color: '#9ca3af', flexShrink: 0 }}>{entry.viewCount} views</div>
                  <button className="btn btn-p btn-sm" onClick={() => viewEntry(entry)}>View</button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
