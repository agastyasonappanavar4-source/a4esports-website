"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  Trophy,
  Calendar,
  Clock,
  Users,
  Copy,
  ArrowLeft,
  Hourglass,
  CheckCircle2,
  KeyRound,
  ShieldAlert,
  Medal,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { getRegistrationDetails, type RegistrationDetails } from "@/services/registrations";
import { getSlotMatchesRequest, type SlotMatch, type OverallStandingItem } from "@/services/admin";
import { combineDateWithSlot, slotTimeLabel } from "@/lib/slotTime";
import { getCountdown } from "@/lib/countdown";
import { Skeleton } from "@/components/ui/Skeleton";
import Navbar from "@/components/layout/Navbar";

export default function MyMatchDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const registrationId = Number(resolvedParams.id);

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [details, setDetails] = useState<RegistrationDetails | null>(null);
  const [matches, setMatches] = useState<SlotMatch[]>([]);
  const [overallStandings, setOverallStandings] = useState<OverallStandingItem[]>([]);
  const [activeResultsTab, setActiveResultsTab] = useState<string>("overall");

  const [countdown, setCountdown] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?next=/my-match/${registrationId}`);
    }
  }, [authLoading, user, registrationId, router]);

  useEffect(() => {
    if (!registrationId || isNaN(registrationId)) {
      setError("Invalid registration ID.");
      setLoading(false);
      return;
    }

    getRegistrationDetails(registrationId)
      .then((data) => {
        setDetails(data);
        // Fetch matches and standings for this slot
        if (data.slot?.id) {
          getSlotMatchesRequest(data.slot.id)
            .then((res) => {
              setMatches(res.matches || []);
              setOverallStandings(res.overallStandings || []);
              if (res.matches?.length > 0) {
                setActiveResultsTab(`match-${res.matches[0].id}`);
              }
            })
            .catch(() => {
              setMatches([]);
              setOverallStandings([]);
            });
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load match details.");
      })
      .finally(() => setLoading(false));
  }, [registrationId]);

  useEffect(() => {
    if (!details?.scrim?.date || !details?.slot?.time) return;
    const target = combineDateWithSlot(details.scrim.date, details.slot.time);
    const update = () => setCountdown(getCountdown(target));
    update();
    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [details]);

  const copy = (text: string, label: string) => {
    navigator.clipboard.writeText(text).then(() => {
      showToast(`${label} copied to clipboard!`, "success");
    }).catch(() => {});
  };

  if (loading) {
    return (
      <main className="min-h-screen bg-background bg-tactical-grid">
        <Navbar />
        <div className="mx-auto max-w-7xl px-4 sm:px-6 py-10">
          <Skeleton className="mb-6 h-10 w-36" />
          <Skeleton className="h-40 w-full rounded-xl" />
          <div className="mt-8 grid gap-8 lg:grid-cols-3">
            <div className="space-y-6 lg:col-span-2">
              <Skeleton className="h-48 w-full rounded-xl" />
              <Skeleton className="h-40 w-full rounded-xl" />
            </div>
            <div className="space-y-6">
              <Skeleton className="h-32 w-full rounded-xl" />
              <Skeleton className="h-48 w-full rounded-xl" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (error || !details) {
    return (
      <main className="min-h-screen bg-background bg-tactical-grid">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-16 text-center">
          <div className="rounded-xl border border-destructive/40 bg-panel p-8">
            <ShieldAlert size={40} className="mx-auto mb-4 text-destructive" />
            <h1 className="font-display text-2xl font-bold uppercase text-foreground">
              Access Restricted
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">{error}</p>
            <button
              onClick={() => router.push("/platform")}
              className="mt-6 border border-border bg-panel-2 px-6 py-2.5 font-mono text-sm text-foreground transition hover:border-cyan hover:text-cyan"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { registration, scrim, slot, teams, totalTeams, remainingSlots, roomReleased } = details;
  const isPending = registration.paymentStatus === "PENDING";
  const timing = slotTimeLabel(slot);
  const effectiveMaxTeams = slot.maxTeams ?? scrim.maxTeams;

  const formattedDate = new Date(scrim.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const rulesList = scrim.rules
    ? scrim.rules.split("\n").map((r) => r.trim()).filter(Boolean)
    : [];

  // Active match for results view
  const activeMatch = matches.find((m) => `match-${m.id}` === activeResultsTab);

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <Navbar />

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Navigation */}
        <button
          onClick={() => router.push("/platform")}
          className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-panel px-4 py-2 font-mono text-xs text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Back to Home
        </button>

        {/* Hero Header Card */}
        <div
          className={`rounded-2xl border p-6 sm:p-8 ${
            isPending
              ? "border-amber/40 bg-amber/10"
              : "border-ember/40 bg-ember/10"
          }`}
        >
          <div className="flex flex-wrap items-center justify-between gap-3">
            <span
              className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1 font-mono text-xs font-bold tracking-wider uppercase ${
                isPending
                  ? "border border-amber/50 bg-amber/20 text-amber"
                  : "border border-cyan/50 bg-cyan/20 text-cyan"
              }`}
            >
              {isPending ? (
                <>
                  <Hourglass size={13} className="animate-spin" />
                  Payment Being Verified
                </>
              ) : (
                <>
                  <CheckCircle2 size={13} />
                  Confirmed Registration
                </>
              )}
            </span>

            <span className="font-mono text-xs font-bold text-muted-foreground uppercase">
              {scrim.mode === "BR" ? "Battle Royale" : "Clash Squad"} · {timing}
            </span>
          </div>

          <h1 className="mt-4 font-display text-3xl sm:text-4xl md:text-5xl font-bold uppercase text-foreground">
            {scrim.title}
          </h1>

          <p className="mt-2 font-mono text-xs sm:text-sm text-muted-foreground">
            {isPending
              ? "Your payment verification request has been received. Admin is manually verifying your payment."
              : "You are confirmed for this tournament lobby. Check room details below."}
          </p>
        </div>

        {/* Layout Grid */}
        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          {/* Main Column */}
          <div className="space-y-6 lg:col-span-2">
            {/* Match Information */}
            <div className="rounded-xl border border-border bg-panel p-5 sm:p-7">
              <h2 className="mb-5 font-display text-lg sm:text-xl font-bold uppercase text-foreground">
                Match Information
              </h2>
              <div className="grid gap-4 font-mono text-xs sm:text-sm text-muted-foreground sm:grid-cols-2">
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-ember shrink-0" />
                  <span>{formattedDate}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Clock size={18} className="text-ember shrink-0" />
                  <span>{timing}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-cyan shrink-0" />
                  <span>{totalTeams} / {effectiveMaxTeams} Confirmed Teams</span>
                </div>
                <div className="flex items-center gap-3">
                  <Trophy size={18} className="text-amber shrink-0" />
                  <span>{scrim.mode === "BR" ? "Battle Royale" : "Clash Squad"}</span>
                </div>
              </div>
            </div>

            {/* Registered Teams in Selected Timing Slot */}
            <div className="rounded-xl border border-border bg-panel p-5 sm:p-7">
              <div className="flex items-center justify-between mb-5">
                <h2 className="font-display text-lg sm:text-xl font-bold uppercase text-foreground">
                  Registered Teams in This Slot ({totalTeams})
                </h2>
                <span className="font-mono text-xs text-muted-foreground">
                  Timing: {timing}
                </span>
              </div>

              {isPending ? (
                <div className="rounded-lg border border-border/80 bg-panel-2 p-6 text-center font-mono text-xs text-muted-foreground">
                  <Hourglass size={24} className="mx-auto mb-2 text-amber animate-pulse" />
                  Full list of opponents will unlock once your payment is verified by the administrator.
                </div>
              ) : teams.length === 0 ? (
                <p className="font-mono text-xs text-muted-foreground">
                  No other confirmed teams yet. You are among the first in this slot!
                </p>
              ) : (
                <div className="grid gap-2 sm:grid-cols-2">
                  {teams.map((team) => {
                    const isUserTeam = team.teamName === registration.teamName;
                    return (
                      <div
                        key={team.id || team.slotNumber}
                        className={`rounded-lg border p-3 font-mono text-xs sm:text-sm flex items-center justify-between ${
                          isUserTeam
                            ? "border-cyan/50 bg-cyan/10 text-foreground font-semibold"
                            : "border-border text-muted-foreground bg-panel-2/40"
                        }`}
                      >
                        <span className="truncate">
                          #{team.slotNumber} {team.teamName}
                        </span>
                        {isUserTeam && (
                          <span className="text-[10px] uppercase font-bold tracking-wider text-cyan shrink-0 ml-2">
                            YOU
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Standings & Results Section */}
            <div className="rounded-xl border border-border bg-panel p-5 sm:p-7">
              <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
                <div className="flex items-center gap-2">
                  <Medal size={20} className="text-amber" />
                  <h2 className="font-display text-lg sm:text-xl font-bold uppercase text-foreground">
                    Match Standings &amp; Results
                  </h2>
                </div>

                {/* Match Tabs */}
                {matches.length > 0 && (
                  <div className="flex flex-wrap gap-1.5 font-mono text-xs">
                    {matches.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => setActiveResultsTab(`match-${m.id}`)}
                        className={`px-3 py-1 rounded-md transition ${
                          activeResultsTab === `match-${m.id}`
                            ? "bg-cyan text-void font-bold"
                            : "border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {m.title || `Match ${m.matchNumber}`}
                      </button>
                    ))}
                    {overallStandings.length > 0 && (
                      <button
                        onClick={() => setActiveResultsTab("overall")}
                        className={`px-3 py-1 rounded-md transition ${
                          activeResultsTab === "overall"
                            ? "bg-ember text-void font-bold"
                            : "border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        Overall Standings
                      </button>
                    )}
                  </div>
                )}
              </div>

              {/* Standings Table */}
              {matches.length === 0 ? (
                <div className="rounded-lg border border-dashed border-border p-8 text-center font-mono text-xs text-muted-foreground">
                  <Trophy size={28} className="mx-auto mb-2 text-muted-foreground/40" />
                  Results will appear after the match is completed.
                </div>
              ) : activeResultsTab === "overall" ? (
                /* Overall Standings Table */
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[500px] border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground uppercase text-[11px]">
                        <th className="pb-3 pr-3">#</th>
                        <th className="pb-3 pr-4">Team</th>
                        <th className="pb-3 pr-4 text-center">Matches</th>
                        <th className="pb-3 pr-3 text-center">WIN</th>
                        <th className="pb-3 pr-3 text-center">PP</th>
                        <th className="pb-3 pr-3 text-center">KP</th>
                        <th className="pb-3 text-center font-bold text-foreground">TP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {overallStandings.map((team, idx) => (
                        <tr
                          key={team.registrationId}
                          className={`hover:bg-panel-2/40 ${
                            team.teamName === registration.teamName ? "bg-cyan/5 font-bold" : ""
                          }`}
                        >
                          <td className="py-3 pr-3 text-muted-foreground">{idx + 1}</td>
                          <td className="py-3 pr-4 text-foreground font-semibold">
                            {team.teamName}
                            {team.teamName === registration.teamName && (
                              <span className="ml-1 text-[10px] text-cyan">· YOU</span>
                            )}
                          </td>
                          <td className="py-3 pr-4 text-center text-muted-foreground">{team.matchesPlayed}</td>
                          <td className="py-3 pr-3 text-center text-amber">{team.won}</td>
                          <td className="py-3 pr-3 text-center text-muted-foreground">{team.pp}</td>
                          <td className="py-3 pr-3 text-center text-muted-foreground">{team.kp}</td>
                          <td className="py-3 text-center font-bold text-cyan text-sm">{team.tp}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              ) : activeMatch ? (
                /* Individual Match Table */
                <div className="overflow-x-auto">
                  <table className="w-full min-w-[480px] border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground uppercase text-[11px]">
                        <th className="pb-3 pr-4">Rank</th>
                        <th className="pb-3 pr-4">Team</th>
                        <th className="pb-3 pr-3 text-center">WIN</th>
                        <th className="pb-3 pr-3 text-center">PP</th>
                        <th className="pb-3 pr-3 text-center">KP</th>
                        <th className="pb-3 text-center font-bold text-foreground">TP</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {activeMatch.results.map((res) => {
                        const tName = res.registration?.teamName || "Unknown Team";
                        const isYou = tName === registration.teamName;
                        return (
                          <tr
                            key={res.id || res.registrationId}
                            className={`hover:bg-panel-2/40 ${isYou ? "bg-cyan/5 font-bold" : ""}`}
                          >
                            <td className="py-3 pr-4 text-muted-foreground">#{res.rank}</td>
                            <td className="py-3 pr-4 text-foreground font-semibold">
                              {tName}
                              {isYou && <span className="ml-1 text-[10px] text-cyan">· YOU</span>}
                            </td>
                            <td className="py-3 pr-3 text-center text-amber">{res.won}</td>
                            <td className="py-3 pr-3 text-center text-muted-foreground">{res.pp}</td>
                            <td className="py-3 pr-3 text-center text-muted-foreground">{res.kp}</td>
                            <td className="py-3 text-center font-bold text-cyan text-sm">{res.tp}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              ) : null}
            </div>

            {/* Rules */}
            {rulesList.length > 0 && (
              <div className="rounded-xl border border-border bg-panel p-5 sm:p-7">
                <h2 className="mb-4 font-display text-lg sm:text-xl font-bold uppercase text-foreground">
                  Tournament Rules
                </h2>
                <ul className="space-y-2.5 font-mono text-xs sm:text-sm text-muted-foreground list-disc pl-5">
                  {rulesList.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              </div>
            )}
          </div>

          {/* Right Sidebar Column */}
          <div className="space-y-6">
            {/* Countdown Card */}
            <div className="rounded-xl border border-border bg-panel p-6 text-center">
              <h2 className="font-display text-base font-bold uppercase tracking-wider text-muted-foreground">
                Match Countdown
              </h2>
              <p className="mt-3 font-mono text-3xl sm:text-4xl font-black text-ember">
                {countdown || "00h 00m 00s"}
              </p>
              <p className="mt-1 font-mono text-[11px] text-muted-foreground">
                Slot Timing: {timing}
              </p>
            </div>

            {/* Registration Summary */}
            <div className="rounded-xl border border-border bg-panel p-5 sm:p-6 space-y-3 font-mono text-xs sm:text-sm">
              <h2 className="font-display text-base font-bold uppercase tracking-wider text-foreground mb-3">
                Your Slot Pass
              </h2>
              <div className="flex justify-between text-muted-foreground">
                <span>Code</span>
                <span className="text-foreground font-semibold">{registration.registrationCode}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Team</span>
                <span className="text-foreground font-semibold">{registration.teamName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>IGL</span>
                <span className="text-foreground">{registration.iglName}</span>
              </div>
              <div className="flex justify-between text-muted-foreground">
                <span>Team Slot #</span>
                <span className="text-foreground font-semibold">
                  {registration.slotNumber > 0 ? `#${registration.slotNumber}` : "Allocating on verification"}
                </span>
              </div>
              <div className="flex justify-between text-muted-foreground border-t border-border/40 pt-2">
                <span>Payment</span>
                <span className={isPending ? "text-amber font-bold" : "text-cyan font-bold"}>
                  {isPending ? "Verification Pending" : "Confirmed"}
                </span>
              </div>
            </div>

            {/* Room ID & Password (Protected) */}
            <div className="rounded-xl border border-border bg-panel p-5 sm:p-6">
              <div className="flex items-center gap-2 mb-4">
                <KeyRound size={18} className="text-cyan" />
                <h2 className="font-display text-base font-bold uppercase tracking-wider text-foreground">
                  Room Details
                </h2>
              </div>

              {isPending ? (
                <div className="rounded-lg border border-amber/30 bg-amber/10 p-4 font-mono text-xs text-amber space-y-1.5">
                  <p className="font-bold">Room Locked</p>
                  <p className="text-[11px] text-muted-foreground">
                    Room ID and Password will be unlocked here after admin verifies your payment.
                  </p>
                </div>
              ) : !roomReleased ? (
                <div className="rounded-lg border border-border bg-panel-2 p-4 font-mono text-xs text-muted-foreground text-center space-y-2">
                  <p className="text-foreground font-semibold">Room Not Released Yet</p>
                  <p className="text-[11px]">
                    Room ID and Password will be available 15 minutes before the match.
                  </p>
                </div>
              ) : (
                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Room ID
                    </span>
                    <div className="mt-1 flex items-center justify-between rounded-lg border border-border bg-panel-2 p-3 text-sm font-bold text-foreground">
                      <span>{slot.roomId || "Pending"}</span>
                      {slot.roomId && (
                        <button
                          onClick={() => copy(slot.roomId!, "Room ID")}
                          className="text-cyan hover:text-cyan/80 p-1"
                        >
                          <Copy size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase tracking-wider text-muted-foreground">
                      Password
                    </span>
                    <div className="mt-1 flex items-center justify-between rounded-lg border border-border bg-panel-2 p-3 text-sm font-bold text-foreground">
                      <span>{slot.roomPassword || "Pending"}</span>
                      {slot.roomPassword && (
                        <button
                          onClick={() => copy(slot.roomPassword!, "Password")}
                          className="text-cyan hover:text-cyan/80 p-1"
                        >
                          <Copy size={15} />
                        </button>
                      )}
                    </div>
                  </div>

                  <p className="text-[10px] text-cyan pt-1">
                    ✓ Room credentials are live. Join lobby in Free Fire at least 5 minutes prior.
                  </p>
                </div>
              )}
            </div>

            {/* Capacity tracker */}
            <div className="rounded-xl border border-border bg-panel p-4 text-center font-mono text-xs text-muted-foreground">
              {remainingSlots > 0
                ? `${remainingSlots} slots still open in this timing`
                : "This time slot is completely full"}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
