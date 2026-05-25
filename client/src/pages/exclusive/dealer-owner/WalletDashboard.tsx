// client/src/pages/exclusive/dealer-owner/WalletDashboard.tsx
// Route: /:dealerId/owner/wallet

import { useState, useEffect } from 'react';
import { useLanguage } from '@/hooks/use-language';
import { useWallet, useInvalidateWallet } from '@/hooks/useWallet';
import { useAuth } from '@/hooks/use-auth';
import { apiFetch } from '@/lib/api';
import { useToast } from '@/hooks/use-toast';
import { useQuery } from '@tanstack/react-query';

interface FundingTier {
  id: string;
  minAmount: string;
  maxAmount: string | null;
  bonusPercentage: string;
  isActive: boolean;
}

interface UpcomingCharge {
  description: string;
  amount: number;
  dueDate: string;
}

interface Transaction {
  id: string;
  type: string;
  amount: string;
  balanceAfter: string;
  description: string;
  createdAt: string;
}

type TabKey = 'all' | 'funding' | 'subscriptions' | 'fees' | 'other';

const TYPE_COLORS: Record<string, string> = {
  funding: '#16a34a',
  bonus: '#7c3aed',
  subscription_fee: '#dc2626',
  claim_fee: '#dc2626',
  transaction_fee: '#dc2626',
  manual_credit: '#16a34a',
  manual_debit: '#dc2626',
  refund: '#2563eb',
};

const TAB_TYPES: Record<TabKey, string[]> = {
  all: [],
  funding: ['funding', 'bonus'],
  subscriptions: ['subscription_fee'],
  fees: ['claim_fee', 'transaction_fee'],
  other: ['manual_credit', 'manual_debit', 'refund'],
};

