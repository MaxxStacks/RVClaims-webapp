import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch } from '@/lib/api';

const TEMPLATE_TYPES = ['email', 'sms', 'in-app', 'landing-page'];
const CAMPAIGN_STATUSES = ['draft', 'scheduled', 'sent', 'cancelled'];

export default function CampaignTemplates() {
  const { user } = useAuth();
  const isOpAdmin = user?.role === 'operator_admin';

  const [view, setView] = useState<'templates' | 'campaigns' | 'new-template'>('templates');
  const [templates, setTemplates] = useState<any[]>([]);
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');

  const [form, setForm] = useState({ name: '', type: 'email', subject: '', bodyText: '' });
  const [editId, setEditId] = useState<string | null>(null);

  const loadTemplates = () =>
    apiFetch<any>('/api/marketing/templates').then(d => setTemplates(d.templates || [])).catch(() => {});

  const loadCampaigns = () =>
    apiFetch<any>('/api/marketing/campaigns').then(d => setCampaigns(d.campaigns || [])).catch(() => {});

  useEffect(() => {
    setLoading(true);
    Promise.all([loadTemplates(), loadCampaigns()]).finally(() => setLoading(false));
  }, []);

  const handleSaveTemplate = async () => {
    if (!form.name || !form.type) return;
    setSaving(true);
    setFeedback('');
    try {
      if (editId) {
        await apiFetch(`/api/marketing/templates/${editId}`, { method: 'PATCH', body: JSON.stringify(form) });
      } else {
        await apiFetch('/api/marketing/templates', { method: 'POST', body: JSON.stringify(form) });
      }
      setFeedback('Saved ✓');
      setForm({ name: '', type: 'email', subject: '', bodyText: '' });
      setEditId(null);
      await loadTemplates();
      setTimeout(() => { setView('templates'); setFeedback(''); }, 800);
    } catch (e: any) {
      setFeedback(e?.message || 'Failed to save.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    try {
      await apiFetch(`/api/marketing/templates/${id}`, { method: 'DELETE' });
      await loadTemplates();
    } catch {}
  };

  const startEdit = (tpl: any) => {
    setForm({ name: tpl.name, type: tpl.type, subject: tpl.subject || '', bodyText: tpl.bodyText || '' });
    setEditId(tpl.id);
    setView('new-template');
  };

  if (loading) return <div className="page active" style={{ padding: 40, color: '#888', fontSize: 13 }}>Loading…</div>;

  return (
    <div className="page active">
      <div className="tabs" style={{ marginBottom: 0 }}>
        <div className={`tab ${view === 'templates' ? 'active' : ''}`} onClick={() => setView('templates')}>Templates</div>
        <div className={`tab ${view === 'campaigns' ? 'active' : ''}`} onClick={() => setView('campaigns')}>Campaigns</div>
        {isOpAdmin && <div className={`tab ${view === 'new-template' ? 'active' : ''}`} onClick={() => { setEditId(null); setForm({ name: '', type: 'email', subject: '', bodyText: '' }); setView('new-template'); }}>+ New Template</div>}
      </div>

      {/* TEMPLATES */}
      {view === 'templates' && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          <div className="tw">
            <table>
              <thead>
                <tr><th>Name</th><th>Type</th><th>Subject</th><th>Created</th>{isOpAdmin && <th>Actions</th>}</tr>
              </thead>
              <tbody>
                {templates.length === 0
                  ? <tr><td colSpan={isOpAdmin ? 5 : 4} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No templates yet{isOpAdmin ? ' — create the first one above' : ''}</td></tr>
                  : templates.map((t: any) => (
                    <tr key={t.id}>
                      <td style={{ fontWeight: 500 }}>{t.name}</td>
                      <td><span className="bg submitted" style={{ textTransform: 'capitalize' }}>{t.type}</span></td>
                      <td style={{ color: '#666', maxWidth: 260, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{t.subject || '—'}</td>
                      <td style={{ color: '#999', fontSize: 12 }}>{t.createdAt ? new Date(t.createdAt).toLocaleDateString() : '—'}</td>
                      {isOpAdmin && (
                        <td style={{ whiteSpace: 'nowrap' }}>
                          <button className="btn btn-o btn-sm" style={{ marginRight: 6 }} onClick={() => startEdit(t)}>Edit</button>
                          <button className="btn btn-d btn-sm" onClick={() => handleDelete(t.id)}>Delete</button>
                        </td>
                      )}
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CAMPAIGNS */}
      {view === 'campaigns' && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          <div className="tw">
            <table>
              <thead>
                <tr><th>#</th><th>Name</th><th>Type</th><th>Status</th><th>Dealership</th><th>Scheduled</th></tr>
              </thead>
              <tbody>
                {campaigns.length === 0
                  ? <tr><td colSpan={6} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No campaigns yet</td></tr>
                  : campaigns.map((c: any) => (
                    <tr key={c.id}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{c.campaignNumber}</td>
                      <td style={{ fontWeight: 500 }}>{c.name}</td>
                      <td><span className="bg submitted" style={{ textTransform: 'capitalize' }}>{c.type}</span></td>
                      <td>
                        <span className={`bg ${c.status === 'sent' ? 'pay-recv' : c.status === 'scheduled' ? 'submitted' : c.status === 'cancelled' ? 'denied' : 'draft'}`} style={{ textTransform: 'capitalize' }}>
                          {c.status}
                        </span>
                      </td>
                      <td style={{ color: '#666', fontSize: 12 }}>{c.dealershipId?.slice(0, 8)}…</td>
                      <td style={{ color: '#999', fontSize: 12 }}>{c.scheduledFor ? new Date(c.scheduledFor).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))
                }
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* NEW / EDIT TEMPLATE */}
      {view === 'new-template' && isOpAdmin && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px', maxWidth: 640 }}>
          <div className="pn-h"><span className="pn-t">{editId ? 'Edit Template' : 'New Template'}</span></div>
          <div className="form-grid">
            <div className="form-group">
              <label>Template Name <span style={{ color: '#dc2626' }}>*</span></label>
              <input placeholder="e.g. Welcome Email" value={form.name} onChange={e => setForm(f => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={form.type} onChange={e => setForm(f => ({ ...f, type: e.target.value }))}>
                {TEMPLATE_TYPES.map(t => <option key={t} value={t} style={{ textTransform: 'capitalize' }}>{t}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label>Subject Line</label>
              <input placeholder="Email subject or notification title" value={form.subject} onChange={e => setForm(f => ({ ...f, subject: e.target.value }))} />
            </div>
            <div className="form-group full">
              <label>Body Text</label>
              <textarea placeholder="Message content…" value={form.bodyText} onChange={e => setForm(f => ({ ...f, bodyText: e.target.value }))} style={{ minHeight: 120 }} />
            </div>
          </div>
          {feedback && <div style={{ padding: '0 20px 8px', fontSize: 13, color: feedback.includes('✓') ? '#0cb22c' : '#dc2626' }}>{feedback}</div>}
          <div className="btn-bar">
            <button className="btn btn-p" onClick={handleSaveTemplate} disabled={saving}>{saving ? 'Saving…' : (editId ? 'Update Template' : 'Create Template')}</button>
            <button className="btn btn-o" style={{ marginLeft: 8 }} onClick={() => { setView('templates'); setEditId(null); setForm({ name: '', type: 'email', subject: '', bodyText: '' }); }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
