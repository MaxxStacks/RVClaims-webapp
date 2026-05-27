// client/src/pages/exclusive/client/CustomerLoyalty.tsx
// Route: /:dealerId/client/loyalty
// Customer-facing loyalty program page

import { useState } from 'react';
import { useLocation } from 'wouter';
import { useLanguage } from '@/hooks/use-language';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Types ──────────────────────────────────────────────────────────────────────
interface LoyaltyProgram {
  id: string;
  programName: string;
  isActive: boolean;
  pointsPerDollarService: string;
  pointsPerReferral: number;
  pointsPerFiPurchase: number;
  pointsPerSurvey: number;
}

interface LoyaltyReward {
  id: string;
  name: string;
  description: string | null;
  pointCost: number;
  rewardType: string;
  rewardValue: string | null;
  isActive: boolean;
}

interface PointRecord {
  id: string;
  points: number;
  type: string;
  description: string | null;
  createdAt: string;
}

// ── Confirm Dialog ─────────────────────────────────────────────────────────────
function ConfirmDialog({
  reward,
  onConfirm,
  onCancel,
  busy,
}: {
  reward: LoyaltyReward;
  onConfirm: () => void;
  onCancel: () => void;
  busy: boolean;
}) {
  const { t } = useLanguage();
  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--bg-card, #fff)', borderRadius: 12, padding: 28,
        width: '100%', maxWidth: 380, boxShadow: '0 16px 48px rgba(0,0,0,.18)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 10, color: 'var(--text, #1e293b)' }}>
          {t('loyalty.redeemConfirm')}
        </div>
        <div style={{ fontSize: 14, color: 'var(--text-muted, #6b7280)', marginBottom: 8 }}>
          <strong>{reward.name}</strong>
        </div>
        <div style={{ fontSize: 13, color: '#888', marginBottom: 20 }}>
          Cost: <strong>{reward.pointCost.toLocaleString()} pts</strong>
        </div>
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end' }}>
          <button className="btn btn-o" onClick={onCancel} disabled={busy}>{t('common.cancel')}</button>
          <button
            className="btn btn-p"
            style={{ background: '#0cb22c' }}
            onClick={onConfirm}
            disabled={busy}
          >
            {busy ? t('common.saving') : t('loyalty.redeem')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function CustomerLoyalty() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();
  const [location] = useLocation();
  const [confirmReward, setConfirmReward] = useState<LoyaltyReward | null>(null);
  const [redeeming, setRedeeming] = useState(false);
  const [referralEmail, setReferralEmail] = useState('');
  const [referralUrl, setReferralUrl] = useState<string | null>(null);
  const [sendingInvite, setSendingInvite] = useState(false);

  // Fetch program
  const { data: programData, isError: noProg } = useQuery({
    queryKey: ['loyalty-program'],
    queryFn: () => apiFetch<{ success: boolean; program: LoyaltyProgram }>('/api/loyalty/program'),
    retry: false,
  });

  // Fetch balance
  const { data: balData, refetch: refetchBalance } = useQuery({
    queryKey: ['loyalty-balance'],
    queryFn: () => apiFetch<{ success: boolean; balance: number }>('/api/loyalty/points/balance'),
    enabled: !noProg,
  });

  // Fetch rewards
  const { data: rewardsData } = useQuery({
    queryKey: ['loyalty-rewards'],
    queryFn: () => apiFetch<{ success: boolean; rewards: LoyaltyReward[] }>('/api/loyalty/rewards'),
    enabled: !noProg,
  });

  // Fetch points history
  const { data: historyData } = useQuery({
    queryKey: ['loyalty-points'],
    queryFn: () => apiFetch<{ success: boolean; points: PointRecord[] }>('/api/loyalty/points'),
    enabled: !noProg,
  });

  const program = programData?.program;
  const balance = balData?.balance ?? 0;
  const rewards = (rewardsData?.rewards ?? []).filter(r => r.isActive);
  const history = historyData?.points ?? [];

  // Find next achievable reward
  const nextReward = rewards
    .filter(r => r.pointCost > balance)
    .sort((a, b) => a.pointCost - b.pointCost)[0] ?? null;

  const progressToNext = nextReward
    ? Math.min(100, Math.round((balance / nextReward.pointCost) * 100))
    : 100;

  const handleRedeem = async () => {
    if (!confirmReward) return;
    setRedeeming(true);
    try {
      await apiFetch('/api/loyalty/points/redeem', {
        method: 'POST',
        body: JSON.stringify({ rewardId: confirmReward.id }),
      });
      setConfirmReward(null);
      refetchBalance();
      qc.invalidateQueries({ queryKey: ['loyalty-points'] });
      toast({ title: t('loyalty.redeemSuccess') });
    } catch (err: any) {
      toast({ title: t('common.error'), description: err?.message || 'Redemption failed.', variant: 'destructive' });
    } finally {
      setRedeeming(false);
    }
  };

  const handleGenerateReferral = async () => {
    try {
      const data = await apiFetch<{ success: boolean; referralUrl: string }>('/api/loyalty/referral', {
        method: 'POST',
        body: JSON.stringify({ referredEmail: '' }),
      });
      setReferralUrl(data.referralUrl);
    } catch {
      toast({ title: t('common.error'), description: 'Failed to generate link.', variant: 'destructive' });
    }
  };

  const handleCopyLink = async (url: string) => {
    try {
      await navigator.clipboard.writeText(url);
      toast({ title: t('loyalty.linkCopied') });
    } catch {
      toast({ title: t('loyalty.referralLink'), description: url });
    }
  };

  const handleSendInvite = async () => {
    if (!referralEmail) return;
    setSendingInvite(true);
    try {
      await apiFetch('/api/loyalty/referral', {
        method: 'POST',
        body: JSON.stringify({ referredEmail: referralEmail }),
      });
      setReferralEmail('');
      toast({ title: t('loyalty.emailSent') });
    } catch {
      toast({ title: t('common.error'), description: 'Failed to send invite.', variant: 'destructive' });
    } finally {
      setSendingInvite(false);
    }
  };

  // Running balance calculation for history
  const historyWithRunning = [...history].reverse().reduce(
    (acc, row) => {
      const running = (acc.running ?? 0) + row.points;
      acc.rows.push({ ...row, running });
      acc.running = running;
      return acc;
    },
    { rows: [] as (PointRecord & { running: number })[], running: 0 }
  ).rows.reverse();

  if (noProg || !program) {
    return (
      <div className="page active">
        <div style={{ padding: '60px 20px', textAlign: 'center', color: '#888', fontSize: 14 }}>
          No loyalty program is active at this dealership.
        </div>
      </div>
    );
  }

  return (
    <div className="page active">
      {/* Balance Card */}
      <div style={{
        background: 'linear-gradient(135deg, #033280 0%, #1e40af 100%)',
        borderRadius: 16, padding: '28px 28px 24px',
        color: '#fff', marginBottom: 24,
      }}>
        <div style={{ fontSize: 13, opacity: 0.8, marginBottom: 4 }}>{program.programName}</div>
        <div style={{ fontSize: 13, opacity: 0.75, marginBottom: 8 }}>{t('loyalty.balance')}</div>
        <div style={{ fontSize: 48, fontWeight: 800, lineHeight: 1, marginBottom: 16 }}>
          {balance.toLocaleString()}
          <span style={{ fontSize: 18, fontWeight: 500, marginLeft: 6, opacity: 0.8 }}>pts</span>
        </div>

        {nextReward && (
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, opacity: 0.85, marginBottom: 6 }}>
              <span>{t('loyalty.nextReward')} <strong>{nextReward.name}</strong></span>
              <span>{t('loyalty.onlyXMore').replace('{n}', String(nextReward.pointCost - balance))} pts</span>
            </div>
            <div style={{ height: 6, background: 'rgba(255,255,255,.25)', borderRadius: 3 }}>
              <div style={{
                width: `${progressToNext}%`, height: '100%',
                background: '#0cb22c', borderRadius: 3, transition: 'width 0.4s',
              }} />
            </div>
          </div>
        )}
      </div>

      {/* Available Rewards */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div className="pn-h">
          <span className="pn-t">{t('loyalty.rewards')}</span>
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          {rewards.length === 0 ? (
            <div style={{ textAlign: 'center', color: '#888', fontSize: 13, padding: '24px 0' }}>
              {t('loyalty.noRewards')}
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: 14, marginTop: 12 }}>
              {rewards.map(r => {
                const canAfford = balance >= r.pointCost;
                return (
                  <div key={r.id} style={{
                    border: `1.5px solid ${canAfford ? '#bbf7d0' : 'var(--border, #e8e8e8)'}`,
                    borderRadius: 12, padding: 18,
                    background: canAfford ? '#f0fdf4' : 'var(--bg-secondary, #f8fafc)',
                    opacity: canAfford ? 1 : 0.75,
                  }}>
                    <div style={{ fontSize: 14, fontWeight: 700, color: 'var(--text, #1e293b)', marginBottom: 4 }}>{r.name}</div>
                    {r.description && (
                      <div style={{ fontSize: 12, color: '#888', marginBottom: 10 }}>{r.description}</div>
                    )}
                    <div style={{ fontSize: 18, fontWeight: 800, color: canAfford ? '#16a34a' : '#888', marginBottom: 12 }}>
                      {r.pointCost.toLocaleString()} pts
                    </div>
                    {canAfford ? (
                      <button
                        className="btn btn-p btn-sm"
                        style={{ background: '#0cb22c', width: '100%' }}
                        onClick={() => setConfirmReward(r)}
                      >
                        {t('loyalty.redeem')}
                      </button>
                    ) : (
                      <div style={{ fontSize: 12, color: '#888', textAlign: 'center' }}>
                        {t('loyalty.needMorePoints').replace('{n}', String(r.pointCost - balance))}
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>

      {/* Points History */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div className="pn-h">
          <span className="pn-t">{t('loyalty.history')}</span>
        </div>
        <div style={{ padding: '0 0 8px' }}>
          {historyWithRunning.length === 0 ? (
            <div style={{ padding: '24px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>
              {t('loyalty.noHistory')}
            </div>
          ) : (
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>Date</th>
                    <th>Description</th>
                    <th style={{ textAlign: 'right' }}>Points</th>
                    <th style={{ textAlign: 'right' }}>Balance</th>
                  </tr>
                </thead>
                <tbody>
                  {historyWithRunning.map(row => (
                    <tr key={row.id}>
                      <td style={{ fontSize: 12, color: '#888', whiteSpace: 'nowrap' }}>
                        {new Date(row.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                      </td>
                      <td style={{ fontSize: 13 }}>{row.description || row.type}</td>
                      <td style={{ textAlign: 'right', fontWeight: 700, color: row.points > 0 ? '#16a34a' : '#dc2626' }}>
                        {row.points > 0 ? `+${row.points.toLocaleString()}` : row.points.toLocaleString()}
                      </td>
                      <td style={{ textAlign: 'right', fontSize: 13, color: '#888' }}>
                        {row.running.toLocaleString()}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* How to Earn */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div className="pn-h">
          <span className="pn-t">{t('loyalty.earnPoints')}</span>
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(180px, 1fr))', gap: 12, marginTop: 12 }}>
            {[
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#0cb22c" strokeWidth="2"><path d="M14.7 6.3a1 1 0 000 1.4l1.6 1.6a1 1 0 001.4 0l3.77-3.77a6 6 0 01-7.94 7.94l-6.91 6.91a2.12 2.12 0 01-3-3l6.91-6.91a6 6 0 017.94-7.94l-3.76 3.76z"/></svg>,
                label: 'Service Visits',
                value: `${program.pointsPerDollarService} pt / $1`,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#033280" strokeWidth="2"><path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2"/><circle cx="9" cy="7" r="4"/><path d="M23 21v-2a4 4 0 00-3-3.87"/><path d="M16 3.13a4 4 0 010 7.75"/></svg>,
                label: t('loyalty.referFriend'),
                value: `${program.pointsPerReferral.toLocaleString()} pts`,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#7c3aed" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
                label: 'F&I Purchase',
                value: `${program.pointsPerFiPurchase.toLocaleString()} pts`,
              },
              {
                icon: <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ea580c" strokeWidth="2"><path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/><polyline points="14 2 14 8 20 8"/><line x1="16" y1="13" x2="8" y2="13"/><line x1="16" y1="17" x2="8" y2="17"/></svg>,
                label: 'Surveys',
                value: `${program.pointsPerSurvey.toLocaleString()} pts`,
              },
            ].map(({ icon, label, value }) => (
              <div key={label} style={{
                background: 'var(--bg-secondary, #f8fafc)',
                border: '1px solid var(--border, #e8e8e8)',
                borderRadius: 10, padding: '14px 16px',
                display: 'flex', flexDirection: 'column', gap: 6,
              }}>
                {icon}
                <div style={{ fontSize: 12, color: '#888', marginTop: 4 }}>{label}</div>
                <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--text, #1e293b)' }}>{value}</div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Refer a Friend */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div className="pn-h">
          <span className="pn-t">{t('loyalty.referFriend')}</span>
        </div>
        <div style={{ padding: '0 20px 20px' }}>
          {/* Generate referral link */}
          {!referralUrl ? (
            <button
              className="btn btn-p"
              style={{ background: '#033280', marginTop: 12 }}
              onClick={handleGenerateReferral}
            >
              {t('loyalty.referralLink')}
            </button>
          ) : (
            <div style={{ marginTop: 12 }}>
              <div style={{
                background: 'var(--bg-secondary, #f8fafc)',
                border: '1px solid var(--border, #e8e8e8)',
                borderRadius: 8, padding: '10px 14px',
                fontSize: 12, fontFamily: 'monospace',
                color: 'var(--text-muted, #6b7280)',
                wordBreak: 'break-all', marginBottom: 8,
              }}>
                {referralUrl}
              </div>
              <button
                className="btn btn-o btn-sm"
                onClick={() => handleCopyLink(referralUrl)}
              >
                {t('loyalty.copyLink')}
              </button>
            </div>
          )}

          {/* Email invite */}
          <div style={{ marginTop: 20, display: 'flex', gap: 10, alignItems: 'center' }}>
            <input
              className="inp"
              style={{ flex: 1 }}
              type="email"
              placeholder={t('loyalty.enterEmail')}
              value={referralEmail}
              onChange={e => setReferralEmail(e.target.value)}
            />
            <button
              className="btn btn-p btn-sm"
              style={{ background: '#033280', flexShrink: 0 }}
              onClick={handleSendInvite}
              disabled={!referralEmail || sendingInvite}
            >
              {sendingInvite ? t('common.saving') : t('loyalty.sendInvite')}
            </button>
          </div>
        </div>
      </div>

      {/* Confirm Redeem Modal */}
      {confirmReward && (
        <ConfirmDialog
          reward={confirmReward}
          onConfirm={handleRedeem}
          onCancel={() => setConfirmReward(null)}
          busy={redeeming}
        />
      )}
    </div>
  );
}
