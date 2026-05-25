import { useState, useEffect } from 'react';
import { useLocation } from 'wouter';
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

  useEffect(() => {
    const load = async () => {
      setIsLoading(true);
      try {
        await Promise.all([
          apiFetch<any>('/api/v6/units').then(d => {
            const units = Array.isArray(d) ? d : d.units || [];
            setClientUnit(units[0] || null);
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
      <div style={{background: 'linear-gradient(135deg, #08235d 0%, #1e40af 100%)', borderRadius: 12, padding: '24px 28px', color: '#fff', marginBottom: 24}}>
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
        <div className="qb" onClick={() => navigate('warranty')}>
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/>
          </svg>
          <span className="qb-t">{t('dashboard.viewWarranty')}</span>
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

// ── Root component — delegates by role ────────────────────────────────────────
export default function Dashboard() {
  const { user } = useAuth();

  if (user?.role === 'client') {
    return <ClientDashboard />;
  }

  return <OperatorDashboard />;
}
