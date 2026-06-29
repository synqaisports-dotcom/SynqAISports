import type { DivisionScheduleRow } from '@/lib/team-setup';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { cn } from '@/lib/utils';

type Props = {
  rows: DivisionScheduleRow[];
  title?: string;
  className?: string;
};

export function FacilityDivisionOccupancy({
  rows,
  title = 'Ocupación por zona del campo',
  className,
}: Props) {
  if (rows.length === 0) return null;

  return (
    <Card className={cn('border border-primary/25', className)}>
      <CardHeader className="pb-3">
        <CardTitle className="text-base">{title}</CardTitle>
      </CardHeader>
      <CardContent className="grid gap-3 sm:grid-cols-2">
        {rows.map((row) => (
          <div
            key={row.division}
            className="rounded-lg border border-primary/20 bg-muted/5 p-3"
          >
            <p className="text-xs font-semibold uppercase tracking-wider text-primary/90">
              {row.label}
            </p>
            {row.entries.length === 0 ? (
              <p className="mt-2 text-sm text-muted-foreground">Libre</p>
            ) : (
              <ul className="mt-2 space-y-2">
                {row.entries.map((entry, index) => (
                  <li
                    key={entry.teamId ?? `${row.division}-preview-${index}`}
                    className={cn(
                      'text-sm',
                      entry.isPreview && 'rounded-md border border-dashed border-primary/30 px-2 py-1'
                    )}
                  >
                    <span className="font-medium text-foreground">{entry.teamName}</span>
                    <p className="mt-0.5 text-xs text-muted-foreground">
                      {entry.days} · {entry.time}
                    </p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
