"use client";

import { useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";

export default function RegisterPage() {
  const router = useRouter();
  const { signup } = useAuth();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      setError("Please fill all fields.");
      return;
    }
    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setError("");
    setLoading(true);

    try {
      await signup(username, email, password);
      router.push("/login");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
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
            Create Account
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            Join India&apos;s competitive Free Fire platform.
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
            Username
          </label>
          <div className="mb-5 flex items-center border border-border bg-void px-4 transition focus-within:border-cyan">
            <User size={18} className="text-muted-foreground" />
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              placeholder="Choose a username"
              className="w-full bg-transparent px-4 py-4 font-mono text-foreground outline-none"
            />
          </div>

          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Email
          </label>
          <div className="mb-5 flex items-center border border-border bg-void px-4 transition focus-within:border-cyan">
            <Mail size={18} className="text-muted-foreground" />
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Enter your email"
              className="w-full bg-transparent px-4 py-4 font-mono text-foreground outline-none"
            />
          </div>

          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Password
          </label>
          <div className="mb-5 flex items-center border border-border bg-void px-4 transition focus-within:border-cyan">
            <Lock size={18} className="text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Create a password"
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

          <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
            Confirm Password
          </label>
          <div className="flex items-center border border-border bg-void px-4 transition focus-within:border-cyan">
            <Lock size={18} className="text-muted-foreground" />
            <input
              type={showPassword ? "text" : "password"}
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Confirm your password"
              className="w-full bg-transparent px-4 py-4 font-mono text-foreground outline-none"
            />
          </div>

          {error && (
            <p className="mt-4 border border-destructive/40 bg-destructive/10 p-3 font-mono text-sm text-destructive">
              {error}
            </p>
          )}

          <button
            onClick={handleRegister}
            disabled={loading}
            className="mt-8 w-full bg-ember py-4 font-display text-lg font-bold uppercase text-void transition hover:bg-[var(--ember-deep)] disabled:opacity-50"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="mt-8 text-center font-mono text-sm text-muted-foreground">
            Already have an account?{" "}
            <Link href="/login" className="font-semibold text-cyan hover:underline">
              Login
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}