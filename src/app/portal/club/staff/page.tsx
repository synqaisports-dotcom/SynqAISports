import Link from 'next/link';
import { Plus } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { PortalFeatureSpecs } from '@/components/portal/PortalFeatureSpecs';
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

export default function PortalClubStaffPage() {
  return (
    <PageContainer
      pageTitle="Cuerpo técnico"
      pageDescription="Listado de staff con equipos asignados, categoría y reconocimiento médico."
      pageHeaderAction={
        <Button asChild size="sm">
          <Link href="/portal/club/staff/nuevo">
            <Plus className="h-4 w-4" />
            Nueva ficha
          </Link>
        </Button>
      }
    >
      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {demoStaff.map((person) => (
          <Card key={person.name}>
            <CardHeader className="pb-2">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-base">{person.name}</CardTitle>
                <Badge variant={person.medical.ok ? 'default' : 'destructive'}>
                  {person.medical.ok ? 'Médico OK' : 'Médico pendiente'}
                </Badge>
              </div>
              <CardDescription>{person.role}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              <p>
                <span className="text-muted-foreground">Equipos: </span>
                {person.teams.join(', ')}
              </p>
              {person.medical.until && (
                <p className="text-xs text-muted-foreground">
                  Reconocimiento hasta {new Date(person.medical.until).toLocaleDateString('es-ES')}
                </p>
              )}
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <PortalFeatureSpecs
          title="Ficha de staff (especificación)"
          description="Cada técnico tendrá ficha completa editable."
          specs={[
            { title: 'Equipos asignados', description: 'Uno o varios equipos desde cantera.', status: 'mvp' },
            { title: 'Categoría / cargo', description: 'Entrenador, 2º, delegado, preparador físico…', status: 'mvp' },
            { title: 'Documentación', description: 'Subir títulos, contratos y certificados.', status: 'next' },
            {
              title: 'Reconocimiento médico',
              description: 'Estado sí/no con fecha inicio y fecha fin.',
              status: 'mvp',
            },
          ]}
        />
      </div>
    </PageContainer>
  );
}
