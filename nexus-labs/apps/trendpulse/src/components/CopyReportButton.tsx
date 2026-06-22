'use client';

import { useState } from 'react';
import { ClipboardCheck, Copy } from 'lucide-react';

export function CopyReportButton({ report }: { report: string }) {
  const [copied, setCopied] = useState(false);

  async function handleCopy() {
    await navigator.clipboard.writeText(report);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <button
      type="button"
      onClick={handleCopy}
      className="inline-flex items-center gap-2 rounded-lg border border-tp-cyan/30 bg-tp-cyan/10 px-4 py-2 text-sm font-medium text-tp-cyan hover:bg-tp-cyan/20 transition-colors"
    >
      {copied ? <ClipboardCheck className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
      {copied ? 'Copiado — pégalo en Cursor' : 'Copiar informe para Cursor'}
    </button>
  );
}
