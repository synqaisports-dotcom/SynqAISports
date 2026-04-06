"use client";

import { Suspense, useMemo } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { ShieldCheck } from "lucide-react";

export default function TournamentParentsPlaceholderPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-[100dvh] bg-[#040812] text-white flex items-center justify-center">
          <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/60 backdrop-blur-2xl px-5 py-4 text-sm text-white/80">
            Cargando…
          </div>
        </div>
      }
    >
      <Inner />
    </Suspense>
  );
}

function Inner() {
  const searchParams = useSearchParams();
  const clubId = searchParams.get("clubId") ?? "";
  const tournamentId = searchParams.get("tournamentId") ?? "";

  const title = useMemo(() => {
    if (tournamentId) return "Micro‑app Padres (Torneos)";
    return "Micro‑app Padres";
  }, [tournamentId]);

  return (
    <div className="min-h-[100dvh] bg-[#040812] text-white relative overflow-hidden">
      <div className="absolute inset-0 opacity-30 pointer-events-none">
        <div className="absolute -top-24 -left-24 h-80 w-80 rounded-full bg-cyan-500/20 blur-3xl" />
        <div className="absolute -bottom-24 -right-24 h-96 w-96 rounded-full bg-cyan-500/10 blur-3xl" />
      </div>

      <main className="relative z-10 mx-auto w-full max-w-3xl px-4 py-10">
        <div className="rounded-2xl border border-[#00F2FF]/20 bg-[#0F172A]/60 backdrop-blur-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.45)]">
          <p className="text-[10px] font-black uppercase tracking-[0.3em] text-[#00F2FF]/60">SYNQAI · TORNEOS</p>
          <h1 className="mt-2 text-2xl font-black uppercase tracking-tight">{title}</h1>
          <p className="mt-3 text-sm text-white/70">
            Esta pantalla es un placeholder. La micro‑app de padres se definirá más adelante como terminal/microapp instalable.
          </p>

          <div className="mt-6 rounded-xl border border-white/5 bg-black/25 p-4">
            <p className="text-[10px] font-black uppercase tracking-[0.16em] text-white/55">Contexto del QR</p>
            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#00F2FF]/60 font-bold">Club</p>
                <p className="mt-1 font-mono text-[12px] text-white/85 break-all">{clubId || "—"}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-widest text-[#00F2FF]/60 font-bold">Torneo</p>
                <p className="mt-1 font-mono text-[12px] text-white/85 break-all">{tournamentId || "—"}</p>
              </div>
            </div>
          </div>

          <div className="mt-6 flex flex-col sm:flex-row gap-2 sm:items-center sm:justify-between">
            <div className="flex items-center gap-2 text-[11px] text-white/70">
              <ShieldCheck className="h-4 w-4 text-[#00F2FF]" />
              <span>Acceso futuro con login/roles + ads (AdMob) en micro‑app.</span>
            </div>
            <Link
              href="/dashboard/tournaments/list"
              className="inline-flex items-center justify-center h-10 px-4 rounded-xl border border-[#00F2FF]/25 bg-[#00F2FF]/10 text-[#00F2FF] text-[10px] font-black uppercase tracking-[0.16em] hover:bg-[#00F2FF]/15 transition-[background-color,border-color,color,opacity,transform]"
            >
              Volver a Torneos
            </Link>
          </div>
        </div>
      </main>
    </div>
  );
}

