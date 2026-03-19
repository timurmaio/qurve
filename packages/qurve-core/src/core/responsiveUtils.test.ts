import { describe, expect, it } from 'vitest';
import { resolveNumericSize, toCssValue } from './responsiveUtils';

describe('responsiveUtils', () => {
  it('converts size values to css values', () => {
    expect(toCssValue(undefined, '100%')).toBe('100%');
    expect(toCssValue(320, '100%')).toBe('320px');
    expect(toCssValue('50%', '100%')).toBe('50%');
  });

  it('resolves numeric size from value or measured', () => {
    expect(resolveNumericSize(300, 500)).toBe(300);
    expect(resolveNumericSize(undefined, 500)).toBe(500);
    expect(resolveNumericSize('50%', 500)).toBe(500);
  });
});
