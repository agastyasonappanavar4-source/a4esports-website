"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  ShieldCheck,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { getRegistrationDetails, type RegistrationDetails } from "@/services/registrations";
import { combineDateWithSlot, slotTimeLabel } from "@/lib/slotTime";
import { getCountdown } from "@/lib/countdown";
import { Skeleton } from "@/components/ui/Skeleton";
import Navbar from "@/components/layout/Navbar";

export default function MyMatchDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();

  const [details, setDetails] = useState<RegistrationDetails | null>(null);
  const [countdown, setCountdown] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    getRegistrationDetails(Number(id))
      .then(setDetails)
      .catch((err) => setError(err instanceof Error ? err.message : "Failed to load match."));
  }, [id]);

  useEffect(() => {
    if (!details) return;
    const target = combineDateWithSlot(details.scrim.date, details.slot.time);
    const update = () => setCountdown(getCountdown(target));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [details]);

  const copy = (text: string) => {
    navigator.clipboard.writeText(text).catch(() => {});
  };

  if (error) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5">
        <p className="font-mono text-sm text-destructive">{error}</p>
      </main>
    );
  }

  if (!details) {
    return (
      <main className="min-h-screen bg-background bg-tactical-grid">
        <div className="mx-auto max-w-7xl px-6 py-10">
          <Skeleton className="mb-6 h-10 w-36" />
          <Skeleton className="h-40 w-full" />
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-48 w-full" />
              <Skeleton className="h-40 w-full" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full" />
              <Skeleton className="h-48 w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  const { registration, scrim, slot, teams, totalTeams, remainingSlots, roomReleased } = details;

  const effectiveMaxTeams = slot.maxTeams ?? scrim.maxTeams;

  const formattedDate = new Date(scrim.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const rulesList = scrim.rules
    ? scrim.rules.split("\n").map((r) => r.trim()).filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <Navbar />
      <div className="mx-auto max-w-7xl px-6 py-10">
        <button
          onClick={() => router.push("/my-match")}
          className="mb-6 flex items-center gap-2 border border-border bg-panel px-5 py-2.5 font-mono text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          My Matches
        </button>

        <div className="border border-ember/40 bg-ember/10 p-8">
          <span className="border border-ember/40 bg-void/40 px-3 py-1 font-mono text-xs uppercase tracking-widest text-ember">
            Registered
          </span>
          <h1 className="mt-4 font-display text-4xl md:text-5xl font-bold uppercase text-foreground">
            {scrim.title}
          </h1>
          <p className="mt-2 font-mono text-sm text-muted-foreground">
            You&apos;re confirmed for this tournament.
          </p>
        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            <div className="border border-border bg-panel p-7">
              <h2 className="mb-6 font-display text-xl font-bold uppercase text-foreground">
                Match Information
              </h2>
              <div className="grid gap-5 font-mono text-sm text-muted-foreground md:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-ember" />
                  {formattedDate}
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-ember" />
                  {slotTimeLabel(slot.time)}
                </div>
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-cyan" />
                  {totalTeams} / {effectiveMaxTeams} Teams Registered
                </div>
                <div className="flex items-center gap-3">
                  <Trophy size={18} className="text-amber" />
                  {scrim.mode === "BR" ? "Battle Royale" : "Clash Squad"}
                </div>
              </div>
            </div>

            <div className="border border-border bg-panel p-7">
              <h2 className="mb-6 font-display text-xl font-bold uppercase text-foreground">
                Registered Teams ({totalTeams})
              </h2>
              <div className="grid gap-2 md:grid-cols-2">
                {teams.map((team) => (
                  <div
                    key={team.slotNumber}
                    className={`border p-3 font-mono text-sm ${
                      team.teamName === registration.teamName
                        ? "border-ember/50 bg-ember/10 text-foreground"
                        : "border-border text-muted-foreground"
                    }`}
                  >
                    #{team.slotNumber} {team.teamName}
                    {team.teamName === registration.teamName && " · YOU"}
                  </div>
                ))}
              </div>
            </div>

            {rulesList.length > 0 && (
              <div className="border border-border bg-panel p-7">
                <h2 className="mb-6 font-display text-xl font-bold uppercase text-foreground">
                  Tournament Rules
                </h2>
                <ul className="space-y-3 font-mono text-sm text-muted-foreground">
                  {rulesList.map((rule, i) => (
                    <li key={i} className="flex gap-3">
                      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-ember" />
                      {rule}
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          <div className="space-y-6">
            <div className="border border-border bg-panel p-7 text-center">
              <h2 className="font-display text-lg font-bold uppercase text-foreground">
                Countdown
              </h2>
              <p className="mt-4 font-mono text-4xl font-bold text-ember">
                {countdown}
              </p>
            </div>

            <div className="border border-border bg-panel p-7">
              <h2 className="mb-5 font-display text-lg font-bold uppercase text-foreground">
                Your Registration
              </h2>
              <div className="space-y-3 font-mono text-sm">
                <div className="flex justify-between text-muted-foreground">
                  <span>Code</span>
                  <span className="text-foreground">{registration.registrationCode}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Team</span>
                  <span className="text-foreground">{registration.teamName}</span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Slot</span>
                  <span className="text-foreground">
                    {registration.slotNumber} / {effectiveMaxTeams}
                  </span>
                </div>
                <div className="flex justify-between text-muted-foreground">
                  <span>Payment</span>
                  <span className={registration.paymentStatus === "PAID" || scrim.fee === 0 ? "text-cyan" : "text-amber"}>
                    {scrim.fee === 0 ? "Free Entry" : registration.paymentStatus}
                  </span>
                </div>
              </div>
            </div>

            <div className="border border-border bg-panel p-7">
              <h2 className="mb-5 font-display text-lg font-bold uppercase text-foreground">
                Room Details
              </h2>

              <div className="space-y-4">
                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Room ID
                  </p>
                  <div className="mt-2 flex items-center justify-between border border-border p-3 font-mono text-sm">
                    {roomReleased && slot.roomId ? slot.roomId : "Not released yet"}
                    {roomReleased && slot.roomId && (
                      <button onClick={() => copy(slot.roomId!)} className="text-cyan">
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                </div>

                <div>
                  <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                    Password
                  </p>
                  <div className="mt-2 flex items-center justify-between border border-border p-3 font-mono text-sm">
                    {roomReleased && slot.roomPassword ? slot.roomPassword : "Not released yet"}
                    {roomReleased && slot.roomPassword && (
                      <button onClick={() => copy(slot.roomPassword!)} className="text-cyan">
                        <Copy size={16} />
                      </button>
                    )}
                  </div>
                </div>
              </div>

              {!roomReleased && (
                <p className="mt-4 font-mono text-xs text-muted-foreground">
                  Room ID is typically released 15 minutes before the match.
                </p>
              )}
            </div>

            <div className="border border-border bg-panel p-7 text-center">
              <p className="font-mono text-xs text-muted-foreground">
                {remainingSlots > 0
                  ? `${remainingSlots} slots still open`
                  : "This tournament is full"}
              </p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
