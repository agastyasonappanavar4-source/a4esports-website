"use client";

import { useState } from "react";
import { ShieldCheck, Trophy, Users, CreditCard, QrCode } from "lucide-react";
import { useRouter } from "next/navigation";

export default function PaymentPage() {
  const router = useRouter();
  const [agree, setAgree] = useState(false);
  const handlePayment = async () => {
  try {
    const res = await fetch("http://localhost:5000/payment/create-order", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        scrimId: 1, // We'll make this dynamic later
      }),
    });

    const data = await res.json();

    if (!data.success) {
      alert("Unable to create payment order.");
      return;
    }

    if (!(window as any).Razorpay) {
      alert("Razorpay SDK not loaded.");
      return;
    }

    const options = {
      key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,

      amount: data.order.amount,

      currency: data.order.currency,

      name: "FF SCRIMS",

      description: data.scrim.title,

      order_id: data.order.id,

      prefill: {
        name: "Player",
        email: "",
        contact: "",
      },

      theme: {
        color: "#f97316",
      },

      handler: async function (response: any) {
        const verify = await fetch(
          "http://localhost:5000/payment/verify-payment",
          {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
            },
            body: JSON.stringify({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,

              registrationId: 1,
              amount: data.scrim.fee,
              method: "ONLINE",
            }),
          }
        );

        const result = await verify.json();

        if (result.success) {
          router.push("/payment/success");
        } else {
          alert("Payment verification failed.");
        }
      },
    };

    const payment = new (window as any).Razorpay(options);

    payment.open();

  } catch (err) {
    console.error(err);
    alert("Something went wrong.");
  }
};

  return (
    <main className="min-h-screen bg-gradient-to-b from-orange-50 to-white py-10">

      <div className="mx-auto max-w-6xl px-5">

        <h1 className="mb-2 text-4xl font-black">
          Confirm Registration
        </h1>

        <p className="text-gray-500">
          One final step before joining the tournament.
        </p>

        <div className="mt-10 grid gap-8 lg:grid-cols-3">

          {/* LEFT */}

          <div className="space-y-6 lg:col-span-2">

            <div className="rounded-3xl bg-white p-7 shadow">

              <h2 className="mb-6 text-2xl font-bold">
                Tournament Summary
              </h2>

              <div className="space-y-4">

                <div className="flex justify-between">
                  <span>Tournament</span>
                  <span className="font-bold">
                    Weekly BR Championship
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Date</span>
                  <span>28 July 2026</span>
                </div>

                <div className="flex justify-between">
                  <span>Time</span>
                  <span>9:00 PM</span>
                </div>

                <div className="flex justify-between">
                  <span>Prize Pool</span>
                  <span className="font-bold text-orange-600">
                    ₹10,000
                  </span>
                </div>

                <div className="flex justify-between">
                  <span>Entry Fee</span>
                  <span className="font-bold text-green-600">
                    ₹99
                  </span>
                </div>

              </div>

            </div>

            <div className="rounded-3xl bg-white p-7 shadow">

              <h2 className="mb-6 text-2xl font-bold">
                Final Rules
              </h2>

              <div className="h-72 overflow-y-auto rounded-2xl border p-5 text-gray-700">

                <p>• Emulator players are strictly prohibited.</p>
                <p className="mt-4">• Any kind of hack will result in a permanent ban.</p>
                <p className="mt-4">• Organizer's decision is final.</p>
                <p className="mt-4">• No teaming.</p>
                <p className="mt-4">• Room ID will be released 15 minutes before the match.</p>
                <p className="mt-4">• Internet issues are player's responsibility.</p>
                <p className="mt-4">• Refunds are not available after successful payment.</p>
                <p className="mt-4">• Offensive behaviour may result in disqualification.</p>

              </div>

              <label className="mt-6 flex cursor-pointer items-center gap-3">

                <input
                  type="checkbox"
                  checked={agree}
                  onChange={() => setAgree(!agree)}
                />

                <span>
                  I have read and agree to all tournament rules.
                </span>

              </label>

            </div>

          </div>

          {/* RIGHT */}

          <div>

            <div className="sticky top-24 rounded-3xl bg-white p-7 shadow-xl">

              <h2 className="text-2xl font-black">
                Payment
              </h2>

              <div className="mt-6 space-y-5">

                <div className="flex items-center gap-3">

                  <Trophy className="text-orange-500" />

                  ₹10,000 Prize Pool

                </div>

                <div className="flex items-center gap-3">

                  <Users className="text-blue-500" />

                  32 / 48 Teams

                </div>

                <div className="flex items-center gap-3">

                  <ShieldCheck className="text-green-500" />

                  Secure Payment

                </div>

              </div>

              <div className="mt-8 rounded-2xl bg-orange-50 p-5 text-center">

                <QrCode className="mx-auto mb-3 h-12 w-12 text-orange-500" />

                <p className="font-semibold">
                  Razorpay / UPI QR
                </p>

                <p className="mt-2 text-sm text-gray-500">
                  QR Code will appear here.
                </p>

              </div>

             <button
  disabled={!agree}
  onClick={handlePayment}
                
                className={`mt-8 w-full rounded-2xl py-4 text-lg font-bold text-white transition ${
                  agree
                    ? "bg-orange-500 hover:bg-orange-600"
                    : "cursor-not-allowed bg-gray-400"
                }`}
              >
                <CreditCard className="mr-2 inline" size={20} />
                Proceed to Pay ₹99
              </button>

            </div>

          </div>

        </div>

      </div>

    </main>
  );
}