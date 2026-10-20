import { ensureSignageDefaults, loadSignageBundle } from '@/app/actions/signage';
import { SignageHero } from '@/components/portal/signage/SignageHero';
import { SignageOperativaGuide } from '@/components/portal/signage/SignageOperativaGuide';
import { SignagePlaylistPlayer } from '@/components/portal/signage/SignagePlaylistPlayer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { resolveEffectiveSchedule } from '@/lib/signage';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';

export default async function PortalSignagePage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  await ensureSignageDefaults(ctx.club.id);
  const bundle = await loadSignageBundle(ctx.club.id);
  const defaultPlaylist = bundle.playlists.find((p) => p.is_default) ?? bundle.playlists[0] ?? null;
  const schedule = resolveEffectiveSchedule(null, bundle.schedules);

  return (
    <div className="space-y-6">
      <SignageHero
        sponsors={bundle.sponsors}
        devices={bundle.devices}
        playlists={bundle.playlists}
        actions={
          <Button asChild size="sm">
            <Link href="/play/pair" target="_blank">
              Abrir emparejamiento TV
            </Link>
          </Button>
        }
      />

      <div className="grid gap-6 lg:grid-cols-2">
        <SignageOperativaGuide />

        <div className="portal-section-surface rounded-xl p-4">
          <h2 className="mb-3 font-medium">Vista previa playlist principal</h2>
          <SignagePlaylistPlayer
            orientation="landscape"
            playlist={defaultPlaylist}
            schedule={schedule}
            sponsors={bundle.sponsors}
            assets={bundle.assets}
            exercises={bundle.exercises.map((e) => ({
              id: e.id,
              title: e.title,
              drawing_json: e.drawing_json,
            }))}
            clubName={ctx.club.name}
            clubLogoUrl={ctx.club.logo_url}
            preview
          />
        </div>
      </div>
    </div>
  );
}
