import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { loadMethodologyObjectives } from '@/app/actions/methodology';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { ObjectivesHero } from '@/components/methodology/ObjectivesHero';
import { ObjectivesMasterDetail } from '@/components/methodology/ObjectivesMasterDetail';
import { PageContainer } from '@/components/portal/PageContainer';
import { isDemoActive } from '@/lib/demo';
import { canEditMethodologyObjectives } from '@/lib/methodology-objectives';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

type Props = {
  searchParams: Promise<{
    category?: string;
    edit?: string;
  }>;
};

export default async function ObjetivosPage({ searchParams }: Props) {
  const { category: initialCategorySlug, edit: initialEdit } = await searchParams;

  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const demo = await isDemoActive();
  const objectives = await loadMethodologyObjectives(ctx.club.id);
  const canEdit = canEditMethodologyObjectives(ctx.role);

  return (
    <PageContainer>
      <Card className="mb-4 border border-primary/25">
        <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-3 space-y-0">
          <CardTitle className="text-base">Objetivos formativos</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/metodologia">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <ObjectivesHero className="mb-4" />

      {demo ? (
        <p className="mb-4 rounded-lg border border-primary/20 bg-muted/10 p-4 text-sm text-muted-foreground">
          Referencia metodológica por categoría. Selecciona una categoría en la lista y usa el lápiz
          para adaptar los textos si tienes permisos de edición.
        </p>
      ) : null}

      <MethodologySubnav />

      <ObjectivesMasterDetail
        objectives={objectives}
        canEdit={canEdit}
        initialCategorySlug={initialCategorySlug}
        initialEditOpen={initialEdit === '1'}
        demoMode={demo}
      />
    </PageContainer>
  );
}
