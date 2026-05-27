import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import ds360Icon from '@assets/ds360_favicon.png';
import SidebarFooter from '@/components/SidebarFooter';

interface Props { children?: React.ReactNode; }

export default function MarketplaceStaffLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [lang, setLang] = useState(() => localStorage.getItem('ds360-lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en'));
  const [location] = useLocation();
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

  const handleSetLang = (l: string) => { setLang(l); localStorage.setItem('ds360-lang', l); };
  const isActive = (path: string) => location.endsWith('/' + path) || location.includes('/' + path + '/');

  return (
    <>
      <nav className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-logo">
          <img src={ds360Icon} width="36" height="36" style={{borderRadius:8}} alt="DS360" />
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-sub" style={{fontSize:12,fontWeight:600}}>Marketplace</div>
            <span className="sidebar-badge" style={{marginTop:4}}>Staff</span>
          </div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Overview</div>
            <Link className={`nav-item ${isActive('dashboard') ? 'active' : ''}`} to="dashboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Marketplace</div>
            <Link className={`nav-item ${isActive('listings') ? 'active' : ''}`} to="listings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>Listings</Link>
            <Link className={`nav-item ${isActive('auctions') ? 'active' : ''}`} to="auctions"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2l-2 2-7 7 3 3 7-7 2-2-3-3z"/><path d="M3 21l4-4"/><path d="M17 3l4 4-2 2-4-4 2-2z"/></svg>Auctions</Link>
            <Link className={`nav-item ${isActive('bids') ? 'active' : ''}`} to="bids"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Bids</Link>
            <Link className={`nav-item ${isActive('members') ? 'active' : ''}`} to="members"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>Members</Link>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info" style={{cursor:'pointer'}}>
            <div className="user-avatar">{user?.email ? user.email.slice(0,2).toUpperCase() : 'MS'}</div>
            <div>
              <div className="user-name">{user?.email ?? 'Staff'}</div>
              <div className="user-role">Marketplace Staff</div>
            </div>
          </div>
          <button onClick={async () => { await logout(); window.location.href = '/'; }} style={{width:'100%',marginTop:8,padding:'7px 12px',background:'none',border:'1px solid #e0e0e0',borderRadius:6,fontSize:12,color:'#888',cursor:'pointer',fontFamily:'inherit',textAlign:'left' as const,display:'flex',alignItems:'center',gap:6}}>
            <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>
            Sign Out
          </button>
          <SidebarFooter />
        </div>
      </nav>
      <div className={`main${sidebarCollapsed ? ' collapsed-main' : ''}`}>
        <header className="header">
          <div className="header-left">
            <button className="hbtn" onClick={() => setSidebarCollapsed(c => !c)} title="Toggle sidebar" style={{flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
            <img src={ds360Icon} width="28" height="28" style={{borderRadius:6,flexShrink:0,marginRight:4}} alt="DS360" />
            <div>
              <div className="header-title">Marketplace Staff</div>
              <div className="header-sub">Operator Staff</div>
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
      </div>
    </>
  );
}
