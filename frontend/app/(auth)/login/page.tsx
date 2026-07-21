"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuth();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async () => {
    if (!email || !password) {
      setError("Please fill all fields.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await login(email, password);
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      router.push(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to login.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background bg-tactical-grid px-5 py-10">
      <div className="w-full max-w-md border border-border bg-panel">
        <div className="border-b border-border bg-void p-8 text-center">
          <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center bg-ember font-display text-2xl font-bold text-void [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))]">
            FF
          </div>
          <h1 className="font-display text-3xl font-bold uppercase text-foreground">
            Welcome Back
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Login to continue your scrim journey.
          </p>
        </div>

        <div className="p-8">
          <button
            onClick={() => router.back()}
            className="mb-8 flex items-center gap-2 font-mono text-sm text-muted-foreground transition hover:text-cyan"
          >
            <ArrowLeft size={16} />
            Back
          </button>

          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Email
          </label>
          <div className="mb-5 flex items-center border border-border bg-void px-4 transition focus-within:border-cyan">
            <Mail size={18} className="text-muted-foreground" />
            <input
              type="email"
              placeholder="Enter your email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full bg-transparent px-4 py-4 font-mono text-foreground outline-none"
            />
          </div>

          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Password
          </label>
          <div className="flex items-center border border-border bg-void px-4 transition focus-within:border-cyan">
            <Lock size={18} className="text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-transparent px-4 py-4 font-mono text-foreground outline-none"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-cyan"
            >
              {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
            </button>
          </div>

          {error && (
            <p className="mt-4 border border-destructive/40 bg-destructive/10 p-3 font-mono text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            onClick={handleLogin}
            disabled={loading}
            className="mt-8 w-full bg-ember py-4 font-display text-lg font-bold uppercase text-void transition hover:bg-[var(--ember-deep)] disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Login"}
          </button>

          <div className="my-8 flex items-center">
            <div className="h-px flex-1 bg-border" />
            <span className="mx-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div className="border border-cyan/30 bg-cyan/5 p-5 text-center">
            <h3 className="font-display text-lg font-bold uppercase text-foreground">
              New to FF Scrims?
            </h3>
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Create an account to register for tournaments and track your matches.
            </p>
            <Link href="/register">
              <button className="mt-5 w-full border border-cyan py-3 font-display font-bold uppercase text-cyan transition hover:bg-cyan hover:text-void">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}