# Capacitor Android — cáscara SynqAI Sports

## Qué hace

La app Android es un **WebView** que carga la web desplegada (por defecto **producción**). No empaqueta el bundle de Next dentro del APK.

## Configuración

- **`capacitor.config.ts`**
  - `server.url`: por defecto `https://synqai.net` (sin barra final).
  - Override: variable de entorno **`CAPACITOR_SERVER_URL`** al ejecutar `cap sync`.
- **`www/`**: assets mínimos copiados al APK; la UI real viene de la URL remota.

## Desarrollo local

1. Arranca Next: `npm run dev` (puerto **9002**).
2. **Emulador Android** (host loopback):  
   `CAPACITOR_SERVER_URL=http://10.0.2.2:9002 npm run cap:sync`
3. **Dispositivo físico** (misma red): usa la IP LAN de tu PC, p. ej.  
   `CAPACITOR_SERVER_URL=http://192.168.1.50:9002 npm run cap:sync`
4. Abre Android Studio: `npm run cap:open`

`AndroidManifest.xml` incluye **`usesCleartextTraffic="true"`** para poder usar `http://` en desarrollo.

## Icono y splash (identidad visual)

- Fondo del splash alineado con **slate** `#0F172A` (`capacitor.config.ts` → `SplashScreen.backgroundColor`; drawable regenerado con `cap:assets`).
- Icono y detalle cian: **`assets/icon.png`** (1024), **`assets/splash.png`** (2732).
- Script: **`scripts/generate-capacitor-assets.mjs`** (Deep Night `#050812` + Electric Cyan `#22d3ee` sobre base `#0F172A`).
- Regenerar recursos Android: **`npm run cap:assets`** (sharp + `@capacitor/assets`).

## Release desde terminal (sin abrir Android Studio)

| Script | Descripción |
|--------|-------------|
| `npm run cap:build-release` | `npx cap sync android` + `./android/gradlew assembleRelease` |

**Requisitos:** `ANDROID_HOME` o `ANDROID_SDK_ROOT`, JDK 17+. El APK por defecto suele quedar en  
`android/app/build/outputs/apk/release/app-release-unsigned.apk` hasta que configures **signing** en `android/app/build.gradle` o firmes en Android Studio (**Build → Generate Signed Bundle / APK**).

**Origen de deep links al compilar:** si defines `CAPACITOR_SERVER_URL` al ejecutar Gradle (misma variable que en `cap sync`), `MainActivity` inyecta `BuildConfig.DEEPLINK_REMOTE_ORIGIN` para resolver `synqai-sports://open/sandbox/app/...` hacia ese host. Por defecto: `https://synqai.net`.

## Comandos útiles

| Script | Descripción |
|--------|-------------|
| `npm run cap:assets` | Regenera PNG fuente + mipmaps/splash Android |
| `npm run cap:sync` | `npx cap sync android` |
| `npm run cap:open` | Abre el proyecto en Android Studio |

## Deep links → `/sandbox/app`

- **App Links (HTTPS):** `https://synqai.net/sandbox/app` y rutas bajo ese prefijo. El `AndroidManifest` declara el intent con `android:autoVerify="true"`.
- **Verificación de dominio:** publica en **`https://synqai.net/.well-known/assetlinks.json`** el JSON con el fingerprint SHA-256 del certificado **release**. Plantilla: `docs/android-assetlinks-template.json`.
- **Esquema custom (sin asset links):** `synqai-sports://open/sandbox/app` (útil para QR o enlaces internos). Se traduce a `DEEPLINK_REMOTE_ORIGIN + path + query`.
- **Implementación:** `MainActivity` carga la URL en el WebView en cold start y en `onNewIntent`.

## Notas

- Entrada marketing alternativa: `https://synqai.net/sandbox-portal?dest=/sandbox/app`.
- Políticas **Google Play** y dominio fijo: revisar cuando publiques el listing.
