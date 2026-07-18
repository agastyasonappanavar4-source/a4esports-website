"use client";

import Link from "next/link";
import { Trophy, Users, IndianRupee, Clock3 } from "lucide-react";

interface TournamentCardProps {
  id: number;
  title: string;
  prize: string;
  entry: string;
  slots: string;
}

export default function TournamentCard({
  id,
  title,
  prize,
  entry,
  slots,
}: TournamentCardProps) {
  return (
    <Link href={`/scrims/${id}`}>

      <div className="group min-w-[310px] overflow-hidden rounded-3xl bg-white shadow-md transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl">

        <div className="relative h-48 overflow-hidden bg-gradient-to-br from-orange-500 via-red-500 to-purple-700">

          <div className="absolute inset-0 bg-black/20" />

          <div className="absolute left-5 top-5 rounded-full bg-red-500 px-3 py-1 text-xs font-bold text-white animate-pulse">
            🔴 LIVE
          </div>

          <div className="absolute bottom-5 left-5">

            <h2 className="text-3xl font-black text-white">
              {title}
            </h2>

            <p className="mt-2 text-white/80">
              Battle Royale Tournament
            </p>

          </div>

        </div>

        <div className="space-y-5 p-5">

          <div className="grid grid-cols-2 gap-3">

            <div className="rounded-2xl bg-orange-50 p-3">

              <div className="flex items-center gap-2">

                <Trophy size={18} className="text-yellow-500" />

                <span className="text-sm text-gray-500">
                  Prize Pool
                </span>

              </div>

              <p className="mt-2 font-bold">
                {prize}
              </p>

            </div>

            <div className="rounded-2xl bg-green-50 p-3">

              <div className="flex items-center gap-2">

                <IndianRupee size={18} className="text-green-600" />

                <span className="text-sm text-gray-500">
                  Entry
                </span>

              </div>

              <p className="mt-2 font-bold">
                {entry}
              </p>

            </div>

          </div>

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-2">

              <Users size={18} className="text-blue-500" />

              <span>{slots}</span>

            </div>

            <div className="flex items-center gap-2 text-orange-500">

              <Clock3 size={18} />

              Tonight

            </div>

          </div>

          <div>

            <div className="mb-2 flex justify-between text-sm">

              <span>Slots Filled</span>

              <span>{slots}</span>

            </div>

            <div className="h-2 overflow-hidden rounded-full bg-gray-200">

              <div className="h-full w-2/3 rounded-full bg-orange-500" />

            </div>

          </div>

          <button
            onClick={(e) => e.preventDefault()}
            className="w-full rounded-2xl bg-orange-500 py-3 font-bold text-white transition hover:bg-orange-600"
          >
            View Tournament
          </button>

        </div>

      </div>

    </Link>
  );
}