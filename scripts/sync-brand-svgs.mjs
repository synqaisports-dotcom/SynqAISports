#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const data = JSON.parse(readFileSync(join(__dirname, '../src/components/brand/wordmark-paths.json'), 'utf8'));
const brandDir = join(__dirname, '../public/brand');

const ICON_PATHS = `    <path d="M50 8 84.64 28V72L50 92 15.36 72V28L50 8Z" stroke="url(#hex-stroke)" stroke-width="3" filter="url(#glow)"/>
    <path d="M50 16 76.16 31.1V68.9L50 84 23.84 68.9V31.1L50 16Z" fill="url(#hex-fill)" stroke="#00E5FF" stroke-opacity="0.28" stroke-width="1.2"/>
    <circle cx="50" cy="54" r="3.2" stroke="#00E5FF" stroke-width="1.4" fill="none"/>
    <circle cx="32" cy="38" r="3.4" fill="#00E5FF"/>
    <circle cx="28" cy="58" r="3.4" fill="#00E5FF"/>
    <circle cx="38" cy="72" r="3.4" fill="#00E5FF"/>
    <circle cx="66" cy="42" r="3.4" fill="#00E5FF"/>
    <circle cx="70" cy="64" r="3.4" fill="#00E5FF"/>
    <path d="M50 54 32 38" stroke="#00E5FF" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 54 28 58" stroke="#00E5FF" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 54 66 42" stroke="#00E5FF" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M32 38 28 58" stroke="#00E5FF" stroke-width="1.2" stroke-dasharray="3 2.5" stroke-opacity="0.9"/>
    <path d="M28 58 38 72" stroke="#00E5FF" stroke-width="1.2" stroke-dasharray="3 2.5" stroke-opacity="0.9"/>
    <path d="M38 72 Q52 58 70 64" stroke="#00E5FF" stroke-width="1.3" fill="none" stroke-linecap="round"/>
    <g stroke="#00E5FF" stroke-width="1.3" stroke-linecap="round">
      <path d="M72 34 l3.5 3.5M75.5 34 l-3.5 3.5"/>
      <path d="M24 74 l3 3M27 74 l-3 3"/>
    </g>
    <circle cx="74" cy="70" r="2.6" stroke="#00E5FF" stroke-width="1.3" fill="none"/>`;

function pathLines(items, fill, opacity = 1) {
  return items
    .filter((p) => p.d)
    .map((p) => `  <path d="${p.d}" fill="${fill}"${opacity < 1 ? ` opacity="${opacity}"` : ''}/>`)
    .join('\n');
}

const synq = pathLines(data.wordmark.synq, '#FFFFFF');
const ai = pathLines(data.wordmark.ai, '#00E5FF');
const tagline = pathLines(data.tagline.paths, '#FFFFFF', 0.92);
const taglineMuted = pathLines(data.tagline.paths, '#94A3B8', 1);
const [vbW, vbH] = data.viewBox.split(' ').slice(2);

