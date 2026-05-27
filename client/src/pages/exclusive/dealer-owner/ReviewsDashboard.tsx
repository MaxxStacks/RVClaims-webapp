// client/src/pages/exclusive/dealer-owner/ReviewsDashboard.tsx
// Route: /:dealerId/owner/reviews
// Dealer reviews dashboard — dealer sees all reviews before anything goes public
// Dealer ALWAYS approves before Google/Facebook. No auto-publish. Ever.

import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';
import { useAuth } from '@/hooks/use-auth';

interface CustomerReview {
  id: string;
  dealershipId: string;
  customerId: string;
  unitId: string | null;
  triggerType: string;
  rating: number | null;
  comment: string | null;
  dealerResponse: string | null;
  status: string;
  publishTarget: string | null;
  publishedAt: string | null;
  sentAt: string;
  respondedAt: string | null;
  createdAt: string;
}

interface ReviewStats {
  avgRating: number | null;
  nps: number | null;
  responseRate: number;
  totalSent: number;
  pending: number;
  thisMonth: number;
  byStar: Record<string, number>;
}

interface ReviewConfig {
  id: string;
  dealershipId: string;
  isActive: boolean;
  sendDelayHours: number;
  googlePlaceId: string | null;
  facebookPageUrl: string | null;
  customThankYouMessage: string | null;
  autoSendOnWorkOrderComplete: boolean;
  autoSendOnClaimClose: boolean;
}

function StarDisplay({ rating, size = 16 }: { rating: number | null; size?: number }) {
  if (rating === null) return <span style={{ color: '#94a3b8', fontSize: 12 }}>No rating</span>;
  return (
    <span style={{ display: 'inline-flex', gap: 2 }}>
      {[1, 2, 3, 4, 5].map(s => (
        <span key={s} style={{ color: s <= rating ? '#f59e0b' : '#d1d5db', fontSize: size }}>★</span>
      ))}
    </span>
  );
}

function StatusBadge({ status }: { status: string }) {
  const colors: Record<string, { bg: string; color: string; label: string }> = {
    pending:             { bg: '#fef3c7', color: '#92400e', label: 'Pending' },
    reviewed:            { bg: '#dbeafe', color: '#1e40af', label: 'Reviewed' },
    approved_for_publish:{ bg: '#d1fae5', color: '#065f46', label: 'Approved' },
    flagged:             { bg: '#fee2e2', color: '#991b1b', label: 'Flagged' },
    resolved:            { bg: '#f0fdf4', color: '#166534', label: 'Resolved' },
    published:           { bg: '#f1f5f9', color: '#475569', label: 'Published' },
  };
  const c = colors[status] || { bg: '#f1f5f9', color: '#475569', label: status };
  return (
    <span style={{
      background: c.bg, color: c.color,
      padding: '2px 10px', borderRadius: 99, fontSize: 12, fontWeight: 600,
    }}>
      {c.label}
    </span>
  );
}

function NpsColor(nps: number | null): string {
  if (nps === null) return '#94a3b8';
  if (nps < 0) return '#ef4444';
  if (nps <= 50) return '#f59e0b';
  return '#0cb22c';
}

