import { describe, expect, it } from 'vitest';
import {
  findClosestPointByX,
  projectPoints,
  resolveXValue,
  resolveYValue,
} from './pointUtils';
import {
  toTimeNumber,
  normalizeTimeDomain,
  createTimeTicks,
  formatTimeTick,
} from './timeUtils';
import type { AxisConfig, DataKey } from '../types';

describe('resolveXValue', () => {
  it('uses index fallback when xAxis is null', () => {
    const item = { x: 10 };
    expect(resolveXValue(item, 5, null)).toBe(5);
  });

  it('uses function from dataKey', () => {
    const item = { x: 10, value: 42 };
    const xAxis: AxisConfig = { dataKey: ((i: Record<string, unknown>) => i.value as number) };
    expect(resolveXValue(item, 0, xAxis)).toBe(42);
  });

  it('uses string key from dataKey', () => {
    const item = { x: 10 };
    const xAxis: AxisConfig = { dataKey: 'x' };
    expect(resolveXValue(item, 0, xAxis)).toBe(10);
  });

  it('returns index when dataKey is undefined', () => {
    const item = { x: 10 };
    expect(resolveXValue(item, 7, null)).toBe(7);
  });

  it('returns index for time type when value is invalid', () => {
    const item = { ts: 'not-a-date' };
    const xAxis: AxisConfig = { dataKey: 'ts', type: 'time' };
    expect(resolveXValue(item, 7, xAxis)).toBe(7);
  });

  it('handles time type with Date object', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    const item = { ts: date };
    const xAxis: AxisConfig = { dataKey: 'ts', type: 'time' };
    const result = resolveXValue(item, 0, xAxis);
    expect(result).toBe(date.getTime());
  });

  it('handles time type with timestamp number', () => {
    const timestamp = 1704067200000;
    const item = { ts: timestamp };
    const xAxis: AxisConfig = { dataKey: 'ts', type: 'time' };
    expect(resolveXValue(item, 0, xAxis)).toBe(timestamp);
  });

  it('handles time type with ISO string', () => {
    const item = { ts: '2024-01-01T00:00:00Z' };
    const xAxis: AxisConfig = { dataKey: 'ts', type: 'time' };
    const result = resolveXValue(item, 0, xAxis);
    expect(result).toBeGreaterThan(0);
  });

  it('returns index for NaN values', () => {
    const item = { x: NaN };
    const xAxis: AxisConfig = { dataKey: 'x' };
    expect(resolveXValue(item, 3, xAxis)).toBe(3);
  });

  it('returns index for Infinity values', () => {
    const item = { x: Infinity };
    const xAxis: AxisConfig = { dataKey: 'x' };
    expect(resolveXValue(item, 3, xAxis)).toBe(3);
  });

  it('returns index for non-numeric string values', () => {
    const item = { x: 'abc' };
    const xAxis: AxisConfig = { dataKey: 'x' };
    expect(resolveXValue(item, 3, xAxis)).toBe(3);
  });
});

describe('resolveYValue', () => {
  it('uses function from dataKey', () => {
    const item = { value: 42 };
    const dataKey: DataKey = ((i: Record<string, unknown>) => i.value as number);
    expect(resolveYValue(item, 0, dataKey)).toBe(42);
  });

  it('uses string key from dataKey', () => {
    const item = { value: 42 };
    expect(resolveYValue(item, 0, 'value')).toBe(42);
  });

  it('auto-detects first numeric value when dataKey is undefined', () => {
    const item = { a: 'text', b: 42, c: 100 };
    expect(resolveYValue(item, 0, undefined)).toBe(42);
  });

  it('returns 0 for NaN values', () => {
    const item = { value: NaN };
    expect(resolveYValue(item, 0, 'value')).toBe(0);
  });

  it('returns 0 for Infinity values', () => {
    const item = { value: Infinity };
    expect(resolveYValue(item, 0, 'value')).toBe(0);
  });

  it('returns 0 for non-numeric string values', () => {
    const item = { value: 'not a number' };
    expect(resolveYValue(item, 0, 'value')).toBe(0);
  });

  it('returns 0 for undefined values', () => {
    const item = { value: undefined };
    expect(resolveYValue(item, 0, 'value')).toBe(0);
  });

  it('returns 0 for null values', () => {
    const item = { value: null };
    expect(resolveYValue(item, 0, 'value')).toBe(0);
  });

  it('handles negative numbers', () => {
    const item = { value: -42 };
    expect(resolveYValue(item, 0, 'value')).toBe(-42);
  });

  it('handles zero', () => {
    const item = { value: 0 };
    expect(resolveYValue(item, 0, 'value')).toBe(0);
  });

  it('handles floating point numbers', () => {
    const item = { value: 3.14159 };
    expect(resolveYValue(item, 0, 'value')).toBeCloseTo(3.14159);
  });

  it('returns 0 when item has no numeric values', () => {
    const item = { a: 'text', b: null };
    expect(resolveYValue(item, 0, undefined)).toBe(0);
  });
});

