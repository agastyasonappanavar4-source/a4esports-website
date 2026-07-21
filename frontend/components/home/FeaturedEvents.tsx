"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight, Trophy, Ticket } from "lucide-react";
import { CornerFrame } from "@/components/ui/CornerFrame";

const slides = [
  {
    id: 1,
    title: "Weekly BR Championship",
    prize: "₹10,000",
    entry: "FREE",
    status: "Registration Open",
  },
  {
    id: 2,
    title: "Weekend Clash Squad",
    prize: "₹5,000",
    entry: "₹50",
    status: "Open",
  },
  {
    id: 3,
    title: "Lone Wolf League",
    prize: "₹2,500",
    entry: "FREE",
    status: "Open",
  },
];

export default function FeaturedEvents() {
  const [emblaRef, emblaApi] = useEmblaCarousel({ loop: true });
  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => emblaApi?.scrollPrev(), [emblaApi]);
  const scrollNext = useCallback(() => emblaApi?.scrollNext(), [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => setSelected(emblaApi.selectedScrollSnap());
    emblaApi.on("select", onSelect);
    onSelect();

    const interval = setInterval(() => emblaApi.scrollNext(), 5000);
    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="relative overflow-hidden bg-tactical-grid bg-hero-glow border-b border-border">
      <div className="mx-auto max-w-7xl px-5 py-10">
        <div className="mb-6 flex items-center gap-3">
          <span className="h-2 w-2 rounded-full bg-ember animate-pulse-dot" />
          <span className="font-mono text-xs uppercase tracking-[0.2em] text-cyan">
            Main Event · Live
          </span>
        </div>

        <div className="group relative border border-border bg-panel/80 backdrop-blur">
          <CornerFrame show="always" tone="ember" />

          <div ref={emblaRef} className="overflow-hidden">
            <div className="flex">
              {slides.map((slide) => (
                <div key={slide.id} className="min-w-full">
                  <div className="grid lg:grid-cols-2">
                    <div className="flex flex-col justify-center p-10 lg:p-14">
                      <span className="w-fit border border-cyan/40 bg-cyan/10 px-3 py-1 font-mono text-xs uppercase tracking-widest text-cyan">
                        {slide.status}
                      </span>

                      <h1 className="mt-6 font-display text-5xl md:text-6xl font-bold uppercase leading-[1.05] text-foreground">
                        {slide.title}
                      </h1>

                      <div className="mt-8 flex gap-8 font-mono text-sm">
                        <div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Trophy size={16} className="text-amber" />
                            Prize Pool
                          </div>
                          <p className="mt-1 text-xl font-semibold text-foreground">
                            {slide.prize}
                          </p>
                        </div>
                        <div>
                          <div className="flex items-center gap-2 text-muted-foreground">
                            <Ticket size={16} className="text-ember" />
                            Entry
                          </div>
                          <p className="mt-1 text-xl font-semibold text-foreground">
                            {slide.entry}
                          </p>
                        </div>
                      </div>

                      <button className="mt-10 w-fit bg-ember px-8 py-3.5 font-display font-bold uppercase tracking-wide text-void transition hover:bg-[var(--ember-deep)] [clip-path:polygon(0_0,calc(100%-12px)_0,100%_12px,100%_100%,12px_100%,0_calc(100%-12px))]">
                        View Tournament
                      </button>
                    </div>

                    <div className="relative hidden min-h-105 items-center justify-center border-l border-border bg-void lg:flex">
                      <div className="absolute inset-0 bg-tactical-grid opacity-40" />
                      <span className="relative font-mono text-xs uppercase tracking-widest text-muted-foreground">
                        Banner Image
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <button
            onClick={scrollPrev}
            className="absolute left-4 top-1/2 -translate-y-1/2 border border-border bg-panel/90 p-2.5 text-foreground transition hover:border-cyan hover:text-cyan"
          >
            <ChevronLeft size={18} />
          </button>

          <button
            onClick={scrollNext}
            className="absolute right-4 top-1/2 -translate-y-1/2 border border-border bg-panel/90 p-2.5 text-foreground transition hover:border-cyan hover:text-cyan"
          >
            <ChevronRight size={18} />
          </button>

          <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">
            {slides.map((_, index) => (
              <div
                key={index}
                className={`h-1 w-8 transition ${
                  selected === index ? "bg-ember" : "bg-border"
                }`}
              />
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}