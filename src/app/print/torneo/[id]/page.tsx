import { loadTournamentBundle } from '@/app/actions/tournaments';
import { TournamentInvitationDossierPrint } from '@/components/print/TournamentInvitationDossierPrint';
import { buildTournamentDossier } from '@/lib/tournament-dossier';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function TournamentDossierPrintPage({ params }: Props) {
  const { id } = await params;

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect(`/login?next=/print/torneo/${id}`);

  const bundle = await loadTournamentBundle(id);
  if (!bundle) notFound();

  const dossier = buildTournamentDossier(bundle);

  return (
    <div>
      <div className="no-print mx-auto mb-4 max-w-[210mm] px-4">
        <Link
          href={`/portal/torneos/${id}?tab=dossier`}
          className="inline-flex items-center gap-1.5 text-sm text-slate-600 hover:text-cyan-700"
        >
          <ArrowLeft className="size-4" />
          Volver al dossier
        </Link>
      </div>
      <TournamentInvitationDossierPrint dossier={dossier} />
    </div>
  );
}
