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

  const [activeTab, setActiveTab] = useState<"tournaments" | "teams">("tournaments");
  const [registrations, setRegistrations] = useState<AdminRegistrationWithDetails[] | null>(null);
  const [searchQuery, setSearchQuery] = useState("");

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
      router.push("/");
    }
  }, [authLoading, user, router]);

  const load = () => {
    getDashboardStats().then(setStats).catch(() => setStats(null));
    getScrims().then(setScrims).catch(() => setScrims([]));
    getAllRegistrationsRequest().then(setRegistrations).catch(() => setRegistrations([]));
  };

  useEffect(() => {
    if (user?.isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
        <div className="mt-10 border-b border-border flex gap-6">
          <button
            onClick={() => setActiveTab("tournaments")}
            className={`pb-3.5 font-display text-lg font-bold uppercase tracking-wider transition relative ${
              activeTab === "tournaments"
                ? "text-cyan after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-cyan"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Tournaments
          </button>
          <button
            onClick={() => setActiveTab("teams")}
            className={`pb-3.5 font-display text-lg font-bold uppercase tracking-wider transition relative ${
              activeTab === "teams"
                ? "text-cyan after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[2px] after:bg-cyan"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Manage Teams
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
          ) : (
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
                            <div className="text-xs text-cyan mt-0.5">{slotTimeLabel(reg.slot?.time)}</div>
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