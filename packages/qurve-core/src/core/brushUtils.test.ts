import { describe, expect, it } from 'vitest';
import { getTouchDistance, getTouchX } from './brushUtils';

describe('brushUtils', () => {
  it('returns touch x from touches/changedTouches', () => {
    const withTouches = {
      touches: [{ clientX: 25 }],
      changedTouches: [],
    } as unknown as TouchEvent;
    const withChanged = {
      touches: [],
      changedTouches: [{ clientX: 42 }],
    } as unknown as TouchEvent;

    expect(getTouchX(withTouches)).toBe(25);
    expect(getTouchX(withChanged)).toBe(42);
  });

  it('returns null when no touches', () => {
    const noTouches = { touches: [], changedTouches: [] } as unknown as TouchEvent;
    expect(getTouchX(noTouches)).toBeNull();
  });

  it('calculates distance between two touch points', () => {
    const a = { clientX: 0, clientY: 0 };
    const b = { clientX: 3, clientY: 4 };
    expect(getTouchDistance(a, b)).toBe(5);
  });
});
