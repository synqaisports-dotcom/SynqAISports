import type { HistoricalDnaRow } from './types';
import { WAVE_PROFILE_LABELS } from './types';

export function buildCursorReport(rows: HistoricalDnaRow[], supabaseConnected: boolean): string {
  const lines: string[] = [
    '# TrendPulse — Informe para Cursor',
    `Fecha: ${new Date().toISOString()}`,
    `Fase: 1 — ADN histórico`,
    `Supabase: ${supabaseConnected ? 'conectado' : 'sin conectar (datos demo)'}`,
    `Casos cargados: ${rows.length}`,
    '',
    '## Resumen por perfil de ola',
  ];

  const byProfile = rows.reduce<Record<string, number>>((acc, r) => {
    const k = WAVE_PROFILE_LABELS[r.wave_profile] ?? r.wave_profile;
    acc[k] = (acc[k] ?? 0) + 1;
    return acc;
  }, {});
  for (const [k, v] of Object.entries(byProfile)) {
    lines.push(`- ${k}: ${v}`);
  }

  const delays = rows
    .map((r) => r.delay_days_to_target)
    .filter((d): d is number => d != null);
  if (delays.length) {
    const avg = Math.round(delays.reduce((a, b) => a + b, 0) / delays.length);
    lines.push('', `## Delay medio origen→ES: ${avg} días (n=${delays.length})`);
  }

  lines.push('', '## Top casos por delay');
  const sorted = [...rows]
    .filter((r) => r.delay_days_to_target != null)
    .sort((a, b) => (b.delay_days_to_target ?? 0) - (a.delay_days_to_target ?? 0))
    .slice(0, 5);
  for (const r of sorted) {
    lines.push(
      `- ${r.canonical_name}: ${r.delay_days_to_target}d (${r.origin_region}→${r.target_market})`
    );
  }

  lines.push('', '## Próximo paso sugerido', '- Validar fechas de 3 casos con fuentes públicas', '- Ampliar seed a 25 casos', '- Activar cron Fase 2 (ingesta 48h)');

  return lines.join('\n');
}
