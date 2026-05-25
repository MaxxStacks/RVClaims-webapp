// client/src/pages/exclusive/dealer-owner/ModuleCatalog.tsx
// DS360 Service Module Catalog — /:dealerId/owner/modules

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useQuery } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useEnabledModules } from '@/hooks/useEnabledModules';

interface ServiceModule {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  category: string;
  monthlyPrice: string | null;
  perTransactionFee: string | null;
  icon: string | null;
  isBase: boolean;
  isActive: boolean;
  sortOrder: number;
}

interface Subscription {
  id: string;
  moduleId: string;
  moduleSlug: string | null;
  subscribedAt: string;
}

const CATEGORY_COLORS: Record<string, { bg: string; color: string }> = {
  Claims:     { bg: '#e0f2fe', color: '#0369a1' },
  Finance:    { bg: '#dcfce7', color: '#15803d' },
  Operations: { bg: '#fef3c7', color: '#b45309' },
  Sales:      { bg: '#ede9fe', color: '#6d28d9' },
  Support:    { bg: '#fce7f3', color: '#be185d' },
};

const MODULE_ICON_PATHS: Record<string, string> = {
  FileText:   'M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z M14 2v6h6 M16 13H8 M16 17H8 M10 9H8',
  Shield:     'M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z',
  Umbrella:   'M23 12a11.05 11.05 0 00-22 0zm-5 7a3 3 0 01-6 0v-7',
  Truck:      'M1 3h15v13H1z M16 8h4l3 3v5h-7V8z M5.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z M18.5 21a2.5 2.5 0 100-5 2.5 2.5 0 000 5z',
  TrendingUp: 'M23 6l-9.5 9.5-5-5L1 18 M17 6h6v6',
  CreditCard: 'M1 4h22v16H1z M1 10h22',
  Package:    'M21 16V8a2 2 0 00-1-1.73l-7-4a2 2 0 00-2 0l-7 4A2 2 0 003 8v8a2 2 0 001 1.73l7 4a2 2 0 002 0l7-4A2 2 0 0021 16z M3.27 6.96L12 12.01l8.73-5.05 M12 22.08V12',
  Wrench:     'M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z',
  Megaphone:  'M3 11l19-9-9 19-2-8-8-2z',
  RefreshCw:  'M23 4v6h-6 M1 20v-6h6 M3.51 9a9 9 0 0114.85-3.36L23 10 M1 14l4.64 4.36A9 9 0 0020.49 15',
  Gavel:      'M14 2L3 13l4 4L18 6z M3 21l7-7 M21 3l-4 4',
  Users:      'M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2 M9 11a4 4 0 100-8 4 4 0 000 8z M23 21v-2a4 4 0 00-3-3.87 M16 3.13a4 4 0 010 7.75',
};

function ModuleIcon({ name, size = 20 }: { name: string | null; size?: number }) {
  const path = MODULE_ICON_PATHS[name || ''] || MODULE_ICON_PATHS.FileText;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {path.split(' M').map((segment, i) => (
        <path key={i} d={i === 0 ? segment : 'M' + segment} />
      ))}
    </svg>
  );
}

