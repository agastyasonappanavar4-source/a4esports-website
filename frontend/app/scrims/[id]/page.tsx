import { scrimModeLabel } from "@/lib/scrimMode";
import { notFound } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import { Trophy, Users, Calendar, IndianRupee, ShieldCheck, Clock } from "lucide-react";
import BackToHome from "@/components/layout/BackToHome";
import { getScrimById } from "@/lib/scrims";
import { canRegisterForScrim } from "@/lib/scrimAvailability";
import { slotTimeLabel } from "@/lib/slotTime";
import { CornerFrame } from "@/components/ui/CornerFrame";

export default async function TournamentPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const scrim = await getScrimById(Number(id));

  if (!scrim) {
    notFound();
  }

  const registrationOpen = canRegisterForScrim(scrim);
  const openSlots = registrationOpen ? scrim.slots.filter((slot) => slot.status === "OPEN") : [];

  const formattedDate = new Date(scrim.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const rulesList = scrim.rules
    ? scrim.rules.split("\n").map((r) => r.trim()).filter(Boolean)
    : [];

  return (
    <main className="min-h-screen bg-background">
      <Navbar />

      {/* Banner / Poster Header */}
      <div className="relative h-72 sm:h-96 w-full flex items-end overflow-hidden border-b border-border bg-void">
        {scrim.image ? (
          <img
            src={scrim.image}
            alt={scrim.title}
            className="absolute inset-0 h-full w-full object-contain"
          />
        ) : (
          <div className="absolute inset-0 bg-tactical-grid bg-hero-glow" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />

        <div className="relative mx-auto flex w-full max-w-7xl flex-col justify-end px-4 sm:px-6 pb-6 sm:pb-10">
          <BackToHome />

          <div>
            <span className="flex w-fit items-center gap-2 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-cyan backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-dot" />
              {registrationOpen ? "Registration Open" : "Registration Closed"}
            </span>
            <h1 className="mt-3 font-display text-3xl sm:text-5xl md:text-6xl font-bold uppercase leading-tight text-foreground drop-shadow-md">
              {scrim.title}
            </h1>
            <p className="mt-1 font-mono text-xs sm:text-sm font-semibold uppercase tracking-wider text-cyan">
              {scrimModeLabel(scrim.mode)}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8">
        <div className="mb-6 flex flex-wrap gap-3">
          <span className="rounded-lg border border-amber-400/40 bg-amber-400/10 px-4 py-2 font-mono text-sm font-bold text-amber-400">
            🏆 Prize Pool: {scrim.prizePool || "TBD"}
          </span>
          <span className="rounded-lg border border-border bg-panel px-4 py-2 font-mono text-sm text-foreground">
            {scrim.fee === 0 ? "Free Entry" : `₹${scrim.fee} Entry`}
          </span>
          <span className="rounded-lg border border-border bg-panel px-4 py-2 font-mono text-sm text-foreground">
            {scrim.maxTeams} Teams
          </span>
          <span className="rounded-lg border border-border bg-panel px-4 py-2 font-mono text-sm text-foreground">
            {formattedDate}
          </span>
        </div>

        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2 order-2 lg:order-1">
            <div className="relative rounded-xl border border-border bg-panel p-6 sm:p-8">
              <CornerFrame tone="cyan" show="always" />
              <h2 className="mb-6 font-display text-2xl font-bold uppercase text-foreground">
                Tournament Rules
              </h2>

              {rulesList.length > 0 ? (
                <ul className="space-y-3 font-mono text-sm text-muted-foreground">
                  {rulesList.map((rule, i) => (
                    <li key={i}>{rule}</li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-sm text-muted-foreground">
                  Rules will be published soon.
                </p>
              )}
            </div>
          </div>

          <div className="space-y-6 order-1 lg:order-2">
            <div className="rounded-xl border border-border bg-panel p-6">
              <h2 className="mb-6 font-display text-xl font-bold uppercase text-foreground">
                Tournament Info
              </h2>

              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Trophy size={18} className="text-amber-400" />
                  <span className="font-bold text-amber-400">Prize Pool: {scrim.prizePool || "TBD"}</span>
                </div>
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-cyan" />
                  {scrim.maxTeams} Teams
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-amber-400" />
                  {formattedDate}
                </div>
                <div className="flex items-center gap-3">
                  <IndianRupee size={18} className="text-cyan" />
                  {scrim.fee === 0 ? "Free Entry" : `₹${scrim.fee}`}
                </div>
              </div>
            </div>

            <div className="mt-6 rounded-xl border border-border bg-panel p-6">
              <h2 className="mb-2 font-display text-xl font-bold uppercase text-foreground">
                Choose Your Time Slot
              </h2>
              <p className="mb-6 font-mono text-xs text-muted-foreground">
                Each time slot runs as its own lobby with its own set of teams.
              </p>

              {scrim.fee === 35 && (scrim.status !== "OPEN" || openSlots.length === 0 || openSlots.every(s => (s._count?.registrations ?? 0) >= (s.maxTeams ?? scrim.maxTeams))) ? (
                <div className="rounded-lg border border-destructive/30 bg-destructive/10 p-5 text-center">
                  <p className="font-mono text-sm font-semibold text-destructive uppercase tracking-widest">
                    Not Available
                  </p>
                  <p className="mt-1 font-mono text-xs text-muted-foreground">
                    The ₹35 lobby is not available for this day.
                  </p>
                </div>
              ) : openSlots.length === 0 ? (
                <p className="font-mono text-sm text-muted-foreground">
                  {registrationOpen ? "No time slots are open right now. Check back soon." : "Registration has closed for this tournament date."}
                </p>
              ) : (
                <div className="space-y-3">
                  {openSlots.map((slot) => {
                    const effectiveMax = slot.maxTeams ?? scrim.maxTeams;
                    const registered = slot._count?.registrations ?? 0;
                    const full = registered >= effectiveMax;

                    const rowClasses = `flex items-center justify-between border p-4 font-mono text-sm transition ${
                      full
                        ? "cursor-not-allowed border-border/50 text-muted-foreground opacity-50"
                        : "border-border text-foreground hover:border-ember hover:bg-ember/5"
                    }`;

                    const rowContent = (
                      <>
                        <span className="flex items-center gap-3">
                          <Clock size={16} className="text-ember" />
                          {slotTimeLabel(slot.time)}
                        </span>
                        <span className={full ? "" : "text-cyan"}>
                          {full ? "Full" : `${registered}/${effectiveMax} teams`}
                        </span>
                      </>
                    );

                    if (full) {
                      return (
                        <div key={slot.id} className={rowClasses}>
                          {rowContent}
                        </div>
                      );
                    }

                    return (
                      <Link
                        key={slot.id}
                        href={`/scrims/${scrim.id}/register?slot=${slot.id}`}
                        className={rowClasses}
                      >
                        {rowContent}
                      </Link>
                    );
                  })}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
