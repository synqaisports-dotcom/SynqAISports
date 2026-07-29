# Módulo Torneos SynqAI

## Rutas

### Portal (staff)
| Ruta | Descripción |
|------|-------------|
| `/portal/torneos` | Landing con resumen |
| `/portal/torneos/crear` | Wizard crear torneo |
| `/portal/torneos/[id]` | Detalle con tabs |

### Públicas (PWA)
| Ruta | Descripción |
|------|-------------|
| `/torneo/[slug]` | Web pública padres / seguidores |
| `/torneo/mesa/[token]` | Anotación partido (sin login) |
| `/torneo/equipo/[token]` | Portal delegado invitado |
| `/torneo/taquilla/[token]` | Validación QR entradas |

## Formato multifinal

Ejemplo: **6 grupos × 4 equipos = 24 equipos**

1. **Fase de grupos**: round-robin en cada grupo (6 partidos/grupo).
2. **Clasificación**: por puntos en cada grupo.
3. **Bandejas paralelas** (nombres configurables):
   - Todos los **1º** → Platinum
   - Todos los **2º** → Gold
   - Todos los **3º** → Silver
   - Todos los **4º** → Bronze
4. **Eliminatorias** en cada bandeja: cuartos (con byes si hace falta) → semifinales → final + 3.er puesto.
5. **Final de consolación** entre equipos de la bandeja Consolación.

Cada bandeja es independiente: un 1º del grupo A solo compite contra otros 1º en Platinum.

## Flujo operativo

1. Crear torneo → categorías → campos → patrocinadores
2. Invitar equipos (dossier invitación)
3. Delegados confirman asistencia y plantilla vía enlace mágico
4. Cerrar inscripciones → generar estructura → dossier oficial
5. Durante el torneo: mesa anota resultados; web pública en vivo
6. Ticketing: emitir entradas QR; taquilla valida en puerta
7. Signage: playlist scoped al torneo con patrocinadores del evento

## Demo

Con cookie demo activa, los datos vienen de `demo-tournaments-store.ts` (Torneo Ciudad de Madrid).

## BBDD

Ver `docs/TORNEOS_DATABASE.md` y migración `20260729120000_tournaments_module.sql`.
