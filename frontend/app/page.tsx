import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import RegisteredBanner from "@/components/home/RegisteredBanner";
import Stats from "@/components/home/Stats";
import Features from "@/components/home/Features";
import TournamentRow from "@/components/home/TournamentRow";

import { getScrims, type Scrim } from "@/lib/scrims";

export default async function Home() {
  const scrims = await getScrims();

  const battleRoyale = scrims.filter((scrim: Scrim) => scrim.mode === "BR");
  const clashSquad = scrims.filter((scrim: Scrim) => scrim.mode === "CS");
  const freeEntry = scrims.filter((scrim: Scrim) => scrim.fee === 0);
  const paidEntry = scrims.filter((scrim: Scrim) => scrim.fee > 0);

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <RegisteredBanner />
      <FeaturedEvents scrims={scrims.slice(0, 3)} />
      <Stats />

      <TournamentRow anchorId="scrims" title="🔥 Battle Royale" tournaments={battleRoyale} />
      <TournamentRow title="⚔️ Clash Squad" tournaments={clashSquad} />
      <TournamentRow title="🆓 Free Entry" tournaments={freeEntry} />
      <TournamentRow title="💰 Paid Entry" tournaments={paidEntry} />

      <Features />
      <Footer />
    </main>
  );
}