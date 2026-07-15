/**
 * Live parity vs `d3-array` ticks / `d3-scale` nice.
 */
import { describe, expect, it } from 'vitest';
import { ticks as d3Ticks, tickStep as d3TickStep } from 'd3-array';
import { scaleLinear as d3ScaleLinear } from 'd3-scale';
import { niceDomain, tickStep, ticks } from './ticks';
import { scaleLinear } from './scaleLinear';

describe('ticks — live d3-array parity', () => {
  it.each([
    [0, 100, 5],
    [0, 1, 10],
    [-10, 10, 5],
    [100, 0, 5],
    [0.1, 0.9, 10],
    [3, 97, 8],
    [-5, 12.5, 6],
    [1e6, 2e6, 4],
    [0.01, 0.09, 5],
  ] as const)('ticks(%j, %j, %j)', (start, stop, count) => {
    const ours = ticks(start, stop, count);
    const theirs = d3Ticks(start, stop, count);
    expect(ours).toHaveLength(theirs.length);
    for (let i = 0; i < ours.length; i++) {
      expect(ours[i]).toBeCloseTo(theirs[i], 12);
    }
  });

  it('tickStep matches d3-array for common ranges', () => {
    for (const [a, b, c] of [
      [0, 100, 5],
      [100, 0, 5],
      [0, 1, 10],
      [-50, 50, 8],
    ] as const) {
      expect(tickStep(a, b, c)).toBeCloseTo(d3TickStep(a, b, c), 12);
    }
  });
});

describe('niceDomain / scaleLinear — live d3-scale parity', () => {
  it('niceDomain matches d3-scale .nice(count) endpoints', () => {
    for (const [domain, count] of [
      [[0.12, 0.87], 5],
      [[3, 97], 10],
      [[-12.3, 4.7], 5],
      [[0.1, 0.9], 10],
    ] as const) {
      const ours = niceDomain([...domain], count);
      const d3 = d3ScaleLinear().domain([...domain]).nice(count).domain() as [
        number,
        number,
      ];
      expect(ours[0]).toBeCloseTo(d3[0], 10);
      expect(ours[1]).toBeCloseTo(d3[1], 10);
    }
  });

  it('scaleLinear.ticks matches d3 scale ticks after nice', () => {
    const ours = scaleLinear({ domain: [0.12, 0.87], range: [0, 100] });
    ours.nice(5);
    const d3 = d3ScaleLinear().domain([0.12, 0.87]).range([0, 100]).nice(5);
    const a = ours.ticks(5);
    const b = d3.ticks(5);
    expect(a).toHaveLength(b.length);
    for (let i = 0; i < a.length; i++) {
      expect(a[i]).toBeCloseTo(b[i], 10);
    }
  });
});