describe('projectPoints', () => {
  const margin = { left: 10, top: 20 };
  const xAxis: AxisConfig = { dataKey: 'x' };

  it('projects points correctly', () => {
    const data = [
      { x: 0, y: 0 },
      { x: 10, y: 50 },
      { x: 20, y: 100 },
    ];
    const getXScale = () => (value: number) => value;
    const getYScale = () => (value: number) => 200 - value;

    const points = projectPoints({ data, margin, xAxis, dataKey: 'y', getXScale, getYScale });

    expect(points).toHaveLength(3);
    expect(points[0]).toEqual({ x: 10, y: 220, value: 0, index: 0 });
    expect(points[1]).toEqual({ x: 20, y: 170, value: 50, index: 1 });
    expect(points[2]).toEqual({ x: 30, y: 120, value: 100, index: 2 });
  });

  it('applies margin to coordinates', () => {
    const data = [{ x: 5, y: 25 }];
    const getXScale = () => (value: number) => value;
    const getYScale = () => (value: number) => value;

    const points = projectPoints({ data, margin, xAxis, dataKey: 'y', getXScale, getYScale });

    expect(points[0].x).toBe(15);
    expect(points[0].y).toBe(45);
  });

  it('handles empty data', () => {
    const getXScale = () => (value: number) => value;
    const getYScale = () => (value: number) => value;

    const points = projectPoints({ data: [], margin, xAxis, dataKey: 'y', getXScale, getYScale });
    expect(points).toHaveLength(0);
  });

  it('handles single data point', () => {
    const data = [{ x: 5, y: 25 }];
    const getXScale = () => (value: number) => value;
    const getYScale = () => (value: number) => value;

    const points = projectPoints({ data, margin, xAxis, dataKey: 'y', getXScale, getYScale });

    expect(points).toHaveLength(1);
    expect(points[0].value).toBe(25);
    expect(points[0].index).toBe(0);
  });

  it('uses xAxis dataKey when dataKey is undefined', () => {
    const data = [{ x: 5, y: 25 }];
    const getXScale = () => (value: number) => value;
    const getYScale = () => (value: number) => value;

    const points = projectPoints({ data, margin, xAxis, dataKey: undefined, getXScale, getYScale });

    expect(points[0].value).toBe(5);
  });
});

describe('findClosestPointByX', () => {
  const points = [
    { x: 0, y: 100, value: 0, index: 0 },
    { x: 10, y: 80, value: 20, index: 1 },
    { x: 20, y: 60, value: 40, index: 2 },
    { x: 30, y: 40, value: 60, index: 3 },
    { x: 40, y: 20, value: 80, index: 4 },
  ];

  it('returns null for empty array', () => {
    expect(findClosestPointByX([], 10)).toBeNull();
  });

  it('returns the only point for single element array', () => {
    expect(findClosestPointByX([points[0]], 10)).toEqual(points[0]);
  });

  it('returns first point when mouse is before all points', () => {
    expect(findClosestPointByX(points, -5)).toEqual(points[0]);
    expect(findClosestPointByX(points, 0)).toEqual(points[0]);
  });

  it('returns last point when mouse is after all points', () => {
    expect(findClosestPointByX(points, 50)).toEqual(points[4]);
    expect(findClosestPointByX(points, 40)).toEqual(points[4]);
  });

  it('returns closest point by X coordinate', () => {
    expect(findClosestPointByX(points, 12)).toEqual(points[1]);
    expect(findClosestPointByX(points, 18)).toEqual(points[2]);
  });

  it('returns point at exact X coordinate', () => {
    expect(findClosestPointByX(points, 20)).toEqual(points[2]);
  });

  it('handles fractional X coordinates', () => {
    expect(findClosestPointByX(points, 15.5)).toEqual(points[2]);
    expect(findClosestPointByX(points, 15.4)).toEqual(points[2]);
    expect(findClosestPointByX(points, 15.6)).toEqual(points[2]);
  });

  it('handles boundary cases at midpoint', () => {
    expect(findClosestPointByX(points, 15)).toEqual(points[1]);
  });

  it('prefers right point when equidistant', () => {
    const threePoints = [
      { x: 0, y: 0, value: 0, index: 0 },
      { x: 10, y: 10, value: 10, index: 1 },
      { x: 20, y: 20, value: 20, index: 2 },
    ];
    expect(findClosestPointByX(threePoints, 10.6)).toEqual(threePoints[1]);
    expect(findClosestPointByX(threePoints, 9.4)).toEqual(threePoints[1]);
  });

  it('chooses right point when closer than left', () => {
    const threePoints = [
      { x: 0, y: 0, value: 0, index: 0 },
      { x: 10, y: 10, value: 10, index: 1 },
      { x: 20, y: 20, value: 20, index: 2 },
    ];
    expect(findClosestPointByX(threePoints, 10.5)).toEqual(threePoints[1]);
  });
});

