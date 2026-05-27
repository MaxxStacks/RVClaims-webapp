// client/src/layouts/SuperAdminLayout.tsx — DS360 Platform Superadmin Layout
// Only accessible to ds360_superadmin role.
// Structure mirrors OperatorAdminLayout exactly — same CSS classes, same patterns.

import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { apiFetch } from '@/lib/api';
import ds360Icon from '@assets/ds360_favicon.png';
import type { Language } from '@/lib/i18n';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import SidebarFooter from '@/components/SidebarFooter';

interface Props { children?: React.ReactNode; }

export default function SuperAdminLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { language: lang, setLanguage, t } = useLanguage();

  // Notification bell
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Role guard — redirect if not superadmin
  useEffect(() => {
    if (user && user.role !== 'ds360_superadmin') {
      navigate('/');
    }
  }, [user, navigate]);

  // Load notifications on mount
  useEffect(() => {
    apiFetch<any>('/api/notifications/inbox')
      .then(d => setNotifItems(Array.isArray(d.notifications) ? d.notifications : []))
      .catch(() => {});
  }, []);

  // Click outside notifications
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(e.target as Node)) setNotifOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? '' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ds360-theme', next);
  };

  const handleSetLang = (l: string) => setLanguage(l as Language);

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const data = await apiFetch<any>('/api/notifications/inbox');
      setNotifItems(Array.isArray(data.notifications) ? data.notifications : []);
    } catch {
      setNotifItems([]);
    } finally {
      setNotifLoading(false);
    }
  };

  const toggleNotif = () => {
    if (!notifOpen) loadNotifications();
    setNotifOpen(o => !o);
  };

  const markAllRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PUT' });
      setNotifItems(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const isActive = (path: string) => location.endsWith('/' + path) || location.includes('/' + path + '/');
  const unreadCount = notifItems.filter(n => !n.isRead).length;

  return (
    <>
      <nav className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        {/* Logo block */}
        <div className="sidebar-logo">
          <img src={ds360Icon} width="36" height="36" style={{ borderRadius: 8 }} alt="DS360" />
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-sub" style={{ fontSize: 12, fontWeight: 600 }}>DS360 Platform Admin</div>
            <span
              className="sidebar-badge"
              style={{
                marginTop: 4,
                background: '#7c3aed',
                color: '#fff',
                fontSize: 10,
                fontWeight: 700,
                padding: '2px 7px',
                borderRadius: 4,
                textTransform: 'uppercase' as const,
                letterSpacing: '0.5px',
              }}
            >
              Superadmin
            </span>
          </div>
        </div>

        {/* Nav */}
        <div className="sidebar-nav">
          {/* Section: Platform Overview */}
          <div className="nav-section">
            <div className="nav-label">Platform Overview</div>
            <Link className={`nav-item ${isActive('dashboard') ? 'active' : ''}`} to="/superadmin/dashboard">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Dashboard
            </Link>
            <Link className={`nav-item ${isActive('operators') ? 'active' : ''}`} to="/superadmin/operators">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
              Operators
            </Link>
            <Link className={`nav-item ${isActive('revenue') ? 'active' : ''}`} to="/superadmin/revenue">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>
              Platform Revenue
            </Link>
          </div>

          {/* Section: Management */}
          <div className="nav-section">
            <div className="nav-label">Management</div>
            <Link className={`nav-item ${isActive('modules') ? 'active' : ''}`} to="/superadmin/modules">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              Module Catalog
            </Link>
            <Link className={`nav-item ${isActive('settings') ? 'active' : ''}`} to="/superadmin/settings">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
              Global Settings
            </Link>
          </div>

          {/* Section: System */}
          <div className="nav-section">
            <div className="nav-label">System</div>
            <Link
              className="nav-item"
              to="/system-status"
              onClick={(e) => { e.preventDefault(); window.location.href = '/system-status'; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>
              System Status
            </Link>
          </div>

          {/* Logout nav item — same style as other nav items */}
          <div className="nav-section">
            <button
              className="nav-item"
              style={{ width: '100%', textAlign: 'left' as const, background: 'none', border: 'none', cursor: 'pointer' }}
              onClick={async () => { await logout(); window.location.href = '/'; }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
              Sign Out
            </button>
          </div>
        </div>

        {/* Sidebar footer — user info + version, NO separator line */}
        <div className="sidebar-footer">
          <div className="user-info" style={{ cursor: 'pointer' }}>
            <div className="user-avatar">
              {user?.name
                ? user.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
                : 'SA'}
            </div>
            <div>
              <div className="user-name">{user?.name ?? user?.email ?? 'Superadmin'}</div>
              <div className="user-role" style={{ color: '#7c3aed' }}>DS360 Superadmin</div>
            </div>
          </div>
          <SidebarFooter />
        </div>
      </nav>

      {/* Main content area — same structure as OperatorAdminLayout */}
      <div className={`main${sidebarCollapsed ? ' collapsed-main' : ''}`}>
        <header className="header">
          <div className="header-left">
            <button
              className="hbtn"
              onClick={() => setSidebarCollapsed(c => !c)}
              title="Toggle sidebar"
              style={{ flexShrink: 0 }}
            >
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6"/>
                <line x1="3" y1="12" x2="21" y2="12"/>
                <line x1="3" y1="18" x2="21" y2="18"/>
              </svg>
            </button>
            <img src={ds360Icon} width="28" height="28" style={{ borderRadius: 6, flexShrink: 0, marginRight: 4 }} alt="DS360" />
            <div>
              <div className="header-title" style={{ color: '#7c3aed', fontWeight: 700 }}>DS360 Platform Admin</div>
              <div className="header-sub">Superadmin</div>
            </div>
          </div>
          <div className="header-right">
            {/* Language toggle */}
            <div className="lang-toggle">
              <button className={`lang-btn-opt ${lang === 'en' ? 'active' : ''}`} onClick={() => handleSetLang('en')}>EN</button>
              <button className={`lang-btn-opt ${lang === 'fr' ? 'active' : ''}`} onClick={() => handleSetLang('fr')}>FR</button>
            </div>
            {/* Dark mode */}
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5"/>
                <line x1="12" y1="1" x2="12" y2="3"/>
                <line x1="12" y1="21" x2="12" y2="23"/>
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/>
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/>
                <line x1="1" y1="12" x2="3" y2="12"/>
                <line x1="21" y1="12" x2="23" y2="12"/>
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/>
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/>
              </svg>
            </button>

            {/* Notification bell */}
            <div ref={notifRef} style={{ position: 'relative' }}>
              <button className="hbtn" title="Notifications" onClick={toggleNotif} style={{ position: 'relative' }}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/>
                  <path d="M13.73 21a2 2 0 01-3.46 0"/>
                </svg>
                {unreadCount > 0 && <span className="ndot"></span>}
              </button>
              {notifOpen && (
                <div style={{ position: 'absolute', top: 'calc(100% + 8px)', right: 0, width: 320, background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, boxShadow: '0 8px 32px rgba(0,0,0,.12)', zIndex: 1000, overflow: 'hidden' }}>
                  <div style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #333)' }}>
                      Notifications {unreadCount > 0 && <span style={{ marginLeft: 6, background: '#7c3aed', color: '#fff', borderRadius: 10, fontSize: 10, padding: '1px 6px', fontWeight: 600 }}>{unreadCount}</span>}
                    </span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{ fontSize: 11, color: '#7c3aed', background: 'none', border: 'none', cursor: 'pointer', padding: 0, fontFamily: 'inherit' }}>Mark all read</button>
                    )}
                  </div>
                  {notifLoading && <div style={{ padding: '24px 16px', textAlign: 'center', color: '#888', fontSize: 12 }}>Loading…</div>}
                  {!notifLoading && notifItems.length === 0 && <div style={{ padding: '24px 16px', textAlign: 'center', color: '#aaa', fontSize: 12 }}>No notifications yet</div>}
                  {!notifLoading && notifItems.length > 0 && (
                    <div style={{ maxHeight: 380, overflowY: 'auto' }}>
                      {notifItems.slice(0, 15).map(n => (
                        <div
                          key={n.id}
                          style={{ padding: '10px 14px', borderBottom: '1px solid var(--border)', cursor: n.linkTo ? 'pointer' : 'default', background: n.isRead ? 'transparent' : '#f5f3ff' }}
                          onClick={() => { if (n.linkTo) { navigate(n.linkTo); setNotifOpen(false); } }}
                        >
                          <div style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                            {!n.isRead && <div style={{ width: 6, height: 6, borderRadius: '50%', background: '#7c3aed', marginTop: 4, flexShrink: 0 }}></div>}
                            <div style={{ flex: 1 }}>
                              <div style={{ fontSize: 13, fontWeight: n.isRead ? 400 : 600, color: 'var(--text, #333)', lineHeight: '1.4' }}>{n.title}</div>
                              {n.message && <div style={{ fontSize: 11, color: '#888', marginTop: 2, lineHeight: '1.4' }}>{n.message}</div>}
                              <div style={{ fontSize: 10, color: '#bbb', marginTop: 4 }}>
                                {new Date(n.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </header>

        <div className="content">
          {children}
        </div>

        <MobileBottomNav
          portalType="operator"
          activePage={location.split('/').filter(Boolean)[1] || 'dashboard'}
          onNavigate={(pageId) => {
            navigate(`/superadmin/${pageId}`);
          }}
        />
      </div>
    </>
  );
}
