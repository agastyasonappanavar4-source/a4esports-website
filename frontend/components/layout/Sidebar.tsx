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
} from "lucide-react";

interface SidebarProps {
  open: boolean;
  onClose: () => void;
}

export default function Sidebar({ open, onClose }: SidebarProps) {
  const menuItems = [
    { icon: Home, title: "Home", href: "/" },
    { icon: Trophy, title: "Tournaments", href: "/" },
    { icon: Bell, title: "Notifications", href: "/" },
    { icon: User, title: "My Profile", href: "/" },
    { icon: ScrollText, title: "Rules", href: "/rules" },
    { icon: Phone, title: "Contact Us", href: "/" },
    { icon: Settings, title: "Settings", href: "/" },
  ];

  return (
    <>
      <div
        onClick={onClose}
        className={`fixed inset-0 z-40 bg-black/60 transition ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-80 border-r border-border bg-panel shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b border-border p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="flex h-11 w-11 items-center justify-center bg-ember font-display text-lg font-bold text-void [clip-path:polygon(0_0,calc(100%-8px)_0,100%_8px,100%_100%,8px_100%,0_calc(100%-8px))]">
                FF
              </div>
              <div>
                <h2 className="font-display text-lg font-bold uppercase tracking-wide text-foreground">
                  FF Scrims
                </h2>
                <p className="font-mono text-[10px] uppercase tracking-widest text-muted-foreground">
                  Competitive Platform
                </p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="text-muted-foreground transition hover:text-foreground"
            >
              <X />
            </button>
          </div>
        </div>

        <div className="mt-4 flex flex-col">
          {menuItems.map((item) => (
            <Link
              key={item.title}
              href={item.href}
              onClick={onClose}
              className="mx-3 mb-1 flex items-center gap-4 px-5 py-3.5 font-display font-semibold uppercase tracking-wide text-sm text-muted-foreground transition hover:bg-panel-2 hover:text-cyan"
            >
              <item.icon size={19} />
              {item.title}
            </Link>
          ))}
        </div>

        <div className="absolute bottom-6 left-6 right-6">
          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-3 bg-ember py-3.5 font-display font-bold uppercase tracking-wide text-void transition hover:bg-[var(--ember-deep)] [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))]"
          >
            <LogIn size={19} />
            Login / Register
          </Link>
        </div>
      </aside>
    </>
  );
}