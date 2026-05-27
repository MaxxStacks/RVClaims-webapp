import { useState, useEffect, useRef } from 'react';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';

const MANUFACTURERS = ['Jayco', 'Forest River', 'Heartland', 'Columbia NW', 'Keystone', 'Midwest Auto', 'Other'];

const CONTENT_TYPES = [
  { value: 'owners_manual', label: "Owner's Manual", color: '#2563eb', bg: '#eff6ff' },
  { value: 'maintenance_schedule', label: 'Maintenance Schedule', color: '#16a34a', bg: '#f0fdf4' },
  { value: 'troubleshooting_guide', label: 'Troubleshooting Guide', color: '#d97706', bg: '#fffbeb' },
  { value: 'how_to_article', label: 'How-To Guide', color: '#7c3aed', bg: '#f5f3ff' },
  { value: 'video', label: 'Video', color: '#dc2626', bg: '#fef2f2' },
  { value: 'spec_sheet', label: 'Spec Sheet', color: '#6b7280', bg: '#f9fafb' },
  { value: 'wiring_diagram', label: 'Wiring Diagram', color: '#374151', bg: '#f3f4f6' },
  { value: 'parts_catalog', label: 'Parts Catalog', color: '#374151', bg: '#f3f4f6' },
  { value: 'bulletin', label: 'Service Bulletin', color: '#b45309', bg: '#fffbeb' },
  { value: 'recall_notice', label: 'Recall Notice', color: '#dc2626', bg: '#fef2f2' },
];

function ContentTypeBadge({ type }: { type: string }) {
  const ct = CONTENT_TYPES.find(c => c.value === type);
  if (!ct) return <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, background: '#f3f4f6', color: '#6b7280' }}>{type}</span>;
  return (
    <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 10, background: ct.bg, color: ct.color, fontWeight: 600, whiteSpace: 'nowrap' as const }}>
      {ct.label}
    </span>
  );
}

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
  isPublished: boolean;
  viewCount: number;
  createdAt: string;
}

interface FormState {
  title: string;
  description: string;
  contentType: string;
  manufacturer: string;
  modelFamily: string;
  modelNumber: string;
  yearStart: string;
  yearEnd: string;
  contentSource: 'file' | 'video' | 'article';
  videoUrl: string;
  articleContent: string;
  tags: string;
  isPublished: boolean;
}

const defaultForm: FormState = {
  title: '', description: '', contentType: 'owners_manual', manufacturer: 'Jayco',
  modelFamily: '', modelNumber: '', yearStart: '', yearEnd: '',
  contentSource: 'file', videoUrl: '', articleContent: '', tags: '', isPublished: true,
};

