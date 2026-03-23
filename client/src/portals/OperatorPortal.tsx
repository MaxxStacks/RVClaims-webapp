// OperatorPortal.tsx - Converted from operator-portal.html
// Layout: sidebar(position:fixed) + main(margin-left:240px) + content(block) + page(display:block)
// DO NOT modify layout structure. DO NOT add display:flex to .content.

import { useState, useEffect, useRef } from 'react';
import ds360Icon from '@assets/ds360_favicon.png';
import { MobileBottomNav, OfflineBanner } from '../components/MobileBottomNav';
import { OperatorMarketplacePages } from '../components/OperatorMarketplace';
import { OperatorPublicAuctionPages } from '../components/PublicAuctionPages';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { wsClient } from '@/lib/websocket';

export default function OperatorPortal() {
  const [activePage, setActivePage] = useState('dashboard');
  const [pageTitle, setPageTitle] = useState('Dashboard');
  const [pageSub, setPageSub] = useState('Overview');
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [lang, setLang] = useState(() => localStorage.getItem('ds360-lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en'));

  const [dealerTab, setDealerTab] = useState('d-batches');
  const [unitTab, setUnitTab] = useState('u-specs');
  const [settingsTab, setSettingsTab] = useState('s-profile');
  const [clTab, setClTab] = useState('cl-current');
  const [unitEditMode, setUnitEditMode] = useState(false);
  const toggleUnitEdit = () => setUnitEditMode(prev => !prev);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);

  // ─── Auth ──────────────────────────────────────────────────────────────────
  const { user, logout } = useAuth();

  // ─── API data state ────────────────────────────────────────────────────────
  const [opClaims, setOpClaims] = useState<any[]>([]);
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [opUnits, setOpUnits] = useState<any[]>([]);
  const [opBatches, setOpBatches] = useState<any[]>([]);
  const [opInvoices, setOpInvoices] = useState<any[]>([]);
  const [opUsers, setOpUsers] = useState<any[]>([]);
  const [opNotifications, setOpNotifications] = useState<any[]>([]);
  const [opProducts, setOpProducts] = useState<any[]>([]);
  const [opFeatureRequests, setOpFeatureRequests] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  // ─── Add-dealer form state ─────────────────────────────────────────────────
  const [addDealerForm, setAddDealerForm] = useState({ name: '', contactName: '', email: '', phone: '', street: '', city: '', plan: 'plan_a' });
  const [addDealerSaving, setAddDealerSaving] = useState(false);

  // ─── Add-unit form state ───────────────────────────────────────────────────
  const [addUnitForm, setAddUnitForm] = useState({ vin: '', year: '', manufacturer: '', model: '', stockNumber: '', dealershipId: '' });
  const [addUnitSaving, setAddUnitSaving] = useState(false);

  // ─── Selected IDs for detail pages ────────────────────────────────────────
  const [selectedClaimId, setSelectedClaimId] = useState<string | null>(null);
  const [selectedDealerId, setSelectedDealerId] = useState<string | null>(null);
  const [selectedUnitId, setSelectedUnitId] = useState<string | null>(null);
  const [selectedBatchId, setSelectedBatchId] = useState<string | null>(null);
  const [selectedClaimDetail, setSelectedClaimDetail] = useState<any | null>(null);
  const [selectedDealerDetail, setSelectedDealerDetail] = useState<any | null>(null);

  const titles: Record<string, [string, string]> = {dashboard:['Dashboard','Overview'],queue:['Processing Queue','12 photo batches'],'batch-review':['Photo Review','BATCH-0048'],claims:['All Claims','248 total'],'claim-detail':['Claim Detail','CLM-2026-0248'],stale:['Stale Claims','5 claims 36+ hours'],dealers:['Dealer Management','24 active'],
'add-dealer':['Add New Dealer','Create dealership'],'dealer-detail':['Smith\u0027s RV Centre','Plan A \u00b7 $349/mo'],units:['Unit Inventory','74 units'],'add-unit':['Add New Unit','Register unit'],'unit-detail':['2024 Jayco Jay Flight 264BH','VIN: 1UJBJ0BN8M1TJ4K1'],frc:['FRC Codes','Manufacturer codes'],
marketplace:['Service Marketplace','Manage services'],'svc-financing':['Financing Services','3 active'],'svc-financing-detail':['FIN-0023','Daniel Tremblay'],'svc-financing-new':['New Financing Request','Submit for dealer'],
'svc-fi':['F\u0026I Services','2 active'],'svc-fi-detail':['FI-0014','Julie Fournier'],'svc-fi-new':['New F\u0026I Deal','Flag for products'],
'svc-warranty':['Warranty Plans','14 active'],'svc-warranty-new':['Add Warranty Plan','Register or sell'],
'svc-parts':['Parts \u0026 Accessories','8 orders'],'svc-parts-detail':['PO-0038','Smith\u0027s RV'],'svc-parts-new':['New Parts Order','Request parts'],
'mkt-members':['Marketplace Members','28 dealers'],'mkt-member-detail':['Member Detail','Dealer verification'],'mkt-member-signup':['New Application','Review & approve'],'mkt-listings':['All Listings','142 active'],'mkt-listing-detail':['Listing Detail','Unit details'],'mkt-transactions':['Transactions','Escrow & commissions'],'mkt-transaction-detail':['Transaction Detail','Escrow tracking'],'mkt-auctions':['Live Auctions','Manage auctions'],'mkt-auction-detail':['Auction Detail','Bidding & settlement'],'mkt-public-events':['Public Auction Events','Monthly public sales'],'mkt-public-event-detail':['Event Detail','Manage showcase'],
billing:['Billing \u0026 Invoices','Revenue tracking'],products:['Products \u0026 Services','Billable items'],'add-product':['Add Product / Service','Create item'],'edit-product':['Edit Product / Service','Modify item'],'create-invoice':['Create Invoice','New invoice'],reports:['Revenue Reports','Analytics'],notifications:['Notifications','Compose'],users:['Users \u0026 Roles','Manage users'],settings:['Settings','Platform config'],changelog:['Changelog','Version history \u0026 roadmap'],'add-feature-req':['Feature Request','Submit new request']};

  const parents: Record<string, string> = {'dealer-detail':'dealers','claim-detail':'claims','batch-review':'queue','unit-detail':'units','add-dealer':'dealers','add-unit':'units','create-invoice':'billing','add-product':'products','edit-product':'products','add-feature-req':'changelog','svc-financing-detail':'svc-financing','svc-financing-new':'svc-financing','svc-fi-detail':'svc-fi','svc-fi-new':'svc-fi','svc-warranty-new':'svc-warranty','svc-parts-detail':'svc-parts','svc-parts-new':'svc-parts','mkt-member-detail':'mkt-members','mkt-member-signup':'mkt-members','mkt-listing-detail':'mkt-listings','mkt-transaction-detail':'mkt-transactions','mkt-auction-detail':'mkt-auctions','mkt-public-event-detail':'mkt-public-events'};

  useEffect(() => { if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark'); }, []);

  // ─── Data fetching keyed on activePage ─────────────────────────────────────
  useEffect(() => {
    setDataError(null);
    const fetch = async () => {
      try {
        if (activePage === 'dashboard') {
          const [cd, dd] = await Promise.all([
            apiFetch<any>('/api/claims'),
            apiFetch<any>('/api/dealerships'),
          ]);
          setOpClaims(cd.claims || []);
          setOpDealers(dd.dealerships || []);
        } else if (activePage === 'claims' || activePage === 'stale') {
          const d = await apiFetch<any>('/api/claims');
          setOpClaims(d.claims || []);
        } else if (activePage === 'claim-detail' && selectedClaimId) {
          const d = await apiFetch<any>(`/api/claims/${selectedClaimId}`);
          setSelectedClaimDetail(d.claim || null);
        } else if (activePage === 'dealers') {
          const d = await apiFetch<any>('/api/dealerships');
          setOpDealers(d.dealerships || []);
        } else if (activePage === 'dealer-detail' && selectedDealerId) {
          const d = await apiFetch<any>(`/api/dealerships/${selectedDealerId}`);
          setSelectedDealerDetail(d.dealership || null);
        } else if (activePage === 'units') {
          const d = await apiFetch<any>('/api/units');
          setOpUnits(d.units || []);
        } else if (activePage === 'queue') {
          const d = await apiFetch<any>('/api/batches?status=uploaded');
          setOpBatches(d.batches || []);
        } else if (activePage === 'billing') {
          const d = await apiFetch<any>('/api/invoices');
          setOpInvoices(d.invoices || []);
        } else if (activePage === 'users') {
          const d = await apiFetch<any>('/api/users');
          setOpUsers(d.users || []);
        } else if (activePage === 'notifications') {
          const d = await apiFetch<any>('/api/notifications');
          setOpNotifications(d.notifications || []);
        } else if (activePage === 'products') {
          const d = await apiFetch<any>('/api/products');
          setOpProducts(d.products || []);
        } else if (activePage === 'changelog') {
          const d = await apiFetch<any>('/api/feature-requests');
          setOpFeatureRequests(d.featureRequests || []);
        }
      } catch (err: any) {
        setDataError(err?.message || 'Failed to load data');
      }
    };
    fetch();
  }, [activePage, selectedClaimId, selectedDealerId]);

  // ─── WebSocket: live updates ────────────────────────────────────────────────
  useEffect(() => {
    wsClient.connect();
    const unsubClaim = wsClient.on('claim:updated', () => {
      if (activePage === 'claims' || activePage === 'dashboard') {
        apiFetch<any>('/api/claims').then(d => setOpClaims(d.claims || [])).catch(() => {});
      }
    });
    const unsubBatch = wsClient.on('batch:uploaded', () => {
      if (activePage === 'queue') {
        apiFetch<any>('/api/batches?status=uploaded').then(d => setOpBatches(d.batches || [])).catch(() => {});
      }
    });
    return () => { unsubClaim(); unsubBatch(); };
  }, [activePage]);

  // ─── Form submit handlers ──────────────────────────────────────────────────
  const handleCreateDealer = async () => {
    if (!addDealerForm.name || !addDealerForm.email) return;
    setAddDealerSaving(true);
    try {
      await apiFetch('/api/dealerships', {
        method: 'POST',
        body: JSON.stringify({
          name: addDealerForm.name,
          email: addDealerForm.email,
          contactName: addDealerForm.contactName,
          phone: addDealerForm.phone,
          street: addDealerForm.street,
          city: addDealerForm.city,
          plan: addDealerForm.plan,
          status: 'pending',
        }),
      });
      setAddDealerForm({ name: '', contactName: '', email: '', phone: '', street: '', city: '', plan: 'plan_a' });
      const d = await apiFetch<any>('/api/dealerships');
      setOpDealers(d.dealerships || []);
      showPage('dealers');
    } catch { /* ignore */ } finally {
      setAddDealerSaving(false);
    }
  };

  const handleCreateUnit = async () => {
    if (!addUnitForm.vin || !addUnitForm.dealershipId) return;
    setAddUnitSaving(true);
    try {
      await apiFetch('/api/units', {
        method: 'POST',
        body: JSON.stringify({
          vin: addUnitForm.vin,
          year: addUnitForm.year ? parseInt(addUnitForm.year) : undefined,
          manufacturer: addUnitForm.manufacturer,
          model: addUnitForm.model,
          stockNumber: addUnitForm.stockNumber,
          dealershipId: addUnitForm.dealershipId,
        }),
      });
      setAddUnitForm({ vin: '', year: '', manufacturer: '', model: '', stockNumber: '', dealershipId: '' });
      const d = await apiFetch<any>('/api/units');
      setOpUnits(d.units || []);
      showPage('units');
    } catch { /* ignore */ } finally {
      setAddUnitSaving(false);
    }
  };

  const handleApproveDealership = async (id: string) => {
    try {
      await apiFetch(`/api/dealerships/${id}`, { method: 'PUT', body: JSON.stringify({ status: 'active' }) });
      const d = await apiFetch<any>('/api/dealerships');
      setOpDealers(d.dealerships || []);
    } catch { /* ignore */ }
  };

  const handleMarkNotificationRead = async (id: string) => {
    try {
      await apiFetch(`/api/notifications/${id}/read`, { method: 'PUT' });
      setOpNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
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


  // File upload: operator profile photo
  const updateOpProfile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const avatar = document.getElementById('op-profile-avatar');
      if (avatar) avatar.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />';
      const userAvatar = document.getElementById('op-user-avatar');
      if (userAvatar) userAvatar.innerHTML = '<img src="' + src + '" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />';
    };
    reader.readAsDataURL(file);
  };

  // File upload: unit photo
  const updateOpUnitPhoto = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (ev) => {
      const src = ev.target?.result as string;
      const img = document.getElementById('op-unit-photo-img') as HTMLImageElement;
      if (img) { img.src = src; img.style.display = 'block'; }
      const ph = document.getElementById('op-unit-photo-ph');
      if (ph) ph.style.display = 'none';
    };
    reader.readAsDataURL(file);
  };

  // Invoice builder: add service/subscription row
  const addServiceRow = () => {
    const tbody = document.getElementById('inv-lines');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = '<td style="padding:14px 16px"><select style="width:100%;padding:8px 10px;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;font-family:inherit;background:#fafafa;margin-bottom:6px"><option>Select item...</option><optgroup label="Subscriptions"><option>Plan A Monthly Subscription</option><option>Plan B Wallet Top-Up</option></optgroup><optgroup label="Claim Fees"><option>Claim Processing Fee (10%)</option><option>DAF Inspection Fee</option><option>PDI Processing Fee</option></optgroup><optgroup label="Service Add-ons"><option>Financing Services</option><option>F&amp;I Services</option><option>Parts &amp; Accessories</option></optgroup></select><input placeholder="Add description..." style="width:100%;padding:6px 10px;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;font-family:inherit;background:#fafafa"></td><td style="text-align:center;padding:14px 8px"><input value="1" style="width:50px;padding:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;text-align:center;font-family:inherit"></td><td style="text-align:right;padding:14px 8px"><input placeholder="0.00" style="width:90px;padding:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;text-align:right;font-family:inherit"></td><td style="text-align:right;padding:14px 16px;font-weight:600;font-size:13px">$0.00</td><td style="padding:14px 8px;text-align:center"><button style="background:none;border:none;color:#ccc;cursor:pointer;font-size:18px">&times;</button></td>';
    tbody.appendChild(tr);
    const btn = tr.querySelector('button');
    if (btn) btn.addEventListener('click', () => tr.remove());
  };

  // Invoice builder: add part search row
  const addPartRow = () => {
    const tbody = document.getElementById('inv-lines');
    if (!tbody) return;
    const tr = document.createElement('tr');
    tr.innerHTML = '<td style="padding:14px 16px"><div style="position:relative"><input placeholder="Search parts..." style="width:100%;padding:8px 10px 8px 30px;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;font-family:inherit;background:#fafafa;margin-bottom:6px"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" stroke-width="2" style="position:absolute;left:10px;top:10px"><circle cx="11" cy="11" r="8"></circle><line x1="21" y1="21" x2="16.65" y2="16.65"></line></svg></div><input placeholder="Add description..." style="width:100%;padding:6px 10px;border:1px solid #e0e0e0;border-radius:6px;font-size:12px;font-family:inherit;background:#fafafa"></td><td style="text-align:center;padding:14px 8px"><input value="1" style="width:50px;padding:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;text-align:center;font-family:inherit"></td><td style="text-align:right;padding:14px 8px"><input placeholder="0.00" style="width:90px;padding:8px;border:1px solid #e0e0e0;border-radius:6px;font-size:13px;text-align:right;font-family:inherit"></td><td style="text-align:right;padding:14px 16px;font-weight:600;font-size:13px">$0.00</td><td style="padding:14px 8px;text-align:center"><button style="background:none;border:none;color:#ccc;cursor:pointer;font-size:18px">&times;</button></td>';
    tbody.appendChild(tr);
    const btn = tr.querySelector('button');
    if (btn) btn.addEventListener('click', () => tr.remove());
  };

  return (
    <>
<nav className={`sidebar${sidebarCollapsed ? ' collapsed' : ''}`}>
  <div className="sidebar-logo"><img src={ds360Icon} width="36" height="36" style={{borderRadius:8}} alt="DS360" /><div className="sidebar-logo-text"><div className="sidebar-logo-sub" style={{fontSize:12,fontWeight:600}}>Command Centre</div></div><span className="sidebar-badge">Operator</span></div>
  <div className="sidebar-nav">
    <div className="nav-section"><div className="nav-label">Overview</div>
      <div className={`nav-item ${isNavActive('dashboard') ? 'active' : ''}`} onClick={() => showPage('dashboard')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>Dashboard</div></div>
    <div className="nav-section"><div className="nav-label">Claims</div>
      <div className={`nav-item ${isNavActive('queue') ? 'active' : ''}`} onClick={() => showPage('queue')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 12h-4l-3 9L9 3l-3 9H2"/></svg>Processing Queue<span className="nb red">12</span></div>
      <div className={`nav-item ${isNavActive('claims') ? 'active' : ''}`} onClick={() => showPage('claims')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg>All Claims<span className="nb blue">248</span></div>
      <div className={`nav-item ${isNavActive('stale') ? 'active' : ''}`} onClick={() => showPage('stale')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>Stale Claims<span className="nb amber">5</span></div></div>
    <div className="nav-section"><div className="nav-label">Management</div>
      <div className={`nav-item ${isNavActive('dealers') ? 'active' : ''}`} onClick={() => showPage('dealers')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>Dealers<span className="nb amber">3</span></div>
      <div className={`nav-item ${isNavActive('units') ? 'active' : ''}`} onClick={() => showPage('units')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>Units</div>
      <div className={`nav-item ${isNavActive('frc') ? 'active' : ''}`} onClick={() => showPage('frc')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="16 18 22 12 16 6"/><polyline points="8 6 2 12 8 18"/></svg>FRC Codes</div></div>
    <div className="nav-section"><div className="nav-label">Services</div>
      <div className={`nav-item ${isNavActive('marketplace') ? 'active' : ''}`} onClick={() => showPage('marketplace')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/><path d="M12 12v3"/></svg>Service Marketplace</div>
      <div className={`nav-item ${isNavActive('svc-financing') ? 'active' : ''}`} onClick={() => showPage('svc-financing')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Financing<span className="nb green">3</span></div>
      <div className={`nav-item ${isNavActive('svc-fi') ? 'active' : ''}`} onClick={() => showPage('svc-fi')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>F&I Services<span className="nb green">2</span></div>
      <div className={`nav-item ${isNavActive('svc-warranty') ? 'active' : ''}`} onClick={() => showPage('svc-warranty')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg>Warranty Plans<span className="nb blue">14</span></div>
      <div className={`nav-item ${isNavActive('svc-parts') ? 'active' : ''}`} onClick={() => showPage('svc-parts')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts & Accessories<span className="nb blue">8</span></div></div>
    <div className="nav-section"><div className="nav-label">Marketplace</div>
      <div className={`nav-item ${isNavActive('mkt-members') ? 'active' : ''}`} onClick={() => showPage('mkt-members')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>Members<span className="nb blue">28</span></div>
      <div className={`nav-item ${isNavActive('mkt-listings') ? 'active' : ''}`} onClick={() => showPage('mkt-listings')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/></svg>Listings<span className="nb green">142</span></div>
      <div className={`nav-item ${isNavActive('mkt-transactions') ? 'active' : ''}`} onClick={() => showPage('mkt-transactions')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Transactions</div>
      <div className={`nav-item ${isNavActive('mkt-auctions') ? 'active' : ''}`} onClick={() => showPage('mkt-auctions')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg>Live Auctions<span className="nb amber">3</span></div>
      <div className={`nav-item ${isNavActive('mkt-public-events') ? 'active' : ''}`} onClick={() => showPage('mkt-public-events')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>Public Auctions<span className="nb blue">14</span></div>
    </div>
    <div className="nav-section"><div className="nav-label">Finance</div>
      <div className={`nav-item ${isNavActive('billing') ? 'active' : ''}`} onClick={() => showPage('billing')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg>Billing & Invoices</div>
      <div className={`nav-item ${isNavActive('products') ? 'active' : ''}`} onClick={() => showPage('products')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4z"/><line x1="3" y1="6" x2="21" y2="6"/><path d="M16 10a4 4 0 01-8 0"/></svg>Products & Services</div>
      <div className={`nav-item ${isNavActive('reports') ? 'active' : ''}`} onClick={() => showPage('reports')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Revenue Reports</div></div>
    <div className="nav-section"><div className="nav-label">System</div>
      <div className={`nav-item ${isNavActive('notifications') ? 'active' : ''}`} onClick={() => showPage('notifications')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>Notifications</div>
      <div className={`nav-item ${isNavActive('users') ? 'active' : ''}`} onClick={() => showPage('users')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg>Users & Roles</div>
      <div className={`nav-item ${isNavActive('settings') ? 'active' : ''}`} onClick={() => showPage('settings')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"/></svg>Settings</div>
      <div className={`nav-item ${isNavActive('changelog') ? 'active' : ''}`} onClick={() => showPage('changelog')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Changelog</div></div>
  </div>
  <div className="sidebar-footer"><div className="user-info" style={{cursor: 'pointer'}} onClick={() => showPage('settings')}><div className="user-avatar" id="op-user-avatar">JD</div><div><div className="user-name">Jonathan D.</div><div className="user-role">Operator Admin</div></div></div><button onClick={async () => { await logout(); window.location.href = '/'; }} style={{width:'100%',marginTop:8,padding:'7px 12px',background:'none',border:'1px solid #e0e0e0',borderRadius:6,fontSize:12,color:'#888',cursor:'pointer',fontFamily:'inherit',textAlign:'left' as const,display:'flex',alignItems:'center',gap:6}}><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4"/><polyline points="16 17 21 12 16 7"/><line x1="21" y1="12" x2="9" y2="12"/></svg>Sign Out</button></div>
</nav>
<div className={`main${sidebarCollapsed ? ' collapsed-main' : ''}`}>
<header className="header"><div className="header-left"><button className="hbtn" onClick={() => setSidebarCollapsed(c => !c)} title="Toggle sidebar" style={{flexShrink:0}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="3" y1="6" x2="21" y2="6"/><line x1="3" y1="12" x2="21" y2="12"/><line x1="3" y1="18" x2="21" y2="18"/></svg></button><img src={ds360Icon} width="28" height="28" style={{borderRadius:6,flexShrink:0,marginRight:4}} alt="DS360" /><div><div className="header-title" id="page-title">{pageTitle}</div><div className="header-sub" id="page-sub">{pageSub}</div></div></div><div className="header-right"><div className="lang-toggle" id="lang-toggle"><button className={`lang-btn-opt ${lang === "en" ? "active" : ""}`} id="lang-en" onClick={() => handleSetLang('en')}>EN</button><button className={`lang-btn-opt ${lang === "fr" ? "active" : ""}`} id="lang-fr" onClick={() => handleSetLang('fr')}>FR</button></div><button className="theme-toggle" onClick={() => toggleTheme()} id="theme-btn" title="Toggle dark mode"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button><button className="hbtn" title="Search"><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg></button><button className="hbtn" title="Notifications" onClick={() => showPage('notifications')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg><span className="ndot"></span></button></div></header>
<div className="content">


<div className={`page ${activePage === 'dashboard' ? 'active' : ''}`} id="page-dashboard">
  <div className="al-g">
    <div className="al"><div className="al-i ur"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div className="al-c"><div className="al-t">3 dealers pending approval</div><div className="al-d">New signups awaiting verification</div></div><span className="al-a" onClick={() => showPage('dealers')}>Review</span></div>
    <div className="al"><div className="al-i wa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div className="al-c"><div className="al-t">5 stale claims</div><div className="al-d">No update in 36+ hours</div></div><span className="al-a" onClick={() => showPage('stale')}>View</span></div>
    <div className="al"><div className="al-i in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div className="al-c"><div className="al-t">12 photo batches in queue</div><div className="al-d">Awaiting review & FRC sorting</div></div><span className="al-a" onClick={() => showPage('queue')}>Process</span></div>
  </div>
  <div className="stats-grid">
    <div className="sc"><div className="sc-h"><span className="sc-l">Active Claims</span><div className="sc-i bl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg></div></div><div className="sc-v">87</div><div className="sc-c up">+12%</div></div>
    <div className="sc"><div className="sc-h"><span className="sc-l">Approval Rate</span><div className="sc-i gr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div></div><div className="sc-v">94.2%</div><div className="sc-c up">+1.3%</div></div>
    <div className="sc"><div className="sc-h"><span className="sc-l">Revenue (MTD)</span><div className="sc-i pu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div></div><div className="sc-v">$42.8K</div><div className="sc-c up">+8%</div></div>
    <div className="sc"><div className="sc-h"><span className="sc-l">Active Dealers</span><div className="sc-i am"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div></div><div className="sc-v">24</div><div className="sc-c up">+3 new</div></div>
    <div className="sc"><div className="sc-h"><span className="sc-l">Service Requests</span><div className="sc-i re"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg></div></div><div className="sc-v">19</div><div className="sc-c up">Financing, F&I, Parts</div></div>
  </div>
  <div className="qg">
    <div className="qb" onClick={() => showPage('queue')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span className="qb-t">Process Batch</span></div>
    <div className="qb" onClick={() => showPage('add-dealer')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg><span className="qb-t">Add Dealer</span></div>
    <div className="qb" onClick={() => showPage('notifications')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg><span className="qb-t">Send Notification</span></div>
    <div className="qb" onClick={() => showPage('create-invoice')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg><span className="qb-t">Create Invoice</span></div>
  </div>
  <div className="pg pg-2">
    <div className="pn"><div className="pn-h"><span className="pn-t">Recent Claims</span><span className="pn-a" onClick={() => showPage('claims')}>View all</span></div><div className="tw"><table><thead><tr><th>Claim #</th><th>Dealer</th><th>Mfr</th><th>Type</th><th>Status</th><th>Submitted</th></tr></thead><tbody>
      {opClaims.length === 0 ? (
        <tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : 'No claims yet'}</td></tr>
      ) : opClaims.slice(0,4).map((c: any) => (
        <tr key={c.id}><td><span className="cid" onClick={() => { setSelectedClaimId(c.id); showPage('claim-detail'); }}>{c.claimNumber}</span></td><td>{c.dealershipId?.slice(0,8)}…</td><td><span className="mfr">{c.manufacturer}</span></td><td>{c.type}</td><td><span className={`bg ${c.status?.replace('_','-')}`}>{c.status}</span></td><td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : new Date(c.createdAt).toLocaleDateString()}</td></tr>
      ))}
    </tbody></table></div></div>
    <div className="pn"><div className="pn-h"><span className="pn-t">Activity</span></div><div className="act">
      <div className="act-i"><span className="act-dot new"></span><div><div className="act-t"><strong>Smith's RV</strong> uploaded 24 photos (Jayco warranty)</div><div className="act-tm">2 hours ago</div></div></div>
      <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t">Jayco <strong>authorized</strong> 3 FRC lines on CLM-0241</div><div className="act-tm">3 hours ago</div></div></div>
      <div className="act-i"><span className="act-dot pay"></span><div><div className="act-t"><strong>Financing approved</strong> for Atlantic RV — $42,500</div><div className="act-tm">5 hours ago</div></div></div>
      <div className="act-i"><span className="act-dot pt"></span><div><div className="act-t">Parts order <strong>PO-0034</strong> shipped from Forest River</div><div className="act-tm">Yesterday</div></div></div>
      <div className="act-i"><span className="act-dot new"></span><div><div className="act-t"><strong>Maple Leaf RV</strong> signed up — pending</div><div className="act-tm">2 days ago</div></div></div>
    </div></div>
  </div>
</div>


<div className={`page ${activePage === 'queue' ? 'active' : ''}`} id="page-queue">
  <div style={{padding: '14px 0 20px', fontSize: 13, color: '#666', display: 'flex', alignItems: 'center', gap: 8}}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>Dealers upload photos in bulk. You review, sort into issues, assign FRC codes, and build the claim.</div>
  <div className="pn"><div className="pn-h"><span className="pn-t">Incoming Photo Batches</span><span style={{fontSize: 12, color: '#888'}}>12 awaiting</span></div>
    <div className="filter-bar"><input type="text" placeholder="Search by VIN or dealer..." /><select><option>All Manufacturers</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select><select><option>All Types</option><option>DAF</option><option>PDI</option><option>Warranty</option><option>Extended</option></select></div>
    <div className="tw"><table><thead><tr><th>Batch</th><th>Dealer</th><th>VIN</th><th>Mfr</th><th>Type</th><th>Photos</th><th>Dealer Notes</th><th>Uploaded</th><th>Action</th></tr></thead><tbody>
      {opBatches.length === 0 ? (
        <tr><td colSpan={9} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : 'No batches in queue'}</td></tr>
      ) : opBatches.map((b: any) => (
        <tr key={b.id}><td style={{fontWeight:500,color:'var(--brand)'}}>{b.batchNumber}</td><td>{b.dealershipId?.slice(0,8)}…</td><td><span className="vin">{b.unitId?.slice(0,8)}…</span></td><td><span className="mfr">{b.claimType}</span></td><td>{b.claimType}</td><td><strong>{b.photoCount || 0}</strong></td><td style={{maxWidth:200,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap',color:'#666',fontSize:12}}>{b.dealerNotes || '—'}</td><td>{new Date(b.createdAt).toLocaleDateString()}</td><td><button className="btn btn-p btn-sm" onClick={() => { setSelectedBatchId(b.id); showPage('batch-review'); }}>Review & Sort</button></td></tr>
      ))}
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'batch-review' ? 'active' : ''}`} id="page-batch-review">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('queue')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">BATCH-0048 — Photo Review</div><div className="detail-meta">Smith's RV Centre · Jayco · VIN: 1UJBJ0BN8M1TJ4K1 · Warranty · 24 photos</div></div><button className="btn btn-s btn-sm">Create Claim from Groups</button></div>
  <div style={{display: 'grid', gridTemplateColumns: '1fr 340px', gap: 20}}>
    <div>
      <div className="pn" style={{marginBottom: 16}}><div style={{padding: '16px 20px', display: 'flex', gap: 12}}><svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2" style={{flexShrink: 0, marginTop: 2}}><path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/></svg><div><div style={{fontSize: 12, fontWeight: 600, marginBottom: 4}}>Dealer's Note</div><div style={{fontSize: 13, color: '#555', lineHeight: '1.5'}}>"Sidewall damage passenger side, roof leak near front vent, slide-out seal torn 18 inches, kitchen cabinet hinge broken."</div></div></div></div>
      <div style={{background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: 8, padding: '14px 20px', marginBottom: 16, display: 'flex', alignItems: 'center', gap: 12}}><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/></svg><div style={{flex: 1}}><div style={{fontSize: 13, fontWeight: 600, color: '#1e40af'}}>AI detected 4 issues</div><div style={{fontSize: 12, color: '#3b82f6'}}>Suggested groups below. Drag photos between groups.</div></div><button className="btn btn-o btn-sm" style={{borderColor: '#93c5fd', color: '#2563eb'}}>Apply Suggestions</button></div>
      <div className="pn"><div className="pn-h"><span className="pn-t">All Photos (24)</span><span style={{fontSize: 12, color: '#888'}}>Click to assign</span></div>
        <div style={{padding: '16px 20px', display: 'grid', gridTemplateColumns: 'repeat(8,1fr)', gap: 6}}>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', position: 'relative', cursor: 'pointer'}}><span style={{position: 'absolute', top: 3, left: 3, background: '#ef4444', color: 'white', fontSize: 8, padding: '1px 4px', borderRadius: 3}}>1</span>001</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', position: 'relative', cursor: 'pointer'}}><span style={{position: 'absolute', top: 3, left: 3, background: '#ef4444', color: 'white', fontSize: 8, padding: '1px 4px', borderRadius: 3}}>1</span>002</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', position: 'relative', cursor: 'pointer'}}><span style={{position: 'absolute', top: 3, left: 3, background: '#3b82f6', color: 'white', fontSize: 8, padding: '1px 4px', borderRadius: 3}}>2</span>003</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', position: 'relative', cursor: 'pointer'}}><span style={{position: 'absolute', top: 3, left: 3, background: '#22c55e', color: 'white', fontSize: 8, padding: '1px 4px', borderRadius: 3}}>3</span>004</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', position: 'relative', cursor: 'pointer'}}><span style={{position: 'absolute', top: 3, left: 3, background: '#a855f7', color: 'white', fontSize: 8, padding: '1px 4px', borderRadius: 3}}>4</span>005</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', cursor: 'pointer'}}>006</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', cursor: 'pointer'}}>...</div>
          <div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888', cursor: 'pointer'}}>024</div>
        </div></div>
    </div>
    <div>
      <div style={{fontSize: 14, fontWeight: 600, marginBottom: 12}}>Issue Groups → FRC Lines</div>
      <div style={{background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 12, borderLeft: '3px solid #ef4444', padding: '14px 16px'}}><div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}><span style={{background: '#ef4444', color: 'white', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4}}>1</span><span style={{fontSize: 13, fontWeight: 600}}>Delamination, Sidewall</span></div><select style={{width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', marginBottom: 6}}><option>JC-WAR-1042 (2.5 hrs)</option></select><textarea style={{width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', minHeight: 36, resize: 'vertical'}}>Passenger side delamination, 2x3 ft</textarea></div>
      <div style={{background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 12, borderLeft: '3px solid #3b82f6', padding: '14px 16px'}}><div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}><span style={{background: '#3b82f6', color: 'white', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4}}>2</span><span style={{fontSize: 13, fontWeight: 600}}>Water Leak, Roof Vent</span></div><select style={{width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', marginBottom: 6}}><option>JC-WAR-2018 (1.5 hrs)</option></select><textarea style={{width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', minHeight: 36, resize: 'vertical'}}>Active intrusion front roof vent</textarea></div>
      <div style={{background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 12, borderLeft: '3px solid #22c55e', padding: '14px 16px'}}><div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}><span style={{background: '#22c55e', color: 'white', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4}}>3</span><span style={{fontSize: 13, fontWeight: 600}}>Slide-Out Seal</span></div><select style={{width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option>JC-WAR-3055 (1.0 hrs)</option></select></div>
      <div style={{background: '#fff', border: '1px solid #e5e7eb', borderRadius: 8, marginBottom: 12, borderLeft: '3px solid #a855f7', padding: '14px 16px'}}><div style={{display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8}}><span style={{background: '#a855f7', color: 'white', fontSize: 11, fontWeight: 600, padding: '2px 8px', borderRadius: 4}}>4</span><span style={{fontSize: 13, fontWeight: 600}}>Cabinet Hinge</span></div><select style={{width: '100%', padding: '7px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option>JC-WAR-4012 (0.5 hrs)</option></select></div>
      <button style={{width: '100%', padding: 12, border: '2px dashed #d0d0d0', borderRadius: 8, background: 'none', color: '#888', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit', marginBottom: 16}}>+ Add Issue Group</button>
      <div style={{background: 'var(--brand)', borderRadius: 8, padding: 16, color: 'white'}}><div style={{fontSize: 13, fontWeight: 600, marginBottom: 8}}>Claim Summary</div><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: '0.7', marginBottom: 4}}><span>FRC Lines</span><span>4</span></div><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: '0.7', marginBottom: 4}}><span>Total Hours</span><span>5.5</span></div><div style={{borderTop: '1px solid rgba(255,255,255,0.15)', marginTop: 8, paddingTop: 8, display: 'flex', justifyContent: 'space-between', fontSize: 14, fontWeight: 600}}><span>Est. Value</span><span>$1,240</span></div></div>
    </div>
  </div>
</div>

<div className={`page ${activePage === 'claims' ? 'active' : ''}`} id="page-claims">
  <div className="pn"><div className="filter-bar"><input type="text" placeholder="Search claims..." /><select><option>All Statuses</option><option>Submitted</option><option>Authorized</option><option>Denied</option><option>Parts Ordered</option><option>Completed</option><option>Payment Received</option></select><select><option>All Manufacturers</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select><select><option>All Dealers</option><option>Smith's RV Centre</option><option>Atlantic RV</option><option>Prairie Wind RV</option></select></div>
    <div className="tw"><table><thead><tr><th><input type="checkbox" /></th><th>Claim #</th><th>Dealer</th><th>VIN</th><th>Mfr</th><th>Type</th><th>Lines</th><th>Status</th><th>Amount</th><th>Updated</th></tr></thead><tbody>
      {opClaims.length === 0 ? (
        <tr><td colSpan={10} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : 'No claims found'}</td></tr>
      ) : opClaims.map((c: any) => (
        <tr key={c.id}><td><input type="checkbox" /></td><td><span className="cid" onClick={() => { setSelectedClaimId(c.id); showPage('claim-detail'); }}>{c.claimNumber}</span></td><td>{c.dealershipId?.slice(0,8)}…</td><td><span className="vin">…{c.unitId?.slice(-4)}</span></td><td><span className="mfr">{c.manufacturer}</span></td><td>{c.type}</td><td>—</td><td><span className={`bg ${c.status?.replace(/_/g,'-')}`}>{c.status}</span></td><td>{c.estimatedAmount ? `$${parseFloat(c.estimatedAmount).toLocaleString()}` : '—'}</td><td>{new Date(c.updatedAt).toLocaleDateString()}</td></tr>
      ))}
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'claim-detail' ? 'active' : ''}`} id="page-claim-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('claims')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">CLM-2026-0248</div><div className="detail-meta">Smith's RV Centre · Jayco Warranty · VIN: 1UJBJ0BN8M1TJ4K1</div></div><span className="bg submitted" style={{fontSize: 13, padding: '6px 16px'}}>Submitted</span><button className="btn btn-p btn-sm">Update Status</button></div>
  <div className="cd-grid">
    <div>
      <div className="cd-section"><div className="cd-section-h">FRC Lines (4)</div>
        <div className="frc-line"><div className="frc-num">1</div><div className="frc-info"><div className="frc-code">JC-WAR-1042 — Delamination, Sidewall</div><div className="frc-desc">Passenger side, 2x3 ft</div></div><div className="frc-hrs">2.5 hrs · <span className="bg submitted">Pending</span></div></div>
        <div className="frc-line"><div className="frc-num">2</div><div className="frc-info"><div className="frc-code">JC-WAR-2018 — Water Leak, Roof Vent</div><div className="frc-desc">Front roof vent intrusion</div></div><div className="frc-hrs">1.5 hrs · <span className="bg submitted">Pending</span></div></div>
        <div className="frc-line"><div className="frc-num">3</div><div className="frc-info"><div className="frc-code">JC-WAR-3055 — Slide-Out Seal</div><div className="frc-desc">Driver side, 18 inches</div></div><div className="frc-hrs">1.0 hrs · <span className="bg submitted">Pending</span></div></div>
        <div className="frc-line"><div className="frc-num">4</div><div className="frc-info"><div className="frc-code">JC-WAR-4012 — Cabinet Hinge</div><div className="frc-desc">Kitchen cabinet</div></div><div className="frc-hrs">0.5 hrs · <span className="bg submitted">Pending</span></div></div>
      </div>
      <div className="cd-section"><div className="cd-section-h">Notes & Communication</div>
        <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">MS</div><div className="comm-content"><div className="comm-name">Mike Smith <span style={{fontWeight: 400, color: '#888'}}>(Smith's RV)</span></div><div className="comm-text">Photos uploaded. Customer is anxious about the roof leak — please prioritize.</div><div className="comm-time">Mar 16, 8:15 AM</div></div></div><div className="comm-msg"><div className="comm-avatar op">JD</div><div className="comm-content"><div className="comm-name">Jonathan D. <span style={{fontWeight: 400, color: '#888'}}>(Operator)</span></div><div className="comm-text">Got it. Strong documentation — recommending all 4 lines. Will submit to Jayco today.</div><div className="comm-time">Mar 16, 10:30 AM</div></div></div></div>
        <div style={{padding: '16px 20px'}}><textarea placeholder="Add a note..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end'}}><select style={{padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit'}}><option>Visible to dealer</option><option>Internal only</option></select><button className="btn btn-p btn-sm">Send</button></div></div>
      </div>
    </div>
    <div>
      <div className="cd-section"><div className="cd-section-h">Claim Info</div><div className="cd-row"><span className="cd-label">Claim #</span><span className="cd-value">CLM-2026-0248</span></div><div className="cd-row"><span className="cd-label">Type</span><span className="cd-value">Warranty</span></div><div className="cd-row"><span className="cd-label">Mfr Claim #</span><span className="cd-value" style={{color: '#aaa'}}>Not assigned</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg submitted">Submitted</span></span></div></div>
      <div className="cd-section"><div className="cd-section-h">Unit</div><div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily: 'monospace', fontSize: 12}}>1UJBJ0BN8M1TJ4K1</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">2024 Jayco Jay Flight</span></div></div>
      <div className="cd-section"><div className="cd-section-h">Dealer</div><div className="cd-row"><span className="cd-label">Name</span><span className="cd-value cid" onClick={() => showPage('dealer-detail')}>Smith's RV Centre</span></div><div className="cd-row"><span className="cd-label">Plan</span><span className="cd-value">Plan A · $349/mo</span></div></div>
      <div className="cd-section"><div className="cd-section-h">Financials</div><div className="cd-row"><span className="cd-label">Labor (5.5 hrs)</span><span className="cd-value">$770</span></div><div className="cd-row"><span className="cd-label">Parts</span><span className="cd-value">$385</span></div><div className="cd-row"><span className="cd-label">Transport</span><span className="cd-value">$85</span></div><div className="cd-row" style={{fontWeight: 600}}><span className="cd-label" style={{color: '#111'}}>Total</span><span className="cd-value" style={{fontSize: 15}}>$1,240</span></div><div className="cd-row"><span className="cd-label">Claim Fee (10%)</span><span className="cd-value" style={{color: 'var(--brand)'}}>$124</span></div></div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'stale' ? 'active' : ''}`} id="page-stale">
  <div className="pn"><div style={{padding: '16px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: 13, color: '#92400e'}}>Claims with no update in 36+ hours.</div>
    <div className="tw"><table><thead><tr><th>Claim #</th><th>Dealer</th><th>Mfr</th><th>Status</th><th>Last Updated</th><th>Stale For</th><th>Action</th></tr></thead><tbody>
      {(() => {
        const now = Date.now();
        const staleClaims = opClaims.filter((c: any) => c.updatedAt && (now - new Date(c.updatedAt).getTime()) > 36 * 3600 * 1000);
        if (staleClaims.length === 0) return <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:20}}>No stale claims</td></tr>;
        return staleClaims.map((c: any) => {
          const staleHrs = Math.floor((now - new Date(c.updatedAt).getTime()) / 3600000);
          return (
            <tr key={c.id}>
              <td><span className="cid" onClick={() => { setSelectedClaimId(c.id); showPage('claim-detail'); }}>{c.claimNumber}</span></td>
              <td>{c.dealershipName || c.dealership?.name || '—'}</td>
              <td><span className="mfr">{c.manufacturer}</span></td>
              <td><span className={`bg ${c.status}`}>{c.status}</span></td>
              <td>{new Date(c.updatedAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'})}</td>
              <td style={{color: staleHrs > 60 ? '#dc2626' : '#d97706', fontWeight: 600}}>{staleHrs}h</td>
              <td><button className="btn btn-p btn-sm">Follow Up</button></td>
            </tr>
          );
        });
      })()}
    </tbody></table></div></div>
</div>

<div className={`page ${activePage === 'dealers' ? 'active' : ''}`} id="page-dealers">
  <div className="tabs"><div className="tab active" onClick={(e) => switchTab(e)}>Active (24)</div><div className="tab" onClick={(e) => switchTab(e)}>Pending (3)</div><div className="tab" onClick={(e) => switchTab(e)}>Suspended (1)</div></div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}><div className="filter-bar"><input type="text" placeholder="Search dealers..." /><select><option>All Plans</option><option>Plan A</option><option>Plan B</option></select><div style={{marginLeft: 'auto'}}><button className="btn btn-p btn-sm" onClick={() => showPage('add-dealer')}>+ Add Dealer</button></div></div>
    <div className="tw"><table><thead><tr><th>Dealership</th><th>Contact</th><th>Plan</th><th>Claims (MTD)</th><th>Revenue (MTD)</th><th>Services</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {opDealers.length === 0 ? (
        <tr><td colSpan={8} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : 'No dealers found'}</td></tr>
      ) : opDealers.map((d: any) => (
        <tr key={d.id}><td style={{fontWeight:500}}><span className="cid" onClick={() => { setSelectedDealerId(d.id); showPage('dealer-detail'); }}>{d.name}</span></td><td>{d.contactName || '—'}<br /><span style={{fontSize:11,color:'#888'}}>{d.contactEmail || d.email}</span></td><td>{d.plan === 'plan_b' ? 'Plan B · Wallet' : `Plan A · $${d.monthlyFee || 349}/mo`}</td><td>—</td><td>—</td><td>—</td><td><span className={`bg ${d.status}`}>{d.status}</span></td><td>{d.status === 'pending' ? <button className="btn btn-s btn-sm" onClick={() => handleApproveDealership(d.id)}>Approve</button> : <button className="btn btn-o btn-sm" onClick={() => { setSelectedDealerId(d.id); showPage('dealer-detail'); }}>Manage</button>}</td></tr>
      ))}
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'add-dealer' ? 'active' : ''}`} id="page-add-dealer">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('dealers')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Add New Dealer</div><div className="detail-meta">Create a new dealership account</div></div></div>
  <div className="pn"><div className="form-grid">
    <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Dealership Information</label></div>
    <div className="form-group"><label>Dealership Name</label><input placeholder="Enter dealership name" value={addDealerForm.name} onChange={e => setAddDealerForm(f => ({...f, name: e.target.value}))} /></div>
    <div className="form-group"><label>Primary Contact</label><input placeholder="Full name" value={addDealerForm.contactName} onChange={e => setAddDealerForm(f => ({...f, contactName: e.target.value}))} /></div>
    <div className="form-group"><label>Email</label><input placeholder="dealer@example.com" value={addDealerForm.email} onChange={e => setAddDealerForm(f => ({...f, email: e.target.value}))} /></div>
    <div className="form-group"><label>Phone</label><input placeholder="(555) 000-0000" value={addDealerForm.phone} onChange={e => setAddDealerForm(f => ({...f, phone: e.target.value}))} /></div>
    <div className="form-group"><label>Address</label><input placeholder="Street address" value={addDealerForm.street} onChange={e => setAddDealerForm(f => ({...f, street: e.target.value}))} /></div>
    <div className="form-group"><label>City, Province</label><input placeholder="Toronto, ON" value={addDealerForm.city} onChange={e => setAddDealerForm(f => ({...f, city: e.target.value}))} /></div>
    <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Subscription</label></div>
    <div className="form-group"><label>Plan</label><select value={addDealerForm.plan} onChange={e => setAddDealerForm(f => ({...f, plan: e.target.value}))}><option value="plan_a">Plan A — Monthly ($349/mo)</option><option value="plan_b">Plan B — Pre-Funded Wallet</option><option value="custom">Custom</option></select></div>
    <div className="form-group"><label>Claim Fee %</label><input value="10" type="number" /></div>
    <div className="form-group"><label>Min Fee</label><input value="$50.00" /></div>
    <div className="form-group"><label>Max Fee Cap</label><input value="$500.00" /></div>
    <div className="form-group"><label>DAF Fee</label><input value="$25.00" /></div>
    <div className="form-group"><label>PDI Fee</label><input value="$15.00" /></div>
    <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label>Notes</label><textarea placeholder="Internal notes about this dealership..."></textarea></div>
  </div><div className="btn-bar"><button className="btn btn-p" onClick={handleCreateDealer} disabled={addDealerSaving}>{addDealerSaving ? 'Saving…' : 'Create Dealer'}</button><button className="btn btn-o" onClick={() => showPage('dealers')}>Cancel</button></div></div>
</div>


<div className={`page ${activePage === 'dealer-detail' ? 'active' : ''}`} id="page-dealer-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('dealers')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Smith's RV Centre</div><div className="detail-meta">Plan A · $349/mo · 10% claim fee · Active since Jan 15, 2026</div></div><span className="bg active" style={{fontSize: 13, padding: '6px 16px'}}>Active</span></div>
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(6,1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Batches</div><div className="sc-v" style={{color: '#f59e0b'}}>3</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Claims</div><div className="sc-v">47</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Approval</div><div className="sc-v" style={{color: '#22c55e'}}>96%</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Revenue</div><div className="sc-v">$28.4K</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Outstanding</div><div className="sc-v" style={{color: '#dc2626'}}>$1,240</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Services</div><div className="sc-v" style={{color: '#2563eb'}}>2</div></div>
  </div>
  <div className="tabs" id="dealer-tabs">
    <div className="tab active" onClick={() => setDealerTab('d-batches')}>Photo Batches</div>
    <div className="tab" onClick={() => setDealerTab('d-claims')}>Claims</div>
    <div className="tab" onClick={() => setDealerTab('d-units')}>Units</div>
    <div className="tab" onClick={() => setDealerTab('d-sub')}>Subscription & Fees</div>
    <div className="tab" onClick={() => setDealerTab('d-services')}>Active Services</div>
    <div className="tab" onClick={() => setDealerTab('d-invoices')}>Invoices</div>
    <div className="tab" onClick={() => setDealerTab('d-staff')}>Staff</div>
    <div className="tab" onClick={() => setDealerTab('d-info')}>Info</div>
    <div className="tab" onClick={() => setDealerTab('d-assign')}>Assignment</div>
  </div>
  <div className={`pn dtab ${dealerTab === "dtab-d-batches" ? "active" : ""}`} id="dtab-d-batches" style={{display: dealerTab === "dtab-d-batches" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>Batch</th><th>VIN</th><th>Mfr</th><th>Type</th><th>Photos</th><th>Notes</th><th>Uploaded</th><th>Action</th></tr></thead><tbody><tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>BATCH-0048</td><td><span className="vin">...4K1</span></td><td><span className="mfr">Jayco</span></td><td>Warranty</td><td><strong>24</strong></td><td style={{fontSize: 12, color: '#666'}}>Sidewall, roof, seal, hinge</td><td>2h ago</td><td><button className="btn btn-p btn-sm" onClick={() => showPage('batch-review')}>Review</button></td></tr><tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>BATCH-0044</td><td><span className="vin">...4823</span></td><td><span className="mfr">Columbia NW</span></td><td>Extended</td><td><strong>20</strong></td><td style={{fontSize: 12, color: '#666'}}>Flooring, plumbing, countertop</td><td>6h ago</td><td><button className="btn btn-p btn-sm" onClick={() => showPage('batch-review')}>Review</button></td></tr></tbody></table></div></div>
  <div className={`pn dtab ${dealerTab === "dtab-d-claims" ? "active" : ""}`} id="dtab-d-claims" style={{display: dealerTab === "dtab-d-claims" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>Claim #</th><th>VIN</th><th>Type</th><th>Status</th><th>Amount</th><th>Updated</th></tr></thead><tbody><tr><td><span className="cid" onClick={() => showPage('claim-detail')}>CLM-0248</span></td><td><span className="vin">...4K1</span></td><td>Warranty</td><td><span className="bg submitted">Submitted</span></td><td>$1,240</td><td>2h ago</td></tr><tr><td><span className="cid">CLM-0243</span></td><td><span className="vin">...7P3</span></td><td>DAF</td><td><span className="bg pay-recv">Paid</span></td><td>$4,200</td><td>3 days</td></tr><tr><td><span className="cid">CLM-0237</span></td><td><span className="vin">...8R2</span></td><td>Warranty</td><td><span className="bg completed">Completed</span></td><td>$920</td><td>1 week</td></tr></tbody></table></div></div>
  <div className={`pn dtab ${dealerTab === "dtab-d-units" ? "active" : ""}`} id="dtab-d-units" style={{display: dealerTab === "dtab-d-units" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>VIN</th><th>Stock #</th><th>Model</th><th>Claims</th><th>DAF</th><th>PDI</th><th>Status</th></tr></thead><tbody><tr><td><span className="cid" onClick={() => showPage('unit-detail')}>1UJBJ0BN8M1TJ4K1</span></td><td>STK-0891</td><td>2024 Jayco Jay Flight</td><td>3</td><td><span className="bg authorized">Done</span></td><td><span className="bg authorized">Done</span></td><td><span className="bg active">Delivered</span></td></tr></tbody></table></div></div>
  <div className={`pn dtab ${dealerTab === "dtab-d-sub" ? "active" : ""}`} id="dtab-d-sub" style={{display: dealerTab === "dtab-d-sub" ? "block" : "none"}}><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0}}>
    <div style={{borderRight: '1px solid #f0f0f0'}}><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Subscription</div><div className="cd-row"><span className="cd-label">Plan</span><span className="cd-value" style={{color: 'var(--brand)', fontWeight: 600}}>Plan A — Monthly</span></div><div className="cd-row"><span className="cd-label">Monthly Fee</span><span className="cd-value">$349/mo</span></div><div className="cd-row"><span className="cd-label">Billing Cycle</span><span className="cd-value">1st of month</span></div><div className="cd-row"><span className="cd-label">Next Invoice</span><span className="cd-value">Apr 1, 2026</span></div><div className="cd-row"><span className="cd-label">Payment</span><span className="cd-value">Visa ****4242</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg active">Active</span></span></div><div style={{padding: '14px 20px'}}><button className="btn btn-o btn-sm">Change Plan</button> <button className="btn btn-o btn-sm" style={{color: '#dc2626', borderColor: '#fca5a5'}}>Cancel</button></div></div>
    <div><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Claim Fee Schedule</div><div className="cd-row"><span className="cd-label">Per-Claim Fee</span><span className="cd-value" style={{fontWeight: 600}}>10% of approved</span></div><div className="cd-row"><span className="cd-label">Min Fee</span><span className="cd-value">$50</span></div><div className="cd-row"><span className="cd-label">Max Fee Cap</span><span className="cd-value">$500</span></div><div className="cd-row"><span className="cd-label">DAF Fee</span><span className="cd-value">$25/unit</span></div><div className="cd-row"><span className="cd-label">PDI Fee</span><span className="cd-value">$15/unit</span></div><div style={{padding: '14px 20px'}}><button className="btn btn-o btn-sm">Edit Fees</button></div></div>
  </div></div>
  <div className={`pn dtab ${dealerTab === "dtab-d-services" ? "active" : ""}`} id="dtab-d-services" style={{display: dealerTab === "dtab-d-services" ? "block" : "none"}}><div style={{padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12}}>
    <div className="svc-card"><div className="svc-icon" style={{background: '#eff6ff', color: '#3b82f6'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg></div><div className="svc-body"><div className="svc-title">Claims Processing</div><div className="svc-meta"><span className="bg active">Active</span><span style={{color: '#888'}}>Included</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
    <div className="svc-card"><div className="svc-icon" style={{background: '#f0fdf4', color: '#22c55e'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg></div><div className="svc-body"><div className="svc-title">Warranty Plans</div><div className="svc-meta"><span className="bg active">Active</span><span style={{color: '#888'}}>Included</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
    <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#faf5ff', color: '#a855f7'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div className="svc-body"><div className="svc-title">Financing</div><div className="svc-meta"><span className="bg pending">Coming Q2</span><span style={{color: '#888'}}>$199/mo</span></div></div><div className="toggle"></div></div>
    <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#fffbeb', color: '#f59e0b'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg></div><div className="svc-body"><div className="svc-title">F&I Services</div><div className="svc-meta"><span className="bg pending">Coming Q2</span><span style={{color: '#888'}}>$299/mo</span></div></div><div className="toggle"></div></div>
  </div></div>
  <div className={`pn dtab ${dealerTab === "dtab-d-invoices" ? "active" : ""}`} id="dtab-d-invoices" style={{display: dealerTab === "dtab-d-invoices" ? "block" : "none"}}>
    <div className="pn-h" style={{borderBottom: '1px solid #f0f0f0'}}><span className="pn-t">Invoices</span><span className="pn-a" onClick={() => showPage('create-invoice')}>+ Create Invoice</span></div>
    <div className="tw"><table><thead><tr><th>Invoice</th><th>Type</th><th>Description</th><th>Total</th><th>Status</th><th>Issued</th></tr></thead><tbody><tr><td style={{fontWeight: 500}}>INV-0089</td><td>Claim Fee</td><td>10% on CLM-0248</td><td>$140.12</td><td><span className="bg pending">Pending</span></td><td>Mar 16</td></tr><tr><td>INV-0085</td><td>Subscription</td><td>March 2026</td><td>$394.37</td><td><span className="bg pay-recv">Paid</span></td><td>Mar 1</td></tr></tbody></table></div></div>
  <div className={`pn dtab ${dealerTab === "dtab-d-staff" ? "active" : ""}`} id="dtab-d-staff" style={{display: dealerTab === "dtab-d-staff" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Status</th><th>Last Login</th></tr></thead><tbody><tr><td style={{fontWeight: 500}}>Mike Smith</td><td>mike@smithsrv.ca</td><td><span className="bg" style={{background: '#eff6ff', color: 'var(--brand)'}}>Owner</span></td><td><span className="bg active">Active</span></td><td>4h ago</td></tr><tr><td>Lisa Patel</td><td>lisa@smithsrv.ca</td><td><span className="bg" style={{background: '#f0fdf4', color: '#16a34a'}}>Staff</span></td><td><span className="bg active">Active</span></td><td>Yesterday</td></tr></tbody></table></div></div>
  <div className={`pn dtab ${dealerTab === "dtab-d-info" ? "active" : ""}`} id="dtab-d-info" style={{display: dealerTab === "dtab-d-info" ? "block" : "none"}}>
    <div style={{padding: '12px 20px', background: '#eff6ff', borderBottom: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', display: 'flex', alignItems: 'center', gap: 8}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>This information is shared with the dealer. Changes they make in their Settings &gt; Dealership Account appear here.</div>
    <div className="form-grid">
      <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Business Information</label></div>
      <div className="form-group"><label>Dealership Name</label><input value="Smith's RV Centre" /></div>
      <div className="form-group"><label>Legal Name</label><input value="Smith's RV Centre Inc." /></div>
      <div className="form-group"><label>Business Email</label><input value="info@smithsrv.ca" /></div>
      <div className="form-group"><label>Business Phone</label><input value="(905) 555-0100" /></div>
      <div className="form-group"><label>Website</label><input value="https://smithsrv.ca" /></div>
      <div className="form-group"><label>Business Number</label><input value="123456789 RT0001" /></div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Address</label></div>
      <div className="form-group"><label>Street</label><input value="1234 RV Parkway" /></div>
      <div className="form-group"><label>City</label><input value="Hamilton" /></div>
      <div className="form-group"><label>Province</label><input value="Ontario" /></div>
      <div className="form-group"><label>Postal Code</label><input value="L8E 3B5" /></div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Primary Contact</label></div>
      <div className="form-group"><label>Name</label><input value="Mike Smith" /></div>
      <div className="form-group"><label>Email</label><input value="mike@smithsrv.ca" /></div>
      <div className="form-group"><label>Phone</label><input value="(905) 555-0123" /></div>
      <div className="form-group"><label>Title</label><input value="Owner" /></div>
      <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Internal Notes (operator only)</label></div>
      <div className="form-group full"><textarea>Long-time client. Processes mostly Jayco warranty claims. High photo quality. Repeat customers.</textarea></div>
    </div>
    <div className="btn-bar"><button className="btn btn-p">Save</button><button className="btn btn-o">Reset</button><button className="btn btn-d" style={{marginLeft: 'auto'}}>Suspend Dealer</button></div>
  </div>
  <div className={`pn dtab ${dealerTab === "dtab-d-assign" ? "active" : ""}`} id="dtab-d-assign" style={{display: dealerTab === "dtab-d-assign" ? "block" : "none"}}><div style={{padding: '24px 20px'}}><div style={{fontSize: 14, fontWeight: 600, marginBottom: 16}}>Operator Assignment</div><div className="form-grid" style={{padding: 0, maxWidth: 400}}><div className="form-group full"><label>Assigned Operator</label><select><option>Unassigned</option><option>Marie Tremblay</option><option>Alex Beaulieu</option><option>Sophie Martin</option></select></div><div className="form-group full"><label>Backup</label><select><option>None</option><option>Marie Tremblay</option><option>Alex Beaulieu</option></select></div></div><div style={{marginTop: 16}}><button className="btn btn-p">Save</button></div></div></div>
</div>

<div className={`page ${activePage === 'units' ? 'active' : ''}`} id="page-units">
  <div className="pn"><div className="filter-bar"><input type="text" placeholder="Search VIN, stock #, customer..." /><select><option>All Manufacturers</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select><select><option>All Dealers</option><option>Smith's RV</option><option>Atlantic RV</option></select><select><option>All Statuses</option><option>On Lot</option><option>Delivered</option><option>In Service</option></select><div style={{marginLeft: 'auto'}}><button className="btn btn-p btn-sm" onClick={() => showPage('add-unit')}>+ Add Unit</button></div></div>
    <div className="tw"><table><thead><tr><th>VIN</th><th>Stock #</th><th>Year</th><th>Make / Model</th><th>Dealer</th><th>Customer</th><th>Claims</th><th>DAF</th><th>PDI</th><th>Status</th></tr></thead><tbody>
      {opUnits.length === 0 ? (
        <tr><td colSpan={10} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : 'No units found'}</td></tr>
      ) : opUnits.map((u: any) => (
        <tr key={u.id}><td><span className="cid" onClick={() => { setSelectedUnitId(u.id); showPage('unit-detail'); }}>{u.vin}</span></td><td>{u.stockNumber || '—'}</td><td>{u.year || '—'}</td><td><span className="mfr">{u.manufacturer}</span> {u.model}</td><td>{u.dealershipId?.slice(0,8)}…</td><td>{u.customerName || '—'}</td><td>—</td><td><span className={`bg ${u.dafCompleted ? 'authorized' : 'pending'}`}>{u.dafCompleted ? 'Done' : 'Pending'}</span></td><td><span className={`bg ${u.pdiCompleted ? 'authorized' : 'pending'}`}>{u.pdiCompleted ? 'Done' : 'Pending'}</span></td><td><span className="bg active">{u.status}</span></td></tr>
      ))}
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'add-unit' ? 'active' : ''}`} id="page-add-unit">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('units')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Add New Unit</div><div className="detail-meta">Register a unit on the platform</div></div></div>
  <div className="pn"><div className="form-grid c3">
    <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Vehicle</label></div>
    <div className="form-group"><label>VIN</label><input placeholder="17-character VIN" /></div><div className="form-group"><label>Year</label><input placeholder="2024" /></div><div className="form-group"><label>Manufacturer</label><select><option>Select...</option><option>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option><option>Columbia NW</option></select></div>
    <div className="form-group"><label>Model</label><input placeholder="Jay Flight 264BH" /></div><div className="form-group"><label>RV Type</label><select><option>Select...</option><option>Travel Trailer</option><option>Fifth Wheel</option><option>Class A</option><option>Class C</option><option>Toy Hauler</option><option>Pop Up</option></select></div><div className="form-group"><label>Stock #</label><input placeholder="STK-0000" /></div>
    <div className="form-group"><label>Lot Location</label><input placeholder="Lot B, Row 3" /></div><div className="form-group"><label>Status</label><select><option>On Lot</option><option>Delivered</option><option>In Service</option></select></div><div className="form-group"><label>Dealer</label><select><option>Select...</option><option>Smith's RV Centre</option><option>Atlantic RV</option><option>Prairie Wind RV</option></select></div>
    <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Customer</label></div>
    <div className="form-group"><label>Name</label><input placeholder="Customer name" /></div><div className="form-group"><label>Email</label><input placeholder="email@example.com" /></div><div className="form-group"><label>Phone</label><input placeholder="(555) 000-0000" /></div>
    <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Inspection & Warranty</label></div>
    <div className="form-group"><label>DAF Required</label><select><option>Yes</option><option>No</option></select></div><div className="form-group"><label>DAF Fee</label><input value="$25.00" /></div><div className="form-group"><label>Delivery Date</label><input type="date" /></div>
    <div className="form-group"><label>Warranty Expiry</label><input type="date" /></div><div className="form-group"><label>Ext. Warranty Provider</label><input placeholder="Provider name" /></div><div className="form-group"><label>Ext. Warranty Expiry</label><input type="date" /></div>
  </div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('units')}>Add Unit</button><button className="btn btn-o" onClick={() => showPage('units')}>Cancel</button></div></div>
</div>


<div className={`page ${activePage === 'unit-detail' ? 'active' : ''}`} id="page-unit-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('units')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">2024 Jayco Jay Flight 264BH</div><div className="detail-meta">VIN: 1UJBJ0BN8M1TJ4K1 · STK-0891 · Smith's RV Centre</div></div><span className="bg active" style={{fontSize: 13, padding: '6px 16px'}}>Delivered</span><button className="btn btn-o btn-sm" id="edit-unit-btn" onClick={() => toggleUnitEdit()}>Edit Unit</button></div>
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 20}}><div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Claims</div><div className="sc-v">3</div></div><div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Claimed</div><div className="sc-v">$6,360</div></div><div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Approved</div><div className="sc-v" style={{color: '#22c55e'}}>$5,920</div></div><div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Paid</div><div className="sc-v" style={{color: '#2563eb'}}>$4,760</div></div><div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Approval</div><div className="sc-v" style={{color: '#22c55e'}}>93%</div></div></div>
  <div className="tabs" id="unit-tabs"><div className="tab active" onClick={() => setUnitTab('u-specs')}>Specs</div><div className="tab" onClick={() => setUnitTab('u-claims')}>Claims</div><div className="tab" onClick={() => setUnitTab('u-photos')}>Photos</div><div className="tab" onClick={() => setUnitTab('u-fin')}>Financials</div><div className="tab" onClick={() => setUnitTab('u-time')}>Timeline</div></div>
  <div className={`pn utab ${unitTab === "utab-u-specs" ? "active" : ""}`} id="utab-u-specs" style={{display: unitTab === "utab-u-specs" ? "block" : "none"}}>
    
    <div style={{padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', gap: 16, alignItems: 'center'}}>
      <div id="op-unit-photo" style={{width: 140, height: 90, background: '#f0f0f0', borderRadius: 8, display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', flexShrink: 0, cursor: 'pointer'}} onClick={() => document.getElementById('op-unit-photo-input')?.click()}>
        <div id="op-unit-photo-ph" style={{textAlign: 'center'}}><svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ccc" strokeWidth="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/><path d="M21 15l-5-5L5 21"/></svg><div style={{fontSize: 10, color: '#aaa', marginTop: 4}}>Unit Photo</div></div>
        <img id="op-unit-photo-img" style={{width: '100%', height: '100%', objectFit: 'cover', display: 'none'}} />
      </div>
      <input type="file" id="op-unit-photo-input" accept="image/*" style={{display: 'none'}} onChange={updateOpUnitPhoto} />
      <div style={{flex: 1}}><div style={{fontSize: 12, fontWeight: 600, color: '#555', marginBottom: 4}}>Unit Display Photo</div><div style={{fontSize: 12, color: '#888', lineHeight: '1.4'}}>Visible on the customer portal. Typically uploaded by the dealer.</div></div>
      <button className="btn btn-o btn-sm" onClick={() => document.getElementById('op-unit-photo-input')?.click()}>Upload / Change</button>
    </div>
    <div id="unit-view-mode" style={{display: unitEditMode ? "none" : "block"}}><div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 0}}><div style={{borderRight: '1px solid #f0f0f0'}}><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Vehicle</div><div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily: 'monospace', fontSize: 12}}>1UJBJ0BN8M1TJ4K1</span></div><div className="cd-row"><span className="cd-label">Stock #</span><span className="cd-value">STK-0891</span></div><div className="cd-row"><span className="cd-label">Year / Make / Model</span><span className="cd-value">2024 Jayco Jay Flight 264BH</span></div><div className="cd-row"><span className="cd-label">Type</span><span className="cd-value">Travel Trailer</span></div><div className="cd-row"><span className="cd-label">Location</span><span className="cd-value">Lot B, Row 3</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg active">Delivered</span></span></div><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Inspection & Warranty</div><div className="cd-row"><span className="cd-label">DAF</span><span className="cd-value"><span className="bg authorized">Done</span> Jan 22</span></div><div className="cd-row"><span className="cd-label">DAF Fee</span><span className="cd-value">$25 (Billed)</span></div><div className="cd-row"><span className="cd-label">PDI</span><span className="cd-value"><span className="bg authorized">Done</span> Feb 5</span></div><div className="cd-row"><span className="cd-label">Delivery</span><span className="cd-value">Feb 10, 2026</span></div><div className="cd-row"><span className="cd-label">Warranty</span><span className="cd-value">Feb 10, 2026 — Feb 10, 2028</span></div><div className="cd-row"><span className="cd-label">Ext. Warranty</span><span className="cd-value">Guardsman RV — Feb 10, 2031</span></div></div><div><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Customer</div><div className="cd-row"><span className="cd-label">Name</span><span className="cd-value">Robert Martin</span></div><div className="cd-row"><span className="cd-label">Email</span><span className="cd-value" style={{color: 'var(--brand)'}}>robert.martin@gmail.com</span></div><div className="cd-row"><span className="cd-label">Phone</span><span className="cd-value">(905) 555-0147</span></div><div className="cd-row"><span className="cd-label">City</span><span className="cd-value">Hamilton, ON</span></div><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Dealer</div><div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value cid" onClick={() => showPage('dealer-detail')}>Smith's RV Centre</span></div><div className="cd-row"><span className="cd-label">Internal #</span><span className="cd-value">JC-2024-0891</span></div><div className="cd-section-h" style={{padding: '14px 20px', borderBottom: '1px solid #f0f0f0', borderTop: '1px solid #f0f0f0', fontSize: 13, fontWeight: 600}}>Notes</div><div style={{padding: '14px 20px', fontSize: 13, color: '#555'}}>Repeat customer. Delamination 3 months post-delivery.</div></div></div></div>
    <div id="unit-edit-mode" style={{display: unitEditMode ? "block" : "none"}}><div style={{padding: '14px 20px', background: '#fffbeb', borderBottom: '1px solid #fef3c7', fontSize: 13, color: '#92400e'}}>Editing unit. Click <strong>Save</strong> when done.</div><div className="form-grid c3" style={{padding: 20}}><div className="form-group full"><label>VIN</label><input value="1UJBJ0BN8M1TJ4K1" readOnly style={{background: '#f3f4f6', color: '#888'}} /></div><div className="form-group"><label>Year</label><input value="2024" /></div><div className="form-group"><label>Manufacturer</label><select><option defaultSelected>Jayco</option><option>Forest River</option><option>Heartland</option><option>Keystone</option></select></div><div className="form-group"><label>Model</label><input value="Jay Flight 264BH" /></div><div className="form-group"><label>Type</label><select><option defaultSelected>Travel Trailer</option><option>Fifth Wheel</option></select></div><div className="form-group"><label>Stock #</label><input value="STK-0891" /></div><div className="form-group"><label>Location</label><input value="Lot B, Row 3" /></div><div className="form-group"><label>Status</label><select><option>On Lot</option><option defaultSelected>Delivered</option><option>In Service</option></select></div><div className="form-group"><label>Customer</label><input value="Robert Martin" /></div><div className="form-group"><label>Email</label><input value="robert.martin@gmail.com" /></div><div className="form-group"><label>Phone</label><input value="(905) 555-0147" /></div><div className="form-group"><label>Delivery</label><input type="date" value="2026-02-10" /></div><div className="form-group"><label>Warranty Expiry</label><input type="date" value="2028-02-10" /></div><div className="form-group"><label>Ext Warranty</label><input value="Guardsman RV" /></div><div className="form-group full"><label>Notes</label><textarea>Repeat customer. Delamination 3 months post-delivery.</textarea></div></div><div className="btn-bar"><button className="btn btn-p" onClick={() => toggleUnitEdit()}>Save</button><button className="btn btn-o" onClick={() => toggleUnitEdit()}>Cancel</button><button className="btn btn-d" style={{marginLeft: 'auto'}}>Delete</button></div></div>
  </div>
  <div className={`pn utab ${unitTab === "utab-u-claims" ? "active" : ""}`} id="utab-u-claims" style={{display: unitTab === "utab-u-claims" ? "block" : "none"}}><div className="tw"><table><thead><tr><th>Claim #</th><th>Type</th><th>Lines</th><th>Status</th><th>Claimed</th><th>Approved</th></tr></thead><tbody><tr><td><span className="cid" onClick={() => showPage('claim-detail')}>CLM-0248</span></td><td>Warranty</td><td>4</td><td><span className="bg submitted">Submitted</span></td><td>$1,240</td><td>—</td></tr><tr><td><span className="cid">CLM-0237</span></td><td>DAF</td><td>7</td><td><span className="bg pay-recv">Paid</span></td><td>$4,200</td><td>$3,920</td></tr><tr><td><span className="cid">CLM-0225</span></td><td>PDI</td><td>3</td><td><span className="bg pay-recv">Paid</span></td><td>$920</td><td>$840</td></tr></tbody></table></div></div>
  <div className={`pn utab ${unitTab === "utab-u-photos" ? "active" : ""}`} id="utab-u-photos" style={{display: unitTab === "utab-u-photos" ? "block" : "none"}}><div style={{padding: '16px 20px', borderBottom: '1px solid #f0f0f0'}}><div style={{fontSize: 13, fontWeight: 600, marginBottom: 8}}>DAF (18) <span className="bg authorized">Jan 22</span></div><div style={{display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 6}}><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>01</div><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>02</div><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>+16</div></div></div><div style={{padding: '16px 20px', borderBottom: '1px solid #f0f0f0'}}><div style={{fontSize: 13, fontWeight: 600, marginBottom: 8}}>PDI (8) <span className="bg authorized">Feb 5</span></div><div style={{display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 6}}><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>01</div><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>+7</div></div></div><div style={{padding: '16px 20px'}}><div style={{fontSize: 13, fontWeight: 600, marginBottom: 8}}>Warranty (24) <span className="bg submitted">Mar 16</span></div><div style={{display: 'grid', gridTemplateColumns: 'repeat(9,1fr)', gap: 6}}><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>01</div><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>02</div><div style={{aspectRatio: 1, background: '#e8e8e8', borderRadius: 6, fontSize: 9, display: 'flex', alignItems: 'center', justifyContent: 'center', color: '#888'}}>+22</div></div></div></div>
  <div className={`pn utab ${unitTab === "utab-u-fin" ? "active" : ""}`} id="utab-u-fin" style={{display: unitTab === "utab-u-fin" ? "block" : "none"}}><div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, padding: 20, borderBottom: '1px solid #f0f0f0'}}><div><div style={{fontSize: 12, color: '#888', marginBottom: 4}}>Claimed</div><div style={{fontSize: 20, fontWeight: 700}}>$6,360</div></div><div><div style={{fontSize: 12, color: '#888', marginBottom: 4}}>Approved</div><div style={{fontSize: 20, fontWeight: 700, color: '#22c55e'}}>$5,920</div></div><div><div style={{fontSize: 12, color: '#888', marginBottom: 4}}>Paid</div><div style={{fontSize: 20, fontWeight: 700, color: '#2563eb'}}>$4,760</div></div><div><div style={{fontSize: 12, color: '#888', marginBottom: 4}}>Outstanding</div><div style={{fontSize: 20, fontWeight: 700, color: '#dc2626'}}>$1,160</div></div></div><div className="tw"><table><thead><tr><th>Claim</th><th>Type</th><th>Labor</th><th>Parts</th><th>Total</th><th>Status</th></tr></thead><tbody><tr><td>CLM-0248</td><td>Warranty</td><td>$770</td><td>$385</td><td style={{fontWeight: 600}}>$1,240</td><td><span className="bg submitted">Pending</span></td></tr><tr><td>CLM-0237</td><td>DAF</td><td>$2,100</td><td>$1,680</td><td style={{fontWeight: 600}}>$4,200</td><td><span className="bg pay-recv">Paid</span></td></tr></tbody></table></div></div>
  <div className={`pn utab ${unitTab === "utab-u-time" ? "active" : ""}`} id="utab-u-time" style={{display: unitTab === "utab-u-time" ? "block" : "none"}}><div className="act"><div className="act-i"><span className="act-dot new"></span><div><div className="act-t">Warranty claim <strong>CLM-0248</strong> submitted</div><div className="act-tm">Mar 16</div></div></div><div className="act-i"><span className="act-dot pay"></span><div><div className="act-t">Payment <strong>$3,920</strong> for CLM-0237</div><div className="act-tm">Mar 8</div></div></div><div className="act-i"><span className="act-dot ok"></span><div><div className="act-t">Unit <strong>delivered</strong> to Robert Martin</div><div className="act-tm">Feb 10</div></div></div><div className="act-i"><span className="act-dot ok"></span><div><div className="act-t"><strong>DAF inspection</strong> completed</div><div className="act-tm">Jan 22</div></div></div><div className="act-i"><span className="act-dot new"></span><div><div className="act-t">Unit <strong>added</strong> to platform</div><div className="act-tm">Jan 20</div></div></div></div></div>
</div>


<div className={`page ${activePage === 'frc' ? 'active' : ''}`} id="page-frc">
  <div className="tabs"><div className="tab active" onClick={(e) => switchTab(e)}>Jayco</div><div className="tab" onClick={(e) => switchTab(e)}>Forest River</div><div className="tab" onClick={(e) => switchTab(e)}>Heartland</div><div className="tab" onClick={(e) => switchTab(e)}>Keystone</div><div className="tab" onClick={(e) => switchTab(e)}>Columbia NW</div></div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}><div className="filter-bar"><input type="text" placeholder="Search FRC codes..." /><select><option>All Categories</option><option>Structural</option><option>Plumbing</option><option>Electrical</option><option>HVAC</option><option>Interior</option><option>Exterior</option></select></div>
    <div className="tw"><table><thead><tr><th>Code</th><th>Description</th><th>Category</th><th>Hours</th><th>Used (30d)</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 600, color: 'var(--brand)'}}>JC-WAR-1042</td><td>Delamination, Sidewall</td><td>Structural</td><td>2.5</td><td>8</td></tr>
      <tr><td style={{fontWeight: 600, color: 'var(--brand)'}}>JC-WAR-2018</td><td>Water Leak, Roof Vent</td><td>Plumbing</td><td>1.5</td><td>12</td></tr>
      <tr><td style={{fontWeight: 600, color: 'var(--brand)'}}>JC-WAR-3055</td><td>Slide-Out Seal, Replace</td><td>Exterior</td><td>1.0</td><td>6</td></tr>
      <tr><td style={{fontWeight: 600, color: 'var(--brand)'}}>JC-WAR-4012</td><td>Cabinet Door, Hinge</td><td>Interior</td><td>0.5</td><td>15</td></tr>
      <tr><td style={{fontWeight: 600, color: 'var(--brand)'}}>JC-WAR-5001</td><td>Furnace, No Ignition</td><td>HVAC</td><td>2.0</td><td>4</td></tr>
    </tbody></table></div></div>
</div>

<div className={`page ${activePage === 'svc-financing' ? 'active' : ''}`} id="page-svc-financing">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Dealers submit financing requests. You shop to lenders, track approvals, and update the dealer.</div><button className="btn btn-p btn-sm" onClick={() => showPage('svc-financing-new')}>+ New Financing Request</button></div>
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Requests</div><div className="sc-v" style={{color: '#2563eb'}}>3</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Approved (MTD)</div><div className="sc-v" style={{color: '#22c55e'}}>7</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Total Financed (MTD)</div><div className="sc-v">$312K</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Avg Approval Time</div><div className="sc-v">1.8d</div></div>
  </div>
  <div className="pn">
    <div className="filter-bar"><input type="text" placeholder="Search by customer or dealer..." /><select><option>All Statuses</option><option>New Request</option><option>Shopping Lenders</option><option>Approved</option><option>Declined</option><option>Funded</option></select><select><option>All Dealers</option><option>Smith's RV</option><option>Atlantic RV</option></select></div>
    <div className="tw"><table><thead><tr><th>Request #</th><th>Dealer</th><th>Customer</th><th>Unit</th><th>Amount</th><th>Lenders Contacted</th><th>Best Rate</th><th>Status</th><th>Updated</th><th>Action</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('svc-financing-detail')}>FIN-0023</span></td><td>Smith's RV</td><td>Daniel Tremblay</td><td>2024 Jayco Eagle HT</td><td>$42,500</td><td>3 of 5</td><td>—</td><td><span className="bg in-progress">Shopping Lenders</span></td><td>2h ago</td><td><button className="btn btn-p btn-sm" onClick={() => showPage('svc-financing-detail')}>Process</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('svc-financing-detail')}>FIN-0022</span></td><td>Atlantic RV</td><td>Julie Fournier</td><td>2024 Forest River Wildwood</td><td>$38,900</td><td>5 of 5</td><td>4.99%</td><td><span className="bg authorized">Approved</span></td><td>Yesterday</td><td><button className="btn btn-o btn-sm">View</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('svc-financing-detail')}>FIN-0021</span></td><td>Smith's RV</td><td>Marc Leblanc</td><td>2025 Heartland Bighorn</td><td>$68,200</td><td>—</td><td>—</td><td><span className="bg new-req">New Request</span></td><td>3h ago</td><td><button className="btn btn-p btn-sm" onClick={() => showPage('svc-financing-detail')}>Process</button></td></tr>
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'svc-financing-detail' ? 'active' : ''}`} id="page-svc-financing-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-financing')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">FIN-0023 — Daniel Tremblay</div><div className="detail-meta">Smith's RV Centre · 2024 Jayco Eagle HT · $42,500 requested</div></div><span className="bg in-progress" style={{fontSize: 13, padding: '6px 16px'}}>Shopping Lenders</span></div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      
      <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Lender Applications</span><span className="pn-a">+ Add Lender</span></div>
        <div className="tw"><table><thead><tr><th>Lender</th><th>Submitted</th><th>Rate</th><th>Term</th><th>Monthly</th><th>Status</th><th>Action</th></tr></thead><tbody>
          <tr><td style={{fontWeight: 500}}>RBC</td><td>Mar 16, 9am</td><td>5.49%</td><td>180 mo</td><td>$347</td><td><span className="bg authorized">Approved</span></td><td><button className="btn btn-s btn-sm">Select</button></td></tr>
          <tr><td style={{fontWeight: 500}}>Desjardins</td><td>Mar 16, 9am</td><td>—</td><td>—</td><td>—</td><td><span className="bg pending">Pending</span></td><td><button className="btn btn-o btn-sm">Follow Up</button></td></tr>
          <tr><td style={{fontWeight: 500}}>TD Auto</td><td>Mar 16, 10am</td><td>6.29%</td><td>180 mo</td><td>$368</td><td><span className="bg authorized">Approved</span></td><td><button className="btn btn-o btn-sm">Select</button></td></tr>
          <tr style={{opacity: '0.5'}}><td>BMO</td><td>—</td><td>—</td><td>—</td><td>—</td><td><span className="bg draft">Not Submitted</span></td><td><button className="btn btn-o btn-sm">Submit</button></td></tr>
          <tr style={{opacity: '0.5'}}><td>National Bank</td><td>—</td><td>—</td><td>—</td><td>—</td><td><span className="bg draft">Not Submitted</span></td><td><button className="btn btn-o btn-sm">Submit</button></td></tr>
        </tbody></table></div>
      </div>
      
      <div className="pn"><div className="pn-h"><span className="pn-t">Communication</span></div>
        <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">MS</div><div className="comm-content"><div className="comm-name">Mike Smith <span style={{fontWeight: 400, color: '#888'}}>(Smith's RV)</span></div><div className="comm-text">Customer wants lowest rate possible, flexible on term. Good credit history. Needs answer by end of week.</div><div className="comm-time">Mar 16, 8:30 AM</div></div></div><div className="comm-msg"><div className="comm-avatar op">JD</div><div className="comm-content"><div className="comm-name">Jonathan D. <span style={{fontWeight: 400, color: '#888'}}>(Operator)</span></div><div className="comm-text">Submitted to RBC, Desjardins, and TD so far. RBC came back at 5.49% — strong offer. Waiting on Desjardins. Will update by EOD.</div><div className="comm-time">Mar 16, 11:15 AM</div></div></div></div>
        <div style={{padding: '16px 20px'}}><textarea placeholder="Update the dealer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{display: 'flex', gap: 8, marginTop: 8, justifyContent: 'flex-end'}}><select style={{padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit'}}><option>Visible to dealer</option><option>Internal only</option></select><button className="btn btn-p btn-sm">Send</button></div></div>
      </div>
    </div>
    <div>
      <div className="cd-section"><div className="cd-section-h">Request Details</div><div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Daniel Tremblay</span></div><div className="cd-row"><span className="cd-label">Credit Score</span><span className="cd-value">742 (Good)</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">2024 Jayco Eagle HT</span></div><div className="cd-row"><span className="cd-label">Requested</span><span className="cd-value" style={{fontWeight: 600}}>$42,500</span></div><div className="cd-row"><span className="cd-label">Down Payment</span><span className="cd-value">$5,000</span></div><div className="cd-row"><span className="cd-label">Preferred Term</span><span className="cd-value">15 years</span></div></div>
      <div className="cd-section"><div className="cd-section-h">Dealer</div><div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value cid" onClick={() => showPage('dealer-detail')}>Smith's RV Centre</span></div><div className="cd-row"><span className="cd-label">Submitted By</span><span className="cd-value">Mike Smith</span></div><div className="cd-row"><span className="cd-label">Submitted</span><span className="cd-value">Mar 16, 8:30 AM</span></div></div>
      <div className="cd-section"><div className="cd-section-h">Best Offer</div><div className="cd-row" style={{background: '#f0fdf4'}}><span className="cd-label" style={{color: '#16a34a'}}>RBC — 5.49%</span><span className="cd-value" style={{color: '#16a34a', fontWeight: 600}}>$347/mo x 180</span></div></div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'svc-financing-new' ? 'active' : ''}`} id="page-svc-financing-new">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-financing')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">New Financing Request</div><div className="detail-meta">Submit on behalf of a dealer</div></div></div>
  <div className="pn"><div className="form-grid">
    <div className="form-group"><label>Dealer</label><select><option>Select dealer...</option><option>Smith's RV Centre</option><option>Atlantic RV</option><option>Prairie Wind RV</option></select></div>
    <div className="form-group"><label>Customer Name</label><input placeholder="Full name" /></div>
    <div className="form-group"><label>Credit Score (if known)</label><input placeholder="e.g. 742" /></div>
    <div className="form-group"><label>Unit (VIN or description)</label><input placeholder="VIN or Year Make Model" /></div>
    <div className="form-group"><label>Requested Amount</label><input placeholder="$0.00" /></div>
    <div className="form-group"><label>Down Payment</label><input placeholder="$0.00" /></div>
    <div className="form-group"><label>Preferred Term</label><select><option>10 years</option><option defaultSelected>15 years</option><option>20 years</option></select></div>
    <div className="form-group full"><label>Notes</label><textarea placeholder="Any additional details from the dealer..."></textarea></div>
  </div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('svc-financing')}>Create Request</button><button className="btn btn-o" onClick={() => showPage('svc-financing')}>Cancel</button></div></div>
</div>

<div className={`page ${activePage === 'svc-fi' ? 'active' : ''}`} id="page-svc-fi">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Dealers flag deals needing F&I products. You recommend packages, handle paperwork, and track what's sold.</div><button className="btn btn-p btn-sm" onClick={() => showPage('svc-fi-new')}>+ New F&I Deal</button></div>
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Deals</div><div className="sc-v" style={{color: '#2563eb'}}>2</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Products Sold (MTD)</div><div className="sc-v" style={{color: '#22c55e'}}>18</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Revenue (MTD)</div><div className="sc-v">$14,200</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Avg Products/Deal</div><div className="sc-v">2.4</div></div>
  </div>
  <div className="pn">
    <div className="filter-bar"><input type="text" placeholder="Search deals..." /><select><option>All Statuses</option><option>New Deal</option><option>Recommending</option><option>Paperwork</option><option>Completed</option></select></div>
    <div className="tw"><table><thead><tr><th>Deal #</th><th>Dealer</th><th>Customer</th><th>Unit</th><th>Products Recommended</th><th>Products Sold</th><th>Revenue</th><th>Status</th><th>Action</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('svc-fi-detail')}>FI-0014</span></td><td>Atlantic RV</td><td>Julie Fournier</td><td>2024 Forest River Wildwood</td><td>4</td><td>—</td><td>—</td><td><span className="bg in-progress">Recommending</span></td><td><button className="btn btn-p btn-sm" onClick={() => showPage('svc-fi-detail')}>Process</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('svc-fi-detail')}>FI-0013</span></td><td>Smith's RV</td><td>Robert Martin</td><td>2024 Jayco Jay Flight</td><td>3</td><td>2</td><td>$2,800</td><td><span className="bg completed">Completed</span></td><td><button className="btn btn-o btn-sm">View</button></td></tr>
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'svc-fi-detail' ? 'active' : ''}`} id="page-svc-fi-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-fi')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">FI-0014 — Julie Fournier</div><div className="detail-meta">Atlantic RV · 2024 Forest River Wildwood · 4 products recommended</div></div><span className="bg in-progress" style={{fontSize: 13, padding: '6px 16px'}}>Recommending</span></div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Recommended Products</span><span className="pn-a">+ Add Product</span></div>
        <div className="tw"><table><thead><tr><th>Product</th><th>Provider</th><th>Term</th><th>Cost to Dealer</th><th>Retail Price</th><th>Margin</th><th>Customer Decision</th></tr></thead><tbody>
          <tr><td style={{fontWeight: 500}}>Extended Warranty (5yr)</td><td>Guardsman RV</td><td>60 mo</td><td>$1,200</td><td>$2,495</td><td style={{color: '#22c55e', fontWeight: 600}}>$1,295</td><td><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}}><option>Pending</option><option>Accepted</option><option>Declined</option></select></td></tr>
          <tr><td style={{fontWeight: 500}}>GAP Insurance</td><td>IBC Financial</td><td>Loan term</td><td>$450</td><td>$995</td><td style={{color: '#22c55e', fontWeight: 600}}>$545</td><td><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}}><option>Pending</option><option>Accepted</option><option>Declined</option></select></td></tr>
          <tr><td style={{fontWeight: 500}}>Paint & Fabric Protection</td><td>ProGuard</td><td>5 yr</td><td>$280</td><td>$695</td><td style={{color: '#22c55e', fontWeight: 600}}>$415</td><td><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}}><option>Pending</option><option>Accepted</option><option>Declined</option></select></td></tr>
          <tr><td style={{fontWeight: 500}}>Roadside Assistance (3yr)</td><td>RV Assist Co</td><td>36 mo</td><td>$150</td><td>$395</td><td style={{color: '#22c55e', fontWeight: 600}}>$245</td><td><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}}><option>Pending</option><option>Accepted</option><option>Declined</option></select></td></tr>
        </tbody></table></div>
        <div style={{padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600}}><span>Total Potential Margin</span><span style={{color: '#22c55e'}}>$2,500</span></div>
      </div>
      
      <div className="pn"><div className="pn-h"><span className="pn-t">Communication</span></div>
        <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">SC</div><div className="comm-content"><div className="comm-name">Sarah Chen <span style={{fontWeight: 400, color: '#888'}}>(Atlantic RV)</span></div><div className="comm-text">Customer is financing through RBC at 4.99%. She's open to extended warranty and GAP but price-sensitive. Please send options.</div><div className="comm-time">Mar 15, 4:30 PM</div></div></div><div className="comm-msg"><div className="comm-avatar op">JD</div><div className="comm-content"><div className="comm-name">Jonathan D. <span style={{fontWeight: 400, color: '#888'}}>(Operator)</span></div><div className="comm-text">4 products recommended above. Extended warranty from Guardsman is our best margin. I'd push the GAP too since she's financing. Paint protection is a good upsell.</div><div className="comm-time">Mar 16, 9:00 AM</div></div></div></div>
        <div style={{padding: '16px 20px'}}><textarea placeholder="Update the dealer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{textAlign: 'right', marginTop: 8}}><button className="btn btn-p btn-sm">Send</button></div></div>
      </div>
    </div>
    <div>
      <div className="cd-section"><div className="cd-section-h">Deal Info</div><div className="cd-row"><span className="cd-label">Customer</span><span className="cd-value">Julie Fournier</span></div><div className="cd-row"><span className="cd-label">Unit</span><span className="cd-value">2024 FR Wildwood</span></div><div className="cd-row"><span className="cd-label">Sale Price</span><span className="cd-value">$38,900</span></div><div className="cd-row"><span className="cd-label">Financing</span><span className="cd-value">RBC 4.99%</span></div></div>
      <div className="cd-section"><div className="cd-section-h">Dealer</div><div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value cid" onClick={() => showPage('dealer-detail')}>Atlantic RV</span></div><div className="cd-row"><span className="cd-label">Contact</span><span className="cd-value">Sarah Chen</span></div></div>
      <div className="cd-section"><div className="cd-section-h">Summary</div><div className="cd-row"><span className="cd-label">Products Offered</span><span className="cd-value">4</span></div><div className="cd-row"><span className="cd-label">Potential Revenue</span><span className="cd-value" style={{color: '#22c55e', fontWeight: 600}}>$2,500</span></div></div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'svc-fi-new' ? 'active' : ''}`} id="page-svc-fi-new">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-fi')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">New F&I Deal</div><div className="detail-meta">Flag a deal for F&I product recommendations</div></div></div>
  <div className="pn"><div className="form-grid"><div className="form-group"><label>Dealer</label><select><option>Select...</option><option>Smith's RV</option><option>Atlantic RV</option><option>Prairie Wind</option></select></div><div className="form-group"><label>Customer</label><input placeholder="Customer name" /></div><div className="form-group"><label>Unit</label><input placeholder="VIN or Year Make Model" /></div><div className="form-group"><label>Sale Price</label><input placeholder="$0.00" /></div><div className="form-group"><label>Financing Source</label><input placeholder="e.g. RBC 4.99%" /></div><div className="form-group"><label>Delivery Date</label><input type="date" /></div><div className="form-group full"><label>Notes / Customer Preferences</label><textarea placeholder="What is the customer open to? Budget constraints?"></textarea></div></div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('svc-fi')}>Create Deal</button><button className="btn btn-o" onClick={() => showPage('svc-fi')}>Cancel</button></div></div>
</div>

<div className={`page ${activePage === 'svc-warranty' ? 'active' : ''}`} id="page-svc-warranty">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Manage OEM and aftermarket warranty plans. Track coverage, renewals, and link to claims. <strong>We will sell plans directly.</strong></div><button className="btn btn-p btn-sm" onClick={() => showPage('svc-warranty-new')}>+ Add Warranty Plan</button></div>
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(5,1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Active Plans</div><div className="sc-v" style={{color: '#2563eb'}}>14</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Expiring (30d)</div><div className="sc-v" style={{color: '#d97706'}}>3</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Plans Sold (MTD)</div><div className="sc-v" style={{color: '#22c55e'}}>5</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Sales Revenue (MTD)</div><div className="sc-v">$12,475</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Claims Linked</div><div className="sc-v">8</div></div>
  </div>
  <div className="tabs"><div className="tab active" onClick={(e) => switchTab(e)}>All Plans (14)</div><div className="tab" onClick={(e) => switchTab(e)}>Expiring Soon (3)</div><div className="tab" onClick={(e) => switchTab(e)}>Plans for Sale</div><div className="tab" onClick={(e) => switchTab(e)}>Providers</div></div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
    <div className="filter-bar"><input type="text" placeholder="Search by customer, VIN, or plan..." /><select><option>All Providers</option><option>Guardsman RV</option><option>XtraRide</option><option>Wholesale Warranties</option><option>Jayco OEM</option></select><select><option>All Dealers</option><option>Smith's RV</option><option>Atlantic RV</option></select></div>
    <div className="tw"><table><thead><tr><th>Plan #</th><th>Dealer</th><th>Customer</th><th>VIN</th><th>Provider</th><th>Coverage</th><th>Expiry</th><th>Claims</th><th>Sold By Us</th><th>Status</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>WP-0041</td><td>Smith's RV</td><td>Robert Martin</td><td><span className="vin">...4K1</span></td><td>Guardsman RV</td><td>Comprehensive</td><td>Feb 10, 2031</td><td>1</td><td><span className="bg active">Yes · $2,495</span></td><td><span className="bg active">Active</span></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>WP-0038</td><td>Atlantic RV</td><td>Marie Bouchard</td><td><span className="vin">...7293</span></td><td>XtraRide</td><td>Powertrain+</td><td>Jan 15, 2029</td><td>0</td><td><span className="bg draft">No</span></td><td><span className="bg active">Active</span></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>WP-0035</td><td>Prairie Wind</td><td>James Flett</td><td><span className="vin">...4012</span></td><td>Jayco OEM</td><td>OEM 2-Year</td><td><span style={{color: '#dc2626', fontWeight: 600}}>Apr 15, 2026</span></td><td>1</td><td><span className="bg draft">No</span></td><td><span className="bg pending">Expiring</span></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>WP-0033</td><td>Smith's RV</td><td>Lisa Wong</td><td><span className="vin">...2K8</span></td><td>Wholesale Warranties</td><td>Gold</td><td>Dec 1, 2030</td><td>2</td><td><span className="bg active">Yes · $1,995</span></td><td><span className="bg active">Active</span></td></tr>
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'svc-warranty-new' ? 'active' : ''}`} id="page-svc-warranty-new">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-warranty')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Add / Sell Warranty Plan</div><div className="detail-meta">Register an existing plan or sell a new one through the platform</div></div></div>
  <div className="pn"><div className="form-grid">
    <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Plan Type</label><select style={{marginTop: 6, padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', background: '#fafafa'}}><option>Sell New Plan (we earn commission)</option><option>Register Existing Plan (track only)</option></select></div>
    <div className="form-group"><label>Dealer</label><select><option>Select...</option><option>Smith's RV</option><option>Atlantic RV</option></select></div>
    <div className="form-group"><label>Customer</label><input placeholder="Customer name" /></div>
    <div className="form-group"><label>VIN</label><input placeholder="Unit VIN" /></div>
    <div className="form-group"><label>Provider</label><select><option>Guardsman RV</option><option>XtraRide</option><option>Wholesale Warranties</option><option>Jayco OEM</option><option>Other...</option></select></div>
    <div className="form-group"><label>Coverage Level</label><select><option>Comprehensive</option><option>Powertrain+</option><option>Gold</option><option>Platinum</option><option>OEM Standard</option></select></div>
    <div className="form-group"><label>Term (years)</label><select><option>2</option><option>3</option><option defaultSelected>5</option><option>7</option></select></div>
    <div className="form-group"><label>Our Cost</label><input placeholder="$0.00" /></div>
    <div className="form-group"><label>Retail Price (to customer)</label><input placeholder="$0.00" /></div>
    <div className="form-group"><label>Start Date</label><input type="date" /></div>
    <div className="form-group"><label>Expiry Date</label><input type="date" /></div>
    <div className="form-group full"><label>Notes</label><textarea placeholder="Plan details, special terms, renewal instructions..."></textarea></div>
  </div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('svc-warranty')}>Save Plan</button><button className="btn btn-o" onClick={() => showPage('svc-warranty')}>Cancel</button></div></div>
</div>


<div className={`page ${activePage === 'svc-parts' ? 'active' : ''}`} id="page-svc-parts">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div style={{fontSize: 13, color: '#666'}}>Dealers request parts. You source, price, and track delivery. <strong>Shop coming soon.</strong></div><button className="btn btn-p btn-sm" onClick={() => showPage('svc-parts-new')}>+ New Parts Order</button></div>
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Open Orders</div><div className="sc-v" style={{color: '#2563eb'}}>8</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Shipped</div><div className="sc-v" style={{color: '#a855f7'}}>3</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Order Value (MTD)</div><div className="sc-v">$8,420</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Avg Fulfillment</div><div className="sc-v">3.2d</div></div>
  </div>
  <div className="pn">
    <div className="filter-bar"><input type="text" placeholder="Search orders..." /><select><option>All Statuses</option><option>New Request</option><option>Sourcing</option><option>Quoted</option><option>Ordered</option><option>Shipped</option><option>Delivered</option></select><select><option>All Dealers</option><option>Smith's RV</option><option>Atlantic RV</option></select></div>
    <div className="tw"><table><thead><tr><th>Order #</th><th>Dealer</th><th>Items</th><th>Related Claim</th><th>Est. Cost</th><th>Status</th><th>ETA</th><th>Updated</th><th>Action</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('svc-parts-detail')}>PO-0038</span></td><td>Smith's RV</td><td>Sidewall panel, adhesive, sealant</td><td>CLM-0248</td><td>—</td><td><span className="bg new-req">New Request</span></td><td>—</td><td>2h ago</td><td><button className="btn btn-p btn-sm" onClick={() => showPage('svc-parts-detail')}>Source</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('svc-parts-detail')}>PO-0037</span></td><td>Atlantic RV</td><td>Roof vent (14x14), butyl tape</td><td>CLM-0247</td><td>$285</td><td><span className="bg quoted">Quoted</span></td><td>—</td><td>Yesterday</td><td><button className="btn btn-o btn-sm">View</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}><span className="cid" onClick={() => showPage('svc-parts-detail')}>PO-0034</span></td><td>Prairie Wind</td><td>Slide seal (12ft), slide motor</td><td>CLM-0246</td><td>$420</td><td><span className="bg shipped">Shipped</span></td><td>Mar 18</td><td>Mar 14</td><td><button className="btn btn-o btn-sm">Track</button></td></tr>
      <tr><td style={{fontWeight: 500, color: 'var(--brand)'}}>PO-0031</td><td>Smith's RV</td><td>Hinge set, cabinet screws</td><td>CLM-0243</td><td>$45</td><td><span className="bg delivered-st">Delivered</span></td><td>—</td><td>Mar 10</td><td><button className="btn btn-o btn-sm">View</button></td></tr>
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'svc-parts-detail' ? 'active' : ''}`} id="page-svc-parts-detail">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-parts')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">PO-0038 — Parts Order</div><div className="detail-meta">Smith's RV Centre · Related to CLM-0248 · 3 items requested</div></div><span className="bg new-req" style={{fontSize: 13, padding: '6px 16px'}}>New Request</span></div>
  <div style={{display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 20}}>
    <div>
      <div className="pn" style={{marginBottom: 16}}><div className="pn-h"><span className="pn-t">Requested Items</span><span className="pn-a">+ Add Item</span></div>
        <div className="tw"><table><thead><tr><th>Item</th><th>Part #</th><th>Qty</th><th>Source</th><th>Our Cost</th><th>Dealer Price</th><th>Status</th></tr></thead><tbody>
          <tr><td style={{fontWeight: 500}}>Sidewall Panel (2x3 section)</td><td style={{color: '#888'}}>—</td><td>1</td><td><select style={{padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}}><option>Finding source...</option><option>Jayco Direct</option><option>RV Wholesale</option><option>PartsPro</option></select></td><td><input style={{width: 70, padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}} placeholder="$0" /></td><td><input style={{width: 70, padding: '4px 8px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 12}} placeholder="$0" /></td><td><span className="bg new-req">Sourcing</span></td></tr>
          <tr><td style={{fontWeight: 500}}>Panel Adhesive (1 gal)</td><td style={{color: '#888'}}>ADH-5500</td><td>1</td><td>RV Wholesale</td><td>$42</td><td>$65</td><td><span className="bg quoted">In Stock</span></td></tr>
          <tr><td style={{fontWeight: 500}}>Lap Sealant</td><td style={{color: '#888'}}>SEAL-120</td><td>2</td><td>RV Wholesale</td><td>$18/ea</td><td>$28/ea</td><td><span className="bg quoted">In Stock</span></td></tr>
        </tbody></table></div>
        <div style={{padding: '12px 20px', borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'flex-end', gap: 8}}><button className="btn btn-o btn-sm">Save Quotes</button><button className="btn btn-p btn-sm">Send Quote to Dealer</button></div>
      </div>
      <div className="pn"><div className="pn-h"><span className="pn-t">Communication</span></div>
        <div className="comm-box"><div className="comm-msg"><div className="comm-avatar dl">MS</div><div className="comm-content"><div className="comm-name">Mike Smith <span style={{fontWeight: 400, color: '#888'}}>(Smith's RV)</span></div><div className="comm-text">Need parts for the delamination repair on CLM-0248. Sidewall panel, adhesive, and sealant. Please quote ASAP — customer wants this done.</div><div className="comm-time">Mar 16, 8:45 AM</div></div></div></div>
        <div style={{padding: '16px 20px'}}><textarea placeholder="Update the dealer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none'}}></textarea><div style={{textAlign: 'right', marginTop: 8}}><button className="btn btn-p btn-sm">Send</button></div></div>
      </div>
    </div>
    <div>
      <div className="cd-section"><div className="cd-section-h">Order Info</div><div className="cd-row"><span className="cd-label">Order #</span><span className="cd-value">PO-0038</span></div><div className="cd-row"><span className="cd-label">Related Claim</span><span className="cd-value cid" onClick={() => showPage('claim-detail')}>CLM-0248</span></div><div className="cd-row"><span className="cd-label">Items</span><span className="cd-value">3</span></div><div className="cd-row"><span className="cd-label">Status</span><span className="cd-value"><span className="bg new-req">Sourcing</span></span></div></div>
      <div className="cd-section"><div className="cd-section-h">Dealer</div><div className="cd-row"><span className="cd-label">Dealership</span><span className="cd-value cid" onClick={() => showPage('dealer-detail')}>Smith's RV</span></div><div className="cd-row"><span className="cd-label">Requested By</span><span className="cd-value">Mike Smith</span></div></div>
      <div className="cd-section"><div className="cd-section-h">Shipping</div><div className="cd-row"><span className="cd-label">Method</span><span className="cd-value" style={{color: '#aaa'}}>Not yet ordered</span></div><div className="cd-row"><span className="cd-label">Tracking</span><span className="cd-value" style={{color: '#aaa'}}>—</span></div><div className="cd-row"><span className="cd-label">ETA</span><span className="cd-value" style={{color: '#aaa'}}>—</span></div></div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'svc-parts-new' ? 'active' : ''}`} id="page-svc-parts-new">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('svc-parts')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">New Parts Order</div><div className="detail-meta">Request or order parts for a dealer</div></div></div>
  <div className="pn"><div className="form-grid"><div className="form-group"><label>Dealer</label><select><option>Select...</option><option>Smith's RV</option><option>Atlantic RV</option></select></div><div className="form-group"><label>Related Claim</label><select><option>None</option><option>CLM-0248</option><option>CLM-0247</option><option>CLM-0246</option></select></div><div className="form-group full"><label>Items Needed</label><textarea placeholder="List parts needed, part numbers if known, quantities...">1x Sidewall panel (2x3 section)
1x Panel adhesive (1 gal)
2x Lap sealant</textarea></div><div className="form-group"><label>Priority</label><select><option>Normal</option><option>Urgent</option></select></div><div className="form-group"><label>Preferred Source</label><input placeholder="e.g. Jayco Direct, RV Wholesale" /></div><div className="form-group full"><label>Notes</label><textarea placeholder="Shipping instructions, dealer preferences..."></textarea></div></div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('svc-parts')}>Create Order</button><button className="btn btn-o" onClick={() => showPage('svc-parts')}>Cancel</button></div></div>
</div>

<div className={`page ${activePage === 'marketplace' ? 'active' : ''}`} id="page-marketplace">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div><div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Service Modules</div><div style={{fontSize: 13, color: '#888'}}>Manage platform services. Toggle modules on/off and set pricing per service.</div></div></div>
  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
    <div className="svc-card"><div className="svc-icon" style={{background: '#eff6ff', color: '#3b82f6'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg></div><div className="svc-body"><div className="svc-title">Claims Processing</div><div className="svc-desc">DAF, PDI, Warranty, Extended, Insurance</div><div className="svc-meta"><span className="bg active">Live</span><span style={{color: '#555'}}>Included</span><span className="cid" onClick={() => showPage('queue')} style={{marginLeft: 'auto', fontSize: 11}}>Open →</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
    <div className="svc-card"><div className="svc-icon" style={{background: '#faf5ff', color: '#a855f7'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div className="svc-body"><div className="svc-title">Financing Services</div><div className="svc-desc">Lender applications, rate shopping, approval tracking</div><div className="svc-meta"><span className="bg active">Live</span><span style={{color: '#555'}}>$199/mo</span><span className="cid" onClick={() => showPage('svc-financing')} style={{marginLeft: 'auto', fontSize: 11}}>Open →</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
    <div className="svc-card"><div className="svc-icon" style={{background: '#fffbeb', color: '#f59e0b'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg></div><div className="svc-body"><div className="svc-title">F&I Services</div><div className="svc-desc">Product recommendations, compliance, margin optimization</div><div className="svc-meta"><span className="bg active">Live</span><span style={{color: '#555'}}>$299/mo</span><span className="cid" onClick={() => showPage('svc-fi')} style={{marginLeft: 'auto', fontSize: 11}}>Open →</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
    <div className="svc-card"><div className="svc-icon" style={{background: '#f0fdf4', color: '#22c55e'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="18" height="18" rx="2"/><path d="M9 12l2 2 4-4"/></svg></div><div className="svc-body"><div className="svc-title">Warranty & Extended Plans</div><div className="svc-desc">Plan management, renewals, direct sales to customers</div><div className="svc-meta"><span className="bg active">Live</span><span style={{color: '#555'}}>Included + commissions</span><span className="cid" onClick={() => showPage('svc-warranty')} style={{marginLeft: 'auto', fontSize: 11}}>Open →</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
    <div className="svc-card"><div className="svc-icon" style={{background: '#fef3c7', color: '#d97706'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg></div><div className="svc-body"><div className="svc-title">Parts & Accessories</div><div className="svc-desc">Sourcing, quoting, delivery tracking. Shop coming soon.</div><div className="svc-meta"><span className="bg active">Live</span><span style={{color: '#555'}}>$149/mo</span><span className="cid" onClick={() => showPage('svc-parts')} style={{marginLeft: 'auto', fontSize: 11}}>Open →</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
    <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#fef2f2', color: '#ef4444'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><path d="M8 14s1.5 2 4 2 4-2 4-2"/></svg></div><div className="svc-body"><div className="svc-title">Digital Marketing</div><div className="svc-desc">SEO, PPC, social, lead generation</div><div className="svc-meta"><span className="bg pending">Coming Q3</span><span style={{color: '#555'}}>Custom</span></div></div><div className="toggle"></div></div>
    <div className="svc-card" onClick={() => showPage('mkt-listings')} style={{cursor: 'pointer'}}><div className="svc-icon" style={{background: '#e0e7ff', color: '#4f46e5'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><div className="svc-body"><div className="svc-title">Dealer Marketplace</div><div className="svc-desc">Dealer-to-dealer listings and network</div><div className="svc-meta"><span className="bg active">Live</span><span style={{color: '#555'}}>Commission</span><span className="cid" style={{marginLeft: 'auto', fontSize: 11}}>Open →</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
    <div className="svc-card" onClick={() => showPage('mkt-auctions')} style={{cursor: 'pointer'}}><div className="svc-icon" style={{background: '#dcfce7', color: '#16a34a'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 20V10"/><path d="M18 20V4"/><path d="M6 20v-4"/></svg></div><div className="svc-body"><div className="svc-title">Live Auctions</div><div className="svc-desc">Real-time wholesale bidding</div><div className="svc-meta"><span className="bg active">Live</span><span style={{color: '#555'}}>Transaction fees</span><span className="cid" style={{marginLeft: 'auto', fontSize: 11}}>Open →</span></div></div><div className="toggle on" onClick={(e) => (e.currentTarget as HTMLElement).classList.toggle('on')}></div></div>
    <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#fef2f2', color: '#dc2626'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07"/></svg></div><div className="svc-body"><div className="svc-title">Roadside Assistance (B2C)</div><div className="svc-desc">24/7 emergency support direct to RV owners</div><div className="svc-meta"><span className="bg pending">Coming Q4</span><span style={{color: '#555'}}>Per-subscriber</span></div></div><div className="toggle"></div></div>
    <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#f0f4f8', color: '#64748b'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z"/></svg></div><div className="svc-body"><div className="svc-title">Service Dept Support</div><div className="svc-desc">Mobile service, scheduling, technician training</div><div className="svc-meta"><span className="bg pending">Coming Q3</span><span style={{color: '#555'}}>Custom</span></div></div><div className="toggle"></div></div>
  </div>
</div>


<div className={`page ${activePage === 'billing' ? 'active' : ''}`} id="page-billing">
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Outstanding</div><div className="sc-v" style={{color: '#dc2626'}}>$8,450</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Collected (MTD)</div><div className="sc-v" style={{color: '#22c55e'}}>$34,200</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Pending Invoices</div><div className="sc-v">12</div></div>
    <div className="sc"><div className="sc-l" style={{marginBottom: 8}}>Wallet Balances</div><div className="sc-v">$15,800</div></div>
  </div>
  <div className="pn"><div className="pn-h"><span className="pn-t">All Invoices</span><span className="pn-a" onClick={() => showPage('create-invoice')}>+ Create Invoice</span></div>
    <div className="filter-bar"><input type="text" placeholder="Search invoices..." /><select><option>All Dealers</option><option>Smith's RV</option><option>Atlantic RV</option><option>Prairie Wind</option></select><select><option>All Statuses</option><option>Pending</option><option>Paid</option><option>Overdue</option></select><select><option>All Types</option><option>Subscription</option><option>Claim Fee</option><option>Service Add-on</option><option>DAF/PDI Fee</option></select></div>
    <div className="tw"><table><thead><tr><th>Invoice</th><th>Dealer</th><th>Type</th><th>Description</th><th>Amount</th><th>Tax</th><th>Total</th><th>Status</th><th>Issued</th></tr></thead><tbody>
      {opInvoices.length === 0
        ? <tr><td colSpan={9} style={{textAlign:'center',color:'#888',padding:20}}>{dataError ? dataError : 'No invoices found'}</td></tr>
        : opInvoices.map((inv: any) => (
          <tr key={inv.id}>
            <td style={{fontWeight: 500}}>{inv.invoiceNumber || inv.id}</td>
            <td>{inv.dealershipName || inv.dealership?.name || '—'}</td>
            <td>{inv.type || inv.invoiceType || '—'}</td>
            <td>{inv.description || '—'}</td>
            <td>{inv.amount ? `$${Number(inv.amount).toFixed(2)}` : '—'}</td>
            <td>{inv.taxAmount ? `$${Number(inv.taxAmount).toFixed(2)}` : '—'}</td>
            <td style={{fontWeight: 600}}>{inv.total ? `$${Number(inv.total).toFixed(2)}` : '—'}</td>
            <td><span className={`bg ${inv.status === 'paid' ? 'pay-recv' : inv.status}`}>{inv.status}</span></td>
            <td>{inv.issuedAt || inv.createdAt ? new Date(inv.issuedAt || inv.createdAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
          </tr>
        ))
      }
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'create-invoice' ? 'active' : ''}`} id="page-create-invoice">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('billing')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">New Invoice</div><div className="detail-meta">Create and send an invoice to a dealer</div></div><button className="btn btn-o btn-sm">Preview</button><button className="btn btn-p btn-sm" onClick={() => showPage('billing')}>Save & Send</button></div>

  
  <div className="pn" style={{marginBottom: 20}}>
    <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr 1fr 1fr auto', gap: 16, padding: '16px 20px', alignItems: 'end', borderBottom: '1px solid #f0f0f0'}}>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Bill To</span><select style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option>Select dealer...</option><option>Smith's RV Centre</option><option>Atlantic RV</option><option>Prairie Wind RV</option></select></div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Invoice #</span><input value="INV-2026-0090" style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}} /></div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Invoice Date</span><input type="date" value="2026-03-17" style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}} /></div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Payment Due</span><select style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option>On Receipt</option><option defaultSelected>Net 15</option><option>Net 30</option></select></div>
      <div style={{display: 'flex', flexDirection: 'column', gap: 4}}><span style={{fontSize: 11, color: '#888', fontWeight: 500}}>Payment Method</span><select style={{padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa'}}><option>Charge card (Stripe)</option><option>Send via email</option><option>Deduct from wallet</option><option>Interac e-Transfer</option></select></div>
    </div>
    <div style={{padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap'}}>
      <span style={{fontSize: 12, color: '#888', fontWeight: 500, marginRight: 4}}>Quick Add:</span>
      <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Plan A ($349)</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Claim Fee 10%</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11}}>DAF ($25)</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11}}>PDI ($15)</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Financing ($199)</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11}}>F&I ($299)</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Parts ($149)</button>
      <button className="btn btn-o btn-sm" style={{fontSize: 11}}>Custom Item</button>
      <div style={{marginLeft: 'auto', display: 'flex', gap: 8, alignItems: 'center'}}>
        <span style={{fontSize: 11, color: '#888'}}>Related:</span>
        <select style={{padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontFamily: 'inherit', background: '#fafafa'}}><option>No claim</option><option>CLM-0248</option><option>CLM-0247</option></select>
        <select style={{padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontFamily: 'inherit', background: '#fafafa'}}><option>No service</option><option>FIN-0023</option><option>FI-0014</option><option>PO-0038</option></select>
        <select style={{padding: '6px 8px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 11, fontFamily: 'inherit', background: '#fafafa'}}><option>One-time</option><option>Monthly</option><option>Quarterly</option></select>
      </div>
    </div>
  </div>

  
  <div className="pn">
    <table style={{width: '100%'}}><thead><tr>
      <th style={{width: '45%'}}>Item</th><th style={{width: '12%', textAlign: 'center'}}>Qty</th><th style={{width: '18%', textAlign: 'right'}}>Price</th><th style={{width: '18%', textAlign: 'right'}}>Amount</th><th style={{width: '7%'}}></th>
    </tr></thead><tbody id="inv-lines">
      
      <tr><td style={{padding: '14px 16px'}}>
        <select style={{width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', marginBottom: 6}}>
          <option>Select item...</option>
          <optgroup label="Subscriptions"><option defaultSelected>Plan A Monthly Subscription</option><option>Plan B Wallet Top-Up</option></optgroup>
          <optgroup label="Claim Fees"><option>Claim Processing Fee (10%)</option><option>DAF Inspection Fee</option><option>PDI Processing Fee</option></optgroup>
          <optgroup label="Service Add-ons"><option>Financing Services</option><option>F&I Services</option><option>Parts & Accessories</option></optgroup>
          <option style={{fontStyle: 'italic', color: '#888'}}>+ Search parts...</option>
        </select>
        <input value="Monthly subscription - March 2026" style={{width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', color: '#555'}} />
      </td><td style={{textAlign: 'center', padding: '14px 8px'}}><input value="1" style={{width: 50, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'center', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 8px'}}><input value="349.00" style={{width: 90, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'right', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 16px', fontWeight: 600, fontSize: 13}}>$349.00</td><td style={{padding: '14px 8px', textAlign: 'center'}}><button onClick={(e) => (e.currentTarget as HTMLElement).closest("tr")?.remove()} style={{background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18}}>×</button></td></tr>
      
      <tr><td style={{padding: '14px 16px'}}>
        <select style={{width: '100%', padding: '8px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', marginBottom: 6}}><option defaultSelected>Claim Processing Fee (10%)</option></select>
        <input value="10% fee on CLM-2026-0248 ($1,240 approved)" style={{width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', color: '#555'}} />
      </td><td style={{textAlign: 'center', padding: '14px 8px'}}><input value="1" style={{width: 50, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'center', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 8px'}}><input value="124.00" style={{width: 90, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'right', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 16px', fontWeight: 600, fontSize: 13}}>$124.00</td><td style={{padding: '14px 8px', textAlign: 'center'}}><button onClick={(e) => (e.currentTarget as HTMLElement).closest("tr")?.remove()} style={{background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18}}>×</button></td></tr>
      
      <tr><td style={{padding: '14px 16px'}}>
        <div style={{position: 'relative'}}>
          <input value="Sidewall Panel (2x3)" placeholder="Search parts..." style={{width: '100%', padding: '8px 10px 8px 30px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', marginBottom: 6}} />
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#aaa" strokeWidth="2" style={{position: 'absolute', left: 10, top: 10}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
        </div>
        <input value="Replacement panel for VIN ...4K1 delamination repair" style={{width: '100%', padding: '6px 10px', border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 12, fontFamily: 'inherit', background: '#fafafa', color: '#555'}} />
        
        <div style={{position: 'absolute', zIndex: 10, background: '#fff', border: '1px solid #e0e0e0', borderRadius: 8, boxShadow: '0 4px 12px rgba(0,0,0,0.1)', width: 400, display: 'none'}}>
          <div style={{padding: '8px 12px', fontSize: 12, borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between'}}><span><strong>Sidewall Panel (2x3)</strong> — Structural</span><span style={{color: '#888'}}>$285.00</span></div>
          <div style={{padding: '8px 12px', fontSize: 12, borderBottom: '1px solid #f0f0f0', cursor: 'pointer', display: 'flex', justifyContent: 'space-between'}}><span><strong>Sidewall Panel (4x4)</strong> — Structural</span><span style={{color: '#888'}}>$420.00</span></div>
          <div style={{padding: '8px 12px', fontSize: 12, cursor: 'pointer', display: 'flex', justifyContent: 'space-between'}}><span><strong>Sidewall Sealant</strong> — Exterior</span><span style={{color: '#888'}}>$18.00</span></div>
        </div>
      </td><td style={{textAlign: 'center', padding: '14px 8px'}}><input value="1" style={{width: 50, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'center', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 8px'}}><input value="285.00" style={{width: 90, padding: 8, border: '1px solid #e0e0e0', borderRadius: 6, fontSize: 13, textAlign: 'right', fontFamily: 'inherit'}} /></td><td style={{textAlign: 'right', padding: '14px 16px', fontWeight: 600, fontSize: 13}}>$285.00</td><td style={{padding: '14px 8px', textAlign: 'center'}}><button onClick={(e) => (e.currentTarget as HTMLElement).closest("tr")?.remove()} style={{background: 'none', border: 'none', color: '#ccc', cursor: 'pointer', fontSize: 18}}>×</button></td></tr>
    </tbody></table>

    
    <div style={{padding: '12px 16px', borderTop: '1px solid #f0f0f0', display: 'flex', gap: 12}}>
      <button onClick={() => addServiceRow()} style={{background: 'none', border: 'none', color: 'var(--brand)', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="16"/><line x1="8" y1="12" x2="16" y2="12"/></svg> Add service / subscription</button>
      <button onClick={() => addPartRow()} style={{background: 'none', border: 'none', color: '#a855f7', fontSize: 13, fontWeight: 500, cursor: 'pointer', fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 6}}><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg> Search & add part</button>
    </div>

    
    <div style={{borderTop: '2px solid #f0f0f0', padding: 20}}>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: 40, marginBottom: 8, fontSize: 13}}><span style={{color: '#888', width: 120, textAlign: 'right'}}>Subtotal</span><span style={{fontWeight: 500, width: 100, textAlign: 'right'}}>$758.00</span></div>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: 40, marginBottom: 8, fontSize: 13, alignItems: 'center'}}><span style={{color: '#888', width: 120, textAlign: 'right'}}>Tax <select style={{padding: '2px 6px', border: '1px solid #e0e0e0', borderRadius: 4, fontSize: 11, fontFamily: 'inherit', marginLeft: 4}}><option defaultSelected>HST 13%</option><option>GST 5%</option><option>GST+QST</option><option>No Tax</option></select></span><span style={{fontWeight: 500, width: 100, textAlign: 'right'}}>$98.54</span></div>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: 40, marginBottom: 8, fontSize: 12}}><span style={{color: 'var(--brand)', cursor: 'pointer', width: 120, textAlign: 'right'}}>+ Add discount</span><span style={{width: 100}}></span></div>
      <div style={{display: 'flex', justifyContent: 'flex-end', gap: 40, paddingTop: 12, borderTop: '1px solid #f0f0f0', fontSize: 16, fontWeight: 700}}><span>Total <span style={{fontWeight: 400, fontSize: 12, color: '#888'}}>CAD</span></span><span style={{width: 100, textAlign: 'right'}}>$856.54</span></div>
    </div>

    
    <div style={{borderTop: '1px solid #f0f0f0', padding: '16px 20px'}}>
      <div style={{fontSize: 12, fontWeight: 500, color: '#888', marginBottom: 6}}>Notes / Terms</div>
      <textarea placeholder="Enter notes or terms visible to the dealer..." style={{width: '100%', padding: '10px 12px', border: '1px solid #e0e0e0', borderRadius: 8, fontSize: 13, fontFamily: 'inherit', minHeight: 50, resize: 'vertical', outline: 'none', background: '#fafafa'}}></textarea>
    </div>

    <div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('billing')}>Save & Send</button><button className="btn btn-o" onClick={() => showPage('billing')}>Save Draft</button><button className="btn btn-o" onClick={() => showPage('billing')}>Cancel</button></div>
  </div>
</div>

<div className={`page ${activePage === 'reports' ? 'active' : ''}`} id="page-reports">
  <div style={{display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16, marginBottom: 20}}>
    <div className="sc" style={{padding: 24}}><div className="sc-l" style={{marginBottom: 8}}>Revenue (YTD)</div><div className="sc-v">$128,400</div><div className="sc-c up">+23%</div></div>
    <div className="sc" style={{padding: 24}}><div className="sc-l" style={{marginBottom: 8}}>Claims (YTD)</div><div className="sc-v">248</div><div className="sc-c up">+18%</div></div>
    <div className="sc" style={{padding: 24}}><div className="sc-l" style={{marginBottom: 8}}>Service Revenue (MTD)</div><div className="sc-v">$7,200</div><div className="sc-c up">Financing + F&I + Parts</div></div>
  </div>
  <div className="pg pg-2">
    <div className="pn"><div className="pn-h"><span className="pn-t">Revenue by Source</span></div><div style={{padding: 20}}>
      <div style={{marginBottom: 12}}><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}><span>Claims Processing</span><span style={{fontWeight: 600}}>$42,800</span></div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4}}><div style={{height: '100%', width: '65%', background: 'var(--brand)', borderRadius: 4}}></div></div></div>
      <div style={{marginBottom: 12}}><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}><span>Subscriptions</span><span style={{fontWeight: 600}}>$31,200</span></div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4}}><div style={{height: '100%', width: '48%', background: '#3b82f6', borderRadius: 4}}></div></div></div>
      <div style={{marginBottom: 12}}><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}><span>Warranty Plan Sales</span><span style={{fontWeight: 600}}>$12,475</span></div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4}}><div style={{height: '100%', width: '19%', background: '#22c55e', borderRadius: 4}}></div></div></div>
      <div style={{marginBottom: 12}}><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}><span>Service Add-ons</span><span style={{fontWeight: 600}}>$7,200</span></div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4}}><div style={{height: '100%', width: '11%', background: '#a855f7', borderRadius: 4}}></div></div></div>
      <div><div style={{display: 'flex', justifyContent: 'space-between', fontSize: 13, marginBottom: 4}}><span>Parts Margin</span><span style={{fontWeight: 600}}>$3,420</span></div><div style={{height: 8, background: '#f0f0f0', borderRadius: 4}}><div style={{height: '100%', width: '5%', background: '#f59e0b', borderRadius: 4}}></div></div></div>
    </div></div>
    <div className="pn"><div className="pn-h"><span className="pn-t">Top Dealers</span></div>
      <div style={{padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', fontSize: 13}}><span style={{fontWeight: 500}}>Smith's RV Centre</span><span style={{fontWeight: 600}}>$28,400</span></div>
      <div style={{padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', fontSize: 13}}><span style={{fontWeight: 500}}>Prairie Wind RV</span><span style={{fontWeight: 600}}>$22,100</span></div>
      <div style={{padding: '14px 20px', borderBottom: '1px solid #f5f5f5', display: 'flex', justifyContent: 'space-between', fontSize: 13}}><span style={{fontWeight: 500}}>Atlantic RV</span><span style={{fontWeight: 600}}>$18,900</span></div>
      <div style={{padding: '14px 20px', display: 'flex', justifyContent: 'space-between', fontSize: 13}}><span style={{fontWeight: 500}}>West Coast Campers</span><span style={{fontWeight: 600}}>$14,600</span></div>
    </div>
  </div>
</div>

<div className={`page ${activePage === 'notifications' ? 'active' : ''}`} id="page-notifications">
  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20}}>
    <div className="pn"><div className="pn-h"><span className="pn-t">Compose Notification</span></div>
      <div className="form-grid">
        <div className="form-group full"><label>Recipients</label><select><option>All Dealers</option><option>All Active Dealers</option><option>Smith's RV Centre</option><option>Atlantic RV</option><option>Prairie Wind RV</option><option>Plan A Dealers</option><option>Plan B Dealers</option></select></div>
        <div className="form-group full"><label>Type</label><select><option>General Announcement</option><option>Service Update</option><option>Billing Reminder</option><option>New Feature</option><option>Maintenance Notice</option><option>Urgent Alert</option></select></div>
        <div className="form-group full"><label>Title</label><input placeholder="Notification title..." /></div>
        <div className="form-group full"><label>Message</label><textarea placeholder="Write your message..." style={{minHeight: 120}}></textarea></div>
        <div className="form-group"><label>Priority</label><select><option>Normal</option><option>High</option><option>Urgent</option></select></div>
        <div className="form-group"><label>Delivery</label><select><option>Push to Dashboard</option><option>Push + Email</option><option>Email Only</option></select></div>
        <div className="form-group full"><label>Schedule</label><select><option>Send Immediately</option><option>Schedule for Later</option></select></div>
      </div><div className="btn-bar"><button className="btn btn-p">Send Notification</button><button className="btn btn-o">Save Draft</button></div></div>
    <div className="pn"><div className="pn-h"><span className="pn-t">Sent History</span></div><div className="act">
      <div className="act-i"><span className="act-dot new"></span><div><div className="act-t"><strong>New: Photo Batch Upload</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Upload all photos at once for DAF, PDI, Warranty.</div><div className="act-tm">All Dealers · Mar 15 · Push + Email</div></div></div>
      <div className="act-i"><span className="act-dot pt"></span><div><div className="act-t"><strong>Billing: March Invoices</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>March subscription invoices generated.</div><div className="act-tm">All Active · Mar 1 · Push + Email</div></div></div>
      <div className="act-i"><span className="act-dot ok"></span><div><div className="act-t"><strong>Financing Service Now Live</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Submit financing requests directly through the portal.</div><div className="act-tm">All Active · Feb 20 · Push + Email</div></div></div>
      <div className="act-i"><span className="act-dot pay"></span><div><div className="act-t"><strong>Warranty Plans Available</strong></div><div style={{fontSize: 12, color: '#555', marginTop: 2}}>Extended warranty plans now sold through the platform.</div><div className="act-tm">All Active · Feb 15 · Push + Email</div></div></div>
    </div></div>
  </div>
</div>


<div className={`page ${activePage === 'users' ? 'active' : ''}`} id="page-users">
  <div className="tabs"><div className="tab active" onClick={(e) => switchTab(e)}>Operator Staff (4)</div><div className="tab" onClick={(e) => switchTab(e)}>Dealer Users (38)</div></div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}><div className="filter-bar"><input type="text" placeholder="Search users..." /><select><option>All Roles</option><option>Operator Admin</option><option>Operator Staff</option><option>Dealer Owner</option><option>Dealer Staff</option></select><div style={{marginLeft: 'auto'}}><button className="btn btn-p btn-sm">+ Add User</button></div></div>
    <div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Assigned Dealers</th><th>Status</th><th>Last Login</th><th>Action</th></tr></thead><tbody>
      {opUsers.length === 0
        ? <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:20}}>{dataError ? dataError : 'No users found'}</td></tr>
        : opUsers.map((u: any) => {
          const isAdmin = u.role === 'operator_admin';
          return (
            <tr key={u.id}>
              <td style={{fontWeight: 500}}>{u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</td>
              <td>{u.email}</td>
              <td><span className="bg" style={{background: isAdmin ? '#eff6ff' : '#f0fdf4', color: isAdmin ? 'var(--brand)' : '#16a34a'}}>{u.role === 'operator_admin' ? 'Operator Admin' : u.role === 'operator_staff' ? 'Operator Staff' : u.role === 'dealer_owner' ? 'Dealer Owner' : 'Dealer Staff'}</span></td>
              <td>{u.dealershipName || (u.role?.startsWith('operator') ? 'All' : '—')}</td>
              <td><span className={`bg ${u.status === 'active' ? 'active' : 'pending'}`}>{u.status || 'active'}</span></td>
              <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
              <td><button className="btn btn-o btn-sm">Edit</button></td>
            </tr>
          );
        })
      }
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'users' ? 'active' : ''}`} id="page-users">
  <div className="tabs"><div className="tab active" onClick={(e) => switchTab(e)}>Operator Staff (4)</div><div className="tab" onClick={(e) => switchTab(e)}>Dealer Users (38)</div></div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}><div className="filter-bar"><input type="text" placeholder="Search users..." /><select><option>All Roles</option><option>Operator Admin</option><option>Operator Staff</option><option>Dealer Owner</option><option>Dealer Staff</option></select><div style={{marginLeft: 'auto'}}><button className="btn btn-p btn-sm">+ Add User</button></div></div>
    <div className="tw"><table><thead><tr><th>Name</th><th>Email</th><th>Role</th><th>Assigned Dealers</th><th>Status</th><th>Last Login</th><th>Action</th></tr></thead><tbody>
      {opUsers.length === 0
        ? <tr><td colSpan={7} style={{textAlign:'center',color:'#888',padding:20}}>{dataError ? dataError : 'No users found'}</td></tr>
        : opUsers.map((u: any) => {
          const isAdmin = u.role === 'operator_admin';
          return (
            <tr key={u.id}>
              <td style={{fontWeight: 500}}>{u.name || `${u.firstName || ''} ${u.lastName || ''}`.trim() || '—'}</td>
              <td>{u.email}</td>
              <td><span className="bg" style={{background: isAdmin ? '#eff6ff' : '#f0fdf4', color: isAdmin ? 'var(--brand)' : '#16a34a'}}>{u.role === 'operator_admin' ? 'Operator Admin' : u.role === 'operator_staff' ? 'Operator Staff' : u.role === 'dealer_owner' ? 'Dealer Owner' : 'Dealer Staff'}</span></td>
              <td>{u.dealershipName || (u.role?.startsWith('operator') ? 'All' : '—')}</td>
              <td><span className={`bg ${u.status === 'active' ? 'active' : 'pending'}`}>{u.status || 'active'}</span></td>
              <td>{u.lastLoginAt ? new Date(u.lastLoginAt).toLocaleDateString('en-CA',{month:'short',day:'numeric'}) : '—'}</td>
              <td><button className="btn btn-o btn-sm">Edit</button></td>
            </tr>
          );
        })
      }
    </tbody></table></div></div>
</div>


<div className={`page ${activePage === 'products' ? 'active' : ''}`} id="page-products">
  <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20}}><div><div style={{fontSize: 16, fontWeight: 700, marginBottom: 4}}>Products & Services</div><div style={{fontSize: 13, color: '#888'}}>Pre-configured items that auto-populate when creating invoices.</div></div><button className="btn btn-p btn-sm" onClick={() => showPage('add-product')}>+ Add Product / Service</button></div>
  <div className="tabs"><div className="tab active" onClick={(e) => switchTab(e)}>Subscriptions (2)</div><div className="tab" onClick={(e) => switchTab(e)}>Claim Fees (3)</div><div className="tab" onClick={(e) => switchTab(e)}>Service Add-ons (3)</div><div className="tab" onClick={(e) => switchTab(e)}>Parts (4)</div><div className="tab" onClick={(e) => switchTab(e)}>All</div></div>
  <div className="pn" style={{borderTop: 'none', borderRadius: '0 0 8px 8px'}}>
    <div className="tw"><table><thead><tr><th>Name</th><th>Category</th><th>Price</th><th>Billing</th><th>Tax</th><th>Dealers</th><th>Status</th><th>Action</th></tr></thead><tbody>
      {opProducts.length === 0
        ? <tr><td colSpan={8} style={{textAlign:'center',color:'#888',padding:20}}>{dataError ? dataError : 'No products found'}</td></tr>
        : opProducts.map((p: any) => (
          <tr key={p.id}>
            <td style={{fontWeight: 500}}>{p.name}</td>
            <td><span className="mfr">{p.category || p.type || '—'}</span></td>
            <td>{p.price != null ? (p.billingType === 'percentage' ? `${p.price}%` : `$${Number(p.price).toFixed(2)}`) : 'Variable'}</td>
            <td>{p.billingCycle || p.billing || '—'}</td>
            <td>{p.taxRate ? `HST ${p.taxRate}%` : 'HST 13%'}</td>
            <td>{p.dealerCount ?? '—'}</td>
            <td><span className={`bg ${p.status === 'active' ? 'active' : 'pending'}`}>{p.status || 'active'}</span></td>
            <td><button className="btn btn-o btn-sm" onClick={() => showPage('edit-product')}>Edit</button></td>
          </tr>
        ))
      }
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'add-product' ? 'active' : ''}`} id="page-add-product">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('products')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Add Product / Service</div><div className="detail-meta">Create a new billable item for invoicing</div></div></div>
  <div className="pn"><div className="form-grid">
    <div className="form-group"><label>Name</label><input placeholder="e.g. Plan A Monthly Subscription" /></div>
    <div className="form-group"><label>Category</label><select><option>Subscription</option><option>Claim Fee</option><option>Service Add-on</option><option>Part / Physical Item</option><option>Custom</option></select></div>
    <div className="form-group"><label>Price</label><input placeholder="$0.00" /></div>
    <div className="form-group"><label>Pricing Type</label><select><option>Fixed amount</option><option>Percentage of claim</option><option>Variable</option></select></div>
    <div className="form-group"><label>Billing Frequency</label><select><option>One-time</option><option>Monthly</option><option>Quarterly</option><option>Annual</option><option>Per claim</option><option>Per unit</option></select></div>
    <div className="form-group"><label>Tax</label><select><option defaultSelected>HST 13%</option><option>GST 5%</option><option>GST + QST</option><option>No Tax</option></select></div>
    <div className="form-group full"><label>Description</label><textarea placeholder="Description visible on invoices..."></textarea></div>
    <div className="form-group"><label>Status</label><select><option>Active</option><option>Inactive</option></select></div>
  </div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('products')}>Save Product</button><button className="btn btn-o" onClick={() => showPage('products')}>Cancel</button></div></div>
</div>


<div className={`page ${activePage === 'edit-product' ? 'active' : ''}`} id="page-edit-product">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('products')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Edit Product / Service</div><div className="detail-meta">Plan A — Monthly Subscription</div></div></div>
  <div className="pn"><div className="form-grid">
    <div className="form-group"><label>Name</label><input value="Plan A — Monthly Subscription" /></div>
    <div className="form-group"><label>Category</label><select><option defaultSelected>Subscription</option><option>Claim Fee</option><option>Service Add-on</option><option>Part / Physical Item</option><option>Custom</option></select></div>
    <div className="form-group"><label>Price</label><input value="$349.00" /></div>
    <div className="form-group"><label>Pricing Type</label><select><option defaultSelected>Fixed amount</option><option>Percentage of claim</option><option>Variable</option></select></div>
    <div className="form-group"><label>Billing Frequency</label><select><option>One-time</option><option defaultSelected>Monthly</option><option>Quarterly</option><option>Annual</option><option>Per claim</option><option>Per unit</option></select></div>
    <div className="form-group"><label>Tax</label><select><option defaultSelected>HST 13%</option><option>GST 5%</option><option>GST + QST</option><option>No Tax</option></select></div>
    <div className="form-group full"><label>Description</label><textarea>Monthly platform subscription including claims processing and warranty management.</textarea></div>
    <div className="form-group"><label>Status</label><select><option defaultSelected>Active</option><option>Inactive</option></select></div>
    <div className="form-group"><label>Dealers Currently Using</label><input value="18" readOnly style={{background: '#f3f4f6', color: '#888'}} /></div>
  </div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('products')}>Save Changes</button><button className="btn btn-o" onClick={() => showPage('products')}>Cancel</button><button className="btn btn-d" style={{marginLeft: 'auto'}}>Delete Product</button></div></div>
</div>

<div className={`page ${activePage === 'settings' ? 'active' : ''}`} id="page-settings">
  <div style={{display: 'grid', gridTemplateColumns: '200px 1fr', gap: 24}}>
    <div>
      <div className="settings-link active" onClick={() => setSettingsTab('s-profile')}>My Profile</div>
      <div className="settings-link" onClick={() => setSettingsTab('s-general')}>General</div>
      <div className="settings-link" onClick={() => setSettingsTab('s-fees')}>Claim Fee Defaults</div>
      <div className="settings-link" onClick={() => setSettingsTab('s-billing')}>Billing Configuration</div>
      <div className="settings-link" onClick={() => setSettingsTab('s-notif')}>Notifications</div>
      <div className="settings-link" onClick={() => setSettingsTab('s-integrations')}>Integrations</div>
      <div className="settings-link" onClick={() => setSettingsTab('s-security')}>Security</div>
    </div>
    <div>
      
      
      <div className={`pn stab ${settingsTab === "stab-s-profile" ? "active" : ""}`} id="stab-s-profile" style={{display: settingsTab === "stab-s-profile" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">My Profile</span></div>
        <div style={{padding: '24px 20px', display: 'flex', gap: 24, alignItems: 'flex-start', borderBottom: '1px solid #f0f0f0'}}>
          <div style={{textAlign: 'center'}}>
            <div id="op-profile-avatar" style={{width: 80, height: 80, borderRadius: '50%', background: 'rgba(255,255,255,0.15)', backgroundColor: 'var(--brand)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28, fontWeight: 700, color: '#fff', marginBottom: 8, overflow: 'hidden'}}>JD</div>
            <input type="file" id="op-profile-input" accept="image/*" style={{display: 'none'}} onChange={updateOpProfile} />
            <button className="btn btn-o btn-sm" onClick={() => document.getElementById('op-profile-input')?.click()}>Change Photo</button>
          </div>
          <div style={{flex: 1}}><div style={{fontSize: 16, fontWeight: 600, marginBottom: 2}}>Jonathan Delorme</div><div style={{fontSize: 13, color: '#888'}}>Operator Admin · Dealer Suite 360</div></div>
        </div>
        <div className="form-grid">
          <div className="form-group"><label>First Name</label><input value="Jonathan" /></div>
          <div className="form-group"><label>Last Name</label><input value="Delorme" /></div>
          <div className="form-group"><label>Email</label><input value="jonathan@dealersuite360.com" /></div>
          <div className="form-group"><label>Phone</label><input value="(514) 555-0100" /></div>
          <div className="form-group"><label>Role</label><input value="Operator Admin" readOnly style={{background: '#f3f4f6', color: '#888'}} /></div>
          <div className="form-group"><label>Timezone</label><select><option defaultSelected>Eastern (ET)</option><option>Central</option><option>Mountain</option><option>Pacific</option></select></div>
        </div>
        <div className="btn-bar"><button className="btn btn-p">Save Profile</button><button className="btn btn-o">Cancel</button></div>
      </div>

      
      <div className={`pn stab ${settingsTab === "stab-s-general" ? "active" : ""}`} id="stab-s-general" style={{display: settingsTab === "stab-s-general" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">General Settings</span></div><div className="form-grid">
        <div className="form-group"><label>Platform Name</label><input value="Dealer Suite 360" /></div>
        <div className="form-group"><label>Support Email</label><input value="support@dealersuite360.com" /></div>
        <div className="form-group"><label>Support Phone</label><input value="(888) 443-2204" /></div>
        <div className="form-group"><label>Default Language</label><select><option>English</option><option>French</option></select></div>
        <div className="form-group"><label>Currency</label><select><option defaultSelected>CAD ($)</option><option>USD ($)</option></select></div>
        <div className="form-group"><label>Timezone</label><select><option defaultSelected>Eastern</option><option>Central</option><option>Mountain</option><option>Pacific</option></select></div>
        <div className="form-group"><label>Stale Claim Threshold</label><input value="36" type="number" /> </div>
        <div className="form-group"><label>Platform URL</label><input value="https://dealersuite360.com" /></div>
      </div><div className="btn-bar"><button className="btn btn-p">Save</button><button className="btn btn-o">Reset</button></div></div>

      
      <div className={`pn stab ${settingsTab === "stab-s-fees" ? "active" : ""}`} id="stab-s-fees" style={{display: settingsTab === "stab-s-fees" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Claim Fee Defaults</span><span style={{fontSize: 12, color: '#888'}}>These are platform defaults. Override per dealer in Dealer &gt; Subscription & Fees.</span></div><div className="form-grid">
        <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Claim Processing Fee</label></div>
        <div className="form-group"><label>Default Fee Type</label><select><option defaultSelected>Percentage of approved amount</option><option>Flat fee per claim</option></select></div>
        <div className="form-group"><label>Default Rate (%)</label><input value="10" type="number" /></div>
        <div className="form-group"><label>Minimum Fee</label><input value="$50.00" /></div>
        <div className="form-group"><label>Maximum Fee Cap</label><input value="$500.00" /></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Inspection Fees</label></div>
        <div className="form-group"><label>DAF Inspection Fee</label><input value="$25.00" /></div>
        <div className="form-group"><label>PDI Processing Fee</label><input value="$15.00" /></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Fee Billing Rules</label></div>
        <div className="form-group"><label>When to Invoice</label><select><option defaultSelected>Auto on claim close</option><option>Manual only</option><option>Monthly batch</option></select></div>
        <div className="form-group"><label>Auto-Calculate Tax</label><select><option defaultSelected>Yes — apply dealer's tax rate</option><option>No — enter manually</option></select></div>
      </div><div className="btn-bar"><button className="btn btn-p">Save</button><button className="btn btn-o">Reset to Defaults</button></div>
        <div style={{padding: '16px 20px', background: '#eff6ff', borderTop: '1px solid #bfdbfe', fontSize: 12, color: '#1e40af', borderRadius: '0 0 8px 8px'}}>These defaults apply to all new dealers. Existing dealers keep their current settings. To override for a specific dealer, go to Dealers &gt; [Dealer] &gt; Subscription & Fees.</div>
      </div>

      
      <div className={`pn stab ${settingsTab === "stab-s-billing" ? "active" : ""}`} id="stab-s-billing" style={{display: settingsTab === "stab-s-billing" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Billing Configuration</span></div><div className="form-grid">
        <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Tax Settings</label></div>
        <div className="form-group"><label>Default Tax Rate</label><select><option defaultSelected>HST 13% (Ontario)</option><option>GST 5%</option><option>GST 5% + QST 9.975% (Quebec)</option><option>HST 15% (Maritime)</option><option>GST 5% + PST 7% (BC)</option></select></div>
        <div className="form-group"><label>Tax Registration #</label><input value="RT 0001" placeholder="HST/GST number" /></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Payment Processing</label></div>
        <div className="form-group"><label>Payment Processor</label><select><option defaultSelected>Stripe</option><option>Square</option><option>Manual / Offline</option></select></div>
        <div className="form-group"><label>Stripe Mode</label><select><option>Test Mode</option><option defaultSelected>Live Mode</option></select></div>
        <div className="form-group"><label>Stripe Public Key</label><input value="pk_live_****" style={{background: '#f3f4f6'}} readOnly /></div>
        <div className="form-group"><label>Auto-Charge on Invoice</label><select><option defaultSelected>Yes — charge card on file</option><option>No — send invoice only</option></select></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Invoice Settings</label></div>
        <div className="form-group"><label>Invoice Prefix</label><input value="INV-" /></div>
        <div className="form-group"><label>Next Invoice #</label><input value="0090" type="number" /></div>
        <div className="form-group"><label>Default Payment Terms</label><select><option>On Receipt</option><option defaultSelected>Net 15</option><option>Net 30</option><option>Net 60</option></select></div>
        <div className="form-group"><label>Default Currency</label><select><option defaultSelected>CAD ($)</option><option>USD ($)</option></select></div>
        <div className="form-group full"><label>Invoice Footer / Terms</label><textarea>Payment is due within 15 days of invoice date. Late payments may incur a 2% monthly service charge.</textarea></div>
      </div><div className="btn-bar"><button className="btn btn-p">Save</button><button className="btn btn-o">Reset</button></div></div>

      
      <div className={`pn stab ${settingsTab === "stab-s-notif" ? "active" : ""}`} id="stab-s-notif" style={{display: settingsTab === "stab-s-notif" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Notification Settings</span></div><div className="form-grid">
        <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Operator Notifications</label></div>
        <div className="form-group"><label>New photo batch uploaded</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
        <div className="form-group"><label>Claim status changed</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
        <div className="form-group"><label>Stale claim alert</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
        <div className="form-group"><label>Payment received</label><select><option>Push + Email</option><option defaultSelected>Push only</option><option>Email only</option><option>Off</option></select></div>
        <div className="form-group"><label>New dealer signup</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
        <div className="form-group"><label>Service request submitted</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Dealer Default Notifications</label></div>
        <div className="form-group"><label>Claim status update</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
        <div className="form-group"><label>Invoice generated</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
        <div className="form-group"><label>Parts order update</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
        <div className="form-group"><label>Financing status change</label><select><option defaultSelected>Push + Email</option><option>Push only</option><option>Email only</option><option>Off</option></select></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Email Configuration</label></div>
        <div className="form-group"><label>From Name</label><input value="Dealer Suite 360" /></div>
        <div className="form-group"><label>Reply-To Email</label><input value="support@dealersuite360.com" /></div>
      </div><div className="btn-bar"><button className="btn btn-p">Save</button><button className="btn btn-o">Reset</button></div></div>

      
      <div className={`pn stab ${settingsTab === "stab-s-integrations" ? "active" : ""}`} id="stab-s-integrations" style={{display: settingsTab === "stab-s-integrations" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Integrations</span></div>
        <div style={{padding: 20, display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16}}>
          <div className="svc-card"><div className="svc-icon" style={{background: '#eff6ff', color: '#3b82f6'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div><div className="svc-body"><div className="svc-title">Stripe</div><div className="svc-desc">Payment processing and billing</div><div className="svc-meta"><span className="bg active">Connected</span></div></div></div>
          <div className="svc-card"><div className="svc-icon" style={{background: '#fef2f2', color: '#dc2626'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg></div><div className="svc-body"><div className="svc-title">Gmail / SMTP</div><div className="svc-desc">Email sending for invoices and notifications</div><div className="svc-meta"><span className="bg active">Connected</span></div></div></div>
          <div className="svc-card"><div className="svc-icon" style={{background: '#faf5ff', color: '#a855f7'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 2a7 7 0 017 7c0 2.38-1.19 4.47-3 5.74V17a2 2 0 01-2 2h-4a2 2 0 01-2-2v-2.26C6.19 13.47 5 11.38 5 9a7 7 0 017-7z"/></svg></div><div className="svc-body"><div className="svc-title">Anthropic API (Claude)</div><div className="svc-desc">AI chatbot, document scanning, FRC suggestions</div><div className="svc-meta"><span className="bg active">Connected</span></div></div></div>
          <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#f0f4f8', color: '#64748b'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8"/></svg></div><div className="svc-body"><div className="svc-title">Tavus / D-ID</div><div className="svc-desc">AI F&I Video Presenter</div><div className="svc-meta"><span className="bg pending">Coming Soon</span></div></div></div>
          <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#f0f4f8', color: '#64748b'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="3" width="20" height="14" rx="2"/><line x1="12" y1="17" x2="12" y2="21"/></svg></div><div className="svc-body"><div className="svc-title">QuickBooks / Wave</div><div className="svc-desc">Accounting sync</div><div className="svc-meta"><span className="bg pending">Coming Soon</span></div></div></div>
          <div className="svc-card" style={{opacity: '0.5'}}><div className="svc-icon" style={{background: '#f0f4f8', color: '#64748b'}}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07"/></svg></div><div className="svc-body"><div className="svc-title">Twilio</div><div className="svc-desc">SMS notifications and customer messaging</div><div className="svc-meta"><span className="bg pending">Coming Soon</span></div></div></div>
        </div>
      </div>

      
      <div className={`pn stab ${settingsTab === "stab-s-security" ? "active" : ""}`} id="stab-s-security" style={{display: settingsTab === "stab-s-security" ? "block" : "none"}}><div className="pn-h"><span className="pn-t">Security Settings</span></div><div className="form-grid">
        <div className="form-group full" style={{borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Authentication</label></div>
        <div className="form-group"><label>Require 2FA for Operators</label><select><option defaultSelected>Yes</option><option>No</option></select></div>
        <div className="form-group"><label>Require 2FA for Dealers</label><select><option>Yes</option><option defaultSelected>No — optional</option></select></div>
        <div className="form-group"><label>Session Timeout</label><select><option>30 minutes</option><option defaultSelected>2 hours</option><option>8 hours</option><option>24 hours</option></select></div>
        <div className="form-group"><label>Password Min Length</label><input value="8" type="number" /></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16, borderBottom: '1px solid #f0f0f0', paddingBottom: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Access Control</label></div>
        <div className="form-group"><label>Max Failed Login Attempts</label><input value="5" type="number" /></div>
        <div className="form-group"><label>Lockout Duration</label><select><option>15 minutes</option><option defaultSelected>30 minutes</option><option>1 hour</option></select></div>
        <div className="form-group"><label>IP Allowlist (Operator)</label><select><option defaultSelected>Disabled — any IP</option><option>Enabled</option></select></div>
        <div className="form-group full" style={{borderTop: '1px solid #f0f0f0', paddingTop: 16}}><label style={{fontWeight: 600, fontSize: 13}}>Audit</label></div>
        <div className="form-group"><label>Activity Logging</label><select><option defaultSelected>Full (all actions)</option><option>Admin actions only</option><option>Off</option></select></div>
        <div className="form-group"><label>Log Retention</label><select><option>30 days</option><option defaultSelected>90 days</option><option>1 year</option><option>Indefinite</option></select></div>
      </div><div className="btn-bar"><button className="btn btn-p">Save</button><button className="btn btn-o">Reset</button></div></div>
    </div>
  </div>
</div>


<div className={`page ${activePage === 'changelog' ? 'active' : ''}`} id="page-changelog">
  <div className="tabs" id="cl-tabs"><div className="tab active" onClick={() => setClTab('cl-current')}>Current Release</div><div className="tab" onClick={() => setClTab('cl-past')}>Past Updates</div><div className="tab" onClick={() => setClTab('cl-upcoming')}>Upcoming</div><div className="tab" onClick={() => setClTab('cl-requests')}>Feature Requests</div></div>

  
  <div className={`pn cltab ${clTab === "cltab-cl-current" ? "active" : ""}`} id="cltab-cl-current" style={{display: clTab === "cltab-cl-current" ? "block" : "none"}}>
    <div style={{padding: '24px 20px', borderBottom: '1px solid #f0f0f0'}}>
      <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start'}}>
        <div><div style={{fontSize: 24, fontWeight: 700, color: 'var(--brand)', marginBottom: 4}}>v2.0.0</div><div style={{fontSize: 14, color: '#888'}}>Released March 17, 2026</div></div>
        <span className="bg active" style={{fontSize: 13, padding: '6px 16px'}}>Latest</span>
      </div>
      <div style={{fontSize: 14, color: '#333', marginTop: 12, lineHeight: '1.6'}}>Complete platform rebuild — GEN2 architecture with three-portal system (Operator, Dealer, Customer), service marketplace, ticket-based communication, and white-label customer portals.</div>
    </div>
    <div style={{padding: 20}}>
      <div style={{marginBottom: 24}}>
        <div style={{fontSize: 13, fontWeight: 600, color: '#22c55e', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12}}>New Features</div>
        <div style={{fontSize: 13, color: '#333', lineHeight: 2}}>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Operator Portal</strong> — 34-page command centre with full claims processing, dealer management, unit tracking, invoicing, and platform settings</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Dealer Portal</strong> — 24-page operational portal with photo upload, Push to Claim workflow, service requests, customer management, branding controls</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Customer Portal</strong> — 14-page white-label portal with unit info, warranty tracking, claim status, issue reporting, ticket system</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Service Marketplace</strong> — Financing, F&I, Warranty Plans, Parts & Accessories modules across all portals</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Ticket System</strong> — Auto-generated + manual tickets, 7 categories, linked to claims/parts/services, Quick Chat for casual messages</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Wave-style Invoice Builder</strong> — Line items, part search, auto-populate from Products & Services catalog, tax calculation</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Dealer Branding</strong> — Custom logo, colors, domain (CNAME), welcome message, live preview</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>RBAC</strong> — 4 roles: Operator Admin, Operator Staff, Dealer Owner, Dealer Staff with scoped permissions</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Profile Management</strong> — Photo upload, profile settings, security (2FA, sessions) across all portals</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Unit Photo System</strong> — Dealer uploads display photo, visible on customer dashboard</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Settings</strong> — 7 sub-pages (Operator), 5 sub-pages (Dealer), 3 sub-pages (Customer) with full configuration</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#22c55e', marginRight: 8}}></span><strong>Changelog System</strong> — Version tracking with current, past, upcoming, and feature requests</div>
        </div>
      </div>
      <div style={{marginBottom: 24}}>
        <div style={{fontSize: 13, fontWeight: 600, color: '#3b82f6', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 12}}>Architecture</div>
        <div style={{fontSize: 13, color: '#333', lineHeight: 2}}>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginRight: 8}}></span>Three-portal architecture: Operator &gt; Dealer &gt; Customer</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginRight: 8}}></span>72 total pages across all portals</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginRight: 8}}></span>Shared data model: claims, units, invoices, tickets flow between all 3 portals</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginRight: 8}}></span>Multi-tenant design: operator invisible to customers, dealers see their own data only</div>
          <div><span style={{display: 'inline-block', width: 6, height: 6, borderRadius: '50%', background: '#3b82f6', marginRight: 8}}></span>Target stack: React 18 + Express + TypeScript + Vite + Tailwind + shadcn/ui + PostgreSQL</div>
        </div>
      </div>
    </div>
  </div>

  
  <div className={`pn cltab ${clTab === "cltab-cl-past" ? "active" : ""}`} id="cltab-cl-past" style={{display: clTab === "cltab-cl-past" ? "block" : "none"}}>
    <div style={{padding: 20}}>
      <div style={{borderLeft: '3px solid #e5e7eb', paddingLeft: 20, marginBottom: 32}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: '#333'}}>v1.0.0</div><span style={{fontSize: 12, color: '#888'}}>November 2025</span></div>
        <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Original dealersuite360.com portal — single-portal claims tracking system</div>
        <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}>
          <div>• Basic claims tracking portal (operator only)</div>
          <div>• Contact form and waitlist with email notifications</div>
          <div>• Bilingual website (EN/FR) with marketing pages</div>
          <div>• Pattern-matching chatbot (no AI)</div>
          <div>• In-memory data storage (no persistence)</div>
          <div>• Replit hosting environment</div>
        </div>
      </div>
      <div style={{borderLeft: '3px solid #e5e7eb', paddingLeft: 20}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: '#333'}}>v0.1.0 — Beta</div><span style={{fontSize: 12, color: '#888'}}>October 2025</span></div>
        <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Initial build on Replit — marketing website only</div>
        <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}>
          <div>• Marketing website with service pages</div>
          <div>• Contact form</div>
          <div>• UI-only login screen (non-functional)</div>
          <div>• React + Express + TypeScript foundation</div>
        </div>
      </div>
    </div>
  </div>

  
  <div className={`pn cltab ${clTab === "cltab-cl-upcoming" ? "active" : ""}`} id="cltab-cl-upcoming" style={{display: clTab === "cltab-cl-upcoming" ? "block" : "none"}}>
    <div style={{padding: 20}}>
      <div style={{marginBottom: 28}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: 'var(--brand)'}}>v2.1.0 — Phase 1</div><span className="bg pending" style={{padding: '4px 12px'}}>In Development</span></div>
        <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Foundation & Authentication — Target: April 2026</div>
        <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}>
          <div>• JWT authentication with refresh tokens</div>
          <div>• Login, signup, forgot password, invite acceptance pages</div>
          <div>• PostgreSQL database with full schema (users, dealers, claims, units, invoices, tickets)</div>
          <div>• Real API endpoints for all CRUD operations</div>
          <div>• RBAC middleware enforcement</div>
          <div>• Form validation on all inputs</div>
          <div>• File upload to cloud storage (S3/Cloudflare R2)</div>
        </div>
      </div>
      <div style={{marginBottom: 28}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: '#555'}}>v2.2.0 — Phase 2</div><span className="bg draft" style={{padding: '4px 12px'}}>Planned</span></div>
        <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Payments & Communication — Target: May 2026</div>
        <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}>
          <div>• Stripe integration (subscriptions, one-time charges, card management)</div>
          <div>• Real-time ticket/message delivery (WebSocket)</div>
          <div>• Email notifications (SendGrid/SES) for all events</div>
          <div>• Customer invite flow with email + password creation</div>
          <div>• Search and filter functionality on all tables</div>
          <div>• Dealer Quick Chat inbox</div>
        </div>
      </div>
      <div style={{marginBottom: 28}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: '#555'}}>v2.3.0 — Phase 3</div><span className="bg draft" style={{padding: '4px 12px'}}>Planned</span></div>
        <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>AI Integration & Mobile — Target: June 2026</div>
        <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}>
          <div>• AI Document Scanner (OCR + field extraction)</div>
          <div>• AI FRC Code Suggestions from photos</div>
          <div>• PWA mobile app (camera, unit tag scanner, push to claim)</div>
          <div>• AI F&I Presenter (Tavus/D-ID video avatar)</div>
          <div>• Responsive design for all 3 portals</div>
        </div>
      </div>
      <div>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 8}}><div style={{fontSize: 18, fontWeight: 700, color: '#555'}}>v3.0.0 — Phase 4</div><span className="bg draft" style={{padding: '4px 12px'}}>Planned</span></div>
        <div style={{fontSize: 13, color: '#888', marginBottom: 12}}>Scale & Expand — Target: Q3 2026</div>
        <div style={{fontSize: 13, color: '#555', lineHeight: '1.8'}}>
          <div>• US market expansion (DealerSuite360 rebrand)</div>
          <div>• Multi-currency support (CAD/USD)</div>
          <div>• Advanced analytics and reporting</div>
          <div>• Roadside assistance module</div>
          <div>• Parts shop (customer-facing)</div>
          <div>• Warranty plan marketplace (sell direct to customers)</div>
        </div>
      </div>
    </div>
  </div>

  
  <div className={`pn cltab ${clTab === "cltab-cl-requests" ? "active" : ""}`} id="cltab-cl-requests" style={{display: clTab === "cltab-cl-requests" ? "block" : "none"}}>
    <div style={{padding: '16px 20px', borderBottom: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
      <span style={{fontSize: 13, color: '#888'}}>Feature requests from dealers and internal team</span>
      <button className="btn btn-p btn-sm" onClick={() => showPage('add-feature-req')}>+ Add Request</button>
    </div>
    <div className="tw"><table><thead><tr><th>Request</th><th>Requested By</th><th>Priority</th><th>Status</th><th>Target</th></tr></thead><tbody>
      <tr><td style={{fontWeight: 500}}>Bulk photo drag-and-drop with progress bar</td><td>Smith's RV Centre</td><td><span style={{color: '#dc2626', fontWeight: 600, fontSize: 12}}>High</span></td><td><span className="bg pending">Under Review</span></td><td>v2.1</td></tr>
      <tr><td style={{fontWeight: 500}}>SMS notifications for claim updates</td><td>Internal</td><td><span style={{color: '#d97706', fontWeight: 600, fontSize: 12}}>Medium</span></td><td><span className="bg submitted">Planned</span></td><td>v2.2</td></tr>
      <tr><td style={{fontWeight: 500}}>Customer self-service warranty renewal</td><td>Atlantic RV</td><td><span style={{color: '#d97706', fontWeight: 600, fontSize: 12}}>Medium</span></td><td><span className="bg pending">Under Review</span></td><td>v3.0</td></tr>
      <tr><td style={{fontWeight: 500}}>Operator dashboard mobile view</td><td>Internal</td><td><span style={{color: '#22c55e', fontWeight: 600, fontSize: 12}}>Low</span></td><td><span className="bg draft">Backlog</span></td><td>v2.3</td></tr>
      <tr><td style={{fontWeight: 500}}>Multi-language customer portal (FR)</td><td>Prairie Wind RV</td><td><span style={{color: '#d97706', fontWeight: 600, fontSize: 12}}>Medium</span></td><td><span className="bg draft">Backlog</span></td><td>v3.0</td></tr>
      <tr><td style={{fontWeight: 500}}>Automated claim fee invoicing on close</td><td>Internal</td><td><span style={{color: '#dc2626', fontWeight: 600, fontSize: 12}}>High</span></td><td><span className="bg submitted">Planned</span></td><td>v2.2</td></tr>
    </tbody></table></div>
  </div>
</div>


<div className={`page ${activePage === 'add-feature-req' ? 'active' : ''}`} id="page-add-feature-req">
  <div className="detail-header"><button className="detail-back" onClick={() => showPage('changelog')}><svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="15 18 9 12 15 6"/></svg></button><div className="detail-info"><div className="detail-title">Add Feature Request</div><div className="detail-meta">Log a new feature request from a dealer or internal team</div></div></div>
  <div className="pn"><div className="form-grid">
    <div className="form-group"><label>Feature Title</label><input placeholder="Brief description of the feature..." /></div>
    <div className="form-group"><label>Requested By</label><select><option>Internal</option><option>Smith's RV Centre</option><option>Atlantic RV</option><option>Prairie Wind RV</option></select></div>
    <div className="form-group"><label>Priority</label><select><option>High</option><option defaultSelected>Medium</option><option>Low</option></select></div>
    <div className="form-group"><label>Target Version</label><select><option>v2.1</option><option defaultSelected>v2.2</option><option>v2.3</option><option>v3.0</option><option>Backlog</option></select></div>
    <div className="form-group full"><label>Description</label><textarea placeholder="Detailed description of the feature, use case, and why it matters..."></textarea></div>
  </div><div className="btn-bar"><button className="btn btn-p" onClick={() => showPage('changelog')}>Submit Request</button><button className="btn btn-o" onClick={() => showPage('changelog')}>Cancel</button></div></div>
</div>

<OperatorMarketplacePages activePage={activePage} showPage={showPage} />
<OperatorPublicAuctionPages activePage={activePage} showPage={showPage} />




</div>
</div>
    <MobileBottomNav portalType="operator" activePage={activePage} onNavigate={showPage} parents={parents} />
    <OfflineBanner />
    </>
  );
}
