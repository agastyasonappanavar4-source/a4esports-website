"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock,
  Eye,
  Gamepad2,
  IndianRupee,
  Loader2,
  Plus,
  RefreshCw,
  Search,
  ShieldCheck,
  Users,
} from "lucide-react";

type ScrimStatus = "OPEN" | "CLOSED";
type ScrimMode = "BR" | "CS";

type Registration = {
  id: number;
  paymentStatus?: "PENDING" | "PAID" | "FAILED";
};

type Scrim = {
  id: number;
  title: string;
  mode: ScrimMode;
  fee: number;
  date: string;
  time: string;
  image?: string | null;
  rules?: string;
  maxTeams: number;
  status: ScrimStatus;
  roomReleased?: boolean;
  registrations?: Registration[];
  _count?: {
    registrations?: number;
  };
};

type StatusFilter = "ALL" | ScrimStatus;

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function ManageScrimsPage() {
  const [scrims, setScrims] = useState<Scrim[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] =
    useState<StatusFilter>("ALL");

  async function fetchScrims(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      } else {
        setLoading(true);
      }

      setErrorMessage("");

      const response = await fetch(`${API_URL}/api/scrims`, {
        cache: "no-store",
      });

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || result?.error || "Unable to load scrims."
        );
      }

      /*
       Handles any of these backend formats:

       { success: true, data: [...] }
       { success: true, data: { scrims: [...] } }
       { scrims: [...] }
       [...]
      */
      const receivedScrims = Array.isArray(result)
        ? result
        : Array.isArray(result?.data)
          ? result.data
          : Array.isArray(result?.data?.scrims)
            ? result.data.scrims
            : Array.isArray(result?.scrims)
              ? result.scrims
              : [];

      setScrims(receivedScrims);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading scrims."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
  const loadScrims = async () => {
    await fetchScrims();
  };

  void loadScrims();
}, []);

  const filteredScrims = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    return scrims.filter((scrim) => {
      const matchesSearch =
        !normalizedSearch ||
        scrim.title.toLowerCase().includes(normalizedSearch) ||
        scrim.mode.toLowerCase().includes(normalizedSearch);

      const matchesStatus =
        statusFilter === "ALL" || scrim.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [scrims, searchTerm, statusFilter]);

  const totalScrims = scrims.length;

  const openScrims = scrims.filter(
    (scrim) => scrim.status === "OPEN"
  ).length;

  const closedScrims = scrims.filter(
    (scrim) => scrim.status === "CLOSED"
  ).length;

  const totalRegistrations = scrims.reduce(
    (total, scrim) => total + getRegistrationCount(scrim),
    0
  );

  return (
    <main className="min-h-screen bg-[#070707] px-4 pb-24 pt-24 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <Link
          href="/admin"
          className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition hover:text-white"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to dashboard
        </Link>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-56 w-56 rounded-full bg-red-700/20 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-[0.24em] text-red-500">
                <ShieldCheck className="h-4 w-4" />
                Tournament management
              </div>

              <h1 className="mt-3 text-3xl font-black uppercase tracking-tight sm:text-5xl">
                Manage Scrims
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/50">
                View all tournaments created through the admin panel and
                inspect their registration activity.
              </p>
            </div>

            <Link
              href="/admin/scrims/create"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 font-bold transition hover:bg-red-500"
            >
              <Plus className="h-5 w-5" />
              Create Scrim
            </Link>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <StatCard
            label="Total Scrims"
            value={totalScrims}
            icon={<Gamepad2 className="h-5 w-5" />}
          />

          <StatCard
            label="Open Scrims"
            value={openScrims}
            icon={<ShieldCheck className="h-5 w-5" />}
          />

          <StatCard
            label="Closed Scrims"
            value={closedScrims}
            icon={<AlertCircle className="h-5 w-5" />}
          />

          <StatCard
            label="Registrations"
            value={totalRegistrations}
            icon={<Users className="h-5 w-5" />}
          />
        </section>

        <section className="mt-6 rounded-2xl border border-white/10 bg-white/[0.03] p-4">
          <div className="flex flex-col gap-3 md:flex-row">
            <div className="relative flex-1">
              <Search className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/30" />

              <input
                type="search"
                value={searchTerm}
                onChange={(event) => setSearchTerm(event.target.value)}
                placeholder="Search by title or mode..."
                className="min-h-12 w-full rounded-xl border border-white/10 bg-black/40 pl-11 pr-4 text-sm text-white outline-none transition placeholder:text-white/25 focus:border-red-500/60"
              />
            </div>

            <select
              value={statusFilter}
              onChange={(event) =>
                setStatusFilter(event.target.value as StatusFilter)
              }
              className="min-h-12 rounded-xl border border-white/10 bg-black/40 px-4 text-sm font-semibold text-white outline-none focus:border-red-500/60"
            >
              <option value="ALL">All statuses</option>
              <option value="OPEN">Open</option>
              <option value="CLOSED">Closed</option>
            </select>

            <button
              type="button"
              onClick={() => fetchScrims(true)}
              disabled={refreshing}
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 text-sm font-bold text-white/70 transition hover:bg-white/5 hover:text-white disabled:opacity-50"
            >
              <RefreshCw
                className={`h-4 w-4 ${
                  refreshing ? "animate-spin" : ""
                }`}
              />
              Refresh
            </button>
          </div>
        </section>

        {loading ? (
          <section className="mt-6 flex min-h-72 items-center justify-center rounded-3xl border border-white/10 bg-white/[0.03]">
            <div className="text-center">
              <Loader2 className="mx-auto h-9 w-9 animate-spin text-red-500" />

              <p className="mt-4 text-sm text-white/50">
                Loading scrims...
              </p>
            </div>
          </section>
        ) : errorMessage ? (
          <section className="mt-6 rounded-3xl border border-red-500/25 bg-red-500/10 p-8 text-center">
            <AlertCircle className="mx-auto h-10 w-10 text-red-400" />

            <h2 className="mt-4 text-xl font-black uppercase">
              Unable to load scrims
            </h2>

            <p className="mt-2 text-sm text-red-200/70">
              {errorMessage}
            </p>

            <button
              type="button"
              onClick={() => fetchScrims()}
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 font-bold transition hover:bg-red-500"
            >
              <RefreshCw className="h-4 w-4" />
              Try Again
            </button>
          </section>
        ) : filteredScrims.length === 0 ? (
          <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-10 text-center">
            <Gamepad2 className="mx-auto h-12 w-12 text-white/20" />

            <h2 className="mt-5 text-xl font-black uppercase">
              No scrims found
            </h2>

            <p className="mt-2 text-sm text-white/40">
              Create a new scrim or change the current filters.
            </p>

            <Link
              href="/admin/scrims/create"
              className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 font-bold transition hover:bg-red-500"
            >
              <Plus className="h-4 w-4" />
              Create Scrim
            </Link>
          </section>
        ) : (
          <section className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {filteredScrims.map((scrim) => (
              <ScrimCard key={scrim.id} scrim={scrim} />
            ))}
          </section>
        )}
      </div>
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
        {icon}
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-white/40">
        {label}
      </p>

      <p className="mt-1 text-2xl font-black sm:text-3xl">
        {value}
      </p>
    </article>
  );
}

