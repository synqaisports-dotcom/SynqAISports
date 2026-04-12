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

## Icono y splash (Deep Night + Electric Cyan)

- Fuentes generadas: **`assets/icon.png`** (1024), **`assets/splash.png`** (2732).
- Script: **`scripts/generate-capacitor-assets.mjs`** (colores `#050812` / `#22d3ee`).
- Regenerar recursos Android: **`npm run cap:assets`** (sharp + `@capacitor/assets`).

## Comandos útiles

| Script | Descripción |
|--------|-------------|
| `npm run cap:assets` | Regenera PNG fuente + mipmaps/splash Android |
| `npm run cap:sync` | `npx cap sync android` |
| `npm run cap:open` | Abre el proyecto en Android Studio |

## Notas

- **Deep link / Sandbox**: la entrada puede ser `https://synqai.net/sandbox-portal?dest=/sandbox/app` (configurable en marketing / Play Console).
- Para **TWA** o **APK con dominio fijo**, revisa políticas de Google Play y `assetlinks.json` cuando toque.
