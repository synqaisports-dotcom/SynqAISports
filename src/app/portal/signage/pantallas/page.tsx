import { ensureSignageDefaults, loadSignageBundle } from '@/app/actions/signage';
import { DevicesPanel } from '@/components/portal/signage/DevicesPanel';
import { SignageHero } from '@/components/portal/signage/SignageHero';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function PortalSignageDevicesPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  await ensureSignageDefaults(ctx.club.id);
  const bundle = await loadSignageBundle(ctx.club.id);

  return (
    <div className="space-y-6">
      <SignageHero sponsors={bundle.sponsors} devices={bundle.devices} playlists={bundle.playlists} />
      <DevicesPanel devices={bundle.devices} playlists={bundle.playlists} />
    </div>
  );
}
