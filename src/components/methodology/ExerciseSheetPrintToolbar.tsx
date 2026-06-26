'use client';

import { Download, Printer } from 'lucide-react';
import { useCallback, useState } from 'react';

type Props = {
  targetId?: string;
  filename: string;
};

export function ExerciseSheetPrintToolbar({
  targetId = 'exercise-sheet-print',
  filename,
}: Props) {
  const [exporting, setExporting] = useState(false);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handlePdf = useCallback(async () => {
    const element = document.getElementById(targetId);
    if (!element) return;
    setExporting(true);
    try {
      const mod = await import('html2pdf.js');
      const html2pdf = mod.default;
      if (typeof html2pdf !== 'function') {
        throw new Error('html2pdf no disponible');
      }
      await html2pdf()
        .set({
          margin: 0,
          filename: `${filename}.pdf`,
          image: { type: 'jpeg', quality: 0.98 },
          html2canvas: { scale: 2, useCORS: true, logging: false },
          jsPDF: { unit: 'mm', format: 'a4', orientation: 'portrait' },
          pagebreak: { mode: ['avoid-all', 'css', 'legacy'] },
        })
        .from(element)
        .save();
    } catch (e) {
      console.error('PDF export failed', e);
      alert('No se pudo generar el PDF. Prueba Imprimir → Guardar como PDF.');
    } finally {
      setExporting(false);
    }
  }, [targetId, filename]);

  return (
    <div className="no-print mb-6 flex flex-wrap items-center gap-3">
      <button
        type="button"
        onClick={handlePrint}
        className="inline-flex items-center gap-2 rounded-full bg-synq-pitch px-5 py-2 text-sm font-semibold text-white hover:bg-synq-accent"
      >
        <Printer className="h-4 w-4" />
        Imprimir
      </button>
      <button
        type="button"
        onClick={() => void handlePdf()}
        disabled={exporting}
        className="inline-flex items-center gap-2 rounded-full border border-gray-400 bg-white px-5 py-2 text-sm font-semibold text-gray-800 hover:border-synq-accent disabled:opacity-50"
      >
        <Download className="h-4 w-4" />
        {exporting ? 'Generando PDF…' : 'Descargar PDF'}
      </button>
      <p className="text-xs text-gray-600">
        Vista A4 · También puedes usar Imprimir → Guardar como PDF del navegador.
      </p>
    </div>
  );
}
