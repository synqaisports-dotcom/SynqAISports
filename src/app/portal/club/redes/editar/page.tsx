import Link from 'next/link';
import { ArrowLeft } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';

export default function PortalClubRedesEditarPage() {
  return (
    <PageContainer>
      <Card>
        <CardHeader className="flex flex-row items-center justify-between gap-4 space-y-0">
          <CardTitle className="text-base">Modificar redes</CardTitle>
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/club/redes">
              <ArrowLeft className="h-4 w-4" />
              Cancelar
            </Link>
          </Button>
        </CardHeader>
        <CardContent className="grid gap-4 sm:grid-cols-2">
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Web oficial</span>
            <Input placeholder="https://miclub.es" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Instagram</span>
            <Input placeholder="@miclub" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">YouTube</span>
            <Input placeholder="Canal del club" />
          </label>
          <label className="text-sm">
            <span className="mb-1.5 block text-muted-foreground">Twitter / X</span>
            <Input placeholder="@miclub" />
          </label>
          <Button className="w-fit sm:col-span-2" disabled>
            Guardar (próximamente)
          </Button>
        </CardContent>
      </Card>
    </PageContainer>
  );
}
