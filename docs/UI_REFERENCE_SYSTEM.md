# SYNQAI UI Reference System (Web + Backoffice)

## Objetivo

Unificar la experiencia visual de todos los entornos de SynqAI con una dirección de diseño inspirada en:

- Backoffice: dashboards enterprise tipo analytics control center.
- Sitio público: presentación modular tipo product website.

Este documento es interno y **no** se expone en páginas públicas.

## Alcance aplicado ahora

- Entorno público (`/`, `/plataforma`, `/apps`, `/precios`, `/contacto`, `/login`)
- Entorno backoffice (`/admin-global/*`)
- Entorno operación club (`/dashboard/*`) a nivel layout base

## Sistema visual base

Se añadieron clases globales reutilizables en `src/app/globals.css`:

- `.public-shell-bg`: fondo de marketing/presentación.
- `.backoffice-shell-bg`: fondo de dashboard administrativo.
- `.app-shell-bg`: fondo de operación de producto.
- `.surface-card`: tarjeta principal de alto contraste.
- `.surface-muted`: tarjeta secundaria.

## Reglas de implementación

1. Usar `surface-card` para bloques KPI, cards de módulo y secciones primarias.
2. Usar `surface-muted` para subcards, elementos de listado y tags.
3. Mantener CTA principal en color `primary` y secundarios en outline oscuro.
4. Evitar texto largo en home: segmentar por páginas dedicadas.
5. Mantener consistencia en navegación top (`SiteNav`) para entorno público.

## Próximos pasos técnicos

1. Migrar `/store` al mismo sistema de superficies (`surface-card` / `surface-muted`).
2. Crear componente compartido `DashboardSectionHeader` para backoffice y club.
3. Incorporar assets reales (foto/video) para carrusel y cards.
4. Añadir autenticación social Google con botón nativo en `login`.
5. Definir guía tipográfica final (display/headline/body/caption) por entorno.

## Criterio de aceptación

- El usuario percibe una línea visual coherente entre home, páginas públicas y paneles.
- No hay “pantallas aisladas” con estética distinta fuera del sistema.
- La web pública no muestra documentos de trabajo ni fases internas.
