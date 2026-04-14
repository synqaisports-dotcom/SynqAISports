#!/usr/bin/env node
/**
 * Build estático para Capacitor:
 * - excluye temporalmente src/app/api del output export
 * - ejecuta next build con output: export (vía CAPACITOR_STATIC_EXPORT=1)
 * - copia /out a /www
 */
import { spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const TEMP_HIDDEN = [
  ["src/app/api", "src/app/_api.capacitor-hidden"],
  ["src/app/admin-global", "src/app/_admin-global.capacitor-hidden"],
  ["src/ai", "src/_ai.capacitor-hidden"],
  ["src/app/dashboard/coach/exercises/page.tsx", "src/app/dashboard/coach/exercises/_page.capacitor-hidden.tsx"],
  ["src/app/dashboard/coach/planner/page.tsx", "src/app/dashboard/coach/planner/_page.capacitor-hidden.tsx"],
];
const outDir = path.join(root, "out");
const wwwDir = path.join(root, "www");

function run(command, args, cwd, env = process.env) {
  const result = spawnSync(command, args, {
    cwd,
    env,
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

function moveOutForCapacitorBuild() {
  const moved = [];
  for (const [srcRel, dstRel] of TEMP_HIDDEN) {
    const src = path.join(root, srcRel);
    const dst = path.join(root, dstRel);
    if (!fs.existsSync(src)) continue;
    if (fs.existsSync(dst)) {
      fs.rmSync(dst, { recursive: true, force: true });
    }
    fs.renameSync(src, dst);
    moved.push([src, dst]);
  }
  return moved;
}

function restoreAfterCapacitorBuild(moved) {
  for (let i = moved.length - 1; i >= 0; i -= 1) {
    const [src, dst] = moved[i];
    if (fs.existsSync(src)) {
      fs.rmSync(src, { recursive: true, force: true });
    }
    if (fs.existsSync(dst)) {
      fs.renameSync(dst, src);
    }
  }
}

function copyOutToWww() {
  if (!fs.existsSync(outDir)) {
    console.error("[build:capacitor-static] No existe /out tras next build.");
    process.exit(1);
  }
  fs.rmSync(wwwDir, { recursive: true, force: true });
  fs.mkdirSync(wwwDir, { recursive: true });
  fs.cpSync(outDir, wwwDir, { recursive: true });
}

const moved = moveOutForCapacitorBuild();
try {
  const env = { ...process.env, CAPACITOR_STATIC_EXPORT: "1" };
  run("npx", ["next", "build"], root, env);
  copyOutToWww();
  console.log("[build:capacitor-static] OK -> www/");
} finally {
  restoreAfterCapacitorBuild(moved);
}
