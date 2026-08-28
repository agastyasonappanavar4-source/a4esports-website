"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { ArrowLeft, KeyRound, Save, Plus, Trash2, Power } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { getScrimById } from "@/lib/scrims";
import type { Scrim, Slot } from "@/lib/scrims";
import {
  BR_SLOT_TIMES,
  CS_SLOT_TIMES,
  slotTimeLabel,
  type SlotTime,
} from "@/lib/slotTime";
import {
  updateScrimRequest,
  createSlotRequest,
  deleteSlotRequest,
  updateSlotStatusRequest,
  releaseSlotRoomRequest,
  getRegistrationsBySlotRequest,
  removeRegistrationRequest,
  uploadImageRequest,
  type AdminRegistration,
} from "@/services/admin";
import { Skeleton } from "@/components/ui/Skeleton";

export default function ManageScrimPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [scrim, setScrim] = useState<Scrim | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Per-slot room-release input state, keyed by slot id.
  const [roomInputs, setRoomInputs] = useState<Record<number, { roomId: string; roomPassword: string }>>({});
  const [releasingSlotId, setReleasingSlotId] = useState<number | null>(null);
  const [busySlotId, setBusySlotId] = useState<number | null>(null);
  const [addingSlot, setAddingSlot] = useState(false);

  const [expandedSlotId, setExpandedSlotId] = useState<number | null>(null);
  const [slotRegistrations, setSlotRegistrations] = useState<Record<number, AdminRegistration[]>>({});
  const [removingRegistrationId, setRemovingRegistrationId] = useState<number | null>(null);

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

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push(user ? "/platform" : "/");
    }
  }, [authLoading, user, router]);

  const loadScrim = () => {
    getScrimById(Number(id)).then(setScrim);
  };

  useEffect(() => {
    loadScrim();
    // eslint-disable-next-line react-hooks/exhaustive-deps
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
        image: scrim.image,
        prizePool: scrim.prizePool,
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

  const availableSlotTimes = scrim?.mode === "CS" ? CS_SLOT_TIMES : BR_SLOT_TIMES;
  const usedTimes = new Set((scrim?.slots ?? []).map((s) => s.time));
  const addableTimes = availableSlotTimes.filter((t) => !usedTimes.has(t));

  const handleAddSlot = async (time: SlotTime) => {
    if (!scrim) return;
    setAddingSlot(true);

    try {
      await createSlotRequest(scrim.id, time);
      showToast(`${slotTimeLabel(time)} slot added.`, "success");
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add slot", "error");
    } finally {
      setAddingSlot(false);
    }
  };

  // This is the "turn off today's 3pm lobby" action — closes just this one slot.
  const handleToggleSlotStatus = async (slot: Slot) => {
    setBusySlotId(slot.id);
    try {
      const nextStatus = slot.status === "OPEN" ? "CLOSED" : "OPEN";
      await updateSlotStatusRequest(slot.id, nextStatus);
      showToast(
        `${slotTimeLabel(slot.time)} is now ${nextStatus === "OPEN" ? "open" : "closed"}.`,
        "success"
      );
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update slot", "error");
    } finally {
      setBusySlotId(null);
    }
  };

  const handleDeleteSlot = async (slot: Slot) => {
    setBusySlotId(slot.id);
    try {
      await deleteSlotRequest(slot.id);
      showToast(`${slotTimeLabel(slot.time)} slot deleted.`, "success");
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete slot", "error");
    } finally {
      setBusySlotId(null);
    }
  };

  const handleReleaseRoom = async (slot: Slot) => {
    const input = roomInputs[slot.id];
    if (!input?.roomId || !input?.roomPassword) {
      showToast("Enter both Room ID and Password.", "error");
      return;
    }

    setReleasingSlotId(slot.id);
    try {
      await releaseSlotRoomRequest(slot.id, input.roomId, input.roomPassword);
      showToast(`Room details released for ${slotTimeLabel(slot.time)}.`, "success");
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to release room", "error");
    } finally {
      setReleasingSlotId(null);
    }
  };

  const toggleExpanded = (slot: Slot) => {
    if (expandedSlotId === slot.id) {
      setExpandedSlotId(null);
      return;
    }
    setExpandedSlotId(slot.id);
    if (!slotRegistrations[slot.id]) {
      getRegistrationsBySlotRequest(slot.id)
        .then((regs) => setSlotRegistrations((prev) => ({ ...prev, [slot.id]: regs })))
        .catch(() => setSlotRegistrations((prev) => ({ ...prev, [slot.id]: [] })));
    }
  };

  const handleRemoveRegistration = async (slotId: number, registration: AdminRegistration) => {
    if (!window.confirm(`Remove ${registration.teamName} from this slot? This cannot be undone.`)) return;
    setRemovingRegistrationId(registration.id);
    try {
      await removeRegistrationRequest(registration.id);
      setSlotRegistrations((prev) => ({
        ...prev,
        [slotId]: (prev[slotId] ?? []).filter((item) => item.id !== registration.id),
      }));
      showToast(`${registration.teamName} was removed.`, "success");
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove team", "error");
    } finally {
      setRemovingRegistrationId(null);
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => router.push("/admin")}
          className="mb-8 flex items-center gap-2 border border-border bg-panel px-5 py-2.5 font-mono text-sm text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Admin Dashboard
        </button>

        <div className="border border-border bg-panel p-4 sm:p-8">
          <h1 className="font-display text-3xl font-bold uppercase text-foreground">
            Manage Lobby
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
                  Prize Pool (e.g. ₹5,000 / 1000 Diamonds)
                </label>
                <input
                  value={scrim.prizePool || ""}
                  onChange={(e) => update("prizePool", e.target.value)}
                  placeholder="₹5,000"
                  className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="mb-2 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Tournament Poster URL / Image
                </label>
                <div className="flex flex-col gap-2">
                  <input
                    value={scrim.image || ""}
                    onChange={(e) => update("image", e.target.value)}
                    placeholder="https://... or select file to upload"
                    className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
                  />
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
                    <input
                      type="file"
                      accept="image/*"
                      onChange={handleImageUpload}
                      className="w-full border border-border bg-panel-2 p-2 font-mono text-sm text-foreground outline-none focus:border-cyan file:mr-4 file:py-1 file:px-3 file:border file:border-cyan/50 file:bg-cyan/10 file:text-cyan file:font-mono file:text-xs hover:file:bg-cyan/20"
                    />
                    {scrim.image && (
                      <div className="shrink-0 flex items-center gap-2">
                        <img src={scrim.image} alt="Preview" className="h-10 w-10 object-cover border border-border" />
                        <span className="font-mono text-[10px] text-cyan truncate max-w-40">{scrim.image}</span>
                      </div>
                    )}
                  </div>
                  {uploading && <p className="font-mono text-xs text-amber animate-pulse">Uploading image...</p>}
                </div>
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
                  Max Teams (per slot, default)
                </label>
                <input
                  type="number"
                  value={scrim.maxTeams}
                  onChange={(e) => update("maxTeams", Number(e.target.value))}
                  className="w-full border border-border bg-panel-2 p-3.5 font-mono text-foreground outline-none focus:border-cyan"
                />
              </div>
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

        <div className="mt-6 border border-border bg-panel p-4 sm:p-8">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">
              Time Slots
            </h2>
          </div>
          <p className="mt-2 font-mono text-xs text-muted-foreground">
            Close a slot to stop new registrations for just that time — the other slots keep
            running. Delete removes it entirely (only allowed before anyone registers).
          </p>

          <div className="mt-6 space-y-4">
            {scrim.slots.length === 0 && (
              <p className="font-mono text-sm text-muted-foreground">No time slots yet.</p>
            )}

            {[...scrim.slots]
              .sort((a, b) => availableSlotTimes.indexOf(a.time) - availableSlotTimes.indexOf(b.time))
              .map((slot) => {
                const regs = slotRegistrations[slot.id];
                const expanded = expandedSlotId === slot.id;
                const input = roomInputs[slot.id] ?? { roomId: "", roomPassword: "" };

                return (
                  <div key={slot.id} className="border border-border bg-panel-2 p-5">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <div className="flex items-center gap-3">
                        <span
                          className={`h-2 w-2 rounded-full ${
                            slot.status === "OPEN" ? "bg-cyan" : "bg-muted-foreground"
                          }`}
                        />
                        <span className="font-mono text-base font-bold text-foreground">
                          {slotTimeLabel(slot.time)}
                        </span>
                        <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                          {slot.status}
                        </span>
                        <span className="font-mono text-xs text-muted-foreground">
                          {slot._count?.registrations ?? 0} / {slot.maxTeams ?? scrim.maxTeams} teams
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-2">
                        <button
                          onClick={() => toggleExpanded(slot)}
                          className="border border-border px-3 py-2 font-mono text-xs uppercase text-muted-foreground transition hover:border-cyan hover:text-cyan"
                        >
                          {expanded ? "Hide Teams" : "View Teams"}
                        </button>
                        <button
                          onClick={() => handleToggleSlotStatus(slot)}
                          disabled={busySlotId === slot.id}
                          className="flex items-center gap-1.5 border border-amber/50 bg-amber/10 px-3 py-2 font-mono text-xs uppercase text-amber transition hover:bg-amber hover:text-void disabled:opacity-50"
                        >
                          <Power size={14} />
                          {slot.status === "OPEN" ? "Close" : "Reopen"}
                        </button>
                        <button
                          onClick={() => handleDeleteSlot(slot)}
                          disabled={busySlotId === slot.id || (slot._count?.registrations ?? 0) > 0}
                          className="flex items-center gap-1.5 border border-destructive/50 bg-destructive/10 px-3 py-2 font-mono text-xs uppercase text-destructive transition hover:bg-destructive hover:text-void disabled:opacity-30"
                          title={
                            (slot._count?.registrations ?? 0) > 0
                              ? "Close it instead — it already has registrations"
                              : "Delete this slot"
                          }
                        >
                          <Trash2 size={14} />
                          Delete
                        </button>
                      </div>
                    </div>

                    <div className="mt-4 grid gap-3 border-t border-border/50 pt-4 md:grid-cols-[1fr_1fr_auto]">
                      <input
                        value={input.roomId}
                        onChange={(e) =>
                          setRoomInputs((prev) => ({
                            ...prev,
                            [slot.id]: { ...input, roomId: e.target.value },
                          }))
                        }
                        placeholder="Room ID"
                        className="border border-border bg-panel p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                      />
                      <input
                        value={input.roomPassword}
                        onChange={(e) =>
                          setRoomInputs((prev) => ({
                            ...prev,
                            [slot.id]: { ...input, roomPassword: e.target.value },
                          }))
                        }
                        placeholder="Room Password"
                        className="border border-border bg-panel p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
                      />
                      <button
                        onClick={() => handleReleaseRoom(slot)}
                        disabled={releasingSlotId === slot.id}
                        className="flex items-center justify-center gap-2 border border-cyan bg-cyan/10 px-4 py-3 font-mono text-xs font-bold uppercase text-cyan transition hover:bg-cyan hover:text-void disabled:opacity-50"
                      >
                        <KeyRound size={14} />
                        {slot.roomReleased ? "Update" : "Release"}
                      </button>
                    </div>
                    {slot.roomReleased && (
                      <p className="mt-2 font-mono text-xs text-cyan">
                        Live — Room ID: {slot.roomId} · Password: {slot.roomPassword}
                      </p>
                    )}

                    {expanded && (
                      <div className="mt-4 border-t border-border/50 pt-4">
                        {!regs ? (
                          <Skeleton className="h-16 w-full" />
                        ) : regs.length === 0 ? (
                          <p className="font-mono text-xs text-muted-foreground">
                            No teams registered yet for this slot.
                          </p>
                        ) : (
                          <div className="overflow-x-auto">
                            <table className="w-full font-mono text-xs">
                              <thead>
                                <tr className="border-b border-border text-left text-muted-foreground">
                                  <th className="pb-2 pr-4">#</th>
                                  <th className="pb-2 pr-4">Team</th>
                                  <th className="pb-2 pr-4">IGL</th>
                                  <th className="pb-2 pr-4">Phone</th>
                                  <th className="pb-2 pr-4">Code</th>
                                  <th className="pb-2">Payment</th>
                                  <th className="pb-2 pl-4">Action</th>
                                </tr>
                              </thead>
                              <tbody>
                                {regs.map((reg) => (
                                  <tr key={reg.id} className="border-b border-border/30 text-foreground">
                                    <td className="py-2 pr-4">#{reg.slotNumber}</td>
                                    <td className="py-2 pr-4">{reg.teamName}</td>
                                    <td className="py-2 pr-4">{reg.iglName}</td>
                                    <td className="py-2 pr-4">{reg.phone}</td>
                                    <td className="py-2 pr-4">{reg.registrationCode}</td>
                                    <td className="py-2">
                                      <span className={reg.paymentStatus === "PAID" ? "text-cyan" : "text-amber"}>
                                        {reg.paymentStatus}
                                      </span>
                                    </td>
                                    <td className="py-2 pl-4">
                                      <button
                                        onClick={() => handleRemoveRegistration(slot.id, reg)}
                                        disabled={removingRegistrationId === reg.id}
                                        className="inline-flex items-center gap-1 border border-destructive/50 px-2 py-1 text-destructive transition hover:bg-destructive hover:text-void disabled:opacity-50"
                                        aria-label={`Remove ${reg.teamName}`}
                                      >
                                        <Trash2 size={13} />
                                        {removingRegistrationId === reg.id ? "Removing" : "Remove"}
                                      </button>
                                    </td>
                                  </tr>
                                ))}
                              </tbody>
                            </table>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                );
              })}
          </div>

          {addableTimes.length > 0 && (
            <div className="mt-6 border-t border-border pt-6">
              <p className="mb-3 font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Add a Time Slot
              </p>
              <div className="flex flex-wrap gap-3">
                {addableTimes.map((time) => (
                  <button
                    key={time}
                    onClick={() => handleAddSlot(time)}
                    disabled={addingSlot}
                    className="flex items-center gap-2 border border-border px-4 py-2.5 font-mono text-sm text-foreground transition hover:border-ember hover:text-ember disabled:opacity-50"
                  >
                    <Plus size={14} />
                    {slotTimeLabel(time)}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </main>
  );
}
