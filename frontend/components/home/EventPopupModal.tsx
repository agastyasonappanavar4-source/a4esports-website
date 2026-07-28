"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, Trophy } from "lucide-react";

interface Announcement {
  id: number;
  title: string;
  description?: string;
  image?: string;
  scrimId?: number;
  isPopup: boolean;
  active: boolean;
}

export default function EventPopupModal() {
  const [announcement, setAnnouncement] = useState<Announcement | null>(null);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    // Check session storage to avoid spamming the user repeatedly in the same session if dismissed
    const dismissed = sessionStorage.getItem("ffs_event_popup_dismissed");
    if (dismissed) return;

    const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
    fetch(`${apiUrl}/api/announcements/popup`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.announcement) {
          setAnnouncement(data.announcement);
          setOpen(true);
        }
      })
      .catch(() => {});
  }, []);

  const handleClose = () => {
    setOpen(false);
    sessionStorage.setItem("ffs_event_popup_dismissed", "true");
  };

  if (!open || !announcement) return null;

  const targetLink = announcement.scrimId
    ? `/scrims/${announcement.scrimId}`
    : "/#scrims";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm animate-toast-in">
      <div className="relative w-full max-w-md overflow-hidden border-2 border-ember bg-panel shadow-2xl [clip-path:polygon(0_0,calc(100%-16px)_0,100%_16px,100%_100%,16px_100%,0_calc(100%-16px))]">
        {/* Close Button */}
        <button
          onClick={handleClose}
          className="absolute top-3 right-3 z-10 flex h-8 w-8 items-center justify-center bg-void/80 text-foreground transition hover:bg-ember hover:text-void"
          aria-label="Close announcement"
        >
          <X size={18} />
        </button>

        {/* Poster Image */}
        {announcement.image ? (
          <div className="relative h-56 w-full overflow-hidden bg-void">
            <img
              src={announcement.image}
              alt={announcement.title}
              className="h-full w-full object-cover transition transform hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-panel via-transparent to-transparent" />
          </div>
        ) : (
          <div className="flex h-36 w-full items-center justify-center bg-gradient-to-r from-ember/20 via-panel to-cyan/20 p-6 text-center">
            <Sparkles className="h-12 w-12 text-amber animate-bounce" />
          </div>
        )}

        <div className="p-6">
          <span className="inline-flex items-center gap-1.5 border border-ember/50 bg-ember/10 px-2.5 py-0.5 font-mono text-[10px] uppercase tracking-widest text-ember">
            <Trophy size={12} /> Special Event
          </span>

          <h2 className="mt-2 font-display text-2xl font-bold uppercase text-foreground leading-tight">
            {announcement.title}
          </h2>

          {announcement.description && (
            <p className="mt-2 font-mono text-xs text-muted-foreground line-clamp-3">
              {announcement.description}
            </p>
          )}

          <div className="mt-6 flex gap-3">
            <Link
              href={targetLink}
              onClick={handleClose}
              className="btn-press flex-1 bg-ember py-3 text-center font-display text-sm font-bold uppercase tracking-wide text-void transition hover:bg-[var(--ember-deep)] [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]"
            >
              Register Now
            </Link>
            <button
              onClick={handleClose}
              className="border border-border px-4 py-3 font-mono text-xs uppercase text-muted-foreground transition hover:border-cyan hover:text-cyan"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
