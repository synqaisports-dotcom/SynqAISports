import type { UserRole } from "@/lib/supabase";

/**
 * Roles que existen en `profiles.role` (Postgres / Supabase).
 * Roles adicionales pueden existir en `synq_roles` (custom) — usar `getRoleLabel` / catálogo API.
 */
export type RoleCatalogEntry = {
  id: UserRole;
  label: string;
  shortLabel: string;
  description: string;
  /** No editable: rol de sistema */
  systemLocked: boolean;
};

export const ROLE_CATALOG: RoleCatalogEntry[] = [
  {
    id: "superadmin",
    label: "Superadmin",
    shortLabel: "Núcleo global",
    description: "Acceso total al admin-global, analytics y operaciones de red.",
    systemLocked: true,
  },
  {
    id: "club_admin",
    label: "Administrador del club",
    shortLabel: "Club",
    description: "Gestión del club, usuarios del nodo y configuración operativa.",
    systemLocked: false,
  },
  {
    id: "academy_director",
    label: "Director de cantera",
    shortLabel: "Cantera",
    description: "Directiva deportiva base, Staff Access Matrix y módulos de cantera.",
    systemLocked: false,
  },
  {
    id: "methodology_director",
    label: "Director de metodología",
    shortLabel: "Metodología",
    description: "Biblioteca, planner, validación de cambios y pizarras tácticas.",
    systemLocked: false,
  },
  {
    id: "stage_coordinator",
    label: "Coordinador de etapa",
    shortLabel: "Etapa",
    description: "Coordinación por etapa / categoría dentro del club.",
    systemLocked: false,
  },
  {
    id: "coach",
    label: "Entrenador",
    shortLabel: "Pro",
    description: "Pizarras, sesiones y herramientas de equipo.",
    systemLocked: false,
  },
  {
    id: "delegate",
    label: "Delegado",
    shortLabel: "Delegado",
    description: "Perfil de apoyo operativo (partidos, logística).",
    systemLocked: false,
  },
  {
    id: "promo_coach",
    label: "Entrenador promo",
    shortLabel: "Promo",
    description: "Sandbox, tareas locales y flujo promocional limitado.",
    systemLocked: false,
  },
  {
    id: "tutor",
    label: "Tutor / familia",
    shortLabel: "Tutor",
    description: "Portal familiar, lectura y comunicación.",
    systemLocked: false,
  },
  {
    id: "athlete",
    label: "Jugador / atleta",
    shortLabel: "Atleta",
    description: "Perfil deportivo y experiencia de jugador.",
    systemLocked: false,
  },
];

/** Roles que se pueden asignar desde UI de credenciales (excluye superadmin). */
export const ASSIGNABLE_ROLES: RoleCatalogEntry[] = ROLE_CATALOG.filter((r) => !r.systemLocked);

/** Opciones { value, label } para Select — solo asignables. */
export function getAssignableRoleSelectOptions(): { value: string; label: string }[] {
  return ASSIGNABLE_ROLES.map((r) => ({ value: r.id, label: r.label }));
}

const catalogLabelMap = new Map(ROLE_CATALOG.map((r) => [r.id, r.label]));

/** Etiqueta desde catálogo estático; si no hay, devuelve la clave. */
export function getRoleLabelFromCatalog(roleKey: string): string {
  return catalogLabelMap.get(roleKey as UserRole) ?? roleKey;
}

/** Fusiona etiquetas del catálogo TS con filas extra de `synq_roles` (API). */
export function mergeRoleLabels(
  roleKey: string,
  dbRow?: { label?: string | null } | null,
): string {
  if (dbRow?.label?.trim()) return dbRow.label.trim();
  return getRoleLabelFromCatalog(roleKey);
}

/** Fila mínima de `synq_roles` (API / cliente). */
export type SynqRoleRowLike = {
  key: string;
  label: string | null;
  description?: string | null;
  is_system: boolean;
};

export function getRoleDisplayLabel(roleKey: string, synqRows: SynqRoleRowLike[]): string {
  const row = synqRows.find((r) => r.key === roleKey);
  return mergeRoleLabels(roleKey, row);
}

/**
 * Opciones de selector: catálogo TS (asignables + opcional superadmin) + claves extra en BD.
 */
export function buildRoleSelectOptions(
  synqRows: SynqRoleRowLike[],
  opts?: { includeSuperadmin?: boolean },
): { value: string; label: string }[] {
  const map = new Map<string, string>();
  for (const r of ASSIGNABLE_ROLES) {
    map.set(r.id, r.label);
  }
  if (opts?.includeSuperadmin) {
    const su = ROLE_CATALOG.find((x) => x.id === "superadmin");
    if (su) map.set(su.id, su.label);
  }
  for (const row of synqRows) {
    const lb = row.label?.trim();
    if (lb) map.set(row.key, lb);
    else if (!map.has(row.key)) map.set(row.key, row.key);
  }
  return [...map.entries()]
    .sort((a, b) => a[1].localeCompare(b[1], "es"))
    .map(([value, label]) => ({ value, label }));
}
