# Estrategia: cáscaras primero, base de datos al final

**Versión:** 1.0  
**Fecha:** Junio 2026  
**Estado:** Acordado — fase activa de **cáscaras (UI + flujos)** sin desplegar esquema en Supabase todavía  

---

## 1. Decisión

Hasta tener las **cáscaras** del producto (pantallas, formularios, navegación, reglas de negocio visibles), **no se trabaja en base de datos en entornos reales**.

| Fase | Qué hacemos | Qué no hacemos |
|------|-------------|----------------|
| **Ahora (cáscaras)** | UI, flujos, validaciones en cliente/servidor, datos demo estáticos | Ejecutar migraciones en Supabase de pruebas ni producción |
| **Después (datos)** | Un solo despliegue coordinado del esquema + conexión real | Ir módulo a módulo pegando tablas en caliente |

**Motivo:** ver el producto entero con una visión única, evitar retrabajo de esquema y tener **dos Supabase** bien definidos (pruebas y producción) cuando conectemos.

---

## 2. Cómo funciona hoy en código

### 2.1 Modo demo

- Entrada: `/demo` → cookie `synq_demo`
- Helper: `isDemoActive()` en `src/lib/demo.ts`
- En demo: las **server actions** leen/escriben datos estáticos o **no persisten** (solo `revalidatePath`).

### 2.2 Patrón estándar por módulo

```text
src/lib/<modulo>.ts          → tipos + constantes DEMO_*
src/app/actions/<modulo>.ts  → if (isDemoActive()) → demo; else → Supabase
supabase/migrations/*.sql    → esquema PREPARADO (no aplicado aún)
```

Las migraciones en `supabase/migrations/` son **documentación ejecutable**: definen el contrato de datos para el día del “big bang”, pero **no hay que correrlas** hasta cerrar cáscaras.

### 2.3 IDs demo

Los registros demo usan prefijos como `demo-team-*`, `demo-facility-*`. El código filtra IDs `demo-*` al persistir en BD real (`teamSetupToDbPayload`, etc.) para no romper FK cuando llegue el momento.

---

## 3. Inventario de módulos (portal club / cantera)

| Módulo | Rutas principales | Datos demo | Migración preparada |
|--------|-------------------|------------|---------------------|
| Club (datos, redes) | `/portal/club/datos` | Parcial / club demo | `20260702000000`, `20260704000000` |
| Organigrama | `/portal/club/organigrama` | `organigrama_json` demo | `20260705000000_club_organigrama_json` |
| Personas maestras | staff, estructura, jugadores | `DEMO_CLUB_PEOPLE` | `20260706000000` … `20260706020000` |
| Instalaciones | `/portal/club/instalaciones` | `DEMO_FACILITIES` (estático en página) | `20260706050000` (`synq_facilities`) |
| Cantera — categorías | `/portal/cantera/equipos` | `cantera-categories.ts` | `category_slug` en teams |
| Cantera — equipos | crear / editar / ver | `DEMO_CANTERA_TEAMS`, `DEMO_TEAM_SETUP` | `20260706030000` … `20260706050000` |
| Cantera — jugadores | `/portal/cantera/jugadores` | `DEMO_TEAM_PLAYERS` | `synq_players` (init) |
| Metodología | `/portal/metodologia/*` | Según módulo | `20260704000000`, exercise sheet |

### 3.1 Equipos — último bloque documentado

**Formulario** (`TeamSetupFields`):

- Tipo: competición / formación
- Instalación de entrenamiento + zona (mitad/cuarto según división de la instalación)
- Días y horario de entrenamiento
- Aviso/bloqueo de solapamiento en instalaciones compartidas
- Sede partidos: propia (sede única o local/visitante) o externa (nombre + dirección)

**Fuentes:**

| Concepto | Demo | BD (futuro) |
|----------|------|-------------|
| Instalaciones | `src/lib/club-facilities.ts` → `DEMO_FACILITIES` | `synq_facilities` |
| Setup equipo | `src/lib/team-setup.ts` → `DEMO_TEAM_SETUP` | columnas en `synq_teams` |
| Parseo formulario | `parseTeamSetupFromForm` | mismo contrato |
| Conflictos horario | `findTrainingConflicts` | misma lógica server-side |

---

## 4. Plan Supabase: pruebas vs producción

```text
┌─────────────────────┐     ┌─────────────────────┐
│  Supabase STAGING   │     │  Supabase PROD      │
│  (synqai-staging)   │     │  (synqai-sports)    │
├─────────────────────┤     ├─────────────────────┤
│ Todas las migraciones│     │ Solo tras validar   │
│ en orden, una vez   │     │ en staging          │
│ Datos de prueba     │     │ Clubes reales       │
│ Vercel preview /    │     │ www.synqai.net      │
│ entorno dev interno │     │                     │
└─────────────────────┘     └─────────────────────┘
```

### 4.1 Variables de entorno (futuro)

| Entorno | `NEXT_PUBLIC_SUPABASE_URL` | Uso |
|---------|----------------------------|-----|
| Local / preview | Proyecto **staging** | Desarrollo y QA |
| Producción | Proyecto **prod** | Clubes piloto y clientes |

**Nunca** mezclar credenciales TrendPulse (`trend_*`) con SynqAI (`synq_*`). Ver `docs/NEXUS_ARQUITECTURA.md`.

### 4.2 Día “conectar todo”

1. Congelar lista de migraciones en `supabase/migrations/` (orden por timestamp).
2. Ejecutar **todas** en SQL Editor de **staging**.
3. Semilla mínima: 1 club piloto, 1 usuario auth, staff vinculado.
4. Quitar dependencia exclusiva de demo en rutas piloto (o mantener demo como vitrina paralela).
5. Probar flujos críticos en staging.
6. Repetir migraciones en **prod** + club founding.

Checklist operativa detallada: `docs/SYNQAI_CHECKLIST_OPERATIVA.md` (sección Fase A — aplazar hasta fin de cáscaras).

---

## 5. Reglas para desarrollo en esta fase

1. **Nueva pantalla** → datos en `src/lib/*` con prefijo `DEMO_` si hace falta.
2. **Nueva entidad** → añadir migración `.sql` al repo (contrato), **sin ejecutarla**.
3. **Server actions** → ramificar con `isDemoActive()`; en demo, no asumir que hay filas en BD.
4. **Formularios** → nombres de campos estables (`trainingFacilityId`, `teamPurpose`, etc.) para no cambiar el contrato al conectar BD.
5. **Documentar** en este archivo o en el módulo correspondiente cuando se añada una cáscara nueva.

---

## 6. Relación con facturación

El modelo B2B (SynqAI factura al club, el club cobra a padres por su cuenta) **no requiere BD en esta fase**. Los campos `synq_rate_per_user_eur` y `family_fee_annual_eur` en el club demo anticipan configuración futura. Ver `docs/MODELO_COMERCIAL_B2B.md`.

---

## 7. Documentos relacionados

| Documento | Contenido |
|-----------|-----------|
| `docs/MODELO_COMERCIAL_B2B.md` | Modelo de negocio B2B acordado |
| `docs/SYNQAI_DOCUMENTO_MAESTRO.md` | Visión global producto + económico |
| `supabase/README.md` | Migraciones (referencia, no ejecutar aún) |
| `docs/SYNQAI_CHECKLIST_OPERATIVA.md` | Pasos manuales cuando toque Supabase |
