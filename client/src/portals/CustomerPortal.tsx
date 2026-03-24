// CustomerPortal.tsx - Converted from customer-portal.html
// Layout: sidebar(position:fixed) + main(margin-left:240px) + content(block) + page(display:block)
// DO NOT modify layout structure. DO NOT add display:flex to .content.

import { useState, useEffect } from 'react';
import ds360Icon from '@assets/ds360_favicon.png';
import ds360LogoLight from '@assets/DS360_logo_light.png';
import ds360LogoDark from '@assets/DS360_logo_dark.png';
import { MobileBottomNav, OfflineBanner } from '../components/MobileBottomNav';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { wsClient } from '@/lib/websocket';

export default function CustomerPortal() {
  const [activePage, setActivePage] = useState('dashboard');
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [pageSub, setPageSub] = useState('Welcome back, Robert');
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [lang, setLang] = useState(() => localStorage.getItem('ds360-lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en'));

  const [custSettingsTab, setCustSettingsTab] = useState('cs-profile');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const { user, logout } = useAuth();

  // ─── API data state ────────────────────────────────────────────────────────
  const [custClaims, setCustClaims] = useState<any[]>([]);
  const [custUnit, setCustUnit] = useState<any | null>(null);
  const [custTickets, setCustTickets] = useState<any[]>([]);
  const [custPartsOrders, setCustPartsOrders] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  // ─── Selected IDs ──────────────────────────────────────────────────────────
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // ─── New ticket form ───────────────────────────────────────────────────────
  const [ticketForm, setTicketForm] = useState({ subject: '', category: 'general', description: '' });
  const [ticketSaving, setTicketSaving] = useState(false);

  // ─── Chat ──────────────────────────────────────────────────────────────────
  const [chatMessage, setChatMessage] = useState('');
  const [chatMessages, setChatMessages] = useState<any[]>([]);

  const titles: Record<string, [string, string]> = {dashboard:['Dashboard','Welcome back, Robert'],'my-unit':['My Unit','2024 Jayco Jay Flight 264BH'],warranty:['Warranty \u0026 Coverage','Active coverage details'],documents:['Documents','Warranty certs, inspection reports'],claims:['Claim Status','Track your claims'],'claim-detail':['CLM-0248','Warranty claim in progress'],'report-issue':['Report an Issue','Upload photos and describe the problem'],parts:['Parts Orders','Track parts for your claims'],'fi-products':['Protection Plans','Available products for your RV'],roadside:['Roadside Assistance','Coming soon'],tickets:['Support Tickets','Track conversations with dealer'],'ticket-detail':['TKT-0042','Warranty claim ticket'],'new-ticket':['New Ticket','Create a support ticket'],'quick-chat':['Quick Chat','Quick questions with Smith\u0027s RV Centre'],settings:['Settings','Your profile and preferences']};

  const parents: Record<string, string> = {'claim-detail':'claims','ticket-detail':'tickets','new-ticket':'tickets'};

  useEffect(() => { if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); }, []);

  // ─── Data fetching ─────────────────────────────────────────────────────────
  useEffect(() => {
    setDataError(null);
    const fetch = async () => {
      try {
        if (activePage === 'dashboard' || activePage === 'claims') {
          const d = await apiFetch<any>('/api/claims');
          setCustClaims(d.claims || []);
        }
        if (activePage === 'dashboard' || activePage === 'my-unit' || activePage === 'warranty') {
          const d = await apiFetch<any>('/api/units');
          setCustUnit((d.units || [])[0] || null);
        }
        if (activePage === 'tickets' || activePage === 'ticket-detail') {
          const d = await apiFetch<any>('/api/tickets');
          setCustTickets(d.tickets || []);
        }
        if (activePage === 'parts') {
          const d = await apiFetch<any>('/api/parts-orders');
          setCustPartsOrders(d.partsOrders || []);
        }
      } catch (err: any) {
        setDataError(err?.message || 'Failed to load data');
      }
    };
    fetch();
  }, [activePage]);

  // ─── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    wsClient.connect();
    const unsubTicket = wsClient.on<any>('ticket:message', (payload) => {
      if (activePage === 'ticket-detail' || activePage === 'quick-chat') {
        setChatMessages(prev => [...prev, payload]);
      }
    });
    return () => { unsubTicket(); };
  }, [activePage]);

  // ─── Form handlers ─────────────────────────────────────────────────────────
  const handleSubmitTicket = async () => {
    if (!ticketForm.subject || !ticketForm.description) return;
    setTicketSaving(true);
    try {
      await apiFetch('/api/tickets', {
        method: 'POST',
        body: JSON.stringify({ subject: ticketForm.subject, category: ticketForm.category, description: ticketForm.description }),
      });
      setTicketForm({ subject: '', category: 'general', description: '' });
      const d = await apiFetch<any>('/api/tickets');
      setCustTickets(d.tickets || []);
      showPage('tickets');
    } catch { /* ignore */ } finally { setTicketSaving(false); }
  };

  const handleSendChat = async () => {
    if (!chatMessage.trim() || !selectedTicketId) return;
    try {
      const msg = chatMessage;
      setChatMessage('');
      await apiFetch(`/api/tickets/${selectedTicketId}/messages`, { method: 'POST', body: JSON.stringify({ content: msg }) });
      setChatMessages(prev => [...prev, { content: msg, sender: 'client', createdAt: new Date().toISOString() }]);
    } catch { /* ignore */ }
  };

  const showPage = (id: string) => {
    setActivePage(id);
    if (titles[id]) { setPageTitle(titles[id][0]); setPageSub(titles[id][1]); }
    window.scrollTo(0, 0);
  };

  const isNavActive = (pageId: string) => activePage === pageId || parents[activePage] === pageId;

  const toggleTheme = () => {
    const next = theme === 'dark' ? '' : 'dark';
    setTheme(next);
    document.documentElement.setAttribute('data-theme', next);
    localStorage.setItem('ds360-theme', next);
  };

  const handleSetLang = (l: string) => { setLang(l); localStorage.setItem('ds360-lang', l); };

  const switchTab = (e: React.MouseEvent) => {
    const el = e.currentTarget as HTMLElement;
    el.parentElement?.querySelectorAll('.tab').forEach(s => s.classList.remove('active'));
    el.classList.add('active');
  };


  // File upload: customer profile photo
  const updateCustProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const avatar = document.getElementById('cust-profile-avatar');
      if (avatar) avatar.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />';
      const sidebar = document.getElementById('cust-avatar');
      if (sidebar) sidebar.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />';
    };
    reader.readAsDataURL(file);
  };

  return (
    <>
<nav className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
  <div className="sidebar-logo"><img src={ds360Icon} width="36" height="36" style={{borderRadius:8}} alt="DS360" /><div className="sidebar-logo-text"><div className="sidebar-logo-name">Smith's RV Centre</div><div className="sidebar-logo-sub">Client Portal</div></div><span className="sidebar-badge">Client</span></div>
  <div className="sidebar-nav">
    <div className="nav-section"><div className="nav-label">Overview</div>
      <div className={`nav-item ${isNavActive('dashboard') ? 'active' : ''}`} onClick={() => showPage('dashboard')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div></div>
    <div className="nav-section"><div className="nav-label">My RV</div>
      <div className={`nav-item ${isNavActive('my-unit') ? 'active' : ''}`} onClick={() => showPage('my-unit')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>My Unit</div>
      <div className={`nav-item ${isNavActive('warranty') ? 'active' : ''}`} onClick={() => showPage('warranty')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Warranty & Coverage</div>
      <div className={`nav-item ${isNavActive('documents') ? 'active' : ''}`} onClick={() => showPage('documents')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Documents</div></div>
    <div className="nav-section"><div className="nav-label">Service</div>
      <div className={`nav-item ${isNavActive('claims') ? 'active' : ''}`} onClick={() => showPage('claims')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>Claim Status<span className="nb blue">1</span></div>
      <div className={`nav-item ${isNavActive('report-issue') ? 'active' : ''}`} onClick={() => showPage('report-issue')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Report an Issue</div>
      <div className={`nav-item ${isNavActive('parts') ? 'active' : ''}`} onClick={() => showPage('parts')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts Orders</div></div>
    <div className="nav-section"><div className="nav-label">Extras</div>
      <div className={`nav-item ${isNavActive('fi-products') ? 'active' : ''}`} onClick={() => showPage('fi-products')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>Protection Plans<span className="nb green">New</span></div>
      <div className={`nav-item ${isNavActive('roadside') ? 'active' : ''}`} onClick={() => showPage('roadside')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81"/></svg>Roadside Assist<span className="nb amber">Soon</span></div></div>
    <div className="nav-section"><div className="nav-label">Account</div>
      <div className={`nav-item ${isNavActive('tickets') ? 'active' : ''}`} onClick={() => showPage('tickets')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Support Tickets<span className="nb blue">3</span></div>
      <div className={`nav-item ${isNavActive('quick-chat') ? 'active' : ''}`} onClick={() => showPage('quick-chat')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Quick Chat</div>
      <div className={`nav-item ${isNavActive('settings') ? 'active' : ''}`} onClick={() => showPage('settings')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09"/></svg>Settings</div></div>
  </div>
  <div className="sidebar-footer"><div className="user-info" onClick={() => showPage('settings')}><div className="user-avatar" id="cust-avatar">RM</div><div><div className="user-name">Robert Martin</div><div className="user-role">Client</div></div></div><button onClick={async () => { await logout(); window.location.href = '/'; }} style={{width:'100%',marginTop:8,padding:'7px 12px',background:'none',border:'1px solid #e0e0e0',borderRadius:6,fontSize:12,color:'#888',cursor:'pointer',fontFamily:'inherit',textAlign:'left' as const,display:'flex',alignItems:'center',gap:6}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</button></div>
</nav>
<div className={`main${sidebarCollapsed ? ' collapsed-main' : ''}`}>
<header className="header"><div className="header-left"><button className="hbtn" onClick={() => setSidebarCollapsed(c => !c)} title="Toggle sidebar" style={{flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button><img src={ds360Icon} width="28" height="28" style={{borderRadius:6,flexShrink:0,marginRight:4}} alt="DS360" /><div><div className="header-title" id="page-title">{pageTitle}</div><div className="header-sub" id="page-sub">{pageSub}</div></div></div><div className="header-right"><div className="lang-toggle" id="lang-toggle"><button className={`lang-btn-opt ${lang === "en" ? "active" : ""}`} id="lang-en" onClick={() => handleSetLang('en')}>EN</button><button className={`lang-btn-opt ${lang === "fr" ? "active" : ""}`} id="lang-fr" onClick={() => handleSetLang('fr')}>FR</button></div><button className="theme-toggle" onClick={() => toggleTheme()} id="theme-btn" title="Toggle dark mode"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button><button className="hbtn" onClick={() => showPage('tickets')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><span className="ndot"></span></button></div></header>
<div className="content">



<div className={`page ${activePage === 'dashboard' ? 'active' : ''}`} id="page-dashboard">
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 28}}>
    <div className="al"><div className="al-i in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg></div><div className="al-c"><div className="al-t">Claim in progress</div><div className="al-d">CLM-0248 — Being processed</div></div><span className="al-a" onClick={() => showPage('claim-detail')}>Track</span></div>
    <div className="al"><div className="al-i pu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div className="al-c"><div className="al-t">Protection plans available</div><div className="al-d">New products for your RV</div></div><span className="al-a" onClick={() => showPage('fi-products')}>View</span></div>
    <div className="al"><div className="al-i gr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div className="al-c"><div className="al-t">Warranty active</div><div className="al-d">Covered until Feb 10, 2028</div></div><span className="al-a" onClick={() => showPage('warranty')}>Details</span></div>
  </div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      
      <div className="pn" style={{marginBottom: 20}}>
        <div style={{padding: 20, display: 'flex', gap: 20, alignItems: 'flex-start'}}>
          <div style={{width: 120, height: 80, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, color: '#888', flexShrink: 0}}>Unit Photo</div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 18, fontWeight: 700, color: '#111', marginBottom: 4}}>2024 Jayco Jay Flight 264BH</div>
            <div style={{fontSize: 13, color: '#888', marginBottom: 8}}>VIN: 1UJBJ0BN8M1TJ4K1 · Travel Trailer</div>
            <div style={{display: 'flex', gap: 8}}>
              <span className="bg active">Warranty Active</span>
              <span className="bg" style={{background: '#eff6ff', color: 'var(--brand)'}}>Ext. Warranty — 2031</span>
            </div>
          </div>
          <button className="btn btn-o btn-sm" onClick={() => showPage('my-unit')}>View Details</button>
        </div>
      </div>
      
      <div className="pn"><div className="pn-h"><span className="pn-t">Recent Activity</span></div>
        <div className="act">
          <div className="act-i"><span className="act-dot new"></span><div><div className="act-t">Your warranty claim <strong>CLM-0248</strong> is being processed</div><div className="act-tm">2 hours ago</div></div></div>
          <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t">Claim <strong>CLM-0237</strong> completed — <strong>$3,920</strong> approved</div><div className="act-tm">Mar 8</div></div></div>
          <div className="act-i"><span className="act-dot pay"></span><div><div className="act-t">Extended warranty <strong>activated</strong> — Guardsman RV Comprehensive</div><div className="act-tm">Feb 10</div></div></div>
          <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t">Your RV was <strong>delivered</strong></div><div className="act-tm">Feb 10</div></div></div>
        </div>
      </div>
    </div>
    <div>
      
      <div className="pn" style={{marginBottom: 20}}><div className="pn-h"><span className="pn-t">Quick Actions</span></div>
        <div style={{padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8}}>
          <button className="btn btn-p" style={{width: '100%', justifyContent: 'center'}} onClick={() => showPage('report-issue')}>Report an Issue</button>
          <button className="btn btn-o" style={{width: '100%', justifyContent: 'center'}} onClick={() => showPage('quick-chat')}>Message Dealer</button>
          <button className="btn btn-o" style={{width: '100%', justifyContent: 'center'}} onClick={() => showPage('documents')}>View Documents</button>
        </div>
      </div>
      
      <div className="cd-section"><div className="cd-section-h">Your Dealer</div>
        <div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value">Smith's RV Centre</span></div>
        <div className="cd-row"><span className="cd-label">Phone</span><span className="cd-value">(905) 555-0100</span></div>
        <div className="cd-row"><span className="cd-label">Email</span><span className="cd-value" style={{color: 'var(--brand)'}}>info@smithsrv.ca</span></div>
        <div className="cd-row"><span className="cd-label">Location</span><span className="cd-value">Hamilton, ON</span></div>
      </div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'my-unit' ? 'active' : ''}`} id="page-my-unit">
  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0}} className="pn">
    <div style={{borderRight: '1px solid #f0f0f0'}}>
      <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Vehicle</div>
      <div className="cd-row"><span className="cd-label">Year / Make / Model</span><span className="cd-value">2024 Jayco Jay Flight 264BH</span></div>
      <div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily: 'monospace', fontSize: 12}}>1UJBJ0BN8M1TJ4K1</span></div>
      <div className="cd-row"><span className="cd-label">Type</span><span className="cd-value">Travel Trailer</span></div>
      <div className="cd-row"><span className="cd-label">Delivered</span><span className="cd-value">Feb 10, 2026</span></div>
      <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Service History</div>
      <div className="cd-row"><span className="cd-label">Total Claims</span><span className="cd-value">3</span></div>
      <div className="cd-row"><span className="cd-label">Total Approved</span><span className="cd-value" style={{color: '#22c55e'}}>$5,920</span></div>
      <div className="cd-row"><span className="cd-label">Last Service</span><span className="cd-value">Mar 16, 2026</span></div>
    </div>
    <div>
      <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Warranty Coverage</div>
      <div className="cd-row"><span className="cd-label">Manufacturer Warranty</span><span className="cd-value"><span className="bg active">Active</span></span></div>
      <div className="cd-row"><span className="cd-label">Warranty Expiry</span><span className="cd-value">Feb 10, 2028</span></div>
      <div className="cd-row"><span className="cd-label">Extended Warranty</span><span className="cd-value"><span className="bg active">Active</span></span></div>
      <div className="cd-row"><span className="cd-label">Provider</span><span className="cd-value">Guardsman RV — Comprehensive</span></div>
      <div className="cd-row"><span className="cd-label">Ext. Expiry</span><span className="cd-value">Feb 10, 2031</span></div>
      <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Inspections</div>
      <div className="cd-row"><span className="cd-label">DAF Inspection</span><span className="cd-value"><span className="bg authorized">Completed</span> Jan 22</span></div>
      <div className="cd-row"><span className="cd-label">PDI Inspection</span><span className="cd-value"><span className="bg authorized">Completed</span> Feb 5</span></div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'warranty' ? 'active' : ''}`} id="page-warranty">
  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 20}}>
    <div className="cd-section" style={{margin: 0}}><div className="cd-section-h">Manufacturer Warranty</div>
      <div style={{padding: 20, textAlign: 'center'}}><div style={{fontSize: 48, fontWeight: 700, color: 'var(--brand)', marginBottom: 4}}>699</div><div style={{fontSize: 13, color: '#888', marginBottom: 16}}>days remaining</div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4, marginBottom: 8}}><div style={{height: '100%', width: '35%', background: 'var(--brand)', borderRadius: 4}}></div></div><div style={{fontSize: 12, color: '#888'}}>Feb 10, 2026 → Feb 10, 2028</div></div>
    </div>
    <div className="cd-section" style={{margin: 0}}><div className="cd-section-h">Extended Warranty — Guardsman RV</div>
      <div style={{padding: 20, textAlign: 'center'}}><div style={{fontSize: 48, fontWeight: 700, color: 'var(--accent)', marginBottom: 4}}>1,795</div><div style={{fontSize: 13, color: '#888', marginBottom: 16}}>days remaining</div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4, marginBottom: 8}}><div style={{height: '100%', width: '10%', background: 'var(--accent)', borderRadius: 4}}></div></div><div style={{fontSize: 12, color: '#888'}}>Feb 10, 2026 → Feb 10, 2031 · Comprehensive</div></div>
    </div>
  </div>
  <div className="pn"><div className="pn-h"><span className="pn-t">What's Covered</span></div>
    <div style={{padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16}}>
      <div style={{textAlign: 'center', padding: 16}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" style={{marginBottom: 8}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg><div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Structural</div><div style={{fontSize: 12, color: '#888'}}>Walls, roof, floor, frame</div></div>
      <div style={{textAlign: 'center', padding: 16}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" style={{marginBottom: 8}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg><div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Plumbing</div><div style={{fontSize: 12, color: '#888'}}>Pipes, fixtures, water heater</div></div>
      <div style={{textAlign: 'center', padding: 16}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" style={{marginBottom: 8}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg><div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Electrical</div><div style={{fontSize: 12, color: '#888'}}>Wiring, panel, outlets</div></div>
      <div style={{textAlign: 'center', padding: 16}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" style={{marginBottom: 8}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg><div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>HVAC</div><div style={{fontSize: 12, color: '#888'}}>Furnace, AC, vents</div></div>
      <div style={{textAlign: 'center', padding: 16}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" style={{marginBottom: 8}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg><div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Appliances</div><div style={{fontSize: 12, color: '#888'}}>Fridge, stove, microwave</div></div>
      <div style={{textAlign: 'center', padding: 16}}><svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="var(--brand)" strokeWidth="1.5" style={{marginBottom: 8}}><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg><div style={{fontSize: 13, fontWeight: 600, marginBottom: 4}}>Slide-Outs</div><div style={{fontSize: 12, color: '#888'}}>Mechanism, seals, motors</div></div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'documents' ? 'active' : ''}`} id="page-documents">
  <div className="pn"><div className="pn-h"><span className="pn-t">My Documents</span></div>
    <div className="tw"><table><thead><tr><th>Document</th><th>Type</th><th>Date</th><th>Action</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 500}}>Warranty Certificate</td><td>Warranty</td><td>Feb 10, 2026</td><td><button className="btn btn-o btn-sm">Download</button></td></tr>
      <tr><td style={{fontWeight: 500}}>Extended Warranty — Guardsman RV</td><td>Warranty</td><td>Feb 10, 2026</td><td><button className="btn btn-o btn-sm">Download</button></td></tr>
      <tr><td style={{fontWeight: 500}}>DAF Inspection Report</td><td>Inspection</td><td>Jan 22, 2026</td><td><button className="btn btn-o btn-sm">Download</button></td></tr>
      <tr><td style={{fontWeight: 500}}>PDI Inspection Report</td><td>Inspection</td><td>Feb 5, 2026</td><td><button className="btn btn-o btn-sm">Download</button></td></tr>
      <tr><td style={{fontWeight: 500}}>Purchase Agreement</td><td>Contract</td><td>Feb 8, 2026</td><td><button className="btn btn-o btn-sm">Download</button></td></tr>
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'claims' ? 'active' : ''}`} id="page-claims">
  <div className="pn"><div className="pn-h"><span className="pn-t">My Claims</span></div>
    <div className="tw"><table><thead><tr><th>Claim</th><th>Type</th><th>Issues</th><th>Status</th><th>Est. Value</th><th>Submitted</th><th>Action</th></tr></thead><tbody>
      {custClaims.length === 0
        ? <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:20}}>No claims found</td></tr>
        : custClaims.map(c => (
          <tr key={c.id}>
            <td style={{fontWeight: 500}}><span className="cid" onClick={() => { setSelectedClaimId(c.id); showPage('claim-detail'); }}>{c.claimNumber}</span></td>
            <td>{c.type}</td>
            <td>—</td>
            <td><span className={`bg ${c.status}`}>{c.status}</span></td>
            <td>{c.estimatedAmount ? `$${c.estimatedAmount}` : '—'}</td>
            <td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
            <td><button className="btn btn-o btn-sm" onClick={() => { setSelectedClaimId(c.id); showPage('claim-detail'); }}>Track</button></td>
          </tr>
        ))
      }
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'claim-detail' ? 'active' : ''}`} id="page-claim-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('claims')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">CLM-0248 — Warranty Claim</div><div className="detail-meta">2024 Jayco Jay Flight 264BH · Submitted Mar 16, 2026</div></div><span className="bg submitted" style={{fontSize: 13, padding: '6px 16px'}}>Processing</span></div>
  
  <div className="pn" style={{marginBottom: 20}}><div style={{padding: 24, display: 'flex', gap: 0}}>
    <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>✓</div><div style={{fontSize: 11, fontWeight: 500, color: 'var(--brand)'}}>Submitted</div></div>
    <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>2</div><div style={{fontSize: 11, fontWeight: 500, color: 'var(--brand)'}}>Processing</div></div>
    <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', color: '#aaa', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>3</div><div style={{fontSize: 11, color: '#aaa'}}>Authorized</div></div>
    <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', color: '#aaa', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>4</div><div style={{fontSize: 11, color: '#aaa'}}>Repair</div></div>
    <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', color: '#aaa', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>5</div><div style={{fontSize: 11, color: '#aaa'}}>Complete</div></div>
  </div></div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Issues Found (4)</span></div>
        <div style={{padding: '12px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between'}}><span style={{fontSize: 13, fontWeight: 500}}>Sidewall Delamination</span><span className="bg submitted">Pending</span></div>
        <div style={{padding: '12px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between'}}><span style={{fontSize: 13, fontWeight: 500}}>Roof Vent Leak</span><span className="bg submitted">Pending</span></div>
        <div style={{padding: '12px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between'}}><span style={{fontSize: 13, fontWeight: 500}}>Slide-Out Seal Damage</span><span className="bg submitted">Pending</span></div>
        <div style={{padding: '12px 20px', display: 'flex', justifyContent: 'space-between'}}><span style={{fontSize: 13, fontWeight: 500}}>Cabinet Hinge Broken</span><span className="bg submitted">Pending</span></div>
      </div>
      <div className="pn"><div className="pn-h"><span className="pn-t">Messages</span><span className="pn-a" onClick={() => showPage('ticket-detail')}>View full ticket →</span></div>
        <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">Smith's RV Centre</div><div className="comm-text">Hi Robert, we've submitted your warranty claim. 4 issues documented with 24 photos. We'll update you as soon as the manufacturer responds.</div><div className="comm-time">Mar 16, 10:30 AM</div></div></div></div>
        <div style={{padding: '16px 20px'}}><textarea placeholder="Send a message to your dealer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{textAlign: 'right', marginTop: 8}}><button className="btn btn-p btn-sm">Send</button></div></div>
      </div>
    </div>
    <div><div className="cd-section"><div className="cd-section-h">Claim Info</div><div className="cd-row"><span className="cd-label">Claim #</span><span className="cd-value">CLM-0248</span></div><div className="cd-row"><span className="cd-label">Type</span><span className="cd-value">Warranty</span></div><div className="cd-row"><span className="cd-label">Items</span><span className="cd-value">4</span></div><div className="cd-row"><span className="cd-label">Submitted</span><span className="cd-value">Mar 16, 2026</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg submitted">Processing</span></span></div></div></div>
  </div>
</div>


<div className={`page ${activePage === 'report-issue' ? 'active' : ''}`} id="page-report-issue">
  <div style={{fontSize: 13, color: '#666', marginBottom: 20}}>Found something wrong with your RV? Upload photos and describe the issue. Your dealer will review and handle the warranty claim for you.</div>
  <div className="pn">
    <div style={{padding: 20}}>
      <div className="form-grid" style={{padding: 0, marginBottom: 16}}>
        <div className="form-group full"><label>What type of issue is it?</label><select style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}><option>Select...</option><option>Water leak / water damage</option><option>Structural damage (walls, roof, floor)</option><option>Appliance not working</option><option>Electrical issue</option><option>Plumbing issue</option><option>HVAC (heating / cooling)</option><option>Slide-out problem</option><option>Exterior damage</option><option>Interior damage</option><option>Other</option></select></div>
        <div className="form-group full"><label>Describe the issue</label><textarea placeholder="Tell us what's wrong. The more detail you provide, the faster we can help. Where is the damage? When did you first notice it? Is it getting worse?" style={{minHeight: 100}}></textarea></div>
      </div>
      <div className="upload-zone"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><div style={{fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4}}>Upload Photos</div><div style={{fontSize: 13, color: '#888'}}>Take photos of the issue and upload them here. The more photos, the better.</div></div>
    </div>
    <div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('claims')}>Submit Issue</button><button className="btn btn-o">Save Draft</button></div>
  </div>
</div>


<div className={`page ${activePage === 'parts' ? 'active' : ''}`} id="page-parts">
  <div className="pn"><div className="pn-h"><span className="pn-t">Parts Orders</span><span style={{fontSize: 12, color: '#888'}}>Parts related to your claims</span></div>
    <div className="tw"><table><thead><tr><th>Order</th><th>Items</th><th>Related Claim</th><th>Status</th><th>ETA</th></tr></thead><tbody>
      {custPartsOrders.length === 0
        ? <tr><td colSpan={5} style={{textAlign:'center',color:'#888',padding:20}}>No parts orders</td></tr>
        : custPartsOrders.map(p => (
          <tr key={p.id}>
            <td style={{fontWeight: 500}}>{p.orderNumber || p.id}</td>
            <td>{p.partName || p.description || '—'}</td>
            <td>{p.claimNumber || '—'}</td>
            <td><span className={`bg ${p.status || 'pending'}`}>{p.status || 'Pending'}</span></td>
            <td>{p.estimatedDelivery ? new Date(p.estimatedDelivery).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
          </tr>
        ))
      }
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'fi-products' ? 'active' : ''}`} id="page-fi-products">
  <div className="fi-card">
    <div className="fi-card-title">Protect Your Investment</div>
    <div className="fi-card-desc">Your RV is one of your biggest investments. Explore protection plans designed to keep you covered on the road and at camp.</div>
    <button className="btn" style={{background: 'white', color: 'var(--brand)', fontWeight: 600, padding: '10px 24px'}}>Talk to an Expert →</button>
  </div>
  <div style={{fontSize: 13, color: '#888', marginBottom: 16}}>Products available for your 2024 Jayco Jay Flight 264BH:</div>
  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
    <div className="pn" style={{padding: 20}}><div style={{fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4}}>GAP Insurance</div><div style={{fontSize: 12, color: '#888', marginBottom: 12, lineHeight: '1.5'}}>Covers the difference between your RV's value and what you owe if it's totaled or stolen.</div><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontSize: 18, fontWeight: 700, color: 'var(--brand)'}}>$995</span><button className="btn btn-p btn-sm">Learn More</button></div></div>
    <div className="pn" style={{padding: 20}}><div style={{fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4}}>Paint & Fabric Protection</div><div style={{fontSize: 12, color: '#888', marginBottom: 12, lineHeight: '1.5'}}>Professional-grade protection for your RV's exterior paint and interior fabrics.</div><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontSize: 18, fontWeight: 700, color: 'var(--brand)'}}>$695</span><button className="btn btn-p btn-sm">Learn More</button></div></div>
    <div className="pn" style={{padding: 20}}><div style={{fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4}}>Roadside Assistance (3yr)</div><div style={{fontSize: 12, color: '#888', marginBottom: 12, lineHeight: '1.5'}}>24/7 emergency towing, tire changes, lockout service, and mobile mechanic dispatch.</div><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontSize: 18, fontWeight: 700, color: 'var(--brand)'}}>$395</span><button className="btn btn-p btn-sm">Learn More</button></div></div>
    <div className="pn" style={{padding: 20, position: 'relative', overflow: 'hidden'}}><div style={{position: 'absolute', top: 12, right: '-28px', background: 'var(--accent)', color: 'white', fontSize: 10, fontWeight: 600, padding: '4px 32px', transform: 'rotate(45deg)'}}>OWNED</div><div style={{fontSize: 15, fontWeight: 700, color: '#111', marginBottom: 4}}>Extended Warranty</div><div style={{fontSize: 12, color: '#888', marginBottom: 12, lineHeight: '1.5'}}>Comprehensive coverage from Guardsman RV through Feb 2031.</div><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontSize: 14, fontWeight: 600, color: '#22c55e'}}>✓ You own this plan</span><button className="btn btn-o btn-sm" onClick={() => showPage('warranty')}>View Coverage</button></div></div>
  </div>
