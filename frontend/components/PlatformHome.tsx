import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import RegisteredBanner from "@/components/home/RegisteredBanner";

import Features from "@/components/home/Features";
import TournamentRow from "@/components/home/TournamentRow";

import { getScrims, type Scrim } from "@/lib/scrims";
import { canRegisterForScrim } from "@/lib/scrimAvailability";

export default async function PlatformHome({ query = "" }: { query?: string }) {
  const allScrims = await getScrims();
  const normalizedQuery = query.trim().toLowerCase();
  const scrims = allScrims.filter((scrim) =>
    canRegisterForScrim(scrim) &&
    (!normalizedQuery || `${scrim.title} ${scrim.mode}`.toLowerCase().includes(normalizedQuery))
  );

  const battleRoyale = scrims.filter((scrim: Scrim) => scrim.mode === "BR");
  const clashSquad = scrims.filter((scrim: Scrim) => scrim.mode === "CS");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <RegisteredBanner />
      {normalizedQuery && (
        <p className="mx-auto max-w-7xl px-4 pt-5 font-mono text-sm text-muted-foreground sm:px-6">
          {scrims.length} upcoming tournament{scrims.length === 1 ? "" : "s"} found for &quot;{query.trim()}&quot;.
        </p>
      )}
      {!normalizedQuery && scrims.length === 0 && (
        <p className="mx-auto max-w-7xl px-4 pt-8 font-mono text-sm text-muted-foreground sm:px-6">
          No upcoming tournaments are open right now. Check back soon for new dates.
        </p>
      )}
      <FeaturedEvents scrims={scrims.slice(0, 3)} />
      <TournamentRow anchorId="scrims" title="Battle Royale" tournaments={battleRoyale} />
      <TournamentRow title="Clash Squad" tournaments={clashSquad} />

      <Features />
      <Footer />
    </main>
  );
}