writeFileSync(
  join(brandDir, 'synqai-wordmark.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${vbW} ${vbH}" fill="none" role="img" aria-label="SynqAI">
${synq}
${ai}
${tagline}
</svg>
`
);

writeFileSync(
  join(brandDir, 'synqai-logo-horizontal.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 420 88" fill="none" role="img" aria-label="SynqAI">
  <defs>
    <linearGradient id="h-stroke" x1="8" y1="8" x2="72" y2="80" gradientUnits="userSpaceOnUse">
      <stop stop-color="#66F7FF"/>
      <stop offset="1" stop-color="#00E5FF"/>
    </linearGradient>
    <linearGradient id="h-fill" x1="40" y1="14" x2="40" y2="74" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0A1522"/>
      <stop offset="1" stop-color="#050A14"/>
    </linearGradient>
  </defs>
  <g transform="translate(4 4) scale(0.8)">
    <path d="M50 8 84.64 28V72L50 92 15.36 72V28L50 8Z" stroke="url(#h-stroke)" stroke-width="3"/>
    <path d="M50 16 76.16 31.1V68.9L50 84 23.84 68.9V31.1L50 16Z" fill="url(#h-fill)" stroke="#00E5FF" stroke-opacity="0.28" stroke-width="1.2"/>
    <circle cx="50" cy="54" r="3.2" stroke="#00E5FF" stroke-width="1.4" fill="none"/>
    <circle cx="32" cy="38" r="3.4" fill="#00E5FF"/>
    <circle cx="28" cy="58" r="3.4" fill="#00E5FF"/>
    <circle cx="38" cy="72" r="3.4" fill="#00E5FF"/>
    <circle cx="66" cy="42" r="3.4" fill="#00E5FF"/>
    <circle cx="70" cy="64" r="3.4" fill="#00E5FF"/>
    <path d="M50 54 32 38" stroke="#00E5FF" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 54 28 58" stroke="#00E5FF" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M50 54 66 42" stroke="#00E5FF" stroke-width="1.6" stroke-linecap="round"/>
    <path d="M32 38 28 58" stroke="#00E5FF" stroke-width="1.2" stroke-dasharray="3 2.5"/>
    <path d="M28 58 38 72" stroke="#00E5FF" stroke-width="1.2" stroke-dasharray="3 2.5"/>
    <path d="M38 72 Q52 58 70 64" stroke="#00E5FF" stroke-width="1.3" fill="none"/>
  </g>
  <g transform="translate(96 8) scale(0.33)">
${synq}
${ai}
${taglineMuted}
  </g>
</svg>
`
);

const stackedScale = 0.62;
const stackedX = (480 - Number(vbW) * stackedScale) / 2;
const stackedY = 388;

writeFileSync(
  join(brandDir, 'synqai-logo-stacked.svg'),
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 480 560" fill="none" role="img" aria-label="SynqAI Club and Tactics Platform">
  <defs>
    <linearGradient id="bg" x1="240" y1="0" x2="240" y2="560" gradientUnits="userSpaceOnUse">
      <stop stop-color="#050A14"/>
      <stop offset="1" stop-color="#02060C"/>
    </linearGradient>
    <linearGradient id="hex-stroke" x1="120" y1="60" x2="360" y2="300" gradientUnits="userSpaceOnUse">
      <stop stop-color="#66F7FF"/>
      <stop offset="1" stop-color="#00E5FF"/>
    </linearGradient>
    <linearGradient id="hex-fill" x1="240" y1="80" x2="240" y2="280" gradientUnits="userSpaceOnUse">
      <stop stop-color="#0A1522"/>
      <stop offset="1" stop-color="#050A14"/>
    </linearGradient>
    <pattern id="hex-grid" width="28" height="24.25" patternUnits="userSpaceOnUse" patternTransform="scale(1.4)">
      <path d="M14 0 L28 8.25 L28 24.75 L14 33 L0 24.75 L0 8.25 Z" fill="none" stroke="#00E5FF" stroke-opacity="0.06" stroke-width="0.6"/>
    </pattern>
    <filter id="glow" x="-30%" y="-30%" width="160%" height="160%">
      <feGaussianBlur stdDeviation="4" result="blur"/>
      <feMerge>
        <feMergeNode in="blur"/>
        <feMergeNode in="SourceGraphic"/>
      </feMerge>
    </filter>
  </defs>
  <rect width="480" height="560" fill="url(#bg)"/>
  <rect width="480" height="560" fill="url(#hex-grid)" opacity="0.55"/>
  <ellipse cx="240" cy="520" rx="180" ry="24" fill="#00E5FF" opacity="0.08"/>
  <g transform="translate(140 48) scale(2)">
${ICON_PATHS}
  </g>
  <g transform="translate(${stackedX} ${stackedY}) scale(${stackedScale})">
${synq}
${ai}
${tagline}
  </g>
</svg>
`
);

console.log('SVGs de marca sincronizados.');
