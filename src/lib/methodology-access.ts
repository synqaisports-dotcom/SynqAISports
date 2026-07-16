/** Roles que pueden crear y modificar metodología (ciclos, ejercicios, objetivos…). */
export const METHODOLOGY_EDITOR_ROLES = new Set([
  'admin',
  'president',
  'sport_director',
  'methodology',
]);

export function canEditMethodology(role: string): boolean {
  return METHODOLOGY_EDITOR_ROLES.has(role);
}

export function methodologyReadOnlyLabel(role: string): string | null {
  if (canEditMethodology(role)) return null;
  return 'Solo lectura — tu rol puede consultar metodología pero no modificarla.';
}
