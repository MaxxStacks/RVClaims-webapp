// client/src/pages/exclusive/dealer-owner/ModuleDetail.tsx
// Module detail + subscribe/cancel — /:dealerId/owner/modules/:moduleSlug

import { useState } from 'react';
import { useLocation, useParams } from 'wouter';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { useToast } from '@/hooks/use-toast';

interface ServiceModule {
  id: string;
  name: string;
  slug: string;
  tagline: string | null;
  description: string | null;
  features: string[] | null;
  category: string;
  monthlyPrice: string | null;
  perTransactionFee: string | null;
  setupFee: string | null;
  icon: string | null;
  isBase: boolean;
  isActive: boolean;
}

interface Subscription {
  id: string;
  moduleId: string;
  moduleSlug: string | null;
  subscribedAt: string;
  status: string;
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

function ModuleIcon({ name, size = 28 }: { name: string | null; size?: number }) {
  const path = MODULE_ICON_PATHS[name || ''] || MODULE_ICON_PATHS.FileText;
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
      {path.split(' M').map((segment, i) => (
        <path key={i} d={i === 0 ? segment : 'M' + segment} />
      ))}
    </svg>
  );
}

// Simple Dialog component using portal.css card styles
function ConfirmDialog({
  open,
  title,
  body,
  confirmLabel,
  confirmColor,
  onConfirm,
  onCancel,
  loading,
}: {
  open: boolean;
  title: string;
  body: string;
  confirmLabel: string;
  confirmColor: string;
  onConfirm: () => void;
  onCancel: () => void;
  loading: boolean;
}) {
  if (!open) return null;
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)',
      display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000,
    }}>
      <div className="pn" style={{ padding: 28, maxWidth: 420, width: '90%' }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--text, #1a1a1a)' }}>{title}</div>
        <div style={{ fontSize: 13, color: '#555', lineHeight: 1.6, marginBottom: 20 }}>{body}</div>
        <div style={{ display: 'flex', gap: 8, justifyContent: 'flex-end' }}>
          <button
            onClick={onCancel}
            disabled={loading}
            style={{ padding: '8px 16px', border: '1px solid var(--border,#e0e0e0)', borderRadius: 6, background: 'none', fontSize: 13, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            {loading ? '...' : 'Cancel'}
          </button>
          <button
            onClick={onConfirm}
            disabled={loading}
            style={{ padding: '8px 16px', border: 'none', borderRadius: 6, background: confirmColor, color: '#fff', fontSize: 13, fontWeight: 600, fontFamily: 'inherit', cursor: 'pointer' }}
          >
            {loading ? 'Working…' : confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

export default function ModuleDetail() {
  const params = useParams();
  const moduleSlug = (params as any).moduleSlug as string;
  const [, navigate] = useLocation();
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const dealershipId = user?.dealershipId as string | undefined;

  const [showSubscribeDialog, setShowSubscribeDialog] = useState(false);
  const [showCancelDialog, setShowCancelDialog] = useState(false);

  const { data: moduleData, isLoading: moduleLoading } = useQuery({
    queryKey: ['module', moduleSlug],
    queryFn: () => apiFetch<{ module: ServiceModule }>(`/api/modules/${moduleSlug}`),
    enabled: !!moduleSlug,
  });

  const { data: subsData, isLoading: subsLoading } = useQuery({
    queryKey: ['dealerSubscriptions', dealershipId],
    queryFn: () => apiFetch<{ subscriptions: Subscription[] }>(`/api/dealerships/${dealershipId}/subscriptions`),
    enabled: !!dealershipId,
    staleTime: 5 * 60 * 1000,
  });

  const m = moduleData?.module;
  const activeSubs = subsData?.subscriptions || [];
  const activeSub = m ? activeSubs.find((s) => s.moduleId === m.id) : undefined;
  const isSubscribed = !!(m?.isBase || activeSub);

  const subscribeMutation = useMutation({
    mutationFn: async () => {
      if (!dealershipId || !m) throw new Error('Missing data');
      return apiFetch(`/api/dealerships/${dealershipId}/subscriptions`, {
        method: 'POST',
        body: JSON.stringify({ moduleId: m.id }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['enabledModules'] });
      setShowSubscribeDialog(false);
      toast({ title: t('modules.moduleActivated') });
    },
    onError: () => {
      setShowSubscribeDialog(false);
      toast({ title: t('modules.subscribeFailed'), variant: 'destructive' });
    },
  });

  const cancelMutation = useMutation({
    mutationFn: async () => {
      if (!dealershipId || !activeSub) throw new Error('Missing data');
      return apiFetch(`/api/dealerships/${dealershipId}/subscriptions/${activeSub.id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'cancelled' }),
      });
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dealerSubscriptions'] });
      queryClient.invalidateQueries({ queryKey: ['enabledModules'] });
      setShowCancelDialog(false);
      toast({ title: t('modules.moduleCancelled') });
    },
    onError: () => {
      setShowCancelDialog(false);
      toast({ title: t('modules.cancelFailed'), variant: 'destructive' });
    },
  });

  const backToCatalog = () => {
    const p = window.location.pathname.split('/');
    const dealerId = p[1];
    navigate(`/${dealerId}/owner/modules`);
  };

  if (moduleLoading || subsLoading) {
    return (
      <div className="page active">
        <div style={{ padding: 40, textAlign: 'center', color: '#888', fontSize: 14 }}>
          {t('common.loading')}
        </div>
      </div>
    );
  }

  if (!m) {
    return (
      <div className="page active">
        <div style={{ padding: 40, textAlign: 'center', color: '#dc2626', fontSize: 14 }}>
          Module not found.
        </div>
      </div>
    );
  }

  const cat = CATEGORY_COLORS[m.category] || { bg: '#f3f4f6', color: '#6b7280' };
  const paragraphs = (m.description || '').split('\n\n').filter(Boolean);

  return (
    <div className="page active">
      {/* Back link */}
      <button
        onClick={backToCatalog}
        style={{ display: 'flex', alignItems: 'center', gap: 6, background: 'none', border: 'none', color: '#033280', fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit', padding: 0, marginBottom: 20 }}
      >
        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
          <polyline points="15 18 9 12 15 6" />
        </svg>
        {t('modules.backToCatalog')}
      </button>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 300px', gap: 24, alignItems: 'start' }}>
        {/* Left — hero + description + features */}
        <div>
          {/* Hero */}
          <div className="pn" style={{ padding: 28, marginBottom: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 16 }}>
              <div style={{
                width: 56, height: 56, borderRadius: 14,
                background: cat.bg, color: cat.color,
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                flexShrink: 0,
              }}>
                <ModuleIcon name={m.icon} size={28} />
              </div>
              <div>
                <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #1a1a1a)', marginBottom: 4 }}>{m.name}</div>
                <span style={{
                  display: 'inline-block', padding: '2px 10px', borderRadius: 4,
                  fontSize: 12, fontWeight: 600, background: cat.bg, color: cat.color,
                }}>
                  {m.category}
                </span>
              </div>
            </div>
            {m.tagline && (
              <div style={{ fontSize: 15, color: '#555', lineHeight: 1.6 }}>{m.tagline}</div>
            )}
          </div>

          {/* Description */}
          {paragraphs.length > 0 && (
            <div className="pn" style={{ padding: 24, marginBottom: 20 }}>
              {paragraphs.map((para, i) => (
                <p key={i} style={{ fontSize: 14, color: '#444', lineHeight: 1.7, marginBottom: i < paragraphs.length - 1 ? 16 : 0 }}>
                  {para}
                </p>
              ))}
            </div>
          )}

          {/* Features */}
          {m.features && m.features.length > 0 && (
            <div className="pn" style={{ padding: 24 }}>
              <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #1a1a1a)', marginBottom: 16 }}>
                {t('modules.features')}
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 10 }}>
                {m.features.map((feat, i) => (
                  <div key={i} style={{ display: 'flex', alignItems: 'flex-start', gap: 8 }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2.5" style={{ flexShrink: 0, marginTop: 1 }}>
                      <polyline points="20 6 9 17 4 12" />
                    </svg>
                    <span style={{ fontSize: 13, color: '#444', lineHeight: 1.5 }}>{feat}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right — pricing card */}
        <div className="pn" style={{ padding: 24, position: 'sticky', top: 20 }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: 'var(--text, #1a1a1a)', marginBottom: 16 }}>
            {t('modules.pricing')}
          </div>

          {m.isBase ? (
            <div style={{
              padding: '12px 16px', borderRadius: 8,
              background: '#e0f2fe', color: '#0369a1',
              fontSize: 13, fontWeight: 600, textAlign: 'center', marginBottom: 16,
            }}>
              {t('modules.includedPlan')}
            </div>
          ) : (
            <>
              <div style={{ marginBottom: 12 }}>
                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--text, #1a1a1a)', lineHeight: 1 }}>
                  ${parseFloat(m.monthlyPrice || '0').toFixed(0)}
                  <span style={{ fontSize: 14, fontWeight: 400, color: '#888' }}>{t('modules.perMonth')}</span>
                </div>
              </div>

              {m.perTransactionFee && (
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                  + ${parseFloat(m.perTransactionFee).toFixed(0)} {t('modules.perTransactionFee')}
                </div>
              )}

              {m.setupFee && (
                <div style={{ fontSize: 13, color: '#666', marginBottom: 8 }}>
                  {t('modules.setupFee')}: ${parseFloat(m.setupFee).toFixed(0)}
                </div>
              )}
            </>
          )}

          <div style={{ marginTop: 20 }}>
            {isSubscribed && !m.isBase && activeSub && (
              <>
                <div style={{
                  padding: '8px 12px', borderRadius: 6, background: '#f0fdf4',
                  border: '1px solid #86efac', fontSize: 12, color: '#15803d',
                  fontWeight: 600, marginBottom: 12, textAlign: 'center',
                }}>
                  {t('modules.activeSince')} {new Date(activeSub.subscribedAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                </div>
                <button
                  onClick={() => setShowCancelDialog(true)}
                  style={{
                    width: '100%', padding: '9px 0',
                    border: '1px solid #dc2626', borderRadius: 6,
                    background: 'none', color: '#dc2626',
                    fontSize: 13, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit',
                  }}
                >
                  {t('modules.cancelSubscription')}
                </button>
              </>
            )}

            {isSubscribed && m.isBase && (
              <div style={{
                padding: '10px 14px', borderRadius: 8,
                background: '#f0fdf4', border: '1px solid #86efac',
                fontSize: 12, color: '#15803d', fontWeight: 600, textAlign: 'center',
              }}>
                {t('common.active')}
              </div>
            )}

            {!isSubscribed && !m.isBase && (
              <button
                onClick={() => setShowSubscribeDialog(true)}
                style={{
                  width: '100%', padding: '10px 0',
                  border: 'none', borderRadius: 8,
                  background: '#033280', color: '#fff',
                  fontSize: 14, fontWeight: 700, cursor: 'pointer', fontFamily: 'inherit',
                  letterSpacing: 0.2,
                }}
              >
                {t('modules.subscribeNow')}
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Subscribe dialog */}
      <ConfirmDialog
        open={showSubscribeDialog}
        title={t('modules.confirmSubscribe')}
        body={`${m.name} — ${t('modules.subscribeConfirmBody')}`}
        confirmLabel={t('modules.subscribeNow')}
        confirmColor="#033280"
        onConfirm={() => subscribeMutation.mutate()}
        onCancel={() => setShowSubscribeDialog(false)}
        loading={subscribeMutation.isPending}
      />

      {/* Cancel dialog */}
      <ConfirmDialog
        open={showCancelDialog}
        title={t('modules.cancelSubscription')}
        body={t('modules.cancelWarning')}
        confirmLabel={t('modules.confirmCancel')}
        confirmColor="#dc2626"
        onConfirm={() => cancelMutation.mutate()}
        onCancel={() => setShowCancelDialog(false)}
        loading={cancelMutation.isPending}
      />
    </div>
  );
}
