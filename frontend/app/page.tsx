import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import FeaturedEvents from "@/components/home/FeaturedEvents";
import TournamentRow from "@/components/home/TournamentRow";
import RegisteredBanner from "@/components/home/RegisteredBanner";

const battleRoyale = [
  {
    id: 1,
    title: "Weekly BR Championship",
    prize: "₹10,000",
    entry: "FREE",
    slots: "32 / 48",
  },
  {
    id: 2,
    title: "Night Scrim",
    prize: "₹3,000",
    entry: "₹50",
    slots: "40 / 48",
  },
  {
    id: 3,
    title: "Rush Hour",
    prize: "₹1,000",
    entry: "FREE",
    slots: "20 / 48",
  },
  {
    id: 4,
    title: "Elite BR",
    prize: "₹5,000",
    entry: "₹99",
    slots: "15 / 48",
  },
];

const clashSquad = [
  {
    id: 5,
    title: "Weekend CS",
    prize: "₹2,000",
    entry: "FREE",
    slots: "12 / 16",
  },
  {
    id: 6,
    title: "CS Masters",
    prize: "₹1,500",
    entry: "₹20",
    slots: "8 / 16",
  },
  {
    id: 7,
    title: "Evening CS",
    prize: "₹500",
    entry: "FREE",
    slots: "14 / 16",
  },
];

const loneWolf = [
  {
    id: 8,
    title: "Solo League",
    prize: "₹500",
    entry: "FREE",
    slots: "10 / 16",
  },
  {
    id: 9,
    title: "1v1 Knockout",
    prize: "₹250",
    entry: "FREE",
    slots: "14 / 16",
  },
];

const freeEntry = [
  battleRoyale[0],
  battleRoyale[2],
  clashSquad[0],
  clashSquad[2],
  loneWolf[0],
];

const paidEntry = [
  battleRoyale[1],
  battleRoyale[3],
  clashSquad[1],
];

const highPrize = [
  battleRoyale[0],
  battleRoyale[3],
  clashSquad[0],
];

export default function Home() {
  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white">

      <Navbar />

      <FeaturedEvents />
      <RegisteredBanner />

      <TournamentRow
        title="🔥 Featured Battle Royale"
        tournaments={battleRoyale}
      />

      <TournamentRow
        title="⭐ Trending Now"
        tournaments={highPrize}
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

      <TournamentRow
        title="🎯 Lone Wolf"
        tournaments={loneWolf}
      />

      <Footer />

    </main>
  );
}