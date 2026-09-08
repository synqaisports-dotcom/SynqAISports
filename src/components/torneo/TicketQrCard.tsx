'use client';

import { useRef } from 'react';
import { QRCodeCanvas } from 'qrcode.react';
import { Button } from '@/components/ui/button';
import { Copy, Download } from 'lucide-react';

type Props = {
  title: string;
  subtitle?: string;
  qrPayload: string;
  onClose?: () => void;
};

export function TicketQrCard({ title, subtitle, qrPayload, onClose }: Props) {
  const canvasRef = useRef<HTMLDivElement>(null);

  async function copyPayload() {
    await navigator.clipboard.writeText(qrPayload);
  }

  function downloadPng() {
    const canvas = canvasRef.current?.querySelector('canvas');
    if (!canvas) return;
    const link = document.createElement('a');
    link.download = `entrada-${title.replace(/\s+/g, '-').toLowerCase()}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
  }

  return (
    <div className="portal-section-surface rounded-xl p-5 text-center">
      <p className="text-xs uppercase tracking-widest text-cyan-300">Entrada emitida</p>
      <h3 className="mt-2 text-lg font-semibold">{title}</h3>
      {subtitle ? <p className="mt-1 text-sm text-muted-foreground">{subtitle}</p> : null}

      <div ref={canvasRef} className="mx-auto mt-4 inline-flex rounded-xl bg-white p-4">
        <QRCodeCanvas value={qrPayload} size={220} level="M" includeMargin />
      </div>

      <p className="mt-3 break-all font-mono text-[10px] text-muted-foreground">{qrPayload}</p>

      <div className="mt-4 flex flex-wrap justify-center gap-2">
        <Button type="button" size="sm" variant="secondary" onClick={copyPayload}>
          <Copy className="mr-1.5 size-4" />
          Copiar código
        </Button>
        <Button type="button" size="sm" variant="outline" onClick={downloadPng}>
          <Download className="mr-1.5 size-4" />
          Descargar QR
        </Button>
        {onClose ? (
          <Button type="button" size="sm" onClick={onClose}>
            Cerrar
          </Button>
        ) : null}
      </div>
    </div>
  );
}
