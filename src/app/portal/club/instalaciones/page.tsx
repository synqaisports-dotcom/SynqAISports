import { PageContainer } from '@/components/portal/PageContainer';
import { PortalFeatureSpecs } from '@/components/portal/PortalFeatureSpecs';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

const facilities = [
  {
    name: 'Campo principal F-11',
    type: 'Césped natural',
    training: true,
    split: '4 mitades (F-11)',
    slots: 'L-V 17:00–22:00',
  },
  {
    name: 'Campo anexo F-7',
    type: 'Césped artificial',
    training: true,
    split: '2 mitades',
    slots: 'L-D 09:00–21:00',
  },
  {
    name: 'Pista polideportiva',
    type: 'Indoor',
    training: true,
    split: 'No divisible',
    slots: 'M-X 18:00–20:00',
  },
];

export default function PortalClubInstalacionesPage() {
  return (
    <PageContainer
      pageTitle="Instalaciones"
      pageDescription="Campos e instalaciones con horarios, uso de entrenamiento y división para sesiones."
    >
      <div className="grid gap-4 lg:grid-cols-2">
        {facilities.map((f) => (
          <Card key={f.name}>
            <CardHeader>
              <CardTitle className="text-base">{f.name}</CardTitle>
              <CardDescription>{f.type}</CardDescription>
            </CardHeader>
            <CardContent className="flex flex-wrap gap-2 text-sm">
              <Badge variant="secondary">Entrenamiento</Badge>
              <Badge variant="outline">{f.split}</Badge>
              <p className="w-full text-muted-foreground">{f.slots}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6">
        <PortalFeatureSpecs
          title="Especificación instalaciones"
          description="Gestión de ocupación y planificación de entrenos."
          specs={[
            { title: 'Horarios por día', description: 'Franjas disponibles y reservadas.', status: 'mvp' },
            { title: 'Tipo de superficie', description: 'Natural, artificial, indoor, etc.', status: 'mvp' },
            { title: 'División F-11', description: 'Hasta 4 mitades solo en campos de 11.', status: 'mvp' },
            { title: 'Calendario visual', description: 'Vista semanal de ocupación.', status: 'next' },
          ]}
        />
      </div>
    </PageContainer>
  );
}
