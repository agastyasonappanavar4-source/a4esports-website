"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Sun, Moon, LogOut, Bell } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";
import Navbar from "@/components/layout/Navbar";

export default function SettingsPage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?next=/settings");
    }
  }, [loading, user, router]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <Navbar />
      <div className="mx-auto max-w-2xl px-6 py-12">
        <h1 className="font-display text-4xl font-bold uppercase text-foreground">
          Settings
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          Manage your appearance and account preferences.
        </p>

        <div className="mt-10 border border-border bg-panel p-7">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              {theme === "dark" ? (
                <Moon size={20} className="text-cyan" />
              ) : (
                <Sun size={20} className="text-amber" />
              )}
              <div>
                <p className="font-display font-semibold uppercase text-foreground">
                  Appearance
                </p>
                <p className="font-mono text-xs text-muted-foreground">
                  {theme === "dark" ? "Dark mode" : "Light mode"}
                </p>
              </div>
            </div>
            <button
              onClick={toggleTheme}
              className="border border-border px-5 py-2 font-mono text-sm text-foreground transition hover:border-cyan hover:text-cyan"
            >
              Switch to {theme === "dark" ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        <div className="mt-6 border border-border bg-panel p-7">
          <div className="flex items-center gap-3">
            <Bell size={20} className="text-ember" />
            <div>
              <p className="font-display font-semibold uppercase text-foreground">
                Notifications
              </p>
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Match reminders are shown automatically on your Notifications page — no setup needed.
              </p>
            </div>
          </div>
        </div>

        <button
          onClick={logout}
          className="mt-6 flex w-full items-center justify-center gap-2 border border-destructive/40 bg-destructive/10 py-3.5 font-display font-bold uppercase text-destructive transition hover:bg-destructive/20"
        >
          <LogOut size={18} />
          Logout
        </button>
      </div>
    </main>
  );
}
