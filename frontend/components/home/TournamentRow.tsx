"use client";

import TournamentCard from "./TournamentCard";
import { Reveal } from "@/components/ui/Reveal";
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
  anchorId?: string;
}

export default function TournamentRow({ title, tournaments, anchorId }: TournamentRowProps) {
  return (
    <section id={anchorId} className="mx-auto mt-14 max-w-7xl scroll-mt-32 px-5">
      <Reveal>
        <div className="mb-6 flex items-center justify-between border-b border-border pb-4">
          <h2 className="font-display text-2xl font-bold uppercase tracking-wide text-foreground">
            {title}
          </h2>
          <button className="flex items-center gap-1 font-mono text-xs uppercase tracking-widest text-cyan transition hover:text-ember">
            View All
            <ChevronRight size={16} />
          </button>
        </div>
      </Reveal>

      {tournaments.length === 0 ? (
        <p className="border border-dashed border-border py-10 text-center font-mono text-sm text-muted-foreground">
          No tournaments in this category yet — check back soon.
        </p>
      ) : (
        <div className="flex gap-6 overflow-x-auto pb-5 scrollbar-hide">
          {tournaments.map((tournament, index) => (
            <Reveal key={tournament.id} delay={index * 90} className="shrink-0">
              <TournamentCard
                id={tournament.id}
                title={tournament.title}
                mode={tournament.mode}
                fee={tournament.fee}
                maxTeams={tournament.maxTeams}
                date={tournament.date}
              />
            </Reveal>
          ))}
        </div>
      )}
    </section>
  );
}