"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Save } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { getScrimById, type Scrim } from "@/lib/scrims";
import {
  updateScrimRequest,
  releaseRoomRequest,
  getRegistrationsByScrimRequest,
  type AdminRegistration,
} from "@/services/admin";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ManageScrimPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [scrim, setScrim] = useState<Scrim | null>(null);
  const [registrations, setRegistrations] = useState<AdminRegistration[] | null>(null);
  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");
  const [saving, setSaving] = useState(false);
  const [releasing, setReleasing] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  useEffect(() => {
    getScrimById(Number(id)).then(setScrim);
    getRegistrationsByScrimRequest(Number(id))
      .then(setRegistrations)
      .catch(() => setRegistrations([]));
  }, [id]);

  const update = <K extends keyof Scrim>(key: K, value: Scrim[K]) => {
    setScrim((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSave = async () => {
    if (!scrim) return;
    setSaving(true);

    try {
      await updateScrimRequest(scrim.id, {
        title: scrim.title,
        mode: scrim.mode,
        fee: scrim.fee,
        date: scrim.date,
        time: scrim.time,
        image: scrim.image,
        rules: scrim.rules,
        maxTeams: scrim.maxTeams,
      });
      showToast("Changes saved.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save", "error");
    } finally {
      setSaving(false);
    }
  };

  const handleReleaseRoom = async () => {
    if (!roomId || !roomPassword) {
      showToast("Enter both Room ID and Password.", "error");
      return;
    }
    if (!scrim) return;

    setReleasing(true);

    try {
      const updated = await releaseRoomRequest(scrim.id, roomId, roomPassword);
      setScrim(updated);
      showToast("Room details released to all registered teams.", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to release room", "error");
    } finally {
      setReleasing(false);
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">Checking access...</p>
      </main>
    );
  }

  if (!scrim) {
    return (
      <main className="min-h-screen bg-background bg-tactical-grid">
        <div className="mx-auto max-w-4xl px-6 py-12">
          <Skeleton className="mb-8 h-10 w-40" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <div className="mx-auto max-w-4xl px-6 py-12">
        <button
          onClick={() => router.push("/admin")}
          className="mb-8 flex items-center gap-2 border border-border bg-panel px-5 py-2.5 font-mono text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Admin Dashboard
        </button>

        <div className="border border-border bg-panel p-8">
          <h1 className="font-display text-3xl font-bold uppercase text-foreground">
            Manage Tournament
          </h1>

          <div className="mt-8 space-y-5">
            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Title
              </label>
              <input
                value={scrim.title}
                onChange={(e) => update("title", e.target.value)}
                className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Mode
                </label>
                <select
                  value={scrim.mode}
                  onChange={(e) => update("mode", e.target.value as "BR" | "CS")}
                  className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
                >
                  <option value="BR">Battle Royale</option>
                  <option value="CS">Clash Squad</option>
                </select>
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Entry Fee (₹)
                </label>
                <input
                  type="number"
                  value={scrim.fee}
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
                  value={scrim.date.slice(0, 10)}
                  onChange={(e) => update("date", e.target.value)}
                  className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Time
                </label>
                <input
                  value={scrim.time}
                  onChange={(e) => update("time", e.target.value)}
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
                value={scrim.maxTeams}
                onChange={(e) => update("maxTeams", Number(e.target.value))}
                className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
              />
            </div>

            <div>
              <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Rules (one per line)
              </label>
              <textarea
                value={scrim.rules}
                onChange={(e) => update("rules", e.target.value)}
                rows={6}
                className="w-full border border-border bg-panel-2 p-3.5 font-mono text-sm text-foreground outline-none focus:border-cyan"
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className="btn-press flex w-full items-center justify-center gap-2 bg-ember py-4 font-display text-lg font-bold uppercase text-void transition hover:bg-[var(--ember-deep)] disabled:opacity-50"
            >
              <Save size={18} />
              {saving ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </div>

        <div className="mt-6 border border-border bg-panel p-8">
          <h2 className="font-display text-xl font-bold uppercase text-foreground">
            Room Details
          </h2>

          {scrim.roomReleased ? (
            <p className="mt-2 font-mono text-sm text-cyan">
              Room details are live — Room ID: {scrim.roomId} · Password: {scrim.roomPassword}
            </p>
          ) : (
            <p className="mt-2 font-mono text-sm text-muted-foreground">
              Not released yet. Registered teams will see this the moment you release it.
            </p>
          )}

          <div className="mt-5 grid gap-4 md:grid-cols-2">
            <input
              value={roomId}
              onChange={(e) => setRoomId(e.target.value)}
              placeholder="Room ID"
              className="border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
            />
            <input
              value={roomPassword}
              onChange={(e) => setRoomPassword(e.target.value)}
              placeholder="Room Password"
              className="border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
            />
          </div>

          <button
            onClick={handleReleaseRoom}
            disabled={releasing}
            className="btn-press mt-4 flex w-full items-center justify-center gap-2 border border-cyan bg-cyan/10 py-3.5 font-display font-bold uppercase text-cyan transition hover:bg-cyan hover:text-void disabled:opacity-50"
          >
            <KeyRound size={18} />
            {releasing ? "Releasing..." : scrim.roomReleased ? "Update Room Details" : "Release Room Details"}
          </button>
        </div>

        <div className="mt-6 border border-border bg-panel p-8">
          <h2 className="mb-5 font-display text-xl font-bold uppercase text-foreground">
            Registered Teams {registrations ? `(${registrations.length})` : ""}
          </h2>

          {!registrations ? (
            <Skeleton className="h-40 w-full" />
          ) : registrations.length === 0 ? (
            <p className="font-mono text-sm text-muted-foreground">No teams registered yet.</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full font-mono text-sm">
                <thead>
                  <tr className="border-b border-border text-left text-muted-foreground">
                    <th className="pb-3 pr-4">Slot</th>
                    <th className="pb-3 pr-4">Team</th>
                    <th className="pb-3 pr-4">IGL</th>
                    <th className="pb-3 pr-4">Phone</th>
                    <th className="pb-3 pr-4">Code</th>
                    <th className="pb-3">Payment</th>
                  </tr>
                </thead>
                <tbody>
                  {registrations.map((reg) => (
                    <tr key={reg.id} className="border-b border-border/50 text-foreground">
                      <td className="py-3 pr-4">#{reg.slotNumber}</td>
                      <td className="py-3 pr-4">{reg.teamName}</td>
                      <td className="py-3 pr-4">{reg.iglName}</td>
                      <td className="py-3 pr-4">{reg.phone}</td>
                      <td className="py-3 pr-4">{reg.registrationCode}</td>
                      <td className="py-3">
                        <span className={reg.paymentStatus === "PAID" ? "text-cyan" : "text-amber"}>
                          {reg.paymentStatus}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}