"use client";

import TournamentCard from "./TournamentCard";
import { Reveal } from "@/components/ui/Reveal";

interface Tournament {
  id: number;
  title: string;
  mode: string;
  fee: number;
  maxTeams: number;
  date: string;
  prizePool?: string;
  image?: string;
}

interface TournamentRowProps {
  title: string;
  tournaments: Tournament[];
  anchorId?: string;
}

export default function TournamentRow({ title, tournaments, anchorId }: TournamentRowProps) {
  return (
    <section id={anchorId} className="mx-auto mt-12 max-w-7xl scroll-mt-24 px-4 sm:px-6">
      <Reveal>
        <div className="mb-5 flex items-center justify-between border-b border-border/80 pb-3">
          <h2 className="font-display text-xl sm:text-2xl font-bold uppercase tracking-wide text-foreground">
            {title}
          </h2>
          <span className="font-mono text-xs text-muted-foreground">
            {tournaments.length} Available
          </span>
        </div>
      </Reveal>

      {tournaments.length === 0 ? (
        <p className="rounded-xl border border-dashed border-border/70 bg-panel/30 py-8 text-center font-mono text-sm text-muted-foreground">
          No tournaments in this category yet — check back soon.
        </p>
      ) : (
        <div className="flex gap-4 sm:gap-6 overflow-x-auto pb-4 scrollbar-hide">
          {tournaments.map((tournament, index) => (
            <Reveal key={tournament.id} delay={index * 80} className="shrink-0 w-[280px] sm:w-[320px]">
              <TournamentCard
                id={tournament.id}
                title={tournament.title}
                mode={tournament.mode}
                fee={tournament.fee}
                maxTeams={tournament.maxTeams}
                date={tournament.date}
                prizePool={tournament.prizePool}
                image={tournament.image}
              />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}