'use client';

import { useRef, useState, useTransition } from 'react';
import { addTournamentSponsor, updateTournamentSponsor } from '@/app/actions/tournaments';
import { uploadSignageMedia } from '@/app/actions/signage';
import { SynqSelect } from '@/components/portal/SynqSelect';
import { PORTAL_FIELD_LABEL_CLASS } from '@/lib/portal-form-styles';
import {
  sponsorAmountCents,
  TOURNAMENT_SPONSOR_TIER_LABELS,
  TOURNAMENT_SPONSOR_TIER_META,
} from '@/lib/tournament-sponsors';
import {
  SPONSOR_TIERS,
  type TournamentBundle,
  type TournamentSponsor,
  type TournamentSponsorTier,
} from '@/lib/tournaments';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ImagePlus, Loader2, Megaphone, Pencil, X } from 'lucide-react';

function SponsorCard({ sponsor }: { sponsor: TournamentSponsor }) {
  const [editing, setEditing] = useState(false);
  const [pending, startTransition] = useTransition();
  const [logoUrl, setLogoUrl] = useState(sponsor.logo_url ?? '');
  const [tier, setTier] = useState<TournamentSponsorTier>(sponsor.tier);
  const [amountEur, setAmountEur] = useState(sponsorAmountCents(sponsor) / 100);
  const fileRef = useRef<HTMLInputElement>(null);
  const meta = TOURNAMENT_SPONSOR_TIER_META[sponsor.tier];

  if (editing) {
    const tierMeta = TOURNAMENT_SPONSOR_TIER_META[tier];
    return (
      <form
        className="flex flex-col rounded-xl border border-primary/30 bg-background/30 p-4"
        onSubmit={(e) => {
          e.preventDefault();
          const fd = new FormData(e.currentTarget);
          fd.set('tier', tier);
          fd.set('logo_url', logoUrl);
          fd.set('amount_cents', String(Math.round(amountEur * 100)));
          startTransition(async () => {
            const res = await updateTournamentSponsor(sponsor.id, fd);
            if (res.ok) setEditing(false);
          });
        }}
      >
        <div className="flex items-center justify-between gap-2">
          <p className="text-sm font-medium">Editar patrocinador</p>
          <Button type="button" size="icon" variant="ghost" className="size-8" onClick={() => setEditing(false)}>
            <X className="size-4" />
          </Button>
        </div>
        <div className="mt-3 grid gap-3">
          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>Nombre</label>
            <Input name="name" defaultValue={sponsor.name} required className="portal-field-surface" />
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <div>
              <label className={PORTAL_FIELD_LABEL_CLASS}>Paquete</label>
              <SynqSelect
                value={tier}
                onChange={(v) => {
                  const t = v as TournamentSponsorTier;
                  setTier(t);
                  setAmountEur(TOURNAMENT_SPONSOR_TIER_META[t].suggestedAmountCents / 100);
                }}
                options={SPONSOR_TIERS.map((t) => ({
                  value: t,
                  label: TOURNAMENT_SPONSOR_TIER_LABELS[t],
                }))}
              />
            </div>
            <div>
              <label className={PORTAL_FIELD_LABEL_CLASS}>Importe acordado (€)</label>
              <Input
                type="number"
                step="50"
                min={0}
                value={amountEur}
                onChange={(e) => setAmountEur(Number(e.target.value) || 0)}
                className="portal-field-surface"
              />
            </div>
          </div>
          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>Web</label>
            <Input name="url" defaultValue={sponsor.url ?? ''} placeholder="https://" className="portal-field-surface" />
          </div>
          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>Notas</label>
            <Input name="notes" defaultValue={sponsor.notes ?? ''} className="portal-field-surface" />
          </div>
          <div>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.set('file', file);
              const res = await uploadSignageMedia(fd);
              if (res.ok && res.url) setLogoUrl(res.url);
            }} />
            <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="mr-1.5 size-4" />
              {logoUrl ? 'Cambiar logo' : 'Subir logo'}
            </Button>
          </div>
          <p className="text-[11px] text-muted-foreground">{tierMeta.benefits.slice(0, 2).join(' · ')}</p>
          <Button type="submit" size="sm" disabled={pending} className="w-fit">
            {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Guardar cambios
          </Button>
        </div>
      </form>
    );
  }

  return (
    <div
      className="flex flex-col rounded-xl border border-border/60 bg-background/30 p-4"
      style={{ borderTopColor: meta.color, borderTopWidth: 3 }}
    >
      <div className="flex items-start gap-3">
        <div className="flex size-14 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border/50 bg-background/50">
          {sponsor.logo_url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={sponsor.logo_url} alt="" className="max-h-full max-w-full object-contain p-1" />
          ) : (
            <Megaphone className="size-6 text-muted-foreground" />
          )}
        </div>
        <div className="min-w-0 flex-1">
          <p className="font-semibold">{sponsor.name}</p>
          <Badge variant="outline" className="mt-1 text-[10px]">
            {TOURNAMENT_SPONSOR_TIER_LABELS[sponsor.tier]}
          </Badge>
          <p className="mt-2 text-lg font-bold tabular-nums text-cyan-300">
            {(sponsorAmountCents(sponsor) / 100).toLocaleString('es-ES')} €
          </p>
        </div>
        <Button type="button" size="icon" variant="ghost" className="size-8 shrink-0" onClick={() => setEditing(true)}>
          <Pencil className="size-4" />
        </Button>
      </div>
      {sponsor.notes ? <p className="mt-2 text-xs text-muted-foreground">{sponsor.notes}</p> : null}
      <p className="mt-2 text-[10px] text-muted-foreground">{meta.signage}</p>
    </div>
  );
}

