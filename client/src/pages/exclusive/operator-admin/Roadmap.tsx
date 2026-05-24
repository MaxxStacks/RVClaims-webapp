import { useState } from 'react';

type Priority = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
type Status = 'PLANNED' | 'IN_PROGRESS' | 'DONE';
type Category = 'TERM' | 'NAV' | 'DES' | 'FUN' | 'DATA' | 'FEAT' | 'MOB' | 'INFRA' | 'LOG';

interface RoadmapItem {
  id: string;
  title: string;
  priority: Priority;
  status: Status;
  category: Category;
  portals: string;
  notes: string;
  dependencies: string[];
}

const ITEMS: RoadmapItem[] = [
  // ── TERM ──────────────────────────────────────────────────────────────────
  {
    id: 'TERM-001',
    title: 'Audit all code for old portal references',
    priority: 'CRITICAL',
    status: 'PLANNED',
    category: 'TERM',
    portals: 'All 13',
    notes: 'Code still references "DealerPortal", "CustomerPortal", "BidderPortal", "activePage", old nav labels. All references must align to the 13-portal architecture: Operator Admin, Operator Staff, Dealer Owner, Dealer Staff, Client, Service Manager, Shop Manager, Parts Manager, Financial Manager, Shop Technician, On-Site Technician, Public Bidder, Consignor.',
    dependencies: [],
  },
  {
    id: 'TERM-002',
    title: 'Standardize nav labels across all 13 portals',
    priority: 'CRITICAL',
    status: 'PLANNED',
    category: 'TERM',
    portals: 'All 13',
    notes: 'Define the official nav label for every sidebar item per portal. Not copied from old portals — defined from scratch based on what each role needs.',
    dependencies: ['TERM-001'],
  },
  // ── NAV ───────────────────────────────────────────────────────────────────
  {
    id: 'NAV-001',
    title: 'Fix all broken/missing sidebar nav links',
    priority: 'CRITICAL',
    status: 'PLANNED',
    category: 'NAV',
    portals: 'All 13',
    notes: 'Audit found 25+ missing nav items across portals. Dealer marketplace section entirely missing from DealerOwner. Public Bidder missing core browse/auction links. Client missing "Report an Issue". All nav items must link to real routes that render real pages.',
    dependencies: ['TERM-002'],
  },
  {
    id: 'NAV-002',
    title: 'Verify every sidebar link resolves to correct page',
    priority: 'CRITICAL',
    status: 'PLANNED',
    category: 'NAV',
    portals: 'All 13',
    notes: 'Click every nav item in every portal. Confirm URL changes correctly and correct page renders. No dead links, no wrong redirects, no fallback to dashboard.',
    dependencies: ['NAV-001'],
  },
  {
    id: 'NAV-003',
    title: 'Add System Status external link to all portals',
    priority: 'LOW',
    status: 'PLANNED',
    category: 'NAV',
    portals: 'All 13',
    notes: 'External link to /system-status opening in new tab. Was in all old portals, missing from all new layouts.',
    dependencies: ['NAV-001'],
  },
  // ── DES ───────────────────────────────────────────────────────────────────
  {
    id: 'DES-001',
    title: 'Button style audit and standardization',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'DES',
    portals: 'All 13',
    notes: 'Inconsistent button styles across portals. Primary buttons (CTA green #0cb22c), secondary/outline buttons, cancel buttons, icon buttons — all need a single consistent pattern. Define the button system and apply universally.',
    dependencies: [],
  },
  {
    id: 'DES-002',
    title: 'Card and block component consistency',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'DES',
    portals: 'All 13',
    notes: 'Dashboard cards, detail cards, stat blocks, list items have inconsistent padding, borders, shadows, and spacing across portals. Standardize the card system.',
    dependencies: [],
  },
  {
    id: 'DES-003',
    title: 'Link styling consistency',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'DES',
    portals: 'All 13',
    notes: 'Some links styled as buttons, some inline text, some have hover states and some don\'t. Define link patterns: nav links, inline links, action links, breadcrumb links.',
    dependencies: [],
  },
  {
    id: 'DES-004',
    title: 'Full design audit — old V6 vs new V7 comparison',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'DES',
    portals: 'All 13',
    notes: 'Pre-V6 portal had better visual presentation. ds360-design-audit.md exists but hasn\'t been executed. Compare old design language with new, identify what was lost, create a design token system.',
    dependencies: ['DES-001', 'DES-002', 'DES-003'],
  },
  // ── FUN ───────────────────────────────────────────────────────────────────
  {
    id: 'FUN-001',
    title: 'Audit all buttons/actions for real functionality',
    priority: 'CRITICAL',
    status: 'PLANNED',
    category: 'FUN',
    portals: 'All 13',
    notes: 'Many buttons have empty onClick handlers or just redirect to dashboard. Every interactive element must do what it says — create, edit, delete, submit, save, cancel. If backend endpoint doesn\'t exist yet, show "Coming Soon" toast, don\'t silently redirect.',
    dependencies: [],
  },
  {
    id: 'FUN-002',
    title: 'Claims RBAC fix — claims broadcasting to all roles',
    priority: 'CRITICAL',
    status: 'PLANNED',
    category: 'FUN',
    portals: 'Operator Admin, Operator Staff, Dealer Owner, Dealer Staff, Service Manager',
    notes: 'From Phase 2F spec. Claims currently visible to all roles instead of scoped. Operator sees all, dealer sees own, client sees own (customer-facing fields only). #1 data integrity issue.',
    dependencies: ['DATA-001'],
  },
  {
    id: 'FUN-003',
    title: 'Draft-then-submit claim flow',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'FUN',
    portals: 'Dealer Owner, Dealer Staff',
    notes: 'From Phase 2F spec. Claims created as drafts, require photos before submission, then enter operator processing queue. No draft state currently exists.',
    dependencies: ['FUN-002'],
  },
  {
    id: 'FUN-004',
    title: 'Unit creation — full working flow',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'FUN',
    portals: 'Dealer Owner, Dealer Staff',
    notes: 'Add Unit form must create real unit record in database with VIN validation. New unit must appear in units list immediately after creation.',
    dependencies: ['DATA-001'],
  },
  {
    id: 'FUN-005',
    title: 'Dealer creation — full working flow',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'FUN',
    portals: 'Operator Admin',
    notes: 'Add Dealer form must create real dealer record, set up workspace. New dealer must appear in dealer directory.',
    dependencies: ['DATA-001'],
  },
  // ── DATA ──────────────────────────────────────────────────────────────────
  {
    id: 'DATA-001',
    title: 'Remove all mock data — wire to real API',
    priority: 'CRITICAL',
    status: 'PLANNED',
    category: 'DATA',
    portals: 'All 13',
    notes: 'Full mock data audit completed. 34 HYBRID items and 6 fully static items. Dashboard stats must compute from API arrays. Activity feeds need real endpoint or empty state. Detail pages must read from fetched arrays, not hardcoded data.',
    dependencies: [],
  },
  {
    id: 'DATA-002',
    title: 'Inter-portal data communication',
    priority: 'CRITICAL',
    status: 'PLANNED',
    category: 'DATA',
    portals: 'All 13',
    notes: 'When dealer creates claim, operator must see it. When operator approves, dealer and client must see status change. Data flows through database — all portals query same tables with role-based scoping.',
    dependencies: ['DATA-001', 'FUN-002'],
  },
  {
    id: 'DATA-003',
    title: 'Visibility matrix implementation',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'DATA',
    portals: 'All 13',
    notes: 'Field-level visibility matrix defines what each of 14 roles can read/write on every entity. Implemented as API middleware that strips fields based on role before sending response.',
    dependencies: ['DATA-002'],
  },
  {
    id: 'DATA-004',
    title: 'Import system refinements',
    priority: 'MEDIUM',
    status: 'IN_PROGRESS',
    category: 'DATA',
    portals: 'Operator Admin, Dealer Owner, Dealer Staff',
    notes: 'CSV/Excel import built and deployed. Template downloads added. Still needs: import order guidance in UI, VIN-as-key explanation, dynamic template labels.',
    dependencies: [],
  },
  // ── FEAT ──────────────────────────────────────────────────────────────────
  {
    id: 'FEAT-001',
    title: 'Marketplace section — Dealer Owner',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'FEAT',
    portals: 'Dealer Owner',
    notes: 'Browse Units, My Listings, My Transactions, Live Auctions, Public Showcase, My Bids, Escrow & Payments. Nav links missing, pages exist but may need wiring.',
    dependencies: [],
  },
  {
    id: 'FEAT-002',
    title: 'Marketplace section — Public Bidder',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'FEAT',
    portals: 'Public Bidder',
    notes: 'Live Monthly Auctions, Browse Units. Core bidder functionality missing from sidebar.',
    dependencies: [],
  },
  {
    id: 'FEAT-003',
    title: 'Portal Settings — Dealer Owner',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'FEAT',
    portals: 'Dealer Owner',
    notes: 'Route exists, page exists, nav link missing. Customer portal configuration (white-label domain, logo, colors).',
    dependencies: [],
  },
  {
    id: 'FEAT-004',
    title: 'My Subscription — Dealer Owner',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'FEAT',
    portals: 'Dealer Owner',
    notes: 'Separate from billing or tab within billing? Shows current plan, upgrade options, payment history.',
    dependencies: [],
  },
  {
    id: 'FEAT-005',
    title: 'Report an Issue — Client',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'FEAT',
    portals: 'Client',
    notes: 'Page component exists, nav link missing. Core client workflow for submitting problems.',
    dependencies: [],
  },
  {
    id: 'FEAT-006',
    title: 'Account page — Client',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'FEAT',
    portals: 'Client',
    notes: 'Page exists (merged into Settings). May need separate nav entry or is Settings sufficient?',
    dependencies: [],
  },
  // ── MOB ───────────────────────────────────────────────────────────────────
  {
    id: 'MOB-001',
    title: 'Sync new portal structure to mobile build',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'MOB',
    portals: 'All 13',
    notes: 'Capacitor config exists (com.dealersuite360.app). New 13-portal route structure must work within mobile WebView. Verify all routes render correctly in Capacitor.',
    dependencies: ['NAV-002'],
  },
  {
    id: 'MOB-002',
    title: 'Mobile-specific feature audit',
    priority: 'HIGH',
    status: 'PLANNED',
    category: 'MOB',
    portals: 'All 13',
    notes: 'Define what dealers need on mobile for launch: Camera for claim photos, VIN/tag scanner, push notifications, offline unit lookup, quick claim submission ("Push to Claim"), parts photo capture. Create feature matrix: mobile vs desktop.',
    dependencies: [],
  },
  {
    id: 'MOB-003',
    title: 'Mobile UI optimization',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'MOB',
    portals: 'All 13',
    notes: 'Sidebar behavior on mobile (hamburger menu), touch targets, responsive tables, bottom nav bar. Current portal CSS may not be mobile-ready.',
    dependencies: ['MOB-001'],
  },
  {
    id: 'MOB-004',
    title: 'iOS build and TestFlight',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'MOB',
    portals: 'iOS',
    notes: 'Build via Capacitor, submit to TestFlight for beta testing. Requires Apple Developer account, signing, provisioning profiles.',
    dependencies: ['MOB-001', 'MOB-003'],
  },
  {
    id: 'MOB-005',
    title: 'Android build and Play Store',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'MOB',
    portals: 'Android',
    notes: 'Build via Capacitor, submit to Play Store internal testing. Requires Google Play Developer account.',
    dependencies: ['MOB-001', 'MOB-003'],
  },
  // ── INFRA ─────────────────────────────────────────────────────────────────
  {
    id: 'INFRA-001',
    title: 'Railway deployment — app.dealersuite360.com',
    priority: 'HIGH',
    status: 'IN_PROGRESS',
    category: 'INFRA',
    portals: 'Platform',
    notes: 'Railway connected to GitHub, auto-deploys from main. Custom domain app.dealersuite360.com needs CNAME at registrar.',
    dependencies: [],
  },
  {
    id: 'INFRA-002',
    title: 'Separate staging environment',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'INFRA',
    portals: 'Platform',
    notes: 'Production and staging should NOT share Neon DB, Clerk, or Stripe keys. Separate credentials required to avoid data corruption.',
    dependencies: ['INFRA-001'],
  },
  {
    id: 'INFRA-003',
    title: 'Stripe billing integration',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'INFRA',
    portals: 'Platform',
    notes: 'Deferred. Jonathan handling separately. Test mode keys recommended for staging.',
    dependencies: ['INFRA-002'],
  },
  // ── LOG ───────────────────────────────────────────────────────────────────
  {
    id: 'LOG-001',
    title: 'Desktop changelog — Operator Admin portal',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'LOG',
    portals: 'Operator Admin',
    notes: 'Visible only to operator_admin. Tracks all platform changes. Changelog page exists — needs real content instead of mock data.',
    dependencies: [],
  },
  {
    id: 'LOG-002',
    title: 'Desktop changelog — Dealer-facing ("What\'s New")',
    priority: 'MEDIUM',
    status: 'PLANNED',
    category: 'LOG',
    portals: 'Dealer Owner, Dealer Staff',
    notes: 'Dealer-facing changelog visible to dealer_owner and dealer_staff. Shows features relevant to dealers only, not internal operator changes.',
    dependencies: [],
  },
  {
    id: 'LOG-003',
    title: 'Mobile changelog — iOS',
    priority: 'LOW',
    status: 'PLANNED',
    category: 'LOG',
    portals: 'iOS',
    notes: 'Separate from desktop. Tracks mobile-specific changes, app store version history, mobile feature releases.',
    dependencies: [],
  },
  {
    id: 'LOG-004',
    title: 'Mobile changelog — Android',
    priority: 'LOW',
    status: 'PLANNED',
    category: 'LOG',
    portals: 'Android',
    notes: 'Same as iOS changelog but for Play Store releases. May share content if features are identical.',
    dependencies: [],
  },
];

