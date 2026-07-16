import { methodologyReadOnlyLabel } from '@/lib/methodology-access';

type Props = {
  role: string;
};

export function MethodologyReadOnlyBanner({ role }: Props) {
  const message = methodologyReadOnlyLabel(role);
  if (!message) return null;

  return (
    <p className="rounded-lg border border-amber-400/25 bg-amber-500/10 px-3 py-2 text-sm text-amber-100">
      {message}
    </p>
  );
}
