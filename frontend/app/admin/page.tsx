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
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { getScrims, type Scrim } from "@/lib/scrims";
import {
  getDashboardStats,
  deleteScrimRequest,
  updateScrimStatusRequest,
  type DashboardStats,
} from "@/services/admin";
import { Skeleton } from "@/components/ui/Skeleton";

export default function AdminDashboardPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [stats, setStats] = useState<DashboardStats | null>(null);
  const [scrims, setScrims] = useState<Scrim[] | null>(null);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push("/");
    }
  }, [authLoading, user, router]);

  const load = () => {
    getDashboardStats().then(setStats).catch(() => setStats(null));
    getScrims().then(setScrims).catch(() => setScrims([]));
  };

  useEffect(() => {
    if (user?.isAdmin) load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

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
      <div className="mx-auto max-w-7xl px-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan">
              Admin
            </span>
            <h1 className="mt-1 font-display text-4xl font-bold uppercase text-foreground">
              Dashboard
            </h1>
          </div>

          <Link
            href="/admin/scrims/new"
            className="flex items-center gap-2 bg-ember px-6 py-3 font-display font-bold uppercase tracking-wide text-void transition hover:bg-[var(--ember-deep)] [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))]"
          >
            <Plus size={18} />
            New Tournament
          </Link>
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

        <div className="mt-10">
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
                      {scrim.roomReleased && (
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
        </div>
      </div>
    </main>
  );
}