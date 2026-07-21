import Link from 'next/link';
import { History, UserPlus, Users } from 'lucide-react';
import type { CanteraMovement } from '@/lib/cantera-movements';
import { formatCanteraMovementWhen } from '@/lib/cantera-movements';
import { cn } from '@/lib/utils';

type Props = {
  movements: CanteraMovement[];
  className?: string;
  variant?: 'section' | 'panel';
  limit?: number;
};

const KIND_ICON = {
  player_joined: UserPlus,
  team_created: Users,
} as const;

export function CanteraRecentMovements({
  movements,
  className,
  variant = 'section',
  limit,
}: Props) {
  const items = limit != null ? movements.slice(0, limit) : movements;
  const isPanel = variant === 'panel';

  return (
    <section
      className={cn(
        'portal-section-surface flex h-full min-h-0 flex-col rounded-xl px-4 py-4 md:px-5 md:py-4',
        !isPanel && 'mt-6',
        className
      )}
    >
      <div className="mb-3 flex shrink-0 items-center gap-2">
        <History className="size-4 text-primary" />
        <h2 className="text-[10px] font-semibold uppercase tracking-wider text-primary">
          Últimos movimientos
        </h2>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Aún no hay altas de jugadores ni equipos registrados en la cantera.
        </p>
      ) : (
        <ul
          className={cn(
            'min-h-0 flex-1',
            isPanel ? 'flex flex-col justify-evenly gap-1' : 'space-y-1.5'
          )}
        >
          {items.map((movement) => {
            const Icon = KIND_ICON[movement.kind];
            const row = (
              <>
                <span className="flex size-7 shrink-0 items-center justify-center rounded-lg border border-primary/25 bg-primary/10 text-primary">
                  <Icon className="size-3.5" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-foreground">{movement.title}</span>
                  <span className="block truncate text-xs text-muted-foreground">{movement.detail}</span>
                </span>
                <time
                  dateTime={movement.occurredAt}
                  className="shrink-0 text-[10px] tabular-nums text-muted-foreground"
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
                    className="flex items-center gap-2.5 rounded-lg border border-transparent px-1.5 py-2 transition-colors hover:border-primary/20 hover:bg-primary/5"
                  >
                    {row}
                  </Link>
                ) : (
                  <div className="flex items-center gap-2.5 px-1.5 py-2">{row}</div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </section>
  );
}
