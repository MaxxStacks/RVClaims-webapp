// client/src/layouts/SuperAdminLayout.tsx — DS360 Platform Superadmin Layout
// Only accessible to ds360_superadmin role.

import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import ds360Icon from '@assets/ds360_favicon.png';
import type { Language } from '@/lib/i18n';

interface Props { children?: React.ReactNode; }

export default function SuperAdminLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();
  const { language: lang, setLanguage, t } = useLanguage();

  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Role guard — redirect if not superadmin
  useEffect(() => {
    if (user && user.role !== 'ds360_superadmin') {
      navigate('/');
    }
  }, [user, navigate]);

  const toggleTheme = () => {
    const next = theme === 'dark' ? '' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ds360-theme', next);
  };

  const handleSetLang = (l: string) => setLanguage(l as Language);

  const isActive = (path: string) =>
    location === path || location.startsWith(path + '/');

  const navItems = [
    { label: t('superadmin.dashboard') || 'Dashboard',       path: '/superadmin/dashboard',  icon: '⊞' },
    { label: t('superadmin.operators') || 'Operators',       path: '/superadmin/operators',  icon: '🏢' },
    { label: t('superadmin.revenue') || 'Revenue',           path: '/superadmin/revenue',    icon: '💰' },
    { label: t('superadmin.globalSettings') || 'Settings',   path: '/superadmin/settings',   icon: '⚙' },
  ];

  return (
    <>
      <nav className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-logo">
          <img src={ds360Icon} width="36" height="36" style={{ borderRadius: 8 }} alt="DS360" />
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-sub" style={{ fontSize: 12, fontWeight: 600 }}>
              DS360 Platform
            </div>
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
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
              }}
            >
              Superadmin
            </span>
          </div>
        </div>

        <div className="sidebar-nav">
          <div className="sidebar-section-label">Platform</div>
          {navItems.map(item => (
            <Link
              key={item.path}
              href={item.path}
              className={`sidebar-item${isActive(item.path) ? ' active' : ''}`}
            >
              <span className="sidebar-icon">{item.icon}</span>
              <span className="sidebar-label">{item.label}</span>
            </Link>
          ))}
        </div>

        <div className="sidebar-footer">
          <div className="sidebar-footer-user">
            <div className="sidebar-avatar">
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </div>
            {!sidebarCollapsed && (
              <div className="sidebar-user-info">
                <span className="sidebar-user-name">{user?.firstName} {user?.lastName}</span>
                <span className="sidebar-user-role" style={{ color: '#7c3aed' }}>DS360 Superadmin</span>
              </div>
            )}
          </div>
          {!sidebarCollapsed && (
            <button className="sidebar-sign-out" onClick={logout}>
              {t('nav.signOut') || 'Sign Out'}
            </button>
          )}
        </div>
      </nav>

      {/* Main content area */}
      <div className={`main-content${sidebarCollapsed ? ' sidebar-collapsed' : ''}`}>
        {/* Topbar */}
        <div className="topbar">
          <div className="topbar-left">
            <button
              className="sidebar-toggle"
              onClick={() => setSidebarCollapsed(c => !c)}
              title="Toggle sidebar"
            >
              ☰
            </button>
            <span className="topbar-title" style={{ color: '#7c3aed', fontWeight: 700 }}>
              DS360 Platform
            </span>
          </div>
          <div className="topbar-right">
            {/* Language toggle */}
            <div className="lang-toggle">
              <button
                className={`lang-btn${lang === 'en' ? ' active' : ''}`}
                onClick={() => handleSetLang('en')}
              >
                EN
              </button>
              <button
                className={`lang-btn${lang === 'fr' ? ' active' : ''}`}
                onClick={() => handleSetLang('fr')}
              >
                FR
              </button>
            </div>
            {/* Dark mode */}
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
              {theme === 'dark' ? '☀' : '🌙'}
            </button>
          </div>
        </div>

        {/* Page content */}
        <div className="page-content">
          {children}
        </div>
      </div>
    </>
  );
}
