# Smartwatch Link

## Propósito

Cliente **wearable / móvil ligero** para emparejamiento por código, recepción de contexto de partido o entreno y sincronización en vivo con el hub (pizarra de partido, modo continuidad). Telemetría: cronómetro, marcador y eventos asociados vía `localStorage` y mismas claves que el tablero.

## Catálogo Store

- **Slug:** `watch-link`
- **Href:** `/smartwatch`
- **accessMode:** `optional_login`

## Rutas principales

| Ruta | Función |
|------|---------|
| `/smartwatch` | App smartwatch (pairing, UI según `page.tsx`) |

## Emparejamiento

- URL típica generada desde continuidad: origen + query `code`, `mode`, `team`, `mcc`, `session` (ver `mobile-continuity/page.tsx` y `src/lib/watch-pairing.ts`).
- Contexto persistente: `src/lib/continuity-context.ts` (`synq_continuity_ctx_v1` por club).

## Sincronización con otras apps

- **Pizarra partido** (`/board/match` o `/sandbox/app/board/match`): lectura/escritura timer y score con `matchTimerSyncKey` / `matchScoreSyncKey` según scope.
- **Modo continuidad** (`/sandbox/app/mobile-continuity` o `/dashboard/mobile-continuity`): escribe con `origin: "continuity"` para no colisionar con el watch como autor.

## PWA

- Manifest: `src/app/smartwatch/manifest.json/route.ts`

## Archivos de referencia

- UI: `src/app/smartwatch/page.tsx`
- Layout: `src/app/smartwatch/layout.tsx`
- Pairing: `src/lib/watch-pairing.ts`
- Timer sync: `src/lib/match-timer-sync.ts`
- Score sync: `src/lib/match-score-sync.ts`
- Continuidad (genera enlaces): `src/app/dashboard/(peripherals)/mobile-continuity/page.tsx`
- Catálogo: `src/lib/store-catalog.ts`
