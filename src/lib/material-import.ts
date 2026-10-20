import {
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_CURRENCY_LABELS,
  MATERIAL_UNIT_LABELS,
  type MaterialCategory,
  type MaterialCurrency,
  type MaterialUnit,
} from '@/lib/club-material';

export type MaterialImportRow = {
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  sku: string | null;
  currency_code: MaterialCurrency;
  unit_cost: number | null;
  notes: string | null;
};

export type MaterialImportParseResult = {
  rows: MaterialImportRow[];
  errors: { line: number; message: string }[];
};

const IMPORT_HEADERS = [
  'Nombre',
  'Categoría',
  'SKU',
  'Unidad',
  'Moneda',
  'Coste unitario',
  'Notas',
] as const;

function normalizeHeader(value: string) {
  return value
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

function parseDecimal(value: string): number | null {
  const raw = value.trim();
  if (!raw) return null;
  const normalized = raw.replace(/\./g, '').replace(',', '.');
  const parsed = Number.parseFloat(normalized);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : null;
}

function categoryFromLabel(label: string): MaterialCategory | null {
  const normalized = label.trim().toLowerCase();
  const entry = (Object.entries(MATERIAL_CATEGORY_LABELS) as [MaterialCategory, string][]).find(
    ([, value]) => value.toLowerCase() === normalized
  );
  if (entry) return entry[0];
  if (normalized in MATERIAL_CATEGORY_LABELS) return normalized as MaterialCategory;
  return null;
}

function unitFromLabel(label: string): MaterialUnit | null {
  const normalized = label.trim().toLowerCase();
  const entry = (Object.entries(MATERIAL_UNIT_LABELS) as [MaterialUnit, string][]).find(
    ([, value]) => value.toLowerCase() === normalized
  );
  if (entry) return entry[0];
  if (normalized in MATERIAL_UNIT_LABELS) return normalized as MaterialUnit;
  return null;
}

function currencyFromLabel(label: string): MaterialCurrency {
  const normalized = label.trim().toUpperCase();
  if (normalized in MATERIAL_CURRENCY_LABELS) return normalized as MaterialCurrency;
  const entry = (Object.entries(MATERIAL_CURRENCY_LABELS) as [MaterialCurrency, string][]).find(
    ([, value]) => value.toLowerCase().includes(normalized.toLowerCase())
  );
  return entry?.[0] ?? 'EUR';
}

function splitCsvLine(line: string): string[] {
  const cells: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let index = 0; index < line.length; index += 1) {
    const char = line[index];
    if (char === '"') {
      if (inQuotes && line[index + 1] === '"') {
        current += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }
    if (char === ';' && !inQuotes) {
      cells.push(current);
      current = '';
      continue;
    }
    current += char;
  }

  cells.push(current);
  return cells;
}

function parseCsvRows(content: string): string[][] {
  return content
    .replace(/^\uFEFF/, '')
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter((line) => line.length > 0)
    .map(splitCsvLine);
}

export function materialImportTemplateCsv(): string {
  const example = [
    'Conos de entrenamiento',
    MATERIAL_CATEGORY_LABELS.cones,
    'CON-001',
    MATERIAL_UNIT_LABELS.unit,
    'EUR',
    '1,50',
    'Set básico de conos',
  ];
  return `\uFEFF${IMPORT_HEADERS.join(';')}\r\n${example.join(';')}`;
}

export function parseMaterialImportCsv(content: string): MaterialImportParseResult {
  const table = parseCsvRows(content);
  if (table.length === 0) {
    return { rows: [], errors: [{ line: 1, message: 'El archivo está vacío.' }] };
  }

  const header = table[0].map(normalizeHeader);
  const headerIndex = new Map(header.map((cell, index) => [cell, index]));
  const nameIndex = headerIndex.get('nombre');
  const categoryIndex = headerIndex.get('categoria');
  const skuIndex = headerIndex.get('sku');
  const unitIndex = headerIndex.get('unidad');
  const currencyIndex = headerIndex.get('moneda');
  const costIndex = headerIndex.get('coste unitario');
  const notesIndex = headerIndex.get('notas');

  if (nameIndex == null || categoryIndex == null) {
    return {
      rows: [],
      errors: [
        {
          line: 1,
          message: 'Cabecera inválida. Usa: Nombre, Categoría, SKU, Unidad, Moneda, Coste unitario, Notas.',
        },
      ],
    };
  }

  const rows: MaterialImportRow[] = [];
  const errors: { line: number; message: string }[] = [];

  for (let lineNumber = 2; lineNumber <= table.length; lineNumber += 1) {
    const cells = table[lineNumber - 1];
    const name = String(cells[nameIndex] ?? '').trim();
    if (!name) continue;

    const categoryLabel = String(cells[categoryIndex] ?? '').trim();
    const category = categoryFromLabel(categoryLabel);
    if (!category) {
      errors.push({ line: lineNumber, message: `Categoría no reconocida: "${categoryLabel}".` });
      continue;
    }

    const unitLabel = String(cells[unitIndex ?? -1] ?? MATERIAL_UNIT_LABELS.unit).trim();
    const unit = unitFromLabel(unitLabel) ?? 'unit';

    rows.push({
      name,
      category,
      unit,
      sku: String(cells[skuIndex ?? -1] ?? '').trim() || null,
      currency_code: currencyFromLabel(String(cells[currencyIndex ?? -1] ?? 'EUR')),
      unit_cost: parseDecimal(String(cells[costIndex ?? -1] ?? '')),
      notes: String(cells[notesIndex ?? -1] ?? '').trim() || null,
    });
  }

  return { rows, errors };
}

export function downloadMaterialImportTemplate() {
  const csv = materialImportTemplateCsv();
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = 'plantilla-importacion-material.csv';
  anchor.click();
  URL.revokeObjectURL(url);
}
