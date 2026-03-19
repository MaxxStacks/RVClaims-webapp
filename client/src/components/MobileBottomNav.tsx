// client/src/components/MobileBottomNav.tsx — Bottom navigation for mobile
// Shows on screens <= 768px. Replaces the sidebar.
// Each portal type gets different tabs.

import { useEffect, useState } from 'react';

interface NavTab {
  id: string;       // page ID to navigate to
  label: string;
  icon: string;     // SVG path content (24x24 viewBox)
  badge?: number;
}

// === OPERATOR TABS ===
const operatorTabs: NavTab[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  },
  {
    id: 'queue',
    label: 'Queue',
    icon: '<path d="M22 12h-4l-3 9L9 3l-3 9H2"/>',
    badge: 12,
  },
  {
    id: 'claims',
    label: 'Claims',
    icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  },
  {
    id: 'dealers',
    label: 'Dealers',
    icon: '<path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/>',
  },
  {
    id: 'settings',
    label: 'More',
    icon: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  },
];

// === DEALER TABS ===
const dealerTabs: NavTab[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: '<rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/>',
  },
  {
    id: 'upload',
    label: 'Upload',
    icon: '<path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/>',
  },
  {
    id: 'claims',
    label: 'Claims',
    icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>',
    badge: 6,
  },
  {
    id: 'units',
    label: 'Units',
    icon: '<rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/>',
  },
  {
    id: 'dealer-settings',
    label: 'More',
    icon: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  },
];

// === CUSTOMER TABS ===
const customerTabs: NavTab[] = [
  {
    id: 'dashboard',
    label: 'Home',
    icon: '<path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/>',
  },
  {
    id: 'claims',
    label: 'Claims',
    icon: '<path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/>',
  },
  {
    id: 'tickets',
    label: 'Support',
    icon: '<path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>',
  },
  {
    id: 'warranty',
    label: 'Warranty',
    icon: '<path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>',
  },
  {
    id: 'settings',
    label: 'More',
    icon: '<circle cx="12" cy="12" r="1"/><circle cx="12" cy="5" r="1"/><circle cx="12" cy="19" r="1"/>',
  },
];

const tabConfigs: Record<string, NavTab[]> = {
  operator: operatorTabs,
  dealer: dealerTabs,
  customer: customerTabs,
};

interface MobileBottomNavProps {
  portalType: 'operator' | 'dealer' | 'customer';
  activePage: string;
  onNavigate: (pageId: string) => void;
  parents?: Record<string, string>;  // page parent map for highlighting
}

export function MobileBottomNav({ portalType, activePage, onNavigate, parents = {} }: MobileBottomNavProps) {
  const tabs = tabConfigs[portalType] || operatorTabs;

  // Check if a tab should be active (including child pages)
  const isTabActive = (tabId: string) => {
    if (activePage === tabId) return true;
    if (parents[activePage] === tabId) return true;
    return false;
  };

  return (
    <nav className="mobile-bottom-nav" role="tablist">
      {tabs.map((tab) => (
        <button
          key={tab.id}
          className={`mobile-bottom-nav-item ${isTabActive(tab.id) ? 'active' : ''}`}
          onClick={() => onNavigate(tab.id)}
          role="tab"
          aria-selected={isTabActive(tab.id)}
          aria-label={tab.label}
          style={{ position: 'relative' }}
        >
          <svg
            width="22"
            height="22"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            dangerouslySetInnerHTML={{ __html: tab.icon }}
          />
          <span>{tab.label}</span>
          {tab.badge && tab.badge > 0 && (
            <span className="nav-badge">{tab.badge > 99 ? '99+' : tab.badge}</span>
          )}
        </button>
      ))}
    </nav>
  );
}

// === OFFLINE BANNER ===
export function OfflineBanner() {
  const [offline, setOffline] = useState(!navigator.onLine);

  useEffect(() => {
    const goOnline = () => setOffline(false);
    const goOffline = () => setOffline(true);
    window.addEventListener('online', goOnline);
    window.addEventListener('offline', goOffline);
    return () => {
      window.removeEventListener('online', goOnline);
      window.removeEventListener('offline', goOffline);
    };
  }, []);

  if (!offline) return null;

  return (
    <div className="offline-banner show">
      You're offline. Some features may be unavailable.
    </div>
  );
}
