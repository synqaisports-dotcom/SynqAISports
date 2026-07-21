import Link from 'next/link';
import { loadMaterialHandoverById } from '@/app/actions/club-material';
import {
  MATERIAL_HANDOVER_ROLE_LABELS,
  MATERIAL_UNIT_LABELS,
  formatMaterialMoney,
} from '@/lib/club-material';
import { createClient } from '@/lib/supabase/server';
import { getStaffContext } from '@/lib/portal';
import { redirect } from 'next/navigation';

type Props = {
  params: Promise<{ id: string }>;
};

export default async function MaterialHandoverPrintPage({ params }: Props) {
  const { id } = await params;
  const supabase = await createClient();
  const ctx = await getStaffContext(supabase);
  if (!ctx) redirect(`/login?next=/print/material/entrega/${id}`);

  const handover = await loadMaterialHandoverById(ctx.club.id, id);
  if (!handover) {
    return (
      <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 text-gray-900 shadow">
        <p>Recibí no encontrado.</p>
        <Link href="/portal/club/material" className="print-back-link mt-4 inline-block text-sm">
          Volver a material
        </Link>
      </div>
    );
  }

  const handedAt = new Date(handover.handed_at).toLocaleDateString('es-ES', {
    day: '2-digit',
    month: 'long',
    year: 'numeric',
  });

  const totalByCurrency = handover.items.reduce<Record<string, number>>((acc, item) => {
    if (item.unit_cost == null) return acc;
    const currency = item.currency_code ?? 'EUR';
    acc[currency] = (acc[currency] ?? 0) + item.unit_cost * item.quantity;
    return acc;
  }, {});

  return (
    <div className="mx-auto max-w-3xl rounded-lg bg-white p-8 text-gray-900 shadow">
      <div className="no-print mb-4">
        <Link href="/portal/club/material" className="print-back-link text-sm text-gray-700 hover:text-synq-pitch">
          ← Volver a material
        </Link>
      </div>

      <header className="border-b border-gray-200 pb-4">
        <p className="text-xs uppercase tracking-wider text-gray-500">Recibí de entrega de material</p>
        <h1 className="mt-1 text-2xl font-bold">{ctx.club.name}</h1>
        <p className="mt-1 text-sm text-gray-600">Temporada {handover.season}</p>
      </header>

      <section className="mt-6 grid gap-4 sm:grid-cols-2 text-sm">
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">Zona / ubicación</p>
          <p className="font-medium">{handover.location_label}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">Fecha de entrega</p>
          <p className="font-medium">{handedAt}</p>
        </div>
        <div>
          <p className="text-xs uppercase tracking-wider text-gray-500">Responsable</p>
          <p className="font-medium">{handover.recipient_name}</p>
          <p className="text-gray-600">
            {MATERIAL_HANDOVER_ROLE_LABELS[handover.recipient_role]}
          </p>
        </div>
      </section>

      <table className="mt-8 w-full border-collapse text-sm">
        <thead>
          <tr className="border-b border-gray-300 text-left text-xs uppercase tracking-wider text-gray-500">
            <th className="py-2 pr-4">Material</th>
            <th className="py-2 pr-4">Cantidad</th>
            <th className="py-2 text-right">Valor ref.</th>
          </tr>
        </thead>
        <tbody>
          {handover.items.map((item) => (
            <tr key={item.material_id} className="border-b border-gray-100">
              <td className="py-2 pr-4 font-medium">{item.material_name}</td>
              <td className="py-2 pr-4">
                {item.quantity} {MATERIAL_UNIT_LABELS[item.unit].toLowerCase()}
              </td>
              <td className="py-2 text-right">
                {item.unit_cost != null
                  ? formatMaterialMoney(
                      item.unit_cost * item.quantity,
                      item.currency_code ?? 'EUR'
                    )
                  : '—'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>

      {Object.keys(totalByCurrency).length > 0 ? (
        <p className="mt-4 text-right text-sm font-semibold">
          Valor de referencia:{' '}
          {Object.entries(totalByCurrency).map(([currency, amount]) =>
            formatMaterialMoney(amount, currency as 'EUR')
          ).join(' · ')}
        </p>
      ) : null}

      {handover.notes ? (
        <section className="mt-6 rounded border border-gray-200 p-4 text-sm">
          <p className="text-xs uppercase tracking-wider text-gray-500">Observaciones</p>
          <p className="mt-1 whitespace-pre-wrap">{handover.notes}</p>
        </section>
      ) : null}

      <section className="mt-12 grid gap-12 sm:grid-cols-2 text-sm">
        <div>
          <p className="border-t border-gray-400 pt-2">Firma del club</p>
        </div>
        <div>
          <p className="border-t border-gray-400 pt-2">
            Firma del responsable — {handover.recipient_name}
          </p>
        </div>
      </section>
    </div>
  );
}
