/**
 * Curve path builders for canvas.
 * Monotone X uses Steffen (1990) slopes — ported from d3-shape `curveMonotoneX` (ISC).
 */

export type CurveType = 'linear' | 'monotone' | 'step' | 'stepBefore' | 'stepAfter';

export interface CurvePoint {
  x: number;
  y: number;
}

function sign(x: number): number {
  return x < 0 ? -1 : 1;
}

/** One-sided slope at an endpoint. */
function slope2(x0: number, y0: number, x1: number, y1: number, t: number): number {
  const h = x1 - x0;
  return h ? (3 * (y1 - y0) / h - t) / 2 : t;
}

/**
 * Interior tangent slope (Steffen).
 * Zero-width spans follow d3's `h0 || (h1 < 0 && -0)` guard.
 */
function slope3(
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  const h0 = x1 - x0;
  const h1 = x2 - x1;
  const s0 = (y1 - y0) / (h0 || (h1 < 0 ? -0 : 0));
  const s1 = (y2 - y1) / (h1 || (h0 < 0 ? -0 : 0));
  const p = (s0 * h1 + s1 * h0) / (h0 + h1);
  return (sign(s0) + sign(s1)) * Math.min(Math.abs(s0), Math.abs(s1), 0.5 * Math.abs(p)) || 0;
}

function bezierHermite(
  ctx: CanvasRenderingContext2D,
  x0: number,
  y0: number,
  x1: number,
  y1: number,
  t0: number,
  t1: number,
): void {
  const dx = (x1 - x0) / 3;
  ctx.bezierCurveTo(x0 + dx, y0 + dx * t0, x1 - dx, y1 - dx * t1, x1, y1);
}

/** Append monotone-X cubic Hermite segments (caller already at points[0]). */
function appendMonotoneX(ctx: CanvasRenderingContext2D, points: CurvePoint[]): void {
  const n = points.length;
  if (n < 2) return;

  let x0 = NaN;
  let y0 = NaN;
  let x1 = +points[0].x;
  let y1 = +points[0].y;
  let t0 = NaN;
  let pointState = 1;

  for (let i = 1; i < n; i++) {
    const x = +points[i].x;
    const y = +points[i].y;
    if (x === x1 && y === y1) continue;

    let t1 = NaN;
    switch (pointState) {
      case 1:
        pointState = 2;
        break;
      case 2:
        pointState = 3;
        t1 = slope3(x0, y0, x1, y1, x, y);
        bezierHermite(ctx, x0, y0, x1, y1, slope2(x0, y0, x1, y1, t1), t1);
        break;
      default:
        t1 = slope3(x0, y0, x1, y1, x, y);
        bezierHermite(ctx, x0, y0, x1, y1, t0, t1);
        break;
    }

    x0 = x1;
    y0 = y1;
    x1 = x;
    y1 = y;
    t0 = t1;
  }

  if (pointState === 2) {
    ctx.lineTo(x1, y1);
  } else if (pointState >= 3) {
    bezierHermite(ctx, x0, y0, x1, y1, t0, slope2(x0, y0, x1, y1, t0));
  }
}

/**
 * Append curve segments after the current path position (already at `points[0]`).
 * For monotone, x-values must be monotonic (increasing or decreasing).
 */
export function appendCurve(
  ctx: CanvasRenderingContext2D,
  points: CurvePoint[],
  type: CurveType = 'linear',
): void {
  if (points.length < 2) return;

  switch (type) {
    case 'linear':
      for (let i = 1; i < points.length; i++) {
        ctx.lineTo(points[i].x, points[i].y);
      }
      return;
    case 'step':
    case 'stepAfter':
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        ctx.lineTo(curr.x, prev.y);
        ctx.lineTo(curr.x, curr.y);
      }
      return;
    case 'stepBefore':
      for (let i = 1; i < points.length; i++) {
        const prev = points[i - 1];
        const curr = points[i];
        ctx.lineTo(prev.x, curr.y);
        ctx.lineTo(curr.x, curr.y);
      }
      return;
    case 'monotone':
      appendMonotoneX(ctx, points);
      return;
    default: {
      const _exhaustive: never = type;
      return _exhaustive;
    }
  }
}
