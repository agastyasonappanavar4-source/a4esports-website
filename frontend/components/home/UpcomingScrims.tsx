import { Button } from "@/components/ui/button";

const scrims = [
  {
    title: "Solo Scrim",
    time: "Today • 8:00 PM",
    prize: "Free Entry",
  },
  {
    title: "Squad Clash",
    time: "Today • 9:30 PM",
    prize: "₹50 Entry",
  },
  {
    title: "Weekend Cup",
    time: "Sunday • 7:00 PM",
    prize: "₹500 Prize Pool",
  },
];

export default function UpcomingScrims() {
  return (
    <section className="bg-black py-20">
      <div className="mx-auto max-w-6xl px-6">
        <h2 className="mb-12 text-center text-4xl font-bold text-white">
          Upcoming Scrims
        </h2>

        <div className="grid gap-6 md:grid-cols-3">
          {scrims.map((scrim) => (
            <div
              key={scrim.title}
              className="rounded-xl border border-zinc-800 bg-zinc-950 p-6"
            >
              <h3 className="text-2xl font-bold text-white">
                {scrim.title}
              </h3>

              <p className="mt-3 text-zinc-400">{scrim.time}</p>

              <p className="mt-2 font-semibold text-yellow-500">
                {scrim.prize}
              </p>

              <Button className="mt-6 w-full">
                Register
              </Button>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}