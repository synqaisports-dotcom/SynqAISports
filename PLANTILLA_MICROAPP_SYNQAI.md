# Plantilla base: nueva micro-app SynqAI (rápida y profesional)

Objetivo: reducir tiempo de creación de nuevas apps terminales (ej. Elite Board, Tutor variantes, nuevas apps deportivas) manteniendo seguridad, rendimiento y coherencia con BackOffice.

---

## 1) Estructura recomendada de rutas

```text
src/app/<microapp>/                # versión pública/portal opcional
src/app/<microapp>/layout.tsx
src/app/<microapp>/page.tsx

src/app/<microapp>/app/            # app autenticada principal
src/app/<microapp>/app/layout.tsx
src/app/<microapp>/app/(shell)/    # páginas normales con shell
src/app/<microapp>/app/board/      # páginas inmersivas/fullscreen (pizarras)
src/app/<microapp>/manifest.json/route.ts
```

Regla:
- `/(shell)` para formularios/listas (con header y contenedor).
- `/board` para canvas/pizarra fullscreen (sin restricciones de ancho).

---

## 2) Guard de autenticación y redirección

Reutilizar patrón de wrapper cliente:

1. Si `loading` -> spinner.
2. Si no autenticado -> `/login?next=<ruta_microapp>`.
3. Si autenticado -> render normal.

Esto evita rutas huérfanas y mejora onboarding por QR.

---

## 3) Scoping de datos (obligatorio)

Todo dato debe quedar scopeado por contexto:
- `clubId`
- `teamId`
- `sessionId` (si aplica)
- `mode` (`match` | `training`)
- `userId` (si aplica)

Patrón de clave local recomendado:

```ts
const key = `synq:${microapp}:${clubId}:${teamId}:${mode}:${sessionId ?? "none"}`;
```

Nunca usar claves globales ambiguas para datos sensibles/operativos.

---

## 4) Offline-first y sincronización

Para terminales:
- Guardado local inmediato (UX rápida).
- Cola de eventos pendiente (`pending[]`).
- Sync en background cuando vuelva red.
- Dedupe con `eventId` único.

Eventos mínimos:
- `created_at`, `eventId`, `clubId`, `teamId`, `mode`, `payload`.

---

## 5) Seguridad (fail-closed)

Checklist mínimo:
- API route protegida con sesión válida.
- UUIDs/contexto validados.
- Guard por módulo (`view/edit/delete`).
- Si no se puede verificar permiso -> `403`.
- Nunca confiar en IDs del cliente sin validar.

---

## 6) Rendimiento y compatibilidad (dispositivo antiguo)

- Activar perfil visual adaptable (`perf-lite`) cuando haga falta.
- Cargar componentes pesados con lazy/suspense.
- Reducir efectos caros en canvas en hardware débil.
- Evitar payloads grandes y dependencias innecesarias.

---

## 7) Telemetría mínima

Registrar al menos:
- `screen_open`
- `action_click`
- `sync_success` / `sync_error`
- `offline_queue_size`
- `ad_impression` / `ad_click` (solo consumer/demo)

Esto acelera decisiones de producto y monetización.

---

## 8) Política de monetización por dominio

- BackOffice Pro: sin ads.
- Terminales consumer/demo: ads permitidos.
- Terminales pro/operativas de club: según política comercial, preferible sin fricción.

---

## 9) Definición rápida antes de construir (brief de 10 minutos)

Responder estas 8 preguntas:
1. ¿Quién usa esta micro-app?
2. ¿En qué dispositivo principal?
3. ¿Qué 3 acciones críticas hace?
4. ¿Qué datos necesita del BackOffice?
5. ¿Qué opera offline?
6. ¿Qué permisos requiere?
7. ¿Tiene ads o no?
8. ¿Qué métricas dirán si funciona?

Si no están claras, no arrancar código todavía.

---

## 10) Checklist de entrega (DoD)

- [ ] Rutas separadas shell/board
- [ ] Auth guard + `next` redirect
- [ ] Scoping por contexto completo
- [ ] API fail-closed con permisos
- [ ] Offline queue + sync básico
- [ ] Responsive mobile/tablet/desktop
- [ ] Typecheck OK
- [ ] Auditoría/documentación actualizada

---

## 11) Aplicación directa a “Elite Board micro-app”

Sí, se puede crear una micro-app Elite estilo Sandbox:
- Manteniendo pizarras inmersivas para uso operativo.
- Y dejando en BackOffice PC la parte de gestión avanzada.

Modelo recomendado:
- **Elite Board App**: ejecutar, capturar eventos, operar rápido en campo.
- **BackOffice Club/Metodología**: configurar plantillas, revisar histórico, informes, permisos.

Así no compiten: se complementan.
