import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

const redesDemo = [
  { label: 'Web oficial', value: '—' },
  { label: 'Instagram', value: '—' },
  { label: 'YouTube', value: '—' },
  { label: 'Twitter / X', value: '—' },
];

export default function PortalClubRedesLandingPage() {
  return (
    <PageContainer>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Redes y ficha pública</CardTitle>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/club">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button size="sm" asChild>
              <Link href="/portal/club/redes/editar">
                <Pencil className="h-4 w-4" />
                Modificar
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          {redesDemo.map(({ label, value }) => (
            <div key={label} className="rounded-lg border bg-muted/20 px-4 py-3">
              <p className="text-xs text-muted-foreground">{label}</p>
              <p className="mt-1 font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
