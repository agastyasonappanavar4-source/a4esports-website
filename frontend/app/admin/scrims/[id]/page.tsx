"use client";

import { scrimModeLabel } from "@/lib/scrimMode";
import type { ScrimMode } from "@/lib/scrimMode";
import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  KeyRound,
  Save,
  Trash2,
  Power,
  Users,
  Trophy,
  CheckCircle2,
  XCircle,
  Clock,
  Plus,
  ArrowRightLeft,
  Search,
  Sliders,
  Sparkles,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { type Scrim, type Slot } from "@/lib/scrims";
import { slotTimeLabel } from "@/lib/slotTime";
import {
  updateScrimRequest,
  getAdminScrimByIdRequest,
  updateSlotRequest,
  updateSlotStatusRequest,
  releaseSlotRoomRequest,
  getRegistrationsBySlotRequest,
  removeRegistrationRequest,
  verifyPaymentRequest,
  rejectPaymentRequest,
  moveRegistrationSlotRequest,
  adminRegisterTeamRequest,
  uploadImageRequest,
  getSlotMatchesRequest,
  createSlotMatchRequest,
  updateSlotMatchRequest,
  deleteSlotMatchRequest,
  type AdminRegistration,
  type SlotMatch,
} from "@/services/admin";
import { Skeleton } from "@/components/ui/Skeleton";
import PaymentQrField from "@/components/admin/PaymentQrField";

