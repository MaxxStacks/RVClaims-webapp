// client/src/pages/exclusive/dealer-owner/LoyaltyConfig.tsx
// Route: /:dealerId/owner/loyalty
// Customer Loyalty Program configuration — dealer_owner only

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';

// ── Types ──────────────────────────────────────────────────────────────────────
interface LoyaltyProgram {
  id: string;
  dealershipId: string;
  programName: string;
  isActive: boolean;
  pointsPerDollarService: string;
  pointsPerReferral: number;
  pointsPerFiPurchase: number;
  pointsPerSurvey: number;
}

interface LoyaltyReward {
  id: string;
  programId: string;
  name: string;
  description: string | null;
  pointCost: number;
  rewardType: 'percentage_discount' | 'fixed_discount' | 'free_service' | 'parts_credit' | 'custom';
  rewardValue: string | null;
  isActive: boolean;
  redemptionCount: number;
}

interface ProgramStats {
  totalMembers: number;
  totalPointsIssued: number | string;
  totalPointsRedeemed: number | string;
  totalRewardsRedeemed: number;
}

interface MemberRow {
  customerId: string;
  balance: number;
  totalEarned: number;
  lastActivity: string;
}

const REWARD_TYPES = ['percentage_discount', 'fixed_discount', 'free_service', 'parts_credit', 'custom'] as const;

const rewardTypeLabel = (type: string): string => {
  const map: Record<string, string> = {
    percentage_discount: '% Discount',
    fixed_discount: 'Fixed Discount',
    free_service: 'Free Service',
    parts_credit: 'Parts Credit',
    custom: 'Custom',
  };
  return map[type] || type;
};

