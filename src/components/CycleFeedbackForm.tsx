'use client';

import { useEffect, useState } from 'react';
import type { CycleFeedbackType, CycleSlotRow } from '@/lib/cycle-types';
import { FEEDBACK_TYPE_LABELS } from '@/lib/cycle-types';
import { readFeedbackLocal, writeFeedbackLocal, type StoredFeedback } from '@/lib/cycle-feedback-store';

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
  const [editing, setEditing] = useState(false);
  const [stored, setStored] = useState<StoredFeedback | null>(null);
  const [notes, setNotes] = useState('');
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const local = readFeedbackLocal(slot.id);
    if (local) {
      setStored(local);
      setNotes(local.notes ?? '');
    } else if (slot.feedback) {
      setStored({
        slot_id: slot.id,
        feedback_type: slot.feedback.feedback_type,
        notes: slot.feedback.notes,
        updated_at: slot.feedback.recorded_at,
      });
      setNotes(slot.feedback.notes ?? '');
    }
  }, [slot.id, slot.feedback]);

  async function save(type: CycleFeedbackType) {
    setPending(true);
    setError(null);
    const payload = {
      slot_id: slot.id,
      feedback_type: type,
      notes: notes.trim() || null,
    };

    try {
      const res = await fetch('/api/cycle/feedback', {
        method: stored && !editing ? 'PUT' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = (await res.json()) as { ok?: boolean; error?: string };
      if (!res.ok || !data.ok) {
        setError(data.error ?? 'Error al guardar');
        return;
      }

      const entry: StoredFeedback = {
        ...payload,
        updated_at: new Date().toISOString(),
      };
      writeFeedbackLocal(entry);
      setStored(entry);
      setEditing(false);
      onSaved?.(type);
    } catch {
      const entry: StoredFeedback = {
        ...payload,
        updated_at: new Date().toISOString(),
      };
      writeFeedbackLocal(entry);
      setStored(entry);
      setEditing(false);
      onSaved?.(type);
    } finally {
      setPending(false);
    }
  }

  if (stored && !editing) {
    return (
      <div className="space-y-2 rounded-lg border border-white/10 bg-black/20 p-2">
        <p className="text-xs text-tp-green font-mono-data">
          ✓ {FEEDBACK_TYPE_LABELS[stored.feedback_type]}
        </p>
        {stored.notes && <p className="text-[11px] text-slate-400">{stored.notes}</p>}
        <button
          type="button"
          onClick={() => setEditing(true)}
          className="text-[10px] text-tp-cyan hover:underline"
        >
          Editar resultado
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2">
      <p className="text-[10px] uppercase tracking-wide text-slate-500">
        {editing ? 'Cambiar resultado' : slot.mode === 'act' ? '¿Qué pasó en el cole?' : '¿Llegó a España?'}
      </p>
      <div className="flex flex-wrap gap-1.5">
        {FEEDBACK_OPTIONS.map((type) => (
          <button
            key={type}
            type="button"
            disabled={pending}
            onClick={() => save(type)}
            className={`rounded-md border px-2 py-1 text-[10px] transition disabled:opacity-50 ${
              stored?.feedback_type === type
                ? 'border-tp-cyan/50 bg-tp-cyan/15 text-tp-cyan'
                : 'border-white/10 bg-white/5 text-slate-300 hover:border-tp-cyan/40 hover:text-tp-cyan'
            }`}
          >
            {FEEDBACK_TYPE_LABELS[type]}
          </button>
        ))}
      </div>
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notas opcionales (ej. lo vieron en 2ºB, no en 5º)"
        rows={2}
        className="w-full rounded-md border border-white/10 bg-black/30 px-2 py-1 text-[11px] text-slate-300 placeholder:text-slate-600"
      />
      {editing && (
        <button
          type="button"
          onClick={() => setEditing(false)}
          className="text-[10px] text-slate-500 hover:text-slate-300"
        >
          Cancelar
        </button>
      )}
      {error && <p className="text-[10px] text-red-400">{error}</p>}
    </div>
  );
}
