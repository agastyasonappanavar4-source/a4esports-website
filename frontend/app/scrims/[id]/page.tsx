import { Trophy, Users, Calendar, Clock } from "lucide-react";
import Link from "next/link";

export default function TournamentPage() {
  return (
    <main className="min-h-screen bg-gray-100">

      {/* Banner */}

      <div className="relative flex h-112.5 w-full items-end bg-linear-to-r from-orange-600 via-red-600 to-purple-700">
   <div className="absolute inset-0 bg-black/35" />

<div className="relative mx-auto flex w-full max-w-7xl items-end justify-between p-10 text-white">

  <div>

    <span className="rounded-full bg-red-600 px-4 py-2 text-sm font-bold">

      🔴 LIVE NOW

    </span>

    <h1 className="mt-6 text-6xl font-black">

      WEEKLY BR

    </h1>

    <h2 className="text-4xl font-bold">

      CHAMPIONSHIP

    </h2>

    <div className="mt-6 flex gap-3">

      <span className="rounded-full bg-orange-500 px-4 py-2 font-bold">

        ₹10,000

      </span>

      <span className="rounded-full bg-green-600 px-4 py-2 font-bold">

        FREE ENTRY

      </span>

    </div>

  </div>

</div>

      </div>

      <div className="mx-auto max-w-7xl p-8">

        <div className="grid gap-8 lg:grid-cols-3">

          {/* Left */}

          <div className="lg:col-span-2">

           <div className="flex flex-wrap items-center gap-3">

  <h1 className="text-5xl font-black">
    Weekly BR Championship
  </h1>

  <span className="rounded-full bg-red-500 px-4 py-2 text-sm font-bold text-white animate-pulse">

    🔴 LIVE

  </span>

</div>
            <div className="mt-6 flex flex-wrap gap-3">

  <span className="rounded-full bg-orange-100 px-4 py-2 font-bold text-orange-600">

    ₹10,000 Prize Pool

  </span>

  <span className="rounded-full bg-green-100 px-4 py-2 font-bold text-green-600">

    FREE ENTRY

  </span>

  <span className="rounded-full bg-blue-100 px-4 py-2 font-bold text-blue-600">

    Battle Royale

  </span>

</div>

<p className="mt-6 text-lg text-gray-600">
              India&apos;s biggest weekly Battle Royale custom room.
              Compete against top teams and win exciting cash prizes.
            </p>

            <div className="mt-8 rounded-3xl bg-white p-8 shadow">

              <h2 className="mb-6 text-3xl font-bold">
                Tournament Rules
              </h2>

              <ul className="space-y-4 text-gray-700">

                <li>✅ Emulator Players Not Allowed</li>

                <li>✅ Hacks = Permanent Ban</li>

                <li>✅ Room ID released 15 minutes before match</li>

                <li>✅ Be online before match starts</li>

                <li>✅ No teaming</li>

                <li>✅ Respect organizers</li>

                <li>✅ Internet issues are player&apos;s responsibility</li>

                <li>✅ Organizer decision is final</li>

              </ul>

                        </div>

            {/* Registered Teams */}

            <div className="mt-8 rounded-3xl bg-white p-8 shadow">

              <h2 className="mb-6 text-3xl font-bold">

                Registered Teams

              </h2>

              <div className="space-y-3">

                {[
                  "Team Alpha",
                  "Team Demon",
                  "Team Titan",
                  "Team Hydra",
                  "Team Inferno",
                  "Team Ghost",
                  "Team Phoenix",
                ].map((team) => (

                  <div
                    key={team}
                    className="flex items-center justify-between rounded-xl border p-4"
                  >

                    <span>{team}</span>

                    <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-bold text-green-600">

                      Registered

                    </span>

                  </div>

                ))}

              </div>

            </div>

          </div>

          {/* Right */}
          <div className="mt-8 rounded-3xl bg-white p-8 shadow">

  <h2 className="mb-6 text-3xl font-bold">

    Frequently Asked Questions

  </h2>

  <div className="space-y-5">

    <div>

      <h3 className="font-bold">

        When will Room ID be released?

      </h3>

      <p className="mt-2 text-gray-600">

        15 minutes before the match starts.

      </p>

    </div>

    <div>

      <h3 className="font-bold">

        Are emulator players allowed?

      </h3>

      <p className="mt-2 text-gray-600">

        No.

      </p>

    </div>

    <div>

      <h3 className="font-bold">

        Refund available?

      </h3>

      <p className="mt-2 text-gray-600">

        No refund after successful registration.

      </p>

    </div>

  </div>

</div>
          <div>

            <div className="rounded-3xl bg-white p-6 shadow-lg">

              <h2 className="mb-6 text-2xl font-bold">
                Tournament Info
              </h2>

              <div className="space-y-5">

                <div className="flex items-center gap-3">

                  <Trophy />

                  ₹10,000 Prize Pool

                </div>

                <div className="flex items-center gap-3">

                  <Users />

                  32 / 48 Teams

                </div>

                <div className="flex items-center gap-3">

                  <Calendar />

                  28 July 2026

                </div>

                <div className="flex items-center gap-3">

                  <Clock />

                  9:00 PM

                </div>

              </div>

        <Link
  href="/payment"
  className="mt-8 block w-full rounded-2xl bg-orange-500 py-4 text-center text-lg font-bold text-white transition hover:scale-[1.02] hover:bg-orange-600 active:scale-95"
>
  Register Now
</Link>

<div className="mt-6 rounded-2xl border border-orange-200 bg-orange-50 p-4">

  <p className="text-sm font-semibold text-orange-600">
    Registration Ends In
  </p>

  <h3 className="mt-2 text-3xl font-black text-gray-900">
    02d 11h 42m
  </h3>

</div>

<div className="mt-6 rounded-2xl border bg-gray-50 p-4">

  <h3 className="mb-3 font-bold">
    Prize Distribution
  </h3>

  <div className="space-y-2">

    <div className="flex justify-between">

      <span>🥇 1st</span>

      <span>₹6000</span>

    </div>

    <div className="flex justify-between">

      <span>🥈 2nd</span>

      <span>₹2500</span>

    </div>

    <div className="flex justify-between">

      <span>🥉 3rd</span>

      <span>₹1500</span>

    </div>

  </div>

</div>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}