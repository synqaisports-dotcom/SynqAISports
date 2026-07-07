'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useFormState } from 'react-dom';
import {
  promoteCategorySeason,
  type SeasonActionState,
} from '@/app/actions/team-season';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet';
import {
  CANTERA_CATEGORIES,
  getCanteraCategory,
  type CanteraCategorySlug,
} from '@/lib/cantera-categories';
import { defaultSeasonLabel, getNextCategorySlug } from '@/lib/team-season';
import type { TeamProfile } from '@/lib/team-profile';

type Props = {
  teams: TeamProfile[];
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

const initial: SeasonActionState = { ok: false };

export function CategorySeasonPromoteSheet({ teams, open, onOpenChange }: Props) {
  const router = useRouter();
  const [state, action, pending] = useFormState(promoteCategorySeason, initial);
  const [sourceCategorySlug, setSourceCategorySlug] = useState<CanteraCategorySlug>('benjamin');
  const [seasonLabel, setSeasonLabel] = useState(defaultSeasonLabel());

  const sourceTeams = teams.filter(
    (team) => team.category_slug === sourceCategorySlug && team.active
  );
  const nextCategory = getNextCategorySlug(sourceCategorySlug);
  const nextMeta = nextCategory ? getCanteraCategory(nextCategory) : null;

  useEffect(() => {
    if (state.ok) {
      onOpenChange(false);
      router.refresh();
    }
  }, [state.ok, onOpenChange, router]);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent side="right" className="w-full overflow-y-auto border-primary/20 sm:max-w-lg">
        <SheetHeader>
          <SheetTitle>Cierre de temporada por categoría</SheetTitle>
        </SheetHeader>

        <div className="mt-4 space-y-4">
          <p className="text-sm text-muted-foreground">
            Ascenderá todos los equipos activos de la categoría origen a la siguiente, manteniendo
            la misma letra (A→A, B→B…).
          </p>

          <form action={action} className="space-y-4">
            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Categoría origen
              </label>
              <SynqSelect
                value={sourceCategorySlug}
                onChange={(value) => setSourceCategorySlug(value as CanteraCategorySlug)}
                options={CANTERA_CATEGORIES.filter((category) => getNextCategorySlug(category.slug))
                  .map((category) => ({
                    value: category.slug,
                    label: category.name,
                  }))}
              />
            </div>

            <div>
              <label className="mb-1.5 block text-xs font-medium uppercase tracking-wider text-muted-foreground">
                Temporada
              </label>
              <Input
                name="seasonLabel"
                value={seasonLabel}
                onChange={(event) => setSeasonLabel(event.target.value)}
                className="border-primary/30 bg-background/80"
              />
            </div>

            <input type="hidden" name="sourceCategorySlug" value={sourceCategorySlug} readOnly />

            <div className="rounded-lg border border-primary/20 bg-muted/5 p-3 text-sm">
              <p>
                <span className="text-muted-foreground">Destino: </span>
                <span className="font-medium text-foreground">
                  {nextMeta?.name ?? '—'}
                </span>
              </p>
              <p className="mt-2 text-muted-foreground">
                {sourceTeams.length} equipo(s) activo(s):{' '}
                {sourceTeams.map((team) => team.name).join(', ') || 'ninguno'}
              </p>
            </div>

            <Button type="submit" disabled={pending || sourceTeams.length === 0 || !nextCategory}>
              {pending ? 'Procesando…' : 'Ascender categoría completa'}
            </Button>
          </form>

          {state.ok && state.report ? (
            <pre className="whitespace-pre-wrap rounded-lg border border-primary/20 bg-muted/5 p-3 text-xs text-foreground">
              {state.report}
            </pre>
          ) : null}
          {state.message === 'demo' ? (
            <p className="text-sm text-muted-foreground">Simulación en modo demo.</p>
          ) : null}
        </div>
      </SheetContent>
    </Sheet>
  );
}
