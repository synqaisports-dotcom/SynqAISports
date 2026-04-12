# Motor de sincronización (Fase 4)

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

## Próximo paso (fuera de esta fase)

Mapear jobs con sesión Supabase a tablas operativas (`operativa_mobile_incidents`, etc.) sin duplicar ingestas anónimas.
