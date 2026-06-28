import { ClubProfileForm } from '@/components/portal/ClubProfileForm';
import { PageContainer } from '@/components/portal/PageContainer';
import { PortalFeatureSpecs } from '@/components/portal/PortalFeatureSpecs';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

export default async function PortalClubDatosPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  return (
    <PageContainer
      pageTitle="Datos del club"
      pageDescription="Ficha principal del club: identidad, contacto y tarifas del ecosistema SynqAI."
    >
      <ClubProfileForm club={ctx.club} />
      <div className="mt-6">
        <PortalFeatureSpecs
          title="Próximamente en esta ficha"
          description="Campos adicionales según tu especificación."
          specs={[
            {
              title: 'Redes sociales',
              description: 'Instagram, web, YouTube y enlaces públicos del club.',
              status: 'next',
            },
            {
              title: 'Logo y portada',
              description: 'Imágenes para portal, app familias y comunicación.',
              status: 'next',
            },
          ]}
        />
      </div>
    </PageContainer>
  );
}
