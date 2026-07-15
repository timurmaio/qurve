import { describe, expect, it } from 'vitest';
import { niceDomain, tickIncrement, tickStep, ticks } from './ticks';
import { createLinearScale, scaleLinear } from './scaleLinear';

describe('ticks — d3-array contract', () => {
  it('returns inclusive nice 1/2/5 ladder for common ranges', () => {
    expect(ticks(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(ticks(0, 1, 10)).toEqual([0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1]);
    expect(ticks(-10, 10, 5)).toEqual([-10, -5, 0, 5, 10]);
  });

  it('handles reversed, equal, and invalid counts', () => {
    expect(ticks(100, 0, 5)).toEqual([100, 80, 60, 40, 20, 0]);
    expect(ticks(5, 5, 5)).toEqual([5]);
    expect(ticks(0, 1, 0)).toEqual([]);
    expect(ticks(0, 1, -3)).toEqual([]);
  });

  it('tickStep / tickIncrement stay consistent with ticks spacing', () => {
    expect(tickStep(0, 100, 5)).toBe(20);
    expect(tickStep(100, 0, 5)).toBe(-20);
    const t = ticks(0, 50, 5);
    for (let i = 1; i < t.length; i++) {
      expect(t[i] - t[i - 1]).toBeCloseTo(Math.abs(tickStep(0, 50, 5)), 10);
    }
    expect(typeof tickIncrement(0, 100, 5)).toBe('number');
  });

  it('every tick lies within [min,max] (inclusive, unordered domain)', () => {
    for (const [a, b] of [
      [0, 97],
      [3, 97],
      [-5, 12.5],
      [100, 0],
    ] as const) {
      const lo = Math.min(a, b);
      const hi = Math.max(a, b);
      for (const t of ticks(a, b, 8)) {
        expect(t).toBeGreaterThanOrEqual(lo - 1e-12);
        expect(t).toBeLessThanOrEqual(hi + 1e-12);
      }
    }
  });

  it('uses 1/2/5×10^k steps and is strictly monotonic', () => {
    const isNiceStep = (step: number) => {
      const a = Math.abs(step);
      if (!(a > 0) || !Number.isFinite(a)) return false;
      const exp = Math.floor(Math.log10(a));
      const mant = a / 10 ** exp;
      return [1, 2, 5, 10].some((m) => Math.abs(mant - m) < 1e-10);
    };

    for (const [a, b, c] of [
      [0, 100, 5],
      [0, 1, 10],
      [-50, 50, 8],
      [0.01, 0.09, 5],
      [1e6, 2e6, 4],
    ] as const) {
      const t = ticks(a, b, c);
      expect(t.length).toBeGreaterThanOrEqual(2);
      for (let i = 1; i < t.length; i++) {
        expect(Math.sign(t[i] - t[i - 1])).toBe(Math.sign(b - a) || 1);
        expect(isNiceStep(t[i] - t[i - 1])).toBe(true);
      }
    }
  });

  it('survives fractional count near collapsed domains (tickSpec recurse)', () => {
    // count ∈ [0.5, 2) with a tiny span forces i2 < i1 then count*2 retry
    const t = ticks(0.123456789, 0.123456789 + 1e-8, 0.5);
    expect(t.length).toBeGreaterThanOrEqual(1);
    for (const v of t) expect(Number.isFinite(v)).toBe(true);
    expect(ticks(0, 1, 1)).toEqual([0, 1]);
  });
});

describe('niceDomain — d3-scale contract', () => {
  it('expands ugly domains and leaves already-nice alone', () => {
    expect(niceDomain([0.1, 0.9], 10)).toEqual([0.1, 0.9]);
    expect(niceDomain([0.12, 0.87], 5)).toEqual([0, 1]);
    const [a, b] = niceDomain([3, 97], 10);
    expect(a).toBeLessThanOrEqual(3);
    expect(b).toBeGreaterThanOrEqual(97);
    // Nice bounds themselves tick cleanly
    expect(ticks(a, b, 10)[0]).toBe(a);
  });

  it('handles reversed, equal, and non-finite', () => {
    const [hi, lo] = niceDomain([10, 0], 5);
    expect(hi).toBeGreaterThanOrEqual(lo);
    expect(niceDomain([5, 5], 5)).toEqual([5, 5]);
    expect(niceDomain([NaN, 1], 5)[0]).toBeNaN();
  });

  it('nice endpoints are always tick-aligned for the requested count', () => {
    for (const domain of [
      [0.12, 0.87],
      [3, 97],
      [-12.3, 4.7],
      [1e-3, 9e-3],
    ] as const) {
      const [a, b] = niceDomain([...domain], 5);
      const t = ticks(a, b, 5);
      expect(t[0]).toBeCloseTo(a, 10);
      expect(t[t.length - 1]).toBeCloseTo(b, 10);
    }
  });
});

describe('scaleLinear — round-trip invariants', () => {
  it('maps domain↔range and inverts exactly on interior points', () => {
    const scale = scaleLinear({ domain: [0, 100], range: [0, 200] });
    for (const v of [0, 25, 50, 75, 100]) {
      expect(scale.invert(scale(v))).toBeCloseTo(v, 10);
      expect(scale(scale.invert(v * 2))).toBeCloseTo(v * 2, 10);
    }
    expect(scale.domain()).toEqual([0, 100]);
    expect(scale.range()).toEqual([0, 200]);
    expect(scale.ticks(5)).toEqual([0, 20, 40, 60, 80, 100]);
  });

  it('nices in place and keeps scale usable', () => {
    const scale = scaleLinear({ domain: [0.12, 0.87], range: [0, 100] });
    scale.nice(5);
    expect(scale.domain()).toEqual([0, 1]);
    expect(scale(0.5)).toBeCloseTo(50, 10);
  });

  it('clamps and survives degenerate domains/ranges', () => {
    const scale = scaleLinear({ domain: [10, 20], range: [0, 100] });
    expect(scale.clamp(5)).toBe(10);
    expect(scale.clamp(25)).toBe(20);
    expect(scale.clamp(15)).toBe(15);
    expect(scale(Number.NaN)).toBe(0);

    const flatDomain = scaleLinear({ domain: [5, 5], range: [0, 10] });
    expect(flatDomain(99)).toBe(0);
    expect(flatDomain.invert(7)).toBe(5);

    const flatRange = scaleLinear({ domain: [0, 10], range: [5, 5] });
    expect(flatRange.invert(5)).toBe(0);
    expect(flatRange(3)).toBe(5);
  });

  it('createLinearScale alias matches scaleLinear', () => {
    const a = scaleLinear({ domain: [0, 1], range: [0, 10] });
    const b = createLinearScale({ domain: [0, 1], range: [0, 10] });
    expect(b(0.5)).toBe(a(0.5));
  });

  it('is strictly monotonic on the domain (and reverse when range reverses)', () => {
    const forward = scaleLinear({ domain: [0, 10], range: [0, 100] });
    const reverse = scaleLinear({ domain: [0, 10], range: [100, 0] });
    for (let i = 0; i < 10; i++) {
      expect(forward(i + 1)).toBeGreaterThan(forward(i));
      expect(reverse(i + 1)).toBeLessThan(reverse(i));
    }
  });
});
