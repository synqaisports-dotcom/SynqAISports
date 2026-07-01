'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import {
  ExerciseLibraryPanel,
  type ExerciseLibraryItem,
} from '@/components/methodology/ExerciseLibraryPanel';
import {
  SessionStructurePanel,
  resolveMainTasksForMicro,
} from '@/components/methodology/SessionStructurePanel';
import { Badge } from '@/components/ui/badge';
import { loadOrHydrateDemoMicrocycle } from '@/lib/demo-microcycle-hydrate';
import {
  groupSlotsBySession,
  isDemoMicrocycleId,
  resolveMicrocycleSessions,
} from '@/lib/microcycle-sessions';
import type { SlotType } from '@/lib/methodology';

export type MicrocycleSessionPayload = {
  id: string;
  title: string;
  week_label: string;
  category_slug: string | null;
  plan_variant_id: string | null;
  sessions_per_micro: number | null;
  main_tasks_per_session: number | null;
  is_template: boolean;
  slots: Array<{
    id: string;
    session_index: number;
    slot_type: string;
    order_index: number;
    title: string;
    notes: string;
    session_date: string | null;
    exercise_id: string | null;
    sheet_json?: unknown;
    synq_exercises?: { id: string; title: string } | { id: string; title: string }[] | null;
  }>;
};

type Props = {
  microcycle: MicrocycleSessionPayload;
  sessionIndex: number;
  exercises: ExerciseLibraryItem[];
};

export function MicrocycleSessionWorkspace({ microcycle, sessionIndex, exercises }: Props) {
  const [activeSlotId, setActiveSlotId] = useState<string | null>(null);
  const [refreshKey, setRefreshKey] = useState(0);
  const [demoMicro, setDemoMicro] = useState(microcycle);

  const reloadDemo = useCallback(() => {
    if (!isDemoMicrocycleId(microcycle.id)) return;
    const loaded = loadOrHydrateDemoMicrocycle(microcycle.id);
    if (loaded) {
      setDemoMicro({
        ...microcycle,
        slots: loaded.slots.map((slot) => ({
          ...slot,
          synq_exercises: null,
        })),
      });
    }
  }, [microcycle]);

  useEffect(() => {
    reloadDemo();
  }, [refreshKey, reloadDemo]);

  const data = isDemoMicrocycleId(microcycle.id) ? demoMicro : microcycle;
  const sessionsCount = resolveMicrocycleSessions(data);
  const mainTasks = resolveMainTasksForMicro(data);
  const slotsBySession = useMemo(
    () =>
      groupSlotsBySession(
        data.slots.map((slot) => ({
          ...slot,
          session_index: slot.session_index || 1,
        }))
      ),
    [data.slots]
  );

  const sessionSlots = slotsBySession.get(sessionIndex) ?? [];
  const sessionSlotViews = sessionSlots.map((slot) => {
    const linked = Array.isArray(slot.synq_exercises)
      ? slot.synq_exercises[0]
      : slot.synq_exercises;
    return {
      ...slot,
      session_date: slot.session_date ?? null,
      slot_type: slot.slot_type as SlotType,
      linkedTitle: linked?.title ?? null,
    };
  });

  const activeSlot = sessionSlotViews.find((slot) => slot.id === activeSlotId) ?? null;

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3">
        <Link
          href={`/portal/metodologia/microciclos/${data.id}`}
          className="inline-flex items-center gap-1 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="size-4" />
          {data.title}
        </Link>
        {data.is_template ? <Badge variant="outline">Plantilla</Badge> : null}
        <span className="text-sm text-muted-foreground">{data.week_label}</span>
      </div>

      <MethodologySubnav />

      <div className="flex flex-wrap gap-2">
        {Array.from({ length: sessionsCount }, (_, index) => {
          const n = index + 1;
          const active = n === sessionIndex;
          return (
            <Link
              key={n}
              href={`/portal/metodologia/microciclos/${data.id}/sesiones/${n}`}
              className={`rounded-lg border px-3 py-1.5 text-sm ${
                active
                  ? 'border-primary bg-primary/15 font-semibold text-primary'
                  : 'border-primary/20 text-muted-foreground hover:bg-primary/5'
              }`}
            >
              Sesión {n}
            </Link>
          );
        })}
      </div>

      <div className="grid min-h-[32rem] gap-4 lg:grid-cols-2">
        <SessionStructurePanel
          microcycleId={data.id}
          sessionIndex={sessionIndex}
          slots={sessionSlotViews}
          mainTasksPerSession={mainTasks}
          activeSlotId={activeSlotId}
          onSelectSlot={setActiveSlotId}
        />
        <ExerciseLibraryPanel
          exercises={exercises}
          categorySlug={data.category_slug}
          activeSlotId={activeSlotId}
          activeSlotType={activeSlot?.slot_type ?? null}
          microcycleId={data.id}
          sessionIndex={sessionIndex}
          onAssigned={() => {
            setRefreshKey((value) => value + 1);
            if (isDemoMicrocycleId(data.id)) reloadDemo();
          }}
        />
      </div>
    </div>
  );
}
