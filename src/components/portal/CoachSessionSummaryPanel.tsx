'use client';

import type { LucideIcon } from 'lucide-react';
import { Clock, Percent, Timer, UserCheck, UserX, Users } from 'lucide-react';
import type { CoachSessionStats, CoachTeamContext } from '@/lib/coach-team-context';
import { cn } from '@/lib/utils';

type Props = {
  teamContext: CoachTeamContext;
  stats: CoachSessionStats;
};

const sectionTitleClass =
  'text-[10px] font-semibold uppercase tracking-wider text-primary';

function StatCard({
  label,
  value,
  icon: Icon,
  tone = 'default',
}: {
  label: string;
  value: string | number;
  icon: LucideIcon;
  tone?: 'default' | 'muted' | 'danger';
}) {
  return (
    <div className="portal-section-surface flex min-h-[5.5rem] flex-col justify-between rounded-xl p-3">
      <div className="flex items-start justify-between gap-2">
        <p className={sectionTitleClass}>{label}</p>
        <Icon
          className={cn(
            'size-4 shrink-0',
            tone === 'danger' ? 'text-red-400/80' : 'text-primary/70'
          )}
        />
      </div>
      <p
        className={cn(
          'text-2xl font-semibold tracking-tight',
          tone === 'muted' ? 'text-muted-foreground' : 'text-foreground'
        )}
      >
        {value}
      </p>
    </div>
  );
}

export function CoachSessionSummaryPanel({ teamContext, stats }: Props) {
  return (
    <div className="grid gap-3 border-t border-primary/15 pt-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)] lg:items-stretch">
      <div className="portal-section-surface space-y-4 rounded-xl p-4">
        <div>
          <p className={sectionTitleClass}>Datos de la instalación</p>
          <p className="mt-2 text-sm font-semibold text-foreground">
            {teamContext.facilityName ?? 'Sin instalación asignada'}
          </p>
          {teamContext.facilityAddress ? (
            <p className="mt-1 text-xs text-muted-foreground">{teamContext.facilityAddress}</p>
          ) : null}
          {teamContext.trainingDivisionLabel ? (
            <p className="mt-2 text-xs text-muted-foreground">{teamContext.trainingDivisionLabel}</p>
          ) : null}
        </div>

        <div className="border-t border-primary/10 pt-4">
          <p className={sectionTitleClass}>Horario de entrenamiento</p>
          <p className="mt-2 text-sm font-medium text-foreground">{teamContext.trainingDaysLabel}</p>
          <p className="mt-1 text-sm text-primary">{teamContext.trainingTimeLabel}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 sm:grid-cols-3">
        <StatCard label="Jugadores" value={stats.players} icon={Users} />
        <StatCard label="Asistentes" value={stats.attendees} icon={UserCheck} />
        <StatCard label="Ausentes" value={stats.absentees} icon={UserX} tone="danger" />
        <StatCard label="Tiempo de la sesión" value={stats.sessionDurationLabel} icon={Clock} />
        <StatCard
          label="Tiempo medio ejercicios"
          value={stats.avgExerciseDurationLabel}
          icon={Timer}
        />
        <StatCard label="Ausencias" value={stats.absenceRateLabel} icon={Percent} tone="muted" />
      </div>
    </div>
  );
}
