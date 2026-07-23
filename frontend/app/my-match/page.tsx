"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, ArrowRight, Trophy } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getMyRegistrations, type MyRegistration } from "@/services/registrations";
import { Skeleton } from "@/components/ui/Skeleton";

export default function MyMatchesPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [registrations, setRegistrations] = useState<MyRegistration[] | null>(null);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login?next=/my-match");
      return;
    }
    if (user) {
      getMyRegistrations()
        .then(setRegistrations)
        .catch(() => setRegistrations([]));
    }
  }, [authLoading, user, router]);

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <div className="mx-auto max-w-5xl px-6 py-12">
        <button
          onClick={() => router.push("/")}
          className="mb-8 flex items-center gap-2 border border-border bg-panel px-5 py-2.5 font-mono text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Home
        </button>

        <h1 className="font-display text-4xl font-bold uppercase text-foreground">
          My Matches
        </h1>
        <p className="mt-2 font-mono text-sm text-muted-foreground">
          Every tournament you&apos;ve registered for.
        </p>

        {!registrations ? (
          <div className="mt-10 space-y-4">
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
            <Skeleton className="h-24 w-full" />
          </div>
        ) : registrations.length === 0 ? (
          <div className="mt-10 border border-dashed border-border p-10 text-center">
            <Trophy className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="font-mono text-sm text-muted-foreground">
              You haven&apos;t registered for any tournaments yet.
            </p>
            <Link
              href="/#scrims"
              className="mt-6 inline-block bg-ember px-6 py-3 font-display font-bold uppercase text-void transition hover:bg-[var(--ember-deep)]"
            >
              Browse Tournaments
            </Link>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {registrations.map((reg) => (
              <Link
                key={reg.id}
                href={`/my-match/${reg.id}`}
                className="flex items-center justify-between border border-border bg-panel p-6 transition hover:border-cyan/50"
              >
                <div>
                  <span className="font-mono text-xs uppercase tracking-widest text-cyan">
                    {reg.scrim.mode === "BR" ? "Battle Royale" : "Clash Squad"}
                  </span>
                  <h2 className="mt-1 font-display text-xl font-bold uppercase text-foreground">
                    {reg.scrim.title}
                  </h2>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    Code: {reg.registrationCode} · Slot {reg.slotNumber} ·{" "}
                    {reg.paymentStatus === "PAID" ? "Paid" : reg.scrim.fee === 0 ? "Free Entry" : "Payment Pending"}
                  </p>
                </div>
                <ArrowRight size={20} className="text-muted-foreground" />
              </Link>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}