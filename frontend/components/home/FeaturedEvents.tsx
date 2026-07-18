"use client";

import { useCallback, useEffect, useState } from "react";
import useEmblaCarousel from "embla-carousel-react";
import { ChevronLeft, ChevronRight } from "lucide-react";

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
  const [emblaRef, emblaApi] = useEmblaCarousel({
    loop: true,
  });

  const [selected, setSelected] = useState(0);

  const scrollPrev = useCallback(() => {
    emblaApi?.scrollPrev();
  }, [emblaApi]);

  const scrollNext = useCallback(() => {
    emblaApi?.scrollNext();
  }, [emblaApi]);

  useEffect(() => {
    if (!emblaApi) return;

    const onSelect = () => {
      setSelected(emblaApi.selectedScrollSnap());
    };

    emblaApi.on("select", onSelect);
    onSelect();

    const interval = setInterval(() => {
      emblaApi.scrollNext();
    }, 5000);

    return () => clearInterval(interval);
  }, [emblaApi]);

  return (
    <section className="mx-auto mt-8 max-w-7xl px-5">

      <div className="mb-5 flex items-center justify-between">

        <div>
          <h2 className="text-3xl font-bold">
            🔥 Main Event
          </h2>

          <p className="text-gray-500">
            Featured Tournament
          </p>
        </div>

      </div>

      <div className="relative overflow-hidden rounded-3xl shadow-xl">

        <div ref={emblaRef}>

          <div className="flex">

            {slides.map((slide) => (

              <div
                key={slide.id}
                className="min-w-full bg-white"
              >

                <div className="grid lg:grid-cols-2">

                  <div className="flex flex-col justify-center p-10">

                    <span className="w-fit rounded-full bg-orange-100 px-4 py-2 font-semibold text-orange-600">
                      {slide.status}
                    </span>

                    <h1 className="mt-5 text-5xl font-black">
                      {slide.title}
                    </h1>

                    <div className="mt-8 space-y-3">

                      <p>
                        🏆 Prize Pool : {slide.prize}
                      </p>

                      <p>
                        🎮 Entry : {slide.entry}
                      </p>

                    </div>

                    <button className="mt-8 w-fit rounded-xl bg-orange-500 px-8 py-3 font-bold text-white hover:bg-orange-600">
                      View Tournament
                    </button>

                  </div>

                  <div className="flex h-[420px] items-center justify-center bg-gray-200 text-2xl font-bold">

                    Banner Image

                  </div>

                </div>

              </div>

            ))}

          </div>

        </div>

        <button
          onClick={scrollPrev}
          className="absolute left-5 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
        >
          <ChevronLeft />
        </button>

        <button
          onClick={scrollNext}
          className="absolute right-5 top-1/2 -translate-y-1/2 rounded-full bg-white p-3 shadow-lg"
        >
          <ChevronRight />
        </button>

        <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 gap-2">

          {slides.map((_, index) => (

            <div
              key={index}
              className={`h-3 w-3 rounded-full ${
                selected === index
                  ? "bg-orange-500"
                  : "bg-gray-300"
              }`}
            />

          ))}

        </div>

      </div>

    </section>
  );
}