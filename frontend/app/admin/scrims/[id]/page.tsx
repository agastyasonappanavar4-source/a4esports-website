import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  FormEvent,
  ReactNode,
  useEffect,
  useState,
} from "react";
import {
  AlertCircle,
  ArrowLeft,
  CalendarDays,
  Clock,
  Copy,
  Gamepad2,
  IndianRupee,
  Loader2,
  Lock,
  RefreshCw,
  Save,
  ShieldCheck,
  Ticket,
  Trash2,
  Unlock,
  User,
  Users,
} from "lucide-react";

type PaymentStatus = "PENDING" | "PAID" | "FAILED";
type ScrimStatus = "OPEN" | "CLOSED";
type ScrimMode = "BR" | "CS";
type ActionType = "status" | "room" | "delete" | null;

type Registration = {
  id: number;
  registrationCode: string;
  teamName: string;
  iglName: string;
  phone: string;
  slotNumber: number;
  paymentStatus: PaymentStatus;
  createdAt?: string;
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
  roomId?: string | null;
  roomPassword?: string | null;
  roomReleased?: boolean;
  registrations?: Registration[];
};

const API_URL =
  process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";

export default function AdminScrimDetailsPage() {
  const params = useParams();
  const router = useRouter();
  const scrimId = String(params.id);

  const [scrim, setScrim] = useState<Scrim | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  const [roomId, setRoomId] = useState("");
  const [roomPassword, setRoomPassword] = useState("");

  const [actionLoading, setActionLoading] =
    useState<ActionType>(null);
  const [actionMessage, setActionMessage] = useState("");
  const [actionError, setActionError] = useState("");

  function applyScrimData(receivedScrim: Scrim) {
    setScrim(receivedScrim);
    setRoomId(receivedScrim.roomId || "");
    setRoomPassword(receivedScrim.roomPassword || "");
  }

  async function fetchScrim(isRefresh = false) {
    try {
      if (isRefresh) {
        setRefreshing(true);
      }

      setErrorMessage("");

      const response = await fetch(
        `${API_URL}/api/scrims/${scrimId}`,
        {
          cache: "no-store",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message ||
            result?.error ||
            "Unable to load scrim details."
        );
      }

      const receivedScrim =
        result?.data?.scrim ||
        result?.data ||
        result?.scrim ||
        result;

      applyScrimData(receivedScrim);
    } catch (error) {
      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong while loading the scrim."
      );
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }

  useEffect(() => {
    const controller = new AbortController();

    async function loadScrim() {
      try {
        setErrorMessage("");

        const response = await fetch(
          `${API_URL}/api/scrims/${scrimId}`,
          {
            cache: "no-store",
            signal: controller.signal,
          }
        );

        const result = await response.json();

        if (!response.ok) {
          throw new Error(
            result?.message ||
              result?.error ||
              "Unable to load scrim details."
          );
        }

        const receivedScrim =
          result?.data?.scrim ||
          result?.data ||
          result?.scrim ||
          result;

        if (!controller.signal.aborted) {
          applyScrimData(receivedScrim);
        }
      } catch (error) {
        if (
          error instanceof Error &&
          error.name === "AbortError"
        ) {
          return;
        }

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong while loading the scrim."
        );
      } finally {
        if (!controller.signal.aborted) {
          setLoading(false);
        }
      }
    }

    void loadScrim();

    return () => {
      controller.abort();
    };
  }, [scrimId]);

  function clearActionMessages() {
    setActionMessage("");
    setActionError("");
  }

  async function updateStatus() {
    if (!scrim) return;

    const newStatus: ScrimStatus =
      scrim.status === "OPEN" ? "CLOSED" : "OPEN";

    try {
      clearActionMessages();
      setActionLoading("status");

      const response = await fetch(
        `${API_URL}/api/scrims/${scrim.id}/status`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            status: newStatus,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to update scrim status."
        );
      }

      setScrim((previous) =>
        previous
          ? {
              ...previous,
              status: newStatus,
            }
          : previous
      );

      setActionMessage(
        newStatus === "OPEN"
          ? "Scrim opened successfully."
          : "Scrim closed successfully."
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to update scrim status."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function handleRoomSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!scrim) return;

    clearActionMessages();

    if (!roomId.trim() || !roomPassword.trim()) {
      setActionError("Room ID and password are required.");
      return;
    }

    try {
      setActionLoading("room");

      const response = await fetch(
        `${API_URL}/api/scrims/${scrim.id}/room`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId: roomId.trim(),
            roomPassword: roomPassword.trim(),
            roomReleased: true,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to release room details."
        );
      }

      setScrim((previous) =>
        previous
          ? {
              ...previous,
              roomId: roomId.trim(),
              roomPassword: roomPassword.trim(),
              roomReleased: true,
            }
          : previous
      );

      setActionMessage(
        scrim.roomReleased
          ? "Room credentials updated successfully."
          : "Room credentials released successfully."
      );
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to release room details."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function hideRoom() {
    if (!scrim) return;

    try {
      clearActionMessages();
      setActionLoading("room");

      const response = await fetch(
        `${API_URL}/api/scrims/${scrim.id}/room`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            roomId,
            roomPassword,
            roomReleased: false,
          }),
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to hide room details."
        );
      }

      setScrim((previous) =>
        previous
          ? {
              ...previous,
              roomReleased: false,
            }
          : previous
      );

      setActionMessage("Room credentials hidden successfully.");
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to hide room details."
      );
    } finally {
      setActionLoading(null);
    }
  }

  async function deleteScrim() {
    if (!scrim) return;

    const confirmed = window.confirm(
      `Delete "${scrim.title}"? This cannot be undone.`
    );

    if (!confirmed) return;

    try {
      clearActionMessages();
      setActionLoading("delete");

      const response = await fetch(
        `${API_URL}/api/scrims/${scrim.id}`,
        {
          method: "DELETE",
        }
      );

      const result = await response.json();

      if (!response.ok) {
        throw new Error(
          result?.message || "Unable to delete scrim."
        );
      }

      router.push("/admin/scrims");
      router.refresh();
    } catch (error) {
      setActionError(
        error instanceof Error
          ? error.message
          : "Unable to delete scrim."
      );
      setActionLoading(null);
    }
  }

  if (loading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-[#070707] text-white">
        <div className="text-center">
          <Loader2 className="mx-auto h-10 w-10 animate-spin text-red-500" />
          <p className="mt-4 text-sm text-white/50">
            Loading scrim details...
          </p>
        </div>
      </main>
    );
  }

  if (errorMessage || !scrim) {
    return (
      <main className="min-h-screen bg-[#070707] px-4 pt-28 text-white">
        <div className="mx-auto max-w-3xl rounded-3xl border border-red-500/25 bg-red-500/10 p-8 text-center">
          <AlertCircle className="mx-auto h-10 w-10 text-red-400" />

          <h1 className="mt-4 text-2xl font-black uppercase">
            Unable to load scrim
          </h1>

          <p className="mt-2 text-sm text-red-200/70">
            {errorMessage || "Scrim not found."}
          </p>

          <button
            type="button"
            onClick={() => fetchScrim()}
            className="mt-6 inline-flex min-h-11 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 font-bold transition hover:bg-red-500"
          >
            <RefreshCw className="h-4 w-4" />
            Try Again
          </button>
        </div>
      </main>
    );
  }

  const registrations = Array.isArray(scrim.registrations)
    ? [...scrim.registrations].sort(
        (first, second) =>
          first.slotNumber - second.slotNumber
      )
    : [];

  const paidRegistrations = registrations.filter(
    (registration) => registration.paymentStatus === "PAID"
  ).length;

  const pendingRegistrations = registrations.filter(
    (registration) => registration.paymentStatus === "PENDING"
  ).length;

  return (
    <main className="min-h-screen bg-[#070707] px-4 pb-24 pt-24 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between gap-4">
          <Link
            href="/admin/scrims"
            className="inline-flex items-center gap-2 text-sm font-semibold text-white/50 transition hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Manage scrims
          </Link>

          <button
            type="button"
            onClick={() => fetchScrim(true)}
            disabled={refreshing || actionLoading !== null}
            className="inline-flex min-h-10 items-center justify-center gap-2 rounded-xl border border-white/10 px-4 text-sm font-bold text-white/60 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
          >
            <RefreshCw
              className={`h-4 w-4 ${
                refreshing ? "animate-spin" : ""
              }`}
            />
            Refresh
          </button>
        </div>

        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-64 w-64 rounded-full bg-red-700/20 blur-3xl" />

          <div className="relative">
            <div className="flex flex-wrap gap-2">
              <StatusBadge status={scrim.status} />

              <span className="rounded-lg bg-white/5 px-3 py-1 text-xs font-black">
                {scrim.mode}
              </span>

              {scrim.roomReleased && (
                <span className="rounded-lg bg-yellow-500/10 px-3 py-1 text-xs font-black text-yellow-300">
                  ROOM RELEASED
                </span>
              )}
            </div>

            <h1 className="mt-5 text-3xl font-black uppercase tracking-tight sm:text-5xl">
              {scrim.title}
            </h1>

            <p className="mt-3 text-sm text-white/45">
              Scrim ID: #{scrim.id}
            </p>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          <DetailCard
            icon={<IndianRupee className="h-5 w-5" />}
            label="Entry Fee"
            value={`₹${scrim.fee}`}
          />

          <DetailCard
            icon={<Users className="h-5 w-5" />}
            label="Registrations"
            value={`${registrations.length}/${scrim.maxTeams}`}
          />

          <DetailCard
            icon={<CalendarDays className="h-5 w-5" />}
            label="Date"
            value={formatDate(scrim.date)}
          />

          <DetailCard
            icon={<Clock className="h-5 w-5" />}
            label="Time"
            value={scrim.time}
          />
        </section>

        <section className="mt-6 rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
          <div className="flex flex-col gap-5 lg:flex-row lg:items-center lg:justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
                Admin controls
              </p>

              <h2 className="mt-1 text-2xl font-black uppercase">
                Tournament Actions
              </h2>

              <p className="mt-2 text-sm text-white/45">
                Open or close registrations, release room
                credentials, or remove this scrim.
              </p>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button
                type="button"
                onClick={updateStatus}
                disabled={actionLoading !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-white/10 px-5 font-bold text-white/70 transition hover:bg-white/5 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading === "status" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : scrim.status === "OPEN" ? (
                  <Lock className="h-4 w-4" />
                ) : (
                  <Unlock className="h-4 w-4" />
                )}

                {scrim.status === "OPEN"
                  ? "Close Scrim"
                  : "Open Scrim"}
              </button>

              <button
                type="button"
                onClick={deleteScrim}
                disabled={actionLoading !== null}
                className="inline-flex min-h-11 items-center justify-center gap-2 rounded-xl border border-red-500/30 bg-red-500/10 px-5 font-bold text-red-300 transition hover:bg-red-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {actionLoading === "delete" ? (
                  <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                  <Trash2 className="h-4 w-4" />
                )}

                Delete Scrim
              </button>
            </div>
          </div>

          {actionError && (
            <div className="mt-5 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-300">
              {actionError}
            </div>
          )}

          {actionMessage && (
            <div className="mt-5 rounded-xl border border-green-500/30 bg-green-500/10 px-4 py-3 text-sm text-green-300">
              {actionMessage}
            </div>
          )}
        </section>

        <section className="mt-6 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-3xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
            <div className="flex flex-col gap-4 border-b border-white/10 pb-5 sm:flex-row sm:items-end sm:justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-red-500">
                  Registered teams
                </p>

                <h2 className="mt-1 text-2xl font-black uppercase">
                  Team List
                </h2>
              </div>

              <div className="flex flex-wrap gap-2 text-xs font-bold">
                <span className="rounded-lg bg-white/5 px-3 py-2 text-white/60">
                  Total: {registrations.length}
                </span>

                <span className="rounded-lg bg-green-500/10 px-3 py-2 text-green-300">
                  Paid: {paidRegistrations}
                </span>

                <span className="rounded-lg bg-yellow-500/10 px-3 py-2 text-yellow-300">
                  Pending: {pendingRegistrations}
                </span>
              </div>
            </div>

            {registrations.length === 0 ? (
              <div className="py-16 text-center">
                <Users className="mx-auto h-12 w-12 text-white/15" />

                <h3 className="mt-4 text-lg font-black uppercase">
                  No registrations
                </h3>

                <p className="mt-2 text-sm text-white/40">
                  Teams registered for this scrim will appear here.
                </p>
              </div>
            ) : (
              <div className="mt-5 space-y-3">
                {registrations.map((registration) => (
                  <RegistrationCard
                    key={registration.id}
                    registration={registration}
                  />
                ))}
              </div>
            )}
          </div>

          <div className="space-y-6">
            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-red-500">
                <Gamepad2 className="h-5 w-5" />

                <h2 className="text-lg font-black uppercase">
                  Room Details
                </h2>
              </div>

              <form
                onSubmit={handleRoomSubmit}
                className="mt-5 space-y-4"
              >
                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">
                    Room ID
                  </span>

                  <input
                    type="text"
                    value={roomId}
                    onChange={(event) =>
                      setRoomId(event.target.value)
                    }
                    placeholder="Enter Free Fire room ID"
                    className="min-h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500/60"
                  />
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-bold uppercase tracking-wider text-white/40">
                    Room Password
                  </span>

                  <input
                    type="text"
                    value={roomPassword}
                    onChange={(event) =>
                      setRoomPassword(event.target.value)
                    }
                    placeholder="Enter room password"
                    className="min-h-12 w-full rounded-xl border border-white/10 bg-black/40 px-4 text-white outline-none transition placeholder:text-white/25 focus:border-red-500/60"
                  />
                </label>

                <button
                  type="submit"
                  disabled={actionLoading !== null}
                  className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-red-600 px-5 font-bold transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  {actionLoading === "room" ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4" />
                  )}

                  {scrim.roomReleased
                    ? "Update Room Details"
                    : "Release Room"}
                </button>

                {scrim.roomReleased && (
                  <button
                    type="button"
                    onClick={hideRoom}
                    disabled={actionLoading !== null}
                    className="inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-yellow-500/25 bg-yellow-500/5 px-5 font-bold text-yellow-300 transition hover:bg-yellow-500/10 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    <Lock className="h-4 w-4" />
                    Hide Room Details
                  </button>
                )}
              </form>

              {scrim.roomReleased && (
                <div className="mt-5 border-t border-white/10 pt-5">
                  <p className="mb-3 text-xs font-bold uppercase tracking-wider text-green-300">
                    Currently visible to players
                  </p>

                  <div className="space-y-3">
                    <RoomValue
                      label="Room ID"
                      value={scrim.roomId || "Not available"}
                    />

                    <RoomValue
                      label="Password"
                      value={
                        scrim.roomPassword || "Not available"
                      }
                    />
                  </div>
                </div>
              )}
            </section>

            <section className="rounded-3xl border border-white/10 bg-white/[0.03] p-5">
              <div className="flex items-center gap-2 text-red-500">
                <ShieldCheck className="h-5 w-5" />

                <h2 className="text-lg font-black uppercase">
                  Tournament Rules
                </h2>
              </div>

              <div className="mt-5 whitespace-pre-line text-sm leading-7 text-white/55">
                {scrim.rules || "No rules have been added."}
              </div>
            </section>
          </div>
        </section>
      </div>
    </main>
  );
}

