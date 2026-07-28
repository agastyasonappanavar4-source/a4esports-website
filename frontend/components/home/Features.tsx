import { ShieldCheck, Zap, Trophy, Clock } from "lucide-react";
import { Reveal } from "@/components/ui/Reveal";

export default function Features() {
  const features = [
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

  return (
    <section className="border-b border-border bg-panel-2 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <Reveal>
          <div className="mb-12 flex items-center gap-3">
            <span className="h-px w-8 bg-ember" />
            <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
              Why Players Choose Us
            </span>
          </div>
        </Reveal>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <Reveal key={feature.title} delay={index * 100}>
                <div className="group flex items-start gap-4 rounded-xl border border-border/60 bg-panel/60 p-5 transition-all duration-200 hover:border-cyan/50 hover:bg-panel/90 h-full">
                  <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-cyan/30 bg-cyan/10 text-cyan transition-transform group-hover:scale-105">
                    <Icon size={22} />
                  </div>
                  <div>
                    <h3 className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                      {feature.title}
                    </h3>
                    <p className="mt-1 font-mono text-xs text-muted-foreground leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </div>
    </section>
  );
}