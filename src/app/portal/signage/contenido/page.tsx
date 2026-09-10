import { ensureSignageDefaults, loadSignageBundle } from '@/app/actions/signage';
import { ContentPanel } from '@/components/portal/signage/ContentPanel';
import { SignageHero } from '@/components/portal/signage/SignageHero';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function PortalSignageContentPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  await ensureSignageDefaults(ctx.club.id);
  const bundle = await loadSignageBundle(ctx.club.id);

  return (
    <div className="space-y-6">
      <SignageHero sponsors={bundle.sponsors} devices={bundle.devices} playlists={bundle.playlists} />
      <ContentPanel assets={bundle.assets} sponsors={bundle.sponsors} exercises={bundle.exercises} />
    </div>
  );
}
