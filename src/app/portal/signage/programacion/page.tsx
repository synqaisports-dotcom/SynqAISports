import { ensureSignageDefaults, loadSignageBundle } from '@/app/actions/signage';
import { ProgrammingPanel } from '@/components/portal/signage/ProgrammingPanel';
import { SignageHero } from '@/components/portal/signage/SignageHero';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { resolveEffectiveSchedule } from '@/lib/signage';
import { redirect } from 'next/navigation';

export default async function PortalSignageProgrammingPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  await ensureSignageDefaults(ctx.club.id);
  const bundle = await loadSignageBundle(ctx.club.id);
  const defaultPlaylist = bundle.playlists.find((p) => p.is_default) ?? bundle.playlists[0];
  if (!defaultPlaylist) redirect('/portal/signage');

  const schedule = resolveEffectiveSchedule(null, bundle.schedules);

  return (
    <div className="space-y-6">
      <SignageHero sponsors={bundle.sponsors} devices={bundle.devices} playlists={bundle.playlists} />
      <ProgrammingPanel
        playlist={defaultPlaylist}
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
