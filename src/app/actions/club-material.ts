'use server';

import { requireClubId, requireUserId } from '@/lib/auth-staff';
import { isDemoActive } from '@/lib/demo';
import {
  DEMO_CLUB_MATERIALS,
  DEMO_CLUB_MATERIAL_STOCK,
  MATERIAL_SELECT,
  MATERIAL_STOCK_SELECT,
  parseMaterialFromForm,
  parseMaterialHandoverFromForm,
  parseMaterialStockFromForm,
  type ClubMaterialItem,
  type ClubMaterialStock,
  type MaterialHandover,
  type MaterialHandoverItem,
  type MaterialHandoverRole,
} from '@/lib/club-material';
import {
  addDemoMaterialHandover,
  getDemoMaterialHandovers,
  getDemoMaterialHandoverById,
} from '@/lib/demo-material-handovers-store';
import { createClient } from '@/lib/supabase/server';
import { revalidatePath } from 'next/cache';

export type MaterialActionState = {
  ok: boolean;
  message?: string;
  materialId?: string;
  stockId?: string;
  handoverId?: string;
};

function mapMaterialRow(row: Record<string, unknown>): ClubMaterialItem {
  const currency = String(row.currency_code ?? 'EUR');
  return {
    id: String(row.id),
    name: String(row.name),
    category: row.category as ClubMaterialItem['category'],
    unit: row.unit as ClubMaterialItem['unit'],
    sku: row.sku ? String(row.sku) : null,
    notes: row.notes ? String(row.notes) : null,
    currency_code:
      currency === 'EUR' || currency === 'USD' || currency === 'GBP' || currency === 'CHF'
        ? currency
        : 'EUR',
    unit_cost: row.unit_cost != null ? Number(row.unit_cost) : null,
    active: row.active !== false,
  };
}

function mapStockRow(row: Record<string, unknown>): ClubMaterialStock {
  return {
    id: String(row.id),
    material_id: String(row.material_id),
    location_type: row.location_type as ClubMaterialStock['location_type'],
    location_id: row.location_id ? String(row.location_id) : null,
    quantity: Number(row.quantity ?? 0),
    notes: row.notes ? String(row.notes) : null,
  };
}

function revalidateMaterialPaths() {
  revalidatePath('/portal/club/material');
}

export async function loadClubMaterials(
  clubId: string,
  options?: { includeInactive?: boolean }
): Promise<ClubMaterialItem[]> {
  if (await isDemoActive()) return DEMO_CLUB_MATERIALS;

  const supabase = await createClient();
  let query = supabase
    .from('synq_club_materials')
    .select(MATERIAL_SELECT)
    .eq('club_id', clubId)
    .order('name');

  if (!options?.includeInactive) {
    query = query.eq('active', true);
  }

  const { data, error } = await query;
  if (error) {
    console.error('loadClubMaterials', error);
    return [];
  }

  return (data ?? []).map((row) => mapMaterialRow(row as Record<string, unknown>));
}

export async function loadClubMaterialStock(clubId: string): Promise<ClubMaterialStock[]> {
  if (await isDemoActive()) return DEMO_CLUB_MATERIAL_STOCK;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_club_material_stock')
    .select(MATERIAL_STOCK_SELECT)
    .eq('club_id', clubId);

  if (error) {
    console.error('loadClubMaterialStock', error);
    return [];
  }

  return (data ?? []).map((row) => mapStockRow(row as Record<string, unknown>));
}

export async function createMaterial(
  _prev: MaterialActionState,
  formData: FormData
): Promise<MaterialActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const parsed = parseMaterialFromForm(formData);
  if (!parsed.name || !parsed.category) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    revalidateMaterialPaths();
    return { ok: true, message: 'demo', materialId: 'demo-material-new' };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_club_materials')
    .insert({ club_id: clubId, ...parsed })
    .select('id')
    .single();

  if (error || !data) {
    console.error('createMaterial', error);
    return { ok: false, message: 'error' };
  }

  revalidateMaterialPaths();
  return { ok: true, materialId: String(data.id) };
}

export async function updateMaterial(
  materialId: string,
  _prev: MaterialActionState,
  formData: FormData
): Promise<MaterialActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const parsed = parseMaterialFromForm(formData);
  if (!parsed.name || !parsed.category) return { ok: false, message: 'validation' };

  if (await isDemoActive()) {
    revalidateMaterialPaths();
    return { ok: true, message: 'demo', materialId };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_club_materials')
    .update(parsed)
    .eq('id', materialId)
    .eq('club_id', clubId);

  if (error) {
    console.error('updateMaterial', error);
    return { ok: false, message: 'error' };
  }

  revalidateMaterialPaths();
  return { ok: true, materialId };
}

export async function upsertMaterialStock(
  _prev: MaterialActionState,
  formData: FormData
): Promise<MaterialActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const stockId = String(formData.get('stockId') ?? '').trim();
  const parsed = parseMaterialStockFromForm(formData);
  if (!parsed.materialId || !parsed.locationType || parsed.quantity < 0) {
    return { ok: false, message: 'validation' };
  }
  if (parsed.locationType !== 'club' && !parsed.locationId) {
    return { ok: false, message: 'validation' };
  }

  if (await isDemoActive()) {
    revalidateMaterialPaths();
    return { ok: true, message: 'demo', stockId: stockId || 'demo-stock-new' };
  }

  const supabase = await createClient();
  const payload = {
    club_id: clubId,
    material_id: parsed.materialId,
    location_type: parsed.locationType,
    location_id: parsed.locationId,
    quantity: parsed.quantity,
    notes: parsed.notes,
  };

  if (stockId) {
    const { error } = await supabase
      .from('synq_club_material_stock')
      .update(payload)
      .eq('id', stockId)
      .eq('club_id', clubId);
    if (error) {
      console.error('upsertMaterialStock update', error);
      return { ok: false, message: 'error' };
    }
    revalidateMaterialPaths();
    return { ok: true, stockId };
  }

  const { data, error } = await supabase
    .from('synq_club_material_stock')
    .insert(payload)
    .select('id')
    .single();

  if (error || !data) {
    console.error('upsertMaterialStock insert', error);
    return { ok: false, message: 'error' };
  }

  revalidateMaterialPaths();
  return { ok: true, stockId: String(data.id) };
}

