'use client';

import Link from 'next/link';
import { TeamsListPrintDocument } from '@/components/portal/TeamsListPrintDocument';
import type { TeamsListPrintSection, TeamsListStatusFilter } from '@/lib/teams-list-print';

type Props = {
  clubName: string;
  clubLogoUrl: string | null;
  sections: TeamsListPrintSection[];
  statusFilter: TeamsListStatusFilter;
  generatedAt: string;
};

export function TeamsListPrintPageClient({
  clubName,
  clubLogoUrl,
  sections,
  statusFilter,
  generatedAt,
}: Props) {
  return (
    <div className="print:bg-white">
      <div className="no-print mx-auto max-w-[72rem] px-4 pt-4">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <Link
            href="/portal/cantera/equipos"
            className="print-back-link text-sm text-gray-700 hover:text-synq-pitch"
          >
            ← Volver a equipos
          </Link>
          <button
            type="button"
            onClick={() => window.print()}
            className="rounded-lg border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-800 hover:bg-gray-50"
          >
            Imprimir / Guardar PDF
          </button>
        </div>
      </div>
      <div className="p-4 print:p-0">
        <TeamsListPrintDocument
          clubName={clubName}
          clubLogoUrl={clubLogoUrl}
          sections={sections}
          statusFilter={statusFilter}
          generatedAt={generatedAt}
        />
      </div>
    </div>
  );
}
