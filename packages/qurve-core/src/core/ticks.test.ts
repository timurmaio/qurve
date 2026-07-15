import { describe, expect, it } from 'vitest';
import { niceDomain, tickStep, ticks } from './ticks';
import { createLinearScale, scaleLinear } from './scaleLinear';

describe('ticks', () => {
  it('returns nice 1/2/5 steps', () => {
    expect(ticks(0, 100, 5)).toEqual([0, 20, 40, 60, 80, 100]);
    expect(ticks(0, 1, 5).every((t) => Number.isFinite(t))).toBe(true);
  });

  it('handles reversed and equal domains', () => {
    expect(ticks(100, 0, 5)).toEqual([100, 80, 60, 40, 20, 0]);
    expect(ticks(5, 5, 5)).toEqual([5]);
    expect(ticks(0, 1, 0)).toEqual([]);
  });

  it('computes tickStep', () => {
    expect(tickStep(0, 100, 5)).toBe(20);
    expect(tickStep(100, 0, 5)).toBe(-20);
  });
});

describe('niceDomain', () => {
  it('expands to nice boundaries', () => {
    // Same as d3: already-nice endpoints stay put.
    expect(niceDomain([0.1, 0.9], 10)).toEqual([0.1, 0.9]);
    const [a, b] = niceDomain([3, 97], 10);
    expect(a).toBeLessThanOrEqual(3);
    expect(b).toBeGreaterThanOrEqual(97);
    expect(niceDomain([0.12, 0.87], 5)).toEqual([0, 1]);
  });

  it('handles reversed domains and non-finite input', () => {
    const [hi, lo] = niceDomain([10, 0], 5);
    expect(hi).toBeGreaterThanOrEqual(lo);
    expect(niceDomain([NaN, 1], 5)[0]).toBeNaN();
    expect(niceDomain([5, 5], 5)).toEqual([5, 5]);
  });
});

describe('scaleLinear', () => {
  it('maps domain to range and inverts', () => {
    const scale = scaleLinear({ domain: [0, 100], range: [0, 200] });
    expect(scale(50)).toBe(100);
    expect(scale.invert(100)).toBe(50);
    expect(scale.domain()).toEqual([0, 100]);
    expect(scale.range()).toEqual([0, 200]);
    expect(scale(Number.NaN)).toBe(0);
    expect(scale.ticks(5)).toEqual([0, 20, 40, 60, 80, 100]);

    const flatRange = scaleLinear({ domain: [0, 10], range: [5, 5] });
    expect(flatRange.invert(5)).toBe(0);
  });

  it('nices domain in place', () => {
    const scale = scaleLinear({ domain: [0.12, 0.87], range: [0, 1] });
    scale.nice(5);
    expect(scale.domain()).toEqual([0, 1]);
  });

  it('clamps and handles degenerate domain', () => {
    const scale = scaleLinear({ domain: [10, 20], range: [0, 100] });
    expect(scale.clamp(5)).toBe(10);
    expect(scale.clamp(25)).toBe(20);
    expect(scale.clamp(15)).toBe(15);

    const flat = scaleLinear({ domain: [5, 5], range: [0, 10] });
    expect(flat(99)).toBe(0);
    expect(flat.invert(7)).toBe(5);
  });

  it('createLinearScale alias works', () => {
    expect(createLinearScale({ domain: [0, 1], range: [0, 10] })(0.5)).toBe(5);
  });
});
