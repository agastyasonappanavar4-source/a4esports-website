"use client";

import Link from "next/link";
import {
  Home,
  Trophy,
  Bell,
  User,
  ScrollText,
  Settings,
  Phone,
  X,
  LogIn,
  LogOut,
  ShieldCheck,
  Sun,
  Moon,
} from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { useTheme } from "@/context/ThemeContext";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const { user, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();

  const menuItems = [
    { icon: Home, title: "Home", href: "/" },
    { icon: Trophy, title: "Tournaments", href: "/#scrims" },
    { icon: Bell, title: "Notifications", href: "/notifications" },
    { icon: User, title: "My Profile", href: "/profile" },
    { icon: ScrollText, title: "Rules", href: "/rules" },
    { icon: Phone, title: "Contact Us", href: "/contact" },
    { icon: Settings, title: "Settings", href: "/settings" },
    ...(user?.isAdmin
      ? [{ icon: ShieldCheck, title: "Admin Panel", href: "/admin" }]
      : []),
  ];

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-50 bg-black/70 backdrop-blur-xs transition-opacity duration-300 ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-full w-[280px] sm:w-80 max-w-[85vw] border-r border-border bg-panel shadow-2xl transition-transform duration-300 ease-in-out flex flex-col justify-between ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div>
          <div className="border-b border-border p-5 sm:p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <img
                  src="/logo.jpg"
                  alt="A4esports Logo"
                  className="h-10 w-10 object-cover rounded-md sm:rounded-lg border border-border/80"
                />
                <div>
                  <h2 className="font-display text-base font-bold uppercase tracking-wide text-foreground">
                    A4esports
                  </h2>
                  <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                    Competitive Platform
                  </p>
                </div>
              </div>

              <button
                onClick={onClose}
                aria-label="Close menu"
                className="rounded-md p-2 text-muted-foreground transition hover:bg-panel-2 hover:text-foreground"
              >
                <X size={20} />
              </button>
            </div>

            {user && (
              <div className="mt-4 border border-border bg-panel-2 p-3">
                <p className="font-mono text-[9px] uppercase tracking-widest text-muted-foreground">
                  Signed in as
                </p>
                <p className="mt-0.5 truncate font-display font-semibold text-sm text-foreground">
                  {user.username}
                </p>
              </div>
            )}
          </div>

          <div className="mt-3 flex flex-col overflow-y-auto max-h-[calc(100vh-200px)]">
            {menuItems.map((item) => (
              <Link
                key={item.title}
                href={item.href}
                onClick={onClose}
                className="mx-3 mb-1 flex items-center gap-3.5 px-4 py-3 font-display font-semibold uppercase tracking-wide text-xs sm:text-sm text-muted-foreground transition hover:bg-panel-2 hover:text-cyan"
              >
                <item.icon size={18} />
                {item.title}
              </Link>
            ))}

            {!user && (
              <div className="mx-3 mt-3 border-t border-border pt-3">
                <p className="px-4 pb-2 font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Appearance
                </p>
                <button
                  onClick={toggleTheme}
                  className="flex w-full items-center gap-3.5 px-4 py-3 font-display text-xs font-semibold uppercase tracking-wide text-muted-foreground transition hover:bg-panel-2 hover:text-cyan"
                >
                  {theme === "dark" ? <Sun size={18} /> : <Moon size={18} />}
                  {theme === "dark" ? "Use Light Theme" : "Use Dark Theme"}
                </button>
              </div>
            )}
          </div>
        </div>

        <div className="p-5 border-t border-border bg-panel">
          {user ? (
            <button
              onClick={() => {
                logout();
                onClose();
              }}
              className="flex w-full items-center justify-center gap-2 border border-destructive/40 bg-destructive/10 py-3 font-display text-xs sm:text-sm font-bold uppercase tracking-wide text-destructive transition hover:bg-destructive/20"
            >
              <LogOut size={17} />
              Logout
            </button>
          ) : (
            <Link
              href="/login"
              onClick={onClose}
              className="flex items-center justify-center gap-2 bg-ember py-3 font-display text-xs sm:text-sm font-bold uppercase tracking-wide text-void transition hover:bg-[var(--ember-deep)] [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]"
            >
              <LogIn size={17} />
              Login / Register
            </Link>
          )}
        </div>
      </aside>
    </>
  );
}
