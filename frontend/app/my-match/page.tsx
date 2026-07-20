"use client";

import {
  Trophy,
  Calendar,
  Clock,
  Users,
  MapPinned,
  ShieldCheck,
  Copy,
  MessageCircle,
  ArrowLeft,
} from "lucide-react";
import { useRouter } from "next/navigation";

const teams = [
  "Team Alpha",
  "Team Demon",
  "Team Titan",
  "Team Hydra",
  "Team Ghost",
  "Team Phoenix",
  "Team Venom",
  "Team Cobra",
  "Team Killer",
  "Team Shadow",
  "Team Legend",
  "Team X",
  "Team Spartan",
  "Team Nova",
  "Team Warrior",
  "Team Hunter",
  "Team Inferno",
  "Team Bullet",
  "Team Mafia",
  "Team God",
  "Team Blaze",
  "Team Storm",
  "YOUR TEAM ⭐",
  "Team Dragon",
  "Team Zero",
  "Team Sniper",
  "Team Wolf",
  "Team Dark",
  "Team Fear",
  "Team AlphaX",
];

export default function MyMatch() {
  const router = useRouter();

  return (
    <main className="min-h-screen bg-gray-100">
      <div className="mx-auto max-w-7xl p-8">

        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 rounded-xl border bg-white px-5 py-3 shadow"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="rounded-3xl bg-gradient-to-r from-orange-500 via-red-500 to-purple-700 p-8 text-white shadow-xl">

          <span className="rounded-full bg-white/20 px-4 py-2 text-sm font-bold">
            REGISTERED
          </span>

          <h1 className="mt-5 text-5xl font-black">
            Weekly BR Championship
          </h1>

          <p className="mt-3 text-lg text-white/90">
            You're successfully registered for this tournament.
          </p>

        </div>

        <div className="mt-8 grid gap-8 lg:grid-cols-3">

          <div className="space-y-8 lg:col-span-2">

            <div className="rounded-3xl bg-white p-7 shadow">

              <h2 className="mb-6 text-2xl font-bold">
                Match Information
              </h2>

              <div className="grid gap-5 md:grid-cols-2">

                <div className="flex items-center gap-3">
                  <Calendar />
                  28 July 2026
                </div>

                <div className="flex items-center gap-3">
                  <Clock />
                  9:00 PM
                </div>

                <div className="flex items-center gap-3">
                  <MapPinned />
                  Bermuda
                </div>

                <div className="flex items-center gap-3">
                  <Trophy />
                  ₹10,000 Prize Pool
                </div>

              </div>

            </div>

            <div className="rounded-3xl bg-white p-7 shadow">

              <h2 className="mb-6 text-2xl font-bold">
                Registered Teams
              </h2>

              <div className="grid gap-3 md:grid-cols-2">

                {teams.map((team, index) => (
                  <div
                    key={team}
                    className={`rounded-xl border p-4 ${
                      team.includes("YOUR")
                        ? "border-orange-500 bg-orange-50"
                        : ""
                    }`}
                  >
                    #{index + 1} {team}
                  </div>
                ))}

              </div>

            </div>

            <div className="rounded-3xl bg-white p-7 shadow">

              <h2 className="mb-6 text-2xl font-bold">
                Tournament Rules
              </h2>

              <ul className="space-y-3">
                <li>✅ No Emulator</li>
                <li>✅ No Hacks</li>
                <li>✅ No Teaming</li>
                <li>✅ Respect Organizers</li>
                <li>✅ Room ID released 15 minutes before match</li>
              </ul>

            </div>

          </div>

          <div className="space-y-6">

            <div className="rounded-3xl bg-white p-7 shadow">

              <h2 className="text-2xl font-bold">
                Countdown
              </h2>

              <h1 className="mt-5 text-center text-5xl font-black text-orange-500">
                02d 11h
              </h1>

            </div>

            <div className="rounded-3xl bg-white p-7 shadow">

              <h2 className="mb-5 text-2xl font-bold">
                Your Registration
              </h2>

              <div className="space-y-4">

                <div className="flex justify-between">
                  <span>ID</span>
                  <span>FF20481</span>
                </div>

                <div className="flex justify-between">
                  <span>Your Slot</span>
                  <span>23</span>
                </div>

                <div className="flex justify-between">
                  <span>Status</span>
                  <span className="font-bold text-green-600">
                    Registered
                  </span>
                </div>

              </div>

            </div>

            <div className="rounded-3xl bg-white p-7 shadow">

              <h2 className="mb-5 text-2xl font-bold">
                Room Details
              </h2>

              <div className="space-y-5">

                <div>

                  <p className="text-sm text-gray-500">
                    Room ID
                  </p>

                  <div className="mt-2 flex items-center justify-between rounded-xl border p-3">
                    Not Released Yet
                    <Copy size={18} />
                  </div>

                </div>

                <div>

                  <p className="text-sm text-gray-500">
                    Password
                  </p>

                  <div className="mt-2 flex items-center justify-between rounded-xl border p-3">
                    Not Released Yet
                    <Copy size={18} />
                  </div>

                </div>

              </div>

            </div>

            <div className="rounded-3xl bg-white p-7 shadow">

              <h2 className="mb-5 text-2xl font-bold">
                Contact Organizer
              </h2>

              <button className="mb-3 flex w-full items-center justify-center gap-3 rounded-xl bg-green-500 py-3 font-bold text-white">
                <MessageCircle />
                WhatsApp
              </button>

              <button className="flex w-full items-center justify-center gap-3 rounded-xl bg-orange-500 py-3 font-bold text-white">
                <ShieldCheck />
                Contact Admin
              </button>

            </div>

          </div>

        </div>

      </div>
    </main>
  );
}