import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

export default async function PortalClubDatosLandingPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const club = ctx.club;
  const fields = [
    { label: 'Nombre', value: club.name },
    { label: 'Slug', value: club.slug },
    { label: 'País', value: club.country_code },
    { label: 'Email', value: club.email ?? '—' },
    { label: 'Teléfono', value: club.phone ?? '—' },
    { label: 'Dirección', value: club.address ?? '—' },
    { label: 'Jugadores (ref.)', value: String(club.players_count) },
    { label: 'Cuota familiar', value: `${club.family_fee_annual_eur} €/año` },
    { label: 'Tarifa SynqAI', value: `${club.synq_rate_per_user_eur} €/usuario/mes` },
    { label: 'Código invitación', value: club.invite_code ?? '—' },
  ];

  return (
    <PageContainer
      pageTitle="Datos del club"
      pageDescription="Vista de la ficha oficial. Usa Modificar para editar."
      pageHeaderAction={
        <div className="flex gap-2">
          <Button variant="outline" size="sm" asChild>
            <Link href="/portal/club">
              <ArrowLeft className="h-4 w-4" />
              Volver
            </Link>
          </Button>
          <Button size="sm" asChild>
            <Link href="/portal/club/datos/editar">
              <Pencil className="h-4 w-4" />
              Modificar
            </Link>
          </Button>
        </div>
      }
    >
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Ficha del club</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-0 sm:grid-cols-2">
          {fields.map(({ label, value }, i) => (
            <div key={label}>
              {i > 0 && <Separator className="my-3 sm:hidden" />}
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="mt-0.5 text-sm font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