// ── Modal for add/edit reward ─────────────────────────────────────────────────
function RewardModal({
  reward,
  onClose,
  onSave,
}: {
  reward: Partial<LoyaltyReward> | null;
  onClose: () => void;
  onSave: (data: Partial<LoyaltyReward>) => void;
}) {
  const { t } = useLanguage();
  const [form, setForm] = useState<Partial<LoyaltyReward>>(
    reward ?? { isActive: true, rewardType: 'percentage_discount' }
  );

  const set = (key: keyof LoyaltyReward, val: unknown) =>
    setForm(prev => ({ ...prev, [key]: val }));

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--bg-card, #fff)', borderRadius: 12, padding: 28,
        width: '100%', maxWidth: 480, boxShadow: '0 16px 48px rgba(0,0,0,.18)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 20, color: 'var(--text, #1e293b)' }}>
          {reward?.id ? t('loyalty.editReward') : t('loyalty.addReward')}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #6b7280)', display: 'block', marginBottom: 4 }}>
              {t('loyalty.rewardName')} *
            </label>
            <input
              className="inp"
              value={form.name || ''}
              onChange={e => set('name', e.target.value)}
              placeholder="e.g. $25 Service Discount"
            />
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #6b7280)', display: 'block', marginBottom: 4 }}>
              {t('loyalty.rewardDescription')}
            </label>
            <input
              className="inp"
              value={form.description || ''}
              onChange={e => set('description', e.target.value)}
              placeholder="Optional description for customers"
            />
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #6b7280)', display: 'block', marginBottom: 4 }}>
                {t('loyalty.pointCost')} *
              </label>
              <input
                className="inp"
                type="number"
                min="1"
                value={form.pointCost || ''}
                onChange={e => set('pointCost', parseInt(e.target.value) || 0)}
              />
            </div>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #6b7280)', display: 'block', marginBottom: 4 }}>
                {t('loyalty.rewardValue')}
              </label>
              <input
                className="inp"
                type="number"
                step="0.01"
                min="0"
                value={form.rewardValue || ''}
                onChange={e => set('rewardValue', e.target.value)}
                placeholder="e.g. 25"
              />
            </div>
          </div>

          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #6b7280)', display: 'block', marginBottom: 4 }}>
              {t('loyalty.rewardType')} *
            </label>
            <select
              className="inp"
              value={form.rewardType || 'percentage_discount'}
              onChange={e => set('rewardType', e.target.value)}
            >
              {REWARD_TYPES.map(rt => (
                <option key={rt} value={rt}>{rewardTypeLabel(rt)}</option>
              ))}
            </select>
          </div>

          <label style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer', fontSize: 13 }}>
            <input
              type="checkbox"
              checked={form.isActive !== false}
              onChange={e => set('isActive', e.target.checked)}
            />
            {t('loyalty.active')}
          </label>
        </div>

        <div style={{ display: 'flex', gap: 10, marginTop: 22, justifyContent: 'flex-end' }}>
          <button className="btn btn-o" onClick={onClose}>{t('common.cancel')}</button>
          <button
            className="btn btn-p"
            style={{ background: '#033280' }}
            onClick={() => onSave(form)}
            disabled={!form.name || !form.pointCost}
          >
            {t('common.save')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Manual Credit Modal ────────────────────────────────────────────────────────
function ManualCreditModal({
  customerId,
  onClose,
  onCredit,
}: {
  customerId: string;
  onClose: () => void;
  onCredit: (points: number, note: string) => void;
}) {
  const { t } = useLanguage();
  const [points, setPoints] = useState('');
  const [note, setNote] = useState('');

  return (
    <div style={{
      position: 'fixed', inset: 0, background: 'rgba(0,0,0,.45)', zIndex: 9000,
      display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20,
    }}>
      <div style={{
        background: 'var(--bg-card, #fff)', borderRadius: 12, padding: 28,
        width: '100%', maxWidth: 380, boxShadow: '0 16px 48px rgba(0,0,0,.18)',
      }}>
        <div style={{ fontSize: 16, fontWeight: 700, marginBottom: 16, color: 'var(--text, #1e293b)' }}>
          {t('loyalty.manualCredit')}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #6b7280)', display: 'block', marginBottom: 4 }}>
              {t('loyalty.creditAmount')} *
            </label>
            <input className="inp" type="number" min="1" value={points} onChange={e => setPoints(e.target.value)} placeholder="e.g. 100" />
          </div>
          <div>
            <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #6b7280)', display: 'block', marginBottom: 4 }}>
              {t('loyalty.creditNote')}
            </label>
            <input className="inp" value={note} onChange={e => setNote(e.target.value)} placeholder="Reason for credit" />
          </div>
        </div>
        <div style={{ display: 'flex', gap: 10, marginTop: 18, justifyContent: 'flex-end' }}>
          <button className="btn btn-o" onClick={onClose}>{t('common.cancel')}</button>
          <button
            className="btn btn-p"
            style={{ background: '#0cb22c' }}
            onClick={() => onCredit(parseInt(points), note)}
            disabled={!points || parseInt(points) <= 0}
          >
            {t('loyalty.manualCredit')}
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main page ─────────────────────────────────────────────────────────────────
export default function LoyaltyConfig() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();

  // Program config form state
  const [programForm, setProgramForm] = useState({
    programName: '',
    isActive: true,
    pointsPerDollarService: '1',
    pointsPerReferral: 500,
    pointsPerFiPurchase: 250,
    pointsPerSurvey: 100,
  });
  const [savingProgram, setSavingProgram] = useState(false);

  // Reward modal state
  const [rewardModalOpen, setRewardModalOpen] = useState(false);
  const [editingReward, setEditingReward] = useState<Partial<LoyaltyReward> | null>(null);

  // Manual credit modal
  const [creditTarget, setCreditTarget] = useState<string | null>(null);

  // Fetch program
  const { data: programData } = useQuery({
    queryKey: ['loyalty-program'],
    queryFn: () => apiFetch<{ success: boolean; program: LoyaltyProgram }>('/api/loyalty/program'),
    retry: false,
  });

  // Fetch rewards
  const { data: rewardsData, refetch: refetchRewards } = useQuery({
    queryKey: ['loyalty-rewards'],
    queryFn: () => apiFetch<{ success: boolean; rewards: LoyaltyReward[] }>('/api/loyalty/rewards'),
  });

  // Fetch stats
  const { data: statsData, refetch: refetchStats } = useQuery({
    queryKey: ['loyalty-stats'],
    queryFn: () => apiFetch<{ success: boolean; stats: ProgramStats; members: MemberRow[] }>('/api/loyalty/stats'),
    retry: false,
  });

  // Populate form when program loads
  useEffect(() => {
    if (programData?.program) {
      const p = programData.program;
      setProgramForm({
        programName: p.programName,
        isActive: p.isActive,
        pointsPerDollarService: p.pointsPerDollarService,
        pointsPerReferral: p.pointsPerReferral,
        pointsPerFiPurchase: p.pointsPerFiPurchase,
        pointsPerSurvey: p.pointsPerSurvey,
      });
    }
  }, [programData]);

  const handleSaveProgram = async () => {
    setSavingProgram(true);
    try {
      await apiFetch('/api/loyalty/program', { method: 'POST', body: JSON.stringify(programForm) });
      qc.invalidateQueries({ queryKey: ['loyalty-program'] });
      toast({ title: t('common.saved'), description: `${programForm.programName} updated.` });
    } catch {
      toast({ title: t('common.error'), description: 'Failed to save program.', variant: 'destructive' });
    } finally {
      setSavingProgram(false);
    }
  };

  const handleSaveReward = async (data: Partial<LoyaltyReward>) => {
    try {
      if (data.id) {
        await apiFetch(`/api/loyalty/rewards/${data.id}`, { method: 'PATCH', body: JSON.stringify(data) });
      } else {
        await apiFetch('/api/loyalty/rewards', { method: 'POST', body: JSON.stringify(data) });
      }
      setRewardModalOpen(false);
      setEditingReward(null);
      refetchRewards();
      toast({ title: t('common.saved') });
    } catch {
      toast({ title: t('common.error'), description: 'Failed to save reward.', variant: 'destructive' });
    }
  };

  const handleDeactivateReward = async (id: string) => {
    try {
      await apiFetch(`/api/loyalty/rewards/${id}`, { method: 'DELETE' });
      refetchRewards();
      toast({ title: t('loyalty.inactive') });
    } catch {
      toast({ title: t('common.error'), description: 'Failed to deactivate.', variant: 'destructive' });
    }
  };

  const handleManualCredit = async (customerId: string, points: number, note: string) => {
    try {
      await apiFetch('/api/loyalty/points/credit', {
        method: 'POST',
        body: JSON.stringify({ customerId, points, description: note }),
      });
      setCreditTarget(null);
      refetchStats();
      toast({ title: t('loyalty.creditSuccess') });
    } catch {
      toast({ title: t('common.error'), description: 'Failed to credit points.', variant: 'destructive' });
    }
  };

  const rewards = rewardsData?.rewards ?? [];
  const stats = statsData?.stats;
  const members = statsData?.members ?? [];

  return (
    <div className="page active">
      {/* Header */}
      <div style={{ marginBottom: 24 }}>
        <div style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #1e293b)' }}>{t('loyalty.title')}</div>
        <div style={{ fontSize: 13, color: 'var(--text-muted, #6b7280)', marginTop: 4 }}>
          {t('loyalty.programSetup')} — $49/month add-on module
        </div>
      </div>

      {/* Section 1 — Program Setup */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div className="pn-h">
          <span className="pn-t">{t('loyalty.programSetup')}</span>
        </div>
        <div style={{ padding: '0 20px 20px', display: 'flex', flexDirection: 'column', gap: 14 }}>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr auto', gap: 16, alignItems: 'flex-end' }}>
            <div>
              <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #6b7280)', display: 'block', marginBottom: 4 }}>
                {t('loyalty.programName')} *
              </label>
              <input
                className="inp"
                value={programForm.programName}
                onChange={e => setProgramForm(prev => ({ ...prev, programName: e.target.value }))}
                placeholder="e.g. RVRewards Club"
              />
            </div>
            <label style={{ display: 'flex', alignItems: 'center', gap: 8, fontSize: 13, paddingBottom: 2, cursor: 'pointer' }}>
              <input
                type="checkbox"
                checked={programForm.isActive}
                onChange={e => setProgramForm(prev => ({ ...prev, isActive: e.target.checked }))}
              />
              {t('loyalty.active')}
            </label>
          </div>

          <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text, #1e293b)', marginTop: 4 }}>
            {t('loyalty.pointsRules')}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))', gap: 12 }}>
            {[
              { key: 'pointsPerDollarService', label: t('loyalty.perDollarService'), type: 'decimal' },
              { key: 'pointsPerReferral', label: t('loyalty.perReferral'), type: 'int' },
              { key: 'pointsPerFiPurchase', label: t('loyalty.perFiPurchase'), type: 'int' },
              { key: 'pointsPerSurvey', label: t('loyalty.perSurvey'), type: 'int' },
            ].map(({ key, label, type }) => (
              <div key={key}>
                <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted, #6b7280)', display: 'block', marginBottom: 4 }}>
                  {label}
                </label>
                <input
                  className="inp"
                  type="number"
                  step={type === 'decimal' ? '0.1' : '1'}
                  min="0"
                  value={(programForm as any)[key]}
                  onChange={e => setProgramForm(prev => ({
                    ...prev,
                    [key]: type === 'decimal' ? e.target.value : parseInt(e.target.value) || 0,
                  }))}
                />
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
            <button
              className="btn btn-p"
              style={{ background: '#033280' }}
              onClick={handleSaveProgram}
              disabled={savingProgram || !programForm.programName}
            >
              {savingProgram ? t('common.saving') : t('common.save')}
            </button>
          </div>
        </div>
      </div>

      {/* Section 2 — Rewards Catalog */}
      <div className="pn" style={{ marginBottom: 20 }}>
        <div className="pn-h">
          <span className="pn-t">{t('loyalty.rewards')}</span>
          <button
            className="btn btn-p btn-sm"
            style={{ background: '#033280' }}
            onClick={() => { setEditingReward(null); setRewardModalOpen(true); }}
          >
            + {t('loyalty.addReward')}
          </button>
        </div>
        <div style={{ padding: '0 0 8px' }}>
          {rewards.length === 0 ? (
            <div style={{ padding: '32px 20px', textAlign: 'center', color: '#888', fontSize: 13 }}>
              {t('loyalty.noRewards')}
            </div>
          ) : (
            <div className="tw">
              <table>
                <thead>
                  <tr>
                    <th>{t('loyalty.rewardName')}</th>
                    <th>{t('loyalty.rewardType')}</th>
                    <th>{t('loyalty.pointCost')}</th>
                    <th>{t('loyalty.redemptionCount')}</th>
                    <th>{t('common.status')}</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  {rewards.map((r) => (
                    <tr key={r.id}>
                      <td>
                        <div style={{ fontWeight: 600, fontSize: 13 }}>{r.name}</div>
                        {r.description && <div style={{ fontSize: 11, color: '#888' }}>{r.description}</div>}
                      </td>
                      <td>
                        <span className="bg active" style={{ fontSize: 11 }}>{rewardTypeLabel(r.rewardType)}</span>
                      </td>
                      <td><strong>{r.pointCost.toLocaleString()}</strong></td>
                      <td>{r.redemptionCount}</td>
                      <td>
                        <span className={`bg ${r.isActive ? 'active' : 'closed'}`} style={{ fontSize: 11 }}>
                          {r.isActive ? t('loyalty.active') : t('loyalty.inactive')}
                        </span>
                      </td>
                      <td>
                        <div style={{ display: 'flex', gap: 6 }}>
                          <button
                            className="btn btn-o btn-sm"
                            onClick={() => { setEditingReward(r); setRewardModalOpen(true); }}
                          >
                            {t('common.edit')}
                          </button>
                          {r.isActive && (
                            <button
                              className="btn btn-o btn-sm"
                              style={{ color: '#dc2626', borderColor: '#fecaca' }}
                              onClick={() => handleDeactivateReward(r.id)}
                            >
                              {t('loyalty.deactivate')}
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Section 3 — Stats */}
      {stats && (
        <div className="stats-grid" style={{ marginBottom: 20 }}>
          {[
            { label: t('loyalty.totalMembers'), value: stats.totalMembers },
            { label: t('loyalty.totalIssued'), value: Number(stats.totalPointsIssued).toLocaleString() },
            { label: t('loyalty.totalRedeemed'), value: Number(stats.totalPointsRedeemed).toLocaleString() },
            { label: t('loyalty.totalRewardsRedeemed'), value: stats.totalRewardsRedeemed },
          ].map(({ label, value }) => (
            <div key={label} className="sc">
              <div className="sc-h">
                <span className="sc-l">{label}</span>
                <div className="sc-i bl">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                </div>
              </div>
              <div className="sc-v" style={{ fontSize: 22 }}>{value}</div>
            </div>
          ))}
        </div>
      )}

      {/* Section 4 — Members Table */}
      {members.length > 0 && (
        <div className="pn" style={{ marginBottom: 20 }}>
          <div className="pn-h">
            <span className="pn-t">{t('loyalty.members')}</span>
          </div>
          <div className="tw">
            <table>
              <thead>
                <tr>
                  <th>{t('loyalty.customerName')}</th>
                  <th>{t('loyalty.balance')}</th>
                  <th>{t('loyalty.totalEarned')}</th>
                  <th>{t('loyalty.lastActivity')}</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {members.map((m) => (
                  <tr key={m.customerId}>
                    <td>
                      <span style={{ fontFamily: 'monospace', fontSize: 12, color: '#888' }}>
                        {m.customerId.slice(0, 8)}…
                      </span>
                    </td>
                    <td><strong style={{ color: m.balance > 0 ? '#16a34a' : '#888' }}>{Number(m.balance).toLocaleString()}</strong></td>
                    <td>{Number(m.totalEarned).toLocaleString()}</td>
                    <td style={{ fontSize: 12, color: '#888' }}>
                      {m.lastActivity ? new Date(m.lastActivity).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' }) : '—'}
                    </td>
                    <td>
                      <button
                        className="btn btn-o btn-sm"
                        style={{ color: '#0cb22c', borderColor: '#bbf7d0' }}
                        onClick={() => setCreditTarget(m.customerId)}
                      >
                        + {t('loyalty.manualCredit')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Modals */}
      {rewardModalOpen && (
        <RewardModal
          reward={editingReward}
          onClose={() => { setRewardModalOpen(false); setEditingReward(null); }}
          onSave={handleSaveReward}
        />
      )}

      {creditTarget && (
        <ManualCreditModal
          customerId={creditTarget}
          onClose={() => setCreditTarget(null)}
          onCredit={(pts, note) => handleManualCredit(creditTarget, pts, note)}
        />
      )}
    </div>
  );
}
