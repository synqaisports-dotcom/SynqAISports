import { PageContainer } from '@/components/portal/PageContainer';
import { PlanogramTree } from '@/components/portal/PlanogramTree';
import { PortalFeatureSpecs } from '@/components/portal/PortalFeatureSpecs';

export default function PortalMetodologiaPlanogramaPage() {
  return (
    <PageContainer
      pageTitle="Planograma"
      pageDescription="Macrociclos, mesociclos, microciclos y sesiones — cada nivel expandible con 2 o 3 entrenos/semana."
    >
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
