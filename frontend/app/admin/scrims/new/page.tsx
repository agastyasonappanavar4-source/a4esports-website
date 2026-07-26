"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { createScrimRequest, type ScrimInput } from "@/services/admin";

export default function NewScrimPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState<ScrimInput>({
    title: "",
    mode: "BR",
    fee: 0,
    date: "",
    time: "",
    image: "",
    rules: "",
    maxTeams: 48,
  });
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  const update = <K extends keyof ScrimInput>(key: K, value: ScrimInput[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.time || !form.maxTeams) {
      showToast("Title, date, time and max teams are required.", "error");
      return;
    }

    setSubmitting(true);

    try {
      await createScrimRequest(form);
      showToast("Tournament created.", "success");
      router.push("/admin");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create tournament", "error");
    } finally {
      setSubmitting(false);
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">Checking access...</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <div className="mx-auto max-w-2xl px-6 py-12">
        <button
          onClick={() => router.push("/admin")}
          className="mb-8 flex items-center gap-2 border border-border bg-panel px-5 py-2.5 font-mono text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Admin Dashboard
        </button>

        <div className="border border-border bg-panel p-8">
          <h1 className="font-display text-3xl font-bold uppercase text-foreground">
            New Tournament
          </h1>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="Weekend BR Championship"
                className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Mode
                </label>
                <select
                  value={form.mode}
                  onChange={(e) => update("mode", e.target.value as "BR" | "CS")}
                  className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
                >
                  <option value="BR">Battle Royale</option>
                  <option value="CS">Clash Squad</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Entry Fee (₹, 0 = free)
                </label>
                <input
                  type="number"
                  value={form.fee}
                  onChange={(e) => update("fee", Number(e.target.value))}
                  className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Date
                </label>
                <input
                  type="date"
                  value={form.date}
                  onChange={(e) => update("date", e.target.value)}
                  className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Time (e.g. 8:00 PM)
                </label>
                <input
                  value={form.time}
                  onChange={(e) => update("time", e.target.value)}
                  placeholder="8:00 PM"
                  className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
                />
              </div>
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Max Teams
              </label>
              <input
                type="number"
                value={form.maxTeams}
                onChange={(e) => update("maxTeams", Number(e.target.value))}
                className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Rules (one per line)
              </label>
              <textarea
                value={form.rules}
                onChange={(e) => update("rules", e.target.value)}
                rows={6}
                placeholder={"Emulator players not allowed\nHacks = permanent ban\nRoom ID released 15 minutes before match"}
                className="w-full border border-border bg-panel-2 p-3.5 font-mono text-sm text-foreground outline-none focus:border-cyan"
              />
            </div>

            <button
              onClick={handleSubmit}
              disabled={submitting}
              className="btn-press w-full bg-ember py-4 font-display text-lg font-bold uppercase text-void transition hover:bg-[var(--ember-deep)] disabled:opacity-50"
            >
              {submitting ? "Creating..." : "Create Tournament"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}