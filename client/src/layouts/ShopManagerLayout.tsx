import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch } from '@/lib/api';
import ds360Icon from '@assets/ds360_favicon.png';
import { useLanguage } from '@/hooks/use-language';
import type { Language } from '@/lib/i18n';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useEnabledModules, hasModule } from '@/hooks/useEnabledModules';
import SidebarFooter from '@/components/SidebarFooter';

interface Props { children?: React.ReactNode; }

export default function ShopManagerLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const { language: lang, setLanguage, t } = useLanguage();
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const [notifOpen, setNotifOpen] = useState(false);
  const [notifItems, setNotifItems] = useState<any[]>([]);
  const [notifLoading, setNotifLoading] = useState(false);
  const notifRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  useEffect(() => {
    apiFetch<any>('/api/notifications/inbox')
      .then(d => setNotifItems(Array.isArray(d.notifications) ? d.notifications : []))
      .catch(() => {});
  }, []);

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
  const isActive = (path: string) => location.endsWith('/' + path) || location.includes('/' + path + '/');

  const loadNotifications = async () => {
    setNotifLoading(true);
    try {
      const data = await apiFetch<any>('/api/notifications/inbox');
      setNotifItems(Array.isArray(data.notifications) ? data.notifications : []);
    } catch { setNotifItems([]); } finally { setNotifLoading(false); }
  };
  const toggleNotif = () => { if (!notifOpen) loadNotifications(); setNotifOpen(o => !o); };
  const markAllRead = async () => {
    try {
      await apiFetch('/api/notifications/read-all', { method: 'PUT' });
      setNotifItems(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };
  const unreadCount = notifItems.filter(n => !n.isRead).length;
  const { modules: enabledModules, loading: modulesLoading } = useEnabledModules();
  const mod = (key: string) => modulesLoading || hasModule(enabledModules, key);

  return (
    <>
      <nav className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
        <div className="sidebar-logo">
          <img src={ds360Icon} width="36" height="36" style={{borderRadius:8}} alt="DS360" />
          <div className="sidebar-logo-text">
            <div className="sidebar-logo-sub" style={{fontSize:12,fontWeight:600}}>Shop Portal</div>
            <span className="sidebar-badge" style={{marginTop:4}}>Shop Mgr</span>
          </div>
        </div>
        <div className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">{t('nav.overview')}</div>
            <Link className={`nav-item ${isActive('dashboard') ? 'active' : ''}`} to="dashboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>{t('nav.dashboard')}</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.shop')}</div>
            {mod('techflow') && <Link className={`nav-item ${isActive('work-orders') ? 'active' : ''}`} to="work-orders"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>{t('nav.workOrders')}</Link>}
            {mod('techflow') && <Link className={`nav-item ${isActive('dispatch') ? 'active' : ''}`} to="dispatch"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>{t('nav.dispatchBoard')}</Link>}
            <Link className={`nav-item ${isActive('units') ? 'active' : ''}`} to="units"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>{t('nav.units')}</Link>
            {mod('parts') && <Link className={`nav-item ${isActive('parts') ? 'active' : ''}`} to="parts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>{t('nav.partsStatus')}</Link>}
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info" style={{cursor:'pointer'}}>
            <div className="user-avatar">{user?.name ? user.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0,2) : 'SH'}</div>
            <div>
              <div className="user-name">{user?.name ?? user?.email ?? 'Manager'}</div>
              <div className="user-role">Shop Manager</div>
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
              <div className="header-title">Shop Portal</div>
              <div className="header-sub">Shop Manager</div>
            </div>
          </div>
          <div className="header-right">
            <div className="lang-toggle">
              <button className={`lang-btn-opt ${lang === 'en' ? 'active' : ''}`} onClick={() => handleSetLang('en')}>EN</button>
              <button className={`lang-btn-opt ${lang === 'fr' ? 'active' : ''}`} onClick={() => handleSetLang('fr')}>FR</button>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button>
            <div ref={notifRef} style={{position:'relative'}}>
              <button className="hbtn" title="Notifications" onClick={toggleNotif} style={{position:'relative'}}>
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>
                {unreadCount > 0 && <span className="ndot"></span>}
              </button>
              {notifOpen && (
                <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:320,background:'var(--bg-card)',border:'1px solid var(--border)',borderRadius:10,boxShadow:'0 8px 32px rgba(0,0,0,.12)',zIndex:1000,overflow:'hidden'}}>
                  <div style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                    <span style={{fontSize:13,fontWeight:600,color:'var(--text, #333)'}}>Notifications {unreadCount > 0 && <span style={{marginLeft:6,background:'#033280',color:'#fff',borderRadius:10,fontSize:10,padding:'1px 6px',fontWeight:600}}>{unreadCount}</span>}</span>
                    {unreadCount > 0 && <button onClick={markAllRead} style={{fontSize:11,color:'#033280',background:'none',border:'none',cursor:'pointer',padding:0,fontFamily:'inherit'}}>Mark all read</button>}
                  </div>
                  {notifLoading && <div style={{padding:'24px 16px',textAlign:'center',color:'#888',fontSize:12}}>Loading…</div>}
                  {!notifLoading && notifItems.length === 0 && <div style={{padding:'24px 16px',textAlign:'center',color:'#aaa',fontSize:12}}>No notifications yet</div>}
                  {!notifLoading && notifItems.length > 0 && (
                    <div style={{maxHeight:380,overflowY:'auto'}}>
                      {notifItems.slice(0, 15).map(n => (
                        <div key={n.id} style={{padding:'10px 14px',borderBottom:'1px solid var(--border)',cursor:n.linkTo?'pointer':'default',background:n.isRead?'transparent':'#f0f5ff'}}
                          onClick={() => { apiFetch(`/api/notifications/${n.id}/read`, {method:'PUT'}).catch(()=>{}); setNotifItems(prev => prev.map(x => x.id===n.id?{...x,isRead:true}:x)); if (n.linkTo) window.location.href = n.linkTo; setNotifOpen(false); }}>
                          <div style={{display:'flex',alignItems:'flex-start',gap:8}}>
                            {!n.isRead && <div style={{width:6,height:6,borderRadius:'50%',background:'#033280',marginTop:4,flexShrink:0}}></div>}
                            <div style={{flex:1}}>
                              <div style={{fontSize:13,fontWeight:n.isRead?400:600,color:'var(--text,#333)',lineHeight:'1.4'}}>{n.title}</div>
                              {n.message && <div style={{fontSize:11,color:'#888',marginTop:2,lineHeight:'1.4'}}>{n.message}</div>}
                              <div style={{fontSize:10,color:'#bbb',marginTop:4}}>{new Date(n.createdAt).toLocaleDateString('en-CA',{month:'short',day:'numeric',hour:'2-digit',minute:'2-digit'})}</div>
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
          portalType="dealer"
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
