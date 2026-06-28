import Link from 'next/link';
import { ArrowLeft, BarChart3, Plus } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const demoStaff = [
  {
    name: 'Carlos Méndez',
    role: 'Entrenador Sub-14 A',
    teams: ['Sub-14 A'],
    medical: { ok: true, until: '2026-08-15' },
  },
  {
    name: 'Laura Ruiz',
    role: '2ª entrenadora Sub-16',
    teams: ['Sub-16 B'],
    medical: { ok: false, until: null },
  },
  {
    name: 'Miguel Soto',
    role: 'Preparador físico',
    teams: ['Sub-16 A', 'Sub-18'],
    medical: { ok: true, until: '2026-11-01' },
  },
];

export default function PortalClubStaffLandingPage() {
  return (
    <PageContainer
      pageTitle="Cuerpo técnico"
      pageDescription="Portada del staff — listado y accesos a gestión."
      pageHeaderAction={
        <div className="flex flex-wrap gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/club">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/club/staff/categorias">
              <BarChart3 className="h-4 w-4" />
              Por categorías
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/portal/club/staff/nuevo">
              <Plus className="h-4 w-4" />
              Crear ficha
            </Link>
          </Button>
        </div>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {demoStaff.map((person) => (
          <Card key={person.name}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{person.name}</CardTitle>
                <Badge variant={person.medical.ok ? 'default' : 'destructive'}>
                  {person.medical.ok ? 'Médico OK' : 'Pendiente'}
                </Badge>
              </div>
              <CardDescription>{person.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3 text-sm">
              <p>
                <span className="text-muted-foreground">Equipos: </span>
                {person.teams.join(', ')}
              </p>
              <Button variant="outline" size="sm" className="w-full" disabled>
                Modificar ficha
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
