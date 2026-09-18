"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import {
  Calendar,
  Clock,
  Users,
  CheckCircle2,
  Hourglass,
  ArrowRight,
  Ticket,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getMyRegistrations, type MyRegistration } from "@/services/registrations";
import { slotTimeLabel } from "@/lib/slotTime";

export default function RegisteredBanner() {
  const { user } = useAuth();
  const [registrations, setRegistrations] = useState<MyRegistration[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) {
      setRegistrations([]);
      setLoading(false);
      return;
    }

    getMyRegistrations()
      .then((regs) => {
        setRegistrations(regs || []);
      })
      .catch(() => setRegistrations([]))
      .finally(() => setLoading(false));
  }, [user]);

  // Only visible when user is authenticated AND has registrations
  if (!user || loading || registrations.length === 0) {
    return null;
  }

  return (
    <section className="mx-auto w-full max-w-7xl px-4 sm:px-6 pt-6 pb-2">
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="h-2 w-2 rounded-full bg-ember animate-pulse-dot" />
          <span className="font-mono text-xs uppercase tracking-widest text-ember font-bold">
            My Registered Scrim{registrations.length > 1 ? `s (${registrations.length})` : ""}
          </span>
        </div>
        <span className="font-mono text-[11px] text-muted-foreground hidden sm:inline">
          Swipe or scroll to view all
        </span>
      </div>

      {/* Responsive Horizontal Scroll Container for Mobile / Grid on Desktop */}
      <div className="flex gap-4 overflow-x-auto pb-3 snap-x snap-mandatory scrollbar-hide sm:grid sm:grid-cols-2 lg:grid-cols-3 sm:overflow-visible">
        {registrations.map((reg) => {
          const isFree = reg.scrim.fee === 0;
          const isPending = !isFree && reg.paymentStatus === "PENDING";
          const timing = slotTimeLabel(reg.slot);
          const formattedDate = new Date(reg.scrim.date).toLocaleDateString("en-IN", {
            day: "numeric",
            month: "short",
          });

          return (
            <div
              key={reg.id}
              className={`min-w-[280px] max-w-[340px] sm:min-w-0 sm:max-w-none flex-shrink-0 snap-start flex flex-col justify-between rounded-xl border p-4 sm:p-5 transition-all duration-200 ${
                isPending
                  ? "border-amber/40 bg-amber/5 hover:border-amber/70"
                  : "border-cyan/40 bg-cyan/5 hover:border-cyan/70"
              }`}
            >
              <div>
                {/* Status Badge + Mode Header */}
                <div className="flex items-center justify-between gap-2">
                  <span
                    className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 font-mono text-[10px] font-bold tracking-wider uppercase ${
                      isPending
                        ? "border border-amber/50 bg-amber/15 text-amber animate-pulse"
                        : "border border-cyan/50 bg-cyan/15 text-cyan"
                    }`}
                  >
                    {isFree ? (
                      <>
                        <CheckCircle2 size={11} />
                        Registration: CONFIRMED
                      </>
                    ) : isPending ? (
                      <>
                        <Hourglass size={11} />
                        Payment Being Verified
                      </>
                    ) : (
                      <>
                        <CheckCircle2 size={11} />
                        Payment Confirmed
                      </>
                    )}
                  </span>

                  <span className="font-mono text-[11px] text-muted-foreground uppercase">
                    {reg.scrim.mode === "BR" ? "Battle Royale" : "Clash Squad"}
                  </span>
                </div>

                {/* Scrim Title */}
                <h3 className="mt-2.5 truncate font-display text-lg font-bold uppercase text-foreground">
                  {reg.scrim.title}
                </h3>

                {/* Details Grid */}
                <div className="mt-3 grid grid-cols-2 gap-2 text-xs font-mono text-muted-foreground">
                  <div className="flex items-center gap-1.5 truncate">
                    <Calendar size={13} className="text-ember shrink-0" />
                    <span className="truncate">{formattedDate}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Clock size={13} className="text-ember shrink-0" />
                    <span className="truncate">{timing}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Users size={13} className="text-cyan shrink-0" />
                    <span className="truncate font-medium text-foreground">{reg.teamName}</span>
                  </div>
                  <div className="flex items-center gap-1.5 truncate">
                    <Ticket size={13} className="text-amber shrink-0" />
                    <span>{reg.scrim.fee === 0 ? "Free Entry" : `₹${reg.scrim.fee}`}</span>
                  </div>
                </div>

                {/* Slot Number / Code */}
                <div className="mt-2.5 border-t border-border/40 pt-2 flex items-center justify-between font-mono text-[11px] text-muted-foreground">
                  <span>Slot #{reg.slotNumber > 0 ? reg.slotNumber : (isFree ? "1" : "Verifying")}</span>
                  <span className="truncate max-w-[140px] text-[10px]">{reg.registrationCode}</span>
                </div>
              </div>

              {/* VIEW MORE Button */}
              <div className="mt-4 pt-2">
                <Link
                  href={`/my-match/${reg.id}`}
                  className={`btn-press flex w-full items-center justify-center gap-2 rounded-lg py-2.5 font-display text-xs font-bold uppercase tracking-wide transition ${
                    isPending
                      ? "border border-amber/50 bg-amber/10 text-amber hover:bg-amber hover:text-void"
                      : "border border-cyan/50 bg-cyan/10 text-cyan hover:bg-cyan hover:text-void"
                  }`}
                >
                  View More
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