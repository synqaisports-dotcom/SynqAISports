# Matriz de vistas por dispositivo (Sandbox/Continuidad/Board)

Objetivo: definir exactamente que mostrar/ocultar en cada dispositivo para operar en campo con modo local-first, usando el movil como hub y la tablet como interfaz visual principal.

---

## 1) Principio operativo (resumen)

- Tablet = vista de operacion visual (pizarra y control amplio).
- Movil = hub de comunicaciones (continuidad, eventos, sync y reloj).
- Smartwatch = entrada rapida de eventos/tiempo.
- Sin red: todo sigue en local (cola).
- Con red: sincronizacion y reconciliacion automatica.

---

## 2) Contexto unico de sesion (obligatorio)

Toda vista debe trabajar sobre el mismo contexto:

- `clubId`
- `teamId`
- `mode` (`match` | `training`)
- `matchId` o `sessionId`
- `sessionKey` (derivado)
- `deviceRole` (`tablet_board` | `mobile_hub` | `watch`)

Regla: sin contexto activo, no se habilita operacion critica.

---

## 3) Matriz de vistas

## 3.1 Tablet (role = `tablet_board`)

Mostrar:
- Pizarra completa (campo, jugadores, materiales, dibujos).
- Marcador y cronometro sincronizados.
- Roster (titulares/suplentes).
- Botones rapidos: guardar, watch, continuidad.
- Estado de sync (local/pendiente/remoto).

Ocultar o minimizar:
- Formularios largos de configuracion.
- Wizard de emparejado detallado (dejar acceso rapido, no flujo completo).

Interacciones clave:
- Edicion tactica avanzada.
- Visualizacion en tiempo real de eventos del movil/watch.
- Modo inmersivo/fullscreen.

---

## 3.2 Movil (role = `mobile_hub`)

Mostrar:
- Continuidad compacta (timer grande + eventos grandes).
- Estado de reloj emparejado.
- Selector de sesion/partido activo.
- Cola offline (`pendientes`) y reintento manual.
- Alertas de conexion y reconexion.

Ocultar:
- Herramientas avanzadas de dibujo/pizarra.
- Paneles de analitica pesada.

Interacciones clave:
- Iniciar/Pausar/Reanudar/Finalizar sesion.
- Registrar: gol, cambio, incidencia, tiempo.
- Actuar como "master clock" por defecto.

---

## 3.3 Smartwatch (role = `watch`)

Mostrar:
- Timer (start/pause/reset segun permisos de sesion).
- Eventos minimos (gol, cambio, incidencia).
- Estado de conexion (ok/pendiente).

Ocultar:
- Todo lo no critico (formularios, configuraciones extensas, listas largas).

Interacciones clave:
- Entrada rapida de eventos.
- Sincronizacion con contexto activo del movil.

---

## 4) Reglas de prioridad de control

1. `mobile_hub` controla cronometro por defecto (master).
2. `tablet_board` puede solicitar control si se habilita override.
3. `watch` no debe imponer estado global si hay update reciente del hub (evita doble decremento).

---

## 5) Modo local-first (sin internet)

Comportamiento:
- Cada accion genera `eventId` unico y se guarda en outbox local.
- Se actualiza UI local al instante (optimista).
- Si no hay red: estado = `pending`.
- Al volver red: flush por lotes + dedupe por `eventId`.

Campos minimos por evento:
- `eventId`, `createdAt`, `origin`, `sessionKey`, `type`, `payload`.

---

## 6) Rutas recomendadas (vistas)

- Sandbox completo: `/sandbox/app`
- Continuidad movil (hub): `/sandbox/app/mobile-continuity?view=hub`
- Pizarra partido tablet: `/sandbox/app/board/match?view=board`
- Smartwatch: `/smartwatch?view=watch`

Nota: `view` es sugerencia de render; la validacion final la decide `deviceRole`.

---

## 7) Contrato de UI por dispositivo (mostrar/ocultar)

## 7.1 Mostrar SIEMPRE
- Contexto activo (equipo + modo + sesion/partido).
- Estado de sync (local/remoto/pendiente).
- CTA de volver seguro y salir.

## 7.2 Mostrar solo en tablet
- Controles avanzados de pizarra.
- Herramientas de dibujo/materiales.
- Paneles de formacion/transicion completos.

## 7.3 Mostrar solo en movil hub
- Emparejado/watch-config compacto.
- Outbox y diagnostico de red.
- Botones operativos grandes.

## 7.4 Mostrar solo en watch
- Timer + 3-4 eventos maximo.

---

## 8) QA rapido por escenario real

1. Sin tablet:
- Movil inicia sesion, reloj registra eventos, todo persiste local.

2. Tablet sin internet:
- Board sigue operativo local.
- Al reconectar con movil/hub, aplica eventos pendientes.

3. Tablet olvidada:
- Movil + watch mantienen operacion completa.

4. Cambio de dispositivo a mitad:
- Recuperar sesion activa por `sessionKey`.

---

## 9) Definicion de listo (DoD)

- [ ] Misma sesion visible en tablet, movil y watch.
- [ ] Sin red, no se pierde operativa.
- [ ] Al volver red, no hay eventos duplicados.
- [ ] Timer sin doble conteo.
- [ ] UI por dispositivo respeta matriz mostrar/ocultar.
- [ ] Fullscreen en terminales (tablet/TV/monitor).

---

## 10) Recomendacion final

Mantener una sola base funcional (core continuidad/sync) y tres perfiles de vista (`tablet_board`, `mobile_hub`, `watch`) evita duplicacion de apps y garantiza estabilidad operativa en campo.
