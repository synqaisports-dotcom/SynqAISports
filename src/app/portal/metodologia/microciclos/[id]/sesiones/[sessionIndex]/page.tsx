import { DemoMicrocycleSessionPage } from '@/components/methodology/DemoMicrocycleSessionPage';
import {
  MicrocycleSessionWorkspace,
  type MicrocycleSessionPayload,
} from '@/components/methodology/MicrocycleSessionWorkspace';
import { PageContainer } from '@/components/portal/PageContainer';
import { getStaffContext } from '@/lib/portal';
import {
  isDemoMicrocycleId,
  loadExerciseLibrary,
  loadMicrocycleBundle,
  parseSessionIndex,
} from '@/lib/microcycle-page-data';
import { resolveMicrocycleSessions } from '@/lib/microcycle-sessions';
import { createClient } from '@/lib/supabase/server';
import { notFound, redirect } from 'next/navigation';

type Props = { params: Promise<{ id: string; sessionIndex: string }> };

export default async function MicrocicloSessionPage({ params }: Props) {
  const { id, sessionIndex: sessionIndexRaw } = await params;
  const sessionIndex = parseSessionIndex(sessionIndexRaw);
  if (!sessionIndex) notFound();

  if (isDemoMicrocycleId(id)) {
    const supabase = await createClient();
    const ctx = await getStaffContext(supabase);
    if (!ctx) redirect('/login');
    const exercises = await loadExerciseLibrary(supabase, ctx.club.id);

    return (
      <PageContainer>
        <DemoMicrocycleSessionPage
          microcycleId={id}
          sessionIndex={sessionIndex}
          exercises={exercises}
        />
      </PageContainer>
    );
  }

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const [bundle, exercises] = await Promise.all([
    loadMicrocycleBundle(supabase, ctx.club.id, id),
    loadExerciseLibrary(supabase, ctx.club.id),
  ]);

  if (!bundle) notFound();

  const sessionsCount = resolveMicrocycleSessions(bundle.micro);
  if (sessionIndex > sessionsCount) notFound();

  const payload: MicrocycleSessionPayload = {
    id: bundle.micro.id,
    title: bundle.micro.title,
    week_label: bundle.micro.week_label,
    category_slug: bundle.micro.category_slug,
    plan_variant_id: bundle.micro.plan_variant_id,
    plan_mcc_id: bundle.micro.plan_mcc_id,
    sessions_per_micro: bundle.micro.sessions_per_micro,
    main_tasks_per_session: bundle.micro.main_tasks_per_session,
    is_template: Boolean(bundle.micro.is_template),
    slots: bundle.slots,
  };

  return (
    <PageContainer>
      <MicrocycleSessionWorkspace
        microcycle={payload}
        sessionIndex={sessionIndex}
        exercises={exercises}
      />
    </PageContainer>
  );
}
