import paths from '@/components/brand/wordmark-paths.json';

export type WordmarkPath = { char: string; d: string };

export type WordmarkData = {
  viewBox: string;
  wordmark: {
    width: number;
    height: number;
    baselineY: number;
    synq: WordmarkPath[];
    ai: WordmarkPath[];
  };
  tagline: {
    paths: WordmarkPath[];
    width: number;
    baselineY: number;
    size: number;
  };
  font: string;
  fontNote: string;
};

export const WORDMARK_DATA = paths as WordmarkData;

const [vbX, vbY, vbW, vbH] = WORDMARK_DATA.viewBox.split(' ').map(Number);

export const WORDMARK_VIEWBOX = { x: vbX, y: vbY, width: vbW, height: vbH };