</div>


<div className={`page ${activePage === 'roadside' ? 'active' : ''}`} id="page-roadside">
  <div style={{textAlign: 'center', padding: '60px 20px'}}>
    <svg width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="#d0d0d0" strokeWidth="1.5" style={{marginBottom: 16}}><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72c.127.96.362 1.903.7 2.81"/></svg>
    <div style={{fontSize: 20, fontWeight: 700, color: '#333', marginBottom: 8}}>Roadside Assistance</div>
    <div style={{fontSize: 14, color: '#888', maxWidth: 400, margin: '0 auto', lineHeight: '1.6'}}>24/7 emergency roadside assistance is coming soon. Get help with towing, tire changes, lockouts, and more — anywhere you travel.</div>
    <div style={{marginTop: 24}}><button className="btn btn-o">Notify Me When Available</button></div>
  </div>
</div>


<div className={`page ${activePage === 'tickets' ? 'active' : ''}`} id="page-tickets">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
    <div style={{fontSize: 13, color: '#666'}}>Track conversations by topic. Tickets are auto-created for claims and service requests, or create one manually.</div>
    <button className="btn btn-p btn-sm" onClick={() => showPage('new-ticket')}>+ New Ticket</button>
  </div>
  <div className="pn">
    <div className="filter-bar">
      <input type="text" placeholder="Search tickets..." />
      <select><option>All Statuses</option><option>Open</option><option>Waiting on Dealer</option><option>Waiting on You</option><option>Resolved</option><option>Closed</option></select>
      <select><option>All Categories</option><option>Claim / Warranty</option><option>Billing</option><option>Parts Order</option><option>General</option><option>Warranty Expiry</option><option>Protection Plans</option><option>Feedback</option></select>
    </div>
    <div className="tw"><table><thead><tr><th>Ticket</th><th>Subject</th><th>Category</th><th>Related</th><th>Status</th><th>Last Update</th><th>Action</th></tr></thead><tbody>
      {custTickets.length === 0
        ? <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:20}}>No tickets found</td></tr>
        : custTickets.map(t => {
          const statusClass = t.status === 'open' ? 'submitted' : t.status === 'resolved' ? 'active' : t.status === 'closed' ? '' : 'pending';
          return (
            <tr key={t.id}>
              <td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => { setSelectedTicketId(t.id); showPage('ticket-detail'); }}>{t.ticketNumber || t.id}</span></td>
              <td style={{fontWeight: 500}}>{t.subject}</td>
              <td><span style={{fontSize: 11, color: '#888'}}>{t.category}</span></td>
              <td><span style={{fontSize: 12, color: '#888'}}>{t.relatedClaimNumber || '—'}</span></td>
              <td><span className={`bg ${statusClass}`}>{t.status}</span></td>
              <td>{t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
              <td><button className="btn btn-o btn-sm" onClick={() => { setSelectedTicketId(t.id); showPage('ticket-detail'); }}>View</button></td>
            </tr>
          );
        })
      }
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'ticket-detail' ? 'active' : ''}`} id="page-ticket-detail">
  <div className="detail-header">
    <button className="detail-back" onClick={() => showPage('tickets')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div className="detail-info">
      <div className="detail-title">TKT-0042 — Warranty claim</div>
      <div className="detail-meta">Claim / Warranty · Linked to CLM-0248 · Opened Mar 16, 2026</div>
    </div>
    <span className="bg submitted" style={{fontSize: 13, padding: '6px 16px'}}>Open</span>
  </div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      <div className="pn">
        <div className="pn-h"><span className="pn-t">Conversation</span><span style={{fontSize: 12, color: '#888'}}>5 messages</span></div>
        <div className="comm-box" style={{margin: 0, border: 'none', borderRadius: 0}}>
          <div className="comm-msg" style={{background: '#f0fdf4'}}><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">Smith's RV Centre <span style={{fontWeight: 400, color: '#888', fontSize: 11}}>· Auto</span></div><div className="comm-text">A warranty claim has been created for your 2024 Jayco Jay Flight 264BH. We've identified 4 issues from your submitted photos and are processing the claim with the manufacturer.</div><div className="comm-time">Mar 16, 10:30 AM</div></div></div>
          <div className="comm-msg"><div className="comm-avatar cu">RM</div><div className="comm-content"><div className="comm-name">You</div><div className="comm-text">Thanks for the quick turnaround! The roof leak is my main concern — it's been raining and I can see the stain getting bigger.</div><div className="comm-time">Mar 16, 11:45 AM</div></div></div>
          <div className="comm-msg"><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">Smith's RV Centre</div><div className="comm-text">Understood, Robert. We've flagged the roof vent as priority. Jayco typically responds within 48 hours. We'll let you know as soon as we hear back.</div><div className="comm-time">Mar 16, 12:10 PM</div></div></div>
          <div className="comm-msg"><div className="comm-avatar cu">RM</div><div className="comm-content"><div className="comm-name">You</div><div className="comm-text">Great, thank you. Should I put a tarp over the vent in the meantime?</div><div className="comm-time">Mar 16, 12:30 PM</div></div></div>
          <div className="comm-msg"><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">Smith's RV Centre</div><div className="comm-text">That's a good idea if you're expecting more rain. A simple tarp secured over the front vent area will prevent further water damage while we wait for authorization. Don't seal it permanently — the manufacturer inspector may need to see the original condition.</div><div className="comm-time">Mar 16, 1:00 PM</div></div></div>
        </div>
        <div style={{padding: '16px 20px', borderTop: '1px solid #f0f0f0'}}>
          <textarea placeholder="Reply to this ticket..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea>
          <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
            <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Attach Photo</button>
            <button className="btn btn-p btn-sm">Send Reply</button>
          </div>
        </div>
      </div>
    </div>
    <div>
      <div className="cd-section">
        <div className="cd-section-h">Ticket Info</div>
        <div className="cd-row"><span className="cd-label">Ticket #</span><span className="cd-value">TKT-0042</span></div>
        <div className="cd-row"><span className="cd-label">Category</span><span className="cd-value">Claim / Warranty</span></div>
        <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg submitted">Open</span></span></div>
        <div className="cd-row"><span className="cd-label">Opened</span><span className="cd-value">Mar 16, 2026</span></div>
        <div className="cd-row"><span className="cd-label">Last Update</span><span className="cd-value">2h ago</span></div>
      </div>
      <div className="cd-section">
        <div className="cd-section-h">Linked Items</div>
        <div className="cd-row"><span className="cd-label">Claim</span><span className="cd-value cid" onClick={() => showPage('claim-detail')}>CLM-0248</span></div>
        <div className="cd-row"><span className="cd-label">Parts Order</span><span className="cd-value">PO-0038</span></div>
        <div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value" style={{fontSize: 12}}>2024 Jayco Jay Flight</span></div>
      </div>
      <div style={{padding: 12}}><button className="btn btn-o btn-sm" style={{width: '100%', justifyContent: 'center', color: '#d97706', borderColor: '#fde68a'}}>Mark as Resolved</button></div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'new-ticket' ? 'active' : ''}`} id="page-new-ticket">
  <div className="detail-header">
    <button className="detail-back" onClick={() => showPage('tickets')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div className="detail-info"><div className="detail-title">New Support Ticket</div><div className="detail-meta">Create a ticket to discuss a specific topic with your dealer</div></div>
  </div>
  <div className="pn"><div className="form-grid">
    <div className="form-group"><label>Category</label>
      <select style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}>
        <option>Select category...</option>
        <option>Claim / Warranty Issue</option>
        <option>Billing / Invoice Question</option>
        <option>Parts Order Inquiry</option>
        <option>General Question</option>
        <option>Warranty Expiry / Renewal</option>
        <option>F&I / Protection Plans</option>
        <option>Feedback / Complaint</option>
      </select>
    </div>
    <div className="form-group"><label>Related Item (optional)</label>
      <select style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}>
        <option>None</option>
        <option>CLM-0248 (Warranty claim)</option>
        <option>PO-0038 (Parts order)</option>
        <option>WP-0041 (Ext. warranty)</option>
      </select>
    </div>
    <div className="form-group full"><label>Subject</label><input placeholder="Brief description of your question or issue..." /></div>
    <div className="form-group full"><label>Message</label><textarea placeholder="Describe your question or issue in detail..." style={{minHeight: 120}}></textarea></div>
    <div className="form-group full"><label>Attachments (optional)</label>
      <div className="upload-zone" style={{padding: 20}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 32, height: 32, color: '#ccc', marginBottom: 8}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><div style={{fontSize: 13, color: '#888'}}>Click to attach photos or files</div></div>
    </div>
  </div>
  <div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('tickets')}>Submit Ticket</button><button className="btn btn-o" onClick={() => showPage('tickets')}>Cancel</button></div></div>
