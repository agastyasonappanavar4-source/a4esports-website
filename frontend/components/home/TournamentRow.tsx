"use client";

import TournamentCard from "./TournamentCard";
import { ChevronRight } from "lucide-react";

interface Tournament {
  id: number;
  title: string;
  mode: string;
  fee: number;
  maxTeams: number;
  date: string;
}

interface TournamentRowProps {
  title: string;
  tournaments: Tournament[];
}

export default function TournamentRow({
  title,
  tournaments,
}: TournamentRowProps) {
  const sectionId =
    title === "🔥 Featured Battle Royale" ? "scrims" : undefined;

  return (
    <section
      id={sectionId}
      className="mx-auto mt-12 max-w-7xl scroll-mt-24 px-5"
    >
      <div className="mb-6 flex items-center justify-between">
        <h2 className="text-3xl font-black">
          {title === "🔥 Featured Battle Royale"
            ? "🎮 Available Scrims"
            : title}
        </h2>

        <button className="flex items-center gap-2 rounded-xl px-4 py-2 text-orange-500 transition hover:bg-orange-50">
          View All
          <ChevronRight size={18} />
        </button>
      </div>

      <div className="flex gap-6 overflow-x-auto pb-5 scrollbar-hide">
        {tournaments.map((tournament) => (
          <TournamentCard
            key={tournament.id}
            id={tournament.id}
            title={tournament.title}
            mode={tournament.mode}
            fee={tournament.fee}
            maxTeams={tournament.maxTeams}
            date={tournament.date}
          />
        ))}
      </div>
    </section>
  );
}