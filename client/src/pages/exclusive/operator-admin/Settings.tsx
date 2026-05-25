import { useState, useEffect, useRef } from 'react';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch } from '@/lib/api';

const NOTIF_TYPES = [
  { key: 'claim_update', label: 'Claim status updates' },
  { key: 'invoice', label: 'Invoice generated' },
  { key: 'payment', label: 'Payment received' },
  { key: 'parts', label: 'Parts order updates' },
  { key: 'system', label: 'Platform announcements' },
  { key: 'ticket', label: 'Support ticket updates' },
];

export default function Settings() {
  const { user } = useAuth();
  const [tab, setTab] = useState('profile');
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [profile, setProfile] = useState({ firstName: '', lastName: '', email: '', phone: '', timezone: 'Eastern (ET)' });
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<'saved' | 'error' | ''>('');

  const [notifPrefs, setNotifPrefs] = useState<Record<string, string>>({});
  const [notifLoading, setNotifLoading] = useState(false);
  const [notifSaving, setNotifSaving] = useState(false);
  const [notifFeedback, setNotifFeedback] = useState<'saved' | 'error' | ''>('');

  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [lang, setLang] = useState(() => localStorage.getItem('ds360-lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en'));

  const isDevMode = !!localStorage.getItem('ds360-dev-role');

  useEffect(() => {
    if (user) {
      setProfile({
        firstName: (user as any).firstName || '',
        lastName: (user as any).lastName || '',
        email: (user as any).email || '',
        phone: (user as any).phone || '',
        timezone: (user as any).timezone || 'Eastern (ET)',
      });
      if ((user as any).avatarUrl) setAvatarPreview((user as any).avatarUrl);
    }
  }, [user]);

  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = ev => { if (ev.target?.result) setAvatarPreview(ev.target.result as string); };
    reader.readAsDataURL(file);
  };

  const handleSaveProfile = async () => {
    setProfileSaving(true);
    setProfileFeedback('');
    try {
      await apiFetch('/api/user/profile', {
        method: 'PUT',
        body: JSON.stringify({ firstName: profile.firstName, lastName: profile.lastName, phone: profile.phone, timezone: profile.timezone }),
      });
      setProfileFeedback('saved');
      setTimeout(() => window.location.reload(), 1500);
    } catch {
      setProfileFeedback('error');
      setProfileSaving(false);
    }
  };

  useEffect(() => {
    if (tab === 'notifications') {
      setNotifLoading(true);
      apiFetch<any>('/api/notifications/preferences')
        .then(d => setNotifPrefs(d.preferences || {}))
        .catch(() => {})
        .finally(() => setNotifLoading(false));
    }
  }, [tab]);

  const handleSaveNotifPrefs = async () => {
    setNotifSaving(true);
    setNotifFeedback('');
    try {
      await apiFetch('/api/notifications/preferences', {
        method: 'PATCH',
        body: JSON.stringify({ preferences: notifPrefs }),
      });
      setNotifFeedback('saved');
      setTimeout(() => setNotifFeedback(''), 2500);
    } catch {
      setNotifFeedback('error');
      setTimeout(() => setNotifFeedback(''), 3000);
    } finally {
      setNotifSaving(false);
    }
  };

  const toggleTheme = () => {
    const next = theme === 'dark' ? '' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ds360-theme', next);
  };

  const setLanguage = (l: string) => {
    setLang(l);
    localStorage.setItem('ds360-lang', l);
  };

  const openClerkSecurity = () => {
    try {
      const clerk = (window as any).Clerk;
      if (clerk?.openUserProfile) { clerk.openUserProfile(); }
    } catch {}
  };

  const initials = `${profile.firstName.charAt(0)}${profile.lastName.charAt(0)}`.toUpperCase() || 'OA';

  return (
    <div className="page active">
      <div style={{ display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24 }}>
        <div>
          <div className={`settings-link${tab === 'profile' ? ' active' : ''}`} onClick={() => setTab('profile')}>My Profile</div>
          <div className={`settings-link${tab === 'security' ? ' active' : ''}`} onClick={() => setTab('security')}>Security</div>
          <div className={`settings-link${tab === 'notifications' ? ' active' : ''}`} onClick={() => setTab('notifications')}>Notification Preferences</div>
          <div className={`settings-link${tab === 'appearance' ? ' active' : ''}`} onClick={() => setTab('appearance')}>Appearance</div>
        </div>
        <div>

          {/* MY PROFILE */}
          <div style={{ display: tab === 'profile' ? 'block' : 'none' }} className="pn">
            <div className="pn-h"><span className="pn-t">My Profile</span></div>
            <div style={{ padding: '24px 20px', display: 'flex', gap: 24, alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0' }}>
              <div style={{ position: 'relative', flexShrink: 0 }}>
                <div style={{ width: 80, height: 80, borderRadius: '50%', background: avatarPreview ? 'transparent' : 'var(--brand)', backgroundImage: avatarPreview ? `url(${avatarPreview})` : 'none', backgroundSize: 'cover', backgroundPosition: 'center', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', overflow: 'hidden' }}>
                  {!avatarPreview && initials}
                </div>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  style={{ position: 'absolute', bottom: 0, right: 0, width: 28, height: 28, borderRadius: '50%', background: 'var(--brand)', border: '2px solid #fff', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', padding: 0 }}
                >
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" strokeWidth="3"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg>
                </button>
                <input ref={fileInputRef} type="file" accept="image/*" style={{ display: 'none' }} onChange={handleAvatarChange} />
              </div>
              <div style={{ flex: 1, paddingTop: 8 }}>
                <div style={{ fontSize: 16, fontWeight: 600, marginBottom: 2 }}>{profile.firstName} {profile.lastName}</div>
                <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                  {(user as any)?.role === 'operator_admin' ? 'Operator Admin' : 'Operator Staff'} · Dealer Suite 360
                </div>
              </div>
            </div>
            <div className="form-grid">
              <div className="form-group"><label>First Name</label><input value={profile.firstName} onChange={e => setProfile(p => ({ ...p, firstName: e.target.value }))} /></div>
              <div className="form-group"><label>Last Name</label><input value={profile.lastName} onChange={e => setProfile(p => ({ ...p, lastName: e.target.value }))} /></div>
              <div className="form-group"><label>Email</label><input value={profile.email} readOnly style={{ background: '#f3f4f6', color: '#888' }} /></div>
              <div className="form-group"><label>Phone</label><input value={profile.phone} onChange={e => setProfile(p => ({ ...p, phone: e.target.value }))} placeholder="(555) 000-0000" /></div>
              <div className="form-group"><label>Role</label><input value={(user as any)?.role === 'operator_admin' ? 'Operator Admin' : 'Operator Staff'} readOnly style={{ background: '#f3f4f6', color: '#888' }} /></div>
              <div className="form-group">
                <label>Timezone</label>
                <select value={profile.timezone} onChange={e => setProfile(p => ({ ...p, timezone: e.target.value }))}>
                  <option>Eastern (ET)</option><option>Central (CT)</option><option>Mountain (MT)</option><option>Pacific (PT)</option>
                </select>
              </div>
            </div>
            {profileFeedback === 'saved' && <div style={{ padding: '0 20px 8px', color: '#0cb22c', fontSize: 13 }}>Saved ✓ Refreshing…</div>}
            {profileFeedback === 'error' && <div style={{ padding: '0 20px 8px', color: '#dc2626', fontSize: 13 }}>Failed to save. Please try again.</div>}
            <div className="btn-bar">
              <button className="btn btn-p" onClick={handleSaveProfile} disabled={profileSaving}>{profileSaving ? 'Saving…' : 'Save Profile'}</button>
              <button className="btn btn-o">Cancel</button>
            </div>
          </div>

          {/* SECURITY */}
          <div style={{ display: tab === 'security' ? 'block' : 'none' }} className="pn">
            <div className="pn-h"><span className="pn-t">Security</span></div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 12 }}>
              {isDevMode && (
                <div style={{ padding: '10px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderRadius: 8, fontSize: 13, color: '#92400e' }}>
                  Dev mode active — Clerk security features are available in production.
                </div>
              )}
              {[
                { title: 'Password', desc: 'Update your account password', label: 'Change Password' },
                { title: 'Two-Factor Authentication', desc: 'Add an extra layer of security to your account', label: 'Manage 2FA' },
                { title: 'Active Sessions', desc: 'View and manage all active login sessions', label: 'View Sessions' },
              ].map(item => (
                <div key={item.title} style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>{item.title}</div>
                    <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>{item.desc}</div>
                  </div>
                  <button className="btn btn-o btn-sm" onClick={openClerkSecurity}>{item.label}</button>
                </div>
              ))}
              <div style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Sign Out All Devices</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Revoke all active sessions on all devices</div>
                </div>
                <button className="btn btn-d btn-sm" onClick={openClerkSecurity}>Sign Out All</button>
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', paddingTop: 4 }}>
                Authentication and security are managed by Clerk. All session data is encrypted and handled securely.
              </div>
            </div>
          </div>

          {/* NOTIFICATION PREFERENCES */}
          <div style={{ display: tab === 'notifications' ? 'block' : 'none' }} className="pn">
            <div className="pn-h"><span className="pn-t">Notification Preferences</span></div>
            {notifLoading ? (
              <div style={{ padding: '24px 20px', color: '#888', fontSize: 13 }}>Loading preferences…</div>
            ) : (
              <div className="form-grid">
                {NOTIF_TYPES.map(({ key, label }) => (
                  <div key={key} className="form-group">
                    <label>{label}</label>
                    <select value={notifPrefs[key] || 'push+email'} onChange={e => setNotifPrefs(p => ({ ...p, [key]: e.target.value }))}>
                      <option value="push+email">Push + Email</option>
                      <option value="push">Push only</option>
                      <option value="email">Email only</option>
                      <option value="off">Off</option>
                    </select>
                  </div>
                ))}
              </div>
            )}
            {notifFeedback === 'saved' && <div style={{ padding: '0 20px 8px', color: '#0cb22c', fontSize: 13 }}>Preferences saved ✓</div>}
            {notifFeedback === 'error' && <div style={{ padding: '0 20px 8px', color: '#dc2626', fontSize: 13 }}>Failed to save. Please try again.</div>}
            <div className="btn-bar">
              <button className="btn btn-p" onClick={handleSaveNotifPrefs} disabled={notifSaving}>{notifSaving ? 'Saving…' : 'Save Preferences'}</button>
              <button className="btn btn-o" onClick={() => setNotifPrefs({})}>Reset to Defaults</button>
            </div>
          </div>

          {/* APPEARANCE */}
          <div style={{ display: tab === 'appearance' ? 'block' : 'none' }} className="pn">
            <div className="pn-h"><span className="pn-t">Appearance</span></div>
            <div style={{ padding: 20, display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Dark Mode</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Switch between light and dark theme</div>
                </div>
                <button className={`btn ${theme === 'dark' ? 'btn-p' : 'btn-o'}`} onClick={toggleTheme} style={{ minWidth: 80 }}>
                  {theme === 'dark' ? 'On' : 'Off'}
                </button>
              </div>
              <div style={{ padding: '14px 16px', border: '1px solid var(--border)', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontWeight: 600, fontSize: 13, marginBottom: 2 }}>Language</div>
                  <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>Choose your preferred language</div>
                </div>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button className={`btn ${lang === 'en' ? 'btn-p' : 'btn-o'} btn-sm`} onClick={() => setLanguage('en')}>English</button>
                  <button className={`btn ${lang === 'fr' ? 'btn-p' : 'btn-o'} btn-sm`} onClick={() => setLanguage('fr')}>Français</button>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
