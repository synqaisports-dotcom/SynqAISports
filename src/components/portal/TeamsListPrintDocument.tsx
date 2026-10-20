import Image from 'next/image';
import { SynqBrandLockup } from '@/components/brand/SynqBrandLockup';
import { SynqIcon } from '@/components/brand/SynqIcon';
import {
  formatTeamCreatedAt,
  teamSportLabel,
  teamsListStatusLabel,
  type TeamsListPrintSection,
  type TeamsListStatusFilter,
} from '@/lib/teams-list-print';

type Props = {
  clubName: string;
  clubLogoUrl: string | null;
  sections: TeamsListPrintSection[];
  statusFilter: TeamsListStatusFilter;
  generatedAt: string;
};

export function TeamsListPrintDocument({
  clubName,
  clubLogoUrl,
  sections,
  statusFilter,
  generatedAt,
}: Props) {
  const generatedLabel = new Date(generatedAt).toLocaleDateString('es-ES', {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });

  const totalTeams = sections.reduce((sum, section) => sum + section.teams.length, 0);

  return (
    <div className="teams-list-print relative mx-auto max-w-[72rem] overflow-hidden rounded-lg bg-white p-8 text-gray-900 shadow print:shadow-none">
      <div
        className="pointer-events-none absolute inset-0 flex items-center justify-center opacity-[0.05] print:opacity-[0.07]"
        aria-hidden
      >
        <SynqIcon size={320} />
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
                  Listado de equipos por categoría
                </p>
                <h1 className="mt-1 text-2xl font-bold leading-tight">{clubName}</h1>
                <p className="mt-1 text-sm text-gray-600">
                  {teamsListStatusLabel(statusFilter)} · {generatedLabel}
                </p>
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

        <div className="mt-6 space-y-8">
          {sections.length === 0 ? (
            <p className="rounded-lg border border-dashed border-gray-300 p-6 text-sm text-gray-600">
              No hay equipos para la selección indicada.
            </p>
          ) : (
            sections.map((section) => (
              <section key={section.categorySlug ?? 'uncategorized'}>
                <div className="mb-3 flex flex-wrap items-end justify-between gap-2 border-b border-gray-200 pb-2">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-gray-500">Categoría</p>
                    <h2 className="text-lg font-semibold text-gray-900">{section.categoryName}</h2>
                    {section.categoryAges ? (
                      <p className="text-xs text-gray-500">{section.categoryAges}</p>
                    ) : null}
                  </div>
                  <p className="text-xs text-gray-500">
                    {section.teams.length} equipo{section.teams.length === 1 ? '' : 's'}
                  </p>
                </div>

                <table className="w-full border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-gray-300 text-left text-[10px] uppercase tracking-wider text-gray-500">
                      <th className="py-2 pr-3 w-12">Letra</th>
                      <th className="py-2 pr-3">Equipo</th>
                      <th className="py-2 pr-3">Deporte</th>
                      <th className="py-2 pr-3">Jugadores</th>
                      <th className="py-2 pr-3">Estado</th>
                      <th className="py-2 text-right">Fecha de creación</th>
                    </tr>
                  </thead>
                  <tbody>
                    {section.teams.map((team) => (
                      <tr key={team.id} className="border-b border-gray-100">
                        <td className="py-2 pr-3 font-semibold tabular-nums text-gray-900">
                          {team.team_letter ?? '—'}
                        </td>
                        <td className="py-2 pr-3 font-medium text-gray-900">{team.name}</td>
                        <td className="py-2 pr-3 text-gray-700">{teamSportLabel(team.sport)}</td>
                        <td className="py-2 pr-3 tabular-nums text-gray-700">{team.player_count}</td>
                        <td className="py-2 pr-3">
                          <span
                            className={
                              team.active
                                ? 'inline-flex rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-800'
                                : 'inline-flex rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600'
                            }
                          >
                            {team.active ? 'Activo' : 'Pausado'}
                          </span>
                        </td>
                        <td className="py-2 text-right text-gray-700">
                          {formatTeamCreatedAt(team.created_at)}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </section>
            ))
          )}
        </div>

        <footer className="mt-10 flex flex-wrap items-center justify-between gap-3 border-t border-gray-100 pt-4 text-[10px] uppercase tracking-wider text-gray-400">
          <span>
            {totalTeams} equipo{totalTeams === 1 ? '' : 's'} · {sections.length} categoría
            {sections.length === 1 ? '' : 's'}
          </span>
          <div className="flex items-center gap-2">
            <SynqIcon size={16} />
            <span>Documento generado con SynqAI Sports</span>
          </div>
        </footer>
      </div>
    </div>
  );
}
