import { useState, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

export default function Notifications() {
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [notifSending, setNotifSending] = useState(false);
  const [notifForm, setNotifForm] = useState({
    recipients: 'all', type: 'general', title: '', message: '',
    priority: 'normal', delivery: 'push', schedule: 'immediate'
  });

  useEffect(() => {
    apiFetch<any>('/api/v6/dealerships').then(d => setOpDealers(Array.isArray(d) ? d : [])).catch(() => {});
  }, []);

  const handleSendNotification = async () => {
    if (!notifForm.title || !notifForm.message) return;
    setNotifSending(true);
    try {
      await apiFetch('/api/notifications', { method: 'POST', body: JSON.stringify(notifForm) });
      setNotifForm({ recipients: 'all', type: 'general', title: '', message: '', priority: 'normal', delivery: 'push', schedule: 'immediate' });
    } catch {} finally {
      setNotifSending(false);
    }
  };

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
        <div className="pn"><div className="pn-h"><span className="pn-t">Compose Notification</span></div>
          <div className="form-grid">
            <div className="form-group full"><label>Recipients</label><select value={notifForm.recipients} onChange={e => setNotifForm(f => ({...f, recipients: e.target.value}))}><option value="all">All Dealers</option><option value="active">All Active Dealers</option><option value="plan_a">Plan A Dealers</option><option value="plan_b">Plan B Dealers</option>{opDealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}</select></div>
            <div className="form-group full"><label>Type</label><select value={notifForm.type} onChange={e => setNotifForm(f => ({...f, type: e.target.value}))}><option value="general">General Announcement</option><option value="service">Service Update</option><option value="billing">Billing Reminder</option><option value="feature">New Feature</option><option value="maintenance">Maintenance Notice</option><option value="urgent">Urgent Alert</option></select></div>
            <div className="form-group full"><label>Title</label><input placeholder="Notification title..." value={notifForm.title} onChange={e => setNotifForm(f => ({...f, title: e.target.value}))} /></div>
            <div className="form-group full"><label>Message</label><textarea placeholder="Write your message..." style={{minHeight: 120}} value={notifForm.message} onChange={e => setNotifForm(f => ({...f, message: e.target.value}))}></textarea></div>
            <div className="form-group"><label>Priority</label><select value={notifForm.priority} onChange={e => setNotifForm(f => ({...f, priority: e.target.value}))}><option value="normal">Normal</option><option value="high">High</option><option value="urgent">Urgent</option></select></div>
            <div className="form-group"><label>Delivery</label><select value={notifForm.delivery} onChange={e => setNotifForm(f => ({...f, delivery: e.target.value}))}><option value="push">Push to Dashboard</option><option value="push_email">Push + Email</option><option value="email">Email Only</option></select></div>
            <div className="form-group full"><label>Schedule</label><select value={notifForm.schedule} onChange={e => setNotifForm(f => ({...f, schedule: e.target.value}))}><option value="immediate">Send Immediately</option><option value="scheduled">Schedule for Later</option></select></div>
          </div><div className="btn-bar"><button className="btn btn-p" onClick={handleSendNotification} disabled={notifSending}>{notifSending ? 'Sending…' : 'Send Notification'}</button><button className="btn btn-o">Save Draft</button></div></div>
        <div className="pn"><div className="pn-h"><span className="pn-t">Sent History</span></div><div className="act">
          <div className="act-i"><span className="act-dot new"></span><div><div className="act-t"><strong>New: Photo Batch Upload</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Upload all photos at once for DAF, PDI, Warranty.</div><div className="act-tm">All Dealers · Mar 15 · Push + Email</div></div></div>
          <div className="act-i"><span className="act-dot pt"></span><div><div className="act-t"><strong>Billing: March Invoices</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>March subscription invoices generated.</div><div className="act-tm">All Active · Mar 1 · Push + Email</div></div></div>
          <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t"><strong>Financing Service Now Live</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Submit financing requests directly through the portal.</div><div className="act-tm">All Active · Feb 20 · Push + Email</div></div></div>
          <div className="act-i"><span className="act-dot pay"></span><div><div className="act-t"><strong>Warranty Plans Available</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Extended warranty plans now sold through the platform.</div><div className="act-tm">All Active · Feb 15 · Push + Email</div></div></div>
        </div></div>
      </div>
    </div>
  );
}
