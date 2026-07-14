import type { ChartData, DataKey } from '../types';
import { resolveYValue } from './pointUtils';

export interface PolarLayout {
  cx: number;
  cy: number;
  outerRadius: number;
}

export interface PolarPoint {
  x: number;
  y: number;
  angle: number;
  radius: number;
  index: number;
  value: number;
}

/** Convert degrees to radians. */
export function degToRad(degrees: number): number {
  return (degrees * Math.PI) / 180;
}

/**
 * Convert polar coordinates to canvas cartesian.
 * Angle 0° is at 12 o'clock; angles increase clockwise (Recharts-compatible).
 */
export function polarToCartesian(
  cx: number,
  cy: number,
  radius: number,
  angleDeg: number,
): { x: number; y: number } {
  const rad = degToRad(angleDeg - 90);
  return {
    x: cx + radius * Math.cos(rad),
    y: cy + radius * Math.sin(rad),
  };
}

/** Canvas point → angle in degrees (0 at 12 o'clock, clockwise). */
export function cartesianToPolarAngle(cx: number, cy: number, x: number, y: number): number {
  const dx = x - cx;
  const dy = y - cy;
  let deg = (Math.atan2(dy, dx) * 180) / Math.PI + 90;
  if (deg < 0) deg += 360;
  return deg;
}

export function getPolarLayout(params: {
  width: number;
  height: number;
  margin: { top: number; right: number; bottom: number; left: number };
  outerRadius?: number;
}): PolarLayout {
  const { width, height, margin, outerRadius: outerRadiusProp } = params;
  const innerWidth = Math.max(0, width - margin.left - margin.right);
  const innerHeight = Math.max(0, height - margin.top - margin.bottom);
  const cx = margin.left + innerWidth / 2;
  const cy = margin.top + innerHeight / 2;
  const maxRadius = Math.max(0, Math.min(innerWidth, innerHeight) / 2);
  const outerRadius = outerRadiusProp != null && Number.isFinite(outerRadiusProp)
    ? Math.max(0, Math.min(maxRadius, outerRadiusProp))
    : maxRadius * 0.8;
  return { cx, cy, outerRadius };
}

export function getAngleTicks(count: number): number[] {
  const n = Math.max(1, count);
  const step = 360 / n;
  const ticks: number[] = [];
  for (let i = 0; i < n; i++) {
    ticks.push(i * step);
  }
  return ticks;
}

export function createRadiusTicks(domain: [number, number], tickCount: number): number[] {
  const [min, max] = domain;
  const count = Math.max(2, tickCount);
  if (!Number.isFinite(min) || !Number.isFinite(max) || min === max) {
    return [min || 0, max || 1];
  }
  const step = (max - min) / (count - 1);
  const ticks: number[] = [];
  for (let i = 0; i < count; i++) {
    ticks.push(min + step * i);
  }
  return ticks;
}

export function resolveRadiusDomain(
  data: ChartData,
  dataKeys: DataKey[],
  domain: [number, number] | 'auto' = 'auto',
): [number, number] {
  if (domain !== 'auto') return domain;

  let min = Infinity;
  let max = -Infinity;

  for (const dataKey of dataKeys) {
    for (let index = 0; index < data.length; index++) {
      const value = resolveYValue(data[index], index, dataKey);
      if (!Number.isFinite(value)) continue;
      if (value < min) min = value;
      if (value > max) max = value;
    }
  }

  if (!Number.isFinite(min) || !Number.isFinite(max)) return [0, 100];
  if (min === max) {
    const pad = Math.abs(min) * 0.1 || 1;
    return [Math.min(0, min - pad), max + pad];
  }

  // Radar domains usually include 0 for visual balance
  const lo = Math.min(0, min);
  const hi = max;
  return [lo, hi];
}

export function scaleRadius(
  value: number,
  domain: [number, number],
  outerRadius: number,
): number {
  const [min, max] = domain;
  if (!Number.isFinite(value) || max === min) return 0;
  const t = (value - min) / (max - min);
  return Math.max(0, Math.min(1, t)) * outerRadius;
}

export function projectRadarPoints(params: {
  data: ChartData;
  dataKey: DataKey;
  layout: PolarLayout;
  domain: [number, number];
}): PolarPoint[] {
  const { data, dataKey, layout, domain } = params;
  if (data.length === 0) return [];

  const angles = getAngleTicks(data.length);
  return data.map((item, index) => {
    const value = resolveYValue(item, index, dataKey);
    const radius = scaleRadius(value, domain, layout.outerRadius);
    const angle = angles[index] ?? 0;
    const { x, y } = polarToCartesian(layout.cx, layout.cy, radius, angle);
    return { x, y, angle, radius, index, value };
  });
}

export function findClosestRadarIndex(
  points: PolarPoint[],
  layout: PolarLayout,
  mouseX: number,
  mouseY: number,
): number | null {
  if (points.length === 0) return null;

  const angle = cartesianToPolarAngle(layout.cx, layout.cy, mouseX, mouseY);
  let bestIndex = 0;
  let bestDelta = Infinity;

  for (const point of points) {
    let delta = Math.abs(point.angle - angle);
    if (delta > 180) delta = 360 - delta;
    if (delta < bestDelta) {
      bestDelta = delta;
      bestIndex = point.index;
    }
  }

  return bestIndex;
}

export function resolveAngleLabel(
  item: Record<string, unknown>,
  index: number,
  dataKey?: DataKey,
): string {
  if (!dataKey) return String(index);
  if (typeof dataKey === 'function') return String(dataKey(item, index));
  const raw = item[dataKey];
  return raw == null ? String(index) : String(raw);
}
