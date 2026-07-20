import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import TournamentRow from "@/components/home/TournamentRow";
import RegisteredBanner from "@/components/home/RegisteredBanner";

import { getScrims, type Scrim } from "@/lib/scrims";

export default async function Home() {
  const scrims = await getScrims();

  const battleRoyale = scrims.filter(
  (scrim: Scrim) => scrim.mode === "BR"
);

const clashSquad = scrims.filter(
  (scrim: Scrim) => scrim.mode === "CS"
);

const freeEntry = scrims.filter(
  (scrim: Scrim) => scrim.fee === 0
);

const paidEntry = scrims.filter(
  (scrim: Scrim) => scrim.fee > 0
);

  return (
    <main className="min-h-screen bg-gradient-to-br from-gray-100 to-white">
      <Navbar />

      <FeaturedEvents />
      <RegisteredBanner />

      <TournamentRow
        title="🔥 Battle Royale"
        tournaments={battleRoyale}
      />

      <TournamentRow
        title="⚔️ Clash Squad"
        tournaments={clashSquad}
      />

      <TournamentRow
        title="🆓 Free Entry"
        tournaments={freeEntry}
      />

      <TournamentRow
        title="💰 Paid Entry"
        tournaments={paidEntry}
      />

      <Footer />
    </main>
  );
}