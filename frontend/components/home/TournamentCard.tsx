"use client";

import Link from "next/link";
import { Trophy, Users, IndianRupee, Clock3, ArrowRight } from "lucide-react";
import { CornerFrame } from "@/components/ui/CornerFrame";

interface TournamentCardProps {
  id: number;
  title: string;
  fee: number;
  maxTeams: number;
  mode: string;
  date: string;
  prizePool?: string;
  image?: string;
}

export default function TournamentCard({
  id,
  title,
  fee,
  maxTeams,
  mode,
  date,
  prizePool = "TBD",
  image,
}: TournamentCardProps) {
  const entry = fee === 0 ? "FREE" : `₹${fee}`;

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link href={`/scrims/${id}`} className="cursor-pointer block">
      <div className="btn-press group relative w-full rounded-xl border border-border bg-panel overflow-hidden transition-all duration-300 hover:-translate-y-1 hover:border-cyan/50 hover:shadow-lg hover:shadow-cyan/10">
        <CornerFrame tone="cyan" />

        {/* Banner / Poster */}
        <div className="relative h-48 w-full overflow-hidden bg-void">
          {image ? (
            <img
              src={image}
              alt={title}
              className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          ) : (
            <div className="h-full w-full bg-tactical-grid bg-void" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/40 to-transparent" />

          <div className="absolute left-3 top-3 flex items-center gap-1.5 rounded-full border border-cyan/40 bg-void/80 px-3 py-1 font-mono text-[10px] uppercase tracking-widest text-cyan backdrop-blur-md">
            <span className="h-2 w-2 rounded-full bg-cyan animate-pulse-dot" />
            Live Scrim
          </div>

          <div className="absolute bottom-3 left-4 right-4">
            <h2 className="font-display text-xl font-bold uppercase leading-tight text-foreground drop-shadow-md">
              {title}
            </h2>
            <p className="mt-0.5 font-mono text-xs font-semibold uppercase tracking-wider text-cyan">
              {mode} Mode
            </p>
          </div>
        </div>

        {/* Card Content */}
        <div className="space-y-4 p-4">
          <div className="grid grid-cols-2 gap-2.5">
            <div className="rounded-lg border border-border/80 bg-panel-2/60 p-2.5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <Trophy size={14} className="text-amber-400" />
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  Prize Pool
                </span>
              </div>
              <p className="mt-1 font-mono text-sm font-bold text-amber-400 truncate">
                {prizePool}
              </p>
            </div>

            <div className="rounded-lg border border-border/80 bg-panel-2/60 p-2.5">
              <div className="flex items-center gap-1.5 text-muted-foreground">
                <IndianRupee size={14} className="text-cyan" />
                <span className="font-mono text-[10px] uppercase tracking-wider">
                  Entry
                </span>
              </div>
              <p className="mt-1 font-mono text-sm font-bold text-foreground">
                {entry}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-xs text-muted-foreground">
            <div className="flex items-center gap-1.5">
              <Users size={14} className="text-cyan" />
              <span>{maxTeams} Teams</span>
            </div>
            <div className="flex items-center gap-1.5">
              <Clock3 size={14} className="text-amber-400" />
              <span>{formattedDate}</span>
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-2 rounded-lg border border-cyan/40 bg-cyan/10 py-2.5 font-display text-xs font-bold uppercase tracking-wider text-cyan transition-all duration-300 group-hover:bg-cyan group-hover:text-void">
            Register Now
            <ArrowRight
              size={15}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}