import Link from 'next/link';
import type { ButtonHTMLAttributes, ReactNode } from 'react';
import { cn } from '@/lib/utils';

export const PORTAL_ACTION_ICON_CLASS =
  'inline-flex size-9 items-center justify-center rounded-lg text-primary transition-colors hover:bg-primary/10 hover:text-primary';

export const PORTAL_ACTION_ICON_DISABLED_CLASS =
  'disabled:pointer-events-none disabled:opacity-40';

type PortalActionIconProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  children: ReactNode;
  label: string;
};

export function PortalActionIcon({
  children,
  label,
  className,
  ...props
}: PortalActionIconProps) {
  return (
    <button
      type="button"
      className={cn(PORTAL_ACTION_ICON_CLASS, PORTAL_ACTION_ICON_DISABLED_CLASS, className)}
      aria-label={label}
      title={label}
      {...props}
    >
      {children}
    </button>
  );
}

export function PortalActionIconLink({
  href,
  children,
  label,
  className,
}: {
  href: string;
  children: ReactNode;
  label: string;
  className?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(PORTAL_ACTION_ICON_CLASS, className)}
      aria-label={label}
      title={label}
    >
      {children}
    </Link>
  );
}
