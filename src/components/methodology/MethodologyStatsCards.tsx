import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  ClipboardList,
  GitBranch,
  Target,
} from 'lucide-react';
import type { MethodologyLandingStats } from '@/lib/methodology-landing-stats';
import { cn } from '@/lib/utils';

type Props = {
  stats: MethodologyLandingStats;
  className?: string;
};

const cards = [
  {
    key: 'totalTeams',
    label: 'Equipos activos',
    icon: GitBranch,
    href: '/portal/metodologia/ciclos',
    format: (stats: MethodologyLandingStats) => String(stats.totalTeams),
  },
  {
    key: 'totalExercises',
    label: 'Ejercicios en biblioteca',
    icon: BookOpen,
    href: '/portal/metodologia/ejercicios',
    format: (stats: MethodologyLandingStats) => String(stats.totalExercises),
  },
  {
    key: 'totalObjectives',
    label: 'Objetivos de metodología',
    icon: Target,
    href: '/portal/metodologia/objetivos',
    format: (stats: MethodologyLandingStats) => String(stats.totalObjectives),
  },
  {
    key: 'pendingRequests',
    label: 'Solicitudes pendientes',
    icon: ClipboardList,
    href: '/portal/metodologia/solicitudes',
    format: (stats: MethodologyLandingStats) => String(stats.pendingRequests),
  },
] as const;

const cardSurfaceClass =
  'portal-section-surface rounded-xl px-4 py-3.5 transition-colors hover:border-primary/40';

const linkedCardClass =
  'group block cursor-pointer hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

export function MethodologyStatsCards({ stats, className }: Props) {
  return (
    <div className={cn('grid gap-3 sm:grid-cols-2 xl:grid-cols-4', className)}>
      {cards.map(({ key, label, icon: Icon, href, format }) => {
        const content = (
          <div className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                {label}
              </p>
              <p className="mt-1.5 text-2xl font-semibold tabular-nums text-primary">
                {format(stats)}
              </p>
            </div>
            <div className="flex shrink-0 items-center gap-1.5">
              <ArrowRight
                className="size-3.5 text-primary/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
                strokeWidth={2}
                aria-hidden
              />
              <Icon className="size-5 text-primary/80" strokeWidth={1.75} aria-hidden />
            </div>
          </div>
        );

        return (
          <Link
            key={key}
            href={href}
            className={cn(cardSurfaceClass, linkedCardClass)}
            aria-label={`${label}: ${format(stats)}. Ir a la sección`}
          >
            {content}
          </Link>
        );
      })}
    </div>
  );
}
