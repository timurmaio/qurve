/**
 * Nice linear ticks — ported from d3-array `ticks` / `tickIncrement` (ISC).
 * Produces human-friendly steps (1, 2, 5 × 10^k) within [start, stop].
 */

const E10 = Math.sqrt(50);
const E5 = Math.sqrt(10);
const E2 = Math.sqrt(2);

function tickSpec(start: number, stop: number, count: number): [number, number, number] {
  const step = (stop - start) / Math.max(0, count);
  const power = Math.floor(Math.log10(step));
  const error = step / 10 ** power;
  const factor = error >= E10 ? 10 : error >= E5 ? 5 : error >= E2 ? 2 : 1;
  let i1: number;
  let i2: number;
  let inc: number;

  if (power < 0) {
    inc = 10 ** -power / factor;
    i1 = Math.round(start * inc);
    i2 = Math.round(stop * inc);
    if (i1 / inc < start) ++i1;
    if (i2 / inc > stop) --i2;
    inc = -inc;
  } else {
    inc = 10 ** power * factor;
    i1 = Math.round(start / inc);
    i2 = Math.round(stop / inc);
    if (i1 * inc < start) ++i1;
    if (i2 * inc > stop) --i2;
  }

  if (i2 < i1 && 0.5 <= count && count < 2) {
    return tickSpec(start, stop, count * 2);
  }
  return [i1, i2, inc];
}

/** Increment used by nice-domain (may be negative to encode fractional powers). */
export function tickIncrement(start: number, stop: number, count: number): number {
  return tickSpec(+start, +stop, +count)[2];
}

/** Absolute step size between consecutive ticks. */
export function tickStep(start: number, stop: number, count: number): number {
  const s = +start;
  const e = +stop;
  const c = +count;
  const reverse = e < s;
  const inc = reverse ? tickIncrement(e, s, c) : tickIncrement(s, e, c);
  return (reverse ? -1 : 1) * (inc < 0 ? 1 / -inc : inc);
}

/** Nice ticks covering [start, stop] (inclusive when possible). */
export function ticks(start: number, stop: number, count: number): number[] {
  const s = +start;
  const e = +stop;
  const c = +count;
  if (!(c > 0)) return [];
  if (s === e) return [s];

  const reverse = e < s;
  const [i1, i2, inc] = reverse ? tickSpec(e, s, c) : tickSpec(s, e, c);
  if (!(i2 >= i1)) return [];

  const n = i2 - i1 + 1;
  const result = new Array<number>(n);
  if (reverse) {
    if (inc < 0) for (let i = 0; i < n; ++i) result[i] = (i2 - i) / -inc;
    else for (let i = 0; i < n; ++i) result[i] = (i2 - i) * inc;
  } else if (inc < 0) {
    for (let i = 0; i < n; ++i) result[i] = (i1 + i) / -inc;
  } else {
    for (let i = 0; i < n; ++i) result[i] = (i1 + i) * inc;
  }
  return result;
}

/**
 * Expand [min, max] to nice boundaries for ~`count` ticks.
 * Port of d3-scale `linearish.nice` using `tickIncrement` (ISC).
 */
export function niceDomain(
  domain: [number, number],
  count = 10,
): [number, number] {
  let start = +domain[0];
  let stop = +domain[1];
  if (!Number.isFinite(start) || !Number.isFinite(stop)) return [start, stop];
  if (start === stop) return [start, stop];

  const reverse = stop < start;
  if (reverse) {
    const t = start;
    start = stop;
    stop = t;
  }

  let prestep = NaN;
  for (let iter = 0; iter < 10; iter++) {
    const step = tickIncrement(start, stop, count);
    if (step === prestep) {
      break;
    }
    if (step > 0) {
      start = Math.floor(start / step) * step;
      stop = Math.ceil(stop / step) * step;
    } else if (step < 0) {
      start = Math.ceil(start * step) / step;
      stop = Math.floor(stop * step) / step;
    } else {
      break;
    }
    prestep = step;
  }

  return reverse ? [stop, start] : [start, stop];
}
