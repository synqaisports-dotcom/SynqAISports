import type { PlayerProfile } from '@/lib/player-profile';
import { playerFullName } from '@/lib/player-profile';

const sectionClass = 'rounded-xl border border-primary/15 bg-muted/5 p-4';

function guardianName(guardian: PlayerProfile['guardians'][number]) {
  return [guardian.first_name, guardian.last_name].filter(Boolean).join(' ').trim() || '—';
}

type Props = {
  player: PlayerProfile;
};

export function PlayerGuardiansSummary({ player }: Props) {
  if (!player.is_minor) {
    return (
      <section className={sectionClass}>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tutores</p>
        <p className="mt-2 text-sm text-muted-foreground">No aplica — el jugador no está marcado como menor de edad.</p>
      </section>
    );
  }

  if (player.guardians.length === 0) {
    return (
      <section className={sectionClass}>
        <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tutores</p>
        <p className="mt-2 text-sm text-muted-foreground">
          Sin tutores registrados. Edita la ficha para añadir sus datos.
        </p>
      </section>
    );
  }

  return (
    <section className={`${sectionClass} space-y-4`}>
      <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">Tutores</p>

      <div className="space-y-3">
        {player.guardians.map((guardian, index) => (
          <div
            key={`${player.id}-tutor-${index}`}
            className="w-full rounded-lg border border-primary/10 bg-background/40 p-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
              Tutor {index + 1}
            </p>
            <div className="mt-3 grid gap-3 sm:grid-cols-3">
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Nombre
                </p>
                <p className="mt-0.5 truncate text-sm font-medium text-foreground">
                  {guardianName(guardian)}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Email
                </p>
                <p className="mt-0.5 truncate text-sm text-foreground">
                  {guardian.email ? (
                    <a href={`mailto:${guardian.email}`} className="text-primary hover:underline">
                      {guardian.email}
                    </a>
                  ) : (
                    '—'
                  )}
                </p>
              </div>
              <div className="min-w-0">
                <p className="text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  Teléfono
                </p>
                <p className="mt-0.5 truncate text-sm text-foreground">{guardian.phone || '—'}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-muted-foreground">
        Contacto de {playerFullName(player)} para acceso a la app y consulta de datos.
      </p>
    </section>
  );
}
