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

export type MaterialCurrency = 'EUR' | 'USD' | 'GBP' | 'CHF';

export type MaterialHandoverRole = 'coordinator' | 'coach' | 'facility_manager' | 'other';

export type ClubMaterialItem = {
  id: string;
  name: string;
  category: MaterialCategory;
  unit: MaterialUnit;
  sku: string | null;
  notes: string | null;
  currency_code: MaterialCurrency;
  unit_cost: number | null;
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

export type MaterialHandoverItem = {
  material_id: string;
  material_name: string;
  quantity: number;
  unit: MaterialUnit;
  unit_cost: number | null;
  currency_code: MaterialCurrency | null;
};

export type MaterialHandover = {
  id: string;
  club_id: string;
  season: string;
  recipient_name: string;
  recipient_role: MaterialHandoverRole;
  location_type: MaterialLocationType;
  location_id: string | null;
  location_label: string;
  handed_at: string;
  notes: string | null;
  items: MaterialHandoverItem[];
};

export type MaterialZoneValue = {
  location_type: MaterialLocationType;
  location_id: string | null;
  label: string;
  total_by_currency: Partial<Record<MaterialCurrency, number>>;
  total_value: number;
};

export const MATERIAL_CURRENCY_LABELS: Record<MaterialCurrency, string> = {
  EUR: 'Euro (€)',
  USD: 'Dólar ($)',
  GBP: 'Libra (£)',
  CHF: 'Franco suizo (CHF)',
};

export const MATERIAL_HANDOVER_ROLE_LABELS: Record<MaterialHandoverRole, string> = {
  coordinator: 'Coordinador/a',
  coach: 'Entrenador/a',
  facility_manager: 'Responsable de instalación',
  other: 'Otro responsable',
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
  'id, name, category, unit, sku, notes, currency_code, unit_cost, active';

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
    currency_code: 'EUR',
    unit_cost: 1.85,
    active: true,
  },
  {
    id: 'demo-material-balls-4',
    name: 'Balones talla 4',
    category: 'balls',
    unit: 'unit',
    sku: 'BALL-T4',
    notes: 'Categorías prebenjamín y benjamín.',
    currency_code: 'EUR',
    unit_cost: 24.5,
    active: true,
  },
  {
    id: 'demo-material-balls-5',
    name: 'Balones talla 5',
    category: 'balls',
    unit: 'unit',
    sku: 'BALL-T5',
    notes: 'Alevín en adelante.',
    currency_code: 'EUR',
    unit_cost: 28,
    active: true,
  },
  {
    id: 'demo-material-bibs',
    name: 'Petos reversible rojo/azul',
    category: 'bibs',
    unit: 'set',
    sku: 'BIB-RA',
    notes: 'Juego de 12 petos por set.',
    currency_code: 'EUR',
    unit_cost: 42,
    active: true,
  },
  {
    id: 'demo-material-goals',
    name: 'Porterías móviles F-7',
    category: 'goals',
    unit: 'pair',
    sku: 'GOAL-F7',
    notes: 'Pareja de porterías reglamentarias fútbol 7.',
    currency_code: 'EUR',
    unit_cost: 320,
    active: true,
  },
  {
    id: 'demo-material-medical',
    name: 'Botiquín deportivo',
    category: 'medical',
    unit: 'box',
    sku: 'MED-KIT',
    notes: 'Revisión trimestral.',
    currency_code: 'EUR',
    unit_cost: 65,
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

export function materialCurrencyOptions() {
  return (Object.keys(MATERIAL_CURRENCY_LABELS) as MaterialCurrency[]).map((currency) => ({
    value: currency,
    label: MATERIAL_CURRENCY_LABELS[currency],
  }));
}

export function materialHandoverRoleOptions() {
  return (Object.keys(MATERIAL_HANDOVER_ROLE_LABELS) as MaterialHandoverRole[]).map((role) => ({
    value: role,
    label: MATERIAL_HANDOVER_ROLE_LABELS[role],
  }));
}

export function formatMaterialMoney(
  amount: number | null | undefined,
  currency: MaterialCurrency = 'EUR'
): string {
  if (amount == null || Number.isNaN(amount)) return '—';
  return new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency,
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

export function lineImmobilizedValue(material: ClubMaterialItem, quantity: number): number {
  if (material.unit_cost == null || material.unit_cost <= 0) return 0;
  return material.unit_cost * quantity;
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

function zoneKey(locationType: MaterialLocationType, locationId: string | null): string {
  return `${locationType}:${locationId ?? 'club'}`;
}

export function immobilizedValueByZones(input: {
  materials: ClubMaterialItem[];
  stock: ClubMaterialStock[];
  teams: Array<{ id: string; name: string }>;
  facilities: Array<{ id: string; name: string }>;
}): MaterialZoneValue[] {
  const materialMap = materialsById(input.materials);
  const zones = new Map<string, MaterialZoneValue>();

  const ensureZone = (
    locationType: MaterialLocationType,
    locationId: string | null,
    label: string
  ) => {
    const key = zoneKey(locationType, locationId);
    if (!zones.has(key)) {
      zones.set(key, {
        location_type: locationType,
        location_id: locationId,
        label,
        total_by_currency: {},
        total_value: 0,
      });
    }
    return zones.get(key)!;
  };

  for (const row of input.stock) {
    const material = materialMap.get(row.material_id);
    if (!material) continue;
    const value = lineImmobilizedValue(material, row.quantity);
    if (value <= 0) continue;

    const label = locationLabel({
      location_type: row.location_type,
      location_id: row.location_id,
      teamName: input.teams.find((team) => team.id === row.location_id)?.name,
      facilityName: input.facilities.find((facility) => facility.id === row.location_id)?.name,
    });

    const zone = ensureZone(row.location_type, row.location_id, label);
    const currency = material.currency_code;
    zone.total_by_currency[currency] = (zone.total_by_currency[currency] ?? 0) + value;
    if (currency === 'EUR') zone.total_value += value;
  }

  const order: Record<MaterialLocationType, number> = { club: 0, team: 1, facility: 2 };
  return [...zones.values()].sort((a, b) => {
    const byType = order[a.location_type] - order[b.location_type];
    if (byType !== 0) return byType;
    return a.label.localeCompare(b.label, 'es');
  });
}

export function totalImmobilizedByCurrency(
  zones: MaterialZoneValue[]
): Partial<Record<MaterialCurrency, number>> {
  const totals: Partial<Record<MaterialCurrency, number>> = {};
  for (const zone of zones) {
    for (const [currency, amount] of Object.entries(zone.total_by_currency) as Array<
      [MaterialCurrency, number]
    >) {
      totals[currency] = (totals[currency] ?? 0) + amount;
    }
  }
  return totals;
}

export function currentSeasonLabel(date = new Date()): string {
  const year = date.getFullYear();
  const month = date.getMonth() + 1;
  const start = month >= 7 ? year : year - 1;
  return `${start}-${String(start + 1).slice(-2)}`;
}

export function handoverItemsFromStock(
  materials: ClubMaterialItem[],
  stock: ClubMaterialStock[],
  locationType: MaterialLocationType,
  locationId: string | null
): MaterialHandoverItem[] {
  const materialMap = materialsById(materials);
  return stock
    .filter(
      (row) =>
        row.location_type === locationType &&
        (row.location_id ?? null) === (locationId ?? null) &&
        row.quantity > 0
    )
    .flatMap((row) => {
      const material = materialMap.get(row.material_id);
      if (!material) return [];
      return [
        {
          material_id: material.id,
          material_name: material.name,
          quantity: row.quantity,
          unit: material.unit,
          unit_cost: material.unit_cost,
          currency_code: material.currency_code,
        },
      ];
    })
    .sort((a, b) => a.material_name.localeCompare(b.material_name, 'es'));
}

export function parseMaterialFromForm(formData: FormData) {
  const unitCostRaw = String(formData.get('unitCost') ?? '').trim();
  const unitCost = unitCostRaw ? Number.parseFloat(unitCostRaw.replace(',', '.')) : null;
  const currencyRaw = String(formData.get('currencyCode') ?? 'EUR').trim() as MaterialCurrency;

  return {
    name: String(formData.get('name') ?? '').trim(),
    category: String(formData.get('category') ?? '').trim() as MaterialCategory,
    unit: String(formData.get('unit') ?? 'unit').trim() as MaterialUnit,
    sku: String(formData.get('sku') ?? '').trim() || null,
    notes: String(formData.get('notes') ?? '').trim() || null,
    currency_code: MATERIAL_CURRENCY_LABELS[currencyRaw] ? currencyRaw : 'EUR',
    unit_cost:
      unitCost != null && Number.isFinite(unitCost) && unitCost >= 0 ? unitCost : null,
  };
}

export function todayDateInputValue(date = new Date()) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

export function parseHandoverDateInput(value: string): string {
  const raw = value.trim();
  if (!raw) return new Date().toISOString();
  const parsed = new Date(`${raw}T12:00:00`);
  return Number.isNaN(parsed.getTime()) ? new Date().toISOString() : parsed.toISOString();
}

export function parseMaterialHandoverFromForm(formData: FormData) {
  return {
    season: String(formData.get('season') ?? '').trim(),
    recipientName: String(formData.get('recipientName') ?? '').trim(),
    recipientRole: String(formData.get('recipientRole') ?? 'coach').trim() as MaterialHandoverRole,
    locationType: String(formData.get('locationType') ?? '').trim() as MaterialLocationType,
    locationId: String(formData.get('locationId') ?? '').trim() || null,
    locationLabel: String(formData.get('locationLabel') ?? '').trim(),
    handedAt: parseHandoverDateInput(String(formData.get('handedAt') ?? '')),
    notes: String(formData.get('notes') ?? '').trim() || null,
    itemsJson: String(formData.get('itemsJson') ?? '[]'),
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
