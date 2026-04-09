export type StoreAccessMode = "open" | "optional_login" | "login_required";

export type StoreProduct = {
  slug: string;
  name: string;
  shortDescription: string;
  longDescription: string;
  href: string;
  category: "terminal" | "club" | "family" | "device";
  accessMode: StoreAccessMode;
  tags: string[];
};

export const STORE_PRODUCTS: StoreProduct[] = [
  {
    slug: "sandbox-coach",
    name: "SANDBOX COACH",
    shortDescription: "Pizarra ligera multideporte para entrenadores (sin login).",
    longDescription:
      "Micro-app abierta de entrada para entrenadores. Incluye pizarra táctica, equipo, tareas limitadas, agenda y partidos en modo local-first con cola de anuncios offline, soporte multiidioma y conexión con Smartwatch Link para diferenciación operativa.",
    href: "/sandbox/coach",
    category: "terminal",
    accessMode: "open",
    tags: ["multideporte", "sin-login", "publicidad", "watch-link", "local-first"],
  },
  {
    slug: "tutor",
    name: "Tutor by SynqAI",
    shortDescription: "Portal de familias y comunicación.",
    longDescription:
      "Micro-app orientada a tutores/familias para ver información operativa, seguimiento y comunicación del entorno deportivo.",
    href: "/tutor",
    category: "family",
    accessMode: "login_required",
    tags: ["familias", "comunicación", "seguimiento"],
  },
  {
    slug: "watch-link",
    name: "Smartwatch Link",
    shortDescription: "Emparejado y telemetría en vivo.",
    longDescription:
      "Herramienta para conectar reloj/dispositivo y operar eventos rápidos en partido o continuidad con sincronización contextual.",
    href: "/smartwatch",
    category: "device",
    accessMode: "optional_login",
    tags: ["wearable", "telemetría", "tiempo real"],
  },
  {
    slug: "backoffice",
    name: "Backoffice Pro",
    shortDescription: "Centro de mando superadmin.",
    longDescription:
      "Gestión integral de clubs, usuarios, planes, roles, salud del sistema y auditoría operativa. Uso recomendado para perfiles de administración global.",
    href: "/admin-global",
    category: "club",
    accessMode: "login_required",
    tags: ["superadmin", "control", "auditoría"],
  },
];

export function getStoreProductBySlug(slug: string): StoreProduct | null {
  return STORE_PRODUCTS.find((p) => p.slug === slug) ?? null;
}

