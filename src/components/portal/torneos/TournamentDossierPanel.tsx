'use client';

import Link from 'next/link';
import { useState, useTransition } from 'react';
import { updateTournamentDossierConfig } from '@/app/actions/tournaments';
import { buildTournamentDossier } from '@/lib/tournament-dossier';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import type { TournamentBundle } from '@/lib/tournaments';
import { getDossierConfig } from '@/lib/tournament-dossier';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Check, ExternalLink, FileText, Loader2, X } from 'lucide-react';
import { cn } from '@/lib/utils';

const fieldClass = 'portal-field-surface';

type Props = {
  bundle: TournamentBundle;
  tournamentId: string;
};

export function TournamentDossierPanel({ bundle, tournamentId }: Props) {
  const dossier = buildTournamentDossier(bundle);
  const saved = getDossierConfig(bundle);
  const [welcomeMessage, setWelcomeMessage] = useState(saved.welcome_message ?? bundle.tournament.description ?? '');
  const [contactEmail, setContactEmail] = useState(saved.contact_email ?? '');
  const [contactPhone, setContactPhone] = useState(saved.contact_phone ?? '');
  const [includeSponsors, setIncludeSponsors] = useState(saved.include_sponsors !== false);
  const [message, setMessage] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  const completeCount = dossier.completeness.filter((c) => c.ok).length;
  const allComplete = completeCount === dossier.completeness.length;

  return (
    <div className="space-y-5">
      <section className="portal-section-surface rounded-xl p-4 md:p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h3 className="flex items-center gap-2 font-medium">
              <FileText className="size-4 text-cyan-300" />
              Dossier para participantes
            </h3>
            <p className="mt-1 text-sm text-muted-foreground">
              Documento con portada, normas, participantes, taquilla y planos. Imprímalo o guárdelo como PDF para enviar a clubs y familias.
            </p>
          </div>
          <Button asChild size="sm">
            <Link href={`/print/torneo/${tournamentId}`} target="_blank">
              <ExternalLink className="mr-1.5 size-4" />
              Abrir / Imprimir PDF
            </Link>
          </Button>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-2">
          <Badge variant="outline" className={allComplete ? 'border-emerald-400/40 text-emerald-300' : 'border-amber-400/40 text-amber-300'}>
            {completeCount}/{dossier.completeness.length} secciones listas
          </Badge>
        </div>

        <ul className="mt-4 grid gap-2 sm:grid-cols-2">
          {dossier.completeness.map((item) => (
            <li
              key={item.label}
              className={cn(
                'flex items-center gap-2 rounded-lg border px-3 py-2 text-sm',
                item.ok ? 'border-emerald-400/30 bg-emerald-400/5' : 'border-border/50 bg-background/20'
              )}
            >
              {item.ok ? (
                <Check className="size-4 shrink-0 text-emerald-400" />
              ) : (
                <X className="size-4 shrink-0 text-muted-foreground" />
              )}
              <span className={item.ok ? 'text-foreground' : 'text-muted-foreground'}>{item.label}</span>
            </li>
          ))}
        </ul>

        {!allComplete ? (
          <p className="mt-4 text-xs text-muted-foreground">
            Completa los apartados pendientes en <strong>Ajustes</strong> (portada, normas, mapa de sede, equipos…).
          </p>
        ) : null}
      </section>

      <section className="portal-section-surface rounded-xl p-4 md:p-5">
        <h3 className="font-medium">Textos del dossier</h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Mensaje de bienvenida y contacto que aparecerán en el documento.
        </p>

        {message ? <p className="mt-3 text-sm text-cyan-200">{message}</p> : null}

        <form
          className="mt-4 grid gap-4"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            startTransition(async () => {
              const res = await updateTournamentDossierConfig(tournamentId, fd);
              setMessage(res.message ?? (res.ok ? 'Guardado' : 'Error'));
            });
          }}
        >
          <input type="hidden" name="include_sponsors" value={includeSponsors ? 'true' : 'false'} readOnly />
          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>Mensaje de bienvenida</label>
            <textarea
              name="welcome_message"
              rows={4}
              value={welcomeMessage}
              onChange={(e) => setWelcomeMessage(e.target.value)}
              placeholder="Bienvenidos al Torneo Ciudad de Madrid…"
              className={`flex w-full rounded-md border px-3 py-2 text-sm ${fieldClass}`}
            />
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label className={PORTAL_FIELD_LABEL_CLASS}>Email contacto</label>
              <Input name="contact_email" type="email" value={contactEmail} onChange={(e) => setContactEmail(e.target.value)} className={fieldClass} />
            </div>
            <div>
              <label className={PORTAL_FIELD_LABEL_CLASS}>Teléfono contacto</label>
              <Input name="contact_phone" value={contactPhone} onChange={(e) => setContactPhone(e.target.value)} className={fieldClass} />
            </div>
          </div>
          <label className="flex items-center gap-2">
            <input
              type="checkbox"
              checked={includeSponsors}
              onChange={(e) => setIncludeSponsors(e.target.checked)}
              className="size-4 rounded border-border accent-primary"
            />
            <span className="text-sm">Incluir patrocinadores en el dossier</span>
          </label>
          <Button type="submit" size="sm" disabled={pending}>
            {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Guardar textos
          </Button>
        </form>
      </section>

      <section className="portal-section-surface rounded-xl p-4 md:p-5">
        <h3 className="font-medium">Vista previa del contenido</h3>
        <div className="mt-4 space-y-3 text-sm">
          <PreviewRow label="Portada" value={dossier.cover_image_url ? 'Con imagen' : 'Sin imagen — sube en Ajustes'} />
          <PreviewRow label="Fechas" value={dossier.date_range_label} />
          <PreviewRow label="Categorías" value={`${dossier.categories.length} · ${dossier.categories.map((c) => c.name).join(', ') || '—'}`} />
          <PreviewRow label="Participantes" value={`${dossier.total_teams} equipos`} />
          <PreviewRow label="Taquilla" value={dossier.tickets.length > 0 ? dossier.tickets.map((t) => `${t.name} ${t.price_label}`).join(' · ') : 'Sin precios configurados'} />
          <PreviewRow label="Campos" value={dossier.fields.map((f) => f.label).join(', ') || '—'} />
        </div>
      </section>
    </div>
  );
}

function PreviewRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex flex-wrap justify-between gap-2 border-b border-border/30 pb-2">
      <span className="text-muted-foreground">{label}</span>
      <span className="max-w-[70%] text-right font-medium">{value}</span>
    </div>
  );
}
