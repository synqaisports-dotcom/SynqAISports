'use client';

import { matchesByBracket } from '@/lib/tournament-brackets';
import { PortalSheetBody, PortalSheetContent, PortalSheetHeader } from '@/components/portal/PortalSheet';
import { TournamentBracketVisual } from '@/components/portal/torneos/TournamentBracketVisual';
import {
  CONSOLATION_BRACKET,
  placementBracketsForCategory,
  type TournamentBundle,
  type TournamentCategory,
} from '@/lib/tournaments';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { GitBranch } from 'lucide-react';

function PlacementBracketPhase({
  bundle,
  category,
  bracketKey,
  bracketName,
  color,
  positionLabel,
}: {
  bundle: TournamentBundle;
  category: TournamentCategory;
  bracketKey: string;
  bracketName: string;
  color?: string;
  positionLabel: string;
}) {
  const categoryMatches = bundle.matches.filter((m) => m.category_id === category.id);
  const bracketMatches = matchesByBracket(categoryMatches, bracketKey);

  return (
    <section className="portal-section-surface rounded-xl p-4 md:p-5">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <div
          className="size-4 shrink-0 rounded-full ring-2 ring-white/10"
          style={{ backgroundColor: color ?? '#94a3b8' }}
        />
        <div>
          <h4 className="text-base font-semibold" style={{ color: color ?? undefined }}>
            {bracketName}
          </h4>
          <p className="text-xs text-muted-foreground">
            {positionLabel} · {bracketMatches.length} partidos
          </p>
        </div>
      </div>
      <TournamentBracketVisual
        matches={bracketMatches}
        bundle={bundle}
        bracketName={bracketName}
        accentColor={color}
      />
    </section>
  );
}

function CategoryBrackets({ bundle, category }: { bundle: TournamentBundle; category: TournamentCategory }) {
  const brackets = placementBracketsForCategory(category);
  const categoryMatches = bundle.matches.filter((m) => m.category_id === category.id);
  const hasConsolation = categoryMatches.some((m) => m.bracket_key === 'consolation');

  return (
    <div className="space-y-6">
      {brackets.map((bracket) => (
        <PlacementBracketPhase
          key={bracket.bracket_key}
          bundle={bundle}
          category={category}
          bracketKey={bracket.bracket_key}
          bracketName={bracket.name}
          color={bracket.color}
          positionLabel={`${bracket.position}º en cada grupo`}
        />
      ))}

      {hasConsolation ? (
        <PlacementBracketPhase
          bundle={bundle}
          category={category}
          bracketKey={CONSOLATION_BRACKET.bracket_key}
          bracketName={CONSOLATION_BRACKET.name}
          color={CONSOLATION_BRACKET.color}
          positionLabel="Últimos puestos / bandeja inferior"
        />
      ) : null}
    </div>
  );
}

type Props = {
  bundle: TournamentBundle;
  categoryId: string | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

export function TournamentBracketsSheet({ bundle, categoryId, open, onOpenChange }: Props) {
  const category = bundle.categories.find((c) => c.id === categoryId);

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <PortalSheetContent maxWidth="full" side="right">
        <PortalSheetHeader>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <GitBranch className="size-5 text-cyan-300" />
              Cruces eliminatorios — {category?.name ?? 'Torneo'}
            </SheetTitle>
            <p className="text-sm text-muted-foreground">
              Cada bandeja (Platinum, Gold, Silver…) con su cuadro de eliminatorias completo.
            </p>
          </SheetHeader>
        </PortalSheetHeader>
        <PortalSheetBody className="max-w-[1400px]">
          {category ? <CategoryBrackets bundle={bundle} category={category} /> : null}
        </PortalSheetBody>
      </PortalSheetContent>
    </Sheet>
  );
}