describe('toTimeNumber', () => {
  it('returns null for Date with invalid time', () => {
    const date = new Date(NaN);
    expect(toTimeNumber(date)).toBeNull();
  });

  it('returns null for non-parseable string', () => {
    expect(toTimeNumber('not a date')).toBeNull();
  });

  it('returns null for undefined', () => {
    expect(toTimeNumber(undefined)).toBeNull();
  });

  it('returns null for null', () => {
    expect(toTimeNumber(null)).toBeNull();
  });

  it('returns null for object', () => {
    expect(toTimeNumber({})).toBeNull();
  });

  it('returns null for array', () => {
    expect(toTimeNumber([])).toBeNull();
  });

  it('returns null for boolean', () => {
    expect(toTimeNumber(true)).toBeNull();
    expect(toTimeNumber(false)).toBeNull();
  });

  it('handles valid Date object', () => {
    const date = new Date('2024-01-01T00:00:00Z');
    const result = toTimeNumber(date);
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  it('handles valid timestamp number', () => {
    expect(toTimeNumber(1704067200000)).toBe(1704067200000);
  });

  it('handles valid ISO string', () => {
    const result = toTimeNumber('2024-01-01T00:00:00Z');
    expect(typeof result).toBe('number');
    expect(result).toBeGreaterThan(0);
  });

  it('returns null for Infinity', () => {
    expect(toTimeNumber(Infinity)).toBeNull();
    expect(toTimeNumber(-Infinity)).toBeNull();
  });

  it('returns null for NaN', () => {
    expect(toTimeNumber(NaN)).toBeNull();
  });

  it('handles negative timestamp', () => {
    expect(toTimeNumber(-86400000)).toBe(-86400000);
  });
});

describe('normalizeTimeDomain', () => {
  it('returns null for undefined', () => {
    expect(normalizeTimeDomain(undefined)).toBeNull();
  });

  it('returns null for "auto"', () => {
    expect(normalizeTimeDomain('auto')).toBeNull();
  });

  it('returns null when both domain values are invalid', () => {
    const invalid = ['invalid', 'also invalid'] as unknown as [number | Date, number | Date];
    expect(normalizeTimeDomain(invalid)).toBeNull();
  });

  it('returns null when start is invalid', () => {
    const invalid = ['invalid', new Date()] as unknown as [number | Date, number | Date];
    expect(normalizeTimeDomain(invalid)).toBeNull();
  });

  it('returns null when end is invalid', () => {
    const invalid = [new Date(), 'invalid'] as unknown as [number | Date, number | Date];
    expect(normalizeTimeDomain(invalid)).toBeNull();
  });

  it('returns normalized domain for valid timestamps', () => {
    const result = normalizeTimeDomain([100, 200]);
    expect(result).toEqual([100, 200]);
  });

  it('returns normalized domain for valid dates', () => {
    const start = new Date('2024-01-01').getTime();
    const end = new Date('2024-01-31').getTime();
    const result = normalizeTimeDomain([start, end]);
    expect(result).toEqual([start, end]);
  });

  it('swaps domain values if start > end', () => {
    const start = new Date('2024-01-31').getTime();
    const end = new Date('2024-01-01').getTime();
    const result = normalizeTimeDomain([start, end]);
    expect(result).toEqual([end, start]);
  });

  it('handles mixed Date and timestamp', () => {
    const timestamp = new Date('2024-01-15').getTime();
    const date = new Date('2024-01-31');
    const result = normalizeTimeDomain([timestamp, date]);
    expect(result).not.toBeNull();
    expect(result![0]).toBeLessThan(result![1]);
  });
});

describe('createTimeTicks', () => {
  it('returns filtered finite values when min is NaN', () => {
    const ticks = createTimeTicks([NaN, 100], 5);
    expect(ticks).toEqual([100]);
  });

  it('returns filtered finite values when max is Infinity', () => {
    const ticks = createTimeTicks([0, Infinity], 5);
    expect(ticks).toEqual([0]);
  });

  it('returns empty array when both are invalid', () => {
    const ticks = createTimeTicks([NaN, Infinity], 5);
    expect(ticks).toEqual([]);
  });

  it('returns domain endpoints when no ticks generated', () => {
    const ticks = createTimeTicks([0, 1], 10);
    expect(ticks).toContain(0);
    expect(ticks).toContain(1);
  });

  it('returns domain endpoints when max <= min', () => {
    const ticks = createTimeTicks([100, 100], 5);
    expect(ticks).toContain(100);
  });

  it('generates appropriate ticks for hour range', () => {
    const hourMs = 60 * 60 * 1000;
    const ticks = createTimeTicks([0, 6 * hourMs], 5);
    expect(ticks.length).toBeGreaterThan(2);
  });

  it('generates appropriate ticks for day range', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const ticks = createTimeTicks([0, 7 * dayMs], 5);
    expect(ticks.length).toBeGreaterThan(2);
  });

  it('generates appropriate ticks for year range', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const ticks = createTimeTicks([0, 365 * dayMs], 6);
    expect(ticks.length).toBeGreaterThan(2);
    expect(ticks[0]).toBeLessThan(ticks[ticks.length - 1]);
  });

  it('includes domain start even if not aligned to step', () => {
    const hourMs = 60 * 60 * 1000;
    const ticks = createTimeTicks([hourMs / 2, 5 * hourMs], 5);
    expect(ticks[0]).toBe(hourMs / 2);
  });

  it('includes domain end even if not aligned to step', () => {
    const hourMs = 60 * 60 * 1000;
    const ticks = createTimeTicks([0, 5.5 * hourMs], 5);
    expect(ticks[ticks.length - 1]).toBe(5.5 * hourMs);
  });

  it('returns min and max when no ticks generated in span', () => {
    const ticks = createTimeTicks([100000000000000, 100000000000001], 100);
    expect(ticks[0]).toBe(100000000000000);
    expect(ticks[ticks.length - 1]).toBe(100000000000001);
  });
});

