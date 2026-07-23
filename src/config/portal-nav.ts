import type { LucideIcon } from 'lucide-react';
import {
  BookOpen,
  Building2,
  CalendarClock,
  ClipboardList,
  GitBranch,
  GraduationCap,
  Landmark,
  Layers,
  LayoutDashboard,
  LayoutGrid,
  MapPin,
  Megaphone,
  Network,
  Package,
  Smartphone,
  Target,
  Tv,
  UserCog,
  Users,
  UsersRound,
} from 'lucide-react';

export type PortalNavNode = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  /** Solo portadas: sin formularios ni rutas de edición en el sidebar */
  exact?: boolean;
  children?: PortalNavNode[];
};

export type PortalNavGroup = {
  label: string;
  items: PortalNavNode[];
};

/** Solo enlaces a portadas / landings. Formularios vía botones Crear/Modificar en cada portada. */
export const portalNavGroups: PortalNavGroup[] = [
  {
    label: 'General',
    items: [
      { title: 'Dashboard', href: '/portal', icon: LayoutDashboard, exact: true },
    ],
  },
  {
    label: 'Club',
    items: [
      {
        title: 'Club',
        icon: Building2,
        href: '/portal/club',
        exact: true,
        children: [
          { title: 'Organigrama', href: '/portal/club/organigrama', icon: Network },
          { title: 'Estructura no deportiva', href: '/portal/club/estructura', icon: Landmark },
          { title: 'Staff', href: '/portal/club/staff', icon: UserCog },
          { title: 'Instalaciones', href: '/portal/club/instalaciones', icon: MapPin },
          { title: 'Material', href: '/portal/club/material', icon: Package },
        ],
      },
    ],
  },
  {
    label: 'Cantera',
    items: [
      {
        title: 'Cantera',
        icon: Users,
        href: '/portal/cantera',
        exact: true,
        children: [
          { title: 'Equipos', href: '/portal/cantera/equipos', icon: Layers },
          { title: 'Horarios', href: '/portal/cantera/horarios', icon: CalendarClock },
          { title: 'Jugadores', href: '/portal/cantera/jugadores', icon: UsersRound },
          { title: 'Entrenador', href: '/portal/entrenador', icon: Smartphone },
        ],
      },
    ],
  },
  {
    label: 'Metodología',
    items: [
      {
        title: 'Metodología',
        icon: GraduationCap,
        href: '/portal/metodologia/ciclos',
        exact: false,
        children: [
          { title: 'Resumen', href: '/portal/metodologia/resumen', icon: LayoutGrid, exact: true },
          { title: 'Ciclos', href: '/portal/metodologia/ciclos', icon: GitBranch },
          { title: 'Ejercicios', href: '/portal/metodologia/ejercicios', icon: BookOpen },
          { title: 'Objetivos', href: '/portal/metodologia/objetivos', icon: Target },
          { title: 'Solicitudes', href: '/portal/metodologia/solicitudes', icon: ClipboardList },
        ],
      },
    ],
  },
  {
    label: 'Comunicación',
    items: [
      {
        title: 'Signage',
        icon: Tv,
        href: '/portal/signage',
        exact: true,
        children: [
          { title: 'Patrocinadores', href: '/portal/signage/patrocinadores', icon: Megaphone },
          { title: 'Contenido', href: '/portal/signage/contenido', icon: LayoutGrid },
          { title: 'Pantallas', href: '/portal/signage/pantallas', icon: Tv },
          { title: 'Programación', href: '/portal/signage/programacion', icon: CalendarClock },
        ],
      },
    ],
  },
];
