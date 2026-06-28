import { PageContainer } from '@/components/portal/PageContainer';
import { OrganigramaTree } from '@/components/portal/OrganigramaTree';
import { PortalFeatureSpecs } from '@/components/portal/PortalFeatureSpecs';

export default function PortalClubOrganigramaPage() {
  return (
    <PageContainer
      pageTitle="Organigrama del club"
      pageDescription="Estructura jerárquica con dependencias: dirección, metodología, cantera y coordinadores."
    >
      <OrganigramaTree />
      <div className="mt-6">
        <PortalFeatureSpecs
          title="Funcionalidades previstas"
          description="Cada nodo será editable y vinculado al staff."
          specs={[
            { title: 'Dependencias', description: 'Quién reporta a quién en el organigrama.', status: 'mvp' },
            { title: 'Arrastrar y soltar', description: 'Reorganizar cargos visualmente.', status: 'next' },
            { title: 'Enlace con staff', description: 'Cada puesto enlaza a la ficha del técnico.', status: 'mvp' },
          ]}
        />
      </div>
    </PageContainer>
  );
}
