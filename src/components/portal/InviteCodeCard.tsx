'use client';

import { QRCodeSVG } from 'qrcode.react';

type Props = {
  code: string;
  clubName: string;
};

export function InviteCodeCard({ code, clubName }: Props) {
  const pairUrl = `https://synqai.net/join?code=${code}`;

  function copyCode() {
    void navigator.clipboard.writeText(code);
  }

  return (
    <div className="rounded-2xl border border-white/5 bg-synq-navy/60 p-6">
      <h3 className="text-lg font-semibold text-white">Código del club</h3>
      <p className="mt-1 text-sm text-synq-muted">
        Los entrenadores y familias usan este código para vincular la app a {clubName}.
      </p>
      <div className="mt-6 flex flex-col items-center gap-4 sm:flex-row sm:items-start">
        <div className="rounded-xl bg-white p-3">
          <QRCodeSVG value={pairUrl} size={140} />
        </div>
        <div className="flex-1">
          <p className="font-mono text-3xl font-bold tracking-widest text-synq-accent">{code}</p>
          <p className="mt-2 break-all text-xs text-synq-muted">{pairUrl}</p>
          <button
            type="button"
            onClick={copyCode}
            className="mt-4 rounded-full border border-white/15 px-4 py-2 text-sm text-white hover:border-synq-accent/50"
          >
            Copiar código
          </button>
        </div>
      </div>
    </div>
  );
}
