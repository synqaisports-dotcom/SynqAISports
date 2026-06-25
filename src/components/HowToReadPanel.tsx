import { BookOpen } from 'lucide-react';

export function HowToReadPanel({ variant = 'tendencias' }: { variant?: 'tendencias' | 'radar' }) {
  if (variant === 'radar') {
    return (
      <div className="mb-6 rounded-xl border border-tp-cyan/30 bg-tp-cyan/5 px-4 py-4">
        <div className="flex items-start gap-3">
          <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-tp-cyan" />
          <div className="text-sm text-slate-300">
            <p className="font-medium text-white">Radar = productos que ya conocemos (Labubu, Pop It…)</p>
            <ol className="mt-2 list-decimal space-y-1.5 pl-4 text-xs leading-relaxed text-slate-400">
              <li>
                <strong className="text-white">Noticias</strong> — cuántas menciones hay en China, USA y España
              </li>
              <li>
                <strong className="text-emerald-300">Ventas</strong> — qué se compra de verdad en AliExpress y Amazon
              </li>
              <li>
                Si <strong className="text-emerald-300">vende mucho</strong> y{' '}
                <strong className="text-white">España está en 0</strong> → oportunidad antes que el patio
              </li>
            </ol>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="mb-6 rounded-xl border border-violet-500/30 bg-violet-500/5 px-4 py-4">
      <div className="flex items-start gap-3">
        <BookOpen className="mt-0.5 h-5 w-5 shrink-0 text-violet-300" />
        <div className="text-sm text-slate-300">
          <p className="font-medium text-white">Cómo leer cada ficha en 30 segundos</p>
          <ol className="mt-2 list-decimal space-y-2 pl-4 text-xs leading-relaxed text-slate-400">
            <li>
              Mira el <strong className="text-white">semáforo arriba</strong>: 🟢 comprar muestra · 🟡 vigilar · 🔴
              tarde para España
            </li>
            <li>
              <strong className="text-emerald-300">Fuente (Best Sink Store)</strong> — dónde comprar
              barato en origen
            </li>
            <li>
              <strong className="text-sky-300">AliExpress</strong> — muestra de 1 unidad sin MOQ
            </li>
            <li>
              <strong className="text-amber-300">Amazon / Temu</strong> — solo referencia retail (ya
              inflado, no comprar para importar)
            </li>
          </ol>
        </div>
      </div>
    </div>
  );
}
