// BidderPortal.tsx — Public Auction Bidder Portal
// Layout: sidebar(position:fixed) + main(margin-left:240px) + content(block) + page(display:block)
// DO NOT modify layout structure. DO NOT add display:flex to .content.

import { useState, useEffect } from 'react';
import ds360Icon from '@assets/ds360_favicon.png';
import ds360LogoLight from '@assets/DS360_logo_light.png';
import ds360LogoDark from '@assets/DS360_logo_dark.png';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { wsClient } from '@/lib/websocket';

const AUCTION_START = new Date('2026-05-08T16:00:00Z');
const AUCTION_END   = new Date('2026-05-09T16:00:00Z');

function calcCountdown(target: Date) {
  const diff = Math.max(0, target.getTime() - Date.now());
  return {
    days:    Math.floor(diff / 86400000),
    hours:   Math.floor((diff % 86400000) / 3600000),
    minutes: Math.floor((diff % 3600000) / 60000),
    seconds: Math.floor((diff % 60000) / 1000),
  };
}

export default function BidderPortal() {
  const [activePage, setActivePage] = useState('dashboard');
  const [pageTitle, setPageTitle]   = useState('Dashboard');
  const [pageSub, setPageSub]       = useState('Auction account overview');
  const [theme, setTheme]           = useState(() => localStorage.getItem('ds360-theme') || '');
  const [lang, setLang]             = useState(() => localStorage.getItem('ds360-lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en'));

  // Countdown
  const [countdown, setCountdown] = useState(calcCountdown(AUCTION_START));
  useEffect(() => {
    const id = setInterval(() => setCountdown(calcCountdown(AUCTION_START)), 1000);
    return () => clearInterval(id);
  }, []);

  // Settings sub-tab
  const [settingsTab, setSettingsTab] = useState('st-profile');

  // My Bids tab
  const [bidsTab, setBidsTab] = useState<'active' | 'history'>('history');

  // Card form state
  const [cardAdded, setCardAdded] = useState(false);
  const [showCardForm, setShowCardForm] = useState(false);
  const [cardName, setCardName]   = useState('');
  const [cardNum, setCardNum]     = useState('');
  const [cardExp, setCardExp]     = useState('');
  const [cardCvv, setCardCvv]     = useState('');

  // ID verification state
  const [idUploaded, setIdUploaded]   = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [addrUploaded, setAddrUploaded] = useState(false);

  // Profile form
  const [firstName, setFirstName]   = useState('');
  const [lastName, setLastName]     = useState('');
  const [email, setEmail]           = useState('');
  const [phone, setPhone]           = useState('');
  const [address, setAddress]       = useState('');
  const [city, setCity]             = useState('');
  const [province, setProvince]     = useState('');
  const [postal, setPostal]         = useState('');
  const [profileSaved, setProfileSaved] = useState(false);

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const { user, logout } = useAuth();

  // ─── API data state ────────────────────────────────────────────────────────
  const [upcomingAuctions, setUpcomingAuctions] = useState<any[]>([]);
  const [myBids, setMyBids] = useState<any[]>([]);
  const [wonUnits, setWonUnits] = useState<any[]>([]);
  const [paymentMethods, setPaymentMethods] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  const titles: Record<string, [string, string]> = {
    'dashboard':    ['Dashboard',         'Auction account overview'],
    'profile':      ['My Profile',        'Personal information'],
    'verification': ['ID Verification',   'Government ID required to bid'],
    'payment':      ['Payment & Card',    'Credit card & $250 hold'],
    'upcoming':     ['Upcoming Auctions', 'Next auction date & preview'],
    'my-bids':      ['My Bids',           'All bids across all auctions'],
    'won-units':    ['Won Units',         '72-hour payment window'],
    'settings':     ['Settings',          'Account preferences'],
  };

  const parents: Record<string, string> = {};

  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // ─── Data fetching keyed on activePage ─────────────────────────────────────
  useEffect(() => {
    setDataError(null);
    const fetch = async () => {
      try {
        if (activePage === 'dashboard' || activePage === 'upcoming') {
          const d = await apiFetch<any>('/api/public-auctions/upcoming');
          setUpcomingAuctions(d.events || d.auctions || []);
        }
        if (activePage === 'dashboard' || activePage === 'my-bids') {
          const d = await apiFetch<any>('/api/auctions/my-bids');
          setMyBids(d.bids || []);
        }
        if (activePage === 'won-units') {
          const d = await apiFetch<any>('/api/auctions/my-bids?won=true');
          setWonUnits(d.bids || []);
        }
        if (activePage === 'payment') {
          const d = await apiFetch<any>('/api/payments/methods');
          setPaymentMethods(d.methods || []);
        }
      } catch (err: any) {
        setDataError(err?.message || 'Failed to load data');
      }
    };
    fetch();
  }, [activePage]);

  // ─── WebSocket: live auction bids ───────────────────────────────────────────
  useEffect(() => {
    wsClient.connect();
    const unsubBid = wsClient.on<any>('auction:bid', (payload) => {
      if (activePage === 'my-bids') {
        setMyBids(prev => [payload, ...prev]);
      }
    });
    return () => { unsubBid(); };
  }, [activePage]);

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

  const updateAvatar = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />`;
      const a = document.getElementById('bidder-avatar'); if (a) a.innerHTML = img;
      const b = document.getElementById('bidder-avatar-sidebar'); if (b) b.innerHTML = img;
    };
    reader.readAsDataURL(file);
  };

  const handleFileUpload = (type: 'id' | 'addr') => {
    if (type === 'id')   { setIdUploaded(true);   }
    if (type === 'addr') { setAddrUploaded(true); }
  };

  const handleAddCard = () => {
    if (!cardName || !cardNum || !cardExp || !cardCvv) {
      alert('Please fill in all card fields.');
      return;
    }
    setCardAdded(true);
    setShowCardForm(false);
    alert('Card added successfully. You are ready to bid!');
  };

  const handleSaveProfile = () => {
    setProfileSaved(true);
    setTimeout(() => setProfileSaved(false), 3000);
  };

  const provinces = ['AB','BC','MB','NB','NL','NS','NT','NU','ON','PE','QC','SK','YT'];

  const isReadyToBid = cardAdded && (idUploaded || true); // ID optional for <$25k

  return (
    <>
{/* ════ SIDEBAR ════ */}
<nav className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
  <div className="sidebar-logo">
    <img src={ds360Icon} width="36" height="36" style={{borderRadius:8}} alt="DS360" />
    <div className="sidebar-logo-text">
      <div className="sidebar-logo-sub" style={{fontSize:12,fontWeight:600}}>Bidder Portal</div>
    </div>
    <span className="sidebar-badge">Bidder</span>
  </div>

  <div className="sidebar-nav">
    {/* ACCOUNT */}
    <div className="nav-section">
      <div className="nav-label">Account</div>
      <div className={`nav-item ${isNavActive('dashboard') ? 'active' : ''}`} onClick={() => showPage('dashboard')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>
        Dashboard
      </div>
      <div className={`nav-item ${isNavActive('profile') ? 'active' : ''}`} onClick={() => showPage('profile')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>
        My Profile
      </div>
      <div className={`nav-item ${isNavActive('verification') ? 'active' : ''}`} onClick={() => showPage('verification')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
        ID Verification
        {!idUploaded && <span className="nb amber">!</span>}
      </div>
      <div className={`nav-item ${isNavActive('payment') ? 'active' : ''}`} onClick={() => showPage('payment')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
        Payment &amp; Card
        {!cardAdded && <span className="nb amber">!</span>}
      </div>
      <div className={`nav-item ${isNavActive('payment-methods') ? 'active' : ''}`} onClick={() => showPage('payment-methods')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M6 14h4"/><path d="M14 14h4"/></svg>
        Payment Methods *
      </div>
    </div>

    {/* AUCTIONS */}
    <div className="nav-section">
      <div className="nav-label">Auctions</div>
      <div className={`nav-item ${isNavActive('browse-units') ? 'active' : ''}`} onClick={() => showPage('browse-units')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        Browse Units *
      </div>
      <div className={`nav-item ${isNavActive('upcoming') ? 'active' : ''}`} onClick={() => showPage('upcoming')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>
        Upcoming Auctions
      </div>
      <div className={`nav-item ${isNavActive('my-bids') ? 'active' : ''}`} onClick={() => showPage('my-bids')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2l-2 2-7 7 3 3 7-7 2-2-3-3z"/><path d="M3 21l4-4"/><path d="M17 3l4 4-2 2-4-4 2-2z"/></svg>
        My Bids
      </div>
      <div className={`nav-item ${isNavActive('won-units') ? 'active' : ''}`} onClick={() => showPage('won-units')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 9H4.5a2.5 2.5 0 000 5H6"/><path d="M18 9h1.5a2.5 2.5 0 010 5H18"/><path d="M8 9h8"/><path d="M8 14h8"/><path d="M12 2v7"/><path d="M12 16v6"/><path d="M9 19h6"/></svg>
        Won Units
      </div>
    </div>

    {/* SETTINGS */}
    <div className="nav-section">
      <div className="nav-label">More</div>
      <div className={`nav-item ${isNavActive('settings') ? 'active' : ''}`} onClick={() => showPage('settings')}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 005 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 010-2.83 2 2 0 012.83 0l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 0 2 2 0 010 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>
        Settings
      </div>
    </div>
  </div>

  <div className="sidebar-footer">
    <div className="user-info" onClick={() => showPage('profile')}>
      <div className="user-avatar" id="bidder-avatar-sidebar">JD</div>
      <div>
        <div className="user-name">{firstName && lastName ? `${firstName} ${lastName}` : 'Jane Doe'}</div>
        <div className="user-role">Public Bidder</div>
      </div>
    </div>
    <button onClick={async () => { await logout(); window.location.href = '/'; }} style={{width:'100%',marginTop:8,padding:'7px 12px',background:'none',border:'1px solid #e0e0e0',borderRadius:6,fontSize:12,color:'#888',cursor:'pointer',fontFamily:'inherit',textAlign:'left' as const,display:'flex',alignItems:'center',gap:6}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</button>
  </div>
</nav>

{/* ════ MAIN ════ */}
<div className={`main${sidebarCollapsed ? ' collapsed-main' : ''}`}>
<header className="header">
  <div className="header-left">
    <button className="hbtn" onClick={() => setSidebarCollapsed(c => !c)} title="Toggle sidebar" style={{flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button>
    <img src={ds360Icon} width="28" height="28" style={{borderRadius:6,flexShrink:0,marginRight:4}} alt="DS360" />
    <div>
      <div className="header-title">{pageTitle}</div>
      <div className="header-sub">{pageSub}</div>
    </div>
  </div>
  <div className="header-right">
    <div className="lang-toggle">
      <button className={`lang-btn-opt ${lang === 'en' ? 'active' : ''}`} onClick={() => handleSetLang('en')}>EN</button>
      <button className={`lang-btn-opt ${lang === 'fr' ? 'active' : ''}`} onClick={() => handleSetLang('fr')}>FR</button>
    </div>
    <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>
    </button>
    <a href="/live-auctions" className="btn btn-p btn-sm" style={{textDecoration: 'none', display: 'flex', alignItems: 'center', gap: 6}}>
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2l-2 2-7 7 3 3 7-7 2-2-3-3z"/></svg>
      Live Auction
    </a>
  </div>
</header>
<div className="content">


{/* ════════════════════════════
    DASHBOARD
════════════════════════════ */}
<div className={`page ${activePage === 'dashboard' ? 'active' : ''}`} id="page-dashboard">

  {/* Account readiness banner */}
  {!isReadyToBid && (
    <div className="al" style={{marginBottom: 20, background: '#fffbeb', borderColor: '#fde68a'}}>
      <div className="al-i pu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div>
      <div className="al-c">
        <div className="al-t">Complete your account to bid</div>
        <div className="al-d">
          {!cardAdded && 'Add a credit card · '}
          {!idUploaded && 'Upload ID · '}
          Takes 2 minutes
        </div>
      </div>
      <span className="al-a" onClick={() => showPage(!cardAdded ? 'payment' : 'verification')}>Complete</span>
    </div>
  )}
  {isReadyToBid && cardAdded && (
    <div className="al" style={{marginBottom: 20, background: '#f0fdf4', borderColor: '#bbf7d0'}}>
      <div className="al-i gr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg></div>
      <div className="al-c"><div className="al-t">Account ready — you can bid!</div><div className="al-d">Card on file · $250 hold applied on first bid</div></div>
      <span className="al-a" onClick={() => window.location.href = '/live-auctions'}>View Auction</span>
    </div>
  )}

  {/* Stat cards */}
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 28}}>
    <div className="sc"><div className="sc-v">0</div><div className="sc-l">Active Bids</div></div>
    <div className="sc"><div className="sc-v">0</div><div className="sc-l">Units Won</div></div>
    <div className="sc"><div className="sc-v">0</div><div className="sc-l">Total Bids Placed</div></div>
    <div className="sc" style={{background: 'var(--brand)', color: '#fff'}}>
      <div className="sc-v" style={{color: '#fff'}}>{countdown.days}d {String(countdown.hours).padStart(2,'0')}h</div>
      <div className="sc-l" style={{color: 'rgba(255,255,255,0.7)'}}>Next Auction</div>
    </div>
  </div>

  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      {/* Next Auction countdown */}
      <div className="pn" style={{marginBottom: 20}}>
        <div className="pn-h"><span className="pn-t">Next Public Auction</span><span style={{fontSize: 12, color: '#888'}}>May 8, 2026 · 12:00 PM EDT</span></div>
        <div style={{padding: 20}}>
          <div style={{display: 'flex', gap: 16, marginBottom: 16}}>
            {[['Days', countdown.days],['Hours', countdown.hours],['Min', countdown.minutes],['Sec', countdown.seconds]].map(([l,v]) => (
              <div key={l as string} style={{flex: 1, background: 'var(--brand)', color: '#fff', borderRadius: 10, padding: '14px 8px', textAlign: 'center'}}>
                <div style={{fontSize: 28, fontWeight: 700, lineHeight: 1, fontVariantNumeric: 'tabular-nums'}}>{String(v).padStart(2,'0')}</div>
                <div style={{fontSize: 10, opacity: 0.7, marginTop: 4, letterSpacing: 1}}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{fontSize: 12, color: '#888', lineHeight: '1.5', marginBottom: 12}}>
            6 dealer units · 24-hour window · Open to all registered registered bidders
          </div>
          <div style={{display: 'flex', gap: 8}}>
            <button className="btn btn-p btn-sm" onClick={() => window.location.href = '/live-auctions'}>View Auction Page</button>
            <button className="btn btn-o btn-sm" onClick={() => showPage('upcoming')}>Full Schedule</button>
          </div>
        </div>
      </div>

      {/* Recent activity */}
      <div className="pn"><div className="pn-h"><span className="pn-t">Recent Activity</span></div>
        <div className="act">
          <div className="act-i"><span className="act-dot new"></span><div><div className="act-t">Account created — welcome to Dealer Suite 360 Public Auctions</div><div className="act-tm">Today</div></div></div>
          {cardAdded && <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t">Credit card added — account ready to bid</div><div className="act-tm">Just now</div></div></div>}
          {idUploaded && <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t">Government ID uploaded — verification pending</div><div className="act-tm">Just now</div></div></div>}
        </div>
      </div>
    </div>

    <div>
      {/* Account status */}
      <div className="cd-section" style={{marginBottom: 16}}>
        <div className="cd-section-h">Account Status</div>
        <div className="cd-row"><span className="cd-label">Card on File</span><span className="cd-value">{cardAdded ? <span className="bg active">Yes</span> : <span className="bg pending" style={{cursor:'pointer'}} onClick={() => showPage('payment')}>Add Card</span>}</span></div>
        <div className="cd-row"><span className="cd-label">ID Verified</span><span className="cd-value">{idUploaded ? <span className="bg pending">Under Review</span> : <span className="bg" style={{background:'#f3f4f6',color:'#888',cursor:'pointer'}} onClick={() => showPage('verification')}>Upload ID</span>}</span></div>
        <div className="cd-row"><span className="cd-label">Ready to Bid</span><span className="cd-value"><span className={`bg ${cardAdded ? 'active' : 'pending'}`}>{cardAdded ? 'Yes' : 'No'}</span></span></div>
      </div>

      {/* Quick actions */}
      <div className="pn"><div className="pn-h"><span className="pn-t">Quick Actions</span></div>
        <div style={{padding: '16px 20px', display: 'flex', flexDirection: 'column' as const, gap: 8}}>
          <button className="btn btn-p" style={{width: '100%', justifyContent: 'center'}} onClick={() => window.location.href = '/live-auctions'}>View Live Auction</button>
          {!cardAdded && <button className="btn btn-o" style={{width: '100%', justifyContent: 'center'}} onClick={() => showPage('payment')}>Add Credit Card</button>}
          {!idUploaded && <button className="btn btn-o" style={{width: '100%', justifyContent: 'center'}} onClick={() => showPage('verification')}>Upload ID</button>}
          <button className="btn btn-o" style={{width: '100%', justifyContent: 'center'}} onClick={() => showPage('upcoming')}>Upcoming Auctions</button>
        </div>
      </div>
    </div>
  </div>
</div>


{/* ════════════════════════════
    MY PROFILE
════════════════════════════ */}
<div className={`page ${activePage === 'profile' ? 'active' : ''}`} id="page-profile">
  <div style={{maxWidth: 720}}>
    <div className="pn">
      <div className="pn-h"><span className="pn-t">Personal Information</span></div>
      <div style={{padding: '20px 24px'}}>

        {/* Avatar */}
        <div style={{display: 'flex', alignItems: 'center', gap: 16, marginBottom: 24, paddingBottom: 20, borderBottom: '1px solid var(--border-light)'}}>
          <div id="bidder-avatar" style={{width: 64, height: 64, borderRadius: '50%', background: 'var(--brand)', color: '#fff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 22, fontWeight: 700, flexShrink: 0}}>
            {firstName && lastName ? `${firstName[0]}${lastName[0]}`.toUpperCase() : 'JD'}
          </div>
          <div>
            <div style={{fontSize: 15, fontWeight: 600, marginBottom: 4}}>{firstName && lastName ? `${firstName} ${lastName}` : 'Your Name'}</div>
            <label className="btn btn-o btn-sm" style={{cursor: 'pointer'}}>
              Upload Photo
              <input type="file" accept="image/*" style={{display: 'none'}} onChange={updateAvatar} />
            </label>
          </div>
        </div>

        <div className="form-grid c3" style={{gap: 16}}>
          <div className="form-group"><label>First Name</label><input placeholder="Jane" value={firstName} onChange={e => setFirstName(e.target.value)} /></div>
          <div className="form-group"><label>Last Name</label><input placeholder="Smith" value={lastName} onChange={e => setLastName(e.target.value)} /></div>
          <div className="form-group"><label>Email</label><input type="email" placeholder="jane@example.com" value={email} onChange={e => setEmail(e.target.value)} /></div>
          <div className="form-group full" style={{borderTop: '1px solid var(--border-light)', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Address</label></div>
          <div className="form-group full"><label>Street Address</label><input placeholder="123 Main Street" value={address} onChange={e => setAddress(e.target.value)} /></div>
          <div className="form-group"><label>City</label><input placeholder="Toronto" value={city} onChange={e => setCity(e.target.value)} /></div>
          <div className="form-group"><label>Province</label>
            <select value={province} onChange={e => setProvince(e.target.value)}>
              <option value="">Select...</option>
              {provinces.map(p => <option key={p} value={p}>{p}</option>)}
            </select>
          </div>
          <div className="form-group"><label>Postal Code</label><input placeholder="M5V 2T6" value={postal} onChange={e => setPostal(e.target.value)} /></div>
          <div className="form-group full" style={{borderTop: '1px solid var(--border-light)', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Contact</label></div>
          <div className="form-group"><label>Phone</label><input type="tel" placeholder="(555) 000-0000" value={phone} onChange={e => setPhone(e.target.value)} /></div>
        </div>

        <div className="btn-bar" style={{marginTop: 20}}>
          <button className="btn btn-s" onClick={handleSaveProfile}>
            {profileSaved ? '✓ Saved' : 'Save Changes'}
          </button>
          <button className="btn btn-o" onClick={() => { setFirstName(''); setLastName(''); setEmail(''); setPhone(''); setAddress(''); setCity(''); setProvince(''); setPostal(''); }}>
            Clear
          </button>
        </div>
      </div>
    </div>
  </div>
</div>


{/* ════════════════════════════
    ID VERIFICATION
════════════════════════════ */}
<div className={`page ${activePage === 'verification' ? 'active' : ''}`} id="page-verification">
  <div style={{maxWidth: 680}}>

    {/* Status banner */}
    <div className={`al ${idUploaded ? '' : ''}`} style={{marginBottom: 20, background: idUploaded ? '#fffbeb' : '#f9fafb', borderColor: idUploaded ? '#fde68a' : 'var(--border)'}}>
      <div className={`al-i ${idUploaded ? 'pu' : ''}`}>
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
      </div>
      <div className="al-c">
        <div className="al-t">{idUploaded ? 'Documents Under Review' : 'Verification Required'}</div>
        <div className="al-d">{idUploaded ? 'Our team will verify your ID within 1 business day.' : 'Upload a government-issued ID to unlock bidding on units over $25,000.'}</div>
      </div>
      {idUploaded && <span className="bg pending" style={{alignSelf: 'center'}}>Pending</span>}
    </div>

    {/* Info panel */}
    <div className="pn" style={{marginBottom: 16}}>
      <div className="pn-h"><span className="pn-t">Why is this required?</span></div>
      <div style={{padding: '14px 20px', fontSize: 13, color: 'var(--text-secondary)', lineHeight: '1.7'}}>
        <div>✓ <strong>Bids under $25,000</strong> — card on file is sufficient, ID optional</div>
        <div>✓ <strong>Bids $25,000 and over</strong> — government ID required before bidding</div>
        <div>✓ <strong>Won units</strong> — ID required for all payment processing and vehicle transfer</div>
        <div style={{marginTop: 8, color: 'var(--text-muted)', fontSize: 12}}>All documents are handled securely and used only for identity verification purposes.</div>
      </div>
    </div>

    {/* Upload: Government ID */}
    <div className="pn" style={{marginBottom: 16}}>
      <div className="pn-h">
        <span className="pn-t">Government-Issued Photo ID</span>
        {idUploaded && <span className="bg pending">Uploaded</span>}
      </div>
      <div style={{padding: 20}}>
        <div style={{fontSize: 12, color: 'var(--text-muted)', marginBottom: 12}}>Driver's licence, passport, or provincial ID card. Must be valid and unexpired.</div>
        {!idUploaded ? (
          <label className="upload-zone" style={{cursor: 'pointer', display: 'block'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 40, height: 40, color: '#ccc', marginBottom: 8}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style={{fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4}}>Upload Photo ID</div>
            <div style={{fontSize: 12, color: 'var(--text-muted)'}}>JPG, PNG or PDF · Max 10 MB</div>
            <input type="file" accept="image/*,.pdf" style={{display: 'none'}} onChange={() => handleFileUpload('id')} />
          </label>
        ) : (
          <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div style={{flex: 1}}>
              <div style={{fontSize: 13, fontWeight: 600, color: '#166534'}}>government_id.jpg</div>
              <div style={{fontSize: 11, color: '#888'}}>Uploaded · Pending review</div>
            </div>
            <button className="btn btn-o btn-sm" onClick={() => setIdUploaded(false)}>Remove</button>
          </div>
        )}
      </div>
    </div>

    {/* Upload: Proof of Address */}
    <div className="pn">
      <div className="pn-h">
        <span className="pn-t">Proof of Address</span>
        {addrUploaded && <span className="bg pending">Uploaded</span>}
        <span style={{fontSize: 11, color: '#888', marginLeft: 8}}>Optional</span>
      </div>
      <div style={{padding: 20}}>
        <div style={{fontSize: 12, color: 'var(--text-muted)', marginBottom: 12}}>Utility bill, bank statement, or government letter dated within 3 months. Must match your profile address.</div>
        {!addrUploaded ? (
          <label className="upload-zone" style={{cursor: 'pointer', display: 'block'}}>
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 40, height: 40, color: '#ccc', marginBottom: 8}}><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
            <div style={{fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4}}>Upload Proof of Address</div>
            <div style={{fontSize: 12, color: 'var(--text-muted)'}}>JPG, PNG or PDF · Max 10 MB</div>
            <input type="file" accept="image/*,.pdf" style={{display: 'none'}} onChange={() => handleFileUpload('addr')} />
          </label>
        ) : (
          <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8}}>
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>
            <div style={{flex: 1}}>
              <div style={{fontSize: 13, fontWeight: 600, color: '#166534'}}>proof_of_address.pdf</div>
              <div style={{fontSize: 11, color: '#888'}}>Uploaded · Pending review</div>
            </div>
            <button className="btn btn-o btn-sm" onClick={() => setAddrUploaded(false)}>Remove</button>
          </div>
        )}
      </div>
    </div>
  </div>
</div>


{/* ════════════════════════════
    PAYMENT & CARD
════════════════════════════ */}
<div className={`page ${activePage === 'payment' ? 'active' : ''}`} id="page-payment">
  <div style={{maxWidth: 680}}>

    {/* $250 Hold explanation */}
    <div className="pn" style={{marginBottom: 16}}>
      <div className="pn-h"><span className="pn-t">How the $250 Bid Hold Works</span></div>
      <div style={{padding: '14px 20px', fontSize: 13, lineHeight: '1.8', color: 'var(--text-secondary)'}}>
        <div>✓ When you place your <strong>first bid</strong> in any auction, a <strong>$250 hold</strong> is placed on your card.</div>
        <div>✓ The hold is <strong>released automatically</strong> within 5 business days if you don't win.</div>
        <div>✓ If you win, the <strong>$250 is applied</strong> toward your purchase price.</div>
        <div>✓ Only <strong>one hold</strong> per auction event — bidding on multiple units uses the same hold.</div>
        <div style={{marginTop: 8, fontSize: 12, color: 'var(--text-muted)'}}>The hold is not a charge. It is a temporary authorization to confirm your card is valid.</div>
      </div>
    </div>

    {/* Current card / Add card */}
    <div className="pn" style={{marginBottom: 16}}>
      <div className="pn-h"><span className="pn-t">Credit Card on File</span></div>
      <div style={{padding: 20}}>
        {cardAdded ? (
          <div>
            <div style={{display: 'flex', alignItems: 'center', gap: 16, padding: '14px 16px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8, marginBottom: 12}}>
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="1.5"><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
              <div style={{flex: 1}}>
                <div style={{fontSize: 14, fontWeight: 600}}>Visa ending in ·· {cardNum.slice(-4) || '4242'}</div>
                <div style={{fontSize: 12, color: '#888'}}>Expires {cardExp || '12/28'} · {cardName || 'Jane Doe'}</div>
              </div>
              <span className="bg active">Active</span>
            </div>
            <div style={{display: 'flex', gap: 8}}>
              <button className="btn btn-o btn-sm" onClick={() => { setCardAdded(false); setShowCardForm(true); }}>Replace Card</button>
              <button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => { if (confirm('Remove card? You will not be able to bid without a card on file.')) setCardAdded(false); }}>Remove</button>
            </div>
          </div>
        ) : (
          <div>
            {!showCardForm ? (
              <div style={{textAlign: 'center', padding: '20px 0'}}>
                <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5" style={{marginBottom: 8}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/></svg>
                <div style={{fontSize: 14, color: 'var(--text-muted)', marginBottom: 16}}>No card on file. Add a card to start bidding.</div>
                <button className="btn btn-p btn-sm" onClick={() => setShowCardForm(true)}>+ Add Credit Card</button>
              </div>
            ) : (
              <div>
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginBottom: 12}}>
                  <div className="form-group full" style={{margin: 0, gridColumn: '1/-1'}}><label>Cardholder Name</label><input placeholder="Jane Smith" value={cardName} onChange={e => setCardName(e.target.value)} /></div>
                  <div className="form-group full" style={{margin: 0, gridColumn: '1/-1'}}><label>Card Number</label><input placeholder="1234 5678 9012 3456" maxLength={19} style={{fontFamily: 'monospace'}} value={cardNum} onChange={e => setCardNum(e.target.value)} /></div>
                  <div className="form-group" style={{margin: 0}}><label>Expiry</label><input placeholder="MM / YY" maxLength={7} style={{fontFamily: 'monospace'}} value={cardExp} onChange={e => setCardExp(e.target.value)} /></div>
                  <div className="form-group" style={{margin: 0}}><label>CVV</label><input placeholder="123" maxLength={4} style={{fontFamily: 'monospace'}} value={cardCvv} onChange={e => setCardCvv(e.target.value)} /></div>
                </div>
                <div style={{fontSize: 11, color: '#888', marginBottom: 12, display: 'flex', alignItems: 'center', gap: 6}}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>
                  Secured by Stripe · No charge until you win an auction
                </div>
                <div style={{display: 'flex', gap: 8}}>
                  <button className="btn btn-s" onClick={handleAddCard}>Save Card</button>
                  <button className="btn btn-o" onClick={() => setShowCardForm(false)}>Cancel</button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>

    {/* Hold status */}
    <div className="cd-section">
      <div className="cd-section-h">$250 Hold Status</div>
      <div className="cd-row"><span className="cd-label">Current Hold</span><span className="cd-value"><span className="bg" style={{background: '#f3f4f6', color: '#888'}}>None Active</span></span></div>
      <div className="cd-row"><span className="cd-label">Last Auction</span><span className="cd-value" style={{color: 'var(--text-muted)'}}>No auctions yet</span></div>
      <div className="cd-row"><span className="cd-label">Holds Released</span><span className="cd-value">0</span></div>
      <div className="cd-row"><span className="cd-label">Applied to Purchase</span><span className="cd-value">$0.00</span></div>
    </div>
  </div>
</div>


{/* ════════════════════════════
    UPCOMING AUCTIONS
════════════════════════════ */}
<div className={`page ${activePage === 'upcoming' ? 'active' : ''}`} id="page-upcoming">

  {/* Next auction hero */}
  <div className="pn" style={{marginBottom: 20, background: 'var(--brand)', border: 'none', color: '#fff'}}>
    <div style={{padding: 24}}>
      <div style={{fontSize: 11, opacity: 0.7, letterSpacing: 1, textTransform: 'uppercase', marginBottom: 6}}>Next Public Auction</div>
      <div style={{fontSize: 22, fontWeight: 700, marginBottom: 4}}>May 8, 2026 · 12:00 PM EDT</div>
      <div style={{fontSize: 13, opacity: 0.7, marginBottom: 20}}>24-hour window · Open to all registered bidders · Dealer Suite 360 escrow</div>

      {/* Countdown */}
      <div style={{display: 'flex', gap: 12, marginBottom: 20}}>
        {[['Days', countdown.days],['Hours', countdown.hours],['Min', countdown.minutes],['Sec', countdown.seconds]].map(([l,v]) => (
          <div key={l as string} style={{background: 'rgba(255,255,255,0.15)', borderRadius: 8, padding: '10px 14px', textAlign: 'center', minWidth: 60}}>
            <div style={{fontSize: 24, fontWeight: 700, fontVariantNumeric: 'tabular-nums'}}>{String(v).padStart(2,'0')}</div>
            <div style={{fontSize: 10, opacity: 0.7, letterSpacing: 1}}>{l}</div>
          </div>
        ))}
      </div>

      <div style={{display: 'flex', gap: 8, flexWrap: 'wrap' as const}}>
        <button className="btn" style={{background: '#fff', color: 'var(--brand)', fontWeight: 600}} onClick={() => window.location.href = '/live-auctions'}>View Auction Page</button>
        {!cardAdded && <button className="btn btn-o" style={{borderColor: 'rgba(255,255,255,0.4)', color: '#fff'}} onClick={() => showPage('payment')}>Add Card to Bid</button>}
      </div>
    </div>
  </div>

  {/* Unit preview */}
  <div className="pn" style={{marginBottom: 20}}>
    <div className="pn-h"><span className="pn-t">May 8 Unit Preview</span><span style={{fontSize: 12, color: '#888'}}>6 units · Subject to change</span></div>
    <div className="tw"><table><thead><tr><th>#</th><th>Unit</th><th>Type</th><th>Province</th><th>Min Bid</th><th>Status</th></tr></thead><tbody>
      {[
        ['PA-0201','2024 Grand Design Imagine 2800BH','Travel Trailer','ON','$34,900'],
        ['PA-0202','2023 Keystone Montana 3855BR','Fifth Wheel','AB','$52,000'],
        ['PA-0203','2024 Jayco Jay Flight 264BH','Travel Trailer','BC','$29,900'],
        ['PA-0204','2023 Forest River Cherokee 304BH','Travel Trailer','ON','$36,500'],
        ['PA-0205','2024 Heartland Landmark 365CB','Fifth Wheel','SK','$68,000'],
        ['PA-0206','2024 Coachmen Sportscoach 403QS','Class A','QC','$145,000'],
      ].map(([id,unit,type,prov,min]) => (
        <tr key={id}><td style={{fontWeight: 500, color: 'var(--brand)'}}>{id}</td><td>{unit}</td><td>{type}</td><td>{prov}</td><td style={{fontWeight: 600}}>{min}</td><td><span className="bg pending">Preview</span></td></tr>
      ))}
    </tbody></table></div>
  </div>

  {/* Past auctions */}
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Past Auctions</span></div>
    <div className="tw"><table><thead><tr><th>Date</th><th>Units Listed</th><th>Units Sold</th><th>Status</th></tr></thead><tbody>
      <tr><td>Apr 2026</td><td>8</td><td>6</td><td><span className="bg pay-recv">Settled</span></td></tr>
      <tr><td>Mar 2026</td><td>5</td><td>4</td><td><span className="bg pay-recv">Settled</span></td></tr>
      <tr><td>Feb 2026</td><td>7</td><td>5</td><td><span className="bg pay-recv">Settled</span></td></tr>
    </tbody></table></div>
  </div>
</div>


{/* ════════════════════════════
    MY BIDS
════════════════════════════ */}
<div className={`page ${activePage === 'my-bids' ? 'active' : ''}`} id="page-my-bids">
  <div className="tabs" style={{marginBottom: 0}}>
    <div className={`tab ${bidsTab === 'active' ? 'active' : ''}`} onClick={() => setBidsTab('active')}>Active (0)</div>
    <div className={`tab ${bidsTab === 'history' ? 'active' : ''}`} onClick={() => setBidsTab('history')}>Bid History (2)</div>
  </div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>

    {/* Active */}
    {bidsTab === 'active' && (
      <div style={{padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)'}}>
        <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{marginBottom: 8, opacity: 0.3}}><path d="M14 2l-2 2-7 7 3 3 7-7 2-2-3-3z"/></svg>
        <div style={{fontSize: 14}}>No active bids — the auction is not currently live.</div>
        <div style={{fontSize: 12, marginTop: 4}}>Next auction: May 8, 2026 at 12:00 PM EDT</div>
      </div>
    )}

    {/* History */}
    {bidsTab === 'history' && (
      <div className="tw"><table><thead><tr><th>Auction</th><th>Unit</th><th>Your Bid</th><th>Final Price</th><th>Result</th><th>Date</th></tr></thead><tbody>
        {myBids.length === 0
          ? <tr><td colSpan={6} style={{textAlign:'center',color:'#888',padding:20}}>No bid history</td></tr>
          : myBids.map(b => {
            const won = b.result === 'won' || b.won;
            return (
              <tr key={b.id}>
                <td style={{fontWeight: 500, color: 'var(--brand)'}}>{b.auctionCode || b.auctionId}</td>
                <td>{b.unitDescription || b.unit?.description || '—'}</td>
                <td style={{fontWeight: 600}}>{b.bidAmount ? `$${Number(b.bidAmount).toLocaleString()}` : '—'}</td>
                <td>{b.finalPrice ? `$${Number(b.finalPrice).toLocaleString()}` : '—'}</td>
                <td>{won ? <span className="bg active">Won</span> : <span className="bg" style={{background: '#fef3c7', color: '#d97706'}}>Outbid</span>}</td>
                <td>{b.bidDate ? new Date(b.bidDate).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
              </tr>
            );
          })
        }
      </tbody></table></div>
    )}
  </div>
</div>


{/* ════════════════════════════
    WON UNITS
════════════════════════════ */}
<div className={`page ${activePage === 'won-units' ? 'active' : ''}`} id="page-won-units">

  {wonUnits.length === 0
    ? <div className="pn" style={{padding: '40px 20px', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13}}>No won units yet. All won units from past auctions will appear here with payment status and documentation.</div>
    : wonUnits.map(w => {
      const isPaid = w.paymentStatus === 'paid' || w.paid;
      const isDue  = !isPaid;
      return (
        <div key={w.id} className="pn" style={{marginBottom: 16, borderColor: isPaid ? undefined : '#fde68a'}}>
          <div style={{padding: '12px 20px', background: isPaid ? '#f0fdf4' : '#fffbeb', borderBottom: `1px solid ${isPaid ? '#bbf7d0' : '#fde68a'}`, display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
            <div>
              <span className={`bg ${isPaid ? 'active' : 'pending'}`} style={{marginRight: 8}}>{isPaid ? 'Paid' : 'Payment Due'}</span>
              <span style={{fontSize: 14, fontWeight: 700}}>{w.unitDescription || w.unit?.description || '—'}</span>
            </div>
            <span style={{fontSize: 13, color: isPaid ? '#888' : '#dc2626', fontWeight: isDue ? 600 : undefined}}>{w.auctionCode || w.auctionId}</span>
          </div>
          <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 0}}>
            <div>
              <div className="cd-row"><span className="cd-label">Auction</span><span className="cd-value">{w.auctionName || w.auctionCode || '—'}</span></div>
              <div className="cd-row"><span className="cd-label">Winning Bid</span><span className="cd-value" style={{fontWeight: 700, color: 'var(--brand)'}}>{w.bidAmount ? `$${Number(w.bidAmount).toLocaleString()}` : '—'}</span></div>
              <div className="cd-row"><span className="cd-label">$250 Hold</span><span className="cd-value" style={{color: isPaid ? '#22c55e' : undefined}}>{isPaid ? 'Applied to purchase' : 'Will be applied'}</span></div>
              {isPaid && <div className="cd-row"><span className="cd-label">Unit Transfer</span><span className="cd-value"><span className="bg active">Complete</span></span></div>}
              {isDue && <div className="cd-row"><span className="cd-label">Payment Window</span><span className="cd-value" style={{color: '#dc2626', fontWeight: 600}}>72 hours from auction close</span></div>}
            </div>
            <div style={{padding: 16, borderLeft: '1px solid var(--border-light)', display: 'flex', flexDirection: 'column' as const, gap: 8}}>
              {isPaid ? (
                <>
                  <button className="btn btn-o btn-sm" style={{justifyContent: 'center'}}>View Documents</button>
                  <button className="btn btn-o btn-sm" style={{justifyContent: 'center'}}>Download Receipt</button>
                </>
              ) : (
                <>
                  <button className="btn btn-s btn-sm" style={{justifyContent: 'center'}} onClick={async () => { try { await apiFetch('/api/payments/pay-invoice', { method: 'POST', body: JSON.stringify({ bidId: w.id }) }); } catch { alert('Payment failed. Please try again.'); } }}>Complete Payment</button>
                  <button className="btn btn-o btn-sm" style={{justifyContent: 'center'}} onClick={() => alert('Financing application will be available when connected to lender API.')}>Apply for Financing</button>
                </>
              )}
            </div>
          </div>
          {isDue && <div style={{padding: '10px 20px', background: '#fff7ed', borderTop: '1px solid #fed7aa', fontSize: 12, color: '#9a3412'}}>⚠ If payment is not received within 72 hours, the unit will be offered to the second-highest bidder and your $250 hold will be forfeited.</div>}
        </div>
      );
    })
  }
</div>


{/* ════════════════════════════
    SETTINGS
════════════════════════════ */}
<div className={`page ${activePage === 'settings' ? 'active' : ''}`} id="page-settings">
  <div style={{maxWidth: 640}}>
    <div className="tabs" style={{marginBottom: 0}}>
      <div className={`tab ${settingsTab === 'st-profile' ? 'active' : ''}`} onClick={() => setSettingsTab('st-profile')}>Security</div>
      <div className={`tab ${settingsTab === 'st-notif' ? 'active' : ''}`} onClick={() => setSettingsTab('st-notif')}>Notifications</div>
      <div className={`tab ${settingsTab === 'st-account' ? 'active' : ''}`} onClick={() => setSettingsTab('st-account')}>Account</div>
    </div>
    <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>

      {/* Security */}
      {settingsTab === 'st-profile' && (
        <div className="form-grid" style={{padding: 20, gap: 14}}>
          <div className="form-group full"><label style={{fontWeight: 600, fontSize: 13}}>Change Password</label></div>
          <div className="form-group full"><label>Current Password</label><input type="password" placeholder="••••••••" /></div>
          <div className="form-group full"><label>New Password</label><input type="password" placeholder="••••••••" /></div>
          <div className="form-group full"><label>Confirm New Password</label><input type="password" placeholder="••••••••" /></div>
          <div className="form-group full">
            <button className="btn btn-s" onClick={() => alert('Password updated.')}>Update Password</button>
          </div>
        </div>
      )}

      {/* Notifications */}
      {settingsTab === 'st-notif' && (
        <div style={{padding: 20}}>
          {[
            ['Auction reminders', 'Email me 24 hours before each auction opens'],
            ['Outbid alerts', 'Notify me immediately when I\'ve been outbid'],
            ['Auction results', 'Send results summary when auction closes'],
            ['Payment reminders', 'Remind me of upcoming payment deadlines'],
            ['New unit previews', 'Preview units added to the next auction'],
          ].map(([title, desc]) => (
            <div key={title as string} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px 0', borderBottom: '1px solid var(--border-light)'}}>
              <div>
                <div style={{fontSize: 13, fontWeight: 600}}>{title}</div>
                <div style={{fontSize: 12, color: 'var(--text-muted)'}}>{desc}</div>
              </div>
              <label style={{position: 'relative' as const, display: 'inline-flex', alignItems: 'center', cursor: 'pointer'}}>
                <input type="checkbox" defaultChecked style={{opacity: 0, width: 0, height: 0}} />
                <span style={{display: 'block', width: 36, height: 20, background: 'var(--brand)', borderRadius: 10}}></span>
              </label>
            </div>
          ))}
          <div style={{marginTop: 16}}>
            <button className="btn btn-s" onClick={() => alert('Notification preferences saved.')}>Save Preferences</button>
          </div>
        </div>
      )}

      {/* Account */}
      {settingsTab === 'st-account' && (
        <div style={{padding: 20}}>
          <div className="cd-row" style={{paddingBottom: 12}}><span className="cd-label">Email</span><span className="cd-value">{email || 'jane@example.com'}</span></div>
          <div className="cd-row" style={{paddingBottom: 12}}><span className="cd-label">Account Type</span><span className="cd-value"><span className="bg active">Public Bidder</span></span></div>
          <div className="cd-row" style={{paddingBottom: 12}}><span className="cd-label">Member Since</span><span className="cd-value">March 2026</span></div>
          <div style={{marginTop: 20, paddingTop: 16, borderTop: '1px solid var(--border-light)', display: 'flex', gap: 8}}>
            <button className="btn btn-o" onClick={() => { if(confirm('Log out?')) window.location.href = '/live-auctions'; }}>Log Out</button>
            <button className="btn btn-o" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => alert('Please contact support@dealersuite360.com to delete your account.')}>Delete Account</button>
          </div>
        </div>
      )}
    </div>
  </div>
</div>


{/* ─── BROWSE UNITS * ─── */}
<div className={`page ${activePage === 'browse-units' ? 'active' : ''}`} id="page-browse-units">
  <div className="pn" style={{padding: '48px 32px', textAlign: 'center', maxWidth: 520, margin: '0 auto'}}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{marginBottom: 16}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
    <div style={{fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8}}>Browse Units *</div>
    <div style={{fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 24}}>Search and filter the full marketplace inventory — travel trailers, fifth wheels, Class A, Class C, and more. Save units to your watchlist and get notified when they go to auction.</div>
    <span style={{background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, border: '1px solid #fcd34d'}}>Coming Soon — V6 Feature</span>
  </div>
</div>

{/* ─── PAYMENT METHODS * ─── */}
<div className={`page ${activePage === 'payment-methods' ? 'active' : ''}`} id="page-payment-methods">
  <div className="pn" style={{padding: '48px 32px', textAlign: 'center', maxWidth: 520, margin: '0 auto'}}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" strokeWidth="1.5" style={{marginBottom: 16}}><rect x="1" y="4" width="22" height="16" rx="2"/><line x1="1" y1="10" x2="23" y2="10"/><path d="M6 14h4"/><path d="M14 14h4"/></svg>
    <div style={{fontSize: 20, fontWeight: 700, color: '#0f172a', marginBottom: 8}}>Payment Methods *</div>
    <div style={{fontSize: 14, color: '#555', lineHeight: 1.6, marginBottom: 24}}>Manage all payment methods on your bidder account — credit cards, bank accounts, and escrow funding sources. Set your default method for auction deposits and final payments.</div>
    <span style={{background: '#fef3c7', color: '#92400e', fontSize: 12, fontWeight: 600, padding: '4px 14px', borderRadius: 20, border: '1px solid #fcd34d'}}>Coming Soon — V6 Feature</span>
  </div>
</div>


</div>{/* end .content */}
</div>{/* end .main */}
    </>
  );
}
