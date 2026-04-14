#!/usr/bin/env node
/**
 * Flujo único:
 * 1) git add . && git commit && git push
 * 2) build estático para Capacitor (ignora app/api)
 * 3) build release APK firmado
 */
import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = spawnSync(command, args, {
    stdio: "inherit",
    shell: process.platform === "win32",
  });
  if (result.status !== 0) {
    process.exit(result.status ?? 1);
  }
}

const branch = spawnSync("git", ["branch", "--show-current"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});
const currentBranch = (branch.stdout || "").trim() || "current-branch";
const commitMsg =
  process.env.PUSH_BUILD_COMMIT_MESSAGE ||
  `chore: push-and-build ${new Date().toISOString().slice(0, 19)}`;

const status = spawnSync("git", ["status", "--porcelain"], {
  encoding: "utf8",
  shell: process.platform === "win32",
});
const hasChanges = Boolean((status.stdout || "").trim());
if (hasChanges) {
  run("git", ["add", "."]);
  run("git", ["commit", "-m", commitMsg]);
}
run("git", ["push", "-u", "origin", currentBranch]);

run("node", ["scripts/build-capacitor-static.mjs"]);
run("node", ["scripts/cap-build-release.mjs"]);
