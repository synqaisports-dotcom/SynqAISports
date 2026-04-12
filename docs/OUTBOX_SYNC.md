# Motor de sincronización (Fase 4) e ingest operativo (Fase 6)

## Flujo

1. **`enqueueOutbox`** (desde `database-service` tras `upsertDocument` / `insertIncident`) inserta en `sync_outbox` (SQLite) o en `synq_outbox_fallback_queue` (solo `localStorage` si WASM falla).
2. **`flushOutbox`** envía un lote a **`POST /api/sync/outbox`**, que persiste en **`sandbox_device_snapshots`** (una fila por job).
3. Tras **200 OK**, los ids enviados se **eliminan** de la cola local.

## Reintentos y backoff

- Tras fallo HTTP o red: `attempts++`, `last_attempt_at = now`, `last_error`.
- Reenvío solo cuando `now >= last_attempt_at + backoff(attempts)` con backoff exponencial (base 2s, tope 120s).
- Tras **`MAX_SYNC_ATTEMPTS` (12)** el job se **elimina** para no bloquear la cola (se registra en consola).

## Lotes

- Hasta **50** jobs por request (el API acepta hasta 100; margen por si se sube el lote).
- **Intervalo** de 30s: si hay pendientes y hay red, se intenta otro flush.

## Métricas (cliente)

- Clave `localStorage`: **`synq_outbox_metrics_v1`** (`pendingCount`, `lastFlushAt`, `lastFlushOk`, `lastError`, `lastAccepted`).
- Evento: **`synq:outbox-metrics-updated`** (detail = métricas).

## Variables

| Variable | Uso |
|----------|-----|
| `NEXT_PUBLIC_OUTBOX_SYNC_ENDPOINT` | Override del endpoint (default `/api/sync/outbox`) |

## Fase 6 (implementado — continuidad)

**Incidencias** con sesión club:

1. Cliente (`mobile-continuity`): al registrar incidencia se genera `sync_key = continuity:{id_local}` (`id` devuelto por `insertIncident`).
2. Cola local: `localStorage` `synq_continuity_pending_incidents_v1` si el POST falla o no hay red.
3. **`POST /api/sync/promote-continuity`** con **Bearer**: valida club con `verifyClubSessionFromRequest`; inserta en **`operativa_mobile_incidents`** con `sync_key` (único por club, índice parcial).
4. Si existe **`SUPABASE_SERVICE_ROLE_KEY`**, la API usa **service role** para insert (evita límites RLS en edge cases) tras comprobar duplicado por `sync_key` + `club_id`.
5. Al activar **SYNC cloud** o al evento **`online`**, se ejecuta **`flushContinuityIncidentQueue`**.

Migración: **`supabase/migrations/20260412140000_operativa_incidents_sync_key.sql`**.

El ingest anónimo **`/api/sync/outbox` → `sandbox_device_snapshots`** sigue siendo el canal de telemetría genérica; **no** sustituye a esta vía autenticada para incidencias operativas.
