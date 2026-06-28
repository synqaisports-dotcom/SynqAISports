import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function PortalClubStaffNuevoPage() {
  return (
    <PageContainer>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Crear ficha de staff</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/club/staff">
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Nombre completo</span>
            <Input placeholder="Nombre y apellidos" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Cargo / categoría</span>
            <Input placeholder="Entrenador, delegado…" />
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
          <Button className="w-fit sm:col-span-2" disabled>
            Crear ficha (próximamente)
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
