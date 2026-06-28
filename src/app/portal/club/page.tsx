import Link from 'next/link';
import {
  ArrowRight,
  Building2,
  MapPin,
  Network,
  Pencil,
  Share2,
  UserCog,
} from 'lucide-react';
import {
  ClubIdentityHero,
  ClubIdentityHeroLinkAction,
} from '@/components/portal/ClubIdentityHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
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
    <PageContainer>
      <Card className="overflow-hidden p-0">
        <ClubIdentityHero
          club={club}
          actions={
            <ClubIdentityHeroLinkAction href="/portal/club/datos/editar">
              <Pencil className="size-3.5" />
              Modificar
            </ClubIdentityHeroLinkAction>
          }
        />
        <CardContent className="pt-4">
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
          {club.address ? (
            <>
              <Separator className="my-4" />
              <p className="text-sm text-muted-foreground">{club.address}</p>
            </>
          ) : null}
        </CardContent>
      </Card>

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
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
              <Link
                href={href}
                className="inline-flex h-9 w-full items-center justify-center gap-1 rounded-md border border-primary/25 bg-transparent px-3 text-sm font-medium transition-colors hover:border-primary/45 hover:bg-primary/5"
              >
                {action}
                <ArrowRight className="size-4" />
              </Link>
            </CardContent>
          </Card>
        ))}
      </div>
    </PageContainer>
  );
}
