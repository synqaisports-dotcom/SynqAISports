import { countryName } from '@/lib/coach-free-countries';
import { listCoachFreeDirectory } from '@/lib/coach-free-directory';

function formatWhen(iso: string) {
  return new Intl.DateTimeFormat('es-ES', {
    dateStyle: 'medium',
    timeStyle: 'short',
    timeZone: 'Europe/Madrid',
  }).format(new Date(iso));
}

export default async function AdminCoachFreePage() {
  const accounts = await listCoachFreeDirectory();
  const byCountry = new Map<string, number>();
  for (const account of accounts) {
    byCountry.set(account.countryCode, (byCountry.get(account.countryCode) ?? 0) + 1);
  }

  return (
    <div>
      <h1 className="font-serif-display text-3xl text-white">Coach Touch Free</h1>
      <p className="mt-2 max-w-2xl text-sm text-synq-muted">
        Censo de entrenadores sin club. Aquí ves cuántos hay, de qué país son y el código para reenviar el acceso.
        La pizarra no está en esta base.
      </p>
      <p className="mt-4 text-2xl font-semibold text-white">{accounts.length} cuentas Free</p>
      <div className="mt-4 flex flex-wrap gap-2">
        {[...byCountry.entries()].map(([code, count]) => (
          <span key={code} className="rounded-full border border-white/10 px-3 py-1 text-xs text-synq-muted">
            {countryName(code)} · {count}
          </span>
        ))}
      </div>

      <div className="mt-8 space-y-3">
        {accounts.length === 0 ? (
          <p className="text-sm text-synq-muted">Todavía no hay registros. Aparecen al crear la cuenta en la PWA.</p>
        ) : (
          accounts.map((account) => (
            <article key={account.id} className="synq-card p-4">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold text-white">{account.fullName}</h2>
                  <p className="text-sm text-synq-muted">{account.email}</p>
                </div>
                <p className="font-mono text-sm text-synq-accent">{account.accessCode}</p>
              </div>
              <p className="mt-2 text-xs text-synq-muted">
                {countryName(account.countryCode)} · Alta {formatWhen(account.createdAt)} (Madrid)
              </p>
            </article>
          ))
        )}
      </div>
    </div>
  );
}
