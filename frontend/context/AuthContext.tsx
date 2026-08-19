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
  googleLogin: (payload: { email: string; name?: string; googleId?: string; avatar?: string }) => Promise<any>;
  updateProfile: (data: Record<string, any>) => Promise<void>;
  logout: () => Promise<void>;
  refreshUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);

  const refreshUser = async () => {
    try {
      const data = await getMe();
      setUser(data.user);
    } catch {
      setUser(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    setUser(data.user);
  };

  const signup = async (username: string, email: string, password: string) => {
    await signupRequest(username, email, password);
  };

  const googleLogin = async (payload: { email: string; name?: string; googleId?: string; avatar?: string }) => {
    const data = await googleLoginRequest(payload);
    setUser(data.user);
    return data.user;
  };

  const updateProfile = async (data: Record<string, any>) => {
    const res = await updateProfileRequest(data);
    if (res.user) {
      setUser(res.user);
    }
  };

  const logout = async () => {
    await logoutRequest();
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