/**
 * Fuente única: módulos de permiso del club, roles gestionados, mapa rutas ↔ módulo,
 * y normalización de la matriz persistida (Admin & Permisos / Supabase JSONB).
 */

export const STAFF_ACCESS_MATRIX_PREFIX = "synq_staff_access_matrix_v1";

export const CLUB_MODULE_IDS = [
  "club",
  "staff",
  "academy",
  "players",
  "facilities",
  "board",
  "exercises",
  "planner",
] as const;

export type ClubModuleId = (typeof CLUB_MODULE_IDS)[number];

export const CLUB_MODULE_LABELS: Record<ClubModuleId, string> = {
  club: "Identidad de Club",
  staff: "Gestión de Staff",
  academy: "Gestión de Cantera",
  players: "Gestión de Jugadores",
  facilities: "Instalaciones",
  board: "Pizarras tácticas",
  exercises: "Biblioteca & ejercicios",
  planner: "Planner & operativa",
};

/**
 * Texto corto para toggles (Admin & permisos / matriz global), alineado con rutas reales del dashboard.
 */
export const CLUB_MODULE_DESCRIPTIONS: Record<ClubModuleId, string> = {
  club: "/dashboard/club — Marca, sede y datos del club.",
  staff: "/dashboard/staff — Equipo técnico y permisos internos.",
  academy: "/dashboard/academy — Cantera, etapas y estructura.",
  players: "/dashboard/players — Plantilla y fichas.",
  facilities: "/dashboard/instalaciones — Espacios e instalaciones.",
  board: "/dashboard/methodology/board-* y /board — Tableros partido, promo y ejercicios.",
  exercises:
    "/methodology/exercise-library, learning-items, /coach/library — Tareas maestras y biblioteca.",
  planner:
    "/methodology/session-planner, calendar, warehouse, cycle-planner, mobile-continuity, sessions — Planificación y continuidad.",
};

/**
 * Bloques UI: primero operación diaria del club; después metodología (cada módulo con toggles A/V/E/X independientes).
 */
export const CLUB_MODULE_UI_SECTIONS: {
  id: string;
  title: string;
  subtitle: string;
  modules: readonly ClubModuleId[];
}[] = [
  {
    id: "club_ops",
    title: "Club y operaciones",
    subtitle: "Identidad, staff, cantera, jugadores e instalaciones.",
    modules: ["club", "staff", "academy", "players", "facilities"],
  },
  {
    id: "methodology",
    title: "Metodología, pizarra y operativa",
    subtitle: "Biblioteca de ejercicios, planner neural, pizarras y flujo móvil.",
    modules: ["exercises", "planner", "board"],
  },
];

/** Orden de columnas en tablas de resumen (misma política que `CLUB_MODULE_IDS`). */
export const CLUB_MODULE_IDS_DISPLAY_ORDER: ClubModuleId[] = CLUB_MODULE_UI_SECTIONS.flatMap(
  (s) => [...s.modules],
) as ClubModuleId[];

export type ModulePermState = {
  access: boolean;
  view: boolean;
  edit: boolean;
  delete: boolean;
};

export type StaffAccessRule = {
  viewRoles: string[];
  createRoles: string[];
  modules?: Record<string, ModulePermState>;
};

export type StaffAccessMatrix = Record<string, StaffAccessRule>;

export const ROLES_TO_MANAGE = [
  { id: "academy_director", label: "Director de Cantera", rank: 80 },
  { id: "methodology_director", label: "Director Metodología", rank: 70 },
  { id: "stage_coordinator", label: "Coordinador Etapa", rank: 60 },
  { id: "coach", label: "Entrenador", rank: 50 },
  { id: "delegate", label: "Delegado", rank: 40 },
  { id: "tutor", label: "Tutor / Familia", rank: 30 },
  { id: "athlete", label: "Atleta / Jugador", rank: 20 },
] as const;

export type ManagedRoleId = (typeof ROLES_TO_MANAGE)[number]["id"];

/** Roles que ignoran la matriz de módulos (siempre acceso completo al club). */
export const CLUB_MATRIX_BYPASS_ROLES = ["superadmin", "club_admin"] as const;

/**
 * Prefijos más largos primero (índice construido en runtime).
 */
