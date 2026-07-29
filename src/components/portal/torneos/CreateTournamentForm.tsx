'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createTournament } from '@/app/actions/tournaments';
import { TOURNAMENT_SPORTS, TOURNAMENT_SPORT_LABELS } from '@/lib/tournaments';
import { Button } from '@/components/ui/button';
import { Loader2 } from 'lucide-react';

export function CreateTournamentForm() {
  const router = useRouter();
  const [pending, setPending] = useState(false);
  const [error, setError] = useState<string | null>(null);

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

  const defaultStart = new Date();
  defaultStart.setDate(defaultStart.getDate() + 7);
  defaultStart.setHours(9, 0, 0, 0);
  const defaultEnd = new Date(defaultStart);
  defaultEnd.setDate(defaultEnd.getDate() + 1);

  return (
    <form onSubmit={handleSubmit} className="portal-section-surface mx-auto max-w-xl space-y-4 rounded-xl p-5">
      <h2 className="text-lg font-medium">Nuevo torneo</h2>
      <p className="text-sm text-muted-foreground">
        Torneo de fin de semana con categorías, grupos y finales paralelas por clasificación.
      </p>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Nombre</span>
        <input
          name="name"
          required
          placeholder="Torneo Ciudad de Madrid"
          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
        />
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Deporte</span>
        <select name="sport_key" className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm">
          {TOURNAMENT_SPORTS.map((s) => (
            <option key={s} value={s}>
              {TOURNAMENT_SPORT_LABELS[s]}
            </option>
          ))}
        </select>
      </label>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Sede</span>
        <input
          name="venue_name"
          placeholder="Polideportivo Municipal"
          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
        />
      </label>

      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Inicio</span>
          <input
            name="starts_at"
            type="datetime-local"
            defaultValue={defaultStart.toISOString().slice(0, 16)}
            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
          />
        </label>
        <label className="block space-y-1.5">
          <span className="text-sm font-medium">Fin</span>
          <input
            name="ends_at"
            type="datetime-local"
            defaultValue={defaultEnd.toISOString().slice(0, 16)}
            className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
          />
        </label>
      </div>

      <label className="block space-y-1.5">
        <span className="text-sm font-medium">Descripción</span>
        <textarea
          name="description"
          rows={3}
          placeholder="Torneo multideporte de fin de semana..."
          className="w-full rounded-lg border border-border bg-background/50 px-3 py-2 text-sm"
        />
      </label>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      <Button type="submit" disabled={pending} className="w-full sm:w-auto">
        {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
        Crear torneo
      </Button>
    </form>
  );
}
