"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Home, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";

declare global {
  interface Window {
    google?: any;
  }
}

export default function LoginPage() {
  const router = useRouter();
  const { googleLogin, updateProfile } = useAuth();
  const { showToast } = useToast();

  const [loading, setLoading] = useState(false);

  // Username modal states
  const [usernameModalOpen, setUsernameModalOpen] = useState(false);
  const [chosenUsername, setChosenUsername] = useState("");
  const [usernameLoading, setUsernameLoading] = useState(false);

  const handleCredentialResponse = async (response: any) => {
    const token = response.credential;
    if (!token) return;

    setLoading(true);
    try {
      // Decode JWT token safely
      const base64Url = token.split(".")[1];
      const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
      const jsonPayload = decodeURIComponent(
        window.atob(base64)
          .split("")
          .map((c) => "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2))
          .join("")
      );
      const payload = JSON.parse(jsonPayload);

      const { email, name, sub: googleId, picture: avatar } = payload;

      const loggedUser = await googleLogin({
        email,
        name: name || email.split("@")[0],
        googleId,
        avatar,
      });

      showToast("Signed in with Google successfully!", "success");
      setChosenUsername(loggedUser.username || email.split("@")[0]);
      setUsernameModalOpen(true);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Google login failed", "error");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    let interval: NodeJS.Timeout;
    let currentWidth = 0;

    const renderButton = () => {
      const container = document.getElementById("googleSignInButton");
      if (container && window.google?.accounts?.id) {
        const containerWidth = container.offsetWidth;
        if (containerWidth === currentWidth) return;
        currentWidth = containerWidth;

        container.innerHTML = ""; // Clear existing button
        const btnWidth = Math.max(200, Math.min(400, containerWidth || 350));

        window.google.accounts.id.renderButton(container, {
          theme: "outline",
          size: "large",
          width: btnWidth,
          text: "signin_with",
          shape: "square",
        });
      }
    };

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || "",
          callback: handleCredentialResponse,
        });
        renderButton();
        clearInterval(interval);
      }
    };

    initGsi();
    interval = setInterval(initGsi, 100);

    const handleResize = () => {
      renderButton();
    };
    window.addEventListener("resize", handleResize);

    return () => {
      clearInterval(interval);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const handleSaveUsername = async () => {
    if (!chosenUsername.trim()) {
      showToast("Username cannot be empty.", "error");
      return;
    }
    setUsernameLoading(true);
    try {
      await updateProfile({ username: chosenUsername.trim() });
      showToast("Username updated successfully!", "success");
      setUsernameModalOpen(false);
      const next = new URLSearchParams(window.location.search).get("next") || "/";
      router.push(next);
      router.refresh();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update username", "error");
    } finally {
      setUsernameLoading(false);
    }
  };

  const handleSkipUsername = () => {
    setUsernameModalOpen(false);
    const next = new URLSearchParams(window.location.search).get("next") || "/";
    router.push(next);
    router.refresh();
  };

  return (
    <main className="flex min-h-screen items-center justify-center bg-background bg-tactical-grid px-4 py-8">
      <div className="w-full max-w-md border border-border bg-panel shadow-2xl">
        <div className="border-b border-border bg-panel-2 p-6 sm:p-8 text-center relative">
          <img
            src="/logo.jpg"
            alt="A4 ESPORTS Logo"
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
          <div className="flex flex-col items-center gap-2">
            <div className="w-full flex justify-center">
              <div id="googleSignInButton" className="w-full min-h-[44px] flex justify-center"></div>
            </div>
            {loading && (
              <p className="font-mono text-xs text-muted-foreground animate-pulse mt-1">
                Authenticating...
              </p>
            )}
          </div>

          <div className="flex items-center">
            <div className="h-px flex-1 bg-border" />
            <span className="mx-4 font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Or
            </span>
            <div className="h-px flex-1 bg-border" />
          </div>

          <button
            onClick={() => {
              showToast("Entering as Guest...", "info");
              router.push("/");
            }}
            className="btn-press w-full border border-border bg-panel-2 py-3.5 font-display text-base sm:text-lg font-bold uppercase text-foreground transition hover:border-cyan hover:text-cyan"
          >
            Continue as Guest
          </button>
        </div>
      </div>

      {/* USERNAME SELECTION POPUP MODAL */}
      {usernameModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-sm border border-border bg-panel p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold uppercase text-foreground">
                Set Username
              </h3>
              <button
                onClick={handleSkipUsername}
                className="text-muted-foreground hover:text-foreground"
              >
                ✕
              </button>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Please enter a username to display your identity inside the website.
            </p>
            <input
              type="text"
              placeholder="Username"
              value={chosenUsername}
              onChange={(e) => setChosenUsername(e.target.value)}
              className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
            />
            <div className="flex gap-3">
              <button
                onClick={handleSaveUsername}
                disabled={usernameLoading}
                className="btn-press flex-1 bg-ember py-3 font-display font-bold uppercase text-void"
              >
                {usernameLoading ? "Saving..." : "Save"}
              </button>
              <button
                onClick={handleSkipUsername}
                className="border border-border px-4 py-3 font-mono text-xs uppercase text-muted-foreground transition hover:border-cyan hover:text-cyan"
              >
                Skip
              </button>
            </div>
          </div>
        </div>
      )}
    </main>
  );
}
