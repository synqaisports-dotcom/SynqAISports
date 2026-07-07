import { cn } from '@/lib/utils';
import type { OrganigramaNodeView } from '@/lib/organigrama';
import { Badge } from '@/components/ui/badge';

type Props = {
  node: OrganigramaNodeView;
  variant?: 'default' | 'hero' | 'compact';
  className?: string;
  selected?: boolean;
  onSelect?: (nodeId: string) => void;
};

export function OrganigramaNodeCard({
  node,
  variant = 'default',
  className,
  selected = false,
  onSelect,
}: Props) {
  const interactive = Boolean(onSelect);

  return (
    <div
      role={interactive ? 'button' : undefined}
      tabIndex={interactive ? 0 : undefined}
      onClick={interactive ? () => onSelect?.(node.id) : undefined}
      onKeyDown={
        interactive
          ? (event) => {
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault();
                onSelect?.(node.id);
              }
            }
          : undefined
      }
      className={cn(
        'relative rounded-xl border bg-card text-center shadow-[0_4px_24px_hsl(183_100%_50%_/_0.08)] transition-colors',
        node.vacant ? 'border-primary/25' : 'border-primary/45',
        selected && 'border-primary bg-primary/10 ring-2 ring-primary/30',
        interactive && 'cursor-pointer hover:border-primary/60 hover:bg-primary/5',
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
        {node.displayName}
      </p>
      {node.vacant && variant !== 'compact' ? (
        <Badge variant="outline" className="mt-2 text-[10px]">
          Vacante
        </Badge>
      ) : null}
    </div>
  );
}
