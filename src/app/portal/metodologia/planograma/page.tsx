import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { PlanogramTree } from '@/components/portal/PlanogramTree';
import { PortalFeatureSpecs } from '@/components/portal/PortalFeatureSpecs';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function PortalMetodologiaPlanogramaPage() {
  return (
    <PageContainer>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Planograma</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/metodologia">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>
      <PlanogramTree />
      <div className="mt-6">
        <PortalFeatureSpecs
          title="Integración metodología"
          description="Conectado con ejercicios y microciclos existentes."
          specs={[
            { title: 'Arrastrar sesiones', description: 'Mover sesiones entre microciclos.', status: 'next' },
            { title: '2 o 3 entrenos', description: 'Configuración por macrociclo/equipo.', status: 'mvp' },
            { title: 'Enlace ejercicios', description: 'Biblioteca UEFA en cada sesión.', status: 'done' },
          ]}
        />
      </div>
    </PageContainer>
  );
}
