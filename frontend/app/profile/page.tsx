"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { User, Mail, Trophy, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getMyRegistrations, type MyRegistration } from "@/services/registrations";

export default function ProfilePage() {
  const router = useRouter();
  const { user, loading, logout } = useAuth();
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?next=/profile");
    }
    if (user) {
      getMyRegistrations().then(setRegistrations).catch(() => setRegistrations([]));
    }
  }, [loading, user, router]);

  if (!user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">Loading...</p>
      </main>
    );
  }

  const paidCount = registrations.filter(
    (r) => r.paymentStatus === "PAID" || r.scrim.fee === 0
  ).length;

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <div className="border border-border bg-panel p-8">
          <div className="flex items-center gap-5">
            <div className="flex h-20 w-20 items-center justify-center bg-ember font-display text-3xl font-bold text-void [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]">
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div>
              <h1 className="font-display text-3xl font-bold uppercase text-foreground">
                {user.username}
              </h1>
              <p className="mt-1 font-mono text-sm text-muted-foreground">{user.email}</p>
            </div>
          </div>
        </div>

        <div className="mt-6 grid gap-4 md:grid-cols-3">
          <div className="border border-border bg-panel p-6 text-center">
            <Trophy className="mx-auto mb-2 h-6 w-6 text-amber" />
            <p className="font-mono text-2xl font-semibold text-foreground">{registrations.length}</p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Tournaments Joined
            </p>
          </div>
          <div className="border border-border bg-panel p-6 text-center">
            <User className="mx-auto mb-2 h-6 w-6 text-cyan" />
            <p className="font-mono text-2xl font-semibold text-foreground">{paidCount}</p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Confirmed Slots
            </p>
          </div>
          <div className="border border-border bg-panel p-6 text-center">
            <Mail className="mx-auto mb-2 h-6 w-6 text-ember" />
            <p className="break-all font-mono text-sm font-semibold text-foreground">{user.email}</p>
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Contact Email
            </p>
          </div>
        </div>

        <div className="mt-6 border border-border bg-panel p-7">
          <h2 className="mb-5 font-display text-lg font-bold uppercase text-foreground">
            Account Details
          </h2>
          <div className="space-y-4 font-mono text-sm">
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Username</span>
              <span className="text-foreground">{user.username}</span>
            </div>
            <div className="flex justify-between border-b border-border pb-3">
              <span className="text-muted-foreground">Email</span>
              <span className="text-foreground">{user.email}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">User ID</span>
              <span className="text-foreground">#{user.id}</span>
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