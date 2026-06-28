import Link from 'next/link';
import { ArrowLeft, Plus } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const facilities = [
  {
    name: 'Campo principal F-11',
    type: 'Césped natural',
    split: '4 mitades (F-11)',
    slots: 'L-V 17:00–22:00',
  },
  {
    name: 'Campo anexo F-7',
    type: 'Césped artificial',
    split: '2 mitades',
    slots: 'L-D 09:00–21:00',
  },
];

export default function PortalClubInstalacionesLandingPage() {
  return (
    <PageContainer>
      <Card className="mb-4">
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Instalaciones</CardTitle>
          <div className="flex shrink-0 gap-2">
            <Button variant="outline" size="sm" asChild>
              <Link href="/portal/club">
                <ArrowLeft className="h-4 w-4" />
                Volver
              </Link>
            </Button>
            <Button size="sm" disabled>
              <Plus className="h-4 w-4" />
              Crear
            </Button>
          </div>
        </CardHeader>
      </Card>
      <div className="grid gap-4 lg:grid-cols-2">
        {facilities.map((f) => (
          <Card key={f.name}>
            <CardHeader>
              <CardTitle className="text-base">{f.name}</CardTitle>
              <CardDescription>{f.type}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2">
              <Badge variant="secondary">Entrenamiento</Badge>
              <Badge variant="outline">{f.split}</Badge>
              <p className="w-full text-sm text-muted-foreground">{f.slots}</p>
              <Button variant="outline" size="sm" disabled>
                Modificar
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
