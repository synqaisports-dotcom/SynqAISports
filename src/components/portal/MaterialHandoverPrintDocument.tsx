import Image from 'next/image';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { SynqIcon } from '@/components/brand/SynqIcon';
import {
  MATERIAL_HANDOVER_ROLE_LABELS,
  MATERIAL_UNIT_LABELS,
  formatMaterialMoney,
  type MaterialHandover,
} from '@/lib/club-material';

type Props = {
  clubName: string;
  clubLogoUrl: string | null;
  handover: MaterialHandover;
};

export function MaterialHandoverPrintDocument({ clubName, clubLogoUrl, handover }: Props) {
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
    <div className="relative mx-auto max-w-3xl overflow-hidden rounded-lg bg-white p-8 text-gray-900 shadow print:shadow-none">
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.06] print:opacity-[0.08]"
        aria-hidden
      >
        <SynqIcon size={280} />
      </div>

      <div className="relative">
        <header className="border-b border-gray-200 pb-5">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div className="flex min-w-0 items-center gap-4">
              {clubLogoUrl ? (
                <div className="relative size-16 shrink-0 overflow-hidden rounded-lg border border-gray-200 bg-white">
                  <Image
                    src={clubLogoUrl}
                    alt={`Escudo ${clubName}`}
                    fill
                    className="object-contain p-1"
                    sizes="64px"
                  />
                </div>
              ) : (
                <div className="flex size-16 shrink-0 items-center justify-center rounded-lg border border-dashed border-gray-300 bg-gray-50 text-xs text-gray-400">
                  Escudo
                </div>
              )}
              <div className="min-w-0">
                <p className="text-xs uppercase tracking-wider text-gray-500">
                  Recibí de entrega de material
                </p>
                <h1 className="mt-1 text-2xl font-bold leading-tight">{clubName}</h1>
                <p className="mt-1 text-sm text-gray-600">Temporada {handover.season}</p>
              </div>
            </div>
            <SynqBrandLockup
              layout="stacked"
              iconSize={48}
              wordmarkSize="sm"
              showSportsSuffix
              tone="on-light"
            />
          </div>
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
          <div className="sm:col-span-2">
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
            {Object.entries(totalByCurrency)
              .map(([currency, amount]) => formatMaterialMoney(amount, currency as 'EUR'))
              .join(' · ')}
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

        <footer className="mt-10 flex items-center justify-center gap-2 border-t border-gray-100 pt-4 text-[10px] uppercase tracking-wider text-gray-400">
          <SynqIcon size={16} />
          <span>Documento generado con SynqAI Sports</span>
        </footer>
      </div>
    </div>
  );
}
