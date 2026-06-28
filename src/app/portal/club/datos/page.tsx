import Link from 'next/link';
import { ArrowLeft, Pencil } from 'lucide-react';
import {
  ClubIdentityHero,
  ClubIdentityHeroLinkAction,
} from '@/components/portal/ClubIdentityHero';
import { PageContainer } from '@/components/portal/PageContainer';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';
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
    <PageContainer>
      <Card className="overflow-hidden p-0">
        <ClubIdentityHero
          club={club}
          actions={
            <>
              <ClubIdentityHeroLinkAction href="/portal/club" variant="outline">
                <ArrowLeft className="size-3.5" />
                Volver
              </ClubIdentityHeroLinkAction>
              <ClubIdentityHeroLinkAction href="/portal/club/datos/editar">
                <Pencil className="size-3.5" />
                Modificar
              </ClubIdentityHeroLinkAction>
            </>
          }
        />
      </Card>

      <Card className="mt-6">
        <CardHeader>
          <CardTitle className="text-base">Ficha del club</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-0 sm:grid-cols-2">
          {fields.map(({ label, value }, i) => (
            <div key={label}>
              {i > 0 ? <Separator className="my-3 sm:hidden" /> : null}
              <p className="text-xs font-medium text-muted-foreground">{label}</p>
              <p className="mt-0.5 break-all text-sm font-medium">{value}</p>
            </div>
          ))}
        </CardContent>
      </Card>
    </PageContainer>
  );
}
