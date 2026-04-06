# Plantilla Brief Micro-App (desde PowerPoint)

> Objetivo: convertir una idea conceptual en una especificación implementable para SynqAI, sin perder tiempo en ambiguedades.
> Uso recomendado: 1 archivo por micro-app (duplicar esta plantilla).

---

## 0) Identidad del proyecto

- **Nombre micro-app**:
- **Código corto** (ej. `live-fields-tv`, `watch-config`, `sandbox-board`):
- **Responsable funcional**:
- **Fecha**:
- **Versión del brief**:

---

## 1) Objetivo de negocio (1-3 líneas)

- **Problema que resuelve**:
- **Usuario principal**:
- **Valor esperado** (operativo/ingresos/retención):

### KPI objetivo (opcional)
- KPI 1:
- KPI 2:
- KPI 3:

---

## 2) Alcance funcional (MVP vs Fase 2)

### MVP (obligatorio)
1.
2.
3.

### Fase 2 (deseable)
1.
2.
3.

### Fuera de alcance (por ahora)
1.
2.

---

## 3) Mapa de pantallas (desde PPT)

> Adjunta capturas o nombra diapositivas.

| ID | Pantalla | Diapositiva PPT | Tipo (lista/detalle/ajustes) | Prioridad |
|---|---|---|---|---|
| S1 |  |  |  | Alta |
| S2 |  |  |  | Alta |
| S3 |  |  |  | Media |

---

## 4) Flujo de navegación

### Entradas
- Ruta inicial:
- Desde qué módulo se accede:

### Navegación principal
- Botón/acción A -> Pantalla X
- Botón/acción B -> Pantalla Y

### Salidas
- Botón “Volver”:
- Botón “Salir”:

### Reglas de navegación
- ¿Debe quedar en scope de micro-app siempre? (sí/no)
- ¿Permite deep-link con query params? (ej. `?tab=watch&mode=match`)

---

## 5) Datos y persistencia (obligatorio)

## Fuentes de datos
- [ ] Solo localStorage
- [ ] Solo Supabase
- [ ] Híbrido (recomendado en terminales)

### Claves localStorage (si aplica)
- `clave_1`:
- `clave_2`:
- Scoping por `clubId`:

### Entidades Supabase (si aplica)
- Tabla/endpoint 1:
- Tabla/endpoint 2:

### Política offline
- ¿Qué funciona sin red?
- ¿Qué se sincroniza al volver?

---

## 6) Permisos y seguridad

- Rol(es) permitidos:
- Módulo de matriz club asociado:
- Guard de ruta requerido:
- Comportamiento fail-closed:
- Validaciones críticas (UUID, ownership, etc.):

---

## 7) UI/UX y diseño

### Estilo visual
- Referencia (screen o módulo):
- Tokens/tema (cyan, emerald, dark, etc.):

### Componentes obligatorios
- Header:
- Footer:
- CTA principal:
- Estados vacíos:
- Errores:

### Responsive
- [ ] Móvil first
- [ ] Tablet first
- [ ] TV/Kiosk
- [ ] Desktop operativo

### Regla de no desbordamiento
- Cómo se resuelven acciones cuando no caben (dropdown, icon-only, etc.):

---

## 8) Eventos y telemetría

- Eventos clave:
  - `evento_1`
  - `evento_2`
- Métricas mínimas:
- ¿Necesita cola offline de eventos?:

---

## 9) Monetización (si aplica)

- [ ] Sin anuncios
- [ ] AdMob/AdSense
- [ ] Freemium
- [ ] Pro/Club

### Slots publicitarios
- Slot 1 (posición/formato):
- Slot 2 (posición/formato):

---

## 10) Definición de terminado (DoD)

- [ ] Navegación completa sin salir del scope.
- [ ] Sin errores de tipo (`npm run typecheck`).
- [ ] Build OK (`npm run build`).
- [ ] Estados vacíos y error cubiertos.
- [ ] Responsive validado en dispositivo objetivo.
- [ ] Persistencia validada (local/Supabase/híbrido).
- [ ] Permisos y guardas verificados.
- [ ] PR con resumen y evidencias.

---

## 11) Checklist de handoff (PPT -> implementación)

- [ ] El PPT identifica claramente cada pantalla.
- [ ] Cada botón tiene destino definido.
- [ ] Cada dato tiene fuente definida (local/Supabase).
- [ ] Cada rol permitido está definido.
- [ ] Hay criterios de éxito medibles.

---

## 12) Anexos

### A) Decisiones abiertas
1.
2.

### B) Riesgos
1.
2.

### C) Dependencias
1.
2.

