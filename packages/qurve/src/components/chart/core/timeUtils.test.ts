import { describe, expect, it } from 'vitest';
import { createTimeTicks, normalizeTimeDomain, toTimeNumber } from './timeUtils';

describe('timeUtils', () => {
  it('converts dates and strings to timestamps', () => {
    const date = new Date('2024-01-01T00:00:00.000Z');
    expect(toTimeNumber(date)).toBe(date.getTime());
    expect(toTimeNumber('2024-01-01T00:00:00.000Z')).toBe(date.getTime());
    expect(toTimeNumber('invalid')).toBeNull();
  });

  it('normalizes domain order', () => {
    const domain = normalizeTimeDomain([
      new Date('2024-01-02T00:00:00.000Z'),
      new Date('2024-01-01T00:00:00.000Z'),
    ]);

    expect(domain?.[0]).toBeLessThan(domain?.[1] ?? 0);
  });

  it('creates ticks that include domain boundaries', () => {
    const min = Date.parse('2024-01-01T00:00:00.000Z');
    const max = Date.parse('2024-01-10T00:00:00.000Z');
    const ticks = createTimeTicks([min, max], 5);

    expect(ticks[0]).toBe(min);
    expect(ticks[ticks.length - 1]).toBe(max);
    expect(ticks.length).toBeGreaterThanOrEqual(2);
  });
});
