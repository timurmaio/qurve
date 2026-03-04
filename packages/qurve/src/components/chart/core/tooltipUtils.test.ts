import { describe, expect, it } from 'vitest';
import {
  formatTooltipLabel,
  nodeToText,
  payloadToA11yText,
  sortPayload,
  toReverseConfig,
} from '@qurve/core';

describe('tooltipUtils', () => {
  it('formats default label for non-time axis as-is', () => {
    expect(formatTooltipLabel('abc', { type: 'category' })).toBe('abc');
    expect(formatTooltipLabel(42, null)).toBe('42');
  });

  it('formats default label for time axis', () => {
    const value = Date.parse('2024-01-01T00:00:00.000Z');
    const label = formatTooltipLabel(value, { type: 'time', locale: 'en-US', timeZone: 'UTC', timeFormat: 'date' });
    expect(typeof label).toBe('string');
    expect(String(label).length).toBeGreaterThan(0);
  });

  it('converts react nodes to text', () => {
    expect(nodeToText('hello')).toBe('hello');
    expect(nodeToText(10)).toBe('10');
    expect(nodeToText(['a', 'b'])).toBe('a b');
    expect(nodeToText({} as unknown as React.ReactNode)).toBe('');
  });

  it('creates accessibility text from payload', () => {
    const payload = [
      { dataKey: 'a', name: 'A', value: 10, color: '#111' },
      { dataKey: 'b', name: 'B', value: null, color: '#222' },
    ];

    const text = payloadToA11yText(payload, (value, name) => [`v:${String(value)}`, `n:${name}`]);
    expect(text).toContain('n:A: v:10');
    expect(text).toContain('n:B: v:null');
  });

  it('sorts payload by value and name', () => {
    const payload = [
      { dataKey: 'b', name: 'B', value: 5, color: '#222' },
      { dataKey: 'a', name: 'A', value: 10, color: '#111' },
    ];

    expect(sortPayload(payload, 'value').map((p) => p.name)).toEqual(['A', 'B']);
    expect(sortPayload(payload, 'name').map((p) => p.name)).toEqual(['A', 'B']);
    expect(sortPayload(payload, (a, b) => a.name.localeCompare(b.name)).map((p) => p.name)).toEqual(['A', 'B']);
  });

  it('normalizes reverse config', () => {
    expect(toReverseConfig(true)).toEqual({ x: true, y: true });
    expect(toReverseConfig(false)).toEqual({ x: false, y: false });
    expect(toReverseConfig({ x: true })).toEqual({ x: true, y: false });
  });
});
