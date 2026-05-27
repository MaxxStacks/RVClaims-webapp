// client/src/pages/exclusive/client/CustomerSurvey.tsx
// Route: /:dealerId/client/review/:reviewId
// Mobile-optimised 3-step satisfaction survey wizard
// NEVER auto-publishes — dealer approves first before anything goes external

import { useState } from 'react';
import { useParams, useLocation } from 'wouter';
import { useQuery, useMutation } from '@tanstack/react-query';
import { apiFetch } from '@/lib/api';
import { useLanguage } from '@/hooks/use-language';

interface ReviewRecord {
  id: string;
  dealershipId: string;
  rating: number | null;
  respondedAt: string | null;
  status: string;
}

interface RespondPayload {
  rating: number;
  comment?: string;
  npsScore: null;
}

interface RespondResponse {
  review: ReviewRecord;
  config: {
    googlePlaceId: string | null;
    facebookPageUrl: string | null;
    customThankYouMessage: string | null;
  } | null;
}

const STAR_LABELS: Record<number, { en: string; fr: string }> = {
  1: { en: 'Poor',      fr: 'Mauvais' },
  2: { en: 'Fair',      fr: 'Passable' },
  3: { en: 'Good',      fr: 'Bien' },
  4: { en: 'Great',     fr: 'Très bien' },
  5: { en: 'Excellent', fr: 'Excellent' },
};

