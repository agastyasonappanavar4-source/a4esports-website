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
    // Global fetch interceptor to attach Authorization header if token exists in localStorage
    if (typeof window !== "undefined") {
      const originalFetch = window.fetch;
      const apiUrl = process.env.NEXT_PUBLIC_API_URL || "";

      // @ts-ignore
      if (!window.fetch.__intercepted) {
        const customFetch = async function (input: RequestInfo | URL, init?: RequestInit) {
          let url = "";
          if (typeof input === "string") {
            url = input;
          } else if (input instanceof URL) {
            url = input.toString();
          } else {
            url = input.url;
          }

          const token = localStorage.getItem("token");
          if (token && (url.startsWith(apiUrl) || url.startsWith("/api") || !url.startsWith("http"))) {
            init = init || {};
            init.headers = init.headers || {};
            if (init.headers instanceof Headers) {
              if (!init.headers.has("Authorization")) {
                init.headers.set("Authorization", `Bearer ${token}`);
              }
            } else if (Array.isArray(init.headers)) {
              if (!init.headers.some(([key]) => key.toLowerCase() === "authorization")) {
                init.headers.push(["Authorization", `Bearer ${token}`]);
              }
            } else {
              if (!init.headers["Authorization"] && !init.headers["authorization"]) {
                // @ts-ignore
                init.headers["Authorization"] = `Bearer ${token}`;
              }
            }
          }
          return originalFetch(input, init);
        };

        // @ts-ignore
        customFetch.__intercepted = true;
        window.fetch = customFetch;
      }
    }

    refreshUser();
  }, []);

  const login = async (email: string, password: string) => {
    const data = await loginRequest(email, password);
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
    setUser(data.user);
  };

  const signup = async (username: string, email: string, password: string) => {
    await signupRequest(username, email, password);
  };

  const googleLogin = async (payload: { email: string; name?: string; googleId?: string; avatar?: string }) => {
    const data = await googleLoginRequest(payload);
    if (data.token) {
      localStorage.setItem("token", data.token);
    }
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