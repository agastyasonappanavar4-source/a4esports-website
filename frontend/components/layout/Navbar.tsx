"use client";

import { useState, type FormEvent } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Sidebar from "./Sidebar";
import { Menu, Search, User, LogOut, Sun, Moon } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";

const TICKER = [
  "BROWSE UPCOMING SCRIMS",
  "ROOM DETAILS RELEASED BY ADMIN WHEN AVAILABLE",
  "PAID ENTRIES NEED MANUAL CONFIRMATION",
  "CHECK YOUR MATCH CARD FOR UPDATES",
];

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [mobileSearchOpen, setMobileSearchOpen] = useState(false);
  const router = useRouter();
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const handleSearch = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const query = String(new FormData(event.currentTarget).get("q") || "").trim();
    router.push(`/platform${query ? `?q=${encodeURIComponent(query)}` : ""}#scrims`);
  };

  const handleBrowseClick = () => {
    const section = document.getElementById("scrims");
    if (section) {
      section.scrollIntoView({ behavior: "smooth", block: "start" });
    } else {
      router.push("/platform#scrims");
    }
  };

  return (
    <>
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />

      <header className="sticky top-0 z-50 border-b border-border bg-panel/90 backdrop-blur-xl">
        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-3 sm:px-5">
          <div className="flex items-center gap-2 sm:gap-4">
            <button
              onClick={() => setSidebarOpen(true)}
              aria-label="Open menu"
              className="flex h-10 w-10 items-center justify-center rounded-md border border-border/80 bg-panel-2 text-foreground transition hover:border-cyan hover:text-cyan"
            >
              <Menu size={20} />
            </button>

            <Link href={user ? "/platform" : "/"} className="flex items-center gap-2.5 sm:gap-3">
              <img
                src="/logo.jpg"
                alt="A4 ESPORTS Logo"
                className="h-9 w-9 sm:h-10 sm:w-10 object-cover rounded-md sm:rounded-lg border border-border/80"
              />

              <div>
                <h1 className="font-display text-base sm:text-xl font-bold uppercase tracking-wide text-foreground">
                  A4 ESPORTS
                </h1>
                <p className="-mt-1 font-mono text-[9px] sm:text-[10px] uppercase tracking-widest text-muted-foreground">
                  Competitive Platform
                </p>
              </div>
            </Link>
          </div>

          <div className="hidden w-full max-w-xl px-10 lg:block">
            <form onSubmit={handleSearch} role="search" className="flex items-center border border-border bg-panel px-4 py-2.5 transition focus-within:border-cyan">
              <Search size={16} className="text-muted-foreground" />
              <input
                placeholder="Search tournaments..."
                aria-label="Search tournaments"
                name="q"
                className="ml-3 w-full bg-transparent font-mono text-sm text-foreground outline-none placeholder:text-muted-foreground"
              />
            </form>
          </div>

          <div className="flex items-center gap-1.5 sm:gap-3">
            <button
              onClick={() => setMobileSearchOpen((open) => !open)}
              aria-label="Search tournaments"
              aria-expanded={mobileSearchOpen}
              className="border border-border p-2.5 text-muted-foreground transition hover:text-cyan lg:hidden"
            >
              <Search size={18} />
            </button>
            <button
              onClick={handleBrowseClick}
              className="hidden font-display text-sm font-semibold uppercase tracking-wide text-muted-foreground transition hover:text-cyan sm:block"
            >
              Browse
            </button>

            <button
              onClick={toggleTheme}
              aria-label="Toggle theme"
              className={`border border-border p-2.5 text-muted-foreground transition hover:border-cyan hover:text-cyan ${
                user ? "" : "hidden sm:block"
              }`}
            >
              {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
            </button>

            {user ? (
              <>
                <div className="hidden items-center gap-2 border border-border px-4 py-2 sm:flex">
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
                  <span className="hidden sm:inline">Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="border border-border px-3 sm:px-5 py-2 font-display text-xs sm:text-sm font-semibold uppercase tracking-wide text-foreground transition hover:border-cyan hover:text-cyan"
                >
                  Login
                </Link>

                <Link
                  href="/login"
                  className="bg-ember px-3 sm:px-5 py-2 font-display text-xs sm:text-sm font-semibold uppercase tracking-wide text-void transition hover:bg-[var(--ember-deep)] [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]"
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>

        {mobileSearchOpen && (
          <form onSubmit={handleSearch} role="search" className="border-t border-border px-3 py-2 lg:hidden">
            <input
              name="q"
              aria-label="Search tournaments"
              placeholder="Search tournaments..."
              autoFocus
              className="w-full border border-border bg-panel-2 px-3 py-2 font-mono text-sm text-foreground outline-none focus:border-cyan"
            />
          </form>
        )}

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
