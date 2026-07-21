import Link from 'next/link';
import { loadMaterialHandoverById } from '@/app/actions/club-material';
import { MaterialHandoverPrintDocument } from '@/components/portal/MaterialHandoverPrintDocument';
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

  return (
    <div className="print:bg-white">
      <div className="no-print mx-auto max-w-3xl px-4 pt-4">
        <Link
          href="/portal/club/material/recibis"
          className="print-back-link text-sm text-gray-700 hover:text-synq-pitch"
        >
          ← Volver a recibís
        </Link>
      </div>
      <div className="p-4 print:p-0">
        <MaterialHandoverPrintDocument
          clubName={ctx.club.name}
          clubLogoUrl={ctx.club.logo_url}
          handover={handover}
        />
      </div>
    </div>
  );
}
