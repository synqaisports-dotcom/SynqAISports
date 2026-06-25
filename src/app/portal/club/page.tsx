import { ClubProfileForm } from '@/components/portal/ClubProfileForm';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function PortalClubPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-white">Datos del club</h1>
      <p className="mt-2 text-synq-muted">
        Perfil visible para staff y base de la configuración del ecosistema.
      </p>
      <div className="mt-8">
        <ClubProfileForm club={ctx.club} />
      </div>
    </div>
  );
}
