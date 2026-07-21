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
}

export default function TournamentCard({
  id,
  title,
  fee,
  maxTeams,
  mode,
  date,
}: TournamentCardProps) {
  const entry = fee === 0 ? "FREE" : `₹${fee}`;

  const formattedDate = new Date(date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  return (
    <Link href={`/scrims/${id}`} className="cursor-pointer">
      <div className="group relative min-w-77.5 border border-border bg-panel transition-all duration-300 hover:-translate-y-1 hover:border-ember/50">
        <CornerFrame tone="ember" />

        {/* Banner */}
        <div className="relative h-44 overflow-hidden bg-void bg-tactical-grid">
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />

          <div className="absolute left-4 top-4 flex items-center gap-1.5 border border-ember/40 bg-void/80 px-2.5 py-1 font-mono text-[11px] uppercase tracking-widest text-ember">
            <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulse-dot" />
            Live
          </div>

          <div className="absolute bottom-4 left-4 right-4">
            <h2 className="font-display text-2xl font-bold uppercase leading-tight text-foreground">
              {title}
            </h2>
            <p className="mt-1 font-mono text-xs uppercase tracking-widest text-cyan">
              {mode}
            </p>
          </div>
        </div>

        {/* Card Content */}
        <div className="space-y-4 p-5">
          <div className="grid grid-cols-2 gap-3">
            <div className="border border-border bg-void/40 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <Trophy size={15} className="text-amber" />
                <span className="font-mono text-[11px] uppercase tracking-widest">
                  Prize Pool
                </span>
              </div>
              <p className="mt-2 font-mono font-semibold text-foreground">
                TBA
              </p>
            </div>

            <div className="border border-border bg-void/40 p-3">
              <div className="flex items-center gap-2 text-muted-foreground">
                <IndianRupee size={15} className="text-ember" />
                <span className="font-mono text-[11px] uppercase tracking-widest">
                  Entry
                </span>
              </div>
              <p className="mt-2 font-mono font-semibold text-foreground">
                {entry}
              </p>
            </div>
          </div>

          <div className="flex items-center justify-between font-mono text-sm text-muted-foreground">
            <div className="flex items-center gap-2">
              <Users size={15} className="text-cyan" />
              {maxTeams} Teams
            </div>
            <div className="flex items-center gap-2">
              <Clock3 size={15} className="text-ember" />
              {formattedDate}
            </div>
          </div>

          <div>
            <div className="mb-2 flex justify-between font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
              <span>Slots Filled</span>
              <span>{maxTeams}</span>
            </div>
            <div className="h-1.5 overflow-hidden bg-void">
              <div className="h-full w-2/3 bg-ember transition-all duration-500 group-hover:w-[70%]" />
            </div>
          </div>

          <div className="flex w-full items-center justify-center gap-2 border border-ember/40 bg-ember/10 py-3 font-display font-bold uppercase tracking-wide text-ember transition-all duration-300 group-hover:bg-ember group-hover:text-void">
            View Tournament
            <ArrowRight
              size={16}
              className="transition-transform duration-300 group-hover:translate-x-1"
            />
          </div>
        </div>
      </div>
    </Link>
  );
}