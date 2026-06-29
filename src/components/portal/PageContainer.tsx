import type { ReactNode } from 'react';

type Props = {
  children: ReactNode;
  /** Solo botones sueltos arriba a la derecha — sin título ni texto explicativo */
  actions?: ReactNode;
};

export function PageContainer({ children, actions }: Props) {
  return (
    <div className="synq-portal-content flex flex-1 flex-col px-4 pb-6 pt-2 md:px-6 md:pt-4">
      {actions ? <div className="mb-4 flex items-center justify-end gap-2">{actions}</div> : null}
      {children}
    </div>
  );
}
