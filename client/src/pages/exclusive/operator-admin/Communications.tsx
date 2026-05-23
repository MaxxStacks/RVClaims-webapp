import { useState } from 'react';

export default function Communications() {
  const [recipients, setRecipients] = useState('All Dealers');
  const [channel, setChannel] = useState('In-App + Email');
  const [msgType, setMsgType] = useState('General Announcement');
  const [priority, setPriority] = useState('Normal');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');

  const recentBroadcasts = [
    { title: 'TechFlow Work Orders Now Available', sent: 'Apr 24, 2026', recipients: 'All Dealers', type: 'Feature Release' },
    { title: 'Scheduled Maintenance — May 1, 2AM–4AM EST', sent: 'Apr 20, 2026', recipients: 'All Dealers', type: 'Maintenance Alert' },
    { title: 'Q1 Claims Report Ready for Download', sent: 'Apr 1, 2026', recipients: 'All Dealers', type: 'General' },
    { title: 'New Manufacturer: Columbia NW Added', sent: 'Mar 15, 2026', recipients: 'All Dealers', type: 'Feature Release' },
  ];

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20 }}>
        <div className="pn" style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Broadcast Message</div>
          <div className="form-grid" style={{ padding: 0 }}>
            <div className="form-group">
              <label>Recipients</label>
              <select value={recipients} onChange={e => setRecipients(e.target.value)}>
                <option>All Dealers</option><option>Plan A Dealers</option><option>Plan B Dealers</option><option>Specific Dealer</option>
              </select>
            </div>
            <div className="form-group">
              <label>Channel</label>
              <select value={channel} onChange={e => setChannel(e.target.value)}>
                <option>In-App + Email</option><option>In-App Only</option><option>Email Only</option><option>SMS (coming soon)</option>
              </select>
            </div>
            <div className="form-group">
              <label>Type</label>
              <select value={msgType} onChange={e => setMsgType(e.target.value)}>
                <option>General Announcement</option><option>Maintenance Alert</option><option>Feature Release</option><option>Billing Notice</option><option>Urgent</option>
              </select>
            </div>
            <div className="form-group">
              <label>Priority</label>
              <select value={priority} onChange={e => setPriority(e.target.value)}>
                <option>Normal</option><option>High</option><option>Critical</option>
              </select>
            </div>
            <div className="form-group full">
              <label>Subject</label>
              <input placeholder="Message subject..." value={subject} onChange={e => setSubject(e.target.value)} />
            </div>
            <div className="form-group full">
              <label>Message</label>
              <textarea placeholder="Write your broadcast message..." value={body} onChange={e => setBody(e.target.value)} style={{ minHeight: 100 }}></textarea>
            </div>
          </div>
          <div className="btn-bar" style={{ padding: '16px 0 0' }}>
            <button className="btn btn-p" onClick={() => alert('Broadcast sent')}>Send Broadcast</button>
            <button className="btn" style={{ marginLeft: 8 }}>Schedule</button>
          </div>
        </div>
        <div className="pn" style={{ padding: 24 }}>
          <div style={{ fontWeight: 600, fontSize: 14, marginBottom: 16 }}>Recent Broadcasts</div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
            {recentBroadcasts.map((b, i) => (
              <div key={i} style={{ padding: '10px 14px', border: '1px solid #f0f0f0', borderRadius: 8 }}>
                <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 4 }}>{b.title}</div>
                <div style={{ fontSize: 12, color: '#888' }}>{b.sent} &middot; {b.recipients} &middot; <span style={{ color: '#2563eb' }}>{b.type}</span></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
