import { useState } from 'react';

export default function DealerSettings() {
  const [tab, setTab] = useState<'ds-profile'|'ds-security'|'ds-dealership'|'ds-subscription'|'ds-notifpref'>('ds-profile');

  return (
    <div className="page active">
      <div style={{display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24}}>
        <div>
          <div style={{fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#bbb', fontWeight: 600, padding: '4px 0 8px'}}>Personal</div>
          <div className={`settings-link ${tab === 'ds-profile' ? 'active' : ''}`} onClick={() => setTab('ds-profile')}>My Profile</div>
          <div className={`settings-link ${tab === 'ds-security' ? 'active' : ''}`} onClick={() => setTab('ds-security')}>Security</div>
          <div style={{fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#bbb', fontWeight: 600, padding: '16px 0 8px', borderTop: '1px solid #f0f0f0', marginTop: 8}}>Dealership</div>
          <div className={`settings-link ${tab === 'ds-dealership' ? 'active' : ''}`} onClick={() => setTab('ds-dealership')}>Dealership Account</div>
          <div className={`settings-link ${tab === 'ds-subscription' ? 'active' : ''}`} onClick={() => setTab('ds-subscription')}>Subscription & Billing</div>
          <div className={`settings-link ${tab === 'ds-notifpref' ? 'active' : ''}`} onClick={() => setTab('ds-notifpref')}>Notification Preferences</div>
        </div>
        <div>

          {tab === 'ds-profile' && (
            <div className="pn">
              <div className="pn-h"><span className="pn-t">My Profile</span><span style={{fontSize: 12, color: '#888'}}>Your personal account settings</span></div>
              <div style={{padding: '24px 20px', display: 'flex', gap: 24, alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0'}}>
                <div style={{textAlign: 'center'}}>
                  <div style={{width: 80, height: 80, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8}}>MS</div>
                  <button className="btn btn-o btn-sm">Change Photo</button>
                </div>
                <div style={{flex: 1}}>
                  <div style={{fontSize: 16, fontWeight: 600, marginBottom: 2}}>Mike Smith</div>
                  <div style={{fontSize: 13, color: '#888', marginBottom: 4}}>Dealer Owner · Smith's RV Centre</div>
                  <div style={{fontSize: 12, color: '#aaa'}}>Last login: Just now · Chrome on Windows</div>
                </div>
              </div>
              <div className="form-grid">
                <div className="form-group"><label>First Name</label><input defaultValue="Mike" /></div>
                <div className="form-group"><label>Last Name</label><input defaultValue="Smith" /></div>
                <div className="form-group"><label>Email</label><input defaultValue="mike@smithsrv.ca" /></div>
                <div className="form-group"><label>Phone</label><input defaultValue="(905) 555-0123" /></div>
                <div className="form-group"><label>Role</label><input defaultValue="Dealer Owner" readOnly style={{background: '#f3f4f6', color: '#888'}} /></div>
                <div className="form-group"><label>Timezone</label><select defaultValue="Eastern"><option>Eastern (ET)</option><option>Central</option><option>Mountain</option><option>Pacific</option></select></div>
                <div className="form-group"><label>Language</label><select><option>English</option><option>French</option></select></div>
                <div className="form-group"><label>Date Format</label><select><option>MMM DD, YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></select></div>
                <div className="form-group full"><label>Bio</label><textarea placeholder="Optional bio..."></textarea></div>
              </div>
              <div className="btn-bar"><button className="btn btn-p" onClick={() => alert('Profile saved')}>Save Profile</button><button className="btn btn-o">Cancel</button></div>
            </div>
          )}

          {tab === 'ds-security' && (
            <div className="pn">
              <div className="pn-h"><span className="pn-t">Security</span></div>
              <div className="form-grid">
                <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Change Password</label></div>
                <div className="form-group"><label>Current Password</label><input type="password" placeholder="Current password" /></div>
                <div className="form-group"><label>&nbsp;</label></div>
                <div className="form-group"><label>New Password</label><input type="password" placeholder="New password" /></div>
                <div className="form-group"><label>Confirm Password</label><input type="password" placeholder="Confirm" /></div>
                <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Two-Factor Authentication</label></div>
                <div className="form-group"><label>2FA Status</label><div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 4}}><span className="bg pending">Not Enabled</span><button className="btn btn-o btn-sm" onClick={() => alert('2FA setup coming soon')}>Enable 2FA</button></div></div>
                <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Active Sessions</label></div>
                <div className="form-group full"><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5'}}><div><div style={{fontSize: 13, fontWeight: 500}}>Chrome on Windows</div><div style={{fontSize: 12, color: '#888'}}>Hamilton, ON · Current session</div></div><span className="bg active">Active</span></div><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0'}}><div><div style={{fontSize: 13, fontWeight: 500}}>Safari on iPhone</div><div style={{fontSize: 12, color: '#888'}}>Hamilton, ON · 2 days ago</div></div><button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => alert('Session revoked')}>Revoke</button></div></div>
              </div>
              <div className="btn-bar"><button className="btn btn-p" onClick={() => alert('Password updated')}>Update Password</button><button className="btn btn-o">Cancel</button></div>
            </div>
          )}

          {tab === 'ds-dealership' && (
            <div className="pn">
              <div className="pn-h"><span className="pn-t">Dealership Account</span><span style={{fontSize: 12, color: '#888'}}>Your dealership's business information</span></div>
              <div style={{padding: '12px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8}}>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
                Changes here are shared with your claims operator. Updated info will appear on invoices, claims, and communications.
              </div>
              <div className="form-grid">
                <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Business Information</label></div>
                <div className="form-group"><label>Dealership Name</label><input defaultValue="Smith's RV Centre" /></div>
                <div className="form-group"><label>Legal / Registered Name</label><input defaultValue="Smith's RV Centre Inc." /></div>
                <div className="form-group"><label>Business Email</label><input defaultValue="info@smithsrv.ca" /></div>
                <div className="form-group"><label>Business Phone</label><input defaultValue="(905) 555-0100" /></div>
                <div className="form-group"><label>Website</label><input defaultValue="https://smithsrv.ca" /></div>
                <div className="form-group"><label>Business Number (GST/HST)</label><input defaultValue="123456789 RT0001" /></div>
                <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Address</label></div>
                <div className="form-group"><label>Street Address</label><input defaultValue="1234 RV Parkway" /></div>
                <div className="form-group"><label>Suite / Unit</label><input placeholder="Optional" /></div>
                <div className="form-group"><label>City</label><input defaultValue="Hamilton" /></div>
                <div className="form-group"><label>Province</label><select defaultValue="Ontario"><option>Ontario</option><option>Quebec</option><option>British Columbia</option><option>Alberta</option><option>Manitoba</option></select></div>
                <div className="form-group"><label>Postal Code</label><input defaultValue="L8E 3B5" /></div>
                <div className="form-group"><label>Country</label><select><option>Canada</option><option>United States</option></select></div>
                <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Primary Contact</label></div>
                <div className="form-group"><label>Contact Name</label><input defaultValue="Mike Smith" /></div>
                <div className="form-group"><label>Contact Email</label><input defaultValue="mike@smithsrv.ca" /></div>
                <div className="form-group"><label>Contact Phone</label><input defaultValue="(905) 555-0123" /></div>
                <div className="form-group"><label>Position / Title</label><input defaultValue="Owner" /></div>
                <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Manufacturers</label></div>
                <div className="form-group full"><div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4}}>
                  <span className="mfr" style={{padding: '6px 12px', fontSize: 12}}>Jayco</span>
                  <span className="mfr" style={{padding: '6px 12px', fontSize: 12}}>Forest River</span>
                  <span className="mfr" style={{padding: '6px 12px', fontSize: 12, opacity: 0.4, border: '1px dashed #ccc', cursor: 'pointer'}} onClick={() => alert('Manufacturer added')}>+ Add manufacturer</span>
                </div></div>
              </div>
              <div className="btn-bar"><button className="btn btn-p" onClick={() => alert('Dealership info saved')}>Save Dealership Info</button><button className="btn btn-o">Cancel</button></div>
            </div>
          )}

          {tab === 'ds-subscription' && (
            <div className="pn">
              <div className="pn-h"><span className="pn-t">Subscription & Billing</span><span style={{fontSize: 12, color: '#888'}}>Managed by your operator</span></div>
              <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0}}>
                <div style={{borderRight: '1px solid #f0f0f0'}}>
                  <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Your Plan</div>
                  <div className="cd-row"><span className="cd-label">Plan</span><span className="cd-value" style={{color: 'var(--brand)', fontWeight: 600}}>Plan A — Monthly</span></div>
                  <div className="cd-row"><span className="cd-label">Monthly Fee</span><span className="cd-value">$349.00 / month</span></div>
                  <div className="cd-row"><span className="cd-label">Billing Cycle</span><span className="cd-value">1st of each month</span></div>
                  <div className="cd-row"><span className="cd-label">Next Invoice</span><span className="cd-value">Apr 1, 2026</span></div>
                  <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg active">Active</span></span></div>
                  <div className="cd-row"><span className="cd-label">Member Since</span><span className="cd-value">Jan 15, 2026</span></div>
                </div>
                <div>
                  <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Fee Schedule</div>
                  <div className="cd-row"><span className="cd-label">Claim Processing Fee</span><span className="cd-value">10% of approved</span></div>
                  <div className="cd-row"><span className="cd-label">Min Fee</span><span className="cd-value">$50.00</span></div>
                  <div className="cd-row"><span className="cd-label">Max Fee Cap</span><span className="cd-value">$500.00</span></div>
                  <div className="cd-row"><span className="cd-label">DAF Fee</span><span className="cd-value">$25.00 / unit</span></div>
                  <div className="cd-row"><span className="cd-label">PDI Fee</span><span className="cd-value">$15.00 / unit</span></div>
                </div>
              </div>
              <div style={{padding: '14px 20px', borderTop: '1px solid #f0f0f0'}}>
                <div className="cd-section-h" style={{padding: '0 0 12px', fontSize: 13, fontWeight: 600}}>Payment Method</div>
                <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb'}}>
                  <svg width="32" height="20" viewBox="0 0 32 20"><rect width="32" height="20" rx="4" fill="#1a1f71"/><text x="16" y="13" textAnchor="middle" fill="white" fontSize="8" fontWeight="bold" fontFamily="Arial">VISA</text></svg>
                  <div style={{flex: 1}}><div style={{fontSize: 13, fontWeight: 500}}>Visa ending in 4242</div><div style={{fontSize: 12, color: '#888'}}>Expires 09/2028</div></div>
                  <button className="btn btn-o btn-sm" onClick={() => alert('Card management coming soon')}>Update Card</button>
                </div>
              </div>
              <div style={{padding: '12px 20px', background: '#f5f6f8', borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#888', borderRadius: '0 0 8px 8px'}}>Subscription plan and fee schedule are managed by your operator. Contact them to make changes.</div>
            </div>
          )}

          {tab === 'ds-notifpref' && (
            <div className="pn">
              <div className="pn-h"><span className="pn-t">Notification Preferences</span></div>
              <div className="form-grid">
                {[
                  {label: 'Claim status updates', default: 'Push + Email'},
                  {label: 'Invoice generated', default: 'Push + Email'},
                  {label: 'Financing updates', default: 'Push + Email'},
                  {label: 'Parts order updates', default: 'Push + Email'},
                  {label: 'F&I recommendations', default: 'Push + Email'},
                  {label: 'Platform announcements', default: 'Push only'},
                  {label: 'Warranty expiry reminders', default: 'Push + Email'},
                  {label: 'Customer portal activity', default: 'Push only'},
                ].map(n => (
                  <div key={n.label} className="form-group"><label>{n.label}</label><select defaultValue={n.default}><option>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
                ))}
              </div>
              <div className="btn-bar"><button className="btn btn-p" onClick={() => alert('Preferences saved')}>Save Preferences</button><button className="btn btn-o" onClick={() => alert('Preferences reset')}>Reset to Defaults</button></div>
            </div>
          )}

        </div>
      </div>
    </div>
  );
}
