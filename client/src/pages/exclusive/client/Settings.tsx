// client/src/pages/exclusive/client/Settings.tsx
// Client portal settings page — profile, password, notification preferences

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';
import NotificationPreferences from './NotificationPreferences';

type SettingsSection = 'profile' | 'notifications' | 'password';

export default function ClientSettings() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [activeSection, setActiveSection] = useState<SettingsSection>('profile');

  const sectionTab = (key: SettingsSection, label: string) => (
    <button
      key={key}
      onClick={() => setActiveSection(key)}
      style={{
        padding: '8px 16px',
        background: activeSection === key ? '#033280' : 'none',
        color: activeSection === key ? '#fff' : 'var(--text-muted, #555)',
        border: activeSection === key ? 'none' : '1px solid var(--border, #e5e7eb)',
        borderRadius: 7,
        fontSize: 13,
        fontWeight: activeSection === key ? 700 : 500,
        cursor: 'pointer',
        fontFamily: 'inherit',
        transition: 'all 0.15s',
      }}
    >
      {label}
    </button>
  );

  return (
    <div style={{ padding: '24px', maxWidth: 680, margin: '0 auto' }}>
      <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #111)', marginBottom: 20 }}>
        {t('nav.settings')}
      </h1>

      {/* Section tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {sectionTab('profile', 'Profile')}
        {sectionTab('notifications', t('reminder.preferences') ?? 'Notification Preferences')}
        {sectionTab('password', 'Password')}
      </div>

      {/* Profile section */}
      {activeSection === 'profile' && (
        <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #111)', marginBottom: 18 }}>Your Profile</div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px 20px' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', display: 'block', marginBottom: 5 }}>First Name</label>
              <div style={{ padding: '9px 12px', background: 'var(--bg-secondary, #f9fafb)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, color: 'var(--text, #333)' }}>
                {user?.firstName ?? '—'}
              </div>
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', display: 'block', marginBottom: 5 }}>Last Name</label>
              <div style={{ padding: '9px 12px', background: 'var(--bg-secondary, #f9fafb)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, color: 'var(--text, #333)' }}>
                {user?.lastName ?? '—'}
              </div>
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={{ fontSize: 12, fontWeight: 600, color: '#888', display: 'block', marginBottom: 5 }}>Email</label>
              <div style={{ padding: '9px 12px', background: 'var(--bg-secondary, #f9fafb)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 7, fontSize: 13, color: 'var(--text, #333)' }}>
                {user?.email ?? '—'}
              </div>
            </div>
          </div>
          <p style={{ fontSize: 12, color: '#aaa', marginTop: 16, marginBottom: 0 }}>
            To update your profile details, contact your dealership or use the support ticket system.
          </p>
        </div>
      )}

      {/* Notification Preferences section */}
      {activeSection === 'notifications' && <NotificationPreferences />}

      {/* Password section */}
      {activeSection === 'password' && (
        <div style={{ background: 'var(--bg-card, #fff)', border: '1px solid var(--border, #e5e7eb)', borderRadius: 10, padding: '20px 24px' }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #111)', marginBottom: 18 }}>Change Password</div>
          <p style={{ fontSize: 13, color: '#888', lineHeight: 1.6 }}>
            Password changes are managed through the login page. Use "Forgot password" on the sign-in screen to reset your password via email.
          </p>
        </div>
      )}
    </div>
  );
}
