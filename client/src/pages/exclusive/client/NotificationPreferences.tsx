// client/src/pages/exclusive/client/NotificationPreferences.tsx
// Customer notification preferences — channel toggles, category preferences, master opt-out

import { useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';

interface Prefs {
  id?: string;
  pushEnabled: boolean;
  emailEnabled: boolean;
  smsEnabled: boolean;
  marketingOptIn: boolean;
  reminderCategories: {
    service: boolean;
    warranty: boolean;
    seasonal: boolean;
    promotions: boolean;
  };
}

const DEFAULT_PREFS: Prefs = {
  pushEnabled: true,
  emailEnabled: true,
  smsEnabled: false,
  marketingOptIn: true,
  reminderCategories: { service: true, warranty: true, seasonal: true, promotions: true },
};

interface ToggleProps {
  checked: boolean;
  onChange: (v: boolean) => void;
  disabled?: boolean;
}

function Toggle({ checked, onChange, disabled = false }: ToggleProps) {
  return (
    <button
      onClick={() => !disabled && onChange(!checked)}
      aria-pressed={checked}
      style={{
        width: 40, height: 22, borderRadius: 11, border: 'none', padding: 0, cursor: disabled ? 'default' : 'pointer',
        background: checked ? '#0cb22c' : '#d1d5db', position: 'relative', transition: 'background 0.2s', outline: 'none',
        opacity: disabled ? 0.5 : 1, flexShrink: 0,
      }}
    >
      <span style={{
        display: 'block', width: 18, height: 18, borderRadius: '50%', background: '#fff',
        position: 'absolute', top: 2, left: checked ? 20 : 2, transition: 'left 0.2s',
        boxShadow: '0 1px 3px rgba(0,0,0,0.2)',
      }} />
    </button>
  );
}

export default function NotificationPreferences() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [localPrefs, setLocalPrefs] = useState<Prefs | null>(null);

  const { data, isLoading } = useQuery({
    queryKey: ['customerPrefs', user?.id],
    queryFn: () => apiFetch<{ success: boolean; preferences: Prefs | null }>('/api/reminders/customer-preferences'),
    staleTime: 60_000,
  });

  // Effective prefs: local edits take precedence
  const serverPrefs = data?.preferences ?? DEFAULT_PREFS;
  const prefs: Prefs = localPrefs ?? serverPrefs;

  const update = (patch: Partial<Prefs>) => {
    setLocalPrefs(prev => ({ ...(prev ?? serverPrefs), ...patch }));
    setSaved(false);
  };

  const updateCategory = (key: keyof Prefs['reminderCategories'], value: boolean) => {
    update({
      reminderCategories: {
        ...prefs.reminderCategories,
        [key]: value,
      },
    });
  };

  const handleSave = async () => {
    if (!localPrefs) return;
    setSaving(true);
    try {
      await apiFetch('/api/reminders/customer-preferences', {
        method: 'PATCH',
        body: JSON.stringify(localPrefs),
      });
      queryClient.invalidateQueries({ queryKey: ['customerPrefs'] });
      setSaved(true);
      setLocalPrefs(null); // reset to server state
    } catch {
      // silent
    } finally {
      setSaving(false);
    }
  };

  const hasChanges = localPrefs !== null;
  const isOptedOut = !prefs.marketingOptIn;

  if (isLoading) {
    return <div style={{ padding: 24, textAlign: 'center', color: '#aaa', fontSize: 13 }}>Loading…</div>;
  }

  const cardStyle: React.CSSProperties = {
    background: 'var(--bg-card, #fff)',
    border: '1px solid var(--border, #e5e7eb)',
    borderRadius: 10,
    padding: '18px 20px',
    marginBottom: 16,
  };

  const rowStyle: React.CSSProperties = {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '10px 0',
    borderBottom: '1px solid var(--border, #f0f0f0)',
  };

  const lastRowStyle: React.CSSProperties = { ...rowStyle, borderBottom: 'none', paddingBottom: 0 };

  return (
    <div>
      <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text, #111)', marginBottom: 4 }}>
        {t('reminder.preferences')}
      </h2>
      <p style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
        {t('reminder.preferencesSubtitle') ?? 'Choose how and what notifications you receive.'}
      </p>

      {/* Channel toggles */}
      <div style={cardStyle}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #111)', marginBottom: 12 }}>
          {t('reminder.channels') ?? 'Notification Channels'}
        </div>

        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #333)' }}>{t('reminder.push')}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>In-app notifications in the portal</div>
          </div>
          <Toggle checked={prefs.pushEnabled} onChange={v => update({ pushEnabled: v })} />
        </div>

        <div style={rowStyle}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #333)' }}>{t('reminder.email')}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>Reminders sent to {user?.email}</div>
          </div>
          <Toggle checked={prefs.emailEnabled} onChange={v => update({ emailEnabled: v })} />
        </div>

        <div style={lastRowStyle}>
          <div>
            <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #333)' }}>{t('reminder.sms')}</div>
            <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>
              {(user as any)?.phone ? 'Text to ' + (user as any).phone : 'No phone number on file'}
            </div>
          </div>
          <Toggle checked={prefs.smsEnabled} onChange={v => update({ smsEnabled: v })} disabled={!(user as any)?.phone} />
        </div>
      </div>

      {/* Category toggles */}
      <div style={{ ...cardStyle, opacity: isOptedOut ? 0.5 : 1, pointerEvents: isOptedOut ? 'none' : 'auto' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: 'var(--text, #111)', marginBottom: 12 }}>
          {t('reminder.categories')}
        </div>

        {[
          { key: 'service' as const, label: t('reminder.service'), desc: 'Annual service and maintenance reminders' },
          { key: 'warranty' as const, label: t('reminder.warranty'), desc: 'Alerts before your warranty expires' },
          { key: 'seasonal' as const, label: t('reminder.seasonal'), desc: 'Winterization, de-winterization, and spring prep' },
          { key: 'promotions' as const, label: t('reminder.promotions'), desc: 'Product offers and special deals from your dealer' },
        ].map(({ key, label, desc }, i, arr) => (
          <div key={key} style={i === arr.length - 1 ? lastRowStyle : rowStyle}>
            <div>
              <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #333)' }}>{label}</div>
              <div style={{ fontSize: 12, color: '#888', marginTop: 2 }}>{desc}</div>
            </div>
            <Toggle
              checked={prefs.reminderCategories[key]}
              onChange={v => updateCategory(key, v)}
            />
          </div>
        ))}
      </div>

      {/* Master opt-out */}
      <div style={{ ...cardStyle, borderColor: isOptedOut ? '#fecaca' : 'var(--border, #e5e7eb)', background: isOptedOut ? '#fef9f9' : 'var(--bg-card, #fff)' }}>
        <div style={{ fontSize: 13, fontWeight: 700, color: '#b91c1c', marginBottom: 10 }}>
          {t('reminder.masterOptOut') ?? 'Unsubscribe from All Marketing'}
        </div>

        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16 }}>
          <div style={{ fontSize: 12, color: '#888', lineHeight: 1.6, flex: 1 }}>
            {t('reminder.masterOptOutDesc') ?? 'Disable all marketing and reminder messages from your dealer. You will still receive important transactional notifications about your claims, service appointments, and billing.'}
          </div>
          <Toggle checked={!prefs.marketingOptIn} onChange={v => update({ marketingOptIn: !v })} />
        </div>
      </div>

      {/* Save */}
      {hasChanges && (
        <div style={{ display: 'flex', gap: 10, alignItems: 'center' }}>
          <button
            onClick={handleSave}
            disabled={saving}
            style={{ padding: '9px 20px', background: saving ? '#a3d9a5' : '#0cb22c', color: '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 700, cursor: saving ? 'default' : 'pointer', fontFamily: 'inherit' }}
          >
            {saving ? 'Saving…' : 'Save Preferences'}
          </button>
          <button
            onClick={() => { setLocalPrefs(null); setSaved(false); }}
            style={{ padding: '9px 16px', background: 'none', border: '1px solid var(--border, #e5e7eb)', borderRadius: 8, fontSize: 13, cursor: 'pointer', color: '#888', fontFamily: 'inherit' }}
          >
            Cancel
          </button>
        </div>
      )}

      {saved && !hasChanges && (
        <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 600 }}>Preferences saved.</div>
      )}
    </div>
  );
}
