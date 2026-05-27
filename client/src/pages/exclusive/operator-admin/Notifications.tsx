import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function Notifications() {
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [notifSending, setNotifSending] = useState(false);
  const [notifForm, setNotifForm] = useState({
    recipients: 'all', type: 'general', title: '', message: '',
    priority: 'normal', delivery: 'push', schedule: 'immediate',
  });
  const [sentHistory, setSentHistory] = useState<any[]>([]);
  const [historyLoading, setHistoryLoading] = useState(true);
  const [sendFeedback, setSendFeedback] = useState<'sent' | 'error' | ''>('');

  useEffect(() => {
    apiFetch<any>('/api/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
    apiFetch<any>('/api/notifications?type=sent')
      .then(d => setSentHistory(Array.isArray(d) ? d : (d?.notifications || [])))
      .catch(() => {})
      .finally(() => setHistoryLoading(false));
  }, []);

  const handleSend = async () => {
    if (!notifForm.title || !notifForm.message) return;
    setNotifSending(true);
    setSendFeedback('');
    try {
      await apiFetch('/api/notifications', { method: 'POST', body: JSON.stringify(notifForm) });
      setNotifForm({ recipients: 'all', type: 'general', title: '', message: '', priority: 'normal', delivery: 'push', schedule: 'immediate' });
      setSendFeedback('sent');
      apiFetch<any>('/api/notifications?type=sent')
        .then(d => setSentHistory(Array.isArray(d) ? d : (d?.notifications || [])))
        .catch(() => {});
    } catch {
      setSendFeedback('error');
    } finally {
      setNotifSending(false);
      setTimeout(() => setSendFeedback(''), 3000);
    }
  };

  const recipientLabel = (r: string) => {
    const map: Record<string, string> = { all: 'All Dealers', active: 'All Active', plan_a: 'Plan A', plan_b: 'Plan B' };
    return map[r] || r;
  };

  const deliveryLabel = (d: string) => {
    const map: Record<string, string> = { push: 'Push', push_email: 'Push + Email', email: 'Email' };
    return map[d] || d;
  };

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.4fr', gap: 20 }}>
        <div className="pn">
          <div className="pn-h"><span className="pn-t">Compose Notification</span></div>
          <div className="form-grid">
            <div className="form-group full">
              <label>Recipients</label>
              <select value={notifForm.recipients} onChange={e => setNotifForm(f => ({ ...f, recipients: e.target.value }))}>
                <option value="all">All Dealers</option>
                <option value="active">All Active Dealers</option>
                <option value="plan_a">Plan A Dealers</option>
                <option value="plan_b">Plan B Dealers</option>
                {opDealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
              </select>
            </div>
            <div className="form-group full">
              <label>Type</label>
              <select value={notifForm.type} onChange={e => setNotifForm(f => ({ ...f, type: e.target.value }))}>
                <option value="general">General Announcement</option>
                <option value="service">Service Update</option>
                <option value="billing">Billing Reminder</option>
                <option value="feature">New Feature</option>
                <option value="maintenance">Maintenance Notice</option>
                <option value="urgent">Urgent Alert</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Title</label>
              <input placeholder="Notification title..." value={notifForm.title} onChange={e => setNotifForm(f => ({ ...f, title: e.target.value }))} />
            </div>
            <div className="form-group full">
              <label>Message</label>
              <textarea placeholder="Write your message..." style={{ minHeight: 120 }} value={notifForm.message} onChange={e => setNotifForm(f => ({ ...f, message: e.target.value }))}></textarea>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={notifForm.priority} onChange={e => setNotifForm(f => ({ ...f, priority: e.target.value }))}>
                <option value="normal">Normal</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Delivery</label>
              <select value={notifForm.delivery} onChange={e => setNotifForm(f => ({ ...f, delivery: e.target.value }))}>
                <option value="push">Push to Dashboard</option>
                <option value="push_email">Push + Email</option>
                <option value="email">Email Only</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Schedule</label>
              <select value={notifForm.schedule} onChange={e => setNotifForm(f => ({ ...f, schedule: e.target.value }))}>
                <option value="immediate">Send Immediately</option>
                <option value="scheduled">Schedule for Later</option>
              </select>
            </div>
          </div>
          {sendFeedback === 'sent' && <div style={{ padding: '0 20px 12px', color: '#0cb22c', fontSize: 13 }}>Notification sent successfully.</div>}
          {sendFeedback === 'error' && <div style={{ padding: '0 20px 12px', color: '#dc2626', fontSize: 13 }}>Failed to send. Please try again.</div>}
          <div className="btn-bar">
            <button className="btn btn-p" onClick={handleSend} disabled={notifSending}>{notifSending ? 'Sending…' : 'Send Notification'}</button>
            <button className="btn btn-o">Save Draft</button>
          </div>
        </div>

        <div className="pn">
          <div className="pn-h"><span className="pn-t">Sent History</span></div>
          <div className="tw">
            <table>
              <thead>
                <tr><th>Date / Time</th><th>Recipient</th><th>Channel</th><th>Subject</th><th>Status</th></tr>
              </thead>
              <tbody>
                {historyLoading ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 20 }}>Loading…</td></tr>
                ) : sentHistory.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', color: '#888', padding: 20 }}>No notifications sent yet</td></tr>
                ) : sentHistory.map((n: any, i: number) => (
                  <tr key={n.id || i}>
                    <td style={{ whiteSpace: 'nowrap', color: 'var(--text-muted)', fontSize: 12 }}>
                      {n.createdAt ? new Date(n.createdAt).toLocaleString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }) : '—'}
                    </td>
                    <td>{recipientLabel(n.recipients || n.recipient || '')}</td>
                    <td>{deliveryLabel(n.delivery || n.channel || '')}</td>
                    <td style={{ maxWidth: 220, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.title || n.subject || '—'}</td>
                    <td><span className="bg" style={{ background: '#f0fdf4', color: '#16a34a' }}>Sent</span></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </div>
  );
}
