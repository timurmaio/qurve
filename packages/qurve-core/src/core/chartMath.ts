export function getBaseValue(domain: [number, number]): number {
  const min = Math.min(domain[0], domain[1]);
  const max = Math.max(domain[0], domain[1]);

  if (min <= 0 && max >= 0) return 0;
  return min > 0 ? min : max;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value));
}

export function normalizeOpacity(value: number | undefined, fallback: number): number {
  if (value === undefined) return fallback;
  if (!Number.isFinite(value)) return fallback;
  return clamp(value, 0, 1);
}

export function normalizeHoverOpacity(opacity: number, fallback: number = 0.5): number {
  return normalizeOpacity(opacity, fallback);
}

export function stackKey(stackId: string | number): string {
  return `stack:${String(stackId)}`;
}

export function isStacked(stackId: string | number | undefined): stackId is string | number {
  return stackId !== undefined;
}

export type RadiusValue = number | [number, number, number, number] | undefined;

export function resolveRadius(
  radius: RadiusValue,
  isPositive: boolean,
): RadiusValue {
  if (radius === undefined) return undefined;
  if (typeof radius === 'number') {
    return isPositive ? [radius, radius, 0, 0] : [0, 0, radius, radius];
  }
  return radius;
}

export function hasSameSign(v: number, targetSign: 'positive' | 'negative'): boolean {
  return targetSign === 'positive' ? v > 0 : v < 0;
}

export function resolveStackedRadius(
  radius: RadiusValue,
  value: number,
  isOuterSegment: boolean,
): RadiusValue {
  if (!isOuterSegment) return undefined;
  return resolveRadius(radius, value >= 0);
}
