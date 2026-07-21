import {
  type MaterialHandover,
  type MaterialHandoverItem,
} from '@/lib/club-material';

const DEMO_HANDOVER_ITEMS: MaterialHandoverItem[] = [
  {
    material_id: 'demo-material-cones',
    material_name: 'Conos de entrenamiento',
    quantity: 30,
    unit: 'unit',
    unit_cost: 1.85,
    currency_code: 'EUR',
  },
  {
    material_id: 'demo-material-balls-4',
    material_name: 'Balones talla 4',
    quantity: 12,
    unit: 'unit',
    unit_cost: 24.5,
    currency_code: 'EUR',
  },
];

export const DEMO_MATERIAL_HANDOVERS: MaterialHandover[] = [
  {
    id: 'demo-handover-prebenjamin',
    club_id: 'demo-club',
    season: '2025-26',
    recipient_name: 'Carlos Ruiz',
    recipient_role: 'coach',
    location_type: 'team',
    location_id: 'demo-team-prebenjamin-a',
    location_label: 'Prebenjamín A',
    handed_at: '2025-09-01T09:00:00.000Z',
    notes: 'Entrega de inicio de temporada.',
    items: DEMO_HANDOVER_ITEMS,
  },
];

let demoHandovers: MaterialHandover[] = [...DEMO_MATERIAL_HANDOVERS];

export function getDemoMaterialHandovers(): MaterialHandover[] {
  return [...demoHandovers];
}

export function addDemoMaterialHandover(handover: MaterialHandover): void {
  demoHandovers = [handover, ...demoHandovers];
}

export function getDemoMaterialHandoverById(id: string): MaterialHandover | undefined {
  return demoHandovers.find((item) => item.id === id);
}
