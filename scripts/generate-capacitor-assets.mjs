/**
 * Genera icon.png (1024) y splash.png (2732) para @capacitor/assets
 * Identidad: Deep Night #050812 + Electric Cyan #22d3ee
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import sharp from "sharp";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, "..");
const assetsDir = path.join(root, "assets");

const deepNight = "#050812";
const cyan = "#22d3ee";

const iconSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="1024" height="1024" viewBox="0 0 1024 1024">
  <rect width="1024" height="1024" fill="${deepNight}"/>
  <circle cx="512" cy="512" r="380" fill="none" stroke="${cyan}" stroke-width="36" opacity="0.35"/>
  <circle cx="512" cy="512" r="300" fill="none" stroke="${cyan}" stroke-width="8"/>
  <text x="512" y="580" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="420" font-weight="800" fill="${cyan}" letter-spacing="-0.05em">S</text>
</svg>`;

const splashSvg = `<?xml version="1.0" encoding="UTF-8"?>
<svg xmlns="http://www.w3.org/2000/svg" width="2732" height="2732" viewBox="0 0 2732 2732">
  <defs>
    <radialGradient id="g" cx="50%" cy="40%" r="70%">
      <stop offset="0%" stop-color="#0f172a"/>
      <stop offset="100%" stop-color="${deepNight}"/>
    </radialGradient>
  </defs>
  <rect width="2732" height="2732" fill="url(#g)"/>
  <circle cx="1366" cy="1180" r="520" fill="none" stroke="${cyan}" stroke-width="24" opacity="0.25"/>
  <circle cx="1366" cy="1180" r="400" fill="none" stroke="${cyan}" stroke-width="6" opacity="0.9"/>
  <text x="1366" y="1280" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="520" font-weight="800" fill="${cyan}">S</text>
  <text x="1366" y="2100" text-anchor="middle" font-family="system-ui,Segoe UI,sans-serif" font-size="72" font-weight="700" fill="${cyan}" opacity="0.55" letter-spacing="0.35em">SYNQAI SPORTS</text>
</svg>`;

async function main() {
  fs.mkdirSync(assetsDir, { recursive: true });
  const iconPng = path.join(assetsDir, "icon.png");
  const splashPng = path.join(assetsDir, "splash.png");
  await sharp(Buffer.from(iconSvg)).png().toFile(iconPng);
  await sharp(Buffer.from(splashSvg)).png().toFile(splashPng);
  console.log("OK:", iconPng, splashPng);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
