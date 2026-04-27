import {
  createContext,
  useContext,
  type ReactNode,
} from "react";
import { useUser, useClerk } from "@clerk/clerk-react";
import type { UserRole } from "@shared/schema";

export interface RegisterPayload {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  dealershipName: string;
  dealershipEmail: string;
  dealershipPhone?: string;
}

interface AuthUser {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  phone: string | null;
  avatarUrl: string | null;
  role: UserRole;
  dealershipId: string | null;
  timezone: string | null;
  language: string | null;
  lastLoginAt: Date | null;
  createdAt: Date;
}

interface AuthContextValue {
  user: AuthUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  isDevMode: boolean;
  login: (email: string, password: string, portal?: string, rememberMe?: boolean) => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  isOperator: boolean;
  isDealerOwner: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

const DEALER_SUB_ROLES: UserRole[] = ["dealer_owner", "dealer_staff", "technician", "public_bidder", "consignor"];

export function AuthProvider({ children }: { children: ReactNode }) {
  const { user: clerkUser, isLoaded } = useUser();
  const { signOut } = useClerk();

  // Dev bypass: localStorage key ds360-dev-role overrides Clerk auth entirely
  const devRole = (typeof window !== "undefined"
    ? localStorage.getItem("ds360-dev-role")
    : null) as UserRole | null;

  const devUser: AuthUser | null = devRole
    ? {
        id: "dev-user-001",
        email: "dev@dealersuite360.com",
        firstName: "Dev",
        lastName: "User",
        phone: null,
        avatarUrl: null,
        role: devRole,
        dealershipId: DEALER_SUB_ROLES.includes(devRole) ? "dev-dealer-001" : null,
        timezone: null,
        language: null,
        lastLoginAt: null,
        createdAt: new Date(),
      }
    : null;

  const clerkDerivedUser: AuthUser | null = !devRole && clerkUser && isLoaded
    ? {
        id: clerkUser.id,
        email: clerkUser.primaryEmailAddress?.emailAddress ?? "",
        firstName: clerkUser.firstName ?? "",
        lastName: clerkUser.lastName ?? "",
        phone: null,
        avatarUrl: clerkUser.imageUrl ?? null,
        role: (((clerkUser.unsafeMetadata as any)?.devRoleOverride as UserRole) || (clerkUser.publicMetadata?.role as UserRole) || "client"),
        dealershipId: (clerkUser.publicMetadata?.dealershipId as string) ?? null,
        timezone: null,
        language: null,
        lastLoginAt: null,
        createdAt: new Date(clerkUser.createdAt ?? Date.now()),
      }
    : null;

  const user = devUser ?? clerkDerivedUser;

  const login = async (_email: string, _password: string, _portal?: string, _rememberMe?: boolean) => {
    window.location.href = "/login";
    return { success: true };
  };

  const register = async (_payload: RegisterPayload) => {
    window.location.href = "/signup";
    return { success: true };
  };

  const logout = async () => {
    if (devRole) {
      localStorage.removeItem("ds360-dev-role");
      window.location.href = "/dev-access";
      return;
    }
    await signOut();
    window.location.href = "/";
  };

  const hasRole = (...roles: UserRole[]): boolean => {
    if (!user) return false;
    return roles.includes(user.role);
  };

  const value: AuthContextValue = {
    user,
    isLoading: devRole ? false : !isLoaded,
    isAuthenticated: user !== null,
    isDevMode: !!devRole,
    login,
    register,
    logout,
    hasRole,
    isOperator: user?.role === "operator_admin" || user?.role === "operator_staff",
    isDealerOwner: user?.role === "dealer_owner",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
