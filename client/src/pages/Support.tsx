import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';

const CATEGORIES = ['Technical Issue', 'Billing Question', 'Claim Status', 'Account Access', 'Feature Request', 'Other'];

const PRIORITY_STYLE: Record<string, string> = {
  low: '#6b7280', medium: '#d97706', high: '#dc2626', urgent: '#7c3aed',
};

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric' });
}

export default function Support() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const [tickets, setTickets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [view, setView] = useState<'list' | 'new'>('list');
  const [saving, setSaving] = useState(false);
  const [feedback, setFeedback] = useState('');
  const [form, setForm] = useState({ subject: '', category: CATEGORIES[0], priority: 'medium', body: '' });

  const load = () => {
    apiFetch<any>('/api/tickets?type=support')
      .then(d => setTickets(Array.isArray(d) ? d : d.tickets || []))
      .catch(() => setTickets([]))
      .finally(() => setLoading(false));
  };

  useEffect(() => { load(); }, []);

  const handleSubmit = async () => {
    if (!form.subject.trim() || !form.body.trim()) {
      setFeedback('Subject and description are required.');
      return;
    }
    setSaving(true);
    setFeedback('');
    try {
      await apiFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({
          subject: form.subject,
          category: form.category,
          priority: form.priority,
          body: form.body,
          type: 'support',
          dealershipId: user?.dealershipId,
        }),
      });
      setFeedback('Ticket submitted successfully.');
      setForm({ subject: '', category: CATEGORIES[0], priority: 'medium', body: '' });
      load();
      setTimeout(() => { setView('list'); setFeedback(''); }, 1000);
    } catch (e: any) {
      setFeedback(e?.message || 'Failed to submit ticket.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page active">
      <div className="tabs" style={{ marginBottom: 0 }}>
        <div className={`tab ${view === 'list' ? 'active' : ''}`} onClick={() => setView('list')}>My Tickets</div>
        <div className={`tab ${view === 'new' ? 'active' : ''}`} onClick={() => setView('new')}>+ New Ticket</div>
      </div>

      {view === 'list' && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px' }}>
          {loading && <div style={{ padding: 40, textAlign: 'center', color: '#888' }}>Loading…</div>}
          {!loading && tickets.length === 0 && (
            <div style={{ padding: '40px 20px', textAlign: 'center' }}>
              <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#d1d5db" strokeWidth="1.5" style={{ marginBottom: 12 }}>
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
              <div style={{ fontSize: 14, color: '#888', marginBottom: 16 }}>No support tickets yet.</div>
              <button className="btn btn-p" onClick={() => setView('new')}>Open a Support Ticket</button>
            </div>
          )}
          {!loading && tickets.length > 0 && (
            <div className="tw">
              <table>
                <thead>
                  <tr><th>#</th><th>Subject</th><th>Category</th><th>Priority</th><th>Status</th><th>Created</th></tr>
                </thead>
                <tbody>
                  {tickets.map((t: any) => (
                    <tr key={t.id} style={{ cursor: 'pointer' }} onClick={() => navigate(`/support/${t.id}`)}>
                      <td style={{ fontFamily: 'monospace', fontSize: 12 }}>{t.ticketNumber || t.id.slice(0, 8).toUpperCase()}</td>
                      <td style={{ fontWeight: 500 }}>{t.subject}</td>
                      <td style={{ fontSize: 12, color: '#555' }}>{t.category || '—'}</td>
                      <td>
                        <span style={{ fontSize: 11, fontWeight: 600, color: PRIORITY_STYLE[t.priority] || '#6b7280' }}>
                          {t.priority ? t.priority.charAt(0).toUpperCase() + t.priority.slice(1) : '—'}
                        </span>
                      </td>
                      <td>
                        <span className={`bg ${t.status === 'open' ? 'pending' : t.status === 'resolved' ? 'pay-recv' : 'submitted'}`} style={{ fontSize: 11 }}>
                          {t.status ? t.status.charAt(0).toUpperCase() + t.status.slice(1) : 'Open'}
                        </span>
                      </td>
                      <td style={{ fontSize: 12, color: '#9ca3af' }}>{fmtDate(t.createdAt)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {view === 'new' && (
        <div className="pn" style={{ borderTop: 'none', borderRadius: '0 0 8px 8px', maxWidth: 620 }}>
          <div className="pn-h"><span className="pn-t">Open a Support Ticket</span></div>
          <div className="form-grid">
            <div className="form-group full">
              <label>Subject <span style={{ color: '#dc2626' }}>*</span></label>
              <input
                placeholder="Briefly describe your issue"
                value={form.subject}
                onChange={e => setForm(f => ({ ...f, subject: e.target.value }))}
              />
            </div>
            <div className="form-group">
              <label>Category</label>
              <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                {CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={form.priority} onChange={e => setForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Description <span style={{ color: '#dc2626' }}>*</span></label>
              <textarea
                placeholder="Describe your issue in detail. Include any error messages, steps to reproduce, and what you expected to happen."
                value={form.body}
                onChange={e => setForm(f => ({ ...f, body: e.target.value }))}
                style={{ minHeight: 120 }}
              />
            </div>
          </div>
          {feedback && (
            <div style={{ padding: '0 20px 8px', fontSize: 13, color: feedback.includes('success') ? '#0cb22c' : '#dc2626' }}>
              {feedback}
            </div>
          )}
          <div className="btn-bar">
            <button className="btn btn-p" onClick={handleSubmit} disabled={saving}>{saving ? 'Submitting…' : 'Submit Ticket'}</button>
            <button className="btn btn-o" onClick={() => setView('list')} style={{ marginLeft: 8 }}>Cancel</button>
          </div>
        </div>
      )}
    </div>
  );
}
