import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  MapPin,
  Network,
  Pencil,
  Share2,
  UserCog,
  Users,
} from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default async function PortalClubLandingPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const club = ctx.club;

  const modules = [
    {
      title: 'Datos del club',
      description: 'Ficha oficial: identidad, contacto, tarifas y founding.',
      href: '/portal/club/datos',
      icon: Building2,
      action: 'Ver ficha',
    },
    {
      title: 'Redes y ficha pública',
      description: 'Web, Instagram y presencia digital del club.',
      href: '/portal/club/redes',
      icon: Share2,
      action: 'Gestionar',
    },
    {
      title: 'Organigrama',
      description: 'Estructura jerárquica y dependencias del club.',
      href: '/portal/club/organigrama',
      icon: Network,
      action: 'Ver organigrama',
    },
    {
      title: 'Cuerpo técnico',
      description: 'Staff, categorías, reconocimiento médico y documentación.',
      href: '/portal/club/staff',
      icon: UserCog,
      action: 'Ver staff',
    },
    {
      title: 'Instalaciones',
      description: 'Campos, horarios y división para entrenamientos.',
      href: '/portal/club/instalaciones',
      icon: MapPin,
      action: 'Ver instalaciones',
    },
  ];

  return (
    <PageContainer
      pageTitle={club.name}
      pageDescription="Portada del club — resumen y acceso a cada área. Los formularios se abren desde cada sección."
      pageHeaderAction={
        <Button asChild>
          <Link href="/portal/club/datos/editar">
            <Pencil className="h-4 w-4" />
            Modificar datos
          </Link>
        </Button>
      }
    >
      <Card className="overflow-hidden">
        <div className="h-24 bg-gradient-to-r from-primary/20 via-primary/10 to-transparent" />
        <CardHeader className="-mt-10 relative">
          <div className="flex size-16 items-center justify-center rounded-xl border-4 border-background bg-primary text-2xl font-bold text-primary-foreground shadow-sm">
            {club.name.slice(0, 2).toUpperCase()}
          </div>
          <CardTitle className="mt-4 text-2xl">{club.name}</CardTitle>
          <CardDescription className="flex flex-wrap items-center gap-2">
            <Badge variant="secondary">{club.country_code}</Badge>
            {club.is_founding && <Badge>Founding club</Badge>}
            {club.invite_code && (
              <Badge variant="outline">Código {club.invite_code}</Badge>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div>
              <p className="text-xs text-muted-foreground">Jugadores ref.</p>
              <p className="text-lg font-semibold">{club.players_count}</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Cuota familiar</p>
              <p className="text-lg font-semibold">{club.family_fee_annual_eur} €/año</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Tarifa SynqAI</p>
              <p className="text-lg font-semibold">{club.synq_rate_per_user_eur} €/mes</p>
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Contacto</p>
              <p className="truncate text-sm font-medium">{club.email ?? '—'}</p>
              <p className="text-sm text-muted-foreground">{club.phone ?? '—'}</p>
            </div>
          </div>
          {club.address && (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">{club.address}</p>
            </>
          )}
        </CardContent>
      </Card>

      <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map(({ title, description, href, icon: Icon, action }) => (
          <Card key={title} className="flex flex-col transition-colors hover:border-primary/30">
            <CardHeader>
              <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                <Icon className="size-5 text-primary" />
              </div>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{description}</CardDescription>
            </CardHeader>
            <CardContent className="mt-auto">
              <Button variant="outline" size="sm" asChild className="w-full">
                <Link href={href}>
                  {action}
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-dashed">
        <CardContent className="flex items-center gap-3 py-4 text-sm text-muted-foreground">
          <Users className="h-4 w-4 shrink-0 text-primary" />
          Desde cada tarjeta accedes a la portada del módulo. Crear o editar fichas solo con los
          botones dentro de cada sección.
        </CardContent>
      </Card>
    </PageContainer>
  );
}
