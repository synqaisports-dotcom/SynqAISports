import type { CapacitorConfig } from "@capacitor/cli";

/**
 * Shell Android (WebView) — SynqAI Sports
 *
 * URL remota por defecto: producción.
 * Desarrollo local (emulador Android → host): `CAPACITOR_SERVER_URL=http://10.0.2.2:9002 npm run cap:sync`
 * Dispositivo físico (misma Wi‑Fi): `CAPACITOR_SERVER_URL=http://TU_LAN_IP:9002 npm run cap:sync`
 */
const defaultProdUrl = "https://synqai.net";
const serverUrl = (process.env.CAPACITOR_SERVER_URL || defaultProdUrl).replace(/\/$/, "");
const isCleartext = serverUrl.startsWith("http://");

const config: CapacitorConfig = {
  appId: "com.synqai.sports",
  appName: "SynqAI Sports",
  webDir: "www",
  server: {
    url: serverUrl,
    cleartext: isCleartext,
    androidScheme: "https",
  },
  android: {
    allowMixedContent: true,
    captureInput: true,
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 2000,
      launchAutoHide: true,
      backgroundColor: "#050812",
      androidScaleType: "CENTER_CROP",
      showSpinner: false,
      androidSpinnerStyle: "small",
      spinnerColor: "#22d3ee",
    },
  },
};

export default config;
