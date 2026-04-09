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
    slug: "sandbox",
    name: "SynqAI Sandbox",
    shortDescription: "Micro-app de captación y operación rápida.",
    longDescription:
      "App ligera para entrenadores y pruebas en campo. Puede operar en local-first y escalar a cuenta conectada cuando se requiera sincronización cloud.",
    href: "/sandbox-portal?dest=/sandbox/app",
    category: "terminal",
    accessMode: "optional_login",
    tags: ["local-first", "captación", "pizarra"],
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