const COMPLETED = [
  'Renamed RVClaims → DealerSuite360 (codebase, GitHub, Railway, bundle ID)',
  'Session 1: File structure — 136 placeholder files (13 layouts + 37 shared + 86 exclusive)',
  'Session 2: Layouts built + 157 page components populated',
  'Session 3: Route registration — 215 routes live across 13 portals',
  'Import system — CSV/Excel upload with field mapping, validation, custom_data JSONB',
  'DevAccessV7 portal selector page created',
  'SPA fallback confirmed for both dev and production',
  'Temp file audit completed (47 files identified for deletion)',
];

const CATEGORIES = ['All', 'TERM', 'NAV', 'DES', 'FUN', 'DATA', 'FEAT', 'MOB', 'INFRA', 'LOG'];

const PRIORITY_COLORS: Record<Priority, { bg: string; color: string }> = {
  CRITICAL: { bg: '#dc2626', color: '#fff' },
  HIGH:     { bg: '#f59e0b', color: '#fff' },
  MEDIUM:   { bg: '#3b82f6', color: '#fff' },
  LOW:      { bg: '#6b7280', color: '#fff' },
};

function PriorityBadge({ priority }: { priority: Priority }) {
  const c = PRIORITY_COLORS[priority];
  const label = priority.charAt(0) + priority.slice(1).toLowerCase();
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '3px 10px', borderRadius: 9999,
      fontSize: 11, fontWeight: 700, letterSpacing: 0.3,
      flexShrink: 0,
    }}>
      {label}
    </span>
  );
}

