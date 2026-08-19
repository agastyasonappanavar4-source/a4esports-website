"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { X, Sparkles, ArrowRight } from "lucide-react";

interface PopupData {
  id: number;
  title: string;
  description?: string;
  image?: string;
  scrimId?: number;
  active: boolean;
  isPopup: boolean;
}

export default function SpecialEventPopup() {
  const [popup, setPopup] = useState<PopupData | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    async function fetchPopup() {
      try {
        const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
        const res = await fetch(`${backendUrl}/api/announcements/popup`, {
          cache: "no-store",
        });
        const data = await res.json();
        if (data.success && data.announcement && data.announcement.active) {
          const dismissedId = sessionStorage.getItem("dismissed_popup_id");
          if (dismissedId !== String(data.announcement.id)) {
            setPopup(data.announcement);
            setIsOpen(true);
          }
        }
      } catch (err) {
        console.error("Failed to fetch special event popup:", err);
      }
    }

    fetchPopup();
  }, []);

  const handleClose = () => {
    if (popup) {
      sessionStorage.setItem("dismissed_popup_id", String(popup.id));
    }
    setIsOpen(false);
  };

  if (!isOpen || !popup) return null;

  const targetLink = popup.scrimId ? `/scrims/${popup.scrimId}` : "/#scrims";

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="relative w-full max-w-md overflow-hidden rounded-2xl border border-cyan/40 bg-panel shadow-2xl transition-all duration-300">
        <div className="relative h-48 sm:h-56 w-full bg-void overflow-hidden flex items-center justify-center">
          {popup.image ? (
            <img
              src={popup.image}
              alt={popup.title}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div className="flex h-full w-full items-center justify-center bg-tactical-grid bg-hero-glow">
              <Sparkles size={48} className="text-cyan animate-pulse" />
            </div>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-panel via-panel/30 to-transparent" />

          <button
            onClick={handleClose}
            aria-label="Close modal"
            className="absolute top-3 right-3 flex h-9 w-9 items-center justify-center rounded-full border border-white/20 bg-black/60 text-white transition hover:bg-black hover:text-cyan"
          >
            <X size={18} />
          </button>

          <div className="absolute bottom-3 left-4 right-4">
            <span className="inline-flex items-center gap-1.5 rounded-full border border-cyan/40 bg-cyan/10 px-3 py-0.5 font-mono text-[10px] uppercase tracking-widest text-cyan backdrop-blur-md">
              <span className="h-1.5 w-1.5 rounded-full bg-cyan animate-pulse-dot" />
              Special Event
            </span>
            <h3 className="mt-1 font-display text-xl sm:text-2xl font-bold uppercase text-foreground leading-tight">
              {popup.title}
            </h3>
          </div>
        </div>

        <div className="p-5 space-y-4">
          {popup.description && (
            <p className="font-sans text-xs sm:text-sm text-muted-foreground leading-relaxed">
              {popup.description}
            </p>
          )}

          <div className="flex items-center gap-3 pt-2">
            <Link
              href={targetLink}
              onClick={handleClose}
              className="flex-1 flex items-center justify-center gap-2 rounded-xl bg-cyan px-5 py-3 font-display text-sm font-bold uppercase tracking-wider text-void transition hover:bg-cyan/90"
            >
              Join Tournament Now
              <ArrowRight size={16} />
            </Link>

            <button
              onClick={handleClose}
              className="rounded-xl border border-border px-4 py-3 font-display text-xs font-semibold uppercase tracking-wider text-muted-foreground transition hover:border-foreground hover:text-foreground"
            >
              Dismiss
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
