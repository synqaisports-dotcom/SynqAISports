import type { TournamentSponsor } from '@/lib/tournaments';
import { TOURNAMENT_SPONSOR_TIER_LABELS, TOURNAMENT_SPONSOR_TIER_META } from '@/lib/tournament-sponsors';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const TIER_SIZE = {
  gold: 'h-14 w-28 sm:h-16 sm:w-32',
  silver: 'h-11 w-24 sm:h-12 sm:w-28',
  bronze: 'h-9 w-20 sm:h-10 sm:w-24',
} as const;

type Props = {
  sponsors: TournamentSponsor[];
  variant?: 'strip' | 'footer';
  sponsorsTabHref?: string;
};

export function PublicSponsorStrip({ sponsors, variant = 'strip', sponsorsTabHref }: Props) {
  const active = sponsors.filter((s) => s.active);
  if (active.length === 0) return null;

  const gold = active.filter((s) => s.tier === 'gold');
  const others = active.filter((s) => s.tier !== 'gold');

  return (
    <aside
      className={cn(
        'border-t border-cyan-400/15 bg-gradient-to-r from-[#060a12] via-[#0a1628]/90 to-[#060a12]',
        variant === 'footer' ? 'py-8' : 'py-4'
      )}
    >
      <div className="mx-auto max-w-6xl px-4">
        <div className="flex flex-wrap items-center justify-between gap-2">
          <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-cyan-400/70">
            Patrocinadores del torneo
          </p>
          {sponsorsTabHref ? (
            <Link href={sponsorsTabHref} className="text-[10px] text-cyan-300/80 hover:text-cyan-200">
              Ver todos →
            </Link>
          ) : null}
        </div>

        {gold.length > 0 ? (
          <div className="mt-3 flex flex-wrap items-center justify-center gap-4 sm:gap-6">
            {gold.map((s) => (
              <SponsorLogo key={s.id} sponsor={s} sizeClass={TIER_SIZE.gold} featured />
            ))}
          </div>
        ) : null}

        {others.length > 0 ? (
          <div
            className={cn(
              'flex flex-wrap items-center justify-center gap-3 sm:gap-4',
              gold.length > 0 ? 'mt-3 border-t border-white/5 pt-3' : 'mt-3'
            )}
          >
            {others.map((s) => (
              <SponsorLogo
                key={s.id}
                sponsor={s}
                sizeClass={TIER_SIZE[s.tier] ?? TIER_SIZE.bronze}
              />
            ))}
          </div>
        ) : null}
      </div>
    </aside>
  );
}

function SponsorLogo({
  sponsor,
  sizeClass,
  featured,
}: {
  sponsor: TournamentSponsor;
  sizeClass: string;
  featured?: boolean;
}) {
  const meta = TOURNAMENT_SPONSOR_TIER_META[sponsor.tier];
  const content = sponsor.logo_url ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain p-1.5" />
  ) : (
    <span className="text-sm font-bold text-cyan-100/90">{sponsor.name.slice(0, 2).toUpperCase()}</span>
  );

  const inner = (
    <div
      className={cn(
        'flex items-center justify-center rounded-xl border bg-white/[0.03] backdrop-blur-sm transition-transform hover:scale-[1.02]',
        featured ? 'border-cyan-400/30 shadow-[0_0_24px_hsl(183_100%_50%_/_0.12)]' : 'border-white/10',
        sizeClass
      )}
      title={`${sponsor.name} · ${TOURNAMENT_SPONSOR_TIER_LABELS[sponsor.tier]}`}
      style={featured ? { borderTopColor: meta.color, borderTopWidth: 2 } : undefined}
    >
      {content}
    </div>
  );

  if (sponsor.url) {
    return (
      <a href={sponsor.url} target="_blank" rel="noopener noreferrer" className="shrink-0">
        {inner}
      </a>
    );
  }

  return inner;
}
