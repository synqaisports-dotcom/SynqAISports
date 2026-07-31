import { PublicAdSlot } from '@/components/torneo/public/PublicAdSlot';

export function PublicAdSidebar() {
  return (
    <aside className="space-y-5" aria-label="Publicidad">
      <div className="portal-section-surface rounded-xl p-4">
        <p className="text-left text-[10px] font-semibold uppercase tracking-[0.18em] text-cyan-400/70">
          Patrocinio digital
        </p>
        <p className="mt-1 text-left text-xs leading-relaxed text-muted-foreground">
          La red publicitaria de SynqAI Torneos concentra impresiones de todos los eventos para
          maximizar ingresos del ecosistema.
        </p>
      </div>

      <PublicAdSlot slotId="sidebar-top" />
      <PublicAdSlot slotId="sidebar-mid" />
      <PublicAdSlot slotId="sidebar-bottom" />
    </aside>
  );
}