export default function ManageScrimPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params);
  const scrimId = Number(resolvedParams.id);

  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [scrim, setScrim] = useState<Scrim | null>(null);
  const [activeTab, setActiveTab] = useState<"general" | "slots" | "teams" | "room" | "results">("general");

  // General Tab state
  const [savingGeneral, setSavingGeneral] = useState(false);
  const [uploading, setUploading] = useState(false);

  // Slots Tab state
  const [editingSlotTime, setEditingSlotTime] = useState<Record<number, string>>({});
  const [savingSlotId, setSavingSlotId] = useState<number | null>(null);

  // Teams Tab (Slot-Isolated) state
  const [selectedSlotId, setSelectedSlotId] = useState<number | null>(null);
  const [slotTeams, setSlotTeams] = useState<Record<number, AdminRegistration[]>>({});
  const [loadingTeams, setLoadingTeams] = useState(false);
  const [teamSearchQuery, setTeamSearchQuery] = useState("");
  const [processingRegId, setProcessingRegId] = useState<number | null>(null);

  // Move Slot Modal state
  const [moveModalOpen, setMoveModalOpen] = useState(false);
  const [teamToMove, setTeamToMove] = useState<AdminRegistration | null>(null);
  const [targetSlotId, setTargetSlotId] = useState<string>("");

  // Manual Add Team state
  const [addTeamModalOpen, setAddTeamModalOpen] = useState(false);
  const [newTeamName, setNewTeamName] = useState("");
  const [newIglName, setNewIglName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState<"PAID" | "PENDING">("PAID");

  // Room Tab state
  const [roomInputs, setRoomInputs] = useState<Record<number, { roomId: string; roomPassword: string }>>({});
  const [releasingSlotId, setReleasingSlotId] = useState<number | null>(null);

  // Results Tab state
  const [slotMatches, setSlotMatches] = useState<SlotMatch[]>([]);
  const [activeMatchId, setActiveMatchId] = useState<number | null>(null);
  const [editableResults, setEditableResults] = useState<{
    registrationId: number;
    rank: number;
    won: number;
    pp: number;
    kp: number;
    tp: number;
  }[]>([]);
  const [savingResults, setSavingResults] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push(user ? "/platform" : "/");
    }
  }, [authLoading, user, router]);

  const loadScrim = () => {
    getAdminScrimByIdRequest(scrimId).then((data) => {
      setScrim(data);
      if (data && data.slots?.length > 0) {
        if (!selectedSlotId) {
          setSelectedSlotId(data.slots[0].id);
        }
        // Initialize room inputs
        const inputs: Record<number, { roomId: string; roomPassword: string }> = {};
        const times: Record<number, string> = {};
        data.slots.forEach((s) => {
          inputs[s.id] = { roomId: s.roomId || "", roomPassword: s.roomPassword || "" };
          times[s.id] = s.customTime || slotTimeLabel(s.time);
        });
        setRoomInputs(inputs);
        setEditingSlotTime(times);
      }
    });
  };

  useEffect(() => {
    loadScrim();
  }, [scrimId]);

  // Fetch teams for selected slot
  const loadSlotTeams = (slotId: number) => {
    setLoadingTeams(true);
    getRegistrationsBySlotRequest(slotId)
      .then((regs) => {
        setSlotTeams((prev) => ({ ...prev, [slotId]: regs }));
      })
      .catch(() => {
        setSlotTeams((prev) => ({ ...prev, [slotId]: [] }));
      })
      .finally(() => setLoadingTeams(false));
  };

  // Fetch matches for results tab
  const loadMatches = (slotId: number) => {
    getSlotMatchesRequest(slotId)
      .then((data) => {
        const mList = data.matches || [];
        setSlotMatches(mList);
        if (mList.length > 0) {
          const firstMatch = mList[0];
          setActiveMatchId(firstMatch.id);
          setEditableResults(
            firstMatch.results.map((r) => ({
              registrationId: r.registrationId,
              rank: r.rank,
              won: r.won,
              pp: r.pp,
              kp: r.kp,
              tp: r.tp,
            }))
          );
        } else {
          setActiveMatchId(null);
          setEditableResults([]);
        }
      })
      .catch(() => {
        setSlotMatches([]);
        setEditableResults([]);
      });
  };

  useEffect(() => {
    if (selectedSlotId) {
      // Show a loader while the selected slot's teams are fetched.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      loadSlotTeams(selectedSlotId);
      if (activeTab === "results") {
        loadMatches(selectedSlotId);
      }
    }
  }, [selectedSlotId, activeTab]);

  const updateGeneral = <K extends keyof Scrim>(key: K, value: Scrim[K]) => {
    setScrim((prev) => (prev ? { ...prev, [key]: value } : prev));
  };

  const handleSaveGeneral = async () => {
    if (!scrim) return;
    setSavingGeneral(true);
    try {
      await updateScrimRequest(scrim.id, {
        title: scrim.title,
        mode: scrim.mode,
        fee: scrim.fee,
        date: scrim.date,
        image: scrim.image,
        paymentQrImage: scrim.paymentQrImage,
        paymentUpiId: scrim.paymentUpiId,
        prizePool: scrim.prizePool,
        rules: scrim.rules,
        maxTeams: scrim.maxTeams,
      });
      showToast("General tournament settings saved!", "success");
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save settings", "error");
    } finally {
      setSavingGeneral(false);
    }
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
        updateGeneral("image", res.url);
        showToast("Poster image uploaded successfully.", "success");
      } catch (err) {
        showToast(err instanceof Error ? err.message : "Failed to upload image", "error");
      } finally {
        setUploading(false);
      }
    };
    reader.readAsDataURL(file);
  };

  // Slot timing update
  const handleSaveSlotTiming = async (slot: Slot) => {
    const newTiming = editingSlotTime[slot.id];
    setSavingSlotId(slot.id);
    try {
      await updateSlotRequest(slot.id, null);
      // Call backend with customTime
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/scrims/slots/${slot.id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ customTime: newTiming }),
      });
      if (!res.ok) throw new Error("Failed to update timing");
      showToast(`Slot timing updated to "${newTiming}".`, "success");
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update slot timing", "error");
    } finally {
      setSavingSlotId(null);
    }
  };

  const handleToggleSlot = async (slot: Slot) => {
    const next = slot.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      await updateSlotStatusRequest(slot.id, next);
      showToast(`${slotTimeLabel(slot)} is now ${next}.`, "success");
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update slot status", "error");
    }
  };

  // Verify payment
  const handleVerifyPayment = async (reg: AdminRegistration) => {
    setProcessingRegId(reg.id);
    try {
      await verifyPaymentRequest(reg.id);
      showToast(`Payment confirmed for team "${reg.teamName}"!`, "success");
      if (selectedSlotId) loadSlotTeams(selectedSlotId);
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to verify payment", "error");
    } finally {
      setProcessingRegId(null);
    }
  };

  // Reject payment
  const handleRejectPayment = async (reg: AdminRegistration) => {
    const reason = window.prompt(`Reject payment for "${reg.teamName}"? Enter reason:`, "Payment not received");
    if (reason === null) return;

    setProcessingRegId(reg.id);
    try {
      await rejectPaymentRequest(reg.id, reason);
      showToast(`Payment rejected for team "${reg.teamName}".`, "success");
      if (selectedSlotId) loadSlotTeams(selectedSlotId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to reject payment", "error");
    } finally {
      setProcessingRegId(null);
    }
  };

  // Remove team
  const handleRemoveTeam = async (reg: AdminRegistration) => {
    if (!window.confirm(`Remove team "${reg.teamName}" from this slot? This cannot be undone.`)) return;
    setProcessingRegId(reg.id);
    try {
      await removeRegistrationRequest(reg.id);
      showToast(`Team "${reg.teamName}" removed.`, "success");
      if (selectedSlotId) loadSlotTeams(selectedSlotId);
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove team", "error");
    } finally {
      setProcessingRegId(null);
    }
  };

  // Move slot submit
  const handleMoveSlotSubmit = async () => {
    if (!teamToMove || !targetSlotId) return;
    setProcessingRegId(teamToMove.id);
    try {
      await moveRegistrationSlotRequest(teamToMove.id, Number(targetSlotId));
      showToast(`Moved "${teamToMove.teamName}" to new slot!`, "success");
      setMoveModalOpen(false);
      setTeamToMove(null);
      if (selectedSlotId) loadSlotTeams(selectedSlotId);
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to move team", "error");
    } finally {
      setProcessingRegId(null);
    }
  };

  // Manual Add Team into current slot
  const handleAddTeamSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !newTeamName || !newIglName || !newPhone) {
      showToast("Please fill all fields.", "error");
      return;
    }
    try {
      await adminRegisterTeamRequest({
        slotId: selectedSlotId,
        teamName: newTeamName,
        iglName: newIglName,
        phone: newPhone,
        paymentStatus: newPaymentStatus,
      });
      showToast(`Team "${newTeamName}" added successfully!`, "success");
      setAddTeamModalOpen(false);
      setNewTeamName("");
      setNewIglName("");
      setNewPhone("");
      loadSlotTeams(selectedSlotId);
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to add team", "error");
    }
  };

  // Release Room
  const handleReleaseRoom = async (slot: Slot) => {
    const input = roomInputs[slot.id];
    if (!input?.roomId || !input?.roomPassword) {
      showToast("Enter both Room ID and Password.", "error");
      return;
    }
    setReleasingSlotId(slot.id);
    try {
      await releaseSlotRoomRequest(slot.id, input.roomId, input.roomPassword);
      showToast(`Room released for ${slotTimeLabel(slot)}!`, "success");
      loadScrim();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to release room", "error");
    } finally {
      setReleasingSlotId(null);
    }
  };

  // Results Tab handlers
  const handleSelectMatch = (m: SlotMatch) => {
    setActiveMatchId(m.id);
    setEditableResults(
      m.results.map((r) => ({
        registrationId: r.registrationId,
        rank: r.rank,
        won: r.won,
        pp: r.pp,
        kp: r.kp,
        tp: r.tp,
      }))
    );
  };

  const handleCreateNewMatch = async () => {
    if (!selectedSlotId) return;
    const nextMatchNum = slotMatches.length + 1;
    try {
      const currentTeams = slotTeams[selectedSlotId] || [];
      const initialResults = currentTeams.map((t, idx) => ({
        registrationId: t.id,
        rank: idx + 1,
        won: 0,
        pp: 0,
        kp: 0,
        tp: 0,
      }));

      const newMatch = await createSlotMatchRequest(selectedSlotId, {
        matchNumber: nextMatchNum,
        title: `Match ${nextMatchNum}`,
        results: initialResults,
      });
      showToast(`Created Match ${nextMatchNum}!`, "success");
      loadMatches(selectedSlotId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create match", "error");
    }
  };

  const handleAddResultRow = () => {
    const currentTeams = (slotTeams[selectedSlotId || 0] || []).filter((t) => t.paymentStatus === "PAID");
    const firstAvailable = currentTeams.find(
      (t) => !editableResults.some((r) => r.registrationId === t.id)
    ) || currentTeams[0];

    if (!firstAvailable) {
      showToast("No more confirmed teams to add to this match.", "error");
      return;
    }

    setEditableResults((prev) => [
      ...prev,
      {
        registrationId: firstAvailable.id,
        rank: prev.length + 1,
        won: 0,
        pp: 0,
        kp: 0,
        tp: 0,
      },
    ]);
  };

  const handleUpdateResultRow = (index: number, field: keyof (typeof editableResults)[number], value: string) => {
    setEditableResults((prev) => {
      const next = [...prev];
      next[index] = { ...next[index], [field]: Number(value) || 0 };
      return next;
    });
  };

  const handleDeleteResultRow = (index: number) => {
    setEditableResults((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSaveMatchResults = async () => {
    if (!activeMatchId) return;
    setSavingResults(true);
    try {
      await updateSlotMatchRequest(activeMatchId, {
        results: editableResults,
      });
      showToast("Match results saved successfully!", "success");
      if (selectedSlotId) loadMatches(selectedSlotId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to save results", "error");
    } finally {
      setSavingResults(false);
    }
  };

  const handleDeleteMatch = async () => {
    if (!activeMatchId) return;
    if (!window.confirm("Delete this match? Other matches will remain intact.")) return;
    try {
      await deleteSlotMatchRequest(activeMatchId);
      showToast("Match deleted.", "success");
      if (selectedSlotId) loadMatches(selectedSlotId);
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete match", "error");
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">Checking admin privileges...</p>
      </main>
    );
  }

  if (!scrim) {
    return (
      <main className="min-h-screen bg-background bg-tactical-grid">
        <div className="mx-auto max-w-6xl px-4 py-12">
          <Skeleton className="mb-6 h-10 w-36" />
          <Skeleton className="h-96 w-full" />
        </div>
      </main>
    );
  }

  // Active slot object
  const activeSlot = scrim.slots.find((s) => s.id === selectedSlotId) || scrim.slots[0];
  const activeSlotTeamsList = slotTeams[selectedSlotId || 0] || [];

  const filteredTeams = activeSlotTeamsList.filter((team) => {
    const q = teamSearchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      team.teamName.toLowerCase().includes(q) ||
      team.iglName.toLowerCase().includes(q) ||
      team.phone.includes(q) ||
      team.registrationCode.toLowerCase().includes(q)
    );
  });

  const confirmedCount = activeSlotTeamsList.filter((t) => t.paymentStatus === "PAID").length;
  const pendingCount = activeSlotTeamsList.filter((t) => t.paymentStatus === "PENDING").length;
  const maxCapacity = activeSlot?.maxTeams ?? scrim.maxTeams;

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 py-6 sm:py-10">
        {/* Back Link */}
        <button
          onClick={() => router.push("/admin")}
          className="mb-6 flex items-center gap-2 border border-border bg-panel px-4 py-2 font-mono text-xs text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Admin Dashboard
        </button>

        {/* Hub Header */}
        <div className="border border-border bg-panel p-5 sm:p-7 flex flex-wrap items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-cyan animate-pulse-dot" />
              <span className="font-mono text-xs uppercase tracking-widest text-cyan font-bold">
                {scrimModeLabel(scrim.mode)} · Tournament Hub
              </span>
            </div>
            <h1 className="mt-1 font-display text-2xl sm:text-3xl font-bold uppercase text-foreground">
              {scrim.title}
            </h1>
          </div>

          <div className="flex items-center gap-3">
            <span
              className={`px-3 py-1 font-mono text-xs font-bold uppercase tracking-wider rounded-md ${
                scrim.status === "OPEN"
                  ? "bg-cyan/15 text-cyan border border-cyan/30"
                  : "bg-destructive/15 text-destructive border border-destructive/30"
              }`}
            >
              Lobby: {scrim.status}
            </span>
          </div>
        </div>

        {/* Tabs Bar */}
        <div className="mt-6 border-b border-border flex overflow-x-auto scrollbar-hide gap-1 sm:gap-4">
          {[
            { id: "general", label: "General" },
            { id: "slots", label: "4 Slots Config" },
            { id: "teams", label: "Teams (By Slot)" },
            { id: "room", label: "Room Release" },
            { id: "results", label: "Match Results" },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-4 sm:px-6 py-3 font-display text-sm font-bold uppercase tracking-wider transition whitespace-nowrap relative ${
                activeTab === tab.id
                  ? "text-cyan after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-cyan"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* TAB 1: GENERAL */}
        {activeTab === "general" && (
          <div className="mt-6 border border-border bg-panel p-5 sm:p-8 space-y-5">
            <h2 className="font-display text-xl font-bold uppercase text-foreground">
              General Tournament Settings
            </h2>

            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Title
              </label>
              <input
                value={scrim.title}
                onChange={(e) => updateGeneral("title", e.target.value)}
                className="w-full border border-border bg-panel-2 p-3 font-mono text-foreground outline-none focus:border-cyan"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Mode
                </label>
                <select
                  value={scrim.mode}
                  onChange={(e) => updateGeneral("mode", e.target.value as ScrimMode)}
                  className="w-full border border-border bg-panel-2 p-3 font-mono text-foreground outline-none focus:border-cyan"
                >
                  <option value="BR">Battle Royale</option>
                  <option value="CS">Clash Squad</option>
                  <option value="SPECIAL">Special Lobbies</option>
                </select>
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Entry Fee (₹)
                </label>
                <input
                  type="number"
                  value={scrim.fee}
                  onChange={(e) => updateGeneral("fee", Number(e.target.value))}
                  className="w-full border border-border bg-panel-2 p-3 font-mono text-foreground outline-none focus:border-cyan"
                />
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Date
                </label>
                <input
                  type="date"
                  value={scrim.date.slice(0, 10)}
                  onChange={(e) => updateGeneral("date", e.target.value)}
                  className="w-full border border-border bg-panel-2 p-3 font-mono text-foreground outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  Max Teams (Per Slot Default)
                </label>
                <input
                  type="number"
                  value={scrim.maxTeams}
                  onChange={(e) => updateGeneral("maxTeams", Number(e.target.value))}
                  className="w-full border border-border bg-panel-2 p-3 font-mono text-foreground outline-none focus:border-cyan"
                />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Prize Pool
              </label>
              <input
                value={scrim.prizePool || ""}
                onChange={(e) => updateGeneral("prizePool", e.target.value)}
                placeholder="e.g. ₹5,000 / 1000 Diamonds"
                className="w-full border border-border bg-panel-2 p-3 font-mono text-foreground outline-none focus:border-cyan"
              />
            </div>

            {/* Poster Upload */}
            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Tournament Poster
              </label>
              <div className="space-y-2">
                <input
                  value={scrim.image || ""}
                  onChange={(e) => updateGeneral("image", e.target.value)}
                  placeholder="Image URL or upload file below"
                  className="w-full border border-border bg-panel-2 p-3 font-mono text-foreground outline-none focus:border-cyan text-sm"
                />
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageUpload}
                  className="w-full border border-border bg-panel-2 p-2 font-mono text-xs text-foreground file:mr-3 file:py-1 file:px-3 file:border file:border-cyan/40 file:bg-cyan/10 file:text-cyan file:font-mono hover:file:bg-cyan/20"
                />
                {uploading && <p className="font-mono text-xs text-amber animate-pulse">Uploading...</p>}
                {scrim.image && (
                  <div className="mt-2 h-28 w-44 rounded-lg overflow-hidden border border-border bg-void">
                    <img src={scrim.image} alt="Preview" className="h-full w-full object-cover" />
                  </div>
                )}
              </div>
            </div>

            <PaymentQrField
              value={scrim.paymentQrImage ?? null}
              onChange={(value) => updateGeneral("paymentQrImage", value)}
            />
            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                UPI ID for this lobby (optional with QR)
              </label>
              <input
                value={scrim.paymentUpiId ?? ""}
                onChange={(e) => updateGeneral("paymentUpiId", e.target.value)}
                placeholder="name@bank"
                className="w-full border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
              />
              <p className="mt-1 font-mono text-xs text-muted-foreground">
                Use the UPI ID that belongs to this QR. Leave it blank for QR-only payments.
              </p>
              {scrim.fee > 0 && scrim.paymentQrImage === "" && !scrim.paymentUpiId && (
                <p className="mt-2 font-mono text-xs text-amber">
                  This paid lobby has no payment method. Players will see payment details unavailable until you add a new QR or UPI ID.
                </p>
              )}
            </div>

            <div>
              <label className="mb-1.5 block font-mono text-xs uppercase tracking-widest text-muted-foreground">
                Rules (One per line)
              </label>
              <textarea
                value={scrim.rules}
                onChange={(e) => updateGeneral("rules", e.target.value)}
                rows={5}
                className="w-full border border-border bg-panel-2 p-3 font-mono text-xs text-foreground outline-none focus:border-cyan"
              />
            </div>

            <button
              onClick={handleSaveGeneral}
              disabled={savingGeneral}
              className="btn-press flex w-full items-center justify-center gap-2 bg-ember py-3.5 font-display text-base font-bold uppercase text-void transition hover:bg-[var(--ember-deep)] disabled:opacity-50"
            >
              <Save size={18} />
              {savingGeneral ? "Saving..." : "Save Tournament Settings"}
            </button>
          </div>
        )}

        {/* TAB 2: EXACTLY 4 SLOTS CONFIG */}
        {activeTab === "slots" && (
          <div className="mt-6 border border-border bg-panel p-5 sm:p-8 space-y-5">
            <div className="flex items-center justify-between">
              <h2 className="font-display text-xl font-bold uppercase text-foreground">
                Four Configurable Time Slots
              </h2>
              <span className="font-mono text-xs text-cyan">
                Exactly 4 Slots Guaranteed
              </span>
            </div>
            <p className="font-mono text-xs text-muted-foreground">
              Configure the exact display timings and toggle open/closed state for each of the 4 slots. Creating a 5th slot or deleting slots is strictly disallowed to preserve the 4-slot architecture.
            </p>

            <div className="mt-4 space-y-4">
              {scrim.slots.map((slot, index) => (
                <div key={slot.id} className="border border-border bg-panel-2 p-4 sm:p-5 rounded-lg space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <span className="flex h-6 w-6 items-center justify-center rounded-full bg-cyan/15 text-cyan font-mono text-xs font-bold">
                        {index + 1}
                      </span>
                      <span className="font-mono text-sm font-bold text-foreground">
                        {slotTimeLabel(slot)}
                      </span>
                      <span
                        className={`font-mono text-[10px] uppercase tracking-widest px-2 py-0.5 rounded ${
                          slot.status === "OPEN" ? "bg-cyan/15 text-cyan" : "bg-destructive/15 text-destructive"
                        }`}
                      >
                        {slot.status}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => handleToggleSlot(slot)}
                        className="flex items-center gap-1.5 border border-amber/50 bg-amber/10 px-3 py-1.5 font-mono text-xs uppercase text-amber transition hover:bg-amber hover:text-void"
                      >
                        <Power size={13} />
                        {slot.status === "OPEN" ? "Close Slot" : "Reopen"}
                      </button>
                    </div>
                  </div>

                  {/* Configurable Timing Input */}
                  <div className="flex flex-wrap items-center gap-3 border-t border-border/40 pt-3">
                    <div className="flex-1 min-w-[200px]">
                      <label className="block font-mono text-[10px] uppercase text-muted-foreground mb-1">
                        Configured Timing Label (e.g. 3:00 PM, 4:30 PM)
                      </label>
                      <input
                        value={editingSlotTime[slot.id] || ""}
                        onChange={(e) =>
                          setEditingSlotTime((prev) => ({ ...prev, [slot.id]: e.target.value }))
                        }
                        className="w-full border border-border bg-panel p-2 font-mono text-xs text-foreground outline-none focus:border-cyan"
                      />
                    </div>

                    <button
                      onClick={() => handleSaveSlotTiming(slot)}
                      disabled={savingSlotId === slot.id}
                      className="mt-4 shrink-0 flex items-center gap-1.5 bg-cyan px-4 py-2 font-display text-xs font-bold uppercase text-void transition hover:bg-cyan/90 disabled:opacity-50"
                    >
                      <Save size={13} />
                      {savingSlotId === slot.id ? "Saving" : "Save Timing"}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* TAB 3: TEAMS (SLOT-ISOLATED) */}
        {activeTab === "teams" && (
          <div className="mt-6 border border-border bg-panel p-5 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold uppercase text-foreground">
                  Slot Team Management
                </h2>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  Inspecting teams strictly isolated by time slot. Registrations from other timings are never mixed.
                </p>
              </div>

              <button
                onClick={() => setAddTeamModalOpen(true)}
                className="flex items-center gap-2 bg-cyan px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-void transition hover:bg-cyan/90"
              >
                <Plus size={14} />
                Add Team to This Slot
              </button>
            </div>

            {/* Slot Selector Bar (4 Slots) */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 border-b border-border/80 pb-4">
              {scrim.slots.map((s) => {
                const isSelected = s.id === selectedSlotId;
                return (
                  <button
                    key={s.id}
                    onClick={() => setSelectedSlotId(s.id)}
                    className={`p-3 rounded-lg border text-left font-mono transition ${
                      isSelected
                        ? "border-cyan bg-cyan/15 text-cyan shadow-sm"
                        : "border-border bg-panel-2 text-muted-foreground hover:border-cyan/50 hover:text-foreground"
                    }`}
                  >
                    <p className="text-[10px] uppercase tracking-wider font-bold">
                      {s.time}
                    </p>
                    <p className="text-sm font-bold text-foreground truncate mt-0.5">
                      {slotTimeLabel(s)}
                    </p>
                  </button>
                );
              })}
            </div>

            {/* Summary Metrics for Selected Slot */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 font-mono text-xs">
              <div className="border border-border bg-panel-2 p-3 rounded">
                <span className="text-muted-foreground text-[10px] uppercase">Confirmed</span>
                <p className="text-lg font-bold text-cyan mt-1">{confirmedCount}</p>
              </div>
              <div className="border border-border bg-panel-2 p-3 rounded">
                <span className="text-muted-foreground text-[10px] uppercase">Pending Verification</span>
                <p className="text-lg font-bold text-amber mt-1">{pendingCount}</p>
              </div>
              <div className="border border-border bg-panel-2 p-3 rounded">
                <span className="text-muted-foreground text-[10px] uppercase">Available Capacity</span>
                <p className="text-lg font-bold text-foreground mt-1">
                  {Math.max(0, maxCapacity - confirmedCount)}
                </p>
              </div>
              <div className="border border-border bg-panel-2 p-3 rounded">
                <span className="text-muted-foreground text-[10px] uppercase">Total Registered</span>
                <p className="text-lg font-bold text-foreground mt-1">
                  {activeSlotTeamsList.length}
                </p>
              </div>
            </div>

            {/* Search Bar */}
            <div className="flex max-w-md items-center border border-border bg-panel-2 px-3 py-2 focus-within:border-cyan">
              <Search size={16} className="text-muted-foreground shrink-0" />
              <input
                value={teamSearchQuery}
                onChange={(e) => setTeamSearchQuery(e.target.value)}
                placeholder="Search team, IGL, phone, or code..."
                className="ml-2 w-full bg-transparent font-mono text-xs text-foreground outline-none"
              />
            </div>

            {/* Teams Table */}
            {loadingTeams ? (
              <Skeleton className="h-40 w-full" />
            ) : filteredTeams.length === 0 ? (
              <p className="border border-dashed border-border p-8 text-center font-mono text-xs text-muted-foreground">
                No teams registered in this timing slot yet.
              </p>
            ) : (
              <div className="overflow-x-auto border border-border">
                <table className="w-full min-w-[760px] border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-border bg-panel-2 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                      <th className="p-3">#Slot</th>
                      <th className="p-3">Team Name</th>
                      <th className="p-3">IGL</th>
                      <th className="p-3">Phone</th>
                      <th className="p-3">Code</th>
                      <th className="p-3">Payment</th>
                      <th className="p-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-border/40">
                    {filteredTeams.map((reg) => {
                      const isPaid = reg.paymentStatus === "PAID";
                      const isPending = reg.paymentStatus === "PENDING";

                      return (
                        <tr key={reg.id} className="hover:bg-panel-2/30">
                          <td className="p-3 font-bold text-foreground">
                            {reg.slotNumber > 0 ? `#${reg.slotNumber}` : "-"}
                          </td>
                          <td className="p-3 font-semibold text-foreground">{reg.teamName}</td>
                          <td className="p-3 text-muted-foreground">{reg.iglName}</td>
                          <td className="p-3 text-muted-foreground">{reg.phone}</td>
                          <td className="p-3 text-[11px] text-muted-foreground max-w-[140px] truncate">
                            {reg.registrationCode}
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                                isPaid
                                  ? "bg-cyan/15 text-cyan border border-cyan/30"
                                  : isPending
                                  ? "bg-amber/15 text-amber border border-amber/30 animate-pulse"
                                  : "bg-destructive/15 text-destructive border border-destructive/30"
                              }`}
                            >
                              {reg.paymentStatus}
                            </span>
                          </td>
                          <td className="p-3 text-right">
                            <div className="flex items-center justify-end gap-1.5">
                              {/* Verify Button for Pending */}
                              {isPending && (
                                <button
                                  onClick={() => handleVerifyPayment(reg)}
                                  disabled={processingRegId === reg.id}
                                  className="flex items-center gap-1 border border-cyan bg-cyan/15 px-2 py-1 text-[11px] font-bold text-cyan hover:bg-cyan hover:text-void transition"
                                  title="Confirm Manual Payment"
                                >
                                  <CheckCircle2 size={12} />
                                  Verify
                                </button>
                              )}

                              {/* Reject Button for Pending */}
                              {isPending && (
                                <button
                                  onClick={() => handleRejectPayment(reg)}
                                  disabled={processingRegId === reg.id}
                                  className="flex items-center gap-1 border border-destructive/50 bg-destructive/10 px-2 py-1 text-[11px] text-destructive hover:bg-destructive hover:text-void transition"
                                  title="Reject Payment"
                                >
                                  <XCircle size={12} />
                                  Reject
                                </button>
                              )}

                              {/* Move Slot Button */}
                              <button
                                onClick={() => {
                                  setTeamToMove(reg);
                                  setTargetSlotId(String(scrim.slots.find((s) => s.id !== reg.slotId)?.id || ""));
                                  setMoveModalOpen(true);
                                }}
                                className="flex items-center gap-1 border border-border px-2 py-1 text-[11px] text-muted-foreground hover:border-cyan hover:text-cyan transition"
                                title="Move to another slot"
                              >
                                <ArrowRightLeft size={12} />
                                Move
                              </button>

                              {/* Remove Team Button */}
                              <button
                                onClick={() => handleRemoveTeam(reg)}
                                disabled={processingRegId === reg.id}
                                className="border border-destructive/40 p-1 text-destructive hover:bg-destructive hover:text-void transition"
                                title="Remove team"
                              >
                                <Trash2 size={13} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        )}

        {/* TAB 4: ROOM RELEASE */}
        {activeTab === "room" && (
          <div className="mt-6 border border-border bg-panel p-5 sm:p-8 space-y-6">
            <div>
              <h2 className="font-display text-xl font-bold uppercase text-foreground">
                Room Management
              </h2>
              <p className="font-mono text-xs text-muted-foreground mt-1">
                Release Room ID and Password for each slot. Room credentials will become visible only to confirmed (PAID) players for that specific slot.
              </p>
            </div>

            <div className="space-y-4">
              {scrim.slots.map((slot) => {
                const input = roomInputs[slot.id] || { roomId: "", roomPassword: "" };
                const isReleased = slot.roomReleased;

                return (
                  <div key={slot.id} className="border border-border bg-panel-2 p-4 sm:p-5 rounded-lg space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 font-mono text-sm font-bold text-foreground">
                        <KeyRound size={16} className="text-cyan" />
                        <span>{slotTimeLabel(slot)}</span>
                      </div>
                      <span
                        className={`font-mono text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded ${
                          isReleased ? "bg-cyan/15 text-cyan border border-cyan/30" : "bg-muted text-muted-foreground"
                        }`}
                      >
                        {isReleased ? "Released to Players" : "Unreleased"}
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <input
                        value={input.roomId}
                        onChange={(e) =>
                          setRoomInputs((prev) => ({
                            ...prev,
                            [slot.id]: { ...input, roomId: e.target.value },
                          }))
                        }
                        placeholder="Enter Room ID"
                        className="border border-border bg-panel p-2.5 font-mono text-xs text-foreground outline-none focus:border-cyan"
                      />
                      <input
                        value={input.roomPassword}
                        onChange={(e) =>
                          setRoomInputs((prev) => ({
                            ...prev,
                            [slot.id]: { ...input, roomPassword: e.target.value },
                          }))
                        }
                        placeholder="Enter Room Password"
                        className="border border-border bg-panel p-2.5 font-mono text-xs text-foreground outline-none focus:border-cyan"
                      />
                      <button
                        onClick={() => handleReleaseRoom(slot)}
                        disabled={releasingSlotId === slot.id}
                        className="flex items-center justify-center gap-1.5 bg-cyan px-4 py-2.5 font-display text-xs font-bold uppercase text-void transition hover:bg-cyan/90 disabled:opacity-50"
                      >
                        <KeyRound size={14} />
                        {releasingSlotId === slot.id ? "Releasing..." : isReleased ? "Update & Re-release" : "Release Room"}
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 5: RESULTS (MULTI-MATCH TABLE EDITOR) */}
        {activeTab === "results" && (
          <div className="mt-6 border border-border bg-panel p-5 sm:p-8 space-y-6">
            <div className="flex flex-wrap items-center justify-between gap-4">
              <div>
                <h2 className="font-display text-xl font-bold uppercase text-foreground">
                  Match Results Editor
                </h2>
                <p className="font-mono text-xs text-muted-foreground mt-1">
                  Each match is preserved separately. Select from registered teams in this slot to ensure exact team identity.
                </p>
              </div>

              <button
                onClick={handleCreateNewMatch}
                className="flex items-center gap-2 bg-ember px-4 py-2 font-display text-xs font-bold uppercase tracking-wide text-void transition hover:bg-[var(--ember-deep)]"
              >
                <Plus size={14} />
                + Add Match (Match {slotMatches.length + 1})
              </button>
            </div>

            {/* Timing Slot Selector */}
            <div className="flex flex-wrap gap-2 border-b border-border/60 pb-3 font-mono text-xs">
              <span className="text-muted-foreground py-1">Timing Slot:</span>
              {scrim.slots.map((s) => (
                <button
                  key={s.id}
                  onClick={() => setSelectedSlotId(s.id)}
                  className={`px-3 py-1 rounded transition ${
                    s.id === selectedSlotId
                      ? "bg-cyan text-void font-bold"
                      : "border border-border text-muted-foreground hover:text-foreground"
                  }`}
                >
                  {slotTimeLabel(s)}
                </button>
              ))}
            </div>

            {/* Matches Selector Tabs */}
            {slotMatches.length === 0 ? (
              <div className="border border-dashed border-border p-10 text-center font-mono text-xs text-muted-foreground space-y-3">
                <Trophy size={28} className="mx-auto text-muted-foreground/50" />
                <p>No matches added for this slot yet.</p>
                <button
                  onClick={handleCreateNewMatch}
                  className="bg-cyan px-4 py-2 font-display text-xs font-bold uppercase text-void"
                >
                  Create Match 1
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border pb-3">
                  <div className="flex flex-wrap gap-2 font-mono text-xs">
                    {slotMatches.map((m) => (
                      <button
                        key={m.id}
                        onClick={() => handleSelectMatch(m)}
                        className={`px-3 py-1.5 rounded font-bold transition ${
                          activeMatchId === m.id
                            ? "bg-cyan text-void"
                            : "border border-border text-muted-foreground hover:text-foreground"
                        }`}
                      >
                        {m.title || `Match ${m.matchNumber}`}
                      </button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={handleAddResultRow}
                      className="flex items-center gap-1 border border-cyan/50 bg-cyan/10 px-3 py-1.5 font-mono text-xs text-cyan hover:bg-cyan hover:text-void transition"
                    >
                      <Plus size={12} />
                      Add Team Row
                    </button>
                    <button
                      onClick={handleDeleteMatch}
                      className="border border-destructive/40 p-1.5 text-destructive hover:bg-destructive hover:text-void transition"
                      title="Delete this match"
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>

                {/* Editable Table */}
                <div className="overflow-x-auto border border-border">
                  <table className="w-full min-w-[620px] border-collapse font-mono text-xs">
                    <thead>
                      <tr className="border-b border-border bg-panel-2 text-left text-[11px] uppercase tracking-wider text-muted-foreground">
                        <th className="p-3 w-16">Rank</th>
                        <th className="p-3">Registered Team (Select)</th>
                        <th className="p-3 w-20 text-center">WIN</th>
                        <th className="p-3 w-20 text-center">PP</th>
                        <th className="p-3 w-20 text-center">KP</th>
                        <th className="p-3 w-24 text-center">TP</th>
                        <th className="p-3 w-12 text-center">Del</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {editableResults.map((row, idx) => {
                        const confirmedTeams = activeSlotTeamsList.filter(
                          (t) => t.paymentStatus === "PAID"
                        );

                        return (
                          <tr key={idx} className="hover:bg-panel-2/30">
                            {/* Rank Input */}
                            <td className="p-2">
                              <input
                                type="number"
                                value={row.rank}
                                onChange={(e) => handleUpdateResultRow(idx, "rank", e.target.value)}
                                className="w-12 border border-border bg-panel p-1.5 text-center font-bold text-foreground outline-none focus:border-cyan"
                              />
                            </td>

                            {/* Team Select (from registered teams) */}
                            <td className="p-2">
                              <select
                                value={row.registrationId}
                                onChange={(e) => handleUpdateResultRow(idx, "registrationId", e.target.value)}
                                className="w-full border border-border bg-panel p-1.5 text-foreground outline-none focus:border-cyan text-xs"
                              >
                                {confirmedTeams.map((t) => (
                                  <option key={t.id} value={t.id}>
                                    #{t.slotNumber} {t.teamName} (IGL: {t.iglName})
                                  </option>
                                ))}
                              </select>
                            </td>

                            {/* WIN Input */}
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                value={row.won}
                                onChange={(e) => handleUpdateResultRow(idx, "won", e.target.value)}
                                className="w-16 border border-border bg-panel p-1.5 text-center text-foreground outline-none focus:border-cyan"
                              />
                            </td>

                            {/* PP Input */}
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                value={row.pp}
                                onChange={(e) => handleUpdateResultRow(idx, "pp", e.target.value)}
                                className="w-16 border border-border bg-panel p-1.5 text-center text-foreground outline-none focus:border-cyan"
                              />
                            </td>

                            {/* KP Input */}
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                value={row.kp}
                                onChange={(e) => handleUpdateResultRow(idx, "kp", e.target.value)}
                                className="w-16 border border-border bg-panel p-1.5 text-center text-foreground outline-none focus:border-cyan"
                              />
                            </td>

                            {/* TP Input */}
                            <td className="p-2 text-center">
                              <input
                                type="number"
                                value={row.tp}
                                onChange={(e) => handleUpdateResultRow(idx, "tp", e.target.value)}
                                className="w-20 border border-cyan/40 bg-panel p-1.5 text-center font-bold text-cyan outline-none focus:border-cyan"
                              />
                            </td>

                            {/* Delete Row */}
                            <td className="p-2 text-center">
                              <button
                                onClick={() => handleDeleteResultRow(idx)}
                                className="text-destructive hover:text-destructive/80"
                                title="Remove team row"
                              >
                                <Trash2 size={14} />
                              </button>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Save Results Button */}
                <button
                  onClick={handleSaveMatchResults}
                  disabled={savingResults}
                  className="btn-press flex items-center justify-center gap-2 bg-cyan px-6 py-3 font-display text-sm font-bold uppercase text-void transition hover:bg-cyan/90 disabled:opacity-50"
                >
                  <Save size={16} />
                  {savingResults ? "Saving Results..." : "Save Match Results"}
                </button>
              </div>
            )}
          </div>
        )}
      </div>

      {/* MOVE SLOT MODAL */}
      {moveModalOpen && teamToMove && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md border border-border bg-panel p-6 shadow-2xl space-y-4 font-mono text-xs">
            <h3 className="font-display text-lg font-bold uppercase text-foreground">
              Move Team To Another Slot
            </h3>
            <p className="text-muted-foreground">
              Move team <span className="text-foreground font-bold">{teamToMove.teamName}</span> to another timing slot in this tournament.
            </p>

            <div>
              <label className="block text-[10px] uppercase text-muted-foreground mb-1">
                Select Destination Slot
              </label>
              <select
                value={targetSlotId}
                onChange={(e) => setTargetSlotId(e.target.value)}
                className="w-full border border-border bg-panel-2 p-2.5 text-foreground outline-none focus:border-cyan"
              >
                {scrim.slots.map((s) => (
                  <option key={s.id} value={s.id}>
                    {slotTimeLabel(s)} ({s.time})
                  </option>
                ))}
              </select>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={handleMoveSlotSubmit}
                disabled={processingRegId === teamToMove.id}
                className="flex-1 bg-cyan py-2.5 font-display text-xs font-bold uppercase text-void"
              >
                Confirm Move
              </button>
              <button
                onClick={() => setMoveModalOpen(false)}
                className="border border-border px-4 py-2.5 text-muted-foreground hover:text-foreground"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MANUAL ADD TEAM MODAL */}
      {addTeamModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md border border-border bg-panel p-6 shadow-2xl space-y-4 font-mono text-xs">
            <h3 className="font-display text-lg font-bold uppercase text-foreground">
              Add Team Manually to {slotTimeLabel(activeSlot)}
            </h3>

            <form onSubmit={handleAddTeamSubmit} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase text-muted-foreground mb-1">Team Name</label>
                <input
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="e.g. Total Gaming"
                  className="w-full border border-border bg-panel-2 p-2.5 text-foreground outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-muted-foreground mb-1">IGL Name</label>
                <input
                  required
                  value={newIglName}
                  onChange={(e) => setNewIglName(e.target.value)}
                  placeholder="e.g. Mafia"
                  className="w-full border border-border bg-panel-2 p-2.5 text-foreground outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-muted-foreground mb-1">Phone Number</label>
                <input
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full border border-border bg-panel-2 p-2.5 text-foreground outline-none focus:border-cyan"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase text-muted-foreground mb-1">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as "PAID" | "PENDING")}
                  className="w-full border border-border bg-panel-2 p-2.5 text-foreground outline-none focus:border-cyan"
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div className="flex gap-2 pt-2">
                <button
                  type="submit"
                  className="flex-1 bg-cyan py-2.5 font-display text-xs font-bold uppercase text-void"
                >
                  Add Team
                </button>
                <button
                  type="button"
                  onClick={() => setAddTeamModalOpen(false)}
                  className="border border-border px-4 py-2.5 text-muted-foreground hover:text-foreground"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
