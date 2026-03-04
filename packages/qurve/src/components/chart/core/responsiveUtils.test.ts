import { describe, expect, it } from 'vitest';
import { resolveNumericSize, toCssValue } from '@qurve/core';

describe('responsiveUtils', () => {
  it('converts size values to css values', () => {
    expect(toCssValue(undefined, '100%')).toBe('100%');
    expect(toCssValue(320, '100%')).toBe('320px');
    expect(toCssValue('50%', '100%')).toBe('50%');
  });

  it('resolves numeric size from fixed or measured value', () => {
    expect(resolveNumericSize(320, 200)).toBe(320);
    expect(resolveNumericSize('100%', 200)).toBe(200);
    expect(resolveNumericSize(undefined, 180)).toBe(180);
  });
});
