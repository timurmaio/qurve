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
      changedTouches: [{ clientX: 40 }],
    } as unknown as TouchEvent;

    expect(getTouchX(withTouches)).toBe(25);
    expect(getTouchX(withChanged)).toBe(40);
  });

  it('returns null when no touches exist', () => {
    const event = { touches: [], changedTouches: [] } as unknown as TouchEvent;
    expect(getTouchX(event)).toBeNull();
  });

  it('computes euclidean distance', () => {
    const distance = getTouchDistance({ clientX: 0, clientY: 0 }, { clientX: 3, clientY: 4 });
    expect(distance).toBe(5);
  });
});
