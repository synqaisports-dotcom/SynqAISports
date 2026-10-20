'use client';

import { useTransition } from 'react';
import { useRouter } from 'next/navigation';
import { Pause, Play } from 'lucide-react';
import { toggleMaterialActive } from '@/app/actions/club-material';
import {
  PORTAL_ACTION_ICON_CLASS,
  PORTAL_ACTION_ICON_DISABLED_CLASS,
} from '@/components/portal/PortalActionIcon';
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
        PORTAL_ACTION_ICON_CLASS,
        PORTAL_ACTION_ICON_DISABLED_CLASS,
        !active && 'text-muted-foreground'
      )}
    >
      {active ? <Pause className="size-4" /> : <Play className="size-4" />}
    </button>
  );
}
