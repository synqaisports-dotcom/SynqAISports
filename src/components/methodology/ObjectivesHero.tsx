'use client';

import { Target } from 'lucide-react';
import { PortalSectionBadge, PortalSectionShell } from '@/components/portal/PortalSectionShell';
import { CANTERA_CATEGORIES } from '@/lib/cantera-categories';
import { METHODOLOGY_STAGES } from '@/lib/methodology-objectives';
import { Badge } from '@/components/ui/badge';

type Props = {
  className?: string;
};

export function ObjectivesHero({ className }: Props) {
  return (
    <PortalSectionShell className={className}>
      <PortalSectionBadge icon={<Target className="size-3.5" />}>
        Referencia metodológica
      </PortalSectionBadge>
      <h1 className="text-xl font-semibold tracking-tight md:text-2xl">Objetivos formativos</h1>
      <p className="mt-1.5 max-w-xl text-sm text-muted-foreground">
        Matriz por categoría de cantera: técnica, táctica, físico, psicológico y reglas del juego.
        Organizada en tres etapas formativas editables por el club.
      </p>
      <div className="mt-2 flex flex-wrap gap-2">
        <Badge variant="secondary">{CANTERA_CATEGORIES.length} categorías</Badge>
        <Badge variant="outline">{METHODOLOGY_STAGES.length} etapas</Badge>
        <Badge variant="outline">5 dimensiones por categoría</Badge>
      </div>
    </PortalSectionShell>
  );
}
