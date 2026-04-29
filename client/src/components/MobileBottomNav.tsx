// client/src/components/MobileBottomNav.tsx — Bottom navigation for mobile
// Shows on screens <= 768px. Replaces the sidebar.
// Each portal type gets different tabs. "More" opens a sheet with extra links.

import { useEffect, useState } from 'react';

interface NavTab {
  id: string;
  label: string;
  icon: string;
  badge?: number;
  isMore?: boolean;
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
    isMore: true,
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
    isMore: true,
  },
];

// === CLIENT TABS ===
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
    isMore: true,
  },
];

const tabConfigs: Record<string, NavTab[]> = {
  operator: operatorTabs,
  dealer: dealerTabs,
  client: customerTabs,
};

// The settings page id per portal type
const settingsPageId: Record<string, string> = {
  operator: 'settings',
  dealer: 'dealer-settings',
  client: 'settings',
};

interface MobileBottomNavProps {
  portalType: 'operator' | 'dealer' | 'client';
  activePage: string;
  onNavigate: (pageId: string) => void;
  parents?: Record<string, string>;
}

export function MobileBottomNav({ portalType, activePage, onNavigate, parents = {} }: MobileBottomNavProps) {
  const tabs = tabConfigs[portalType] || operatorTabs;
  const [moreOpen, setMoreOpen] = useState(false);

  const isTabActive = (tabId: string) => {
    if (activePage === tabId) return true;
    if (parents[activePage] === tabId) return true;
    return false;
  };

  function handleTabClick(tab: NavTab) {
    if (tab.isMore) {
      setMoreOpen(prev => !prev);
    } else {
      setMoreOpen(false);
      onNavigate(tab.id);
    }
  }

  // Close on outside interaction
  useEffect(() => {
    if (!moreOpen) return;
    const close = () => setMoreOpen(false);
    window.addEventListener('click', close);
    return () => window.removeEventListener('click', close);
  }, [moreOpen]);

  return (
    <>
      {/* More sheet backdrop */}
      {moreOpen && (
        <div
          onClick={(e) => e.stopPropagation()}
          style={{
            position: 'fixed', bottom: 60, left: 0, right: 0, zIndex: 9999,
            display: 'flex', justifyContent: 'center',
          }}
        >
          <div style={{
            background: 'white', borderRadius: 12, boxShadow: '0 -4px 24px rgba(0,0,0,0.12)',
            border: '1px solid #e8e8e8', overflow: 'hidden', width: '90%', maxWidth: 360,
          }}>
            <div style={{ padding: '10px 14px 4px', fontSize: 11, fontWeight: 700, color: '#aaa', textTransform: 'uppercase', letterSpacing: '0.06em', fontFamily: 'Inter, system-ui, sans-serif' }}>
              More
            </div>
            <MoreMenuItem
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>}
              label="Settings"
              sub="Account, profile, notifications"
              onClick={() => { setMoreOpen(false); onNavigate(settingsPageId[portalType]); }}
            />
            <div style={{ height: 1, background: '#f0f0f0', margin: '0 14px' }} />
            <MoreMenuItem
              icon={<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>}
              label="System Status"
              sub="Service health, versions &amp; release notes"
              badge="Live"
              badgeColor="#22c55e"
              onClick={() => { setMoreOpen(false); window.open('/system-status', '_blank'); }}
              external
            />
            <div style={{ height: 8 }} />
          </div>
        </div>
      )}

      <nav className="mobile-bottom-nav" role="tablist">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            className={`mobile-bottom-nav-item ${tab.isMore ? (moreOpen ? 'active' : '') : (isTabActive(tab.id) ? 'active' : '')}`}
            onClick={(e) => { e.stopPropagation(); handleTabClick(tab); }}
            role="tab"
            aria-selected={tab.isMore ? moreOpen : isTabActive(tab.id)}
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
    </>
  );
}

function MoreMenuItem({
  icon, label, sub, badge, badgeColor, onClick, external,
}: {
  icon: React.ReactNode;
  label: string;
  sub: string;
  badge?: string;
  badgeColor?: string;
  onClick: () => void;
  external?: boolean;
}) {
  return (
    <div
      onClick={onClick}
      style={{
        display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px',
        cursor: 'pointer', transition: 'background 0.1s',
      }}
      onMouseEnter={e => (e.currentTarget.style.background = '#f8f9fa')}
      onMouseLeave={e => (e.currentTarget.style.background = 'white')}
    >
      <div style={{
        width: 36, height: 36, borderRadius: 8, background: '#f1f5f9',
        display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0, color: '#475569',
      }}>
        {icon}
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
          <span style={{ fontSize: 14, fontWeight: 600, color: '#0f172a', fontFamily: 'Inter, system-ui, sans-serif' }}>{label}</span>
          {badge && (
            <span style={{
              fontSize: 9, fontWeight: 700, color: 'white', background: badgeColor || '#6366f1',
              borderRadius: 8, padding: '1px 6px', textTransform: 'uppercase',
            }}>{badge}</span>
          )}
          {external && (
            <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" strokeWidth="2">
              <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6"/>
              <polyline points="15 3 21 3 21 9"/>
              <line x1="10" y1="14" x2="21" y2="3"/>
            </svg>
          )}
        </div>
        <div style={{ fontSize: 12, color: '#94a3b8', marginTop: 1, fontFamily: 'Inter, system-ui, sans-serif' }} dangerouslySetInnerHTML={{ __html: sub }} />
      </div>
    </div>
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
