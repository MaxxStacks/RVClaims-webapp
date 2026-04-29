// DealerPortal.tsx - Converted from dealer-portal.html
// Layout: sidebar(position:fixed) + main(margin-left:240px) + content(block) + page(display:block)
// DO NOT modify layout structure. DO NOT add display:flex to .content.

import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/use-auth';
import ds360Icon from '@assets/ds360_favicon.png';
import ds360LogoLight from '@assets/DS360_logo_light.png';
import ds360LogoDark from '@assets/DS360_logo_dark.png';
import { MobileBottomNav, OfflineBanner } from '../components/MobileBottomNav';
import { DealerMarketplacePages } from '../components/DealerMarketplace';
import { DealerShowcasePages } from '../components/PublicAuctionPages';
import { apiFetch } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import DispatchBoard from '../components/service/DispatchBoard';

export default function DealerPortal() {
  const [activePage, setActivePage] = useState('dashboard');
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [pageSub, setPageSub] = useState("Smith's RV Centre");
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [lang, setLang] = useState(() => localStorage.getItem('ds360-lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en'));

  const [unitTab, setUnitTab] = useState('u-info');
  const [dSettingsTab, setDSettingsTab] = useState('ds-profile');
  const [dclTab, setDclTab] = useState('dcl-current');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  const { user, logout } = useAuth();
  // Show owner-only items to everyone when not yet authenticated (prototype mode)
  const isDealerOwner = !user || user.role === 'dealer_owner';
  const isDealerStaff = user?.role === 'dealer_staff';
  const isTechnician = user?.role === 'technician';
  const isPublicBidder = user?.role === 'public_bidder';
  const isConsignor = user?.role === 'consignor';
  const isServiceManager = user?.role === 'service_manager';
  const isShopManager = user?.role === 'shop_manager';
  const isPartsDept = user?.role === 'parts_dept';
  const isServiceRole = isServiceManager || isShopManager || isPartsDept;

  // Human-readable role label shown in sidebar
  const roleLabel = isDealerOwner ? 'Dealer Owner'
    : isDealerStaff ? 'Dealer Staff'
    : isTechnician ? 'Technician'
    : isServiceManager ? 'Service Manager'
    : isShopManager ? 'Shop Manager'
    : isPartsDept ? 'Parts Dept'
    : isPublicBidder ? 'Public Bidder'
    : isConsignor ? 'Consignor'
    : 'Dealer';
  const roleBadge = isDealerOwner ? 'Owner'
    : isDealerStaff ? 'Staff'
    : isTechnician ? 'Tech'
    : isServiceManager ? 'Svc Mgr'
    : isShopManager ? 'Shop Mgr'
    : isPartsDept ? 'Parts'
    : isPublicBidder ? 'Bidder'
    : isConsignor ? 'Consignor'
    : 'Dealer';

  // Nav/page visibility per role
  const showClaims = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showUnits = !isPublicBidder && !isConsignor && !isServiceRole;
  const showFinancing = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showFI = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showWarranty = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showParts = !isPublicBidder && !isConsignor && !isServiceRole;
  const showBrowse = !isTechnician && !isConsignor && !isServiceRole;
  const showListings = !isTechnician && !isPublicBidder && !isServiceRole;
  const showTransactions = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showAuctions = !isTechnician && !isConsignor && !isServiceRole;
  const showShowcase = !isTechnician && !isPublicBidder && !isServiceRole;
  const showCustomers = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showClients = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showMessages = !isPublicBidder && !isConsignor && !isServiceRole;
  const showDocuments = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showTechflow = !isPublicBidder && !isConsignor && !isServiceRole;
  const showConsignment = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showMarketing = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showSalesServices = !isTechnician && !isPublicBidder && !isConsignor && !isServiceRole;
  const showMyBids = !isTechnician && !isConsignor && !isServiceRole;
  const showEscrow = isDealerOwner || isPublicBidder || isConsignor;

  // ─── API data state ────────────────────────────────────────────────────────
  const [dlrClaims, setDlrClaims] = useState<any[]>([]);
  const [dlrUnits, setDlrUnits] = useState<any[]>([]);
  const [dlrInvoices, setDlrInvoices] = useState<any[]>([]);
  const [dlrStaff, setDlrStaff] = useState<any[]>([]);
  const [dlrTickets, setDlrTickets] = useState<any[]>([]);
  const [dlrNotifications, setDlrNotifications] = useState<any[]>([]);
  const [dlrPartsOrders, setDlrPartsOrders] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  // ─── Selected IDs ──────────────────────────────────────────────────────────
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedTicketId, setSelectedTicketId] = useState<string | null>(null);

  // ─── Add unit form ─────────────────────────────────────────────────────────
  const [addUnitForm, setAddUnitForm] = useState({ vin: '', year: '', manufacturer: '', model: '', stockNumber: '' });
  const [addUnitSaving, setAddUnitSaving] = useState(false);

  // ─── Invite customer form ──────────────────────────────────────────────────
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteSaving, setInviteSaving] = useState(false);

  // ─── Upload form ───────────────────────────────────────────────────────────
  const [uploadUnitId, setUploadUnitId] = useState('');
  const [uploadFiles, setUploadFiles] = useState<File[]>([]);
  const [uploadSaving, setUploadSaving] = useState(false);

  const [toastMsg, setToastMsg] = useState('');
  const [toastVisible, setToastVisible] = useState(false);
  const handleToast = (msg: string) => {
    setToastMsg(msg);
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2800);
  };

  const titles: Record<string, [string, string]> = {dashboard:['Dashboard','Smith\u0027s RV Centre'],upload:['Upload Photos','Push to Claim'],claims:['My Claims','14 total claims'],'claim-detail':['CLM-2026-0248','Warranty \u00b7 2024 Jayco Jay Flight'],units:['My Units','12 units'],'add-unit':['Add New Unit','Register unit'],'unit-detail':['2024 Jayco Jay Flight 264BH','VIN: 1UJBJ0BN8M1TJ4K1'],
'svc-financing':['Financing','My financing requests'],'svc-financing-det':['FIN-0023','Daniel Tremblay'],'svc-financing-new':['Request Financing','Submit to lenders'],
'svc-fi':['F\u0026I Products','My F\u0026I deals'],'svc-fi-new':['Flag Deal for F\u0026I','Request product recommendations'],'svc-fi-detail':['F\u0026I Deal','Deal details \u0026 products'],
'svc-warranty':['Warranty Plans','4 active plans'],'svc-warranty-detail':['Warranty Plan','Plan details \u0026 coverage'],'svc-parts':['Parts Orders','My parts orders'],'svc-parts-new':['Order Parts','Request parts'],'svc-parts-det':['Parts Order','Order status \u0026 tracking'],
'mkt-gate':['Dealer Marketplace','Membership required'],'mkt-browse':['Browse Marketplace','142 units available'],'mkt-listing-view':['Unit Details','Marketplace listing'],'mkt-post-unit':['Post a Unit','List on marketplace'],'mkt-my-listings':['My Listings','Units you have listed'],'mkt-my-transactions':['My Transactions','Purchases & sales'],'mkt-live-auctions':['Live Auctions','Bid on units'],'mkt-auction-room':['Auction Room','Live bidding'],'mkt-showcase':['Public Showcase','$299/year add-on'],'mkt-showcase-submit':['Submit Unit','Public auction showcase'],
invoices:['Invoices \u0026 Billing','Payment history'],customers:['Customer Portal','Manage customer access'],'invite-customer':['Invite Customer','Send portal invitation'],'cust-tickets':['Customer Tickets','Support tickets from customers'],'cust-ticket-detail':['TKT-0042','Robert Martin \u00b7 Warranty claim'],
staff:['Staff Management','Manage team access'],'add-staff':['Add Staff','Invite team member'],branding:['Branding \u0026 Domain','Customer portal appearance'],notifications:['Notifications','Updates from operator'],'dealer-settings':['Settings','Account and profile settings'],'dealer-changelog':['What\u0027s New','Platform updates \u0026 roadmap'],
clients:['Client Files','Your customer accounts'],messages:['Messages','Inbox from DS360 \u0026 claim threads'],documents:['Documents','Invoices, contracts \u0026 reports'],techflow:['TechFlow','Work orders \u0026 dispatch'],'wo-new':['New Work Order','Create a work order'],'wo-detail':['WO-0041','Slide-out seal replacement'],consignment:['Consignment','Manage consigned units'],marketing:['Marketing','Campaigns \u0026 lead capture'],'sales-services':['Sales \u0026 Services','Sell products, warranty plans \u0026 F\u0026I'],
'my-subscription':['My Subscription','Plan details \u0026 billing'],'portal-settings':['Portal Settings','Staff, branding, domain \u0026 notifications'],
'consignor-units':['My Consigned Units','Units listed on your behalf'],'consignor-offers':['Offers Received','Buyer offers on your units'],'consignor-payouts':['Payouts','Earnings \u0026 payment history'],
'bidder-my-bids':['My Bids','Active \u0026 past bids'],'bidder-verification':['Verification','Buyer identity \u0026 deposit'],
'mkt-my-bids':['My Bids','Marketplace bid history'],'mkt-escrow-payments':['Escrow & Payments','Transaction escrow & release'],
'svc-dispatch':['Dispatch Scheduler','Assign work orders to technicians'],'svc-technicians':['Technician Management','Team schedule & performance']};

  const parents: Record<string, string> = {'claim-detail':'claims','unit-detail':'units','add-unit':'units','invite-customer':'customers','add-staff':'staff','svc-financing-det':'svc-financing','svc-financing-new':'svc-financing','svc-fi-new':'svc-fi','svc-parts-new':'svc-parts','cust-ticket-detail':'cust-tickets','mkt-listing-view':'mkt-browse','mkt-post-unit':'mkt-my-listings','mkt-auction-room':'mkt-live-auctions','mkt-showcase-submit':'mkt-showcase','svc-fi-detail':'svc-fi','svc-warranty-detail':'svc-warranty','svc-parts-det':'svc-parts','wo-new':'techflow','wo-detail':'techflow'};

  useEffect(() => { if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); }, []);

  // ─── Data fetching keyed on activePage ─────────────────────────────────────
  useEffect(() => {
    setDataError(null);
    const fetch = async () => {
      try {
        if (activePage === 'dashboard' || activePage === 'claims') {
          const d = await apiFetch<any>('/api/v6/claims');
          setDlrClaims(Array.isArray(d) ? d : []);
        }
        if (activePage === 'dashboard' || activePage === 'units' || activePage === 'upload') {
          const d = await apiFetch<any>('/api/v6/units');
          setDlrUnits(Array.isArray(d) ? d : []);
        }
        if (activePage === 'invoices') {
          const d = await apiFetch<any>('/api/invoices');
          setDlrInvoices(d.invoices || []);
        }
        if (activePage === 'staff') {
          const d = await apiFetch<any>('/api/v6/users');
          setDlrStaff(Array.isArray(d) ? d : []);
        }
        if (activePage === 'cust-tickets') {
          const d = await apiFetch<any>('/api/tickets');
          setDlrTickets(d.tickets || []);
        }
        if (activePage === 'notifications') {
          const d = await apiFetch<any>('/api/v6/notifications');
          setDlrNotifications(Array.isArray(d) ? d : []);
        }
        if (activePage === 'svc-parts') {
          const d = await apiFetch<any>('/api/v6/parts-orders');
          setDlrPartsOrders(Array.isArray(d) ? d : []);
        }
      } catch (err: any) {
        setDataError(err?.message || 'Failed to load data');
      }
    };
    fetch();
  }, [activePage, selectedClaimId, selectedUnitId]);

  // ─── WebSocket ─────────────────────────────────────────────────────────────
  useEffect(() => {
    wsClient.connect();
    const unsubClaim = wsClient.on('claim:updated', () => {
      if (activePage === 'claims' || activePage === 'dashboard') {
        apiFetch<any>('/api/v6/claims').then(d => setDlrClaims(Array.isArray(d) ? d : [])).catch(() => {});
      }
    });
    const unsubTicket = wsClient.on('ticket:message', () => {
      if (activePage === 'cust-tickets' || activePage === 'cust-ticket-detail') {
        apiFetch<any>('/api/tickets').then(d => setDlrTickets(d.tickets || [])).catch(() => {});
      }
    });
    return () => { unsubClaim(); unsubTicket(); };
  }, [activePage]);

  // ─── Form handlers ─────────────────────────────────────────────────────────
  const handleAddUnit = async () => {
    if (!addUnitForm.vin) return;
    setAddUnitSaving(true);
    try {
      await apiFetch('/api/v6/units', {
        method: 'POST',
        body: JSON.stringify({
          vin: addUnitForm.vin,
          year: addUnitForm.year ? parseInt(addUnitForm.year) : undefined,
          manufacturer: addUnitForm.manufacturer,
          model: addUnitForm.model,
          stockNumber: addUnitForm.stockNumber,
        }),
      });
      setAddUnitForm({ vin: '', year: '', manufacturer: '', model: '', stockNumber: '' });
      const d = await apiFetch<any>('/api/v6/units');
      setDlrUnits(Array.isArray(d) ? d : []);
      showPage('units');
    } catch { /* ignore */ } finally { setAddUnitSaving(false); }
  };

  const handleInviteCustomer = async () => {
    if (!inviteEmail) return;
    setInviteSaving(true);
    try {
      await apiFetch('/api/users/invite', { method: 'POST', body: JSON.stringify({ email: inviteEmail, role: 'client' }) });
      setInviteEmail('');
      showPage('customers');
    } catch { /* ignore */ } finally { setInviteSaving(false); }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await apiFetch(`/api/v6/notifications/${id}/read`, { method: 'POST' });
      setDlrNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    } catch { /* ignore */ }
  };

  const showPage = (id: string) => {
    const ownerOnlyPages = ['invoices', 'staff', 'add-staff', 'branding', 'my-subscription', 'portal-settings'];
    if (ownerOnlyPages.includes(id) && !isDealerOwner) id = 'dashboard';
    const technicianPages = ['dashboard', 'units', 'add-unit', 'unit-detail', 'svc-parts', 'svc-parts-new', 'techflow', 'messages', 'notifications', 'dealer-settings', 'dealer-changelog'];
    if (isTechnician && !technicianPages.includes(id)) id = 'units';
    const bidderPages = ['dashboard', 'mkt-browse', 'mkt-listing-view', 'mkt-live-auctions', 'mkt-auction-room', 'mkt-my-bids', 'bidder-my-bids', 'bidder-verification', 'mkt-escrow-payments', 'notifications', 'dealer-settings', 'dealer-changelog'];
    if (isPublicBidder && !bidderPages.includes(id)) id = 'mkt-browse';
    const consignorPages = ['dashboard', 'mkt-my-listings', 'mkt-post-unit', 'mkt-showcase', 'mkt-showcase-submit', 'consignor-units', 'consignor-offers', 'consignor-payouts', 'mkt-escrow-payments', 'notifications', 'dealer-settings', 'dealer-changelog'];
    if (isConsignor && !consignorPages.includes(id)) id = 'mkt-my-listings';
    const serviceManagerPages = ['dashboard', 'units', 'add-unit', 'unit-detail', 'techflow', 'wo-new', 'wo-detail', 'svc-dispatch', 'svc-technicians', 'svc-parts', 'svc-parts-new', 'svc-parts-det', 'messages', 'notifications', 'dealer-settings', 'dealer-changelog'];
    if (isServiceManager && !serviceManagerPages.includes(id)) id = 'techflow';
    const shopManagerPages = ['dashboard', 'techflow', 'wo-new', 'wo-detail', 'svc-dispatch', 'svc-parts', 'svc-parts-new', 'svc-parts-det', 'notifications', 'dealer-settings', 'dealer-changelog'];
    if (isShopManager && !shopManagerPages.includes(id)) id = 'techflow';
    const partsDeptPages = ['dashboard', 'svc-parts', 'svc-parts-new', 'svc-parts-det', 'notifications', 'dealer-settings', 'dealer-changelog'];
    if (isPartsDept && !partsDeptPages.includes(id)) id = 'svc-parts';
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


  // Branding state
  const [brandColor, setBrandColor] = useState('#08235d');
  const [accentColor, setAccentColor] = useState('#22c55e');

  // File upload: unit photo
  const updateUnitPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = document.getElementById('unit-photo-img') as HTMLImageElement;
      if (img) { img.src = src; img.style.display = 'block'; }
      const ph = document.getElementById('unit-photo-placeholder');
      if (ph) ph.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  // File upload: profile photo
  const updateProfileImage = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const display = document.getElementById('profile-avatar-display');
      if (display) display.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />';
      const sidebar = document.getElementById('user-avatar');
      if (sidebar) sidebar.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />';
    };
    reader.readAsDataURL(file);
  };

  // File upload: logo
  const previewLogo = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = document.getElementById('logo-img') as HTMLImageElement;
      if (img) img.src = src;
      const preview = document.getElementById('logo-preview');
      if (preview) preview.style.display = 'block';
      const placeholder = document.getElementById('logo-placeholder');
      if (placeholder) placeholder.style.display = 'none';
      // Update sidebar logo
      const svgEl = document.getElementById('sidebar-logo-svg');
      if (svgEl) {
        const newImg = document.createElement('img');
        newImg.src = src;
        newImg.id = 'sidebar-logo-svg';
        newImg.className = 'sidebar-logo-img';
        svgEl.parentNode?.replaceChild(newImg, svgEl);
      }
    };
    reader.readAsDataURL(file);
  };

  // Branding: apply colors
  const applyBranding = () => {
    document.documentElement.style.setProperty('--brand', brandColor);
    document.documentElement.style.setProperty('--brand-dark', brandColor);
    const avatar = document.querySelector('.user-avatar') as HTMLElement;
    if (avatar) avatar.style.background = brandColor;
    const svgRect = document.querySelector('#sidebar-logo-svg rect');
    if (svgRect) svgRect.setAttribute('fill', brandColor);
    const nameInput = document.getElementById('dealer-name-input') as HTMLInputElement;
    if (nameInput?.value) {
      const sn = document.getElementById('sidebar-name');
      if (sn) sn.textContent = nameInput.value;
      const hn = document.getElementById('header-dealer-name');
      if (hn) hn.textContent = nameInput.value;
    }
    const msg = document.getElementById('brand-saved');
    if (msg) { msg.style.display = 'inline'; setTimeout(() => { msg.style.display = 'none'; }, 3000); }
  };

  const previewBranding = () => { applyBranding(); showPage('dashboard'); };

  const restoreBranding = () => {
    setBrandColor('#08235d');
    setAccentColor('#22c55e');
    document.documentElement.style.setProperty('--brand', '#08235d');
    document.documentElement.style.setProperty('--brand-dark', '#061b48');
    const msg = document.getElementById('brand-saved');
    if (msg) { msg.textContent = '\u2713 Defaults restored!'; msg.style.display = 'inline'; setTimeout(() => { msg.style.display = 'none'; msg.textContent = '\u2713 Branding saved and applied!'; }, 3000); }
  };

  return (
    <>
<nav className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
  <div className="sidebar-logo" id="sidebar-header"><img src={ds360Icon} id="sidebar-logo-svg" width="36" height="36" style={{borderRadius:8}} alt="DS360" /><div className="sidebar-logo-text"><div className="sidebar-logo-name" id="sidebar-name">Smith's RV Centre</div><div className="sidebar-logo-sub">Dealership Portal</div><span className="sidebar-badge" style={{marginTop:4}}>{roleBadge}</span></div></div>
  <div className="sidebar-nav">
    <div className="nav-section"><div className="nav-label">Overview</div>
      <div className={`nav-item ${isNavActive('dashboard') ? 'active' : ''}`} onClick={() => showPage('dashboard')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div></div>
    {showClaims && <div className="nav-section"><div className="nav-label">Claims</div>
      <div className={`nav-item ${isNavActive('upload') ? 'active' : ''}`} onClick={() => showPage('upload')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>Upload Photos<span className="nb green">New</span></div>
      <div className={`nav-item ${isNavActive('claims') ? 'active' : ''}`} onClick={() => showPage('claims')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>My Claims<span className="nb blue">14</span></div></div>}
    {showUnits && <div className="nav-section"><div className="nav-label">Units</div>
      <div className={`nav-item ${isNavActive('units') ? 'active' : ''}`} onClick={() => showPage('units')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>My Units{dlrUnits.length > 0 && <span className="nb blue">{dlrUnits.length}</span>}</div></div>}
    {(showFinancing || showFI || showWarranty || showParts) && <div className="nav-section"><div className="nav-label">Services</div>
      {showFinancing && <div className={`nav-item ${isNavActive('svc-financing') ? 'active' : ''}`} onClick={() => showPage('svc-financing')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Financing<span className="nb blue">1</span></div>}
      {showFI && <div className={`nav-item ${isNavActive('svc-fi') ? 'active' : ''}`} onClick={() => showPage('svc-fi')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>F&I Products</div>}
      {showWarranty && <div className={`nav-item ${isNavActive('svc-warranty') ? 'active' : ''}`} onClick={() => showPage('svc-warranty')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>Warranty Plans<span className="nb blue">4</span></div>}
      {showParts && <div className={`nav-item ${isNavActive('svc-parts') ? 'active' : ''}`} onClick={() => showPage('svc-parts')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts Orders<span className="nb amber">2</span></div>}
    </div>}
    {!isTechnician && !isServiceRole && <div className="nav-section"><div className="nav-label">Marketplace</div>
      {showBrowse && <div className={`nav-item ${isNavActive('mkt-browse') ? 'active' : ''}`} onClick={() => showPage('mkt-browse')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>Browse Units<span className="nb green">142</span></div>}
      {showListings && <div className={`nav-item ${isNavActive('mkt-my-listings') ? 'active' : ''}`} onClick={() => showPage('mkt-my-listings')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M12 8v8"/><path d="M8 12h8"/></svg>My Listings</div>}
      {showTransactions && <div className={`nav-item ${isNavActive('mkt-my-transactions') ? 'active' : ''}`} onClick={() => showPage('mkt-my-transactions')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>My Transactions</div>}
      {showAuctions && <div className={`nav-item ${isNavActive('mkt-live-auctions') ? 'active' : ''}`} onClick={() => showPage('mkt-live-auctions')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Live Auctions<span className="nb red">1</span></div>}
      {showShowcase && <div className={`nav-item ${isNavActive('mkt-showcase') ? 'active' : ''}`} onClick={() => showPage('mkt-showcase')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Public Showcase</div>}
      {showMyBids && <div className={`nav-item ${isNavActive('mkt-my-bids') ? 'active' : ''}`} onClick={() => showPage('mkt-my-bids')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>My Bids</div>}
      {showEscrow && <div className={`nav-item ${isNavActive('mkt-escrow-payments') ? 'active' : ''}`} onClick={() => showPage('mkt-escrow-payments')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0110 0v4"/></svg>Escrow &amp; Payments</div>}
    </div>}
    {(showClients || showMessages || showDocuments || showTechflow || showConsignment || showMarketing || showSalesServices) && <div className="nav-section"><div className="nav-label">Operations</div>
      {showClients && <div className={`nav-item ${isNavActive('clients') ? 'active' : ''}`} onClick={() => showPage('clients')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>Client Files</div>}
      {showMessages && <div className={`nav-item ${isNavActive('messages') ? 'active' : ''}`} onClick={() => showPage('messages')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Messages<span className="nb blue">2</span></div>}
      {showDocuments && <div className={`nav-item ${isNavActive('documents') ? 'active' : ''}`} onClick={() => showPage('documents')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>Documents</div>}
      {showTechflow && <div className={`nav-item ${isNavActive('techflow') ? 'active' : ''}`} onClick={() => showPage('techflow')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>TechFlow<span className="nb green">New</span></div>}
      {showConsignment && <div className={`nav-item ${isNavActive('consignment') ? 'active' : ''}`} onClick={() => showPage('consignment')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>Consignment</div>}
      {showMarketing && <div className={`nav-item ${isNavActive('marketing') ? 'active' : ''}`} onClick={() => showPage('marketing')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>Marketing</div>}
      {showSalesServices && <div className={`nav-item ${isNavActive('sales-services') ? 'active' : ''}`} onClick={() => showPage('sales-services')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="9" cy="21" r="1"/><circle cx="20" cy="21" r="1"/><path d="M1 1h4l2.68 13.39a2 2 0 002 1.61h9.72a2 2 0 001.95-1.57l1.65-7.43H6"/></svg>Sales &amp; Services</div>}
    </div>}
    {isConsignor && <div className="nav-section"><div className="nav-label">My Consignment</div>
      <div className={`nav-item ${isNavActive('consignor-units') ? 'active' : ''}`} onClick={() => showPage('consignor-units')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>My Consigned Units</div>
      <div className={`nav-item ${isNavActive('consignor-offers') ? 'active' : ''}`} onClick={() => showPage('consignor-offers')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Offers Received<span className="nb amber">1</span></div>
      <div className={`nav-item ${isNavActive('consignor-payouts') ? 'active' : ''}`} onClick={() => showPage('consignor-payouts')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Payouts</div>
    </div>}
    {isPublicBidder && <div className="nav-section"><div className="nav-label">My Account</div>
      <div className={`nav-item ${isNavActive('bidder-my-bids') ? 'active' : ''}`} onClick={() => showPage('bidder-my-bids')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8h1a4 4 0 010 8h-1"/><path d="M2 8h16v9a4 4 0 01-4 4H6a4 4 0 01-4-4V8z"/><line x1="6" y1="1" x2="6" y2="4"/><line x1="10" y1="1" x2="10" y2="4"/><line x1="14" y1="1" x2="14" y2="4"/></svg>My Bids</div>
      <div className={`nav-item ${isNavActive('bidder-verification') ? 'active' : ''}`} onClick={() => showPage('bidder-verification')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 11.08V12a10 10 0 11-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>Verification</div>
    </div>}
    {isServiceManager && <><div className="nav-section"><div className="nav-label">Service</div>
      <div className={`nav-item ${isNavActive('techflow') ? 'active' : ''}`} onClick={() => showPage('techflow')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>Work Orders<span className="nb blue">4</span></div>
      <div className={`nav-item ${isNavActive('svc-dispatch') ? 'active' : ''}`} onClick={() => showPage('svc-dispatch')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Dispatch Scheduler</div>
      <div className={`nav-item ${isNavActive('svc-technicians') ? 'active' : ''}`} onClick={() => showPage('svc-technicians')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>Technician Mgmt</div>
    </div>
    <div className="nav-section"><div className="nav-label">Operations</div>
      <div className={`nav-item ${isNavActive('units') ? 'active' : ''}`} onClick={() => showPage('units')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>Unit Lookup</div>
      <div className={`nav-item ${isNavActive('svc-parts') ? 'active' : ''}`} onClick={() => showPage('svc-parts')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts Orders<span className="nb amber">2</span></div>
      <div className={`nav-item ${isNavActive('messages') ? 'active' : ''}`} onClick={() => showPage('messages')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg>Messages<span className="nb blue">2</span></div>
    </div></>}
    {isShopManager && <div className="nav-section"><div className="nav-label">Shop</div>
      <div className={`nav-item ${isNavActive('techflow') ? 'active' : ''}`} onClick={() => showPage('techflow')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>Work Orders<span className="nb blue">4</span></div>
      <div className={`nav-item ${isNavActive('svc-dispatch') ? 'active' : ''}`} onClick={() => showPage('svc-dispatch')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Dispatch Scheduler<span className="nb green">New</span></div>
      <div className={`nav-item ${isNavActive('svc-parts') ? 'active' : ''}`} onClick={() => showPage('svc-parts')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts Orders<span className="nb amber">2</span></div>
    </div>}
    {isPartsDept && <div className="nav-section"><div className="nav-label">Parts</div>
      <div className={`nav-item ${isNavActive('svc-parts') ? 'active' : ''}`} onClick={() => showPage('svc-parts')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts Orders<span className="nb amber">2</span></div>
    </div>}
    {isDealerOwner && <div className="nav-section"><div className="nav-label">Billing</div>
      <div className={`nav-item ${isNavActive('invoices') ? 'active' : ''}`} onClick={() => showPage('invoices')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Invoices &amp; Billing</div>
      <div className={`nav-item ${isNavActive('my-subscription') ? 'active' : ''}`} onClick={() => showPage('my-subscription')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 002 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg>My Subscription</div>
      <div className={`nav-item ${isNavActive('portal-settings') ? 'active' : ''}`} onClick={() => showPage('portal-settings')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>Portal Settings</div>
    </div>}
    {showCustomers && <div className="nav-section"><div className="nav-label">Customers</div>
      <div className={`nav-item ${isNavActive('customers') ? 'active' : ''}`} onClick={() => showPage('customers')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Customer Portal<span className="nb blue">8</span></div>
      <div className={`nav-item ${isNavActive('cust-tickets') ? 'active' : ''}`} onClick={() => showPage('cust-tickets')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Customer Tickets<span className="nb amber">3</span></div></div>}
    <div className="nav-section"><div className="nav-label">Settings</div>
      {isDealerOwner && <div className={`nav-item ${isNavActive('staff') ? 'active' : ''}`} onClick={() => showPage('staff')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>Staff</div>}
      {isDealerOwner && <div className={`nav-item ${isNavActive('branding') ? 'active' : ''}`} onClick={() => showPage('branding')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M2 12h20"/><path d="M12 2a15.3 15.3 0 014 10 15.3 15.3 0 01-4 10 15.3 15.3 0 01-4-10 15.3 15.3 0 014-10z"/></svg>Branding & Domain</div>}
      <div className={`nav-item ${isNavActive('dealer-settings') ? 'active' : ''}`} onClick={() => showPage('dealer-settings')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Settings</div>
      <div className={`nav-item ${isNavActive('notifications') ? 'active' : ''}`} onClick={() => showPage('notifications')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>Notifications<span className="nb red">3</span></div>
      <div className={`nav-item ${isNavActive('dealer-changelog') ? 'active' : ''}`} onClick={() => showPage('dealer-changelog')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>What&apos;s New</div>
      <div className="nav-item" onClick={() => window.open('/system-status', '_blank')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>System Status<span className="nb green">Live</span></div></div>
  </div>
  <div className="sidebar-footer"><div className="user-info" style={{cursor: 'pointer'}} onClick={() => showPage('dealer-settings')}><div className="user-avatar" id="user-avatar">MS</div><div><div className="user-name">Mike Smith</div><div className="user-role">{roleLabel}</div></div></div><button onClick={async () => { await logout(); window.location.href = '/'; }} style={{width:'100%',marginTop:8,padding:'7px 12px',background:'none',border:'1px solid #e0e0e0',borderRadius:6,fontSize:12,color:'#888',cursor:'pointer',fontFamily:'inherit',textAlign:'left' as const,display:'flex',alignItems:'center',gap:6}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</button></div>
</nav>
<div className={`main${sidebarCollapsed ? ' collapsed-main' : ''}`}>
<header className="header"><div className="header-left"><button className="hbtn" onClick={() => setSidebarCollapsed(c => !c)} title="Toggle sidebar" style={{flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button><img src={ds360Icon} width="28" height="28" style={{borderRadius:6,flexShrink:0,marginRight:4}} alt="DS360" /><div><div className="header-title" id="page-title">{pageTitle}</div><div className="header-sub" id="page-sub">{pageSub}</div></div></div><div className="header-right"><div className="lang-toggle" id="lang-toggle"><button className={`lang-btn-opt ${lang === "en" ? "active" : ""}`} id="lang-en" onClick={() => handleSetLang('en')}>EN</button><button className={`lang-btn-opt ${lang === "fr" ? "active" : ""}`} id="lang-fr" onClick={() => handleSetLang('fr')}>FR</button></div><button className="theme-toggle" onClick={() => toggleTheme()} id="theme-btn" title="Toggle dark mode"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button><button className="hbtn" onClick={() => showPage('notifications')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg><span className="ndot"></span></button></div></header>
<div className="content">


<div className={`page ${activePage === 'dashboard' ? 'active' : ''}`} id="page-dashboard">
  <div className="al-g">
    <div className="al"><div className="al-i in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg></div><div className="al-c"><div className="al-t">3 claims in progress</div><div className="al-d">Being processed by operator</div></div><span className="al-a" onClick={() => showPage('claims')}>View</span></div>
    <div className="al"><div className="al-i wa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div className="al-c"><div className="al-t">1 invoice pending</div><div className="al-d">$140.12 due</div></div><span className="al-a" onClick={() => showPage('invoices')}>Pay</span></div>
    <div className="al"><div className="al-i gr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div className="al-c"><div className="al-t">Financing approved</div><div className="al-d">FIN-0022 — RBC 4.99%</div></div><span className="al-a" onClick={() => showPage('svc-financing')}>View</span></div>
  </div>
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 28}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Total Claims</div><div className="sc-v">47</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Claims</div><div className="sc-v" style={{color: '#2563eb'}}>3</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Approval Rate</div><div className="sc-v" style={{color: '#22c55e'}}>96%</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Units</div><div className="sc-v">12</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Customers</div><div className="sc-v">8</div></div>
  </div>
  <div className="qg">
    <div className="qb" onClick={() => showPage('upload')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg><span className="qb-t">Upload Photos</span></div>
    <div className="qb" onClick={() => showPage('add-unit')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg><span className="qb-t">Add Unit</span></div>
    <div className="qb" onClick={() => showPage('svc-financing-new')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg><span className="qb-t">Request Financing</span></div>
    <div className="qb" onClick={() => showPage('svc-parts-new')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg><span className="qb-t">Order Parts</span></div>
  </div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div className="pn"><div className="pn-h"><span className="pn-t">Recent Claims</span><span className="pn-a" onClick={() => showPage('claims')}>View all</span></div><div className="tw"><table><thead><tr><th>Claim #</th><th>Unit</th><th>Type</th><th>Status</th><th>Updated</th></tr></thead><tbody>
      {dlrClaims.length === 0 ? (
        <tr><td colSpan={5} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : 'No claims yet'}</td></tr>
      ) : dlrClaims.slice(0,3).map((c: any) => (
        <tr key={c.id}><td><span className="cid" onClick={() => { setSelectedClaimId(c.id); showPage('claim-detail'); }}>{c.claimNumber}</span></td><td>{c.manufacturer} — {c.type}</td><td>{c.type}</td><td><span className={`bg ${c.status?.replace(/_/g,'-')}`}>{c.status}</span></td><td>{new Date(c.updatedAt).toLocaleDateString()}</td></tr>
      ))}
    </tbody></table></div></div>
    <div className="pn"><div className="pn-h"><span className="pn-t">Notifications</span><span className="pn-a" onClick={() => showPage('notifications')}>View all</span></div><div className="act">
      <div className="act-i"><span className="act-dot new"></span><div><div className="act-t"><strong>CLM-0248</strong> is being processed</div><div className="act-tm">2 hours ago</div></div></div>
      <div className="act-i"><span className="act-dot pay"></span><div><div className="act-t">Payment <strong>$3,920</strong> received for CLM-0243</div><div className="act-tm">3 days ago</div></div></div>
      <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t">Financing <strong>approved</strong> — RBC 4.99%</div><div className="act-tm">Yesterday</div></div></div>
    </div></div>
  </div>
</div>

<div className={`page ${activePage === 'upload' ? 'active' : ''}`} id="page-upload">
  <div style={{fontSize: 13, color: '#666', marginBottom: 20}}>Select a unit, choose the claim type, upload your photos, and push to the operator for processing.</div>
  <div className="pn">
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, padding: 20, borderBottom: '1px solid #f0f0f0'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><label style={{fontSize: 12, fontWeight: 500, color: '#555'}}>Select Unit</label><select style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}><option>Select unit by VIN...</option><option>1UJBJ0BN8M1TJ4K1 — 2024 Jayco Jay Flight</option><option>1UJCJ0BT4N1KQ8R2 — 2024 Jayco Eagle HT</option><option>4X4FCKB21NE021N4 — 2024 Forest River Rockwood</option></select></div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><label style={{fontSize: 12, fontWeight: 500, color: '#555'}}>Claim Type</label><select style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}><option>Select type...</option><option>DAF (Dealer Arrival Form)</option><option>PDI (Pre-Delivery Inspection)</option><option>Warranty</option><option>Extended Warranty</option><option>Insurance</option></select></div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 6}}><label style={{fontSize: 12, fontWeight: 500, color: '#555'}}>Manufacturer</label><input value="Jayco" readOnly style={{padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, background: '#f3f4f6', color: '#888'}} /></div>
    </div>
    
    <div style={{padding: '24px 20px'}}>
      <div className="upload-zone">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
        <div style={{fontSize: 15, fontWeight: 600, color: '#333', marginBottom: 4}}>Drag photos here or click to browse</div>
        <div style={{fontSize: 13, color: '#888'}}>Upload all photos for this unit. JPG, PNG, HEIC accepted. Max 50 photos per batch.</div>
      </div>
      
      <div style={{marginTop: 20}}><div style={{fontSize: 13, fontWeight: 600, color: '#111', marginBottom: 12}}>Uploaded Photos (24)</div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 8}}>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888'}}>IMG_01</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888'}}>IMG_02</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888'}}>IMG_03</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888'}}>IMG_04</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888'}}>IMG_05</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888'}}>...</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888'}}>IMG_23</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#888'}}>IMG_24</div>
        </div>
      </div>
    </div>
    
    <div style={{padding: '0 20px 20px'}}><div style={{fontSize: 12, fontWeight: 500, color: '#555', marginBottom: 6}}>Describe what you see (optional but helpful)</div>
      <textarea placeholder="e.g. Sidewall damage on passenger side, roof leak near front vent, slide-out seal torn..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 70, resize: 'vertical', outline: 'none', background: '#fafafa'}}></textarea>
    </div>
    <div className="btn-bar" style={{borderTop: '2px solid #f0f0f0', background: '#fafbfe'}}><button className="btn btn-s" style={{fontSize: 14, padding: '12px 32px'}} onClick={() => showPage('claims')}>Push to Claim →</button><button className="btn btn-o" onClick={() => handleToast('Draft saved')}>Save as Draft</button><div style={{marginLeft: 'auto', fontSize: 12, color: '#888'}}>24 photos · Jayco Warranty · VIN ...4K1</div></div>
  </div>
</div>


<div className={`page ${activePage === 'claims' ? 'active' : ''}`} id="page-claims">
  <div className="pn"><div className="filter-bar"><input type="text" placeholder="Search claims..." /><select><option>All Statuses</option><option>Processing</option><option>Authorized</option><option>Parts Ordered</option><option>Completed</option><option>Paid</option><option>Denied</option></select><select><option>All Types</option><option>DAF</option><option>PDI</option><option>Warranty</option><option>Extended</option></select></div>
    <div className="tw"><table><thead><tr><th>Claim #</th><th>Unit</th><th>Mfr</th><th>Type</th><th>Status</th><th>Est. Value</th><th>Submitted</th><th>Action</th></tr></thead><tbody>
      {dlrClaims.length === 0 ? (
        <tr><td colSpan={8} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : 'No claims found'}</td></tr>
      ) : dlrClaims.map((c: any) => (
        <tr key={c.id}><td><span className="cid" onClick={() => { setSelectedClaimId(c.id); showPage('claim-detail'); }}>{c.claimNumber}</span></td><td>{c.manufacturer}</td><td><span className="mfr">{c.manufacturer}</span></td><td>{c.type}</td><td><span className={`bg ${c.status?.replace(/_/g,'-')}`}>{c.status}</span></td><td>{c.estimatedAmount ? `$${parseFloat(c.estimatedAmount).toLocaleString()}` : '—'}</td><td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : '—'}</td><td><button className="btn btn-o btn-sm" onClick={() => { setSelectedClaimId(c.id); showPage('claim-detail'); }}>View</button></td></tr>
      ))}
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'claim-detail' ? 'active' : ''}`} id="page-claim-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('claims')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">CLM-2026-0248</div><div className="detail-meta">2024 Jayco Jay Flight 264BH · Warranty</div></div><span className="bg submitted" style={{fontSize: 13, padding: '6px 16px'}}>Processing</span></div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      
      <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Claim Progress</span></div>
        <div style={{padding: 20, display: 'flex', gap: 0}}>
          <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>✓</div><div style={{fontSize: 11, fontWeight: 500, color: 'var(--brand)'}}>Submitted</div><div style={{fontSize: 10, color: '#888'}}>Mar 16</div></div>
          <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: 'var(--brand)', color: 'white', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>2</div><div style={{fontSize: 11, fontWeight: 500, color: 'var(--brand)'}}>Processing</div><div style={{fontSize: 10, color: '#888'}}>In progress</div></div>
          <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', color: '#aaa', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>3</div><div style={{fontSize: 11, color: '#aaa'}}>Authorized</div></div>
          <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', color: '#aaa', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>4</div><div style={{fontSize: 11, color: '#aaa'}}>Parts</div></div>
          <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', color: '#aaa', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>5</div><div style={{fontSize: 11, color: '#aaa'}}>Completed</div></div>
          <div style={{flex: 1, textAlign: 'center'}}><div style={{width: 32, height: 32, borderRadius: '50%', background: '#e5e7eb', color: '#aaa', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontSize: 12, fontWeight: 600, marginBottom: 6}}>6</div><div style={{fontSize: 11, color: '#aaa'}}>Paid</div></div>
        </div>
      </div>
      
      <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Issues Found (4 items)</span></div>
        <div style={{padding: '12px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontSize: 13, fontWeight: 500}}>Delamination, Sidewall</span><span className="bg submitted">Pending</span></div>
        <div style={{padding: '12px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontSize: 13, fontWeight: 500}}>Water Leak, Roof Vent</span><span className="bg submitted">Pending</span></div>
        <div style={{padding: '12px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontSize: 13, fontWeight: 500}}>Slide-Out Seal</span><span className="bg submitted">Pending</span></div>
        <div style={{padding: '12px 20px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}><span style={{fontSize: 13, fontWeight: 500}}>Cabinet Hinge</span><span className="bg submitted">Pending</span></div>
      </div>
      
      <div className="pn"><div className="pn-h"><span className="pn-t">Messages</span></div>
        <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">MS</div><div className="comm-content"><div className="comm-name">You</div><div className="comm-text">Photos uploaded. Customer is anxious about the roof leak — please prioritize.</div><div className="comm-time">Mar 16, 8:15 AM</div></div></div><div className="comm-msg"><div className="comm-avatar op">RC</div><div className="comm-content"><div className="comm-name">Dealer Suite 360 Team</div><div className="comm-text">Got it. Strong documentation. Recommending all 4 items. Will submit to Jayco today.</div><div className="comm-time">Mar 16, 10:30 AM</div></div></div></div>
        <div style={{padding: '16px 20px'}}><textarea placeholder="Send a message..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{textAlign: 'right', marginTop: 8}}><button className="btn btn-p btn-sm">Send</button></div></div>
      </div>
    </div>
    <div>
      <div className="cd-section"><div className="cd-section-h">Claim Info</div><div className="cd-row"><span className="cd-label">Claim #</span><span className="cd-value">CLM-0248</span></div><div className="cd-row"><span className="cd-label">Type</span><span className="cd-value">Warranty</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg submitted">Processing</span></span></div><div className="cd-row"><span className="cd-label">Submitted</span><span className="cd-value">Mar 16, 2026</span></div><div className="cd-row"><span className="cd-label">Items</span><span className="cd-value">4</span></div><div className="cd-row"><span className="cd-label">Photos</span><span className="cd-value">24</span></div></div>
      <div className="cd-section"><div className="cd-section-h">Unit</div><div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily: 'monospace', fontSize: 12}}>1UJBJ0BN8M1TJ4K1</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">2024 Jayco Jay Flight 264BH</span></div><div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Robert Martin</span></div></div>
      <div className="cd-section"><div className="cd-section-h">Estimated Value</div><div style={{padding: '16px 20px', fontSize: 24, fontWeight: 700, color: 'var(--brand)', textAlign: 'center'}}>$1,240.00</div><div style={{padding: '0 20px 16px', fontSize: 12, color: '#888', textAlign: 'center'}}>Final amount determined after manufacturer authorization</div></div>
    </div>
  </div>
</div>

<div className={`page ${activePage === 'units' ? 'active' : ''}`} id="page-units">
  <div className="pn"><div className="filter-bar"><input type="text" placeholder="Search VIN, stock #..." /><select><option>All Statuses</option><option>On Lot</option><option>Delivered</option><option>In Service</option></select><div style={{marginLeft: 'auto'}}><button className="btn btn-p btn-sm" onClick={() => showPage('add-unit')}>+ Add Unit</button></div></div>
    <div className="tw"><table><thead><tr><th>VIN</th><th>Stock #</th><th>Year / Model</th><th>Customer</th><th>Claims</th><th>DAF</th><th>PDI</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {dlrUnits.length === 0 ? (
        <tr><td colSpan={9} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : 'No units found'}</td></tr>
      ) : dlrUnits.map((u: any) => (
        <tr key={u.id}><td><span className="cid" onClick={() => { setSelectedUnitId(u.id); showPage('unit-detail'); }}>{u.vin}</span></td><td>{u.stockNumber || '—'}</td><td>{u.year} {u.manufacturer} {u.model}</td><td>{u.customerName || '—'}</td><td>—</td><td><span className={`bg ${u.dafCompleted ? 'authorized' : 'pending'}`}>{u.dafCompleted ? 'Done' : 'Pending'}</span></td><td><span className={`bg ${u.pdiCompleted ? 'authorized' : 'pending'}`}>{u.pdiCompleted ? 'Done' : 'Pending'}</span></td><td><span className="bg active">{u.status}</span></td><td><button className="btn btn-o btn-sm" onClick={() => { setSelectedUnitId(u.id); showPage('unit-detail'); }}>View</button></td></tr>
      ))}
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'add-unit' ? 'active' : ''}`} id="page-add-unit">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('units')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Add New Unit</div><div className="detail-meta">Register a unit on the platform</div></div></div>
  <div className="pn"><div className="form-grid c3">
    <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Vehicle Information</label></div>
    <div className="form-group"><label>VIN</label><input placeholder="17-character VIN" value={addUnitForm.vin} onChange={e => setAddUnitForm(f => ({...f, vin: e.target.value}))} /></div><div className="form-group"><label>Year</label><input placeholder="2024" value={addUnitForm.year} onChange={e => setAddUnitForm(f => ({...f, year: e.target.value}))} /></div><div className="form-group"><label>Manufacturer</label><select value={addUnitForm.manufacturer} onChange={e => setAddUnitForm(f => ({...f, manufacturer: e.target.value}))}><option value="">Select...</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select></div>
    <div className="form-group"><label>Model</label><input placeholder="Jay Flight 264BH" value={addUnitForm.model} onChange={e => setAddUnitForm(f => ({...f, model: e.target.value}))} /></div><div className="form-group"><label>RV Type</label><select><option>Select...</option><option>Travel Trailer</option><option>Fifth Wheel</option><option>Class A</option><option>Class C</option><option>Toy Hauler</option><option>Pop Up</option></select></div><div className="form-group"><label>Stock #</label><input placeholder="STK-0000" value={addUnitForm.stockNumber} onChange={e => setAddUnitForm(f => ({...f, stockNumber: e.target.value}))} /></div>
    <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Customer</label></div>
    <div className="form-group"><label>Name</label><input placeholder="Full name" /></div><div className="form-group"><label>Email</label><input placeholder="email@example.com" /></div><div className="form-group"><label>Phone</label><input placeholder="(555) 000-0000" /></div>
    <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Warranty</label></div>
    <div className="form-group"><label>Delivery Date</label><input type="date" /></div><div className="form-group"><label>Warranty Expiry</label><input type="date" /></div><div className="form-group"><label>Ext. Warranty</label><input placeholder="Provider name" /></div>
  </div><div className="btn-bar"><button className="btn btn-p" onClick={() => handleAddUnit()} disabled={addUnitSaving}>{addUnitSaving ? 'Saving...' : 'Add Unit'}</button><button className="btn btn-o" onClick={() => showPage('units')}>Cancel</button></div></div>
</div>


<div className={`page ${activePage === 'unit-detail' ? 'active' : ''}`} id="page-unit-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('units')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">2024 Jayco Jay Flight 264BH</div><div className="detail-meta">VIN: 1UJBJ0BN8M1TJ4K1 · STK-0891</div></div><span className="bg active" style={{fontSize: 13, padding: '6px 16px'}}>Delivered</span></div>
  <div className="tabs" id="unit-tabs"><div className="tab active" onClick={() => setUnitTab('u-info')}>Info</div><div className="tab" onClick={() => setUnitTab('u-docs')}>Documents</div><div className="tab" onClick={() => setUnitTab('u-pics')}>Pictures</div><div className="tab" onClick={() => setUnitTab('u-claims')}>Claims (3)</div></div>
  <div className={`pn utab ${unitTab === "utab-u-info" ? "active" : ""}`} id="utab-u-info" style={{display: unitTab === "utab-u-info" ? "block" : "none"}}>
    
    <div style={{padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 16, alignItems: 'center'}}>
      <div id="unit-photo-display" style={{width: 140, height: 90, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer'}} onClick={() => document.getElementById('unit-photo-input')?.click()}>
        <div id="unit-photo-placeholder" style={{textAlign: 'center'}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><div style={{fontSize: 10, color: '#aaa', marginTop: 4}}>Unit Photo</div></div>
        <img id="unit-photo-img" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'none'}} />
      </div>
      <input type="file" id="unit-photo-input" accept="image/*" style={{display: 'none'}} onChange={updateUnitPhoto} />
      <div style={{flex: 1}}>
        <div style={{fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4}}>Unit Display Photo</div>
        <div style={{fontSize: 12, color: '#888', lineHeight: '1.4', marginBottom: 8}}>This photo is visible to the customer on their portal dashboard. Use a clean exterior shot of the unit.</div>
        <button className="btn btn-o btn-sm" onClick={() => document.getElementById('unit-photo-input')?.click()}>Upload Photo</button>
      </div>
    </div>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0}}>
    <div style={{borderRight: '1px solid #f0f0f0'}}><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Vehicle</div><div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily: 'monospace', fontSize: 12}}>1UJBJ0BN8M1TJ4K1</span></div><div className="cd-row"><span className="cd-label">Stock #</span><span className="cd-value">STK-0891</span></div><div className="cd-row"><span className="cd-label">Year / Make / Model</span><span className="cd-value">2024 Jayco Jay Flight 264BH</span></div><div className="cd-row"><span className="cd-label">Type</span><span className="cd-value">Travel Trailer</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg active">Delivered</span></span></div>
      <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Warranty</div><div className="cd-row"><span className="cd-label">DAF</span><span className="cd-value"><span className="bg authorized">Done</span> Jan 22</span></div><div className="cd-row"><span className="cd-label">PDI</span><span className="cd-value"><span className="bg authorized">Done</span> Feb 5</span></div><div className="cd-row"><span className="cd-label">Delivery</span><span className="cd-value">Feb 10, 2026</span></div><div className="cd-row"><span className="cd-label">Warranty</span><span className="cd-value">Feb 10, 2026 — Feb 10, 2028</span></div><div className="cd-row"><span className="cd-label">Ext. Warranty</span><span className="cd-value">Guardsman RV — 2031</span></div></div>
    <div><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Customer</div><div className="cd-row"><span className="cd-label">Name</span><span className="cd-value">Robert Martin</span></div><div className="cd-row"><span className="cd-label">Email</span><span className="cd-value" style={{color: 'var(--brand)'}}>robert.martin@gmail.com</span></div><div className="cd-row"><span className="cd-label">Phone</span><span className="cd-value">(905) 555-0147</span></div><div className="cd-row"><span className="cd-label">City</span><span className="cd-value">Hamilton, ON</span></div>
      <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Quick Actions</div>
      <div style={{padding: '16px 20px', display: 'flex', flexDirection: 'column', gap: 8}}><button className="btn btn-p btn-sm" onClick={() => showPage('upload')}>Upload Photos for this Unit</button><button className="btn btn-o btn-sm" onClick={() => showPage('customers')}>Invite Customer to Portal</button></div></div>
  </div></div>

  <div className={`pn utab ${unitTab === "utab-u-docs" ? "active" : ""}`} id="utab-u-docs" style={{display: unitTab === "utab-u-docs" ? "block" : "none"}}>
    <div className="pn-h"><span className="pn-t">Documents</span><span className="pn-a" onClick={() => handleToast('Upload coming soon')}>+ Upload Document</span></div>
    <div className="tw"><table><thead><tr><th>Document</th><th>Type</th><th>Uploaded</th><th>Size</th><th>Action</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 500}}>Warranty Certificate</td><td>Warranty</td><td>Feb 10, 2026</td><td>245 KB</td><td><button className="btn btn-o btn-sm" onClick={() => handleToast('Document viewer coming soon')}>View</button></td></tr>
      <tr><td style={{fontWeight: 500}}>DAF Inspection Report</td><td>Inspection</td><td>Jan 22, 2026</td><td>1.2 MB</td><td><button className="btn btn-o btn-sm" onClick={() => handleToast('Document viewer coming soon')}>View</button></td></tr>
      <tr><td style={{fontWeight: 500}}>PDI Report</td><td>Inspection</td><td>Feb 5, 2026</td><td>890 KB</td><td><button className="btn btn-o btn-sm" onClick={() => handleToast('Document viewer coming soon')}>View</button></td></tr>
      <tr><td style={{fontWeight: 500}}>Purchase Agreement</td><td>Contract</td><td>Feb 8, 2026</td><td>340 KB</td><td><button className="btn btn-o btn-sm" onClick={() => handleToast('Document viewer coming soon')}>View</button></td></tr>
      <tr><td style={{fontWeight: 500}}>Ext. Warranty — Guardsman RV</td><td>Warranty</td><td>Feb 10, 2026</td><td>510 KB</td><td><button className="btn btn-o btn-sm" onClick={() => handleToast('Document viewer coming soon')}>View</button></td></tr>
    </tbody></table></div>
  </div>

  <div className={`pn utab ${unitTab === "utab-u-pics" ? "active" : ""}`} id="utab-u-pics" style={{display: unitTab === "utab-u-pics" ? "block" : "none"}}>
    <div style={{padding: '16px 20px', borderBottom: '1px solid #f0f0f0'}}><div style={{fontSize: 13, fontWeight: 600, marginBottom: 8}}>DAF Photos (18) <span className="bg authorized">Jan 22</span></div><div style={{display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 6}}><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>01</div><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>02</div><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>+16</div></div></div>
    <div style={{padding: '16px 20px', borderBottom: '1px solid #f0f0f0'}}><div style={{fontSize: 13, fontWeight: 600, marginBottom: 8}}>PDI Photos (8) <span className="bg authorized">Feb 5</span></div><div style={{display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 6}}><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>01</div><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>+7</div></div></div>
    <div style={{padding: '16px 20px'}}><div style={{fontSize: 13, fontWeight: 600, marginBottom: 8}}>Warranty Photos (24) <span className="bg submitted">Mar 16</span></div><div style={{display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 6}}><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>01</div><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>02</div><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>+22</div></div></div>
    <div className="btn-bar"><button className="btn btn-o btn-sm" onClick={() => showPage('upload')}>+ Upload General Photos</button></div>
  </div>

  <div className={`pn utab ${unitTab === "utab-u-claims" ? "active" : ""}`} id="utab-u-claims" style={{display: unitTab === "utab-u-claims" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>Claim #</th><th>Type</th><th>Status</th><th>Value</th><th>Submitted</th></tr></thead><tbody><tr><td><span className="cid" onClick={() => showPage('claim-detail')}>CLM-0248</span></td><td>Warranty</td><td><span className="bg submitted">Processing</span></td><td>$1,240</td><td>Mar 16</td></tr><tr><td><span className="cid" onClick={() => showPage('claim-detail')}>CLM-0237</span></td><td>DAF</td><td><span className="bg pay-recv">Paid</span></td><td>$4,200</td><td>Feb 12</td></tr><tr><td><span className="cid" onClick={() => showPage('claim-detail')}>CLM-0225</span></td><td>PDI</td><td><span className="bg pay-recv">Paid</span></td><td>$920</td><td>Jan 25</td></tr></tbody></table></div></div>
</div>

<div className={`page ${activePage === 'svc-financing' ? 'active' : ''}`} id="page-svc-financing">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Submit financing requests. We shop to lenders and find the best rate for your customer.</div><button className="btn btn-p btn-sm" onClick={() => showPage('svc-financing-new')}>+ Request Financing</button></div>
  <div className="pn"><div className="tw"><table><thead><tr><th>Request #</th><th>Customer</th><th>Unit</th><th>Amount</th><th>Best Rate</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead><tbody>
    <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('svc-financing-det')}>FIN-0023</span></td><td>Daniel Tremblay</td><td>2024 Jayco Eagle HT</td><td>$42,500</td><td>—</td><td><span className="bg in-progress">Shopping Lenders</span></td><td>2h ago</td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-financing-det')}>View</button></td></tr>
    <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>FIN-0022</td><td>Julie Fournier</td><td>2024 Forest River Wildwood</td><td>$38,900</td><td style={{color: '#22c55e', fontWeight: 600}}>4.99%</td><td><span className="bg authorized">Approved</span></td><td>Yesterday</td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-financing-det')}>View</button></td></tr>
  </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'svc-financing-det' ? 'active' : ''}`} id="page-svc-financing-det">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-financing')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">FIN-0023 — Daniel Tremblay</div><div className="detail-meta">2024 Jayco Eagle HT · $42,500 requested</div></div><span className="bg in-progress" style={{fontSize: 13, padding: '6px 16px'}}>Shopping Lenders</span></div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Lender Status</span></div>
        <div className="tw"><table><thead><tr><th>Lender</th><th>Rate</th><th>Term</th><th>Monthly</th><th>Status</th></tr></thead><tbody>
          <tr><td style={{fontWeight: 500}}>RBC</td><td style={{color: '#22c55e', fontWeight: 600}}>5.49%</td><td>180 mo</td><td>$347</td><td><span className="bg authorized">Approved</span></td></tr>
          <tr><td style={{fontWeight: 500}}>Desjardins</td><td>—</td><td>—</td><td>—</td><td><span className="bg pending">Pending</span></td></tr>
          <tr><td style={{fontWeight: 500}}>TD Auto</td><td>6.29%</td><td>180 mo</td><td>$368</td><td><span className="bg authorized">Approved</span></td></tr>
        </tbody></table></div></div>
      <div className="pn"><div className="pn-h"><span className="pn-t">Messages</span></div>
        <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">MS</div><div className="comm-content"><div className="comm-name">You</div><div className="comm-text">Customer wants lowest rate, flexible on term. Good credit.</div><div className="comm-time">Mar 16, 8:30 AM</div></div></div><div className="comm-msg"><div className="comm-avatar op">RC</div><div className="comm-content"><div className="comm-name">Dealer Suite 360 Team</div><div className="comm-text">RBC came back at 5.49% — strong offer. Waiting on Desjardins. Will update by EOD.</div><div className="comm-time">Mar 16, 11:15 AM</div></div></div></div>
        <div style={{padding: '16px 20px'}}><textarea placeholder="Send a message..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{textAlign: 'right', marginTop: 8}}><button className="btn btn-p btn-sm">Send</button></div></div></div>
    </div>
    <div><div className="cd-section"><div className="cd-section-h">Request Details</div><div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Daniel Tremblay</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">2024 Jayco Eagle HT</span></div><div className="cd-row"><span className="cd-label">Amount</span><span className="cd-value">$42,500</span></div><div className="cd-row"><span className="cd-label">Down Payment</span><span className="cd-value">$5,000</span></div><div className="cd-row"><span className="cd-label">Submitted</span><span className="cd-value">Mar 16</span></div></div>
      <div className="cd-section" style={{background: '#f0fdf4', borderColor: '#bbf7d0'}}><div className="cd-section-h" style={{color: '#16a34a', borderColor: '#bbf7d0'}}>Best Offer</div><div style={{padding: '16px 20px', textAlign: 'center'}}><div style={{fontSize: 28, fontWeight: 700, color: '#16a34a'}}>5.49%</div><div style={{fontSize: 13, color: '#555'}}>RBC · $347/mo × 180</div></div></div></div>
  </div>
</div>


<div className={`page ${activePage === 'svc-financing-new' ? 'active' : ''}`} id="page-svc-financing-new">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-financing')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Request Financing</div><div className="detail-meta">We'll shop your customer to multiple lenders</div></div></div>
  <div className="pn"><div className="form-grid"><div className="form-group"><label>Customer Name</label><input placeholder="Full name" /></div><div className="form-group"><label>Credit Score (if known)</label><input placeholder="e.g. 742" /></div><div className="form-group"><label>Unit</label><select><option>Select unit...</option><option>1UJCJ0BT4N1KQ8R2 — 2024 Jayco Eagle HT</option><option>4X4FCKB21NE021N4 — 2024 Forest River Rockwood</option></select></div><div className="form-group"><label>Amount Requested</label><input placeholder="$0.00" /></div><div className="form-group"><label>Down Payment</label><input placeholder="$0.00" /></div><div className="form-group"><label>Preferred Term</label><select><option>10 years</option><option defaultSelected>15 years</option><option>20 years</option></select></div><div className="form-group full"><label>Notes</label><textarea placeholder="Customer preferences, timeline, etc."></textarea></div></div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('svc-financing')}>Submit Request</button><button className="btn btn-o" onClick={() => showPage('svc-financing')}>Cancel</button></div></div>
</div>


<div className={`page ${activePage === 'svc-fi' ? 'active' : ''}`} id="page-svc-fi">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>We recommend F&I products for your deals. Track what's offered and sold.</div><button className="btn btn-p btn-sm" onClick={() => showPage('svc-fi-new')}>+ Flag a Deal for F&I</button></div>
  <div className="pn"><div className="tw"><table><thead><tr><th>Deal #</th><th>Customer</th><th>Unit</th><th>Products Offered</th><th>Sold</th><th>Revenue</th><th>Status</th><th>Action</th></tr></thead><tbody>
    <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>FI-0014</td><td>Julie Fournier</td><td>2024 FR Wildwood</td><td>4</td><td>—</td><td>—</td><td><span className="bg in-progress">Recommending</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-fi-detail')}>View</button></td></tr>
    <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>FI-0013</td><td>Robert Martin</td><td>2024 Jayco Jay Flight</td><td>3</td><td>2</td><td>$2,800</td><td><span className="bg completed">Completed</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-fi-detail')}>View</button></td></tr>
  </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'svc-fi-new' ? 'active' : ''}`} id="page-svc-fi-new">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-fi')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Flag Deal for F&I</div><div className="detail-meta">We'll recommend the right products for your customer</div></div></div>
  <div className="pn"><div className="form-grid"><div className="form-group"><label>Customer</label><input placeholder="Customer name" /></div><div className="form-group"><label>Unit</label><select><option>Select...</option><option>2024 Jayco Eagle HT</option><option>2024 Forest River Rockwood</option></select></div><div className="form-group"><label>Sale Price</label><input placeholder="$0.00" /></div><div className="form-group"><label>Financing</label><input placeholder="e.g. RBC 4.99%" /></div><div className="form-group full"><label>Customer Notes</label><textarea placeholder="What is the customer open to? Budget?"></textarea></div></div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('svc-fi')}>Submit</button><button className="btn btn-o" onClick={() => showPage('svc-fi')}>Cancel</button></div></div>
</div>


<div className={`page ${activePage === 'svc-warranty' ? 'active' : ''}`} id="page-svc-warranty">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Warranty and extended service plans for your units. Plans can be purchased directly through the platform.</div></div>
  <div className="pn"><div className="filter-bar"><input type="text" placeholder="Search by customer or VIN..." /><select><option>All Statuses</option><option>Active</option><option>Expiring</option><option>Expired</option></select></div>
    <div className="tw"><table><thead><tr><th>Plan</th><th>Customer</th><th>VIN</th><th>Provider</th><th>Coverage</th><th>Expiry</th><th>Claims</th><th>Status</th><th>Action</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 500}}>WP-0041</td><td>Robert Martin</td><td><span className="vin">...4K1</span></td><td>Guardsman RV</td><td>Comprehensive</td><td>Feb 10, 2031</td><td>1</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-warranty-detail')}>View</button></td></tr>
      <tr><td style={{fontWeight: 500}}>WP-0038</td><td>Marie Bouchard</td><td><span className="vin">...1N4</span></td><td>XtraRide</td><td>Powertrain+</td><td>Jan 15, 2029</td><td>0</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-warranty-detail')}>View</button></td></tr>
      <tr><td style={{fontWeight: 500}}>WP-0035</td><td>Daniel Tremblay</td><td><span className="vin">...8R2</span></td><td>Jayco OEM</td><td>OEM 2-Year</td><td style={{color: '#dc2626'}}>Apr 15, 2026</td><td>1</td><td><span className="bg pending">Expiring</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-warranty-detail')}>View</button></td></tr>
      <tr><td style={{fontWeight: 500}}>WP-0033</td><td>Lisa Wong</td><td><span className="vin">...2K8</span></td><td>Wholesale Warranties</td><td>Gold</td><td>Dec 1, 2030</td><td>2</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-warranty-detail')}>View</button></td></tr>
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'svc-parts' ? 'active' : ''}`} id="page-svc-parts">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Request parts for claims or customer orders. We source, price, and track delivery.</div><button className="btn btn-p btn-sm" onClick={() => showPage('svc-parts-new')}>+ Order Parts</button></div>
  <div className="pn"><div className="tw"><table><thead><tr><th>Order #</th><th>Items</th><th>Claim</th><th>Est. Cost</th><th>Status</th><th>ETA</th><th>Updated</th><th>Action</th></tr></thead><tbody>
    <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PO-0038</td><td>Sidewall panel, adhesive, sealant</td><td>CLM-0248</td><td>—</td><td><span className="bg new-req">Sourcing</span></td><td>—</td><td>2h ago</td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-parts-det')}>View</button></td></tr>
    <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PO-0034</td><td>Slide seal, slide motor</td><td>CLM-0246</td><td>$420</td><td><span className="bg shipped">Shipped</span></td><td>Mar 18</td><td>Mar 14</td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-parts-det')}>Track</button></td></tr>
    <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PO-0031</td><td>Hinge set, screws</td><td>CLM-0243</td><td>$45</td><td><span className="bg delivered-st">Delivered</span></td><td>—</td><td>Mar 10</td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-parts-det')}>View</button></td></tr>
  </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'svc-parts-new' ? 'active' : ''}`} id="page-svc-parts-new">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-parts')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Order Parts</div><div className="detail-meta">We'll source the best price and track delivery</div></div></div>
  <div className="pn"><div className="form-grid"><div className="form-group"><label>Related Claim</label><select><option>None</option><option>CLM-0248 (Warranty)</option><option>CLM-0243 (DAF)</option></select></div><div className="form-group"><label>Priority</label><select><option>Normal</option><option>Urgent</option></select></div><div className="form-group full"><label>Parts Needed</label><textarea placeholder="List the parts, quantities, part numbers if known...">1x Sidewall panel (2x3 section)
1x Panel adhesive (1 gal)
2x Lap sealant</textarea></div><div className="form-group full"><label>Notes</label><textarea placeholder="Special instructions, preferred suppliers..."></textarea></div></div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('svc-parts')}>Submit Order</button><button className="btn btn-o" onClick={() => showPage('svc-parts')}>Cancel</button></div></div>
</div>

<div className={`page ${activePage === 'invoices' ? 'active' : ''}`} id="page-invoices">
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Current Plan</div><div className="sc-v" style={{fontSize: 18}}>Plan A</div><div style={{fontSize: 12, color: '#888'}}>$349/mo</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Outstanding</div><div className="sc-v" style={{color: '#dc2626'}}>$140.12</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Paid (YTD)</div><div className="sc-v" style={{color: '#22c55e'}}>$4,820</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Next Invoice</div><div className="sc-v" style={{fontSize: 18}}>Apr 1</div></div>
  </div>
  <div className="pn"><div className="pn-h"><span className="pn-t">My Invoices</span></div>
    <div className="filter-bar"><input type="text" placeholder="Search..." /><select><option>All Statuses</option><option>Pending</option><option>Paid</option><option>Overdue</option></select></div>
    <div className="tw"><table><thead><tr><th>Invoice</th><th>Type</th><th>Description</th><th>Amount</th><th>Tax</th><th>Total</th><th>Status</th><th>Issued</th><th>Action</th></tr></thead><tbody>
      {dlrInvoices.length === 0
        ? <tr><td colSpan={9} style={{textAlign:'center',color:'#888',padding:20}}>{dataError ? dataError : 'No invoices found'}</td></tr>
        : dlrInvoices.map((inv: any) => (
          <tr key={inv.id}>
            <td style={{fontWeight: 500}}>{inv.invoiceNumber || inv.id}</td>
            <td>{inv.type || inv.invoiceType || '—'}</td>
            <td>{inv.description || '—'}</td>
            <td>{inv.amount ? `$${Number(inv.amount).toFixed(2)}` : '—'}</td>
            <td>{inv.taxAmount ? `$${Number(inv.taxAmount).toFixed(2)}` : '—'}</td>
            <td style={{fontWeight: 600}}>{inv.total ? `$${Number(inv.total).toFixed(2)}` : '—'}</td>
            <td><span className={`bg ${inv.status === 'paid' ? 'pay-recv' : inv.status}`}>{inv.status}</span></td>
            <td>{inv.issuedAt || inv.createdAt ? new Date(inv.issuedAt || inv.createdAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
            <td>{inv.status === 'pending' || inv.status === 'overdue' ? <button className="btn btn-s btn-sm" onClick={() => handleToast('Payment portal coming soon')}>Pay Now</button> : <button className="btn btn-o btn-sm" onClick={() => handleToast('Invoice viewer coming soon')}>View</button>}</td>
          </tr>
        ))
      }
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'customers' ? 'active' : ''}`} id="page-customers">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div><div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Customer Portal</div><div style={{fontSize: 13, color: '#888'}}>Invite customers to their own portal. They can track claims, view warranty info, and submit issues.</div></div><button className="btn btn-p btn-sm" onClick={() => showPage('invite-customer')}>+ Invite Customer</button></div>
  <div className="pn"><div className="filter-bar"><input type="text" placeholder="Search customers..." /><select><option>All Statuses</option><option>Active</option><option>Invited</option><option>Inactive</option></select></div>
    <div className="tw"><table><thead><tr><th>Customer</th><th>Email</th><th>Unit</th><th>Claims</th><th>Portal Status</th><th>Last Login</th><th>Action</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 500}}>Robert Martin</td><td>robert.martin@gmail.com</td><td>2024 Jayco Jay Flight</td><td>3</td><td><span className="bg active">Active</span></td><td>Yesterday</td><td><button className="btn btn-o btn-sm" onClick={() => handleToast('Customer management coming soon')}>Manage</button></td></tr>
      <tr><td style={{fontWeight: 500}}>Daniel Tremblay</td><td>daniel.t@outlook.com</td><td>2024 Jayco Eagle HT</td><td>1</td><td><span className="bg active">Active</span></td><td>3 days ago</td><td><button className="btn btn-o btn-sm" onClick={() => handleToast('Customer management coming soon')}>Manage</button></td></tr>
      <tr><td style={{fontWeight: 500}}>Marie Bouchard</td><td>m.bouchard@gmail.com</td><td>2024 FR Rockwood</td><td>1</td><td><span className="bg active">Active</span></td><td>1 week ago</td><td><button className="btn btn-o btn-sm" onClick={() => handleToast('Customer management coming soon')}>Manage</button></td></tr>
      <tr><td style={{fontWeight: 500}}>Lisa Wong</td><td>lisa.w@hotmail.com</td><td>2024 Jayco Jay Feather</td><td>2</td><td><span className="bg pending">Invited</span></td><td>—</td><td><button className="btn btn-o btn-sm" onClick={() => handleToast('Invitation resent')}>Resend</button></td></tr>
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'invite-customer' ? 'active' : ''}`} id="page-invite-customer">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('customers')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Invite Customer</div><div className="detail-meta">Send a portal invitation to a customer</div></div></div>
  <div className="pn"><div className="form-grid">
    <div className="form-group"><label>Customer Name</label><input placeholder="Full name" /></div><div className="form-group"><label>Email</label><input placeholder="customer@email.com" /></div>
    <div className="form-group"><label>Phone</label><input placeholder="(555) 000-0000" /></div><div className="form-group"><label>Unit (VIN)</label><select><option>Select unit...</option><option>1UJBJ0BN8M1TJ4K1 — 2024 Jayco Jay Flight</option><option>1UJCJ0BT4N1KQ8R2 — 2024 Jayco Eagle HT</option><option>4X4FCKB21NE021N4 — 2024 Forest River Rockwood</option></select></div>
    <div className="form-group full"><label>Delivery Method</label><div style={{display: 'flex', gap: 12, marginTop: 4}}><label style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer'}}><input type="checkbox" defaultChecked /> Email</label><label style={{display: 'flex', alignItems: 'center', gap: 6, fontSize: 13, cursor: 'pointer'}}><input type="checkbox" /> SMS</label></div></div>
    <div className="form-group full"><label>Personal Message (optional)</label><textarea placeholder="Welcome to our customer portal! Here you can track your warranty, view service history..."></textarea></div>
  </div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('customers')}>Send Invitation</button><button className="btn btn-o" onClick={() => showPage('customers')}>Cancel</button></div></div>
</div>




<div className={`page ${activePage === 'cust-tickets' ? 'active' : ''}`} id="page-cust-tickets">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}>
    <div style={{fontSize: 13, color: '#666'}}>Support tickets from your customers. Auto-created from claims and service requests, or opened manually by customers.</div>
  </div>
  <div className="tabs"><div className="tab active" onClick={(e) => switchTab(e)}>Open (3)</div><div className="tab" onClick={(e) => switchTab(e)}>Waiting on Customer (1)</div><div className="tab" onClick={(e) => switchTab(e)}>Resolved (4)</div><div className="tab" onClick={(e) => switchTab(e)}>All</div></div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
    <div className="filter-bar"><input type="text" placeholder="Search tickets..." />
      <select><option>All Categories</option><option>Claim / Warranty</option><option>Billing</option><option>Parts Order</option><option>General</option><option>Warranty Expiry</option><option>Protection Plans</option><option>Feedback</option></select>
      <select><option>All Customers</option><option>Robert Martin</option><option>Daniel Tremblay</option><option>Marie Bouchard</option><option>Lisa Wong</option></select>
    </div>
    <div className="tw"><table><thead><tr><th>Ticket</th><th>Customer</th><th>Subject</th><th>Category</th><th>Related</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead><tbody>
      {dlrTickets.length === 0
        ? <tr><td colSpan={8} style={{textAlign:'center',color:'#888',padding:20}}>{dataError ? dataError : 'No tickets found'}</td></tr>
        : dlrTickets.map((t: any) => {
          const isOpen = t.status === 'open';
          const statusClass = isOpen ? 'submitted' : t.status === 'resolved' ? 'active' : t.status === 'closed' ? '' : 'pending';
          return (
            <tr key={t.id}>
              <td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => { setSelectedTicketId(t.id); showPage('cust-ticket-detail'); }}>{t.ticketNumber || t.id}</span></td>
              <td>{t.customerName || t.createdBy?.name || '—'}</td>
              <td style={{fontWeight: 500}}>{t.subject}</td>
              <td><span style={{fontSize: 11, color: '#888'}}>{t.category}</span></td>
              <td style={{fontSize: 12, color: '#888'}}>{t.relatedClaimNumber || '—'}</td>
              <td><span className={`bg ${statusClass}`}>{t.status}</span></td>
              <td>{t.updatedAt ? new Date(t.updatedAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
              <td>{isOpen ? <button className="btn btn-p btn-sm" onClick={() => { setSelectedTicketId(t.id); showPage('cust-ticket-detail'); }}>Reply</button> : <button className="btn btn-o btn-sm" onClick={() => { setSelectedTicketId(t.id); showPage('cust-ticket-detail'); }}>View</button>}</td>
            </tr>
          );
        })
      }
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'cust-ticket-detail' ? 'active' : ''}`} id="page-cust-ticket-detail">
  <div className="detail-header">
    <button className="detail-back" onClick={() => showPage('cust-tickets')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button>
    <div className="detail-info"><div className="detail-title">TKT-0042 — Warranty claim</div><div className="detail-meta">Robert Martin · Claim / Warranty · CLM-0248</div></div>
    <span className="bg submitted" style={{fontSize: 13, padding: '6px 16px'}}>Open</span>
    <select style={{padding: '6px 12px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit'}}><option>Open</option><option>Waiting on Customer</option><option>Resolved</option><option>Closed</option></select>
  </div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div className="pn">
      <div className="pn-h"><span className="pn-t">Conversation</span></div>
      <div className="comm-box" style={{margin: 0, border: 'none', borderRadius: 0}}>
        <div className="comm-msg" style={{background: '#f0fdf4'}}><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">You (auto) <span style={{fontWeight: 400, color: '#888', fontSize: 11}}>· System</span></div><div className="comm-text">A warranty claim has been created for Robert's 2024 Jayco Jay Flight. 4 issues identified, processing with manufacturer.</div><div className="comm-time">Mar 16, 10:30 AM</div></div></div>
        <div className="comm-msg"><div className="comm-avatar cu">RM</div><div className="comm-content"><div className="comm-name">Robert Martin</div><div className="comm-text">Thanks! The roof leak is my main concern — stain getting bigger.</div><div className="comm-time">Mar 16, 11:45 AM</div></div></div>
        <div className="comm-msg"><div className="comm-avatar dl">SR</div><div className="comm-content"><div className="comm-name">You</div><div className="comm-text">Understood. Roof vent flagged as priority. Jayco usually responds within 48h.</div><div className="comm-time">Mar 16, 12:10 PM</div></div></div>
        <div className="comm-msg"><div className="comm-avatar cu">RM</div><div className="comm-content"><div className="comm-name">Robert Martin</div><div className="comm-text">Should I put a tarp over the vent?</div><div className="comm-time">Mar 16, 12:30 PM</div></div></div>
      </div>
      <div style={{padding: '16px 20px', borderTop: '1px solid #f0f0f0'}}>
        <textarea placeholder="Reply to customer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 8}}>
          <div style={{display: 'flex', gap: 8}}><button className="btn btn-o btn-sm" style={{fontSize: 11}}>Attach</button><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 11, fontFamily: 'inherit'}}><option>Visible to customer</option><option>Internal note (hidden)</option></select></div>
          <button className="btn btn-p btn-sm">Send Reply</button>
        </div>
      </div>
    </div>
    <div>
      <div className="cd-section"><div className="cd-section-h">Ticket Info</div><div className="cd-row"><span className="cd-label">Ticket</span><span className="cd-value">TKT-0042</span></div><div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Robert Martin</span></div><div className="cd-row"><span className="cd-label">Category</span><span className="cd-value">Claim / Warranty</span></div><div className="cd-row"><span className="cd-label">Opened</span><span className="cd-value">Mar 16</span></div></div>
      <div className="cd-section"><div className="cd-section-h">Linked</div><div className="cd-row"><span className="cd-label">Claim</span><span className="cd-value cid" onClick={() => showPage('claim-detail')}>CLM-0248</span></div><div className="cd-row"><span className="cd-label">Parts</span><span className="cd-value">PO-0038</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value" style={{fontSize: 12}}>2024 Jayco Jay Flight</span></div></div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'staff' ? 'active' : ''}`} id="page-staff">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Manage your dealership staff access. Staff can upload photos and track claims but cannot manage billing or settings.</div><button className="btn btn-p btn-sm" onClick={() => showPage('add-staff')}>+ Add Staff</button></div>
  <div className="pn"><div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th><th>Action</th></tr></thead><tbody>
    {dlrStaff.length === 0
      ? <tr><td colSpan={6} style={{textAlign:'center',color:'#888',padding:20}}>{dataError ? dataError : 'No staff found'}</td></tr>
      : dlrStaff.map((s: any) => {
        const isOwner = s.role === 'dealer_owner';
        const isCurrentUser = s.id === user?.id;
        return (
          <tr key={s.id}>
            <td style={{fontWeight: 500}}>{s.name || `${s.firstName || ''} ${s.lastName || ''}`.trim() || '—'}</td>
            <td>{s.email}</td>
            <td><span className="bg" style={{background: isOwner ? '#eff6ff' : '#f0fdf4', color: isOwner ? 'var(--brand)' : '#16a34a'}}>{isOwner ? 'Owner' : 'Staff'}</span></td>
            <td><span className={`bg ${s.status === 'active' ? 'active' : 'pending'}`}>{s.status || 'active'}</span></td>
            <td>{s.lastLoginAt ? new Date(s.lastLoginAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
            <td>{isCurrentUser ? <span style={{fontSize: 12, color: '#888'}}>You</span> : <><button className="btn btn-o btn-sm" onClick={() => handleToast('Staff editing coming soon')}>Edit</button> <button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => handleToast('Staff management coming soon')}>Remove</button></>}</td>
          </tr>
        );
      })
    }
  </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'add-staff' ? 'active' : ''}`} id="page-add-staff">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('staff')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Add Staff Member</div><div className="detail-meta">Invite a team member to the portal</div></div></div>
  <div className="pn"><div className="form-grid"><div className="form-group"><label>Full Name</label><input placeholder="Full name" /></div><div className="form-group"><label>Email</label><input placeholder="staff@dealership.com" /></div><div className="form-group"><label>Role</label><select><option>Dealer Staff (operational access)</option><option>Dealer Owner (full access)</option></select></div><div className="form-group full"><label>Permissions Note</label><div style={{fontSize: 12, color: '#888', background: '#f5f6f8', padding: 12, borderRadius: 8, lineHeight: '1.5'}}>Staff can: upload photos, view claims, view units, submit service requests, communicate with operator. Staff cannot: manage billing, change settings, manage other staff, access customer portal settings.</div></div></div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('staff')}>Send Invitation</button><button className="btn btn-o" onClick={() => showPage('staff')}>Cancel</button></div></div>
</div>


<div className={`page ${activePage === 'branding' ? 'active' : ''}`} id="page-branding">
  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
    <div className="pn"><div className="pn-h"><span className="pn-t">Customer Portal Branding</span></div><div className="form-grid">
      <div className="form-group full"><label>Dealership Name (shown to customers)</label><input id="dealer-name-input" value="Smith's RV Centre" /></div>
      <div className="form-group full"><label>Logo</label><input type="file" id="logo-input" accept="image/*" style={{display: 'none'}} onChange={previewLogo} /><div className="upload-zone" style={{padding: 20}} id="logo-zone" onClick={() => document.getElementById('logo-input')?.click()}><div id="logo-preview" style={{display: 'none'}}><img id="logo-img" style={{maxHeight: 60, maxWidth: 200, marginBottom: 8}} /><div style={{fontSize: 12, color: 'var(--brand)', fontWeight: 500}}>Click to change</div></div><div id="logo-placeholder"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" style={{width: 32, height: 32, color: '#ccc', marginBottom: 8}}><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><div style={{fontSize: 13, color: '#888'}}>Click to upload logo (PNG, SVG)</div></div></div></div>
      <div className="form-group"><label>Primary Color</label><div style={{display: 'flex', gap: 8, alignItems: 'center'}}><input type="color" id="brand-color" value={brandColor} onInput={(e) => { setBrandColor((e.target as HTMLInputElement).value); }} style={{width: 40, height: 40, border: '1px solid #e0e0e0', borderRadius: 8, padding: 4, cursor: 'pointer'}} /><input id="brand-hex" value={brandColor} onInput={(e) => { setBrandColor((e.target as HTMLInputElement).value); }} style={{width: 100, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'monospace'}} /></div></div>
      <div className="form-group"><label>Accent Color</label><div style={{display: 'flex', gap: 8, alignItems: 'center'}}><input type="color" id="accent-color" value={accentColor} onInput={(e) => { setAccentColor((e.target as HTMLInputElement).value); }} style={{width: 40, height: 40, border: '1px solid #e0e0e0', borderRadius: 8, padding: 4, cursor: 'pointer'}} /><input id="accent-hex" value={accentColor} onInput={(e) => { setAccentColor((e.target as HTMLInputElement).value); }} style={{width: 100, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'monospace'}} /></div></div>
      <div className="form-group full"><label>Welcome Message</label><textarea>Welcome to your RV service portal. Track your warranty, claims, and services all in one place.</textarea></div>
    </div><div className="btn-bar"><button className="btn btn-p" onClick={() => applyBranding()}>Save Branding</button><button className="btn btn-o" onClick={() => previewBranding()}>Preview</button><button className="btn btn-o" onClick={() => restoreBranding()} style={{marginLeft: 'auto'}}>Restore Defaults</button><span id="brand-saved" style={{fontSize: 12, color: '#22c55e', fontWeight: 500, display: 'none', marginLeft: 8}}>✓ Branding saved and applied!</span></div></div>
    <div className="pn"><div className="pn-h"><span className="pn-t">Custom Domain</span></div>
      <div style={{padding: 20}}>
        <div style={{fontSize: 13, color: '#666', marginBottom: 16, lineHeight: '1.5'}}>Set up a custom domain so your customers see your dealership's URL instead of dealersuite360.com. Example: <strong>portal.smithsrv.ca</strong></div>
        <div className="form-grid" style={{padding: 0}}>
          <div className="form-group full"><label>Custom Domain</label><input value="portal.smithsrv.ca" placeholder="portal.yourdealership.com" /></div>
          <div className="form-group full"><label>Status</label><div style={{display: 'flex', alignItems: 'center', gap: 8}}><span className="bg pending">Pending DNS</span><span style={{fontSize: 12, color: '#888'}}>CNAME record not detected</span></div></div>
          <div className="form-group full"><label>DNS Instructions</label><div style={{background: '#f5f6f8', padding: 14, borderRadius: 8, fontSize: 12, color: '#555', lineHeight: '1.6', fontFamily: '\'SF Mono\',\'Fira Code\',monospace'}}>
            Add a CNAME record to your DNS:<br />
            <strong>Host:</strong> portal<br />
            <strong>Value:</strong> dealers.dealersuite360.com<br />
            <strong>TTL:</strong> 3600
          </div></div>
        </div>
      </div><div className="btn-bar"><button className="btn btn-p" onClick={() => handleToast('DNS check initiated')}>Verify Domain</button><button className="btn btn-o" onClick={() => handleToast('Domain settings saved')}>Save</button></div></div>
  </div>
</div>


<div className={`page ${activePage === 'notifications' ? 'active' : ''}`} id="page-notifications">
  <div className="pn"><div className="pn-h"><span className="pn-t">Notifications</span><span style={{fontSize: 12, color: '#888'}}>From your operator and platform updates</span></div>
    <div className="act">
      <div className="act-i" style={{background: '#eff6ff'}}><span className="act-dot new"></span><div><div className="act-t"><strong>CLM-0248 is being processed</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Your warranty claim photos have been received and are being reviewed. 4 issues identified.</div><div className="act-tm">2 hours ago · Claim Update</div></div></div>
      <div className="act-i" style={{background: '#eff6ff'}}><span className="act-dot pay"></span><div><div className="act-t"><strong>Financing approved — FIN-0022</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Julie Fournier's financing has been approved at 4.99% through RBC. 180 month term, $347/mo.</div><div className="act-tm">Yesterday · Financing</div></div></div>
      <div className="act-i" style={{background: '#eff6ff'}}><span className="act-dot ok"></span><div><div className="act-t"><strong>Invoice INV-0089 generated</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Claim processing fee for CLM-0248. Amount: $140.12 including HST.</div><div className="act-tm">Mar 16 · Billing</div></div></div>
      <div className="act-i"><span className="act-dot new"></span><div><div className="act-t"><strong>New Feature: Photo Batch Upload</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>You can now upload all photos at once for DAF, PDI, and Warranty claims.</div><div className="act-tm">Mar 15 · Platform Update</div></div></div>
      <div className="act-i"><span className="act-dot pt"></span><div><div className="act-t"><strong>Parts order PO-0034 shipped</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Slide seal and motor shipped. ETA March 18.</div><div className="act-tm">Mar 14 · Parts</div></div></div>
      <div className="act-i"><span className="act-dot pay"></span><div><div className="act-t"><strong>Payment received — $3,920</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Jayco payment for CLM-0243 has been received and applied.</div><div className="act-tm">Mar 8 · Payment</div></div></div>
    </div>
  </div>
</div>



<div className={`page ${activePage === 'dealer-settings' ? 'active' : ''}`} id="page-dealer-settings">
  <div style={{display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24}}>
    <div>
      <div style={{fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#bbb', fontWeight: 600, padding: '4px 0 8px'}}>Personal</div>
      <div className="settings-link active" onClick={() => setDSettingsTab('ds-profile')}>My Profile</div>
      <div className="settings-link" onClick={() => setDSettingsTab('ds-security')}>Security</div>
      <div style={{fontSize: 11, textTransform: 'uppercase', letterSpacing: 1, color: '#bbb', fontWeight: 600, padding: '16px 0 8px', borderTop: '1px solid #f0f0f0', marginTop: 8}}>Dealership</div>
      <div className="settings-link" onClick={() => setDSettingsTab('ds-dealership')}>Dealership Account</div>
      <div className="settings-link" onClick={() => setDSettingsTab('ds-subscription')}>Subscription & Billing</div>
      <div className="settings-link" onClick={() => setDSettingsTab('ds-notifpref')}>Notification Preferences</div>
    </div>
    <div>
      
      <div className={`pn dstab ${dSettingsTab === "dstab-ds-profile" ? "active" : ""}`} id="dstab-ds-profile" style={{display: dSettingsTab === "dstab-ds-profile" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">My Profile</span><span style={{fontSize: 12, color: '#888'}}>Your personal account settings</span></div>
        <div style={{padding: '24px 20px', display: 'flex', gap: 24, alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0'}}>
          <div style={{textAlign: 'center'}}>
            <div id="profile-avatar-display" style={{width: 80, height: 80, borderRadius: '50%', background: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8, overflow: 'hidden'}}>MS</div>
            <input type="file" id="profile-img-input" accept="image/*" style={{display: 'none'}} onChange={updateProfileImage} />
            <button className="btn btn-o btn-sm" onClick={() => document.getElementById('profile-img-input')?.click()}>Change Photo</button>
          </div>
          <div style={{flex: 1}}>
            <div style={{fontSize: 16, fontWeight: 600, marginBottom: 2}}>Mike Smith</div>
            <div style={{fontSize: 13, color: '#888', marginBottom: 4}}>Dealer Owner · Smith's RV Centre</div>
            <div style={{fontSize: 12, color: '#aaa'}}>Last login: Just now · Chrome on Windows</div>
          </div>
        </div>
        <div className="form-grid">
          <div className="form-group"><label>First Name</label><input value="Mike" /></div>
          <div className="form-group"><label>Last Name</label><input value="Smith" /></div>
          <div className="form-group"><label>Email</label><input value="mike@smithsrv.ca" /></div>
          <div className="form-group"><label>Phone</label><input value="(905) 555-0123" /></div>
          <div className="form-group"><label>Role</label><input value="Dealer Owner" readOnly style={{background: '#f3f4f6', color: '#888'}} /></div>
          <div className="form-group"><label>Timezone</label><select><option defaultSelected>Eastern (ET)</option><option>Central</option><option>Mountain</option><option>Pacific</option></select></div>
          <div className="form-group"><label>Language</label><select><option defaultSelected>English</option><option>French</option></select></div>
          <div className="form-group"><label>Date Format</label><select><option defaultSelected>MMM DD, YYYY</option><option>DD/MM/YYYY</option><option>YYYY-MM-DD</option></select></div>
          <div className="form-group full"><label>Bio</label><textarea placeholder="Optional bio..."></textarea></div>
        </div>
        <div className="btn-bar"><button className="btn btn-p" onClick={() => handleToast('Profile saved')}>Save Profile</button><button className="btn btn-o">Cancel</button></div>
      </div>

      
      <div className={`pn dstab ${dSettingsTab === "dstab-ds-security" ? "active" : ""}`} id="dstab-ds-security" style={{display: dSettingsTab === "dstab-ds-security" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Security</span></div>
        <div className="form-grid">
          <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Change Password</label></div>
          <div className="form-group"><label>Current Password</label><input type="password" placeholder="Current password" /></div>
          <div className="form-group"><label> </label></div>
          <div className="form-group"><label>New Password</label><input type="password" placeholder="New password" /></div>
          <div className="form-group"><label>Confirm Password</label><input type="password" placeholder="Confirm" /></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Two-Factor Authentication</label></div>
          <div className="form-group"><label>2FA Status</label><div style={{display: 'flex', alignItems: 'center', gap: 8, marginTop: 4}}><span className="bg pending">Not Enabled</span><button className="btn btn-o btn-sm" onClick={() => handleToast('2FA setup coming soon')}>Enable 2FA</button></div></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Active Sessions</label></div>
          <div className="form-group full"><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid #f5f5f5'}}><div><div style={{fontSize: 13, fontWeight: 500}}>Chrome on Windows</div><div style={{fontSize: 12, color: '#888'}}>Hamilton, ON · Current session</div></div><span className="bg active">Active</span></div><div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0'}}><div><div style={{fontSize: 13, fontWeight: 500}}>Safari on iPhone</div><div style={{fontSize: 12, color: '#888'}}>Hamilton, ON · 2 days ago</div></div><button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}} onClick={() => handleToast('Session revoked')}>Revoke</button></div></div>
        </div>
        <div className="btn-bar"><button className="btn btn-p" onClick={() => handleToast('Password updated')}>Update Password</button><button className="btn btn-o">Cancel</button></div>
      </div>

      
      <div className={`pn dstab ${dSettingsTab === "dstab-ds-dealership" ? "active" : ""}`} id="dstab-ds-dealership" style={{display: dSettingsTab === "dstab-ds-dealership" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Dealership Account</span><span style={{fontSize: 12, color: '#888'}}>Your dealership's business information</span></div>
        <div style={{padding: '12px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8}}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
          Changes here are shared with your claims operator. Updated info will appear on invoices, claims, and communications.
        </div>
        <div className="form-grid">
          <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Business Information</label></div>
          <div className="form-group"><label>Dealership Name</label><input id="ds-biz-name" value="Smith's RV Centre" /></div>
          <div className="form-group"><label>Legal / Registered Name</label><input value="Smith's RV Centre Inc." /></div>
          <div className="form-group"><label>Business Email</label><input value="info@smithsrv.ca" /></div>
          <div className="form-group"><label>Business Phone</label><input value="(905) 555-0100" /></div>
          <div className="form-group"><label>Website</label><input value="https://smithsrv.ca" /></div>
          <div className="form-group"><label>Business Number (GST/HST)</label><input value="123456789 RT0001" /></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Address</label></div>
          <div className="form-group"><label>Street Address</label><input value="1234 RV Parkway" /></div>
          <div className="form-group"><label>Suite / Unit</label><input placeholder="Optional" /></div>
          <div className="form-group"><label>City</label><input value="Hamilton" /></div>
          <div className="form-group"><label>Province</label><select><option defaultSelected>Ontario</option><option>Quebec</option><option>British Columbia</option><option>Alberta</option><option>Manitoba</option><option>Saskatchewan</option><option>Nova Scotia</option><option>New Brunswick</option><option>PEI</option><option>Newfoundland</option></select></div>
          <div className="form-group"><label>Postal Code</label><input value="L8E 3B5" /></div>
          <div className="form-group"><label>Country</label><select><option defaultSelected>Canada</option><option>United States</option></select></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Primary Contact</label></div>
          <div className="form-group"><label>Contact Name</label><input value="Mike Smith" /></div>
          <div className="form-group"><label>Contact Email</label><input value="mike@smithsrv.ca" /></div>
          <div className="form-group"><label>Contact Phone</label><input value="(905) 555-0123" /></div>
          <div className="form-group"><label>Position / Title</label><input value="Owner" /></div>
          <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Manufacturers</label></div>
          <div className="form-group full"><div style={{display: 'flex', gap: 8, flexWrap: 'wrap', marginTop: 4}}>
            <span className="mfr" style={{padding: '6px 12px', fontSize: 12}}>Jayco</span>
            <span className="mfr" style={{padding: '6px 12px', fontSize: 12}}>Forest River</span>
            <span className="mfr" style={{padding: '6px 12px', fontSize: 12, opacity: '0.4', border: '1px dashed #ccc', cursor: 'pointer'}} onClick={() => handleToast('Manufacturer added')}>+ Add manufacturer</span>
          </div></div>
        </div>
        <div className="btn-bar"><button className="btn btn-p" onClick={() => handleToast('Dealership info saved')}>Save Dealership Info</button><button className="btn btn-o">Cancel</button></div>
      </div>

      
      <div className={`pn dstab ${dSettingsTab === "dstab-ds-subscription" ? "active" : ""}`} id="dstab-ds-subscription" style={{display: dSettingsTab === "dstab-ds-subscription" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Subscription & Billing</span><span style={{fontSize: 12, color: '#888'}}>Managed by your operator</span></div>
        <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0}}>
          <div style={{borderRight: '1px solid #f0f0f0'}}>
            <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Your Plan</div>
            <div className="cd-row"><span className="cd-label">Plan</span><span className="cd-value" style={{color: 'var(--brand)', fontWeight: 600}}>Plan A — Monthly</span></div>
            <div className="cd-row"><span className="cd-label">Monthly Fee</span><span className="cd-value">$349.00 / month</span></div>
            <div className="cd-row"><span className="cd-label">Billing Cycle</span><span className="cd-value">1st of each month</span></div>
            <div className="cd-row"><span className="cd-label">Next Invoice</span><span className="cd-value">Apr 1, 2026</span></div>
            <div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg active">Active</span></span></div>
            <div className="cd-row"><span className="cd-label">Member Since</span><span className="cd-value">Jan 15, 2026</span></div>
          </div>
          <div>
            <div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Fee Schedule</div>
            <div className="cd-row"><span className="cd-label">Claim Processing Fee</span><span className="cd-value">10% of approved</span></div>
            <div className="cd-row"><span className="cd-label">Min Fee</span><span className="cd-value">$50.00</span></div>
            <div className="cd-row"><span className="cd-label">Max Fee Cap</span><span className="cd-value">$500.00</span></div>
            <div className="cd-row"><span className="cd-label">DAF Fee</span><span className="cd-value">$25.00 / unit</span></div>
            <div className="cd-row"><span className="cd-label">PDI Fee</span><span className="cd-value">$15.00 / unit</span></div>
          </div>
        </div>
        <div style={{padding: '14px 20px', borderTop: '1px solid #f0f0f0'}}>
          <div className="cd-section-h" style={{padding: '0 0 12px', fontSize: 13, fontWeight: 600}}>Payment Method</div>
          <div style={{display: 'flex', alignItems: 'center', gap: 12, padding: '12px 16px', background: '#fafafa', borderRadius: 8, border: '1px solid #e5e7eb'}}>
            <svg width="32" height="20" viewBox="0 0 32 20"><rect width="32" height="20" rx="4" fill="#1a1f71"/><text x="16" y="13" textAnchor="middle" fill="white" font-size="8" font-weight="bold" font-family="Arial">VISA</text></svg>
            <div style={{flex: 1}}><div style={{fontSize: 13, fontWeight: 500}}>Visa ending in 4242</div><div style={{fontSize: 12, color: '#888'}}>Expires 09/2028</div></div>
            <button className="btn btn-o btn-sm" onClick={() => handleToast('Card management coming soon')}>Update Card</button>
          </div>
        </div>
        <div style={{padding: '12px 20px', background: '#f5f6f8', borderTop: '1px solid #f0f0f0', fontSize: 12, color: '#888', borderRadius: '0 0 8px 8px'}}>Subscription plan and fee schedule are managed by your operator. Contact them to make changes.</div>
      </div>

      
      <div className={`pn dstab ${dSettingsTab === "dstab-ds-notifpref" ? "active" : ""}`} id="dstab-ds-notifpref" style={{display: dSettingsTab === "dstab-ds-notifpref" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Notification Preferences</span></div>
        <div className="form-grid">
          <div className="form-group"><label>Claim status updates</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
          <div className="form-group"><label>Invoice generated</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
          <div className="form-group"><label>Financing updates</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
          <div className="form-group"><label>Parts order updates</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
          <div className="form-group"><label>F&I recommendations</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
          <div className="form-group"><label>Platform announcements</label><select><option>Push + Email</option><option defaultSelected>Push only</option><option>Email only</option><option>Off</option></select></div>
          <div className="form-group"><label>Warranty expiry reminders</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
          <div className="form-group"><label>Customer portal activity</label><select><option>Push + Email</option><option defaultSelected>Push only</option><option>Email only</option><option>Off</option></select></div>
        </div>
        <div className="btn-bar"><button className="btn btn-p" onClick={() => handleToast('Preferences saved')}>Save Preferences</button><button className="btn btn-o" onClick={() => handleToast('Preferences reset')}>Reset to Defaults</button></div>
      </div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'dealer-changelog' ? 'active' : ''}`} id="page-dealer-changelog">
  <div className="tabs" id="dcl-tabs"><div className="tab active" onClick={() => setDclTab('dcl-current')}>What's New</div><div className="tab" onClick={() => setDclTab('dcl-past')}>Past Updates</div><div className="tab" onClick={() => setDclTab('dcl-upcoming')}>Coming Soon</div><div className="tab" onClick={() => setDclTab('dcl-request')}>Request a Feature</div></div>

  <div className={`pn dcltab ${dclTab === "dcltab-dcl-current" ? "active" : ""}`} id="dcltab-dcl-current" style={{display: dclTab === "dcltab-dcl-current" ? "block" : "none"}}>
    <div style={{padding: '24px 20px', borderBottom: '1px solid #f0f0f0'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div><div style={{fontSize: 24, fontWeight: 700, color: 'var(--brand)', marginBottom: 4}}>v2.0.0</div><div style={{fontSize: 14, color: '#888'}}>March 17, 2026</div></div>
        <span className="bg active" style={{fontSize: 13, padding: '6px 16px'}}>Latest</span>
      </div>
      <div style={{fontSize: 14, color: '#333', marginTop: 12, lineHeight: '1.6'}}>Complete platform rebuild with your dedicated dealer portal, customer portal management, and integrated service marketplace.</div>
    </div>
    <div style={{padding: 20, fontSize: 13, color: '#333', lineHeight: 2}}>
      <div style={{fontSize: 13, fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12}}>What you can do now</div>
      <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Upload photos and Push to Claim</strong> — select a unit, upload photos, describe the issue, and push directly to processing</div>
      <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Track all your claims</strong> — see status, progress timeline, communicate with the claims team</div>
      <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Request financing</strong> — submit customer financing requests, we shop lenders and find the best rate</div>
      <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>F&I product tracking</strong> — flag deals for F&I recommendations</div>
      <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Order parts</strong> — request parts with sourcing, pricing, and delivery tracking</div>
      <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Invite customers to their portal</strong> — white-label portal with your branding, logo, and custom domain</div>
      <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Manage customer tickets</strong> — see and respond to customer support tickets from your portal</div>
      <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Brand your customer portal</strong> — custom logo, colors, domain name, welcome message</div>
      <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Manage your team</strong> — add/remove staff with role-based access (Owner vs Staff)</div>
      <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Unit photo management</strong> — display photo visible to customers on their dashboard</div>
    </div>
  </div>

  <div className={`pn dcltab ${dclTab === "dcltab-dcl-past" ? "active" : ""}`} id="dcltab-dcl-past" style={{display: dclTab === "dcltab-dcl-past" ? "block" : "none"}}>
    <div style={{padding: 20}}>
      <div style={{borderLeft: '3px solid #e5e7eb', paddingLeft: 20}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: '#333'}}>v1.0.0</div><span style={{fontSize: 12, color: '#888'}}>November 2025</span></div>
        <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Original claims tracking portal</div>
        <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}>
          <div>• Basic claims submission and tracking</div>
          <div>• Contact form for new dealer signups</div>
          <div>• Bilingual website (EN/FR)</div>
        </div>
      </div>
    </div>
  </div>

  <div className={`pn dcltab ${dclTab === "dcltab-dcl-upcoming" ? "active" : ""}`} id="dcltab-dcl-upcoming" style={{display: dclTab === "dcltab-dcl-upcoming" ? "block" : "none"}}>
    <div style={{padding: 20}}>
      <div style={{marginBottom: 24}}>
        <div style={{fontSize: 16, fontWeight: 700, color: 'var(--brand)', marginBottom: 4}}>Coming in April 2026</div>
        <div style={{fontSize: 13, color: '#555', lineHeight: '1.8', marginTop: 8}}>
          <div>• Drag-and-drop bulk photo upload with progress bars</div>
          <div>• Real-time notifications when claim status changes</div>
          <div>• Search and filter on all your tables</div>
          <div>• Email notifications for claim updates, invoices, and parts deliveries</div>
        </div>
      </div>
      <div style={{marginBottom: 24}}>
        <div style={{fontSize: 16, fontWeight: 700, color: '#555', marginBottom: 4}}>Coming in May 2026</div>
        <div style={{fontSize: 13, color: '#555', lineHeight: '1.8', marginTop: 8}}>
          <div>• Online payment for invoices (credit card, Interac)</div>
          <div>• Customer portal SMS invitations</div>
          <div>• Quick Chat inbox for casual customer messages</div>
          <div>• Automated invoice generation on claim close</div>
        </div>
      </div>
      <div>
        <div style={{fontSize: 16, fontWeight: 700, color: '#555', marginBottom: 4}}>Coming in June 2026</div>
        <div style={{fontSize: 13, color: '#555', lineHeight: '1.8', marginTop: 8}}>
          <div>• AI-powered document scanner (warranty certs, invoices)</div>
          <div>• Mobile app (camera upload, unit tag scanning, push to claim on the go)</div>
          <div>• AI F&I Presenter for remote product presentations to customers</div>
        </div>
      </div>
    </div>
  </div>

  <div className={`pn dcltab ${dclTab === "dcltab-dcl-request" ? "active" : ""}`} id="dcltab-dcl-request" style={{display: dclTab === "dcltab-dcl-request" ? "block" : "none"}}>
    <div style={{padding: 20}}>
      <div style={{fontSize: 13, color: '#666', marginBottom: 16, lineHeight: '1.5'}}>Have an idea for a feature that would help your dealership? Let us know! We review all requests and prioritize based on dealer feedback.</div>
      <div className="form-grid" style={{padding: 0}}>
        <div className="form-group full"><label>Feature Title</label><input placeholder="Brief description of what you'd like to see..." /></div>
        <div className="form-group full"><label>Tell us more</label><textarea placeholder="How would this feature help your dealership? What problem does it solve? Be as detailed as you like..." style={{minHeight: 120}}></textarea></div>
        <div className="form-group"><label>Priority to you</label><select><option>Nice to have</option><option defaultSelected>Would really help</option><option>Critical for my business</option></select></div>
      </div>
      <div className="btn-bar" style={{padding: '16px 0'}}><button className="btn btn-p" onClick={() => handleToast('Feature request submitted!')}>Submit Request</button></div>
    </div>
  </div>
</div>

<div className={`page ${activePage === 'clients' ? 'active' : ''}`} id="page-clients">
  <div style={{marginBottom:20,display:'flex',gap:12,alignItems:'center'}}>
    <input placeholder="Search clients by name, email or unit..." style={{flex:1,padding:'10px 14px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:13,fontFamily:'inherit'}} />
    <button className="btn btn-p" style={{whiteSpace:'nowrap'}} onClick={() => showPage('invite-customer')}>+ Invite Client</button>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Client Accounts</span><span style={{fontSize:12,color:'#888'}}>8 total</span></div>
    <div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Unit</th><th>Portal Status</th><th>Joined</th><th></th></tr></thead><tbody>
      <tr><td><strong>Robert Martin</strong></td><td>robert.martin@email.com</td><td>2024 Jayco Jay Flight</td><td><span className="bg active">Active</span></td><td>Mar 2, 2026</td><td><span className="cid" onClick={() => showPage('customers')}>View Portal</span></td></tr>
      <tr><td><strong>Sarah Johnson</strong></td><td>sarah.j@email.com</td><td>2023 Forest River Rockwood</td><td><span className="bg active">Active</span></td><td>Feb 14, 2026</td><td><span className="cid" onClick={() => showPage('customers')}>View Portal</span></td></tr>
      <tr><td><strong>Daniel Tremblay</strong></td><td>d.tremblay@gmail.com</td><td>2024 Keystone Montana</td><td><span className="bg pending">Pending</span></td><td>Mar 10, 2026</td><td><span className="cid" onClick={() => handleToast('Invitation resent')}>Resend Invite</span></td></tr>
    </tbody></table></div>
  </div>
</div>

<div className={`page ${activePage === 'messages' ? 'active' : ''}`} id="page-messages">
  <div style={{display:'grid',gridTemplateColumns:'280px 1fr',gap:16,height:560}}>
    <div className="pn" style={{padding:0,overflow:'hidden'}}>
      <div style={{padding:'12px 16px',borderBottom:'1px solid #f0f0f0',fontWeight:600,fontSize:13}}>Inbox</div>
      {[{name:'DS360 Team',msg:'Your claim CLM-0248 has been submitted to Jayco.',time:'2h ago',unread:true},{name:'CLM-0243 Thread',msg:'Payment of $3,920 has been processed.',time:'1d ago',unread:false},{name:'DS360 Team',msg:'New feature: TechFlow work orders.',time:'3d ago',unread:false}].map((m,i)=>(
        <div key={i} style={{padding:'12px 16px',borderBottom:'1px solid #f8f8f8',cursor:'pointer',background:m.unread?'#f0f4ff':'white',display:'flex',gap:10}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:'#08235d',color:'white',display:'flex',alignItems:'center',justifyContent:'center',fontSize:12,flexShrink:0}}>{m.name[0]}</div>
          <div style={{flex:1,minWidth:0}}><div style={{fontWeight:m.unread?600:400,fontSize:13,marginBottom:2}}>{m.name}</div><div style={{fontSize:12,color:'#888',overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{m.msg}</div><div style={{fontSize:11,color:'#aaa',marginTop:2}}>{m.time}</div></div>
          {m.unread && <div style={{width:8,height:8,borderRadius:'50%',background:'#2563eb',flexShrink:0,marginTop:4}}></div>}
        </div>
      ))}
    </div>
    <div className="pn" style={{display:'flex',flexDirection:'column'}}>
      <div style={{padding:'12px 20px',borderBottom:'1px solid #f0f0f0',fontWeight:600,fontSize:14}}>DS360 Team</div>
      <div style={{flex:1,padding:20,overflowY:'auto'}}>
        <div style={{background:'#f0f4ff',borderRadius:12,padding:'12px 16px',maxWidth:'80%',marginBottom:12,fontSize:13}}>Your claim CLM-0248 has been submitted to Jayco for review. Expected turnaround: 5-7 business days.</div>
      </div>
      <div style={{padding:'12px 16px',borderTop:'1px solid #f0f0f0',display:'flex',gap:8}}>
        <input placeholder="Reply..." style={{flex:1,padding:'8px 14px',border:'1px solid #e0e0e0',borderRadius:20,fontSize:13,fontFamily:'inherit'}} />
        <button className="btn btn-p" style={{borderRadius:20}} onClick={() => handleToast('Message sent')}>Send</button>
      </div>
    </div>
  </div>
</div>

<div className={`page ${activePage === 'documents' ? 'active' : ''}`} id="page-documents">
  <div style={{marginBottom:16,display:'flex',gap:8}}>
    {['All','Invoices','Contracts','Reports','Correspondence'].map((t,i)=>(
      <button key={t} onClick={(e)=>switchTab(e)} className={`tab${i===0?' active':''}`}>{t}</button>
    ))}
  </div>
  <div className="pn">
    <div className="tw"><table><thead><tr><th>Document</th><th>Type</th><th>Date</th><th>Size</th><th></th></tr></thead><tbody>
      <tr><td><div style={{display:'flex',alignItems:'center',gap:8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>INV-2026-0042.pdf</strong></div></td><td>Invoice</td><td>Mar 15, 2026</td><td>124 KB</td><td><span className="cid" onClick={() => handleToast('Download coming soon')}>Download</span></td></tr>
      <tr><td><div style={{display:'flex',alignItems:'center',gap:8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>Service-Agreement-2026.pdf</strong></div></td><td>Contract</td><td>Jan 1, 2026</td><td>890 KB</td><td><span className="cid" onClick={() => handleToast('Download coming soon')}>Download</span></td></tr>
      <tr><td><div style={{display:'flex',alignItems:'center',gap:8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg><strong>Q1-2026-Claims-Report.xlsx</strong></div></td><td>Report</td><td>Apr 1, 2026</td><td>256 KB</td><td><span className="cid" onClick={() => handleToast('Download coming soon')}>Download</span></td></tr>
    </tbody></table></div>
  </div>
</div>

<div className={`page ${activePage === 'techflow' ? 'active' : ''}`} id="page-techflow">
  <div className="al-g" style={{marginBottom:20}}>
    <div className="al"><div className="al-i in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg></div><div className="al-c"><div className="al-t">4 open work orders</div><div className="al-d">2 awaiting technician assignment</div></div></div>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Open Orders</div><div className="sc-v" style={{color:'#2563eb'}}>4</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>In Progress</div><div className="sc-v" style={{color:'#f59e0b'}}>2</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Completed This Week</div><div className="sc-v" style={{color:'#22c55e'}}>7</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Avg. Completion</div><div className="sc-v">2.4d</div></div>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Work Orders</span><button className="btn btn-p" style={{fontSize:12,padding:'6px 14px'}} onClick={() => showPage('wo-new')}>+ New Work Order</button></div>
    <div className="tw"><table><thead><tr><th>WO #</th><th>Unit</th><th>Description</th><th>Assigned To</th><th>Status</th><th>Due</th></tr></thead><tbody>
      <tr><td><span className="cid" onClick={() => showPage('wo-detail')}>WO-0041</span></td><td>2024 Jayco Jay Flight</td><td>Slide-out seal replacement</td><td>Mike T.</td><td><span className="bg in-progress">In Progress</span></td><td>Apr 28</td></tr>
      <tr><td><span className="cid" onClick={() => showPage('wo-detail')}>WO-0040</span></td><td>2024 Forest River Rockwood</td><td>AC unit not cooling — warranty</td><td>Unassigned</td><td><span className="bg pending">Open</span></td><td>Apr 29</td></tr>
      <tr><td><span className="cid" onClick={() => showPage('wo-detail')}>WO-0039</span></td><td>2023 Keystone Montana</td><td>PDI inspection — pre-delivery</td><td>Jason R.</td><td><span className="bg active">Complete</span></td><td>Apr 25</td></tr>
      <tr><td><span className="cid" onClick={() => showPage('wo-detail')}>WO-0038</span></td><td>2022 Heartland Bighorn</td><td>Awning motor replacement</td><td>Carlos P.</td><td><span className="bg in-progress">In Progress</span></td><td>Apr 30</td></tr>
    </tbody></table></div>
  </div>
</div>

<div className={`page ${activePage === 'consignment' ? 'active' : ''}`} id="page-consignment">
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Active Consignments</div><div className="sc-v" style={{color:'#2563eb'}}>3</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Pending Photos</div><div className="sc-v" style={{color:'#f59e0b'}}>1</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Units Sold (YTD)</div><div className="sc-v" style={{color:'#22c55e'}}>8</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Pending Payouts</div><div className="sc-v">$12,400</div></div>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Consigned Units</span><button className="btn btn-p" style={{fontSize:12,padding:'6px 14px'}} onClick={() => showPage('mkt-post-unit')}>+ Add Consignment</button></div>
    <div className="tw"><table><thead><tr><th>Unit</th><th>Consignor</th><th>List Price</th><th>Days Listed</th><th>Offers</th><th>Status</th><th></th></tr></thead><tbody>
      <tr><td>2022 Jayco Eagle HT 284BHOK</td><td>Paul Gagnon</td><td>$68,500</td><td>14</td><td>2</td><td><span className="bg active">Listed</span></td><td><span className="cid" onClick={() => handleToast('Consignment detail coming soon')}>Manage</span></td></tr>
      <tr><td>2021 Forest River Salem 27DBK</td><td>Marie-Claude B.</td><td>$34,900</td><td>32</td><td>0</td><td><span className="bg active">Listed</span></td><td><span className="cid" onClick={() => handleToast('Consignment detail coming soon')}>Manage</span></td></tr>
      <tr><td>2023 Heartland Bighorn 3995FL</td><td>Tom Wilson</td><td>$89,000</td><td>5</td><td>1</td><td><span className="bg pending">Pending Photos</span></td><td><span className="cid" onClick={() => handleToast('Consignment detail coming soon')}>Manage</span></td></tr>
    </tbody></table></div>
  </div>
</div>

<div className={`page ${activePage === 'marketing' ? 'active' : ''}`} id="page-marketing">
  <div className="al-g" style={{marginBottom:20}}>
    <div className="al"><div className="al-i gr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg></div><div className="al-c"><div className="al-t">Marketing Services — Launching Q2 2026</div><div className="al-d">Campaigns, lead capture, SEO & PPC managed by DS360</div></div></div>
  </div>
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Active Campaigns</div><div className="sc-v">—</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Leads This Month</div><div className="sc-v">—</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Avg. Cost per Lead</div><div className="sc-v">—</div></div>
  </div>
  <div className="pn" style={{padding:40,textAlign:'center'}}>
    <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="1.5" style={{margin:'0 auto 16px'}}><polyline points="22 12 18 12 15 21 9 3 6 12 2 12"/></svg>
    <div style={{fontSize:16,fontWeight:600,color:'#1a1a2e',marginBottom:8}}>Digital Marketing Services — Coming Q2 2026</div>
    <div style={{fontSize:13,color:'#666',maxWidth:500,margin:'0 auto',lineHeight:1.6}}>SEO, PPC, social media management, lead generation, and CRM integration — all managed by the DS360 team on your behalf. More leads. Less work.</div>
    <button className="btn btn-p" style={{marginTop:20}} onClick={() => showPage('sales-services')}>Learn More</button>
  </div>
</div>

<div className={`page ${activePage === 'sales-services' ? 'active' : ''}`} id="page-sales-services">
  <div style={{marginBottom:16,display:'flex',gap:8}}>
    {['Warranty Plans','F&I Products','Parts & Accessories'].map((t,i)=>(
      <button key={t} onClick={(e)=>switchTab(e)} className={`tab${i===0?' active':''}`}>{t}</button>
    ))}
  </div>
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Plans Sold (YTD)</div><div className="sc-v" style={{color:'#22c55e'}}>24</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>F&I Deals (YTD)</div><div className="sc-v" style={{color:'#2563eb'}}>11</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Parts Revenue</div><div className="sc-v" style={{color:'#f59e0b'}}>$8,240</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Total Revenue</div><div className="sc-v">$47,200</div></div>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Sell a Product to a Customer</span></div>
    <div style={{padding:20,display:'grid',gridTemplateColumns:'repeat(3,1fr)',gap:16}}>
      {[{name:'Extended Warranty',price:'from $1,200',nav:'svc-warranty'},{name:'GAP Insurance',price:'from $395',nav:'svc-fi-new'},{name:'Tire & Wheel Protection',price:'from $295',nav:'svc-fi-new'},{name:'F&I Package',price:'Custom',nav:'svc-fi-new'},{name:'Parts Order',price:'Per quote',nav:'svc-parts-new'},{name:'Roadside Assist',price:'from $149/yr',nav:'svc-warranty'}].map(p=>(
        <div key={p.name} className="pn" style={{padding:20,textAlign:'center',cursor:'pointer'}} onClick={()=>showPage(p.nav)}>
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#08235d" strokeWidth="1.5" style={{margin:'0 auto 12px'}}><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>
          <div style={{fontWeight:600,fontSize:14,marginBottom:4}}>{p.name}</div>
          <div style={{fontSize:12,color:'#888'}}>{p.price}</div>
        </div>
      ))}
    </div>
  </div>
</div>

<div className={`page ${activePage === 'my-subscription' ? 'active' : ''}`} id="page-my-subscription">
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:20,marginBottom:24}}>
    <div className="pn" style={{padding:24,border:'2px solid #08235d'}}>
      <div style={{display:'flex',justifyContent:'space-between',alignItems:'flex-start',marginBottom:16}}>
        <div><div style={{fontSize:11,color:'#888',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>Current Plan</div><div style={{fontSize:20,fontWeight:700,color:'#08235d'}}>Plan A — Subscription</div></div>
        <span className="bg active">Active</span>
      </div>
      <div style={{fontSize:13,color:'#555',lineHeight:1.6,marginBottom:20}}>Monthly recurring. Up to 50 claims/month, dedicated operator, priority support.</div>
      <div style={{display:'flex',gap:24,marginBottom:20}}>
        <div><div style={{fontSize:11,color:'#888'}}>Monthly Fee</div><div style={{fontSize:22,fontWeight:700,color:'#1a1a2e'}}>$299<span style={{fontSize:13,fontWeight:400,color:'#888'}}>/mo</span></div></div>
        <div><div style={{fontSize:11,color:'#888'}}>Per-Claim Fee</div><div style={{fontSize:22,fontWeight:700,color:'#1a1a2e'}}>$35</div></div>
        <div><div style={{fontSize:11,color:'#888'}}>Next Billing</div><div style={{fontSize:15,fontWeight:600,color:'#1a1a2e'}}>May 1, 2026</div></div>
      </div>
      <div style={{display:'flex',gap:8}}><button className="btn" style={{fontSize:12}} onClick={() => handleToast('Card management coming soon')}>Manage Card</button><button className="btn" style={{fontSize:12,color:'#ef4444',borderColor:'#ef4444'}} onClick={() => handleToast('Please contact your operator to cancel')}>Cancel Plan</button></div>
    </div>
    <div className="pn" style={{padding:24}}>
      <div style={{fontSize:11,color:'#888',marginBottom:4,textTransform:'uppercase',letterSpacing:1}}>Alternate Plan</div>
      <div style={{fontSize:20,fontWeight:700,color:'#333',marginBottom:12}}>Plan B — Pre-Funded Wallet</div>
      <div style={{fontSize:13,color:'#555',lineHeight:1.6,marginBottom:20}}>No monthly fee. Lower per-claim rates. Load balance and fees auto-deduct per claim processed.</div>
      <div style={{display:'flex',gap:24,marginBottom:20}}>
        <div><div style={{fontSize:11,color:'#888'}}>Monthly Fee</div><div style={{fontSize:22,fontWeight:700,color:'#888'}}>$0</div></div>
        <div><div style={{fontSize:11,color:'#888'}}>Per-Claim Fee</div><div style={{fontSize:22,fontWeight:700,color:'#888'}}>$25</div></div>
      </div>
      <button className="btn" style={{fontSize:12}} onClick={() => handleToast('Please contact your operator to change plans')}>Switch to Plan B</button>
    </div>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Payment Method</span></div>
    <div style={{padding:20,display:'flex',alignItems:'center',gap:12,flexWrap:'wrap'}}>
      <div style={{padding:'10px 16px',border:'2px solid #08235d',borderRadius:8,display:'flex',alignItems:'center',gap:8,fontSize:13}}><svg width="20" height="14" viewBox="0 0 32 22" fill="none"><rect width="32" height="22" rx="3" fill="#1a1f71"/><rect y="5" width="32" height="6" fill="#f7a600"/></svg>Visa ending 4242 &nbsp;<span style={{color:'#22c55e',fontSize:11,fontWeight:600}}>Primary</span></div>
      <button className="btn" style={{fontSize:12}} onClick={() => handleToast('Card management coming soon')}>Update Card</button>
      <button className="btn" style={{fontSize:12}} onClick={() => handleToast('Interac setup coming soon')}>Add Interac e-Transfer</button>
    </div>
  </div>
</div>

<div className={`page ${activePage === 'portal-settings' ? 'active' : ''}`} id="page-portal-settings">
  <div style={{marginBottom:16,display:'flex',gap:8,flexWrap:'wrap'}}>
    {['Staff','Technicians','Partners','Branding','Domain','Notifications'].map((t,i)=>(
      <button key={t} onClick={(e)=>switchTab(e)} className={`tab${i===0?' active':''}`}>{t}</button>
    ))}
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Staff Members</span><button className="btn btn-p" style={{fontSize:12,padding:'6px 14px'}} onClick={()=>showPage('add-staff')}>+ Invite Staff</button></div>
    <div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Active</th><th></th></tr></thead><tbody>
      <tr><td><strong>Mike Smith</strong></td><td>mike@smithsrv.com</td><td><span className="bg active">Owner</span></td><td><span className="bg active">Active</span></td><td>Today</td><td></td></tr>
      <tr><td><strong>Janet Lee</strong></td><td>janet@smithsrv.com</td><td><span className="bg pending">Staff</span></td><td><span className="bg active">Active</span></td><td>2h ago</td><td><span className="cid" onClick={() => handleToast('Staff editing coming soon')}>Edit</span></td></tr>
      <tr><td><strong>Carlos Perez</strong></td><td>carlos@smithsrv.com</td><td><span className="bg pending">Technician</span></td><td><span className="bg active">Active</span></td><td>Yesterday</td><td><span className="cid" onClick={() => handleToast('Staff editing coming soon')}>Edit</span></td></tr>
    </tbody></table></div>
  </div>
</div>

<div className={`page ${activePage === 'consignor-units' ? 'active' : ''}`} id="page-consignor-units">
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Listed Units</div><div className="sc-v" style={{color:'#2563eb'}}>2</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Active Offers</div><div className="sc-v" style={{color:'#f59e0b'}}>3</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Sold (YTD)</div><div className="sc-v" style={{color:'#22c55e'}}>1</div></div>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">My Consigned Units</span><button className="btn btn-p" style={{fontSize:12,padding:'6px 14px'}} onClick={()=>showPage('mkt-post-unit')}>+ List a Unit</button></div>
    <div className="tw"><table><thead><tr><th>Unit</th><th>VIN</th><th>List Price</th><th>Days Listed</th><th>Offers</th><th>Status</th></tr></thead><tbody>
      <tr><td>2022 Jayco Eagle HT 284BHOK</td><td>1UJBJ0BN1N2TJ8801</td><td>$68,500</td><td>14</td><td><span className="cid" onClick={()=>showPage('consignor-offers')}>2</span></td><td><span className="bg active">Listed</span></td></tr>
      <tr><td>2021 Forest River Salem 27DBK</td><td>4X4FCKB21ME029912</td><td>$34,900</td><td>32</td><td><span className="cid" onClick={()=>showPage('consignor-offers')}>1</span></td><td><span className="bg active">Listed</span></td></tr>
    </tbody></table></div>
  </div>
</div>

<div className={`page ${activePage === 'consignor-offers' ? 'active' : ''}`} id="page-consignor-offers">
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Offers Received</span><span style={{fontSize:12,color:'#888'}}>3 active offers</span></div>
    <div style={{padding:16,display:'flex',flexDirection:'column',gap:12}}>
      {[{unit:'2022 Jayco Eagle HT 284BHOK',list:68500,offer:65000,buyer:'Dealer — Maple RV Centre',exp:'Apr 30'},{unit:'2022 Jayco Eagle HT 284BHOK',list:68500,offer:66500,buyer:'Public Buyer',exp:'May 1'},{unit:'2021 Forest River Salem 27DBK',list:34900,offer:33000,buyer:'Dealer — Coast RV',exp:'Apr 28'}].map((o,i)=>(
        <div key={i} style={{border:'1px solid #e8e8e8',borderRadius:10,padding:16,display:'flex',justifyContent:'space-between',alignItems:'center',gap:16}}>
          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:14,marginBottom:6}}>{o.unit}</div><div style={{fontSize:13,color:'#555'}}>Offer: <strong style={{color:'#22c55e'}}>${o.offer.toLocaleString()}</strong> &nbsp;&middot;&nbsp; List: ${o.list.toLocaleString()} &nbsp;&middot;&nbsp; {o.buyer}</div><div style={{fontSize:12,color:'#888',marginTop:4}}>Expires: {o.exp}</div></div>
          <div style={{display:'flex',gap:8,flexShrink:0}}><button className="btn btn-p" style={{fontSize:12}} onClick={() => handleToast('Offer accepted — escrow process initiated')}>Accept</button><button className="btn" style={{fontSize:12}} onClick={() => handleToast('Counter offer sent')}>Counter</button><button className="btn" style={{fontSize:12}} onClick={() => handleToast('Offer declined')}>Decline</button></div>
        </div>
      ))}
    </div>
  </div>
</div>

<div className={`page ${activePage === 'consignor-payouts' ? 'active' : ''}`} id="page-consignor-payouts">
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Lifetime Earnings</div><div className="sc-v" style={{color:'#22c55e'}}>$42,750</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Pending Payout</div><div className="sc-v" style={{color:'#f59e0b'}}>$0</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Next Payout Date</div><div className="sc-v">May 15</div></div>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Payout History</span></div>
    <div className="tw"><table><thead><tr><th>Date</th><th>Unit</th><th>Sale Price</th><th>Dealer Fee</th><th>Your Payout</th><th>Method</th><th>Status</th></tr></thead><tbody>
      <tr><td>Mar 2, 2026</td><td>2020 Keystone Cougar 29BHS</td><td>$45,000</td><td>$2,250 (5%)</td><td style={{color:'#22c55e',fontWeight:600}}>$42,750</td><td>Interac e-Transfer</td><td><span className="bg active">Paid</span></td></tr>
    </tbody></table></div>
  </div>
</div>

<div className={`page ${activePage === 'bidder-my-bids' ? 'active' : ''}`} id="page-bidder-my-bids">
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Active Bids</div><div className="sc-v" style={{color:'#2563eb'}}>2</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Currently Winning</div><div className="sc-v" style={{color:'#22c55e'}}>1</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Outbid</div><div className="sc-v" style={{color:'#ef4444'}}>1</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Won (All Time)</div><div className="sc-v">3</div></div>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">My Bid History</span><span className="pn-a" onClick={()=>showPage('mkt-live-auctions')}>Browse Auctions</span></div>
    <div className="tw"><table><thead><tr><th>Unit</th><th>My Bid</th><th>High Bid</th><th>Status</th><th>Auction Ends</th></tr></thead><tbody>
      <tr><td>2023 Forest River Rockwood 2882WS</td><td>$41,000</td><td>$43,000</td><td><span className="bg denied">Outbid</span></td><td>Apr 27 2:00 PM</td></tr>
      <tr><td>2022 Keystone Montana 3855BR</td><td>$67,000</td><td>$67,000</td><td><span className="bg active">Winning</span></td><td>Apr 28 10:00 AM</td></tr>
    </tbody></table></div>
  </div>
</div>

<div className={`page ${activePage === 'bidder-verification' ? 'active' : ''}`} id="page-bidder-verification">
  <div className="pn" style={{padding:24,maxWidth:680}}>
    <div style={{fontSize:15,fontWeight:600,marginBottom:4}}>Buyer Verification</div>
    <div style={{fontSize:13,color:'#666',marginBottom:24,lineHeight:1.6}}>Complete verification to participate in live auctions and make binding offers on marketplace units. Your information is encrypted and stored securely.</div>
    <div style={{display:'flex',flexDirection:'column',gap:12}}>
      {[{label:'Identity Verification',desc:'Government-issued ID uploaded and verified',status:'complete'},{label:'Deposit on File',desc:'$5,000 refundable deposit — required for live auctions',status:'complete'},{label:'Business Registration',desc:'Optional — unlocks dealer wholesale pricing',status:'pending'}].map((s,i)=>(
        <div key={i} style={{display:'flex',alignItems:'center',gap:16,padding:'14px 16px',border:'1px solid #e8e8e8',borderRadius:10}}>
          <div style={{width:36,height:36,borderRadius:'50%',background:s.status==='complete'?'#22c55e':'#f0f0f0',display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
            {s.status==='complete'?<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="3"><polyline points="20 6 9 17 4 12"/></svg>:<span style={{fontSize:12,color:'#888',fontWeight:600}}>{i+1}</span>}
          </div>
          <div style={{flex:1}}><div style={{fontWeight:600,fontSize:13,marginBottom:2}}>{s.label}</div><div style={{fontSize:12,color:'#888'}}>{s.desc}</div></div>
          {s.status==='pending'&&<button className="btn btn-p" style={{fontSize:12,flexShrink:0}} onClick={() => handleToast('Verification coming soon')}>Complete</button>}
          {s.status==='complete'&&<span style={{fontSize:12,color:'#22c55e',fontWeight:600,flexShrink:0}}>Verified</span>}
        </div>
      ))}
    </div>
  </div>
</div>

<div className={`page ${activePage === 'mkt-my-bids' ? 'active' : ''}`} id="page-mkt-my-bids">
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Active Bids</div><div className="sc-v" style={{color:'#2563eb'}}>4</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Winning</div><div className="sc-v" style={{color:'#22c55e'}}>2</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Outbid</div><div className="sc-v" style={{color:'#ef4444'}}>2</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Won (YTD)</div><div className="sc-v">6</div></div>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">All Bids</span><span className="pn-a" onClick={()=>showPage('mkt-live-auctions')}>Browse Auctions</span></div>
    <div className="tw"><table><thead><tr><th>Unit</th><th>Bid Type</th><th>My Bid</th><th>High Bid</th><th>Status</th><th>Deadline</th></tr></thead><tbody>
      <tr><td>2023 Forest River Rockwood 2882WS</td><td>Auction</td><td>$41,000</td><td>$43,000</td><td><span className="bg denied">Outbid</span></td><td>Apr 27</td></tr>
      <tr><td>2022 Keystone Montana 3855BR</td><td>Auction</td><td>$67,000</td><td>$67,000</td><td><span className="bg active">Winning</span></td><td>Apr 28</td></tr>
      <tr><td>2024 Heartland Bighorn 3995FL</td><td>Offer</td><td>$88,000</td><td>—</td><td><span className="bg pending">Pending</span></td><td>Apr 30</td></tr>
      <tr><td>2023 Jayco Eagle HT 284BHOK</td><td>Auction</td><td>$72,000</td><td>$74,500</td><td><span className="bg denied">Outbid</span></td><td>Apr 26</td></tr>
    </tbody></table></div>
  </div>
</div>

<div className={`page ${activePage === 'mkt-escrow-payments' ? 'active' : ''}`} id="page-mkt-escrow-payments">
  <div style={{display:'grid',gridTemplateColumns:'1fr 1fr 1fr',gap:16,marginBottom:20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>In Escrow</div><div className="sc-v" style={{color:'#f59e0b'}}>$67,000</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Released (YTD)</div><div className="sc-v" style={{color:'#22c55e'}}>$241,500</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Transactions (YTD)</div><div className="sc-v">6</div></div>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Escrow Transactions</span></div>
    <div className="tw"><table><thead><tr><th>ESC #</th><th>Unit</th><th>Amount</th><th>Counterparty</th><th>Status</th><th>Date</th></tr></thead><tbody>
      <tr><td>ESC-0008</td><td>2022 Keystone Montana 3855BR</td><td style={{fontWeight:600}}>$67,000</td><td>Smith's RV (Buyer)</td><td><span className="bg pending">Held</span></td><td>Apr 28, 2026</td></tr>
      <tr><td>ESC-0007</td><td>2023 Forest River Rockwood</td><td style={{fontWeight:600}}>$43,000</td><td>Coast RV (Seller)</td><td><span className="bg active">Released</span></td><td>Apr 20, 2026</td></tr>
      <tr><td>ESC-0006</td><td>2021 Jayco Eagle HT</td><td style={{fontWeight:600}}>$59,500</td><td>Maple RV (Seller)</td><td><span className="bg active">Released</span></td><td>Mar 15, 2026</td></tr>
    </tbody></table></div>
  </div>
</div>

<div className={`page ${activePage === 'wo-new' ? 'active' : ''}`} id="page-wo-new">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('techflow')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">New Work Order</div><div className="detail-meta">Create a work order for your service department</div></div></div>
  <div className="pn"><div className="form-grid">
    <div className="form-group"><label>Unit</label><select><option>Select unit...</option><option>2024 Jayco Jay Flight 264BH</option><option>2024 Forest River Rockwood</option><option>2023 Keystone Montana</option><option>2022 Heartland Bighorn</option></select></div>
    <div className="form-group"><label>Assigned Technician</label><select><option>Unassigned</option><option>Mike T.</option><option>Jason R.</option><option>Carlos P.</option></select></div>
    <div className="form-group"><label>Priority</label><select><option>Normal</option><option>Urgent</option><option>Low</option></select></div>
    <div className="form-group"><label>Due Date</label><input type="date" /></div>
    <div className="form-group full"><label>Description</label><textarea placeholder="Describe the work to be done..."></textarea></div>
    <div className="form-group full"><label>Related Claim</label><select><option>None</option><option>CLM-0248 — Warranty</option><option>CLM-0246 — PDI</option></select></div>
  </div><div className="btn-bar"><button className="btn btn-p" onClick={() => { handleToast('Work order created'); showPage('techflow'); }}>Create Work Order</button><button className="btn btn-o" onClick={() => showPage('techflow')}>Cancel</button></div></div>
</div>

<div className={`page ${activePage === 'wo-detail' ? 'active' : ''}`} id="page-wo-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('techflow')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">WO-0041</div><div className="detail-meta">2024 Jayco Jay Flight · Slide-out seal replacement</div></div><span className="bg in-progress" style={{fontSize:13,padding:'6px 16px'}}>In Progress</span></div>
  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
    <div>
      <div className="pn" style={{marginBottom:16}}><div className="pn-h"><span className="pn-t">Work Details</span></div>
        <div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">2024 Jayco Jay Flight 264BH</span></div>
        <div className="cd-row"><span className="cd-label">Description</span><span className="cd-value">Slide-out seal replacement — full perimeter seal worn</span></div>
        <div className="cd-row"><span className="cd-label">Assigned To</span><span className="cd-value">Mike T.</span></div>
        <div className="cd-row"><span className="cd-label">Due</span><span className="cd-value">Apr 28, 2026</span></div>
        <div className="cd-row"><span className="cd-label">Related Claim</span><span className="cd-value cid" onClick={() => showPage('claim-detail')}>CLM-0248</span></div>
      </div>
      <div className="pn"><div className="pn-h"><span className="pn-t">Notes</span></div>
        <div style={{padding:'16px 20px',fontSize:13,color:'#555',lineHeight:1.6}}>Seal kit on order (PO-0038). Expected delivery Mar 18. Schedule repair after parts arrive.</div>
        <div style={{padding:'0 20px 16px'}}><textarea placeholder="Add a note..." style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:13,fontFamily:'inherit',minHeight:50,resize:'vertical',outline:'none'}}></textarea><div style={{textAlign:'right',marginTop:8}}><button className="btn btn-p btn-sm" onClick={() => handleToast('Note added')}>Add Note</button></div></div>
      </div>
    </div>
    <div><div className="cd-section"><div className="cd-section-h">Work Order Info</div><div className="cd-row"><span className="cd-label">WO #</span><span className="cd-value">WO-0041</span></div><div className="cd-row"><span className="cd-label">Created</span><span className="cd-value">Apr 22, 2026</span></div><div className="cd-row"><span className="cd-label">Priority</span><span className="cd-value">Normal</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg in-progress">In Progress</span></span></div></div>
      <div className="cd-section" style={{marginTop:12}}><div className="cd-section-h">Update Status</div><div style={{padding:'12px 16px',display:'flex',flexDirection:'column',gap:8}}><select style={{padding:'8px 12px',border:'1px solid #e0e0e0',borderRadius:6,fontSize:13,fontFamily:'inherit'}}><option>Open</option><option>In Progress</option><option>Waiting on Parts</option><option>Complete</option><option>Cancelled</option></select><button className="btn btn-p btn-sm" onClick={() => handleToast('Status updated')}>Update</button></div></div>
    </div>
  </div>
</div>

<div className={`page ${activePage === 'svc-fi-detail' ? 'active' : ''}`} id="page-svc-fi-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-fi')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">FI-0014 — Julie Fournier</div><div className="detail-meta">2024 FR Wildwood · 4 products recommended</div></div><span className="bg in-progress" style={{fontSize:13,padding:'6px 16px'}}>Recommending</span></div>
  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
    <div>
      <div className="pn" style={{marginBottom:16}}><div className="pn-h"><span className="pn-t">Recommended Products</span></div>
        <div className="tw"><table><thead><tr><th>Product</th><th>Price</th><th>Provider</th><th>Status</th></tr></thead><tbody>
          <tr><td style={{fontWeight:500}}>Extended Warranty — 5 Year</td><td>$2,450</td><td>Guardsman RV</td><td><span className="bg pending">Offered</span></td></tr>
          <tr><td style={{fontWeight:500}}>GAP Insurance</td><td>$395</td><td>DS360 Partner</td><td><span className="bg pending">Offered</span></td></tr>
          <tr><td style={{fontWeight:500}}>Tire & Wheel Protection</td><td>$295</td><td>DS360 Partner</td><td><span className="bg pending">Offered</span></td></tr>
          <tr><td style={{fontWeight:500}}>Paint & Fabric Protection</td><td>$599</td><td>Protekto</td><td><span className="bg pending">Offered</span></td></tr>
        </tbody></table></div></div>
      <div className="pn"><div className="pn-h"><span className="pn-t">Messages</span></div>
        <div className="comm-box"><div className="comm-msg"><div className="comm-avatar op">DS</div><div className="comm-content"><div className="comm-name">DS360 F&I Team</div><div className="comm-text">Recommendations ready for Julie Fournier. Extended warranty and GAP are the strongest fits based on unit value.</div><div className="comm-time">Mar 15, 9:00 AM</div></div></div></div>
        <div style={{padding:'16px 20px'}}><textarea placeholder="Message DS360 team..." style={{width:'100%',padding:'10px 12px',border:'1px solid #e0e0e0',borderRadius:8,fontSize:13,fontFamily:'inherit',minHeight:50,resize:'vertical',outline:'none'}}></textarea><div style={{textAlign:'right',marginTop:8}}><button className="btn btn-p btn-sm" onClick={() => handleToast('Message sent')}>Send</button></div></div>
      </div>
    </div>
    <div><div className="cd-section"><div className="cd-section-h">Deal Info</div><div className="cd-row"><span className="cd-label">Deal #</span><span className="cd-value">FI-0014</span></div><div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Julie Fournier</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">2024 FR Wildwood</span></div><div className="cd-row"><span className="cd-label">Products</span><span className="cd-value">4 offered</span></div><div className="cd-row"><span className="cd-label">Sold</span><span className="cd-value">—</span></div></div></div>
  </div>
</div>

<div className={`page ${activePage === 'svc-warranty-detail' ? 'active' : ''}`} id="page-svc-warranty-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-warranty')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">WP-0041 — Guardsman RV</div><div className="detail-meta">Robert Martin · 2024 Jayco Jay Flight · Comprehensive</div></div><span className="bg active" style={{fontSize:13,padding:'6px 16px'}}>Active</span></div>
  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
    <div className="pn"><div className="pn-h"><span className="pn-t">Coverage Details</span></div>
      <div className="cd-row"><span className="cd-label">Plan</span><span className="cd-value">Comprehensive — 5 Year</span></div>
      <div className="cd-row"><span className="cd-label">Provider</span><span className="cd-value">Guardsman RV</span></div>
      <div className="cd-row"><span className="cd-label">Start Date</span><span className="cd-value">Feb 10, 2026</span></div>
      <div className="cd-row"><span className="cd-label">Expiry</span><span className="cd-value">Feb 10, 2031</span></div>
      <div className="cd-row"><span className="cd-label">Deductible</span><span className="cd-value">$100 per claim</span></div>
      <div className="cd-row"><span className="cd-label">Claims Used</span><span className="cd-value">1 of unlimited</span></div>
      <div style={{padding:'16px 20px',fontSize:13,color:'#555',lineHeight:1.6}}><strong>Covered:</strong> Slide mechanisms, electrical systems, appliances, water systems, roof, HVAC, awnings, leveling systems.</div>
    </div>
    <div><div className="cd-section"><div className="cd-section-h">Plan Info</div><div className="cd-row"><span className="cd-label">Plan #</span><span className="cd-value">WP-0041</span></div><div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Robert Martin</span></div><div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily:'monospace',fontSize:12}}>...4K1</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg active">Active</span></span></div></div></div>
  </div>
</div>

<div className={`page ${activePage === 'svc-parts-det' ? 'active' : ''}`} id="page-svc-parts-det">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-parts')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">PO-0038</div><div className="detail-meta">CLM-0248 · Sidewall panel, adhesive, sealant</div></div><span className="bg new-req" style={{fontSize:13,padding:'6px 16px'}}>Sourcing</span></div>
  <div style={{display:'grid',gridTemplateColumns:'2fr 1fr',gap:20}}>
    <div className="pn"><div className="pn-h"><span className="pn-t">Order Items</span></div>
      <div className="tw"><table><thead><tr><th>Item</th><th>Qty</th><th>Part #</th><th>Status</th></tr></thead><tbody>
        <tr><td style={{fontWeight:500}}>Sidewall panel (2x3 section)</td><td>1</td><td>—</td><td><span className="bg new-req">Sourcing</span></td></tr>
        <tr><td style={{fontWeight:500}}>Panel adhesive (1 gal)</td><td>1</td><td>—</td><td><span className="bg new-req">Sourcing</span></td></tr>
        <tr><td style={{fontWeight:500}}>Lap sealant</td><td>2</td><td>—</td><td><span className="bg new-req">Sourcing</span></td></tr>
      </tbody></table></div>
    </div>
    <div><div className="cd-section"><div className="cd-section-h">Order Info</div><div className="cd-row"><span className="cd-label">Order #</span><span className="cd-value">PO-0038</span></div><div className="cd-row"><span className="cd-label">Related Claim</span><span className="cd-value cid" onClick={() => showPage('claim-detail')}>CLM-0248</span></div><div className="cd-row"><span className="cd-label">Submitted</span><span className="cd-value">Mar 16, 2026</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg new-req">Sourcing</span></span></div><div className="cd-row"><span className="cd-label">ETA</span><span className="cd-value">—</span></div></div></div>
  </div>
</div>
<DealerMarketplacePages activePage={activePage} showPage={showPage} />
<DealerShowcasePages activePage={activePage} showPage={showPage} />

<div className={`page ${activePage === 'svc-dispatch' ? 'active' : ''}`} id="page-svc-dispatch">
  <DispatchBoard canDrag={isDealerOwner || isShopManager} canEditNotes={isDealerOwner || isDealerStaff || isServiceManager || isShopManager} />
</div>

<div className={`page ${activePage === 'svc-technicians' ? 'active' : ''}`} id="page-svc-technicians">
  <div style={{display:'grid',gridTemplateColumns:'repeat(4,1fr)',gap:16,marginBottom:20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Active Techs</div><div className="sc-v" style={{color:'#22c55e'}}>3</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>On Leave</div><div className="sc-v" style={{color:'#f59e0b'}}>0</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>WOs Assigned Today</div><div className="sc-v" style={{color:'#2563eb'}}>7</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom:8}}>Avg. Completion Rate</div><div className="sc-v">94%</div></div>
  </div>
  <div className="pn">
    <div className="pn-h"><span className="pn-t">Technicians</span><button className="btn btn-p" style={{fontSize:12,padding:'6px 14px'}} onClick={() => handleToast('Invite sent to technician')}>+ Add Technician</button></div>
    <div className="tw"><table><thead><tr><th>Name</th><th>Specialty</th><th>Active WOs</th><th>Completed (MTD)</th><th>Status</th><th></th></tr></thead><tbody>
      <tr><td style={{fontWeight:500}}>Mike T.</td><td>Electrical / Slides</td><td>2</td><td>12</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-dispatch')}>View Schedule</button></td></tr>
      <tr><td style={{fontWeight:500}}>Jason R.</td><td>Warranty Repair</td><td>2</td><td>9</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-dispatch')}>View Schedule</button></td></tr>
      <tr><td style={{fontWeight:500}}>Carlos P.</td><td>PDI / Inspections</td><td>1</td><td>14</td><td><span className="bg active">Active</span></td><td><button className="btn btn-o btn-sm" onClick={() => showPage('svc-dispatch')}>View Schedule</button></td></tr>
    </tbody></table></div>
  </div>
</div>




</div>
</div>
    {toastVisible && (
      <div style={{position:'fixed',bottom:24,left:'50%',transform:'translateX(-50%)',background:'#1a1a2e',color:'white',padding:'10px 20px',borderRadius:8,fontSize:13,fontWeight:500,zIndex:9999,boxShadow:'0 4px 12px rgba(0,0,0,0.3)',pointerEvents:'none'}}>
        {toastMsg}
      </div>
    )}
    <MobileBottomNav portalType="dealer" activePage={activePage} onNavigate={showPage} parents={parents} />
    <OfflineBanner />
    </>
  );
}
