import { Trophy, ShieldCheck, Clock } from "lucide-react";
import { CornerFrame } from "@/components/ui/CornerFrame";

export default function Features() {
  const features = [
    {
      icon: Trophy,
      title: "Daily Scrims",
      description: "Compete in free and paid scrims every day.",
    },
    {
      icon: ShieldCheck,
      title: "Fair Play",
      description: "Verified rooms with proper tournament management.",
    },
    {
      icon: Clock,
      title: "Instant Updates",
      description: "Room IDs and results published on time.",
    },
  ];

  return (
    <section className="border-b border-border bg-void py-20">
      <div className="mx-auto max-w-6xl px-6">
        <div className="mb-12 flex items-center gap-3">
          <span className="h-px w-8 bg-ember" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
            Why Players Choose Us
          </span>
        </div>

        <div className="grid gap-6 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="group relative border border-border bg-panel p-8"
              >
                <CornerFrame tone="cyan" />
                <Icon className="mb-5 h-8 w-8 text-ember" />
                <h3 className="mb-2 font-display text-xl font-bold uppercase tracking-wide text-foreground">
                  {feature.title}
                </h3>
                <p className="font-mono text-sm text-muted-foreground">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}