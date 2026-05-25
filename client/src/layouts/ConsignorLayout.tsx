import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import ds360Icon from '@assets/ds360_favicon.png';
import { useLanguage } from '@/hooks/use-language';
import type { Language } from '@/lib/i18n';
import { MobileBottomNav } from '@/components/MobileBottomNav';

interface Props { children?: React.ReactNode; }

export default function ConsignorLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const { language: lang, setLanguage, t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();

  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  const toggleTheme = () => {
    const next = theme === 'dark' ? '' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ds360-theme', next);
  };

  const handleSetLang = (l: string) => setLanguage(l as Language);
  const isActive = (path: string) => location.endsWith('/' + path) || location.includes('/' + path + '/');

  return (
    <>
      <nav className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-logo">
          <img src={ds360Icon} width="36" height="36" style={{borderRadius:8}} alt="DS360" />
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-sub" style={{fontSize:12,fontWeight:600}}>Consignor Portal</div>
            <span className="sidebar-badge" style={{marginTop:4}}>Consignor</span>
          </div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">{t('nav.overview')}</div>
            <Link className={`nav-item ${isActive('dashboard') ? 'active' : ''}`} to="dashboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>{t('nav.dashboard')}</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.myUnits')}</div>
            <Link className={`nav-item ${isActive('my-listings') ? 'active' : ''}`} to="my-listings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>{t('nav.myListings')}</Link>
            <Link className={`nav-item ${isActive('offers') ? 'active' : ''}`} to="offers"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 00-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 00-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 000-7.78z"/></svg>{t('nav.offers')}</Link>
            <Link className={`nav-item ${isActive('auctions') ? 'active' : ''}`} to="auctions"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2l-2 2-7 7 3 3 7-7 2-2-3-3z"/><path d="M3 21l4-4"/><path d="M17 3l4 4-2 2-4-4 2-2z"/></svg>{t('nav.auctions')}</Link>
            <Link className={`nav-item ${isActive('showcase') ? 'active' : ''}`} to="showcase"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 2 7 12 12 22 7 12 2"/><polyline points="2 17 12 22 22 17"/><polyline points="2 12 12 17 22 12"/></svg>{t('nav.showcase')}</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.finance')}</div>
            <Link className={`nav-item ${isActive('payout') ? 'active' : ''}`} to="payout"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>{t('nav.payoutTracking')}</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.more')}</div>
            <Link className={`nav-item ${isActive('settings') ? 'active' : ''}`} to="settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>{t('nav.settings')}</Link>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info" style={{cursor:'pointer'}}>
            <div className="user-avatar">{user?.name ? user.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0,2) : 'CO'}</div>
            <div>
              <div className="user-name">{user?.name ?? user?.email ?? 'Consignor'}</div>
              <div className="user-role">Consignor</div>
            </div>
          </div>
          <button onClick={async () => { await logout(); window.location.href = '/'; }} style={{width:'100%',marginTop:8,padding:'7px 12px',background:'none',border:'1px solid #e0e0e0',borderRadius:6,fontSize:12,color:'#888',cursor:'pointer',fontFamily:'inherit',textAlign:'left' as const,display:'flex',alignItems:'center',gap:6}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
        </div>
      </nav>
      <div className={`main${sidebarCollapsed ? ' collapsed-main' : ''}`}>
        <header className="header">
          <div className="header-left">
            <button className="hbtn" onClick={() => setSidebarCollapsed(c => !c)} title="Toggle sidebar" style={{flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
            <img src={ds360Icon} width="28" height="28" style={{borderRadius:6,flexShrink:0,marginRight:4}} alt="DS360" />
            <div>
              <div className="header-title">Consignor Portal</div>
              <div className="header-sub">Consignor</div>
            </div>
          </div>
          <div className="header-right">
            <div className="lang-toggle">
              <button className={`lang-btn-opt ${lang === 'en' ? 'active' : ''}`} onClick={() => handleSetLang('en')}>EN</button>
              <button className={`lang-btn-opt ${lang === 'fr' ? 'active' : ''}`} onClick={() => handleSetLang('fr')}>FR</button>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button>
          </div>
        </header>
        <div className="content">
          {children}
        </div>
        <MobileBottomNav
          portalType="consignor"
          activePage={location.split('/').filter(Boolean)[2] || 'dashboard'}
          onNavigate={(pageId) => {
            const p = location.split('/').filter(Boolean);
            setLocation(`/${p[0]}/${p[1]}/${pageId}`);
          }}
        />
      </div>
    </>
  );
}
