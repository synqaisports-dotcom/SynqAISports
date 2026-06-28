import { PageContainer } from '@/components/portal/PageContainer';
import { PortalFeatureSpecs } from '@/components/portal/PortalFeatureSpecs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export default function PortalClubRedesPage() {
  return (
    <PageContainer
      pageTitle="Redes y ficha pública"
      pageDescription="Enlaces y presencia digital del club visible para familias y patrocinadores."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Enlaces del club</CardTitle>
          <CardDescription>Vista previa del formulario — guardado en fase siguiente.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Web oficial</span>
            <Input placeholder="https://miclub.es" disabled />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Instagram</span>
            <Input placeholder="@miclub" disabled />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">YouTube</span>
            <Input placeholder="Canal del club" disabled />
          </label>
          <label className="block text-sm">
            <span className="mb-1.5 block text-muted-foreground">Twitter / X</span>
            <Input placeholder="@miclub" disabled />
          </label>
          <Button className="sm:col-span-2 w-fit" disabled>
            Guardar redes (próximamente)
          </Button>
        </CardContent>
      </Card>
      <div className="mt-6">
        <PortalFeatureSpecs
          title="Especificación"
          description="Integrado con la ficha del club y la web pública."
          specs={[
            { title: 'Vista previa', description: 'Mini preview de cómo se verá en synqai.net.', status: 'next' },
            { title: 'Validación URLs', description: 'Comprobación automática de enlaces rotos.', status: 'next' },
          ]}
        />
      </div>
    </PageContainer>
  );
}
