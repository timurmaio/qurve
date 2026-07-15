/**
 * Live parity vs `d3-shape` (same versions Recharts historically used).
 * Frozen goldens in curvePath.test.ts stay; this catches drift if either side changes.
 */
import { describe, expect, it } from 'vitest';
import {
  curveLinear,
  curveMonotoneX,
  curveStepAfter,
  curveStepBefore,
  line,
} from 'd3-shape';
import { appendCurve, type CurvePoint, type CurveType } from './curvePath';

type Cmd =
  | ['M', number, number]
  | ['L', number, number]
  | ['C', number, number, number, number, number, number];

function recordD3(points: CurvePoint[], curve: typeof curveMonotoneX): Cmd[] {
  const cmds: Cmd[] = [];
  const ctx = {
    moveTo: (x: number, y: number) => {
      cmds.push(['M', x, y]);
    },
    lineTo: (x: number, y: number) => {
      cmds.push(['L', x, y]);
    },
    bezierCurveTo: (
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number,
    ) => {
      cmds.push(['C', a, b, c, d, e, f]);
    },
  };
  line<CurvePoint>()
    .x((p) => p.x)
    .y((p) => p.y)
    .curve(curve)
    .context(ctx as unknown as CanvasRenderingContext2D)(points);
  return cmds;
}

function recordOurs(points: CurvePoint[], type: CurveType): Cmd[] {
  const cmds: Cmd[] = [];
  const ctx = {
    moveTo: (x: number, y: number) => {
      cmds.push(['M', x, y]);
    },
    lineTo: (x: number, y: number) => {
      cmds.push(['L', x, y]);
    },
    bezierCurveTo: (
      a: number,
      b: number,
      c: number,
      d: number,
      e: number,
      f: number,
    ) => {
      cmds.push(['C', a, b, c, d, e, f]);
    },
  } as unknown as CanvasRenderingContext2D;
  ctx.moveTo(points[0].x, points[0].y);
  appendCurve(ctx, points, type);
  return cmds;
}

function expectSame(a: Cmd[], b: Cmd[], digits = 12) {
  expect(a).toHaveLength(b.length);
  for (let i = 0; i < a.length; i++) {
    expect(a[i][0]).toBe(b[i][0]);
    for (let j = 1; j < a[i].length; j++) {
      expect(a[i][j] as number).toBeCloseTo(b[i][j] as number, digits);
    }
  }
}

const FIXTURES: CurvePoint[][] = [
  [
    { x: 0, y: 0 },
    { x: 10, y: 20 },
    { x: 20, y: 10 },
    { x: 30, y: 40 },
    { x: 40, y: 35 },
  ],
  [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 20, y: 20 },
    { x: 30, y: 30 },
  ],
  [
    { x: 0, y: 0 },
    { x: 10, y: 30 },
    { x: 20, y: 10 },
    { x: 30, y: 5 },
  ],
  [
    { x: 0, y: 5 },
    { x: 10, y: 15 },
  ],
  [
    { x: 0, y: 10 },
    { x: 10, y: 10 },
    { x: 20, y: 10 },
  ],
  [
    { x: 0, y: 0 },
    { x: 5, y: 40 },
    { x: 10, y: 5 },
    { x: 15, y: 35 },
    { x: 20, y: 8 },
    { x: 25, y: 22 },
  ],
];

describe('appendCurve — live d3-shape parity', () => {
  it.each([
    ['monotone', curveMonotoneX, 'monotone' as const],
    ['linear', curveLinear, 'linear' as const],
    ['stepAfter', curveStepAfter, 'stepAfter' as const],
    ['stepBefore', curveStepBefore, 'stepBefore' as const],
  ])('%s matches d3-shape', (_label, d3Curve, type) => {
    for (const points of FIXTURES) {
      expectSame(recordOurs(points, type), recordD3(points, d3Curve));
    }
  });

  it('step aliases stepAfter (Recharts), not d3 curveStep midpoints', () => {
    const points = FIXTURES[0];
    expectSame(recordOurs(points, 'step'), recordOurs(points, 'stepAfter'));
    expectSame(recordOurs(points, 'step'), recordD3(points, curveStepAfter));
  });
});
