import { describe, expect, it } from 'vitest';
import {
  formatTooltipLabel,
  nodeToText,
  payloadToA11yText,
  sortPayload,
  toReverseConfig,
} from './tooltipUtils';

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

  it('returns string(label) when time value is invalid', () => {
    expect(formatTooltipLabel('invalid-date', { type: 'time' })).toBe('invalid-date');
  });

  it('converts nodes to text (framework-agnostic)', () => {
    expect(nodeToText('hello')).toBe('hello');
    expect(nodeToText(10)).toBe('10');
    expect(nodeToText(['a', 'b'])).toBe('a b');
    expect(nodeToText(null)).toBe('');
    expect(nodeToText(undefined)).toBe('');
    expect(nodeToText(true)).toBe('');
    expect(nodeToText({ props: {} })).toBe('');
    expect(nodeToText({ props: { children: 'nested' } })).toBe('nested');
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

  it('creates accessibility text without formatter', () => {
    const payload = [
      { dataKey: 'a', name: 'A', value: 10.567, color: '#111' },
      { dataKey: 'b', name: 'B', value: undefined as unknown as number | null, color: '#222' },
    ];
    const text = payloadToA11yText(payload);
    expect(text).toContain('A: 10.57');
  });

  it('handles item formatter returning array', () => {
    const payload = [
      {
        dataKey: 'a',
        name: 'A',
        value: 10,
        formatter: () => ['val', 'name'] as [unknown, unknown],
      },
    ];
    const text = payloadToA11yText(payload);
    expect(text).toContain('val');
    expect(text).toContain('name');
  });

  it('uses value fallback when formatter returns empty object', () => {
    const payload = [
      {
        dataKey: 'a',
        name: 'A',
        value: 42.123,
        formatter: () => ({}),
      },
    ];
    const text = payloadToA11yText(payload);
    expect(text).toContain('42.12');
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

  it('returns payload unchanged when sorter is undefined', () => {
    const payload = [{ dataKey: 'a', name: 'A', value: 10 }];
    expect(sortPayload(payload, undefined)).toEqual(payload);
  });

  it('normalizes reverse config', () => {
    expect(toReverseConfig(true)).toEqual({ x: true, y: true });
    expect(toReverseConfig(false)).toEqual({ x: false, y: false });
    expect(toReverseConfig({ x: true })).toEqual({ x: true, y: false });
    expect(toReverseConfig({ y: true })).toEqual({ x: false, y: true });
    expect(toReverseConfig({ x: true, y: true })).toEqual({ x: true, y: true });
    expect(toReverseConfig(undefined)).toEqual({ x: false, y: false });
  });
});
