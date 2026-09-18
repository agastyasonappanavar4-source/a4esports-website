"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  Users,
  Trophy,
  Unlock,
  ClipboardList,
  IndianRupee,
  Plus,
  Pencil,
  Trash2,
  Power,
  Sparkles,
  Search,
  X,
  Clock,
} from "lucide-react";

import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { getScrims, type Scrim } from "@/lib/scrims";
import {
  getDashboardStats,
  deleteScrimRequest,
  updateScrimStatusRequest,
  removeRegistrationRequest,
  getAllRegistrationsRequest,
  adminRegisterTeamRequest,
  type DashboardStats,
  type AdminRegistrationWithDetails,
} from "@/services/admin";
import { Skeleton } from "@/components/ui/Skeleton";
import { slotTimeLabel } from "@/lib/slotTime";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scrims, setScrims] = useState<Scrim[] | null>(null);

  const [activeTab, setActiveTab] = useState<"tournaments" | "teams" | "pending">("tournaments");
  const [registrations, setRegistrations] = useState<AdminRegistrationWithDetails[] | null>(null);
  const [pendingPayments, setPendingPayments] = useState<any[]>([]);
  const [pendingCount, setPendingCount] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [processingPaymentId, setProcessingPaymentId] = useState<number | null>(null);

  // Manual add team modal state
  const [addModalOpen, setAddModalOpen] = useState(false);
  const [selectedScrimId, setSelectedScrimId] = useState("");
  const [selectedSlotId, setSelectedSlotId] = useState("");
  const [newTeamName, setNewTeamName] = useState("");
  const [newIglName, setNewIglName] = useState("");
  const [newPhone, setNewPhone] = useState("");
  const [newPaymentStatus, setNewPaymentStatus] = useState<"PAID" | "PENDING">("PAID");
  const [submittingTeam, setSubmittingTeam] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push(user ? "/platform" : "/");
    }
  }, [authLoading, user, router]);

  const loadPendingPayments = () => {
    fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/pending-payments`, {
      headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setPendingPayments(data.data || []);
          setPendingCount(data.count || 0);
        }
      })
      .catch(() => {});
  };

  const load = () => {
    getDashboardStats().then(setStats).catch(() => setStats(null));
    getScrims().then(setScrims).catch(() => setScrims([]));
    getAllRegistrationsRequest().then(setRegistrations).catch(() => setRegistrations([]));
    loadPendingPayments();
  };

  useEffect(() => {
    if (user?.isAdmin) {
      load();
      const interval = setInterval(loadPendingPayments, 15000);
      return () => clearInterval(interval);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleVerifyPending = async (paymentId: number, teamName: string) => {
    setProcessingPaymentId(paymentId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/verify-payment/${paymentId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${localStorage.getItem("token")}` },
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to verify");
      showToast(`Payment verified for team "${teamName}"!`, "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Verification failed", "error");
    } finally {
      setProcessingPaymentId(null);
    }
  };

  const handleRejectPending = async (paymentId: number, teamName: string) => {
    const reason = window.prompt(`Reject payment for "${teamName}"? Reason:`, "Payment not identified");
    if (reason === null) return;

    setProcessingPaymentId(paymentId);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/admin/reject-payment/${paymentId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
        body: JSON.stringify({ reason }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Failed to reject");
      showToast(`Payment rejected for "${teamName}".`, "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Rejection failed", "error");
    } finally {
      setProcessingPaymentId(null);
    }
  };


  const handleRemoveRegistration = async (id: number, teamName: string) => {
    if (!confirm(`Are you sure you want to remove team "${teamName}"? This cannot be undone.`)) return;
    try {
      await removeRegistrationRequest(id);
      showToast(`Team "${teamName}" removed successfully.`, "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to remove team", "error");
    }
  };

  const handleAddTeam = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedSlotId || !newTeamName || !newIglName || !newPhone) {
      showToast("Please fill in all fields.", "error");
      return;
    }
    setSubmittingTeam(true);
    try {
      await adminRegisterTeamRequest({
        slotId: Number(selectedSlotId),
        teamName: newTeamName,
        iglName: newIglName,
        phone: newPhone,
        paymentStatus: newPaymentStatus,
      });
      showToast(`Team "${newTeamName}" registered manually!`, "success");
      setAddModalOpen(false);
      // Clear form
      setSelectedScrimId("");
      setSelectedSlotId("");
      setNewTeamName("");
      setNewIglName("");
      setNewPhone("");
      setNewPaymentStatus("PAID");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to register team", "error");
    } finally {
      setSubmittingTeam(false);
    }
  };

  const handleToggleStatus = async (scrim: Scrim) => {
    const next = scrim.status === "OPEN" ? "CLOSED" : "OPEN";
    try {
      await updateScrimStatusRequest(scrim.id, next);
      showToast(`${scrim.title} is now ${next}.`, "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to update status", "error");
    }
  };

  const handleDelete = async (scrim: Scrim) => {
    if (!confirm(`Delete "${scrim.title}"? This cannot be undone.`)) return;

    try {
      await deleteScrimRequest(scrim.id);
      showToast("Tournament deleted.", "success");
      load();
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to delete", "error");
    }
  };

  if (!user || !user.isAdmin) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-background">
        <p className="font-mono text-sm text-muted-foreground">Checking access...</p>
      </main>
    );
  }

  const selectedScrim = scrims?.find((s) => s.id === Number(selectedScrimId));
  const availableSlots = selectedScrim?.slots || [];

  const filteredRegistrations = (registrations || []).filter((reg) => {
    const query = searchQuery.toLowerCase().trim();
    if (!query) return true;
    return (
      reg.teamName.toLowerCase().includes(query) ||
      reg.iglName.toLowerCase().includes(query) ||
      reg.phone.includes(query) ||
      (reg.scrim?.title || "").toLowerCase().includes(query) ||
      reg.registrationCode.toLowerCase().includes(query)
    );
  });

  const statCards = stats
    ? [
        { icon: Users, label: "Users", value: stats.totalUsers, tone: "text-cyan" },
        { icon: Trophy, label: "Tournaments", value: stats.totalScrims, tone: "text-amber" },
        { icon: Unlock, label: "Open Now", value: stats.openScrims, tone: "text-ember" },
        { icon: ClipboardList, label: "Registrations", value: stats.totalRegistrations, tone: "text-cyan" },
        { icon: IndianRupee, label: "Revenue Collected", value: `₹${stats.totalRevenue}`, tone: "text-amber" },
      ]
    : [];

  return (
    <main className="min-h-screen bg-background bg-tactical-grid">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 py-8 sm:py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan">
              Admin
            </span>
            <h1 className="mt-1 font-display text-4xl font-bold uppercase text-foreground">
              Dashboard
            </h1>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            {activeTab === "teams" && (
              <button
                onClick={() => setAddModalOpen(true)}
                className="flex items-center gap-2 bg-cyan px-6 py-3 font-display font-bold uppercase tracking-wide text-void transition hover:bg-cyan/90 [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))]"
              >
                <Plus size={18} />
                Add Team Manually
              </button>
            )}

            <Link
              href="/admin/announcements"
              className="flex items-center gap-2 border border-cyan/40 bg-cyan/10 px-5 py-3 font-display font-bold uppercase tracking-wide text-cyan transition hover:bg-cyan/20 rounded-lg"
            >
              <Sparkles size={18} />
              Special Event Popups
            </Link>

            <Link
              href="/admin/scrims/new"
              className="flex items-center gap-2 bg-ember px-6 py-3 font-display font-bold uppercase tracking-wide text-void transition hover:bg-[var(--ember-deep)] [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))]"
            >
              <Plus size={18} />
              New Tournament
            </Link>
          </div>
        </div>

        {/* SERVER-BACKED PENDING PAYMENT NOTIFICATION BANNER */}
        {pendingCount > 0 && (
          <div className="mt-6 rounded-xl border border-amber/40 bg-amber/10 p-4 sm:p-6 space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <span className="h-2.5 w-2.5 rounded-full bg-amber animate-pulse-dot" />
                <h2 className="font-display text-base sm:text-lg font-bold uppercase text-amber">
                  🔔 New Payments To Verify ({pendingCount})
                </h2>
              </div>
              <button
                onClick={() => setActiveTab("pending")}
                className="font-mono text-xs text-amber underline hover:text-amber/80 font-bold"
              >
                Review All ({pendingCount})
              </button>
            </div>

            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {pendingPayments.slice(0, 3).map((p) => (
                <div key={p.id} className="rounded-lg border border-border bg-panel p-3.5 space-y-2 font-mono text-xs">
                  <div className="flex justify-between items-start">
                    <span className="font-bold text-foreground truncate max-w-[150px]">{p.teamName}</span>
                    <span className="text-amber font-bold">₹{p.scrim?.fee}</span>
                  </div>
                  <p className="text-[11px] text-muted-foreground truncate">{p.scrim?.title} · {slotTimeLabel(p.slot)}</p>
                  <div className="flex justify-between text-[10px] text-muted-foreground pt-1 border-t border-border/40">
                    <span>IGL: {p.iglName}</span>
                    <span>{p.phone}</span>
                  </div>
                  <div className="flex gap-2 pt-1">
                    <button
                      onClick={() => handleVerifyPending(p.id, p.teamName)}
                      disabled={processingPaymentId === p.id}
                      className="flex-1 rounded bg-cyan/15 border border-cyan/40 py-1.5 font-display text-[11px] font-bold uppercase text-cyan hover:bg-cyan hover:text-void transition"
                    >
                      Verify
                    </button>
                    <button
                      onClick={() => handleRejectPending(p.id, p.teamName)}
                      disabled={processingPaymentId === p.id}
                      className="rounded border border-destructive/30 bg-destructive/10 px-2.5 py-1.5 font-display text-[11px] uppercase text-destructive hover:bg-destructive hover:text-void transition"
                    >
                      Reject
                    </button>
                    <Link
                      href={`/admin/scrims/${p.scrim?.id}`}
                      className="rounded border border-border px-2 py-1.5 font-display text-[11px] text-muted-foreground hover:border-cyan hover:text-cyan transition"
                    >
                      Slot
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          {stats ? (
            statCards.map((card) => (
              <div key={card.label} className="border border-border bg-panel p-6">
                <card.icon className={`mb-3 h-6 w-6 ${card.tone}`} />
                <p className="font-mono text-2xl font-semibold text-foreground">{card.value}</p>
                <p className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                  {card.label}
                </p>
              </div>
            ))
          ) : (
            <>
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
              <Skeleton className="h-28 w-full" />
            </>
          )}
        </div>

        {/* Tab Switcher */}
        <div className="mt-10 border-b border-border flex gap-6 overflow-x-auto scrollbar-hide">
          <button
            onClick={() => setActiveTab("tournaments")}
            className={`pb-3.5 font-display text-lg font-bold uppercase tracking-wider transition relative whitespace-nowrap ${
              activeTab === "tournaments"
                ? "text-cyan after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-cyan"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tournaments
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`pb-3.5 font-display text-lg font-bold uppercase tracking-wider transition relative whitespace-nowrap ${
              activeTab === "teams"
                ? "text-cyan after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-cyan"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Manage Teams
          </button>
          <button
            onClick={() => setActiveTab("pending")}
            className={`pb-3.5 font-display text-lg font-bold uppercase tracking-wider transition relative whitespace-nowrap flex items-center gap-2 ${
              activeTab === "pending"
                ? "text-amber after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-amber"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Pending Payments
            {pendingCount > 0 && (
              <span className="rounded-full bg-amber/20 border border-amber/40 px-2 py-0.5 text-xs text-amber font-mono">
                {pendingCount}
              </span>
            )}
          </button>
        </div>

        {/* Content Section */}
        <div className="mt-8">
          {activeTab === "tournaments" ? (
            <>
              <h2 className="mb-5 font-display text-xl font-bold uppercase text-foreground">
                All Tournaments
              </h2>

              {!scrims ? (
                <div className="space-y-3">
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                  <Skeleton className="h-20 w-full" />
                </div>
              ) : scrims.length === 0 ? (
                <p className="border border-dashed border-border p-10 text-center font-mono text-sm text-muted-foreground">
                  No tournaments yet. Create your first one.
                </p>
              ) : (
                <div className="space-y-3">
                  {scrims.map((scrim) => (
                    <div
                      key={scrim.id}
                      className="flex flex-col gap-4 border border-border bg-panel p-5 md:flex-row md:items-center md:justify-between"
                    >
                      <div className="min-w-0">
                        <div className="flex flex-wrap items-center gap-2">
                          <span
                            className={`font-mono text-xs uppercase tracking-widest ${
                              scrim.status === "OPEN" ? "text-cyan" : "text-muted-foreground"
                            }`}
                          >
                            {scrim.status}
                          </span>
                          <span className="font-mono text-xs uppercase tracking-widest text-muted-foreground">
                            · {scrim.mode === "BR" ? "Battle Royale" : "Clash Squad"}
                          </span>
                          {scrim.slots.some((s) => s.roomReleased) && (
                            <span className="font-mono text-xs uppercase tracking-widest text-amber">
                              · Room Released
                            </span>
                          )}
                        </div>
                        <h3 className="mt-1 truncate font-display text-lg font-bold uppercase text-foreground">
                          {scrim.title}
                        </h3>
                        <p className="mt-1 font-mono text-xs text-muted-foreground">
                          {scrim._count?.registrations ?? 0} / {scrim.maxTeams} teams ·{" "}
                          {scrim.fee === 0 ? "Free" : `₹${scrim.fee}`}
                        </p>
                      </div>

                      <div className="flex shrink-0 gap-2">
                        <Link
                          href={`/admin/scrims/${scrim.id}`}
                          className="flex items-center gap-2 border border-border px-4 py-2 font-mono text-sm text-foreground transition hover:border-cyan hover:text-cyan"
                        >
                          <Pencil size={15} />
                          Manage
                        </Link>
                        <button
                          onClick={() => handleToggleStatus(scrim)}
                          className="flex items-center gap-2 border border-border px-4 py-2 font-mono text-sm text-foreground transition hover:border-amber hover:text-amber"
                        >
                          <Power size={15} />
                          {scrim.status === "OPEN" ? "Close" : "Open"}
                        </button>
                        <button
                          onClick={() => handleDelete(scrim)}
                          className="flex items-center gap-2 border border-destructive/40 bg-destructive/10 px-4 py-2 font-mono text-sm text-destructive transition hover:bg-destructive/20"
                        >
                          <Trash2 size={15} />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : activeTab === "teams" ? (
            <>
              <div className="flex items-center justify-between gap-4 mb-6">
                <h2 className="font-display text-xl font-bold uppercase text-foreground">
                  Registered Teams
                </h2>
              </div>

              {/* Search Bar */}
              <div className="mb-6 flex max-w-md items-center border border-border bg-panel px-3.5 transition focus-within:border-cyan">
                <Search size={18} className="text-muted-foreground shrink-0" />
                <input
                  type="text"
                  placeholder="Search teams, IGL, phone, tournament, code..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-transparent px-3 py-3.5 font-mono text-sm text-foreground outline-none"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="text-muted-foreground hover:text-foreground">
                    <X size={16} />
                  </button>
                )}
              </div>

              {!registrations ? (
                <div className="space-y-3">
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                  <Skeleton className="h-16 w-full" />
                </div>
              ) : filteredRegistrations.length === 0 ? (
                <p className="border border-dashed border-border p-10 text-center font-mono text-sm text-muted-foreground">
                  No registered teams found.
                </p>
              ) : (
                <div className="overflow-x-auto border border-border bg-panel w-full">
                  <table className="w-full min-w-[900px] border-collapse text-left font-mono text-sm">
                    <thead>
                      <tr className="border-b border-border bg-panel-2 text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="p-4 font-semibold">Team Name</th>
                        <th className="p-4 font-semibold">IGL</th>
                        <th className="p-4 font-semibold">Phone</th>
                        <th className="p-4 font-semibold">Tournament / Slot</th>
                        <th className="p-4 font-semibold">Reg Code</th>
                        <th className="p-4 font-semibold">Slot #</th>
                        <th className="p-4 font-semibold">Payment</th>
                        <th className="p-4 font-semibold text-center">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {filteredRegistrations.map((reg) => (
                        <tr key={reg.id} className="hover:bg-panel-2/30">
                          <td className="p-4 font-bold text-foreground">{reg.teamName}</td>
                          <td className="p-4 text-muted-foreground">{reg.iglName}</td>
                          <td className="p-4 text-muted-foreground">{reg.phone}</td>
                          <td className="p-4">
                            <div className="text-foreground font-semibold truncate max-w-[200px]">{reg.scrim?.title}</div>
                            <div className="text-xs text-cyan mt-0.5">{slotTimeLabel(reg.slot)}</div>
                          </td>
                          <td className="p-4 text-xs font-mono break-all max-w-[150px]">{reg.registrationCode}</td>
                          <td className="p-4 text-muted-foreground">{reg.slotNumber || "-"}</td>
                          <td className="p-4">
                            <span
                              className={`inline-block px-2.5 py-1 text-[10px] uppercase font-bold tracking-widest ${
                                reg.paymentStatus === "PAID"
                                  ? "bg-cyan/15 text-cyan border border-cyan/30"
                                  : reg.paymentStatus === "PENDING"
                                  ? "bg-amber/15 text-amber border border-amber/30"
                                  : "bg-destructive/10 text-destructive border border-destructive/20"
                              }`}
                            >
                              {reg.paymentStatus}
                            </span>
                          </td>
                          <td className="p-4 text-center">
                            <button
                              onClick={() => handleRemoveRegistration(reg.id, reg.teamName)}
                              className="text-destructive hover:text-destructive/80 transition p-1"
                              title="Remove Team"
                            >
                              <Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          ) : (
            <>
              <div className="flex items-center justify-between gap-4 mb-6">
                <div>
                  <h2 className="font-display text-xl font-bold uppercase text-foreground">
                    Pending Payments Verification
                  </h2>
                  <p className="font-mono text-xs text-muted-foreground mt-0.5">
                    Review and manually verify user registrations submitted through the UPI payment flow.
                  </p>
                </div>
                <button
                  onClick={loadPendingPayments}
                  className="rounded border border-border px-3 py-1.5 font-mono text-xs text-muted-foreground hover:border-cyan hover:text-cyan transition"
                >
                  Refresh
                </button>
              </div>

              {pendingPayments.length === 0 ? (
                <div className="border border-dashed border-border p-12 text-center">
                  <Clock className="mx-auto h-8 w-8 text-muted-foreground/50 mb-3" />
                  <p className="font-mono text-sm text-muted-foreground">
                    No pending payments waiting for verification.
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto border border-border bg-panel w-full">
                  <table className="w-full min-w-[850px] border-collapse text-left font-mono text-sm">
                    <thead>
                      <tr className="border-b border-border bg-panel-2 text-xs uppercase tracking-wider text-muted-foreground">
                        <th className="p-4 font-semibold">Team Name</th>
                        <th className="p-4 font-semibold">Tournament / Slot</th>
                        <th className="p-4 font-semibold">IGL & Phone</th>
                        <th className="p-4 font-semibold">Fee</th>
                        <th className="p-4 font-semibold">Requested At</th>
                        <th className="p-4 font-semibold text-right">Verification Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border/40">
                      {pendingPayments.map((p) => (
                        <tr key={p.id} className="hover:bg-panel-2/30">
                          <td className="p-4">
                            <span className="font-bold text-foreground block">{p.teamName}</span>
                            <span className="text-[11px] text-muted-foreground font-mono">{p.registrationCode}</span>
                          </td>
                          <td className="p-4">
                            <div className="text-foreground font-semibold truncate max-w-[200px]">{p.scrim?.title}</div>
                            <div className="text-xs text-cyan mt-0.5">{slotTimeLabel(p.slot)}</div>
                          </td>
                          <td className="p-4 text-xs text-muted-foreground space-y-0.5">
                            <div className="text-foreground">{p.iglName}</div>
                            <div>{p.phone}</div>
                          </td>
                          <td className="p-4 font-bold text-amber">₹{p.scrim?.fee}</td>
                          <td className="p-4 text-xs text-muted-foreground">
                            {p.paymentVerificationRequestedAt
                              ? new Date(p.paymentVerificationRequestedAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit", second: "2-digit" })
                              : "Recently"}
                          </td>
                          <td className="p-4 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <button
                                onClick={() => handleVerifyPending(p.id, p.teamName)}
                                disabled={processingPaymentId === p.id}
                                className="rounded bg-cyan/15 border border-cyan/40 px-3 py-1.5 font-display text-xs font-bold uppercase text-cyan hover:bg-cyan hover:text-void transition disabled:opacity-50"
                              >
                                {processingPaymentId === p.id ? "..." : "Verify & Allocate"}
                              </button>
                              <button
                                onClick={() => handleRejectPending(p.id, p.teamName)}
                                disabled={processingPaymentId === p.id}
                                className="rounded border border-destructive/30 bg-destructive/10 px-3 py-1.5 font-display text-xs uppercase text-destructive hover:bg-destructive hover:text-void transition disabled:opacity-50"
                              >
                                Reject
                              </button>
                              <Link
                                href={`/admin/scrims/${p.scrim?.id}`}
                                className="rounded border border-border px-2.5 py-1.5 font-display text-xs text-muted-foreground hover:border-cyan hover:text-cyan transition"
                              >
                                Manage
                              </Link>
                            </div>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* MANUAL REGISTER MODAL */}
      {addModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-xs">
          <div className="w-full max-w-md border border-border bg-panel p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-border pb-3">
              <h3 className="font-display text-lg font-bold uppercase text-foreground">
                Add Team Manually
              </h3>
              <button
                onClick={() => setAddModalOpen(false)}
                className="text-muted-foreground hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleAddTeam} className="space-y-4 font-mono text-sm">
              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Tournament</label>
                <select
                  required
                  value={selectedScrimId}
                  onChange={(e) => {
                    setSelectedScrimId(e.target.value);
                    const scr = scrims?.find((s) => s.id === Number(e.target.value));
                    if (scr && scr.slots.length > 0) {
                      setSelectedSlotId(String(scr.slots[0].id));
                    } else {
                      setSelectedSlotId("");
                    }
                  }}
                  className="w-full border border-border bg-panel-2 p-3 text-foreground outline-none focus:border-cyan rounded-lg"
                >
                  <option value="">Select Tournament</option>
                  {scrims?.map((s) => (
                    <option key={s.id} value={s.id}>
                      {s.title}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Time Slot</label>
                <select
                  required
                  value={selectedSlotId}
                  onChange={(e) => setSelectedSlotId(e.target.value)}
                  disabled={!selectedScrimId}
                  className="w-full border border-border bg-panel-2 p-3 text-foreground outline-none focus:border-cyan disabled:opacity-50 rounded-lg"
                >
                  <option value="">Select Time Slot</option>
                  {availableSlots.map((s) => (
                    <option key={s.id} value={s.id}>
                      {slotTimeLabel(s.time)}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Team Name</label>
                <input
                  required
                  value={newTeamName}
                  onChange={(e) => setNewTeamName(e.target.value)}
                  placeholder="Enter team name"
                  className="w-full border border-border bg-panel-2 p-3 text-foreground outline-none focus:border-cyan rounded-lg"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">IGL Name</label>
                <input
                  required
                  value={newIglName}
                  onChange={(e) => setNewIglName(e.target.value)}
                  placeholder="Enter IGL name"
                  className="w-full border border-border bg-panel-2 p-3 text-foreground outline-none focus:border-cyan rounded-lg"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Phone Number</label>
                <input
                  required
                  value={newPhone}
                  onChange={(e) => setNewPhone(e.target.value)}
                  placeholder="9876543210"
                  className="w-full border border-border bg-panel-2 p-3 text-foreground outline-none focus:border-cyan rounded-lg"
                />
              </div>

              <div>
                <label className="mb-1.5 block text-xs uppercase tracking-wider text-muted-foreground">Payment Status</label>
                <select
                  value={newPaymentStatus}
                  onChange={(e) => setNewPaymentStatus(e.target.value as "PAID" | "PENDING")}
                  className="w-full border border-border bg-panel-2 p-3 text-foreground outline-none focus:border-cyan rounded-lg"
                >
                  <option value="PAID">PAID</option>
                  <option value="PENDING">PENDING</option>
                </select>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={submittingTeam}
                  className="btn-press flex-1 bg-cyan py-3 font-display font-bold uppercase text-void"
                >
                  {submittingTeam ? "Adding..." : "Add Team"}
                </button>
                <button
                  type="button"
                  onClick={() => setAddModalOpen(false)}
                  className="border border-border px-4 py-3 text-xs uppercase text-muted-foreground transition hover:border-cyan hover:text-cyan rounded-lg"
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