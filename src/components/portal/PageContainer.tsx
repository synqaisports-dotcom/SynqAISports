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
    <div className="synq-portal-content flex flex-1 flex-col px-4 pb-6 pt-2 md:px-6 md:pt-4">
      {hasHeader && (
        <div className="synq-section-border mb-6 rounded-xl p-5 md:p-6">
          <div className="flex items-start justify-between gap-4">
            <div>
              {pageTitle && (
                <h1 className="text-2xl font-semibold tracking-tight text-foreground">{pageTitle}</h1>
              )}
              {pageDescription && (
                <p className="mt-1 text-sm text-muted-foreground">{pageDescription}</p>
              )}
            </div>
            {pageHeaderAction && <div className="shrink-0">{pageHeaderAction}</div>}
          </div>
        </div>
      )}
      {children}
    </div>
  );
}
