import { reviewFoundingLead } from '@/app/actions/founding';
import { listDemoFoundingLeads, type FoundingLead, type FoundingLeadStatus } from '@/lib/demo-founding-store';
import { hasServiceRoleKey } from '@/lib/demo';

const STATUS_LABEL: Record<FoundingLeadStatus, string> = {
  pending: 'Pendiente',
  approved: 'Aprobado',
  rejected: 'Rechazado',
};

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date(iso));
}

function LeadCard({ lead }: { lead: FoundingLead }) {
  return (
    <article className="synq-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-white">{lead.club_name}</h2>
          <p className="mt-1 text-sm text-synq-muted">
            {lead.contact_name} · {lead.contact_email}
          </p>
        </div>
        <span className="rounded-full border border-white/10 px-2.5 py-0.5 text-xs text-synq-muted">
          {STATUS_LABEL[lead.status]}
        </span>
      </div>
      <dl className="mt-4 grid gap-2 text-sm text-synq-muted sm:grid-cols-3">
        <div>
          <dt className="text-[10px] uppercase tracking-wider">País</dt>
          <dd className="text-white">{lead.country_code}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider">Jugadores</dt>
          <dd className="text-white">{lead.players_count}</dd>
        </div>
        <div>
          <dt className="text-[10px] uppercase tracking-wider">Sedes</dt>
          <dd className="text-white">{lead.sites_count}</dd>
        </div>
      </dl>
      {lead.message ? <p className="mt-3 text-sm text-synq-muted">{lead.message}</p> : null}
      <p className="mt-3 text-xs text-synq-muted">Recibida {formatWhen(lead.created_at)} (Madrid)</p>
      {lead.status === 'approved' && lead.invite_code ? (
        <div className="mt-4 rounded-xl border border-synq-accent/30 bg-synq-accent/10 p-3 text-sm">
          <p className="text-white">
            Código del club: <strong className="font-mono">{lead.invite_code}</strong>
          </p>
          <p className="mt-1 text-synq-muted">
            Año 1 sin cuota SynqAI
            {lead.founding_until ? ` hasta ${formatWhen(lead.founding_until)}` : ''}. Envía el código al
            contacto. El acceso de director se crea cuando el club tenga usuario.
          </p>
        </div>
      ) : null}
      {lead.status === 'pending' ? (
        <div className="mt-4 flex flex-wrap gap-2">
          <form action={reviewFoundingLead}>
            <input type="hidden" name="id" value={lead.id} />
            <input type="hidden" name="decision" value="approved" />
            <button type="submit" className="synq-btn-primary !px-4 !py-2">
              Aprobar founding
            </button>
          </form>
          <form action={reviewFoundingLead}>
            <input type="hidden" name="id" value={lead.id} />
            <input type="hidden" name="decision" value="rejected" />
            <button type="submit" className="synq-btn-ghost !px-4 !py-2">
              Rechazar
            </button>
          </form>
        </div>
      ) : null}
    </article>
  );
}

export default async function SynqAdminPage() {
  const leads = listDemoFoundingLeads();
  const pending = leads.filter((lead) => lead.status === 'pending');
  const approved = leads.filter((lead) => lead.status === 'approved');
  const rejected = leads.filter((lead) => lead.status === 'rejected');
  const persisted = hasServiceRoleKey();

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-white">Solicitudes founding</h1>
      <p className="mt-2 max-w-2xl text-sm text-synq-muted">
        Mesa interna de SynqAI. Apruebas el club, generas su código y dejas el año 1 sin cuota. No hay
        pasarela de pago: la factura del club se hace aparte.
      </p>
      <p className="mt-3 max-w-2xl text-sm text-synq-muted">
        {persisted
          ? 'Hay clave de servicio: al aprobar también se crea el club en Supabase.'
          : 'Esta bandeja vive en la demo del servidor. Al conectar Supabase con clave de servicio, la aprobación crea el club de verdad.'}
      </p>

      <section className="mt-8 space-y-4">
        <h2 className="text-sm font-semibold uppercase tracking-wider text-synq-accent">
          Pendientes ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="text-sm text-synq-muted">No hay solicitudes pendientes.</p>
        ) : (
          pending.map((lead) => <LeadCard key={lead.id} lead={lead} />)
        )}
      </section>

      {approved.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-white">
            Aprobadas ({approved.length})
          </h2>
          {approved.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </section>
      ) : null}

      {rejected.length > 0 ? (
        <section className="mt-10 space-y-4">
          <h2 className="text-sm font-semibold uppercase tracking-wider text-synq-muted">
            Rechazadas ({rejected.length})
          </h2>
          {rejected.map((lead) => (
            <LeadCard key={lead.id} lead={lead} />
          ))}
        </section>
      ) : null}
    </div>
  );
}
