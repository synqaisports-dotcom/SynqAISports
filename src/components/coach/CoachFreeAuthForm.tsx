'use client';

import { useState } from 'react';
import { useFormState } from 'react-dom';
import { loginCoachFree, registerCoachFree, type CoachFreeFormState } from '@/app/actions/coach-free';
import { COACH_FREE_COUNTRIES } from '@/lib/coach-free-countries';

const initial: CoachFreeFormState = { ok: false, message: '' };

export function CoachFreeAuthForm() {
  const [mode, setMode] = useState<'register' | 'login'>('register');
  const [registerState, registerAction, registerPending] = useFormState(registerCoachFree, initial);
  const [loginState, loginAction, loginPending] = useFormState(loginCoachFree, initial);
  const state = mode === 'register' ? registerState : loginState;
  const pending = mode === 'register' ? registerPending : loginPending;

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

      <form action={mode === 'register' ? registerAction : loginAction} className="mt-6 grid gap-4">
        {mode === 'register' ? (
          <>
            <label className="grid gap-1 text-xs text-synq-muted">
              Nombre
              <input name="fullName" required className="rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white" />
            </label>
            <label className="grid gap-1 text-xs text-synq-muted">
              País
              <select name="countryCode" required defaultValue="ES" className="rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white">
                {COACH_FREE_COUNTRIES.map((country) => (
                  <option key={country.code} value={country.code}>
                    {country.name}
                  </option>
                ))}
              </select>
            </label>
          </>
        ) : null}
        <label className="grid gap-1 text-xs text-synq-muted">
          Email
          <input name="email" type="email" required className="rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white" />
        </label>
        <label className="grid gap-1 text-xs text-synq-muted">
          Contraseña
          <input name="password" type="password" required minLength={8} className="rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white" />
        </label>
        {state.message ? <p className="text-sm text-red-300">{state.message}</p> : null}
        <button type="submit" disabled={pending} className="synq-btn-primary justify-center disabled:opacity-50">
          {pending ? '…' : mode === 'register' ? 'Crear cuenta y entrar' : 'Entrar en la pizarra'}
        </button>
      </form>
    </div>
  );
}
