import { describe, expect, it } from 'vitest';
import { justifyByAlign } from '@qurve/core';

describe('legendUtils', () => {
  it('maps align to justifyContent', () => {
    expect(justifyByAlign('left')).toBe('flex-start');
    expect(justifyByAlign('center')).toBe('center');
    expect(justifyByAlign('right')).toBe('flex-end');
    expect(justifyByAlign(undefined)).toBe('center');
  });
});
