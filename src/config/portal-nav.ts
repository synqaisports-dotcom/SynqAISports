import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarClock,
  GraduationCap,
  Landmark,
  LayoutDashboard,
  MapPin,
  Network,
  Settings,
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
      { title: 'Configuración', href: '/portal/config', icon: Settings },
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
          { title: 'Equipos', href: '/portal/cantera/equipos' },
          { title: 'Horarios', href: '/portal/cantera/horarios', icon: CalendarClock },
          { title: 'Jugadores', href: '/portal/cantera/jugadores', icon: UsersRound },
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
        href: '/portal/metodologia',
        exact: true,
        children: [
          { title: 'Planograma', href: '/portal/metodologia/planograma' },
          { title: 'Ejercicios', href: '/portal/metodologia/ejercicios' },
          { title: 'Microciclos', href: '/portal/metodologia/microciclos' },
        ],
      },
    ],
  },
];
