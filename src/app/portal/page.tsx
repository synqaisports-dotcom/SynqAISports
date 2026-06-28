import Link from 'next/link';
import {
  ArrowRight,
  Calendar,
  ClipboardList,
  Smartphone,
  TrendingUp,
  Users,
} from 'lucide-react';
import { createClient } from '@/lib/supabase/server';
import { countActivePlayers, getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { PageContainer } from '@/components/portal/PageContainer';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function PortalHomePage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const activePlayers = await countActivePlayers(supabase, ctx.club.id);
  const foundingBadge = ctx.club.is_founding
    ? 'Founding — año 1 sin cuota'
    : 'Club socio';

  const kpis = [
    {
      label: 'Jugadores activos',
      value: String(activePlayers),
      hint: `${ctx.club.players_count} de referencia`,
      icon: Users,
    },
    {
      label: 'Cuota familiar',
      value: `${ctx.club.family_fee_annual_eur} €`,
      hint: 'Por jugador / año',
      icon: TrendingUp,
    },
    {
      label: 'Tarifa SynqAI',
      value: `${ctx.club.synq_rate_per_user_eur} €`,
      hint: 'Por usuario / mes',
      icon: Smartphone,
    },
    {
      label: 'Estado club',
      value: foundingBadge,
      hint: ctx.club.founding_until
        ? `Hasta ${new Date(ctx.club.founding_until).toLocaleDateString('es-ES')}`
        : 'Temporada actual',
      icon: Calendar,
    },
  ];

  const quickLinks = [
    { href: '/portal/cantera', title: 'Cantera', text: 'Equipos, jugadores y categorías.' },
    { href: '/portal/metodologia', title: 'Metodología', text: 'Ejercicios, microciclos y PDF.' },
    { href: '/portal/club', title: 'Datos del club', text: 'Perfil, contacto y tarifas.' },
  ];

  return (
    <PageContainer
      pageTitle={`Bienvenido, ${ctx.club.name}`}
      pageDescription="Panel de control del club — cantera, metodología y configuración."
    >
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {kpis.map(({ label, value, hint, icon: Icon }) => (
          <Card key={label}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{label}</CardTitle>
              <Icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{value}</div>
              <p className="text-xs text-muted-foreground">{hint}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="mt-6 grid gap-4 md:grid-cols-3">
        {quickLinks.map(({ href, title, text }) => (
          <Card key={href} className="transition-colors hover:border-primary/40">
            <CardHeader>
              <CardTitle className="text-base">{title}</CardTitle>
              <CardDescription>{text}</CardDescription>
            </CardHeader>
            <CardContent>
              <Button variant="outline" size="sm" asChild>
                <Link href={href}>
                  Abrir
                  <ArrowRight className="ml-1 h-4 w-4" />
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card className="mt-6 border-dashed">
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-base">
            <ClipboardList className="h-4 w-4 text-primary" />
            Próximos módulos
          </CardTitle>
          <CardDescription>Patrocinadores, pantallas LED y torneos.</CardDescription>
        </CardHeader>
      </Card>
    </PageContainer>
  );
}
