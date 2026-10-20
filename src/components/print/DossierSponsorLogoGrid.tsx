import type { DossierSponsorLine } from '@/lib/tournament-dossier';
import { cn } from '@/lib/utils';

const TIER_CELL_CLASS: Record<string, string> = {
  gold: 'h-24 min-w-[9rem] sm:min-w-[11rem]',
  silver: 'h-20 min-w-[7rem] sm:min-w-[8.5rem]',
  bronze: 'h-16 min-w-[5.5rem] sm:min-w-[6.5rem]',
};

type Props = {
  sponsors: DossierSponsorLine[];
};

export function DossierSponsorLogoGrid({ sponsors }: Props) {
  if (sponsors.length === 0) return null;

  return (
    <div className="mt-6 flex flex-wrap items-center justify-center gap-4">
      {sponsors.map((sponsor) => (
        <div
          key={sponsor.id}
          className={cn(
            'flex items-center justify-center rounded-xl border border-slate-200 bg-white p-3 shadow-sm print:break-inside-avoid',
            TIER_CELL_CLASS[sponsor.tier] ?? 'h-16 min-w-[6rem]'
          )}
        >
          {sponsor.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={sponsor.logo_url}
              alt={sponsor.name}
              className="max-h-full max-w-full object-contain"
            />
          ) : (
            <div
              className={cn(
                'flex size-full items-center justify-center rounded-lg bg-slate-100 font-bold text-slate-500',
                sponsor.tier === 'gold' ? 'text-2xl' : sponsor.tier === 'silver' ? 'text-xl' : 'text-lg'
              )}
              aria-hidden
            >
              {sponsor.name.slice(0, 1)}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
