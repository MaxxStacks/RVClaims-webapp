// client/src/pages/exclusive/operator-admin/WalletManagement.tsx
// Route: /operator/admin/wallets

import { useState } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useQuery, useQueryClient } from '@tanstack/react-query';

interface WalletRow {
  id: string;
  dealershipId: string;
  balance: string;
  status: 'active' | 'grace_period' | 'paused';
  lowBalanceThreshold: string;
  gracePeriodEnds: string | null;
  updatedAt: string;
  dealerName: string | null;
  dealerCity: string | null;
}

interface FundingTier {
  id: string;
  minAmount: string;
  maxAmount: string | null;
  bonusPercentage: string;
  isActive: boolean;
}

interface PlatformStats {
  totalPlatformBalance: number;
  totalFundedThisMonth: number;
  totalFeesCollectedThisMonth: number;
  dealersInGracePeriod: number;
  dealersPaused: number;
}

type StatusFilter = 'all' | 'active' | 'low_balance' | 'grace_period' | 'paused';

function fmtCurrency(val: string | number) {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return `$${n.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function StatusBadge({ status, balance, threshold }: { status: string; balance: string; threshold: string }) {
  const bal = parseFloat(balance);
  const thresh = parseFloat(threshold);
  const isLow = status === 'active' && bal < thresh;
  if (status === 'paused') return <span style={{ background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Paused</span>;
  if (status === 'grace_period') return <span style={{ background: '#fff7ed', color: '#f97316', border: '1px solid #fed7aa', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Grace Period</span>;
  if (isLow) return <span style={{ background: '#fffbeb', color: '#d97706', border: '1px solid #fde68a', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Low Balance</span>;
  return <span style={{ background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 4, padding: '2px 8px', fontSize: 11, fontWeight: 700 }}>Active</span>;
}

export default function WalletManagement() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const qc = useQueryClient();

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<StatusFilter>('all');
  const [page, setPage] = useState(1);
  const [tiersOpen, setTiersOpen] = useState(false);

  // Manual credit/debit dialog
  const [dialogTarget, setDialogTarget] = useState<{ dealershipId: string; dealerName: string; action: 'credit' | 'debit' } | null>(null);
  const [dialogAmount, setDialogAmount] = useState('');
  const [dialogReason, setDialogReason] = useState('');
  const [dialogSubmitting, setDialogSubmitting] = useState(false);

  // Tier editing
  const [editingTier, setEditingTier] = useState<string | null>(null);
  const [tierEditValue, setTierEditValue] = useState('');

  const { data: statsData } = useQuery<PlatformStats>({
    queryKey: ['wallet-stats'],
    queryFn: () => apiFetch<PlatformStats>('/api/wallets/stats'),
    staleTime: 60 * 1000,
  });

  const { data: walletsData, isLoading } = useQuery({
    queryKey: ['wallets-list', page, search, statusFilter],
    queryFn: () => apiFetch<{ wallets: WalletRow[] }>(
      `/api/wallets?page=${page}&limit=20&search=${encodeURIComponent(search)}&status=${statusFilter === 'all' ? '' : statusFilter}`
    ),
    staleTime: 60 * 1000,
  });

  const { data: tiersData } = useQuery({
    queryKey: ['wallet-funding-tiers'],
    queryFn: () => apiFetch<{ tiers: FundingTier[] }>('/api/wallets/funding-tiers'),
    staleTime: 5 * 60 * 1000,
  });

  const wallets = walletsData?.wallets ?? [];
  const tiers = tiersData?.tiers ?? [];

  const handleCreditDebit = async () => {
    if (!dialogTarget || !dialogAmount || !dialogReason) return;
    const amt = parseFloat(dialogAmount);
    if (isNaN(amt) || amt <= 0) {
      toast({ title: 'Invalid amount', variant: 'destructive' });
      return;
    }
    setDialogSubmitting(true);
    try {
      const endpoint = `/api/wallets/${dialogTarget.dealershipId}/${dialogTarget.action}`;
      await apiFetch(endpoint, {
        method: 'POST',
        body: JSON.stringify({ amount: amt, reason: dialogReason }),
      });
      qc.invalidateQueries({ queryKey: ['wallets-list'] });
      qc.invalidateQueries({ queryKey: ['wallet-stats'] });
      toast({ title: `${dialogTarget.action === 'credit' ? 'Credit' : 'Debit'} applied successfully`, variant: 'default' });
      setDialogTarget(null);
      setDialogAmount('');
      setDialogReason('');
    } catch (err: any) {
      toast({ title: 'Action failed', description: err.message, variant: 'destructive' });
    }
    setDialogSubmitting(false);
  };

  const handleTierSave = async (tierId: string) => {
    const val = parseFloat(tierEditValue);
    if (isNaN(val) || val < 0) {
      toast({ title: 'Invalid bonus percentage', variant: 'destructive' });
      return;
    }
    try {
      await apiFetch(`/api/wallets/funding-tiers/${tierId}`, {
        method: 'PATCH',
        body: JSON.stringify({ bonusPercentage: val }),
      });
      qc.invalidateQueries({ queryKey: ['wallet-funding-tiers'] });
      setEditingTier(null);
      toast({ title: 'Tier updated', variant: 'default' });
    } catch (err: any) {
      toast({ title: 'Failed to update tier', description: err.message, variant: 'destructive' });
    }
  };

  const stats = statsData;

  return (
    <div style={{ maxWidth: 1100, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #111)', margin: 0 }}>{t('wallet.wallet')} Management</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #888)', marginTop: 4 }}>Monitor dealer wallet balances and manage platform credits</p>
      </div>

      {/* ─── SUMMARY CARDS ─── */}
      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: 12, marginBottom: 20 }}>
        {[
          { label: 'Total Platform Balance', value: fmtCurrency(stats?.totalPlatformBalance ?? 0), color: '#16a34a' },
          { label: 'Funded This Month', value: fmtCurrency(stats?.totalFundedThisMonth ?? 0), color: '#2563eb' },
          { label: 'Fees Collected (MTD)', value: fmtCurrency(stats?.totalFeesCollectedThisMonth ?? 0), color: '#7c3aed' },
          { label: 'Attention Required', value: String((stats?.dealersInGracePeriod ?? 0) + (stats?.dealersPaused ?? 0)), color: '#dc2626' },
        ].map(card => (
          <div key={card.label} className="card" style={{ padding: '16px 18px' }}>
            <div style={{ fontSize: 11, color: '#888', fontWeight: 500, marginBottom: 4 }}>{card.label}</div>
            <div style={{ fontSize: 22, fontWeight: 800, color: card.color }}>{card.value}</div>
          </div>
        ))}
      </div>

      {/* ─── DEALER WALLETS TABLE ─── */}
      <div className="card" style={{ marginBottom: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 14, flexWrap: 'wrap' as const, gap: 8 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text, #111)' }}>Dealer Wallets</h3>
          <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' as const }}>
            <input
              value={search}
              onChange={e => { setSearch(e.target.value); setPage(1); }}
              placeholder="Search dealer…"
              style={{ padding: '6px 10px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 6, fontSize: 13, outline: 'none', width: 180 }}
            />
            <select
              value={statusFilter}
              onChange={e => { setStatusFilter(e.target.value as StatusFilter); setPage(1); }}
              style={{ padding: '6px 10px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 6, fontSize: 13, outline: 'none', background: 'var(--bg-card, #fff)', color: 'var(--text, #333)' }}
            >
              <option value="all">All</option>
              <option value="active">Active</option>
              <option value="grace_period">Grace Period</option>
              <option value="paused">Paused</option>
            </select>
          </div>
        </div>

        {isLoading && <div style={{ color: '#aaa', fontSize: 13, padding: '12px 0' }}>Loading…</div>}
        {!isLoading && wallets.length === 0 && (
          <div style={{ color: '#aaa', fontSize: 13, padding: '12px 0' }}>No dealer wallets found.</div>
        )}
        {!isLoading && wallets.length > 0 && (
          <div style={{ overflowX: 'auto' as const }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border, #e8e8e8)' }}>
                  <th style={{ textAlign: 'left' as const, padding: '7px 8px', color: '#888', fontWeight: 600 }}>Dealer</th>
                  <th style={{ textAlign: 'right' as const, padding: '7px 8px', color: '#888', fontWeight: 600 }}>Balance</th>
                  <th style={{ padding: '7px 8px', color: '#888', fontWeight: 600 }}>Status</th>
                  <th style={{ textAlign: 'right' as const, padding: '7px 8px', color: '#888', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {wallets.map(w => (
                  <tr key={w.id} style={{ borderBottom: '1px solid var(--border, #f4f4f4)' }}>
                    <td style={{ padding: '9px 8px' }}>
                      <div style={{ fontWeight: 600, color: 'var(--text, #333)' }}>{w.dealerName ?? '—'}</div>
                      {w.dealerCity && <div style={{ fontSize: 11, color: '#aaa' }}>{w.dealerCity}</div>}
                    </td>
                    <td style={{ padding: '9px 8px', textAlign: 'right' as const, fontWeight: 700, color: parseFloat(w.balance) <= 0 ? '#dc2626' : '#16a34a' }}>
                      {fmtCurrency(w.balance)}
                    </td>
                    <td style={{ padding: '9px 8px' }}>
                      <StatusBadge status={w.status} balance={w.balance} threshold={w.lowBalanceThreshold} />
                      {w.status === 'grace_period' && w.gracePeriodEnds && (
                        <div style={{ fontSize: 10, color: '#f97316', marginTop: 2 }}>
                          Ends {new Date(w.gracePeriodEnds).toLocaleDateString('en-CA')}
                        </div>
                      )}
                    </td>
                    <td style={{ padding: '9px 8px', textAlign: 'right' as const }}>
                      <div style={{ display: 'flex', gap: 6, justifyContent: 'flex-end' }}>
                        <button
                          onClick={() => { setDialogTarget({ dealershipId: w.dealershipId, dealerName: w.dealerName ?? 'Dealer', action: 'credit' }); setDialogAmount(''); setDialogReason(''); }}
                          style={{ fontSize: 11, padding: '3px 9px', background: '#f0fdf4', color: '#16a34a', border: '1px solid #bbf7d0', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                        >+ {t('wallet.manualCredit')}</button>
                        <button
                          onClick={() => { setDialogTarget({ dealershipId: w.dealershipId, dealerName: w.dealerName ?? 'Dealer', action: 'debit' }); setDialogAmount(''); setDialogReason(''); }}
                          style={{ fontSize: 11, padding: '3px 9px', background: '#fef2f2', color: '#dc2626', border: '1px solid #fecaca', borderRadius: 5, cursor: 'pointer', fontFamily: 'inherit', fontWeight: 600 }}
                        >- {t('wallet.manualDebit')}</button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── FUNDING TIERS (COLLAPSIBLE) ─── */}
      <div className="card" style={{ padding: 20 }}>
        <button
          onClick={() => setTiersOpen(o => !o)}
          style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', background: 'none', border: 'none', cursor: 'pointer', fontFamily: 'inherit', padding: 0 }}
        >
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text, #111)' }}>{t('wallet.fundingTiers')}</h3>
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ transform: tiersOpen ? 'rotate(180deg)' : 'rotate(0)', transition: 'transform 0.2s' }}>
            <polyline points="6 9 12 15 18 9"/>
          </svg>
        </button>

        {tiersOpen && (
          <div style={{ marginTop: 14 }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
              <thead>
                <tr style={{ borderBottom: '1px solid var(--border, #e8e8e8)' }}>
                  <th style={{ textAlign: 'left' as const, padding: '6px 8px', color: '#888', fontWeight: 600 }}>Min Amount</th>
                  <th style={{ textAlign: 'left' as const, padding: '6px 8px', color: '#888', fontWeight: 600 }}>Max Amount</th>
                  <th style={{ textAlign: 'left' as const, padding: '6px 8px', color: '#888', fontWeight: 600 }}>Bonus %</th>
                  <th style={{ textAlign: 'left' as const, padding: '6px 8px', color: '#888', fontWeight: 600 }}>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tiers.map(tier => (
                  <tr key={tier.id} style={{ borderBottom: '1px solid var(--border, #f4f4f4)' }}>
                    <td style={{ padding: '8px' }}>${parseInt(tier.minAmount).toLocaleString()}</td>
                    <td style={{ padding: '8px' }}>{tier.maxAmount ? `$${parseInt(tier.maxAmount).toLocaleString()}` : 'No limit'}</td>
                    <td style={{ padding: '8px' }}>
                      {editingTier === tier.id ? (
                        <input
                          type="number"
                          value={tierEditValue}
                          onChange={e => setTierEditValue(e.target.value)}
                          style={{ width: 60, padding: '3px 6px', border: '1px solid #033280', borderRadius: 4, fontSize: 13, outline: 'none' }}
                        />
                      ) : (
                        <strong>{tier.bonusPercentage}%</strong>
                      )}
                    </td>
                    <td style={{ padding: '8px' }}>
                      {editingTier === tier.id ? (
                        <div style={{ display: 'flex', gap: 5 }}>
                          <button onClick={() => handleTierSave(tier.id)} style={{ fontSize: 11, padding: '3px 8px', background: '#033280', color: '#fff', border: 'none', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>Save</button>
                          <button onClick={() => setEditingTier(null)} style={{ fontSize: 11, padding: '3px 8px', background: 'none', border: '1px solid var(--border, #e0e0e0)', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>Cancel</button>
                        </div>
                      ) : (
                        <button onClick={() => { setEditingTier(tier.id); setTierEditValue(tier.bonusPercentage); }} style={{ fontSize: 11, padding: '3px 8px', background: 'none', border: '1px solid var(--border, #e0e0e0)', borderRadius: 4, cursor: 'pointer', fontFamily: 'inherit' }}>{t('common.edit')}</button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* ─── CREDIT/DEBIT DIALOG ─── */}
      {dialogTarget && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.4)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999 }}>
          <div style={{ background: 'var(--bg-card, #fff)', borderRadius: 12, padding: 24, width: 360, maxWidth: '90vw', boxShadow: '0 20px 60px rgba(0,0,0,0.2)' }}>
            <h3 style={{ fontSize: 16, fontWeight: 700, margin: '0 0 4px', color: 'var(--text, #111)' }}>
              {dialogTarget.action === 'credit' ? t('wallet.manualCredit') : t('wallet.manualDebit')}
            </h3>
            <p style={{ fontSize: 12, color: '#888', margin: '0 0 16px' }}>{dialogTarget.dealerName}</p>

            <label style={{ fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 4 }}>Amount ($)</label>
            <input
              type="number"
              min="1"
              value={dialogAmount}
              onChange={e => setDialogAmount(e.target.value)}
              placeholder="Enter amount"
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 7, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const, marginBottom: 12 }}
            />

            <label style={{ fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 4 }}>Reason / Note</label>
            <textarea
              value={dialogReason}
              onChange={e => setDialogReason(e.target.value)}
              placeholder="Describe the reason for this adjustment"
              rows={3}
              style={{ width: '100%', padding: '8px 10px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 7, fontSize: 13, outline: 'none', resize: 'vertical' as const, boxSizing: 'border-box' as const, marginBottom: 16, fontFamily: 'inherit' }}
            />

            <div style={{ display: 'flex', gap: 8 }}>
              <button
                onClick={handleCreditDebit}
                disabled={dialogSubmitting || !dialogAmount || !dialogReason}
                style={{ flex: 1, padding: '9px 0', background: (!dialogAmount || !dialogReason || dialogSubmitting) ? '#e5e7eb' : dialogTarget.action === 'credit' ? '#16a34a' : '#dc2626', color: (!dialogAmount || !dialogReason || dialogSubmitting) ? '#9ca3af' : '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
              >
                {dialogSubmitting ? 'Processing…' : dialogTarget.action === 'credit' ? 'Apply Credit' : 'Apply Debit'}
              </button>
              <button
                onClick={() => setDialogTarget(null)}
                style={{ flex: 1, padding: '9px 0', background: 'none', border: '1px solid var(--border, #e0e0e0)', borderRadius: 8, fontSize: 14, cursor: 'pointer', fontFamily: 'inherit', color: 'var(--text, #333)' }}
              >
                {t('common.cancel')}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
