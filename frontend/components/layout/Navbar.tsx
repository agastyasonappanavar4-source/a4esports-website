"use client";

import { useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import NotificationPanel from "./NotificationPanel";
import { Menu, Bell, Search, User } from "lucide-react";

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [notificationOpen, setNotificationOpen] = useState(false);

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
      />

      <NotificationPanel
        open={notificationOpen}
        onClose={() => setNotificationOpen(false)}
      />

      <header className="sticky top-0 z-50 border-b border-gray-200 bg-white/90 backdrop-blur-xl">

        <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">

          {/* LEFT */}

          <div className="flex items-center gap-4">

            <button
              onClick={() => setSidebarOpen(true)}
              className="rounded-xl p-2 transition hover:bg-gray-100"
            >
              <Menu size={24} />
            </button>

            <Link href="/" className="flex items-center gap-3">

              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br from-orange-500 to-red-500 text-white font-bold">

                FF

              </div>

              <div>

                <h1 className="text-xl font-black tracking-wide">

                  FF SCRIMS

                </h1>

                <p className="-mt-1 text-xs text-gray-500">

                  India's Competitive Platform

                </p>

              </div>

            </Link>

          </div>

          {/* SEARCH */}

          <div className="hidden w-full max-w-xl px-10 lg:block">

            <div className="flex items-center rounded-2xl border bg-gray-50 px-4 py-3 transition focus-within:border-orange-500">

              <Search size={18} className="text-gray-500" />

              <input
                placeholder="Search tournaments..."
                className="ml-3 w-full bg-transparent outline-none"
              />

            </div>

          </div>

          {/* RIGHT */}

          <div className="flex items-center gap-2">

            <button
              onClick={() => setNotificationOpen(true)}
              className="relative rounded-xl p-3 transition hover:bg-gray-100"
            >
              <Bell size={22} />

              <span className="absolute right-2 top-2 h-2.5 w-2.5 rounded-full bg-red-500" />

            </button>

            <Link
              href="/login"
              className="rounded-xl border px-5 py-2.5 font-semibold transition hover:border-orange-500 hover:text-orange-500"
            >
              Login
            </Link>

            <Link
              href="/"
              className="rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white transition hover:bg-orange-600"
            >
              Browse
            </Link>

          </div>

        </div>

      </header>
    </>
  );
}