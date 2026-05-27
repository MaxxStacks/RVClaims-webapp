// client/src/pages/exclusive/dealer-owner/UpsellDashboard.tsx
// Smart Upsell — AI-powered revenue opportunity dashboard for dealer owners
// Route: /:dealerId/owner/upsell

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useAuth } from '@/hooks/use-auth';
import { useLanguage } from '@/hooks/use-language';
import { formatCurrency } from '@/lib/locale';
import { useToast } from '@/hooks/use-toast';

// ─── Types ────────────────────────────────────────────────────────────────────

interface UpsellOpportunityRow {
  opp: {
    id: string;
    dealershipId: string;
    customerId: string;
    unitId: string;
    triggerType: string;
    triggerDetails: Record<string, unknown>;
    recommendedProductType: string;
    estimatedValue: string;
    currency: string;
    urgency: 'high' | 'medium' | 'low';
    status: string;
    offerMessage: string | null;
    sentAt: string | null;
    createdAt: string;
  };
  unit: {
    id: string;
    year: number | null;
    manufacturer: string | null;
    model: string | null;
    vin: string;
  } | null;
  customer: {
    id: string;
    firstName: string;
    lastName: string;
    email: string;
  } | null;
}

interface UpsellStats {
  total: number;
  byStatus: Record<string, number>;
  totalEstimatedValue: number;
  conversionRate: number;
  topTriggers: { trigger: string; count: number }[];
  sentThisMonth: number;
  acceptedThisMonth: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function urgencyBadge(urgency: string) {
  if (urgency === 'high')   return { bg: '#ef4444', color: '#fff' };
  if (urgency === 'medium') return { bg: '#f59e0b', color: '#fff' };
  return { bg: '#22c55e', color: '#fff' };
}

function statusBadge(status: string) {
  const map: Record<string, { bg: string; color: string }> = {
    new:       { bg: '#dbeafe', color: '#1e40af' },
    reviewed:  { bg: '#e0e7ff', color: '#3730a3' },
    sent:      { bg: '#d1fae5', color: '#065f46' },
    opened:    { bg: '#d1fae5', color: '#065f46' },
    clicked:   { bg: '#fef9c3', color: '#854d0e' },
    accepted:  { bg: '#dcfce7', color: '#14532d' },
    declined:  { bg: '#fee2e2', color: '#7f1d1d' },
    dismissed: { bg: '#f3f4f6', color: '#6b7280' },
    expired:   { bg: '#f3f4f6', color: '#9ca3af' },
  };
  return map[status] ?? { bg: '#f3f4f6', color: '#6b7280' };
}

function productLabel(type: string) {
  return type.replace(/_/g, ' ').replace(/\b\w/g, c => c.toUpperCase());
}

function triggerLabel(type: string) {
  const labels: Record<string, string> = {
    warranty_expiry: 'Warranty Expiry',
    unit_age:        'Unit Age',
    service_gap:     'Service Gap',
    seasonal:        'Seasonal',
    fi_gap:          'F&I Gap',
    high_mileage:    'High Mileage',
    custom:          'Custom',
  };
  return labels[type] ?? type;
}

function fmtDate(d?: string | null) {
  if (!d) return '—';
  return new Date(d).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' });
}

// Template variable substitution
function fillTemplate(template: string, opp: UpsellOpportunityRow): string {
  const { unit, customer, opp: o } = opp;
  const expiryDate = o.triggerDetails?.warrantyEnd
    ? fmtDate(o.triggerDetails.warrantyEnd as string)
    : 'soon';

  return template
    .replace(/\{\{customerName\}\}/g, customer ? `${customer.firstName} ${customer.lastName}` : 'Valued Customer')
    .replace(/\{\{unitYear\}\}/g, unit?.year?.toString() ?? '')
    .replace(/\{\{unitMake\}\}/g, unit?.manufacturer ?? '')
    .replace(/\{\{unitModel\}\}/g, unit?.model ?? '')
    .replace(/\{\{expiryDate\}\}/g, expiryDate);
}

// ─── Summary card ─────────────────────────────────────────────────────────────

function SummaryCard({ label, value, sub }: { label: string; value: string | number; sub?: string }) {
  return (
    <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, padding: '16px 20px', minWidth: 0 }}>
      <div style={{ fontSize: 12, color: 'var(--text-muted, #888)', fontWeight: 500, marginBottom: 4 }}>{label}</div>
      <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text, #111)', lineHeight: 1.2 }}>{value}</div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted, #888)', marginTop: 4 }}>{sub}</div>}
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export default function UpsellDashboard() {
  const { user } = useAuth();
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const dealershipId = user?.dealershipId;

  const [filterStatus, setFilterStatus]   = useState('');
  const [filterUrgency, setFilterUrgency] = useState('');
  const [filterTrigger, setFilterTrigger] = useState('');
  const [expandedId, setExpandedId]       = useState<string | null>(null);
  const [editSubject, setEditSubject]     = useState('');
  const [editMessage, setEditMessage]     = useState('');

  // ── Fetch templates for pre-fill ──
  const { data: templatesData } = useQuery({
    queryKey: ['upsell-templates'],
    queryFn: () => apiFetch<{ success: boolean; templates: any[] }>('/api/upsell/templates'),
    staleTime: 5 * 60 * 1000,
  });
  const templates = templatesData?.templates ?? [];

  // ── Fetch stats ──
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['upsell-stats', dealershipId],
    queryFn: () => apiFetch<{ success: boolean; stats: UpsellStats }>('/api/upsell/stats'),
    staleTime: 60 * 1000,
  });
  const stats = statsData?.stats;

  // ── Fetch opportunities ──
  const params = new URLSearchParams();
  if (filterStatus)  params.set('status', filterStatus);
  if (filterUrgency) params.set('urgency', filterUrgency);
  if (filterTrigger) params.set('triggerType', filterTrigger);

  const { data: oppsData, isLoading, refetch: refetchOpps } = useQuery({
    queryKey: ['upsell-opportunities', dealershipId, filterStatus, filterUrgency, filterTrigger],
    queryFn: () => apiFetch<{ success: boolean; opportunities: UpsellOpportunityRow[] }>(`/api/upsell/opportunities?${params.toString()}`),
  });
  const opps = oppsData?.opportunities ?? [];

  // ── Scan mutation ──
  const [scanning, setScanning] = useState(false);
  const handleScan = async () => {
    setScanning(true);
    try {
      const result = await apiFetch<any>('/api/upsell/scan', { method: 'POST' });
      toast({ title: t('upsell.scanComplete'), description: `${result.opportunitiesCreated} ${t('upsell.opportunitiesCreated')}` });
      refetchOpps();
      refetchStats();
    } catch {
      toast({ title: 'Scan failed', variant: 'destructive' });
    } finally {
      setScanning(false);
    }
  };

  // ── Send mutation ──
  const sendMutation = useMutation({
    mutationFn: ({ id, offerMessage }: { id: string; offerMessage: string }) =>
      apiFetch<any>(`/api/upsell/opportunities/${id}/send`, {
        method: 'POST',
        body: JSON.stringify({ offerMessage }),
      }),
    onSuccess: (_data, vars) => {
      const row = opps.find(o => o.opp.id === vars.id);
      const name = row?.customer ? `${row.customer.firstName} ${row.customer.lastName}` : '';
      toast({ title: `${t('upsell.offerSent')} ${name}` });
      setExpandedId(null);
      refetchOpps();
      refetchStats();
    },
    onError: () => toast({ title: 'Send failed', variant: 'destructive' }),
  });

  // ── Dismiss mutation ──
  const dismissMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch<any>(`/api/upsell/opportunities/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ status: 'dismissed' }),
      }),
    onSuccess: () => { refetchOpps(); refetchStats(); setExpandedId(null); },
    onError: () => toast({ title: 'Dismiss failed', variant: 'destructive' }),
  });

  // ── Expand row → pre-fill from template ──
  const handleExpand = (row: UpsellOpportunityRow) => {
    if (expandedId === row.opp.id) { setExpandedId(null); return; }
    setExpandedId(row.opp.id);

    // Find matching template
    const tmpl = templates.find(
      t => t.triggerType === row.opp.triggerType && t.productType === row.opp.recommendedProductType
    );

    if (tmpl) {
      setEditSubject(fillTemplate(tmpl.subjectTemplate, row));
      setEditMessage(fillTemplate(tmpl.messageTemplate, row));
    } else {
      setEditSubject('');
      setEditMessage(row.opp.offerMessage ?? '');
    }
  };

  // ─── Render ───────────────────────────────────────────────────────────────

  const currency = (opps[0]?.opp.currency as 'CAD' | 'USD') ?? 'CAD';

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 20px' }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24, flexWrap: 'wrap', gap: 12 }}>
        <div>
          <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #111)', margin: 0 }}>{t('upsell.title')}</h1>
          <div style={{ fontSize: 13, color: 'var(--text-muted, #888)', marginTop: 3 }}>{t('upsell.subtitle')}</div>
        </div>
        <button
          onClick={handleScan}
          disabled={scanning}
          style={{ background: '#0cb22c', color: '#fff', border: 'none', borderRadius: 8, padding: '9px 18px', fontSize: 13, fontWeight: 600, cursor: scanning ? 'not-allowed' : 'pointer', opacity: scanning ? 0.7 : 1, fontFamily: 'inherit', display: 'flex', alignItems: 'center', gap: 7 }}
        >
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><polyline points="23 4 23 10 17 10"/><polyline points="1 20 1 14 7 14"/><path d="M3.51 9a9 9 0 0114.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0020.49 15"/></svg>
          {scanning ? t('upsell.scanning') : t('upsell.scan')}
        </button>
      </div>

      {/* Summary cards */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 14, marginBottom: 28 }}>
        <SummaryCard label={t('upsell.newOpportunities')} value={stats?.byStatus?.new ?? 0} />
        <SummaryCard
          label={t('upsell.revenuePotential')}
          value={formatCurrency(stats?.totalEstimatedValue ?? 0, currency)}
        />
        <SummaryCard label={t('upsell.sentThisMonth')} value={stats?.sentThisMonth ?? 0} />
        <SummaryCard
          label={t('upsell.acceptedThisMonth')}
          value={stats?.acceptedThisMonth ?? 0}
          sub={`${stats?.conversionRate ?? 0}% ${t('upsell.conversionRate')}`}
        />
      </div>

      {/* Filter row */}
      <div style={{ display: 'flex', gap: 10, marginBottom: 20, flexWrap: 'wrap' }}>
        <select
          value={filterStatus}
          onChange={e => setFilterStatus(e.target.value)}
          style={{ border: '1px solid var(--border)', borderRadius: 7, padding: '7px 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', fontFamily: 'inherit', cursor: 'pointer' }}
        >
          <option value="">{t('upsell.allStatuses')}</option>
          <option value="new">{t('upsell.statusNew')}</option>
          <option value="reviewed">{t('upsell.statusReviewed')}</option>
          <option value="sent">{t('upsell.statusSent')}</option>
          <option value="accepted">{t('upsell.statusAccepted')}</option>
          <option value="declined">{t('upsell.statusDeclined')}</option>
          <option value="dismissed">{t('upsell.statusDismissed')}</option>
        </select>
        <select
          value={filterUrgency}
          onChange={e => setFilterUrgency(e.target.value)}
          style={{ border: '1px solid var(--border)', borderRadius: 7, padding: '7px 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', fontFamily: 'inherit', cursor: 'pointer' }}
        >
          <option value="">{t('upsell.allUrgencies')}</option>
          <option value="high">{t('upsell.urgencyHigh')}</option>
          <option value="medium">{t('upsell.urgencyMedium')}</option>
          <option value="low">{t('upsell.urgencyLow')}</option>
        </select>
        <select
          value={filterTrigger}
          onChange={e => setFilterTrigger(e.target.value)}
          style={{ border: '1px solid var(--border)', borderRadius: 7, padding: '7px 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', fontFamily: 'inherit', cursor: 'pointer' }}
        >
          <option value="">{t('upsell.allTriggers')}</option>
          <option value="warranty_expiry">{t('upsell.triggerWarrantyExpiry')}</option>
          <option value="unit_age">{t('upsell.triggerUnitAge')}</option>
          <option value="service_gap">{t('upsell.triggerServiceGap')}</option>
          <option value="seasonal">{t('upsell.triggerSeasonal')}</option>
          <option value="fi_gap">{t('upsell.triggerFiGap')}</option>
          <option value="custom">{t('upsell.triggerCustom')}</option>
        </select>
      </div>

      {/* Table */}
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border)', borderRadius: 10, overflow: 'hidden' }}>
        {isLoading && (
          <div style={{ padding: '40px 24px', textAlign: 'center', color: 'var(--text-muted, #888)', fontSize: 14 }}>
            {t('common.loading')}
          </div>
        )}
        {!isLoading && opps.length === 0 && (
          <div style={{ padding: '48px 24px', textAlign: 'center', color: 'var(--text-muted, #888)', fontSize: 14 }}>
            {t('upsell.noOpportunities')}
          </div>
        )}
        {!isLoading && opps.length > 0 && (
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 13 }}>
              <thead>
                <tr style={{ background: 'var(--bg-secondary, #f9fafb)', borderBottom: '1px solid var(--border)' }}>
                  {['Customer', 'Unit', t('upsell.triggerType'), t('upsell.recommendedProduct'), t('upsell.estimatedValue'), t('upsell.urgency'), 'Status', t('common.actions')].map(h => (
                    <th key={h} style={{ padding: '10px 14px', textAlign: 'left', fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)', whiteSpace: 'nowrap' }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {opps.map(row => {
                  const isExpanded = expandedId === row.opp.id;
                  const u = urgencyBadge(row.opp.urgency);
                  const s = statusBadge(row.opp.status);
                  const canReview = ['new', 'reviewed'].includes(row.opp.status);

                  return (
                    <>
                      <tr key={row.opp.id} style={{ borderBottom: '1px solid var(--border)', background: isExpanded ? 'var(--bg-secondary, #f9fafb)' : 'transparent' }}>
                        <td style={{ padding: '10px 14px' }}>
                          <div style={{ fontWeight: 600, color: 'var(--text, #111)' }}>
                            {row.customer ? `${row.customer.firstName} ${row.customer.lastName}` : '—'}
                          </div>
                          {row.customer?.email && <div style={{ fontSize: 11, color: 'var(--text-muted, #888)' }}>{row.customer.email}</div>}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {row.unit ? (
                            <div>
                              <div style={{ fontWeight: 500 }}>{[row.unit.year, row.unit.manufacturer, row.unit.model].filter(Boolean).join(' ')}</div>
                              <div style={{ fontSize: 11, color: 'var(--text-muted, #888)' }}>{row.unit.vin}</div>
                            </div>
                          ) : '—'}
                        </td>
                        <td style={{ padding: '10px 14px', color: 'var(--text, #111)' }}>{triggerLabel(row.opp.triggerType)}</td>
                        <td style={{ padding: '10px 14px', color: 'var(--text, #111)' }}>{productLabel(row.opp.recommendedProductType)}</td>
                        <td style={{ padding: '10px 14px', fontWeight: 600, color: '#033280', whiteSpace: 'nowrap' }}>
                          {formatCurrency(row.opp.estimatedValue, (row.opp.currency as 'CAD' | 'USD') ?? 'CAD')}
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ ...u, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                            {row.opp.urgency.charAt(0).toUpperCase() + row.opp.urgency.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          <span style={{ ...s, borderRadius: 20, padding: '3px 10px', fontSize: 11, fontWeight: 600 }}>
                            {row.opp.status.charAt(0).toUpperCase() + row.opp.status.slice(1)}
                          </span>
                        </td>
                        <td style={{ padding: '10px 14px' }}>
                          {canReview && (
                            <button
                              onClick={() => handleExpand(row)}
                              style={{ background: isExpanded ? '#033280' : 'var(--bg-secondary, #f3f4f6)', color: isExpanded ? '#fff' : '#033280', border: '1px solid #c7d4f0', borderRadius: 6, padding: '5px 12px', fontSize: 12, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
                            >
                              {t('upsell.review')}
                            </button>
                          )}
                          {row.opp.status === 'sent' && (
                            <span style={{ fontSize: 12, color: 'var(--text-muted, #888)' }}>{t('upsell.statusSent')}</span>
                          )}
                        </td>
                      </tr>
                      {isExpanded && (
                        <tr key={`${row.opp.id}-expand`} style={{ borderBottom: '1px solid var(--border)', background: 'var(--bg-secondary, #f9fafb)' }}>
                          <td colSpan={8} style={{ padding: '16px 20px' }}>
                            <div style={{ display: 'grid', gridTemplateColumns: '1fr', gap: 12, maxWidth: 680 }}>
                              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                                <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #111)' }}>
                                  {productLabel(row.opp.recommendedProductType)} — {row.customer?.firstName} {row.customer?.lastName}
                                </div>
                                <button
                                  onClick={() => setExpandedId(null)}
                                  style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted, #888)', fontSize: 16, padding: '0 4px', fontFamily: 'inherit' }}
                                >×</button>
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)', display: 'block', marginBottom: 4 }}>
                                  {t('upsell.subject')}
                                </label>
                                <input
                                  value={editSubject}
                                  onChange={e => setEditSubject(e.target.value)}
                                  style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', fontFamily: 'inherit', boxSizing: 'border-box' }}
                                  placeholder={t('upsell.subject')}
                                />
                              </div>
                              <div>
                                <label style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted, #888)', display: 'block', marginBottom: 4 }}>
                                  {t('upsell.message')}
                                </label>
                                <textarea
                                  value={editMessage}
                                  onChange={e => setEditMessage(e.target.value)}
                                  rows={4}
                                  style={{ width: '100%', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 10px', fontSize: 13, background: 'var(--bg-card)', color: 'var(--text)', fontFamily: 'inherit', resize: 'vertical', boxSizing: 'border-box' }}
                                  placeholder={t('upsell.message')}
                                />
                              </div>
                              <div style={{ display: 'flex', gap: 10 }}>
                                <button
                                  onClick={() => sendMutation.mutate({ id: row.opp.id, offerMessage: `${editSubject}\n\n${editMessage}` })}
                                  disabled={sendMutation.isPending || !editMessage.trim()}
                                  style={{ background: '#0cb22c', color: '#fff', border: 'none', borderRadius: 7, padding: '8px 18px', fontSize: 13, fontWeight: 600, cursor: sendMutation.isPending ? 'not-allowed' : 'pointer', opacity: sendMutation.isPending ? 0.7 : 1, fontFamily: 'inherit' }}
                                >
                                  {sendMutation.isPending ? t('common.loading') : t('upsell.sendOffer')}
                                </button>
                                <button
                                  onClick={() => dismissMutation.mutate(row.opp.id)}
                                  disabled={dismissMutation.isPending}
                                  style={{ background: 'none', color: 'var(--text-muted, #888)', border: '1px solid var(--border)', borderRadius: 7, padding: '8px 14px', fontSize: 13, cursor: 'pointer', fontFamily: 'inherit' }}
                                >
                                  {t('upsell.dismiss')}
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      )}
                    </>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
}