export default function KnowledgeBaseManagement() {
  const { t } = useLanguage();

  const [entries, setEntries] = useState<KBEntry[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [filterMfr, setFilterMfr] = useState('');
  const [filterType, setFilterType] = useState('');
  const [filterSearch, setFilterSearch] = useState('');
  const [showUnpublished, setShowUnpublished] = useState(true);

  // Form dialog
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState<FormState>(defaultForm);
  const [saving, setSaving] = useState(false);
  const [saveError, setSaveError] = useState<string | null>(null);

  // File upload
  const [uploading, setUploading] = useState(false);
  const [uploadedUrl, setUploadedUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Toast
  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const showToast = (msg: string) => { setToastMsg(msg); setToastVisible(true); setTimeout(() => setToastVisible(false), 3000); };

  const loadEntries = async () => {
    setLoading(true);
    setError(null);
    try {
      const params = new URLSearchParams();
      if (filterMfr) params.set('manufacturer', filterMfr);
      if (filterType) params.set('contentType', filterType);
      if (filterSearch) params.set('search', filterSearch);
      params.set('limit', '50');
      const data = await apiFetch<any>(`/api/knowledge-base?${params}`);
      let rows: KBEntry[] = Array.isArray(data.entries) ? data.entries : [];
      if (!showUnpublished) rows = rows.filter(r => r.isPublished);
      setEntries(rows);
      setTotal(data.total ?? rows.length);
    } catch (e: any) {
      setError(e?.message || 'Failed to load');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadEntries(); }, [filterMfr, filterType, filterSearch, showUnpublished]);

  const openAdd = () => {
    setEditingId(null);
    setForm(defaultForm);
    setUploadedUrl(null);
    setSaveError(null);
    setShowForm(true);
  };

  const openEdit = (entry: KBEntry) => {
    setEditingId(entry.id);
    setForm({
      title: entry.title,
      description: entry.description || '',
      contentType: entry.contentType,
      manufacturer: entry.manufacturer,
      modelFamily: entry.modelFamily || '',
      modelNumber: entry.modelNumber || '',
      yearStart: entry.yearStart ? String(entry.yearStart) : '',
      yearEnd: entry.yearEnd ? String(entry.yearEnd) : '',
      contentSource: entry.fileUrl ? 'file' : entry.videoUrl ? 'video' : 'article',
      videoUrl: entry.videoUrl || '',
      articleContent: entry.articleContent || '',
      tags: Array.isArray(entry.tags) ? entry.tags.join(', ') : '',
      isPublished: entry.isPublished,
    });
    setUploadedUrl(entry.fileUrl || null);
    setSaveError(null);
    setShowForm(true);
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const presign = await apiFetch<any>('/api/knowledge-base/presign', {
        method: 'POST',
        body: JSON.stringify({ filename: file.name, contentType: file.type }),
      });
      await fetch(presign.uploadUrl, { method: 'PUT', body: file, headers: { 'Content-Type': file.type } });
      setUploadedUrl(presign.publicUrl);
    } catch {
      setSaveError('File upload failed. Try again.');
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!form.title.trim()) { setSaveError('Title is required'); return; }
    setSaving(true);
    setSaveError(null);
    try {
      const payload: Record<string, any> = {
        title: form.title.trim(),
        description: form.description.trim() || null,
        contentType: form.contentType,
        manufacturer: form.manufacturer,
        modelFamily: form.modelFamily.trim() || null,
        modelNumber: form.modelNumber.trim() || null,
        yearStart: form.yearStart ? parseInt(form.yearStart, 10) : null,
        yearEnd: form.yearEnd ? parseInt(form.yearEnd, 10) : null,
        fileUrl: form.contentSource === 'file' ? (uploadedUrl || null) : null,
        videoUrl: form.contentSource === 'video' ? (form.videoUrl.trim() || null) : null,
        articleContent: form.contentSource === 'article' ? (form.articleContent.trim() || null) : null,
        tags: form.tags.split(',').map(t => t.trim()).filter(Boolean),
        isPublished: form.isPublished,
      };

      let result: any;
      if (editingId) {
        result = await apiFetch<any>(`/api/knowledge-base/${editingId}`, { method: 'PATCH', body: JSON.stringify(payload) });
      } else {
        result = await apiFetch<any>('/api/knowledge-base', { method: 'POST', body: JSON.stringify(payload) });
      }

      const count = result.linkedUnitsCount ?? 0;
      showToast(editingId ? 'Content updated.' : `Content published! Auto-linked to ${count} matching unit${count !== 1 ? 's' : ''}.`);
      setShowForm(false);
      loadEntries();
    } catch (e: any) {
      setSaveError(e?.message || 'Failed to save');
    } finally {
      setSaving(false);
    }
  };

  const handleArchive = async (entry: KBEntry) => {
    try {
      await apiFetch(`/api/knowledge-base/${entry.id}`, { method: 'DELETE' });
      showToast('Content archived (unpublished).');
      loadEntries();
    } catch {
      showToast('Failed to archive.');
    }
  };

  const setFormField = (k: keyof FormState, v: any) => setForm(f => ({ ...f, [k]: v }));

  return (
    <div className="page active">
      {/* Toast */}
      {toastVisible && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, zIndex: 9999, background: '#1d2939', color: '#fff', borderRadius: 8, padding: '10px 18px', fontSize: 13, fontWeight: 500, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
          {toastMsg}
        </div>
      )}

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '16px 20px', borderBottom: '1px solid #f0f0f0', flexWrap: 'wrap', gap: 10 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <div style={{ fontSize: 16, fontWeight: 700 }}>{t('kb.knowledgeBase')}</div>
          <span style={{ fontSize: 11, padding: '2px 8px', borderRadius: 10, background: '#f0f4ff', color: '#2563eb', fontWeight: 700 }}>
            {total} entries
          </span>
        </div>
        <button className="btn btn-p btn-sm" onClick={openAdd}>+ {t('kb.addContent')}</button>
      </div>

      {/* Filter row */}
      <div className="filter-bar" style={{ padding: '12px 20px' }}>
        <select value={filterMfr} onChange={e => setFilterMfr(e.target.value)}>
          <option value="">All Manufacturers</option>
          {MANUFACTURERS.map(m => <option key={m}>{m}</option>)}
        </select>
        <select value={filterType} onChange={e => setFilterType(e.target.value)}>
          <option value="">All Content Types</option>
          {CONTENT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
        </select>
        <input
          type="text"
          placeholder={t('common.search') + '…'}
          value={filterSearch}
          onChange={e => setFilterSearch(e.target.value)}
          style={{ minWidth: 180 }}
        />
        <label style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
          <input type="checkbox" checked={showUnpublished} onChange={e => setShowUnpublished(e.target.checked)} />
          Show Unpublished
        </label>
      </div>

      {/* Table */}
      <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
        {loading ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#888', fontSize: 13 }}>{t('common.loading')}</div>
        ) : error ? (
          <div style={{ padding: 32, textAlign: 'center', color: '#dc2626', fontSize: 13 }}>{error}</div>
        ) : entries.length === 0 ? (
          <div style={{ padding: '40px 20px', textAlign: 'center' }}>
            <div style={{ width: 48, height: 48, background: '#f0f4ff', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 12px' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>
            </div>
            <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 4 }}>No content yet</div>
            <div style={{ fontSize: 13, color: '#888', marginBottom: 16 }}>Add owner's manuals, maintenance guides, and more.</div>
            <button className="btn btn-p btn-sm" onClick={openAdd}>+ {t('kb.addContent')}</button>
          </div>
        ) : (
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Type</th>
                  <th>{t('kb.manufacturer')}</th>
                  <th>Model / Family</th>
                  <th>Years</th>
                  <th>Views</th>
                  <th>Status</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {entries.map(entry => (
                  <tr key={entry.id}>
                    <td style={{ fontWeight: 600, maxWidth: 240 }}>
                      <div style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{entry.title}</div>
                      {entry.description && (
                        <div style={{ fontSize: 11, color: '#888', marginTop: 2, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' as const }}>{entry.description}</div>
                      )}
                    </td>
                    <td><ContentTypeBadge type={entry.contentType} /></td>
                    <td style={{ fontSize: 13 }}>{entry.manufacturer}</td>
                    <td style={{ fontSize: 13 }}>
                      {entry.modelFamily && <div>{entry.modelFamily}</div>}
                      {entry.modelNumber && <div style={{ color: '#888', fontSize: 11 }}>{entry.modelNumber}</div>}
                      {!entry.modelFamily && !entry.modelNumber && <span style={{ color: '#bbb' }}>All models</span>}
                    </td>
                    <td style={{ fontSize: 13, color: '#6b7280', whiteSpace: 'nowrap' as const }}>
                      {entry.yearStart || entry.yearEnd
                        ? `${entry.yearStart ?? '—'} – ${entry.yearEnd ?? 'present'}`
                        : <span style={{ color: '#bbb' }}>All years</span>
                      }
                    </td>
                    <td style={{ fontSize: 13, textAlign: 'right' as const }}>{entry.viewCount}</td>
                    <td>
                      {entry.isPublished
                        ? <span className="bg active" style={{ fontSize: 11 }}>Published</span>
                        : <span className="bg pending" style={{ fontSize: 11 }}>Draft</span>}
                    </td>
                    <td>
                      <div style={{ display: 'flex', gap: 6 }}>
                        <button className="btn btn-o btn-sm" onClick={() => openEdit(entry)}>Edit</button>
                        <button className="btn btn-sm" style={{ background: 'none', border: '1px solid #fca5a5', color: '#dc2626', borderRadius: 6, padding: '3px 10px', fontSize: 12, cursor: 'pointer', fontFamily: 'inherit' }} onClick={() => handleArchive(entry)}>
                          Archive
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Add / Edit Dialog */}
      {showForm && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.45)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 16 }} onClick={e => { if (e.target === e.currentTarget) setShowForm(false); }}>
          <div style={{ background: 'var(--surface, #fff)', borderRadius: 12, width: '100%', maxWidth: 700, maxHeight: '90vh', overflow: 'auto', boxShadow: '0 20px 60px rgba(0,0,0,0.25)' }}>
            <div style={{ padding: '20px 24px', borderBottom: '1px solid #f0f0f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
              <div style={{ fontSize: 15, fontWeight: 700 }}>{editingId ? 'Edit Content' : t('kb.addContent')}</div>
              <button onClick={() => setShowForm(false)} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#888', fontSize: 20, lineHeight: 1 }}>×</button>
            </div>

            <div style={{ padding: 24 }}>
              {saveError && (
                <div style={{ padding: '10px 14px', background: '#fef2f2', border: '1px solid #fca5a5', borderRadius: 6, color: '#dc2626', fontSize: 13, marginBottom: 16 }}>{saveError}</div>
              )}

              {/* Title */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Title <span style={{ color: '#dc2626' }}>*</span></label>
                <input value={form.title} onChange={e => setFormField('title', e.target.value)} placeholder="e.g. Jayco Jay Flight Owner's Manual 2023" />
              </div>

              {/* Description */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>Description</label>
                <input value={form.description} onChange={e => setFormField('description', e.target.value)} placeholder="Brief summary of this content" />
              </div>

              {/* Content Type + Manufacturer */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group">
                  <label>Content Type <span style={{ color: '#dc2626' }}>*</span></label>
                  <select value={form.contentType} onChange={e => setFormField('contentType', e.target.value)}>
                    {CONTENT_TYPES.map(ct => <option key={ct.value} value={ct.value}>{ct.label}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('kb.manufacturer')} <span style={{ color: '#dc2626' }}>*</span></label>
                  <select value={form.manufacturer} onChange={e => setFormField('manufacturer', e.target.value)}>
                    {MANUFACTURERS.map(m => <option key={m}>{m}</option>)}
                  </select>
                </div>
              </div>

              {/* Model Family + Model Number */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group">
                  <label>{t('kb.modelFamily')}</label>
                  <input value={form.modelFamily} onChange={e => setFormField('modelFamily', e.target.value)} placeholder="e.g. Jay Flight, R-Pod" />
                </div>
                <div className="form-group">
                  <label>{t('kb.modelNumber')}</label>
                  <input value={form.modelNumber} onChange={e => setFormField('modelNumber', e.target.value)} placeholder="e.g. 38RBS, 192BH" />
                </div>
              </div>

              {/* Year range */}
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14, marginBottom: 14 }}>
                <div className="form-group">
                  <label>Year Start</label>
                  <input type="number" value={form.yearStart} onChange={e => setFormField('yearStart', e.target.value)} placeholder="e.g. 2020" min="1990" max="2030" />
                </div>
                <div className="form-group">
                  <label>Year End</label>
                  <input type="number" value={form.yearEnd} onChange={e => setFormField('yearEnd', e.target.value)} placeholder="e.g. 2026 (blank = ongoing)" min="1990" max="2030" />
                </div>
              </div>

              {/* Content source */}
              <div style={{ marginBottom: 14 }}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-secondary, #555)', display: 'block', marginBottom: 6 }}>Content Source</label>
                <div style={{ display: 'flex', gap: 16 }}>
                  {(['file', 'video', 'article'] as const).map(s => (
                    <label key={s} style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer' }}>
                      <input type="radio" name="contentSource" checked={form.contentSource === s} onChange={() => { setFormField('contentSource', s); }} />
                      {s === 'file' ? t('kb.uploadFile') : s === 'video' ? t('kb.videoUrl') : t('kb.writeArticle')}
                    </label>
                  ))}
                </div>
              </div>

              {form.contentSource === 'file' && (
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label>{t('kb.uploadFile')}</label>
                  <div style={{ border: '2px dashed #d1d5db', borderRadius: 8, padding: 16, textAlign: 'center' as const }}>
                    {uploadedUrl ? (
                      <div>
                        <div style={{ fontSize: 13, color: '#16a34a', marginBottom: 8 }}>File uploaded</div>
                        <a href={uploadedUrl} target="_blank" rel="noreferrer" style={{ fontSize: 12, color: '#2563eb' }}>Preview</a>
                        <button onClick={() => { setUploadedUrl(null); if (fileInputRef.current) fileInputRef.current.value = ''; }} style={{ marginLeft: 12, fontSize: 12, background: 'none', border: 'none', color: '#dc2626', cursor: 'pointer' }}>Remove</button>
                      </div>
                    ) : (
                      <label style={{ cursor: 'pointer' }}>
                        <input ref={fileInputRef} type="file" accept=".pdf,image/*" style={{ display: 'none' }} onChange={handleFileUpload} />
                        <div style={{ fontSize: 13, color: '#6b7280' }}>{uploading ? 'Uploading…' : 'Click to upload PDF or image'}</div>
                      </label>
                    )}
                  </div>
                </div>
              )}

              {form.contentSource === 'video' && (
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label>{t('kb.videoUrl')}</label>
                  <input value={form.videoUrl} onChange={e => setFormField('videoUrl', e.target.value)} placeholder="https://youtube.com/watch?v=... or Vimeo" />
                </div>
              )}

              {form.contentSource === 'article' && (
                <div className="form-group" style={{ marginBottom: 14 }}>
                  <label>{t('kb.writeArticle')}</label>
                  <textarea
                    value={form.articleContent}
                    onChange={e => setFormField('articleContent', e.target.value)}
                    style={{ width: '100%', minHeight: 140, resize: 'vertical' as const, fontFamily: 'inherit', fontSize: 13 }}
                    placeholder="Write article content here…"
                  />
                </div>
              )}

              {/* Tags */}
              <div className="form-group" style={{ marginBottom: 14 }}>
                <label>{t('kb.tags')}</label>
                <input value={form.tags} onChange={e => setFormField('tags', e.target.value)} placeholder="winterization, plumbing, slide-out" />
                <div style={{ fontSize: 11, color: '#888', marginTop: 3 }}>Comma-separated</div>
              </div>

              {/* Published toggle */}
              <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 20 }}>
                <label style={{ position: 'relative', display: 'inline-block', width: 36, height: 20 }}>
                  <input type="checkbox" checked={form.isPublished} onChange={e => setFormField('isPublished', e.target.checked)} style={{ opacity: 0, width: 0, height: 0 }} />
                  <span style={{ position: 'absolute', inset: 0, background: form.isPublished ? '#16a34a' : '#d1d5db', borderRadius: 20, transition: '0.2s', cursor: 'pointer' }}>
                    <span style={{ position: 'absolute', left: form.isPublished ? 18 : 2, top: 2, width: 16, height: 16, background: '#fff', borderRadius: '50%', transition: '0.2s' }} />
                  </span>
                </label>
                <span style={{ fontSize: 13 }}>Published</span>
              </div>

              {/* Actions */}
              <div style={{ display: 'flex', gap: 10 }}>
                <button className="btn btn-p" onClick={handleSave} disabled={saving || uploading}>
                  {saving ? t('common.saving') : editingId ? t('common.save') : 'Publish Content'}
                </button>
                <button className="btn btn-o" onClick={() => setShowForm(false)}>{t('common.cancel')}</button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
