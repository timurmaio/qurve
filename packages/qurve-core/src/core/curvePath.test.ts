import { describe, expect, it, vi } from 'vitest';
import { appendCurve, type CurvePoint } from './curvePath';

type Cmd =
  | ['M', number, number]
  | ['L', number, number]
  | ['C', number, number, number, number, number, number];

function recordCurve(points: CurvePoint[], type: Parameters<typeof appendCurve>[2]): Cmd[] {
  const cmds: Cmd[] = [];
  const ctx = {
    moveTo: (x: number, y: number) => {
      cmds.push(['M', x, y]);
    },
    lineTo: (x: number, y: number) => {
      cmds.push(['L', x, y]);
    },
    bezierCurveTo: (
      cp1x: number,
      cp1y: number,
      cp2x: number,
      cp2y: number,
      x: number,
      y: number,
    ) => {
      cmds.push(['C', cp1x, cp1y, cp2x, cp2y, x, y]);
    },
  } as unknown as CanvasRenderingContext2D;

  if (points.length === 0) return cmds;
  ctx.moveTo(points[0].x, points[0].y);
  appendCurve(ctx, points, type);
  return cmds;
}

function expectCloseCmds(actual: Cmd[], expected: Cmd[], digits = 10) {
  expect(actual).toHaveLength(expected.length);
  for (let i = 0; i < expected.length; i++) {
    expect(actual[i][0]).toBe(expected[i][0]);
    for (let j = 1; j < expected[i].length; j++) {
      expect(actual[i][j] as number).toBeCloseTo(expected[i][j] as number, digits);
    }
  }
}

/** Sample cubic Bézier (de Casteljau). */
function sampleCubic(
  p0: { x: number; y: number },
  c1: { x: number; y: number },
  c2: { x: number; y: number },
  p1: { x: number; y: number },
  t: number,
): { x: number; y: number } {
  const u = 1 - t;
  return {
    x: u * u * u * p0.x + 3 * u * u * t * c1.x + 3 * u * t * t * c2.x + t * t * t * p1.x,
    y: u * u * u * p0.y + 3 * u * u * t * c1.y + 3 * u * t * t * c2.y + t * t * t * p1.y,
  };
}

/** Walk recorded path and sample points along cubics/lines. */
function samplePath(cmds: Cmd[], samplesPerSeg = 20): { x: number; y: number }[] {
  const out: { x: number; y: number }[] = [];
  let cur = { x: 0, y: 0 };
  for (const cmd of cmds) {
    if (cmd[0] === 'M') {
      cur = { x: cmd[1], y: cmd[2] };
      out.push({ ...cur });
    } else if (cmd[0] === 'L') {
      const next = { x: cmd[1], y: cmd[2] };
      for (let i = 1; i <= samplesPerSeg; i++) {
        const t = i / samplesPerSeg;
        out.push({
          x: cur.x + (next.x - cur.x) * t,
          y: cur.y + (next.y - cur.y) * t,
        });
      }
      cur = next;
    } else {
      const c1 = { x: cmd[1], y: cmd[2] };
      const c2 = { x: cmd[3], y: cmd[4] };
      const p1 = { x: cmd[5], y: cmd[6] };
      for (let i = 1; i <= samplesPerSeg; i++) {
        out.push(sampleCubic(cur, c1, c2, p1, i / samplesPerSeg));
      }
      cur = p1;
    }
  }
  return out;
}

describe('appendCurve monotoneX — d3-shape golden paths', () => {
  /**
   * Goldens captured from `d3-shape@3.2.0` `curveMonotoneX` with a canvas context.
   * If these drift, we diverged from d3 / Recharts visual parity.
   */
  it('matches d3 zigzag', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 20 },
      { x: 20, y: 10 },
      { x: 30, y: 40 },
      { x: 40, y: 35 },
    ];
    expectCloseCmds(recordCurve(points, 'monotone'), [
      ['M', 0, 0],
      ['C', 3.3333333333333335, 10, 6.666666666666666, 20, 10, 20],
      ['C', 13.333333333333334, 20, 16.666666666666668, 10, 20, 10],
      ['C', 23.333333333333332, 10, 26.666666666666668, 40, 30, 40],
      ['C', 33.333333333333336, 40, 36.666666666666664, 37.5, 40, 35],
    ]);
  });

  it('matches d3 rising line', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 20 },
      { x: 30, y: 30 },
    ];
    expectCloseCmds(recordCurve(points, 'monotone'), [
      ['M', 0, 0],
      ['C', 3.3333333333333335, 3.3333333333333335, 6.666666666666666, 6.666666666666666, 10, 10],
      ['C', 13.333333333333334, 13.333333333333334, 16.666666666666668, 16.666666666666668, 20, 20],
      ['C', 23.333333333333332, 23.333333333333332, 26.666666666666668, 26.666666666666668, 30, 30],
    ]);
  });

  it('matches d3 peak (shape-preserving, no overshoot past local max)', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 30 },
      { x: 20, y: 10 },
      { x: 30, y: 5 },
    ];
    expectCloseCmds(recordCurve(points, 'monotone'), [
      ['M', 0, 0],
      ['C', 3.3333333333333335, 15, 6.666666666666666, 30, 10, 30],
      ['C', 13.333333333333334, 30, 16.666666666666668, 13.333333333333334, 20, 10],
      ['C', 23.333333333333332, 6.666666666666666, 26.666666666666668, 5.833333333333333, 30, 5],
    ]);
  });

  it('matches d3 two-point (lineTo) and flat series', () => {
    expectCloseCmds(recordCurve([{ x: 0, y: 5 }, { x: 10, y: 15 }], 'monotone'), [
      ['M', 0, 5],
      ['L', 10, 15],
    ]);
    expectCloseCmds(
      recordCurve(
        [
          { x: 0, y: 10 },
          { x: 10, y: 10 },
          { x: 20, y: 10 },
        ],
        'monotone',
      ),
      [
        ['M', 0, 10],
        ['C', 3.3333333333333335, 10, 6.666666666666666, 10, 10, 10],
        ['C', 13.333333333333334, 10, 16.666666666666668, 10, 20, 10],
      ],
    );
  });
});

