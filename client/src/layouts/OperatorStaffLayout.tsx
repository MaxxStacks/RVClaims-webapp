import { useState, useEffect, useRef } from 'react';
import { Link, useLocation } from 'wouter';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch } from '@/lib/api';
import { wsClient } from '@/lib/websocket';
import ds360Icon from '@assets/ds360_favicon.png';

interface Props { children?: React.ReactNode; }

export default function OperatorStaffLayout({ children }: Props) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [theme, setTheme] = useState(() => localStorage.getItem('ds360-theme') || '');
  const [lang, setLang] = useState(() => localStorage.getItem('ds360-lang') || (navigator.language.startsWith('fr') ? 'fr' : 'en'));
  const [location, navigate] = useLocation();
  const { user, logout } = useAuth();

  // Remote Support — screen share request
  const [rsOpen, setRsOpen] = useState(false);
  const [rsDealers, setRsDealers] = useState<{ id: string; name: string }[]>([]);
  const [rsDealerId, setRsDealerId] = useState('');
  const [rsMessage, setRsMessage] = useState('');
  const [rsRequesting, setRsRequesting] = useState(false);
  const [rsStatus, setRsStatus] = useState<'idle' | 'waiting' | 'declined'>('idle');
  const [rsPendingId, setRsPendingId] = useState<string | null>(null);
  const rsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (theme === 'dark') document.documentElement.setAttribute('data-theme', 'dark');
  }, []);

  // Connect wsClient with operator token
  useEffect(() => {
    (async () => {
      const token = await (window as any).Clerk?.session?.getToken?.();
      if (token) wsClient.connectWithToken(token);
    })();
  }, []);

  // Listen for screen share accepted/declined
  useEffect(() => {
    const u1 = wsClient.on('remote:share-accepted', () => {
      setRsStatus('idle'); setRsPendingId(null); setRsOpen(false);
      navigate('/operator/staff/remote-support');
    });
    const u2 = wsClient.on('remote:share-declined', () => {
      setRsStatus('declined'); setRsPendingId(null);
    });
    return () => { u1(); u2(); };
  }, [navigate]);

  // Load dealer list when RS dropdown opens
  useEffect(() => {
    if (!rsOpen || rsDealers.length > 0) return;
    apiFetch<any>('/api/v6/dealerships?limit=100')
      .then(data => {
        const list = Array.isArray(data) ? data : (data?.dealerships ?? []);
        setRsDealers(list.map((d: any) => ({ id: d.id, name: d.name })));
      })
      .catch(() => {});
  }, [rsOpen, rsDealers.length]);

  // Click outside RS dropdown
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (rsRef.current && !rsRef.current.contains(e.target as Node)) setRsOpen(false);
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

  const handleSetLang = (l: string) => { setLang(l); localStorage.setItem('ds360-lang', l); };
  const isActive = (path: string) => location.endsWith('/' + path) || location.includes('/' + path + '/');

  const handleRsRequest = async () => {
    if (!rsDealerId || rsRequesting) return;
    setRsRequesting(true);
    try {
      const data = await apiFetch<{ success: boolean; sessionId: string }>(
        '/api/remote/sessions/request',
        { method: 'POST', body: JSON.stringify({ dealerId: rsDealerId, message: rsMessage.trim() || undefined }) }
      );
      if (data.success) { setRsPendingId(data.sessionId); setRsStatus('waiting'); }
    } catch {}
    setRsRequesting(false);
  };

  return (
    <>
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
            <Link className={`nav-item ${isActive('parts') ? 'active' : ''}`} to="parts"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20 7h-9"/><path d="M14 17H5"/><circle cx="17" cy="17" r="3"/><circle cx="7" cy="7" r="3"/></svg>Parts</Link>
          </div>
          <div className="nav-section">
            <div className="nav-label">System</div>
            <Link className={`nav-item ${isActive('notifications') ? 'active' : ''}`} to="notifications"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/><path d="M13.73 21a2 2 0 01-3.46 0"/></svg>Notifications</Link>
            <Link className={`nav-item ${isActive('changelog') ? 'active' : ''}`} to="changelog"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>Changelog</Link>
          </div>
        </div>
        <div className="sidebar-footer">
          <div className="user-info" style={{cursor:'pointer'}}>
            <div className="user-avatar">{user?.name ? user.name.split(' ').filter(Boolean).map((n: string) => n[0]).join('').toUpperCase().slice(0,2) : 'OP'}</div>
            <div>
              <div className="user-name">{user?.name ?? user?.email ?? 'Operator'}</div>
              <div className="user-role">Operator Staff</div>
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
              <div className="header-sub">Operator Staff</div>
            </div>
          </div>
          <div className="header-right">
            <div className="lang-toggle">
              <button className={`lang-btn-opt ${lang === 'en' ? 'active' : ''}`} onClick={() => handleSetLang('en')}>EN</button>
              <button className={`lang-btn-opt ${lang === 'fr' ? 'active' : ''}`} onClick={() => handleSetLang('fr')}>FR</button>
            </div>
            <button className="theme-toggle" onClick={toggleTheme} title="Toggle dark mode"><svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg></button>

            {/* Remote Support — screen share request button */}
            <div ref={rsRef} style={{position:'relative'}}>
              <button
                className="hbtn"
                title={rsStatus === 'waiting' ? 'Waiting for dealer…' : 'Request Screen Share'}
                onClick={() => { setRsOpen(o => !o); if (rsStatus === 'declined') setRsStatus('idle'); }}
                style={rsStatus === 'waiting' ? {background:'rgba(59,130,246,0.12)',position:'relative'} : {position:'relative'}}
              >
                <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke={rsStatus === 'waiting' ? '#3b82f6' : 'currentColor'} strokeWidth="2">
                  <rect x="2" y="3" width="20" height="14" rx="2"/>
                  <line x1="8" y1="21" x2="16" y2="21"/>
                  <line x1="12" y1="17" x2="12" y2="21"/>
                </svg>
                {rsStatus === 'waiting' && (
                  <span style={{position:'absolute',top:3,right:3,width:6,height:6,borderRadius:'50%',background:'#3b82f6',border:'1.5px solid #fff'}} />
                )}
              </button>
              {rsOpen && (
                <div style={{position:'absolute',top:'calc(100% + 8px)',right:0,width:290,background:'var(--bg-card,#fff)',border:'1px solid var(--border,#e5e7eb)',borderRadius:10,boxShadow:'0 8px 32px rgba(0,0,0,.12)',zIndex:1000,padding:'14px 16px',fontFamily:'Inter,sans-serif'}}>
                  <div style={{fontSize:12,fontWeight:700,color:'var(--text,#111)',marginBottom:10}}>Request Screen Share</div>

                  {rsStatus === 'waiting' && (
                    <div style={{background:'#eff6ff',border:'1px solid #bfdbfe',borderRadius:7,padding:'10px 12px',display:'flex',justifyContent:'space-between',alignItems:'center',marginBottom:8}}>
                      <div style={{display:'flex',alignItems:'center',gap:6}}>
                        <span style={{width:7,height:7,borderRadius:'50%',background:'#3b82f6',display:'inline-block',flexShrink:0}} />
                        <span style={{fontSize:11,color:'#1e40af',fontWeight:500}}>Waiting for dealer to accept…</span>
                      </div>
                      <button onClick={() => {setRsStatus('idle');setRsPendingId(null);}} style={{fontSize:10,background:'none',border:'1px solid #93c5fd',borderRadius:4,padding:'2px 7px',cursor:'pointer',color:'#1e40af',flexShrink:0}}>Cancel</button>
                    </div>
                  )}

                  {rsStatus === 'declined' && (
                    <div style={{background:'#fef2f2',border:'1px solid #fecaca',borderRadius:7,padding:'8px 12px',marginBottom:8,display:'flex',justifyContent:'space-between',alignItems:'center'}}>
                      <span style={{fontSize:11,color:'#b91c1c'}}>Request was declined.</span>
                      <button onClick={() => setRsStatus('idle')} style={{fontSize:10,background:'none',border:'1px solid #fca5a5',borderRadius:4,padding:'2px 7px',cursor:'pointer',color:'#b91c1c'}}>Try Again</button>
                    </div>
                  )}

                  {rsStatus === 'idle' && (
                    <>
                      <select
                        value={rsDealerId}
                        onChange={e => setRsDealerId(e.target.value)}
                        style={{width:'100%',padding:'7px 10px',border:'1px solid var(--border,#e5e7eb)',borderRadius:6,fontSize:12,color:'var(--text,#374151)',background:'var(--bg-card,#fff)',marginBottom:8,outline:'none',cursor:'pointer'}}
                      >
                        <option value="">Select dealer…</option>
                        {rsDealers.map(d => <option key={d.id} value={d.id}>{d.name}</option>)}
                      </select>
                      <input
                        type="text"
                        value={rsMessage}
                        onChange={e => setRsMessage(e.target.value.slice(0, 200))}
                        placeholder="Describe the issue (optional)"
                        style={{width:'100%',padding:'7px 10px',border:'1px solid var(--border,#e5e7eb)',borderRadius:6,fontSize:12,marginBottom:10,outline:'none',background:'var(--bg-card,#fff)',color:'var(--text,#374151)',boxSizing:'border-box' as const}}
                      />
                      <button
                        onClick={handleRsRequest}
                        disabled={!rsDealerId || rsRequesting}
                        style={{width:'100%',background:(!rsDealerId || rsRequesting) ? '#e5e7eb' : '#033280',color:(!rsDealerId || rsRequesting) ? '#9ca3af' : '#fff',border:'none',borderRadius:7,padding:'8px 0',fontSize:12,fontWeight:600,cursor:(!rsDealerId || rsRequesting) ? 'default' : 'pointer',fontFamily:'inherit'}}
                      >
                        {rsRequesting ? 'Sending…' : 'Send Request'}
                      </button>
                    </>
                  )}
                </div>
              )}
            </div>

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
