"use client";

import { useEffect, useState, Suspense } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { ArrowLeft, ShieldCheck, Users, Phone } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { getScrimById, type Scrim, type Slot } from "@/lib/scrims";
import { slotTimeLabel } from "@/lib/slotTime";
import { createOrder, verifyPayment } from "@/services/payments";
import { Skeleton } from "@/components/ui/Skeleton";
import Navbar from "@/components/layout/Navbar";


declare global {
  interface Window {
    Razorpay: new (options: Record<string, unknown>) => { open: () => void };
  }
}

interface RazorpaySuccessResponse {
  razorpay_order_id: string;
  razorpay_payment_id: string;
  razorpay_signature: string;
}

const API_URL = process.env.NEXT_PUBLIC_API_URL;

function ScrimRegisterForm() {
  const { id } = useParams<{ id: string }>();
  const searchParams = useSearchParams();
  const slotId = searchParams.get("slot");
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [scrim, setScrim] = useState<Scrim | null>(null);
  const [slot, setSlot] = useState<Slot | null>(null);
  const [notFoundSlot, setNotFoundSlot] = useState(false);
  const [teamName, setTeamName] = useState("");
  const [iglName, setIglName] = useState("");
  const [phone, setPhone] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [criticalError, setCriticalError] = useState("");

  useEffect(() => {
    getScrimById(Number(id)).then((data) => {
      setScrim(data);
      if (data) {
        const matched = data.slots.find((s) => s.id === Number(slotId));
        if (matched) {
          setSlot(matched);
        } else {
          setNotFoundSlot(true);
        }
      }
    });
  }, [id, slotId]);

  useEffect(() => {
    if (!authLoading && !user) {
      const registrationUrl = `/scrims/${id}/register${slotId ? `?slot=${slotId}` : ""}`;
      router.push(`/login?next=${encodeURIComponent(registrationUrl)}`);
    }
  }, [authLoading, user, id, slotId, router]);

  const goHomeRegistered = () => {
    showToast("You're registered! Check the home page for match details.", "success");
    setTimeout(() => router.push("/platform"), 900);
  };

  const handleSubmit = async () => {
    if (!teamName || !iglName || !phone) {
      showToast("Please fill all fields.", "error");
      return;
    }
    if (!scrim || !slot) return;

    setSubmitting(true);

    try {
      const regResponse = await fetch(`${API_URL}/api/registrations`, {
        method: "POST",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slotId: slot.id, teamName, iglName, phone }),
      });

      const regData = await regResponse.json();

      if (!regResponse.ok) {
        throw new Error(regData.message || "Registration failed");
      }

      const registration = regData.data;

      if (scrim.fee === 0) {
        goHomeRegistered();
        return;
      }

      const order = await createOrder(registration.id);

      const options = {
        key: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID,
        amount: order.amount,
        currency: order.currency,
        name: "A4esports",
        description: scrim.title,
        order_id: order.id,
        handler: async (response: RazorpaySuccessResponse) => {
          try {
            await verifyPayment({
              razorpay_order_id: response.razorpay_order_id,
              razorpay_payment_id: response.razorpay_payment_id,
              razorpay_signature: response.razorpay_signature,
              registrationId: registration.id,
              method: "razorpay",
            });
            goHomeRegistered();
          } catch {
            setCriticalError(
              "We could not confirm your payment. If you were charged, contact a4esportsindia@gmail.com with your payment ID."
            );
          }
        },
        theme: { color: "#FF5A1F" },
      };

      const rzp = new window.Razorpay(options);
      rzp.open();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Something went wrong.", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!scrim) {
    return (
      <main className="min-h-screen bg-background bg-tactical-grid">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <Skeleton className="mb-8 h-10 w-24" />
          <div className="border border-border bg-panel p-8">
            <Skeleton className="h-3 w-40" />
            <Skeleton className="mt-3 h-10 w-3/4" />
            <div className="mt-10 space-y-6">
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
              <Skeleton className="h-14 w-full" />
            </div>
          </div>
        </div>
      </main>
    );
  }

  if (notFoundSlot || !slot) {
    return (
      <main className="min-h-screen bg-background bg-tactical-grid">
        <div className="mx-auto max-w-2xl px-6 py-12">
          <button
            onClick={() => router.push(`/scrims/${scrim.id}`)}
            className="mb-8 flex items-center gap-2 border border-border bg-panel px-5 py-2.5 font-mono text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
          >
            <ArrowLeft size={16} />
            Back
          </button>
          <div className="border border-border bg-panel p-8 text-center">
            <p className="font-mono text-sm text-muted-foreground">
              Pick a time slot before registering.
            </p>
            <button
              onClick={() => router.push(`/scrims/${scrim.id}`)}
              className="btn-press mt-6 bg-ember px-6 py-3 font-display text-sm font-bold uppercase text-void transition hover:bg-[var(--ember-deep)]"
            >
              Choose a Time Slot
            </button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <Navbar />

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => router.back()}
          className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-panel px-4 py-2 font-mono text-xs text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Back to Tournament
        </button>

        <div className="rounded-xl border border-border bg-panel p-6 sm:p-8 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <span className="font-mono text-xs uppercase tracking-wider text-cyan">
              {scrim.mode === "BR" ? "Battle Royale" : "Clash Squad"} · {slotTimeLabel(slot.time)}
            </span>

            {scrim.prizePool && (
              <span className="font-mono text-xs font-bold text-amber-400">
                🏆 Prize: {scrim.prizePool}
              </span>
            )}
          </div>

          <h1 className="mt-2 font-display text-3xl sm:text-4xl font-bold uppercase text-foreground">{scrim.title}</h1>
          <p className="mt-2 font-mono text-xs sm:text-sm text-muted-foreground">
            Fill your team details to secure a slot. After confirming, you&apos;ll be taken back to the home page where your match will appear.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">Team Name</label>
              <input
                value={teamName}
                onChange={(e) => setTeamName(e.target.value)}
                placeholder="Enter team name"
                className="w-full rounded-lg border border-border bg-panel-2 p-3.5 font-mono text-sm text-foreground outline-none focus:border-cyan"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">IGL Name</label>
              <input
                value={iglName}
                onChange={(e) => setIglName(e.target.value)}
                placeholder="Enter IGL name"
                className="w-full rounded-lg border border-border bg-panel-2 p-3.5 font-mono text-sm text-foreground outline-none focus:border-cyan"
              />
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-wider text-muted-foreground">Phone Number</label>
              <div className="flex items-center rounded-lg border border-border bg-panel-2 px-3.5 focus-within:border-cyan">
                <Phone size={16} className="text-muted-foreground" />
                <input
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full bg-transparent p-3.5 font-mono text-sm text-foreground outline-none"
                />
              </div>
            </div>

            <div className="rounded-lg border border-border bg-panel-2 p-4 space-y-2">
              <div className="flex items-center gap-2.5 font-mono text-xs text-muted-foreground">
                <Users size={16} className="text-cyan shrink-0" />
                Max 4 players per team
              </div>
              <div className="flex items-center gap-2.5 font-mono text-xs text-muted-foreground">
                <ShieldCheck size={16} className="text-amber-400 shrink-0" />
                Fair play rules apply — hacks mean a permanent ban
              </div>
            </div>

            {criticalError && (
              <p className="rounded-lg border border-destructive/40 bg-destructive/10 p-3 font-mono text-xs text-destructive">
                {criticalError}
              </p>
            )}

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-press w-full rounded-xl bg-cyan py-3.5 font-display text-base font-bold uppercase text-void transition hover:bg-cyan/90 disabled:opacity-50"
            >
              {submitting ? "Processing..." : scrim.fee === 0 ? "Confirm Registration" : `Continue to Pay ₹${scrim.fee}`}
            </button>

            <div className="mt-6 pt-5 border-t border-border/40 flex flex-col items-center gap-1.5">
              <span className="font-mono text-xs text-muted-foreground">
                Need Help / Contact Us?
              </span>
              <a
                href="tel:+917204472826"
                className="flex items-center gap-1.5 font-mono text-sm font-bold text-cyan hover:underline transition-all"
              >
                <Phone size={14} className="text-cyan animate-pulse" />
                +91 7204472826
              </a>
            </div>
          </div>
        </div>
      </div>
    </main>
  );

}
export default function ScrimRegisterPage() {
  return (
    <Suspense fallback={null}>
      <ScrimRegisterForm />
    </Suspense>
  );
}
