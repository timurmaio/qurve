import { describe, expect, it } from 'vitest';
import { findClosestPointByX, projectPoints, resolveXValue, resolveYValue } from './pointUtils';

describe('pointUtils', () => {
  it('uses index fallback for invalid x values', () => {
    const item = { x: 'not-a-number' } as Record<string, unknown>;
    expect(resolveXValue(item, 3, { dataKey: 'x' })).toBe(3);
    expect(resolveXValue(item, 2, null)).toBe(2);
  });

  it('uses zero fallback for invalid y values', () => {
    const item = { y: 'abc' } as Record<string, unknown>;
    expect(resolveYValue(item, 1, 'y')).toBe(0);
    expect(resolveYValue({}, 1)).toBe(0);
  });

  it('projects points with scales and margins', () => {
    const points = projectPoints({
      data: [
        { x: 1, y: 10 },
        { x: 2, y: 20 },
      ],
      margin: { left: 5, top: 7 },
      xAxis: { dataKey: 'x' },
      dataKey: 'y',
      getXScale: () => (value: number) => value * 10,
      getYScale: () => (value: number) => 100 - value,
    });

    expect(points).toEqual([
      { x: 15, y: 97, value: 10, index: 0 },
      { x: 25, y: 87, value: 20, index: 1 },
    ]);
  });

  it('finds closest points by x', () => {
    const points = [
      { x: 0, y: 0, value: 0, index: 0 },
      { x: 10, y: 0, value: 0, index: 1 },
      { x: 20, y: 0, value: 0, index: 2 },
    ];

    expect(findClosestPointByX([], 5)).toBeNull();
    expect(findClosestPointByX(points, -10)?.index).toBe(0);
    expect(findClosestPointByX(points, 100)?.index).toBe(2);
    expect(findClosestPointByX(points, 6)?.index).toBe(1);
  });
});
