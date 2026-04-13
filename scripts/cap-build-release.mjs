#!/usr/bin/env node
/**
 * Release Android: sincroniza Capacitor y ejecuta Gradle assembleRelease (mismo artefacto que
 * Android Studio → Build → Generate Signed Bundle / APK, salvo el paso de firma en UI).
 *
 * Requisitos: Android SDK, JDK 17+, variable ANDROID_HOME o ANDROID_SDK_ROOT.
 * Opcional: CAPACITOR_SERVER_URL (debe coincidir con el origen de deep links en build.gradle).
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const androidDir = path.join(root, "android");

function run(cmd, args, cwd) {
  const r = spawnSync(cmd, args, {
    cwd,
    stdio: "inherit",
    shell: process.platform === "win32",
    env: process.env,
  });
  if (r.status !== 0) {
    process.exit(r.status ?? 1);
  }
}

if (!fs.existsSync(androidDir)) {
  console.error("No existe android/. Ejecuta: npx cap add android");
  process.exit(1);
}

console.log("[cap:build-release] npx cap sync android …");
run("npx", ["cap", "sync", "android"], root);

const gradle = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const gradlePath = path.join(androidDir, process.platform === "win32" ? "gradlew.bat" : "gradlew");
if (!fs.existsSync(gradlePath)) {
  console.error("No se encontró", gradlePath);
  process.exit(1);
}

console.log("[cap:build-release]", gradle, "assembleRelease …");
run(gradle, ["assembleRelease"], androidDir);

const apk = path.join(
  androidDir,
  "app",
  "build",
  "outputs",
  "apk",
  "release",
  "app-release-unsigned.apk",
);
console.log("\n[cap:build-release] Listo.");
if (fs.existsSync(apk)) {
  console.log("APK sin firmar (por defecto):", apk);
  console.log(
    "Para Play Store o instalación firmada: abre Android Studio → Build → Generate Signed Bundle / APK,",
  );
  console.log("o configura signingConfig release en android/app/build.gradle.");
} else {
  console.log("Revisa android/app/build/outputs/ por el APK o AAB generado.");
}
