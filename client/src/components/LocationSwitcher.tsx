// client/src/components/LocationSwitcher.tsx
// Compact location selector for DealerOwnerLayout AppBar.
// Only renders when isMultiLocation = true (2+ active locations).
// Only shown to dealer_owner and financial_manager roles.

import { useLocationContext } from '@/contexts/LocationContext';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

const ALLOWED_ROLES = ['dealer_owner', 'financial_manager'];

export default function LocationSwitcher() {
  const { locations, currentLocationId, setCurrentLocation, isMultiLocation } = useLocationContext();
  const { user } = useAuth();
  const { t } = useLanguage();

  if (!isMultiLocation) return null;
  if (!user?.role || !ALLOWED_ROLES.includes(user.role)) return null;

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
      <svg
        width="13"
        height="13"
        viewBox="0 0 24 24"
        fill="none"
        stroke="#033280"
        strokeWidth="2"
        style={{ flexShrink: 0 }}
      >
        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0118 0z" />
        <circle cx="12" cy="10" r="3" />
      </svg>
      <select
        value={currentLocationId ?? ''}
        onChange={(e) => setCurrentLocation(e.target.value || null)}
        style={{
          fontSize: 12,
          fontWeight: 600,
          color: '#033280',
          background: '#f0f5ff',
          border: '1px solid #c7d4f0',
          borderRadius: 6,
          padding: '3px 8px',
          cursor: 'pointer',
          fontFamily: 'inherit',
          maxWidth: 160,
          outline: 'none',
        }}
        title={t('location.switchLocation')}
      >
        <option value="">{t('location.allLocations')}</option>
        {locations.map((loc) => (
          <option key={loc.id} value={loc.id}>
            {loc.name}{loc.isMain ? '' : ''}
          </option>
        ))}
      </select>
    </div>
  );
}
