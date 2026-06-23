import type { HistoricalDnaRow } from './types';
import { WAVE_PROFILE_LABELS } from './types';
import { DEMO_SEED_COUNT } from './demo-seed';

function supabaseStatusLabel(connected: boolean, configured: boolean, error: string | null): string {
  if (connected) return 'conectado';
  if (!configured) return 'sin conectar (faltan variables en Vercel o sin redeploy)';
  if (error) return `error de lectura: ${error}`;
  return 'conectado pero tabla vacía (ejecuta SQL en Supabase)';
}

function nextSteps(
  supabaseConnected: boolean,
  configured: boolean,
  caseCount: number
): string[] {
  if (!configured) {
    return [
      'Añadir NEXT_PUBLIC_SUPABASE_URL y NEXT_PUBLIC_SUPABASE_ANON_KEY en Vercel',
      'Redeploy obligatorio tras guardar variables',
      'Ejecutar los 2 SQL en Supabase SQL Editor',
    ];
  }
  if (!supabaseConnected) {
    return [
      'Ejecutar migraciones SQL en Supabase si la tabla está vacía',
      'Redeploy en Vercel si acabas de añadir variables',
      'Validar fechas de Labubu, Pokémon y FIFA 2022 contigo',
    ];
  }
  if (caseCount < 25) {
    return [
      'Ejecutar migración seed 25 casos en Supabase si faltan filas',
      'Validar fechas de 3 casos con fuentes públicas',
      'Diseñar timelines visuales por caso',
    ];
  }
  return [
    'Validar fechas de Labubu, Pokémon y FIFA 2022 contigo',
    'Diseñar timelines visuales por caso',
    'Planificar Fase 2: ingesta automática cada 48h',
  ];
}

export function buildCursorReport(
  rows: HistoricalDnaRow[],
  supabaseConnected: boolean,
  configured = false,
  error: string | null = null
): string {
  const lines: string[] = [
    '# TrendPulse — Informe para Cursor',
    `Fecha: ${new Date().toISOString()}`,
    `Fase: 1 — ADN histórico`,
    `Supabase: ${supabaseStatusLabel(supabaseConnected, configured, error)}`,
    `Casos cargados: ${rows.length}${!supabaseConnected ? ` (demo offline, máx. ${DEMO_SEED_COUNT})` : ''}`,
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

  lines.push('', '## Próximo paso sugerido');
  for (const step of nextSteps(supabaseConnected, configured, rows.length)) {
    lines.push(`- ${step}`);
  }

  return lines.join('\n');
}
