import { cn } from '@/lib/utils';
import type { StaffCategoryStats } from '@/lib/staff-category-stats';
import { Badge } from '@/components/ui/badge';

type Props = {
  categories: StaffCategoryStats[];
  className?: string;
};

/** Resumen horizontal de staff por categoría (Debutantes → Juvenil). */
export function StaffCategoryOverview({ categories, className }: Props) {
  return (
    <section className={cn('mb-4', className)} aria-label="Staff por categoría">
      <p className="mb-2.5 text-xs font-medium uppercase tracking-[0.14em] text-muted-foreground">
        Por categoría
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 snap-x snap-mandatory lg:grid lg:grid-cols-7 lg:gap-2.5 lg:overflow-visible">
        {categories.map((category) => (
          <article
            key={category.categorySlug}
            className={cn(
              'portal-section-surface min-w-[8.75rem] flex-1 snap-start rounded-xl border px-3 py-3 lg:min-w-0',
              category.borderClass
            )}
          >
            <div className="flex items-start justify-between gap-1">
              <h3 className="text-sm font-semibold leading-tight text-foreground">
                {category.categoryName}
              </h3>
              {category.teams > 0 ? (
                <Badge variant="outline" className={cn('shrink-0 text-[9px]', category.badgeClass)}>
                  {category.teams}
                </Badge>
              ) : null}
            </div>
            <p className="mt-1 text-[10px] text-muted-foreground">{category.ages}</p>
            <div className="mt-3 grid grid-cols-2 gap-2">
              <div>
                <p className="text-xl font-bold leading-none tabular-nums">{category.staff}</p>
                <p className="mt-1 text-[10px] text-muted-foreground">Técnicos</p>
              </div>
              <div>
                <p
                  className={cn(
                    'text-xl font-bold leading-none tabular-nums',
                    category.medicalOk > 0 ? 'text-primary' : 'text-muted-foreground'
                  )}
                >
                  {category.medicalOk}
                </p>
                <p className="mt-1 text-[10px] text-muted-foreground">Médico OK</p>
              </div>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
