import { Button } from "@/components/ui/button";

export default function Hero() {
  return (
    <section className="flex min-h-[90vh] items-center justify-center bg-linear-to-b from-black via-zinc-950 to-black px-6">
      <div className="mx-auto max-w-4xl text-center">
        <p className="mb-4 text-yellow-500 font-semibold uppercase tracking-widest">
          India&#39;s #1 Free Fire Scrims Platform


        </p>

        <h1 className="text-5xl md:text-7xl font-extrabold text-white leading-tight">
          Play.
          <br />
          Compete.
          <br />
          Win.
        </h1>

        <p className="mt-8 text-lg text-zinc-400">
          Join daily custom rooms, paid tournaments, and competitive scrims.
          Built for serious Free Fire players.
        </p>

        <div className="mt-10 flex flex-col justify-center gap-4 sm:flex-row">
          <Button size="lg">
            Join Free Scrims
          </Button>

          <Button variant="outline" size="lg">
            View Tournaments
          </Button>
        </div>
      </div>
    </section>
  );
}