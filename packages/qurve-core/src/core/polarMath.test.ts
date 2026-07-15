import { describe, expect, it } from 'vitest';
import {
  cartesianToPolarAngle,
  createRadiusTicks,
  degToRad,
  findClosestRadarIndex,
  getAngleTicks,
  getPolarLayout,
  polarToCartesian,
  projectRadarPoints,
  resolveAngleLabel,
  resolveRadiusDomain,
  scaleRadius,
} from './polarMath';

describe('polarMath', () => {
  it('converts degrees to radians', () => {
    expect(degToRad(0)).toBe(0);
    expect(degToRad(180)).toBeCloseTo(Math.PI);
  });

  it('places angle 0 at top (12 o\'clock) and increases clockwise', () => {
    expect(polarToCartesian(100, 100, 50, 0)).toEqual({ x: 100, y: 50 });
    const east = polarToCartesian(100, 100, 50, 90);
    expect(east.x).toBeCloseTo(150);
    expect(east.y).toBeCloseTo(100);
  });

  it('round-trips cartesian → polar angle, including negative atan2 branch', () => {
    const point = polarToCartesian(100, 100, 40, 90);
    expect(cartesianToPolarAngle(100, 100, point.x, point.y)).toBeCloseTo(90, 5);
    // Point above center → near 0
    expect(cartesianToPolarAngle(100, 100, 100, 50)).toBeCloseTo(0, 5);
    // Point to the left → near 270 / wrap
    const west = cartesianToPolarAngle(100, 100, 50, 100);
    expect(west).toBeGreaterThan(180);
  });

  it('computes layout from chart box and clamps outerRadius', () => {
    const layout = getPolarLayout({
      width: 400,
      height: 300,
      margin: { top: 20, right: 20, bottom: 20, left: 20 },
    });
    expect(layout.cx).toBe(200);
    expect(layout.cy).toBe(150);
    expect(layout.outerRadius).toBeGreaterThan(0);

    const capped = getPolarLayout({
      width: 200,
      height: 200,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      outerRadius: 999,
    });
    expect(capped.outerRadius).toBe(100);

    const explicit = getPolarLayout({
      width: 200,
      height: 200,
      margin: { top: 0, right: 0, bottom: 0, left: 0 },
      outerRadius: 40,
    });
    expect(explicit.outerRadius).toBe(40);
  });

  it('builds angle and radius ticks', () => {
    expect(getAngleTicks(3)).toEqual([0, 120, 240]);
    expect(getAngleTicks(0)).toEqual([0]);
    expect(createRadiusTicks([0, 100], 5)).toEqual([0, 25, 50, 75, 100]);
    expect(createRadiusTicks([5, 5], 3)).toEqual([5, 5]);
    expect(createRadiusTicks([NaN, 1], 3)).toEqual([0, 1]);
  });

  it('resolves radius domains including auto padding', () => {
    expect(resolveRadiusDomain([], ['v'], [1, 9])).toEqual([1, 9]);
    expect(resolveRadiusDomain([], ['v'])).toEqual([0, 100]);

    const data = [{ v: 10 }, { v: 10 }];
    const padded = resolveRadiusDomain(data, ['v']);
    expect(padded[0]).toBeLessThanOrEqual(0);
    expect(padded[1]).toBeGreaterThan(10);

    const varied = resolveRadiusDomain([{ v: -5 }, { v: 20 }], ['v']);
    expect(varied).toEqual([-5, 20]);
  });

  it('scales radius and clamps out-of-range values', () => {
    expect(scaleRadius(50, [0, 100], 80)).toBe(40);
    expect(scaleRadius(-10, [0, 100], 80)).toBe(0);
    expect(scaleRadius(200, [0, 100], 80)).toBe(80);
    expect(scaleRadius(10, [5, 5], 80)).toBe(0);
    expect(scaleRadius(NaN, [0, 100], 80)).toBe(0);
  });

  it('projects radar points and finds closest spoke by angle', () => {
    const data = [
      { subject: 'A', value: 80 },
      { subject: 'B', value: 40 },
      { subject: 'C', value: 60 },
    ];
    const layout = { cx: 100, cy: 100, outerRadius: 80 };
    const domain = resolveRadiusDomain(data, ['value']);
    const points = projectRadarPoints({ data, dataKey: 'value', layout, domain });
    expect(points).toHaveLength(3);
    expect(projectRadarPoints({ data: [], dataKey: 'value', layout, domain })).toEqual([]);

    const top = polarToCartesian(layout.cx, layout.cy, 50, 0);
    expect(findClosestRadarIndex(points, layout, top.x, top.y)).toBe(0);
    expect(findClosestRadarIndex([], layout, 0, 0)).toBeNull();

    // Wrap-around: angle near 350 should prefer last spoke at 240 over 0 if closer... 
    // For 3 points, angles 0/120/240. Mouse at 350° → closest is 0 (delta 10 vs 110).
    const nearTop = polarToCartesian(layout.cx, layout.cy, 40, 350);
    expect(findClosestRadarIndex(points, layout, nearTop.x, nearTop.y)).toBe(0);
  });

  it('resolves angle labels from keys and functions', () => {
    expect(resolveAngleLabel({ name: 'CPU' }, 2)).toBe('2');
    expect(resolveAngleLabel({ name: 'CPU' }, 2, 'name')).toBe('CPU');
    expect(resolveAngleLabel({ name: null }, 2, 'name')).toBe('2');
    expect(resolveAngleLabel({ name: 'CPU' }, 2, (item) => String(item.name).toLowerCase())).toBe('cpu');
  });
});
