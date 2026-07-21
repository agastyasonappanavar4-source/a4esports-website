"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, ShieldCheck, Users, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getScrimById, type Scrim } from "@/lib/scrims";
import { createOrder, verifyPayment } from "@/services/payments";

declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

export default function ScrimRegisterPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();

  const [scrim, setScrim] = useState<Scrim | null>(null);
  const [teamName, setTeamName] = useState("");
  const [iglName, setIglName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState<{ code: string } | null>(null);
  const [error, setError] = useState("");

  useEffect(() => {
    getScrimById(Number(id)).then(setScrim);
  }, [id]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?next=/scrims/${id}/register`);
    }
  }, [authLoading, user, id, router]);

  const handleSubmit = async () => {
    if (!teamName || !iglName || !phone) {
      setError("Please fill all fields.");
      return;
    }
    if (!scrim) return;

    setError("");
    setSubmitting(true);

    try {
      const regResponse = await fetch(`${API_URL}/api/registrations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          scrimId: scrim.id,
          teamName,
          iglName,
          phone,
        }),
      });

      const regData = await regResponse.json();

      if (!regResponse.ok) {
        throw new Error(regData.message || "Registration failed");
      }

      const registration = regData.data;

      if (scrim.fee === 0) {
        setSuccess({ code: registration.registrationCode });
        return;
      }

      const order = await createOrder(scrim.fee);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "FF Scrims",
        description: scrim.title,
        order_id: order.id,
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registrationId: registration.id,
              amount: scrim.fee,
              method: "razorpay",
            });
            setSuccess({ code: registration.registrationCode });
          } catch {
            setError(
              `Payment verification failed. Contact support with your registration code: ${registration.registrationCode}`
            );
          }
        },
        theme: { color: "#FF5A1F" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong.");
    } finally {
      setSubmitting(false);
    }
  };

  if (!scrim) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">
          Loading tournament...
        </p>
      </main>
    );
  }

  if (success) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background px-5">
        <div className="w-full max-w-md border border-cyan/40 bg-panel p-8 text-center">
          <ShieldCheck className="mx-auto mb-4 h-14 w-14 text-cyan" />
          <h1 className="font-display text-3xl font-bold uppercase text-foreground">
            You&apos;re In
          </h1>
          <p className="mt-3 font-mono text-sm text-muted-foreground">
            Registration confirmed for {scrim.title}.
          </p>
          <div className="mt-6 border border-border bg-void p-4">
            <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
              Registration Code
            </p>
            <p className="mt-1 font-mono text-2xl font-semibold text-ember">
              {success.code}
            </p>
          </div>
          <button
            onClick={() => router.push(`/scrims/${scrim.id}`)}
            className="mt-8 w-full bg-ember py-3.5 font-display font-bold uppercase text-void transition hover:bg-[var(--ember-deep)]"
          >
            Back to Tournament
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <button
          onClick={() => router.back()}
          className="mb-8 flex items-center gap-2 border border-border bg-panel px-5 py-2.5 font-mono text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Back
        </button>

        <div className="border border-border bg-panel p-8">
          <span className="font-mono text-xs uppercase tracking-widest text-cyan">
            {scrim.mode === "BR" ? "Battle Royale" : "Clash Squad"} · Registration
          </span>
          <h1 className="mt-2 font-display text-4xl font-bold uppercase text-foreground">
            {scrim.title}
          </h1>
          <p className="mt-3 font-mono text-sm text-muted-foreground">
            Fill your team details to secure a slot.
          </p>

          <div className="mt-10 space-y-6">
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Team Name
              </label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                className="w-full border border-border bg-void p-4 font-mono text-foreground outline-none focus:border-cyan"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                IGL Name
              </label>
              <input
                value={iglName}
                onChange={(e) => setIglName(e.target.value)}
                placeholder="Enter IGL name"
                className="w-full border border-border bg-void p-4 font-mono text-foreground outline-none focus:border-cyan"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Phone Number
              </label>
              <div className="flex items-center border border-border bg-void px-4 focus-within:border-cyan">
                <Phone size={16} className="text-muted-foreground" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-transparent p-4 font-mono text-foreground outline-none"
                />
              </div>
            </div>

            <div className="border border-border bg-void/60 p-5">
              <div className="flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <Users size={18} className="text-cyan" />
                Max 4 players per team
              </div>
              <div className="mt-3 flex items-center gap-3 font-mono text-sm text-muted-foreground">
                <ShieldCheck size={18} className="text-ember" />
                Fair play rules apply — hacks mean a permanent ban
              </div>
            </div>

            {error && (
              <p className="border border-destructive/40 bg-destructive/10 p-3 font-mono text-sm text-destructive">
                {error}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="w-full bg-ember py-4 font-display text-lg font-bold uppercase text-void transition hover:bg-[var(--ember-deep)] disabled:opacity-50"
            >
              {submitting
                ? "Processing..."
                : scrim.fee === 0
                ? "Confirm Free Entry"
                : `Pay ₹${scrim.fee} & Register`}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}