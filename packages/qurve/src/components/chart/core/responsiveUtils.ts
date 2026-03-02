export type SizeValue = number | string;

export function toCssValue(value: SizeValue | undefined, fallback: string): string {
  if (value === undefined) return fallback;
  return typeof value === 'number' ? `${value}px` : value;
}

export function resolveNumericSize(value: SizeValue | undefined, measured: number): number {
  if (typeof value === 'number') return value;
  return measured;
}
