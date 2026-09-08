import {
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_UNIT_LABELS,
  stockByLocation,
  totalQuantityForMaterial,
  type ClubMaterialItem,
  type ClubMaterialStock,
} from '@/lib/club-material';

export type MaterialExportScope = 'total' | 'facility' | 'team';

export type MaterialExportRow = {
  material: string;
  category: string;
  sku: string;
  unit: string;
  quantity: number;
  location: string;
  unitCost: number | null;
  currency: string;
  lineValue: number | null;
};

export type MaterialExportSection = {
  title: string;
  rows: MaterialExportRow[];
};

function escapeCsvCell(value: string | number | null | undefined): string {
  const raw = value == null ? '' : String(value);
  if (/[;"\n\r]/.test(raw)) return `"${raw.replace(/"/g, '""')}"`;
  return raw;
}

export function buildMaterialExportRows(input: {
  scope: MaterialExportScope;
  valued: boolean;
  materials: ClubMaterialItem[];
  stock: ClubMaterialStock[];
  facilityId?: string | null;
  teamId?: string | null;
  facilityName?: string;
  teamName?: string;
}): MaterialExportRow[] {
  if (input.scope === 'total') {
    const rows: MaterialExportRow[] = [];
    for (const material of input.materials) {
      const quantity = totalQuantityForMaterial(material.id, input.stock);
      if (quantity <= 0) continue;
      const lineValue =
        input.valued && material.unit_cost != null ? material.unit_cost * quantity : null;
      rows.push({
        material: material.name,
        category: MATERIAL_CATEGORY_LABELS[material.category],
        sku: material.sku ?? '',
        unit: MATERIAL_UNIT_LABELS[material.unit],
        quantity,
        location: 'Total club',
        unitCost: input.valued ? material.unit_cost : null,
        currency: material.currency_code,
        lineValue,
      });
    }
    return rows.sort((a, b) => a.material.localeCompare(b.material, 'es'));
  }

  if (input.scope === 'facility' && input.facilityId) {
    return stockByLocation('facility', input.facilityId, input.materials, input.stock).map(
      (row) => ({
        material: row.material.name,
        category: MATERIAL_CATEGORY_LABELS[row.material.category],
        sku: row.material.sku ?? '',
        unit: MATERIAL_UNIT_LABELS[row.material.unit],
        quantity: row.quantity,
        location: input.facilityName ?? 'Instalación',
        unitCost: input.valued ? row.material.unit_cost : null,
        currency: row.material.currency_code,
        lineValue:
          input.valued && row.material.unit_cost != null
            ? row.material.unit_cost * row.quantity
            : null,
      })
    );
  }

  if (input.scope === 'team' && input.teamId) {
    return stockByLocation('team', input.teamId, input.materials, input.stock).map((row) => ({
      material: row.material.name,
      category: MATERIAL_CATEGORY_LABELS[row.material.category],
      sku: row.material.sku ?? '',
      unit: MATERIAL_UNIT_LABELS[row.material.unit],
      quantity: row.quantity,
      location: input.teamName ?? 'Equipo',
      unitCost: input.valued ? row.material.unit_cost : null,
      currency: row.material.currency_code,
      lineValue:
        input.valued && row.material.unit_cost != null
          ? row.material.unit_cost * row.quantity
          : null,
    }));
  }

  return [];
}

export function buildFacilitiesExportSections(input: {
  valued: boolean;
  materials: ClubMaterialItem[];
  stock: ClubMaterialStock[];
  facilities: { id: string; name: string }[];
  facilityIds: string[];
}): MaterialExportSection[] {
  const selectedIds = new Set(input.facilityIds);
  const facilities = input.facilities.filter((facility) => selectedIds.has(facility.id));

  return facilities
    .map((facility) => ({
      title: facility.name,
      rows: stockByLocation('facility', facility.id, input.materials, input.stock).map((row) => ({
        material: row.material.name,
        category: MATERIAL_CATEGORY_LABELS[row.material.category],
        sku: row.material.sku ?? '',
        unit: MATERIAL_UNIT_LABELS[row.material.unit],
        quantity: row.quantity,
        location: facility.name,
        unitCost: input.valued ? row.material.unit_cost : null,
        currency: row.material.currency_code,
        lineValue:
          input.valued && row.material.unit_cost != null
            ? row.material.unit_cost * row.quantity
            : null,
      })),
    }))
    .filter((section) => section.rows.length > 0);
}

function rowToCsvCells(row: MaterialExportRow, valued: boolean): string[] {
  const base = [
    row.material,
    row.category,
    row.sku,
    row.unit,
    String(row.quantity),
    row.location,
  ];
  if (!valued) return base;
  return [
    ...base,
    row.unitCost != null ? row.unitCost.toFixed(2).replace('.', ',') : '',
    row.currency,
    row.lineValue != null ? row.lineValue.toFixed(2).replace('.', ',') : '',
  ];
}

export function materialExportToCsv(rows: MaterialExportRow[], valued: boolean): string {
  const headers = valued
    ? [
        'Material',
        'Categoría',
        'SKU',
        'Unidad',
        'Cantidad',
        'Ubicación',
        'Coste unitario',
        'Moneda',
        'Valor línea',
      ]
    : ['Material', 'Categoría', 'SKU', 'Unidad', 'Cantidad', 'Ubicación'];

  const lines = [
    headers.join(';'),
    ...rows.map((row) => rowToCsvCells(row, valued).map(escapeCsvCell).join(';')),
  ];

  return `\uFEFF${lines.join('\r\n')}`;
}

export function materialExportSectionsToCsv(
  sections: MaterialExportSection[],
  valued: boolean
): string {
  const headers = valued
    ? [
        'Material',
        'Categoría',
        'SKU',
        'Unidad',
        'Cantidad',
        'Ubicación',
        'Coste unitario',
        'Moneda',
        'Valor línea',
      ]
    : ['Material', 'Categoría', 'SKU', 'Unidad', 'Cantidad', 'Ubicación'];

  const lines: string[] = [];
  for (const section of sections) {
    if (lines.length > 0) lines.push('');
    lines.push(escapeCsvCell(`INSTALACIÓN: ${section.title}`));
    lines.push(headers.join(';'));
    for (const row of section.rows) {
      lines.push(rowToCsvCells(row, valued).map(escapeCsvCell).join(';'));
    }
  }

  return `\uFEFF${lines.join('\r\n')}`;
}

export function downloadMaterialCsv(filename: string, csv: string) {
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}
