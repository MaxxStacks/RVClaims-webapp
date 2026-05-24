import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch } from '@/lib/api';
import ds360Icon from '@assets/ds360_favicon.png';

interface Props { children?: React.ReactNode; }

export default function OperatorAdminLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [lang, setLang] = useState(() => localStorage.getItem('ds360-lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en'));
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  // Item 15: FR toast
  const [frToast, setFrToast] = useState(false);

  // Item 16: Search
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState<any>(null);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchLoading, setSearchLoading] = useState(false);
  const searchRef = useRef<HTMLDivElement>(null);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Item 17: Notification bell
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Load notification count on mount (silent fail in dev mode)
  useEffect(() => {
    apiFetch<any>('/api/notifications/inbox')
      .then(d => setNotifItems(Array.isArray(d.notifications) ? d.notifications : []))
      .catch(() => {});
  }, []);

  // FR toast auto-dismiss
  useEffect(() => {
    if (!frToast) return;
    const t = setTimeout(() => setFrToast(false), 3000);
    return () => clearTimeout(t);
  }, [frToast]);

  // Search debounce
  useEffect(() => {
    if (!searchQuery || searchQuery.length < 2) { setSearchResults(null); return; }
    setSearchLoading(true);
    const t = setTimeout(async () => {
      try {
        const data = await apiFetch<any>(`/api/search?q=${encodeURIComponent(searchQuery)}`);
        setSearchResults(data.results || {});
      } catch {
        setSearchResults(null);
      } finally {
        setSearchLoading(false);
      }
    }, 300);
    return () => clearTimeout(t);
  }, [searchQuery]);

  // Click outside search
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(e.target as Node)) setSearchOpen(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
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

  const handleSetLang = (l: string) => {
    if (l === 'fr') { setFrToast(true); return; }
    setLang(l);
    localStorage.setItem('ds360-lang', l);
  };

  const openSearch = () => {
    setSearchOpen(true);
    setTimeout(() => searchInputRef.current?.focus(), 50);
  };

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
  const hasResults = searchResults && (
    (searchResults.dealers?.length > 0) ||
    (searchResults.units?.length > 0) ||
    (searchResults.claims?.length > 0)
  );

  return (
    <>
      {/* Item 15: FR toast */}
      {frToast && (
        <div style={{position:'fixed',top:16,left:'50%',transform:'translateX(-50%)',background:'#033280',color:'#fff',padding:'10px 20px',borderRadius:8,fontSize:13,zIndex:9999,boxShadow:'0 4px 16px rgba(0,0,0,.18)',whiteSpace:'nowrap',pointerEvents:'none'}}>
          French portal translation coming soon
        </div>
      )}

      <nav className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-logo">
          <img src={ds360Icon} width="36" height="36" style={{borderRadius:8}} alt="DS360" />
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-sub" style={{fontSize:12,fontWeight:600}}>Command Centre</div>
            <span className="sidebar-badge" style={{marginTop:4}}>Operator</span>
          </div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">Overview</div>
            <Link className={`nav-item ${isActive('dashboard') ? 'active' : ''}`} to="dashboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Claims</div>
            <Link className={`nav-item ${isActive('claims') ? 'active' : ''}`} to="claims"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Claims</Link>
            <Link className={`nav-item ${isActive('stale') ? 'active' : ''}`} to="stale"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Stale Claims</Link>
            <Link className={`nav-item ${isActive('queue') ? 'active' : ''}`} to="queue"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>Processing Queue</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Management</div>
            <Link className={`nav-item ${isActive('units') ? 'active' : ''}`} to="units"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>Units</Link>
            <Link className={`nav-item ${isActive('dealers') ? 'active' : ''}`} to="dealers"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>Dealers</Link>
            <Link className={`nav-item ${isActive('frc') ? 'active' : ''}`} to="frc"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>FRC Codes</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Services</div>
            <Link className={`nav-item ${isActive('financing') ? 'active' : ''}`} to="financing"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Financing</Link>
            <Link className={`nav-item ${isActive('fi') ? 'active' : ''}`} to="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>F&amp;I</Link>
            <Link className={`nav-item ${isActive('warranty-plans') ? 'active' : ''}`} to="warranty-plans"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>Warranty Plans</Link>
            <Link className={`nav-item ${isActive('parts') ? 'active' : ''}`} to="parts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts</Link>
            <Link className={`nav-item ${isActive('marketplace') ? 'active' : ''}`} to="marketplace"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>Marketplace</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">Finance</div>
            <Link className={`nav-item ${isActive('invoices') ? 'active' : ''}`} to="invoices"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Invoices</Link>
            <Link className={`nav-item ${isActive('reports') ? 'active' : ''}`} to="reports"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Reports</Link>
            <Link className={`nav-item ${isActive('products') ? 'active' : ''}`} to="products"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/></svg>Products</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">CRM</div>
            <Link className={`nav-item ${isActive('crm') ? 'active' : ''}`} to="crm"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/></svg>CRM</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">System</div>
            <Link className={`nav-item ${isActive('roadmap') ? 'active' : ''}`} to="roadmap"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="3 6 9 3 15 6 21 3 21 18 15 21 9 18 3 21 3 6"/><line x1="9" y1="3" x2="9" y2="18"/><line x1="15" y1="6" x2="15" y2="21"/></svg>Roadmap</Link>
            <Link className={`nav-item ${isActive('communications') ? 'active' : ''}`} to="communications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Communications</Link>
            <Link className={`nav-item ${isActive('blog') ? 'active' : ''}`} to="blog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Blog</Link>
            <Link className={`nav-item ${isActive('notifications') ? 'active' : ''}`} to="notifications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>Send Notifications</Link>
            <Link className={`nav-item ${isActive('users') ? 'active' : ''}`} to="users"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Users &amp; Roles</Link>
            <Link className={`nav-item ${isActive('settings') ? 'active' : ''}`} to="settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Settings</Link>
            <Link className={`nav-item ${isActive('platform-settings') ? 'active' : ''}`} to="platform-settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="4" y1="21" x2="4" y2="14"/><line x1="4" y1="10" x2="4" y2="3"/><line x1="12" y1="21" x2="12" y2="12"/><line x1="12" y1="8" x2="12" y2="3"/><line x1="20" y1="21" x2="20" y2="16"/><line x1="20" y1="12" x2="20" y2="3"/><line x1="1" y1="14" x2="7" y2="14"/><line x1="9" y1="8" x2="15" y2="8"/><line x1="17" y1="16" x2="23" y2="16"/></svg>Platform Settings</Link>
            <Link className={`nav-item ${isActive('import') ? 'active' : ''}`} to="import"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>Import Data</Link>
            <Link className={`nav-item ${isActive('changelog') ? 'active' : ''}`} to="changelog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Changelog</Link>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info" style={{cursor:'pointer'}}>
            <div className="user-avatar">{user?.name ? user.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0,2) : 'OP'}</div>
            <div>
              <div className="user-name">{user?.name ?? user?.email ?? 'Operator'}</div>
              <div className="user-role">Operator Admin</div>
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
              <div className="header-title">Command Centre</div>
              <div className="header-sub">Operator Admin</div>
            </div>
          </div>
          <div className="header-right">
            <div className="lang-toggle">
              <button className={`lang-btn-opt ${lang === 'en' ? 'active' : ''}`} onClick={() => handleSetLang('en')}>EN</button>
              <button className={`lang-btn-opt ${lang === 'fr' ? 'active' : ''}`} onClick={() => handleSetLang('fr')}>FR</button>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button>

            {/* Item 16: Search dropdown */}
            <div ref={searchRef} style={{position:'relative'}}>
              <button className="hbtn" title="Search" onClick={openSearch}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
              </button>
              {searchOpen && (
                <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:380,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'0 8px 32px rgba(0,0,0,.12)',zIndex:1000,overflow:'hidden'}}>
                  <div style={{padding:'10px 12px',borderBottom:'1px solid var(--border)',display:'flex',alignItems:'center',gap:8}}>
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#888" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    <input
                      ref={searchInputRef}
                      value={searchQuery}
                      onChange={e => setSearchQuery(e.target.value)}
                      placeholder="Search dealers, units, claims…"
                      style={{flex:1,border:'none',background:'none',fontSize:13,outline:'none',color:'var(--text, #333)',fontFamily:'inherit'}}
                    />
                    {searchQuery && <button onClick={() => setSearchQuery('')} style={{background:'none',border:'none',cursor:'pointer',color:'#aaa',fontSize:16,lineHeight:1,padding:0}}>×</button>}
                  </div>
                  {searchLoading && (
                    <div style={{padding:'20px 16px',textAlign:'center',color:'#888',fontSize:12}}>Searching…</div>
                  )}
                  {!searchLoading && searchQuery.length >= 2 && !hasResults && (
                    <div style={{padding:'20px 16px',textAlign:'center',color:'#888',fontSize:12}}>No results for "{searchQuery}"</div>
                  )}
                  {!searchLoading && !searchQuery && (
                    <div style={{padding:'20px 16px',textAlign:'center',color:'#bbb',fontSize:12}}>Type to search across dealers, units, and claims</div>
                  )}
                  {!searchLoading && hasResults && (
                    <div style={{maxHeight:360,overflowY:'auto'}}>
                      {searchResults.dealers?.length > 0 && (
                        <>
                          <div style={{padding:'7px 12px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#aaa',background:'var(--bg-secondary, #f9fafb)'}}>Dealers</div>
                          {searchResults.dealers.map((d: any) => (
                            <div key={d.id} style={{padding:'9px 12px',cursor:'pointer',fontSize:13,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid var(--border)'}} onMouseDown={() => { navigate(`/operator/admin/dealers/${d.id}`); setSearchOpen(false); setSearchQuery(''); }}>
                              <span style={{fontWeight:500,color:'var(--text, #333)'}}>{d.name}</span>
                              <span style={{color:'#aaa',fontSize:11}}>{[d.city, d.province].filter(Boolean).join(', ')}</span>
                            </div>
                          ))}
                        </>
                      )}
                      {searchResults.units?.length > 0 && (
                        <>
                          <div style={{padding:'7px 12px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#aaa',background:'var(--bg-secondary, #f9fafb)'}}>Units</div>
                          {searchResults.units.map((u: any) => (
                            <div key={u.id} style={{padding:'9px 12px',cursor:'pointer',fontSize:13,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid var(--border)'}} onMouseDown={() => { navigate(`/operator/admin/units/${u.id}`); setSearchOpen(false); setSearchQuery(''); }}>
                              <span style={{fontWeight:500,color:'var(--text, #333)',fontFamily:'monospace'}}>{u.vin}</span>
                              <span style={{color:'#aaa',fontSize:11}}>{[u.year, u.manufacturer, u.model].filter(Boolean).join(' ')}</span>
                            </div>
                          ))}
                        </>
                      )}
                      {searchResults.claims?.length > 0 && (
                        <>
                          <div style={{padding:'7px 12px',fontSize:10,fontWeight:700,textTransform:'uppercase',letterSpacing:1,color:'#aaa',background:'var(--bg-secondary, #f9fafb)'}}>Claims</div>
                          {searchResults.claims.map((c: any) => (
                            <div key={c.id} style={{padding:'9px 12px',cursor:'pointer',fontSize:13,display:'flex',justifyContent:'space-between',alignItems:'center',borderBottom:'1px solid var(--border)'}} onMouseDown={() => { navigate(`/operator/admin/claims/${c.id}`); setSearchOpen(false); setSearchQuery(''); }}>
                              <span style={{fontWeight:500,color:'var(--text, #333)'}}>{c.claimNumber}</span>
                              <span style={{color:'#aaa',fontSize:11}}>{[c.manufacturer, c.status].filter(Boolean).join(' · ')}</span>
                            </div>
                          ))}
                        </>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>

            {/* Item 17: Notification bell dropdown */}
            <div ref={notifRef} style={{position:'relative'}}>
              <button className="hbtn" title="Notifications" onClick={toggleNotif} style={{position:'relative'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                {unreadCount > 0 && <span className="ndot"></span>}
              </button>
              {notifOpen && (
                <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:320,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'0 8px 32px rgba(0,0,0,.12)',zIndex:1000,overflow:'hidden'}}>
                  <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--text, #333)'}}>Notifications {unreadCount > 0 && <span style={{marginLeft:6,background:'#033280',color:'#fff',borderRadius:10,fontSize:10,padding:'1px 6px',fontWeight:600}}>{unreadCount}</span>}</span>
                    {unreadCount > 0 && (
                      <button onClick={markAllRead} style={{fontSize:11,color:'#033280',background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit'}}>Mark all read</button>
                    )}
                  </div>
                  {notifLoading && <div style={{padding:'24px 16px',textAlign:'center',color:'#888',fontSize:12}}>Loading…</div>}
                  {!notifLoading && notifItems.length === 0 && <div style={{padding:'24px 16px',textAlign:'center',color:'#aaa',fontSize:12}}>No notifications yet</div>}
                  {!notifLoading && notifItems.length > 0 && (
                    <div style={{maxHeight:380,overflowY:'auto'}}>
                      {notifItems.slice(0, 15).map(n => (
                        <div
                          key={n.id}
                          style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',cursor:n.linkTo ? 'pointer' : 'default',background:n.isRead ? 'transparent' : '#f0f5ff'}}
                          onClick={() => { if (n.linkTo) { navigate(n.linkTo); setNotifOpen(false); } }}
                        >
                          <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
                            {!n.isRead && <div style={{width:6,height:6,borderRadius:'50%',background:'#033280',marginTop:4,flexShrink:0}}></div>}
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:n.isRead ? 400 : 600,color:'var(--text, #333)',lineHeight:'1.4'}}>{n.title}</div>
                              {n.message && <div style={{fontSize:11,color:'#888',marginTop:2,lineHeight:'1.4'}}>{n.message}</div>}
                              <div style={{fontSize:10,color:'#bbb',marginTop:4}}>
                                {new Date(n.createdAt).toLocaleDateString('en-CA', {month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}
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
      </div>
    </>
  );
}
