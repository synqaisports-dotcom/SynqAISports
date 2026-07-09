import Link from 'next/link';
import { Landmark, MapPin, Network, Package, Pencil, UserCog } from 'lucide-react';
import {
  ClubIdentityHeroLinkAction,
} from '@/components/portal/ClubIdentityHero';
import { ClubProfileSheet } from '@/components/portal/ClubProfileSheet';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Card, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export default async function PortalClubLandingPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const club = ctx.club;

  const modules = [
    {
      title: 'Organigrama',
      description: 'Estructura jerárquica y dependencias del club.',
      href: '/portal/club/organigrama',
      icon: Network,
    },
    {
      title: 'Estructura no deportiva',
      description: 'Presidente, junta directiva y cargos institucionales.',
      href: '/portal/club/estructura',
      icon: Landmark,
    },
    {
      title: 'Cuerpo técnico',
      description: 'Staff, categorías, reconocimiento médico y documentación.',
      href: '/portal/club/staff',
      icon: UserCog,
    },
    {
      title: 'Instalaciones',
      description: 'Campos, horarios y división para entrenamientos.',
      href: '/portal/club/instalaciones',
      icon: MapPin,
    },
    {
      title: 'Material',
      description: 'Inventario deportivo por almacén, equipo e instalación.',
      href: '/portal/club/material',
      icon: Package,
    },
  ];

  return (
    <PageContainer>
      <ClubProfileSheet
        club={club}
        actions={
          <ClubIdentityHeroLinkAction href="/portal/club/datos/editar">
            <Pencil className="size-3.5" />
            Modificar
          </ClubIdentityHeroLinkAction>
        }
      />

      <div className="mt-6 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {modules.map(({ title, description, href, icon: Icon }) => (
          <Link key={title} href={href}>
            <Card className="h-full transition-colors hover:border-primary/30">
              <CardHeader>
                <div className="mb-2 flex size-10 items-center justify-center rounded-lg bg-primary/10">
                  <Icon className="size-5 text-primary" />
                </div>
                <CardTitle className="text-base">{title}</CardTitle>
                <CardDescription>{description}</CardDescription>
              </CardHeader>
            </Card>
          </Link>
        ))}
      </div>
    </PageContainer>
  );
}
