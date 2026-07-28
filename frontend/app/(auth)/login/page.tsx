"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Eye, EyeOff, Lock, Mail, Home, ArrowLeft, KeyRound, Sparkles } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { forgotPasswordRequest, resetPasswordRequest } from "@/lib/auth";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { login, googleLogin } = useAuth();
  const { showToast } = useToast();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);

  // Forgot password states
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotEmail, setForgotEmail] = useState("");
  const [resetCode, setResetCode] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [step, setStep] = useState<"request" | "reset">("request");
  const [forgotLoading, setForgotLoading] = useState(false);

  useEffect(() => {
    const googleClientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
    if (window.google?.accounts?.id && googleClientId) {
      try {
        window.google.accounts.id.initialize({
          client_id: googleClientId,
          callback: handleGoogleCredentialResponse,
        });
        const container = document.getElementById("googleBtnContainer");
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
      // Decode JWT token payload
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

      showToast(`Welcome back, ${payload.name || "Gamer"}!`, "success");
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      router.push(next);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Google sign-in failed.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleSimulatedGoogleLogin = async () => {
    const userEmail = prompt("Enter your Gmail address to Sign in with Google:");
    if (!userEmail || !userEmail.includes("@")) return;
    setLoading(true);
    try {
      await googleLogin({
        email: userEmail,
        name: userEmail.split("@")[0],
      });
      showToast("Signed in with Google successfully!", "success");
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      router.push(next);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Google login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleLogin = async () => {
    if (!email || !password) {
      showToast("Please fill all fields.", "error");
      return;
    }

    setLoading(true);

    try {
      await login(email, password);
      showToast("Welcome back!", "success");
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      router.push(next);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Unable to login.", "error");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestReset = async () => {
    if (!forgotEmail) {
      showToast("Enter your email address.", "error");
      return;
    }
    setForgotLoading(true);
    try {
      const res = await forgotPasswordRequest(forgotEmail);
      showToast("Reset code generated! Proceed to enter new password.", "success");
      if (res.resetToken) {
        setResetCode(res.resetToken);
      }
      setStep("reset");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Request failed.", "error");
    } finally {
      setForgotLoading(false);
    }
  };

  const handleResetPassword = async () => {
    if (!newPassword) {
      showToast("Enter your new password.", "error");
      return;
    }
    setForgotLoading(true);
    try {
      await resetPasswordRequest(forgotEmail, newPassword, resetCode);
      showToast("Password reset successfully! Please login.", "success");
      setForgotOpen(false);
      setPassword("");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Reset failed.", "error");
    } finally {
      setForgotLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background bg-tactical-grid px-4 py-8">
      <div className="w-full max-w-md border border-border bg-panel shadow-2xl">
        <div className="border-b border-border bg-panel-2 p-6 sm:p-8 text-center relative">
          <img
            src="/logo.jpg"
            alt="A4esports Logo"
            className="mx-auto mb-3 h-14 w-14 rounded-lg border border-border/80 object-cover sm:h-16 sm:w-16"
          />
          <h1 className="font-display text-2xl sm:text-3xl font-bold uppercase text-foreground">
            Welcome Back
          </h1>
          <p className="mt-1 font-mono text-xs sm:text-sm text-muted-foreground">
            Login to continue your scrim journey.
          </p>
        </div>

        <div className="p-6 sm:p-8 space-y-5">
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

          {/* Google Login Section */}
          <div>
            <div id="googleBtnContainer" className="w-full min-h-[44px]"></div>
            <button
              onClick={handleSimulatedGoogleLogin}
              className="mt-2 flex w-full items-center justify-center gap-3 border border-border bg-panel-2 py-3 font-mono text-xs sm:text-sm text-foreground transition hover:border-cyan hover:bg-cyan/5"
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
              Sign in with Google
            </button>
          </div>

          <div className="flex items-center">
            <div className="h-px flex-1 bg-border" />
            <span className="mx-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Or Email Login
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <div>
            <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Email
            </label>
            <div className="flex items-center border border-border bg-panel-2 px-3 py-1 transition focus-within:border-cyan">
              <Mail size={18} className="text-muted-foreground shrink-0" />
              <input
                type="email"
                placeholder="Enter your email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-transparent px-3 py-3 font-mono text-sm text-foreground outline-none"
              />
            </div>
          </div>

          <div>
            <div className="mb-1.5 flex items-center justify-between">
              <label className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Password
              </label>
              <button
                type="button"
                onClick={() => setForgotOpen(true)}
                className="font-mono text-xs text-cyan hover:underline"
              >
                Forgot Password?
              </button>
            </div>
            <div className="flex items-center border border-border bg-panel-2 px-3 py-1 transition focus-within:border-cyan">
              <Lock size={18} className="text-muted-foreground shrink-0" />
              <input
                type={showPassword ? "text" : "password"}
                placeholder="Enter your password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
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

          <button
            onClick={handleLogin}
            disabled={loading}
            className="btn-press w-full bg-ember py-3.5 font-display text-base sm:text-lg font-bold uppercase text-void transition hover:bg-[var(--ember-deep)] disabled:opacity-50"
          >
            {loading ? "Logging In..." : "Login"}
          </button>

          <div className="border border-cyan/30 bg-cyan/5 p-4 text-center">
            <h3 className="font-display text-base font-bold uppercase text-foreground">
              New to A4esports?
            </h3>
            <p className="mt-1 font-mono text-xs text-muted-foreground">
              Create an account to register for tournaments and track matches.
            </p>
            <Link href="/register">
              <button className="btn-press mt-3 w-full border border-cyan py-2.5 font-display text-xs sm:text-sm font-bold uppercase text-cyan transition hover:bg-cyan hover:text-void">
                Create Account
              </button>
            </Link>
          </div>
        </div>
      </div>

      {/* FORGOT PASSWORD MODAL */}
      {forgotOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm border border-border bg-panel p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold uppercase text-foreground flex items-center gap-2">
                <KeyRound size={18} className="text-ember" /> Reset Password
              </h3>
              <button
                onClick={() => setForgotOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>

            {step === "request" ? (
              <>
                <p className="font-mono text-xs text-muted-foreground">
                  Enter your account email to receive a password reset code.
                </p>
                <input
                  type="email"
                  placeholder="Enter registered email"
                  value={forgotEmail}
                  onChange={(e) => setForgotEmail(e.target.value)}
                  className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                />
                <button
                  onClick={handleRequestReset}
                  disabled={forgotLoading}
                  className="btn-press w-full bg-ember py-3 font-display font-bold uppercase text-void"
                >
                  {forgotLoading ? "Processing..." : "Get Reset Code"}
                </button>
              </>
            ) : (
              <>
                <p className="font-mono text-xs text-muted-foreground">
                  Reset code sent! Enter your new password below.
                </p>
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
                    Reset Code
                  </label>
                  <input
                    type="text"
                    value={resetCode}
                    onChange={(e) => setResetCode(e.target.value)}
                    className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                  />
                </div>
                <div>
                  <label className="mb-1 block font-mono text-[10px] uppercase text-muted-foreground">
                    New Password
                  </label>
                  <input
                    type="password"
                    placeholder="Enter new password"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                  />
                </div>
                <button
                  onClick={handleResetPassword}
                  disabled={forgotLoading}
                  className="btn-press w-full bg-ember py-3 font-display font-bold uppercase text-void"
                >
                  {forgotLoading ? "Updating..." : "Update Password"}
                </button>
              </>
            )}
          </div>
        </div>
      )}
    </main>
  );
}