describe('appendCurve monotoneX — geometric invariants', () => {
  it('passes through every input vertex', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 20 },
      { x: 20, y: 10 },
      { x: 30, y: 40 },
      { x: 40, y: 35 },
    ];
    const cmds = recordCurve(points, 'monotone');
    const endpoints = cmds
      .filter((c) => c[0] === 'M' || c[0] === 'L' || c[0] === 'C')
      .map((c) =>
        c[0] === 'C'
          ? { x: c[5], y: c[6] }
          : { x: c[1], y: c[2] },
      );
    // First M + each segment end
    expect(endpoints[0]).toEqual(points[0]);
    for (let i = 1; i < points.length; i++) {
      expect(endpoints[i].x).toBeCloseTo(points[i].x, 10);
      expect(endpoints[i].y).toBeCloseTo(points[i].y, 10);
    }
  });

  it('keeps a strictly rising series non-decreasing when sampled', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 20 },
      { x: 30, y: 30 },
      { x: 40, y: 50 },
    ];
    const samples = samplePath(recordCurve(points, 'monotone'), 40);
    for (let i = 1; i < samples.length; i++) {
      expect(samples[i].x).toBeGreaterThanOrEqual(samples[i - 1].x - 1e-9);
      expect(samples[i].y).toBeGreaterThanOrEqual(samples[i - 1].y - 1e-6);
    }
  });

  it('does not overshoot a local maximum (peak series)', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 30 },
      { x: 20, y: 10 },
      { x: 30, y: 5 },
    ];
    const samples = samplePath(recordCurve(points, 'monotone'), 50);
    const maxY = Math.max(...samples.map((p) => p.y));
    // Shape-preserving: never above the data max
    expect(maxY).toBeLessThanOrEqual(30 + 1e-9);
  });

  it('skips duplicate consecutive points without breaking the path', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 10, y: 10 },
      { x: 20, y: 5 },
    ];
    const cmds = recordCurve(points, 'monotone');
    expect(cmds.some((c) => c[0] === 'C' || c[0] === 'L')).toBe(true);
    const last = cmds[cmds.length - 1];
    const end = last[0] === 'C' ? { x: last[5], y: last[6] } : { x: last[1], y: last[2] };
    expect(end.x).toBeCloseTo(20, 10);
    expect(end.y).toBeCloseTo(5, 10);
  });
});

describe('appendCurve linear / step', () => {
  it('linear visits every point with lineTo', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 5 },
    ];
    expectCloseCmds(recordCurve(points, 'linear'), [
      ['M', 0, 0],
      ['L', 10, 10],
      ['L', 20, 5],
    ]);
  });

  it('stepAfter and stepBefore match Recharts/d3 step semantics', () => {
    const points = [
      { x: 0, y: 0 },
      { x: 10, y: 20 },
    ];
    expectCloseCmds(recordCurve(points, 'stepAfter'), [
      ['M', 0, 0],
      ['L', 10, 0],
      ['L', 10, 20],
    ]);
    expectCloseCmds(recordCurve(points, 'stepBefore'), [
      ['M', 0, 0],
      ['L', 0, 20],
      ['L', 10, 20],
    ]);
    expectCloseCmds(recordCurve(points, 'step'), [
      ['M', 0, 0],
      ['L', 10, 0],
      ['L', 10, 20],
    ]);
  });

  it('no-ops for fewer than 2 points', () => {
    const lineTo = vi.fn();
    const ctx = { lineTo, bezierCurveTo: vi.fn() } as unknown as CanvasRenderingContext2D;
    appendCurve(ctx, [], 'linear');
    appendCurve(ctx, [{ x: 1, y: 2 }], 'monotone');
    expect(lineTo).not.toHaveBeenCalled();
  });
});
