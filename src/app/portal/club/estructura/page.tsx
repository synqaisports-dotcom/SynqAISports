import Link from 'next/link';
import { ArrowLeft, Pencil, Plus } from 'lucide-react';
import { loadInstitutionalPeople } from '@/app/actions/club-people';
import {
  EstructuraHero,
  EstructuraHeroLinkAction,
  EstructuraPersonCard,
} from '@/components/portal/EstructuraHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Card } from '@/components/ui/card';

export default async function PortalClubEstructuraPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const people = await loadInstitutionalPeople(ctx.club.id);

  return (
    <PageContainer>
      <Card className="overflow-hidden p-0">
        <EstructuraHero
          people={people}
          actions={
            <>
              <EstructuraHeroLinkAction href="/portal/club" variant="outline">
                <ArrowLeft className="size-3.5" />
                Volver
              </EstructuraHeroLinkAction>
              <EstructuraHeroLinkAction href="/portal/club/estructura/nuevo">
                <Plus className="size-3.5" />
                Crear ficha
              </EstructuraHeroLinkAction>
            </>
          }
        />
      </Card>

      <div className="mt-6 grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {people.map((person) => (
          <div key={person.id} className="space-y-2">
            <EstructuraPersonCard person={person} />
            <Link
              href={`/portal/club/estructura/${person.id}/editar`}
              className="inline-flex h-8 items-center gap-1.5 rounded-md border border-primary/30 px-3 text-xs font-medium hover:bg-primary/5"
            >
              <Pencil className="size-3.5" />
              Modificar
            </Link>
          </div>
        ))}
        {people.length === 0 ? (
          <p className="text-sm text-muted-foreground md:col-span-2 xl:col-span-3">
            Aún no hay personas en la estructura no deportiva. Crea la primera ficha para asignarla
            después en el organigrama.
          </p>
        ) : null}
      </div>
    </PageContainer>
  );
}
