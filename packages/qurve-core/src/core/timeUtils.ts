const TIME_STEPS_MS = [
  60 * 1000,
  5 * 60 * 1000,
  15 * 60 * 1000,
  30 * 60 * 1000,
  60 * 60 * 1000,
  3 * 60 * 60 * 1000,
  6 * 60 * 60 * 1000,
  12 * 60 * 60 * 1000,
  24 * 60 * 60 * 1000,
  2 * 24 * 60 * 60 * 1000,
  7 * 24 * 60 * 60 * 1000,
  14 * 24 * 60 * 60 * 1000,
  30 * 24 * 60 * 60 * 1000,
  90 * 24 * 60 * 60 * 1000,
  180 * 24 * 60 * 60 * 1000,
  365 * 24 * 60 * 60 * 1000,
];

export type TimeFormatMode =
  | 'auto'
  | 'time'
  | 'date'
  | 'month'
  | 'year'
  | Intl.DateTimeFormatOptions;

export interface TimeFormatOptions {
  locale?: string;
  timeZone?: string;
  timeFormat?: TimeFormatMode;
}

export function toTimeNumber(value: unknown): number | null {
  if (value instanceof Date) {
    const time = value.getTime();
    return Number.isFinite(time) ? time : null;
  }

  if (typeof value === 'number') {
    return Number.isFinite(value) ? value : null;
  }

  if (typeof value === 'string') {
    const parsed = Date.parse(value);
    return Number.isFinite(parsed) ? parsed : null;
  }

  return null;
}

export function normalizeTimeDomain(domain: [number | Date, number | Date] | 'auto' | undefined): [number, number] | null {
  if (!domain || domain === 'auto') return null;

  const start = toTimeNumber(domain[0]);
  const end = toTimeNumber(domain[1]);
  if (start === null || end === null) return null;

  return start <= end ? [start, end] : [end, start];
}

export function createTimeTicks(domain: [number, number], tickCount: number): number[] {
  const [min, max] = domain;
  if (!Number.isFinite(min) || !Number.isFinite(max) || max <= min) {
    return [min, max].filter((value) => Number.isFinite(value));
  }

  const safeCount = Math.max(2, tickCount);
  const span = max - min;
  const roughStep = span / (safeCount - 1);

  let step = TIME_STEPS_MS[TIME_STEPS_MS.length - 1];
  for (const candidate of TIME_STEPS_MS) {
    if (candidate >= roughStep) {
      step = candidate;
      break;
    }
  }

  const first = Math.ceil(min / step) * step;
  const ticks: number[] = [];
  for (let current = first; current <= max; current += step) {
    ticks.push(current);
  }

  if (ticks.length === 0) {
    return [min, max];
  }

  if (ticks[0] !== min) ticks.unshift(min);
  if (ticks[ticks.length - 1] !== max) ticks.push(max);
  return ticks;
}

function pickAutoOptions(domain: [number, number]): Intl.DateTimeFormatOptions {
  const span = Math.abs(domain[1] - domain[0]);

  if (span <= 24 * 60 * 60 * 1000) {
    return { hour: '2-digit', minute: '2-digit' };
  }

  if (span <= 90 * 24 * 60 * 60 * 1000) {
    return { month: 'short', day: 'numeric' };
  }

  if (span <= 365 * 24 * 60 * 60 * 1000 * 2) {
    return { month: 'short', year: 'numeric' };
  }

  return { year: 'numeric' };
}

function resolveTimeFormatOptions(
  domain: [number, number],
  format: TimeFormatMode | undefined,
): Intl.DateTimeFormatOptions {
  if (!format || format === 'auto') {
    return pickAutoOptions(domain);
  }

  if (typeof format === 'object') {
    return format;
  }

  if (format === 'time') {
    return { hour: '2-digit', minute: '2-digit' };
  }

  if (format === 'date') {
    return { year: 'numeric', month: 'short', day: 'numeric' };
  }

  if (format === 'month') {
    return { month: 'short', year: 'numeric' };
  }

  return { year: 'numeric' };
}

export function formatTimeTick(
  value: number,
  domain: [number, number],
  options?: TimeFormatOptions,
): string {
  const formatterOptions = resolveTimeFormatOptions(domain, options?.timeFormat);
  return new Intl.DateTimeFormat(options?.locale ?? undefined, {
    ...formatterOptions,
    timeZone: options?.timeZone,
  }).format(value);
}
