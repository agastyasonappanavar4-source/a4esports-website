import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import RegisteredBanner from "@/components/home/RegisteredBanner";

import Features from "@/components/home/Features";
import TournamentRow from "@/components/home/TournamentRow";

import { getScrims, type Scrim } from "@/lib/scrims";

export const dynamic = "force-dynamic";

export default async function Home() {
  const scrims = await getScrims();

  const battleRoyale = scrims.filter((scrim: Scrim) => scrim.mode === "BR");
  const clashSquad = scrims.filter((scrim: Scrim) => scrim.mode === "CS");

  return (
    <main className="min-h-screen bg-background">
      <Navbar />
      <RegisteredBanner />
      <FeaturedEvents scrims={scrims.slice(0, 3)} />
      <TournamentRow anchorId="scrims" title="Battle Royale" tournaments={battleRoyale} />
      <TournamentRow title="Clash Squad" tournaments={clashSquad} />

      <Features />
      <Footer />
    </main>
  );
}