export default function ReviewsDashboard() {
  const { t } = useLanguage();
  const { user } = useAuth();
  const qc = useQueryClient();
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [localResponse, setLocalResponse] = useState<Record<string, string>>({});
  const [ratingFilter, setRatingFilter] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('');
  const [showSettings, setShowSettings] = useState(false);
  const [configForm, setConfigForm] = useState<Partial<ReviewConfig>>({});
  const [approveTarget, setApproveTarget] = useState<Record<string, string>>({});

  const { data: stats } = useQuery<ReviewStats>({
    queryKey: ['review-stats'],
    queryFn: () => apiFetch('/api/reviews/stats'),
  });

  const { data: reviews = [], isLoading } = useQuery<CustomerReview[]>({
    queryKey: ['reviews', ratingFilter, statusFilter],
    queryFn: () => {
      const params = new URLSearchParams();
      if (ratingFilter) params.set('rating', ratingFilter);
      if (statusFilter) params.set('status', statusFilter);
      return apiFetch(`/api/reviews?${params.toString()}`);
    },
  });

  const { data: config } = useQuery<ReviewConfig | null>({
    queryKey: ['review-config'],
    queryFn: async () => {
      const data = await apiFetch<ReviewConfig | null>('/api/reviews/config');
      if (data) setConfigForm(data);
      return data;
    },
  });

  const saveResponseMutation = useMutation({
    mutationFn: ({ id, dealerResponse }: { id: string; dealerResponse: string }) =>
      apiFetch(`/api/reviews/${id}`, {
        method: 'PATCH',
        body: JSON.stringify({ dealerResponse }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });

  const approveMutation = useMutation({
    mutationFn: ({ id, publishTarget }: { id: string; publishTarget: string }) =>
      apiFetch(`/api/reviews/${id}/approve`, {
        method: 'POST',
        body: JSON.stringify({ publishTarget }),
      }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });

  const flagMutation = useMutation({
    mutationFn: (id: string) =>
      apiFetch(`/api/reviews/${id}/flag`, { method: 'POST' }),
    onSuccess: () => qc.invalidateQueries({ queryKey: ['reviews'] }),
  });

  const saveConfigMutation = useMutation({
    mutationFn: (cfg: Partial<ReviewConfig>) =>
      apiFetch('/api/reviews/config', {
        method: 'PUT',
        body: JSON.stringify(cfg),
      }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['review-config'] });
      setShowSettings(false);
    },
  });

  const card = (label: string, value: React.ReactNode, sub?: string, color?: string) => (
    <div style={{
      background: '#fff', borderRadius: 12, padding: '20px 20px',
      boxShadow: '0 1px 4px rgba(0,0,0,0.07)', flex: 1, minWidth: 130,
    }}>
      <div style={{ fontSize: 12, color: '#64748b', fontWeight: 500, marginBottom: 6 }}>{label}</div>
      <div style={{ fontSize: 26, fontWeight: 700, color: color || '#033280' }}>{value ?? '—'}</div>
      {sub && <div style={{ fontSize: 11, color: '#94a3b8', marginTop: 2 }}>{sub}</div>}
    </div>
  );

  const npsVal = stats?.nps ?? null;

  return (
    <div style={{ padding: '32px 28px', fontFamily: 'Inter, system-ui, sans-serif', maxWidth: 1100 }}>
      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 24 }}>
        <div>
          <h1 style={{ fontSize: 24, fontWeight: 700, color: '#033280', margin: 0 }}>{t('review.reviewsDashboard')}</h1>
          <p style={{ fontSize: 13, color: '#64748b', margin: '4px 0 0' }}>
            All reviews come to you first. You approve before anything goes public.
          </p>
        </div>
        <button
          onClick={() => setShowSettings(s => !s)}
          style={{
            padding: '9px 16px', background: 'none', border: '1.5px solid #033280',
            color: '#033280', borderRadius: 8, fontSize: 13, fontWeight: 600,
            cursor: 'pointer', fontFamily: 'inherit',
          }}
        >
          ⚙ {t('review.config')}
        </button>
      </div>

      {/* Settings panel */}
      {showSettings && (
        <div style={{
          background: '#fff', borderRadius: 12, padding: '24px',
          boxShadow: '0 1px 8px rgba(0,0,0,0.09)', marginBottom: 28,
        }}>
          <h3 style={{ margin: '0 0 16px', fontSize: 16, fontWeight: 700, color: '#033280' }}>
            {t('review.config')}
          </h3>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
            <label style={{ display: 'flex', flexDirection: 'column' as const, gap: 4, fontSize: 13 }}>
              {t('review.googlePlaceId')}
              <input
                value={configForm.googlePlaceId ?? ''}
                onChange={e => setConfigForm(p => ({ ...p, googlePlaceId: e.target.value }))}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: 13 }}
                placeholder="ChIJN1t_tDeuEmsRUsoyG83frY4"
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column' as const, gap: 4, fontSize: 13 }}>
              {t('review.facebookUrl')}
              <input
                value={configForm.facebookPageUrl ?? ''}
                onChange={e => setConfigForm(p => ({ ...p, facebookPageUrl: e.target.value }))}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: 13 }}
                placeholder="https://facebook.com/yourpage"
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column' as const, gap: 4, fontSize: 13 }}>
              {t('review.sendDelay')}
              <input
                type="number"
                min={0}
                value={configForm.sendDelayHours ?? 24}
                onChange={e => setConfigForm(p => ({ ...p, sendDelayHours: parseInt(e.target.value, 10) }))}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: 13 }}
              />
            </label>
            <label style={{ display: 'flex', flexDirection: 'column' as const, gap: 4, fontSize: 13 }}>
              Custom Thank-You Message
              <input
                value={configForm.customThankYouMessage ?? ''}
                onChange={e => setConfigForm(p => ({ ...p, customThankYouMessage: e.target.value }))}
                style={{ padding: '8px 10px', border: '1px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: 13 }}
                placeholder="Thank you! We love hearing from customers."
              />
            </label>
          </div>
          <div style={{ display: 'flex', gap: 20, marginTop: 14 }}>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={configForm.autoSendOnWorkOrderComplete ?? true}
                onChange={e => setConfigForm(p => ({ ...p, autoSendOnWorkOrderComplete: e.target.checked }))}
              />
              Auto-send after Work Order completion
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={configForm.autoSendOnClaimClose ?? true}
                onChange={e => setConfigForm(p => ({ ...p, autoSendOnClaimClose: e.target.checked }))}
              />
              Auto-send after Claim closure
            </label>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={configForm.isActive ?? true}
                onChange={e => setConfigForm(p => ({ ...p, isActive: e.target.checked }))}
              />
              Module active
            </label>
          </div>
          <div style={{ display: 'flex', gap: 10, marginTop: 18 }}>
            <button
              onClick={() => saveConfigMutation.mutate(configForm)}
              disabled={saveConfigMutation.isPending}
              style={{
                padding: '9px 20px', background: '#033280', color: '#fff',
                border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600,
                cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              {saveConfigMutation.isPending ? 'Saving…' : 'Save Settings'}
            </button>
            <button
              onClick={() => setShowSettings(false)}
              style={{
                padding: '9px 16px', background: 'none', border: '1px solid #e2e8f0',
                borderRadius: 8, fontSize: 13, color: '#64748b', cursor: 'pointer', fontFamily: 'inherit',
              }}
            >
              Cancel
            </button>
          </div>
        </div>
      )}

      {/* Stats cards */}
      <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' as const, marginBottom: 28 }}>
        {card(
          t('review.avgRating'),
          stats?.avgRating !== null && stats?.avgRating !== undefined
            ? <span>{stats.avgRating.toFixed(1)} <span style={{ fontSize: 18 }}>/ 5.0</span></span>
            : '—',
          'Based on all responses'
        )}
        {card(
          t('review.nps'),
          npsVal !== null ? npsVal : '—',
          'Net Promoter Score',
          NpsColor(npsVal)
        )}
        {card(
          t('review.reviewsThisMonth'),
          stats?.thisMonth ?? 0,
          'Reviews received'
        )}
        {card(
          t('review.responseRate'),
          stats?.responseRate !== undefined ? `${stats.responseRate}%` : '—',
          `${stats?.totalSent ?? 0} surveys sent`
        )}
        {card(
          t('review.pending'),
          stats?.pending ?? 0,
          'Awaiting your attention',
          (stats?.pending ?? 0) > 0 ? '#f59e0b' : undefined
        )}
      </div>

      {/* Filters */}
      <div style={{ display: 'flex', gap: 12, marginBottom: 18, flexWrap: 'wrap' as const }}>
        <select
          value={ratingFilter}
          onChange={e => setRatingFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, color: '#1e293b', background: '#fff' }}
        >
          <option value="">{t('review.allRatings')}</option>
          {[5, 4, 3, 2, 1].map(s => <option key={s} value={String(s)}>{s} Star{s !== 1 ? 's' : ''}</option>)}
        </select>
        <select
          value={statusFilter}
          onChange={e => setStatusFilter(e.target.value)}
          style={{ padding: '8px 12px', border: '1px solid #e2e8f0', borderRadius: 8, fontFamily: 'inherit', fontSize: 13, color: '#1e293b', background: '#fff' }}
        >
          <option value="">{t('review.allStatuses')}</option>
          <option value="pending">Pending</option>
          <option value="reviewed">Reviewed</option>
          <option value="approved_for_publish">Approved</option>
          <option value="flagged">Flagged</option>
          <option value="published">Published</option>
        </select>
      </div>

      {/* Reviews table */}
      {isLoading ? (
        <div style={{ color: '#64748b', fontSize: 14 }}>Loading reviews…</div>
      ) : reviews.length === 0 ? (
        <div style={{
          background: '#fff', borderRadius: 12, padding: 40,
          textAlign: 'center' as const, color: '#94a3b8', fontSize: 14,
          boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
        }}>
          {t('review.noReviews')}
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column' as const, gap: 8 }}>
          {reviews.map(review => {
            const expanded = expandedId === review.id;
            const responseText = localResponse[review.id] ?? review.dealerResponse ?? '';
            return (
              <div
                key={review.id}
                style={{
                  background: '#fff', borderRadius: 12, boxShadow: '0 1px 4px rgba(0,0,0,0.07)',
                  border: expanded ? '1.5px solid #033280' : '1.5px solid transparent',
                  overflow: 'hidden',
                }}
              >
                {/* Row */}
                <div
                  onClick={() => setExpandedId(expanded ? null : review.id)}
                  style={{
                    display: 'flex', alignItems: 'center', gap: 16, padding: '14px 20px',
                    cursor: 'pointer', flexWrap: 'wrap' as const,
                  }}
                >
                  <div style={{ minWidth: 100, fontSize: 12, color: '#475569', fontWeight: 500 }}>
                    {review.triggerType.replace(/_/g, ' ')}
                  </div>
                  <div style={{ flex: 1, minWidth: 80 }}>
                    <StarDisplay rating={review.rating} />
                  </div>
                  <div style={{ flex: 2, fontSize: 13, color: '#475569', minWidth: 140 }}>
                    {review.comment
                      ? (review.comment.length > 80 ? review.comment.slice(0, 80) + '…' : review.comment)
                      : <span style={{ color: '#94a3b8', fontStyle: 'italic' }}>No comment</span>}
                  </div>
                  <div style={{ fontSize: 12, color: '#94a3b8', whiteSpace: 'nowrap' as const }}>
                    {new Date(review.createdAt).toLocaleDateString()}
                  </div>
                  <StatusBadge status={review.status} />
                </div>

                {/* Expanded detail */}
                {expanded && (
                  <div style={{ padding: '0 20px 20px', borderTop: '1px solid #f1f5f9' }}>
                    {review.comment && (
                      <div style={{ marginTop: 14, fontSize: 14, color: '#1e293b', lineHeight: 1.6 }}>
                        <strong>Full comment:</strong> {review.comment}
                      </div>
                    )}

                    {/* Dealer response */}
                    <div style={{ marginTop: 16 }}>
                      <label style={{ fontSize: 13, fontWeight: 600, color: '#033280', display: 'block', marginBottom: 6 }}>
                        {t('review.dealerResponse')}
                      </label>
                      <textarea
                        value={responseText}
                        onChange={e => setLocalResponse(p => ({ ...p, [review.id]: e.target.value }))}
                        rows={3}
                        placeholder="Write a response visible to the customer…"
                        style={{
                          width: '100%', padding: '10px 12px', border: '1px solid #e2e8f0',
                          borderRadius: 8, fontFamily: 'inherit', fontSize: 13, resize: 'none',
                          outline: 'none', boxSizing: 'border-box' as const,
                        }}
                      />
                      <button
                        onClick={() => saveResponseMutation.mutate({ id: review.id, dealerResponse: responseText })}
                        disabled={saveResponseMutation.isPending}
                        style={{
                          marginTop: 8, padding: '7px 16px', background: '#033280', color: '#fff',
                          border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600,
                          cursor: 'pointer', fontFamily: 'inherit',
                        }}
                      >
                        {saveResponseMutation.isPending ? 'Saving…' : t('review.saveResponse')}
                      </button>
                    </div>

                    {/* Action buttons */}
                    <div style={{ display: 'flex', gap: 10, marginTop: 16, flexWrap: 'wrap' as const }}>
                      {/* Approve only for 4+ stars that haven't been approved yet */}
                      {review.rating !== null && review.rating >= 4 &&
                        review.status !== 'approved_for_publish' &&
                        review.status !== 'published' && (
                        <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap' as const }}>
                          <select
                            value={approveTarget[review.id] || 'google'}
                            onChange={e => setApproveTarget(p => ({ ...p, [review.id]: e.target.value }))}
                            style={{ padding: '7px 10px', border: '1px solid #e2e8f0', borderRadius: 7, fontSize: 12, fontFamily: 'inherit', background: '#fff' }}
                          >
                            <option value="google">Google</option>
                            <option value="facebook">Facebook</option>
                            <option value="both">Both</option>
                          </select>
                          <button
                            onClick={() => approveMutation.mutate({ id: review.id, publishTarget: approveTarget[review.id] || 'google' })}
                            disabled={approveMutation.isPending}
                            style={{
                              padding: '7px 14px', background: '#0cb22c', color: '#fff',
                              border: 'none', borderRadius: 7, fontSize: 12, fontWeight: 600,
                              cursor: 'pointer', fontFamily: 'inherit',
                            }}
                          >
                            ✓ {t('review.approve')}
                          </button>
                        </div>
                      )}

                      {review.status === 'approved_for_publish' && (
                        <span style={{ fontSize: 12, fontWeight: 600, color: '#0cb22c' }}>
                          ✓ Approved for {review.publishTarget}
                        </span>
                      )}

                      {review.status !== 'flagged' && (
                        <button
                          onClick={() => flagMutation.mutate(review.id)}
                          disabled={flagMutation.isPending}
                          style={{
                            padding: '7px 14px', background: 'none', color: '#ef4444',
                            border: '1.5px solid #ef4444', borderRadius: 7, fontSize: 12, fontWeight: 600,
                            cursor: 'pointer', fontFamily: 'inherit',
                          }}
                        >
                          🚩 {t('review.flag')}
                        </button>
                      )}
                    </div>
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