export default function ModuleCatalog() {
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const [activeFilter, setActiveFilter] = useState('All');
  const { modules: enabledSlugs, loading: modulesLoading, isFailOpen } = useEnabledModules();

  const dealershipId = user?.dealershipId as string | undefined;

  const { data: modulesData, isLoading: catalogLoading } = useQuery({
    queryKey: ['serviceModules'],
    queryFn: () => apiFetch<{ modules: ServiceModule[] }>('/api/modules'),
    staleTime: 5 * 60 * 1000,
  });

  const { data: subsData } = useQuery({
    queryKey: ['dealerSubscriptions', dealershipId],
    queryFn: () => apiFetch<{ subscriptions: Subscription[] }>(`/api/dealerships/${dealershipId}/subscriptions`),
    enabled: !!dealershipId,
    staleTime: 5 * 60 * 1000,
  });

  const allModules = modulesData?.modules || [];
  const activeSubs = subsData?.subscriptions || [];
  const activeSubMap = new Map(activeSubs.map((s) => [s.moduleId, s]));

  const FILTERS = ['All', 'Finance', 'Operations', 'Sales', 'Support', 'Claims'];
  const filterLabel = (f: string) => {
    if (f === 'All') return t('modules.filterAll');
    if (f === 'Finance') return t('modules.filterFinance');
    if (f === 'Operations') return t('modules.filterOperations');
    if (f === 'Sales') return t('modules.filterSales');
    if (f === 'Support') return t('modules.filterSupport');
    if (f === 'Claims') return t('modules.filterClaims');
    return f;
  };

  const filtered = allModules.filter((m) => activeFilter === 'All' || m.category === activeFilter);

  // Sort: subscribed first, then by sortOrder
  const sorted = [...filtered].sort((a, b) => {
    const aActive = activeSubMap.has(a.id) || a.isBase;
    const bActive = activeSubMap.has(b.id) || b.isBase;
    if (aActive && !bActive) return -1;
    if (!aActive && bActive) return 1;
    return a.sortOrder - b.sortOrder;
  });

  const isLoading = catalogLoading || modulesLoading;

  const catStyle = (cat: string) => CATEGORY_COLORS[cat] || { bg: '#f3f4f6', color: '#6b7280' };

  const goToDetail = (slug: string) => {
    const p = window.location.pathname.split('/');
    const dealerId = p[1];
    navigate(`/${dealerId}/owner/modules/${slug}`);
  };

  if (isLoading) {
    return (
      <div className="page active">
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {[...Array(6)].map((_, i) => (
            <div key={i} className="pn" style={{ padding: 20, minHeight: 160 }}>
              <div style={{ background: '#f0f0f0', borderRadius: 8, height: 12, width: '60%', marginBottom: 12 }} />
              <div style={{ background: '#f0f0f0', borderRadius: 8, height: 10, width: '80%', marginBottom: 8 }} />
              <div style={{ background: '#f0f0f0', borderRadius: 8, height: 10, width: '40%' }} />
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      {/* Page header */}
      <div style={{ marginBottom: 20 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #1a1a1a)', marginBottom: 4 }}>
          {t('modules.pageTitle')}
        </div>
        <div style={{ fontSize: 14, color: '#888' }}>{t('modules.pageSubtitle')}</div>
      </div>

      {/* Filter tabs */}
      <div style={{ display: 'flex', gap: 8, marginBottom: 24, flexWrap: 'wrap' }}>
        {FILTERS.map((f) => (
          <button
            key={f}
            onClick={() => setActiveFilter(f)}
            style={{
              padding: '6px 16px',
              borderRadius: 20,
              border: `1px solid ${activeFilter === f ? '#033280' : 'var(--border, #e0e0e0)'}`,
              background: activeFilter === f ? '#033280' : 'var(--bg-card, #fff)',
              color: activeFilter === f ? '#fff' : 'var(--text, #333)',
              fontSize: 13,
              fontWeight: activeFilter === f ? 600 : 400,
              cursor: 'pointer',
              fontFamily: 'inherit',
              transition: 'all 0.15s',
            }}
          >
            {filterLabel(f)}
          </button>
        ))}
      </div>

      {/* Module grid */}
      {sorted.length === 0 ? (
        <div className="pn" style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 14 }}>
          {t('modules.noModulesYet')}
        </div>
      ) : (
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3,1fr)', gap: 16 }}>
          {sorted.map((m) => {
            const isSubscribed = m.isBase || activeSubMap.has(m.id);
            const cat = catStyle(m.category);
            return (
              <div
                key={m.id}
                className="pn"
                style={{
                  padding: 20,
                  display: 'flex',
                  flexDirection: 'column',
                  gap: 12,
                  border: isSubscribed ? '1.5px solid #033280' : undefined,
                  position: 'relative',
                  transition: 'box-shadow 0.15s',
                }}
              >
                {/* Status badge */}
                {isSubscribed && (
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: '#dcfce7',
                    color: '#15803d',
                    fontSize: 11,
                    fontWeight: 600,
                    padding: '2px 8px',
                    borderRadius: 20,
                    border: '1px solid #86efac',
                  }}>
                    {t('common.active')}
                  </span>
                )}
                {!isSubscribed && (
                  <span style={{
                    position: 'absolute',
                    top: 12,
                    right: 12,
                    background: 'transparent',
                    color: '#888',
                    fontSize: 11,
                    fontWeight: 500,
                    padding: '2px 8px',
                    borderRadius: 20,
                    border: '1px solid #e0e0e0',
                  }}>
                    {t('common.inactive')}
                  </span>
                )}

                {/* Icon + category */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                  <div style={{
                    width: 40, height: 40, borderRadius: 10,
                    background: cat.bg, color: cat.color,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    flexShrink: 0,
                  }}>
                    <ModuleIcon name={m.icon} size={20} />
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text, #1a1a1a)', lineHeight: 1.3, paddingRight: 60 }}>
                      {m.name}
                    </div>
                    <span style={{
                      display: 'inline-block',
                      marginTop: 3,
                      padding: '1px 6px',
                      borderRadius: 4,
                      fontSize: 10,
                      fontWeight: 600,
                      background: cat.bg,
                      color: cat.color,
                    }}>
                      {m.category}
                    </span>
                  </div>
                </div>

                {/* Tagline */}
                {m.tagline && (
                  <div style={{ fontSize: 13, color: '#555', lineHeight: 1.5 }}>{m.tagline}</div>
                )}

                {/* Price */}
                <div style={{ marginTop: 'auto' }}>
                  {m.isBase ? (
                    <div style={{ fontSize: 12, fontWeight: 600, color: '#033280' }}>
                      {t('modules.includedPlan')}
                    </div>
                  ) : (
                    <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #1a1a1a)' }}>
                      ${parseFloat(m.monthlyPrice || '0').toFixed(0)}
                      <span style={{ fontSize: 12, fontWeight: 400, color: '#888' }}>{t('modules.perMonth')}</span>
                      {m.perTransactionFee && (
                        <span style={{ fontSize: 11, color: '#888', marginLeft: 4 }}>
                          + ${parseFloat(m.perTransactionFee).toFixed(0)} {t('modules.perTransaction')}
                        </span>
                      )}
                    </div>
                  )}
                </div>

                {/* Action buttons */}
                <div style={{ display: 'flex', gap: 8 }}>
                  <button
                    onClick={() => goToDetail(m.slug)}
                    style={{
                      flex: 1,
                      padding: '7px 0',
                      border: '1px solid var(--border, #e0e0e0)',
                      borderRadius: 6,
                      background: 'none',
                      fontSize: 12,
                      fontWeight: 600,
                      color: 'var(--text, #333)',
                      cursor: 'pointer',
                      fontFamily: 'inherit',
                    }}
                  >
                    {t('modules.learnMore')}
                  </button>
                  {isSubscribed && !m.isBase && (
                    <button
                      onClick={() => goToDetail(m.slug)}
                      style={{
                        flex: 1,
                        padding: '7px 0',
                        border: '1px solid #033280',
                        borderRadius: 6,
                        background: '#033280',
                        fontSize: 12,
                        fontWeight: 600,
                        color: '#fff',
                        cursor: 'pointer',
                        fontFamily: 'inherit',
                      }}
                    >
                      {t('modules.manage')}
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
