import type { AxisConfig, ChartData, DataKey, ProjectedPoint } from '../types';
import { toTimeNumber } from './timeUtils';

export type { ProjectedPoint } from '../types';

export function resolveXValue(item: Record<string, unknown>, index: number, xAxis: AxisConfig | null): number {
  const raw = typeof xAxis?.dataKey === 'function'
    ? xAxis.dataKey(item, index)
    : xAxis?.dataKey
      ? item[xAxis.dataKey as string]
      : index;

  if (xAxis?.type === 'time') {
    const time = toTimeNumber(raw);
    return time ?? index;
  }

  const value = Number(raw);
  return Number.isFinite(value) ? value : index;
}

export function resolveYValue(item: Record<string, unknown>, index: number, dataKey?: DataKey): number {
  const nullable = resolveYValueNullable(item, index, dataKey);
  return nullable ?? 0;
}

/** Like resolveYValue, but returns null for missing / non-finite values (for connectNulls gaps). */
export function resolveYValueNullable(
  item: Record<string, unknown>,
  index: number,
  dataKey?: DataKey,
): number | null {
  const raw = dataKey
    ? (typeof dataKey === 'function' ? dataKey(item, index) : item[dataKey])
    : Object.values(item).find((v) => typeof v === 'number');

  if (raw === null || raw === undefined || raw === '') return null;
  const value = Number(raw);
  return Number.isFinite(value) ? value : null;
}

export function isDefinedPoint(point: { value: number | null; y?: number }): boolean {
  if (point.value == null) return false;
  if (point.y !== undefined && !Number.isFinite(point.y)) return false;
  return true;
}

/**
 * Split projected points into drawable segments.
 * When `connectNulls` is true, nulls are skipped and remaining points form one polyline.
 * When false (default), nulls break the path into separate segments.
 */
export function splitDefinedSegments<T extends { value: number | null; y?: number }>(
  points: T[],
  connectNulls = false,
): T[][] {
  if (connectNulls) {
    const defined = points.filter(isDefinedPoint);
    return defined.length > 0 ? [defined] : [];
  }

  const segments: T[][] = [];
  let current: T[] = [];
  for (const point of points) {
    if (isDefinedPoint(point)) {
      current.push(point);
    } else if (current.length > 0) {
      segments.push(current);
      current = [];
    }
  }
  if (current.length > 0) segments.push(current);
  return segments;
}

export function projectPoints(params: {
  data: ChartData;
  margin: { left: number; top: number };
  xAxis: AxisConfig | null;
  dataKey?: DataKey;
  getXScale: () => (value: number) => number;
  getYScale: (dataKey?: DataKey) => (value: number) => number;
}): ProjectedPoint[] {
  const { data, margin, xAxis, dataKey, getXScale, getYScale } = params;
  const xScale = getXScale();
  const yScale = getYScale(dataKey);

  const points: ProjectedPoint[] = [];
  for (let index = 0; index < data.length; index++) {
    const item = data[index];
    const xValue = resolveXValue(item, index, xAxis);
    const yValue = resolveYValueNullable(item, index, dataKey);

    points.push({
      x: margin.left + xScale(xValue),
      y: yValue == null ? Number.NaN : margin.top + yScale(yValue),
      value: yValue,
      index,
    });
  }

  return points;
}

export function findClosestPointByX(
  points: ProjectedPoint[],
  mouseX: number,
): ProjectedPoint | null {
  if (points.length === 0) return null;
  if (points.length === 1) return points[0];

  if (mouseX <= points[0].x) return points[0];
  if (mouseX >= points[points.length - 1].x) return points[points.length - 1];

  let left = 0;
  let right = points.length;

  while (left < right) {
    const mid = Math.floor((left + right) / 2);
    if (points[mid].x < mouseX) {
      left = mid + 1;
    } else {
      right = mid;
    }
  }

  let closestIdx = left > 0 ? left - 1 : 0;
  if (left < points.length) {
    const leftDist = Math.abs(points[closestIdx].x - mouseX);
    const rightDist = Math.abs(points[left].x - mouseX);
    if (rightDist < leftDist) {
      closestIdx = left;
    }
  }

  return points[closestIdx];
}
