import Link from 'next/link';
import { FileText } from 'lucide-react';

type Props = {
  href: string;
  className?: string;
  label?: string;
};

export function ExerciseSheetPrintLink({
  href,
  className = '',
  label = 'PDF / Imprimir',
}: Props) {
  return (
    <Link
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className={`inline-flex items-center gap-1.5 text-xs font-medium text-synq-accent hover:underline ${className}`}
    >
      <FileText className="h-3.5 w-3.5 shrink-0" />
      {label}
    </Link>
  );
}
