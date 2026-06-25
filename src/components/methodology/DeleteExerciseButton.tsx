'use client';

import { deleteExercise } from '@/app/actions/methodology';
import { useRouter } from 'next/navigation';

export function DeleteExerciseButton({ id }: { id: string }) {
  const router = useRouter();

  return (
    <button
      type="button"
      onClick={() => void deleteExercise(id).then(() => router.refresh())}
      className="text-xs text-red-400 hover:text-red-300"
    >
      Eliminar
    </button>
  );
}
