'use client';

import Link from 'next/link';
import { PortalSheetBody, PortalSheetContent, PortalSheetHeader } from '@/components/portal/PortalSheet';
import {
  fieldLabel,
  formatMatchDateTime,
  roundLabelWithBracket,
} from '@/lib/tournament-schedule';
import {
  formatMatchScore,
  type TournamentBundle,
  type TournamentMatch,
} from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { Sheet, SheetHeader, SheetTitle } from '@/components/ui/sheet';
import { ExternalLink, MapPin, Radio } from 'lucide-react';
import { mesaUrl } from '@/lib/tournament-urls';

type BucketMeta = {
  id: string;
  title: string;
  subtitle?: string;
  matches: TournamentMatch[];
};

type Props = {
  bundle: TournamentBundle;
  bucket: BucketMeta | null;
  open: boolean;
  onOpenChange: (open: boolean) => void;
};

function teamName(bundle: TournamentBundle, id: string | null) {
  if (!id) return '—';
  return bundle.teams.find((t) => t.id === id)?.name ?? '—';
}

function bracketName(bundle: TournamentBundle, match: TournamentMatch) {
  if (!match.bracket_key || match.bracket_key === 'groups') return undefined;
  for (const cat of bundle.categories) {
    const b = cat.placement_brackets_json.find((x) => x.bracket_key === match.bracket_key);
    if (b) return b.name;
  }
  return match.bracket_key === 'consolation' ? 'Consolación' : undefined;
}

export function TournamentScheduleSheet({ bundle, bucket, open, onOpenChange }: Props) {
  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <PortalSheetContent maxWidth="lg">
        <PortalSheetHeader>
          <SheetHeader>
            <SheetTitle className="flex items-center gap-2">
              <MapPin className="size-5 text-cyan-300" />
              {bucket?.title ?? 'Horarios'}
            </SheetTitle>
            {bucket?.subtitle ? (
              <p className="text-sm text-muted-foreground">{bucket.subtitle}</p>
            ) : null}
          </SheetHeader>
        </PortalSheetHeader>
        <PortalSheetBody>
          {bucket ? (
            <div className="portal-section-surface overflow-hidden rounded-xl">
              <table className="w-full text-xs">
                <thead>
                  <tr className="text-left text-muted-foreground">
                    <th className="px-3 py-2">Hora</th>
                    <th className="px-3 py-2">Partido</th>
                    <th className="px-3 py-2 text-center">Ronda</th>
                    <th className="px-3 py-2 text-center">Res</th>
                    <th className="px-3 py-2 w-8" />
                  </tr>
                </thead>
                <tbody>
                  {bucket.matches.map((match) => {
                    const when = formatMatchDateTime(match.scheduled_at);
                    const isLive = match.status === 'live';
                    const bracket = bracketName(bundle, match);
                    return (
                      <tr
                        key={match.id}
                        className={cn(
                          'border-t border-border/30',
                          isLive && 'bg-cyan-400/5'
                        )}
                      >
                        <td className="px-3 py-2 font-semibold tabular-nums text-cyan-300">{when.time}</td>
                        <td className="max-w-[200px] px-3 py-2">
                          <p className="truncate font-medium">
                            {teamName(bundle, match.home_team_id)} vs {teamName(bundle, match.away_team_id)}
                          </p>
                          <p className="truncate text-[10px] text-muted-foreground">
                            {fieldLabel(
                              bundle.fields,
                              match.field_id,
                              (match.metadata_json as { scheduling_division_key?: string })?.scheduling_division_key
                            )}
                          </p>
                        </td>
                        <td className="px-3 py-2 text-center text-[10px] text-muted-foreground">
                          {roundLabelWithBracket(match.round_key, bracket)}
                        </td>
                        <td className="px-3 py-2 text-center tabular-nums font-semibold">
                          {isLive ? (
                            <Radio className="mx-auto size-3.5 animate-pulse text-cyan-300" />
                          ) : match.status === 'scheduled' ? (
                            '—'
                          ) : (
                            formatMatchScore(match)
                          )}
                        </td>
                        <td className="px-2 py-2">
                          {match.mesa_token ? (
                            <Link
                              href={mesaUrl(match.mesa_token)}
                              target="_blank"
                              className="text-cyan-300 hover:text-cyan-200"
                            >
                              <ExternalLink className="size-3.5" />
                            </Link>
                          ) : null}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          ) : null}
        </PortalSheetBody>
      </PortalSheetContent>
    </Sheet>
  );
}

export type { BucketMeta };
