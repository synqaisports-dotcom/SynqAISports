# NODO TORNEOS — Plan operativo (implementación fase a fase)

## Objetivo
Crear un nuevo nodo para torneos fuera de competición regular, con operación real en campo, visualización para familias y monetización (AdMob + patrocinadores locales), siguiendo el modelo híbrido de SynqAI (Supabase + fallback local).

---

## Identidad visual del nodo
- Base estética: **Sandbox**.
- Ajuste solicitado: **dos tonos menos** (menos saturación/brillo).
- Propuesta operativa:
  - Fondo base: `#060a14` (vs sandbox más brillante).
  - Paneles: `#0a1020` y `#101a2b`.
  - Acento principal: cyan frío (`#22d3ee`) con opacidad más baja.
  - Badges de estado: verde suave (en juego), ámbar (pendiente), rojo suave (incidencia).

Objetivo visual: mantener ADN SynqAI, pero con lectura más “operativa de evento”.

---

## Arquitectura funcional (simple)

### 1) BackOffice Torneos (administración)
Para director de torneo / coordinación:
- Crear torneo.
- Configurar formato (grupos + eliminatoria).
- Configurar campos y franjas horarias.
- Definir duración de partido y tiempos de transición.
- Publicar torneo.

### 2) Microapp Operativa (staff/mesa)
Para quien está en campo:
- Introducir resultados rápidos.
- Registrar goleadores e incidencias.
- Validar cierre de partido.
- Operar offline y sincronizar luego.

### 3) Microapp Familias (público)
Para padres/familias:
- Ver calendario, resultados, clasificaciones y cuadro final.
- Ver goleadores.
- Ver patrocinadores.
- Integrar AdMob.

---

## Reglas de torneo recomendadas (MVP)

## Formato competitivo
- **Fase de grupos** para asegurar varios partidos por equipo.
- **Eliminatoria** para tramo final (semis/final o cuartos según equipos).

## Reglas de tiempo (configurables por torneo)
Por defecto recomendaría:
- Tipo A: `1 parte x minutos` (torneos cortos o categorías pequeñas).
- Tipo B: `2 partes x minutos` (más competitivo).
- Descanso entre partes (solo tipo B): configurable (ej. 3-5 min).
- **Buffer fijo entre partidos**: 10 min (solicitado), configurable.

## Mi opinión operativa
Para reducir retrasos:
- Base por defecto:
  - Fútbol 7/8: `2x12` o `2x15`.
  - Fútbol 11 base: `2x20`.
- Buffer entre partidos: **10 min**.
- Si el torneo es de un solo día y muchos partidos, activar preset `1x20` para no romper horarios.

---

## Planificador de campos y horarios (clave del nodo)

Este bloque va dentro de BackOffice Torneos y será el corazón operativo.

## Qué debe permitir
1. Definir campos activos del torneo (campo completo o subdividido).
2. Definir franja del torneo (ej. 09:00-21:00).
3. Definir “slot real” por partido:
   - duración partido,
   - descanso entre partes (si aplica),
   - buffer entre partidos.
4. Generar automáticamente agenda por campo.
5. Resolver colisiones (mismo equipo en dos partidos simultáneos, etc.).

## Fórmula simple de slot
`duración total slot = duración partido + descanso interno (si aplica) + buffer entre partidos`

Ejemplo:
- Partido `2x15` + descanso 3 + buffer 10
- Slot total = 30 + 3 + 10 = **43 min**

---

## Fases de implementación (1 a 1)

## Fase 1 — Base del nodo Torneos (MVP inicial)
- Crear rutas y shell del nodo.
- Crear “Torneo > Datos básicos”.
- Crear “Equipos”.
- Crear “Configuración de juego” (1 parte / 2 partes / duración / buffers).
- Crear “Campos y Horarios” (planificador básico).

**Salida esperada**: ya se puede crear un torneo operativo con agenda.

## Fase 2 — Motor de competición
- Generador de grupos.
- Calendario de grupos.
- Cálculo clasificación automática.
- Paso automático a eliminatoria.

**Salida esperada**: torneo jugable de principio a fin.

## Fase 3 — Operativa de campo (microapp staff)
- Pantalla lista de partidos del día.
- Captura resultado y goleadores.
- Cierre acta rápido.
- Cola offline + sync.

**Salida esperada**: operación real sin depender de red perfecta.

## Fase 4 — Microapp familias + monetización
- Resultados en vivo.
- Clasificaciones y cuadro final.
- Patrocinadores por torneo/partido.
- AdMob integrado.

**Salida esperada**: experiencia pública + ingresos.

---

## Modelo híbrido (obligatorio)
- Escritura principal en Supabase (cuando hay sesión/permisos/club UUID).
- Fallback localStorage cuando no haya conectividad o entorno demo.
- Sincronización por `syncMode`: `remote | local | restricted | local_error`.
- Scope por `clubId` y `tournamentId`.

---

## Permisos (mínimo viable)
- `tournaments.view`
- `tournaments.edit`
- `tournaments.publish`
- `tournaments.operate` (staff campo)

Rutas públicas de familias solo lectura y solo torneos publicados.

---

## Orden recomendado inmediato
1. Fase 1 (estructura + planificador + tiempos).
2. Fase 2 (motor grupos/eliminatoria).
3. Fase 3 (staff microapp).
4. Fase 4 (familias + ads/sponsors).

Este orden minimiza riesgo y permite validar negocio desde muy pronto.
