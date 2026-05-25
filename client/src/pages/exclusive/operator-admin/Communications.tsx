import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

const TYPE_MAP: Record<string, string> = {
  'General Announcement': 'general',
  'Maintenance Alert': 'maintenance',
  'Feature Release': 'feature',
  'Billing Notice': 'billing',
  'Urgent': 'urgent',
};

const RECIPIENT_MAP: Record<string, string> = {
  'All Dealers': 'all',
  'Plan A Dealers': 'plan_a',
  'Plan B Dealers': 'plan_b',
};

export default function Communications() {
  const [recipients, setRecipients] = useState('All Dealers');
  const [channel, setChannel] = useState('In-App + Email');
  const [msgType, setMsgType] = useState('General Announcement');
  const [priority, setPriority] = useState('Normal');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');
  const [sending, setSending] = useState(false);
  const [feedback, setFeedback] = useState<{ ok: boolean; msg: string } | null>(null);

  const [broadcasts, setBroadcasts] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);

  useEffect(() => {
    apiFetch<any>('/api/notifications/broadcast-log')
      .then(d => setBroadcasts(d.broadcasts || []))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleSend = async () => {
    if (!subject || !body) {
      setFeedback({ ok: false, msg: 'Subject and message are required.' });
      return;
    }
    setSending(true);
    setFeedback(null);
    try {
      const recipientVal = RECIPIENT_MAP[recipients] || 'all';
      const typeVal = TYPE_MAP[msgType] || 'general';
      const result = await apiFetch<any>('/api/notifications', {
        method: 'POST',
        body: JSON.stringify({ title: subject, message: body, type: typeVal, recipients: recipientVal }),
      });
      setFeedback({ ok: true, msg: `Broadcast sent to ${result.sent ?? 'all'} recipients.` });
      setSubject('');
      setBody('');
      // Refresh history
      apiFetch<any>('/api/notifications/broadcast-log')
        .then(d => setBroadcasts(d.broadcasts || []))
        .catch(() => {});
    } catch (e: any) {
      setFeedback({ ok: false, msg: e?.message || 'Failed to send broadcast.' });
    } finally {
      setSending(false);
    }
  };

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="pn" style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Broadcast Message</div>
          <div className="form-grid" style={{ padding: 0 }}>
            <div className="form-group">
              <label>Recipients</label>
              <select value={recipients} onChange={e => setRecipients(e.target.value)}>
                <option>All Dealers</option>
                <option>Plan A Dealers</option>
                <option>Plan B Dealers</option>
              </select>
            </div>
            <div className="form-group">
              <label>Channel</label>
              <select value={channel} onChange={e => setChannel(e.target.value)}>
                <option>In-App + Email</option>
                <option>In-App Only</option>
                <option>Email Only</option>
                <option>SMS (coming soon)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={msgType} onChange={e => setMsgType(e.target.value)}>
                <option>General Announcement</option>
                <option>Maintenance Alert</option>
                <option>Feature Release</option>
                <option>Billing Notice</option>
                <option>Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option>Normal</option>
                <option>High</option>
                <option>Critical</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Subject</label>
              <input placeholder="Message subject..." value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="form-group full">
              <label>Message</label>
              <textarea placeholder="Write your broadcast message..." value={body} onChange={e => setBody(e.target.value)} style={{ minHeight: 100 }} />
            </div>
          </div>
          {feedback && (
            <div style={{ padding: '8px 0 4px', fontSize: 13, color: feedback.ok ? '#0cb22c' : '#dc2626' }}>{feedback.msg}</div>
          )}
          <div className="btn-bar" style={{ padding: '16px 0 0' }}>
            <button className="btn btn-p" onClick={handleSend} disabled={sending}>{sending ? 'Sending…' : 'Send Broadcast'}</button>
          </div>
        </div>

        <div className="pn" style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Recent Broadcasts</div>
          {historyLoading ? (
            <div style={{ color: '#888', fontSize: 13, padding: '20px 0' }}>Loading…</div>
          ) : broadcasts.length === 0 ? (
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: 'var(--text-muted)', gap: 10 }}>
              <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 11.5 19.79 19.79 0 01.88 2.81 2 2 0 012.86.66h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.35a16 16 0 006.29 6.29l1.01-.97a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.92z"/>
              </svg>
              <div style={{ fontSize: 13 }}>No recent broadcasts</div>
              <div style={{ fontSize: 12 }}>Messages sent to dealers will appear here</div>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {broadcasts.map((b: any) => (
                <div key={b.id} style={{ padding: '10px 14px', border: '1px solid var(--border)', borderRadius: 8, fontSize: 13 }}>
                  <div style={{ fontWeight: 600, marginBottom: 2 }}>{b.title}</div>
                  {b.message && <div style={{ color: '#666', fontSize: 12, marginBottom: 4, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{b.message}</div>}
                  <div style={{ display: 'flex', gap: 10, fontSize: 11, color: '#999' }}>
                    <span><span className="bg submitted" style={{ fontSize: 10 }}>{b.type}</span></span>
                    <span>{b.sent} recipients</span>
                    <span>{b.createdAt ? new Date(b.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
