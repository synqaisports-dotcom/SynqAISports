import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { OrganigramaTree } from '@/components/portal/OrganigramaTree';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function PortalClubOrganigramaPage() {
  return (
    <PageContainer>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0 pb-4">
          <CardTitle className="text-base">Organigrama</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/club">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>
      <OrganigramaTree />
    </PageContainer>
  );
}