const ROUTE_MODULE_PREFIXES_RAW: { prefix: string; module: ClubModuleId }[] = [
  { prefix: "/dashboard/methodology/exercise-library", module: "exercises" },
  { prefix: "/dashboard/methodology/session-planner", module: "planner" },
  { prefix: "/dashboard/methodology/cycle-planner", module: "planner" },
  { prefix: "/dashboard/methodology/objectives", module: "planner" },
  { prefix: "/dashboard/methodology/learning-items", module: "exercises" },
  { prefix: "/dashboard/methodology/calendar", module: "planner" },
  { prefix: "/dashboard/methodology/warehouse", module: "planner" },
  { prefix: "/dashboard/methodology/board-match", module: "board" },
  { prefix: "/dashboard/methodology/board-promo", module: "board" },
  { prefix: "/dashboard/methodology/board-exercises", module: "board" },
  { prefix: "/dashboard/coach/library", module: "exercises" },
  { prefix: "/dashboard/coach/planner", module: "planner" },
  { prefix: "/dashboard/coach/exercises", module: "exercises" },
  { prefix: "/dashboard/mobile-continuity", module: "planner" },
  { prefix: "/dashboard/watch-config", module: "planner" },
  { prefix: "/dashboard/instalaciones", module: "facilities" },
  { prefix: "/dashboard/sessions", module: "planner" },
  { prefix: "/dashboard/academy", module: "academy" },
  { prefix: "/dashboard/players", module: "players" },
  { prefix: "/dashboard/staff", module: "staff" },
  { prefix: "/dashboard/club", module: "club" },
  { prefix: "/dashboard/methodology", module: "planner" },
  { prefix: "/board", module: "board" },
];

let sortedPrefixes: { prefix: string; module: ClubModuleId }[] | null = null;

function getSortedRoutePrefixes(): { prefix: string; module: ClubModuleId }[] {
  if (!sortedPrefixes) {
    sortedPrefixes = [...ROUTE_MODULE_PREFIXES_RAW].sort((a, b) => b.prefix.length - a.prefix.length);
  }
  return sortedPrefixes;
}

export function createDefaultModuleStateMap(): Record<ClubModuleId, ModulePermState> {
  const o = {} as Record<ClubModuleId, ModulePermState>;
  for (const id of CLUB_MODULE_IDS) {
    o[id] = { access: true, view: true, edit: false, delete: false };
  }
  return o;
}

export function buildDefaultStaffAccessMatrix(): StaffAccessMatrix {
  const out: StaffAccessMatrix = {};
  const mods = createDefaultModuleStateMap();
  for (const owner of ROLES_TO_MANAGE) {
    const lowerRoles = ROLES_TO_MANAGE.filter((t) => t.rank < owner.rank).map((t) => t.id);
    out[owner.id] = {
      viewRoles: [...lowerRoles],
      createRoles: [...lowerRoles],
      modules: { ...mods },
    };
  }
  return out;
}

export function normalizeStaffAccessMatrix(
  incoming: StaffAccessMatrix | null | undefined,
  defaults: StaffAccessMatrix
): StaffAccessMatrix {
  const out: StaffAccessMatrix = {};
  const baseMods = createDefaultModuleStateMap();
  for (const r of ROLES_TO_MANAGE) {
    const id = r.id;
    const inc = incoming?.[id];
    const def = defaults[id];
    const mergedModules: Record<string, ModulePermState> = {};
    for (const mid of CLUB_MODULE_IDS) {
      mergedModules[mid] = {
        ...baseMods[mid],
        ...(inc?.modules?.[mid] ?? {}),
      };
    }
    out[id] = {
      viewRoles: Array.isArray(inc?.viewRoles) ? inc.viewRoles : def.viewRoles,
      createRoles: Array.isArray(inc?.createRoles) ? inc.createRoles : def.createRoles,
      modules: mergedModules,
    };
  }
  return out;
}

export function resolveClubModuleForPath(pathname: string): ClubModuleId | null {
  const p = pathname.split("?")[0] ?? pathname;
  for (const { prefix, module } of getSortedRoutePrefixes()) {
    if (p === prefix || p.startsWith(`${prefix}/`)) return module;
  }
  return null;
}

function getModuleState(matrix: StaffAccessMatrix, role: string, moduleId: ClubModuleId): ModulePermState | null {
  const rule = matrix[role];
  const st = rule?.modules?.[moduleId];
  if (!st) return null;
  return st;
}

/**
 * Comprueba permiso de módulo para un rol sobre matriz ya normalizada.
 * Si no hay regla explícita para el rol en la matriz, permite (compatibilidad hasta que exista fila).
 */
export function canAccessClubModule(
  normalizedMatrix: StaffAccessMatrix,
  role: string | undefined,
  moduleId: ClubModuleId,
  level: keyof ModulePermState
): boolean {
  if (!role) return false;
  if (!normalizedMatrix[role]) return true;
  const st = getModuleState(normalizedMatrix, role, moduleId);
  if (!st) return true;
  if (level === "access") return st.access;
  if (level === "view") return st.access && st.view;
  if (level === "edit") return st.access && st.view && st.edit;
  return st.access && st.view && st.edit && st.delete;
}

export function shouldBypassClubMatrix(role: string | undefined): boolean {
  if (!role) return false;
  return (CLUB_MATRIX_BYPASS_ROLES as readonly string[]).includes(role);
}
