"use client";

import Link from "next/link";
import { ArrowLeft } from "lucide-react";
import { useRouter } from "next/navigation";

export default function VerifyPage() {
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

        <div className="text-center">

          <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-orange-100 text-4xl">
            📲
          </div>

          <h1 className="text-3xl font-black">
            Verify OTP
          </h1>

          <p className="mt-3 text-gray-500">
            We've sent a 6-digit verification code to your mobile number.
          </p>

        </div>

        <input
          type="text"
          maxLength={6}
          placeholder="123456"
          className="mt-10 w-full rounded-2xl border p-5 text-center text-3xl tracking-[12px] outline-none transition focus:border-orange-500"
        />

        <button className="mt-8 w-full rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white transition hover:bg-orange-600">
          Verify & Continue
        </button>

        <button className="mt-4 w-full rounded-2xl border py-4 font-semibold transition hover:bg-gray-100">
          Resend OTP
        </button>

        <Link
          href="/login"
          className="mt-6 block text-center font-semibold text-orange-500"
        >
          Change Mobile Number
        </Link>

      </div>

    </main>
  );
}