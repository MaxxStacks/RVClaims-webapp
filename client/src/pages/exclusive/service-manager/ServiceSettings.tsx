import { useState } from 'react';

export default function ServiceSettings() {
  const [toast, setToast] = useState('');
  const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(''), 2800); };

  const [smsEnabled, setSmsEnabled] = useState(false);
  const [autoConfirm, setAutoConfirm] = useState(false);
  const [reminderHours, setReminderHours] = useState('24');
  const [maxPerDay, setMaxPerDay] = useState('8');

  return (
    <div className="page active">
      <div style={{ maxWidth: 680 }}>
        <div className="pn" style={{ marginBottom: 20 }}>
          <div className="pn-h"><span className="pn-t">Appointment Settings</span></div>
          <div className="form-grid" style={{ padding: '16px 20px' }}>
            <div className="form-group">
              <label>Max Appointments Per Day</label>
              <input type="number" value={maxPerDay} onChange={e => setMaxPerDay(e.target.value)} min="1" max="50" />
            </div>
            <div className="form-group">
              <label>Reminder Lead Time (hours)</label>
              <input type="number" value={reminderHours} onChange={e => setReminderHours(e.target.value)} min="1" max="72" />
            </div>
            <div className="form-group full">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={autoConfirm} onChange={e => setAutoConfirm(e.target.checked)} style={{ width: 16, height: 16 }} />
                <span>Auto-confirm new appointment requests (no manual review)</span>
              </label>
            </div>
            <div className="form-group full">
              <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer' }}>
                <input type="checkbox" checked={smsEnabled} onChange={e => setSmsEnabled(e.target.checked)} style={{ width: 16, height: 16 }} />
                <span>Enable SMS reminders to customers (coming in v2.3)</span>
              </label>
            </div>
          </div>
          <div className="btn-bar">
            <button className="btn btn-p" onClick={() => showToast('Settings saved')}>Save Settings</button>
          </div>
        </div>

        <div className="pn">
          <div className="pn-h"><span className="pn-t">Technician Portal Settings</span></div>
          <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', gap: 12 }}>
            <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Time tracking</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Technicians log hours directly against work orders. Review in the Work Orders section.</div>
            </div>
            <div style={{ padding: '14px 16px', background: '#f8fafc', borderRadius: 8, border: '1px solid #e2e8f0' }}>
              <div style={{ fontSize: 13, fontWeight: 600, color: '#1e293b', marginBottom: 4 }}>Route assignment</div>
              <div style={{ fontSize: 12, color: '#64748b' }}>Assign work orders to technicians via Tech Assignments. GPS route optimization coming in v2.3.</div>
            </div>
            <div style={{ padding: '14px 16px', background: '#ede9fe', borderRadius: 8, border: '1px solid #ddd6fe' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                <div style={{ fontSize: 12, color: '#6d28d9' }}>Mobile app for technicians with GPS, photo capture, and parts requests launches in v2.3.</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      {toast && (
        <div style={{ position: 'fixed', bottom: 24, right: 24, background: '#1e293b', color: '#fff', padding: '10px 18px', borderRadius: 8, fontSize: 13, fontWeight: 500, zIndex: 9999, boxShadow: '0 4px 16px rgba(0,0,0,0.18)' }}>
          {toast}
        </div>
      )}
    </div>
  );
}
