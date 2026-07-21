"use client";

import { CheckCircle2, Trophy, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentSuccessPage() {
  const router = useRouter();

  return (
    <main className="flex min-h-screen items-center justify-center bg-linear-to-br from-green-50 via-white to-orange-50 p-6">

      <div className="w-full max-w-xl rounded-3xl bg-white p-10 text-center shadow-2xl">

        <CheckCircle2
          size={90}
          className="mx-auto text-green-500 animate-bounce"
        />

        <h1 className="mt-6 text-4xl font-black">
          Registration Successful!
        </h1>

        <p className="mt-4 text-lg text-gray-600">
          Your payment has been received successfully.
        </p>

        <div className="mt-8 rounded-2xl bg-orange-50 p-6">

          <div className="flex items-center justify-center gap-3">

            <Trophy className="text-orange-500" />

            <h2 className="text-2xl font-bold">
              Weekly BR Championship
            </h2>

          </div>

          <div className="mt-6 space-y-3 text-left">

            <div className="flex justify-between">
              <span>Registration ID</span>
              <span className="font-bold">
                FF-20481
              </span>
            </div>

            <div className="flex justify-between">
              <span>Status</span>
              <span className="font-bold text-green-600">
                Confirmed
              </span>
            </div>

            <div className="flex justify-between">
              <span>Slot</span>
              <span className="font-bold">
                23 / 48
              </span>
            </div>

            <div className="flex justify-between">
              <span>Room ID</span>
              <span className="text-gray-500">
                Available 15 min before match
              </span>
            </div>

          </div>

        </div>

        <div className="mt-8 rounded-2xl border border-orange-200 bg-orange-50 p-5">

          <h3 className="font-bold text-orange-600">
            What's Next?
          </h3>

          <p className="mt-3 text-gray-700">
            You'll now see your registered tournament on the Home page.
            When the organizer releases the Room ID, it will automatically
            appear in your match details.
          </p>

        </div>

        <button
          onClick={() => router.push("/")}
          className="mt-8 w-full rounded-2xl bg-orange-500 py-4 text-lg font-bold text-white transition hover:bg-orange-600"
        >
          Go To Home
          <ArrowRight className="ml-2 inline" size={20} />
        </button>

      </div>

    </main>
  );
}