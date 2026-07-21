import Link from 'next/link';
import {
  ArrowRight,
  BookOpen,
  CalendarClock,
  GitBranch,
  Layers,
  LayoutGrid,
} from 'lucide-react';
import type { MethodologyLandingStats } from '@/lib/methodology-landing-stats';
import { cn } from '@/lib/utils';

type Props = {
  stats: MethodologyLandingStats;
  className?: string;
};

const cycleCards = [
  {
    key: 'totalMacrocycles',
    label: 'Total macrociclos',
    icon: GitBranch,
    href: '/portal/metodologia/ciclos',
    format: (stats: MethodologyLandingStats) => String(stats.totalMacrocycles),
  },
  {
    key: 'totalMesocycles',
    label: 'Total mesociclos',
    icon: Layers,
    href: '/portal/metodologia/ciclos',
    format: (stats: MethodologyLandingStats) => String(stats.totalMesocycles),
  },
  {
    key: 'totalMicrocycles',
    label: 'Total microciclos',
    icon: LayoutGrid,
    href: '/portal/metodologia/ciclos',
    format: (stats: MethodologyLandingStats) => String(stats.totalMicrocycles),
  },
  {
    key: 'totalSessions',
    label: 'Total sesiones',
    icon: CalendarClock,
    href: '/portal/metodologia/ciclos',
    format: (stats: MethodologyLandingStats) => String(stats.totalSessions),
  },
] as const;

const cardSurfaceClass =
  'portal-section-surface rounded-xl px-4 py-3.5 transition-colors hover:border-primary/40';

const linkedCardClass =
  'group block cursor-pointer hover:bg-primary/[0.04] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50';

function StatCard({
  label,
  value,
  icon: Icon,
  href,
}: {
  label: string;
  value: string;
  icon: typeof GitBranch;
  href?: string;
}) {
  const content = (
    <div className="flex items-start justify-between gap-3">
      <div className="min-w-0">
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
          {label}
        </p>
        <p className="mt-1.5 text-2xl font-semibold tabular-nums text-primary">{value}</p>
      </div>
      <div className="flex shrink-0 items-center gap-1.5">
        {href ? (
          <ArrowRight
            className="size-3.5 text-primary/50 transition-transform group-hover:translate-x-0.5 group-hover:text-primary"
            strokeWidth={2}
            aria-hidden
          />
        ) : null}
        <Icon className="size-5 text-primary/80" strokeWidth={1.75} aria-hidden />
      </div>
    </div>
  );

  if (href) {
    return (
      <Link
        href={href}
        className={cn(cardSurfaceClass, linkedCardClass)}
        aria-label={`${label}: ${value}. Ir a la sección`}
      >
        {content}
      </Link>
    );
  }

  return <div className={cardSurfaceClass}>{content}</div>;
}

export function MethodologyStatsCards({ stats, className }: Props) {
  return (
    <div className={cn('space-y-3', className)}>
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        {cycleCards.map(({ key, label, icon, href, format }) => (
          <StatCard
            key={key}
            label={label}
            value={format(stats)}
            icon={icon}
            href={href}
          />
        ))}
      </div>

      <StatCard
        label="Total ejercicios biblioteca"
        value={String(stats.totalExercises)}
        icon={BookOpen}
        href="/portal/metodologia/ejercicios"
      />
    </div>
  );
}
