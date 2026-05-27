import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { apiFetch } from '@/lib/api';
import { useQuery } from '@tanstack/react-query';
import ds360Icon from '@assets/ds360_favicon.png';
import type { Language } from '@/lib/i18n';
import { MobileBottomNav } from '@/components/MobileBottomNav';
import { useEnabledModules, hasModule } from '@/hooks/useEnabledModules';
import { useWallet } from '@/hooks/useWallet';

interface Props { children?: React.ReactNode; }

export default function DealerOwnerLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [location, setLocation] = useLocation();
  const { user, logout } = useAuth();
  const { language: lang, setLanguage, t } = useLanguage();
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
  const { modules: enabledModules, loading: modulesLoading, isFailOpen } = useEnabledModules();
  const { wallet, balance, isLowBalance, isGracePeriod, isPaused } = useWallet();
  const mod = (key: string) => modulesLoading || hasModule(enabledModules, key, isFailOpen);

  // DS360 Services section — active subscriptions + total module count
  const dealershipId = user?.dealershipId as string | undefined;
  const { data: subsData } = useQuery({
    queryKey: ['dealerSubscriptions', dealershipId],
    queryFn: () => apiFetch<{ subscriptions: { id: string; moduleSlug: string | null; moduleName: string | null }[] }>(
      `/api/dealerships/${dealershipId}/subscriptions`
    ),
    enabled: !!dealershipId,
    staleTime: 5 * 60 * 1000,
  });
  const { data: allModulesData } = useQuery({
    queryKey: ['serviceModules'],
    queryFn: () => apiFetch<{ modules: { id: string; isBase: boolean }[] }>('/api/modules'),
    staleTime: 5 * 60 * 1000,
  });
  const activeSubs = (subsData?.subscriptions || []).filter(s => s.moduleName);
  const totalModules = allModulesData?.modules?.filter(m => !m.isBase).length ?? 0;
  const moreAvailable = Math.max(0, totalModules - activeSubs.length);

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
        {/* ─── Wallet balance widget ─── */}
        {wallet && !sidebarCollapsed && (
          <div style={{
            margin: '6px 12px 2px',
            padding: '7px 10px',
            background: isPaused ? '#fef2f2' : isGracePeriod ? '#fff7ed' : isLowBalance ? '#fffbeb' : 'var(--bg-secondary, #f4f6fb)',
            borderRadius: 8,
            border: `1px solid ${isPaused ? '#fecaca' : isGracePeriod ? '#fed7aa' : isLowBalance ? '#fde68a' : 'var(--border, #e8e8e8)'}`,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 6,
          }}>
            <div style={{display:'flex',alignItems:'center',gap:5,minWidth:0}}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke={isPaused || isGracePeriod ? '#dc2626' : isLowBalance ? '#d97706' : '#22c55e'} strokeWidth="2.5" style={{flexShrink:0}}><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>
              <div style={{minWidth:0}}>
                <div style={{fontSize:10,color:'var(--text-muted,#888)',fontWeight:500,lineHeight:1.2}}>{t('wallet.wallet')}</div>
                <div style={{fontSize:13,fontWeight:700,color: isPaused || isGracePeriod ? '#dc2626' : isLowBalance ? '#d97706' : '#16a34a',lineHeight:1.3,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>
                  ${balance.toLocaleString('en-CA', {minimumFractionDigits: 2, maximumFractionDigits: 2})}
                </div>
              </div>
            </div>
            <div style={{display:'flex',alignItems:'center',gap:4,flexShrink:0}}>
              {isPaused && <span style={{fontSize:9,background:'#dc2626',color:'#fff',borderRadius:4,padding:'1px 5px',fontWeight:700}}>{t('wallet.servicesPaused')}</span>}
              {isGracePeriod && !isPaused && <span style={{fontSize:9,background:'#f97316',color:'#fff',borderRadius:4,padding:'1px 5px',fontWeight:700}}>{t('wallet.gracePeriod')}</span>}
              {isLowBalance && !isGracePeriod && !isPaused && <span style={{fontSize:9,background:'#d97706',color:'#fff',borderRadius:4,padding:'1px 5px',fontWeight:700}}>{t('wallet.lowBalance')}</span>}
              <Link
                to="wallet"
                style={{fontSize:10,color:'#033280',fontWeight:600,background:'none',border:'1px solid #c7d4f0',borderRadius:4,padding:'2px 6px',textDecoration:'none',display:'inline-block'}}
              >{t('wallet.fundWallet')}</Link>
            </div>
          </div>
        )}
        <div className="sidebar-nav">
          <div className="nav-section">
            <div className="nav-label">{t('nav.overview')}</div>
            <Link className={`nav-item ${isActive('dashboard') ? 'active' : ''}`} to="dashboard"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>{t('nav.dashboard')}</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.claims')}</div>
            <Link className={`nav-item ${isActive('upload') ? 'active' : ''}`} to="upload"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>{t('nav.uploadPhotos')}</Link>
            <Link className={`nav-item ${isActive('claims') ? 'active' : ''}`} to="claims"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>{t('nav.claims')}</Link>
            <Link className={`nav-item ${isActive('units') ? 'active' : ''}`} to="units"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>{t('nav.units')}</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.services')}</div>
            {mod('financing') && <Link className={`nav-item ${isActive('financing') ? 'active' : ''}`} to="financing"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>{t('nav.financing')}</Link>}
            {(mod('fi_services') || mod('ai_fi')) && <Link className={`nav-item ${isActive('fi') ? 'active' : ''}`} to="fi"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>{t('nav.fi')}</Link>}
            {mod('warranty_plans') && <Link className={`nav-item ${isActive('warranty') ? 'active' : ''}`} to="warranty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>{t('nav.warrantyPlans')}</Link>}
            {mod('parts') && <Link className={`nav-item ${isActive('parts') ? 'active' : ''}`} to="parts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>{t('nav.parts')}</Link>}
            {mod('service-financing') && <Link className={`nav-item ${isActive('payment-plans') ? 'active' : ''}`} to="payment-plans"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><line x1="6" y1="15" x2="10" y2="15"/></svg>{t('paymentPlan.title')}</Link>}
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.customers')}</div>
            <Link className={`nav-item ${isActive('customers') ? 'active' : ''}`} to="customers"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>{t('nav.customers')}</Link>
            <Link className={`nav-item ${isActive('customer-tickets') ? 'active' : ''}`} to="customer-tickets"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>{t('nav.customerTickets')}</Link>
            <Link className={`nav-item ${isActive('documents') ? 'active' : ''}`} to="documents"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>{t('nav.documents')}</Link>
            {mod('techflow') && <Link className={`nav-item ${isActive('techflow') ? 'active' : ''}`} to="techflow"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>{t('nav.techflow')}</Link>}
            <Link className={`nav-item ${isActive('deal-jackets') ? 'active' : ''}`} to="deal-jackets"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>{t('dealJacket.dealJackets')}</Link>
            <Link className={`nav-item ${isActive('messages') ? 'active' : ''}`} to="messages"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>{t('nav.messages')}</Link>
            <Link className={`nav-item ${isActive('knowledge-base') ? 'active' : ''}`} to="knowledge-base"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>{t('kb.knowledgeBase')}</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.market')}</div>
            {mod('marketplace') && <Link className={`nav-item ${isActive('marketplace') ? 'active' : ''}`} to="marketplace"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg>{t('nav.marketplace')}</Link>}
            {mod('consignment') && <Link className={`nav-item ${isActive('consignment') ? 'active' : ''}`} to="consignment"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="17 1 21 5 17 9"/><path d="M3 11V9a4 4 0 014-4h14"/><polyline points="7 23 3 19 7 15"/><path d="M21 13v2a4 4 0 01-4 4H3"/></svg>{t('nav.consignment')}</Link>}
            {mod('marketing') && <Link className={`nav-item ${isActive('marketing') ? 'active' : ''}`} to="marketing"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 20V10"/><path d="M12 20V4"/><path d="M6 20v-6"/></svg>{t('nav.marketing')}</Link>}
            <Link className={`nav-item ${isActive('sales-services') ? 'active' : ''}`} to="sales-services"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 12 20 22 4 22 4 12"/><rect x="2" y="7" width="20" height="5"/><path d="M12 22V7"/><path d="M12 7H7.5a2.5 2.5 0 010-5C11 2 12 7 12 7z"/><path d="M12 7h4.5a2.5 2.5 0 000-5C13 2 12 7 12 7z"/></svg>{t('nav.salesServices')}</Link>
            {mod('smart_upsell') && <Link className={`nav-item ${isActive('upsell') ? 'active' : ''}`} to="upsell"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>{t('upsell.title')}</Link>}
            {mod('customer_loyalty') && <Link className={`nav-item ${isActive('loyalty') ? 'active' : ''}`} to="loyalty"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>{t('loyalty.title')}</Link>}
            {mod('service_reminders') && <Link className={`nav-item ${isActive('reminders') ? 'active' : ''}`} to="reminders"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>{t('reminder.title')}</Link>}
          </div>
          <div className="nav-section">
            <div className="nav-label">{t('nav.billing')}</div>
            <Link className={`nav-item ${isActive('invoices') ? 'active' : ''}`} to="invoices"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>{t('nav.invoices')}</Link>
            <Link className={`nav-item ${isActive('billing') ? 'active' : ''}`} to="billing"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>{t('nav.billing')}</Link>
            <Link className={`nav-item ${isActive('wallet') ? 'active' : ''}`} to="wallet"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/><circle cx="12" cy="14" r="2"/></svg>{t('wallet.wallet')}</Link>
          </div>
          {/* ─── DS360 Services section ─────────────────────────────── */}
          <div className="nav-section" style={{ borderTop: '1px solid var(--border, #e8e8e8)', paddingTop: 8, marginTop: 4 }}>
            <div className="nav-label" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              {t('nav.ds360Services')}
            </div>
            <Link className={`nav-item ${isActive('modules') ? 'active' : ''}`} to="modules">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
              {t('nav.browseServices')}
            </Link>
            {activeSubs.map((sub) => {
              const slug = sub.moduleSlug || '';
              return (
                <Link
                  key={sub.id}
                  className={`nav-item ${isActive('modules/' + slug) ? 'active' : ''}`}
                  to={`modules/${slug}`}
                  style={{ paddingLeft: sidebarCollapsed ? undefined : 24 }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: '#22c55e', flexShrink: 0, display: 'inline-block' }} />
                  <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sub.moduleName}</span>
                </Link>
              );
            })}
            {moreAvailable > 0 && !sidebarCollapsed && (
              <Link
                className="nav-item"
                to="modules"
                style={{ fontSize: 11, color: '#033280', fontWeight: 600, paddingLeft: 24 }}
              >
                {moreAvailable} {t('nav.moreAvailable')}
              </Link>
            )}
          </div>

          <div className="nav-section">
            <div className="nav-label">{t('nav.settings')}</div>
            <Link className={`nav-item ${isActive('notifications') ? 'active' : ''}`} to="notifications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>{t('nav.notifications')}</Link>
            <Link className={`nav-item ${isActive('staff') ? 'active' : ''}`} to="staff"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>{t('nav.staff')}</Link>
            <Link className={`nav-item ${isActive('branding') ? 'active' : ''}`} to="branding"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>{t('nav.branding')}</Link>
            <Link className={`nav-item ${isActive('settings') ? 'active' : ''}`} to="settings"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>{t('nav.settings')}</Link>
            <Link className={`nav-item ${isActive('import') ? 'active' : ''}`} to="import"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>{t('nav.importData')}</Link>
            <Link className={`nav-item ${isActive('whats-new') ? 'active' : ''}`} to="whats-new"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>{t('nav.whatsNew')}</Link>
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
            <button className="hbtn" title="Scan Unit" onClick={() => { const p = location.split('/').filter(Boolean); setLocation(`/${p[0]}/${p[1]}/scan`); }} style={{color:'#16a34a'}}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h7v7h-7z"/></svg>
            </button>
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