function StatusBadge({ status }: { status: Status }) {
  if (status === 'PLANNED') {
    return (
      <span style={{
        border: '1px solid #d1d5db', color: '#6b7280',
        padding: '2px 10px', borderRadius: 9999,
        fontSize: 11, fontWeight: 500, background: 'transparent',
        flexShrink: 0,
      }}>
        Planned
      </span>
    );
  }
  if (status === 'IN_PROGRESS') {
    return (
      <span style={{
        background: '#3b82f6', color: '#fff',
        padding: '3px 10px', borderRadius: 9999,
        fontSize: 11, fontWeight: 700, flexShrink: 0,
      }}>
        In Progress
      </span>
    );
  }
  return (
    <span style={{
      background: '#0cb22c', color: '#fff',
      padding: '3px 10px', borderRadius: 9999,
      fontSize: 11, fontWeight: 700, flexShrink: 0,
    }}>
      Done
    </span>
  );
}

export default function Roadmap() {
  const [activeCategory, setActiveCategory] = useState('All');
  const [priorityFilter, setPriorityFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [expandedNotes, setExpandedNotes] = useState<Set<string>>(new Set());

  const toggleNotes = (id: string) => {
    setExpandedNotes(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id); else next.add(id);
      return next;
    });
  };

  const statusMap: Record<string, Status> = {
    'Planned':     'PLANNED',
    'In Progress': 'IN_PROGRESS',
    'Done':        'DONE',
  };

  const filtered = ITEMS.filter(item => {
    if (activeCategory !== 'All' && item.category !== activeCategory) return false;
    if (priorityFilter !== 'All' && item.priority !== (priorityFilter as Priority)) return false;
    if (statusFilter !== 'All' && item.status !== statusMap[statusFilter]) return false;
    return true;
  });

  const counts = {
    total:      ITEMS.length,
    critical:   ITEMS.filter(i => i.priority === 'CRITICAL').length,
    high:       ITEMS.filter(i => i.priority === 'HIGH').length,
    medium:     ITEMS.filter(i => i.priority === 'MEDIUM').length,
    low:        ITEMS.filter(i => i.priority === 'LOW').length,
    planned:    ITEMS.filter(i => i.status === 'PLANNED').length,
    inProgress: ITEMS.filter(i => i.status === 'IN_PROGRESS').length,
    done:       ITEMS.filter(i => i.status === 'DONE').length,
  };

  const hasFilters = activeCategory !== 'All' || priorityFilter !== 'All' || statusFilter !== 'All';

  return (
    <div className="page active">

      {/* ── Page header ────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', marginBottom: 20 }}>
        <div>
          <div style={{ fontSize: 20, fontWeight: 700, color: 'var(--text-primary)' }}>Development Roadmap</div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            Operator Admin only &middot; Last updated 2026-05-24 &middot; Single source of truth for all development
          </div>
        </div>
        <span style={{
          padding: '4px 14px', background: '#dc2626', color: '#fff',
          borderRadius: 9999, fontSize: 11, fontWeight: 700, letterSpacing: 0.8,
          marginTop: 2,
        }}>
          CONFIDENTIAL
        </span>
      </div>

      {/* ── Summary stat bar ───────────────────────────────────────────────── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(8, 1fr)', gap: 10, marginBottom: 20 }}>
        {[
          { label: 'Total Items',  value: counts.total,      color: 'var(--text-primary)', onClick: undefined },
          { label: 'Critical',     value: counts.critical,   color: '#dc2626', onClick: () => setPriorityFilter('CRITICAL') },
          { label: 'High',         value: counts.high,       color: '#f59e0b', onClick: () => setPriorityFilter('HIGH') },
          { label: 'Medium',       value: counts.medium,     color: '#3b82f6', onClick: () => setPriorityFilter('MEDIUM') },
          { label: 'Low',          value: counts.low,        color: '#6b7280', onClick: () => setPriorityFilter('LOW') },
          { label: 'Planned',      value: counts.planned,    color: '#6b7280', onClick: () => setStatusFilter('Planned') },
          { label: 'In Progress',  value: counts.inProgress, color: '#3b82f6', onClick: () => setStatusFilter('In Progress') },
          { label: 'Done',         value: counts.done,       color: '#0cb22c', onClick: () => setStatusFilter('Done') },
        ].map(stat => (
          <div
            key={stat.label}
            className="sc"
            onClick={stat.onClick}
            style={{ cursor: stat.onClick ? 'pointer' : 'default', padding: 14 }}
          >
            <div className="sc-h" style={{ marginBottom: 6 }}>
              <span className="sc-l" style={{ fontSize: 10 }}>{stat.label}</span>
            </div>
            <div className="sc-v" style={{ fontSize: 22, color: stat.color }}>{stat.value}</div>
          </div>
        ))}
      </div>

      {/* ── Filters ────────────────────────────────────────────────────────── */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div className="tabs" style={{ overflowX: 'auto' }}>
          {CATEGORIES.map(cat => (
            <div
              key={cat}
              className={`tab${activeCategory === cat ? ' active' : ''}`}
              onClick={() => setActiveCategory(cat)}
            >
              {cat}
              {cat !== 'All' && (
                <span style={{
                  marginLeft: 6, fontSize: 10, fontWeight: 700,
                  background: activeCategory === cat ? 'rgba(3,50,128,0.15)' : '#f3f4f6',
                  color: activeCategory === cat ? 'var(--brand)' : '#888',
                  padding: '1px 5px', borderRadius: 9999,
                }}>
                  {ITEMS.filter(i => i.category === cat).length}
                </span>
              )}
            </div>
          ))}
        </div>
        <div className="filter-bar">
          <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Priority</label>
          <select value={priorityFilter} onChange={e => setPriorityFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="CRITICAL">Critical</option>
            <option value="HIGH">High</option>
            <option value="MEDIUM">Medium</option>
            <option value="LOW">Low</option>
          </select>
          <label style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>Status</label>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
            <option value="All">All</option>
            <option value="Planned">Planned</option>
            <option value="In Progress">In Progress</option>
            <option value="Done">Done</option>
          </select>
          {hasFilters && (
            <button
              className="btn-o btn-sm"
              onClick={() => { setActiveCategory('All'); setPriorityFilter('All'); setStatusFilter('All'); }}
            >
              Clear
            </button>
          )}
          <span style={{ marginLeft: 'auto', fontSize: 12, color: 'var(--text-muted)' }}>
            {filtered.length} of {ITEMS.length} items
          </span>
        </div>
      </div>

      {/* ── Item cards ─────────────────────────────────────────────────────── */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginBottom: 28 }}>
        {filtered.length === 0 ? (
          <div className="pn" style={{ padding: 48, textAlign: 'center' as const, color: 'var(--text-muted)', fontSize: 13 }}>
            No items match the current filters.
          </div>
        ) : (
          filtered.map(item => (
            <div key={item.id} className="pn" style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'flex-start', gap: 14, padding: '13px 18px' }}>

                {/* ID chip */}
                <div style={{
                  background: 'var(--bg-secondary)',
                  border: '1px solid var(--border)',
                  borderRadius: 6,
                  padding: '4px 10px',
                  fontSize: 11,
                  fontWeight: 700,
                  color: 'var(--brand)',
                  fontFamily: "'SF Mono', 'Fira Code', monospace",
                  flexShrink: 0,
                  alignSelf: 'center',
                  letterSpacing: 0.2,
                }}>
                  {item.id}
                </div>

                {/* Title + meta */}
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 3 }}>
                    {item.title}
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', display: 'flex', flexWrap: 'wrap' as const, gap: '2px 0' }}>
                    <span style={{ fontWeight: 500 }}>Portals:&nbsp;</span>{item.portals}
                  </div>
                  {item.dependencies.length > 0 && (
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' as const, alignItems: 'center', marginTop: 4 }}>
                      <span style={{ fontSize: 10, color: 'var(--text-hint)' }}>Requires:</span>
                      {item.dependencies.map(dep => (
                        <span key={dep} style={{
                          fontSize: 10, background: 'var(--bg-secondary)',
                          color: 'var(--text-muted)', padding: '1px 6px',
                          borderRadius: 4, fontFamily: "'SF Mono', 'Fira Code', monospace",
                          border: '1px solid var(--border)',
                        }}>
                          {dep}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Badges + toggle */}
                <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexShrink: 0 }}>
                  <PriorityBadge priority={item.priority} />
                  <StatusBadge status={item.status} />
                  <button
                    onClick={() => toggleNotes(item.id)}
                    style={{
                      padding: '3px 9px',
                      border: '1px solid var(--border)',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 500,
                      background: expandedNotes.has(item.id) ? '#eff6ff' : 'var(--bg-card)',
                      color: expandedNotes.has(item.id) ? 'var(--brand)' : 'var(--text-muted)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                      transition: 'all .15s',
                    }}
                  >
                    {expandedNotes.has(item.id) ? '▲ Hide' : '▼ Notes'}
                  </button>
                </div>
              </div>

              {/* Collapsible notes */}
              {expandedNotes.has(item.id) && (
                <div style={{
                  padding: '12px 18px 14px',
                  borderTop: '1px solid var(--border-light)',
                  background: 'var(--bg-secondary)',
                  fontSize: 12,
                  color: 'var(--text-secondary)',
                  lineHeight: 1.65,
                }}>
                  {item.notes}
                </div>
              )}
            </div>
          ))
        )}
      </div>

      {/* ── Completed session history ───────────────────────────────────────── */}
      <div className="pn">
        <div className="pn-h">
          <span className="pn-t">Completed — Session History (2026-05-24)</span>
          <span style={{ fontSize: 12, color: '#0cb22c', fontWeight: 700 }}>
            {COMPLETED.length} items
          </span>
        </div>
        {COMPLETED.map((item, i) => (
          <div
            key={i}
            style={{
              display: 'flex',
              alignItems: 'flex-start',
              gap: 12,
              padding: '11px 20px',
              borderBottom: i < COMPLETED.length - 1 ? '1px solid var(--border-lighter)' : 'none',
            }}
          >
            <div style={{
              width: 20, height: 20, borderRadius: '50%',
              background: '#f0fdf4',
              border: '1px solid #bbf7d0',
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              flexShrink: 0, marginTop: 1,
            }}>
              <svg width="9" height="9" viewBox="0 0 24 24" fill="none" stroke="#0cb22c" strokeWidth="3.5">
                <polyline points="20 6 9 17 4 12"/>
              </svg>
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>{item}</div>
          </div>
        ))}
      </div>

    </div>
  );
}
