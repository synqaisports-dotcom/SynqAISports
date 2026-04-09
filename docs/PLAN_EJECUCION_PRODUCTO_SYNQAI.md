# Plan de Ejecucion Producto SynqAI (desde ahora)

## Objetivo

Construir una plataforma deportiva modular, profesional y escalable, con:

- entrada de captacion por apps abiertas (sandbox),
- operacion de club con login y permisos,
- y backoffice global para control de negocio.

Este documento es interno de trabajo. No se muestra en la web.

## Principios de producto y desarrollo

1. **Arquitectura por apps y rutas dedicadas**
   - Cada producto tiene URL propia y reglas de acceso claras.
   - El Index funciona como puerta de entrada, no como pagina monolitica informativa.

2. **Una sola fuente de verdad**
   - Datos operativos en Supabase.
   - `localStorage` solo como soporte offline/local-first donde aplica (sandbox).

3. **Diseño enterprise consistente**
   - Sistema visual unificado (grises SynqAI + acento cyan).
   - Estructura multi-pagina con navegacion limpia.

4. **Instrumentacion y negocio desde el inicio**
   - Medicion de uso, conversion y monetizacion por app.
   - Backoffice con indicadores accionables.

## Alcance funcional acordado

### A. SANDBOX COACH (app abierta, sin login)

- Es la app de entrada para entrenadores.
- Se apoya en el sandbox real existente de Terminales:
  - `/sandbox-portal?dest=/sandbox/app`
- Requisitos de producto:
  - multideporte,
  - multiidioma,
  - local-first con cola offline para ads/eventos,
  - integracion con watch-link,
  - trazabilidad de uso e ingresos en backoffice.

### B. Apps con login opcional o requerido

- Tutor, Smartwatch Link, Backoffice y futuros modulos.
- Mantener separacion clara de contexto entre captacion, club y administracion global.

### C. Backoffice superadmin

- Control transversal: usuarios, clubes, salud sistema, permisos, analitica, monetizacion.
- Evitar dependencia de SQL manual para operacion diaria.

## Backlog priorizado

### 1) Web publica y navegacion (en curso)

- [x] Index reconvertido a puerta de entrada.
- [x] Secciones separadas en paginas dedicadas:
  - `/plataforma`
  - `/apps`
  - `/precios`
  - `/contacto`
- [ ] Refinamiento visual final para alinear con referencia (layout enterprise).

### 2) Sandbox Coach (core producto)

- [x] Enlace a sandbox real de terminales.
- [x] Instrumentacion base de eventos de ads/uso.
- [ ] Selector multideporte operativo y persistente.
- [ ] Ajustes de UX movil/tablet de alto rendimiento.
- [ ] Definicion de eventos de conversion (de abierta -> cuenta).

### 3) Analitica y monetizacion

- [x] Cola de eventos + tabla `ad_events_queue`.
- [x] KPIs base en backoffice.
- [ ] Dashboard dedicado de sandbox (DAU/WAU/retencion/CTR/ingreso).
- [ ] Segmentacion por deporte/pais/dispositivo.

### 4) Operacion y seguridad

- [x] Base de memberships por club.
- [ ] UI completa de memberships en Admin Global (alta/edicion/default/sandbox).
- [ ] Endurecimiento de politicas de acceso por modulo.

## Criterios de calidad (Definition of Done)

Una entrega se considera valida cuando:

1. Tiene navegacion clara y copy de producto coherente.
2. No rompe rutas existentes.
3. Incluye medicion de eventos cuando impacta negocio.
4. Pasa validaciones tecnicas del alcance tocado.
5. Queda documentada en este plan y/o ledger tecnico.

## Convenciones de trabajo

- No exponer en la web mensajes internos de gestion ("fases", "pasos", etc.).
- Mantener documentacion interna en `.md`.
- Hacer commits pequenos, descriptivos y trazables.
- Priorizar cambios sobre componentes/rutas reales existentes antes de crear nuevos.
