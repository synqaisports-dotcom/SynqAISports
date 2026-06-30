import Link from 'next/link';
import { ArrowLeft, GitBranch } from 'lucide-react';
import { PeriodizationPlanogram } from '@/components/portal/PeriodizationPlanogram';
import { MethodologySubnav } from '@/components/methodology/MethodologySubnav';
import { PageContainer } from '@/components/portal/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardHeader, CardTitle } from '@/components/ui/card';

export default function PortalMetodologiaPlanogramaPage() {
  return (
    <PageContainer>
      <Card className="mb-4 border border-primary/25">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="flex items-center gap-2 text-base">
            <GitBranch className="size-4 text-primary" />
            Planograma
          </CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/metodologia">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
        </CardHeader>
      </Card>

      <MethodologySubnav />

      <PeriodizationPlanogram />
    </PageContainer>
  );
}
