export type MaterialCategory =
  | 'balls'
  | 'cones'
  | 'goals'
  | 'bibs'
  | 'hurdles'
  | 'medical'
  | 'storage'
  | 'other';

export type MaterialUnit = 'unit' | 'pair' | 'set' | 'box';

export type MaterialLocationType = 'club' | 'team' | 'facility';

export type ClubMaterialItem = {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  sku: string | null;
  notes: string | null;
  active: boolean;
};

export type ClubMaterialStock = {
  id: string;
  material_id: string;
  location_type: MaterialLocationType;
  location_id: string | null;
  quantity: number;
  notes: string | null;
};

export type MaterialInventoryRow = {
  stockId: string;
  material: ClubMaterialItem;
  quantity: number;
  notes: string | null;
};

export const MATERIAL_CATEGORY_LABELS: Record<MaterialCategory, string> = {
  balls: 'Balones',
  cones: 'Conos',
  goals: 'Porterías',
  bibs: 'Petos / chalecos',
  hurdles: 'Vallas / escaleras',
  medical: 'Material médico',
  storage: 'Almacén general',
  other: 'Otro',
};

export const MATERIAL_UNIT_LABELS: Record<MaterialUnit, string> = {
  unit: 'Unidades',
  pair: 'Pares',
  set: 'Juegos',
  box: 'Cajas',
};

export const MATERIAL_SELECT =
  'id, name, category, unit, sku, notes, active';

export const MATERIAL_STOCK_SELECT =
  'id, material_id, location_type, location_id, quantity, notes';

export const DEMO_CLUB_MATERIALS: ClubMaterialItem[] = [
  {
    id: 'demo-material-cones',
    name: 'Conos de entrenamiento',
    category: 'cones',
    unit: 'unit',
    sku: 'CONE-ORANGE',
    notes: 'Conos rígidos 23 cm, color naranja.',
    active: true,
  },
  {
    id: 'demo-material-balls-4',
    name: 'Balones talla 4',
    category: 'balls',
    unit: 'unit',
    sku: 'BALL-T4',
    notes: 'Categorías prebenjamín y benjamín.',
    active: true,
  },
  {
    id: 'demo-material-balls-5',
    name: 'Balones talla 5',
    category: 'balls',
    unit: 'unit',
    sku: 'BALL-T5',
    notes: 'Alevín en adelante.',
    active: true,
  },
  {
    id: 'demo-material-bibs',
    name: 'Petos reversible rojo/azul',
    category: 'bibs',
    unit: 'set',
    sku: 'BIB-RA',
    notes: 'Juego de 12 petos por set.',
    active: true,
  },
  {
    id: 'demo-material-goals',
    name: 'Porterías móviles F-7',
    category: 'goals',
    unit: 'pair',
    sku: 'GOAL-F7',
    notes: 'Pareja de porterías reglamentarias fútbol 7.',
    active: true,
  },
  {
    id: 'demo-material-medical',
    name: 'Botiquín deportivo',
    category: 'medical',
    unit: 'box',
    sku: 'MED-KIT',
    notes: 'Revisión trimestral.',
    active: true,
  },
];

