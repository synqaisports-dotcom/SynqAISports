import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { OrganigramaTree } from '@/components/portal/OrganigramaTree';
import { Button } from '@/components/ui/button';

export default function PortalClubOrganigramaPage() {
  return (
    <PageContainer
      pageTitle="Organigrama"
      pageDescription="Estructura jerárquica del club y dependencias entre cargos."
      pageHeaderAction={
        <Button variant="outline" size="sm" asChild>
          <Link href="/portal/club">
            <ArrowLeft className="h-4 w-4" />
            Volver
          </Link>
        </Button>
      }
    >
      <OrganigramaTree />
    </PageContainer>
  );
}
