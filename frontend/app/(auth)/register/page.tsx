"use client";

import { useState } from "react";
import { ArrowLeft, Users, Phone, Shield } from "lucide-react";
import { useRouter } from "next/navigation";

export default function RegisterPage() {
  const router = useRouter();

  const [teamName, setTeamName] = useState("");
  const [iglName, setIglName] = useState("");
  const [phone, setPhone] = useState("");

  function continueRegistration() {
    router.push("/login");
  }

  return (
    <main className="min-h-screen bg-gradient-to-b from-gray-100 to-white">

      <div className="mx-auto max-w-2xl px-6 py-12">

        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 rounded-xl border bg-white px-5 py-3 shadow"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="rounded-3xl bg-white p-8 shadow-xl">

          <h1 className="text-4xl font-black">
            Tournament Registration
          </h1>

          <p className="mt-3 text-gray-500">
            Fill your team details before continuing.
          </p>

          <div className="mt-10 space-y-6">

            <div>

              <label className="mb-2 block font-semibold">
                Team Name
              </label>

              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter Team Name"
                className="w-full rounded-2xl border p-4 outline-none focus:border-orange-500"
              />

            </div>

            <div>

              <label className="mb-2 block font-semibold">
                IGL Name
              </label>

              <input
                value={iglName}
                onChange={(e) => setIglName(e.target.value)}
                placeholder="Enter IGL Name"
                className="w-full rounded-2xl border p-4 outline-none focus:border-orange-500"
              />

            </div>

            <div>

              <label className="mb-2 block font-semibold">
                Phone Number
              </label>

              <div className="flex items-center rounded-2xl border px-4">

                <Phone size={18} />

                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full p-4 outline-none"
                />

              </div>

            </div>

            <div className="rounded-2xl bg-orange-50 p-5">

              <div className="flex items-center gap-3">

                <Users className="text-orange-600" />

                <span className="font-semibold">
                  Max 4 Players Per Team
                </span>

              </div>

              <div className="mt-4 flex items-center gap-3">

                <Shield className="text-green-600" />

                <span>
                  Fair Play Rules Apply
                </span>

              </div>

            </div>

            <button
              onClick={continueRegistration}
              className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
            >
              Continue
            </button>

          </div>

        </div>

      </div>

    </main>
  );
}