import Link from 'next/link';
import { redirect } from 'next/navigation';
import { getFamilyContext } from '@/lib/family-auth';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';

export default async function FamiliasHomePage() {
  const family = await getFamilyContext();
  if (!family) redirect('/familias/login');

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-foreground">
          Hola, {family.account.display_name ?? family.account.email}
        </h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Portal de familias de {family.club.name}
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="border border-primary/25">
          <CardHeader>
            <CardTitle className="text-base">Mis jugadores</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {family.players.map((player) => (
              <div
                key={player.id}
                className="rounded-lg border border-primary/15 bg-muted/5 px-3 py-3 text-sm"
              >
                <p className="font-medium text-foreground">{player.display_name}</p>
                <p className="text-xs text-muted-foreground">{player.team_name}</p>
              </div>
            ))}
          </CardContent>
        </Card>

        <Card className="border border-primary/25">
          <CardHeader>
            <CardTitle className="text-base">Reservas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            <p className="text-sm text-muted-foreground">
              Reserva el gimnasio al instante si hay aforo, o solicita cita de fisioterapia
              para que el fisio la apruebe.
            </p>
            <Button asChild>
              <Link href="/familias/reservas">Gestionar reservas</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
