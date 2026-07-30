'use client';

import {
  TOURNAMENT_SPONSOR_TIER_LABELS,
  TOURNAMENT_SPONSOR_TIER_META,
} from '@/lib/tournament-sponsors';
import { SPONSOR_TIERS, type TournamentSponsor } from '@/lib/tournaments';
import { cn } from '@/lib/utils';
import { ExternalLink, Megaphone } from 'lucide-react';

type Props = {
  sponsors: TournamentSponsor[];
};

export function PublicSponsorsPanel({ sponsors }: Props) {
  const active = sponsors.filter((s) => s.active);

  if (active.length === 0) {
    return (
      <div className="portal-section-surface rounded-2xl p-10 text-center">
        <Megaphone className="mx-auto size-10 text-muted-foreground/50" />
        <p className="mt-3 text-sm text-muted-foreground">Patrocinadores del torneo próximamente.</p>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <section className="relative overflow-hidden rounded-2xl border border-cyan-400/20 bg-gradient-to-br from-[#0a1628] via-[#060a12] to-[#0a1628] p-6 md:p-8">
        <div className="pointer-events-none absolute -right-20 -top-20 size-64 rounded-full bg-cyan-400/5 blur-3xl" />
        <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-400/80">Gracias a</p>
        <h2 className="mt-2 text-2xl font-bold md:text-3xl">Nuestros patrocinadores</h2>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground">
          Empresas y marcas que hacen posible este torneo. Su apoyo se refleja en la web, el dossier del evento y las pantallas del recinto.
        </p>
        <div className="mt-8 flex flex-wrap items-center justify-center gap-6">
          {active
            .filter((s) => s.tier === 'gold')
            .map((s) => (
              <div
                key={s.id}
                className="flex h-20 w-36 items-center justify-center rounded-xl border border-cyan-400/30 bg-white/[0.04] p-3 sm:h-24 sm:w-44"
              >
                {s.logo_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img src={s.logo_url} alt={s.name} className="max-h-full max-w-full object-contain" />
                ) : (
                  <span className="text-lg font-bold text-cyan-100">{s.name}</span>
                )}
              </div>
            ))}
        </div>
      </section>

      {SPONSOR_TIERS.map((tier) => {
        const tierSponsors = active.filter((s) => s.tier === tier);
        if (tierSponsors.length === 0) return null;
        const meta = TOURNAMENT_SPONSOR_TIER_META[tier];

        return (
          <section key={tier} className="space-y-4">
            <div className="flex items-center gap-3">
              <div className="size-3 rounded-full shadow-[0_0_12px_currentColor]" style={{ backgroundColor: meta.color, color: meta.color }} />
              <div>
                <h3 className="text-lg font-semibold" style={{ color: meta.color }}>
                  Patrocinadores {TOURNAMENT_SPONSOR_TIER_LABELS[tier]}
                </h3>
                <p className="text-xs text-muted-foreground">{meta.webVisibility}</p>
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {tierSponsors.map((s) => (
                <SponsorCard key={s.id} sponsor={s} meta={meta} />
              ))}
            </div>
          </section>
        );
      })}
    </div>
  );
}

function SponsorCard({
  sponsor,
  meta,
}: {
  sponsor: TournamentSponsor;
  meta: (typeof TOURNAMENT_SPONSOR_TIER_META)[keyof typeof TOURNAMENT_SPONSOR_TIER_META];
}) {
  return (
    <article
      className="portal-section-surface flex flex-col overflow-hidden rounded-xl border border-border/50"
      style={{ borderTopColor: meta.color, borderTopWidth: 3 }}
    >
      <div className="flex items-center justify-center border-b border-border/30 bg-background/20 p-6">
        {sponsor.logo_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={sponsor.logo_url} alt={sponsor.name} className="max-h-20 max-w-full object-contain" />
        ) : (
          <div className="flex size-20 items-center justify-center rounded-xl bg-cyan-400/10 text-2xl font-bold text-cyan-200">
            {sponsor.name.slice(0, 1)}
          </div>
        )}
      </div>
      <div className="flex flex-1 flex-col p-4">
        <h4 className="font-semibold">{sponsor.name}</h4>
        <p className="mt-1 text-[10px] uppercase tracking-wider text-muted-foreground">
          {TOURNAMENT_SPONSOR_TIER_LABELS[sponsor.tier]}
        </p>
        {sponsor.notes ? <p className="mt-2 text-xs text-muted-foreground">{sponsor.notes}</p> : null}
        <ul className="mt-3 flex-1 space-y-1 text-[11px] text-muted-foreground">
          {meta.benefits.slice(0, 3).map((b) => (
            <li key={b}>· {b}</li>
          ))}
        </ul>
        {sponsor.url ? (
          <a
            href={sponsor.url}
            target="_blank"
            rel="noopener noreferrer"
            className={cn(
              'mt-4 inline-flex items-center gap-1.5 text-xs font-medium text-cyan-300 hover:text-cyan-200'
            )}
          >
            Visitar web
            <ExternalLink className="size-3.5" />
          </a>
        ) : null}
      </div>
    </article>
  );
}
