import { PageContainer } from '@/components/portal/PageContainer';
import { PortalFeatureSpecs } from '@/components/portal/PortalFeatureSpecs';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function PortalClubStaffNuevoPage() {
  return (
    <PageContainer
      pageTitle="Nueva ficha de staff"
      pageDescription="Alta de técnico con equipos, categoría, documentación y reconocimiento médico."
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Datos del técnico</CardTitle>
          <CardDescription>Formulario de alta — persistencia en Supabase en la siguiente iteración.</CardDescription>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Nombre completo</span>
            <Input placeholder="Nombre y apellidos" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Cargo / categoría</span>
            <Input placeholder="Entrenador, 2º entrenador, delegado…" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Equipos asignados</span>
            <Input placeholder="Sub-14 A, Sub-16 B…" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Email</span>
            <Input type="email" placeholder="tecnico@club.es" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Reconocimiento médico — inicio</span>
            <Input type="date" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Reconocimiento médico — fin</span>
            <Input type="date" />
          </label>
          <label className="text-sm sm:col-span-2">
            <span className="mb-1.5 block text-muted-foreground">Documentación (PDF)</span>
            <Input type="file" disabled className="cursor-not-allowed" />
          </label>
          <Button className="sm:col-span-2 w-fit" disabled>
            Crear ficha (próximamente)
          </Button>
        </CardContent>
      </Card>

      <div className="mt-6">
        <PortalFeatureSpecs
          title="Vinculación"
          description="La ficha alimentará horarios de cantera y organigrama."
          specs={[
            { title: 'Selector de equipos', description: 'Multiselect desde equipos de cantera.', status: 'mvp' },
            { title: 'Alertas médicas', description: 'Aviso cuando falten menos de 30 días.', status: 'next' },
          ]}
        />
      </div>
    </PageContainer>
  );
}
