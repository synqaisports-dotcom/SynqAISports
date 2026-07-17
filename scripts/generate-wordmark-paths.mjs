#!/usr/bin/env node
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import opentype from 'opentype.js';

const __dirname = dirname(fileURLToPath(import.meta.url));
const fontPath = join(__dirname, '.tmp/Aquire-Bold.otf');
const font = opentype.parse(readFileSync(fontPath));

const FONT_SIZE = 100;
const WORDMARK_TRACKING = 0.035;
const TAGLINE_SIZE = 17;
const TAGLINE_TRACKING = 0.28;

function collectPaths(text, startX, baselineY, size, tracking) {
  let cursor = startX;
  const paths = [];
  for (const char of text) {
    const glyph = font.charToGlyph(char);
    if (!glyph || glyph.index === 0) {
      cursor += size * 0.28;
      continue;
    }
    const advance = (glyph.advanceWidth / font.unitsPerEm) * size;
    const path = glyph.getPath(cursor, baselineY, size);
    const d = path.toPathData(2);
    if (d) paths.push({ char, d });
    cursor += advance + size * tracking;
  }
  return { paths, width: cursor - startX - size * tracking, endX: cursor - size * tracking };
}

function renderWordmark() {
  const ascender = (font.ascender / font.unitsPerEm) * FONT_SIZE;
  const baselineY = ascender + 4;
  const wordmarkHeight = ascender + (Math.abs(font.descender) / font.unitsPerEm) * FONT_SIZE + 8;

  const synq = collectPaths('SYNQ', 0, baselineY, FONT_SIZE, WORDMARK_TRACKING);
  const gap = FONT_SIZE * 0.015;
  const ai = collectPaths('AI', synq.endX + gap, baselineY, FONT_SIZE, WORDMARK_TRACKING);
  const wordmarkWidth = ai.endX;

  const taglineBaseline = baselineY + wordmarkHeight * 0.42;
  const tagline = collectPaths(
    'CLUB & TACTICS PLATFORM',
    0,
    taglineBaseline,
    TAGLINE_SIZE,
    TAGLINE_TRACKING
  );

  const totalHeight = taglineBaseline + TAGLINE_SIZE * 0.5;
  const totalWidth = Math.max(wordmarkWidth, tagline.endX);

  const out = {
    viewBox: `0 0 ${Math.ceil(totalWidth)} ${Math.ceil(totalHeight)}`,
    wordmark: {
      width: wordmarkWidth,
      height: wordmarkHeight,
      baselineY,
      synq: synq.paths,
      ai: ai.paths,
    },
    tagline: {
      paths: tagline.paths,
      width: tagline.endX,
      baselineY: taglineBaseline,
      size: TAGLINE_SIZE,
    },
    font: 'Aquire Bold',
    fontNote:
      'Trazos vectoriales del logotipo. Fuente de referencia: Aquire Bold (SesoHQ). No incluir .otf en el repo.',
    generatedAt: new Date().toISOString(),
  };

  writeFileSync(join(__dirname, '../src/components/brand/wordmark-paths.json'), JSON.stringify(out, null, 2));
  console.log('Generated wordmark-paths.json');
}

renderWordmark();
