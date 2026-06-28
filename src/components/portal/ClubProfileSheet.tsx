import type { ReactNode } from 'react';
import type { ClubRow } from '@/lib/portal';
import { ClubIdentityHero } from '@/components/portal/ClubIdentityHero';
import { ClubSocialBar } from '@/components/portal/ClubSocialBar';
import { Card, CardContent } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';

type Props = {
  club: ClubRow;
  actions?: ReactNode;
};

export function ClubProfileSheet({ club, actions }: Props) {
  const fichaFields = [
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
    <Card className="overflow-hidden p-0">
      <ClubIdentityHero club={club} actions={actions} />
      <CardContent className="space-y-6 pt-5">
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

        <Separator />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Ficha del club
          </p>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {fichaFields.map(({ label, value }) => (
              <div key={label}>
                <p className="text-xs text-muted-foreground">{label}</p>
                <p className="mt-0.5 break-all text-sm font-medium">{value}</p>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        <div>
          <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
            Redes y web
          </p>
          <ClubSocialBar club={club} />
        </div>
      </CardContent>
    </Card>
  );
}
