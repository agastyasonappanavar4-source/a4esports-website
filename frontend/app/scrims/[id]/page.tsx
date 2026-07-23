import { notFound } from "next/navigation";
import Link from "next/link";
import { Trophy, Users, Calendar, IndianRupee, ShieldCheck } from "lucide-react";
import { getScrimById } from "@/lib/scrims";
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
      <div className="relative flex h-80 w-full items-end overflow-hidden border-b border-border bg-void bg-tactical-grid">
        <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/10 to-transparent" />
        <div className="relative mx-auto flex w-full max-w-7xl items-end justify-between px-6 pb-10">
          <div>
            <span className="flex w-fit items-center gap-2 border border-ember/40 bg-ember/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-ember">
              <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulse-dot" />
              {scrim.status === "OPEN" ? "Registration Open" : "Closed"}
            </span>
            <h1 className="mt-5 font-display text-5xl md:text-6xl font-bold uppercase leading-tight text-foreground">
              {scrim.title}
            </h1>
            <p className="mt-2 font-mono text-sm uppercase tracking-widest text-cyan">
              {scrim.mode === "BR" ? "Battle Royale" : "Clash Squad"}
            </p>
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="grid gap-8 lg:grid-cols-3">
          <div className="space-y-8 lg:col-span-2">
            <div className="flex flex-wrap gap-3">
              <span className="border border-border bg-panel px-4 py-2 font-mono text-sm text-foreground">
                {scrim.fee === 0 ? "Free Entry" : `₹${scrim.fee} Entry`}
              </span>
              <span className="border border-border bg-panel px-4 py-2 font-mono text-sm text-foreground">
                {scrim.maxTeams} Teams
              </span>
              <span className="border border-border bg-panel px-4 py-2 font-mono text-sm text-foreground">
                {formattedDate} · {scrim.time}
              </span>
            </div>

            <div className="relative border border-border bg-panel p-8">
              <CornerFrame tone="cyan" show="always" />
              <h2 className="mb-6 font-display text-2xl font-bold uppercase text-foreground">
                Tournament Rules
              </h2>

              {rulesList.length > 0 ? (
                <ul className="space-y-3 font-mono text-sm text-muted-foreground">
                  {rulesList.map((rule, i) => (
                    <li key={i} className="flex gap-3">
                      <ShieldCheck size={16} className="mt-0.5 shrink-0 text-ember" />
                      {rule}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-mono text-sm text-muted-foreground">
                  Rules will be published soon.
                </p>
              )}
            </div>
          </div>

          <div>
            <div className="border border-border bg-panel p-6">
              <h2 className="mb-6 font-display text-xl font-bold uppercase text-foreground">
                Tournament Info
              </h2>

              <div className="space-y-4 font-mono text-sm text-muted-foreground">
                <div className="flex items-center gap-3">
                  <Trophy size={18} className="text-amber" />
                  Prize pool announced soon
                </div>
                <div className="flex items-center gap-3">
                  <Users size={18} className="text-cyan" />
                  {scrim.maxTeams} Teams
                </div>
                <div className="flex items-center gap-3">
                  <Calendar size={18} className="text-ember" />
                  {formattedDate}
                </div>
                <div className="flex items-center gap-3">
                  <IndianRupee size={18} className="text-ember" />
                  {scrim.fee === 0 ? "Free Entry" : `₹${scrim.fee}`}
                </div>
              </div>

              <Link
                href={`/scrims/${scrim.id}/register`}
                className="mt-8 flex w-full items-center justify-center bg-ember py-4 font-display text-lg font-bold uppercase text-void transition hover:bg-[var(--ember-deep)]"
              >
                Register Now
              </Link>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}