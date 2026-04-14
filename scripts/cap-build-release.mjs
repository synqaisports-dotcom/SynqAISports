#!/usr/bin/env node
/**
 * Release Android 100% terminal (sin Android Studio):
 * 1) Build estático (www) excluyendo app/api
 * 2) cap sync android (modo embebido local)
 * 3) gradlew assembleRelease firmado (si credenciales de keystore están presentes)
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

function requireEnv(name) {
  const v = process.env[name];
  if (!v || !v.trim()) {
    console.error(`[cap:build-release] Falta variable requerida: ${name}`);
    process.exit(1);
  }
  return v;
}

if (!fs.existsSync(androidDir)) {
  console.error("No existe android/. Ejecuta: npx cap add android");
  process.exit(1);
}

if (!process.env.ANDROID_HOME && !process.env.ANDROID_SDK_ROOT) {
  console.error("[cap:build-release] Falta ANDROID_HOME o ANDROID_SDK_ROOT.");
  process.exit(1);
}

const keystorePath = requireEnv("ANDROID_KEYSTORE_PATH");
requireEnv("ANDROID_KEYSTORE_PASSWORD");
requireEnv("ANDROID_KEY_ALIAS");
requireEnv("ANDROID_KEY_PASSWORD");

if (!fs.existsSync(keystorePath)) {
  console.error(`[cap:build-release] Keystore no encontrado: ${keystorePath}`);
  process.exit(1);
}

console.log("[cap:build-release] build estático para Capacitor (www) …");
run("node", ["scripts/build-capacitor-static.mjs"], root);

console.log("[cap:build-release] npx cap sync android (embed local www) …");
process.env.CAPACITOR_EMBED_LOCAL = "1";
run("npx", ["cap", "sync", "android"], root);

const gradle = process.platform === "win32" ? "gradlew.bat" : "./gradlew";
const gradlePath = path.join(androidDir, process.platform === "win32" ? "gradlew.bat" : "gradlew");
if (!fs.existsSync(gradlePath)) {
  console.error("No se encontró", gradlePath);
  process.exit(1);
}

console.log("[cap:build-release]", gradle, "assembleRelease (signed) …");
run(gradle, ["assembleRelease"], androidDir);

const apk = path.join(
  androidDir,
  "app",
  "build",
  "outputs",
  "apk",
  "release",
  "app-release.apk",
);
console.log("\n[cap:build-release] Listo.");
if (fs.existsSync(apk)) {
  console.log("APK firmado:", apk);
} else {
  console.log("No se encontró app-release.apk. Revisa android/app/build/outputs/.");
}
