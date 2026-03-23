/**
 * useCurrentUser — Role helper hook.
 * Returns the current user plus boolean role flags for easy conditional rendering.
 */

import { useAuth } from "./use-auth";

export function useCurrentUser() {
  const { user, isAuthenticated, isLoading } = useAuth();

  return {
    user,
    isAuthenticated,
    isLoading,
    isOperatorAdmin: user?.role === "operator_admin",
    isOperatorStaff: user?.role === "operator_staff",
    isOperator: user?.role === "operator_admin" || user?.role === "operator_staff",
    isDealerOwner: user?.role === "dealer_owner",
    isDealerStaff: user?.role === "dealer_staff",
    isDealer: user?.role === "dealer_owner" || user?.role === "dealer_staff",
    isClient: user?.role === "client",
    isBidder: user?.role === "bidder",
    dealershipId: (user as any)?.dealershipId ?? null,
  };
}
