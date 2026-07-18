"use client";

import { useRouter } from "next/navigation";
import { ArrowLeft, Camera } from "lucide-react";

export default function CompleteProfile() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-50 p-6">

      <div className="w-full max-w-xl rounded-3xl bg-white p-8 shadow-2xl">

        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-500"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <h1 className="text-center text-4xl font-black">
          Complete Profile
        </h1>

        <p className="mt-3 text-center text-gray-500">
          Finish your profile before joining tournaments.
        </p>

        <div className="mt-10 flex justify-center">

          <button className="flex h-32 w-32 items-center justify-center rounded-full border-4 border-dashed border-orange-300 bg-orange-50 transition hover:bg-orange-100">

            <Camera size={38} className="text-orange-500" />

          </button>

        </div>

        <div className="mt-10 space-y-6">

          <div>

            <label className="mb-2 block font-semibold">
              In Game Name
            </label>

            <input
              placeholder="Enter IGN"
              className="w-full rounded-2xl border p-4 outline-none focus:border-orange-500"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Free Fire UID
            </label>

            <input
              placeholder="Enter UID"
              className="w-full rounded-2xl border p-4 outline-none focus:border-orange-500"
            />

          </div>

          <div>

            <label className="mb-2 block font-semibold">
              Region
            </label>

            <select className="w-full rounded-2xl border p-4 outline-none focus:border-orange-500">

              <option>India</option>
              <option>Bangladesh</option>
              <option>Nepal</option>
              <option>Sri Lanka</option>

            </select>

          </div>

          <button
            onClick={() => router.push("/")}
            className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
          >
            Save & Continue
          </button>

        </div>

      </div>

    </main>
  );
}