export default function CustomerSurvey() {
  const { dealerId, reviewId } = useParams<{ dealerId: string; reviewId: string }>();
  const [, navigate] = useLocation();
  const { t, language: lang } = useLanguage();

  const [step, setStep] = useState<1 | 2 | 3>(1);
  const [hovered, setHovered] = useState(0);
  const [selected, setSelected] = useState(0);
  const [comment, setComment] = useState('');
  const [responseData, setResponseData] = useState<RespondResponse | null>(null);

  // Load review record (public — uses auth token if present)
  const { data: review, isLoading, isError } = useQuery<ReviewRecord>({
    queryKey: ['review', reviewId],
    queryFn: () => apiFetch<ReviewRecord>(`/api/reviews/${reviewId}`),
    retry: false,
  });

  const respondMutation = useMutation<RespondResponse, Error, RespondPayload>({
    mutationFn: (payload) =>
      apiFetch<RespondResponse>(`/api/reviews/${reviewId}/respond`, {
        method: 'POST',
        body: JSON.stringify(payload),
      }),
    onSuccess: (data) => {
      setResponseData(data);
      setStep(3);
    },
  });

  const handleSelectStar = (star: number) => {
    setSelected(star);
  };

  const handleContinue = () => {
    if (!selected) return;
    setStep(2);
  };

  const handleSubmit = () => {
    respondMutation.mutate({ rating: selected, comment: comment.trim() || undefined, npsScore: null });
  };

  const getGoogleUrl = () => {
    const placeId = responseData?.config?.googlePlaceId;
    if (!placeId) return null;
    return `https://search.google.com/local/writereview?placeid=${placeId}`;
  };

  const getFacebookUrl = () => {
    const fbUrl = responseData?.config?.facebookPageUrl;
    if (!fbUrl) return null;
    return `${fbUrl}/reviews`;
  };

  // ── Shared container styles ──
  const containerStyle: React.CSSProperties = {
    minHeight: '100vh',
    background: '#f8fafc',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '24px 16px',
    fontFamily: 'Inter, system-ui, sans-serif',
  };

  const cardStyle: React.CSSProperties = {
    background: '#ffffff',
    borderRadius: 16,
    boxShadow: '0 4px 24px rgba(0,0,0,0.09)',
    padding: '32px 24px',
    maxWidth: 480,
    width: '100%',
    textAlign: 'center' as const,
  };

  const headingStyle: React.CSSProperties = {
    fontSize: 22,
    fontWeight: 700,
    color: '#033280',
    marginBottom: 8,
  };

  const subStyle: React.CSSProperties = {
    fontSize: 14,
    color: '#64748b',
    marginBottom: 28,
  };

  const btnPrimary: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '15px 20px',
    background: '#0cb22c',
    color: '#fff',
    border: 'none',
    borderRadius: 10,
    fontSize: 16,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: 20,
  };

  const btnSecondary: React.CSSProperties = {
    display: 'block',
    width: '100%',
    padding: '14px 20px',
    background: 'none',
    color: '#033280',
    border: '1.5px solid #033280',
    borderRadius: 10,
    fontSize: 15,
    fontWeight: 600,
    cursor: 'pointer',
    fontFamily: 'inherit',
    marginTop: 10,
  };

  const linkBtn: React.CSSProperties = {
    display: 'block',
    marginTop: 14,
    fontSize: 13,
    color: '#94a3b8',
    cursor: 'pointer',
    background: 'none',
    border: 'none',
    fontFamily: 'inherit',
    textDecoration: 'underline',
  };

  // ── Loading / Error ──
  if (isLoading) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ color: '#64748b', fontSize: 15 }}>Loading…</div>
        </div>
      </div>
    );
  }

  if (isError || !review) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ color: '#ef4444', fontSize: 15 }}>Survey not found or link has expired.</div>
        </div>
      </div>
    );
  }

  // Already responded
  if (review.respondedAt || review.rating !== null) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 48, marginBottom: 16 }}>✅</div>
          <div style={headingStyle}>{t('review.thankYou')}</div>
          <p style={subStyle}>{t('review.alreadySubmitted')}</p>
          <button
            style={btnPrimary}
            onClick={() => navigate(`/${dealerId}/client/dashboard`)}
          >
            Back to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // ── Step 1: Rating ──
  if (step === 1) {
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>⭐</div>
          <div style={headingStyle}>{t('review.step1Title')}</div>
          <p style={subStyle}>Your feedback helps us improve our service.</p>

          {/* Stars */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: 12, margin: '20px 0 8px' }}>
            {[1, 2, 3, 4, 5].map(star => (
              <button
                key={star}
                onMouseEnter={() => setHovered(star)}
                onMouseLeave={() => setHovered(0)}
                onClick={() => handleSelectStar(star)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: 48,
                  padding: 4,
                  lineHeight: 1,
                  color: star <= (hovered || selected) ? '#f59e0b' : '#d1d5db',
                  transition: 'color 0.15s, transform 0.1s',
                  transform: star === (hovered || selected) ? 'scale(1.18)' : 'scale(1)',
                }}
                aria-label={`${star} star`}
              >
                ★
              </button>
            ))}
          </div>

          {/* Label */}
          <div style={{ height: 24, fontSize: 15, fontWeight: 600, color: '#033280', marginBottom: 8 }}>
            {(hovered || selected) ? (STAR_LABELS[hovered || selected]?.[lang as 'en' | 'fr'] ?? '') : ''}
          </div>

          <button
            style={{ ...btnPrimary, opacity: selected ? 1 : 0.45 }}
            disabled={!selected}
            onClick={handleContinue}
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // ── Step 2: Comment ──
  if (step === 2) {
    const maxLen = 500;
    return (
      <div style={containerStyle}>
        <div style={cardStyle}>
          <div style={{ fontSize: 40, marginBottom: 12 }}>💬</div>
          <div style={headingStyle}>{t('review.step2Title')}</div>
          <p style={subStyle}>{t('review.comment')}</p>

          <textarea
            value={comment}
            onChange={e => setComment(e.target.value.slice(0, maxLen))}
            placeholder="Share your experience…"
            rows={5}
            style={{
              width: '100%',
              padding: '12px 14px',
              border: '1.5px solid #e2e8f0',
              borderRadius: 10,
              fontFamily: 'inherit',
              fontSize: 14,
              resize: 'none',
              outline: 'none',
              boxSizing: 'border-box' as const,
              color: '#1e293b',
            }}
          />
          <div style={{ textAlign: 'right' as const, fontSize: 12, color: '#94a3b8', marginTop: 4 }}>
            {maxLen - comment.length} {t('review.charCount')}
          </div>

          <button
            style={btnPrimary}
            onClick={handleSubmit}
            disabled={respondMutation.isPending}
          >
            {respondMutation.isPending ? 'Submitting…' : t('review.submit')}
          </button>
          <button style={btnSecondary} onClick={() => setStep(1)}>
            Back
          </button>
          {respondMutation.isError && (
            <p style={{ color: '#ef4444', fontSize: 13, marginTop: 10 }}>
              Something went wrong. Please try again.
            </p>
          )}
        </div>
      </div>
    );
  }

  // ── Step 3: Thank You ──
  const isPositive = selected >= 4;
  const googleUrl = getGoogleUrl();
  const fbUrl = getFacebookUrl();
  const thankYouMsg = responseData?.config?.customThankYouMessage;

  return (
    <div style={containerStyle}>
      <div style={cardStyle}>
        <div style={{ fontSize: 56, marginBottom: 16 }}>{isPositive ? '🎉' : '🙏'}</div>
        <div style={headingStyle}>
          {isPositive
            ? (thankYouMsg || t('review.thankYou'))
            : t('review.thankYou')}
        </div>

        {isPositive ? (
          <>
            <p style={subStyle}>
              Would you share your experience online? It helps other families find quality service.
            </p>
            {googleUrl && (
              <a href={googleUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button style={btnPrimary}>{t('review.shareGoogle')}</button>
              </a>
            )}
            {fbUrl && (
              <a href={fbUrl} target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                <button style={{ ...btnSecondary }}>{t('review.shareFacebook')}</button>
              </a>
            )}
            <button
              style={linkBtn}
              onClick={() => navigate(`/${dealerId}/client/dashboard`)}
            >
              {t('review.noThanks')}
            </button>
          </>
        ) : (
          <>
            <p style={subStyle}>We take your concerns seriously.</p>
            <p style={{ fontSize: 14, color: '#475569', marginBottom: 20 }}>
              {t('review.followUp')}
            </p>
            <button
              style={btnPrimary}
              onClick={() => navigate(`/${dealerId}/client/dashboard`)}
            >
              Back to Dashboard
            </button>
          </>
        )}
      </div>
    </div>
  );
}
