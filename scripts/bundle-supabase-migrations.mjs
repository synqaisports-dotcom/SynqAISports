#!/usr/bin/env node
/**
 * Concatena todas las migraciones de supabase/migrations/ en un solo SQL
 * para pegar en el SQL Editor de Supabase (proyecto nuevo desde cero).
 *
 * Uso: npm run supabase:bundle
 * Salida: supabase/.bundle/full_schema.sql
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const migrationsDir = path.join(root, 'supabase', 'migrations');
const outDir = path.join(root, 'supabase', '.bundle');
const outFile = path.join(outDir, 'full_schema.sql');

const files = fs
  .readdirSync(migrationsDir)
  .filter((name) => name.endsWith('.sql'))
  .sort((a, b) => a.localeCompare(b));

if (files.length === 0) {
  console.error('No hay archivos .sql en supabase/migrations/');
  process.exit(1);
}

const header = `-- SynqAI Sports — esquema completo (generado automáticamente)
-- Fecha: ${new Date().toISOString()}
-- Migraciones: ${files.length}
-- NO editar a mano; regenerar con: npm run supabase:bundle
--
-- Ejecutar en SQL Editor de un proyecto Supabase NUEVO y vacío.
-- Después: supabase/seed/001_demo_club.sql (opcional, modo demo)

`;

const body = files
  .map((name, index) => {
    const sql = fs.readFileSync(path.join(migrationsDir, name), 'utf8').trim();
    return `-- ─────────────────────────────────────────────────────────────\n-- ${index + 1}/${files.length}  ${name}\n-- ─────────────────────────────────────────────────────────────\n\n${sql}\n`;
  })
  .join('\n');

fs.mkdirSync(outDir, { recursive: true });
fs.writeFileSync(outFile, header + body, 'utf8');

console.log(`✓ ${files.length} migraciones → ${path.relative(root, outFile)}`);
