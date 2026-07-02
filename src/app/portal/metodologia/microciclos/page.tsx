import { redirect } from 'next/navigation';

/** Los microciclos se gestionan desde Ciclos (periodización). */
export default function MicrociclosListPage() {
  redirect('/portal/metodologia/ciclos');
}
