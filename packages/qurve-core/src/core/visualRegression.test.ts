/**
 * Pixel goldens for geometry-heavy draws (no text — font metrics vary by OS).
 * Regenerate: UPDATE_VISUAL_GOLDENS=1 pnpm test visualRegression
 */
import { createCanvas } from '@napi-rs/canvas';
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import pixelmatch from 'pixelmatch';
import { PNG } from 'pngjs';
import { describe, expect, it } from 'vitest';
import { drawLinePath } from './drawLine';
import { buildRadialBarSectors, drawRadialBars } from './drawRadialBar';
import { drawSankey, layoutSankey } from './drawSankey';

const FIXTURE_DIR = join(dirname(fileURLToPath(import.meta.url)), '__visual__');
const UPDATE = process.env.UPDATE_VISUAL_GOLDENS === '1';
/** Allow tiny AA drift between macOS / Linux @napi-rs/canvas builds. */
const MAX_DIFF_PIXELS = 48;
const PIXELMATCH_THRESHOLD = 0.1;

function assertMatchesGolden(name: string, pngBuffer: Buffer) {
  mkdirSync(FIXTURE_DIR, { recursive: true });
  const goldenPath = join(FIXTURE_DIR, `${name}.png`);

  if (UPDATE || !existsSync(goldenPath)) {
    writeFileSync(goldenPath, pngBuffer);
    if (!UPDATE) {
      throw new Error(`Wrote missing golden ${goldenPath}; re-run without UPDATE to verify.`);
    }
    return;
  }

  const actual = PNG.sync.read(pngBuffer);
  const expected = PNG.sync.read(readFileSync(goldenPath));
  expect(actual.width).toBe(expected.width);
  expect(actual.height).toBe(expected.height);

  const diff = new PNG({ width: actual.width, height: actual.height });
  const mismatched = pixelmatch(
    actual.data,
    expected.data,
    diff.data,
    actual.width,
    actual.height,
    { threshold: PIXELMATCH_THRESHOLD },
  );

  if (mismatched > MAX_DIFF_PIXELS) {
    writeFileSync(join(FIXTURE_DIR, `${name}.diff.png`), PNG.sync.write(diff));
    writeFileSync(join(FIXTURE_DIR, `${name}.actual.png`), pngBuffer);
  }
  expect(mismatched).toBeLessThanOrEqual(MAX_DIFF_PIXELS);
}

describe('visual regression — canvas PNG goldens', () => {
  it('monotone line', () => {
    const canvas = createCanvas(240, 120);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 240, 120);
    drawLinePath({
      ctx: ctx as unknown as CanvasRenderingContext2D,
      points: [
        { x: 20, y: 90, value: 10, index: 0 },
        { x: 60, y: 30, value: 70, index: 1 },
        { x: 110, y: 70, value: 40, index: 2 },
        { x: 160, y: 20, value: 90, index: 3 },
        { x: 210, y: 50, value: 55, index: 4 },
      ],
      type: 'monotone',
      stroke: '#2563eb',
      strokeWidth: 2.5,
    });
    assertMatchesGolden('line-monotone', canvas.toBuffer('image/png'));
  });

  it('radial bar rings', () => {
    const canvas = createCanvas(200, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 200, 200);
    const sectors = buildRadialBarSectors({
      data: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
      values: [80, 55, 30],
      names: ['A', 'B', 'C'],
      colors: ['#ef4444', '#22c55e', '#3b82f6'],
      cx: 100,
      cy: 100,
      innerRadius: 20,
      outerRadius: 90,
      startAngle: 0,
      endAngle: 270,
      maxValue: 100,
      barSize: 18,
    });
    drawRadialBars({
      ctx: ctx as unknown as CanvasRenderingContext2D,
      sectors,
      hoveredIndex: null,
      hoverOpacity: 0.4,
      background: true,
    });
    assertMatchesGolden('radial-bars', canvas.toBuffer('image/png'));
  });

  it('sankey flow', () => {
    const canvas = createCanvas(320, 200);
    const ctx = canvas.getContext('2d');
    ctx.fillStyle = '#ffffff';
    ctx.fillRect(0, 0, 320, 200);
    const { nodes, links } = layoutSankey({
      data: {
        nodes: [{ name: 'A' }, { name: 'B' }, { name: 'C' }],
        links: [
          { source: 0, target: 1, value: 40 },
          { source: 0, target: 2, value: 20 },
          { source: 1, target: 2, value: 30 },
        ],
      },
      colors: ['#6366f1', '#14b8a6', '#f59e0b'],
      plotX: 10,
      plotY: 10,
      plotWidth: 300,
      plotHeight: 180,
      nodeWidth: 14,
    });
    drawSankey({
      ctx: ctx as unknown as CanvasRenderingContext2D,
      nodes,
      links,
      hoveredIndex: null,
      hoverOpacity: 0.4,
      linkOpacity: 0.45,
    });
    assertMatchesGolden('sankey-flow', canvas.toBuffer('image/png'));
  });
});
