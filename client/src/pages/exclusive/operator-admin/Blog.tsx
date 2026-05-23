import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function Blog() {
  const [blogTab, setBlogTab] = useState<'queue' | 'drafts' | 'published'>('queue');
  const [blogSearch, setBlogSearch] = useState('');
  const [blogQueue, setBlogQueue] = useState<any[]>([]);
  const [blogDrafts, setBlogDrafts] = useState<any[]>([]);
  const [blogPublished, setBlogPublished] = useState<any[]>([]);
  const [dataError, setDataError] = useState('');

  const loadData = () => {
    apiFetch<any>('/api/blog/admin/queue').then(d => setBlogQueue(Array.isArray(d) ? d : [])).catch(() => setDataError('Failed to load data'));
    apiFetch<any>('/api/blog/admin/posts?status=draft').then(d => setBlogDrafts(d.posts || [])).catch(() => {});
    apiFetch<any>('/api/blog/admin/posts?status=published').then(d => setBlogPublished(d.posts || [])).catch(() => {});
  };

  useEffect(() => { loadData(); }, []);

  const blogTotalViews = blogPublished.reduce((sum: number, p: any) => sum + (p.viewCount || 0), 0);
  const sl = blogSearch.toLowerCase();
  const filteredBlogQueue = sl ? blogQueue.filter((q: any) => q.title?.toLowerCase().includes(sl) || q.targetKeyword?.toLowerCase().includes(sl)) : blogQueue;
  const filteredBlogDrafts = sl ? blogDrafts.filter((p: any) => p.title?.toLowerCase().includes(sl)) : blogDrafts;
  const filteredBlogPublished = sl ? blogPublished.filter((p: any) => p.title?.toLowerCase().includes(sl)) : blogPublished;

  const handleBlogGenerateNow = async (queueId: number) => {
    try {
      await apiFetch(`/api/blog/admin/queue/${queueId}/generate`, { method: 'POST' });
      const d = await apiFetch<any>('/api/blog/admin/queue');
      setBlogQueue(Array.isArray(d) ? d : []);
    } catch {}
  };

  const handleBlogApprove = async (postId: number) => {
    try {
      await apiFetch(`/api/blog/admin/posts/${postId}/approve`, { method: 'POST' });
      loadData();
    } catch {}
  };

  const handleBlogArchive = async (postId: number) => {
    try {
      await apiFetch(`/api/blog/admin/posts/${postId}/archive`, { method: 'POST' });
      loadData();
    } catch {}
  };

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20 }}>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Published Posts</div><div className="sc-v" style={{ color: '#22c55e' }}>{blogPublished.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Awaiting Review</div><div className="sc-v" style={{ color: '#f59e0b' }}>{blogDrafts.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Queued Topics</div><div className="sc-v">{blogQueue.length}</div></div>
        <div className="sc"><div className="sc-l" style={{ marginBottom: 8 }}>Total Views</div><div className="sc-v">{blogTotalViews.toLocaleString()}</div></div>
      </div>
      <div className="tabs">
        <div className={`tab ${blogTab === 'queue' ? 'active' : ''}`} onClick={() => { setBlogTab('queue'); setBlogSearch(''); }}>Content Queue ({blogQueue.length})</div>
        <div className={`tab ${blogTab === 'drafts' ? 'active' : ''}`} onClick={() => { setBlogTab('drafts'); setBlogSearch(''); }}>Drafts / Review ({blogDrafts.length})</div>
        <div className={`tab ${blogTab === 'published' ? 'active' : ''}`} onClick={() => { setBlogTab('published'); setBlogSearch(''); }}>Published ({blogPublished.length})</div>
      </div>

      {blogTab === 'queue' && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          <div className="pn-h">
            <span className="pn-t">Content Queue</span>
            <span className="pn-a" onClick={() => {
              const t = prompt('Topic title:');
              const k = prompt('Target keyword:');
              const c = prompt('Category (Warranty Guides, Inspections, Dealership Operations, Industry, Guides):') || 'Warranty Guides';
              const p = prompt('Prompt template (manufacturer-warranty-guide, dealership-operations, pdi-inspection, industry-trends, how-to):') || 'manufacturer-warranty-guide';
              if (t && k) {
                apiFetch('/api/blog/admin/queue', { method: 'POST', body: JSON.stringify({ title: t, targetKeyword: k, category: c, promptTemplate: p, scheduledGeneration: new Date().toISOString() }) })
                  .then(() => apiFetch<any>('/api/blog/admin/queue').then(d => setBlogQueue(Array.isArray(d) ? d : [])));
              }
            }}>+ Add Topic</span>
          </div>
          <div className="filter-bar">
            <input type="text" placeholder="Search topics..." value={blogSearch} onChange={e => setBlogSearch(e.target.value)} />
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr><th>Topic</th><th>Target Keyword</th><th>Category</th><th>Scheduled</th><th>Status</th><th>Action</th></tr>
              </thead>
              <tbody>
                {filteredBlogQueue.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 20 }}>{dataError || (blogQueue.length === 0 ? 'No topics queued. Add a topic to get started.' : 'No results match your search')}</td></tr>
                  : filteredBlogQueue.map((q: any) => (
                    <tr key={q.id}>
                      <td style={{ fontWeight: 500, maxWidth: 260, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{q.title}</td>
                      <td><span className="mfr">{q.targetKeyword}</span></td>
                      <td>{q.category}</td>
                      <td>{q.scheduledGeneration ? new Date(q.scheduledGeneration).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                      <td>
                        <span className="bg" style={{ background: q.status === 'generated' ? '#f0fdf4' : q.status === 'generating' ? '#eff6ff' : q.status === 'failed' ? '#fef2f2' : '#fefce8', color: q.status === 'generated' ? '#16a34a' : q.status === 'generating' ? 'var(--brand)' : q.status === 'failed' ? '#dc2626' : '#92400e' }}>{q.status}</span>
                        {q.status === 'failed' && q.errorMessage && <div style={{ fontSize: 11, color: '#dc2626', marginTop: 4, maxWidth: 220, wordBreak: 'break-word' }}>{q.errorMessage}</div>}
                      </td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-p btn-sm" onClick={() => handleBlogGenerateNow(q.id)} disabled={q.status === 'generating'}>Generate Now</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {blogTab === 'drafts' && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          <div className="pn-h"><span className="pn-t">Drafts / Review</span></div>
          <div className="filter-bar">
            <input type="text" placeholder="Search drafts..." value={blogSearch} onChange={e => setBlogSearch(e.target.value)} />
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr><th>Title</th><th>Category</th><th>Template</th><th>Words</th><th>Read Time</th><th>Created</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredBlogDrafts.length === 0
                  ? <tr><td colSpan={7} style={{ textAlign: 'center', color: '#888', padding: 20 }}>{dataError || 'No drafts pending review. AI-generated drafts appear here after each Mon/Wed/Fri generation run.'}</td></tr>
                  : filteredBlogDrafts.map((p: any) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, maxWidth: 280, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</td>
                      <td>{p.category}</td>
                      <td><span className="mfr">{p.promptTemplate || '—'}</span></td>
                      <td>{p.wordCount ? p.wordCount.toLocaleString() : '—'}</td>
                      <td>{p.readTimeMinutes ? `${p.readTimeMinutes} min` : '—'}</td>
                      <td>{p.createdAt ? new Date(p.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' }) : '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-s btn-sm" style={{ marginRight: 4 }} onClick={() => handleBlogApprove(p.id)}>Approve &amp; Publish</button>
                        <button className="btn btn-d btn-sm" onClick={() => handleBlogArchive(p.id)}>Archive</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {blogTab === 'published' && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          <div className="pn-h"><span className="pn-t">Published Posts</span></div>
          <div className="filter-bar">
            <input type="text" placeholder="Search published..." value={blogSearch} onChange={e => setBlogSearch(e.target.value)} />
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr><th>Title</th><th>Category</th><th>Published</th><th>Views</th><th>Actions</th></tr>
              </thead>
              <tbody>
                {filteredBlogPublished.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 20 }}>{dataError || 'No published posts yet. Approve a draft to publish it live.'}</td></tr>
                  : filteredBlogPublished.map((p: any) => (
                    <tr key={p.id}>
                      <td style={{ fontWeight: 500, maxWidth: 320, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{p.title}</td>
                      <td>{p.category}</td>
                      <td>{p.publishedAt ? new Date(p.publishedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}</td>
                      <td>{(p.viewCount || 0).toLocaleString()}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        <button className="btn btn-o btn-sm" style={{ marginRight: 4 }} onClick={() => window.open(`/blog/${p.slug}`, '_blank')}>View</button>
                        <button className="btn btn-d btn-sm" onClick={() => handleBlogArchive(p.id)}>Archive</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
