import { PageContainer } from '@/components/portal/PageContainer';
import { PortalFeatureSpecs } from '@/components/portal/PortalFeatureSpecs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const schedules = [
  {
    team: 'Sub-14 A',
    category: 'Infantil',
    letter: 'A',
    type: 'Formación',
    days: 'Mar y Jue 18:00',
    coach: 'Carlos Méndez',
    coach2: '—',
    delegate: 'Ana Pérez',
    physio: 'Miguel Soto',
  },
  {
    team: 'Sub-16 B',
    category: 'Cadete',
    letter: 'B',
    type: 'Competición',
    days: 'Lun Mié Vie 19:30',
    coach: 'Laura Ruiz',
    coach2: 'Pablo Núñez',
    delegate: '—',
    physio: 'Miguel Soto',
  },
];

export default function PortalCanteraHorariosPage() {
  return (
    <PageContainer
      pageTitle="Horarios de entrenamiento"
      pageDescription="Planificación por equipo: formación o competición, categoría, letra y cuerpo técnico."
    >
      <div className="space-y-4">
        {schedules.map((row) => (
          <Card key={row.team}>
            <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-2 pb-2">
              <div>
                <CardTitle className="text-base">{row.team}</CardTitle>
                <CardDescription>
                  {row.category} {row.letter} · {row.days}
                </CardDescription>
              </div>
              <Badge variant={row.type === 'Competición' ? 'default' : 'secondary'}>{row.type}</Badge>
            </CardHeader>
            <CardContent className="grid gap-2 text-sm sm:grid-cols-2 lg:grid-cols-4">
              <p><span className="text-muted-foreground">Entrenador:</span> {row.coach}</p>
              <p><span className="text-muted-foreground">2º entrenador:</span> {row.coach2}</p>
              <p><span className="text-muted-foreground">Delegado:</span> {row.delegate}</p>
              <p><span className="text-muted-foreground">Prep. físico:</span> {row.physio}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <PortalFeatureSpecs
          title="Especificación horarios"
          description="Los entrenadores se cargan desde la ficha de staff del club."
          specs={[
            { title: 'Tipo sesión', description: 'Competición vs formación.', status: 'mvp' },
            { title: 'Categoría y letra', description: 'Agrupación visual por edad.', status: 'mvp' },
            { title: 'Calendario', description: 'Vista semanal con instalaciones.', status: 'next' },
          ]}
        />
      </div>
    </PageContainer>
  );
}