function DetailCard({
  icon,
  label,
  value,
}: {
  icon: ReactNode;
  label: string;
  value: string;
}) {
  return (
    <article className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5">
      <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
        {icon}
      </div>

      <p className="mt-5 text-xs font-bold uppercase tracking-wider text-white/40">
        {label}
      </p>

      <p className="mt-1 truncate text-xl font-black sm:text-2xl">
        {value}
      </p>
    </article>
  );
}

function RegistrationCard({
  registration,
}: {
  registration: Registration;
}) {
  return (
    <article className="rounded-2xl border border-white/5 bg-black/30 p-4">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-start gap-4">
          <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-red-600/15 font-black text-red-400">
            {registration.slotNumber}
          </div>

          <div className="min-w-0">
            <h3 className="truncate font-black uppercase">
              {registration.teamName}
            </h3>

            <div className="mt-2 flex flex-wrap gap-x-4 gap-y-2 text-xs text-white/45">
              <span className="flex items-center gap-1.5">
                <User className="h-3.5 w-3.5" />
                IGL: {registration.iglName}
              </span>

              <span className="flex items-center gap-1.5">
                <Ticket className="h-3.5 w-3.5" />
                {registration.registrationCode}
              </span>
            </div>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3 sm:justify-end">
          <span className="text-sm font-semibold text-white/55">
            {registration.phone}
          </span>

          <PaymentBadge
            status={registration.paymentStatus}
          />
        </div>
      </div>
    </article>
  );
}

function PaymentBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const classes: Record<PaymentStatus, string> = {
    PAID: "bg-green-500/10 text-green-300",
    PENDING: "bg-yellow-500/10 text-yellow-300",
    FAILED: "bg-red-500/10 text-red-300",
  };

  return (
    <span
      className={`rounded-lg px-3 py-1.5 text-xs font-black ${classes[status]}`}
    >
      {status}
    </span>
  );
}

function StatusBadge({
  status,
}: {
  status: ScrimStatus;
}) {
  return (
    <span
      className={`rounded-lg px-3 py-1 text-xs font-black ${
        status === "OPEN"
          ? "bg-green-500/10 text-green-300"
          : "bg-red-500/10 text-red-300"
      }`}
    >
      {status}
    </span>
  );
}

function RoomValue({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  async function copyValue() {
    try {
      await navigator.clipboard.writeText(value);
    } catch {
      // Clipboard access may be unavailable in some browsers.
    }
  }

  return (
    <div className="rounded-xl border border-white/10 bg-black/40 p-4">
      <p className="text-xs font-bold uppercase tracking-wider text-white/35">
        {label}
      </p>

      <div className="mt-2 flex items-center justify-between gap-3">
        <p className="truncate font-black">{value}</p>

        <button
          type="button"
          onClick={copyValue}
          className="rounded-lg p-2 text-white/40 transition hover:bg-white/5 hover:text-white"
          aria-label={`Copy ${label}`}
        >
          <Copy className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}

function formatDate(dateValue: string) {
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
