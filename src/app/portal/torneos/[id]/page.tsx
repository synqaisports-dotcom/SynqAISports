import { loadTournamentBundle } from '@/app/actions/tournaments';
import {
  parseTournamentTab,
  TournamentDetailView,
} from '@/components/portal/torneos/TournamentDetailView';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type Props = {
  params: Promise<{ id: string }>;
  searchParams: Promise<{ tab?: string }>;
};

export default async function TournamentDetailPage({ params, searchParams }: Props) {
  const { id } = await params;
  const { tab: tabParam } = await searchParams;
  const tab = parseTournamentTab(tabParam);

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const bundle = await loadTournamentBundle(id);
  if (!bundle) notFound();

  return (
    <div className="space-y-4">
      <Link
        href="/portal/torneos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Volver a torneos
      </Link>
      <TournamentDetailView bundle={bundle} tournamentId={id} tab={tab} />
    </div>
  );
}
