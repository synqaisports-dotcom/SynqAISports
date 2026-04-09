"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { ArrowRight, PlayCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
  CarouselNext,
  CarouselPrevious,
  type CarouselApi,
} from "@/components/ui/carousel";

type Slide = {
  title: string;
  subtitle: string;
  href: string;
  cta: string;
  tone: string;
};

const SLIDES: Slide[] = [
  {
    title: "SANDBOX COACH",
    subtitle: "App abierta de captacion para entrenadores multideporte.",
    href: "/sandbox-portal?dest=/sandbox/app",
    cta: "Abrir Sandbox",
    tone: "from-cyan-500/20 via-slate-700/60 to-slate-900",
  },
  {
    title: "SMARTWATCH LINK",
    subtitle: "Conexion en vivo para diferenciar la operacion en campo.",
    href: "/smartwatch",
    cta: "Abrir Watch Link",
    tone: "from-indigo-500/20 via-slate-700/60 to-slate-900",
  },
  {
    title: "BACKOFFICE PRO",
    subtitle: "Control global de clubs, usuarios, salud y analitica.",
    href: "/admin-global",
    cta: "Abrir Backoffice",
    tone: "from-emerald-500/20 via-slate-700/60 to-slate-900",
  },
];

export function HomeAppCarousel() {
  const [api, setApi] = useState<CarouselApi>();
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    if (!api) return;
    const onSelect = () => setCurrent(api.selectedScrollSnap());
    onSelect();
    api.on("select", onSelect);
    return () => {
      api.off("select", onSelect);
    };
  }, [api]);

  useEffect(() => {
    if (!api) return;
    const id = window.setInterval(() => {
      if (api.canScrollNext()) api.scrollNext();
      else api.scrollTo(0);
    }, 5000);
    return () => window.clearInterval(id);
  }, [api]);

  return (
    <section className="mx-auto max-w-7xl px-6 pb-16">
      <div className="relative rounded-3xl border border-white/10 bg-[#20252e] p-4 md:p-6">
        <Carousel setApi={setApi} opts={{ loop: true }} className="w-full">
          <CarouselContent>
            {SLIDES.map((slide) => (
              <CarouselItem key={slide.title}>
                <article
                  className={`relative overflow-hidden rounded-3xl border border-white/10 bg-gradient-to-br ${slide.tone} p-8 md:p-10 min-h-[280px]`}
                >
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,rgba(255,255,255,0.18),transparent_35%)]" />
                  <div className="relative z-10 max-w-2xl space-y-4">
                    <p className="text-[10px] font-black uppercase tracking-[0.25em] text-primary/90">
                      Destacado
                    </p>
                    <h2 className="text-3xl md:text-4xl font-black uppercase italic tracking-tight">
                      {slide.title}
                    </h2>
                    <p className="text-white/80 text-sm md:text-base">{slide.subtitle}</p>
                    <div className="flex flex-wrap gap-3">
                      <Button asChild className="bg-primary text-black font-black uppercase tracking-widest text-[10px]">
                        <Link href={slide.href}>
                          {slide.cta} <ArrowRight className="ml-1.5 h-3.5 w-3.5" />
                        </Link>
                      </Button>
                      <Button
                        asChild
                        variant="outline"
                        className="border-white/20 bg-[#2b313d]/70 text-white hover:bg-[#353d4c]"
                      >
                        <Link href="/apps">
                          <PlayCircle className="mr-1.5 h-3.5 w-3.5" />
                          Ver apps
                        </Link>
                      </Button>
                    </div>
                  </div>
                </article>
              </CarouselItem>
            ))}
          </CarouselContent>
          <CarouselPrevious className="left-3 top-1/2 -translate-y-1/2 border-white/20 bg-[#2b313d]/80 text-white hover:bg-[#353d4c]" />
          <CarouselNext className="right-3 top-1/2 -translate-y-1/2 border-white/20 bg-[#2b313d]/80 text-white hover:bg-[#353d4c]" />
        </Carousel>

        <div className="mt-4 flex justify-center gap-2">
          {SLIDES.map((slide, i) => (
            <button
              key={slide.title}
              type="button"
              onClick={() => api?.scrollTo(i)}
              className={`h-2.5 rounded-full transition-all ${
                current === i ? "w-8 bg-primary" : "w-2.5 bg-white/30 hover:bg-white/50"
              }`}
              aria-label={`Ir al slide ${i + 1}`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
