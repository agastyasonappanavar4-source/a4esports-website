"use client";

import { scrimModeLabel } from "@/lib/scrimMode";
import { useEffect, useState, useRef, use } from "react";
import { useParams, useRouter } from "next/navigation";
import {
  ArrowLeft,
  Copy,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Phone,
  Mail,
  Trophy,
  Calendar,
  Users,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { getRegistrationById, type MyRegistration } from "@/services/registrations";
import { requestPaymentVerification } from "@/services/payments";
import { slotTimeLabel } from "@/lib/slotTime";
import { Skeleton } from "@/components/ui/Skeleton";
import Navbar from "@/components/layout/Navbar";

const UPI_ID = process.env.NEXT_PUBLIC_UPI_ID || "7022240954@fam";
const QR_IMAGE = process.env.NEXT_PUBLIC_UPI_QR_IMAGE || "";

export default function PaymentPage({ params }: { params?: Promise<{ id: string }> }) {
  const routeParams = useParams<{ id: string }>();
  const unwrappedParams = params ? use(params) : null;
  const rawId = routeParams?.id || unwrappedParams?.id;
  const registrationId = Number(rawId);

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [registration, setRegistration] = useState<MyRegistration | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [timeLeft, setTimeLeft] = useState(15);
  const canVerify = timeLeft === 0;
  const [submitting, setSubmitting] = useState(false);
  const [copied, setCopied] = useState(false);
  const isSubmittingRef = useRef(false);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push(`/login?next=/payment/${registrationId}`);
    }
  }, [authLoading, user, registrationId, router]);

  useEffect(() => {
    if (!registrationId || isNaN(registrationId)) return;

    getRegistrationById(registrationId)
      .then((data) => {
        setRegistration(data);
        if (data.paymentStatus === "PAID") {
          showToast("This registration is already paid and confirmed.", "success");
          router.replace(`/my-match/${data.id}`);
        } else if (data.paymentStatus === "FAILED") {
          router.replace(`/my-match/${data.id}`);
        } else if (data.paymentVerificationRequestedAt) {
          router.replace(`/my-match/${data.id}`);
        }
      })
      .catch((err) => {
        setError(err instanceof Error ? err.message : "Failed to load payment details.");
      })
      .finally(() => setLoading(false));
  }, [registrationId, router, showToast]);

  // 15-second visual countdown timer
  useEffect(() => {
    if (timeLeft <= 0) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleCopyUPI = () => {
    navigator.clipboard.writeText(UPI_ID).then(() => {
      setCopied(true);
      showToast("UPI ID copied to clipboard!", "success");
      setTimeout(() => setCopied(false), 2500);
    });
  };

  const handleContinueAndVerify = async () => {
    if (!canVerify || submitting || isSubmittingRef.current) return;

    isSubmittingRef.current = true;
    setSubmitting(true);
    try {
      await requestPaymentVerification(registrationId);
      showToast(
        "Payment review requested. Your slot remains pending until an admin confirms the payment.",
        "success"
      );
      router.push("/platform");
    } catch (err) {
      isSubmittingRef.current = false;
      setSubmitting(false);
      showToast(
        err instanceof Error ? err.message : "Failed to submit verification request",
        "error"
      );
    }
  };

  if (loading && Number.isSafeInteger(registrationId) && registrationId > 0) {
    return (
      <main className="min-h-screen bg-background bg-tactical-grid">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-10">
          <Skeleton className="mb-6 h-10 w-32" />
          <Skeleton className="h-96 w-full rounded-xl" />
        </div>
      </main>
    );
  }

  if (error || !registration) {
    return (
      <main className="min-h-screen bg-background bg-tactical-grid">
        <Navbar />
        <div className="mx-auto max-w-xl px-4 py-12 text-center">
          <div className="rounded-xl border border-destructive/40 bg-panel p-8">
            <ShieldAlert size={40} className="mx-auto mb-4 text-destructive" />
            <h1 className="font-display text-2xl font-bold uppercase text-foreground">
              Registration Error
            </h1>
            <p className="mt-2 font-mono text-sm text-muted-foreground">{error || "Invalid registration ID."}</p>
            <button
              onClick={() => router.push("/platform")}
              className="mt-6 border border-border bg-panel-2 px-6 py-2.5 font-mono text-sm text-foreground transition hover:border-cyan hover:text-cyan"
            >
              Back to Home
            </button>
          </div>
        </div>
      </main>
    );
  }

  const { scrim, slot, teamName, iglName } = registration;
  const timingLabel = slotTimeLabel(slot);
  const formattedDate = new Date(scrim.date).toLocaleDateString("en-IN", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });

  const progressPercent = Math.min(100, Math.round(((15 - timeLeft) / 15) * 100));

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <Navbar />

      <div className="mx-auto max-w-xl px-4 py-6 sm:py-10">
        {/* Back navigation */}
        <button
          onClick={() => router.push("/platform")}
          className="mb-5 flex items-center gap-2 rounded-lg border border-border bg-panel px-4 py-2 font-mono text-xs text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={15} />
          Back to Home
        </button>

        {/* Main Payment Card */}
        <div className="overflow-hidden rounded-2xl border border-border bg-panel shadow-2xl">
          {/* Top Banner with Scrim Info */}
          <div className="border-b border-border/80 bg-panel-2 p-5 sm:p-6">
            <div className="flex items-center justify-between gap-3">
              <span className="rounded-full border border-cyan/40 bg-cyan/10 px-3 py-1 font-mono text-[11px] uppercase tracking-wider text-cyan">
                {scrimModeLabel(scrim.mode)} · Manual UPI Pay
              </span>
              <span className="font-mono text-xs font-bold text-amber">
                ₹{scrim.fee} Payable
              </span>
            </div>

            <h1 className="mt-3 font-display text-2xl sm:text-3xl font-bold uppercase text-foreground">
              {scrim.title}
            </h1>

            {/* Scrim Poster Preview */}
            {scrim.image && (
              <div className="mt-3 overflow-hidden rounded-lg border border-border max-h-32 w-full bg-void">
                <img
                  src={scrim.image}
                  alt={scrim.title}
                  className="h-full w-full object-cover opacity-90"
                />
              </div>
            )}

            {/* Meta tags */}
            <div className="mt-4 grid grid-cols-2 gap-2 font-mono text-xs text-muted-foreground sm:grid-cols-4">
              <div className="flex items-center gap-1.5">
                <Calendar size={13} className="text-ember shrink-0" />
                <span className="truncate">{formattedDate}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Clock size={13} className="text-ember shrink-0" />
                <span className="truncate">{timingLabel}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Users size={13} className="text-cyan shrink-0" />
                <span className="truncate">{teamName}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Trophy size={13} className="text-amber shrink-0" />
                <span className="truncate">IGL: {iglName}</span>
              </div>
            </div>
          </div>

          {/* QR Code & Payment Section */}
          <div className="p-5 sm:p-7 space-y-6">
            <div className="text-center">
              <p className="font-mono text-xs uppercase tracking-wider text-muted-foreground">
                Scan UPI QR Code To Pay
              </p>
              <p className="mt-1 font-display text-3xl font-black text-foreground">
                ₹{scrim.fee}
              </p>
            </div>

            {/* Configured QR Image or Clean Tactical Placeholder */}
            <div className="mx-auto flex flex-col items-center justify-center">
              {QR_IMAGE ? (
                <div className="relative rounded-2xl border-2 border-ember/40 bg-white p-4 shadow-xl transition-transform hover:scale-[1.01]">
                  <img
                    src={QR_IMAGE}
                    alt="Official UPI QR Code"
                    className="h-56 w-56 sm:h-64 sm:w-64 object-contain"
                  />
                </div>
              ) : (
                <div className="relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-panel-2/80 p-6 h-56 w-56 sm:h-60 sm:w-60 text-center shadow-lg">
                  <div className="rounded-full bg-cyan/15 border border-cyan/40 p-3 mb-2 text-cyan">
                    <Clock size={24} />
                  </div>
                  <p className="font-display text-sm font-bold uppercase tracking-wider text-foreground">
                    Official QR Code
                  </p>
                  <p className="mt-1 font-mono text-[11px] text-muted-foreground leading-relaxed">
                    QR image to be uploaded<br />Pay directly using UPI ID below
                  </p>
                </div>
              )}
              <p className="mt-2.5 font-mono text-[11px] text-muted-foreground text-center">
                Scan using Google Pay, PhonePe, Paytm, BHIM, or any UPI app
              </p>
            </div>

            {/* Copyable UPI ID Box */}
            <div className="rounded-xl border border-border bg-panel-2 p-3.5 flex items-center justify-between gap-3">
              <div className="min-w-0">
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  UPI ID (Tap to Copy)
                </p>
                <p className="font-mono text-sm font-bold text-cyan truncate mt-0.5">
                  {UPI_ID}
                </p>
              </div>
              <button
                onClick={handleCopyUPI}
                className="shrink-0 flex items-center gap-1.5 rounded-lg border border-cyan/40 bg-cyan/10 px-3 py-2 font-mono text-xs font-semibold text-cyan transition hover:bg-cyan/20 active:scale-95"
              >
                {copied ? <CheckCircle2 size={14} className="text-cyan" /> : <Copy size={14} />}
                {copied ? "Copied" : "Copy"}
              </button>
            </div>

            {/* Instructions */}
            <div className="rounded-xl border border-border/80 bg-panel-2/60 p-4 space-y-2 text-xs font-mono text-muted-foreground">
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ember/20 text-[10px] font-bold text-ember">
                  1
                </span>
                <span>Open your UPI app and scan the QR code above.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ember/20 text-[10px] font-bold text-ember">
                  2
                </span>
                <span>Pay the exact entry fee of ₹{scrim.fee}.</span>
              </div>
              <div className="flex items-start gap-2">
                <span className="flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-ember/20 text-[10px] font-bold text-ember">
                  3
                </span>
                <span>After paying, wait 15 seconds, then request manual payment review.</span>
              </div>
            </div>

            {/* 15-Second Timer Bar */}
            <div className="space-y-2">
              <div className="flex items-center justify-between text-xs font-mono text-muted-foreground">
                <span>{canVerify ? "Ready to verify" : "Verification delay"}</span>
                <span className={canVerify ? "text-cyan font-bold" : "text-amber font-bold"}>
                  {canVerify ? "Complete" : `${timeLeft}s remaining`}
                </span>
              </div>
              <div className="h-2 w-full overflow-hidden rounded-full bg-panel-2 border border-border/60">
                <div
                  className="h-full bg-gradient-to-r from-ember to-cyan transition-all duration-1000 ease-linear"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* CONTINUE & VERIFY BUTTON */}
            <div>
              <button
                onClick={handleContinueAndVerify}
                disabled={!canVerify || submitting}
                className={`btn-press w-full rounded-xl py-4 font-display text-base font-bold uppercase tracking-wider transition ${
                  canVerify
                    ? "bg-cyan text-void shadow-lg shadow-cyan/20 hover:bg-cyan/90 cursor-pointer"
                    : "border border-border bg-panel-2 text-muted-foreground opacity-60 cursor-not-allowed"
                }`}
              >
                {submitting ? (
                  "Submitting Verification..."
                ) : canVerify ? (
                  "Continue & Verify"
                ) : (
                  `Continue in ${timeLeft}s...`
                )}
              </button>
              <p className="mt-2 text-center font-mono text-[10px] text-muted-foreground">
                No UTR or screenshot is required. This button does not confirm payment or reserve a final slot; an admin checks the UPI receipt manually.
              </p>
            </div>

            {/* Help / Contact Us Section */}
            <div className="border-t border-border/60 pt-4 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs font-mono text-muted-foreground">
              <span>Need help with payment?</span>
              <div className="flex items-center gap-4">
                <a
                  href="tel:+917204472826"
                  className="flex items-center gap-1 text-cyan hover:underline font-bold"
                >
                  <Phone size={12} />
                  +91 7204472826
                </a>
                <a
                  href="mailto:a4esportsindia@gmail.com"
                  className="flex items-center gap-1 text-ember hover:underline"
                >
                  <Mail size={12} />
                  Support
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
