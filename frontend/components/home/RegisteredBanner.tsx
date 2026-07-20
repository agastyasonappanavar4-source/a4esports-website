"use client";

import Link from "next/link";
import { Clock3, ArrowRight } from "lucide-react";

export default function RegisteredBanner() {
  return (
    <section className="mx-auto mt-8 max-w-7xl px-5">

      <div className="flex flex-col items-start justify-between gap-5 rounded-3xl border border-orange-200 bg-gradient-to-r from-orange-500 via-orange-400 to-red-500 p-6 text-white shadow-xl md:flex-row md:items-center">

        <div>

          <p className="text-sm font-semibold uppercase tracking-wider">
            🔥 Registered Tournament
          </p>

          <h2 className="mt-2 text-3xl font-black">
            Weekly BR Championship
          </h2>

          <div className="mt-4 flex items-center gap-2 text-orange-100">

            <Clock3 size={18} />

            Starts In: <span className="font-bold">02d 11h 42m</span>

          </div>

        </div>

        <Link
          href="/my-match"
          className="rounded-2xl bg-white px-6 py-4 font-bold text-orange-600 transition hover:scale-105"
        >
          Know More
          <ArrowRight className="ml-2 inline" size={18} />
        </Link>

      </div>

    </section>
  );
}