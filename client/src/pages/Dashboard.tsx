import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';

// ── Client Portal Dashboard ──────────────────────────────────────────────────
function ClientDashboard() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();

  const [clientUnit, setClientUnit] = useState<any>(null);
  const [warranty, setWarranty] = useState<any>(null);
  const [openTickets, setOpenTickets] = useState(0);
  const [activeClaims, setActiveClaims] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [kbResources, setKbResources] = useState<any[]>([]);
  const [dealJacket, setDealJacket] = useState<any>(null);

  // Loyalty widget
  const { data: loyaltyProgramData } = useQuery({
    queryKey: ['loyalty-program-dashboard'],
    queryFn: () => apiFetch<{ success: boolean; program: { programName: string; isActive: boolean } | null }>('/api/loyalty/program'),
    retry: false,
    staleTime: 10 * 60 * 1000,
  });
  const { data: loyaltyBalanceData } = useQuery({
    queryKey: ['loyalty-balance-dashboard'],
    queryFn: () => apiFetch<{ success: boolean; balance: number }>('/api/loyalty/balance'),
    enabled: loyaltyProgramData?.program?.isActive === true,
    retry: false,
    staleTime: 5 * 60 * 1000,
  });

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          apiFetch<any>('/api/v6/units').then(async d => {
            const units = Array.isArray(d) ? d : d.units || [];
            const unit = units[0] || null;
            setClientUnit(unit);
            if (unit?.id) {
              apiFetch<any>(`/api/units/${unit.id}/knowledge`)
                .then(kr => { setKbResources(Array.isArray(kr.entries) ? kr.entries.slice(0, 4) : []); })
                .catch(() => {});
              apiFetch<any>(`/api/deal-jackets/unit/${unit.id}`)
                .then(dj => { setDealJacket(dj.jacket || dj || null); })
                .catch(() => {});
            }
          }).catch(() => {}),
          apiFetch<any>('/api/warranty-plans').then(d => {
            const ws = Array.isArray(d) ? d : d.warrantyPlans || d.plans || [];
            setWarranty(ws.find((w: any) => w.status === 'active') || null);
          }).catch(() => {}),
          apiFetch<any>('/api/tickets?status=open').then(d => {
            const t = Array.isArray(d) ? d : d.tickets || [];
            setOpenTickets(t.length);
          }).catch(() => {}),
          apiFetch<any>('/api/v6/claims').then(d => {
            const c = Array.isArray(d) ? d : d.claims || [];
            setActiveClaims(c.filter((cl: any) => cl.status !== 'closed' && cl.status !== 'paid').length);
          }).catch(() => {}),
        ]);
      } finally {
        setIsLoading(false);
      }
    };
    load();
  }, [user]);

  const warrantyDaysLeft = warranty?.endDate
    ? Math.max(0, Math.ceil((new Date(warranty.endDate).getTime() - Date.now()) / 86400000))
    : null;

  if (isLoading) {
    return (
      <div className="page active" style={{padding: 40, textAlign: 'center', color: '#888'}}>{t('common.loading')}</div>
    );
  }

  return (
    <div className="page active">
      {/* Welcome banner */}
      <div style={{background: 'linear-gradient(135deg, #033280 0%, #1e40af 100%)', borderRadius: 12, padding: '24px 28px', color: '#fff', marginBottom: 24}}>
        <div style={{fontSize: 20, fontWeight: 700, marginBottom: 6}}>
          {t('dashboard.welcome')}{user?.firstName ? `, ${user.firstName}` : ''}!
        </div>
        <div style={{fontSize: 13, opacity: 0.85}}>
          {clientUnit
            ? `Your ${clientUnit.year} ${clientUnit.manufacturer} ${clientUnit.model} is registered and protected.`
            : 'Your customer portal is ready.'}
        </div>
      </div>

      {/* Stat cards */}
      <div className="stats-grid">
        <div className="sc" style={{cursor: 'pointer'}} onClick={() => navigate('my-unit')}>
          <div className="sc-h">
            <span className="sc-l">{t('nav.myRV')}</span>
            <div className="sc-i bl">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="3" width="15" height="13" rx="2"/>
                <path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/>
                <circle cx="5.5" cy="18" r="2.5"/>
                <circle cx="18.5" cy="18" r="2.5"/>
              </svg>
            </div>
          </div>
          <div className="sc-v" style={{fontSize: 14, fontWeight: 600}}>
            {clientUnit ? `${clientUnit.year} ${clientUnit.manufacturer}` : '—'}
          </div>
          {clientUnit && <div className="sc-c">{clientUnit.model} · {clientUnit.vin?.slice(0, 8)}…</div>}
        </div>

        <div className="sc" style={{cursor: 'pointer'}} onClick={() => navigate('warranty')}>
          <div className="sc-h">
            <span className="sc-l">{t('nav.myWarranty')}</span>
            <div className="sc-i gr">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
              </svg>
            </div>
          </div>
          <div className="sc-v">{warrantyDaysLeft !== null ? `${warrantyDaysLeft}d` : '—'}</div>
          <div className="sc-c">
            {warranty
              ? `${warranty.provider} · ${warrantyDaysLeft && warrantyDaysLeft > 0 ? 'Active' : 'Expired'}`
              : 'No active warranty'}
          </div>
        </div>

        <div className="sc" style={{cursor: 'pointer'}} onClick={() => navigate('tickets')}>
          <div className="sc-h">
            <span className="sc-l">{t('dashboard.openTickets')}</span>
            <div className="sc-i am">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
              </svg>
            </div>
          </div>
          <div className="sc-v">{openTickets}</div>
          <div className="sc-c">{openTickets > 0 ? 'Needs attention' : 'All resolved'}</div>
        </div>

        <div className="sc" style={{cursor: 'pointer'}} onClick={() => navigate('claims')}>
          <div className="sc-h">
            <span className="sc-l">{t('dashboard.activeClaims')}</span>
            <div className="sc-i re">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
                <polyline points="14 2 14 8 20 8"/>
              </svg>
            </div>
          </div>
          <div className="sc-v">{activeClaims}</div>
          <div className="sc-c">{activeClaims > 0 ? 'In progress' : 'None active'}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="qg">
        <div className="qb" onClick={() => navigate('report-issue')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          <span className="qb-t">{t('nav.reportIssue')}</span>
        </div>
        <div className="qb" onClick={() => navigate('quick-chat')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z"/>
          </svg>
          <span className="qb-t">{t('dashboard.contactDealer')}</span>
        </div>
        <div className="qb" onClick={() => navigate('documents')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/>
          </svg>
          <span className="qb-t">{t('nav.documents')}</span>
        </div>
        <div className="qb" onClick={() => navigate('tickets/new')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
            <polyline points="14 2 14 8 20 8"/>
            <line x1="12" y1="13" x2="12" y2="17"/>
            <line x1="10" y1="15" x2="14" y2="15"/>
          </svg>
          <span className="qb-t">{t('dashboard.newTicket')}</span>
        </div>
      </div>

      {/* Deal Jacket card */}
      {dealJacket && (
        <div className="pn" style={{marginBottom: 20}}>
          <div className="pn-h">
            <span className="pn-t" style={{display: 'flex', alignItems: 'center', gap: 6}}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 19a2 2 0 01-2 2H4a2 2 0 01-2-2V5a2 2 0 012-2h5l2 3h9a2 2 0 012 2z"/></svg>
              {t('dealJacket.dealJacket')}
            </span>
            <span className="pn-a" onClick={() => navigate(`jacket/${dealJacket.id}`)}>{t('common.view')}</span>
          </div>
          <div style={{padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16}}>
            <div style={{flex: 1}}>
              <div style={{fontSize: 12, color: '#888', marginBottom: 4}}>
                {clientUnit ? `${clientUnit.year} ${clientUnit.manufacturer} ${clientUnit.model}` : 'Your RV'}
              </div>
              <span className={`bg ${dealJacket.status === 'complete' ? 'active' : 'pending'}`} style={{fontSize: 11}}>
                {dealJacket.status === 'complete' ? t('dealJacket.jacketComplete') : t('dealJacket.jacketIncomplete')}
              </span>
            </div>
            <button
              className="btn btn-o btn-sm"
              onClick={() => navigate(`jacket/${dealJacket.id}`)}
              style={{flexShrink: 0}}
            >
              {t('dealJacket.viewDocuments')}
            </button>
          </div>
        </div>
      )}

      {/* Loyalty Points widget */}
      {loyaltyProgramData?.program?.isActive === true && (
        <div className="pn" style={{ marginBottom: 20 }}>
          <div className="pn-h">
            <span className="pn-t" style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
              {loyaltyProgramData.program.programName}
            </span>
            <span className="pn-a" onClick={() => navigate('loyalty')}>{t('common.view')}</span>
          </div>
          <div style={{ padding: '12px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
            <div style={{
              width: 48, height: 48, borderRadius: 12,
              background: 'linear-gradient(135deg, #033280 0%, #1e40af 100%)',
              display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
            }}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
              </svg>
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #1e293b)', lineHeight: 1 }}>
                {loyaltyBalanceData?.balance !== undefined
                  ? Number(loyaltyBalanceData.balance).toLocaleString()
                  : '—'}
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted, #6b7280)', marginTop: 3 }}>
                {t('loyalty.myPoints')}
              </div>
            </div>
            <button
              className="btn btn-p btn-sm"
              onClick={() => navigate('loyalty')}
              style={{ flexShrink: 0 }}
            >
              {t('loyalty.redeem')}
            </button>
          </div>
        </div>
      )}

      {/* KB Resources card */}
      {kbResources.length > 0 && (
        <div className="pn" style={{marginBottom: 20}}>
          <div className="pn-h">
            <span className="pn-t">{t('kb.resources')}</span>
            <span className="pn-a" onClick={() => navigate('my-unit')}>{t('kb.browseAllManuals')}</span>
          </div>
          <div style={{padding: '0 20px 16px'}}>
            {kbResources.map((entry: any) => {
              const iconMap: Record<string, JSX.Element> = {
                owners_manual: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2"><path d="M4 19.5A2.5 2.5 0 016.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 014 19.5v-15A2.5 2.5 0 016.5 2z"/></svg>,
                maintenance_schedule: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#16a34a" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
                video: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#dc2626" strokeWidth="2"><polygon points="5 3 19 12 5 21 5 3"/></svg>,
                how_to_article: <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 20h9"/><path d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4L16.5 3.5z"/></svg>,
              };
              const typeLabels: Record<string, string> = {
                owners_manual: t('kb.ownersManual'),
                maintenance_schedule: t('kb.maintenanceSchedule'),
                video: 'Video',
                how_to_article: t('kb.howToArticle'),
                troubleshooting_guide: t('kb.troubleshootingGuide'),
              };
              return (
                <div key={entry.id} style={{display:'flex',alignItems:'center',gap:10,padding:'10px 0',borderBottom:'1px solid #f5f5f5'}}>
                  <div style={{width:28,height:28,background:'#f8fafc',borderRadius:6,display:'flex',alignItems:'center',justifyContent:'center',flexShrink:0}}>
                    {iconMap[entry.contentType] || iconMap.how_to_article}
                  </div>
                  <div style={{flex:1,minWidth:0}}>
                    <div style={{fontSize:13,fontWeight:600,overflow:'hidden',textOverflow:'ellipsis',whiteSpace:'nowrap'}}>{entry.title}</div>
                    <div style={{fontSize:11,color:'#888'}}>{typeLabels[entry.contentType] || entry.contentType}</div>
                  </div>
                  <span className="pn-a" onClick={() => navigate('my-unit')}>View</span>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Unit info card + warranty status */}
      {clientUnit && (
        <div className="pg pg-2">
          <div className="pn">
            <div className="pn-h">
              <span className="pn-t">My Unit</span>
              <span className="pn-a" onClick={() => navigate('my-unit')}>View details</span>
            </div>
            <div style={{padding: '0 20px 20px'}}>
              <div className="cd-row"><span className="cd-label">VIN</span><span className="cd-value" style={{fontFamily: 'monospace', fontSize: 13}}>{clientUnit.vin}</span></div>
              <div className="cd-row"><span className="cd-label">Year</span><span className="cd-value">{clientUnit.year}</span></div>
              <div className="cd-row"><span className="cd-label">Manufacturer</span><span className="cd-value">{clientUnit.manufacturer}</span></div>
              <div className="cd-row"><span className="cd-label">Model</span><span className="cd-value">{clientUnit.model}</span></div>
              {clientUnit.status && <div className="cd-row"><span className="cd-label">Status</span><span className={`bg ${clientUnit.status === 'delivered' ? 'active' : 'pending'}`}>{clientUnit.status}</span></div>}
            </div>
          </div>

          <div>
            {warranty && (
              <div className="pn">
                <div className="pn-h">
                  <span className="pn-t">Active Warranty</span>
                  <span className="pn-a" onClick={() => navigate('warranty')}>View</span>
                </div>
                <div style={{padding: '0 20px 20px'}}>
                  <div className="cd-row"><span className="cd-label">Provider</span><span className="cd-value">{warranty.provider}</span></div>
                  {warranty.coverage && <div className="cd-row"><span className="cd-label">Coverage</span><span className="cd-value">{warranty.coverage}</span></div>}
                  {warranty.endDate && <div className="cd-row"><span className="cd-label">Expires</span><span className="cd-value">{new Date(warranty.endDate).toLocaleDateString('en-CA', {month: 'long', day: 'numeric', year: 'numeric'})}</span></div>}
                  {warrantyDaysLeft !== null && (
                    <div className="cd-row">
                      <span className="cd-label">Days Left</span>
                      <span className={`cd-value ${warrantyDaysLeft < 30 ? 'ur' : ''}`} style={{fontWeight: 600, color: warrantyDaysLeft < 30 ? '#e53e3e' : undefined}}>
                        {warrantyDaysLeft > 0 ? `${warrantyDaysLeft} days` : 'Expired'}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            )}
            {!warranty && (
              <div className="pn">
                <div className="pn-h"><span className="pn-t">Warranty</span></div>
                <div style={{padding: '16px 20px', textAlign: 'center', color: '#888', fontSize: 13}}>
                  No active warranty plan found. <span className="cid" style={{color: 'var(--brand)', cursor: 'pointer'}} onClick={() => navigate('warranty')}>View details</span>
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

// ── Operator / Dealer Dashboard ───────────────────────────────────────────────
function OperatorDashboard() {
  const [, navigate] = useLocation();
  const { t } = useLanguage();
  const [opClaims, setOpClaims] = useState<any[]>([]);
  const [opDealers, setOpDealers] = useState<any[]>([]);
  const [opBatches, setOpBatches] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  useEffect(() => {
    Promise.all([apiFetch<any>('/api/v6/claims'), apiFetch<any>('/api/v6/dealerships')])
      .then(([cd, dd]) => { setOpClaims(Array.isArray(cd) ? cd : []); setOpDealers(Array.isArray(dd) ? dd : []); })
      .catch(err => setDataError(err?.message || 'Failed to load'));
    apiFetch<any>('/api/batches?status=uploaded').then(d => setOpBatches(d.batches || [])).catch(() => {});
  }, []);

  const pendingDealerCount = opDealers.filter((d: any) => d.status === 'pending').length;
  const activeDealerCount = opDealers.filter((d: any) => d.status === 'active').length;
  const staleClaimCount = opClaims.filter((c: any) => c.updatedAt && (Date.now() - new Date(c.updatedAt).getTime()) > 36 * 3600 * 1000).length;

  return (
    <div className="page active">
      <div className="al-g">
        <div className="al"><div className="al-i ur"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg></div><div className="al-c"><div className="al-t">{pendingDealerCount} dealer{pendingDealerCount !== 1 ? "s" : ""} pending approval</div><div className="al-d">New signups awaiting verification</div></div><span className="al-a" onClick={() => navigate('dealers')}>Review</span></div>
        <div className="al"><div className="al-i wa"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg></div><div className="al-c"><div className="al-t">{staleClaimCount} stale claim{staleClaimCount !== 1 ? "s" : ""}</div><div className="al-d">No update in 36+ hours</div></div><span className="al-a" onClick={() => navigate('stale')}>View</span></div>
        <div className="al"><div className="al-i in"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/></svg></div><div className="al-c"><div className="al-t">{opBatches.length} photo batch{opBatches.length !== 1 ? "es" : ""} in queue</div><div className="al-d">Awaiting review & FRC sorting</div></div><span className="al-a" onClick={() => navigate('queue')}>Process</span></div>
      </div>
      <div className="stats-grid">
        <div className="sc"><div className="sc-h"><span className="sc-l">{t('dashboard.activeClaims')}</span><div className="sc-i bl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg></div></div><div className="sc-v">{opClaims.length}</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">{t('dashboard.approvalRate')}</span><div className="sc-i gr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="20 6 9 17 4 12"/></svg></div></div><div className="sc-v">—</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">{t('dashboard.revenueMTD')}</span><div className="sc-i pu"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg></div></div><div className="sc-v">—</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">{t('dashboard.activeDealers')}</span><div className="sc-i am"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/></svg></div></div><div className="sc-v">{activeDealerCount}</div></div>
        <div className="sc"><div className="sc-h"><span className="sc-l">{t('dashboard.serviceRequests')}</span><div className="sc-i re"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="2" y="7" width="20" height="14" rx="2"/><path d="M16 7V5a4 4 0 00-8 0v2"/></svg></div></div><div className="sc-v">—</div><div className="sc-c up">Financing, F&I, Parts</div></div>
      </div>
      <div className="qg">
        <div className="qb" onClick={() => navigate('queue')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19"/><line x1="5" y1="12" x2="19" y2="12"/></svg><span className="qb-t">{t('dashboard.processBatch')}</span></div>
        <div className="qb" onClick={() => navigate('add-dealer')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><line x1="23" y1="11" x2="17" y2="11"/><line x1="20" y1="8" x2="20" y2="14"/></svg><span className="qb-t">{t('dealers.addDealer')}</span></div>
        <div className="qb" onClick={() => navigate('notifications')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M18 8A6 6 0 006 8c0 7-3 9-3 9h18s-3-2-3-9"/></svg><span className="qb-t">{t('dashboard.sendNotification')}</span></div>
        <div className="qb" onClick={() => navigate('create-invoice')}><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="1" x2="12" y2="23"/><path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/></svg><span className="qb-t">{t('invoices.createInvoice')}</span></div>
      </div>
      <div className="pg pg-2">
        <div className="pn"><div className="pn-h"><span className="pn-t">{t('dashboard.recentClaims')}</span><span className="pn-a" onClick={() => navigate('claims')}>{t('common.viewAll')}</span></div><div className="tw"><table><thead><tr><th>{t('claims.claimNumber')}</th><th>{t('claims.dealer')}</th><th>{t('claims.manufacturer')}</th><th>{t('common.type')}</th><th>{t('common.status')}</th><th>{t('claims.submitDate')}</th></tr></thead><tbody>
          {opClaims.length === 0 ? (
            <tr><td colSpan={6} style={{textAlign:'center',padding:24,color:'#888'}}>{dataError ? dataError : 'No claims yet'}</td></tr>
          ) : opClaims.slice(0,4).map((c: any) => (
            <tr key={c.id}><td><span className="cid" onClick={() => navigate(`claims/${c.id}`)}>{c.claimNumber}</span></td><td>{c.dealershipId?.slice(0,8)}…</td><td><span className="mfr">{c.manufacturer}</span></td><td>{c.type}</td><td><span className={`bg ${c.status?.replace('_','-')}`}>{c.status}</span></td><td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : new Date(c.createdAt).toLocaleDateString()}</td></tr>
          ))}
        </tbody></table></div></div>
        <div className="pn"><div className="pn-h"><span className="pn-t">{t('dashboard.activity')}</span></div><div className="act">
          <div style={{textAlign:'center',padding:'32px 0',color:'#888',fontSize:13}}>{t('dashboard.noRecentActivity')}</div>
        </div></div>
      </div>
    </div>
  );
}

// ── Dealer / Tech Dashboard ───────────────────────────────────────────────────
function DealerDashboard() {
  const [location, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [claims, setClaims] = useState<any[]>([]);
  const [units, setUnits] = useState<any[]>([]);
  const [dataError, setDataError] = useState<string | null>(null);

  // Derive base path from URL (e.g. /dealer-abc/owner)
  const basePath = (() => {
    const segs = location.split('/').filter(Boolean);
    return segs.length >= 2 ? `/${segs[0]}/${segs[1]}` : '';
  })();

  useEffect(() => {
    Promise.all([
      apiFetch<any>('/api/v6/claims').then(d => setClaims(Array.isArray(d) ? d : d.claims || [])).catch(() => {}),
      apiFetch<any>('/api/v6/units').then(d => setUnits(Array.isArray(d) ? d : d.units || [])).catch(() => {}),
    ]).catch(err => setDataError(err?.message || 'Failed to load'));
  }, []);

  const activeClaims = claims.filter((c: any) => c.status !== 'closed' && c.status !== 'paid').length;

  return (
    <div className="page active">
      {/* Scan Unit + Batch Import — prominent cards row */}
      <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 12, marginBottom: 20 }}>
        {/* Scan Unit */}
        <div
          style={{
            background: 'linear-gradient(135deg, #f0fdf4 0%, #dcfce7 100%)',
            border: '1.5px solid #86efac',
            borderRadius: 14, padding: '20px 24px',
            cursor: 'pointer',
            display: 'flex', alignItems: 'center', gap: 16,
          }}
          onClick={() => navigate(`${basePath}/scan`)}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#16a34a'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(22,163,74,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#86efac'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
        >
          <div style={{
            width: 52, height: 52, borderRadius: 12, background: '#16a34a',
            display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0,
          }}>
            <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="3" y="3" width="7" height="7" rx="1" />
              <rect x="14" y="3" width="7" height="7" rx="1" />
              <rect x="3" y="14" width="7" height="7" rx="1" />
              <path d="M14 14h7v7h-7z" />
            </svg>
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontSize: 16, fontWeight: 700, color: '#1e293b', marginBottom: 3 }}>
              {t('scanner.scanUnit')}
            </div>
            <div style={{ fontSize: 13, color: '#16a34a', fontWeight: 500 }}>
              {t('scanner.scanSubtitle')}
            </div>
          </div>
          <div style={{
            background: '#16a34a', color: 'white', borderRadius: 8,
            padding: '8px 16px', fontSize: 13, fontWeight: 700, flexShrink: 0,
          }}>
            Scan Now
          </div>
        </div>

        {/* Batch Import */}
        <div
          style={{
            background: 'linear-gradient(135deg, #eff6ff 0%, #dbeafe 100%)',
            border: '1.5px solid #93c5fd',
            borderRadius: 14, padding: '20px 20px',
            cursor: 'pointer',
            display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 8,
            minWidth: 110,
          }}
          onClick={() => navigate(`${basePath}/units/batch-scan`)}
          onMouseEnter={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#3b82f6'; (e.currentTarget as HTMLDivElement).style.boxShadow = '0 4px 16px rgba(59,130,246,0.12)'; }}
          onMouseLeave={e => { (e.currentTarget as HTMLDivElement).style.borderColor = '#93c5fd'; (e.currentTarget as HTMLDivElement).style.boxShadow = 'none'; }}
        >
          <div style={{
            width: 44, height: 44, borderRadius: 10, background: '#3b82f6',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
          }}>
            <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
              <rect x="2" y="7" width="20" height="14" rx="2"/>
              <path d="M16 7V5a2 2 0 00-2-2h-4a2 2 0 00-2 2v2"/>
              <line x1="12" y1="12" x2="12" y2="17"/>
              <line x1="9" y1="14.5" x2="15" y2="14.5"/>
            </svg>
          </div>
          <div style={{ fontSize: 12, fontWeight: 700, color: '#1e40af', textAlign: 'center' as const }}>
            {t('arrivals.batchImport')}
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="sc" style={{ cursor: 'pointer' }} onClick={() => navigate(`${basePath}/claims`)}>
          <div className="sc-h"><span className="sc-l">{t('dashboard.activeClaims')}</span><div className="sc-i bl"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/></svg></div></div>
          <div className="sc-v">{activeClaims}</div>
        </div>
        <div className="sc" style={{ cursor: 'pointer' }} onClick={() => navigate(`${basePath}/units`)}>
          <div className="sc-h"><span className="sc-l">{t('nav.units')}</span><div className="sc-i gr"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg></div></div>
          <div className="sc-v">{units.length}</div>
        </div>
      </div>

      {/* Quick actions */}
      <div className="qg">
        <div className="qb" onClick={() => navigate(`${basePath}/scan`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><path d="M14 14h7v7h-7z"/></svg>
          <span className="qb-t">{t('scanner.scanUnit')}</span>
        </div>
        <div className="qb" onClick={() => navigate(`${basePath}/claims/new`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="12" y1="18" x2="12" y2="12"/><line x1="9" y1="15" x2="15" y2="15"/></svg>
          <span className="qb-t">{t('claims.newClaim')}</span>
        </div>
        <div className="qb" onClick={() => navigate(`${basePath}/upload`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4"/><polyline points="17 8 12 3 7 8"/><line x1="12" y1="3" x2="12" y2="15"/></svg>
          <span className="qb-t">{t('nav.uploadPhotos')}</span>
        </div>
        <div className="qb" onClick={() => navigate(`${basePath}/units`)}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="3" width="15" height="13" rx="2"/><path d="M16 8h4a2 2 0 012 2v6a2 2 0 01-2 2h-4"/><circle cx="5.5" cy="18" r="2.5"/><circle cx="18.5" cy="18" r="2.5"/></svg>
          <span className="qb-t">{t('nav.units')}</span>
        </div>
      </div>

      {/* Recent claims table */}
      <div className="pg pg-2">
        <div className="pn">
          <div className="pn-h">
            <span className="pn-t">{t('dashboard.recentClaims')}</span>
            <span className="pn-a" onClick={() => navigate(`${basePath}/claims`)}>{t('common.viewAll')}</span>
          </div>
          <div className="tw">
            <table>
              <thead><tr><th>{t('claims.claimNumber')}</th><th>{t('claims.manufacturer')}</th><th>{t('common.type')}</th><th>{t('common.status')}</th><th>{t('claims.submitDate')}</th></tr></thead>
              <tbody>
                {claims.length === 0 ? (
                  <tr><td colSpan={5} style={{ textAlign: 'center', padding: 24, color: '#888' }}>{dataError || 'No claims yet'}</td></tr>
                ) : claims.slice(0, 4).map((c: any) => (
                  <tr key={c.id}>
                    <td><span className="cid" onClick={() => navigate(`${basePath}/claims/${c.id}`)}>{c.claimNumber}</span></td>
                    <td><span className="mfr">{c.manufacturer}</span></td>
                    <td>{c.type}</td>
                    <td><span className={`bg ${c.status?.replace('_', '-')}`}>{c.status}</span></td>
                    <td>{c.submittedAt ? new Date(c.submittedAt).toLocaleDateString() : new Date(c.createdAt).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div className="pn">
          <div className="pn-h"><span className="pn-t">{t('dashboard.activity')}</span></div>
          <div className="act">
            <div style={{ textAlign: 'center', padding: '32px 0', color: '#888', fontSize: 13 }}>{t('dashboard.noRecentActivity')}</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Root component — delegates by role ────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'client') {
    return <ClientDashboard />;
  }

  if (
    user?.role === 'dealer_owner' ||
    user?.role === 'dealer_staff' ||
    user?.role === 'service_manager' ||
    user?.role === 'shop_manager' ||
    user?.role === 'technician' ||
    user?.role === 'parts_dept'
  ) {
    return <DealerDashboard />;
  }

  return <OperatorDashboard />;
}
