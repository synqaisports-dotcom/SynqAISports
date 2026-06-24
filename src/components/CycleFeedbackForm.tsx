'use client';

import { useState } from 'react';
import type { CycleFeedbackType, CycleSlotRow } from '@/lib/cycle-types';
import { FEEDBACK_TYPE_LABELS } from '@/lib/cycle-types';

const FEEDBACK_OPTIONS: CycleFeedbackType[] = [
  'playground_viral',
  'arrived_es',
  'no_show',
  'false_positive',
];

export function CycleFeedbackForm({
  slot,
  onSaved,
}: {
  slot: CycleSlotRow;
  onSaved?: (type: CycleFeedbackType) => void;
}) {
  const [pending, setPending] = useState(false);
  const [saved, setSaved] = useState(slot.feedback?.feedback_type ?? null);
  const [error, setError] = useState<string | null>(null);

  async function submit(type: CycleFeedbackType) {
    setPending(true);
    setError(null);
    try {
      const res = await fetch('/api/cycle/feedback', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slot_id: slot.id, feedback_type: type }),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string; demo?: boolean };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Error al guardar');
        return;
      }
      setSaved(type);
      onSaved?.(type);
    } catch {
      setError('No se pudo conectar');
    } finally {
      setPending(false);
    }
  }

  if (saved) {
    return (
      <p className="text-xs text-tp-green font-mono-data">
        ✓ {FEEDBACK_TYPE_LABELS[saved]}
      </p>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {slot.mode === 'act' ? '¿Qué pasó en el cole?' : '¿Llegó a España?'}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {FEEDBACK_OPTIONS.map((type) => (
          <button
            key={type}
            type="button"
            disabled={pending}
            onClick={() => submit(type)}
            className="rounded-md border border-white/10 bg-white/5 px-2 py-1 text-[10px] text-slate-300 transition hover:border-tp-cyan/40 hover:text-tp-cyan disabled:opacity-50"
          >
            {FEEDBACK_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
