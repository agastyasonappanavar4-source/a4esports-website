"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowLeft, Eye, EyeOff, Lock, Mail, User, Home } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";

declare global {
  interface Window {
    google?: any;
  }
}

export default function RegisterPage() {
  const router = useRouter();
  const { signup, googleLogin } = useAuth();
  const { showToast } = useToast();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        const container = document.getElementById("googleRegisterContainer");
        if (container) {
          window.google.accounts.id.renderButton(container, {
            theme: "outline",
            size: "large",
            width: "100%",
          });
        }
      } catch (err) {
        console.error("Google button init error:", err);
      }
    }
  }, []);

  const handleGoogleCredentialResponse = async (response: any) => {
    try {
      setLoading(true);
      const base64Url = response.credential.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);

      await googleLogin({
        email: payload.email,
        name: payload.name,
        googleId: payload.sub,
        avatar: payload.picture,
      });

      showToast(`Welcome, ${payload.name || "Gamer"}! Account ready.`, "success");
      router.push("/");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Google sign-up failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedGoogleLogin = async () => {
    const userEmail = prompt("Enter your Gmail address to Sign up with Google:");
    if (!userEmail || !userEmail.includes("@")) return;
    setLoading(true);
    try {
      await googleLogin({
        email: userEmail,
        name: userEmail.split("@")[0],
      });
      showToast("Registered & logged in with Google!", "success");
      router.push("/");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Google sign-up failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!username || !email || !password || !confirmPassword) {
      showToast("Please fill all fields.", "error");
      return;
    }
    if (password !== confirmPassword) {
      showToast("Passwords do not match.", "error");
      return;
    }

    setLoading(true);

    try {
      await signup(username, email, password);
      showToast("Account created! Please login.", "success");
      router.push("/login");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background bg-tactical-grid px-4 py-8">
      <div className="w-full max-w-md border border-border bg-panel shadow-2xl">
        <div className="border-b border-border bg-panel-2 p-6 sm:p-8 text-center">
          <img
            src="/logo.jpg"
            alt="A4esports Logo"
            className="mx-auto mb-3 h-14 w-14 rounded-lg border border-border/80 object-cover sm:h-16 sm:w-16"
          />
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-foreground">
            Create Account
          </h1>
          <p className="mt-1 font-mono text-xs sm:text-sm text-muted-foreground">
            Join India&apos;s competitive Free Fire platform.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-4">
          <div className="flex items-center justify-between border-b border-border pb-4">
            <button
              onClick={() => router.back()}
              className="flex items-center gap-1.5 font-mono text-xs sm:text-sm text-muted-foreground transition hover:text-cyan"
            >
              <ArrowLeft size={16} />
              Back
            </button>

            <Link
              href="/"
              className="flex items-center gap-1.5 font-mono text-xs sm:text-sm text-cyan transition hover:underline"
            >
              <Home size={16} />
              Go Home
            </Link>
          </div>

          {/* Google Sign-up Button */}
          <div>
            <div id="googleRegisterContainer" className="w-full min-h-[44px]"></div>
            <button
              onClick={handleSimulatedGoogleLogin}
              className="mt-1 flex w-full items-center justify-center gap-3 border border-border bg-panel-2 py-3 font-mono text-xs sm:text-sm text-foreground transition hover:border-cyan hover:bg-cyan/5"
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24">
                <path
                  fill="#4285F4"
                  d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"
                />
                <path
                  fill="#34A853"
                  d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.24v3.15C3.26 21.37 7.37 24 12 24z"
                />
                <path
                  fill="#FBBC05"
                  d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.24C.45 8.16 0 9.99 0 12s.45 3.84 1.24 5.42l4.04-3.15z"
                />
                <path
                  fill="#EA4335"
                  d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.37 0 3.26 2.63 1.24 6.58l4.04 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
                />
              </svg>
              Sign up with Google
            </button>
          </div>

          <div className="flex items-center my-2">
            <div className="h-px flex-1 bg-border" />
            <span className="mx-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Or Manual Registration
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Username
            </label>
            <div className="flex items-center border border-border bg-panel-2 px-3 transition focus-within:border-cyan">
              <User size={18} className="text-muted-foreground shrink-0" />
              <input
                type="text"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                placeholder="Choose a username"
                className="w-full bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <div className="flex items-center border border-border bg-panel-2 px-3 transition focus-within:border-cyan">
              <Mail size={18} className="text-muted-foreground shrink-0" />
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Enter your email"
                className="w-full bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none"
              />
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Password
            </label>
            <div className="flex items-center border border-border bg-panel-2 px-3 transition focus-within:border-cyan">
              <Lock size={18} className="text-muted-foreground shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Create a password"
                className="w-full bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-muted-foreground hover:text-cyan px-1"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Confirm Password
            </label>
            <div className="flex items-center border border-border bg-panel-2 px-3 transition focus-within:border-cyan">
              <Lock size={18} className="text-muted-foreground shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Confirm your password"
                className="w-full bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none"
              />
            </div>
          </div>

          <button
            onClick={handleRegister}
            disabled={loading}
            className="btn-press w-full bg-ember py-3.5 font-display text-base sm:text-lg font-bold uppercase text-void transition hover:bg-[var(--ember-deep)] disabled:opacity-50 mt-2"
          >
            {loading ? "Creating Account..." : "Create Account"}
          </button>

          <div className="pt-4 text-center font-mono text-xs sm:text-sm text-muted-foreground border-t border-border">
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
