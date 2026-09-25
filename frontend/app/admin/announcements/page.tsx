"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ArrowLeft, Sparkles, Plus, Trash2, CheckCircle2, XCircle } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useToast } from "@/context/ToastContext";
import { getScrims, type Scrim } from "@/lib/scrims";

interface Announcement {
  id: number;
  title: string;
  description?: string;
  image?: string;
  scrimId?: number;
  isPopup: boolean;
  active: boolean;
  createdAt: string;
}

function getAuthHeaders(customHeaders: Record<string, string> = {}) {
  const headers: Record<string, string> = { ...customHeaders };
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("token");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
  }
  return headers;
}

export default function AdminAnnouncementsPage() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const { showToast } = useToast();

  const [announcements, setAnnouncements] = useState<Announcement[]>([]);
  const [scrims, setScrims] = useState<Scrim[]>([]);
  const [loading, setLoading] = useState(true);

  // Form State
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [image, setImage] = useState("");
  const [scrimId, setScrimId] = useState<string>("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (!authLoading && (!user || !user.isAdmin)) {
      router.push(user ? "/platform" : "/");
    }
  }, [authLoading, user, router]);

  const loadData = async () => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const [annRes, scrimsData] = await Promise.all([
        fetch(`${backendUrl}/api/announcements`, { credentials: "include", headers: getAuthHeaders() }),
        getScrims(),
      ]);
      const annData = await annRes.json();

      if (annData.success) {
        setAnnouncements(annData.announcements);
      }
      setScrims(scrimsData);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    // Loading starts an async request; state updates occur after it completes.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (user?.isAdmin) void loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]);

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) {
      showToast("Title is required", "error");
      return;
    }

    setSubmitting(true);
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/announcements`, {
        method: "POST",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          title,
          description,
          image,
          scrimId: scrimId ? Number(scrimId) : null,
          isPopup: true,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Special Event Popup created & activated!", "success");
        setTitle("");
        setDescription("");
        setImage("");
        setScrimId("");
        loadData();
      } else {
        throw new Error(data.message);
      }
    } catch (err) {
      showToast(err instanceof Error ? err.message : "Failed to create", "error");
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggle = async (item: Announcement) => {
    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/announcements/${item.id}`, {
        method: "PUT",
        credentials: "include",
        headers: getAuthHeaders({ "Content-Type": "application/json" }),
        body: JSON.stringify({
          isPopup: true,
          active: !item.active,
        }),
      });

      const data = await res.json();
      if (data.success) {
        showToast(`Popup status changed to ${!item.active ? "ON" : "OFF"}`, "success");
        loadData();
      }
    } catch (err) {
      showToast("Failed to toggle popup", "error");
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this special event announcement?")) return;

    try {
      const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
      const res = await fetch(`${backendUrl}/api/announcements/${id}`, {
        method: "DELETE",
        credentials: "include",
        headers: getAuthHeaders(),
      });

      const data = await res.json();
      if (data.success) {
        showToast("Announcement deleted", "success");
        loadData();
      }
    } catch (err) {
      showToast("Failed to delete announcement", "error");
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
      <div className="mx-auto max-w-4xl px-4 sm:px-6 py-8 sm:py-12">
        <button
          onClick={() => router.push("/admin")}
          className="mb-6 flex items-center gap-2 rounded-lg border border-border bg-panel px-4 py-2 font-mono text-xs text-muted-foreground transition hover:border-cyan hover:text-cyan"
        >
          <ArrowLeft size={16} />
          Back to Admin Dashboard
        </button>

        <div className="flex items-center justify-between gap-4 mb-8">
          <div>
            <span className="font-mono text-xs uppercase tracking-widest text-cyan flex items-center gap-1.5">
              <Sparkles size={14} /> Marketing System
            </span>
            <h1 className="mt-1 font-display text-3xl sm:text-4xl font-bold uppercase text-foreground">
              Special Event Popups
            </h1>
          </div>
        </div>

        {/* Create Popup Form */}
        <form onSubmit={handleCreate} className="rounded-xl border border-border bg-panel p-6 mb-8 space-y-4">
          <h2 className="font-display text-xl font-bold uppercase text-foreground">
            Create / Link New Special Event Popup
          </h2>

          <div>
            <label className="mb-1 block font-mono text-xs uppercase text-muted-foreground">Popup Title</label>
            <input
              type="text"
              placeholder="e.g. GRAND SUNDAY BR CHAMPIONSHIP"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
            />
          </div>

          <div>
            <label className="mb-1 block font-mono text-xs uppercase text-muted-foreground">Popup Description</label>
            <textarea
              rows={3}
              placeholder="e.g. Guaranteed ₹10,000 Prize Pool! Registration open for all teams."
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full rounded-lg border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
            />
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted-foreground">Poster Image URL</label>
              <input
                type="text"
                placeholder="https://..."
                value={image}
                onChange={(e) => setImage(e.target.value)}
                className="w-full rounded-lg border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
              />
            </div>

            <div>
              <label className="mb-1 block font-mono text-xs uppercase text-muted-foreground">Linked Tournament</label>
              <select
                value={scrimId}
                onChange={(e) => setScrimId(e.target.value)}
                className="w-full rounded-lg border border-border bg-panel-2 p-3 font-mono text-sm text-foreground outline-none focus:border-cyan"
              >
                <option value="">General (No specific tournament)</option>
                {scrims.map((scrim) => (
                  <option key={scrim.id} value={scrim.id}>
                    {scrim.title} ({scrim.mode})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            type="submit"
            disabled={submitting}
            className="flex items-center justify-center gap-2 w-full rounded-xl bg-cyan py-3 font-display text-sm font-bold uppercase text-void transition hover:bg-cyan/90 disabled:opacity-50"
          >
            <Plus size={18} />
            {submitting ? "Publishing..." : "Publish & Turn ON Popup"}
          </button>
        </form>

        {/* Existing Popups */}
        <div className="space-y-4">
          <h2 className="font-display text-xl font-bold uppercase text-foreground">
            All Event Popups
          </h2>

          {loading ? (
            <p className="font-mono text-xs text-muted-foreground">Loading event popups...</p>
          ) : announcements.length === 0 ? (
            <p className="rounded-xl border border-dashed border-border p-8 text-center font-mono text-xs text-muted-foreground">
              No special event popups created yet.
            </p>
          ) : (
            announcements.map((item) => (
              <div
                key={item.id}
                className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-xl border border-border bg-panel p-5"
              >
                <div className="flex gap-4">
                  {item.image && (
                    <img src={item.image} alt={item.title} className="h-16 w-16 object-cover rounded-lg shrink-0 border border-border" />
                  )}
                  <div>
                    <div className="flex items-center gap-2">
                      <span className={`font-mono text-[10px] uppercase font-bold px-2 py-0.5 rounded ${item.active ? "bg-cyan/20 text-cyan border border-cyan/40" : "bg-muted/20 text-muted-foreground"}`}>
                        Popup status: {item.active ? "ON" : "OFF"}
                      </span>
                    </div>
                    <h3 className="mt-1 font-display text-base font-bold uppercase text-foreground">
                      {item.title}
                    </h3>
                    <p className="font-sans text-xs text-muted-foreground line-clamp-1">
                      {item.description || "No description provided"}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  <button
                    onClick={() => handleToggle(item)}
                    className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 font-mono text-xs font-semibold uppercase transition ${
                      item.active
                        ? "border-amber-400/40 bg-amber-400/10 text-amber-400 hover:bg-amber-400/20"
                        : "border-cyan/40 bg-cyan/10 text-cyan hover:bg-cyan/20"
                    }`}
                  >
                    {item.active ? <XCircle size={14} /> : <CheckCircle2 size={14} />}
                    {item.active ? "Turn OFF" : "Turn ON"}
                  </button>

                  <button
                    onClick={() => handleDelete(item.id)}
                    className="flex items-center justify-center rounded-lg border border-destructive/40 bg-destructive/10 p-2 text-destructive transition hover:bg-destructive/20"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </main>
  );
}