</div>


<div className={`page ${activePage === 'quick-chat' ? 'active' : ''}`} id="page-quick-chat">
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div className="pn">
      <div className="pn-h"><span className="pn-t">Quick Chat with Smith's RV Centre</span><span style={{fontSize: 12, color: '#888'}}>For quick questions that don't need a ticket</span></div>
      <div className="comm-box" style={{margin: 0, border: 'none', borderRadius: 0, maxHeight: 400, overflowY: 'auto'}}>
        <div className="comm-msg"><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">Smith's RV Centre</div><div className="comm-text">Hey Robert! Feel free to drop any quick questions here. For anything that needs tracking (claims, parts, billing), use Support Tickets instead.</div><div className="comm-time">Feb 10</div></div></div>
        <div className="comm-msg"><div className="comm-avatar cu">RM</div><div className="comm-content"><div className="comm-name">You</div><div className="comm-text">What are your service hours this Saturday?</div><div className="comm-time">Mar 15, 3:20 PM</div></div></div>
        <div className="comm-msg"><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">Smith's RV Centre</div><div className="comm-text">We're open 9am - 2pm on Saturdays. Want to book something?</div><div className="comm-time">Mar 15, 3:45 PM</div></div></div>
        <div className="comm-msg"><div className="comm-avatar cu">RM</div><div className="comm-content"><div className="comm-name">You</div><div className="comm-text">No just wondering, thanks!</div><div className="comm-time">Mar 15, 4:00 PM</div></div></div>
      </div>
      <div style={{padding: '16px 20px', borderTop: '1px solid #f0f0f0'}}>
        <textarea placeholder="Type a quick message..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea>
        <div style={{textAlign: 'right', marginTop: 8}}><button className="btn btn-p btn-sm">Send</button></div>
      </div>
    </div>
    <div>
      <div style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: 16}}>
        <div style={{fontSize: 13, fontWeight: 600, color: '#1e40af', marginBottom: 8}}>Need to track something?</div>
        <div style={{fontSize: 12, color: '#3b82f6', lineHeight: '1.5', marginBottom: 12}}>Quick Chat is for simple questions. For claims, parts, billing, or anything that needs a status, create a Support Ticket instead.</div>
        <button className="btn btn-o btn-sm" style={{width: '100%', justifyContent: 'center', borderColor: '#93c5fd', color: '#2563eb'}} onClick={() => showPage('new-ticket')}>Create Support Ticket</button>
      </div>
      <div className="cd-section" style={{marginTop: 16}}><div className="cd-section-h">Dealer Info</div>
        <div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value">Smith's RV Centre</span></div>
        <div className="cd-row"><span className="cd-label">Hours</span><span className="cd-value">Mon-Fri 8-5, Sat 9-2</span></div>
        <div className="cd-row"><span className="cd-label">Phone</span><span className="cd-value">(905) 555-0100</span></div>
      </div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'settings' ? 'active' : ''}`} id="page-settings">
  <div style={{display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24}}>
    <div>
      <div className="settings-link active" onClick={() => setCustSettingsTab('cs-profile')}>My Profile</div>
      <div className="settings-link" onClick={() => setCustSettingsTab('cs-security')}>Security</div>
      <div className="settings-link" onClick={() => setCustSettingsTab('cs-notif')}>Notifications</div>
    </div>
    <div>
      <div className={`pn cstab ${custSettingsTab === "cstab-cs-profile" ? "active" : ""}`} id="cstab-cs-profile" style={{display: custSettingsTab === "cstab-cs-profile" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">My Profile</span></div>
        <div style={{padding: '24px 20px', display: 'flex', gap: 24, alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0'}}>
          <div style={{textAlign: 'center'}}>
            <div id="cust-profile-avatar" style={{width: 80, height: 80, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8, overflow: 'hidden'}}>RM</div>
            <input type="file" id="cust-profile-input" accept="image/*" style={{display: 'none'}} onChange={updateCustProfile} />
            <button className="btn btn-o btn-sm" onClick={() => document.getElementById('cust-profile-input')?.click()}>Change Photo</button>
          </div>
          <div><div style={{fontSize: 16, fontWeight: 600, marginBottom: 2}}>Robert Martin</div><div style={{fontSize: 13, color: '#888'}}>Client · Smith's RV Centre</div></div>
        </div>
        <div className="form-grid">
          <div className="form-group"><label>First Name</label><input value="Robert" /></div>
          <div className="form-group"><label>Last Name</label><input value="Martin" /></div>
          <div className="form-group"><label>Email</label><input value="robert.martin@gmail.com" /></div>
          <div className="form-group"><label>Phone</label><input value="(905) 555-0147" /></div>
          <div className="form-group"><label>City</label><input value="Hamilton, ON" /></div>
          <div className="form-group"><label>Language</label><select><option defaultSelected>English</option><option>French</option></select></div>
        </div>
        <div className="btn-bar"><button className="btn btn-p">Save Profile</button><button className="btn btn-o">Cancel</button></div>
      </div>
      <div className={`pn cstab ${custSettingsTab === "cstab-cs-security" ? "active" : ""}`} id="cstab-cs-security" style={{display: custSettingsTab === "cstab-cs-security" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Security</span></div>
        <div className="form-grid">
          <div className="form-group"><label>Current Password</label><input type="password" placeholder="Current password" /></div><div className="form-group"><label> </label></div>
          <div className="form-group"><label>New Password</label><input type="password" placeholder="New password" /></div>
          <div className="form-group"><label>Confirm</label><input type="password" placeholder="Confirm" /></div>
        </div>
        <div className="btn-bar"><button className="btn btn-p">Update Password</button><button className="btn btn-o">Cancel</button></div>
      </div>
      <div className={`pn cstab ${custSettingsTab === "cstab-cs-notif" ? "active" : ""}`} id="cstab-cs-notif" style={{display: custSettingsTab === "cstab-cs-notif" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Notification Preferences</span></div>
        <div className="form-grid">
          <div className="form-group"><label>Claim updates</label><select><option defaultSelected>Email</option><option>Off</option></select></div>
          <div className="form-group"><label>Messages from dealer</label><select><option defaultSelected>Email</option><option>Off</option></select></div>
          <div className="form-group"><label>Parts order updates</label><select><option defaultSelected>Email</option><option>Off</option></select></div>
          <div className="form-group"><label>Warranty reminders</label><select><option defaultSelected>Email</option><option>Off</option></select></div>
        </div>
        <div className="btn-bar"><button className="btn btn-p">Save</button><button className="btn btn-o">Reset</button></div>
      </div>
    </div>
  </div>
</div>
</div>
</div>
    <MobileBottomNav portalType="client" activePage={activePage} onNavigate={showPage} parents={parents} />
    <OfflineBanner />
    </>
  );
}
