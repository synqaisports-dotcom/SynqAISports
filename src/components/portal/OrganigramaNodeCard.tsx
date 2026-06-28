import { cn } from '@/lib/utils';
import type { OrganigramaNode } from '@/lib/organigrama';
import { Badge } from '@/components/ui/badge';

type Props = {
  node: OrganigramaNode;
  variant?: 'default' | 'hero' | 'compact';
  className?: string;
};

function isVacant(name: string): boolean {
  const n = name.trim().toLowerCase();
  return !n || n === 'por asignar' || n === 'varios';
}

export function OrganigramaNodeCard({ node, variant = 'default', className }: Props) {
  const vacant = isVacant(node.name);

  return (
    <div
      className={cn(
        'relative rounded-xl border bg-card text-center shadow-[0_4px_24px_hsl(183_100%_50%_/_0.08)] transition-colors',
        vacant ? 'border-primary/25' : 'border-primary/45',
        variant === 'hero' && 'px-3 py-2.5',
        variant === 'default' && 'px-4 py-3',
        variant === 'compact' && 'px-2.5 py-2',
        className
      )}
    >
      <p
        className={cn(
          'font-semibold leading-tight text-foreground',
          variant === 'compact' ? 'text-xs' : 'text-sm'
        )}
      >
        {node.role}
      </p>
      <p
        className={cn(
          'mt-1 text-muted-foreground',
          variant === 'compact' ? 'text-[10px]' : 'text-xs'
        )}
      >
        {node.name}
      </p>
      {vacant && variant !== 'compact' ? (
        <Badge variant="outline" className="mt-2 text-[10px]">
          Vacante
        </Badge>
      ) : null}
    </div>
  );
}
