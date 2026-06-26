# Synq Coach Free (Android)

MVP nativo para entrenadores: pizarra táctica, plantilla, microciclos (límite 2) y liga local. Monetización con banner AdMob (IDs de prueba incluidos).

## Requisitos

- Android Studio Ladybug o superior
- JDK 17+
- Android SDK 34

## Abrir el proyecto

1. Android Studio → **Open** → carpeta `apps/synq-coach`
2. Esperar sync de Gradle
3. Conectar tablet/emulador (API 26+)
4. Run `app`

## Build release (AAB)

```bash
cd apps/synq-coach
./gradlew :app:bundleRelease
```

El AAB queda en `app/build/outputs/bundle/release/`.

Firma: configurar keystore en `app/build.gradle.kts` (`signingConfigs`) antes de subir a Play Console.

## AdMob (antes de producción)

Reemplazar en:

- `AndroidManifest.xml` → `APPLICATION_ID`
- `activity_main.xml` → `adUnitId` del banner

Los valores actuales son **IDs de prueba de Google**.

## Play Console — internal testing

1. Crear app `com.synqai.coach`
2. Subir AAB firmado
3. Crear track **Internal testing**
4. Añadir testers por email

## Tests unitarios

```bash
./gradlew :app:testDebugUnitTest
```

## Funcionalidad MVP

| Módulo | Descripción |
|--------|-------------|
| Pizarra | Campo nativo, jugadores arrastrables, flechas, undo |
| Equipo | Plantilla local (Room), tipo de campo |
| Entreno | Hasta 2 microciclos, 5 slots cada uno |
| Liga | 1 liga activa, partidos y marcador rápido |

## Fuera de alcance (v0.1)

- Sync cloud / vincular club
- Wear OS
- Interstitials agresivos

## Documentación

Ver `docs/SYNQAI_DOCUMENTO_MAESTRO.md` sección 18 (MVP Coach Free).
