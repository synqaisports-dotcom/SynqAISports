'use client';

import Script from 'next/script';
import { getPublicAdClientId } from '@/lib/public-tournament-ads';

export function PublicAdScript() {
  const clientId = getPublicAdClientId();
  if (!clientId) return null;

  return (
    <Script
      id="synq-adsense"
      async
      src={`https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${clientId}`}
      crossOrigin="anonymous"
      strategy="afterInteractive"
    />
  );
}
