'use client';

import { useEffect, useState } from 'react';
import { useFormState } from 'react-dom';
import { loginCoachFree, registerCoachFree, type CoachFreeFormState } from '@/app/actions/coach-free';
import { COACH_FREE_COUNTRIES } from '@/lib/coach-free-countries';

const initial: CoachFreeFormState = { ok: false, message: '' };

const fieldClass = 'rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white';

export function CoachFreeAuthForm() {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [registerState, registerAction, registerPending] = useFormState(registerCoachFree, initial);
  const [loginState, loginAction, loginPending] = useFormState(loginCoachFree, initial);

  useEffect(() => {
    if (registerState.ok || loginState.ok) {
      window.location.assign('/coach/app');
    }
  }, [registerState.ok, loginState.ok]);

  return (
    <div className="synq-card p-6">
      <div className="grid grid-cols-2 gap-2 rounded-full bg-white/5 p-1 text-sm">
        <button
          type="button"
          onClick={() => setMode('register')}
          className={`rounded-full px-3 py-2 ${mode === 'register' ? 'bg-synq-accent text-synq-navy font-semibold' : 'text-synq-muted'}`}
        >
          Crear cuenta
        </button>
        <button
          type="button"
          onClick={() => setMode('login')}
          className={`rounded-full px-3 py-2 ${mode === 'login' ? 'bg-synq-accent text-synq-navy font-semibold' : 'text-synq-muted'}`}
        >
          Entrar
        </button>
      </div>

      {mode === 'register' ? (
        <form action={registerAction} className="mt-6 grid gap-4">
          <label className="grid gap-1 text-xs text-synq-muted">
            Nombre
            <input name="fullName" required autoComplete="name" className={fieldClass} />
          </label>
          <label className="grid gap-1 text-xs text-synq-muted">
            País
            <select name="countryCode" required defaultValue="ES" className={fieldClass}>
              {COACH_FREE_COUNTRIES.map((country) => (
                <option key={country.code} value={country.code}>
                  {country.name}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-xs text-synq-muted">
            Email
            <input name="email" type="email" required autoComplete="email" className={fieldClass} />
          </label>
          <label className="grid gap-1 text-xs text-synq-muted">
            Contraseña
            <input name="password" type="password" required minLength={8} autoComplete="new-password" className={fieldClass} />
          </label>
          {registerState.message ? (
            <p role="alert" className="text-sm text-red-300">
              {registerState.message}
            </p>
          ) : null}
          <button type="submit" disabled={registerPending} className="synq-btn-primary justify-center disabled:opacity-50">
            {registerPending ? 'Entrando…' : 'Crear cuenta y entrar'}
          </button>
        </form>
      ) : (
        <form action={loginAction} className="mt-6 grid gap-4">
          <label className="grid gap-1 text-xs text-synq-muted">
            Email
            <input name="email" type="email" required autoComplete="email" className={fieldClass} />
          </label>
          <label className="grid gap-1 text-xs text-synq-muted">
            Contraseña
            <input name="password" type="password" required minLength={8} autoComplete="current-password" className={fieldClass} />
          </label>
          {loginState.message ? (
            <p role="alert" className="text-sm text-red-300">
              {loginState.message}
            </p>
          ) : null}
          <button type="submit" disabled={loginPending} className="synq-btn-primary justify-center disabled:opacity-50">
            {loginPending ? 'Entrando…' : 'Entrar en la pizarra'}
          </button>
        </form>
      )}
    </div>
  );
}
