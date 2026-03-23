import {
  createContext,
  useContext,
  useEffect,
  useState,
  useCallback,
  type ReactNode,
} from "react";
import type { PublicUser, UserRole } from "@shared/schema";
import {
  login as apiLogin,
  logout as apiLogout,
  register as apiRegister,
  refreshSession,
  type RegisterPayload,
} from "@/lib/auth-api";

// ─── Context shape ────────────────────────────────────────────────────────────

interface AuthContextValue {
  user: PublicUser | null;
  isLoading: boolean;
  isAuthenticated: boolean;
  login: (email: string, password: string, portal?: "dealer" | "operator" | "customer" | "bidder") => Promise<{ success: boolean; message?: string }>;
  register: (payload: RegisterPayload) => Promise<{ success: boolean; message?: string }>;
  logout: () => Promise<void>;
  hasRole: (...roles: UserRole[]) => boolean;
  isOperator: boolean;
  isDealerOwner: boolean;
}

const AuthContext = createContext<AuthContextValue | null>(null);

// ─── Provider ─────────────────────────────────────────────────────────────────

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<PublicUser | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // On mount, try to restore the session via the refresh cookie.
  // If no valid session exists the server returns 401 and we stay logged out.
  useEffect(() => {
    refreshSession()
      .then((res) => {
        if (res.success && res.user) {
          setUser(res.user);
        }
      })
      .catch(() => {
        // No active session — normal for unauthenticated visitors
      })
      .finally(() => setIsLoading(false));
  }, []);

  const login = useCallback(
    async (email: string, password: string, portal?: "dealer" | "operator" | "customer" | "bidder") => {
      const res = await apiLogin(email, password, portal);
      if (res.success && res.user) {
        setUser(res.user);
        return { success: true };
      }
      return { success: false, message: res.message ?? "Login failed" };
    },
    []
  );

  const register = useCallback(async (payload: RegisterPayload) => {
    const res = await apiRegister(payload);
    if (res.success && res.user) {
      setUser(res.user);
      return { success: true };
    }
    return { success: false, message: res.message ?? "Registration failed" };
  }, []);

  const logout = useCallback(async () => {
    await apiLogout();
    setUser(null);
  }, []);

  const hasRole = useCallback(
    (...roles: UserRole[]) => {
      if (!user) return false;
      return roles.includes(user.role);
    },
    [user]
  );

  const value: AuthContextValue = {
    user,
    isLoading,
    isAuthenticated: user !== null,
    login,
    register,
    logout,
    hasRole,
    isOperator: user?.role === "operator_admin" || user?.role === "operator_staff",
    isDealerOwner: user?.role === "dealer_owner",
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ─── Hook ─────────────────────────────────────────────────────────────────────

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) {
    throw new Error("useAuth must be used inside <AuthProvider>");
  }
  return ctx;
}
