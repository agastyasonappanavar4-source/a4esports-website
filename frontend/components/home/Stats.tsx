"use client";

import { useEffect, useRef, useState } from "react";

interface StatItem {
  target: number;
  suffix: string;
  prefix?: string;
  label: string;
}

const stats: StatItem[] = [
  { target: 15000, suffix: "+", label: "Players" },
  { target: 900, suffix: "+", label: "Matches Hosted" },
  { target: 5, suffix: "L+", prefix: "₹", label: "Prize Pool Paid" },
];

function useCountUp(target: number, active: boolean, duration = 1400) {
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!active) return;

    let start: number | null = null;

    const step = (timestamp: number) => {
      if (start === null) start = timestamp;
      const progress = Math.min((timestamp - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.floor(eased * target));

      if (progress < 1) {
        requestAnimationFrame(step);
      } else {
        setValue(target);
      }
    };

    const frame = requestAnimationFrame(step);
    return () => cancelAnimationFrame(frame);
  }, [active, target, duration]);

  return value;
}

function StatCard({ stat }: { stat: StatItem }) {
  const ref = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(false);
  const value = useCountUp(stat.target, active);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setActive(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, []);

  return (
    <div ref={ref} className="bg-panel p-8 text-center">
      <h2 className="font-mono text-4xl font-semibold text-ember">
        {stat.prefix || ""}
        {value.toLocaleString("en-IN")}
        {stat.suffix}
      </h2>
      <p className="mt-2 font-mono text-xs uppercase tracking-widest text-muted-foreground">
        {stat.label}
      </p>
    </div>
  );
}

export default function Stats() {
  return (
    <section className="border-b border-border bg-panel py-14">
      <div className="mx-auto grid max-w-6xl grid-cols-1 gap-px bg-border md:grid-cols-3">
        {stats.map((stat) => (
          <StatCard key={stat.label} stat={stat} />
        ))}
      </div>
    </section>
  );
}