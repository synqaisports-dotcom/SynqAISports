import Link from 'next/link';
import { ArrowLeft, FileText } from 'lucide-react';
import { loadClubMaterialHandovers } from '@/app/actions/club-material';
import { PageContainer } from '@/components/portal/PageContainer';
import { PortalSectionBadge, PortalSectionShell } from '@/components/portal/PortalSectionShell';
import { Badge } from '@/components/ui/badge';
import {
  MATERIAL_HANDOVER_ROLE_LABELS,
  formatMaterialMoney,
  type MaterialHandover,
} from '@/lib/club-material';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

function formatHandoverDate(value: string) {
  return new Date(value).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
  });
}

function handoverItemCount(handover: MaterialHandover) {
  return handover.items.reduce((sum, item) => sum + item.quantity, 0);
}

function handoverReferenceValue(handover: MaterialHandover) {
  const totals = handover.items.reduce<Record<string, number>>((acc, item) => {
    if (item.unit_cost == null) return acc;
    const currency = item.currency_code ?? 'EUR';
    acc[currency] = (acc[currency] ?? 0) + item.unit_cost * item.quantity;
    return acc;
  }, {});

  const entries = Object.entries(totals);
  if (entries.length === 0) return null;
  return entries
    .map(([currency, amount]) => formatMaterialMoney(amount, currency as 'EUR'))
    .join(' · ');
}

export default async function PortalClubMaterialRecibisPage() {
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect('/login');

  const handovers = await loadClubMaterialHandovers(ctx.club.id);

  return (
    <PageContainer>
      <div className="mb-4">
        <Link
          href="/portal/club/material"
          className="inline-flex items-center gap-1.5 text-sm text-muted-foreground transition-colors hover:text-primary"
        >
          <ArrowLeft className="size-4" />
          Volver a material
        </Link>
      </div>

      <PortalSectionShell className="mb-4">
        <PortalSectionBadge icon={<FileText className="size-3.5" />}>
          Recibís de entrega
        </PortalSectionBadge>
        <h1 className="text-xl font-semibold tracking-tight md:text-2xl">
          Recibís de entrega de temporada
        </h1>
        <p className="mt-1.5 max-w-2xl text-sm text-muted-foreground">
          Listado completo de documentos de entrega de material por zona, temporada y responsable.
        </p>
        <div className="mt-2">
          <Badge variant="secondary">{handovers.length} recibís</Badge>
        </div>
      </PortalSectionShell>

      {handovers.length === 0 ? (
        <div className="portal-section-surface rounded-xl p-8 text-center">
          <p className="text-sm text-muted-foreground">
            Aún no hay recibís generados. Crea uno desde la vista de un equipo o instalación.
          </p>
          <Link
            href="/portal/club/material"
            className="mt-4 inline-flex text-sm font-medium text-primary hover:underline"
          >
            Ir al inventario
          </Link>
        </div>
      ) : (
        <div className="portal-section-surface overflow-hidden rounded-xl">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-primary/15 text-left text-[10px] font-medium uppercase tracking-wider text-muted-foreground">
                  <th className="px-4 py-3">Fecha</th>
                  <th className="px-4 py-3">Temporada</th>
                  <th className="px-4 py-3">Zona</th>
                  <th className="px-4 py-3">Responsable</th>
                  <th className="px-4 py-3">Material</th>
                  <th className="px-4 py-3 text-right">Valor ref.</th>
                  <th className="px-4 py-3 text-right">Documento</th>
                </tr>
              </thead>
              <tbody>
                {handovers.map((handover) => {
                  const referenceValue = handoverReferenceValue(handover);
                  return (
                    <tr
                      key={handover.id}
                      className="border-b border-primary/10 transition-colors hover:bg-primary/5"
                    >
                      <td className="px-4 py-3 whitespace-nowrap">
                        {formatHandoverDate(handover.handed_at)}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap">{handover.season}</td>
                      <td className="px-4 py-3">{handover.location_label}</td>
                      <td className="px-4 py-3">
                        <p className="font-medium">{handover.recipient_name}</p>
                        <p className="text-xs text-muted-foreground">
                          {MATERIAL_HANDOVER_ROLE_LABELS[handover.recipient_role]}
                        </p>
                      </td>
                      <td className="px-4 py-3 text-muted-foreground">
                        {handover.items.length} líneas · {handoverItemCount(handover)} uds.
                      </td>
                      <td className="px-4 py-3 text-right whitespace-nowrap">
                        {referenceValue ?? '—'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <a
                          href={`/print/material/entrega/${handover.id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="font-medium text-primary hover:underline"
                        >
                          Ver / imprimir
                        </a>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </PageContainer>
  );
}
