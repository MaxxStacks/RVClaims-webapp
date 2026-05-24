import { useState, useEffect } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import ds360Icon from '@assets/ds360_favicon.png';

interface Props { children?: React.ReactNode; }

export default function DealerOwnerLayout({ children }: Props) {
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
            <div className="sidebar-logo-sub" style={{fontSize:12,fontWeight:600}}>Dealer Portal</div>
            <span className="sidebar-badge" style={{marginTop:4}}>Owner</span>
          </div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Overview</div>
            <Link className={`nav-item ${isActive('dashboard') ? 'active' : ''}`} to="dashboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Claims</div>
            <Link className={`nav-item ${isActive('upload') ? 'active' : ''}`} to="upload"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Upload Photos</Link>
            <Link className={`nav-item ${isActive('claims') ? 'active' : ''}`} to="claims"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Claims</Link>
            <Link className={`nav-item ${isActive('units') ? 'active' : ''}`} to="units"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>Units</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Services</div>
            <Link className={`nav-item ${isActive('financing') ? 'active' : ''}`} to="financing"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Financing</Link>
            <Link className={`nav-item ${isActive('fi') ? 'active' : ''}`} to="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>F&amp;I</Link>
            <Link className={`nav-item ${isActive('warranty') ? 'active' : ''}`} to="warranty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>Warranty Plans</Link>
            <Link className={`nav-item ${isActive('parts') ? 'active' : ''}`} to="parts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Customers</div>
            <Link className={`nav-item ${isActive('customers') ? 'active' : ''}`} to="customers"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Customers</Link>
            <Link className={`nav-item ${isActive('customer-tickets') ? 'active' : ''}`} to="customer-tickets"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Customer Tickets</Link>
            <Link className={`nav-item ${isActive('documents') ? 'active' : ''}`} to="documents"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>Documents</Link>
            <Link className={`nav-item ${isActive('techflow') ? 'active' : ''}`} to="techflow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>TechFlow</Link>
            <Link className={`nav-item ${isActive('messages') ? 'active' : ''}`} to="messages"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Messages</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Market</div>
            <Link className={`nav-item ${isActive('marketplace') ? 'active' : ''}`} to="marketplace"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>Marketplace</Link>
            <Link className={`nav-item ${isActive('consignment') ? 'active' : ''}`} to="consignment"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>Consignment</Link>
            <Link className={`nav-item ${isActive('marketing') ? 'active' : ''}`} to="marketing"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>Marketing</Link>
            <Link className={`nav-item ${isActive('sales-services') ? 'active' : ''}`} to="sales-services"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>Sales &amp; Services</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Billing</div>
            <Link className={`nav-item ${isActive('invoices') ? 'active' : ''}`} to="invoices"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Invoices</Link>
            <Link className={`nav-item ${isActive('billing') ? 'active' : ''}`} to="billing"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>Billing</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Settings</div>
            <Link className={`nav-item ${isActive('notifications') ? 'active' : ''}`} to="notifications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>Notifications</Link>
            <Link className={`nav-item ${isActive('staff') ? 'active' : ''}`} to="staff"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>Staff</Link>
            <Link className={`nav-item ${isActive('branding') ? 'active' : ''}`} to="branding"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>Branding</Link>
            <Link className={`nav-item ${isActive('settings') ? 'active' : ''}`} to="settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Settings</Link>
            <Link className={`nav-item ${isActive('import') ? 'active' : ''}`} to="import"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Import Data</Link>
            <Link className={`nav-item ${isActive('whats-new') ? 'active' : ''}`} to="whats-new"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>What&apos;s New</Link>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info" style={{cursor:'pointer'}}>
            <div className="user-avatar">{user?.name ? user.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0,2) : 'DL'}</div>
            <div>
              <div className="user-name">{user?.name ?? user?.email ?? 'Dealer'}</div>
              <div className="user-role">Dealer Owner</div>
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
              <div className="header-title">Dealer Portal</div>
              <div className="header-sub">Dealer Owner</div>
            </div>
          </div>
          <div className="header-right">
            <div className="lang-toggle">
              <button className={`lang-btn-opt ${lang === 'en' ? 'active' : ''}`} onClick={() => handleSetLang('en')}>EN</button>
              <button className={`lang-btn-opt ${lang === 'fr' ? 'active' : ''}`} onClick={() => handleSetLang('fr')}>FR</button>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button>
            <button className="hbtn" title="Search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button>
            <Link className="hbtn" to="notifications" title="Notifications"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg><span className="ndot"></span></Link>
          </div>
        </header>
        <div className="content">
          {children}
        </div>
      </div>
    </>
  );
}
