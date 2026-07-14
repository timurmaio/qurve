import { describe, expect, it, vi } from 'vitest';
import {
  cartesianToPolarAngle,
  findClosestRadarIndex,
  getAngleTicks,
  getPolarLayout,
  polarToCartesian,
  projectRadarPoints,
  resolveRadiusDomain,
  scaleRadius,
} from './polarMath';
import { drawPolarGrid, drawRadarPolygon } from './drawPolar';

function createMockContext() {
  return {
    save: vi.fn(),
    restore: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    arc: vi.fn(),
    stroke: vi.fn(),
    fill: vi.fn(),
    fillText: vi.fn(),
    setLineDash: vi.fn(),
    strokeStyle: '#000',
    fillStyle: '#000',
    lineWidth: 1,
    globalAlpha: 1,
    font: '',
    textAlign: 'start' as CanvasTextAlign,
    textBaseline: 'alphabetic' as CanvasTextBaseline,
  } as unknown as CanvasRenderingContext2D;
}

describe('polarMath', () => {
  it('places angle 0 at top (12 o\'clock)', () => {
    const point = polarToCartesian(100, 100, 50, 0);
    expect(point.x).toBeCloseTo(100);
    expect(point.y).toBeCloseTo(50);
  });

  it('converts cartesian back to polar angle', () => {
    const point = polarToCartesian(100, 100, 40, 90);
    expect(cartesianToPolarAngle(100, 100, point.x, point.y)).toBeCloseTo(90, 5);
  });

  it('computes layout from chart box', () => {
    const layout = getPolarLayout({
      width: 400,
      height: 300,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    });
    expect(layout.cx).toBe(200);
    expect(layout.cy).toBe(150);
    expect(layout.outerRadius).toBeGreaterThan(0);
  });

  it('projects radar points and finds closest index', () => {
    const data = [
      { subject: 'A', value: 80 },
      { subject: 'B', value: 40 },
      { subject: 'C', value: 60 },
    ];
    const layout = { cx: 100, cy: 100, outerRadius: 80 };
    const domain = resolveRadiusDomain(data, ['value']);
    const points = projectRadarPoints({ data, dataKey: 'value', layout, domain });
    expect(points).toHaveLength(3);
    expect(getAngleTicks(3)).toEqual([0, 120, 240]);

    const top = polarToCartesian(layout.cx, layout.cy, 50, 0);
    expect(findClosestRadarIndex(points, layout, top.x, top.y)).toBe(0);
  });

  it('scales radius within domain', () => {
    expect(scaleRadius(50, [0, 100], 80)).toBe(40);
    expect(scaleRadius(-10, [0, 100], 80)).toBe(0);
  });
});

describe('drawPolar', () => {
  it('draws polar grid and radar polygon', () => {
    const ctx = createMockContext();
    const layout = { cx: 100, cy: 100, outerRadius: 80 };

    drawPolarGrid({
      ctx,
      layout,
      angleCount: 4,
      radiusDomain: [0, 100],
      tickCount: 3,
    });
    expect(ctx.stroke).toHaveBeenCalled();

    drawRadarPolygon({
      ctx,
      points: [
        { x: 100, y: 40, angle: 0, radius: 60, index: 0, value: 75 },
        { x: 160, y: 100, angle: 90, radius: 60, index: 1, value: 75 },
        { x: 100, y: 160, angle: 180, radius: 60, index: 2, value: 75 },
      ],
      fillOpacity: 0.3,
      dot: true,
    });
    expect(ctx.fill).toHaveBeenCalled();
    expect(ctx.stroke).toHaveBeenCalled();
  });
});
