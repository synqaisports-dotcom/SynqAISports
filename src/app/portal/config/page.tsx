import { InviteCodePanel } from '@/components/portal/InviteCodePanel';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function PortalConfigPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-white">Configuración</h1>
      <p className="mt-2 text-synq-muted">
        Código de vinculación para apps de entrenadores, familias y signage.
      </p>
      <div className="mt-8 max-w-2xl">
        <InviteCodePanel
          clubId={ctx.club.id}
          clubName={ctx.club.name}
          inviteCode={ctx.club.invite_code}
        />
      </div>

      <div className="mt-10 rounded-2xl border border-white/5 bg-synq-slate/30 p-5 text-sm text-synq-muted">
        <p className="font-medium text-white">Cuota digital de referencia</p>
        <p className="mt-2">
          Familias: <strong className="text-white">{ctx.club.family_fee_annual_eur} €/año</strong>{' '}
          por jugador (el club decide el importe final).
        </p>
        <p className="mt-1">
          SynqAI: <strong className="text-white">{ctx.club.synq_rate_per_user_eur} €/usuario/mes</strong>
        </p>
      </div>
    </div>
  );
}
