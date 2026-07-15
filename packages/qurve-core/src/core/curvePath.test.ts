import { describe, expect, it, vi } from 'vitest';
import { appendCurve } from './curvePath';

function createMockContext() {
  return {
    lineTo: vi.fn(),
    bezierCurveTo: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

describe('appendCurve', () => {
  const points = [
    { x: 0, y: 0 },
    { x: 10, y: 10 },
    { x: 20, y: 5 },
    { x: 30, y: 15 },
  ];

  it('draws linear with lineTo', () => {
    const ctx = createMockContext();
    appendCurve(ctx, points, 'linear');
    expect(ctx.lineTo).toHaveBeenCalledTimes(3);
    expect(ctx.bezierCurveTo).not.toHaveBeenCalled();
  });

  it('draws monotone with hermite beziers (Steffen / d3-compatible)', () => {
    const ctx = createMockContext();
    appendCurve(ctx, points, 'monotone');
    // 3 segments for 4 points
    expect(ctx.bezierCurveTo).toHaveBeenCalledTimes(3);
  });

  it('does not overshoot on a monotone rising series', () => {
    // Strictly increasing y — control points must stay within y range of segment ends.
    const rising = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 20 },
      { x: 30, y: 30 },
    ];
    const ctx = createMockContext();
    appendCurve(ctx, rising, 'monotone');
    for (const call of (ctx.bezierCurveTo as ReturnType<typeof vi.fn>).mock.calls) {
      const [, cy1, , cy2, , y] = call as number[];
      expect(cy1).toBeGreaterThanOrEqual(0);
      expect(cy2).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(30);
    }
  });

  it('draws stepBefore and stepAfter', () => {
    const ctx = createMockContext();
    appendCurve(ctx, points.slice(0, 2), 'stepBefore');
    expect(ctx.lineTo).toHaveBeenCalledWith(0, 10);
    expect(ctx.lineTo).toHaveBeenCalledWith(10, 10);

    const ctx2 = createMockContext();
    appendCurve(ctx2, points.slice(0, 2), 'stepAfter');
    expect(ctx2.lineTo).toHaveBeenCalledWith(10, 0);
    expect(ctx2.lineTo).toHaveBeenCalledWith(10, 10);
  });
});
