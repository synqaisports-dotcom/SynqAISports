'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTournament } from '@/app/actions/tournaments';
import { SynqDateTimeField } from '@/components/portal/SynqDateTimeField';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import { TOURNAMENT_SPORTS, TOURNAMENT_SPORT_LABELS, type TournamentSport } from '@/lib/tournaments';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Loader2 } from 'lucide-react';

const fieldClass = 'portal-field-surface';

export function CreateTournamentForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 7);
  defaultStart.setHours(9, 0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultEnd.getDate() + 1);

  const [sportKey, setSportKey] = useState<TournamentSport>('football');
  const [startsAt, setStartsAt] = useState(defaultStart.toISOString().slice(0, 16));
  const [endsAt, setEndsAt] = useState(defaultEnd.toISOString().slice(0, 16));

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setPending(true);
    setError(null);
    const formData = new FormData(e.currentTarget);
    const result = await createTournament(formData);
    setPending(false);
    if (!result.ok) {
      setError(result.message ?? 'Error al crear');
      return;
    }
    if (result.id) router.push(`/portal/torneos/${result.id}`);
  }

  return (
    <form onSubmit={handleSubmit} className="portal-section-surface mx-auto max-w-xl space-y-4 rounded-xl p-5">
      <h2 className="text-lg font-medium">Nuevo torneo</h2>
      <p className="text-sm text-muted-foreground">
        Torneo de fin de semana con categorías, grupos y finales paralelas por clasificación.
      </p>

      <input type="hidden" name="sport_key" value={sportKey} readOnly />
      <input type="hidden" name="starts_at" value={startsAt} readOnly />
      <input type="hidden" name="ends_at" value={endsAt} readOnly />

      <div>
        <label className={PORTAL_FIELD_LABEL_CLASS}>Nombre</label>
        <Input name="name" required placeholder="Torneo Ciudad de Madrid" className={fieldClass} />
      </div>

      <div>
        <label className={PORTAL_FIELD_LABEL_CLASS}>Deporte</label>
        <SynqSelect
          value={sportKey}
          onChange={(value) => setSportKey(value as TournamentSport)}
          options={TOURNAMENT_SPORTS.map((s) => ({ value: s, label: TOURNAMENT_SPORT_LABELS[s] }))}
        />
      </div>

      <div>
        <label className={PORTAL_FIELD_LABEL_CLASS}>Sede</label>
        <Input name="venue_name" placeholder="Polideportivo Municipal" className={fieldClass} />
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Inicio</label>
          <SynqDateTimeField value={startsAt} onChange={setStartsAt} />
        </div>
        <div>
          <label className={PORTAL_FIELD_LABEL_CLASS}>Fin</label>
          <SynqDateTimeField value={endsAt} onChange={setEndsAt} />
        </div>
      </div>

      <div>
        <label className={PORTAL_FIELD_LABEL_CLASS}>Descripción</label>
        <textarea
          name="description"
          rows={3}
          placeholder="Torneo multideporte de fin de semana..."
          className={`flex w-full rounded-md border px-3 py-2 text-sm ${fieldClass}`}
        />
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Crear torneo
      </Button>
    </form>
  );
}
