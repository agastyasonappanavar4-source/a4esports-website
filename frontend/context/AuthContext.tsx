"use client";

import {
  createContext,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react";
import {
  getMe,
  loginRequest,
  signupRequest,
  googleLoginRequest,
  updateProfileRequest,
  logoutRequest,
} from "@/lib/auth";

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  isAdmin: boolean;
  inGameName?: string | null;
  uid?: string | null;
  avatar?: string | null;
  phone?: string | null;
}

interface AuthContextValue {
  user: AuthUser | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<void>;
  signup: (username: string, email: string, password: string) => Promise<void>;
  googleLogin: (credential: string) => Promise<AuthUser | null>;
  updateProfile: (data: Record<string, unknown>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const formatUser = (u: AuthUser | null | undefined): AuthUser | null => {
    if (!u) return null;
    return {
      ...u,
      isAdmin: Boolean(u.isAdmin),
    };
  };

  const refreshUser = async () => {
    try {
      const data = await getMe();
      setUser(formatUser(data.user));
    } catch (err: unknown) {
      setUser(null);
      if (err instanceof Error && "status" in err && err.status === 401) {
        localStorage.removeItem("token");
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Service requests add their own Authorization header. Do not intercept
    // global fetch, which could send a token to an unrelated origin.
    // The first account lookup resolves asynchronously and hydrates auth state.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    const formatted = formatUser(data.user);
    setUser(formatted);
  };

  const signup = async (username: string, email: string, password: string) => {
    await signupRequest(username, email, password);
  };

  const googleLogin = async (credential: string) => {
    const data = await googleLoginRequest(credential);
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    const formatted = formatUser(data.user);
    setUser(formatted);
    return formatted;
  };

  const updateProfile = async (data: Record<string, unknown>) => {
    const res = await updateProfileRequest(data);
    if (res.user) {
      setUser(formatUser(res.user));
    }
  };

  const logout = async () => {
    try {
      await logoutRequest();
    } catch (e) {
      console.error("Logout request failed", e);
    }
    localStorage.removeItem("token");
    setUser(null);
  };

  return (
    <AuthContext.Provider
      value={{ user, loading, login, signup, googleLogin, updateProfile, logout, refreshUser }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used inside AuthProvider");
  return ctx;
}
