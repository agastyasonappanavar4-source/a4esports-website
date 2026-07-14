import { Trophy, ShieldCheck, Clock } from "lucide-react";

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
    <section className="bg-zinc-950 py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center text-4xl font-bold text-white">
          Why Choose Us?
        </h2>

        <div className="grid gap-8 md:grid-cols-3">
          {features.map((feature) => {
            const Icon = feature.icon;

            return (
              <div
                key={feature.title}
                className="rounded-xl border border-zinc-800 bg-black p-8"
              >
                <Icon className="mb-5 h-10 w-10 text-yellow-500" />

                <h3 className="mb-3 text-2xl font-semibold text-white">
                  {feature.title}
                </h3>

                <p className="text-zinc-400">
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