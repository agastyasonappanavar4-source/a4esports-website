"use client";

import Link from "next/link";
import { ArrowLeft, Phone } from "lucide-react";
import { useRouter } from "next/navigation";

export default function LoginPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-orange-100 via-white to-orange-50 p-6">

      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-2xl">

        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 text-gray-600 hover:text-orange-500"
        >
          <ArrowLeft size={18} />
          Back
        </button>

        <div className="mb-8 text-center">

          <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-2xl bg-orange-100 text-4xl">
            🔐
          </div>

          <h1 className="text-3xl font-black">
            Login Required
          </h1>

          <p className="mt-3 text-gray-500">
            Login to continue your tournament registration.
          </p>

        </div>

        <label className="mb-2 block font-semibold">
          Mobile Number
        </label>

        <div className="mb-8 flex items-center overflow-hidden rounded-2xl border">

          <div className="flex items-center gap-2 bg-gray-100 px-4 py-4">

            <Phone size={18} />

            +91

          </div>

          <input
            type="tel"
            placeholder="9876543210"
            className="w-full px-4 py-4 outline-none"
          />

        </div>

        <Link href="/verify">

          <button className="w-full rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white transition hover:bg-orange-600">

            Send OTP

          </button>

        </Link>

        <p className="mt-6 text-center text-sm text-gray-500">

          By continuing you agree to our{" "}

          <Link href="/rules" className="font-semibold text-orange-500">

            Tournament Rules

          </Link>

        </p>

      </div>

    </main>
  );
}