import { useState } from 'react';

export default function Settings() {
  const [settingsTab, setSettingsTab] = useState('stab-s-profile');
  const [settingsSaved, setSettingsSaved] = useState('');

  const saveSettings = (tab: string) => {
    setSettingsSaved(tab);
    setTimeout(() => setSettingsSaved(''), 2000);
  };

  function updateOpProfile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => {
      const el = document.getElementById('op-profile-avatar');
      if (el && ev.target?.result) { el.style.backgroundImage = `url(${ev.target.result})`; el.textContent = ''; }
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24}}>
        <div>
          <div className={`settings-link${settingsTab === 'stab-s-profile' ? ' active' : ''}`} onClick={() => setSettingsTab('stab-s-profile')}>My Profile</div>
          <div className={`settings-link${settingsTab === 'stab-s-general' ? ' active' : ''}`} onClick={() => setSettingsTab('stab-s-general')}>General</div>
          <div className={`settings-link${settingsTab === 'stab-s-fees' ? ' active' : ''}`} onClick={() => setSettingsTab('stab-s-fees')}>Claim Fee Defaults</div>
          <div className={`settings-link${settingsTab === 'stab-s-billing' ? ' active' : ''}`} onClick={() => setSettingsTab('stab-s-billing')}>Billing Configuration</div>
          <div className={`settings-link${settingsTab === 'stab-s-notif' ? ' active' : ''}`} onClick={() => setSettingsTab('stab-s-notif')}>Notifications</div>
          <div className={`settings-link${settingsTab === 'stab-s-integrations' ? ' active' : ''}`} onClick={() => setSettingsTab('stab-s-integrations')}>Integrations</div>
          <div className={`settings-link${settingsTab === 'stab-s-security' ? ' active' : ''}`} onClick={() => setSettingsTab('stab-s-security')}>Security</div>
        </div>
        <div>
          <div style={{display: settingsTab === 'stab-s-profile' ? 'block' : 'none'}} className="pn"><div className="pn-h"><span className="pn-t">My Profile</span></div>
            <div style={{padding: '24px 20px', display: 'flex', gap: 24, alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0'}}>
              <div style={{textAlign: 'center'}}>
                <div id="op-profile-avatar" style={{width: 80, height: 80, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8, overflow: 'hidden'}}>JD</div>
                <input type="file" id="op-profile-input" accept="image/*" style={{display: 'none'}} onChange={updateOpProfile} />
                <button className="btn btn-o btn-sm" onClick={() => document.getElementById('op-profile-input')?.click()}>Change Photo</button>
              </div>
              <div style={{flex: 1}}><div style={{fontSize: 16, fontWeight: 600, marginBottom: 2}}>Jonathan Delorme</div><div style={{fontSize: 13, color: '#888'}}>Operator Admin · Dealer Suite 360</div></div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>First Name</label><input defaultValue="Jonathan" /></div>
              <div className="form-group"><label>Last Name</label><input defaultValue="Delorme" /></div>
              <div className="form-group"><label>Email</label><input defaultValue="jonathan@dealersuite360.com" /></div>
              <div className="form-group"><label>Phone</label><input defaultValue="(514) 555-0100" /></div>
              <div className="form-group"><label>Role</label><input defaultValue="Operator Admin" readOnly style={{background: '#f3f4f6', color: '#888'}} /></div>
              <div className="form-group"><label>Timezone</label><select><option>Eastern (ET)</option><option>Central</option><option>Mountain</option><option>Pacific</option></select></div>
            </div>
            <div className="btn-bar"><button className="btn btn-p" onClick={() => saveSettings('profile')}>{settingsSaved === 'profile' ? 'Saved ✓' : 'Save Profile'}</button><button className="btn btn-o">Cancel</button></div>
          </div>

          <div style={{display: settingsTab === 'stab-s-general' ? 'block' : 'none'}} className="pn"><div className="pn-h"><span className="pn-t">General Settings</span></div><div className="form-grid">
            <div className="form-group"><label>Platform Name</label><input defaultValue="Dealer Suite 360" /></div>
            <div className="form-group"><label>Support Email</label><input defaultValue="support@dealersuite360.com" /></div>
            <div className="form-group"><label>Support Phone</label><input defaultValue="(888) 443-2204" /></div>
            <div className="form-group"><label>Default Language</label><select><option>English</option><option>French</option></select></div>
            <div className="form-group"><label>Currency</label><select><option>CAD ($)</option><option>USD ($)</option></select></div>
            <div className="form-group"><label>Timezone</label><select><option>Eastern</option><option>Central</option><option>Mountain</option><option>Pacific</option></select></div>
            <div className="form-group"><label>Stale Claim Threshold (hrs)</label><input defaultValue="36" type="number" /></div>
            <div className="form-group"><label>Platform URL</label><input defaultValue="https://dealersuite360.com" /></div>
          </div><div className="btn-bar"><button className="btn btn-p" onClick={() => saveSettings('general')}>{settingsSaved === 'general' ? 'Saved ✓' : 'Save'}</button><button className="btn btn-o">Reset</button></div></div>

          <div style={{display: settingsTab === 'stab-s-fees' ? 'block' : 'none'}} className="pn"><div className="pn-h"><span className="pn-t">Claim Fee Defaults</span><span style={{fontSize: 12, color: '#888'}}>Platform defaults. Override per dealer.</span></div><div className="form-grid">
            <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Claim Processing Fee</label></div>
            <div className="form-group"><label>Default Fee Type</label><select><option>Percentage of approved amount</option><option>Flat fee per claim</option></select></div>
            <div className="form-group"><label>Default Rate (%)</label><input defaultValue="10" type="number" /></div>
            <div className="form-group"><label>Minimum Fee</label><input defaultValue="$50.00" /></div>
            <div className="form-group"><label>Maximum Fee Cap</label><input defaultValue="$500.00" /></div>
            <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Inspection Fees</label></div>
            <div className="form-group"><label>DAF Inspection Fee</label><input defaultValue="$25.00" /></div>
            <div className="form-group"><label>PDI Processing Fee</label><input defaultValue="$15.00" /></div>
            <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Fee Billing Rules</label></div>
            <div className="form-group"><label>When to Invoice</label><select><option>Auto on claim close</option><option>Manual only</option><option>Monthly batch</option></select></div>
          </div><div className="btn-bar"><button className="btn btn-p" onClick={() => saveSettings('fees')}>{settingsSaved === 'fees' ? 'Saved ✓' : 'Save'}</button><button className="btn btn-o">Reset to Defaults</button></div></div>

          <div style={{display: settingsTab === 'stab-s-billing' ? 'block' : 'none'}} className="pn"><div className="pn-h"><span className="pn-t">Billing Configuration</span></div><div className="form-grid">
            <div className="form-group"><label>Default Tax Rate</label><select><option>HST 13% (Ontario)</option><option>GST 5%</option><option>GST 5% + QST 9.975% (Quebec)</option></select></div>
            <div className="form-group"><label>Tax Registration #</label><input defaultValue="RT 0001" placeholder="HST/GST number" /></div>
            <div className="form-group"><label>Payment Processor</label><select><option>Stripe</option><option>Manual / Offline</option></select></div>
            <div className="form-group"><label>Stripe Mode</label><select><option>Test Mode</option><option>Live Mode</option></select></div>
            <div className="form-group"><label>Stripe Public Key</label><input defaultValue="pk_live_****" readOnly style={{background: '#f3f4f6'}} /></div>
            <div className="form-group"><label>Default Payment Terms</label><select><option>On Receipt</option><option>Net 15</option><option>Net 30</option></select></div>
            <div className="form-group"><label>Invoice Prefix</label><input defaultValue="INV-" /></div>
            <div className="form-group"><label>Next Invoice #</label><input defaultValue="0090" type="number" /></div>
            <div className="form-group full"><label>Invoice Footer / Terms</label><textarea defaultValue="Payment is due within 15 days of invoice date. Late payments may incur a 2% monthly service charge."></textarea></div>
          </div><div className="btn-bar"><button className="btn btn-p" onClick={() => saveSettings('billing')}>{settingsSaved === 'billing' ? 'Saved ✓' : 'Save'}</button><button className="btn btn-o">Reset</button></div></div>

          <div style={{display: settingsTab === 'stab-s-notif' ? 'block' : 'none'}} className="pn"><div className="pn-h"><span className="pn-t">Notification Settings</span></div><div className="form-grid">
            <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Operator Notifications</label></div>
            <div className="form-group"><label>New photo batch uploaded</label><select><option>Push + Email</option><option>Push only</option><option>Off</option></select></div>
            <div className="form-group"><label>Claim status changed</label><select><option>Push + Email</option><option>Push only</option><option>Off</option></select></div>
            <div className="form-group"><label>Stale claim alert</label><select><option>Push + Email</option><option>Push only</option><option>Off</option></select></div>
            <div className="form-group"><label>New dealer signup</label><select><option>Push + Email</option><option>Push only</option><option>Off</option></select></div>
            <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Email Configuration</label></div>
            <div className="form-group"><label>From Name</label><input defaultValue="Dealer Suite 360" /></div>
            <div className="form-group"><label>Reply-To Email</label><input defaultValue="support@dealersuite360.com" /></div>
          </div><div className="btn-bar"><button className="btn btn-p" onClick={() => saveSettings('notif')}>{settingsSaved === 'notif' ? 'Saved ✓' : 'Save'}</button><button className="btn btn-o">Reset</button></div></div>

          <div style={{display: settingsTab === 'stab-s-integrations' ? 'block' : 'none'}} className="pn"><div className="pn-h"><span className="pn-t">Integrations</span></div>
            <div style={{padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
              <div className="svc-card"><div className="svc-icon" style={{background: '#eff6ff', color: '#3b82f6'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div className="svc-body"><div className="svc-title">Stripe</div><div className="svc-desc">Payment processing and billing</div><div className="svc-meta"><span className="bg active">Connected</span></div></div></div>
              <div className="svc-card"><div className="svc-icon" style={{background: '#fef2f2', color: '#dc2626'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div className="svc-body"><div className="svc-title">Gmail / SMTP</div><div className="svc-desc">Email sending for invoices and notifications</div><div className="svc-meta"><span className="bg active">Connected</span></div></div></div>
              <div className="svc-card"><div className="svc-icon" style={{background: '#faf5ff', color: '#a855f7'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/></svg></div><div className="svc-body"><div className="svc-title">Anthropic API (Claude)</div><div className="svc-desc">AI chatbot, FRC suggestions, document scanning</div><div className="svc-meta"><span className="bg active">Connected</span></div></div></div>
              <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#f0f4f8', color: '#64748b'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8"/></svg></div><div className="svc-body"><div className="svc-title">Tavus / D-ID</div><div className="svc-desc">AI F&I Video Presenter</div><div className="svc-meta"><span className="bg pending">Coming Soon</span></div></div></div>
            </div>
          </div>

          <div style={{display: settingsTab === 'stab-s-security' ? 'block' : 'none'}} className="pn"><div className="pn-h"><span className="pn-t">Security Settings</span></div><div className="form-grid">
            <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Authentication</label></div>
            <div className="form-group"><label>Require 2FA for Operators</label><select><option>Yes</option><option>No</option></select></div>
            <div className="form-group"><label>Require 2FA for Dealers</label><select><option>Yes</option><option>No — optional</option></select></div>
            <div className="form-group"><label>Session Timeout</label><select><option>30 minutes</option><option>2 hours</option><option>8 hours</option><option>24 hours</option></select></div>
            <div className="form-group"><label>Password Min Length</label><input defaultValue="8" type="number" /></div>
            <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Access Control</label></div>
            <div className="form-group"><label>Max Failed Login Attempts</label><input defaultValue="5" type="number" /></div>
            <div className="form-group"><label>Lockout Duration</label><select><option>15 minutes</option><option>30 minutes</option><option>1 hour</option></select></div>
            <div className="form-group"><label>Activity Logging</label><select><option>Full (all actions)</option><option>Admin actions only</option><option>Off</option></select></div>
            <div className="form-group"><label>Log Retention</label><select><option>30 days</option><option>90 days</option><option>1 year</option><option>Indefinite</option></select></div>
          </div><div className="btn-bar"><button className="btn btn-p" onClick={() => saveSettings('security')}>{settingsSaved === 'security' ? 'Saved ✓' : 'Save'}</button><button className="btn btn-o">Reset</button></div></div>
        </div>
      </div>
    </div>
  );
}
