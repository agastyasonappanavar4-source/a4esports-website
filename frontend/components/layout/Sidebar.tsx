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
        className={`fixed inset-0 z-40 bg-black/40 transition ${
          open ? "opacity-100" : "pointer-events-none opacity-0"
        }`}
      />

      <aside
        className={`fixed left-0 top-0 z-50 h-screen w-80 bg-white shadow-2xl transition-transform duration-300 ${
          open ? "translate-x-0" : "-translate-x-full"
        }`}
      >
        <div className="border-b p-6">

          <div className="flex items-center justify-between">

            <div className="flex items-center gap-4">

              <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-gradient-to-br from-orange-500 to-red-500 font-black text-white">

                FF

              </div>

              <div>

                <h2 className="text-xl font-black">
                  FF SCRIMS
                </h2>

                <p className="text-sm text-gray-500">
                  India's Competitive Platform
                </p>

              </div>

            </div>

            <button onClick={onClose}>
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
              className="mx-3 mb-2 flex items-center gap-4 rounded-xl px-5 py-4 transition hover:bg-orange-50 hover:text-orange-500"
            >
              <item.icon size={22} />
              <span className="font-medium">{item.title}</span>
            </Link>
          ))}

        </div>

        <div className="absolute bottom-6 left-6 right-6">

          <Link
            href="/login"
            onClick={onClose}
            className="flex items-center justify-center gap-3 rounded-2xl bg-orange-500 py-4 font-bold text-white transition hover:bg-orange-600"
          >
            <LogIn size={20} />
            Login / Register
          </Link>

        </div>

      </aside>
    </>
  );
}