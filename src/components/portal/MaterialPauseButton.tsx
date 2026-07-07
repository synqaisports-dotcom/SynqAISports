'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play } from 'lucide-react';
import { toggleMaterialActive } from '@/app/actions/club-material';
import { cn } from '@/lib/utils';

type Props = {
  materialId: string;
  active: boolean;
};

export function MaterialPauseButton({ materialId, active }: Props) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      aria-label={active ? 'Pausar material' : 'Reactivar material'}
      title={
        active
          ? 'Pausar (oculta del inventario activo; conserva histórico)'
          : 'Reactivar material'
      }
      onClick={() => {
        startTransition(async () => {
          await toggleMaterialActive(materialId, !active);
          router.refresh();
        });
      }}
      className={cn(
        'inline-flex size-9 items-center justify-center rounded-lg border border-transparent text-muted-foreground transition-colors',
        'hover:border-primary/30 hover:bg-primary/10 hover:text-primary',
        'disabled:opacity-50'
      )}
    >
      {active ? <Pause className="size-4" /> : <Play className="size-4" />}
    </button>
  );
}
