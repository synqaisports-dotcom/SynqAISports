import { loadTournamentBundle } from '@/app/actions/tournaments';
import { TournamentDetailTabs } from '@/components/portal/torneos/TournamentDetailTabs';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import Link from 'next/link';
import { notFound, redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

type Props = { params: Promise<{ id: string }> };

export default async function TournamentDetailPage({ params }: Props) {
  const { id } = await params;
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
      <TournamentDetailTabs bundle={bundle} />
    </div>
  );
}
