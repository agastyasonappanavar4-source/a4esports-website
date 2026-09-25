"use client";

import { scrimModeLabel } from "@/lib/scrimMode";
import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Hourglass,
  ArrowRight,
  Shield,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getMyRegistrations, type MyRegistration } from "@/services/registrations";
import { slotTimeLabel } from "@/lib/slotTime";

export default function RegisteredBanner() {
  const { user } = useAuth();
  const [result, setResult] = useState<{ userId: number; registrations: MyRegistration[] } | null>(null);

  useEffect(() => {
    if (!user) return;

    getMyRegistrations()
      .then((regs) => {
        // Strict deduplication safeguard by scrimId + slotId
        // Canonical priority: PAID > PENDING with verification requested > earliest ID
        const deduplicatedMap = new Map<string, MyRegistration>();
        for (const reg of (regs || [])) {
          const key = `${reg.scrim.id}_${reg.slot.id}`;
          const existing = deduplicatedMap.get(key);
          if (!existing) {
            deduplicatedMap.set(key, reg);
          } else {
            const regPaid = reg.paymentStatus === "PAID";
            const existingPaid = existing.paymentStatus === "PAID";
            if (regPaid && !existingPaid) {
              deduplicatedMap.set(key, reg);
            } else if (
              regPaid === existingPaid &&
              reg.paymentVerificationRequestedAt &&
              !existing.paymentVerificationRequestedAt
            ) {
              deduplicatedMap.set(key, reg);
            }
          }
        }
        setResult({ userId: user.id, registrations: Array.from(deduplicatedMap.values()) });
      })
      .catch(() => setResult({ userId: user.id, registrations: [] }));
  }, [user]);

  const registrations = result && user && result.userId === user.id ? result.registrations : [];
  // Only visible when user is authenticated AND has registrations
  if (!user || registrations.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-3 sm:px-6 pt-5 pb-3">
      {/* Header bar */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-amber animate-pulse" />
          <span className="font-mono text-xs uppercase tracking-[0.18em] text-amber font-bold">
            My Registered Scrims ({registrations.length})
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground hidden sm:inline">
          Swipe to view all slots
        </span>
      </div>

      {/* Mobile-First Horizontal Scroll Container / Grid on Desktop */}
      <div className="flex gap-3.5 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
        {registrations.map((reg) => {
          const isFree = reg.scrim.fee === 0;
          const isPending = !isFree && reg.paymentStatus === "PENDING";
          const isRejected = reg.paymentStatus === "FAILED";
          const needsAttention = isPending || isRejected;
          const reviewRequested = Boolean(reg.paymentVerificationRequestedAt);
          const timing = slotTimeLabel(reg.slot);
          const formattedDate = new Date(reg.scrim.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          });

          // Clean status determination:
          // PAID: "PAYMENT CONFIRMED"
          // PENDING: "PAYMENT BEING VERIFIED"
          // FREE: "REGISTRATION CONFIRMED" (no payment status shown for free scrims)
          const statusText = isFree
            ? "REGISTRATION CONFIRMED"
            : isRejected
            ? "PAYMENT REVIEW REJECTED"
            : isPending
            ? reviewRequested ? "PAYMENT BEING VERIFIED" : "PAYMENT NOT SUBMITTED"
            : "PAYMENT CONFIRMED";

          return (
            <div
              key={reg.id}
              className={`w-[86vw] max-w-[340px] sm:w-auto shrink-0 snap-start flex flex-col justify-between rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
                needsAttention
                  ? "border-amber/50 bg-gradient-to-b from-[#1a1712] to-[#12151b] hover:border-amber/80 shadow-[0_4px_24px_rgba(255,194,75,0.09)]"
                  : "border-cyan/50 bg-gradient-to-b from-[#0f1d24] to-[#12151b] hover:border-cyan/80 shadow-[0_4px_24px_rgba(47,230,214,0.09)]"
              }`}
            >
              <div>
                {/* Status Badge + Mode Tag */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
                      needsAttention
                        ? "border border-amber/60 bg-amber/15 text-amber animate-pulse"
                        : "border border-cyan/60 bg-cyan/15 text-cyan"
                    }`}
                  >
                    {needsAttention ? (
                      <Hourglass size={11} className="shrink-0" />
                    ) : (
                      <CheckCircle2 size={11} className="shrink-0" />
                    )}
                    <span className="truncate">{statusText}</span>
                  </span>

                  <span className="font-mono text-[10px] uppercase tracking-wider text-muted-foreground border border-border/60 rounded px-1.5 py-0.5 shrink-0">
                    {scrimModeLabel(reg.scrim.mode)}
                  </span>
                </div>

                {/* Tournament Title */}
                <h3 className="mt-3 truncate font-display text-base sm:text-lg font-bold uppercase tracking-wide text-foreground">
                  {reg.scrim.title}
                </h3>

                {/* Tactical Meta Grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono text-muted-foreground bg-panel/60 rounded-lg p-2.5 border border-border/40">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar size={13} className="text-ember shrink-0" />
                    <span className="truncate text-foreground/90">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock size={13} className="text-ember shrink-0" />
                    <span className="truncate text-ember font-semibold">{timing}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Users size={13} className="text-cyan shrink-0" />
                    <span className="truncate font-semibold text-foreground">{reg.teamName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Shield size={13} className="text-amber shrink-0" />
                    <span className="truncate font-semibold text-amber">
                      Slot #{reg.slotNumber > 0 ? reg.slotNumber : (isFree ? "1" : "Pending")}
                    </span>
                  </div>
                </div>

                {/* Registration Code */}
                <div className="mt-2.5 flex items-center justify-between font-mono text-[10px] text-muted-foreground px-0.5">
                  <span className="text-[9px] uppercase tracking-widest text-muted-foreground/80">
                    REG ID:
                  </span>
                  <span className="truncate font-mono text-muted-foreground/90 font-medium">
                    {reg.registrationCode}
                  </span>
                </div>
              </div>

              {/* Action Button: VIEW MORE */}
              <div className="mt-4 pt-1">
                <Link
                  href={isRejected ? `/scrims/${reg.scrim.id}/register?slot=${reg.slot.id}` : isPending && !reviewRequested ? `/payment/${reg.id}` : `/my-match/${reg.id}`}
                  className={`btn-press flex h-10 w-full items-center justify-center gap-2 rounded-lg font-display text-xs font-bold uppercase tracking-wider transition ${
                    needsAttention
                      ? "border border-amber/50 bg-amber/15 text-amber hover:bg-amber hover:text-void shadow-[0_0_12px_rgba(255,194,75,0.15)]"
                      : "border border-cyan/50 bg-cyan/15 text-cyan hover:bg-cyan hover:text-void shadow-[0_0_12px_rgba(47,230,214,0.15)]"
                  }`}
                >
                  {isRejected ? "Try Registration Again" : isPending && !reviewRequested ? "Continue Payment" : "View More"}
                  <ArrowRight size={14} />
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </section>
  );
}
