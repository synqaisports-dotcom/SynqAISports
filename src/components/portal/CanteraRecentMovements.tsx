import Link from 'next/link';
import { History, UserPlus, Users } from 'lucide-react';
import type { CanteraMovement } from '@/lib/cantera-movements';
import { formatCanteraMovementWhen } from '@/lib/cantera-movements';
import { cn } from '@/lib/utils';

type Props = {
  movements: CanteraMovement[];
  className?: string;
};

const KIND_ICON = {
  player_joined: UserPlus,
  team_created: Users,
} as const;

export function CanteraRecentMovements({ movements, className }: Props) {
  return (
    <section className={cn('portal-section-surface mt-6 rounded-xl px-4 py-4 md:px-5 md:py-4', className)}>
      <div className="mb-4 flex items-center gap-2">
        <History className="size-4 text-primary" />
        <h2 className="text-sm font-semibold tracking-tight">Últimos movimientos</h2>
      </div>

      {movements.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay altas de jugadores ni equipos registrados en la cantera.
        </p>
      ) : (
        <ul className="space-y-2">
          {movements.map((movement) => {
            const Icon = KIND_ICON[movement.kind];
            const row = (
              <>
                <span className="flex size-8 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="size-4" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{movement.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{movement.detail}</span>
                </span>
                <time
                  dateTime={movement.occurredAt}
                  className="shrink-0 text-[11px] tabular-nums text-muted-foreground"
                >
                  {formatCanteraMovementWhen(movement.occurredAt)}
                </time>
              </>
            );

            return (
              <li key={movement.id}>
                {movement.href ? (
                  <Link
                    href={movement.href}
                    className="flex items-center gap-3 rounded-lg border border-transparent px-2 py-2 transition-colors hover:border-primary/20 hover:bg-primary/5"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-center gap-3 px-2 py-2">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
