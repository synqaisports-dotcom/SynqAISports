import {
  MATERIAL_CATEGORY_LABELS,
  MATERIAL_UNIT_LABELS,
  materialsById,
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
  const materialMap = materialsById(input.materials);

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
    ...rows.map((row) => {
      const base = [
        row.material,
        row.category,
        row.sku,
        row.unit,
        row.quantity,
        row.location,
      ];
      if (!valued) return base.map(escapeCsvCell).join(';');
      return [
        ...base,
        row.unitCost != null ? row.unitCost.toFixed(2).replace('.', ',') : '',
        row.currency,
        row.lineValue != null ? row.lineValue.toFixed(2).replace('.', ',') : '',
      ]
        .map(escapeCsvCell)
        .join(';');
    }),
  ];

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
