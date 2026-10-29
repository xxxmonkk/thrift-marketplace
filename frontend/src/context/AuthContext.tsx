import React, {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react';
import type { User } from '../types/api';
import { login as apiLogin, register as apiRegister } from '../api/auth';
import type { LoginCredentials, RegisterCredentials } from '../api/auth';
import {
  clearStoredToken,
  getStoredToken,
  setStoredToken,
} from '../api/client';

// ── Types ─────────────────────────────────────────────────
interface AuthState {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  isAuthenticated: boolean;
}

interface AuthContextValue extends AuthState {
  login: (credentials: LoginCredentials) => Promise<void>;
  register: (credentials: RegisterCredentials) => Promise<void>;
  logout: () => void;
  isRole: (role: string) => boolean;
}

const USER_KEY = 'salixir_user';

// ── Context ───────────────────────────────────────────────
const AuthContext = createContext<AuthContextValue | null>(null);

// ── Provider ──────────────────────────────────────────────
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(() => {
    try {
      const stored = localStorage.getItem(USER_KEY);
      return stored ? (JSON.parse(stored) as User) : null;
    } catch {
      return null;
    }
  });
  const [token, setToken] = useState<string | null>(getStoredToken);
  const [isLoading] = useState(false);

  // Sync token ↔ user — if one is missing, clear both
  useEffect(() => {
    if ((token && !user) || (!token && user)) {
      setToken(null);
      setUser(null);
      clearStoredToken();
      localStorage.removeItem(USER_KEY);
    }
  }, []);

  const saveSession = useCallback((newToken: string, newUser: User) => {
    setStoredToken(newToken);
    localStorage.setItem(USER_KEY, JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }, []);

  const login = useCallback(async (credentials: LoginCredentials) => {
    const res = await apiLogin(credentials);
    saveSession(res.token, res.user);
  }, [saveSession]);

  const register = useCallback(async (credentials: RegisterCredentials) => {
    const res = await apiRegister(credentials);
    saveSession(res.token, res.user);
  }, [saveSession]);

  const logout = useCallback(() => {
    clearStoredToken();
    localStorage.removeItem(USER_KEY);
    setToken(null);
    setUser(null);
  }, []);

  const isRole = useCallback(
    (role: string) => user?.role === role,
    [user]
  );

  const value = useMemo<AuthContextValue>(
    () => ({
      user,
      token,
      isLoading,
      isAuthenticated: !!token && !!user,
      login,
      register,
      logout,
      isRole,
    }),
    [user, token, isLoading, login, register, logout, isRole]
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// ── Hook ──────────────────────────────────────────────────
export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used within AuthProvider');
  return ctx;
}