function formatCurrency(val: string | number) {
  const n = typeof val === 'string' ? parseFloat(val) : val;
  return `$${Math.abs(n).toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

export default function WalletDashboard() {
  const { t } = useLanguage();
  const { toast } = useToast();
  const { user } = useAuth();
  const invalidateWallet = useInvalidateWallet();
  const { wallet, balance, isLowBalance, isGracePeriod, isPaused, gracePeriodEnds } = useWallet();

  // Fund modal state
  const [fundAmount, setFundAmount] = useState('');
  const [fundLoading, setFundLoading] = useState(false);
  const [bonusInfo, setBonusInfo] = useState<{ bonusAmount: number; bonusPercentage: number; totalCredits: number } | null>(null);
  const [nextTierInfo, setNextTierInfo] = useState<{ nextMin: number; nextBonus: number } | null>(null);

  // Transaction tab + pagination
  const [activeTab, setActiveTab] = useState<TabKey>('all');
  const [txPage, setTxPage] = useState(1);

  // Auto-reload settings
  const [autoReloadEnabled, setAutoReloadEnabled] = useState(false);
  const [autoReloadAmount, setAutoReloadAmount] = useState('');
  const [threshold, setThreshold] = useState('500');
  const [settingsSaving, setSettingsSaving] = useState(false);

  // Sync wallet settings into local state
  useEffect(() => {
    if (wallet) {
      setAutoReloadEnabled(wallet.autoReloadEnabled);
      setAutoReloadAmount(wallet.autoReloadAmount ?? '');
      setThreshold(wallet.lowBalanceThreshold);
    }
  }, [wallet?.id]);

  // Funding tiers
  const { data: tiersData } = useQuery({
    queryKey: ['wallet-funding-tiers'],
    queryFn: () => apiFetch<{ tiers: FundingTier[] }>('/api/wallets/funding-tiers'),
    staleTime: 10 * 60 * 1000,
  });
  const tiers = tiersData?.tiers ?? [];

  // Upcoming charges
  const { data: upcomingData } = useQuery({
    queryKey: ['wallet-upcoming'],
    queryFn: () => apiFetch<{ charges: UpcomingCharge[]; totalMonthly: number; monthsCoverage: number | null }>('/api/wallets/my/upcoming'),
    staleTime: 5 * 60 * 1000,
  });

  // Transactions
  const typeParam = activeTab !== 'all' ? `&type=${TAB_TYPES[activeTab].join(',')}` : '';
  const { data: txData, isLoading: txLoading } = useQuery({
    queryKey: ['wallet-transactions', txPage, activeTab],
    queryFn: () => apiFetch<{ transactions: Transaction[]; total: number; page: number; totalPages: number }>(
      `/api/wallets/my/transactions?page=${txPage}&limit=20${typeParam}`
    ),
    staleTime: 60 * 1000,
  });

  // Calculate bonus as user types
  useEffect(() => {
    const amt = parseFloat(fundAmount);
    if (!amt || isNaN(amt) || amt < 100) {
      setBonusInfo(null);
      setNextTierInfo(null);
      return;
    }
    // Find matching tier
    let matchedBonus = 0;
    let matchedTier: FundingTier | null = null;
    for (const tier of [...tiers].sort((a, b) => parseFloat(b.minAmount) - parseFloat(a.minAmount))) {
      const min = parseFloat(tier.minAmount);
      const max = tier.maxAmount !== null ? parseFloat(tier.maxAmount) : null;
      if (amt >= min && (max === null || amt <= max)) {
        matchedBonus = parseFloat(tier.bonusPercentage);
        matchedTier = tier;
        break;
      }
    }
    const bonusAmt = Math.round(amt * (matchedBonus / 100) * 100) / 100;
    setBonusInfo({ bonusAmount: bonusAmt, bonusPercentage: matchedBonus, totalCredits: amt + bonusAmt });

    // Next tier info
    const sortedTiers = [...tiers].sort((a, b) => parseFloat(a.minAmount) - parseFloat(b.minAmount));
    const nextTier = sortedTiers.find(t => parseFloat(t.minAmount) > amt);
    if (nextTier) {
      setNextTierInfo({ nextMin: parseFloat(nextTier.minAmount), nextBonus: parseFloat(nextTier.bonusPercentage) });
    } else {
      setNextTierInfo(null);
    }
  }, [fundAmount, tiers]);

  const handleFundNow = async () => {
    const amt = parseFloat(fundAmount);
    if (!amt || isNaN(amt) || amt < 100) {
      toast({ title: 'Minimum funding amount is $100', variant: 'destructive' });
      return;
    }
    setFundLoading(true);
    try {
      const data = await apiFetch<any>('/api/wallets/my/fund', {
        method: 'POST',
        body: JSON.stringify({ amount: amt }),
      });
      if (data.stripeNotConfigured) {
        toast({ title: 'Payment processing coming soon', description: 'Contact your DS360 operator to fund your wallet.', variant: 'default' });
        setFundLoading(false);
        return;
      }
      // Stripe Elements flow — for now show success toast (full Stripe.js integration deferred to payment module)
      toast({ title: 'Stripe payment initiated', description: 'Use the clientSecret to complete payment via your UI.', variant: 'default' });
    } catch (err: any) {
      toast({ title: 'Failed to initiate funding', description: err.message, variant: 'destructive' });
    }
    setFundLoading(false);
  };

  const handleSaveSettings = async () => {
    setSettingsSaving(true);
    try {
      await apiFetch('/api/wallets/my/settings', {
        method: 'PATCH',
        body: JSON.stringify({
          lowBalanceThreshold: parseFloat(threshold) || 500,
          autoReloadEnabled,
          autoReloadAmount: autoReloadEnabled && autoReloadAmount ? parseFloat(autoReloadAmount) : null,
        }),
      });
      invalidateWallet();
      toast({ title: t('wallet.saveSettings') + ' ✓', variant: 'default' });
    } catch (err: any) {
      toast({ title: 'Failed to save settings', description: err.message, variant: 'destructive' });
    }
    setSettingsSaving(false);
  };

  const exportCSV = () => {
    const rows = txData?.transactions ?? [];
    if (!rows.length) return;
    const header = 'Date,Description,Type,Amount,Balance After';
    const lines = rows.map(t =>
      `"${new Date(t.createdAt).toLocaleDateString('en-CA')}","${t.description}","${t.type}","${t.amount}","${t.balanceAfter}"`
    );
    const csv = [header, ...lines].join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `wallet-transactions-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
    URL.revokeObjectURL(url);
  };

  // Grace period days remaining
  const graceDaysLeft = gracePeriodEnds
    ? Math.max(0, Math.ceil((gracePeriodEnds.getTime() - Date.now()) / (1000 * 60 * 60 * 24)))
    : null;

  const statusColor = isPaused ? '#dc2626' : isGracePeriod ? '#f97316' : isLowBalance ? '#d97706' : '#16a34a';
  const statusLabel = isPaused
    ? t('wallet.servicesPaused')
    : isGracePeriod
    ? `${t('wallet.gracePeriod')} — ${graceDaysLeft} day${graceDaysLeft !== 1 ? 's' : ''} remaining`
    : isLowBalance
    ? t('wallet.lowBalance')
    : 'Active';

  return (
    <div style={{ maxWidth: 900, margin: '0 auto', padding: '24px 16px' }}>
      <div style={{ marginBottom: 20 }}>
        <h1 style={{ fontSize: 22, fontWeight: 700, color: 'var(--text, #111)', margin: 0 }}>{t('wallet.wallet')}</h1>
        <p style={{ fontSize: 13, color: 'var(--text-muted, #888)', marginTop: 4 }}>Manage your DS360 prepaid credit balance</p>
      </div>

      {/* ─── BALANCE CARD ─── */}
      <div className="card" style={{ marginBottom: 16, padding: 24, textAlign: 'center' as const }}>
        <div style={{ fontSize: 12, color: '#888', fontWeight: 500, marginBottom: 4 }}>{t('wallet.balance')}</div>
        <div style={{ fontSize: 40, fontWeight: 800, color: statusColor, letterSpacing: '-1px', marginBottom: 8 }}>
          ${balance.toLocaleString('en-CA', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
        </div>
        <div style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: `${statusColor}18`, border: `1px solid ${statusColor}40`, borderRadius: 20, padding: '4px 14px', fontSize: 12, fontWeight: 600, color: statusColor }}>
          {statusLabel}
        </div>
        {isGracePeriod && (
          <div style={{ marginTop: 14, padding: '10px 16px', background: '#fff7ed', border: '1px solid #fed7aa', borderRadius: 8, fontSize: 13, color: '#9a3412' }}>
            Fund your wallet immediately to avoid service interruption. Services pause in {graceDaysLeft} day{graceDaysLeft !== 1 ? 's' : ''}.
          </div>
        )}
        {isPaused && (
          <div style={{ marginTop: 14, padding: '10px 16px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: 8, fontSize: 13, color: '#991b1b' }}>
            Your services are currently paused. Fund your wallet to restore full access.
          </div>
        )}
      </div>

      {/* ─── FUND WALLET SECTION ─── */}
      <div className="card" style={{ marginBottom: 16, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 14px', color: 'var(--text, #111)' }}>{t('wallet.fundWallet')}</h3>
        <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' as const, alignItems: 'flex-start' }}>
          <div style={{ flex: 1, minWidth: 200 }}>
            <label style={{ fontSize: 12, fontWeight: 500, color: '#888', display: 'block', marginBottom: 4 }}>Amount (CAD)</label>
            <input
              type="number"
              min="100"
              step="100"
              value={fundAmount}
              onChange={e => setFundAmount(e.target.value)}
              placeholder="e.g. 5000"
              style={{ width: '100%', padding: '8px 12px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 8, fontSize: 14, outline: 'none', boxSizing: 'border-box' as const }}
            />
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>Minimum $100</div>
          </div>
          <button
            onClick={handleFundNow}
            disabled={fundLoading || !fundAmount || parseFloat(fundAmount) < 100}
            style={{ marginTop: 20, padding: '9px 22px', background: (!fundAmount || parseFloat(fundAmount) < 100 || fundLoading) ? '#e5e7eb' : '#033280', color: (!fundAmount || parseFloat(fundAmount) < 100 || fundLoading) ? '#9ca3af' : '#fff', border: 'none', borderRadius: 8, fontSize: 14, fontWeight: 600, cursor: 'pointer', fontFamily: 'inherit' }}
          >
            {fundLoading ? 'Processing…' : t('wallet.fundNow')}
          </button>
        </div>

        {/* Live bonus calculation */}
        {bonusInfo && (
          <div style={{ marginTop: 12, padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: 8 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap' as const, gap: 8 }}>
              <div>
                <span style={{ fontSize: 12, color: '#15803d', fontWeight: 600 }}>
                  +{bonusInfo.bonusPercentage}% {t('wallet.bonusTier')} — +${bonusInfo.bonusAmount.toFixed(2)} {t('wallet.bonusCredits')}
                </span>
              </div>
              <div style={{ fontSize: 13, fontWeight: 700, color: '#15803d' }}>
                = ${bonusInfo.totalCredits.toFixed(2)} {t('wallet.totalCredits')}
              </div>
            </div>
            {nextTierInfo && (
              <div style={{ fontSize: 11, color: '#666', marginTop: 4 }}>
                Deposit ${(nextTierInfo.nextMin - parseFloat(fundAmount)).toLocaleString()} more to reach the {nextTierInfo.nextBonus}% bonus tier!
              </div>
            )}
          </div>
        )}

        {/* Tier reference */}
        {tiers.length > 0 && (
          <div style={{ marginTop: 14 }}>
            <div style={{ fontSize: 11, fontWeight: 600, color: '#888', marginBottom: 6 }}>{t('wallet.fundingTiers')}</div>
            <div style={{ display: 'flex', gap: 6, flexWrap: 'wrap' as const }}>
              {tiers.map(tier => (
                <div key={tier.id} style={{ fontSize: 11, padding: '3px 9px', background: 'var(--bg-secondary, #f4f6fb)', border: '1px solid var(--border, #e8e8e8)', borderRadius: 20 }}>
                  ${parseInt(tier.minAmount).toLocaleString()}
                  {tier.maxAmount ? `–$${parseInt(tier.maxAmount).toLocaleString()}` : '+'}
                  {' '}→ <strong>{tier.bonusPercentage}%</strong>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ─── UPCOMING CHARGES ─── */}
      <div className="card" style={{ marginBottom: 16, padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: 'var(--text, #111)' }}>{t('wallet.upcomingCharges')}</h3>
        {!upcomingData ? (
          <div style={{ color: '#aaa', fontSize: 13 }}>Loading…</div>
        ) : upcomingData.charges.length === 0 ? (
          <div style={{ color: '#aaa', fontSize: 13 }}>No upcoming charges found.</div>
        ) : (
          <>
            <div style={{ borderTop: '1px solid var(--border, #e8e8e8)' }}>
              {upcomingData.charges.map((c, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '9px 0', borderBottom: '1px solid var(--border, #f0f0f0)', fontSize: 13 }}>
                  <span style={{ color: 'var(--text, #333)' }}>{c.description}</span>
                  <span style={{ fontWeight: 600, color: '#dc2626' }}>-{formatCurrency(c.amount)}</span>
                </div>
              ))}
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 10, paddingTop: 8, borderTop: '2px solid var(--border, #e8e8e8)' }}>
              <span style={{ fontSize: 13, fontWeight: 600 }}>Estimated monthly cost</span>
              <span style={{ fontSize: 13, fontWeight: 700, color: '#dc2626' }}>-{formatCurrency(upcomingData.totalMonthly)}</span>
            </div>
            {upcomingData.monthsCoverage !== null && (
              <div style={{ marginTop: 8, fontSize: 12, color: '#888' }}>
                At current balance: <strong>{upcomingData.monthsCoverage}</strong> {t('wallet.monthsCoverage')} remaining
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── TRANSACTION HISTORY ─── */}
      <div className="card" style={{ marginBottom: 16, padding: 20 }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 }}>
          <h3 style={{ fontSize: 15, fontWeight: 700, margin: 0, color: 'var(--text, #111)' }}>{t('wallet.transactionHistory')}</h3>
          <button onClick={exportCSV} style={{ fontSize: 12, color: '#033280', background: 'none', border: '1px solid #c7d4f0', borderRadius: 6, padding: '4px 10px', cursor: 'pointer', fontFamily: 'inherit' }}>
            {t('common.export')} CSV
          </button>
        </div>

        {/* Tabs */}
        <div style={{ display: 'flex', gap: 4, marginBottom: 14, borderBottom: '1px solid var(--border, #e8e8e8)', paddingBottom: 8 }}>
          {(['all', 'funding', 'subscriptions', 'fees', 'other'] as TabKey[]).map(tab => (
            <button
              key={tab}
              onClick={() => { setActiveTab(tab); setTxPage(1); }}
              style={{ fontSize: 12, padding: '4px 10px', borderRadius: 6, border: 'none', cursor: 'pointer', fontFamily: 'inherit', fontWeight: activeTab === tab ? 700 : 400, background: activeTab === tab ? '#033280' : 'var(--bg-secondary, #f4f6fb)', color: activeTab === tab ? '#fff' : 'var(--text-muted, #666)' }}
            >
              {tab.charAt(0).toUpperCase() + tab.slice(1)}
            </button>
          ))}
        </div>

        {txLoading && <div style={{ color: '#aaa', fontSize: 13, padding: '12px 0' }}>Loading…</div>}
        {!txLoading && (!txData?.transactions?.length) && (
          <div style={{ color: '#aaa', fontSize: 13, padding: '12px 0' }}>No transactions found.</div>
        )}
        {!txLoading && (txData?.transactions?.length ?? 0) > 0 && (
          <>
            <div style={{ overflowX: 'auto' as const }}>
              <table style={{ width: '100%', borderCollapse: 'collapse' as const, fontSize: 13 }}>
                <thead>
                  <tr style={{ borderBottom: '1px solid var(--border, #e8e8e8)' }}>
                    <th style={{ textAlign: 'left' as const, padding: '6px 8px', color: '#888', fontWeight: 600 }}>Date</th>
                    <th style={{ textAlign: 'left' as const, padding: '6px 8px', color: '#888', fontWeight: 600 }}>Description</th>
                    <th style={{ textAlign: 'left' as const, padding: '6px 8px', color: '#888', fontWeight: 600 }}>Type</th>
                    <th style={{ textAlign: 'right' as const, padding: '6px 8px', color: '#888', fontWeight: 600 }}>Amount</th>
                    <th style={{ textAlign: 'right' as const, padding: '6px 8px', color: '#888', fontWeight: 600 }}>Balance After</th>
                  </tr>
                </thead>
                <tbody>
                  {(txData?.transactions ?? []).map(tx => {
                    const amt = parseFloat(tx.amount);
                    const isCredit = amt > 0;
                    return (
                      <tr key={tx.id} style={{ borderBottom: '1px solid var(--border, #f4f4f4)' }}>
                        <td style={{ padding: '8px', color: '#666', whiteSpace: 'nowrap' as const }}>
                          {new Date(tx.createdAt).toLocaleDateString('en-CA', { month: 'short', day: 'numeric', year: 'numeric' })}
                        </td>
                        <td style={{ padding: '8px', color: 'var(--text, #333)' }}>{tx.description}</td>
                        <td style={{ padding: '8px' }}>
                          <span style={{ fontSize: 11, padding: '2px 7px', borderRadius: 4, background: `${TYPE_COLORS[tx.type] ?? '#888'}18`, color: TYPE_COLORS[tx.type] ?? '#888', fontWeight: 600 }}>
                            {tx.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right' as const, fontWeight: 600, color: isCredit ? '#16a34a' : '#dc2626' }}>
                          {isCredit ? '+' : '-'}{formatCurrency(tx.amount)}
                        </td>
                        <td style={{ padding: '8px', textAlign: 'right' as const, color: '#888' }}>
                          {formatCurrency(tx.balanceAfter)}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            {/* Pagination */}
            {(txData?.totalPages ?? 0) > 1 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: 12, fontSize: 12, color: '#888' }}>
                <span>Page {txData?.page} of {txData?.totalPages} ({txData?.total} transactions)</span>
                <div style={{ display: 'flex', gap: 6 }}>
                  <button disabled={txPage <= 1} onClick={() => setTxPage(p => p - 1)} style={{ padding: '4px 10px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 6, background: 'none', cursor: txPage > 1 ? 'pointer' : 'default', color: txPage > 1 ? '#033280' : '#ccc', fontSize: 12, fontFamily: 'inherit' }}>Prev</button>
                  <button disabled={txPage >= (txData?.totalPages ?? 0)} onClick={() => setTxPage(p => p + 1)} style={{ padding: '4px 10px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 6, background: 'none', cursor: txPage < (txData?.totalPages ?? 0) ? 'pointer' : 'default', color: txPage < (txData?.totalPages ?? 0) ? '#033280' : '#ccc', fontSize: 12, fontFamily: 'inherit' }}>Next</button>
                </div>
              </div>
            )}
          </>
        )}
      </div>

      {/* ─── AUTO-RELOAD SETTINGS ─── */}
      <div className="card" style={{ padding: 20 }}>
        <h3 style={{ fontSize: 15, fontWeight: 700, margin: '0 0 12px', color: 'var(--text, #111)' }}>{t('wallet.autoReload')} & Alerts</h3>

        <div style={{ marginBottom: 14 }}>
          <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text, #333)' }}>
            Low balance alert threshold
          </label>
          <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 6 }}>
            <span style={{ color: '#888', fontSize: 13 }}>Notify me when balance falls below $</span>
            <input
              type="number"
              value={threshold}
              onChange={e => setThreshold(e.target.value)}
              style={{ width: 90, padding: '5px 8px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 6, fontSize: 13, outline: 'none' }}
            />
          </div>
        </div>

        <div style={{ marginBottom: 14 }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: 10, cursor: 'pointer', fontSize: 13, fontWeight: 500, color: 'var(--text, #333)' }}>
            <input
              type="checkbox"
              checked={autoReloadEnabled}
              onChange={e => setAutoReloadEnabled(e.target.checked)}
              style={{ width: 16, height: 16, cursor: 'pointer' }}
            />
            Enable {t('wallet.autoReload')}
          </label>
        </div>

        {autoReloadEnabled && (
          <div style={{ marginBottom: 14, paddingLeft: 26 }}>
            <label style={{ fontSize: 12, color: '#888', display: 'block', marginBottom: 4 }}>Reload amount ($)</label>
            <input
              type="number"
              min="100"
              value={autoReloadAmount}
              onChange={e => setAutoReloadAmount(e.target.value)}
              placeholder="e.g. 2000"
              style={{ width: 140, padding: '6px 10px', border: '1px solid var(--border, #e0e0e0)', borderRadius: 6, fontSize: 13, outline: 'none' }}
            />
            <div style={{ fontSize: 11, color: '#aaa', marginTop: 3 }}>
              Wallet will auto-reload this amount when balance falls below ${threshold}
            </div>
          </div>
        )}

        <button
          onClick={handleSaveSettings}
          disabled={settingsSaving}
          style={{ padding: '8px 18px', background: settingsSaving ? '#e5e7eb' : '#033280', color: settingsSaving ? '#9ca3af' : '#fff', border: 'none', borderRadius: 8, fontSize: 13, fontWeight: 600, cursor: settingsSaving ? 'default' : 'pointer', fontFamily: 'inherit' }}
        >
          {settingsSaving ? 'Saving…' : t('wallet.saveSettings')}
        </button>
      </div>
    </div>
  );
}
