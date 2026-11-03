export function CoachTabletMock() {
  return (
    <div className="relative mx-auto w-full max-w-xl">
      <div className="rounded-[2rem] border border-white/15 bg-zinc-900 p-3 shadow-2xl shadow-black/50">
        <div className="overflow-hidden rounded-[1.4rem] border border-white/10 bg-[#07140f]">
          <div className="flex items-center justify-between border-b border-white/10 px-4 py-3">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-[#66f7ff]">Coach Touch Free</p>
              <p className="text-sm font-semibold text-white">Pizarra · Fútbol 7</p>
            </div>
            <p className="text-xs text-white/60">20 ejercicios</p>
          </div>
          <div className="relative aspect-[4/3] bg-[radial-gradient(circle_at_center,#0c3b2e_0%,#07140f_70%)]">
            <div className="absolute inset-6 rounded-md border-2 border-white/70">
              <div className="absolute left-1/2 top-0 h-full w-px -translate-x-1/2 bg-white/70" />
              <div className="absolute left-1/2 top-1/2 h-24 w-24 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white/70" />
              <div className="absolute left-0 top-1/2 h-28 w-12 -translate-y-1/2 border-2 border-l-0 border-white/70" />
              <div className="absolute right-0 top-1/2 h-28 w-12 -translate-y-1/2 border-2 border-r-0 border-white/70" />
            </div>
            {[
              ['18%', '46%'],
              ['32%', '30%'],
              ['32%', '62%'],
              ['48%', '22%'],
              ['48%', '46%'],
              ['48%', '70%'],
              ['62%', '46%'],
            ].map(([left, top], index) => (
              <span
                key={left + top}
                className="absolute flex h-7 w-7 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full bg-[#00e5ff] text-[10px] font-bold text-[#041018]"
                style={{ left, top }}
              >
                {index + 1}
              </span>
            ))}
          </div>
          <div className="grid grid-cols-3 gap-2 p-3 text-center text-[10px] uppercase tracking-wider text-white/70">
            <span className="rounded-lg bg-white/5 py-2">Ejercicio</span>
            <span className="rounded-lg bg-[#00e5ff]/15 py-2 text-[#66f7ff]">Formación</span>
            <span className="rounded-lg bg-white/5 py-2">Temporada</span>
          </div>
        </div>
      </div>
    </div>
  );
}