export const DEMO_CLUB_MATERIAL_STOCK: ClubMaterialStock[] = [
  {
    id: 'demo-stock-cones-club',
    material_id: 'demo-material-cones',
    location_type: 'club',
    location_id: null,
    quantity: 50,
    notes: 'Almacén central',
  },
  {
    id: 'demo-stock-cones-main',
    material_id: 'demo-material-cones',
    location_type: 'facility',
    location_id: 'demo-facility-main',
    quantity: 40,
    notes: 'Caja junto al banquillo',
  },
  {
    id: 'demo-stock-cones-prebenjamin',
    material_id: 'demo-material-cones',
    location_type: 'team',
    location_id: 'demo-team-prebenjamin-a',
    quantity: 30,
    notes: null,
  },
  {
    id: 'demo-stock-balls4-club',
    material_id: 'demo-material-balls-4',
    location_type: 'club',
    location_id: null,
    quantity: 10,
    notes: null,
  },
  {
    id: 'demo-stock-balls4-prebenjamin',
    material_id: 'demo-material-balls-4',
    location_type: 'team',
    location_id: 'demo-team-prebenjamin-a',
    quantity: 12,
    notes: null,
  },
  {
    id: 'demo-stock-balls4-annex',
    material_id: 'demo-material-balls-4',
    location_type: 'facility',
    location_id: 'demo-facility-annex',
    quantity: 8,
    notes: null,
  },
  {
    id: 'demo-stock-balls5-club',
    material_id: 'demo-material-balls-5',
    location_type: 'club',
    location_id: null,
    quantity: 15,
    notes: null,
  },
  {
    id: 'demo-stock-balls5-alevin',
    material_id: 'demo-material-balls-5',
    location_type: 'team',
    location_id: 'demo-team-alevin-a',
    quantity: 14,
    notes: null,
  },
  {
    id: 'demo-stock-bibs-club',
    material_id: 'demo-material-bibs',
    location_type: 'club',
    location_id: null,
    quantity: 4,
    notes: '4 juegos en almacén',
  },
  {
    id: 'demo-stock-bibs-main',
    material_id: 'demo-material-bibs',
    location_type: 'facility',
    location_id: 'demo-facility-main',
    quantity: 2,
    notes: null,
  },
  {
    id: 'demo-stock-goals-main',
    material_id: 'demo-material-goals',
    location_type: 'facility',
    location_id: 'demo-facility-main',
    quantity: 2,
    notes: '1 pareja desplegada',
  },
  {
    id: 'demo-stock-goals-annex',
    material_id: 'demo-material-goals',
    location_type: 'facility',
    location_id: 'demo-facility-annex',
    quantity: 1,
    notes: null,
  },
  {
    id: 'demo-stock-medical-club',
    material_id: 'demo-material-medical',
    location_type: 'club',
    location_id: null,
    quantity: 3,
    notes: null,
  },
  {
    id: 'demo-stock-medical-main',
    material_id: 'demo-material-medical',
    location_type: 'facility',
    location_id: 'demo-facility-main',
    quantity: 1,
    notes: 'Botiquín fijo en vestuario',
  },
];

export function materialCategoryOptions() {
  return (Object.keys(MATERIAL_CATEGORY_LABELS) as MaterialCategory[]).map((category) => ({
    value: category,
    label: MATERIAL_CATEGORY_LABELS[category],
  }));
}

export function materialUnitOptions() {
  return (Object.keys(MATERIAL_UNIT_LABELS) as MaterialUnit[]).map((unit) => ({
    value: unit,
    label: MATERIAL_UNIT_LABELS[unit],
  }));
}

export function materialsById(items: ClubMaterialItem[]): Map<string, ClubMaterialItem> {
  return new Map(items.map((item) => [item.id, item]));
}

export function stockForMaterial(materialId: string, stock: ClubMaterialStock[]): ClubMaterialStock[] {
  return stock.filter((row) => row.material_id === materialId);
}

export function totalQuantityForMaterial(materialId: string, stock: ClubMaterialStock[]): number {
  return stockForMaterial(materialId, stock).reduce((sum, row) => sum + row.quantity, 0);
}

export function stockByLocation(
  locationType: MaterialLocationType,
  locationId: string | null,
  materials: ClubMaterialItem[],
  stock: ClubMaterialStock[]
): MaterialInventoryRow[] {
  const materialMap = materialsById(materials);
  return stock
    .filter(
      (row) =>
        row.location_type === locationType &&
        (row.location_id ?? null) === (locationId ?? null)
    )
    .map((row) => {
      const material = materialMap.get(row.material_id);
      if (!material) return null;
      return {
        stockId: row.id,
        material,
        quantity: row.quantity,
        notes: row.notes,
      };
    })
    .filter((row): row is MaterialInventoryRow => row != null)
    .sort((a, b) => a.material.name.localeCompare(b.material.name, 'es'));
}

export function locationLabel(input: {
  location_type: MaterialLocationType;
  location_id: string | null;
  teamName?: string;
  facilityName?: string;
}): string {
  if (input.location_type === 'club') return 'Almacén del club';
  if (input.location_type === 'team') return input.teamName ?? 'Equipo';
  return input.facilityName ?? 'Instalación';
}

export function parseMaterialFromForm(formData: FormData) {
  return {
    name: String(formData.get('name') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim() as MaterialCategory,
    unit: String(formData.get('unit') ?? 'unit').trim() as MaterialUnit,
    sku: String(formData.get('sku') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
  };
}

export function parseMaterialStockFromForm(formData: FormData) {
  const locationType = String(formData.get('locationType') ?? '').trim() as MaterialLocationType;
  const locationIdRaw = String(formData.get('locationId') ?? '').trim();
  return {
    materialId: String(formData.get('materialId') ?? '').trim(),
    locationType,
    locationId: locationType === 'club' ? null : locationIdRaw || null,
    quantity: Number(formData.get('quantity') ?? 0),
    notes: String(formData.get('notes') ?? '').trim() || null,
  };
}
