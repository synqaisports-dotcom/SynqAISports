import { ensureSignageDefaults, loadSignageBundle } from '@/app/actions/signage';
import { ProgrammingHub } from '@/components/portal/signage/ProgrammingHub';
import { SignageHero } from '@/components/portal/signage/SignageHero';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { resolveEffectiveSchedule } from '@/lib/signage';
import { redirect } from 'next/navigation';

type Props = {
  searchParams: Promise<{ playlist?: string }>;
};

export default async function PortalSignageProgrammingPage({ searchParams }: Props) {
  const { playlist: playlistParam } = await searchParams;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  await ensureSignageDefaults(ctx.club.id);
  const bundle = await loadSignageBundle(ctx.club.id);
  if (!bundle.playlists.length) redirect('/portal/signage');

  const selectedId =
    bundle.playlists.find((p) => p.id === playlistParam)?.id ??
    bundle.playlists.find((p) => p.is_default)?.id ??
    bundle.playlists[0].id;

  const schedule = resolveEffectiveSchedule(null, bundle.schedules);

  return (
    <div className="space-y-6">
      <SignageHero sponsors={bundle.sponsors} devices={bundle.devices} playlists={bundle.playlists} />
      <ProgrammingHub
        playlists={bundle.playlists}
        selectedPlaylistId={selectedId}
        schedule={schedule}
        sponsors={bundle.sponsors}
        assets={bundle.assets}
        exercises={bundle.exercises}
        clubName={ctx.club.name}
        clubLogoUrl={ctx.club.logo_url}
        exerciseDrawings={bundle.exercises.map((e) => ({
          id: e.id,
          title: e.title,
          drawing_json: e.drawing_json,
        }))}
      />
    </div>
  );
}
