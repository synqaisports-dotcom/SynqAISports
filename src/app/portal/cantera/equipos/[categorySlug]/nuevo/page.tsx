import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { getUsedTeamLetters } from '@/app/actions/cantera';
import { TeamCreateForm } from '@/components/portal/TeamCreateForm';
import { PageContainer } from '@/components/portal/PageContainer';
import { getCanteraCategory } from '@/lib/cantera-categories';
import { notFound, redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';
import { getStaffContext } from '@/lib/portal';
import { createClient } from '@/lib/supabase/server';

type Props = {
  params: Promise<{ categorySlug: string }>;
};

export default async function PortalCanteraEquipoNuevoPage({ params }: Props) {
  const { categorySlug } = await params;
  const category = getCanteraCategory(categorySlug);
  if (!category) notFound();

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const usedLetters = await getUsedTeamLetters(ctx.club.id, categorySlug);

  return (
    <PageContainer>
      <Card className="mb-6">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Añadir equipo — {category.name}</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/cantera/equipos">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>
      <TeamCreateForm category={category} usedLetters={usedLetters} />
    </PageContainer>
  );
}
