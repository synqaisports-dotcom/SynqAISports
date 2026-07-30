'use client';

import type { TournamentDossierViewModel } from '@/lib/tournament-dossier';
import { cn } from '@/lib/utils';
import { MapPin, Printer } from 'lucide-react';

type Props = {
  dossier: TournamentDossierViewModel;
};

export function TournamentInvitationDossierPrint({ dossier }: Props) {
  return (
    <div className="tournament-dossier-print mx-auto max-w-[210mm] bg-white text-slate-900 shadow-xl print:max-w-none print:shadow-none">
      <div className="no-print sticky top-0 z-10 flex justify-end gap-2 border-b border-slate-200 bg-slate-100 p-3">
        <button
          type="button"
          onClick={() => window.print()}
          className="inline-flex items-center gap-2 rounded-lg bg-cyan-600 px-4 py-2 text-sm font-medium text-white hover:bg-cyan-500"
        >
          <Printer className="size-4" />
          Imprimir / Guardar PDF
        </button>
      </div>

      {/* Portada */}
      <section className="dossier-page dossier-cover relative flex min-h-[297mm] flex-col justify-end overflow-hidden">
        {dossier.cover_image_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={dossier.cover_image_url} alt="" className="absolute inset-0 size-full object-cover" />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-cyan-900" />
        )}
        <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/40 to-black/20" />
        <div className="relative p-10 text-white">
          <p className="text-xs font-semibold uppercase tracking-[0.25em] text-cyan-300">Dossier del torneo</p>
          <h1 className="mt-3 font-serif text-4xl font-bold leading-tight md:text-5xl">{dossier.title}</h1>
          <p className="mt-4 text-lg text-white/90">{dossier.sport_label}</p>
          <p className="mt-2 text-sm text-white/75">{dossier.date_range_label}</p>
          {dossier.venue_name ? <p className="mt-1 text-sm text-white/75">{dossier.venue_name}</p> : null}
        </div>
      </section>

      {/* Presentación */}
      <section className="dossier-page p-10">
        <SectionTitle number="01" title="Bienvenida" />
        {dossier.welcome_message ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{dossier.welcome_message}</p>
        ) : dossier.description ? (
          <p className="mt-4 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{dossier.description}</p>
        ) : (
          <p className="mt-4 text-sm text-slate-500">Información general del torneo.</p>
        )}
        <div className="mt-8 grid gap-4 sm:grid-cols-2">
          <InfoCard label="Fechas" value={dossier.date_range_label} />
          <InfoCard label="Sede" value={dossier.venue_name ?? 'Por confirmar'} />
          <InfoCard label="Deporte" value={dossier.sport_label} />
          <InfoCard label="Equipos inscritos" value={String(dossier.total_teams)} />
        </div>
        {(dossier.contact_email || dossier.contact_phone) && (
          <div className="mt-6 rounded-xl border border-cyan-200 bg-cyan-50 p-4 text-sm">
            <p className="font-semibold text-cyan-900">Contacto organización</p>
            {dossier.contact_email ? <p className="mt-1 text-cyan-800">{dossier.contact_email}</p> : null}
            {dossier.contact_phone ? <p className="text-cyan-800">{dossier.contact_phone}</p> : null}
          </div>
        )}
      </section>

      {/* Normas */}
      <section className="dossier-page p-10">
        <SectionTitle number="02" title="Normas y reglamento" />
        {dossier.rules_text ? (
          <div className="mt-6 whitespace-pre-wrap text-sm leading-relaxed text-slate-700">{dossier.rules_text}</div>
        ) : (
          <p className="mt-6 text-sm text-slate-500">El organizador completará las normas del torneo.</p>
        )}
      </section>

      {/* Categorías y formato */}
      <section className="dossier-page p-10">
        <SectionTitle number="03" title="Categorías y formato" />
        <p className="mt-3 text-sm text-slate-600">
          Cada categoría dispone de su franja horaria exclusiva. Fase de grupos y finales paralelas por clasificación.
        </p>
        <div className="mt-6 space-y-4">
          {dossier.categories.length === 0 ? (
            <p className="text-sm text-slate-500">Sin categorías definidas.</p>
          ) : (
            dossier.categories.map((cat) => (
              <div key={cat.id} className="rounded-xl border border-slate-200 p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="text-lg font-semibold text-slate-900">{cat.name}</h3>
                  <span className="rounded-full bg-cyan-100 px-3 py-1 text-xs font-medium text-cyan-800">{cat.window_label}</span>
                </div>
                <p className="mt-2 text-sm text-slate-600">
                  {cat.groups_count} grupos × {cat.teams_per_group} equipos · {cat.format_label} · ~{cat.match_count} partidos
                </p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Participantes */}
      <section className="dossier-page p-10">
        <SectionTitle number="04" title="Participantes" />
        {dossier.categories.every((c) => c.participants.length === 0) ? (
          <p className="mt-6 text-sm text-slate-500">Lista de equipos pendiente de inscripción.</p>
        ) : (
          <div className="mt-6 space-y-6">
            {dossier.categories.map((cat) =>
              cat.participants.length === 0 ? null : (
                <div key={cat.id}>
                  <h3 className="border-b border-slate-200 pb-2 text-base font-semibold">{cat.name}</h3>
                  <div className="mt-3 space-y-4">
                    {cat.participants.map((group) => (
                      <div key={group.group_code}>
                        <p className="text-xs font-semibold uppercase tracking-wider text-cyan-700">Grupo {group.group_code}</p>
                        <table className="mt-2 w-full text-sm">
                          <thead>
                            <tr className="text-left text-xs text-slate-500">
                              <th className="pb-1 font-medium">Equipo</th>
                              <th className="pb-1 font-medium">Club</th>
                            </tr>
                          </thead>
                          <tbody>
                            {group.teams.map((team) => (
                              <tr key={team.name} className="border-t border-slate-100">
                                <td className="py-1.5 pr-2 font-medium">{team.name}</td>
                                <td className="py-1.5 text-slate-600">{team.club ?? '—'}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    ))}
                  </div>
                </div>
              )
            )}
          </div>
        )}
      </section>

      {/* Taquilla */}
      {dossier.tickets.length > 0 ? (
        <section className="dossier-page p-10">
          <SectionTitle number="05" title="Taquilla y entradas" />
          <p className="mt-3 text-sm text-slate-600">Precios orientativos para acompañantes y público. Pago en taquilla el día del evento.</p>
          <table className="mt-6 w-full text-sm">
            <thead>
              <tr className="border-b border-slate-300 text-left text-xs uppercase tracking-wider text-slate-500">
                <th className="pb-2">Entrada</th>
                <th className="pb-2">Ámbito</th>
                <th className="pb-2 text-right">Precio</th>
              </tr>
            </thead>
            <tbody>
              {dossier.tickets.map((t) => (
                <tr key={t.name} className="border-b border-slate-100">
                  <td className="py-3 pr-2">
                    <p className="font-medium">{t.name}</p>
                    {t.description ? <p className="text-xs text-slate-500">{t.description}</p> : null}
                  </td>
                  <td className="py-3 text-slate-600">{t.scope_label}</td>
                  <td className="py-3 text-right font-semibold tabular-nums">{t.price_label}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </section>
      ) : null}

      {/* Instalaciones y planos */}
      <section className="dossier-page p-10">
        <SectionTitle number={dossier.tickets.length > 0 ? '06' : '05'} title="Instalaciones y cómo llegar" />
        {dossier.venue_map_url ? (
          <div className="mt-6 rounded-xl border border-slate-200 p-4">
            <p className="flex items-center gap-2 font-medium text-slate-900">
              <MapPin className="size-4 text-cyan-600" />
              Mapa general de la sede
            </p>
            <p className="mt-2 break-all text-sm text-cyan-700">{dossier.venue_map_url}</p>
          </div>
        ) : null}
        <div className="mt-6 space-y-4">
          {dossier.fields.map((field) => (
            <div key={field.label} className="rounded-xl border border-slate-200 p-4">
              <p className="font-semibold">{field.label}</p>
              <p className="mt-1 text-sm text-slate-600">{field.division_label}</p>
              {field.notes ? <p className="mt-1 text-sm text-slate-500">{field.notes}</p> : null}
              {field.map_url ? (
                <p className="mt-2 break-all text-sm text-cyan-700">Plano / ubicación: {field.map_url}</p>
              ) : null}
            </div>
          ))}
        </div>
        {dossier.gallery_urls.length > 0 ? (
          <div className="mt-8 grid grid-cols-2 gap-3">
            {dossier.gallery_urls.slice(0, 4).map((url) => (
              // eslint-disable-next-line @next/next/no-img-element
              <img key={url} src={url} alt="" className="aspect-video rounded-lg border border-slate-200 object-cover" />
            ))}
          </div>
        ) : null}
      </section>

      {/* Patrocinadores */}
      {dossier.sponsors.length > 0 ? (
        <section className="dossier-page p-10">
          <SectionTitle number="07" title="Patrocinadores" />
          <div className="mt-6 flex flex-wrap gap-3">
            {dossier.sponsors.map((s) => (
              <span key={s.name} className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium">
                {s.name}
              </span>
            ))}
          </div>
        </section>
      ) : null}

      <footer className="border-t border-slate-200 p-6 text-center text-xs text-slate-400">
        Documento generado el {new Date(dossier.generated_at).toLocaleString('es-ES')} · SynqAISports
      </footer>
    </div>
  );
}

function SectionTitle({ number, title }: { number: string; title: string }) {
  return (
    <div className="flex items-baseline gap-3 border-b border-slate-200 pb-3">
      <span className="text-2xl font-bold text-cyan-600">{number}</span>
      <h2 className="text-xl font-semibold text-slate-900">{title}</h2>
    </div>
  );
}

function InfoCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-slate-50 p-4">
      <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500">{label}</p>
      <p className="mt-1 text-sm font-medium text-slate-900">{value}</p>
    </div>
  );
}
