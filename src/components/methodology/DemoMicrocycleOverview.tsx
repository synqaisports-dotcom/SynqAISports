'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  loadOrHydrateDemoMicrocycle,
  syncDemoMicrocyclesFromDocument,
} from '@/lib/demo-microcycle-hydrate';
import {
  countFilledSlots,
  groupSlotsBySession,
  isDemoMicrocycleId,
  resolveMicrocycleSessions,
  sessionCompletionLabel,
} from '@/lib/microcycle-sessions';
import { sessionStructureSummary } from '@/lib/periodization';

type Props = {
  microcycleId: string;
};

export function DemoMicrocycleOverview({ microcycleId }: Props) {
  const [micro, setMicro] = useState(() => loadOrHydrateDemoMicrocycle(microcycleId));

  useEffect(() => {
    setMicro(loadOrHydrateDemoMicrocycle(microcycleId));
  }, [microcycleId]);

  if (!micro) {
    return (
      <div className="rounded-xl border border-dashed border-primary/25 p-8 text-center text-sm text-muted-foreground">
        Microciclo demo no encontrado. Créalo desde{' '}
        <Link href="/portal/metodologia/ciclos" className="text-primary underline">
          Ciclos
        </Link>{' '}
        (asignar plantilla al MCC).
      </div>
    );
  }

  const sessionsCount = resolveMicrocycleSessions(micro);
  const grouped = groupSlotsBySession(micro.slots);

  return (
    <div className="space-y-4">
      <div>
        <Link href="/portal/metodologia/ciclos" className="text-sm text-muted-foreground hover:text-foreground">
          ← Ciclos
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{micro.title}</h1>
        <p className="text-sm text-muted-foreground">{micro.week_label}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          <Badge variant="outline">Demo local</Badge>
          {micro.is_template ? <Badge>Plantilla</Badge> : null}
          {micro.category_slug ? <Badge variant="secondary">{micro.category_slug}</Badge> : null}
        </div>
      </div>

      <MethodologySubnav />

      <p className="text-sm text-muted-foreground">
        {sessionsCount} sesiones · {sessionStructureSummary(micro.main_tasks_per_session)}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: sessionsCount }, (_, index) => {
          const sessionIndex = index + 1;
          const slots = grouped.get(sessionIndex) ?? [];
          const filled = countFilledSlots(slots);
          return (
            <Card key={sessionIndex} className="border-primary/25">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sesión {sessionIndex}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {sessionCompletionLabel(filled, slots.length)}
                </p>
                <Link
                  href={`/portal/metodologia/microciclos/${micro.id}/sesiones/${sessionIndex}`}
                  className="inline-flex text-sm font-medium text-primary hover:underline"
                >
                  Abrir sesión →
                </Link>
              </CardContent>
            </Card>
          );
        })}
      </div>
    </div>
  );
}

export function isDemoId(id: string): boolean {
  return isDemoMicrocycleId(id);
}
