import type { AxisConfig, ChartData, DataKey } from '../chartContext';

export interface ProjectedPoint {
  x: number;
  y: number;
  value: number;
  index: number;
}

export function resolveXValue(item: Record<string, unknown>, index: number, xAxis: AxisConfig | null): number {
  const raw = typeof xAxis?.dataKey === 'function'
    ? xAxis.dataKey(item, index)
    : xAxis?.dataKey
      ? item[xAxis.dataKey as string]
      : index;

  const value = Number(raw);
  return Number.isFinite(value) ? value : index;
}

export function resolveYValue(item: Record<string, unknown>, index: number, dataKey?: DataKey): number {
  const raw = dataKey
    ? (typeof dataKey === 'function' ? dataKey(item, index) : item[dataKey])
    : Object.values(item).find((v) => typeof v === 'number');

  const value = Number(raw);
  return Number.isFinite(value) ? value : 0;
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
    const yValue = resolveYValue(item, index, dataKey);

    points.push({
      x: margin.left + xScale(xValue),
      y: margin.top + yScale(yValue),
      value: yValue,
      index,
    });
  }

  return points;
}

export function findClosestPointByX(points: ProjectedPoint[], mouseX: number): ProjectedPoint | null {
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
