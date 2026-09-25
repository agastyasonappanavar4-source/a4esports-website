"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Bell, Trophy, KeyRound, ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getMyRegistrations, type MyRegistration } from "@/services/registrations";
import { combineDateWithSlot, slotTimeLabel } from "@/lib/slotTime";
import { getCountdown } from "@/lib/countdown";
import Navbar from "@/components/layout/Navbar";

export default function NotificationsPage() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const updateClock = () => setNow(Date.now());
    const interval = setInterval(updateClock, 60000);
    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!loading && !user) {
      router.push("/login?next=/notifications");
    }
    if (user) {
      getMyRegistrations().then(setRegistrations).catch(() => setRegistrations([]));
    }
  }, [loading, user, router]);

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <Navbar />
      <div className="mx-auto max-w-3xl px-6 py-12">
        <button
          onClick={() => router.push("/platform")}
          className="mb-8 flex items-center gap-2 border border-border bg-panel px-5 py-2.5 font-mono text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Home
        </button>

        <h1 className="font-display text-4xl font-bold uppercase text-foreground">
          Notifications
        </h1>

        {registrations.length === 0 ? (
          <div className="mt-10 border border-dashed border-border p-10 text-center">
            <Bell className="mx-auto mb-4 h-10 w-10 text-muted-foreground" />
            <p className="font-mono text-sm text-muted-foreground">
              No updates yet — register for a tournament to see match alerts here.
            </p>
          </div>
        ) : (
          <div className="mt-10 space-y-4">
            {registrations.map((reg) => {
              const target = combineDateWithSlot(reg.scrim.date, reg.slot.time);
              const isPast = target.getTime() < now;

              return (
                <div key={reg.id} className="border border-border bg-panel p-6">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 flex h-9 w-9 shrink-0 items-center justify-center border border-ember/40 bg-ember/10 text-ember">
                      <Trophy size={16} />
                    </div>
                    <div>
                      <h3 className="font-display font-bold uppercase text-foreground">
                        {reg.scrim.title}
                      </h3>
                      <p className="mt-1 font-mono text-sm text-muted-foreground">
                        {reg.paymentStatus === "PAID" ? "Payment confirmed" : reg.paymentStatus === "FAILED" ? "Payment review rejected" : reg.paymentVerificationRequestedAt ? "Payment being verified" : "Payment not submitted"} · {slotTimeLabel(reg.slot.time)} · {reg.slotNumber ? `#${reg.slotNumber}` : "Slot pending"} · Code {reg.registrationCode}
                      </p>
                      <p className="mt-1 font-mono text-xs text-muted-foreground">
                        {now && (isPast ? "Match has started or ended" : `Starts in ${getCountdown(target, now)}`)}
                      </p>
                    </div>
                  </div>

                  {reg.paymentStatus === "PAID" && reg.slot.roomReleased && (
                    <div className="mt-4 flex items-center gap-3 border-t border-border pt-4 font-mono text-sm text-cyan">
                      <KeyRound size={16} />
                      Room ID has been released for this match
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </main>
  );
}
