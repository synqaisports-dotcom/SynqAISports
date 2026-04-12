"use client";

import Link from "next/link";
import { useState } from "react";

/** Home marketing: `public/images/Captura.jpg` (minúsculas; Linux/Vercel distingue de .JPG). */
const PREVIEW_SOURCES = [
  "/images/Captura.jpg",
  "/images/Captura.JPG",
  "/images/captura.jpg",
  "/images/Captura.svg",
  "/canvas-slide-1.svg",
] as const;

export function ContinuityPreviewBlock() {
  const [index, setIndex] = useState(0);
  const src = PREVIEW_SOURCES[Math.min(index, PREVIEW_SOURCES.length - 1)];

  return (
    <div className="mt-5 overflow-hidden rounded-2xl border border-white/10 bg-[#052e1f] shadow-[0_0_20px_rgba(0,242,255,0.15)]">
      <div className="relative flex min-h-[260px] w-full items-center justify-center md:min-h-[360px]">
        <img
          key={src}
          src={src}
          alt="Sandbox Coach — vista táctica de referencia"
          className="max-h-[360px] w-full object-contain object-center p-3"
          width={800}
          height={520}
          loading="eager"
          decoding="async"
          onError={() => {
            setIndex((i) => (i < PREVIEW_SOURCES.length - 1 ? i + 1 : i));
          }}
        />
      </div>
      <div className="flex flex-wrap items-center justify-center gap-3 border-t border-white/10 bg-[#0F172A]/95 px-4 py-2.5">
        <p className="text-[9px] font-bold uppercase tracking-widest text-white/50">Vista estática</p>
        <Link
          href="/sandbox/app"
          className="text-[10px] font-black uppercase tracking-widest text-cyan-400 drop-shadow-[0_0_8px_rgba(0,242,255,0.45)] hover:text-cyan-300"
        >
          Abrir pizarra en vivo →
        </Link>
      </div>
    </div>
  );
}