export async function toggleMaterialActive(
  materialId: string,
  active: boolean
): Promise<MaterialActionState> {
  const clubId = await requireClubId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  if (await isDemoActive()) {
    revalidateMaterialPaths();
    return { ok: true, message: 'demo' };
  }

  const supabase = await createClient();
  const { error } = await supabase
    .from('synq_club_materials')
    .update({ active })
    .eq('id', materialId)
    .eq('club_id', clubId);

  if (error) {
    console.error('toggleMaterialActive', error);
    return { ok: false, message: 'error' };
  }

  revalidateMaterialPaths();
  return { ok: true };
}

function mapHandoverRow(row: Record<string, unknown>): MaterialHandover {
  return {
    id: String(row.id),
    club_id: String(row.club_id),
    season: String(row.season),
    recipient_name: String(row.recipient_name),
    recipient_role: row.recipient_role as MaterialHandoverRole,
    location_type: row.location_type as MaterialHandover['location_type'],
    location_id: row.location_id ? String(row.location_id) : null,
    location_label: String(row.location_label),
    handed_at: String(row.handed_at),
    notes: row.notes ? String(row.notes) : null,
    items: Array.isArray(row.items_json)
      ? (row.items_json as MaterialHandoverItem[])
      : [],
  };
}

export async function loadClubMaterialHandovers(clubId: string): Promise<MaterialHandover[]> {
  if (await isDemoActive()) return getDemoMaterialHandovers();

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_club_material_handovers')
    .select(
      'id, club_id, season, recipient_name, recipient_role, location_type, location_id, location_label, handed_at, notes, items_json'
    )
    .eq('club_id', clubId)
    .order('handed_at', { ascending: false });

  if (error) {
    console.error('loadClubMaterialHandovers', error);
    return [];
  }

  return (data ?? []).map((row) => mapHandoverRow(row as Record<string, unknown>));
}

export async function loadMaterialHandoverById(
  clubId: string,
  handoverId: string
): Promise<MaterialHandover | null> {
  if (await isDemoActive()) return getDemoMaterialHandoverById(handoverId) ?? null;

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_club_material_handovers')
    .select(
      'id, club_id, season, recipient_name, recipient_role, location_type, location_id, location_label, handed_at, notes, items_json'
    )
    .eq('club_id', clubId)
    .eq('id', handoverId)
    .maybeSingle();

  if (error || !data) {
    console.error('loadMaterialHandoverById', error);
    return null;
  }

  return mapHandoverRow(data as Record<string, unknown>);
}

export async function createMaterialHandover(
  _prev: MaterialActionState,
  formData: FormData
): Promise<MaterialActionState> {
  const clubId = await requireClubId();
  const userId = await requireUserId();
  if (!clubId) return { ok: false, message: 'unauthorized' };

  const parsed = parseMaterialHandoverFromForm(formData);
  if (!parsed.season || !parsed.recipientName || !parsed.locationType || !parsed.locationLabel) {
    return { ok: false, message: 'validation' };
  }

  let items: MaterialHandoverItem[] = [];
  try {
    items = JSON.parse(parsed.itemsJson) as MaterialHandoverItem[];
  } catch {
    return { ok: false, message: 'validation' };
  }
  if (items.length === 0) return { ok: false, message: 'validation' };

  const locationId = parsed.locationType === 'club' ? null : parsed.locationId;

  if (await isDemoActive()) {
    const handoverId = `demo-handover-${Date.now()}`;
    addDemoMaterialHandover({
      id: handoverId,
      club_id: clubId,
      season: parsed.season,
      recipient_name: parsed.recipientName,
      recipient_role: parsed.recipientRole,
      location_type: parsed.locationType,
      location_id: locationId,
      location_label: parsed.locationLabel,
      handed_at: new Date().toISOString(),
      notes: parsed.notes,
      items,
    });
    revalidateMaterialPaths();
    revalidatePath(`/print/material/entrega/${handoverId}`);
    return { ok: true, message: 'demo', handoverId };
  }

  const supabase = await createClient();
  const { data, error } = await supabase
    .from('synq_club_material_handovers')
    .insert({
      club_id: clubId,
      season: parsed.season,
      recipient_name: parsed.recipientName,
      recipient_role: parsed.recipientRole,
      location_type: parsed.locationType,
      location_id: locationId,
      location_label: parsed.locationLabel,
      notes: parsed.notes,
      items_json: items,
      created_by: userId,
    })
    .select('id')
    .single();

  if (error || !data) {
    console.error('createMaterialHandover', error);
    return { ok: false, message: 'error' };
  }

  const handoverId = String(data.id);
  revalidateMaterialPaths();
  revalidatePath(`/print/material/entrega/${handoverId}`);
  return { ok: true, handoverId };
}
