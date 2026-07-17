#!/usr/bin/env node
import { readFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const __dirname = dirname(fileURLToPath(import.meta.url));
const brandDir = join(__dirname, '../public/brand');
const pngDir = join(brandDir, 'png');
mkdirSync(pngDir, { recursive: true });

async function exportSvg(svgName, outputs) {
  const svg = readFileSync(join(brandDir, svgName));
  for (const output of outputs) {
    const outPath = join(pngDir, output.name);
    let pipeline = sharp(svg, { density: 300 });
    if (output.size) {
      pipeline = pipeline.resize(output.size, output.size);
    } else {
      pipeline = pipeline.resize(output.width, output.height, {
        fit: 'contain',
        background: output.bg ?? { r: 5, g: 10, b: 20, alpha: 1 },
      });
    }
    await pipeline.png().toFile(outPath);
    console.log(`✓ png/${output.name}`);
  }
}

await exportSvg('synqai-icon.svg', [
  { name: 'synqai-icon-512.png', size: 512 },
  { name: 'synqai-icon-192.png', size: 192 },
  { name: 'synqai-icon-128.png', size: 128 },
  { name: 'synqai-icon-64.png', size: 64 },
  { name: 'synqai-icon-32.png', size: 32 },
]);

await exportSvg('synqai-logo-stacked.svg', [
  { name: 'synqai-logo-stacked-1200.png', width: 1200, height: 1400 },
  { name: 'synqai-logo-stacked-800.png', width: 800, height: 933 },
]);

await exportSvg('synqai-logo-horizontal.svg', [
  { name: 'synqai-logo-horizontal-1200.png', width: 1200, height: 252, bg: { r: 0, g: 0, b: 0, alpha: 0 } },
  { name: 'synqai-logo-horizontal-600.png', width: 600, height: 126, bg: { r: 0, g: 0, b: 0, alpha: 0 } },
]);

await exportSvg('synqai-wordmark.svg', [
  { name: 'synqai-wordmark-800.png', width: 800, height: 160, bg: { r: 0, g: 0, b: 0, alpha: 0 } },
]);

const stacked = readFileSync(join(brandDir, 'synqai-logo-stacked.svg'));
await sharp(stacked, { density: 300 }).resize(1024, 1024, { fit: 'cover' }).png().toFile(join(brandDir, 'synqai-logo-marketing.png'));
console.log('✓ synqai-logo-marketing.png');

console.log('\nListo: public/brand/png/');
