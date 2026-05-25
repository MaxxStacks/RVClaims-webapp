import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function Marketing() {
  const [view, setView] = useState<'campaigns' | 'templates' | 'new-campaign'>('campaigns');
  const [templates, setTemplates] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [form, setForm] = useState({ name: '', type: 'email', templateId: '', subject: '', body: '', scheduledFor: '' });

  const loadData = () => Promise.all([
    apiFetch<any>('/api/marketing/campaigns').then(d => setCampaigns(d.campaigns || [])).catch(() => {}),
    apiFetch<any>('/api/marketing/templates').then(d => setTemplates(d.templates || [])).catch(() => {}),
  ]);

  useEffect(() => {
    setLoading(true);
    loadData().finally(() => setLoading(false));
  }, []);

  const handleCreate = async () => {
    if (!form.name || !form.type) return;
    setSaving(true);
    setFeedback('');
    try {
      await apiFetch('/api/marketing/campaigns', {
        method: 'POST',
        body: JSON.stringify({
          name: form.name,
          type: form.type,
          templateId: form.templateId || undefined,
          subject: form.subject || undefined,
          bodyText: form.body || undefined,
          scheduledFor: form.scheduledFor || undefined,
        }),
      });
      setFeedback('Campaign created ✓');
      setForm({ name: '', type: 'email', templateId: '', subject: '', body: '', scheduledFor: '' });
      await loadData();
      setTimeout(() => { setView('campaigns'); setFeedback(''); }, 800);
    } catch (e: any) {
      setFeedback(e?.message || 'Failed to create campaign.');
    } finally {
      setSaving(false);
    }
  };

  const statusColor: Record<string, string> = {
    draft: 'draft', scheduled: 'submitted', sent: 'pay-recv', cancelled: 'denied',
  };

  if (loading) return <div className="page active" style={{ padding: 40, color: '#888', fontSize: 13 }}>Loading…</div>;

  return (
    <div className="page active">
      <div className="al-g" style={{ marginBottom: 20 }}>
        <div className="al">
          <div className="al-i gr">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
          </div>
          <div className="al-c">
            <div className="al-t">Marketing Services</div>
            <div className="al-d">Create email and SMS campaigns using DS360 templates</div>
          </div>
        </div>
      </div>

      <div className="tabs" style={{ marginBottom: 0 }}>
        <div className={`tab ${view === 'campaigns' ? 'active' : ''}`} onClick={() => setView('campaigns')}>My Campaigns</div>
        <div className={`tab ${view === 'templates' ? 'active' : ''}`} onClick={() => setView('templates')}>Templates</div>
        <div className={`tab ${view === 'new-campaign' ? 'active' : ''}`} onClick={() => { setForm({ name: '', type: 'email', templateId: '', subject: '', body: '', scheduledFor: '' }); setView('new-campaign'); }}>+ New Campaign</div>
      </div>

      {/* MY CAMPAIGNS */}
      {view === 'campaigns' && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          <div className="tw">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Type</th><th>Status</th><th>Scheduled</th></tr>
              </thead>
              <tbody>
                {campaigns.length === 0
                  ? <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No campaigns yet — create your first one above</td></tr>
                  : campaigns.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.campaignNumber}</td>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td><span className="bg submitted" style={{ textTransform: 'capitalize' }}>{c.type}</span></td>
                      <td>
                        <span className={`bg ${statusColor[c.status] || 'draft'}`} style={{ textTransform: 'capitalize' }}>{c.status}</span>
                      </td>
                      <td style={{ color: '#999', fontSize: 12 }}>{c.scheduledFor ? new Date(c.scheduledFor).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TEMPLATES */}
      {view === 'templates' && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          {templates.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>
              No templates available yet — DS360 will publish templates here.
            </div>
          ) : (
            <div style={{ padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 14 }}>
              {templates.map((t: any) => (
                <div key={t.id} style={{ border: '1px solid var(--border)', borderRadius: 10, padding: '14px 16px' }}>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{t.name}</div>
                  <div style={{ fontSize: 11, color: '#888', marginBottom: 8 }}><span className="bg submitted" style={{ fontSize: 10, textTransform: 'capitalize' }}>{t.type}</span></div>
                  {t.subject && <div style={{ fontSize: 12, color: '#555', marginBottom: 10, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject}</div>}
                  <button className="btn btn-o btn-sm" onClick={() => { setForm(f => ({ ...f, templateId: t.id, name: t.name, type: t.type, subject: t.subject || '' })); setView('new-campaign'); }}>
                    Use Template
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* NEW CAMPAIGN */}
      {view === 'new-campaign' && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px', maxWidth: 600 }}>
          <div className="pn-h"><span className="pn-t">New Campaign</span></div>
          <div className="form-grid">
            <div className="form-group">
              <label>Campaign Name <span style={{ color: '#dc2626' }}>*</span></label>
              <input placeholder="e.g. Spring Sale Promo" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                <option value="email">Email</option>
                <option value="sms">SMS</option>
                <option value="in-app">In-App</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Template</label>
              <select value={form.templateId} onChange={e => setForm(f => ({ ...f, templateId: e.target.value }))}>
                <option value="">None (custom)</option>
                {templates.map(t => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label>Subject Line</label>
              <input placeholder="Email subject or notification title" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="form-group full">
              <label>Message</label>
              <textarea placeholder="Campaign body…" value={form.body} onChange={e => setForm(f => ({ ...f, body: e.target.value }))} style={{ minHeight: 100 }} />
            </div>
            <div className="form-group">
              <label>Schedule Date (optional)</label>
              <input type="date" value={form.scheduledFor} onChange={e => setForm(f => ({ ...f, scheduledFor: e.target.value }))} />
            </div>
          </div>
          {feedback && (
            <div style={{ padding: '0 20px 8px', fontSize: 13, color: feedback.includes('✓') ? '#0cb22c' : '#dc2626' }}>{feedback}</div>
          )}
          <div className="btn-bar">
            <button className="btn btn-p" onClick={handleCreate} disabled={saving}>{saving ? 'Creating…' : 'Create Campaign'}</button>
            <button className="btn btn-o" style={{ marginLeft: 8 }} onClick={() => setView('campaigns')}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
