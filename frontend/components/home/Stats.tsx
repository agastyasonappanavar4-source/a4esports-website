"use client";

import { ShieldCheck, Zap, Trophy, Clock } from "lucide-react";

const highlights = [
  {
    icon: ShieldCheck,
    title: "Verified Scrims",
    description: "Strict anti-cheat monitoring & fair play enforcement",
  },
  {
    icon: Clock,
    title: "Instant Room Details",
    description: "Automated Room ID & Password released 15 mins prior",
  },
  {
    icon: Trophy,
    title: "Guaranteed Payouts",
    description: "Direct reward distributions within 24 hours of match end",
  },
  {
    icon: Zap,
    title: "Seamless Registration",
    description: "1-click slot reservation with instant team confirmation",
  },
];

export default function Stats() {
  return (
    <section className="border-y border-border/80 bg-panel/60 py-10">
      <div className="mx-auto max-w-7xl px-4 sm:px-6">
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {highlights.map((item) => {
            const Icon = item.icon;
            return (
              <div
                key={item.title}
                className="group flex items-start gap-4 rounded-xl border border-border/60 bg-panel-2/40 p-4 transition-all duration-200 hover:border-cyan/50 hover:bg-panel-2/80"
              >
                <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan transition-transform group-hover:scale-105">
                  <Icon size={22} />
                </div>
                <div>
                  <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                    {item.title}
                  </h3>
                  <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
                    {item.description}
                  </p>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}