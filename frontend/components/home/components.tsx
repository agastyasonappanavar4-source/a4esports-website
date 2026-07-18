"use client";

import { Button } from "@/components/ui/button";

export default function FeaturedEvents() {
  return (
    <section className="mx-auto mt-8 max-w-7xl px-5">

      <div className="mb-4 flex items-center justify-between">

        <div>

          <h2 className="text-3xl font-bold text-gray-800">
            🔥 Featured Tournament
          </h2>

          <p className="text-gray-500">
            Don't miss this week's biggest event
          </p>

        </div>

      </div>

      <div className="overflow-hidden rounded-3xl bg-white shadow-lg">

        <div className="grid lg:grid-cols-2">

          {/* LEFT */}

          <div className="flex flex-col justify-center p-10">

            <span className="mb-4 w-fit rounded-full bg-orange-100 px-4 py-2 text-sm font-semibold text-orange-600">
              Registration Open
            </span>

            <h1 className="text-5xl font-black text-gray-900">
              WEEKLY BR
              <br />
              CHAMPIONSHIP
            </h1>

            <p className="mt-5 text-gray-600">
              Squad Battle Royale tournament.
              48 Teams.
              Free Entry.
              ₹5000 Prize Pool.
            </p>

            <div className="mt-8 flex gap-4">

              <Button>
                Join Now
              </Button>

              <Button variant="outline">
                View Details
              </Button>

            </div>

          </div>

          {/* RIGHT */}

          <div className="flex items-center justify-center bg-gray-100">

            <div className="flex h-[420px] w-full items-center justify-center border-2 border-dashed border-gray-400 text-gray-500">

              Tournament Poster
              <br />
              (Replace Later)

            </div>

          </div>

        </div>

      </div>

    </section>
  );
}