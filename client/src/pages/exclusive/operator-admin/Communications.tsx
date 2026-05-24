import { useState } from 'react';

export default function Communications() {
  const [recipients, setRecipients] = useState('All Dealers');
  const [channel, setChannel] = useState('In-App + Email');
  const [msgType, setMsgType] = useState('General Announcement');
  const [priority, setPriority] = useState('Normal');
  const [subject, setSubject] = useState('');
  const [body, setBody] = useState('');


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
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', padding: '40px 20px', color: 'var(--text-muted)', gap: 10 }}>
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.95 11.5 19.79 19.79 0 01.88 2.81 2 2 0 012.86.66h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L7.09 8.35a16 16 0 006.29 6.29l1.01-.97a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 15.92z"/>
            </svg>
            <div style={{ fontSize: 13 }}>No recent broadcasts</div>
            <div style={{ fontSize: 12 }}>Messages sent to dealers will appear here</div>
          </div>
        </div>
      </div>
    </div>
  );
}
