import type { TournamentSponsor } from '@/lib/tournaments';
import { TOURNAMENT_SPONSOR_TIER_LABELS, TOURNAMENT_SPONSOR_TIER_META } from '@/lib/tournament-sponsors';
import { cn } from '@/lib/utils';
import Link from 'next/link';

const TIER_ORDER = { gold: 0, silver: 1, bronze: 2 } as const;
const LOGO_SIZE = 'h-10 w-[5.5rem] sm:h-11 sm:w-24';

type Props = {
  sponsors: TournamentSponsor[];
  variant?: 'strip' | 'footer';
  sponsorsTabHref?: string;
  fixed?: boolean;
};

export function PublicSponsorStrip({ sponsors, variant = 'strip', sponsorsTabHref, fixed = false }: Props) {
  const active = sponsors
    .filter((s) => s.active)
    .sort((a, b) => TIER_ORDER[a.tier] - TIER_ORDER[b.tier]);

  if (active.length === 0) return null;

  const marqueeItems = [...active, ...active];

  return (
    <aside
      className={cn(
        'border-t border-cyan-400/15 bg-[#0a1220]/85 backdrop-blur-md',
        fixed && 'fixed bottom-0 left-0 right-0 z-40 shadow-[0_-8px_28px_rgba(0,0,0,0.35)]',
        variant === 'footer' ? 'py-4' : 'py-2'
      )}
      aria-label="Patrocinadores del torneo"
    >
      <div className="flex items-center gap-3 px-4 md:gap-4">
        <p className="hidden shrink-0 text-[9px] font-semibold uppercase tracking-[0.16em] text-cyan-400/60 sm:block">
          Patrocinadores
        </p>

        <div className="synq-sponsor-marquee min-w-0 flex-1">
          <div className="synq-sponsor-marquee-track">
            {marqueeItems.map((sponsor, index) => (
              <SponsorLogo
                key={`${sponsor.id}-${index}`}
                sponsor={sponsor}
                sizeClass={LOGO_SIZE}
                featured={sponsor.tier === 'gold'}
              />
            ))}
          </div>
        </div>

        {sponsorsTabHref ? (
          <Link
            href={sponsorsTabHref}
            className="shrink-0 text-[9px] uppercase tracking-wider text-cyan-300/70 hover:text-cyan-200"
          >
            Ver todos
          </Link>
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
    <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-full max-w-full object-contain p-1" />
  ) : (
    <span className="text-xs font-bold text-cyan-100/90">{sponsor.name.slice(0, 2).toUpperCase()}</span>
  );

  const inner = (
    <div
      className={cn(
        'flex shrink-0 items-center justify-center rounded-lg border bg-white/[0.04] transition-transform hover:scale-[1.03]',
        featured ? 'border-cyan-400/30' : 'border-white/10',
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
