'use client';

import type { ComponentProps, ReactNode } from 'react';
import { SheetContent } from '@/components/ui/sheet';
import { cn } from '@/lib/utils';

export const PORTAL_SHEET_CLOSE_BUTTON_CLASS =
  '[&>button]:rounded-lg [&>button]:border [&>button]:border-primary/25 [&>button]:bg-background/40 [&>button]:text-primary hover:[&>button]:bg-primary/10';

const PORTAL_SHEET_WIDTH = {
  md: 'sm:max-w-md',
  lg: 'sm:max-w-lg',
  xl: 'sm:max-w-xl',
  '2xl': 'sm:max-w-2xl',
} as const;

export type PortalSheetWidth = keyof typeof PORTAL_SHEET_WIDTH;

export function portalSheetContentClass(maxWidth: PortalSheetWidth = 'md') {
  return cn(
    'portal-dashboard dark portal-main-surface flex w-full flex-col gap-0 overflow-hidden border-l border-primary/25 p-0 text-foreground',
    PORTAL_SHEET_WIDTH[maxWidth],
    PORTAL_SHEET_CLOSE_BUTTON_CLASS
  );
}

type PortalSheetContentProps = ComponentProps<typeof SheetContent> & {
  maxWidth?: PortalSheetWidth;
};

export function PortalSheetContent({
  maxWidth = 'md',
  className,
  children,
  side = 'right',
  ...props
}: PortalSheetContentProps) {
  return (
    <SheetContent side={side} className={cn(portalSheetContentClass(maxWidth), className)} {...props}>
      {children}
    </SheetContent>
  );
}

export function PortalSheetHeader({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div
      className={cn(
        'portal-section-surface shrink-0 rounded-none border-x-0 border-t-0 px-5 py-4',
        className
      )}
    >
      {children}
    </div>
  );
}

export function PortalSheetBody({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn('min-h-0 flex-1 space-y-4 overflow-y-auto p-4 md:p-5', className)}>
      {children}
    </div>
  );
}
