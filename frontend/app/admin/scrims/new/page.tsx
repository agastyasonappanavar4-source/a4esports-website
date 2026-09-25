"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { ArrowLeft } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { createScrimRequest, uploadImageRequest, type ScrimInput } from "@/services/admin";
import { BR_SLOT_TIMES, CS_SLOT_TIMES, slotTimeLabel, type SlotTime } from "@/lib/slotTime";

export default function NewScrimPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [form, setForm] = useState<Omit<ScrimInput, "slots">>({
    title: "",
    mode: "BR",
    fee: 0,
    date: "",
    image: "",
    rules: "",
    maxTeams: 48,
  });
  const [selectedSlots, setSelectedSlots] = useState<SlotTime[]>([]);
  const [submitting, setSubmitting] = useState(false);
  const [uploading, setUploading] = useState(false);

  const availableSlots = form.mode === "BR" ? BR_SLOT_TIMES : CS_SLOT_TIMES;

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push(user ? "/platform" : "/");
    }
  }, [authLoading, user, router]);

  const update = <K extends keyof typeof form>(key: K, value: (typeof form)[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setUploading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      const base64Data = event.target?.result as string;
      try {
        const res = await uploadImageRequest(file.name, base64Data);
        update("image", res.url);
        showToast("Image uploaded successfully.", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to upload image", "error");
      } finally {
        setUploading(false);
      }
    };
    reader.onerror = () => {
      showToast("Failed to read file", "error");
      setUploading(false);
    };
    reader.readAsDataURL(file);
  };

  const toggleSlot = (time: SlotTime) => {
    setSelectedSlots((prev) =>
      prev.includes(time) ? prev.filter((t) => t !== time) : [...prev, time]
    );
  };

  const handleSubmit = async () => {
    if (!form.title || !form.date || !form.maxTeams) {
      showToast("Title, date and max teams are required.", "error");
      return;
    }
    if (selectedSlots.length === 0) {
      showToast("Select at least one time slot.", "error");
      return;
    }

    setSubmitting(true);

    try {
      await createScrimRequest({ ...form, slots: selectedSlots });
      showToast("Lobby created.", "success");
      router.push("/admin");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create lobby", "error");
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
            New Lobby
          </h1>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            A lobby is one banner on the home page (e.g. &quot;₹35 BR&quot;). Pick which time
            slots should be open under it — each slot runs as its own separate match.
          </p>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Title
              </label>
              <input
                value={form.title}
                onChange={(e) => update("title", e.target.value)}
                placeholder="₹35 BR"
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
                  onChange={(e) => {
                    const mode = e.target.value as "BR" | "CS";
                    update("mode", mode);
                    setSelectedSlots((prev) => prev.filter((time) => (mode === "BR" ? BR_SLOT_TIMES : CS_SLOT_TIMES).includes(time)));
                  }}
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
                Tournament Poster (Upload Image)
              </label>
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-border bg-panel-2 p-3.5 font-mono text-sm text-foreground outline-none focus:border-cyan file:mr-4 file:py-1 file:px-3 file:border file:border-cyan/50 file:bg-cyan/10 file:text-cyan file:font-mono file:text-xs hover:file:bg-cyan/20"
                />
                {form.image && (
                  <div className="shrink-0 flex items-center gap-2">
                    <img src={form.image} alt="Preview" className="h-12 w-12 object-cover border border-border" />
                    <span className="font-mono text-xs text-cyan truncate max-w-40">{form.image}</span>
                  </div>
                )}
              </div>
              {uploading && <p className="mt-1 font-mono text-xs text-amber animate-pulse">Uploading image...</p>}
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Time Slots ({form.mode === "BR" ? "up to 4" : "up to 3"})
              </label>
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                {availableSlots.map((time) => {
                  const active = selectedSlots.includes(time);
                  return (
                    <button
                      key={time}
                      type="button"
                      onClick={() => toggleSlot(time)}
                      className={`border p-3 font-mono text-sm transition ${
                        active
                          ? "border-ember bg-ember/10 text-ember"
                          : "border-border text-muted-foreground hover:border-cyan hover:text-cyan"
                      }`}
                    >
                      {slotTimeLabel(time)}
                    </button>
                  );
                })}
              </div>
              <p className="mt-2 font-mono text-xs text-muted-foreground">
                You can add or remove slots later from the lobby&apos;s manage page.
              </p>
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Max Teams (per slot)
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
              {submitting ? "Creating..." : "Create Lobby"}
            </button>
          </div>
        </div>
      </div>
    </main>
  );
}
