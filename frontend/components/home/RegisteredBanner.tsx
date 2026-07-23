"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock3, ArrowRight } from "lucide-react";
import { useAuth } from "@/hooks/useAuth";
import { getMyRegistrations, type MyRegistration } from "@/services/registrations";
import { combineDateTime, getCountdown } from "@/lib/countdown";

export default function RegisteredBanner() {
  const { user } = useAuth();
  const [reg, setReg] = useState<MyRegistration | null>(null);
  const [countdown, setCountdown] = useState("");

  useEffect(() => {
    if (!user) return;

    getMyRegistrations()
      .then((regs) => {
        const upcoming = regs
          .filter((r) => combineDateTime(r.scrim.date, r.scrim.time).getTime() > Date.now())
          .sort(
            (a, b) =>
              combineDateTime(a.scrim.date, a.scrim.time).getTime() -
              combineDateTime(b.scrim.date, b.scrim.time).getTime()
          );

        setReg(upcoming[0] || null);
      })
      .catch(() => setReg(null));
  }, [user]);

  useEffect(() => {
    if (!reg) return;

    const target = combineDateTime(reg.scrim.date, reg.scrim.time);
    const update = () => setCountdown(getCountdown(target));
    update();

    const interval = setInterval(update, 60000);
    return () => clearInterval(interval);
  }, [reg]);

  if (!reg) return null;

  return (
    <section className="mx-auto mt-6 max-w-7xl px-5">
      <div className="flex flex-col items-start justify-between gap-5 border border-ember/40 bg-ember/10 p-6 md:flex-row md:items-center">
        <div>
          <p className="font-mono text-xs uppercase tracking-widest text-ember">
            🔥 You&apos;re Registered
          </p>
          <h2 className="mt-2 font-display text-2xl font-bold uppercase text-foreground">
            {reg.scrim.title}
          </h2>
          <div className="mt-3 flex items-center gap-2 font-mono text-sm text-muted-foreground">
            <Clock3 size={16} className="text-ember" />
            Starts in <span className="font-semibold text-foreground">{countdown}</span>
          </div>
        </div>

        <Link
          href={`/my-match/${reg.id}`}
          className="flex items-center gap-2 bg-ember px-6 py-3.5 font-display font-bold uppercase tracking-wide text-void transition hover:bg-[var(--ember-deep)] [clip-path:polygon(0_0,calc(100%-10px)_0,100%_10px,100%_100%,10px_100%,0_calc(100%-10px))]"
        >
          Know More
          <ArrowRight size={18} />
        </Link>
      </div>
    </section>
  );
}