// client/src/hooks/useWallet.ts — DS360 Wallet query hook

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { apiFetch } from "@/lib/api";

export interface WalletData {
  id: string;
  dealershipId: string;
  balance: string;
  totalFunded: string;
  totalBonusEarned: string;
  totalSpent: string;
  lowBalanceThreshold: string;
  autoReloadEnabled: boolean;
  autoReloadAmount: string | null;
  gracePeriodEnds: string | null;
  status: "active" | "grace_period" | "paused";
  createdAt: string;
  updatedAt: string;
}

export interface WalletResponse {
  wallet: WalletData;
  activeTier: {
    bonusPercentage: number;
    bonusAmount: number;
    tierId: string | null;
  };
}

export function useWallet() {
  const query = useQuery<WalletResponse>({
    queryKey: ["wallet", "my"],
    queryFn: () => apiFetch<WalletResponse>("/api/wallets/my"),
    staleTime: 2 * 60 * 1000,
    retry: 1,
  });

  const wallet = query.data?.wallet;
  const balance = wallet ? parseFloat(wallet.balance) : 0;
  const threshold = wallet ? parseFloat(wallet.lowBalanceThreshold) : 500;

  return {
    ...query,
    wallet,
    balance,
    isLowBalance: wallet ? balance < threshold && wallet.status === "active" : false,
    isGracePeriod: wallet?.status === "grace_period",
    isPaused: wallet?.status === "paused",
    gracePeriodEnds: wallet?.gracePeriodEnds ? new Date(wallet.gracePeriodEnds) : null,
  };
}

export function useInvalidateWallet() {
  const qc = useQueryClient();
  return () => qc.invalidateQueries({ queryKey: ["wallet", "my"] });
}
