import type { LucideIcon } from 'lucide-react';
import {
  Building2,
  ClipboardList,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react';

export type PortalNavItem = {
  title: string;
  href: string;
  icon: LucideIcon;
  exact?: boolean;
};

export const portalNavGroups: { label?: string; items: PortalNavItem[] }[] = [
  {
    label: 'Gestión',
    items: [
      { title: 'Dashboard', href: '/portal', icon: LayoutDashboard, exact: true },
      { title: 'Club', href: '/portal/club', icon: Building2 },
      { title: 'Cantera', href: '/portal/cantera', icon: Users },
    ],
  },
  {
    label: 'Metodología',
    items: [
      { title: 'Metodología', href: '/portal/metodologia', icon: ClipboardList },
      { title: 'Configuración', href: '/portal/config', icon: Settings },
    ],
  },
];
