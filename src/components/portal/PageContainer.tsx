import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  pageTitle?: string;
  pageDescription?: string;
  pageHeaderAction?: ReactNode;
};

export function PageContainer({
  children,
  pageTitle,
  pageDescription,
  pageHeaderAction,
}: Props) {
  const hasHeader = pageTitle || pageHeaderAction;

  return (
    <div className="flex flex-1 flex-col px-4 pb-4 pt-2 md:px-6 md:pt-4">
      {hasHeader && (
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            {pageTitle && <h1 className="text-2xl font-semibold tracking-tight">{pageTitle}</h1>}
            {pageDescription && (
              <p className="mt-1 text-sm text-muted-foreground">{pageDescription}</p>
            )}
          </div>
          {pageHeaderAction && <div className="shrink-0">{pageHeaderAction}</div>}
        </div>
      )}
      {children}
    </div>
  );
}