describe('formatTimeTick', () => {
  const domain: [number, number] = [
    new Date('2024-01-01').getTime(),
    new Date('2024-01-31').getTime(),
  ];

  it('formats tick with auto format', () => {
    const result = formatTimeTick(domain[0], domain);
    expect(typeof result).toBe('string');
    expect(result.length).toBeGreaterThan(0);
  });

  it('formats tick with time format', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const domainDay: [number, number] = [0, dayMs];
    const result = formatTimeTick(dayMs / 2, domainDay, { timeFormat: 'time' });
    expect(typeof result).toBe('string');
  });

  it('formats tick with date format', () => {
    const result = formatTimeTick(domain[0], domain, { timeFormat: 'date' });
    expect(typeof result).toBe('string');
  });

  it('formats tick with month format', () => {
    const result = formatTimeTick(domain[0], domain, { timeFormat: 'month' });
    expect(typeof result).toBe('string');
  });

  it('formats tick with year format', () => {
    const result = formatTimeTick(domain[0], domain, { timeFormat: 'year' });
    expect(typeof result).toBe('string');
  });

  it('accepts custom locale', () => {
    const result = formatTimeTick(domain[0], domain, { locale: 'de-DE' });
    expect(typeof result).toBe('string');
  });

  it('accepts custom timezone', () => {
    const result = formatTimeTick(domain[0], domain, { timeZone: 'UTC' });
    expect(typeof result).toBe('string');
  });

  it('accepts Intl.DateTimeFormatOptions object', () => {
    const result = formatTimeTick(domain[0], domain, { timeFormat: { weekday: 'short', month: 'short', day: 'numeric' } });
    expect(typeof result).toBe('string');
  });

  it('formats with hour span for pickAutoOptions', () => {
    const hourMs = 60 * 60 * 1000;
    const domain: [number, number] = [0, hourMs];
    const result = formatTimeTick(hourMs / 2, domain);
    expect(typeof result).toBe('string');
  });

  it('formats with 90-day span for pickAutoOptions', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const domain: [number, number] = [0, 60 * dayMs];
    const result = formatTimeTick(30 * dayMs, domain);
    expect(typeof result).toBe('string');
  });

  it('formats with 2-year span for pickAutoOptions', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const domain: [number, number] = [0, 800 * dayMs];
    const result = formatTimeTick(400 * dayMs, domain);
    expect(typeof result).toBe('string');
  });

  it('formats with month format option', () => {
    const result = formatTimeTick(domain[0], domain, { timeFormat: 'month' });
    expect(typeof result).toBe('string');
  });

  it('formats with year span for pickAutoOptions', () => {
    const dayMs = 24 * 60 * 60 * 1000;
    const domain: [number, number] = [0, 1000 * dayMs];
    const result = formatTimeTick(500 * dayMs, domain);
    expect(typeof result).toBe('string');
  });
});
