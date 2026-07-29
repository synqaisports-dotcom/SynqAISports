import Link from 'next/link';
import type { DemoTorneoPwaLinks } from '@/app/actions/tournaments';
import {
  ClipboardList,
  QrCode,
  Radio,
  Smartphone,
  Trophy,
  Users,
} from 'lucide-react';

const cardClass =
  'flex items-start gap-4 rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-cyan-400/10 to-transparent p-4 transition-colors hover:border-cyan-400/40 active:scale-[0.99]';

export function TorneoPwaHub({ links }: { links: DemoTorneoPwaLinks }) {
  const items = [
    {
      href: links.publicWeb,
      icon: Trophy,
      title: 'Web pública del torneo',
      desc: 'Resultados en vivo para padres y seguidores',
    },
    {
      href: links.mesa,
      icon: Smartphone,
      title: 'Mesa móvil',
      desc: links.mesaLabel,
    },
    {
      href: links.delegado,
      icon: Users,
      title: 'Portal delegado',
      desc: links.delegadoLabel,
    },
    {
      href: links.taquilla,
      icon: QrCode,
      title: 'Taquilla QR',
      desc: 'Validar entradas en puerta (PWA)',
    },
  ];

  return (
    <div className="mx-auto min-h-dvh max-w-lg px-4 py-8">
      <header className="mb-8 text-center">
        <div className="mx-auto mb-3 flex size-14 items-center justify-center rounded-2xl border border-cyan-400/30 bg-cyan-400/10">
          <Radio className="size-7 text-cyan-300" />
        </div>
        <p className="text-xs uppercase tracking-[0.2em] text-cyan-300">SynqAI Torneos · PWA</p>
        <h1 className="mt-2 text-2xl font-bold">{links.tournamentName}</h1>
        <p className="mt-2 text-sm text-muted-foreground">
          Instala como app desde el navegador (Añadir a pantalla de inicio) y prueba cada rol sin entrar al portal.
        </p>
      </header>

      <div className="space-y-3">
        {items.map(({ href, icon: Icon, title, desc }) => (
          <Link key={href} href={href} className={cardClass}>
            <div className="flex size-11 shrink-0 items-center justify-center rounded-xl bg-cyan-400/15">
              <Icon className="size-5 text-cyan-300" />
            </div>
            <div className="min-w-0 text-left">
              <p className="font-semibold">{title}</p>
              <p className="mt-0.5 text-sm text-muted-foreground">{desc}</p>
            </div>
          </Link>
        ))}
      </div>

      <div className="mt-8 rounded-2xl border border-border/50 p-4 text-sm text-muted-foreground">
        <p className="flex items-center gap-2 font-medium text-foreground">
          <ClipboardList className="size-4 text-cyan-300" />
          Cómo instalar la PWA
        </p>
        <ul className="mt-2 list-inside list-disc space-y-1 text-xs">
          <li>iPhone: Compartir → Añadir a pantalla de inicio</li>
          <li>Android: Menú ⋮ → Instalar aplicación</li>
          <li>Chrome escritorio: icono de instalación en la barra de URL</li>
        </ul>
      </div>
    </div>
  );
}
