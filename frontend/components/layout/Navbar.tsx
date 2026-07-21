"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { Menu, Search, User, LogOut } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";

const TICKER = [
  "WEEKLY BR CHAMPIONSHIP · REG OPEN",
  "ROOM ID DROPS 15 MIN BEFORE MATCH",
  "WEEKEND CLASH SQUAD · SLOTS FILLING",
  "PAYOUTS PROCESSED WITHIN 24H",
];

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { user, logout } = useAuth();

  const handleBrowseClick = () => {
    const section = document.getElementById("scrims");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  };

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="sticky top-0 z-50 border-b border-border bg-void/95 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          {/* LEFT */}
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-md p-2 text-foreground transition hover:bg-panel-2"
            >
              <Menu size={22} />
            </button>

            <Link href="/" className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center bg-ember font-display text-lg font-bold text-void [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]">
                FF
              </div>

              <div>
                <h1 className="font-display text-xl font-bold uppercase tracking-wide text-foreground">
                  FF Scrims
                </h1>
                <p className="-mt-1 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Competitive Platform · IN
                </p>
              </div>
            </Link>
          </div>

          {/* SEARCH */}
          <div className="hidden w-full max-w-xl px-10 lg:block">
            <div className="flex items-center border border-border bg-panel px-4 py-2.5 transition focus-within:border-cyan">
              <Search size={16} className="text-muted-foreground" />
              <input
                placeholder="Search tournaments..."
                className="ml-3 w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </div>
          </div>

          {/* RIGHT */}
          <div className="flex items-center gap-3">
            <button
              onClick={handleBrowseClick}
              className="font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-cyan"
            >
              Browse
            </button>

            {user ? (
              <>
                <div className="flex items-center gap-2 border border-border px-4 py-2">
                  <User size={16} className="text-cyan" />
                  <span className="font-mono text-sm text-foreground">
                    {user.username}
                  </span>
                </div>

                <button
                  onClick={logout}
                  className="flex items-center gap-2 border border-destructive/40 bg-destructive/10 px-4 py-2 font-display text-sm font-semibold uppercase text-destructive transition hover:bg-destructive/20"
                >
                  <LogOut size={16} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="border border-border px-5 py-2 font-display text-sm font-semibold uppercase tracking-wide text-foreground transition hover:border-cyan hover:text-cyan"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="bg-ember px-5 py-2 font-display text-sm font-semibold uppercase tracking-wide text-void transition hover:bg-[var(--ember-deep)] [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        <div className="overflow-hidden border-t border-border bg-panel py-1.5">
          <div className="flex w-max animate-marquee gap-10 whitespace-nowrap font-mono text-[11px] uppercase tracking-widest text-muted-foreground">
            {[...TICKER, ...TICKER].map((item, i) => (
              <span key={i} className="flex items-center gap-2">
                <span className="h-1.5 w-1.5 rounded-full bg-ember animate-pulse-dot" />
                {item}
              </span>
            ))}
          </div>
        </div>
      </header>
    </>
  );
}