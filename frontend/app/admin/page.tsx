"use client";

import Link from "next/link";
import {
  CalendarDays,
  IndianRupee,
  Gamepad2,
  Plus,
  ShieldCheck,
  Swords,
  Trophy,
  Users,
} from "lucide-react";

const stats = [
  {
    title: "Total Scrims",
    value: "12",
    icon: Swords,
    description: "All created tournaments",
  },
  {
    title: "Open Scrims",
    value: "7",
    icon: Gamepad2,
    description: "Currently accepting teams",
  },
  {
    title: "Registrations",
    value: "184",
    icon: Users,
    description: "Teams registered overall",
  },
  {
    title: "Revenue",
    value: "₹8,420",
    icon: IndianRupee,
    description: "From successful payments",
  },
];

const quickActions = [
  {
    title: "Create New Scrim",
    description: "Add a BR or CS tournament",
    href: "/admin/scrims/create",
    icon: Plus,
  },
  {
    title: "Manage Scrims",
    description: "Edit, close or release rooms",
    href: "/admin/scrims",
    icon: Trophy,
  },
  {
    title: "View Registrations",
    description: "See teams and payment status",
    href: "/admin/registrations",
    icon: Users,
  },
];

export default function AdminPage() {
  return (
    <main className="min-h-screen bg-[#070707] px-4 pb-24 pt-24 text-white sm:px-6 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <section className="relative overflow-hidden rounded-3xl border border-white/10 bg-white/[0.03] p-6 sm:p-8">
          <div className="absolute right-0 top-0 h-52 w-52 rounded-full bg-red-700/20 blur-3xl" />
          <div className="absolute bottom-0 left-0 h-40 w-40 rounded-full bg-yellow-500/10 blur-3xl" />

          <div className="relative flex flex-col gap-6 md:flex-row md:items-end md:justify-between">
            <div>
              <div className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-[0.25em] text-yellow-500">
                <ShieldCheck className="h-4 w-4" />
                A4 Esports Control Panel
              </div>

              <h1 className="text-3xl font-black uppercase tracking-tight sm:text-5xl">
                Admin Dashboard
              </h1>

              <p className="mt-3 max-w-2xl text-sm leading-6 text-white/60 sm:text-base">
                Create tournaments, manage registrations, release room
                credentials and monitor scrim activity.
              </p>
            </div>

            <Link
              href="/admin/scrims/create"
              className="inline-flex min-h-12 items-center justify-center gap-2 rounded-xl bg-red-600 px-5 py-3 font-bold transition hover:bg-red-500"
            >
              <Plus className="h-5 w-5" />
              Create Scrim
            </Link>
          </div>
        </section>

        <section className="mt-6 grid grid-cols-2 gap-3 lg:grid-cols-4">
          {stats.map((stat) => {
            const Icon = stat.icon;

            return (
              <article
                key={stat.title}
                className="rounded-2xl border border-white/10 bg-white/[0.03] p-4 sm:p-5"
              >
                <div className="mb-5 flex h-10 w-10 items-center justify-center rounded-xl bg-red-600/15 text-red-500">
                  <Icon className="h-5 w-5" />
                </div>

                <p className="text-xs font-semibold uppercase tracking-wider text-white/40">
                  {stat.title}
                </p>

                <p className="mt-1 text-2xl font-black sm:text-3xl">
                  {stat.value}
                </p>

                <p className="mt-2 hidden text-xs text-white/40 sm:block">
                  {stat.description}
                </p>
              </article>
            );
          })}
        </section>

        <section className="mt-8">
          <div className="mb-4 flex items-center justify-between">
            <div>
              <p className="text-xs font-bold uppercase tracking-[0.22em] text-red-500">
                Administration
              </p>

              <h2 className="mt-1 text-2xl font-black uppercase">
                Quick Actions
              </h2>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            {quickActions.map((action) => {
              const Icon = action.icon;

              return (
                <Link
                  key={action.title}
                  href={action.href}
                  className="group rounded-2xl border border-white/10 bg-white/[0.03] p-5 transition hover:-translate-y-1 hover:border-red-500/40 hover:bg-white/[0.05]"
                >
                  <div className="flex items-start justify-between">
                    <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-white/5 text-yellow-500 transition group-hover:bg-red-600 group-hover:text-white">
                      <Icon className="h-5 w-5" />
                    </div>

                    <span className="text-xl text-white/30 transition group-hover:translate-x-1 group-hover:text-white">
                      →
                    </span>
                  </div>

                  <h3 className="mt-6 text-lg font-black uppercase">
                    {action.title}
                  </h3>

                  <p className="mt-2 text-sm leading-6 text-white/45">
                    {action.description}
                  </p>
                </Link>
              );
            })}
          </div>
        </section>

        <section className="mt-8 grid gap-4 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5">
            <div className="mb-5 flex items-center justify-between">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.2em] text-yellow-500">
                  Recent activity
                </p>
                <h2 className="mt-1 text-xl font-black uppercase">
                  Latest Scrims
                </h2>
              </div>

              <Link
                href="/admin/scrims"
                className="text-sm font-semibold text-red-500 hover:text-red-400"
              >
                View all
              </Link>
            </div>

            <div className="space-y-3">
              {[
                {
                  name: "BR Evening Scrim",
                  date: "24 July, 7:00 PM",
                  teams: "32 / 48",
                  status: "OPEN",
                },
                {
                  name: "CS Night Clash",
                  date: "24 July, 9:00 PM",
                  teams: "18 / 24",
                  status: "OPEN",
                },
                {
                  name: "BR Pro League",
                  date: "23 July, 8:00 PM",
                  teams: "48 / 48",
                  status: "CLOSED",
                },
              ].map((scrim) => (
                <div
                  key={scrim.name}
                  className="flex items-center justify-between gap-4 rounded-xl border border-white/5 bg-black/30 p-4"
                >
                  <div className="min-w-0">
                    <p className="truncate font-bold">{scrim.name}</p>

                    <div className="mt-1 flex items-center gap-2 text-xs text-white/40">
                      <CalendarDays className="h-3.5 w-3.5" />
                      {scrim.date}
                    </div>
                  </div>

                  <div className="text-right">
                    <p className="text-sm font-bold">{scrim.teams}</p>

                    <p
                      className={`mt-1 text-xs font-bold ${
                        scrim.status === "OPEN"
                          ? "text-green-500"
                          : "text-red-500"
                      }`}
                    >
                      {scrim.status}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="rounded-2xl border border-white/10 bg-gradient-to-br from-red-950/50 to-black p-5">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-red-600 text-white">
              <ShieldCheck className="h-5 w-5" />
            </div>

            <h2 className="mt-6 text-2xl font-black uppercase">
              Admin Access
            </h2>

            <p className="mt-3 text-sm leading-6 text-white/50">
              This dashboard currently has no admin authentication. Before
              deployment, we must protect all admin routes so regular users
              cannot access them.
            </p>

            <div className="mt-6 rounded-xl border border-yellow-500/20 bg-yellow-500/5 p-4 text-sm text-yellow-200/80">
              Next priority: connect real scrim data and add protected admin
              login.
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}