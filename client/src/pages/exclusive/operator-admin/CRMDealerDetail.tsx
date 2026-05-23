import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function CRMDealerDetail() {
  const [dealer, setDealer] = useState<any>(null);
  const [tab, setTab] = useState('overview');
  const [activities, setActivities] = useState<any[]>([]);
  const [activityForm, setActivityForm] = useState({ type: 'note', summary: '' });
  const [activitySaving, setActivitySaving] = useState(false);
  const [tags, setTags] = useState<any[]>([]);
  const [newTag, setNewTag] = useState('');
  const [newTagColor, setNewTagColor] = useState('#e0e7ff');
  const [tagSaving, setTagSaving] = useState(false);

  useEffect(() => {
    const id = sessionStorage.getItem('crmDealerId');
    if (!id) return;
    apiFetch<any>(`/api/crm/dealers/${id}`).then(d => setDealer(d.dealer || null)).catch(() => {});
    apiFetch<any>(`/api/crm/activities/${id}`).then(d => setActivities(d.activities || [])).catch(() => {});
    apiFetch<any>('/api/crm/tags').then(d => setTags(d.tags || [])).catch(() => {});
  }, []);

  const refreshDealer = async () => {
    const id = sessionStorage.getItem('crmDealerId');
    if (!id) return;
    const d = await apiFetch<any>(`/api/crm/dealers/${id}`);
    setDealer(d.dealer || null);
  };

  if (!dealer) {
    return <div style={{ textAlign: 'center', padding: 40, color: '#888' }}>Loading…</div>;
  }

  return (
    <div className="page active">
      <div className="detail-header">
        <div className="detail-info">
          <div className="detail-title">{dealer.name || 'Dealer Record'}</div>
          <div className="detail-meta">
            {dealer.city}{dealer.stateProvince ? `, ${dealer.stateProvince}` : ''} · {dealer.country} · {(dealer.pipelineStage || 'prospect').replace(/_/g, ' ')}
          </div>
        </div>
        <a href={`/dealers/listing/${dealer.slug}`} target="_blank" rel="noreferrer" className="btn btn-o btn-sm">View Public Listing</a>
      </div>

      <div className="tabs">
        {[['overview', 'Overview'], ['activity', 'Activity Log'], ['tags', 'Tags'], ['reviews', 'Reviews'], ['messages', 'Messages']].map(([id, label]) => (
          <div key={id} className={`tab ${tab === id ? 'active' : ''}`} onClick={() => setTab(id)}>{label}</div>
        ))}
      </div>

      {tab === 'overview' && (
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginTop: 16 }}>
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Dealer Info</span></div>
            <div style={{ padding: '16px 20px', fontSize: 13 }}>
              {[['Name', dealer.name], ['City', dealer.city], ['Province/State', dealer.stateProvince], ['Country', dealer.country], ['Phone', dealer.phone], ['Website', dealer.website], ['Email', dealer.email], ['Claimed', dealer.isClaimed ? 'Yes' : 'No'], ['Verified', dealer.isVerified ? 'Yes' : 'No'], ['Page Views', dealer.pageViews ?? 0], ['Contact Clicks', dealer.contactClicks ?? 0]].map(([k, v]) => (
                <div key={k} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #f5f5f5' }}>
                  <span style={{ color: '#888' }}>{k}</span>
                  <span style={{ fontWeight: 500, maxWidth: 220, textAlign: 'right' }}>{v || '—'}</span>
                </div>
              ))}
            </div>
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <div className="pn">
              <div className="pn-h"><span className="pn-t">Pipeline Stage</span></div>
              <div style={{ padding: '16px 20px', fontSize: 13 }}>
                <select
                  value={dealer.pipelineStage || 'prospect'}
                  style={{ width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit', marginBottom: 10 }}
                  onChange={async e => {
                    try {
                      await apiFetch(`/api/crm/pipeline/${dealer.id}/stage`, { method: 'PUT', body: JSON.stringify({ stage: e.target.value }) });
                      await refreshDealer();
                    } catch {}
                  }}
                >
                  {['prospect', 'claimed_page', 'contacted', 'demo_scheduled', 'demo_done', 'negotiating', 'onboarded', 'active_customer', 'lost', 'not_interested'].map(s => (
                    <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase())}</option>
                  ))}
                </select>
                <div style={{ fontSize: 12, color: '#888' }}>Changing stage auto-logs a CRM activity.</div>
              </div>
            </div>
            <div className="pn">
              <div className="pn-h"><span className="pn-t">Quick Stats</span></div>
              <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                {[['Reviews', dealer.reviewCount ?? 0], ['Avg Rating', dealer.avgRating ? `${Number(dealer.avgRating).toFixed(1)} ★` : '—'], ['Messages', dealer.messages?.length ?? 0], ['Page Views', dealer.pageViews ?? 0]].map(([k, v]) => (
                  <div key={k} style={{ textAlign: 'center', padding: '10px 0', background: '#f8fafc', borderRadius: 8 }}>
                    <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--brand)' }}>{v}</div>
                    <div style={{ fontSize: 11, color: '#888' }}>{k}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {tab === 'activity' && (
        <div style={{ marginTop: 16 }}>
          <div className="pn" style={{ marginBottom: 16 }}>
            <div className="pn-h"><span className="pn-t">Log Activity</span></div>
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: '1fr 2fr auto', gap: 10, alignItems: 'end' }}>
              <select value={activityForm.type} onChange={e => setActivityForm(f => ({ ...f, type: e.target.value }))} style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }}>
                <option value="note">Note</option><option value="call">Call</option><option value="email">Email</option><option value="demo">Demo</option><option value="follow_up">Follow-up</option>
              </select>
              <input placeholder="Summary…" value={activityForm.summary} onChange={e => setActivityForm(f => ({ ...f, summary: e.target.value }))} style={{ padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, fontFamily: 'inherit' }} />
              <button className="btn btn-p btn-sm" disabled={activitySaving || !activityForm.summary} onClick={async () => {
                setActivitySaving(true);
                try {
                  await apiFetch('/api/crm/activities', { method: 'POST', body: JSON.stringify({ dealerId: dealer.id, type: activityForm.type, summary: activityForm.summary }) });
                  const d = await apiFetch<any>(`/api/crm/activities/${dealer.id}`);
                  setActivities(d.activities || []);
                  setActivityForm({ type: 'note', summary: '' });
                } catch {} finally { setActivitySaving(false); }
              }}>{activitySaving ? '…' : 'Log'}</button>
            </div>
          </div>
          <div className="pn">
            <div className="tw">
              <table>
                <thead><tr><th>Type</th><th>Summary</th><th>By</th><th>Date</th></tr></thead>
                <tbody>
                  {activities.length === 0
                    ? <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No activity yet</td></tr>
                    : activities.map((a: any) => (
                      <tr key={a.id}>
                        <td><span className="bg submitted" style={{ textTransform: 'capitalize' }}>{a.activityType?.replace(/_/g, ' ') || a.type}</span></td>
                        <td style={{ maxWidth: 340 }}>{a.summary}</td>
                        <td>{a.createdByName || a.createdBy || '—'}</td>
                        <td>{a.createdAt ? new Date(a.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</td>
                      </tr>
                    ))
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {tab === 'tags' && (
        <div style={{ marginTop: 16, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
          <div className="pn">
            <div className="pn-h"><span className="pn-t">Assigned Tags</span></div>
            <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {(dealer.tags || []).length === 0 && <span style={{ fontSize: 13, color: '#aaa' }}>No tags assigned</span>}
              {(dealer.tags || []).map((t: any) => (
                <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: t.color || '#e0e7ff', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 500 }}>
                  {t.name}
                  <button style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666', lineHeight: 1 }} onClick={async () => {
                    try {
                      await apiFetch(`/api/crm/dealers/${dealer.id}/tags/${t.id}`, { method: 'DELETE' });
                      await refreshDealer();
                    } catch {}
                  }}>×</button>
                </span>
              ))}
            </div>
          </div>
          <div className="pn">
            <div className="pn-h">
              <span className="pn-t">All Tags</span>
              <div style={{ display: 'flex', gap: 6 }}>
                <input placeholder="New tag…" value={newTag} onChange={e => setNewTag(e.target.value)} style={{ padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', width: 100 }} />
                <input type="color" value={newTagColor} onChange={e => setNewTagColor(e.target.value)} style={{ width: 28, height: 28, border: 'none', cursor: 'pointer', borderRadius: 4 }} />
                <button className="btn btn-p btn-sm" disabled={tagSaving || !newTag} onClick={async () => {
                  setTagSaving(true);
                  try {
                    await apiFetch('/api/crm/tags', { method: 'POST', body: JSON.stringify({ name: newTag, color: newTagColor }) });
                    const d = await apiFetch<any>('/api/crm/tags'); setTags(d.tags || []);
                    setNewTag('');
                  } catch {} finally { setTagSaving(false); }
                }}>Add</button>
              </div>
            </div>
            <div style={{ padding: '16px 20px', display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              {tags.map((t: any) => (
                <span key={t.id} style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: t.color || '#e0e7ff', borderRadius: 20, padding: '4px 10px', fontSize: 12, fontWeight: 500, cursor: 'pointer' }}
                  onClick={async () => {
                    try {
                      await apiFetch(`/api/crm/dealers/${dealer.id}/tags`, { method: 'POST', body: JSON.stringify({ tagId: t.id }) });
                      await refreshDealer();
                    } catch {}
                  }}>+ {t.name}</span>
              ))}
            </div>
          </div>
        </div>
      )}

      {tab === 'reviews' && (
        <div className="pn" style={{ marginTop: 16 }}>
          <div className="pn-h"><span className="pn-t">Customer Reviews</span></div>
          <div className="tw">
            <table>
              <thead><tr><th>Author</th><th>Rating</th><th>Title</th><th>Status</th><th>Date</th><th>Action</th></tr></thead>
              <tbody>
                {(dealer.reviews || []).length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No reviews</td></tr>
                  : (dealer.reviews || []).map((r: any) => (
                    <tr key={r.id}>
                      <td>{r.authorName}</td>
                      <td>{'★'.repeat(r.rating)}{'☆'.repeat(5 - r.rating)}</td>
                      <td style={{ maxWidth: 240 }}>{r.title || '—'}</td>
                      <td><span className={`bg ${r.status === 'approved' ? 'pay-recv' : r.status === 'pending' ? 'pending' : 'denied'}`}>{r.status}</span></td>
                      <td>{r.createdAt ? new Date(r.createdAt).toLocaleDateString() : '—'}</td>
                      <td style={{ whiteSpace: 'nowrap' }}>
                        {r.status !== 'approved' && <button className="btn btn-s btn-sm" style={{ marginRight: 4 }} onClick={async () => {
                          try {
                            await apiFetch(`/api/crm/reviews/${r.id}/moderate`, { method: 'POST', body: JSON.stringify({ action: 'approve' }) });
                            await refreshDealer();
                          } catch {}
                        }}>Approve</button>}
                        <button className="btn btn-d btn-sm" onClick={async () => {
                          try {
                            await apiFetch(`/api/crm/reviews/${r.id}/moderate`, { method: 'POST', body: JSON.stringify({ action: 'remove' }) });
                            await refreshDealer();
                          } catch {}
                        }}>Remove</button>
                      </td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === 'messages' && (
        <div className="pn" style={{ marginTop: 16 }}>
          <div className="pn-h"><span className="pn-t">Messages &amp; Quote Requests</span></div>
          <div className="tw">
            <table>
              <thead><tr><th>From</th><th>Email</th><th>Subject</th><th>Date</th></tr></thead>
              <tbody>
                {(dealer.messages || []).length === 0
                  ? <tr><td colSpan={4} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No messages</td></tr>
                  : (dealer.messages || []).map((m: any) => (
                    <tr key={m.id}>
                      <td>{m.senderName}</td>
                      <td><a href={`mailto:${m.senderEmail}`} style={{ color: 'var(--brand)' }}>{m.senderEmail}</a></td>
                      <td style={{ maxWidth: 280 }}>{m.subject || m.body?.slice(0, 60) + '…'}</td>
                      <td>{m.createdAt ? new Date(m.createdAt).toLocaleDateString() : '—'}</td>
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
