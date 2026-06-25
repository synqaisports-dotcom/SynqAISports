export type SupplierTier = 'factory' | 'wholesale' | 'retail_reference';

export type SupplierSource = {
  id: string;
  name: string;
  tier: SupplierTier;
  /** Enlace búsqueda o catálogo B2B */
  catalog_url: string;
  /** Multiplicador sobre precio AliExpress retail → precio fuente estimado */
  price_factor: number;
  note: string;
};

export const TIER_LABELS: Record<SupplierTier, string> = {
  factory: 'Fuente directa',
  wholesale: 'Mayorista',
  retail_reference: 'Solo referencia retail',
};

export const TIER_ORDER: SupplierTier[] = ['factory', 'wholesale', 'retail_reference'];