function ScrimCard({ scrim }: { scrim: Scrim }) {
  const registrationCount = getRegistrationCount(scrim);

  const formattedDate = formatScrimDate(scrim.date);

  return (
    <article className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.03] transition hover:-translate-y-1 hover:border-red-500/35">
      <div className="relative h-36 overflow-hidden bg-gradient-to-br from-red-950 to-black">
        {scrim.image &&
        !scrim.image.includes("default-scrim.jpg") ? (
          <img
            src={scrim.image}
            alt={scrim.title}
            className="h-full w-full object-cover opacity-65"
          />
        ) : (
          <div className="flex h-full items-center justify-center">
            <Gamepad2 className="h-14 w-14 text-white/15" />
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/20 to-transparent" />

        <div className="absolute left-4 top-4 flex gap-2">
          <span className="rounded-lg bg-black/70 px-3 py-1 text-xs font-black backdrop-blur">
            {scrim.mode}
          </span>

          <span
            className={`rounded-lg px-3 py-1 text-xs font-black backdrop-blur ${
              scrim.status === "OPEN"
                ? "bg-green-500/20 text-green-300"
                : "bg-red-500/20 text-red-300"
            }`}
          >
            {scrim.status}
          </span>
        </div>
      </div>

      <div className="p-5">
        <h2 className="line-clamp-2 text-xl font-black uppercase">
          {scrim.title}
        </h2>

        <div className="mt-5 grid grid-cols-2 gap-3">
          <ScrimDetail
            icon={<IndianRupee className="h-4 w-4" />}
            label="Entry fee"
            value={`₹${scrim.fee}`}
          />

          <ScrimDetail
            icon={<Users className="h-4 w-4" />}
            label="Teams"
            value={`${registrationCount}/${scrim.maxTeams}`}
          />

          <ScrimDetail
            icon={<CalendarDays className="h-4 w-4" />}
            label="Date"
            value={formattedDate}
          />

          <ScrimDetail
            icon={<Clock className="h-4 w-4" />}
            label="Time"
            value={scrim.time}
          />
        </div>

        {scrim.roomReleased && (
          <div className="mt-4 rounded-xl border border-yellow-500/20 bg-yellow-500/5 px-3 py-2 text-xs font-bold text-yellow-300">
            Room credentials released
          </div>
        )}

        <div className="mt-5 grid grid-cols-2 gap-3">
          <Link
            href={`/scrims/${scrim.id}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 font-bold text-white/65 transition hover:bg-white/5 hover:text-white"
          >
            <Eye className="h-4 w-4" />
            Player View
          </Link>

          <Link
            href={`/admin/scrims/${scrim.id}`}
            className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 font-bold transition hover:bg-red-500"
          >
            Manage
          </Link>
        </div>
      </div>
    </article>
  );
}

function ScrimDetail({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-xl border border-white/5 bg-black/30 p-3">
      <div className="flex items-center gap-1.5 text-red-500">
        {icon}

        <span className="text-[10px] font-bold uppercase tracking-wider text-white/35">
          {label}
        </span>
      </div>

      <p className="mt-2 truncate text-sm font-bold">{value}</p>
    </div>
  );
}

function getRegistrationCount(scrim: Scrim) {
  if (typeof scrim._count?.registrations === "number") {
    return scrim._count.registrations;
  }

  if (Array.isArray(scrim.registrations)) {
    return scrim.registrations.length;
  }

  return 0;
}

function formatScrimDate(dateValue: string) {
  const date = new Date(dateValue);

  if (Number.isNaN(date.getTime())) {
    return dateValue;
  }

  return date.toLocaleDateString("en-IN", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  });
}