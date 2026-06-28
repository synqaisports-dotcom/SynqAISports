import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  CalendarClock,
  ClipboardList,
  GitBranch,
  GraduationCap,
  LayoutDashboard,
  MapPin,
  Network,
  Settings,
  UserCog,
  UserPlus,
  Users,
  UsersRound,
} from 'lucide-react';

export type PortalNavNode = {
  title: string;
  href?: string;
  icon?: LucideIcon;
  exact?: boolean;
  badge?: string;
  children?: PortalNavNode[];
};

export type PortalNavGroup = {
  label: string;
  items: PortalNavNode[];
};

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
        children: [
          { title: 'Datos del club', href: '/portal/club/datos' },
          { title: 'Redes y ficha pública', href: '/portal/club/redes' },
          { title: 'Organigrama', href: '/portal/club/organigrama', icon: Network },
          {
            title: 'Staff',
            icon: UserCog,
            href: '/portal/club/staff',
            children: [
              { title: 'Dashboard por categorías', href: '/portal/club/staff/categorias' },
              { title: 'Nueva ficha de staff', href: '/portal/club/staff/nuevo', icon: UserPlus },
            ],
          },
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
        href: '/portal/cantera/equipos',
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
        children: [
          { title: 'Información general', href: '/portal/metodologia' },
          { title: 'Planograma', href: '/portal/metodologia/planograma', icon: GitBranch },
          { title: 'Ejercicios', href: '/portal/metodologia/ejercicios' },
          { title: 'Microciclos', href: '/portal/metodologia/microciclos' },
          { title: 'Objetivos', href: '/portal/metodologia/objetivos' },
          { title: 'Solicitudes', href: '/portal/metodologia/solicitudes', icon: ClipboardList },
        ],
      },
    ],
  },
];

/** Mapa plano href → título para breadcrumbs */
export const portalRouteLabels: Record<string, string> = {
  portal: 'Dashboard',
  club: 'Club',
  datos: 'Datos del club',
  redes: 'Redes',
  organigrama: 'Organigrama',
  staff: 'Staff',
  categorias: 'Por categorías',
  nuevo: 'Nueva ficha',
  instalaciones: 'Instalaciones',
  cantera: 'Cantera',
  equipos: 'Equipos',
  horarios: 'Horarios',
  jugadores: 'Jugadores',
  metodologia: 'Metodología',
  planograma: 'Planograma',
  ejercicios: 'Ejercicios',
  microciclos: 'Microciclos',
  objetivos: 'Objetivos',
  solicitudes: 'Solicitudes',
  config: 'Configuración',
};
