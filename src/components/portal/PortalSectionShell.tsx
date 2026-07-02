import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

type Props = {
  children: ReactNode;
  actions?: ReactNode;
  className?: string;
};

/** Cabecera compacta de sección del portal: fondo profesional + acciones arriba a la derecha. */
export function PortalSectionShell({ children, actions, className }: Props) {
  return (
    <div
      className={cn(
        'portal-section-surface rounded-xl px-4 py-3 md:px-5 md:py-3.5',
        className
      )}
    >
      <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0 flex-1">{children}</div>
        {actions ? (
          <div className="flex shrink-0 flex-wrap items-start justify-end gap-2">{actions}</div>
        ) : null}
      </div>
    </div>
  );
}

export function PortalSectionBadge({
  icon,
  children,
}: {
  icon: ReactNode;
  children: ReactNode;
}) {
  return (
    <div className="mb-2 inline-flex items-center gap-2 rounded-full border border-primary/30 bg-primary/10 px-3 py-1 text-xs font-medium text-primary">
      {icon}
      {children}
    </div>
  );
}
