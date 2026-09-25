import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import RegisteredBanner from "@/components/home/RegisteredBanner";

import Features from "@/components/home/Features";
import TournamentRow from "@/components/home/TournamentRow";

import { getScrims, type Scrim } from "@/lib/scrims";
import { canRegisterForScrim } from "@/lib/scrimAvailability";
import Link from "next/link";
import { Search, X } from "lucide-react";
import { scrimModeLabel } from "@/lib/scrimMode";

export default async function PlatformHome({ query = "" }: { query?: string }) {
  const allScrims = await getScrims();
  const normalizedQuery = query.trim().toLowerCase();
  const scrims = allScrims.filter((scrim) =>
    canRegisterForScrim(scrim) &&
    (!normalizedQuery || `${scrim.title} ${scrim.mode} ${scrimModeLabel(scrim.mode)}`.toLowerCase().includes(normalizedQuery))
  );

  const battleRoyale = scrims.filter((scrim: Scrim) => scrim.mode === "BR");
  const clashSquad = scrims.filter((scrim: Scrim) => scrim.mode === "CS");
  const specialLobbies = scrims.filter((scrim: Scrim) => scrim.mode === "SPECIAL");

  return (
    <main className="min-h-screen bg-background">
      <Navbar initialQuery={query} />
      <RegisteredBanner />
      {normalizedQuery && (
        <div className="mx-auto max-w-7xl px-4 pt-6 sm:px-6">
          <div aria-live="polite" className="flex flex-wrap items-center justify-between gap-4 rounded-xl border border-cyan/25 bg-cyan/5 px-4 py-4 sm:px-6">
            <div className="flex items-center gap-3">
              <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-cyan/25 bg-cyan/10 text-cyan">
                <Search size={18} aria-hidden="true" />
              </span>
              <div>
                <p className="font-mono text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan">Tournament search</p>
                <p className="mt-0.5 font-display text-lg font-bold text-foreground sm:text-xl">
                  {scrims.length === 0 ? "No matches" : `${scrims.length} upcoming ${scrims.length === 1 ? "tournament" : "tournaments"}`} <span className="font-normal text-muted-foreground">for “{query.trim()}”</span>
                </p>
              </div>
            </div>
            <Link href="/platform" className="inline-flex items-center gap-1.5 rounded-md border border-border px-3 py-2 font-mono text-xs font-semibold uppercase tracking-wide text-foreground transition hover:border-cyan hover:text-cyan">
              <X size={14} aria-hidden="true" /> Clear search
            </Link>
          </div>
        </div>
      )}
      {!normalizedQuery && scrims.length === 0 && (
        <p className="mx-auto max-w-7xl px-4 pt-8 font-mono text-sm text-muted-foreground sm:px-6">
          No upcoming tournaments are open right now. Check back soon for new dates.
        </p>
      )}
      <FeaturedEvents scrims={scrims.slice(0, 3)} />
      <TournamentRow anchorId="scrims" title="Battle Royale" tournaments={battleRoyale} />
      <TournamentRow title="Clash Squad" tournaments={clashSquad} />
      <TournamentRow title="Special Lobbies" tournaments={specialLobbies} />

      <Features />
      <Footer />
    </main>
  );
}
