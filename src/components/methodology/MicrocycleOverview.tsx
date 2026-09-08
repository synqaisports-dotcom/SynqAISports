import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import {
  countFilledSlots,
  groupSlotsBySession,
  resolveMicrocycleSessions,
  sessionCompletionLabel,
} from '@/lib/microcycle-sessions';
import { sessionStructureSummary } from '@/lib/periodization';

type SlotRow = {
  id: string;
  session_index: number;
  title: string;
  exercise_id: string | null;
};

type Props = {
  micro: {
    id: string;
    title: string;
    week_label: string;
    category_slug: string | null;
    sessions_per_micro: number | null;
    main_tasks_per_session: number | null;
    plan_variant_id: string | null;
    is_template: boolean | null;
  };
  slots: SlotRow[];
  backHref?: string;
};

export function MicrocycleOverview({ micro, slots, backHref = '/portal/metodologia/ciclos' }: Props) {
  const sessionsCount = resolveMicrocycleSessions(micro);
  const mainTasks = micro.main_tasks_per_session === 2 ? 2 : 3;
  const grouped = groupSlotsBySession(
    slots.map((slot) => ({ ...slot, session_index: slot.session_index || 1, order_index: 0 }))
  );

  return (
    <div className="space-y-4">
      <div>
        <Link href={backHref} className="text-sm text-muted-foreground hover:text-foreground">
          ← Volver
        </Link>
        <h1 className="mt-2 text-2xl font-semibold">{micro.title}</h1>
        <p className="text-sm text-muted-foreground">{micro.week_label}</p>
        <div className="mt-2 flex flex-wrap gap-2">
          {micro.is_template ? <Badge>Plantilla</Badge> : null}
          {micro.category_slug ? <Badge variant="secondary">{micro.category_slug}</Badge> : null}
        </div>
      </div>

      <p className="text-sm text-muted-foreground">
        {sessionsCount} sesiones · {sessionStructureSummary(mainTasks)}
      </p>

      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: sessionsCount }, (_, index) => {
          const sessionIndex = index + 1;
          const sessionSlots = grouped.get(sessionIndex) ?? [];
          const filled = countFilledSlots(sessionSlots);
          return (
            <Card key={sessionIndex} className="border-primary/25">
              <CardHeader className="pb-2">
                <CardTitle className="text-base">Sesión {sessionIndex}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  {sessionCompletionLabel(filled, sessionSlots.length)}
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
