"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import Sidebar from "./Sidebar";
import { Menu, Search, User, LogOut } from "lucide-react";

interface LoggedInUser {
  id: number;
  username: string;
  email: string;
}

export default function Navbar() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [user, setUser] = useState<LoggedInUser | null>(null);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await fetch("http://localhost:5000/api/auth/me", {
          credentials: "include",
        });

        const data = await response.json();

        if (response.ok) {
          setUser(data.user);
        }
      } catch (error) {
        console.error(error);
      }
    };

    fetchUser();
  }, []);

  const handleBrowseClick = () => {
    const section = document.getElementById("scrims");

    if (section) {
      section.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  };

  const handleLogout = async () => {
    await fetch("http://localhost:5000/api/auth/logout", {
      method: "POST",
      credentials: "include",
    });

    setUser(null);
    window.location.reload();
  };

  return (
    <>
      <Sidebar
        open={sidebarOpen}
        onClose={() => setSidebarOpen(false)}
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
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-linear-to-br from-orange-500 to-red-500 font-bold text-white">
                FF
              </div>

              <div>
                <h1 className="text-xl font-black tracking-wide">
                  FF SCRIMS
                </h1>

                <p className="-mt-1 text-xs text-gray-500">
                  India&apos;s Competitive Platform
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

          <div className="flex items-center gap-3">

            <button
              onClick={handleBrowseClick}
              className="rounded-xl px-5 py-2.5 font-semibold text-gray-700 transition hover:bg-orange-50 hover:text-orange-500"
            >
              Browse
            </button>

            {user ? (
              <>
                <div className="flex items-center gap-2 rounded-xl border px-4 py-2">

                  <User size={18} />

                  <span className="font-semibold">
                    {user.username}
                  </span>

                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center gap-2 rounded-xl bg-red-500 px-4 py-2.5 font-semibold text-white transition hover:bg-red-600"
                >
                  <LogOut size={18} />
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="rounded-xl border border-gray-300 px-5 py-2.5 font-semibold transition hover:border-orange-500 hover:text-orange-500"
                >
                  Login
                </Link>

                <Link
                  href="/register"
                  className="rounded-xl bg-orange-500 px-5 py-2.5 font-semibold text-white shadow-md transition-all duration-300 hover:scale-[1.03] hover:bg-orange-600 hover:shadow-lg active:scale-95"
                >
                  Register
                </Link>
              </>
            )}

          </div>

        </div>
      </header>
    </>
  );
}