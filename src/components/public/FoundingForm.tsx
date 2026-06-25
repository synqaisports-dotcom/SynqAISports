'use client';

import { useFormState } from 'react-dom';
import { submitFoundingLead, type FoundingFormState } from '@/app/actions/founding';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import type { Dictionary } from '@/lib/i18n/dictionaries';

const initial: FoundingFormState = { ok: false, message: '' };

type Props = { dict: Dictionary };

export function FoundingForm({ dict }: Props) {
  const [state, action, pending] = useFormState(submitFoundingLead, initial);
  const configured = isSupabaseConfigured();

  if (!configured) {
    return (
      <p className="rounded-xl border border-amber-500/30 bg-amber-500/10 p-4 text-sm text-amber-100">
        {dict.founding.notConfigured}
      </p>
    );
  }

  if (state.ok) {
    return (
      <p className="rounded-xl border border-synq-accent/30 bg-synq-accent/10 p-4 text-sm text-synq-accent">
        {dict.founding.success}
      </p>
    );
  }

  return (
    <form action={action} className="grid gap-4 sm:grid-cols-2">
      <Field label={dict.founding.clubName} name="clubName" required />
      <Field label={dict.founding.contactName} name="contactName" required />
      <Field label={dict.founding.contactEmail} name="contactEmail" type="email" required />
      <Field label={dict.founding.country} name="countryCode" defaultValue="ES" required />
      <Field label={dict.founding.players} name="playersCount" type="number" min={1} defaultValue="80" required />
      <Field label={dict.founding.sites} name="sitesCount" type="number" min={1} defaultValue="1" required />
      <div className="sm:col-span-2">
        <label className="mb-1 block text-xs text-synq-muted">{dict.founding.message}</label>
        <textarea
          name="message"
          rows={3}
          className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
        />
      </div>
      {state.message === 'error' && (
        <p className="sm:col-span-2 text-sm text-red-400">{dict.founding.error}</p>
      )}
      <button
        type="submit"
        disabled={pending}
        className="sm:col-span-2 rounded-full bg-synq-pitch px-6 py-3 text-sm font-semibold text-white hover:bg-synq-accent disabled:opacity-50"
      >
        {pending ? '…' : dict.founding.submit}
      </button>
    </form>
  );
}

function Field({
  label,
  name,
  type = 'text',
  required,
  defaultValue,
  min,
}: {
  label: string;
  name: string;
  type?: string;
  required?: boolean;
  defaultValue?: string;
  min?: number;
}) {
  return (
    <div>
      <label className="mb-1 block text-xs text-synq-muted">{label}</label>
      <input
        name={name}
        type={type}
        required={required}
        defaultValue={defaultValue}
        min={min}
        className="w-full rounded-lg border border-white/10 bg-synq-navy/80 px-3 py-2 text-sm text-white"
      />
    </div>
  );
}
