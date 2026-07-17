import { SynqIcon } from '@/components/brand/SynqIcon';
import { SynqWordmark } from '@/components/brand/SynqWordmark';
import { cn } from '@/lib/utils';

type Props = {
  message?: string;
  hint?: string;
  className?: string;
};

/** Pantalla de carga del portal: logo SynqAI centrado con giro 3D en eje Y. */
export function PortalLoadingScreen({
  message = 'Cargando portal…',
  hint = 'Si esta pantalla no desaparece, recarga la página.',
  className,
}: Props) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center px-6 py-12 text-center',
        'min-h-[calc(100svh-3.5rem)]',
        className
      )}
    >
      <div className="relative flex flex-col items-center">
        <div className="synq-loading-perspective relative flex size-32 items-center justify-center md:size-36">
          <div
            className="pointer-events-none absolute inset-2 rounded-full bg-synq-cyan/10 blur-2xl synq-loading-glow"
            aria-hidden
          />
          <div className="synq-loading-spin-y relative z-10">
            <SynqIcon size={96} className="drop-shadow-[0_0_28px_rgba(0,229,255,0.45)]" />
          </div>
        </div>

        <SynqWordmark size="lg" className="mt-5" />

        <p className="mt-6 text-base font-semibold text-white">{message}</p>
        <p className="mt-2 max-w-xs text-sm leading-relaxed text-synq-muted">{hint}</p>

        <div className="mt-5 flex items-center gap-1.5" aria-hidden>
          <span className="synq-loading-dot size-1.5 rounded-full bg-synq-cyan" />
          <span className="synq-loading-dot size-1.5 rounded-full bg-synq-cyan [animation-delay:160ms]" />
          <span className="synq-loading-dot size-1.5 rounded-full bg-synq-cyan [animation-delay:320ms]" />
        </div>
      </div>
    </div>
  );
}
