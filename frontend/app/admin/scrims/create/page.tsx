"use client";

import Link from "next/link";
import { FormEvent, useState } from "react";
import {
  ArrowLeft,
  CalendarDays,
  Clock,
  Gamepad2,
  Image,
  IndianRupee,
  Loader2,
  Save,
  ScrollText,
  Trophy,
  Users,
} from "lucide-react";

type ScrimMode = "BR" | "CS";

type FormData = {
  title: string;
  mode: ScrimMode;
  fee: string;
  date: string;
  time: string;
  image: string;
  rules: string;
  maxTeams: string;
};

const initialFormData: FormData = {
  title: "",
  mode: "BR",
  fee: "",
  date: "",
  time: "",
  image: "",
  rules: "",
  maxTeams: "48",
};

export default function CreateScrimPage() {
  const [formData, setFormData] = useState<FormData>(initialFormData);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const [errorMessage, setErrorMessage] = useState("");

  function updateField(field: keyof FormData, value: string) {
    setFormData((previous) => ({
      ...previous,
      [field]: value,
    }));
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSuccessMessage("");
    setErrorMessage("");

    if (
      !formData.title.trim() ||
      !formData.fee ||
      !formData.date ||
      !formData.time ||
      !formData.maxTeams ||
      !formData.rules.trim()
    ) {
      setErrorMessage("Please fill all required fields.");
      return;
    }

    const fee = Number(formData.fee);
    const maxTeams = Number(formData.maxTeams);

    if (fee <= 0 || maxTeams <= 0) {
      setErrorMessage("Fee and maximum teams must be greater than zero.");
      return;
    }

    try {
      setIsSubmitting(true);

      const response = await fetch("http://localhost:5000/api/scrims", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          title: formData.title.trim(),
          mode: formData.mode,
          fee,
          date: new Date(formData.date).toISOString(),
          time: formData.time,
          image: formData.image.trim() || "default-scrim.jpg",
          rules: formData.rules.trim(),
          maxTeams,
          status: "OPEN",
        }),
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || "Unable to create scrim."
        );
      }

      setSuccessMessage("Scrim created successfully.");
      setFormData(initialFormData);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while creating the scrim."
      );
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="min-h-screen bg-[#070707] px-4 pb-24 pt-24 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-5xl">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-red-700/20 blur-3xl" />

          <div className="relative">
            <p className="text-xs font-bold uppercase tracking-[0.24em] text-red-500">
              Tournament management
            </p>

            <h1 className="mt-2 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              Create Scrim
            </h1>

            <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
              Create a new BR or CS tournament. The tournament will immediately
              become visible to players after it is saved.
            </p>
          </div>
        </section>

        <form
          onSubmit={handleSubmit}
          className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-8"
        >
          <div className="grid gap-6 md:grid-cols-2">
            <FormField
              label="Scrim title"
              required
              icon={<Trophy className="h-4 w-4" />}
            >
              <input
                type="text"
                value={formData.title}
                onChange={(event) =>
                  updateField("title", event.target.value)
                }
                placeholder="Example: BR Evening Scrim"
                className="admin-input"
              />
            </FormField>

            <FormField
              label="Game mode"
              required
              icon={<Gamepad2 className="h-4 w-4" />}
            >
              <select
                value={formData.mode}
                onChange={(event) =>
                  updateField("mode", event.target.value)
                }
                className="admin-input"
              >
                <option value="BR">Battle Royale — BR</option>
                <option value="CS">Clash Squad — CS</option>
              </select>
            </FormField>

            <FormField
              label="Entry fee"
              required
              icon={<IndianRupee className="h-4 w-4" />}
            >
              <input
                type="number"
                min="1"
                value={formData.fee}
                onChange={(event) => updateField("fee", event.target.value)}
                placeholder="Example: 35"
                className="admin-input"
              />
            </FormField>

            <FormField
              label="Maximum teams"
              required
              icon={<Users className="h-4 w-4" />}
            >
              <input
                type="number"
                min="1"
                value={formData.maxTeams}
                onChange={(event) =>
                  updateField("maxTeams", event.target.value)
                }
                placeholder="Example: 48"
                className="admin-input"
              />
            </FormField>

            <FormField
              label="Scrim date"
              required
              icon={<CalendarDays className="h-4 w-4" />}
            >
              <input
                type="date"
                value={formData.date}
                onChange={(event) => updateField("date", event.target.value)}
                className="admin-input"
              />
            </FormField>

            <FormField
              label="Scrim time"
              required
              icon={<Clock className="h-4 w-4" />}
            >
              <input
                type="time"
                value={formData.time}
                onChange={(event) => updateField("time", event.target.value)}
                className="admin-input"
              />
            </FormField>
          </div>

          <div className="mt-6">
            <FormField
              label="Banner image URL"
              icon={<Image className="h-4 w-4" />}
            >
              <input
                type="text"
                value={formData.image}
                onChange={(event) => updateField("image", event.target.value)}
                placeholder="https://example.com/scrim-banner.jpg"
                className="admin-input"
              />

              <p className="mt-2 text-xs text-white/35">
                This field can be left empty temporarily.
              </p>
            </FormField>
          </div>

          <div className="mt-6">
            <FormField
              label="Tournament rules"
              required
              icon={<ScrollText className="h-4 w-4" />}
            >
              <textarea
                rows={8}
                value={formData.rules}
                onChange={(event) => updateField("rules", event.target.value)}
                placeholder={`No teaming
No hacks or third-party applications
Players must join before the match starts
Admin decision will be final`}
                className="admin-input resize-y"
              />
            </FormField>
          </div>

          {errorMessage && (
            <div className="mt-6 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {errorMessage}
            </div>
          )}

          {successMessage && (
            <div className="mt-6 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {successMessage}
            </div>
          )}

          <div className="mt-8 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <Link
              href="/admin"
              className="inline-flex min-h-12 items-center justify-center rounded-xl border border-white/10 px-5 font-bold text-white/60 transition hover:bg-white/5 hover:text-white"
            >
              Cancel
            </Link>

            <button
              type="submit"
              disabled={isSubmitting}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-6 font-bold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Creating...
                </>
              ) : (
                <>
                  <Save className="h-5 w-5" />
                  Create Scrim
                </>
              )}
            </button>
          </div>
        </form>
      </div>

      <style jsx global>{`
        .admin-input {
          width: 100%;
          min-height: 48px;
          border-radius: 12px;
          border: 1px solid rgba(255, 255, 255, 0.1);
          background: rgba(0, 0, 0, 0.45);
          padding: 12px 14px;
          color: white;
          outline: none;
          transition:
            border-color 150ms ease,
            background-color 150ms ease;
        }

        .admin-input::placeholder {
          color: rgba(255, 255, 255, 0.25);
        }

        .admin-input:focus {
          border-color: rgba(220, 38, 38, 0.75);
          background: rgba(0, 0, 0, 0.65);
        }

        select.admin-input option {
          background: #111111;
          color: white;
        }
      `}</style>
    </main>
  );
}

function FormField({
  label,
  required,
  icon,
  children,
}: {
  label: string;
  required?: boolean;
  icon: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <label className="block">
      <span className="mb-2 flex items-center gap-2 text-sm font-bold text-white/75">
        <span className="text-red-500">{icon}</span>
        {label}

        {required && <span className="text-red-500">*</span>}
      </span>

      {children}
    </label>
  );
}