import { describe, expect, it } from 'vitest';
import {
  getBaseValue,
  clamp,
  normalizeOpacity,
  normalizeHoverOpacity,
  stackKey,
  isStacked,
  resolveRadius,
  hasSameSign,
  resolveStackedRadius,
} from './chartMath';

describe('getBaseValue', () => {
  it('returns 0 when domain crosses zero', () => {
    expect(getBaseValue([-10, 10])).toBe(0);
    expect(getBaseValue([-5, 5])).toBe(0);
    expect(getBaseValue([-100, 50])).toBe(0);
  });

  it('returns min when all values are positive', () => {
    expect(getBaseValue([10, 20])).toBe(10);
    expect(getBaseValue([0, 100])).toBe(0);
  });

  it('returns max when all values are negative', () => {
    expect(getBaseValue([-20, -10])).toBe(-10);
    expect(getBaseValue([-100, -50])).toBe(-50);
  });

  it('handles swapped domain order', () => {
    expect(getBaseValue([20, 10])).toBe(10);
    expect(getBaseValue([-10, -20])).toBe(-10);
  });
});

describe('clamp', () => {
  it('returns value when within range', () => {
    expect(clamp(5, 0, 10)).toBe(5);
    expect(clamp(0, 0, 10)).toBe(0);
    expect(clamp(10, 0, 10)).toBe(10);
  });

  it('returns min when value is below range', () => {
    expect(clamp(-5, 0, 10)).toBe(0);
  });

  it('returns max when value is above range', () => {
    expect(clamp(15, 0, 10)).toBe(10);
  });

  it('handles negative ranges', () => {
    expect(clamp(0, -10, -5)).toBe(-5);
    expect(clamp(-15, -20, -10)).toBe(-15);
    expect(clamp(-25, -20, -10)).toBe(-20);
  });
});

describe('normalizeOpacity', () => {
  it('returns fallback for undefined', () => {
    expect(normalizeOpacity(undefined, 0.5)).toBe(0.5);
  });

  it('returns fallback for non-finite values', () => {
    expect(normalizeOpacity(NaN, 0.5)).toBe(0.5);
    expect(normalizeOpacity(Infinity, 0.5)).toBe(0.5);
  });

  it('clamps value to [0, 1] range', () => {
    expect(normalizeOpacity(0.5, 0.5)).toBe(0.5);
    expect(normalizeOpacity(0, 0.5)).toBe(0);
    expect(normalizeOpacity(1, 0.5)).toBe(1);
    expect(normalizeOpacity(-0.5, 0.5)).toBe(0);
    expect(normalizeOpacity(1.5, 0.5)).toBe(1);
  });

  it('returns valid finite values unchanged', () => {
    expect(normalizeOpacity(0.25, 0.5)).toBe(0.25);
  });
});

describe('normalizeHoverOpacity', () => {
  it('has default fallback of 0.5', () => {
    expect(normalizeHoverOpacity(NaN)).toBe(0.5);
  });

  it('accepts custom fallback', () => {
    expect(normalizeHoverOpacity(NaN, 0.3)).toBe(0.3);
  });

  it('clamps to [0, 1]', () => {
    expect(normalizeHoverOpacity(0.3)).toBe(0.3);
    expect(normalizeHoverOpacity(-1)).toBe(0);
    expect(normalizeHoverOpacity(2)).toBe(1);
  });
});

describe('stackKey', () => {
  it('prefixes stackId with "stack:"', () => {
    expect(stackKey('myStack')).toBe('stack:myStack');
    expect(stackKey(123)).toBe('stack:123');
  });
});

describe('isStacked', () => {
  it('returns true for defined stackId', () => {
    expect(isStacked('stack1')).toBe(true);
    expect(isStacked(123)).toBe(true);
  });

  it('returns false for undefined', () => {
    expect(isStacked(undefined)).toBe(false);
  });
});

describe('resolveRadius', () => {
  it('returns undefined for undefined radius', () => {
    expect(resolveRadius(undefined, true)).toBeUndefined();
  });

  it('converts number radius to array', () => {
    expect(resolveRadius(4, true)).toEqual([4, 4, 0, 0]);
    expect(resolveRadius(4, false)).toEqual([0, 0, 4, 4]);
  });

  it('passes through array radius unchanged', () => {
    expect(resolveRadius([1, 2, 3, 4], true)).toEqual([1, 2, 3, 4]);
  });
});

describe('hasSameSign', () => {
  it('returns true for positive numbers with positive target', () => {
    expect(hasSameSign(5, 'positive')).toBe(true);
  });

  it('returns false for negative numbers with positive target', () => {
    expect(hasSameSign(-5, 'positive')).toBe(false);
  });

  it('returns true for negative numbers with negative target', () => {
    expect(hasSameSign(-5, 'negative')).toBe(true);
  });

  it('returns false for positive numbers with negative target', () => {
    expect(hasSameSign(5, 'negative')).toBe(false);
  });

  it('zero is neither positive nor negative', () => {
    expect(hasSameSign(0, 'positive')).toBe(false);
    expect(hasSameSign(0, 'negative')).toBe(false);
  });
});

describe('resolveStackedRadius', () => {
  it('returns undefined for inner segments', () => {
    expect(resolveStackedRadius(4, 10, false)).toBeUndefined();
  });

  it('resolves radius for outer positive segments', () => {
    expect(resolveStackedRadius(4, 10, true)).toEqual([4, 4, 0, 0]);
  });

  it('resolves radius for outer negative segments', () => {
    expect(resolveStackedRadius(4, -10, true)).toEqual([0, 0, 4, 4]);
  });

  it('passes through array radius for outer segments', () => {
    expect(resolveStackedRadius([1, 2, 3, 4], 10, true)).toEqual([1, 2, 3, 4]);
  });
});