export function TournamentSponsorsPanel({ bundle }: { bundle: TournamentBundle }) {
  const [pending, startTransition] = useTransition();
  const [tier, setTier] = useState<TournamentSponsorTier>('silver');
  const [logoUrl, setLogoUrl] = useState('');
  const [amountEur, setAmountEur] = useState(
    TOURNAMENT_SPONSOR_TIER_META.silver.suggestedAmountCents / 100
  );
  const fileRef = useRef<HTMLInputElement>(null);
  const sponsors = bundle.sponsors.filter((s) => s.active);
  const tierMeta = TOURNAMENT_SPONSOR_TIER_META[tier];

  return (
    <div className="space-y-5">
      <div className="grid gap-3 md:grid-cols-3">
        {SPONSOR_TIERS.map((t) => {
          const meta = TOURNAMENT_SPONSOR_TIER_META[t];
          return (
            <div
              key={t}
              className="portal-section-surface rounded-xl border p-4"
              style={{ borderColor: `${meta.color}44` }}
            >
              <div className="flex items-center gap-2">
                <div className="size-3 rounded-full" style={{ backgroundColor: meta.color }} />
                <p className="font-semibold">{meta.label}</p>
              </div>
              <p className="mt-1 text-xs text-muted-foreground">Paquete orientativo desde</p>
              <p className="mt-0.5 text-lg font-bold tabular-nums" style={{ color: meta.color }}>
                {(meta.suggestedAmountCents / 100).toLocaleString('es-ES')} €
              </p>
              <p className="mt-1 text-xs text-muted-foreground">{meta.webVisibility}</p>
              <ul className="mt-2 space-y-1 text-xs text-muted-foreground">
                {meta.benefits.slice(0, 3).map((b) => (
                  <li key={b}>· {b}</li>
                ))}
              </ul>
            </div>
          );
        })}
      </div>

      <div className="portal-section-surface rounded-xl p-4">
        <h3 className="flex items-center gap-2 font-medium">
          <Megaphone className="size-4 text-primary" />
          Patrocinadores del torneo
        </h3>
        <p className="mt-1 text-sm text-muted-foreground">
          Cada patrocinador tiene ficha editable con logo e importe real del acuerdo. La suma alimenta automáticamente la pestaña Ingresos.
        </p>

        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {sponsors.length === 0 ? (
            <p className="text-sm text-muted-foreground sm:col-span-2">Sin patrocinadores aún.</p>
          ) : (
            sponsors.map((s) => <SponsorCard key={s.id} sponsor={s} />)
          )}
        </div>

        <form
          className="mt-6 grid gap-4 rounded-xl border border-dashed border-primary/30 p-4 md:grid-cols-2"
          onSubmit={(e) => {
            e.preventDefault();
            const fd = new FormData(e.currentTarget);
            fd.set('tier', tier);
            fd.set('logo_url', logoUrl);
            fd.set('amount_cents', String(Math.round(amountEur * 100)));
            startTransition(async () => {
              await addTournamentSponsor(bundle.tournament.id, fd);
              e.currentTarget.reset();
              setLogoUrl('');
              setTier('silver');
              setAmountEur(TOURNAMENT_SPONSOR_TIER_META.silver.suggestedAmountCents / 100);
            });
          }}
        >
          <div className="md:col-span-2">
            <label className={PORTAL_FIELD_LABEL_CLASS}>Nombre</label>
            <Input name="name" required placeholder="Empresa patrocinadora" className="portal-field-surface" />
          </div>
          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>Paquete</label>
            <SynqSelect
              value={tier}
              onChange={(v) => {
                const t = v as TournamentSponsorTier;
                setTier(t);
                setAmountEur(TOURNAMENT_SPONSOR_TIER_META[t].suggestedAmountCents / 100);
              }}
              options={SPONSOR_TIERS.map((t) => ({
                value: t,
                label: `${TOURNAMENT_SPONSOR_TIER_LABELS[t]} — sugerido ${(TOURNAMENT_SPONSOR_TIER_META[t].suggestedAmountCents / 100).toLocaleString('es-ES')} €`,
              }))}
            />
          </div>
          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>Importe acordado (€)</label>
            <Input
              type="number"
              step="50"
              min={0}
              value={amountEur}
              onChange={(e) => setAmountEur(Number(e.target.value) || 0)}
              className="portal-field-surface"
            />
            <p className="mt-1 text-[11px] text-muted-foreground">Importe real del contrato, no el precio de entrada.</p>
          </div>
          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>Web</label>
            <Input name="url" placeholder="https://" className="portal-field-surface" />
          </div>
          <div>
            <label className={PORTAL_FIELD_LABEL_CLASS}>Logo</label>
            <input ref={fileRef} type="file" accept="image/*" className="hidden" onChange={async (e) => {
              const file = e.target.files?.[0];
              if (!file) return;
              const fd = new FormData();
              fd.set('file', file);
              const res = await uploadSignageMedia(fd);
              if (res.ok && res.url) setLogoUrl(res.url);
            }} />
            <Button type="button" size="sm" variant="outline" onClick={() => fileRef.current?.click()}>
              <ImagePlus className="mr-1.5 size-4" />
              {logoUrl ? 'Logo listo' : 'Subir logo'}
            </Button>
          </div>
          <div className="md:col-span-2">
            <label className={PORTAL_FIELD_LABEL_CLASS}>Notas</label>
            <Input name="notes" placeholder="Condiciones del acuerdo…" className="portal-field-surface" />
          </div>
          <p className="text-xs text-muted-foreground md:col-span-2">{tierMeta.benefits.join(' · ')}</p>
          <Button type="submit" size="sm" disabled={pending} className="md:col-span-2 w-fit">
            {pending ? <Loader2 className="mr-2 size-4 animate-spin" /> : null}
            Añadir patrocinador
          </Button>
        </form>
      </div>
    </div>
  );
}
