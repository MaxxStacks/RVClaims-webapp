// shared/constants.ts — Role permissions, sequence generators, platform defaults

export type UserRole = "operator_admin" | "operator_staff" | "dealer_owner" | "dealer_staff" | "customer" | "bidder";

export const OPERATOR_ROLES: UserRole[] = ["operator_admin", "operator_staff"];
export const DEALER_ROLES: UserRole[] = ["dealer_owner", "dealer_staff"];
export const ALL_ROLES: UserRole[] = ["operator_admin", "operator_staff", "dealer_owner", "dealer_staff", "customer", "bidder"];

// Permission matrix — what each role can access
export const PERMISSIONS: Record<UserRole, {
  canAccessOperatorPortal: boolean;
  canAccessDealerPortal: boolean;
  canAccessCustomerPortal: boolean;
  canAccessBidderPortal: boolean;
  canManageBilling: boolean;
  canManageStaff: boolean;
  canManagePlatformSettings: boolean;
  canViewAllDealers: boolean;
  canProcessClaims: boolean;
  canManageFrcCodes: boolean;
  canCreateInvoices: boolean;
  canViewFinancials: boolean;
}> = {
  operator_admin: {
    canAccessOperatorPortal: true,
    canAccessDealerPortal: false,
    canAccessCustomerPortal: false,
    canAccessBidderPortal: false,
    canManageBilling: true,
    canManageStaff: true,
    canManagePlatformSettings: true,
    canViewAllDealers: true,
    canProcessClaims: true,
    canManageFrcCodes: true,
    canCreateInvoices: true,
    canViewFinancials: true,
  },
  operator_staff: {
    canAccessOperatorPortal: true,
    canAccessDealerPortal: false,
    canAccessCustomerPortal: false,
    canAccessBidderPortal: false,
    canManageBilling: false,
    canManageStaff: false,
    canManagePlatformSettings: false,
    canViewAllDealers: true,
    canProcessClaims: true,
    canManageFrcCodes: true,
    canCreateInvoices: false,
    canViewFinancials: false,
  },
  dealer_owner: {
    canAccessOperatorPortal: false,
    canAccessDealerPortal: true,
    canAccessCustomerPortal: false,
    canAccessBidderPortal: false,
    canManageBilling: true,
    canManageStaff: true,
    canManagePlatformSettings: false,
    canViewAllDealers: false,
    canProcessClaims: false,
    canManageFrcCodes: false,
    canCreateInvoices: false,
    canViewFinancials: true,
  },
  dealer_staff: {
    canAccessOperatorPortal: false,
    canAccessDealerPortal: true,
    canAccessCustomerPortal: false,
    canAccessBidderPortal: false,
    canManageBilling: false,
    canManageStaff: false,
    canManagePlatformSettings: false,
    canViewAllDealers: false,
    canProcessClaims: false,
    canManageFrcCodes: false,
    canCreateInvoices: false,
    canViewFinancials: false,
  },
  customer: {
    canAccessOperatorPortal: false,
    canAccessDealerPortal: false,
    canAccessCustomerPortal: true,
    canAccessBidderPortal: false,
    canManageBilling: false,
    canManageStaff: false,
    canManagePlatformSettings: false,
    canViewAllDealers: false,
    canProcessClaims: false,
    canManageFrcCodes: false,
    canCreateInvoices: false,
    canViewFinancials: false,
  },
  bidder: {
    canAccessOperatorPortal: false,
    canAccessDealerPortal: false,
    canAccessCustomerPortal: false,
    canAccessBidderPortal: true,
    canManageBilling: false,
    canManageStaff: false,
    canManagePlatformSettings: false,
    canViewAllDealers: false,
    canProcessClaims: false,
    canManageFrcCodes: false,
    canCreateInvoices: false,
    canViewFinancials: false,
  },
};

// Sequence number generators
export function generateClaimNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `CLM-${year}-${seq}`;
}

export function generateBatchNumber(): string {
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `BATCH-${seq}`;
}

export function generateInvoiceNumber(): string {
  const year = new Date().getFullYear();
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `INV-${year}-${seq}`;
}

export function generateTicketNumber(): string {
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `TKT-${seq}`;
}

export function generateRequestNumber(): string {
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `FIN-${seq}`;
}

export function generateDealNumber(): string {
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `FI-${seq}`;
}

export function generatePlanNumber(): string {
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `WP-${seq}`;
}

export function generateOrderNumber(): string {
  const seq = String(Math.floor(Math.random() * 9999) + 1).padStart(4, "0");
  return `PO-${seq}`;
}

// Platform defaults
export const PLATFORM_DEFAULTS = {
  claimFeePercent: "10.00",
  claimFeeMin: "75.00",
  claimFeeMax: "500.00",
  dafFee: "125.00",
  pdiFee: "95.00",
  defaultTaxRate: "0.13",  // HST 13%
  inviteExpiryHours: 72,
  passwordResetExpiryMinutes: 60,
  jwtAccessExpiryMinutes: 15,
  jwtRefreshExpiryDays: 7,
};

// JWT token types
export const TOKEN_TYPES = {
  ACCESS: "access",
  REFRESH: "refresh",
  INVITE: "invite",
  PASSWORD_RESET: "password_reset",
} as const;
