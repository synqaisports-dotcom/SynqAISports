'use client';

import { useEffect, useState } from 'react';
import {
  MicrocycleSessionWorkspace,
  type MicrocycleSessionPayload,
} from '@/components/methodology/MicrocycleSessionWorkspace';
import type { ExerciseLibraryItem } from '@/components/methodology/ExerciseLibraryPanel';
import { loadOrHydrateDemoMicrocycle } from '@/lib/demo-microcycle-hydrate';
import { resolveMicrocycleSessions } from '@/lib/microcycle-sessions';
import Link from 'next/link';

type Props = {
  microcycleId: string;
  sessionIndex: number;
  exercises: ExerciseLibraryItem[];
};

export function DemoMicrocycleSessionPage({ microcycleId, sessionIndex, exercises }: Props) {
  const [micro, setMicro] = useState(() => loadOrHydrateDemoMicrocycle(microcycleId));

  useEffect(() => {
    setMicro(loadOrHydrateDemoMicrocycle(microcycleId));
  }, [microcycleId]);

  if (!micro) {
    return (
      <p className="text-sm text-muted-foreground">
        Microciclo demo no encontrado.{' '}
        <Link href="/portal/metodologia/ciclos" className="text-primary underline">
          Crear desde Ciclos
        </Link>
      </p>
    );
  }

  const sessionsCount = resolveMicrocycleSessions(micro);
  if (sessionIndex > sessionsCount) {
    return <p className="text-sm text-destructive">Sesión no válida.</p>;
  }

  const payload: MicrocycleSessionPayload = {
    id: micro.id,
    title: micro.title,
    week_label: micro.week_label,
    category_slug: micro.category_slug,
    plan_variant_id: micro.plan_variant_id,
    plan_mcc_id: micro.plan_mcc_id,
    sessions_per_micro: micro.sessions_per_micro,
    main_tasks_per_session: micro.main_tasks_per_session,
    is_template: micro.is_template,
    slots: micro.slots.map((slot) => ({ ...slot, synq_exercises: null })),
  };

  return (
    <MicrocycleSessionWorkspace
      microcycle={payload}
      sessionIndex={sessionIndex}
      exercises={exercises}
    />
  );
}
