import { CreateTournamentForm } from '@/components/portal/torneos/CreateTournamentForm';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import Link from 'next/link';
import { redirect } from 'next/navigation';
import { ArrowLeft } from 'lucide-react';

export default async function CrearTorneoPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  return (
    <div className="space-y-4">
      <Link
        href="/portal/torneos"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-primary"
      >
        <ArrowLeft className="size-4" />
        Volver a torneos
      </Link>
      <CreateTournamentForm />
    </div>
  );
}
